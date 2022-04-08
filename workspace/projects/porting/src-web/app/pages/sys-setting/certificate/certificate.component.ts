import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormControl, FormGroup, ValidationErrors, ValidatorFn, AbstractControl } from '@angular/forms';
import {
  TiTableRowData, TiMenuItem, TiTableSrcData, TiValidationConfig,
  TiValidators, TiFileItem, TiFilter
} from '@cloud/tiny3';
import { I18nService, AxiosService, MytipService, CommonService } from '../../../service';

@Component({
  selector: 'app-certificate',
  templateUrl: './certificate.component.html',
  styleUrls: ['./certificate.component.scss']
})
export class CertificateComponent implements OnInit {

  @ViewChild('csrConfig', { static: false }) csrConfigModal: any;
  @ViewChild('certImport', { static: false }) certImportModal: any;
  @ViewChild('updateKey', { static: false }) updateKeyModal: any;
  constructor(
    public i18nService: I18nService,
    public Axios: AxiosService,
    private elementRef: ElementRef,
    private myTip: MytipService,
    private commonService: CommonService
  ) {
    this.i18n = this.i18nService.I18n();
    this.curLang = sessionStorage.getItem('language');
  }
  public i18n: any;
  public curLang = 'zh-cn';
  public validTime: any = '';
  public certStatus: any = '';
  public displayed: Array<TiTableRowData> = []; // 表示表格实际呈现的数据（开发者默认设置为[]即可）
  public srcData: TiTableSrcData;
  public isMore = false;
  public csrFormList: any;
  public csrConfForm: FormGroup;
  public validation: TiValidationConfig = {
    type: 'blur',
    errorMessage: {}
  };
  public importCert: any;
  public isAdmin = false;
  public filters: Array<TiFilter> = [
    { name: 'type', params: ['.crt,.cer,.pem'] },
    { name: 'maxSize', params: [1048576] },
    { name: 'maxCount',  params: [1]}
  ];
  public isImport: boolean;

  ngOnInit() {
    this.isAdmin = sessionStorage.getItem('role') === 'Admin';
    this.isImport = false;
    this.csrFormList = {
      country: this.i18n.certificate.country,
      province: this.i18n.certificate.province,
      city: this.i18n.certificate.city,
      company: this.i18n.certificate.organization,
      dept: this.i18n.certificate.department,
      commName: this.i18n.certificate.commonName,
    };
    this.srcData = {
      data: [],
      state: {
          searched: false, // 源数据未进行搜索处理
          sorted: false, // 源数据未进行排序处理
          paginated: false // 源数据未进行分页处理
      }
    };
    this.getCertStatus();

    this.importCert = {
      label: this.i18n.certificate.file_label,
      url: './api/cert/cert/',
      autoUpload: false,
      placeholder: this.i18n.common_term_webcert_import_placeholder,
      headersConfig: {
        Authorization: sessionStorage.getItem('token')
      },
      errorTip: ''
    };

    this.csrConfForm = new FormGroup({
      country: new FormControl('', [CustomValidators.country(this.i18n)]),
      province: new FormControl('', [CustomValidators.city(this.i18n)]),
      city: new FormControl('', [CustomValidators.city(this.i18n)]),
      company: new FormControl('', [CustomValidators.company(this.i18n)]),
      dept: new FormControl('', [CustomValidators.company(this.i18n)]),
      commName: new FormControl('', [CustomValidators.commName(this.i18n)]),
    });
  }
  public getCertStatus() {
    this.srcData.data = [];
    this.Axios.axios.get('/cert/').then((data: any) => {
      if (this.commonService.handleStatus(data) === 0) {
        this.validTime = data.data.cert_expired.replace('T', ' ');
        this.certStatus = data.data.cert_flag;
        if (data.data.cert_flag === '-1' || data.data.cert_flag === '0') {
        }
        this.srcData.data.push(
          {
            name: 'cert.pem',
            validTime: this.validTime,
            certStatus: this.certStatus
          }
        );
      }
    });
  }

  onSelect(item: any): void {
    switch (item.id) {
      case '1':
        this.showCsrConfigModal();
        break;
      case '2':
        this.showImportModal();
        break;
      case '3':
        this.restartService();
        break;
      case '4':
        this.showUpdateKeyModal();
        break;
      default:
        break;
    }
  }

  private restartService() {
    let flag = true;
    const timer = setTimeout(() => {
      this.myTip.alertInfo({ type: 'success', content: this.i18n.common_term_webcert_restart_tip, time: 10000 });
    }, 1000);
    this.Axios.axios.post(`/cert/nginx/reload/`).then((resp: any) => {
      const content = this.curLang === 'zh-cn' ? resp.infochinese : resp.info;
      const type = this.commonService.handleStatus(resp) === 0 ? 'success' : 'error';
      this.myTip.alertInfo({ type, content, time: 5000});
      if (type === 'error') {
        clearTimeout(timer);
      }
      flag = this.commonService.handleStatus(resp) !== 1;
    });
    setTimeout(() => {
      if (!flag) { return; }
      window.location.reload();
    }, 5000);
  }
  onAddItemFailed(fileItem: TiFileItem) {
    const types = ['crt', 'cer', 'pem'];
    const file = fileItem.file.type;
    if (types.indexOf(file) < 0) {
      this.importCert.errorTip = this.i18n.certificate_upload_failed_tip;
    } else if (fileItem.file.size > 1048576) {
      // 证书大于1M
      this.importCert.errorTip = this.i18n.certificate_size_failed;
    }
  }

