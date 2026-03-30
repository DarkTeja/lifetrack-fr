import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LearningService {
  constructor(private api: ApiService, private auth: AuthService) { }

  private get userId() { return this.auth.getUserId(); }

  logSession(data: any): Observable<any> {
    return this.api.post('learning/session', { user_id: this.userId, ...data });
  }
  getSessions(): Observable<any> {
    return this.api.get(`learning/sessions/${this.userId}`);
  }
  deleteSession(id: number): Observable<any> {
    return this.api.delete(`learning/session/${id}`);
  }
  
  addGoal(data: any): Observable<any> {
    return this.api.post('learning/goal', { user_id: this.userId, ...data });
  }
  getGoals(): Observable<any> {
    return this.api.get(`learning/goals/${this.userId}`);
  }

  addScore(data: any): Observable<any> {
    return this.api.post('learning/score', { user_id: this.userId, ...data });
  }
  getScores(): Observable<any> {
    return this.api.get(`learning/scores/${this.userId}`);
  }

  getWeeklySummary(): Observable<any> {
    return this.api.get(`learning/summary/weekly/${this.userId}`);
  }
}
