import { Body, Controller, Get, HttpCode, HttpStatus, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/signIn.dto';
import { AuthGuard } from './auth.guard';


@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @HttpCode(HttpStatus.OK)
    @Post('token')
    async signIn(@Body() signInDto: SignInDto): Promise<{
        payload: { sub: number; username: string; roleId: number };
        access_token: string;
        refresh_token: string;
    }> {
        return this.authService.signIn(signInDto.username, signInDto.password);
    }

    @HttpCode(HttpStatus.OK)
    @Post('refresh_token')
    async refresh(@Body('refresh_token') refreshToken: string): Promise<{ access_token: string }> {
        return this.authService.refreshToken(refreshToken);
    }

    @HttpCode(HttpStatus.OK)
    @Post('logout')
    async signOut(@Body('refresh_token') refreshToken: string): Promise<{ message: string }> {
        return this.authService.signOut(refreshToken);
    }

    @UseGuards(AuthGuard)
    @Get('profile')
    getProfile(@Request() req: any): any {
        return req.user;
    }
}