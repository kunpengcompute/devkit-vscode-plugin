import { Component, OnInit } from '@angular/core';
import { I18nService } from '../../service/i18n.service';
import { VscodeService } from '../../service/vscode.service';
import { AxiosService } from '../../service/axios.service';
import { MytipService } from '../../service/mytip.service';
import { MessageService } from '../../service/message.service';
import { ProfileDownloadService } from '../../service/profile-download.service';
@Component({
    selector: 'app-threshold',
    templateUrl: './threshold.component.html',
    styleUrls: ['./threshold.component.scss']
})
export class ThresholdComponent implements OnInit {
    constructor(
        public Axios: AxiosService,
        public i18nService: I18nService,
        public vscodeService: VscodeService,
        public myTip: MytipService,
        public msgService: MessageService,
        public profileDownload: ProfileDownloadService) {
        this.i18n = this.i18nService.I18n();
        this.formItems = {
            tips: {
                value: '',
                errMsg: '',
                notice: '(1~20)',
                valid: true,
                isModify: false,
                require: true,
                format: 'N0'
            },
            warn: {
                value: '',
                errMsg: '',
                notice: '(1~20)',
                valid: true,
                isModify: false,
                require: true,
                format: 'N0'
            },
            heapdumpTips: {
                value: '',
                errMsg: '',
                notice: '(1~10)',
                valid: true,
                isModify: false,
                require: true,
                format: 'N0'
            },
            heapdumpWarn: {
                value: '',
                errMsg: '',
                notice: '(1~10)',
                valid: true,
                isModify: false,
                require: true,
                format: 'N0'
            },
            heapdumpSize: {
                value: '',
                errMsg: '',
                notice: '(1~2048)',
                valid: true,
                isModify: false,
                require: true,
                format: 'N0'
            },
            threaddumpTips: {
                value: '',
                errMsg: '',
                notice: '(1~10)',
                valid: true,
                isModify: false,
                require: true,
                format: 'N0'
            },
            threaddumpWarn: {
                value: '',
                errMsg: '',
                notice: '(1~10)',
                valid: true,
                isModify: false,
                require: true,
                format: 'N0'
            },
            gclogTips: {
                value: '',
                errMsg: '',
                notice: '(1~10)',
                valid: true,
                isModify: false,
                require: true,
                format: 'N0'
            },
            gclogWarn: {
                value: '',
                errMsg: '',
                notice: '(1~10)',
                valid: true,
                isModify: false,
                require: true,
                format: 'N0'
            },
        };
        this.config.heapdumpTips.tipText = this.i18n.newHeader.threshold.heapDump.countTip;
        this.config.heapdumpWarn.tipText = this.i18n.newHeader.threshold.heapDump.countTip;
        this.config.threaddumpTips.tipText = this.i18n.newHeader.threshold.threadDump.countTip;
        this.config.threaddumpWarn.tipText = this.i18n.newHeader.threshold.threadDump.countTip;
        this.config.gclogTips.tipText = this.i18n.newHeader.threshold.gclog.countTip;
        this.config.gclogWarn.tipText = this.i18n.newHeader.threshold.gclog.countTip;
    }
    public i18n: any;
    public isAdmin: boolean;
    public formItems = {
        tips: {
            value: '',
            errMsg: '',
            notice: '',
            valid: true,
            isModify: false,
            require: true,
            format: 'N0'
        },
        warn: {
            value: '',
            errMsg: '',
            notice: '',
            valid: true,
            isModify: false,
            require: true,
            format: 'N0'
        },
        heapdumpTips: {
            value: '',
            errMsg: '',
            notice: '',
            valid: true,
            isModify: false,
            require: true,
            format: 'N0'
        },
        heapdumpWarn: {
            value: '',
            errMsg: '',
            notice: '',
            valid: true,
            isModify: false,
            require: true,
            format: 'N0'
        },
        heapdumpSize: {
            value: '',
            errMsg: '',
            notice: '',
            valid: true,
            isModify: false,
            require: true,
            format: 'N0'
        },
        threaddumpTips: {
            value: '',
            errMsg: '',
            notice: '',
            valid: true,
            isModify: false,
            require: true,
            format: 'N0'
        },
        threaddumpWarn: {
            value: '',
            errMsg: '',
            notice: '',
            valid: true,
            isModify: false,
            require: true,
            format: 'N0'
        },
        gclogTips: {
            value: '',
            errMsg: '',
            notice: '',
            valid: true,
            isModify: false,
            require: true,
            format: 'N0'
        },
        gclogWarn: {
            value: '',
            errMsg: '',
            notice: '',
            valid: true,
            isModify: false,
            require: true,
            format: 'N0'
        },

    };
    public config = {
        tips: {
            label: '',
            type: 'tip',
            range: [1, 20],
            text: '',
            value: this.formItems.warn.value,
            tipText: ''
        },
        warn: {
            label: '',
            type: 'warn',
            range: [1, 20],
            text: '',
            value: this.formItems.tips.value,
            tipText: ''
        },
        heapdumpTips: {
            label: '',
            type: 'tip',
            range: [1, 10],
            text: '',
            value: this.formItems.heapdumpWarn.value,
            tipText: ''
        },
        heapdumpWarn: {
            label: '',
            type: 'warn',
            range: [1, 10],
            text: '',
            value: this.formItems.heapdumpTips.value,
            tipText: ''
        },
        heapdumpSize: {
            label: '',
            type: 'none',
            range: [1, 2048],
            text: '',
            value: this.formItems.heapdumpSize.value,
            tipText: ''
        },
        threaddumpTips: {
            label: '',
            type: 'tip',
            range: [1, 10],
            text: '',
            value: this.formItems.threaddumpWarn.value,
            tipText: ''
        },
        threaddumpWarn: {
            label: '',
            type: 'warn',
            range: [1, 10],
            text: '',
            value: this.formItems.threaddumpTips.value,
            tipText: ''
        },
        gclogTips: {
            label: '',
            type: 'tip',
            range: [1, 10],
            text: '',
            value: this.formItems.gclogWarn.value,
            tipText: ''
        },
        gclogWarn: {
            label: '',
            type: 'warn',
            range: [1, 10],
            text: '',
            value: this.formItems.gclogTips.value,
            tipText: ''
        },
    };
    public valueCopy: number;
    public minNum = '';
    public maxNum = '';

