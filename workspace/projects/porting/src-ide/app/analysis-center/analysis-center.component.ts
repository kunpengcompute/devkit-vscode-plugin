import { Component, OnInit, ElementRef, ViewChild, AfterContentInit, ChangeDetectorRef } from '@angular/core';
import { TiTableColumns, TiTableRowData, TiTableSrcData, TiValidationConfig } from '@cloud/tiny3';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HyMiniModalService } from 'hyper';
import { LanguageType } from '../global/globalData';
import {
    CustomValidators, UploadService, MessageService, UtilsService,
    MytipService, I18nService, VscodeService, COLOR_THEME
} from '../service';

const enum STATUS {
    SUCCESS = 0,
    FAIL = 1,
    MAXIMUM_TASK = '0x010125', // 文件上传任务已达到上限
    INSUFFICIENT_SPACE = '0x010611',
    CONFIG_MIRROR = '0x0a0213',
    DOWNLOAD_RPM = '0x0a0214',
    OSNotSupport = '0x0a0210', // 当前操作系统不支持此类型软件包
}

const enum SERVICE_STATUS {
    success = 0,
    processing = 1,
    failed = 2,
    readyForDownload = 3, // 无需重构
    noTask = -1
}

const enum MESSAGE_MAP {
    SHOW_PROGRESS = 'getStatus',
    FILE_SIZE_EXCEEED = 'fileSizeExceed',
    FILE_UPLOAD = 'uploadFile',
    PROCESS_FAILED = 'processFailed',
    PROCESS_SUCCESS = 'processSuccess'
}

const enum FILE_TYPE {
    RPM = 'rpm',
    DEB = 'deb'
}

const enum RADIO_ACTION {
    ACTION_INIT = 0,
    LOCAL_ACTIVE = 1,
    UPLOAD_ACTIVE = 2
}

const RADIO_LABLE_COLOR = [
    {
        theme: 'vscode-light',
        actions: [
            {
                action: RADIO_ACTION.ACTION_INIT,
                local_radio_color: '#222222',
                upload_radio_color: '#333333'
            },
            {
                action: RADIO_ACTION.LOCAL_ACTIVE,
                local_radio_color: '#222222',
                upload_radio_color: '#333333'
            },
            {
                action: RADIO_ACTION.UPLOAD_ACTIVE,
                local_radio_color: '#333333',
                upload_radio_color: '#222222'
            }
        ]
    },
    {
        theme: 'vscode-dark',
        actions: [
            {
                action: RADIO_ACTION.ACTION_INIT,
                local_radio_color: '#E8E8E8',
                upload_radio_color: '#AAAAAA'
            },
            {
                action: RADIO_ACTION.LOCAL_ACTIVE,
                local_radio_color: '#E8E8E8',
                upload_radio_color: '#AAAAAA'
            },
            {
                action: RADIO_ACTION.UPLOAD_ACTIVE,
                local_radio_color: '#AAAAAA',
                upload_radio_color: '#E8E8E8'
            }
        ]
    }
];

const MAX_FILE_SIZE = 500;

type DataSizeUnit = 'Byte' | 'KB' | 'MB' | 'GB';

const DATA_SIZE_UNIT: {
    [unit in DataSizeUnit]: number
} = {
    Byte: 1,
    KB: 1024,
    MB: 1024 * 1024,
    GB: 1024 * 1024 * 1024
};

@Component({
    selector: 'app-analysis-center',
    templateUrl: './analysis-center.component.html',
    styleUrls: ['./analysis-center.component.scss']
})

export class AnalysisCenterComponent implements OnInit, AfterContentInit {

    @ViewChild('maskConfig', { static: false }) maskConfig: { Close: () => void; Open: () => void; };
    @ViewChild('maskDownload', { static: false }) maskDownload: { Close: () => void; Open: () => void; };
    @ViewChild('exitmask', { static: false }) exitMask: { Close: () => void; Open: () => void; };
    @ViewChild('saveasmask', { static: false }) saveasMask: { Close: () => void; Open: () => void; };
    @ViewChild('uploadConfirmTip', { static: false }) uploadConfirmTip: { Close: () => void; Open: () => void; };
    @ViewChild('uploadDepPackageModal', { static: false })
    uploadDepPackageModal: { Close: () => void; Open: () => void; };
    @ViewChild('replaceDepPackageModal', { static: false })
    replaceDepPackageModal: { Close: () => void; Open: () => void; };
    @ViewChild('cancelDepPackageModal', { static: false })
    cancelDepPackageModal: { Close: () => void; Open: () => void; };
    @ViewChild('saveConfirmTip', { static: false }) saveConfirmTip: { Close: () => void; Open: () => void; };
    @ViewChild('aarch64Modal', { static: false }) aarch64Modal: any;
    public srcData: TiTableSrcData;
    private data: Array<TiTableRowData> = [];
    public columns: Array<TiTableColumns> = [];
    public stepsMirror: any = [];
    public stepsMirrorSource: any = [];
    public displayed: Array<TiTableRowData> = []; // 表示表格实际呈现的数据（开发者默认设置为[]即可）
    public currTheme = COLOR_THEME.Dark;
    public i18n: any;
    public fixPath = '/opt/portadv/';
    public userPath = `/opt/portadv/${((self as any).webviewSession || {}).getItem('username')}/packagerebuild/`;
    public userReportPath =
        `/opt/portadv/${((self as any).webviewSession || {}).getItem('username')}/report/packagerebuild/`;
    public userPathData = `/opt/portadv/${this.utilsService.getWebViewSession('username')}/data/`;
    public fileFullPath = '';
    public backworkspace: any = '';
    public isCheck = true;
    public isWebpacking = false;
    public isBlank = false;
    public isBlankData = false;
    public filename: any = '';
    public filenameData: any = '';
    public filenameTip: any = '';
    public filenameTipData: any = '';
    public userchange: any;
    public inputPrompt: string;
    public inputPromptData: string;
    public taskId = '';
    public language = '';
    public info = '';
    public count = 0;
    public barWidth = 0;
    public totalBar = 460;
    public progess = 0; // 目前数据大小
    public totalProgress = 100; // 总的数据大小
    public progessValue: string; // 显示的进度值
    public packResult = ''; // 构建成功之后返回的result结果
    public packageLocation = 'local';
    public isDisplay = 'none';
    public packageBtnDisabledTip = '';
    public packageBtnDisabledTipX86 = '';
    public areaMatchHeight: number;
    public isUploadPack = false;
    public isDeletePack = false;
    public uploadPackFile: any;
    public uploadDataFile: any;
    public exitFileName = '';
    public overrideName = '';
    public suffix = '';
    public suffixData = '';
    public exitFileNameReplace: string;
    public exitFileNameData: string;
    public exitFileNameReplaceData: string;
    public fileNameDelete = '';
    public deleteValue = '';
    public deleteValueData: string;
    public isAdmin: boolean;
    public isX86Evn: boolean;
    public isCancel = false;
    public dangerFlag = false;
    public safeFlag = false;
    isDuplicated = false;
    uploadFilePath: string;
    public confirmName = {
        pack: {
            label: '',
            value: '',
            required: true
        },
        data: {
            label: '',
            value: '',
            required: true
        }
    };
    public validation: TiValidationConfig = {
        type: 'blur',
        errorMessage: {
            regExp: '',
            required: ''
        }
    };
    public validationChange: TiValidationConfig = {
        type: 'change',
        errorMessage: {
            regExp: '',
            required: ''
        }
    };
    public filenameLength: any;
    public filenameLengthForData: any;
    public confirmUploadZip: any;
    isShow = false;
    constructor(
        public i18nService: I18nService,
        private elementRef: ElementRef,
        public myTip: MytipService,
        private route: ActivatedRoute,
        public vscodeService: VscodeService,
        public utilsService: UtilsService,
        private msgService: MessageService,
        private miniModalServe: HyMiniModalService,
        private changeDetectorRef: ChangeDetectorRef,
        private uploadService: UploadService,
    ) {
        this.i18n = this.i18nService.I18n();
    }
    public inputItems = {
        path: {
            label: '',
            rules: '',
            value: '', // todo 默认为当前用户名
            required: true
        },
        tool: {
            label: '',
            selected: {
                label: '',
                id: ''
            },
            required: false
        },
        command: {
            label: 'make',
            value: 'make',
            required: true
        },
        linuxOS: {
            label: '',
            selected: {
                label: '',
                id: ''
            },
            required: false
        },
        version: {
            label: '',
            selected: {
                label: '',
                type: '',
                version: '',
                id: ''
            },
            required: false
        },
        kernelVersion: {
            label: '',
            selected: {
                label: '',
                id: ''
            },
            required: false
        }
    };
    public isAlermOpt = false; // 告警时禁止操作
    public sampleBtnTip = '';
    public outfilepath: any;
    public isCompress = false;
    public successTit: any;
    isUploadSuccess = false;

    public displayAreaMatch = false;
    public displayAreaMatchData = false;
    public multipleInput = false;
    public multipleInputData = true;

    public pathlist: any[] = [];
    public pathlistData: any[] = [];

