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
  @ViewChild('statusModal') statusModal!: ElementRef;

  userId: any;
  demandesAttestations: DemandeAttestations[] = [];
 // Define properties for status counts
 enCoursCount: number = 0;
 accepterCount: number = 0;
 refuserCount: number = 0;
  user: any = {};
  filteredDemandes: DemandeAttestations[] = [];

  constructor(
    private http: HttpClient,
    private tokenStorage: TokenStorageService,
    private attestationService: AttestationServiceService,
    private demandeAttestationsService: DemandeAttestationsService // Inject the DemandeAttestationsService
  ) { }

  ngOnInit(): void {
  
    if (this.tokenStorage.getToken()) {
      this.userId = this.tokenStorage.getUser().id;
      this.user.username = this.tokenStorage.getUser().username;
      this.user.email = this.tokenStorage.getUser().email;
    }
    this.loadAttestations();
    this.loadDemandeAttestations();

  }
  
  openStatusModal(status: string): void {
    // Filter demandeAttestations based on the status
    const filteredDemandes = this.demandesAttestations.filter(demande => demande.isApproved === status);
    
    // Assign the filtered data to a component property
    this.filteredDemandes = filteredDemandes;
  
    // Show the modal
    $('#statusModal').modal('show');
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
        // Filter the data by user_id
     
        this.demandesAttestations = data.filter(demande => demande.user_id == this.userId);
  
        // Compute counts for each status
        this.enCoursCount = this.demandesAttestations.filter(demande => demande.isApproved === 'en cours').length;
        this.accepterCount = this.demandesAttestations.filter(demande => demande.isApproved === 'accepted').length;
        this.refuserCount = this.demandesAttestations.filter(demande => demande.isApproved === 'refused').length;
  
      
       
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
      (data:any) => { // Specify the type of data parameter
        this.attestations = data;
        console.log(this.attestations); // Log the fetched attestations
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

    if (!fileName.startsWith('generated_pdf')) {
        // Use getPdf API
        this.attestationService.getPdf(fileName, authToken)
            .subscribe(response => {
                if (response.body) { // Check if the response body is not null
                    const blob = new Blob([response.body], { type: 'application/pdf' });
                    const url = window.URL.createObjectURL(blob);
                    this.showPdfInModal(url);
                } else {
                    console.error('PDF content is null');
                    Swal.fire('Error!', 'PDF content is null', 'error');
                }
            });
    } else {
        // Use pdfsUser API with user details
        console.log(this.userId);
        console.log(this.user.username);
        console.log(this.user.email);

        this.attestationService.pdfsUser(fileName, authToken, this.userId, this.user.username, this.user.email)
            .subscribe(response => {
                if (response.body) { // Check if the response body is not null
                    const blob = new Blob([response.body], { type: 'application/pdf' });
                    const url = window.URL.createObjectURL(blob);
                    this.showPdfInModal(url);
                } else {
                    console.error('PDF content is null');
                    Swal.fire('Error!', 'PDF content is null', 'error');
                }
            });
    }
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
        this.ngOnInit();
      },
      error => {
        console.error('Error saving demande attestation:', error);
        // Optionally, you can display an error message or perform any other action upon error
        Swal.fire('Error!', 'Failed to save demande attestation', 'error');
      }
    );
  }
  fetchPdf2(attestationId: number): void {
    const authToken = this.tokenStorage.getToken();

    if (!authToken) {
      console.error('Authorization token not found');
      Swal.fire('Error!', 'Authorization token not found', 'error');
      return;
    }

    this.attestationService.getAllAttestations(authToken).subscribe(
      (data:any) => { // Specify the type of data parameter
        this.attestations = data;
        console.log(this.attestations); // Log the fetched attestations

        // Loop through the attestations to find the one with the matching ID
        const attestation = this.attestations.find(attestation => attestation.id == attestationId);
        if (!attestation) {
            console.error('Attestation with ID', attestationId, 'not found');
            return;
        }

        // Once found, retrieve the pdfPath
        const pdfPath = attestation.pdfPath.replace(/^attestations[\/\\]/, '');
        console.log('PDF Path:', pdfPath);
        $('#statusModal').modal('hide');

          this.fetchPdf(pdfPath);

        // Now you can use the pdfPath as needed
        // For example, call a method to fetch the PDF using the pdfPath
        // this.fetchPdf(pdfPath);
      },
      error => {
        console.log(error);
      }
    );
}
  
  
deleteDemande(id: number , status : string): void {
  const authToken = this.tokenStorage.getToken();

  if (!authToken) {
    console.error('Authorization token not found');
    Swal.fire('Error!', 'Authorization token not found', 'error');
    return;
  }

  this.demandeAttestationsService.deleteDemande(id, authToken).subscribe(
    () => {
      console.log('Demande attestation deleted successfully');
      Swal.fire('Success!', 'Demande attestation deleted successfully', 'success');
      // Reload demande attestations after deletion
      this.loadDemandeAttestations();
      // Close and reopen the modal to refresh its content
      this.closeAndOpenModal(status);
    },
    error => {
      console.error('Error deleting demande attestation:', error);
      Swal.fire('Error!', 'Failed to delete demande attestation', 'error');
    }
  );
}

closeAndOpenModal(status:string): void {
  // Close the modal
  $(this.statusModal.nativeElement).modal('hide');

  // Open the modal again after a short delay
  setTimeout(() => {
    $(this.statusModal.nativeElement).modal('show');
    const filteredDemandes = this.demandesAttestations.filter(demande => demande.isApproved === status);
    
    // Assign the filtered data to a component property
    this.filteredDemandes = filteredDemandes;
  }, 500); // adjust the delay as needed
}
  
  
}
