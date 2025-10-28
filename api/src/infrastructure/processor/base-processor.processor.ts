import { OnQueueActive, OnQueueCompleted, OnQueueFailed } from "@nestjs/bull";
import { Logger } from "@nestjs/common";
import { Job } from "bull";

export abstract class BaseProcessor {
    protected abstract readonly logger: Logger;

    @OnQueueFailed()
    onQueueFailed(job: Job, err: Error): void {
        this.logger.error(`Job ${job.name} falhou: ${err.message}`);
    }

    @OnQueueActive()
    onQueueActive(job: Job): void {
        this.logger.log(`Job ${job.name} ${job.id} está ativo.`);
    }

    @OnQueueCompleted()
    onQueueCompleted(job: Job): void {
        this.logger.log(`Job ${job.name} ${job.id} foi concluído.`);
    }
}