    public dangerousMessage = '';
    public isDangerous = false;
    public intelliJFlagDef = false;
    public fileInfo = {
        filename: '',
        filesize: '',
        filePath: ''
    };

    public curPackStep = 1;

    public uploadFileChoice: any;
    public depPackageUploadStatus: 'preUpload' | 'uploading' | 'postUpload' = 'preUpload';
    public srcDepPackageData: TiTableSrcData = {
        data: [],
        state: {
            searched: false,
            sorted: false,
            paginated: false
        }
    };
    public displayedDepPackage: Array<TiTableRowData> = [];
    public columnsDepPackage: Array<TiTableColumns> = [];
    public replaceDepPackageTip = '';
    private replaceDepPackageRow: TiTableRowData;
    public showUploadDepPackageProgress = false;
    public uploadingDepPackageName = '';
    private currDepPackageUploadId = 0;
    public showDepPackageModalLoading = false;
    public file: any;  // 上传的文件
    private currEnvAppName: string;
    public pluginUrlCfg: any = {
    };
    public currLang: string;
    public copySuccess: string;

    ngOnInit() {
        this.currLang = ((self as any).webviewSession || {}).getItem('language');
        this.filenameLength = new FormControl('',
          [CustomValidators.filenameLength(this.i18n), CustomValidators.filenameCheck(this.i18n)]);
        this.filenameLengthForData = new FormControl('',
          [CustomValidators.filenameLength(this.i18n), CustomValidators.filenameCheck(this.i18n)]);
        this.fileFullPath = this.userPath;
        this.copySuccess = this.i18n.common_term_report_detail.copySuccess;
        // 获取全局url配置数据
        this.vscodeService.postMessage({ cmd: 'readUrlConfig' }, (resp: any) => {
            this.urlInfo(resp);
        });
        // 接收结束软件包重构任务的消息
        this.msgService.getMessage().subscribe(msg => {
            if (msg.value && msg.type === 'isSoftwarePackageChange') {
                this.initParam();
            }
        });

        /**
         * 接收报告数量告警消息
         */
        this.msgService.getMessage().subscribe(msg => {
            if (msg.value && msg.type === 'isreportChange') {
                this.checkHistoryReport();
            }
        });

        this.checkEnv();
        this.columns = [
            {
                title: this.i18n.plugins_porting_message_analysis_center.software,
                width: '40%'
            },
            {
                title: this.i18n.plugins_porting_message_analysis_center.version,
                width: '15%'
            },
            {
                title: this.i18n.plugins_porting_message_analysis_center.osVersion,
                width: '15%'
            },
            {
                title: this.i18n.plugins_porting_message_analysis_center.imageSource,
                width: '15%'
            },
            {
                title: this.i18n.plugins_porting_message_analysis_center.portGuide,
                width: '15%'
            }
        ];

        this.route.queryParams.subscribe((data) => {
            this.intelliJFlagDef = (data.intelliJFlag) ? true : false;
        });

        if (this.packageLocation === 'local') {
            this.inputPrompt = this.i18n.plugins_porting_store_path_pre_hint;
        } else {
            this.inputPrompt = this.i18n.plugins_porting_upload_path_hint;
        }
        if (((self as any).webviewSession || {}).getItem('isFirst') !== '1') {
            this.utilsService.queryDiskState();
            // 历史报告告警检测
            this.checkHistoryReport();

            const option = {
                url: '/customize/'
            };
            this.vscodeService.get(option, (resp: any) => {
                if (resp.status === SERVICE_STATUS.success) {
                    this.userPath =
                        `${resp.data.customize_path}/portadv/${((self as any).webviewSession || {})
                          .getItem('username')}/packagerebuild/`;
                    this.userPathData = `${resp.data.customize_path}/portadv/${this.utilsService
                      .getWebViewSession('username')}/data/`;
                    if (this.packageLocation === 'local') {
                        this.inputPrompt = this.i18n.plugins_porting_store_path_pre_hint;
                    } else {
                        this.inputPrompt = this.i18n.plugins_porting_upload_path_hint;
                    }
                }
            });
        }
        this.language = ((self as any).webviewSession || {}).getItem('language');
        this.setRadioColor(RADIO_ACTION.ACTION_INIT);

        this.inputPromptData = this.i18n.plugins_porting_analysis_resource_label;
        this.userchange = this.i18nService
          .I18nReplace(this.i18n.plugins_porting_analysis_save_Tip, { 0: this.userReportPath });

        if (document.body.className.indexOf('vscode-light') > -1) {
            this.currTheme = COLOR_THEME.Light;
        }

        this.vscodeService.regVscodeMsgHandler('colorTheme', (msg: any) => {
            this.currTheme = msg.colorTheme;
            if (this.packageLocation === 'local') {
                this.setRadioColor(RADIO_ACTION.LOCAL_ACTIVE);
            } else {
                this.setRadioColor(RADIO_ACTION.UPLOAD_ACTIVE);
            }
            this.changeDetectorRef.markForCheck();
            this.changeDetectorRef.detectChanges();
        });
        this.isAdmin = ((self as any).webviewSession || {}).getItem('role') === 'Admin';
        this.confirmUploadZip = new FormControl('', [CustomValidators.confirmNewName(this.i18n)]);
        const params = {
            cmd: 'getGlobleState',
            data: {
                data: {
                    keys: ['anyCtaskId']
                }
            }
        };
        this.vscodeService.postMessage(params, (data: any) => {
            if (!data.anyCtaskId) {
                this.getAutopackTask();
            }
        });

        this.columnsDepPackage = [
            {
                title: this.i18n.common_term_filename,
                prop: 'fileName',
                width: '40%',
                canSort: true
            },
            {
                title: this.i18n.common_term_size,
                prop: 'fileSize',
                width: '30%',
                canSort: true
            },
            {
                show: false,
                title: this.i18n.common_term_status,
                prop: 'uploadStatus',
                width: '20%',
                canSort: true
            },
            {
                show: false,
                title: this.i18n.common_term_detail,
                prop: 'detail',
                width: '30%'
            },
            {
                title: this.i18n.common_term_operate,
                prop: 'operation',
                width: '30%'
            }
        ];

        this.vscodeService.postMessage({ cmd: 'getCurrentAppName' }, (appName: string) => {
            this.currEnvAppName = appName;
        });
    }
    private getAutopackTask() {
        const url = `/task/progress/?task_type=1`;
        this.vscodeService.get({ url }, (data: any) => {
            if (data.status === STATUS.SUCCESS) {
                if (data.data && data.data.task_name) {
                    this.taskId = data.data.task_name;
                    this.setAnyCtaskId();
                    this.isWebpacking = true;
                    this.getStatus();
                }
            }
        });
    }

    /**
     * 环境监测
     */
    checkEnv() {
        this.vscodeService.get({ url: '/portadv/tasks/platform/' }, (data: any) => {
            this.isX86Evn = (data.status === 0);
            if (this.isX86Evn) {
                this.packageBtnDisabledTipX86 = this.i18n.plugins_common_tips_rebuildPlatForm_X86;
                this.showInfoBox(this.packageBtnDisabledTipX86, 'info');
            }
        });
    }

    ngAfterContentInit(): void {
        setTimeout(() => {
            const mathDiv = this.elementRef.nativeElement.querySelector('.areaMatch');
            if (mathDiv) {
                this.areaMatchHeight = mathDiv.offsetHeight;
            }
        }, 0);
    }
    chooseLangType(data: any) {
        let info = '';
        if (((self as any).webviewSession || {}).getItem('language') === 'zh-cn') {
            info = data.infochinese;
        } else {
            info = data.info;
        }
        return info;
    }
    urlInfo(data: any) {
        this.pluginUrlCfg = data;
        this.stepsMirror = [
            {
                step: this.i18n.plugins_porting_message_analysis_center.stepOne,
                desMore: this.i18n.plugins_porting_message_analysis_center.stepOneMore,
                desMoreExtra: ''
            },
            {
                step: this.i18n.plugins_porting_message_analysis_center.stepTwo,
                desMore: this.i18n.plugins_porting_message_analysis_center.stepTwoMore,
                desMoreExtra: this.i18nService
                  .I18nReplace(this.i18n.plugins_porting_message_analysis_center.stepTwoMoreExtra, {
                    0: this.pluginUrlCfg.yumElAarch64,
                    1: this.pluginUrlCfg.yumElBigdataHDP,
                    2: this.pluginUrlCfg.yumElBigdataHDPGPL,
                    3: this.pluginUrlCfg.yumElBigdataHDPUTILS,
                    4: this.pluginUrlCfg.yumElBigdataAmbari
                })
            },
            {
                step: this.i18n.plugins_porting_message_analysis_center.stepThree,
                desMore: this.i18n.plugins_porting_message_analysis_center.stepThreeMore,
                desMoreExtra: this.i18n.plugins_porting_message_analysis_center.stepThreeMoreExtra
            },
        ];
        this.stepsMirrorSource = [
            {
                name: this.i18n.plugins_porting_message_analysis_center.stepsMirrorSource.packagesName,
                url: this.pluginUrlCfg.rebuildPackages,
            },
            {
                name: this.i18n.plugins_porting_message_analysis_center.stepsMirrorSource.bigdataName,
                url: this.pluginUrlCfg.rebuildBigdata,
            },
            {
                name: this.i18n.plugins_porting_message_analysis_center.stepsMirrorSource.webName,
                url: this.pluginUrlCfg.rebuildWeb,
            },
            {
                name: this.i18n.plugins_porting_message_analysis_center.stepsMirrorSource.cephName,
                url: this.pluginUrlCfg.rebuildCeph,
            },
            {
                name: this.i18n.plugins_porting_message_analysis_center.stepsMirrorSource.dataBaseName,
                url: this.pluginUrlCfg.rebuildDatabase,
            },
            {
                name: this.i18n.plugins_porting_message_analysis_center.stepsMirrorSource.cloudName,
                url: this.pluginUrlCfg.rebuildCloud,
            },
            {
                name: this.i18n.plugins_porting_message_analysis_center.stepsMirrorSource.nativeName,
                url: this.pluginUrlCfg.rebuildNative,
            }
        ];
    }

