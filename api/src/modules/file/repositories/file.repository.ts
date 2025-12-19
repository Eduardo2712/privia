import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UnitOfWorkService } from "../../../common/unity-of-work.service";
import { BaseRepository } from "../../../common/repository/base.repository";
import { FileEntity } from "./file.entity";
import { ListFileRequestDto } from "../dto/list-file-request.dto";

@Injectable()
export class FileRepository extends BaseRepository<FileEntity> {
    constructor(
        @InjectRepository(FileEntity)
        private readonly defaultRepo: Repository<FileEntity>,
        unitOfWork: UnitOfWorkService
    ) {
        super(defaultRepo, unitOfWork);
    }

    async listFilesByUser(userId: number, listFileRequestDto: ListFileRequestDto): Promise<{ items: FileEntity[]; total: number }> {
        const repository = this.getRepository();

        const [items, total] = await repository.findAndCount({
            where: {
                userId: userId
            },
            skip: (listFileRequestDto.page - 1) * 10,
            take: 10,
            order: { createdAt: "DESC" }
        });

        return { items, total };
    }
}

