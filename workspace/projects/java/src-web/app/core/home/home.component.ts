import {
  Component, OnInit, ElementRef, ViewChild, OnDestroy,
  AfterContentInit, AfterViewInit, SecurityContext, Renderer2
} from '@angular/core';
import {
  TiMessageService, TiTableComponent, TiTableDataState,
  TiUploadService, TiUploadRef, TiUploadConfig,
  TiFileInfo, TiPaginationEvent
} from '@cloud/tiny3';
import { TiValidationConfig } from '@cloud/tiny3';
import { TiFileItem, Util } from '@cloud/tiny3';
import { Router } from '@angular/router';
import { AxiosService } from 'projects/java/src-web/app/service/axios.service';
import { SpinnerBlurDefaultInfo } from 'projects/java/src-com/app/utils/spinner-info.type';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors
} from '@angular/forms';
import { TiValidators } from '@cloud/tiny3';
import { MytipService } from 'projects/java/src-web/app/service/mytip.service';
import { I18nService } from 'projects/java/src-web/app/service/i18n.service';
import { MessageService } from 'projects/java/src-web/app/service/message.service';
import { StompService } from 'projects/java/src-web/app/service/stomp.service';
import { ProfileDownloadService } from 'projects/java/src-web/app/service/profile-download.service';
import { UserGuideService } from 'projects/java/src-web/app/service/user-guide.service';
import { LibService, disableCtrlZ } from 'projects/java/src-web/app/service/lib.service';
import { ProfileCreateService } from 'projects/java/src-web/app/service/profile-create.service';
import { Subscription } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { isIE11 } from '../../util';
import { ValidatorUtil, StateUtil } from './util';
import { HomeHttpService } from './service';
import { IUserLabel } from './domain';
import { RegularVerify } from 'projects/java/src-com/app/utils/regular-verify';

