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

    public async generateEmailResponses(text: string, context: string = ""): Promise<{ id: number; texto: string }[] | null> {
        const response = await this.generate({
            prompt: `Você é uma inteligência artificial que ajuda a responder e-mails.
                    Eu vou fornecer o conteúdo de um e-mail recebido e sua tarefa é criar 3 possíveis respostas para ele.

                    As respostas devem ser:
                    1. Escritas em um tom educado e profissional.
                    2. Curtas e objetivas (de 3 a 6 frases cada).
                    3. Diferentes entre si — por exemplo: uma mais formal, uma mais amigável e outra mais direta.

                    Entrada (e-mail recebido): "${text}"
                    Contexto adicional (se houver): "${context}"

                    Saída esperada: Um JSON no formato:
                    {
                        "respostas": [
                            { "id": 1, "texto": "..." },
                            { "id": 2, "texto": "..." },
                            { "id": 3, "texto": "..." }
                        ]
                    }`,
            format: {
                type: "object",
                properties: {
                    respostas: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                id: { type: "number" },
                                texto: { type: "string" }
                            },
                            required: ["id", "texto"]
                        }
                    }
                },
                required: ["respostas"]
            }
        });

        return response as { id: number; texto: string }[] | null;
    }
}

