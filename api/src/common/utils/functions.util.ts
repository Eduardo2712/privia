import { hashSync, compareSync } from "bcrypt";
import * as crypto from "node:crypto";

const ALGORITHM = "aes-256-ctr";

function getCryptoKeyBuffer(): Buffer {
    const secret = process.env.CRYPTO_KEY;

    if (!secret) {
        throw new Error("CRYPTO_KEY está faltando no ambiente");
    }

    const isHex = /^[0-9a-fA-F]+$/.test(secret) && secret.length % 2 === 0;

    if (isHex) {
        const keyHex = Buffer.from(secret, "hex");

        if (keyHex.length === 32) return keyHex;
    }

    return crypto.createHash("sha256").update(secret).digest();
}

export default function formatBrl(value: number): string {
    const numberValue = typeof value === "string" ? Number(value) : value;

    return numberValue.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

export function formatDecimal(value: number): string {
    const numberValue = typeof value === "string" ? Number(value) : value;

    return numberValue.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

export function hashSyncValue(value: string, rounds: number = 10): string {
    return hashSync(value, rounds);
}

export function compareSyncValue(value: string, hash: string): boolean {
    return compareSync(value, hash);
}

export function generateValidationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export function encryptValue(value: string): string {
    const iv = crypto.randomBytes(16);
    const key = getCryptoKeyBuffer();
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(value, "utf8", "hex");
    encrypted += cipher.final("hex");

    return `${iv.toString("hex")}:${encrypted}`;
}

export function decryptValue(value: string): string {
    const [ivHex, encrypted] = value.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const key = getCryptoKeyBuffer();
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
}

