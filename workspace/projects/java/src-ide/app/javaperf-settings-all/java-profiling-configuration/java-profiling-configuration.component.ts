import { Component, OnInit } from '@angular/core';
import { I18nService } from '../../service/i18n.service';
import { VscodeService, COLOR_THEME } from '../../service/vscode.service';
import { ProfileDownloadService } from '../../service/profile-download.service';

@Component({
    selector: 'app-java-profiling-configuration',
    templateUrl: './java-profiling-configuration.component.html',
    styleUrls: ['./java-profiling-configuration.component.scss']
})
export class JavaProfilingConfigurationComponent implements OnInit {
    public i18n: any;

    // 内部通信证书自动告警时间（天）
    public sysTuningConfig = {
        agentWarnDeadline: {
            label: '',
            range: [7, 180],
        },
    };
    public certificateFormItems: any;

    // 运行日志级别
    public isOperate = false;
    public isLogModify = false;
    public runLogFormItems: any;

    // 将请求的数据保存在这里，点击取消后，从这里将值重新赋值
    public formItemsValues = {
        runLogLevel: { label: '', value: '' },
    };

    // 获取主题颜色
    public currTheme: any;
    public ColorTheme = {
        Dark: COLOR_THEME.Dark,
        Light: COLOR_THEME.Light
    };

    constructor(
        public vscodeService: VscodeService,
        public i18nService: I18nService,
        private downloadService: ProfileDownloadService,
    ) {
        this.i18n = this.i18nService.I18n();

        this.certificateFormItems = {
            javaCertificate: {
                title: this.i18n.newHeader.setting.javaCertificate,
                value: '',
                errMsg: '',
                notice: '(7~180)',
                valid: true,
                isModify: false,
                require: true,
                format: 'N0'
            }
        };

        this.runLogFormItems = {
            runLogLevel: {
                title: this.i18n.plugins_perf_javaperfsetting.runLogLeve,
                value: { label: '', value: '' },
                errMsg: '',
                notice: './assets/img/mission/icon-help-dark.png',
                tip: this.i18n.plugins_perf_javaperfsetting.runLogTip,
                valid: true,
                isModify: false,
                require: true,
                options: []
            }
        };
    }

    /**
     * 组件初始化
     */
    ngOnInit() {
        // vscode颜色主题
        if (document.body.className.includes('vscode-light')) {
            this.currTheme = COLOR_THEME.Light;
        } else {
            this.currTheme = COLOR_THEME.Dark;
        }
        this.vscodeService.regVscodeMsgHandler('colorTheme', (msg: any) => {
            this.currTheme = msg.colorTheme;
        });

        // 用户角色判断
        this.isOperate = VscodeService.isAdmin();

        if (this.isOperate) {
            this.getLogLevels();
        }
        this.getJavaSetting();

        this.handleGetCertData();
    }

    /**
     * 判断内部通信证书自动告警时间（天）是否合法，合法则发送数据，成功后按钮回到可修改状态，不合法则不执行，保留当前状态
     * 暂时没有接口
     */
    public handleJavaCertificateConfirm(val: any) {
        if (Number(val) === Number(this.downloadService.dataSave.earlyWarningDays)) {
            return;
        }
        const params = { earlyWarningDays: val };
        const option = {
            url: '/tools/certificates/warningDays',
            params
        };
        this.vscodeService.post(option, (res: any) => {
            this.certificateFormItems.javaCertificate.isModify = false;
            this.certificateFormItems.javaCertificate.value = val;
            if (res.result === 'success') {
                this.downloadService.dataSave.earlyWarningDays = Number(val);
                const info = this.i18n.tip_msg.edite_ok;
                this.showInfoBox(info, 'info');
            }
        });
    }

    /**
     * 获取证书数据, 获取内部通信证书自动告警时间
     */
    public handleGetCertData() {
        const option = {
            url: `/tools/certificates`
        };
        this.vscodeService.get(option, (data: any) => {
            this.certificateFormItems.javaCertificate.value = data.members[0].earlyWarningDays;
            this.downloadService.dataSave.earlyWarningDays = data.members[0].earlyWarningDays;
        });
    }

    /**
     * 发送消息给vscode, 右下角弹出提醒框
     * @param info info
     * @param type type
     */
    private showInfoBox(info: any, type: any) {
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
     * 开始修改运行日志级别
     */
    public onSettingChange(item: any, status: any) {
        this.isLogModify = status;
        this.runLogFormItems[item].isModify = status;
        this.runLogFormItems[item].value = (this.formItemsValues as any)[item];
    }

    /**
     * 取消修改运行日志级别
     */
    public cancelModifyLevel() {
        this.isLogModify = false;
        this.runLogFormItems.runLogLevel.isModify = false;
        this.getJavaSetting();
    }

    /**
     * 确认修改运行日志级别
     */
    public onSettingConfim(type: string, val: any) {
        this.isLogModify = false;
        switch (type) {
            case 'runLogLevel':
                this.handleRunLogLevelConfirm(val);
                break;
            default:
                break;
        }
    }

    /**
     * 判断运行日志级别是否合法，合法则发送数据，成功后按钮回到可修改状态，不合法则不执行，保留当前状态
     */
    public handleRunLogLevelConfirm(val: any) {
        if (val.value === this.formItemsValues.runLogLevel.value) {
            this.onSettingChange('runLogLevel', false);
            return;
        }
        const params = { validLogLevel: this.runLogFormItems.runLogLevel.value.value };
        const option = {
            url: '/logging/levels/root',
            params
        };

        this.vscodeService.patch(option, () => {
            this.runLogFormItems.runLogLevel.isModify = false;
            this.formItemsValues.runLogLevel = this.runLogFormItems.runLogLevel.value;
            this.showInfoBox(this.i18n.plugins_perf_javaperfsetting.runLogModifySuc, 'info');
        });
    }

    /**
     * 查询运行日志级别
     */
    public getLogLevels() {
        const option = {
            url: '/logging/levels',
        };
        this.vscodeService.get(option, (res: any) => {
            res.members.map((item: any) => {
                this.runLogFormItems.runLogLevel.options.push({ label: item, value: item });
            });
        });
    }

    /**
     * 获取运行日志级别
     */
    public getJavaSetting() {
        const option = {
            url: '/logging/levels/root',
        };
        this.vscodeService.get(option, (res: any) => {
            this.runLogFormItems.runLogLevel.value = {
                label: res.serverLogLevel,
                value: res.serverLogLevel
            };
            this.formItemsValues.runLogLevel = {
                label: res.serverLogLevel,
                value: res.serverLogLevel
            };
        });
    }
}