    public async getStatus() {
        // 历史报告数量告警检测
        await this.checkHistoryReport();
        if (this.dangerFlag) {
            return;
        }
        let statusUrl = '';
        if (this.taskId) {
            statusUrl = '/task/progress/?task_type=1&task_id=' + encodeURIComponent(this.taskId);
        } else {
            statusUrl = '/task/progress/?task_type=1';
        }

        let fileName = FILE_TYPE.RPM;
        if (((self as any).webviewSession || {}).getItem('filename') === FILE_TYPE.DEB) {
            fileName = FILE_TYPE.DEB;
        }

        const message = {
            cmd: 'analysisProcess',
            data: {
                title: this.i18n.plugins_porting_analysis_center_title,
                url: statusUrl,
                method: 'GET',
                folderName: fileName,
                userPath: this.userPath,
                msgID: MESSAGE_MAP.SHOW_PROGRESS,
                taskID: encodeURIComponent(this.taskId),
                packageName: this.filename  // 软件包名
            }
        };
        this.vscodeService.postMessage(message, (resp: any) => {
            this.packageBtnDisabledTip = '';
            this.initParam();
        });
    }

    /**
     * 选择文件上传方式
     * @param model 事件
     */
    public onLocationChange(model: boolean): void {
        if (this.packageLocation === 'local') {
            this.isDisplay = 'none';
            this.inputPrompt = this.i18n.plugins_porting_store_path_pre_hint;
            this.filename = '';
            this.isBlank = false;
            this.setRadioColor(RADIO_ACTION.LOCAL_ACTIVE);
        } else {
            this.isDisplay = 'block';
            this.inputPrompt = this.i18n.plugins_porting_upload_path_hint;
            this.filename = '';
            this.isBlank = false;
            this.setRadioColor(RADIO_ACTION.UPLOAD_ACTIVE);
        }
    }

    keyupAreaMatch() {
        this.inputAreaMatch();
    }
    keyupAreaMatchData() {
        this.inputAreaMatchData();
    }

