import { Module } from "@nestjs/common";
import { MessageService } from "./message.service";
import { MessageController } from "./message.controller";
import { MessageRepository } from "./repositories/message.repository";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MessageEntity } from "./repositories/message.entity";
import { CommonModule } from "../../common/common.module";
import { MessageSourceRepository } from "./repositories/message-source.repository";
import { MessageSourceEntity } from "./repositories/message-source.entity";

@Module({
    controllers: [MessageController],
    providers: [MessageService, MessageRepository, MessageSourceRepository],
    exports: [MessageService],
    imports: [CommonModule, TypeOrmModule.forFeature([MessageEntity, MessageSourceEntity])]
})
export class MessageModule {}

