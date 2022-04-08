import {
  Component, OnInit, ElementRef, ViewChild, AfterContentInit,
  OnDestroy, HostListener, ComponentRef, Renderer2, ViewChildren, QueryList
} from '@angular/core';
import {
  TiTableColumns, TiTableRowData, TiModalService,
  TiTableSrcData, TiValidationConfig, TiOverflowService, TiTipService
} from '@cloud/tiny3';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

import axios from 'axios';
import {
  RegService, AxiosService, I18nService,
  MytipService, MessageService, UploadService,
  CommonService, ReportService, CustomValidators
} from '../../../service';
import { SoftwarePackageReportApi } from '../../../api';
import { HyMiniModalService } from 'hyper';
import { getExplore } from '../../../utils';
import { ACCEPT_TYPE } from '../../../global/url';
import { fileSize } from '../../../global/globalData';
import { Status } from '../../../modules';
import { TiOverflowRef } from '@cloud/tiny3/services/overflow/TiOverflowService';

@Component({
  selector: 'app-analysis-center',
  templateUrl: './analysis-center.component.html',
  styleUrls: ['./analysis-center.component.scss']
})
export class AnalysisCenterComponent implements OnInit, AfterContentInit, OnDestroy {
  @ViewChild('webpackAlert', { static: false }) webpackAlert: any;
  @ViewChild('maskConfig', { static: false }) maskConfig: any;
  @ViewChild('maskDownload', { static: false }) maskDownload: any;
  @ViewChild('moremask', { static: false }) moreMask: any;
  @ViewChild('exitmask', { static: false }) exitMask: any;
  @ViewChild('aarch64Modal', { static: false }) aarch64Modal: any;
  @ViewChild('mutipleFile', { static: false }) mutipleFile: any;
  @ViewChildren('tip') tipElList: QueryList<ElementRef>;

  public i18n: any;
  public fileExceed = false; // 文件超过 1G
  public displayed: Array<TiTableRowData> = []; // 表示表格实际呈现的数据（开发者默认设置为[]即可）
  public srcData: TiTableSrcData;
  private data: Array<TiTableRowData> = [];
  public columns: Array<TiTableColumns> = [
    {
      title: '软件名',
      width: '40%'
    },
    {
      title: '版本',
      width: '10%'
    },
    {
      title: 'OS版本',
      width: '15%'
    },
    {
      title: '华为镜像源',
      width: '15%'
    },
    {
      title: '移植指导书',
      width: '20%'
    }
  ];
  public stepsMirror: Array<any> = [];
  public stepsMirrorSource: Array<any> = [];
  public userPath = '';
  public userPathData = '';
  public backworkspace = '';
  public isDisabled = false;
  public isCheck = true;
  public isX86 = false;
  public isWebpacking = false;
  public situation = 0;
  public filename = '';
  public filenameData = '';
  public filenameTip = '';
  public filenameTipData = '';
  public userchange: any;
  public inputPrompt1: string;
  public taskId = '';
  public language = '';
  public timer: any = null;
  public info = '';
  public count = 0;
  public barWidth = 0;
  public totalBar = 460; // 进度条总宽
  public progess = 0; // 目前数据大小
  public totalProgress = 100; // 总的数据大小
  public progessValue: string; // 显示的进度值
  public packResult = ''; // 构建成功之后返回的result结果
  public uploadProgress: any;
  isShow = false;
  tipInstance: TiOverflowRef;

  constructor(
    public i18nService: I18nService,
    public Axios: AxiosService,
    private elementRef: ElementRef,
    private router: Router,
    private tiModal: TiModalService,
    private miniModalServe: HyMiniModalService,
    public mytip: MytipService,
    private msgService: MessageService,
    private uploadService: UploadService,
    private commonService: CommonService,
    private reportService: ReportService,
    private regService: RegService,
    private softwarePackageReportApi: SoftwarePackageReportApi,
    private render: Renderer2,
    private tioverflow: TiOverflowService,
    private tipService: TiTipService
  ) {
    this.i18n = this.i18nService.I18n();
  }

  public maximumTime: any; // 上传等待定时器
  public waiting: boolean; // 任务是否处于等待中

  public accrptType: string; // 压缩包上传支持类型

