import { Component, OnInit, ElementRef, ViewChild, HostListener, Input } from '@angular/core';
import { TiValidationConfig } from '@cloud/tiny3';
import { Router } from '@angular/router';
import { FormControl, ValidationErrors, ValidatorFn, AbstractControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import axios from 'axios';

import {
  RegService, I18nService, AxiosService,
  MessageService, MytipService, CommonService, CustomValidators as customValidators
} from '../../../../service';
import { fileSize, MAXFILENAMELENGTH } from '../../../../global/globalData';
import { HyMiniModalService } from 'hyper';
import { Status } from '../../../../modules';

@Component({
  selector: 'app-bc-upload',
  templateUrl: './bc-upload.component.html',
  styleUrls: ['./bc-upload.component.scss']
})
export class BcUploadComponent implements OnInit {

  constructor(
    public mytip: MytipService,
    private miniModalServe: HyMiniModalService,
    public i18nService: I18nService,
    public Axios: AxiosService,
    public msgService: MessageService,
    private elementRef: ElementRef,
    public router: Router,
    private commonService: CommonService,
    private regService: RegService
  ) {
    this.i18n = this.i18nService.I18n();
  }
  @ViewChild('exitmask', { static: false }) exitMask: any;
  @ViewChild('saveasmask', { static: false }) saveasMask: any;
  @Input() weakEnvironment: string; // 运行环境版本
  @Input() BCCommit: boolean; // 历史报告是否达到阈值

  public workspace: string;
  public i18n: any;
  public targetos: string; // 操作系统
  public bcFileName = '';
  public displayAreaMatch = false;
  public createBtnDisabled = false;
  public bcUploadResultTip = {
    state: '',
    content: ''
  };
  public areaMatchHeight: number;
  public currLang: any;
  public inputValue = '';
  public bcPlaceholder = '';
  public cancelBlur = true;
  public pathlist: Array<any> = [];
  public selectType: any = {
    options: [],
    selectedId: '',
    curSelObj: {},
  };

  public maximumTime: any; // 上传等待定时器
  public fileExceed = false; // 文件超过 1G
  public oldName: any;
  public multipleInput = false;
  public weakPathList: any = [];
  public timer: any = null;
  public upTimes = 0;
  public isSlow = false;
  public isUploadZip = false;
  public uploadFile: any;
  public uploadPackFile: any;
  public uploadFolderFileList: any;
  public bcExitFileName = '';
  public exitFileNameReplace = '';
  public fileNameDelete = '';
  public bcsuffix = '';
  public uploadProgress = '';
  public isShow = false;
  public isCompress = false;
  public uploadStartFlag = false;
  public info1 = {
    filename: '',
    filesize: ''
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
  public deleteValue = '';
  public deleteValueCode = '';
  public confirmUploadZip: any;
  public maxFilenameLength: any;
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

  private uploadingContainerSub: Subscription;
  private creatingBcFileProgressSub: Subscription;

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
        data: 'start',
        name: 'barrier',
        isShow: true,
        isCompress: false,
        uploadProgress: complete + '%'
      });

      if (complete === 100) {
        this.msgService.sendMessage({
          type: 'uploadingContainer',
          data: 'start',
          name: 'barrier',
          isShow: false,
          isConpress: true,
          uploadProgress: complete + '%'
        });
      }
    }
  };
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

  ngOnInit(): void {
    this.msgService.getMessage().subscribe(msg => {
      if (msg.type === 'creatingbcCheckProgress') {
        this.createBtnDisabled = msg.data;
      }
    });
    this.selectType.options = [
      {
        key: this.i18n.enhanced_functions_label.weak,
        id: 'weak',
        path: 'weakconsistency_bc/',
        disable: false,
        isByte: false,
        isPrecheck: false,
        isWeak: true,
        isMore: false,
        desc: this.i18n.enhanced_functions_label.weak_desc
      }
    ];
    this.Axios.axios.get(`/customize/`).then((resp: any) => {
      if (this.commonService.handleStatus(resp) === 0) {
        this.workspace = `${resp.data.customize_path}/portadv/${sessionStorage.getItem('username')}/`
          + this.selectType.options[0].path;
        this.bcPlaceholder = this.i18nService.I18nReplace(
          this.i18n.check_weak.textarea_weak_bc3,
          {1: this.workspace}
        );
      }
    });
    this.currLang = sessionStorage.getItem('language');
    this.validation.errorMessage.regExp = this.i18n.common_term_no_samepwd;
    this.validation.errorMessage.required = this.i18n.common_term_no_samepwd;
    this.confirmUploadZip = new FormControl('', [CustomValidators.confirmNewName(this.i18n)]);
    this.maxFilenameLength = new FormControl(
      {value: '', disabled: !this.weakEnvironment},
      [CustomValidators.filenameLength(this.i18n), customValidators.filenameCheck(this.i18n)]
    );
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

    // 监听压缩包上传弹框
    this.uploadingContainerSub = this.msgService.getMessage().subscribe(msg => {
      if (msg.type === 'uploadingContainer' && msg.name === 'barrier' ) {
        this.isShow = msg.isShow;
        this.isCompress = msg.isCompress;
      }
    });
    this.creatingBcFileProgressSub = this.msgService.getMessage().subscribe(msg => {
      if (msg.type === 'creatingWeakCheckProgress') {
        this.createBtnDisabled = msg.data;
      }
    });
  }

  // 内存一致性 textarea 聚焦事件
  focusWeakTextArea() {
    this.displayAreaMatch = true;
    this.bcUploadResultTip.content = '';
    this.inputWeakAreaMatch();
    const areaMatch = this.elementRef.nativeElement.querySelector('.areaMatch');
    if (areaMatch) {
      this.areaMatchHeight = areaMatch.offsetHeight;
    }
  }
  areaMatchDis() {
    this.displayAreaMatch = true;
    this.bcUploadResultTip.content = '';
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

  /**
   *  路径模糊查找
   */
  inputWeakAreaMatch() {
    if (sessionStorage.getItem('isFirst') !== '1' && sessionStorage.getItem('isExpired') !== '1') {
      this.pathlist = [];
      let path = this.bcFileName;
      if (path) {
        const lastIndex = this.bcFileName.lastIndexOf(',');
        if (lastIndex) {
          path = this.bcFileName.slice(lastIndex + 1, this.bcFileName.length);
        }
      }
      const params = { path: 'weakconsistency_bc/' + path };
      this.Axios.axios.post('/pathmatch/', params).then((data: any) => {
        const arrBefore = this.bcFileName.split(',');
        if (data) {
          let arrAfter = data.pathlist;
          let idx = this.bcFileName.lastIndexOf(',');
          if (idx >= 0) { idx = this.bcFileName.length - idx; }
          if (idx === 1) {
            arrAfter = this.arr_diff(arrBefore, arrAfter, true);
            this.weakPathList = arrAfter;
            return;
          }
          if (arrAfter.length > 1) {
            arrAfter = this.arr_diff(arrBefore, arrAfter, false);
          }
          this.weakPathList = arrAfter;
        }
      });
    }
  }

  inputAreaMatch() {
    if (sessionStorage.getItem('isFirst') !== '1' && sessionStorage.getItem('isExpired') !== '1') {
      let path = this.inputValue;
      this.pathlist = [];
      const lastIndex = this.inputValue.lastIndexOf(',');
      if (lastIndex) {
        path = this.inputValue.slice(lastIndex + 1, this.inputValue.length);
      }
      const params = { path};
      this.Axios.axios.post('/pathmatch/', params).then((data: any) => {
        const beforeArr = this.inputValue.split(',');
        if (data) {
          let afterArr = data.pathlist;
          let idx = this.inputValue.lastIndexOf(',');
          if (idx >= 0) { idx = this.inputValue.length - idx; }
          if (idx === 1) {
            afterArr = this.arr_diff(beforeArr, afterArr, true);
            this.pathlist = afterArr;
            return;
          }
          if (afterArr.length > 1) {
            afterArr = this.arr_diff(beforeArr, afterArr, false);
          }
          this.pathlist = afterArr;
        }
      });
    }
  }

  clickAreaMatch(value: any) {
    const lastIndex = this.inputValue.lastIndexOf(',');
    if (!this.multipleInput) {
      this.inputValue = value;
    } else {
      if (lastIndex) {
        this.inputValue = this.inputValue.slice(0, lastIndex + 1) + value + ',';
      } else {
        this.inputValue = value + ',' ;
      }
    }
    this.displayAreaMatch = false ;
    this.pathlist = [];
    // 解决 IE 下点击后无法自动失焦情况
    this.elementRef.nativeElement.querySelector('.areaMatch').blur();
  }

  keyupAreaMatch() {
    if (sessionStorage.getItem('isFirst') !== '1' && sessionStorage.getItem('isExpired') !== '1') {
      this.inputAreaMatch();
    }
  }

  keyupWeakAreaMatch() {
    if (sessionStorage.getItem('isFirst') !== '1' && sessionStorage.getItem('isExpired') !== '1') {
      this.inputWeakAreaMatch();
    }
  }

  // textarea 子列表内容改变
  clickWeakMatch(value: any) {
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
    this.weakPathList = [];
    // 解决 IE 下点击后无法自动失焦情况
    this.elementRef.nativeElement.querySelector('.areaMatchWeakDiv').blur();
  }

  public zipUpload() {
    this.elementRef.nativeElement.querySelector('#bcload').value = '';
    this.elementRef.nativeElement.querySelector('#bcload').click();
  }
  public cancelTip() {
    this.bcUploadResultTip.content = '';
  }

  /**
   * BC文件上传
   * @param choice  上传的模式
   * @param type 任务类型
   */
  public uploadWeakFile(choice: string, type: string) {
    const { file, params, formData } = this.handleZip(choice, type);
    // 检查文件是否能够上传
    this.Axios.axios.post('/portadv/tasks/check_upload/', params).then((data: any) => {
      this.displayAreaMatch = false;
      if (this.commonService.handleStatus(data) === 0) {
        const times = setInterval( () => {
          this.upTimes++;
          if (this.upTimes >= 100) {
            this.isSlow = true;
            this.upTimes = 0;
            clearInterval(times);
          }
        }, 1000);

        this.searchUploadBcFile(choice, type, formData, file, times);
      } else if (this.commonService.handleStatus(data) === 1) {
        // check_upload异常情况，包括文件存在
        if (data.infochinese === '文件已存在，上传失败') {
          this.bcExitFileName = data.data.new_name;
          this.oldName = data.data.old_name;
          this.bcsuffix = data.data.suffix;
          this.exitFileNameReplace = this.i18nService.I18nReplace(
            this.i18n.analysis_center.exit.content,
            { 1: data.data.old_name }
          );
          this.exitMask.Open();
          return;
        } else {
          this.bcUploadResultTip.state = 'error';
          this.bcUploadResultTip.content = this.currLang === 'zh-cn' ? data.infochinese : data.info;
          $('#bcload').val('');
        }
        this.isShow = false;
      } else { // 磁盘告警
        this.bcUploadResultTip.state = 'error';
        this.bcUploadResultTip.content = this.currLang === 'zh-cn' ? data.infochinese : data.info;
        $('#bcload').val('');
      }
    });
  }

  // 查看bc 文件上传状态
  public searchUploadBcFile(choice: string, type: string, formData: FormData, file: { name: string }, times?: any) {
    const CancelToken = axios.CancelToken;
    const that = this;
    this.Axios.axios.post('/portadv/tasks/upload/', formData, {
      headers: {
        'need-unzip': false,
        'scan-type': type,
        choice
      },
      cancelToken: new CancelToken(function executor(c) {
        that.cancel = c;
      }),
      ...this.alreadyconfig
    }).then((resp: any) => {
      this.bcsuffix = '';
      this.bcExitFileName = '';
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
        if (times) {
          clearInterval(times);
        }
        this.bcFileName = resp.data;
        this.bcUploadResultTip.state = 'success';
        this.bcUploadResultTip.content = this.currLang === 'zh-cn' ? resp.infochinese : resp.info;
        this.msgService.sendMessage({ type: 'uploadingContainer', data: 'start'});
        this.msgService.sendMessage({
          type: 'uploadingContainer',
          name: 'barrier',
          state: 'success',
          data: 'start',
          isShow: false,
          isCompress: false,
          path: resp.data,
          content: this.currLang === 'zh-cn' ? resp.infochinese : resp.info
        });
      } else if (this.commonService.handleStatus(resp) === 1) {
        this.isShow = false;
        this.isCompress = false;
        clearInterval(times);
        this.bcFileName = '';
        this.bcUploadResultTip.state = 'error';
        this.bcUploadResultTip.content = this.currLang === 'zh-cn' ? resp.infochinese : resp.info;
        this.msgService.sendMessage({ type: 'uploadingContainer', data: 'end'});
      } else if (resp.status === Status.maximumTask) { // 等待上传中
        let index: number = JSON.parse(sessionStorage.getItem('BcMaximumTask')) || 0;
        let isCompress: boolean;
        if (index > 20) {
          const content = this.currLang === 'zh-cn' ? resp.infochinese : resp.info;
          this.mytip.alertInfo({ type: 'error', content, time: 5000 });
          isCompress = false;
          clearTimeout(this.maximumTime);
          sessionStorage.setItem('BcMaximumTask', '0');
        } else {
          isCompress = true;
          sessionStorage.setItem('BcMaximumTask', JSON.stringify(++index));
          this.maximumTime = setTimeout(() => {
            this.searchUploadBcFile(choice, type, formData, file);
          }, 30000);
          sessionStorage.setItem('BcTime', JSON.stringify(this.maximumTime));
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
        this.msgService.sendMessage({ type: 'uploadingContainer', data: 'end'});
        this.bcUploadResultTip.state = 'error';
        this.bcUploadResultTip.content = this.currLang === 'zh-cn' ? resp.infochinese : resp.info;
      }
      if (resp === 'timeout') {
        clearInterval(times);
        this.isShow = false;
        this.msgService.sendMessage({ type: 'uploadingContainer', data: 'end'});
        this.isCompress = false;
        this.bcUploadResultTip.state = 'error';
        this.bcUploadResultTip.content = this.i18n.common_term_upload_time_out;
        $('#bcload').val('');
      }
    }).catch((e: any) => {
      clearInterval(times);
      this.isCompress = false;
      this.isShow = false;
      this.bcUploadResultTip.state = '';
      this.bcUploadResultTip.content = '';
      $('#bcload').val('');
      this.msgService.sendMessage({
        type: 'uploadingContainer',
        name: 'barrier',
        data: 'error',
        isShow: false,
        isCompress: false,
      });
    });
  }

  // 取消上传请求 -> 父组件调用该方法
  closeRequest() {
    this.isCompress = false;
    sessionStorage.setItem('BcMaximumTask', '0');
    const time = this.maximumTime || JSON.parse(sessionStorage.getItem('BcTime'));
    clearTimeout(time);
    if (this.cancel) {
      this.cancel();
    }
  }

  /**
   * 对上传的bc文件进行相关处理
   * @param choice 上传的模式
   * @param type 任务类型
   */
  public handleZip(choice: string, type: string): any {
    this.exitMask.Close();
    this.isUploadZip = false;
    this.uploadStartFlag = false;
    this.isShow = false;
    let file;
    file = this.elementRef.nativeElement.querySelector('#bcload').files[0];
    this.info1.filename = file.name;
    const size = file.size / 1024 / 1024;
    // 文件大于 1024M | 包含中文 以及 空格 等其它特殊字符
    if (size > fileSize || this.regService.filenameReg(file.name)) {
      this.isShow = false;
      this.isCompress = false;
      this.bcUploadResultTip.state = 'error';
      this.bcUploadResultTip.content = size > fileSize
        ? this.i18n.common_term_upload_max_size_tip
        : this.i18n.upload_file_tip.reg_fail;
      this.fileExceed = size > fileSize ? true : false;
      return;
    }
    this.info1.filesize = size.toFixed(1);
    let params = {
      file_size: file.size,
      file_name: file.name,
      need_unzip: 'false',
      scan_type: type,
      choice
    };
    const formData = new FormData();
    if (choice === 'save_as') {
      this.info1.filename = `${this.bcExitFileName}${this.bcsuffix}`;
      formData.append('file', file, this.info1.filename);
      params = {
        file_size: file.size,
        file_name: this.info1.filename,
        need_unzip: 'false',
        scan_type: type,
        choice
      };
    } else if (choice === 'override') {
      formData.append('file', file, this.oldName);
      params = {
        file_size: file.size,
        file_name: this.oldName,
        need_unzip: 'false',
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

  isDeleteAreaMatch(value: any) {
    this.deleteValue = value;
    this.fileNameDelete =
      this.i18nService.I18nReplace(this.i18n.analysis_center.exit.delete_file_content, { 1 : value});
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

  closeMaskExit() {
    this.exitMask.Close();
    $('#bcload').val('');
  }

  deleteAreaMatch() {
    let path;
    let fileName;
    let params;
    fileName = this.deleteValue;
    if (this.selectType.curSelObj.isWeak) {
      params = {
        file_name: fileName,
        path: 'weakconsistency_bc'
      };
      this.deleteTextAreaFile(params);
      return;
    }
    path = 'weakconsistency_bc';
    params = {
      file_name: fileName,
      path,
    };
    this.Axios.axios.delete(`/portadv/tasks/delete_file/`, { data: params }).then((data: any) => {
      if (this.commonService.handleStatus(data) === 0) {
        let vals = this.inputValue.split(',');
        if (vals.length === 1) {
          this.inputValue = '';
        } else {
          vals = vals.filter(val => {
            return this.deleteValue.indexOf(val) >= 0 && val;
          });
          if (vals.length > 0) { this.inputValue = ''; }
        }
        this.bcFileName = '';
      }
      sessionStorage.removeItem('memoryBarrierPathName');
      const type = this.commonService.handleStatus(data) === 0 ? 'success' : 'warn';
      const content = this.currLang === 'zh-cn' ? data.infochinese : data.info;
      this.mytip.alertInfo({ type, content, time: 5000 });
    });
  }

  // 删除 textarea 文件
  deleteTextAreaFile(file: any) {
    this.Axios.axios.delete(`/portadv/tasks/delete_file/`, { data: file }).then((data: any) => {
      if (this.commonService.handleStatus(data) === 0) {
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
      sessionStorage.removeItem('memoryBarrierweakFileName');
      sessionStorage.removeItem('memoryBarrierweakCompilerName');
      const type = this.commonService.handleStatus(data) === 0 ? 'success' : 'warn';
      const content = this.currLang === 'zh-cn' ? data.infochinese : data.info;
      this.mytip.alertInfo({ type, content, time: 5000 });
    });
  }

  /**
   * 替换
   * @param choice 上传的模式
   */
  uploadAgain(choice: string): void {
    if (choice === 'override') {
      this.uploadWeakFile(choice, '8');
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
    this.saveasMask.Close();
    this.uploadWeakFile(choice, '8');
  }

  closeMaskSaveAs() {
    this.saveasMask.Close();
    $('#bcload').val('');
  }

  // 前往文件大小超过限制的联机帮助
  goFileHelp() {
    this.commonService.goHelp('file');
  }

  startCheck() {
    if (!this.maxFilenameLength.valid) { return; }
    const params = {
      bc_file: `${this.workspace}${this.bcFileName}`, // 需要进行迁移扫描的源代码绝对路径，不同的路径使用逗号分割
    };
    this.Axios.axios.post('/portadv/weakconsistency/tasks/', params).then((resp: any) => {
      if (this.commonService.handleStatus(resp) === 0) {
        this.createBtnDisabled = true;
        if (resp.data.task_id) {
          this.Axios.axios.get(
            `/task/progress/?task_type=11&task_id=${encodeURIComponent(resp.data.task_id)}`
          ).then((data: any) => {
            if (this.commonService.handleStatus(data) === 0) {
              this.msgService.sendMessage({
                type: 'creatingTask',
                data: {
                  id: resp.data.task_id,
                  type: 'bcCheck'
                }
              });
              return;
            }
            this.createBtnDisabled = true;
            const failInfo = sessionStorage.getItem('language') === 'zh-cn' ? data.infochinese : data.info;
            const resultMsg = {
              id: resp.data.task_id,
              type: 'bcCheck',
              state: 'failed',
              msg: failInfo
            };
            this.msgService.sendMessage({
              type: 'creatingResultMsg',
              data: resultMsg
            });
          });
        }
      } else if ( this.commonService.handleStatus(resp) === 1) { // 启动任务失败
          this.createBtnDisabled = true;
          const lang = sessionStorage.getItem('language');
          const content = lang === 'zh-cn' ? resp.infochinese : resp.info;
          const resultMsg = {
            id: resp.data.task_id,
            type: 'bcCheck',
            state: 'failed',
            msg: content,
            situation: 3,
            status: resp.status
          };
          this.msgService.sendMessage({
            type: 'creatingResultMsg',
            data: resultMsg
          });
      } else {
        const type = resp.status === '0x050420' ? 'error' : 'warn';
        const content = this.currLang === 'zh-cn' ? resp.infochinese : resp.info;
        this.mytip.alertInfo({ type, content, time: 10000 });
      }
    });
  }
}

export class CustomValidators {
  public static confirmNewName(i18n: any): ValidatorFn {
    const reg = /^[\w-()\u4e00-\u9fa5]{1}[\w-\.+()\u4e00-\u9fa5]{0,63}$/;
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return { confirmNewName: { tiErrorMessage: i18n.common_term_required_tip } };
      }
      return reg.test(control.value) === false ? {
        confirmNewName: { tiErrorMessage: i18n.common_term_valition_filename } } : null;
    };
  }
  public static filenameLength(i18n: any): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const filename = control.value.trim();
      if (!filename.includes(',')) {
        return filename.length > MAXFILENAMELENGTH ? {
          confirmNewName: { tiErrorMessage: i18n.common_term_valition_filename_length } } : null;
      } else {
        const arr = filename.split(',');
        for (const item of arr) {
          if (item.length > MAXFILENAMELENGTH) {
            return {confirmNewName: { tiErrorMessage: i18n.common_term_valition_filename_length } };
          }
        }
        return null;
      }
    };
  }
}
