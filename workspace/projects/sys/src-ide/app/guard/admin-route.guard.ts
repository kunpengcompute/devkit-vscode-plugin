import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class AdminRouteGuard implements CanActivate {
    /**
     * canActivate
     * @param next next
     * @param state state
     */
    canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        const role = self.webviewSession.getItem('role');
        return role === 'Admin';
    }
}
