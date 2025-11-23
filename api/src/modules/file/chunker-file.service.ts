import { Injectable } from "@nestjs/common";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

@Injectable()
export class ChunkerFileService {
    public async chunkText(text: string): Promise<string[]> {
        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1400,
            chunkOverlap: 200,
            separators: ["\n\n", "\n", ". ", "! ", "? ", "; ", ": ", "• ", "- ", "—", " ", ""]
        });

        return await splitter.splitText(text);
    }
}

