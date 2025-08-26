import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class QnaService {

  private readonly API_URL = environment.apiBaseUrl;

  constructor(private http: HttpClient) { }

  sendQuestion(user_id: string, question: string): Observable<{ answer: string }> {

    //  user_id: number; question: string
    const payload = { "user_id": parseInt(user_id), "question": question };
    return this.http.post<{ answer: string }>(`${this.API_URL}/documents/qna`, payload).pipe(
      map((response:any) => {
        return ({
          answer: response['data'].answer || 'No answer provided by the server.'
        });
      }),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred while processing your request.';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Server error: ${error.status} - ${error.message}`;
      if (error.error?.message) {
        errorMessage = error.error.message;
      }
    }
    return throwError(() => new Error(errorMessage));
  }
}
