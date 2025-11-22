import * as crypto from "node:crypto";
import * as argon2 from "argon2";

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

export const hashSyncValue = async (value: string): Promise<string> => {
    return await argon2.hash(value, {
        type: argon2.argon2id,
        memoryCost: 2 ** 16,
        timeCost: 3,
        parallelism: 1
    });
};

export const compareSyncValue = async (value: string, hash: string): Promise<boolean> => {
    return await argon2.verify(hash, value);
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

    aux = aux.replaceAll("\r\n", "\n");

    aux = aux.replaceAll(/[ \t]+/g, " ");

    aux = aux.replaceAll(/\n?\s*-{3,}\s*\n?/g, "\n\n");

    aux = aux.replaceAll(/\n{3,}/g, "\n\n");

    aux = aux
        .split("\n")
        .map((line) => line.trim())
        .join("\n");

    return aux.match(/[^.!?]+[.!?]+[\])"`']*|.+/g) || [text];
};

export const calcHash = (text: string): string => {
    return crypto.createHash("sha256").update(text.trim().toLowerCase()).digest("hex");
};

export const sanitize = (text: string): string => {
    return text
        .replace(/\s+/g, " ")
        .replace(/\n{2,}/g, "\n\n")
        .trim();
};

export const similarity = (semanticMergeThreshold: number, tokenizer: (text: string) => number[], cleaned: string[]) => {
    const clamp = (n: number, min = 0, max = 1) => Math.max(min, Math.min(max, n));
    const threshold = clamp(semanticMergeThreshold);

    const toVec = (s: string) => {
        const ids = tokenizer(s) as number[];
        const m = new Map<number, number>();

        for (const id of ids) {
            m.set(id, (m.get(id) ?? 0) + 1);
        }

        let norm = 0;

        for (const v of m.values()) {
            norm += v * v;
        }

        norm = Math.sqrt(norm) || 1;

        for (const [k, v] of m) {
            m.set(k, v / norm);
        }

        return m;
    };

    const cosine = (a: Map<number, number>, b: Map<number, number>) => {
        let sum = 0;

        if (a.size < b.size) {
            for (const [k, va] of a) {
                const vb = b.get(k);
                if (vb) sum += va * vb;
            }
        } else {
            for (const [k, vb] of b) {
                const va = a.get(k);
                if (va) sum += va * vb;
            }
        }

        return sum;
    };

    const mergeAdjacentBySimilarity = (chunks: string[]): string[] => {
        const vecCache = new Map<string, Map<number, number>>();

        const getVec = (s: string) => {
            const cached = vecCache.get(s);

            if (cached) {
                return cached;
            }

            const v = toVec(s);
            vecCache.set(s, v);

            return v;
        };

        let arr = chunks.slice();
        let changed = true;

        while (changed) {
            changed = false;

            const next: string[] = [];
            let i = 0;

            while (i < arr.length) {
                if (i < arr.length - 1) {
                    const a = arr[i];
                    const b = arr[i + 1];
                    const sim = cosine(getVec(a), getVec(b));

                    if (sim >= threshold) {
                        const mergedText = (a + "\n\n" + b).trim();
                        next.push(mergedText);
                        i += 2;
                        changed = true;
                        continue;
                    }
                }
                next.push(arr[i]);
                i += 1;
            }

            arr = next;
        }

        return arr;
    };

    const merged = mergeAdjacentBySimilarity(cleaned);

    cleaned.splice(0, cleaned.length, ...merged);
};

export const fileName = (originalName: string): string => {
    const timestamp = Date.now();

    const sanitizedFileName = originalName.replace(/[^a-zA-Z0-9.-]/g, "_");

    return `${timestamp}-${sanitizedFileName}`;
};

