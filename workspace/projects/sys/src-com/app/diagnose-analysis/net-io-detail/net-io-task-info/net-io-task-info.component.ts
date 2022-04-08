import { Component, Input } from '@angular/core';
import { I18n } from 'sys/locale';
import { HyTheme, HyThemeService } from 'hyper';
import { Observable } from 'rxjs';
import { IpProtocolType } from 'sys/src-com/app/diagnose-create/net-io/domain';

enum TransferDirectionEnum {
  send = 'send',
  receive = 'receive',
  full = 'full',
}

@Component({
  selector: 'app-net-io-task-info',
  templateUrl: './net-io-task-info.component.html',
  styleUrls: ['./net-io-task-info.component.scss'],
})
export class NetIoTaskInfoComponent {
  @Input()
  set taskConfig(val: any) {
    if (val == null) {
      return;
    }

    this.buildConfigInfo(val);
  }

  configInfo: any;
  showReason = false;
  i18n = I18n;
  showFooter: boolean;
  showMain: boolean;
  showPacketLoss: boolean;
  showNetCaught: boolean;
  theme$: Observable<HyTheme>;

  constructor(private themeServe: HyThemeService) {
    this.theme$ = this.themeServe.getObservable();
  }

  /**
   * 构造任务基本信息数据
   */
  private buildConfigInfo(taskConfig: any) {
    const taskParams = taskConfig.nodeConfig[0].taskParam;
    // 诊断功能
    const diagnoseFun = this.handleDiagnoseFun(taskConfig.functions);
    // 任务节点
    const taskNode =
      taskParams.load?.taskNodeIp ||
      taskParams.netCaught?.taskNodeIp ||
      taskParams.packetLoss?.taskNodeIp ||
      '';
    this.showFooter = taskParams.load ? true : false;
    this.showMain = taskParams.dialing ? true : false;
    this.showPacketLoss = taskParams.packetLoss ? true : false;
    this.showNetCaught = taskParams.netCaught ? true : false;

    let main: any[] = [];
    if (this.showMain) {
      for (const key of Object.keys(taskParams.dialing)) {
        switch (key) {
          case 'connection':
            main = [
              {
                label: I18n.configuration.scenario,
                children: [
                  {
                    name: I18n.network_diagnositic.taskParams.connection,
                    value: '',
                  },
                ],
              },
              {
                label: I18n.configuration.type,
                children: [
                  {
                    name: 'IPv' + taskParams.dialing[key].protocolType,
                    value: '',
                  },
                ],
              },
              {
                label: I18n.network_diagnositic.taskParams.node_info,
                children: this.handleConnecServerInfo(
                  taskParams.dialing[key].servers,
                  taskParams.dialing[key].protocolType
                ),
              },
              {
                label: I18n.network_diagnositic.advanced_param.message_length,
                children: [
                  {
                    name: taskParams.dialing[key].msgLen,
                    value: '',
                  },
                ],
              },
              {
                label: I18n.network_diagnositic.advanced_param.interval,
                children: [
                  {
                    name: taskParams.dialing[key].interval,
                    value: '',
                  },
                ],
              },
              {
                label: I18n.network_diagnositic.advanced_param.duration,
                children: [
                  {
                    name: taskParams.dialing[key].duration,
                    value: '',
                  },
                ],
              },
              {
                label:
                  I18n.network_diagnositic.advanced_param.sharding_strategy,
                children: [
                  {
                    name: taskParams.dialing[key].pathmtudis,
                    value: '',
                  },
                ],
              },
              {
                label: I18n.network_diagnositic.advanced_param.ttl,
                children: [
                  {
                    name: taskParams.dialing[key].ttl,
                    value: '',
                  },
                ],
              },
            ];
            break;
          case 'tcp':
            main = [
              {
                label: I18n.configuration.scenario,
                children: [
                  {
                    name: I18n.network_diagnositic.taskParams.tcp,
                    value: '',
                  },
                ],
              },
              {
                label: I18n.configuration.type,
                children: [
                  {
                    name: 'IPv' + taskParams.dialing[key].protocolType,
                    value: '',
                  },
                ],
              },
              {
                label: I18n.configuration.num,
                children: [
                  {
                    name: I18n.configuration.serverIp,
                    value: taskParams.dialing[key]?.server?.serverIp || '--',
                  },
                  {
                    name: I18n.configuration.serverBindIp,
                    value:
                      taskParams.dialing[key]?.server?.serverBindIp || '--',
                  },
                  {
                    name: I18n.configuration.listenPort,
                    value: taskParams.dialing[key]?.server?.listenPort || '--',
                  },
                  {
                    name: I18n.configuration.clientIp,
                    value: taskParams.dialing[key]?.client?.clientIp || '--',
                  },
                  {
                    name: I18n.configuration.clientBindIp,
                    value:
                      taskParams.dialing[key]?.client?.clientBindIp || '--',
                    show: !(taskParams.dialing[key].protocolType === IpProtocolType.IPv4)
                  },
                  {
                    name: I18n.configuration.client_net_port,
                    value:
                      taskParams.dialing[key]?.client?.sourceEth || '--',
                    show: !(taskParams.dialing[key].protocolType === IpProtocolType.IPv6)
                  },
                  {
                    name: I18n.configuration.connectPort,
                    value: taskParams.dialing[key]?.client?.connectPort || '--',
                  },
                ],
              },
              {
                label: I18n.configuration.high_num,
                children: [
                  {
                    name: I18n.configuration.serverCPUAffinity,
                    value:
                      taskParams.dialing[key]?.server?.serverCPUAffinity ||
                      '--',
                  },
                  {
                    name: I18n.configuration.clientCPUAffinity,
                    value:
                      taskParams.dialing[key]?.client?.clientCPUAffinity ||
                      '--',
                  },
                  {
                    name: I18n.configuration.interval,
                    value: taskParams.dialing[key]?.interval || '--',
                  },
                  {
                    name: I18n.configuration.bandwidth,
                    value: taskParams.dialing[key]?.client?.bandwidth || '--',
                  },
                  {
                    name: I18n.configuration.duration,
                    value: taskParams.dialing[key]?.client?.duration || '--',
                  },
                  {
                    name: I18n.configuration.msgLenAll,
                    value: taskParams.dialing[key]?.client?.msgLen || '--',
                  },
                  {
                    name: I18n.configuration.blockCount,
                    value: taskParams.dialing[key]?.client?.blockCount || '--',
                  },
                  {
                    name: I18n.configuration.msgLen,
                    value: taskParams.dialing[key]?.client?.packetSize || '--',
                  },
                  {
                    name: I18n.configuration.concurrency,
                    value: taskParams.dialing[key]?.client?.concurrency || '--',
                  },
                  {
                    name: I18n.configuration.packetSize,
                    value: taskParams.dialing[key]?.client?.windowSize || '--',
                  },
                  {
                    name: I18n.configuration.MSSLen,
                    value: taskParams.dialing[key]?.client?.MSSLen || '--',
                  },
                  {
                    name: I18n.configuration.zeroCopy,
                    value: taskParams.dialing[key]?.client?.zeroCopy || '--',
                  },
                ],
              },
            ];
            break;
          case 'udp':
            main = [
              {
                label: I18n.configuration.scenario,
                children: [
                  {
                    name: I18n.network_diagnositic.taskParams.udp,
                    value: '',
                  },
                ],
              },
              {
                label: I18n.configuration.type,
                children: [
                  {
                    name: 'IPv' + taskParams.dialing[key].protocolType,
                    value: '',
                  },
                ],
              },
              {
                label: I18n.configuration.num,
                children: [
                  {
                    name: I18n.configuration.serverIp,
                    value: taskParams.dialing[key]?.server?.serverIp || '--',
                  },
                  {
                    name: I18n.configuration.serverBindIp,
                    value:
                      taskParams.dialing[key]?.server?.serverBindIp || '--',
                  },
                  {
                    name: I18n.configuration.listenPort,
                    value: taskParams.dialing[key]?.server?.listenPort || '--',
                  },
                  {
                    name: I18n.configuration.clientIp,
                    value: taskParams.dialing[key]?.client?.clientIp || '--',
                  },
                  {
                    name: I18n.configuration.clientBindIp,
                    value:
                      taskParams.dialing[key]?.client?.clientBindIp || '--',
                    show: !(taskParams.dialing[key].protocolType === IpProtocolType.IPv4)
                  },
                  {
                    name: I18n.configuration.client_net_port,
                    value:
                      taskParams.dialing[key]?.client?.sourceEth || '--',
                    show: !(taskParams.dialing[key].protocolType === IpProtocolType.IPv6)
                  },
                  {
                    name: I18n.configuration.connectPort,
                    value: taskParams.dialing[key]?.client?.connectPort || '--',
                  },
                ],
              },
              {
                label: I18n.configuration.high_num,
                children: [
                  {
                    name: I18n.configuration.serverCPUAffinity,
                    value:
                      taskParams.dialing[key]?.server?.serverCPUAffinity ||
                      '--',
                  },
                  {
                    name: I18n.configuration.clientCPUAffinity,
                    value:
                      taskParams.dialing[key]?.client?.clientCPUAffinity ||
                      '--',
                  },
                  {
                    name: I18n.configuration.interval,
                    value: taskParams.dialing[key]?.interval || '--',
                  },
                  {
                    name: I18n.configuration.bandwidth,
                    value: taskParams.dialing[key]?.client?.bandwidth || '--',
                  },
                  {
                    name: I18n.configuration.duration,
                    value: taskParams.dialing[key]?.client?.duration || '--',
                  },
                  {
                    name: I18n.configuration.msgLenAll,
                    value: taskParams.dialing[key]?.client?.msgLen || '--',
                  },
                  {
                    name: I18n.configuration.blockCount,
                    value: taskParams.dialing[key]?.client?.blockCount || '--',
                  },
                  {
                    name: I18n.configuration.msgLen,
                    value: taskParams.dialing[key]?.client?.packetSize || '--',
                  },
                  {
                    name: I18n.configuration.concurrency,
                    value: taskParams.dialing[key]?.client?.concurrency || '--',
                  },
                  {
                    name: I18n.configuration.zeroCopy,
                    value: taskParams.dialing[key]?.client?.zeroCopy || '--',
                  },
                ],
              },
            ];
            break;
          default:
            break;
        }
      }
    }
    let footer: Array<any> = [];
    footer = [
      {
        label: I18n.network_diagnositic.taskParams.task_node,
        value: taskNode,
      },
      {
        label: I18n.configuration.loadDuration,
        value: taskParams.load?.loadDuration || '--',
      },
      {
        label: I18n.configuration.loadInterval,
        value: taskParams.load?.loadInterval || '--',
      },
    ];

    let packetLossData: any[] = [];
    if (this.showPacketLoss) {
      packetLossData = this.handlePacketLoss(taskParams.packetLoss);
    }

    let netCaughtData: any[] = [];
    if (this.showNetCaught) {
      netCaughtData = this.handleNetCaught(taskParams.netCaught);
    }

    const header = [
      {
        label: I18n.common_term_task_name,
        value: taskConfig?.taskName || '--',
      },
      {
        label: I18n.common_term_another_nodename,
        value: taskConfig.nodeConfig[0].nodeNickName || '--',
      },
      {
        label: I18n.common_term_task_status,
        value: (I18n as any)['status_' + taskConfig.nodeConfig[0].taskStatus],
        status: taskConfig.nodeConfig?.[0]?.taskStatus,
        statusCode: taskConfig.nodeConfig?.[0].statusCode || '--',
      },
      {
        label: I18n.configuration.obj,
        value: I18n.configuration.io,
      },
      {
        label: I18n.network_diagnositic.taskParams.diagnositic_scen,
        value: diagnoseFun.join(','),
      },
    ];

    if (taskNode) {
      packetLossData.unshift({
        label: I18n.network_diagnositic.taskParams.task_node,
        children: [
          {
            name: taskNode,
            value: '',
          },
        ],
      });
      netCaughtData.unshift({
        label: I18n.network_diagnositic.taskParams.task_node,
        children: [
          {
            name: taskNode,
            value: '',
          },
        ],
      });
    }
    this.configInfo = {
      header,
      main,
      footer,
      packetLossData,
      netCaughtData,
    };
  }

