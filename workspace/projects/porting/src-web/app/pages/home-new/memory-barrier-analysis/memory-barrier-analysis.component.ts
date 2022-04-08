import {
    Component, OnInit, ElementRef, AfterContentInit,
    OnDestroy, ViewChild, AfterViewInit, HostListener
} from '@angular/core';
import { TiMessageService, TiValidationConfig, TiModalRef } from '@cloud/tiny3';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { Subscription, fromEvent } from 'rxjs';

import axios from 'axios';
import {
  RegService, PortWorkerStatusService, CommonService,
  MytipService, MessageService, AxiosService,
  I18nService, CustomValidators
} from '../../../service';

import { ACCEPT_TYPE, ACCEPT_TYPE_IE } from '../../../global/url';
import { fileSize, scan_type } from '../../../global/globalData';
import { isMac } from '../../../utils';
import { HyMiniModalService } from 'hyper';
import { EnhancementsApi } from '../../../api';
import { Status } from '../../../modules';

const JSZip = require('jszip');
const hardUrl: any = require('../../../../assets/hard-coding/url.json');
const scanType = {
    byteCheck: '1', // 字节对齐检查类型
    preCheck: '2', // 64位迁移预检类型
    cacheCheck: '12' // 缓存行对齐类型
};
@Component({
    selector: 'app-memory-barrier-analysis',
    templateUrl: './memory-barrier-analysis.component.html',
    styleUrls: ['./memory-barrier-analysis.component.scss']
})
export class MemoryBarrierAnalysisComponent implements OnInit, AfterContentInit, OnDestroy, AfterViewInit {
    hoverFlag: boolean;
    outfilepath: any;
    cmdHolder: any;
    cmdworkspace: string;
    constructor(
        public mytip: MytipService,
        public i18nService: I18nService,
        public Axios: AxiosService,
        public msgService: MessageService,
        private timessage: TiMessageService,
        private miniModalServe: HyMiniModalService,
        private elementRef: ElementRef,
        public router: Router,
        private commonService: CommonService,
        private regService: RegService,
        private portWorkerStatusService: PortWorkerStatusService,
        private enhancementsApi: EnhancementsApi
    ) {
        this.i18n = this.i18nService.I18n();
    }
    @ViewChild('moremask', { static: false }) moreMask: any;
    @ViewChild('exitmask', { static: false }) exitMask: any;
    @ViewChild('saveasmask', { static: false }) saveasMask: any;
    @ViewChild('bcUpload', { static: false }) bcUpload: any;
    @ViewChild('bcDownload', { static: false }) bcDownload: any;

    public compilerConfigurationFile: any; // 生成编译器配置文件选项
    public noFileSelected = false;
    public bcGenerateTaskId: any; // 静态检查任务ID
    public maximumTime: any; // 上传等待定时器
    public fileExceed = false; // 文件超过 1G
    public bcOptions: Array<any> = [];
    public bcDisabled: any;
    public bcSelecteds: any;
    public bcFileList: Array<any> = [];
    public i18n: any;
    public isIE: boolean; // 是否为 IE 浏览器
    public uploadType = '';
    public workspace = '';
    public backworkspace = '';
    public isDisabled = false;
    public isCheck: boolean;
    public isWebpacking = false;
    public isBlank = false;
    public currLang: any;
    public situation = 0;
    public filename = '';
    public filenameTip = '';
    public inputPrompt1 = '';
    public inputValuePrecheck = '';
    public inputValueByte = '';
    public inputValueCache = '';
    public id = '';
    public count = 0;
    public count1 = 0;
    public countByteAlign = 0;
    public countCache = 0;
    public progressData = {};
    public isAlermOpt = false; // 告警时禁止操作
    public progressContext = {};
    public sampleBtnTip = '';
    public info = '';
    public areaMatchHeight: number;
    public pathlist: Array<any> = [];
    public displayAreaMatch = false;
    public multipleInput = false;
    public info1 = {
        filename: '',
        filesize: ''
    };

    public waiting: boolean; // 任务是否处于等待中
    public uploadProgress = '';
    public isShow = false; // 上传进度条
    public isCompress = false; // 是否上传解压中
    public selectType: any = {
        options: [],
        selectedId: '',
        curSelObj: {},
    };
  public cancelFile: any; // 取消文件夹上传 axios 请求
  config = {
    onUploadProgress: (progressEvent: any) => {
      let complete = ((progressEvent.loaded / progressEvent.total) * 100) || 0 / 2 + 50;
      complete = Math.min(complete, 100);
      if (!sessionStorage.getItem('token')) {
        this.cancelFile();
        return;
      }
      this.msgService.sendMessage({
        type: 'uploadingContainer',
        name: 'barrier',
        data: 'start',
        isShow: true,
        isConpress: false,
        uploadProgress: complete + '%'
      });
      if (complete === 100) {
        // 上传源代码-文件夹时不展示“解压中”
        this.msgService.sendMessage({
          type: 'uploadingContainer',
          name: 'barrier',
          data: 'start',
          isShow: false,
          isConpress: true,
          uploadProgress: complete + '%'
        });
      }
    }
  };
    public cancel: any; // 取消 axios 请求
    alreadyconfig = {
        onUploadProgress: (progressEvent: any) => {
            const complete = Math.floor(progressEvent.loaded / progressEvent.total * 100);
            if (!sessionStorage.getItem('token')) {
                this.cancel();
                return;
            }
            this.msgService.sendMessage({
                type: 'uploadingContainer',
                name: 'barrier',
                data: 'start',
                isShow: true,
                isCompress: false,
                uploadProgress: complete + '%'
            });

            if (complete === 100) {
                this.msgService.sendMessage({
                    type: 'uploadingContainer',
                    name: 'barrier',
                    data: 'start',
                    isShow: false,
                    isCompress: true,
                    uploadProgress: complete + '%'
                });
            }
        }
    };

    public timer: any = null;
    public upTimes = 0;
    public isSlow = false;

    private creatingProgressSub: Subscription;

    public createBtnDisabled = false;
    public createBtnDisabledTip = '';

    public byteAccrptType: string; // 压缩包上传支持类型
    public weakAccrptType: string;
    public isMac: boolean;

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
                    id: 0,
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
    public commandControl: any;
    public weakControl: any;
    public confirmUploadZip: any;
    public maxFilenameLength: any;
    public maxFilenameLengthArm: any;
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
    public isUploadZip = false;
    public uploadZipFile: any;
    public uploadPackFile: any;
    public uploadFolderFileList: any;
    public exitFileName = '';
    public exitFileNameReplace = '';
    public fileNameDelete = '';
    public suffix = '';
    public deleteValueCode = '';
    public isDeletePack = false;
    public EnhancedType: string; // 当前检查类型
    public uploadResultTip = {
        state: '',
        content: ''
    };
    public uploadStartFlag = false;

    public weakEnvironment: string; // 运行环境版本
    public noEnvironment = false; // 环境不满足
    public guideList: Array<string>; // 指导列表
    public linkUrl: Array<any>; // 指导链接

    public customizePath: string; // 用户自定义安装路径
    public weakModeList: any;
    public weakModeSel: number;
    public weakFileList: any;
    public weakFileSel: number;
    public weakStepList: any = [];
    public uploadCompilerTip = { // 编译命令提示
        state: '',
        content: ''
    };
    public oldName: any;
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
    public isCommit = false; // 历史报告是否达到最大值
    public BCCommit: boolean;
    public cancelBlur = true;
    @HostListener('window:mousedown', ['$event'])
    handleMouseDown(event: any) {
        let tarArray = [];
        if (event.target.className.includes(' ')) {
            tarArray = event.target.className.split(' ');
        }
        if (
            event.target.className === 'areaMatchDiv'
            || tarArray[0] === 'areaMatchWeakDisplay'
            || tarArray[0] === 'areaMatch'
            || tarArray[0] === 'areaMatchWeakDiv'
        ) {
            this.cancelBlur = false;
            event.stopPropagation();
        } else {
            this.cancelBlur = true;
            this.blurAreaMatch();
        }
    }
    ngOnDestroy(): void {
        if (this.creatingProgressSub) { this.creatingProgressSub.unsubscribe(); }
        sessionStorage.removeItem('enhancedPrecheckPathName');
        sessionStorage.removeItem('enhancedBytePathName');
        sessionStorage.removeItem('enhancedCachePathName');
        sessionStorage.removeItem('memoryBarrierweakFileName');
        sessionStorage.removeItem('memoryBarrierweakCompilerName');
    }

    // 显示多文件上传 modal
    showBcDownloadModal() {
        this.bcDownload.showBcDownloadModal();
    }

