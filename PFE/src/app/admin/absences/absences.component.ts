import { Component, OnInit } from '@angular/core';
import { CongerMaladieService } from 'src/app/Service/CongerMaladie/conger-maladie.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-absences',
  templateUrl: './absences.component.html',
  styleUrls: ['./absences.component.css']
})
export class AbsencesComponent implements OnInit {
  congerMaldierList: any[] = [];

  constructor(private congerMaladieService: CongerMaladieService,private tokenStorage: TokenStorageService) { }

  ngOnInit(): void {
    this.loadCongerMaladieList();

  }
  loadCongerMaladieList() {

    const authToken = this.tokenStorage.getToken(); // Retrieve the authorization token from local storage
    if (!authToken) {
      console.error('Authorization token not found');
      Swal.fire('Error!', 'Authorization token not found', 'error');

      return;
    }
    this.congerMaladieService.getAllCongerMaladie(authToken).subscribe(
      (data: any) => {
        this.congerMaldierList = data;
        console.log(this.congerMaldierList)
      },
      (error: any) => {
        console.log('Error fetching conger maladie list:', error);
      }
    );
  }

  updateStatus(congerMaladieId: number, newStatus: string) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You are about to update the status!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, update it!'
    }).then((result) => {
      if (result.isConfirmed) {
        const authToken = this.tokenStorage.getToken(); // Retrieve the authorization token from local storage
        if (!authToken) {
          console.error('Authorization token not found');
          Swal.fire('Error!', 'Authorization token not found', 'error');
          return;
        }
        this.congerMaladieService.updateCongerMaladieStatus(congerMaladieId, newStatus, authToken).subscribe(
          (response: any) => {
            console.log('Status updated successfully:', response);
            // Refresh the conger maladie list after status update
            this.loadCongerMaladieList();
            Swal.fire('Updated!', 'Status has been updated.', 'success');
          },
          (error: any) => {
            console.log('Error updating status:', error);
            Swal.fire('Error!', 'Failed to update status.', 'error');
          }
        );
      }
    });
  }
}