  /**
   * 对诊断功能参数做处理
   * @param funArr 诊断功能数据
   */
  private handleDiagnoseFun(funArr: string[]) {
    return funArr.map((funName: string) => this.transformLanguage(funName));
  }

  /**
   * 将后端返回的诊断功能数据转换为 对应的中英文
   * @param funName 功能名
   */
  private transformLanguage(funName: string) {
    switch (funName) {
      case 'packetLoss':
        return I18n.network_diagnositic.taskParams.packet_loss;
      case 'netCaught':
        return I18n.network_diagnositic.taskParams.network_capture;
      case 'load':
        return I18n.network_diagnositic.taskParams.network_load;
      case 'connection':
        return I18n.network_diagnositic.taskParams.network_dial_test;
      default:
        return I18n.network_diagnositic.taskParams.network_dial_test;
    }
  }

  /**
   * 对丢包 任务信息做处理
   * @param packetLoss 丢包相关信息
   */
  private handlePacketLoss(packetLoss: any) {
    let packetLossArr = [];

    packetLossArr = [
      {
        label: I18n.net_io.filter_cond,
        children: [
          {
            name: I18n.nodeManagement.nodeIp,
            value: packetLoss?.ipAddress || '--',
          },
          {
            name: I18n.sys_summary.cpupackage_tabel.networkName,
            value: packetLoss?.ethName || '--',
          },
        ],
      },
      {
        label: I18n.net_io.collect_time_text_1,
        children: [
          {
            name: packetLoss.collectDuration,
            value: '',
          },
        ],
      },
      {
        label: I18n.net_io.collect_core_stack,
        children: [
          {
            name: packetLoss.isCollectKernel
              ? I18n.sys_cof.sum.open
              : I18n.sys_cof.sum.close,
            value: '',
          },
        ],
      },
    ];
    // 采集内核丢包调用栈 开启
    if (packetLoss.isCollectKernel) {
      packetLossArr.push(
        {
          label: I18n.net_io.simple_freq_text,
          children: [
            {
              name: packetLoss?.interval || '--',
              value: '',
            },
          ],
        },
        {
          label: I18n.mission_create.collection_size,
          children: [
            {
              name: packetLoss?.fileSize || '--',
              value: '',
            },
          ],
        }
      );
    }

    return packetLossArr;
  }

