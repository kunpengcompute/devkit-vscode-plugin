import {
  Component, OnInit, ViewChild, ElementRef, AfterViewInit,
  ChangeDetectorRef, NgZone, Renderer2
} from '@angular/core';
import {
  TiMessageService, TiValidationConfig,
  TiTableRowData, TiTableSrcData, TiTableColumns, TiModalService, Util
} from '@cloud/tiny3';
import {ActivatedRoute, Router} from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import {FormControl} from '@angular/forms';
import {
  RegService, MessageService, UtilsService, MytipService, VscodeService, COLOR_THEME,
  I18nService, CustomValidators
} from '../service';
import {HistoryListComponent} from './history-list/history-list.component';
import {fileSize} from '../global/globalData';
import {PortWorkerStatus} from '../service/constant';
import {HyMiniModalService} from 'hyper';

declare const require: any;
const JSZip = require('jszip');

const enum STATUS {
  NOPERMISSION = '0x050414', // 扫描文件或文件夹无权限
  SUCCESS = 0,
  FAIL = 1,
  MAXIMUM_TASK = '0x010125', // 文件上传任务已达到上限
  INSUFFICIENT_SPACE = '0x010611'
}

const enum LANGUAGE_TYPE {
  ZH = 0,
  EN = 1,
}

const enum MESSAGE_MAP {
  SHOW_PROGRESS = 'getStatus',
  FILE_SIZE_EXCEEED = 'fileSizeExceed',
  FILE_UPLOAD = 'uploadFile',
  PROCESS_FAILED = 'processFailed'
}

const enum PROCESS_STATE {
  NOT_SHOW = -1,
  PORT_PRECHECK = 5,
}

const enum TASK_TYPE {
  PRECHECK = 5,
  BYTE_CHECK = 6,
  WEAK_COMPILE = 9,
  WEAK_CHECK = 10,
  BC_CHECK = 11,
  CACHE_CHECK = 12
}

const enum SCAN_TYPE {
  BYTECHECK = '1', // 字节对齐
  PRECHECK = '2', // 64位迁移
  CONTENT = '6',
  COMPILED_FILE = '7',
  WEAKCONSISTENCYBC = '8', // 内存一致性bc文件
  CACHECHECK = '12'
}

const enum TASK_STATUS {
  INPROGRESS = 1,
  DONE = 2,
}

const enum UPLOAD_FILE_SCAN_TYPE {
  PRECHECK = '1',
  BYTE_CHECK = '2',
  WEAK_CHECK = '6',
  CACHE_CHECK = '12'
}

