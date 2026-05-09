import { Injectable } from "@nestjs/common";
import { RegisterDto } from "@app/shared/dtos/register.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { Repository } from "typeorm";
import { JwtService } from "@nestjs/jwt";
import { RpcException } from "@nestjs/microservices";
import { LoginDto } from "@app/shared/dtos/login.dto";
import * as bcrypt from "bcrypt";

@Injectable()
export class AuthServiceService {
    constructor(
        @InjectRepository(User) private userRepository: Repository<User>,
        private jwtService: JwtService,
    ) {}

    async register(user: RegisterDto) {
        const candidate = await this.findOneByEmail(user.email);

        if (candidate) throw new RpcException("User already exists");

        const { password, confirmPassword, ...rest } = user;

        if (password !== confirmPassword)
            throw new RpcException("Passwords do not match");

        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = this.userRepository.create({
            ...rest,
            password: hashedPassword,
        });

        const savedUser = await this.userRepository.save(newUser);
        const {password: _pw, ...result} = savedUser
        return result;
    }

    async login(user: LoginDto): Promise<{ access_token: string }> {
        const candidate = await this.findOneByEmail(user.email);

        if (!candidate) throw new RpcException("Wrong email!");

        const matchPassword = await bcrypt.compare(
            user.password,
            candidate.password,
        );

        if (!matchPassword) throw new RpcException("Wrong password!");

        const payload = {
            sub: candidate.id,
            email: candidate.email,
            role: candidate.role,
        }

        return {
            access_token: await this.jwtService.signAsync(payload),
        };
    }

    async findOneByEmail(email: string) {
        return await this.userRepository.findOneBy({ email });
    }
}
