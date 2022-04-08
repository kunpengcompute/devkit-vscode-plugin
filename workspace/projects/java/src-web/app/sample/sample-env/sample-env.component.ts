import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild, SecurityContext } from '@angular/core';
import { StompService } from '../../service/stomp.service';
import { ActivatedRoute, Router } from '@angular/router';
import { I18nService } from '../../service/i18n.service';
import {
  TiTableColumns,
  TiTableRowData,
  TiTableSrcData
} from '@cloud/tiny3';
import { Subscription } from 'rxjs';
import { MessageService } from '../../service/message.service';
import { SamplieDownloadService } from '../../service/samplie-cache.service';
import { LibService } from '../../service/lib.service';
import { DomSanitizer } from '@angular/platform-browser';
import { graphic } from 'echarts';
@Component({
  selector: 'app-sample-env',
  templateUrl: './sample-env.component.html',
  styleUrls: ['./sample-env.component.scss']
})
export class SampleEnvComponent implements OnInit, AfterViewInit, OnDestroy {
  public jvmId = '';
  public cpuViewOption = {};
  public stompClient: any;
  public recordId = '';
  public topicUrl = '';
  public searchProp: any = {
    placeholder: 'please input search key',
    value: ''
  };
  public searchEnv: any = {
    placeholder: 'please input search key',
    value: ''
  };
  // 表格部分
  public displayed: Array<TiTableRowData> = []; // 表示表格实际呈现的数据（开发者默认设置为[]即可）
  public srcData: TiTableSrcData;
  public selectData: any = {
    searchOptions: [],
    searchKey: {
      label: '',
      value: ''
    }
  };
  public searchWords: Array<string> = [this.searchProp.value];
  public searchKeys: Array<string> = [''];
  public columns: Array<TiTableColumns> = [];
  public noDadaInfo = '';
  public envInfoNoDataFlag = false;

  public envDisplayed: Array<TiTableRowData> = []; // 表示表格实际呈现的数据（开发者默认设置为[]即可）
  public envSrcData: TiTableSrcData;
  public selectDataRight: any = {
    searchOptions: [],
    searchKey: {
      label: '',
      value: ''
    }
  };
  public envSearchWords: Array<string> = [this.searchEnv.value];
  public envSearchKeys: Array<string> = [''];
  public envColumns: Array<TiTableColumns> = [];
  // info部分
  public infoLabel: any = [];
  public lineColorList = [
    '#267DFF',
    '#00BFC9',
    '#41BA41',
    '#7adfa0',
    '#f6df66',
    '#fdca5a',
    '#fa8e5a',
    '#f45c5e',
    '#f3689a',
    '#a97af8',
    '#4c6bc2',
    '#33b0a6'
  ];
  // 存储数据
  public sysEnv: any;
  public cpuInofo: Array<any> = [];
  public envContent: Array<any> = [];
  public echartsInstance: any;
  i18n: any;

