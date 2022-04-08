import { Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse
} from '@angular/common/http';

import { Observable, of, throwError } from 'rxjs';
import { tap } from 'rxjs/internal/operators';
import { Router } from '@angular/router';

/** Pass untouched request through to the next request handler. */
@Injectable()
export class MyInterceptor implements HttpInterceptor {

  constructor(private router: Router) { }

  /**
   * intercept
   * @param req req
   * @param next next
   */
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const currentUserToken = (self as any).webviewSession.getItem('token');
    if (currentUserToken) {
      req = req.clone({
        setHeaders: { Authorization: `${currentUserToken}` }
      });
    }
    return next.handle(req).pipe(
      tap(
        (event) => {
          if (event instanceof HttpResponse) {
            this.handleOkDate(event);
          }
        },
        (error) => {
          this.handleErrorDate(error);
        }
      )
    );
  }

  private handleOkDate(event: HttpResponse<any> | HttpErrorResponse) {
    // 业务处理：一些通用操作
  }

  private handleErrorDate(event: HttpResponse<any> | HttpErrorResponse): Observable<any> {
    // 业务处理：一些通用操作
    switch (event.status) {
      case 401:
        this.router.navigate(['/productDetail']);
        return of(event);
        break;
    }
    return throwError(event);
  }
}
