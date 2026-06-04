import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { InputNumberModule } from 'primeng/inputnumber';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DataService } from '../services/data.service';
import { ScryfallCard } from '../models/scryfall-card.model';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CardModule } from 'primeng/card';
import { PaginatorModule } from 'primeng/paginator';

interface GroupedCard {
  name: string;
  count: number;
  card: ScryfallCard;
}

interface QueueCard {
  name: string;
  quantity: number;
}

// Many components used from PrimeNG library (PrimeNG, 2025)
@Component({
  selector: 'app-my-decks',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    ToastModule,
    DialogModule,
    AutoCompleteModule,
    InputNumberModule,
    TooltipModule,
    ConfirmDialogModule,
    CardModule,
    PaginatorModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './my-decks.component.html',
  styleUrl: './my-decks.component.css'
})
export class MyDecksComponent implements OnInit {
  decks: any[] = [];
  loading = true;
  selectedDeck: any = null;
  dialogVisible = false;

  newCardName = '';
  cardQuantity = 1;
  cardSuggestions: string[] = [];
  cardQueue: QueueCard[] = [];
  addingCards = false;
  first: number = 0;
  rows: number = 9;

  constructor(
    private dataService: DataService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  // Loads user's decks from backend on initialization
  ngOnInit() {
    this.loadDecks();
  }

// Load deck
  loadDecks() {
    this.loading = true;
    this.dataService.getMyDecks().subscribe({
      next: (data) => {
        this.decks = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading decks', err);
        this.loading = false;
      }
    });
  }

  // View deck in a dialog
  // @param deckId - ID of the deck to view
  viewDeck(deckId: string) {
    this.loading = true;
    this.dataService.getDeckById(deckId).subscribe({
      next: (deck) => {
        this.selectedDeck = deck;
        this.dialogVisible = true;
        this.loading = false;
        this.clearCardAdditionForm();  // clear form so old data doesn't persist
      },
      error: (err) => {
        console.error('Error fetching deck', err);
        this.loading = false;
      }
    });
  }

  // Searches for card names based on user input, with autocomplete suggestions
  // @param event - Event containing the current query
  searchCardSuggestions(event: any) {
    const query = event.query;
    if (query.length < 2) return;                           // Minimum length for suggestions

    this.dataService.getCardNameSuggestions(query).subscribe({
      next: (data) => {
        this.cardSuggestions = data.data || [];
      },
      error: (err) => {
        console.error('Error getting card suggestions', err);
        this.cardSuggestions = [];
      }
    });
  }

  // Add selected cards to queue
  addToQueue() {
    if (!this.newCardName || this.cardQuantity < 1) return;

    const existingIndex = this.cardQueue.findIndex(item =>    // check if card already exists in queue
      item.name.toLowerCase() === this.newCardName.toLowerCase()
    );

    if (existingIndex >= 0) {                                          // if card already exists
      this.cardQueue[existingIndex].quantity += this.cardQuantity;     // increment quantity
    } else {                  // otherwise, push new card to queue
      this.cardQueue.push({
        name: this.newCardName,
        quantity: this.cardQuantity   // adjusting quantity
      });
    }

    this.newCardName = '';      // Reset form fields
    this.cardQuantity = 1;
  }

  // Remove card from queue
  // @param index - Index of the card to remove
  removeFromQueue(index: number) {
    this.cardQueue.splice(index, 1);
  }

  // Clears card queue
  clearQueue() {
    this.cardQueue = [];
  }

  // Clears all fields in the card addition form
  clearCardAdditionForm() {
    this.newCardName = '';
    this.cardQuantity = 1;
    this.cardQueue = [];
  }

  // Get total number of cards in queue
  getTotalCardsInQueue(): number {
    return this.cardQueue.reduce((total, item) => total + item.quantity, 0);
  }

  // Adds cards to the selected deck
  addCardsToDeck() {
    if (!this.selectedDeck || this.cardQueue.length === 0) return;

    const cardNames: string[] = [];
    this.cardQueue.forEach(item => {
      for (let i = 0; i < item.quantity; i++) {   // add each card to array (e.g.: 4 lands and an Sol Ring
        cardNames.push(item.name);                        // lands added one by one, Sol Ring once)
      }
    });

    this.addingCards = true;
    this.dataService.addCardsToDeck(this.selectedDeck.id, cardNames).subscribe({
      next: (updatedDeck) => {          // update deck with added cards
        this.selectedDeck = updatedDeck;
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `Added ${cardNames.length} card(s) to deck`
        });
        this.clearQueue();
        this.addingCards = false;
        this.loadDecks();           // Load decks list to show updated card count
      },
      error: (err) => {
        console.error('Error adding cards to deck', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error?.message || 'Failed to add cards to deck'
        });
        this.addingCards = false;
      }
    });
  }

  // Gets cards by type (e.g.: Creature, Sorcery, etc.)
  // @param type - Type of card to filter by
  getCardsByType(type: string): ScryfallCard[] {
    if (!this.selectedDeck || !this.selectedDeck.cards) {
      return [];
    }

    return this.selectedDeck.cards.filter((card: ScryfallCard) => {  // filters cards by type, excluding commander
      const isCommanderCard = this.selectedDeck.commander && card.id === this.selectedDeck.commander.id;
      if (type === 'Creature') {
        return card.type_line?.includes(type) && !isCommanderCard;
      } else {
        return card.type_line?.includes(type);
      }
    });
  }

  // Group cards by name and count duplicates
  groupCardsByName(cards: ScryfallCard[]): GroupedCard[] {
    const grouped: { [key: string]: GroupedCard } = {};

    cards.forEach((card: ScryfallCard) => {   // for each card, check if exists in grouped object
      if (!grouped[card.name]) {                   // if not, create new entry
        grouped[card.name] = {
          name: card.name,
          count: 1,
          card: card
        };
      } else {                                    // if exists, increment count in that grouped object
        grouped[card.name].count++;
      }
    });

    return Object.values(grouped);
  }

  //Remove card from deck
  removeCardFromDeck(card: ScryfallCard) {
    if (!this.selectedDeck || !card) return;

    this.dataService.removeCardFromDeck(this.selectedDeck.id, card.id).subscribe({
      next: (updatedDeck) => {
        this.selectedDeck = updatedDeck;
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `Removed ${card.name} from deck`
        })
        this.loadDecks();             // Load decks list to show updated card count
      },
      error: (err) => {
        console.error('Error removing card from deck', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.message || 'Failed to remove card from deck'
        });
      }
    });
  }

  // Dialog to confirm deck deletion
  confirmDeleteDeck(deck: any) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete the deck "${deck.deckName}"? This action cannot be undone.`,
      header: 'Confirm Deck Deletion',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteDeck(deck.id);
      }
    });
  }

  // Delete deck
  deleteDeck(deckId: string) {
    this.dataService.deleteDeck(deckId).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Deck deleted successfully'
        });
        this.loadDecks();         // Load the deck list for updated view
      },
      error: (err) => {
        console.error('Error deleting deck', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete deck'
        });
      }
    });
  }

  // Get decks by type to sort
  // @param deckType - Type of deck to filter by (Commander or Standard)
  getDecksByType(deckType: string): any[] {
    if (!this.decks) return [];

    return this.decks.filter(deck => deck.deckType === deckType);
  }
}