  constructor(
    private stompService: StompService,
    private route: ActivatedRoute,
    private router: Router,
    public i18nService: I18nService,
    private msgService: MessageService,
    private downloadService: SamplieDownloadService,
    private el: ElementRef,
    private libService: LibService,
    public domSanitizer: DomSanitizer
  ) {
    this.i18n = this.i18nService.I18n();
    this.selectData.searchOptions = [
      {
        label: this.i18n.protalserver_sampling_enviroment.spkeyword,
        value: 'keyworad'
      },
      {
        label: this.i18n.protalserver_sampling_enviroment.spvalue,
        value: 'value'
      }
    ];
    this.searchProp.placeholder = this.i18n.searchBox.mutlInfo;
    this.selectData.searchKey = this.selectData.searchOptions[0];
    this.searchKeys[0] = this.selectData.searchKey.value;
    this.selectDataRight.searchOptions = [
      {
        label: this.i18n.protalserver_sampling_enviroment_ev.keyword,
        value: 'keyworad'
      },
      {
        label: this.i18n.protalserver_sampling_enviroment_ev.value,
        value: 'value'
      }
    ];
    this.searchEnv.placeholder = this.i18n.searchBox.mutlInfo;
    this.selectDataRight.searchKey = this.selectDataRight.searchOptions[0];
    this.envSearchKeys[0] = this.selectDataRight.searchKey.value;
  }
  public getDataTimer: any = null;
  public dataLens = 0;
  public envDatas: Array<any> = [];
  private wsFinishSub: Subscription;
  private wsFinishSug: Subscription;
  public finishENV = false;
  public suggestArr: any;
  public hoverClose: any;
  public isSuggest = false;
  public sugtype = 0;
  public isLoading: any = false;
  @ViewChild('analysis ', { static: false }) analysis: any;
  ngOnInit() {
    this.noDadaInfo = this.i18n.common_term_task_nodata;
    this.infoLabel = [
      {
        title: 'cpu',
        value: ''
      },
      {
        title: 'cores',
        value: ''
      },
      {
        title: 'thread',
        value: ''
      },
      {
        title: 'nymber',
        value: ''
      },
      {
        title: 'memory',
        value: ''
      },
      {
        title: 'os',
        value: ''
      }
    ];

    this.srcData = {
      data: [],
      state: {
        searched: false,
        sorted: false,
        paginated: false
      }
    };
    this.envSrcData = {
      data: [],
      state: {
        searched: false,
        sorted: false,
        paginated: false
      }
    };
    this.columns = [
      {
        title: 'Keyword',
        width: '30%',
        sortKey: 'keyword'
      },
      {
        title: 'Value',
        width: '70%',
        sortKey: 'value'
      }
    ];
    this.envColumns = [
      {
        title: 'Keyword',
        width: '30%',
        sortKey: 'keyword'
      },
      {
        title: 'Value',
        width: '70%',
        sortKey: 'value'
      }
    ];
    this.recordId = sessionStorage.getItem('record_id');
    this.importCache();
    if (this.finishENV) {
      this.setOptions();
      this.initSys();
      this.initProp();
      this.initEnv();
      return;
    }
    this.isLoading = true;
    let tempTimer = setTimeout(() => {
      if (!this.downloadService.downloadItems.env.isFinish) {
        this.getSamplingData('env', this.recordId);
        this.finishENV = true;
        this.downloadService.downloadItems.env.isFinish = true;
      }
      clearTimeout(tempTimer);
      tempTimer = null;
    }, 1000);
    const swState = sessionStorage.getItem('wsState');
    if (swState === 'success') {
      this.parseData();
      this.isLoading = false;
    }
    this.wsFinishSub = this.msgService.getMessage().subscribe(msg => {
      if (msg.type === 'wsFinish') {
        this.parseData();
        this.isLoading = false;
      }
      if (msg.type === 'env') {
        this.suggestArr = msg.data;
        this.downloadService.downloadItems.env.suggestArr = this.suggestArr;
        this.isLoading = false;
      }
    });
    if (this.suggestArr.length === 0) {
      this.suggestArr = this.downloadService.downloadItems.env.suggestArr;
    }
  }
  private parseData() {
    if (this.stompService.sampleDatas11.length === 0) { return; }
    this.envDatas = this.stompService.sampleDatas11;
    this.envDatas.forEach(temp => {
      if (temp.type === 'ENV' && temp.content === 'FINISH_FLAG') {
        this.finishENV = true;
        this.isLoading = false;
        return;
      }
      if (temp.type === 'CPU_STATISTICS') {
        this.envContent.push(...temp.content);
      }
      if (temp.type === 'SYSTEM_ENV') {
        this.sysEnv = temp.content;
        this.initSys();
        this.initProp();
        this.initEnv();
      }
    });
    this.cpuInofo = this.sortEchartsData(this.envContent);
    this.setOptions();
    this.envContent = [];
  }

  ngAfterViewInit() {
    // this.cpuViewOption = this.setOptions();
  }