    public heapdumpTexts = {
        histReportHints: '',
        histReportMax: '',
        importReportSize: ''
    };

    public threaddumpTexts = {
        histReportHints: '',
        histReportMax: '',
    };

    public gclogTexts = {
        histReportHints: '',
        histReportMax: '',
    };

    /**
     * 初始化
     */
    ngOnInit() {
        // 判断当前登录用户是否是管理员
        this.isAdmin = VscodeService.isAdmin();
        this.getReportNum();
        this.getHeapdumpReportNum();
        this.getThreaddumpReportNum();
        this.getGclogReportNum();

        this.heapdumpTexts.histReportHints =
        this.i18nService.I18nReplace(this.i18n.newHeader.threshold.histReportHints, {
            0: 1,
            1: 10
        });
        this.heapdumpTexts.histReportMax = this.i18nService.I18nReplace(this.i18n.newHeader.threshold.histReportMax, {
            0: 1,
            1: 10
        });
        this.heapdumpTexts.importReportSize =
        this.i18nService.I18nReplace(this.i18n.newHeader.threshold.heapDump.importReportSize, {
            0: 1,
            1: 2048
        });
        this.threaddumpTexts.histReportHints =
        this.i18nService.I18nReplace(this.i18n.newHeader.threshold.histReportHints, {
            0: 1,
            1: 10
        });
        this.threaddumpTexts.histReportMax = this.i18nService.I18nReplace(this.i18n.newHeader.threshold.histReportMax, {
            0: 1,
            1: 10
        });

        this.gclogTexts.histReportHints = this.i18nService.I18nReplace(this.i18n.newHeader.threshold.histReportHints, {
            0: 1,
            1: 10
        });
        this.gclogTexts.histReportMax = this.i18nService.I18nReplace(this.i18n.newHeader.threshold.histReportMax, {
            0: 1,
            1: 10
        });
    }
    /**
     * 设置采样记录提示阈值
     * @param：val
     */
    public handleTipsConfirm(val: any) {
        if (Number(val) === Number(this.profileDownload.downloadItems.report.alarmJFRCount)) {
            return;
        }
        const params = {
            maxJFRCount: this.formItems.warn.value,
            alarmJFRCount: Number(val)
        };
        const option = {
            url: '/tools/settings/report',
            params
        };
        this.vscodeService.post(option, (res: any) => {
            if (res.code === 0) {
                this.showInfoBox(this.i18n.tip_msg.edite_ok, 'info');
                this.getReportNum();
            } else {
                this.showInfoBox(this.i18n.newHeader.threshold.count, 'warn');
                return;
            }
        });
    }
    /**
     * 设置采样记录最大阈值
     * @param：val
     */
    public handleWarnConfirm(val: any) {
        if (Number(val) === Number(this.profileDownload.downloadItems.report.maxJFRCount)) {
            return;
        }
        const params = {
            maxJFRCount: Number(val),
            alarmJFRCount: this.formItems.tips.value
        };
        const option = {
            url: '/tools/settings/report',
            params,
        };
        this.vscodeService.post(option, (res: any) => {
            if (res.code === 0) {
                this.showInfoBox(this.i18n.tip_msg.edite_ok, 'info');
                this.getReportNum();
            } else {
                this.showInfoBox(this.i18n.newHeader.threshold.count, 'warn');
                return;
            }
        });
    }

