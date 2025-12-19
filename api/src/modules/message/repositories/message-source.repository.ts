import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BaseRepository } from "../../../common/repository/base.repository";
import { Repository } from "typeorm";
import { UnitOfWorkService } from "../../../common/unity-of-work.service";
import { MessageSourceEntity } from "./message-source.entity";

@Injectable()
export class MessageSourceRepository extends BaseRepository<MessageSourceEntity> {
    constructor(
        @InjectRepository(MessageSourceEntity)
        private readonly defaultRepo: Repository<MessageSourceEntity>,
        unitOfWork: UnitOfWorkService
    ) {
        super(defaultRepo, unitOfWork);
    }
}
