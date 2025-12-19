import { Injectable } from "@nestjs/common";
import { MessageEntity } from "./message.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { BaseRepository } from "../../../common/repository/base.repository";
import { Repository } from "typeorm";
import { UnitOfWorkService } from "../../../common/unity-of-work.service";

@Injectable()
export class MessageRepository extends BaseRepository<MessageEntity> {
    constructor(
        @InjectRepository(MessageEntity)
        private readonly defaultRepo: Repository<MessageEntity>,
        unitOfWork: UnitOfWorkService
    ) {
        super(defaultRepo, unitOfWork);
    }
}

