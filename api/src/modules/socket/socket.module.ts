import { Module } from "@nestjs/common";
import { SocketService } from "./socket.service";
import { SocketGateway } from "./socket.gateway";
import { AuthModule } from "../auth/auth.module";

@Module({
    providers: [SocketGateway, SocketService],
    exports: [SocketService],
    imports: [AuthModule]
})
export class SocketModule {}

