import { Component, OnInit } from '@angular/core';
import { AuthService } from '../_services/auth.service';
import { TokenStorageService } from '../_services/token-storage.service';

@Component({
  selector: 'app-badge',
  templateUrl: './badge.component.html',
  styleUrls: ['./badge.component.css']
})
export class BadgeComponent implements OnInit {
  fileName!: string; // Add fileName property to store the image file name
  userId!: number; // Add userId property to store the user's ID
  image!: string; // Add image property to store the image URL
  isLoggedIn = false;
  isLoginFailed = false;
  roles: string[] = [];
  username !: string;
  email!:string;
  isPrinting: boolean = false;

  constructor( private tokenStorage: TokenStorageService) { }

  ngOnInit(): void {
    if (this.tokenStorage.getToken()) {
      this.isLoggedIn = true;
      this.roles = this.tokenStorage.getUser().roles;
      this.userId = this.tokenStorage.getUser().id;
      this.fileName = this.tokenStorage.getUser().photos;
      this.image = this.getImageUrl(); // Call getImageUrl() to construct the image URL
      this.email = this.tokenStorage.getUser().email;
      this.username = this.tokenStorage.getUser().username;

    }
  }
  getImageUrl(): string {
    // Assuming your backend endpoint for retrieving images is '/api/images/'
    return `http://localhost:8080/api/auth/images/${this.userId}/${this.fileName}`;
  }
  print(): void {
    // Add a class to the badge container for printing
    const badgeContainer = document.querySelector('.badge-container');
    if (badgeContainer) {
        badgeContainer.classList.add('print');
    }
    // Print the page
    window.print();
}
}
