import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { Router } from '@angular/router';
@Injectable({
    providedIn: 'root'
})

export class LoginGuard implements CanActivate{
    constructor(public router: Router) {}

    canActivate(){
        const token = sessionStorage.getItem('token');
        let loggedIn = false;
        if (token) {
            loggedIn = true;
        } else {
            this.router.navigate(['/login']);
        }
        return loggedIn;
    }
}
