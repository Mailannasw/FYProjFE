import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {catchError, map, Observable, throwError} from 'rxjs';

// All requests that hit back end
@Injectable({
  providedIn: 'root'
})
export class DataService {
  private apiUrl = 'http://localhost:8080';    // Port is same as Spring Boot backend so they can communicate

  constructor(private http: HttpClient) {}

  // calls endpoint to return definition of specified word
  getDefinition(word: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/definition/${word}`);
  }

  // calls endpoint to return card by card name
  getCardsByName(cardName: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/cards/search?cardName=${cardName}`)
  }

  // calls Scryfall API endpoint to return autocomplete suggestions for card names
  getCardNameSuggestions(query: string): Observable<any> {
    return this.http.get<any>(`https://api.scryfall.com/cards/autocomplete?q=${encodeURIComponent(query)}`);
  }

  // Send login credentials, returning token if successful
  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/user/login`, { username, password });
  }

  // Request to register new user with username and password
  createUser(username: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/user/create`, { username, password });
  }

// Create Deck with name, type, and commander card name
  createDeck(deckName: string, deckType: string, commanderCardName: string | null): Observable<any> {
    let params = new HttpParams()
      .set('deckName', deckName)
      .set('deckType', deckType);

    if (commanderCardName) {
      params = params.set('commanderCardName', commanderCardName);
    }

    const token = localStorage.getItem('token');
    console.log('Token in createDeck:', token);

    if (!token) {
      console.error('No authentication token found. Please log in again.');
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.post<any>(`${this.apiUrl}/deck/create`, null, {
      params,
      headers
    });
  }

  // Get all decks for the logged-in user
  getMyDecks(): Observable<any> {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<any>(`${this.apiUrl}/decks/AllUserDecks`, { headers });
  }

  // Get deck by ID
  getDeckById(deckId: string): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<any>(`${this.apiUrl}/deck/${deckId}`, { headers });
  }

  // Add cards to deck
  addCardsToDeck(deckId: string, cardNames: string[]): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    let params = new HttpParams()     // Set up params for request
      .set('deckId', deckId);

    cardNames.forEach(name => {             // Add each card name to params
      params = params.append('cardNames', name);
    });

    return this.http.post<any>(`${this.apiUrl}/deck/addCard`, null, {
      params,
      headers
    });
  }

  // Remove card from deck
  removeCardFromDeck(deckId: string, cardId: string): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    const params = new HttpParams()       // Set up params for request
      .set('deckId', deckId)
      .set('cardId', cardId);

    return this.http.delete<any>(`${this.apiUrl}/deck/removeCard`, {
      params,
      headers,
      observe: 'response'
    }).pipe(
      map(response => response.body),
      catchError(error => {
        let errorMessage = 'Failed to remove card from deck';

        if (error.error && error.error.message) {
          errorMessage = error.error.message;
        } else if (error.error && typeof error.error === 'string') {
          errorMessage = error.error;
        }

        return throwError(() => new Error(errorMessage));
      })
    );
  }

  // Delete deck by ID
  deleteDeck(deckId: string): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.delete<any>(`${this.apiUrl}/deck/delete/${deckId}`, {
      headers
    });
  }
}
