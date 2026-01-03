import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { AiOllamaService } from "./ai-ollama.service";
import * as http from "node:http";
import * as https from "node:https";
import { CacheModule } from "@nestjs/cache-manager";
import { AiGoogleService } from "./ai-google.service";
import { AiService } from "./ai.service";
import { AiBaseService } from "./ai-base.service";

@Module({
    controllers: [],
    providers: [AiOllamaService, AiGoogleService, AiService, AiBaseService],
    exports: [AiService],
    imports: [
        CacheModule.register(),
        HttpModule.register({
            timeout: 120000,
            maxRedirects: 5,
            httpAgent: new http.Agent({
                keepAlive: true,
                keepAliveMsecs: 1000,
                maxSockets: 100,
                maxFreeSockets: 10
            }),
            httpsAgent: new https.Agent({
                keepAlive: true,
                keepAliveMsecs: 1000,
                maxFreeSockets: 10,
                maxSockets: 100
            })
        })
    ]
})
export class AiModule {}

