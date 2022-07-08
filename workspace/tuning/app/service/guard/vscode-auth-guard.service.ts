import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree,
  CanActivate, Router, CanActivateChild
} from '@angular/router';
import { Observable } from 'rxjs';
import { Cat } from 'hyper';

@Injectable({
  providedIn: 'root'
})
export class VscodeAuthGuard implements CanActivate, CanActivateChild {
  constructor(
    private router: Router
  ) { }

  /**
   * 路由守卫
   */
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    return this.identifyAuth(next, state);
  }

  /**
   * 子路由守卫
   */
  canActivateChild(
    childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.identifyAuth(childRoute, state);
  }

  private identifyAuth(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    const intelliJFlag = next.queryParams.intelliJFlag || next.queryParams.intellijFlag;

    // intellij不需要路由守卫
    if (this.judgeIntellijFlag(intelliJFlag)) {
      return true;
    }

    const data = (self as any).navigatorPage.data;
    const webViewSearch = data.webViewSearch ?? {};

    const pureUrl = state.url
      .replace('%5Bobject%20Object%5D', '[object Object]')
      .split('?')[0];

    if (next.queryParams?.hasWebViewSearch) {
      return true;
    } else {
      const urlTree: UrlTree = this.router.createUrlTree([pureUrl], {
        queryParams: { ...next.queryParams, ...webViewSearch, hasWebViewSearch: true },
        fragment: next.fragment
      });
      return urlTree;
    }
  }

  /**
   * intellijFlag会传回多种值
   */
  private judgeIntellijFlag(flag: string | boolean | undefined | null): boolean {
    switch (true) {
      case Cat.isStr(flag):
        return 'true' === (flag as string)?.trim();
      case Cat.isBool(flag):
        return (flag as boolean);
      case Cat.isUndef(flag):
        return false;
      case Cat.isNull(flag):
        return false;
      default:
        return true;
    }
  }
}
