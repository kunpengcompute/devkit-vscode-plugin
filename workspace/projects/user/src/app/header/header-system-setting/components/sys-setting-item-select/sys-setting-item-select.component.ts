import { Component, EventEmitter, OnInit, Input, Output } from '@angular/core';
import { I18nService } from '../../../../service/i18n.service';
import {
  FormControl,
  FormGroup
} from '@angular/forms';

@Component({
  selector: 'app-sys-setting-item-select',
  templateUrl: './sys-setting-item-select.component.html',
  styleUrls: ['./sys-setting-item-select.component.scss']
})
export class SysSettingItemSelectComponent implements OnInit {
  public valueCopy: any = {};
  @Input()
  set value(val) {
    this.valueCopy = val;
    this.sysConfForm.patchValue({ selectedValue: val });
  }
  get value() {
    return this.valueCopy;
  }

  @Input() config: {
    label: string,
    range: Array<any>,
    tip: string
  };

  @Output() confirm = new EventEmitter<any>();

  public isAdmin = sessionStorage.getItem('role') === 'Admin';
  public tipWidth: any;
  public i18n: any;
  public mode: 'read' | 'write' = 'read';
  public sysConfForm = new FormGroup({
    selectedValue: new FormControl(this.valueCopy)
  });

  public language: 'zh-cn' | 'en-us' | string = sessionStorage.getItem('language'); // 语言环境

  constructor(
    public i18nService: I18nService,
  ) {
    this.i18n = this.i18nService.I18n();
    if (sessionStorage.getItem('language') === 'zh-cn') {
      this.tipWidth = '550px';
    } else {
      this.tipWidth = '650px';
    }
  }

  ngOnInit() {
    this.sysConfForm.controls.selectedValue.disable();
  }

  public onFixConfig() {
    this.mode = 'write';
    this.sysConfForm.controls.selectedValue.enable();
  }

  public onCancel() {
    this.mode = 'read';
    this.sysConfForm.controls.selectedValue.setValue(this.valueCopy);
    this.sysConfForm.controls.selectedValue.disable();
  }

  public onSubmit() {
    this.mode = 'read';
    this.sysConfForm.controls.selectedValue.disable();
    this.confirm.emit(this.sysConfForm.controls.selectedValue.value);
  }
}

