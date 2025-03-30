import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private apiUrl = 'http://localhost:8080';        // Port is same as Spring Boot backend so they can communicate

  constructor(private http: HttpClient) {}

  // calls endpoint to return definition of specified word
  getDefinition(word: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/definition/${word}`);
  }

  // calls endpoint to return card by card name
  getCardsByName(cardName: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/cards/search?cardName=${cardName}`)
  }

  // calls endpoint to return card by card ID
  getCardById(cardId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/card/${cardId}`);
  }

  // calls Scryfall API endpoint to return autocomplete suggestions for card names
  getCardNameSuggestions(query: string): Observable<any> {
    return this.http.get<any>(`https://api.scryfall.com/cards/autocomplete?q=${encodeURIComponent(query)}`);
  }

  // calls endpoint for logging in user
  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/user/login`, { username, password });
  }
}
