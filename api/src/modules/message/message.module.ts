import { Module } from "@nestjs/common";
import { MessageService } from "./message.service";
import { MessageController } from "./message.controller";
import { MessageRepository } from "./repositories/message.repository";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MessageEntity } from "./repositories/message.entity";
import { CommonModule } from "../../common/common.module";

@Module({
    controllers: [MessageController],
    providers: [MessageService, MessageRepository],
    exports: [MessageService],
    imports: [CommonModule, TypeOrmModule.forFeature([MessageEntity])]
})
export class MessageModule {}

