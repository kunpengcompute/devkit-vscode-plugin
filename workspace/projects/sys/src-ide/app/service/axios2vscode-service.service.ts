import { Injectable } from '@angular/core';
import { VscodeService } from 'projects/sys/src-ide/app/service/vscode.service';

@Injectable({
  providedIn: 'root'
})
export class Axios2vscodeServiceService {
  public axios: any = {};

  constructor(public vscodeService: VscodeService) {
    ['put', 'post', 'get', 'delete'].forEach(method => {
      this.axios[method] = (url, params) => {
        if (!url.startsWith('/')) {
          url = '/' + url;
        }

        if (method === 'get' && params) {
          url = this.converUrl(url, params.params);
        }

        return new Promise((resolve, reject) => {
          this.vscodeService[method]({ url, params }, res => {
            // 如果返回值有code，则判断返回结果。也是方便查看未修改的接口
            if (res.hasOwnProperty('code') && res.code.indexOf('Success') === -1) {
              if (res.message) {
                this.vscodeService.postMessage({
                  cmd: 'showInfoBox',
                  data: {
                    info: res.message,
                    type: 'error',
                  }
                }, null);
              }

              reject(res);
            } else {
              resolve(res);
            }
          });
        });
      };
    });
  }

  private converUrl(url, params) {
    Object.keys(params).forEach((key, index) => {
      if (index === 0) {
        url += `?${key}=${encodeURIComponent(typeof params[key] === 'object'
          ? JSON.stringify(params[key]) : params[key])}`;
      } else {
        url += `&${key}=${encodeURIComponent(typeof params[key] === 'object'
          ? JSON.stringify(params[key]) : params[key])}`;
      }
    });

    return url;
  }
}
