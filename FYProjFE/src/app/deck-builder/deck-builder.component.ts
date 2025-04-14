import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { DataService } from '../services/data.service';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { catchError, of } from 'rxjs';

interface AutoCompleteCompleteEvent {
  originalEvent: Event;
  query: string;
}

// Many components used from PrimeNG library (PrimeNG, 2025)
@Component({
  selector: 'app-deck-builder',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AutoCompleteModule,
    ButtonModule,
    DropdownModule,
    InputTextModule,
    ToastModule
  ],
  templateUrl: './deck-builder.component.html',
  providers: [MessageService]
})
export class DeckBuilderComponent {
  // Deck creation properties
  deckName: string = '';
  deckTypes: any[] = [
    { name: 'Standard', value: 'STANDARD' },
    { name: 'Commander', value: 'COMMANDER' }
  ];
  selectedDeckType: any = null;

  // Commander search properties
  commanderName: string = '';
  filteredCommanderNames: string[] = [];

  constructor(
    private dataService: DataService,
    private messageService: MessageService
  ) {}

  // Search for commander cards
  searchCommanderSuggestions(event: AutoCompleteCompleteEvent) {
    if (event.query.length < 2) {                 // if query less than 2 characters
      this.filteredCommanderNames = [];           // Clear suggestions
      return;
    }
    this.dataService.getCardNameSuggestions(event.query).subscribe(response => {
      if (response?.data) {
        this.filteredCommanderNames = response.data.slice(0, 25);       // Limit to 25 suggestions
      }
    });
  }

  // Create a new deck
  createDeck() {
    if (!this.isFormValid()) {      // if form not valid
      this.messageService.add({     // Show error message
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please fill out all required fields',
        life: 3000                  // toast duration (3 seconds)
      });
      return;
    }
    // For Commander decks, commanderName is required
    // For Standard decks, commanderName should be null
    const commanderCardName = this.selectedDeckType.value === 'COMMANDER' ? this.commanderName : null;
    this.dataService.createDeck(this.deckName, this.selectedDeckType.value, commanderCardName) // Create deck
      .pipe(
        catchError(error => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.message || 'Failed to create deck',
            life: 5000             // Toast duration (5 seconds)
          });
          return of(null);
        })
      )
      .subscribe(deck => {
        if (deck) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Deck created successfully',
            life: 3000                // Toast duration (3 seconds)
          });
          this.resetForm();
        }
      });
  }

  // Check if form is valid
  isFormValid(): boolean {
    if (!this.deckName || !this.selectedDeckType) {
      return false;
    }

    // If deck type is Commander, commander name is required
    return !(this.selectedDeckType.value === 'COMMANDER' && !this.commanderName);
  }

  // Reset form after successful creation
  resetForm() {
    this.deckName = '';
    this.selectedDeckType = null;
    this.commanderName = '';
    this.filteredCommanderNames = [];
  }
}
