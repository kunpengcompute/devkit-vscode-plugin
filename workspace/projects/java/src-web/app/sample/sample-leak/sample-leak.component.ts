import { Component, OnInit, ViewChild, ViewEncapsulation, OnDestroy, SecurityContext } from '@angular/core';
import { StompService } from '../../service/stomp.service';
import { I18nService } from '../../../app/service/i18n.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MessageService } from '../../service/message.service';
import { TiTableColumns, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';
import { SamplieDownloadService } from '../../service/samplie-cache.service';
import { LibService } from '../../service/lib.service';
import { DomSanitizer } from '@angular/platform-browser';
@Component({
  selector: 'app-sample-leak',
  templateUrl: './sample-leak.component.html',
  styleUrls: ['./sample-leak.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SampleLeakComponent implements OnInit, OnDestroy {
  @ViewChild('leakTimeLine') leakTimeLine: any;
  public wsFinishSub: Subscription;
  public recordId = '';
  public finishLeak = false;
  public finishReport = false;
  public sugtype = 0;
  public stackPool: any;
  public referPool: any;
  public oldSample: any;
  public oldDatas: any = [];
  public optionsEcharts: any;
  public leakSrcData: TiTableSrcData;
  public leakDisplayed: Array<TiTableRowData> = [];
  public leakColumns: Array<TiTableColumns> = [];
  public i18n: any;
  public myOptionsRight: Array<any> = [
    { label: this.i18nService.I18n().protalserver_sampling_leak.stack, id: 'stack' },
    { label: this.i18nService.I18n().protalserver_sampling_leak.reference, id: 'refer' }
  ];
  public mySelect2: any = this.myOptionsRight[0];
  public headerSearch: any = {
    placeholder: 'please input search key',
    value: ''
  };
  // 栈帧池
  public statckDisplayed: Array<TiTableRowData> = []; // 表示表格实际呈现的数据（开发者默认设置为[]即可）
  public stackSrcData: TiTableSrcData;
  public stackColumns: Array<TiTableColumns> = [
    {
      title: 'stackPool',
      width: '100%'
    }
  ];
  // 引用链
  public referDisplayed: Array<TiTableRowData> = [];
  public referSrcData: TiTableSrcData;
  public referColumns: Array<TiTableColumns> = [{ title: 'referPool', width: '100%' }];
  public pageSize: { options: Array<number>; size: number } = {
    options: [10, 20, 50, 100],
    size: 10
  };
  public pool = true;
  public stackPageSize: { options: Array<number>; size: number } = {
    options: [10, 20, 50, 100],
    size: 10
  };
  public currentPage = 1;
  public stackCurrentPage = 1;
  public referCurrentPage = 1;
  public referPageSize: { options: Array<number>; size: number } = {
    options: [10, 20, 50, 100],
    size: 10
  };
  public searchWords: Array<string> = [this.headerSearch.value];
  public searchKeys: Array<string> = ['objects'];
  public noDadaInfo = '';
  //  echarts
  public leakViewOption: any = {};
  public gridHeight = 100;
  public baseColor = '#e6ebf5';
  public ylabelColor = '#999';
  public baseTop = 30;
  public getDataTimer: any = null;
  public echartsLabel: any;
  public suggetNum = 1;
  public hoverClose: any;
  public isSuggest = false;
  public suggestArr: any = [];
  public sugHeight = true;
  public wsFinishSug: Subscription;
  @ViewChild('analysis ', { static: false }) analysis: any;
  constructor(
    private stompService: StompService,
    private i18nService: I18nService,
    private router: Router,
    private route: ActivatedRoute,
    private downloadService: SamplieDownloadService,
    private msgService: MessageService,
    private libService: LibService,
    public domSanitizer: DomSanitizer
  ) {
    this.i18n = this.i18nService.I18n();
    this.headerSearch.placeholder = this.i18nService.I18nReplace(
      this.i18n.searchBox.info,
      {
        0: this.i18n.protalserver_sampling_leak.object
      }
    );
  }
  public timeData: any;
  public echartsInstance: any;
  ngOnInit() {
    this.noDadaInfo = this.i18n.common_term_task_nodata;
    this.recordId = this.getRecordId();
    this.leakSrcData = {
      data: [],
      state: {
        searched: false,
        sorted: false,
        paginated: false
      }
    };
    this.stackSrcData = {
      data: [],
      state: {
        searched: false,
        sorted: false,
        paginated: false
      }
    };
    this.referSrcData = {
      data: [],
      state: {
        searched: false,
        sorted: false,
        paginated: false
      }
    };
    this.leakColumns = [
      {
        title: 'time',
        width: '25%',
        sortKey: 'time'
      },
      {
        title: 'object',
        width: '25%',
        sortKey: 'objects'
      },
      {
        title: 'thread',
        width: '25%',
        sortKey: 'thread'
      },
      {
        title: 'stackSize',
        width: '25%',
        sortKey: 'stackSize'
      }
    ];
    this.importCache();
    if (!this.finishLeak) {
      this.getSamplingData('old_object_sample', this.recordId);
      this.showLoding();
    } else {
      this.getOldSample();
      this.getPoolValue(this.leakSrcData.data[0]);
      this.setOption();
      return;
    }
    this.wsFinishSub = this.msgService.getSampleLeakMessage().subscribe(msg => {
      if (msg.type === 'OLD_OBJECT_SAMPLE' && msg.content === 'FINISH_FLAG') {
        this.closeLoding();
        this.finishLeak = true;
        return;
      }
      if (msg.type === 'OLD_STACK_POOL') {
        Object.assign(this.stackPool, msg.content);
      }
      if (msg.type === 'OLD_OBJECT_SAMPLE' && msg.content !== 'FINISH_FLAG') {
        this.oldSample.push(...msg.content);
        this.getOldSample();
        this.setOption();
      }
      if (msg.type === 'REFER_POOL') {
        Object.assign(this.referPool, msg.content);
      }
      if (this.stackPool.length > 0 && this.oldSample.length > 0) {
        this.getPoolValue(this.leakSrcData.data[0]);
      }
    });
    this.wsFinishSug = this.msgService.getMessage().subscribe(msg => {
      if (msg.type === 'leak') {
        this.suggestArr = msg.data;
      }
    });
  }
  ngOnDestroy() {
    clearTimeout(this.getDataTimer);
    this.getDataTimer = null;
    this.downloadService.downloadItems.leak.isFinish = this.finishLeak;
    this.downloadService.downloadItems.leak.oldSample = this.oldSample;
    this.downloadService.downloadItems.leak.stackPool = this.stackPool;
    this.downloadService.downloadItems.leak.referPool = this.referPool;
    this.downloadService.downloadItems.leak.finishReport = this.finishReport;
    this.downloadService.downloadItems.leak.suggestArr = this.suggestArr;
    if (this.wsFinishSub) {
      this.wsFinishSub.unsubscribe();
    }
    if (this.wsFinishSug) {
      this.wsFinishSug.unsubscribe();
    }
    this.closeLoding();
  }
  public onHoverClose(msg?: any) {
    this.hoverClose = msg;
  }
  public getSamplingData(type: any, data: any) {
    const uuid = this.libService.generateConversationId(8);
    const requestUrl = `/user/queue/sample/records/${data}/${uuid}/${type}`;
    this.stompService.subscribeStompFn(requestUrl);
    this.stompService.startStompRequest('/cmd/sub-record', {
      recordId: data,
      recordType: type.toUpperCase(),
      uuid
    });
  }
  public changeHeight(idx: any) {
    this.suggestArr[idx].sugHeight = !this.suggestArr[idx].sugHeight;
  }
  // 打开优化弹框
  public openSuggest() {
    this.isSuggest = true;
  }
  closeSuggest() {
    this.hoverClose = '';
    this.isSuggest = false;
  }
  closeHandle(e: any) {
    this.isSuggest = false;

  }
  //  引用链与栈帧池的切换
  public dataChange(data: any) {
    if (data.id === 'stack') {
      this.pool = true;
    } else {
      this.pool = false;
    }
  }
  // 获取recordID
  public getRecordId() {
    const url = this.router.url;
    const path = this.route.routeConfig.path;
    let params = url.slice(10);
    if (path) {
      const lastIndex = params.lastIndexOf('/' + path);
      params = params.slice(0, lastIndex);
    }
    return params.replace('/objects', '');
  }

  // 获取oblObjectSample的数据
  public getOldSample() {
    let leakColumns = this.oldSample;
    this.leakSrcData.data = [];
    const oldObject: any = [];
    leakColumns.forEach((leak: any, index: any) => {
      oldObject.push({
        isSelect: index === 0,
        time: this.format(leak[0]),
        timeyear: this.libService.dateFormat(leak[0], 'hh:mm:ss'),
        objects: leak[1],
        thread: leak[2],
        stackSize: this.getMib(leak[3]),
        refer: leak[5],
        stack: leak[4],
        group: leak[6]
      });
    });
    leakColumns = [];
    this.sortEchartsData(oldObject);
    this.leakSrcData.data = oldObject;
    this.optionsEcharts = oldObject;
    this.getEcharts(oldObject[0]);
  }
  //  echarts数据配置
  public setOption() {
    const time: any = [];
    const size: any = [];
    const timeyear: any = [];
    this.echartsLabel.forEach((item: any) => {
      timeyear.push(item.timeyear);
      time.push(item.time);
      size.push(item.stackSize);
    });
    let tempTimer = setTimeout(() => {
      this.timeData = timeyear;
      if (this.leakTimeLine) {
        this.leakTimeLine.setTimeData(this.timeData);
      }
      clearTimeout(tempTimer);
      tempTimer = null;
    }, 100);
    const maxValue = Math.max(...size);
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'line',
          label: {
            backgroundColor: '#6a7985'
          }
        },
        backgroundColor: '#ffffff',
        borderRadius: 5,
        padding: [8, 20, 8, 20],
        boxShadow: 'rgba(0, 0, 0, 0.5)',
        textStyle: {
          color: '#000000',
          fontSize: 12
        },
        extraCssText: 'box-shadow: 0px 4px 8px 0px rgba(0, 0, 0, .2);',
        formatter: (params: any): any => {
          if (params.length) {
            const t = time[params[0].dataIndex];
            let html = ``;
            html += `<div><div>${t}</div>
                `;
            params.forEach((param: any, index: any) => {
              html += `
              <div style='margin-top:8px;display:flex;justify-content: space-between; align-items: center;'>
              <div style="float:left;">
                <span style="display:inline-block;width: 8px;
                height: 8px;background-color:#4056e9;margin-right:8px;"></span>
                <span style='display:inline-block'>
                ${this.domSanitizer.sanitize(SecurityContext.HTML, param.seriesName)}</span>
              </div>
                  <span style='margin-left:24px;display:inline-block;'>
                  ${this.domSanitizer.sanitize(SecurityContext.HTML,
                this.libService.setThousandSeparator(param.data))} MiB</span>
                </div>
                `;
            });
            html += `</div>`;
            return html;
          }
        }
      },
      grid: {
        top: '10',
        left: '0',
        right: '40',
        bottom: '0',
        containLabel: true
      },
      xAxis: [
        {
          type: 'category',
          data: timeyear.map((str: any) => {
            return str.replace(' ', '\n');
          }),
          boundaryGap: false,
          axisLine: {
            onZero: false,
            lineStyle: {
              color: '#E1E6EE',
              width: 2
            }
          },
          axisLabel: {
            padding: [11, 0, 0, 0],
            textStyle: {
              color: '#616161',
            },
          },
          axisTick: {
            show: true,
            color: '#E1E6EE',
            width: 2,
            length: 8,
          },
          axisPointer: {
            lineStyle: { color: '#6C7280' }
          }
        }
      ],
      yAxis: [
        {
          type: 'value',
          max: maxValue,
          min: 0,
          axisLabel: {
            formatter: (params: any) => {
              return this.libService.setThousandSeparator(params) + ' ' + this.i18n.common_unit_mib;
            },
            textStyle: { color: '#616161' },
            show: true,
          },
          axisTick: { show: false },
          axisLine: { show: false },
          interval: maxValue
        }
      ],
      series: [
        {
          name: this.i18n.protalserver_sampling_leak.size,
          type: 'line',
          stack: 'size',
          lineStyle: {
            color: '#267DFF'
          },
          itemStyle: {
            normal: {
              color: '#267DFF'
            }
          },
          showSymbol: false,
          symbolSize: 6,
          areaStyle: {
            color: '#267DFF',
            opacity: 0.2
          },
          data: size
        }
      ],
      dataZoom: [
        {
          show: false,
          type: 'slider',
          realtime: true,
          top: 0,
          showDataShadow: true, // 是否显示背景
          height: 32,
          dataBackground: {
            areaStyle: {
              color: 'rgba(230,233,240,0.6)' // 滑块背景阴影的填充样式
            },
            lineStyle: {
              opacity: 0.8,
              color: 'rgb(230,233,240)' // 滑块背景的边线颜色
            }
          },
          fillerColor: 'rgba(0, 103, 255, 0.15)', // 选中的区域背景色
          textStyle: {
            color: 'rgba(40, 43, 51, 0)' // 选中区域两边的边界值样式  不显示
          },
          handleStyle: {
            // 边界图标样式设置
            color: 'rgba(108, 146, 250, 1)',
            borderType: 'solid',
            borderWidth: '10'
          }
        },
        {
          type: 'inside',
          realtime: true,
          showDataShadow: false
        }
      ]
    };
    this.sortTime(time);
    this.leakViewOption = option;
  }
  // 根据key获取栈的value
  public getPoolValue(row: any) {
    let data: any = [];
    if (!row) { return; }
    row.stack.forEach((temp: any) => {
      this.stackPool.map((item: any, index: any) => {
        if (index === temp) {
          data.push(item);
        }
      });
    });
    let pool: any = [];
    row.refer.forEach((temp: any) => {
      this.referPool.map((item: any, index: any) => {
        if (index === temp[0]) {
          const strPool = temp[1] === '' ? item : `${item}:${temp[1]}`;
          pool.push(strPool);
        }
      });
    });
    this.getStackPool(data);
    this.getReferPool(pool);
    data = [];
    pool = [];
  }
  // 获取同类型的echarts数据
  public getEcharts(row: any) {
    let echarts = this.optionsEcharts.filter((item: any) => {
      return item.group === row.group;
    });
    this.echartsLabel = echarts;
    echarts = [];
  }
  public leakClear(value: string): void {
    this.searchWords[0] = '';
    this.getOldSample();
  }
  public leakSearch(value: string): void {
    this.getOldSample();
    const reg = new RegExp(value);
    const data: any = [];
    this.leakSrcData.data.map(item => {
      if (reg.test(item.objects)) {
        data.push(item);
      }
    });
    this.leakSrcData.data = data;
  }
  // 栈帧池
  public getStackPool(oldStackPool: any) {
    this.stackSrcData.data = [];
    for (const i of oldStackPool) {
      this.stackSrcData.data.push({ stack: i });
    }
    oldStackPool = [];
  }
  public getPool(row: any) {
    this.getPoolValue(row);
    this.getEcharts(row);
    this.setOption();
    this.leakSrcData.data.forEach((item) => {
      item.isSelect = false;
    });
    row.isSelect = true;
  }
  // 引用链
  public getReferPool(referPool: any) {
    this.referSrcData.data = [];
    for (const i of referPool) {
      this.referSrcData.data.push({ refer: i });
    }
    referPool = [];
  }
  //  echarts时间排序
  private sortEchartsData(data: Array<any>) {
    const newData = data.sort((a, b) => {
      return new Date(a.time).getTime() - new Date(b.time).getTime();
    });
    return newData;
  }
  private showLoding() {
    document.getElementById('sample-loading-box').style.display = 'flex';
  }
  private closeLoding() {
    document.getElementById('sample-loading-box').style.display = 'none';
  }
  // 时间格式
  public format(time: any) {
    const date = new Date(time);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const second = date.getSeconds();
    const millsecond = date.getMilliseconds();
    const months = month < 10 ? `0${month}` : month;
    const dates = day < 10 ? `0${day}` : day;
    const hours = hour < 10 ? `0${hour}` : hour;
    const minutes = minute < 10 ? `0${minute}` : minute;
    const seconds = second < 10 ? `0${second}` : second;
    const mis = millsecond < 100 ? millsecond < 10 ? `00${millsecond}` : `0${millsecond}` : `${millsecond}`;
    return `${year}-${months}-${dates} ${hours}:${minutes}:${seconds}.${mis}`;
  }
  // 时间排序
  public sortTime(time: any) {
    if (time) {
      const arr = time
        .map((item: any) => {
          return (item = item.replace(/:/g, ''));
        })
        .sort();

      const oddTime: any = [];
      const newTime = arr.map((item: any, index: any) => {
        oddTime[index] = '';
        for (let i = 0; i < item.length; i++) {
          oddTime[index] += item[i];
          if (i === 1 || i === 3) {
            oddTime[index] += ':';
          }
        }
        return oddTime[index];
      });
      return newTime;
    }
  }
  // 换算
  public getMib(b: any) {
    const m = (b / 1024 / 1024).toFixed(2);
    return m;
  }
  //  科学计数
  public getFullNum(num: any) {
    if (num < 0) {
      return (num = -1);
    } else if (num < 1000) {
      return num;
    } else {
      const n = Math.floor(Math.log10(num));
      const s = Math.log10(num);
      const y = s - n;
      const effectNum = Math.pow(10, y).toFixed(2);
      return `${effectNum}x10^${n}`;
    }
  }
  public importCache() {
    this.finishLeak = this.downloadService.downloadItems.leak.isFinish;
    this.stackPool = this.downloadService.downloadItems.leak.stackPool;
    this.referPool = this.downloadService.downloadItems.leak.referPool;
    this.oldSample = this.downloadService.downloadItems.leak.oldSample;
    this.finishReport = this.downloadService.downloadItems.leak.finishReport;
    this.suggestArr = this.downloadService.downloadItems.leak.suggestArr;
  }

  onChartInit(ec: any) {
    this.echartsInstance = ec;
  }

  public timeLineData(event: any) {
    this.leakViewOption.dataZoom[0].start = event.start;
    this.leakViewOption.dataZoom[0].end = event.end;
    this.echartsInstance.setOption({
      dataZoom: this.leakViewOption.dataZoom
    });
  }
  public handleDatazoom(event: any) {
    this.leakTimeLine.dataConfig({
      start: event.batch[0].start,
      end: event.batch[0].end,
    });
  }
}