  public inputItems = {
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
      options: Array,
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
      options: Array,
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
      options: Array,
      required: false
    },
    kernelVersion: {
      label: '',
      selected: {
        label: '',
        id: ''
      },
      options: Array,
      required: false
    }
  };
  public progressData: any = {};
  public isAlermOpt = false; // 告警时禁止操作
  public progressContext: any = {};
  public sampleBtnTip = '';
  public outfilepath: any;
  public isCompress = false;
  public successTit: any;
  public uploadStartFlag = false;
  public noFileSelected = false;

  public cancel: any; // 取消 axios 请求
  alreadyconfig = {
    onUploadProgress: (progressEvent: any) => {
      const complete = Math.floor((progressEvent.loaded / progressEvent.total) * 100);
      if (!sessionStorage.getItem('token')) {
        this.cancel();
        return;
      }
      this.msgService.sendMessage({
        type: 'uploadingContainer',
        name: 'SoftwarePack',
        data: 'start',
        isShow: true,
        isCompress: false,
        uploadProgress: complete + '%'
      });
      if (complete === 100) {
        this.msgService.sendMessage({
          type: 'uploadingContainer',
          name: 'SoftwarePack',
          data: 'start',
          isShow: false,
          isCompress: false,
          uploadProgress: complete + '%'
        });
      }
    }
  };

  public packageBtnDisabled = false;
  public packageBtnDisabledTip = '';
  private creatingPackageProgressSub: Subscription;
  private creatingResultMsgSub: Subscription;
  public areaMatchHeight: number;
  public areaMatchWidth: number;
  public areaMatchHeightData: number;
  public areaMatchWidthData: number;
  public pathlist: any = [];
  public pathlistData: any = [];
  public displayAreaMatch = false;
  public displayAreaMatchData = false;
  public multipleInput = false;
  public multipleInputData = true;

  public fileInfo = {
    filename: '',
    filesize: ''
  };
  public upTimes = 0;
  public isSlow = false;
  public isUploadPack = false;
  public isDeletePack = false;
  public uploadPackFile: any;
  public uploadDataFile: any;
  public uploadFolderFileList: any;
  public exitFileNameReplace = '';
  public exitFileNameData = '';
  public exitFileNameReplaceData = '';
  public fileNameDelete = '';
  public suffix = '';
  public deleteValue = '';
  public deleteValueData = '';
  public isAdmin: any;
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
    type: 'blur',
    errorMessage: {
      regExp: '',
      required: ''
    }
  };
  public confirmUploadZip: any;
  public maxFilenameLength: any;
  public maxFilenameLengthForData: any;
  public uploadResultTip = {
    stateBuild: '',
    contentBuild: '',
    stateDep: '',
    contentDep: ''
  };

  private reportConfigChangeSub: Subscription;
  private uploadingContainerSub: Subscription;
  public HisoricalReportList: any = [];
  public rebuildStepList: any = [];
  public curStep = 1;
  public dangerFlag = false;
  public safeFlag = false;
  public toomany = '';
  public cancelBlur = true;
  private evtMap = new Map<Element, TiOverflowRef>();

  public currLang: string; // 当前国际化语言

  public copySuccess: string;

  @HostListener('window:mousedown', ['$event'])
  handleMouseDown(event: any) {
    let tarArray = [];
    if (event.target.className.includes(' ')) {
      tarArray = event.target.className.split(' ');
    }
    if (tarArray[0] === 'areaMatchData'
      || event.target.className === 'areaMatchDiv'
      || tarArray[0] === 'areaMatch'
    ) {
      this.cancelBlur = false;
      event.stopPropagation();
    } else {
      this.cancelBlur = true;
      this.isRightData();
      this.isRight();
    }
  }

  ngOnDestroy(): void {
    if (this.creatingPackageProgressSub) {
      this.creatingPackageProgressSub.unsubscribe();
    }
    if (this.creatingResultMsgSub) {
      this.creatingResultMsgSub.unsubscribe();
    }
    sessionStorage.removeItem('softwarePackPathName');
  }

  ngOnInit() {
    this.accrptType = ACCEPT_TYPE.softwareRebuild;
    this.currLang = sessionStorage.getItem('language');
    this.isAdmin = sessionStorage.getItem('role') === 'Admin' ? true : false;
    this.copySuccess = this.i18n.common_term_report_detail.copySuccess;
    this.columns = [
      {
        title: this.i18n.analysis_center.software,
        width: '40%'
      },
      {
        title: this.i18n.analysis_center.version,
        width: '10%'
      },
      {
        title: this.i18n.analysis_center.osVersion,
        width: '15%'
      },
      {
        title: this.i18n.analysis_center.imageSource,
        width: '15%'
      },
      {
        title: this.i18n.analysis_center.portGuide,
        width: '20%'
      }
    ];
    this.stepsMirror = [
      {
        step: this.i18n.analysis_center.stepOne,
        desMore: this.i18n.analysis_center.stepOneMore,
        desMore2: ``
      },
      {
        step: this.i18n.analysis_center.stepTwo,
        desMore: this.i18n.analysis_center.stepTwoMore,
        desMore2: this.i18n.analysis_center.stepTwoMore2,
      },
      {
        step: this.i18n.analysis_center.stepThree,
        desMore: this.i18n.analysis_center.stepThreeMore,
        desMore2: this.i18n.analysis_center.stepThreeMore2,
      },
    ];
    this.rebuildStepList = [
      {
        label: this.i18n.analysis_center.step1,
        step: 1
      },
      {
        label: this.i18n.analysis_center.step2,
        step: 2
      },
      {
        label: this.i18n.analysis_center.step3,
        step: 3
      }
    ];
    this.stepsMirrorSource = this.i18n.analysis_center.stepsMirrorSource;
    this.data = [];
    this.srcData = {
      data: this.data,
      state: {
        searched: false,
        sorted: false,
        paginated: false
      }
    };

    this.isX86 = JSON.parse(sessionStorage.getItem('isCheck'));
    if (this.isX86) {
      this.mytip.alertInfo({ type: 'tip', content: this.i18n.software_rebuild_x86_tip, time: 5000 });
      this.packageBtnDisabledTip = this.i18n.software_rebuild_x86_tip;
    }
    this.situation = -1;
    this.progressData = {
      id: 'disk',
      label: '',
      isShow: false,
      value: 0
    };
    this.inputPrompt1 = this.i18nService.I18nReplace(this.i18n.common_term_analysis_rebuild_package_path3,
      { 1: `/portadv/${sessionStorage.getItem('username')}/packagerebuild/` });
    this.userchange = this.i18nService.I18nReplace(
      this.i18n.common_term_build_tip5,
      { 2: this.userPath + 'report/packagerebuild/task_id/' }
    );
    if (sessionStorage.getItem('isFirst') !== '1' && sessionStorage.getItem('isExpired') !== '1') {
      this.Axios.axios.get(`/customize/`).then((resp: any) => {
        if (this.commonService.handleStatus(resp) === 0) {
          this.userPath = `${resp.data.customize_path}/portadv/${sessionStorage.getItem('username')}/packagerebuild/`;
          this.userPathData = `${resp.data.customize_path}/portadv/${sessionStorage.getItem('username')}/data/`;
          const buldPath =
            `${resp.data.customize_path}/portadv/${sessionStorage.getItem('username')}/report/packagerebuild/task_id/`;
          this.userchange = this.i18nService.I18nReplace(this.i18n.common_term_build_tip5, { 2: buldPath });
        }
        this.inputPrompt1 = this.i18nService.I18nReplace(
          this.i18n.common_term_analysis_rebuild_package_path3,
          { 1: this.userPath }
        );
      });

      this.filename = '';
      this.pathlist = [];
      this.inputAreaMatch();
    }

    this.language = sessionStorage.getItem('language');

    this.creatingPackageProgressSub = this.msgService.getMessage().subscribe(msg => {
      if (msg.type === 'creatingPackageProgress') {
        this.packageBtnDisabled = msg.data;
        this.packageBtnDisabledTip = msg.data ? this.i18n.common_term_creating_btn_disabled_tip : '';
      }
    });
    this.creatingResultMsgSub = this.msgService.getMessage().subscribe(msg => {
      if (msg.type === 'creatingResultMsg') {
        if (msg.data.type === 'SoftwarePackage') {
          this.getHistoryList();
          this.curStep = 1;
          this.filename = '';
          this.filenameData = '';
        }
        if (msg.data.state === 'failed') {
          this.packageBtnDisabled = true;
          this.packageBtnDisabledTip = this.i18n.common_term_creating_btn_disabled_tip;
        }
      }
    });

    // 查看任务是否处于等待中
    const token = sessionStorage.getItem('token');
    const numTask = JSON.parse(sessionStorage.getItem('analysisMaximumTask'));
    if (token && numTask > 0 && numTask < 20) {
      this.isCompress = true;
      this.waiting = true;
    }

    // 监听软件包以及依赖文件上传弹框
    this.uploadingContainerSub = this.msgService.getMessage().subscribe(msg => {
      if (msg.type === 'uploadingContainer' && msg.name === 'SoftwarePack') {
        this.isShow = msg.isShow;
        this.isCompress = msg.isCompress;
        if (msg.data === 'start') {
          this.uploadProgress = msg.uploadProgress;
          const fileInfo = sessionStorage.getItem('softwarePackFileInfo');
          if (fileInfo) {
            this.fileInfo = JSON.parse(fileInfo);
          }
        } else if (msg.data === 'end') {
          if (msg.name === 'SoftwarePack') {
            this.uploadResultTip.stateBuild = msg.stateBuild;
            this.uploadResultTip.contentBuild = msg.contentBuild;
            if (msg.filename || msg.filename === '') {
              this.filename = msg.filename;
              sessionStorage.setItem('softwarePackPathName', msg.filename);
            }
          }
        } else { // 任务等待中
          this.waiting = true;
        }
      }
    });
    const packPathName = sessionStorage.getItem('softwarePackPathName');
    if (packPathName) {
      this.filename = packPathName;
    }

    if (sessionStorage.getItem('isFirst') !== '1' && !this.isX86) {
      const msgList = sessionStorage.getItem('resultMsgList');
      const resultMsgList = msgList ? JSON.parse(msgList) : [];
      const packageMsgLen = resultMsgList.filter((msg: any) => msg.type === 'SoftwarePackage').length;
      if (packageMsgLen > 0) {
        this.packageBtnDisabled = true;
        this.packageBtnDisabledTip = this.i18n.common_term_creating_btn_disabled_tip;
      }
      this.checkPackageStatus();
      this.getHistoryList();
    }
    this.confirmName = {
      pack: {
        label: this.i18n.analysis_center.exit.file_name,
        value: '',
        required: true
      },
      data: {
        label: this.i18n.analysis_center.exit.file_name,
        value: '',
        required: true
      }
    };
    this.confirmUploadZip = new FormControl('', [CustomValidators.confirmNewName(this.i18n)]);
    this.maxFilenameLength = new FormControl(
      {value: '', disabled: this.isX86},
      [
        CustomValidators.filenameLength(this.i18n),
        CustomValidators.checksuffix(this.i18n),
        CustomValidators.filenameCheck(this.i18n)
      ]
    );
    this.maxFilenameLengthForData = new FormControl(
      {value: '', disabled: this.isX86},
      [CustomValidators.multifilenameLength(this.i18n), CustomValidators.filenameCheck(this.i18n)]
    );

    this.reportConfigChangeSub = this.msgService.getMessage().subscribe(msg => {
      if (msg.value && msg.type === 'isreportChange') {
        this.getHistoryList();
      }
    });
  }

  public stepChange(step: any) {
    if (step === 1) {
      if (!this.filename && this.pathlist.length === 0) {
        this.noFileSelected = true;
        return;
      }else if (!this.filename) {
        this.filename = this.pathlist[0];
      }
      if (!this.maxFilenameLength.valid) { return; }
      if (this.curStep === 2 && !this.maxFilenameLengthForData.valid) {
        return;
      }
    }
    this.curStep += step;
  }

  private getHistoryList() {
    this.HisoricalReportList = [];
    this.dangerFlag = false;
    this.safeFlag = false;
    this.toomany = '';
    this.Axios.axios.get('/portadv/autopack/history/').then((resp: any) => {
      if (resp.data.histasknumstatus === 2) {
        this.safeFlag = true;
      } else if (resp.data.histasknumstatus === 3) {
        this.toomany = this.i18n.common_term_report_danger_tit;
        this.dangerFlag = true;
      }
      this.HisoricalReportList = resp.data.tasklist;
      this.HisoricalReportList.map((item: any) => {
        item.imgSrc = ['./assets/img/home/download.svg', './assets/img/home/delete.svg'];
        item.isError = this.isErrorReport(item.name);
        item.showTip = false;
      });
      setTimeout(() => {
        this.initTipInstance();
      });
    });
  }

  // 下载重构包
  downloadReport(report: any): void {
    this.showTipInstruct(report);
    this.reportService.downloadPackage(report.name, report.path);
  }

  // 下载 html
  downloadHTML(report: any) {
    this.showTipInstruct(report);
    this.softwarePackageReportApi.getReport(report.path).then((res: any) => {
      if (this.commonService.handleStatus(res) === 0) {
        // 初始化数据
        let scanItems = {};
        let soFileSrcData = [];
        let cFileSrcData = [];
        scanItems = {
          soFile: {
            label: this.i18n.software_package_detail.relayNum
          },
          type: ['soFile']
        };

        const data = res.data;
        const successList = data.replaced;
        const failList = data.missing;

        soFileSrcData = successList.map((item: any, index: number) => Object.assign(item, {
          number: ++index,
          sourceFile: this.handleStatus(item.status)
        }));

        // 重构失败
        if (data.status && failList.length) {
          scanItems = {
            soFile: {
              label: this.i18n.software_package_detail.relayNum
            },
            cFile: {
              label: this.i18n.software_package_detail.lackNum
            },
            type: ['soFile', 'cFile']
          };

          cFileSrcData = failList.map((item: any, index: number) => {
            let isHTTP = false;
            if (item.url) {
              // 判断是否为 chrome版本
              isHTTP = getExplore() && (item.url.split('://')[0].toLowerCase() === 'http');
            }
            return Object.assign(item, {
              number: ++index,
              url: item.url || '--',
              suggestion: this.handleStatus(item.status, item.url, item.name),
              isHTTP,
            });
          });
        }

        const settingLeftInfo = {
          firstItem: {
            label: this.i18n.common_term_path_label,
            value: data.package_path
          },
          fifthItem: {
            label: this.i18n.software_package_detail.time,
            value: data.report_time
          },
          seventhItem: {
            label: this.i18n.software_package_detail.path,
            value: data.result_path || ''
          },
          sixthItem: {
            label: this.i18n.software_package_detail.result,
            value: data.status
              ? this.language === 'en-us' ? data.info : data.info_chinese
              : this.i18n.software_package_detail.packageSuccess,
            isSuccessed: data.status ? 'false' : 'true'
          }
        };
        const settingRightInfo = {
          top: [
            { title: this.i18n.software_package_detail.relayNum, value: successList.length },
            { title: this.i18n.software_package_detail.lackNum, value: failList.length },
            { title: this.i18n.common_term_name_total, value: failList.length + successList.length },
          ]
        };
        const content = this.reportService.downloadTemplete(
          'softwarePackage',
          report.name,
          settingLeftInfo,
          settingRightInfo,
          scanItems,
          soFileSrcData,
          '',
          cFileSrcData
        );
        this.reportService.downloadReportHTML(content, report.path + '.html');
      } else {
        const content = this.currLang === 'zh-cn' ? res.infochinese : res.info;
        this.mytip.alertInfo({ type: 'error', content, time: 5000 });
      }
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

  deleteReport(report: any) {
    const encodeName = encodeURIComponent(report.name);
    let modalClass = 'modal400';
    modalClass = 'modal400' + (this.currLang === 'en-us' ? ' modalEn400' : '');
    this.miniModalServe.open({
      type: 'warn',
      content: {
        title: this.i18n.common_term_history_report_del_title,
        body: this.i18n.common_term_history_report_del_tip2
      },
      close: (): void => {
        this.Axios.axios.delete(`/portadv/autopack/history/?name=${encodeName}&path=${encodeURIComponent(report.path)}`)
          .then((data: any) => {
            if (this.commonService.handleStatus(data) === 0) {
              const content = this.language === 'zh-cn' ? data.infochinese : data.info;
              this.mytip.alertInfo({ type: 'success', content, time: 5000 });
            }
            this.getHistoryList();
          }, (error: any) => {
            this.getHistoryList();
          });
      },
      dismiss: () => { }
    });
  }
  deleteAll() {
    let modalClass = 'modal400';
    modalClass = 'modal400' + (this.currLang === 'en-us' ? ' modalEn400' : '');
    this.miniModalServe.open({
      type: 'warn',
      content: {
        title: this.i18n.common_term_history_report_del_title,
        body: this.i18n.common_term_all_history_tip2
      },
      close: (): void => {
        this.Axios.axios.delete(`/portadv/autopack/history/`).then((data: any) => {
          if (this.commonService.handleStatus(data) === 0) {
            const msg = this.language === 'zh-cn' ? data.infochinese : data.info;
            this.mytip.alertInfo({ type: 'success', content: msg, time: 5000 });
          }
          this.getHistoryList();
        }, (error: any) => {
          this.getHistoryList();
        });
      },
      dismiss: () => { }
    });
  }

  private isErrorReport(name: any) {
    const idx = name.lastIndexOf('.');
    const suffix = name.slice(idx + 1);
    return suffix === 'txt';
  }

  /**
   * 对返回的状态码进行处理
   * @param status 状态码
   * @param url 是否有链接
   * @param fileName 文件名
   */
  handleStatus(status: number, url?: string, fileName?: string): string | void {
    switch (status) {
      case 0:
        return this.i18n.software_package_detail.status.tooDownload;
      case 1:
        return this.i18n.software_package_detail.status.userUpload;
      case 10:
        return this.i18n.common_term_report_level5_result;
      case 13:
        return this.i18n.software_package_detail.status.suggestion_13;
      case 14:
        return this.i18n.software_package_detail.status.suggestion_14;
      case 15:
        return this.i18n.software_package_detail.status.suggestion_15;
      case 16:
        return this.i18n.software_package_detail.status.suggestion_16;
      case 17:
        return this.i18n.software_package_detail.status.suggestion_17;
      case 18:
        return this.i18n.software_package_detail.status.suggestion_18;
      default:
        const lastIndex = fileName.lastIndexOf('.');
        const lastName = fileName.slice(lastIndex);
        return url ?
          ( lastName === '.jar'
            ? this.i18n.software_package_detail.status.suggestion_1
            : this.i18n.software_package_detail.status.suggestion
          )
          : this.i18n.common_term_report_level5_result;
    }
  }

  // 软件包构建初始任务查询
  private checkPackageStatus() {
    const url = '/task/progress/?task_type=1';
    this.Axios.axios.get(url).then((resp: any) => {
      if (!resp.data) { return; }
      if (this.commonService.handleStatus(resp) !== 0) {
        sessionStorage.getItem('language') === 'zh-cn'
          ? this.mytip.alertInfo({ type: 'warn', content: resp.infochinese, time: 10000 })
          : this.mytip.alertInfo({ type: 'warn', content: resp.info, time: 10000 });
        return;
      }
      if (resp.data.task_name) {
        this.msgService.sendMessage({
          type: 'creatingTask',
          data: {
            id: resp.data.task_name,
            type: 'SoftwarePackage'
          }
        });
        this.packageBtnDisabled = true;
        this.packageBtnDisabledTip = this.i18n.common_term_creating_btn_disabled_tip;
      }
    });
  }
  ngAfterContentInit(): void {
    setTimeout(() => {
      this.areaMatchHeight = this.elementRef.nativeElement.querySelector('.areaMatch').offsetHeight;
      this.areaMatchWidth = this.elementRef.nativeElement.querySelector('.areaMatch').offsetWidth;
      const areaMatchData = this.elementRef.nativeElement.querySelector('.areaMatchData');
      if (areaMatchData) {
        this.areaMatchHeightData = areaMatchData.offsetHeight;
        this.areaMatchWidthData = areaMatchData.offsetWidth;
      }
    }, 0);
  }
  chooseLangType(data: any) {
    let info = '';
    if (sessionStorage.getItem('language') === 'zh-cn') {
      info = data.infochinese;
    } else {
      info = data.info;
    }
    return info;
  }

  showMoreMask() {
    this.moreMask.Open();
  }
  closeMaskMore() {
    this.moreMask.Close();
  }
  public onNgModelChange(model: boolean): void {
    if (this.isCheck) {
      this.isDisabled = false;
    } else {
      this.isDisabled = true;
    }
  }
  keyupAreaMatch() {
    if (sessionStorage.getItem('isFirst') !== '1' && sessionStorage.getItem('isExpired') !== '1') {
      this.inputAreaMatch();
    }
  }
  keyupAreaMatchData() {
    if (sessionStorage.getItem('isFirst') !== '1' && sessionStorage.getItem('isExpired') !== '1') {
      this.inputAreaMatchData();
    }
  }
  inputAreaMatch() {
    if (sessionStorage.getItem('isFirst') !== '1' && sessionStorage.getItem('isExpired') !== '1') {
      let path = this.filename;
      this.pathlist = [];
      const lastIndex = this.filename.lastIndexOf(',');
      if (lastIndex) {
        path = this.filename.slice(lastIndex + 1, this.filename.length);
      }
      const params = { path: 'packagerebuild/' + path };
      this.Axios.axios.post('/pathmatch/', params).then((data: any) => {
        const arrBefore = this.filename.split(',');
        if (data) {
          let arrAfter = data.pathlist;
          let idx = this.filename.lastIndexOf(',');
          if (idx >= 0) { idx = this.filename.length - idx; }
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
  inputAreaMatchData() {
    if (sessionStorage.getItem('isFirst') !== '1' && sessionStorage.getItem('isExpired') !== '1') {
      let path = this.filenameData;
      this.pathlistData = [];
      const lastIndex = this.filenameData.lastIndexOf(',');
      if (lastIndex) {
        path = this.filenameData.slice(lastIndex + 1, this.filenameData.length);
      }
      const params = { path };
      this.Axios.axios.post('/datamatch/', params).then((data: any) => {

        const arrBefore = this.filenameData.split(',');
        if (data) {
          let arrAfter = data.pathlist;
          let idx = this.filenameData.lastIndexOf(',');
          if (idx >= 0) { idx = this.filenameData.length - idx; }
          if (idx === 1) {
            arrAfter = this.arr_diff(arrBefore, arrAfter, true);
            this.pathlistData = arrAfter;
            return;
          }
          if (arrAfter.length > 1) {
            arrAfter = this.arr_diff(arrBefore, arrAfter, false);
          }
          this.pathlistData = arrAfter;
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
  public getCheck() {
    this.displayAreaMatch = true;
    this.noFileSelected = false;
    this.uploadResultTip.contentBuild = '';
    this.areaMatchHeight = this.elementRef.nativeElement.querySelector('.areaMatch').offsetHeight;
    this.areaMatchWidth = this.elementRef.nativeElement.querySelector('.areaMatch').offsetWidth;
    this.inputAreaMatch();
  }
  public getCheckData() {
    this.displayAreaMatchData = true;
    this.uploadResultTip.contentDep = '';
    this.areaMatchHeightData = this.elementRef.nativeElement.querySelector('.areaMatchData').offsetHeight;
    this.areaMatchWidthData = this.elementRef.nativeElement.querySelector('.areaMatchData').offsetWidth;
    this.inputAreaMatchData();
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
    // 解决 IE 下点击后无法自动失焦情况
    this.elementRef.nativeElement.querySelector('.areaMatch').blur();
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
    // 解决 IE 下点击后无法自动失焦情况
    this.elementRef.nativeElement.querySelector('.areaMatchData').blur();
  }
  public isRight() {
    if (this.cancelBlur) {
      this.displayAreaMatch = false;
    } else {
      this.displayAreaMatch = true;
    }
  }
  public isRightData() {
    if (this.cancelBlur) {
      this.displayAreaMatchData = false;
    } else {
      this.displayAreaMatchData = true;
    }
  }

  // 点击确认重构
  public pack(flagPack: any) {
    this.uploadResultTip.contentBuild = '';
    this.uploadResultTip.contentDep = '';
    if (this.packageBtnDisabled) { return; }
    this.situation = -1;
    this.isWebpacking = true;
    let filename;
    if (this.filename.startsWith('/')) {
      filename = this.filename.slice(1);
    } else {
      filename = this.filename;
    }
    const params = {
      filepath: `${this.userPath}${filename}`,
      flag: flagPack,
      is_download: this.isCheck
    };
    this.Axios.axios.post('/portadv/autopack/start/', params).then((data: any) => {
      if (this.commonService.handleStatus(data) === 0) {
        // 创建任务成功
        this.count = 0;
        this.taskId = data.data.task_id;
        sessionStorage.setItem('anyCtaskId', this.taskId);
        this.msgService.sendMessage({
          type: 'creatingTask',
          data: {
            id: data.data.task_id,
            type: 'SoftwarePackage'
          }
        });
        this.maskConfig.Close();
        this.maskDownload.Close();
      } else if (data.status === Status.diskSpace) { // 磁盘空间不足
        const content = this.currLang === 'zh-cn' ? data.infochinese : data.info;
        this.mytip.alertInfo({ type: 'error', content, time: 5000 });
      } else if (data.status === '0x0a0213') {
        // 上传的RPM包在鲲鹏镜像站不存在，可通过配置鲲鹏镜像源进行重构
        this.maskConfig.Open();
      } else if (data.status === '0x0a0214') {
        // 上传的RPM包在鲲鹏镜像站已存在，请按对应的版本下载RPM包使用或查看移植指导
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
        this.maskDownload.Open();
      } else if (this.commonService.handleStatus(data) === 1) {
        this.situation = 3;
        this.info = this.chooseLangType(data);
        const id = data.data && data.data.task_id;
        const resultMsg = {
          id: id || 'xxxxxx',
          type: 'SoftwarePackage',
          state: 'failed',
          msg: this.info,
          situation: 3
        };
        this.msgService.sendMessage({
          type: 'creatingResultMsg',
          data: resultMsg
        });
        this.maskConfig.Close();
        this.maskDownload.Close();
      }
    });
    this.maxFilenameLength.reset('');
    this.maxFilenameLengthForData.reset('');
    localStorage.setItem('filename', this.filename.substr(-3));
  }
  public confirmHandle(flag: any) {
    if (!flag) { this.webpackAlert.alert_close(); }
  }
  zipUpload() {
    this.elementRef.nativeElement.querySelector('#zipload').value = '';
    this.elementRef.nativeElement.querySelector('#zipload').click();
    this.uploadResultTip.stateBuild = '';
    this.uploadResultTip.contentBuild = '';
    this.noFileSelected = false;
  }

  // 上传软件包
  uploadFilePack(choice: any) {
    this.exitMask.Close();
    this.isUploadPack = true;
    this.uploadStartFlag = false;
    this.isShow = false;
    this.isSlow = false;
    let file: any;
    if (choice === 'normal') {
      file = this.elementRef.nativeElement.querySelector('#zipload').files[0];
      this.uploadPackFile = file;
    } else {
      file = this.uploadPackFile;
    }
    this.fileInfo.filename = file.name;
    const size = file.size / 1024 / 1024;
    // 文件大于 1024M | 包含中文 以及 空格 等其它特殊字符
    if (size > fileSize || this.regService.filenameReg(file.name)) {
      this.isShow = false;
      this.isCompress = false;
      this.uploadResultTip.stateBuild = 'error';
      this.uploadResultTip.contentBuild = size > fileSize
        ? this.i18n.common_term_upload_max_size_tip
        : this.i18n.upload_file_tip.reg_fail;
      this.fileExceed = size > fileSize ? true : false;
      return;
    }
    this.fileInfo.filesize = size.toFixed(1);
    if (!file.name.endsWith('.rpm') && !file.name.endsWith('.deb')) {
      this.isShow = false;
      this.isCompress = false;
      this.uploadResultTip.stateBuild = 'error';
      this.uploadResultTip.contentBuild = this.i18n.common_porting_message_file_type_incorrect;
      return;
    }
    const isAarch64 = this.uploadService.isIncludeAarch64(file.name);
    if (isAarch64 && choice === 'normal') {
      this.tiModal.open(this.aarch64Modal, {
        id: 'aarch64Modal',
        modalClass: 'modal400',
        close: (): void => {
          this.handleRelayFile(choice, file);
        },
        dismiss: () => { }
      });
    } else {
      this.handleRelayFile(choice, file);
    }
  }

  /**
   * 请求 上传软件包 接口
   * @param choice 上传类型
   * @param file 上传的文件
   */
  handleRelayFile(choice: string, file: any) {
    const params = {
      file_size: file.size,
      file_name: file.name,
      scan_type: '3',
      choice
    };
    const formData = new FormData();
    formData.append('file', file);
    this.uploadProgress = '0%';
    sessionStorage.setItem('softwarePackFileInfo', JSON.stringify(this.fileInfo));
    this.Axios.axios.post('/portadv/autopack/check_upload/', params).then((data: any) => {
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
        this.searchUploadPackage(choice, formData, file, times);
      } else if (this.commonService.handleStatus(data) === 2) {
        this.isShow = false;
        this.isCompress = false;
        // check_upload异常情况，包括文件存在
        if (data.infochinese === '文件已存在') {
          this.suffix = data.data.suffix;
          this.exitFileNameReplace =
            this.i18nService.I18nReplace(this.i18n.analysis_center.exit.content, { 1: file.name });
          this.exitMask.Open();
          return;
        } else {
          this.uploadResultTip.stateBuild = 'error';
          this.uploadResultTip.contentBuild = this.language === 'zh-cn' ? data.infochinese : data.info;
        }
        this.inputItems.path.value = '';
        $('#zipload').val('');
      } else if (data.status === '0x010611') { // 磁盘空间不足
        this.uploadResultTip.stateBuild = 'error';
        this.uploadResultTip.contentBuild = this.language === 'zh-cn' ? data.infochinese : data.info;
        $('#zipload').val('');
      }
    });
  }

  // 查看软件包上传状态
  public searchUploadPackage(choice: string, formData: FormData, file: { name: string }, times?: any) {
    const CancelToken = axios.CancelToken;
    const that = this;
    this.Axios.axios.post('/portadv/autopack/package/', formData, {
      headers: {
        'scan-type': '3',
        choice
      },
      cancelToken: new CancelToken(function executor(c) {
        that.cancel = c;
      }),
      ...this.alreadyconfig
    }).then((resp: any) => {
      this.suffix = '';
      this.exitMask.Close();
      if (this.commonService.handleStatus(resp) === 0) {
        clearTimeout(this.maximumTime);
        this.filename = file.name; // 上传成功时才会预填到文本框
        let num = file.name.lastIndexOf('.');
        let filename = file.name.substring(0, num);
        if (filename.lastIndexOf('.tar') > 0) {
          num = filename.lastIndexOf('.');
          filename = filename.substring(0, num);
        }
        this.inputItems.path.value = filename;
        this.msgService.sendMessage({
          type: 'uploadingContainer',
          name: 'SoftwarePack',
          stateBuild: 'success',
          data: 'end',
          isShow: false,
          isCompress: false,
          contentBuild: this.language === 'zh-cn' ? resp.infochinese : resp.info,
          filename: this.filename
        });
      } else if (this.commonService.handleStatus(resp) === 1) {
        clearTimeout(this.maximumTime);
        if (resp.infochinese !== '文件已存在，上传失败') {
          this.inputItems.path.value = '';
          this.uploadResultTip.stateBuild = 'error';
          this.uploadResultTip.contentBuild = this.language === 'zh-cn' ? resp.infochinese : resp.info;
        }
        this.msgService.sendMessage({
          type: 'uploadingContainer',
          name: 'SoftwarePack',
          stateBuild: 'error',
          data: 'end',
          isShow: false,
          isCompress: false,
          contentBuild: this.language === 'zh-cn' ? resp.infochinese : resp.info,
          filename: ''
        });

      } else if (resp.status === '0x010611') { // 磁盘空间不足
        this.msgService.sendMessage({
          type: 'uploadingContainer',
          name: 'SoftwarePack',
          stateBuild: 'error',
          data: 'end',
          isShow: false,
          isCompress: false,
          contentBuild: this.language === 'zh-cn' ? resp.infochinese : resp.info
        });
      } else if (resp.status === Status.maximumTask) { // 等待上传中
        let index: number = JSON.parse(sessionStorage.getItem('analysisMaximumTask')) || 0;
        let isCompress: boolean;
        if (index > 20) {
          const content = this.currLang === 'zh-cn' ? resp.infochinese : resp.info;
          this.mytip.alertInfo({ type: 'error', content, time: 5000 });
          isCompress = false;
          clearTimeout(this.maximumTime);
          sessionStorage.setItem('analysisMaximumTask', '0');
        } else {
          isCompress = true;
          sessionStorage.setItem('analysisMaximumTask', JSON.stringify(++index));
          this.maximumTime = setTimeout(() => {
            this.searchUploadPackage(choice, formData, file);
          }, 30000);
          sessionStorage.setItem('analysisTime', JSON.stringify(this.maximumTime));
        }
        this.msgService.sendMessage({
          type: 'uploadingContainer',
          name: 'SoftwarePack',
          data: 'waiting',
          isShow: false,
          isCompress
        });
      }
      $('#zipload').val('');
    }).catch((e: any) => {
      clearInterval(times);
      this.msgService.sendMessage({
        type: 'uploadingContainer',
        name: 'SoftwarePack',
        stateBuild: '',
        data: 'end',
        isShow: false,
        isCompress: false,
        contentBuild: ''
      });
      $('#zipload').val('');
    });
  }

  // 取消上传请求
  closeRequest() {
    this.isCompress = false;
    sessionStorage.setItem('analysisMaximumTask', '0');
    const time = this.maximumTime || JSON.parse(sessionStorage.getItem('analysisTime'));
    clearTimeout(time);
    if (this.cancel) {
      this.cancel();
    }
  }

  /**
   * 上传资源文件先判断文件是否存在
   */
  getDatamatch() {
    let flag = false;
    const path = '';
    const params = {
      path
    };
    this.Axios.axios.post('/datamatch/', params).then((resp: any) => {
      if (resp.pathlist && resp.pathlist.includes(this.fileInfo.filename)) {
        flag = false;
        this.uploadResultTip.contentBuild = this.i18n.common_term_upload_exist_tip;
        this.uploadResultTip.stateBuild = 'error';
      } else {
        flag = true;
      }
    });
    return flag;
  }

  // 显示多文件上传 modal
  showRelayFileModal() {
    this.mutipleFile.showRelayFileModal();
  }

  /**
   * 将上传成功文件填写到 textarea 中 -> 子组件调用方法
   * @param file 文件名
   */
  handleRelayFileName(file: string): void {
    const textAreaFileList = this.filenameData.split(',');
    const lastIndex = this.filenameData.lastIndexOf(',');
    if (!textAreaFileList.includes(file)) {
      this.filenameData = lastIndex
        ? this.filenameData.slice(0, lastIndex + 1) + file + ','
        : file + ',';
    }
  }

  // 前往文件大小超过限制的联机帮助
  goFileHelp() {
    this.commonService.goHelp('file');
  }

  /**
   * 前往报告详情页
   * @param item 点击数据详情
   */
  goReportDetail(item: any): void {
    this.evtMap.forEach(val => {
      val.destroy();
    });
    const param = {
      queryParams: {
        report: item.path,
        name: item.name
      }
    };
    this.router.navigate(['SoftwarePackageReport'], param);
    sessionStorage.setItem('tabFlag', 'true');
  }


  private initTipInstance() {

    this.tipElList.forEach(tip => {

      const elem = tip.nativeElement;
      const tipInstance = this.tioverflow.create(elem);
      this.evtMap.set(elem, tipInstance);
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
    const inpValue = index === 1 ? item.desMore : item.desMore2;
    aInp.value = inpValue;
    aInp.select();
    document.execCommand('copy', false, null); // 执行浏览器复制命令
  }

  public openMaskConfig() {
    this.maskConfig.Open();
  }

  public closeMaskConfig() {
    this.maskConfig.Close();
  }

  public openMaskDownload() {
    this.maskDownload.Open();
  }

  public closeMaskDownload() {
    this.maskDownload.Close();
  }

  public showLoding() {
    document.getElementById('loading-box').style.display = 'flex';
  }
  public closeLoding() {
    document.getElementById('loading-box').style.display = 'none';
  }

  public downMirror(packResult: any) {
    // 下载华为镜像源
    const a = document.createElement('a');
    a.setAttribute('href', packResult);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
  isDeleteAreaMatch(value: any) {
    this.deleteValue = value;
    this.isDeletePack = true;
    this.fileNameDelete =
      this.i18nService.I18nReplace(this.i18n.analysis_center.exit.delete_file_content, { 1: value });
    this.miniModalServe.open({
      type: 'warn',
      content: {
        title: this.i18n.common_term_history_report_del_title,
        body: this.fileNameDelete
      },
      close: (): void => {
        this.deleteAreaMatch();
      },
      dismiss: () => { }
    });
  }
  isDeleteAreaMatchData(value: any) {
    this.deleteValueData = value;
    this.isDeletePack = false;
    this.fileNameDelete =
      this.i18nService.I18nReplace(this.i18n.analysis_center.exit.delete_file_content, { 1: value });
    this.miniModalServe.open({
      type: 'warn',
      content: {
        title: this.i18n.common_term_history_report_del_title,
        body: this.fileNameDelete
      },
      close: (): void => {
        this.deleteAreaMatch();
      },
      dismiss: () => { }
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
    this.Axios.axios.delete(`/portadv/tasks/delete_file/`, { data: params }).then((data: any) => {
      if (this.commonService.handleStatus(data) === 0) {
        const inputVal = this.isDeletePack ? this.filename : this.filenameData;
        let vals = inputVal.split(',');
        if (vals.length === 1) {
          if (this.isDeletePack) { this.filename = ''; } else { this.filenameData = ''; }
        } else {
          if (this.isDeletePack) {
            vals = vals.filter((val: any) => {
              return this.deleteValue.indexOf(val) >= 0 && val;
            });
            if (vals.length > 0) { this.filename = ''; }
          } else {
            vals = vals.filter((val: any) => {
              return this.deleteValueData.indexOf(val) < 0;
            });
            this.filenameData = vals.join(',') + ',';
          }
        }
      }
      sessionStorage.removeItem('softwarePackPathName');
      const type = this.commonService.handleStatus(data) === 0 ? 'success' : 'warn';
      const content = this.language === 'zh-cn' ? data.infochinese : data.info;
      this.mytip.alertInfo({ type, content, time: 5000 });
      this.inputAreaMatch();
    });
  }
  closeMaskExit() {
    this.exitMask.Close();
    $('#zipload').val('');
    $('#files').val('');
  }

  uploadAgain(choice: any) {
    if (choice === 'override') {
      this.uploadFilePack(choice);
    }
  }

  // 改变 history 报告图标
  public changeHistoryImgSrc(num: number, bool: boolean, item: any): void {
    if (!num) {
      item.imgSrc[num] = !bool ? './assets/img/home/download_hover.svg' : './assets/img/home/download.svg';
    } else {
      item.imgSrc[num] = !bool ? './assets/img/home/delete_hover.svg' : './assets/img/home/delete.svg';
    }
  }
}

