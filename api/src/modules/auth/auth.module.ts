import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { UserModule } from "../user/user.module";
import { ForgotPasswordEntity } from "./repositories/forgot-password.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ForgotPasswordRepository } from "./repositories/forgot-password.repository";
import { UnitOfWorkService } from "../../common/unity-of-work.service";
import { jwtExpiresInSeconds } from "../../common/utils/config.util";

@Module({
    imports: [
        TypeOrmModule.forFeature([ForgotPasswordEntity]),
        PassportModule,
        UserModule,
        JwtModule.registerAsync({
            global: true,
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get<string>("JWT_SECRET"),
                signOptions: { expiresIn: jwtExpiresInSeconds }
            })
        })
    ],
    controllers: [AuthController],
    providers: [AuthService, ForgotPasswordRepository, UnitOfWorkService],
    exports: [AuthService, JwtModule, PassportModule]
})
export class AuthModule {}

