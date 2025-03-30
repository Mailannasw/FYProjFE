import {Component, EventEmitter, Output} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DataService } from '../services/data.service';

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

  constructor(private dataService: DataService) {
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

  //
  login(): void {
    if (!this.username || !this.password) {
      this.errorMessage = 'Username and password are required';
      return;
    }
    this.dataService.login(this.username, this.password).subscribe({
      next: (response) => {
        localStorage.setItem('token', response.token);            // set token in local storage
        this.isLoggedIn = true;
        this.loginStatusChange.emit(true);                        // emits true for event listener in app.component.ts
        this.closeDialog();
      },
      error: (error) => {
        console.error('Login failed', error);
        this.errorMessage = 'Invalid username or password';
      }
    });
  }

  // token from local storage is removed and user is logged out
  logout(): void {
    localStorage.removeItem('token');
    this.isLoggedIn = false;
    this.loginStatusChange.emit(false);           // emits false for event listener in app.component.ts
  }
}
