import { Component, Input, OnInit } from '@angular/core';
import { StorageCreateForm } from '../domain';
import { I18n } from 'sys/locale';
import { HyThemeService, HyTheme } from 'hyper';
import { Observable } from 'rxjs';
@Component({
  selector: 'app-storage-io-temp-detail',
  templateUrl: './storage-io-temp-detail.component.html',
  styleUrls: ['./storage-io-temp-detail.component.scss']
})
export class StorageIoTempDetailComponent implements OnInit {
  @Input()
  set taskInfo(val: any) {
    if (null == val) {
      return;
    }
    this.taskInfoStash = val;
    this.setIndicators(val);
    this.setDiagnoseFunc(val);
  }
  get taskInfo(): any {
    return this.taskInfoStash;
  }
  @Input() type: string;
  @Input() labelpadding: string;
  taskInfoStash: StorageCreateForm;
  reservationTime = '';
  public keyIndicators = '';
  public detailPressure: any;
  public detailMetrics: any;
  // 诊断功能转化为字符串显示
  diagnoseFunc = '';
  // 任务节点转化为字符串
  taskNodeIp = '';
  // 周期统计转化为字符串
  cycleOn = '';
  theme$: Observable<HyTheme>;
  displayData = {
    storageDiagnostics: false,
    systemloadMonitoring: false,
    reservation: false
  };
  constructor(private themeServe: HyThemeService) {
    this.theme$ = this.themeServe.getObservable();
  }
  public diagnostic(item: any) {
    switch (item) {
      case 'storageDiagnostic':
        return this.diagnoseFunc = I18n.storageIo.storage_io;
      default:
        return this.diagnoseFunc = '';
    }
  }
  public diaFunction() {
    const diagnoseFunc = this.taskInfo.diagnosticFunc.map((val: any) => {
      return this.diagnostic(val);
    });
    this.diagnoseFunc = diagnoseFunc.join('|');
    return this.diagnoseFunc;
  }
  ngOnInit(): void {
    this.detailPressure = this.taskInfo.nodeConfig;
    this.detailMetrics = this.taskInfo.indicatorForm;
  }
  public setIndicators(taskInfo: StorageCreateForm) {
    if (taskInfo.throughput) {
      this.keyIndicators = I18n.storageIo.keyMetric.throughput + `,`;
    }
    if (taskInfo.iops) {
      this.keyIndicators = this.keyIndicators + 'IOPS,';
    }
    if (taskInfo.latency) {
      this.keyIndicators = this.keyIndicators + I18n.storageIo.keyMetric.delay;
    }
    return this.keyIndicators;
  }
  private setDiagnoseFunc(taskInfo: StorageCreateForm) {
    const stringArr: string[] = [];
    this.displayData.reservation = Object.keys(taskInfo).includes('cycle');
    this.reservationTime = this.displayData.reservation && taskInfo?.cycle
      ? (taskInfo.cycleStart || '').replace(/-/g, '/') +
      '—' +
      (taskInfo.cycleStop || '').replace(/-/g, '/')
      : (taskInfo.appointment || '').replace(/-/g, '/');
    this.cycleOn = taskInfo.cycleOn ? I18n.sys_cof.sum.open : I18n.sys_cof.sum.close;
    if (taskInfo.cycleOn === true) {
      this.cycleOn = I18n.sys_cof.sum.open;
    } else {
      this.cycleOn = I18n.sys_cof.sum.close;
    }
    this.diaFunction();
  }
}
