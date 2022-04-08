import {
  Component, EventEmitter, OnInit, Input, Output,
  ViewChild, SecurityContext
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import {
  FormControl, FormGroup, ValidationErrors,
  ValidatorFn, AbstractControl,
} from '@angular/forms';
import {
  I18nService, AxiosService, MytipService,
  CommonService
} from '../../../../../service';
import { TiFilter, TiFileItem, TiValidationConfig } from '@cloud/tiny3';
import { isMac } from '../../../../../utils';
import { ACCEPT_TYPE, ACCEPT_TYPE_IE } from '../../../../../global/url';
import { Status } from '../../../../../modules';

@Component({
  selector: 'app-software-port-temp-item',
  templateUrl: './software-port-temp-item.component.html',
  styleUrls: ['./software-port-temp-item.component.scss']
})
export class SoftwarePortTempItemComponent implements OnInit {
  public valueCopy: number;
  @Input()
  set value(val) {
    this.valueCopy = val;
    if (this.sysConfForm) {
      this.sysConfForm.patchValue({ inputValue: val });
    }
  }
  get value() {
    return this.valueCopy;
  }
  @Input() config: {
    label: string,
    btnTitle: string,
    option: number
  };
  @Output() confirm = new EventEmitter<any>();

  public isAdmin = sessionStorage.getItem('role') === 'Admin';
  public i18n: any;
  public mode: 'read' | 'write' = 'read';
  public sysConfForm: FormGroup;
  public validation: TiValidationConfig = {
    type: 'blur',
    errorMessage: {},
  };
  public accept: string; // 上传文件类型

  constructor(
    public i18nService: I18nService,
    private Axios: AxiosService,
    private mytip: MytipService,
    public saniTizer: DomSanitizer,
    public commonService: CommonService
  ) {
    this.i18n = this.i18nService.I18n();
  }
  @ViewChild('test', { static: false }) test: any;
  @ViewChild('deleteWhiteModal', { static: false }) deleteWhiteModal: any;
  public autoUpload = false;
  public canUpgrade = false; // 标识是否可以点击升级
  public uploadUrl = './api/portadv/solution/package/';
  public inputFieldWidth = '298px';
  public token: any;
  public headersConfig = {
    Authorization: '',
    filename: ''
  };
  filters: Array<TiFilter> = [
    {
      name: 'maxCount',
      params: [1]
    }
  ];
  ngOnInit() {
    this.accept = (isMac() || this.commonService.isIE11())
      ? ACCEPT_TYPE_IE.depDictionary
      : ACCEPT_TYPE.depDictionary;
    this.sysConfForm = new FormGroup({
      inputValue: new FormControl(this.valueCopy, [this.inputValueValidator()])
    });
    this.sysConfForm.controls.inputValue.disable();
    this.headersConfig.Authorization = sessionStorage.getItem('token');
  }
  onCompleteItems($event: any): void {
    // 根据状态码和返回消息设置详情信息
    const data = JSON.parse($event.response);
    this.canUpgrade = true;
    if (
      this.commonService.handleStatus(data) === 1
      || data.status === 2
      || data.status === Status.maximumTask
    ) {
      this.canUpgrade = false;
      this.test.uploadLan.successInfo = '';
      setTimeout(() => {
        $('#uploadId_white .ti3-aui-file-state-general').addClass('errorTip');
        this.addItemValidFailed(data, 'white');
      }, 10);
    } else {
      this.test.uploadLan.successInfo = sessionStorage.getItem('language') === 'zh-cn'
        ? data.infochinese
        : data.info;
    }
  }
  onBeforeSendItems(fileItems: Array<TiFileItem>): void {
    // 上传前动态添加formData
    this.headersConfig.filename = fileItems[0]._file.name;
    fileItems.forEach((item: TiFileItem) => {
      item.formData = {
        file: fileItems[0]._file
      };
    });
  }
  addItemSuccess(fileItems: TiFileItem): void {
    const fileName = fileItems._file.name;
    const size = fileItems._file.size;
    this.headersConfig.filename = fileName;
    this.Axios.axios.get(`/portadv/solution/package/status/?filename=${fileName}&filesize=${size}`)
    .then((resp: any) => {
      if (this.commonService.handleStatus(resp) === 0) {
        this.canUpgrade = false;
        const tipEl = $('#uploadId_white .ti3-aui-file-state-general');
        const uploadBtn = $('#uploadId_white .ti3-aui-upload-btn');
        const tipMsg = sessionStorage.getItem('language') === 'zh-cn' ? resp.infochinese : resp.info;
        const tipHtml = `<img style="vertical-align: middle;margin-right: 6px;width:16px"
        src="./assets/img/home/icon_success.png"><span>${this.saniTizer.sanitize(SecurityContext.HTML, tipMsg)}</span>`;
        tipEl.html(tipHtml);
        uploadBtn.removeAttr('disabled');
        return;
      } else if (resp.data && resp.data.status === 1) {
        this.deleteWhiteModal.type = 'prompt';
        this.deleteWhiteModal.alert_show();
        this.deleteWhiteModal.title = sessionStorage.getItem('language') === 'zh-cn'
          ? resp.infochinese
          : resp.info;
        return;
      }
      this.addItemValidFailed(resp, 'white');

    }, (error: any) => {
      const resp = error.response.data;
      if (this.commonService.handleStatus(resp) === 1) {
        this.canUpgrade = false;
        this.addItemValidFailed(resp, 'white');
      }
    });
  }

  public confirmHandle(flag: any) {
    if (flag) {
      this.Axios.axios.post(`/portadv/solution/package/status/`, {filename: this.headersConfig.filename})
      .then((resp: any) => {
        if (this.commonService.handleStatus(resp) === 0) {
          const tipEl = $('#uploadId_white .ti3-aui-file-state-general');
          const uploadBtn = $('#uploadId_white .ti3-aui-upload-btn');
          tipEl.html('');
          uploadBtn.removeAttr('disabled');
          return;
        }
        const content = sessionStorage.getItem('language') === 'zh-cn' ? resp.infochinese : resp.info;
        this.mytip.alertInfo({ type: 'warn', content, time: 10000 });
      });
      return;
    }
  }

  public addItemValidFailed(resp: any, type: any) {
    const id = '#uploadId_' + type;
    const tipMsg = sessionStorage.getItem('language') === 'zh-cn' ? resp.infochinese : resp.info;
    const tipEl = $(id + ' .ti3-aui-file-state-general');
    const tipContainer = $(id + ' .ti3-aui-file-state-general');
    const uploadBtn = $(id + ' .ti3-aui-upload-btn').eq(1);
    tipContainer.css('width', '400px');
    const tipHtml = `<img style="vertical-align: middle;margin-right: 6px;width:16px"
    src="./assets/img/home/icon_error.png"><span>${this.saniTizer.sanitize(SecurityContext.HTML, tipMsg)}</span>`;
    tipEl.html(tipHtml);
    uploadBtn.prop('disabled', 'true');
  }
  public onFixConfig(evt: any) {
    this.mode = 'write';
    this.sysConfForm.controls.inputValue.enable();
  }

  public onCancel(evt: any) {
    // 如果按下的不是鼠标左键 直接返回
    if (evt.button !== 0) { return; }
    this.mode = 'read';
    this.sysConfForm.controls.inputValue.setValue(this.valueCopy);
    this.sysConfForm.controls.inputValue.disable();
    this.sysConfForm.reset({label: ''});
    this.sysConfForm.clearValidators();
  }

  public onSubmit(evt: any) {
    this.mode = 'read';
    this.sysConfForm.controls.inputValue.disable();
    this.confirm.emit({option: this.config.option, password: this.sysConfForm.controls.inputValue.value});
    this.sysConfForm.reset({label: ''});
    this.sysConfForm.clearValidators();
  }

  public inputValueValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const tmpValue = control.value;
      if (tmpValue === '' || tmpValue == null) {
        return { inputValue: { tiErrorMessage: this.i18n.tip_msg.cannot_be_empty} };
      } else {
        return {};
      }
    };
  }

}
