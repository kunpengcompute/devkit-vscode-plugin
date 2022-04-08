import { Component, forwardRef, Input } from '@angular/core';
import {
  ControlValueAccessor,
  FormBuilder,
  FormControl,
  FormGroup,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { Observable } from 'rxjs';
import {
  IpProtocolType,
  NetioTaskForm,
  TransDirection,
  NetworkLayerProtocol,
  TransLayerProtocol,
} from '../../domain';
import { HyTheme, HyThemeService } from 'hyper';

type NetCaughtfilter = NetioTaskForm['netCaught']['filterCondition'];

@Component({
  selector: 'app-caught-filter',
  templateUrl: './caught-filter.component.html',
  styleUrls: ['./caught-filter.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CaughtFilterComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => CaughtFilterComponent),
      multi: true,
    },
  ],
})
export class CaughtFilterComponent implements ControlValueAccessor {
  @Input()
  set caughtInfo(val: NetCaughtfilter) {
    if (null == val) {
      return;
    }
    this.patchFormValue(this.formGroup, val);
  }
  @Input() labelWidth: string;

  theme$: Observable<HyTheme>;
  formGroup: FormGroup;
  currIpProtocol = IpProtocolType.IPv4;
  ipProtocolTypeEnum = IpProtocolType;
  transDirectionEnum = TransDirection;
  protocolFilter: NetworkLayerProtocol[] | TransLayerProtocol[] = [];
  protocalOptions: {
    label: string;
    value: NetworkLayerProtocol | TransLayerProtocol;
  }[];

  private readonly ownPortProtocols = [
    TransLayerProtocol.UDP,
    TransLayerProtocol.TCP,
    NetworkLayerProtocol.IP,
    NetworkLayerProtocol.IP6,
  ];
  private propagateChange = (_: NetCaughtfilter) => {};
  private propagateTunched = (_: any) => {};

  constructor(private fb: FormBuilder, private themeService: HyThemeService) {
    this.formGroup = this.initFormGroup();

    this.formGroup.valueChanges.subscribe(() => {
      const rawData = this.transRawData(this.formGroup.value);
      this.propagateChange(rawData);
    });

    this.formGroup.get('protocolType').valueChanges.subscribe((val) => {
      this.currIpProtocol = val;
      if (this.protocolFilter?.length) {
        this.handleIpOrPortState(this.protocolFilter, val);
      }
      this.protocalOptions = this.getProtocalOptions(val);
    });

    this.formGroup
      .get('protocolFilter')
      .valueChanges.subscribe((protocols: any[]) => {
        if (null == protocols) {
          return;
        }
        this.protocolFilter = protocols;
        this.handleIpOrPortState(protocols, this.currIpProtocol);
      });

    this.protocalOptions = this.getProtocalOptions(IpProtocolType.IPv4);

    this.theme$ = this.themeService.getObservable();
  }

  writeValue(val: NetCaughtfilter) {
    this.caughtInfo = val;
  }

  registerOnChange(fn: any) {
    this.propagateChange = fn;
  }

  validate(ctl: FormControl) {
    return this.formGroup.valid ? null : { caughtInfo: { valid: false } };
  }

  registerOnTouched(fn: any) {
    this.propagateTunched = fn;
  }

  private initFormGroup() {
    return this.fb.group({
      protocolType: [IpProtocolType.IPv4],
      protocolFilter: [],
      IP1v4: [],
      IP1v6: [],
      port1: [],
      IP2v4: [],
      IP2v6: [],
      port2: [],
      direction: [],
    });
  }

  private patchFormValue(fg: FormGroup, info: NetCaughtfilter) {
    const { protocolType, protocolFilter, IP1, port1, IP2, port2, direction } =
      info;
    const fromData = {
      protocolType,
      protocolFilter,
      IP1v4: IpProtocolType.IPv4 === protocolType ? IP1 : undefined,
      IP1v6: IpProtocolType.IPv6 === protocolType ? IP1 : undefined,
      port1,
      IP2v4: IpProtocolType.IPv4 === protocolType ? IP2 : undefined,
      IP2v6: IpProtocolType.IPv6 === protocolType ? IP2 : undefined,
      port2,
      direction,
    };
    fg.patchValue(fromData);
  }

  private transRawData(fgValue: any): NetCaughtfilter {
    const {
      protocolType,
      protocolFilter,
      IP1v4,
      IP1v6,
      port1,
      IP2v4,
      IP2v6,
      port2,
      direction,
    } = fgValue;
    const rawData = {
      protocolType,
      protocolFilter,
      IP1: IpProtocolType.IPv4 === protocolType ? IP1v4 : IP1v6,
      port1,
      IP2: IpProtocolType.IPv4 === protocolType ? IP2v4 : IP2v6,
      port2,
      direction,
    };
    return rawData;
  }

  private getProtocalOptions(
    protocolType: IpProtocolType
  ): { label: string; value: NetworkLayerProtocol | TransLayerProtocol }[] {
    const baseOptions = [
      { label: 'ICMP', value: NetworkLayerProtocol.ICMP },
      { label: 'RARP', value: NetworkLayerProtocol.RARP },
      { label: 'ARP', value: NetworkLayerProtocol.ARP },
      { label: 'TCP', value: TransLayerProtocol.TCP },
      { label: 'UDP', value: TransLayerProtocol.UDP },
    ];

    const v4Options = [
      { label: 'IP', value: NetworkLayerProtocol.IP },
      ...baseOptions,
    ];
    const v6Options = [
      { label: 'IP6', value: NetworkLayerProtocol.IP6 },
      ...baseOptions,
    ];

    return IpProtocolType.IPv6 === protocolType ? v6Options : v4Options;
  }

  private takeIntersection(...twoDimenArr: any[][]): any[] {
    const res = twoDimenArr.reduce((data: any, item: any) => {
      return data.filter((i: any) => {
        return item.some((j: any) => {
          return i === j;
        });
      });
    });
    return res;
  }
  /**
   * 选择不同的协议，对ip和port的禁用
   * 当不包含ipv4/TCP/UDP时，IP不禁用，port禁用
   * 当不包含ipv6/TCP/UDP时，ip和port都禁用
   * @param protocols 协议
   * @param currIpProtocol ip类型
   */
  private handleIpOrPortState(
    protocols: NetworkLayerProtocol[] | TransLayerProtocol[],
    currIpProtocol: IpProtocolType
  ) {
    const hasIntersection =
      this.takeIntersection(this.ownPortProtocols, protocols).length > 0;
    const isNullProtocols = !protocols?.length;

    if (hasIntersection || isNullProtocols) {
      this.formGroup.get('port1').enable();
      this.formGroup.get('port2').enable();
      this.formGroup.get('IP1v6').enable();
      this.formGroup.get('IP2v6').enable();
    } else {
      this.formGroup.get('port1').disable();
      this.formGroup.get('port2').disable();
      if (IpProtocolType.IPv6 === currIpProtocol) {
        this.formGroup.get('IP1v6').disable();
        this.formGroup.get('IP2v6').disable();
      }
    }
  }
}