  /**
   * 对抓包 任务信息做处理
   * @param packetLoss 丢包相关信息
   */
  private handleNetCaught(netCaught: any) {
    let netCaughtArr = [];

    netCaughtArr = [
      {
        label: I18n.net_io.caught_eth,
        children: [
          {
            name: netCaught.ethName || '--',
            value: '',
          },
        ],
      },
      {
        label: I18n.net_io.filter_cond,
        children: [
          {
            name: I18n.configuration.type,
            value: 'IPv' + netCaught.protocolType,
          },
          {
            name: I18n.net_io.protocol,
            value: netCaught?.protocolFilter?.join(',') || '--',
          },
          {
            name: 'IP1',
            value: netCaught?.IP1 || '--',
          },
          {
            name: I18n.net_capture_loss.capture.port_1,
            value: netCaught?.port1 || '--',
          },
          {
            name: 'IP2',
            value: netCaught?.IP2 || '--',
          },
          {
            name: I18n.net_capture_loss.capture.port_2,
            value: netCaught?.port2 || '--',
          },
          {
            name: I18n.net_io.transfer_direction,
            value: this.handleTransferDirection(netCaught.direction),
          },
        ],
      },
      {
        label:
          I18n.net_io.caught_time_text +
          I18n.common_term_left_parentheses +
          's' +
          I18n.common_term_right_parentheses,
        children: [
          {
            name: netCaught.caughtDuration,
            value: '',
          },
        ],
      },
      {
        label: I18n.net_io.caught_num,
        children: [
          {
            name: netCaught.blockCount,
            value: '',
          },
        ],
      },
      {
        label: I18n.net_io.file_size_text,
        children: [
          {
            name: netCaught.fileSize,
            value: '',
          },
        ],
      },
      {
        label: I18n.net_io.file_num,
        children: [
          {
            name: netCaught.fileNumber,
            value: '',
          },
        ],
      },
    ];

    return netCaughtArr;
  }
  // 对传输方向参数转化
  private handleTransferDirection(str: TransferDirectionEnum) {
    switch (str) {
      case TransferDirectionEnum.send:
        return I18n.net_io.send;
      case TransferDirectionEnum.receive:
        return I18n.net_io.receive;
      case TransferDirectionEnum.full:
        return I18n.net_io.bothway;
      default:
        return '--';
    }
  }

  // 处理连通性拨测节点信息参数
  private handleConnecServerInfo(serversInfo: any, type: IpProtocolType) {
    const serverInfo: any[] = [];
    for (const item of serversInfo) {
      // show为false的时候显示
      serverInfo.push(
        {
          name: I18n.network_diagnositic.taskParams.task_node,
          value: item.serverIp || '--',
        },
        {
          name: I18n.network_diagnositic.taskParams.source_ip,
          value: item?.source_ip || '--',
          show: !(type === IpProtocolType.IPv4),
        },
        {
          name: I18n.network_diagnositic.taskParams.source_network_port,
          value: item?.sourceEth || '--',
          show: !(type === IpProtocolType.IPv6),
        },
        {
          name: I18n.network_diagnositic.taskParams.target_server_ip,
          value: item.destinationIp || '--',
        }
      );
    }
    return serverInfo;
  }
}
