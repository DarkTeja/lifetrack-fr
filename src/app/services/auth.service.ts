import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) { }

  login(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, data, { responseType: 'text' });
  }

  googleLogin(token: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/google`, { token });
  }


  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data, { responseType: 'text' });
  }

  registerVerify(email: string, otp: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/register-verify`, { email, otp });
  }

  logout() {
    localStorage.removeItem('token');
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email }, { responseType: 'text' });
  }

  verifyOtp(email: string, otp: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/verify-otp`, { email, otp }, { responseType: 'text' });
  }

  resetPassword(email: string, otp: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, { email, otp, newPassword }, { responseType: 'text' });
  }

  getToken() {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getUserId(): number | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id || null;
    } catch(e) {
      return null;
    }
  }

  getUserName(): string {
    const token = this.getToken();
    if (!token) return 'User';
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return (payload.first_name || payload.last_name) 
        ? `${payload.first_name || ''} ${payload.last_name || ''}`.trim() 
        : payload.email.split('@')[0];
    } catch(e) {
      return 'User';
    }
  }

  updateProfile(id: number, first_name: string, last_name: string, email: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/profile`, { id, first_name, last_name, email });
  }

  updatePassword(id: number, currentPassword: string, newPassword: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/update-password`, { id, currentPassword, newPassword }, { responseType: 'text' });
  }
}
