import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UnitOfWorkService } from "../../../common/unity-of-work.service";
import { BaseRepository } from "../../../common/repository/base.repository";
import { FileEntity } from "./file.entity";
import { ListFileRequestDto } from "../dto/list-file-request.dto";
import { LoggedUserInterface } from "../../../common/interfaces/jwt.interface";

@Injectable()
export class FileRepository extends BaseRepository<FileEntity> {
    constructor(
        @InjectRepository(FileEntity)
        private readonly defaultRepo: Repository<FileEntity>,
        unitOfWork: UnitOfWorkService
    ) {
        super(defaultRepo, unitOfWork);
    }

    async listFiles(user: LoggedUserInterface, listFileRequestDto: ListFileRequestDto): Promise<{ items: FileEntity[]; total: number }> {
        const repository = this.getRepository();

        const limit = 10;

        const [items, total] = await repository.findAndCount({
            where: {
                userId: user.id
            },
            skip: (listFileRequestDto.page - 1) * limit,
            take: limit,
            order: { createdAt: "DESC" }
        });

        return { items, total };
    }
}

