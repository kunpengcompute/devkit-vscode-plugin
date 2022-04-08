import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ChangeDetectorRef } from '@angular/core';
import { HttpService, I18nService } from 'sys/src-com/app/service';
import { TimeLineComponent } from 'sys/src-com/app/shared/components/time-line/time-line.component';
import {
  EchartConfig,
  RespCoreCacheMiss,
  RespDCacheBandwidth,
  RespDdrBandwidth,
  RespICacheBandwidth,
  RespL3cBandwidth,
  RespL3cHhaRate,
  RespL3cMiss,
  RespSysInfo,
  RespTlbMiss,
} from './domain';

@Component({
  selector: 'app-ddr-summury',
  templateUrl: './ddr-summury.component.html',
  styleUrls: ['./ddr-summury.component.scss'],
})
export class DdrSummuryComponent implements OnInit {
  @ViewChild('timeLineDetail') timeLineDetail: TimeLineComponent;

  @Input() projectName: any;
  @Input() taskName: any;
  @Input() analysisType: any;
  @Input() isActive: any;
  @Input() taskid: any;
  @Input() nodeid: any;
  @Output() is1616 = new EventEmitter<boolean>();

  public i18n: any;
  public isLoading: boolean;
  private xAxisData: {
    min: Date;
    max: Date;
    interval: number;
    data: string[];
  };
  public timeData: string[];
  public lineData = {
    start: 0,
    end: 100,
  };

  public sysInfo: RespSysInfo;
  public echartDataCoreCacheMiss: EchartConfig;
  public echartDataCoreCacheMissTitle: string;
  public echartDataICacheBandwidth: EchartConfig;
  public echartDataICacheBandwidthTitle: string;
  public echartDataDCacheBandwidth: EchartConfig;
  public echartDataDCacheBandwidthTitle: string;
  public echartDataL3cHhaRate: EchartConfig;
  public echartDataL3cHhaRateTitle: string;
  public echartDataL3cMiss: EchartConfig;
  public echartDataL3cMissTitle: string;
  public echartDataL3cBandwidth: EchartConfig;
  public echartDataL3cBandwidthTitle: string;
  public echartDataTlbMiss: EchartConfig;
  public echartDataTlbMissTitle: string;
  public echartDataDdrBandwidth: EchartConfig;
  public echartDataDdrBandwidthTitle: string;

  constructor(
    private i18nService: I18nService,
    private http: HttpService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
    this.i18n = this.i18nService.I18n();
  }

  async ngOnInit() {
    this.sysInfo = await this.getSysInfo();
    this.is1616.emit(this.sysInfo?.CPU === 1616);
    await this.initTimeLine();
    await this.initCoreCacheMissEchart();
    await this.initICacheBandwidth();
    await this.initDCacheBandwidth();
    await this.initL3cHhaRate();
    await this.initL3cMiss();
    await this.initL3cBandwidth();
    await this.initTlbMiss();
    await this.initDdrBandwidth();
    if (sessionStorage.getItem('tuningOperation') === 'hypertuner') {
      this.changeDetectorRef.markForCheck();
      this.changeDetectorRef.detectChanges();
    }
  }

  private async getSysInfo(): Promise<RespSysInfo> {
    const resp = await this.http.get(
      '/tasks/' + encodeURIComponent(this.taskid) + '/mem-access-analysis/?'
        + 'node-id=' + encodeURIComponent(this.nodeid) + '&query-type=summary&query-target=sysinfo',
      { headers: { showLoading: false } }
    );
    return resp.data;
  }

  private async getData(queryTarget: string) {
    const params = {
      'node-id': this.nodeid,
      'query-type': 'summary',
      'query-target': queryTarget
    };
    const resp = await this.http.get(`/tasks/${encodeURIComponent(this.taskid)}/mem-access-analysis/`, {
      params,
      headers: { showLoading: false }
    });
    return resp.data.origin_data;
  }

