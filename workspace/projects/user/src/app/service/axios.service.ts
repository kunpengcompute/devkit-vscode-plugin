import { Injectable, ComponentRef, OnDestroy } from '@angular/core';
import axios from 'axios';
import { Router } from '@angular/router';
import {MytipService} from '../service/mytip.service';
import { TiMessageService, TiModalRef  } from '@cloud/tiny3';
import { I18nService } from '../service/i18n.service';
import { CreateLoadingRefService } from 'projects/user/src/app/directive/loading/service/create-loading-ref.service';
import { MessageService } from 'projects/user/src/app/service/message.service';
import { LoadingComponent } from 'projects/user/src/app/directive/loading/component/loading/loading.component';
import { LoadingScene } from 'projects/user/src/app/directive/loading/domain/index';

@Injectable({
  providedIn: 'root'
})
export class AxiosService implements OnDestroy {
  public axios: any;
  public expUrls = ['CheckApplication', 'CheckCpuMask', 'CheckWorkingDirectory',
   'CheckPid', 'CheckDiskSpace', 'GetSVGContent', 'GetFlameGraph'];
  public projectPopUrl = 'poptasklist';
  public gettasklist = 'gettasklist';
  public i18n: any;
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
    public msg: TiMessageService,
    public mytip: MytipService,
    public i18nService: I18nService,
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
      const token = sessionStorage.getItem('token');
      if (!(config.url.indexOf('/users/session/') > -1 && config.method === 'post')) {
        config.headers.Authorization = token;
      }

      if (Object.prototype.toString.call(config.headers) === '[object Object]' &&
      config.headers.showLoading === false) {
        delete config.headers.showLoading;
      } else if (config.url.indexOf(this.projectPopUrl) > -1 || config.url.indexOf(this.gettasklist) > -1) {

      } else {
        config.showLoading = true;
        this.showLoding();
      }
      return config;
    }, error => {
      return Promise.reject(error);
    });

    axios.interceptors.response.use(data => {
      if (data.headers.token !== undefined) {
        sessionStorage.setItem('token', data.headers.token);
      }
      if ((data.config as any).showLoading) {
        this.closeLoding();
      }
      this.expUrls.forEach((item): any => {
        if (data.config.url.indexOf(item) !== -1) {
          return Promise.resolve(data.data);
        }
      });
      if (Object.prototype.hasOwnProperty.call(data.data, 'code')) {
        if (data.data.code.indexOf('Success') > -1) {
          return Promise.resolve(data.data);
         } else {
          this.mytip.alertInfo({type: 'warn', content: data.data.message, time: 3500});
          return Promise.reject(data.data);
        }
      } else {
        return Promise.resolve(data.data);
      }

    }, error => {
      if (error.config.showLoading) {
        this.closeLoding();
      }
      if (Object.prototype.hasOwnProperty.call(error, 'response') && error.response) {
      if (error.response.status === 401) {
        if (Object.prototype.hasOwnProperty.call(error.response.data, 'detail')) {
          // Authentication credentials were not provided.  这个结果会影响
            if (error.response.data.detail.indexOf('please log in again') > 0) {
              this.mytip.alertInfo({type: 'warn', content: this.i18n.tip_msg.log_timeout, time: 3500});
            } else {
              this.mytip.alertInfo({type: 'warn', content: this.i18n.tip_msg.logged_in, time: 3500});
            }
         } else {
           this.mytip.alertInfo({type: 'warn', content: this.i18n.tip_msg.log_timeout, time: 3500});
         }
        sessionStorage.setItem('loginId', '');
        this.msgService.sendMessage({ type: 'loginOut' });
        this.router.navigate(['/login']);
        const lang = sessionStorage.getItem('language') || 'zh-cn';
        sessionStorage.clear();
        sessionStorage.setItem('language', lang);
      } else if (error.response.status === 400) {
        if (Object.prototype.hasOwnProperty.call(error.response.data, 'info')) {
          this.mytip.alertInfo(
            {type: 'warn', content: this.i18n.bad_request, detail: error.response.data.info, time: 3500});
        }
      } else if (error.response.status === 429) {
        this.mytip.alertInfo({type: 'warn', content: this.i18n.system_busy, time: 3500});
      } else if (error.response.status === 403) {
          this.msgService.sendMessage({ type: 'loginOut' });
          sessionStorage.setItem('loginId', '');
          this.router.navigate(['/login']);
      } else {
        this.mytip.alertInfo({type: 'warn', content: this.i18n.error_inertval, time: 3500});
      }
      if (Object.prototype.hasOwnProperty.call(error.response.data, 'message')) {
          if (error.response.data.message.length > 0)
          {this.mytip.alertInfo({type: 'warn', content: error.response.data.message, time: 3500}); }
        }
      }

      return Promise.reject(error);
    });
    this.axios = axios;

    this.subscription = this.msgService.getMessage().subscribe(msgs => {
      if (msgs.type === 'getGlobalLoadingStatus') {
        if (msgs.data) {
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

  public generateConversationId(len: any) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split(
      ''
    );
    const uuid = [];
    let i;
    const radix =  chars.length;

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

/**
 * 打开联机帮助
 * @param str 区分工具字符串
 */
public openHelp(str: string) {
    let fileName = '';
    if (str === 'mem'){
        fileName = 'diagnose-help';
    } else if (str === 'tuningHelper') {
        fileName = 'tuning-assistant-help';
    } else {
        fileName = 'help';
    }
    let url = 'https://' + window.location.host + '/';
    url +=  str === 'java' ? 'java-perf' :  'sys-perf';
    if (sessionStorage.getItem('language') === 'en-us') {
      url += '/assets/' + fileName + '/en/index.html';
    } else {
      url +=  '/assets/' + fileName + '/zh/index.html';
    }
    window.open(url, '_blank');
  }

}
