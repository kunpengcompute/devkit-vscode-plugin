import {
  Component, OnInit, ElementRef, ViewChild, ViewEncapsulation,
  AfterContentInit, AfterViewInit, HostListener, OnDestroy
} from '@angular/core';
import {
  FormBuilder, FormControl, FormGroup
} from '@angular/forms';
import { Router } from '@angular/router';
import {
  TiMessageService, TiModalRef, TiSelectComponent,
  TiValidationConfig, TiModalService
} from '@cloud/tiny3';
import axios from 'axios';
import * as JSZip from 'jszip';
import { Subscription, fromEvent } from 'rxjs';
import { debounceTime } from 'rxjs/internal/operators';
import { HyMiniModalService } from 'hyper';

import {
  RegService, PortWorkerStatusService, AxiosService,
  MessageService, CommonService, I18nService,
  MytipService, ReportService, CustomValidators
} from '../../../service';
import { SourceCodeReportApi, HomeApi } from '../../../api';
import { LoadingScene } from '../../../shared/directive/loading/domain';
import { CreateLoadingRefService } from '../../../shared/directive/loading/service/create-loading-ref.service';
import { ACCEPT_TYPE, ACCEPT_TYPE_IE, ONLINE_HELP } from '../../../global/url';
import { DEFAULT_OS, fileSize, LanguageType } from '../../../global/globalData';
import { isMac } from '../../../utils';
import { Status } from '../../../modules';

