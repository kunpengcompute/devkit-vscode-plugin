import { Component, OnInit } from '@angular/core';
import { I18nService } from '../../service/i18n.service';
import { VscodeService } from '../../service/vscode.service';
@Component({
    selector: 'app-stack-tip',
    templateUrl: './stack-tip.component.html',
    styleUrls: ['./stack-tip.component.scss']
})
export class StackTipComponent implements OnInit {

    constructor(
        public i18nService: I18nService,
        public vscodeService: VscodeService,
    ) {
        this.i18n = this.i18nService.I18n();
    }
    public i18n: any;
    public role: boolean;
    public stackBtnTip: string;
    /**
     * 组件初始化
     */
    ngOnInit() {
        this.role = (self as any).webviewSession.getItem('role') === 'Admin' ? true : false;
        this.getStack();
    }
    /**
     * 获取栈深度配置
     */
    public getStack() {
        this.vscodeService.get({ url: '/tools/settings/stackDepth' }, (res: any) => {
            if (this.role) {
                if (((self as any).webviewSession || {}).getItem('tuningOperation') === 'hypertuner') {
                    this.stackBtnTip = this.i18nService.I18nReplace(this.i18n.newHeader.setting.stackAdmin,
                       { 0: res.data });
                } else {
                    this.stackBtnTip = this.i18nService.I18nReplace(this.i18n.newHeader.setting.stackAdmin, { 0: res });
                }
            } else {
                if (((self as any).webviewSession || {}).getItem('tuningOperation') === 'hypertuner') {
                    this.stackBtnTip = this.i18nService.I18nReplace(this.i18n.newHeader.setting.stackUser,
                       { 0: res.data });
                } else {
                    this.stackBtnTip = this.i18nService.I18nReplace(this.i18n.newHeader.setting.stackUser, { 0: res });
                }
            }
        });
    }
    /**
     * 跳转页面
     */
    public toSetting() {
        const data = {
            cmd: 'openNewPage', data: {
                router: '/javaperfsetting',
                panelId: 'javaPerfManage',
                viewTitle: this.i18n.plugins_javaperf_title_cfg,
                message: {
                    role: this.role,
                    innerItem: 'itemConfiguration'
                }
            }
        };
        this.vscodeService.postMessage(data, () => {
        });
    }
}