  private async initTimeLine() {
    const params = { 'node-id': this.nodeid };
    const resp = await this.http.get(`/tasks/${encodeURIComponent(this.taskid)}/common/configuration/`, {
      params,
      headers: { showLoading: false }
    });
    // 单位/秒
    const duration: number = resp.data.duration;
    // 单位/秒
    const interval: number = resp.data.interval / 1000;
    const timeDataLength = duration / interval;
    // 从第一个采样间隔后开始，不从0秒开始
    // 最后加一个采样间隔
    this.timeData = [];
    for (let i = 1; i <= timeDataLength + 1; i++) {
      this.timeData.push((i * interval).toFixed(1) + 's');
    }
    const now = new Date();
    this.xAxisData = {
      min: now,
      max: new Date(now.getTime() + duration * 1000),
      interval: resp.data.interval,
      data: this.timeData
    };
  }

  private async initCoreCacheMissEchart() {
    const legendTextMap: { [respKey: string]: string } = {
      l1i_missrate: 'L1i',
      l1d_missrate: 'L1d',
      l2i_missrate: 'L2i',
      l2d_missrate: 'L2d',
      l1i_mpki: 'L1i',
      l1d_mpki: 'L1d',
      l2i_mpki: 'L2i',
      l2d_mpki: 'L2d',
    };
    this.echartDataCoreCacheMissTitle = 'Core Cache Miss';
    const respCoreCacheMiss: RespCoreCacheMiss = await this.getData('core_cache_miss');
    this.echartDataCoreCacheMiss = {
      xAxisData: this.xAxisData,
      percent: {
        legend: Object.keys(respCoreCacheMiss.values.percentage).map(item => legendTextMap[item]),
        time: respCoreCacheMiss.time,
        seriesData: {
          L1i: respCoreCacheMiss.values.percentage.l1i_missrate,
          L1d: respCoreCacheMiss.values.percentage.l1d_missrate,
          L2i: respCoreCacheMiss.values.percentage.l2i_missrate,
          L2d: respCoreCacheMiss.values.percentage.l2d_missrate,
        },
      },
      mpki: {
        legend: Object.keys(respCoreCacheMiss.values.mpki).map(item => legendTextMap[item]),
        time: respCoreCacheMiss.time,
        seriesData: {
          L1i: respCoreCacheMiss.values.mpki.l1i_mpki,
          L1d: respCoreCacheMiss.values.mpki.l1d_mpki,
          L2i: respCoreCacheMiss.values.mpki.l2i_mpki,
          L2d: respCoreCacheMiss.values.mpki.l2d_mpki,
        },
      },
    };
  }

  private async initICacheBandwidth() {
    const legendTextMap: { [respKey: string]: string } = {
      l1i_bandwidth: 'L1i',
      l2i_bandwidth: 'L2i',
    };
    this.echartDataICacheBandwidthTitle = 'iCache Bandwidth';
    const respICacheBandWidth: RespICacheBandwidth = await this.getData('icache_bandwidth');
    const keys = Object.keys(respICacheBandWidth.values);
    const l1iBandwidth = respICacheBandWidth.values.l1i_bandwidth?.map((item) => +(item / 1024).toFixed(2));
    const l2iBandwidth = respICacheBandWidth.values.l2i_bandwidth?.map((item) => +(item / 1024).toFixed(2));
    this.echartDataICacheBandwidth = {
      xAxisData: this.xAxisData,
      gbs: {
        legend: keys.length > 1 ? ['sum', 'L1i', 'L2i'] : keys.map(item => legendTextMap[item]),
        time: respICacheBandWidth.time,
        seriesData: {
          sum: l1iBandwidth && l2iBandwidth && l1iBandwidth.map((item, index) => l2iBandwidth[index] + item),
          L1i: l1iBandwidth,
          L2i: l2iBandwidth,
        },
      },
    };
  }

  private async initDCacheBandwidth() {
    const legendTextMap: { [respKey: string]: string } = {
      l1d_bandwidth: 'L1d',
      l2d_bandwidth: 'L2i',
    };
    this.echartDataDCacheBandwidthTitle = 'dCache Bandwidth';
    const respDCacheBandWidth: RespDCacheBandwidth = await this.getData('dcache_bandwidth');
    const keys = Object.keys(respDCacheBandWidth.values);
    const l1dBandwidth = respDCacheBandWidth.values.l1d_bandwidth?.map((item) => +(item / 1024).toFixed(2));
    const l2dBandwidth = respDCacheBandWidth.values.l2d_bandwidth?.map((item) => +(item / 1024).toFixed(2));
    this.echartDataDCacheBandwidth = {
      xAxisData: this.xAxisData,
      gbs: {
        legend: keys.length > 1 ? ['sum', 'L1d', 'L2d'] : keys.map(item => legendTextMap[item]),
        time: respDCacheBandWidth.time,
        seriesData: {
          sum: l1dBandwidth && l2dBandwidth && l1dBandwidth.map((item, index) => l2dBandwidth[index] + item),
          L1d: l1dBandwidth,
          L2d: l2dBandwidth,
        },
      },
    };
  }

