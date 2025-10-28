import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { MoreThanOrEqual, Repository } from "typeorm";
import { ForgotPasswordEntity } from "./forgot-password.entity";
import { BaseRepository } from "../../../common/repository/base.repository";
import { UnitOfWorkService } from "../../../common/unity-of-work.service";

@Injectable()
export class ForgotPasswordRepository extends BaseRepository<ForgotPasswordEntity> {
    constructor(
        @InjectRepository(ForgotPasswordEntity)
        private readonly defaultRepo: Repository<ForgotPasswordEntity>,
        unitOfWork: UnitOfWorkService
    ) {
        super(defaultRepo, unitOfWork);
    }

    async findOneByCode(code: string): Promise<ForgotPasswordEntity | null> {
        const repository = this.getRepository();

        const thirtyMinutesAgo = new Date(Date.now() - 1800000);

        return await repository.findOne({
            where: {
                code,
                createdAt: MoreThanOrEqual(thirtyMinutesAgo)
            },
            select: { user: true }
        });
    }

    async findRecentForgotPasswordByUser(userId: number): Promise<ForgotPasswordEntity | null> {
        const repository = this.getRepository();
        const twoMinutesAgo = new Date(Date.now() - 120000);

        return await repository.findOne({
            where: {
                userId,
                createdAt: MoreThanOrEqual(twoMinutesAgo)
            },
            order: {
                createdAt: "DESC"
            }
        });
    }

    async deleteByUser(userId: number): Promise<void> {
        const repository = this.getRepository();

        await repository.softDelete({ userId });
    }
}

