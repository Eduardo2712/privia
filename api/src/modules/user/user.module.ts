import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserRepository } from "./repositories/user.repository";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { UserEntity } from "./repositories/user.entity";
import { CommonModule } from "../../common/common.module";

@Module({
    imports: [TypeOrmModule.forFeature([UserEntity]), CommonModule],
    controllers: [UserController],
    providers: [UserRepository, UserService],
    exports: [UserService]
})
export class UserModule {}

