import { Component, OnInit } from '@angular/core';
import { I18nService } from '../../service/i18n.service';
import { VscodeService } from '../../service/vscode.service';
import { ProfileDownloadService } from '../../service/profile-download.service';

@Component({
    selector: 'app-javaperf-analyzes-setting',
    templateUrl: './javaperf-analyzes-setting.component.html',
    styleUrls: ['./javaperf-analyzes-setting.component.scss']
})
export class JavaperfAnalyzesSettingComponent implements OnInit {

    constructor(
        public i18nService: I18nService,
        public vscodeService: VscodeService,
        private downloadService: ProfileDownloadService
    ) {
        this.i18n = this.i18nService.I18n();
    }
    public i18n: any;
    public role: any;
    public formItems = {
        stackDepth: {
            title: '',
            value: '',
            errMsg: '',
            notice: '',
            valid: true,
            isModify: false,
            require: true,
            format: 'N0'
        }
    };
    public commonConfig = {
        stackDepth: {
            label: '',
            range: [16, 64],
            text: ''
        }
    };
    /**
     * 将请求的数据保存在这里，点击取消后，从这里将值重新赋值
     */
    public formItemsValues = {
        stackDepth: ''
    };
    /**
     * 组件初始化
     */
    ngOnInit() {
        this.role = ((self as any).webviewSession || {}).getItem('role');
        this.getStack();
    }
    /**
     * 获取栈深度配置
     */
    public getStack() {
        this.vscodeService.get({ url: '/tools/settings/stackDepth' }, (res: any) => {
            this.formItems.stackDepth.value = res;
            this.formItemsValues.stackDepth = res;
            this.downloadService.downloadItems.pFileIO.stackDepth = res;
        });
    }
    /**
     * 配置栈深度，发送数据
     */
    public handleStack(val: any) {
        if (Number(val) === Number(this.downloadService.downloadItems.pFileIO.stackDepth)) {
            return;
        }
        const url = `/tools/settings/stackDepth/${val}`;
        this.vscodeService.post({ url }, () => {
            this.formItems.stackDepth.isModify = false;
            this.formItems.stackDepth.value = val;
            this.downloadService.downloadItems.pFileIO.stackDepth = val;
            const message = {
                cmd: 'showInfoBox',
                data: {
                    info: this.i18n.tip_msg.edite_ok,
                    type: 'info'
                }
            };
            this.vscodeService.postMessage(message, null);
        });
    }
}
