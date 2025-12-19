import { Injectable } from "@nestjs/common";
import { MessageEntity } from "./repositories/message.entity";
import { MessageRepository } from "./repositories/message.repository";

@Injectable()
export class MessageService {
    constructor(private readonly messageRepository: MessageRepository) {}

    public async generateMessageSuggestion(idFile: number): Promise<string[]> {
        const arraySuggestions: string[] = [];

        return arraySuggestions;
    }

    public async create(data: Omit<MessageEntity, "id">): Promise<MessageEntity> {
        return await this.messageRepository.create(data);
    }
}

