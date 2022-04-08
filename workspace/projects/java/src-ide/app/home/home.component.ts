import { Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import {
    TiTableRowData, TiTableSrcData, TiTableColumns, TiValidators,
    TiValidationConfig, TiPaginationEvent
} from '@cloud/tiny3';
import { Router, ActivatedRoute } from '@angular/router';
import { ValidationErrors, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MytipService } from '../service/mytip.service';
import { I18nService } from '../service/i18n.service';
import { LANGUAGE_TYPE } from '../service/i18n.service';
import { VscodeService, COLOR_THEME } from '../service/vscode.service';
import { ProfileDownloadService } from '../service/profile-download.service';
import { StompService } from '../service/stomp.service';
import { Utils } from '../service/utils.service';
import { RegularVerify } from 'projects/java/src-com/app/utils/regular-verify';
import { SpinnerBlurDefaultInfo } from 'projects/java/src-com/app/utils/spinner-info.type';
import { ChangeDetectorRef } from '@angular/core';
import { MessageService } from '../service/message.service';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
})

export class HomeComponent implements OnInit {
    constructor(
        private elementRef: ElementRef,
        public router: Router,
        public route: ActivatedRoute,
        public fb: FormBuilder,
        public vscodeService: VscodeService,
        public mytip: MytipService,
        public i18nService: I18nService,
        private stompService: StompService,
        public regularVerify: RegularVerify,
        private downloadService: ProfileDownloadService,
        public utils: Utils,
        private changeDetectorRef: ChangeDetectorRef,
        private zone: NgZone,
        private msgService: MessageService,
    ) {
        this.i18n = this.i18nService.I18n();
        this.sampleFormGroup = fb.group({
            socketIoSampleThred: new FormControl(1, {
                validators: [
                    TiValidators.required,
                    TiValidators.minValue(1),
                    TiValidators.maxValue(1000),
                ],
                updateOn: 'change',
            }),
            fileIoSampleThred: new FormControl(1, {
                validators: [
                    TiValidators.required,
                    TiValidators.minValue(1),
                    TiValidators.maxValue(1000),
                ],
                updateOn: 'change',
            }),
            threadDumpInterval: new FormControl(1, {
                validators: [
                    TiValidators.required,
                    TiValidators.minValue(1),
                    TiValidators.maxValue(300),
                ],
                updateOn: 'change',
            }),
            nativeMethodInterval: new FormControl(1, {
                validators: [
                    TiValidators.required,
                    TiValidators.minValue(1),
                    TiValidators.maxValue(1000),
                ],
                updateOn: 'change',
            }),
            javaMethodInterval: new FormControl(1, {
                validators: [
                    TiValidators.required,
                    TiValidators.minValue(1),
                    TiValidators.maxValue(1000),
                ],
                updateOn: 'change',
            }),
            recordSec: new FormControl(60, {
                validators: [
                    TiValidators.required,
                    TiValidators.minValue(1),
                    TiValidators.maxValue(300),
                ],
                updateOn: 'change',
            }),
        });
        this.searchOptions = [
            {
                label: 'searchJavaProcess',
                value: 'searchJavaProcess'
            },
        ];
    }
    @ViewChild('samplingModal', { static: false }) sampModal: any;
    @ViewChild('caFileModal', { static: false }) caFileModal: { Open: () => void; Close: () => void; };
    // sampling配置
    public sampleIntervalTip = '';
    public showTip: boolean;
    public sampleFormGroup: FormGroup;
    public guardianTabs: any = [];
    public changeIndex: any = 0;
    public primaryJvms: any = [];
    public tempprimaryJvms: any = [];
    public containerJvms: any = [];
    public searchJvmList: any = [];
    public currentAllJvms: any = [];
    public allPromaryJvms: any = [];
    public allContainerJvms: any = [];
    public showline = true; // 显示主机进程与容器进程分割线

    public javaMethodBlur: SpinnerBlurDefaultInfo;
    public recordDurBlur: SpinnerBlurDefaultInfo;
    public nativeMethodBlur: SpinnerBlurDefaultInfo;
    public intervalBlur: SpinnerBlurDefaultInfo;
    public fileioBlur: SpinnerBlurDefaultInfo;
    public socketioBlur: SpinnerBlurDefaultInfo;
    public hoverBtnTip: '';

    // 表单验证部分
    public validation: TiValidationConfig = {
        type: 'blur',
    };
    public sampModalForms = {
        recordDur: {
            label: 'Record Duration(sec)',
            max: 300,
            min: 1,
            value: 60,
            defaultVal: 60,
            rangeValue: [1, 300],
            format: 'N0',
            required: true,
            disabled: false,
        },
        selected: {
            label: 'Manually stop',
            value: true,
            required: false,
        },
        manuallyStop: {
            label: 'Manually stop',
            state: false,
            required: false,
        },
        methodSamp: {
            label: 'Method Sampling',
            state: true,
            required: false,
        },
        javaMethod: {
            label: 'Java Method Interval(ms)',
            max: 1000,
            min: 1,
            value: 1,
            defaultVal: 1,
            rangeValue: [1, 1000],
            format: 'N0',
            required: true,
            disabled: false,
        },
        nativeMethod: {
            label: 'Native Method Interval(ms)',
            max: 1000,
            min: 1,
            value: 1,
            defaultVal: 1,
            rangeValue: [1, 1000],
            format: 'N0',
            required: true,
            disabled: false,
        },
        threadDump: {
            label: 'Thread Dump',
            state: true,
            required: false,
        },
        interval: {
            label: 'Interval(sec)',
            max: 300,
            min: 1,
            value: 1,
            defaultVal: 1,
            rangeValue: [1, 300],
            format: 'N0',
            required: true,
            disabled: false,
        },
        fileIoSample: {
            label: 'fileIoSample',
            state: false,
            required: false,
        },
        fileIoSampleThred: {
            label: 'fileIoSample',
            max: 1000,
            min: 1,
            value: 1,
            defaultVal: 1,
            rangeValue: [1, 1000],
            format: 'N0',
            required: true,
            disabled: false,
        },
        socketIoSample: {
            label: 'socketIoSample',
            state: false,
            required: false,
        },
        leakSample: {
            state: true,
            label: 'leakSample',
            required: false
        },
        socketIoSampleThred: {
            label: 'fileIoSample',
            max: 1000,
            min: 1,
            value: 1,
            defaultVal: 1,
            rangeValue: [1, 1000],
            format: 'N0',
            required: true,
            disabled: false,
        }
    };

