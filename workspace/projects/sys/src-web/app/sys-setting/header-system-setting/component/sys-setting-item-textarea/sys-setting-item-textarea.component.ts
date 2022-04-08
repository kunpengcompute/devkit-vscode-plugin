import { Component, EventEmitter, OnInit, Input, Output, ViewChild } from '@angular/core';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import {
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  AbstractControl,
} from '@angular/forms';
import { TiValidationConfig, TiModalService } from '@cloud/tiny3';
import { MessageModalService } from 'projects/sys/src-web/app/service/message-modal.service';

@Component({
  selector: 'app-sys-setting-item-textarea',
  templateUrl: './sys-setting-item-textarea.component.html',
  styleUrls: ['./sys-setting-item-textarea.component.scss']
})
export class SysSettingItemTextareaComponent implements OnInit {

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
    label: string
  };

  @Output() confirm = new EventEmitter<any>();

  @ViewChild('setAppPathModalComponent') setAppPathModalComponent: any;

  public isAdmin = sessionStorage.getItem('role') === 'Admin';
  public mode: 'read' | 'write' = 'read';
  public i18n: any;
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
    public tiMessage: MessageModalService,
    private tiModal: TiModalService,
  ) {
    this.i18n = this.i18nService.I18n();
  }

  ngOnInit() {
    this.sysConfForm.get('inputValue').valueChanges.subscribe(val => {
      if (val.indexOf('./') >= 0 || val.indexOf('../') >= 0) { // 相对路径转换成绝对路径
          this.pathNormalize(val);
      }
    });
    this.sysConfForm.controls.inputValue.disable();
    this.language = sessionStorage.getItem('language');
  }

  public onFixConfig(evt: any) {
    this.tiModal.open(this.setAppPathModalComponent, {
      id: 'setAppPathModal', // 定义id防止同一页面出现多个相同弹框
      modalClass: 'custemModal setAppPathModal',
      context: {
        confirm: (context: any) => {  // 点击确定
          this.mode = 'write';
          this.sysConfForm.controls.inputValue.enable();
          context.dismiss();
        },
      },
    });
  }

  public onCancel(evt: any) {
    evt.preventDefault();
    this.mode = 'read';
    this.sysConfForm.controls.inputValue.setValue(this.value);
    this.sysConfForm.controls.inputValue.disable();
    this.sysConfForm.clearValidators();
  }

  public onSubmit(evt: any) {
    this.mode = 'read';
    this.sysConfForm.controls.inputValue.disable();
    this.confirm.emit(this.sysConfForm.controls.inputValue.value);
  }

  private inputValueValidator(i18n: any): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const tmpValue: string = control.value;
      const emptyJudge = { inputValue: { tiErrorMessage: i18n.tip_msg.system_setting_input_empty_judge } };
      const formatJudge = { inputValue: { tiErrorMessage: i18n.tip_msg.system_setting_input_format_judge } };
      const repetitionJudge = { inputValue: { tiErrorMessage: i18n.tip_msg.system_setting_input_repeat_judge } };

      // 为空判断
      if (tmpValue === '' || tmpValue == null) {
        return emptyJudge;
      }

      // 逐项判断
      const itemList = tmpValue.split(';');
      for (let i = 0; i < itemList.length; i++) {
        const item = itemList[i];
        // 匹配规则简述：1、前后必有 /; 2、不含字符：^ ` / | ; & $ > < \ ! 任何空白字符; 3、不能出现：//
        const pathReg: RegExp = /^\/([^\/`|;&$><\\!\s]+\/)+$/;

        if (item === '') {
          return formatJudge;
        }

        if (!pathReg.test(item)) {
          return formatJudge;
        }

        if (itemList.lastIndexOf(item) !== i) {
          return repetitionJudge;
        }
      }
      return null;
    };
  }
  private pathNormalize(value: any) {
    const path: string[] = [];
    value.split(';').forEach((item: any) => {
      const output: any[] = [];
      item.replace(/^(\.\.?(\/|$))+/, '')
          .replace(/\/(\.(\/|$))+/g, '/')
          .replace(/\/\.\.$/, '/../')
          .replace(/\/?[^\/]*/g, (p: any) => {
              if (p === '/..') {
                  output.pop();
              } else {
                  output.push(p);
              }
          });
      path.push(output.join('').replace(/^\//, item.charAt(0) === '/' ? '/' : ''));
    });
    this.sysConfForm.controls.inputValue.setValue(path.join(';'));
  }
}
