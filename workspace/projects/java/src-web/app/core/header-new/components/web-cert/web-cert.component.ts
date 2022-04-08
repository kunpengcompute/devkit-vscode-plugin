import { Component, OnInit, ViewChild } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ValidatorFn,
  AbstractControl
} from '@angular/forms';
import { Router } from '@angular/router';
import { MytipService } from 'projects/java/src-web/app/service/mytip.service';
import {
  TiTableColumns, TiTableSrcData, TiValidators,
  TiValidationConfig, TiFileItem, TiMessageService, TiFilter
} from '@cloud/tiny3';
import { AxiosService } from 'projects/java/src-web/app/service/axios.service';
import { I18nService } from 'projects/java/src-web/app/service/i18n.service';
@Component({
  selector: 'app-web-cert',
  templateUrl: './web-cert.component.html',
  styleUrls: ['./web-cert.component.scss']
})
export class WebCertComponent implements OnInit {
  public tip1Context: any = {
    label: ''
  };
  // maxCount定义为1时，代表单文件上传
  filters: Array<TiFilter> = [{
    name: 'maxCount',
    params: [1]
  }];
  public url = '../user-management/api/v2.2/certificates/';
  public header = {
    Authorization: sessionStorage.getItem('token'),
    'Accept-Language': sessionStorage.getItem('language') || 'zh-cn'
  };
  public role = sessionStorage.getItem('role');
  public autoUpload = false;
  public csrFrom: FormGroup;
  public csrLeadFrom: FormGroup;
  public i18n: any;
  public displayed: any = [];
  public value = '';
  public moreShow = 'none';
  // Web服务端证书列表
  public srcData: TiTableSrcData;
  public columns: Array<TiTableColumns> = [];
  public statusList: any = [];
  public searchWords: Array<string> = [''];
  public label = {
    country: '',
    province: '',
    city: '',
    organization: '',
    department: '',
    commonName: '',
    csrFile: ''
  };
  public csrLeadList = {
    csrFile: '',
  };
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
  public hoverClose: any;
  constructor(
    public mytip: MytipService,
    public i18nService: I18nService,
    public Axios: AxiosService,
    public router: Router,
    public timessage: TiMessageService,
  ) {
    this.i18n = this.i18nService.I18n();
  }
  @ViewChild('csrModal') csrModal: any;
  @ViewChild('csrLeadModal') csrLeadModal: any;
  ngOnInit() {
    this.certificates();
    this.label = {
      country: this.i18n.certificate.country,
      province: this.i18n.certificate.province,
      city: this.i18n.certificate.city,
      organization: this.i18n.certificate.organization,
      department: this.i18n.certificate.department,
      commonName: this.i18n.certificate.commonName,
      csrFile: this.i18n.certificate.csrFile
    };
    this.validation.errorMessage.required = this.i18n.validata.req;
    this.csrFrom = new FormGroup({
      country: new FormControl('', [ServerValidators.country(this.i18n)]),
      province: new FormControl('', [ServerValidators.province(this.i18n)]),
      city: new FormControl('', [ServerValidators.city(this.i18n)]),
      organization: new FormControl('', [ServerValidators.organization(this.i18n)]),
      department: new FormControl('', [ServerValidators.department(this.i18n)]),
      commonName: new FormControl('', [ServerValidators.commonName(this.i18n)]),
    });
    this.csrLeadFrom = new FormGroup({
      csrFile: new FormControl('', [TiValidators.required]),
    });
    this.columns = [
      {
        title: this.i18n.certificate.name,
        width: '25%'
      },
      {
        title: this.i18n.certificate.validTime,
        width: '25%'
      },
      {
        title: this.i18n.certificate.status,
        width: '20%'
      },
      {
        title: this.i18n.certificate.operate,
        width: '30%'
      },
    ];
    if (this.role !== 'Admin') {
      this.columns.pop();
    }
    this.srcData = {
      data: [],
      state: {
        searched: true,
        sorted: false,
        paginated: true
      }
    };
    this.getCertifigcate();
    this.statusList = [this.i18n.certificate.valid, this.i18n.certificate.nearFailure, this.i18n.certificate.failure];
  }

  // 请求数据的方法
  public getCertifigcate() {
    const url = '/certificates/';
    this.Axios.axios.get(url, { baseURL: '../user-management/api/v2.2' }).then((res: any) => {
      this.srcData.data = res.data.map((item: any) => {
        const name = item.certName;
        const validTime = item.expireDate;
        const certStatus = +item.certStatus;
        const status = this.handelStatus(item.certStatus);
        return {
          name,
          validTime,
          certStatus,
          status
        };
      });
    });
  }

  // 状态小圆点
  public statusFormat(certStatus: any) {
    let iconColor = '';
    switch (certStatus) {
      case 0:
        iconColor = 'analyzing-icon';
        break;
      case 1:
        iconColor = 'stopping-icon';
        break;
      case 2:
        iconColor = 'failed-icon';
        break;
      default:
        break;
    }
    return iconColor;
  }
  // 根据状态显示文字
  public handelStatus(certStatus: any) {
    return this.statusList[certStatus];
  }

  // 根据接口返回JSON生成证书文件
  public confirm(form: any) {
    const params = {
      country: this.csrFrom.get('country').value,
      province: this.csrFrom.get('province').value || '',
      city: this.csrFrom.get('city').value || '',
      organization: this.csrFrom.get('organization').value || '',
      department: this.csrFrom.get('department').value || '',
      commonName: this.csrFrom.get('commonName').value || '',
    };
    this.Axios.axios.post('/certificates/', params, { baseURL: '../user-management/api/v2.2' })
      .then((data: any) => {
        this.csrModal.close();
        this.csrFrom.reset();
        const file = new Blob([data.data.certificate]);
        if (window.navigator.msSaveOrOpenBlob) {
          window.navigator.msSaveOrOpenBlob(file, 'server.csr');
        } else {
          const link = document.createElement('a');
          link.href = URL.createObjectURL(file);
          link.setAttribute('style', 'visibility:hidden');
          link.download = 'server.csr';
          document.body.appendChild(link);
          link.click();
        }
      })
      .catch((error: any) => {
      });
  }

