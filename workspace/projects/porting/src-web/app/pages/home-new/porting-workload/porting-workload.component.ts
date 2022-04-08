import {
  Component, OnInit, ElementRef, ViewChild,
  AfterContentInit, AfterViewInit, OnDestroy, HostListener
} from '@angular/core';
import {
  TiMessageService, TiSelectComponent, TiValidationConfig,
  TiModalService, TiTableSrcData
} from '@cloud/tiny3';
import { Router } from '@angular/router';
import axios from 'axios';
import {
  FormBuilder, FormControl
} from '@angular/forms';
import {
  UploadService, AxiosService, MessageService,
  MytipService, ReportService, CommonService,
  RegService, I18nService, CustomValidators
} from '../../../service';
import { SoftwareMigrationReportApi, PortingWorkloadApi } from '../../../api';
import { SoftwareMigrationService } from '../../detail/software-migration-report-detail/software-migration.service';
import { HyMiniModalService } from 'hyper';

import { Subscription, fromEvent } from 'rxjs';
import { debounceTime } from 'rxjs/internal/operators';

import { ACCEPT_TYPE, ACCEPT_TYPE_IE } from '../../../global/url';
import { DEFAULT_OS, fileSize, LanguageType } from '../../../global/globalData';
import { isMac } from '../../../utils';
import { Status } from '../../../modules';

@Component({
  selector: 'app-porting-workload',
  templateUrl: './porting-workload.component.html',
  styleUrls: ['./porting-workload.component.scss']
})
export class PortingWorkloadComponent implements OnInit, AfterContentInit, AfterViewInit, OnDestroy {

  public i18n: any;
  public currLang = 'zh-cn';
  @ViewChild('delHistoryReport', { static: false }) delHistoryReport: any;
  @ViewChild('exitmask', { static: false }) exitMask: any;
  @ViewChild('saveasmask', { static: false }) saveasMask: any;
  @ViewChild('aarch64Modal', { static: false }) aarch64Modal: any;
  @ViewChild('aboutmore') aboutMore: any;

  constructor(
    public mytip: MytipService,
    public timessage: TiMessageService,
    private elementRef: ElementRef,
    public router: Router,
    public Axios: AxiosService,
    public fb: FormBuilder,
    public i18nService: I18nService,
    private tiModal: TiModalService,
    private miniModalServe: HyMiniModalService,
    private msgService: MessageService,
    private reportService: ReportService,
    private uploadService: UploadService,
    private commonService: CommonService,
    private regService: RegService,
    private softwareMigrationService: SoftwareMigrationService,
    private softwareMigrationReportApi: SoftwareMigrationReportApi,
    private portingWorkloadApi: PortingWorkloadApi
  ) {
    this.i18n = this.i18nService.I18n();
  }

  public maximumTime: any; // 上传等待定时器
  public waiting: boolean; // 任务是否处于等待中
  public isCompress: boolean;

  public noFileSelected = false;
  public fileExceed = false; // 文件超过 1G
  public imgBase2: any;
  public soFilesNeed: number;
  public soFilesTotal: number;
  public soFilesUse: number; // 可兼容替换数
  public portingLevelList: Array<any> = [];

  public scanItems = {
    soFile: {
      label: ''
    },
    type: ['soFile']
  };
  public binDetailSrcData: TiTableSrcData;

  public textForm1: any = {
    firstItem: {
      label: '',
      value: []
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
      value: []
    }
  };

  public reportId: string;
  public report: any = {
    id: ''
  };
  public HisoricalReportList: Array<any> = [];
  public reportTotalNum = 0;
  public dangerFlag = false;
  public safeFlag = false;
  public isCommit = false;
  public toomany = '';
  public userPath = '';
  public userPathFix = '';
  public inputItems: any = {
    types: {
      label: '',
      required: false,
      selected: '',
      radioList: [],
    },
    path: {
      label: '',
      value: '', // 默认为当前用户名
      required: false,
      placeholder: ''
    },
    x86Path: {
      label: '',
      value: '', // 默认为当前用户名
      required: true,
      placeholder: ''
    },
    targetOs: {
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
      value: '',
      required: false
    }
  };

  // 保存当前选择的OS
  public currSelectOS: any;

  public uploadResultTip = {
    state: '',
    content: ''
  };
  public uploadInfo = {
    filename: '',
    filesize: '',
    isShow: false,
    progress: '',
    isSlow: false,
    isCompress: false,
    upTimes: 0
  };