  ngOnDestroy() {
    clearTimeout(this.getDataTimer);
    this.getDataTimer = null;
    this.downloadService.downloadItems.env.isFinish = this.finishENV;
    this.downloadService.downloadItems.env.cpuInofo = this.cpuInofo;
    this.downloadService.downloadItems.env.sysEnv = this.sysEnv;
    if (this.wsFinishSub) { this.wsFinishSub.unsubscribe(); }
    if (this.wsFinishSug) { this.wsFinishSug.unsubscribe(); }
    this.isLoading = false;
  }
  propSearch(value: string): void {
    this.searchKeys[0] = this.selectData.searchKey.value;
    this.searchWords[0] = value;
  }
  propClear(value: string): void {
    this.searchWords[0] = '';
  }
  envSearch(value: string): void {
    this.envSearchKeys[0] = this.selectDataRight.searchKey.value;
    this.envSearchWords[0] = value;
  }
  envClear(value: string): void {
    this.envSearchWords[0] = '';
  }
  initSys() {
    if (!this.sysEnv) { return; }
    this.infoLabel[0].value = this.sysEnv[0].cpu.type;
    this.infoLabel[1].value = this.sysEnv[0].cpu.cores;
    this.infoLabel[5].value = this.sysEnv[0].os.split('\n').join('');
    const mem = this.sysEnv[0].totalPhysicalMemorySize / 1024 / 1024 / 1024;
    if (mem > 1) {
      this.infoLabel[4].value = mem.toFixed(2) + ' GB';
    } else {
      this.infoLabel[4].value =
        Math.floor(this.sysEnv[0].totalPhysicalMemorySize / 1024 / 1024) +
        ' MB';
    }
  }
  initProp() {
    this.srcData.data = [];
    let propDatas: any = [];
    if (this.sysEnv) {
      this.sysEnv.forEach((env: any) => {
        if (env.systemProperties != null) {
          for (const key of Object.keys(env.systemProperties)) {
            if (Object.prototype.hasOwnProperty.call(env.systemProperties, key)) {
              const element = env.systemProperties[key];
              propDatas.push({
                keyworad: key,
                value: element,
                isKeyTip: false,
                isValTip: false
              });
            }
          }
        }
      });
    }
    propDatas = propDatas.sort((a: any, b: any): number => {
      return a.keyworad.localeCompare(b.keyworad);
    });
    this.srcData.data = propDatas;
  }
  public onHoverClose(msg?: any) {
    this.hoverClose = msg;
  }
  closeSuggest() {
    this.hoverClose = '';
    this.isSuggest = false;
  }
  closeHandle(e: any) {
    this.isSuggest = false;

  }
  public initEnv() {
    this.envSrcData.data = [];
    let variables: any = [];
    if (this.sysEnv) {
      this.sysEnv.forEach((env: any) => {
        if (env.environmentVariables != null) {
          for (const key of Object.keys(env.environmentVariables)) {
            if (Object.prototype.hasOwnProperty.call(env.environmentVariables, key)) {
              const element = env.environmentVariables[key];
              variables.push({
                keyworad: key,
                value: element,
                isKeyTip: false,
                isValTip: false
              });
            }
          }
        }
      });
    }
    variables = variables.sort((a: any, b: any): number => {
      return a.keyworad.localeCompare(b.keyworad);
    });
    this.envSrcData.data = variables;
  }
  public openSuggest() {
    this.isSuggest = true;
  }
  private getRecordId() {
    const url = this.router.url;
    const path = this.route.routeConfig.path;
    let params = url.slice(10);
    if (path) {
      const lastIndex = params.lastIndexOf('/' + path);
      params = params.slice(0, lastIndex);
    }
    return params;
  }
  private sortEchartsData(data: Array<any>) {
    const newData = data.sort((a, b) => {
      return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
    });
    return newData;
  }
  public setOptions() {
    const jvmUser: any = [];
    const jvmSystem: any = [];
    const machineTotal: any = [];
    const time: any = [];
    let toolTipDate: any = '';
    this.cpuInofo.forEach(item => {
      jvmUser.push(Math.floor(item.jvmUser * 10000) / 100);
      jvmSystem.push(Math.floor(item.jvmSystem * 10000) / 100);
      machineTotal.push(Math.floor(item.machineTotal * 10000) / 100);
      time.push(this.libService.dateFormat(new Date(item.startTime), 'hh:mm:ss'));
    });
    toolTipDate = this.libService.dateFormat(new Date(this.cpuInofo[0]?.startTime), 'yyyy/MM/dd');
    this.downloadService.dataSave.toolTipDate = toolTipDate;
    const arrAll = jvmUser.concat(jvmSystem).concat(machineTotal);
    const maxValue = Math.max(...arrAll);
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
            let html = ``;
            html += `<div><div>${this.domSanitizer.sanitize(SecurityContext.HTML,
              toolTipDate + ' ' + params[0].axisValueLabel)}</div>
                `;
            params.forEach((param: any, index: any) => {
              html += `
              <div style='margin-top:8px;display:flex;justify-content: space-between; align-items: center;'>
              <div style="float:left;">
                <div style="display: inline-block;width: 8px;height: 8px;
                background-color: ${params[index].color};margin-right: 8px;"></div>
                <div style='display:inline-block;'>
                ${this.domSanitizer.sanitize(SecurityContext.HTML, param.seriesName)}</div></div>
                <div style='margin-left:24px;display:inline-block;'>
                ${this.domSanitizer.sanitize(SecurityContext.HTML, param.data)}%</div>
                </div>
                `;
            });
            html += `</div>`;
            return html;
          }
        }
      },
      legend: {
        itemHeight: 8,
        itemWidth: 8,
        icon: 'rect',
        data: [
          this.i18n.protalserver_sampling_enviroment.jvmUserMode,
          this.i18n.protalserver_sampling_enviroment.jvmSystemMode, this.i18n.protalserver_sampling_enviroment.usaged
        ],
        x: 'right',
        padding: [
          5,  // 上
          5, // 右
          70,  // 下
          5, // 左
        ]
      },

      grid: {
        top: '8%',
        left: '20',
        right: '40',
        bottom: '0%',
        containLabel: true
      },
      xAxis: [
        {
          type: 'category',
          data: time.map((str: any) => {
            return str.replace(' ', '\n');
          }),
          boundaryGap: false,
          axisTick: {
            alignWithLabel: true,
            show: true
          },
          axisLabel: {
            align: 'center',
            textStyle: {
              color: '#222222'
            }
          },
          axisLine: {
            lineStyle: {
              color: '#E1E6EE',
              width: '2'
            }
          }
        }
      ],
      yAxis: [
        {
          type: 'value',
          axisLabel: {
            formatter: '{value} %',
            textStyle: {
              color: '#222222'
            }
          },
          splitLine: {
            show: true,
            lineStyle: {
              type: 'dashed'
            }
          },
          max: maxValue,
          min: 0,
          axisLine: {
            lineStyle: {
              color: '#E1E6EE',
              width: '2'
            }
          }
        }
      ],
      series: [
        {
          name: this.i18n.protalserver_sampling_enviroment.jvmUserMode,
          type: 'line',
          stack: 'jvmUser',
          areaStyle: {
            color: new graphic.LinearGradient(0, 1, 0, 0, [{
              offset: 0,
              color: 'rgb(38,125,255,0.02)',
            }, {
              offset: 1,
              color: 'rgb(38,125,255,0.15)'
            }])
          },
          lineStyle: {
            color: this.lineColorList[0]
          },
          itemStyle: {
            normal: {
              color: this.lineColorList[0]
            }
          },
          showSymbol: false,
          symbolSize: 6,
          data: jvmUser
        },
        {
          name: this.i18n.protalserver_sampling_enviroment.jvmSystemMode,
          type: 'line',
          stack: 'jvmSystem',
          areaStyle: {
            color: new graphic.LinearGradient(0, 1, 0, 0, [{
              offset: 0,
              color: 'rgb(0,191,201,0.02)'
            }, {
              offset: 1,
              color: 'rgb(0,191,201,0.15)'
            }])
          },
          lineStyle: {
            color: this.lineColorList[1]
          },
          itemStyle: {
            normal: {
              color: this.lineColorList[1]
            }
          },
          showSymbol: false,
          symbolSize: 6,
          data: jvmSystem
        },
        {
          name: this.i18n.protalserver_sampling_enviroment.usaged,
          type: 'line',
          stack: 'machineTotal',
          areaStyle: {
            color: new graphic.LinearGradient(0, 1, 0, 0, [{
              offset: 0,
              color: 'rgb(65,186,65,0.02)'
            }, {
              offset: 1,
              color: 'rgb(65,186,65,0.15)'
            }])
          },
          lineStyle: {
            color: this.lineColorList[2]
          },
          itemStyle: {
            normal: {
              color: this.lineColorList[2]
            }
          },
          showSymbol: false,
          symbolSize: 6,
          data: machineTotal
        }
      ]
    };
    this.cpuViewOption = option;
    this.sortTime(time);
  }

  public showTip(content: any, idx: any, td: any, tName: any) {
    let tWidth = 0;
    let tdContainerWidth = 0;
    const span = $(`<span>${this.domSanitizer.sanitize(SecurityContext.HTML, content)}</span>`);
    if (tName === 'env') {
      tWidth = this.el.nativeElement.querySelector('.env-container').offsetWidth;
      const tdPer = Number(this.envColumns[td].width.slice(0, -1));
      tdContainerWidth = tWidth * tdPer / 100 - 20;
      const flag = this.i18nService.isEleTextOverflow(span, tdContainerWidth);
      if (td === 0) {
        this.envSrcData.data[idx].isKeyTip = flag;
      } else {
        this.envSrcData.data[idx].isValTip = flag;
      }
    } else {
      tWidth = this.el.nativeElement.querySelector('.prop-container').offsetWidth;
      const tdPer = Number(this.columns[td].width.slice(0, -1));
      tdContainerWidth = tWidth * tdPer / 100 - 20;
      const flag = this.i18nService.isEleTextOverflow(span, tdContainerWidth);
      if (td === 0) {
        this.srcData.data[idx].isKeyTip = flag;
      } else {
        this.srcData.data[idx].isValTip = flag;
      }
    }

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
  public getSamplingData(type: any, data: any) {
    this.isLoading = true;
    const uuid = this.libService.generateConversationId(8);
    const requestUrl = `/user/queue/sample/records/${data}/${uuid}/${type}`;
    this.stompService.subscribeStompFn(requestUrl);
    this.stompService.startStompRequest('/cmd/sub-record', {
      recordId: data,
      recordType: type.toUpperCase(),
      uuid
    });
  }
  public importCache() {
    this.cpuInofo = this.downloadService.downloadItems.env.cpuInofo;
    this.sysEnv = this.downloadService.downloadItems.env.sysEnv;
    this.finishENV = this.downloadService.downloadItems.env.isFinish;
    this.suggestArr = this.downloadService.downloadItems.env.suggestArr;
  }
}
