import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../_services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.component.html',
  styleUrls: ['./forget-password.component.css']
})
export class ForgetPasswordComponent implements OnInit {

  form!: FormGroup;
  submitted = false;
  successMessage: string | null = null; // Initialize successMessage as null
  errorMessage: string | null = null; // Initialize errorMessage as null
  
  constructor(public service: UserService, private fb: FormBuilder, private router: Router) { }

  ngOnInit() {
    if (this.service.choixmenu == "A") {
      this.initForm();
    }
  }

  initForm() {
    this.form = this.fb.group({
      email: ['', [Validators.required,, Validators.email, Validators.minLength(8)]],
     
    });
  }

  onReset() {
    this.submitted = false;
    this.router.navigate(['/users']);
  }

  onSubmit() {
    this.submitted = true;

    if (this.form.invalid) {
      return;
    }
    this.successMessage = '';
    this.errorMessage = '';
    this.service.forgetPassword(this.form.value.email)
    .subscribe(
      (response:any) => {
        
          this.successMessage = response.message;
    
      },
      (error) => {
        this.errorMessage = error.error.message;
      }
    );
  }

  login() {
    this.router.navigate(['/login']);
  }

}
