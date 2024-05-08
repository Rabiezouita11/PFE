import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as $ from 'jquery';
import { AbscencsService } from 'src/app/Service/Abscencs/abscencs.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-abscencs',
  templateUrl: './abscencs.component.html',
  styleUrls: ['./abscencs.component.css']
})
export class AbscencsComponent implements OnInit {

  fileName !: string;
  userId !: number;
  roles: any;
  username: any;
  image!: string;


  message: string = '';
  start_date: string | null = null;
  end_date: string | null = null;
  fileToUpload!: File;
  constructor(private abscencsService: AbscencsService ,private http: HttpClient, private router: Router, private tokenStorage: TokenStorageService) { }


  ngOnInit(): void {
    if (this.tokenStorage.getToken()) {
      this.roles = this.tokenStorage.getUser().roles;
      this.userId = this.tokenStorage.getUser().id;
      this.fileName = this.tokenStorage.getUser().photos;
      this.username = this.tokenStorage.getUser().username;
      this.image = this.getImageUrl(); // Call getImageUrl() to construct the image URL

    }



    $(document).ready(function () {
      let current_fs: JQuery<HTMLElement>, next_fs: JQuery<HTMLElement>, previous_fs: JQuery<HTMLElement>; // fieldsets
      let opacity: number;

      $(".next").click(function () {
        // Check if the current step is valid before proceeding
        if (!isStepValid($(this).parent())) {
          return; // Abort moving to the next step
        }

        current_fs = $(this).parent();
        next_fs = $(this).parent().next();

        // Add Class Active
        $("#progressbar li").eq($("fieldset").index(next_fs)).addClass("active");

        // Show the next fieldset
        next_fs.show();
        // Hide the current fieldset with style
        current_fs.animate({ opacity: 0 }, {
          step: function (now) {
            // for making fieldset appear animation
            opacity = 1 - now;

            current_fs.css({
              'display': 'none',
              'position': 'relative'
            });
            next_fs.css({ 'opacity': opacity });
          },
          duration: 600
        });
      });

      $(".previous").click(function () {
        current_fs = $(this).parent();
        previous_fs = $(this).parent().prev();

        // Remove class active
        $("#progressbar li").eq($("fieldset").index(current_fs)).removeClass("active");

        // Show the previous fieldset
        previous_fs.show();

        // Hide the current fieldset with style
        current_fs.animate({ opacity: 0 }, {
          step: function (now) {
            // for making fieldset appear animation
            opacity = 1 - now;

            current_fs.css({
              'display': 'none',
              'position': 'relative'
            });
            previous_fs.css({ 'opacity': opacity });
          },
          duration: 600
        });
      });

      $('.radio-group .radio').click(function () {
        $(this).parent().find('.radio').removeClass('selected');
        $(this).addClass('selected');
      });

      $(".submit").click(function () {
        return false;
      });

      function isStepValid(step: JQuery<HTMLElement>): boolean {
        // Check if the step is valid (e.g., message is entered)

        let isValid: boolean = true;

        if (step.find('textarea[name="message"]').length > 0 && (step.find('textarea[name="message"]').val() as string).trim() === '') {
          // Show SweetAlert confirmation dialog
          Swal.fire({
            icon: 'warning',
            title: 'Oops...',
            text: 'Please write your message!',
            confirmButtonText: 'OK'
          });
          isValid = false;
        }
        
        // Check if "Depuis" and "Jusqu'au" fields are empty
        if (step.find('input[name="start_date"]').length > 0 && (step.find('input[name="start_date"]').val() as string).trim() === '') {
          Swal.fire({
            icon: 'warning',
            title: 'Oops...',
            text: 'Please select a start date!',
            confirmButtonText: 'OK'
          });
          isValid = false;
        }
        if (step.find('input[name="end_date"]').length > 0 && (step.find('input[name="end_date"]').val() as string).trim() === '') {
          Swal.fire({
            icon: 'warning',
            title: 'Oops...',
            text: 'Please select an end date!',
            confirmButtonText: 'OK'
          });
          isValid = false;
        }
        
        // Check if start date is less than end date
        const startDateValue = new Date(step.find('input[name="start_date"]').val() as string);
        const endDateValue = new Date(step.find('input[name="end_date"]').val() as string);
        if (startDateValue >= endDateValue) {
          Swal.fire({
            icon: 'warning',
            title: 'Oops...',
            text: 'Start date must be earlier than end date!',
            confirmButtonText: 'OK'
          });
          isValid = false;
        }
        let justificatifInput = step.find('input[name="justificatif"]');
        if (justificatifInput.length > 0) {
            let file = justificatifInput[0].files[0];
            if (!file) {
                // No file selected
                Swal.fire({
                    icon: 'warning',
                    title: 'Oops...',
                    text: 'Please select a file!',
                    confirmButtonText: 'OK'
                });
                isValid = false;
            } else {
                let validExtensions = ['.pdf', '.png', '.jpg', '.jpeg'];
                let isValidExtension = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
                if (!isValidExtension) {
                    // Invalid file extension
                    Swal.fire({
                        icon: 'warning',
                        title: 'Oops...',
                        text: 'Please select a file with a valid extension (.pdf, .png, .jpg, .jpeg)!',
                        confirmButtonText: 'OK'
                    });
                    isValid = false;
                }
            }
        }
      
        return isValid;
      }
      
      
    });


  }

  submitForm(): void {


    console.log("start_date"+this.start_date)
    console.log("end_date"+this.end_date)
    const authToken = this.tokenStorage.getToken(); // Retrieve the authorization token from local storage
    if (!authToken) {
      console.error('Authorization token not found');
      Swal.fire('Error!', 'Authorization token not found', 'error');
      return;
    }
  
    if (this.message && this.start_date && this.end_date && this.fileToUpload) {
      const formData = new FormData();
      formData.append('file', this.fileToUpload);
      formData.append('message', this.message);
      formData.append('startDate', this.start_date);
      formData.append('endDate', this.end_date);
  console.log(formData);
      this.abscencsService.submitLeaveRequest(formData, authToken).subscribe(
        response => {
          // Handle successful submission
          console.log(response);
          Swal.fire('Success!', 'Leave request submitted successfully!', 'success');
        },
        error => {
          // Handle error
          console.error(error);
          let errorMessage = 'An error occurred while submitting the leave request.';
          if (error && error.error && error.error.message) {
            errorMessage = error.error.message;
          }
          Swal.fire('Error!', errorMessage, 'error');
        }
      );
    } else {
      // Handle validation error
      console.log('Please fill in all required fields.');
      Swal.fire('Error!', 'Please fill in all required fields.', 'error');
    }
  }
  
  formatDate(dateString: string): string {
    // Assuming dateString is in format 'YYYY-MM-DD'
    const parts = dateString.split('-');
    return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
  }
  onFileSelected(event: any): void {
    this.fileToUpload = event.target.files[0];
  }


  getImageUrl(): string { // Assuming your backend endpoint for retrieving images is '/api/images/'
    return `http://localhost:8080/api/auth/images/${this.userId
      }/${this.fileName
      }`;
  }


  
  resetForm(): void {
    // Reset form fields and state
    this.message = '';
    this.start_date = null;
    this.end_date = null;
    this.fileToUpload = null;
  }
  

}