import { Component, Input, OnInit } from '@angular/core';
import {
  NetioTaskInfoRaw,
  DialTestScene,
  DiagnoseFunc,
  IpProtocolType,
} from '../../domain';
import { I18n } from 'sys/locale';
import { HyThemeService, HyTheme } from 'hyper';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-net-io-temp-detail',
  templateUrl: './net-io-temp-detail.component.html',
  styleUrls: ['./net-io-temp-detail.component.scss'],
})
export class NetIoTempDetailComponent implements OnInit {
  @Input()
  set taskInfo(val: NetioTaskInfoRaw) {
    if (null == val) {
      return;
    }
    this.taskInfoStash = val;
    this.setDiagnoseFunc(val);
  }
  get taskInfo(): NetioTaskInfoRaw {
    return this.taskInfoStash;
  }
  @Input() type: string;

  collectCoreStackTips: any = null;
  taskInfoStash: NetioTaskInfoRaw;
  // 诊断功能转化为字符串显示
  diagnoseFunc = '';
  // 任务节点转化为字符串
  taskNodeIp = '';
  reservationTime = '';
  protocolTypeEnum = IpProtocolType;
  theme$: Observable<HyTheme>;
  displayData = {
    connection: false,
    tcp: false,
    udp: false,
    packetLoss: false,
    netCaught: false,
    load: false,
    connectServer: true,
    serverParam: true,
    lossFilter: true,
    netCaughtFilter: true,
    reservation: false,
  };
  protocolFilter = '';
  constructor(private themeServe: HyThemeService) {
    this.theme$ = this.themeServe.getObservable();
  }

  ngOnInit() {
    this.collectCoreStackTips =
      sessionStorage.getItem('language').indexOf('en') !== -1
        ? I18n.net_io.collect_core_stack
        : null;
  }

  private setDiagnoseFunc(taskInfo: NetioTaskInfoRaw) {
    const functions = taskInfo.functions;
    this.diagnoseFunc = '';
    const stringArr: string[] = [];
    functions.forEach((item) => {
      switch (item) {
        case DialTestScene.Connection:
          stringArr.push(I18n.network_diagnositic.taskParams.connection);
          this.displayData.connection = true;
          break;
        case DialTestScene.Tcp:
          stringArr.push(I18n.network_diagnositic.taskParams.tcp);
          this.displayData.tcp = true;
          break;
        case DialTestScene.Udp:
          stringArr.push(I18n.network_diagnositic.taskParams.udp);
          this.displayData.udp = true;
          break;
        case DiagnoseFunc.PacketLoss:
          stringArr.push(I18n.network_diagnositic.taskParams.packet_loss);
          this.displayData.packetLoss = true;
          this.taskNodeIp = taskInfo?.packetLoss.taskNodeIp.join();
          break;
        case DiagnoseFunc.NetCaught:
          stringArr.push(I18n.network_diagnositic.taskParams.network_capture);
          this.displayData.netCaught = true;
          this.protocolFilter =
            this.taskInfo?.netCaught?.protocolFilter?.join() || '--';
          break;
        case DiagnoseFunc.Load:
          stringArr.push(I18n.network_diagnositic.taskParams.network_load);
          this.displayData.load = true;
          break;
        default:
          break;
      }
    });
    this.displayData.reservation = Object.keys(taskInfo).includes('cycle');
    this.reservationTime = this.displayData.reservation  && taskInfo?.cycle
      ? (taskInfo.cycleStart || '').replace(/-/g, '/') +
        '—' +
        (taskInfo.cycleStop || '').replace(/-/g, '/')
      : (taskInfo.appointment || '').replace(/-/g, '/');
    this.diagnoseFunc = stringArr.join();
  }
}
