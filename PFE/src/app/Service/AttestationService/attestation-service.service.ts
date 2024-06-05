import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UploadResponse } from 'src/app/Models/UploadResponse';

@Injectable({
  providedIn: 'root'
})
export class AttestationServiceService {
  private baseUrl = 'http://localhost:8080/api/Gestionnaire'; // Adjust the base URL according to your backend configuration
  pdfContent: string = ''; // New property to store PDF content

  constructor(private http: HttpClient) { }

  saveAttestation(file: File | null, name: string, isExist: boolean, authToken: string): Observable<string> {
    const formData = new FormData();
    if (file) {
      formData.append('file', file);
    }
    formData.append('name', name);
    formData.append('isExist', isExist ? 'true' : 'false');

    const headers = new HttpHeaders({ 'Authorization': `Bearer ${authToken}` });

    return this.http.post<string>(`${this.baseUrl}/SaveAttestations`, formData, { headers: headers, responseType: 'text' as 'json' });
  }

  generatePdf(pdfContent: string, pdfName: string, authToken: string): Observable<string> {
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${authToken}` });

    return this.http.post<string>(
      `${this.baseUrl}/GeneratePdf`, 
      { pdfContent, pdfName }, 
      { headers: headers, responseType: 'text' as 'json' }
    );
  }
}
