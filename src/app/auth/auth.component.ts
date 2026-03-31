import { Component, Inject, Renderer2 } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Router } from '@angular/router';
import { NgZone } from '@angular/core';
import { environment } from '../../environments/environment';


import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent {
  activeTab: 'login' | 'register' | 'forgot' = 'login';
  forgotStep: 'email' | 'otp' | 'reset' = 'email';
  registerStep: 'details' | 'otp' = 'details';
  
  forgotEmail = '';
  forgotOtp = '';
  forgotNewPass = '';
  isForgotLoading = false;

  regOtp = '';
  isRegLoading = false;

  showLoginPass = false;
  showRegPass = false;
  passwordStrength = 0;
  strengthLabel = '';
  strengthColor = '';

  toastMessage = '';
  showToastMsg = false;

  // NgModel Properties
  loginEmail = '';
  loginPass = '';
  regFirst = '';
  regLast = '';
  regEmail = '';
  regPass = '';
  rememberMe = false;

  constructor(
    @Inject(DOCUMENT) private document: Document, 
    private renderer: Renderer2,
    private authService: AuthService,
    private router: Router,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    // @ts-ignore
    google.accounts.id.initialize({
      client_id: environment.googleClientId,
      callback: this.handleGoogleResponse.bind(this)
    });
    // @ts-ignore
    google.accounts.id.renderButton(
      document.getElementById("google-btn"),
      { theme: "outline", size: "large", width: "100%", shape: "pill" }
    );
  }

  handleGoogleResponse(response: any) {
    this.showToast('Authenticating with Google...');
    this.authService.googleLogin(response.credential).subscribe({
      next: (res: any) => {
        if (res.token) {
          localStorage.setItem('token', res.token);
          this.ngZone.run(() => {
            this.showToast('Login successful!');
            setTimeout(() => {
              this.router.navigate(['/dashboard']);
            }, 1000);
          });
        }
      },
      error: (err) => {
        this.ngZone.run(() => {
          const errMsg = err.error?.error || 'Google authentication failed';
          this.showToast(errMsg);
          console.error("Google OAuth Error:", err);
        });
      }
    });
  }



  switchTab(tab: 'login' | 'register' | 'forgot', event?: Event) {
    if (event) {
      event.preventDefault();
    }
    this.activeTab = tab;
  }

  handleForgotEmail() {
    if(!this.forgotEmail) return this.showToast('Please enter your email');
    this.isForgotLoading = true;
    this.authService.forgotPassword(this.forgotEmail).subscribe({
      next: (res) => {
        this.showToast(res);
        if(res === 'OTP sent successfully') this.forgotStep = 'otp';
        this.isForgotLoading = false;
      },
      error: () => { this.showToast('Server Error'); this.isForgotLoading = false; }
    });
  }

  handleVerifyOtp() {
    if(!this.forgotOtp) return this.showToast('Enter the 6-digit OTP');
    this.isForgotLoading = true;
    this.authService.verifyOtp(this.forgotEmail, this.forgotOtp).subscribe({
      next: (res) => {
        this.showToast(res);
        if(res === 'OTP verified') this.forgotStep = 'reset';
        this.isForgotLoading = false;
      },
      error: () => { this.showToast('Server Error'); this.isForgotLoading = false; }
    });
  }

  handleResetPassword() {
    if(!this.forgotNewPass) return this.showToast('Enter a new password');
    this.isForgotLoading = true;
    this.authService.resetPassword(this.forgotEmail, this.forgotOtp, this.forgotNewPass).subscribe({
      next: (res) => {
        this.showToast(res);
        if(res === 'Password reset successfully') {
          setTimeout(() => {
            this.activeTab = 'login';
            this.forgotStep = 'email';
            this.forgotEmail = ''; this.forgotOtp = ''; this.forgotNewPass = '';
          }, 1500);
        }
        this.isForgotLoading = false;
      },
      error: () => { this.showToast('Server Error'); this.isForgotLoading = false; }
    });
  }

  checkStrength() {
    let score = 0;
    const val = this.regPass;
    if (val.length >= 8) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;
    const colors = ['', '#f87171', '#fbbf24', '#34d399', '#6382ff'];
    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
    this.passwordStrength = score;
    this.strengthColor = colors[score] || '';
    this.strengthLabel = val.length ? labels[score] : '';
  }

  showToast(msg: string) {
    this.toastMessage = msg;
    this.showToastMsg = true;
    setTimeout(() => {
      this.showToastMsg = false;
    }, 3000);
  }

  handleLogin() {
    if (!this.loginEmail || !this.loginPass) {
      this.showToast('Please fill in all fields');
      return;
    }
    
    this.authService.login({
      email: this.loginEmail,
      password: this.loginPass
    }).subscribe({
      next: (res: any) => {
        try {
          const parsed = JSON.parse(res);
          this.showToast('Signing you in...');
          if (parsed.token) {
            localStorage.setItem('token', parsed.token);
            setTimeout(() => {
               this.router.navigate(['/dashboard']);
               this.showToastMsg = false;
            }, 1000);
          }
        } catch(e) {
          this.showToast(res);
        }
      },
      error: (err) => {
        this.showToast('Server error during login');
      }
    });
  }

  handleRegister() {
    if (!this.regEmail || !this.regPass) {
      this.showToast('Please fill in all fields');
      return;
    }

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!emailPattern.test(this.regEmail)) {
      this.showToast('Please enter a valid email address');
      return;
    }

    this.authService.register({
      first_name: this.regFirst,
      last_name: this.regLast,
      email: this.regEmail,
      password: this.regPass
    }).subscribe({
      next: (res) => {
        this.showToast(res);
        if (res === 'Verification OTP sent' || res === 'User registered successfully') {
          this.registerStep = 'otp';
        }
      },
      error: (err) => {
        this.showToast('Server error during registration');
      }
    });
  }

  handleVerifyRegOtp() {
    if (!this.regOtp) return this.showToast('Enter the 6-digit verification code');
    this.isRegLoading = true;
    this.authService.registerVerify(this.regEmail, this.regOtp).subscribe({
      next: (res: any) => {
        this.showToast('Account verified! Please sign in.');
        setTimeout(() => {
          this.switchTab('login');
          this.registerStep = 'details';
          this.regFirst = ''; this.regLast = ''; this.regEmail = ''; this.regPass = ''; this.regOtp = '';
        }, 1500);
        this.isRegLoading = false;
      },
      error: (err) => {
        this.showToast(err.error?.error || 'Invalid or expired OTP');
        this.isRegLoading = false;
      }
    });
  }
}
