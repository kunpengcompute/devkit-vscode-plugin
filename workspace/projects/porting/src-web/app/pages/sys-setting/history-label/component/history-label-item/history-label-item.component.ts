import { Component, EventEmitter, OnInit, Input, Output } from '@angular/core';
import {
  FormControl, FormGroup, ValidationErrors,
  ValidatorFn, AbstractControl,
} from '@angular/forms';
import { I18nService, AxiosService } from '../../../../../service';
import { TiValidationConfig } from '@cloud/tiny3';

@Component({
  selector: 'app-history-label-item',
  templateUrl: './history-label-item.component.html',
  styleUrls: ['./history-label-item.component.scss']
})
export class HistoryLabelItemComponent implements OnInit {

  public valueCopy: Array<number>;
  @Input() value: Array<number>;
  @Input() config: [{
    label: string,
    range: Array<number>,
    msg?: string
  }, {
    label: string,
    range: Array<number>,
    msg?: string
  }];
  @Output() confirm = new EventEmitter<any>();

  public isAdmin = sessionStorage.getItem('role') === 'Admin';
  public i18n: any;
  public currLang: string;

  public mode: 'read' | 'write' = 'read';
  public sysConfForm: FormGroup;
  public validation: TiValidationConfig = {
    type: 'blur',
    errorMessage: {},
  };

  constructor(
    public i18nService: I18nService,
    public Axios: AxiosService,
  ) {
    this.i18n = this.i18nService.I18n();
    this.currLang = sessionStorage.getItem('language');
  }

  ngOnInit() {
    this.sysConfForm = new FormGroup({
      inputValue: new FormControl('', [this.inputValueValidator()]),
      inputValue2: new FormControl('', [this.inputValueValidator2()])
    });
    this.sysConfForm.controls.inputValue.setValue(this.value[0]);
    this.sysConfForm.controls.inputValue2.setValue(this.value[1]);
    this.sysConfForm.controls.inputValue.disable();
    this.sysConfForm.controls.inputValue2.disable();
  }
  public onFixConfig() {
    this.mode = 'write';
    this.sysConfForm.controls.inputValue.enable();
    this.sysConfForm.controls.inputValue2.enable();
  }

  public onCancel(evt: any) {
    // 如果按下的不是鼠标左键 直接返回
    if (evt.button !== 0) { return; }
    this.mode = 'read';
    this.sysConfForm.controls.inputValue.setValue(this.value[0]);
    this.sysConfForm.controls.inputValue2.setValue(this.value[1]);
    this.sysConfForm.controls.inputValue.disable();
    this.sysConfForm.controls.inputValue2.disable();
    this.sysConfForm.clearValidators();
  }

  public onSubmit() {
    this.mode = 'read';
    this.sysConfForm.controls.inputValue.disable();
    this.sysConfForm.controls.inputValue2.disable();
    this.confirm.emit(
      [ Number(this.sysConfForm.controls.inputValue.value), Number(this.sysConfForm.controls.inputValue2.value)]);
  }

  public inputValueValidator(): ValidatorFn {
    const reg = new RegExp(
      /^[+]{0,1}(\d+)$/
    );
    return (control: AbstractControl): ValidationErrors | null => {
      const tmpValue = control.value;
      if (tmpValue === '' || tmpValue == null) {
        return { inputValue: { tiErrorMessage: this.i18n.tip_msg.cannot_be_empty} };
      }
      const isNum = reg.test(tmpValue);
      if (isNum && (+tmpValue >= this.config[0].range[0] && +tmpValue <= this.config[0].range[1])) {
          return null;
      }
      const tiErrorMessage = this.i18n.commom_term_min_err;
      return { inputValue: { tiErrorMessage } };
    };
  }
  public inputValueValidator2(): ValidatorFn {
    const reg = new RegExp(
      /^[+]{0,1}(\d+)$/
    );
    return (control: AbstractControl): ValidationErrors | null => {
      const tmpValue = control.value;
      if (tmpValue === '' || tmpValue == null) {
        return { inputValue: { tiErrorMessage: this.i18n.tip_msg.cannot_be_empty} };
      }
      const isNum = reg.test(tmpValue);
      if (isNum && (+tmpValue >= this.config[1].range[0] && +tmpValue <= this.config[1].range[1])) {
        return null;
      }
      const tiErrorMessage = this.i18n.commom_term_max_err;
      return { inputValue: { tiErrorMessage } };
    };
  }

}
