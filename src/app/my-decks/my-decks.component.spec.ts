import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyDecksComponent } from './my-decks.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DataService } from '../services/data.service';
import { Router } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { InputNumberModule } from 'primeng/inputnumber';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { of, throwError } from 'rxjs';
import { ScryfallCard } from '../models/scryfall-card.model';
import {MessageService} from 'primeng/api';

describe('MyDecksComponent', () => {
  let component: MyDecksComponent;
  let fixture: ComponentFixture<MyDecksComponent>;
  let dataService: DataService;
  let messageService: MessageService;
  let confirmationService: any;
  let router: jasmine.SpyObj<Router>;

  // Mock data setup
  const mockDecks = [
    { id: '1', deckName: 'Test Deck 1', deckType: 'STANDARD', cards: [], sizeLimit: 60 },
    { id: '2', deckName: 'Test Deck 2', deckType: 'COMMANDER', cards: [], sizeLimit: 100 }
  ];

  // Mock Scryfall card data
  const mockCard: ScryfallCard = {
    object: 'card',
    id: 'card1',
    oracle_id: 'test-oracle-id',
    name: 'Test Card',
    lang: 'en',
    released_at: '2024-01-01',
    uri: 'https://api.scryfall.com/cards/test',
    scryfall_uri: 'https://scryfall.com/card/test',
    layout: 'normal',
    highres_image: true,
    image_status: 'highres_scan',
    type_line: 'Creature',
    oracle_text: 'Test text',
    mana_cost: '{1}{W}',
    cmc: 2,
    color_identity: ['W'],
    keywords: [],
    legalities: {},
    games: ['paper'],
    reserved: false,
    foil: true,
    nonfoil: true,
    finishes: ['nonfoil', 'foil'],
    oversized: false,
    promo: false,
    reprint: false,
    variation: false,
    set_id: 'test-set',
    set: 'test',
    set_name: 'Test Set',
    set_type: 'expansion',
    set_uri: 'https://api.scryfall.com/sets/test',
    set_search_uri: 'https://api.scryfall.com/cards/search?set=test',
    scryfall_set_uri: 'https://scryfall.com/sets/test',
    rulings_uri: 'https://api.scryfall.com/cards/test/rulings',
    prints_search_uri: 'https://api.scryfall.com/cards/search?prints=test',
    collector_number: '1',
    digital: false,
    rarity: 'rare',
    card_back_id: 'test-back',
    artist: 'Test Artist',
    prices: {},
    related_uris: {},
    purchase_uris: {}
  };

  // Before each test, configure these settings
  beforeEach(async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        NoopAnimationsModule,
        FormsModule,
        ToastModule,
        TableModule,
        DialogModule,
        AutoCompleteModule,
        InputNumberModule,
        TooltipModule,
        ConfirmDialogModule,
        MyDecksComponent
      ],
      providers: [
        DataService,
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MyDecksComponent);
    component = fixture.componentInstance;
    dataService = TestBed.inject(DataService);
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    messageService = (component as any).messageService;
    confirmationService = (component as any).confirmationService;

    spyOn(messageService, 'add');
    spyOn(confirmationService, 'confirm');
    spyOn(dataService, 'getMyDecks').and.returnValue(of(mockDecks));

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Deck Loading', () => {
    it('should load decks on init', () => {
      expect(dataService.getMyDecks).toHaveBeenCalled();
      expect(component.decks).toEqual(mockDecks);
      expect(component.loading).toBe(false);
    });

    it('should handle error when loading decks', () => {
      (dataService.getMyDecks as jasmine.Spy).and.returnValue(throwError(() => new Error('Test error')));
      spyOn(console, 'error');

      component.loadDecks();

      expect(console.error).toHaveBeenCalled();
      expect(component.loading).toBe(false);
    });
  });

  describe('Deck Details', () => {
    it('should view deck details', () => {
      const mockDeck = { id: '1', deckName: 'Test Deck', cards: [] };
      spyOn(dataService, 'getDeckById').and.returnValue(of(mockDeck));
      spyOn(component, 'clearCardAdditionForm');

      component.viewDeck('1');

      expect(dataService.getDeckById).toHaveBeenCalledWith('1');
      expect(component.selectedDeck).toBe(mockDeck);
      expect(component.dialogVisible).toBe(true);
      expect(component.loading).toBe(false);
      expect(component.clearCardAdditionForm).toHaveBeenCalled();
    });

    it('should handle error when viewing deck details', () => {
      spyOn(console, 'error');
      spyOn(dataService, 'getDeckById').and.returnValue(throwError(() => new Error('Test error')));

      component.viewDeck('1');

      expect(console.error).toHaveBeenCalled();
      expect(component.loading).toBe(false);
    });
  });

  describe('Card Queue Management', () => {
    it('should add card to queue', () => {
      component.newCardName = 'Test Card';
      component.cardQuantity = 2;

      component.addToQueue();

      expect(component.cardQueue.length).toBe(1);
      expect(component.cardQueue[0].name).toBe('Test Card');
      expect(component.cardQueue[0].quantity).toBe(2);
      expect(component.newCardName).toBe('');
      expect(component.cardQuantity).toBe(1);
    });

    it('should not add card to queue if no name is provided', () => {
      component.newCardName = '';
      component.cardQuantity = 1;

      component.addToQueue();

      expect(component.cardQueue.length).toBe(0);
    });

    it('should update quantity for existing card in queue', () => {
      component.cardQueue = [{ name: 'Test Card', quantity: 1 }];
      component.newCardName = 'Test Card';
      component.cardQuantity = 2;

      component.addToQueue();

      expect(component.cardQueue.length).toBe(1);
      expect(component.cardQueue[0].quantity).toBe(3);
    });

    it('should remove card from queue', () => {
      component.cardQueue = [
        { name: 'Card 1', quantity: 1 },
        { name: 'Card 2', quantity: 1 }
      ];

      component.removeFromQueue(0);

      expect(component.cardQueue.length).toBe(1);
      expect(component.cardQueue[0].name).toBe('Card 2');
    });

    it('should clear queue', () => {
      component.cardQueue = [
        { name: 'Card 1', quantity: 1 },
        { name: 'Card 2', quantity: 1 }
      ];

      component.clearQueue();

      expect(component.cardQueue.length).toBe(0);
    });

    it('should calculate total cards in queue', () => {
      component.cardQueue = [
        { name: 'Card 1', quantity: 2 },
        { name: 'Card 2', quantity: 3 }
      ];

      const total = component.getTotalCardsInQueue();

      expect(total).toBe(5);
    });
  });

  describe('Card Operations', () => {
    it('should add cards to deck', () => {
      const updatedDeck = { id: '1', cards: [mockCard, mockCard] };
      spyOn(dataService, 'addCardsToDeck').and.returnValue(of(updatedDeck));
      spyOn(component, 'loadDecks');
      spyOn(component, 'clearQueue');

      component.selectedDeck = { id: '1' };
      component.cardQueue = [
        { name: 'Card 1', quantity: 1 },
        { name: 'Card 2', quantity: 1 }
      ];

      component.addCardsToDeck();

      expect(dataService.addCardsToDeck).toHaveBeenCalledWith('1', ['Card 1', 'Card 2']);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Success',
        detail: 'Added 2 card(s) to deck'
      });
      expect(component.clearQueue).toHaveBeenCalled();
      expect(component.loadDecks).toHaveBeenCalled();
    });

    it('should handle error when adding cards to deck', () => {
      const errorResponse = { error: { message: 'Test error message' } };
      spyOn(console, 'error');
      spyOn(dataService, 'addCardsToDeck').and.returnValue(throwError(() => errorResponse));

      component.selectedDeck = { id: '1' };
      component.cardQueue = [{ name: 'Card 1', quantity: 1 }];

      component.addCardsToDeck();

      expect(console.error).toHaveBeenCalled();
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Test error message'
      });
    });

    it('should remove card from deck', () => {
      const updatedDeck = { id: '1', cards: [] };
      spyOn(dataService, 'removeCardFromDeck').and.returnValue(of(updatedDeck));
      spyOn(component, 'loadDecks');

      component.selectedDeck = { id: '1' };

      component.removeCardFromDeck(mockCard);

      expect(dataService.removeCardFromDeck).toHaveBeenCalledWith('1', 'card1');
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Success',
        detail: 'Removed Test Card from deck'
      });
      expect(component.loadDecks).toHaveBeenCalled();
    });

    it('should handle error when removing card from deck', () => {
      const error = { message: 'Test error message' };
      spyOn(console, 'error');
      spyOn(dataService, 'removeCardFromDeck').and.returnValue(throwError(() => error));

      component.selectedDeck = { id: '1' };

      component.removeCardFromDeck(mockCard);

      expect(console.error).toHaveBeenCalled();
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Test error message'
      });
    });

    it('should search for card suggestions', () => {
      const suggestions = { data: ['Card 1', 'Card 2'] };
      spyOn(dataService, 'getCardNameSuggestions').and.returnValue(of(suggestions));

      component.searchCardSuggestions({ query: 'test' });

      expect(dataService.getCardNameSuggestions).toHaveBeenCalledWith('test');
      expect(component.cardSuggestions).toEqual(['Card 1', 'Card 2']);
    });

    it('should not search if query is too short', () => {
      spyOn(dataService, 'getCardNameSuggestions');

      component.searchCardSuggestions({ query: 't' });

      expect(dataService.getCardNameSuggestions).not.toHaveBeenCalled();
    });
  });

  describe('Card Grouping and Filtering', () => {
    it('should filter cards by type', () => {
      const creature1 = { ...mockCard, type_line: 'Creature' };
      const creature2 = { ...mockCard, id: 'card2', type_line: 'Creature' };
      const land = { ...mockCard, id: 'card3', type_line: 'Land' };

      component.selectedDeck = {
        cards: [creature1, creature2, land]
      };

      const creatures = component.getCardsByType('Creature');
      const lands = component.getCardsByType('Land');

      expect(creatures.length).toBe(2);
      expect(lands.length).toBe(1);
    });

    it('should exclude commander from creature filter', () => {
      const creature = { ...mockCard, type_line: 'Creature' };
      const commander = { ...mockCard, id: 'commander1', type_line: 'Legendary Creature' };

      component.selectedDeck = {
        cards: [creature, commander],
        commander: commander
      };

      const creatures = component.getCardsByType('Creature');

      expect(creatures.length).toBe(1);
      expect(creatures[0].id).toBe('card1');
    });

    it('should group cards by name', () => {
      const card1 = { ...mockCard };
      const card2 = { ...mockCard, id: 'card2' };
      const card3 = { ...mockCard, id: 'card3', name: 'Other Card' };

      const groupedCards = component.groupCardsByName([card1, card2, card3]);

      expect(groupedCards.length).toBe(2);
      expect(groupedCards[0].name).toBe('Test Card');
      expect(groupedCards[0].count).toBe(2);
      expect(groupedCards[1].name).toBe('Other Card');
      expect(groupedCards[1].count).toBe(1);
    });
  });

  describe('Deck Deletion', () => {
    it('should confirm before deleting deck', () => {
      const deck = { id: '1', deckName: 'Test Deck' };
      component.confirmDeleteDeck(deck);

      expect(confirmationService.confirm).toHaveBeenCalled();

      const confirmArg = confirmationService.confirm.calls.mostRecent().args[0];
      expect(confirmArg.message).toContain('Test Deck');
      expect(typeof confirmArg.accept).toBe('function');
    });

    it('should delete deck when confirmed', () => {
      spyOn(dataService, 'deleteDeck').and.returnValue(of({}));
      spyOn(component, 'loadDecks');

      component.deleteDeck('1');

      expect(dataService.deleteDeck).toHaveBeenCalledWith('1');
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Success',
        detail: 'Deck deleted successfully'
      });
      expect(component.loadDecks).toHaveBeenCalled();
    });

    it('should handle error when deleting deck', () => {
      spyOn(console, 'error');
      spyOn(dataService, 'deleteDeck').and.returnValue(throwError(() => new Error('Test error')));

      component.deleteDeck('1');

      expect(console.error).toHaveBeenCalled();
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to delete deck'
      });
    });
  });
});
