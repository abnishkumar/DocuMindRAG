import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { DocumentService } from '../../services/document.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-upload.document.component',
  imports: [CommonModule, FormsModule],
  templateUrl: './upload.document.component.html',
  styleUrl: './upload.document.component.css'
})
export class UploadDocumentComponent {
  selectedFile: File | null = null;
  uploading = false;
  uploadProgress = 0;
  dragOver = false;
  success = '';
  error = '';

  constructor() { }
  private documentService: DocumentService = inject(DocumentService);
  private cd: ChangeDetectorRef = inject(ChangeDetectorRef);
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.dragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.selectedFile = files[0];
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  removeFile(): void {
    this.selectedFile = null;
    this.uploadProgress = 0;
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  uploadFile(): void {
    if (!this.selectedFile) return;

    this.uploading = true;
    this.uploadProgress = 0;
    this.error = '';
    this.success = '';

    // Simulate progress
    const progressInterval = setInterval(() => {
      this.uploadProgress += 10;
      if (this.uploadProgress >= 90) {
        clearInterval(progressInterval);
      }
    }, 200);

    this.documentService.uploadDocument(this.selectedFile).subscribe({
      next: (response: any) => {
        clearInterval(progressInterval);
        this.uploadProgress = 100;
        setTimeout(() => {
          this.uploading = false;
          this.success = 'Document uploaded successfully!';
          this.selectedFile = null;
          this.uploadProgress = 0;
           this.cd.detectChanges(); // force update
        }, 500);
      },
      error: (error: any) => {
        clearInterval(progressInterval);
        this.uploading = false;
        this.uploadProgress = 0;
        this.error = error.error?.message || 'Upload failed. Please try again.';
      }
    });
  }

  cancel(): void {
    this.selectedFile = null;
    this.uploadProgress = 0;
    this.error = '';
    this.success = '';
  }
}
