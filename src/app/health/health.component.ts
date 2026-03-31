import { Component, OnInit } from '@angular/core';
import { HealthService } from '../services/health.service';

@Component({
  selector: 'app-health',
  templateUrl: './health.component.html',
  styleUrls: ['./health.component.css']
})
export class HealthComponent implements OnInit {
  workouts: any[] = [];
  sleepLogs: any[] = [];
  waterLogs: any[] = [];
  summary: any = { total_workouts: 0, avg_sleep: 0, avg_water: 0 };

  // Models
  wType = ''; wDuration = null; wCalories = null; wDate = '';
  sHours = null; sQuality = null; sDate = '';
  waLitres = null; waDate = '';

  maxDate = new Date().toISOString().split('T')[0];


  toastMessage = '';
  showToastMsg = false;

  constructor(private healthService: HealthService) {}

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData() {
    this.healthService.getWorkouts().subscribe(res => this.workouts = res);
    this.healthService.getSleepLogs().subscribe(res => this.sleepLogs = res);
    this.healthService.getWaterLogs().subscribe(res => this.waterLogs = res);
    this.healthService.getWeeklySummary().subscribe(res => this.summary = res || this.summary);
  }

  showToast(msg: string) {
    this.toastMessage = msg; this.showToastMsg = true;
    setTimeout(() => this.showToastMsg = false, 3000);
  }

  submitWorkout() {
    if (!this.wType || !this.wDuration || !this.wDate) return this.showToast('Please fill required fields');
    if (this.wDate > this.maxDate) return this.showToast('Cannot log future workouts');
    this.healthService.logWorkout({ type: this.wType, duration_mins: this.wDuration, calories_burned: this.wCalories || 0, date: this.wDate })
      .subscribe({
        next: () => { this.showToast('Workout saved!'); this.fetchData(); this.clearWorkout(); },
        error: () => this.showToast('Error saving workout')
      });
  }

  submitSleep() {
    if (!this.sHours || !this.sQuality || !this.sDate) return this.showToast('Please fill required fields');
    if (this.sDate > this.maxDate) return this.showToast('Cannot log future sleep logs');
    this.healthService.logSleep({ hours_slept: this.sHours, quality: this.sQuality, date: this.sDate })
      .subscribe({
        next: () => { this.showToast('Sleep logged!'); this.fetchData(); this.clearSleep(); },
        error: () => this.showToast('Error logging sleep')
      });
  }

  submitWater() {
    if (!this.waLitres || !this.waDate) return this.showToast('Please fill required fields');
    if (this.waDate > this.maxDate) return this.showToast('Cannot log future water intake');
    this.healthService.logWater({ litres: this.waLitres, date: this.waDate })
      .subscribe({
        next: () => { this.showToast('Water logged!'); this.fetchData(); this.clearWater(); },
        error: () => this.showToast('Error logging water')
      });
  }

  clearWorkout() { this.wType = ''; this.wDuration = null; this.wCalories = null; this.wDate = ''; }
  clearSleep() { this.sHours = null; this.sQuality = null; this.sDate = ''; }
  clearWater() { this.waLitres = null; this.waDate = ''; }
}