    private currentUser: string;

    i18n: any;

    public currentSelectJvm: any = {};

    public currentPage: any = 1;
    public totalNumber: any = 0;
    public pageSize: { options: Array<number>, size: number } = {
        options: [10, 20, 50, 100],
        size: 10
    };

    public samplingRecords: any = [];

    // 请求参数
    private inputParams: any;

    // Java进程表格展示
    public jvmDisplayed: Array<TiTableRowData> = []; // 表示表格实际呈现的数据（开发者默认设置为[]即可）
    public jvmSrcData: TiTableSrcData;
    public jvmColumns: Array<TiTableColumns> = [];

    public primaryJvmDisplayed: Array<TiTableRowData> = []; // 表示表格实际呈现的数据（开发者默认设置为[]即可）
    public primaryJvmData: TiTableSrcData; // 主机进程数据

    public searchJvmDisplayed: Array<TiTableRowData> = []; // 表示表格实际呈现的数据（开发者默认设置为[]即可）
    public searchJvmData: TiTableSrcData; // 主机进程数据

    public containerJvmDisplayed: Array<TiTableRowData> = []; // 表示表格实际呈现的数据（开发者默认设置为[]即可）
    public containerJvmData: TiTableSrcData;  // 容器进程数据

    public isOtherGuardian = false;
    public curGuardian: any;
    public currLang: any;
    public uid: string; // 当前用户id
    public isDisabled = false;
    public isHover = false;   // 是否hover分析按钮
    public showJdkTip = false;
    public isShowJdk8Tip = false;
    public jreTip: string;
    public showLoading = false;
    public showLoadingProfiling = false;
    public reachTheMax = false;

    public pluginUrlCfg: any = {
        java_home_openFAQ7: '',
    };

