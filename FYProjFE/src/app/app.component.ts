// app.component.css, app.component.html, and app.component.ts are the main component files.
// Anything in here will be consistent across the whole web app (e.g.: menu bar, header, footer, etc)

import { RouterOutlet } from '@angular/router';
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

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Menubar, BadgeModule, AvatarModule, InputTextModule, Ripple, CommonModule, ButtonModule,
    LoginComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  standalone: true
})
export class AppComponent implements OnInit {
  title = 'FYProjFE';
  items: MenuItem[] | undefined;        // Menu bar edited from https://primeng.org/menubar

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
    const isLoggedIn = !!localStorage.getItem('token');
    this.items = [
      {
        label: 'Home',
        icon: 'pi pi-home',
      }
    ];
    if (isLoggedIn) {
      this.items.push({
        label: 'Decks',
        icon: 'pi pi-search',
        items: [
          {
            label: 'Create a Deck',
            icon: 'pi pi-bolt',
          },
          {
            label: 'My Decks',
            icon: 'pi pi-server',
          },
        ],
      });
    }
  }
}
