import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
// import axios from 'axios';
import { DocumentDto } from './dto/document.dto';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class DocumentsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly configService: ConfigService,
        private readonly httpService: HttpService
    ) { }

    async create(dto: DocumentDto) {
        const buffer = Buffer.from(dto.base64Data, 'base64');
        return this.prisma.documents.create({
            data: {
                title: dto.title,
                mimeType: dto.mimeType,
                extension: dto.extension,
                data: buffer,
                ingestionStatus: 'NEW',
                created_by: dto.created_by,
                updatedAt: new Date().toISOString(),
            },
        });
    }

    async findAll() {
        return this.prisma.documents.findMany({
            select: {
                id: true,
                title: true,
                mimeType: true,
                extension: true,
                ingestionStatus: true,
                createdAt: true,
            },
        });
    }

    async findByUser(email: string) {
        return this.prisma.documents.findMany({
            where: { created_by: email },
            select: {
                id: true,
                title: true,
                mimeType: true,
                extension: true,
                ingestionStatus: true,
                createdAt: true,
            },
        });
    }

    async findOne(id: number) {
        const doc = await this.prisma.documents.findUnique({ where: { id } });
        if (!doc) {
            throw new NotFoundException(`Document with id ${id} not found`);
        }
        return doc;
    }

    async updateStatus(id: number, status: string) {
        await this.findOne(id); // Ensure document exists
        return this.prisma.documents.update({
            where: { id },
            data: { ingestionStatus: status },
        });
    }

    async download(id: number) {
        return this.findOne(id);
    }

    async ingestDocument(payload: any) {
        const userId = parseInt(payload.user_id);
        const doc_ids = payload.doc_ids;
        console.log(doc_ids);
        const apiUrl = `${this.configService.get<string>('app.pyIngestUrl')}/ingest`;
        const apiKey = this.configService.get<string>('app.pyIngestApiKey');
        console.log(apiUrl);
        console.log(apiKey);
        try {
            console.log(apiUrl);
            this.httpService.axiosRef.defaults.headers.common['X-Api-Key'] = apiKey;
            this.httpService.axiosRef.defaults.headers.common['X-User-Id'] = userId;
            const response = await this.httpService.axiosRef.post(apiUrl, { doc_ids });
            // console.log(response.data);
            // console.log(response.data);
            return response.data;
        } catch (error) {
            console.error(error);
        }
    }

    async qna(payload:any) {

        const apiUrl = `${this.configService.get<string>('app.pyIngestUrl')}/qna`;
        const apiKey = this.configService.get<string>('app.pyIngestApiKey');

        try {
            const userId = parseInt(payload.user_id);
            console.log(userId);
            const question = payload.question;
            this.httpService.axiosRef.defaults.headers.common['X-Api-Key'] = apiKey;
            this.httpService.axiosRef.defaults.headers.common['X-User-Id'] = userId;
            const response = await this.httpService.axiosRef.post(apiUrl, { "query": question });
            console.log(response['data']);
            return response['data']
        } catch (error) {
            console.error(error);
            throw new InternalServerErrorException('Failed to process Q&A request');
        }
    }
}