import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as $ from 'jquery';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-abscencs',
  templateUrl: './abscencs.component.html',
  styleUrls: ['./abscencs.component.css']
})
export class AbscencsComponent implements OnInit {

  fileName !: string;
  userId !: number;
  roles: any;
  username: any;
  image!: string;
  constructor(private http: HttpClient, private router: Router, private tokenStorage: TokenStorageService) { }

  ngOnInit(): void {
    if (this.tokenStorage.getToken()) {
      this.roles = this.tokenStorage.getUser().roles;
      this.userId = this.tokenStorage.getUser().id;
      this.fileName = this.tokenStorage.getUser().photos;
      this.username = this.tokenStorage.getUser().username;
      this.image = this.getImageUrl(); // Call getImageUrl() to construct the image URL

  }



    $(document).ready(function(){
      
      let current_fs: JQuery<HTMLElement>, next_fs: JQuery<HTMLElement>, previous_fs: JQuery<HTMLElement>; // fieldsets
      let opacity: number;
      
      $(".next").click(function(){
          
          current_fs = $(this).parent();
          next_fs = $(this).parent().next();
          
          // Add Class Active
          $("#progressbar li").eq($("fieldset").index(next_fs)).addClass("active");
          
          // Show the next fieldset
          next_fs.show(); 
          // Hide the current fieldset with style
          current_fs.animate({opacity: 0}, {
              step: function(now) {
                  // for making fieldset appear animation
                  opacity = 1 - now;
      
                  current_fs.css({
                      'display': 'none',
                      'position': 'relative'
                  });
                  next_fs.css({'opacity': opacity});
              }, 
              duration: 600
          });
      });
      
      $(".previous").click(function(){
          
          current_fs = $(this).parent();
          previous_fs = $(this).parent().prev();
          
          // Remove class active
          $("#progressbar li").eq($("fieldset").index(current_fs)).removeClass("active");
          
          // Show the previous fieldset
          previous_fs.show();
      
          // Hide the current fieldset with style
          current_fs.animate({opacity: 0}, {
              step: function(now) {
                  // for making fieldset appear animation
                  opacity = 1 - now;
      
                  current_fs.css({
                      'display': 'none',
                      'position': 'relative'
                  });
                  previous_fs.css({'opacity': opacity});
              }, 
              duration: 600
          });
      });
      
      $('.radio-group .radio').click(function(){
          $(this).parent().find('.radio').removeClass('selected');
          $(this).addClass('selected');
      });
      
      $(".submit").click(function(){
          return false;
      });
    });
  }


  getImageUrl(): string { // Assuming your backend endpoint for retrieving images is '/api/images/'
    return `http://localhost:8080/api/auth/images/${this.userId
        }/${this.fileName
        }`;
}

}