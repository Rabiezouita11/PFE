import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment'; // Assuming you have environment configurations
import { QuestionsRH } from 'src/app/Models/QuestionsRH';

@Injectable({
  providedIn: 'root'
})
export class QuestionsRHService {

  private apiUrl = 'http://localhost:8080/api'; // Replace with your API base URL

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    let headers = new HttpHeaders();
    const authToken = localStorage.getItem('authToken'); // Retrieve token from localStorage
    if (authToken) {
      headers = headers.set('Authorization', `Bearer ${authToken}`);
    }
    return headers;
  }

  getAllQuestionsRH(): Observable<QuestionsRH[]> {
    return this.http.get<QuestionsRH[]>(`${this.apiUrl}/QuestionsRH/`, { headers: this.getHeaders() });
  }

  getQuestionsRHById(id: number): Observable<QuestionsRH> {
    return this.http.get<QuestionsRH>(`${this.apiUrl}/QuestionsRH/${id}`, { headers: this.getHeaders() });
  }

  createQuestionsRH(questionsRH: QuestionsRH | FormData): Observable<QuestionsRH> {
    if (questionsRH instanceof FormData) {
      // Handle FormData for file uploads
      return this.http.post<QuestionsRH>(`${this.apiUrl}/QuestionsRH/`, questionsRH, { headers: this.getHeaders() });
    } else {
      // Handle regular JSON object
      return this.http.post<QuestionsRH>(`${this.apiUrl}/QuestionsRH/`, questionsRH, { headers: this.getHeaders() });
    }
  }


  updateQuestionsRH(id: number, questionsRH: QuestionsRH): Observable<QuestionsRH> {
    return this.http.put<QuestionsRH>(`${this.apiUrl}/QuestionsRH/${id}`, questionsRH, { headers: this.getHeaders() });
  }

  deleteQuestionsRH(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/QuestionsRH/${id}`, { headers: this.getHeaders() });
  }
}
