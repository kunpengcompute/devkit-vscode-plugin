import {
  Component,
  Input,
  forwardRef,
  OnInit,
  Output,
  EventEmitter,
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  NG_VALIDATORS,
  FormControl,
  FormGroup,
  ValidatorFn,
  AbstractControl,
} from '@angular/forms';
import { TiValidators } from '@cloud/tiny3';
import { Cat } from 'hyper';

export type InputPrarmsOption = {
  label: string;
  unit: string;
  max?: number;
  min?: number;
};

@Component({
  selector: 'app-input-params-unit',
  template: ` <div class="warpper" [formGroup]="formGroup">
    <input
      type="text"
      tiText
      tiNumber
      formControlName="numeric"
      [hySpinnerBlur]="numericBlur"
      [format]="'N0'"
      tiValidation
    />
    <ti-select formControlName="uint" [options]="unitList"></ti-select>
  </div>`,
  styles: [
    `
      .warpper {
        display: flex;
      }
      input {
        width: calc(100% - 92px);
        margin-right: 8px;
      }
      ti-select {
        width: 96px;
      }
    `,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputParamsUnitComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => InputParamsUnitComponent),
      multi: true,
    },
  ],
})
export class InputParamsUnitComponent implements ControlValueAccessor, OnInit {
  @Input()
  set value(val: string) {
    if (null == val) {
      return;
    }

    [this.numeric, this.uint] = this.spliteValueUnit(val, this.unitList);
    this.setFromGroup(this.formGroup, this.numeric, this.uint);
  }
  @Input() unitList: InputPrarmsOption[];
  @Input() required?: boolean;
  @Input() format?: string;

  @Output() readonly unitSelect = new EventEmitter<InputPrarmsOption['unit']>();

  formGroup: FormGroup;
  numericBlur: any;

  private numeric: number;
  private uint: string;

  private propagateChange = (_: any) => {};
  private propagateTunched = (_: any) => {};

  constructor() {}

  ngOnInit() {
    this.formGroup = this.initFromGroup(this.numeric, this.uint);
    this.formGroup.valueChanges.subscribe((val) => {
      const rawData =
        val.numeric?.toString()?.trim() !== '' &&
        Cat.isNum(+val.numeric) &&
        val.numeric
          ? val.numeric + val.uint.unit
          : '';
      this.propagateChange(rawData);
    });
    this.formGroup.get('uint').valueChanges.subscribe((val) => {
      const option = this.unitList.find((item) => item.unit === val.unit);
      const { min, max } = option;

      const validators = [];
      if (!!min) {
        validators.push(TiValidators.minValue(min));
      }
      if (!!max) {
        validators.push(TiValidators.maxValue(max));
      }

      this.numericBlur =
        Cat.isNil(min) && Cat.isNil(max)
          ? void 0
          : {
              control: this.formGroup.get('numeric'),
              min,
              max,
            };
      this.setNumValidators(this.formGroup.get('numeric'), validators);

      this.unitSelect.emit(val.unit);
    });
  }

  writeValue(val: string) {
    this.value = val;
  }

  registerOnChange(fn: any) {
    this.propagateChange = fn;
  }

  validate(ctl: FormControl) {
    return this.formGroup.valid ? null : { nodelist: { valid: false } };
  }

  registerOnTouched(fn: any) {
    this.propagateTunched = fn;
  }

  setDisabledState(status: boolean) {
    if (status) {
      this.formGroup.disable({ emitEvent: false });
    } else {
      this.formGroup.enable({ emitEvent: false });
    }
  }

  private spliteValueUnit(
    val: string,
    unitList: InputPrarmsOption[]
  ): [number, string] {
    const valueList = unitList.map((item) => item.unit);
    const reg = new RegExp(`(${valueList.join('|')}$)`);
    const arr = val.match(reg);
    return arr == null
      ? [null, valueList[0]]
      : [+val.slice(0, arr.index), arr[0]];
  }

  private initFromGroup(num: number, unit: string): FormGroup {
    const option =
      this.unitList?.find((item) => item.unit === unit) ?? this.unitList?.[0];

    return new FormGroup({
      numeric: new FormControl(num ?? ''),
      uint: new FormControl(option),
    });
  }

  private setFromGroup(fg: FormGroup, num: number, unit: string) {
    const option =
      this.unitList?.find((item) => item.unit === unit) ?? this.unitList?.[0];
    fg.setValue({
      numeric: num ?? '',
      uint: option,
    });
  }

  private setNumValidators(
    numericCtl: AbstractControl,
    validators: ValidatorFn[] = []
  ) {
    numericCtl.setValidators(validators);
    numericCtl.updateValueAndValidity();
  }
}
