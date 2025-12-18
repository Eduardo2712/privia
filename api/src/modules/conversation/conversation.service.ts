import { Injectable } from "@nestjs/common";

@Injectable()
export class ConversationService {
    public async generateMessageSuggestion(idFile: number): Promise<string[]> {
        const arraySuggestions: string[] = [];

        return arraySuggestions;
    }
}

