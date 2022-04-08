import { Injectable, ComponentRef, OnDestroy } from '@angular/core';
import axios from 'axios';
import { Router } from '@angular/router';
import { MytipService } from '../service/mytip.service';
import { TiMessageService, TiModalRef } from '@cloud/tiny3';
import { I18nService } from '../service/i18n.service';
import { MessageService } from '../service/message.service';
import { StompService } from './stomp.service';
import { CreateLoadingRefService } from '../shared/directive/loading/service/create-loading-ref.service';
import { LoadingComponent } from '../shared/directive/loading/component/loading/loading.component';
import { LoadingScene } from '../shared/directive/loading/domain/index';
import { ProfileDownloadService } from './profile-download.service';
@Injectable({
  providedIn: 'root'
})
export class AxiosService implements OnDestroy {
  public axios: any;
  public i18n: any;
  public envUrl: string;
  public usersManagerBaseUrl = '../user-management/api/v2.2/';
  /** LoadingComponent 的组件引用 */
  private loadingRef: ComponentRef<LoadingComponent>;
  /**
   * 堆压的loading个数
   *  已经有loading时，后续请求只 ++loadingStackNum
   *  当 loadingStackNum 为0时，才关闭loading
   */
  private loadingStackNum = 0;
  private subscriptionLoad: any;
  constructor(
    public router: Router,
    public msg: TiMessageService,
    public mytip: MytipService,
    public i18nService: I18nService,
    private msgService: MessageService,
    private createLoadingRefService: CreateLoadingRefService,
    public stompService: StompService,
    public downSave: ProfileDownloadService,
  ) {
    this.i18n = this.i18nService.I18n();
    axios.defaults.timeout = 180000;
    this.envUrl = window.location.host + window.location.pathname;
    const localIP = '*********';
    if (this.msgService.onlineDev) {
      axios.defaults.baseURL = 'api/';
    } else {
      if (
        this.envUrl.indexOf('localhost') >= 0 ||
        this.envUrl.indexOf(localIP) >= 0
      ) {
        axios.defaults.baseURL = 'api/api/';
      } else {
        axios.defaults.baseURL = 'api/';
      }
    }
    axios.defaults.withCredentials = true;
    axios.defaults.headers.get['Content-Type'] =
      'application/json;charset=utf-8';
    axios.defaults.headers.post['Content-Type'] =
      'application/json;charset=utf-8';
    axios.defaults.headers.patch['Content-Type'] =
      'application/merge-patch+json';
    axios.interceptors.request.use(
      (config: any) => {
        const language = sessionStorage.getItem('language');
        config.headers['Accept-Language'] = language;
        config.headers['Cache-Control'] = 'no-cache';
        config.headers.Pragma = 'no-cache';
        if (config.method === 'patch') {
          config.headers['Content-Type'] = 'application/merge-patch+json';
        }
        const token = sessionStorage.getItem('token');
        if (!(config.url.indexOf('/users/session/') > -1 && config.method === 'post')) {
          config.headers.Authorization = token;
        }
        if (Object.prototype.toString.call(config.headers) === '[object Object]' &&
         config.headers.showLoading === false) {
          delete config.headers.showLoading;
        } else if (Object.prototype.toString.call(config.headers) === '[object Object]' &&
         config.headers.showLoading === true) {
          this.showLoding();
        } else {
          if (config.method !== 'get') {
            config.showLoading = true;
            this.showLoding();
          }
        }
        return config;
      },
      error => {
        this.closeLoding();
        return Promise.reject(error);
      }
    );

    axios.interceptors.response.use(
      data => {
        if (data.headers) {
          if (data.headers.token !== undefined) {
            sessionStorage.setItem('token', data.headers.token);
          }
          this.closeLoding();
          return Promise.resolve(data.data);
        } else {
          return Promise.resolve(data);
        }
      },
      error => {
        if (error.config.showLoading) {
          this.closeLoding();
        }
        if (error.code === 'ECONNABORTED' && error.message.indexOf('timeout') !== -1) {
          this.mytip.alertInfo({ type: 'warn', content: this.i18n.common_term_timeout, time: 3500 });
        }
        if (error.response.status === 401) {
          if (Object.prototype.hasOwnProperty.call(error.response.data, 'detail')) {
            if (error.response.data.detail.indexOf('were not provided') > 0) {
              // Authentication credentials were not provided.  这个结果会影响
              this.mytip.alertInfo({ type: 'warn', content: this.i18n.tip_msg.log_timeout, time: 3500 });
            } else {
              this.mytip.alertInfo({ type: 'warn', content: this.i18n.tip_msg.logged_in, time: 3500 });
            }
          } else {
            this.mytip.alertInfo({ type: 'warn', content: this.i18n.tip_msg.logged_in, time: 3500 });
          }
          const lang = sessionStorage.getItem('language') || 'zh-cn';
          sessionStorage.clear();
          sessionStorage.setItem('language', lang);
          this.downSave.downloadItems.profileInfo.nowTime = '';
          this.stompService.socketState = false;
          this.stompService.disConnect();
          if (this.stompService.refreshClientSub) {
            this.stompService.refreshClientSub.forceDisconnect();
          }
          if (this.stompService.refreshSub) { this.stompService.refreshSub.unsubscribe(); }
          this.msgService.sendMessage({ type: 'loginOut' });
          sessionStorage.setItem('loginId', '');
          if (this.envUrl.indexOf('localhost') >= 0 || this.envUrl.indexOf(localIP) >= 0) {
            this.router.navigate(['/login']);
          } else {
            window.location.href =
              window.location.origin + '/' + 'user-management' + '/#/login';
          }
        } else if (error.response.status === 400) {
          if (error.response.data.code.includes('ResourceNotFound') ||
           error.response.data.code.includes('JvmTerminated')) {
            this.mytip.alertInfo({
              type: 'warn',
              content: error.response.data.message,
              time: 10000
            });
            this.msgService.sendMessage({
              type: 'errorStopPro',
              data: error.response.data.alarmLevel,
            });
          } else if (error.response.data.code.includes('ResourceGuardianIdNotFound')) {
            const gurdianName = sessionStorage.getItem('guardianName');
            if (gurdianName) {
              this.mytip.alertInfo({
                type: 'warn',
                content: this.i18nService.I18nReplace(this.i18n.guardian_not_fount, { 0: gurdianName }),
                time: 10000
              });
              this.msgService.sendMessage({
                type: 'errorStopPro',
                data: error.response.data.alarmLevel,
              });
            }
          } else {
            this.mytip.alertInfo({
              type: 'warn',
              content: error.response.data.message,
              time: 10000
            });
          }
        } else if (error.response.status === 403) {
          if (
            error.response.data.info &&
            error.response.data.info.indexOf('CSRF') > -1
          ) {
            this.msgService.sendMessage({ type: 'loginOut' });
            sessionStorage.setItem('loginId', '');
            window.location.href =
              window.location.origin + '/' + 'user-management' + '/#/login';
          } else {
            this.mytip.alertInfo({
              type: 'warn',
              content: error.response.data.message,
              time: 10000
            });
          }
        } else if (error.response.status === 417) {
          if (error.response.data.code.includes('HeapDumpSnapshotOnlySaveOnce')
            || error.response.data.code.includes('HeapDumpRecordingOnlySaveOnce')
            || error.response.data.code.includes('ThreadDumpRecordingOnlySaveOnce')
            || error.response.data.code.includes('GcLogRecordingOnlySaveOnce')) {
            this.mytip.alertInfo({
              type: 'warn',
              content: error.response.data.message,
              time: 10000
            });
          }
          /* 417状态不弹message */
        } else {
          if (error.config.url.indexOf('/logging/files/') === -1) {
            this.mytip.alertInfo({
              type: 'warn',
              content: error.response.data.message || error.response.statusText,
              time: 10000
            });
          }
        }

        return Promise.reject(error);
      }
    );
    this.axios = axios;

    this.subscriptionLoad = this.msgService.getMessage().subscribe(message => {
      if (message.type === 'getGlobalLoadingStatus') {
        this.msgService.sendMessage({
          type: 'globalLoadingStatus',
          data: !!this.loadingRef,
        });
      }
    });
  }
  ngOnDestroy() {
    this.closeLoding();
    this.subscriptionLoad.unsubscribe();
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
      this.loadingRef = this.createLoadingRefService.createLoading(document.querySelector('body'),
       LoadingScene.GLOBAL, '');
      this.msgService.sendMessage({
        type: 'globalLoadingStatus',
        data: true,
      });
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
        this.msgService.sendMessage({
          type: 'globalLoadingStatus',
          data: false,
        });
      }
    }
  }

}
