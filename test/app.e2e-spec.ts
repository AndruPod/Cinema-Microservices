import { INestApplication, INestMicroservice } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import request from "supertest";
import { App } from "supertest/types";
import { ApiGatewayModule } from "../apps/api-gateway/src/api-gateway.module";
import { configureGateway } from "../apps/api-gateway/src/setup";
import { AuthServiceModule } from "../apps/auth-service/src/auth-service.module";
import { CatalogServiceModule } from "../apps/catalog-service/src/catalog-service.module";
import { OrderServiceModule } from "../apps/order-service/src/order-service.module";
import { Services } from "@app/shared/constants/services";
import { bootstrapMicroservice } from "@app/shared/rpc/bootstrap-microservice";
import { E2E_ENV } from "./e2e-env";

/**
 * Full-stack flow: HTTP -> API gateway -> TCP -> microservices -> PostgreSQL.
 * Nothing is mocked; every service uses its real module and migrations.
 */
describe("Cinema API (e2e)", () => {
    let gateway: INestApplication<App>;
    let microservices: INestMicroservice[] = [];

    const alice = { email: "alice@e2e.test", password: "AlicePass123!" };
    const bob = { email: "bob@e2e.test", password: "BobPass123!" };
    let aliceToken: string;
    let bobToken: string;
    let adminToken: string;
    let movieId: number;
    let aliceOrderId: number;

    const api = () => request(gateway.getHttpServer());
    const login = async (email: string, password: string) => {
        const res = await api()
            .post("/auth/login")
            .send({ email, password })
            .expect(200);
        return (res.body as { accessToken: string }).accessToken;
    };
    const bearer = (token: string) => ({ Authorization: `Bearer ${token}` });

    beforeAll(async () => {
        microservices = [
            await bootstrapMicroservice(AuthServiceModule, Services.AUTH),
            await bootstrapMicroservice(CatalogServiceModule, Services.CATALOG),
            await bootstrapMicroservice(OrderServiceModule, Services.ORDER),
        ];

        gateway = await NestFactory.create(ApiGatewayModule);
        configureGateway(gateway);
        await gateway.init();
    });

    afterAll(async () => {
        await gateway?.close();
        await Promise.all(microservices.map((service) => service.close()));
    });

    it("GET /health reports every service as up", async () => {
        const res = await api().get("/health").expect(200);

        expect(res.body).toEqual({
            status: "ok",
            services: { auth: "up", catalog: "up", order: "up" },
        });
    });

    describe("authentication", () => {
        it("registers a user without exposing the password hash", async () => {
            const res = await api()
                .post("/auth/register")
                .send({ ...alice, confirmPassword: alice.password })
                .expect(201);

            expect(res.body).toEqual({
                id: expect.any(Number),
                email: alice.email,
                role: "USER",
                createdAt: expect.any(String),
            });
            expect(JSON.stringify(res.body)).not.toMatch(/password/i);

            await api()
                .post("/auth/register")
                .send({ ...bob, confirmPassword: bob.password })
                .expect(201);
        });

        it("rejects a duplicate registration with 409", async () => {
            await api()
                .post("/auth/register")
                .send({
                    email: alice.email.toUpperCase(),
                    password: "Another123!",
                    confirmPassword: "Another123!",
                })
                .expect(409);
        });

        it("rejects invalid registration input with 400", async () => {
            const res = await api()
                .post("/auth/register")
                .send({
                    email: "not-an-email",
                    password: "short",
                    confirmPassword: "short",
                    role: "ADMIN",
                })
                .expect(400);

            expect(res.body.message).toEqual(
                expect.arrayContaining([
                    "property role should not exist",
                    "email must be an email",
                ]),
            );
        });

        it("logs in and returns a bearer token", async () => {
            aliceToken = await login(alice.email, alice.password);
            bobToken = await login(bob.email, bob.password);
            adminToken = await login(
                E2E_ENV.ADMIN_EMAIL,
                E2E_ENV.ADMIN_PASSWORD,
            );

            expect(aliceToken.split(".")).toHaveLength(3);
        });

        it("rejects invalid credentials with 401", async () => {
            const res = await api()
                .post("/auth/login")
                .send({ email: alice.email, password: "WrongPass123!" })
                .expect(401);

            expect(res.body).toMatchObject({
                statusCode: 401,
                message: "Invalid email or password",
            });

            await api()
                .post("/auth/login")
                .send({ email: "ghost@e2e.test", password: "WrongPass123!" })
                .expect(401);
        });

        it("GET /auth/me returns the profile of the token owner", async () => {
            const res = await api()
                .get("/auth/me")
                .set(bearer(aliceToken))
                .expect(200);

            expect(res.body).toMatchObject({
                email: alice.email,
                role: "USER",
            });
        });
    });

    describe("movies", () => {
        const movie = {
            title: "Arrival",
            description: "A linguist is recruited to talk to aliens.",
            releaseYear: 2016,
            durationMinutes: 116,
            ticketPrice: 12.99,
        };

        it("lets an admin create a movie", async () => {
            const res = await api()
                .post("/movies")
                .set(bearer(adminToken))
                .send(movie)
                .expect(201);

            expect(res.body).toMatchObject({
                id: expect.any(Number),
                ...movie,
            });
            movieId = res.body.id;
        });

        it("forbids regular users from creating movies", async () => {
            await api()
                .post("/movies")
                .set(bearer(aliceToken))
                .send({ ...movie, title: "Not allowed" })
                .expect(403);
        });

        it("requires a token to create movies", async () => {
            await api().post("/movies").send(movie).expect(401);
        });

        it("rejects a duplicate title/year with 409", async () => {
            await api()
                .post("/movies")
                .set(bearer(adminToken))
                .send(movie)
                .expect(409);
        });

        it("lists and fetches movies publicly", async () => {
            const list = await api().get("/movies").expect(200);
            expect(list.body).toEqual([
                expect.objectContaining({ id: movieId, title: "Arrival" }),
            ]);

            await api().get(`/movies/${movieId}`).expect(200);
        });

        it("returns 404 for an unknown movie", async () => {
            await api().get("/movies/999999").expect(404);
        });
    });

    describe("orders", () => {
        it("requires authentication", async () => {
            await api().get("/orders").expect(401);
            await api()
                .post("/orders")
                .set(bearer("not-a-jwt"))
                .send({ movieId, quantity: 1 })
                .expect(401);
        });

        it("creates an order with a movie snapshot and server-side total", async () => {
            const res = await api()
                .post("/orders")
                .set(bearer(aliceToken))
                .send({ movieId, quantity: 3 })
                .expect(201);

            expect(res.body).toMatchObject({
                id: expect.any(Number),
                movieId,
                movieTitle: "Arrival",
                movieReleaseYear: 2016,
                ticketPrice: 12.99,
                quantity: 3,
                totalPrice: 38.97,
                status: "CONFIRMED",
            });
            aliceOrderId = res.body.id;
        });

        it("rejects client-supplied owner or price fields", async () => {
            await api()
                .post("/orders")
                .set(bearer(aliceToken))
                .send({ movieId, quantity: 1, userId: 1, totalPrice: 0 })
                .expect(400);
        });

        it("returns 404 when ordering a missing movie", async () => {
            const res = await api()
                .post("/orders")
                .set(bearer(aliceToken))
                .send({ movieId: 999999, quantity: 1 })
                .expect(404);

            expect(res.body.message).toBe("Movie 999999 not found");
        });

        it("lists only the authenticated user's orders", async () => {
            const aliceOrders = await api()
                .get("/orders")
                .set(bearer(aliceToken))
                .expect(200);
            expect(aliceOrders.body).toHaveLength(1);
            expect(aliceOrders.body[0].id).toBe(aliceOrderId);

            const bobOrders = await api()
                .get("/orders")
                .set(bearer(bobToken))
                .expect(200);
            expect(bobOrders.body).toEqual([]);
        });

        it("returns a single order to its owner", async () => {
            await api()
                .get(`/orders/${aliceOrderId}`)
                .set(bearer(aliceToken))
                .expect(200);
        });

        it("hides another user's order behind 404", async () => {
            await api()
                .get(`/orders/${aliceOrderId}`)
                .set(bearer(bobToken))
                .expect(404);
            await api()
                .patch(`/orders/${aliceOrderId}/cancel`)
                .set(bearer(bobToken))
                .expect(404);
        });

        it("keeps the snapshot when the movie changes later", async () => {
            await api()
                .patch(`/movies/${movieId}`)
                .set(bearer(adminToken))
                .send({ title: "Arrival (Remastered)", ticketPrice: 20 })
                .expect(200);

            const res = await api()
                .get(`/orders/${aliceOrderId}`)
                .set(bearer(aliceToken))
                .expect(200);
            expect(res.body).toMatchObject({
                movieTitle: "Arrival",
                ticketPrice: 12.99,
                totalPrice: 38.97,
            });
        });

        it("lets the owner cancel an order once", async () => {
            const res = await api()
                .patch(`/orders/${aliceOrderId}/cancel`)
                .set(bearer(aliceToken))
                .expect(200);
            expect(res.body.status).toBe("CANCELLED");

            await api()
                .patch(`/orders/${aliceOrderId}/cancel`)
                .set(bearer(aliceToken))
                .expect(409);
        });
    });

    it("lets an admin delete a movie", async () => {
        await api()
            .delete(`/movies/${movieId}`)
            .set(bearer(adminToken))
            .expect(204);
        await api().get(`/movies/${movieId}`).expect(404);
    });
});
