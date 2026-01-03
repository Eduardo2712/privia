import { Injectable } from "@nestjs/common";

@Injectable()
export class AiBaseService {
    public topChunks(chunks: Array<{ score: number; text: string }>) {
        const topK = Math.min(5, chunks.length);

        const result = chunks
            .slice(0, topK)
            .map((c, i) => {
                let text = c.text.replaceAll(/\s+/g, " ").trim();

                if (text.length > 600) {
                    const trimmed = text.substring(0, 600);
                    const lastPeriod = trimmed.lastIndexOf(".");

                    text = lastPeriod > 400 ? trimmed.substring(0, lastPeriod + 1) : trimmed + "...";
                }

                return `[${i + 1}] ${text}`;
            })
            .join("\n");

        return result;
    }

    public extractSample(text: string, maxLen: number): string {
        if (text.length <= maxLen) {
            return text;
        }

        return text.slice(0, maxLen);
    }

    public promptResponseStream(search: string, context: string): string {
        return `Responda baseado APENAS nos trechos abaixo.

REGRAS:
- Responda EXCLUSIVAMENTE em português do Brasil de forma clara e completa
- Use SOMENTE informações dos trechos fornecidos
- Cite [número] (exemplo: [1][2]) para cada informação usada
- Se for narrativa/literatura, preserve o contexto e tom
- Se nenhum trecho contiver a resposta, diga SOMENTE: "Não encontrei essa informação no documento."
- NÃO misture resposta com aviso de não encontrado

TRECHOS:
${context}

PERGUNTA: ${search}

RESPOSTA:`;
    }

    public promptSummaryAndSuggestions(text: string): string {
        return `Analise o texto e forneça um resumo e perguntas relevantes.

INSTRUÇÕES:
- Responda EXCLUSIVAMENTE em português do Brasil
- Resumo: 2-3 frases capturando a essência do conteúdo
- Perguntas: 3 perguntas que um leitor faria sobre o texto
- Se for literatura/narrativa, foque em personagens, enredo e temas
- Se for documentação/técnico, foque em conceitos e aplicações

TEXTO:
${text}`;
    }
}

