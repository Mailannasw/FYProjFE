import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DataService } from '../services/data.service';
import { Router } from '@angular/router';

// Many components used from PrimeNG library (PrimeNG, 2025)
@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule, ButtonModule, InputTextModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {
  @Output() signupComplete = new EventEmitter<boolean>();
  showSignupDialog = false;
  username = '';
  password = '';
  confirmPassword = '';
  errorMessage = '';

  constructor(private dataService: DataService, private router: Router) {}

  // Toggle signup dialog
  toggleSignupDialog(): void {
    this.showSignupDialog = true;
  }

  // Close dialog and reset fields
  closeDialog(): void {
    this.showSignupDialog = false;
    this.username = '';
    this.password = '';
    this.confirmPassword = '';
    this.errorMessage = '';
  }

  // Sign up
  signup(): void {
    if (!this.username || !this.password) {
      this.errorMessage = 'Username and password are required';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    this.dataService.createUser(this.username, this.password).subscribe({   // call service, create user
      next: (response) => {
        console.log('User created successfully:', response);
        this.signupComplete.emit(true);
        this.closeDialog();

        this.dataService.login(this.username, this.password).subscribe({    // Auto login after signup
          next: (loginResponse) => {
            const token = loginResponse?.jwt || loginResponse?.token || loginResponse?.jwtToken;
            if (token && typeof token === 'string') {
              localStorage.setItem('token', token);
              window.dispatchEvent(new Event('storage'));
              this.router.navigate(['/home']);
            }
          },
          error: (error) => {
            console.error('Auto-login failed after signup', error);
          }
        });
      },
      error: (error) => {
        console.error('Signup failed', error);
        this.errorMessage = error.error?.message || 'Failed to create account';
      }
    });
  }
}
