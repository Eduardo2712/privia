import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { MessageService } from "./message.service";
import { ApiCookieAuth, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { GetUser } from "../../common/decorators/get-user.decorator";
import { LoggedUserInterface } from "../../common/interfaces/jwt.interface";
import { SaveAiResponseRequestDto } from "./dto/save-ai-response-request.dto";
import { plainToInstance } from "class-transformer";
import { MessageResponseDto } from "./dto/message-response.dto";

@ApiTags("message")
@Controller("message")
export class MessageController {
    constructor(private readonly messageService: MessageService) {}

    @Post("/ai-response")
    @HttpCode(HttpStatus.CREATED)
    @ApiOkResponse({ type: MessageResponseDto })
    @ApiCookieAuth()
    async saveAiResponse(@GetUser() user: LoggedUserInterface, @Body() saveAiResponseDto: SaveAiResponseRequestDto): Promise<MessageResponseDto> {
        const message = await this.messageService.saveAiResponse(user, saveAiResponseDto);

        return plainToInstance(
            MessageResponseDto,
            {
                ...message,
                sources: message.sources
            },
            { excludeExtraneousValues: true }
        );
    }
}

