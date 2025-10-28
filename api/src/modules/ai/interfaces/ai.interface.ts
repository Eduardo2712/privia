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
    model: string;
    prompt: string;
    stream: boolean;
    format?: {
        type: string;
        properties: Record<string, { type: string; items?: any }>;
        required: string[];
    };
}

