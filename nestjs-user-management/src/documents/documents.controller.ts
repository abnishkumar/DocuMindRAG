import {
    Body,
    Controller,
    Get,
    NotFoundException,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Res,
    InternalServerErrorException,
    UseGuards,
} from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { AuthGuard } from '../auth/auth.guard';

import { DocumentDto } from './dto/document.dto';

@Controller('documents')
@UseGuards(AuthGuard)
export class DocumentsController {
    constructor(
        private readonly documentService: DocumentsService
    ) { }

    @Post('upload')
    async create(@Body() dto: DocumentDto) {
        return this.documentService.create(dto);
    }

    @Post('ingest')
    async ingest(@Body() payload: any) {
        console.log(payload);
        return this.documentService.ingestDocument(payload);
    }

    @Post('qna')
    async qna(@Body() payload: { user_id: number; question: string }): Promise<any> {
        console.log(payload);
        return this.documentService.qna(payload);
    }

    @Get()
    async findAll() {
        return this.documentService.findAll();
    }

    @Get('user/:email')
    async findByUser(@Param('email') email: string) {
        return this.documentService.findByUser(email);
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.documentService.findOne(id);
    }

    @Patch(':id/status')
    async updateStatus(
        @Param('id', ParseIntPipe) id: number,
        @Body('status') status: string,
    ) {
        return this.documentService.updateStatus(id, status);
    }

    @Get(':id/download')
    async download(
        @Param('id', ParseIntPipe) id: number,
        @Res() res: any,
    ): Promise<void> {
        try {
            const doc = await this.documentService.findOne(id);
            if (!doc) {
                throw new NotFoundException(`Document with id ${id} not found`);
            }
            res.setHeader('Content-Type', doc.mimeType);
            res.setHeader('Content-Disposition', `attachment; filename="${doc.title}.${doc.extension}"`);
            res.send(doc.data);
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException(`Error downloading document with id ${id}`);
        }
    }
}