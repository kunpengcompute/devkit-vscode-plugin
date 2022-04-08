import { Component, Input, forwardRef } from '@angular/core';
import { NetworkParam, IpProtocolType } from '../../domain';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  NG_VALIDATORS,
  FormGroup,
  FormControl,
} from '@angular/forms';
import { HyThemeService, HyTheme } from 'hyper';
import { Observable } from 'rxjs';
import { TiValidators } from '@cloud/tiny3';
import { CustomValidatorsService } from 'sys/src-com/app/service';
import { I18n } from 'sys/locale';

type NodeOption = { label: string; value: string; disabled: boolean };

@Component({
  selector: 'app-networking-param',
  templateUrl: './networking-param.component.html',
  styleUrls: ['./networking-param.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NetworkingParamComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => NetworkingParamComponent),
      multi: true,
    },
  ],
})
export class NetworkingParamComponent implements ControlValueAccessor {
  @Input()
  set nodeList(val: Array<{ label: string; value: string }>) {
    if (null == val) {
      return;
    }
    val.forEach((item) => {
      this.serverNodeOptions.push({ ...item, disabled: false });
      this.clientNodeOptions.push({ ...item, disabled: false });
    });
  }
  @Input()
  set networkParam(val: NetworkParam) {
    if (null == val) {
      return;
    }
    this.setFormGroup(this.formGroup, val);
  }
  @Input()
  set protocolType(type: IpProtocolType) {
    if (null == type) {
      return;
    }
    this.protocolTypeStash = type;
    IpProtocolType.IPv4 === type
      ? this.formGroup.get('sourceEth').disable()
      : this.formGroup.get('clientBindIp').disable();
  }
  get protocolType() {
    return this.protocolTypeStash;
  }
  @Input() labelWidth: string;

  formGroup: FormGroup;
  labelObj: any;
  theme$: Observable<HyTheme>;
  protocolTypeMenu = IpProtocolType;
  serverNodeOptions: NodeOption[] = [];
  clientNodeOptions: NodeOption[] = [];

  private protocolTypeStash: IpProtocolType;

  private propagateChange = (_: any) => {};
  private propagateTunched = (_: any) => {};

  constructor(
    private themeServe: HyThemeService,
    private validatorsServe: CustomValidatorsService
  ) {
    this.theme$ = this.themeServe.getObservable();

    this.formGroup = this.initFormGroup();
    this.formGroup.get('serverIp').valueChanges.subscribe((val) => {
      this.clientNodeOptions.forEach((item) => {
        item.disabled = item.value === val;
      });
    });
    this.formGroup.get('clientIp').valueChanges.subscribe((val) => {
      this.serverNodeOptions.forEach((item) => {
        item.disabled = item.value === val;
      });
    });
    this.formGroup.valueChanges.subscribe((value) => {
      const server = {
        serverIp: value.serverIp || '',
        serverBindIp: value.serverBindIp || '',
        listenPort: value.listenPort || '',
      };

      const client = {
        clientIp: value?.clientIp || '',
        clientBindIp: value?.clientBindIp || '',
        sourceEth: value?.sourceEth || '',
        connectPort: value?.connectPort || '',
      };

      this.propagateChange({
        server,
        client,
      });
    });
  }

  writeValue(val: NetworkParam) {
    this.networkParam = val;
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

  private setFormGroup(formGroup: FormGroup, param: NetworkParam) {
    const fgValue = {
      ...param.server,
      ...param.client,
    };
    formGroup.patchValue(fgValue);
  }

  private initFormGroup(): FormGroup {
    return new FormGroup({
      serverIp: new FormControl('', [TiValidators.required]),
      serverBindIp: new FormControl('', [TiValidators.required]),
      listenPort: new FormControl(5201),
      clientIp: new FormControl('', [TiValidators.required]),
      clientBindIp: new FormControl(''),
      sourceEth: new FormControl('', [
        TiValidators.required,
        this.validatorsServe.checkNetworkParam(
          I18n.network_diagnositic.taskParams.client_network_port
        ),
      ]),
      connectPort: new FormControl(5201),
    });
  }
}
