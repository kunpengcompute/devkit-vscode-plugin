import {
    Component, OnInit, ElementRef, ViewChild, AfterViewChecked, ChangeDetectorRef
} from '@angular/core';
import { TiMessageService, TiSelectComponent } from '@cloud/tiny3';
import { TiValidationConfig, TiModalService } from '@cloud/tiny3';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { TiValidators } from '@cloud/tiny3';
import {
    MytipService, I18nService, MessageService, COLOR_THEME, VscodeService, UtilsService,
    ACCEPT_TYPE, UploadService, CustomValidators
} from '../service';
import { HyMiniModalService } from 'hyper';
import { DEFAULT_OS, fileSize } from '../global/globalData';

/**
 * 消息返回状态
 */
const enum STATUS {
    SUCCESS = 0,
    FAIL = 1,
    INSUFFICIENT_SPACE = '0x010611',
    MAXIMUM_TASK = '0x010125', // 文件上传任务已达到上限
    NULL = '0x0c0318',
    NOPERMISSION = '0x0c0317' // 扫描文件或文件夹无权限
}
export const enum LANGUAGE_TYPE {
    // ZH表示界面语言为中文
    ZH = 0,
    // EH表示界面语言为英文
    EN = 1,
}
const enum MESSAGE_MAP {
    SHOW_PROGRESS = 'getStatus',
    FILE_SIZE_EXCEEED = 'fileSizeExceed',
    FILE_UPLOAD = 'uploadFile',
    PROCESS_FAILED = 'processFailed'
}

@Component({
    selector: 'app-migration-appraise',
    templateUrl: './migration-appraise.component.html',
    styleUrls: ['./migration-appraise.component.scss']
})
export class MigrationAppraiseComponent implements OnInit, AfterViewChecked {
    private static HUMAN_RADIX = 10;
    @ViewChild('exitmask', { static: false }) exitMask: { Close: () => void; Open: () => void; };
    @ViewChild('saveasmask', { static: false }) saveasMask: { Close: () => void; Open: () => void; };
    @ViewChild('uploadConfirmTip', { static: false }) uploadConfirmTip: { Close: () => void; Open: () => void; };
    @ViewChild('firstLogin', { static: false }) firstLogin: any;
    @ViewChild('aarch64Modal', { static: false }) aarch64Modal: any;
    @ViewChild('aboutmore', { static: false }) aboutMore: any;

    constructor(
        private route: ActivatedRoute,
        public timessage: TiMessageService,
        private elementRef: ElementRef,
        public router: Router,
        public fb: FormBuilder,
        public mytip: MytipService,
        private miniModalServe: HyMiniModalService,
        public i18nService: I18nService,
        private tiModal: TiModalService,
        private msgService: MessageService,
        public vscodeService: VscodeService,
        public utilsService: UtilsService,
        private changeDetectorRef: ChangeDetectorRef,
        private uploadService: UploadService,
    ) {
        this.i18n = this.i18nService.I18n();
        // 监听主题变化事件
        this.vscodeService.regVscodeMsgHandler('colorTheme', (msg: any) => {
            this.currentTheme = msg.colorTheme;
            this.changeDetectorRef.markForCheck();
            this.changeDetectorRef.detectChanges();
        });
    }
    public accrptType: string; // 压缩包上传支持类型
    public file: any;  // 上传的文件
    // 报告状态：2：已扫描；未查看
    public REPORT_STATUS_UNREAD = 2;

    // 报告状态：0: 未扫描分析
    public REPORT_STATUS_UNSCAN = 0;
    public softRadioList: Array<{ value: string; key: string }> = [
        {
            value: 'Uploaded installation packages',
            key: 'softPackpath'
        }, {
            value: 'Upload the installation package from the local host',
            key: 'softPackUpload'
        }
    ];
    public srcRadioList: Array<{ value: string; key: string }> = [
        {
            value: 'Uploaded source code',
            key: 'srcPackpath'
        }, {
            value: 'Upload source code from the local host',
            key: 'srcPackUpload'
        }
    ];
    public fileTypeList: Array<{ value: string; key: string }> = [
        {
            value: 'Directory',
            key: 'directory'
        }, {
            value: 'Compressed package',
            key: 'compressed'
        }
    ];
    public filenameLength: any;
    public pathLength: any;
    public softwarePackagePathLabel: any;
    public softPackagePathUploadLabel: any;
    public isSoftPackUpload = 'softPackpath';
    public isSrcPackUpload = 'srcPackpath';
    public isUploadDirectory = 'directory';
    public dangerFlag = false;
    public safeFlag = false;
    public toomany = '';
    public addBox = false;
    public needCodeType: any;
    public addNameValue = '';
    public nameReg = new RegExp(/^[a-zA-Z][a-zA-Z0-9_-]{5,31}$/);
    public search: any;
    public userId: string;
    public userPath = `/opt/portadv/${((self as any).webviewSession || {}).getItem('username')}/package/`;
    public inputPrompt: string;
    public inputPrompt1: string;
    public inputPrompt2: string;
    public expired: string;
    public validation: TiValidationConfig = {
        type: 'blur',
        errorMessage: {
            regExp: '',
            required: ''
        }
    };
    public validationChange: TiValidationConfig = {
        type: 'blur',
        errorMessage: {
            regExp: '',
            required: ''
        }
    };
    public isMust: FormGroup;
    public homeContent: any = {};
    public isLoginRouter = false;
    public intellijFlag = false;
    isDuplicated = false;
    uploadFilePath: string;
    public isHomePage = true;
    public isFirst = true;
    public leftContainerWidth: number;
    public i18n: any;
    public needFlag = false;
    public lightTheme = false;
    public sampleBtnTip = '';
    public isCreating = false;
    public currLang: any;

    public currentTheme = COLOR_THEME.Dark;
    // proting start
    public generateBtnDisabled = true;

    public reportStatus: any;
    public reportDetailData: any; // 获取下载时返回的数据详情


    public inputItems: any;
    // 获取首页数据
    public form1 = false;
    public form2 = false;

