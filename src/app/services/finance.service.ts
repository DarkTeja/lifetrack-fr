import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FinanceService {
  constructor(private api: ApiService, private auth: AuthService) { }

  private get userId() { return this.auth.getUserId(); }

  addTransaction(data: any): Observable<any> {
    return this.api.post('finance/transaction', { user_id: this.userId, ...data });
  }
  getTransactions(): Observable<any> {
    return this.api.get(`finance/transactions/${this.userId}`);
  }
  deleteTransaction(id: number): Observable<any> {
    return this.api.delete(`finance/transaction/${id}`);
  }

  setBudget(data: any): Observable<any> {
    return this.api.post('finance/budget', { user_id: this.userId, ...data });
  }
  getBudgets(): Observable<any> {
    return this.api.get(`finance/budgets/${this.userId}`);
  }

  getMonthlySummary(): Observable<any> {
    return this.api.get(`finance/summary/monthly/${this.userId}`);
  }
}
