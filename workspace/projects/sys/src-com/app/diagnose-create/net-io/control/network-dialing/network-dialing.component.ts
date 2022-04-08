import { Component, Input, forwardRef, NgZone } from '@angular/core';
import {
  FormGroup,
  FormControl,
  NG_VALUE_ACCESSOR,
  NG_VALIDATORS,
  ControlValueAccessor,
} from '@angular/forms';
import { DialTestScene, NetioTaskForm } from '../../domain';
import { HyThemeService, HyTheme, Cat } from 'hyper';
import { I18n } from 'sys/locale';
import { Observable } from 'rxjs';

type NetDialParam = NetioTaskForm['dialing'];

@Component({
  selector: 'app-network-dialing',
  templateUrl: './network-dialing.component.html',
  styleUrls: ['./network-dialing.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NetworkDialingComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => NetworkDialingComponent),
      multi: true,
    },
  ],
})
export class NetworkDialingComponent implements ControlValueAccessor {
  @Input()
  set netDailParam(val: NetDialParam) {
    if (null == val) {
      return;
    }
    this.zone.runOutsideAngular(() => {
      setTimeout(() => {
        this.setFormGroup(val);
      });
    });
  }
  @Input()
  set nodeOptions(val: { label: string; value: string }[]) {
    if (null == val && !Cat.isArr(val)) {
      return;
    }
    this.nodeOptionsStash = val;
    this.scenesOptions[1].disabled = val.length <= 1;
    this.scenesOptions[2].disabled = val.length <= 1;
  }
  get nodeOptions() {
    return this.nodeOptionsStash;
  }
  @Input() labelWidth = '171px';

  formGroup: FormGroup;
  formOption = {
    connection: { display: true },
    tcp: { display: false },
    udp: { display: false },
  };
  nodeOptionsStash: { label: string; value: string }[];
  scenesOptions = [
    {
      label: I18n.network_diagnositic.taskParams.connection,
      value: DialTestScene.Connection,
      disabled: false,
    },
    {
      label: I18n.network_diagnositic.taskParams.tcp,
      value: DialTestScene.Tcp,
      disabled: false,
    },
    {
      label: I18n.network_diagnositic.taskParams.udp,
      value: DialTestScene.Udp,
      disabled: false,
    },
  ];
  dialTestSceneEmun = DialTestScene;
  theme$: Observable<HyTheme>;

  constructor(private themeServe: HyThemeService, private zone: NgZone) {
    this.theme$ = this.themeServe.getObservable();

    this.formGroup = new FormGroup({
      dialScene: new FormControl(DialTestScene.Connection),
      connection: new FormControl(),
      tcp: new FormControl({ disabled: true }),
      udp: new FormControl({ disabled: true }),
    });

    this.formGroup.get('dialScene').valueChanges.subscribe((val) => {
      this.setControlState(val);
    });
    this.formGroup.valueChanges.subscribe((val) => {
      this.propagateChange(val);
    });
  }

  private propagateChange = (_: any) => {};
  private propagateTunched = (_: any) => {};

  setFormGroup(dailingInfo: NetDialParam) {
    this.formGroup.patchValue(dailingInfo);
  }

  writeValue(val: NetDialParam) {
    this.netDailParam = val;
  }

  registerOnChange(fn: any) {
    this.propagateChange = fn;
  }

  validate(ctl: FormControl) {
    return this.formGroup?.valid ? null : { networkDialing: { valid: false } };
  }

  registerOnTouched(fn: any) {
    this.propagateTunched = fn;
  }

  private setControlState(scene: DialTestScene) {
    this.formOption.connection.display = DialTestScene.Connection === scene;
    this.formOption.tcp.display = DialTestScene.Tcp === scene;
    this.formOption.udp.display = DialTestScene.Udp === scene;

    this.formOption.connection.display
      ? this.formGroup.get('connection').enable()
      : this.formGroup.get('connection').disable();

    this.formOption.tcp.display
      ? this.formGroup.get('tcp').enable()
      : this.formGroup.get('tcp').disable();

    this.formOption.udp.display
      ? this.formGroup.get('udp').enable()
      : this.formGroup.get('udp').disable();
  }
}