    public argumentList = ['package', 'path', 'softwareCode'];
    public depArgs: any = {
        package: {
            title: 'Analyze Software Installation Package',
            label: 'Installation Package Path',
            value: []
        },
        path: {
            title: 'Analyze Software Installation Path',
            label: 'Software Installation Path',
            value: []
        },

        softwareCode: {
            item1Arr: ['source_code_path', 'compile_command', 'construct_tool'],
            item2Arr: ['compiler_version', 'target_os', 'target_system_kernel_version'],
            title: 'Analyze Software Source Code',
            item1: {
                source_code_path: {
                    label: '',
                    value: ''
                },
                compile_command: {
                    label: '',
                    value: ''
                },
                construct_tool: {
                    label: '',
                    value: ''
                }
            },
            item2: {
                compiler_version: {
                    label: '',
                    value: ''
                },
                target_os: {
                    label: '',
                    value: ''
                },
                target_system_kernel_version: {
                    label: '',
                    value: ''
                }
            }
        }
    };
    public scanInfo: any = {
        item1: {
            package: {
                label: '',
                value: []
            },
            software: {
                label: '',
                value: []
            },
            code: {
                label: '',
                value: []
            }
        },
        item2: {
            compiler: {
                label: '',
                value: ''
            },
            tool: {
                label: '',
                value: ''
            },
            command: {
                label: '',
                value: ''
            }
        }
    };
    public msg: string;
    public isShowMsg = false;
    public isUploading = false;
    public isSrcUploading = false;
    public isAnalyzing = false;
    public cmakeNeedTrans: number;
    public asNeedTrans: number;
    public asmFileLines: number;
    public asmLines: number;
    public makefileNeedTrans: number;
    public automakeNeedTrans: number;
    public makefileTotal: number;
    public makefileLines: number;
    public soFilesNeed = 0;
    public soFilesTotal = 0;
    public scanCTotal = 0;
    public scanCNeedTrans = 0;
    public cLines = 0;
    public humanBudget = 0;

    public uploadPackFile: any;
    public uploadFolderFileList: any;
    public exitFileName = '';
    public overrideFileName = '';
    public exitFileNameReplace = '';
    public exitFileNameCode = '';
    public exitFileNameReplaceCode = '';
    public fileNameDelete = '';
    public suffix = '';
    public suffixCode = '';
    public deleteValue = '';
    public deleteValueCode = '';
    public isDeletePack = false;
    public confirmUploadZip: any;
    public isUploadZip = false;
    public isUploadPack = false;
    public uploadZipFile: any;
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

    public scanItems = ['soFile', 'cFile', 'lines'];
    public isOpen = false;
    public scanItemsObj: any = {
        soFile: {
            label: '',
            icon: './assets/img/home/file.png',
            content: ``,
            files: [],
            hasDetail: false,
            isOpen: false
        },
        cFile: {
            label: '',
            icon: './assets/img/home/source.png',
            content: '',
            files: [],
            hasDetail: false,
            isOpen: false
        },
        lines: {
            label: '',
            icon: './assets/img/home/trans.png',
            content: '',
            hasDetail: false,
            isOpen: false
        }
    };
    public showHumanFlag = false;
    // 计算人力
    public human: any = 0;

    public reportTotalNum = 0;
    public reportLists: any;
    public HisoricalReportList: Array<any> = []; // 历史报告数据列表

    public packpath = '';
    public instpath = '';
    public srcpath = '';
    public compiler: any = 0;
    public tool: any = 0;
    public cmd = '';
    public tos: any = 0;
    public tk: any = 0;
    public reportId: any;
    public failFlag = false;
    public isX86Evn = true;
    public isX86EvnTipStr = '';
    public failinfo = {
        fail: '',
        tip: ''
    };
    // 表单整体验证
    forminst: FormGroup;
    formsrc: FormGroup;
    public currentWidth: number;

    public humanStandard = 0;

    hoverFlagCode = false;

    hoverFlag = false;
    public info = {
        filename: '',
        filesize: '',
        filePath: ''
    };
    isShow = false;
    public uploadProgress: any;
    public successTit: any;
    isUploadSuccess = false;
    public outfilepath: any;
    public isCompress = false;
    public isHalf = false;
    public singleSys: any = [];
    public areaMatchHeight: number;

    /**
     * 分析软件安装包：输入软件包所在的相对路径时，路径/文件输入支持自动匹配，路径/文件输入支持自动匹配
     */
    public pathlist: any = [];  // 已上传的软件包列表
    public displayAreaMatch = false;
    public multipleInput = true;

    /**
     * 分析源码：输入软件包所在的相对路径时，路径/文件输入支持自动匹配，路径/文件输入支持自动匹配
     */
    public pathlistCode: any = [];
    public displayAreaMatchCode = false;
    public multipleInputCode = true;

    public hisTaskStatus = {
        // 报告数量过多
        overdoingState: 2,
        // 超过最大值，不能新建任务
        maxState: 3
    };

    public uploadFileChoice: any;
    public pluginUrlCfg: any = {};

    public currSelectOS: any;  // 保存当前选择的OS
    public showLoading = false;  // 是否显示动画
    public oldName: string;
    /**
     * 获取报告状态
     */
    getReportStatus() {
        // 登录用户还有历史运行任务，去显示进度界面, 登录用户没有运行任务，有报告未查看，先去success界面再去查看报告
        this.vscodeService.get({ url: '/task/progress/?task_type=7' }, (data: any) => {
            if (data.status === 0) {
                if (data.data.task_name) {
                    this.scanProcess(data.data.task_name);
                }
            }
        });
    }

    /**
     * 操作系统修改响应
     * @param data 操作系统信息
     */
    public osSelectChange(data: any) {
        this.inputItems.kernelVersion.selected.label = data.kernel_default;
    }

    /**
     * 命令修改响应
     * @param data 命令信息
     */
    public commandChange(data: any) {
        const inputDom = document.getElementById('command-input');
        if (null === inputDom || undefined === inputDom) {
            return;
        }
        if (data.label === 'automake') {
            this.inputItems.command.value = 'make';
            inputDom.setAttribute('disabled', 'disabled');
        } else {
            this.inputItems.command.value = data.label;
            inputDom.removeAttribute('disabled');
        }
    }

