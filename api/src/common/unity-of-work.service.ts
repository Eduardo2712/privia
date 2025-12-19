import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource, EntityManager } from "typeorm";
import { IUnitOfWorkInterface } from "./interfaces/unit-of-work.interface";

@Injectable()
export class UnitOfWorkService implements IUnitOfWorkInterface {
    private currentManager: EntityManager | null = null;

    constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

    async withTransaction<T>(work: (manager: EntityManager) => Promise<T>): Promise<T> {
        return this.dataSource.transaction(async (manager) => {
            const previousManager = this.currentManager;

            this.currentManager = manager;

            try {
                const result = await work(manager);

                return result;
            } finally {
                this.currentManager = previousManager;
            }
        });
    }

    async startTransaction(): Promise<void> {
        if (this.currentManager) {
            throw new Error("Transação já está em andamento");
        }

        this.currentManager = this.dataSource.createEntityManager();

        await this.currentManager.queryRunner?.startTransaction();
    }

    async commitTransaction(): Promise<void> {
        if (!this.currentManager) {
            throw new Error("Nenhuma transação ativa para confirmar");
        }

        await this.currentManager.queryRunner?.commitTransaction();
        await this.currentManager.queryRunner?.release();

        this.currentManager = null;
    }

    async rollbackTransaction(): Promise<void> {
        if (!this.currentManager) {
            throw new Error("Nenhuma transação ativa para reverter");
        }

        await this.currentManager.queryRunner?.rollbackTransaction();
        await this.currentManager.queryRunner?.release();

        this.currentManager = null;
    }

    getManager(): EntityManager | null {
        return this.currentManager;
    }
}