  private async initL3cHhaRate() {
    const legendTextMap: { [respKey: string]: string } = {
      l3_missrate_total: 'I3 miss',
      hha_cross_sccl_rate_total: 'hha cross-sccl rate',
      hha_cross_socket_rate_total: 'hha cross-socket rate',
    };
    this.echartDataL3cHhaRateTitle = 'L3/HHA rates';
    if (this.sysInfo?.CPU === 1616) { return; }
    const respL3cHhaRate: RespL3cHhaRate = await this.getData('l3c_hha_rate');
    this.echartDataL3cHhaRate = {
      xAxisData: this.xAxisData,
      gbs: {
        legend: Object.keys(respL3cHhaRate.values).map(item => legendTextMap[item]),
        time: respL3cHhaRate.time,
        seriesData: {
          'I3 miss': respL3cHhaRate.values.l3_missrate_total,
          'hha cross-sccl rate': respL3cHhaRate.values.hha_cross_sccl_rate_total,
          'hha cross-socket rate': respL3cHhaRate.values.hha_cross_socket_rate_total,
        },
      },
    };
  }

  private async initL3cMiss() {
    this.echartDataL3cMissTitle = 'L3 miss by channel';
    if (this.sysInfo?.CPU === 1616) { return; }
    const respL3cMiss: RespL3cMiss = await this.getData('l3c_miss');
    this.echartDataL3cMiss = {
      xAxisData: this.xAxisData,
      gbs: {
        legend: Object.keys(respL3cMiss.values).sort((item1, item2) => +item1.substr(3) - +item2.substr(3)),
        time: respL3cMiss.time,
        seriesData: respL3cMiss.values,
      },
    };
  }

  private async initL3cBandwidth() {
    this.echartDataL3cBandwidthTitle = 'L3 Bandwidth by Channel';
    if (this.sysInfo?.CPU === 1616) { return; }
    const respL3cBandwidth: RespL3cBandwidth = await this.getData('l3c_bandwidth');
    this.echartDataL3cBandwidth = {
      xAxisData: this.xAxisData,
      gbs: {
        legend: Object.keys(respL3cBandwidth.values).sort((item1, item2) => +item1.substr(3) - +item2.substr(3)),
        time: respL3cBandwidth.time,
        seriesData: respL3cBandwidth.values,
      },
    };
  }

  private async initTlbMiss() {
    this.echartDataTlbMissTitle = 'TLB Miss';
    const respTlbMiss: RespTlbMiss = await this.getData('tlb_miss');
    this.echartDataTlbMiss = {
      xAxisData: this.xAxisData,
      percent: {
        legend: Object.keys(respTlbMiss.values.percentage),
        time: respTlbMiss.time,
        seriesData: respTlbMiss.values.percentage,
      },
      mpki: {
        legend: Object.keys(respTlbMiss.values.mpki),
        time: respTlbMiss.time,
        seriesData: respTlbMiss.values.mpki,
      },
    };
  }

  private async initDdrBandwidth() {
    this.echartDataDdrBandwidthTitle = 'DDR Bandwidth';
    if (this.sysInfo?.CPU === 1616) { return; }
    const respDdrBandwidth: RespDdrBandwidth = await this.getData('ddr_bandwidth');
    this.echartDataDdrBandwidth = {
      xAxisData: this.xAxisData,
      gbs: {
        legend: Object.keys(respDdrBandwidth.values),
        time: respDdrBandwidth.time,
        seriesData: respDdrBandwidth.values,
      },
    };
  }

  public timeLineData(e: { start: number; end: number; }) {
    this.lineData = e;
  }

  public onChartDataZoom(e: { start: number; end: number; }) {
    this.lineData = e;
    this.timeLineDetail.dataConfig(e);
  }
}
