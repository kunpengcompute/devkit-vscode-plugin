import { Component, Input, ViewEncapsulation } from '@angular/core';
import {
  DialTestTarget,
  DialTestType,
  IDialTestRaw,
  IDialKpi,
  DialTestIndex,
  DialTestIndexStatus,
} from '../../domain';
import { TiModalService } from '@cloud/tiny3';
import { I18n } from 'sys/locale';
import { HyThemeService, HyTheme, calcTextWidth } from 'hyper';
import { WebviewPanelService } from 'sys/src-com/app/service';
import { WebviewPanelInfo } from 'sys/model/webview';

type IDialTestKpiRaw = IDialKpi & {
  // 连通性特有
  route_info?: IDialTestRaw['connection']['route_info'];
  arp_info?: IDialTestRaw['connection']['arp_info'];
};

type IndexDataList = {
  data: string;
  status: string;
  name: string;
  color: string;
  textColor?: string;
  rectWidth?: number;
  rectOffset: number;
}[];

type EndInfoList = {
  type: DialTestTarget;
  ip: string;
  port?: string;
  text: string;
  configInfo?: {
    // 连通性拨测特有
    router: IDialTestRaw['connection']['route_info'];
    arp: IDialTestRaw['connection']['arp_info'];
  };
  addrOffset?: number;
}[];

/**
 * 拨测KPI svg图
 */
