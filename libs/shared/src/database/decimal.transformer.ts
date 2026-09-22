import { ValueTransformer } from "typeorm";

/** PostgreSQL returns NUMERIC columns as strings; expose them as numbers. */
export const decimalTransformer: ValueTransformer = {
    to: (value?: number | null) => value,
    from: (value?: string | null) =>
        value === null || value === undefined ? value : Number(value),
};

/** Monetary arithmetic is done in integer cents to avoid float drift. */
export const toCents = (amount: number): number => Math.round(amount * 100);
export const fromCents = (cents: number): number => cents / 100;
