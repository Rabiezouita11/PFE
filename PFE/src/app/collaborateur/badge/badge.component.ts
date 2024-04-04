import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Component, HostListener, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {Badge} from 'src/app/Models/badge';
import {BadgeService} from 'src/app/Service/BadgeService/BadgeService/badge-service.service';
import {ScriptStyleLoaderService} from 'src/app/Service/ScriptStyleLoaderService/script-style-loader-service.service';
import {TokenStorageService} from 'src/app/_services/token-storage.service';
import Swal from 'sweetalert2';

@Component({selector: 'app-badge', templateUrl: './badge.component.html', styleUrls: ['./badge.component.css']})
export class BadgeComponent implements OnInit {
    roles : string[] = [];
    fileName !: string; // Add fileName property to store the image file name
    userId !: number; // Add userId property to store the user's ID
    image !: string; // Add image property to store the image URL
    imageBadge !: string; // Add image property to store the image URL
    isPrinting : boolean = false;

    username : any;
    dropdownOpen : boolean = false;
    elementRef : any;
    isUICollapsed : boolean = false;
    badges !: Badge[];
    selectedFile : File | null = null;
    badgeId !: number;

    matricule !: string;
    createdBadge !: Badge;
    Newusername : any;
    Newmatricule : any;
    showBadgeForm : boolean = false;
    showBadgeRequestPending : boolean = false; // Declare the property here
    showBadgeRequestAccepter : boolean = false;
    showBadgeRequestRefuse : boolean = false;;
    constructor(private http : HttpClient, private badgeService : BadgeService, private router : Router, private scriptStyleLoaderService : ScriptStyleLoaderService, private tokenStorage : TokenStorageService) {}

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
        this.fetchBadgesByUserId(this.userId); // Replace 123 with the actual user ID

    }
    fetchBadgesByUserId(userId : number): void {
        const authToken = this.tokenStorage.getToken(); // Retrieve the authorization token from local storage
        if (! authToken) {
            console.error('Authorization token not found');
            Swal.fire('Error!', 'Authorization token not found', 'error');

            return;
        }
        this.badgeService.getBadgesByUserId(userId, authToken).subscribe((data : Badge[]) => {
            this.badges = data;


        }, error => {
            console.log(error); // Handle error
        });
    }


    createBadge() {
        const authToken = this.tokenStorage.getToken();
        if (! authToken) {
            console.error('Authorization token not found');
            Swal.fire('Error!', 'Authorization token not found', 'error');
            return;
        }

        this.badgeService.createBadgeForUser(this.userId, this.Newusername, this.Newmatricule, this.selectedFile, authToken).subscribe((data : Badge) => {
            console.log('Badge created successfully:', data);
            Swal.fire('Success!', 'Badge created successfully', 'success');
            this.ngOnInit();
            this.createdBadge = data;
        }, (error) => {
            console.error('Error creating badge:', error);
            Swal.fire('Error!', 'Error creating badge', 'error');
        });
    }
    onFileSelected(event : any) {
        this.selectedFile = event.target.files[0];
    }
    checkBadgeStatus() {
        const authToken = this.tokenStorage.getToken();
        if (! authToken) {
            console.error('Authorization token not found');
            return;
        }

        // Make API request to check badge status
        this.badgeService.getBadgeStatus(this.userId, authToken).subscribe((response : any) => {
            console.log(response);
            if (response.status === 'accepter') { // User has a badge with status "accepter", display form and button to print
                this.showBadgeForm = true;
                this.showBadgeRequestAccepter = true;

            } else if (response.status === 'en cours') { // User does not have a badge with status "accepter", display message indicating request is pending
                this.showBadgeRequestPending = true;
                this.showBadgeForm = true;

            } else if (response.status === 'refuser') {
                this.showBadgeRequestRefuse = true;
                this.showBadgeForm = true;


            } else {
                this.showBadgeForm = false;

            }
        }, (error) => {
            console.error('Error checking badge status:', error);
            // Handle error
        });
    }
    getImageUrl(): string { // Assuming your backend endpoint for retrieving images is '/api/images/'
        return `http://localhost:8080/api/auth/images/${
            this.userId
        }/${
            this.fileName
        }`;
    }
    getImageUrlBadge(badgeId : number, fileBadge : string): string {
        return `http://localhost:8080/api/badges/images/${badgeId}/${fileBadge}`;


    }
    printBadge(): void {
        this.isPrinting = true; // Set isPrinting to true when printing starts

        const printContents = document.getElementById('badge-container').innerHTML;
        const originalContents = document.body.innerHTML;

        // Replace the entire document body with the badge container content
        document.body.innerHTML = printContents;

        // Function to check if all images have loaded
        const checkImagesLoaded = () => {
            const images = document.querySelectorAll('img');
            let allLoaded = true;
            images.forEach((img) => {
                if (!img.complete || img.naturalWidth === 0) {
                    allLoaded = false;
                    return;
                }
            });
            return allLoaded;
        };

        // Check if all images are loaded before printing
        const checkPrint = () => {
            if (checkImagesLoaded()) { // Trigger the print dialog
                window.print();

                // Restore the original document body content after printing
                document.body.innerHTML = originalContents;

                this.isPrinting = false; // Set isPrinting back to false after printing
                window.location.reload();

            } else { // If images are not loaded yet, wait and check again
                setTimeout(checkPrint, 100);
            }
        };

        // Initiate the printing process
        checkPrint();
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
    toggleDropdown(event : Event): void {
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


}
