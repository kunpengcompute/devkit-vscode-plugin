import { Component, Input, forwardRef } from '@angular/core';
import {
  FormControl,
  FormGroup,
  NG_VALUE_ACCESSOR,
  NG_VALIDATORS,
  ControlValueAccessor,
} from '@angular/forms';
import {
  NetioTaskForm,
  DialTestScene,
  IpProtocolType,
  NetworkParam,
} from '../../../../domain';
import { I18n } from 'sys/locale';
import { TiValidators } from '@cloud/tiny3';
import { CustomValidatorsService } from 'sys/src-com/app/service';
import { Cat } from 'projects/hyper';

type DialingTcpRaw = NetioTaskForm['dialing']['tcp'];
type DialingTcpForm = Omit<DialingTcpRaw, 'networkParam'> & {
  v4NetworkParam?: NetworkParam;
  v6NetworkParam?: NetworkParam;
};
enum MessageUnit {
  K = 'K',
  B = 'B',
}

@Component({
  selector: 'app-dialing-tcp-udp',
  templateUrl: './dialing-tcp-udp.component.html',
  styleUrls: ['./dialing-tcp-udp.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DialingTcpUdpComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => DialingTcpUdpComponent),
      multi: true,
    },
  ],
})
export class DialingTcpUdpComponent implements ControlValueAccessor {
  @Input() dialingType: DialTestScene;
  @Input()
  set tcpInfo(val: DialingTcpRaw) {
    if (null == val) {
      return;
    }
    const formData = this.transDialingForm(val);
    this.formGroup.patchValue(formData);
  }
  @Input() labelWidth = '109px';
  @Input() nodeList: { label: string; value: string }[];

  i18n = I18n;
  protocolTypeEnum = IpProtocolType;
  showHightParam = false;
  formGroup: FormGroup;

  // 拨测带宽单位列表
  unitOptions: { label: string; unit: string }[] = [
    { label: 'Mb/s', unit: 'M' },
    { label: 'Kb/s', unit: 'K' },
  ];
  // 拨测报文长度单位列表
  messageOptions: { label: string; unit: string; max: number; min: number }[] =
    [
      { label: 'KB', unit: MessageUnit.K, max: 1024, min: 1 },
      { label: 'B', unit: MessageUnit.B, max: 1448, min: 16 },
    ];
  messageUnitEnum = MessageUnit;
  dialTestSceneEmun = DialTestScene;
  currPacketSizeUnit: MessageUnit = MessageUnit.K;

  private propagateChange = (_: any) => {};
  private propagateTunched = (_: any) => {};

  constructor(private validatorsServe: CustomValidatorsService) {
    this.formGroup = this.initTcpFG();

    this.formGroup.get('protocolType').valueChanges.subscribe((type) => {
      switch (type) {
        case IpProtocolType.IPv4:
          this.formGroup.get('v4NetworkParam').enable();
          this.formGroup.get('v6NetworkParam').disable();
          break;
        case IpProtocolType.IPv6:
          this.formGroup.get('v4NetworkParam').disable();
          this.formGroup.get('v6NetworkParam').enable();
          break;
        default:
          break;
      }
    });
    this.formGroup.valueChanges.subscribe((val) => {
      const rawData = this.transDialingRaw(val);
      this.propagateChange(rawData);
    });
  }

  writeValue(val: DialingTcpRaw) {
    this.tcpInfo = val;
  }

  registerOnChange(fn: any) {
    this.propagateChange = fn;
  }

  validate(ctl: FormControl) {
    return this.formGroup?.valid ? null : { dialingTcpUdp: { valid: false } };
  }

  registerOnTouched(fn: any) {
    this.propagateTunched = fn;
  }

  onPacketSizeUnitSelect(value: MessageUnit) {
    this.currPacketSizeUnit = value;
  }

  private initTcpFG(): FormGroup {
    const tcgFG = new FormGroup({
      protocolType: new FormControl(IpProtocolType.IPv4),
      v4NetworkParam: new FormControl({
        server: {
          serverIp: '',
          serverBindIp: '',
          listenPort: 5201,
        },
        client: {
          clientIp: '',
          clientBindIp: '',
          connectPort: 5201,
        },
      }),
      v6NetworkParam: new FormControl({
        value: {
          server: {
            serverIp: '',
            serverBindIp: '',
            listenPort: 5201,
          },
          client: {
            clientIp: '',
            sourceEth: '',
            connectPort: 5201,
          },
        },
        disabled: true,
      }),
      serverCPUAffinity: new FormControl('', [
        this.validatorsServe.checkServerCPUMask(),
      ]),
      clientCPUAffinity: new FormControl('', [
        this.validatorsServe.checkSampCPUMask(),
      ]),
      interval: new FormControl(1000, [
        TiValidators.minValue(100),
        TiValidators.maxValue(10000),
      ]),
      bandwidth: new FormControl(),
      dialLimitVal: new FormControl({
        duration: 10,
        msgLen: '',
        blockCount: '',
      }),
      packetSize: new FormControl(),
      concurrency: new FormControl(1, [
        TiValidators.minValue(1),
        TiValidators.maxValue(60),
      ]),
      windowSize: new FormControl('', [
        TiValidators.minValue(1),
        TiValidators.maxValue(425984),
      ]),
      MSSLen: new FormControl(1460, [
        TiValidators.minValue(88),
        TiValidators.maxValue(1460),
      ]),
      zeroCopy: new FormControl(false),
    });
    return tcgFG;
  }

  private transDialingForm(rawData: DialingTcpRaw): DialingTcpForm {
    const rawDataCopy = JSON.parse(JSON.stringify(rawData));
    const { networkParam, protocolType } = rawDataCopy;

    if (this.dialingType === DialTestScene.Udp) {
      rawDataCopy.packetSize = Number(rawDataCopy.packetSize);
    } else if (rawDataCopy?.packetSize || rawDataCopy?.packetSize === '') {
      rawDataCopy.packetSize = Cat.isNum(rawDataCopy.packetSize)
        ? rawDataCopy.packetSize + MessageUnit.B
        : rawDataCopy.packetSize;
    }

    IpProtocolType.IPv4 === String(protocolType)
      ? (rawDataCopy.v4NetworkParam = networkParam)
      : (rawDataCopy.v6NetworkParam = networkParam);

    rawDataCopy.networkParam = void 0;
    return rawDataCopy;
  }

  private transDialingRaw(formData: DialingTcpForm): DialingTcpRaw {
    const formDataCopy = JSON.parse(JSON.stringify(formData));

    const { v4NetworkParam, v6NetworkParam, protocolType } = formDataCopy;

    formDataCopy.networkParam =
      IpProtocolType.IPv4 === protocolType ? v4NetworkParam : v6NetworkParam;

    delete formDataCopy.v4NetworkParam;
    delete formDataCopy.v6NetworkParam;

    if (this.dialingType === DialTestScene.Udp) {
      delete formDataCopy.MSSLen;
      delete formDataCopy.windowSize;
    }

    return formDataCopy;
  }
}
