import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { DeckBuilderComponent } from './deck-builder/deck-builder.component';
import { MyDecksComponent } from './my-decks/my-decks.component';
import {AuthGuard} from './services/auth-guard.service';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'deck-builder', component: DeckBuilderComponent, canActivate: [AuthGuard] },
  { path: 'my-decks', component: MyDecksComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '' }
];
