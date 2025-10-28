import { EntityManager } from "typeorm";

export interface IUnitOfWorkInterface {
    withTransaction<T>(work: (manager: EntityManager) => Promise<T>): Promise<T>;
    getManager(): EntityManager | null;
}

