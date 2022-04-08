import { Component, forwardRef, Input } from '@angular/core';
import {
  ControlValueAccessor,
  FormBuilder,
  FormControl,
  FormGroup,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { Observable, PartialObserver } from 'rxjs';
import { NetioTaskForm } from '../../domain';
import { HyTheme, HyThemeService } from 'hyper';
import { I18n } from 'sys/locale';
import { CustomValidatorsService } from 'sys/src-com/app/service';

type PacketLossfilter = NetioTaskForm['packetLoss']['filterCondition'];

@Component({
  selector: 'app-packetloss-filter',
  templateUrl: './packetloss-filter.component.html',
  styleUrls: ['./packetloss-filter.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PacketlossFilterComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => PacketlossFilterComponent),
      multi: true,
    },
  ],
})
export class PacketlossFilterComponent implements ControlValueAccessor {
  @Input()
  set packetLossInfo(val: PacketLossfilter) {
    if (null == val) {
      return;
    }

    this.formGroup.patchValue(val);
  }
  @Input() labelWidth: string;

  formGroup: FormGroup;
  theme$: Observable<HyTheme>;

  private propagateChange = (_: PacketLossfilter) => {};
  private propagateTunched = (_: any) => {};

  constructor(
    private fb: FormBuilder,
    private themeService: HyThemeService,
    private validatorsServe: CustomValidatorsService
  ) {
    this.formGroup = this.fb.group({
      ipAddress: [],
      ethName: [
        null,
        [
          this.validatorsServe.checkNetworkParam(
            I18n.sys_summary.cpupackage_tabel.networkName
          ),
        ],
      ],
    });
    const valueObserver: PartialObserver<PacketLossfilter> = {
      next: (val) => {
        this.propagateChange(val);
      },
    };
    this.formGroup.valueChanges.subscribe(valueObserver);

    this.theme$ = this.themeService.getObservable();
  }

  writeValue(val: PacketLossfilter) {
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
