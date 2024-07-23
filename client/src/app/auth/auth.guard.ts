import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router
} from '@angular/router';

import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean | UrlTree> {
    try {
      await this.authService.tryAutoLogin();
      if (this.authService.isAuthenticated()) {
        return true;
      } else {
        // Navigate to sign-in page if not authenticated
        return this.router.createUrlTree(['/sign-in']);
      }
    } catch (error) {
      console.error('Error during authentication check', error);
      // Navigate to sign-in page in case of error
      return this.router.createUrlTree(['/sign-in']);
    }
  }
}
