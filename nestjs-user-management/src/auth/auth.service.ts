import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    private readonly tokenBlacklist = new Set<string>();

    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) { }

    async signIn(email: string, password: string): Promise<{
        payload: { sub: number; username: string; roleId: any };
        access_token: string;
        refresh_token: string;
    }> {
        console.log("email= >",email);
        const user = await this.usersService.findByEmail(email);
        if (!user || !user.password_hash) {
            throw new UnauthorizedException('Invalid username or password');
        }

        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) {
            throw new UnauthorizedException('Invalid username or password');
        }

        const payload = { sub: user.id, username: user.email, roleId: user.role_id };
        const access_token = await this.jwtService.signAsync(payload, {
            secret: this.configService.get<string>('app.jwtSecret'),
            expiresIn: '1h',
        });
        const refresh_token = await this.jwtService.signAsync(payload, {
            secret: this.configService.get<string>('app.jwtRefreshSecret'),
            expiresIn: '7d',
        });

        return { payload, access_token, refresh_token };
    }

    async signOut(token: string): Promise<{ message: string }> {
        this.tokenBlacklist.add(token);
        return { message: 'Signed out successfully' };
    }

    async refreshToken(refreshToken: string): Promise<{ access_token: string }> {
        try {
            const payload = await this.jwtService.verifyAsync(refreshToken, {
                secret: this.configService.get<string>('app.jwtRefreshSecret'),
            });

            const newAccessToken = await this.jwtService.signAsync(
                { sub: payload.sub, username: payload.username, roleId: payload.roleId },
                {
                    secret: this.configService.get<string>('app.jwtSecret'),
                    expiresIn: '1h',
                },
            );

            return { access_token: newAccessToken };
        } catch {
            throw new ForbiddenException('Invalid refresh token');
        }
    }

    isTokenBlacklisted(token: string): boolean {
        return this.tokenBlacklist.has(token);
    }
}