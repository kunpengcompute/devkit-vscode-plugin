import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

export class HttpService {

  restServer: string; // 默认为public
  http: any;

  constructor(Http: HttpClient) {
  this.http = Http;
  this.restServer = '';
}
private getHttpOptions = {
  headers: new HttpHeaders({
     'Content-Type': 'application/json'
  })
 };
private PostHttpOptions = {
  headers: new HttpHeaders({
     'Content-Type': 'application/json'
  })
 };
public get(url: string, params?: any, cb?: (...args: any[]) => void, options?: object) {
let httpParams = new HttpParams();
options = options || this.getHttpOptions;

if (params) {
  Object.keys(params).forEach(key => {
    if (params[key] === false || params[key]) {
      httpParams = httpParams.set(key, params[key]);
    }
  });
}


this.http.get(this.restServer + url, { headers: options, params: httpParams })
  .subscribe((res: any) => {
    cb(res);
  });
}

public post(url: string, data?: object, cb?: (...args: any[]) => void, options?: object) {
options = options || this.PostHttpOptions;
this.http.post(this.restServer + url, data, options)
  .subscribe((res: any) => {
    cb(res);
  });
}

public put(url: string, data?: object, cb?: (...args: any[]) => void, options?: object) {

this.http.put(this.restServer + url, data, options)
  .subscribe((res: any) => {
    cb(res);
  });
}

public delete(url: string, params?: any, cb?: (...args: any[]) => void, options?: object) {
let httpParams = new HttpParams();
if (params) {
  Object.keys(params).forEach(key => {
    if (params[key]) {
      httpParams = httpParams.set(key, params[key]);
    }
  });
}
this.http.delete(this.restServer + url, { headers: options, params: httpParams })
  .subscribe((res: any) => {
    cb(res);
  });
}
}
