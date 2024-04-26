import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from 'src/app/Models/User';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private baseUrl = 'http://localhost:8080/api/Gestionnaire/users';
  private authToken!: string; // Add authToken property

  constructor(private http : HttpClient) {}


  getAllUsers(authToken : string): Observable<User[]> {
    // Create headers with authorization token
    const headers = new HttpHeaders(
      {'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}`}
  );

    // Include headers in the request options
    const requestOptions = {
      headers: headers
  };
    // Make GET request with options
    return this.http.get<User[]>(this.baseUrl, requestOptions);
  }
  updateStatus(userId: number, newStatus: boolean, authToken: string): Observable<any> {
    // Create headers with authorization token
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    });

    // Include headers in the request options
    const requestOptions = {
      headers: headers
    };

    // Make PUT request with options
    return this.http.put<any>(`${this.baseUrl}/${userId}/status?newStatus=${newStatus}`, {}, requestOptions);
  }
}
