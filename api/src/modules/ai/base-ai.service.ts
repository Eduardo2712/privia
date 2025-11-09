import { HttpService } from "@nestjs/axios";
import { HttpStatus, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AIGenerateFormInterface } from "./interfaces/ai.interface";
import { firstValueFrom } from "rxjs";
import { AxiosResponse } from "axios";

@Injectable()
export class BaseAiService {
    constructor(
        protected readonly http: HttpService,
        protected readonly configService: ConfigService
    ) {}

    protected getUrlBase(): string {
        return this.configService.get<string>("AI_URL") as string;
    }

    protected async generateEmbedding(form: Omit<AIGenerateFormInterface, "model">): Promise<number[]> {
        const url = `${this.getUrlBase()}/embeddings`;

        const text = form.prompt;
        const payload: AIGenerateFormInterface = {
            model: "bge-m3",
            prompt: text,
            stream: false
        };

        try {
            const response: AxiosResponse = await firstValueFrom(this.http.post(url, payload));

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

            return embedding;
        } catch (error) {
            const message = error?.response?.data?.error || error?.message || "Erro desconhecido";

            throw new Error(`Erro ao gerar resposta da IA: ${message}`);
        }
    }

    public async generateResponse(prompt: string): Promise<string> {
        const url = `${this.getUrlBase()}/generate`;

        const text = prompt;
        const payload: AIGenerateFormInterface = {
            model: "llama3.2:1b",
            prompt: text,
            stream: false
        };

        try {
            const response: AxiosResponse = await firstValueFrom(this.http.post(url, payload));

            if (response.status !== HttpStatus.OK) {
                throw new Error("Erro ao gerar resposta da IA: status inesperado");
            }

            const data = response.data;

            let aiResponse: string | undefined;

            if (data && typeof data.response === "string") {
                aiResponse = data.response;
            }

            if (!aiResponse && data?.choices && Array.isArray(data.choices) && typeof data.choices[0]?.text === "string") {
                aiResponse = data.choices[0].text as string;
            }

            if (!aiResponse || typeof aiResponse !== "string") {
                throw new Error("Formato de resposta inválido da IA para geração de texto");
            }

            return aiResponse;
        } catch (error) {
            const message = error?.response?.data?.error || error?.message || "Erro desconhecido";

            throw new Error(`Erro ao gerar resposta da IA: ${message}`);
        }
    }
}

