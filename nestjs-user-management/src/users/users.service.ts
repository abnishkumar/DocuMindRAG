import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { userDto } from './dto/user.dto';

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) { }

    async register_user(user: userDto) {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        return this.prisma.users.create({
            data: {
                email: user.email,
                phone: user.phone || null,
                password_hash: hashedPassword,
                full_name: user.full_name,
                role_id: user.role_id,
            },
        });
    }

    async findAll() {
        return this.prisma.users.findMany({
            include: { roles: true },
        });
    }

    async findAllRoles() {
        return this.prisma.roles.findMany();
    }

    async findOne(id: number) {
        const user = await this.prisma.users.findUnique({
            where: { id },
            include: { roles: true },
        });
        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }

    async findByEmail(email: string) {
        console.log(email);
        const user = await this.prisma.users.findUnique({
            where: { email }, 
            include: { roles: true },
        });
        if (!user) {
            throw new NotFoundException(`User with email ${email} not found`);
        }
        return user;
    }

    async update(id: number, updateUserDto: Partial<{
        email: string;
        password: string;
        full_name: string;
        role_id: number;
    }>) {
        if (updateUserDto.password) {
            updateUserDto['password_hash'] = await bcrypt.hash(updateUserDto.password, 10);
            delete updateUserDto.password;
        }
        return this.prisma.users.update({
            where: { id },
            data: updateUserDto,
        });
    }

    async remove(id: number) {
        return this.prisma.users.delete({ where: { id } });
    }
}