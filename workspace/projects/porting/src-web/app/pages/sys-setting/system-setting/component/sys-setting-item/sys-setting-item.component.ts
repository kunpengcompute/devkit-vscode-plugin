import { Component, EventEmitter, OnInit, Input, Output } from '@angular/core';
import {
  FormControl, FormGroup, ValidationErrors,
  ValidatorFn, AbstractControl,
} from '@angular/forms';
import { TiValidationConfig } from '@cloud/tiny3';
import { I18nService } from '../../../../../service';

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
    if (val) { this.sysConfForm.patchValue({ inputValue: val }); }
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
  public curLang = 'zh-cn';
  public mode: 'read' | 'write' = 'read';
  public sysConfForm: FormGroup;
  public validation: TiValidationConfig = {
    type: 'blur',
    errorMessage: {},
  };

  constructor(
    public i18nService: I18nService,
  ) {
    this.i18n = this.i18nService.I18n();
    this.curLang = sessionStorage.getItem('language');
  }

  ngOnInit() {
    this.sysConfForm = new FormGroup({
      inputValue: new FormControl(this.valueCopy, [this.inputValueValidator()])
    });
    this.sysConfForm.controls.inputValue.disable();
  }

  public onFixConfig() {
    this.mode = 'write';
    this.sysConfForm.controls.inputValue.enable();
  }

  public onCancel(evt: any) {
    // 如果按下的不是鼠标左键 直接返回
    if (evt.button !== 0) { return; }
    this.mode = 'read';
    this.sysConfForm.controls.inputValue.setValue(this.valueCopy);
    this.sysConfForm.controls.inputValue.disable();
    this.sysConfForm.clearValidators();
  }

  public onSubmit() {
    this.mode = 'read';
    this.sysConfForm.controls.inputValue.disable();
    this.confirm.emit(this.sysConfForm.controls.inputValue.value);
  }

  public inputValueValidator(): ValidatorFn {
    const reg = new RegExp(/^[+]{0,1}(\d+)$/);
    return (control: AbstractControl): ValidationErrors | null => {
      const tmpValue = control.value;
      if (tmpValue === '' || tmpValue == null) {
        return { inputValue: { tiErrorMessage: this.i18n.tip_msg.cannot_be_empty} };
      }
      const isNum = reg.test(tmpValue);
      if (isNum && (+tmpValue >= this.config.range[0] && +tmpValue <= this.config.range[1])) {
          return null;
      }
      const tiErrorMessage = this.i18nService.I18nReplace(
        this.i18n.tip_msg.valueErrorScope,
        {
          1: this.config.range[0],
          2: this.config.range[1]
        }
      );
      return { inputValue: { tiErrorMessage } };
    };
  }
}
