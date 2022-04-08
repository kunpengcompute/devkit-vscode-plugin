import { Component, Input, forwardRef } from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  NG_VALIDATORS,
  FormControl,
} from '@angular/forms';
import { HyTheme, HyThemeService } from 'hyper';
import { Observable } from 'rxjs';
import { I18n } from 'sys/locale';
import { DiagnoseFunc } from '../../domain';

@Component({
  selector: 'app-check-box-control',
  templateUrl: './check-box-control.component.html',
  styleUrls: ['./check-box-control.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckBoxControlComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => CheckBoxControlComponent),
      multi: true,
    },
  ],
})
export class CheckBoxControlComponent implements ControlValueAccessor {
  @Input()
  set functions(funcs: DiagnoseFunc[]) {
    this.functionsStash = funcs ?? [];
    this.updateOptionObj(this.optionObj, funcs);
  }
  get functions(): DiagnoseFunc[] {
    return this.functionsStash;
  }

  i18n = I18n;
  optionObj = {
    dialingTest: {
      checked: true,
      disabled: true,
    },
    packetLoss: {
      checked: false,
      disabled: false,
    },
  };
  // 诊断功能选择项
  optionLabel = {
    dialingTest: I18n.network_diagnositic.taskParams.network_dial_test,
    packetLoss: I18n.network_diagnositic.taskParams.packet_loss,
    netCaught: I18n.network_diagnositic.taskParams.network_capture,
    load: I18n.network_diagnositic.taskParams.network_load,
  };
  DiagnoseFuncEnum = DiagnoseFunc;
  theme$: Observable<HyTheme>;
  select = DiagnoseFunc.DialingTest;
  currLang: string;

  private functionsStash: DiagnoseFunc[] = [];

  private propagateChange = (_: any) => {};
  private propagateTunched = (_: any) => {};

  constructor(private themeServe: HyThemeService) {
    this.theme$ = this.themeServe.getObservable();
    this.currLang = sessionStorage.getItem('language');
  }

  onSelect(str: DiagnoseFunc) {
    if (this.functions.includes(str)) {
      const sum = this.functions.indexOf(str);
      this.functions.splice(sum, 1);
    } else {
      this.functions.push(str);
    }

    // 处理网络拨测和丢包诊断的禁用
    this.updateOptionObj(this.optionObj, this.functions);

    this.propagateChange(this.functions);
  }

  writeValue(val: any) {
    if (null == val) {
      return;
    }

    this.functions = val || [];
  }

  registerOnChange(fn: any) {
    this.propagateChange = fn;
  }

  validate(ctl: FormControl) {
    return true;
  }

  registerOnTouched(fn: any) {
    this.propagateTunched = fn;
  }

  private updateOptionObj(optionObj: any, functions: DiagnoseFunc[]) {
    // 处理网络拨测和丢包诊断的禁用
    if (
      functions.includes(DiagnoseFunc.DialingTest) &&
      functions.includes(DiagnoseFunc.PacketLoss)
    ) {
      optionObj.dialingTest.disabled = false;
      optionObj.packetLoss.disabled = false;
      optionObj.dialingTest.checked = true;
      optionObj.packetLoss.checked = true;
    } else {
      optionObj.dialingTest.disabled = functions.includes(
        DiagnoseFunc.DialingTest
      );
      optionObj.dialingTest.checked = functions.includes(
        DiagnoseFunc.DialingTest
      );
      optionObj.packetLoss.disabled = functions.includes(
        DiagnoseFunc.PacketLoss
      );
      optionObj.packetLoss.checked = functions.includes(
        DiagnoseFunc.PacketLoss
      );
    }
  }
}
