import { Module } from "@nestjs/common";
import { AiController } from "./ai.controller";
import { HttpModule } from "@nestjs/axios";
import { AiService } from "./ai.service";
import * as http from "node:http";
import * as https from "node:https";

@Module({
    controllers: [AiController],
    providers: [AiService],
    exports: [AiService],
    imports: [
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
                maxSockets: 100,
                maxFreeSockets: 10
            })
        })
    ]
})
export class AiModule {}

