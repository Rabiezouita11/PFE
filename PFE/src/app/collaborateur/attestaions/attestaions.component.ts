import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AttestationServiceService } from 'src/app/Service/AttestationService/attestation-service.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import Swal from 'sweetalert2';
import { DemandeAttestations } from 'src/app/Models/DemandeAttestations';
import { DemandeAttestationsService } from 'src/app/Service/DemandeAttestations/demande-attestations.service';
declare var $: any;

@Component({
  selector: 'app-attestaions',
  templateUrl: './attestaions.component.html',
  styleUrls: ['./attestaions.component.css']
})
export class AttestaionsComponent implements OnInit {
  attestations: any[] = [];
  selectedAttestation: any;
  pdfData: any;
  @ViewChild('pdfModal') pdfModal: any; // Reference to the modal element
  @ViewChild('pdfIframe') pdfIframe!: ElementRef;
  userId: any;
  demandesAttestations: DemandeAttestations[] = [];

  user: any = {};

  constructor(
    private http: HttpClient,
    private tokenStorage: TokenStorageService,
    private attestationService: AttestationServiceService,
    private demandeAttestationsService: DemandeAttestationsService // Inject the DemandeAttestationsService
  ) { }

  ngOnInit(): void {
    this.loadAttestations();
    if (this.tokenStorage.getToken()) {
      this.userId = this.tokenStorage.getUser().id;
      this.user.username = this.tokenStorage.getUser().username;
      this.user.email = this.tokenStorage.getUser().email;
    }

    this.loadDemandeAttestations();

  }

  loadDemandeAttestations(): void {

    const authToken = this.tokenStorage.getToken();

    if (!authToken) {
      console.error('Authorization token not found');
      Swal.fire('Error!', 'Authorization token not found', 'error');
      return;
    }
    this.demandeAttestationsService.getAllDemandeAttestations(authToken).subscribe(
      data => {
        console.log(this.userId)
        // Filter the data by user_id
        this.demandesAttestations = data.filter(demande => demande.user_id == this.userId);
        console.log(this.demandesAttestations)
      },
      error => {
        console.error('Error fetching demande attestations:', error);
        // Handle error
      }
    );
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
        console.log(this.attestations);
      },
      error => {
        console.log(error);
      }
    );
  }

  removePrefix(pdfPath: string): string {
    // Replace "attestations\" prefix with an empty string
    return pdfPath.replace(/attestations[\/\\]/, '');
  }

  fetchPdf(fileName: string): void {
    console.log(fileName);
    const authToken = this.tokenStorage.getToken();

    if (!authToken) {
      console.error('Authorization token not found');
      Swal.fire('Error!', 'Authorization token not found', 'error');
      return;
    }
    console.log(this.userId);
    console.log(this.user.username);
    console.log(this.user.email);

    this.attestationService.pdfsUser(fileName, authToken, this.userId, this.user.username, this.user.email)
      .subscribe(response => {

        this.pdfData = response.body;
        const blob = new Blob([this.pdfData], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        this.showPdfInModal(url);
      });
  }

  showPdfInModal(pdfUrl: string): void {
    // Set PDF URL to the iframe inside the modal
    this.pdfModal.nativeElement.querySelector('iframe').setAttribute('src', pdfUrl);
    // Open the modal
    $(this.pdfModal.nativeElement).modal('show');
  }

  openFullscreen(): void {
    const iframe = this.pdfIframe.nativeElement;
    if (iframe.requestFullscreen) {
      iframe.requestFullscreen();
    } else if (iframe.mozRequestFullScreen) { /* Firefox */
      iframe.mozRequestFullScreen();
    } else if (iframe.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
      iframe.webkitRequestFullscreen();
    } else if (iframe.msRequestFullscreen) { /* IE/Edge */
      iframe.msRequestFullscreen();
    }
  }

  submitDemande(): void {
    // Check if an attestation is selected
    if (!this.selectedAttestation) {
      Swal.fire('Error!', 'Please select an attestation before submitting', 'error');
      return;
    }

    // Create a new DemandeAttestations object with the selected attestation ID and user ID
    const demandeAttestations: DemandeAttestations = {
      user_id: this.userId,
      attestation_id: this.selectedAttestation.id
    };

    console.log(demandeAttestations)

    // Call the saveDemande method from the service to save the demande d'attestation
    const authToken = this.tokenStorage.getToken();
    if (!authToken) {
      console.error('Authorization token not found');
      Swal.fire('Error!', 'Authorization token not found', 'error');
      return;
    }
    this.demandeAttestationsService.saveDemande(demandeAttestations, authToken).subscribe(
      data => {
        console.log('Demande attestation saved successfully:', data);
        // Optionally, you can display a success message or perform any other action upon successful saving
        Swal.fire('Success!', 'Demande attestation saved successfully', 'success');
      },
      error => {
        console.error('Error saving demande attestation:', error);
        // Optionally, you can display an error message or perform any other action upon error
        Swal.fire('Error!', 'Failed to save demande attestation', 'error');
      }
    );
  }

}
