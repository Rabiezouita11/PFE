import { Component, OnInit } from '@angular/core';
import { AuthService } from '../_services/auth.service';
import { TokenStorageService } from '../_services/token-storage.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  form: any = {
    username: null,
    password: null
  };
  isLoggedIn = false;
  isLoginFailed = false;
  errorMessage = '';
  roles: string[] = [];
  fileName!: string; // Add fileName property to store the image file name
  userId!: number; // Add userId property to store the user's ID
  image!: string; // Add image property to store the image URL

  constructor(private router: Router, private authService: AuthService, private tokenStorage: TokenStorageService) { }

  ngOnInit(): void {
    if (this.tokenStorage.getToken()) {
      this.isLoggedIn = true;
      this.roles = this.tokenStorage.getUser().roles;
      this.userId = this.tokenStorage.getUser().id;
      this.fileName = this.tokenStorage.getUser().photos;
      this.image = this.getImageUrl(); // Call getImageUrl() to construct the image URL

    }
  }
  getImageUrl(): string {
    // Assuming your backend endpoint for retrieving images is '/api/images/'
    return `http://localhost:8080/api/auth/images/${this.userId}/${this.fileName}`;
  }
  onSubmit(): void {
    const { username, password } = this.form;

    this.authService.login(username, password).subscribe(
      data => {
        this.tokenStorage.saveToken(data.accessToken);
        this.tokenStorage.saveUser(data);

        const userRoles = this.tokenStorage.getUser().roles;

        // Check if ROLE_MANAGER exists in user roles
        const isManager = userRoles.includes('ROLE_MANAGER');

        // Check if ROLE_COLLABORATEUR exists in user roles
        const isCollaborateur = userRoles.includes('ROLE_COLLABORATEUR');

        if (isManager) {
          // If user is a manager, navigate to dashboard
          this.router.navigate(['/dashboard']);
        } else if (isCollaborateur) {
          // If user is a collaborateur, navigate to collaborateur/dashboard
          this.router.navigate(['/collaborateur/dashboard']);
        } else {
          // If user is neither manager nor collaborateur, handle accordingly
          // For example, redirect to a different page or display a message
          console.log("User is not a manager or collaborateur");
        }
      },
      err => {
        console.log(err)
        this.errorMessage = err.error.message;
        this.isLoginFailed = true;
      }
    );
  }

  reloadPage(): void {
    window.location.reload();
  }
}
