import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { WorkService } from '../services/work.service';
import { HealthService } from '../services/health.service';
import { FinanceService } from '../services/finance.service';
import { LearningService } from '../services/learning.service';
import { AiService } from '../services/ai.service';

declare var Chart: any;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  @ViewChild('aiModalChart') aiModalChartRef!: ElementRef;
  aiModalChartInst: any = null;

  summary_work: any = { focused_hours: 0, tasks_completed: 0 };
  summary_health: any = { total_workouts: 0, avg_sleep: 0, avg_water: 0 };
  summary_finance: any = { total_income: 0, total_expense: 0 };
  
  recentActivity: any[] = [];
  aiInsightText: string = "Summarizing today's performance...";
  
  showAiModal = false;
  aiInsightObj: any = null;

  constructor(
    private workService: WorkService,
    private healthService: HealthService,
    private financeService: FinanceService,
    private learningService: LearningService,
    private aiService: AiService
  ) {}

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData() {
    this.workService.getWeeklySummary().subscribe(res => this.summary_work = res || this.summary_work);
    this.healthService.getWeeklySummary().subscribe(res => this.summary_health = res || this.summary_health);
    this.financeService.getMonthlySummary().subscribe(res => this.summary_finance = res || this.summary_finance);

    // Fetch AI Insight JSON Parse wrapper
    this.aiService.getDailyInsight().subscribe({
      next: (res: any) => { 
        if (res.insight) {
          try {
            let raw = res.insight;
            // Clean markdown wrappers if gemini defaults to it
            if (raw.includes('```json')) raw = raw.split('```json')[1].split('```')[0];
            else if (raw.includes('```')) raw = raw.split('```')[1].split('```')[0];
            
            this.aiInsightObj = JSON.parse(raw);
            this.aiInsightText = this.aiInsightObj.analysis || 'Daily Growth Context generated successfully.';
          } catch(e) {
            this.aiInsightText = res.insight;
            this.aiInsightObj = { analysis: res.insight, pros: [], cons: [], ai_score_estimation: 0 };
          }
        } else {
          this.aiInsightText = 'No activity logged today.';
        }
      },
      error: () => { this.aiInsightText = 'Error generating Daily Insight. Make sure GEMINI_API_KEY is configured correctly.'; }
    });

    // Build Recent Activity Feed manually
    this.recentActivity = [];
    this.workService.getSessions().subscribe((res: any[]) => {
      res.slice(0, 2).forEach(s => this.recentActivity.push({ icon: '💼', type: 'Work Session', title: s.project, time: s.date }));
      this.sortActivity();
    });
    this.healthService.getWorkouts().subscribe((res: any[]) => {
      res.slice(0, 2).forEach(w => this.recentActivity.push({ icon: '🏋️', type: 'Workout', title: w.type, time: w.date }));
      this.sortActivity();
    });
    this.financeService.getTransactions().subscribe((res: any[]) => {
      res.slice(0, 2).forEach(t => this.recentActivity.push({ icon: '💸', type: t.type === 'income' ? 'Income' : 'Expense', title: t.category, time: t.date }));
      this.sortActivity();
    });
    this.learningService.getSessions().subscribe((res: any[]) => {
      res.slice(0, 2).forEach(s => this.recentActivity.push({ icon: '📚', type: 'Study Session', title: s.subject, time: s.date }));
      this.sortActivity();
    });
  }

  sortActivity() {
    this.recentActivity.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    if (this.recentActivity.length > 5) {
      this.recentActivity = this.recentActivity.slice(0, 5);
    }
  }

  openAiModal() {
    this.showAiModal = true;
    setTimeout(() => this.renderAiChart(), 150);
  }

  closeAiModal() {
    this.showAiModal = false;
  }

  aiMessages: {role: 'user'|'ai', text: string}[] = [];
  aiQuestion: string = '';
  isAiTyping = false;

  askAi() {
    if (!this.aiQuestion.trim() || this.isAiTyping) return;
    const msg = this.aiQuestion;
    this.aiMessages.push({ role: 'user', text: msg });
    this.aiQuestion = '';
    this.isAiTyping = true;
    
    this.aiService.askQuestion(msg).subscribe({
      next: (res) => {
        this.aiMessages.push({ role: 'ai', text: res.answer });
        this.isAiTyping = false;
      },
      error: () => {
        this.aiMessages.push({ role: 'ai', text: 'Error connecting to Gemini. Please try again.' });
        this.isAiTyping = false;
      }
    });
  }

  renderAiChart() {
    if (!this.aiModalChartRef) return;
    if (this.aiModalChartInst) this.aiModalChartInst.destroy();
    
    // Calculate synthetic boundaries for AI chart visual mapping
    const health = (this.summary_health?.total_workouts || 0) * 20;
    const work = (parseFloat(this.summary_work?.focused_hours) || 0) * 10;
    const fin = (parseFloat(this.summary_finance?.total_income) || 0) > 0 ? 80 : 30;

    Chart.defaults.color = "rgba(255, 255, 255, 0.7)";
    Chart.defaults.font.family = "'DM Sans', sans-serif";

    this.aiModalChartInst = new Chart(this.aiModalChartRef.nativeElement, {
      type: 'polarArea',
      data: {
        labels: ['Study / Learning', 'Physical Health', 'Work Focus', 'Financial Power'],
        datasets: [{
          data: [Math.min(100, 60), Math.min(100, health || 20), Math.min(100, work || 20), Math.min(100, fin)],
          backgroundColor: ['rgba(99,130,255,0.6)', 'rgba(52,211,153,0.6)', 'rgba(167,139,250,0.6)', 'rgba(251,191,36,0.6)'],
          borderWidth: 0
        }]
      },
      options: { 
        scales: { r: { ticks: { display: false }, grid: { color: 'rgba(255,255,255,0.1)' } } }, 
        plugins: { legend: { position: 'bottom' } }, 
        maintainAspectRatio: false 
      }
    });
  }
}
