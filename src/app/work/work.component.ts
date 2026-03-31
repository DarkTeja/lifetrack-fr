import { Component, OnInit } from '@angular/core';
import { WorkService } from '../services/work.service';

@Component({
  selector: 'app-work',
  templateUrl: './work.component.html',
  styleUrls: ['./work.component.css']
})
export class WorkComponent implements OnInit {
  sessions: any[] = [];
  tasks: any[] = [];
  summary: any = { focused_hours: 0, tasks_completed: 0 };

  // Session Model
  sProject = ''; sHours = null; sType = 'focused'; sDate = '';
  // Task Model
  tTitle = ''; tProject = ''; tPriority = 'High'; tDueDate = '';

  maxDate = new Date().toISOString().split('T')[0];


  toastMessage = ''; showToastMsg = false;

  constructor(private workService: WorkService) {}

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData() {
    this.workService.getSessions().subscribe(res => this.sessions = res);
    this.workService.getTasks().subscribe(res => this.tasks = res);
    this.workService.getWeeklySummary().subscribe(res => this.summary = res || this.summary);
  }

  showToast(msg: string) {
    this.toastMessage = msg; this.showToastMsg = true;
    setTimeout(() => this.showToastMsg = false, 3000);
  }

  submitSession() {
    if (!this.sProject || !this.sHours || !this.sDate) {
      this.showToast('Fill required fields'); return;
    }
    if (this.sDate > this.maxDate) {
      this.showToast('Cannot log future sessions'); return;
    }
    this.workService.logSession({ project: this.sProject, hours: this.sHours, type: this.sType, date: this.sDate })
      .subscribe({ 
        next: () => { this.showToast('Session logged!'); this.fetchData(); this.clearSession(); }, 
        error: () => this.showToast('Error') 
      });
  }

  submitTask() {
    if (!this.tTitle || !this.tProject || !this.tDueDate) {
      this.showToast('Fill required fields'); return;
    }
    this.workService.addTask({ title: this.tTitle, project: this.tProject, priority: this.tPriority, due_date: this.tDueDate })
      .subscribe({ 
        next: () => { this.showToast('Task added!'); this.fetchData(); this.clearTask(); }, 
        error: () => this.showToast('Error') 
      });
  }

  updateTaskStatus(id: number, status: string) {
    this.workService.updateTaskStatus(id, status).subscribe({
      next: () => this.fetchData(),
      error: () => this.showToast('Failed to update task')
    });
  }

  deleteTask(id: number) {
    this.workService.deleteTask(id).subscribe({
      next: () => this.fetchData(),
      error: () => this.showToast('Failed to delete task')
    });
  }

  clearSession() { this.sProject = ''; this.sHours = null; this.sType = 'focused'; this.sDate = ''; }
  clearTask() { this.tTitle = ''; this.tProject = ''; this.tPriority = 'High'; this.tDueDate = ''; }

  getTasksByStatus(status: string) {
    return this.tasks.filter(t => t.status === status);
  }
}
