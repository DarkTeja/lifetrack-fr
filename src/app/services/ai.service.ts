import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AiService {
  constructor(private api: ApiService, private auth: AuthService) { }
  
  private get userId() { return this.auth.getUserId(); }

  getDailyInsight(): Observable<any> {
    return this.api.get(`ai/insight/daily/${this.userId}`);
  }

  askQuestion(question: string): Observable<any> {
    return this.api.post(`ai/chat/${this.userId}`, { question });
  }

  getStreak(): Observable<any> {
    return this.api.get(`ai/streak/${this.userId}`);
  }
}
