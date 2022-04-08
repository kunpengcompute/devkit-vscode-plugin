import { Injectable, NgZone } from '@angular/core';
import axios from 'axios';
import { Router } from '@angular/router';
import { MytipService } from '../service/mytip.service';
import { TiModalRef } from '@cloud/tiny3';
import { I18nService } from '../service/i18n.service';
import { MessageModalService } from 'projects/sys/src-ide/app/service/message-modal.service';
/**
 * 工程场景枚举
 */
export enum PROJECT_TYPE {
    TYPE_GENERAL = 'TYPE_GENERAL', // 通用场景
    TYPE_DISTRIBUTED = 'TYPE_DISTRIBUTED', // 分布式场景
    TYPE_BIGDATA = 'TYPE_BIGDATA',  //  大数据场景
    TYPE_HPC = 'TYPE_HPC',  //  hpc
    TYPE_DATABASE = 'TYPE_DATABASE', // 数据库场景
}
@Injectable({
    providedIn: 'root'
})
export class AxiosService {
    public axios;
    public expUrls = [
        'CheckApplication', 'CheckCpuMask', 'CheckWorkingDirectory',
        'CheckPid', 'CheckDiskSpace', 'GetSVGContent', 'GetFlameGraph'];
    public projectPopUrl = 'poptasklist';
    public gettasklist = 'gettasklist';
    public i18n: any;
    public projectNull = 0;
    constructor(
        public router: Router,
        public msg: MessageModalService,
        public mytip: MytipService,
        public i18nService: I18nService,
        public ngZone: NgZone) {
        this.i18n = this.i18nService.I18n();
        axios.defaults.timeout = 180000;
        axios.defaults.baseURL = 'api/v2.2';
        axios.defaults.withCredentials = true;
        axios.defaults.headers.get['Content-Type'] = 'application/json;charset=utf-8';
        axios.defaults.headers.post['Content-Type'] = 'application/json;charset=utf-8';
        axios.interceptors.request.use(config => {
            config.headers['Accept-Language'] = self.webviewSession.getItem('language') || 'zh-cn';
            config.headers['Cache-Control'] = 'no-cache';
            config.headers.Pragma = 'no-cache';

            if (self.webviewSession.getItem('isFirst') === '1' &&
                self.webviewSession.getItem('role') === 'Admin') {   // 如果没有修改密码就过来，给弹回去
            }
            const token = self.webviewSession.getItem('token');
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

            if (
                config.headers.showLoading === false ||
                config.url.indexOf(this.projectPopUrl) > -1 ||
                (config.url.indexOf('/tasks/?analysis-type') > -1 && config.method === 'get') ||
                (Object.prototype.toString.call(config.params) === '[object Undefined]' &&
                    searchParams(config.url, 'auto-flag') === 'on') ||
                (Object.prototype.toString.call(config.params) === '[object Object]'
                    && config.params['auto-flag'] === 'on')) {

            } else {
                this.showLoding();
            }
            return config;
        }, error => {
            return Promise.reject(error);
        });

        axios.interceptors.response.use(data => {
            if (data.headers.token !== undefined) {
                self.webviewSession.setItem('token', data.headers.token);
            }
            this.closeLoding();
            if (data.data.hasOwnProperty('code')) {   // 如果返回值有code，则判断返回结果。也是方便查看未修改的接口
                if (data.data.code.indexOf('Success') > -1) {
                    return Promise.resolve(data.data);
                } else {
                    if (data.config.url.indexOf('res-status') === -1 ||
                        data.config.url.indexOf('res-status/?type=disk_space') > -1) {   // 将校验接口排除
                        this.mytip.alertInfo({ type: 'warn', content: data.data.message, time: 3500 });
                        return Promise.reject(data.data);
                    } else {   // 校验接口
                        return Promise.resolve(data.data);
                    }
                }
            } else {
                return Promise.resolve(data.data);
            }
        }, error => {
            this.closeLoding();
            if (error.response.status === 401) {
                if (error.response.data.hasOwnProperty('detail')) {
                    if (error.response.data.detail.indexOf('were not provided') > 0) {
                        // Authentication credentials were not provided.  这个结果会影响
                        this.mytip.alertInfo({ type: 'warn', content: this.i18n.tip_msg.log_timeout, time: 3500 });
                    } else {
                        this.mytip.alertInfo({ type: 'warn', content: this.i18n.tip_msg.logged_in, time: 3500 });
                    }
                } else {
                    this.mytip.alertInfo({ type: 'warn', content: this.i18n.tip_msg.log_timeout, time: 3500 });
                }
                const lang = self.webviewSession.getItem('language') || 'zh-cn';
                self.webviewSession.setItem('language', lang);
                window.location.href = window.location.origin + '/' + 'user-management' + '/#/login';
            } else if (error.response.status === 400) {
                if (error.response.data.hasOwnProperty('info')) {
                    this.mytip.alertInfo({
                        type: 'warn', content: this.i18n.bad_request, detail: error.response.data.info, time: 3500
                    });
                }
                if (error.response.data.code.indexOf('ProjectNull') > 0) {
                    if (this.projectNull === 1) {
                        window.location.reload();
                    }
                    this.projectNull++;
                }
            } else if (error.response.status === 429) {
                this.mytip.alertInfo({ type: 'warn', content: this.i18n.system_busy, time: 3500 });
            } else if (error.response.status === 403) {
                window.location.href = window.location.origin + '/' + 'user-management' + '/#/login';
            } else {
                this.mytip.alertInfo({ type: 'warn', content: this.i18n.error_inertval, time: 3500 });
            }
            if (error.response.data.hasOwnProperty('message')) {
                if (error.response.data.message.length > 0) {
                    this.mytip.alertInfo({ type: 'warn', content: error.response.data.message, time: 3500 });
                }
            }
            return Promise.reject(error);
        });
        this.axios = axios;
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
        this.i18n.common_term_task_nodata = this.i18n.loading;
        $('#loading-container').html('');
        $('#loading-container').html(` <div class='loading-box' id='loading-box'><div class="loading">
    <span></span>
    <span></span>
    <span></span>
    <span></span>
    <span></span>
    <span></span>
    <span></span>
  </div>
  </div>`);

    }
    /**
     * closeLoding
     */
    public closeLoding() {
        this.i18n.common_term_task_nodata = this.i18n.common_term_task_nodata2;
        $('#loading-container').html('');
    }

