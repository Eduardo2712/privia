export interface AIGenerateResponseInterface {
    model: string;
    created_at: string;
    response: string;
    done: boolean;
    done_reason: string;
    context: number[];
    total_duration: number;
    load_duration: number;
    prompt_eval_count: number;
    prompt_eval_duration: number;
    eval_count: number;
    eval_duration: number;
    error?: string;
}

export interface AIGenerateFormInterface {
    prompt: string;
    model?: string;
    stream?: boolean;
    keep_alive?: number;
    format?: {
        type: string;
        properties: Record<string, { type: string; items?: unknown }>;
        required: string[];
    };
    options?: {
        temperature?: number;
        top_p?: number;
        top_k?: number;
        num_predict?: number;
        num_ctx?: number;
        repeat_penalty?: number;
        max_tokens?: number;
    };
}

export interface AIEmbeddingResponseInterface {
    embedding: number[];
}

export interface AIStreamResponseChunkInterface {
    id: string;
    createdAt: number;
    data: string;
    finished: boolean;
    finishReason?: string;
}

export interface AIGenerateSummaryAndSuggestions {
    summary: string;
    questions: string[];
}

