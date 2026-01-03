import { HttpStatus, Inject, Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import { AIGenerateFormInterface, AIGenerateSummaryAndSuggestions } from "./interfaces/ai.interface";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import type { Cache } from "cache-manager";
import { createHash } from "node:crypto";
import { firstValueFrom } from "rxjs";
import { AiBaseService } from "./ai-base.service";

@Injectable()
export class AiOllamaService {
    constructor(
        private readonly http: HttpService,
        private readonly configService: ConfigService,
        private readonly aiBaseService: AiBaseService,
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
    ) {}

    protected readonly fiveMinutesMs = 5 * 60 * 1000;
    protected readonly embeddingCacheTtl = 3600;

    protected getUrlBase(): string {
        return this.configService.get<string>("AI_URL") as string;
    }

    public async sendPromptStream(prompt: string): Promise<AsyncIterable<string>> {
        const url = `${this.getUrlBase()}/generate`;

        const model = this.configService.get<string>("AI_MODEL") as string;

        const payload: AIGenerateFormInterface = {
            model,
            prompt,
            stream: true,
            keep_alive: this.fiveMinutesMs,
            options: {
                temperature: 0.15,
                top_p: 0.85,
                top_k: 30,
                repeat_penalty: 1.1,
                num_predict: 256
            }
        };

        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!response.body) {
            throw new Error("Stream não disponível da IA");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");

        const asyncIterator: AsyncIterable<string> = {
            [Symbol.asyncIterator]() {
                let buffer = "";

                return {
                    async next() {
                        while (true) {
                            const { value, done } = await reader.read();

                            if (done) {
                                return { value: undefined, done: true };
                            }

                            buffer += decoder.decode(value, { stream: true });

                            const lines = buffer.split(/\r?\n/);

                            buffer = lines.pop() || "";

                            for (const line of lines) {
                                const trimmed = line.trim();

                                if (!trimmed) {
                                    continue;
                                }

                                const parsed = JSON.parse(trimmed);

                                if (parsed?.response) {
                                    return { value: parsed.response as string, done: false };
                                }

                                if (parsed?.choices?.[0]?.delta?.content) {
                                    return { value: parsed.choices[0].delta.content as string, done: false };
                                }

                                if (parsed?.done) {
                                    return { value: undefined, done: true };
                                }
                            }
                        }
                    }
                };
            }
        };

        return asyncIterator;
    }

    public async sendPrompt<T>(props: AIGenerateFormInterface): Promise<T> {
        const url = `${this.getUrlBase()}/generate`;

        const model = this.configService.get<string>("AI_MODEL") as string;

        const payload: AIGenerateFormInterface = {
            ...props,
            model: props.model || model,
            prompt: props.prompt,
            stream: false,
            keep_alive: this.fiveMinutesMs
        };

        try {
            const response = await firstValueFrom(this.http.post(url, payload));

            if (response.status !== HttpStatus.OK) {
                throw new Error("Erro ao gerar resposta da IA: status inesperado");
            }

            const data = response.data;

            const answer = data?.response ?? data?.choices?.[0]?.text;

            if (!answer) {
                throw new Error("Resposta não encontrada");
            }

            return JSON.parse(answer) as T;
        } catch (error) {
            throw new Error(`Erro ao gerar resposta da IA: ${error.message}`);
        }
    }

    public async getEmbedding(text: string): Promise<number[]> {
        const cacheKey = `emb_${createHash("md5").update(text).digest("hex")}`;
        const cached = await this.cacheManager.get<number[]>(cacheKey);

        if (cached) {
            return cached;
        }

        const url = `${this.getUrlBase()}/embeddings`;
        const embeddingModel = this.configService.get<string>("AI_EMBEDDING_MODEL") as string;

        const payload: AIGenerateFormInterface = {
            model: embeddingModel,
            prompt: text,
            stream: false,
            keep_alive: this.fiveMinutesMs
        };

        try {
            const response = await firstValueFrom(this.http.post(url, payload));

            if (response.status !== HttpStatus.OK) {
                throw new Error("Erro ao gerar resposta da IA: status inesperado");
            }

            const data = response.data;

            let embedding: number[] | undefined;

            if (data && Array.isArray(data.embedding)) {
                embedding = data.embedding;
            }

            if (!embedding && data?.data && Array.isArray(data.data) && Array.isArray(data.data[0]?.embedding)) {
                embedding = data.data[0].embedding as number[];
            }

            if (!embedding && data?.embeddings && Array.isArray(data.embeddings) && Array.isArray(data.embeddings[0])) {
                embedding = data.embeddings[0] as number[];
            }

            if (!embedding || !Array.isArray(embedding)) {
                throw new Error("Formato de resposta inválido da IA para embeddings");
            }

            if (embedding.length === 0) {
                throw new Error("Embedding vazio retornado pela IA. Verifique se o modelo 'bge-m3' está instalado e funcional.");
            }

            await this.cacheManager.set(cacheKey, embedding, this.embeddingCacheTtl);

            return embedding;
        } catch (error) {
            const message = error?.response?.data?.error || error?.message || "Erro desconhecido";

            throw new Error(`Erro ao gerar resposta da IA: ${message}`);
        }
    }

    public async generateResponseStream(chunks: Array<{ score: number; text: string }>, search: string): Promise<AsyncIterable<string>> {
        const context = this.aiBaseService.topChunks(chunks);

        const prompt = this.aiBaseService.promptResponseStream(search, context);

        return this.sendPromptStream(prompt);
    }

    public async generateSummaryAndSuggestions(text: string): Promise<AIGenerateSummaryAndSuggestions> {
        const clean = text.replaceAll(/\s+/g, " ").trim();
        const sample = this.aiBaseService.extractSample(clean, 5000);

        const prompt = this.aiBaseService.promptSummaryAndSuggestions(sample);

        return this.sendPrompt<AIGenerateSummaryAndSuggestions>({
            prompt,
            options: {
                temperature: 0.1,
                top_p: 0.5,
                repeat_penalty: 1.1,
                max_tokens: 200
            },
            format: {
                type: "object",
                properties: {
                    summary: { type: "string" },
                    questions: { type: "array", items: { type: "string" } }
                },
                required: ["summary", "questions"]
            }
        });
    }
}

