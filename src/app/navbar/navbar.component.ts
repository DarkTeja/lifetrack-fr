import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { AiService } from '../services/ai.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  isMobileOpen = false;
  userName = '';
  loggedToday = false;
  showLogoutConfirm = false;
  isDark = true;

  constructor(private authService: AuthService, private aiService: AiService, private router: Router) { 
    this.userName = this.authService.getUserName();
    this.isDark = localStorage.getItem('lt_mode') !== 'light';
    if (!this.isDark) document.body.classList.add('light');
  }

  ngOnInit(): void {
    this.aiService.getStreak().subscribe({
      next: (res: any) => { this.loggedToday = res.loggedToday; },
      error: () => {}
    });
  }

  toggleMenu() {
    this.isMobileOpen = !this.isMobileOpen;
  }

  confirmLogout() {
    this.showLogoutConfirm = true;
    this.isMobileOpen = false;
  }

  toggleMode() {
    this.isDark = !this.isDark;
    if (this.isDark) {
      document.body.classList.remove('light');
      localStorage.setItem('lt_mode', 'dark');
    } else {
      document.body.classList.add('light');
      localStorage.setItem('lt_mode', 'light');
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth']);
  }
}
