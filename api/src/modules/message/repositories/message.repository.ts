import { Injectable } from "@nestjs/common";
import { MessageEntity } from "./message.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { BaseRepository } from "../../../common/repository/base.repository";
import { Repository } from "typeorm";
import { UnitOfWorkService } from "../../../common/unity-of-work.service";
import { ListMessageRequestDto } from "../dto/list-message-request.dto";

@Injectable()
export class MessageRepository extends BaseRepository<MessageEntity> {
    constructor(
        @InjectRepository(MessageEntity)
        private readonly defaultRepo: Repository<MessageEntity>,
        unitOfWork: UnitOfWorkService
    ) {
        super(defaultRepo, unitOfWork);
    }

    async listByUser(userId: number, listMessageRequestDto: ListMessageRequestDto): Promise<{ items: MessageEntity[]; total: number }> {
        const repository = this.getRepository();

        const [items, total] = await repository
            .createQueryBuilder("messages")
            .where("messages.userId = :userId AND messages.fileId = :fileId", { userId, fileId: listMessageRequestDto.fileId })
            .leftJoinAndSelect("messages.sources", "sources", "sources.messageId = messages.id")
            .orderBy("messages.createdAt", "DESC")
            .addOrderBy("sources.sourceIndex", "ASC")
            .take(10)
            .skip((listMessageRequestDto.page - 1) * 10)
            .getManyAndCount();

        return { items, total };
    }

    async getLastestMessagesByFileId(userId: number, fileId: number): Promise<MessageEntity[]> {
        const qb = this.getRepository().createQueryBuilder("messages");

        const subQuery = qb
            .subQuery()
            .select("m.id")
            .from(MessageEntity, "m")
            .where("m.userId = :userId", { userId })
            .andWhere("m.fileId = :fileId", { fileId })
            .orderBy("m.createdAt", "DESC")
            .limit(2)
            .getQuery();

        return this.getRepository()
            .createQueryBuilder("messages")
            .leftJoinAndSelect("messages.sources", "sources")
            .where(`messages.id IN ${subQuery}`)
            .setParameters({ userId, fileId })
            .orderBy("messages.createdAt", "DESC")
            .addOrderBy("sources.sourceIndex", "ASC")
            .getMany();
    }
}