  public cancle(type: any) {
    if (type === 'lead') {
      this.csrLeadFrom.reset();
      this.csrLeadModal.close();
    } else {
      this.csrFrom.reset();
      this.csrModal.close();
    }
  }

  public createCSR(type: any) {
    type === 'lead' ? this.csrLeadModal.open() : this.csrModal.open();
  }
  onAddItemSuccess(fileItem: TiFileItem): void {
    const that = this;
    that.csrLeadList.csrFile = fileItem.file.name;
    this.file = fileItem.file;
    const reader = new FileReader();
    reader.readAsDataURL(fileItem._file);
    reader.onload = (ev) => {
      // base64码
    };
  }

  onBeforeSendItems(fileItems: Array<TiFileItem>): void {
    // 上传前添加formData
    fileItems.forEach((item: TiFileItem) => {
      item.formData = {
        tinyFormdata: 'aa'
      };
    });
  }

  onAddItemFailed(fileItem: TiFileItem): void {
  }
  onSuccessItems($event: any): void {
    this.csrLeadModal.close();
    this.mytip.alertInfo({
      type: 'success',
      content: this.i18n.certificate.common_term_webcert_import_success, time: 3500
    });
  }
  onErrorItems($event: any): void {
    if ($event.status === 400) {
      this.mytip.alertInfo({ type: 'warn', content: JSON.parse($event.response).message, time: 3500 });
    }
  }
  // 重启服务
  public serverReast() {
    const url = '/certificates/cert_active/';
    this.mytip.alertInfo({
      type: 'success',
      content: this.i18n.certificate.common_term_webcert_restart_tip, time: 3500
    });
    this.Axios.axios.get(url, { baseURL: '../user-management/api/v2.2' }).then((res: any) => {
    });
  }

  public showMore(status: any) {
    if (status === 'none') {
      this.moreShow = 'block';
    } else {
      this.moreShow = 'none';
    }
  }

  public changeSecret() {
    const url = '/work-keys/';
    this.Axios.axios.put(url, {}, { baseURL: '../user-management/api/v2.2' }).then((res: any) => {
      this.mytip.alertInfo({ type: 'success', content: res.message, time: 3500 });
    });
  }

  // 验证证书是否有快到期或已经到期的
  public certificates(): void {
    this.Axios.axios.get('/certificates/', { baseURL: '../user-management/api/v2.2' }).then((res: any) => {
      const { certStatus, expireDate } = res.data[0];
      if (certStatus === '2') {
        this.timessage.open({
          type: 'warn',
          title: this.i18n.certificate.notice,
          content: this.i18n.certificate.webWarnNotice1,
          okButton: {
            text: this.i18n.common_term_operate_ok
          },
          cancelButton: {
            show: false
          }
        });
      } else if (certStatus === '1') {
        this.timessage.open({
          type: 'warn',
          title: this.i18n.certificate.notice,
          content: this.i18n.certificate.webWarnNotice2.toString().replace('${time}', expireDate),
          okButton: {
            text: this.i18n.common_term_operate_ok
          },
          cancelButton: {
            show: false
          }
        });
      }
    });
  }
  public onHoverClose(msg: any) {
    this.hoverClose = msg;
  }
}
// 证书验证规则类
export class ServerValidators {
  // 自定义校验规则
  public static country(i18n: any): ValidatorFn {
    const reg = new RegExp(/^[a-zA-Z]{2}$/);
    return (control: AbstractControl): any => {
      if (reg.test(control.value) === false || !control.value) {
        return { country: { tiErrorMessage: i18n.certificate.country_Verification_Tips } };
      }
    };
  }
  public static province(i18n: any): ValidatorFn {
    const reg = new RegExp(/^[\s.-_a-zA-Z0-9]{0,128}$/);
    return (control: AbstractControl): any => {
      if (reg.test(control.value) === false) {
        return { province: { tiErrorMessage: i18n.certificate.province_Verification_Tips } };
      }
    };
  }
  public static city(i18n: any): ValidatorFn {
    const reg = new RegExp(/^[\s.-_a-zA-Z0-9]{0,128}$/);
    return (control: AbstractControl): any => {
      if (reg.test(control.value) === false) {
        return { city: { tiErrorMessage: i18n.certificate.city_Verification_Tips } };
      }
    };
  }
  public static organization(i18n: any): ValidatorFn {
    const reg = new RegExp(/^[\s.-_a-zA-Z0-9]{0,128}$/);
    return (control: AbstractControl): any => {
      if (reg.test(control.value) === false) {
        return { organization: { tiErrorMessage: i18n.certificate.organization_Verification_Tips } };
      }
    };
  }
  public static department(i18n: any): ValidatorFn {
    const reg = new RegExp(/^[\s.-_a-zA-Z0-9]{0,128}$/);
    return (control: AbstractControl): any => {
      if (reg.test(control.value) === false) {
        return { department: { tiErrorMessage: i18n.certificate.department_Verification_Tips } };
      }
    };
  }
  public static commonName(i18n: any): ValidatorFn {
    const reg = new RegExp(/^[\s.-_a-zA-Z0-9]{0,128}$/);
    return (control: AbstractControl): any => {
      if (reg.test(control.value) === false || !control.value) {
        return { commonName: { tiErrorMessage: i18n.certificate.commonName_Verification_Tips } };
      }
    };
  }
}
