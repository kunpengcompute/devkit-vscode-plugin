import { Component, forwardRef, Input } from '@angular/core';
import {
  ControlValueAccessor,
  FormBuilder,
  FormControl,
  FormGroup,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { TiValidators } from '@cloud/tiny3';
import { I18n } from 'sys/locale';
import { CustomValidatorsService } from 'sys/src-com/app/service';
import { NetioTaskForm } from '../../domain';

type NetworkCaught = NetioTaskForm['netCaught'];

@Component({
  selector: 'app-network-caught',
  templateUrl: './network-caught.component.html',
  styleUrls: ['./network-caught.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NetworkCaughtComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => NetworkCaughtComponent),
      multi: true,
    },
  ],
})
export class NetworkCaughtComponent implements ControlValueAccessor {
  @Input()
  set packetLossInfo(val: NetworkCaught) {
    if (null == val) {
      return;
    }
    this.formGroup.patchValue(val);
  }
  @Input() labelWidth = '171px';

  formGroup: FormGroup;
  private propagateChange = (_: NetworkCaught) => {};
  private propagateTunched = (_: any) => {};

  constructor(
    private fb: FormBuilder,
    private validatorsServe: CustomValidatorsService
  ) {
    this.formGroup = this.fb.group({
      ethName: [null, [this.validatorsServe.checkNetworkParam(I18n.net_io.caught_eth)]],
      filterCondition: [],
      caughtDuration: [
        10,
        [
          TiValidators.required,
          TiValidators.minValue(1),
          TiValidators.maxValue(300),
        ],
      ],
      blockCount: [
        1000,
        [
          TiValidators.required,
          TiValidators.minValue(1),
          TiValidators.maxValue(10000),
        ],
      ],
      fileSize: [10, [TiValidators.minValue(10), TiValidators.maxValue(1024)]],
      fileNumber: [1, [TiValidators.minValue(1), TiValidators.maxValue(10)]],
    });

    this.formGroup.valueChanges.subscribe((val: NetworkCaught) => {
      this.propagateChange(val);
    });
  }

  writeValue(val: NetworkCaught) {
    this.packetLossInfo = val;
  }

  registerOnChange(fn: any) {
    this.propagateChange = fn;
  }

  validate(ctl: FormControl) {
    return this.formGroup.valid ? null : { packetLossInfo: { valid: false } };
  }

  registerOnTouched(fn: any) {
    this.propagateTunched = fn;
  }
}
