import { Component, Input, OnInit } from '@angular/core';
import { TiTableColumns, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';
import { NetIORow } from '../../domain';
import { I18n } from 'sys/locale';

@Component({
  selector: 'app-load-cpu-usage',
  templateUrl: './load-cpu-usage.component.html',
  styleUrls: ['./load-cpu-usage.component.scss']
})
export class LoadCpuUsageComponent implements OnInit {

  @Input() coreData: string[][];
  @Input() numaData: string[][];

  public cpuOption: Array<any>;
  public cpuSelected: { label: string; };

  public displayed: Array<TiTableRowData> = [];
  public srcData: TiTableSrcData;
  public columns: Array<TiTableColumns> = [];

  public newCoreData: Array<NetIORow> = []; // 存储处理好的 core 数据
  public newNumaData: Array<NetIORow> = []; // 存储处理好的 NUMA 数据

  // 分页数据
  public currentPage = 1;
  public totalNumber: number;
  public pageSize: { options: Array<number>, size: number } = {
    options: [10, 20, 40, 80, 100],
    size: 10
  };

  public i18n: any;

  constructor() {}

  ngOnInit(): void {
    this.cpuOption = [
      { label: 'CPU core', index: 0 },
      { label: 'NUMA NODE', index: 1 }
    ];
    this.cpuSelected = this.cpuOption[0];

    this.srcData = {
      data: [],
      state: {
        searched: false,
        sorted: false,
        paginated: false
      }
    };
    this.getCPUCoreData();
  }

  // 请求 CPU core 表格数据
  private async getCPUCoreData() {
    this.initColumns(0);
    if (this.newCoreData.length) {
      this.srcData.data = this.newCoreData;
      this.totalNumber = this.newCoreData.length;
      return;
    }
    this.srcData.data
      = this.newCoreData = this.coreData.map((data: Array<string>) => this.handelUsageData(data));
    this.totalNumber = this.coreData.length;
  }

  // 请求 NUMA NODE 表格数据
  private async getNodeData() {
    this.initColumns(1);
    if (this.newNumaData.length) {
      this.srcData.data = this.newNumaData.map((data: NetIORow) => Object.assign(data, { showDetails: false }));
      this.totalNumber = this.newNumaData.length;
      return;
    }
    this.srcData.data
      = this.newNumaData = this.numaData.map((data: Array<string>) => this.handelUsageData(data));
    this.totalNumber = this.newNumaData.length;
  }

  /**
   * 对后端传回的表格数据作处理
   * @param usageData 数据
   * @param bool 是否显示下拉箭头
   */
  private handelUsageData(usageData: Array<string>) {
    const [ cpuCore, user, nice, system, iowait, irq, soft, idle ] = usageData;

    return {
      cpuCore,
      user,
      nice,
      system,
      iowait,
      irq,
      soft,
      idle
    };
  }

  // 初始化 columns
  private initColumns(index: number) {
    const columns: Array<TiTableColumns> = [
      { title: '%user', sortKey: 'user', showIcon: true, tip: I18n.net_io.tip.user_tip },
      { title: '%nice', sortKey: 'nice', showIcon: true, tip: I18n.net_io.tip.nice_tip },
      { title: '%system', sortKey: 'system', showIcon: true, tip: I18n.net_io.tip.system_tip },
      { title: '%iowait', sortKey: 'iowait', showIcon: true, tip: I18n.net_io.tip.iowait_tip },
      { title: '%irq', sortKey: 'irq', showIcon: true, tip: I18n.net_io.tip.irq_tip },
      { title: '%soft', sortKey: 'soft', showIcon: true, tip: I18n.net_io.tip.soft_tip },
      { title: '%idle', sortKey: 'idle', showIcon: true, tip: I18n.net_io.tip.idle_tip }
    ];
    if (!index) {
      columns.unshift({ title: 'CPU core' });
    } else {
      columns.unshift({ title: 'NUMA NODE' });
    }
    this.columns = columns;
  }

  // 展开详情
  public beforeToggle(row: TiTableRowData): void {
    row.showDetails = !row.showDetails;
    this.srcData.data = this.handleSubData(this.newNumaData);
  }

  // 处理展开数据
  private handleSubData(tableData: NetIORow[]) {
    const newData = [] as NetIORow[];
    function addData(row: NetIORow[]) {
      row.forEach(child => {
        newData.push(child);
        if (child.showDetails && child.children?.length) {
          addData(child.children);
        }
      });
    }
    addData(tableData);

    return newData;
  }

  /**
   * 下拉选择框改变
   * @param selectedData 选择的数据
   */
  public cpuSelectedChange(selectedData: { index: number; }) {
    selectedData.index ? this.getNodeData() : this.getCPUCoreData();
  }

  // 对表格进行排序
  public compareFn(a: any, b: any, predicate: string) {
    return Number(a[predicate]) - Number(b[predicate]);
  }
}
