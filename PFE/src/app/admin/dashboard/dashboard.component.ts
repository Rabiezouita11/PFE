import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AttestationServiceService } from 'src/app/Service/AttestationService/attestation-service.service';
import { ScriptStyleLoaderService } from 'src/app/Service/ScriptStyleLoaderService/script-style-loader-service.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  username: any;
  role: any;
  attestations: any[] = [];

  constructor(private attestationService: AttestationServiceService ,private router:Router,private scriptStyleLoaderService: ScriptStyleLoaderService, private tokenStorage: TokenStorageService) { }

  ngOnInit(): void {
    if (this.tokenStorage.getToken()) {
      
      this.username = this.tokenStorage.getUser().username;
      this.role = this.tokenStorage.getUser().roles;

    }


    this.loadAttestations();

  }
  loadAttestations(): void {
    const authToken = this.tokenStorage.getToken();

    if (!authToken) {
      console.error('Authorization token not found');
      Swal.fire('Error!', 'Authorization token not found', 'error');
      return;
    }
  
    this.attestationService.getAllAttestations(authToken).subscribe(
      data => {
        this.attestations = data;
        console.log(this.attestations)
      },
      error => {
        console.log(error);
      }
    );
  }
}
