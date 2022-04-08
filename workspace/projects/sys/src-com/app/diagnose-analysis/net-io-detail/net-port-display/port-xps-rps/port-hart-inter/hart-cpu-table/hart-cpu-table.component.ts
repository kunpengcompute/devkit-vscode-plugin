import { Component, Input, OnChanges, OnInit, ViewEncapsulation } from '@angular/core';
import { TiModalService, TiTableColumns, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';
import { HartInterSingleCPUTableData, INetLoadRawData } from '../../../../domain';
import { AffinityMaskDict, HartInterCPUTable } from '../domain';
import { I18n } from 'sys/locale';

type CpuModalInfo = {
  [key in string]: AffinityMaskDict;
};
@Component({
  selector: 'app-hart-cpu-table',
  templateUrl: './hart-cpu-table.component.html',
  styleUrls: ['./hart-cpu-table.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class HartCpuTableComponent implements OnInit, OnChanges {

  @Input() ipiInfo: INetLoadRawData['rps_ipi_info'];
  @Input() hartCPUData: HartInterSingleCPUTableData[];

  public displayed: Array<TiTableRowData> = [];
  public srcData: TiTableSrcData;
  public columns: Array<TiTableColumns> = [];

  // 分页数据
  public currentPage = 1;
  public totalNumber: number;
  public pageSize: { options: Array<number>, size: number } = {
    options: [10, 20, 40, 80, 100],
    size: 10
  };

  public i18n: any;

  constructor(private tiModal: TiModalService) {}

  ngOnInit(): void {
    this.srcData = {
      data: [],
      state: {
        searched: false,
        sorted: false,
        paginated: false
      }
    };

    this.initColumns();
    this.initSrcData();
  }

  ngOnChanges(): void {
    if (this.srcData?.data) {
      this.initSrcData();
    }
  }

  // 初始化表格数据
  private initSrcData() {
    this.srcData.data = !this.hartCPUData.length
      ? []
      : this.handleHartCPUData(this.hartCPUData);
    this.totalNumber = this.srcData.data.length;
  }

  // 初始化 columns
  private initColumns() {
    const columns: Array<TiTableColumns> = [
      { title: I18n.sys_res.core },
      { title: I18n.net_io.xps_rps.hard_info.num_hard_inter, sortKey: 'irqNum' },
      { title: I18n.net_io.xps_rps.hard_info.xps_hard_inter, sortKey: 'xpsNum' },
      { title: I18n.net_io.xps_rps.hard_info.rps_hard_inter, sortKey: 'rpsNum' },
    ];
    this.columns = columns;
  }

  /**
   * 对表格数据进行处理
   * @param hartCPUData CPU核表格数据
   */
   private handleHartCPUData(hartCPUData: HartInterSingleCPUTableData[]) {
    const newData: HartInterCPUTable[][] = [];

    hartCPUData.forEach((data: HartInterSingleCPUTableData, index: number) => {
      Object.keys(data).forEach((key: string) => {
        const {
          irq_affinity_mask_num, irq_affinity_mask_dict,
          xps_affinity_mask_num, xps_affinity_mask_dict,
          rps_affinity_mask_num, rps_affinity_mask_dict
        } = data[key];

        if (!newData[index]?.length) {
          newData[index] = [];
        }
        newData[index].push({
          cpu: key,
          irqNum: irq_affinity_mask_num,
          iqrDict: irq_affinity_mask_dict,
          xpsNum: xps_affinity_mask_num,
          xpsDict: xps_affinity_mask_dict,
          rpsNum: rps_affinity_mask_num,
          rpsDict: rps_affinity_mask_dict
        });
      });
    });

    return this.mergeCPUData(newData);
  }

  /**
   * 对于 一个 IFACE 绑定多网口的情况作处理
   * @param data CPU核数据
   */
  private mergeCPUData(CPUData: HartInterCPUTable[][]) {
    const newCPUData: HartInterCPUTable[] = [];

    CPUData[0].forEach((data: HartInterCPUTable, index: number) => {
      newCPUData[index] = data;

      for (let i = 1, len = CPUData.length; i < len; i++) {
        const { iqrDict, irqNum, rpsDict, rpsNum, xpsDict, xpsNum } = newCPUData[index];

        newCPUData[index].iqrDict = Object.assign(iqrDict, CPUData[i][index].iqrDict);
        newCPUData[index].irqNum = irqNum + CPUData[i][index].irqNum;

        newCPUData[index].rpsDict = Object.assign(rpsDict, CPUData[i][index].rpsDict);
        newCPUData[index].rpsNum = rpsNum + CPUData[i][index].rpsNum;

        newCPUData[index].xpsDict = Object.assign(xpsDict, CPUData[i][index].xpsDict);
        newCPUData[index].xpsNum = xpsNum + CPUData[i][index].xpsNum;
      }
    });

    return newCPUData;
  }

  /**
   * 打开硬中断绑核弹框
   * @param row 点击行详情
   * @param modal 弹框组件
   * @param type 选择类型
   */
  public openCpuModal(row: HartInterCPUTable, modal: any, type: string) {
    const { title, num, dataList, text } = this.handleType(row, type);

    if (num === 0) { return; }
    const newDataJSON = this.addIrqcountList(dataList, Number(row.cpu));

    this.tiModal.open(modal, {
      modalClass: 'irq-modal cpu-modal',
      context: {
        ipiInfo: this.ipiInfo,
        title,
        cpu: row.cpu,
        num,
        dataList: newDataJSON,
        text
      }
    });
  }

  /**
   * 对不同选择类型进行处理
   * @param row 点击行详情
   * @param type 选择类型
   */
  private handleType(row: HartInterCPUTable, type: string) {
    let title = '';
    let text = '';
    let num = 0;
    let dataList = {};
    switch (type) {
      case 'irq':
        title = I18n.popInfo.Irq;
        text = I18n.net_io.xps_rps.hard_info.num_hard_inter;
        num = row.irqNum;
        dataList = row.iqrDict;
        break;
      case 'xps':
        title = I18n.popInfo.Xps_core;
        text = I18n.popInfo.Xps_num;
        num = row.xpsNum;
        dataList = row.xpsDict;
        break;
      case 'rps':
        title = I18n.popInfo.Rps_core;
        text = I18n.popInfo.Rps_num;
        num = row.rpsNum;
        dataList = row.rpsDict;
        break;
    }

    return { title, num, dataList, text };
  }

  /**
   * 为每个绑核信息中增加 中断频率
   * @param dataJSON 绑核数据
   * @param cpuNum 具体 cpu 核
   */
  private addIrqcountList(dataJSON: CpuModalInfo, cpuNum: number) {
    const newDataJSON = {};

    Object.keys(dataJSON).forEach(key => {
      const len = (dataJSON[key].irq_affinity_mask as any).split(',').join('').length * 4;
      const irqCountList = new Array(len).fill(0);
      irqCountList[cpuNum] = dataJSON[key].irq_count;
      (dataJSON[key] as any).irq_count_list = irqCountList;

      Object.assign(newDataJSON, {
        [key]: dataJSON[key]
      });
    });

    return newDataJSON;
  }

}
