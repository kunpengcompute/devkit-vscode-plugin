import { Component, Input, forwardRef } from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  NG_VALIDATORS,
  FormControl,
  FormGroup,
} from '@angular/forms';
import { TiValidators } from '@cloud/tiny3';
import { I18n } from 'sys/locale';
import { FrequencyUnit } from '../../domain';

export type IValueUnitOption = {
  label: string;
  unit: FrequencyUnit;
};

@Component({
  selector: 'app-sample-frequency',
  template: `
    <div class="warpper" [formGroup]="formGroup">
      <ti-select
        formControlName="unit"
        [options]="unitOptions"
        labelKey="label"
        valueKey="unit"
        style="width: 159px;"
      ></ti-select>
      <input
        [hidden]="frequencyUnit.Ms !== currFreqUnit"
        tiText
        tiNumber
        type="text"
        formControlName="msNumeric"
        [format]="'N0'"
        tiValidation
        [hySpinnerBlur]="{
          control: formGroup.get('msNumeric'),
          min: 1,
          max: 1000
        }"
        style="width: 159px;"
      />
      <input
        [hidden]="frequencyUnit.Us !== currFreqUnit"
        tiText
        tiNumber
        type="text"
        formControlName="usNumeric"
        [format]="'N0'"
        style="width: 159px;"
      />
    </div>
  `,
  styles: [
    `
      .warpper {
        display: inline-flex;
        width: 326px;
        justify-content: space-between;
      }
    `,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SampleFrequencyComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => SampleFrequencyComponent),
      multi: true,
    },
  ],
})
export class SampleFrequencyComponent implements ControlValueAccessor {
  static HIGH_PRECISION_VALUE = 710;
  @Input()
  set value(val: number) {
    this.setFromGroup(this.formGroup, val);
  }
  @Input() required?: boolean;

  formGroup: FormGroup;
  currFreqUnit = FrequencyUnit.Ms;
  frequencyUnit = FrequencyUnit;

  readonly unitOptions: IValueUnitOption[] = [
    {
      label: I18n.lock.form.custom,
      unit: FrequencyUnit.Ms,
    },
    {
      label: I18n.common_term_task_start_high_precision,
      unit: FrequencyUnit.Us,
    },
  ];

  private propagateChange = (_: number) => {};
  private propagateTunched = (_: any) => {};

  constructor() {
    this.formGroup = this.initFromGroup();

    // 设置响应逻辑
    this.formGroup.valueChanges.subscribe(() => {
      const rawValue = this.formGroup.getRawValue();
      const { msNumeric, usNumeric, unit } = rawValue;

      const numeric = FrequencyUnit.Us === unit ? usNumeric / 1000 : msNumeric;
      this.propagateChange(numeric);
    });

    this.formGroup.get('unit').valueChanges.subscribe((unit: FrequencyUnit) => {
      this.currFreqUnit = unit;
      switch (unit) {
        case FrequencyUnit.Us:
          this.formGroup.get('msNumeric').disable();
          break;
        case FrequencyUnit.Ms:
          this.formGroup.get('msNumeric').enable();
          break;
        default:
          break;
      }
    });
  }

  writeValue(val: number) {
    this.value = val;
  }

  registerOnChange(fn: any) {
    this.propagateChange = fn;
  }

  validate(ctl: FormControl) {
    return this.formGroup.valid ? null : { sampleFrequency: { valid: false } };
  }

  registerOnTouched(fn: any) {
    this.propagateTunched = fn;
  }

  private initFromGroup(): FormGroup {
    const option = this.unitOptions[0];

    // 初始化表单
    const fg = new FormGroup({
      msNumeric: new FormControl(1, [
        TiValidators.required,
        TiValidators.minValue(1),
        TiValidators.maxValue(1000),
      ]),
      usNumeric: new FormControl(
        {
          value: SampleFrequencyComponent.HIGH_PRECISION_VALUE,
          disabled: true,
        },
        [TiValidators.required]
      ),
      unit: new FormControl(option.unit),
    });

    return fg;
  }

  private setFromGroup(fg: FormGroup, val: number) {
    const data =
      val < 1
        ? {
            usNumeric: SampleFrequencyComponent.HIGH_PRECISION_VALUE,
            unit: FrequencyUnit.Us,
          }
        : {
            msNumeric: val,
            unit: FrequencyUnit.Ms,
          };

    fg.patchValue(data);
  }
}
