import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { FormsModule } from '@angular/forms';
import { Dialog } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { DataService } from '../services/data.service';

interface AutoCompleteCompleteEvent {
  originalEvent: Event;
  query: string;
}

interface Definition {
  definition: string;
  link: string;
}

interface Card {
  id: string;
  name: string;
  imageUrl?: string;
  type?: string;
  manaCost?: string;
  text?: string;
  power?: string;
  toughness?: string;
  loyalty?: string;
  setName?: string;
}

@Component({
  selector: 'app-home',
  imports: [CommonModule, AutoCompleteModule, FormsModule, Dialog, ButtonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  standalone: true
})
export class HomeComponent {

  // Word definition variables
  definition: Definition | null = null;
  searchedWord: string = '';
  filteredWords: string[] = [];
  availableWords: string[] = ['Vigilance', 'Deathtouch', 'Double Strike', 'First Strike', 'Flying', 'Haste', 'Lifelink', 'Reach',
    'Trample', 'Tap', 'Destroy', 'Permanent', 'Discard', 'Enchant', 'Exile', 'Flash', 'Goad', 'Hexproof',
    'Indestructible', 'Mana', 'Menace', 'Mulligan', 'Planeswalker', 'Sacrifice', 'Scry', 'Spell', 'Token'];

  // Card search variables
  cardName: string = '';
  selectedCard: Card | null = null;
  filteredCardNames: string[] = [];

  // Dialog(modal) variables
  visible: boolean = false;
  dialogHeader: string = '';

  constructor(private dataService: DataService) {}


  ////////////// Word Definition methods

  // Autocomplete search bar using PrimeNG. Every letter entered filters matching words into an [] for live display
  wordSearchSuggestions(event: AutoCompleteCompleteEvent) {
    this.filteredWords = this.availableWords.filter(item =>
      item.toLowerCase().includes(event.query.toLowerCase()));
  }

  //
  showDefinitionDialog() {
    this.resetDialogState();
    this.dialogHeader = this.searchedWord;
    this.dataService.getDefinition(this.searchedWord).subscribe(response => {
      this.definition = response;       // response: what is returned from BE
    });
    this.visible = true;

    this.searchedWord = '';             // empties definition search bar to blank string
    this.filteredWords = [];            // empties the filteredWords array
  }


  ////////////// Card search methods

  //
  searchCardSuggestions(event: AutoCompleteCompleteEvent) {
    if (event.query.length < 2) {
      this.filteredCardNames = [];
      return;
    }
    this.dataService.getCardNameSuggestions(event.query).subscribe(response => {
      if (response?.data) {
        this.filteredCardNames = response.data.slice(0, 25); // Limit to 25 suggestions because there's 1000s of cards
      }
    });
  }

  //
  showCardDialog() {
    this.resetDialogState();
    this.dialogHeader = this.cardName;
    this.dataService.getCardsByName(this.cardName).subscribe(cards => {
      if (cards?.length > 0) {
        this.dataService.getCardById(cards[0].id).subscribe(card => {
          this.selectedCard = card;
        });
      }
    });
    this.visible = true;

    this.cardName = '';
    this.filteredCardNames = [];
  }


  ////////////// Dialog methods

  // resets the word definition or card info on the dialog(modal)
  private resetDialogState() {
    this.definition = null;
    this.selectedCard = null;
  }

  // depending on the search bar used and what is passed in, it will choose which dialog to show
  showDialog() {
    if (this.searchedWord) {
      this.showDefinitionDialog();
    } else if (this.cardName) {
      this.showCardDialog();
    }
  }

}
