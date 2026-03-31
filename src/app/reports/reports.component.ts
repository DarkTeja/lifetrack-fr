import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { WorkService } from '../services/work.service';
import { HealthService } from '../services/health.service';
import { FinanceService } from '../services/finance.service';
import { LearningService } from '../services/learning.service';

declare var Chart: any;

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {
  @ViewChild('radarChart') radarChartRef!: ElementRef;
  @ViewChild('workChart') workChartRef!: ElementRef;
  @ViewChild('healthChart') healthChartRef!: ElementRef;
  @ViewChild('financeChart') financeChartRef!: ElementRef;

  // Summaries
  sWork: any; sHealth: any; sFinance: any; sLearning: any;
  lifeScore = 0;
  
  // Specific scores
  scoreLearning = 0; scoreHealth = 0; scoreWork = 0; scoreFinance = 0;

  constructor(
    private workService: WorkService,
    private healthService: HealthService,
    private financeService: FinanceService,
    private learningService: LearningService
  ) {}

  ngOnInit(): void {
    let loaded = 0;
    const checkRender = () => { loaded++; if(loaded === 4) this.calculateScoreAndRender(); };
    
    this.workService.getWeeklySummary().subscribe(res => { this.sWork = res; checkRender(); });
    this.healthService.getWeeklySummary().subscribe(res => { this.sHealth = res; checkRender(); });
    this.financeService.getMonthlySummary().subscribe(res => { this.sFinance = res; checkRender(); });
    this.learningService.getSessions().subscribe(res => {
      let totalMins = 0;
      res.forEach((r:any) => totalMins += r.duration_mins || 0);
      this.sLearning = { total_mins: totalMins };
      checkRender();
    });
  }

  calculateScoreAndRender() {
    // 1. Learning (Max 25): (Hours / 10 target) * 25
    const learnHours = parseFloat(this.sLearning?.total_mins || 0) / 60;
    this.scoreLearning = Math.min(25, (learnHours / 10) * 25);

    // 2. Health (Max 25): Workouts / 3 target + Sleep / 8 target
    const workouts = parseFloat(this.sHealth?.total_workouts || 0);
    const avgSleep = parseFloat(this.sHealth?.avg_sleep || 0);
    const wScore = Math.min(1, workouts / 3);
    const sScore = Math.min(1, avgSleep / 8);
    this.scoreHealth = ((wScore + sScore) / 2) * 25;

    // 3. Work (Max 25): Focused / 20 target hours + Tasks / 10 target
    const focused = parseFloat(this.sWork?.focused_hours || 0);
    const tasks = parseFloat(this.sWork?.tasks_completed || 0);
    const fScore = Math.min(1, focused / 20);
    const tScore = Math.min(1, tasks / 10);
    this.scoreWork = ((fScore + tScore) / 2) * 25;

    // 4. Finance (Max 25): Net balance calculation - if expense > income, drops.
    const income = parseFloat(this.sFinance?.total_income || 0);
    const expense = parseFloat(this.sFinance?.total_expense || 0);
    let finRatio = 0;
    if (income > 0 || expense > 0) {
      if (income >= expense) finRatio = 1;
      else finRatio = income / expense;
    }
    this.scoreFinance = finRatio * 25;

    this.lifeScore = Math.round(this.scoreLearning + this.scoreHealth + this.scoreWork + this.scoreFinance);
    
    setTimeout(() => this.renderCharts(), 150);
  }

  renderCharts() {
    Chart.defaults.color = "rgba(255, 255, 255, 0.7)";
    Chart.defaults.font.family = "'DM Sans', sans-serif";

    // 1. Radar
    new Chart(this.radarChartRef.nativeElement, {
      type: 'radar',
      data: {
        labels: ['Learning', 'Health', 'Work', 'Finance'],
        datasets: [{
          label: 'Area Score',
          data: [this.scoreLearning, this.scoreHealth, this.scoreWork, this.scoreFinance],
          backgroundColor: 'rgba(99, 130, 255, 0.4)',
          borderColor: 'rgba(99, 130, 255, 1)',
          pointBackgroundColor: 'rgba(255, 255, 255, 1)',
        }]
      },
      options: { 
        scales: { 
          r: { min: 0, max: 25, grid: { color: 'rgba(255, 255, 255, 0.1)' }, angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
               pointLabels: { color: '#fff' }, ticks: { display: false } }
        },
        plugins: { legend: { display: false } },
        maintainAspectRatio: false
      }
    });

    // 2. Work Bar
    new Chart(this.workChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels: ['Focused (hrs)', 'Tasks (count)'],
        datasets: [{
          label: 'Metric Volume',
          data: [parseFloat(this.sWork?.focused_hours || 0), parseFloat(this.sWork?.tasks_completed || 0)],
          backgroundColor: ['#8b5cf6', '#a78bfa'],
          borderRadius: 8
        }]
      },
      options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' } }, x: { grid: { display: false } } }, maintainAspectRatio: false }
    });

    // 3. Finance Pie
    new Chart(this.financeChartRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Income', 'Expense'],
        datasets: [{
          data: [parseFloat(this.sFinance?.total_income || 0), parseFloat(this.sFinance?.total_expense || 0)],
          backgroundColor: ['#34d399', '#ef4444'],
          borderWidth: 0
        }]
      },
      options: { cutout: '75%', plugins: { legend: { position: 'bottom' } }, maintainAspectRatio: false }
    });
    
    // 4. Health Bar
    new Chart(this.healthChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels: ['Sleep Avg (h)', 'Workouts'],
        datasets: [{
          label: 'Health Stats',
          data: [parseFloat(this.sHealth?.avg_sleep || 0), parseFloat(this.sHealth?.total_workouts || 0)],
          backgroundColor: ['#3b82f6', '#60a5fa'],
          borderRadius: 8
        }]
      },
      options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' } }, x: { grid: { display: false } } }, maintainAspectRatio: false }
    });
  }
}
