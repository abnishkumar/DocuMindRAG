import { Body, Controller, HttpCode, HttpStatus, Inject, Post } from '@nestjs/common';
import { userDto } from './dto/user.dto';
import { UsersService } from './users.service';
@Controller('users')
export class UsersController {
    constructor(private readonly userService: UsersService) { }

    @HttpCode(HttpStatus.OK)
    @Post('register')
    async register_user(@Body() user: userDto) {
        return await this.userService.register_user(user);
    }
}
