import { Component, EventEmitter, OnInit, Input, Output } from '@angular/core';
import { I18nService, AxiosService, CommonService } from '../../../../../service';

@Component({
  selector: 'app-sys-setting-item-select',
  templateUrl: './sys-setting-item-select.component.html',
  styleUrls: ['./sys-setting-item-select.component.scss']
})
export class SysSettingItemSelectComponent implements OnInit {
  @Input() value: {};
  @Input() config: {
    label: string,
    range: Array<number | {}>,
    inputMode: 'input' | 'select'
  };
  @Output() confirm = new EventEmitter<any>();

  public mode: 'read' | 'write' = 'read';
  public i18n: any;
  public curLang = 'zh-cn';
  constructor(
    public i18nService: I18nService,
    public Axios: AxiosService,
    private commonService: CommonService
  ) {
    this.i18n = this.i18nService.I18n();
  }

  ngOnInit() {
    this.curLang = sessionStorage.getItem('language');
  }

  public onFixConfig(evt: any) {
    this.mode = 'write';
  }

  public onCancel(evt: any) {
    if (evt.button !== 0) { return; }
    this.mode = 'read';
    if (this.config.label === this.i18n.common_term_CRL_config) { // 缺分日志级别还是吊销列表
      this.Axios.axios.get('/cert/crl/').then((data: any) => {
        if (this.commonService.handleStatus(data) === 0) {
          if (!data.data.crl_configuration) {
            this.value = { label: this.i18n.common_term_no, val: 0, inputMode: 'select' };
          } else {
            this.value = { label: this.i18n.common_term_yes, val: 1, inputMode: 'select' };
          }
        }
      });
    } else {
      this.Axios.axios.get('/users/1/loglevel/').then((data: any) => {
        if (this.commonService.handleStatus(data) === 0) {
          this.value = { label: data.data.level, val: data.data.level, inputMode: 'select' };
        }
      });
    }
  }

  public onSubmit() {
    this.mode = 'read';
    this.confirm.emit(this.value);
  }
}