const hardUrl: any = require('../../../../assets/hard-coding/url.json');

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class HomeComponent implements OnInit, AfterContentInit, AfterViewInit, OnDestroy {
  constructor(
    public mytip: MytipService,
    public timessage: TiMessageService,
    private elementRef: ElementRef,
    public router: Router,
    public Axios: AxiosService,
    public fb: FormBuilder,
    public i18nService: I18nService,
    private miniModalServe: HyMiniModalService,
    private msgService: MessageService,
    private reportServe: ReportService,
    private commonService: CommonService,
    private regService: RegService,
    private portWorkerStatusService: PortWorkerStatusService,
    private sourceCodeReportApi: SourceCodeReportApi,
    private homeApi: HomeApi,
    private tiModal: TiModalService,
    private createLoadingRefService: CreateLoadingRefService
  ) {
    this.i18n = this.i18nService.I18n();
  }
  @ViewChild('delHistoryReport', { static: false }) delHistoryReport: any;
  @ViewChild('exitmask', { static: false }) exitMask: any;
  @ViewChild('saveasmask', { static: false }) saveasMask: any;
  @ViewChild('suredeletemask', { static: false }) suredeleteMask: any;
  @ViewChild('tipInstruct', { static: false }) tipInstruct: any;
  @ViewChild('aboutmore') aboutMore: any;
  @ViewChild('ieShowModal', { static: false }) ieShowModal: any;
  public noFileSelected = false;
  public maximumTime: any; // 上传等待定时器
  public fileExceed = false; // 文件超过 1G
  public showInfo = true;
  public interpretedShow = true;
  public editorSelect = 'one';
  public interpretedSelect = false;
  public cSelect = true;
  public goSelect = false;
  public fortranSelect = false;
  public interpretedSelectOne = false;
  public goNotSelectOnly = true;
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
    secondItem: {
      label: '',
      value: ''
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
  public humanBudgetNum = 0;
  public humanBudget = 0;
  public humanStandard = 0;
  public enWidth: any;
  public isIe: any;
  public imgBase = '';
  public cmakeNeedTrans: number;
  public automakeNeedTrans: number;
  public asmNeedTrans: number;
  public asmFileLines: number;
  public asmlines: number;
  public makefileNeedTrans: number;
  public makefileTotal: number;
  public makefileLines: number;
  public pythonNeedTrans: number;
  public pythonLines: number;
  public golangNeedTrans: number;
  public golangLines: number;
  public fortranNeedTrans: number;
  public fortranLines: number;
  public javaNeedTrans: number;
  public javaLines: number;
  public scalaNeedTrans: number;
  public scalaLines: number;
  public interpretedLines: number;
  public soFilesNeed: number;
  public soFilesTotal: number;
  public soFilesUse: number;
  public cFileTotal: number;
  public cFileNeed: number;
  public cLines: number;
  public totalLine: any = 0;
  public cfileLine = 0;
  public cfileDetailSrcData: Array<any> = [];
  public portingLevelList: Array<any>;
  public binDetailSrcData: Array<any>;
  public reportLockStatus = false;

  public scanItems = ['soFile', 'cFile', 'lines'];
  public isOpen = false;
  public scanItemsObj: any = {
    soFile: {
      id: '2',
      label: '',
      icon: './assets/img/home/file.png',
      content: '',
      files: [],
      hasDetail: false,
      isOpen: false
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
  public userPath = '';
  public goTip = '';
  public goTipSwitch: boolean;
  public reportId = '';
  public HisoricalReportList: Array<any> = [];
  public currLang: any;
  public progressData: any = {};
  public needCodeType: any;
  url = '/upload';
  public reportTotalNum = 0;
  public dangerFlag = false;
  public safeFlag = false;
  public toomany = '';
  public nameReg = new RegExp(/^[a-zA-Z][a-zA-Z0-9_-]{5,31}$/);
  public search: any;
  public i18n: any;
  public leftContainerWidth: number;
  public inputPrompt1 = '';
  public expired: string;
  public tipStr: string;
  public isCommit = false;
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
  public userPwd: FormGroup;
  public confirmUploadZip: any;
  public maxFilenameLength: any;
  public label: any;
  public isHomePage = true;
  public isFirst = false;
  public commandControl: any;
  public singleSys: any = {
    options: [],
    selected: {}
  };
  public upTimes = 0;
  public inputItems: any = {
    path: {
      label: '',
      rules: '',
      value: '', // 默认为当前用户名
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
    }
  };
  // 去新报告则赋值
  public goNewReport = '';
  public isOldReport = false;
  public showModalWarn = '';
  public showModalBtn = '';
  // 保存当前选择的OS
  public currSelectOS: any;

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

  dataArray1: Array<any> = [
    { id: 0, text: 'C/C++/ASM', label: 'GCC' },
    { id: 1, text: 'Fortran', label: 'GFortran' },
    { id: 1, text: 'Go', label: 'Go' },
    { id: 1, text: 'Interpreted', label: 'Interpreted' },
  ];
  // checkedarray默认勾选c/c++/asm
  checkedArray1: Array<any> = [this.dataArray1[0]];

  public currentWidth: number;
  public areaMatchHeight: number;
  public info = {
    filename: '',
    filesize: ''
  };
  public uploadProgress: any;
  isShow = false;
  isSlow = false;
  hoverFlag = false;

  public oldName: any;
  public outfilepath: any;
  public isCompress = false;
  public uploadResultTip = {
    state: '',
    content: ''
  };

  public cancel: any; // 取消 文件上传 axios 请求
  public isUploadFile: boolean;
  config = {
    onUploadProgress: (progressEvent: any) => {
      let complete = Math.floor((progressEvent.loaded / progressEvent.total) * 100) + 50;
      complete = Math.min(complete, 100);
      if (!sessionStorage.getItem('token')) {
        this.cancel();
        return;
      }
      this.msgService.sendMessage({
        type: 'uploadingContainer',
        name: 'SourceCode',
        data: 'start',
        isShow: true,
        isConpress: false,
        uploadProgress: complete + '%'
      });
      if (complete === 100) {
        // 上传源代码-文件夹时不展示“解压中”
        this.msgService.sendMessage({
          type: 'uploadingContainer',
          name: 'SourceCode',
          data: 'start',
          isShow: false,
          isConpress: true,
          uploadProgress: complete + '%'
        });
      }
    }
  };

  public cancel1: any; // 取消 压缩包上传 axios 请求
  alreadyconfig = {
    onUploadProgress: (progressEvent: any) => {
      const complete = Math.floor((progressEvent.loaded / progressEvent.total) * 100);
      if (!sessionStorage.getItem('token')) {
        this.cancel1();
        return;
      }
      this.msgService.sendMessage({
        type: 'uploadingContainer',
        name: 'SourceCode',
        data: 'start',
        isShow: true,
        isCompress: false,
        uploadProgress: complete + '%'
      });
      if (complete === 100) {
        this.msgService.sendMessage({
          type: 'uploadingContainer',
          name: 'SourceCode',
          data: 'start',
          isShow: false,
          isCompress: true,
          uploadProgress: complete + '%'
        });
      }
    }
  };
  public isHalf = false;

  public pathlist: any = [];
  public displayAreaMatch = false;
  public multipleInput = true;
  public reportService: any;

  public waiting: boolean; // 任务是否处于等待中
  private creatingResultMsgSub: Subscription;
  private creatingSourceCodeProgressSub: Subscription;   // 监听源码分析中，分析中按钮置灰
  private uploadingContainerSub: Subscription;
  public createBtnDisabled = false;
  public createBtnDisabledTip = '';
  public isUploadZip = false;
  public uploadZipFile: any;
  public uploadFolderFileList: any;
  public exitFileName = '';
  public exitFileNameReplace = '';
  public fileNameDelete = '';
  public suffix = '';
  public deleteValue = '';
  public chkArmEnv = {
    isOk: false,
    tip: '',
    showGuide: false,
    guideTip: '',
    installGuide: '',
    glibcLink: hardUrl.glibcLink
  };

  public accrptType: string; // 压缩包上传支持类型
  public isMac: boolean;

  public cancelBlur = true;
  @HostListener('window:mousedown', ['$event'])
  handleMouseDown(event: any) {
    let tarArray = [];
    if (event.target.className.includes(' ')) {
      tarArray = event.target.className.split(' ');
    }
    if (event.target.className === 'areaMatchDiv' || tarArray[0] === 'areaMatch') {
      this.cancelBlur = false;
      event.stopPropagation();
    } else {
      this.cancelBlur = true;
      this.blurAreaMatch();
    }
  }

  getTaskUndone() {
    this.Axios.axios.get('/portadv/tasks/taskundone/').then((resp: any) => {
      if (this.commonService.handleStatus(resp) === 0 && resp.data.id) {
        this.reportId = resp.data.id;
        this.msgService.sendMessage({
          type: 'creatingTask',
          data: {
            id: this.reportId,
            type: 'SourceCode'
          }
        });
        this.createBtnDisabled = true;
        this.createBtnDisabledTip = this.i18n.common_term_creating_btn_disabled_tip;
      }
    });
  }

  private checkAsmEnv() {
    this.Axios.axios.get('/portadv/tasks/checkasmenv/').then((resp: any) => {
      if (this.commonService.handleStatus(resp) === 1) {
        this.chkArmEnv.isOk = true;
        this.chkArmEnv.tip = this.currLang === LanguageType.ZH_CN ? resp.infochinese : resp.info;
        sessionStorage.setItem('homeGuideShow', 'true');
      }
    });
  }

  public closeArmTip() {
    this.chkArmEnv.isOk = false;
    this.chkArmEnv.showGuide = false;
    sessionStorage.setItem('homeGuideShow', 'false');
  }

  private getSystemInfo() {
    this.Axios.axios.get('/portadv/tasks/systeminfo/').then((resp: any) => {
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
    });
  }

  // option排序
  public optionsSort(options: any) {
    return options.sort((a: any, b: any) => {
      let labelA = a.label.toLowerCase().charCodeAt(0);
      let lableB = b.label.toLowerCase().charCodeAt(0);
      if (labelA === lableB) {
        labelA = a.label.toLowerCase().charCodeAt(1);
        lableB = b.label.toLowerCase().charCodeAt(1);
        return labelA === lableB ? a.label.split(' ')[1] - b.label.split(' ')[1] : labelA - lableB;
      } else {
        return labelA - lableB;
      }
    });
  }

  /**
   * 获取目标OS操作系统
   * @param isFirst 是否是首次请求
   */
  private getLinuxOSList(resp: any, isFirst?: boolean) {
    this.inputItems.linuxOS.options = [];
    this.inputItems.kernelVersion.options = [];
    if (this.commonService.handleStatus(resp) === 0) {  // 成功获取依赖字典
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
    } else if (resp.status === '0x050110') {  // 获取依赖字典失败
      const message = this.currLang === LanguageType.ZH_CN ? resp.infochinese : resp.info;
      this.mytip.alertInfo({ type: 'error', content: message, time: 10000 });
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

  ngOnDestroy(): void {
    if (this.reportService) {
      this.reportService.unsubscribe();
    }
    if (this.creatingResultMsgSub) {
      this.creatingResultMsgSub.unsubscribe();
    }
    sessionStorage.removeItem('sourceCodePathName');
  }
  ngAfterViewInit(): void {
    const container = $('.router-content')[0];
    const dropContainer = $('ti-drop.ti3-dropdown-container');
    fromEvent(container, 'scroll')
      .pipe(debounceTime(50))
      .subscribe(e => {
        const url = this.router.url.split('?')[0];
        const routerList = [
          '/homeNew/home',
          '/homeNew/analysisCenter',
          '/homeNew/migrationCenter',
          '/homeNew/PortingPre-check'
        ];
        if (!dropContainer.length || routerList.indexOf(url) < 0) { return; }
        const bannerState = JSON.parse(sessionStorage.getItem('bannerShow'));
        if (bannerState) {
          this.msgService.sendMessage({
            type: 'collapseBanner',
            data: false
          });
        }
        for (const drop of dropContainer) {
          drop.style.display = 'none';
        }
      });
  }
  ngOnInit() {
    this.isMac = isMac();
    this.accrptType = this.isMac || this.commonService.isIE11()
      ? ACCEPT_TYPE_IE.sourceMigration
      : ACCEPT_TYPE.sourceMigration;

    if (!!(window as any).ActiveXObject || 'ActiveXObject' in window) {
      this.isIe = true;
    }
    this.reportService = this.msgService.getMessage().subscribe(msg => {
      if (msg.value && msg.type === 'isreportChange') {
        this.getHistoryReport();
      }
    });

    this.msgService.getMessage().subscribe(msg => {
      if (msg.type === 'taskComplete') {
        sessionStorage.removeItem('sourceScanTaskPath');
      }
    });

    this.creatingResultMsgSub = this.msgService.getMessage().subscribe(msg => {
      if (msg.type === 'creatingResultMsg') {
        if (msg.data.type === 'SourceCode') {
          this.getHistoryReport();
        }
      }
    });

    this.creatingSourceCodeProgressSub = this.msgService.getMessage().subscribe(msg => {
      if (msg.type === 'creatingSourceCodeProgress') {
        this.createBtnDisabled = msg.data;
        this.createBtnDisabledTip = msg.data ? this.i18n.common_term_creating_btn_disabled_tip : '';
      }
    });

    // 查看任务是否处于等待中
    const token = sessionStorage.getItem('token');
    const numTask = JSON.parse(sessionStorage.getItem('sourceMaximumTask'));
    if (token && numTask > 0 && numTask < 20) {
      this.isCompress = true;
      this.waiting = true;
    }

    // 监听压缩包上传弹框
    this.uploadingContainerSub = this.msgService.getMessage().subscribe(msg => {
      if (msg.type === 'uploadingContainer' && msg.name === 'SourceCode') {
        this.isShow = msg.isShow;
        this.isCompress = msg.isCompress;
        if (msg.data === 'start') {
          this.uploadProgress = msg.uploadProgress;
          const info = sessionStorage.getItem('sourceCodeFileInfo');
          if (info) {
            this.info = JSON.parse(info);
          }
          this.waiting = false;
        } else if (msg.data === 'end') {
          if (msg.path || msg.path === '') {
            this.inputItems.path.value = msg.path;
            sessionStorage.setItem('sourceCodePathName', msg.path);
          }
          this.uploadResultTip.state = msg.state;
          this.uploadResultTip.content = msg.content;
          this.waiting = false;
        } else { // 任务等待中
          this.waiting = true;
        }
      }
    });
    const pathName = sessionStorage.getItem('sourceCodePathName');
    if (pathName) {
      this.inputItems.path.value = pathName;
    }

    this.expired = sessionStorage.getItem('isExpired');
    this.currLang = sessionStorage.getItem('language');
    this.dataArray1[3].text = this.i18n.common_term_ipt_label.interpreted;
    this.tipStr = this.i18n.common_porting_message_passwordExpired;
    if (sessionStorage.getItem('isFirst') !== '1' && sessionStorage.getItem('isExpired') !== '1') {
      const msgList = sessionStorage.getItem('resultMsgList');
      const resultMsgList = msgList ? JSON.parse(msgList) : [];
      const sourceCodeMsgLen = resultMsgList
        .filter((msg: any) => msg.type === 'SourceCode' && msg.state === 'failed').length;
      if (sourceCodeMsgLen > 0) {
        this.createBtnDisabled = true;
        this.createBtnDisabledTip = this.i18n.common_term_creating_btn_disabled_tip;
      }
      this.inputPrompt1 = this.i18nService.I18nReplace(
        this.i18n.common_term_analysis_sourcecode_path3,
        { 1: `/portadv/${sessionStorage.getItem('username')}/sourcecode/` }
      );
      this.Axios.axios.get(`/customize/`).then((resp: any) => {
        if (this.commonService.handleStatus(resp) === 0) {
          const rootPath = resp.data.customize_path;
          this.userPath = `${rootPath}/portadv/${sessionStorage.getItem('username')}/sourcecode/`;
          this.inputPrompt1 = this.i18nService.I18nReplace(
            this.i18n.common_term_analysis_sourcecode_path3,
            { 1: this.userPath }
          );
          this.chkArmEnv.guideTip = this.i18nService.I18nReplace(
            this.i18n.automake_evn_check.guide_tip1,
            { 1: `${rootPath}/portadv` }
          );
          this.chkArmEnv.installGuide = this.i18nService.I18nReplace(
            this.i18n.automake_evn_check.guide_tip2,
            { 1: `${rootPath}/portadv`, 2: `${rootPath}/portadv` }
          );
        }
      });
      this.Axios.axios.get(`/portadv/tasks/platform/`).then((resp: any) => {
        if (this.commonService.handleStatus(resp) !== 0) {
          this.chkArmEnv.glibcLink = hardUrl.glibcLinkAarch;
        }
      });
      if (sessionStorage.getItem('homeGuideShow') !== 'false') {
        this.checkAsmEnv();
      }
      this.getSystemInfo();
      this.getHistoryReport();
      this.getTaskUndone();
      this.inputAreaMatch();
    }
    this.label = {
      Pwd: this.i18n.common_term_user_label.password,
      Cpwd: this.i18n.common_term_user_label.confirmPwd,
      oldPwd: this.i18n.common_term_user_label.oldPwd
    };
    this.needCodeType = this.i18n.common_term_needCodeType;
    this.inputItems.path.label = this.i18n.common_term_ipt_label.source_code_path;
    this.inputItems.version.label = this.i18n.common_term_ipt_label.compiler_version;
    this.inputItems.tool.label = this.i18n.common_term_ipt_label.construct_tool;
    this.inputItems.command.label = this.i18n.common_term_ipt_label.compile_command;
    this.inputItems.linuxOS.label = this.i18n.common_term_ipt_label.target_os;
    this.inputItems.fortran.label = this.i18n.common_term_ipt_label.fortran;
    this.inputItems.kernelVersion.label = this.i18n.common_term_ipt_label.target_system_kernel_version;

    this.textForm1.firstItem.label = this.i18n.common_term_ipt_label.source_code_path;
    this.textForm1.secondItem.label = this.i18n.common_term_ipt_label.target_os;
    this.textForm1.thirdItem.label = this.i18n.common_term_ipt_label.target_system_kernel_version;
    this.textForm1.fourthItem.label = this.i18n.common_term_ipt_label.compiler_version;
    this.textForm1.fifthItem.label = this.i18n.common_term_ipt_label.construct_tool;
    this.textForm1.sixthItem.label = this.i18n.common_term_ipt_label.compile_command;
    this.scanItemsObj.soFile.label = this.i18n.common_term_result_soFile;
    this.scanItemsObj.cFile.label = this.i18n.common_term_result_cFile;
    this.scanItemsObj.lines.label = this.i18n.common_term_result_lines;
    this.validation.errorMessage.regExp = this.i18n.common_term_no_samepwd;
    this.validation.errorMessage.required = this.i18n.common_term_no_samepwd;

    this.userPwd = new FormGroup({
      oldPwd: new FormControl('', [CustomValidators.oldPwd(this.i18n)]),
      pwd: new FormControl('', [CustomValidators.password(this.i18n)]),
      cpwd: new FormControl('', [this.userPwdConfirm])
    });
    this.commandControl = new FormControl('', [CustomValidators.commandControl(this.i18n, this)]);
    this.confirmUploadZip = new FormControl('', [CustomValidators.confirmNewName(this.i18n)]);
    this.maxFilenameLength = new FormControl(
      '', [CustomValidators.multifilenameLength(this.i18n), CustomValidators.filenameCheck(this.i18n)]);
    this.ngAfterContentInit();

    this.progressData = {
      id: 'disk',
      label: '',
      isShow: false,
      value: 0
    };
    this.confirmName = {
      zip: {
        label: this.i18n.analysis_center.exit.file_name,
        value: '',
        required: true
      },
      folder: {
        label: this.i18n.analysis_center.exit.file_name,
        value: '',
        required: true
      }
    };

  }

  // 改变 history 报告图标
  public changeHistoryImgSrc(num: number, bool: boolean, item: any): void {
    if (!num) {
      item.imgSrc[num] = !bool
      ? './assets/img/home/download_hover.svg'
      : './assets/img/home/download.svg';
    } else {
      item.imgSrc[num] = !bool
      ? './assets/img/home/delete_hover.svg'
      : './assets/img/home/delete.svg';
    }
  }

  public osSelectChange(data: any) {
    this.inputItems.version.selected = this.inputItems.version.options.find((gcc: any) => {
      return gcc.label === data.gcc_default;
    });
    this.inputItems.kernelVersion.selected.label = data.kernel_default;
  }

  /**
   * 鼠标选中下拉框，获取目标操作系统
   */
  public onBeforeOpen(selectComp: TiSelectComponent): void {
    this.Axios.axios.get('/portadv/tasks/systeminfo/').then((resp: any) => {
      if (resp && resp.data) {
        // 获取目标OS列表
        this.getLinuxOSList(resp);
      }
    }).catch(() => {
        selectComp.close();
        return;
    });
    selectComp.open();

    // 设置滚动条位置
    setTimeout(() => {  // 页面数据更新之后再执行
      const selectDoms: any = document.querySelectorAll('.ti3-dropdown-container');
      for (const dom of selectDoms) {
        const select = dom;  // 下拉框
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
  public commandChange(data: any) {
    const inputDom = document.getElementsByClassName('command-input')[0] as HTMLElement;
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

  checkAnalyzeForm() {
    this.noFileSelected = false;
    if (!this.inputItems.path.value && !this.pathlist.length) {
      this.noFileSelected = true;
    } else {
      if (!this.commandControl.valid) { return; }
      if (!this.maxFilenameLength.valid) { return; }
      if (this.createBtnDisabled) { return; }
      this.createReport();
    }
  }

  createReport() {
    this.uploadResultTip.content = '';
    // 创建report
    let sourcedir = '';
    let inputPath = this.inputItems.path.value;
    if (inputPath) {
      if (inputPath.search(',') === -1) {
        inputPath = inputPath.replace(/(^\s*)|(\s*$)/g, '').replace(/[\r\n]/g, '');
        if (inputPath.charAt(inputPath.length - 1) === '/') {
          inputPath = inputPath.slice(0, -1);
        }
        sourcedir = `${this.userPath}${inputPath}`;
      } else {
        let values = inputPath.split(',');
        if (values.length > 1) {
          const diffArr: any = [];
          values.forEach((val: any) => {
            if (diffArr.indexOf(val) === -1) { diffArr.push(val); }
          });
          values = diffArr.slice();
        }
        if (values[0]) {
          values[0] = values[0].replace(/(^\s*)|(\s*$)/g, '').replace(/[\r\n]/g, '');
          if (values[0].charAt(values[0].length - 1) === '/') {
            values[0] = values[0].slice(0, -1);
          }
          sourcedir = `${this.userPath}${values[0]}`;
        }

        for (let j = 1; j <= values.length; j++) {
          if (values[j]) {
            values[j] = values[j].replace(/(^\s*)|(\s*$)/g, '').replace(/[\r\n]/g, '');
            if (values[j].charAt(values[j].length - 1) === '/') {
              values[j] = values[j].slice(0, -1);
            }

            sourcedir += `,${this.userPath}${values[j]}`;
          }
        }
      }
    } else {
      sourcedir = this.userPath;
    }
    const targetos = this.inputItems.linuxOS.selected.label.toLowerCase();
    let gfortran = this.inputItems.fortran.selected.label.toLowerCase();
    gfortran = gfortran.split(' ').join('');
    const type = this.inputItems.version.selected.type.toLowerCase();

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
        targetkernel: this.inputItems.kernelVersion.selected.label
      }
    };
    setTimeout(() => {
      if (this.checkedArray1.length === 1
        && (this.checkedArray1[0].label === 'GCC' || this.checkedArray1[0].label === 'Go' )
      ) {
        params.info.gfortran = '';
      }
      if (this.checkedArray1.length === 1 && this.checkedArray1[0].label === 'GFortran') {
        params.info.compiler.type = '';
        params.info.compiler.version = '';
      }
      if (this.checkedArray1.length === 0) {
        params.info.compiler.type = '';
        params.info.compiler.version = '';
        params.info.gfortran = '';
      }
      this.homeApi.analyseSourcePackage(params).then((resp: any) => {
        if (resp.data.id && this.commonService.handleStatus(resp) === 0) {  // 任务创建成功

          // 保存创建任务返回的状态码
          this.portWorkerStatusService.workerStatusCode = resp.status;

          // 保存状态，页面刷新后获取
          localStorage.setItem('workerStatusCode', resp.status);

          // 保存当前扫描的文件夹名
          sessionStorage.setItem('sourceScanTaskPath', JSON.stringify(sourcedir));
          this.reportId = resp.data.id;
          this.Axios.axios.get(
            `/task/progress/?task_type=0&task_id=${encodeURIComponent(this.reportId)}`
          ).then((data: any) => {
            if (this.commonService.handleStatus(data) === 0) {
              this.msgService.sendMessage({
                type: 'creatingTask',
                data: {
                  id: this.reportId,
                  type: 'SourceCode',
                }
              });
              this.createBtnDisabled = true;
              this.createBtnDisabledTip = this.i18n.common_term_creating_btn_disabled_tip;
              return;
            }
            const failInfo = sessionStorage
              .getItem('language') === LanguageType.ZH_CN ? data.infochinese : data.info;
            const resultMsg = {
              id: this.reportId,
              type: 'SourceCode',
              msg: failInfo,
              state: 'failed'
            };
            this.msgService.sendMessage({
              type: 'creatingResultMsg',
              data: resultMsg
            });
            this.createBtnDisabled = true;
          });
        } else {  // 任务创建失败
          if (resp && resp.status === this.portWorkerStatusService.createTaskNoWorkerStatus) {  // worker为0
            const resultMsg = {
              id: this.reportId,
              type: 'SourceCode',
              state: 'failed',
              status: resp.status
            };
            this.msgService.sendMessage({
              type: 'creatingResultMsg',
              data: resultMsg
            });
            this.createBtnDisabled = true;
          } else {
            this.inputItems.path.value = '';
            const content = this.currLang === LanguageType.ZH_CN ? resp.infochinese : resp.info;
            this.createBtnDisabled = true;
            const resultMsg = {
              id: this.reportId,
              type: 'SourceCode',
              state: 'failed',
              msg: content,
              situation: 3,
              status: resp.status
            };
            this.msgService.sendMessage({
              type: 'creatingResultMsg',
              data: resultMsg
            });
          }
        }
      });
    }, 100);
  }

  getHistoryReport() {
    this.Axios.axios.get('/portadv/tasks/').then((resp: any) => {
      this.HisoricalReportList = [];
      if (this.commonService.handleStatus(resp) === 0) {
        this.toomany = '';
        this.isCommit = false;
        this.dangerFlag = false;
        this.safeFlag = false;
        if (resp.data.histasknumstatus === 2) {
          this.safeFlag = true;
        } else if (resp.data.histasknumstatus === 3) {
          this.toomany = this.i18n.common_term_report_danger_tit;
          this.isCommit = true;
          this.dangerFlag = true;
        }
        resp.data.tasklist.forEach((item: any) => {
          this.HisoricalReportList.push({
            created: this.formatCreatedId(item.id),
            id: item.id,
            showTip: false,
            imgSrc: ['./assets/img/home/download.svg', './assets/img/home/delete.svg']
          });
        });

        this.reportTotalNum = resp.data.totalcount;
        if (this.reportTotalNum > 50 && this.isHomePage) {
          const that = this;
          if (sessionStorage.getItem('reportFlag') !== 'false') {
            this.timessage.open({
              type: 'prompt',
              title: this.i18n.common_term_history_list_overflow_tip,
              content: this.i18n.common_term_history_list_overflow_tip2,
              cancelButton: {
                show: false
              },
              close(messageRef: TiModalRef): void {
                if (that.isFirst) {
                  that.getTaskUndone();
                }
                that.isFirst = false;
                sessionStorage.setItem('reportFlag', 'false');
              }
            });
          }
        } else {
          if (this.isFirst) {
            this.getTaskUndone();
          }
          this.isFirst = false;
        }
      }
    });
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

  goReportDetail(item: any) {
    const loadingRef = this.createLoadingRefService.createLoading(
      document.querySelector('div.home-container'), LoadingScene.GLOBAL); // 生成loading页面
    const param = {
      queryParams: {
        report: item.id
      }
    };
    this.sourceCodeReportApi.getReport(encodeURIComponent(item.id)).then((resp: any) => {
      // 销毁loading
      this.createLoadingRefService.destroyLoading(loadingRef);
      if (this.commonService.handleStatus(resp) !== 0 &&
          this.commonService.handleStatus(resp) !== 1 &&
          this.commonService.handleStatus(resp) !== 2 ) {
        const content = this.currLang === 'zh-cn' ? resp.infochinese : resp.info;
        this.mytip.alertInfo({ type: 'error', content, time: 5000 });
      } else {
        this.router.navigate(['report'], param);
        sessionStorage.setItem('tabFlag', 'true');
      }
    });
  }
  getReportDetail(report: any, type: string) {
    this.getConfigData();
    this.cfileDetailSrcData = [];
    this.Axios.axios.defaults.headers.isLocked = true;
    this.sourceCodeReportApi.getReport(encodeURIComponent(report.id)).then((resp: any) => {
        if (this.commonService.handleStatus(resp) !== 0) {
          const content = this.currLang === 'zh-cn' ? resp.infochinese : resp.info;
          this.mytip.alertInfo({ type: 'error', content, time: 5000 });
          return;
        }
        // 读取报告失败
        if (resp.data === {} || resp.data.portingresult === {}) { return; }
        this.portingLevelList = [];
        const soFileList: any = [];
        let compiler = '';
        this.soFilesNeed = 0;
        this.asmNeedTrans = 0;
        this.cmakeNeedTrans = 0;
        this.automakeNeedTrans = 0;
        this.asmFileLines = 0;
        this.asmlines = 0;
        this.makefileNeedTrans = 0;
        this.makefileTotal = 0;
        this.makefileLines = 0;
        this.pythonLines = 0;
        this.golangLines = 0;
        this.fortranLines = 0;
        this.soFilesTotal = 0;
        this.soFilesUse = 0;
        this.cLines = 0;
        this.cFileTotal = 0;
        this.cFileNeed = 0;
        this.goTipSwitch = false;
        this.textForm1.firstItem.value = resp.data.info.sourcedir.split(',');
        const gf = resp.data.info.gfortran.toUpperCase() || '';
        this.textForm1.secondItem.value = resp.data.info.targetos === 'centos7.6'
            ? 'CentOS 7.6'
            : resp.data.info.targetos;
        this.textForm1.thirdItem.value = `${resp.data.info.targetkernel}`;
        // 合并编译工具的gcc字段
        if (resp.data.info.compiler.type
          || (resp.data.info.compiler.type && resp.data.info.cgocompiler.type)
        ) {
          compiler = `${resp.data.info.compiler.type.toUpperCase()} ` + resp.data.info.compiler.version;
        } else if (resp.data.info.cgocompiler.type) {
          compiler = `${resp.data.info.cgocompiler.type.toUpperCase()} ` + resp.data.info.cgocompiler.version;
        }
        if (compiler && gf) {
          this.textForm1.fourthItem.value = compiler + `, ${gf}`;
        } else if (compiler && !gf) {
          this.textForm1.fourthItem.value = compiler;
        } else if (!compiler && gf) {
          this.textForm1.fourthItem.value = `${gf} `;
        }
        this.textForm1.fifthItem.value = resp.data.info.constructtool;
        this.textForm1.sixthItem.value = resp.data.info.compilecommand;
        const porting_level = resp.data.portingresult.porting_level;
        const obj: any = {};
        // 获取后端返回的提示语，并考虑兼容
        if (resp.data.portingresult.tips) {
          if (resp.data.portingresult.tips.length !== 0 && this.currLang === LanguageType.ZH_CN){
            this.goTipSwitch = true;
            this.goTip = resp.data.portingresult.tips[0].info_cn;
          } else if (resp.data.portingresult.tips.length !== 0 && this.currLang === LanguageType.EN_US){
            this.goTipSwitch = true;
            this.goTip = resp.data.portingresult.tips[0].info_en;
          }
        } else {
          this.goTip = '';
        }
        if (porting_level) {
          for (const key in porting_level) {
            if (porting_level.hasOwnProperty(key)) {
              if (porting_level[key].amount) {
                obj[key] = porting_level[key];
                this.soFilesTotal += porting_level[key].amount; // total
              }
              if (Number(key) === 2 || Number(key) === 3) {
                porting_level[key].bin_detail_info.forEach((bin: any) => {
                  bin.level = key;
                });
                this.portingLevelList = this.portingLevelList.concat(porting_level[key].bin_detail_info);
                this.soFilesNeed += porting_level[key].amount; // need
              }
            }
          }
          this.soFilesUse = this.soFilesTotal - this.soFilesNeed;
        }

        if (sessionStorage.getItem('language') === LanguageType.EN_US) {
          this.enWidth = 240 + 'px';
          if (resp.data.portingresult.workload > 0 && resp.data.portingresult.workload <= 1) {
            this.humanBudget = this.i18n.common_Estimated_standard_subinfo2;
          } else {
            this.humanBudget = this.i18n.common_Estimated_standard_subinfo1;
          }
        } else {
          this.enWidth = 240 + 'px';
          this.humanBudget = this.i18n.common_Estimated_standard_subinfo;
        }
        const workload = resp.data.portingresult.workload;
        this.humanBudgetNum = workload || 0;
        this.portingLevelList.forEach(detail => {
          soFileList.push(detail.libname);
        });
        let arr: any = [];
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            obj[key].bin_detail_info.forEach((item: any) => {
              item.level = String(key);
            });
            arr = arr.concat(obj[key].bin_detail_info);
          }
        }
        this.portingLevelList = arr;
        this.portingLevelList = this.portingLevelList.map((item, index) => {
          const curTargetOs = this.textForm1.fifthItem.value.toLowerCase();
          const num = item.url.lastIndexOf('\/');
          item.downloadDesc = '';
          if (item.url) {
            if (
              curTargetOs.indexOf('linxos') >= 0
              || curTargetOs.indexOf('suse') >= 0
              || curTargetOs.indexOf('euleros') >= 0
            ) {
              item.downloadDesc = this.i18n.common_term_report_level_download_opt_desc;
            }
          }
          item.type = this.formatSoType(item.type, true);
          return {
            number: index + 1,
            level: item.level,
            name: item.libname,
            desc: item.desc || '--',
            pathName: unescape(item.url.substring(num + 1, item.url.length)) || '--',
            oper: this.formatSoSuggestion(item.level, true) || '--',
            result: this.formatSoResult(item.level, item.type, true),
            url: item.url || '--',
            type: item.type,
            downloadDesc: item.downloadDesc,
            showTip: false
          };
        });

        // 行合并处理
        if (this.portingLevelList.length) {
          this.portingLevelList = this.linePortingLevel(this.portingLevelList);
        }

        // 版本问题规避部分字段
        const cmakelistsinfo = resp.data.portingresult.cmakelistsinfo;
        const cmakeLines = resp.data.portingresult.cmakelistslines || 0;

        const automakeinfo = resp.data.portingresult.automakeinfo;
        const automakeLines = resp.data.portingresult.automakelines || 0;

        this.binDetailSrcData = this.portingLevelList;
        this.cFileTotal = resp.data.portingresult.codefileinfo.totalcount;
        this.cFileNeed = resp.data.portingresult.codefileinfo.needtranscount;
        const codefiles = resp.data.portingresult.codefileinfo.files; // cfile下拉
        this.cLines = resp.data.portingresult.codelines;
        this.asmlines = resp.data.portingresult.asmlines;
        const asmfiles = resp.data.portingresult.asmfileinfo.files; // cfile下拉
        this.asmNeedTrans = resp.data.portingresult.asmfileinfo.needtranscount;
        this.asmFileLines = resp.data.portingresult.asmfilelines;

        this.cmakeNeedTrans = cmakelistsinfo ? cmakelistsinfo.needtranscount : 0;
        const cmakefiles = cmakelistsinfo ? cmakelistsinfo.files : []; // cfile下拉
        this.automakeNeedTrans = automakeinfo ? automakeinfo.needtranscount : 0;
        const automakefiles = automakeinfo ? automakeinfo.files : []; // cfile下拉
        this.makefileNeedTrans = resp.data.portingresult.makefileinfo.needtranscount;
        this.makefileTotal = resp.data.portingresult.makefileinfo.totalcount;
        this.makefileLines = resp.data.portingresult.makefilelines;
        const makefiles = resp.data.portingresult.makefileinfo.files; // cfile下拉
        this.pythonNeedTrans = resp.data.portingresult.hasOwnProperty('pythonfileinfo')
          ? resp.data.portingresult.pythonfileinfo.needtranscount
          : 0;
        const pythonfiles = resp.data.portingresult.hasOwnProperty('pythonfileinfo')
          ? resp.data.portingresult.pythonfileinfo.files
          : []; // cfile下拉
        this.pythonLines = resp.data.portingresult.pythonlines || 0;
        this.golangNeedTrans = resp.data.portingresult.hasOwnProperty('golangfileinfo')
          ? resp.data.portingresult.golangfileinfo.needtranscount
          : 0;
        const golangfiles = resp.data.portingresult.hasOwnProperty('golangfileinfo')
          ? resp.data.portingresult.golangfileinfo.files
          : []; // cfile下拉
        this.golangLines = resp.data.portingresult.golanglines || 0;
        this.fortranNeedTrans = resp.data.portingresult.fortranfileinfo.needtranscount;
        this.fortranLines = resp.data.portingresult.fortranlines;
        const fortranfiles = resp.data.portingresult.fortranfileinfo.files; // cfile下拉
        this.javaNeedTrans = (resp.data.portingresult.hasOwnProperty('javafileinfo')
            ? resp.data.portingresult.javafileinfo.needtranscount
            : 0 );
        this.javaLines = resp.data.portingresult.javalines || 0;
        const javafiles = resp.data.portingresult.hasOwnProperty('javafileinfo')
          ? resp.data.portingresult.javafileinfo.files
          : []; // cfile下拉
        this.scalaNeedTrans = (resp.data.portingresult.hasOwnProperty('scalafileinfo')
          ? resp.data.portingresult.scalafileinfo.needtranscount
          : 0 );
        this.scalaLines = resp.data.portingresult.scalalines || 0;
        const scalafiles = resp.data.portingresult.hasOwnProperty('scalafileinfo')
          ? resp.data.portingresult.scalafileinfo.files
          : []; // cfile下拉
        this.interpretedLines = (resp.data.portingresult.hasOwnProperty('interpretedlines')
          ? resp.data.portingresult.interpretedlines
          : 0 );
        // so下拉
        this.scanItemsObj.soFile.content = this.soFilesNeed;
        this.scanItemsObj.soFile.hasDetail = this.portingLevelList.length > 0;
        this.scanItemsObj.soFile.files = soFileList;

        this.scanItemsObj.cFile.content =
          this.cFileNeed
          + this.makefileNeedTrans
          + this.asmNeedTrans
          + this.cmakeNeedTrans
          + this.automakeNeedTrans
          + this.fortranNeedTrans
          + this.pythonNeedTrans
          + this.golangNeedTrans
          + this.javaNeedTrans
          + this.scalaNeedTrans;

        this.scanItemsObj.cFile.hasDetail =
          codefiles.length
          + makefiles.length
          + cmakefiles.length
          + asmfiles.length
          + automakefiles.length
          + fortranfiles.length
          + pythonfiles.length
          + golangfiles.length
          + javafiles.length
          + scalafiles.length > 0;

        this.scanItemsObj.cFile.files = codefiles
          .concat(asmfiles)
          .concat(makefiles)
          .concat(cmakefiles)
          .concat(automakefiles)
          .concat(fortranfiles)
          .concat(pythonfiles)
          .concat(golangfiles)
          .concat(javafiles)
          .concat(scalafiles);

        this.scanItemsObj.soFile.content = this.i18nService.I18nReplace(this.i18n.common_term_report_soFile_dependent, {
          0: this.soFilesTotal,
          1: this.soFilesNeed
        });
        this.cfileLine = this.scanItemsObj.cFile.content;
        this.scanItemsObj.cFile.content = this.i18nService.I18nReplace(this.i18n.common_term_report_cFile_dependent, {
          0: this.scanItemsObj.cFile.content
        });

        this.totalLine = this.cLines
          + this.makefileLines
          + cmakeLines
          + automakeLines
          + this.fortranLines
          + this.asmlines
          + this.asmFileLines
          + this.pythonLines
          + this.golangLines
          + this.javaLines
          + this.scalaLines;
        if (this.totalLine > 100000) {
          this.totalLine = parseInt(this.totalLine / 100000 + '', 10) + '0w+';
        }
        this.scanItemsObj.lines.content = this.i18nService.I18nReplace(this.i18n.common_term_report_detail_ctans_lins, {
          1: this.totalLine,
        });
        // 做动态代码行提示
        let codelines = '';
        if (this.currLang === 'zh-cn') {
          codelines = ' 行';
        } else if (this.currLang === 'en-us') {
          codelines = ' lines';
        }
        if (this.makefileLines + cmakeLines + automakeLines !== 0){
          this.scanItemsObj.lines.content +=
            `makefile: ${this.makefileLines + cmakeLines + automakeLines + codelines};`;
        }
        if (this.cLines + this.asmlines !== 0){
          this.scanItemsObj.lines.content +=
            `C/C++: ${this.cLines + this.asmlines + codelines};`;
        }
        if (this.asmFileLines !== 0){
          this.scanItemsObj.lines.content +=
            `ASM: ${this.asmFileLines + codelines};`;
        }
        if (this.fortranLines !== 0){
          this.scanItemsObj.lines.content +=
            `Fortran: ${this.fortranLines + codelines};`;
        }
        if (this.pythonLines !== 0){
          this.scanItemsObj.lines.content +=
            `Python: ${this.pythonLines + codelines};`;
        }
        if (this.golangLines !== 0){
          this.scanItemsObj.lines.content +=
            `Go: ${this.golangLines + codelines};`;
        }
        if (this.javaLines !== 0){
          this.scanItemsObj.lines.content +=
            `Java: ${this.javaLines + codelines};`;
        }
        if (this.scalaLines !== 0){
          this.scanItemsObj.lines.content +=
            `Scala: ${this.scalaLines + codelines};`;
        }
        this.Axios.axios.defaults.headers.isLocked = '';
        this.sourceCodeReportApi.downloadHTML(report.id).then((res: any) => {
          if (this.commonService.handleStatus(res) === 0) {
            const content = JSON.parse(res.data.content);
            if (type === 'html') {
              const iii = location.href.indexOf('#');
              const api = location.href.slice(0, iii);
              const image = `${api + './assets/img/home/no-data.png'}`;
              this.getBase64(image, content, report);
            }
          }
        });
      }).catch((error: any) => {
      });
  }

  // 控制 下发指令 tip显示或隐藏
  showTipInstruct(item: any): void {
    if (!item.showTip) {
      item.showTip = true;
      window.setTimeout(() => {
        item.showTip = false;
      }, 3000);
    }
  }

  // 行合并处理
  linePortingLevel(list: Array<any>): Array<any> {
    let rowSpan = 1;
    list[0] = Object.assign(list[0], { rowSpan, showTd: true });
    list.reduce((pre, cur) => {
      if (pre.url === cur.url && pre.oper === cur.oper && pre.result === cur.result) {
        rowSpan++;
        pre = Object.assign(pre, { rowSpan, showTd: true });
        cur = Object.assign(cur, { rowSpan: 1, showTd: false });
        return pre;
      } else {
        rowSpan = 1;
        cur = Object.assign(cur, { rowSpan, showTd: true });
        return cur;
      }
    });
    return list;
  }

  getBase64(imgUrl: any, content: any, item: any) {
    const that = this;
    const xhr = new XMLHttpRequest();
    xhr.open('get', imgUrl, true);
    // 至关重要
    xhr.responseType = 'blob';
    xhr.onload = () => {
      if (xhr.status === 200) {
        // 得到一个blob对象
        const blob = xhr.response;
        //  至关重要
        const oFileReader = new FileReader();
        oFileReader.onloadend = (e: any) => {
          let base64 = e.currentTarget.result;
          base64 = base64.replace('; charset=UTF-8', '');
          that.imgBase = base64;
          that.download2Html(content, item);
        };
        oFileReader.readAsDataURL(blob);
      }
    };
    xhr.send();
  }

  formatSoSuggestion(level: any, flag: any) {
    let suggestion = '';
    switch (level) {
      case '0':
        const level0En = 'Compatible with the Kunpeng platform.';
        suggestion = flag ? this.i18n.common_term_report_level0_desc : level0En;
        break;
      case '1':
        const level1En = 'Compatible with the Kunpeng platform.';
        suggestion = flag ? this.i18n.common_term_report_level1_desc : level1En;
        break;
      case '2':
        const level2En = 'Not compatible with the Kunpeng platform.';
        suggestion = flag ? this.i18n.common_term_report_level2_desc : level2En;
        break;
      case '3':
        const level3En = 'The compatibility with the Kunpeng platform is unknown.';
        suggestion = flag ? this.i18n.common_term_report_level7_desc : level3En;
        break;
    }
    return suggestion;
  }
  formatSoResult(level: any, type: any, flag: any) {
    let result = '';
    switch (level) {
      case '0':
        const levelResult0En = `Download`;
        result = flag ? this.i18n.common_term_report_level0_result : levelResult0En; // 动态库也需要维护一个format
        break;
      case '1':
        const levelResult1En = 'Download Source Code';
        result = flag ? this.i18n.common_term_report_level1_result : levelResult1En;
        break;
      case '2':
        const levelResult2En =
          'Obtain the source code and compile it to a Kunpeng-compatible version or use an alternate solution.';
        result = flag ? this.i18n.common_term_report_level2_result : levelResult2En;
        break;
      case '3':
        const levelResult3En = 'Verify whether it is compatible with the Kunpeng platform.\
          If not, obtain a Kunpeng-compatible version from the supplier \
          or obtain the source code and compile it to a Kunpeng-compatible version.';
        result = flag ? this.i18n.common_term_report_level7_result : levelResult3En;
        break;
    }
    return result;
  }
  formatSoType(type: any, flag: any) {
    let typeResult = '';
    switch (type) {
      case 'DYNAMIC_LIBRARY':
        const typeResult0En = 'DYNAMIC_LIBRARY';
        typeResult = flag ? this.i18n.common_term_report_type.dynamic_library : typeResult0En;
        break;
      case 'STATIC_LIBRARY':
        const typeResult1En = 'STATIC_LIBRARY';
        typeResult = flag ? this.i18n.common_term_report_type.static_library : typeResult1En;
        break;
      case 'EXEC':
        const typeResult2En = 'EXEC';
        typeResult = flag ? this.i18n.common_term_report_type.exec : typeResult2En;
        break;
      case 'JAR':
        const typeResult3En = 'JAR';
        typeResult = flag ? this.i18n.common_term_report_type.jar : typeResult3En;
        break;
      case 'SOFTWARE':
        const typeResult4En = 'SOFTWARE';
        typeResult = flag ? this.i18n.common_term_report_type.software : typeResult4En;
        break;
    }
    return typeResult;
  }
  goHome(context: any) {
    if (this.goNewReport) {
      this.goReportDetail({id: this.goNewReport});
    }
    context.close();
  }
  showModal(){
    setTimeout(() => {
      this.tiModal.open(this.ieShowModal, {
          id: 'saveModal',
          modalClass: 'del-report-notDown',
          close: (): void => { },
          dismiss: (): void => { }
      });
    }, 500);
  }
  async download(data: any, type: string) {
    await this.getIsOldReport(data.id);
    if (this.isOldReport){
      return;
    }
    this.showTipInstruct(data);
    if (type === 'html') {
      this.getReportDetail(data, type);
    } else {
      this.sourceCodeReportApi.getReport(encodeURIComponent(data.id)).then((resp: any) => {
        if (this.commonService.handleStatus(resp) !== 0) {
          const content = this.currLang === 'zh-cn' ? resp.infochinese : resp.info;
          this.mytip.alertInfo({type: 'error', content, time: 5000});
        } else {
          const url = `/portadv/tasks/${encodeURIComponent(data.id)}/download/?report_type=0`;
          this.reportServe.downloadCSV(data.id, url);
        }
      });
    }
  }
  async getIsOldReport(id: any){
    this.isOldReport = false;
    const  res = await this.Axios.axios.get(`/task/progress/?task_type=0
    &task_id=${ encodeURIComponent(id) }`, { });
    if (res.status !== '0x0d0223' && res.status !== '0x0d0112') { return; }
    this.goNewReport = (res.status === '0x0d0223') ? res.data.id : '';
    (res.status === '0x0d0112') ? (this.showModalWarn = this.i18n.common_term_operate_locked1_noOldReport,
    this.showModalBtn = this.i18n.common_term_operate_Create) : (this.showModalWarn = this.i18nService.I18nReplace(
    this.i18n.common_term_operate_locked1_download, {
      0 : this.commonService.formatCreatedId(res.data.id),
    }),
    this.showModalBtn = this.i18n.common_term_operate_Download);
    if (res.status === '0x0d0223' || res.status === '0x0d0112'){
      this.isOldReport = true;
      this.showModal();
    }
   }
  download2Html(reportData: any, item: any) {
    const filename = `${item.id}.html`;
    const content = this.downloadTemplete(reportData, item.created);
    const blob = new Blob([content]);
    if ('download' in document.createElement('a')) {
      const link = document.createElement('a');
      link.setAttribute('style', 'visibility:hidden');
      link.download = filename;
      link.href = URL.createObjectURL(blob);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      if (window.navigator && window.navigator.msSaveOrOpenBlob) {
        // for IE
        window.navigator.msSaveOrOpenBlob(blob, filename);
      }
    }
  }

  // 前往文件大小超过限制的联机帮助
  goFileHelp() {
    this.commonService.goHelp('file');
  }

  // 前往对应的联机帮助
  goHelp() {
    this.commonService.goHelp('command');
  }

  deleteReport(id: any) {
    this.miniModalServe.open({
      type: 'warn',
      content: {
        title: this.i18n.common_term_history_report_del_title,
        body: this.i18n.common_term_history_report_del_tip2
      },
      close: (): void => {
        this.Axios.axios.delete(`/portadv/tasks/report/${encodeURIComponent(id)}/`, { delete_flag: 0 })
        .then((data: any) => {
          const content = this.currLang === 'zh-cn' ? data.infochinese : data.info;
          if (this.commonService.handleStatus(data) === 0) {
            this.getHistoryReport();
            this.mytip.alertInfo({ type: 'success', content, time: 5000 });
          } else {
            this.mytip.alertInfo({ type: 'error', content, time: 5000 });
          }
        });
      },
      dismiss: () => { }
    });
  }
  deleteAll() {
    this.miniModalServe.open({
      type: 'warn',
      content: {
        title: this.i18n.common_term_history_report_del_title ,
        body: this.i18n.common_term_all_history_tip2
      },
      close: (): void => {
        this.Axios.axios.delete(`/portadv/tasks/all/`, { delete_flag: 1 }).then((data: any) => {
          const content = this.currLang === 'zh-cn' ? data.infochinese : data.info;
          if (this.commonService.handleStatus(data) === 0) {
            this.getHistoryReport();
            this.mytip.alertInfo({ type: 'success', content, time: 5000 });
          } else {
            this.mytip.alertInfo({ type: 'error', content, time: 5000 });
          }
        });
      },
      dismiss: () => { }
    });
  }
  ngAfterContentInit(): void {
    setTimeout(() => {
      const leftContainer = this.elementRef.nativeElement.querySelector('.project-left');
      this.currentWidth = this.leftContainerWidth = leftContainer.offsetHeight;
      this.areaMatchHeight = this.elementRef.nativeElement.querySelector('.areaMatch').offsetHeight;
    }, 0);
  }

  userPwdConfirm = (control: FormControl) => {
    if (!control.value) {
      return { required: true };
    } else if (control.value !== this.userPwd.controls.pwd.value) {
      return { cpwd: { confirm: true, error: true, tiErrorMessage: this.i18n.common_term_no_samepwd } };
    }
    return {};
  }

  getConfigData() {
    this.Axios.axios.get(`/users/${encodeURIComponent(sessionStorage.getItem('loginId'))}/config/`).then((res: any) => {
      // 动态计算工作量预估标准
      const data = res.data;
      this.humanStandard = this.i18nService.I18nReplace(
        this.i18n.common_Estimated_standard_subtitle, {
          0: data.c_line || 0,
          1: data.asm_line || 0
      });
    });
  }

  downloadTemplete(report: any, created: any): string {
    const humanFlag = 'block';
    const firstValueTitle = this.textForm1.firstItem.value.join(',').length > 46
      ? this.textForm1.firstItem.value
      : '';
    let args = '';
    let scanTemp = '';
    const iii = location.href.indexOf('#');
    const api = location.href.slice(0, iii);

    args = `<h1 style="font-size: 20px;color: #282b33;margin-bottom: 24px;font-weight: normal;line-height: 1;">
    ${this.i18n.common_term_setting_infor
      }</h1>
    <div class="setting-left" style="float: left; width: 50%;">
      <div class="setting-left-item" style="display: flex; justify-content: flex-start;margin-bottom: 20px;">
        <span>${this.textForm1.firstItem.label}</span>
        <span
          style="width: 370px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          " title="${firstValueTitle}"
        >
          ${this.textForm1.firstItem.value}
        </span>
      </div>
      <div class="setting-left-item" style="display: flex; justify-content: flex-start;margin-bottom: 20px;">
        <span>${this.textForm1.secondItem.label}</span>
        <span style="max-width: 556px;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;">
        ${this.textForm1.secondItem.value
      }</span>
      </div>
      <div class="setting-left-item" style="display: flex; justify-content: flex-start;margin-bottom: 20px;">
        <span>${this.textForm1.thirdItem.label}</span>
        <span style="max-width: 556px;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;">
        ${this.textForm1.thirdItem.value
      }</span>
      </div>
      <div class="setting-left-item" style="display: flex; justify-content: flex-start;margin-bottom: 20px;">
        <span>${this.textForm1.fourthItem.label}</span>
        <span style="max-width: 556px;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;">
        ${this.textForm1.fourthItem.value  || '--'
      }</span>
      </div>
      <div class="setting-left-item" style="display: flex; justify-content: flex-start;margin-bottom: 20px;">
        <span>${this.textForm1.fifthItem.label}</span>
        <span
          style="max-width: 556px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;"
        >
          ${this.textForm1.fifthItem.value || '--'}
        </span>
      </div>
      <div class="setting-left-item" style="display: flex; justify-content: flex-start;margin-bottom: 20px;">
        <span>${this.textForm1.sixthItem.label}</span>
        <span
          style="max-width: 556px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;"
        >${this.textForm1.sixthItem.value || '--'}
        </span>
      </div>
      <div class="setting-left-item" style="display: flex; justify-content: flex-start;margin-bottom: 20px;">
        <span>${this.textForm1.seventhItem.label}</span>
        <span style="max-width: 556px;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;">${
          this.textForm1.seventhItem.value
        }</span>
      </div>
    </div>
    <div class="setting-right" style="position: relative;float: right;width: 50%;margin-top: 10px;">
        <div class="setting-right-top">
          <div class="setting-right-item">
            <p>${this.i18n.common_term_report_level0_desc}</p>
            <p>${this.soFilesUse}</p>
          </div>
          <div class="setting-right-item">
            <p>${this.i18n.common_term_report_level2_desc}</p>
            <p>${this.soFilesNeed}</p>
          </div>
          <div class="setting-right-item">
            <p>${this.i18n.common_term_name_total}</p>
            <p>${this.soFilesTotal}</p>
          </div>
      </div>
      <div class="setting-right-bottom" style="margin-top: 30px;">
        <div class="setting-right-item">
          <p>${this.i18n.common_term_migrate_result_cFile}</p>
          <p>${this.cfileLine}</p>
        </div>
        <div class="setting-right-item">
          <p>${this.i18n.common_term_migrate_result_lines}</p>
          <p>${this.totalLine}</p>
        </div>
        <div class="setting-right-item" style="display: ${humanFlag};text-align: center;">
          <p>${this.i18n.common_term_report_right_info4}</p>
          <p>${this.humanBudgetNum}<span>${this.humanBudget}</span></p>
        </div>
      </div>
      <p class="tit" style="display: ${humanFlag}
      ;margin-top: 12px;color: #616161;font-size: 14px;text-align: right;">${this.humanStandard}</p>
    </div>`;
    this.scanItems.forEach((scanItem) => {
      let rowSpan = 0;
      let itemFile = '';
      let fileListCon = '';
      let content = '';
      let cFilePadding = '';
      if (scanItem === 'soFile') {
        if (this.binDetailSrcData.length !== 0) {
          this.binDetailSrcData.forEach((bin: any, index: number) => {
            let optionstr = '';
            if (bin.url === '--') {
              optionstr = `<span class="content" >${bin.result}</span>`;
            } else if (bin.url.lastIndexOf('/') === -1) {
              optionstr = `<span title="${this.i18n.common_upload_unable}">--</span>`;
            } else {
              const downloadDesc = bin.downloadDesc
                ? `${bin.downloadDesc + ' ' + bin.url}`
                : ((bin.level === 0)
                    ? `<a onclick="downloadSoFile('
                    ${bin.url}')" style="text-transform: capitalize;">${bin.result}</a>`
                    : (( bin.result !== '下载源码' && bin.result !== 'Download Source Code' )
                        ? `<a onclick="downloadSoFile('${bin.url}')">${bin.result}</a>`
                        : `<a href="${bin.url}" target="_blank">${bin.result}</a>`)
              );
              optionstr = `
                <span class="content">${downloadDesc}
                  <span class="copy-link link${index}" onclick="onCopyLink('${bin.url}', '.copy-inp', ${index})">
                    ${ this.i18n.common_term_report_detail.copyLink }
                  </span>
                </span>
                <input class="copy-inp" />
              `;
            }
            let itemfileMiddle = '';
            if (rowSpan > 1) {
              rowSpan--;
            } else {
              itemfileMiddle = `
                <td class="border-color border-right-color" rowspan${index}" rowspan="${bin.rowSpan}">
                  <span class="content">${bin.pathName}</span>
                </td>
                <td
                  class="border-color border-right-color rowspan${index}"
                  rowspan="${bin.rowSpan}" showtd="${bin.showTd}"
                >
                  <span class="content">${bin.oper}</span>
                </td>
                <td class="border-color rowspan${index}" rowspan="${bin.rowSpan}">
                  ${optionstr}
                </td>
              `;
              rowSpan = bin.rowSpan;
            }
            itemFile += `
              <tr style="line-height:28px;">
                <td style="border-bottom: 1px solid #E6EBF5;">
                  <span class="content">${bin.number}</span>
                </td>
                <td style="border-bottom: 1px solid #E6EBF5;">
                  <span class="content">${bin.name}</span>
                </td>
                <td style="border-bottom: 1px solid #E6EBF5;">
                  <span class="content border-right-color">${bin.type}</span>
                </td>
                ${itemfileMiddle}
              </tr>
            `;
          });
        } else {
          itemFile += `
            <tr class="ti3-table-nodata">
              <td colspan="6" style="text-align: center;width: 100%;padding-top: 140px;box-sizing: border-box;">
                <span style="display:grid;margin: 5px 0;">${this.i18n.common_term_design_nodata}<span>
              </td>
            </tr>
          `;
        }
        // theade th设置 text-align: left 是为了兼容IE
        fileListCon += `
          <div class="ti-table">
            <div class="items-detail-container table table-bordered" style="padding-right:17px;">
              <table style="table-layout:fixed; text-align: left;line-height: 28px">
                <thead>
                  <tr class="table-header">
                    <th style="width: 5%;text-align: left;">${this.i18n.common_term_no_label}</th>
                    <th style="width: 15%;text-align: left;">${this.i18n.common_term_name_label_1}</th>
                    <th style="width: 10%;text-align: left;">${this.i18n.common_term_type_label}</th>
                    <th style="width: 25%;text-align: left;" class="content ellispis">
                      ${this.i18n.common_term_report_type.software}
                    </th>
                    <th style="width: 20%;text-align: left;">${this.i18n.common_term_operate_analysis_result}</th>
                    <th style="width: 25%;text-align: left;">${this.i18n.common_term_operate_sugg_label}</th>
                  </tr>
                </thead>
              </table>
            </div>
              <div class="table-box">
                <table class="table">
                  <thead>
                    <tr>
                      <th style="width: 5%;"></th>
                      <th style="width: 15%;"></th>
                      <th style="width: 10%;"></th>
                      <th style="width: 25%;"></th>
                      <th style="width: 20%;"></th>
                      <th style="width: 25%;"></th>
                    </tr>
                  </thead>
                  <tbody style="font-size: 14px;">${itemFile}</tbody>
                </table>
              </div>
          </div>
        `;
      }
      if (scanItem !== 'soFile' && report.portingresultlist.length > 0) {
        content +=
          `<div class="detail-content" style="display:inline-block;">${this.scanItemsObj[scanItem].content}</div>`;
      }
      if (scanItem === 'cFile' && this.scanItemsObj[scanItem].files) {
        if (this.scanItemsObj[scanItem].files.length !== 0) {
          // cFile文件数据
          let cfileNameArr = [];
          this.scanItemsObj.cFile.files.forEach((file: any, fileIndex: any) => {
            cfileNameArr = (typeof(file) === 'string' ? file : file.filedirectory).split('/');
            this.cfileDetailSrcData.push({
              id: fileIndex + 1,
              filename: cfileNameArr[cfileNameArr.length - 1],
              path: typeof(file) === 'string' ? file : file.filedirectory,
              fileType: typeof(file) === 'string' ? '' : file.filetype,
              linecount: typeof(file) === 'string' ? '' : file.linecount,
            });
          });
          cFilePadding = this.cfileDetailSrcData.length > 7
            ? 'padding-right: 17px;'
            : '';
          this.cfileDetailSrcData.forEach(file => {
            itemFile += `
              <tr style="line-height:23px;">
                <td style="border-bottom: 1px solid #E6EBF5;">
                  <span class="content">${file.id}</span>
                </td>
                <td style="border-bottom: 1px solid #E6EBF5;">
                  <span class="content">${file.filename}</span>
                </td>
                <td style="border-bottom: 1px solid #E6EBF5;">
                  <span class="content">${file.path}</span>
                </td>
                <td style="border-bottom: 1px solid #E6EBF5;">
                  <span class="content">${file.fileType}</span>
                </td>
                <td style="border-bottom: 1px solid #E6EBF5;">
                  <span class="content">${file.linecount}</span>
                </td>
              </tr>
            `;
          });
        } else {
          itemFile += `
          <tr class="ti3-table-nodata">
          <td colspan="6" style="text-align: center;width: 100%;padding-top: 140px;box-sizing: border-box;">
          <span style="display:grid;margin: 5px 0;">${this.i18n.common_term_design_nodata}<span></td>
          </tr>
        `;
        }
        // theade th设置 text-align: left 是为了兼容IE
        fileListCon += `
          <div class="ti-table">
            <div class="items-detail-container" style="${cFilePadding}">`;
        if (scanItem === 'cFile' && this.goTipSwitch) {
          fileListCon +=  `<div class="go-tip-div">
                <span class="go-tip">${ this.goTip }</span>
              </div>`;
        }
        fileListCon += `<table style="table-layout:fixed; text-align: left;line-height: 28px">
                <thead>
                  <tr class="table-header">
                    <th style="width: 5%;text-align: left;">${this.i18n.common_term_no_label}</th>
                    <th style="width: 15%;text-align: left;">${this.i18n.common_term_name_label}</th>
                    <th style="width: 50%;text-align: left;">${this.i18n.common_term_cFile_path_label}</th>
                    <th style="width: 10%;text-align: left;">${this.i18n.common_term_type_label}</th>
                    <th style="width: 20%;text-align: left;">${this.i18n.common_term_option_lincount}</th>
                  </tr>
                </thead>
              </table>
            </div>
            <div class="table-box" style="max-height: 210px;overflow-y: auto;margin-top: -4px;">
              <table style="table-layout:fixed; text-align: left;line-height: 28px">
                <thead>
                  <tr>
                    <th style="width: 5%;"></th>
                    <th style="width: 15%;"></th>
                    <th style="width: 50%;"></th>
                    <th style="width: 10%;"></th>
                    <th style="width: 20%;"></th>
                  </tr>
                </thead>
                <tbody style="font-size: 14px;">${itemFile}</tbody>
              </table>
            </div>
          </div>
        `;
      }

      if (scanItem === 'lines' && report.portingresultlist.length > 0) {
        let itemLines = '';
        if (report.portingresultlist.length !== 0) {
          report.portingresultlist.forEach((item: any) => {
            item.portingItems.forEach((line: any) => {
              line.strategy = line.strategy.replace(/\"/g, '\'');
              itemLines += `
                <tr style="line-height:23px;">
                  <td style="border-bottom: 1px solid #E6EBF5;">
                    <span class="content">${item.content}</span>
                  </td>
                  <td style="border-bottom: 1px solid #E6EBF5;">
                    <span class="content">${'(' + line.locbegin + ',' + line.locend + ')'}</span>
                  </td>
                  <td style="border-bottom: 1px solid #E6EBF5;">
                    <span class="content">${line.keyword}</span>
                  </td>
                  <td style="border-bottom: 1px solid #E6EBF5;">
                    <span class="content">${line.strategy}</span>
                  </td>
                </tr>
              `;
            });
          });
        } else {
          itemLines += `
            <tr class="ti3-table-nodata">
              <td colspan="5"></td>
            </tr>
          `;
        }
        // theade th设置 text-align: left 是为了兼容IE
        fileListCon += `
          <div class="ti-table">
            <div class="items-detail-container" style="padding-right:17px;">
              <table style="text-align: left;line-height: 28px;table-layout:fixed">
                <thead>
                  <tr class="table-header">
                    <th style="text-align: left;width: 30%;">${this.i18n.common_term_download_html_filename}</th>
                    <th style="text-align: left;width: 10%;">${this.i18n.common_term_download_html_lineno}</th>
                    <th style="text-align: left;width: 15%;">${this.i18n.common_term_download_html_keyword}</th>
                    <th style="text-align: left;width: 45%;">${this.i18n.common_term_download_html_suggestion}</th>
                  </tr>
                </thead>
              </table>
            </div>
            <div class="table-box" style="max-height: 300px;overflow-y: auto;margin-top: -4px;">
              <table style="text-align: left;line-height: 28px;table-layout:fixed">
                <thead>
                  <tr>
                    <th style="width: 30%;"></th>
                    <th style="width: 10%;"></th>
                    <th style="width: 15%;"></th>
                    <th style="width: 45%;"></th>
                  </tr>
                </thead>
              <tbody style="font-size: 14px;">${itemLines}</tbody>
            </table>
            </div>
          </div>
        `;
      }
      scanTemp += `
      <div class="table-container" style="line-height: 56px;margin-top:30px;">
        <div class="detail-label" style="display:inline-block;width: 350px;font-size: 20px;color: #282b33;">
          <span>${this.scanItemsObj[scanItem].label}</span>
        </div>
        ${content}
      </div>
        ${fileListCon}
      `;
    });

    const template = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="X-UA-Compatible" content="ie=edge">
          <title>Document</title>
          <style>
            .setting-left span,
            .setting-left div {
              height: 18px;
              font-size: 14px;
              line-height: 18px;
            }
            .setting-left span:first-child{
              width: 240px;
              color: #6C7280;
            }
            .setting-left span:last-child{
              color: #222;
            }
            .setting-right-top,
            .setting-right-bottom {
              display: flex;
              justify-content: flex-end;
              height: 80px;
            }
            .setting-right-item{
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              align-items: center;
              margin-left: 14px;
              min-width: 176px;
              position: relative;
            }
            .setting-right-item:nth-child(2) {
              margin-right: 20px;
              padding-right: 30px;
              border-right: 1px solid #E1E6EE;
            }
            p {
              margin: 0;
            }
            p:first-child{
              font-size: 16px;
              height: 24px;
              padding: 0 20px;
              line-height: 24px;
              color: #979797;
              text-align: center;
            }
            p:nth-child(2){
              font-size: 48px;
              color: #222;
            }
            p:nth-child(2) span {
              font-size: 14px;
              color: #666;
              font-weight: normal;
            }
            a {
              color: #0067ff;
            }
            a:hover {
              color: #267DFF;
              cursor: pointer;
            }
            .ti3-table-nodata > td {
              height: 160px !important;
              background: url(${this.imgBase}) 50% no-repeat !important;
              border-bottom: 1px solid #e1e6e6;
            }
            table th {
              font-size:12px;
            }
            table td {
              font-size:12px;
            }
            .detail-content {
              font-size:14px;
            }
            .table{
              table-layout: fixed;
            }
            .table-box {
              overflow-y: auto;
              max-height: 210px;
              margin-top: -4px;
            }
            .go-tip-div {
              height: 32px;
              background-color: #f0f6ff;
              border-radius: 2px;
              border: solid 1px #0067ff;
              display:flex;
              align-items: center; //交叉轴居中
            }
            .go-tip {
              height: 18px;
              font-family: FZLTHJW--GB1-0;
              font-size: 12px;
              font-weight: normal;
              font-stretch: normal;
              line-height: 18px;
              letter-spacing: 0px;
              color: #222222;
              margin-left: 10px;
            }
            table {
              width: 100%;
            }
            .table-header {
              padding: 0 10px;
              border-left: none;
              background:#f5f9ff;
              color:#333;
              font-size: 14px;
              font-weight: 400;
            }
            .table-header > th {
              box-sizing: border-box;
              padding-left: 10px;
            }
            td span {
              box-sizing: border-box;
              display: inline-block;
              overflow: hidden;
              width: 100%;
              padding-left: 10px;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
            .ellispis {
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
            .border-color {
              border-bottom: 1px solid #E6EBF5;
            }
            .border-right-color {
              border-right: 1px solid #E6EBF5;
            }
            .copy-link {
              position: relative;
              display: inline;
              margin-left: 16px;
              color: #0067FF;
              cursor: pointer;
            }
            .copy-link:hover,
            a:hover {
              color: #267DFF;
            }
            .copy-link::before {
              display: inline-block;
              position: absolute;
              top: 50%;
              left: -8px;
              content: '';
              width: 1px;
              height: 12px;
              margin-top: -6px;
              background-color: #E1E6EE;
            }
            .copy-inp {
              position: absolute;
              top: 0;
              left: 0;
              z-index: -666;
              opacity: 0;
            }
          </style>
      </head>
      <body style="padding:0 80px;">
        <div style="min-width: 1300px;width: 100%; height: 100%;">
        <h1 style="text-align: center;font-weight: normal;font-size: 24px;
        border-bottom: solid 1px #222;padding-bottom:20px">${created}</h1>
        <div >
        ${args}
        </div>
        <div style ="float:left;width:100%">
          ${scanTemp}
        </div>
        </div>
        <script>
          function downloadSoFile(url) {
            const a = document.createElement('a');
            a.setAttribute('href', url);
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          }
          // 设置 title 属性
          function setTitle() {
            var tdList = document.querySelectorAll('.content');
            tdList = Array.prototype.slice.call(tdList);
            for (let i = 0; i < tdList.length; i++) {
              const td = tdList[i];
              td.removeAttribute('title');
              if (td.clientWidth < td.scrollWidth) {
                td.setAttribute('title', td.innerText);
              }
            }
          }
          window.onload = function(){
            setTitle();
          }
          window.onresize = function() {
            setTitle();
          }
        </script>
      </body>
    </html>
    `;
    return template;
  }

  showUpload() {
    this.hoverFlag = true;
  }
  hideUpload() {
    this.hoverFlag = false;
  }

  zipUpload() {
    this.noFileSelected = false;
    this.elementRef.nativeElement.querySelector('#zipload').value = '';
    this.elementRef.nativeElement.querySelector('#zipload').click();
  }
  clearUploadTip() {
    this.noFileSelected = false;
    this.uploadResultTip.content = '';
  }

  // 上传源代码-压缩包
  uploadFile(choice: any) {
    this.exitMask.Close();
    this.isUploadZip = true;
    this.isShow = false;
    this.isSlow = false;
    let file: any;
    if (choice === 'normal') {
      file = this.elementRef.nativeElement.querySelector('#zipload').files[0];
      this.uploadZipFile = file;
    } else {
      file = this.uploadZipFile;
    }
    this.info.filename = file.name;
    const scanTaskPath = sessionStorage.getItem('sourceScanTaskPath');
    if (this.commonService.scanSameTask(file.name, scanTaskPath, this.userPath)) {
      const content = this.i18n.commonUploadSameFile;
      this.mytip.alertInfo({ type: 'error', content, time: 5000 });
      return;
    }
    const size = file.size / 1024 / 1024;
    // 文件大于 1024M | 包含中文 以及 空格 等其它特殊字符
    if (size > fileSize || this.regService.filenameReg(file.name)) {
      this.isShow = false;
      this.uploadResultTip.state = 'error';
      this.uploadResultTip.content = size > fileSize
        ? this.i18n.common_term_upload_max_size_tip
        : this.i18n.upload_file_tip.reg_fail;
      this.fileExceed = size > fileSize ? true : false;
      return;
    }
    this.info.filesize = size.toFixed(1);
    let params = {
      file_size: file.size,
      file_name: file.name,
      need_unzip: 'true',
      scan_type: '0',
      choice
    };
    const formData = new FormData();
    if (choice === 'save_as') {
      this.info.filename = `${this.exitFileName}${this.suffix}`;
      formData.append('file', file, this.info.filename);
      params = {
        file_size: file.size,
        file_name: this.info.filename,
        need_unzip: 'true',
        scan_type: '0',
        choice
      };
    } else if (choice === 'override') {
      this.info.filename = `${this.oldName}${this.suffix}`;
      formData.append('file', file, this.info.filename);
      params = {
        file_size: file.size,
        file_name: this.info.filename,
        need_unzip: 'true',
        scan_type: '0',
        choice
      };
    } else {
      formData.append('file', file);
    }
    this.uploadProgress = '0%';
    sessionStorage.setItem('sourceCodeFileInfo', JSON.stringify(this.info));
    this.Axios.axios.post('/portadv/tasks/check_upload/', params).then((data: any) => {
      this.displayAreaMatch = false;
      if (this.commonService.handleStatus(data) === 0) {
        const times = setInterval(() => {
          this.upTimes++;
          if (this.upTimes >= 100) {
            this.isSlow = true;
            this.upTimes = 0;
            clearInterval(times);
          }
        }, 1000);
        this.searchUploadZip(choice, formData, file, times);
      } else if (this.commonService.handleStatus(data) === 1) {
        // check_upload异常情况，包括文件存在
        if (data.infochinese === '文件已存在，上传失败') {
          this.exitFileName = data.data.new_name;
          this.oldName = data.data.old_name;
          this.suffix = data.data.suffix;
          this.exitFileNameReplace = this.i18nService.I18nReplace(
            this.i18n.analysis_center.exit.content,
            { 1: data.data.old_name }
          );
          this.exitMask.Open();
          return;
        } else {
          this.uploadResultTip.state = 'error';
          this.uploadResultTip.content = this.currLang === LanguageType.ZH_CN
            ? data.infochinese
            : data.info;
        }
        this.inputItems.path.value = '';
        this.isShow = false;
        $('#zipload').val('');
      } else {
        this.uploadResultTip.state = 'error';
        this.uploadResultTip.content = this.currLang === LanguageType.ZH_CN
          ? data.infochinese
          : data.info;
        $('#zipload').val('');
      }
    });
  }

  // 查看压缩包上传状态
  public searchUploadZip(choice: string, formData: FormData, file: { name: string }, times?: any) {
    const CancelToken = axios.CancelToken;
    const that = this;
    this.Axios.axios.post('/portadv/tasks/upload/', formData, {
      headers: {
        'need-unzip': true,
        'scan-type': '0',
        choice
      },
      cancelToken: new CancelToken(function executor(c) {
        that.cancel1 = c;
      }),
      ...this.alreadyconfig
    }).then((resp: any) => {
      this.suffix = '';
      this.exitFileName = '';
      this.exitMask.Close();
      if (times) {
        clearInterval(times);
      }
      if (this.commonService.handleStatus(resp) === 0 || resp === 'toolarge') {
        clearTimeout(this.maximumTime);
        const lastIndex = this.inputItems.path.value.lastIndexOf(',');
        if (!this.multipleInput) {
          this.inputItems.path.value = resp.data;
        } else {
          const arr = this.inputItems.path.value.split(',');
          if (!arr.includes(resp.data)) {
            if (lastIndex) {
              this.inputItems.path.value = this.inputItems.path.value.slice(0, lastIndex + 1)
                + resp.data
                + ',';
            } else {
              this.inputItems.path.value = resp.data + ',';
            }
          }
        }

        let num = file.name.lastIndexOf('.');
        let filename = file.name.substring(0, num);
        if (filename.lastIndexOf('.tar') > 0) {
          num = filename.lastIndexOf('.');
          filename = filename.substring(0, num);
        }
        this.msgService.sendMessage({
          type: 'uploadingContainer',
          name: 'SourceCode',
          state: 'success',
          data: 'end',
          isShow: false,
          isCompress: false,
          content: this.i18n.common_term_upload_success_tip,
          path: this.inputItems.path.value
        });
      } else if (this.commonService.handleStatus(resp) === 1) {
        clearTimeout(this.maximumTime);
        this.inputItems.path.value = '';
        this.msgService.sendMessage({
          type: 'uploadingContainer',
          name: 'SourceCode',
          state: 'error',
          data: 'end',
          isShow: false,
          isCompress: false,
          content: this.currLang === LanguageType.ZH_CN ? resp.infochinese : resp.info,
          path: this.inputItems.path.value
        });
      } else if (resp.status === Status.maximumTask) { // 等待上传中
        let index: number = JSON.parse(sessionStorage.getItem('sourceMaximumTask')) || 0;
        let isCompress: boolean;
        if (index > 20) {
          const content = this.currLang === 'zh-cn' ? resp.infochinese : resp.info;
          this.mytip.alertInfo({ type: 'error', content, time: 5000 });
          isCompress = false;
          sessionStorage.setItem('sourceMaximumTask', '0');
          clearTimeout(this.maximumTime);
        } else {
          isCompress = true;
          sessionStorage.setItem('sourceMaximumTask', JSON.stringify(++index));
          this.maximumTime = setTimeout(() => {
            this.searchUploadZip(choice, formData, file);
          }, 30000);
          sessionStorage.setItem('sourceTime', JSON.stringify(this.maximumTime));
        }
        this.msgService.sendMessage({
          type: 'uploadingContainer',
          name: 'SourceCode',
          data: 'waiting',
          isShow: false,
          isCompress
        });
      } else if (resp.status === '0x010611') {
        clearTimeout(this.maximumTime);
        this.msgService.sendMessage({
          type: 'uploadingContainer',
          name: 'SourceCode',
          state: 'error',
          data: 'end',
          isShow: false,
          isCompress: false,
          content: this.currLang === LanguageType.ZH_CN ? resp.infochinese : resp.info,
        });
      }
      if (resp === 'timeout') {
        this.msgService.sendMessage({
          type: 'uploadingContainer',
          name: 'SourceCode',
          state: 'error',
          data: 'end',
          isShow: false,
          isCompress: false,
          content: this.i18n.common_term_upload_time_out,
        });
      }
      $('#zipload').val('');
    }).catch((e: any) => {
      this.msgService.sendMessage({
        type: 'uploadingContainer',
        name: 'SourceCode',
        state: '',
        data: 'end',
        isShow: false,
        isCompress: false,
        content: ''
      });
      $('#zipload').val('');
    });
  }

  // 上传源代码-文件夹
  toZip(choice: any, event?: any) {
    this.exitMask.Close();
    this.isUploadZip = false;
    this.uploadResultTip.content = '';
    this.isSlow = false;
    const zip = new JSZip();
    let fileList;
    let inputDom;
    let filepath: any;
    if (choice === 'normal') {
      // file.files 是一个fileList对象 fileList里面是file对象
      inputDom = this.elementRef.nativeElement.querySelector('#files');
      fileList = inputDom.files;
      this.uploadFolderFileList = fileList;
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
    for (const file of fileList) {
      const element = file;
      size += element.size;
      const idx = element.webkitRelativePath.lastIndexOf(element.name);
      filepath = element.webkitRelativePath.slice(0, idx);
      zip.folder(filepath).file(element.name, element);
    }
    const sizeCount = size;
    size = size / 1024 / 1024;
    // 文件大于 1024M | 包含中文 以及 空格 等其它特殊字符
    if (size > fileSize || this.regService.filenameReg(this.outfilepath)) {
      this.isShow = false;
      this.uploadResultTip.state = 'error';
      this.uploadResultTip.content = size > fileSize
        ? this.i18n.common_term_upload_max_size_tip
        : this.i18n.upload_file_tip.reg_fail;
      this.fileExceed = size > fileSize ? true : false;
      event.target.value = '';
      return;
    }
    this.info.filesize = size.toFixed(1);
    let params;
    if (choice === 'save_as') {
      params = {
        file_size: sizeCount,
        file_name: this.exitFileName + '.zip',
        need_unzip: 'true',
        scan_type: '0',
        choice,
      };
      this.info.filename = this.exitFileName + '.zip';
    } else if (choice === 'override') {
      params = {
        file_size: sizeCount,
        file_name: this.oldName + '.zip',
        need_unzip: 'true',
        scan_type: '0',
        choice,
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
    this.isUploadFile = true;
    const scanTaskPath = sessionStorage.getItem('sourceScanTaskPath');
    if (this.commonService.scanSameTask(params.file_name, scanTaskPath, this.userPath)) {
      const content = this.i18n.commonUploadSameFile;
      this.mytip.alertInfo({ type: 'error', content, time: 5000 });
      return;
    }
    sessionStorage.setItem('sourceCodeFileInfo', JSON.stringify(this.info));
    this.Axios.axios.post('/portadv/tasks/check_upload/', params).then((data: any) => {
      this.displayAreaMatch = false;
      if (this.commonService.handleStatus(data) === 0) {
        this.Axios.axios.defaults.headers['scan-type'] = '0';
        this.Axios.axios.defaults.headers.choice = choice;
        this.isShow = true;
        this.msgService.sendMessage({ type: 'uploadingContainer', data: 'start' });
        const times = setInterval(() => {
          this.upTimes++;
          if (this.upTimes >= 100) {
            this.isSlow = true;
            this.upTimes = 0;
            clearInterval(times);
          }
        }, 1000);
        zip.generateInternalStream({ type: 'blob' })
          .accumulate((metadata: any) => {
            if (!sessionStorage.getItem('token') || !this.isUploadFile) {
              metadata.pause();
              zip.remove(filepath);
            }
            const progress = (metadata.percent / 2).toFixed(2);
            if (Number(progress) >= 50) {
              return;
            }
            this.isHalf = true;
            this.msgService.sendMessage({
              type: 'uploadingContainer',
              name: 'SourceCode',
              data: 'start',
              isShow: true,
              uploadProgress: progress + '%'
            });
          }).then((content: any) => {
            const formData = new FormData();
            if (choice === 'save_as') {
              formData.append('file', content, this.exitFileName + '.zip');
            } else if (choice === 'override') {
              formData.append('file', content, this.oldName + '.zip');
            } else {
              formData.append('file', content, this.outfilepath + '.zip');
            }
            this.searchUploadFile(choice, formData, times);
          }).catch((e: any) => {
            clearInterval(times);
            this.msgService.sendMessage({
              type: 'uploadingContainer',
              name: 'SourceCode',
              state: '',
              data: 'end',
              isShow: false,
              isCompress: false,
              content: ''
            });
            $('#files').val('');
          });
      } else if (this.commonService.handleStatus(data) === 1) {
        // check_upload异常情况，包括文件存在
        if (data.infochinese === '文件已存在，上传失败') {
          this.exitFileName = data.data.new_name;
          this.oldName = data.data.old_name;
          this.confirmName.zip.value = data.data.new_name;
          this.exitFileNameReplace = this.i18nService.I18nReplace(
            this.i18n.analysis_center.exit.content,
            { 1: data.data.old_name }
          );
          this.exitMask.Open();
        } else {
          this.uploadResultTip.state = 'error';
          this.uploadResultTip.content = this.currLang === LanguageType.ZH_CN
            ? data.infochinese
            : data.info;
        }
        this.isShow = false;
      } else {
        this.uploadResultTip.state = 'error';
        this.uploadResultTip.content = this.currLang === LanguageType.ZH_CN
          ? data.infochinese
          : data.info;
        $('#files').val('');
      }
    });
  }

  // 查看文件上传状态
  public searchUploadFile(choice: string, formData: FormData, times?: any) {
    const CancelToken = axios.CancelToken;
    const that = this;
    this.Axios.axios.post('/portadv/tasks/upload/', formData, {
      headers: {
        'need-unzip': true,
        'scan-type': '0',
        choice
      },
      cancelToken: new CancelToken(function executor(c) {
        that.cancel = c;
      }),
      ...this.config
    }).then((resp: any) => {
      if (this.commonService.handleStatus(resp) === 0) {
        clearTimeout(this.maximumTime);
        const lastIndex = this.inputItems.path.value.lastIndexOf(',');
        if (!this.multipleInput) {
          this.inputItems.path.value = resp.data;
        } else {
          const arr = this.inputItems.path.value.split(',');
          if (!arr.includes(resp.data)) {
            if (lastIndex) {
              this.inputItems.path.value = this.inputItems.path.value.slice(0, lastIndex + 1)
                + resp.data
                + ',';
            } else {
              this.inputItems.path.value = resp.data + ',';
            }
          }
        }

        clearInterval(times);
        this.msgService.sendMessage({
          type: 'uploadingContainer',
          name: 'SourceCode',
          state: 'success',
          data: 'end',
          isShow: false,
          isCompress: false,
          content: this.i18n.common_term_upload_success,
          path: this.inputItems.path.value
        });
      } else if (this.commonService.handleStatus(resp) === 1) {
        clearTimeout(this.maximumTime);
        this.inputItems.path.value = '';
        clearInterval(times);
        this.msgService.sendMessage({
          type: 'uploadingContainer',
          name: 'SourceCode',
          state: 'error',
          data: 'end',
          isShow: false,
          isCompress: false,
          content: this.currLang === LanguageType.ZH_CN ? resp.infochinese : resp.info,
          path: this.inputItems.path.value
        });
      } else if (resp.status === Status.maximumTask) { // 等待上传中
        let index: number = JSON.parse(sessionStorage.getItem('sourceMaximumTask')) || 0;
        let isCompress: boolean;
        if (index > 20) {
          const content = this.currLang === 'zh-cn' ? resp.infochinese : resp.info;
          this.mytip.alertInfo({ type: 'error', content, time: 5000 });
          isCompress = false;
          clearTimeout(this.maximumTime);
          sessionStorage.setItem('sourceMaximumTask', '0');
        } else {
          isCompress = true;
          sessionStorage.setItem('sourceMaximumTask', JSON.stringify(++index));
          this.maximumTime = setTimeout(() => {
            this.searchUploadFile(choice, formData);
          }, 30000);
          sessionStorage.setItem('sourceTime', JSON.stringify(this.maximumTime));
        }
        this.msgService.sendMessage({
          type: 'uploadingContainer',
          name: 'SourceCode',
          data: 'waiting',
          isShow: false,
          isCompress
        });
      } else if (resp.status === '0x010611') {
        clearInterval(times);
        this.msgService.sendMessage({
          type: 'uploadingContainer',
          name: 'SourceCode',
          state: 'error',
          data: 'end',
          isShow: false,
          isCompress: false,
          content: this.currLang === LanguageType.ZH_CN ? resp.infochinese : resp.info
        });
      }
      $('#files').val('');
    }).catch((err: any) => {
      clearInterval(times);
      this.msgService.sendMessage({
        type: 'uploadingContainer',
        name: 'SourceCode',
        state: '',
        data: 'end',
        isShow: false,
        isCompress: false,
        content: ''
      });
      $('#files').val('');
    });
  }

  // 取消 压缩包上传 和 文件上传请求
  closeRequest() {
    this.isUploadFile = false;
    this.isCompress = false;
    sessionStorage.setItem('sourceMaximumTask', '0');
    const time = this.maximumTime || JSON.parse(sessionStorage.getItem('sourceTime'));
    clearTimeout(time);
    if (this.cancel) {
      this.cancel();
    }
    if (this.cancel1) {
      this.cancel1();
    }
  }

  keyupAreaMatch() {
    if (sessionStorage.getItem('isFirst') !== '1' && sessionStorage.getItem('isExpired') !== '1') {
      this.inputAreaMatch();
    }
  }
  inputAreaMatch() {
    if (sessionStorage.getItem('isFirst') !== '1' && sessionStorage.getItem('isExpired') !== '1') {
      this.pathlist = [];
      let path = this.inputItems.path.value;
      if (path) {
        const lastIndex = this.inputItems.path.value.lastIndexOf(',');
        if (lastIndex) {
          path = this.inputItems.path.value.slice(lastIndex + 1, this.inputItems.path.value.length);
        }
      }
      const params = { path: 'sourcecode/' + path };
      this.Axios.axios.post('/pathmatch/', params).then((data: any) => {
        const arrBefore = this.inputItems.path.value.split(',');
        if (data) {
          let arrAfter = data.pathlist;
          let idx = this.inputItems.path.value.lastIndexOf(',');
          if (idx >= 0) { idx = this.inputItems.path.value.length - idx; }
          if (idx === 1) {
            arrAfter = this.arr_diff(arrBefore, arrAfter, true);
            this.pathlist = arrAfter;
            return;
          }
          if (arrAfter.length > 1) {
            arrAfter = this.arr_diff(arrBefore, arrAfter, false);
          }
          this.pathlist = arrAfter;
        }
      });
    }
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

  areaMatchDis() {
    this.noFileSelected = false;
    this.cancelBlur = true;
    if (this.cancelBlur) {
      this.displayAreaMatch = true;
      this.uploadResultTip.content = '';
      this.inputAreaMatch();
      this.areaMatchHeight = this.elementRef.nativeElement.querySelector('.areaMatch').offsetHeight;
    }
  }

  blurAreaMatch() {
    if (this.cancelBlur) {
      this.displayAreaMatch = false;
      return;
    } else {
      this.displayAreaMatch = true;
    }
  }
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
    this.pathlist = [];
    // 解决 IE 下点击后无法自动失焦情况
    this.elementRef.nativeElement.querySelector('.areaMatch').blur();
  }
  isDeleteAreaMatch(value: any) {
    this.deleteValue = value;
    this.fileNameDelete = this.i18nService.I18nReplace(
      this.i18n.analysis_center.exit.delete_file_content,
      { 1: value }
    );
    this.miniModalServe.open({
      type: 'warn',
      content: {
        title: this.i18n.common_term_history_report_del_title,
        body: this.fileNameDelete
      },
      close: (): void => {
        this.deleteAreaMatch(this.deleteValue);
      },
      dismiss: () => { }
    });
  }
  deleteAreaMatch(value: any) {
    const params = {
      file_name: value,
      path: 'sourcecode',
    };
    this.Axios.axios.delete(`/portadv/tasks/delete_file/`, { data: params }).then((data: any) => {
      if (this.commonService.handleStatus(data) === 0) {
        let vals = this.inputItems.path.value.split(',');
        if (vals.length === 1) {
          this.inputItems.path.value = vals[0] === this.deleteValue ? '' : vals[0];
        } else {
          vals = vals.filter((val: any): any => {
            if (val) {
              return this.deleteValue !== val;
            }
          });
          this.inputItems.path.value = vals.join(',') + ',';
        }
      }
      sessionStorage.removeItem('sourceCodePathName');
      const type = this.commonService.handleStatus(data) === 0 ? 'success' : 'warn';
      const content = this.currLang === LanguageType.ZH_CN ? data.infochinese : data.info;
      this.mytip.alertInfo({ type, content, time: 5000 });
      this.inputAreaMatch();
    });
  }
  closeMaskExit() {
    this.exitMask.Close();
    $('#zipload').val('');
    $('#files').val('');
  }
  closeMaskSaveAs() {
    this.saveasMask.Close();
    $('#zipload').val('');
    $('#files').val('');
  }
  uploadAgain(choice: any) {
    if (choice === 'override') {
      this.isUploadZip ? this.uploadFile(choice) : this.toZip(choice);
    } else {
      this.exitMask.Close();
      this.saveasMask.Open();
    }
  }
  saveAs(choice: any) {
    if (!this.confirmUploadZip.valid) {
      $('.saveAs-input')[0].focus();
      return;
    }
    this.saveasMask.Close();
    this.isUploadZip ? this.uploadFile(choice) : this.toZip(choice);
  }
}

