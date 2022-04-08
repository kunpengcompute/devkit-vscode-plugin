import { ComponentRef, Injectable } from '@angular/core';
import {
  AxiosRequestConfig, AxiosResponse,
  AxiosInterceptorManager
} from 'axios';
import { CreateLoadingRefService } from 'sys/src-com/app/shared/directives/loading/service/create-loading-ref.service';
import { MyHttp } from 'sys/model';
import { VscodeService } from './vscode.service';
import { LoadingScene } from 'sys/src-com/app/shared/directives/loading/domain';
import { LoadingComponent } from 'sys/src-com/app/shared/directives/loading/component/loading/loading.component';
import { Cat } from 'projects/hyper/util';

export const enum RespCode {
  OK = 'SysPerf.Success',
}

@Injectable({
  providedIn: 'root'
})
export class HttpService extends MyHttp {

  /** LoadingComponent 的组件引用 */
  private loadingRef: ComponentRef<LoadingComponent>;
  /**
   * 堆压的loading个数
   *  已经有loading时，后续请求只 ++stackLoadingNum
   *  当 stackLoadingNum 为0时，才关闭loading
   */
  private stackLoadingNum = 0;

  interceptors: {
    request: AxiosInterceptorManager<AxiosRequestConfig>;
    response: AxiosInterceptorManager<AxiosResponse>;
  };

  constructor(
    private vscodeService: VscodeService,
    private createLoadingRefService: CreateLoadingRefService,
  ) {
    super();
  }

  get<T = any, R = AxiosResponse<T>>(
    url: string, config?: AxiosRequestConfig
  ): Promise<R> {
    const isLoading = undefined === config?.headers?.showLoading || config?.headers?.showLoading;
    if (isLoading) {
      this.showLoding();
    }
    return new Promise<R>((resolve, reject) => {
      if (config?.params && !url.includes('?')) {
        if (url.endsWith('/')) {
          url += '?' + this.converUrl(config.params);
        } else if (url.endsWith('?')) {
          url += this.converUrl(config.params);
        } else {
          url += '/?' + this.converUrl(config.params);
        }
      }
      this.vscodeService.get({ url }, (resp: any) => {
        if (isLoading) {
          this.closeLoding();
        }
        // 一般像超时、服务器内部错误这样的问题是没有响应体的
        if (Cat.isEmpty(resp)) {
          return;
        }
        // 请求svg 图片时没有 code
        if (resp.code === RespCode.OK || config?.params?.['svg-name']) {
          resolve(resp);
        } else {
          reject(resp);
        }
      });
    });
  }

  delete<T = any, R = AxiosResponse<T>>(
    url: string, config?: AxiosRequestConfig
  ): Promise<R> {
    const isLoading = undefined === config?.headers?.showLoading || config?.headers?.showLoading;
    if (isLoading) {
      this.showLoding();
    }
    return new Promise<R>((resolve, reject) => {
      this.vscodeService.delete({
        url,
        params: config?.params ?? config?.data // 在 delete 请求中，data 和 params 是有区别的：data -- body, params -- url
      }, (resp: any) => {
        if (isLoading) {
          this.closeLoding();
        }
        // 一般像超时、服务器内部错误这样的问题是没有响应体的
        if (Cat.isEmpty(resp)) {
          return;
        }
        if ((resp.code as string)?.toLowerCase()?.includes('success')) {
          resolve(resp);
        } else {
          reject(resp);
        }
      });
    });
  }

  post<T = any>(
    url: string, data?: any, config?: AxiosRequestConfig
  ): Promise<T> {
    const isLoading = undefined === config?.headers?.showLoading || config?.headers?.showLoading;
    if (isLoading) {
      this.showLoding();
    }
    return new Promise<T>((resolve, reject) => {
      this.vscodeService.post({
        url,
        params: data,
        config
      }, (resp: any) => {
        if (isLoading) {
          this.closeLoding();
        }
        // 一般像超时、服务器内部错误这样的问题是没有响应体的
        if (Cat.isEmpty(resp)) {
          return;
        }
        if ((resp.code as string)?.toLowerCase()?.includes('success')) {
          resolve(resp);
        } else {
          reject(resp);
        }
      });
    });
  }

  put<T = any>(
    url: string, data?: any, config?: AxiosRequestConfig
  ): Promise<T> {
    const isLoading = undefined === config?.headers?.showLoading || config?.headers?.showLoading;
    if (isLoading) {
      this.showLoding();
    }
    return new Promise<T>((resolve, reject) => {
      this.vscodeService.put({
        url,
        params: data
      }, (resp: any) => {
        if (isLoading) {
          this.closeLoding();
        }
        // 一般像超时、服务器内部错误这样的问题是没有返回值的
        if (Cat.isEmpty(resp)) {
          return;
        }
        if (resp.code === RespCode.OK) {
          resolve(resp);
        } else {
          reject(resp);
        }
      });
    });
  }

  private converUrl(data: any) {
    const result = [];
    for (const key of Object.keys(data)) {
      const value = data[key];
      if (value?.constructor === Array) {
        value.forEach((val) => {
          result.push(key + '=' + encodeURIComponent(val));
        });
      } else {
        result.push(key + '=' + encodeURIComponent(value));
      }
    }
    return result.join('&');
  }

  private showLoding() {
    if (!this.loadingRef) {
      this.loadingRef = this.createLoadingRefService.createLoading(document.body, LoadingScene.GLOBAL);
    }
    this.stackLoadingNum++;
  }

  private closeLoding() {
    if (!this.loadingRef) {
      return;
    }
    if (--this.stackLoadingNum <= 0) {
      this.createLoadingRefService.destroyLoading(this.loadingRef);
      this.loadingRef = null;
    }
  }
}