@Component({
  selector: 'app-memory-barrier-analysis.component',
  templateUrl: './memory-barrier-analysis.component.html',
  styleUrls: ['./memory-barrier-analysis.component.scss']
})
export class MemoryBarrierAnalysisComponent implements OnInit, AfterViewInit {
  @ViewChild('exitmask', {static: false}) exitMask: { Close: () => void; Open: () => void; };
  @ViewChild('exitbc', {static: false}) exitbc: { Close: () => void; Open: () => void; };
  @ViewChild('saveasmask', {static: false}) saveasMask: { Close: () => void; Open: () => void; };
  @ViewChild('savebc', {static: false}) savebc: { Close: () => void; Open: () => void; };
  @ViewChild('deletereportmask', {static: false}) deleteReportMask: { Close: () => void; Open: () => void; };
  @ViewChild('deleteallreportmask', {static: false}) deleteAllReportMask: { Close: () => void; Open: () => void; };
  @ViewChild(HistoryListComponent, {static: false}) private historyListComponent: HistoryListComponent;
  @ViewChild('bcDownload', {static: false}) bcDownload: any;
  @ViewChild('bcResult', {static: false}) bcResult: { Close: () => void; };
  public showPreCheckPro = false; // 是否显示64位运行模式检查进度条
  public showBcCheckPro = false; // 是否显示bc检查进度条
  public showCacheCheckPro = false; // 是否显示缓存行检查进度条
  public showBcSourceCheckPro = false; // 是否显示内存一致性检查进度条
  public showByteCheckPro = false; // 是否显示结构体字节对齐检查进度条
  public bcFileTableData: Array<TiTableRowData> = [];
  public bcFileSrcData: TiTableSrcData;
  public bcFileColumns: Array<TiTableColumns>;
  public checkResult: any;
  public compilerConfigurationFile: any; // 生成编译器配置文件选项
  public bcGenerateTaskId: any; // 静态检查任务ID
  public currTheme = COLOR_THEME.Dark;
  public radioList: any[] = [];
  public radioListWeak: any[] = [];
  public BcList: any[] = [];
  public sourceTypeChecked = 'remote';
  public sourceTypeCheckedWeaK = 'remote';
  public weakTypeChecked = 'remote2';
  public weakCheckTypeChecked = 'local3';
  public TypeChecked = 'remote1';
  public info1 = {
    filename: '',
    filesize: ''
  };
  public bcExitFileName = '';
  public i18n: any;
  public failFlag = false;
  public workspace = `/opt/portadv/${((self as any).webviewSession || {}).getItem('username')}/precheck/`;
  private preCheckWorkspace = '';
  private byteCheckWorkspace = '';
  private cacheCheckWorkspace = '';
  public bcspace = 'opt/xx';
  public backworkspace: any = '';
  public isDisabled = false;
  public isCheck = true;
  public isWebpacking = false;
  public isBlank = false;
  public currLang: any;
  public currLanguege: any;
  public filenameLengthWeak: any;
  public filenameLengthBcCheck: any;
  public filenameLengthPrecheck: any;
  public filenameLengthByte: any;
  public filenameLengthCache: any;
  public bgTheme = {
    Dark: 1,
    Light: 2
  };
  public chkArmEnv = {
    isNotOk: false,
    showGuide: false,
    guide1: '',
    guide2: '',
    link1: '',
    link2: '',
    link3: '',
    link4: '',
    package_type: ''
  };
  public customizePath: any;
  public LANG_TYPE = {
    ZH: 0,
    EN: 1,
  };
  public taskId = '';
  public stopPreCheckFlag = false;
  public situation = 0;
  public filename: any = '';
  public commandControl: any;
  public weakControl: any;
  public filenameTip: any = '';
  public inputPrompt: string;
  public inputValuePrecheck = '';
  public inputValueByte = '';
  public inputValueCache = '';
  public id = '';
  public count = 0;
  public precheckCount = 0;
  public byteAlignCount = 0;
  public cacheCheckCount = 0;
  public isAlermOpt = false; // 告警时禁止操作
  public sampleBtnTip = '';
  public selectFileTip = '';
  public placeHolder64 = '';
  public placeHolderWeak = '';
  public uploadPackFile: any;
  public uploadFolderFileList: any;
  public exitFileName = '';
  public overrideFileName = '';
  public exitFileNameReplace = '';
  public fileNameDelete = '';
  public suffix = '';
  public deleteValue = '';
  public deleteValueCode = '';
  public info = {
    filename: '',
    filesize: '',
    filePath: ''
  };
  public selectType: any = {
    options: [],
    selectedId: '',
    curSelObj: {},
  };
  public BcType: any = {
    options: [],
    selectedId: '',
    curSelObj: {},
  };
  public fileInfo = {
    filename: '',
    filesize: ''
  };
  public progressInfo = '';
  public progressStatus = '';
  public btnDisabledTip = '';
  public pathlist: any[] = [];
  public displayAreaMatch = false;
  public multipleInput = false;
  public isUploading = false;
  public options: any[];
  public createBtnDisabled = false;
  public byteBtnDisabled = false;
  public cacheBtnDisabled = false;
  public bcCreateBtnDisabled = false;
  public createBtnDisabledTip = '';
  public oldName: any;
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
        label: 'make',
        id: 0
      },
      options: [
        {
          id: 0,
          label: 'make'
        },
        {
          id: 1,
          label: 'cmake'
        },
        {
          id: 2,
          label: 'automake'
        }
      ],
      required: false
    },
    weakTool: {
      value: ''
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
        id: ''
      },
      options: [],
      required: false
    },

  };
  public confirmUploadZip: any;
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
  public validation: TiValidationConfig = {
    type: 'blur',
    errorMessage: {
      regExp: '',
      required: ''
    }
  };
  public timer: any;
  hoverFlag = false;

  public uploadProgress: string;
  public isShow = false;
  public isCompress = false;
  public isUploadSuccess = false;
  public successTit: string;
  public arr: any[];
  private getStatusTimerByteAlign: any = null;
  private maxCount = 3; // 异常情况下最多轮询次数
  private curCountByteAlign = 0; // 异常情况下轮询次数-对齐检查
  public upTimes: 0;
  public uploadResultTip = {
    state: '',
    content: ''
  };
  public uploadStartFlag = false;
  public weakEnvironment: string; // 运行环境版本
  public backendToolVersion: string; // 后端工具版本
  public frontendToolVersion: string; // 前端工具版本
  public isVersionMismatch: boolean; // 版本不匹配标志
  public weakCodeFilePath: string;
  public weakModeList: any;
  public weakPathList: any;
  public weakStepList: any = [];
  public uploadCompilerTip = { // 编译命令提示
    state: '',
    content: ''
  };
  public isX86: boolean;
  public weakCompilerName: string; // 编译文件名
  public weakCopmilerId: any;
  public weakFileName = '';
  public inputWeak = '';
  public curStep = 1;
  public targetos: string; // 操作系统
  public weakScanType: string; // 内存一致性任务类型
  public noAgain = true; // 是否有另存为功能
  public reportTotalNum = 0; // 历史记录总条数
  public reportId = '';
  public createWeakCompilerDisabled = false; // 构建命令时 禁用下一步
  public createWeakBtnDisabled = false; // 内存一致性检查按钮是否禁用
  public createWeakBtnDisabledTip = ''; // 内存一致性检查按钮禁用提示
  public nextDisabled: boolean;
  public pathload: string;
  public weakFileList: any;
  public BcPathList: any;
  public bcFileName = '';
  public localFilePath = '';
  public fileName = '';
  public bcUploadResultTip = {
    state: '',
    content: ''
  };
  public isCommit = false; // 历史报告是否达到最大值
  public BCCommit: boolean;
  public areaMatchHeight: number;
  public bcPlaceholder = '';
  public cancelBlur = true;
  public isSlow = false;
  public isUploadZip = false;
  public bcsuffix = '';
  uploadZipFile: any;
  public weakScanDisable = false;
  intellijFlag = false;
  isDuplicated = false;
  uploadFilePath: string;
  deleteReportId: string;
  type: string;
  public bcUserLink = '';
  public pluginUrlCfg: any = {
    faqEighteen: '',
    download1: '',
    download2: '',
    download3: '',
    download4: '',
  };
  public weakList: any;
  public weakChekList: any;
  public outfilepath: any;
  public isUploadDirectory = 'directory';
  public isUploadDirectoryBeta = 'directory';
  public fileTypeList: Array<{ value: string; key: string }> = [];
  public fileType: Array<{ value: string; key: string }> = [];
  public bcOptions: Array<any> = [];
  public bcDisabled: any;
  public bcSelecteds: any;
  public bcFileList: Array<any> = [];
  bcOldName: any;
  cmdHolder: string;
  cmdworkspace: string;

  constructor(
    private tiModal: TiModalService,
    public mytip: MytipService,
    public i18nService: I18nService,
    public vscodeService: VscodeService,
    private tiMessage: TiMessageService,
    private elementRef: ElementRef,
    public router: Router,
    private renderer2: Renderer2,
    public utilsService: UtilsService,
    private route: ActivatedRoute,
    public msgService: MessageService,
    private miniModalServe: HyMiniModalService,
    private changeDetectorRef: ChangeDetectorRef,
    private zone: NgZone,
    public sanitizer: DomSanitizer,
    public regService: RegService // command校验器需要，可解耦
  ) {
    this.i18n = this.i18nService.I18n();
    this.currLanguege = I18nService.getLang();
    this.selectFileTip = this.i18n.plugins_porting_title_portPreCheckTips;
    this.radioList = [{key: 'remote', value: this.i18n.plugins_porting_title_remoteSourceCode},
      {key: 'local', value: this.i18n.plugins_porting_title_localSourceCode}];
    this.radioListWeak = [{key: 'remote', value: this.i18n.plugins_porting_title_remoteSourceCode},
      {key: 'local', value: this.i18n.plugins_porting_title_localSourceCode}];
    this.weakList = [{key: 'remote2', value: this.i18n.plugins_porting_weakCheck.mode_1},
      {key: 'local2', value: this.i18n.plugins_porting_weakCheck.mode_0}];
    this.weakChekList = [{key: 'local3', value: this.i18n.plugins_porting_weakCheck.mode_2},
      {key: 'remote3', value: this.i18n.plugins_porting_weakCheck.mode_3}
    ];
    this.BcList = [{key: 'remote1', value: this.i18n.plugins_porting_title_remoteBc},
      {key: 'local1', value: this.i18n.plugins_porting_title_localBc}];
  }

  ngOnInit() {
    this.bcFileColumns = [
      {
        title: this.i18n.plugins_porting_weakCheck.bc_result.filename,
        width: '40%'
      },
      {
        title: this.i18n.plugins_porting_weakCheck.bc_result.scan_result,
        width: '30%'
      },
      {
        title: this.i18n.plugins_porting_weakCheck.bc_result.hand_suggesst,
        width: '30%'
      }
    ];
    this.placeHolder64 = this.i18n.plugins_porting_title_folder;
    this.placeHolderWeak = this.i18n.plugins_porting_title_folder;
    this.compilerConfigurationFile = {
      title: this.i18n.plugins_porting_weakCheck.compiler_tool_configuration,
      checked: false,
      disabled: false
    };
    this.fileTypeList[0] = {
      value: this.i18n.common_term_upload_directory,
      key: 'directory'
    };
    this.fileTypeList[1] = {
      value: this.i18n.common_term_upload_compressed,
      key: 'compressed'
    };
    this.fileType[0] = {
      value: this.i18n.common_term_upload_directory,
      key: 'directory'
    };
    this.fileType[1] = {
      value: this.i18n.common_term_upload_compressed,
      key: 'compressed'
    };
    this.vscodeService.postMessage({cmd: 'getCurrentAppName'}, (appName: string) => {
      if (appName === 'CloudIDE') {
        this.fileTypeList.shift();
        this.fileType.shift();
        this.isUploadDirectory = 'compressed';
        this.isUploadDirectoryBeta = 'compressed';
      }
    });
    this.route.queryParams.subscribe((data) => {
      this.showByteCheckPro = data.isProcess === 'true';
      this.showBcCheckPro = data.isProcess === 'true';
      this.showPreCheckPro = data.isProcess === 'true';
      this.showBcSourceCheckPro = data.isProcess === 'true';
      this.intellijFlag = (data.intellijFlag) ? true : false;

      // 如果是右键发起跳转到该页面
      if (data.filePath) {
        this.localFilePath = data.filePath;
        this.fileName = data.fileName;
        this.weakFileName = data.fileName;
        const message = {
          cmd: 'panelCheckFileAffinity'
        };
        this.vscodeService.postMessage(message, null);
      }
    });
    // 获取全局url配置数据
    this.vscodeService.postMessage({cmd: 'readUrlConfig'}, (resp: any) => {
      this.pluginUrlCfg = resp;
      this.currLang = I18nService.getLang();
      if (this.currLang === LANGUAGE_TYPE.ZH) {
        this.bcUserLink = this.pluginUrlCfg.faqEighteenZn;
      } else {
        this.bcUserLink = this.pluginUrlCfg.faqEighteenEn;
      }
      this.chkArmEnv.link1 = this.pluginUrlCfg.download1;
      this.chkArmEnv.link2 = this.pluginUrlCfg.download2;
      this.chkArmEnv.link3 = this.pluginUrlCfg.download3;
      this.chkArmEnv.link4 = this.pluginUrlCfg.download4;
      if (this.intellijFlag) {
        this.changeDetectorRef.markForCheck();
        this.changeDetectorRef.detectChanges();
      }
    });
    this.bcPlaceholder = this.i18nService.I18nReplace(this.i18n.plugins_porting_title_localBcPlaceholder,
      {0: '/opt/portadv/portadmin/weakconsistency_bc/'});
    // 接收结束64位预检任务的消息
    this.msgService.getMessage().subscribe(msg => {
      if (msg.value && msg.type === 'closePreCheckTaskMsg') {
        this.confirmEndTask();
      }
    });

    this.msgService.getMessage().subscribe(msg => {
      if (msg.type === 'taskCancel') {
        if (msg.value === 'weakCompileTask') {
          this.createWeakCompilerDisabled = false;
        } else if (msg.value === 'weakCheckTask') {
          this.createWeakBtnDisabled = false;
        } else if (msg.value === 'bcCheckTask') {
        }
      }
    });

    // vscode颜色主题
    if (document.body.className.indexOf('vscode-light') > -1) {
      this.currTheme = COLOR_THEME.Light;
    }

    this.vscodeService.regVscodeMsgHandler('colorTheme', (msg: any) => {
      this.currTheme = msg.colorTheme;
      if (this.intellijFlag) {
        this.changeDetectorRef.markForCheck();
        this.changeDetectorRef.detectChanges();
      }
    });

    this.inputItems.path.label = this.i18n.common_term_ipt_label.source_code_path;
    this.inputItems.version.label = this.i18n.common_term_ipt_label.compiler_version;
    this.inputItems.tool.label = this.i18n.common_term_ipt_label.construct_tool;
    this.inputItems.command.label = this.i18n.common_term_ipt_label.compile_command;
    this.inputItems.linuxOS.label = this.i18n.common_term_ipt_label.target_os;
    this.inputItems.fortran.label = this.i18n.common_term_ipt_label.fortran;
    this.inputItems.kernelVersion.label = this.i18n.common_term_ipt_label.target_system_kernel_version;
    this.filenameLengthWeak = new FormControl(
      {value: '', disabled: this.isCheck || this.weakScanDisable},
      [CustomValidators.filenameLength(this.i18n), CustomValidators.filenameCheck(this.i18n)]
    );
    this.filenameLengthBcCheck = new FormControl(
      {value: '', disabled: this.isCheck || this.weakScanDisable},
      [CustomValidators.filenameLength(this.i18n), CustomValidators.filenameCheck(this.i18n)]
    );
    this.filenameLengthPrecheck = new FormControl(
      '',
      [CustomValidators.filenameLength(this.i18n), CustomValidators.filenameCheck(this.i18n)]
    );
    this.filenameLengthByte = new FormControl(
      '',
      [CustomValidators.filenameLength(this.i18n), CustomValidators.filenameCheck(this.i18n)]
    );
    this.filenameLengthCache = new FormControl(
      '',
      [CustomValidators.filenameLength(this.i18n), CustomValidators.filenameCheck(this.i18n)]
    );
    this.commandControl = new FormControl('', [CustomValidators.commandControlForByte(this.i18n, this)]);
    this.weakControl = new FormControl(
      {value: '', disabled: this.isCheck || this.weakScanDisable},
      [CustomValidators.commandLength(this.i18n)]);

    this.selectType.options = [
      {
        key: this.i18n.plugins_porting_message_enhancefun_label.precheck,
        id: 'precheck',
        path: 'precheck/',
        disable: false,
        isNormalImg: './assets/img/migration-center/precheck_normal.svg',
        isNormalImgLinght: './assets/img/migration-center/precheck_normal_light.svg',
        isSelectedImg: './assets/img/migration-center/precheck_hover.svg',
        isSelectedImgLight: './assets/img/migration-center/precheck_hover_light.svg',
        desc: this.i18n.plugins_porting_message_enhancefun_label.precheckDesc
      },
      {
        key: this.i18n.plugins_porting_message_enhancefun_label.byte,
        id: 'byte',
        disable: false,
        path: 'bytecheck/',
        isNormalImg: './assets/img/migration-center/byte_normal.svg',
        isNormalImgLinght: './assets/img/migration-center/byte_normal_light.svg',
        isSelectedImg: './assets/img/migration-center/byte_hover.svg',
        isSelectedImgLight: './assets/img/migration-center/byte_hover_light.svg',
        desc: this.i18n.plugins_porting_message_enhancefun_label.byteDesc
      },
      {
        key: this.i18n.plugins_porting_message_enhancefun_label.cache,
        id: 'cache',
        path: 'cachecheck/',
        disable: false,
        isNormalImg: './assets/img/migration-center/cache_normal.svg',
        isNormalImgLinght: './assets/img/migration-center/cache_normal_light.svg',
        isSelectedImg: './assets/img/migration-center/cache_hover.svg',
        isSelectedImgLight: './assets/img/migration-center/cache_hover_light.svg',
        desc: this.i18n.plugins_porting_message_enhancefun_label.cacheDesc
      },
      {
        key: this.i18n.plugins_porting_message_enhancefun_label.weakMemoryCheck,
        id: 'weak',
        path: 'weakconsistency/',
        disable: false,
        isNormalImg: './assets/img/migration-center/weak_normal.svg',
        isNormalImgLinght: './assets/img/migration-center/weak_normal_light.svg',
        isSelectedImg: './assets/img/migration-center/weak_hover.svg',
        isSelectedImgLight: './assets/img/migration-center/weak_hover_light.svg',
        desc: this.i18n.plugins_porting_message_enhancefun_label.weakMemoryDesc
      }
    ];
    this.BcType.options = [
      {
        key: this.i18n.plugins_porting_message_enhancefun_label.weak,
        id: 'weak',
        path: 'weakconsistency_bc/',
        disable: false,
        desc: this.i18n.plugins_porting_message_enhancefun_label.weakMemoryDesc
      }
    ];
    this.weakModeList = [
      {id: 0, name: this.i18n.plugins_porting_weakCheck.mode_1, active: true},
      {id: 1, name: this.i18n.plugins_porting_weakCheck.mode_0, active: false},
    ];
    this.weakFileList = [
      {id: 0, name: this.i18n.plugins_porting_weakCheck.mode_3, active: true},
      {id: 1, name: this.i18n.plugins_porting_weakCheck.mode_2, active: false},
    ];
    this.weakStepList = [
      {
        label: this.i18n.plugins_porting_weakCheck.analysis_center.step1,
        step: 1
      },
      {
        label: this.i18n.plugins_porting_weakCheck.analysis_center.step2,
        step: 2
      },
      {
        label: this.i18n.plugins_porting_weakCheck.analysis_center.step3,
        step: 3
      }
    ];
    const enhancedType = (self as any).webviewSession.getItem('EnhancedType') || 'precheck';
    let selIdx = 0;
    if (enhancedType) {
      selIdx = this.selectType.options.findIndex((opt: any) => opt.id === enhancedType);
    }
    this.selectType.selectedId = this.selectType.options[selIdx].id;
    this.selectType.curSelObj = this.selectType.options[selIdx];
    this.inputItems.tool.selected = this.inputItems.tool.options[0];
    this.inputItems.command.value = 'make';
    this.vscodeService.get({url: '/portadv/tasks/platform/'}, (resp: any) => {
      this.isX86 = (resp.status === STATUS.SUCCESS);
      if (!this.isX86) {
        if (this.intellijFlag) {
          this.changeDetectorRef.markForCheck();
          this.changeDetectorRef.detectChanges();
        }
      }
      if (resp.status === STATUS.SUCCESS) {
        this.isCheck = true;
        this.checkStatus();
        this.checkByteAlignTaskStatus();
        this.checkCacheStatus();
      } else {
        this.isCheck = false;
        this.checkEnvironment();
      }

      if (((self as any).webviewSession || {}).getItem('isFirst') !== '1') {
        if (this.isCheck) {
          this.weakControl.disable();
        }
        this.utilsService.queryDiskState();
        this.vscodeService.get({url: '/customize/'}, (cusResp: any) => {
          if (cusResp.status === STATUS.SUCCESS) {
            this.bcspace = `${cusResp.data.customize_path}/portadv/${((self as any).webviewSession ||
              {}).getItem('username')}/` + this.BcType.options[0].path;
            this.bcPlaceholder = this.i18n.plugins_porting_title_localBcPlaceholder;
            const selectedType = (self as any).webviewSession.getItem('EnhancedType') || 'precheck';
            selIdx = this.selectType.options.findIndex((opt: any) => opt.id === selectedType);
            this.workspace =
              `${cusResp.data.customize_path}/portadv/${((self as any).webviewSession || {})
                .getItem('username')}/`
              + this.selectType.options[selIdx].path;
            this.preCheckWorkspace =
              `${cusResp.data.customize_path}/portadv/${((self as any).webviewSession || {})
                .getItem('username')}/`
              + this.selectType.options[0].path;
            this.byteCheckWorkspace =
              `${cusResp.data.customize_path}/portadv/${((self as any).webviewSession || {})
                .getItem('username')}/`
              + this.selectType.options[1].path;
            this.cacheCheckWorkspace =
              `${cusResp.data.customize_path}/portadv/${((self as any).webviewSession || {})
                .getItem('username')}/`
              + this.selectType.options[2].path;
            this.pathload = cusResp.data.customize_path;
            const tips = this.i18n.plugins_porting_title_portPreCheckTips;
            const getweak = this.selectType.options.filter((msg: any) => msg.id === 'weak')[0];
            this.weakCodeFilePath =
              `${cusResp.data.customize_path}/portadv/${((self as any).webviewSession || {})
                .getItem('username')}/`
              + getweak.path;
            this.selectFileTip = tips;
            this.customizePath = `${cusResp.data.customize_path}/portadv/`;
            this.chkArmEnv.guide1 = this.i18nService.I18nReplace(
              this.i18n.plugins_porting_message_weak_evn_check.guide_tip1,
              {1: this.customizePath});
            this.chkArmEnv.guide2 = this.i18nService.I18nReplace(
              this.i18n.plugins_porting_message_weak_evn_check.guide_tip2,
              {1: this.customizePath, 2: this.customizePath});
            this.cmdworkspace =
              `${cusResp.data.customize_path}/portadv/${((self as any).webviewSession || {})
                .getItem('username')}/`;
            this.cmdHolder = this.i18nService.I18nReplace(
              this.i18n.plugins_porting_weakCheck.cmd_holder,
              {0: `${this.cmdworkspace}`}
            );
            this.updatePage();
          }
        });
      }
    });

    this.currLang = ((self as any).webviewSession || {}).getItem('language');
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
    this.checkToolVersion();

    const msgList = (self as any).webviewSession.getItem('resultMsgList');
    const resultMsgList = msgList ? JSON.parse(msgList) : [];
    const sourceCodeMsgLen = resultMsgList.filter((msg: any) => msg.type === 'PortingPreCheck').length;
    const byteAlignmentLen = resultMsgList.filter((msg: any) => msg.type === 'ByteAlignment').length;
    const cacheAlignmentLen = resultMsgList.filter((msg: any) => msg.type === 'CacheAlignment').length;
    if (sourceCodeMsgLen > 0) {
      this.createBtnDisabled = true;
    }
    if (byteAlignmentLen > 0) {
      this.byteBtnDisabled = true;
    }
    if (cacheAlignmentLen > 0) {
      this.cacheBtnDisabled = true;
    }
  }

  // 前后端版本校验，只保留2个版本，2.3.0(包括)起，目前cacheline功能在老服务器上禁用
  checkToolVersion() {
    this.vscodeService.get({url: '/tools/version/'}, (resp: any) => {
      if (resp) {
        const params = {
          cmd: 'readVersionConfig',
          data: '' // 无需传，防报错
        };
        this.vscodeService.postMessage(params, (data: any) => {
          // 2.3.0版本与2.3.T21等同
          if (data[0] === 'Porting Advisor 2.3.T21') {
            data[1] = 'Porting Advisor 2.3.0';
          } else if (data[0] === 'Porting Advisor 2.3.0') {
            data[1] = 'Porting Advisor 2.3.T21';
          }
          if (!data.includes(resp.version)) {
            this.isVersionMismatch = true;
            this.filenameLengthCache.disable();
          } else {
            this.isVersionMismatch = false;
          }
        });
      }
    });
  }

  // 显示多文件上传 modal
  showBcDownloadModal() {
    this.bcDownload.showBcDownloadModal();
    this.updatePage();
  }

  ngAfterViewInit() {
    window.onunload = (event: any) => {
      return false;
    };

    // 整个页面的滚动条监听，关闭下拉框
    const element = $('.router-content')[0];
    this.renderer2.listen(element, 'scroll', () => {
      Util.trigger(document, 'tiScroll');
    });
  }

  selectTypeChange(option: any) {
    ((self as any).webviewSession || {}).setItem('EnhancedType', option.id);
    this.selectType.selectedId = option.id;
    this.selectType.curSelObj = option;
    const path = option.path;
    this.workspace = `${this.pathload}/portadv/${(self as any).webviewSession.getItem('username')}/` + path;
    this.selectFileTip = this.i18n.plugins_porting_title_portPreCheckTips.replace('{0}', this.workspace);
    this.inputPrompt = this.workspace;
    if (option.id === 'weak' && !this.weakEnvironment && !this.isCheck) {
      this.checkEnvironment();
    }
    // 重置第一层radio，易导致cacheline
    this.sourceTypeChecked = 'remote';
  }

  /**
   * 查询是否有正在执行的内存一致性任务
   */
  getUndoneWeakTask() {
    this.vscodeService.get({url: '/portadv/weakconsistency/tasks/taskundone/'}, (resp: any) => {
      if (resp.status === STATUS.SUCCESS && resp.data.length) {
        this.reportId = resp.data[0].task_name;
        const type = resp.data[0].task_type;
        if (type === TASK_TYPE.WEAK_COMPILE) {
          this.createCompileFileProgress(this.reportId, resp.realStatus);
          this.createWeakCompilerDisabled = true;
        } else if (type === TASK_TYPE.WEAK_CHECK) {
          this.weakCheckProgress(this.reportId, resp.realStatus);
          this.createWeakBtnDisabled = true;
          this.createWeakBtnDisabledTip = this.i18n.common_term_creating_btn_disabled_tip;
        } else if (type === TASK_TYPE.BC_CHECK) {
          this.bcCheckProgress(this.reportId);
        }
      }
    });
  }

  /**
   * 检查迁移状态
   */
  checkStatus() {
    try {
      this.vscodeService.get({url: '/portadv/tasks/migrationrunning/'}, (data: any) => {
        if (data.status === STATUS.SUCCESS) {
          this.precheckCount = 0;
          if (data.data.id) {
            this.createBtnDisabled = true;
            this.getStatus(data.data.id, data.realStatus);
            // 发送结束64位预检任务消息
            this.msgService.sendMessage({
              type: 'getTaskIdMsg',
              data: {taskId: data.data.id}
            });
            if (this.intellijFlag) {
              this.changeDetectorRef.markForCheck();
              this.changeDetectorRef.detectChanges();
            }
          }
        } else {
          this.precheckCount++;
          if (this.precheckCount <= this.maxCount) {
            this.checkStatus();
          }
        }
      });
    } catch (err) {
      this.precheckCount++;
      if (this.precheckCount <= this.maxCount) {
        this.checkStatus();
      }
    }
  }

  /**
   * 检查字节对齐是有正在运行的任务
   */
  checkByteAlignTaskStatus() {
    try {
      this.vscodeService.get({url: '/portadv/tasks/migration/bytealignment/taskinfo/'}, (data: any) => {
        if (data.status === STATUS.SUCCESS) {
          this.byteAlignCount = 0;
          if (data.data.task_id) {
            this.byteBtnDisabled = true;
            this.byteAlignProgress(data.data.task_id, data.realStatus);
            if (this.intellijFlag) {
              this.changeDetectorRef.markForCheck();
              this.changeDetectorRef.detectChanges();
            }
          }
        } else {
          this.byteAlignCount++;
          if (this.byteAlignCount <= this.maxCount) {
            this.checkByteAlignTaskStatus();
          }
        }
      });
    } catch (err) {
      this.byteAlignCount++;
      if (this.byteAlignCount <= this.maxCount) {
        this.checkByteAlignTaskStatus();
      }
    }
  }

  /**
   * 检查缓存行任务状态
   */
  checkCacheStatus() {
    try {
      this.vscodeService.get({url: '/portadv/tasks/migration/cachelinealignment/task/'}, (data: any) => {
        if (data.status === STATUS.SUCCESS) {
          this.cacheCheckCount = 0;
          if (data.data.id) {
            this.cacheBtnDisabled = true;
            this.getCacheStatus(data.data.id, data.realStatus);
            if (this.intellijFlag) {
              this.changeDetectorRef.markForCheck();
              this.changeDetectorRef.detectChanges();
            }
          }
        } else {
          this.cacheCheckCount++;
          if (this.cacheCheckCount <= this.maxCount) {
            this.checkCacheStatus();
          }
        }
      });
    } catch (err) {
      this.precheckCount++;
      if (this.precheckCount <= this.maxCount) {
        this.checkCacheStatus();
      }
    }
  }

  // 检查运行环境GCC版本和GLIBC版本
  checkEnvironment() {
    this.vscodeService.get({url: '/portadv/weakconsistency/tasks/environment/'}, (resp: any) => {
      if (resp.realStatus === '0x0b0301') {
        this.chkArmEnv.isNotOk = true;
        this.chkArmEnv.package_type = resp.data.package_type;
      }
      if (resp.status === STATUS.SUCCESS) {
        const data = resp.data;
        this.targetos = data.os_version;
        let semi = '，';
        if (this.currLanguege === this.LANG_TYPE.EN) {
          semi = ', ';
        }
        this.weakEnvironment = data.os_version + semi + data.glibc_version
          + this.i18n.plugins_porting_weakCheck.mode_tip_1;
        this.filenameLengthWeak.reset({value: '', disabled: this.isCheck || this.weakScanDisable});
        this.filenameLengthBcCheck.reset({value: '', disabled: this.isCheck || this.weakScanDisable});
        this.weakControl.reset({value: '', disabled: this.isCheck || this.weakScanDisable});
        this.getUndoneWeakTask();
      } else {
        this.showMessageByLang(resp, 'warn');
        this.weakScanDisable = true;
      }
    });
  }


  /**
   * 判断历史报告是否达到最大数量
   * @param bool histiry-list 子组件传过来的值
   */
  changeIsCommit(bool: boolean): void {
    this.isCommit = bool;
    if (this.intellijFlag) {
      this.changeDetectorRef.markForCheck();
      this.changeDetectorRef.detectChanges();
    }
  }

  changeBCCommit(bool: boolean): void {
    this.BCCommit = bool;
    if (this.intellijFlag) {
      this.changeDetectorRef.markForCheck();
      this.changeDetectorRef.detectChanges();
    }
  }

  /**
   * radio框状态变化触发函数,init输入框组件
   * @param model model
   */
  onRadioModelChange(model: boolean): void {
    this.bcFileName = '';
    this.inputValueByte = '';
    this.inputValuePrecheck = '';
    this.inputValueCache = '';
    this.weakFileName = '';
    this.filenameLengthPrecheck.reset('');
    this.filenameLengthByte.reset('');
    this.filenameLengthCache.reset('');
    this.filenameLengthWeak.reset('');
    this.filenameLengthBcCheck.reset('');
    this.weakControl.reset('');
    this.updatePage();
  }

  /**
   * 确认结束64位预检任务
   */
  public confirmEndTask() {
    this.stopPreCheckFlag = false;
    const option = {
      url: `/portadv/tasks/migrationscan/${encodeURIComponent(this.taskId)}/`,
      method: 'DELETE'
    };
    this.vscodeService.delete(option, (data: any) => {
      if (data.status === STATUS.SUCCESS) {
        this.stopPreCheckFlag = true;
        this.createBtnDisabled = false;
        this.showInfoBox(this.i18n.plugins_porting_clear_label, 'info', data.realStatus);
      } else {
        this.showMessageByLang(data, this.i18n.plugins_porting_cleardata_label, 'warn');
      }
      this.situation = PROCESS_STATE.NOT_SHOW;
    });
  }

  /**
   * 发送消息中英文判断
   * @param data 响应数据
   * @param type 响应类型
   */
  showMessageByLang(data: any, type: any, msg?: any) {
    if (!msg) {
      msg = '';
    }
    this.currLang = I18nService.getLang();
    if (this.currLang === LANGUAGE_TYPE.ZH) {
      this.showInfoBox(data.infochinese + msg, type, data.realStatus);
    } else {
      this.showInfoBox(data.info + msg, type, data.realStatus);
    }
  }

  /**
   * 构建工具变化时，联动处理
   */
  public commandChange(data: any) {
    if (data.label === 'automake') {
      this.inputItems.command.value = 'make';
      this.commandControl.disable();
    } else {
      this.inputItems.command.value = data.label;
      this.commandControl.enable();
    }
  }

  // 选择若内存序检查模式
  changeWeakMode(mode: any, index: any): void {
    mode.active = true;
    if (index) {
      this.weakModeList[0].active = false;
    } else {
      this.weakModeList[1].active = false;
    }
  }

  /**
   * 点击内存一致性上一步
   */
  public stepChangePre(): void {
    this.nextDisabled = false;
    this.curStep = 1;
    this.uploadCompilerTip.content = '';
    this.bcSelecteds = [];
    this.bcOptions = [];
    this.bcFileList = [];
    this.noAgain = true;
    this.updatePage();
    this.compilerConfigurationFile.checked = false;
  }

  /**
   * 点击内存一致性下一步
   */
  public stepChangeNext(): void {
    this.nextDisabled = false;
    this.uploadCompilerTip.content = '';
    this.compilerConfigurationFile.disabled = false;
    if (!this.createWeakCompilerDisabled) {
      this.checkAndCreateCompilerFile();
    }
    this.updatePage();
  }

  /**
   * 内存一致性点击下一步检查与生成编译文件
   */
  checkAndCreateCompilerFile() {
    this.weakCompilerName = '';
    // 如果是右键上传的本地文件，检查之前需要进行覆盖上传
    if (this.localFilePath.length !== 0) {
      if (this.intellijFlag) {
        this.intellijUploadAndCheckRightClickFile(UPLOAD_FILE_SCAN_TYPE.WEAK_CHECK);
      } else {
        this.uploadRightClickFile(SCAN_TYPE.CONTENT);
      }
    } else {
      if (!this.filenameLengthWeak.valid) {
        return;
      }
      this.createCompilerFile();
    }
    this.updatePage();
  }

  // 构建命令 创建异步任务pmake cmake 生成中间文件
  createCompilerFile(): void {
    const weakToolValue = this.inputItems.weakTool.value;
    let constructtool = 'cmake';
    if (/^\s*make/.test(weakToolValue)) {
      constructtool = 'make';
    }
    this.weakScanDisable = true;
    const params = {
      // 需要进行迁移扫描的源代码绝对路径，不同的路径使用逗号分割
      sourcedir: `${this.weakCodeFilePath}${this.weakFileName}`,
      constructtool,
      gllvm: 'true',
      compilecommand: weakToolValue,
      os_mapping_dir: '',
      targetos: this.targetos || 'centos 7.6' // 运行环境的操作系统
    };
    if (this.localFilePath.length > 0) {
      params.os_mapping_dir = this.localFilePath;
    }
    this.vscodeService.post({url: '/portadv/weakconsistency/tasks/compilefile/', params}, (resp: any) => {
      if (resp.status === STATUS.SUCCESS) {
        this.bcGenerateTaskId = resp.data.task_id;
        this.showBcSourceCheckPro = true;
        this.lackWorkerTip(resp.realStatus);
        this.weakCopmilerId = resp.data.task_id;
        this.createCompileFileProgress(resp.data.task_id, resp.realStatus);
      } else { // 启动任务失败 || 磁盘空间不足
        this.nextDisabled = true;
        this.weakScanDisable = false;
        setTimeout(() => {
          this.nextDisabled = false;
          if (this.intellijFlag) {
            this.changeDetectorRef.markForCheck();
            this.changeDetectorRef.detectChanges();
          }
        }, 1000);
        if (!this.intellijFlag) {
          // worker为0
          if (resp.realStatus === PortWorkerStatus.CREATE_TASK_NOWORKER_STATUS) {
            this.utilsService.showMessageByWorker('error');
            return;
          }
        }
        if (resp.realStatus === STATUS.NOPERMISSION) {
          const message = {
            cmd: 'noPermissionFaqTip',
            data: {
              res: resp,
            }
          };
          this.vscodeService.postMessage(message, null);
        } else {
          this.showMessageByLang(resp, 'error');
        }
      }
      if (this.intellijFlag) {
        this.changeDetectorRef.markForCheck();
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  // 生成make.out 文件进度条
  createCompileFileProgress(taskId: any, status: any) {
    this.weakScanDisable = true;
    const message = {
      cmd: 'weakCompileProgress',
      data: {
        taskId,
        status,
        showProcess: this.showBcSourceCheckPro
      }
    };
    this.vscodeService.postMessage(message, (data: any) => {
      if (data.data.runningstatus === STATUS.SUCCESS) {
        this.showMessageByLang(data.data, 'info');
        const results = data.data.result.split('/');
        this.weakCompilerName = results[results.length - 1];
        this.getBcList(taskId);
        this.curStep = 2;
      }
      if (data.realStatus === '0x0d0b11') {
        this.bcDisabled = true;
        this.curStep = 1;
      }
      if (data.realStatus === '0x0d0b20') {
        this.showMessageByLang(data, 'info');
      }
      this.createWeakCompilerDisabled = false;
      this.weakScanDisable = false;
      this.updatePage();
    });
  }

  public bcFileChange(event: any): void {
    this.bcFileList = [];
    for (const element of this.bcSelecteds) {
      this.bcFileList.push(element.label);
    }
    if (this.bcFileList.length > 0) {
      this.bcDisabled = false;
    } else {
      this.bcDisabled = true;
    }
    this.updatePage();
  }

  public getBcList(taskId: any) {
    this.vscodeService.get(
      {url: `/portadv/weakconsistency/tasks/${encodeURIComponent(taskId)}/bcfilelist/`},
      (data: any) => {
        if (data.status === STATUS.SUCCESS) {
          const bclist = data.data.bc_file_list;
          const newBcList = [];
          this.bcSelecteds = [];
          this.bcOptions = [];
          this.bcFileList = [];
          for (const element of bclist) {
            newBcList.push({label: element});
          }
          this.bcOptions = newBcList;
          this.updatePage();
        } else {
          this.bcSelecteds = [];
          this.bcOptions = [];
          this.bcFileList = [];
          this.showMessageByLang(data, 'error');
        }
      }
    );
    this.bcDisabled = true;
  }

  /**
   * 获取当前迁移扫描状态
   * @param id 任务id
   */
  public getStatus(id: any, realStatus: any) {
    if (this.intellijFlag) {
      this.situation = PROCESS_STATE.NOT_SHOW;
      this.vscodeService.postMessage({
        cmd: 'precheckProgress',
        data: {
          taskId: id,
          status: realStatus
        }
      }, (data: any) => {
        this.byteBtnDisabled = false;
        this.createBtnDisabled = false;
        this.cacheBtnDisabled = false;
        if (data.data.status === TASK_STATUS.DONE) {
          if (data.data.scan_result !== '') {
            const navigateParam = {
              queryParams: {
                taskId: data.data.task_name,
                taskType: TASK_TYPE.PRECHECK.toString(),
                workspace: this.preCheckWorkspace
              }
            };
            this.vscodeService.postMessage({
              cmd: 'goEnhancedReportDetail',
              data: navigateParam.queryParams
            }, null);
          }
        }
        if (this.intellijFlag) {
          this.changeDetectorRef.markForCheck();
          this.changeDetectorRef.detectChanges();
        }
      });
    } else {
      this.bit64Progress(id);
    }
  }

  public getCacheStatus(id: any, realStatus: any) {
    if (this.intellijFlag) {
      this.situation = PROCESS_STATE.NOT_SHOW;
      this.vscodeService.postMessage({
        cmd: 'cacheLineProgress',
        data: {
          taskId: id,
          status: realStatus
        }
      }, (data: any) => {
        this.byteBtnDisabled = false;
        this.createBtnDisabled = false;
        this.cacheBtnDisabled = false;
        if (data.data.status === TASK_STATUS.DONE) {
          if (data.data.scan_result !== '') {
            const navigateParam = {
              queryParams: {
                taskId: data.data.task_name,
                taskType: TASK_TYPE.CACHE_CHECK.toString(),
                workspace: this.cacheCheckWorkspace
              }
            };
            // 使用原来的打开增强功能的报告
            this.vscodeService.postMessage({
              cmd: 'goEnhancedReportDetail',
              data: navigateParam.queryParams
            }, null);
          }
        }
        if (this.intellijFlag) {
          this.changeDetectorRef.markForCheck();
          this.changeDetectorRef.detectChanges();
        }
      });
    } else {
      this.cacheAlignProgress(id);
    }
  }

  /**
   * 64运行模式检查进度条
   * @param taskId 任务id
   */
  private bit64Progress(taskId: string) {
    const message = {
      cmd: 'bit64Progress',
      data: {
        taskId,
        showProcess: this.showPreCheckPro
      }
    };
    this.vscodeService.postMessage(message, (data: any) => {
      this.byteBtnDisabled = false;
      this.createBtnDisabled = false;
      this.cacheBtnDisabled = false;
      if (data.status === STATUS.SUCCESS && data.data.status === TASK_STATUS.DONE) {
        if (data.data.scan_result === '') {
          this.progressInfo = this.i18n.plugins_porting_message_portcheck_noModify;
          this.showInfoBox(this.progressInfo, 'info', data.realStatus);
        } else {
          this.progressInfo = this.formatCreatedId(data.data.task_name);
          this.situation = PROCESS_STATE.NOT_SHOW;
          const time = this.formatCreatedId(data.data.task_name);
          const msg = this.i18nService.I18nReplace(this.i18n.common_term_portingcheck_success,
            {0: time});
          this.showInfoBox(msg, 'info', data.realStatus);
          ((self as any).webviewSession || {}).setItem('situation', PROCESS_STATE.NOT_SHOW);
          ((self as any).webviewSession || {}).setItem('info', this.progressInfo);
          const obj = data.data.scan_result;
          const arr: any[] = [];
          for (const key of Object.keys(obj)) {
            arr.push(key);
          }
          setTimeout(() => {
            const navigateParam = {
              queryParams: {
                taskId: data.data.task_name,
                taskType: TASK_TYPE.PRECHECK,
                filePath: arr,
                workspace: this.preCheckWorkspace,
                osMappingDir: data.data.os_mapping_dir !== undefined ? data.data.os_mapping_dir : '',
                vscodePlatform: data.vscodePlatform
              }
            };
            this.router.navigate(['/enchanceReport'], navigateParam);
          }, 0);
        }
      } else if (data.status === STATUS.FAIL && data.realStatus !== '0x0d0511') {  // 0x0d0511 任务不存在
        this.progressInfo = data.data.status === 4 // 是否为 系统 cmake 不存在
          ? (
            (((self as any).webviewSession || {}).getItem('language') === 'zh-cn')
              ? data.data.info_chinese
              : data.data.error_info
          ) : this.i18n.plugins_porting_message_portcheck_runError;
        this.showInfoBox(this.progressInfo, 'error', data.realStatus);
      }
    });

  }

  // 字节对齐进度条
  private byteAlignProgress(taskId: any, status: any) {
    const message = {
      cmd: 'byteAlignProgress',
      data: {
        taskId,
        status,
        showProcess: this.showByteCheckPro
      }
    };
    this.vscodeService.postMessage(message, (data: any) => {
      this.byteBtnDisabled = false;
      if (data.status === STATUS.SUCCESS) {
        if (data.data.status === TASK_STATUS.DONE) {
          this.curCountByteAlign = 0;
          this.clearTimerByteAlign();
          if (data.data.scan_result === '' || data.data.scan_result === []) {
            this.showI18nInfoBox('plugins_porting_message_portcheck_noModify', 'error');
            setTimeout(() => {
              this.situation = PROCESS_STATE.NOT_SHOW;
              (self as any).webviewSession.setItem('situation', PROCESS_STATE.NOT_SHOW);
            }, 3000);
          } else {
            ((self as any).webviewSession || {}).setItem('situation', PROCESS_STATE.NOT_SHOW);
            const time = this.formatCreatedId(data.data.task_id);
            const msg = this.i18nService.I18nReplace(this.i18n.common_term_bytecheck_success,
              {0: time});
            this.showInfoBox(msg, 'info', data.realStatus);
            setTimeout(() => {
              const param = {
                id: data.data.task_id,
                result_path: data.data.scan_result,
              };
              this.vscodeService.postMessage({cmd: 'createByteAlignCheckTree', data: param}, null);
              const navigateParam = {
                queryParams: {
                  taskId: data.data.task_id,
                  taskType: TASK_TYPE.BYTE_CHECK.toString(),
                  filePath: data.data.scan_result,
                  command: this.inputItems.command.value,
                  selected: this.inputItems.tool.selected.label,
                  workspace: this.byteCheckWorkspace,
                  osMappingDir:
                    data.data.os_mapping_dir !== undefined ? data.data.os_mapping_dir : '',
                  vscodePlatform: data.vscodePlatform
                }
              };
              if (this.intellijFlag) {
                this.vscodeService.postMessage({
                  cmd: 'goEnhancedReportDetail',
                  data: navigateParam.queryParams
                }, null);
              } else {
                this.router.navigate(['/enchanceReport'], navigateParam);
              }
            }, 0);

            this.situation = PROCESS_STATE.NOT_SHOW;
          }
        } else if (data.data.status === 3) {
          this.curCountByteAlign = 0;
          this.clearTimerByteAlign();
          this.showMessageByLang(data, 'info');
          setTimeout(() => {
            this.situation = PROCESS_STATE.NOT_SHOW;
            (self as any).webviewSession.setItem('situation', PROCESS_STATE.NOT_SHOW);
          }, 3000);
        }
      } else if (data.status === STATUS.FAIL) {
        this.situation = PROCESS_STATE.NOT_SHOW;
        this.curCountByteAlign = 0;
        this.clearTimerByteAlign();
        if (this.intellijFlag) {
          this.showMessageByLang(data, 'error');
        }
      } else {
        this.curCountByteAlign++;
        if (this.curCountByteAlign <= this.maxCount) {
          this.clearTimerByteAlign();
        }
        if (this.intellijFlag) {
          this.showMessageByLang(data, 'error');
        }
      }
      if (this.intellijFlag) {
        this.changeDetectorRef.markForCheck();
        this.changeDetectorRef.detectChanges();
      }
    });

  }

  // 缓存行对齐进度条
  private cacheAlignProgress(taskId: any) {
    const message = {
      cmd: 'cacheLineProgress',
      data: {
        taskId,
        showProcess: this.showCacheCheckPro
      }
    };
    this.vscodeService.postMessage(message, (data: any) => {
      this.byteBtnDisabled = false;
      this.createBtnDisabled = false;
      this.cacheBtnDisabled = false;
      if (data.status === STATUS.SUCCESS && data.data.status === TASK_STATUS.DONE) {
        if (data.data.scan_result === '') {
          this.progressInfo = this.i18n.plugins_common_cacheline_check.success_tip_without_contents_tip;
          this.showInfoBox(this.progressInfo, 'info', data.realStatus);
        } else {
          this.progressInfo = this.formatCreatedId(data.data.task_name);
          this.situation = PROCESS_STATE.NOT_SHOW;
          const time = this.formatCreatedId(data.data.task_name);
          const msg = this.i18nService.I18nReplace(this.i18n.common_term_cachecheck_success,
            {0: time});
          this.showInfoBox(msg, 'info', data.realStatus);
          ((self as any).webviewSession || {}).setItem('situation', PROCESS_STATE.NOT_SHOW);
          ((self as any).webviewSession || {}).setItem('info', this.progressInfo);
          const obj = data.data.scan_result;
          const arr: any[] = [];
          for (const key of Object.keys(obj)) {
            arr.push(key);
          }
          setTimeout(() => {
            const navigateParam = {
              queryParams: {
                taskId: data.data.task_name,
                taskType: TASK_TYPE.CACHE_CHECK,
                filePath: arr,
                workspace: this.cacheCheckWorkspace,
                osMappingDir: data.data.os_mapping_dir !== undefined ? data.data.os_mapping_dir : '',
                vscodePlatform: data.vscodePlatform
              }
            };
            this.router.navigate(['/enchanceReport'], navigateParam);
          }, 0);
        }
      } else if (data.status === STATUS.FAIL && data.realStatus !== '0x0d0511') {  // 0x0d0511 任务不存在
        this.showInfoBox(this.progressInfo, 'error', data.realStatus);
      }
    });
  }

  private clearTimerByteAlign() {
    if (this.getStatusTimerByteAlign) {
      clearTimeout(this.getStatusTimerByteAlign);
      this.getStatusTimerByteAlign = null;
    }
  }

  chooseLangType(data: any) {
    let info = '';
    if (((self as any).webviewSession || {}).getItem('language') === 'zh-cn') {
      info = data.data;
    } else {
      info = data.info;
    }
    return info;
  }

  formatCreatedId(data: any) {
    const years = data.slice(0, 4);
    const months = data.slice(4, 6);
    const days = data.slice(6, 8);
    const hours = data.slice(8, 10);
    const minutes = data.slice(10, 12);
    const seconds = data.slice(12, 14);
    return `${years}/${months}/${days} ${hours}:${minutes}:${seconds}`;
  }

  showUpload() {
    if (!this.isUploading) {
      this.hoverFlag = true;
    }
  }

  hideUpload() {
    this.hoverFlag = false;
  }

  keyupAreaMatch(screen?: string) {
    if (((self as any).webviewSession || {}).getItem('isFirst') !== '1'
      && ((self as any).webviewSession || {}).getItem('isExpired') !== '1') {
      this.inputAreaMatch(screen);
    }
    this.updatePage();
  }

  inputAreaMatch(screen: string) {
    if (((self as any).webviewSession || {}).getItem('isFirst') !== '1'
      && ((self as any).webviewSession || {}).getItem('isExpired') !== '1') {
      const path = this.getTextareaStr(screen);
      let filename;
      const lastIndex = path.lastIndexOf(',');
      if (lastIndex) {
        filename = path.slice(lastIndex + 1, path.length);
      } else {
        filename = path;
      }
      const params = {path: this.selectType.curSelObj.path + filename};
      this.pathlist = [];
      this.vscodeService.post({url: '/pathmatch/', params}, (data: any) => {
        const beforeArr = path.split(',');
        if (data) {
          let afterArr = data.pathlist;
          let idx = path.lastIndexOf(',');
          if (idx >= 0) {
            idx = path.length - idx;
          }
          if (idx === 1) {
            afterArr = this.arrDiff(beforeArr, afterArr, true);
            this.pathlist = afterArr;
            return;
          }
          if (afterArr.length > 1) {
            afterArr = this.arrDiff(beforeArr, afterArr, false);
          }
          this.pathlist = afterArr;
        }
        if (this.intellijFlag) {
          this.changeDetectorRef.markForCheck();
          this.changeDetectorRef.detectChanges();
        }
      });
    }
  }

  arrDiff(beforeArr: any, afterArr: any, flag: any) {
    if (flag) {
      beforeArr.forEach((item: any) => {
        if (item) {
          afterArr = afterArr.filter((after: any) => {
            return after !== item;
          });
        }
      });
    } else {
      const before = beforeArr[beforeArr.length - 1];
      afterArr = afterArr.filter((after: any) => {
        return after.indexOf(before) >= 0;
      });
    }
    return afterArr;
  }

  /**
   * 获取当前页面对应的输入框内容
   */
  getTextareaStr(screen?: string) {
    let inputStr: string;
    const scene = screen || this.selectType.selectedId;
    switch (scene) {
      case 'precheck':
        inputStr = this.inputValuePrecheck;
        break;
      case 'byte':
        inputStr = this.inputValueByte;
        break;
      case 'cache':
        inputStr = this.inputValueCache;
        break;
      case 'weak':
        inputStr = this.weakFileName;
        break;
      default:
        inputStr = this.inputValuePrecheck;
        break;
    }
    return inputStr;
  }

  /**
   * 填充转换输入框内容
   */
  fillTextarea(value: any, screen?: string) {
    let textareaString = this.getTextareaStr(screen);
    // 统一处理
    const lastIndex = textareaString.lastIndexOf(',');
    if (!this.multipleInput) {
      textareaString = value;
    } else {
      if (lastIndex) {
        textareaString = textareaString.slice(0, lastIndex + 1) + value + ',';
      } else {
        textareaString = value + ',';
      }
    }
    // 返回各异值
    this.resetTextareaString(textareaString, screen);
    return textareaString;
  }

  /**
   * 重置当前页面对应的输入框内容
   */
  resetTextareaString(resetStr: string, screen?: string) {
    const scene = screen || this.selectType.selectedId;
    switch (scene) {
      case 'precheck':
        this.inputValuePrecheck = resetStr;
        break;
      case 'byte':
        this.inputValueByte = resetStr;
        break;
      case 'cache':
        this.inputValueCache = resetStr;
        break;
      case 'weak':
        this.weakFileName = resetStr;
        break;
      default:
        this.inputValuePrecheck = resetStr;
        break;
    }
    return;
  }

  areaMatchDis(screen: string) {
    this.displayAreaMatch = true;
    this.inputAreaMatch(screen);
  }

  blurAreaMatch() {
    this.displayAreaMatch = false;
  }

  clickAreaMatch(value: any, screen: string) {
    this.fillTextarea(value, screen);
    this.displayAreaMatch = false;
    this.pathlist = [];
    if (this.intellijFlag) {
      this.changeDetectorRef.markForCheck();
      this.changeDetectorRef.detectChanges();
    }
  }

  // textarea 子列表内容改变
  clickWeakMatch(value: any) {
    this.fillTextarea(value);
    this.displayAreaMatch = false;
    this.weakPathList = [];
    this.updatePage();
  }

  // 压缩包上传触发函数
  public zipUpload(typeNum: string) {
    if (this.intellijFlag) {
      if (this.selectType.selectedId === 'weak') {
        this.uploadWeakFile('normal', typeNum);
      } else {
        this.uploadFile('normal', typeNum);
      }
    } else {
      this.vscodeService.postMessage({cmd: 'getCurrentAppName'}, (appName: string) => {
        if (appName === 'CloudIDE') {
          this.vscodeService.postMessage({
            cmd: 'cloudIDEupload',
          }, (fileProps: Array<any>) => {
            if (this.selectType.selectedId === 'weak') {
              this.uploadWeakFile('normal', typeNum, fileProps);
            } else {
              this.uploadFile('normal', typeNum, fileProps);
            }
          });
        } else {
          this.elementRef.nativeElement.querySelector('#zipload').value = '';
          this.elementRef.nativeElement.querySelector('#zipload').click();
        }
      });
    }
  }

  // 上传内存一致性编译成功文件，intellij
  public uploadCompileFile() {
    if (this.intellijFlag) {
      this.uploadWeakFile('normal', '7');
    }
  }


  showI18nInfoBox(key: any, type: any) {
    const message = {
      cmd: 'showInfoBox',
      data: {
        info: this.i18n[key],
        type
      }
    };
    this.vscodeService.postMessage(message, null);
  }

  showInfoBox(info: any, type: any, realStatus: any) {
    const message = {
      cmd: 'showInfoBox',
      data: {
        info,
        type,
        realStatus,
      }
    };
    this.vscodeService.postMessage(message, null);
  }

  /**
   * 右键亲和扫描intellij分析前上传文件
   * @param type 上传文件scan_type
   */
  intellijUploadAndCheckRightClickFile(type: string) {
    this.isCommit = true;
    const params = {
      cmd: 'rightClickUploadPortingFile',
      data: {
        url: '/portadv/tasks/check_upload/',
        filePath: this.localFilePath,
        scan_type: type,
        need_unzip: 'true',
        choice: 'override',
        not_chmod: type === UPLOAD_FILE_SCAN_TYPE.BYTE_CHECK ? 'false' : 'true',
        uploadFilePath: this.uploadFilePath,
        saveFileName: this.fileName + '.zip'
      }
    };
    this.vscodeService.postMessage(params, (res: any) => {
      this.isUploading = false;
      this.isCommit = false;
      if (res.status === STATUS.SUCCESS) {
        const uploadMsg = {
          cmd: 'uploadFileIntellij',
          data: {
            scan_type: type,
            need_unzip: 'true',
            choice: 'override',
            not_chmod: type === UPLOAD_FILE_SCAN_TYPE.BYTE_CHECK ? 'false' : 'true',
            is_file: 'true',
            uploadFilePath: this.localFilePath,
            saveFileName: this.fileName + '.zip'
          }
        };
        this.vscodeService.postMessage(uploadMsg, (resp: any) => {
          this.isUploading = false;
          if (resp.status === STATUS.SUCCESS) {
            // 文件回填

            this.isShow = false;
            this.isCompress = false;
            this.isUploadSuccess = true;
            this.isCommit = false;
            // 进行判断调用哪个任务
            this.resetTextareaString(this.fileName);
            if (type === UPLOAD_FILE_SCAN_TYPE.BYTE_CHECK) {
              this.portCheckMigrationscanCreateReport();
            } else if (type === UPLOAD_FILE_SCAN_TYPE.PRECHECK) {
              this.byteAlignCheckCreateReport();
            } else if (type === UPLOAD_FILE_SCAN_TYPE.WEAK_CHECK) {
              this.createCompilerFile();
            } else if (type === UPLOAD_FILE_SCAN_TYPE.CACHE_CHECK) {
              this.cacheAlignCheckAndCreateReport();
            }
          } else if (resp.realStatus === STATUS.MAXIMUM_TASK) { // 等待上传中
            this.isUploading = true;
            this.handleUploadWaiting(uploadMsg, resp);
          } else if (resp.realStatus === STATUS.INSUFFICIENT_SPACE) {
            this.utilsService.sendDiskAlertMessage();
          } else if (resp === 'timeout') {
            this.isCompress = false;
          } else {
            this.showInfoBox(resp, 'error', true);
            this.inputItems.path.value = '';
            this.isShow = false;
            this.isCompress = false;
          }
          this.changeDetectorRef.markForCheck();
          this.changeDetectorRef.detectChanges();
        });
      } else if (res.realStatus === STATUS.INSUFFICIENT_SPACE) {
        this.utilsService.sendDiskAlertMessage();
      } else {
        this.showInfoBox(res.data, 'error', false);
      }
      this.changeDetectorRef.markForCheck();
      this.changeDetectorRef.detectChanges();
    });
  }

  portCheckMigrationscanCreateReport() {
    this.situation = PROCESS_STATE.NOT_SHOW;
    this.createBtnDisabled = true;
    const params = {
      scan_file: this.getTextareaStr().length > 0 ? this.getTextareaStr() : this.fileName,
      os_mapping_dir: ''
    };
    if (this.localFilePath.length > 0) {
      params.os_mapping_dir = this.localFilePath;
    }
    this.vscodeService.post({url: '/portadv/tasks/migrationscan/', params}, (data: any) => {
      if (data.status === STATUS.SUCCESS) {
        this.lackWorkerTip(data.realStatus);
        ((self as any).webviewSession || {}).setItem('id', data.data.id);
        this.showPreCheckPro = true;
        this.getStatus(data.data.id, data.realStatus);
        this.taskId = data.data.id;
        ((self as any).webviewSession || {}).setItem('taskId', data.data.id);
      } else if (data.realStatus === STATUS.INSUFFICIENT_SPACE) {
        this.utilsService.sendDiskAlertMessage();
        this.createBtnDisabled = false;
      } else {
        this.situation = PROCESS_STATE.NOT_SHOW;
        this.createBtnDisabled = false;
        if (!this.intellijFlag) {
          // worker为0
          if (data.realStatus === PortWorkerStatus.CREATE_TASK_NOWORKER_STATUS) {
            this.utilsService.showMessageByWorker('error');
            return;
          }
        }
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
      if (this.intellijFlag) {
        this.changeDetectorRef.markForCheck();
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  /**
   * 64位运行模式检查
   */
  portCheck() {
    if (this.localFilePath.length !== 0) {
      if (this.intellijFlag) {
        this.intellijUploadAndCheckRightClickFile(UPLOAD_FILE_SCAN_TYPE.BYTE_CHECK);
      } else {
        this.uploadRightClickFile(SCAN_TYPE.PRECHECK);
      }
    } else {
      if (!this.inputValuePrecheck
        || this.inputValuePrecheck.length > CustomValidators.MAXFILENAMELENGTH) {
        return;
      }
      // 不需要上传文件直接进行检查
      this.portCheckMigrationscanCreateReport();
    }
  }

  /**
   * 上传右键文件
   */
  uploadRightClickFile(scanType: string) {
    this.isCommit = true;
    const params = {
      cmd: 'uploadPortingFile',
      data: {
        filePath: this.localFilePath,
        scan_type: scanType
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
            filePath: this.localFilePath,
            need_unzip: 'true',
            autoPack: {
              'scan-type': scanType,
              choice: 'override'
            },
            fileName: this.fileName,
            isSingle: false,
            uploadPrefix: this.i18n.plugins_porting_uploadPrefix_portCheck
          }
        };
        this.vscodeService.postMessage(uploadMsg, (resp: any) => {
          this.isUploading = false;
          if (resp.status === STATUS.SUCCESS) {
            this.showI18nInfoBox('plugins_porting_message_folderSucess', 'info');
            switch (scanType) {
              case SCAN_TYPE.PRECHECK:
                this.portCheckMigrationscanCreateReport();
                break;
              case SCAN_TYPE.BYTECHECK:
                this.byteAlignCheckCreateReport();
                break;
              case SCAN_TYPE.CACHECHECK:
                this.cacheAlignCheckAndCreateReport();
                break;
              case SCAN_TYPE.CONTENT:
                this.createCompilerFile();
                break;
              default:
                this.portCheckMigrationscanCreateReport();
                break;
            }
            this.isCommit = false;
          } else if (resp.realStatus === STATUS.MAXIMUM_TASK) { // 等待上传中
            this.isUploading = true;
            this.handleUploadWaiting(uploadMsg, resp);
          } else if (resp.realStatus === STATUS.INSUFFICIENT_SPACE) {
            this.utilsService.sendDiskAlertMessage();
          } else if (resp === 'timeout') {
            this.showI18nInfoBox('common_term_report_500', 'warn');
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


  byteAlignCheckCreateReport() {
    this.situation = PROCESS_STATE.NOT_SHOW;
    this.byteBtnDisabled = true;
    this.createBtnDisabledTip = this.i18n.common_term_creating_btn_disabled_tip;
    const params = {
      sourcedir:
        this.getTextareaStr().length > 0
          ? this.workspace + this.getTextareaStr()
          : this.workspace + this.fileName,
      constructtool: this.inputItems.tool.selected.label,
      compilecommand: this.inputItems.command.value,
      os_mapping_dir: ''
    };
    if (this.localFilePath.length > 0) {
      params.os_mapping_dir = this.localFilePath;
    }
    const info = {
      info: params
    };
    this.vscodeService.post({url: '/portadv/tasks/migration/bytealignment/task/', params: info}, (data: any) => {
      if (data.status === STATUS.SUCCESS) {
        this.lackWorkerTip(data.realStatus);
        this.showByteCheckPro = true;
        this.byteAlignProgress(data.data.id, data.realStatus);
      } else {
        this.byteBtnDisabled = false;
        if (!this.intellijFlag) {
          // worker为0
          if (data.realStatus === PortWorkerStatus.CREATE_TASK_NOWORKER_STATUS) {
            this.utilsService.showMessageByWorker('error');
            return;
          }
        }
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
      if (this.intellijFlag) {
        this.changeDetectorRef.markForCheck();
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  /**
   * 64位环境迁移预检-结构类型定义对齐检查-对齐检查
   */
  public byteAlignCheck() {
    if ( this.inputItems.tool.selected.label !== 'automake' && !this.commandControl.valid ) { return; }
    if (this.localFilePath.length !== 0) {
      if (this.intellijFlag) {
        this.intellijUploadAndCheckRightClickFile(UPLOAD_FILE_SCAN_TYPE.PRECHECK);
      } else {
        this.uploadRightClickFile(SCAN_TYPE.BYTECHECK);
      }
    } else {
      if (!this.inputValueByte
        || this.inputValueByte.length > CustomValidators.MAXFILENAMELENGTH) {
        return;
      }
      // 不需要上传文件直接进行检查
      this.byteAlignCheckCreateReport();
    }
  }

  cacheAlignCheck() {
    if (this.localFilePath.length !== 0) {
      if (this.intellijFlag) {
        this.intellijUploadAndCheckRightClickFile(UPLOAD_FILE_SCAN_TYPE.CACHE_CHECK);
      } else {
        this.uploadRightClickFile(SCAN_TYPE.CACHECHECK);
      }
    } else {
      if (!this.inputValueCache
        || this.inputValueCache.length > CustomValidators.MAXFILENAMELENGTH) {
        return;
      }
      // 不需要上传文件直接进行检查
      this.cacheAlignCheckAndCreateReport();
    }
  }

  /**
   * 缓存行检查和生成报告
   */
  cacheAlignCheckAndCreateReport() {
    this.situation = PROCESS_STATE.NOT_SHOW;
    this.cacheBtnDisabled = true;
    const params = {
      scan_file: this.getTextareaStr().length > 0 ? this.getTextareaStr() : this.fileName,
      os_mapping_dir: ''
    };
    if (this.localFilePath.length > 0) {
      params.os_mapping_dir = this.localFilePath;
    }
    this.vscodeService.post({url: '/portadv/tasks/migration/cachelinealignment/task/', params}, (data: any) => {
      if (data.status === STATUS.SUCCESS) {
        this.lackWorkerTip(data.realStatus);
        ((self as any).webviewSession || {}).setItem('id', data.data.id);
        this.showCacheCheckPro = true;
        this.getCacheStatus(data.data.id, data.realStatus);
        this.taskId = data.data.id;
        ((self as any).webviewSession || {}).setItem('taskId', data.data.id);
      } else if (data.realStatus === STATUS.INSUFFICIENT_SPACE) {
        this.utilsService.sendDiskAlertMessage();
        this.cacheBtnDisabled = false;
      } else {
        this.situation = PROCESS_STATE.NOT_SHOW;
        this.cacheBtnDisabled = false;
        if (!this.intellijFlag) {
          // worker为0
          if (data.realStatus === PortWorkerStatus.CREATE_TASK_NOWORKER_STATUS) {
            this.utilsService.showMessageByWorker('error');
            return;
          }
        }
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
      if (this.intellijFlag) {
        this.changeDetectorRef.markForCheck();
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  /**
   * 对上传的压缩包进行相关处理,weak
   * @param choice 上传的模式
   * @param type 任务类型
   */
  public handleZip(choice: string, type: string, fileProps?: Array<any>) {
    this.exitMask.Close();
    this.uploadStartFlag = false;
    let file;
    if (choice === 'normal') {
      if (fileProps) {
        file = fileProps[0];
      } else {
        file = type === SCAN_TYPE.CONTENT
          ? this.elementRef.nativeElement.querySelector('#zipload').files[0]
          : this.elementRef.nativeElement.querySelector('#compilerfile').files[0];
      }
      this.uploadZipFile = file;
    } else {
      file = this.uploadZipFile;
    }
    this.fileInfo.filename = file.name;
    if (this.utilsService.checkUploadFileNameValidity(this.fileInfo.filename)) {
      this.isCompress = false;
      this.showInfoBox(this.i18n.plugins_porting_tips_fileNameIsValidity, 'error', '');
      return null;
    }
    const size = file.size / 1024 / 1024;
    if (size > fileSize) {
      this.isCompress = false;
      this.showI18nInfoBox('plugins_porting_message_fileExceedMaxSize', 'info');
      return null;
    }
    this.fileInfo.filesize = size.toFixed(1);
    let params = {
      file_size: file.size,
      file_name: file.name,
      need_unzip: 'true',
      scan_type: type,
      choice
    };
    if (choice === 'save_as') {
      this.fileInfo.filename = `${this.exitFileName}${this.suffix}`;
      params = {
        file_size: file.size,
        file_name: this.fileInfo.filename,
        need_unzip: 'true',
        scan_type: type,
        choice
      };
    } else if (choice === 'override') {
      this.fileInfo.filename = `${this.oldName}${this.suffix}`;
      params = {
        file_size: file.size,
        file_name: this.fileInfo.filename,
        need_unzip: 'true',
        scan_type: type,
        choice
      };
    }
    return {
      file,
      params
    };
  }

  /**
   * 内存一致性上传文件夹按钮
   */
  uploadFolder() {
    if (this.intellijFlag) {
      this.toZipCode('normal', '6');
      return;
    }
    this.elementRef.nativeElement.querySelector('#filesUp').value = '';
    this.elementRef.nativeElement.querySelector('#filesUp').click();
  }

  /**
   * 64位|结构体字节|cache上传源码文件夹按钮
   */
  filesUpload(typeNum: string) {
    if (this.intellijFlag) {
      this.toZip('normal', typeNum);
      return;
    }
    this.elementRef.nativeElement.querySelector('#files').click();
    this.elementRef.nativeElement.querySelector('#files').value = '';
  }

  /**
   * 对上传的文件夹进行相关处理,weak,precheck,byte,cache
   * @param choice 上传的模式
   * @param type 任务类型
   */
  public handleFolder(choice: string, type: string) {
    const zip = new JSZip();
    this.isUploadZip = false;
    let inputDom: any;
    let fileList: any;
    if (choice === 'normal') {
      // file.files 是一个fileList对象 fileList里面是file对象
      if (type !== '') {
        inputDom = this.elementRef.nativeElement.querySelector('#filesUp');
      } else {
        inputDom = this.elementRef.nativeElement.querySelector('#files');
      }
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
    return {
      files,
      sizeCount,
      inputDom
    };
  }


  /**
   * 内存一致性上传源码文件夹
   */
  public toZipCode(choice: string, type: string): any {
    this.isUploadZip = false;
    if (this.intellijFlag) { // do intellij上传文件。
      this.weakScanType = type;
      const uploadMsg = {
        cmd: 'checkUploadFileIntellij',
        data: {
          url: '/portadv/tasks/check_upload/',
          scan_type: type,
          need_unzip: type === SCAN_TYPE.CONTENT ? 'true' : 'false',
          choice,
          notChmod: 'true',
          code_path: type === SCAN_TYPE.CONTENT ? '' : this.weakFileName,
          isDuplicated: this.isDuplicated.toString(),
          uploadFilePath: this.uploadFilePath,
          saveFileName: (choice === 'override' ? this.overrideFileName : this.exitFileName) + '.zip',
          is_file: 'true',
        }
      };
      this.isDuplicated = false;
      this.vscodeService.postMessage(uploadMsg, (resp: any) => {
        if (resp) {
          this.isUploading = true;
          this.changeDetectorRef.markForCheck();
          this.changeDetectorRef.detectChanges();
          this.handleWeakFileUploadCallBack(type, choice, resp);
        }
      });
      return;
    }
    this.exitMask.Close();
    this.uploadStartFlag = false;
    const {files, sizeCount, inputDom} = this.handleFolder(choice, type);
    this.fileInfo.filename = this.outfilepath;
    if (this.utilsService.checkUploadFileNameValidity(this.fileInfo.filename)) {
      this.isCompress = false;
      this.showInfoBox(this.i18n.plugins_porting_tips_fileNameIsValidity, 'error', '');
      return null;
    }
    const size = sizeCount / 1024 / 1024;
    if (size > fileSize) {
      this.isCompress = false;
      this.showI18nInfoBox('plugins_porting_message_fileExceedMaxSize', 'info');
      return null;
    }
    this.fileInfo.filesize = size.toFixed(1);
    let params: any;
    if (choice === 'save_as') {
      params = {
        file_size: sizeCount,
        file_name: this.exitFileName + '.zip',
        need_unzip: 'true',
        scan_type: type,
        choice
      };
      this.fileInfo.filename = this.exitFileName + '.zip';
    } else if (choice === 'override') {
      params = {
        file_size: sizeCount,
        file_name: this.oldName + '.zip',
        need_unzip: 'true',
        scan_type: type,
        choice
      };
      this.info.filename = this.oldName + '.zip';
    } else {
      params = {
        file_size: sizeCount,
        file_name: this.outfilepath + '.zip',
        need_unzip: 'true',
        scan_type: type,
        choice,
      };
    }
    const file = {
      name: (choice === 'override') ? this.oldName + '.zip' : this.outfilepath + '.zip'
    };
    let filePath: any;
    if (choice === 'override') {
      filePath = this.oldName;
    } else {
      filePath = this.outfilepath;
    }
    // 检查文件是否能够上传
    this.vscodeService.post({url: '/portadv/tasks/check_upload/', params}, (data: any) => {
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
              'scan-type': type,
              choice
            },
            uploadPrefix: this.i18n.plugins_porting_uploadPrefix_sourceCode
          }
        };
        this.vscodeService.postMessage(uploadMsg, (resp: any) => {
          if (resp) {
            this.suffix = '';
            this.exitFileName = '';
            this.exitMask.Close();
            this.isUploading = false;
            if (resp.status === STATUS.SUCCESS) {
              let num = file.name.lastIndexOf('.');
              let filename = file.name.substring(0, num);
              if (filename.lastIndexOf('.tar') > 0) {
                num = filename.lastIndexOf('.');
                filename = filename.substring(0, num);
              }

              if (type === SCAN_TYPE.CONTENT) {
                this.weakFileName = resp.data;
              } else {
                this.weakCompilerName = resp.data;
                $('#compilerfile').val('');
              }
              this.isUploadSuccess = true;
              this.showI18nInfoBox('common_term_upload_success', 'info');
            } else if (resp.realStatus === STATUS.INSUFFICIENT_SPACE) {
              this.utilsService.sendDiskAlertMessage();
            } else if (resp.realStatus === STATUS.MAXIMUM_TASK) { // 等待上传中
              this.isUploading = true;
              this.handleUploadWaiting(uploadMsg, resp);
            } else if (resp === 'timeout') {
              this.showInfoBox(this.i18n.common_term_report_500, 'warn', '');
              this.isCompress = false;
            } else {
              if (type === SCAN_TYPE.CONTENT) {
                this.weakFileName = '';
              } else {
                $('#compilerfile').val('');
                this.weakCompilerName = '';
              }
              this.isShow = false;
              this.isCompress = false;
              this.showMessageByLang(resp, 'error');
            }
          }
        });
      } else if (data.realStatus === STATUS.INSUFFICIENT_SPACE) { // 磁盘告警
        if (type === SCAN_TYPE.CONTENT) {
          $('#zipload').val('');
        } else {
          $('#compilerfile').val('');
        }
        this.utilsService.sendDiskAlertMessage();
        this.isUploading = false;
      } else {
        // check_upload异常情况，文件已存在
        if (data.info.indexOf('file already exist') > -1) {
          this.exitFileName = data.data.new_name;
          this.oldName = data.data.old_name;
          this.exitFileNameReplace =
            this.i18nService.I18nReplace(this.i18n.plugins_porting_message_analysis_center.exit.content,
              {0: data.data.old_name});
          if (type === SCAN_TYPE.COMPILED_FILE) { // 编译文件没有另存为功能
            this.noAgain = false;
          }
          this.exitMask.Open();
          return;
        } else {
          if (type === SCAN_TYPE.CONTENT) {
            $('#zipload').val('');
          } else {
            $('#compilerfile').val('');
          }
          this.showMessageByLang(data, 'error');
        }
        this.isShow = false;
      }
    });
    inputDom.value = '';
  }

  // 处理等待上传中
  handleUploadWaiting(uploadMsg: any, resp: any) {
    const newMsg = Object.assign({}, uploadMsg, {cmd: 'waitingUploadTask'});
    this.vscodeService.postMessage(newMsg, (res: any) => {
      this.isUploading = false;
      // 轮询达到最大次数
      if (res) {
        this.showMessageByLang(resp, 'error');
      }
    });
  }

  /**
   * 64位迁移预检|结构体字节对齐|缓存行对齐上传源码文件夹
   * @param choice string:
   * @param typeNum string:
   */
  public toZip(choice: string, typeNum: string) {
    this.isUploadZip = false;
    if (this.intellijFlag) {
      this.exitMask.Close();
      const uploadMsg = {
        cmd: 'checkUploadFileIntellij',
        data: {
          url: '/portadv/tasks/check_upload/',
          scan_type: typeNum,
          need_unzip: 'true',
          choice,
          notChmod: 'true',
          isDuplicated: this.isDuplicated.toString(),
          uploadFilePath: this.uploadFilePath,
          saveFileName: (choice === 'override' ? this.overrideFileName : this.exitFileName) + '.zip',
          is_file: 'true',
          not_chmod: typeNum === SCAN_TYPE.BYTECHECK ? 'false' : 'true'
        }
      };
      this.isDuplicated = false;
      this.vscodeService.postMessage(uploadMsg, (resp: any) => {
        if (resp) {
          this.isUploading = true;
          this.changeDetectorRef.markForCheck();
          this.changeDetectorRef.detectChanges();
          this.handleFileUploadCallBack(choice, resp, typeNum);
        }
      });
      return;
    }
    this.exitMask.Close();
    this.isUploadSuccess = false;
    this.isShow = false;
    const type = '';
    const {files, sizeCount, inputDom} = this.handleFolder(choice, type);
    this.info.filename = this.outfilepath;
    if (this.utilsService.checkUploadFileNameValidity(this.info.filename)) {
      this.isShow = false;
      this.isUploading = false;
      this.showInfoBox(this.i18n.plugins_porting_tips_fileNameIsValidity, 'error', '');
      return;
    }
    const size = sizeCount / 1024 / 1024;
    if (size > fileSize) {
      this.isShow = false;
      this.showI18nInfoBox('plugins_porting_message_fileExceedMaxSize', 'info');
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
        scan_type: typeNum,
        choice
      };
      this.info.filename = this.exitFileName + '.zip';
    } else if (choice === 'override') {
      params = {
        file_size: sizeCount,
        file_name: this.oldName + '.zip',
        need_unzip: 'true',
        scan_type: typeNum,
        choice
      };
      this.info.filename = this.oldName + '.zip';
    } else {
      params = {
        file_size: sizeCount,
        file_name: this.outfilepath + '.zip',
        need_unzip: 'true',
        scan_type: typeNum,
        choice,
      };
    }
    const file = {
      name: (choice === 'override') ? this.oldName + '.zip' : this.outfilepath + '.zip'
    };
    let filePath: any;
    if (choice === 'override') {
      filePath = this.oldName;
    } else {
      filePath = this.outfilepath;
    }
    this.vscodeService.post({url: '/portadv/tasks/check_upload/', params}, (data: any) => {
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
              'scan-type': typeNum,
              choice
            },
            uploadPrefix: this.i18n.plugins_porting_uploadPrefix_sourceCode
          }
        };
        this.vscodeService.postMessage(uploadMsg, (resp: any) => {
          this.isUploading = false;
          if (resp) {
            this.suffix = '';
            this.exitFileName = '';
            this.exitMask.Close();
            if (resp.status === STATUS.SUCCESS) {
              this.fillTextarea(resp.data);
              let num = file.name.lastIndexOf('.');
              let filename = file.name.substring(0, num);
              if (filename.lastIndexOf('.tar') > 0) {
                num = filename.lastIndexOf('.');
                filename = filename.substring(0, num);
              }
              this.isShow = false;
              this.isCompress = false;
              this.isUploadSuccess = true;
              this.showI18nInfoBox('common_term_upload_success', 'info');
            } else if (resp.realStatus === STATUS.INSUFFICIENT_SPACE) {
              this.utilsService.sendDiskAlertMessage();
            } else if (resp.realStatus === STATUS.MAXIMUM_TASK) { // 等待上传中
              this.isUploading = true;
              this.handleUploadWaiting(uploadMsg, resp);
            } else if (resp === 'timeout') {
              this.showI18nInfoBox('common_term_report_500', 'warn');
              this.isCompress = false;
            } else {
              this.inputItems.path.value = '';
              this.isShow = false;
              this.isCompress = false;
              this.showMessageByLang(resp, 'error');
            }
          }
        });
      } else if (data.realStatus === STATUS.INSUFFICIENT_SPACE) {
        this.utilsService.sendDiskAlertMessage();
        this.isUploading = false;
      } else {
        if (data.data.new_name && data.data.suffix) {
          this.exitFileName = data.data.new_name;
          this.oldName = data.data.old_name;
          this.exitFileNameReplace = this.i18nService.I18nReplace(
            this.i18n.plugins_porting_message_analysis_center.exit.content,
            {0: data.data.old_name});
          this.exitMask.Open();
        }
        this.isUploading = false;
      }
    });
    inputDom.value = '';
  }

  /**
   * 内存一致性上传源码压缩包 和 编译文件
   * @param choice  上传的模式
   * @param type 任务类型  6: 上传检查内容 7：上传编译后的文件
   */
  public uploadWeakFile(choice: string, type: string, fileProps?: Array<any>) {
    this.exitMask.Close();
    this.isUploadZip = true;
    if (this.intellijFlag) {
      this.weakScanType = type;
      const uploadMsg = {
        cmd: 'checkUploadFileIntellij',
        data: {
          url: '/portadv/tasks/check_upload/',
          scan_type: type,
          need_unzip: type === SCAN_TYPE.CONTENT ? 'true' : 'false',
          choice,
          notChmod: 'true',
          validFile: type === SCAN_TYPE.CONTENT ?
            'zip,tar,tar.gz,tar.bz,tar.bz2,tar.xz,tgz,tbz,tbz2,txz' : 'out',
          code_path: type === SCAN_TYPE.CONTENT ? '' : this.weakFileName,
          isDuplicated: this.isDuplicated.toString(),
          uploadFilePath: this.uploadFilePath,
          saveFileName: (choice === 'override' ? this.overrideFileName : this.exitFileName) + this.suffix
        }
      };
      this.isDuplicated = false;
      this.vscodeService.postMessage(uploadMsg, (resp: any) => {
        if (resp) {
          this.isUploading = true;
          this.changeDetectorRef.markForCheck();
          this.changeDetectorRef.detectChanges();
          this.handleWeakFileUploadCallBack(type, choice, resp);
        }
      });
    } else {
      const {file, params} = this.handleZip(choice, type, fileProps);
      if (!file || !params) {
        return;
      }

      // 文件格式校验
      if (
        (!(/.tar$|.tar.bz$|.tar.bz2$|.tar.gz$|.tar.xz$|.tbz$|.tbz2$|.tgz$|.txz$|.zip$/).test(file.name)
          && type === SCAN_TYPE.CONTENT)
        || (!(/.out$/).test(file.name) && type === SCAN_TYPE.COMPILED_FILE)) {
        this.showI18nInfoBox('plugins_porting_tips_wrongFileType', 'error');
        this.isUploading = false;
        return;
      }

      this.weakScanType = type;
      if (type === SCAN_TYPE.COMPILED_FILE) {
        this.uploadCompilerTip.content = '';
        Object.assign(params, {
          code_path: this.weakFileName
        });
      }
      // 检查文件是否能够上传
      this.vscodeService.post({url: '/portadv/tasks/check_upload/', params}, (data: any) => {
        this.displayAreaMatch = false;
        if (data.status === STATUS.SUCCESS) {
          const uploadMsg = {
            cmd: 'uploadProcess',
            data: {
              msgID: MESSAGE_MAP.FILE_UPLOAD,
              url: '/portadv/tasks/upload/',
              fileUpload: 'true',
              filePath: file.path,
              fileSize: file.size,
              overrideName: this.fileInfo.filename,
              need_unzip: type === SCAN_TYPE.CONTENT ? true : false,
              notChmod: 'true',
              code_path: type === SCAN_TYPE.COMPILED_FILE ? this.weakFileName : '',
              autoPack: {
                choice,
                'scan-type': type
              },
              uploadPrefix: this.i18n.plugins_porting_uploadPrefix_portCheck
            }
          };
          this.vscodeService.postMessage(uploadMsg, (resp: any) => {
            if (resp) {
              this.suffix = '';
              this.exitFileName = '';
              this.exitMask.Close();
              this.isUploading = false;
              if (resp.status === STATUS.SUCCESS) {
                let num = file.name.lastIndexOf('.');
                let filename = file.name.substring(0, num);
                if (filename.lastIndexOf('.tar') > 0) {
                  num = filename.lastIndexOf('.');
                  filename = filename.substring(0, num);
                }

                if (type === SCAN_TYPE.CONTENT) {
                  this.weakFileName = resp.data;
                } else {
                  this.weakCompilerName = resp.data;
                  $('#compilerfile').val('');
                }
                this.isUploadSuccess = true;
                this.showMessageByLang(resp, 'info');
              } else if (resp.realStatus === STATUS.MAXIMUM_TASK) { // 等待上传中
                this.isUploading = true;
                this.handleUploadWaiting(uploadMsg, resp);
              } else if (resp.realStatus === STATUS.INSUFFICIENT_SPACE) {
                this.utilsService.sendDiskAlertMessage();
              } else if (resp === 'timeout') {
                this.showInfoBox(this.i18n.common_term_report_500, 'warn', resp.realStatus);
                this.isCompress = false;
              } else {
                if (type === SCAN_TYPE.CONTENT) {
                  this.weakFileName = '';
                } else {
                  $('#compilerfile').val('');
                  this.weakCompilerName = '';
                }
                this.isShow = false;
                this.isCompress = false;
                this.showMessageByLang(resp, 'error');
              }
            }
          });
        } else if (data.realStatus === STATUS.INSUFFICIENT_SPACE) { // 磁盘告警
          if (type === SCAN_TYPE.CONTENT) {
            $('#zipload').val('');
          } else {
            $('#compilerfile').val('');
          }
          this.utilsService.sendDiskAlertMessage();
          this.isUploading = false;
        } else {
          // check_upload异常情况，文件已存在
          if (data.info.indexOf('file already exist') > -1) {
            this.exitFileName = data.data.new_name;
            this.oldName = data.data.old_name;
            this.suffix = data.data.suffix;
            this.exitFileNameReplace =
              this.i18nService.I18nReplace(this.i18n.plugins_porting_message_analysis_center.exit.content,
                {0: data.data.old_name});
            if (type === SCAN_TYPE.COMPILED_FILE) { // 编译文件没有另存为功能
              this.noAgain = false;
            }
            this.exitMask.Open();
            return;
          } else {
            if (type === SCAN_TYPE.CONTENT) {
              $('#zipload').val('');
            } else {
              $('#compilerfile').val('');
            }
            this.showMessageByLang(data, 'error');
          }
          this.isShow = false;
        }
      });
    }
  }

  private handleWeakFileUploadCallBack(type: string, choice: string, data: any) {
    this.uploadFilePath = data.uploadFilePath;
    this.displayAreaMatch = false;
    if (data.status === STATUS.SUCCESS) {
      const fileName = (choice === 'override' ? this.overrideFileName : this.exitFileName) + this.suffix;
      const uploadMsg = {
        cmd: 'uploadFileIntellij',
        data: {
          scan_type: type,
          need_unzip: type === SCAN_TYPE.CONTENT ? 'true' : 'false',
          choice,
          notChmod: 'true',
          code_path: type === SCAN_TYPE.CONTENT ? '' : this.weakFileName,
          uploadFilePath: this.uploadFilePath,
          saveFileName: this.isUploadZip === true ? fileName : (fileName + '.zip'),
          is_file: this.isUploadZip === true ? null : 'true',
        }
      };
      this.vscodeService.postMessage(uploadMsg, (resp: any) => {
        if (resp) {
          this.suffix = '';
          this.exitFileName = '';
          this.overrideFileName = '';
          this.exitMask.Close();
          if (resp.status === STATUS.SUCCESS) {
            if (type === SCAN_TYPE.CONTENT) {
              this.weakFileName = resp.data;
            } else {
              this.weakCompilerName = resp.data;
              $('#compilerfile').val('');
            }
            this.isUploadSuccess = true;
            this.showInfoBox(this.isUploadZip ?
              this.i18n.plugins_porting_message_folderSucess : this.i18n.common_term_upload_success,
              'info', resp.realStatus);
          } else if (resp.realStatus === STATUS.INSUFFICIENT_SPACE) {
            this.utilsService.sendDiskAlertMessage();
          } else if (resp === 'timeout') {
            this.showInfoBox(this.i18n.common_term_report_500, 'warn', resp.realStatus);
            this.isCompress = false;
          } else {
            if (type === SCAN_TYPE.CONTENT) {
              this.weakFileName = '';
            } else {
              $('#compilerfile').val('');
              this.weakCompilerName = '';
            }
            this.isShow = false;
            this.isCompress = false;
            this.showMessageByLang(resp, 'error');
          }
          this.isUploading = false;
          this.changeDetectorRef.markForCheck();
          this.changeDetectorRef.detectChanges();
        }
      });
    } else if (data.realStatus === STATUS.INSUFFICIENT_SPACE) { // 磁盘告警
      if (type === SCAN_TYPE.CONTENT) {
        $('#zipload').val('');
      } else {
        $('#compilerfile').val('');
      }
      this.utilsService.sendDiskAlertMessage();
      this.isUploading = false;
    } else {
      // check_upload异常情况，文件已存在
      if (data.info.indexOf('file already exist') > -1) {
        this.exitFileName = data.data.new_name;
        this.overrideFileName = data.data.old_name;
        if (this.isUploadZip) {
          this.suffix = data.data.suffix;
        }
        this.exitFileNameReplace =
          this.i18nService.I18nReplace(this.i18n.plugins_porting_message_analysis_center.exit.content,
            {0: data.data.old_name});
        if (type === SCAN_TYPE.COMPILED_FILE) { // 编译文件没有另存为功能
          this.noAgain = false;
        }
        this.isDuplicated = true;
        this.exitMask.Open();
        this.changeDetectorRef.markForCheck();
        this.changeDetectorRef.detectChanges();
        return;
      } else {
        this.isUploading = false;
        if (type === SCAN_TYPE.CONTENT) {
          $('#zipload').val('');
        } else {
          $('#compilerfile').val('');
        }
      }
      this.isShow = false;
    }
    this.changeDetectorRef.markForCheck();
    this.changeDetectorRef.detectChanges();
  }

  // 压缩包上传，调用check_upload接口
  uploadFile(choice: string, typeNum: string, fileProps?: Array<any>) {
    this.isUploadZip = true;
    if (this.intellijFlag) {
      this.exitMask.Close();
      const uploadMsg = {
        cmd: 'checkUploadFileIntellij',
        data: {
          url: '/portadv/tasks/check_upload/',
          scan_type: typeNum,
          need_unzip: 'true',
          choice,
          notChmod: 'true',
          validFile: 'zip,tar,tar.gz,tar.bz,tar.bz2,tar.xz,tgz,tbz,tbz2,txz',
          isDuplicated: this.isDuplicated.toString(),
          uploadFilePath: this.uploadFilePath,
          saveFileName: (choice === 'override' ? this.overrideFileName : this.exitFileName) + this.suffix
        }
      };
      this.isDuplicated = false;
      this.vscodeService.postMessage(uploadMsg, (resp: any) => {
        if (resp) {
          this.isUploading = true;
          this.changeDetectorRef.markForCheck();
          this.changeDetectorRef.detectChanges();
          this.handleFileUploadCallBack(choice, resp, typeNum);
        }
      });
    } else {
      this.exitMask.Close();
      this.isUploadSuccess = false;
      this.isShow = false;
      this.isUploading = true;
      const inputDom = this.elementRef.nativeElement.querySelector('#zipload');
      let file: any;
      if (choice === 'normal') {
        file = (fileProps || inputDom.files)[0];
        this.uploadPackFile = file;
      } else {
        file = this.uploadPackFile;
      }

      // 文件格式校验
      if (!(/.tar$|.tar.bz$|.tar.bz2$|.tar.gz$|.tar.xz$|.tbz$|.tbz2$|.tgz$|.txz$|.zip$/).test(file.name)) {
        this.showI18nInfoBox('plugins_porting_tips_wrongFileType', 'error');
        this.isUploading = false;
        return;
      }
      this.info.filename = file.name;
      if (this.utilsService.checkUploadFileNameValidity(this.info.filename)) {
        this.isShow = false;
        this.isUploading = false;
        this.showInfoBox(this.i18n.plugins_porting_tips_fileNameIsValidity, 'error', '');
        return;
      }
      const size = file.size / 1024 / 1024;
      if (size > fileSize) {
        this.isShow = false;
        this.showI18nInfoBox('plugins_porting_message_fileExceedMaxSize', 'info');
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
        scan_type: typeNum,
        choice
      };
      this.uploadProgress = '0%';
      this.vscodeService.post({url: '/portadv/tasks/check_upload/', params}, (data: any) => {
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
              overrideName: this.info.filename,
              need_unzip: 'true',
              notChmod: 'true',
              autoPack: {
                choice,
                'scan-type': typeNum
              },
              uploadPrefix: this.i18n.plugins_porting_uploadPrefix_portCheck
            }
          };
          this.vscodeService.postMessage(uploadMsg, (resp: any) => {
            this.isUploading = false;
            if (resp) {
              this.suffix = '';
              this.exitFileName = '';
              this.exitMask.Close();
              if (resp.status === STATUS.SUCCESS) {
                this.fillTextarea(resp.data);
                let num = file.name.lastIndexOf('.');
                let filename = file.name.substring(0, num);
                if (filename.lastIndexOf('.tar') > 0) {
                  num = filename.lastIndexOf('.');
                  filename = filename.substring(0, num);
                }
                this.isShow = false;
                this.isCompress = false;
                this.isUploadSuccess = true;
                this.showMessageByLang(resp, 'info');
              } else if (resp.realStatus === STATUS.MAXIMUM_TASK) { // 等待上传中
                this.isUploading = true;
                this.handleUploadWaiting(uploadMsg, resp);
              } else if (resp.realStatus === STATUS.INSUFFICIENT_SPACE) {
                this.utilsService.sendDiskAlertMessage();
              } else if (resp === 'timeout') {
                this.showI18nInfoBox('common_term_report_500', 'warn');
                this.isCompress = false;
              } else {
                this.inputItems.path.value = '';
                this.isShow = false;
                this.isCompress = false;
                this.showMessageByLang(resp, 'error');
              }
            }
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
              {0: data.data.old_name});
            this.exitMask.Open();
          }

          this.isUploading = false;
        }
      });
      inputDom.value = '';
    }
  }

  private handleFileUploadCallBack(choice: string, data: any, typeNum: string) {
    this.uploadFilePath = data.uploadFilePath;
    this.displayAreaMatch = false;
    if (data.status === STATUS.SUCCESS) {
      const fileName = (choice === 'override' ? this.overrideFileName : this.exitFileName) + this.suffix;
      const uploadMsg = {
        cmd: 'uploadFileIntellij',
        data: {
          scan_type: typeNum,
          need_unzip: 'true',
          choice,
          notChmod: 'true',
          uploadFilePath: this.uploadFilePath,
          saveFileName: this.isUploadZip === true ? fileName : (fileName + '.zip'),
          is_file: this.isUploadZip === true ? null : 'true',
          not_chmod: (typeNum === SCAN_TYPE.BYTECHECK && this.isUploadZip === false) ? 'false' : 'true'
        }
      };
      this.vscodeService.postMessage(uploadMsg, (resp: any) => {
        if (resp) {
          this.suffix = '';
          this.exitFileName = '';
          this.overrideFileName = '';
          this.exitMask.Close();
          if (resp.status === STATUS.SUCCESS) {
            this.resetTextareaString(resp.data);
            this.isShow = false;
            this.isCompress = false;
            this.isUploadSuccess = true;
            this.showInfoBox(this.isUploadZip ?
              this.i18n.plugins_porting_message_folderSucess : this.i18n.common_term_upload_success,
              'info', resp.realStatus);
          } else if (resp.realStatus === STATUS.INSUFFICIENT_SPACE) {
            this.utilsService.sendDiskAlertMessage();
          } else if (resp === 'timeout') {
            this.showI18nInfoBox('common_term_report_500', 'warn');
            this.isCompress = false;
          } else {
            this.inputItems.path.value = '';
            this.isShow = false;
            this.isCompress = false;
            this.showMessageByLang(resp, 'error');
          }
          this.isUploading = false;
          this.changeDetectorRef.markForCheck();
          this.changeDetectorRef.detectChanges();
        }
      });
    } else if (data.realStatus === STATUS.INSUFFICIENT_SPACE) {
      this.utilsService.sendDiskAlertMessage();
      this.isUploading = false;
    } else {
      if (data.data.new_name && data.data.suffix) {
        this.exitFileName = data.data.new_name;
        this.overrideFileName = data.data.old_name;
        if (this.isUploadZip) {
          this.suffix = data.data.suffix;
        }
        this.exitFileNameReplace = this.i18nService.I18nReplace(
          this.i18n.plugins_porting_message_analysis_center.exit.content,
          {0: data.data.old_name});
        this.isDuplicated = true;
        this.exitMask.Open();
      } else {
        this.isUploading = false;
      }
    }
    this.changeDetectorRef.markForCheck();
    this.changeDetectorRef.detectChanges();
  }

  isDeleteAreaMatch(value: any) {
    this.fileNameDelete = this.i18nService.I18nReplace(
      this.i18n.plugins_porting_message_analysis_center.exit.delete_file_content,
      {1: value});
    this.miniModalServe.open({
      type: 'warn',
      content: {
        title: this.i18n.plugins_porting_message_analysis_center.exit.delete_file,
        body: this.fileNameDelete
      },
      close: (): void => {
        this.deleteAreaMatch(value);
        this.utilsService.intellijDismiss(this.intellijFlag);
      },
      dismiss: () => {
        this.utilsService.intellijDismiss(this.intellijFlag);
      }
    });
  }

  // 内存一致性 点击确定检查
  createWeakCheck() {
    this.createWeakBtnDisabled = true;
    this.uploadResultTip.content = '';
    // 创建report
    const sourcedir = this.handleTextAreaValue();
    const params = {
      sourcedir,
      gllvm: 'true',
      bcFileList: this.bcFileList,
      bcGenerateTaskId: this.bcGenerateTaskId,
      autoFix: this.compilerConfigurationFile.checked,
    };
    if (this.reportTotalNum >= 50) {
      this.showI18nInfoBox('common_term_history_list_overflow_tip2', 'warn');
    }
    this.vscodeService.post({url: '/portadv/weakconsistency/tasks/', params}, (resp: any) => {
      if (resp.status === STATUS.SUCCESS && resp.data.task_id) {
        this.compilerConfigurationFile.disabled = true;
        this.lackWorkerTip(resp.realStatus);
        this.reportId = resp.data.task_id;
        this.vscodeService.get(
          {url: `/task/progress/?task_type=10&task_id=${encodeURIComponent(this.reportId)}`},
          (data: any) => {
            if (data.status === STATUS.SUCCESS) {
              this.weakCheckProgress(resp.data.task_id, resp.realStatus);
            } else {
              this.createWeakBtnDisabled = false;
            }
            if (this.intellijFlag) {
              this.changeDetectorRef.markForCheck();
              this.changeDetectorRef.detectChanges();
            }
          }
        );
      } else if (resp.realStatus === STATUS.INSUFFICIENT_SPACE) {
        this.utilsService.sendDiskAlertMessage();
        this.createWeakBtnDisabled = false;
      } else {
        this.createWeakBtnDisabled = false;
        this.inputItems.path.value = '';
        if (!this.intellijFlag) {
          // worker为0
          if (resp.realStatus === PortWorkerStatus.CREATE_TASK_NOWORKER_STATUS) {
            this.utilsService.showMessageByWorker('error');
            return;
          }
        }
        this.showMessageByLang(resp, 'error');
      }
      if (this.intellijFlag) {
        this.changeDetectorRef.markForCheck();
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  // 前往报告详情页
  goWeakReport(taskId: any) {
    if (this.intellijFlag) {
      const param = {
        taskId,
        taskType: TASK_TYPE.WEAK_CHECK.toString(),
      };
      this.vscodeService.postMessage({cmd: 'goEnhancedReportDetail', data: param}, null);
      return;
    }
    const data = {
      cmd: 'openNewPage',
      data: {
        router: 'enchanceReport',
        panelId: 'weakReport',
        viewTitle: this.i18n.plugins_porting_message_enhancefun_label.weak,
        message: {
          taskId,
          taskType: TASK_TYPE.WEAK_CHECK,
          resp: JSON.stringify(this.checkResult)
        }
      }
    };
    this.vscodeService.postMessage(data, null);
  }

  // 行合并处理
  linePortingLevel(list: Array<any>): Array<any> {
    let rowSpan = 1;
    list[0] = Object.assign(list[0], {rowSpan, showTd: true});
    list.reduce((pre, cur) => {
      if (pre.chinese_check_result === cur.chinese_check_result
        && pre.chinese_check_result === '检查成功' && cur.chinese_check_result === '检查成功') {
        rowSpan++;
        pre = Object.assign(pre, {rowSpan, showTd: true});
        cur = Object.assign(cur, {rowSpan: 1, showTd: false});
        return pre;
      } else {
        rowSpan = 1;
        cur = Object.assign(cur, {rowSpan, showTd: true});
        return cur;
      }
    });
    return list;
  }

  // 排序
  sortByAsc(col: string) {
    return (pre: any, nex: any) => {
      const preLower = pre[col].toLowerCase();
      const nexLower = nex[col].toLowerCase();
      if (preLower > nexLower) {
        return -1;
      } else {
        return 0;
      }
    };
  }

  // 弹出内存一致性检查结果
  showBcCheckResult(res: any, taskId: any) {
    const bcRes = this.linePortingLevel(res);
    bcRes.forEach((bc: any) => {
      bc.taskId = taskId;
    });
    this.bcFileSrcData = {
      data: bcRes.sort(this.sortByAsc('chinese_check_result')),
      state: {
        searched: false, // 源数据未进行搜索处理
        sorted: false, // 源数据未进行排序处理
        paginated: false // 源数据未进行分页处理
      }
    };
    this.tiModal.open(this.bcResult, {
      id: 'bcResult',
      modalClass: 'bcRes700',
      close: (): void => {
        this.utilsService.intellijDismiss(this.intellijFlag);
      },
      dismiss: (): void => {
        this.utilsService.intellijDismiss(this.intellijFlag);
      }
    });
  }

  // 创建内存一致性任务进度条
  weakCheckProgress(taskId: any, status: any) {
    this.weakScanDisable = true;
    const message = {
      cmd: 'weakCheckProgress',
      data: {
        taskId,
        status
      }
    };
    this.vscodeService.postMessage(message, (progressResp: any) => {
      this.compilerConfigurationFile.checked = false;
      this.createWeakBtnDisabled = false;
      this.weakScanDisable = false;
      if (progressResp.data.runningstatus === STATUS.SUCCESS) {
        this.checkResult = progressResp;
        const bcCheckFailed = this.checkResult.data.bc_check_result.bc_check_failed;
        const bcCheckSucces = this.checkResult.data.bc_check_result.bc_check_succeeded;
        let bcCheckRes = [];
        if (bcCheckFailed.length > 0 && bcCheckSucces.length > 0) {
          bcCheckRes = bcCheckSucces.concat(bcCheckFailed);
          this.historyListComponent.getHistoryReport();
          this.showBcCheckResult(bcCheckRes, taskId);
          this.curStep = 1;
          this.inputItems.weakTool.value = '';
          this.weakFileName = '';
        } else {
          if (this.intellijFlag) {
            if (progressResp.realStatus === '0x0d0a02') {
              this.showMessageByLang(progressResp, 'info');
            } else {
              this.vscodeService.get({url: '/portadv/weakconsistency/tasks/'}, (resp: any) => {
                this.historyListComponent.handleWeakReportResp(resp);
                this.vscodeService.postMessage({
                  cmd: 'goEnhancedReportDetail',
                  data: {
                    taskId,
                    taskType: TASK_TYPE.WEAK_CHECK.toString()
                  }
                }, null);
              });
            }
            this.curStep = 1;
            this.inputItems.weakTool.value = '';
            this.weakFileName = '';
            this.bcOptions = [];
            this.bcSelecteds = [];
            this.changeDetectorRef.markForCheck();
            this.changeDetectorRef.detectChanges();
          } else {
            const resultMsg = {
              type: 'weakCheck',
              state: 'success',
            };
            this.msgService.sendMessage({
              type: 'creatingResultMsg',
              data: resultMsg
            });
            if (progressResp.realStatus === '0x0d0a02') {
              this.showMessageByLang(progressResp, 'info');
              this.curStep = 1;
              this.inputItems.weakTool.value = '';
              this.weakFileName = '';
            } else {
              this.curStep = 1;
              this.inputItems.weakTool.value = '';
              this.weakFileName = '';
              const data = {
                cmd: 'openNewPage',
                data: {
                  router: 'enchanceReport',
                  panelId: 'weakReport',
                  viewTitle: this.i18n.plugins_porting_message_enhancefun_label.weak,
                  message: {
                    taskId,
                    taskType: TASK_TYPE.WEAK_CHECK,
                    resp: JSON.stringify(progressResp)
                  }
                }
              };
              this.vscodeService.postMessage(data, null);
            }
          }
        }
      } else if (progressResp.data.runningstatus && progressResp.data.runningstatus !== STATUS.SUCCESS) {
        this.showMessageByLang(progressResp.data, 'error');
      }
      if (this.intellijFlag) {
        this.changeDetectorRef.markForCheck();
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  // 对 textArea 内容进行处理
  handleTextAreaValue(): string {
    let sourcedir = '';
    let inputPath = this.weakFileName;
    if (inputPath.search(',') === -1) {
      inputPath = inputPath.replace(/(^\s*)|(\s*$)/g, '').replace(/[\r\n]/g, '');
      if (inputPath.charAt(inputPath.length - 1) === '/') {
        inputPath = inputPath.slice(0, -1);
      }
      sourcedir = `${this.weakCodeFilePath}${inputPath}`;
    } else {
      let values = inputPath.split(',');
      if (values.length > 1) {
        const diffArr: any = [];
        values.forEach(val => {
          if (diffArr.indexOf(val) === -1) {
            diffArr.push(val);
          }
        });
        values = diffArr.slice();
      }
      if (values[0]) {
        values[0] = values[0].replace(/(^\s*)|(\s*$)/g, '').replace(/[\r\n]/g, '');
        if (values[0].charAt(values[0].length - 1) === '/') {
          values[0] = values[0].slice(0, -1);
        }
        sourcedir = `${this.weakCodeFilePath}${values[0]}`;
      }
      for (let j = 1; j <= values.length; j++) {
        if (values[j]) {
          values[j] = values[j].replace(/(^\s*)|(\s*$)/g, '').replace(/[\r\n]/g, '');
          if (values[j].charAt(values[j].length - 1) === '/') {
            values[j] = values[j].slice(0, -1);
          }
          sourcedir += `,${this.weakCodeFilePath}${values[j]}`;
        }
      }
    }
    return sourcedir;
  }

  // 删除 textarea 文件
  deleteTextAreaFile(data: any) {
    this.vscodeService.delete({url: `/portadv/tasks/delete_file/`, params: {data}}, (resp: any) => {
      if (resp.status === 0) {
        let vals = this.weakFileName.split(',');
        if (vals.length === 1) {
          this.weakFileName = vals[0] === this.deleteValue ? '' : vals[0];
        } else {
          vals = vals.filter((val: any) => {
            if (val) {
              return this.deleteValue !== val;
            } else {
              return false;
            }
          });
          this.weakFileName = vals.join(',') + ',';
        }
      }
      this.showMessageByLang(resp, 'warn');
    });
  }

  // 下载中间编译文件
  downloadCompiler() {
    if (this.intellijFlag) {
      this.vscodeService.postMessage({
        cmd: 'downloadFile',
        data: {
          taskId: this.weakCopmilerId,
          fileName: this.weakCompilerName
        }
      }, null);
    } else {
      this.vscodeService.get(
        {url: `/portadv/weakconsistency/${encodeURIComponent(this.weakCopmilerId)}/compilefile/`},
        (resp: any) => {
          this.vscodeService.postMessage({
            cmd: 'downloadFile',
            data: {
              fileContent: resp,
              fileName: this.weakCompilerName,
              invokeLocalSave: true
            }
          }, (data: any) => {
          });
        }
      );
    }
  }

  // 获取历史记录条数
  getReportTotalNum(num: number): void {
    this.reportTotalNum = num;
  }

  // 内存一致性 textarea 聚焦事件
  focusWeakTextArea() {
    this.displayAreaMatch = true;
    this.uploadResultTip.content = '';
    this.inputWeakAreaMatch();
  }

  /**
   *  路径模糊查找
   */
  inputWeakAreaMatch() {
    if ((self as any).webviewSession.getItem('isFirst') !== '1'
      && (self as any).webviewSession.getItem('isExpired') !== '1'
    ) {
      this.pathlist = [];
      let path = this.weakFileName;
      if (path) {
        const lastIndex = this.weakFileName.lastIndexOf(',');
        if (lastIndex) {
          path = this.weakFileName.slice(lastIndex + 1, this.weakFileName.length);
        }
      }
      const params = {path: 'weakconsistency/' + path};
      this.vscodeService.post({url: '/pathmatch/', params}, (data: any) => {
        const arrBefore = this.weakFileName.split(',');
        if (data) {
          let arrAfter = data.pathlist;
          let idx = this.weakFileName.lastIndexOf(',');
          if (idx >= 0) {
            idx = this.weakFileName.length - idx;
          }
          if (idx === 1) {
            arrAfter = this.arrDiff(arrBefore, arrAfter, true);
            this.weakPathList = arrAfter;
            return;
          }
          if (arrAfter.length > 1) {
            arrAfter = this.arrDiff(arrBefore, arrAfter, false);
          }
          this.weakPathList = arrAfter;
        }
        if (this.intellijFlag) {
          this.changeDetectorRef.markForCheck();
          this.changeDetectorRef.detectChanges();
        }
      });
    }
  }

  /**
   * 对上传的压缩包进行相关处理
   * @param choice 上传的模式
   * @param type 任务类型
   */
  public handleBc(choice: string, type: string, fileProps?: Array<any>) {
    this.exitbc.Close();
    this.uploadStartFlag = false;
    this.isShow = false;
    let file;
    if (fileProps) {
      file = fileProps[0];
    } else {
      file = this.elementRef.nativeElement.querySelector('#bcload').files[0];
    }
    this.info1.filename = file.name;
    if (this.utilsService.checkUploadFileNameValidity(this.info1.filename)) {
      this.isShow = false;
      this.isCompress = false;
      this.showInfoBox(this.i18n.plugins_porting_tips_fileNameIsValidity, 'error', '');
      return null;
    }
    const size = file.size / 1024 / 1024;
    if (size > fileSize) {
      this.isShow = false;
      this.isCompress = false;
      this.showI18nInfoBox('plugins_porting_message_fileExceedMaxSize', 'info');
      return null;
    }
    this.info1.filesize = size.toFixed(1);
    let params = {
      file_size: file.size,
      file_name: file.name,
      need_unzip: 'false',
      scan_type: type,
      choice
    };
    if (choice === 'override') {
      this.info1.filename = `${this.bcOldName}`;
      params = {
        file_size: file.size,
        file_name: this.info1.filename,
        need_unzip: 'false',
        scan_type: type,
        choice
      };
    } else if (choice === 'save_as') {
      this.info1.filename = `${this.bcExitFileName}${this.bcsuffix}`;
      params = {
        file_size: file.size,
        file_name: this.info1.filename,
        need_unzip: 'false',
        scan_type: type,
        choice
      };
    }
    return {
      file,
      params
    };
  }

  /**
   * 切换选择文件方式
   * @param mode 选中的模型
   * @param index 选中的index
   */
  public changeFileMode(mode: any, index: any): void {
    mode.active = true;
    if (index) {
      this.weakFileList[0].active = false;
    } else {
      this.weakFileList[1].active = false;
    }
  }

  // bc
  public upload() {
    if (this.intellijFlag) {
      this.uploadBcFile('normal', '8');
    } else {
      this.vscodeService.postMessage({cmd: 'getCurrentAppName'}, (appName: string) => {
        if (appName === 'CloudIDE') {
          this.vscodeService.postMessage({
            cmd: 'cloudIDEupload',
          }, (fileProps: Array<any>) => {
            this.uploadBcFile('normal', '8', fileProps);
          });
        } else {
          this.elementRef.nativeElement.querySelector('#bcload').value = '';
          this.elementRef.nativeElement.querySelector('#bcload').click();
        }
      });
    }
  }

  /**
   * 内存一致性上传bc文件
   * @param choice  上传的模式
   * @param type 任务类型
   */
  public uploadBcFile(choice: string, type: string, fileProps?: Array<any>) {
    this.exitMask.Close();
    if (this.intellijFlag) {
      const uploadMsg = {
        cmd: 'checkUploadFileIntellij',
        data: {
          url: '/portadv/tasks/check_upload/',
          scan_type: type,
          need_unzip: 'false',
          choice,
          notChmod: 'true',
          validFile: 'bc,BC',
          isDuplicated: this.isDuplicated.toString(),
          uploadFilePath: this.uploadFilePath,
          saveFileName: (choice === 'override')
            ? this.overrideFileName
            : (this.bcExitFileName + this.bcsuffix)
        }
      };
      this.isDuplicated = false;
      this.vscodeService.postMessage(uploadMsg, (resp: any) => {
        this.isUploading = true;
        this.changeDetectorRef.markForCheck();
        this.changeDetectorRef.detectChanges();
        this.handleBCFileUploadCallBack(type, choice, resp);
      });
    } else {
      const {file, params} = this.handleBc(choice, type, fileProps);
      if (!file || !params) {
        return;
      }
      // 文件格式校验
      if (!(/.bc$|.BC$/).test(file.name) && type === SCAN_TYPE.CONTENT) {
        this.showI18nInfoBox('plugins_porting_tips_wrongFileType', 'error');
        this.isUploading = false;
        return;
      }
      // 检查文件是否能够上传
      this.vscodeService.post({url: '/portadv/tasks/check_upload/', params}, (data: any) => {
        this.displayAreaMatch = false;
        if (data.status === STATUS.SUCCESS) {
          const uploadMsg = {
            cmd: 'uploadProcess',
            data: {
              msgID: MESSAGE_MAP.FILE_UPLOAD,
              url: '/portadv/tasks/upload/',
              fileUpload: 'true',
              filePath: file.path,
              fileSize: file.size,
              overrideName: this.info1.filename,
              need_unzip: false,
              notChmod: 'true',
              autoPack: {
                choice,
                'scan-type': type
              },
              uploadPrefix: this.i18n.plugins_porting_uploadPrefix_portCheck
            }
          };
          this.vscodeService.postMessage(uploadMsg, (resp: any) => {
            if (resp) {
              this.bcsuffix = '';
              this.bcExitFileName = '';
              this.exitbc.Close();
              this.isUploading = false;
              if (resp.status === STATUS.SUCCESS) {
                let num = file.name.lastIndexOf('.');
                let filename = file.name.substring(0, num);
                if (filename.lastIndexOf('.tar') > 0) {
                  num = filename.lastIndexOf('.');
                  filename = filename.substring(0, num);
                }
                this.bcFileName = resp.data;
                this.showMessageByLang(resp, 'info');
              } else if (resp.realStatus === STATUS.MAXIMUM_TASK) { // 等待上传中
                this.isUploading = true;
                this.handleUploadWaiting(uploadMsg, resp);
              } else if (resp.realStatus === STATUS.INSUFFICIENT_SPACE) {
                this.utilsService.sendDiskAlertMessage();
              } else if (resp === 'timeout') {
                this.showInfoBox(this.i18n.common_term_report_500, 'warn', resp.realStatus);
                this.isCompress = false;
              } else {
                if (type === SCAN_TYPE.CONTENT) {
                  this.weakFileName = '';
                } else {
                  $('#compilerfile').val('');
                  this.weakCompilerName = '';
                }
                this.isShow = false;
                this.isCompress = false;
                this.showMessageByLang(resp, 'error');
              }
            }
          });
        } else if (data.realStatus === STATUS.INSUFFICIENT_SPACE) { // 磁盘告警
          $('#bcload').val('');
          this.utilsService.sendDiskAlertMessage();
          this.isUploading = false;
        } else {
          // check_upload异常情况，文件已存在
          if (data.info.indexOf('file already exist') > -1) {
            this.bcExitFileName = data.data.new_name;
            this.bcOldName = data.data.old_name;
            this.bcsuffix = data.data.suffix;
            this.exitFileNameReplace =
              this.i18nService.I18nReplace(this.i18n.plugins_porting_message_analysis_center.exit.content,
                {0: data.data.old_name});
            this.exitbc.Open();
            return;
          } else {
            $('#bcload').val('');
            this.showMessageByLang(data, 'error');
          }
          this.isShow = false;
        }
      });
    }
  }

  private handleBCFileUploadCallBack(type: string, choice: string, data: any) {
    this.uploadFilePath = data.uploadFilePath;
    this.displayAreaMatch = false;
    if (data.status === STATUS.SUCCESS) {
      const uploadMsg = {
        cmd: 'uploadFileIntellij',
        data: {
          scan_type: type,
          need_unzip: 'false',
          choice,
          notChmod: 'true',
          uploadFilePath: this.uploadFilePath,
          saveFileName: choice === 'override'
            ? this.overrideFileName
            : (this.bcExitFileName + this.bcsuffix)
        }
      };
      this.vscodeService.postMessage(uploadMsg, (resp: any) => {
        if (resp) {
          this.bcsuffix = '';
          this.bcExitFileName = '';
          this.overrideFileName = '';
          this.exitbc.Close();
          if (resp.status === STATUS.SUCCESS) {
            this.bcFileName = resp.data;
          } else if (resp.realStatus === STATUS.INSUFFICIENT_SPACE) {
            this.utilsService.sendDiskAlertMessage();
          } else if (resp === 'timeout') {
            this.showInfoBox(this.i18n.common_term_report_500, 'warn', resp.realStatus);
            this.isCompress = false;
          } else {
            this.isShow = false;
            this.isCompress = false;
            this.showMessageByLang(resp, 'error');
          }
          this.isUploading = false;
          this.changeDetectorRef.markForCheck();
          this.changeDetectorRef.detectChanges();
        }
      });
    } else if (data.realStatus === STATUS.INSUFFICIENT_SPACE) { // 磁盘告警
      $('#bcload').val('');
      this.utilsService.sendDiskAlertMessage();
      this.isUploading = false;
    } else {
      // check_upload异常情况，文件已存在
      if (data.info.indexOf('file already exist') > -1) {
        this.bcExitFileName = data.data.new_name;
        this.overrideFileName = data.data.old_name;
        this.bcsuffix = data.data.suffix;
        this.exitFileNameReplace =
          this.i18nService.I18nReplace(this.i18n.plugins_porting_message_analysis_center.exit.content,
            {0: data.data.old_name});
        this.isDuplicated = true;
        this.exitbc.Open();
        this.changeDetectorRef.markForCheck();
        this.changeDetectorRef.detectChanges();
        return;
      } else {
        $('#bcload').val('');
      }
      this.isShow = false;
      this.isUploading = false;
    }
    this.changeDetectorRef.markForCheck();
    this.changeDetectorRef.detectChanges();
  }

  // weak bccheck
  startCheck() {
    if (!this.filenameLengthBcCheck.valid) {
      return;
    }
    this.bcCreateBtnDisabled = true;
    this.showBcCheckPro = true;
    const params = {
      bc_file: `${this.bcspace}${this.bcFileName}`, // 需要进行迁移扫描的源代码绝对路径，不同的路径使用逗号分割
    };
    this.vscodeService.post({url: '/portadv/weakconsistency/tasks/', params}, (resp: any) => {
      if (resp.status === STATUS.SUCCESS && resp.data.task_id) {
        this.reportId = resp.data.task_id;
        this.vscodeService.get(
          {url: `/task/progress/?task_type=11&task_id=${encodeURIComponent(this.reportId)}`},
          (data: any) => {
            if (data.status === STATUS.SUCCESS) {
              this.bcCheckProgress(resp.data.task_id);
            } else {
              this.bcCreateBtnDisabled = false;
            }
            if (this.intellijFlag) {
              this.changeDetectorRef.markForCheck();
              this.changeDetectorRef.detectChanges();
            }
          }
        );
      } else if (resp.realStatus === STATUS.INSUFFICIENT_SPACE) {
        this.bcCreateBtnDisabled = false;
        this.utilsService.sendDiskAlertMessage();
      } else {
        this.bcCreateBtnDisabled = false;
        this.inputItems.path.value = '';
        if (resp.realStatus === STATUS.NOPERMISSION) {
          const message = {
            cmd: 'noPermissionFaqTip',
            data: {
              res: resp,
            }
          };
          this.vscodeService.postMessage(message, null);
        } else {
          this.showMessageByLang(resp, 'error');
        }
      }
      if (this.intellijFlag) {
        this.changeDetectorRef.markForCheck();
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  // 创建bc内存一致性任务进度条
  bcCheckProgress(taskId: any) {
    const message = {
      cmd: 'bcCheckProgress',
      data: {
        taskId,
        showProcess: this.showBcCheckPro
      }
    };
    this.vscodeService.postMessage(message, (progressResp: any) => {
      this.bcCreateBtnDisabled = false;
      if (progressResp.data.runningstatus === STATUS.SUCCESS) {
        if (this.intellijFlag) {
          if (progressResp.realStatus === '0x0d0a02') {
            this.showMessageByLang(progressResp, 'info');
            this.bcFileName = '';
          } else {
            this.vscodeService.get({url: '/portadv/weakconsistency/tasks/?bc_task=True'}, (resp: any) => {
              this.historyListComponent.handleBCReportResp(resp);
              this.vscodeService.postMessage({
                cmd: 'goEnhancedReportDetail',
                data: {
                  taskId,
                  taskType: TASK_TYPE.BC_CHECK.toString()
                }
              }, null);
            });
          }
        } else {
          const resultMsg = {
            state: 'success',
            type: 'bcCheck',
          };
          this.msgService.sendMessage({
            type: 'creatingResultMsg',
            data: resultMsg
          });
          if (progressResp.realStatus === '0x0d0a02') {
            this.showMessageByLang(progressResp, 'info');
            this.bcFileName = '';
          } else {
            const data = {
              cmd: 'openNewPage',
              data: {
                router: 'enchanceReport',
                panelId: 'weakReportBc',
                viewTitle: this.i18n.plugins_porting_message_enhancefun_label.weak,
                message: {
                  taskId,
                  taskType: TASK_TYPE.BC_CHECK,
                  resp: JSON.stringify(progressResp)
                }
              }
            };
            this.vscodeService.postMessage(data, null);
          }
        }
      } else if (progressResp.data.runningstatus && progressResp.data.runningstatus !== STATUS.SUCCESS) {
        this.showMessageByLang(progressResp.data, 'error');
      }
      if (this.intellijFlag) {
        this.changeDetectorRef.markForCheck();
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  arr_diff(beforeArr: any, afterArr: any, flag: any) {
    if (flag) {
      beforeArr.forEach((item: any) => {
        if (item) {
          afterArr = afterArr.filter((after: any) => {
            return after !== item;
          });
        }
      });
    } else {
      const before = beforeArr[beforeArr.length - 1];
      afterArr = afterArr.filter((after: any) => {
        return after.indexOf(before) >= 0;
      });
    }
    return afterArr;
  }

  /**
   *  路径模糊查找
   */
  inputBcAreaMatch() {
    if ((self as any).webviewSession.getItem('isFirst') !== '1'
      && (self as any).webviewSession.getItem('isExpired') !== '1'
    ) {
      this.pathlist = [];
      let path = this.bcFileName;
      if (path) {
        const lastIndex = this.bcFileName.lastIndexOf(',');
        if (lastIndex) {
          path = this.bcFileName.slice(lastIndex + 1, this.bcFileName.length);
        }
      }
      const params = {path: 'weakconsistency_bc/' + path};
      this.vscodeService.post({url: '/pathmatch/', params}, (data: any) => {
        const arrBefore = this.bcFileName.split(',');
        if (data) {
          let arrAfter = data.pathlist;
          let idx = this.bcFileName.lastIndexOf(',');
          if (idx >= 0) {
            idx = this.bcFileName.length - idx;
          }
          if (idx === 1) {
            arrAfter = this.arr_diff(arrBefore, arrAfter, true);
            this.BcPathList = arrAfter;
            return;
          }
          if (arrAfter.length > 1) {
            arrAfter = this.arr_diff(arrBefore, arrAfter, false);
          }
          this.BcPathList = arrAfter;
        }
        if (this.intellijFlag) {
          this.changeDetectorRef.markForCheck();
          this.changeDetectorRef.detectChanges();
        }
      });
    }
  }

  // 内存一致性 textarea 聚焦事件
  focusBcTextArea() {
    this.displayAreaMatch = true;
    this.bcUploadResultTip.content = '';
    this.inputBcAreaMatch();
    const areaMatch = this.elementRef.nativeElement.querySelector('.areaMatch');
    if (areaMatch) {
      this.areaMatchHeight = areaMatch.offsetHeight;
    }
    this.updatePage();
  }

  // textarea 子列表内容改变
  clickBcMatch(value: any) {
    const lastIndex = this.bcFileName.lastIndexOf(',');
    if (!this.multipleInput) {
      this.bcFileName = value;
    } else {
      if (lastIndex) {
        this.bcFileName = this.bcFileName.slice(0, lastIndex + 1) + value + ',';
      } else {
        this.bcFileName = value + ',';
      }
    }
    this.displayAreaMatch = false;
    this.BcPathList = [];
    this.updatePage();
  }

  isDeleteBcMatch(value: any) {
    this.deleteValue = value;
    this.fileNameDelete = this.i18nService.I18nReplace(
      this.i18n.plugins_porting_message_analysis_center.exit.delete_file_content,
      {1: value});
    this.miniModalServe.open({
      type: 'warn',
      content: {
        title: this.i18n.plugins_porting_message_analysis_center.exit.delete_file,
        body: this.fileNameDelete
      },
      close: (): void => {
        this.deleteBcMatch();
        this.utilsService.intellijDismiss(this.intellijFlag);
      },
      dismiss: () => {
        this.utilsService.intellijDismiss(this.intellijFlag);
      }
    });
  }

  deleteBcMatch() {
    const path = 'weakconsistency_bc';
    const fileName = this.deleteValue;
    const params = {
      file_name: fileName,
      path,
    };
    const option = {
      url: '/portadv/tasks/delete_file/',
      params
    };
    this.vscodeService.delete(option, (resp: any) => {
      if (resp.status === STATUS.SUCCESS) {
        this.BcPathList = this.BcPathList.filter((item: any) => item !== fileName);
        let vals = this.bcFileName.split(',');
        if (vals.length === 1) {
          this.bcFileName = vals[0] === this.deleteValue ? '' : vals[0];
        } else {
          vals = vals.filter((val: any): any => {
            if (val) {
              return this.deleteValue !== val;
            }
          });
          this.bcFileName = vals.join(',') + ',';
        }
      }
      if (this.intellijFlag) {
        this.changeDetectorRef.markForCheck();
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  /**
   * 替换
   * @param choice 上传的模式
   */
  uploadAgainbc(choice: string): void {
    if (choice === 'override') {
      this.uploadBcFile(choice, '8');
    } else {
      this.exitbc.Close();
      this.savebc.Open();
    }
  }

  /**
   * 另存为
   * @param choice 上传的模式
   */
  saveBc(choice: string): void {
    this.savebc.Close();
    this.uploadBcFile(choice, '8');
  }

  closeBcExit() {
    this.exitbc.Close();
    this.isDuplicated = false;
    this.isUploading = false;
    $('#bcload').val('');
  }

  closeBcSaveAs() {
    this.savebc.Close();
    this.isDuplicated = false;
    this.isUploading = false;
    $('#bcload').val('');
  }

  deleteAreaMatch(value: any) {
    const fileName = value;
    const path = this.selectType.curSelObj.path.slice(0, -1);
    const params = {
      file_name: fileName,
      path
    };
    const option = {
      url: '/portadv/tasks/delete_file/',
      params
    };
    this.vscodeService.delete(option, (resp: any) => {
      this.deleteFileCallback(resp, fileName, value);
    });
  }

  deleteFileCallback(resp: any, fileName: any, value: string) {
    if (resp) {
      if (resp.status === STATUS.SUCCESS) {
        if (this.selectType.selectedId === 'weak') {
          this.weakPathList = this.weakPathList.filter((item: any) => item !== fileName);
          let vals = this.weakFileName.split(',');
          if (vals.length === 1) {
            this.weakFileName = '';
          } else {
            vals = vals.filter(val => {
              return (value.indexOf(val) >= 0 && val);
            });
            if (vals.length > 0) {
              this.weakFileName = '';
            }
          }
        } else {
          let vals = this.getTextareaStr().split(',');
          if (vals.length === 1) {
            this.resetTextareaString('');
          } else {
            vals = vals.filter(val => {
              return (value.indexOf(val) >= 0 && val);
            });
            if (vals.length > 0) {
              this.resetTextareaString('');
            }
          }
        }
        this.showMessageByLang(resp, 'info');
      } else {
        this.showMessageByLang(resp, 'warn');
      }
      if (this.intellijFlag) {
        this.changeDetectorRef.markForCheck();
        this.changeDetectorRef.detectChanges();
      }
    }
  }

  closeMaskExit() {
    this.exitMask.Close();
    this.isDuplicated = false;
    this.isUploading = false;
    if (this.weakScanType === SCAN_TYPE.CONTENT) {
      $('#zipload').val('');
    } else {
      $('#compilerfile').val('');
    }
  }

  closeMaskSaveAs() {
    this.saveasMask.Close();
    this.isDuplicated = false;
    this.isUploading = false;
  }

  uploadAgain(choice: string) {
    const typeNum = this.getTypeNum();
    if (choice === 'override' && this.isUploadZip) {
      this.selectType.selectedId === 'weak'
        ? this.uploadWeakFile(choice, this.weakScanType)
        : this.uploadFile(choice, typeNum);
    } else if (choice === 'override' && !this.isUploadZip) {
      this.selectType.selectedId === 'weak'
        ? this.toZipCode(choice, '6')
        : this.toZip(choice, typeNum);
    } else {
      this.exitMask.Close();
      this.saveasMask.Open();
    }
  }

  saveAs(choice: string) {
    if (!this.confirmUploadZip.valid) {
      $('.saveAs-input')[0].focus();
      return;
    }
    this.saveasMask.Close();
    const typeNum = this.getTypeNum();
    if (this.isUploadZip) {
      this.selectType.selectedId === 'weak'
        ? this.uploadWeakFile(choice, this.weakScanType)
        : this.uploadFile(choice, typeNum);
    } else {
      this.selectType.selectedId === 'weak'
        ? this.toZipCode(choice, '6')
        : this.toZip(choice, typeNum);
    }
  }

  getTypeNum() {
    let typeNum;
    if (this.selectType.selectedId === 'byte') {
      typeNum = SCAN_TYPE.BYTECHECK;
    } else if (this.selectType.selectedId === 'precheck') {
      typeNum = SCAN_TYPE.PRECHECK;
    } else if (this.selectType.selectedId === 'cache') {
      typeNum = SCAN_TYPE.CACHECHECK;
    }
    return typeNum;
  }

  openUrl(url: string) {
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

  confirmDelete(id: string) {
    this.deleteReportId = id;
    this.deleteReportMask.Open();
    this.changeDetectorRef.markForCheck();
    this.changeDetectorRef.detectChanges();
  }

  confirmAllDelete(type: string) {
    this.type = type;
    this.deleteAllReportMask.Open();
    this.changeDetectorRef.markForCheck();
    this.changeDetectorRef.detectChanges();
  }

  deleteReport() {
    this.historyListComponent.deleteReportById(this.deleteReportId);
    this.deleteReportMask.Close();
  }

  deleteAllReport() {
    this.historyListComponent.deleteAllReports(this.type);
    this.deleteAllReportMask.Close();
  }

  closeReportDeleteMask() {
    this.deleteReportMask.Close();
  }

  closeAllReportDeleteMask() {
    this.deleteAllReportMask.Close();
  }

  /**
   * 关闭提示
   */
  public closeArmTip() {
    this.chkArmEnv.isNotOk = false;
    this.chkArmEnv.showGuide = false;
  }


  /**
   * 切换选择文件方式
   * @param mode 选中的模型
   * @param index 选中的index
   */
  public changeFileModeWeak(item: any): void {
    this.weakCheckTypeChecked = item.key;
    if (this.weakCheckTypeChecked === 'local3') {
      this.msgService.sendMessage({
        type: 'code',
      });
    } else {
      this.msgService.sendMessage({
        type: 'bc',
      });
    }
  }

  /**
   * 切换64上传文件方式
   * @param mode 选中的模型
   * @param index 选中的index
   */
  public changeUploudType64(item: any): void {
    this.isUploadDirectoryBeta = item.key;
    if (this.isUploadDirectoryBeta === 'compressed') {
      this.placeHolder64 = this.i18n.plugins_porting_title_file;
    } else {
      this.placeHolder64 = this.i18n.plugins_porting_title_folder;
    }
  }

  /**
   * 切换weak上传文件方式
   * @param mode 选中的模型
   * @param index 选中的index
   */
  public changeUploudType(item: any): void {
    this.isUploadDirectory = item.key;
    if (this.isUploadDirectory === 'compressed') {
      this.placeHolderWeak = this.i18n.plugins_porting_title_file;
    } else {
      this.placeHolderWeak = this.i18n.plugins_porting_title_folder;
    }
  }


  /**
   * worker为1-3提示
   * @param realStatus 接口返回的状态
   */
  private lackWorkerTip(realStatus: string) {
    if (!this.intellijFlag) {
      // worker为1-3
      if (realStatus === PortWorkerStatus.CREATE_TASK_LACKWORKER_STATUS) {
        this.utilsService.showMessageByWorker('info');
      }
    }
  }

  // 根据场景切换图片函数，兼容1.52.1老版本vscode
  getOptionsImg(opt: any) {
    if (this.currTheme === 1){
      return this.sanitizer.bypassSecurityTrustResourceUrl(
        (opt.hover || this.selectType.curSelObj.id === opt.id)
          ? opt.isSelectedImg
          : opt.isNormalImg
      );
    } else {
      return this.sanitizer.bypassSecurityTrustResourceUrl(
        (opt.hover || this.selectType.curSelObj.id === opt.id)
          ? opt.isSelectedImgLight
          : opt.isNormalImgLinght
      );
    }
  }

  public updatePage() {
    if (this.localFilePath.length !== 0) {
      this.weakFileName = this.fileName;
    }
    if (this.intellijFlag) {
      this.zone.run(() => {
        this.changeDetectorRef.checkNoChanges();
        this.changeDetectorRef.detectChanges();
      });
    }
  }
}
