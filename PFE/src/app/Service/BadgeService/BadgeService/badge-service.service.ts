import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Badge } from 'src/app/Models/badge';

@Injectable({
  providedIn: 'root'
})export class BadgeService {

  private baseUrl = 'http://localhost:8080/api/badges';

  constructor(private http: HttpClient) { }

  createBadgeForUser(userId: number, badgeRequest: any, authToken: string): Observable<Badge> {
    // Construct headers with authorization token
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    });

    // Include headers in the request options
    const requestOptions = {
      headers: headers
    };

    // Make the HTTP POST request with the provided authorization token
    return this.http.post<Badge>(`${this.baseUrl}/${userId}`, badgeRequest, requestOptions);
  }
  getBadgeStatus(userId: number, authToken: string): Observable<any> {
    // Construct headers with authorization token
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    });

    // Include headers in the request options
    const requestOptions = {
      headers: headers
    };

    // Make the HTTP GET request to check badge status
    return this.http.get<any>(`${this.baseUrl}/status/${userId}`, requestOptions);
  }
}