    inputAreaMatch() {
        let path = this.filename;
        const lastIndex = this.filename.lastIndexOf(',');
        if (lastIndex) {
            path = this.filename.slice(lastIndex + 1, this.filename.length);
        }
        const params = { path: 'packagerebuild/' + path };
        const option = {
            url: '/pathmatch/',
            params
        };
        this.vscodeService.post(option, (data: any) => {
            if (data) {
                this.pathlist = data.pathlist;
            }
            if (this.intelliJFlagDef) {
                this.changeDetectorRef.markForCheck();
                this.changeDetectorRef.detectChanges();
            }
        });
    }
    inputAreaMatchData() {
        let path = this.filenameData;
        const lastIndex = this.filenameData.lastIndexOf(',');
        if (lastIndex) {
            path = this.filenameData.slice(lastIndex + 1, this.filenameData.length);
        }
        const params = { path };
        const option = {
            url: '/datamatch/',
            params
        };
        this.vscodeService.post(option, (data: any) => {
            if (data) {
                const arrBefore = this.filenameData.split(',');
                const arrAfter = data.pathlist;
                arrBefore.forEach((before: any) => {
                    arrAfter.forEach((after: any, j: number) => {
                        if (after === before) {
                            arrAfter.splice(j, 1);
                            j -= 1;
                        }
                    });
                });
                this.pathlistData = arrAfter;
                if (this.intelliJFlagDef) {
                    this.changeDetectorRef.markForCheck();
                    this.changeDetectorRef.detectChanges();
                }
            }
        });
    }
    public async clearSort() {
        if (this.intelliJFlagDef) {
            let i = 0;
            while (i < 10) {
                this.changeDetectorRef.markForCheck();
                this.changeDetectorRef.detectChanges();
                await this.sleep(30);
                i++;
            }
        }
    }
    /**
     * 等待指定的时间
     * @param ms 等待时间
     */
    private async sleep(ms: number) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve('');
            }, ms);
        });
    }
    public getCheck() {
        this.isBlank = false;
        this.displayAreaMatch = true;
        this.inputAreaMatch();
    }

    clickAreaMatch(value: any) {
        const lastIndex = this.filename.lastIndexOf(',');
        if (!this.multipleInput) {
            this.filename = value;
        } else {
            if (lastIndex) {
                this.filename = this.filename.slice(0, lastIndex + 1) + value + ',';
            } else {
                this.filename = value + ',';
            }
        }
        this.displayAreaMatch = false;
        this.pathlist = [];
        if (this.intelliJFlagDef) {
            this.changeDetectorRef.markForCheck();
            this.changeDetectorRef.detectChanges();
        }
    }

    clickAreaMatchData(value: any) {
        const lastIndex = this.filenameData.lastIndexOf(',');
        if (!this.multipleInputData) {
            this.filenameData = value;
        } else {
            if (lastIndex) {
                this.filenameData = this.filenameData.slice(0, lastIndex + 1) + value + ',';
            } else {
                this.filenameData = value + ',';
            }
        }
        this.displayAreaMatchData = false;
        this.pathlistData = [];
        if (this.intelliJFlagDef) {
            this.changeDetectorRef.markForCheck();
            this.changeDetectorRef.detectChanges();
        }
    }

    public isRight() {
        this.displayAreaMatch = false;
        if (this.filename) {
            this.isBlank = false;
            this.filename = this.filename.replace(/(^\s*)|(\s*$)/g, '').replace(/[\r\n]/g, '');
            if (this.filename.endsWith('.rpm') || this.filename.endsWith('.deb')) {
                this.isBlank = false;
                this.filenameTip = this.i18n.common_term_filename_tip;
            } else {
                this.isBlank = true;
                this.filenameTip = this.i18n.common_term_filename_tip2;
            }
        }
    }

    public getCheckData() {
        this.isBlankData = false;
        this.displayAreaMatchData = true;
        this.dangerousMessage = '';
        this.isDangerous = false;
        this.inputAreaMatchData();
    }
    public isRightData() {
        this.displayAreaMatchData = false;
        if (this.filenameData) {
            this.filenameData = this.filenameData.replace(/(^\s*)|(\s*$)/g, '').replace(/[\r\n]/g, '');
        }
    }

    /**
     * 上一步按钮点击响应
     */
    public previous() {
        this.curPackStep--;
        this.fileFullPath = this.userPath;
    }

    /**
     * 下一步按钮点击响应
     */
    public next() {
        if (this.curPackStep === 1) {
          if (!this.filenameLength.valid) { return; }
        }
        if (this.curPackStep === 2) {
          if (!this.filenameLengthForData.valid) { return; }
        }
        const filename = this.getPackFileName();
        if (filename) {
            this.fileFullPath = this.userPath + filename;
            this.isBlank = false;
            if (!(filename.endsWith('.rpm') || filename.endsWith('.deb'))) {
                this.isBlank = true;
                this.filenameTip = this.i18n.common_term_filename_tip2;
            }
        } else {
            this.isBlank = true;
            this.filenameTip = this.i18n.common_term_filename_tip;
        }
        ((self as any).webviewSession || {}).setItem('filename', this.filename.substr(-3));

        if (this.isBlank) {
            return;
        }

        this.curPackStep++;
        if (this.curPackStep > 3) {
            this.pack(0);
        }
    }
    private setAnyCtaskId() {
        const params = {
            cmd: 'setGlobleState',
            data: {
                data: {
                    list: [
                        { key: 'anyCtaskId', value: this.taskId },
                    ]
                }
            }
        };
        this.vscodeService.postMessage(params, null);
        this.packageBtnDisabledTip = this.i18n.common_term_creating_btn_disabled_tip;
    }
    public pack(flagPack: number) {
        this.isWebpacking = true;
        const param = {
            filepath: `${this.userPath}${this.getPackFileName()}`,
            flag: flagPack,
            is_download: this.isCheck
        };
        const option = {
            url: '/portadv/autopack/start/',
            params: param
        };
        this.vscodeService.post(option, (data: any) => {
            if (data.status === STATUS.SUCCESS) {
                this.count = 0;
                this.taskId = data.data.task_id;
                this.setAnyCtaskId();
                this.getStatus();
                this.maskConfig.Close();
                this.maskDownload.Close();
            } else if (data.realStatus === STATUS.INSUFFICIENT_SPACE) {
                this.isWebpacking = false;
                this.utilsService.sendDiskAlertMessage();
                setTimeout(() => {
                    this.curPackStep = 3;
                    if (this.intelliJFlagDef) {
                        this.changeDetectorRef.markForCheck();
                        this.changeDetectorRef.detectChanges();
                    }
                }, 1000);
            } else if (data.realStatus === STATUS.CONFIG_MIRROR) {
                // 上传的RPM包在鲲鹏镜像站已存在(centos7.6)，可通过配置鲲鹏镜像源进行重构
                this.maskConfig.Open();
            } else if (data.realStatus === STATUS.DOWNLOAD_RPM) {
                // 上传的RPM包在鲲鹏镜像站已存在(非centos7.6)，请按对应的版本下载RPM包使用或查看移植指导
                for (const key in data.data) {
                    if (data.data.hasOwnProperty(key)) {
                        const item = data.data[key];
                        this.data = [
                            {
                                resourcename: key,
                                rpm_version: item.rpm_version,
                                os_name: item.os_name,
                                rpm_url: item.rpm_url,
                                doc_url: item.doc_url,
                            }
                        ];
                    }
                }
                this.srcData = {
                    data: this.data,
                    state: {
                        searched: false,
                        sorted: false,
                        paginated: false
                    }
                };
                this.displayed = this.srcData.data;
                this.maskDownload.Open();
            } else if (data.realStatus === STATUS.OSNotSupport && !this.intelliJFlagDef) {
              const message = {
                cmd: 'osNotSupport',
                  data: {
                    res: data,
                  }
                };
              this.vscodeService.postMessage(message, null);
              this.initParam();
            } else {
                this.info = this.chooseLangType(data);
                const message = {
                    cmd: 'analysisProcess',
                    data: {
                        title: this.i18n.plugins_porting_analysis_center_title,
                        msgID: MESSAGE_MAP.PROCESS_FAILED,
                        infochinese: data.infochinese,
                        info: data.info
                    }
                };
                this.vscodeService.postMessage(message, null);
                this.maskConfig.Close();
                this.maskDownload.Close();
                this.initParam();
            }
            if (this.intelliJFlagDef) {
                this.changeDetectorRef.markForCheck();
                this.changeDetectorRef.detectChanges();
            }
        });
    }

    private initParam() {
        this.curPackStep = 1;
        this.filename = '';
        this.filenameData = '';
        this.isWebpacking = false;
    }

    private getPackFileName() {
        if (!this.filename) {
            return '';
        }
        let fileName = this.filename.replace(/(^\s*)|(\s*$)/g, '').replace(/[\r\n]/g, '');
        if (fileName.startsWith('/')) {
            fileName = fileName.slice(1);
        }

        return fileName;
    }

    zipUpload() {
        if (this.intelliJFlagDef) {
            this.uploadFileChoice = 'normal';
            this.intellijUpload('normal', 'true');
        } else {
            if (this.currEnvAppName === 'CloudIDE') {
                this.vscodeService.postMessage({ cmd: 'cloudIDEupload' }, (fileProps: Array<any>) => {
                    this.uploadFilePack('normal', fileProps);
                });
            } else {
                this.elementRef.nativeElement.querySelector('#zipload').value = '';
                this.elementRef.nativeElement.querySelector('#zipload').click();
            }
        }
    }
    /**
     * 下载缺失包
     * @param url 路径
     */
    downloadSoFile(url: string) {
        // intellij走该逻辑
        if (this.intelliJFlagDef) {
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
    filesUpload() {
        this.uploadDepPackageModal.Open();
    }

    public dropHandler(event: any) {
        event.preventDefault();
        const fileList: Array<any> = [];
        if (!this.intelliJFlagDef) {
            if (event.dataTransfer.items) {
                for (const file of event.dataTransfer.items) {
                    if (file.kind === 'file') {
                        fileList.push(file.getAsFile());
                    }
                }
            }
            if (this.currEnvAppName !== 'CloudIDE') {
                this.checkUploadDepPackage(fileList);
            }
        }
    }

    public dragOverHandler(event: Event) {
        event.preventDefault();
    }

    public dropAreaBtnHandler(event: any) {
        if (this.intelliJFlagDef) {
            event.preventDefault();
            this.intellijfilesUpload('nomal');
        } else {
            if (this.currEnvAppName === 'CloudIDE') {
                event.preventDefault();
                this.vscodeService.postMessage({ cmd: 'cloudIDEupload' }, (fileProps: Array<any>) => {
                    this.checkUploadDepPackage(fileProps);
                });
            } else {
                if (event.type === 'click') { return; }
                this.checkUploadDepPackage(event.target.files);
            }
        }
    }

    private checkUploadDepPackage(fileList: Array<any>) {
        if (this.depPackageUploadStatus !== 'preUpload') { return; }
        if (fileList.length === 0) { return; }
        const fileNameMap: any = {};
        const fileNames = [];
        const fileSizes = [];
        for (const file of fileList) {
            fileNames.push(file.name);
            fileSizes.push(file.size);
            // 删除重名文件
            const oldIndex = this.srcDepPackageData.data.findIndex(item => (item.fileName === file.name));
            if (oldIndex > -1) {
                this.srcDepPackageData.data.splice(oldIndex, 1);
            }
            // 添加文件属性映射
            fileNameMap[file.name] = {
                fileName: file.name,
                fileSize: file.size,
                fileSizeFormatted: this.formatterDataSizeUnit(file.size),
                filePath: file.path
            };
        }
        this.postCheckUploadDepPackage({
            choice: 'normal',
            scan_type: '4',
            file_name: fileNames,
            file_size: fileSizes
        }).then((resp: any) => {
            if (resp && resp.status === 0) {
                resp.data.success_file.forEach((fileName: string) => {
                    fileNameMap[fileName].canUpload = true;
                    fileNameMap[fileName].detail = '';
                    this.srcDepPackageData.data = this.srcDepPackageData.data.concat(fileNameMap[fileName]);
                });
                if (this.intelliJFlagDef) {
                    this.displayedDepPackage = this.srcDepPackageData.data;
                    this.changeDetectorRef.markForCheck();
                    this.changeDetectorRef.detectChanges();
                }
            } else {
                if (resp.data.fail_file){
                    resp.data.fail_file.forEach((failedResult: Array<string>) => {
                        const fileName = failedResult[0];
                        fileNameMap[fileName].canUpload = false;
                        if (failedResult[1] === 'File already exist') {
                            fileNameMap[fileName].canReplace = true;
                        }
                        fileNameMap[fileName].detail = this.language === 'zh-cn' ? failedResult[2] : failedResult[1];
                        this.srcDepPackageData.data = this.srcDepPackageData.data.concat(fileNameMap[fileName]);
                    });
                } else {
                    const info = this.language === LanguageType.ZH_CN ? resp.infochinese : resp.info;
                    this.showInfoBox(info, 'error');
                }
            }
        });
    }

    private postCheckUploadDepPackage(params: any) {
        return new Promise((resolve) => {
            this.showDepPackageModalLoading = true;
            const option = { url: '/portadv/autopack/check_upload/', params };
            this.vscodeService.post(option, (resp: any) => {
                this.showDepPackageModalLoading = false;
                resolve(resp);
            });
        });
    }

    /**
     * 格式化数据大小单位，最大GiB
     *
     * @param bytesize 数据字节大小
     */
    private formatterDataSizeUnit(bytesize: number) {
        if (bytesize < DATA_SIZE_UNIT.KB) {
            return 0 + ' KB';
        } else if (bytesize < DATA_SIZE_UNIT.MB) {
            return Math.round(bytesize / DATA_SIZE_UNIT.KB) + ' KB';
        } else if (bytesize < DATA_SIZE_UNIT.GB) {
            return Math.round(bytesize / DATA_SIZE_UNIT.MB) + ' MB';
        } else {
            return Math.round(bytesize / DATA_SIZE_UNIT.GB) + ' GB';
        }
    }

    public uploadDepPackageTrackFn(index: any, row: any) {
        return row.fileName;
    }

    public getCanUploadDepPackageNum() {
        return this.srcDepPackageData.data.length;
    }

    public sucessUploadDepPackageNum() {
        return this.srcDepPackageData.data.filter(row => (row.canUpload || row.canReplace)).length;
    }

    public getCanUploadDepPackageTotalSize() {
        return this.getDepPackageTotalSizeByFilter(row => (row.canUpload || row.canReplace));
    }

    public getUploadedDepPackageNum() {
        return this.srcDepPackageData.data.filter(row => (row.uploaded)).length;
    }

    public getUploadedDepPackageTotalSize() {
        return this.getDepPackageTotalSizeByFilter(row => (row.uploaded));
    }

    public getDepPackageTotalSizeByFilter(filter: (value: TiTableRowData,
                                                   index: number,
                                                   array: TiTableRowData[]) => unknown) {
        const totalByteSize = this.srcDepPackageData.data
            .filter(filter)
            .map(row => (row.fileSizeFormatted))
            .reduce((item1, item2) => {
                const item2SizeNumber = Number(item2.split(' ')[0]);
                const item2SizeUnit: DataSizeUnit = item2.split(' ')[1];
                const item2ByteSize = item2SizeNumber * DATA_SIZE_UNIT[item2SizeUnit];
                return item1 + item2ByteSize;
            }, 0);
        return this.formatterDataSizeUnit(totalByteSize);
    }

    public startUploadDepPackage() {
        // 将整体上传状态更新为uploading
        this.depPackageUploadStatus = 'uploading';
        // 更新表格列头宽度
        this.columnsDepPackage[0].width = '21%';
        this.columnsDepPackage[1].width = '14%';
        this.columnsDepPackage[2].width = '22%';
        this.columnsDepPackage[3].width = '26%';
        this.columnsDepPackage[4].width = '17%';

        // 显示上传状态列
        this.columnsDepPackage[2].show = true;
        this.columnsDepPackage[3].show = true;
        if (this.intelliJFlagDef) {
            this.changeDetectorRef.markForCheck();
            this.changeDetectorRef.detectChanges();
        }

        for (const row of this.srcDepPackageData.data) {
            // 将不可上传和可替换的行标为上传失败
            if (!row.canUpload || row.canReplace) {
              row.uploaded = false;
              row.uploadStatus = this.i18n.common_term_upload_fail;
            }
        }
        if (this.intelliJFlagDef && this.srcDepPackageData.data.filter(row => (row.canUpload)).length === 0) {
            this.depPackageUploadStatus = 'postUpload';
            this.showUploadDepPackageProgress = false;
            this.changeDetectorRef.markForCheck();
            this.changeDetectorRef.detectChanges();
        } else {
            // 上传可以上传的文件
            setTimeout(() => {
                this.postUploadDepPackage(this.displayedDepPackage.filter(row => (row.canUpload)));
            }, 0);
        }
    }

    private async postUploadDepPackage(rowArray: Array<TiTableRowData>, isReplace?: boolean) {
        if (this.intelliJFlagDef) {
            for (const row of rowArray) {
                if (this.isCancel) { break; }
                await new Promise((resolve) => {
                    this.uploadingDepPackageName = row.fileName;
                    this.currDepPackageUploadId = new Date().getTime() + Math.round(Math.random() * 1000);
                    this.showUpload();
                    const option = {
                        cmd: 'uploadMultipleFiles',
                        data: {
                            scan_type: '4',
                            need_unzip: 'false',
                            title: this.i18n.plugins_porting_analysis_center_title,
                            not_chmod: 'false',
                            uploadFilePath: [row.filePath],
                            saveFileName: this.exitFileName + this.suffix,
                            AllMatch: ''
                        }
                    };
                    this.vscodeService.postMessage(option, (resp: any) => {
                        if (resp.status === 0) {
                            row.uploaded = true;
                            row.uploadStatus = this.i18n.common_term_upload_success;
                            row.canReplace = false;
                            if (isReplace) {
                                row.detail = this.i18n.plugins_porting_software_relay_file.replaceMsg;
                            }
                            // 更新输入框
                            const selectedFileArray = this.filenameData.split(',')
                              .filter((item: string) => (item.trim() !== ''));
                            if (!selectedFileArray.includes(row.fileName)) {
                                selectedFileArray.push(row.fileName);
                            }
                            if (selectedFileArray.length > 0) {
                                this.filenameData = selectedFileArray.join(',') + ',';
                            }
                        } else {
                            row.uploaded = false;
                            row.uploadStatus = this.i18n.common_term_upload_fail;
                            if (resp.data && resp.data.fail_file) {
                                const failedResult = resp.data.fail_file[0];
                                row.detail = this.language === 'zh-cn' ? failedResult[2] : failedResult[1];
                            }
                            row.canReplace = false;
                        }
                        resolve('');
                        this.changeDetectorRef.markForCheck();
                        this.changeDetectorRef.detectChanges();
                    });
                });

            }
            this.depPackageUploadStatus = 'postUpload';
            this.showUploadDepPackageProgress = false;
            this.changeDetectorRef.markForCheck();
            this.changeDetectorRef.detectChanges();
        } else {
            let isCancelUploadDepPackage = false;
            this.showUploadDepPackageProgress = true;
            for (const row of rowArray) {
                if (isCancelUploadDepPackage) { break; }
                await new Promise((resolve) => {
                    this.uploadingDepPackageName = row.fileName;
                    this.currDepPackageUploadId = new Date().getTime() + Math.round(Math.random() * 1000);
                    const option: any = {
                        url: '/portadv/autopack/data/',
                        params: {
                            filePathList: [row.filePath]
                        },
                        formData: true,
                        timeout: 300 * 1000,
                        cancelId: this.currDepPackageUploadId
                    };
                    if (isReplace) {
                        option.headers = { choice: 'override' };
                    } else {
                      option.headers = { choice: 'normal' };
                    }
                    this.vscodeService.post(option, (resp: any) => {
                        if (resp.cancel) {
                            isCancelUploadDepPackage = true;
                            resolve('');
                            return;
                        }
                        if (resp.status === 0) {
                            row.uploaded = true;
                            row.uploadStatus = this.i18n.common_term_upload_success;
                            row.canReplace = false;
                            if (isReplace) {
                                row.detail = this.i18n.plugins_porting_software_relay_file.replaceMsg;
                            }
                            // 更新输入框
                            const selectedFileArray = this.filenameData.split(',')
                              .filter((item: string) => (item.trim() !== ''));
                            if (!selectedFileArray.includes(row.fileName)) {
                                selectedFileArray.push(row.fileName);
                            }
                            if (selectedFileArray.length > 0) {
                                this.filenameData = selectedFileArray.join(',') + ',';
                            }
                        } else if (resp.realStatus === STATUS.MAXIMUM_TASK) { // 等待上传中
                            row.uploaded = false;
                            const message = ((self as any).webviewSession || {}).getItem('language') === 'zh-cn'
                                ? resp.infochinese
                                : resp.info;
                            this.showInfoBox(message, 'error');
                        } else {
                            row.uploaded = false;
                            row.uploadStatus = this.i18n.common_term_upload_fail;
                            if (resp.data && resp.data.fail_file) {
                                const failedResult = resp.data.fail_file[0];
                                row.detail = this.language === 'zh-cn' ? failedResult[2] : failedResult[1];
                            }
                            row.canReplace = false;
                        }
                        resolve('');
                    });
                });
            }
            // 全部上传任务完成的情况下
            if (!isCancelUploadDepPackage) {
                this.depPackageUploadStatus = 'postUpload';
                this.showUploadDepPackageProgress = false;
            }
        }
    }

    public showUpload() {
        this.showUploadDepPackageProgress = true;
        if (this.intelliJFlagDef) {
            this.changeDetectorRef.markForCheck();
            this.changeDetectorRef.detectChanges();
        }
    }
    public cancelUploadDepPackageHandler() {
        if (this.depPackageUploadStatus === 'uploading') {
            this.cancelDepPackageModal.Open();
        } else {
            this.closeUploadDepPackage();
        }
        if (this.intelliJFlagDef) {
            this.changeDetectorRef.markForCheck();
            this.changeDetectorRef.detectChanges();
        }
    }

    public cancelUploadDepPackage() {
        this.isCancel = true;
        if (this.depPackageUploadStatus === 'uploading') {
            this.vscodeService.postMessage({
                cmd: 'cancelRequest',
                data: { cancelId: this.currDepPackageUploadId }
            }, null);
        }
        this.cancelDepPackageModal.Close();
        this.closeUploadDepPackage();
    }

    public closeUploadDepPackage() {
        this.uploadDepPackageModal.Close();
        this.showUploadDepPackageProgress = false;
        this.srcDepPackageData.data = [];
        this.depPackageUploadStatus = 'preUpload';
        this.columnsDepPackage[0].width = '40%';
        this.columnsDepPackage[1].width = '30%';
        this.columnsDepPackage[4].width = '30%';
        this.columnsDepPackage[2].show = false;
        this.columnsDepPackage[3].show = false;
        if (this.intelliJFlagDef) {
            this.changeDetectorRef.markForCheck();
            this.changeDetectorRef.detectChanges();
        }
    }

    public deleteSrcDepPackageDataRow(fileName: string) {
        const index = this.srcDepPackageData.data.findIndex((item: any) => (item.fileName === fileName));
        this.srcDepPackageData.data.splice(index, 1);
        this.displayedDepPackage = this.srcDepPackageData.data;
        if (this.intelliJFlagDef) {
            this.changeDetectorRef.markForCheck();
            this.changeDetectorRef.detectChanges();
        }
    }

    public showReplaceDepPackageModal(row: any) {
        this.replaceDepPackageTip = this.i18nService
          .I18nReplace(this.i18n.plugins_porting_software_relay_file.content, {
            0: row.fileName
        });
        this.replaceDepPackageRow = row;
        this.replaceDepPackageModal.Open();
        if (this.intelliJFlagDef) {
            this.changeDetectorRef.markForCheck();
            this.changeDetectorRef.detectChanges();
        }
    }

    public replaceDepPackage() {
        this.replaceDepPackageRow.uploadStatus = '';
        this.replaceDepPackageRow.detail = '';
        this.replaceDepPackageModal.Close();
        this.postCheckUploadDepPackage({
            choice: 'override',
            scan_type: '4',
            file_name: [this.replaceDepPackageRow.fileName],
            file_size: [this.replaceDepPackageRow.fileSize]
        }).then(() => {
            this.replaceDepPackageRow.canUpload = true;
            this.postUploadDepPackage([this.replaceDepPackageRow], true);
        });
    }

    public retryUploadDepPackage(row: any) {
        this.postUploadDepPackage([row]);
    }

    public intellijfilesUpload(choice: string) {
        const uploadMsg = {
            cmd: 'intellijDepPackage',
            data: {
                title: this.i18n.plugins_porting_analysis_center_title,
                choice,
                not_chmod: 'false',
                validFile: '',
                isDuplicated: this.isDuplicated.toString(),
                AllMatch: ''
            }
        };
        this.isUploadPack = false;
        this.isDuplicated = false;
        this.vscodeService.postMessage(uploadMsg, (data: any) => {
            this.checkUploadDepPackage(data);
        });
    }
    /**
     * intellij上传文件
     * @param choice 类型
     */
    private checkIntellijFileUpload(choice: string) {
        this.exitMask.Close();
        this.isUploadSuccess = false;
        this.isShow = false;
        const uploadMsg = {
            cmd: 'uploadFileIntellij',
            data: {
                scan_type: '4',
                need_unzip: 'false',
                title: this.i18n.plugins_porting_analysis_center_title,
                choice,
                not_chmod: 'false',
                uploadFilePath: this.uploadFilePath,
                saveFileName: this.exitFileName + this.suffix,
                AllMatch: ''
            }
        };
        this.vscodeService.postMessage(uploadMsg, (resp: any) => {
            this.isDuplicated = false;
            this.suffixData = '';
            this.exitFileNameData = '';
            this.exitMask.Close();
            if (resp.status === STATUS.SUCCESS) {
                let num = resp.data.lastIndexOf('.');
                let filename = resp.data.substring(0, num);
                if (filename.lastIndexOf('.tar') > 0) {
                    num = filename.lastIndexOf('.');
                    filename = filename.substring(0, num);
                }
                this.inputItems.path.value = filename;
                this.isShow = false;
                this.isUploadSuccess = true;
                if (this.filenameData) {
                    this.filenameData = (this.filenameData.indexOf(resp.data + ',') === -1)
                        ? (this.filenameData + resp.data + ',') : this.filenameData;
                } else {
                    this.filenameData = resp.data + ',';
                }
            } else if (resp.realStatus === STATUS.INSUFFICIENT_SPACE) {
                this.utilsService.sendDiskAlertMessage();
            } else if (resp === 'timeout') {
                this.showInfoBox(this.i18n.common_term_report_500, 'warn');
                return;
            } else {
                this.isShow = false;
            }
            this.changeDetectorRef.markForCheck();
            this.changeDetectorRef.detectChanges();
        });

    }

    public confirmUploadMsgTip() {
        this.uploadConfirmTip.Close();
        this.intellijUpload(this.uploadFileChoice, 'false');
    }

    public cancelUploadMsgTip() {
        this.uploadConfirmTip.Close();
        this.isShow = false;
        return;
    }

    /**
     * intellij上传配置文件校验
     * @param choice 类型
     */
    private intellijUpload(choice: string, nameFilter: string) {
        this.exitMask.Close();
        this.isUploadPack = true;
        this.isUploadSuccess = false;
        this.isShow = false;
        const uploadMsg = {
            cmd: 'checkUploadFileIntellij',
            data: {
                url: '/portadv/autopack/check_upload/',
                scan_type: '3',
                need_unzip: 'false',
                choice,
                not_chmod: 'false',
                title: this.i18n.plugins_porting_analysis_center_title,
                isDuplicated: this.isDuplicated.toString(),
                uploadFilePath: this.uploadFilePath,
                saveFileName: choice === 'override' ? this.overrideName : (this.exitFileName + this.suffix),
                validFile: 'rpm,deb',
                nameFilter
            }
        };
        this.isDuplicated = false;
        this.isUploadPack = true;
        this.vscodeService.postMessage(uploadMsg, (data: any) => {
            this.uploadFilePath = data.uploadFilePath;
            if (data.isCompatible) {
                this.uploadConfirmTip.Open();
            } else {
                if (data.status === STATUS.SUCCESS) {
                    this.displayAreaMatchData = false;
                    this.isUploadSuccess = true;
                    this.changeDetectorRef.markForCheck();
                    this.changeDetectorRef.detectChanges();
                    if (data.isCompatible) {
                        this.uploadConfirmTip.Open();
                    } else {
                        this.checkIntellijUpload(choice);
                    }
                } else if (data.realStatus === STATUS.INSUFFICIENT_SPACE) {
                    this.utilsService.sendDiskAlertMessage();
                } else {
                    if (data.data.new_name && data.data.suffix) {
                        this.exitFileName = data.data.new_name;
                        this.suffix = data.data.suffix;
                        this.overrideName = data.data.old_name;
                        this.exitFileNameReplace = this.i18nService.I18nReplace(
                            this.i18n.plugins_porting_message_analysis_center.exit.content,
                            { 0: data.data.old_name });
                        this.exitMask.Open();
                        this.isDuplicated = true;
                    } else {
                        this.isDuplicated = false;
                    }
                    this.inputItems.path.value = '';
                }
            }
            this.changeDetectorRef.markForCheck();
            this.changeDetectorRef.detectChanges();
        });

    }

    /**
     * intellij上传配置文件
     * @param choice 类型
     */
    private checkIntellijUpload(choice: string) {
        this.exitMask.Close();
        this.isUploadSuccess = false;
        this.isShow = false;
        const uploadMsg = {
            cmd: 'uploadFileIntellij',
            data: {
                scan_type: '3',
                need_unzip: 'false',
                choice,
                not_chmod: 'false',
                title: this.i18n.plugins_porting_analysis_center_title,
                uploadFilePath: this.uploadFilePath,
                saveFileName: choice === 'override' ? this.overrideName : (this.exitFileName + this.suffix)
            }
        };
        this.vscodeService.postMessage(uploadMsg, async (resp: any) => {
            this.isDuplicated = false;
            this.suffix = '';
            this.exitFileName = '';
            this.fileInfo.filePath = '';
            this.overrideName = '';
            this.exitMask.Close();
            if (resp.status === STATUS.SUCCESS) {
                this.filename = resp.data;
                let num = resp.data.lastIndexOf('.');
                let filename = resp.data.substring(0, num);
                if (filename.lastIndexOf('.tar') > 0) {
                    num = filename.lastIndexOf('.');
                    filename = filename.substring(0, num);
                }
                this.inputItems.path.value = filename;
                // 上传成功时才会预填到文本框
                this.isShow = false;
                this.isUploadSuccess = true;
                if (((self as any).webviewSession || {}).getItem('language') === 'zh-cn') {
                    this.successTit = resp.infochinese;
                } else {
                    this.successTit = resp.info;
                }
                this.elementRef.nativeElement.querySelector('#zipload').value = '';
            } else if (resp.realStatus === STATUS.INSUFFICIENT_SPACE) {
                this.utilsService.sendDiskAlertMessage();
            } else if (resp === 'timeout') {
                this.showInfoBox(this.i18n.common_term_report_500, 'warn');
                return;
            } else {
                this.isShow = false;
            }
            this.changeDetectorRef.markForCheck();
            this.changeDetectorRef.detectChanges();

        });
    }

    // 上传软件包
    uploadFilePack(choice: string, fileProps?: Array<any>) {
        this.exitMask.Close();
        this.isUploadPack = true;
        this.isUploadSuccess = false;
        this.isShow = false;
        let inputDom: any;
        let file: any;
        if (choice === 'normal') {
            inputDom = this.elementRef.nativeElement.querySelector('#zipload');
            file = (fileProps || inputDom.files)[0];
            this.uploadPackFile = file;
        } else {
            file = this.uploadPackFile;
        }
        this.fileInfo.filename = file.name;
        if (this.utilsService.checkUploadFileNameValidity(this.fileInfo.filename)) {
            this.showInfoBox(this.i18n.plugins_porting_tips_fileNameIsValidity, 'error');
            return;
        }
        const size = file.size / 1024 / 1024;
        if (size > MAX_FILE_SIZE) {
            const message = {
                cmd: 'analysisProcess',
                data: {
                    msgID: MESSAGE_MAP.FILE_SIZE_EXCEEED
                }
            };
            this.vscodeService.postMessage(message, null);
            return;
        }
        this.fileInfo.filesize = size.toFixed(1);
        if (!file.name.endsWith('.rpm') && !file.name.endsWith('.deb')) {
            const message = {
                cmd: 'analysisProcess',
                data: {
                    msgID: MESSAGE_MAP.PROCESS_FAILED,
                    infochinese: this.i18n.plugins_porting_message_file_type_incorrect,
                    info: this.i18n.plugins_porting_message_file_type_incorrect
                }
            };
            this.vscodeService.postMessage(message, null);
            return;
        }

        const isAarch64 = this.uploadService.isIncludeAarch64(file.name);
        this.file = file;
        if (isAarch64 && choice === 'normal') {
            this.aarch64Modal.Open();
        } else {
            this.handleRelayFile(choice, file);
        }
        if (inputDom) {
          inputDom.value = '';
        }
    }
    /**
     * 请求 上传软件包 接口
     * @param choice 上传类型
     * @param file 上传的文件
     */
    private handleRelayFile(choice: string, file: any) {
        const formData = new FormData();
        if (choice === 'save_as') {
            const fileLast = new File([file], `${this.exitFileName}${this.suffix}`);
            this.fileInfo.filePath = file.path;
            this.fileInfo.filename = `${this.exitFileName}${this.suffix}`;
            file = fileLast;
            formData.append('file', fileLast);
        } else {
            formData.append('file', file);
        }
        const params = {
            file_size: file.size,
            file_name: file.name,
            scan_type: '3',
            choice
        };
        const option = {
            url: '/portadv/autopack/check_upload/',
            params
        };

        this.vscodeService.post(option, (data: any) => {
            this.displayAreaMatch = false;
            if (data.status === STATUS.SUCCESS) {

                this.filenameTip = '';
                this.isBlank = false;
                const uploadMsg = {
                    cmd: 'uploadProcess',
                    data: {
                        msgID: MESSAGE_MAP.FILE_UPLOAD,
                        url: '/portadv/autopack/package/',
                        fileUpload: 'true',
                        filePath: file.path ? file.path : this.fileInfo.filePath,
                        fileSize: file.size,
                        overrideName: this.fileInfo.filename,
                        autoPack: {
                            choice,
                            'scan-type': '3'
                        },
                        uploadPrefix: this.i18n.plugins_porting_uploadPrefix_rpmRebuild
                    }
                };
                this.vscodeService.postMessage(uploadMsg, (resp: any) => {
                    if (resp) {
                        this.suffix = '';
                        this.exitFileName = '';
                        this.fileInfo.filePath = '';
                        this.exitMask.Close();
                        if (resp === 'timeout') {
                            this.showInfoBox(this.i18n.common_term_report_500, 'warn');
                            return;
                        }
                        if (resp.status === STATUS.SUCCESS) {
                            // 上传成功时才会预填到文本框
                            this.filename = file.name;
                            let num = file.name.lastIndexOf('.');
                            let filename = file.name.substring(0, num);
                            if (filename.lastIndexOf('.tar') > 0) {
                                num = filename.lastIndexOf('.');
                                filename = filename.substring(0, num);
                            }
                            this.inputItems.path.value = filename;
                            this.isShow = false;
                            this.isUploadSuccess = true;
                            if (((self as any).webviewSession || {}).getItem('language') === 'zh-cn') {
                                this.successTit = resp.infochinese;
                            } else {
                                this.successTit = resp.info;
                            }
                            this.elementRef.nativeElement.querySelector('#zipload').value = '';
                            this.showInfoBox(this.successTit, 'info');
                        } else if (resp.realStatus === STATUS.MAXIMUM_TASK) { // 等待上传中
                            this.handleUploadWaiting(uploadMsg, resp);
                        } else if (resp.realStatus === STATUS.INSUFFICIENT_SPACE) {
                            this.utilsService.sendDiskAlertMessage();
                        } else {
                            const message = {
                                cmd: 'analysisProcess',
                                data: {
                                    msgID: resp.status === STATUS.SUCCESS
                                      ? MESSAGE_MAP.PROCESS_SUCCESS
                                      : MESSAGE_MAP.PROCESS_FAILED,
                                    infochinese: resp.infochinese,
                                    info: resp.info
                                }
                            };
                            this.vscodeService.postMessage(message, null);
                        }
                    }

                });
            } else if (data.realStatus === STATUS.INSUFFICIENT_SPACE) {
                this.utilsService.sendDiskAlertMessage();
            } else {
                if (data.data.new_name && data.data.suffix) {
                    this.exitFileName = data.data.new_name;
                    this.suffix = data.data.suffix;
                    this.exitFileNameReplace = this.i18nService
                      .I18nReplace(this.i18n.plugins_porting_message_analysis_center.exit.content,
                        { 0: data.data.old_name });
                    this.exitMask.Open();
                    return;
                }
                this.inputItems.path.value = '';
            }
        });
    }

    // 处理等待上传中
    handleUploadWaiting(uploadMsg: any, resp: any) {
        const newMsg = Object.assign({}, uploadMsg, { cmd: 'waitingUploadTask' });
        this.vscodeService.postMessage(newMsg, (res: any) => {
          // 轮询达到最大次数
          if (res) {
            const message =
              ((self as any).webviewSession || {}).getItem('language') === 'zh-cn' ? resp.infochinese : resp.info;
            this.showInfoBox(message, 'error');
          }
        });
    }

    /**
     * 确认上传
     */
    public fileModalConfirm(choice: string) {
        this.handleRelayFile(choice, this.file);
        this.aarch64Modal.Close();
    }

    /**
     * 取消上传
     */
    public fileModalCancel() {
        this.aarch64Modal.Close();
    }

    // 上传资源文件
    uploadFileData(choice: string) {
        this.exitMask.Close();
        this.isUploadPack = false;
        this.isUploadSuccess = false;
        this.isShow = false;
        let inputDom: any;
        let file: any;
        if (choice === 'normal') {
            inputDom = this.elementRef.nativeElement.querySelector('#files');
            file = this.elementRef.nativeElement.querySelector('#files').files[0];
            this.uploadDataFile = file;
        } else {
            file = this.uploadDataFile;
        }
        this.fileInfo.filename = file.name;
        if (this.utilsService.checkUploadFileNameValidity(this.fileInfo.filename)) {
            this.showInfoBox(this.i18n.plugins_porting_tips_fileNameIsValidity, 'error');
            return;
        }
        const size = file.size / 1024 / 1024;
        if (size > MAX_FILE_SIZE) {
            const message = {
                cmd: 'analysisProcess',
                data: {
                    msgID: MESSAGE_MAP.FILE_SIZE_EXCEEED
                }
            };
            this.vscodeService.postMessage(message, null);
            return;
        }
        this.fileInfo.filesize = size.toFixed(1);
        const formData = new FormData();
        if (choice === 'save_as') {
            const fileLast = new File([file], `${this.exitFileNameData}${this.suffixData}`);
            this.fileInfo.filePath = file.path;
            this.fileInfo.filename = `${this.exitFileNameData}${this.suffixData}`;
            file = fileLast;
            formData.append('file', fileLast);
        } else {
            formData.append('file', file);
        }
        const params = {
            file_size: file.size,
            file_name: file.name,
            scan_type: '4',
            choice
        };
        const option = {
            url: '/portadv/autopack/check_upload/',
            params
        };
        this.vscodeService.post(option, (data: any) => {
            this.displayAreaMatchData = false;
            if (data.status === STATUS.SUCCESS) {
                this.dangerousMessage = '';
                this.isDangerous = false;
                const uploadMsg = {
                    cmd: 'uploadProcess',
                    data: {
                        msgID: MESSAGE_MAP.FILE_UPLOAD,
                        url: '/portadv/autopack/data/',
                        fileUpload: 'true',
                        filePath: file.path ? file.path : this.fileInfo.filePath,
                        fileSize: file.size,
                        autoPack: {
                            choice,
                            'scan-type': '4'
                        },
                        uploadPrefix: this.i18n.plugins_porting_uploadPrefix_depPackage
                    }
                };
                this.vscodeService.postMessage(uploadMsg, (resp: any) => {
                    this.suffixData = '';
                    this.exitFileNameData = '';
                    if (resp === 'timeout') {
                        this.showInfoBox(this.i18n.common_term_report_500, 'warn');
                        return;
                    }
                    if (resp.status === STATUS.SUCCESS) {
                        if (this.multipleInputData === false) {
                            this.filenameData = resp.data;
                        } else {
                            let num = file.name.lastIndexOf('.');
                            let filename = file.name.substring(0, num);
                            if (filename.lastIndexOf('.tar') > 0) {
                                num = filename.lastIndexOf('.');
                                filename = filename.substring(0, num);
                            }
                            this.inputItems.path.value = filename;
                            this.isShow = false;
                            this.isUploadSuccess = true;
                            if (this.filenameData) {
                                this.filenameData = (this.filenameData.indexOf(file.name + ',') === -1)
                                    ? (this.filenameData + file.name + ',') : this.filenameData;
                            } else {
                                this.filenameData = file.name + ',';
                            }
                        }
                        this.elementRef.nativeElement.querySelector('#files').value = '';
                    } else {
                        let msgID = '';
                        if (resp.status === STATUS.SUCCESS) {
                            msgID = MESSAGE_MAP.PROCESS_SUCCESS;
                        } else {
                            this.inputItems.path.value = '';
                            this.isShow = false;
                            msgID = MESSAGE_MAP.PROCESS_FAILED;
                        }
                        const message = {
                            cmd: 'analysisProcess',
                            data: {
                                msgID,
                                infochinese: resp.infochinese,
                                info: resp.info
                            }
                        };
                        this.vscodeService.postMessage(message, null);
                    }
                });

            } else if (data.realStatus === STATUS.INSUFFICIENT_SPACE) {
                this.utilsService.sendDiskAlertMessage();
            } else {
                if (data.data.new_name) {
                    if (this.filenameData) {
                        const filenameDataArr = this.filenameData.split(';');
                        let count = 0;
                        for (const filenameArr of filenameDataArr) {
                            if (filenameArr !== file.name) {
                                count++;
                            }
                        }
                        if (count === filenameDataArr.length) {
                            this.filenameData = this.filenameData + file.name + ',';
                        }
                    } else {
                        this.filenameData = file.name + ',';
                    }
                    this.filenameData = this.filenameData.substring(0, this.filenameData.lastIndexOf(file.name + ','));
                    this.dangerousMessage = this.i18n.plugins_porting_message_file_exist;

                    this.exitFileNameData = data.data.new_name;
                    this.suffixData = data.data.suffix ? data.data.suffix : '';
                    this.exitFileNameReplaceData = this.i18nService.I18nReplace(
                        this.i18n.plugins_porting_message_analysis_center.exit.content, { 0: data.data.old_name });
                    this.exitMask.Open();
                    return;
                }

                this.inputItems.path.value = '';
            }

        });

        inputDom.value = '';
    }

    private setRadioColor(radioAction: any) {
        const themeClass = document.body.className;
        let radioActions = null;
        for (const radioLabel of RADIO_LABLE_COLOR) {
            if (themeClass.indexOf(radioLabel.theme) > -1) {
                radioActions = radioLabel.actions;
                break;
            }
        }

        if (radioActions) {
            for (const radioStatus of radioActions) {
                if (radioStatus.action === radioAction) {
                    document.documentElement.style
                      .setProperty('--lable-radio-local-clr', radioStatus.local_radio_color);
                    document.documentElement.style
                      .setProperty('--lable-radio-upload-clr', radioStatus.upload_radio_color);
                    break;
                }
            }
        }
    }

    /**
     * 历史报告数量告警检测
     */
    public async checkHistoryReport() {
        return new Promise((resolve, reject) => {
            this.vscodeService.get({ url: '/portadv/autopack/history/' }, (resp: any) => {
                this.safeFlag = false;
                this.dangerFlag = false;
                if (resp.data.histasknumstatus === 2) {
                    this.safeFlag = true;
                    this.showInfoBox(this.i18n.common_term_report_safe_tit, 'info');
                } else if (resp.data.histasknumstatus === 3) {
                    this.dangerFlag = true;
                    this.showInfoBox(this.i18n.common_term_report_danger_tit, 'error');
                }

                resolve(this.dangerFlag);
            });
        });
    }

    /**
     * 复制下载链接
     * @param item 复制内容
     * @param index 索引
     * @param copy 点击 tip 名
     */
    public copyInpValue(item: any, index: number, copy: any) {
        copy.show();
        setTimeout(() => {
        copy.hide();
        }, 800);
        const aInp = this.elementRef.nativeElement.querySelector('.input');
        const inpValue = index === 1 ? item.desMore : item.desMoreExtra;
        aInp.value = inpValue;
        aInp.select();
        document.execCommand('copy', false, null); // 执行浏览器复制命令
    }

    public openMaskConfig() {
        this.maskConfig.Open();
        if (this.intelliJFlagDef) {
            this.changeDetectorRef.markForCheck();
            this.changeDetectorRef.detectChanges();
        }
    }

    public closeMaskConfig() {
        this.maskConfig.Close();
        this.initParam();
        if (this.intelliJFlagDef) {
            this.changeDetectorRef.markForCheck();
            this.changeDetectorRef.detectChanges();
        }
    }

    public openMaskDownload() {
        this.maskDownload.Open();
        if (this.intelliJFlagDef) {
            this.changeDetectorRef.markForCheck();
            this.changeDetectorRef.detectChanges();
        }
    }

    public closeMaskDownload() {
        this.maskDownload.Close();
        this.initParam();
        if (this.intelliJFlagDef) {
            this.changeDetectorRef.markForCheck();
            this.changeDetectorRef.detectChanges();
        }
    }
    // 下载华为镜像源
    public downMirror(packResult: string) {
        if (this.intelliJFlagDef) {
            this.vscodeService.postMessage({
                cmd: 'openHyperlinks',
                data: {
                    hyperlinks: packResult
                }
            }, null);
        } else {
            const aDom = document.createElement('a');
            aDom.setAttribute('href', packResult);
            document.body.appendChild(aDom);
            aDom.click();
            document.body.removeChild(aDom);
        }
    }
    isDeleteAreaMatchData(value: string) {
        this.deleteValueData = value;
        this.isDeletePack = false;
        this.fileNameDelete = this.i18nService.I18nReplace(
            this.i18n.plugins_porting_message_analysis_center.exit.delete_file_content, { 0: value }
            );
        this.miniModalServe.open({
          type: 'warn',
          content: {
            title: this.i18n.plugins_porting_message_analysis_center.exit.delete_file,
            body: this.fileNameDelete
          },
          close: (): void => {
            this.deleteAreaMatch();
            this.utilsService.intellijDismiss(this.intelliJFlagDef);
          },
          dismiss: () => {
            this.utilsService.intellijDismiss(this.intelliJFlagDef);
         }
        });
    }

    isDeleteAreaMatch(value: string) {
        this.deleteValue = value;
        this.isDeletePack = true;
        this.fileNameDelete = this.i18nService.I18nReplace(
            this.i18n.plugins_porting_message_analysis_center.exit.delete_file_content, { 0: value }
        );
        this.miniModalServe.open({
          type: 'warn',
          content: {
            title: this.i18n.plugins_porting_message_analysis_center.exit.delete_file,
            body: this.fileNameDelete
          },
          close: (): void => {
            this.deleteAreaMatch();
            this.utilsService.intellijDismiss(this.intelliJFlagDef);
          },
          dismiss: () => {
            this.utilsService.intellijDismiss(this.intelliJFlagDef);
           }
        });

    }

    deleteAreaMatch() {
        let path;
        let fileName;
        fileName = this.isDeletePack ? this.deleteValue : this.deleteValueData;
        path = this.isDeletePack ? 'packagerebuild' : 'data';
        const params = {
            file_name: fileName,
            path
        };
        const option = {
            url: '/portadv/tasks/delete_file/',
            params
        };
        this.vscodeService.delete(option, (resp: any) => {
            if (resp) {
                const message =
                  ((self as any).webviewSession || {}).getItem('language') === 'zh-cn' ? resp.infochinese : resp.info;
                if (resp.status === STATUS.SUCCESS) {

                    this.showInfoBox(message, 'info');
                    this.isDeletePack ? this.filename = '' : this.filenameData = '';
                } else {
                    this.showInfoBox(message, 'error');
                }
            }

        });
    }

    /**
     * 下载缺失包
     * @param url 路径
     */
    downloadItemFile(url: string) {
        if (this.intelliJFlagDef) {
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

    closeMaskExit() {
        this.exitMask.Close();
        this.isDuplicated = false;
        this.isUploadSuccess = false;
    }
    closeMaskSaveAs() {
        this.saveasMask.Close();
        this.isDuplicated = false;
        this.isUploadSuccess = false;
    }
    uploadAgain(choice: string) {
        if (choice === 'override') {
            if (this.intelliJFlagDef) {
                this.uploadFileChoice = 'override';
                this.isUploadPack ? this.intellijUpload(choice, 'false') : this.intellijfilesUpload(choice);
            } else {
                this.isUploadPack ? this.uploadFilePack(choice) : this.uploadFileData(choice);
            }
        } else {
            this.exitMask.Close();
            this.saveasMask.Open();
        }
    }
    saveAs(choice: string) {
        this.saveasMask.Close();
        if (this.intelliJFlagDef) {
            this.uploadFileChoice = choice;
            this.isUploadPack ? this.intellijUpload(choice, 'false') : this.intellijfilesUpload(choice);
        } else {
            this.isUploadPack ? this.uploadFilePack(choice) : this.uploadFileData(choice);
        }
    }
    // 发送消息给vscode, 右下角弹出提醒框
    showInfoBox(info: string, type: any) {
        const message = {
            cmd: 'showInfoBox',
            data: {
                info,
                type
            }
        };
        this.vscodeService.postMessage(message, null);
    }

}
