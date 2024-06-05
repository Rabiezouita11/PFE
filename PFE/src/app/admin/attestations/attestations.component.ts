import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AttestationServiceService } from 'src/app/Service/AttestationService/attestation-service.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-attestations',
  templateUrl: './attestations.component.html',
  styleUrls: ['./attestations.component.css']
})
export class AttestationsComponent implements OnInit {
  selectedFile: File | null = null;
  name: string = '';
  isExist: boolean = false;
  message: string = '';
  pdfPath: string = '';
  pdfContent: string = ''; // New property to store PDF content
  showUpload: boolean = false;
  showGeneratePdf: boolean = false;
  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;
  pdfName: any;

  constructor(private attestationService: AttestationServiceService, private tokenStorage: TokenStorageService) { }

  ngOnInit(): void {
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
    // If a file is selected, set isExist to true; otherwise, keep it as false
    this.isExist = !!this.selectedFile;
  }
  showUploadForm() {
    this.showUpload = true;
    this.showGeneratePdf = false;
}

// Method to show the generate PDF form
showGeneratePdfForm() {
    this.showUpload = false;
    this.showGeneratePdf = true;
}
  onSubmit(): void {
    const authToken = this.tokenStorage.getToken();

    if (!authToken) {
      console.error('Authorization token not found');
      Swal.fire('Error!', 'Authorization token not found', 'error');
      return;
    }

    // Perform client-side validation
    if (!this.name.trim()) {
      Swal.fire('Error!', 'Name is required', 'error');
      return;
    }

    this.attestationService.saveAttestation(this.selectedFile, this.name, this.isExist, authToken)
      .subscribe(response => {
        this.message = response;
        Swal.fire('Success!', this.message, 'success');
        // Reset input fields after successful submission
        this.selectedFile = null;
        this.name = '';
        this.isExist = false;
        this.pdfPath = ''; // Optionally reset pdfPath as well if needed
        if (this.fileInputRef) {
          this.fileInputRef.nativeElement.value = '';
        }
      }, error => {
        if (error.error) {
          this.message = error.error;
        } else {
          this.message = 'Failed to upload file.';
        }
        console.error('Error:', error);
        Swal.fire('Error!', this.message, 'error');
      });
  }

  generatePdf(): void {
    const authToken = this.tokenStorage.getToken();
    if (!authToken) {
      console.error('Authorization token not found');
      Swal.fire('Error!', 'Authorization token not found', 'error');
      return;
    }

    // Perform client-side validation
    if (!this.pdfContent.trim()) {
      Swal.fire('Error!', 'PDF Content is required', 'error');
      return;
    }

    // Call the service method to generate PDF
    this.attestationService.generatePdf(this.pdfContent, this.pdfName, authToken)
      .subscribe(response => {
        this.pdfPath = response; // Assuming response contains PDF path
        Swal.fire('Success!', 'PDF generated successfully', 'success');
        this.pdfContent = '';
        this.pdfName = '';
      }, error => {
        console.error('Error:', error);
        Swal.fire('Error!', 'Failed to generate PDF', 'error');
      });
  }
}
