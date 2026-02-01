import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  private apiUrl = environment.apiUrl || 'http://localhost:3001/api';

  constructor(private http: HttpClient) {}

  // Get Authorization headers
  private getHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    });
  }

  // Token management
  setToken(token: string): void {
    localStorage.setItem('nextstep_token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('nextstep_token');
  }

  clearToken(): void {
    localStorage.removeItem('nextstep_token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Generic HTTP methods
  get<T>(endpoint: string): Observable<T> {
    return this.http
      .get<T>(`${this.apiUrl}${endpoint}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  post<T>(endpoint: string, data: any): Observable<T> {
    return this.http
      .post<T>(`${this.apiUrl}${endpoint}`, data, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  put<T>(endpoint: string, data: any): Observable<T> {
    return this.http
      .put<T>(`${this.apiUrl}${endpoint}`, data, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.http
      .delete<T>(`${this.apiUrl}${endpoint}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  // File upload
  uploadFile(endpoint: string, file: File, formData?: FormData): Observable<any> {
    const data = formData || new FormData();
    data.append('resume', file);

    const token = this.getToken();
    const headers = new HttpHeaders({
      ...(token && { Authorization: `Bearer ${token}` })
    });

    return this.http
      .post(`${this.apiUrl}${endpoint}`, data, { headers })
      .pipe(catchError(this.handleError));
  }

  // Error handler
  private handleError(error: any) {
    console.error('HTTP Error:', error);
    return throwError(() => ({
      message: error.error?.message || 'An error occurred',
      status: error.status
    }));
  }
}
