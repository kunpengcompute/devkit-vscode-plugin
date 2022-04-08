import { Component, Input, forwardRef } from '@angular/core';
import {
  FormGroup,
  FormControl,
  NG_VALUE_ACCESSOR,
  NG_VALIDATORS,
  ControlValueAccessor,
} from '@angular/forms';
import { NetioTaskForm, IpProtocolType, Pathmtudis } from '../../../../domain';
import { I18n } from 'sys/locale';
import { TiValidators } from '@cloud/tiny3';
import { HyThemeService, HyTheme } from 'hyper';
import { Observable } from 'rxjs';

type DialingConnectRaw = NetioTaskForm['dialing']['connection'];
type DialingConnectForm = Omit<DialingConnectRaw, 'servers'> & {
  v4Servers?: DialingConnectRaw['servers'];
  v6Servers?: DialingConnectRaw['servers'];
};

@Component({
  selector: 'app-dialing-connection',
  templateUrl: './dialing-connection.component.html',
  styleUrls: ['./dialing-connection.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DialingConnectionComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => DialingConnectionComponent),
      multi: true,
    },
  ],
})
export class DialingConnectionComponent implements ControlValueAccessor {
  @Input()
  set dialingConnect(val: DialingConnectRaw) {
    if (null == val) {
      return;
    }
    this.setFormGroup(val);
  }
  @Input() nodeList: { label: string; value: string }[];
  @Input() labelWidth = '109px';

  i18n = I18n;
  formGroup: FormGroup;
  protocolTypeEnum = IpProtocolType;
  showHightParam = false;
  partList = [
    { label: 'want', value: 'want' },
    { label: 'do', value: 'do' },
    { label: 'dont', value: 'dont' },
  ];
  formOption = {
    v4Servers: { dispaly: true },
    v6Servers: { dispaly: false },
  };
  theme$: Observable<HyTheme>;

  private propagateChange = (_: any) => {};
  private propagateTunched = (_: any) => {};

  constructor(private themeServe: HyThemeService) {
    this.theme$ = this.themeServe.getObservable();

    this.formGroup = this.initFormGroup();
    // 默认展示IPv6
    this.setControlState(IpProtocolType.IPv4);

    this.formGroup
      .get('protocolType')
      .valueChanges.subscribe((type: IpProtocolType) => {
        this.setControlState(type);
      });
    this.formGroup.valueChanges.subscribe((val) => {
      const rawData = this.transDialingRaw(val);
      this.propagateChange(rawData);
    });
  }

  writeValue(val: DialingConnectRaw) {
    this.dialingConnect = val;
  }

  registerOnChange(fn: any) {
    this.propagateChange = fn;
  }

  validate(ctl: FormControl) {
    return this.formGroup?.valid
      ? null
      : { dialingConnection: { valid: false } };
  }

  registerOnTouched(fn: any) {
    this.propagateTunched = fn;
  }

  private setControlState(type: IpProtocolType) {
    this.formOption.v4Servers.dispaly = IpProtocolType.IPv4 === type;
    this.formOption.v6Servers.dispaly = IpProtocolType.IPv6 === type;

    this.formOption.v4Servers.dispaly
      ? this.formGroup.get('v4Servers').enable()
      : this.formGroup.get('v4Servers').disable();
    this.formOption.v6Servers.dispaly
      ? this.formGroup.get('v6Servers').enable()
      : this.formGroup.get('v6Servers').disable();
  }

  private setFormGroup(connect: DialingConnectRaw) {
    const formData = this.transDialingForm(connect);
    this.formGroup.patchValue(formData);
  }

  private initFormGroup(): FormGroup {
    const connectFG = new FormGroup({
      protocolType: new FormControl(IpProtocolType.IPv4, [
        TiValidators.required,
      ]),
      v4Servers: new FormControl([
        {
          serverIp: '',
          sourceIp: '',
          destinationIp: '',
        },
      ]),
      v6Servers: new FormControl([
        {
          serverIp: '',
          sourceEth: '',
          destinationIp: '',
        },
      ]),
      msgLen: new FormControl(56, [
        TiValidators.minValue(16),
        TiValidators.maxValue(65507),
      ]),
      interval: new FormControl(1000, [
        TiValidators.minValue(10),
        TiValidators.maxValue(10000),
      ]),
      duration: new FormControl(10, [
        TiValidators.minValue(1),
        TiValidators.maxValue(60),
      ]),
      pathmtudis: new FormControl(Pathmtudis.Want),
      ttl: new FormControl(30, [
        TiValidators.minValue(1),
        TiValidators.maxValue(255),
      ]),
    });
    return connectFG;
  }

  private transDialingRaw(formData: DialingConnectForm): DialingConnectRaw {
    const {
      protocolType,
      v4Servers,
      v6Servers,
      msgLen,
      interval,
      duration,
      pathmtudis,
      ttl,
    } = formData;

    const rawData = {
      protocolType,
      servers: IpProtocolType.IPv4 === protocolType ? v4Servers : v6Servers,
      msgLen,
      interval,
      duration,
      pathmtudis,
      ttl,
    };

    return rawData;
  }

  private transDialingForm(rawData: DialingConnectRaw): DialingConnectForm {
    const {
      protocolType,
      servers,
      msgLen,
      interval,
      duration,
      pathmtudis,
      ttl,
    } = rawData;

    const formData: DialingConnectForm = {
      protocolType,
      v4Servers: servers,
      v6Servers: servers,
      msgLen,
      interval,
      duration,
      pathmtudis,
      ttl,
    };

    return formData;
  }
}