    ngOnInit() {
        this.isMac = isMac();
        this.isIE = this.commonService.isIE11();
        this.byteAccrptType = this.isMac || this.isIE
          ? ACCEPT_TYPE_IE.byteAlignment
          : ACCEPT_TYPE.byteAlignment;
        this.weakAccrptType = this.isMac || this.isIE
          ? ACCEPT_TYPE_IE.weakCheck
          : ACCEPT_TYPE.weakCheck;

        this.compilerConfigurationFile = {
          title: this.i18n.check_weak.compiler_tool_configuration,
          checked: false,
          disabled: false
        };
        this.isCheck = JSON.parse(sessionStorage.getItem('isCheck'));
        this.inputItems.tool.selected = this.inputItems.tool.options[0]; // 字节对齐编译命令默认make
        this.inputItems.path.label = this.i18n.common_term_ipt_label.source_code_path;
        this.inputItems.version.label = this.i18n.common_term_ipt_label.compiler_version;
        this.inputItems.tool.label = this.i18n.common_term_ipt_label.construct_tool;
        this.inputItems.command.label = this.i18n.common_term_ipt_label.compile_command;
        this.inputItems.linuxOS.label = this.i18n.common_term_ipt_label.target_os;
        this.inputItems.fortran.label = this.i18n.common_term_ipt_label.fortran;
        this.inputItems.kernelVersion.label = this.i18n.common_term_ipt_label.target_system_kernel_version;
        this.commandControl = new FormControl('', [CustomValidators.commandControlForByte(this.i18n, this)]);
        this.weakControl = new FormControl(
            { value: '', disabled: this.isCheck || !this.weakEnvironment || this.createWeakCompilerDisabled },
            [CustomValidators.commandLength(this.i18n)]
            );
        this.maxFilenameLength = new FormControl('',
          [CustomValidators.filenameLength(this.i18n), CustomValidators.filenameCheck(this.i18n)]);
        this.maxFilenameLengthArm = new FormControl(
            {value: '', disabled: this.isCheck || !this.weakEnvironment || this.createWeakCompilerDisabled },
            [CustomValidators.filenameLength(this.i18n), CustomValidators.filenameCheck(this.i18n)]
        );
        this.noAgain = true;
        this.selectType.options = [
            {
                key: this.i18n.enhanced_functions_label.precheck,
                id: 'precheck',
                path: 'precheck/',
                disable: false,
                isNormalImg: './assets/img/migration-center/precheck_normal.svg',
                isSelectedImg: './assets/img/migration-center/precheck_hover.svg',
                desc: this.i18n.enhanced_functions_label.precheck_desc
            },
            {
                key: this.i18n.enhanced_functions_label.byte,
                id: 'byte',
                path: 'bytecheck/',
                disable: false,
                isNormalImg: './assets/img/migration-center/byte_normal.svg',
                isSelectedImg: './assets/img/migration-center/byte_hover.svg',
                desc: this.i18n.enhanced_functions_label.byte_desc
            },
            {
                key: this.i18n.enhanced_functions_label.cache,
                id: 'cache',
                path: 'cachecheck/',
                disable: false,
                isNormalImg: './assets/img/migration-center/cache_normal.svg',
                isSelectedImg: './assets/img/migration-center/cache_hover.svg',
                desc: this.i18n.enhanced_functions_label.cache_desc
            },
            {
                key: this.i18n.enhanced_functions_label.weak,
                id: 'weak',
                path: 'weakconsistency/',
                disable: false,
                isNormalImg: './assets/img/migration-center/weak_normal.svg',
                isSelectedImg: './assets/img/migration-center/weak_hover.svg',
                desc: this.i18n.enhanced_functions_label.weak_desc
            }
        ];
        this.weakModeList = [
            { id: 1, name: this.i18n.check_weak.mode_1, active: true },
            { id: 0, name: this.i18n.check_weak.mode_0, active: false }
        ];
        this.weakModeSel = 1; // 内存一致性检查模式，静态检查

        this.weakFileList = [
            { id: 0, name: this.i18n.check_weak.mode_2, active: true },
            { id: 1, name: this.i18n.check_weak.mode_3, active: false }
        ];
        this.weakFileSel = 0; // 内存一致性上传类型，源码上传

        this.weakStepList = [
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
        // 获取当前检查类型，默认值为precheck
        this.EnhancedType = sessionStorage.getItem('EnhancedType');
        let selIdx = 0;
        if (this.EnhancedType) {
            selIdx = this.selectType.options.findIndex((opt: any) => opt.id === this.EnhancedType);
        } else {
            this.EnhancedType = 'precheck';
        }
        this.selectType.selectedId = this.selectType.options[selIdx].id;
        this.selectType.curSelObj = this.selectType.options[selIdx];

        sessionStorage.setItem('routerFile', 'false');
        sessionStorage.setItem('routerFileDQJC', 'false');
        this.progressData = {
            id: 'disk',
            label: '',
            isShow: false,
            value: 0
        };
        if (sessionStorage.getItem('isFirst') !== '1' && sessionStorage.getItem('isExpired') !== '1') {
            // 禁用表单校验 否则 disabled属性不会生效
            if (this.isCheck) {// 内存一致性
                this.weakControl.disable();
                this.maxFilenameLengthArm.disable();
            }
            this.Axios.axios.get(`/customize/`).then((resp: any) => {
                if (this.commonService.handleStatus(resp) === 0) {
                    this.customizePath = resp.data.customize_path;
                    // 获取到路径后再去获取环境
                    if (this.EnhancedType === 'weak' && !this.isCheck) {
                        this.checkEnvironment();
                    }
                    this.workspace = `${resp.data.customize_path}/portadv/${sessionStorage.getItem('username')}/`
                        + this.selectType.options[selIdx].path;
                    this.inputPrompt1 = this.i18nService.I18nReplace(
                        this.i18n.common_term_analysis_source_code_path3,
                        {1: this.workspace}
                    );
                    this.inputWeak = this.i18nService.I18nReplace(
                        this.i18n.common_term_analysis_source_code_path3,
                        {1: this.workspace}
                    );
                    this.cmdworkspace =
                        `${resp.data.customize_path}/portadv/${sessionStorage.getItem('username')}/`;
                    this.cmdHolder = this.i18nService.I18nReplace(
                        this.i18n.check_weak.cmd_holder,
                        { 0: `${this.cmdworkspace}` }
                    );
                }
            });
            // 此全组件初始化加载时的有结果就限制使用
            const msgList = sessionStorage.getItem('resultMsgList');
            const resultMsgList = msgList ? JSON.parse(msgList) : [];
            const sourceCodeMsgLen = resultMsgList.filter((msg: any) => msg.type === 'PortingPreCheck').length;
            const byteAlignmentLen = resultMsgList.filter((msg: any) => msg.type === 'ByteAlignment').length;
            const cacheCheck = resultMsgList.filter((msg: any) => msg.type === 'CachelineAlignment').length;
            if (sourceCodeMsgLen > 0) {
                this.createBtnDisabled = true;
                this.createBtnDisabledTip = this.i18n.common_term_creating_btn_disabled_tip;
            }
            if (byteAlignmentLen > 0 || cacheCheck > 0) {
              this.createBtnDisabled = true;
            }
        }

        // 查看任务是否处于等待中
        const token = sessionStorage.getItem('token');
        // 如果为内存一致性
        if (this.selectType.curSelObj.id === 'weak') {
          const numTask1 = JSON.parse(sessionStorage.getItem('BcMaximumTask'));
          const numTask2 = JSON.parse(sessionStorage.getItem('memorySourceMaximumTask'));
          const numTask = numTask1 + numTask2;
          if (token && numTask > 0 && numTask < 20) {
            this.isCompress = true;
            this.waiting = true;
          }
        } else { // 64位运行模式检查 及 结构体字节检查
          const numTask = JSON.parse(sessionStorage.getItem('precheckMaximumTask'));
          if (token && numTask > 0 && numTask < 20) {
            this.isCompress = true;
            this.waiting = true;
          }
        }

        this.creatingProgressSub = this.msgService.getMessage().subscribe(msg => {
            switch (msg.type) {
                case 'taskComplete':
                  if (msg.data.type === 'CachelineAlignment') {
                    sessionStorage.removeItem('cacheCheckTaskPath');
                  } else if (msg.data.type === 'PortingPreCheck') {
                    sessionStorage.removeItem('preCheckTaskPath');
                  } else if (msg.data.type === 'ByteAlignment') {
                    sessionStorage.removeItem('byteCheckTaskPath');
                  }
                  break;
                case 'CreatingCachelineProgress':
                  // 监听缓存行对齐检查，分析中按钮置为不可用
                  this.createBtnDisabled = msg.data;
                  this.createBtnDisabledTip = msg.data ? this.i18n.common_term_creating_btn_disabled_tip : '';
                  break;
                case 'CreatingPreCheckProgress':
                    // 监听64位迁移预检，分析中按钮置灰
                    this.createBtnDisabled = msg.data;
                    this.createBtnDisabledTip = msg.data ? this.i18n.common_term_creating_btn_disabled_tip : '';
                    break;
                case 'CreatingByteAlignmentProgress':
                    // 监听字节对齐预检，分析中按钮置灰
                    this.createBtnDisabled = msg.data;
                    this.createBtnDisabledTip = msg.data ? this.i18n.common_term_creating_btn_disabled_tip : '';
                    break;
                case 'CreatingCacheAlignmentProgress':
                    // 监听cacheline，分析中按钮置灰
                    this.createBtnDisabled = msg.data;
                    this.createBtnDisabledTip = msg.data ? this.i18n.common_term_creating_btn_disabled_tip : '';
                    break;
                case 'creatingWeakCheckProgress':
                    // 监听内存一致性检查，分析中按钮置灰
                    this.createWeakBtnDisabled = msg.data;
                    this.compilerConfigurationFile.disabled = msg.data;
                    this.createWeakBtnDisabledTip = msg.data ? this.i18n.common_term_creating_btn_disabled_tip : '';
                    break;
                case 'creatingWeakCompilerProgress':
                    // 监听编译命令，构建中无法点击下一步
                    this.createWeakCompilerDisabled = msg.data;
                    if (!this.createWeakCompilerDisabled) {
                        this.maxFilenameLengthArm.enable();
                        this.weakControl.enable();
                    }else{
                        this.maxFilenameLengthArm.disable();
                        this.weakControl.disable();
                    }
                    if (msg.state === 'failed') {
                        this.curStep = 1;
                    }
                    break;
                case 'creatingResultMsg':
                    // 内存一致性静态检查有结果后 返回第一步
                    if (msg.data.type === 'weakCheck') {
                        this.curStep = 1;
                        this.weakFileName = '';
                        this.inputItems.weakTool.value = '';
                    } else if (msg.data.type === 'weakCompiler' &&  msg.data.state === 'success') { // 监听编译命令，有结果后显示编译文件
                        const index = msg.data.result.lastIndexOf('/') + 1;
                        this.weakCompilerName = msg.data.result.slice(index);
                        this.getBcList(msg.data.id);
                        this.curStep = 2;
                    }
                    break;
                case 'uploadingContainer':
                    // 监听压缩包上传弹框
                    if (msg.name === 'barrier') {
                        this.isShow = msg.isShow;
                        this.isCompress = msg.isCompress;
                        if (msg.data === 'start') {
                            this.uploadProgress = msg.uploadProgress;
                            const info1 = sessionStorage.getItem('memoryBarrierFileInfo');
                            if (info1) {
                                this.info1 = JSON.parse(info1);
                            }
                        } else if (msg.data === 'end') {
                            // 64位 运行模式 or 结构体字节对齐
                            if (!msg.extraName) {
                                if ((msg.path || msg.path === '') && msg.scan_type === scan_type.byteCheck) {
                                    this.inputValueByte = msg.path;
                                    sessionStorage.setItem('enhancedBytePathName', msg.path);
                                } else if ((msg.path || msg.path === '') && msg.scan_type === scan_type.preCheck) {
                                    this.inputValuePrecheck = msg.path;
                                    sessionStorage.setItem('enhancedPrecheckPathName', msg.path);
                                } else if ((msg.path || msg.path === '') && msg.scan_type === scan_type.cacheCheck) {
                                    this.inputValueCache = msg.path;
                                    sessionStorage.setItem('enhancedCachePathName', msg.path);
                                }
                                this.uploadResultTip.state = msg.state;
                                this.uploadResultTip.content = msg.content;
                            } else { // 内存一致性
                                // 源码文件
                                if (msg.extraName === 'weakFile') {
                                    if (msg.path || msg.path === '') {
                                        this.weakFileName = msg.path;
                                        sessionStorage.setItem('memoryBarrierweakFileName', msg.path);
                                    }
                                    this.uploadResultTip.state = msg.state;
                                    this.uploadResultTip.content = msg.content;
                                } else { // 构建命令
                                    if (msg.path || msg.path === '') {
                                        this.weakCompilerName = msg.path;
                                        sessionStorage.setItem('memoryBarrierweakCompilerName', msg.path);
                                    }
                                    this.uploadCompilerTip.state = msg.state;
                                    this.uploadCompilerTip.content = msg.content;
                                }
                            }
                        } else { // 任务等待中
                          this.waiting = true;
                        }
                    }
                    break;
                default:
                    this.uploadResultTip.content = '';
                    break;
            }
        });


        const precheckPathName = sessionStorage.getItem('enhancedPrecheckPathName');
        const bytePathName = sessionStorage.getItem('enhancedBytePathName');
        const cachePathName = sessionStorage.getItem('enhancedCachePathName');
        const weakFileName = sessionStorage.getItem('memoryBarrierweakFileName');
        const weakCompilerName = sessionStorage.getItem('memoryBarrierweakCompilerName');
        if (precheckPathName) {
            this.inputValuePrecheck = precheckPathName;
        }
        if (bytePathName) {
            this.inputValueByte = bytePathName;
        }
        if (cachePathName) {
            this.inputValueCache = cachePathName;
        }
        // 内存一致性 源码文件
        if (weakFileName) {
            this.weakFileName = weakFileName;
        }
        // 内存一致性 构建命令
        if (weakCompilerName) {
            this.weakCompilerName = weakCompilerName;
        }

        this.currLang = sessionStorage.getItem('language');

        /**
         * 1.迁移预检在完成的时候，用户选择确认关闭，不去查看预检报告，后端是否要记录报告查看的状态；
         * 2.有分析报告未查看，改为右下角消息框，并将预检按钮置灰；
         */
        if (sessionStorage.getItem('isFirst') !== '1' && sessionStorage.getItem('isExpired') !== '1') {
            this.checkStatus();
            this.checkStatusDQJC();
            this.checkStatusCache();
            this.getTaskUndone();
        }
        this.confirmUploadZip = new FormControl('', [CustomValidators.confirmNewName(this.i18n)]);
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

    // 检查运行环境GCC版本和GLIBC版本
    checkEnvironment() {
        this.Axios.axios.get('/portadv/weakconsistency/tasks/environment/').then((resp: any) => {
            if (this.commonService.handleStatus(resp) === 0) {
                const data = resp.data;
                this.targetos = data.os_version;
                const symbol = this.currLang === 'zh-cn' ? '、' : ', ';
                this.weakEnvironment = data.os_version
                    + symbol
                    + data.glibc_version
                    + this.i18n.check_weak.mode_tip_1;
                this.maxFilenameLengthArm.reset(
                    {value: '', disabled: this.isCheck || !this.weakEnvironment || this.createWeakCompilerDisabled}
                    );
                this.weakControl.reset(
                    { value: '', disabled: this.isCheck || !this.weakEnvironment || this.createWeakCompilerDisabled }
                    );
                // 环境不满足时，后端已删除该状态码的使用，为兼容性暂保留
                if (resp.status === '0x0b0301' && sessionStorage.getItem('weakGuideShow') !== 'false') {
                    this.noEnvironment = true;
                    sessionStorage.setItem('weakGuideShow', 'true');
                    this.guideList = [
                        this.i18nService.I18nReplace(this.i18n.weak_env_no.tip_1, { 1: `${this.customizePath}` }),
                        this.i18nService.I18nReplace(this.i18n.weak_env_no.tip_2, { 1: `${this.customizePath}` })
                    ];
                    this.linkUrl = data.package_type === 'rpm'
                        ? [
                            { text: 'libstdc++', link: hardUrl.weakLibstdcRpm },
                            { text: 'libtinfo', link: hardUrl.weakLibtinfoRpm }
                        ]
                        : [
                            { text: 'libstdc++', link: hardUrl.weakLibstdcDeb },
                            { text: 'libtinfo', link: hardUrl.weakLibtinfoDeb }
                        ];
                }
            } else {
              const content = this.currLang === 'zh-cn' ? resp.infochinese : resp.info;
              this.mytip.alertInfo({ type: 'error', content, time: 5000 });
            }
        });
    }

    // 关闭安装指导
    handleCloseGuide() {
        this.noEnvironment = false;
        sessionStorage.setItem('weakGuideShow', 'false');
    }

    // 查询是否有正在执行的内存一致性任务
    getTaskUndone() {
        this.Axios.axios.get('/portadv/weakconsistency/tasks/taskundone/').then((resp: any) => {
            if (this.commonService.handleStatus(resp) === 0 && resp.data.length) {
                this.reportId = resp.data[0].task_name;
                const type = resp.data[0].task_type;
                if (type === 9) {
                    this.msgService.sendMessage({
                        type: 'creatingTask',
                        data: {
                            id: this.reportId,
                            type: 'weakCompiler'
                        }
                    });
                    this.createWeakCompilerDisabled = true;
                    this.maxFilenameLengthArm.disable();
                    this.weakControl.disable();
                } else if (type === 10) {
                    this.msgService.sendMessage({
                        type: 'creatingTask',
                        data: {
                            id: this.reportId,
                            type: 'weakCheck'
                        }
                    });
                    this.createWeakBtnDisabled = true;
                    this.createWeakBtnDisabledTip = this.i18n.common_term_creating_btn_disabled_tip;
                }
            }
        });
    }

    ngAfterContentInit(): void {
        setTimeout(() => {
            const areaMatch = this.elementRef.nativeElement.querySelector('.areaMatch');
            if (areaMatch) {
                this.areaMatchHeight = areaMatch.offsetHeight;
            }
        }, 0);
    }

    selectTypeChange(option: any) {
        this.noFileSelected = false;
        this.inputValuePrecheck = '';
        this.inputValueByte = '';
        this.inputValueCache = '';
        this.maxFilenameLength.reset('');
        this.maxFilenameLengthArm.reset('');
        this.selectType.selectedId = option.id;
        this.selectType.curSelObj = option;
        const path = option.path;
        if (this.customizePath) {
            this.workspace = `${this.customizePath}/portadv/${sessionStorage.getItem('username')}/` + path;
            this.uploadResultTip.content = '';
            this.inputPrompt1 =
                this.i18nService.I18nReplace(
                this.i18n.common_term_analysis_source_code_path3,
                {1: this.workspace}
                );
            this.inputWeak =
                this.i18nService.I18nReplace(
                this.i18n.common_term_analysis_source_code_path3,
                {1: this.workspace}
                );
        }
        if (option.id === 'weak' && !this.isCheck) {
            this.checkEnvironment();
        }
        sessionStorage.setItem('EnhancedType', option.id);
        this.EnhancedType = sessionStorage.getItem('EnhancedType');
        this.commandChange(this.inputItems.tool.selected);
    }

    /**
     * 64位迁移预检，字节对齐，内存一致性输入框键入匹配
     */
    keyupAreaMatch(screen: string) {
        if (sessionStorage.getItem('isFirst') !== '1' && sessionStorage.getItem('isExpired') !== '1') {
            const path = this.getTextareaString(screen);
            this.inputAreaMatch(path);
        }
    }
    /**
     *  路径模糊查找
     */
    inputAreaMatch(path: string) {
        if (sessionStorage.getItem('isFirst') !== '1' && sessionStorage.getItem('isExpired') !== '1') {
            this.pathlist = [];
            let filename;
            if (path) {
                const lastIndex = path.lastIndexOf(',');
                if (lastIndex) {
                    filename = path.slice(lastIndex + 1, path.length);
                } else {
                    filename = path;
                }
            } else {
                filename = path;
            }
            const params = { path: this.selectType.curSelObj.path + filename };
            this.Axios.axios.post('/pathmatch/', params).then((data: any) => {
                const arrBefore = path.split(',');
                if (data) {
                    let arrAfter = data.pathlist;
                    let idx = path.lastIndexOf(',');
                    if (idx >= 0) { idx = path.length - idx; }
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
    /**
     * 64位迁移预检，字节对齐，内存一致性textarea 聚焦事件
     */
    focusTextArea(screen: string) {
        this.displayAreaMatch = true;
        this.uploadResultTip.content = '';
        this.noFileSelected = false;
        const path = this.getTextareaString(screen);
        this.inputAreaMatch(path);
        const areaMatch = this.elementRef.nativeElement.querySelector('.areaMatch');
        if (areaMatch) {
            this.areaMatchHeight = areaMatch.offsetHeight;
        }
    }
    /**
     * 64位迁移预检，字节对齐，内存一致性输入框失焦事件
     */
    blurAreaMatch() {
        if (this.cancelBlur) {
          this.displayAreaMatch = false;
        } else {
            this.displayAreaMatch = true;
        }
    }
    /**
     * 64位迁移预检，字节对齐，内存一致性输入框填充内容
     */
    clickAreaMatch(value: any, screen: string) {
        this.fillTextarea(value, screen);
        this.displayAreaMatch = false;
        this.pathlist = [];
        if (screen === 'weak'){
            // 解决 IE 下点击后无法自动失焦情况
            this.elementRef.nativeElement.querySelector('.areaMatchWeakDiv').blur();
        } else { // precheck, byte, cache
            // 解决 IE 下点击后无法自动失焦情况
            this.elementRef.nativeElement.querySelector('.areaMatch').blur();
        }
    }
    /**
     * 填充转换输入框内容
     */
    fillTextarea(value: any, screen: string){
        let textareaString = this.getTextareaString(screen);
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
     * 获取当前页面对应的输入框内容
     */
    getTextareaString(screen?: string){
        let inputStr: string;
        const scene = screen || this.EnhancedType;
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
     * 重置当前页面对应的输入框内容
     */
    resetTextareaString(resetStr: string, screen?: string){
        const scene = screen || this.EnhancedType;
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

    chooseLangType(data: any) {
        const info = this.currLang === 'zh-cn' ? data.infochinese : data.info;
        return info;
    }

    // 返回的id数据处理2019_08_22_11_43_55 => 2019/08/22 11:43:55
    formatCreatedId(data: any) {
        const years = data.slice(0, 4);
        const months = data.slice(4, 6);
        const days = data.slice(6, 8);
        const hours = data.slice(8, 10);
        const minutes = data.slice(10, 12);
        const seconds = data.slice(12, 14);
        return `${years}/${months}/${days} ${hours}:${minutes}:${seconds}`;
    }

    public commandChange(data: any) {
        if (data.label === 'automake') {
            this.inputItems.command.value = 'make';
            this.commandControl.disable();
        } else {
            this.inputItems.command.value = data.label;
            this.commandControl.enable();
        }
    }

    // 切换回来检查状态
    public checkStatus() {
        this.Axios.axios.get('/portadv/tasks/migrationrunning/').then((data: any) => {
            if (this.commonService.handleStatus(data) === 0) {
                this.count1 = 0;
                if (data.data.id) {
                    this.msgService.sendMessage({
                        type: 'creatingTask',
                        data: {
                            id: data.data.id,
                            type: 'PortingPreCheck'
                        }
                    });
                    this.createBtnDisabled = true;
                    this.createBtnDisabledTip = this.i18n.common_term_creating_btn_disabled_tip;
                }
            } else {
                this.count1++;
                if (this.count1 <= 3) {
                    this.checkStatus();
                }
            }
        }).catch((error: any) => {
            this.count1++;
            if (this.count1 <= 3) {
                this.checkStatus();
            }
        });
    }

    // 切换回来检查状态对齐检查
    public checkStatusDQJC() {
        this.Axios.axios.get('/portadv/tasks/migration/bytealignment/taskinfo/').then((data: any) => {
            if (this.commonService.handleStatus(data) === 0) {
                this.countByteAlign = 0;
                if (data.data.task_id) {
                    this.msgService.sendMessage({
                        type: 'creatingTask',
                        data: {
                            id: data.data.task_id,
                            type: 'ByteAlignment'
                        }
                    });
                    this.createBtnDisabled = true;
                    this.createBtnDisabledTip = this.i18n.common_term_creating_btn_disabled_tip;
                }
            } else {
                this.countByteAlign++;
                if (this.countByteAlign <= 3) {
                    this.checkStatusDQJC();
                    this.createBtnDisabled = true;
                    this.createBtnDisabledTip = this.i18n.common_term_creating_btn_disabled_tip;
                }
            }
        }).catch((error: any) => {
            this.countByteAlign++;
            if (this.countByteAlign <= 3) {
                this.checkStatusDQJC();
            }
        });
    }
    // 查看有无正在执行的对齐检查任务
    public checkStatusCache() {
        this.Axios.axios.get('/portadv/tasks/migration/cachelinealignment/task/').then((data: any) => {
          if (this.commonService.handleStatus(data) === 0) {
            this.countCache = 0;
            if (data.data.task_id) {
                this.msgService.sendMessage({
                    type: 'creatingTask',
                    data: {
                    id: data.data.task_id,
                    type: 'CachelineAlignment'
                    }
                });
                this.createBtnDisabled = true;
                this.createBtnDisabledTip = this.i18n.common_term_creating_btn_disabled_tip;
            }
          } else {
            this.countCache++;
            if (this.countCache <= 3) {
                this.checkStatusCache();
                this.createBtnDisabled = true;
                this.createBtnDisabledTip = this.i18n.common_term_creating_btn_disabled_tip;
            }
          }
        }).catch((error: any) => {
          this.countCache++;
          if (this.countCache <= 3) {
            this.checkStatusCache();
          }
        });
    }
    public zipUpload() {
        this.noFileSelected = false;
        this.elementRef.nativeElement.querySelector('#zipload').value = '';
        this.elementRef.nativeElement.querySelector('#zipload').click();
    }

    showUpload() {
        this.hoverFlag = true;
    }
    hideUpload() {
        this.hoverFlag = false;
    }

    // 文件夹压缩处理
    handleToZip(choice: string, type: string, e?: any) {
        this.exitMask.Close();
        this.isUploadZip = false;
        this.uploadStartFlag = false;
        this.isShow = false;
        const zip = new JSZip();
        let fileList;
        let inputDom;
        let filepath: any;
        const file = {
            name: this.outfilepath + '.zip'
        };
        if (choice === 'normal') {
            // file.files 是一个fileList对象 fileList里面是file对象
            if (type === scan_type.preCheck
                || type === scan_type.byteCheck
                || type === scan_type.cacheCheck) {
                inputDom = this.elementRef.nativeElement.querySelector('#filesbeta');
            } else {
                inputDom = this.elementRef.nativeElement.querySelector('#files');
            }
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
        this.info1.filename = this.outfilepath;
        for (const fileItem of fileList) {
            const element = fileItem;
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
            e.target.value = '';
            return null;
        }
        this.info1.filesize = size.toFixed(1);
        return {
            file,
            zip,
            filepath,
            sizeCount
        };
    }

    // 内存一致性上传文件夹
    public toZipWeak(choice: string, type: string, event?: any): any {
        const { zip, filepath, sizeCount, file } = this.handleToZip(choice, type, event);
        let params;
        if (choice === 'save_as') {
            params = {
                file_size: sizeCount,
                file_name: this.exitFileName + '.zip',
                need_unzip: 'true',
                scan_type: type,
                choice
            };
            this.info1.filename = this.exitFileName + '.zip';
        } else if (choice === 'override') {
          params = {
            file_size: sizeCount,
            file_name: this.oldName + '.zip',
            need_unzip: 'true',
            scan_type: type,
            choice
          };
          this.info1.filename = this.oldName + '.zip';
        } else {
          params = {
              file_size: sizeCount,
              file_name: this.outfilepath + '.zip',
              need_unzip: 'true',
              scan_type: type,
              choice
          };
        }
        this.uploadProgress = '0%';
        sessionStorage.setItem('sourceCodeFileInfo', JSON.stringify(this.info));
        this.Axios.axios.post('/portadv/tasks/check_upload/', params).then((data: any) => {
            this.displayAreaMatch = false;
            if (this.commonService.handleStatus(data) === 0) {

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
                        if (!sessionStorage.getItem('token')) {
                            metadata.pause();
                            zip.remove(filepath);
                        }
                        const progress = (metadata.percent / 2).toFixed(2);
                        if (Number(progress) >= 50) {
                            return;
                        }
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

                        // 将用户选中的文件夹或者文件上传至服务器
                        this.searchUploadSourceFile(choice, type, formData, file, times);
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
                    this.exitFileNameReplace = this.i18nService.I18nReplace(
                        this.i18n.analysis_center.exit.content,
                        { 1: data.data.old_name }
                    );
                    this.exitMask.Open();
                } else {
                    this.uploadResultTip.state = 'error';
                    this.uploadResultTip.content = this.currLang === 'zh-cn' ? data.infochinese : data.info;
                    this.inputItems.path.value = '';
                    $('#files').val('');
                }
                this.isShow = false;
            } else {
                this.uploadResultTip.state = 'error';
                this.uploadResultTip.content = this.currLang === 'zh-cn' ? data.infochinese : data.info;
                $('#files').val('');
            }
        });
    }

  // 查看源码文件上传状态
  public searchUploadSourceFile(choice: string, type: string, formData: FormData, file: { name: string }, times?: any) {
    const CancelToken = axios.CancelToken;
    const that = this;
    this.Axios.axios.post('/portadv/tasks/upload/', formData, {
      headers: {
        'code-path': type === scan_type.weakConsistencystep2 ? this.weakFileName : '',
        'scan-type': scan_type.weakConsistencystep1,
        'need-unzip': true,
        choice
      },
      cancelToken: new CancelToken(function executor(c) {
        that.cancelFile = c;
      }),
      ...this.config
    }).then((resp: any) => {
        this.suffix = '';
        this.exitFileName = '';
        this.exitMask.Close();
        if (this.commonService.handleStatus(resp) === 0) {
            clearTimeout(this.maximumTime);
            let num = file.name.lastIndexOf('.');
            let filename = file.name.substring(0, num);
            if (filename.lastIndexOf('.tar') > 0) {
                num = filename.lastIndexOf('.');
                filename = filename.substring(0, num);
            }
            this.isShow = false;
            this.isCompress = false;
            let extraName: string;
            clearInterval(times);
            if (type === scan_type.weakConsistencystep1) {
                extraName = 'weakFile';
                this.weakFileName = resp.data;
                this.uploadResultTip.state = 'success';
                this.uploadResultTip.content = this.i18n.common_term_upload_success;
            } else {
                extraName = 'weakCompiler';
                this.weakCompilerName = resp.data;
                this.uploadCompilerTip.state = 'success';
                this.uploadCompilerTip.content = this.currLang === 'zh-cn' ? resp.infochinese : resp.info;
                $('#compilerfile').val('');
            }
            this.msgService.sendMessage({ type: 'uploadingContainer', data: 'end' });
            this.msgService.sendMessage({
                type: 'uploadingContainer',
                name: 'barrier',
                extraName,
                state: 'success',
                data: 'end',
                isShow: false,
                isCompress: false,
                path: resp.data,
                content: this.i18n.common_term_upload_success
            });
        } else if (this.commonService.handleStatus(resp) === 1) {
            clearTimeout(this.maximumTime);
            this.isShow = false;
            this.isCompress = false;
            clearInterval(times);
            if (type === scan_type.weakConsistencystep1) {
                this.weakFileName = '';
                this.uploadResultTip.state = 'error';
                this.uploadResultTip.content = this.currLang === 'zh-cn' ? resp.infochinese : resp.info;
            } else {
                this.uploadCompilerTip.state = 'error';
                this.uploadCompilerTip.content = this.currLang === 'zh-cn' ? resp.infochinese : resp.info;
                $('#compilerfile').val('');
            }
            this.msgService.sendMessage({ type: 'uploadingContainer', data: 'end' });
        } else if (resp.status === Status.maximumTask) { // 等待上传中
          let index: number = JSON.parse(sessionStorage.getItem('memorySourceMaximumTask')) || 0;
          let isCompress: boolean;
          if (index > 20) {
            const content = this.currLang === 'zh-cn' ? resp.infochinese : resp.info;
            this.mytip.alertInfo({ type: 'error', content, time: 5000 });
            isCompress = false;
            clearTimeout(this.maximumTime);
            sessionStorage.setItem('memorySourceMaximumTask', '0');
          } else {
            isCompress = true;
            sessionStorage.setItem('memorySourceMaximumTask', JSON.stringify(++index));
            this.maximumTime = setTimeout(() => {
              this.searchUploadSourceFile(choice, type, formData, file);
            }, 30000);
            sessionStorage.setItem('memorySourceTime', JSON.stringify(this.maximumTime));
          }
          this.msgService.sendMessage({
            type: 'uploadingContainer',
            name: 'barrier',
            data: 'waiting',
            isShow: false,
            isCompress
          });
        } else if (resp.status === '0x010611') { // 磁盘告警
            clearInterval(times);
            this.msgService.sendMessage({ type: 'uploadingContainer', data: 'end' });
            if (type === '6') {
                this.uploadResultTip.state = 'error';
                this.uploadResultTip.content = this.currLang === 'zh-cn' ? resp.infochinese : resp.info;
            } else {
                this.uploadCompilerTip.state = 'error';
                this.uploadCompilerTip.content = this.currLang === 'zh-cn' ? resp.infochinese : resp.info;
                $('#compilerfile').val('');
            }
        }
        if (resp === 'timeout') {
            clearInterval(times);
            this.isShow = false;
            this.msgService.sendMessage({ type: 'uploadingContainer', data: 'end' });
            this.isCompress = false;
            if (type === '6') {
                this.uploadResultTip.state = 'error';
                this.uploadResultTip.content = this.i18n.common_term_upload_time_out;
                $('#zipload').val('');
            } else {
                this.uploadCompilerTip.state = 'error';
                this.uploadCompilerTip.content = this.i18n.common_term_upload_time_out;
                $('#compilerfile').val('');
            }
        }
    }).catch((e: any) => {
        clearInterval(times);
        this.isCompress = false;
        this.isShow = false;
        if (type === '6') {
            this.uploadResultTip.state = '';
            this.uploadResultTip.content = '';
            $('#zipload').val('');
        } else {
            this.uploadCompilerTip.state = 'error';
            this.uploadCompilerTip.content = this.i18n.common_term_upload_time_out;
            $('#compilerfile').val('');
        }
        this.msgService.sendMessage({ type: 'uploadingContainer', data: 'end' });
    });
  }

    // 64位|字节对齐|cacheline上传文件夹
    public toZip(choice: string, type: string, event?: any): any {
        const { zip, filepath, sizeCount, file } = this.handleToZip(choice, type, event);
        let params;
        if (choice === 'save_as') {
            params = {
                file_size: sizeCount,
                file_name: this.exitFileName + '.zip',
                need_unzip: 'true',
                scan_type: type,
                choice
            };
            this.info1.filename = this.exitFileName + '.zip';
        } else if (choice === 'override') {
          params = {
            file_size: sizeCount,
            file_name: this.oldName + '.zip',
            need_unzip: 'true',
            scan_type: type,
            choice
          };
          this.info1.filename = this.oldName + '.zip';
        } else {
            params = {
                file_size: sizeCount,
                file_name: this.outfilepath + '.zip',
                need_unzip: 'true',
                scan_type: type,
                choice
            };
        }
        if (this.scanSameName(params.file_name, type)) {
          return;
        }
        this.uploadProgress = '0%';
        sessionStorage.setItem('sourceCodeFileInfo', JSON.stringify(this.info));
        this.Axios.axios.post('/portadv/tasks/check_upload/', params).then((data: any) => {
            this.displayAreaMatch = false;
            if (this.commonService.handleStatus(data) === 0) {
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
                        if (!sessionStorage.getItem('token')) {
                            metadata.pause();
                            zip.remove(filepath);
                        }
                        const progress = (metadata.percent / 2).toFixed(2);
                        if (Number(progress) >= 50) {
                            return;
                        }
                        this.msgService.sendMessage({
                            type: 'uploadingContainer',
                            name: 'SourceCode',
                            data: 'start',
                            scan_type: type,
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

                        // 将用户选中的文件夹或者文件上传至服务器
                        this.searchUploadPreCheckFile(choice, formData, file, type, times);
                    }).catch((e: any) => {
                        clearInterval(times);
                        this.msgService.sendMessage({
                            type: 'uploadingContainer',
                            name: 'SourceCode',
                            state: '',
                            data: 'end',
                            scan_type: type,
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
                    this.exitFileNameReplace = this.i18nService.I18nReplace(
                        this.i18n.analysis_center.exit.content,
                        { 1: data.data.old_name }
                    );
                    this.exitMask.Open();
                } else {
                    this.uploadResultTip.content = this.currLang === 'zh-cn' ? data.infochinese : data.info;
                    this.uploadResultTip.state = 'error';
                }
                this.resetTextareaString('', type);
                $('#files').val('');
            } else {
                this.uploadResultTip.state = 'error';
                this.uploadResultTip.content = this.currLang === 'zh-cn' ? data.infochinese : data.info;
                $('#files').val('');
            }
        });
    }

  // 查看 64位运行模式检查|结构体字节对齐 文件上传状态
  public searchUploadPreCheckFile(
      choice: string, formData: FormData, file: { name: string }, type: string, times?: any) {
    const CancelToken = axios.CancelToken;
    const that = this;
    this.Axios.axios.post('/portadv/tasks/upload/', formData, {
      headers: {
          'scan-type': type,
          'need-unzip': true,
          choice
      },
      cancelToken: new CancelToken(function executor(c) {
          that.cancelFile = c;
      }),
      ...this.config
    }).then((resp: any) => {
      this.suffix = '';
      this.exitFileName = '';
      this.exitMask.Close();
      let inputstr = this.getTextareaString(type);
      if (this.commonService.handleStatus(resp) === 0) {
          clearTimeout(this.maximumTime);
          switch (type) {
              case scan_type.preCheck:
                inputstr = this.fillTextarea(resp.data, 'precheck');
                break;
              case scan_type.byteCheck:
                inputstr = this.fillTextarea(resp.data, 'byte');
                break;
              case scan_type.cacheCheck:
                inputstr = this.fillTextarea(resp.data, 'cache');
                break;
              default:
                break;
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
              name: 'barrier',
              state: 'success',
              data: 'end',
              scan_type: type,
              isShow: false,
              isCompress: false,
              content: this.i18n.common_term_upload_success,
              path: inputstr
          });
      } else if (this.commonService.handleStatus(resp) === 1) {
          clearTimeout(this.maximumTime);
          this.resetTextareaString('', type);
          clearInterval(times);
          this.msgService.sendMessage({
              type: 'uploadingContainer',
              name: 'barrier',
              state: 'error',
              data: 'end',
              scan_type: type,
              isShow: false,
              isCompress: false,
              content: this.currLang === 'zh-cn' ? resp.infochinese : resp.info,
              path: inputstr
          });
      } else if (resp.status === Status.maximumTask) { // 等待上传中
        let index: number = JSON.parse(sessionStorage.getItem('precheckMaximumTask')) || 0;
        let isCompress: boolean;
        if (index > 20) {
          const content = this.currLang === 'zh-cn' ? resp.infochinese : resp.info;
          this.mytip.alertInfo({ type: 'error', content, time: 5000 });
          isCompress = false;
          clearTimeout(this.maximumTime);
          sessionStorage.setItem('precheckMaximumTask', '0');
        } else {
          isCompress = true;
          sessionStorage.setItem('precheckMaximumTask', JSON.stringify(++index));
          this.maximumTime = setTimeout(() => {
            this.searchUploadPreCheckFile(choice, formData, file, type);
          }, 30000);
          sessionStorage.setItem('precheckTime', JSON.stringify(this.maximumTime));
        }
        this.msgService.sendMessage({
          type: 'uploadingContainer',
          name: 'barrier',
          data: 'waiting',
          scan_type: type,
          isShow: false,
          isCompress,
        });
      } else if (resp.status === '0x010611') {
          clearInterval(times);
          this.msgService.sendMessage({
              type: 'uploadingContainer',
              name: 'barrier',
              state: 'error',
              data: 'end',
              scan_type: type,
              isShow: false,
              isCompress: false,
              content: this.currLang === 'zh-cn' ? resp.infochinese : resp.info
          });
      }
      if (resp === 'timeout') {
          clearInterval(times);
          this.msgService.sendMessage({
              type: 'uploadingContainer',
              name: 'barrier',
              state: 'error',
              data: 'end',
              scan_type: type,
              isShow: false,
              isCompress: false,
              content: this.i18n.common_term_upload_time_out
          });
      }
      $('#zipload').val('');
    }).catch((e: any) => {
        clearInterval(times);
        this.msgService.sendMessage({
            type: 'uploadingContainer',
            name: 'barrier',
            state: '',
            data: 'end',
            scan_type: type,
            isShow: false,
            isCompress: false,
            content: ''
        });
        $('#zipload').val('');
    });
  }

    public cancelTip() {
        this.noFileSelected = false;
        this.uploadResultTip.content = '';
    }

    // 64位运行模式 | 字节对齐 | cacheline 压缩包上传
    public uploadFile(choice: any, type: string) {
        this.exitMask.Close();
        this.uploadStartFlag = false;
        this.isUploadZip = true;
        this.isSlow = false;
        let file: any;
        if (choice === 'normal') {
            file = this.elementRef.nativeElement.querySelector('#zipload').files[0];
            this.uploadPackFile = file;
        } else {
            file = this.uploadPackFile;
        }
        this.info1.filename = file.name;
        if (this.scanSameName(file.name, type)) {
          return;
        }
        const size = file.size / 1024 / 1024;
        // 文件大于 1024M | 包含中文 以及 空格 等其它特殊字符
        if (size > fileSize || this.regService.filenameReg(file.name)) {
            this.isShow = false;
            this.isCompress = false;
            this.uploadResultTip.content = size > fileSize
              ? this.i18n.common_term_upload_max_size_tip
              : this.i18n.upload_file_tip.reg_fail;
            this.fileExceed = size > fileSize ? true : false;
            this.uploadResultTip.state = 'error';
            $('#zipload').val('');
            return;
        }
        this.info1.filesize = size.toFixed(1);
        this.uploadProgress = '0%';
        sessionStorage.setItem('memoryBarrierFileInfo', JSON.stringify(this.info1));
        let params = {
            file_size: file.size,
            file_name: file.name,
            need_unzip: 'true',
            scan_type: type,
            choice
        };
        const formData = new FormData();
        if (choice === 'save_as') {
            this.info1.filename = `${this.exitFileName}${this.suffix}`;
            formData.append('file', file, this.info1.filename);
            params = {
                file_size: file.size,
                file_name: this.info1.filename,
                need_unzip: 'true',
                scan_type: type,
                choice
            };
        } else if (choice === 'override') {
          this.info1.filename = `${this.oldName}${this.suffix}`;
          formData.append('file', file, this.info1.filename);
          params = {
            file_size: file.size,
            file_name: this.info1.filename,
            need_unzip: 'true',
            scan_type: type,
            choice
          };
        } else {
            formData.append('file', file);
        }
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
                this.searchUploadPreCheckZip(choice, type, formData, file, times);
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
                    this.uploadResultTip.content = this.currLang === 'zh-cn' ? data.infochinese : data.info;
                    this.uploadResultTip.state = 'error';
                }
                this.resetTextareaString('', type);
                $('#zipload').val('');
            } else {
                this.uploadResultTip.content = this.currLang === 'zh-cn' ? data.infochinese : data.info;
                this.uploadResultTip.state = 'error';
                $('#zipload').val('');
            }
        });
    }

  // 判断当前是否有同名文件或文件夹正在扫描
  public scanSameName(fileName: string, type: any) {
    let taskPathList: any;
    switch (type) {
      case scanType.byteCheck:
        taskPathList = sessionStorage.getItem('byteCheckTaskPath');
        break;
      case scanType.preCheck:
        taskPathList = sessionStorage.getItem('preCheckTaskPath');
        break;
      case scanType.cacheCheck:
        taskPathList = sessionStorage.getItem('cacheCheckTaskPath');
        break;
      default:
        break;
    }
    let uploadFlag = false;
    if (taskPathList) {
      taskPathList = JSON.parse(taskPathList);
      if (taskPathList === this.getFilePre(fileName)) {
        const content = this.i18n.commonUploadSameFile;
        this.mytip.alertInfo({ type: 'error', content, time: 5000 });
        uploadFlag = true;
      }
    }
    return uploadFlag;
  }

  // 获取文件前缀名
  getFilePre(fileName: string) {
    const suffixList = ['.tar.bz', '.tar.bz2', '.tar.gz', '.tar.xz'];
    let name = '';
    name = fileName.substring(0, fileName.lastIndexOf('.'));
    suffixList.forEach(item => {
      if (fileName.endsWith(item)) {
        name = fileName.substr(0, fileName.indexOf(item));
      }
    });
    return name;
  }

  // 查看 64位运行模式检查|字节对齐|cacheline 压缩包上传状态
  public searchUploadPreCheckZip(choice: string,
                                 type: string,
                                 formData: FormData,
                                 file: { name: string, value: string }, times?: any) {
    const CancelToken = axios.CancelToken;
    const that = this;
    this.Axios.axios.post('/portadv/tasks/upload/', formData, {
      headers: {
        'not-chmod': true,
        'need-unzip': true,
        'scan-type': type,
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
          let inputstr = this.getTextareaString(type);
          if (this.commonService.handleStatus(resp) === 0) {
              clearTimeout(this.maximumTime);
              if (type === scan_type.preCheck) {
                inputstr = this.fillTextarea(resp.data, 'precheck');
              } else if (type === scan_type.byteCheck) {
                inputstr = this.fillTextarea(resp.data, 'byte');
              } else if (type === scan_type.cacheCheck) {
                inputstr = this.fillTextarea(resp.data, 'cache');
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
                  name: 'barrier',
                  state: 'success',
                  data: 'end',
                  scan_type: type,
                  isShow: false,
                  isCompress: false,
                  content: this.currLang === 'zh-cn' ? resp.infochinese : resp.info,
                  path: inputstr
              });
          } else if (this.commonService.handleStatus(resp) === 1) {
              clearTimeout(this.maximumTime);
              this.resetTextareaString('', type);
              clearInterval(times);
              this.msgService.sendMessage({
                  type: 'uploadingContainer',
                  name: 'barrier',
                  state: 'error',
                  data: 'end',
                  scan_type: type,
                  isShow: false,
                  isCompress: false,
                  content: this.currLang === 'zh-cn' ? resp.infochinese : resp.info,
                  path: inputstr
              });
          } else if (resp.status === Status.maximumTask) { // 等待上传中
            let index: number = JSON.parse(sessionStorage.getItem('precheckMaximumTask')) || 0;
            let isCompress: boolean;
            if (index > 20) {
              const content = this.currLang === 'zh-cn' ? resp.infochinese : resp.info;
              this.mytip.alertInfo({ type: 'error', content, time: 5000 });
              isCompress = false;
              clearTimeout(this.maximumTime);
              sessionStorage.setItem('precheckMaximumTask', '0');
            } else {
              isCompress = true;
              sessionStorage.setItem('precheckMaximumTask', JSON.stringify(++index));
              this.maximumTime = setTimeout(() => {
                this.searchUploadPreCheckZip(choice, type, formData, file);
              }, 30000);
              sessionStorage.setItem('precheckTime', JSON.stringify(this.maximumTime));
            }
            this.msgService.sendMessage({
              type: 'uploadingContainer',
              name: 'barrier',
              data: 'waiting',
              scan_type: type,
              isShow: false,
              isCompress
            });
          } else if (resp.status === '0x010611') {
              clearInterval(times);
              this.msgService.sendMessage({
                  type: 'uploadingContainer',
                  name: 'barrier',
                  state: 'error',
                  data: 'end',
                  scan_type: type,
                  isShow: false,
                  isCompress: false,
                  content: this.currLang === 'zh-cn' ? resp.infochinese : resp.info
              });
          }
          if (resp === 'timeout') {
              clearInterval(times);
              this.msgService.sendMessage({
                  type: 'uploadingContainer',
                  name: 'barrier',
                  state: 'error',
                  data: 'end',
                  scan_type: type,
                  isShow: false,
                  isCompress: false,
                  content: this.i18n.common_term_upload_time_out
              });
          }
          $('#zipload').val('');
    }).catch((e: any) => {
        clearInterval(times);
        file.value = '';
        this.msgService.sendMessage({
            type: 'uploadingContainer',
            name: 'barrier',
            state: '',
            data: 'end',
            scan_type: type,
            isShow: false,
            isCompress: false,
            content: ''
        });
        $('#zipload').val('');
    });
  }

    // 取消上传请求
    closeRequest() {
      this.isCompress = false;
      sessionStorage.setItem('BcMaximumTask', '0');
      sessionStorage.setItem('memorySourceMaximumTask', '0');
      sessionStorage.setItem('precheckMaximumTask', '0');
      if (this.cancel) {
        this.cancel();
      }

      const sourceTime = JSON.parse(sessionStorage.getItem('memorySourceTime'));
      clearTimeout(sourceTime);
      const BcTime = JSON.parse(sessionStorage.getItem('BcTime'));
      clearTimeout(BcTime);
      if (this.bcUpload) {
        this.bcUpload.closeRequest();
      }

      const precheckTime = JSON.parse(sessionStorage.getItem('precheckTime'));
      clearTimeout(precheckTime);
      if (this.cancelFile) {
        this.cancelFile();
      }
    }

    public getStatus(id: any) {
        this.Axios.axios.get('/portadv/tasks/migrationscan/' + id + '/')
            .then((data: any) => {
                if (this.commonService.handleStatus(data) === 0) {
                    this.count = 0;
                    if (data.data.status === 1) {
                        this.count = 0;
                        if (this.timer) {
                            clearTimeout(this.timer);
                            this.timer = null;
                        }
                        this.info = data.data.scan_current_file;
                        this.situation = 5;
                        this.timer = setTimeout(() => this.getStatus(id), 3000);
                    } else if (data.data.status === 2) {
                        this.count = 0;
                        if (this.timer) {
                            clearTimeout(this.timer);
                            this.timer = null;
                        }
                        if (data.data.scan_result === '') {
                            this.situation = 9;
                            this.info = this.currLang === 'zh-cn'
                                ? '源代码不需要修改'
                                : 'The source code does not need to be modified.';
                            sessionStorage.setItem('situation', '9');
                            sessionStorage.setItem('info', this.info);
                            setTimeout(() => {
                                this.situation = -1;
                                sessionStorage.setItem('situation', '-1');
                            }, 3000);
                        } else {
                            this.info = this.formatCreatedId(data.data.task_name);
                            this.situation = 7;
                            sessionStorage.setItem('situation', '7');
                            sessionStorage.setItem('info', this.info);
                            const obj = data.data.scan_result;
                            setTimeout(() => {
                                const param = {
                                    queryParams: {
                                        created: this.info,
                                        id: data.data.task_name,
                                        result_path: Object.keys(obj),
                                    }
                                };
                                this.router.navigate(['reportDiff'], param);
                            }, 3000);
                        }

                    }
                } else if (this.commonService.handleStatus(data) === 1) {
                    this.situation = -1;
                    this.count = 0;
                    if (this.timer) {
                        clearTimeout(this.timer);
                        this.timer = null;
                    }
                    this.info = this.currLang === 'zh-cn'
                        ? '具体失败信息请查看运行日志'
                        : 'View the failure details in the run log.';
                    this.situation = 6;
                    sessionStorage.setItem('situation', '6');
                    sessionStorage.setItem('info', this.info);
                } else {
                    this.count++;
                    if (this.count <= 3) {
                        if (this.timer) {
                            clearTimeout(this.timer);
                            this.timer = null;
                        }
                        this.timer = setTimeout(() => this.getStatus(id), 3000);
                    }
                }
            }).catch((error: any) => {
                this.count++;
                if (this.count <= 3) {
                    if (this.timer) {
                        clearTimeout(this.timer);
                        this.timer = null;
                    }
                    this.timer = setTimeout(() => this.getStatus(id), 3000);
                }
            });
    }

    checkAnalyzeForm() {
        this.noFileSelected = false;
        if (!this.maxFilenameLength.valid) { return; }
        if (this.selectType.selectedId === 'precheck' && !this.inputValuePrecheck) {
            this.noFileSelected = true;
            return;
        } else if (this.selectType.selectedId === 'byte' && !this.inputValueByte){
            this.noFileSelected = true;
            return;
        } else if (this.selectType.selectedId === 'cache' && !this.inputValueCache){
            this.noFileSelected = true;
            return;
        }
        this.situation = -1;
        this.uploadResultTip.content = '';
        switch (this.EnhancedType) {
            case 'precheck':
                this.portCheck();
                break;
            case 'byte':
                if (this.inputItems.tool.selected.label !== 'automake' && !this.commandControl.valid) {
                    return;
                }
                this.portCheckDQJC();
                break;
            case 'cache':
                this.portCheckCache();
                break;
            default:
                return;
        }
    }

    // 64位运行模式检查 -> 迁移检查
    public portCheck() {
        const { type, params } = this.getSreenParams();
        this.enhancementsApi.analysePrecheck(params).then((data: any) => {
            // 保存创建任务返回的状态码
            this.portWorkerStatusService.workerStatusPre = data.status;

            // 保存状态，页面刷新后获取
            localStorage.setItem('workerStatusPre', data.status);
            this.getPreResultStatus(data, type, params.scan_file);
        });
    }

    // cacheline模式检查
    public portCheckCache() {
        const { type, params } = this.getSreenParams();
        this.enhancementsApi.analyseCachecheck(params).then((data: any) => {
            // 保存创建任务返回的状态码
            this.portWorkerStatusService.workerStatusCache = data.status;

            // 保存状态，页面刷新后获取
            localStorage.setItem('workerStatusCache', data.status);
            this.getPreResultStatus(data, type, params.scan_file);
        });
    }

    // 结构体字节对齐检查 -> 对齐检查
    public portCheckDQJC() {
        const { type, params } = this.getSreenParams();
        this.enhancementsApi.analyseBytecheck(params).then((data: any) => {
            // 保存创建任务返回的状态码
            this.portWorkerStatusService.workerStatusByte = data.status;

            // 保存状态，页面刷新后获取
            localStorage.setItem('workerStatusByte', data.status);
            this.getPreResultStatus(data, type, this.inputValueByte);
        });
    }

    getPreResultStatus(data: any, type: string, fileNmae: string){
        if (this.commonService.handleStatus(data) === 0) {
            this.saveFileName(fileNmae, type, data.data.id);
            this.msgService.sendMessage({
                type: 'creatingTask',
                data: {
                    id: data.data.id,
                    type
                }
            });
            this.createBtnDisabled = true;
            this.createBtnDisabledTip = this.i18n.common_term_creating_btn_disabled_tip;
        } else if (data.status === Status.diskSpace) { // 磁盘空间不足
          this.resetTextareaString('');
          const content = this.chooseLangType(data);
          this.mytip.alertInfo({ type: 'error', content, time: 5000 });
          return;
        } else {
            const id = data.data && data.data.id;
            let resultMsg: any;
            if (data && data.status === this.portWorkerStatusService.createTaskNoWorkerStatus) {  // worker为0
                resultMsg = {
                    id,
                    type,
                    state: 'failed',
                    status: data.status
                };
            } else {
                this.situation = 8;  // 未知
                this.info = this.chooseLangType(data);
                sessionStorage.setItem('situation', '8');
                sessionStorage.setItem('info', this.info);
                resultMsg = {
                    id,
                    type,
                    state: 'failed',
                    msg: this.info,
                    situation: 8,
                    status: data.status
                };
                this.createBtnDisabled = true;
                this.createBtnDisabledTip = this.i18n.common_term_creating_btn_disabled_tip;
            }
            this.sendResultMsg(resultMsg);
        }
    }

    // 根据任务类型保存文件名
    saveFileName(name: any, type: string, reportId: any) {
      let taskType = '';
      if (type === 'PortingPreCheck') {
        taskType = 'preCheckTaskPath';
      } else if (type === 'ByteAlignment') {
        taskType = 'byteCheckTaskPath';
      } else if (type === 'CachelineAlignment') {
        taskType = 'cacheCheckTaskPath';
      }
      sessionStorage.setItem(taskType, JSON.stringify(name));
    }

    /**
     * 获取当前页面对应的输入框内容
     */
    getSreenParams(screen?: string) {
        let params: any;
        let type;
        const scene = this.EnhancedType || screen;
        switch (scene) {
            case 'precheck':
                type = 'PortingPreCheck';
                params = {
                    scan_file: this.getTextareaString(),
                };
                break;
            case 'byte':
                type = 'ByteAlignment';
                params = {
                    info: {
                      sourcedir: this.workspace + this.inputValueByte,
                      constructtool: this.inputItems.tool.selected.label,
                      compilecommand: this.inputItems.command.value
                    }
                  };
                break;
            case 'cache':
                type = 'CachelineAlignment';
                params = {
                    scan_file: this.getTextareaString(),
                };
                break;
            default:
                break;
        }
        return {
            type,
            params
        };
    }

    // 选择若内存序检查模式
    changeWeakMode(mode: any, index: any): void {
        mode.active = true;
        this.weakModeSel = mode.id;
        if (index) {
            this.weakModeList[0].active = false;
        } else {
            this.weakModeList[1].active = false;
        }
    }

    /**
     * 切换选择文件方式
     * @param mode 选中的模型
     * @param index 选中的index
     */
    public changeFileMode(mode: any, index: any): void {
        mode.active = true;
        this.weakFileSel = mode.id;
        if (index) {
            this.weakFileList[0].active = false;
            this.msgService.sendMessage({
                type: 'bc',
            });
        } else {
            this.weakFileList[1].active = false;
            this.msgService.sendMessage({
                type: 'code',
            });
        }
    }

    // 前往文件大小超过限制的联机帮助
    goFileHelp() {
        this.commonService.goHelp('file');
    }

    /**
     * 跳转 对应的联机帮助
     * @param type 类型
     */
    public help(type: string) {
        this.commonService.goHelp(type);
    }

    /**
     * 内存一致性上传源码文件 和 编译文件
     * @param choice  上传的模式
     * @param type 任务类型  6: 上传检查内容 7：上传编译后的文件
     */
    public uploadWeakFile(choice: string, type: string) {
        this.weakScanType = type;
        const { file, params, formData } = this.handleZip(choice, type);
        if (type === scan_type.weakConsistencystep2) {
            this.uploadCompilerTip.content = '';
            Object.assign(params, {
                code_path: this.weakFileName
            });
        }
        // 检查文件是否能够上传
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
                this.searchSourceUploadZip(choice, type, formData, file, times);
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
                    if (type === scan_type.weakConsistencystep2) { // 编译文件没有另存为功能
                        this.noAgain = false;
                    }
                    this.exitMask.Open();
                    return;
                } else {
                    if (type === scan_type.weakConsistencystep1) {
                        this.uploadResultTip.state = 'error';
                        this.uploadResultTip.content = this.currLang === 'zh-cn' ? data.infochinese : data.info;
                        this.inputItems.path.value = '';
                        $('#zipload').val('');
                    } else {
                        this.uploadCompilerTip.state = 'error';
                        this.uploadCompilerTip.content = this.currLang === 'zh-cn' ? data.infochinese : data.info;
                        $('#compilerfile').val('');
                    }
                }
                this.isShow = false;
            } else { // 磁盘告警
                if (type === scan_type.weakConsistencystep1) {
                    this.uploadResultTip.state = 'error';
                    this.uploadResultTip.content = this.currLang === 'zh-cn' ? data.infochinese : data.info;
                    $('#zipload').val('');
                } else {
                    this.uploadCompilerTip.state = 'error';
                    this.uploadCompilerTip.content = this.currLang === 'zh-cn' ? data.infochinese : data.info;
                    $('#compilerfile').val('');
                }
            }
        });
    }

  // 查看weakconsistency源码文件压缩包上传状态
  public searchSourceUploadZip(choice: string, type: string, formData: FormData, file: { name: string }, times?: any) {
    const CancelToken = axios.CancelToken;
    const that = this;
    this.Axios.axios.post('/portadv/tasks/upload/', formData, {
      headers: {
        'code-path': type === scan_type.weakConsistencystep2 ? this.weakFileName : '',
        'need-unzip': type === scan_type.weakConsistencystep1 ? true : false,
        'scan-type': type,
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
      if (this.commonService.handleStatus(resp) === 0) {
          clearTimeout(this.maximumTime);
          let num = file.name.lastIndexOf('.');
          let filename = file.name.substring(0, num);
          if (filename.lastIndexOf('.tar') > 0) {
              num = filename.lastIndexOf('.');
              filename = filename.substring(0, num);
          }
          this.isShow = false;
          this.isCompress = false;
          let extraName: string;
          clearInterval(times);
          if (type === scan_type.weakConsistencystep1) {
              extraName = 'weakFile';
              this.weakFileName = resp.data;
              this.uploadResultTip.state = 'success';
              this.uploadResultTip.content = this.currLang === 'zh-cn' ? resp.infochinese : resp.info;
          } else {
              extraName = 'weakCompiler';
              this.weakCompilerName = resp.data;
              this.uploadCompilerTip.state = 'success';
              this.uploadCompilerTip.content = this.currLang === 'zh-cn' ? resp.infochinese : resp.info;
              $('#compilerfile').val('');
          }
          this.msgService.sendMessage({ type: 'uploadingContainer', data: 'end' });
          this.msgService.sendMessage({
              type: 'uploadingContainer',
              name: 'barrier',
              extraName,
              state: 'success',
              data: 'end',
              isShow: false,
              isCompress: false,
              path: resp.data,
              content: this.currLang === 'zh-cn' ? resp.infochinese : resp.info
          });
      } else if (this.commonService.handleStatus(resp) === 1) {
          clearTimeout(this.maximumTime);
          this.isShow = false;
          this.isCompress = false;
          clearInterval(times);
          if (type === scan_type.weakConsistencystep1) {
              this.weakFileName = '';
              this.uploadResultTip.state = 'error';
              this.uploadResultTip.content = this.currLang === 'zh-cn' ? resp.infochinese : resp.info;
          } else {
              this.uploadCompilerTip.state = 'error';
              this.uploadCompilerTip.content = this.currLang === 'zh-cn' ? resp.infochinese : resp.info;
              $('#compilerfile').val('');
          }
          this.msgService.sendMessage({ type: 'uploadingContainer', data: 'end' });
      } else if (resp.status === Status.maximumTask) { // 等待上传中
        let index: number = JSON.parse(sessionStorage.getItem('memorySourceMaximumTask')) || 0;
        let isCompress: boolean;
        if (index > 20) {
          const content = this.currLang === 'zh-cn' ? resp.infochinese : resp.info;
          this.mytip.alertInfo({ type: 'error', content, time: 5000 });
          isCompress = false;
          clearTimeout(this.maximumTime);
          sessionStorage.setItem('memorySourceTask', '0');
        } else {
          isCompress = true;
          sessionStorage.setItem('memorySourceMaximumTask', JSON.stringify(++index));
          this.maximumTime = setTimeout(() => {
            this.searchSourceUploadZip(choice, type, formData, file);
          }, 30000);
          sessionStorage.setItem('memorySourceTime', JSON.stringify(this.maximumTime));
        }
        this.msgService.sendMessage({
          type: 'uploadingContainer',
          name: 'barrier',
          data: 'waiting',
          isShow: false,
          isCompress,
        });
      } else if (resp.status === '0x010611') { // 磁盘告警
          clearInterval(times);
          this.msgService.sendMessage({ type: 'uploadingContainer', data: 'end' });
          if (type === '6') {
              this.uploadResultTip.state = 'error';
              this.uploadResultTip.content = this.currLang === 'zh-cn' ? resp.infochinese : resp.info;
          } else {
              this.uploadCompilerTip.state = 'error';
              this.uploadCompilerTip.content = this.currLang === 'zh-cn' ? resp.infochinese : resp.info;
              $('#compilerfile').val('');
          }
      }
      if (resp === 'timeout') {
          clearInterval(times);
          this.isShow = false;
          this.msgService.sendMessage({ type: 'uploadingContainer', data: 'end' });
          this.isCompress = false;
          if (type === '6') {
              this.uploadResultTip.state = 'error';
              this.uploadResultTip.content = this.i18n.common_term_upload_time_out;
              $('#zipload').val('');
          } else {
              this.uploadCompilerTip.state = 'error';
              this.uploadCompilerTip.content = this.i18n.common_term_upload_time_out;
              $('#compilerfile').val('');
          }
      }
  }).catch((e: any) => {
      clearInterval(times);
      this.isCompress = false;
      this.isShow = false;
      if (type === scan_type.weakConsistencystep1) {
          this.uploadResultTip.state = '';
          this.uploadResultTip.content = '';
          $('#zipload').val('');
      } else {
          this.uploadCompilerTip.state = 'error';
          this.uploadCompilerTip.content = this.i18n.common_term_upload_time_out;
          $('#compilerfile').val('');
      }
      this.msgService.sendMessage({ type: 'uploadingContainer', data: 'end' });
  });
}

    // 构建命令 创建异步任务pmake cmake 生成中间文件
    createCompilerFile(): void {
        this.bcOptions = [];
        this.bcSelecteds = [];
        const weakToolValue = this.inputItems.weakTool.value;
        this.createWeakCompilerDisabled = true;
        this.maxFilenameLengthArm.disable();
        this.weakControl.disable();
        let constructtool: string;
        if (/^\s*make/.test(weakToolValue)) {
            constructtool = 'make';
        } else {
            constructtool = 'cmake';
        }
        const params = {
            sourcedir: `${this.workspace}${this.weakFileName}`, // 需要进行迁移扫描的源代码绝对路径，不同的路径使用逗号分割
            constructtool,
            gllvm: 'true',
            compilecommand: weakToolValue,
            targetos: this.targetos // 运行环境的操作系统
        };
        this.Axios.axios.post('/portadv/weakconsistency/tasks/compilefile/', params).then((resp: any) => {
            // 保存创建任务返回的状态码
            this.portWorkerStatusService.workerStatusWeak = resp.status;

            // 保存状态，页面刷新后获取
            localStorage.setItem('workerStatusWeak', resp.status);
            if (this.commonService.handleStatus(resp) === 0) {
                this.weakCopmilerId = resp.data.task_id;
                this.bcGenerateTaskId = resp.data.task_id;
                if (resp.data.task_id) {
                    this.weakCopmilerId = resp.data.task_id;
                    this.Axios.axios.get(
                        `/task/progress/?task_type=9&task_id=${encodeURIComponent(this.weakCopmilerId)}`
                    ).then((data: any) => {
                        if (this.commonService.handleStatus(data) === 0) {
                            this.msgService.sendMessage({
                                type: 'creatingTask',
                                data: {
                                    id: this.weakCopmilerId,
                                    type: 'weakCompiler'
                                }
                            });
                            return;
                        }
                        const failInfo = sessionStorage.getItem('language') === 'zh-cn' ? data.infochinese : data.info;
                        const resultMsg = {
                            id: this.reportId,
                            type: 'weakCompiler',
                            state: 'failed',
                            msg: failInfo
                        };
                        this.msgService.sendMessage({
                            type: 'creatingResultMsg',
                            data: resultMsg
                        });
                        this.createWeakBtnDisabled = true;
                    });
                }
            } else if (this.commonService.handleStatus(resp) === 1) { // 启动任务失败
                if (resp && resp.status === this.portWorkerStatusService.createTaskNoWorkerStatus) {  // worker为0
                    const resultMsg = {
                        id: this.reportId,
                        type: 'weakCompiler',
                        state: 'failed',
                        status: resp.status
                    };
                    this.sendResultMsg(resultMsg);
                    return;
                }
                this.createWeakCompilerDisabled = true;
                this.maxFilenameLengthArm.disable();
                this.weakControl.disable();
                const lang = sessionStorage.getItem('language');
                const content = lang === 'zh-cn' ? resp.infochinese : resp.info;
                const result = {
                  id: this.reportId,
                  type: 'weakCompiler',
                  state: 'failed',
                  msg: content,
                  situation: 3,
                  status: resp.status
                };
                this.sendResultMsg(result);
            } else { // 磁盘告警
                this.createWeakCompilerDisabled = false;
                this.maxFilenameLengthArm.enable();
                this.weakControl.enable();
                const lang = sessionStorage.getItem('language');
                lang === 'zh-cn'
                    ? this.mytip.alertInfo({ type: 'warn', content: resp.infochinese, time: 10000 })
                    : this.mytip.alertInfo({ type: 'warn', content: resp.info, time: 10000 });
            }
        });
    }

    public onNgModelChange(event: any): void {
        this.bcFileList = [];
        for (const element of this.bcSelecteds) {
            this.bcFileList.push(element.label);
        }
        if (this.bcFileList.length > 0) {
            this.bcDisabled = false;
        }else {
            this.bcDisabled = true;
        }
    }


    public getBcList(id: any) {
        this.Axios.axios.get(
            `/portadv/weakconsistency/tasks/${encodeURIComponent(id)}/bcfilelist/`
            )
        .then((data: any) => {
            if (data.status === '0x0b1000') {
                const bclist = data.data.bc_file_list;
                const newBcList = [];
                this.bcSelecteds = [];
                this.bcOptions = [];
                this.bcFileList = [];
                for (const element of bclist) {
                    newBcList.push({label: element});
                }
                this.bcOptions = newBcList;
            }else {
                this.bcSelecteds = [];
                this.bcOptions = [];
                this.bcFileList = [];
                const lang = sessionStorage.getItem('language');
                lang === 'zh-cn'
                    ? this.mytip.alertInfo({ type: 'warn', content: data.infochinese, time: 10000 })
                    : this.mytip.alertInfo({ type: 'warn', content: data.info, time: 10000 });
            }
        });
        this.bcDisabled = true;
    }

    /**
     * 点击内存一致性上一步
     * @param step 正负步数
     */
        public stepChangePre(): void {
            this.curStep = 1;
            this.uploadResultTip.content = '';
            this.uploadCompilerTip.content = '';
            this.bcSelecteds = [];
            this.bcOptions = [];
            this.bcFileList = [];
            this.noAgain = true;
            this.compilerConfigurationFile.checked = false;
        }
        /**
         * 点击内存一致性下一步
         * @param step 正负步数
         */
        public stepChangeNext(): void {
            if (!this.maxFilenameLengthArm.valid && !this.weakControl.valid) { return; }
            this.uploadCompilerTip.content = '';
            this.uploadResultTip.content = '';
            this.compilerConfigurationFile.checked = false;
            this.compilerConfigurationFile.disabled = false;
            if (!this.createWeakCompilerDisabled) {
                this.weakCompilerName = '';
                this.createCompilerFile();
            }
        }

    // 下载中间编译文件
    downloadCompiler() {
        this.Axios.axios.get(
            `/portadv/weakconsistency/${encodeURIComponent(this.weakCopmilerId)}/compilefile/`
            )
        .then((resp: any) => {
            const file = new Blob([resp]);
            if (window.navigator.msSaveOrOpenBlob) {
                window.navigator.msSaveOrOpenBlob(file, this.weakCompilerName);
            } else {
                const link = document.createElement('a');
                link.href = URL.createObjectURL(file);
                link.setAttribute('style', 'visibility:hidden');
                link.download = this.weakCompilerName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        });
    }

    /**
     * 对上传的压缩包进行相关处理
     * @param choice 上传的模式
     * @param type 任务类型
     */
    public handleZip(choice: string, type: string): any {
        this.exitMask.Close();
        this.isUploadZip = true;
        this.uploadStartFlag = false;
        this.isShow = false;
        this.isSlow = false;
        let file;
        if (choice === 'normal') {
            file = type === scan_type.weakConsistencystep1
                ? this.elementRef.nativeElement.querySelector('#zipload').files[0]
                : this.elementRef.nativeElement.querySelector('#compilerfile').files[0];
            this.uploadZipFile = file;
        } else {
            file = this.uploadZipFile;
        }
        this.info1.filename = file.name;
        const size = file.size / 1024 / 1024;
        // 文件大于 1024M | 包含中文 以及 空格 等其它特殊字符
        if (size > fileSize || this.regService.filenameReg(file.name)) {
            this.isShow = false;
            this.isCompress = false;
            this.uploadResultTip.state = 'error';
            this.uploadResultTip.content = size > fileSize
              ? this.i18n.common_term_upload_max_size_tip
              : this.i18n.upload_file_tip.reg_fail;
            this.fileExceed = size > fileSize ? true : false;
            // 编译文件
            if (type === scan_type.weakConsistencystep2) {
                this.mytip.alertInfo({ type: 'error', content: this.i18n.upload_file_tip.reg_fail, time: 5000 });
            }
            return;
        }
        this.info1.filesize = size.toFixed(1);
        let params = {
            file_size: file.size,
            file_name: file.name,
            need_unzip: 'true',
            scan_type: type,
            choice
        };
        const formData = new FormData();
        if (choice === 'save_as') {
            this.info1.filename = `${this.exitFileName}${this.suffix}`;
            formData.append('file', file, this.info1.filename);
            params = {
                file_size: file.size,
                file_name: this.info1.filename,
                need_unzip: 'true',
                scan_type: type,
                choice
            };
        } else if (choice === 'override') {
          this.info1.filename = `${this.oldName}${this.suffix}`;
          formData.append('file', file, this.info1.filename);
          params = {
            file_size: file.size,
            file_name: this.info1.filename,
            need_unzip: 'true',
            scan_type: type,
            choice
          };
        } else {
            formData.append('file', file);
        }
        this.uploadProgress = '0%';
        sessionStorage.setItem('memoryBarrierFileInfo', JSON.stringify(this.info1));
        return {
            file,
            formData,
            params
        };
    }

    // 内存一致性 点击确定检查
    confirmWeakCheck() {
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
        const that = this;
        setTimeout(() => {
            if (this.reportTotalNum >= 50) {
                this.timessage.open({
                    type: 'prompt',
                    title: this.i18n.common_term_history_list_overflow_tip,
                    content: this.i18n.common_term_history_list_overflow_tip2,
                    cancelButton: {
                        show: false
                    },
                    close(messageRef: TiModalRef): void {
                        that.Axios.axios.post('/portadv/weakconsistency/tasks/', params).then((resp: any) => {
                            if (resp.data.task_id && this.commonService.handleStatus(resp) === 0) {
                                that.reportId = resp.data.task_id;
                                that.Axios.axios
                                .get(`/task/progress/?task_type=10&task_id=${encodeURIComponent(this.reportId)}`)
                                .then((data: any) => {
                                    if (this.commonService.handleStatus(data) === 0) {
                                        that.msgService.sendMessage({
                                            type: 'creatingTask',
                                            data: {
                                                id: that.reportId,
                                                type: 'weakCheck'
                                            }
                                        });
                                        that.createWeakBtnDisabled = true;
                                        that.createBtnDisabledTip = this.i18n.common_term_creating_btn_disabled_tip;
                                        return;
                                    }
                                    const failInfo = sessionStorage.getItem('language') === 'zh-cn'
                                      ? data.infochinese
                                      : data.info;
                                    const resultMsg = {
                                        id: this.reportId,
                                        type: 'weakCheck',
                                        state: 'failed',
                                        msg: failInfo
                                    };
                                    that.msgService.sendMessage({
                                        type: 'creatingResultMsg',
                                        data: resultMsg
                                    });
                                    that.createWeakBtnDisabled = true;
                                });
                            } else {
                                that.inputItems.path.value = '';
                                const failInfo = sessionStorage.getItem('language') === 'zh-cn'
                                  ? resp.infochinese
                                  : resp.info;
                                that.mytip.alertInfo({ type: 'warn', content: failInfo, time: 10000 });
                            }
                        });
                    }
                });
            } else {
                this.Axios.axios.post('/portadv/weakconsistency/tasks/', params).then((resp: any) => {
                    if (resp.data.task_id && this.commonService.handleStatus(resp) === 0) {
                        this.reportId = resp.data.task_id;
                        this.Axios.axios
                        .get(`/task/progress/?task_type=10&task_id=${encodeURIComponent(this.reportId)}`)
                        .then((data: any) => {
                            if (this.commonService.handleStatus(data) === 0) {
                                this.msgService.sendMessage({
                                    type: 'creatingTask',
                                    data: {
                                        id: this.reportId,
                                        type: 'weakCheck'
                                    }
                                });
                                this.createWeakBtnDisabled = true;
                                this.compilerConfigurationFile.disabled = true;
                                this.createBtnDisabledTip = this.i18n.common_term_creating_btn_disabled_tip;
                                return;
                            }
                            const failInfo = sessionStorage.getItem('language') === 'zh-cn'
                              ? data.infochinese
                              : data.info;
                            const resultMsg = {
                                id: this.reportId,
                                type: 'weakCheck',
                                state: 'failed',
                                msg: failInfo
                            };
                            this.msgService.sendMessage({
                                type: 'creatingResultMsg',
                                data: resultMsg
                            });
                            this.createWeakBtnDisabled = true;
                            this.compilerConfigurationFile.disabled = true;
                        });
                    } else {
                        this.inputItems.path.value = '';
                        const failInfo = sessionStorage.getItem('language') === 'zh-cn' ? resp.infochinese : resp.info;
                        this.mytip.alertInfo({ type: 'error', content: failInfo, time: 10000 });
                    }
                });
            }
        }, 100);
    }

    /**
     * 上传输入框内容改变事件
     */
    changeUploadFile() {
        if (!this.weakFileName) {
            this.inputItems.weakTool.value = '';
        }
    }

    /**
     * 判断历史报告是否达到最大数量
     * @param bool histiry-list 子组件传过来的值
     */
    changeIsCommit(bool: boolean): void {
        this.isCommit = bool;
    }
    changeBCCommit(bool: boolean): void {
        this.BCCommit = bool;
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
            sourcedir = `${this.workspace}${inputPath}`;
        } else {
            let values = inputPath.split(',');
            if (values.length > 1) {
                const diffArr: any = [];
                values.forEach(val => {
                    if (diffArr.indexOf(val) === -1) { diffArr.push(val); }
                });
                values = diffArr.slice();
            }
            if (values[0]) {
                values[0] = values[0].replace(/(^\s*)|(\s*$)/g, '').replace(/[\r\n]/g, '');
                if (values[0].charAt(values[0].length - 1) === '/') {
                    values[0] = values[0].slice(0, -1);
                }
                sourcedir = `${this.workspace}${values[0]}`;
            }
            for (let j = 1; j <= values.length; j++) {
                if (values[j]) {
                    values[j] = values[j].replace(/(^\s*)|(\s*$)/g, '').replace(/[\r\n]/g, '');
                    if (values[j].charAt(values[j].length - 1) === '/') {
                        values[j] = values[j].slice(0, -1);
                    }
                    sourcedir += `,${this.workspace}${values[j]}`;
                }
            }
        }
        return sourcedir;
    }
    // 获取历史记录条数
    getReportTotalNum(num: number): void {
        this.reportTotalNum = num;
    }

    showMoreMask() {
        this.moreMask.Open();
    }
    closeMaskMore() {
        this.moreMask.Close();
    }
    // 删除文件弹窗
    isDeleteAreaMatch(value: any) {
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
            this.deleteAreaMatch(value);
          },
          dismiss: () => { }
        });
    }
    // 调用删除文件接口
    deleteAreaMatch(value: string) {
        let path: string;
        let fileName;
        let params;
        fileName = value;
        path = this.selectType.curSelObj.path.slice(0, -1);
        params = {
            file_name: fileName,
            path,
        };
        if (this.selectType.curSelObj.id === 'weak') {
            this.deleteTextAreaFile(params, value);
            return;
        }
        this.Axios.axios.delete(`/portadv/tasks/delete_file/`, { data: params }).then((data: any) => {
            if (this.commonService.handleStatus(data) === 0) {
                let vals: any[] = [];
                if (path === 'precheck') {
                    vals = this.inputValuePrecheck.split(',');
                } else if (path === 'bytecheck') {
                    vals = this.inputValueByte.split(',');
                } else if (path === 'cachecheck') {
                    vals = this.inputValueCache.split(',');
                }
                if (vals.length === 1) {
                    this.inputValuePrecheck = '';
                    this.inputValueByte = '';
                    this.inputValueCache = '';
                } else {
                    vals = vals.filter(val => {
                        return value.indexOf(val) >= 0 && val;
                    });
                    if (vals.length > 0) {
                        this.inputValuePrecheck = '';
                        this.inputValueByte = '';
                        this.inputValueCache = '';
                    }
                }
            }
            sessionStorage.removeItem('enhancedPrecheckPathName');
            sessionStorage.removeItem('enhancedBytePathName');
            sessionStorage.removeItem('enhancedCachePathName');
            const type = this.commonService.handleStatus(data) === 0 ? 'success' : 'warn';
            const content = this.currLang === 'zh-cn' ? data.infochinese : data.info;
            this.mytip.alertInfo({ type, content, time: 5000 });
        });
    }
    // 删除 weakconsistency textarea 文件
    deleteTextAreaFile(file: any, value: string) {
        this.Axios.axios.delete(`/portadv/tasks/delete_file/`, { data: file }).then((data: any) => {
            if (this.commonService.handleStatus(data) === 0) {
                this.pathlist = this.pathlist.filter((item: any) => item !== file.file_name);
                let vals = this.weakFileName.split(',');
                if (vals.length === 1) {
                    this.weakFileName = vals[0] === value ? '' : vals[0];
                } else {
                    vals = vals.filter((val: any): any => {
                        if (val) {
                            return value !== val;
                        }
                    });
                    this.weakFileName = vals.join(',') + ',';
                }
            }
            sessionStorage.removeItem('memoryBarrierweakFileName');
            sessionStorage.removeItem('memoryBarrierweakCompilerName');
            const type = this.commonService.handleStatus(data) === 0 ? 'success' : 'warn';
            const content = this.currLang === 'zh-cn' ? data.infochinese : data.info;
            this.mytip.alertInfo({ type, content, time: 5000 });
        });
        this.inputItems.weakTool.value = '';
    }

    closeMaskExit() {
        this.exitMask.Close();
        $('#zipload').val('');
        $('#compilerfile').val('');
    }
    closeMaskSaveAs() {
        this.saveasMask.Close();
        $('#zipload').val('');
        $('#compilerfile').val('');
    }
    /**
     * 替换
     * @param choice 上传的模式
     */
    uploadAgain(choice: string): void {
        let type = '';
        if (this.selectType.selectedId === 'byte') {
            type = scan_type.byteCheck;
        } else if (this.selectType.selectedId === 'precheck') {
            type = scan_type.preCheck;
        } else if (this.selectType.selectedId === 'cache') {
            type = scan_type.cacheCheck;
        }
        if (choice === 'override' && this.isUploadZip) {
            this.selectType.curSelObj.id === 'weak'
            ? this.uploadWeakFile(choice, this.weakScanType)
            : this.uploadFile(choice, type);
        } else if (choice === 'override' && !this.isUploadZip) {
            this.selectType.curSelObj.id === 'weak' ? this.toZipWeak(choice, '6') : this.toZip(choice, type);
        } else {
            this.exitMask.Close();
            this.saveasMask.Open();
        }
    }
    /**
     * 另存为
     * @param choice 上传的模式
     */
    saveAs(choice: string): void {
        if (!this.confirmUploadZip.valid) {
            $('.saveAs-input')[0].focus();
            return;
        }
        this.saveasMask.Close();
        let type = '';
        if (this.selectType.selectedId === 'byte') {
            type = scan_type.byteCheck;
        } else if (this.selectType.selectedId === 'precheck') {
            type = scan_type.preCheck;
        } else if (this.selectType.selectedId === 'cache') {
            type = scan_type.cacheCheck;
        }
        if (this.isUploadZip) {
            this.selectType.curSelObj.id === 'weak'
            ? this.uploadWeakFile(choice, this.weakScanType)
            : this.uploadFile(choice, type);
        } else {
            this.selectType.curSelObj.id === 'weak' ? this.toZipWeak(choice, '6') : this.toZip(choice, type);
        }
    }

    // 浏览器滚动条滚动时 收起顶部导航栏
    ngAfterViewInit(): void {
        const container = $('.router-content')[0];
        const dropContainer = $('ti-drop.ti3-dropdown-container');
        fromEvent(container, 'scroll')
            .subscribe(e => {
                const url = this.router.url.split('?')[0];
                const routerList = [
                  '/homeNew/home', '/homeNew/porting-workload', '/homeNew/analysisCenter',
                  '/homeNew/migrationCenter', '/homeNew/PortingPre-check'
                ];
                if (!dropContainer.length || routerList.indexOf(url) < 0) { return; }
                const bannerState = JSON.parse(sessionStorage.getItem('bannerShow'));
                if (bannerState) {
                    const scrollTop = container.scrollTop;
                    const clientHeight = document.body.clientHeight; // 可视区域高度
                    const totalHeight = container.scrollHeight; // 可视区域的高度加上溢出（滚动）的距离
                    if (scrollTop + clientHeight >= totalHeight) {
                        sessionStorage.setItem('weakTop', JSON.stringify(scrollTop));
                    }
                    this.msgService.sendMessage({
                        type: 'collapseBanner',
                        data: false,
                        subType: 'weak'
                    });
                }
                for (const drop of dropContainer) {
                    drop.style.display = 'none';
                }
            });
    }

    sendResultMsg(resultMsg: any) {
        this.msgService.sendMessage({
            type: 'creatingResultMsg',
            data: resultMsg
        });
    }
}
