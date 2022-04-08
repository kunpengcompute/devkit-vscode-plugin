import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { I18nService } from 'sys/src-com/app/service';
import { TimeLineComponent } from 'sys/src-com/app/shared/components/time-line/time-line.component';
import { INetLoadRawData } from '../../domain';
import { connect } from 'echarts';
import * as Utils from 'projects/sys/src-com/app/util';

@Component({
  selector: 'app-load-network-port',
  templateUrl: './load-network-port.component.html',
  styleUrls: ['./load-network-port.component.scss']
})
export class LoadNetworkPortComponent implements OnInit {

  @ViewChild('timeLineDetail') timeLineDetail: TimeLineComponent;
  @ViewChild('throughputEchart') throughputEchart: any;
  @ViewChild('PPSEchart') PPSEchart: any;

  @Input() netLoadData: INetLoadRawData;

  public devOptions: Array<{ label: string }>;
  public selecteDev: { label: string };
  public timeData: Array<number | string>;
  public lineData = {
    start: 0,
    end: 100,
  };
  public lineColorListPps = ['#037dff', '#e88b00'];
  public lineColorListNum = ['#a050e7', '#41ba41'];
  public originAllData: any;
  public PPSEchartData: any;
  public throughputEchartData: any;
  public i18n: any;
  public uuid: any;
  constructor(
    private i18nService: I18nService,
  ) {
    this.i18n = this.i18nService.I18n();
  }

  ngOnInit(): void {
    this.uuid = Utils.generateConversationId(12);
    this.getData();
  }
  /**
   * 获取并处理数据
   */
  public async getData() {
    this.originAllData = this.netLoadData.net_io_detail;
    this.devOptions = Object.keys(this.originAllData).map(dev => {
      return { label: dev };
    });
    this.selecteDev = this.devOptions[0];
    this.selectDev(this.selecteDev, true);
  }
  /**
   * 切换设备
   * @param e 选中设备
   */
  public selectDev(e: { label: string | number; }, init?: boolean) {
    const selectData = this.originAllData[e.label];
    const interval = this.netLoadData.context_info.interval;
    const starTime = this.netLoadData.context_info.start_time * 1000;
    const arr = new Array(selectData['rxpck/s'].length || selectData['rxkB/s'].length);
    this.timeData = Array.from(arr, (el, idx) => {
      const time = new Date(starTime + idx * interval * 1000).toTimeString();
      return time.split(' ')[0];
    });
    this.PPSEchartData = {
      title: 'pck/s',
      dev: e.label,
      key: [{ title: 'rx', key: 'rxpck/s', unit: 'pck/s' }, { title: 'tx', key: 'txpck/s', unit: 'pck/s' }],
      time: this.timeData,
      data: selectData,
    };
    this.throughputEchartData = {
      title: 'KB/s',
      dev: e.label,
      key: [{ title: 'rx', key: 'rxkB/s', unit: 'KB/s' }, { title: 'tx', key: 'txkB/s', unit: 'KB/s' }],
      time: this.timeData,
      data: selectData,
    };
    if (!init) {
      setTimeout(() => {
        this.PPSEchart?.initTable();
        this.throughputEchart?.initTable();
      });
    }

  }
  public timeLineData(e: { start: number; end: number; }) {
    this.lineData = e;
    this.PPSEchart?.initTable();
    this.throughputEchart?.initTable();
  }
  public onChartDataZoom(e: { start: number; end: number; }) {
    this.lineData = e;
    this.timeLineDetail.dataConfig(e);
  }
  /**
   * 由子组件传递echartsInst, echarts图表联动
   * @param e 子组件
   */
  public echartsInstOut(e: any) {
    if (e) {
      e.group = this.uuid;
    }
    connect(this.uuid);
  }
}