  // 添加证书文件成功
  onAddItemSuccess(fileItem: TiFileItem) {
    this.isImport = true;
    this.importCert.errorTip = '';
  }

  onBeforeSendItems(fileItems: Array<TiFileItem>): void {
    fileItems.forEach((item: TiFileItem) => {
      item.formData = {
        file: fileItems[0]._file
      };
    });
  }

  onCompleteItems($event: any): void {
    const data = JSON.parse($event.response);
    const type = this.commonService.handleStatus(data) === 0 ? 'success' : 'error';
    const content = this.curLang === 'zh-cn' ? data.infochinese : data.info;
    this.myTip.alertInfo({ type, content, time: 5000 });
    $event.fileItems[0].remove();
    this.certImportModal.Close();
  }
  public requestUpdateKey() {
    this.Axios.axios.post('/admin/workkey/').then((resp: any) => {
      const content = this.curLang === 'zh-cn' ? resp.infochinese : resp.info;
      const type = this.commonService.handleStatus(resp) === 0 ? 'success' : 'warn';
      this.myTip.alertInfo({ type, content, time: 5000});
      this.updateKeyModal.Close();
    });
  }

  // 下载根证书
  downloadCertificate() {
    this.Axios.axios.get(`/cert/ca_cert/`).then((resp: any) => {
      if (this.commonService.handleStatus(resp) === 0) {
        const content = new Blob([resp.data.content]);
        if (window.navigator.msSaveOrOpenBlob) {
          window.navigator.msSaveOrOpenBlob(content, 'ca.crt');
        } else {
          const link = document.createElement('a');
          link.href = URL.createObjectURL(content);
          link.setAttribute('style', 'visibility:hidden');
          link.download = 'ca.crt';
          document.body.appendChild(link);
          link.click();
        }
      }
    });
  }

  // 请求生成 CSR 文件
  public requestCsrFile() {
    const errors: ValidationErrors | null = TiValidators.check(this.csrConfForm);

    if (errors) {
      const firstError: any = Object.keys(errors)[0];
      this.elementRef.nativeElement.querySelector(`[formControlName=${firstError}]`)
          .focus();
      return;
    }
    const params = {
      country: this.csrConfForm.get('country').value,
      state: this.csrConfForm.get('province').value || '',
      locality: this.csrConfForm.get('city').value || '',
      organization: this.csrConfForm.get('company').value || '',
      organizational_unit: this.csrConfForm.get('dept').value || '',
      common_name: this.csrConfForm.get('commName').value || ''

    };
    this.Axios.axios.post(`/cert/csr/`, params).then((resp: any) => {
      if (this.commonService.handleStatus(resp) === 0) {
        const content = new Blob([resp.data.content]);
        if (window.navigator.msSaveOrOpenBlob) {
          window.navigator.msSaveOrOpenBlob(content, 'cert.csr');
        } else {
          const link = document.createElement('a');
          link.href = URL.createObjectURL(content);
          link.setAttribute('style', 'visibility:hidden');
          link.download = 'cert.csr';
          document.body.appendChild(link);
          link.click();
        }
      }
      this.csrConfigModal.Close();
      this.csrConfForm.reset();
    });
  }

  // 关闭 CSR文件弹框
  public closeCrsModal(e: any) {
    // 如果按下的不是鼠标左键 直接返回
    if (e.button !== 0) { return; }
    this.csrConfForm.reset();
    this.csrConfigModal.Close();
  }

  // 关闭 web服务端证书 弹框
  public closeImportModal() {
    this.certImportModal.Close();
  }

  public closeUpdateKeyModal() {
    this.updateKeyModal.Close();
  }

  private showCsrConfigModal() {
    this.csrConfigModal.Open();
    this.csrConfForm.reset();
  }
  private showImportModal() {
    this.importCert.errorTip = '';
    this.certImportModal.Open();
  }
  private showUpdateKeyModal() {
    this.updateKeyModal.Open();
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


}

export class CustomValidators {
  // 自定义校验规则
  public static country(i18n: any): ValidatorFn {
    const reg = new RegExp(/^[a-zA-Z]{2}$/);
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return { country: { tiErrorMessage: i18n.common_term_required_tip } };
      }
      return reg.test(control.value) === false
        ? { country: { tiErrorMessage: i18n.common_term_valition_country } }
        : null;
    };
  }

  public static city(i18n: any): ValidatorFn {
    const reg = /^[\w-\.\s]{0,128}$/;
    return (control: AbstractControl): ValidationErrors | null => {
      return reg.test(control.value) === false ? { city: { tiErrorMessage: i18n.common_term_valition_city } } : null;
    };
  }

  public static company(i18n: any): ValidatorFn {
    const reg = /^[\w-\.\s]{0,128}$/;
    return (control: AbstractControl): ValidationErrors | null => {
      return reg.test(control.value) === false
        ? { company: { tiErrorMessage: i18n.common_term_valition_company } }
        : null;
    };
  }
  public static commName(i18n: any): ValidatorFn {
    const reg = /^[\w-\.\s]{0,128}$/;
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return { commName: { tiErrorMessage: i18n.common_term_required_tip } };
      }
      return reg.test(control.value) === false
        ? { commName: { tiErrorMessage: i18n.common_term_valition_company } }
        : null;
    };
  }
}
