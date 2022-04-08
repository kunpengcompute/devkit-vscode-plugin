import { Component, Input, OnInit } from '@angular/core';
import {
  ConsumeIOTableData, HartInterSingleCPUTableData, HartInterSingleTableData,
  INetLoadRawData, NetIODetailList, NetPortTableData, NetworkBindRowInfo
} from '../domain';
import { NetIoService } from '../service/net-io.service';
import { I18n } from 'sys/locale';

@Component({
  selector: 'app-net-port-display',
  templateUrl: './net-port-display.component.html',
  styleUrls: ['./net-port-display.component.scss']
})
export class NetPortDisplayComponent implements OnInit {
  @Input() set message(msg: {
    bindName: string;
    nodeId: number;
    taskId: number;
    title: string;
  }) {
    this.title = msg.title;
    this.bindName = msg.bindName;
    this.taskId = msg.taskId;
    this.nodeId = msg.nodeId;
  }

  title: string;
  bindName: string;
  taskId: number;
  nodeId: number;

  public netDisplayData: INetLoadRawData;
  public detailList: NetIODetailList[] = [
    { title: I18n.net_io.port_display_list[0], isActive: true },
    { title: I18n.net_io.port_display_list[1], isActive: false },
    { title: I18n.net_io.port_display_list[2], isActive: false }
  ];

  public portInfoData: NetPortTableData[] | [];
  public bondInfoData: NetworkBindRowInfo[] | [];

  public singleIrqData: HartInterSingleTableData[] | [];
  public singleIrqCPUData: HartInterSingleCPUTableData[] | [];

  ipiInfo: INetLoadRawData['rps_ipi_info'];

  public consumeIOData: ConsumeIOTableData | { };
  public numaNum = 4;

  constructor(
    private netIoService: NetIoService
  ) { }

  async ngOnInit() {

    let newBindName = [this.bindName];
    if (this.bindName.includes(',')) {
      const bindArr = this.bindName.split(',');
      newBindName = [bindArr[0], bindArr[1]];
    }
    const loadDataRaw  = await this.netIoService.pullLoadData(this.taskId, this.nodeId);
    this.netDisplayData = loadDataRaw.data.Load;
    this.netIoService.numaNum = this.netDisplayData.context_info?.numa_num;
    this.portInfoData = this.filterPortInfoData(newBindName);
    this.bondInfoData = this.filterBondInfoData();

    this.singleIrqData = this.filterSingleIrqData(newBindName);
    this.singleIrqCPUData = this.filterSingleIrqCPUData(newBindName);

    this.ipiInfo = this.netDisplayData.rps_ipi_info;

    this.consumeIOData = this.filterConsumeIOData();
  }

  // 筛选对应的网口信息
  private filterPortInfoData(bindName: string[]): NetPortTableData[] | [] {
    const dataArr: NetPortTableData[] = [];
    bindName.forEach((name: string) => {
      const configInfo = this.netDisplayData.iface_config_info[name];
      if (configInfo) {
        dataArr.push({
          [name]: configInfo
        });
      }
    });
    return dataArr;
  }

  // 筛选对应的 网络绑定信息
  private filterBondInfoData(): NetworkBindRowInfo[] | [] {
    const newArr: any[] = [];
    const dict = this.netDisplayData.bond_info_dict;
    Object.keys(dict).forEach((key: string) => {
      if (key === this.title) {
        newArr.push(dict[key]);
      }
    });
    return newArr;
  }

  // 筛选对应的 网络IO 进程信息
  private filterConsumeIOData(): ConsumeIOTableData | [] {
    const netstat = this.netDisplayData.netstat_info;
    return netstat[this.title]
      ? { [this.title]: netstat[this.title] }
      : { };
  }

  // 筛选 当前网口硬中断信息
  private filterSingleIrqData(bindName: string[]) {
    const dataArr: HartInterSingleTableData[] = [];
    const affinityInfo = this.netDisplayData.eth_irq_affinity_info;

    bindName.forEach((name: string) => {
      if (affinityInfo.hasOwnProperty(name)) {
        dataArr.push(affinityInfo[name]);
      }
    });
    return dataArr;
  }

  // 筛选 当前网口硬中断 cpu 信息
  private filterSingleIrqCPUData(bindName: string[]) {
    const dataArr: HartInterSingleCPUTableData[] = [];
    const irqInfo = this.netDisplayData.eth_cpu_irq_info;

    bindName.forEach((name: string) => {
      if (irqInfo.hasOwnProperty(name)) {
        dataArr.push(irqInfo[name]);
      }
    });
    return dataArr;
  }

  // 显示对应列表详情
  public showDetail(detail: NetIODetailList) {
    detail.isActive = !detail.isActive;
  }

}
