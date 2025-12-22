import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { DatabaseModule } from "./infrastructure/database/database.module";
import { ScheduleModule } from "@nestjs/schedule";
import { BullModule } from "@nestjs/bullmq";
import { CacheModule } from "@nestjs/cache-manager";
import { AuthGuard } from "./common/guards/auth.guard";
import { APP_GUARD } from "@nestjs/core";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { CommonModule } from "./common/common.module";
import { UserModule } from "./modules/user/user.module";
import { AuthModule } from "./modules/auth/auth.module";
import { AiModule } from "./modules/ai/ai.module";
import { FileModule } from "./modules/file/file.module";
import { QdrantModule } from "./modules/qdrant/qdrant.module";
import { SocketModule } from "./modules/socket/socket.module";
import { MessageModule } from "./modules/message/message.module";

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true, envFilePath: ".env" }),
        EventEmitterModule.forRoot({
            wildcard: false,
            delimiter: ".",
            newListener: false,
            removeListener: false,
            maxListeners: 10,
            verboseMemoryLeak: false,
            ignoreErrors: false
        }),
        CacheModule.register({ isGlobal: true, ttl: 300 }),
        BullModule.forRoot({
            connection: {
                host: process.env.REDIS_HOST,
                port: Number(process.env.REDIS_PORT),
                maxRetriesPerRequest: null,
                retryStrategy: (times) => {
                    const delay = Math.min(times * 50, 2000);

                    return delay;
                },
                connectTimeout: 30000,
                enableReadyCheck: false,
                enableOfflineQueue: false,
                lazyConnect: false
            }
        }),
        ScheduleModule.forRoot(),
        ThrottlerModule.forRoot({
            throttlers: [
                {
                    ttl: 60,
                    limit: 10
                }
            ]
        }),
        DatabaseModule,
        CommonModule,
        UserModule,
        AuthModule,
        AiModule,
        FileModule,
        QdrantModule,
        SocketModule,
        MessageModule
    ],
    controllers: [],
    providers: [
        {
            provide: APP_GUARD,
            useClass: AuthGuard
        }
    ]
})
export class AppModule {}