    /**
     * converUrl
     * @param data data
     */
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

    /**
     * 文件下载
     * @param content 文件
     * @param filename  名称
     */
    public downloadFile(content: any, filename: any) {
        // ie在客户端保存文件的方法
        if (window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveOrOpenBlob(content, filename);
        } else {
            // 创建隐藏的可下载链接
            const eleLink = document.createElement('a');
            eleLink.download = filename;
            eleLink.style.display = 'none';
            // 字符内容转变成blob地址
            const blob = new Blob([content]);
            eleLink.href = URL.createObjectURL(blob);
            // 触发点击
            document.body.appendChild(eleLink);
            eleLink.click();
            // 然后移除
            document.body.removeChild(eleLink);
        }
    }
    /**
     * 添加千位分隔符
     * @param value 有符号）整形、（有符号）浮点型的数字字符（可以带单位），如：'123324', '123324.12312', '-123324','123324ms', ...
     */
    public setThousandSeparator(value: string | number): string {
        function numFormat(numStr: string): string {
            const res = numStr.replace(/\d+/, (n) => { // 先提取整数部分
                return n.replace(/(\d)(?=(\d{3})+$)/g, ($1) => {
                    return $1 + ',';
                });
            });
            return res;
        }
        if (Array.isArray(value) && value.length === 1) {
            value = value[0];
        }
        if (typeof (value) === 'number' || typeof (value) === 'string') {
            return numFormat(value.toString());
        } else {
            return value;
        }
    }
    /**
     * 处理场景
     * id 场景ID
     */
    public getScenes(id: any): any {
        if (id === 11) {
            return PROJECT_TYPE.TYPE_GENERAL; // 通用场景2
        } else if (id >= 1 && id <= 100) {
            return PROJECT_TYPE.TYPE_DISTRIBUTED; // 分布式场景0
        } else if (id >= 100 && id <= 200) {
            return PROJECT_TYPE.TYPE_BIGDATA; // 大数据场景1
        } else if (id >= 201 && id <= 400) {// hpc3
            return PROJECT_TYPE.TYPE_HPC;
        } else if (id >= 401) {// 数据库场景
            return PROJECT_TYPE.TYPE_DATABASE;
        }
    }
}
