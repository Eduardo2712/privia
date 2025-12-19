import { Injectable } from "@nestjs/common";
import { MessageEntity } from "./repositories/message.entity";
import { MessageRepository } from "./repositories/message.repository";
import { MessageSourceEntity } from "./repositories/message-source.entity";
import { MessageSourceRepository } from "./repositories/message-source.repository";
import { SaveAiResponseRequestDto } from "./dto/save-ai-response-request.dto";
import { LoggedUserInterface } from "../../common/interfaces/jwt.interface";
import { UnitOfWorkService } from "../../common/unity-of-work.service";
import { MessageTypeEnum } from "./enums/message.enum";

@Injectable()
export class MessageService {
    constructor(
        private readonly messageRepository: MessageRepository,
        private readonly messageSourceRepository: MessageSourceRepository,
        private readonly unitOfWork: UnitOfWorkService
    ) {}

    public async generateMessageSuggestion(idFile: number): Promise<string[]> {
        const arraySuggestions: string[] = [];

        return arraySuggestions;
    }

    public async createWithSources(message: Omit<MessageEntity, "id">, sources?: Omit<MessageSourceEntity, "id">[]): Promise<MessageEntity> {
        const obj = await this.messageRepository.create(message);

        if (sources && sources.length > 0) {
            const sourcesToCreate = sources.map((source) =>
                Object.assign(new MessageSourceEntity({}), {
                    ...source,
                    messageId: obj.id
                })
            );

            await this.messageSourceRepository.createMany(sourcesToCreate);
        }

        return obj;
    }

    public async saveAiResponse(user: LoggedUserInterface, payload: SaveAiResponseRequestDto): Promise<MessageEntity> {
        const { fileId, userMessageId, content, sources } = payload;

        const aiMessage = await this.unitOfWork.withTransaction(async () => {
            const userMessage = await this.messageRepository.findOne({
                where: { id: userMessageId, userId: user.id, fileId, type: MessageTypeEnum.USER }
            });

            if (!userMessage) {
                throw new Error("Mensagem do usuário não encontrada para este arquivo.");
            }

            const createdMessage = await this.messageRepository.create({
                content,
                fileId,
                userId: user.id,
                type: MessageTypeEnum.AI
            });

            if (sources?.length) {
                const formattedSources = sources.map(
                    (source) =>
                        new MessageSourceEntity({
                            text: source.text,
                            sourceIndex: source.index,
                            messageId: createdMessage.id
                        })
                );

                createdMessage.sources = await this.messageSourceRepository.createMany(formattedSources);
            }

            return createdMessage;
        });

        return aiMessage;
    }
}