  public oldName: any;
  private uploadZipFile: any;
  private uploadStartFlag = false;
  public exitFileName = '';
  public exitFileNameReplace = '';
  public fileNameDelete = '';
  public suffix = '';
  public multipleInput = true;
  public deleteValue = '';

  public confirmName: any;
  public confirmUploadZip: any;
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
  public insPathValidation: TiValidationConfig = {
    type: 'blur'
  };


  public pathlist: any = [];
  public displayAreaMatch = false;
  public maxFilenameLength: any;
  public maxPathLengthX86: any;
  public areaMatchHeight: number;

  public createBtnDisabled = false;
  public createBtnDisabledTip = '';
  public canAnalysis = false;

  private reportChangeSub: Subscription;
  private creatingResultMsgSub: Subscription;
  private creatingSourceCodeProgressSub: Subscription;
  private uploadingContainerSub: Subscription;

  public cancel: any; // 取消 axios 请求
  public alreadyconfig = {
    onUploadProgress: (progressEvent: any) => {
      const complete = Math.floor((progressEvent.loaded / progressEvent.total) * 100);
      // PackagePorting
      if (!sessionStorage.getItem('token')) {
        this.cancel();
        return;
      }
      this.msgService.sendMessage({
        type: 'uploadingContainer',
        name: 'PackagePorting',
        data: 'start',
        isShow: true,
        uploadProgress: complete + '%',
        cancel: this.cancel
      });
      if (complete === 100) {
        this.msgService.sendMessage({
          type: 'uploadingContainer',
          name: 'PackagePorting',
          data: 'start',
          isShow: false,
          uploadProgress: complete + '%'
        });
      }
    }
  };

  public accrptType: string; // 压缩包上传支持类型

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

