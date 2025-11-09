import { hashSync, compareSync } from "bcrypt";
import * as crypto from "node:crypto";

const ALGORITHM = "aes-256-ctr";

export const getCryptoKeyBuffer = (): Buffer => {
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
};

export const formatBrl = (value: number): string => {
    const numberValue = typeof value === "string" ? Number(value) : value;

    return numberValue.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
};

export const formatDecimal = (value: number): string => {
    const numberValue = typeof value === "string" ? Number(value) : value;

    return numberValue.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
};

export const hashSyncValue = (value: string, rounds: number = 10): string => {
    return hashSync(value, rounds);
};

export const compareSyncValue = (value: string, hash: string): boolean => {
    return compareSync(value, hash);
};

export const generateValidationCode = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

export const encryptValue = (value: string): string => {
    const iv = crypto.randomBytes(16);
    const key = getCryptoKeyBuffer();
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(value, "utf8", "hex");

    encrypted += cipher.final("hex");

    return `${iv.toString("hex")}:${encrypted}`;
};

export const decryptValue = (value: string): string => {
    const [ivHex, encrypted] = value.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const key = getCryptoKeyBuffer();
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

    let decrypted = decipher.update(encrypted, "hex", "utf8");

    decrypted += decipher.final("utf8");

    return decrypted;
};

export const cleanSentences = (text: string): string[] => {
    let aux = text.replace(/^\uFEFF/, "").trim();

    aux = aux.replaceAll(/\r\n/g, "\n");
    aux = aux.replaceAll(/\n?\s*-{3,}\s*\n?/g, "\n\n\n\n");
    aux = aux.replaceAll(/\n{3,}/g, "\n\n");

    return aux.match(/[^.!?]+[.!?]+[\])'"`'"]*|.+/g) || [text];
};

export const calcHash = (text: string): string => {
    return crypto.createHash("sha256").update(text.trim().toLowerCase()).digest("hex");
};
