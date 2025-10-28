import { Module } from "@nestjs/common";
import { AiController } from "./ai.controller";
import { HttpModule } from "@nestjs/axios";
import { AiService } from "./ai.service";

@Module({
    controllers: [AiController],
    providers: [AiService],
    exports: [AiService],
    imports: [HttpModule]
})
export class AiModule {}

