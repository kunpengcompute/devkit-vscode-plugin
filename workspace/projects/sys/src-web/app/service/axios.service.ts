import { Injectable, NgZone, ComponentRef, OnDestroy } from '@angular/core';
import axios from 'axios';
import { Router } from '@angular/router';
import { MytipService } from '../service/mytip.service';
import { TiModalRef } from '@cloud/tiny3';
import { I18nService } from '../service/i18n.service';
import { CreateLoadingRefService } from 'projects/sys/src-web/app/shared/directives/loading/service/create-loading-ref.service';
import { MessageService } from 'projects/sys/src-web/app/service/message.service';
import { LoadingComponent } from 'projects/sys/src-web/app/shared/directives/loading/component/loading/loading.component';
import { LoadingScene } from 'projects/sys/src-web/app/shared/directives/loading/domain/index';
import { MessageModalService } from 'projects/sys/src-web/app/service/message-modal.service';
import { judgeExplorer } from 'sys/src-com/app/util';
import { ExplorerType } from 'sys/src-com/app/domain';
import { I18n } from 'sys/locale';

@Injectable({
  providedIn: 'root'
})
export class AxiosService implements OnDestroy {
  public axios: any;
  public expUrls = ['CheckApplication', 'CheckCpuMask', 'CheckWorkingDirectory', 'CheckPid', 'CheckDiskSpace',
    'GetSVGContent', 'GetFlameGraph'];
  public projectPopUrl = 'poptasklist';
  public gettasklist = 'gettasklist';
  public i18n: any;
  public projectNull = 0;
  private subscription: any;

  /** LoadingComponent 的组件引用 */
  private loadingRef: ComponentRef<LoadingComponent>;
  /**
   * 堆压的loading个数
   *  已经有loading时，后续请求只 ++stackLoadingNum
   *  当 stackLoadingNum 为0时，才关闭loading
   */
  private stackLoadingNum = 0;

  /** 有全局loading时不显示局部loading */
  private hasLocalLoading = false;
  /** 运行中的局部loading的个数，兼容下多个局部loading，只有所有局部loading都关闭时，才取消发送全局loading状态改变 */
  private stackLocalLoadingNum = 0;

