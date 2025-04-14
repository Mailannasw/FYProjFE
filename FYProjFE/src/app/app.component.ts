// app.component.css, app.component.html, and app.component.ts are the main component files.
// Anything in here will be consistent across the whole web app (e.g.: menu bar, header, footer, etc)

import {RouterModule, RouterOutlet} from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Menubar } from 'primeng/menubar';
import { BadgeModule } from 'primeng/badge';
import { AvatarModule } from 'primeng/avatar';
import { InputTextModule } from 'primeng/inputtext';
import { CommonModule } from '@angular/common';
import { Ripple } from 'primeng/ripple';
import { ButtonModule } from 'primeng/button';
import {LoginComponent} from './login/login.component';
import {SignupComponent} from './signup/signup.component';

// Many components used from PrimeNG library (PrimeNG, 2025)
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Menubar, BadgeModule, AvatarModule, InputTextModule, Ripple, CommonModule, ButtonModule,
    LoginComponent, RouterModule, SignupComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  standalone: true
})
export class AppComponent implements OnInit {
  title = 'FYProjFE';
  items: MenuItem[] | undefined;
  isLoggedIn = false;
  username = '';

  // App initialization
  ngOnInit() {
    this.updateMenuItems();

    // event listener to listen for storage events to detect login/logout
    window.addEventListener('storage', (event) => {
      if (event.key === 'token') {
        this.updateMenuItems();
      }
    });
  }

  // if someone is logged in, show the decks menu (home always shown)
  updateMenuItems() {
    this.isLoggedIn = !!localStorage.getItem('token');

    // Extract username from token if logged in
    if (this.isLoggedIn) {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Try to decode JWT to get username
          const tokenPayload = JSON.parse(atob(token.split('.')[1]));
          this.username = tokenPayload.sub || '';
        } catch (e) {
          console.error('Error decoding token:', e);
          this.username = '';
        }
      }
    } else {
      this.username = '';
    }

    this.items = [
      {
        label: 'Home',
        icon: 'pi pi-home',
        routerLink: '/home',
      }
    ];
    if (this.isLoggedIn) {
      this.items.push({
        label: 'Decks',
        icon: 'pi pi-search',
        items: [
          {
            label: 'Create a Deck',
            icon: 'pi pi-bolt',
            routerLink: '/deck-builder',
          },
          {
            label: 'My Decks',
            icon: 'pi pi-server',
            routerLink: '/my-decks',
          },
        ],
      });
    }
  }
}
