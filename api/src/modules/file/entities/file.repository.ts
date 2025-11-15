import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UnitOfWorkService } from "../../../common/unity-of-work.service";
import { BaseRepository } from "../../../common/repository/base.repository";
import { FileEntity } from "./file.entity";

@Injectable()
export class FileRepository extends BaseRepository<FileEntity> {
    constructor(
        @InjectRepository(FileEntity)
        private readonly defaultRepo: Repository<FileEntity>,
        unitOfWork: UnitOfWorkService
    ) {
        super(defaultRepo, unitOfWork);
    }
}

