import { HttpService } from "@nestjs/axios";
import { HttpStatus, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AIGenerateFormInterface, AIGenerateResponseInterface } from "./interfaces/ai.interface";
import { firstValueFrom } from "rxjs";

@Injectable()
export class BaseAiService {
    constructor(
        protected readonly http: HttpService,
        protected readonly configService: ConfigService
    ) {}

    protected getUrlBase(): string {
        return this.configService.get<string>("AI_URL") as string;
    }

    private defaultForm(): Pick<AIGenerateFormInterface, "model" | "stream"> {
        return {
            model: "phi3:mini",
            stream: false
        };
    }

    protected async generate(form: Omit<AIGenerateFormInterface, "model" | "stream">): Promise<unknown> {
        const url = this.getUrlBase();

        const formData: AIGenerateFormInterface = {
            ...this.defaultForm(),
            ...form
        };

        try {
            const response = await firstValueFrom(this.http.post<AIGenerateResponseInterface>(url, formData));

            if (response.status !== HttpStatus.OK) {
                throw new Error(`Erro ao gerar resposta da IA: ${response.data.error}`);
            }

            return response.data.response;
        } catch (error) {
            throw new Error(`Erro ao gerar resposta da IA: ${error.message}`);
        }
    }
}

