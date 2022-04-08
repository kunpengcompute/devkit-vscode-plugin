import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ViewEncapsulation } from '@angular/core';
import { TiModalService, TiModalRef } from '@cloud/tiny3';
import { VscodeService } from '../../../service/vscode.service';
import { I18nService } from '../../../service/i18n.service';
import { MessageService } from '../../../service/message.service';
import { ProfileDownloadService } from '../../../service/profile-download.service';

@Component({
    selector: 'app-profile-setting',
    templateUrl: './profile-setting.component.html',
    styleUrls: ['./profile-setting.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class ProfileSettingComponent implements OnInit {
    /**
     * 实时数据限定设置弹窗
     */
    @ViewChild('profileSettingModal', { static: false }) profileSettingModal: any;
    private modal: TiModalRef;

    /**
     * 拦截active的setter方法，在active为true时打开弹窗
     */
    @Input()
    set active(active: boolean) {
        if (active) {
            this.show();
        } else {
            this.hide();
        }
    }

    @Output() activeChange = new EventEmitter<boolean>();

    /**
     * profile tabs
     */
    @Input() profileTabs: Array<ProfileTabItem>;

    public i18n: any;

    /**
     * 设置组列表
     */
    public settingGroups = [
        { name: 'overview', inputs: [] as any[], showSubName: false },
        { name: 'gc', inputs: [], showSubName: false },
        { name: 'io', inputs: [], showSubName: true },
        { name: 'database', inputs: [], showSubName: true },
        { name: 'web', inputs: [], showSubName: true }
    ];

    /**
     * 后端返回数据的limitationType属性和设置组列表的映射；
     * 每项设置的一些配置
     */
    private ref = {
        over_view: {
            group: 'overview',
            times: {
                range: [1, 3],
            },
            seq: 0
        },
        jdbc: {
            group: 'database',
            times: {
                range: [3, 10],
            },
            seq: 0
        },
        pool_form: {
            group: 'database',
            records: {
                range: [50, 100],
            },
            seq: 1
        },
        mongodb: {
            group: 'database',
            times: {
                range: [3, 10],
            },
            seq: 2
        },
        cassandra: {
            group: 'database',
            times: {
                range: [3, 10],
            },
            seq: 3
        },
        hbase: {
            group: 'database',
            times: {
                range: [3, 10],
            },
            seq: 4
        },
        http: {
            group: 'web',
            times: {
                range: [3, 10],
            },
            seq: 0
        },
        file_io: {
            group: 'io',
            times: {
                range: [3, 10],
            },
            records: {
                range: [5000, 10000],
            },
            seq: 0
        },
        socket_io: {
            group: 'io',
            times: {
                range: [3, 10],
            },
            records: {
                range: [5000, 10000],
            },
            seq: 1
        },
        boot_metrics: {
            group: 'web',
            times: {
                range: [5, 10],
            },
            seq: 1
        },
        boot_traces: {
            group: 'web',
            times: {
                range: [5, 10],
            },
            records: {
                range: [3000, 5000],
            },
            seq: 2
        },
        gc: {
            group: 'gc',
            times: {
                range: [3, 10],
            },
            records: {
                range: [300, 500],
            },
            seq: 0
        },
    };

    public activeTab = 'overview';
    // 是否显示下分割线
    public showBottomDivider = false;

    constructor(
        private tiModal: TiModalService,
        private vscodeService: VscodeService,
        private i18nService: I18nService,
        private msgService: MessageService,
        private downloadService: ProfileDownloadService
    ) {
        this.i18n = this.i18nService.I18n();
    }

    /**
     * 组件初始化
     */
    ngOnInit() {
        this.initData();
    }

    /**
     * 初始化数据
     */
    private initData() {
        // 设置项配置初始化
        this.vscodeService.get({ url: '/limitation/' }, (res: any) => {
            res.data.forEach((item: LimitationResp) => {
                const refItem = (this.ref as any)[item.limitationType];
                if (!refItem) {
                    return;
                }
                const seq = (this.ref as any)[item.limitationType].seq;
                const belongGroup = refItem.group;
                const groupIndex = this.settingGroups.findIndex((group) => group.name === belongGroup);
                if (groupIndex === -1) {
                    return;
                }
                const inputGroupConfig: InputGroupConfig = {
                    id: item.id,
                    name: item.limitationType,
                };
                if (item.limitationTimes) {
                    inputGroupConfig.times = {
                        required: true,
                        range: refItem.times.range,
                        tip: `(${refItem.times.range[0]} min ~ ${refItem.times.range[1]} min)`,
                        value: item.limitationTimes,
                    };
                    (this.downloadService.dataLimit as any)[item.limitationType].timeValue = item.limitationTimes;
                    this.noticeTab(inputGroupConfig.name, item.limitationType, item.limitationTimes);
                }
                if (item.limitationRecords) {
                    inputGroupConfig.records = {
                        required: true,
                        range: refItem.records.range,
                        tip: `(${refItem.records.range[0]} ~ ${refItem.records.range[1]})`,
                        value: item.limitationRecords,
                    };
                    (this.downloadService.dataLimit as any)[item.limitationType].dataValue = item.limitationRecords;
                    this.noticeTab(inputGroupConfig.name, item.limitationType, item.limitationRecords);
                }

                this.settingGroups[groupIndex].inputs[seq] = inputGroupConfig;
            });
        });
    }

    /**
     * 更新设置组数据
     *
     * @param inputGroupConfig 设置组配置
     */
    private updateItem(inputGroupConfig: InputGroupConfig) {
        this.vscodeService.get({ url: '/limitation/' }, (res: any) => {
            const respItem: LimitationResp = res.data.find((item: LimitationResp) => {
                return item.limitationType === inputGroupConfig.name;
            });
            inputGroupConfig.id = respItem.id;
            if (inputGroupConfig.times) {
                inputGroupConfig.times.value = respItem.limitationTimes;
                (this.downloadService.dataLimit as any)[respItem.limitationType].timeValue = respItem.limitationTimes;
            }
            if (inputGroupConfig.records) {
                inputGroupConfig.records.value = respItem.limitationRecords;
                (this.downloadService.dataLimit as any)[respItem.limitationType].dataValue = respItem.limitationRecords;
            }
        });
    }

    /**
     * 处理input的confirm事件，提交修改
     *
     * @param value 输入值
     * @param inputGroupConfig 对应的修改项
     * @param type 修改项类型
     */
    public handleInputConfirm(value: string, inputGroupConfig: InputGroupConfig, type: 'times' | 'records') {
        const params: any = { limitationType: inputGroupConfig.name };
        if (type === 'times') {
            params.limitationTimes = value;
        } else if (type === 'records') {
            params.limitationRecords = value;
        }
        const id = inputGroupConfig.id === -1 ? '' : inputGroupConfig.id;
        this.vscodeService.post({ url: '/limitation/' + id, params }, (res: any) => {
            this.updateItem(inputGroupConfig);
            // 通知页签
            this.noticeTab(inputGroupConfig.name, type, Number(value));
            if ((self as any).webviewSession.getItem('tuningOperation') === 'hypertuner') {
                this.vscodeService.showTuningInfo(this.i18n.tip_msg.edite_ok, 'info', 'dataLimitation');
            } else {
                this.showMsgBox('info', this.i18n.tip_msg.edite_ok);
            }

        });
    }

    /**
     * 处理input的restore事件，恢复默认值
     *
     * @param inputGroupConfig 对应的修改项
     * @param type 修改项类型
     */
    public handleInputRestore(inputGroupConfig: InputGroupConfig, type: 'times' | 'records') {
        const params: any = { limitationType: inputGroupConfig.name };
        if (type === 'times') {
            params.limitationTimes = inputGroupConfig.times.range[0];
        } else if (type === 'records') {
            params.limitationRecords = inputGroupConfig.records.range[0];
        }
        if (inputGroupConfig.id !== -1) {
            this.vscodeService.post({ url: '/limitation/' + inputGroupConfig.id, params }, () => {
                inputGroupConfig[type].value = inputGroupConfig[type].range[0];
                if (type === 'times') {
                    (this.downloadService.dataLimit as any)[inputGroupConfig.name].timeValue =
                     inputGroupConfig.times.range[0];
                } else if (type === 'records') {
                    (this.downloadService.dataLimit as any)[inputGroupConfig.name].dataValue =
                     inputGroupConfig.records.range[0];
                }
                if ((self as any).webviewSession.getItem('tuningOperation') === 'hypertuner') {
                    this.vscodeService.showTuningInfo(this.i18n.tip_msg.edite_ok, 'info', 'dataLimitation');
                } else {
                    this.showMsgBox('info', this.i18n.tip_msg.edite_ok);
                }
                // 通知页签
                this.noticeTab(inputGroupConfig.name, type, inputGroupConfig[type].value);
            });
        } else {
            if ((self as any).webviewSession.getItem('tuningOperation') === 'hypertuner') {
                this.vscodeService.showTuningInfo(this.i18n.plugins_perf_java_profiling_limitation.notice.defaultValue,
                   'warn', 'dataLimitation');
            } else {
                this.showMsgBox('warn', this.i18n.plugins_perf_java_profiling_limitation.notice.defaultValue);
            }

        }
    }

    private noticeTab(name: string, type: string, value: number) {
        this.msgService.sendMessage({
            type: 'dataLimit',
            data: { name, type, value }
        });
    }

    /**
     * details元素切换事件
     * 在每次details展开或关闭时
     * 判断body里面所有元素的高度是否高于body的高度来决定是否显示下分割虚线
     */
    public onDetailsToggle() {
        const bodyWrapper: Element = document.getElementById('body-wrapper');
        const maxHeight = 438;
        this.showBottomDivider = bodyWrapper.clientHeight > maxHeight;
    }

    /**
     * 显示弹窗
     */
    private show() {
        // 打开活动页签的设置
        const activeProfile = this.profileTabs.find((item) => {
            return item.active;
        });
        this.activeTab = activeProfile.tabName;

        // 打开弹窗
        this.modal = this.tiModal.open(this.profileSettingModal, {
            id: 'profileSettingModal',
            closeIcon: false,
            draggable: true
        });

        // 跳转到活动页签的设置项位置
        this.teleportTo(activeProfile.tabName);
    }

    /**
     * 隐藏弹窗
     */
    public hide() {
        if (this.modal) {
            this.modal.dismiss();
            this.activeChange.emit(false);
        }
    }

    /**
     * 跳转到指定dom位置
     *
     * @param domId domID
     */
    private teleportTo(domId: string) {
        const targetView: Element = document.getElementById(domId);
        if (targetView) {
            targetView.scrollIntoView();
        } else {
            this.showBottomDivider = false;
        }
    }

    /**
     * 右下角弹出提示框
     *
     * @param type 类型
     * @param info 内容
     */
    private showMsgBox(type: 'info' | 'warn' | 'error', info: string) {
        const message = {
            cmd: 'showInfoBox',
            data: { info, type },
        };
        this.vscodeService.postMessage(message, null);
    }
}

// 类型声明
interface ProfileTabItem {
    active: boolean;
    link: string;
    tabName: string;
}

interface LimitationResp {
    /**
     * 数据项id，在修改后会变，默认值为-1
     */
    id: number;
    limitationRecords: number;
    limitationTimes: number;
    limitationType: string;
    /**
     * 最后修改人id
     */
    thorUserId: number;
}

interface InputGroupConfig {
    id: number;
    name: string;
    times?: InputConfig;
    records?: InputConfig;
}

export interface InputConfig {
    required: boolean;
    range: Array<number>;
    tip: string;
    value: any;
}
