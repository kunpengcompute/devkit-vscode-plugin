import { Component, Input, AfterViewInit } from '@angular/core';
import { NetIoService } from './service/net-io.service';
import { I18n } from 'sys/locale';
import { TaskStatus } from 'sys/src-com/app/domain';
import { NetioTaskConfig } from './domain';

type DailFunction =
  | 'connection'
  | 'load'
  | 'tcp'
  | 'udp'
  | 'packetLoss'
  | 'netCaught'
  | 'config';

type CommonTab = {
  [key in DailFunction]: {
    order: number;
    title: string;
    active: boolean;
    disable: boolean;
    show: boolean;
  };
};

@Component({
  selector: 'app-net-io-detail',
  templateUrl: './net-io-detail.component.html',
  styleUrls: ['./net-io-detail.component.scss'],
})
export class NetIoDetailComponent implements AfterViewInit {
  @Input() tabShowing: boolean; // 用于判断当前tab的状态
  @Input() projectName: string;
  @Input() taskName: string;
  @Input() status: string;
  @Input() taskId: number;
  @Input() nodeId: number;

  tabs: CommonTab;
  taskConfig: NetioTaskConfig;
  currNodeStatus: TaskStatus;

  constructor(private netIoServe: NetIoService) {
    this.tabs = this.createTabs([]);
  }

  async ngAfterViewInit() {
    try {
      const resConf = await this.netIoServe.pullTaskConfInfo(
        this.taskId,
        this.nodeId
      );

      this.taskConfig = resConf?.data;

      // 在ide中，父组件传参有问题，projectName 中没有数据
      this.projectName = this.taskConfig.projectName;

      const functions = (this.taskConfig?.functions ?? []) as DailFunction[];
      this.currNodeStatus = this.taskConfig?.nodeConfig?.find(
        (item: any) => item.nodeId === this.nodeId
      ).taskStatus as TaskStatus;

      this.tabs = this.createTabs(functions, this.currNodeStatus);
    } catch (error) {
      return;
    }
  }

  private createTabs(
    funcs: DailFunction[],
    nodeStatus?: TaskStatus
  ): CommonTab {
    const tabList = {
      connection: {
        order: 0,
        title: I18n.net_io.dialing_connection,
        active: false,
        disable: false,
        show:
          funcs.includes('connection') &&
          (TaskStatus.Failed === nodeStatus ||
            TaskStatus.Completed === nodeStatus),
      },
      tcp: {
        order: 1,
        title: I18n.net_io.dialing_tcp,
        active: false,
        disable: false,
        show:
          funcs.includes('tcp') &&
          (TaskStatus.Failed === nodeStatus ||
            TaskStatus.Completed === nodeStatus),
      },
      udp: {
        order: 2,
        title: I18n.net_io.dialing_udp,
        active: false,
        disable: false,
        show:
          funcs.includes('udp') &&
          (TaskStatus.Failed === nodeStatus ||
            TaskStatus.Completed === nodeStatus),
      },
      load: {
        order: 3,
        title: I18n.net_io.load,
        active: false,
        disable: false,
        show: funcs.includes('load') && TaskStatus.Completed === nodeStatus,
      },
      packetLoss: {
        order: 4,
        title: I18n.network_diagnositic.taskParams.packet_loss,
        active: false,
        disable: false,
        show:
          funcs.includes('packetLoss') && TaskStatus.Completed === nodeStatus,
      },
      netCaught: {
        order: 5,
        title: I18n.network_diagnositic.taskParams.network_capture,
        active: false,
        disable: false,
        show:
          funcs.includes('netCaught') && TaskStatus.Completed === nodeStatus,
      },
      config: {
        order: 6,
        title: I18n.common_term_task_tab_congration,
        active: false,
        disable: false,
        show: true,
      },
    };

    // 选中第一个tab
    const tabValueList = Object.values(tabList)
      .filter((tab) => tab.show)
      .sort((pre, next) => pre.order - next.order);
    if (tabValueList?.[0]) {
      tabValueList[0].active = true;
    }

    return tabList;
  }
}
