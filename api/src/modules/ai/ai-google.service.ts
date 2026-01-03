import { GoogleGenAI } from "@google/genai";
import { Injectable } from "@nestjs/common";
import { AiBaseService } from "./ai-base.service";
import { ConfigService } from "@nestjs/config";
import { AIGenerateSummaryAndSuggestions } from "./interfaces/ai.interface";

@Injectable()
export class AiGoogleService {
    constructor(
        private readonly configService: ConfigService,
        private readonly aiBaseService: AiBaseService
    ) {}

    public async generateResponseStream(chunks: Array<{ score: number; text: string }>, search: string): Promise<AsyncIterable<string>> {
        const apiKey = this.configService.get<string>("GOOGLE_GENAI_API_KEY") as string;
        const model = this.configService.get<string>("GOOGLE_GENAI_MODEL") as string;
        const ai = new GoogleGenAI({ apiKey });

        const prompt = this.aiBaseService.promptResponseStream(search, this.aiBaseService.topChunks(chunks));
        const stream = await ai.models.generateContentStream({
            model,
            contents: prompt
        });

        async function* streamChunks(): AsyncIterable<string> {
            for await (const chunk of stream) {
                const text = chunk?.candidates?.[0]?.content?.parts?.map((p) => p?.text || "").join("") || "";

                if (!text) {
                    continue;
                }

                yield text;
            }
        }

        return streamChunks();
    }

    public async generateSummaryAndSuggestions(text: string): Promise<AIGenerateSummaryAndSuggestions> {
        const apiKey = this.configService.get<string>("GOOGLE_GENAI_API_KEY") as string;
        const model = this.configService.get<string>("GOOGLE_GENAI_MODEL") as string;
        const ai = new GoogleGenAI({ apiKey });

        const clean = text.replaceAll(/\s+/g, " ").trim();
        const sample = this.aiBaseService.extractSample(clean, 5000);

        const prompt = `${this.aiBaseService.promptSummaryAndSuggestions(sample)}\n\nResponda apenas em JSON no formato {"summary":"texto","questions":["...","...","..."]}`;

        const response = await ai.models.generateContent({
            model,
            contents: prompt
        });
        const rawText = response.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") || "";

        const normalized = rawText.replaceAll(/```json|```/g, "").trim();

        try {
            const parsed = JSON.parse(normalized) as AIGenerateSummaryAndSuggestions;

            if (!parsed?.summary || !Array.isArray(parsed.questions)) {
                throw new Error("Formato inválido da resposta da IA");
            }

            return parsed;
        } catch (error) {
            throw new Error(`Erro ao interpretar resposta da IA: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}