  ngOnInit() {
    this.accrptType = isMac() || this.commonService.isIE11()
      ? ACCEPT_TYPE_IE.softwareMigration
      : ACCEPT_TYPE.softwareMigration;

    this.binDetailSrcData = {
      data: [],
      state: {
        searched: false,
        sorted: false,
        paginated: false
      }
    };

    // 国际化词条初始化
    this.textForm1.firstItem.label = this.i18n.common_term_ipt_label.packageName;
    this.textForm1.fifthItem.label = this.i18n.common_term_ipt_label.target_os;
    this.textForm1.sixthItem.label = this.i18n.common_term_ipt_label.target_system_kernel_version;
    this.textForm1.seventhItem.label = this.i18n.common_term_ipt_label.pathName;

    this.scanItems.soFile.label = this.i18n.common_term_result_soFile;

    this.currLang = sessionStorage.getItem('language');
    this.inputItems.types.label = this.i18n.porting_workload_label.type;
    this.inputItems.path.label = this.i18n.porting_workload_label.path;
    this.inputItems.x86Path.label = this.i18n.porting_workload_label.x86Path;
    this.inputItems.x86Path.placeholder = this.i18n.porting_workload_label.path_installed_placeholder;
    this.inputItems.targetOs.label = this.i18n.common_term_ipt_label.target_os;
    this.inputItems.version.label = this.i18n.common_term_ipt_label.target_system_kernel_version;
    this.inputItems.types.radioList = [
      {
        label: this.i18n.porting_workload_label.type1, id: '1',
        desc: this.i18n.porting_workload_label.path_package_tip, disable: false, checked: false
      },
      {
        label: this.i18n.porting_workload_label.type2, id: '2',
        desc: this.i18n.porting_workload_label.path_installed_tip, disable: true, checked: false
      }
    ];
    this.inputItems.types.selected = this.inputItems.types.radioList[0].id;
    if (sessionStorage.getItem('isCheck')) {
      this.inputItems.types.radioList[1].disable = !JSON.parse(sessionStorage.getItem('isCheck'));
    }
    if (sessionStorage.getItem('isFirst') !== '1' && sessionStorage.getItem('isExpired') !== '1') {
      const msgList = sessionStorage.getItem('resultMsgList');
      const resultMsgList = msgList ? JSON.parse(msgList) : [];
      const sourceCodeMsgLen = resultMsgList.filter(
         (msg: any) => msg.type === 'PackagePorting' && msg.state === 'failed').length;
      if (sourceCodeMsgLen > 0) {
        this.createBtnDisabled = true;
        this.createBtnDisabledTip = this.i18n.common_term_creating_btn_disabled_tip;
      }
      this.queryUserPath();
      if (!sessionStorage.getItem('isCheck')) {
        this.isIEPlatform();
      }
      this.querySystemInfo();
      this.getHistoryReport();
      this.getTaskUndone();
      this.inputAreaMatch();
    }
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
    this.confirmUploadZip = new FormControl('', [CustomValidators.confirmNewName(this.i18n)]);
    this.maxFilenameLength = new FormControl(
      '', [CustomValidators.multifilenameLength(this.i18n), CustomValidators.filenameCheck(this.i18n)]);
    this.maxPathLengthX86 = new FormControl(
      {value: '', disabled: false},
      [CustomValidators.multipathLength(this.i18n), CustomValidators.filenameCheck(this.i18n)]
      );
    this.validation.errorMessage.regExp = this.i18n.common_term_no_samepwd;
    this.validation.errorMessage.required = this.i18n.common_term_no_samepwd;

    this.reportChangeSub = this.msgService.getMessage().subscribe(msg => {
      if (msg.value && msg.type === 'isreportChange') {
        this.getHistoryReport();
      }
    });

    this.creatingResultMsgSub = this.msgService.getMessage().subscribe(msg => {
      if (msg.type === 'creatingResultMsg') {
        if (msg.data.type === 'PackagePorting') {
          this.getHistoryReport();
        }
      }
    });
    this.creatingSourceCodeProgressSub = this.msgService.getMessage().subscribe(msg => {
      if (msg.type === 'creatingPackPortingProgress') {
        this.createBtnDisabled = msg.data;
        this.createBtnDisabledTip = msg.data ? this.i18n.common_term_creating_btn_disabled_tip  : '';
      }
    });

    // 查看任务是否处于等待中
    const token = sessionStorage.getItem('token');
    const numTask = JSON.parse(sessionStorage.getItem('portingWorkloadMaximumTask'));
    if (token && numTask > 0 && numTask < 20) {
      this.isCompress = true;
      this.waiting = true;
    }

    // 监听压缩包上传弹框
    this.uploadingContainerSub = this.msgService.getMessage().subscribe(msg => {
      if (msg.type === 'uploadingContainer' && msg.name === 'PackagePorting' ) {
        this.uploadInfo.isShow = msg.isShow;
        this.isCompress = msg.isCompress || false;
        if (msg.data === 'start') {
          this.uploadInfo.progress = msg.uploadProgress;
          const info = sessionStorage.getItem('packagePortingFileInfo');
          if (info) {
            this.cancel = msg.cancel;
            this.uploadInfo = Object.assign({
              isShow: msg.isShow,
              progress: msg.uploadProgress
            }, JSON.parse(info));
          }
        } else if (msg.data === 'end') {
          this.createBtnDisabled = false;
          if (msg.path || msg.path === '') {
            this.inputItems.path.value = msg.path;
            sessionStorage.setItem('packagePortingPathName', msg.path);
          }
          this.uploadResultTip.state = msg.state;
          this.uploadResultTip.content = msg.content;
        } else { // 任务等待中
          this.waiting = true;
        }
      }
    });
    const pathName = sessionStorage.getItem('packagePortingPathName');
    if (pathName) {
      this.inputItems.path.value = pathName;
    }
  }

  ngOnDestroy() {
    if (this.reportChangeSub) {
      this.reportChangeSub.unsubscribe();
    }
    if (this.creatingResultMsgSub) {
      this.creatingResultMsgSub.unsubscribe();
    }
    sessionStorage.removeItem('packagePortingPathName');
  }

  // 前往报告详情页
  goReportDetail(item: any) {
    const param = {
      queryParams: {
        report: item.id
      }
    };
    this.router.navigate(['softwareMigrationReport'], param);
    sessionStorage.setItem('tabFlag', 'true');
  }

  ngAfterContentInit(): void {
    setTimeout(() => {
      const areaMatch = this.elementRef.nativeElement.querySelector('.areaMatch');
      if (areaMatch) {
        this.areaMatchHeight = areaMatch.offsetHeight;
      }
      const hidePathEl = this.elementRef.nativeElement.querySelectorAll('.hide-path');
      if (hidePathEl.length) {
        hidePathEl[0].parentElement.style.paddingBottom = '0px';
      }
    }, 0);
  }

