import { Module } from "@nestjs/common";
import { QdrantService } from "./qdrant.service";

@Module({
    providers: [QdrantService],
    exports: [QdrantService],
    imports: [],
    controllers: []
})
export class QdrantModule {}

