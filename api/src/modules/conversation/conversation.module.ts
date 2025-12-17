import { Module } from "@nestjs/common";
import { ConversationService } from "./conversation.service";
import { ConversationController } from "./conversation.controller";
import { MessageRepository } from "./repositories/message.repository";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MessageEntity } from "./repositories/message.entity";
import { CommonModule } from "../../common/common.module";

@Module({
    controllers: [ConversationController],
    providers: [ConversationService, MessageRepository],
    exports: [ConversationService],
    imports: [CommonModule, TypeOrmModule.forFeature([MessageEntity])]
})
export class ConversationModule {}

