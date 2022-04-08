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
  selector: 'app-limit-item',
  templateUrl: './limit-item.component.html',
  styleUrls: ['./limit-item.component.scss']
})
export class LimitItemComponent implements OnInit {
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
  @Input() setMargin: string;
  @Output() confirm = new EventEmitter<any>();
  @Output() restore = new EventEmitter<any>();

  public isAdmin = sessionStorage.getItem('role') === 'Admin';
  public i18n: any;
  public mode: 'read' | 'write' = 'read';
  public sysConfForm: any;
  public validation: TiValidationConfig = {
    type: 'blur',
    errorMessage: {},
  };

  public language: 'zh-cn' | 'en-us' | string;
  public isLegal: boolean;

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

  public restoreDefault(evt: any) {
    this.mode = 'read';
    this.sysConfForm.controls.inputValue.disable();
    this.restore.emit(this.sysConfForm.controls.inputValue.value);
  }

  public inputValueValidator(i18n: any): ValidatorFn {
    const reg = new RegExp(
      /^[1-9]\d*$/
    );
    return (control: AbstractControl): ValidationErrors | null => {
      const tmpValue = control.value;
      if (tmpValue === '' || tmpValue == null) {
        this.isLegal = false;
        return { inputValue: { tiErrorMessage: i18n.newHeader.nullNotice } };
      }
      const isNum = reg.test(tmpValue);
      if (isNum) {
        if (+tmpValue >= this.config.range[0] && +tmpValue <= this.config.range[1]) {
          this.isLegal = true;
          return null;
        } else {
          this.isLegal = false;
          return { inputValue: { tiErrorMessage: i18n.newHeader.errNotice } };
        }
      } else {
        this.isLegal = false;
        return { inputValue: { tiErrorMessage: i18n.newHeader.onlyDigits } };
      }
    };
  }

  public onBlurFun(evt: any) {
    if (!this.isLegal) {
      this.onCancel(evt);
    }
  }
}
