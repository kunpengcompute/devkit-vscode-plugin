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
import { NetioTaskForm, FrequencyUnit } from '../../domain';

type NetworkPacketLoss = NetioTaskForm['packetLoss'];
@Component({
  selector: 'app-network-packet-loss',
  templateUrl: './network-packet-loss.component.html',
  styleUrls: ['./network-packet-loss.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NetworkPacketLossComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => NetworkPacketLossComponent),
      multi: true,
    },
  ],
})
export class NetworkPacketLossComponent implements ControlValueAccessor {
  @Input()
  set packetLossInfo(val: NetworkPacketLoss) {
    if (null == val) {
      return;
    }
    this.formGroup.patchValue(val);
  }
  @Input() labelWidth = '171px';

  formGroup: FormGroup;
  intervalUnit = FrequencyUnit.Ms;

  private propagateChange = (_: NetworkPacketLoss) => {};
  private propagateTunched = (_: any) => {};

  constructor(private fb: FormBuilder) {
    this.formGroup = this.fb.group({
      filterCondition: [],
      collectDuration: [
        10,
        [
          TiValidators.required,
          TiValidators.minValue(1),
          TiValidators.maxValue(300),
        ],
      ],
      isCollectKernel: [false],
      interval: [{ value: 1, disabled: true }],
      fileSize: [
        { value: 1024, disabled: true },
        [TiValidators.minValue(1), TiValidators.maxValue(1024)],
      ],
    });

    this.formGroup.get('isCollectKernel').valueChanges.subscribe((state) => {
      if (state) {
        this.formGroup.get('interval').enable();
        this.formGroup.get('fileSize').enable();
      } else {
        this.formGroup.get('interval').disable();
        this.formGroup.get('fileSize').disable();
      }
    });

    this.formGroup.valueChanges.subscribe((val) => {
      this.propagateChange(val);
    });

    this.formGroup.get('interval').valueChanges.subscribe((val) => {
      this.intervalUnit = val < 1 ? FrequencyUnit.Us : FrequencyUnit.Ms;
    });
  }

  writeValue(val: NetworkPacketLoss) {
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
