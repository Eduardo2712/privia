import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "./user.entity";
import { Repository } from "typeorm";
import { UnitOfWorkService } from "../../../common/unity-of-work.service";
import { BaseRepository } from "../../../common/repository/base.repository";

@Injectable()
export class UserRepository extends BaseRepository<UserEntity> {
    constructor(
        @InjectRepository(UserEntity)
        private readonly defaultRepo: Repository<UserEntity>,
        unitOfWork: UnitOfWorkService
    ) {
        super(defaultRepo, unitOfWork);
    }

    async findOneByEmail(email: string, ignoredId?: number): Promise<UserEntity | null> {
        const repository = this.getRepository();

        return await repository.findOne({ where: { email, id: ignoredId } });
    }

    async findOneById(id: number): Promise<UserEntity | null> {
        const repository = this.getRepository();

        return await repository.findOne({ where: { id } });
    }
}

