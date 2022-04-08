import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormControl, FormGroup, ValidationErrors, ValidatorFn, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { MytipService } from '../../service/mytip.service';
import { TiTableColumns, TiTableSrcData, TiValidators, TiValidationConfig, TiFileItem,
   TiMessageService, TiFilter, TiActionmenuItem, TiModalService, TiTableRowData } from '@cloud/tiny3';
import { AxiosService } from '../../service/axios.service';
import { I18nService } from '../../service/i18n.service';

@Component({
  selector: 'app-webcertficate',
  templateUrl: './header-webCertFicate.component.html',
  styleUrls: ['./header-webCertFicate.component.scss']
})
export class WebcertficateComponent implements OnInit {
  public role = sessionStorage.getItem('role');
  public i18n: any;
  public validation: TiValidationConfig = {
    type: 'blur',
    errorMessage: {}
  };

  // Web服务端证书列表
  private statusList: string[] = [];
  public certList = {
    displayed: ([] as Array<TiTableRowData>),
    columns: ([] as Array<TiTableColumns>),
    srcData: ({
      data: [],
      state: {
        searched: true,
        sorted: false,
        paginated: true,
      }
    } as TiTableSrcData),
    operateList: ([] as Array<TiActionmenuItem>),
  };

  // 生成CSR文弹框
  @ViewChild('createCsrFileModalComponent') createCsrFileModalComponent: ElementRef;
  public csrFormGroup: FormGroup;

  // 导入证书弹框
  @ViewChild('importCertModalComponent') importCertModalComponent: ElementRef;
  public importCertFormGroup: FormGroup;
  public filters: Array<TiFilter> = [{  // maxCount定义为1时，代表单文件上传
    name: 'maxCount',
    params: [1]
  }];
  public header = {
    Authorization: sessionStorage.getItem('token'),
    'Accept-Language': sessionStorage.getItem('language') || 'zh-cn'
  };

  constructor(
    public mytip: MytipService,
    public i18nService: I18nService,
    public Axios: AxiosService,
    public router: Router,
    public timessage: TiMessageService,
    private tiModal: TiModalService,
  ) {
    this.i18n = this.i18nService.I18n();
    this.validation.errorMessage.required = this.i18n.validata.req;
    this.statusList = [this.i18n.certificate.valid, this.i18n.certificate.nearFailure, this.i18n.certificate.failure];
  }
  public isLoading: any = false;
  public disabledTimeout = 20000;
  ngOnInit() {
    this.initCertList();
    this.getCertifigcate();

    this.initCsrFormGroup();

    this.initImportCertFormGroup();

    // 重启服务之后延时禁止再次点击重启
    const time =  new Date().getTime();
    const oldTime = Number(sessionStorage.getItem('disableRestartWebCert'));
    if (time - oldTime <= this.disabledTimeout){
      this.certList.operateList[3].disabled = true;
      setTimeout(() => {
        this.certList.operateList[3].disabled = false;
      }, this.disabledTimeout - (time - oldTime));
    }
  }

  /** 验证证书是否有快到期或已经到期的 */
  private certificates(certList: any[]): void {
    const { certStatus, expireDate } = certList[0];
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
  }


  // -- Web服务端证书列表 --
  /** 初始化Web服务端证书列表 */
  private initCertList() {
    this.certList.columns = [
      { title: this.i18n.certificate.name, width: '25%' },
      { title: this.i18n.certificate.validTime, width: '25%' },
      { title: this.i18n.certificate.status, width: '20%' },
    ];
    if (this.role === 'Admin') {
      this.certList.columns.push({ title: this.i18n.common_term_operate, width: '30%' });
    }

    this.certList.operateList = [
      {
        label: this.i18n.certificate.createCsr,
        click: () => this.openCreateCsrFileModal(),
      }, {
        label: this.i18n.certificate.leadCsr,
        click: () => this.openImportCertModal(),
      }, {
        label: this.i18n.certificate.changeCipher,
        click: () => this.changeSecret(),
      }, {
        label: this.i18n.certificate.resetServer,
        click: () => this.serverReast(),
        disabled : false,
      },
    ];
  }

