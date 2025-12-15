import { Body, Controller, Delete, HttpCode, HttpStatus, Patch, Post } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { Public } from "../../common/decorators/is-public.decorator";
import { GetUser } from "../../common/decorators/get-user.decorator";
import { LoggedUserInterface } from "../../common/interfaces/jwt.interface";
import { UserService } from "./user.service";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";

@ApiTags("user")
@Controller("user")
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Public()
    @Post()
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({ type: CreateUserDto })
    async create(@Body() createUserDto: CreateUserDto): Promise<void> {
        return this.userService.createByController(createUserDto);
    }

    @Patch()
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({ type: UpdateUserDto })
    async update(@GetUser() user: LoggedUserInterface, @Body() updateUserDto: UpdateUserDto): Promise<void> {
        return this.userService.updateByController(user.id, updateUserDto);
    }

    @Delete()
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({ type: void 0 })
    async delete(@GetUser() user: LoggedUserInterface): Promise<void> {
        return this.userService.deleteByController(user.id);
    }
}

