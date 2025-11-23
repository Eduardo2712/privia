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

    public rerankByKeywords(chunks: Array<{ score: number; text: string }>, query: string): Array<{ score: number; text: string }> {
        const keywords = query
            .toLowerCase()
            .split(/\s+/)
            .filter((w) => w.length > 2);

        return chunks
            .map((chunk) => {
                const textLower = chunk.text.toLowerCase();
                let keywordScore = 0;

                keywords.forEach((keyword) => {
                    const count = (textLower.match(new RegExp(keyword, "g")) || []).length;

                    keywordScore += count;
                });

                return {
                    ...chunk,
                    score: chunk.score + keywordScore * 0.1
                };
            })
            .sort((a, b) => b.score - a.score);
    }
}

