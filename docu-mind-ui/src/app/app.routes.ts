import { Routes } from '@angular/router';

import { DashboardComponent } from './components/dashboard.component/dashboard.component';
import { UploadDocumentComponent } from './components/upload.document.component/upload.document.component';
import { QnaComponent } from './components/qna.component/qna.component';
import { DocumentViewerComponent } from './components/document.viewer.component/document.viewer.component';
import { RegisterUserComponent } from './components/register.user.component/register.user.component';
import { LoginUserComponent } from './components/login.user.component/login.user.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  // Default route → Dashboard
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

  // Dashboard
  { path: 'dashboard', component: DashboardComponent ,canActivate: [authGuard]},

  // Document
  { path: 'upload', component: UploadDocumentComponent ,canActivate: [authGuard]},
  { path: 'viewer', component: DocumentViewerComponent ,canActivate: [authGuard]},

  // Q&A
  { path: 'qna', component: QnaComponent ,canActivate: [authGuard]},

  // Auth
  { path: 'register', component: RegisterUserComponent },
  { path: 'login', component: LoginUserComponent },

  // Wildcard → redirect to dashboard
  { path: '**', redirectTo: 'dashboard' },
];
