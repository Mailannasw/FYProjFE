import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DeckBuilderComponent } from './deck-builder.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HttpClientModule } from '@angular/common/http';
import { DataService } from '../services/data.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';

// Tests for DeckBuilderComponent
describe('DeckBuilderComponent', () => {
  let component: DeckBuilderComponent;
  let fixture: ComponentFixture<DeckBuilderComponent>;
  let dataService: DataService;
  let messageService: MessageService;
  let router: Router;

  // Before each test, configure these settings
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        DeckBuilderComponent,
        HttpClientTestingModule,
        HttpClientModule,
        CommonModule,
        FormsModule,
        AutoCompleteModule,
        ButtonModule,
        DropdownModule,
        InputTextModule,
        ToastModule
      ],
      providers: [
        DataService,
        MessageService,
        {
          provide: Router,
          useValue: {
            navigate: jasmine.createSpy('navigate')
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DeckBuilderComponent);
    component = fixture.componentInstance;
    dataService = TestBed.inject(DataService);
    messageService = (component as any).messageService;
    router = TestBed.inject(Router);

    spyOn(messageService, 'add');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form validation', () => {
    it('should validate form correctly with standard deck type', () => {
      // Empty form
      expect(component.isFormValid()).toBeFalse();

      // Only deck name
      component.deckName = 'Test Deck';
      expect(component.isFormValid()).toBeFalse();

      // Complete standard deck form
      component.selectedDeckType = { name: 'Standard', value: 'STANDARD' };
      expect(component.isFormValid()).toBeTrue();
    });

    it('should validate form correctly with commander deck type', () => {
      component.deckName = 'Test Commander Deck';
      component.selectedDeckType = { name: 'Commander', value: 'COMMANDER' };

      expect(component.isFormValid()).toBeFalse();

      component.commanderName = 'Atraxa, Praetors\' Voice';
      expect(component.isFormValid()).toBeTrue();
    });
  });

  describe('Commander search', () => {
    it('should not fetch commander suggestions if query length is less than 2', () => {
      const event = {
        originalEvent: new Event('input'),
        query: 'a'
      };
      spyOn(dataService, 'getCardNameSuggestions');

      component.searchCommanderSuggestions(event);

      expect(dataService.getCardNameSuggestions).not.toHaveBeenCalled();
      expect(component.filteredCommanderNames).toEqual([]);
    });

    it('should fetch commander suggestions when query length is 2 or more', fakeAsync(() => {
      const event = {
        originalEvent: new Event('input'),
        query: 'at'
      };
      const mockResponse = {
        data: ['Atraxa, Praetors\' Voice', 'Atarka, World Render', 'Atla Palani, Nest Tender']
      };

      spyOn(dataService, 'getCardNameSuggestions').and.returnValue(of(mockResponse));

      component.searchCommanderSuggestions(event);
      tick();

      expect(dataService.getCardNameSuggestions).toHaveBeenCalledWith('at');
      expect(component.filteredCommanderNames).toEqual(mockResponse.data);
    }));

    it('should limit results to 25 items', fakeAsync(() => {
      const event = {
        originalEvent: new Event('input'),
        query: 'at'
      };
      const mockData = Array(30).fill(0).map((_, i) => `Card ${i}`);
      const mockResponse = {
        data: mockData
      };

      spyOn(dataService, 'getCardNameSuggestions').and.returnValue(of(mockResponse));

      component.searchCommanderSuggestions(event);
      tick();

      expect(component.filteredCommanderNames.length).toBe(25);
    }));
  });

  describe('Deck creation', () => {
    it('should show error message when form is invalid', () => {
      component.createDeck();

      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please fill out all required fields',
        life: 3000
      });
    });

    it('should create a standard deck correctly', fakeAsync(() => {
      const mockDeck = {
        id: 1,
        name: 'Test Standard Deck',
        type: 'STANDARD',
        cards: []
      };

      component.deckName = 'Test Standard Deck';
      component.selectedDeckType = { name: 'Standard', value: 'STANDARD' };

      spyOn(dataService, 'createDeck').and.returnValue(of(mockDeck));
      spyOn(component, 'resetForm');

      component.createDeck();
      tick();

      expect(dataService.createDeck).toHaveBeenCalledWith('Test Standard Deck', 'STANDARD', null);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Success',
        detail: 'Deck created successfully',
        life: 3000
      });
      expect(component.resetForm).toHaveBeenCalled();
    }));

    it('should create a commander deck correctly', fakeAsync(() => {
      const mockDeck = {
        id: 2,
        name: 'Test Commander Deck',
        type: 'COMMANDER',
        commanderName: 'Atraxa, Praetors\' Voice',
        cards: []
      };

      component.deckName = 'Test Commander Deck';
      component.selectedDeckType = { name: 'Commander', value: 'COMMANDER' };
      component.commanderName = 'Atraxa, Praetors\' Voice';

      spyOn(dataService, 'createDeck').and.returnValue(of(mockDeck));
      spyOn(component, 'resetForm');

      component.createDeck();
      tick();

      expect(dataService.createDeck).toHaveBeenCalledWith(
        'Test Commander Deck',
        'COMMANDER',
        'Atraxa, Praetors\' Voice'
      );
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Success',
        detail: 'Deck created successfully',
        life: 3000
      });
      expect(component.resetForm).toHaveBeenCalled();
    }));

    it('should handle error during deck creation', fakeAsync(() => {
      const errorResponse = {
        error: {
          message: 'Invalid commander card'
        }
      };

      component.deckName = 'Test Commander Deck';
      component.selectedDeckType = { name: 'Commander', value: 'COMMANDER' };
      component.commanderName = 'Not a legendary creature';

      spyOn(dataService, 'createDeck').and.returnValue(throwError(() => errorResponse));
      spyOn(component, 'resetForm');

      component.createDeck();
      tick();

      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Invalid commander card',
        life: 5000
      });
      expect(component.resetForm).not.toHaveBeenCalled();
    }));

    it('should handle error without message during deck creation', fakeAsync(() => {
      const errorResponse = { status: 500 };

      component.deckName = 'Test Deck';
      component.selectedDeckType = { name: 'Standard', value: 'STANDARD' };

      spyOn(dataService, 'createDeck').and.returnValue(throwError(() => errorResponse));

      component.createDeck();
      tick();

      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to create deck',
        life: 5000
      });
    }));
  });

  describe('Form reset', () => {
    it('should reset form correctly', () => {
      component.deckName = 'Test Deck';
      component.selectedDeckType = { name: 'Commander', value: 'COMMANDER' };
      component.commanderName = 'Atraxa';
      component.filteredCommanderNames = ['Atraxa', 'Atarka'];

      component.resetForm();

      expect(component.deckName).toBe('');
      expect(component.selectedDeckType).toBeNull();
      expect(component.commanderName).toBe('');
      expect(component.filteredCommanderNames).toEqual([]);
    });
  });
});
