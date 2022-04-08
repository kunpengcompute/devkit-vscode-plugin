import { Component, EventEmitter, OnInit, Input, Output } from '@angular/core';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import {
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  AbstractControl,
} from '@angular/forms';
import { TiValidationConfig } from '@cloud/tiny3';

@Component({
  selector: 'app-sys-setting-item',
  templateUrl: './sys-setting-item.component.html',
  styleUrls: ['./sys-setting-item.component.scss']
})
export class SysSettingItemComponent implements OnInit {
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
    range: Array<number>
  };
  @Output() confirm = new EventEmitter<any>();

  public isAdmin = sessionStorage.getItem('role') === 'Admin';
  public i18n: any;
  public mode: 'read' | 'write' = 'read';
  public sysConfForm = new FormGroup({
    inputValue: new FormControl(this.value, [this.inputValueValidator(this.i18nService.I18n())])
  });
  public validation: TiValidationConfig = {
    type: 'blur',
    errorMessage: {},
  };

  public language: 'zh-cn' | 'en-us' | string; // 语言环境

  constructor(
    public i18nService: I18nService,
  ) {
    this.i18n = this.i18nService.I18n();
  }

  ngOnInit() {
    this.sysConfForm.controls.inputValue.disable();
    this.language = sessionStorage.getItem('language');
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
    return (control: AbstractControl): ValidationErrors | null => {
      const tmpValue = control.value;
      if (tmpValue === '' || tmpValue == null) {
        return { inputValue: { tiErrorMessage: i18n.tip_msg.system_setting_input_empty_judge} };
      }
      const isNum = reg.test(tmpValue);
      if (isNum) {
        if (+tmpValue >= this.config.range[0] && +tmpValue <= this.config.range[1]) {
          return null;
        } else {
          return { inputValue: { tiErrorMessage: i18n.tip_msg.system_setting_input_vaild_value } };
        }
      } else {
        return { inputValue: { tiErrorMessage: i18n.tip_msg.system_setting_input_vaild_value } };
      }
    };
  }
}
