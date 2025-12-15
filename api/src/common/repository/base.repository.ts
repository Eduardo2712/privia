import { EntityManager, Repository, ObjectLiteral, FindOneOptions, FindManyOptions, DeepPartial, FindOptionsWhere } from "typeorm";
import { UnitOfWorkService } from "../unity-of-work.service";

export abstract class BaseRepository<T extends ObjectLiteral & { id: number }> {
    constructor(
        protected readonly repository: Repository<T>,
        protected readonly unitOfWork: UnitOfWorkService
    ) {}

    protected getManager(): EntityManager {
        const transactionalManager = this.unitOfWork.getManager();

        return transactionalManager || this.repository.manager;
    }

    protected getRepository(): Repository<T> {
        const manager = this.getManager();

        return manager.getRepository(this.repository.target);
    }

    async create(data: DeepPartial<T>): Promise<T> {
        const repository = this.getRepository();

        const entity = repository.create(data);

        return await repository.save(entity);
    }

    async update(id: number, data: DeepPartial<T>): Promise<T> {
        const repository = this.getRepository();

        await repository.update(id, data);

        return await repository.findOneOrFail({ where: { id } as FindOptionsWhere<T> });
    }

    async delete(id: number, options?: FindOneOptions<T>): Promise<boolean> {
        const repository = this.getRepository();

        const result = await repository.softDelete({ id, ...options?.where } as FindOptionsWhere<T>);

        return !!result.affected && result.affected > 0;
    }

    async hardDelete(id: number, options?: FindOneOptions<T>): Promise<boolean> {
        const repository = this.getRepository();

        const result = await repository.delete({ id, ...options?.where } as FindOptionsWhere<T>);

        return !!result.affected && result.affected > 0;
    }

    async findOne(options: FindOneOptions<T>): Promise<T | null> {
        const repository = this.getRepository();

        return await repository.findOne(options);
    }

    async findOneOrFail(options: FindOneOptions<T>): Promise<T | null> {
        const repository = this.getRepository();

        return await repository.findOneOrFail(options);
    }

    async findMany(options?: FindManyOptions<T>): Promise<T[]> {
        const repository = this.getRepository();

        return await repository.find(options);
    }

    async count(options?: FindManyOptions<T>): Promise<number> {
        const repository = this.getRepository();

        return await repository.count(options);
    }

    async exists(options: FindOneOptions<T>): Promise<boolean> {
        const repository = this.getRepository();

        const count = await repository.count(options);

        return count > 0;
    }
}

