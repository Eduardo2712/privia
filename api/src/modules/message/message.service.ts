import { Injectable } from "@nestjs/common";
import { MessageEntity } from "./repositories/message.entity";
import { MessageRepository } from "./repositories/message.repository";
import { MessageSourceEntity } from "./repositories/message-source.entity";
import { MessageSourceRepository } from "./repositories/message-source.repository";
import { SaveAiResponseRequestDto } from "./dto/save-ai-response-request.dto";
import { UnitOfWorkService } from "../../common/unity-of-work.service";
import { MessageTypeEnum } from "./enums/message.enum";
import { ListMessageRequestDto } from "./dto/list-message-request.dto";
import { ListMessageResponseDto } from "./dto/list-message-response.dto";
import { plainToInstance } from "class-transformer";
import { MessageResponseDto } from "./dto/message-response.dto";

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

    public async saveAiResponse(userId: number, payload: SaveAiResponseRequestDto): Promise<MessageEntity> {
        const { fileId, userMessageId, content, sources } = payload;

        const aiMessage = await this.unitOfWork.withTransaction(async () => {
            const userMessage = await this.messageRepository.findOne({
                where: { id: userMessageId, userId, fileId, type: MessageTypeEnum.USER }
            });

            if (!userMessage) {
                throw new Error("Mensagem do usuário não encontrada para este arquivo.");
            }

            const createdMessage = await this.messageRepository.create({
                content,
                fileId,
                userId,
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

    public async list(userId: number, listMessageRequestDto: ListMessageRequestDto): Promise<ListMessageResponseDto> {
        const result = await this.messageRepository.listByUser(userId, listMessageRequestDto);

        const items = plainToInstance(MessageResponseDto, result.items, { excludeExtraneousValues: true });

        return {
            items: items.toReversed(),
            page: listMessageRequestDto.page,
            totalItems: result.total,
            totalPages: Math.ceil(result.total / 10)
        };
    }
}

