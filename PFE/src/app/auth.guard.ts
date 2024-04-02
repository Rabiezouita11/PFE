import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { TokenStorageService } from './_services/token-storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private tokenStorage: TokenStorageService, private router: Router) {}

  canActivate(): boolean {
    const userRoles = this.tokenStorage.getUser().roles;
    // Check if the user is logged in and has the required role
    if (this.tokenStorage.getToken() && userRoles.includes('ROLE_MANAGER')) {
      return true; // Allow access to the route
    } else {
      // User is not logged in or does not have the required role, redirect to login page
      this.router.navigate(['/login']);
      return false;
    }
  }
}
