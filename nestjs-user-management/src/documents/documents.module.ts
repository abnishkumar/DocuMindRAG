import { Module } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { HttpModule, HttpService } from '@nestjs/axios';

@Module({
  imports: [ConfigModule, AuthModule, HttpModule],
  providers: [DocumentsService, PrismaService],
  controllers: [DocumentsController],
  exports: [DocumentsService],
})
export class DocumentsModule { }