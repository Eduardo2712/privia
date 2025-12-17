import { ConflictException, Injectable } from "@nestjs/common";
import { UserRepository } from "./repositories/user.repository";
import { UserEntity } from "./repositories/user.entity";
import { LoggedUserInterface } from "../../common/interfaces/jwt.interface";
import { compareSyncValue, hashSyncValue } from "../../common/utils/functions.util";
import { CreateUserDto } from "./dto/create-user.dto";

@Injectable()
export class UserService {
    constructor(private readonly userRepository: UserRepository) {}

    public async createByController(createUserDto: CreateUserDto): Promise<void> {
        const verifyEmail = await this.userRepository.findOneByEmail(createUserDto.email);

        if (verifyEmail) {
            throw new ConflictException("Email já cadastrado");
        }

        await this.userRepository.create({
            ...createUserDto,
            password: await hashSyncValue(createUserDto.password)
        });
    }

    public async updateByController(id: number, data: Partial<UserEntity>): Promise<void> {
        await this.userRepository.update(id, data);
    }

    public async deleteByController(id: number): Promise<void> {
        await this.userRepository.delete(id);
    }

    public async delete(user: LoggedUserInterface): Promise<void> {
        await this.userRepository.delete(user.id);
    }

    public async findOneByEmail(email: string, ignoredId?: number): Promise<UserEntity | null> {
        return await this.userRepository.findOneByEmail(email, ignoredId);
    }

    public async findOneById(id: number): Promise<UserEntity | null> {
        return await this.userRepository.findOneById(id);
    }

    public async update(id: number, data: Partial<UserEntity>): Promise<void> {
        await this.userRepository.update(id, data);
    }

    public async validateUser(email: string, password: string): Promise<UserEntity | null> {
        const user = await this.findOneByEmail(email);

        const isValid = user && (await compareSyncValue(password, user.password));

        return isValid ? user : null;
    }
}

