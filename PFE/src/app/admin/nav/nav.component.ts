import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ScriptStyleLoaderService } from 'src/app/Service/ScriptStyleLoaderService/script-style-loader-service.service';
import { WebSocketService } from 'src/app/Service/WebSocket/web-socket.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {

  roles: string[] = [];
  fileName!: string; // Add fileName property to store the image file name
  userId!: number; // Add userId property to store the user's ID
  image!: string; // Add image property to store the image URL
  username: any;
  elementRef: any;
  isUICollapsed: boolean = false;
  dropdownOpen = false;
  public userNotifications: { userId: number, fileName: string , message : string , username :string , id : number}[] = [];

  constructor(private webSocketService: WebSocketService ,private router:Router,private scriptStyleLoaderService: ScriptStyleLoaderService, private tokenStorage: TokenStorageService) { }

  ngOnInit(): void {
    const authToken = this.tokenStorage.getToken();

    if (!authToken) {
      console.error('Authorization token not found');
      return;
    }
    this.webSocketService.getAllNotifications(authToken).subscribe((notifications: any) => {
      this.userNotifications = notifications;
    });
    let stompClient = this.webSocketService.connect();
    stompClient.connect({}, (frame: any) => {
      stompClient.subscribe('/topic/notification', (message: { body: string; }) => {
        // Add new notification to the array
        let data = JSON.parse(message.body);
        this.userNotifications.push({ userId: data.userId, fileName: data.fileName  ,  message:data.message , username : data.username  , id : data.id});
      });
    });
    if (this.tokenStorage.getToken()) {
      this.roles = this.tokenStorage.getUser().roles;
      this.userId = this.tokenStorage.getUser().id;
      this.fileName = this.tokenStorage.getUser().photos;
      this.username = this.tokenStorage.getUser().username;
      this.image = this.getImageUrl(); // Call getImageUrl() to construct the image URL

    }
    
  }
  getImageUrl(): string {
    // Assuming your backend endpoint for retrieving images is '/api/images/'
    return `http://localhost:8080/api/auth/images/${this.userId}/${this.fileName}`;
  }
  getImageUrlNotifications(userId: number, fileName: string): string {
    // Assuming your backend endpoint for retrieving images is '/api/images/'
    return `http://localhost:8080/api/auth/images/${userId}/${fileName}`;
  }
  toggleDropdown(event: Event): void {
    event.stopPropagation(); // Prevent the click event from propagating to the document
  
    this.dropdownOpen = !this.dropdownOpen;
  }
  


  logout(): void {
    this.tokenStorage.signOut(); // Clear token storage
    this.router.navigate(['/login']); // Redirect to login page
  }



  toggleUICollapse() {
    this.isUICollapsed = !this.isUICollapsed;
  }
  @HostListener('document:click', ['$event'])
  handleClickOutside(event: Event): void {
    // Check if elementRef is defined before accessing its properties
    if (this.elementRef && this.elementRef.nativeElement && !this.elementRef.nativeElement.contains(event.target)) {
      this.dropdownOpen = false;
    }
  }



  confirmDeleteNotification(id: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this notification?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it'
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteNotification(id);
      }
    });
  }

  deleteNotification(id: number): void {
    const authToken = this.tokenStorage.getToken();
    if (!authToken) {
      console.error('Authorization token not found');
      return;
    }
    this.webSocketService.deleteNotificationById(id, authToken).subscribe(() => {
      this.userNotifications = this.userNotifications.filter(notification => notification.id !== id);
      Swal.fire('Deleted!', 'The notification has been deleted.', 'success');
    });
  }
}
