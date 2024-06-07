import { Component, OnInit } from '@angular/core';
import { DemandeAttestations } from 'src/app/Models/DemandeAttestations';
import { User } from 'src/app/Models/User';
import { DemandeAttestationsService } from 'src/app/Service/DemandeAttestations/demande-attestations.service';
import { UsersService } from 'src/app/Service/users/users.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-demande-attestations',
  templateUrl: './demande-attestations.component.html',
  styleUrls: ['./demande-attestations.component.css']
})
export class DemandeAttestationsComponent implements OnInit {
  users: User[] = [];
  demandeAttestations: DemandeAttestations[] = [];
  selectedUser!: User; // Assuming User interface is defined

  constructor(    private demandeAttestationsService: DemandeAttestationsService,
    private userService: UsersService,private tokenStorage: TokenStorageService) { }

  ngOnInit(): void {
    this.loadDemandeAttestations();

  }
  
  loadDemandeAttestations(): void {
    // Retrieve the authorization token from local storage
    const authToken = this.tokenStorage.getToken(); 
    if (!authToken) {
      console.error('Authorization token not found');
      Swal.fire('Error!', 'Authorization token not found', 'error');
      return;
    }

    // Fetch demande attestations using the service
    this.demandeAttestationsService.getAllDemandeAttestations(authToken).subscribe(
      (data: DemandeAttestations[]) => {
        this.demandeAttestations = data;
        console.log(this.demandeAttestations);
      },
      error => {
        console.log('Error fetching demande attestations:', error);
      }
    );
  }

loadUsers(userId: number) {
  // Set the auth token before fetching users
  const authToken = this.tokenStorage.getToken(); // Retrieve the authorization token from local storage
  if (!authToken) {
    console.error('Authorization token not found');
    Swal.fire('Error!', 'Authorization token not found', 'error');
    return;
  }
  this.userService.getAllUsers(authToken).subscribe(
    (data: User[]) => {
      // Filter users by userId
      this.users = data.filter(user => user.id === userId);
      console.log(this.users);
    },
    error => {
      console.log('Error fetching users:', error);
    }
  );
}

}
