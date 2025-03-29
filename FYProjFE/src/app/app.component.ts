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

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Menubar, BadgeModule, AvatarModule, InputTextModule, Ripple, CommonModule, ButtonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  standalone: true
})
export class AppComponent {
  title = 'FYProjFE';

  // Menu bar edited from https://primeng.org/menubar
  items: MenuItem[] | undefined;

  ngOnInit() {
    this.items = [
      {
        label: 'Home',
        icon: 'pi pi-home',
      },
      {
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
      },
    ];
  }
}