const hardUrl: any = require('projects/java/src-web/assets/hard-coding/url.json');

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy, AfterContentInit, AfterViewInit {
  constructor(
    public uploaderService: TiUploadService,
    public tiMessage: TiMessageService,
    private elementRef: ElementRef,
    public router: Router,
    public Axios: AxiosService,
    public fb: FormBuilder,
    public mytip: MytipService,
    public i18nService: I18nService,
    private msgService: MessageService,
    private stompService: StompService,
    public downloadService: ProfileDownloadService,
    public userGuide: UserGuideService,
    public libService: LibService,
    public createProServise: ProfileCreateService,
    public domSanitizer: DomSanitizer,
    private renderer2: Renderer2,
    private homeHttpServe: HomeHttpService,
    public stateUtil: StateUtil,
    public regularVerify: RegularVerify,
  ) {
    this.i18n = this.i18nService.I18n();
    this.isIE = isIE11();
    this.kunpengNoviceGrowthUrl = hardUrl.kunpengNoviceGrowthUrl;
    this.kunpengNoviceGrowthUrlEn = hardUrl.kunpengNoviceGrowthUrlEn;
    this.kunpengjavaIntroductionUrl = hardUrl.kunpengjavaIntroductionUrl;
    this.kunpengUrl = hardUrl.kunpengUrl;
    this.kunpenExpertUrl = hardUrl.kunpenExpertUrl;
    this.kunpengadviceUrl = hardUrl.hikunpengUrl;
    this.documentUrlEn = hardUrl.documentUrlEn;
    this.newsUrlEn = hardUrl.newsUrlEn;
    this.validation2.errorMessage.required = this.i18n.validata.req;
    this.addFormGroup = fb.group({
      add_ip: new FormControl('', ValidatorUtil.checkIp(this.i18n.validata.ip_req)),
      add_port: new FormControl('', ValidatorUtil.checkPort(this.i18n.validata.port_req)),
      add_uname: new FormControl('', ValidatorUtil.guarNameValid(this.i18n.validata)),
      add_upwd: new FormControl('', ValidatorUtil.password(this.i18n.newHeader.validata.oldPwd_rule)),
    });

    this.sampleFormGroup = fb.group({
      sampling_duration: new FormControl(60, {
        validators: [
          TiValidators.required,
          TiValidators.minValue(1),
          TiValidators.maxValue(300),
        ],
        updateOn: 'change',
      }),
      sampling_method: new FormControl(1, {
        validators: [
          TiValidators.required,
          TiValidators.minValue(1),
          TiValidators.maxValue(1000),
        ],
        updateOn: 'change',
      }),
      sampling_nativeMethod: new FormControl(1, {
        validators: [
          TiValidators.required,
          TiValidators.minValue(1),
          TiValidators.maxValue(1000),
        ],
        updateOn: 'change',
      }),
      sampling_interval: new FormControl(1, {
        validators: [
          TiValidators.required,
          TiValidators.minValue(1),
          TiValidators.maxValue(300),
        ],
        updateOn: 'change',
      }),
      sampling_fileIO: new FormControl(1, {
        validators: [
          TiValidators.required,
          TiValidators.minValue(1),
          TiValidators.maxValue(1000),
        ],
        updateOn: 'change',
      }),
      sampling_socketIO: new FormControl(1, {
        validators: [
          TiValidators.required,
          TiValidators.minValue(1),
          TiValidators.maxValue(1000),
        ],
        updateOn: 'change',
      }),
    });
    this.deleteFormGroup = fb.group({
      delete_uname: new FormControl('', ValidatorUtil.deleteUserCheck(this.i18n.newHeader.validata.name_req)),
    });
    this.editFormGroup = fb.group({
      add_name: new FormControl('', []),
      add_ip: new FormControl('', [TiValidators.required]),
      add_uname: new FormControl('', ValidatorUtil.guarNameValid(this.i18n.validata)),
      add_upwd: new FormControl('', ValidatorUtil.password(this.i18n.newHeader.validata.oldPwd_rule)),
      add_port: new FormControl('', []),
    });
    this.searchOptions = [
      {
        label: 'searchJavaProcess',
        value: 'searchJavaProcess'
      },
    ];
  }
  public uploader: TiUploadRef;
  public threaddumpUploader: TiUploadRef;
  public heapdumpUploader: TiUploadRef;
  public gcLogUploader: TiUploadRef;
  public changeIndex: any = 0;
  public ipdisabled: any = false;

  @ViewChild('samplingModal') sampModal: any;
  @ViewChild('addModal') addModal: any;
  @ViewChild('editModal') editModal: any;
  @ViewChild('addPromptModal') addPromptModal: any;
  @ViewChild('deletePromptModal') deletePromptModal: any;
  @ViewChild('forceDeleteModal') forceDeleteModal: any;
  @ViewChild('stopProfilingModal') stopProfilingModal: any;
  @ViewChild('stopProfilingBth') stopProfilingBth: any;
  @ViewChild('manuaDeleteModal') manuaDeleteModal: any;
  @ViewChild('recordDeleteModal') recordDeleteModal: any;
  @ViewChild('importProfilingModal') importProfilingModal: any;
  @ViewChild('statement') statement: any;
  @ViewChild('dataLimit') dataLimit: any;
  @ViewChild('ensureRoot') ensureRoot: any;
  @ViewChild('container') private containerRef: ElementRef;
  @ViewChild('table', { static: false }) table: TiTableComponent;
  @ViewChild('searchBox', { static: false }) searchBox: any;
  @ViewChild('importModul') importModul: any;
  @ViewChild('heapdumpDeleteModal') heapdumpDeleteModal: any;
  @ViewChild('threadDumpDeleteModal') threadDumpDeleteModal: any;
  @ViewChild('gcLogDeleteModal') gcLogDeleteModal: any;
  @ViewChild('errorAlert', { static: false }) errorAlert: any;

  public language = sessionStorage.getItem('language');
  public isIE: boolean;
  public kunpengNoviceGrowthUrl: any;
  public kunpengNoviceGrowthUrlEn: any;
  public kunpengjavaIntroductionUrl: any;
  public kunpengUrl: any;
  public kunpenExpertUrl: any;
  public kunpengadviceUrl: any;
  public documentUrlEn: any;
  public newsUrlEn: any;
  public refreshSub: Subscription;
  private sampeUploadConfig: TiUploadConfig;
  private heapdumpUploadConfig: TiUploadConfig;
  private threaddumpUploadConfig: TiUploadConfig;
  private gcLogUploadConfig: TiUploadConfig;
  public currentProfilingGuardianId: string;
  public currentProfilingJvmId: string;
  public userRole: string;
  public userId: string;
  public currentUser: string;
  public currentLang: string;
  public stompClient: any;
  public topicUrl = ''; // ws????????????GET?????????URL
  public validation: TiValidationConfig = {};
  public validation2: TiValidationConfig = {
    type: 'blur',
    errorMessage: {},
  };
  public userPwd: FormGroup;
  public sampleForms: FormGroup;
  public userInfo = {
    role: '',
    id: '',
  };
  public label: IUserLabel;
  public recordListTips = false;
  public recordListMaxTips = false;
  public closeTips = false;
  public isOwnerGuardian = false;
  public isConnect = true;
  public lowerVersinJvm = false;
  i18n: any;
  public isCreating = false;
  public leftContainerWidth: number;
  public isNoGuardians = false;
  public editBtnDisabled = false;
  public guardianList: any = [];
  public originGuardianList: any = [];
  public currentSelGuardian: any = {};
  public currentSelectJvm: any = {};
  public recordGuardian: any = {};
  public recordJvm: any = {};
  public deletePwdInput = ''; // ?????????????????????????????????
  public deleteUsernameInput = '';
  public guardianJvms: Array<any> = [];
  public containerProcessJvms: Array<any> = [];
  public recordList: Array<any> = [];
  public recordData: any = {};
  public recordingItems: any = {};
  public selRecording: any = {};
  public ProfilingList: Array<any> = [];
  public sampleBtnTip = '';
  public profileBtnTip = '';
  public sampleIntervalTip = '';
  public onlyhascontainer: any = false;  // ??????????????????????????????
  // sampling??????
  public sampleFormGroup: FormGroup;
  public sampModalForms = {
    name: {
      label: 'Record Name',
      value: '',
      required: true,
    },
    recordDur: {
      label: 'Record Duration(sec)',
      max: 300,
      min: 1,
      value: 60,
      rangeValue: [1, 300],
      format: 'N0',
      required: true,
      disabled: false,
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
      value: 10,
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
    socketIoSampleThred: {
      label: 'fileIoSample',
      max: 1000,
      min: 1,
      value: 10,
      rangeValue: [1, 1000],
      format: 'N0',
      required: true,
      disabled: false,
    },
    leakSample: {
      state: true,
      label: 'leakSample',
      required: false
    }
  };
  // add guardian
  public addFormGroup: FormGroup;
  public editFormGroup: FormGroup;
  public tipJvm = '';
  public deleteFormGroup: FormGroup;
  public addModalForms = {
    selected: {
      label: 'Manually stop',
      value: false,
      required: true,
    },
    ip: {
      label: 'IP',
      value: '',
      required: true,
    },
    port: {
      label: 'Port',
      value: '22',
      required: true,
      format: 'N0',
      max: 65535,
      min: 0,
    },
    uname: {
      label: 'User Name',
      value: '',
      required: true,
    },
    uPwd: {
      label: 'Password',
      value: '',
      required: true,
    },
  };
  public guardianTabs: any = [];
  public guardianAddip: any;
  public guardianAdd = {
    ip: {
      label: 'IP',
      value: '',
      required: true,
    },
    uname: {
      label: 'User Name',
      value: '',
      required: true,
    },
    uPwd: {
      label: 'Password',
      value: '',
      required: true,
    },
    port: {
      label: 'Port',
      value: '22',
      required: true,
      format: 'N0',
      max: 65535,
      min: 0,
    },
  };
  public userCheckedAll = {
    title: '',
    id: 'all',
    checked: true,
  };
  public userList: any = [];
  public progressData: any = {};
  public isAlermOpt = false; // ?????????????????????
  public isAlermDisk = false; // 30G??????????????????
  public progressContext: any = {};
  private diskStateTimer: any = null;
  private curDelRecord: any = {};
  public searchJvms: any = [];

  public guardianTimer: any = null;
  public recordsTimer: any = null;

  private firstJvmId = '';
  private fingerprint = '';
  public hoverBtnTip: '';

  // ??????sampling??????????????????
  public uploadStatus: any = {
    fileName: '',
    fileSizeWithUnit: '',
    uploadUrl: '',
    showUploadTips: false,
    uploadError: false,
    header: {},
    title: '',
    errMsg: '',
    isUploading: false,
    type: '',
    index: '',
  };
  public toggleState: any = 'true';
  public uploadListState: any = true;
  public uploadListToggle: any = false;
  public currentPage: any = 1;
  public totalNumber: any = 0;
  public pageSize: { options: Array<number>, size: number } = {
    options: [10, 20, 50, 100],
    size: 10
  };
  public defaultPageSize: any = 10;
  public currentJvms: any = [];
  public primaryJvms: any = [];
  public tempprimaryJvms: any = [];
  public containerJvms: any = [];
  public allPromaryJvms: any = [];
  public allContainerJvms: any = [];

  public saveJvmVersionInfo: any = [];
  public showLink: any;
  public showProfilingTip: any = false;
  public content: any;
  public heapdumpContent: any;
  public cancelBtn: any = false; // ?????????????????? ????????????????????????
  public newGuardianName = ''; // ?????? Guardian ?????????
  public userGuideTimer: any = null; // ???????????? timer

  public currentHover: any;
  public showFilter: any = false;
  public reportList = false;
  public maxReport = false;
  public minJFRCount = 0;
  public maxJFRCount = 0;
  public containerTip = '';
  public validation1: TiValidationConfig = {
    type: 'blur',
    errorMessage: {},
  };
  public confirmBtn = true;
  public hoverIcon1 = false;
  public hoverIcon2 = false;
  public hoverIcon3 = false;
  public saveJvmWarnInfo: any = [];
  public leftState = false;
  public guardianStatusTip: any = '';
  public isRoot = false;

  // ????????????
  public searchWords: Array<string> = [];
  public searchKeys: Array<string> = ['name', 'lvmid'];
  public searchOptions: any = [];
  public searchIndex = 0;
  public searchJvmList: any = [];
  public searchValue = '';

  // ????????????
  public hoverClose = '';
  public rightProfileTab: any = {
    active: true,
  };
  public rightSampleTab: any = {
    active: false,
  };
  public rightReportTab: any = {
    active: false,
  };
  public threadDumpReportTab: any = {
    active: true,
  };
  public heapDumpReportTab: any = {
    active: false,
  };
  public gcLogReportTab: any = {
    active: false,
  };
  // ????????????
  public threaddumpList: Array<any> = [];
  public threaddumpWarn = false; // ?????????????????????????????????
  public threaddumpHint = false; // ?????????????????????????????????
  public threaddumpWarnTip: string;
  public threaddumpHintTip: string;
  public threadDumpDeleteId: string;
  public threadDumpCurImportReports: Array<any> = [];
  public threadDumpContent: any;
  // ????????????
  public heapdumpList: Array<any> = [];
  public optionsImportType: Array<any> = [];
  public optionsSaveReportType: Array<any> = [];
  public optionsUserType: Array<any> = [];
  public moduleSampleUserType: any;
  public moduleReportUserType: any;
  public moduleImportType: any;
  public moduleSaveReportType: any;
  public imoprtType: any;
  public offlineReportHeapdumpList: Array<any> = [];
  public heapdumpDeleteId: string;
  public heapdumpWarn = false; // ?????????????????????????????????
  public heapdumpHint = false; // ?????????????????????????????????
  public rightTag: string; // ??????????????????tab
  public heapdumpWarnTip: string;
  public heapdumpHintTip: string;
  public heapDumpCurImportReports: Array<any> = [];

  // gcLog
  public gcLogList: Array<any> = [];
  public gcLogWarn = false; // ?????????????????????????????????
  public gcLogHint = false; // ?????????????????????????????????
  public gcLogWarnTip: string;
  public gcLogHintTip: string;
  public gcLogDeleteId: string;
  public gcLogCurImportReports: Array<any> = [];
  public gcLogContent: any;
  // ??????????????????gc????????????
  public curUserThreaddumpNum = 0;
  public curUserHeapdumpNum = 0;
  public curUserGcLogNum = 0;

  // ?????????????????????
  public importWarnTip = false;
  public saveReportTip: string;
  public reportOkBtDisabled = false;
  public reportTypeDisabled = false;
  public diskRemain = 0; // ??????????????????
  public workRemain = 0; // ??????????????????
  public importTipText: string;
  public importAllData: any = [];
  public showImportList = false;

  public javaMethodBlur: SpinnerBlurDefaultInfo;
  public recordDurBlur: SpinnerBlurDefaultInfo;
  public nativeMethodBlur: SpinnerBlurDefaultInfo;
  public intervalBlur: SpinnerBlurDefaultInfo;
  public fileioBlur: SpinnerBlurDefaultInfo;
  public socketioBlur: SpinnerBlurDefaultInfo;


  ngOnInit() {
    this.heapdumpWarnTip = this.i18n.common_term_heapdump_warning;
    this.heapdumpHintTip = this.i18n.common_term_heapdump_hinting;
    this.threaddumpWarnTip = this.i18n.common_term_threaddump_warning;
    this.threaddumpHintTip = this.i18n.common_term_heapdump_hinting;
    this.importTipText = this.i18n.common_term_import;
    this.setSpinnerBlur();

    this.initGuardianTabs();

    this.optionsImportType = [
      { label: this.i18n.common_term_profiling, value: 'profile', disabled: false },
      { label: this.i18n.common_term_sampling, value: 'sample', disabled: false },
      { label: this.i18n.common_term_save_report, value: 'savedReport', disabled: false },
    ];
    this.optionsSaveReportType = [
      { label: this.i18n.common_term_thread_dump, value: 'threadDump', disabled: false },
      { label: this.i18n.common_term_memory_dump, value: 'memoryDump', disabled: false },
      { label: this.i18n.common_term_gc_log, value: 'GCLogs', disabled: false },
    ];
    this.moduleImportType = this.optionsImportType[0];
    this.moduleSaveReportType = this.optionsSaveReportType[0];
    this.userRole = sessionStorage.getItem('role');
    this.userId = sessionStorage.getItem('loginId');
    this.getHeapDumpLimit();
    this.getThreadDumpLimit();
    this.getGcLogLimit();
    this.getRightTab(this.downloadService.downloadItems.report.reportTab);
    if (this.userRole === 'Admin') {
      this.getUserList();
      this.threadDumpRequest(false, this.userId);
      this.heapdumpRequest(false, this.userId);
      this.gcLogRequest(false, this.userId);
      this.getAdminSamplingList(Number(this.userId));
    } else {
      this.threadDumpUserRequest();
      this.heapdumpUserRequest();
      this.gcLogUserRequest();
    }
    this.downloadService.downloadItems.report.threaddumpList = this.threaddumpList.length;
    this.downloadService.downloadItems.report.heapdumpList = this.heapdumpList.length;
    this.downloadService.downloadItems.report.gcLogList = this.gcLogList.length;
    if (!this.downloadService.homeFlag) {
      this.refreshGuardian();
    }
    this.refreshSub = this.msgService.getMessage().subscribe(msg => {
      if (msg.type === 'data') {
        if (msg.data.type === 'guardian') {
          this.queryGuardianList(false);
        }
        if (msg.data.type === 'disc') {
          this.queryDiskState();
        }
        if (msg.data.type === 'sampling') {
          this.getListNum();
          this.getReportNum();
        }
        if (msg.data.type === 'REMOVE_GUARDIAN') {
          this.mytip.alertInfo({
            type: 'warn',
            content: msg.data.message,
            time: 3000,
          });
        }
      }
      if (msg.type === 'deploystate') {
        this.guardianStatusTip = msg.data.message;
        for (const guardian of this.guardianList) {
          guardian.statusTip = guardian.physicalId === msg.data.guardianId ?
            msg.data.message : '';
        }
      }
      if (msg.state === 'ERROR' && msg.type === 'REMOVE_GUARDIAN') {
        this.isCreating = false;
        this.mytip.alertInfo({
          type: 'warn',
          content: msg.message,
          time: 3000,
        });
        this.getListNum();
        this.getReportNum();
      }
    });

    // ??????????????????????????????header?????????
    if (sessionStorage.getItem('toggleState') != null) {
      this.toggleState = sessionStorage.getItem('toggleState');
      if (this.toggleState === 'true') {
        $('.header').css({ background: 'transparent' });
      } else {
        $('.header').css({ background: '#061829' });
      }
    } else {
      this.toggleState = 'true';
    }

    // ?????????????????? banner ????????????
    if (sessionStorage.getItem('userGuidStatus-java-perf') === '0') {
      this.toggleState = 'true';
    }
    const isProStop = JSON.parse(sessionStorage.getItem('isProStop'));
    if (isProStop) {
      sessionStorage.removeItem('springBootToken');
      sessionStorage.removeItem('springBoot');
    }
    this.showLink = sessionStorage.getItem('language') === 'en-us' ? false : true;
    this.userCheckedAll.title = this.i18n.common_term_user_all;
    const token = sessionStorage.getItem('token');
    const language = sessionStorage.getItem('language');
    this.uploadStatus.header = {
      Authorization: token
    };
    this.uploadStatus.uploadUrl = `${this.Axios.axios.defaults.baseURL}records/actions/upload`;
    this.sampleIntervalTip = this.i18n.common_term_new_sampling_interval_tip;
    this.currentUser = sessionStorage.getItem('username');
    this.currentLang = sessionStorage.getItem('language');
    sessionStorage.setItem('isFirstGet', JSON.stringify(true));
    this.queryGuardianList(false);
    this.validation = {
      type: 'blur',
      errorMessage: {
        regExp: this.i18n.common_term_projiect_name_tip,
        required: this.i18n.validata.req,
      },
    };
    this.label = {
      Name: this.i18n.common_term_user_label.name,
      Role: this.i18n.common_term_user_label.role,
      Setpwd: this.i18n.common_term_operate_reset,
      Pwd: this.i18n.common_term_user_label.password,
      Cpwd: this.i18n.common_term_user_label.confirmPwd,
      oldPwd: this.i18n.common_term_user_label.oldPwd,
      newPwd: this.i18n.common_term_user_label.newPwd,
      changePwd: this.i18n.common_term_user_label.changePwd,
    };
    this.userPwd = new FormGroup({
      oldPwd: new FormControl('', [
        ValidatorUtil.oldPwd(this.i18n.validata.pwd_rule),
      ]),
      pwd: new FormControl('', [
        ValidatorUtil.password(this.i18n.validata.pwd_rule),
      ]),
      cpwd: new FormControl('', [this.userPwdConfirm]),
    });
    this.profileBtnTip = '';
    this.sampleBtnTip = '';
    this.saveJvmVersionInfo = this.downloadService.homeJvmVersion;
    // ??????sampling?????????????????? ??????????????????
    this.sampeUploadConfig = {
      url: `${this.Axios.axios.defaults.baseURL}records/actions/upload`,
      alias: 'file',
      headers: {
        Authorization: token,
        ['Accept-Language']: language
      },
      filters: [{
        name: 'maxSize',
        params: [262144000]// diskAfter   250
      }],
      onAddItemFailed: (fileObject: TiFileInfo, validResults: Array<string>): void => {
        const jfrSize = fileObject.size;
        const currentMaxSize = this.sampeUploadConfig.filters[0].params[0];
        if (jfrSize >= 262144000) {
          this.content = this.i18n.common_term_upload_size;
        } else {
          if (jfrSize >= this.workRemain) {
            this.content = this.i18n.common_term_upload_disk;
          }
        }
        if (this.content) {
          this.mytip.alertInfo({
            type: 'warn',
            content: this.content,
            time: 10000,
          });
        }
        this.importModul.close();
      },

      onAddItemSuccess: (fileItem: TiFileItem): void => {
        if (fileItem.file.size >= this.workRemain) {
          this.content = this.i18n.common_term_upload_disk;
          this.mytip.alertInfo({
            type: 'warn',
            content: this.content,
            time: 10000,
          });
          fileItem.remove();
          this.importModul.close();
          return;
        }
        if (fileItem.file.size >= this.diskRemain) {
          this.content = this.i18n.tip_msg.task_disk_error;
          this.mytip.alertInfo({
            type: 'warn',
            content: this.content,
            time: 10000,
          });
          fileItem.remove();
          this.importModul.close();
          return;
        }
        this.initUploadStatus('sampling');
        this.uploadStatus.uploadError = false;
        this.uploadStatus.errMsg = '';
        this.uploadStatus.fileName = fileItem.file.name;
        this.uploadStatus.sizeWithUnit = fileItem.file.sizeWithUnit;
        this.uploadStatus.title = `${this.uploadStatus.fileName} (${this.uploadStatus.sizeWithUnit}) `;
        this.uploadStatus.showUploadTips = true;
        this.uploadStatus.index = fileItem.index; // ????????????????????????
        let importDataArr = {};
        importDataArr = this.uploadStatus;
        this.importAllData.push(importDataArr);
        this.showImportList = true;
        this.importModul.close();
      },
      onCompleteItems: (fileItems: Array<TiFileItem>, response: string, status: number): void => {
        if (status === 0) {
          setTimeout(() => {
            this.setShowUploadTip(fileItems[0].file.name, fileItems[0].index);
          }, 3000);
        } else if (status === 200) {
          setTimeout(() => {
            this.setShowUploadTip(fileItems[0].file.name, fileItems[0].index);
          }, 3000);
          this.getListNum();
        } else {
          const res = JSON.parse(response);
          this.setuploadError(fileItems[0].file.name, fileItems[0].index, res.message);
        }
      },
    };
    this.uploader = this.uploaderService.create(this.sampeUploadConfig);
    this.importThreadDump();
    this.importHeapDump();
    this.importGCLog();
    this.getReportNum();
  }

  /**
   * ?????????table
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
   * ???????????????
   */
  public verifySpinnerValue(value: any) {
    this.regularVerify.setSpinnerDefaultInfo(value);
    if (this.sampleFormGroup.controls.sampling_interval.value >=
      this.sampleFormGroup.controls.sampling_duration.value && !this.sampModalForms.recordDur.disabled) {
      this.sampleFormGroup.controls.sampling_interval.setValue(
        this.sampleFormGroup.controls.sampling_duration.value);
    }
  }


  /**
   * ????????????????????????
   */
  public setSpinnerBlur() {
    this.recordDurBlur = {
      control: this.sampleFormGroup.controls.sampling_duration,
      min: 1,
      max: 300,
      defaultValue: 60,
    };
    this.javaMethodBlur = {
      control: this.sampleFormGroup.controls.sampling_method,
      min: 1,
      max: 1000,
      defaultValue: 1,
    };
    this.nativeMethodBlur = {
      control: this.sampleFormGroup.controls.sampling_nativeMethod,
      min: 1,
      max: 1000,
      defaultValue: 1,
    };
    this.intervalBlur = {
      control: this.sampleFormGroup.controls.sampling_interval,
      min: 1,
      max: 300,
      defaultValue: 1,
    };
    this.fileioBlur = {
      control: this.sampleFormGroup.controls.sampling_fileIO,
      min: 1,
      max: 1000,
      defaultValue: 1,
    };
    this.socketioBlur = {
      control: this.sampleFormGroup.controls.sampling_socketIO,
      min: 1,
      max: 1000,
      defaultValue: 1,
    };
  }


  public refreshGuardian() {
    const profileSubs: any = [
      '/user/queue/refresh/home/data',
      '/user/queue/guardians/deploystate',
      '/user/queue/guardian/errors'
    ];
    this.stompService.client(profileSubs);
    this.downloadService.homeFlag = true;
  }

  // ?????????????????????
  public initUploadStatus(uploadType: string) {
    this.uploadStatus = {
      fileName: '',
      fileSizeWithUnit: '',
      uploadUrl: '',
      showUploadTips: false,
      uploadError: false,
      header: {},
      title: '',
      errMsg: '',
      isUploading: false,
      type: uploadType,
      index: '',
    };
  }
  /**
   * ngAfterContentInit - ??????????????????????????????????????????????????????
   */
  ngAfterContentInit(): void {
    this.queryDisk();
    const that = this;
    if (this.toggleState === 'true') {
      $('.header').css({ background: 'transparent' });
      if (document.body.offsetHeight < 768) {
        $('.header').css({ background: '#040a15' });
      }
    } else {
      $('.header').css({ background: '#061829' });
    }
  }
  /**
   * ngAfterViewInit - ????????????????????????????????????????????????????????????????????????
   */
  ngAfterViewInit(): void {
    this.renderer2.listen(this.containerRef.nativeElement, 'scroll', () => {
      Util.trigger(document, 'tiScroll');
    });
    const flogin = sessionStorage.getItem('userGuidStatus-java-perf');
    if (flogin === '0') {
      this.cancelBtn = true;
    }
    if (this.toggleState === 'false') {
      $('.header').css({ background: '#061829' });
      $('.toggleSpan').css({ 'z-index': '101' });
    }
  }

  /**
   * ?????????????????????????????????
   * params index  tab??????
   */
  public activeChange(index: any) {
    this.changeIndex = index;
    this.guardianTabs[0].active = true;
    this.currentPage = 1;
    this.pageSize.size = 10;
    this.guardianTabs.forEach((tab: any, i: any) => {
      tab.active = i === this.changeIndex ? true : false;
    });
    if (this.searchValue) {
      this.searchEvent(this.searchValue);
    } else {
      this.queryGuardianList(true);
    }
  }
  /**
   * java??????????????????
   * params tiTable  tiny3??????????????????
   */
  public stateUpdate(tiTable: TiTableComponent): void {
    const dataState: TiTableDataState = tiTable.getDataState();
    this.currentPage = dataState.pagination.currentPage;
    this.pageSize.size = dataState.pagination.itemsPerPage;
    const start = (dataState.pagination.currentPage - 1) * 10;
    const end = (dataState.pagination.currentPage * dataState.pagination.itemsPerPage);
    if (!this.changeIndex) {
      this.currentJvms = this.primaryJvms.slice(start, end);
      this.totalNumber = this.primaryJvms.length;
    } else {
      this.currentJvms = this.containerJvms.slice(start, end);
      this.totalNumber = this.containerJvms.length;
    }
    // user-guide
    if (sessionStorage.getItem('userGuidStatus-java-perf') === '0') {
      this.setJvmsFlag();
    }
  }


  /**
   * ??????????????????????????? ??????????????????
   */
  public toggleTop() {
    this.toggleState = this.toggleState === 'false' ? 'true' : 'false';
    sessionStorage.setItem('toggleState', this.toggleState);
    if (this.toggleState === 'true') {
      $('.header').css({ background: 'transparent' });
      if (document.body.offsetHeight < 768) {
        $('.header').css({ background: '#040a15' });
      }
    }
    if (this.toggleState === 'false') {
      $('.header').css({ background: '#061829' });
      $('.toggleSpan').css({ 'z-index': '101' });
    }
  }
  /**
   * ??????sampling????????????????????????
   */
  toggleList() {
    this.uploadListState = !this.uploadListState;
    this.uploadListToggle = !this.uploadListToggle;
  }
  /**
   * ???????????????????????????????????????????????????????????????
   */
  importClick() {
    if (this.maxReport) { return; }
    const samImport = this.elementRef.nativeElement.querySelector('#samplingImport');
    samImport.click();
  }
  /**
   * sampling??????????????????
   */
  samplingExportData(recordId: any, name: any, idx: any) {
    this.creatDowmTip('sampleDown', idx);
    this.Axios.axios.get(`/records/actions/download/${encodeURIComponent(recordId)}`,
      { responseType: 'blob' }).then((resp: any) => {
        const blob = new Blob([resp], { type: 'application/octet-stream' });
        const fileName = this.setSamplingName(name);
        // ??????????????????IE
        if ('msSaveOrOpenBlob' in navigator) {
          window.navigator.msSaveBlob(blob, fileName);
        } else {
          const href = URL.createObjectURL(blob);
          const link: any = document.createElement('a');
          link.style.display = 'none';
          link.href = href;
          link.setAttribute('download', fileName);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      }).catch((error: any) => {
        const reader = new FileReader();
        reader.readAsText(error.response.data);
        reader.onload = (e) => {
          const msgObj = JSON.parse(reader.result as string);
          this.mytip.alertInfo({
            type: 'warn',
            content: msgObj.message,
            time: 10000,
          });
        };
      });
  }
  /**
   * ???????????????????????????
   */
  public queryDisk() {
    const load = sessionStorage.getItem('token');
    if (load) {
      this.queryDiskState();
    }
  }
  /**
   * ?????????????????? ???????????? ??????
   */
  private queryDiskState() {
    this.Axios.axios.get('/usage/disc').then((resp: any) => {
      const diskInfo = {
        diskTotal: resp.partitionTotalInMegabyte, // ????????????
        workTotal: resp.softNeededInMegabyte, // ????????????
        diskUsed: resp.partitionUsedInMegabyte, // ???????????????
        workUsed: resp.softUsedInMegabyte, // ???????????????
        alarmStatus: resp.alarmStatus,
        maxPrecent: resp.startAlarmThreshold,
        minPrecent: resp.cancelAlarmThreshold,
      };
      const maxSize = this.sampeUploadConfig.filters[0].params[0];
      const remain = (diskInfo.diskTotal - diskInfo.diskUsed) * 1024 * 1024;
      this.diskRemain = remain;
      this.workRemain = (diskInfo.workTotal - diskInfo.workUsed) * 1024 * 1024;
      const limitSize = remain > maxSize ? maxSize : remain;
      this.sampeUploadConfig.filters[0].params = [limitSize];
      this.showDisk(diskInfo);
    }, (error: any) => {
      if (this.diskStateTimer) { clearTimeout(this.diskStateTimer); }
      this.diskStateTimer = setTimeout(() => {
        this.queryDiskState();
      }, 10000);
    });
  }

  /**
   * ????????????????????????  ????????????????????????
   */
  private showDisk(data: any) {
    const progressData = { ...data };
    this.progressData.isShow = progressData.alarmStatus !== 0;
    this.progressData.label = this.i18n.disk_monitor.label;
    let colorState = '';
    const perDisk = parseFloat((progressData.diskUsed / progressData.diskTotal * 100).toFixed(2));
    const perWork = parseFloat((progressData.workUsed / progressData.workTotal * 100).toFixed(2));
    this.progressData.minVal = progressData.workTotal * (1 - (progressData.maxPrecent / 100)); // ???????????????95%
    this.progressData.maxVal = progressData.workTotal * (1 - (progressData.minPrecent / 100)); // ??????????????????(???????????????80%)
    this.progressData.recommand = Math.ceil(this.progressData.maxVal / 1024);
    this.isAlermDisk = (progressData.workTotal - progressData.workUsed) <= 0;
    if (progressData.alarmStatus === 1 || progressData.alarmStatus === 3) {
      this.progressData.id = 'work';
      this.progressData.remain = progressData.workTotal - progressData.workUsed;
      if (this.progressData.remain > 0) {
        if (this.progressData.remain >= 1024) {
          this.progressData.value = `${parseFloat((this.progressData.remain / 1024).toFixed(2))}GB`;
        } else {
          if (this.progressData.remain <= 100) {
            this.downloadService.downloadItems.diskAlarm = true;
          }
          this.progressData.value = `${this.progressData.remain}MB`;
        }
      } else {
        this.progressData.value = '0 MB';
      }
      this.progressData.percent = perWork < 100 ? perWork : 100;
      colorState = this.colorFormat(this.progressData.remain, this.progressData.minVal, this.progressData.maxVal);
      this.progressContext.tipContents = [
        {
          label: this.i18n.disk_monitor.workspace,
          value: `${parseInt((progressData.workTotal / 1024).toFixed(), 10)}GB`,
          color: '#fff'
        },
        {
          label: this.i18n.disk_monitor.remain,
          value: this.progressData.value,
          color: colorState
        },
        {
          label: this.i18n.disk_monitor.recommend,
          value: `${this.progressData.recommand}GB`,
          color: '#fff'
        }
      ];
      this.progressContext.suggestion = this.i18n.disk_monitor.workspace_full_tip;
      this.sampleBtnTip = this.i18n.disk_monitor.sample_opt_tip;
      return;
    }
    if (progressData.alarmStatus === 2) {
      this.progressData.id = 'disk';
      this.progressData.percent = perDisk < 100 ? perDisk : 100;
      this.progressData.remain = progressData.diskTotal - progressData.diskUsed;
      if (this.progressData.remain > 0) {
        if (this.progressData.remain >= 1024) {
          this.progressData.value = `${parseFloat((this.progressData.remain / 1024).toFixed(2))}GB`;
        } else {
          this.progressData.value = `${this.progressData.remain}MB`;
        }
      } else {
        this.progressData.value = '0 MB';
      }
      this.isAlermOpt = this.progressData.remain <= 100 ? true : false;
      this.importTipText = this.i18n.common_term_import;
      if (this.progressData.remain <= 100) {
        this.downloadService.downloadItems.diskAlarm = true;
      }
      colorState = this.colorFormat(this.progressData.remain, this.progressData.minVal, this.progressData.maxVal);
      this.progressContext.tipContents = [
        {
          label: this.i18n.disk_monitor.disk,
          value: `${parseInt((progressData.diskTotal / 1024).toFixed(), 10)}GB`,
          color: '#fff'
        },
        {
          label: this.i18n.disk_monitor.disk_remain,
          value: this.progressData.value,
          color: colorState
        },
        {
          label: this.i18n.disk_monitor.recommend,
          value: `${this.progressData.recommand}GB`,
          color: '#fff'
        }
      ];
      this.progressContext.suggestion = this.i18n.disk_monitor.disk_full_tip;
      this.sampleBtnTip = this.i18n.disk_monitor.sample_opt_tip_disk;
      this.profileBtnTip = this.i18n.disk_monitor.sample_opt_tip_disk;
    }
  }

  /**
   * ????????????????????????????????????
   * params val  ??????????????????
   * params min  1 - ???????????????95%
   * params max  1 - ??????????????????(???????????????80%)
   */
  private colorFormat(val: any, min: any, max: any) {
    let color = '';
    if (val >= min && val <= max) { color = '#fdca5a'; }
    else if (val <= min) { color = '#f45c5e'; }
    else { color = '#7adfa0'; }
    return color;
  }

  /**
   * ??????profiling??????
   */
  public createProfiling(jvm: any) {
    sessionStorage.removeItem('dumpState');
    sessionStorage.removeItem('gcLogState');
    this.currentSelectJvm = jvm;
    if (
      this.currentSelGuardian.state !== 'CONNECTED' ||
      this.currentSelectJvm.profileState === 'PROFILING' ||
      this.currentSelectJvm.profileState === 'RECORDING' ||
      !this.guardianList.length ||
      this.currentSelectJvm.statusCode ||
      this.isAlermOpt
    ) {
      return;
    }
    if (this.currentSelGuardian.owner.username !== this.currentUser) { return; }
    sessionStorage.setItem('jvmId', this.currentSelectJvm.id);
    // ?????????????????????????????????profiling??????
    if (this.ProfilingList.length) {
      // user-guide ??????????????????????????? profiling ??????
      if (sessionStorage.getItem('userGuidStatus-java-perf') === '0') {
        sessionStorage.setItem('javaStep', '5');
        this.confirmStopProfiling(true);
        return;
      }
      this.stopProfilingModal.type = 'warn';
      this.stopProfilingModal.alert_show();
      this.stopProfilingModal.title = this.i18n.common_term_has_profiling_stop_tip;
      this.stopProfilingModal.alertTitle = this.i18n.common_term_has_profiling_stop_title1;
      this.stopProfilingModal.content = this.i18n.common_term_has_profiling_stop_content1;
      this.stopProfilingModal.deleteStatu = true;
      sessionStorage.setItem('currentSelectJvm', `${this.currentSelectJvm.name}(${this.currentSelectJvm.lvmid})`);
    } else {
      const jvmId = this.currentSelectJvm.id;
      const guardianId = this.currentSelGuardian.id;
      // user-guide
      if (sessionStorage.getItem('userGuidStatus-java-perf') === '0') {
        sessionStorage.setItem('javaStep', '5');
      }
      // ????????????profiling????????????
      this.createProServise.createProfiling(jvmId, guardianId);
      const params = {
        profileName: `${this.currentSelectJvm.name}(${this.currentSelectJvm.lvmid})`,
      };
      this.router.navigate(['profiling', params.profileName, 'overview']);
      sessionStorage.setItem('currentSelectJvm', `${this.currentSelectJvm.name}(${this.currentSelectJvm.lvmid})`);
      sessionStorage.setItem('profile_route', '1');
      sessionStorage.setItem('download_profile', 'false');
    }
    // ??????????????????????????????
    const nowDataTime = new Date().getTime();
    this.downloadService.downloadItems.profileInfo.nowTime =
      this.libService.dateFormat(nowDataTime, 'yyyy/MM/dd hh:mm:ss');
    this.downloadService.downloadItems.profileInfo.toolTipDate = this.libService.dateFormat(nowDataTime, 'yyyy/MM/dd');
  }
  /**
   * ???????????????????????????
   * jvmName:???????????????jvm??????
   */
  setSamplingName(jvmName: string) {
    const splitName = jvmName.split('/');
    const name = splitName[splitName.length - 1];
    return name;
  }
  /**
   * ????????????sampling???????????????
   */
  public createSampling(jvm: any) {
    this.currentSelectJvm = jvm;
    if (
      this.lowerVersinJvm ||
      this.currentSelGuardian.state !== 'CONNECTED' ||
      this.currentSelectJvm.profileState === 'PROFILING' ||
      this.currentSelectJvm.profileState === 'RECORDING' ||
      this.isAlermOpt || this.isAlermDisk || !this.guardianList.length || this.maxReport
    ) {
      return;
    }
    if (this.currentSelGuardian.owner.username !== this.currentUser) { return; }
    if (this.recordListMaxTips) { return; }
    sessionStorage.setItem('currentSelectJvm', `${this.currentSelectJvm.name}(${this.currentSelectJvm.lvmid})`);
    const jvmName = this.setSamplingName(this.currentSelectJvm.name);
    sessionStorage.setItem('record_name', `${jvmName}(${this.currentSelectJvm.lvmid})`);
    this.sampModal.Open();
  }


  /**
   * ??????profiling?????????????????????????????????????????????
   * params data ???????????????profiling????????????
   */
  public goProfileDetail(data: any) {
    this.currentSelectJvm.id = data.jvm.id;
    sessionStorage.setItem('jvmId', this.currentSelectJvm.id);
    sessionStorage.setItem('guardianId', data.guardian);
    sessionStorage.setItem('guardianName', this.currentSelGuardian.name);
    if (sessionStorage.getItem('GCLogId')) {
      this.downloadService.downloadItems.gclog.gcLogId = sessionStorage.getItem('GCLogId');
    }
    const params = {
      profileName: `${data.jvm.name}(${data.jvm.lvmid})`,
    };
    this.router.navigate(['profiling', params.profileName, 'overview']);
    sessionStorage.setItem('profile_route', '1');
    sessionStorage.setItem('download_profile', 'false');
  }

  goRecordDetail(record: any) {
    if (this.userRole === 'Admin' && record.createdBy !== this.userId) { return; }
    sessionStorage.setItem('sampling_createTime', this.libService.dateFormat(record.createTime * 1000,
      'yyyy/MM/dd hh:mm:ss'));
    this.recordData = record;
    this.recordGuardian = this.guardianList.find((guar: any) => {
      return guar.id === record.guardianId;
    });
    this.recordJvm = this.guardianJvms.find((jvm) => {
      return jvm.id === record.jvmId;
    });
    if (!this.changeIndex) {
      this.totalNumber = this.primaryJvms.length;
    } else {
      this.totalNumber = this.containerJvms.length;
    }
    // ??????????????????????????? ?????? ????????????
    if (
      record.icon_url === './assets/img/home/error.svg' &&
      record.state === 'FAILED'
    ) {
      return;
    }
    if (record.state !== 'FINISHED' || record.state === 'FAILED') {
      if (this.recordingItems[record.id] !== undefined) {
        this.selRecording = this.recordingItems[record.id];

        this.selRecording.totalTime !== -1
          ? clearTimeout(this.selRecording.timer)
          : clearInterval(this.selRecording.timer);
        this.selRecording.timer = null;
        delete this.recordingItems[record.id];
      }
      this.isCreating = true;
      return;
    }
    sessionStorage.setItem('sample_route', '1');
    const uuid = this.libService.generateConversationId(8);
    this.topicUrl = `/user/queue/sample/records/${record.id}/${uuid}/suggestion`;
    this.stompService.sampleDatas11 = [];
    this.stompService.sampleMethodJava = [];
    this.stompService.sampleMethodNative = [];
    sessionStorage.setItem('wsState', 'loading');
    setTimeout(() => {
      this.stompService.client(this.topicUrl, '/cmd/sub-record', {
        recordId: record.id,
        recordType: 'SUGGESTION',
        uuid
      });
    }, 200);
    const jvmName = this.setSamplingName(record.name);
    sessionStorage.setItem('record_name', jvmName);
    sessionStorage.setItem('record_id', this.recordData.id);
    sessionStorage.setItem(
      'enableMethodSample',
      JSON.stringify(record.enableMethodSample)
    );
    sessionStorage.setItem(
      'enableFileIO',
      JSON.stringify(record.enableFileIO)
    );
    sessionStorage.setItem(
      'enableSocketIO',
      JSON.stringify(record.enableSocketIO)
    );
    sessionStorage.setItem(
      'enableThreadDump',
      JSON.stringify(record.enableThreadDump)
    );
    sessionStorage.setItem(
      'enableOldObjectSample',
      JSON.stringify(record.enableOldObjectSample)
    );
    const params = { samplingName: record.id };
    this.router.navigate(['sampling', params.samplingName]);
  }
  deleteRecord(record: any) {
    this.recordDeleteModal.type = 'warn';
    this.recordDeleteModal.alert_show();
    if (this.userRole === 'Admin') {
      if (this.moduleSampleUserType.userId === '1') {
        this.recordDeleteModal.alertTitle = this.i18n.common_term_delete_recored;
      } else {
        this.recordDeleteModal.alertTitle = this.i18nService.I18nReplace(this.i18n.common_term_delete_user_recored,
          { 0: this.moduleSampleUserType.label });
      }
    } else {
      this.recordDeleteModal.alertTitle = this.i18n.common_term_delete_recored;
    }

    this.recordDeleteModal.title = this.i18nService.I18nReplace(this.i18n.common_term_delete_record_title,
      { 0: record.name });
    this.recordDeleteModal.content = this.i18n.common_term_delete_record_content;
    this.recordDeleteModal.deleteStatu = true;
    this.curDelRecord = record;
  }
  confirmRecordDelete(event: any) {
    if (!event) { return; }
    if (event) {
      this.Axios.axios.delete(`/records/${encodeURIComponent(this.curDelRecord.id)}`).then((resp: any) => {
        if (this.moduleSampleUserType) {
          if (this.moduleSampleUserType.userId !== this.userId) {
            this.getAdminSamplingList(this.moduleSampleUserType.userId);
          } else {
            this.sampleRecordsRequest(false);
            this.getListNum();
          }
        } else {
          this.sampleRecordsRequest(false);
          this.getListNum();
        }
      });
    }
  }

  hideCreating(data: any) {
    this.isCreating = false;
    this.selRecording = {};
    if (data === 'cancel') {
      this.sampModalForms.name.value = '';
      this.sampleFormGroup.controls.sampling_duration.setValue(60);
      this.sampleRecordsRequest(false);
      return;
    }
    if (data.optype && data.optype === 'min') {
      const record = data.record;
      const recordTime = data.time;
      const totalTime = record.duration;

      if (this.recordingItems[record.id] !== undefined) { return; }

      this.recordingItems[record.id] = {
        timer: null,
        recordTime,
        totalTime,
      };
      if (totalTime !== -1 && recordTime < totalTime) {
        const recordItem = this.recordingItems[record.id];
        this.timeCount_auto(recordItem, recordItem.recordTime, recordItem.totalTime, recordItem.timer);
      } else {
        const recordingItem = this.recordingItems[record.id];
        recordingItem.timer = setInterval(() => {
          this.recordingItems[record.id].recordTime += 1000;
        }, 1000);
      }
      return;
    }

    sessionStorage.setItem('sample_route', '1');
    const uuid = this.libService.generateConversationId(8);
    this.topicUrl = `/user/queue/sample/records/${this.recordData.id}/${uuid}/suggestion`;
    this.stompService.sampleDatas11 = [];
    this.stompService.sampleMethodJava = [];
    this.stompService.sampleMethodNative = [];
    sessionStorage.setItem('wsState', 'loading');
    setTimeout(() => {
      this.stompService.client(this.topicUrl, '/cmd/sub-record', {
        recordId: this.recordData.id,
        recordType: 'SUGGESTION',
        uuid
      });
    }, 200);
    const jvmName = this.setSamplingName(this.recordData.name);
    sessionStorage.setItem('record_name', jvmName);
    sessionStorage.setItem('record_id', this.recordData.id);
    sessionStorage.setItem(
      'enableMethodSample',
      JSON.stringify(this.recordData.enableMethodSample)
    );
    sessionStorage.setItem(
      'enableThreadDump',
      JSON.stringify(this.recordData.enableThreadDump)
    );
    sessionStorage.setItem(
      'enableFileIO',
      JSON.stringify(this.recordData.enableFileIO)
    );
    sessionStorage.setItem(
      'enableSocketIO',
      JSON.stringify(this.recordData.enableSocketIO)
    );
    sessionStorage.setItem(
      'enableOldObjectSample',
      JSON.stringify(this.recordData.enableOldObjectSample)
    );
    const params = { samplingName: this.recordData.id };
    this.router.navigate(['sampling', params.samplingName]);
  }
  private timeCount_auto(recordItem: any, recordTime: any, totalTime: any, timer: any) {
    timer = setTimeout(() => {
      recordTime += 1000;
      recordItem.recordTime = recordTime;
      recordItem.timer = timer;
      if (recordTime >= totalTime) {
        this.sampleRecordsRequest(false);
        clearTimeout(timer);
        timer = null;
        recordItem.timer = timer;
        return;
      }

      timer = setTimeout(() => {
        this.timeCount_auto(recordItem, recordTime, totalTime, timer);
      }, 500);
    }, 500);
    return;
  }

  manuallyStopChange(state: any) {
    this.sampModalForms.manuallyStop.state = state;
    this.sampModalForms.recordDur.disabled = state;
  }
  methodSampChange(state: any) {
    this.sampModalForms.methodSamp.state = state;
    this.sampModalForms.javaMethod.disabled = !state;
    this.sampModalForms.nativeMethod.disabled = !state;
  }
  threadDumpChange(state: any) {
    this.sampModalForms.threadDump.state = state;
    this.sampModalForms.interval.disabled = !state;
  }
  leakSampleChange(state: any) {
    this.sampModalForms.leakSample.state = state;
  }
  sampModal_ok() {
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
      (!this.sampleFormGroup.controls.sampling_method.value ||
        !this.sampleFormGroup.controls.sampling_nativeMethod.value);
    const threadDumpFlag = this.sampModalForms.threadDump.state &&
      !this.sampleFormGroup.controls.sampling_interval.value;
    const fileIOFlag = this.sampModalForms.fileIoSample.state && !this.sampleFormGroup.controls.sampling_fileIO.value;
    const socketIOFlag = this.sampModalForms.socketIoSample.state &&
      !this.sampleFormGroup.controls.sampling_socketIO.value;
    if (methodFlag || threadDumpFlag || fileIOFlag || socketIOFlag ||
      !this.sampleFormGroup.controls.sampling_duration.value) {
      const invalidEl =
        this.elementRef.nativeElement.querySelector(`.sampling-modal .ng-invalid.ng-touched:not([tiFocused])`);
      if (invalidEl) {
        const inputEl = $(invalidEl).find('.ti3-spinner-input-box .ti3-spinner-input')[0];
        inputEl.focus();
      }
      return;
    }
    if (this.ProfilingList.length) {
      this.stopProfile();
    }
    const params = {
      createTime: +new Date(),
      jvmId: this.currentSelectJvm.id,
      duration: this.sampModalForms.manuallyStop.state ? -1
        : this.sampleFormGroup.controls.sampling_duration.value * 1000,
      enableMethodSample: this.sampModalForms.methodSamp.state,
      javaMethodSampleInterval: this.sampleFormGroup.controls.sampling_method.value,
      nativeMethodSampleInterval: this.sampleFormGroup.controls.sampling_nativeMethod.value,
      enableThreadDump: this.sampModalForms.threadDump.state,
      threadDumpInterval: this.sampleFormGroup.controls.sampling_interval.value * 1000,
      enableFileIO: this.sampModalForms.fileIoSample.state,
      enableSocketIO: this.sampModalForms.socketIoSample.state,
      fileIOInterval: this.sampleFormGroup.controls.sampling_fileIO.value,
      socketIOInterval: this.sampleFormGroup.controls.sampling_socketIO.value,
      enableOldObjectSample: this.sampModalForms.leakSample.state
    };
    this.Axios.axios
      .post(
        `/guardians/${encodeURIComponent(this.currentSelGuardian.id)}/cmds/start-record`,
        params
      )
      .then(
        (resp: any) => {
          this.recordGuardian = this.currentSelGuardian;
          this.recordJvm = this.currentSelectJvm;
          this.recordData = resp;
          this.sampModal.Close();
          this.isCreating = true;
          this.closeTips = false;
          this.getListNum();
        },
        (error: any) => {
          if (error.response.data.code.indexOf('ResourceGuardianIdNotFound') >= 0) {
            const userInfo: string =
              this.currentSelGuardian.owner.username !== 'admin' &&
                this.currentSelGuardian.owner.username !== this.currentUser
                ? `<span style="color: #b8becc">(
                  ${this.domSanitizer.sanitize(SecurityContext.HTML, this.currentSelGuardian.owner.username)}
                )</span>`
                : '';
            const guarName: string = this.currentSelGuardian.name;
            this.mytip.alertInfo({
              type: 'warn',
              content: this.i18nService.I18nReplace(
                this.i18n.guardian_not_fount,
                { 0: guarName + userInfo }
              ),
              time: 10000,
            });
          }
        }
      );
  }
  sampModal_cancel() {
    this.sampModal.Close();
  }
  addModal_ok() {
    this.guardianValid('add');
  }
  /**
   * ????????????root??????
   */
  public confirmEnsureRoot(flag: any) {
    if (flag) {
      this.guardianValid('add');
    }
  }
  addGuardian() {
    this.addModal.type = 'none';
    this.addModalForms.selected.value = false;
    this.guardianAdd.ip.value = '';
    this.ipdisabled = false;
    this.addModal.alertTitle = this.i18n.common_term_add_guardian;
    this.addModal.alert_show();
    this.addFormGroup.reset({
      add_ip: this.guardianAdd.ip.value,
      add_port: this.guardianAdd.port.value || 22,
      add_uname: this.guardianAdd.uname.value,
      add_upwd: '',
    });
    this.guardianAdd.uPwd.value = '';
    // user-guide
    if (sessionStorage.getItem('userGuidStatus-java-perf') === '0') {
      this.userGuide.hideMask();
      setTimeout(() => {
        sessionStorage.setItem('javaStep', '2');
        this.userGuide.showMask('user-guide-params');
      }, 300);
    }
  }
  /**
   * ??????guardian????????????
   */
  public confirmAddGuardian(flag: any) {
    if (flag) {
      const errors: ValidationErrors | null = TiValidators.check(
        this.addFormGroup
      );
      if (errors) {
        const firstError: any = Object.keys(errors)[0];
        this.elementRef.nativeElement
          .querySelector(`[formControlName=${firstError}]`)
          .focus();
        return;
      }
      this.addModal_ok();
    }
  }
  /**
   * sshName????????????
   */
  public checkRoot() {
    if (this.guardianAdd.uname.value === 'root') {
      this.isRoot = true;
    } else {
      this.isRoot = false;
    }
  }
  editGuardian() {
    if (!this.guardianList.length || this.editBtnDisabled) { return; }
    if (!this.currentSelGuardian.name) { return; }
    this.editModal.type = 'none';
    this.currentSelGuardian.state === 'DISCONNECTED'
      ? this.editModal.alertTitle = this.i18n.common_term_reset_guardian
      : this.editModal.alertTitle = this.i18n.common_term_edit_guardian;
    this.editModal.alert_show();
    this.editFormGroup.reset({
      add_name: this.currentSelGuardian.name,
      add_ip: this.currentSelGuardian.ip,
      add_uname: '',
      add_upwd: '',
      add_port: this.currentSelGuardian.sshPort,
    });

    if (this.currentSelGuardian.state === 'DISCONNECTED') {
      this.editFormGroup.reset({
        add_name: this.currentSelGuardian.name,
        add_ip: this.currentSelGuardian.ip,
        add_uname: '',
        add_upwd: '',
        add_port: this.currentSelGuardian.sshPort,
      });
      this.editFormGroup.controls.add_name.disable();
      this.editFormGroup.controls.add_uname.enable();
      this.editFormGroup.controls.add_upwd.enable();
    } else {
      this.editFormGroup.controls.add_name.enable();
      this.editFormGroup.controls.add_uname.disable();
      this.editFormGroup.controls.add_upwd.disable();
    }
  }
  public confirmEdit(flag: any) {
    if (flag) { this.guardianValid('edit', this.currentSelGuardian.id); }
  }
  deleteGuardian() {
    if (!this.guardianList.length) { return; }
    if (!this.currentSelGuardian.name) { return; }
    // ????????????guardian??????????????????
    const jvms = this.currentSelGuardian.jvms;
    this.deletePromptModal.type = 'warn';
    this.deletePwdInput = '';
    this.deleteFormGroup.reset({
      delete_uname: '',
    });
    this.deletePromptModal.alert_show();
    const userInfo: string =
      this.currentSelGuardian.owner.username !== 'admin' &&
        this.currentSelGuardian.owner.username !== this.currentUser ?
        `<span style="color: #b8becc">${this.i18n.common_term_java_parentheses_left + this.domSanitizer.sanitize(
          SecurityContext.HTML, this.currentSelGuardian.owner.username
        ) + this.i18n.common_term_java_parentheses_right}</span>` : '';
    const guarName: string = this.currentSelGuardian.name;
    this.deletePromptModal.alertTitle = this.i18nService.I18nReplace(
      this.i18n.common_term_delete_guardian_tip,
      { 0: guarName + userInfo }
    );
    this.deletePromptModal.deleteStatu = true;
    this.deletePromptModal.content = '';
    switch (this.currentSelGuardian.state) {
      case 'CONNECTED':
        this.deletePromptModal.content = this.i18nService.I18nReplace(
          this.i18n.common_term_delete_guardian_connect_content,
          { 0: guarName + userInfo }
        );
        break;
      case 'DEPLOYED':
        this.deletePromptModal.content = this.i18nService.I18nReplace(
          this.i18n.common_term_delete_guardian_deployed_content,
          { 0: guarName + userInfo }
        );
        break;
      case 'DISCONNECTED':
        this.deletePromptModal.content = this.i18nService.I18nReplace(
          this.i18n.common_term_delete_guardian_disconnect_content,
          { 0: guarName + userInfo, 1: guarName + userInfo }
        );
        break;
      default:
        break;
    }
  }
  public manualDeleteHandle() {
    this.deletePromptModal.alert_close();
    this.manuaDeleteModal.type = 'warn';
    this.manuaDeleteModal.alert_show();
    const guarName: string = this.currentSelGuardian.name;
    const userInfo =
      this.currentSelGuardian.owner.username !== 'admin' &&
        this.currentSelGuardian.owner.username !== this.currentUser ?
        `<span style="color: #b8becc">${this.i18n.common_term_java_parentheses_left + this.domSanitizer.sanitize(
          SecurityContext.HTML, this.currentSelGuardian.owner.username
        ) + this.i18n.common_term_java_parentheses_right}</span>` : '';
    this.manuaDeleteModal.alertTitle = this.i18nService.I18nReplace(
      this.i18n.common_term_delete_guardian_tip,
      { 0: guarName + userInfo }
    );
    this.manuaDeleteModal.content = this.i18n.common_term_delete_guardian_disconnect_manually;
  }
  // ??????????????????guardian
  public confirmManuaDelete(flag: any) {
    if (flag) {
      const params = {
        username: this.deleteUsernameInput,
        password: 'xxx',
      };
      this.Axios.axios
        .delete(`/guardians/${encodeURIComponent(this.currentSelGuardian.id)}?force=true`, {
          data: params,
        })
        .then(
          (resp: any) => {
            this.queryGuardianList(false);
          },
          (error: any) => {
            if (error.response.data.code.indexOf('UninstallGuardianFailure') >= 0) {
              this.forceDelTip();
            }
          }
        );
    } else {
      this.deleteGuardian();
    }
  }
  public confirmHandle_delete(flag: any) {
    if (flag) {
      this.searchBox.propClear(); // ???????????????
      if (this.currentSelGuardian.state === 'DISCONNECTED') {
        const errors: ValidationErrors | null = TiValidators.check(
          this.deleteFormGroup
        );
        if (errors) {
          this.deletePromptModal.ValidResult = false;
          const firstError: any = Object.keys(errors)[0];
          this.elementRef.nativeElement
            .querySelector(`[formControlName=${firstError}]`)
            .focus();
          return;
        }
        this.deletePromptModal.ValidResult = true;
        this.deleteUsernameInput = this.deleteFormGroup.controls.delete_uname.value;
        if (this.deletePwdInput && this.deleteUsernameInput) {
          const params = {
            username: this.deleteUsernameInput,
            password: this.deletePwdInput,
          };
          this.Axios.axios
            .delete(`/guardians/${encodeURIComponent(this.currentSelGuardian.id)}`, {
              data: params,
            })
            .then(
              (resp: any) => {
                this.deleteFormGroup.reset({
                  delete_uname: '',
                });
                this.queryGuardianList(false);
              },
              (error: any) => {
                if (error.response.data.code.indexOf('UninstallGuardianFailure') >= 0) {
                  this.forceDelTip();
                }
              }
            );
        } else if (!this.deletePwdInput && this.deleteUsernameInput) {
          this.manualDeleteHandle();
        }
      } else if (this.currentSelGuardian.state !== 'DISCONNECTED') {
        this.Axios.axios
          .delete(`/guardians/${encodeURIComponent(this.currentSelGuardian.id)}`)
          .then(
            (resp: any) => {
              this.queryGuardianList(false);
            },
            (error: any) => {
              if (error.response.data.code.indexOf('UninstallGuardianFailure') >= 0) {
                this.forceDelTip();
              }
            }
          );
      }
    }
  }

  /**
   *  ??????profiling????????????????????????????????????????????????
   */
  public importProfile() {
    if (this.ProfilingList.length) {
      this.importProfilingModal.type = 'warn';
      this.importProfilingModal.alertTitle = this.i18n.common_term_import;
      this.importProfilingModal.isDownload = true;
      this.importProfilingModal.alert_show();
      this.importProfilingModal.title = this.i18n.common_term_has_import_profiling_tip;
      this.importProfilingModal.content = this.i18n.common_term_has_import_profiling_content;
      return;
    }
    this.confirmImportProfile(true);
  }

  /**
   *  ??????profiling??????????????????
   */
  public confirmImportProfile(flag: any) {
    if (flag) {
      // ?????????????????? ??????profiling????????????
      if (this.stompService.stompClient && this.ProfilingList.length) {
        this.stompService.startStompRequest('/cmd/stop-profile', {
          jvmId: this.currentProfilingJvmId,
          guardianId: this.currentProfilingGuardianId,
        });
        this.stompService.disConnect();
        this.ProfilingList = [];
      }
      const uploader = this.elementRef.nativeElement.querySelector('#uploade_el');
      // ????????????????????????
      uploader.click();
      uploader.value = '';
      uploader.addEventListener('change', () => {
        this.downloadService.initDatabase();
        this.getThreadDumpLimit();
        this.getHeapDumpLimit();
        this.getGcLogLimit();
        this.getReportNum();
        if (uploader.files.length > 0) {
          const file = uploader.files[0];
          // ???????????????type??? application/json?????????
          if (file.type !== 'application/json') {
            this.mytip.alertInfo({
              type: 'warn',
              content: this.i18n.common_term_has_import_profiling_type_tip,
              time: 10000
            });
            return;
          }
          const fileReader = new FileReader();
          // readAsText ????????????  ????????? Blob ?????? File ????????????????????????????????????????????????????????????
          // ??????????????? ???????????? onload ??? onloadend ?????????????????????????????????
          fileReader.readAsText(file);
          fileReader.onload = (event: Event) => {
            const tar: any = event.target as unknown;
            // ?????????json?????????????????????????????????
            if (this.downloadKeywords(tar.result) > 0) {
              this.mytip.alertInfo({
                type: 'warn',
                content: this.i18n.common_term_has_import_profiling_data_tip,
                time: 10000
              });
              return;
            }
            const downloadDatas = JSON.parse(tar.result as string); // ???????????????json??????
            this.downloadService.downloadItems = { ...downloadDatas };
            const innerDataTabs = this.downloadService.downloadItems.innerDataTabs;
            const checkedArr = innerDataTabs[0].children.filter((item: any) => {
              return item.checked;
            });
            const index = innerDataTabs[0].children.findIndex((e: any) => e === checkedArr[0]);
            const params = {
              profileName: this.downloadService.downloadItems.profileInfo.jvmName,
              tabs: innerDataTabs[0].children[index].link
            };
            sessionStorage.setItem('currentSelectJvm', params.profileName);
            this.router.navigate(['profiling', params.profileName, params.tabs]);
            sessionStorage.setItem('profile_route', '1');
            sessionStorage.setItem('download_profile', 'true');
          };
        }
      });
    }
  }

  public creatDowmTip(className: any, idx?: any) {
    if (document.getElementsByClassName(`downDriTip${idx}`)[0]) {
      return;
    }
    const downDirective: any = document.createElement('div');
    let parentsDom: any;
    if (className === 'sampleDown') {
      parentsDom = document.getElementsByClassName(className)[idx];
    } else {
      parentsDom = document.getElementById(className);
    }
    parentsDom.appendChild(downDirective);
    downDirective.classList.add(`downDriTip${idx}`);
    const dirStyle = `
      background: #ffffff;border-radius:2px;z-index:100;height: 28px;line-height: 28px;
      position: absolute;top: -30px; right: -30px;box-shadow: 0px 4px 8px 0px rgba(0, 0, 0, .2);
      padding:0 8px;font-size:12px
    `;
    if (this.language === 'en-us') {
      downDirective.style.cssText = `width:200px;${dirStyle}`;
    } else {
      downDirective.style.cssText = `width:120px;${dirStyle}`;
    }
    downDirective.innerHTML = this.i18n.common_term_downTip;
    setTimeout(() => {
      downDirective.parentNode.removeChild(downDirective);
    }, 3000);
  }
  /**
   *   profiling????????????
   */
  public exportProfile() {
    this.creatDowmTip('profileDown');
    this.downloadService.downloadItems.innerDataTabs = this.createProServise.innerDataTabs;
    this.createProServise.exportProfile();
  }
  /**
   * home??????????????????
   */
  public btnStopProfile() {
    this.stopProfilingBth.type = 'warn';
    this.stopProfilingBth.alert_show();
    this.stopProfilingBth.deleteStatu = true;
    this.stopProfilingBth.title = this.i18n.common_term_has_profiling_stop_tip;
    this.stopProfilingBth.alertTitle = this.i18n.protalserver_profiling_stop_analysis;
    this.stopProfilingBth.content = this.i18n.common_term_has_profiling_stop_content;
  }
  /**
   * ????????????????????????
   */
  public confirmStopProfilingBtn(flag: any) {
    if (flag) {
      this.stopProfile();
    }
  }
  /**
   *   profiling????????????
   */
  public stopProfile() {
    this.stompService.startStompRequest('/cmd/stop-profile', {
      jvmId: this.currentProfilingJvmId,
      guardianId: this.currentProfilingGuardianId,
    });
    this.stompService.disConnect();
    this.stompService.clearTimeOut();
    this.ProfilingList = [];
  }
  /**
   *  ????????????????????????????????????????????????
   */
  public confirmStopProfiling(flag: any) {
    if (flag) {
      this.stompService.startStompRequest('/cmd/stop-profile', {
        jvmId: this.currentProfilingJvmId,
        guardianId: this.currentProfilingGuardianId,
      });
      this.stompService.disConnect();
      this.stompService.clearTimeOut();
      this.ProfilingList = [];
      const jvmId = this.currentSelectJvm.id;
      const guardianId = this.currentSelGuardian.id;
      // ??????profiling??????
      this.createProServise.createProfiling(jvmId, guardianId);
      const params = {
        profileName: `${this.currentSelectJvm.name}(${this.currentSelectJvm.lvmid})`,
      };
      this.router.navigate(['profiling', params.profileName, 'overview']);
      sessionStorage.setItem('profile_route', '1');
      sessionStorage.setItem('download_profile', 'false');
      sessionStorage.removeItem('snapShot');
    }
  }
  private forceDelTip() {
    this.forceDeleteModal.type = 'prompt';
    this.forceDeleteModal.alertTitle = this.i18n.common_term_delete_guardian;
    this.forceDeleteModal.alert_show();
    this.forceDeleteModal.content =
      '???????????????????????????????????????guardian??????????????????????????????Guardian???';
  }
  public confirmForceDelete(flag: any) {
    if (flag) {
      if (this.currentSelGuardian.state === 'DISCONNECTED') {
        const params = {
          password: this.deletePwdInput,
          username: this.deleteUsernameInput,
        };
        this.Axios.axios
          .delete(`/guardians/${encodeURIComponent(this.currentSelGuardian.id)}?force=true`, {
            data: params,
          })
          .then((resp: any) => {
            this.queryGuardianList(false);
          });
      } else {
        this.Axios.axios
          .delete(`/guardians/${encodeURIComponent(this.currentSelGuardian.id)}?force=true`)
          .then((resp: any) => {
            this.queryGuardianList(false);
          });
      }
    }
  }
  userCheckedAllChange(state: any) {
    this.userList.forEach((uer: any) => {
      uer.checked = state;
    });
    if (!state) {
      this.guardianJvms = [];
      this.guardianList = [];
      this.currentJvms = [];
      this.ProfilingList = [];
      this.isNoGuardians = true;
      this.totalNumber = 0;
      return;
    }
    this.isNoGuardians = false;
    this.queryGuardianList(false);
  }
  userCheckedChange(state: any, index: any) {
    this.userList[index].checked = state;
    const checkedList = this.userList.filter((uer: any) => {
      return uer.checked;
    });
    if (!checkedList.length || !this.userList.length) {
      this.guardianList = [];
      this.guardianJvms = [];
      this.currentJvms = [];
      this.ProfilingList = [];
      this.isNoGuardians = true;
      this.totalNumber = 0;
      return;
    }
    this.isNoGuardians = false;
    this.userCheckedAll.checked = this.userList.length === checkedList.length;
    this.queryGuardianList(false);
  }
  onHoverFilter(num: any) {
    if (num === '0') {
      this.showFilter = false;
    } else {
      this.showFilter = true;
    }
  }
  onClickFilter() {

  }
  outClickFilter() {
    this.showFilter = false;
    this.isNoGuardians = false;
    this.queryGuardianList(false);
  }

  /**
   * ??????jvm?????????profiling sampling?????????????????????
   * params jvm ?????????????????????jvm
   */
  warnTip(jvm: any) {
    this.profileBtnTip = '';
    this.sampleBtnTip = '';
    if (!this.guardianList.length) { return; }
    if (this.isAlermOpt) {
      this.sampleBtnTip = this.i18n.common_term_sampling_workTip1;
      this.profileBtnTip = this.i18n.common_term_sampling_workTip0;
      return;
    }
    if (this.currentSelGuardian.state !== 'CONNECTED') {
      const guarName: string = this.currentSelGuardian.name;
      const userInfo =
        this.currentSelGuardian.owner.username !== 'admin' &&
          this.currentSelGuardian.owner.username !== this.currentUser
          ? `<span style="color: #b8becc">(
              ${this.domSanitizer.sanitize(SecurityContext.HTML, this.currentSelGuardian.owner.username)})
            </span>`
          : '';
      const content = this.i18nService.I18nReplace(this.i18n.common_term_other_guardian_opt_disabled_tip, {
        0: guarName + userInfo, 1: this.currentSelGuardian.state
      });
      this.mytip.alertInfo({
        type: 'warn',
        content,
        time: 3500,
      });
      return;
    }
    // ?????????????????????????????????Guardian?????????????????????
    if (this.currentSelGuardian.owner.username !== this.currentUser) {
      this.sampleBtnTip = this.i18n.common_term_guardian_Permission_tip;
      this.profileBtnTip = this.i18n.common_term_guardian_Permission_tip;
      return;
    }
    if (jvm.profileState !== 'RUNNING') {
      const state = this.currentSelectJvm.profileState === 'PROFILING' ? this.i18n.common_term_profiling :
        (this.currentSelectJvm.profileState === 'RECORDING' ? this.i18n.common_term_sampling : '');
      this.profileBtnTip = this.i18nService.I18nReplace(this.i18n.common_term_profiling_tip_disabled, { 0: state });
      this.sampleBtnTip = this.i18nService.I18nReplace(this.i18n.common_term_profiling_tip_disabled, { 0: state });
      return;
    }
    if (this.currentSelGuardian.state === 'CONNECTED') {
      const tipBox = $('.tip-box');
      if (tipBox.text().trim() === this.i18n.common_term_guardian_Permission_tip) {
        tipBox.css('display', 'none');
      }
      const filterJvm = this.saveJvmVersionInfo.filter((item: any) => {
        return item.gaurdinId === this.currentSelGuardian.id && item.jvmId === jvm.id;
      });
      const warnJvm = this.saveJvmWarnInfo.filter((item: any) => {
        return item.gaurdinId === this.currentSelGuardian.id && item.jvmId === jvm.id;
      });
      if (!jvm.stateRest && !filterJvm.length) {
        jvm.statusCode = true;
        this.lowerVersinJvm = true;
        this.profileBtnTip = this.i18n.common_term_version;
        this.sampleBtnTip = this.i18n.common_term_version;
        const messageInfo: any = this.i18n.common_term_version;
        this.saveJvmWarnInfo.push({
          gaurdinId: this.currentSelGuardian.id,
          jvmId: jvm.id,
          messageInfo
        });
        jvm.stateRest = true;
        if (this.saveJvmVersionInfo.filter((item: any) => {
          return item.gaurdinId === this.currentSelGuardian.id && item.jvmId === jvm.id;
        }).length > 0) { return; }
        if (this.currentSelGuardian.id && jvm.id) {
          const cgId = encodeURIComponent(this.currentSelGuardian.id);
          this.Axios.axios.get(`/guardians/${cgId}/jvms/${encodeURIComponent(jvm.id)}/checkJvmSupportSampling`)
            .then(
              (resp: any) => {
                jvm.stateRest = true;
                this.lowerVersinJvm = resp.code < 0 ? true : false;
                if (resp.code < 0) {
                  this.hoverBtnTip = resp?.message;
                } else {
                  this.hoverBtnTip = '';
                }
                jvm.statusCode = false;
                const message = '';
                this.saveJvmVersionInfo.push({
                  gaurdinId: this.currentSelGuardian.id,
                  jvmId: jvm.id,
                  message,
                  hoverTip: this.hoverBtnTip,
                  isLower: this.lowerVersinJvm
                });
                this.sampleBtnTip = '';
                this.profileBtnTip = '';
                const state = this.currentSelectJvm.profileState === 'PROFILING' ? this.i18n.common_term_profiling :
                  (this.currentSelectJvm.profileState === 'RECORDING' ? this.i18n.common_term_sampling : '');
                this.sampleBtnTip = state ?
                  this.i18nService.I18nReplace(this.i18n.common_term_profiling_tip_disabled, { 0: state }) :
                  (this.lowerVersinJvm ? this.hoverBtnTip : '');
                if (this.isAlermDisk) {
                  this.sampleBtnTip = this.i18n.common_term_sampling_workTip1;
                  return;
                }
                if (this.maxReport) {
                  this.sampleBtnTip = this.i18n.common_term_sampling_warning;
                }
              }
              ).catch((error: any) => {
                  this.lowerVersinJvm = true;
                  jvm.statusCode = true;
                  jvm.stateRest = true;
                  this.profileBtnTip = error.response?.data.message;
                  this.sampleBtnTip = error.response?.data.message;
                  const message = error.response?.data.message;
                  this.saveJvmVersionInfo.push({
                    gaurdinId: this.currentSelGuardian.id,
                    jvmId: jvm.id,
                    message,
                    isLower: this.lowerVersinJvm
                  });
              });
        }
      } else {
        if (!filterJvm.length) {
          jvm.statusCode = true;
          this.lowerVersinJvm = true;
          this.profileBtnTip = this.i18n.common_term_version;
          this.sampleBtnTip = this.i18n.common_term_version;
        } else {
          if (filterJvm[0].message) {
            this.profileBtnTip = filterJvm[0].message;
            this.sampleBtnTip = filterJvm[0].message;
            jvm.statusCode = true;
            this.lowerVersinJvm = true;
          } else {
            const isLower = filterJvm[0].isLower;
            const hoverTip = filterJvm[0].hoverTip;
            this.lowerVersinJvm = isLower;
            this.hoverBtnTip = hoverTip;
            jvm.statusCode = false;
            this.btnTipFarmat(isLower);
          }
        }
      }
      return;
    }
  }
  /**
   * ??????guardian?????????????????????guardian
   */
  public selectGuardian(guardian?: any, index?: any, isFresh?: boolean, isClick?: boolean) {
    if (guardian) {
      if (this.currentSelGuardian.id !== guardian.id) {
        this.searchValue = '';
        this.searchBox.propClear();
      }
      if (guardian && guardian.isSelected) {
        guardian.isSelected = true;
      }
      this.currentSelGuardian = guardian;
      this.profileBtnTip = '';
      // ?????????????????????1
      this.currentPage = 1;

      this.guardianList.forEach((item: any) => {
        if (item && item.isSelected) {
          item.isSelected = false;
        }
      });
      if (this.guardianList.length && !this.guardianList[index].isSelected) {
        this.guardianList[index].isSelected = true;
      }
      this.editBtnDisabled = this.userRole === 'Admin' && guardian.owner.username !== this.currentUser;
      // ????????????????????????guardian????????????????????????????????????
      if (!isFresh) {
        if (guardian.containerId) {
          this.guardianTabs[0].checked = false;
          this.guardianTabs[1].active = true;
          this.changeIndex = 1;
          this.onlyhascontainer = true;
        } else { // guardian??????????????????
          this.initGuardianTabs();
          this.changeIndex = 0;
          this.onlyhascontainer = false;
        }
      }
      this.guardianDetailRequest(guardian.id);
      sessionStorage.setItem('guardianId', this.currentSelGuardian.id);
      sessionStorage.setItem('guardianName', this.currentSelGuardian.name);
      this.isConnect = this.currentSelGuardian.state === 'CONNECTED';
      this.isOwnerGuardian = this.currentSelGuardian.owner.username === this.currentUser;
      this.profileBtnTip = this.currentSelGuardian.state !== 'CONNECTED' && this.i18n.common_term_profiling_tip;
    }
  }
  /**
   * ??????????????????jvm?????? ??????hover??????
   */
  selectJvm(index: any, n: any, currentJvm?: any, containerIndex?: any) {
    this.profileBtnTip = '';
    this.sampleBtnTip = '';
    if (!this.guardianJvms.length) { return; }

    this.guardianJvms.forEach((jvm: any, newindex: any) => {
      jvm.isSelected = false;
      jvm.showTip = false;
      if (currentJvm && jvm.id === currentJvm.id) {
        jvm.isSelected = true;
        index = newindex;
        this.currentSelectJvm = jvm;
      }
    });
    if (currentJvm) {
      this.warnTip(currentJvm);
      this.currentSelectJvm = currentJvm;
    } else {
      this.guardianJvms[index].isSelected = true;
      this.currentSelectJvm = this.guardianJvms[index];
    }
    if (currentJvm) {
      this.warnTip(currentJvm);
    }
  }
  selectTip(jvm: any) {
    const guardian = this.guardianList.filter((item: any) => {
      return item.isSelected === true;
    });
    if (guardian[0].isRunningInContainer && jvm.isRunningInContainer) {
      this.containerTip = '';
    }
    if (!guardian[0].isRunningInContainer && jvm.isRunningInContainer) {
      this.containerTip = this.i18n.common_term_guardian_containerId + jvm.containerId;
    }
  }
  cancelTip() {
    this.containerTip = '';
  }
  public guardianChangeIp( ip: any ) {
    if ( !this.addModalForms.selected.value ) {
      this.guardianAddip = ip;
    }
  }
  /**
   * ????????????????????????
   */
  public changeEnvType(localtype: any) {
    this.addModalForms.selected.value = localtype;
    if (localtype === true) {
      this.Axios.axios.get(`/guardians/getLocalIpAddress`).then((resp: any) => {
        this.guardianAdd.ip.value = resp;
        this.ipdisabled = resp ? true : false;
      }).catch((error: any) => {
        this.mytip.alertInfo({
          type: 'warn',
          content: error?.message,
          time: 3000,
        });
      });
    } else {
      this.guardianAdd.ip.value = this.guardianAddip;
      this.ipdisabled = false;
    }
  }

  private guardianValid(type: any, guardianId?: any) {
    if (type === 'add') {
      this.addModalForms.ip.value = this.addFormGroup.controls.add_ip.value;
      this.addModalForms.port.value = this.addFormGroup.controls.add_port.value;
      this.addModalForms.uname.value = this.addFormGroup.controls.add_uname.value;
      this.addModalForms.uPwd.value = this.addFormGroup.controls.add_upwd.value;
      const errors: ValidationErrors | null = TiValidators.check(
        this.addFormGroup
      );
      if (errors) {
        const firstError: any = Object.keys(errors)[0];
        this.elementRef.nativeElement
          .querySelector(`[formControlName=${firstError}]`)
          .focus();
        return;
      }
      // user-guide ??????????????????
      if (sessionStorage.getItem('userGuidStatus-java-perf') === '0') {
        this.userGuide.hideMask();
      }
      this.fingerprintRequest();
    } else {
      this.addModalForms.ip.value = this.editFormGroup.controls.add_ip.value;
      this.addModalForms.port.value = this.editFormGroup.controls.add_port.value;
      this.addModalForms.uname.value = this.editFormGroup.controls.add_uname.value;
      this.addModalForms.uPwd.value = this.editFormGroup.controls.add_upwd.value;
      const errors: ValidationErrors | null = TiValidators.check(
        this.editFormGroup
      );
      if (errors) {
        const firstError: any = Object.keys(errors)[0];
        this.elementRef.nativeElement
          .querySelector(`[formControlName=${firstError}]`)
          .focus();
        return;
      }
      const params =
        this.currentSelGuardian.state !== 'DISCONNECTED'
          ? { name: this.newGuardianName }
          : {
            sshUsername: this.addModalForms.uname.value,
            sshPassword: this.addModalForms.uPwd.value,
          };
      this.editRequest(guardianId, params);
    }
  }



  /**
   * ?????? jvms flag ?????? user guide ??????class  user-guide
   */
  public setJvmsFlag() {
    // ????????????????????? PROFILING RECORDING ????????? index
    const index = this.currentJvms.findIndex((item: any) => {
      return item.profileState !== 'PROFILING' || item.profileState !== 'RECORDING';
    });
    if (index >= 0) {
      this.currentJvms[index].guideFlag = true;
    }
  }

  /**
   * ????????????guardian???????????????
   */
  private guardianDetailRequest(guardianId: any) {
    this.guardianJvms = [];
    this.currentJvms = [];
    this.primaryJvms = [];
    this.containerProcessJvms = [];
    this.containerJvms = [];
    this.totalNumber = 0;

    this.guardianList.forEach((item: any) => {
      if (item?.id === guardianId) {
        if (item.jvms.length) {
          const jvms = item.jvms;
          jvms.forEach((jvm: any, index: any) => {
            jvm.isSelected = index === 0;
            jvm.showTip = false;
          });
          this.guardianJvms = jvms;
          this.currentJvms = this.guardianJvms;

          // ????????????????????????????????????????????????
          if (this.searchValue) {
            this.searchJvmList = this.guardianJvms.filter((jvm: { name: string | any[]; lvmid: string | any[]; }) => {
              return jvm.name.indexOf(this.searchValue) !== -1 || jvm.lvmid.indexOf(this.searchValue) !== -1;
            });
            this.handleSearchProcessData(this.searchJvmList);
          } else {
            this.showProcessTypeData(this.currentJvms);
          }

          // user-guide
          if (sessionStorage.getItem('userGuidStatus-java-perf') === '0') {
            this.setJvmsFlag();
          }
          if (!this.firstJvmId || this.firstJvmId !== jvms[0].id) {
            this.selectJvm(0, '1');
          }
          this.firstJvmId = jvms[0].id;
          const idx = this.guardianJvms.findIndex((jvm) => {
            return this.currentSelectJvm.id && this.currentSelectJvm.id === jvm.id;
          });
          if (idx >= 0) {
            this.guardianJvms[0].isSelected = false;
            this.guardianJvms[idx].isSelected = true;
            this.currentSelectJvm = this.guardianJvms[idx];
          } else {
            this.currentSelectJvm = this.guardianJvms[0];
          }
        }
      }
    });
  }

  /**
   * ??????????????????????????????????????????????????????
   * @param index ????????????
   */
  public handleSearchProcessData(currentJvms: Array<any>) {
    this.primaryJvms = [];
    this.searchJvms = [];
    this.allPromaryJvms = [];
    this.allContainerJvms = [];
    this.allPromaryJvms = currentJvms.filter((itemValue: any) => {
      return !itemValue.containerId;
    });
    this.allContainerJvms = currentJvms.filter((itemValue: any) => {
      return itemValue.containerId;
    });
    if (!this.changeIndex) {
      this.totalNumber = this.allPromaryJvms;
    } else {
      this.totalNumber = this.allContainerJvms;
    }
    const startSize = (this.currentPage - 1) * this.pageSize.size;
    const endSize = (this.currentPage) * this.pageSize.size;
    this.primaryJvms = this.allPromaryJvms.slice(startSize, endSize);
    this.searchJvms = this.allContainerJvms.slice(startSize, endSize);
  }

  /**
   * ???java????????????
   */
  public showProcessTypeData(allJvms: Array<any>) {
    this.primaryJvms = [];  // ????????????????????????????????????
    this.containerJvms = []; // ????????????????????????????????????
    this.allPromaryJvms = []; // ???????????????????????????
    this.allContainerJvms = []; // ???????????????????????????
    this.allPromaryJvms = allJvms.filter((itemValue: any) => {
      return !itemValue.containerId;
    });
    if (!this.changeIndex) {
      this.totalNumber = this.allPromaryJvms.length;
    }
    const start = (this.currentPage - 1) * this.pageSize.size;
    const end = (this.currentPage) * this.pageSize.size;
    this.primaryJvms = this.allPromaryJvms.slice(start, end);

    const containers: Array<any> = allJvms.filter((itemValue: any) => {
      return itemValue.containerId;
    });

    let flag = false;
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
          this.containerJvms[tempindex].children.push(containers[i]);
          flag = false;
        } else if (flag === false) {
          const containerObj = {
            containerId: '',
            containerName: '',
            profileState: '',
            id: '',
            isShowDetail: false,
            children: [] as any[],
          };
          containerObj.containerId = containers[i].containerId;
          containerObj.containerName = containers[i].containerName;
          containerObj.profileState = containers[i].profileState;
          containerObj.id = containers[i].id;
          containerObj.children.push(containers[i]);
          this.containerJvms.push(containerObj);
        }
      }
    }
    // ???????????????????????????
    if (this.containerJvms.length) {
      this.containerJvms[0].isShowDetail = true;
    }
    this.allContainerJvms = this.containerJvms;
    if (this.changeIndex) {
      this.totalNumber = this.allContainerJvms.length;
    }
    this.containerJvms = this.containerJvms.slice(start, end);

    this.getAllContainerProcess(this.containerJvms);
  }
  /**
   * ???????????????????????????
   * params tiTable  tiny3??????????????????
   */
  public getAllContainerProcess(processes: Array<any>) {
    this.containerProcessJvms = [];
    processes.forEach((item: any) => {
      if (item.children) {
        this.getAllContainerProcess(item.children);
      } else {
        this.containerProcessJvms.push(item);
      }
    });
  }

  /**
   * ????????????????????????
   * params tiTable  tiny3??????????????????
   */
  public toShowContainerDetail(jvmObj: any, index: any) {
    if (jvmObj.containerId) {
      jvmObj.isShowDetail = !jvmObj.isShowDetail;
    }
  }

  /**
   * ??????????????????
   * params event  ????????????
   */
  public onPageUpdate(event: TiPaginationEvent): void {
    const end = (event.currentPage) * this.pageSize.size;
    const start = (event.currentPage - 1) * this.pageSize.size;
    // ??????????????????
    if (this.searchValue.length > 0) {
      this.currentJvms = this.searchJvmList.slice();
      // ??????????????????????????????
      if (!this.changeIndex) {
        const primarys: any = this.currentJvms.filter((filterItem: any) => {
          return !filterItem.containerId;
        });
        this.totalNumber = primarys.length;
        this.primaryJvms = primarys.slice(start, end);
      } else { // ??????????????????????????????
        const containers: any = this.currentJvms.filter((filterItem: any) => {
          return filterItem.containerId;
        });
        this.totalNumber = containers.length;
        this.searchJvms = containers.slice(start, end);
      }
    } else {
      if (!this.changeIndex) {
        this.primaryJvms = this.allPromaryJvms.slice(start, end);
        this.totalNumber = this.allPromaryJvms.length;
      } else {
        this.containerJvms = this.allContainerJvms.slice(start, end);
        this.totalNumber = this.allContainerJvms.length;
      }
    }
  }

  /**
   * ??????????????????btn???????????????
   */
  private btnTipFarmat(isLower: any) {
    const state = this.currentSelectJvm.profileState === 'PROFILING' ? this.i18n.common_term_profiling :
      (this.currentSelectJvm.profileState === 'RECORDING' ? this.i18n.common_term_sampling : '');
    this.profileBtnTip = state ?
      this.i18nService.I18nReplace(this.i18n.common_term_profiling_tip_disabled, { 0: state })
      : this.i18n.common_term_profiling_tip;
    this.sampleBtnTip = state ?
      this.i18nService.I18nReplace(this.i18n.common_term_profiling_tip_disabled, { 0: state }) :
      (isLower ? this.hoverBtnTip : '');
    if (this.isAlermDisk) {
      this.sampleBtnTip = this.i18n.common_term_sampling_workTip1;
      return;
    }
    if (this.maxReport) {
      this.sampleBtnTip = this.i18n.common_term_sampling_warning;
    }
  }

  // flag???????????????????????????????????????
  private sampleRecordsRequest(flag: any) {
    this.Axios.axios.get(`/records`).then(
      (resp: any) => {
        if (resp.members.length) {
          this.recordList = this.recordsSorted(resp.members);
          this.recordList.forEach((record) => {
            record.icon_url = this.stateUtil.recodeStateFormat(record.state);
          });
          this.recordListTips = this.recordList.length >= 75;
          this.recordListMaxTips = this.recordList.length >= 100;
        } else {
          this.recordListTips = false;
          this.recordListMaxTips = false;
          this.recordList = [];
        }
      },
      (error: any) => {
        if (flag) {
          if (this.recordsTimer) { clearTimeout(this.recordsTimer); }
          this.recordsTimer = setTimeout(() => {
            this.sampleRecordsRequest(true);
          }, 5000);
        }
      }
    );
  }
  private recordsSorted(record: any) {
    return record.sort((a: any, b: any) => {
      const pre =
        a.createTime && a.state !== 'FAILED' ? a.createTime * 1000 : 0;
      const after =
        b.createTime && a.state !== 'FAILED' ? b.createTime * 1000 : 0;
      return after - pre;
    });
  }

  private editRequest(guardianId: any, params: any) {
    this.Axios.axios.patch(`/guardians/${guardianId}`, params).then((resp: any) => {
      if (resp.state === 'CONNECTED') {
        this.mytip.alertInfo({
          type: 'success',
          content: this.i18n.tip_msg.edite_ok,
          time: 3500,
        });
      } else {
        this.mytip.alertInfo({
          type: 'success',
          content: this.i18n.common_term_reset_success,
          time: 3500,
        });
      }
    });
  }
  private fingerprintRequest() {
    // ??????fetch_fingerprint
    const params = {
      host: this.addModalForms.ip.value,
      port: this.addModalForms.port.value,
      username: this.addModalForms.uname.value,
    };
    this.Axios.axios
      .post('/tools/fetch-fingerprint', params)
      .then((resp: any) => {
        const fingerprint = resp.fingerprint;
        this.fingerprint = resp.fingerprint;
        this.addPromptModal.type = 'prompt';
        this.addPromptModal.alert_show();
        this.addPromptModal.alertTitle = this.i18n.common_term_add_guardian;
        this.addPromptModal.content = this.i18nService.I18nReplace(
          this.i18n.common_term_guardian_fingerprint_tip,
          { 0: this.addModalForms.ip.value, 1: fingerprint }
        );
      })
      .catch((error: any) => {
        this.clearUserGuideInfo();
      });
  }
  public confirmHandle(data: any) {
    if (data) {
      // ???????????????????????????
      this.addModal.alert_close();
      this.addFormGroup.reset({
        add_ip: '',
        add_uname: '',
        add_upwd: '',
      });
      if (sessionStorage.getItem('userGuidStatus-java-perf') === '0') {
        setTimeout(() => {
          this.userGuide.showMask('user-guide-thread-creating', 'id');
        }, 10);
      }
      this.addRequest(this.fingerprint);
      return;
    }
    this.addModal.alert_close(); // ?????????????????????
  }

  private addRequest(fingerprint: any) {
    const params = {
      host: this.addModalForms.ip.value,
      sshPort: Number(this.addModalForms.port.value),
      sshUsername: this.addModalForms.uname.value,
      sshPassword: this.addModalForms.uPwd.value,
      fingerprint,
    };
    this.Axios.axios.post('/guardians', params)
      .then((resp: any) => {
        this.newGuardianName = resp.name;
        this.queryGuardianList(false);
        // user-guide
        if (sessionStorage.getItem('userGuidStatus-java-perf') === '0') {
          this.userGuideTimer = setInterval(() => {
            this.getGuardians();
          }, 1000);
        } else {
          if (this.guardianList.length) {
            this.selectGuardian(resp, this.guardianList.length - 1);
          }
        }
      })
      .catch((err: any) => {
        if (err) {
          this.queryGuardianList(false);
        }
        this.clearUserGuideInfo();
      });
  }

  /**
   * ?????????????????? ???????????? Guardian ??????
   * ??? Guardian ????????? CONNECTED ??????????????????????????????
   * ???????????? Guardian ?????? ?????????????????????
   */
  public getGuardians() {
    this.Axios.axios.get('/guardians')
      .then((resp: any): any => {
        const members = resp.members;
        if (members.length) {
          const fined = members.find((item: any) => item.name === this.newGuardianName);
          if (fined) {
            if (fined.state === 'CONNECTED') {
              // ???????????? ??????????????????
              if (!fined.jvms.length) {
                // ????????????
                const msg = this.i18n.userGuide.noJavaProcess;
                const index = members.findIndex((item: any) => item.name === this.newGuardianName);
                this.selectGuardian(fined, index);
                setTimeout(() => {
                  this.userGuide.showMask('user-guide-thread-fail', 'id');
                }, 1000);
                clearTimeout(this.userGuideTimer);
                this.userGuideTimer = null;
                return false;
              }
              // ????????????????????????  ???????????????????????????????????????????????????
              const firstJvm = fined.jvms[0];
              if (firstJvm.profileState === 'PROFILING') {
                this.stompService.startStompRequest('/cmd/stop-profile', {
                  jvmId: firstJvm.id,
                  guardianId: fined.id,
                });
                this.stompService.disConnect();
              }
              this.curUserGuideProcess(members, fined);
            }
            if (fined.state === 'DISCONNECTED') {
              this.userGuide.closeUserGuide();
            }
          }
        } else {
          this.userGuide.closeUserGuide();
        }
        clearTimeout(this.userGuideTimer);
        this.userGuideTimer = null;
      })
      .catch((err: any) => {
        // ?????????????????????
        this.clearUserGuideInfo();
        clearTimeout(this.userGuideTimer);
        this.userGuideTimer = null;
      });
  }

  /**
   * ??????????????????????????????
   */
  public curUserGuideProcess(members: any, fined: any) {
    const index = members.findIndex((item: any) => item.name === this.newGuardianName);
    this.selectGuardian(fined, index);
    const start = (this.currentPage - 1) * this.pageSize.size;
    const end = (this.currentPage) * this.pageSize.size;
    // ?????? currentJvms
    this.currentJvms = fined.jvms.slice(start, end);
    this.userGuide.hideMask();
    setTimeout(() => {
      this.userGuide.showMask('user-guide-thread', 'class', this.onlyhascontainer);
    }, 500);
  }
  /**
   * ??????????????? ?????? ???????????? ???????????????
   */
  public clearUserGuideInfo() {
    // user-guide ??????????????????????????????
    if (sessionStorage.getItem('userGuidStatus-java-perf') === '0') {
      this.cancelBtn = true;
      this.userGuide.hideMask();
      sessionStorage.setItem('javaStep', '1');
      this.addGuardian();
    }
  }
  /**
   * ??????guardian??????
   * params flag ???????????????????????????guardian???????????????
   */
  private queryGuardianList(flag: any) {
    this.originGuardianList = [];
    this.Axios.axios.get('/guardians').then(
      (resp: any) => {
        sessionStorage.setItem('isFirstGet', JSON.stringify(false));
        if (resp.members.length) {
          if (resp.members.length && sessionStorage.getItem('guardianId')) {
            const curGuardian = resp.members.filter((item: any) => {
              return item.id === sessionStorage.getItem('guardianId');
            });
            if (curGuardian.length && sessionStorage.getItem('jvmId')) {
              const curJvms = curGuardian[0].jvms.filter((item: any) => {
                return item.id === sessionStorage.getItem('jvmId');
              });
              if (curJvms.length) {
                const profilingJvmStatus = curJvms[0].profileState;
                sessionStorage.setItem('currentJvmStatus', profilingJvmStatus);
              } else {
                if (sessionStorage.getItem('currentJvmStatus')) {
                  sessionStorage.removeItem('currentJvmStatus');
                }
              }
            } else {
              sessionStorage.removeItem('currentJvmStatus');
            }
          }
          this.guardianList = this.sortGuardians(resp.members);
          this.guardianList.forEach((item: any) => {
            // ??????????????????  ????????????
            item.stateImg = this.stateUtil.guardianRunningStateFormat(item);
            item.stateColor = item.state === 'CONNECTED' ?
              '#7adfa0' : item.state === 'DISCONNECTED' ? '#f45c5e' : '#838a9b';
            item.isSelected = false;
            item.tipMsg = this.guardianStateTip(item);
            item.statusTip = this.guardianStatusTip;
            item.currentStatus = this.stateUtil.getGuardianState(item);
            // ???????????????????????????guardian???????????????
            const usrIdx = this.userList.findIndex((user: any) => {
              return user.title === item.owner.username;
            });
            if (usrIdx === -1) {
              this.userList.push({
                title: item.owner.username,
                id: item.owner.id,
                checked: true,
              });
            }
          });
          // ??????????????????
          const showGuardianUser = this.userList.filter((item: any) => {
            return item.checked;
          });
          this.guardianList = this.guardianList.filter((item: any) => {
            const checkedUserIdx = showGuardianUser.findIndex((user: any) => {
              return item.owner.username === user.title;
            });
            return checkedUserIdx >= 0;
          });

          // ????????????  ??????????????????????????????guardian
          if (this.userRole && this.userRole !== 'Admin') {
            this.guardianList = this.guardianList.filter((item: any) => {
              return item.owner.username === this.currentUser;
            });
            if (!this.guardianList.length) {
              this.guardianJvms = [];
              this.currentJvms = [];
              this.currentSelGuardian = {};
              this.profileBtnTip = '';
              this.totalNumber = 0;
              this.isNoGuardians = true;
              return;
            }
          }
          this.isNoGuardians = this.guardianList.length === 0;
          this.originGuardianList = this.guardianList.slice();
          const idx = this.guardianList.findIndex((guar: any) => {
            return guar.id === sessionStorage.getItem('guardianId');
          });
          if (idx >= 0) {
            this.selectGuardian(this.guardianList[idx], idx, flag);
          } else {
            this.selectGuardian(this.guardianList[0], 0, flag);
          }
          // ?????????????????????guardian????????????????????????profiling??????
          this.ProfilingList = [];
          this.currentProfilingGuardianId = '';
          this.currentProfilingJvmId = '';
          this.guardianList.forEach((item: any) => {
            const profilingJvms = item.jvms.filter((jvm: any) => {
              return jvm.profileState === 'PROFILING';
            });
            if (profilingJvms.length > 0 && item.owner.username === this.currentUser) {
              item.jvms.forEach((jvm: any) => {
                if (jvm.profileState === 'PROFILING' && item.owner.uid === jvm.occupiedBy) {
                  this.ProfilingList.push({ guardian: item.id, jvm });
                  this.currentProfilingGuardianId = item.id;
                  this.currentProfilingJvmId = jvm.id;
                }
              });
            }
          });
          if (this.ProfilingList.length > 1) {
            this.ProfilingList = this.ProfilingList.slice(0, 1);
          }
          if (this.downloadService.downloadItems.profileInfo.nowTime === '' && this.ProfilingList.length > 0) {
            this.ProfilingList = [];
            this.currentJvms.forEach((e: { id: string; profileState: string; }) => {
              if (e.id === this.currentProfilingJvmId) {
                e.profileState = 'RUNNING';
              }
            });
          }
        } else {
          this.userList = this.guardianList = this.originGuardianList =
            this.guardianJvms = this.currentJvms = this.ProfilingList = [];
          this.currentSelGuardian = {};
          this.profileBtnTip = '';
          this.totalNumber = 0;
          this.isNoGuardians = true;
          sessionStorage.removeItem('currentJvmStatus');
        }
      },
      (error: any) => {
        sessionStorage.setItem('isFirstGet', JSON.stringify(false));
        if (flag) {
          if (this.guardianTimer) { clearTimeout(this.guardianTimer); }
          this.guardianTimer = setTimeout(() => {
            this.queryGuardianList(true);
          }, 10000);
        }
      }
    );
  }
  /**
   * guardian??????????????????????????????guardian???????????????????????????????????????
   */
  private sortGuardians(guardians: any) {
    let sortedGuardians = [];
    const curUserCreated = guardians.filter((item: any) => {
      return item.owner.username === this.currentUser;
    });
    const otherCreated = guardians.filter((item: any) => {
      return item.owner.username !== this.currentUser;
    });
    sortedGuardians = curUserCreated.concat(otherCreated);
    return sortedGuardians;
  }
  /**
   * ??????guardian?????????????????????
   */
  private guardianStateTip(item: any) {
    let tip = '';
    if (item.isRunningInContainer) {
      tip = this.i18n.common_term_guardian_container + this.stateUtil.getGuardianState(item);
    } else {
      tip = this.i18n.common_term_guardian_physics + this.stateUtil.getGuardianState(item);
    }
    if (item.state === 'DISCONNECTED') {
      tip = tip + this.i18n.common_term_guardian_restart;
    }
    return tip;
  }
  /**
   * ???????????????????????????????????????????????? ???????????????????????????json??????
   * params str ???????????????????????????????????????
   */
  private downloadKeywords(str: any) {
    const keys = ['profileInfo', 'jvmName', 'overview', 'environment', 'keyword'];
    let matchedLen = 0;
    matchedLen = keys.filter(key => {
      return str.indexOf(key) === -1;
    }).length;
    return matchedLen;
  }
  public closeSamplingTips() {
    this.recordListTips = false;
    this.closeTips = true;
  }
  /**
   * ??????????????????
   */
  public logOut() {
    this.Axios.axios.post('/users/logout/').then((data: any) => {
      if (data.status === 0) {
        sessionStorage.setItem('role', '');
        sessionStorage.setItem('token', '');
        sessionStorage.setItem('username', '');
        sessionStorage.setItem('loginId', '');
        this.mytip.alertInfo({
          type: 'success',
          content: this.i18n.logout_ok,
          time: 3500,
        });
        this.router.navigate(['/login']);
      } else {
        this.mytip.alertInfo({
          type: 'warn',
          content: this.i18n.logout_error,
          detail: data.info,
          time: 3500,
        });
      }
    });
  }
  ngOnDestroy() {
    this.downloadService.homeJvmVersion = this.saveJvmVersionInfo;
    this.downloadService.downloadItems.report.threaddumpList = this.threaddumpList.length;
    this.downloadService.downloadItems.report.heapdumpList = this.heapdumpList.length;
    this.downloadService.downloadItems.report.gcLogList = this.gcLogList.length;
    this.downloadService.downloadItems.isAlermDisk = this.isAlermDisk;
    this.getHeapDumpLimit();
    this.getThreadDumpLimit();
    this.getGcLogLimit();
    let timerDes = setTimeout(() => {
      clearTimeout(this.guardianTimer);
      clearTimeout(this.recordsTimer);
      this.guardianTimer = null;
      this.recordsTimer = null;
      clearTimeout(timerDes);
      timerDes = null;
    }, 500);
    let timerDisc = setTimeout(() => {
      clearTimeout(this.diskStateTimer);
      this.diskStateTimer = null;
      clearTimeout(timerDisc);
      timerDisc = null;
    });
    if (this.refreshSub) { this.refreshSub.unsubscribe(); }
  }
  public updateConfirmValidator() {
    Promise.resolve().then(() => {
      this.userPwd.controls.cpwd.updateValueAndValidity();
    });
  }
  confirmationValidator = (control: FormControl) => {
    if (!control.value) {
      return { required: true };
    } else if (control.value !== this.userPwd.controls.pwd.value) {
      return {
        cpwd: {
          confirm: true,
          error: true,
          tiErrorMessage: this.i18n.validata.pwd_conf,
        },
      };
    }
    return {};
  }
  userPwdConfirm = (control: FormControl) => {
    if (!control.value) {
      return { required: true };
    } else if (control.value !== this.userPwd.controls.pwd.value) {
      return {
        cpwd: {
          confirm: true,
          error: true,
          tiErrorMessage: this.i18n.validata.pwd_conf,
        },
      };
    }
    return {};
  }
  public onHoverList(label?: any) {
    this.currentHover = label;
  }
  public closeReport() {
    this.reportList = true;
  }
  /**
   * ??????????????????
   */
  public closeWarnTip() {
    this.importWarnTip = false;
  }
  public getReportNum() {
    this.Axios.axios.get('/tools/settings/report').then((res: any) => {
      this.downloadService.downloadItems.report.alarmJFRCount = res.alarmJFRCount;
      this.downloadService.downloadItems.report.maxJFRCount = res.maxJFRCount;
    });
  }
  public getListNum() {
    if (this.userRole === 'Admin') {
      this.getAdminSamplingList(this.moduleSampleUserType.userId);
    } else {
      this.Axios.axios.get('/records').then((res: any) => {
        if (res.members.length) {
          this.recordList = this.recordsSorted(res.members);
          this.recordList.forEach((record) => {
            record.icon_url = this.stateUtil.recodeStateFormat(record.state);
          });
          this.recordListTips = this.recordList.length >= 75;
          this.recordListMaxTips = this.recordList.length >= 100;
          sessionStorage.setItem(
            'sampling_createTime',
            this.libService.dateFormat(this.recordList[0].createTime * 1000, 'yyyy/MM/dd hh:mm:ss')
          );
        } else {
          this.recordListTips = false;
          this.recordListMaxTips = false;
          this.recordList = [];
        }
        if (res.notification === 'REACH_WARNING_LIMIT') {
          this.reportList = false;
          this.maxReport = false;
          return;
        }
        if (res.notification === 'REACH_MAX_LIMIT') {
          this.reportList = false;
          this.maxReport = false;
          return;
        } else {
          this.reportList = false;
          this.maxReport = false;
        }
      });
    }
  }
  public getProTip(jvm: any, idx: any, n: any) {
    this.tipJvm = jvm;
  }
  /**
   * ???????????????????????????
   */
  public toggleLeft() {
    this.leftState = !this.leftState;
  }
  public disableCtrlZ(event: any) {
    return disableCtrlZ(event);
  }
  /**
   * ??????
   */
  public searchEvent(value: any): void {
    this.searchValue = value;
    this.currentPage = 1;
    this.searchJvmList = this.guardianJvms.filter((jvm: { name: string | any[]; lvmid: string | any[]; }) => {
      return jvm.name.indexOf(value) !== -1 || jvm.lvmid.indexOf(value) !== -1;
    });
    const end = (this.currentPage) * this.pageSize.size;
    const start = (this.currentPage - 1) * this.pageSize.size;
    if (this.searchValue) {
      const allSearchJvms = this.searchJvmList.slice();
      // ??????????????????????????????
      if (!this.changeIndex) {
        this.primaryJvms = allSearchJvms.filter((filterItem: any) => {
          return !filterItem.containerId;
        });
        this.totalNumber = this.primaryJvms.length;
        this.primaryJvms = this.primaryJvms.slice(start, end);
        // ??????????????????????????????
      } else {
        const searchContainers: any = allSearchJvms.filter((filterItem: any) => {
          return filterItem.containerId;
        });
        this.totalNumber = searchContainers.length;
        this.searchJvms = searchContainers.slice(start, end);
      }
    } else {
      this.queryGuardianList(true);
    }
  }
  /**
   * ?????????????????????
   */
  public onSearchChange(event: any): void {
    if (event.value === '') {
      this.searchEvent(event.value);
    }
  }
  /**
   * ??????????????????
   */
  public getUserList() {
    this.Axios.axios.get('/user/actions/list').then((res: any) => {
      res.data.forEach((item: any) => {
        const typeObj = {
          label: '',
          userId: '',
        };
        typeObj.label = item.username;
        typeObj.userId = item.uid;
        this.optionsUserType.push(typeObj);
      });
      this.moduleSampleUserType = this.optionsUserType[0];
      this.moduleReportUserType = this.optionsUserType[0];
    });
  }
  /**
   * ????????????
   */
  public onHoverClose(msg: string) {
    this.hoverClose = msg;
  }
  public setTip() {
    if (this.curUserThreaddumpNum >= this.downloadService.downloadItems.report.maxThreadDumpCount) {
      this.optionsSaveReportType[0].disabled = true;
    } else {
      this.optionsSaveReportType[0].disabled = false;
    }
    if (this.curUserHeapdumpNum >= this.downloadService.downloadItems.report.maxHeapCount) {
      this.optionsSaveReportType[1].disabled = true;
    } else {
      this.optionsSaveReportType[1].disabled = false;
    }
    if (this.curUserGcLogNum >= this.downloadService.downloadItems.report.maxGCLogsCount) {
      this.optionsSaveReportType[2].disabled = true;
    } else {
      this.optionsSaveReportType[2].disabled = false;
    }
    if (this.recordList.length >= this.downloadService.downloadItems.report.maxJFRCount) {
      this.reportTypeDisabled = true;
      this.optionsImportType[1].disabled = true;
    } else {
      this.optionsImportType[1].disabled = false;
      this.reportTypeDisabled = false;
    }
    // ??????????????????-??????????????????????????????
    if (this.optionsSaveReportType[0].disabled
      && this.optionsSaveReportType[1].disabled
      && this.optionsSaveReportType[2].disabled) {
      this.optionsImportType[2].disabled = true;
    }
    if (this.moduleImportType.value === this.optionsImportType[2].value
      && this.optionsSaveReportType[0].disabled
      && this.optionsSaveReportType[1].disabled
      && this.optionsSaveReportType[2].disabled) {
      this.reportTypeDisabled = true;
      this.optionsImportType[2].disabled = true;
    } else {
      this.reportTypeDisabled = false;
    }
    if (this.moduleImportType.value === this.optionsImportType[2].value &&
      this.moduleSaveReportType.value === this.optionsSaveReportType[2].value &&
      this.curUserGcLogNum >= this.downloadService.downloadItems.report.maxGCLogsCount) {
      this.importWarnTip = true;
      this.reportOkBtDisabled = true;
      this.saveReportTip = this.gcLogWarnTip;
    } else if (this.moduleImportType.value === this.optionsImportType[2].value &&
      this.moduleSaveReportType.value === this.optionsSaveReportType[1].value &&
      this.curUserHeapdumpNum >= this.downloadService.downloadItems.report.maxHeapCount) {
      this.importWarnTip = true;
      this.reportOkBtDisabled = true;
      this.saveReportTip = this.heapdumpWarnTip;
    } else if (this.moduleImportType.value === this.optionsImportType[2].value &&
      this.moduleSaveReportType.value === this.optionsSaveReportType[0].value &&
      this.curUserThreaddumpNum >= this.downloadService.downloadItems.report.maxThreadDumpCount) {
      this.importWarnTip = true;
      this.reportOkBtDisabled = true;
      this.saveReportTip = this.threaddumpWarnTip;
    } else if (this.moduleImportType.value === this.optionsImportType[1].value &&
      this.recordList.length >= this.downloadService.downloadItems.report.maxJFRCount) {
      this.importWarnTip = true;
      this.reportOkBtDisabled = true;
      this.reportTypeDisabled = true;
      this.saveReportTip = this.i18n.common_term_sampling_warning;
    } else {
      this.reportOkBtDisabled = false;
      this.importWarnTip = false;
    }
    // ????????????????????? ??????????????????
    if (this.isAlermOpt || this.isAlermDisk) {
      if (this.moduleImportType.value !== this.optionsImportType[0].value) { this.importWarnTip = true; }
      if (this.isAlermOpt) { this.saveReportTip = this.i18n.tip_msg.task_disk_error; }
      if (this.isAlermDisk) { this.saveReportTip = this.i18n.common_term_upload_disk; }
      this.optionsImportType[1].disabled = true;
      this.optionsImportType[2].disabled = true;
      this.optionsSaveReportType[0].disabled = true;
      this.optionsSaveReportType[1].disabled = true;
      this.optionsSaveReportType[2].disabled = true;
      if (this.moduleImportType.value !== this.optionsImportType[0].value) {
        this.reportOkBtDisabled = true;
        this.reportTypeDisabled = true;
      } else {
        this.reportOkBtDisabled = false;
        this.reportTypeDisabled = false;
      }
    }
  }
  /**
   * ??????????????????
   */
  public importTip() {
    this.setTip();
    if (this.imoprtType) {
      this.getRightTab(this.imoprtType);
    } else {
      this.getRightTab(this.moduleSaveReportType);
    }
    this.importModul.open();
  }
  /**
   * ??????????????????
   */
  public onImportType(event: object) {
    this.setTip();
    this.moduleImportType = event;
    if (this.moduleImportType.value === this.optionsImportType[0].value) {
      // ?????????????????????tab
      this.rightProfileTab.active = true;
      this.rightSampleTab.active = false;
      this.rightReportTab.active = false;
    } else if (this.moduleImportType.value === this.optionsImportType[1].value) {
      // ?????????????????????tab
      this.rightProfileTab.active = false;
      this.rightSampleTab.active = true;
      this.rightReportTab.active = false;
    } else {
      if (this.moduleSaveReportType.value === this.optionsSaveReportType[0].value) {
        // ?????????????????????tab
        this.rightProfileTab.active = false;
        this.rightReportTab.active = true;
        this.threadDumpReportTab.active = true;
        this.heapDumpReportTab.active = false;
      } else if (this.moduleSaveReportType.value === this.optionsSaveReportType[1].value) {
        // ?????????????????????tab
        this.rightProfileTab.active = false;
        this.rightReportTab.active = true;
        this.heapDumpReportTab.active = true;
      } else if (this.moduleSaveReportType.value === this.optionsSaveReportType[2].value) {
        // ?????????????????????tab
        this.rightProfileTab.active = false;
        this.rightReportTab.active = true;
        this.gcLogReportTab.active = true;
      }
    }
  }
  /**
   * ????????????????????????
   */
  public onSampleUserType(event: object) {
    this.moduleSampleUserType = event;
    this.getAdminSamplingList(this.moduleSampleUserType.userId);
  }
  /**
   * ???????????????????????????????????????
   */
  public getAdminSamplingList(id: number) {
    const params = { userId: id }; // ????????????????????????
    this.Axios.axios.post('/records/user', params).then((res: any) => {
      if (res.members.length) {
        this.recordList = this.recordsSorted(res.members);
        this.recordList.forEach((record) => {
          record.icon_url = this.stateUtil.recodeStateFormat(record.state);
        });
        this.recordListTips = this.recordList.length >= 75;
        this.recordListMaxTips = this.recordList.length >= 100;
        sessionStorage.setItem(
          'sampling_createTime', this.libService.dateFormat(this.recordList[0].createTime * 1000, 'yyyy/MM/dd hh:mm:ss')
        );
      } else {
        this.recordListTips = false;
        this.recordListMaxTips = false;
        this.recordList = [];
      }
      if (res.notification === 'REACH_WARNING_LIMIT') {
        this.reportList = false;
        this.maxReport = false;
        return;
      }
      if (res.notification === 'REACH_MAX_LIMIT') {
        this.reportList = false;
        this.maxReport = false;
        return;
      } else {
        this.reportList = false;
        this.maxReport = false;
      }
    });
  }
  /**
   * ????????????????????????
   */
  public onSaveReportType(event: object) {
    this.setTip();
    this.moduleSaveReportType = event;
    if (this.moduleSaveReportType.value === this.optionsSaveReportType[0].value) {
      // ?????????????????????tab
      this.rightProfileTab.active = false;
      this.rightReportTab.active = true;
      this.threadDumpReportTab.active = true;
      this.heapDumpReportTab.active = false;
    } else if (this.moduleSaveReportType.value === this.optionsSaveReportType[1].value) {
      // ?????????????????????tab
      this.rightProfileTab.active = false;
      this.rightReportTab.active = true;
      this.heapDumpReportTab.active = true;
    } else if (this.moduleSaveReportType.value === this.optionsSaveReportType[2].value) {
      // ?????????????????????tab
      this.rightProfileTab.active = false;
      this.rightReportTab.active = true;
      this.gcLogReportTab.active = true;
    }
  }
  /**
   * ????????????
   */
  public onSelectInport() {
    this.getThreadDumpLimit();
    this.getHeapDumpLimit();
    this.getGcLogLimit();
    if (this.moduleImportType.value === this.optionsImportType[0].value) {
      this.importProfile();
      // ?????????????????????tab
      this.rightProfileTab.active = true;
      this.rightSampleTab.active = false;
      this.rightReportTab.active = false;
    } else if (this.moduleImportType.value === this.optionsImportType[1].value) {
      this.importClick();
      // ?????????????????????tab
      this.rightProfileTab.active = false;
      this.rightSampleTab.active = true;
      this.rightReportTab.active = false;
    } else {
      if (this.moduleSaveReportType.value === this.optionsSaveReportType[0].value) {
        this.importThreadDumpClick();
        // ?????????????????????tab
        this.rightProfileTab.active = false;
        this.rightReportTab.active = true;
        this.threadDumpReportTab.active = true;
        this.heapDumpReportTab.active = false;
      } else if (this.moduleSaveReportType.value === this.optionsSaveReportType[1].value) {
        this.importHeapdumpClick();
        // ?????????????????????tab
        this.rightProfileTab.active = false;
        this.rightReportTab.active = true;
        this.heapDumpReportTab.active = true;
      } else if (this.moduleSaveReportType.value === this.optionsSaveReportType[2].value) {
        this.importGCLogClick();
        // ?????????????????????tab
        this.rightProfileTab.active = false;
        this.rightReportTab.active = true;
        this.gcLogReportTab.active = true;
      }
    }
  }
  /**
   * ??????????????????
   */
  // flag???????????????????????????????????????
  private heapdumpRequest(flag: any, id: string) {
    const params = { userId: id };
    this.Axios.axios.post('/heap/actions/query', params).then(
      (resp: any) => {
        if (resp.data.length) {
          this.heapdumpWarn = false;
          this.heapdumpHint = false;
          this.heapdumpList = this.recordsSorted(resp.data);
          this.heapdumpList.forEach((record) => {
            record.icon_url = this.stateUtil.heapdumpStateFormat(record.state);
          });
          this.heapdumpWarnTip = this.i18n.common_term_heapdump_warning;
          this.heapdumpHintTip = this.i18n.common_term_heapdump_hinting;
        } else {
          this.heapdumpList = [];
        }
        if (this.userId === id) {
          this.curUserHeapdumpNum = this.heapdumpList.length;
        }
      },
      (error: any) => {
        if (flag) {
          if (this.recordsTimer) { clearTimeout(this.recordsTimer); }
          this.recordsTimer = setTimeout(() => {
            this.heapdumpRequest(true, id);
          }, 1000);
        }
      }
    );
  }
  /**
   * ??????????????????????????????
   */
  private heapdumpUserRequest() {
    this.Axios.axios.get('/heap/actions/list').then(
      (resp: any) => {
        if (resp.data.length) {
          this.heapdumpWarn = false;
          this.heapdumpHint = false;
          this.heapdumpList = this.recordsSorted(resp.data);
          this.heapdumpList.forEach((record) => {
            record.icon_url = this.stateUtil.heapdumpStateFormat(record.state);
          });
          this.heapdumpWarnTip = this.i18n.common_term_heapdump_warning;
          this.heapdumpHintTip = this.i18n.common_term_heapdump_hinting;
        } else {
          this.heapdumpList = [];
        }
        this.curUserHeapdumpNum = this.heapdumpList.length;
      },
    );
  }
  /**
   * ????????????????????????
   */
  public importHeapDump() {
    // ?????????????????????????????? ??????????????????
    const token = sessionStorage.getItem('token');
    const language = sessionStorage.getItem('language');
    this.heapdumpUploadConfig = {
      url: `${this.Axios.axios.defaults.baseURL}heap/actions/upload`,
      alias: 'file',
      headers: {
        Authorization: token,
        ['Accept-Language']: language
      },
      filters: [{
        name: 'maxSize',
        params: [2048 * 1024 * 1024] // diskAfter   MIB*1024*1024
      }],
      onAddItemFailed: (fileObject: TiFileInfo, validResults: Array<string>): void => {
        const fileSize = fileObject.size;
        if (fileSize >= 2048 * 1024 * 1024) {
          this.heapdumpContent = this.i18n.common_term_heapdump_upload_size;
        }
        if (this.heapdumpContent) {
          this.mytip.alertInfo({
            type: 'warn',
            content: this.heapdumpContent,
            time: 10000,
          });
        }
        this.importModul.close();
      },

      onAddItemSuccess: (fileItem: TiFileItem): void => {
        if (fileItem.file.size >= this.workRemain) {
          this.heapdumpContent = this.i18n.common_term_upload_disk;
          this.mytip.alertInfo({
            type: 'warn',
            content: this.heapdumpContent,
            time: 10000,
          });
          fileItem.remove();
          this.importModul.close();
          return;
        }
        if (fileItem.file.size >= this.diskRemain) {
          this.heapdumpContent = this.i18n.tip_msg.task_disk_error;
          this.mytip.alertInfo({
            type: 'warn',
            content: this.heapdumpContent,
            time: 10000,
          });
          fileItem.remove();
          this.importModul.close();
          return;
        }
        this.initUploadStatus('heapdump');
        this.uploadStatus.uploadError = false;
        this.uploadStatus.errMsg = '';
        this.uploadStatus.fileName = fileItem.file.name;
        this.uploadStatus.sizeWithUnit = fileItem.file.sizeWithUnit;
        this.uploadStatus.title = `${this.uploadStatus.fileName} (${this.uploadStatus.sizeWithUnit}) `;
        this.uploadStatus.showUploadTips = true;
        this.uploadStatus.index = fileItem.index; // ????????????????????????
        let importDataArr = {};
        importDataArr = this.uploadStatus;
        this.importAllData.push(importDataArr);
        this.showImportList = true;
        this.importModul.close();
      },
      onCompleteItems: (fileItems: Array<TiFileItem>, response: string, status: number): void => {
        if (status === 0) {
          setTimeout(() => {
            this.setShowUploadTip(fileItems[0].file.name, fileItems[0].index);
          }, 3000);
        } else if (status === 200) {
          setTimeout(() => {
            this.setShowUploadTip(fileItems[0].file.name, fileItems[0].index);
            if (this.userRole === 'Admin') {
              this.heapdumpRequest(false, this.moduleReportUserType.userId);
            } else {
              this.heapdumpUserRequest();
            }
          }, 3000);
          this.downloadService.downloadItems.report.heapdumpList = this.heapdumpList.length;
        } else {
          const res = JSON.parse(response);
          this.setuploadError(fileItems[0].file.name, fileItems[0].index, res.message);
        }
      }
    },
      this.heapdumpUploader = this.uploaderService.create(this.heapdumpUploadConfig);
  }
  /**
   * ????????????
   */
  public heapdumpExportData(id: any, name: any) {
    if (!this.checkHeapdumpReportExporting(id)) {
      this.heapDumpCurImportReports.push(id);
      this.Axios.axios.get(`/heap/actions/download/${encodeURIComponent(id)}`,
        { responseType: 'blob' }).then((resp: any) => {
          const loadIndex = this.heapDumpCurImportReports.indexOf(id);
          if (loadIndex > -1) {
            this.heapDumpCurImportReports.splice(loadIndex, 1);
          }
          const blob = new Blob([resp], { type: 'application/octet-stream' });
          // ??????????????????IE
          if ('msSaveOrOpenBlob' in navigator) {
            window.navigator.msSaveBlob(blob, name);
          } else {
            const href = URL.createObjectURL(blob);
            const link: any = document.createElement('a');
            link.style.display = 'none';
            link.href = href;
            link.setAttribute('download', name);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }
        }).catch((error: any) => {
          const loadIndex = this.heapDumpCurImportReports.indexOf(id);
          if (loadIndex > -1) {
            this.heapDumpCurImportReports.splice(loadIndex, 1);
          }
          const reader = new FileReader();
          reader.readAsText(error.response.data);
          reader.onload = (e) => {
            const msgObj = JSON.parse(reader.result as string);
            this.mytip.alertInfo({
              type: 'warn',
              content: msgObj.message,
              time: 10000,
            });
          };
        });
    }
  }
  /**
   * ??????????????????????????????
   * @param id ??????id
   */
  public checkHeapdumpReportExporting(id: any): boolean {
    if (this.heapDumpCurImportReports.indexOf(id) > -1) {
      return true;
    }
    return false;
  }
  /**
   * ??????????????????
   * @param id ??????ID
   */
  public heapdumpDeleteData(id: string) {
    this.heapdumpDeleteModal.type = 'warn';
    this.heapdumpDeleteModal.alert_show();
    if (this.userRole === 'Admin') {
      if (this.moduleReportUserType.userId === '1') {
        this.heapdumpDeleteModal.alertTitle = this.i18n.common_term_delete_report;
      } else {
        this.heapdumpDeleteModal.alertTitle = this.i18nService.I18nReplace(this.i18n.common_term_delete_user_report,
          { 0: this.moduleReportUserType.label });
      }
    } else {
      this.heapdumpDeleteModal.alertTitle = this.i18n.common_term_delete_report;
    }
    this.heapdumpDeleteModal.title = this.i18nService.I18nReplace(this.i18n.common_term_delete_report_title,
      { 0: this.i18n.common_term_memory_dump });
    this.heapdumpDeleteModal.content = this.i18n.common_term_delete_report_content;
    this.heapdumpDeleteModal.deleteStatu = true;
    this.heapdumpDeleteId = id;
  }
  /**
   * ????????????
   */
  public confirmHeapdumpDelete(event: boolean) {
    if (!event) { return; }
    this.Axios.axios.delete(`/heap/actions/delete/${encodeURIComponent(this.heapdumpDeleteId)}`).then(
      (resp: any) => {
        if (this.userRole === 'Admin') {
          this.heapdumpRequest(false, this.moduleReportUserType.userId);
        } else {
          this.heapdumpUserRequest();
        }
        this.downloadService.downloadItems.report.heapdumpList = this.heapdumpList.length;
        if (this.heapdumpDeleteId === this.downloadService.downloadItems.heapDump.newRecordId) {
          this.downloadService.downloadItems.heapDump.saveReported = false;
        }
      });
  }
  /**
   * ??????????????????
   */
  public onReportUserType(event: object) {
    this.moduleReportUserType = event;
    this.threadDumpRequest(false, this.moduleReportUserType.userId);
    this.heapdumpRequest(false, this.moduleReportUserType.userId);
    this.gcLogRequest(false, this.moduleReportUserType.userId);
  }
  /**
   * ?????????????????????????????????
   */
  public importHeapdumpClick() {
    const samImport = this.elementRef.nativeElement.querySelector('#heapdumpImport');
    samImport.click();
  }
  /**
   * ??????????????????tag
   */
  public activeProfile(isActive: boolean) {
    if (isActive) {
      this.moduleImportType = this.optionsImportType[0];
    }
  }
  /**
   * ??????????????????tag
   */
  public activeSample(isActive: boolean) {
    if (isActive) {
      this.moduleImportType = this.optionsImportType[1];
      this.getListNum();
    }
  }
  /**
   * ????????????tag
   */
  public activeReport(isActive: boolean) {
    this.getThreadDumpLimit();
    this.getHeapDumpLimit();
    this.getGcLogLimit();
    if (isActive) {
      this.moduleImportType = this.optionsImportType[2];
      if (this.userRole === 'Admin') {
        this.threadDumpRequest(false, this.moduleReportUserType.userId);
        this.heapdumpRequest(false, this.moduleReportUserType.userId);
        this.gcLogRequest(false, this.moduleReportUserType.userId);
      } else {
        this.threadDumpUserRequest();
        this.heapdumpUserRequest();
        this.gcLogUserRequest();
      }
      this.downloadService.downloadItems.report.heapdumpList = this.heapdumpList.length;
    }
  }
  /**
   * ????????????????????????tag
   */
  public activetThreadDump(isActive: boolean) {
    if (isActive) {
      this.moduleSaveReportType = this.optionsSaveReportType[0];
    }
  }
  /**
   * ??????????????????tag
   */
  public activetHreadDump(isActive: boolean) {
    if (isActive) {
      this.moduleSaveReportType = this.optionsSaveReportType[1];
    }
  }
  /**
   * ??????GC??????tag
   */
  public activetGCLog(isActive: boolean) {
    if (isActive) {
      this.moduleSaveReportType = this.optionsSaveReportType[2];
    }
  }
  /**
   * ????????????????????????
   */
  async getHeapDumpLimit() {
    const heapDumpLimit = await this.homeHttpServe.getHeapDumpLimit();
    this.downloadService.downloadItems.report.alarmHeapCount = heapDumpLimit.alarmHeapCount;
    this.downloadService.downloadItems.report.maxHeapCount = heapDumpLimit.maxHeapCount;
    this.downloadService.downloadItems.report.maxHeapSize = heapDumpLimit.maxHeapSize;
  }
  /**
   * ?????????????????????
   */
  public getRightTab(tag: any) {
    this.rightTag = tag;
    if (this.rightTag === 'threaddump') {
      this.rightProfileTab.active = false;
      this.rightReportTab.active = true;
      this.threadDumpReportTab.active = true;
      this.moduleImportType = this.optionsImportType[2];
      this.moduleSaveReportType = this.optionsSaveReportType[0];
    } else if (this.rightTag === 'memoryDump') {
      this.rightProfileTab.active = false;
      this.rightReportTab.active = true;
      this.heapDumpReportTab.active = true;
      this.moduleImportType = this.optionsImportType[2];
      this.moduleSaveReportType = this.optionsSaveReportType[1];
    } else if (this.rightTag === 'sample') {
      this.rightProfileTab.active = false;
      this.rightSampleTab.active = true;
      this.rightReportTab.active = false;
      this.imoprtType = this.optionsImportType[1];
      this.moduleImportType = this.optionsImportType[1];
      if (this.recordList.length >= this.downloadService.downloadItems.report.maxJFRCount) {
        this.saveReportTip = this.i18n.common_term_sampling_warning;
      }
      setTimeout(() => {
        this.getListNum();
      }, 1000);
    }
  }
  /**
   * ????????????
   */
  public closeSelectInport() {
    this.importModul.close();
  }
  /**
   * ????????????????????????????????????
   */
  public goHeapdumpDetail(item: any) {
    if (this.userRole === 'Admin' && (item.createdBy !== this.userId || item.state !== 'PARSE_COMPLETED')) { return; }
    const params = { heapdumpName: item.id };
    sessionStorage.setItem('heapdumpReportTitle', item.alias);
    sessionStorage.setItem('heapdumpId', item.id);
    sessionStorage.setItem('reportType', 'heapdump');
    this.downloadService.downloadItems.report.heapdumpName = params.heapdumpName;
    this.router.navigate(['heapdump', params.heapdumpName]);
  }
  /**
   * ??????????????????????????????
   */
  public closeHeapdumpHint() {
    this.heapdumpHint = true;
  }
  /**
   * ??????????????????????????????
   */
  public closeThreaddumpHint() {
    this.threaddumpHint = true;
  }
  // ????????????
  /**
   * ??????????????????????????????
   */
  async getThreadDumpLimit() {
    const threadDumpLimit = await this.homeHttpServe.getThreadDumpLimit();
    this.downloadService.downloadItems.report.alarmThreadDumpCount = threadDumpLimit.alarmThreadDumpCount;
    this.downloadService.downloadItems.report.maxThreadDumpCount = threadDumpLimit.maxThreadDumpCount;
  }
  /**
   * ???????????????????????????
   */
  // flag???????????????????????????????????????
  private threadDumpRequest(flag: any, id: string) {
    const params = { userId: id };
    this.Axios.axios.post('/threadDump/query', params).then(
      (resp: any) => {
        if (resp.data.length) {
          this.threaddumpWarn = false;
          this.threaddumpHint = false;
          this.threaddumpList = this.recordsSorted(resp.data);
          this.threaddumpList.forEach((record) => {
            record.icon_url = this.stateUtil.heapdumpStateFormat(record.state);
          });
          this.threaddumpWarnTip = this.i18n.common_term_threaddump_warning;
          this.threaddumpHintTip = this.i18n.common_term_heapdump_hinting;
        } else {
          this.threaddumpList = [];
        }
        if (this.userId === id) {
          this.curUserThreaddumpNum = this.threaddumpList.length;
        }
      },
      (error: any) => {
        if (flag) {
          if (this.recordsTimer) { clearTimeout(this.recordsTimer); }
          this.recordsTimer = setTimeout(() => {
            this.threadDumpRequest(true, id);
          }, 1000);
        }
      }
    );
  }
  /**
   * ??????????????????????????????
   */
  private threadDumpUserRequest() {
    this.Axios.axios.get('/threadDump/list').then((resp: any) => {
      if (resp.data.length) {
        this.threaddumpWarn = false;
        this.threaddumpHint = false;
        this.threaddumpList = this.recordsSorted(resp.data);
        this.threaddumpList.forEach((record) => {
          record.icon_url = this.stateUtil.heapdumpStateFormat(record.state);
        });
        this.threaddumpWarnTip = this.i18n.common_term_threaddump_warning;
        this.heapdumpHintTip = this.i18n.common_term_heapdump_hinting;
      } else {
        this.threaddumpList = [];
      }
      this.curUserThreaddumpNum = this.threaddumpList.length;
    },
    );
  }
  /**
   * ??????????????????
   * @param id ??????ID
   */
  public threadDumpDeleteData(id: string) {
    this.threadDumpDeleteModal.type = 'warn';
    this.threadDumpDeleteModal.alert_show();
    if (this.userRole === 'Admin') {
      if (this.moduleReportUserType.userId === '1') {
        this.threadDumpDeleteModal.alertTitle = this.i18n.common_term_delete_report;
      } else {
        this.threadDumpDeleteModal.alertTitle = this.i18nService.I18nReplace(this.i18n.common_term_delete_user_report,
          { 0: this.moduleReportUserType.label });
      }
    } else {
      this.threadDumpDeleteModal.alertTitle = this.i18n.common_term_delete_report;
    }
    this.threadDumpDeleteModal.title = this.i18nService.I18nReplace(this.i18n.common_term_delete_report_title,
      { 0: this.i18n.common_term_memory_dump });
    this.threadDumpDeleteModal.content = this.i18n.common_term_delete_report_content;
    this.threadDumpDeleteModal.deleteStatu = true;
    this.threadDumpDeleteId = id;
  }
  /**
   * ??????????????????
   */
  public confirmThreadDumpDelete(event: boolean) {
    if (!event) { return; }
    this.Axios.axios.delete(`/threadDump/${encodeURIComponent(this.threadDumpDeleteId)}`).then(
      (resp: any) => {
        if (this.userRole === 'Admin') {
          this.threadDumpRequest(false, this.moduleReportUserType.userId);
        } else {
          this.threadDumpUserRequest();
        }
        this.downloadService.downloadItems.report.threaddumpList = this.threaddumpList.length;
      });
  }
  /**
   * ??????????????????????????????
   * @param id ??????id
   */
  public checkThreadDumpReportExporting(id: any): boolean {
    if (this.heapDumpCurImportReports.indexOf(id) > -1) {
      return true;
    }
    return false;
  }
  /**
   * ????????????
   */
  public threadDumpExportData(id: any, name: any) {
    if (!this.checkThreadDumpReportExporting(id)) {
      this.threadDumpCurImportReports.push(id);
      this.Axios.axios.get(`/threadDump/actions/download/${encodeURIComponent(id)}`,
        { responseType: 'blob' }).then((resp: any) => {
          const loadIndex = this.threadDumpCurImportReports.indexOf(id);
          if (loadIndex > -1) {
            this.threadDumpCurImportReports.splice(loadIndex, 1);
          }
          const blob = new Blob([resp], { type: 'application/octet-stream' });
          // ??????????????????IE
          if ('msSaveOrOpenBlob' in navigator) {
            if (name.indexOf('.txt') !== -1) {
              window.navigator.msSaveBlob(blob, `${name}`);
            } else {
              window.navigator.msSaveBlob(blob, `${name}.txt`);
            }
          } else {
            const href = URL.createObjectURL(blob);
            const link: any = document.createElement('a');
            link.style.display = 'none';
            link.href = href;
            if (name.indexOf('.txt') !== -1) {
              link.setAttribute('download', `${name}`);
            } else {
              link.setAttribute('download', `${name}.txt`);
            }
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }
        }).catch((error: any) => {
          const loadIndex = this.threadDumpCurImportReports.indexOf(id);
          if (loadIndex > -1) {
            this.threadDumpCurImportReports.splice(loadIndex, 1);
          }
          const reader = new FileReader();
          reader.readAsText(error.response.data);
          reader.onload = (e) => {
            const msgObj = JSON.parse(reader.result as string);
            this.mytip.alertInfo({
              type: 'warn',
              content: msgObj.message,
              time: 10000,
            });
          };
        });
    }
  }
  /**
   * ?????????????????????????????????
   */
  public importThreadDumpClick() {
    const samImport = this.elementRef.nativeElement.querySelector('#threaddumpImport');
    samImport.click();
  }
  /**
   * ??????????????????
   */
  closeUploadTips(e: any) {
    e.showUploadTips = false;
    this.seeShowImportList();
  }
  /**
   * ????????????
   */
  stopUpload(e: any) {
    if (e.type === 'threadDump') {
      this.threaddumpUploader.queue.forEach(item => {
        if (e.fileName === item.file.name && e.index === item.index) {
          item.cancel();
        }
      });
    } else if (e.type === 'heapdump') {
      this.heapdumpUploader.queue.forEach(item => {
        if (e.fileName === item.file.name && e.index === item.index) {
          item.cancel();
        }
      });
    } else if (e.type === 'gcLog') {
      this.gcLogUploader.queue.forEach(item => {
        if (e.fileName === item.file.name && e.index === item.index) {
          item.cancel();
        }
      });
    } else if (e.type === 'sampling') {
      this.uploader.queue.forEach(item => {
        if (e.fileName === item.file.name && e.index === item.index) {
          item.cancel();
        }
      });
    }
    e.showUploadTips = false;
    this.seeShowImportList();
  }
  /**
   * ????????????????????????
   */
  public importThreadDump() {
    // ?????????????????????????????? ??????????????????
    const token = sessionStorage.getItem('token');
    const language = sessionStorage.getItem('language');
    this.threaddumpUploadConfig = {
      url: `${this.Axios.axios.defaults.baseURL}threadDump/actions/upload`,
      alias: 'file',
      headers: {
        Authorization: token,
        ['Accept-Language']: language
      },
      filters: [{
        name: 'maxSize',
        params: [50 * 1024 * 1024] // diskAfter   MIB*1024*1024
      }],
      onAddItemFailed: (fileObject: TiFileInfo, validResults: Array<string>): void => {
        const jfrSize = fileObject.size;
        if (jfrSize >= 50 * 1024 * 1024) {
          this.threadDumpContent = this.i18n.common_term_threaddump_upload_size;
        }
        if (this.threadDumpContent) {
          this.mytip.alertInfo({
            type: 'warn',
            content: this.threadDumpContent,
            time: 10000,
          });
        }
        this.importModul.close();
      },
      onAddItemSuccess: (fileItem: TiFileItem): void => {
        if (fileItem.file.size >= this.workRemain) {
          this.threadDumpContent = this.i18n.common_term_upload_disk;
          this.mytip.alertInfo({
            type: 'warn',
            content: this.threadDumpContent,
            time: 10000,
          });
          fileItem.remove();
          this.importModul.close();
          return;
        }
        if (fileItem.file.size >= this.diskRemain) {
          this.threadDumpContent = this.i18n.tip_msg.task_disk_error;
          this.mytip.alertInfo({
            type: 'warn',
            content: this.threadDumpContent,
            time: 10000,
          });
          fileItem.remove();
          this.importModul.close();
          return;
        }
        this.initUploadStatus('threadDump');
        this.uploadStatus.uploadError = false;
        this.uploadStatus.errMsg = '';
        this.uploadStatus.fileName = fileItem.file.name;
        this.uploadStatus.sizeWithUnit = fileItem.file.sizeWithUnit;
        this.uploadStatus.title = `${this.uploadStatus.fileName} (${this.uploadStatus.sizeWithUnit}) `;
        this.uploadStatus.showUploadTips = true;
        this.uploadStatus.index = fileItem.index; // ????????????????????????
        let importDataArr = {};
        importDataArr = this.uploadStatus;
        this.importAllData.push(importDataArr);
        this.showImportList = true;
        this.importModul.close();
      },
      onCompleteItems: (fileItems: Array<TiFileItem>, response: string, status: number): void => {
        if (status === 0) {
          setTimeout(() => {
            this.setShowUploadTip(fileItems[0].file.name, fileItems[0].index);
          }, 3000);
        } else if (status === 200) {
          setTimeout(() => {
            this.setShowUploadTip(fileItems[0].file.name, fileItems[0].index);
            if (this.userRole === 'Admin') {
              this.threadDumpRequest(false, this.moduleReportUserType.userId);
            } else {
              this.threadDumpUserRequest();
            }
          }, 3000);
          this.downloadService.downloadItems.report.heapdumpList = this.heapdumpList.length;
        } else {
          const res = JSON.parse(response);
          this.setuploadError(fileItems[0].file.name, fileItems[0].index, res.message);
        }
      }
    },
      this.threaddumpUploader = this.uploaderService.create(this.threaddumpUploadConfig);
  }
  // ???????????????????????????
  public setuploadError(fileName: string, index: any, message: any) {
    this.importAllData.forEach((e: { fileName: string; index: any; uploadError: boolean; errMsg: any; }) => {
      if (e.fileName === fileName && e.index === index) {
        e.uploadError = true;
        e.errMsg = message;
      }
    });
    this.seeShowImportList();
  }
  // ???????????????????????????????????????????????????
  public setShowUploadTip(fileName: string, index: any) {
    this.importAllData.forEach((e: { fileName: string; index: any; showUploadTips: boolean; }, idx: any) => {
      if (e.fileName === fileName && e.index === index) {
        e.showUploadTips = false;
        this.importAllData.splice(idx, 1);
      }
    });
    this.seeShowImportList();
  }
  public seeShowImportList() {
    this.importAllData.forEach((e: { showUploadTips: boolean; }, idx: any) => {
      if (!e.showUploadTips) {
        this.importAllData.splice(idx, 1);
      }
    });
    const findStatus = this.importAllData.find((v: any) => {
      return v.showUploadTips === true;
    });
    if (findStatus) {
      this.showImportList = true; // ?????????????????????????????????????????????????????????
    } else {
      this.showImportList = false;
    }
  }
  /**
   * ????????????????????????????????????
   */
  public goThreadDumpDetail(item: any) {
    if (this.userRole === 'Admin' && (item.createdBy !== this.userId)) { return; }
    const params = { threaddumpName: item.id };
    sessionStorage.setItem('threaddumpReportTitle', item.reportName);
    sessionStorage.setItem('threaddumpId', item.id);
    sessionStorage.setItem('reportType', 'threaddump');
    this.downloadService.downloadItems.report.threaddumpName = params.threaddumpName;
    this.router.navigate(['threaddump', params.threaddumpName]);
  }
  // GC??????
  /**
   * ??????GCLogs????????????
   */
  async getGcLogLimit() {
    const gcLogLimit = await this.homeHttpServe.getGcLogLimit();
    this.downloadService.downloadItems.report.alarmGCLogsCount = gcLogLimit.alarmGcLogCount;
    this.downloadService.downloadItems.report.maxGCLogsCount = gcLogLimit.maxGcLogCount;
  }
  /**
   * ??????????????????????????????
   */
  public closeGCLogHint() {
    this.gcLogHint = true;
  }
  /**
   * ???????????????????????????
   */
  // flag???????????????????????????????????????
  private gcLogRequest(flag: any, id: string) {
    const params = { userId: id };
    this.Axios.axios.post('/gcLog/query', params).then((resp: any) => {
      if (resp.data.length) {
        this.gcLogWarn = false;
        this.gcLogHint = false;
        this.gcLogList = this.recordsSorted(resp.data);
        this.gcLogList.forEach((record) => {
          record.icon_url = this.stateUtil.heapdumpStateFormat(record.state);
        });
        this.gcLogWarnTip = this.i18n.common_term_gcLog_warning;
        this.gcLogHintTip = this.i18n.common_term_heapdump_hinting;
      } else {
        this.gcLogList = [];
      }
      if (this.userId === id) {
        this.curUserGcLogNum = this.gcLogList.length;
      }
    },
      (error: any) => {
        if (flag) {
          if (this.recordsTimer) { clearTimeout(this.recordsTimer); }
          this.recordsTimer = setTimeout(() => {
            this.gcLogRequest(true, id);
          }, 1000);
        }
      }
    );
  }
  /**
   * ??????????????????????????????
   */
  private gcLogUserRequest() {
    this.Axios.axios.get('/gcLog/list').then((resp: any) => {
      if (resp.data.length) {
        this.gcLogWarn = false;
        this.gcLogHint = false;
        this.gcLogList = this.recordsSorted(resp.data);
        this.gcLogList.forEach((record) => {
          record.icon_url = this.stateUtil.heapdumpStateFormat(record.state);
        });
        this.gcLogWarnTip = this.i18n.common_term_gcLog_warning;
        this.heapdumpHintTip = this.i18n.common_term_heapdump_hinting;
      } else {
        this.gcLogList = [];
      }
      this.curUserGcLogNum = this.gcLogList.length;
    },
    );
  }
  /**
   * ?????????????????????????????????
   */
  public importGCLogClick() {
    const samImport = this.elementRef.nativeElement.querySelector('#gcLogImport');
    samImport.click();
  }
  /**
   * ????????????????????????
   */
  public importGCLog() {
    // ?????????????????????????????? ??????????????????
    const token = sessionStorage.getItem('token');
    const language = sessionStorage.getItem('language');
    this.gcLogUploadConfig = {
      url: `${this.Axios.axios.defaults.baseURL}gcLog/actions/upload`,
      alias: 'file',
      headers: {
        Authorization: token,
        ['Accept-Language']: language
      },
      filters: [{
        name: 'maxSize',
        params: [250 * 1024 * 1024] // diskAfter   MIB*1024*1024
      }],
      onAddItemFailed: (fileObject: TiFileInfo, validResults: Array<string>): void => {
        const jfrSize = fileObject.size;
        if (jfrSize >= 250 * 1024 * 1024) {
          this.gcLogContent = this.i18n.common_term_upload_size;
        }
        if (this.heapdumpContent) {
          this.mytip.alertInfo({
            type: 'warn',
            content: this.gcLogContent,
            time: 10000,
          });
        }
        this.importModul.close();
      },
      onAddItemSuccess: (fileItem: TiFileItem): void => {
        if (fileItem.file.size >= this.workRemain) {
          this.gcLogContent = this.i18n.common_term_upload_disk;
          this.mytip.alertInfo({
            type: 'warn',
            content: this.gcLogContent,
            time: 10000,
          });
          fileItem.remove();
          this.importModul.close();
          return;
        }
        if (fileItem.file.size >= this.diskRemain) {
          this.gcLogContent = this.i18n.tip_msg.task_disk_error;
          this.mytip.alertInfo({
            type: 'warn',
            content: this.gcLogContent,
            time: 10000,
          });
          fileItem.remove();
          this.importModul.close();
          return;
        }
        this.initUploadStatus('gcLog');
        this.uploadStatus.uploadError = false;
        this.uploadStatus.errMsg = '';
        this.uploadStatus.fileName = fileItem.file.name;
        this.uploadStatus.sizeWithUnit = fileItem.file.sizeWithUnit;
        this.uploadStatus.title = `${this.uploadStatus.fileName} (${this.uploadStatus.sizeWithUnit}) `;
        this.uploadStatus.showUploadTips = true;
        this.uploadStatus.index = fileItem.index; // ????????????????????????
        let importDataArr = {};
        importDataArr = this.uploadStatus;
        this.importAllData.push(importDataArr);
        this.showImportList = true;
        this.importModul.close();
      },
      onCompleteItems: (fileItems: Array<TiFileItem>, response: string, status: number): void => {
        if (status === 0) {
          setTimeout(() => {
            this.setShowUploadTip(fileItems[0].file.name, fileItems[0].index);
          }, 3000);
        } else if (status === 200) {
          setTimeout(() => {
            this.setShowUploadTip(fileItems[0].file.name, fileItems[0].index);
            if (this.userRole === 'Admin') {
              this.gcLogRequest(false, this.moduleReportUserType.userId);
            } else {
              this.gcLogUserRequest();
            }
          }, 3000);
          this.downloadService.downloadItems.report.heapdumpList = this.heapdumpList.length;
        } else {
          const res = JSON.parse(response);
          this.setuploadError(fileItems[0].file.name, fileItems[0].index, res.message);
        }
      }
    },
      this.gcLogUploader = this.uploaderService.create(this.gcLogUploadConfig);
  }

  /**
   * ??????????????????????????????
   * @param id ??????id
   */
  public checkGCLogReportExporting(id: any): boolean {
    if (this.gcLogCurImportReports.indexOf(id) > -1) {
      return true;
    }
    return false;
  }
  /**
   * GCLog??????
   */
  public gcLogExportData(id: any, name: any) {
    if (!this.checkGCLogReportExporting(id)) {
      this.gcLogCurImportReports.push(id);
      this.Axios.axios.get(`/gcLog/actions/download/${encodeURIComponent(id)}`,
        { responseType: 'blob' }).then((resp: any) => {
          const loadIndex = this.gcLogCurImportReports.indexOf(id);
          if (loadIndex > -1) {
            this.gcLogCurImportReports.splice(loadIndex, 1);
          }
          const blob = new Blob([resp], { type: 'application/octet-stream' });
          // ??????????????????IE
          if ('msSaveOrOpenBlob' in navigator) {
            if (name.indexOf('.log') !== -1) {
              window.navigator.msSaveBlob(blob, `${name}`);
            } else {
              window.navigator.msSaveBlob(blob, `${name}.log`);
            }
          } else {
            const href = URL.createObjectURL(blob);
            const link: any = document.createElement('a');
            link.style.display = 'none';
            link.href = href;
            if (name.indexOf('.log') !== -1) {
              link.setAttribute('download', `${name}`);
            } else {
              link.setAttribute('download', `${name}.log`);
            }
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }
        }).catch((error: any) => {
          const loadIndex = this.gcLogCurImportReports.indexOf(id);
          if (loadIndex > -1) {
            this.gcLogCurImportReports.splice(loadIndex, 1);
          }
          const reader = new FileReader();
          reader.readAsText(error.response.data);
          reader.onload = (e) => {
            const msgObj = JSON.parse(reader.result as string);
            this.mytip.alertInfo({
              type: 'warn',
              content: msgObj.message,
              time: 10000,
            });
          };
        });
    }
  }
  /**
   * ??????GCLog??????
   * @param id GCLogID
   */
  public gcLogDeleteData(id: string) {
    this.gcLogDeleteModal.type = 'warn';
    this.gcLogDeleteModal.alert_show();
    if (this.userRole === 'Admin') {
      if (this.moduleReportUserType.userId === '1') {
        this.gcLogDeleteModal.alertTitle = this.i18n.common_term_delete_report;
      } else {
        this.gcLogDeleteModal.alertTitle = this.i18nService.I18nReplace(this.i18n.common_term_delete_user_report,
          { 0: this.moduleReportUserType.label });
      }
    } else {
      this.gcLogDeleteModal.alertTitle = this.i18n.common_term_delete_report;
    }
    this.gcLogDeleteModal.title = this.i18nService.I18nReplace(this.i18n.common_term_delete_report_title,
      { 0: this.i18n.common_term_memory_dump });
    this.gcLogDeleteModal.content = this.i18n.common_term_delete_report_content;
    this.gcLogDeleteModal.deleteStatu = true;
    this.gcLogDeleteId = id;
  }
  /**
   * ??????GC??????
   */
  public confirmGCLogDelete(event: boolean) {
    if (!event) { return; }
    this.Axios.axios.delete(`/gcLog/${encodeURIComponent(this.gcLogDeleteId)}`).then(
      (resp: any) => {
        if (resp.code === 0) {
          if (this.userRole === 'Admin') {
            this.gcLogRequest(false, this.moduleReportUserType.userId);
          } else {
            this.gcLogUserRequest();
          }
          this.downloadService.downloadItems.report.threaddumpList = this.threaddumpList.length;
        } else {
          this.mytip.alertInfo({
            type: 'error',
            content: resp.message,
            time: 10000,
          });
        }
      });
  }
  /**
   * ??????gc????????????????????????
   */
  public goGCLogDetail(item: any) {
    if (this.userRole === 'Admin' && (item.createdBy !== this.userId)) { return; }
    const params = { GCLogName: item.id };
    sessionStorage.setItem('GCLogReportTitle', item.logName);
    sessionStorage.setItem('GCLogId', item.id);
    sessionStorage.setItem('reportType', 'GCLog');
    this.downloadService.downloadItems.report.GCLogName = params.GCLogName;
    this.router.navigate(['offgclog', params.GCLogName]);
  }
}

