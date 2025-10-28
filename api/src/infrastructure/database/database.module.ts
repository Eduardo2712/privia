import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: "postgres",
                host: configService.get<string>("DB_HOST"),
                port: +configService.get<string>("DB_PORT", "5432"),
                username: configService.get<string>("DB_USER"),
                password: configService.get<string>("DB_PASS"),
                database: configService.get<string>("DB_NAME"),
                entities: [__dirname + "/../../**/*.entity.{js,ts}"],
                migrationsTableName: "migrations_typeorm",
                migrations: ["dist/migrations/*.js"],
                synchronize: true,
                autoLoadEntities: true
            })
        })
    ],
    exports: [TypeOrmModule]
})
export class DatabaseModule {}