    /**
     * 查询在线分析报告的配置
     * @param：val
     */
    public getReportNum() {
        const option = {
            url: '/tools/settings/report/',
        };
        this.vscodeService.get(option, (data: any) => {
            this.formItems.tips.value = data.alarmJFRCount;
            this.formItems.warn.value = data.maxJFRCount;
            this.config.tips.value = data.maxJFRCount;
            this.config.warn.value = data.alarmJFRCount;
            this.profileDownload.downloadItems.report.alarmJFRCount = data.alarmJFRCount;
            this.profileDownload.downloadItems.report.maxJFRCount = data.maxJFRCount;
        });
    }

    /**
     * 查询内存转储的配置
     */
    public getHeapdumpReportNum() {
        // 获取已保存报告-内存转储配置
        const heapDumpOption = {
            url: '/tools/settings/heap',
        };
        this.vscodeService.get(heapDumpOption, (data: any) => {
            this.formItems.heapdumpTips.value = data.alarmHeapCount;
            this.formItems.heapdumpWarn.value = data.maxHeapCount;
            this.formItems.heapdumpSize.value = data.maxHeapSize;
            this.config.heapdumpTips.value = data.maxHeapCount;
            this.config.heapdumpWarn.value = data.alarmHeapCount;
            this.config.heapdumpSize.value = data.maxHeapSize;
            this.profileDownload.downloadItems.report.maxHeapCount = data.maxHeapCount;
            this.profileDownload.downloadItems.report.alarmHeapCount = data.alarmHeapCount;
            this.profileDownload.downloadItems.report.maxHeapSize = data.maxHeapSize;
            this.vscodeService.postMessage({ cmd: 'updateHeapReportConfig' }, null);
        });
    }

    /**
     * 设置已保存报告-内存转储提示阈值
     */
    handleHeapdumpTipsConfirm(val: any) {
        if (Number(val) === Number(this.profileDownload.downloadItems.report.alarmHeapCount)) {
            return;
        } else {
            const params = {
                alarmHeapCount: Number(val),
                maxHeapCount: this.formItems.heapdumpWarn.value,
                maxHeapSize: this.formItems.heapdumpSize.value
            };
            this.editHeapdumpConfig(params);
        }
    }

    /**
     * 设置已保存报告-内存转储警告阈值
     */
    handleHeapdumpWarnConfirm(val: any) {
        if (Number(val) === Number(this.profileDownload.downloadItems.report.maxHeapCount)) {
            return;
        } else {
            const params = {
                alarmHeapCount: this.formItems.heapdumpTips.value,
                maxHeapCount: Number(val),
                maxHeapSize: this.formItems.heapdumpSize.value
            };
            this.editHeapdumpConfig(params);
        }
    }

    /**
     * 设置已保存报告-内存转储导入报告大小阈值(MB)(1-2048)
     */
    handleHeapdumpSizeConfirm(val: any) {
        if (Number(val) === Number(this.profileDownload.downloadItems.report.maxHeapSize)) {
            return;
        } else {
            const params = {
                alarmHeapCount: this.formItems.heapdumpTips.value,
                maxHeapCount: this.formItems.heapdumpWarn.value,
                maxHeapSize: Number(val)
            };
            this.editHeapdumpConfig(params);
        }
    }

    /**
     * 修改已保存报告-内存转储配置
     * @param params 参数
     */
    public editHeapdumpConfig(params: any) {
        const option = {
            url: '/tools/settings/heap',
            params
        };
        this.vscodeService.post(option, (res: any) => {
            if (res.code === 0) {
                this.showInfoBox(this.i18n.tip_msg.edite_ok, 'info');
            } else {
                this.showInfoBox(this.i18n.tip_msg.edite_error, 'warn');
            }
            this.getHeapdumpReportNum();
        });
    }

