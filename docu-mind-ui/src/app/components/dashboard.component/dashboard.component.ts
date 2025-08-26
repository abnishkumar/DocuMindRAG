import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentService } from '../../services/document.service';
import { Router, NavigationEnd } from '@angular/router';
import { finalize, map, Subscription, timeout } from 'rxjs';
import { Document } from '../../models/document.model';
import { jsDocComment } from '@angular/compiler';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  documents: Document[] = [];
  loading = false;
  error: string | null = null;
  user_name: string | null = null;
  role_id: number | null = null;
  name: string | null = null;

  private documentService = inject(DocumentService);
  private cd: ChangeDetectorRef = inject(ChangeDetectorRef);
  private router = inject(Router);
  private routerSubscription: Subscription | null = null;

  ngOnInit(): void {
    let user_data = JSON.parse(localStorage.getItem('user_data') || '{}');
    this.user_name = user_data['username']
    if (this.user_name == null) {
      this.router.navigate(['/login']);
      return;
    }
    this.role_id = user_data['roleId']
    if (this.user_name) {
      this.name = this.user_name.split('@')[0];
    }
    if (this.user_name == null) {
      this.router.navigate(['/login']);
    }
    console.log('DashboardComponent ngOnInit called');
    this.getDocuments();
    this.routerSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd && event.urlAfterRedirects === '/documents') {
        console.log('NavigationEnd to /documents, fetching documents again');
        this.getDocuments();
      }
    });
  }

  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
  }

  getDocuments(): void {
    console.log('getDocuments called');
    this.loading = true;
    this.error = null;

    this.documentService.getDocuments(this.user_name, this.role_id)
      .pipe(
        timeout(1000),
        map(res => res ?? []),
        finalize(() => {
          setTimeout(() => {
            this.loading = false;
            this.cd.detectChanges(); // force update
          }, 2000);
        })
      )
      .subscribe({
        next: (res: any) => {
          console.log('Documents fetched:', res);
          this.documents = res;
        },
        error: (err) => {
          console.error('Error fetching documents:', err);
          this.error = 'Failed to fetch documents. Please try again.';
        }
      });
  }

  retryFetchDocuments(): void {
    console.log('Retrying getDocuments');
    this.getDocuments();
  }

  downloadDocument(event: any, docId: number): void {
    event.preventDefault();
    const documentItem = this.documents.find(doc => doc.id === docId);
    const fileName = documentItem?.title ?? `document_${docId}`;

    console.log(`Attempting to download document ID: ${docId}`);
    this.loading = true;
    this.error = null;

    this.documentService.downloadDocument(docId)
      .pipe(finalize(() => {
        this.loading = false;
        console.log('downloadDocument completed');
      }))
      .subscribe({
        next: (blob: Blob) => {
          console.log('Download successful');
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = fileName;
          a.click();
          window.URL.revokeObjectURL(url);
        },
        error: (err) => {
          console.error('Download error:', err);
          this.error = 'Failed to download document. Please try again.';
        }
      });
  }

  ingestDocument(docId: number): void {
    // event.preventDefault();
    const payload = {
      user_id: localStorage.getItem('user_id'),
      doc_ids: [docId]
    }
    this.documentService.ingestDocument(payload).subscribe(x => {
      console.log(x)
      this.cd.detectChanges();
    })
  }
}
