import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {
  TiFilter, TiMessageService,
  TiModalService, TiTableColumns, TiTableSrcData,
  TiValidationConfig, TiTableRowData
} from '@cloud/tiny3';
import { I18nService } from '../../service/i18n.service';
import { UtilsService } from '../../service/utils.service';
import { COLOR_THEME, VscodeService } from '../../service/vscode.service';

const enum LANGUAGE_TYPE {
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

const enum STATUS {
  CHECK_SUCCESS = '0x010100',
  FILE_EXIST = '0x010115',
  INSUFFICIENT_SPACE = '0x010611',
  UPLOAD_SUCCESS = '0x010101',
  MAXIMUM_TASK = '0x010125', // 文件上传任务已达到上限
  GET_CRL_SUCCESS = '0x060702',
  DELETE_CRL_SUCCESS = '0x060703',
  CRL_LIMIT = '0x060714'
}

@Component({
  selector: 'app-certificate-revocation-list',
  templateUrl: './certificate-revocation-list.component.html',
  styleUrls: ['./certificate-revocation-list.component.scss']
})
export class CertificateRevocationListComponent implements OnInit {
  @ViewChild('exitmask', { static: false }) exitMask: { Close: () => void; Open: () => void; };
  @ViewChild('deleteMask', { static: false }) deleteMask: { Close: () => void; Open: () => void; };
  @ViewChild('crlLimitMask', { static: false }) crlLimitMask: { Close: () => void; Open: () => void; };
  public i18n: any;
  public isUploading = false;
  public role = ((self as any).webviewSession || {}).getItem('role') === 'Admin';
  public acceptType: string; // 吊销列表后缀
  public CRLFileSzie = 5;
  public isShow = false;
  public isCompress = false;
  public isUploadSuccess = false;
  public exitFileNameReplace = '';
  public CRLName = '';
  public displayed: any = [];
  public iconColor = '';
  public showLoading = false;
  public info = {
    filename: '',
    filesize: '',
    filePath: ''
  };
  public columns: Array<TiTableColumns> = [
    {
      title: '',
      width: '5%'
    },
    {
      title: '',
      width: '15%'
    },
    {
      title: '',
      width: '20%'
    },
    {
      title: '',
      width: '15%'
    },
    {
      title: '',
      width: '15%'
    },
    {
      title: '',
      width: '20%'
    },
    {
      title: '',
      width: '10%'
    }
  ];
  public CRLDisplayed: Array<TiTableRowData> = []; // 证书数据展示
  public CRLSrcData: TiTableSrcData;
  // 获取主题颜色
  public ColorTheme = {
    Dark: COLOR_THEME.Dark,
    Light: COLOR_THEME.Light
  };
  // maxCount定义为1时，代表单文件上传
  filters: Array<TiFilter> = [{
    name: 'maxCount',
    params: [1]
  }];
  public currTheme = COLOR_THEME.Dark;
  // Web服务端证书列表
  public webCertData: TiTableSrcData;
  public file: any;
  public alertInfo: string;
  public typePrompt: string;
  public open = false;
  public dismissOnTimeout = 5000;
  public hasArrow = false;
  public validation: TiValidationConfig = {
    type: 'blur',
    errorMessage: {}
  };
  public currLang: any;

  constructor(
    public i18nService: I18nService,
    public vscodeService: VscodeService,
    public timessage: TiMessageService,
    private elementRef: ElementRef,
    public tiModal: TiModalService,
    public utilsService: UtilsService,
  ) {
    this.i18n = this.i18nService.I18n();
  }
  @ViewChild('csrModal', { static: false }) csrModal: any;
  @ViewChild('csrLeadModal', { static: false }) csrLeadModal: any;
  /**
   * ngOnInit
   */
  ngOnInit() {
    // 获取全局url配置数据
    this.currLang = I18nService.getLang();
    // vscode颜色主题
    if (document.body.className === 'vscode-light') {
      this.currTheme = COLOR_THEME.Light;
    }

    this.vscodeService.regVscodeMsgHandler('colorTheme', (msg: any) => {
      this.currTheme = msg.colorTheme;
    });
    this.acceptType = '.crl';
    this.showLoading = true;
    this.CRLSrcData = {
      data: [],
      state: {
        searched: false, // 源数据未进行搜索处理
        sorted: false, // 源数据未进行排序处理
        paginated: false // 源数据未进行分页处理
      }
    };
    if (!this.role) {
      this.columns.pop();
    }
    setTimeout(() => {
      this.getCRLInfo();
    }, 600);
  }
  private showInfoBox(info: any, type: any, realStatus: any) {
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
  private showI18nInfoBox(key: any, type: any) {
    const message = {
      cmd: 'showInfoBox',
      data: {
        info: this.i18n[key],
        type
      }
    };
    this.vscodeService.postMessage(message, null);
  }
  // 展开详情
  public beforeToggle(row: TiTableRowData): void {
    row.showDetails = !row.showDetails;
  }

  getCRLInfo() {
    this.showLoading = true;
    const info = {
      url: '/cert/crl_info/',
    };
    this.vscodeService.get(info, (res: any) => {
      if (res.realStatus === STATUS.GET_CRL_SUCCESS) {
        const data = this.handleCRLDate(res.data);
        this.CRLSrcData.data = data;
      }
      this.showLoading = false;
    });
  }
  /**
   * 处理返回数据
   */
  handleCRLDate(data: any) {
    const CRLDate: Array<any> = [];
    if (data.crl_list) {
      data.crl_list.forEach((item: any) => {
        const filename = Object.keys(item)[0];
        CRLDate.push(
          {
            name: filename,
            issuedBy: item[filename].issuer,
            validTime: item[filename].effective_date,
            updateTime: item[filename].next_update_date,
            certStatus: this.handelStatus(item[filename].status),
            crlDetail: item[filename].crl_detail,
            color: this.iconColor
          }
        );
      });
    }
    return CRLDate;
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
  public uploadFile(choice: string) {
    this.exitMask.Close();
    this.isUploadSuccess = false;
    this.isShow = false;
    this.isUploading = true;
    const inputDom = this.elementRef.nativeElement.querySelector('#crlload');
    let file: any;
    file = inputDom.files[0];
    if (!(/.crl$/).test(file.name)) {
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
    if (size > this.CRLFileSzie) {
      this.isShow = false;
      this.showI18nInfoBox('plugins_porting_message_crlExceedMaxSize', 'info');
      this.isUploading = false;
      return;
    }
    this.info.filesize = size.toFixed(1);
    let params = {
      file_size: file.size,
      file_name: file.name,
      choice
    };
    const formData = new FormData();
    if (choice === 'override') {
      formData.append('file', file, this.info.filename);
      params = {
        file_size: file.size,
        file_name: this.info.filename,
        choice
      };
    } else {
      formData.append('file', file);
    }
    this.vscodeService.post({url: '/cert/check_upload/', params}, (data: any) => {
      if (data.realStatus === STATUS.CHECK_SUCCESS) {
        const uploadMsg = {
          cmd: 'uploadProcess',
          data: {
            msgID: MESSAGE_MAP.FILE_UPLOAD,
            url: '/cert/upload/',
            fileUpload: 'true',
            filePath: file.path ? file.path : this.info.filePath,
            overrideName: this.info.filename,
            fileSize: file.size,
            autoPack: {
              'scan-type': 0,
              choice
            },
            uploadPrefix: this.i18n.plugins_porting_uploadPrefix_crl
          }
        };
        this.vscodeService.postMessage(uploadMsg, (resp: any) => {
          this.isUploading = false;
          if (resp) {
            this.exitMask.Close();
            if (resp.realStatus === STATUS.UPLOAD_SUCCESS) {
              this.isShow = false;
              this.isCompress = false;
              this.isUploadSuccess = true;
              this.getCRLInfo();
              this.showMessageByLang(resp, 'info');
              return;
            } else if (resp.realStatus === STATUS.MAXIMUM_TASK) { // 等待上传中
              this.isUploading = true;
              this.handleUploadWaiting(uploadMsg, resp);
            } else if (resp.realStatus === STATUS.INSUFFICIENT_SPACE) {
              this.utilsService.sendDiskAlertMessage();
            } else if (resp === 'timeout') {
              this.showI18nInfoBox('common_term_report_500', 'warn');
              this.isCompress = false;
            } else {
              this.isShow = false;
              this.isCompress = false;
              this.showMessageByLang(resp, 'error');
            }
          }
        });
    } else {
        if (data.realStatus === STATUS.INSUFFICIENT_SPACE) {
          this.utilsService.sendDiskAlertMessage();
          this.isUploading = false;
        } else if (data.realStatus === STATUS.FILE_EXIST) {
          this.exitFileNameReplace = this.i18nService.I18nReplace(
            this.i18n.plugins_certificate_revocation_list.importDuplicateTips,
            { 1: params.file_name});
          this.exitMask.Open();
          return;
        } else if (data.realStatus === STATUS.CRL_LIMIT) {
          this.crlLimitMask.Open();
          return;
        }else {
            this.isShow = false;
            this.isCompress = false;
            this.showMessageByLang(data, 'error');
            return;
        }
      }
  });
    this.isUploading = false;
  }
  importCRL() {
        this.elementRef.nativeElement.querySelector('#crlload').value = '';
        this.elementRef.nativeElement.querySelector('#crlload').click();
  }
  closeMaskExit() {
    this.exitMask.Close();
    $('#crlload').val('');
  }
  closeDeleteMask() {
    this.deleteMask.Close();
  }

  closeCrlLimitMask() {
    this.crlLimitMask.Close();
  }
  uploadAgain(choice: string) {
    if (choice === 'override') {
      this.uploadFile(choice);
    } else {
      this.exitMask.Close();
    }
  }
  /**
   * 删除CRL列表弹窗
   */
  deleteCRL(row: any){
    this.deleteMask.Open();
    this.CRLName = row.name;
  }
  deleteCRLAction() {
    const params = {
      file: this.CRLName
    };
    const options = {
      url: '/cert/crl_file/',
      params
    };
    this.vscodeService.delete(options, (res: any) => {
      if (res.realStatus === STATUS.DELETE_CRL_SUCCESS) {
        this.getCRLInfo();
        this.deleteMask.Close();
        this.showMessageByLang(res, 'info');
      } else {
        this.getCRLInfo();
        this.deleteMask.Close();
        this.showMessageByLang(res, 'error');
      }
    });
  }
  /**
   * 根据状态显示文字
   */
  public handelStatus(certStatus: string | number) {
    let status = '';
    if (certStatus === 'normal') {
      status = this.i18n.plugins_certificate_revocation_list.certIsValidate;
      this.iconColor = 'valid-icon';
    }
    if (certStatus === 'expire') {
      status = this.i18n.plugins_certificate_revocation_list.certIsNotValidate;
      this.iconColor = 'failed-icon';
    }
    return status;
  }
}
