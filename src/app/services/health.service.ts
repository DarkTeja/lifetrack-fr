import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HealthService {
  constructor(private api: ApiService, private auth: AuthService) { }

  private get userId() { return this.auth.getUserId(); }

  // Workouts
  logWorkout(data: any): Observable<any> {
    return this.api.post('health/workout', { user_id: this.userId, ...data });
  }
  getWorkouts(): Observable<any> {
    return this.api.get(`health/workouts/${this.userId}`);
  }

  // Sleep
  logSleep(data: any): Observable<any> {
    return this.api.post('health/sleep', { user_id: this.userId, ...data });
  }
  getSleepLogs(): Observable<any> {
    return this.api.get(`health/sleep/${this.userId}`);
  }

  // Water
  logWater(data: any): Observable<any> {
    return this.api.post('health/water', { user_id: this.userId, ...data });
  }
  getWaterLogs(): Observable<any> {
    return this.api.get(`health/water/${this.userId}`);
  }

  // Summary
  getWeeklySummary(): Observable<any> {
    return this.api.get(`health/summary/weekly/${this.userId}`);
  }
}
