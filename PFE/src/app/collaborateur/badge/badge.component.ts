import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Badge } from 'src/app/Models/badge';
import { BadgeService } from 'src/app/Service/BadgeService/BadgeService/badge-service.service';
import { ScriptStyleLoaderService } from 'src/app/Service/ScriptStyleLoaderService/script-style-loader-service.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-badge',
  templateUrl: './badge.component.html',
  styleUrls: ['./badge.component.css']
})
export class BadgeComponent implements OnInit {
  roles: string[] = [];
  fileName!: string; // Add fileName property to store the image file name
  userId!: number; // Add userId property to store the user's ID
  image!: string; // Add image property to store the image URL
  username: any;
  dropdownOpen: boolean = false;
  elementRef: any;
  isUICollapsed: boolean = false;

  matricule!: string;
  createdBadge!: Badge;
  Newusername: any;
  Newmatricule: any;
  showBadgeForm: boolean = false;
  showBadgeRequestPending: boolean = false; // Declare the property here
  showBadgeRequestAccepter: boolean= false;
  showBadgeRequestRefuse: boolean= false;;
  constructor(private badgeService: BadgeService, private router: Router, private scriptStyleLoaderService: ScriptStyleLoaderService, private tokenStorage: TokenStorageService) { }

  ngOnInit(): void {
    this.loadScriptsAndStyles();
    if (this.tokenStorage.getToken()) {
      this.roles = this.tokenStorage.getUser().roles;
      this.userId = this.tokenStorage.getUser().id;
      this.fileName = this.tokenStorage.getUser().photos;
      this.username = this.tokenStorage.getUser().username;
      this.image = this.getImageUrl(); // Call getImageUrl() to construct the image URL

    }
    this.checkBadgeStatus();

  }



  createBadge() {


    const authToken = this.tokenStorage.getToken(); // Retrieve the authorization token from local storage
    if (!authToken) {
      console.error('Authorization token not found');
      Swal.fire('Error!', 'Authorization token not found', 'error');

      return;
    }

    const badgeRequest = {
      username: this.Newusername,
      matricule: this.Newmatricule
    };

    this.badgeService.createBadgeForUser(this.userId, badgeRequest, authToken)
      .subscribe(
        (data: Badge) => {
          console.log('Badge created successfully:', data);
          Swal.fire('Success!', 'Badge created successfully', 'success');
          this.ngOnInit();
          this.createdBadge = data;
        },
        (error) => {
          console.error('Error creating badge:', error);
          Swal.fire('Error!', 'Error creating badge', 'error');
        }
      );
  }
  checkBadgeStatus() {
    const authToken = this.tokenStorage.getToken();
    if (!authToken) {
      console.error('Authorization token not found');
      return;
    }
  
    // Make API request to check badge status
    this.badgeService.getBadgeStatus(this.userId, authToken)
      .subscribe(
        (response: any) => {
          console.log(response);
          if (response.status === 'accepter') {
            // User has a badge with status "accepter", display form and button to print
            this.showBadgeForm = true;
            this.showBadgeRequestAccepter = true;

          } else if( response.status === 'en cours'){
            // User does not have a badge with status "accepter", display message indicating request is pending
            this.showBadgeRequestPending = true;
            this.showBadgeForm = true;

          }else if ( response.status === 'refuser'){
            this.showBadgeRequestRefuse = true;
            this.showBadgeForm = true;


          }else{
            this.showBadgeForm = false;

          }
        },
        (error) => {
          console.error('Error checking badge status:', error);
          // Handle error
        }
      );
  }




  getImageUrl(): string {
    // Assuming your backend endpoint for retrieving images is '/api/images/'
    return `http://localhost:8080/api/auth/images/${this.userId}/${this.fileName}`;
  }
  loadScriptsAndStyles(): void {
    const SCRIPT_PATH_LIST = [
      'assets/frontoffice/vendors/js/vendor.bundle.base.js',
      'assets/frontoffice/vendors/chart.js/Chart.min.js',
      'assets/frontoffice/vendors/datatables.net/jquery.dataTables.js',
      'assets/frontoffice/vendors/datatables.net-bs4/dataTables.bootstrap4.js',
      'assets/frontoffice/js/dataTables.select.min.js',
      'assets/frontoffice/js/off-canvas.js',
      'assets/frontoffice/js/hoverable-collapse.js',
      'assets/frontoffice/js/template.js',
      'assets/frontoffice/js/settings.js',
      'assets/frontoffice/js/todolist.js',
      'assets/frontoffice/js/dashboard.js',
      'assets/frontoffice/js/Chart.roundedBarCharts.js',
      'https://code.jquery.com/jquery-3.6.0.min.js'
    ];
    const STYLE_PATH_LIST = [
      'assets/frontoffice/vendors/feather/feather.css',
      'assets/frontoffice/vendors/ti-icons/css/themify-icons.css',
      'assets/frontoffice/vendors/css/vendor.bundle.base.css',
      'assets/frontoffice/vendors/datatables.net-bs4/dataTables.bootstrap4.css',
      'assets/frontoffice/vendors/ti-icons/css/themify-icons.css',
      'assets/frontoffice/js/select.dataTables.min.css',
      'assets/frontoffice/css/vertical-layout-light/style.css',
      'assets/frontoffice/images/favicon.png'
    ];
    this.scriptStyleLoaderService.loadScripts(SCRIPT_PATH_LIST),
      this.scriptStyleLoaderService.loadStyles(STYLE_PATH_LIST)
    // Show the loader

  }
  toggleDropdown(event: Event): void {
    event.stopPropagation(); // Prevent the click event from propagating to the document

    this.dropdownOpen = !this.dropdownOpen;
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: Event): void {
    // Close the dropdown when clicking outside of it
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.dropdownOpen = false;
    }
  }

  logout(): void {
    this.tokenStorage.signOut(); // Clear token storage
    this.router.navigate(['/login']); // Redirect to login page
  }



  toggleUICollapse() {
    this.isUICollapsed = !this.isUICollapsed;
  }










}
