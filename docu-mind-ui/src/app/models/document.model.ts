export interface Document {
  id: number;
  title: string;
  mimeType: string;
  extension: string;
  ingestionStatus: string;
  createdAt: Date;
  updatedAt: Date;
}

export declare class DocumentDto {
  title: string;
  mimeType: string;
  extension: string;
  base64Data: string;
  created_by: string;
  updatedAt: string;
}

export interface UploadResponse {
  status: string;
  message: string;
}