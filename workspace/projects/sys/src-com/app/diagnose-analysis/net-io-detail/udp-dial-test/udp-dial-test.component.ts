import { Component, Input, OnInit } from '@angular/core';
import {
  IDialTestRaw,
  DialTestTarget,
  DialTestType,
  IDialKpi,
} from '../domain';
import { NetIoService } from '../service/net-io.service';
import { Cat } from 'hyper';
import { TaskStatus } from 'sys/src-com/app/domain';
import { NetioTaskConfig } from '../domain';

@Component({
  selector: 'app-udp-dial-test',
  templateUrl: './udp-dial-test.component.html',
  styleUrls: ['./udp-dial-test.component.scss'],
})
export class UdpDialTestComponent implements OnInit {
  @Input() tabShowing: boolean; // 用于判断当前tab的状态
  @Input() isActive: boolean;
  @Input() taskId: number;
  @Input() nodeId: number;
  @Input() projectName: string;
  @Input() taskName: string;
  @Input() nodeStatus: TaskStatus;
  @Input() taskConfig: NetioTaskConfig;

  // 连接信息
  connectInfo: IDialTestRaw['udp']['CONNECTION'];
  // kpi 数据
  kpiData: IDialKpi;
  // 拨测统计数据
  udpInfo: IDialTestRaw['udp'];
  // 端类型
  endType: DialTestTarget;
  // 拨测类型
  dialType: DialTestType = DialTestType.UDP;
  // isEmpty 函数
  isEmpty = Cat.isEmpty;
  taskStatusEnum = TaskStatus;

  constructor(private netIoServe: NetIoService) {}

  async ngOnInit() {
    if (TaskStatus.Failed === this.nodeStatus) {
      const nodeIp = this.taskConfig.nodeConfig[0].nodeIp;
      const { client, server } = this.taskConfig.dialing.udp;
      this.kpiData = {
        clientIp: client.clientIp,
        clientPort: client.connectPort,
        serverIp: server.serverIp,
        serverPort: server.listenPort,
      };
      this.endType =
        nodeIp === client.clientIp
          ? DialTestTarget.Client
          : DialTestTarget.Server;
      return;
    }

    try {
      const resData = await this.netIoServe.pullDialingData(
        this.taskId,
        this.nodeId
      );
      const udpDataRaw = resData.data?.Dialing?.udp;
      if (null == udpDataRaw) {
        // 注意： 如果没有数据，并不是任务分析失败，而是后端原因
        return;
      }

      this.udpInfo = udpDataRaw;
      this.kpiData = udpDataRaw.KPI;
      this.connectInfo = udpDataRaw.CONNECTION;
      this.endType = this.udpInfo.STATISTICIAL?.client
        ? DialTestTarget.Client
        : DialTestTarget.Server;
    } catch (err) {}
  }
}
