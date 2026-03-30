import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { ThemeService, THEMES, AppTheme } from '../services/theme.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  // Profile
  userId: number | null = null;
  firstName = '';
  lastName = '';
  email = '';

  // Password
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';

  // Theme
  themes: AppTheme[] = THEMES;
  activeTheme = 'default';

  // UI state
  toastMessage = '';
  showToastMsg = false;
  isProfileLoading = false;
  isPasswordLoading = false;

  constructor(private authService: AuthService, private themeService: ThemeService) {}

  ngOnInit(): void {
    this.userId = this.authService.getUserId();
    this.activeTheme = this.themeService.current();
    const token = this.authService.getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.firstName = payload.first_name || '';
        this.lastName = payload.last_name || '';
        this.email = payload.email || '';
      } catch(e) {}
    }
  }

  selectTheme(themeId: string) {
    this.activeTheme = themeId;
    this.themeService.apply(themeId);
    this.showToast('Theme applied! ✨');
  }

  saveProfile() {
    if (!this.firstName || !this.lastName || !this.email) return this.showToast('Please fill all profile fields');
    this.isProfileLoading = true;
    this.authService.updateProfile(this.userId!, this.firstName, this.lastName, this.email).subscribe({
      next: (res: any) => {
        localStorage.setItem('token', res.token);
        this.showToast('Profile updated successfully ✅');
        this.isProfileLoading = false;
      },
      error: (err: any) => {
        this.showToast(err.error || 'Error updating profile');
        this.isProfileLoading = false;
      }
    });
  }

  changePassword() {
    if (!this.currentPassword || !this.newPassword) return this.showToast('Please fill all password fields');
    if (this.newPassword !== this.confirmPassword) return this.showToast('New passwords do not match');
    if (this.newPassword.length < 6) return this.showToast('New password must be at least 6 characters');
    this.isPasswordLoading = true;
    this.authService.updatePassword(this.userId!, this.currentPassword, this.newPassword).subscribe({
      next: () => {
        this.showToast('Password changed successfully 🔒');
        this.currentPassword = ''; this.newPassword = ''; this.confirmPassword = '';
        this.isPasswordLoading = false;
      },
      error: (err: any) => {
        this.showToast(err.error || 'Error changing password');
        this.isPasswordLoading = false;
      }
    });
  }

  exportData() {
    if (!this.userId) return;
    window.open(`http://localhost:5000/api/export/${this.userId}`, '_blank');
  }

  showToast(msg: string) {
    this.toastMessage = msg;
    this.showToastMsg = true;
    setTimeout(() => this.showToastMsg = false, 3500);
  }
}
