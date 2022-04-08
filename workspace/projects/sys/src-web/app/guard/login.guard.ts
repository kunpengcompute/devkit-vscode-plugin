import { Injectable } from '@angular/core';
import { CanActivate, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {
  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const token = sessionStorage.getItem('token');
    if (!token) {
      sessionStorage.setItem('loginId', '');
      window.location.href = window.location.origin + '/' + 'user-management' + '/#/login';
      return false;
    } else {
      return true;
    }
  }
}
