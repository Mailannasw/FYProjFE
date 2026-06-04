import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}

  // Check if user is logged in by checking for token
  canActivate(): boolean {
    if (localStorage.getItem('token')) {
      return true;
    }

    // If not logged in, redirect to home page
    this.router.navigate(['/home']);
    return false;
  }
}
