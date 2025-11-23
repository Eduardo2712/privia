import { Injectable } from "@nestjs/common";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

@Injectable()
export class ChunkerFileService {
    public async chunkText(text: string): Promise<string[]> {
        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1500,
            chunkOverlap: 300,
            separators: ["\n\n\n", "\n\n", "\n", ". ", "! ", "? ", "; ", " ", ""]
        });

        return await splitter.splitText(text);
    }
}

