import { Injectable, ComponentRef, OnDestroy } from '@angular/core';
import axios from 'axios';
import { Router } from '@angular/router';
import { TiMessageService } from '@cloud/tiny3';
import { MytipService } from '../service/mytip.service';
import { I18nService } from '../service/i18n.service';
import { LoadingComponent } from '../shared/directive/loading/component/loading/loading.component';
import { LoadingScene } from '../shared/directive/loading/domain';
import { CreateLoadingRefService } from '../shared/directive/loading/service/create-loading-ref.service';
import { MessageService } from './message.service';
@Injectable({
  providedIn: 'root'
})
export class AxiosService implements OnDestroy {
  public axios: any;
  public i18n: any;
  public showTip: any;
  /** LoadingComponent 的组件引用 */
  private loadingRef: ComponentRef<LoadingComponent>;
  /**
   * 堆压的loading个数
   *  已经有loading时，后续请求只 ++loadingStackNum
   *  当 loadingStackNum 为0时，才关闭loading
   */
  private loadingStackNum = 0;
  public isResfDist = true; // 是否发送刷新磁盘空间告警提示

  constructor(
    public router: Router,
    public msg: TiMessageService,
    public myTip: MytipService,
    private I18n: I18nService,
    public messageServe: MessageService,
    private createLoadingRefService: CreateLoadingRefService
  ) {
    this.i18n = this.I18n.I18n();
    this.axios = axios.create({
      baseURL: 'api',
      timeout: 300000,
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      }
    });

    // request interceptor
    this.axios.interceptors.request.use((config: any) => {
      const token = sessionStorage.getItem('token');
      if (config.url.indexOf('/users/login/') === -1) { config.headers.Authorization = token; }
      if (
        config.url.indexOf('/users/login/') === 0
        || config.url.indexOf('/users/logout/') === 0
        || config.url.indexOf('/cert/nginx/reload/') === 0) {
        this.isResfDist = false;
      }
      if (
        config.url.indexOf('task/progress/') === 1 || config.url.indexOf('portadv/tasks/check_upload/') === 1
        || config.url.indexOf('portadv/tasks/upload/') === 1 || config.url.indexOf('portadv/autopack/package/') === 1
        || config.url.indexOf('portadv/autopack/data/') === 1 || config.url.indexOf('space/') === 1
        || config.url.indexOf('portadv/runlog/zip_log') === 1
      ) {
        return config;
      } else {
        this.showLoding();
        return config;
      }
    },
      (error: any) => Promise.reject(error)
    );

    // http响应拦截器
    this.axios.interceptors.response.use((data: any) => {
      if (data.headers.token) {
        sessionStorage.setItem('token', data.headers.token);
      }
      this.closeLoding();
      return data.data;
    }, (error: any): any => {
      this.closeLoding();
      const token = sessionStorage.getItem('token');
      if (error.response && error.response.status === 401) {
        if (error.response.data.detail === 'CrowdedOut') {
          if (token) {
            this.myTip.alertInfo({ type: 'warn', content: this.i18n.common_term_login_other, time: 10000 });
          }
        } else {
          if (token) {
            this.myTip.alertInfo({ type: 'warn', content: this.i18n.common_term_report_401, time: 10000 });
          }
        }
        const currLang = sessionStorage.getItem('language');
        sessionStorage.clear();
        sessionStorage.setItem('language', currLang);
        this.router.navigate(['/login']);
      } else if (error.response && error.response.status === 406) {
        return Promise.reject(error);
      } else if (error.response && error.response.status === 504) {
        this.myTip.alertInfo({ type: 'warn', content: this.i18n.common_term_report_timeout, time: 10000 });
        return 'timeout';
      } else if (error.response && error.response.status === 413) {
        return 'toolarge';
      } else if (error.response && error.response.status === 423) {
        const content = sessionStorage.getItem('language') === 'zh-cn'
          ? error.response.data.infochinese
          : error.response.data.info;
        this.myTip.alertInfo({ type: 'error', content, time: 10000 });
        this.router.navigate(['/login']);
      } else if (error.message.includes('timeout')) {
        if (this.showTip) {
          this.myTip.alertInfo({ type: 'warn', content: this.i18n.common_term_report_timeout, time: 10000 });
        }
        return 'timeout';
      } else if (error.message && error.message === 'Network Error') {
        if (error.response.config.url !== '/cert/nginx/reload/') {
          this.myTip.alertInfo({ type: 'error', content: this.i18n.analysis_center.retry.tip, time: 10000 });
        }
      } else if (error.message && error.response.status === 404) {
        this.myTip.alertInfo({ type: 'error', content: this.i18n.common_term_report_404, time: 10000 });
      } else if (error.message && error.response.status === 500) {
        this.myTip.alertInfo({ type: 'error', content: this.i18n.common_term_report_500, time: 10000 });
      } else {
        this.myTip.alertInfo({ type: 'warn', content: this.i18n.common_term_report_500, time: 10000 });
      }

      return Promise.reject(error);
    });
  }

  ngOnDestroy() {
    this.closeLoding();
    this.messageServe.getMessage().subscribe(msg => {
      if (msg.type === 'closeTip'){
        this.showTip = false;
      }
    });
  }

  public showLoding() {
    // 发送查询磁盘空间信息
    if (this.isResfDist) {
      this.messageServe.sendMessage({type: 'resfDisk'});
      this.isResfDist = false;
    }
    // 避免首次加载页面时发送多次查询磁盘空间请求
    setTimeout(() => {
      this.isResfDist = true;
    }, 1000);
    if (!this.loadingRef) {
      this.loadingRef = this.createLoadingRefService.createLoading(
        document.querySelector('body'), LoadingScene.GLOBAL, '');
    } else {
      this.loadingStackNum++;
    }
  }

  public closeLoding() {
    if (this.loadingRef) {
      if (this.loadingStackNum) {
        this.loadingStackNum--;
      } else {
        this.createLoadingRefService.destroyLoading(this.loadingRef);
        this.loadingRef = null;
      }
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
}
