import { Module } from "@nestjs/common";
import { UnitOfWorkService } from "./unity-of-work.service";
import { TransporterService } from "./transporter.service";

@Module({
    providers: [UnitOfWorkService, TransporterService],
    exports: [UnitOfWorkService, TransporterService]
})
export class CommonModule {}

