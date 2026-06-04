import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DataService } from '../services/data.service';
import { MessageService } from 'primeng/api';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let dataService: DataService;
  let messageService: MessageService;

  // Before each test, configure these settings
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        NoopAnimationsModule,
        FormsModule,
        AutoCompleteModule,
        DialogModule,
        ToastModule,
        HomeComponent
      ],
      providers: [
        DataService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    dataService = TestBed.inject(DataService);

    messageService = (component as any).messageService;
    spyOn(messageService, 'add');

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Word Definition Search', () => {
    it('should filter words based on input query', () => {
      const event = {
        originalEvent: new Event('input'),
        query: 'vi'
      };

      component.wordSearchSuggestions(event);

      expect(component.filteredWords).toContain('Vigilance');
      expect(component.filteredWords.length).toBe(1);
    });

    it('should show definition dialog when searching for a word', fakeAsync(() => {
      const testDefinition = {
        definition: 'Test definition',
        link: 'https://example.com'
      };
      spyOn(dataService, 'getDefinition').and.returnValue(of(testDefinition));

      component.searchedWord = 'Vigilance';
      component.showDefinitionDialog();
      tick();

      expect(component.dialogHeader).toBe('Vigilance');
      expect(component.definition).toEqual(testDefinition);
      expect(component.visible).toBeTrue();
      expect(component.searchedWord).toBe('');
    }));
  });

  describe('Card Search', () => {
    it('should not fetch card suggestions if query length is less than 2', () => {
      const event = {
        originalEvent: new Event('input'),
        query: 'a'
      };
      spyOn(dataService, 'getCardNameSuggestions');

      component.searchCardSuggestions(event);

      expect(dataService.getCardNameSuggestions).not.toHaveBeenCalled();
      expect(component.filteredCardNames).toEqual([]);
    });

    it('should fetch card suggestions when query length is 2 or more', fakeAsync(() => {
      const event = {
        originalEvent: new Event('input'),
        query: 'bl'
      };
      const mockResponse = {
        data: ['Black Lotus', 'Blacker Lotus', 'Blightsteel Colossus']
      };

      spyOn(dataService, 'getCardNameSuggestions').and.returnValue(of(mockResponse));

      component.searchCardSuggestions(event);
      tick();

      expect(dataService.getCardNameSuggestions).toHaveBeenCalledWith('bl');
      expect(component.filteredCardNames).toEqual(mockResponse.data);
    }));

    it('should show card dialog when searching for a specific card', fakeAsync(() => {
      const mockCard = {
        id: '1',
        name: 'Black Lotus',
        image_uris: { normal: 'image-url' },
        type_line: 'Artifact',
        mana_cost: '{0}',
        oracle_text: 'Sample text',
        set_name: 'Alpha'
      };

      spyOn(dataService, 'getCardsByName').and.returnValue(of(mockCard));

      component.cardName = 'Black Lotus';
      component.showCardDialog();
      tick();

      expect(component.dialogHeader).toBe('Black Lotus');
      expect(component.selectedCard).toEqual(mockCard);
      expect(component.visible).toBeTrue();
      expect(component.cardName).toBe('');
    }));

    it('should show error toast when card is not found', fakeAsync(() => {
      const errorResponse = { status: 404 };

      spyOn(dataService, 'getCardsByName').and.returnValue(throwError(() => errorResponse));

      component.cardName = 'Not A Real Card';
      component.showCardDialog();
      tick();

      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Card Not Found',
        detail: 'Either more than one card matched your search, or 0 cards matched. Try again.',
        life: 5000
      });
      expect(component.visible).toBeFalse();
    }));

    it('should show generic error toast when card search fails', fakeAsync(() => {
      const errorResponse = { status: 500 };

      spyOn(dataService, 'getCardsByName').and.returnValue(throwError(() => errorResponse));

      component.cardName = 'Black Lotus';
      component.showCardDialog();
      tick();

      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'An error occurred while searching for the card.',
        life: 5000
      });
      expect(component.visible).toBeFalse();
    }));
  }); // Fixed missing closing bracket here

  describe('Dialog handling', () => {
    it('should call showDefinitionDialog when searchedWord is set', () => {
      spyOn(component, 'showDefinitionDialog');

      component.searchedWord = 'Flying';
      component.cardName = '';
      component.showDialog();

      expect(component.showDefinitionDialog).toHaveBeenCalled();
    });

    it('should call showCardDialog when cardName is set', () => {
      spyOn(component, 'showCardDialog');

      component.searchedWord = '';
      component.cardName = 'Black Lotus';
      component.showDialog();

      expect(component.showCardDialog).toHaveBeenCalled();
    });
  });
});
