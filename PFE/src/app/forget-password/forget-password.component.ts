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

  constructor(public service: UserService, private fb: FormBuilder, private router: Router) { }

  ngOnInit() {
    if (this.service.choixmenu == "A") {
      this.initForm();
    }
  }

  initForm() {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.minLength(8)]],
      password: ['', Validators.required]
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

    this.service.forgetPassword(this.form.value.email, this.form.value.password)
      .subscribe(data => {
        this.service.getAll().subscribe(response => { this.service.list = response; });
        this.router.navigate(['/users']);
      });
  }

  login() {
    this.router.navigate(['/login']);
  }

}
