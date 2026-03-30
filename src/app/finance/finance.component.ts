import { Component, OnInit } from '@angular/core';
import { FinanceService } from '../services/finance.service';

@Component({
  selector: 'app-finance',
  templateUrl: './finance.component.html',
  styleUrls: ['./finance.component.css']
})
export class FinanceComponent implements OnInit {
  transactions: any[] = [];
  budgets: any[] = [];
  summary: any = { total_income: 0, total_expense: 0 };

  // Transaction Model
  tType = 'expense'; tAmount = null; tCategory = ''; tDate = ''; tNote = '';
  // Budget Model
  bCategory = ''; bLimit = null;

  toastMessage = ''; showToastMsg = false;

  constructor(private financeService: FinanceService) {}

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData() {
    this.financeService.getTransactions().subscribe(res => this.transactions = res);
    this.financeService.getBudgets().subscribe(res => this.budgets = res);
    this.financeService.getMonthlySummary().subscribe(res => this.summary = res || this.summary);
  }

  showToast(msg: string) {
    this.toastMessage = msg; this.showToastMsg = true;
    setTimeout(() => this.showToastMsg = false, 3000);
  }

  submitTransaction() {
    if (!this.tType || !this.tAmount || !this.tCategory || !this.tDate) {
      this.showToast('Fill required fields'); return;
    }
    this.financeService.addTransaction({
      type: this.tType, amount: this.tAmount, category: this.tCategory, date: this.tDate, note: this.tNote
    }).subscribe({
      next: () => { this.showToast('Transaction logged!'); this.fetchData(); this.clearTx(); },
      error: () => this.showToast('Error logging transaction')
    });
  }

  submitBudget() {
    if (!this.bCategory || !this.bLimit) {
      this.showToast('Fill required fields'); return;
    }
    const currentMonth = new Date().toISOString().substring(0, 7); // Generates YYYY-MM format
    this.financeService.setBudget({
      category: this.bCategory, monthly_limit: this.bLimit, month: currentMonth
    }).subscribe({
      next: () => { this.showToast('Budget saved!'); this.fetchData(); this.clearBudget(); },
      error: () => this.showToast('Error saving budget')
    });
  }

  deleteTransaction(id: number) {
    this.financeService.deleteTransaction(id).subscribe({
      next: () => { this.showToast('Transaction deleted'); this.fetchData(); },
      error: () => this.showToast('Failed to delete transaction')
    });
  }

  clearTx() { this.tAmount = null; this.tCategory = ''; this.tDate = ''; this.tNote = ''; }
  clearBudget() { this.bCategory = ''; this.bLimit = null; }
  
  getBudgetSpent(category: string) {
    const expenses = this.transactions.filter(t => t.type === 'expense' && t.category === category);
    return expenses.reduce((acc, t) => acc + Number(t.amount), 0);
  }

  getBudgetPercentage(category: string, limit: number) {
    const spent = this.getBudgetSpent(category);
    if (!limit) return 0;
    const res = (spent / limit) * 100;
    return res > 100 ? 100 : res;
  }
}
