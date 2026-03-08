import { inject, PLATFORM_ID } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { isPlatformBrowser } from '@angular/common';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // If on server, we can't check localStorage, so we wait for browser hydration
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  if (authService.isAuthenticated()) {
    return true;
  }
  
  router.navigate(['/login']);
  return false;
};

export const adminGuard: CanActivateFn = () => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const platformId = inject(PLATFORM_ID);

    if (!isPlatformBrowser(platformId)) {
      return true;
    }
  
    if (authService.isAuthenticated() && authService.isManager()) {
      return true;
    }
    
    // Redirect clients to store if they are trying to access admin panel
    if(authService.isAuthenticated()) {
        router.navigate(['/store']);
        return false;
    }
    
    router.navigate(['/login']);
    return false;
  };
