import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { HealthModule } from './health/health.module';
import { DocumentsModule } from './documents/documents.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { HttpModule } from '@nestjs/axios';
import configuration from './config/configuration';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [configuration]
    }),
    JwtModule,
    HttpModule,
    AuthModule,
    UsersModule,
    HealthModule,
    DocumentsModule,
    PrismaModule],
  controllers: [AppController,],
  providers: [AppService],
})
export class AppModule { }
