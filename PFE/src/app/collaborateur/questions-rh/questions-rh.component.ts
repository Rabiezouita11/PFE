import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { QuestionsRH } from 'src/app/Models/QuestionsRH';
import { QuestionsRHService } from 'src/app/Service/QuestionsRH/questions-rh.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import Swal from 'sweetalert2';
declare var $: any;

@Component({
  selector: 'app-questions-rh',
  templateUrl: './questions-rh.component.html',
  styleUrls: ['./questions-rh.component.css']
})
export class QuestionsRhComponent implements OnInit {
  questionsForm!: FormGroup;
  categoriesList: string[] = [
    'Attestations', 'Congés', 'Données administratives',
    'Données contractuelles', 'Données personnelles', 'Maladie'
  ];
  sousCategoriesMap: { [key: string]: string[] } = {
    'Attestations': ['Attestations', 'Autres'],
    'Congés': ['Congés', 'Congés exceptionnels', 'Autre'],
    'Données administratives': ['Demande de badge', 'Déménagement', 'Mode de transport', 'Autre'],
    'Données contractuelles': ['Période d\'essai', 'Temps de travail', 'Autre'],
    'Données personnelles': ['Changement d\'adresse', 'Enfants à charge', 'État civil', 'Personnes à contacter', 'Photo', 'Situation familiale'],
    'Maladie': ['Arrêt de travail', 'Autre']
  };
  sousCategoriesList: string[] = [];
  selectedFile: File | null = null;
  userId: number = 0; // Initialize userId, will be updated from token
  userQuestions: QuestionsRH[] = []; // Array to store the user's questions
  pdfData: any;
  @ViewChild('pdfModal') pdfModal: any; // Reference to the modal element

  @ViewChild('questionHistoryModal') questionHistoryModal: any;

  constructor(
    private fb: FormBuilder,
    private questionsRHService: QuestionsRHService,
    private tokenStorage: TokenStorageService
  ) { }

  ngOnInit(): void {
    this.loadUserId();
    this.initForm();
  }

  initForm(): void {
    this.questionsForm = this.fb.group({
      categories: ['', Validators.required],
      sousCategories: ['', Validators.required],
      titre: ['', Validators.required],
      descriptions: ['', Validators.required],
      piecesJoint: [null],
      userId: [this.userId]
    });

    this.loadSubcategories(this.questionsForm.get('categories')?.value || '');
  }

  onCategoryChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.loadSubcategories(target.value);
  }

  loadSubcategories(category: string): void {
    this.sousCategoriesList = this.sousCategoriesMap[category] || [];
  }

  loadUserId(): void {
    if (this.tokenStorage.getToken()) {
      this.userId = this.tokenStorage.getUser().id;
    }
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  submitForm(): void {
    if (this.questionsForm.valid) {
      const formData = this.questionsForm.value;
      this.questionsRHService.createQuestionsRH(formData.categories, formData.sousCategories, formData.titre, formData.descriptions, this.selectedFile, formData.userId).subscribe(
        (createdQuestion) => {
          console.log('Question created:', createdQuestion);
          this.questionsForm.reset();
          Swal.fire({
            icon: 'success',
            title: 'Question submitted successfully!',
            showConfirmButton: false,
            timer: 1500
          });
        },
        (error) => {
          console.error('Error creating question:', error);
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Failed to submit question. Please try again later.',
          });
        }
      );
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Form is invalid',
        text: 'Please fill all required fields.',
      });
    }
  }

  openQuestionHistory(): void {
    const authToken = this.tokenStorage.getToken();
    if (!authToken) {
      console.error('Authorization token not found');
      Swal.fire('Error!', 'Authorization token not found', 'error');
      return;
    }

    this.questionsRHService.getQuestionsRHById(this.userId).subscribe(
      (data: QuestionsRH[]) => {
        this.userQuestions = data;
        console.log('User Questions:', this.userQuestions);
        $(this.questionHistoryModal.nativeElement).modal('show');
      },
      (error) => {
        console.error('Error fetching user questions:', error);
      }
    );
  }
  fetchPdf2(fileName: string): void {
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
