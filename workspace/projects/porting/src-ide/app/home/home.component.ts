import {
    Component, OnInit, ElementRef, ViewChild, AfterViewChecked, ChangeDetectorRef, AfterViewInit, Renderer2
} from '@angular/core';
import { TiMessageService, TiSelectComponent, Util } from '@cloud/tiny3';
import { TiValidationConfig } from '@cloud/tiny3';
import { TiFilter } from '@cloud/tiny3';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormControl } from '@angular/forms';
import {
    UtilsService, RegService, MytipService, VscodeService, MessageService,
    I18nService, LANGUAGE_TYPE, CustomValidators
} from '../service';
import { DEFAULT_OS, fileSize, LanguageType } from '../global/globalData';
import { PortWorkerStatus } from '../service/constant';
import { HyMiniModalService } from 'hyper';

declare const require: any;
const JSZip = require('jszip');

const enum STATUS {
    SUCCESS = 0,
    FAIL = 1,
    MAXIMUM_TASK = '0x010125', // 文件上传任务已达到上限
    INSUFFICIENT_SPACE = '0x010611',
    NOPERMISSION = '0x050414' // 扫描文件或文件夹无权限
}

const enum MESSAGE_MAP {
    SHOW_PROGRESS = 'getStatus',
    FILE_SIZE_EXCEEED = 'fileSizeExceed',
    FILE_UPLOAD = 'uploadFile',
    PROCESS_FAILED = 'processFailed'
}
@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewChecked, AfterViewInit {
    @ViewChild('firstLogin', { static: false }) firstLogin: any;
    @ViewChild('delHistoryReport', { static: false }) delHistoryReport: any;
    @ViewChild('disclaimerTip', { static: false }) disclaimerTip: any;
    @ViewChild('exitmask', { static: false }) exitMask: { Close: () => void; Open: () => void; };
    @ViewChild('saveasmask', { static: false }) saveasMask: { Close: () => void; Open: () => void; };
    @ViewChild('saveConfirmTip', { static: false }) saveConfirmTip: { Close: () => void; Open: () => void; };
    @ViewChild('aboutmore', { static: false }) aboutMore: any;
    public interpretedShow = true;
    public editorSelect = 'one';
    public interpretedSelect = false;
    public cSelect = true;
    public goSelect = false;
    public goNotSelectOnly = true;
    public fortranSelect = false;
    public interpretedSelectOne = false;

    public textForm1: any = {
        textForm: {
            type: 'text'
        },

        colsNumber: 3,
        colsGap: ['100px', '100px'],

        fieldVerticalAlign: 'middle',

        firstItem: {
            label: '',
            value: []
        },
        thirdItem: {
            label: '',
            value: ''
        },
        fourthItem: {
            label: '',
            value: ''
        },
        fifthItem: {
            label: '',
            value: ''
        },
        sixthItem: {
            label: '',
            value: ''
        },
        seventhItem: {
            label: '',
            value: ''
        }
    };
    intelliJFlagDef = false;
    intelliJOS = '';
    isDuplicated = false;
    uploadFilePath: string;
    public needFlag = false;
    // url配置
    public pluginUrlCfg: any = {};
    public radioList: any[] = [];
    public sourceTypeChecked = 'remote';
    public isUploading = false;
    public isSingle: string; // 是否单文件
    public gccCheckShow = false;

    public scanItems = ['soFile', 'cFile', 'lines'];
    public isOpen = false;
    public filePath = '';
    public fileName = '';

    public scanItemsObj: any = {
        soFile: {
            id: '2',
            label: '',
            icon: './assets/img/home/file.png',
            content: '',
            files: [],
            hasDetail: false,
            isOpen: false,
        },
        cFile: {
            id: '3',
            label: '',
            icon: './assets/img/home/source.png',
            content: '',
            files: [],
            hasDetail: false,
            isOpen: false
        },
        lines: {
            id: '4',
            label: '',
            icon: './assets/img/home/trans.png',
            content: '',
            hasDetail: false,
            isOpen: false
        }
    };
    public failFlag = false;
    public failinfo = {
        fail: '',
        tip: '',
    };
    public toolValue = true;
    public customizePath = '/opt/portadv/';
    public userPath = `/opt/portadv/${((self as any).webviewSession || {}).getItem('username')}/sourcecode/`;
    public generateBtnDisabled = true;
    public isCreating = false;
    public reportId = '';
    public HisoricalReportList: Array<any> = [];
    public currLang: string;
    public isAlermOpt = false; // 告警时禁止操作
    public sampleBtnTip = '';
    public needCodeType: string;
    url = '/upload';
    autoUpload = false;
    inputFieldWidth = '460px';
    public reportTotalNum = 0;
    public titFlag = false;
    public dangerFlag = false;
    public safeFlag = false;
    public toomany = '';
    public addBox = false;
    public addNameValue = '';
    public nameReg = new RegExp(/^[a-zA-Z][a-zA-Z0-9_-]{5,31}$/);
    public search: any;
    public i18n: any;
    public leftContainerWidth: number;

    public inputPrompt1: any;
    public expired: string;
    public isCommit = false;
    public isShowMsg = false;
    public msg: string;
    public validation: TiValidationConfig = {
        type: 'blur',
        errorMessage: {
            regExp: '',
            required: ''
        }
    };
    public validation2: TiValidationConfig = {
        type: 'blur',
        errorMessage: {
            regExp: '',
            required: ''
        }
    };
    public confirmUploadZip: any;
    public label: any;
    public isHomePage = true;
    public isFirst = false;
    public commandControl: any;
    public filenameLength: any;
    public isLoginRouter = false;
    public isUploadDirectory = 'directory';
    public options: any;
    public fileTypeList: Array<{ value: string; key: string }> = [

    ];
    public currentTheme = 1;

    public deleteValue = '';

    public oldName: any;
    constructor(
        public mytip: MytipService,
        private miniModalServe: HyMiniModalService,
        public timessage: TiMessageService,
        private elementRef: ElementRef,
        public router: Router,
        public fb: FormBuilder,
        public i18nService: I18nService,
        private renderer2: Renderer2,
        private msgService: MessageService,
        public vscodeService: VscodeService,
        public utilsService: UtilsService,
        private regService: RegService,
        private route: ActivatedRoute,
        private changeDetectorRef: ChangeDetectorRef) {
        // 禁止复用路由
        this.router.routeReuseStrategy.shouldReuseRoute = () => {
            return false;
        };
        this.i18n = this.i18nService.I18n();
        this.radioList = [{ key: 'remote', value: this.i18n.plugins_porting_title_remoteSourceCode },
        { key: 'local', value: this.i18n.plugins_porting_title_localSourceCode }];
        // 监听主题变化事件
        this.vscodeService.regVscodeMsgHandler('colorTheme', (msg: any) => {
            this.currentTheme = msg.colorTheme;
            this.changeDetectorRef.markForCheck();
            this.changeDetectorRef.detectChanges();
        });
    }
    public singleSys: any = {
        options: [],
        selected: {
            label: '',
            type: '',
            version: '',
            id: ''
        }
    };
    public inputItems: any = {
        path: {
            label: '',
            rules: '',
            value: '',
            required: true
        },
        tool: {
            label: '',
            selected: {
                label: '',
                id: ''
            },
            options: [],
            required: true
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
            options: [],
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
            options: [],
            required: true
        },
        fortran: {
            label: '',
            selected: {
                label: '',
                type: '',
                version: '',
                id: ''
            },
            options: [],
            required: false
        },
        kernelVersion: {
            label: '',
            selected: {
                label: '',
                id: ''
            },
            options: [],
            required: false
        }
    };

    public currSelectOS: any;  // 保存当前选择的OS
    public showLoading = false;  // 是否显示动画

    public pathlist: any[] = [];
    public displayAreaMatch = false;
    public multipleInput = true;

    public outfilepath: any;
    public isCompress = false;
    public successTit: any;
    isUploadSuccess = false;
    public isHalf = false;

    public info = {
        filename: '',
        filesize: '',
        filePath: ''
    };
    public uploadProgress: any;
    count = 0;
    isShow = false;
    hoverFlag = false;

    public currentWidth: number;
    public areaMatchHeight: number;


    public confirmName = {
        zip: {
            label: '',
            value: '',
            required: true
        },
        folder: {
            label: '',
            value: '',
            required: true
        }
    };
    // 文件名
    public exitFileName = '';
    public overrideFileName = '';
    // 后缀
    public suffix = '';
    // 警示
    public exitFileNameReplace: string;
    // 控制exitFileNameReplace显示
    public isUploadPack = false;
    public uploadFolderFileList: any;
    // uploadFolderFileList副本
    public FileListCopy: any;
    // 判断是否zip压缩包
    public isUploadZip: any;
    public uploadZipFile: any;
    public exitFileNameReplaceData = '';

    public fileNameDelete = '';

    public filters: Array<TiFilter> = [{
        // 定义文件类型，除IE9外，其他浏览器均可指定文件选择弹框中的文件类型，
        // 但是可能会导致文件选择弹框打开过慢，该情况下请慎用该过滤器
        name: 'type',
    }, {// 限制文件最大不能超过102400B，IE9因获取不到文件大小，因此不支持该过滤器
        name: 'maxSize',
        params: [102400]
    }];

    public dataArray1: Array<any> = [
        { id: 0, text: 'C/C++/ASM', label: 'GCC' },
        { id: 1, text: 'Fortran', label: 'GFortran' },
        { id: 1, text: 'Go', label: 'Go' },
        { id: 1, text: 'Interpreted', label: 'Interpreted' },
    ];

    public checkedArray1: Array<any> = [
        this.dataArray1[0]
    ];

    public chkArmEnv = {
        isNotOk: false,
        tip: '',
        showGuide: false,
        guide1: '',
        guide2: '',
        link1: '',
        link2: ''
    };
    public showInfo = true;
    openHyperlinks(url: string) {
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

    /**
     * 获取任务撤销信息
     */
    getTaskUndone() {
        const option = {
            url: '/portadv/tasks/taskundone/'
        };

        this.vscodeService.get(option, (resp: any) => {
            if (resp.status === 0 && resp.data.id) {
                this.isCreating = true;
                this.isCommit = true;
            }
            if (this.intelliJFlagDef) {
                const message = {
                    cmd: 'analsysProgress',
                    data: {
                        reportId: resp.data.id,
                        status: resp.realStatus
                    }
                };
                this.vscodeService.postMessage(message, null);
            }
        });
    }

    /**
     * 检测asm版本信息
     */
    private checkAsmEnv() {
        this.vscodeService.get({ url: '/portadv/tasks/checkasmenv/' }, (resp: any) => {
            if (this.intelliJFlagDef) {
                ((self as any).webviewSession || {}).setItem('showCheckEnvTips', this.gccCheckShow);
            }
            if (resp.status === 1 && ((self as any).webviewSession || {}).getItem('showCheckEnvTips')) {
                this.chkArmEnv.isNotOk = true;
                this.chkArmEnv.tip = this.currLang === 'zh-cn' ? resp.infochinese : resp.info;
                this.vscodeService.get({ url: '/portadv/tasks/platform/' }, (rsp: any) => {
                    if (rsp.status !== 0) {
                        this.chkArmEnv.link1 = this.pluginUrlCfg.armLibstdcRpm;
                        this.chkArmEnv.link2 = this.pluginUrlCfg.arnGlibcRpm;
                    }
                });
            }
        });
    }

    /**
     * 关闭GCC版本过低提示
     */
    public closeArmTip() {
        this.chkArmEnv.isNotOk = false;
        this.chkArmEnv.showGuide = false;
        this.updateShowCheckEnvTips(false);
    }

    /**
     * 更新提示信息
     */
    private updateShowCheckEnvTips(showCheckEnvTips: boolean) {
        if (this.intelliJFlagDef) {
            ((self as any).webviewSession || {}).setItem('showCheckEnvTips', false);
            const getGCC = {
                cmd: 'getGCC',
                data: {}
            };
            this.vscodeService.postMessage(getGCC, null);
        }
        ((self as any).webviewSession || {}).setItem('showCheckEnvTips', showCheckEnvTips);
        const getParams = {
            cmd: 'getGlobleState',
            data: {
                data: {
                    keys: ['porting' + 'Session']
                }
            }
        };
        this.vscodeService.postMessage(getParams, (data: any) => {
            data['porting' + 'Session'].showCheckEnvTips = showCheckEnvTips;
            const params = {
                cmd: 'setGlobleState',
                data: {
                    data: {
                        list: [
                            { key: 'porting' + 'Session', value: data['porting' + 'Session'] },
                        ]
                    }
                }
            };
            this.vscodeService.postMessage(params, null);
        });
    }

    /**
     * 获取操作系统
     */
    async getSystemInfo() {
        this.showLoading = true;
        this.vscodeService.get({ url: '/portadv/tasks/systeminfo/' }, (resp: any) => {
            if (resp && resp.data) {

                // 获取构建工具
                resp.data.construct_tools.forEach((item: any, idx: any) => {
                    this.inputItems.tool.options.push({
                        label: item,
                        id: idx,
                        disabled: false
                    });
                });
                this.inputItems.tool.selected = this.inputItems.tool.options[0];
                if (this.inputItems.tool.options.length === 4) {
                    this.inputItems.tool.options[3].disabled = true;
                }

                // 获取fortran
                resp.data.fortran_list.forEach((item: any, idx: any) => {
                    const type = item.slice(0, 7);
                    const version = item.slice(8);
                    this.inputItems.fortran.options.push({
                        label: item,
                        type,
                        version,
                        id: idx
                    });
                });
                this.inputItems.fortran.selected = this.inputItems.fortran.options[0];

                // 获取编译器版本
                resp.data.gcc_list.forEach((item: any, idx: any) => {
                    const type = item.slice(0, 3);
                    const version = item.slice(4);
                    this.inputItems.version.options.push({
                        label: item,
                        type,
                        version,
                        id: idx
                    });
                });
                this.singleSys = this.inputItems.version;
                this.inputItems.version.selected = this.inputItems.version.options[0];

                // 获取目标OS列表
                this.getLinuxOSList(resp, true);
            }
            this.showLoading = false;
        });
        if (this.intelliJFlagDef) {
            while (this.inputItems.linuxOS.options.length === 0) {
                await this.utilsService.sleep(10);
            }
        }
    }

    /**
     * 获取目标OS操作系统
     * @param resp 返回的数据
     * @param isFirst 是否是首次请求
     */
    private getLinuxOSList(resp: any, isFirst?: boolean) {
        this.inputItems.linuxOS.options = [];
        this.inputItems.kernelVersion.options = [];
        if (resp.status === 0) {  // 成功获取依赖字典
            resp.data.os_system_list.forEach((item: any, idx: any) => {
                this.inputItems.linuxOS.options.push({
                    label: item.os_system,
                    id: idx,
                    kernel_default: item.kernel_default,
                    gcc_default: item.gcc_default
                });
            });
            this.inputItems.linuxOS.options = this.optionsSort(this.inputItems.linuxOS.options);
            let osDefualt: any;
            if (isFirst || this.inputItems.linuxOS.selected.label === '') {  // 进入页面首次请求显示默认操作系统
                osDefualt = this.inputItems.linuxOS.options.find(
                    (osItem: any) => osItem.label.replace(/\s*/g, '') === DEFAULT_OS
                );
            } else {  // 点击下拉框发送的请求，显示上一次选择的目标系统
                this.currSelectOS = { ...this.inputItems.linuxOS.selected };  // 保存之前选择的目标系统
                osDefualt = this.inputItems.linuxOS.options.find((os: any) => {
                    return os.label === this.currSelectOS.label;
                });
            }
            if (osDefualt) {  // 显示默认的CentOS7.6或者之前选择的系统
                this.inputItems.linuxOS.selected = osDefualt;
                this.inputItems.version.selected = this.inputItems.version.options.find((gcc: any) => {
                    return gcc.label === osDefualt.gcc_default;
                });
                this.inputItems.kernelVersion.options.push({
                    label: osDefualt.kernel_default,
                    id: 0
                });
            } else {  // 显示第一个
                this.inputItems.linuxOS.selected = this.inputItems.linuxOS.options[0];
                this.inputItems.version.selected = this.inputItems.version.options[0];
                this.inputItems.kernelVersion.options.push({
                    label: this.inputItems.linuxOS.options[0].kernel_default,
                    id: 0
                });
            }

            this.inputItems.kernelVersion.selected = this.inputItems.kernelVersion.options[0];
        } else if (resp.realStatus === '0x050110') {  // 获取依赖字典失败
            const message = this.currLang === LanguageType.ZH_CN ? resp.infochinese : resp.info;
            this.showInfoMessage(message, 'error');
            this.inputItems.linuxOS.selected = {
                label: '',
                id: ''
            };
            this.inputItems.version.selected = this.inputItems.version.options[0];
            this.inputItems.kernelVersion.selected = {
                label: '',
                id: ''
            };
        }
    }

    /**
     * 鼠标选中下拉框，获取目标操作系统
     */
    public onBeforeOpen(selectComp: TiSelectComponent): void {
        this.showLoading = true;
        this.vscodeService.get({ url: '/portadv/tasks/systeminfo/' }, (resp: any) => {
            if (resp && resp.data) {
                // 获取目标OS列表
                this.getLinuxOSList(resp);

            }
            if (this.intelliJFlagDef) {
                this.openOsSelect(selectComp);
            }
            this.showLoading = false;
        });

        if (!this.intelliJFlagDef) {
            this.openOsSelect(selectComp);
        }
    }

    private openOsSelect(selectComp: TiSelectComponent) {

        // 打开下拉框
        selectComp.open();

        setTimeout(() => {
            // 设置滚动条位置
            const selectDoms = document.querySelectorAll('.ti3-dropdown-container');
            const selectArr = Array.from(selectDoms);
            for (const select of selectArr) {
                if (select.querySelector('.btn-about-more')) {  // 选择目标系统下拉框
                    const listDom = select.querySelector('ti-list');
                    listDom.scrollTop = 0;
                }
            }
        }, 0);
    }

    /**
     * 打开了解更多对话框
     */
    public openAboutMask() {
        this.aboutMore.Open();
    }

    /**
     * 关闭解更多对话框
     */
    public closeAboutMoreMask() {
        this.aboutMore.Close();
    }
    /**
     * 目标操作系统option排序
     */
    public optionsSort(options: any) {
        return options.sort((a: any, b: any) => {
            const labelA = a.label.toLowerCase();
            const lableB = b.label.toLowerCase();
            if (labelA < lableB) {
                return -1;
            } else if (labelA > lableB) {
                return 1;
            } else {
                return 0;
            }
        });
    }

    /**
     * 源码类型切换监听
     */
    public onEditChange() {
        setTimeout(() => {
            this.interpretedSelect = this.checkedArray1.some((el) => el.label === 'Interpreted');
            this.cSelect = this.checkedArray1.some((el) => el.label === 'GCC');
            this.goSelect = this.checkedArray1.some((el) => el.label === 'Go');
            this.fortranSelect = this.checkedArray1.some((el) => el.label === 'GFortran');
            if (this.inputItems.tool.options.length === 4) {
                this.inputItems.tool.options[3].disabled = true;
            }
            this.interpretedSelectOne = false;
            this.editorSelect = 'one';
            this.isCommit = false;
            this.interpretedShow = true;
            this.goNotSelectOnly = true;
            this.showInfo = false;
            if (this.cSelect) {
                this.showInfo = true;
            }
            if (this.checkedArray1.length === 1) {
                if (this.cSelect) {
                    this.singleSys = this.inputItems.version;
                } else if (this.interpretedSelect) {
                    this.interpretedSelectOne = true;
                    this.interpretedShow = false;
                } else if (this.goSelect) {
                    this.goNotSelectOnly = false;
                    this.singleSys = this.inputItems.version;
                    this.inputItems.tool.options[3].disabled = false;
                } else {
                    this.singleSys = this.inputItems.fortran;
                }
            } else if (this.checkedArray1.length === 2) {
                if ((this.cSelect && this.fortranSelect) || (this.goSelect && this.fortranSelect)){
                    this.editorSelect = 'two';
                } else if ((this.cSelect && this.goSelect) || (this.cSelect && this.interpretedSelect)) {
                    this.singleSys = this.inputItems.version;
                } else if (this.goSelect && this.interpretedSelect) {
                    this.goNotSelectOnly = false;
                    this.singleSys = this.inputItems.version;
                    this.inputItems.tool.options[3].disabled = false;
                } else if (this.fortranSelect && this.interpretedSelect) {
                    this.singleSys = this.inputItems.fortran;
                }
            } else {
                if (this.checkedArray1.length === 0) {
                    this.singleSys = '';
                    this.isCommit = true;
                } else {
                // checkedArray1.length === 3 or 4
                if (this.fortranSelect) {
                    this.editorSelect = 'two';
                } else {
                    this.singleSys = this.inputItems.version;
                }
                }
            }
            // 命令为go时，重置构建工具及构建命令
            if (this.goNotSelectOnly && (this.inputItems.tool.selected.label === 'go')){
                this.inputItems.tool.selected = this.inputItems.tool.options[0];
                this.commandChange(this.inputItems.tool.selected);
            }
            if (this.dangerFlag === true) {
                this.isCommit = true;
            }
        }, 100);
    }

    /**
     * 页面初始化
     */
    ngOnInit() {
        // 获取全局url配置数据
        this.vscodeService.postMessage({ cmd: 'readUrlConfig' }, (resp: any) => {
            this.pluginUrlCfg = resp;
            this.chkArmEnv.link1 = this.pluginUrlCfg.x86LibstdcRpm;
            this.chkArmEnv.link2 = this.pluginUrlCfg.x86GlibcRpm;
            if (this.intelliJFlagDef) {
                this.changeDetectorRef.markForCheck();
                this.changeDetectorRef.detectChanges();
            }
        });
        /**
         * 变量初始化
         */
        this.route.queryParams.subscribe((data) => {
            this.isLoginRouter = data.isLoginRouter;
            this.intelliJFlagDef = data.intelliJFlag;
            this.gccCheckShow = data.gccCheckShow;
            if (data.currentTheme) {
                this.currentTheme = Number(data.currentTheme);
            }
        });

        // vscode颜色主题
        if (document.body.className === 'vscode-light') {
            this.currentTheme = 2;
        }

        /**
         * 接收报告数量告警消息
         */
        this.msgService.getMessage().subscribe(msg => {
            if (msg.value && msg.type === 'isreportChange') {
                this.checkHistoryReport();
            }
        });


        /**
         * 接收中止源码迁移任务消息
         */
        this.msgService.getMessage().subscribe(msg => {
            if (msg.value && msg.type === 'isSourceCodeChange') {
                this.stopSourceCodeAnalyse();
            }
        });

        this.route.queryParams.subscribe((data) => {
            this.isLoginRouter = data.isLoginRouter;

            // 如果是右键发起跳转到该页面
            if (data.filePath) {
                this.filePath = data.filePath;
                this.fileName = data.fileName;
                this.isSingle = data.isSingle;
                const message = {
                    cmd: 'panelCheckFile'
                };
                this.vscodeService.postMessage(message, null);
            }

            const params = {
                cmd: 'setGlobleState',
                data: {
                    data: {
                        list: [
                            { key: 'rightPorting', value: this.filePath.length > 0 ? true : false },
                        ]
                    }
                }
            };
            this.vscodeService.postMessage(params, null);
        });

        if (((self as any).webviewSession || {}).getItem('isFirst') !== '1') {
            this.utilsService.queryDiskState();
            // 历史报告告警检测
            this.checkHistoryReport();
            this.vscodeService.get({ url: '/customize/' }, (resp: any) => {
                if (resp.status === 0) {
                    const username = ((self as any).webviewSession || {}).getItem('username');
                    this.userPath =
                        `${resp.data.customize_path}/portadv/${username}/sourcecode/`;
                    this.customizePath = `${resp.data.customize_path}/portadv/`;
                    this.chkArmEnv.guide1 = this.i18nService.I18nReplace(
                        this.i18n.plugins_porting_message_automake_evn_check.guide_tip1,
                        { 1: this.customizePath }
                    );
                    this.chkArmEnv.guide2 = this.i18nService.I18nReplace(
                        this.i18n.plugins_porting_message_automake_evn_check.guide_tip2,
                        { 1: this.customizePath, 2: this.customizePath }
                    );
                }
            });
            this.vscodeService.get({ url: '/portadv/tasks/platform/' }, (resp: any) => {
                if (resp.status !== 0) {
                    this.chkArmEnv.link1 = this.pluginUrlCfg.armLibstdcRpm;
                    this.chkArmEnv.link2 = this.pluginUrlCfg.arnGlibcRpm;
                }
            });
        }

        this.expired = ((self as any).webviewSession || {}).getItem('isExpired');
        this.currLang = ((self as any).webviewSession || {}).getItem('language');
        this.dataArray1[3].text = this.i18n.common_term_ipt_label.interpreted;

        if (((self as any).webviewSession || {}).getItem('isFirst') !== '1') {
            this.checkAsmEnv();
            this.getSystemInfo();
            this.getTaskUndone();
        }
        this.needCodeType = this.i18n.common_term_needCodeType;
        this.inputItems.path.label = this.i18n.common_term_ipt_label.source_code_path;
        this.inputItems.version.label = this.i18n.common_term_ipt_label.compiler_version;
        this.inputItems.tool.label = this.i18n.common_term_ipt_label.construct_tool;
        this.inputItems.command.label = this.i18n.common_term_ipt_label.compile_command;
        this.inputItems.linuxOS.label = this.i18n.common_term_ipt_label.target_os;
        this.inputItems.fortran.label = this.i18n.common_term_ipt_label.fortran;
        this.inputItems.kernelVersion.label = this.i18n.common_term_ipt_label.target_system_kernel_version;
        this.textForm1.firstItem.label = this.i18n.common_term_ipt_label.source_code_path;
        this.textForm1.thirdItem.label = this.i18n.common_term_ipt_label.compiler_version;
        this.textForm1.fourthItem.label = this.i18n.common_term_ipt_label.construct_tool;
        this.textForm1.fifthItem.label = this.i18n.common_term_ipt_label.compile_command;
        this.textForm1.sixthItem.label = this.i18n.common_term_ipt_label.target_os;
        this.textForm1.seventhItem.label = this.i18n.common_term_ipt_label.target_system_kernel_version;
        this.scanItemsObj.soFile.label = this.i18n.common_term_result_soFile;
        this.scanItemsObj.cFile.label = this.i18n.common_term_result_cFile;
        this.scanItemsObj.lines.label = this.i18n.common_term_result_lines;
        this.confirmUploadZip = new FormControl('', [CustomValidators.confirmNewName(this.i18n)]);
        this.fileTypeList[0] = {
            value: this.i18n.common_term_upload_directory,
            key: 'directory'
        };
        this.fileTypeList[1] = {
            value: this.i18n.common_term_upload_compressed,
            key: 'compressed'
        };
        this.vscodeService.postMessage({ cmd: 'getCurrentAppName' }, (appName: string) => {
            if (appName === 'CloudIDE') {
                this.fileTypeList.shift();
                this.isUploadDirectory = 'compressed';
            }
        });


        this.commandControl = new FormControl('', [CustomValidators.commandControl(this.i18n, this)]);
        this.filenameLength = new FormControl('',
          [CustomValidators.multifilenameLength(this.i18n), CustomValidators.filenameCheck(this.i18n)]);

        this.inputAreaMatch();
    }

    /**
     * 目标环境配置选择框改变监听事件
     */
    public osSelectChange(data: any) {
        this.inputItems.version.selected = this.inputItems.version.options.find((gcc: any) => {
            return gcc.label === data.gcc_default;
        });
        this.inputItems.kernelVersion.selected.label = data.kernel_default;

    }

    /**
     * 上传文件夹
     */
    uploadFolder() {
        this.elementRef.nativeElement.querySelector('#filesUp').value = '';
        if (this.intelliJFlagDef) {
            this.toZipCode('normal');
        } else {
            this.elementRef.nativeElement.querySelector('#filesUp').click();
        }
    }

    /**
     * 停止源码分析
     */
    public stopSourceCodeAnalyse() {
        this.isCommit = false;
    }

    /**
     * 历史报告数量告警检测
     */
    public async checkHistoryReport() {
        return new Promise((resolve, reject) => {
            this.vscodeService.get({ url: '/portadv/tasks/' }, (resp: any) => {
                if (resp.status === STATUS.SUCCESS) {
                    this.safeFlag = false;
                    this.dangerFlag = false;
                    if (resp.data.histasknumstatus === 2) {
                        this.safeFlag = true;
                        this.showInfoBox({
                            info: this.i18n.common_term_report_safe_tit,
                            infochinese: this.i18n.common_term_report_safe_tit
                        }, 'info', false);
                    } else if (resp.data.histasknumstatus === 3) {
                        this.toomany = this.i18n.common_term_report_danger_tit;
                        this.dangerFlag = true;
                        this.showInfoBox({
                            info: this.i18n.common_term_report_danger_tit,
                            infochinese: this.i18n.common_term_report_danger_tit
                        }, 'error', false);
                    }
                }

                resolve(this.dangerFlag);
            });
        });
    }

    /**
     * 构建工具选择框改变监听事件
     */
    public commandChange(data: any) {
        const inputDom = document.getElementsByClassName('command-input')[0] as HTMLElement;
        if (!inputDom) {
            return;
        }
        if (data.label === 'automake') {
            this.inputItems.command.value = 'make';
            inputDom.setAttribute('disabled', 'disabled');
        } else if (data.label === 'go') {
            this.inputItems.command.value = 'go build';
            inputDom.removeAttribute('disabled');
        } else {
            this.inputItems.command.value = data.label;
            inputDom.removeAttribute('disabled');
        }
    }
    /**
     * 开始分析按钮事件
     */
    analyze() {
        if (this.filePath.length > 0) {
            // 右键源码迁移
            this.uploadRightClickFile();
        } else {
            if (!this.filenameLength.valid) { return; }
            if (!this.inputItems.path.value && !this.pathlist.length) {
                // 弹窗提示信息
                const info = this.i18n.common_term_source_code_path_empty;
                this.showInfoMessage(info, 'error');
                return; }
            if (!this.commandControl.valid) {
                this.elementRef.nativeElement.querySelector('.command-input').focus();
                this.elementRef.nativeElement.querySelector('.command-input').blur();
                return;
            }
            this.createReport();
        }
    }

    /**
     * 创建报告
     */
    async createReport() {
        this.isCommit = true;
        this.failFlag = false;
        // 历史报告数量告警检测
        await this.checkHistoryReport();
        if (this.dangerFlag) {
            return;
        }

        // 创建report
        let sourcedir = '';
        let inputPath = this.inputItems.path.value;
        if (inputPath) {
            if (inputPath.search(',') === -1) {
                inputPath = inputPath.replace(/(^\s*)|(\s*$)/g, '').replace(/[\r\n]/g, '');
                if (inputPath.charAt(inputPath.length - 1) === '/') {
                    inputPath = inputPath.slice(0, -1);
                }
                sourcedir = `${this.userPath}${inputPath}/`;
            } else {
                const values = inputPath.split(',');
                if (values[0]) {
                    values[0] = values[0].replace(/(^\s*)|(\s*$)/g, '').replace(/[\r\n]/g, '');
                    if (values[0].charAt(values[0].length - 1) === '/') {
                        values[0] = values[0].slice(0, -1);
                    }
                    sourcedir = `${this.userPath}${values[0]}/`;
                }

                for (let j = 1; j <= values.length; j++) {
                    if (values[j]) {
                        values[j] = values[j].replace(/(^\s*)|(\s*$)/g, '').replace(/[\r\n]/g, '');
                        if (values[j].charAt(values[j].length - 1) === '/') {
                            values[j] = values[j].slice(0, -1);
                        }

                        sourcedir += `,${this.userPath}${values[j]}/`;
                    }
                }
            }
        } else {
            sourcedir = this.userPath;
        }
        if (this.filePath.length > 0) {
            if (this.isSingle === 'true') {
                const pathArr = this.filePath.split('\\');
                const folderPath = pathArr.slice(pathArr.length - 1)[0];
                sourcedir = `${this.userPath}${folderPath}`;
            } else {
                sourcedir = `${this.userPath}${this.fileName}`;
            }
        }
        const targetos = this.inputItems.linuxOS.selected.label.toLowerCase();
        let gfortran = this.inputItems.fortran.selected.label.toLowerCase();
        gfortran = gfortran.split(' ').join('');
        const type = this.inputItems.version.selected.type.toLowerCase();
        this.isCreating = false;
        const params = {
            info: {
                sourcedir,
                compiler: this.cSelect
                    ? { type, version: this.inputItems.version.selected.version }
                    : { type: '', version: '' },
                cgocompiler: this.goSelect
                    ? { type, version: this.inputItems.version.selected.version }
                    : { type: '', version: '' },
                constructtool: !this.interpretedSelectOne ? this.inputItems.tool.selected.label : '',
                interpreted: this.interpretedSelect,
                compilecommand: !this.interpretedSelectOne ? this.inputItems.command.value : '',
                targetos,
                gfortran: this.fortranSelect ? gfortran : '',
                targetkernel: this.inputItems.kernelVersion.selected.label,
                os_mapping_dir: ''
            }
        };
        const that = this;
        setTimeout(() => {
            if (
                that.checkedArray1.length === 1
                && (this.checkedArray1[0].label === 'GCC' || this.checkedArray1[0].label === 'Go' )
            ) {
                params.info.gfortran = '';
            }
            if (that.checkedArray1.length === 1 && that.checkedArray1[0].label === 'GFortran') {
                params.info.compiler.type = '';
                params.info.compiler.version = '';
            }
            if (that.checkedArray1.length === 0) {
                params.info.compiler.type = '';
                params.info.compiler.version = '';
                params.info.gfortran = '';
            }
            if (this.filePath.length > 0) {
                params.info.os_mapping_dir = this.filePath;
            }
            this.vscodeService.post({ url: '/portadv/tasks/', params }, (resp: any) => {
                if (resp.status === STATUS.SUCCESS && resp.data.id) {
                    if (!this.intelliJFlagDef) {
                        // worker为1-3
                        if (resp.realStatus === PortWorkerStatus.CREATE_TASK_LACKWORKER_STATUS) {
                            this.utilsService.showMessageByWorker('info');
                        }
                    }
                    that.reportId = resp.data.id;
                    this.vscodeService.get({
                        url: `/task/progress/?task_type=0&task_id=${encodeURIComponent(that.reportId)}` },
                        (data: any) => {
                            if (data.status === STATUS.SUCCESS) {
                                that.isCreating = true;
                                const message = {
                                    cmd: 'analsysProgress',
                                    data: {
                                        reportId: that.reportId,
                                        status: resp.realStatus, // 创建任务的状态码
                                    }
                                };
                                this.vscodeService.postMessage(message, (reportResp: any) => {
                                    this.isCommit = false;
                                    if (this.intelliJFlagDef) {
                                        this.changeDetectorRef.markForCheck();
                                        this.changeDetectorRef.detectChanges();
                                    }
                                });
                            } else {
                                if (this.filePath.length > 0) {
                                    this.showInfoBox(data, 'error', true);
                                } else {
                                    this.showInfoBox(data, 'error', false);
                                }
                                this.isCommit = false;
                            }
                        });
                } else if (resp.realStatus === STATUS.INSUFFICIENT_SPACE) {
                    this.utilsService.sendDiskAlertMessage();
                    this.isCommit = false;
                } else {
                    that.failFlag = true;
                    this.isCommit = false;
                    if (!this.intelliJFlagDef) {
                        // worker为0
                        if (resp.realStatus === PortWorkerStatus.CREATE_TASK_NOWORKER_STATUS) {
                            this.utilsService.showMessageByWorker('error');
                            return;
                        }
                    }
                    if (this.filePath.length > 0) {
                        this.showInfoBox(resp, 'error', true);
                    } else {
                      // 无权限操作时，提示语追加前往FAQ
                      if (resp.realStatus === STATUS.NOPERMISSION) {
                        const message = {
                          cmd: 'noPermissionFaqTip',
                            data: {
                              res: resp,
                            }
                          };
                        this.vscodeService.postMessage(message, null);
                      } else {
                      this.showInfoBox(resp, 'error', false);
                      }
                    }
                }
                if (this.intelliJFlagDef) {
                    this.changeDetectorRef.markForCheck();
                    this.changeDetectorRef.detectChanges();
                }
            });

        }, 100);

    }

    /**
     * 发送消息给vscode, 右下角弹出提醒框
     */
    showI18nInfoBox(key: any, type: any, confirm: any) {
        const message = {
            cmd: 'showInfoBox',
            data: {
                info: this.i18n[key],
                type,
                confirm
            }
        };
        this.vscodeService.postMessage(message, null);
    }

    /**
     * 发送消息给vscode, 右下角弹出提醒框
     */
    showInfoBox(tip: any, type: any, confirm: any) {
        let info = '';
        const languageType: any = I18nService.getLang();
        if (languageType) {
            info = (languageType === LANGUAGE_TYPE.ZH ? tip.infochinese : tip.info);
        } else {
            info = tip.infochinese;
        }
        const realStatus = tip.realStatus;
        const message = {
            cmd: 'showInfoBox',
            data: {
                info,
                type,
                confirm,
                realStatus,
            }
        };
        this.vscodeService.postMessage(message, null);
    }

    // 发送消息给vscode, 右下角弹出自定义提醒框
    showInfoMessage(info: string, type: any) {
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
     * 视图变更完成
     */
    ngAfterViewChecked(): void {
        const leftContainer = this.elementRef.nativeElement.querySelector('.project-left');
        this.currentWidth = leftContainer.offsetHeight;
        if (this.leftContainerWidth && this.currentWidth !== this.leftContainerWidth) {
            this.leftContainerWidth = this.currentWidth = leftContainer.offsetHeight;
        }

    }

    ngAfterViewInit() {
        // 整个页面的滚动条监听，关闭下拉框
        const element = $('.router-content')[0];
        this.renderer2.listen(element, 'scroll', () => {
            Util.trigger(document, 'tiScroll');
        });
    }

    /**
     * 上传压缩包按钮事件
     */
    zipUploadCode() {
        if (this.intelliJFlagDef) {
            this.uploadFileCode('normal');
        } else {
            this.vscodeService.postMessage({ cmd: 'getCurrentAppName' }, (appName: string) => {
                if (appName === 'CloudIDE') {
                    this.vscodeService.postMessage({
                        cmd: 'cloudIDEupload',
                    }, (fileProps: Array<any>) => {
                        this.uploadFileCode('normal', fileProps);
                    });
                } else {
                    this.elementRef.nativeElement.querySelector('#ziploadCode').value = '';
                    this.elementRef.nativeElement.querySelector('#ziploadCode').click();
                }
            });
        }
    }

    /**
     *  模糊查询
     */
    showUploadCode() {
        this.hoverFlag = true;
    }
    hideUploadCode() {
        this.hoverFlag = false;
    }

    /**
     * 上传压缩包文件--intelliJ
     */
    private intellijUpload(choice: string) {
        this.exitMask.Close();
        const checkUploadMsg = {
            cmd: 'checkUploadFileIntellij',
            data: {
                url: '/portadv/tasks/check_upload/',
                scan_type: '0',
                need_unzip: 'true',
                choice,
                not_chmod: 'true',
                validFile: 'tar,tar.bz,tar.bz2,tar.gz,tar.xz,tbz,tbz2,tgz,txz,zip',
                isDuplicated: this.isDuplicated.toString(),
                uploadFilePath: this.uploadFilePath,
                saveFileName: (choice === 'override' ? this.overrideFileName : this.exitFileName) + this.suffix
            }
        };
        this.isDuplicated = false;
        this.vscodeService.postMessage(checkUploadMsg, (data: any) => {
            this.uploadFilePath = data.uploadFilePath;
            this.isUploading = true;
            this.changeDetectorRef.markForCheck();
            this.changeDetectorRef.detectChanges();
            this.displayAreaMatch = false;
            if (data.status === STATUS.SUCCESS) {
                const uploadMsg = {
                    cmd: 'uploadFileIntellij',
                    data: {
                        scan_type: '0',
                        need_unzip: 'true',
                        choice,
                        not_chmod: 'true',
                        uploadFilePath: this.uploadFilePath,
                        saveFileName: (choice === 'override' ? this.overrideFileName : this.exitFileName) + this.suffix
                    }
                };
                this.vscodeService.postMessage(uploadMsg, (resp: any) => {
                    this.suffix = '';
                    this.exitFileName = '';
                    this.overrideFileName = '';
                    this.exitMask.Close();
                    if (resp.status === STATUS.SUCCESS) {
                        // 文件回填
                        this.contactPackPath(resp.data);
                        this.isShow = false;
                        this.isCompress = false;
                        this.isUploadSuccess = true;
                        this.isCommit = false;
                        this.showInfoBox(resp, 'info', false);
                    } else if (resp.realStatus === STATUS.INSUFFICIENT_SPACE) {
                        this.utilsService.sendDiskAlertMessage();
                    } else if (resp === 'timeout') {
                        this.showI18nInfoBox('common_term_report_500', 'warn', false);
                        this.isCompress = false;
                    } else {
                        this.inputItems.path.value = '';
                        this.isShow = false;
                        this.isCompress = false;
                        this.showInfoBox(resp, 'error', false);
                    }
                    this.isUploading = false;
                    this.changeDetectorRef.markForCheck();
                    this.changeDetectorRef.detectChanges();
                });
            } else if (data.realStatus === STATUS.INSUFFICIENT_SPACE) {
                this.utilsService.sendDiskAlertMessage();
                this.isUploading = false;
            } else {
                if (data.data.new_name && data.data.suffix) {
                    this.exitFileName = data.data.new_name;
                    this.suffix = data.data.suffix;
                    this.overrideFileName = data.data.old_name;
                    this.exitFileNameReplace = this.i18nService.I18nReplace(
                        this.i18n.plugins_porting_message_analysis_center.exit.content,
                        { 0: data.data.old_name });
                    this.exitMask.Open();
                    this.isDuplicated = true;
                } else {
                    this.isShow = false;
                    this.isUploading = false;
                    this.showInfoBox(data, 'error', false);
                }
            }
            this.changeDetectorRef.markForCheck();
            this.changeDetectorRef.detectChanges();
        });
    }

    /**
     * 上传压缩包文件
     */
    uploadFileCode(choice: string, fileProps?: Array<any>) {
        if (this.intelliJFlagDef) {
            this.isUploadZip = true;
            this.intellijUpload(choice);
        } else {
            this.exitMask.Close();
            this.isUploadZip = true;
            this.isUploadSuccess = false;
            this.isShow = false;
            this.isUploadZip = true;
            this.isUploading = true;
            let inputDom: any;
            let file: any;
            if (choice === 'normal') {
                inputDom = this.elementRef.nativeElement.querySelector('#ziploadCode');
                file = (fileProps || inputDom.files)[0];
                this.uploadZipFile = file;
            } else {
                file = this.uploadZipFile;
            }
            this.info.filename = file.name;
            if (this.utilsService.checkUploadFileNameValidity(this.info.filename)) {
                this.isShow = false;
                this.isUploading = false;
                this.showI18nInfoBox('plugins_porting_tips_fileNameIsValidity', 'error', false);
                return;
            }
            if (!(/.zip$|.tar$|.tar.gz$|.tar.bz$|.tar.bz2$|.tar.xz$|.tgz$|.tbz$|.tbz2$|.txz$/).test(file.name)) {
                this.showI18nInfoBox('plugins_porting_tips_wrongFileType', 'error', false);
                this.isUploading = false;
                return;
            }
            const size = file.size / 1024 / 1024;
            if (size > fileSize) {
                this.isShow = false;
                this.showI18nInfoBox('plugins_porting_message_fileExceedMaxSize', 'info', false);
                this.isUploading = false;
                return;
            }
            this.info.filesize = size.toFixed(1);
            const formData = new FormData();
            if (choice === 'save_as') {
                const fileLast = new File([file], `${this.exitFileName}${this.suffix}`);
                this.info.filePath = file.path;
                this.info.filename = `${this.exitFileName}${this.suffix}`;
                file = fileLast;
                formData.append('file', fileLast);
            } else if (choice === 'override') {
                const fileLast = new File([file], `${this.oldName}${this.suffix}`);
                this.info.filePath = file.path;
                this.info.filename = `${this.oldName}${this.suffix}`;
                file = fileLast;
                formData.append('file', fileLast);
            } else {
                formData.append('file', file);
            }
            const params = {
                file_size: file.size,
                file_name: file.name,
                need_unzip: 'true',
                scan_type: '0',
                choice
            };
            this.uploadProgress = '0%';
            this.vscodeService.post({ url: '/portadv/tasks/check_upload/', params }, (data: any) => {
                this.displayAreaMatch = false;
                if (data.status === STATUS.SUCCESS) {
                    const uploadMsg = {
                        cmd: 'uploadProcess',
                        data: {
                            msgID: MESSAGE_MAP.FILE_UPLOAD,
                            url: '/portadv/tasks/upload/',
                            fileUpload: 'true',
                            filePath: file.path ? file.path : this.info.filePath,
                            fileSize: file.size,
                            need_unzip: 'true',
                            overrideName: this.info.filename,
                            autoPack: {
                                choice,
                                'scan-type': '0'
                            },
                            uploadPrefix: this.i18n.plugins_porting_uploadPrefix_sourceCode
                        }
                    };
                    this.vscodeService.postMessage(uploadMsg, (resp: any) => {
                        this.suffix = '';
                        this.exitFileName = '';
                        this.exitMask.Close();
                        this.isUploading = false;
                        if (resp.status === STATUS.SUCCESS) {
                            // 文件回填
                            this.contactPackPath(resp.data);
                            this.isShow = false;
                            this.isCompress = false;
                            this.isUploadSuccess = true;
                            this.isCommit = false;
                            this.showInfoBox(resp, 'info', false);
                        } else if (resp.realStatus === STATUS.MAXIMUM_TASK) { // 等待上传中
                            this.isUploading = true;
                            this.handleUploadWaiting(uploadMsg, resp);
                        } else if (resp.realStatus === STATUS.INSUFFICIENT_SPACE) {
                            this.utilsService.sendDiskAlertMessage();
                        } else if (resp === 'timeout') {
                            this.showI18nInfoBox('common_term_report_500', 'warn', false);
                            this.isCompress = false;
                        } else {
                            this.inputItems.path.value = '';
                            this.isShow = false;
                            this.isCompress = false;
                            this.showInfoBox(resp, 'error', false);
                        }
                        this.inputAreaMatch();
                    });
                } else if (data.realStatus === STATUS.INSUFFICIENT_SPACE) {
                    this.utilsService.sendDiskAlertMessage();
                    this.isUploading = false;
                } else {
                    if (data.data.new_name && data.data.suffix) {
                        this.exitFileName = data.data.new_name;
                        this.oldName = data.data.old_name;
                        this.suffix = data.data.suffix;
                        this.exitFileNameReplace = this.i18nService.I18nReplace(
                            this.i18n.plugins_porting_message_analysis_center.exit.content,
                            { 0: data.data.old_name });
                        this.exitMask.Open();
                    } else {
                        this.isShow = false;
                        this.isUploading = false;
                        this.showInfoBox(data, 'error', false);
                    }
                }
            });
            inputDom.value = '';
        }
    }

    // 处理等待上传中
    handleUploadWaiting(uploadMsg: any, resp: any) {
        const newMsg = Object.assign({}, uploadMsg, { cmd: 'waitingUploadTask' });
        this.vscodeService.postMessage(newMsg, (res: any) => {
            this.isUploading = false;
            if (res) {
                this.showInfoBox(resp, 'error', false);
            }
        });
    }

    /**
     * 处理路径参数
     */
    contactPackPath(value: any) {
        const lastIndex = this.inputItems.path.value.lastIndexOf(',');
        if (!this.multipleInput) {
            this.inputItems.path.value = value;
        } else {
            const inputItems = this.inputItems.path.value.split(',');
            if (inputItems.indexOf(value) > -1) {
                return;
            }
            if (lastIndex) {
                this.inputItems.path.value = this.inputItems.path.value.slice(0, lastIndex + 1) + value + ',';
            } else {
                this.inputItems.path.value = value + ',';
            }
        }
    }

    tabSourceType() {
        this.inputItems.path.value = '';
    }

    /**
     * 上传右键文件
     */
    uploadRightClickFile() {
        this.isCommit = true;
        const params = {
            cmd: 'uploadPortingFile',
            data: {
                filePath: this.filePath,
            }
        };
        this.vscodeService.postMessage(params, (res: any) => {
            this.isShow = true;
            this.displayAreaMatch = false;
            if (res.data.status === STATUS.SUCCESS) {
                const uploadMsg = {
                    cmd: 'uploadProcess',
                    data: {
                        msgID: MESSAGE_MAP.FILE_UPLOAD,
                        url: '/portadv/tasks/upload/',
                        folderUpload: 'true',
                        fromVScode: true,
                        filePath: this.filePath,
                        need_unzip: 'true',
                        autoPack: {
                            'scan-type': '0',
                            choice: 'override'
                        },
                        fileName: this.fileName,
                        isSingle: this.isSingle,
                        uploadPrefix: this.i18n.plugins_porting_uploadPrefix_sourceCode
                    }
                };
                this.vscodeService.postMessage(uploadMsg, (resp: any) => {
                    this.isUploading = false;
                    if (resp.status === STATUS.SUCCESS) {
                        // 文件回填
                        this.outfilepath = this.outfilepath;
                        this.contactPackPath(this.outfilepath);
                        this.isShow = false;
                        this.isCompress = false;
                        this.isUploadSuccess = true;
                        this.isCommit = false;
                        this.showI18nInfoBox('plugins_porting_message_folderSucess', 'info', false);
                        this.createReport();
                    } else if (resp.realStatus === STATUS.MAXIMUM_TASK) { // 等待上传中
                        this.isUploading = true;
                        this.handleUploadWaiting(uploadMsg, resp);
                    } else if (resp.realStatus === STATUS.INSUFFICIENT_SPACE) {
                        this.utilsService.sendDiskAlertMessage();
                    } else if (resp === 'timeout') {
                        this.showI18nInfoBox('common_term_report_500', 'warn', true);
                        this.isCompress = false;
                    } else {
                        this.showInfoBox(resp, 'error', true);
                        this.inputItems.path.value = '';
                        this.isShow = false;
                        this.isCompress = false;
                    }
                });
            } else if (res.data.realStatus === STATUS.INSUFFICIENT_SPACE) {
                this.utilsService.sendDiskAlertMessage();
                const message = {
                    cmd: 'closePanel'
                };
                this.vscodeService.postMessage(message, null);
            } else {
                this.showInfoBox(res.data, 'error', false);
                const message = {
                    cmd: 'closePanel'
                };
                this.vscodeService.postMessage(message, null);
            }
        });
    }

    /**
     * Intellij上传文件夹
     */
    private upFileIntellij(choice: string) {
        this.exitMask.Close();
        const checkUploadMsg = {
            cmd: 'checkUploadFileIntellij',
            data: {
                url: '/portadv/tasks/check_upload/',
                scan_type: '0',
                need_unzip: 'true',
                choice,
                not_chmod: 'true',
                is_file: 'true',
                isDuplicated: this.isDuplicated.toString(),
                uploadFilePath: this.uploadFilePath,
                saveFileName: (choice === 'override' ? this.overrideFileName : this.exitFileName) + '.zip'
            }
        };
        this.isDuplicated = false;
        this.vscodeService.postMessage(checkUploadMsg, (data: any) => {
            this.uploadFilePath = data.uploadFilePath;
            this.isUploading = true;
            this.changeDetectorRef.markForCheck();
            this.changeDetectorRef.detectChanges();
            this.isShow = true;
            this.displayAreaMatch = false;
            if (data.status === STATUS.SUCCESS) {
                const uploadMsg = {
                    cmd: 'uploadFileIntellij',
                    data: {
                        scan_type: '0',
                        need_unzip: 'true',
                        choice,
                        not_chmod: 'true',
                        is_file: 'true',
                        uploadFilePath: this.uploadFilePath,
                        saveFileName: (choice === 'override' ? this.overrideFileName : this.exitFileName) + '.zip'
                    }
                };
                this.vscodeService.postMessage(uploadMsg, (resp: any) => {
                    this.exitFileName = '';
                    this.overrideFileName = '';
                    if (resp.status === STATUS.SUCCESS) {
                        // 文件回填
                        this.contactPackPath(resp.data);
                        this.isShow = false;
                        this.isCompress = false;
                        this.isUploadSuccess = true;
                        this.isCommit = false;
                        this.showI18nInfoBox('plugins_porting_message_folderSucess', 'info', false);
                    } else if (resp.realStatus === STATUS.INSUFFICIENT_SPACE) {
                        this.utilsService.sendDiskAlertMessage();
                    } else if (resp === 'timeout') {
                        this.showI18nInfoBox('common_term_report_500', 'warn', false);
                        this.isCompress = false;
                    } else {
                        this.showInfoBox(resp, 'error', false);
                        this.inputItems.path.value = '';
                        this.isShow = false;
                        this.isCompress = false;
                    }
                    this.isUploading = false;
                    this.changeDetectorRef.markForCheck();
                    this.changeDetectorRef.detectChanges();
                });
            } else if (data.realStatus === STATUS.INSUFFICIENT_SPACE) {
                this.utilsService.sendDiskAlertMessage();
                this.isUploading = false;
            } else {
                if (data.data.new_name && data.data.suffix) {
                    this.exitFileName = data.data.new_name;
                    this.overrideFileName = data.data.old_name;
                    this.confirmName.zip.value = data.data.new_name;
                    this.exitFileNameReplace = this.i18nService.I18nReplace(
                        this.i18n.plugins_porting_message_analysis_center.exit.content,
                        { 0: data.data.old_name });
                    this.exitMask.Open();
                    this.isDuplicated = true;
                } else {
                    this.isShow = false;
                    this.showInfoBox(data, 'error', false);
                    this.isUploading = false;
                }
            }
            this.changeDetectorRef.markForCheck();
            this.changeDetectorRef.detectChanges();
        });
    }

    /**
     * 上传文件夹
     */
    toZipCode(choice: string) {
        if (this.intelliJFlagDef) {
            this.isUploadZip = false;
            this.upFileIntellij(choice);
        } else {
            this.exitMask.Close();
            this.isUploadZip = false;
            this.isUploadSuccess = false;
            this.isUploading = false;
            const zip = new JSZip();
            let inputDom: any;
            let fileList: any;
            if (choice === 'normal') {
                // file.files 是一个fileList对象 fileList里面是file对象
                inputDom = this.elementRef.nativeElement.querySelector('#filesUp');
                fileList = inputDom.files;
                this.uploadFolderFileList = Array.from(fileList);
            } else {
                fileList = this.uploadFolderFileList;
            }
            let size = 0;
            if (fileList[0].webkitRelativePath) {
                this.outfilepath = fileList[0].webkitRelativePath;
            } else {
                this.outfilepath = this.exitFileName;
            }
            const num = this.outfilepath.indexOf('/');
            this.outfilepath = this.outfilepath.substring(0, num);
            this.info.filename = this.outfilepath;
            if (this.utilsService.checkUploadFileNameValidity(this.info.filename)) {
                this.isShow = false;
                this.isUploading = false;
                this.showI18nInfoBox('plugins_porting_tips_fileNameIsValidity', 'error', false);
                return;
            }
            const files: any[] = [];
            for (const element of fileList) {
                size += element.size;
                const filepath = element.webkitRelativePath.replace(element.name, '');
                zip.folder(filepath).file(element.name, element);
                const file = [];
                file.push(element.path);
                file.push(element.name);
                file.push(filepath);
                files.push(file);
            }
            const sizeCount = size;
            size = size / 1024 / 1024;
            if (size > fileSize) {
                this.isShow = false;
                this.showI18nInfoBox('plugins_porting_message_fileExceedMaxSize', 'info', false);
                this.isUploading = false;
                return;
            }
            this.info.filesize = size.toFixed(1);
            let params: any;
            if (choice === 'save_as') {
                params = {
                    file_size: sizeCount,
                    file_name: this.exitFileName + '.zip',
                    need_unzip: 'true',
                    scan_type: '0',
                    choice
                };
                this.info.filename = this.exitFileName + '.zip';
            } else if (choice === 'override') {
                params = {
                    file_size: sizeCount,
                    file_name: this.oldName + '.zip',
                    need_unzip: 'true',
                    scan_type: '0',
                    choice
                };
                this.info.filename = this.oldName + '.zip';
            } else {
                params = {
                    file_size: sizeCount,
                    file_name: this.outfilepath + '.zip',
                    need_unzip: 'true',
                    scan_type: '0',
                    choice,
                };
            }
            this.uploadProgress = '0%';
            let filePath: any;
            if (choice === 'override') {
                filePath = this.oldName;
            } else {
                filePath = this.outfilepath;
            }
            this.vscodeService.post({ url: '/portadv/tasks/check_upload/', params }, (data: any) => {
                this.isShow = true;
                this.displayAreaMatch = false;
                if (data.status === STATUS.SUCCESS) {
                    const uploadMsg = {
                        cmd: 'uploadProcess',
                        data: {
                            msgID: MESSAGE_MAP.FILE_UPLOAD,
                            url: '/portadv/tasks/upload/',
                            folderUpload: 'true',
                            filePath: (choice === 'save_as') ? this.exitFileName : filePath,
                            fileList: files,
                            fileSize: sizeCount,
                            need_unzip: 'true',
                            autoPack: {
                                'scan-type': '0',
                                choice
                            },
                            uploadPrefix: this.i18n.plugins_porting_uploadPrefix_sourceCode
                        }
                    };
                    this.vscodeService.postMessage(uploadMsg, (resp: any) => {
                        this.isUploading = false;
                        if (resp.status === STATUS.SUCCESS) {
                            if (inputDom) {
                                inputDom.value = '';
                            }
                            // 文件回填
                            this.outfilepath = (choice === 'save_as') ? this.exitFileName : filePath;
                            this.contactPackPath(this.outfilepath);
                            this.isShow = false;
                            this.isCompress = false;
                            this.isUploadSuccess = true;
                            this.isCommit = false;
                            this.showI18nInfoBox('plugins_porting_message_folderSucess', 'info', false);
                        } else if (resp.realStatus === STATUS.MAXIMUM_TASK) { // 等待上传中
                            this.isUploading = true;
                            this.handleUploadWaiting(uploadMsg, resp);
                        } else if (resp.realStatus === STATUS.INSUFFICIENT_SPACE) {
                            this.utilsService.sendDiskAlertMessage();
                        } else if (resp === 'timeout') {
                            this.showI18nInfoBox('common_term_report_500', 'warn', false);
                            this.isCompress = false;
                        } else {
                            this.showInfoBox(resp, 'error', false);
                            this.inputItems.path.value = '';
                            this.isShow = false;
                            this.isCompress = false;
                        }
                        this.inputAreaMatch();
                    });
                } else if (data.realStatus === STATUS.INSUFFICIENT_SPACE) {
                    this.utilsService.sendDiskAlertMessage();
                    this.isUploading = false;
                } else {
                    if (data.data.new_name && data.data.suffix) {
                        this.exitFileName = data.data.new_name;
                        this.oldName = data.data.old_name;
                        this.confirmName.zip.value = data.data.new_name;
                        this.exitFileNameReplace = this.i18nService.I18nReplace(
                            this.i18n.plugins_porting_message_analysis_center.exit.content,
                            { 0: data.data.old_name });
                        this.exitMask.Open();
                    } else {
                        this.isShow = false;
                        inputDom.value = '';
                        this.showInfoBox(data, 'error', false);
                        this.isUploading = false;
                    }
                }
            });
            inputDom.value = '';
        }
    }

    /**
     * 替换、另存为
     */
    public uploadAgain(choice: string) {
        if (choice === 'override') {
            // 替换
            this.isUploadZip ? this.uploadFileCode(choice) : this.toZipCode(choice);
        } else {
            // 另存为
            this.exitMask.Close();
            this.saveasMask.Open();
        }
    }

    /**
     * 关闭上传
     */
    public closeMaskExit() {
        this.isDuplicated = false;
        this.isUploading = false;
        this.exitMask.Close();
    }

    /**
     * 另存为
     * @param choice 字符串
     */
    public saveAs(choice: string) {
        if (!this.confirmUploadZip.valid) {
            $('.saveAs-input')[0].focus();
            return;
        }
        this.saveasMask.Close();
        this.isUploadZip ? this.uploadFileCode(choice) : this.toZipCode(choice);
    }

    /**
     * 关闭另存为
     */
    public closeMaskSaveAs() {
        this.isDuplicated = false;
        this.isUploading = false;
        this.saveasMask.Close();
    }

    /**
     * 源码文件路径输入框键盘键被松开时事件
     */
    keyupAreaMatch() {
        if (((self as any).webviewSession || {}).getItem('isFirst') !== '1'
            && ((self as any).webviewSession || {}).getItem('isExpired') !== '1') {
            this.inputAreaMatch();
        }
    }

    /**
     * 源码文件路径输入框输入事件
     */
    inputAreaMatch() {
        if (((self as any).webviewSession || {}).getItem('isFirst') !== '1'
            && ((self as any).webviewSession || {}).getItem('isExpired') !== '1') {
            let path = this.inputItems.path.value;
            const lastIndex = this.inputItems.path.value.lastIndexOf(',');
            if (lastIndex) {
                path = this.inputItems.path.value.slice(lastIndex + 1, this.inputItems.path.value.length);
            }
            const params = { path: 'sourcecode/' + path };
            this.vscodeService.post({ url: '/pathmatch/', params }, (data: any) => {
                const arrBefore = this.inputItems.path.value.split(',');
                if (data) {
                    const arrAfter = data.pathlist;
                    this.arr_diff(arrBefore, arrAfter);
                    this.pathlist = arrAfter;
                }
                if (this.intelliJFlagDef) {
                    this.changeDetectorRef.markForCheck();
                    this.changeDetectorRef.detectChanges();
                }
            });
        }
    }

    /**
     * 处理跟目录下存放的源码文件数
     */
    arr_diff(arrA: any, arrB: any) {
        arrA.forEach((itemA: any) => {
            arrB.forEach((itemB: any, j: any) => {
                if (itemB === itemA) {
                    arrB.splice(j, 1);
                    j -= 1;
                }
            });
        });
        return arrB;
    }

    /**
     * 源码文件路径输入框focus事件
     */
    areaMatchDis() {
        this.displayAreaMatch = true;
        this.inputAreaMatch();
    }

    /**
     * 源码文件路径输入框blur事件
     */
    blurAreaMatch() {
        this.displayAreaMatch = false;
        if (this.intelliJFlagDef) {
            this.changeDetectorRef.markForCheck();
            this.changeDetectorRef.detectChanges();
        }
    }

    /**
     * 弹出框选择路径事件
     */
    clickAreaMatch(value: any) {
        const lastIndex = this.inputItems.path.value.lastIndexOf(',');
        if (!this.multipleInput) {
            this.inputItems.path.value = value;
        } else {
            if (lastIndex) {
                this.inputItems.path.value = this.inputItems.path.value.slice(0, lastIndex + 1) + value + ',';
            } else {
                this.inputItems.path.value = value + ',';
            }
        }
        this.displayAreaMatch = false;
        this.isCommit = false;
        this.pathlist = [];
        if (this.intelliJFlagDef) {
            this.changeDetectorRef.markForCheck();
            this.changeDetectorRef.detectChanges();
        }
    }

    /**
     * 显示删除页面
     * @param value 删除文件夹名称
     */
    public isDeleteAreaMatch(value: any) {
        this.deleteValue = value;
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

    /**
     * 确认删除文件
     */
    public deleteAreaMatch() {
        const option = {
            url: '/portadv/tasks/delete_file/',
            params: {
                file_name: this.deleteValue,
                path: 'sourcecode',
            }
        };
        this.vscodeService.delete(option, (resp: any) => {
            if (resp.status === STATUS.SUCCESS) {
                this.inputAreaMatch();
            }
            const type = resp.status === 0 ? 'info' : 'error';
            this.showInfoBox(resp, type, false);
        });
    }

    openUrl(url: string) {
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
}
