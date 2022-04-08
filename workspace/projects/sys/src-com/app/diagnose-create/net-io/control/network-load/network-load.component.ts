import { Component, Input, forwardRef } from '@angular/core';
import {
  FormControl,
  FormGroup,
  NG_VALUE_ACCESSOR,
  NG_VALIDATORS,
  ControlValueAccessor,
} from '@angular/forms';
import { NetioTaskForm } from '../../domain';
import { TiValidators } from '@cloud/tiny3';
type NetLoadParam = NetioTaskForm['load'];

@Component({
  selector: 'app-network-load',
  templateUrl: './network-load.component.html',
  styleUrls: ['./network-load.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NetworkLoadComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => NetworkLoadComponent),
      multi: true,
    },
  ],
})
export class NetworkLoadComponent implements ControlValueAccessor {
  @Input()
  set netLoadParam(val: NetLoadParam) {
    if (null == val) {
      return;
    }
    this.formGroup.patchValue(val);
  }
  @Input() labelWidth: string;
  formGroup: FormGroup;

  private propagateChange = (_: any) => {};
  private propagateTunched = (_: any) => {};

  constructor() {
    this.formGroup = new FormGroup({
      loadDuration: new FormControl(10, [
        TiValidators.required,
        TiValidators.minValue(2),
        TiValidators.maxValue(300),
      ]),
      loadInterval: new FormControl(1, [
        TiValidators.required,
        TiValidators.minValue(1),
        TiValidators.maxValue(10),
      ]),
    });
    this.formGroup.valueChanges.subscribe((val) => {
      this.propagateChange(val);
    });
  }

  writeValue(val: NetLoadParam) {
    this.netLoadParam = val;
  }

  registerOnChange(fn: any) {
    this.propagateChange = fn;
  }

  validate(ctl: FormControl) {
    return this.formGroup?.valid ? null : { nodelist: { valid: false } };
  }

  registerOnTouched(fn: any) {
    this.propagateTunched = fn;
  }
}
