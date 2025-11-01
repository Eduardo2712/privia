import { HttpException, HttpStatus, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { UnitOfWorkService } from "../../common/unity-of-work.service";
import { UserService } from "../user/user.service";
import { ForgotPasswordRepository } from "./entities/forgot-password.repository";
import { ForgotPasswordRequestDto } from "./dto/forgot-password-request.dto";
import { generateValidationCode } from "../../common/utils/functions.util";
import { LoginRequestDto } from "./dto/login-request.dto";
import { AuthInterface } from "./interfaces/auth.interface";
import { JWTUserInterface } from "../../common/interfaces/jwt.interface";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthService {
    constructor(
        private readonly forgotPasswordRepository: ForgotPasswordRepository,
        private readonly userService: UserService,
        private readonly unitOfWork: UnitOfWorkService,
        private readonly jwtService: JwtService
    ) {}

    public async forgotPassword(forgotPasswordRequestDto: ForgotPasswordRequestDto): Promise<void> {
        await this.unitOfWork.withTransaction(async () => {
            const user = await this.userService.findOneByEmail(forgotPasswordRequestDto.email);

            if (!user) {
                throw new NotFoundException("Usuário não encontrado");
            }

            const existing = await this.forgotPasswordRepository.findRecentForgotPasswordByUser(user.id);

            if (existing) {
                throw new HttpException("Aguarde antes de solicitar um novo código", HttpStatus.TOO_MANY_REQUESTS);
            }

            await this.forgotPasswordRepository.deleteByUser(user.id);

            const verificationCode = generateValidationCode();

            await this.forgotPasswordRepository.create({
                userId: user.id,
                code: verificationCode,
                user: user
            });
        });
    }

    public async login(loginRequestDto: LoginRequestDto): Promise<AuthInterface> {
        const data = await this.userService.validateUser(loginRequestDto.email, loginRequestDto.password);

        if (!data) {
            throw new UnauthorizedException("Email e/ou senha inválidos");
        }

        const user: AuthInterface["user"] = {
            email: data.email,
            name: data.name
        };

        const payload: JWTUserInterface = { sub: data.id };
        const token = await this.jwtService.signAsync(payload);

        return { token, user };
    }
}

