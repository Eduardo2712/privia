import { OnWorkerEvent, WorkerHost } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import { Job } from "bullmq";

export abstract class BaseProcessor extends WorkerHost {
    protected abstract readonly logger: Logger;
    private readonly jobStartTimes = new Map<string, number>();

    private formatDuration(ms: number): string {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        const remainingMinutes = minutes % 60;
        const remainingSeconds = seconds % 60;
        const remainingMs = ms % 1000;

        if (hours > 0) {
            return `${hours}h ${remainingMinutes}m ${remainingSeconds}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${remainingSeconds}s`;
        } else if (seconds > 0) {
            return `${seconds}s ${remainingMs}ms`;
        } else {
            return `${ms}ms`;
        }
    }

    @OnWorkerEvent("failed")
    onQueueFailed(job: Job, err: Error): void {
        const key = String(job.id);
        const started = this.jobStartTimes.get(key);

        if (started) {
            const durationMs = Date.now() - started;
            const duration = this.formatDuration(durationMs);

            this.logger.error(`Job ${job.name} ${job.id} falhou após ${duration}: ${err.message}`);
            this.jobStartTimes.delete(key);
        } else {
            this.logger.error(`Job ${job.name} ${job.id} falhou: ${err.message}`);
        }
    }

    @OnWorkerEvent("active")
    onQueueActive(job: Job): void {
        this.jobStartTimes.set(String(job.id), Date.now());
        this.logger.log(`Job ${job.name} ${job.id} está ativo.`);
    }

    @OnWorkerEvent("completed")
    onQueueCompleted(job: Job): void {
        const key = String(job.id);
        const started = this.jobStartTimes.get(key);

        if (started) {
            const durationMs = Date.now() - started;
            const duration = this.formatDuration(durationMs);

            this.logger.log(`Job ${job.name} ${job.id} foi concluído em ${duration}.`);
            this.jobStartTimes.delete(key);
        } else {
            this.logger.log(`Job ${job.name} ${job.id} foi concluído.`);
        }
    }
}