    /**
     * 修改数据列表-线程转储配置
     * @param params 参数
     */
    public editThreaddumpConfig(params: any) {
        const option = {
            url: '/tools/settings/threadDump',
            params
        };
        this.vscodeService.post(option, (res: any) => {
            if (res.code === 0) {
                this.showInfoBox(this.i18n.tip_msg.edite_ok, 'info');
            } else {
                this.showInfoBox(this.i18n.tip_msg.edite_error, 'warn');
            }
            this.getThreaddumpReportNum();
        });
    }

    /**
     * 查询线程转储的配置
     */
    public getThreaddumpReportNum() {
        // 获取数据列表-线程转储配置
        const heapDumpOption = {
            url: '/tools/settings/threadDump',
        };
        this.vscodeService.get(heapDumpOption, (data: any) => {
            this.formItems.threaddumpTips.value = data.alarmThreadDumpCount;
            this.formItems.threaddumpWarn.value = data.maxThreadDumpCount;
            this.config.threaddumpTips.value = data.maxThreadDumpCount;
            this.config.threaddumpWarn.value = data.alarmThreadDumpCount;
            this.profileDownload.downloadItems.report.maxThreadDumpCount = data.maxThreadDumpCount;
            this.profileDownload.downloadItems.report.alarmThreadDumpCount = data.alarmThreadDumpCount;
            this.vscodeService.postMessage({ cmd: 'updateThreadReportConfig' }, null);
        });
    }

    /**
     * 设置数据列表-线程转储提示阈值
     */
    handleThreaddumpTipsConfirm(val: any) {
        if (Number(val) === Number(this.profileDownload.downloadItems.report.alarmThreadDumpCount)) {
            return;
        } else {
            const params = {
                alarmThreadDumpCount: Number(val),
                maxThreadDumpCount: this.formItems.threaddumpWarn.value,
            };
            this.editThreaddumpConfig(params);
        }
    }

    /**
     * 设置已保存报告-内存转储警告阈值
     */
    handleThreaddumpWarnConfirm(val: any) {
        if (Number(val) === Number(this.profileDownload.downloadItems.report.maxThreadDumpCount)) {
            return;
        } else {
            const params = {
                alarmThreadDumpCount: this.formItems.threaddumpTips.value,
                maxThreadDumpCount: Number(val),
            };
            this.editThreaddumpConfig(params);
        }
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
     * 修改数据列表-gclog配置
     * @param params 参数
     */
    public editGclogConfig(params: any) {
        const option = {
            url: '/tools/settings/gcLog',
            params
        };
        this.vscodeService.post(option, (res: any) => {
            if (res.code === 0) {
                this.showInfoBox(this.i18n.tip_msg.edite_ok, 'info');
            } else {
                this.showInfoBox(this.i18n.tip_msg.edite_error, 'warn');
            }
            this.getGclogReportNum();
        });
    }

    /**
     * 查询gclog报告的配置
     */
    public getGclogReportNum() {
        // 获取数据列表-gclog配置
        const gclogOption = {
            url: '/tools/settings/gcLog',
        };
        this.vscodeService.get(gclogOption, (data: any) => {
            this.formItems.gclogTips.value = data.alarmGcLogCount;
            this.formItems.gclogWarn.value = data.maxGcLogCount;
            this.config.gclogTips.value = data.maxGcLogCount;
            this.config.gclogWarn.value = data.alarmGcLogCount;
            this.profileDownload.downloadItems.report.maxGcLogCount = data.maxGcLogCount;
            this.profileDownload.downloadItems.report.alarmGcLogCount = data.alarmGcLogCount;
            this.vscodeService.postMessage({ cmd: 'updateGclogReportConfig' }, null);
        });
    }

    /**
     * 设置数据列表-gclog提示阈值
     */
    handleGclogTipsConfirm(val: any) {
        if (Number(val) === Number(this.profileDownload.downloadItems.report.alarmGcLogCount)) {
            return;
        } else {
            const params = {
                alarmGcLogCount: Number(val),
                maxGcLogCount: this.formItems.gclogWarn.value,
            };
            this.editGclogConfig(params);
        }
    }

    /**
     * 设置已保存报告-gclog警告阈值
     */
    handleGclogWarnConfirm(val: any) {
        if (Number(val) === Number(this.profileDownload.downloadItems.report.maxGcLogCount)) {
            return;
        } else {
            const params = {
                alarmGcLogCount: this.formItems.gclogTips.value,
                maxGcLogCount: Number(val),
            };
            this.editGclogConfig(params);
        }
    }
}