@Component({
  selector: 'app-dial-kpi-svg',
  templateUrl: './dial-kpi-svg.component.html',
  styleUrls: ['./dial-kpi-svg.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DialKpiSvgComponent {
  static IDX_TEXT_LEN = 40;
  static ADDR_TEXT_LEN = 72;

  // 用于判断当前tab的状态
  @Input() tabShowing: boolean;
  @Input() endType: DialTestTarget;
  @Input() dialType: DialTestType;
  // 拨测失败标识
  @Input() isDialFailed = false;
  @Input() taskId: number;
  @Input() nodeId: number;
  @Input() projectName: string;
  @Input() taskName: string;
  @Input()
  set kpiData(val: IDialTestKpiRaw) {
    this.kpiDataStash = val;
    if (val == null) {
      return;
    }
    this.indexList = this.createIndexList(val);
    this.endInfoList = this.createEndInfoList(val, this.dialType, this.endType);
  }
  get kpiData(): IDialTestKpiRaw {
    return this.kpiDataStash;
  }

  indexList: IndexDataList = [];
  dialTestTarget = DialTestTarget;
  dialTestType = DialTestType;

  // 当 endType === DialTestTarget.Client 时顺序为：client --> server
  // 当 endType === DialTestTarget.Server 时顺序为：server --> client
  endInfoList: EndInfoList = [];

  private kpiDataStash: IDialTestKpiRaw;
  private readonly indexNameMap = new Map([
    [DialTestIndex.Latency, I18n.net_io.latency],
    [DialTestIndex.Loss, I18n.net_io.loss],
    [DialTestIndex.Jitter, I18n.net_io.jitter],
    [DialTestIndex.Bandwidth, I18n.net_io.bandwidth_1],
  ]);
  private readonly indexStatusMap = new Map<DialTestIndexStatus, any>([
    [
      DialTestIndexStatus.excellent,
      { text: I18n.net_io.excel, color: '#389e0d' },
    ],
    [DialTestIndexStatus.good, { text: I18n.net_io.good, color: '#096dd9' }],
    [DialTestIndexStatus.bad, { text: I18n.net_io.bad, color: '#E2253B' }],
    [
      DialTestIndexStatus.Unknown,
      { text: I18n.net_io.unknown, color: '#F5F5F5', textColor: '#CCCCCC' },
    ],
  ]);

  constructor(
    private tiModal: TiModalService,
    private themeServe: HyThemeService,
    private panelServe: WebviewPanelService
  ) {
    this.themeServe.getObservable().subscribe((theme) => {
      switch (theme) {
        case HyTheme.Light:
          this.indexStatusMap.set(DialTestIndexStatus.Unknown, {
            text: I18n.net_io.unknown,
            color: '#F5F5F5',
            textColor: '#CCCCCC',
          });
          break;
        case HyTheme.Dark:
        case HyTheme.Grey:
          this.indexStatusMap.set(DialTestIndexStatus.Unknown, {
            text: I18n.net_io.unknown,
            color: '#313131',
            textColor: '#616161',
          });
          break;
        default:
          break;
      }

      if (null != this.kpiData) {
        this.indexList = this.createIndexList(this.kpiData);
      }
    });
  }

  onConfInfoClick(content: any, confInfo: EndInfoList[0]['configInfo']) {
    this.tiModal.open(content, {
      id: 'confInfoModel',
      modalClass: 'medium-model-class',
      context: { ...confInfo },
    });
  }

  onEndInfoClick(ip: string) {
    const panelInfo: WebviewPanelInfo = {
      viewType: '',
      title: '',
      taskId: this.taskId,
      projectName: this.projectName,
      taskName: this.taskName,
      nodeIp: ip,
      toolType: 'diagnose',
    };
    this.panelServe.openPanel(panelInfo);
  }

  private createIndexList(kpi: IDialTestKpiRaw): IndexDataList {
    const idxList: IndexDataList = [];

    this.indexNameMap.forEach((name, key) => {
      if (null != kpi?.[key]) {
        const kpiStatus = kpi[key].status;
        const statusText = this.indexStatusMap.get(kpiStatus)?.text;
        const rectWidth =
          calcTextWidth(statusText, {
            fontFamily: 'PingFangSC-Regular, PingFang SC',
            fontSize: '12px',
          }) + 16;

        idxList.push({
          name,
          data: kpi[key].data || '?',
          status: statusText,
          color: this.indexStatusMap.get(kpiStatus)?.color,
          textColor: this.indexStatusMap.get(kpiStatus)?.textColor,
          rectWidth,
          rectOffset: Math.max(rectWidth - DialKpiSvgComponent.IDX_TEXT_LEN, 0),
        });
      }
    });

    return idxList;
  }

  private createEndInfoList(
    kpi: IDialTestKpiRaw,
    dialType: DialTestType,
    endType: DialTestTarget
  ): EndInfoList {
    let endList: EndInfoList;
    switch (dialType) {
      case DialTestType.Connection:
        {
          const addrWidth = calcTextWidth(kpi.sourceip, {
            fontFamily: 'PingFangSC-Regular, PingFang SC',
            fontSize: '12px',
          });
          endList = [
            {
              type: DialTestTarget.Client,
              ip: kpi.sourceip,
              text: I18n.net_io.src_send,
              configInfo: {
                router: kpi.route_info,
                arp: kpi.arp_info,
              },
              addrOffset: Math.max(
                addrWidth - DialKpiSvgComponent.ADDR_TEXT_LEN,
                0
              ),
            },
            {
              type: DialTestTarget.Server,
              ip: kpi.destip,
              text: I18n.net_io.server_end_get,
            },
          ];
        }
        break;
      case DialTestType.TCP:
      case DialTestType.UDP:
        {
          const clientAddr = kpi.clientPort
            ? kpi.clientIp + ':' + kpi.clientPort
            : kpi.clientIp;
          const clientAddrWidth = calcTextWidth(clientAddr, {
            fontFamily: 'PingFangSC-Regular, PingFang SC',
            fontSize: '12px',
          });
          const serverAddr = kpi.serverPort
            ? kpi.serverIp + ':' + kpi.serverPort
            : kpi.serverIp;
          const serverAddrWidth = calcTextWidth(serverAddr, {
            fontFamily: 'PingFangSC-Regular, PingFang SC',
            fontSize: '12px',
          });
          endList = [
            {
              type: DialTestTarget.Client,
              ip: kpi.clientIp,
              port: kpi.clientPort,
              text: I18n.net_io.client_end_send,
              addrOffset: Math.max(
                clientAddrWidth - DialKpiSvgComponent.ADDR_TEXT_LEN,
                0
              ),
            },
            {
              type: DialTestTarget.Server,
              ip: kpi.serverIp,
              port: kpi.serverPort,
              text: I18n.net_io.server_end_get,
              addrOffset: Math.max(
                serverAddrWidth - DialKpiSvgComponent.ADDR_TEXT_LEN,
                0
              ),
            },
          ];
          if (DialTestTarget.Server === endType) {
            endList = endList.reverse();
          }
        }
        break;
      default:
        break;
    }

    return endList;
  }
}
