import {Component, EventEmitter, Output} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DataService } from '../services/data.service';
import {Router} from '@angular/router';

// Many components used from PrimeNG library (PrimeNG, 2025)
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule, ButtonModule, InputTextModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  @Output() loginStatusChange = new EventEmitter<boolean>();
  isLoggedIn = false;
  showLoginDialog = false;
  username = '';
  password = '';
  errorMessage = '';

  constructor(private dataService: DataService, private router: Router) {
    this.isLoggedIn = !!localStorage.getItem('token');
  }

  // change login to logout if user is logged in
  toggleLoginDialog(): void {
    if (this.isLoggedIn) {
      this.logout();
    } else {
      this.showLoginDialog = true;
    }
  }

  // emptying text fields when closing dialog
  closeDialog(): void {
    this.showLoginDialog = false;
    this.username = '';
    this.password = '';
    this.errorMessage = '';
  }

  // login
  login(): void {
    if (!this.username || !this.password) {
      this.errorMessage = 'Username and password are required';
      return;
    }

    this.dataService.login(this.username, this.password).subscribe({    // login from data.service.ts
      next: (response) => {
        console.log('Login response:', response);

        const token = response?.jwt || response?.token || response?.jwtToken;   // extract token from response

        if (token && typeof token === 'string') {     // if token is a string
          localStorage.setItem('token', token);       // save token to local storage
          console.log('Token saved:', token);
          this.isLoggedIn = true;
          this.loginStatusChange.emit(true);
          this.closeDialog();
        } else {                                      // otherwise, when token is not a string
          console.error('Invalid token format in response:', response);
          this.errorMessage = 'Authentication failed: Invalid response format';
        }
      },
      error: (error) => {
        console.error('Login failed', error);
        this.errorMessage = 'Invalid username or password';
      }
    });
  }

  // Logout, and token from local storage is removed
  logout(): void {
    localStorage.removeItem('token');
    this.isLoggedIn = false;
    this.loginStatusChange.emit(false);       // emits false for event listener in app.component.ts
    this.router.navigate(['/home']);
  }
}
