import { Component, EventEmitter, OnInit, Input, Output } from '@angular/core';
import {
  FormControl, FormGroup, ValidationErrors,
  ValidatorFn, AbstractControl,
} from '@angular/forms';
import { TiValidationConfig } from '@cloud/tiny3';
import { I18nService } from '../../../../../service';


@Component({
  selector: 'app-setting-label-item',
  templateUrl: './setting-label-item.component.html',
  styleUrls: ['./setting-label-item.component.scss']
})
export class SettingLabelItemComponent implements OnInit {

  // 这是commonConfigSel
  @Input() value: any  = {};
  @Input() config: {
    keepGoing: {
      label: string,
      range: [
        { label: string, value: number, inputMode: string},
        { label: string, value: number, inputMode: string}
      ],
      msg?: string
    },
    pMonthFlag: {
      label: string,
      range: [
        { label: string, value: number, inputMode: string},
        { label: string, value: number, inputMode: string}
      ],
      msg?: string
    },
  };

  // 这是commonConfigInput
  public valueCopy: string;
  @Input() valueInput: Array<string>;
  @Input() configInput: {
    cLine: {
      label: string
    },
    asmLine: {
      label: string
    },
    password: {
      label: string,
    }
};
  @Output() confirm = new EventEmitter<any>();

  public selKeepValue: any;
  public selpMouthValue: any;
  public mode: 'read' | 'write' = 'read';
  public i18n: any;
  public isAdmin = sessionStorage.getItem('role') === 'Admin';
  public sysConfForm: FormGroup;
  public pwdForm: FormGroup;
  public validation: TiValidationConfig = {
    type: 'blur',
    errorMessage: {},
  };
  constructor(
    public i18nService: I18nService,
  ) {
    this.i18n = this.i18nService.I18n();
  }

  public curLang: string;

  ngOnInit() {
    this.curLang = sessionStorage.getItem('language');
    this.selKeepValue = this.config.keepGoing.range.find(item => item.value === this.value[0].value);
    this.selpMouthValue = this.config.pMonthFlag.range.find(item => item.value === this.value[1].value);
    this.sysConfForm = new FormGroup({
      inputValue: new FormControl('', [InputValidators.inputValue(this.i18n)]),
      inputValue2: new FormControl('', [InputValidators.inputValue(this.i18n)]),
    });
    this.pwdForm = new FormGroup({
      inputValue: new FormControl('', [this.inputValueValidator()])
    });
    this.sysConfForm.controls.inputValue.setValue(this.valueInput[0]);
    this.sysConfForm.controls.inputValue2.setValue(this.valueInput[1]);
    this.pwdForm.controls.inputValue.setValue('');
    this.sysConfForm.controls.inputValue.disable();
    this.sysConfForm.controls.inputValue2.disable();
    this.pwdForm.controls.inputValue.disable();
  }

  public onFixConfig(evt: any) {
    this.mode = 'write';
    this.sysConfForm.controls.inputValue.enable();
    this.sysConfForm.controls.inputValue2.enable();
    this.pwdForm.controls.inputValue.enable();
  }

  public onCancel(evt: any) {
    // 如果按下的不是鼠标左键 直接返回
    if (evt.button !== 0) { return; }
    this.mode = 'read';
    this.sysConfForm.controls.inputValue.setValue(this.valueInput[0]);
    this.sysConfForm.controls.inputValue2.setValue(this.valueInput[1]);
    this.selKeepValue = this.config.keepGoing.range.find(item => item.value === this.value[0].value);
    this.selpMouthValue = this.config.pMonthFlag.range.find(item => item.value === this.value[1].value);
    this.pwdForm.controls.inputValue.setValue('');
    this.sysConfForm.controls.inputValue.disable();
    this.sysConfForm.controls.inputValue2.disable();
    this.pwdForm.controls.inputValue.disable();
    this.sysConfForm.clearValidators();
    this.pwdForm.clearValidators();
    this.pwdForm.reset({inputValue: ''});
  }

  public onSubmit() {
    this.mode = 'read';
    this.sysConfForm.controls.inputValue.disable();
    this.sysConfForm.controls.inputValue2.disable();
    this.pwdForm.controls.inputValue.disable();
    this.confirm.emit([
      this.sysConfForm.controls.inputValue.value,
      this.sysConfForm.controls.inputValue2.value,
      this.selKeepValue.value, this.selpMouthValue.value,
      this.pwdForm.controls.inputValue.value
    ]);
    this.pwdForm.reset({inputValue: ''});
  }

  public inputValueValidator(): ValidatorFn {
    const reg = new RegExp(
      /^[+]{0,1}(\d+)$/
    );
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

export class InputValidators {
  // 自定义校验规则
  public static inputValue(i18n: any): ValidatorFn {
    const reg = new RegExp(/^[1-9]\d{0,4}$/);
    return (control: AbstractControl): ValidationErrors | null => {
      return reg.test(control.value) === false
        ? { pwd: { tiErrorMessage: i18n.common_term_config_valid } }
        : null;
    };
  }
}