  constructor(
    public router: Router,
    public msg: MessageModalService,
    public mytip: MytipService,
    public i18nService: I18nService,
    public ngZone: NgZone,
    private createLoadingRefService: CreateLoadingRefService,
    private msgService: MessageService,
  ) {
    this.i18n = this.i18nService.I18n();
    axios.defaults.timeout = 180000;
    axios.defaults.baseURL = 'api/v2.2';
    axios.defaults.withCredentials = true;
    axios.defaults.headers.get['Content-Type'] = 'application/json;charset=utf-8';
    axios.defaults.headers.post['Content-Type'] = 'application/json;charset=utf-8';
    axios.interceptors.request.use((config: any) => {
      config.headers['Accept-Language'] = sessionStorage.getItem('language') || 'zh-cn';
      config.headers['Cache-Control'] = 'no-cache';
      config.headers.Pragma = 'no-cache';
      if (judgeExplorer() === ExplorerType.IE) {
        // ie浏览器不会自动添加keep-alive头，需要手动添加上
        config.headers.Connection = 'keep-alive';
      }

      const token = sessionStorage.getItem('token');
      if (!(config.url.indexOf('/users/session/') > -1 && config.method === 'post')) {
        config.headers.Authorization = token;
      }

      // auto-flag 为 on 的时候为循环获取，不需要显示loading动画
      function searchParams(url: any, name: any) {
        const reg = new RegExp('(\\?|&)' + name + '=([^&]*)(&|$)');
        const r = url.substr(1).match(reg);
        if (r != null) {
          return unescape(r[2]);
        } else {
          return null;
        }
      }

      if (Object.prototype.toString.call(config.params) === '[object Object]'
        && config.params.responseHeaders === true) {
        delete config.params.responseHeaders;
        config.responseHeaders = true;
      }
      if (Object.prototype.toString.call(config.headers) === '[object Object]'
        && config.headers.showLoading === false) {
        delete config.headers.showLoading;
      } else if (
        config.url.indexOf(this.projectPopUrl) > -1 ||
        (config.url.indexOf('/tasks/?analysis-type') > -1 && config.method === 'get')
        || config.url.indexOf('/alarm/') > -1
        || (Object.prototype.toString.call(config.params) === '[object Undefined]'
          && searchParams(config.url, 'auto-flag') === 'on')
        || (Object.prototype.toString.call(config.params) === '[object Object]'
          && config.params['auto-flag'] === 'on')) {

      } else {
        config.showLoading = true;
        this.showLoding();
      }
      return config;
    }, error => {
      return Promise.reject(error);
    });

    axios.interceptors.response.use(data => {
      /**
       * 当应用第一次加载的时候，将 token 写入 sessionStroage，除非重新登陆，不作修改。
       */
      if (data?.headers?.token != null && sessionStorage.getItem('token') == null) {
        sessionStorage.setItem('token', data.headers.token);
      }

      if ((data.config as any).showLoading) {
        this.closeLoding();
      }
      if (Object.prototype.hasOwnProperty.call(data.data, 'code')) {   // 如果返回值有code，则判断返回结果。也是方便查看未修改的接口
        if (data.data.code.indexOf('Success') > -1) {
          return Promise.resolve((data.config && (data.config as any).responseHeaders)
            ? { data: data.data, headers: data.headers } : data.data);
        } else {
          if (data.config.url.indexOf('res-status') === -1
            || data.config.url.indexOf('res-status/?type=disk_space') > -1) {   // 将校验接口排除
            this.mytip.alertInfo({ type: 'warn', content: data.data.message, time: 3500 });
            // 下面判断意思：只有部分数据获取失败，但是其余数据还是得正常显示出来
            return Object.keys(data.data.data)?.length && !data.data.code.includes('FirstLogin')
              ? Promise.resolve(data.data)
              : Promise.reject(data.data);
          } else {   // 校验接口
            return Promise.resolve((data.config && (data.config as any).responseHeaders)
              ? { data: data.data, headers: data.headers } : data.data);
          }
        }
      } else {
        return Promise.resolve((data.config && (data.config as any).responseHeaders)
          ? { data: data.data, headers: data.headers } : data.data);
      }
    }, error => {
      if (error.code === 'ECONNABORTED' && error.message?.includes('timeout')) {
        this.mytip.alertInfo({ type: 'error', content: I18n.tip_msg.request_timeout, time: 3500 });
      }
      if (error.config.showLoading) {
        this.closeLoding();
      }
      if (Object.prototype.hasOwnProperty.call(error, 'response') && error.response) {
        if (error.response.status === 401) {
          if (Object.prototype.hasOwnProperty.call(error.response.data, 'detail')) {
            // Authentication credentials were not provided.  这个结果会影响
            if (error.response.data.detail.indexOf('validate token error') > 0) {
              this.mytip.alertInfo({ type: 'warn', content: this.i18n.tip_msg.log_timeout, time: 3500 });
            } else {
              this.mytip.alertInfo({ type: 'warn', content: this.i18n.tip_msg.log_timeout, time: 3500 });
            }
          } else {
            this.mytip.alertInfo({
              type: 'warn',
              content: this.i18n.tip_msg.log_timeout,
              time: 3500,
            });
          }
          const language = sessionStorage.getItem('language') || 'zh-cn';
          sessionStorage.clear();
          sessionStorage.setItem('language', language);
          sessionStorage.setItem('loginId', '');
          this.msgService.sendMessage({ type: 'loginOut' });
          window.location.href = window.location.origin + '/' + 'user-management' + '/#/login';
        } else if (error.response.status === 400) {
          if (Object.prototype.hasOwnProperty.call(error.response.data, 'info')) {
            this.mytip.alertInfo({
              type: 'warn',
              content: this.i18n.bad_request,
              time: 3500
            });
          }
          // 为了解决另一个用户删除正在查看的工程导致持续请求报错的问题
          if (error.response.data.code && error.response.data.code.indexOf('ProjectNull') > 0) {
            if (this.projectNull === 1) {
              window.location.reload();
            }
            this.projectNull++;
          }
        } else if (error.response.status === 429) {
          sessionStorage.removeItem('ifLeftMenuShow');
          this.mytip.alertInfo({ type: 'warn', content: this.i18n.system_busy, time: 3500});
        } else if (error.response.status === 403) {
          sessionStorage.removeItem('ifLeftMenuShow');
          setTimeout(() => {
            sessionStorage.setItem('loginId', '');
            window.location.href =
              window.location.origin + '/' + 'user-management' + '/#/login';
          }, 1500);
        } else {
          this.mytip.alertInfo({ type: 'warn', content: this.i18n.error_inertval, time: 3500 });
        }
        if (
          Object.prototype.hasOwnProperty.call(error.response.data, 'message')
          && error.response.data.message.length > 0 && !error.response.data.code.includes('ReportAlreadyExists')
        ) {
          this.mytip.alertInfo({type: 'warn', content: error.response.data.message, time: 3500 });
        }
      }
      return Promise.reject(error);
    });
    this.axios = axios;

    this.subscription = this.msgService.getMessage().subscribe(mg => {
      if (mg.type === 'getGlobalLoadingStatus') {
        if (mg.data) {
          if (this.hasLocalLoading) {
            this.stackLocalLoadingNum++;
          } else {
            this.hasLocalLoading = true;
          }

          this.sendLoadingStatus(!!this.loadingRef);
        } else {
          if (this.stackLocalLoadingNum) {
            this.stackLocalLoadingNum--;
          } else {
            this.hasLocalLoading = false;
          }
        }
      }
    });
  }

