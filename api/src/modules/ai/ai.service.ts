import { Injectable } from "@nestjs/common";
import { AiOllamaService } from "./ai-ollama.service";
import { AIGenerateSummaryAndSuggestions } from "./interfaces/ai.interface";
import { AiGoogleService } from "./ai-google.service";

@Injectable()
export class AiService {
    constructor(
        private readonly aiOllamaService: AiOllamaService,
        private readonly aiGoogleService: AiGoogleService
    ) {}

    public getEmbedding(prompt: string): Promise<number[]> {
        return this.aiOllamaService.getEmbedding(prompt);
    }

    public async generateResponseStream(chunks: Array<{ score: number; text: string }>, search: string): Promise<AsyncIterable<string>> {
        // return await this.aiOllamaService.generateResponseStream(chunks, search);

        return await this.aiGoogleService.generateResponseStream(chunks, search);
    }

    public async generateSummaryAndSuggestions(text: string): Promise<AIGenerateSummaryAndSuggestions> {
        // return await this.aiOllamaService.generateSummaryAndSuggestions(text);
        return await this.aiGoogleService.generateSummaryAndSuggestions(text);
    }
}