    /**
     * 获取操作系统信息
     */
    async getSystemInfo(isFirst: boolean, selectComp?: TiSelectComponent) {
        this.showLoading = true;
        this.vscodeService.get({ url: '/portadv/tasks/systeminfo/' }, (resp: any) => {
            if (resp && resp.data) {
                this.inputItems.linuxOS.options = [];
                this.inputItems.kernelVersion.options = [];
                if (resp.status === 0) {
                    resp.data.os_system_list.forEach((item: any, idx: any) => {
                        this.inputItems.linuxOS.options.push({
                            label: item.os_system,
                            id: idx,
                            kernel_default: item.kernel_default,
                            gcc_default: item.gcc_default
                        });
                    });
                    this.inputItems.linuxOS.options.sort(this.sortByLabel('label'));
                    let OSDefault: any;
                    if (isFirst || this.inputItems.linuxOS.selected.label === '') {  // 进入页面首次请求显示默认操作系统
                        OSDefault = this.inputItems.linuxOS.options
                          .find((os: any) => os.label.replace(/\s*/g, '') === DEFAULT_OS);
                    } else {  // 点击下拉框发送的请求，显示上一次选择的目标系统
                        this.currSelectOS = { ...this.inputItems.linuxOS.selected };  // 保存之前选择的目标系统
                        OSDefault = this.inputItems.linuxOS.options.find((os: any) => {
                            return os.label === this.currSelectOS.label;
                        });
                    }
                    if (OSDefault) {
                        this.inputItems.linuxOS.selected = OSDefault;
                        this.inputItems.kernelVersion.options.push({
                            label: OSDefault.kernel_default,
                            id: 0
                        });
                    } else {
                        this.inputItems.linuxOS.selected = this.inputItems.linuxOS.options[0];
                        this.inputItems.kernelVersion.options.push({
                            label: this.inputItems.linuxOS.options[0].kernel_default,
                            id: 0
                        });
                    }
                    this.inputItems.kernelVersion.selected.label = this.inputItems.kernelVersion.options[0].label;
                } else if (resp.realStatus === '0x050110') {  // 获取依赖字典失败
                    this.showMessageByLang(resp, 'error');
                    this.inputItems.linuxOS.selected = {
                        label: '',
                        id: 0
                    };
                    this.inputItems.kernelVersion.selected.label = '';
                }
            }
            this.showLoading = false;

            if (this.intellijFlag) {
                this.openOsSelect(selectComp);
            }
        });

        if (this.intellijFlag) {
            while (this.inputItems.linuxOS.options.length === 0) {
                await this.utilsService.sleep(10);
            }
        }
    }

