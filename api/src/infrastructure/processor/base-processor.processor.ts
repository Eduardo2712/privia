import { OnWorkerEvent, WorkerHost } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import { Job } from "bullmq";

export abstract class BaseProcessor extends WorkerHost {
    protected abstract readonly logger: Logger;

    @OnWorkerEvent("failed")
    onQueueFailed(job: Job, err: Error): void {
        this.logger.error(`Job ${job.name} falhou: ${err.message}`);
    }

    @OnWorkerEvent("active")
    onQueueActive(job: Job): void {
        this.logger.log(`Job ${job.name} ${job.id} está ativo.`);
    }

    @OnWorkerEvent("completed")
    onQueueCompleted(job: Job): void {
        this.logger.log(`Job ${job.name} ${job.id} foi concluído.`);
    }
}

