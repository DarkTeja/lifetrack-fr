import { Component, OnInit } from '@angular/core';
import { LearningService } from '../services/learning.service';

@Component({
  selector: 'app-learning',
  templateUrl: './learning.component.html',
  styleUrls: ['./learning.component.css']
})
export class LearningComponent implements OnInit {
  sessions: any[] = [];
  goals: any[] = [];
  scores: any[] = [];

  // Session Model
  sSubject = ''; sDuration = null; sDate = ''; sNotes = '';
  // Score Model
  scSubject = ''; scScore = null; scMax = null; scDate = '';
  // Goal Model
  gSubject = ''; gHours = null; gDeadline = '';

  toastMessage = '';
  showToastMsg = false;

  constructor(private learningService: LearningService) {}

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData() {
    this.learningService.getSessions().subscribe(res => {
      this.sessions = res;
      this.computeProgress();
    });
    this.learningService.getGoals().subscribe(res => {
      this.goals = res;
      this.computeProgress();
    });
    this.learningService.getScores().subscribe(res => this.scores = res);
  }

  computeProgress() {
    if (!this.sessions.length || !this.goals.length) return;
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay()); // Sunday
    weekStart.setHours(0,0,0,0);

    this.goals = this.goals.map(g => {
      const minsThisWeek = this.sessions
        .filter(s => s.subject?.toLowerCase() === g.subject?.toLowerCase() &&
                     new Date(s.date) >= weekStart)
        .reduce((sum: number, s: any) => sum + (s.duration_mins || 0), 0);
      const hoursThisWeek = minsThisWeek / 60;
      const pct = Math.min(100, Math.round((hoursThisWeek / (g.target_hours || 1)) * 100));
      return { ...g, progress: pct, hoursLogged: hoursThisWeek.toFixed(1) };
    });
  }

  showToast(msg: string) {
    this.toastMessage = msg;
    this.showToastMsg = true;
    setTimeout(() => this.showToastMsg = false, 3000);
  }

  submitSession() {
    if (!this.sSubject || !this.sDuration || !this.sDate) {
      this.showToast('Please fill required session fields'); return;
    }
    this.learningService.logSession({
      subject: this.sSubject, duration_mins: this.sDuration, date: this.sDate, notes: this.sNotes
    }).subscribe({
      next: (res) => { this.showToast('Session logged!'); this.fetchData(); this.clearSessionForm(); },
      error: () => this.showToast('Error logging session')
    });
  }

  submitScore() {
    if (!this.scSubject || !this.scScore || !this.scMax || !this.scDate) {
      this.showToast('Please fill required score fields'); return;
    }
    this.learningService.addScore({
      subject: this.scSubject, score: this.scScore, max_score: this.scMax, date: this.scDate
    }).subscribe({
      next: (res) => { this.showToast('Score recorded!'); this.fetchData(); this.clearScoreForm(); },
      error: () => this.showToast('Error recording score')
    });
  }

  submitGoal() {
    if (!this.gSubject || !this.gHours || !this.gDeadline) {
      this.showToast('Please fill required goal fields'); return;
    }
    this.learningService.addGoal({
      subject: this.gSubject, target_hours: this.gHours, deadline: this.gDeadline
    }).subscribe({
      next: (res) => { this.showToast('Goal created!'); this.fetchData(); this.clearGoalForm(); },
      error: () => this.showToast('Error creating goal')
    });
  }

  deleteSession(id: number) {
    this.learningService.deleteSession(id).subscribe({
      next: () => { this.showToast('Session deleted'); this.fetchData(); },
      error: () => this.showToast('Error deleting session')
    });
  }

  clearSessionForm() { this.sSubject = ''; this.sDuration = null; this.sDate = ''; this.sNotes = ''; }
  clearScoreForm() { this.scSubject = ''; this.scScore = null; this.scMax = null; this.scDate = ''; }
  clearGoalForm() { this.gSubject = ''; this.gHours = null; this.gDeadline = ''; }
}
