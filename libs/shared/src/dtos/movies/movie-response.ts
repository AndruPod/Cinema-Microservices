export interface MovieResponse {
    id: number;
    title: string;
    description: string | null;
    releaseYear: number;
    durationMinutes: number;
    ticketPrice: number;
    createdAt: Date;
    updatedAt: Date;
}
