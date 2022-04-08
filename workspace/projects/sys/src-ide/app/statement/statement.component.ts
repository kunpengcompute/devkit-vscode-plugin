import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { I18nService } from '../service/i18n.service';
import { AxiosService } from '../service/axios.service';
import { HTTP_STATUS_CODE, VscodeService } from '../service/vscode.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-statement',
    templateUrl: './statement.component.html',
    styleUrls: ['./statement.component.scss']
})
export class StatementComponent implements OnInit {

    constructor(
        public I18n: I18nService,
        public Axios: AxiosService,
        public vscodeService: VscodeService,
        public router: Router,
        private activaedRoute: ActivatedRoute,
    ) {
        this.i18n = I18n.I18n();
    }
    public i18n: any;
    public showStatement = false;
    public statementStatus: any = false;
    public params: any = {};
    public readChecked: any = false;
    public hoverClose = '';
    public panelId: any;  // login页panelId
    public pluginCfg: any;
    @ViewChild('saveConfirmTip', { static: false }) saveConfirmTip: { Close: () => void; Open: () => void; };
    /**
     * 初始化
     */
    ngOnInit(): void {
        const params = { cmd: 'readConfig' };
        this.vscodeService.postMessage(params, (resp: any) => {
            this.pluginCfg = resp;
        });
        if (sessionStorage.getItem('statementStatus')) {
            this.statementStatus = sessionStorage.getItem('statementStatus') === 'true' ? true : false;
            this.showStatement = !this.statementStatus;
            if (this.statementStatus) {
            }
        } else {
            this.statementStatus = this.searchStatus();
        }
        // 判断当前页面是 用户登录 还是 切换用户
        this.activaedRoute.queryParams.subscribe((data) => {
            this.panelId = data.panelId;
        });
    }
    /**
     * 打开免责声明弹框
     */
    public openStatement() {
        this.showStatement = true;
        $('.toggleSpan').css({ display: 'none' });
    }
    /**
     * 关闭免责声明弹框
     */
    public clostStatement() {
        this.hoverClose = '';
        if (this.statementStatus) {
            this.readChecked = false;
            this.showStatement = false;
            $('.toggleSpan').css({ display: 'block' });
        } else {
            this.saveConfirmTip.Open();
        }
    }
    /**
     * 获取用户免责声明状态
     */
    public searchStatus() {
        // 获取用户免责声明状态
        this.vscodeService.get({ url: '/users/user-extend/', subModule: 'userManagement' }, (res) => {
            if (res.data.SYS_DISCLAIMER === '1') {
                this.statementStatus = true;
                this.pluginCfg.disclaimer = ['confirm'];
                const data = { cmd: 'saveConfig', data: {
                    data: JSON.stringify(this.pluginCfg), showInfoBox: false, disclaimeSave: true
                } };
                this.vscodeService.postMessage(data, null);
            }
            if (!this.statementStatus) {
                // 向extension传递信息
                this.pluginCfg.disclaimer = [];
                const data = {
                    cmd: 'saveConfig',
                    data: { data: JSON.stringify(this.pluginCfg), showInfoBox: false, disclaimeCancel: true }
                };
                this.vscodeService.postMessage(data, null);
                // 打开弹框
                this.openStatement();
            }
        });
        return this.statementStatus;
    }
    /**
     * onHoverClose
     * @param msg 提示语
     */
    public onHoverClose(msg: string): void {
        this.hoverClose = msg;
    }
    /**
     * 签署免责声明
     */
    public getDisclaimer() {
        // 签署免责声明
        const params = { SYS_DISCLAIMER: '1' };
        this.vscodeService.post({ url: '/users/user-extend/', params, subModule: 'userManagement' }, (res) => {
            this.statementStatus = true;
        });
        const params1 = {
            module: 'sign Disclaimer',
            info: 'Sign Disclaimer successfully',
            status: 0
        };
        const option = {
            url: `/operation-logs/`,
            params: params1,
            subModule: 'userManagement'
        };
        this.vscodeService.post(option, () => { });
        this.pluginCfg.disclaimer = ['confirm'];
        const data = { cmd: 'saveConfig', data: {
            data: JSON.stringify(this.pluginCfg), showInfoBox: false, disclaimeSave: true
        } };
        this.vscodeService.postMessage(data, null);
        // 关闭弹窗
        this.showStatement = false;
    }
    /**
     * 再想想
     */
    public confirmMsgTip() {
        this.saveConfirmTip.Close();
    }
    /**
     * 退出
     */
    public cancelMsgTip() {
        this.pluginCfg.disclaimer = [];
        const data = { cmd: 'saveConfig', data: {
            data: JSON.stringify(this.pluginCfg), showInfoBox: false, logout: true
        } };
        this.vscodeService.postMessage(data, null);
    }
}
