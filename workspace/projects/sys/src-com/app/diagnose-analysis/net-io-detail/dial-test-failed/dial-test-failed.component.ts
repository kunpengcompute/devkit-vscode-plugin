import { Component, Input } from '@angular/core';
import {
  DialTestTarget,
  DialTestType,
  IDialKpi,
  IDialTestRaw,
} from '../domain';
import { HyTheme, HyThemeService } from 'hyper';
import { Observable } from 'rxjs';
import { I18n, translate } from 'sys/locale';

type IDialTestKpiRaw = IDialKpi & {
  route_info?: IDialTestRaw['connection']['route_info']; // 连通性特有
  arp_info?: IDialTestRaw['connection']['arp_info']; // 连通性特有
};

type DialFailReason = {
  isCollapsed?: boolean;
  title: string;
  reasons: {
    description: string;
    suggestions: string[];
  }[];
};

@Component({
  selector: 'app-dial-test-failed',
  templateUrl: './dial-test-failed.component.html',
  styleUrls: ['./dial-test-failed.component.scss'],
})
export class DialTestFailedComponent {
  @Input() tabShowing: boolean; // 用于判断当前tab的状态
  @Input() endType: DialTestTarget;
  @Input() kpiData: IDialTestKpiRaw;
  @Input()
  set dialType(type: DialTestType) {
    this.dialTypeStash = type;
    switch (type) {
      case DialTestType.TCP:
        this.failReasons = this.initTcpReasons();
        this.failTitle = translate('net_io.tcp_udp_fail', ['TCP']);
        break;
      case DialTestType.UDP:
        this.failReasons = this.initUdpReasons();
        this.failTitle = translate('net_io.tcp_udp_fail', ['UDP']);
        break;
      case DialTestType.Connection:
        this.failReasons = this.initConnReasons();
        this.failTitle = I18n.net_io.connet_fail;
        break;
      default:
        break;
    }
  }
  get dialType(): DialTestType {
    return this.dialTypeStash;
  }

  theme$: Observable<HyTheme>;
  failReasons: DialFailReason[] = [];
  failTitle = '';
  private dialTypeStash: DialTestType;

  constructor(private themeServe: HyThemeService) {
    this.theme$ = this.themeServe.getObservable();
  }

  private initConnReasons(): DialFailReason[] {
    const reason: DialFailReason[] = I18n.net_io.connect_fail_reasons;
    reason.forEach((item, index) => {
      item.isCollapsed = index > 1;
    });
    return reason;
  }

  private initTcpReasons(): DialFailReason[] {
    const reason: DialFailReason[] = I18n.net_io.tcp_dail_fail_reasons;
    reason.forEach((item, index) => {
      item.isCollapsed = index > 1;
    });
    return reason;
  }

  private initUdpReasons(): DialFailReason[] {
    const reason: DialFailReason[] = I18n.net_io.udp_dail_fail_reasons;
    reason.forEach((item, index) => {
      item.isCollapsed = index > 1;
    });
    return reason;
  }
}