    /**
     * 鼠标选中下拉框，获取目标操作系统
     */
    public onBeforeOpen(selectComp: TiSelectComponent): void {

        // 获取数据
        this.getSystemInfo(false, selectComp);

        if (!this.intellijFlag) {
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
     * 排序
     * @param property 排序的项
     */
    public sortByLabel(property: string) {
        return (a: any, b: any) => {
            const lableA = a[property].toUpperCase();
            const lableB = b[property].toUpperCase();
            if (lableA < lableB) {
                return -1;
            } else if (lableA > lableB) {
                return 1;
            } else {
                return 0;
            }
        };
    }
    /**
     * 组件初始化
     */
    ngOnInit() {
        if (document.body.className.indexOf('vscode-light') > -1) {
            this.currentTheme = COLOR_THEME.Light;
        }
        // 获取全局url配置数据
        this.vscodeService.postMessage({ cmd: 'readUrlConfig' }, (resp: any) => {
            this.pluginUrlCfg = resp;
        });
        this.accrptType = ACCEPT_TYPE.softwareMigration;
        this.route.queryParams.subscribe((data) => {
            this.isLoginRouter = data.isLoginRouter;
            this.intellijFlag = data.intelliJFlag;
            if (data.currentTheme) {
                this.currentTheme = Number(data.currentTheme);
            }
        });
        // 加载源码扫描任务状态
        if (this.isLoginRouter && !this.intellijFlag) {
          this.getTaskUndone();
        }
        this.msgService.getMessage().subscribe(msg => {
            if (msg.value && msg.type === 'isreportChange') {
                this.getHistoryReportList();
            }
        });
        this.needCodeType = this.i18n.common_term_needCodeType;
        this.expired = ((self as any).webviewSession || {}).getItem('isExpired');
        this.currLang = ((self as any).webviewSession || {}).getItem('language');

        this.homeContent = {
            packpath: {
                title: this.i18n.plugins_port_term_analysis_package_label,
                tip: this.i18n.common_term_analysis_package_tip
            },
            instpath: {
                title: this.i18n.common_term_analysis_path_label,
                tip: this.i18n.common_term_analysis_installed_tip
            },
            srcpath: {
                title: this.i18n.common_term_analysis_softwareCode_label,
                tip: this.i18n.common_term_analysis_softwareCode_tip
            }
        };
        this.scanItems.forEach(scanItem => {
            this.scanItemsObj[scanItem].label = this.i18n[`common_term_result_${scanItem}`];
        });
        this.scanInfo.item1.package.lable = this.i18n.common_term_ipt_label.package;
        this.scanInfo.item1.software.label = this.i18n.common_term_ipt_label.path;
        this.scanInfo.item1.code.label = this.i18n.common_term_ipt_label.source_code_path;
        this.scanInfo.item2.compiler.label = this.i18n.common_term_ipt_label.compiler_version;
        this.scanInfo.item2.tool.label = this.i18n.common_term_ipt_label.construct_tool;
        this.scanInfo.item2.command.label = this.i18n.common_term_ipt_label.compile_command;

        this.initInputItems();
        if (((self as any).webviewSession || {}).getItem('isFirst') !== '1') {
            this.vscodeService.get({ url: '/customize/' }, (resp: any) => {
                if (resp.status === 0) {
                    this.userPath =
                        `${resp.data.customize_path}/portadv/${((self as any).webviewSession || {})
                          .getItem('username')}/package/`;
                }
            });
            const option = {
                url: '/portadv/tasks/platform/'
            };
            this.vscodeService.get(option, (data: any) => {
                this.isX86Evn = (data.status === 0);
                this.isX86EvnTipStr = this.i18n.plugins_porting_message_isX86Evn_info;
            });
            this.utilsService.queryDiskState();
            this.getSystemInfo(true);
            this.getHistoryReportList();
            this.inputAreaMatch();
        }
        this.argumentList.forEach(arg => {
            this.depArgs[arg].title = this.i18n[`common_term_analysis_${arg}_label`];
            if (arg !== 'softwareCode') {
                this.depArgs[arg].label = this.i18n.common_term_ipt_label[arg];
            }
            if (arg === 'softwareCode') {
                this.depArgs[arg].item1Arr.forEach((item1: any) => {
                    this.depArgs[arg].item1[item1].label = this.i18n.common_term_ipt_label[item1];
                });
                this.depArgs[arg].item2Arr.forEach((item2: any) => {
                    this.depArgs[arg].item2[item2].label = this.i18n.common_term_ipt_label[item2];
                });
            }
        });

        this.userId = ((self as any).webviewSession || {}).getItem('loginId');
        this.softwarePackagePathLabel = this.i18n.plugins_porting_label_cFile_path;
        this.softPackagePathUploadLabel = this.i18n.plugins_porting_label_softPackPath;
        this.inputPrompt = this.i18nService.I18nReplace(this.i18n.plugins_porting_tips_remoteSoftPack,
            { 0: this.userPath + 'example/' || 0 });
        this.inputPrompt1 = this.i18n.plugins_porting_tips_localSoftPack;
        this.inputPrompt2 = this.i18n.plugins_porting_tip_softPackInstallPath;
        this.softRadioList[0] = {
            value: this.i18n.plugins_porting_uploaded_package,
            key: 'softPackpath'
        };
        this.softRadioList[1] = {
            value: this.i18n.plugins_porting_local_upload,
            key: 'softPackUpload'
        };
        this.srcRadioList[0] = {
            value: this.i18n.plugins_porting_title_remoteSourceCode,
            key: 'srcPackpath'
        };
        this.srcRadioList[1] = {
            value: this.i18n.plugins_porting_title_localSourceCode,
            key: 'srcPackUpload'
        };
        this.fileTypeList[0] = {
            value: this.i18n.common_term_upload_directory,
            key: 'directory'
        };
        this.fileTypeList[1] = {
            value: this.i18n.common_term_upload_compressed,
            key: 'compressed'
        };
        this.forminst = new FormGroup({
            instpath: new FormControl('', [CustomValidators.isRequired(this.i18n)])
        });
        this.formsrc = new FormGroup({
            srcpath: new FormControl('', []),
            command: new FormControl('', [CustomValidators.commandControl(this.i18n, this)]),
            version: new FormControl('', [CustomValidators.isRequired(this.i18n)]),
            versionFortran: new FormControl('', [CustomValidators.isRequired(this.i18n)]),
            tool: new FormControl('', [CustomValidators.isRequired(this.i18n)]),
            linuxOS: new FormControl('', [CustomValidators.isRequired(this.i18n)]),
            kernelVersion: new FormControl('', [CustomValidators.isRequired(this.i18n)])
        });
        this.filenameLength = new FormControl('',
          [CustomValidators.multifilenameLength(this.i18n), CustomValidators.filenameCheck(this.i18n)]);
        this.pathLength = new FormControl('', [CustomValidators.multipathLength(this.i18n)]);
        this.confirmUploadZip = new FormControl('', [CustomValidators.confirmNewName(this.i18n)]);
        this.confirmName = {
            zip: {
                label: this.i18n.plugins_porting_message_analysis_center.exit.file_name,
                value: '',
                required: true
            },
            folder: {
                label: this.i18n.plugins_porting_message_analysis_center.exit.file_name,
                value: '',
                required: true
            }
        };
    }

    private initInputItems() {
        this.inputItems = {
            // 表单数据
            packpath: {
                label: '',
                value: '',
                required: true
            },
            instpath: {
                label: '',
                value: '',
                required: true
            },
            srcpath: {
                label: '',
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
                required: false
            },
            command: {
                label: '',
                value: '',
                required: true
            },
            linuxOS: {
                label: '',
                selected: {
                    label: '',
                    id: 0
                },
                options: [],
                required: false
            },
            version: {
                label: '',
                selected: {
                    label: '',
                    id: 0
                },
                options: [],
                required: false
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
                    id: 0
                },
                options: [],
                required: false
            }
        };
        this.inputItems.packpath.label = this.i18n.common_term_ipt_label.package;
        this.inputItems.instpath.label = this.i18n.plugins_porting_label_softPackInstallPath;
        this.inputItems.srcpath.label = this.i18n.common_term_ipt_label.source_code_path;
        this.inputItems.linuxOS.label = this.i18n.common_term_ipt_label.target_os;
        this.inputItems.kernelVersion.label = this.i18n.common_term_ipt_label.target_system_kernel_version;
    }

    public onNgSoftRadioModelChange(radioType: string): void {
        this.inputItems.packpath.value = '';
        if (radioType === 'softPackpath') {
            this.inputAreaMatch();  // 获取已上传软件列表
        }
    }

    public onNgSrcRadioModelChange(model: boolean): void {
        this.inputItems.srcpath.value = '';
    }

    ComputedHuman() {
        this.human = Number(this.cLines / 500 + this.asmLines / 250);
        let final = 0;
        if (this.human) {
            let part1 = this.human - parseInt(this.human, MigrationAppraiseComponent.HUMAN_RADIX);
            if (this.human > 1) {
                if (part1 <= 0.1 && part1 > 0) {
                    part1 = 0.1;
                    final = parseInt(this.human, MigrationAppraiseComponent.HUMAN_RADIX) + part1;
                } else {
                    final = this.human.toFixed(1);
                }
            } else {
                if (this.human <= 0.1 && part1 > 0) {
                    final = 0.1;
                } else {
                    final = this.human.toFixed(1);
                }
            }
        }
        return final;
    }
    getHistoryReportList() {
        this.HisoricalReportList = [];
        const params = {
            user_id: this.userId
        };
        this.vscodeService.get({ url: '/portadv/binary/' }, (data: any) => {
            if (data.status === 0) {
                this.toomany = '';
                this.dangerFlag = false;
                this.safeFlag = false;
                if (data.data.histasknumstatus === this.hisTaskStatus.overdoingState) {
                    this.safeFlag = true;
                    this.showInfoBoxCmd({
                        info: this.i18n.common_term_report_safe_tit,
                        infochinese: this.i18n.common_term_report_safe_tit
                    }, 'info', false);
                } else if (data.data.histasknumstatus === this.hisTaskStatus.maxState) {
                    this.toomany = this.i18n.common_term_report_danger_tit;
                    this.dangerFlag = true;
                    this.showInfoBoxCmd({
                        info: this.i18n.common_term_report_danger_tit,
                        infochinese: this.i18n.common_term_report_danger_tit
                    }, 'error', false);
                }
                this.reportTotalNum = data.data.totalcount;
                if (data.data.tasklist.length > 50) {
                    const that = this;
                    this.showInfoBox(this.i18n.common_term_history_list_overflow_tip
                      + this.i18n.common_term_history_list_overflow_tip2, 'warn');
                    if (that.isLoginRouter) {
                        that.getReportStatus();
                        that.isLoginRouter = false;
                    }
                } else {
                    if (this.isLoginRouter) {
                        this.getReportStatus();
                        this.isLoginRouter = false;
                    }
                }
                const historyList = data.data.tasklist;
                this.reportLists = historyList;
                for (let i = 0; i < historyList.length; i++) {
                    this.HisoricalReportList.push({
                        created: this.formatCreatedId(historyList[i].id),
                        showTip: false,
                        id: this.userId,
                        report_name: data.data.tasklist[i].id
                    });
                }
            }
        });
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

    showErrMsg(data: any) {
        if (data.status !== 0) {
            this.isShowMsg = true;
            if (((self as any).webviewSession || {}).getItem('language') === 'zh-cn') {
                this.msg = data.infochinese;
            } else {
                this.msg = data.info;
            }
        }
    }

    // 发送消息给vscode, 右下角弹出提醒框
    showMessageByLang(data: any, type: any) {
        if (this.currLang === 'zh-cn') {
            this.showInfoBox(data.infochinese, type);
        } else {
            this.showInfoBox(data.info, type);
        }
    }
    /**
     * 发送消息给vscode, 右下角弹出提醒框
     */
    showInfoBoxCmd(tip: any, type: any, confirm: any) {
        let info = '';
        const languageType: any = I18nService.getLang();
        if (languageType) {
            info = (languageType === LANGUAGE_TYPE.ZH ? tip.infochinese : tip.info);
        } else {
            info = tip.infochinese;
        }
        const message = {
            cmd: 'showInfoBox',
            data: {
                info,
                type,
                confirm
            }
        };
        this.vscodeService.postMessage(message, null);
    }

    /**
     * 发送消息给vscode, 右下角弹出提醒框
     */
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

    toReportDetail(reportId: any) {
        const message = {
            cmd: 'updateScanHistoryOrReport',
            data: {
                reportId,
                loginId: this.userId
            }
        };
        // 创建task成功，发送消息给vscode,弹出刷新进度条框
        this.vscodeService.postMessage(message, null);
    }

    scanProcess(reportId: any) {
        const message = {
            cmd: 'scanProcess',
            data: {
                taskId: reportId,
                loginId: this.userId
            }
        };
        // 创建task成功，发送消息给vscode,弹出刷新进度条框
        this.vscodeService.postMessage(message, (data: any) => {
            this.isAnalyzing = false;
            if (this.intellijFlag) {
                this.changeDetectorRef.markForCheck();
                this.changeDetectorRef.detectChanges();
            }
        });
    }
    /**
     * 表单提交前的提交条件检查
     */
     checkAnalyzeForm(){
        if (this.form1 && !this.pathlist.length && !this.inputItems.packpath.value) {
            const info = this.i18n.common_term_package_path_empty;
            this.showInfoBox(info, 'error');
        } else if (this.form2 && !this.inputItems.instpath.value){
            this.elementRef.nativeElement.querySelector(`#x86InstallPath`).focus();
            this.elementRef.nativeElement.querySelector(`#x86InstallPath`).blur();
            return;
        } else if (this.form1 && !this.filenameLength.valid) {
            return;
        } else if (this.form2 && !this.pathLength.valid) {
            return;
        } else {
            this.createReport();
        }
    }

    createReport() {
        this.failFlag = false;
        if (this.form1) {  // 勾选分析软件包
            let inputPath = this.inputItems.packpath.value.trim();
            if (!inputPath) {  // 未选择已上传软件包
                if (this.isSoftPackUpload === 'softPackpath') {  // 勾选已上传的软件包
                    this.packpath = this.userPath;  // 默认路径
                }
            } else if (inputPath.search(',') === -1) { // form2只有一条路径
                inputPath = inputPath.replace(/(^\s*)|(\s*$)/g, '').replace(/[\r\n]/g, '');
                this.packpath = `${this.userPath}${inputPath}`;
            } else { // form2有多条路径
                const packpathArr = inputPath.split(',');
                packpathArr[0] = packpathArr[0].replace(/(^\s*)|(\s*$)/g, '').replace(/[\r\n]/g, '');
                this.packpath = `${this.userPath}` + `${packpathArr[0]}`;
                for (let i = 1; i <= packpathArr.length; i++) {
                    if (packpathArr[i]) {
                        packpathArr[i] = packpathArr[i].replace(/(^\s*)|(\s*$)/g, '').replace(/[\r\n]/g, '');
                        this.packpath += `,${this.userPath}` + `${packpathArr[i]}`;
                    }
                }
            }
        }
        if (this.form2) {  // 分析已安装软件（仅x86平台）
            this.instpath = this.inputItems.instpath.value.replace(/(^\s*)|(\s*$)/g, '').replace(/[\r\n]/g, '');
        }

        const params = {
            packpath: this.packpath,
            instpath: this.instpath,
            targetos: this.inputItems.linuxOS.selected.label,
            targetkernel: this.inputItems.kernelVersion.selected.label
        };

        this.isCreating = false;
        const maxReportNum = 50;
        if (this.HisoricalReportList.length >= maxReportNum) {
            this.showInfoBox(this.i18n.common_term_history_list_overflow_tip
              + this.i18n.common_term_history_list_overflow_tip2, 'warn');
        } else {
            this.createScanTask(params);
        }
    }

    createScanTask(params: any) {
        const option = {
            url: '/portadv/binary/',
            params
        };
        this.isAnalyzing = true;
        this.vscodeService.post(option, (data: any) => {
            if (data) {
                if (data.status === STATUS.SUCCESS) {
                    this.reportId = data.data.id;
                    this.scanProcess(data.data.id);
                } else if (data.realStatus === STATUS.INSUFFICIENT_SPACE) {
                    this.isAnalyzing = false;
                    this.utilsService.sendDiskAlertMessage();
                } else if (data.realStatus === STATUS.NULL) {
                    this.isAnalyzing = false;
                    this.failFlag = true;
                    this.showInfoBoxCmd({
                        info: data.info,
                        infochinese: data.infochinese
                    }, 'warn', false);
                } else {
                    this.isAnalyzing = false;
                    this.inputItems.packpath.value = '';
                    this.inputItems.instpath.value = '';
                    this.inputItems.srcpath.value = '';
                    this.failFlag = true;
                    // 无权限操作时，提示语追加前往FAQ
                    if (data.realStatus === STATUS.NOPERMISSION) {
                      const message = {
                        cmd: 'noPermissionFaqTip',
                          data: {
                            res: data,
                          }
                        };
                      this.vscodeService.postMessage(message, null);
                    } else {
                      this.showMessageByLang(data, 'error');
                    }
                }
                this.packpath = '';
                this.instpath = '';
                this.srcpath = '';
                this.compiler = 0;
                this.tool = 0;
                this.cmd = '';
                this.tos = 0;
                this.tk = 0;
            } else {
                this.isAnalyzing = false;
            }
            if (this.intellijFlag) {
                this.changeDetectorRef.markForCheck();
                this.changeDetectorRef.detectChanges();
            }
        });
    }

    // 加载框
    hideCreating(data: any) {
        if (data.error) {
            this.isCreating = false;
            return;
        }
        if (data && data.id) {
            this.isCreating = false;
            this.getHistoryReportList();
        }
    }

    // 返回的id数据处理20190822114355 => 2019/08/22 11:43:55
    formatCreatedId(data: any) {
        const years = data.slice(0, 4);
        const months = data.slice(4, 6);
        const days = data.slice(6, 8);
        const hours = data.slice(8, 10);
        const minutes = data.slice(10, 12);
        const seconds = data.slice(12, 14);
        return `${years}/${months}/${days} ${hours}:${minutes}:${seconds}`;
    }
    // 是否首次登陆


    ngAfterViewChecked(): void {
        const leftContainer = this.elementRef.nativeElement.querySelector('.project-left');
        this.currentWidth = leftContainer.offsetHeight;
        if (this.leftContainerWidth && this.currentWidth !== this.leftContainerWidth) {
            setTimeout(() => {
                this.leftContainerWidth = this.currentWidth = leftContainer.offsetHeight;
            }, 0);
        }
    }
    chooseLangType(data: any) {
        if (data.status === 0) {
            if (((self as any).webviewSession || {}).getItem('language') === 'zh-cn') {
                this.mytip.alertInfo({ type: 'success', content: data.info_chinese, time: 5000 });
            } else {
                this.mytip.alertInfo({ type: 'success', content: data.info, time: 5000 });
            }
        } else {
            if (((self as any).webviewSession || {}).getItem('language') === 'zh-cn') {
                this.mytip.alertInfo({ type: 'warn', content: data.info_chinese, time: 10000 });
            } else {
                this.mytip.alertInfo({ type: 'warn', content: data.info, time: 10000 });
            }
        }
    }

    /**
     * 分析软件安装包：输入软件包所在的相对路径时，路径/文件输入支持自动匹配，路径/文件输入支持自动匹配
     * @method inputAreaMatch();areaMatchDis();clickAreaMatch();
     */
    keyupAreaMatch() {
        this.inputAreaMatch();
    }
    inputAreaMatch() {
        this.pathlist = [];
        let path = this.inputItems.packpath.value;
        const lastIndex = this.inputItems.packpath.value.lastIndexOf(',');
        if (lastIndex) {
            path = this.inputItems.packpath.value.slice(lastIndex + 1, this.inputItems.packpath.value.length);
        }
        const params = { path: 'package/' + path };
        this.vscodeService.post({ url: '/pathmatch/', params }, (data: any) => {
            const arrBefore = this.inputItems.packpath.value.split(',');
            if (data) {
                const arrAfter = data.pathlist;
                this.arr_diff(arrBefore, arrAfter);
                this.pathlist = arrAfter;
            }
            if (this.intellijFlag) {
                this.changeDetectorRef.markForCheck();
                this.changeDetectorRef.detectChanges();
            }
        });
    }
    arr_diff(arrA: any[], arrB: any[]) {
        arrA.forEach(itemA => {
            arrB.forEach((itemB, j) => {
                if (itemB === itemA) {
                    arrB.splice(j, 1);
                    j -= 1;
                }
            });
        });
        return arrB;
    }
    areaMatchDis() {
        this.displayAreaMatch = true;
        this.inputAreaMatch();
    }
    blurAreaMatch() {
        this.displayAreaMatch = false;
    }
    clickAreaMatch(value: any) {
        this.contactPackPath(value);
        this.displayAreaMatch = false;
    }
    contactPackPath(value: any) {
        const lastIndex = this.inputItems.packpath.value.lastIndexOf(',');
        if (!this.multipleInput) {
            this.inputItems.packpath.value = value;
        } else {
            const arr = this.inputItems.packpath.value.split(',');
            if (!arr.includes(value)) {
                if (lastIndex) {
                    this.inputItems.packpath.value = this.inputItems.packpath.value
                      .slice(0, lastIndex + 1) + value + ',';
                } else {
                    this.inputItems.packpath.value = value + ',';
                }
            }
        }
    }

    blurAreaMatchCode() {
        this.displayAreaMatchCode = false;
    }

    showUploadCode() {
        this.hoverFlagCode = true;
    }
    hideUploadCode() {
        this.hoverFlagCode = false;
    }
    showUpload() {
        this.hoverFlag = true;
    }
    hideUpload() {
        this.hoverFlag = false;
    }

    zipUploadCode() {
        this.elementRef.nativeElement.querySelector('#ziploadCode').value = '';
        this.elementRef.nativeElement.querySelector('#ziploadCode').click();
    }

    zipUpload() {
        if (this.intellijFlag) {
            this.uploadFileChoice = 'normal';
            this.intellijUpload('normal', 'true');
        } else {
            this.vscodeService.postMessage({ cmd: 'getCurrentAppName' }, (appName: string) => {
                if (appName === 'CloudIDE') {
                    this.vscodeService.postMessage({
                        cmd: 'cloudIDEupload',
                    }, (fileProps: Array<any>) => {
                        this.uploadFile('normal', fileProps);
                    });
                } else {
                    this.elementRef.nativeElement.querySelector('#zipload').value = '';
                    this.elementRef.nativeElement.querySelector('#zipload').click();
                }
            });
        }
    }

    uploadFolder() {
        this.elementRef.nativeElement.querySelector('#filesUp').value = '';
        this.elementRef.nativeElement.querySelector('#filesUp').click();
    }

    /**
     * intellij打开超链接
     * @param url 路径
     */
    openHyperlinks(url: string) {
        // intellij走该逻辑
        if (this.intellijFlag) {
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

    public confirmUploadMsgTip() {
        this.uploadConfirmTip.Close();
        this.intellijUpload(this.uploadFileChoice, 'false');
    }

    public cancelUploadMsgTip() {
        this.uploadConfirmTip.Close();
        this.isUploading = false;
        return;
    }

    private intellijUpload(choice: string, nameFilter: string) {
        this.isUploadPack = true;
        this.exitMask.Close();
        const uploadMsg = {
            cmd: 'checkUploadFileIntellij',
            data: {
                url: '/portadv/tasks/check_upload/',
                scan_type: '5',
                need_unzip: 'false',
                choice,
                not_chmod: 'false',
                validFile: 'gz,tar,tar.bz,tar.gz,tbz,tbz2,tgz,zip,deb,egg,jar,rpm,war,whl',
                title: this.i18n.plugins_port_migration_appraise,
                isDuplicated: this.isDuplicated.toString(),
                uploadFilePath: this.uploadFilePath,
                saveFileName: (choice === 'override') ? this.overrideFileName : (this.exitFileName + this.suffix),
                nameFilter
            }
        };
        this.isDuplicated = false;
        this.vscodeService.postMessage(uploadMsg, (resp: any) => {
            this.uploadFilePath = resp.uploadFilePath;
            this.displayAreaMatch = false;
            if (resp.isCompatible) {
                this.uploadConfirmTip.Open();
            } else {
                if (resp.status === STATUS.SUCCESS) {
                    this.isUploading = true;
                    this.changeDetectorRef.markForCheck();
                    this.changeDetectorRef.detectChanges();
                    this.intellijUploadFile(choice);
                } else if (resp.realStatus === STATUS.INSUFFICIENT_SPACE) {
                    this.utilsService.sendDiskAlertMessage();
                    this.isUploading = false;
                    this.isDuplicated = false;
                } else {
                    if (resp.data.new_name && resp.data.suffix) {
                        this.isDuplicated = true;
                        this.exitFileName = resp.data.new_name;
                        this.overrideFileName = resp.data.old_name;
                        this.suffix = resp.data.suffix;
                        this.exitFileNameReplace = this.i18nService.I18nReplace(
                            this.i18n.plugins_porting_message_analysis_center.exit.content, { 0: resp.data.old_name });
                        this.exitMask.Open();
                    } else {
                        this.isShow = false;
                        this.showMessageByLang(resp, 'error');
                        this.isUploading = false;
                        this.isDuplicated = false;
                    }
                }
            }
            if (this.intellijFlag) {
                this.changeDetectorRef.markForCheck();
                this.changeDetectorRef.detectChanges();
            }
        });
    }

    private intellijUploadFile(choice: string) {
        this.isUploadPack = true;
        this.exitMask.Close();
        this.isUploadSuccess = false;
        this.isShow = false;
        this.isUploading = true;
        const uploadMsg = {
            cmd: 'uploadFileIntellij',
            data: {
                scan_type: '5',
                need_unzip: 'false',
                choice,
                not_chmod: 'false',
                title: this.i18n.plugins_port_migration_appraise,
                uploadFilePath: this.uploadFilePath,
                saveFileName:  (choice === 'override') ? this.overrideFileName : (this.exitFileName + this.suffix)
            }
        };
        this.vscodeService.postMessage(uploadMsg, (resp: any) => {
            this.exitMask.Close();
            this.suffix = '';
            this.exitFileName = '';
            this.overrideFileName = '';
            if (resp.status === STATUS.SUCCESS) {
                this.contactPackPath(resp.data);
                this.isUploadSuccess = true;
                this.isShow = false;
                this.isCompress = false;
            } else if (resp.realStatus === STATUS.INSUFFICIENT_SPACE) {
                this.utilsService.sendDiskAlertMessage();
            } else if (resp === 'timeout') {
                this.isCompress = false;
                this.showInfoBox(this.i18n.common_term_report_500, 'warn');
            } else {
                this.isShow = false;
            }

            this.isUploading = false;
            if (this.intellijFlag) {
                this.changeDetectorRef.markForCheck();
                this.changeDetectorRef.detectChanges();
            }
        });
    }

    // 上传软件包
    uploadFile(choice: string, fileProps?: Array<any>) {
        this.isUploadPack = true;
        this.exitMask.Close();
        this.isUploadSuccess = false;
        this.isShow = false;
        this.isUploading = true;
        let inputDom: any;
        let file: any;
        if (choice === 'normal') {
            inputDom = this.elementRef.nativeElement.querySelector('#zipload');
            file = (fileProps || inputDom.files)[0];
            this.uploadPackFile = file;
        } else {
            file = this.uploadPackFile;
        }
        this.info.filename = file.name;
        if (this.utilsService.checkUploadFileNameValidity(this.info.filename)) {
            this.isShow = false;
            this.isUploading = false;
            this.showInfoBox(this.i18n.plugins_porting_tips_fileNameIsValidity, 'error');
            return;
        }
        const size = file.size / 1024 / 1024;
        if (size > fileSize) {
            this.isShow = false;
            this.isUploading = false;
            this.showInfoBox(this.i18n.plugins_porting_message_fileExceedMaxSize, 'info');
            return;
        }
        if (!file.name.endsWith('.rpm') && !file.name.endsWith('.deb') && !file.name.endsWith('.war')
            && !file.name.endsWith('.tar') && !file.name.endsWith('.jar')
            && !file.name.endsWith('.zip') && !file.name.endsWith('.gzip')
            && !file.name.endsWith('.gz') && !file.name.endsWith('.tar.gz') && !file.name.endsWith('.tar.bz')
            && !file.name.endsWith('.tgz') && !file.name.endsWith('.tbz') && !file.name.endsWith('tbz2')
            && !file.name.endsWith('.egg') && !file.name.endsWith('.whl')) {
            const message = {
                cmd: 'analysisProcess',
                data: {
                    msgID: MESSAGE_MAP.PROCESS_FAILED,
                    infochinese: this.i18n.plugins_porting_tips_wrongFileType,
                    info: this.i18n.plugins_porting_tips_wrongFileType
                }
            };
            this.vscodeService.postMessage(message, null);
            this.isUploading = false;
            this.isShow = false;
            return;
        }
        this.info.filesize = size.toFixed(1);
        const isAarch64 = this.uploadService.isIncludeAarch64(file.name);
        this.file = file;
        if (isAarch64 && choice === 'normal') {
            this.aarch64Modal.Open();
        } else {
            this.handleRelayFile(choice, file);
        }
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
        this.isUploading = false;
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
            this.info.filePath = file.path;
            this.info.filename = `${this.exitFileName}${this.suffix}`;
            file = fileLast;
            formData.append('file', fileLast);
        } else if (choice === 'override' && this.exitFileName !== '') {
            const fileLast = new File([file], this.oldName);
            this.info.filePath = file.path;
            this.info.filename = this.oldName;
            file = fileLast;
            formData.append('file', fileLast);
        } else {
            formData.append('file', file);
        }
        const params = {
            file_size: file.size,
            file_name: file.name,
            need_unzip: 'false',
            scan_type: '5',
            choice
        };
        this.uploadProgress = '0%';
        this.vscodeService.post({ url: '/portadv/tasks/check_upload/', params }, (data: any) => {
            this.displayAreaMatch = false;
            if (data.status === STATUS.SUCCESS) {
                const uploadMsg = {
                    cmd: 'uploadProcess',
                    data: {
                        msgID: 'uploadFile',
                        url: '/portadv/tasks/upload/',
                        fileUpload: 'true',
                        filePath: file.path ? file.path : this.info.filePath,
                        fileSize: file.size,
                        overrideName: this.info.filename,
                        uploadPrefix: this.i18n.plugins_porting_uploadPrefix_appraise,
                        autoPack: {
                            choice,
                            'scan-type': '5'
                        }
                    }
                };
                this.vscodeService.postMessage(uploadMsg, (resp: any) => {
                    this.isUploading = false;
                    if (resp.status === STATUS.SUCCESS) {
                        this.contactPackPath(file.name);
                        this.isUploadSuccess = true;
                        this.isShow = false;
                        this.isCompress = false;
                        this.showMessageByLang(resp, 'info');
                    } else if (resp.realStatus === STATUS.MAXIMUM_TASK) { // 等待上传中
                      this.isUploading = true;
                      this.handleUploadWaiting(uploadMsg, resp);
                    } else if (resp.realStatus === STATUS.INSUFFICIENT_SPACE) {
                        this.utilsService.sendDiskAlertMessage();
                    } else if (resp === 'timeout') {
                        this.isCompress = false;
                        this.showInfoBox(this.i18n.common_term_report_500, 'warn');
                    } else {
                        this.isShow = false;
                        this.showMessageByLang(resp, 'error');
                    }
                });
            } else if (data.realStatus === STATUS.INSUFFICIENT_SPACE) {
                this.utilsService.sendDiskAlertMessage();
                this.isUploading = false;
            } else {
                if (data.data.new_name && data.data.suffix) {
                    this.exitFileName = data.data.new_name;
                    this.suffix = data.data.suffix;
                    this.oldName = data.data.old_name;
                    this.exitFileNameReplace = this.i18nService
                      .I18nReplace(this.i18n.plugins_porting_message_analysis_center.exit.content,
                        { 0: data.data.old_name });
                    this.exitMask.Open();
                } else {
                    this.isShow = false;
                    this.showMessageByLang(data, 'error');
                    this.isUploading = false;
                }
            }
        });
    }

    // 处理等待上传中
    handleUploadWaiting(uploadMsg: any, resp: any) {
      const newMsg = Object.assign({}, uploadMsg, { cmd: 'waitingUploadTask' });
      this.vscodeService.postMessage(newMsg, (res: any) => {
        this.isUploading = false;
        // 轮询达到最大次数
        if (res) {
            this.showMessageByLang(resp, 'error');
          }
      });
    }

    myUpdateCallback(metadata: any) {
        this.isShow = true;
        this.isHalf = true;
        this.uploadProgress = (metadata.percent / 2).toFixed(2) + '%';
    }

    isDeleteAreaMatch(value: string) {
        this.deleteValue = value;
        this.isDeletePack = true;
        this.fileNameDelete = this.i18nService.I18nReplace(
        this.i18n.plugins_porting_message_analysis_center.exit.delete_file_content, { 0: value });
        this.miniModalServe.open({
          type: 'warn',
          content: {
            title: this.i18n.plugins_porting_message_analysis_center.exit.delete_file,
            body: this.fileNameDelete
          },
          close: (): void => {
            this.deleteAreaMatch();
            this.utilsService.intellijDismiss(this.intellijFlag);
          },
          dismiss: () => {
            this.utilsService.intellijDismiss(this.intellijFlag);
           }
        });
    }

    isDeleteAreaMatchCode(value: string) {
        this.deleteValueCode = value;
        this.isDeletePack = false;
        this.fileNameDelete = this.i18nService.I18nReplace(
        this.i18n.plugins_porting_message_analysis_center.exit.delete_file_content, { 0: value });
        this.miniModalServe.open({
          type: 'warn',
          content: {
            title: this.i18n.plugins_porting_message_analysis_center.exit.delete_file,
            body: this.fileNameDelete
          },
          close: (): void => {
            this.deleteAreaMatch();
            this.utilsService.intellijDismiss(this.intellijFlag);
          },
          dismiss: () => {
            this.utilsService.intellijDismiss(this.intellijFlag);
          }
        });
    }

    deleteAreaMatch() {
        let fileName: string;
        fileName = this.isDeletePack ? this.deleteValue : this.deleteValueCode;
        const path = this.isDeletePack ? 'package' : 'sourcecode';
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
                const message = ((self as any).webviewSession || {}).getItem('language') === 'zh-cn'
                  ? resp.infochinese
                  : resp.info;
                if (resp.status === STATUS.SUCCESS) {
                    const inputVal = this.isDeletePack ? this.inputItems.packpath.value : this.inputItems.srcpath.value;
                    let vals = inputVal.split(',');
                    const inputNum = 1;
                    if (vals.length === inputNum) {
                        this.isDeletePack ? this.inputItems.packpath.value = '' : this.inputItems.srcpath.value = '';
                    } else {
                        vals = vals.filter((val: any) => {
                            return fileName.indexOf(val) < 0;
                        });
                        const separator = vals.length === 0 ? '' : ',';
                        if (this.isDeletePack) {
                            this.inputItems.packpath.value = vals.join(',') + separator;
                        } else {
                            this.inputItems.srcpath.value = vals.join(',') + separator;
                        }
                    }

                    this.inputAreaMatch();  // 获取已上传的软件列表
                    this.showInfoBox(message, 'info');
                } else {
                    this.showInfoBox(message, 'error');
                }
            }

        });
    }

    closeMaskExit() {
        this.isUploading = false;
        this.isDuplicated = false;
        this.exitMask.Close();
    }
    closeMaskSaveAs() {
        this.isUploading = false;
        this.isDuplicated = false;
        this.saveasMask.Close();
    }
    uploadAgain(choice: string) {
        if (this.isUploadPack) {
            if (choice === 'override') {
                if (this.intellijFlag) {
                    this.uploadFileChoice = 'override';
                    this.intellijUpload(choice, 'false');
                } else {
                    this.uploadFile(choice);
                }
            } else {
                this.exitMask.Close();
                this.saveasMask.Open();
            }
        } else {
            this.exitMask.Close();
            this.saveasMask.Open();
        }
    }
    saveAs(choice: string) {
        if (!this.confirmUploadZip.valid) {
          this.elementRef.nativeElement.querySelector('#saveas-input').focus();
          return;
        }
        this.saveasMask.Close();
        if (this.isUploadPack) {
            if (this.intellijFlag) {
                this.uploadFileChoice = choice;
                this.intellijUpload(choice, 'false');
            } else {
                this.uploadFile(choice);
            }
        }
    }
}
