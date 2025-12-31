import { Injectable, OnModuleInit, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HttpService } from "@nestjs/axios";
import { Cron, CronExpression } from "@nestjs/schedule";
import { firstValueFrom } from "rxjs";

@Injectable()
export class AiWarmupTask implements OnModuleInit {
    private readonly logger = new Logger(AiWarmupTask.name);
    private readonly keepAliveIntervalMs = 5 * 60 * 1000;
    private isWarmedUp = false;

    constructor(
        private readonly http: HttpService,
        private readonly configService: ConfigService
    ) {}

    async onModuleInit() {
        await this.warmupModels();
    }

    @Cron(CronExpression.EVERY_5_MINUTES)
    async handle() {
        if (this.isWarmedUp) {
            await this.keepModelsAlive();
        }
    }

    private async warmupModels(): Promise<void> {
        try {
            this.logger.log("🔥 Iniciando warm-up dos modelos de IA...");

            const embeddingModel = this.configService.get<string>("AI_EMBEDDING_MODEL") as string;
            const generationModel = this.configService.get<string>("AI_MODEL") as string;

            await this.warmupEmbeddingModel(embeddingModel);

            await this.warmupGenerationModel(generationModel);

            this.isWarmedUp = true;
            this.logger.log("✅ Warm-up dos modelos concluído com sucesso");
        } catch (error) {
            this.logger.error(`❌ Erro no warm-up dos modelos: ${error.message}`);
        }
    }

    private async warmupEmbeddingModel(model: string): Promise<void> {
        const url = `${this.getUrlBase()}/embeddings`;

        try {
            this.logger.log(`Aquecendo modelo de embedding: ${model}`);

            const response = await firstValueFrom(
                this.http.post(url, {
                    model,
                    prompt: "warmup",
                    keep_alive: this.keepAliveIntervalMs
                })
            );

            if (response.data?.embedding) {
                this.logger.log(`✓ Modelo de embedding ${model} aquecido`);
            }
        } catch (error) {
            this.logger.warn(`Falha ao aquecer modelo de embedding: ${error.message}`);
        }
    }

    private async warmupGenerationModel(model: string): Promise<void> {
        const url = `${this.getUrlBase()}/generate`;

        try {
            this.logger.log(`Aquecendo modelo de geração: ${model}`);

            const response = await firstValueFrom(
                this.http.post(url, {
                    model,
                    prompt: "warmup",
                    stream: false,
                    keep_alive: this.keepAliveIntervalMs
                })
            );

            if (response.data) {
                this.logger.log(`✓ Modelo de geração ${model} aquecido`);
            }
        } catch (error) {
            this.logger.warn(`Falha ao aquecer modelo de geração: ${error.message}`);
        }
    }

    private async keepModelsAlive(): Promise<void> {
        try {
            const embeddingModel = this.configService.get<string>("AI_EMBEDDING_MODEL") as string;
            const generationModel = this.configService.get<string>("AI_MODEL") as string;

            await Promise.all([this.keepAliveEmbedding(embeddingModel), this.keepAliveGeneration(generationModel)]);

            this.logger.debug("Keep-alive enviado para os modelos");
        } catch (error) {
            this.logger.warn(`Erro no keep-alive: ${error.message}`);
        }
    }

    private async keepAliveEmbedding(model: string): Promise<void> {
        const url = `${this.getUrlBase()}/embeddings`;

        await firstValueFrom(
            this.http.post(url, {
                model,
                prompt: ".",
                keep_alive: this.keepAliveIntervalMs
            })
        ).catch(() => {});
    }

    private async keepAliveGeneration(model: string): Promise<void> {
        const url = `${this.getUrlBase()}/generate`;

        await firstValueFrom(
            this.http.post(url, {
                model,
                prompt: ".",
                stream: false,
                keep_alive: this.keepAliveIntervalMs
            })
        ).catch(() => {});
    }

    private getUrlBase(): string {
        return this.configService.get<string>("AI_URL") as string;
    }
}