    // 搜索功能
    public searchWords: Array<string> = [];
    public searchKeys: Array<string> = ['name', 'lvmid'];
    public searchOptions: any[] = [];
    public isAlarm = false;
    public alarmType: any;
    public saveJvmVersionInfo: any[] = [];
    public searchValue = '';
    // 获取主题颜色
    public ColorTheme = {
        Dark: COLOR_THEME.Dark,
        Light: COLOR_THEME.Light
    };
    public currTheme: any;
    public isProfilling = false;
    // 正在分析中的Jvm
    public profilingJvm: any;
    // 正在分析中的JvmId
    public profilingJvmId: any;
    // 新的在线分析Jvm
    public startNewJvm: any;
    public defaultPageSize: any = 10;
    /**
     * 组件初始化
     */
    ngOnInit() {
        if (document.body.className.indexOf('vscode-light') !== -1) {
            this.currTheme = COLOR_THEME.Light;
        } else {
            this.currTheme = COLOR_THEME.Dark;
        }
        this.vscodeService.regVscodeMsgHandler('colorTheme', (msg: any) => {
            this.currTheme = msg.colorTheme;
        });
        // 获取全局url配置数据
        this.vscodeService.postMessage({ cmd: 'readURLConfig' }, (resp: any) => {
            this.pluginUrlCfg = resp;
        });

        this.initGuardianTabs();

        this.setSpinnerBlur();

        this.showTip = true;

        this.route.queryParams.subscribe(data => {
            if (((self as any).webviewSession || {}).getItem('tuningOperation') === 'hypertuner') {
                data = JSON.parse(data.sendMessage.replace(/#/g, ':').replace(/%/g, '"'));
                this.alarmType = 'workspace';
                this.inputParams = data;
            } else {
                data = JSON.parse(data.sendMessage.replace(/#/g, ':'));
                this.alarmType = data.type;
            }
        });
        this.showLoadingProfiling = false;
        this.currLang = I18nService.getLang();
        this.sampleIntervalTip = this.i18n.common_term_new_sampling_interval_tip;
        // 执行vscode的逻辑
        if (((self as any).webviewSession || {}).getItem('tuningOperation') !== 'hypertuner') {
            this.getParams();
        } else {
            this.qryGuardianCurrentStata();
        }
        this.currentUser = (self as any).webviewSession.getItem('username');

        this.showLoading = true;
        this.qryGuardianDetail(this.inputParams.selfInfo.id, false);

        this.vscodeService.regVscodeMsgHandler('updateMenu', () => {
            this.qryGuardianDetail(this.inputParams.selfInfo.id, true);
        });
        this.vscodeService.regVscodeMsgHandler('spaceAlarm', (msg: any) => {
            this.isAlarm = msg.value;
            this.alarmType = msg.type;
        });
        // 不允许对其他用户创建的Guardian进行分析操作。
        if (this.inputParams.selfInfo.owner.username !== this.currentUser) {
            const message = {
                cmd: 'showInfoBox',
                data: {
                    info: this.i18n.common_term_guardian_Permission_tip,
                    type: 'warn'
                }
            };
            this.vscodeService.postMessage(message, null);
            return;
        }
        this.getSampleThreshold().then((resp) => {
            if (resp && resp.alarmJFRCount && resp.maxJFRCount) {
                if (this.samplingRecords.length >= resp.maxJFRCount) {
                    this.reachTheMax = true;
                }
            }
        });
        this.vscodeService.messageHandler.stopProfiling = () => {
            this.profilingJvmId = '';
            this.isProfilling = false;
            this.profilingJvm = null;
            if (this.stompService) {
                this.stompService.disConnect();
            }
        };
        this.vscodeService.messageHandler.sendProfilingStata = (data: any) => {
            this.showJdkTip = false;
            this.isShowJdk8Tip = false;
            this.profilingJvm = null;
            this.isAlarm = data.data;
            this.qryGuardianDetail(this.inputParams.selfInfo.id, true);
        };
        this.vscodeService.messageHandler.openNewProfiling = () => {
            this.isProfilling = false;
            this.currentSelectJvm = this.startNewJvm;
            this.createProfiling();
        };
        // 注册IDE获取目标环境信息监听
        this.vscodeService.messageHandler.refreshGuardinsByIDE = (guardian: any) => {
            this.qryGuardianDetailCallback(guardian.data, true);
        };
        // 注册在线任务状态监听
        this.vscodeService.messageHandler.qryProfilingCurrentStatus = (data: any) => {
            this.isProfilling = data.data.status;
            if (this.profilingJvm) {
                this.profilingJvm.id = data.data.id;
            }
        };
        this.msgService.getMessage().subscribe((msg) => {
            if (msg.type === 'connected') {
                this.openProfilingPage();
            }
        });
    }
    private qryGuardianCurrentStata() {
        const option = {
            url: 'qryGuardianCurrentStata'
        };
        this.vscodeService.get(option, (data: any) => {
            this.isProfilling = data.status;
            this.profilingJvmId = data.id;
        });
    }
    /**
     * 初始化table
     */
    public initGuardianTabs() {
        this.guardianTabs = [
            {
                tabName: this.i18n.common_term_java_primary_process,
                type: 'primary',
                active: true,
                checked: true
            },
            {
                tabName: this.i18n.common_term_java_container_process,
                link: 'container',
                active: false,
                checked: true
            }
        ];
        this.guardianTabs.forEach((item: any) => {
            item.active = false;
        });
        this.guardianTabs[0].active = true;
    }



    /**
     * 切换主机进程和容器进程
     * params index  tab下标
     */
    public activeChange(index: any) {
        this.changeIndex = index;
        this.guardianTabs[0].active = true;
        this.pageSize.size = 10;
        this.currentPage = 1;
        this.guardianTabs.forEach((tab: any, i: any) => {
            tab.active = i === this.changeIndex ? true : false;
        });

        if (this.searchValue) {
            this.searchEvent(this.searchValue);
        } else {
            this.qryGuardianDetail(this.inputParams.selfInfo.id, true);
        }
    }

    /**
     * 微调器回填初始化
     */
    public setSpinnerBlur() {
        this.recordDurBlur = {
            control: this.sampleFormGroup.controls.recordSec,
            min: 1,
            max: 300,
            defaultValue: 60,
        };
        this.javaMethodBlur = {
            control: this.sampleFormGroup.controls.javaMethodInterval,
            min: 1,
            max: 1000,
            defaultValue: 1,
        };
        this.nativeMethodBlur = {
            control: this.sampleFormGroup.controls.nativeMethodInterval,
            min: 1,
            max: 1000,
            defaultValue: 1,
        };
        this.intervalBlur = {
            control: this.sampleFormGroup.controls.threadDumpInterval,
            min: 1,
            max: 300,
            defaultValue: 1,
        };
        this.fileioBlur = {
            control: this.sampleFormGroup.controls.fileIoSampleThred,
            min: 1,
            max: 1000,
            defaultValue: 1,
        };
        this.socketioBlur = {
            control: this.sampleFormGroup.controls.socketIoSampleThred,
            min: 1,
            max: 1000,
            defaultValue: 1,
        };
    }

    /**
     * 发送消息给vscode, 右下角弹出提醒框
     * @param info info
     * @param type type
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
     * 获取在线分析按钮禁用状态
     *
     * @param item 行数据
     */
    public getProfilingBtnStatus(item: any) {
        if ((((self as any).webviewSession || {}).getItem('tuningOperation') === 'hypertuner')){
            if (!this.profilingJvm) {
                return this.isAlarm || this.isDisabled
                || this.isOtherGuardian
                || item.profileState === 'RECORDING'
                || item.profileState === 'PROFILING'
                || this.isShowJdk8Tip
                || (this.isProfilling && this.profilingJvmId === item.id);
            }
        }
        return this.isAlarm || this.isDisabled
            || this.isOtherGuardian
            || item.profileState === 'RECORDING'
            || item.profileState === 'PROFILING'
            || this.isShowJdk8Tip
            || (this.isProfilling && (this.profilingJvm.id === item.id));
    }

    /**
     * 获取采样分析按钮禁用状态
     *
     * @param item 行数据
     */
    public getSamplingBtnStatus(item: any) {
        if ((((self as any).webviewSession || {}).getItem('tuningOperation') === 'hypertuner')){
            if (!this.profilingJvm) {
                return this.isAlarm || this.isDisabled
                || this.isOtherGuardian
                || item.profileState === 'RECORDING'
                || item.profileState === 'PROFILING'
                || this.isShowJdk8Tip
                || (this.isProfilling && this.profilingJvmId === item.id);
            }
        }
        return this.isAlarm || this.isDisabled
            || this.isOtherGuardian
            || item.profileState === 'PROFILING'
            || item.profileState === 'RECORDING'
            || this.showJdkTip
            || (this.isProfilling && (this.profilingJvm.id === item.id));
    }

    private qryGuardianDetail(guardianId: any, isFresh: any) {
        const option = {
            url: `/guardians/${guardianId}`
        };
        this.vscodeService.get(option, (guardian: any) => {
            this.qryGuardianDetailCallback(guardian, isFresh);
        });
    }
    private qryGuardianDetailCallback(guardian: any, isFresh: any) {
        this.showLoading = false;
        this.curGuardian = guardian;
        // 判断是否默认展示主机进程
        if (!isFresh) {
            if (guardian.containerId) {
                this.showline = false;
                this.guardianTabs[0].checked = false;
                this.guardianTabs[1].active = true;
                this.changeIndex = 1;
            } else { // guardian部署在容器中
                this.initGuardianTabs();
                this.changeIndex = 0;
                this.showline = true;
            }
        }
        this.curGuardian.owner = this.inputParams.selfInfo.owner;
        this.setAnalysisBtnAble();
        this.currentAllJvms = this.curGuardian.jvms;
        if (this.searchValue) {
            this.handleSearchProcessData(this.searchJvmList);
        } else {
            this.handleProcessData(this.curGuardian.jvms);
        }
        this.initJvmData();
        this.updateWebViewPage();
    }
    /**
     * 自定义失去焦点规则
     * @param obj 校验对象
     */
    public changeSpinner(value: any) {
        this.regularVerify.setSpinnerDefaultInfo(value);
        if (this.sampleFormGroup.controls.threadDumpInterval.value >=
            this.sampleFormGroup.controls.recordSec.value && this.sampModalForms.selected.value) {
            this.sampleFormGroup.controls.threadDumpInterval.setValue(
                this.sampleFormGroup.controls.recordSec.value);
        }
    }
    private setAnalysisBtnAble() {
        if (this.curGuardian.owner.username !== this.currentUser) {
            this.isOtherGuardian = true;
            return;
        }
        if (this.curGuardian.state !== 'CONNECTED') {
            this.isOtherGuardian = true;
            return;
        }
        this.isOtherGuardian = false;
        return;
    }
    /**
     * 格式化tips
     */
    public btnTipFarmat(item: any, profile: any) {
        if (!profile && (this.showJdkTip || this.isShowJdk8Tip) && !this.isOtherGuardian) {
            return this.jreTip;
        }
        if (item.profileState === 'RECORDING') {
            return this.i18nService.I18nReplace(this.i18n.common_term_profiling_tip_disabled, {
                0: this.i18n.plugins_perf_java_sampling_name
            });
        } else if (item.profileState === 'PROFILING') {
            return this.i18nService.I18nReplace(this.i18n.common_term_profiling_tip_disabled, {
                0: this.i18n.plugins_perf_java_profiling_name
            });
        } else if (this.isOtherGuardian) {
            return this.i18n.common_term_guardian_Permission_tip;
        } else if (this.isAlarm) {
            if ((self as any).webviewSession.getItem('tuningOperation') === 'hypertuner') {
                return this.i18nService.I18nReplace(this.i18n.plugins_java_space_message.tip, {
                    0: this.i18n.plugins_java_space_message.disk,
                    1: profile ? this.i18n.plugins_java_space_message.profiling :
                        this.i18n.plugins_java_space_message.sampling
                });
            } else {
                return this.i18nService.I18nReplace(this.i18n.plugins_java_space_message.tip, {
                    0: this.alarmType === 'workspace' ? this.i18n.plugins_java_space_message.workplace :
                        this.i18n.plugins_java_space_message.disk,
                    1: profile ? this.i18n.plugins_java_space_message.profiling :
                        this.i18n.plugins_java_space_message.sampling
                });
            }
        } else {
            return '';
        }
    }

    /**
     *  隐藏提示框
     * @param item java进程
     */
    public hideTip() {
        this.showTip = false;
    }

    /**
     *  java进程
     * @param item java进程
     */
    public warnTip(item: any) {
        if (((self as any).webviewSession || {}).getItem('tuningOperation') === 'hypertuner') {
            this.checkDiscAlarm();
            this.hoverBtnTip = this.i18n.common_term_jvm_version_lower_tip;
        }
        const jvmInfo = this.saveJvmVersionInfo.filter((jvm) => {
            return jvm.guardianId === this.curGuardian.id && jvm.jvmId === item.id;
        });

        if (jvmInfo.length > 0) {
            this.showJdkTip = jvmInfo[0].isLower;
            this.jreTip = jvmInfo[0].isLower ? this.hoverBtnTip : '';
            return;
        }
        this.isHover = true;
        const cgId = encodeURIComponent(this.curGuardian.id);
        let option = {
            url: `/guardians/${cgId}/jvms/${encodeURIComponent(item.id)}/checkJvmSupportSampling`
        };
        if (((self as any).webviewSession || {}).getItem('tuningOperation') === 'hypertuner') {
            option = {
                url: `/guardians/${cgId}/jvms/${encodeURIComponent(item.id)}/`
            };
        }
        this.vscodeService.get(option, (resp: any) => {
            let isLowerVersion = resp.code < 0 ? true : false;
            if (((self as any).webviewSession || {}).getItem('tuningOperation') === 'hypertuner') {
                isLowerVersion = parseInt(resp.jdkVersion.slice(4), 10) < 11;
            }
            if (isLowerVersion) {
                const jreVersion = parseInt(resp.jdkVersion.slice(4), 10);
                this.showJdkTip = true;
                if ( jreVersion < 8 ) {
                    if (((self as any).webviewSession || {}).getItem('tuningOperation') === 'hypertuner') {
                        this.isShowJdk8Tip = true;
                        this.hoverBtnTip = this.i18n.common_term_jvm_version_lower_8_tip;
                    } else {
                        this.hoverBtnTip = resp?.message;
                    }
                } else {
                    this.isShowJdk8Tip = false;
                    if (((self as any).webviewSession || {}).getItem('tuningOperation') === 'hypertuner') {
                        this.hoverBtnTip = this.i18n.common_term_jvm_version_lower_tip;
                    } else {
                        this.hoverBtnTip = resp?.message;
                    }
                }
            } else {
                this.isShowJdk8Tip = false;
                this.showJdkTip = false;
                this.hoverBtnTip = '';
            }
            this.saveJvmVersionInfo.push({
                guardianId: this.curGuardian.id,
                jvmId: item.id,
                isLowerVersion,
                isLower: isLowerVersion
            });
        });
    }

    /**
     * 检测磁盘空间
     */
    private checkDiscAlarm() {
        const option = {
            url: 'checkDiscAlarm'
        };

        this.vscodeService.get(option, (data: any) => {
            if (data) {
                this.isAlarm = true;
            } else {
                this.isAlarm = false;
            }
        });
    }

    /**
     *  初始化进程
     * @param item java进程
     */
    private initJvmData() {
        this.pageSize.size = 10;
        this.jvmColumns = [
            { title: 'DIE', width: '100%' }
        ];

        this.primaryJvmData = {
            data: this.primaryJvms,
            state: {
                searched: false, // 源数据未进行搜索处理
                sorted: false, // 源数据未进行排序处理
                paginated: false // 源数据未进行分页处理
            }
        };
        this.containerJvmData = {
            data: this.containerJvms,
            state: {
                searched: false, // 源数据未进行搜索处理
                sorted: false, // 源数据未进行排序处理
                paginated: false // 源数据未进行分页处理
            }
        };
    }

    /**
     * 对搜索数据进行主机进程和容器进程分类
     * @param index 进程索引
     */
    public handleSearchProcessData(currentJvms: Array<any>) {
        this.primaryJvms = [];
        this.containerJvms = [];
        this.allPromaryJvms = [];
        this.allContainerJvms = [];
        this.primaryJvms = currentJvms.filter((itemValue: any) => {
            return !itemValue.containerId;
        });
        this.allPromaryJvms = this.primaryJvms;
        const startSize = (this.currentPage - 1) * this.pageSize.size;
        const endSize = (this.currentPage) * this.pageSize.size;
        this.containerJvms = currentJvms.filter((itemValue: any) => {
            return itemValue.containerId;
        });
        this.allContainerJvms = this.containerJvms;
        this.primaryJvms = this.primaryJvms.slice(startSize, endSize);
        this.containerJvms = this.containerJvms.slice(startSize, endSize);
    }

    /**
     * 对java进程数据进行主机进程和容器进程分类
     * @param index 进程索引
     */
    public handleProcessData(currentJvms: Array<any>) {
        this.primaryJvms = [];
        this.containerJvms = [];
        this.allPromaryJvms = [];
        this.allContainerJvms = [];
        this.primaryJvms = currentJvms.filter((itemValue: any) => {
            return !itemValue.containerId;
        });
        this.allPromaryJvms = this.primaryJvms;
        const start = (this.currentPage - 1) * this.pageSize.size;
        const end = (this.currentPage) * this.pageSize.size;
        this.primaryJvms = this.primaryJvms.slice(start, end);

        const containers: Array<any> = currentJvms.filter((itemValue: any) => {
            return itemValue.containerId;
        });

        let flag = false;
        // 遍历数组，区分主机进程和容器进程
        for (const i in containers) {
            if (Object.prototype.hasOwnProperty.call(containers, i)) {
                let tempindex;
                for (const j in this.containerJvms) {
                    if (Object.prototype.hasOwnProperty.call(this.containerJvms, j)) {
                        if (this.containerJvms[j].containerId === containers[i].containerId) {
                            flag = true;
                            tempindex = j;
                            break;
                        }
                    }
                }
                if (flag === true) {
                    if (this.containerJvms.length && this.containerJvms[tempindex]
                        && this.containerJvms[tempindex].children) {
                        this.containerJvms[tempindex].children.push(containers[i]);
                    }
                    flag = false;
                } else if (flag === false) {
                    const containerObj = {
                        containerId: '',
                        containerName: '',
                        profileState: '',
                        isShowDetail: false,
                        children: [] as any[],
                    };
                    containerObj.containerId = containers[i].containerId;
                    containerObj.containerName = containers[i].containerName;
                    containerObj.profileState = containers[i].profileState;
                    this.downloadService.homeProcessData.forEach((itemData: any) => {
                        if (itemData.containerId === containers[i].containerId) {
                            containerObj.isShowDetail = itemData.expand;
                        }
                    });
                    containerObj.children.push(containers[i]);
                    this.containerJvms.push(containerObj);
                }
            }
        }
        if (this.containerJvms.length) {
            this.containerJvms[0].isShowDetail = true;
        }
        this.allContainerJvms = this.containerJvms;
        if (!this.changeIndex) {
            this.totalNumber = this.allPromaryJvms.length;
        } else {
            this.totalNumber = this.allContainerJvms.length;
        }
        const startSize = (this.currentPage - 1) * this.pageSize.size;
        const endSize = (this.currentPage) * this.pageSize.size;
        this.containerJvms = this.containerJvms.slice(startSize, endSize);
    }

    private getParams() {
        this.route.queryParams.subscribe((data: any) => {
            const response = JSON.parse(data.sendMessage.replace(/#/g, ':'));
            this.uid = response.selfInfo.owner.uid;
            this.inputParams = response;
        });
    }

    /**
     * 展示容器下的进程
     * params tiTable  tiny3表格相关参数
     */
    public toShowContainerDetail(jvmObj: any, index: any) {
        if (jvmObj.containerId) {
            jvmObj.isShowDetail = !jvmObj.isShowDetail;
            const processObj: any = {
                containerId: jvmObj.containerId,
                expand: jvmObj.isShowDetail
            };
            if (this.downloadService.homeProcessData &&
                this.downloadService.homeProcessData.length) {
                this.downloadService.homeProcessData.forEach((item: any) => {
                    if (item.containerId !== jvmObj.containerId) {
                        this.downloadService.homeProcessData.push(processObj);
                    } else {
                        item.expand = jvmObj.isShowDetail;
                    }
                });
            } else {
                this.downloadService.homeProcessData.push(processObj);
            }
        }
    }

    /**
     * 进程选择响应
     * @param index 进程索引
     */
    selectJvm(item: any) {
        if (!this.isDisabled) {
            this.currentSelectJvm = item;
        }
    }
    startProfiling(item: any) {
        if (((self as any).webviewSession || {}).getItem('tuningOperation') === 'hypertuner') {
            if (this.isProfilling) {
                this.isDisabled = true;
                this.currentSelectJvm = item;
                const message = {
                    cmd: 'checkProfilingCurrentStata',
                    data: {
                    }
                };
                this.vscodeService.postMessage(message, (data: any) => {
                    if (data) {
                        this.startNewJvm = this.currentSelectJvm;
                        this.createProfiling();
                    } else {
                        this.isDisabled = false;
                    }
                });
            } else {
                this.createProfiling();
            }
        } else {
            if (this.isProfilling) {
                this.startNewJvm = this.currentSelectJvm;
                this.vscodeService.postMessage({
                    cmd: 'showWarningMessage',
                    data: {
                        message: {
                            info: this.i18n.common_term_has_profiling_stop_content,
                            confirm: this.i18n.plugins_javaperf_button_confirm,
                            cancel: this.i18n.plugins_javaperf_button_cancel
                        }
                    }
                });
            } else {
                this.createProfiling();
            }
        }
    }
    /**
     * 创建Profiling
     */
    createProfiling() {
        this.isProfilling = true;
        this.isDisabled = true;
        this.showLoadingProfiling = true;
        if (this.currentSelectJvm.profileState === 'PROFILING') {
            return;
        }
        this.profilingJvm = this.currentSelectJvm;
        // 延迟检测是否安装了wss证书，若没有安装不跳转页面，弹窗提示安装证书
        const profileSubs = [
            `/user/queue/profile/jvms/${encodeURIComponent(this.currentSelectJvm.id)}/state`,
        ];
        if (this.stompService.stompClient) { this.stompService.stompClient.disconnect(); }
        this.stompService.client(profileSubs, '/cmd/start-profile', {
            jvmId: this.currentSelectJvm.id,
            guardianId: this.inputParams.selfInfo.id,
            operation: 'createProfiling'
        });
    }
    /**
     * websocket连接后，打开Profiling页面
     */
    openProfilingPage() {
        const params = {
            cmd: 'setGlobleState',
            data: {
                data: {
                    list: [
                        { key: 'currentSelectJvm', value: this.currentSelectJvm.name },
                        { key: 'jvmId', value: this.currentSelectJvm.id },
                        { key: 'guardianId', value: this.inputParams.selfInfo.id },
                        { key: 'guardianName', value: this.inputParams.selfInfo.name },
                        { key: 'role', value: (self as any).webviewSession.getItem('role') },
                        { key: 'username', value: (self as any).webviewSession.getItem('username') },
                        { key: 'loginId', value: (self as any).webviewSession.getItem('loginId') },
                        { key: 'downloadProfile', value: 'false' },
                    ]
                }
            }
        };
        let openPagecmd = 'openNewPage';
        if (((self as any).webviewSession || {}).getItem('tuningOperation') === 'hypertuner') {
            openPagecmd = 'openJavaProfilingPage';
        }
        const data = {
            cmd: openPagecmd, data: {
                router: 'profiling/' + this.currentSelectJvm.name,
                panelId: 'profiling',
                viewTitle: this.currentSelectJvm.name + ' (' + this.currentSelectJvm.lvmid + ')' +
                    this.i18n.plugins_javaperf_title_createTime +
                    this.utils.dateFormat(new Date(), 'yyyy-MM-dd hh:mm:ss'),
                message: {
                    currentSelectJvm: this.currentSelectJvm.name, jvmId: this.currentSelectJvm.id,
                    guardianId: this.inputParams.selfInfo.id, guardianName: this.inputParams.selfInfo.name,
                    role: (self as any).webviewSession.getItem('role'),
                    username: (self as any).webviewSession.getItem('username'),
                    loginId: (self as any).webviewSession.getItem('loginId'),
                    lvmid: this.currentSelectJvm.lvmid
                }
            }
        };
        if (this.stompService.flag === false) {
            if (((self as any).webviewSession || {}).
                getItem('tuningOperation') === 'hypertuner') {
                this.isDisabled = false;
                this.showLoadingProfiling = false;
            }
            this.caFileModal.Open();
        } else {
            if (this.stompService.stompClient) { this.stompService.stompClient.disconnect(); }
            this.vscodeService.postMessage({ cmd: 'checkThreaddumpReportThreshold' }, () => {
                this.vscodeService.postMessage({ cmd: 'checkHeapdumpReportThreshold' }, () => {
                    this.vscodeService.postMessage({ cmd: 'checkGclogReportThreshold' }, () => {
                        this.vscodeService.postMessage(params, () => {
                            this.vscodeService.postMessage(data, () => {
                                this.initDownloadData();
                                this.qryGuardianDetail(this.inputParams.selfInfo.id, true);
                                if (((self as any).webviewSession || {}).
                                    getItem('tuningOperation') !== 'hypertuner') {
                                    // 刷新左侧菜单
                                    this.updateMenu();
                                } else {
                                    this.isDisabled = false;
                                    this.showLoadingProfiling = false;
                                }
                            });
                        });
                    });
                });
            });
        }
        if (((self as any).webviewSession || {}).
            getItem('tuningOperation') !== 'hypertuner') {
            this.isDisabled = false;
            this.showLoadingProfiling = false;
        }
    }
    /**
     * 获取sample分析记录
     * @param context 上下文
     */
    public getSampleRecords(): Promise<any> {

        return new Promise((resolve) => {
            const option = {
                url: '/records/',
            };
            this.vscodeService.get(option, (resp: any) => {
                if (resp && resp.members) {
                    resolve(resp.members);
                }
            });
        });
    }

    /**
     * 获取sampling记录阈值
     * @param context 上下文
     */
    public async getSampleThreshold(): Promise<any> {
        this.samplingRecords = await this.getSampleRecords();
        return new Promise((resolve) => {
            const option = {
                url: '/tools/settings/report/',
            };
            this.vscodeService.get(option, (resp: any) => {
                resolve(resp);
            });
        });
    }

    /**
     * 创建Sampling
     */
    createSampling() {
        if (this.isDisabled || this.currentSelectJvm.profileState === 'PROFILING') {
            return;
        }
        this.isDisabled = true;
        this.getSampleThreshold().then((resp) => {
            if (resp && resp.alarmJFRCount && resp.maxJFRCount) {
                if (this.samplingRecords.length >= resp.alarmJFRCount &&
                    this.samplingRecords.length < resp.maxJFRCount) {
                    if (((self as any).webviewSession || {}).getItem('tuningOperation') === 'hypertuner') {
                        this.vscodeService.showTuningInfo(
                            this.i18nService.I18nReplace(this.i18n.newHeader.threshold.warnTip, {
                                0: this.samplingRecords.length,
                                1: resp.alarmJFRCount
                            }), 'info', 'JFRCount');
                    } else {
                        this.showInfoBox(this.i18nService.I18nReplace(this.i18n.newHeader.threshold.warnTip, {
                            0: this.samplingRecords.length,
                            1: resp.alarmJFRCount
                        }), 'info');
                    }
                } else if (this.samplingRecords.length >= resp.maxJFRCount) {
                    if (((self as any).webviewSession || {}).getItem('tuningOperation') === 'hypertuner') {
                        this.vscodeService.showTuningInfo(
                            this.i18nService.I18nReplace(this.i18n.newHeader.threshold.fullTip, {
                                0: this.samplingRecords.length,
                                1: resp.maxJFRCount
                            }), 'warn', 'JFRCount');
                    } else {
                        this.showInfoBox(this.i18nService.I18nReplace(this.i18n.newHeader.threshold.fullTip, {
                            0: this.samplingRecords.length,
                            1: resp.maxJFRCount
                        }), 'warn');
                    }
                    this.isDisabled = false;
                    return;
                }
                this.startSampling();
            }
        });
    }

    /**
     * 弹出创建Sampling弹窗
     */
    public startSampling() {
        this.showLoadingProfiling = true;
        // 延迟检测是否安装了wss证书，若没有安装不跳转页面，弹窗提示安装证书
        const samplingSubs = [
            `/user/queue/profile/jvms/${encodeURIComponent(this.currentSelectJvm.id)}/state`,
        ];
        if (this.stompService.stompClient) {
            this.stompService.stompClient.disconnect();
            if (((self as any).webviewSession || {}).getItem('tuningOperation') === 'hypertuner') {
                this.isProfilling = false;
            }
        }
        this.stompService.client(samplingSubs, '/cmd/sub-record',
            {
                jvmId: this.currentSelectJvm.id,
                guardianId: this.inputParams.selfInfo.id,
            });

        setTimeout(() => {
            this.stompService.stompClient.disconnect(); // 恢复状态
            if (this.stompService.flag === false) {
                this.showLoadingProfiling = false;
                this.caFileModal.Open();
            } else if (this.stompService.flag === true) {
                this.showLoadingProfiling = false;
                this.setInitialSampModal();
                this.sampModal.Open();
            }
            this.isDisabled = false;
            this.showLoadingProfiling = false;
        }, 3000);
    }
    /**
     * 设置初始化采样分析弹框的参数
     */
    public setInitialSampModal() {
        this.sampleFormGroup.controls.recordSec.setValue(60);
        this.sampModalForms.methodSamp.state = true;
        this.sampleFormGroup.controls.javaMethodInterval.setValue(1);
        this.sampleFormGroup.controls.nativeMethodInterval.setValue(1);
        this.sampModalForms.threadDump.state = true;
        this.sampleFormGroup.controls.threadDumpInterval.setValue(1);
        this.sampModalForms.fileIoSample.state = false;
        this.sampleFormGroup.controls.fileIoSampleThred.setValue(1);
        this.sampModalForms.socketIoSample.state = false;
        this.sampleFormGroup.controls.socketIoSampleThred.setValue(1);
        this.sampModalForms.leakSample.state = true;
    }
    /**
     * 关闭弹窗
     */
    public closeMask() {
        this.sampModal.Close();
    }
    private updateMenu() {
        const message = {
            cmd: 'updateTree',
            data: {}
        };
        this.vscodeService.postMessage(message, null);
    }
    private initDownloadData() {
        this.downloadService.initData();
    }
    /**
     * 老年代对象状态更改
     */
    leakSampleChange(state: any) {
        this.sampModalForms.leakSample.state = state;
    }
    /**
     * manuallyStop状态更改
     */
    manuallyStopChange(state: boolean) {
        this.sampModalForms.manuallyStop.state = state;
        this.sampModalForms.recordDur.disabled = state;
    }
    /**
     * methodSamp状态更改
     */
    methodSampChange(state: boolean) {
        this.sampleFormGroup.controls.javaMethodInterval.setValue(1);
        this.sampleFormGroup.controls.nativeMethodInterval.setValue(1);
        this.sampModalForms.methodSamp.state = state;
        this.sampModalForms.javaMethod.disabled = !state;
        this.sampModalForms.nativeMethod.disabled = !state;
    }
    /**
     * thread状态更改
     */
    threadDumpChange(state: boolean) {
        this.sampleFormGroup.controls.threadDumpInterval.setValue(1);
        this.sampModalForms.threadDump.state = state;
        this.sampModalForms.interval.disabled = !state;
    }
    /**
     * sampModal弹框确定回调
     */
    sampModalOk() {
        const errors: ValidationErrors | null = TiValidators.check(
            this.sampleFormGroup
        );
        if (errors) {
            const firstError: any = Object.keys(errors)[0];
            this.elementRef.nativeElement
                .querySelector(`[formControlName=${firstError}]`)
                .focus();
            return;
        }
        const methodFlag = this.sampModalForms.methodSamp.state &&
            (!this.sampleFormGroup.controls.javaMethodInterval.value ||
                !this.sampleFormGroup.controls.nativeMethodInterval.value);
        const threadDumpFlag = this.sampModalForms.threadDump.state &&
            !this.sampleFormGroup.controls.threadDumpInterval.value;
        if (methodFlag || threadDumpFlag || !this.sampleFormGroup.controls.recordSec.value) {
            const invalidEl =
                this.elementRef.nativeElement.querySelector(`.sampling-modal .ng-invalid.ng-touched:not([tiFocused])`);
            if (invalidEl) {
                const inputEl = $(invalidEl).find('.ti3-spinner-input-box .ti3-spinner-input')[0];
                inputEl.focus();
            }
            return;
        }
        const params = {
            duration: !this.sampModalForms.selected.value ? -1
                : this.sampleFormGroup.controls.recordSec.value * 1000,
            jvmId: this.currentSelectJvm.id,
            enableMethodSample: this.sampModalForms.methodSamp.state,
            javaMethodSampleInterval: this.sampleFormGroup.controls.javaMethodInterval.value,
            nativeMethodSampleInterval: this.sampleFormGroup.controls.nativeMethodInterval.value,
            enableThreadDump: this.sampModalForms.threadDump.state,
            threadDumpInterval: this.sampleFormGroup.controls.threadDumpInterval.value * 1000,
            enableFileIO: this.sampModalForms.fileIoSample.state,
            enableSocketIO: this.sampModalForms.socketIoSample.state,
            fileIOInterval: this.sampleFormGroup.controls.fileIoSampleThred.value,
            socketIOInterval: this.sampleFormGroup.controls.socketIoSampleThred.value,
            enableOldObjectSample: this.sampModalForms.leakSample.state,
            createTime: +new Date(),
        };
        const option = {
            url: `/guardians/${this.inputParams.selfInfo.id}/cmds/start-record`,
            params
        };
        this.vscodeService.post(option, (resp: any) => {
            if (resp.message) {
                if (((self as any).webviewSession || {}).getItem('tuningOperation') === 'hypertuner') {
                    this.vscodeService.showTuningInfo(resp.message, 'error', 'samplingTip');
                }
                this.showInfoBox(this.currLang === LANGUAGE_TYPE.ZH ? resp.message : resp.code, 'error');
            } else {
                const data = {
                    cmd: 'openNewPage', data: {
                        router: 'sampling/' + resp.id,
                        panelId: resp.id,
                        viewTitle: resp.name + this.i18n.plugins_javaperf_title_createTime +
                            this.utils.dateFormat(resp.createTime * 1000, 'yyyy-MM-dd hh:mm:ss'),
                        message: {
                            sendMessage: JSON.stringify({
                                selfInfo: {
                                    ...resp, line: true
                                }
                            })
                        }
                    }
                };
                // 刷新左侧菜单
                this.updateMenu();
                this.sampModalForms = {
                    recordDur: {
                        label: 'Record Duration(sec)',
                        max: 300,
                        min: 1,
                        value: 60,
                        defaultVal: 60,
                        rangeValue: [1, 300],
                        format: 'N0',
                        required: true,
                        disabled: false,
                    },
                    selected: {
                        label: 'Manually stop',
                        value: true,
                        required: false,
                    },
                    manuallyStop: {
                        label: 'Manually stop',
                        state: false,
                        required: false,
                    },
                    methodSamp: {
                        label: 'Method Sampling',
                        state: true,
                        required: false,
                    },
                    javaMethod: {
                        label: 'Java Method Interval(ms)',
                        max: 1000,
                        min: 1,
                        value: 1,
                        defaultVal: 1,
                        rangeValue: [1, 1000],
                        format: 'N0',
                        required: true,
                        disabled: false,
                    },
                    nativeMethod: {
                        label: 'Native Method Interval(ms)',
                        max: 1000,
                        min: 1,
                        value: 1,
                        defaultVal: 1,
                        rangeValue: [1, 1000],
                        format: 'N0',
                        required: true,
                        disabled: false,
                    },
                    threadDump: {
                        label: 'Thread Dump',
                        state: true,
                        required: false,
                    },
                    interval: {
                        label: 'Interval(sec)',
                        max: 300,
                        min: 1,
                        value: 1,
                        defaultVal: 1,
                        rangeValue: [1, 300],
                        format: 'N0',
                        required: true,
                        disabled: false,
                    },
                    fileIoSample: {
                        label: 'fileIoSample',
                        state: false,
                        required: false,
                    },
                    fileIoSampleThred: {
                        label: 'fileIoSample',
                        max: 1000,
                        min: 1,
                        value: 1,
                        defaultVal: 1,
                        rangeValue: [1, 1000],
                        format: 'N0',
                        required: true,
                        disabled: false,
                    },
                    socketIoSample: {
                        label: 'socketIoSample',
                        state: false,
                        required: false,
                    },
                    leakSample: {
                        state: true,
                        label: 'leakSample',
                        required: false
                    },
                    socketIoSampleThred: {
                        label: 'fileIoSample',
                        max: 1000,
                        min: 1,
                        value: 1,
                        defaultVal: 1,
                        rangeValue: [1, 1000],
                        format: 'N0',
                        required: true,
                        disabled: false,
                    }
                };
                this.vscodeService.postMessage(data, () => {
                });
            }

        });
        this.closeMask();
    }

    /**
     * 搜索
     */
    public searchEvent(value: any): void {
        this.searchValue = value;
        this.searchWords[0] = value;
        this.currentPage = 1;
        this.searchJvmList = this.curGuardian.jvms.slice();
        this.searchJvmList = this.searchJvmList.filter((jvm: { name: string | any[]; lvmid: string | any[]; }) => {
            return jvm.name.indexOf(this.searchValue) !== -1 || jvm.lvmid.indexOf(this.searchValue) !== -1;
        });
        const end = (this.currentPage) * this.pageSize.size;
        const start = (this.currentPage - 1) * this.pageSize.size;
        const allSearchJvms = this.searchJvmList.slice();
        if (this.searchValue) {
            // 在主机进程页签下搜索
            if (!this.changeIndex) {
                this.allPromaryJvms = allSearchJvms.filter((filterItem: any) => {
                    return !filterItem.containerId;
                });
                this.totalNumber = this.allPromaryJvms.length;
                this.primaryJvms = this.allPromaryJvms.slice(start, end);
                this.primaryJvmData.data = this.primaryJvms;

                // 在容器进程页签下搜索
            } else {
                this.allPromaryJvms = allSearchJvms.filter((filterItem: any) => {
                    return filterItem.containerId;
                });
                this.totalNumber = this.allPromaryJvms.length;
                this.containerJvms = this.allPromaryJvms.slice(start, end);
                this.containerJvmData.data = this.containerJvms;
            }
        } else {
            if (((self as any).webviewSession || {}).getItem('tuningOperation') === 'hypertuner') {
                this.primaryJvmData.data = this.searchJvmList;
            }
            this.qryGuardianDetail(this.inputParams.selfInfo.id, true);
        }
    }

    /**
     * 分页
     */
    public onPageUpdate(event: TiPaginationEvent): void {
        const end = (event.currentPage) * this.pageSize.size;
        const start = (event.currentPage - 1) * this.pageSize.size;
        if (this.searchValue.length > 0) {
            const currentPageJvms = this.searchJvmList.slice();
            // 获取主机进程分页数据
            if (!this.changeIndex) {
                this.allPromaryJvms = currentPageJvms.filter((filterItem: any) => {
                    return !filterItem.containerId;
                });
                this.primaryJvms = this.allPromaryJvms.slice(start, end);
                this.primaryJvmData.data = this.primaryJvms;
                this.totalNumber = this.allPromaryJvms.length;
            } else { // 获取容器进程分页数据
                this.allContainerJvms = currentPageJvms.filter((filterItem: any) => {
                    return filterItem.containerId;
                });
                this.containerJvms = this.allContainerJvms.slice(start, end);
                this.containerJvmData.data = this.containerJvms;
                this.totalNumber = this.allContainerJvms.length;
            }
        } else {
            if (!this.changeIndex) {
                this.primaryJvmData.data = this.allPromaryJvms.slice(start, end);
                this.totalNumber = this.allPromaryJvms.length;
            } else {
                this.containerJvmData.data = this.allContainerJvms.slice(start, end);
                this.totalNumber = this.allContainerJvms.length;
            }
        }
    }
    public getNodataText() {
        let text = '';
        if (this.curGuardian.state === 'CONNECTED') {
            text = this.i18n.plugins_perf_java_guardianHome_connected_noData;
        } else {
            text = this.i18n.plugins_perf_java_guardianHome_disconnected_noData;
        }
        return { text };
    }
    /**
     * IntellIj刷新webview页面
     */
    public updateWebViewPage() {
        if (((self as any).webviewSession || {}).getItem('tuningOperation') === 'hypertuner') {
            this.zone.run(() => {
                this.changeDetectorRef.checkNoChanges();
                this.changeDetectorRef.detectChanges();
            });
        }
    }
    /**
     * 下载缺失包
     * @param url 路径
     */
    openUrl(url: string) {
        // intellij走该逻辑
        if (((self as any).webviewSession || {}).getItem('tuningOperation') === 'hypertuner') {
            this.vscodeService.postMessage({
                cmd: 'openHyperlinks',
                data: {
                    hyperlinks: url
                }
            }, null);
        } else {
            const a = document.createElement('a');
            a.setAttribute('href', url);
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    }
}
