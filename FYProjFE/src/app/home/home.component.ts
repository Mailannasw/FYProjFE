import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { FormsModule } from '@angular/forms';
import { Dialog } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import {DataService} from '../services/data.service';

interface AutoCompleteCompleteEvent {
  originalEvent: Event;
  query: string;
}

@Component({
  selector: 'app-home',
  imports: [CommonModule, AutoCompleteModule, FormsModule, Dialog, ButtonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  standalone: true
})
export class HomeComponent {

  constructor(private dataService: DataService) {}

  // variables for the methods below
  definition: any;
  value: any;
  filteredWords: string[] = [];
  words: string[] = ['Vigilance', 'Deathtouch', 'Double Strike', 'First Strike', 'Flying', 'Haste', 'Lifelink', 'Reach',
    'Trample', 'Tap', 'Destroy', 'Permanent', 'Discard', 'Enchant', 'Exile', 'Flash', 'Goad', 'Hexproof',
    'Indestructible', 'Mana', 'Menace', 'Mulligan', 'Planeswalker', 'Sacrifice', 'Scry', 'Spell', 'Token'];
  visible: boolean = false;

  // My autocomplete search bar using PrimeNG. When a user types in the search bar, it actively filters through the
  // currently matching words from those available in the words array based on the currently typed letters, populating
  // them into filteredWords array (which is what you see  displayed on the screen as you type, a sort of
  // incremental/autocomplete search)
  search(event: AutoCompleteCompleteEvent) {
    this.filteredWords = this.words.filter(item => item.toLowerCase().includes(event.query.toLowerCase()));
  }

  // the modal that pops up when a word is searched. Also a PrimeNG component
  showDialog() {
    if (this.value) {
      this.getDefinition(this.value);
      this.visible = true;
    }
  }

  // me calling to the front end service, which calls the backend service, which calls the DB for the definition
  // of the searched word
  getDefinition(word: string) {
    this.dataService.getDefinition(word).subscribe(response => {
      this.definition = response;
    });
  }

}
