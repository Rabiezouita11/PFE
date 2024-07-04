import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { QuestionsRHService } from 'src/app/Service/QuestionsRH/questions-rh.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import Swal from 'sweetalert2';

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

  constructor(
    private fb: FormBuilder,
        private questionsRHService: QuestionsRHService,
    private tokenStorage: TokenStorageService // Assuming AuthService handles getting user info
  ) { }

  ngOnInit(): void {
    this.loadUserId();
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

  initForm(): void {
    this.questionsForm = this.fb.group({
      categories: ['categories', Validators.required],
      sousCategories: ['', Validators.required],
      titre: ['', Validators.required],
      descriptions: ['', Validators.required],
      piecesJoint: [null],
      userId: [this.userId]
    });

    // Example: Load subcategories based on selected category
    this.questionsForm.get('categories')?.valueChanges.subscribe((category: string) => {
      this.loadSubcategories(category);
    });
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
    //  this.roles = this.tokenStorage.getUser().roles;
      this.userId = this.tokenStorage.getUser().id;
    //  this.fileName = this.tokenStorage.getUser().photos;
  //    this.username = this.tokenStorage.getUser().username;
   //   this.image = this.getImageUrl(); // Call getImageUrl() to construct the image URL
   //   console.log("fileNamefileNamefileName" + this.fileName)

  }
  }
  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
}


  submitForm(): void {
    if (this.questionsForm.valid) {
      console.log('selectedFile:', this.selectedFile);

      const formData = this.questionsForm.value;
      console.log('Categories:', formData.categories);
      console.log('Sous Categories:', formData.sousCategories);
      console.log('Titre:', formData.titre);
      console.log('Descriptions:', formData.descriptions);
      console.log('Pieces Joint:', formData.piecesJoint);
      console.log('User ID:', formData.userId);
      // Call createQuestionsRH method from service
      this.questionsRHService.createQuestionsRH(formData.categories,formData.sousCategories ,formData.titre , formData.descriptions, this.selectedFile ,formData.userId).subscribe(
        (createdQuestion) => {
          // Handle success response
          console.log('Question created:', createdQuestion);

          // Reset form after successful submission
          this.questionsForm.reset();

          // Show success message using SweetAlert
          Swal.fire({
            icon: 'success',
            title: 'Question submitted successfully!',
            showConfirmButton: false,
            timer: 1500
          });
        },
        (error) => {
          // Handle error response
          console.error('Error creating question:', error);

          // Show error message using SweetAlert
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Failed to submit question. Please try again later.',
          });
        }
      );
    } else {
      // Display error or validation messages
      Swal.fire({
        icon: 'error',
        title: 'Form is invalid',
        text: 'Please fill all required fields.',
      });
    }
  }
}

