import { Component, EventEmitter, OnInit, Input, Output } from '@angular/core';
import { I18nService } from 'projects/java/src-web/app/service/i18n.service';
import {
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  AbstractControl,
} from '@angular/forms';
import { TiValidationConfig } from '@cloud/tiny3';

@Component({
  selector: 'app-setting-item',
  templateUrl: './setting-item.component.html',
  styleUrls: ['./setting-item.component.scss']
})
export class SettingItemComponent implements OnInit {
  public valueCopy: number;
  @Input()
  set value(val) {
    this.valueCopy = val;
    this.sysConfForm.patchValue({ inputValue: val });
  }
  get value() {
    return this.valueCopy;
  }
  @Input() config: {
    label: string,
    range: Array<number>,
    text: string,
    value: number,
    type: string
  };
  @Input() butType: string;
  @Output() confirm = new EventEmitter<any>();

  public isAdmin = sessionStorage.getItem('role') === 'Admin';
  public i18n: any;
  public mode: 'read' | 'write' = 'read';
  public middleTable: any;
  public sysConfForm: any;
  public validation: TiValidationConfig = {
    type: 'blur',
    errorMessage: {},
  };

  public language: 'zh-cn' | 'en-us' | string;

  constructor(
    public i18nService: I18nService,
  ) {
    this.i18n = this.i18nService.I18n();
    this.sysConfForm = new FormGroup({
      inputValue: new FormControl(this.valueCopy, [this.inputValueValidator(this.i18nService.I18n())])
    });
  }

  ngOnInit() {
    this.sysConfForm.controls.inputValue.disable();
    this.language = sessionStorage.getItem('language');
    if (this.language === 'en-us') {
      this.middleTable = false;
    } else {
      this.middleTable = true;
    }
  }

  public onFixConfig(evt: any) {
    this.mode = 'write';
    this.sysConfForm.controls.inputValue.enable();
  }

  public onCancel(evt: any) {
    evt.preventDefault();
    this.mode = 'read';
    this.sysConfForm.controls.inputValue.setValue(this.valueCopy);
    this.sysConfForm.controls.inputValue.disable();
    this.sysConfForm.clearValidators();
  }

  public onSubmit(evt: any) {
    this.mode = 'read';
    this.sysConfForm.controls.inputValue.disable();
    this.confirm.emit(this.sysConfForm.controls.inputValue.value);
  }

  public inputValueValidator(i18n: any): ValidatorFn {
    const reg = new RegExp(
      /^[1-9]\d*$/
    );
    return (control: AbstractControl): any => {
      const tmpValue = control.value;
      if (tmpValue === '' || tmpValue == null) {
        return { inputValue: { tiErrorMessage: i18n.newHeader.nullNotice } };
      }
      const isNum = reg.test(tmpValue);
      if (isNum) {
        if (+tmpValue >= this.config.range[0] && +tmpValue <= this.config.range[1]) {
          if (this.config.label === this.i18n.newHeader.threshold.tips) {
            if (this.config.value < +tmpValue) {
              return { inputValue: { tiErrorMessage: i18n.newHeader.threshold.count } };
            }
          }
          if (this.config.label === this.i18n.newHeader.threshold.warn) {
            if (this.config.value > +tmpValue) {
              return { inputValue: { tiErrorMessage: i18n.newHeader.threshold.count } };
            }
          }
          if (this.config.type === 'threadDump') {
            if (this.config.value < +tmpValue) {
              return { inputValue: { tiErrorMessage: i18n.newHeader.threshold.heapdumpMaxCount } };
            }
          }
          if (this.config.text === this.i18n.newHeader.offlineReport.threadDump.histReportMaxText) {
            if (this.config.value > +tmpValue) {
              return { inputValue: { tiErrorMessage: i18n.newHeader.threshold.heapdumpMaxCount } };
            }
          }
          if (this.config.type === 'heapDump') {
            if (this.config.value < +tmpValue) {
              return { inputValue: { tiErrorMessage: i18n.newHeader.threshold.heapdumpMaxCount } };
            }
          }
          if (this.config.text === this.i18n.newHeader.offlineReport.heapDump.histReportMaxText) {
            if (this.config.value > +tmpValue) {
              return { inputValue: { tiErrorMessage: i18n.newHeader.threshold.heapdumpMaxCount } };
            }
          }
          if (this.config.type === 'gcLogs') {
            if (this.config.value < +tmpValue) {
              return { inputValue: { tiErrorMessage: i18n.newHeader.threshold.heapdumpMaxCount } };
            }
          }
          if (this.config.text === this.i18n.newHeader.offlineReport.GCLogs.histReportMaxText) {
            if (this.config.value > +tmpValue) {
              return { inputValue: { tiErrorMessage: i18n.newHeader.threshold.heapdumpMaxCount } };
            }
          }
        } else {
          return { inputValue: { tiErrorMessage: i18n.newHeader.errNotice } };
        }
      } else {
        return { inputValue: { tiErrorMessage: i18n.newHeader.onlyDigits } };
      }
    };
  }

}
