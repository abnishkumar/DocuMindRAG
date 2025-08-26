import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';
import { DocumentDto, UploadResponse } from '../models/document.model';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class DocumentService {

  private readonly API_URL = environment.apiBaseUrl;

  constructor(private http: HttpClient) { }

  private fileToBase64(file: File): Observable<string> {
    return new Observable<string>((observer) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1]; // remove data URI prefix
        observer.next(base64);
        observer.complete();
      };
      reader.onerror = (err) => observer.error(err);
      reader.readAsDataURL(file);
    });
  }
  uploadDocument(file: File): Observable<any> {
    let createdBy = JSON.parse(localStorage.getItem('user_data') || '{}');
    createdBy = createdBy['username']
    return this.fileToBase64(file).pipe(
      switchMap(base64Data => {
        const body: DocumentDto = {
          title: file.name.split('.').slice(0, -1).join('.') || file.name, // filename without extension
          mimeType: file.type,
          extension: file.name.split('.').pop() || '',
          base64Data,
          created_by: createdBy, // you can get from logged-in user context
          updatedAt: new Date().toISOString(),
        };

        return this.http.post(`${this.API_URL}/documents/upload`, body);
      })
    );
  }

  getDocuments(username: any, roleId: any): Observable<Document[]> {
    if (roleId == 1) {
      return this.http.get<Document[]>(`${this.API_URL}/documents`);
    }
    return this.http.get<Document[]>(`${this.API_URL}/documents/user/${username}`);
  }
  getDocumentsByUserId(userId: string): Observable<Document[]> {
    return this.http.get<Document[]>(`${this.API_URL}/documents/user/${userId}`);
  }

  getDocumentById(id: string): Observable<Document> {
    return this.http.get<Document>(`${this.API_URL}/documents/${id}`);
  }

  deleteDocument(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/documents/${id}`);
  }

  downloadDocument(id: number): Observable<Blob> {
    return this.http.get(`${this.API_URL}/documents/${id}/download`, {
      responseType: 'blob'
    });
  }

  ingestDocument(payload: { user_id: string | null; doc_ids: number[] }) {
    
    return this.http.post<any>(`${this.API_URL}/documents/ingest`, payload);
  }
}