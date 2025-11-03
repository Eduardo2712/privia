import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from "@nestjs/common";

@Injectable()
export class FileTypeValidationPipe implements PipeTransform {
    transform(value: Express.Multer.File, metadata: ArgumentMetadata) {
        if (!value) {
            throw new BadRequestException("Nenhum arquivo fornecido.");
        }

        const allowedTypes = ["image/jpeg", "image/png", "text/plain", "application/pdf"];

        if (!allowedTypes.includes(value.mimetype)) {
            throw new BadRequestException(`Tipo de arquivo não suportado: ${value.mimetype}`);
        }

        return value;
    }
}