  ngAfterViewInit(): void {
    const container = $('.router-content')[0];
    const dropContainer = $('ti-drop.ti3-dropdown-container');
    fromEvent(container, 'scroll')
      .pipe(
        debounceTime(50)
      )
      .subscribe(e => {
        const url = this.router.url.split('?')[0];
        const routerList = ['/homeNew/home', '/homeNew/porting-workload',
        '/homeNew/analysisCenter', '/homeNew/migrationCenter', '/homeNew/PortingPre-check'];
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

  public zipUpload() {
    this.noFileSelected = false;
    this.elementRef.nativeElement.querySelector('#zipload').value = '';
    this.elementRef.nativeElement.querySelector('#zipload').click();
  }
  public uploadFile(choice: any) {
    // 上传源代码-压缩包
    this.exitMask.Close();
    this.uploadStartFlag = false;
    this.uploadInfo.isShow = false;
    this.uploadInfo.isSlow = false;
    let file: any;
    let inputDom;
    if (choice === 'normal') {
      inputDom = this.elementRef.nativeElement.querySelector('#zipload');
      file = this.elementRef.nativeElement.querySelector('#zipload').files[0];
      this.uploadZipFile = file;
    } else {
      file = this.uploadZipFile;
    }
    this.uploadInfo.filename = file.name;
    const size = file.size / 1024 / 1024;
    // 文件大于 1024M | 包含中文 以及 空格 等其它特殊字符
    if (size > fileSize || this.regService.filenameReg(file.name)) {
      this.uploadInfo.isShow = false;
      this.uploadResultTip.state = 'error';
      this.uploadResultTip.content = size > fileSize
        ? this.i18n.common_term_upload_max_size_tip
        : this.i18n.upload_file_tip.reg_fail;
      this.fileExceed = size > fileSize ? true : false;
      return;
    }
    this.uploadInfo.filesize = size.toFixed(1);
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
    let params = {
      file_size: file.size,
      file_name: file.name,
      need_unzip: 'false',
      scan_type: '5',
      choice
    };
    const formData = new FormData();
    if (choice === 'save_as') {
      this.uploadInfo.filename = `${this.exitFileName}${this.suffix}`;
      formData.append('file', file, this.uploadInfo.filename);
      params = {
        file_size: file.size,
        file_name: this.uploadInfo.filename,
        need_unzip: 'false',
        scan_type: '5',
        choice
      };
    } else if (choice === 'override' && this.exitFileName !== '') {
      this.uploadInfo.filename = `${this.oldName}`;
      formData.append('file', file, this.uploadInfo.filename);
      params = {
        file_size: file.size,
        file_name: this.uploadInfo.filename,
        need_unzip: 'false',
        scan_type: '5',
        choice
      };
    } else {
      formData.append('file', file);
    }
    this.uploadInfo.progress = '0%';
    sessionStorage.setItem('packagePortingFileInfo', JSON.stringify({
      filename: this.uploadInfo.filename,
      filesize: this.uploadInfo.filesize
    }));
    this.Axios.axios.post('/portadv/tasks/check_upload/', params).then((data: any) => {
      this.displayAreaMatch = false;
      if (this.commonService.handleStatus(data) === 0) {
        this.createBtnDisabled = true;
        const times = setInterval(() => {
          this.uploadInfo.upTimes++;
          if (this.uploadInfo.upTimes >= 100) {
            this.uploadInfo.isSlow = true;
            this.uploadInfo.upTimes = 0;
            clearInterval(times);
          }
        }, 1000);
        this.searchUploadPackage(choice, formData, file, times);
      } else if (this.commonService.handleStatus(data) === 1) {
        // check_upload异常情况，包括文件存在
        if (data.infochinese === '文件已存在，上传失败') {
          this.exitFileName = data.data.new_name;
          this.oldName = data.data.old_name;
          this.suffix = data.data.suffix;
          this.exitFileNameReplace = this.i18nService.I18nReplace(
            this.i18n.analysis_center.exit.content, { 1: data.data.old_name });
          this.exitMask.Open();
          return;
        } else {
          this.uploadResultTip.state = 'error';
          this.uploadResultTip.content = this.currLang === 'zh-cn' ? data.infochinese : data.info;
        }
        this.inputItems.path.value = '';
        this.uploadInfo.isShow = false;
        $('#zipload').val('');
      } else {
        this.uploadResultTip.state = 'error';
        this.uploadResultTip.content = this.currLang === 'zh-cn' ? data.infochinese : data.info;
        $('#zipload').val('');
      }
    });
  }

  // 查看软件包上传状态
  public searchUploadPackage(choice: string, formData: FormData, file: { name: string }, times?: any) {
    const CancelToken = axios.CancelToken;
    const that = this;
    this.Axios.axios.post('/portadv/tasks/upload/', formData, {
      headers: {
        'need-unzip': false,
        'scan-type': '5',
        choice
      },
      cancelToken: new CancelToken(function executor(c) {
        that.cancel = c;
      }),
      ...this.alreadyconfig
    }).then((resp: any) => {
      this.suffix = '';
      this.exitFileName = '';
      this.exitMask.Close();
      if (this.commonService.handleStatus(resp) === 0 || resp === 'toolarge') {
        const lastIndex = this.inputItems.path.value.lastIndexOf(',');
        if (!this.multipleInput) {
          this.inputItems.path.value = resp.data;
        } else {
          const arr = this.inputItems.path.value.split(',');
          if ( !arr.includes(resp.data) ) {
            if (lastIndex) {
                this.inputItems.path.value = this.inputItems.path.value.slice(0, lastIndex + 1) + resp.data + ',';
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
        clearInterval(times);
        this.msgService.sendMessage({
          type: 'uploadingContainer',
          name: 'PackagePorting',
          state: 'success',
          data: 'end',
          isShow: false,
          content: this.currLang === 'zh-cn' ? resp.infochinese : resp.info,
          path: this.inputItems.path.value
        });
      } else if (this.commonService.handleStatus(resp) === 1) {
        this.inputItems.path.value = '';
        clearInterval(times);
        this.msgService.sendMessage({
          type: 'uploadingContainer',
          name: 'PackagePorting',
          state: 'error',
          data: 'end',
          isShow: false,
          content: this.currLang === 'zh-cn' ? resp.infochinese : resp.info,
          path: this.inputItems.path.value
        });
      } else if (resp.status === Status.maximumTask) { // 等待上传中
        let index: number = JSON.parse(sessionStorage.getItem('portingWorkloadMaximumTask')) || 0;
        let isCompress: boolean;
        if (index > 20) {
          const content = this.currLang === 'zh-cn' ? resp.infochinese : resp.info;
          this.mytip.alertInfo({ type: 'error', content, time: 5000 });
          isCompress = false;
          clearTimeout(this.maximumTime);
          sessionStorage.setItem('portingWorkloadMaximumTask', '0');
        } else {
          isCompress = true;
          sessionStorage.setItem('portingWorkloadMaximumTask', JSON.stringify(++index));
          this.maximumTime = setTimeout(() => {
            this.searchUploadPackage(choice, formData, file);
          }, 30000);
          sessionStorage.setItem('portingWorkloadTime', JSON.stringify(this.maximumTime));
        }
        this.msgService.sendMessage({
          type: 'uploadingContainer',
          name: 'PackagePorting',
          data: 'waiting',
          isShow: false,
          isCompress
        });
      } else if (resp.status === '0x010611') {
        clearInterval(times);
        this.msgService.sendMessage({
          type: 'uploadingContainer',
          name: 'PackagePorting',
          state: 'error',
          data: 'end',
          isShow: false,
          content: this.currLang === 'zh-cn' ? resp.infochinese : resp.info
        });
      }
      if (resp === 'timeout') {
        clearInterval(times);
        this.msgService.sendMessage({
          type: 'uploadingContainer',
          name: 'PackagePorting',
          state: 'error',
          data: 'end',
          isShow: false,
          content: this.i18n.common_term_upload_time_out
        });
      }
      $('#zipload').val('');
    }).catch((e: any) => {
      clearInterval(times);
      this.msgService.sendMessage({
        type: 'uploadingContainer',
        name: 'PackagePorting',
        state: '',
        data: 'end',
        isShow: false,
        content: ''
      });
      $('#zipload').val('');
    });
  }

  // 取消上传请求
  closeRequest() {
    this.uploadInfo.isShow = false;
    this.isCompress = false;
    sessionStorage.setItem('portingWorkloadMaximumTask', '0');
    const time = this.maximumTime || JSON.parse(sessionStorage.getItem('portingWorkloadTime'));
    clearTimeout(time);
    if (this.cancel) {
      this.cancel();
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
      const params = { path: 'package/' + path };
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
    this.displayAreaMatch = true;
    this.uploadResultTip.content = '';
    this.inputAreaMatch();
    this.areaMatchHeight = this.elementRef.nativeElement.querySelector('.areaMatch').offsetHeight;
  }
  blurAreaMatch() {
    if (this.cancelBlur) {
      this.displayAreaMatch = false;
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
    // 解决 IE 下点击后无法自动失焦情况
    this.elementRef.nativeElement.querySelector('.areaMatch').blur();
  }

  isDeleteAreaMatch(value: any) {
    this.deleteValue = value;
    this.fileNameDelete = this.i18nService.I18nReplace(
      this.i18n.analysis_center.exit.delete_file_content, { 1 : value});
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
      path: 'package',
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
      const type = this.commonService.handleStatus(data) === 0 ? 'success' : 'warn';
      const content = this.currLang === 'zh-cn' ? data.infochinese : data.info;
      sessionStorage.removeItem('packagePortingPathName');
      this.mytip.alertInfo({ type, content, time: 5000 });
      this.inputAreaMatch();
    });
  }
  closeMaskExit() {
    this.exitMask.Close();
    $('#zipload').val('');
  }
  closeMaskSaveAs() {
    this.saveasMask.Close();
    $('#zipload').val('');
  }
  uploadAgain(choice: any) {
    if (choice === 'override') {
      this.uploadFile(choice);
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
    this.uploadFile(choice);
  }
  getTaskUndone() {
    this.Axios.axios.get('/task/progress/?task_type=7').then((resp: any) => {
      if (!resp.data) { return; }
      if (this.commonService.handleStatus(resp) === 0 && resp.data.task_name) {
        this.msgService.sendMessage({
          type: 'creatingTask',
          data: {
            id: resp.data.task_name,
            type: 'PackagePorting'
          }
        });
      }
    });
  }

  /**
   *
   * @param item 点击行详情
   * @param type 下载类型
   */
  download(item: any, type: string) {
    if (type === 'csv') {
      this.downloadReportAsCvs(item);
    } else {
      this.getReportDetail(item);
    }
  }

  // 前往文件大小超过限制的联机帮助
  goFileHelp() {
    this.commonService.goHelp('file');
  }

  // 获取历史报告详情数据
  getReportDetail(item: any) {
    this.softwareMigrationReportApi.getReport(encodeURIComponent(item.id)).then((resp: any) => {
      if (this.commonService.handleStatus(resp) === 0) {
        const reportData = this.softwareMigrationService.handleReportDate(resp.data.result);
        this.textForm1 = reportData.textForm1;
        this.soFilesTotal = reportData.soFilesTotal;
        this.soFilesNeed = reportData.soFilesNeed;
        this.soFilesUse = reportData.soFilesUse;
        this.portingLevelList = reportData.list;

        // 版本问题规避部分字段
        this.binDetailSrcData.data = this.portingLevelList;
        this.downloadReportAsHtml(item);
      } else {
        const content = this.currLang === 'zh-cn' ? resp.infochinese : resp.info;
        this.mytip.alertInfo({ type: 'error', content, time: 5000 });
      }
    });
  }

  // 下载 csv 报告
  downloadReportAsCvs(item: any) {
    this.showTipInstruct(item);
    this.reportService.downloadCSV(item.id);
  }

  // 下载 html 报告
  downloadReportAsHtml(item: any) {
    this.report.id = item.id;
    this.showTipInstruct(item);
    this.softwareMigrationReportApi.downloadHTML(item.id).then((resp: any) => {
      if (this.commonService.handleStatus(resp) === 0) {
        const iii = location.href.indexOf('#');
        const api = location.href.slice(0, iii);
        const image2 = `${api + './assets/img/header/arrow_bottom.svg'}`;
        const that = this;
        const getBase64 = this.commonService.getBase64;
        getBase64(image2).then(res => {
          this.imgBase2 = res;
          that.download2Html();
        });
      }
    });
  }

  // 控制 下发指令 tip显示或隐藏
  showTipInstruct(item: any) {
    if (!item.showTip) {
      item.showTip = true;
      window.setTimeout(() => {
        item.showTip = false;
      }, 3000);
    }
  }

  download2Html() {
    const settingRightInfo = {
      top: [
        {
          title: this.i18n.common_term_report_level0_desc,
          value: this.soFilesUse
        },
        {
          title: this.i18n.common_term_report_level2_desc,
          value: this.soFilesNeed
        },
        {
          title: this.i18n.common_term_name_total,
          value: this.soFilesTotal
        }
      ]
    };
    // 先把要合并的数据处理好再下载
    this.binDetailSrcData.data.forEach(item => {
        if (item.soFileHasUrl) {
            this.softwareMigrationService.mergeSoInfoList(item.soInfoList, ['urlName', 'oper', 'result']);
        }
    });
    const content = this.reportService.downloadTemplete(
      'softwareEvaluation',
      this.commonService.formatCreatedId(this.report.id),
      this.textForm1,
      settingRightInfo,
      this.scanItems,
      this.binDetailSrcData.data,
      this.imgBase2
    );
    this.reportService.downloadReportHTML(content, this.report.id + '.html');
  }

  checkAnalyzeForm() {
    this.noFileSelected = false;
    if (this.inputItems.types.radioList[0].checked && !this.pathlist.length && !this.inputItems.path.value) { // 空校验
        this.noFileSelected = true;
    } else if (this.inputItems.types.radioList[1].checked && !this.inputItems.x86Path.value) {
      this.elementRef.nativeElement.querySelector('#x86InstallPath').focus();
      this.elementRef.nativeElement.querySelector('#x86InstallPath').blur();
    } else if (this.inputItems.types.radioList[0].checked && !this.maxFilenameLength.valid) { // 输入长度校验
      return;
    } else if (this.inputItems.types.radioList[1].checked && !this.maxPathLengthX86.valid) {
      return;
    } else {
      this.createReport();
    }
  }
  public createReport(): void {
    this.uploadResultTip.content = '';
    if (this.inputItems.types.radioList[1].checked && !this.inputItems.x86Path.value) {
      const text = this.elementRef.nativeElement.querySelector('.installed-path');
      text.focus();
      return;
    }
    if (!this.canAnalysis || this.createBtnDisabled) { return; }
    let packpath = '';
    if (this.inputItems.types.radioList[0].checked) {
      packpath = this.userPath;
      let inputPath = this.inputItems.path.value.trim();
      if (inputPath) {
        if (inputPath.search(',') === -1) {
          inputPath = inputPath.replace(/(^\s*)|(\s*$)/g, '').replace(/[\r\n]/g, '');
          if (inputPath.charAt(inputPath.length - 1) === '/') {
            inputPath = inputPath.slice(0, -1);
          }
          packpath = `${this.userPath}${inputPath}`;
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
            packpath = `${this.userPath}${values[0]}`;
          }
          for (let j = 1; j <= values.length; j++) {
            if (values[j]) {
              values[j] = values[j].replace(/(^\s*)|(\s*$)/g, '').replace(/[\r\n]/g, '');
              if (values[j].charAt(values[j].length - 1) === '/') {
                values[j] = values[j].slice(0, -1);
              }
              packpath += `,${this.userPath}${values[j]}`;
            }
          }
        }
      }
    }
    const params = {
      packpath,
      instpath: this.inputItems.types.radioList[1].checked ? this.inputItems.x86Path.value : '',
      targetos: this.inputItems.targetOs.selected.label,
      targetkernel: this.inputItems.version.value
    };
    this.portingWorkloadApi.analysePackage(params).then((resp: any) => {
      if (resp.data.id && this.commonService.handleStatus(resp) === 0) {
        this.reportId = resp.data.id;
        this.msgService.sendMessage({
          type: 'creatingTask',
          data: {
            id: this.reportId,
            type: 'PackagePorting'
          }
        });
      } else {
        this.inputItems.path.value = '';
        const content = this.currLang === 'zh-cn' ? resp.infochinese : resp.info;
        this.createBtnDisabled = true;
        const resultMsg = {
          id: this.reportId,
          type: 'PackagePorting',
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
    });
  }

  public checkChange(event: any) {
    const checkedList = this.inputItems.types.radioList.filter((item: any) => item.checked);
    this.canAnalysis = checkedList.length !== 0;
  }

  public osSelectChange(event: any) {
    this.inputItems.version.value = event.kernel_default;
  }

  /**
   * 鼠标选中下拉框，获取目标操作系统
   */
   public onBeforeOpen(selectComp: TiSelectComponent): void {
    this.Axios.axios.get('/portadv/tasks/systeminfo/').then((resp: any) => {
      this.getOSList(resp, false);
    }).catch(() => {
      selectComp.close();
      return;
    });
    // 打开下拉框
    selectComp.open();

    // 设置下拉框滚动条位置
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

  deleteReport(id: any) {
    this.miniModalServe.open({
      type: 'warn',
      content: {
        title: this.i18n.common_term_history_report_del_title ,
        body: this.i18n.common_term_history_report_del_tip2
      },
      close: (): void => {
        this.Axios.axios.delete(`/portadv/binary/report/${encodeURIComponent(id)}/`).then((data: any) => {
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
    let modalClass = 'modal400';
    modalClass = 'modal400' + (this.currLang === 'en-us' ? ' modalEn400' : '');
    this.miniModalServe.open({
      type: 'warn',
      content: {
        title: this.i18n.common_term_history_report_del_title ,
        body: this.i18n.common_term_all_history_tip2
      },
      close: (): void => {
        this.Axios.axios.delete(`/portadv/binary/`).then((data: any) => {
          const content = this.currLang === 'zh-cn' ? data.infochinese : data.info;
          if (this.commonService.handleStatus(data) === 0) {
            this.getHistoryReport();
            this.mytip.alertInfo({ type: 'success', content, time: 5000 });
          }
        });
      },
      dismiss: () => { }
    });
  }
  getHistoryReport() {
    this.Axios.axios.get('/portadv/binary/').then((resp: any) => {
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
      }
    });
  }

  /**
   * 目标操作系统接口请求
   * @param isFirst 是否是第一次请求
   */
  private querySystemInfo() {
    this.Axios.axios.get('/portadv/tasks/systeminfo/').then((resp: any) => {
      this.getOSList(resp, true);
    });
  }

  /**
   * 获取目标操作系统
   * @param resp 返回的数据
   * @param isFirst 是否是第一次请求
   */
  private getOSList(resp: any, isFirst: boolean) {
    this.inputItems.targetOs.options = [];
    if (this.commonService.handleStatus(resp) === 0) {
        resp.data.os_system_list.forEach((item: any, idx: any) => {
          this.inputItems.targetOs.options.push({
            label: item.os_system,
            id: idx,
            kernel_default: item.kernel_default,
            gcc_default: item.gcc_default
          });
        });
        this.inputItems.targetOs.options = this.optionsSort(this.inputItems.targetOs.options);
        let OSDefault: any;
        if (isFirst || this.inputItems.targetOs.selected.label === '') {  // 进入页面首次请求显示默认操作系统
          OSDefault = this.inputItems.targetOs.options.find((os: any) => os.label.replace(/\s*/g, '') === DEFAULT_OS);
        } else {  // 点击下拉框发送的请求，显示上一次选择的目标系统
          this.currSelectOS = {...this.inputItems.targetOs.selected};  // 保存之前选择的目标系统
          OSDefault = this.inputItems.targetOs.options.find((os: any) => {
            return os.label === this.currSelectOS.label;
          });
        }
        if (OSDefault) {  // 显示默认系统或当前选择的系统
          this.inputItems.targetOs.selected = OSDefault;
          this.inputItems.version.value = OSDefault.kernel_default;
        } else {  // 显示返回的第一个目标系统
          this.inputItems.targetOs.selected = this.inputItems.targetOs.options[0];
          this.inputItems.version.value = this.inputItems.targetOs.options[0].kernel_default;
        }
    } else if (resp.status === '0x050110') {  // 获取依赖字典失败
      const message = this.currLang === LanguageType.ZH_CN ? resp.infochinese : resp.info;
      this.mytip.alertInfo({ type: 'error', content: message, time: 10000 });
      this.inputItems.targetOs.selected = {
        label: '',
        id: ''
      };
      this.inputItems.version.value = '';
    }
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

  private queryUserPath() {
    this.Axios.axios.get(`/customize/`).then((resp: any) => {
      if (this.commonService.handleStatus(resp) === 0) {
        this.userPathFix = `${resp.data.customize_path}/portadv/${sessionStorage.getItem('username')}`;
        this.userPath = `${this.userPathFix}/package/`;
        this.inputItems.path.placeholder = this.i18nService.I18nReplace(
          this.i18n.porting_workload_label.path_package_placeholder3,
          {1 : this.userPath}
        );
      }
    });
  }

  private isIEPlatform() {
    this.Axios.axios.get('portadv/tasks/platform/').then((resp: any) => {
      sessionStorage.setItem('isCheck', JSON.stringify(this.commonService.handleStatus(resp) === 0));
      this.inputItems.types.radioList[1].disable = this.commonService.handleStatus(resp) !== 0;
    });
  }

  private formatCreatedId(data: any) {
    const years = data.slice(0, 4);
    const months = data.slice(4, 6);
    const days = data.slice(6, 8);
    const hours = data.slice(8, 10);
    const minutes = data.slice(10, 12);
    const seconds = data.slice(12, 14);
    return `${years}/${months}/${days} ${hours}:${minutes}:${seconds}`;
  }
  // 改变 history 报告图标
  public changeHistoryImgSrc(num: number, bool: boolean, item: any): void {
    if ( !num ) {
      item.imgSrc[num] = !bool ? './assets/img/home/download_hover.svg' : './assets/img/home/download.svg';
    } else {
      item.imgSrc[num] = !bool ? './assets/img/home/delete_hover.svg' : './assets/img/home/delete.svg';
    }
  }

}
