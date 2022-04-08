import { Component, Input, OnInit, ViewChildren } from '@angular/core';
import { TiModalService, TiTableColumns, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';
import { I18n } from 'sys/locale';
import { CpuUtilization, QueryTypeEnum, CoreDetail } from '../../domain';
import { HttpService } from 'sys/src-com/app/service';
import { PopDirective } from 'sys/src-com/app/shared/directives/pop/pop.directive';
@Component({
  selector: 'app-cpu-usage-table',
  templateUrl: './cpu-usage-table.component.html',
  styleUrls: ['./cpu-usage-table.component.scss']
})
export class CpuUsageTableComponent implements OnInit {
  @Input()
  set cpuCoreData(value: CpuUtilization[]) {
    if (value) {
      this.coreData = value;
      this.getCPUCoreData();
    }
  }
  @Input() numaCoreData: CpuUtilization[];
  @Input() taskId: any;
  @Input() nodeid: any;
  /** 搜索组件 */
  @ViewChildren('processSearchPop') processSearchPop: any;
  public searchWords: Array<any> = [];
  // 设置过滤字段
  public searchKeys: Array<string> = [];
  public searchWordsSave: { [key: string]: string } = {};
  public cpuOption: Array<any>;
  public cpuSelected: { label: string; };
  constructor(
    private http: HttpService,
    private tiModal: TiModalService,
  ) { }
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
  public coreData: CpuUtilization[];
  public numaData: CpuUtilization[];
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
  }
  /**
   * 下拉框切换
   * @param selectedData 选中项
   */
  public cpuSelectedChange(selectedData: { index: number; }) {
    selectedData.index ? this.getNodeData() : this.getCPUCoreData();
  }
  /**
   * 初始化，切换表头
   * @param index 当前选中项
   */
  private initColumns(index: number) {
    const columns: Array<TiTableColumns> = [
      { title: '%user', sortKey: 'usr', showIcon: true, tip: I18n.net_io.tip.user_tip },
      { title: '%nice', sortKey: 'nice', showIcon: true, tip: I18n.net_io.tip.nice_tip },
      { title: '%system', sortKey: 'sys', showIcon: true, tip: I18n.net_io.tip.system_tip },
      { title: '%iowait', sortKey: 'iowait', showIcon: true, tip: I18n.net_io.tip.iowait_tip },
      { title: '%irq', sortKey: 'irq', showIcon: true, tip: I18n.net_io.tip.irq_tip },
      { title: '%soft', sortKey: 'soft', showIcon: true, tip: I18n.net_io.tip.soft_tip },
      { title: '%idle', sortKey: 'idle', showIcon: true, tip: I18n.net_io.tip.idle_tip }
    ];
    if (!index) {
      columns.unshift({ title: 'CPU core', searchKey: 'value' });
    } else {
      columns.unshift({ title: 'NUMA NODE' });
    }
    this.columns = columns;
  }
  /**
   * 获取CPU Core数据
   */
  private getCPUCoreData() {
    this.initColumns(0);
    if (this.coreData.length) {
      this.srcData.data = this.coreData;
      this.totalNumber = this.coreData.length;
    }
    this.initTableSearchKey();
  }
  /**
   *  请求 NUMA NODE 表格数据
   */
  private getNodeData() {
    this.initColumns(1);
    this.srcData.data = this.numaCoreData;
    this.totalNumber = this.numaCoreData.length;
  }
  /**
   * 查看core详情
   * @param row 当前core
   * @param modal 弹框组件
   */
  public async viewDetails(row: CpuUtilization, modal: any) {
    if (typeof row.value === 'string') { return; }
    const data: any = await this.getCpuData(row.value, this.taskId, this.nodeid);
    const coreData: CoreDetail = data?.data.optimization.data;
    this.tiModal.open(modal, {
      modalClass: 'coreDetailedsClass',
      context: {
        bodyTitle: row.value,
        data: coreData
      }
    });
  }

  /**
   * 获取选中core详情
   * @param core 当前core
   * @param taskId 任务ID
   * @param nodeId 节点ID
   * @returns 当前core的运行的进程、硬中断、软中断
   */
  public getCpuData(core: string | number, taskId: number, nodeId: number): Promise<any> {
    const params = {
      'node-id': nodeId,
      'query-type': JSON.stringify([
        QueryTypeEnum.CPUPROCESSINFO,
        QueryTypeEnum.CPUSOFTIRQ,
        QueryTypeEnum.CPUHARDIRQ,
      ]),
      core
    };
    return this.http.get(`/tasks/${encodeURIComponent(taskId)}/optimization/system-performance/`, { params });
  }
  /**
   * 初始化表格searchKeys
   */
  public initTableSearchKey() {
    this.searchKeys = [];
    this.searchWords = [];
    this.columns.forEach((column: any) => {
      if (column.searchKey) {
        if (this.searchKeys.indexOf(column.searchKey) === -1) {
          this.searchKeys.push(column.searchKey);
          this.searchWordsSave[column.searchKey] = '';
          this.searchWords.push(this.searchWordsSave[column.searchKey]);
        }
      }
    });
  }
  /**
   * 表头搜索弹框点击搜索事件监控
   * @param searchText 搜索文本
   * @param column 搜索列
   */
  public onTableHeaderSearch(searchText: any, column: any) {
    const index = this.searchKeys.indexOf(column.searchKey);
    if (index > -1 && this.searchWords.length > index) {
      this.searchWordsSave[column.searchKey] = searchText ?? '';
      this.searchWords[index] = this.searchWordsSave[column.searchKey];
    }
    if (index > -1 && this.processSearchPop._results?.length > index) {
      const curSearchPop: PopDirective = this.processSearchPop._results[index];
      curSearchPop.hide();
    }
  }
}
