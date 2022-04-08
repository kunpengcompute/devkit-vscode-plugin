import { Component, Input, forwardRef, Output } from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  NG_VALIDATORS,
  FormGroup,
  FormControl,
} from '@angular/forms';
import { TiValidators } from '@cloud/tiny3';
import { TcpDialTestForm } from '../../domain';
import { HyTheme, HyThemeService } from 'hyper';
import { Observable } from 'rxjs';

enum DialLimitType {
  Duration,
  MsgLen,
  BlockCount,
}

enum MsgLenUnit {
  K = 'K',
  M = 'M',
}

type DialLimitVal = TcpDialTestForm['dialLimitVal'];

@Component({
  selector: 'app-dial-test-limit',
  templateUrl: './dial-test-limit.component.html',
  styleUrls: ['./dial-test-limit.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DialTestLimitComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => DialTestLimitComponent),
      multi: true,
    },
  ],
})
export class DialTestLimitComponent implements ControlValueAccessor {
  @Input()
  set dialLimit(val: DialLimitVal) {
    if (null == val) {
      return;
    }
    this.enableFgByRawValue(val, this.formGroup);
    this.formGroup.patchValue(val);
  }

  formGroup: FormGroup;
  dialLimitTypeEnum = DialLimitType;
  unitList = [
    { label: 'KB', unit: MsgLenUnit.K, max: 1024 * 1024, min: 1 },
    { label: 'MB', unit: MsgLenUnit.M, max: 1024, min: 1 },
  ];
  currMsgLenUnit: MsgLenUnit = MsgLenUnit.K;
  msgLenUnitEnum = MsgLenUnit;
  theme$: Observable<HyTheme>;

  private propagateChange = (_: any) => {};
  private propagateTunched = (_: any) => {};

  constructor(private themeService: HyThemeService) {
    this.theme$ = this.themeService.getObservable();

    this.formGroup = this.initFormGroup();

    this.formGroup.valueChanges.subscribe((val) => {
      this.propagateChange({
        duration: val.duration,
        msgLen: val.msgLen,
        blockCount: val.blockCount,
      });
    });
    this.formGroup.get('limitType').valueChanges.subscribe((val) => {
      this.enableFgByLimitType(val);
    });
  }

  writeValue(val: DialLimitVal) {
    this.dialLimit = val;
  }

  registerOnChange(fn: any) {
    this.propagateChange = fn;
  }

  validate(ctl: FormControl) {
    return this.formGroup?.valid ? null : { dialTestLimit: { valid: false } };
  }

  registerOnTouched(fn: any) {
    this.propagateTunched = fn;
  }

  onMsgLenUnitSelect(value: MsgLenUnit) {
    this.currMsgLenUnit = value;
  }

  private initFormGroup(): FormGroup {
    const form = new FormGroup({
      limitType: new FormControl(DialLimitType.Duration),
      duration: new FormControl(10, [
        TiValidators.minValue(1),
        TiValidators.maxValue(60),
      ]),
      msgLen: new FormControl(),
      blockCount: new FormControl(null, [
        TiValidators.minValue(1),
        TiValidators.maxValue(10000),
      ]),
    });
    form.get('msgLen').disable();
    form.get('blockCount').disable();
    return form;
  }

  private enableFgByLimitType(val: DialLimitType) {
    switch (val) {
      case DialLimitType.Duration:
        // 拨测时长
        this.formGroup.get('duration').enable();
        this.formGroup.get('msgLen').disable();
        this.formGroup.get('blockCount').disable();
        break;
      case DialLimitType.MsgLen:
        // 拨测报文总长
        this.formGroup.get('duration').disable();
        this.formGroup.get('msgLen').enable();
        this.formGroup.get('blockCount').disable();
        break;
      case DialLimitType.BlockCount:
        // 拨测报文包数
        this.formGroup.get('duration').disable();
        this.formGroup.get('msgLen').disable();
        this.formGroup.get('blockCount').enable();
        break;
      default:
        break;
    }
  }

  private enableFgByRawValue(val: DialLimitVal, fg: FormGroup) {
    switch (true) {
      case null != val.duration:
        fg.get('limitType').setValue(DialLimitType.Duration);
        break;
      case null != val.msgLen:
        fg.get('limitType').setValue(DialLimitType.MsgLen);
        break;
      case null != val.blockCount:
        fg.get('limitType').setValue(DialLimitType.BlockCount);
        break;
      default:
        break;
    }
  }
}