  /** 更换工作秘钥 */
  private changeSecret(): void {
    this.isLoading = true;
    this.Axios.axios.put('/work-keys/', null, { headers: { showLoading: false } }).then((res: any) => {
      this.isLoading = false;
      this.mytip.alertInfo({
        type: 'success',
        content: res.message,
        time: 3500
      });
    }).catch(() => {
      this.isLoading = false;
    });
  }

  /** 重启服务 */
  private serverReast(): void {
    const time =  new Date().getTime();
    const oldTime = Number(sessionStorage.getItem('disableRestartWebCert'));
    if (time - oldTime <= this.disabledTimeout){
      return;
    }
    this.certList.operateList[3].disabled = true;
    setTimeout(() => {
      this.certList.operateList[3].disabled = false;
    }, this.disabledTimeout);
    sessionStorage.setItem('disableRestartWebCert', time.toString());
    this.mytip.alertInfo({
      type: 'success',
      content: this.i18n.certificate.common_term_webcert_restart_tip,
      time: 3500
    });

    this.Axios.axios.get('/certificates/cert_active/', {
      headers: {
        showLoading: false,
      },
    });
  }

  /** 获取服务端证书列表 */
  private getCertifigcate() {
    this.isLoading = true;
    this.Axios.axios.get('/certificates/', { headers: { showLoading: false } }).then((res: any) => {
      this.isLoading = false;
      this.certificates(res.data);

      this.certList.srcData.data = res.data.map((item: any) => {
        return {
          name: item.certName,
          validTime: item.expireDate,
          certStatus: +item.certStatus,
          status: this.statusList[item.certStatus],
        };
      });
    }).catch(() => {
      this.isLoading = false;
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


  // -- 生成CSR文件弹框 --
  /** 初始化 csrFormGroup */
  private initCsrFormGroup() {
    this.csrFormGroup = new FormGroup({
      country: new FormControl('', [ServerValidators.country(this.i18n)]),
      province: new FormControl('', [ServerValidators.province(this.i18n)]),
      city: new FormControl('', [ServerValidators.city(this.i18n)]),
      organization: new FormControl('', [ServerValidators.organization(this.i18n)]),
      department: new FormControl('', [ServerValidators.department(this.i18n)]),
      commonName: new FormControl('', [ServerValidators.commonName(this.i18n)]),
    });
  }

  /** 打开生成CSR文件的弹框 */
  private openCreateCsrFileModal() {
    this.csrFormGroup.reset({});

    this.tiModal.open(this.createCsrFileModalComponent, {
      id: 'createCsrFileModal', // 定义id防止同一页面出现多个相同弹框
      modalClass: 'createCsrFileModal custemModal modalWidth560',
      context: {
        interfacing: false, // 调用接口中需要禁用掉按钮，防止点两次
        confirm: (context: any) => { // 点击确定
          const values = this.csrFormGroup.getRawValue();
          const params = {
            country: values.country,
            province: values.province || '',
            city: values.city || '',
            organization: values.organization || '',
            department: values.department || '',
            commonName: values.commonName,
          };

          this.Axios.axios.post('/certificates/', params).then((data: any) => {
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
            context.close();
          }).catch((error: any) => {});
        },
      },
    });
  }


  // -- 导入证书弹框 --
  /** 初始化 importCertFormGroup */
  private initImportCertFormGroup() {
    this.importCertFormGroup = new FormGroup({
      csrFile: new FormControl('', [TiValidators.required]),
    });
  }

  /** 打开导入证书的弹框 */
  private openImportCertModal() {
    this.importCertFormGroup.reset({});
    this.importCertFormGroup.controls.csrFile.disable();

    this.tiModal.open(this.importCertModalComponent, {
      id: 'importCertModal', // 定义id防止同一页面出现多个相同弹框
      modalClass: 'importCertModal custemModal modalWidth560',
      context: {
        interfacing: false, // 调用接口中需要禁用掉按钮，防止点两次
      },
    });
  }

  /** 文件添加成功回调 */
  public onAddItemSuccess(fileItem: TiFileItem): void {
    this.importCertFormGroup.get('csrFile').setValue(fileItem.file.name);
    this.importCertFormGroup.controls.csrFile.enable();
  }

  /** 上传文件前回调，可在该回调中动态设置formData */
  public onBeforeSendItems(fileItems: Array<TiFileItem>): void {
    // 上传前添加formData
    fileItems.forEach((item: TiFileItem) => {
      item.formData = {
        tinyFormdata: 'aa'
      };
    });
  }

  /** 文件上传成功回调 */
  public onSuccessItems($event: any, context: any): void {
    context.dismiss();

    this.mytip.alertInfo({
      type: 'success',
      content: this.i18n.certificate.common_term_webcert_import_success,
      time: 3500
    });
  }

  /** 文件上传失败回调 */
  public onErrorItems($event: any): void {
    if ($event.status === 400) {
      this.mytip.alertInfo({
        type: 'warn',
        content: JSON.parse($event.response).message,
        time: 3500
      });
      this.importCertFormGroup.reset({});
      this.importCertFormGroup.controls.csrFile.disable();
    }
  }
}
 // 证书验证规则类
export class ServerValidators {
  // 自定义校验规则
  public static country(i18n: any): ValidatorFn {
    const reg = new RegExp(/^[a-zA-Z]{2}$/);
    return (control: AbstractControl): ValidationErrors | null => {
      if (reg.test(control.value) === false || !control.value) {
        return { country: { tiErrorMessage: i18n.certificate.country_Verification_Tips } };
      }

      return null;
    };
  }
  public static province(i18n: any): ValidatorFn {
    const reg = new RegExp(/^[\s.-_a-zA-Z0-9]{0,128}$/);
    return (control: AbstractControl): ValidationErrors | null => {
      if (reg.test(control.value) === false) {
        return { province: { tiErrorMessage: i18n.certificate.common_city_province_Verification_Tips} };
      }

      return null;
    };
  }
  public static city(i18n: any): ValidatorFn {
    const reg = new RegExp(/^[\s.-_a-zA-Z0-9]{0,128}$/);
    return (control: AbstractControl): ValidationErrors | null => {
      if (reg.test(control.value) === false ) {
        return { city: { tiErrorMessage: i18n.certificate.common_city_province_Verification_Tips } };
      }

      return null;
    };
  }
  public static organization(i18n: any): ValidatorFn {
    const reg = new RegExp(/^[\s.-_a-zA-Z0-9]{0,64}$/);
    return (control: AbstractControl): ValidationErrors | null => {
      if (reg.test(control.value) === false ) {
        return { organization: { tiErrorMessage: i18n.certificate.common_Verification_Tips } };
      }

      return null;
    };
  }
  public static department(i18n: any): ValidatorFn {
    const reg = new RegExp(/^[\s.-_a-zA-Z0-9]{0,64}$/);
    return (control: AbstractControl): ValidationErrors | null => {
      if (reg.test(control.value) === false ) {
        return { department: { tiErrorMessage: i18n.certificate.common_Verification_Tips } };
      }

      return null;
    };
  }
  public static commonName(i18n: any): ValidatorFn {
    const reg = new RegExp(/^[\s.-_a-zA-Z0-9]{0,64}$/);
    return (control: AbstractControl): ValidationErrors | null => {
      if (reg.test(control.value) === false || !control.value) {
        return { commonName: { tiErrorMessage: i18n.certificate.common_Verification_Tips } };
      }

      return null;
    };
  }
}
