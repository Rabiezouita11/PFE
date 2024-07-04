import { Component, OnInit, ViewChild } from '@angular/core';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { QuestionsRH } from 'src/app/Models/QuestionsRH';
import { QuestionsRHService } from 'src/app/Service/QuestionsRH/questions-rh.service';
import Swal from 'sweetalert2';
declare var $: any;

@Component({
  selector: 'app-questions-rh',
  templateUrl: './questions-rh.component.html',
  styleUrls: ['./questions-rh.component.css']
})
export class QuestionsRhComponent implements OnInit {
  questionsList: QuestionsRH[] = [];
  pdfData: any;
  @ViewChild('pdfModal') pdfModal: any; // Reference to the modal element

  constructor(private questionsRHService: QuestionsRHService , private tokenStorage: TokenStorageService ) { }

  ngOnInit(): void {
    this.loadDemandeQuestionRh();
  }

  loadDemandeQuestionRh() {
    this.questionsRHService.getAllQuestionsRH().subscribe(
      (data) => {
        this.questionsList = data;
        console.log( this.questionsList)
      },
      (error) => {
        console.error('Error fetching questions:', error);
      }
    );
  }
  fetchPdf(fileName: string): void {
    const authToken = this.tokenStorage.getToken();

    if (!authToken) {
      console.error('Authorization token not found');
      Swal.fire('Error!', 'Authorization token not found', 'error');
      return;
    }
    this.questionsRHService.getPdf(fileName, authToken).subscribe(response => {
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
}
