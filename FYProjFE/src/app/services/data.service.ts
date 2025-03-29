import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private apiUrl = 'http://localhost:8080'; // Port is same as Spring Boot backend so they can communicate

  constructor(private http: HttpClient) {}

  getDefinition(word: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/definition/${word}`);
  }
}
