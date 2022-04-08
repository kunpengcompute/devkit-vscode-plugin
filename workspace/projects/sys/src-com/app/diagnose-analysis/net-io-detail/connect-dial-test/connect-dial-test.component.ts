import { OnInit, Component, Input } from '@angular/core';
import {
  DialTestTarget,
  DialTestType,
  IDialTestRaw,
  IDialKpi,
} from '../domain';
import { NetIoService } from '../service/net-io.service';
import { TaskStatus } from 'sys/src-com/app/domain';
import { NetioTaskConfig } from '../domain';

type IDialTestKpiRaw = IDialKpi & {
  route_info?: IDialTestRaw['connection']['route_info']; // 连通性特有
  arp_info?: IDialTestRaw['connection']['arp_info']; // 连通性特有
};
@Component({
  selector: 'app-connect-dial-test',
  templateUrl: './connect-dial-test.component.html',
  styleUrls: ['./connect-dial-test.component.scss'],
})
export class ConnectDialTestComponent implements OnInit {
  @Input() tabShowing: boolean; // 用于判断当前tab的状态
  @Input() isActive: boolean;
  @Input() taskId: number;
  @Input() nodeId: number;
  @Input() nodeStatus: TaskStatus;
  @Input() taskConfig: NetioTaskConfig;

  // kpi 数据
  kpiData: IDialTestKpiRaw;
  // 拨测统计数据
  dailTestStat: IDialTestRaw['connection']['ping'];
  // 路由信息
  routerInfo: IDialTestRaw['connection']['traceroute'];
  // RTT
  rttData: IDialTestRaw['connection']['RTT'];
  // 当前拨测类型
  currDialTestType = DialTestType.Connection;
  // 当前的端类型
  currEndTarget = DialTestTarget.Client;
  taskStatusEnum = TaskStatus;

  constructor(private netIoServe: NetIoService) {}

  async ngOnInit() {
    if (TaskStatus.Failed === this.nodeStatus) {
      const servers = this.taskConfig.dialing.connection.servers;
      const nodeIp = this.taskConfig.nodeConfig[0].nodeIp;
      const server = servers.find((item) => item.serverIp === nodeIp);
      this.kpiData = {
        sourceip: server.serverIp,
        destip: server.destinationIp,
      };
      return;
    }

    try {
      const resData = await this.netIoServe.pullDialingData(
        this.taskId,
        this.nodeId
      );
      const connectDataRaw = resData.data?.Dialing?.connection;
      if (null == connectDataRaw) {
        // 注意： 如果没有数据，并不是任务分析失败，而是后端原因
        return;
      }

      this.dailTestStat = connectDataRaw.ping;
      this.routerInfo = connectDataRaw.traceroute;
      this.rttData = connectDataRaw.RTT;
      this.kpiData = {
        ...connectDataRaw.KPI,
        route_info: connectDataRaw.route_info,
        arp_info: connectDataRaw.arp_info,
      };
    } catch (err) {}
  }
}
