import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WorkService {
  constructor(private api: ApiService, private auth: AuthService) { }

  private get userId() { return this.auth.getUserId(); }

  logSession(data: any): Observable<any> {
    return this.api.post('work/session', { user_id: this.userId, ...data });
  }
  getSessions(): Observable<any> {
    return this.api.get(`work/sessions/${this.userId}`);
  }

  addTask(data: any): Observable<any> {
    return this.api.post('work/task', { user_id: this.userId, ...data });
  }
  getTasks(): Observable<any> {
    return this.api.get(`work/tasks/${this.userId}`);
  }
  updateTaskStatus(id: number, status: string): Observable<any> {
    return this.api.put(`work/task/${id}`, { status });
  }
  deleteTask(id: number): Observable<any> {
    return this.api.delete(`work/task/${id}`);
  }

  getWeeklySummary(): Observable<any> {
    return this.api.get(`work/summary/weekly/${this.userId}`);
  }
}
