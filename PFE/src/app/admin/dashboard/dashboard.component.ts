import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ScriptStyleLoaderService } from 'src/app/Service/ScriptStyleLoaderService/script-style-loader-service.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  username: any;
  role: any;

  constructor(private router:Router,private scriptStyleLoaderService: ScriptStyleLoaderService, private tokenStorage: TokenStorageService) { }

  ngOnInit(): void {
    if (this.tokenStorage.getToken()) {
      
      this.username = this.tokenStorage.getUser().username;
      this.role = this.tokenStorage.getUser().roles;

    }
  }

}
