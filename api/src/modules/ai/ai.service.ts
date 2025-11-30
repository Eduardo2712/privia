import { Injectable } from "@nestjs/common";
import { BaseAiService } from "./base-ai.service";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AiService extends BaseAiService {
    constructor(
        readonly http: HttpService,
        readonly configService: ConfigService
    ) {
        super(http, configService);
    }

    public async getEmbedding(text: string): Promise<number[]> {
        const embedding = await this.searchEmbedding({ prompt: text });

        return embedding;
    }

    public async generateResponseStream(
        chunks: Array<{ score: number; text: string }>,
        search: string,
        opts?: { promptMode?: "STRICT_QUOTE" | "INFERENCE_SYNTHESIS"; k?: number }
    ): Promise<AsyncIterable<string>> {
        const envDefault = this.configService.get<string>("PROMPT_MODE") || "STRICT_QUOTE";
        const auto = this.autoDecide(chunks);
        const mode = opts?.promptMode || envDefault || auto.promptMode;
        const kVal = typeof opts?.k === "number" && opts.k > 0 ? opts.k : auto.k;

        const useChunks = typeof kVal === "number" && kVal > 0 ? chunks.slice(0, Math.min(kVal, chunks.length)) : chunks;

        const fullChunks = useChunks
            .map((c, i) => {
                const maxLen = 1100;
                let text = c.text;

                if (text.length > maxLen) {
                    const trimmed = text.substring(0, maxLen);
                    const lastPeriod = trimmed.lastIndexOf(".");
                    text = lastPeriod > maxLen * 0.8 ? trimmed.substring(0, lastPeriod + 1) : trimmed;
                }

                return `[Trecho ${i + 1}]\n${text}\n`;
            })
            .join("\n---\n\n");

        const promptInference = `Você é um assistente literário especializado em análise profunda e contextualizada de textos.

MISSÃO:
Analise os trechos fornecidos e responda à pergunta de forma completa, inteligente e bem fundamentada.
Sintetize as informações mentalmente antes de responder para criar um entendimento unificado.

CAPACIDADES PERMITIDAS:
✓ Interpretar emoções, sentimentos e intenções descritas ou implícitas
✓ Identificar características de personalidade baseadas em ações, diálogos e descrições
✓ Inferir relações lógicas entre personagens, eventos e temas
✓ Fazer conexões temáticas e narrativas entre diferentes partes do texto
✓ Compreender contexto social, histórico e cultural implícito na narrativa
✓ Analisar dinâmicas de relacionamentos, motivações e conflitos
✓ Reconhecer recursos literários, simbolismos e metanarrativas evidentes
✓ Sintetizar informações esparsas para formar visão completa

RESTRIÇÕES:
✗ Não introduza fatos ou conhecimentos externos não presentes nos trechos
✗ Não faça especulações sem base textual clara
✗ Não contradiga informações explícitas do texto

FORMATO IDEAL:
- Comece com síntese direta e abrangente
- Desenvolva os aspectos principais com profundidade
- Organize em parágrafos temáticos lógicos
- Cite trechos [N] quando usar evidências específicas
- Seja eloquente, rico em detalhes, mas preciso
- Se informação for insuficiente, indique claramente quais aspectos não podem ser determinados

TRECHOS DO DOCUMENTO:
${fullChunks}

PERGUNTA: ${search}

ANÁLISE:`;

        const promptStrict = `Você é um assistente de RAG especializado. Responda APENAS com base nos trechos fornecidos, de forma completa e precisa.

REGRAS FUNDAMENTAIS:
- Use exclusivamente informações dos trechos abaixo.
- Sintetize todas as informações relevantes encontradas nos trechos para fornecer uma resposta abrangente.
- Cite as evidências como [N] onde N é o número do trecho.
- Se algo não estiver presente nos trechos, diga explicitamente: "Os trechos não contêm essa informação."
- Não introduza fatos externos ou suposições.

OBJETIVO DE QUALIDADE:
- Identifique TODOS os trechos que contêm informação relevante para a pergunta.
- Combine e sintetize essas informações em uma resposta coerente e completa.
- Seja específico: mencione contextos, exemplos, detalhes técnicos e casos de uso encontrados.
- Se houver múltiplas menções ao mesmo conceito em diferentes trechos, integre-as em uma visão unificada.

FORMATO DE SAÍDA OBRIGATÓRIO:
1. Resposta principal: 2-4 parágrafos bem estruturados, citando [N] após cada afirmação baseada em evidência.
2. Ao final, inclua SOMENTE:
   Fontes: N1, N2, N3
   (lista de números únicos, em ordem crescente, sem repetir)

TRECHOS DO DOCUMENTO:
${fullChunks}

PERGUNTA: ${search}

RESPOSTA COMPLETA:`;
        const prompt = mode === "STRICT_QUOTE" ? promptStrict : promptInference;

        return this.sendPromptStream(prompt);
    }

    private autoDecide(chunks: Array<{ score: number; text: string }>): { promptMode: "STRICT_QUOTE" | "INFERENCE_SYNTHESIS"; k: number } {
        const promptMode = "STRICT_QUOTE" as const;
        const k = Math.min(5, chunks.length);

        return { promptMode, k };
    }

    public async generateSummary(text: string): Promise<string> {
        const limit = 3000;
        const clean = text.replaceAll(/\s+/g, " ").trim();
        const chunk = clean.length > limit ? clean.slice(0, limit) : clean;

        const prompt = `Resuma em 2-3 frases:

        ${chunk}`;

        return this.sendPrompt(prompt, 120);
    }
}

