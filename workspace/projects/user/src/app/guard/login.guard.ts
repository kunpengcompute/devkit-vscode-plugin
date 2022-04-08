import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {
  public isHome: boolean;  // 判断当前页面是否是home页
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot )
  : Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (state.url === '/home' || state.url === '/') {
      this.isHome = true;
    } else {
      this.isHome = false;
    }
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
