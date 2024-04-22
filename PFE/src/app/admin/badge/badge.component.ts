import { Component, OnInit } from '@angular/core';
import { BadgeService } from 'src/app/Service/BadgeService/BadgeService/badge-service.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-badge',
  templateUrl: './badge.component.html',
  styleUrls: ['./badge.component.css']
})
export class BadgeComponent implements OnInit {
  badges!: any[];

  constructor(private badgeService: BadgeService,private tokenStorage: TokenStorageService) { }
  ngOnInit(): void {
    this.fetchBadges();
  }

  fetchBadges(): void {
    const authToken = this.tokenStorage.getToken(); // Retrieve the authorization token from local storage
    if (!authToken) {
      console.error('Authorization token not found');
      Swal.fire('Error!', 'Authorization token not found', 'error');

      return;
    }
    this.badgeService.getAllBadges(authToken)
      .subscribe(
        data => {
          console.log(data)
          this.badges = data;
        },
        error => {
          console.log(error);
        }
      );
  }

  acceptBadge(badgeId: number, username: string): void {
    const authToken = this.tokenStorage.getToken(); // Retrieve the authorization token from local storage
    if (!authToken) {
      console.error('Authorization token not found');
      Swal.fire('Error!', 'Authorization token not found', 'error');

      return;
    }
    Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to accept the badge for ${username}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Accept'
    }).then((result) => {
      if (result.isConfirmed) {
        this.badgeService.acceptBadge(badgeId , authToken).subscribe(() => {
          Swal.fire('Success!', 'Badge accepted successfully!', 'success');
          this.ngOnInit();
          // Reload badges or update the badge list as needed
        }, (error: any) => {
          Swal.fire('Error!', 'Failed to accept badge!', 'error');
        });
      }
    });
  }

  refuseBadge(badgeId: number, username: string): void {
    const authToken = this.tokenStorage.getToken(); // Retrieve the authorization token from local storage
    if (!authToken) {
      console.error('Authorization token not found');
      Swal.fire('Error!', 'Authorization token not found', 'error');

      return;
    }
    Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to refuse the badge for ${username}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Refuse'
    }).then((result) => {
      if (result.isConfirmed) {
        this.badgeService.refuseBadge(badgeId, authToken).subscribe(() => {
          Swal.fire('Success!', 'Badge refused successfully!', 'success');
          this.ngOnInit();

          // Reload badges or update the badge list as needed
        }, (error: any) => {
          Swal.fire('Error!', 'Failed to refuse badge!', 'error');
        });
      }
    });
  }

  updateBadge(badgeId: number, newUsername: string, newMatricule: string): void {
    // Call your service method to update the badge
    this.badgeService.updateBadge(badgeId, newUsername, newMatricule).subscribe(
      (response: any) => {
        // If successful, update the badge list
        this.fetchBadges();
        // Show a success message using SweetAlert
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Badge updated successfully.'
        });
      },
      (error: any) => {
        console.error('Error updating badge:', error);
        // Show an error message using SweetAlert
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error updating badge. Please try again later.'
        });
      }
    );
  }


}
