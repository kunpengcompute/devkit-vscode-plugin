import { Injectable } from '@angular/core';
import { CommonInjector } from '../../injector';
import { MyHttp } from 'sys/model';
import { AxiosInterceptorManager, AxiosRequestConfig, AxiosResponse } from 'axios';

@Injectable({
  providedIn: 'root'
})
export class HttpService extends MyHttp {

  interceptors: {
    request: AxiosInterceptorManager<AxiosRequestConfig>;
    response: AxiosInterceptorManager<AxiosResponse>;
  };

  private myHttp: MyHttp;

  constructor(
    private commonInjector: CommonInjector
  ) {
    super();
    this.myHttp = this.commonInjector.get(MyHttp);
  }

  get<T = any, R = AxiosResponse<T>>(
    url: string, config?: AxiosRequestConfig
  ): Promise<R> {
    return this.myHttp.get(url, config);
  }

  delete<T = any, R = AxiosResponse<T>>(
    url: string, config?: AxiosRequestConfig
  ): Promise<R> {
    return this.myHttp.delete(url, config);
  }

  post<T = any, R = AxiosResponse<T>>(
    url: string, data?: any, config?: AxiosRequestConfig
  ): Promise<R> {
    return this.myHttp.post(url, data, config);
  }

  put<T = any, R = AxiosResponse<T>>(
    url: string, data?: any, config?: AxiosRequestConfig
  ): Promise<R> {
    return this.myHttp.put(url, data, config);
  }
}
