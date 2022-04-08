import { Component, Input, OnInit } from '@angular/core';
import {
  IDialTestRaw,
  DialTestTarget,
  DialTestType,
  IDialKpi,
} from '../domain';
import { Cat } from 'hyper';
import { NetIoService } from '../service/net-io.service';
import { TaskStatus } from 'sys/src-com/app/domain';
import { NetioTaskConfig } from '../domain';

@Component({
  selector: 'app-tcp-dial-test',
  templateUrl: './tcp-dial-test.component.html',
  styleUrls: ['./tcp-dial-test.component.scss'],
})
export class TcpDialTestComponent implements OnInit {
  @Input() tabShowing: boolean; // 用于判断当前tab的状态
  @Input() isActive: boolean;
  @Input() taskId: number;
  @Input() nodeId: number;
  @Input() projectName: string;
  @Input() taskName: string;
  @Input() nodeStatus: TaskStatus;
  @Input() taskConfig: NetioTaskConfig;

  // kpi 数据
  kpiData: IDialKpi;
  // 拨测统计数据
  tcpInfo: IDialTestRaw['tcp'];
  // 连接信息
  connctInfo: IDialTestRaw['tcp']['CONNECTION'];
  // 端类型
  endType: DialTestTarget;
  // 拨测类型
  dialType: DialTestType = DialTestType.TCP;
  // isEmpty 函数
  isEmpty = Cat.isEmpty;
  taskStatusEnum = TaskStatus;

  constructor(private netIoServe: NetIoService) {}

  async ngOnInit() {
    if (TaskStatus.Failed === this.nodeStatus) {
      const nodeIp = this.taskConfig.nodeConfig[0].nodeIp;
      const { client, server } = this.taskConfig.dialing.tcp;
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
      const tcpDataRaw = resData.data?.Dialing?.tcp;
      if (null == tcpDataRaw) {
        // 注意： 如果没有数据，并不是任务分析失败，而是后端原因
        return;
      }

      this.tcpInfo = tcpDataRaw;
      this.kpiData = tcpDataRaw.KPI;
      this.connctInfo = tcpDataRaw.CONNECTION;
      this.endType = tcpDataRaw.STATISTICIAL?.client
        ? DialTestTarget.Client
        : DialTestTarget.Server;
    } catch (err) {}
  }
}
