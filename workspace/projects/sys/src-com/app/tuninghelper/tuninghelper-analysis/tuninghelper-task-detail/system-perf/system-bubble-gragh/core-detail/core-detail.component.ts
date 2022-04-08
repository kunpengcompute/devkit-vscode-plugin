import { Component, OnInit, OnDestroy } from '@angular/core';
import { TiTableColumns, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';
import { Subscription } from 'rxjs';
import { RespCommon } from 'sys/src-com/app/domain';
import { HttpService, I18nService } from 'sys/src-com/app/service';
import { TuningHelperRightService, CurrOptimization } from '../../../service/tuninghelper-right.service';
import {
  TuninghelperStatusService
} from 'sys/src-com/app/tuninghelper/tuninghelper-analysis/service/tuninghelper-status.service';
import { RespCoreDetail, RespProcessInfo, SystemCpuTarget } from '../../../system-perf/domain';
import { I18n } from 'sys/locale';
import { WebviewPanelService } from 'sys/src-com/app/service';
@Component({
  selector: 'app-core-detail',
  templateUrl: './core-detail.component.html',
  styleUrls: ['./core-detail.component.scss'],
})
export class CoreDetailComponent implements OnInit, OnDestroy {

  public i18n: any;
  public coreId: number;
  // 相关配置
  private processTableOriginData: any[];
  public configDisplayed: Array<TiTableRowData> = [];
  public configSrcData: TiTableSrcData = {
    data: ([] as Array<TiTableRowData>),
    state: {
      searched: false,
      sorted: false,
      paginated: false
    }
  };
  public configColumns: Array<TiTableColumns> = [];
  public configPageNo = 0;
  public configPageSize: {
    options: [10, 20, 50, 100],
    size: 10
  };
  public configPageTotal = 0;
  public processSearchWords = ['', ''];
  public processSearchKeys = ['pid', 'command'];
  public searchWordsSave: { [key: string]: string } = {};
  // 硬中断
  public hardDisplayed: Array<TiTableRowData> = [];
  public hardSrcData: TiTableSrcData = {
    data: ([] as Array<TiTableRowData>),
    state: {
      searched: false,
      sorted: false,
      paginated: false
    }
  };
  public hardColumns: Array<TiTableColumns> = [];
  public hardPageNo = 0;
  public hardPageSize: {
    options: [10, 20, 50, 100],
    size: 10
  };
  public hardPageTotal = 0;
  // 软中断
  public softDisplayed: Array<TiTableRowData> = [];
  public softSrcData: TiTableSrcData = {
    data: ([] as Array<TiTableRowData>),
    state: {
      searched: false,
      sorted: false,
      paginated: false
    }
  };
  public softColumns: Array<TiTableColumns> = [];
  public softPageNo = 0;
  public softPageSize: {
    options: [10, 20, 50, 100],
    size: 10
  };
  public softPageTotal = 0;
  private rightSub: Subscription;

  constructor(
    private rightService: TuningHelperRightService,
    private statusService: TuninghelperStatusService,
    private http: HttpService,
    private i18nService: I18nService,
    private panelService: WebviewPanelService,
  ) {
    this.i18n = this.i18nService.I18n();

    this.initTable();

    this.rightSub = this.rightService.subscribe<{ coreId: number, currTarget: SystemCpuTarget }>({
      next: (msg) => {
        if (msg.type === CurrOptimization.sysCoreDetail) {
          this.coreId = msg.data.coreId;
          this.initTableData(msg.data.currTarget);
        }
      }
    });
  }

  ngOnInit(): void {
  }

  private initTable() {
    this.configColumns = [
      { title: 'PID/TID', searchKey: 'pid' },
      { title: '%user', sortKey: 'usr', sortStatus: 'sort' },
      { title: '%sys', sortKey: 'system', sortStatus: 'sort' },
      { title: '%cpu', sortKey: 'cpu_usage', sortStatus: 'sort' },
      { title: this.i18n.tuninghelper.taskDetail.command, searchKey: 'command' },
    ];

    this.hardColumns = [
      { title: this.i18n.tuninghelper.taskDetail.deviceName },
      { title: this.i18n.tuninghelper.taskDetail.interruptNo },
      { title: this.i18n.tuninghelper.taskDetail.interruptNumPer },
    ];

    this.softColumns = [
      { title: this.i18n.tuninghelper.taskDetail.type },
      { title: this.i18n.tuninghelper.taskDetail.interruptNumPer },
    ];
  }

  private async initTableData(currTarget: SystemCpuTarget) {
    const resp = await this.getCoreDetail();
    if (!resp) { return; }
    this.configSrcData.data = this.conversionConfigData(resp.process, currTarget);
    this.processTableOriginData = Array.from(this.configSrcData.data);
    this.configPageTotal = this.configSrcData.data.length;
    this.hardSrcData.data = resp.hard_interrupts;
    this.hardPageTotal = this.hardSrcData.data.length;
    this.softSrcData.data = resp.soft_interrupts;
    this.softPageTotal = this.softSrcData.data.length;
    this.configPageNo = 1;
    this.hardPageNo = 1;
    this.softPageNo = 1;
  }

  private conversionConfigData(processInfo: RespProcessInfo[], currTarget: SystemCpuTarget) {
    // 对数据进行转换
    const pidData: { [pid: number]: any } = {};
    processInfo.forEach(item => {
      item.pid = +item.pid;
      item.usr = +item.usr;
      item.system = +item.system;
      item.cpu_usage = +item.cpu_usage;
      if (!pidData[item.pid]) {
        pidData[item.pid] = { showChildren: false, children: [] };
      }
      if (item.tid === '-') {
        pidData[item.pid] = { ...pidData[item.pid], ...item };
      } else {
        pidData[item.pid].children.push(item);
      }
      // 因为这个进程运行在另一个核，导致没有进程指标信息，这里则显示--
      if (item.pid && Number(item.tid)) {
        const pidInfo: any = {};
        for (const key of Object.keys(item)) {
          pidInfo[key] = '--';
        }
        pidData[item.pid].pid = item.pid;
        pidData[item.pid] = Object.assign(pidInfo, pidData[item.pid]);
      }
    });
    const pidDataValues = Object.values(pidData);
    // 排序
    // 默认按选择的指标排序，如果没有对应的就按%CPU（%Idle）排序，按PID对应的值，如果PID这一项没有值，就排在最后。
    let convTarget = 'cpu_usage';
    if (currTarget === SystemCpuTarget.sys || currTarget === SystemCpuTarget.usr) {
      convTarget = currTarget === SystemCpuTarget.sys ? 'system' : currTarget;
    }
    return this.sortByNumber(pidDataValues, convTarget, 'sort-ascent');
  }

  private async getCoreDetail() {
    const params = {
      'node-id': this.statusService.nodeId,
      'core-id': this.coreId
    };
    const resp: RespCommon<RespCoreDetail> = await this.http.get(
      `/tasks/${encodeURIComponent(this.statusService.taskId)}/optimization/core-detail/`,
      { params }
    );
    return resp.data.optimization?.data;
  }

  public onProcessSearch(key: string, value: string) {
    const keyIndex = this.processSearchKeys.indexOf(key);
    if (keyIndex > -1) {
      this.processSearchWords[keyIndex] = value || '';
      this.searchWordsSave[key] = value || '';
    }
  }

  public processSort(column: any, key: string) {
    switch (column.sortStatus) {
      case 'sort':
        this.configColumns.forEach(item => {
          item.sortStatus = 'sort';
        });
        column.sortStatus = 'sort-ascent';
        break;
      case 'sort-ascent':
        this.configColumns.forEach(item => {
          item.sortStatus = 'sort';
        });
        column.sortStatus = 'sort-descent';
        break;
      case 'sort-descent':
        column.sortStatus = 'sort';
        this.configSrcData.data = Array.from(this.processTableOriginData);
        return;
      default: return;
    }

    this.configSrcData.data = this.sortByNumber(this.configSrcData.data, key, column.sortStatus);
  }

  private sortByNumber(arr: any[], key: string, sortMethod: 'sort-ascent' | 'sort-descent') {
    const hasValueArr: any[] = [];
    const noValueArr: any[] = [];
    arr.forEach(item => {
      if (isNaN(Number(item[key]))) {
        noValueArr.push(item);
        return;
      }
      // 使用直接插入排序
      let insertIndex = 0;
      while (insertIndex < hasValueArr.length) {
        if (sortMethod === 'sort-ascent' && item[key] >= hasValueArr[insertIndex][key]) {
          insertIndex++;
        } else if (sortMethod === 'sort-descent' && item[key] <= hasValueArr[insertIndex][key]) {
          insertIndex++;
        } else {
          break;
        }
      }
      hasValueArr.splice(insertIndex, 0, item);
    });
    return hasValueArr.concat(noValueArr);
  }
  /**
   * 打开进程详情pannel
   * @param thread 进程名称
   */
  public viewThreadsData(thread: string) {
    thread = `PID${thread}`;
    this.panelService.addPanel({
      viewType: 'tuninghelperProcessPidDetailsysPerf',
      title: `${thread}${I18n.tuninghelper.treeDetail.detail}`,
      id: `TuninghelperProcessPidDetail-${this.statusService.taskId}-${this.statusService.nodeId}-${thread}`,
      router: 'tuninghelperProcessPidDetail',
      message: {
        nodeId: this.statusService.nodeId,
        taskId: this.statusService.taskId,
        pid: +thread.split('PID')[1].split(')')[0],
        showIndicatorInfo: true
      }
    });
  }
  ngOnDestroy(): void {
    this.rightSub?.unsubscribe();
  }

}
