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

    getManager(): EntityManager | null {
        return this.currentManager;
    }

    isInTransaction(): boolean {
        return this.currentManager !== null;
    }
}

