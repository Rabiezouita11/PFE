import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { UserService } from '../_services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MustMatch } from '../validator/must-match.validator';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  submitted = true; // Change to true to display validation messages on load
  token!: string;
  form!: FormGroup;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(public service: UserService, public fb: FormBuilder,
    private router: Router, private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.infoForm();
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
    });

    this.f.token.setValue(this.token);
  }

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  infoForm() {
    this.form = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      pwd: ['', [Validators.required]],
      token: ['']
    }, {
      validator: MustMatch('password', 'pwd')
    });
  }

  onReset() {
    this.submitted = false;
    this.router.navigate(['/users']);
  }

  onSubmit() {
    this.submitted = true;
    this.successMessage = '';
    this.errorMessage = '';
    this.service.resetPassword(this.token, this.form.value.password)
      .subscribe((response: any) => {
        this.successMessage = response.message;
      },
      (error) => {
        this.errorMessage = error.error.message;
      }
    );
  }
}
