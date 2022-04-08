import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import {
  TiTableRowData, TiTableSrcData, TiMenuItem
} from '@cloud/tiny3';
import {
  I18nService, CommonService, MytipService, RegService, AxiosService, MessageService
} from '../../../service';
import { LanguageType } from '../../../global/globalData';
import { Status } from '../../../modules';
import axios from 'axios';

@Component({
  selector: 'app-certificate-revocation-list',
  templateUrl: './certificate-revocation-list.component.html',
  styleUrls: ['./certificate-revocation-list.component.scss']
})
export class CertificateRevocationListComponent implements OnInit {

  constructor(
    public mytip: MytipService,
    public i18nService: I18nService,
    public Axios: AxiosService,
    private elementRef: ElementRef,
    private regService: RegService,
    private commonService: CommonService,
    private msgService: MessageService,
    private mytipService: MytipService
  ) {
    this.i18n = this.i18nService.I18n();
  }
  @ViewChild('exitmask', { static: false }) exitMask: any;
  @ViewChild('deleteMask', { static: false }) deleteMask: any;
  @ViewChild('crlLimitMask', { static: false }) crlLimitMask: any;
  public i18n: any; // 国际化
  public currLang: string; // 当前语言
  public isAdmin = false; // 管理员
  public displayed: Array<TiTableRowData> = []; // 表示表格实际呈现的数据（开发者默认设置为[]即可）
  public CRLDisplayed: Array<TiTableRowData> = []; // 证书数据展示
  public CRLSrcData: TiTableSrcData;
  public srcData: TiTableSrcData;
  public acceptType: string; // CRL文件后缀
  public isUpload = false;
  public uploadProgress: any;
  public uploadCRLFile: any;
  public fileSize: number;
  public exitFileNameReplace = '';
  public CRLName = '';
  public suffix = '';
  public oldName: any;
  public exitFileName = '';
  public info = {
    filename: '',
    filesize: ''
  };
  public uploadResultTip = {
    state: '',
    content: ''
  };
  public fileExceed = false; // 文件超过 10M时
  isShow = false;
  isSlow = false;
  hoverFlag = false;
  public displayAreaMatch = false;
  public upTimes = 0;
  public cancel1: any; // 取消 压缩包上传 axios 请求
  public maximumTime: any; // 上传等待定时器
  public cancel: any; // 取消 文件上传 axios 请求
  private fileExist = '0x010115';
  private CRLLimit = '0x060714';
  ngOnInit(): void {
    this.currLang = sessionStorage.getItem('language');
    this.isAdmin = sessionStorage.getItem('role') === 'Admin';
    this.acceptType = '.crl'; // 证书吊销列表后缀
    this.fileSize = 5; // 不超过5M
    this.CRLSrcData = {
      data: [],
      state: {
        searched: false, // 源数据未进行搜索处理
        sorted: false, // 源数据未进行排序处理
        paginated: false // 源数据未进行分页处理
      }
    };
    this.getCRLInfo();
  }
  public importCRL(){
    this.elementRef.nativeElement.querySelector('#zipload').value = '';
    this.elementRef.nativeElement.querySelector('#zipload').click();
  }
  public searchCRL(formData: FormData, file: { name: string }, times?: any) {
    const CancelToken = axios.CancelToken;
    const that = this;
    this.Axios.axios.post('/cert/upload/', formData, {
      cancelToken: new CancelToken(function executor(c) {
        that.cancel1 = c;
      }),
    }).then((resp: any) => {
      this.exitMask.Close();
      if (times) {
        clearInterval(times);
      }
      if (this.commonService.handleStatus(resp) === 0) {
        clearTimeout(this.maximumTime);
        this.getCRLInfo();
        this.uploadResultTip.state = 'success';
        this.uploadResultTip.content = this.currLang === LanguageType.ZH_CN
          ? resp.infochinese
          : resp.info;
        this.mytipService
          .alertInfo({ type: this.uploadResultTip.state, content: this.uploadResultTip.content, time: 10000 });
      } else if (this.commonService.handleStatus(resp) === 1) {
        clearTimeout(this.maximumTime);
        this.uploadResultTip.state = 'error';
        this.uploadResultTip.content = this.currLang === LanguageType.ZH_CN
          ? resp.infochinese
          : resp.info;
        this.mytipService
          .alertInfo({ type: this.uploadResultTip.state, content: this.uploadResultTip.content, time: 10000 });
      } else if (resp.status === Status.maximumTask) { // 等待上传中
        const index: number = JSON.parse(sessionStorage.getItem('sourceMaximumTask')) || 0;
        if (index > 20) {
          const content = this.currLang === 'zh-cn' ? resp.infochinese : resp.info;
          this.mytip.alertInfo({ type: 'error', content, time: 5000 });
          sessionStorage.setItem('sourceMaximumTask', '0');
          clearTimeout(this.maximumTime);
        }
      } else if (resp.status === '0x010611') {
        clearTimeout(this.maximumTime);
        this.uploadResultTip.state = 'error';
        this.uploadResultTip.content = this.currLang === LanguageType.ZH_CN
          ? resp.infochinese
          : resp.info;
        this.mytipService
          .alertInfo({ type: this.uploadResultTip.state, content: this.uploadResultTip.content, time: 10000 });
      }
      $('#zipload').val('');
    }).catch((e: any) => {
      $('#zipload').val('');
    });
  }
  public uploadCRL(choice: any) {
    this.isUpload = true;
    this.isShow = false;
    this.isSlow = false;
    let file: any;
    if (choice === 'normal') {
      file = this.elementRef.nativeElement.querySelector('#zipload').files[0];
      this.uploadCRLFile = file;
    } else {
      file = this.uploadCRLFile;
    }
    this.info.filename = file.name;
    const size = file.size / 1024 / 1024;

    if (size > this.fileSize || this.regService.filenameReg(file.name)) {
      this.isShow = false;
      this.uploadResultTip.state = 'error';
      this.uploadResultTip.content = size > this.fileSize
        ? this.i18n.certificate_revocation_list.filesizeTips
        : this.i18n.upload_file_tip.reg_fail;
      this.fileExceed = size > this.fileSize ? true : false;
      this.mytipService
        .alertInfo({ type: this.uploadResultTip.state, content: this.uploadResultTip.content, time: 10000 });
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
    this.Axios.axios.post('/cert/check_upload/', params).then((data: any) => {
      this.displayAreaMatch = false;
      if (this.commonService.handleStatus(data) === 0) {
        this.Axios.axios.defaults.headers.choice = choice;
        const times = setInterval(() => {
          this.upTimes++;
          if (this.upTimes >= 100) {
            this.isSlow = true;
            this.upTimes = 0;
            clearInterval(times);
          }
        }, 1000);
        this.searchCRL(formData, file, times);
      }else if (this.commonService.handleStatus(data) === 1) {
        // check_upload异常情况，包括文件存在
        if (data.status === this.fileExist) {
          this.exitFileNameReplace = this.i18nService.I18nReplace(
            this.i18n.certificate_revocation_list.importDuplicateTips,
            { 1: params.file_name }
          );
          this.exitMask.Open();
          return;
        } else if (data.status === this.CRLLimit) {
          this.crlLimitMask.Open();
          return;
        } else {
          this.uploadResultTip.state = 'error';
          this.uploadResultTip.content = this.currLang === LanguageType.ZH_CN
            ? data.infochinese
            : data.info;
          this.mytipService
            .alertInfo({ type: this.uploadResultTip.state, content: this.uploadResultTip.content, time: 10000 });
          return;
        }
        this.isShow = false;
        $('#zipload').val('');
      } else {
        this.uploadResultTip.state = 'error';
        this.uploadResultTip.content = this.currLang === LanguageType.ZH_CN
          ? data.infochinese
          : data.info;
        this.mytipService
          .alertInfo({ type: this.uploadResultTip.state, content: this.uploadResultTip.content, time: 10000 });
        $('#zipload').val('');
      }
    });
  }
  public dataToItemsFn: (data: any) => Array<TiMenuItem> = () => {
    const items: Array<TiMenuItem> = [{
      label: this.i18n.certificate.generation_file,
      association: 'switch',
      id: '1'
    }, {
      label: this.i18n.certificate.export_file,
      association: 'switch',
      id: '2'
    }, {
      label: this.i18n.certificate.restart,
      id: '3'
    }, {
      label: this.i18n.certificate.update,
      id: '4'
    }];
    return items;
  }

  // 展开详情
  public beforeToggle(row: TiTableRowData): void {
    row.showDetails = !row.showDetails;
  }
  onSelect(item: any): void {
    switch (item.id) {
      default:
        break;
    }
  }
  closeMaskExit() {
    this.exitMask.Close();
    $('#zipload').val('');
    $('#files').val('');
  }
  closeDeleteMask() {
    this.deleteMask.Close();
  }

  closeCrlLimitMask() {
    this.crlLimitMask.Close();
  }
  uploadAgain(choice: any) {
    if (choice === 'override') {
      this.uploadCRL(choice);
    } else {
      this.exitMask.Close();
    }
  }
  // 取消CRL列表上传
  closeRequest() {
    this.isUpload = false;
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

  getCRLInfo() {
    this.Axios.axios.get(`/cert/crl_info/`).then((res: any) => {
      if (this.commonService.handleStatus(res) === 0) {
        const data = this.handleCRLDate(res.data);
        this.CRLSrcData.data = data;
      } else {
        const content = this.currLang === 'zh-cn' ? res.infochinese : res.info;
        this.mytipService.alertInfo({ type: 'error', content, time: 10000 });
      }
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
          certStatus: item[filename].status,
          crlDetail: item[filename].crl_detail
        }
    );
    });
    }
    return CRLDate;
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
    this.Axios.axios.delete(`/cert/crl_file/`, {data: params}).then((res: any) => {
      if (this.commonService.handleStatus(res) === 0) {
        const content = this.currLang === 'zh-cn' ? res.infochinese : res.info;
        this.getCRLInfo();
        this.deleteMask.Close();
        this.mytipService.alertInfo({ type: 'success', content, time: 10000 });
      } else {
        const content = this.currLang === 'zh-cn' ? res.infochinese : res.info;
        this.getCRLInfo();
        this.deleteMask.Close();
        this.mytipService.alertInfo({ type: 'error', content, time: 10000 });
      }
    });
  }
}
