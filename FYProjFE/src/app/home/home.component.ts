import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { FormsModule } from '@angular/forms';
import { Dialog } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { DataService } from '../services/data.service';
import {ToastModule} from 'primeng/toast';
import {MessageService} from 'primeng/api';
import {catchError, of} from 'rxjs';

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
  image_uris?: {
    small?: string;
    normal?: string;
    large?: string;
  };
  type_line?: string;
  mana_cost?: string;
  oracle_text?: string;
  power?: string;
  toughness?: string;
  loyalty?: string;
  set_name?: string;
}

// Many components used from PrimeNG library (PrimeNG, 2025)
@Component({
  selector: 'app-home',
  imports: [CommonModule, AutoCompleteModule, FormsModule, Dialog, ButtonModule, ToastModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  standalone: true,
  providers: [MessageService]
})
export class HomeComponent {

  definition: Definition | null = null;   // Current word definition being displayed
  searchedWord: string = '';              // Current word being searched
  filteredWords: string[] = [];           // Filtered list of words for autocomplete
  // List oMagic keywords for autocomplete suggestions
  availableWords: string[] = ['Vigilance', 'Deathtouch', 'Double Strike', 'First Strike', 'Flying', 'Haste', 'Lifelink', 'Reach',
    'Trample', 'Tap', 'Destroy', 'Permanent', 'Discard', 'Enchant', 'Exile', 'Flash', 'Goad', 'Hexproof',
    'Indestructible', 'Mana', 'Menace', 'Mulligan', 'Planeswalker', 'Sacrifice', 'Scry', 'Spell', 'Token'];

  cardName: string = '';                // Current card name being searched
  selectedCard: Card | null = null;     // Currently selected card details
  filteredCardNames: string[] = [];     // Filtered list of card names for autocomplete

  visible: boolean = false;             // Visibility of definition/card dialog
  turnHelpVisible: boolean = false;     // Visibility of turn help dialog
  dialogHeader: string = '';            // Header text for the current dialog

  constructor(private dataService: DataService, private messageService: MessageService) {

  }

  // Shows turn help dialog
  showTurnHelpDialog() {
    this.turnHelpVisible = true;
  }

  // Filters available words based on user input for autocomplete suggestions
  // @param event - autocomplete event containing the current query
  wordSearchSuggestions(event: AutoCompleteCompleteEvent) {
    this.filteredWords = this.availableWords.filter(item =>
      item.toLowerCase().includes(event.query.toLowerCase()));
  }

  // Shows definition dialog with that word's definition
  // Grabs definition from backend and resets search state
  showDefinitionDialog() {
    this.resetDialogState();
    this.dialogHeader = this.searchedWord;
    this.dataService.getDefinition(this.searchedWord).subscribe(response => {
      this.definition = response;
    });
    this.visible = true;

    this.searchedWord = '';     // Reset search state
    this.filteredWords = [];
  }

  // Fetches card name suggestions from the API based on user input
  // @param event - autocomplete event containing current query
  searchCardSuggestions(event: AutoCompleteCompleteEvent) {
    if (event.query.length < 2) {     // Minimum length to get suggestions
      this.filteredCardNames = [];
      return;
    }
    this.dataService.getCardNameSuggestions(event.query).subscribe(response => {
      if (response?.data) {
        this.filteredCardNames = response.data.slice(0, 25);      // Limit to 25 suggestions
      }
    });
  }

  // Shows card dialog with selected card details
  showCardDialog() {
    this.resetDialogState();
    this.dialogHeader = this.cardName;

    this.dataService.getCardsByName(this.cardName).pipe(
      catchError(error => {
        this.visible = false;     // Don't show dialog if error

        if (error.status === 404) {     // if no cards found
          this.messageService.add({
            severity: 'error',
            summary: 'Card Not Found',
            detail: 'Either more than one card matched your search, or 0 cards matched. Try again.',
            life: 5000
          });
        } else {                        // if other error
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'An error occurred while searching for the card.',
            life: 5000
          });
        }
        return of(null);
      })
    ).subscribe(card => {     // if card found, show dialog
      if (card) {
        this.selectedCard = card;
        this.visible = true;
      }
    });

    this.cardName = '';                 // Reset search state
    this.filteredCardNames = [];
  }

  // Reset dialog state to ensure clean state after closing
  private resetDialogState() {
    this.definition = null;
    this.selectedCard = null;
  }

  // Determines which dialog to show based on the search input
  // Routes to either word definition or card search based on which field has content
  showDialog() {
    if (this.searchedWord) {
      this.showDefinitionDialog();
    } else if (this.cardName) {
      this.showCardDialog();
    }
  }
}
