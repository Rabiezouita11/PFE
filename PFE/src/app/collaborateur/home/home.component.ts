import { Component, OnInit } from '@angular/core';
import { ScriptStyleLoaderService } from 'src/app/Service/ScriptStyleLoaderService/script-style-loader-service.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  roles: string[] = [];
  fileName!: string; // Add fileName property to store the image file name
  userId!: number; // Add userId property to store the user's ID
  image!: string; // Add image property to store the image URL
  username: any;

  constructor(private scriptStyleLoaderService: ScriptStyleLoaderService, private tokenStorage: TokenStorageService) { }

  ngOnInit(): void {
    this.loadScriptsAndStyles();
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
  loadScriptsAndStyles(): void {
    const SCRIPT_PATH_LIST = [
      'assets/frontoffice/vendors/js/vendor.bundle.base.js',
      ' asets/frontoffice/vendors/chart.js/Chart.min.js',
      ' assets/frontoffice/vendors/datatables.net/jquery.dataTables.js',
      ' assets/frontoffice/vendors/datatables.net-bs4/dataTables.bootstrap4.js',
      ' assets/frontoffice/js/dataTables.select.min.js',
      ' assets/frontoffice/js/off-canvas.js',
      ' assets/frontoffice/js/hoverable-collapse.js',
      ' assets/frontoffice/js/template.js',
      ' assets/frontoffice/js/settings.js',
      ' assets/frontoffice/js/todolist.js',
      ' assets/frontoffice/js/dashboard.js',
      ' assets/frontoffice/js/Chart.roundedBarCharts.js',
    ];
    const STYLE_PATH_LIST = [
      'assets/frontoffice/vendors/feather/feather.css',
      'assets/frontoffice/vendors/ti-icons/css/themify-icons.css',
      'assets/frontoffice/vendors/css/vendor.bundle.base.css',
      'assets/frontoffice/vendors/datatables.net-bs4/dataTables.bootstrap4.css',
      'assets/frontoffice/vendors/ti-icons/css/themify-icons.css',
      'assets/frontoffice/js/select.dataTables.min.css',
      'assets/frontoffice/css/vertical-layout-light/style.css',
      'assets/frontoffice/assets/frontoffice/images/favicon.png'
    ];
    this.scriptStyleLoaderService.loadScripts(SCRIPT_PATH_LIST),
      this.scriptStyleLoaderService.loadStyles(STYLE_PATH_LIST)
    // Show the loader

  }


















  }
  