  ngOnDestroy() {
    this.closeLoding();
    this.subscription.unsubscribe();
  }

  public errorMsgTip(error: any, router: any) {
    if (error.response.status === '401') {
      this.msg.open({
        type: 'warn',
        content: error.response.data.detail,
        close(messageRef: TiModalRef): void {
          sessionStorage.setItem('loginId', '');
          router.navigate(['login']);
        },
        cancelButton: {
          show: false
        }
      });
    }

  }

  public showLoding() {
    if (!this.loadingRef) {
      this.loadingRef = this.createLoadingRefService.createLoading(
        document.querySelector('body'), LoadingScene.GLOBAL, '');
      this.sendLoadingStatus(true);
    } else {
      this.stackLoadingNum++;
    }
  }

  public closeLoding() {
    if (this.loadingRef) {
      if (this.stackLoadingNum) {
        this.stackLoadingNum--;
      } else {
        this.createLoadingRefService.destroyLoading(this.loadingRef);
        this.loadingRef = null;
        this.sendLoadingStatus(false);
      }
    }
  }

  /**
   * 全局loading状态改变
   * @param status loading status
   */
  private sendLoadingStatus(status: boolean) {
    if (this.hasLocalLoading) {
      this.msgService.sendMessage({
        type: 'globalLoadingStatus',
        data: status,
      });
    }
  }

  /**
   * 生成随机ID
   * @param len 位数
   */
  public generateConversationId(len: any) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split(
      ''
    );
    const uuid = [];
    let i;
    const radix = chars.length;

    if (len) {
      for (i = 0; i < len; i++) {
        uuid[i] = chars[Math.floor(Math.random() * radix)];
      }
    } else {
      uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
      uuid[14] = '4';

      let r;
      for (i = 0; i < 36; i++) {
        if (!uuid[i]) {
          r = Math.floor(Math.random() * 16);
          uuid[i] = chars[i === 19 ? Math.floor(Math.random() * 4) + 8 : r];
        }
      }
    }
    return uuid.join('');
  }

  // get请求参数处理
  public converUrl(data: any) {
    const result = [];
    for (const key of Object.keys(data)) {
      const value = data[key];
      if (value.constructor === Array) {
        value.forEach((val) => {
          result.push(key + '=' + val);
        });
      } else {
        result.push(key + '=' + value);
      }
    }
    return result.join('&');
  }
  // 文件下载
  public downloadFile(content: any, filename: any) {
    // 字符内容转变成blob地址
    const blob = new Blob([content]);
    // ie在客户端保存文件的方法
    if (window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveOrOpenBlob(blob, filename);
    } else {
      // 创建隐藏的可下载链接
      const eleLink = document.createElement('a');
      eleLink.download = filename;
      eleLink.style.display = 'none';
      eleLink.href = URL.createObjectURL(blob);
      // 触发点击
      document.body.appendChild(eleLink);
      eleLink.click();
      // 然后移除
      document.body.removeChild(eleLink);
    }
  }

  // 应用路径提示字符拼接
  public getPathString(str: any) {
    const lang = sessionStorage.getItem('language');
    let pathString = '';
    if (lang === 'zh-cn') {
      pathString = str.replace(/;/g, '或');
    } else {
      pathString = str.replace(/;/g, ' or ');
    }
    return pathString;
  }
}
