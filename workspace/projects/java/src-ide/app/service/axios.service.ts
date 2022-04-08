import { Injectable } from '@angular/core';
import axios from 'axios';
import { Router } from '@angular/router';
import { MytipService } from '../service/mytip.service';
import { TiMessageService, TiModalRef } from '@cloud/tiny3';
import { I18nService } from '../service/i18n.service';
import { VscodeService } from '../service/vscode.service';

const HTTP_CODE = {
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403
};

@Injectable({
    providedIn: 'root'
})
export class AxiosService {
    public axios: any;
    public i18n: any;
    public envUrl: string;
    public usersManagerBaseUrl = '../user-management/api/v2.2/';
    constructor(
        public router: Router,
        public msg: TiMessageService,
        public mytip: MytipService,
        public i18nService: I18nService,
        private vscodeService: VscodeService,
    ) {
        this.i18n = this.i18nService.I18n();
        axios.defaults.timeout = 30000;
        this.envUrl = window.location.host + window.location.pathname;
        const localIP = '*********';
        if (
            this.envUrl.indexOf('localhost') >= 0 ||
            this.envUrl.indexOf(localIP) >= 0
        ) {
            axios.defaults.baseURL = 'api/api/';
        } else {
            axios.defaults.baseURL = 'api/';
        }
        axios.defaults.withCredentials = true;
        axios.defaults.headers.get['Content-Type'] =
            'application/json;charset=utf-8';
        axios.defaults.headers.post['Content-Type'] =
            'application/json;charset=utf-8';
        axios.defaults.headers.patch['Content-Type'] =
            'application/merge-patch+json';
        axios.interceptors.request.use(
            (config) => {
                const language = (self as any).webviewSession.getItem('language');
                config.headers['Accept-Language'] = language;
                if (config.method !== 'get') { this.showLoding(); }

                if (config.method === 'patch') {
                    config.headers['Content-Type'] = 'application/merge-patch+json';
                }
                if (
                    (self as any).webviewSession.getItem('isFirst') === '1' &&
                    (self as any).webviewSession.getItem('role') === 'Admin'
                ) {
                }

                const token = (self as any).webviewSession.getItem('token');
                if (!(config.url.indexOf('/users/session/') > -1 && config.method === 'post')) {
                    config.headers.Authorization = token;
                }

                return config;
            },
            (error) => {
                this.closeLoding();
                return Promise.reject(error);
            }
        );

        axios.interceptors.response.use(
            (data) => {
                if (data.headers.token !== undefined) {
                    (self as any).webviewSession.setItem('token', data.headers.token);
                }
                this.closeLoding();
                return Promise.resolve(data.data);
            },
            (error) => {
                if (error.code === 'ECONNABORTED' && error.message.indexOf('timeout') !== -1) {
                    this.showInfoBox(this.i18n.common_term_timeout, 'warn');
                }
                this.closeLoding();
                if (error.response.status === HTTP_CODE.UNAUTHORIZED) {
                    if (error.response.data.hasOwnProperty('detail')) {
                        if (error.response.data.detail.indexOf('were not provided') > 0) {
                            // Authentication credentials were not provided.  这个结果会影响
                            this.showInfoBox(this.i18n.tip_msg.log_timeout, 'warn');
                        } else {

                            this.showInfoBox(this.i18n.tip_msg.logged_in, 'warn');
                        }
                    } else {
                        this.showInfoBox(this.i18n.tip_msg.log_timeout, 'warn');
                    }
                    const lang = (self as any).webviewSession.getItem('language') || 'zh-cn';
                    (self as any).webviewSession.clear();
                    (self as any).webviewSession.setItem('language', lang);
                    if (this.envUrl.indexOf('localhost') >= 0 || this.envUrl.indexOf(localIP) >= 0) {
                        this.router.navigate(['/login']);
                    } else {
                        window.location.href =
                            window.location.origin + '/' + 'user-management' + '/#/login';
                    }
                } else if (error.response.status === HTTP_CODE.BAD_REQUEST) {
                    if (error.response.data.code.indexOf('ResourceGuardianIdNotFound') < 0) {
                        this.showInfoBox(error.response.data.message, 'warn');
                    } else {
                        const gurdianName = (self as any).webviewSession.getItem('guardianName');
                        if (gurdianName) {
                            this.showInfoBox(this.i18nService.I18nReplace(this.i18n.guardian_not_fount,
                               { 0: gurdianName }), 'warn');
                        }
                    }
                } else if (error.response.status === HTTP_CODE.FORBIDDEN) {
                    if (
                        error.response.data.info &&
                        error.response.data.info.indexOf('CSRF') > -1
                    ) {
                        window.location.href =
                            window.location.origin + '/' + 'user-management' + '/#/login';
                    } else {
                        this.showInfoBox(error.response.data.message, 'warn');
                    }
                } else {
                    if (error.config.url.indexOf('/logging/files/') === -1) {
                        this.showInfoBox(error.response.data.message || error.response.statusText, 'warn');
                    }
                }

                return Promise.reject(error);
            }
        );
        this.axios = axios;
    }

    /**
     * 弹出右下角提示消息
     * @param info info
     * @param type 提示类型
     */
    showInfoBox(info: any, type: any) {
        const message = {
            cmd: 'showInfoBox',
            data: {
                info,
                type
            }
        };
        this.vscodeService.postMessage(message, null);
    }

    /**
     * errorMsgTip
     * @param error error
     * @param router router
     */
    public errorMsgTip(error: any, router: any) {
        if (error.response.status === '401') {
            this.msg.open({
                type: 'warn',
                content: error.response.data.detail,
                close(messageRef: TiModalRef): void {
                    router.navigate(['login']);
                },
                cancelButton: {
                    show: false
                }
            });
        }
    }

    /**
     * showLoding
     */
    public showLoding() {
        document.getElementById('loading-box').style.display = 'flex';
    }
    /**
     * closeLoding
     */
    public closeLoding() {
        document.getElementById('loading-box').style.display = 'none';
    }

    /**
     * showLoding_home
     */
    public showLoding_home() {
        document.getElementById('sample-loading-box').style.display = 'flex';
    }
    /**
     * closeLoding_home
     */
    public closeLoding_home() {
        document.getElementById('sample-loading-box').style.display = 'none';
    }

}
