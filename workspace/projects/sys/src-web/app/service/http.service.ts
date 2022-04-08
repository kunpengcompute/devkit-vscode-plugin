import { Injectable } from '@angular/core';
import {
  AxiosRequestConfig, AxiosResponse, AxiosStatic,
  AxiosInterceptorManager,
  AxiosError
} from 'axios';
import { MyHttp } from 'sys/model';
import { AxiosService } from './axios.service';

@Injectable({
  providedIn: 'root'
})
export class HttpService extends MyHttp {

  interceptors: {
    request: AxiosInterceptorManager<AxiosRequestConfig>;
    response: AxiosInterceptorManager<AxiosResponse>;
  };

  private axios: AxiosStatic;

  constructor(
    private axiosService: AxiosService
  ) {

    super();
    this.axios = this.axiosService.axios;
  }

  get<T = any, R = AxiosResponse<T>>(
    url: string, config?: AxiosRequestConfig
  ): Promise<R> {

    return new Promise<R>((resolve, reject) => {
      this.axios.get(url, config).then((response: any) => {
        resolve(response);
      }).catch((error: AxiosError<T>) => {
        reject(error.response?.data);
      });
    });
  }

  delete<T = any, R = AxiosResponse<T>>(
    url: string, config?: AxiosRequestConfig
  ): Promise<R> {

    return new Promise<R>((resolve, reject) => {
      this.axios.delete(url, config).then((response: any) => {
        resolve(response);
      }).catch((error: AxiosError<T>) => {
        reject(error.response?.data);
      });
    });
  }

  post<T = any, R = AxiosResponse<T>>(
    url: string, data?: any, config?: AxiosRequestConfig
  ): Promise<R> {

    return new Promise<R>((resolve, reject) => {
      this.axios.post(url, data, config).then((response: any) => {
        resolve(response);
      }).catch((error: AxiosError<T>) => {
        reject(error.response?.data);
      });
    });
  }

  put<T = any, R = AxiosResponse<T>>(
    url: string, data?: any, config?: AxiosRequestConfig
  ): Promise<R> {

    return new Promise<R>((resolve, reject) => {
      this.axios.put(url, data, config).then((response: any) => {
        resolve(response);
      }).catch((error: AxiosError<T>) => {
        reject(error.response?.data);
      });
    });
  }
}
