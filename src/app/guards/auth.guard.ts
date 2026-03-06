import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }
  
  router.navigate(['/login']);
  return false;
};

export const adminGuard: CanActivateFn = () => {
    const authService = inject(AuthService);
    const router = inject(Router);
  
    if (authService.isAuthenticated() && authService.isAdmin()) {
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
