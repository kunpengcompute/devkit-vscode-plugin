import { Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit, Renderer2 } from '@angular/core';
import { AxiosService } from 'projects/sys/src-web/app/service/axios.service';
import { TiTableColumns, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import { MytipService } from 'projects/sys/src-web/app/service/mytip.service';
@Component({
  selector: 'app-performance-table',
  templateUrl: './performance-table.component.html',
  styleUrls: ['./performance-table.component.scss']
})
export class PerformanceTableComponent implements OnInit, AfterViewInit {
  constructor(
    public Axios: AxiosService, public i18nService: I18nService,
    public mytip: MytipService, private renderer2: Renderer2) {
    this.i18n = this.i18nService.I18n();
  }
  @Input() projectName: any;
  @Input() taskName: any;
  @Input() analysisType: any;
  @Input() isActive: any;
  @Input() taskid: any;
  @Input() nodeid: any;
  public language = 'zh';
  public i18n: any;
  public resData: any = [];
  public axiosStatus = 0;
  public cpuUsageDisplayData: Array<TiTableRowData> = [];
  public cpuUsageSrcData: TiTableSrcData;
  public cpuAvgDisplayData: Array<TiTableRowData> = [];
  public cpuAvgSrcData: TiTableSrcData;
  public memUsageDisplayData: Array<TiTableRowData> = [];
  public memUsageSrcData: TiTableSrcData;
  public memPagDisplayData: Array<TiTableRowData> = [];
  public memPagSrcData: TiTableSrcData;
  public memSwapDisplayData: Array<TiTableRowData> = [];
  public memSwapSrcData: TiTableSrcData;

  public numaStatisticsDisplayData: Array<TiTableRowData> = []; // numa内存统计
  public numaStatisticsData: TiTableSrcData;


  public diskDisplayData: Array<TiTableRowData> = [];
  public diskSrcData: TiTableSrcData;
  public netOkDisplayData: Array<TiTableRowData> = [];
  public netOkSrcData: TiTableSrcData;
  public netErrorDisplayData: Array<TiTableRowData> = [];
  public netErrorSrcData: TiTableSrcData;
  public currentPage = 1;
  public totalNumber: number;
  public pageSize: { options: Array<number>, size: number } = {
    options: [16, 32, 48, 129],
    size: 16
  };
  public danwei: object = {
    CPU: '',
    '%user': '',
    '%nice': '',
    '%sys': '',
    '%iowait': '',
    '%steal': '',
    '%irq': '',
    '%soft': '',
    '%guest': '',
    '%gnice': '',
    '%idle': '',
    '%cpu': '',
    max_use: '',
    'runq-sz': '',
    'plist-sz': '',
    'ldavg-1': '',
    'ldavg-5': '',
    'ldavg-15': '',
    blocked: '',
    'memfree(KB)': '',
    ' memused(KB)': '',
    memused: '',
    'buffers(KB)': '',
    'cached(KB)': '',
    kbcommit: '',
    commit: '',
    'active(KB)': '',
    'inact(KB)': '',
    'dirty(KB)': '',
    pgpgin: '',
    pgpgout: '',
    fault: '',
    majflt: '',
    pgfree: '',
    'pgscank/': '',
    pgscand: '',
    pgsteal: '',
    vmeff: '',
    pswpin: '',
    pswpout: '',
    tps: '',
    rd_sec: '',
    wr_sec: '',
    'avgrq-sz': '',
    'avgqu-sz': '',
    await: '',
    svctm: '',
    util: '',
    rxpck: '',
    txpck: '',
    rxkB: '',
    txkB: '',
    rxcmp: '',
    txcmp: '',
    rxmcst: '',
    rxerr: '',
    txerr: '',
    coll: '',
    rxdrop: '',
    txdrop: '',
    txcarr: '',
    rxfram: '',
    rxfifo: '',
    txfifo: '',
    max_tps: '',
    max_util: '',
    interleave_hit: '',
    local_node: '',
    numa_foreign: '',
    numa_miss: '',
    numahit: '',
    other_node: '',
    eth_ge: '',
  };
  public toggle = {
    cpu: true,
    cpuUsage: true,
    averageLoad: true,
    memory: true,
    memoryUsage: true,
    memoryPag: false,
    memorySwap: false,
    numaStatistics: true,
    disk: false,
    diskBlock: false,
    net: false,
    netOk: false,
    netError: false,
    consumption: true
  };
  public cpuUsageTitle: Array<TiTableColumns> = [
    {
      title: 'CPU',
      key: 'CPU',
      sortKey: 'CPU'
    },
    {
      title: '%user',
      key: '%user',
      sortKey: '%user'
    },
    {
      title: '%nice',
      key: '%nice',
      sortKey: '%nice'
    },
    {
      title: '%sys',
      key: '%sys',
      sortKey: '%sys',
      compareFn: (a: any, b: any, predicate: string): number => {
        return a[predicate].value - b[predicate].value;
      }
    },
    {
      title: '%iowait',
      key: '%iowait',
      sortKey: '%iowait',
      compareFn: (a: any, b: any, predicate: string): number => {
        return a[predicate].value - b[predicate].value;
      }
    },
    {
      title: '%irq',
      key: '%irq',
      sortKey: '%irq'
    },
    {
      title: '%soft',
      key: '%soft',
      sortKey: '%soft'
    },
    {
      title: '%idle',
      key: '%idle',
      sortKey: '%idle'
    },
    {
      title: '%cpu',
      key: '%cpu',
      sortKey: '%cpu'
    },
    {
      title: 'max_use',
      key: 'max_use',
      sortKey: 'max_use',
      compareFn: (a: any, b: any, predicate: string): number => {
        return Number(a[predicate].split('_')[0]) - Number(b[predicate].split('_')[0]);
      }
    }
  ];
  public cpuAvgTitle: Array<TiTableColumns> = [
    {
      title: 'runq-sz',
      key: 'runq-sz',
      sortKey: 'runq-sz'
    },
    {
      title: 'plist-sz',
      key: 'plist-sz',
      sortKey: 'plist-sz'
    },
    {
      title: 'ldavg-1',
      key: 'ldavg-1',
      sortKey: 'ldavg-1'
    },
    {
      title: 'ldavg-5',
      key: 'ldavg-5',
      sortKey: 'ldavg-5'
    },
    {
      title: 'ldavg-15',
      key: 'ldavg-15',
      sortKey: 'ldavg-15'
    },
    {
      title: 'blocked',
      key: 'blocked',
      sortKey: 'blocked'
    }
  ];
  public memUsageTitle: Array<TiTableColumns> = [
    {
      title: 'memfree(KB)',
      key: 'memfree(KB)'
    },
    {
      title: 'avail(KB)',
      key: 'avail(KB)'
    },
    {
      title: 'memused(KB)',
      key: 'memused(KB)'
    },
    {
      title: '%memused',
      key: '%memused'
    },
    {
      title: 'buffers(KB)',
      key: 'buffers(KB)'
    },
    {
      title: 'cached(KB)',
      key: 'cached(KB)'
    },
    {
      title: 'active(KB)',
      key: 'active(KB)'
    },
    {
      title: 'inact(KB)',
      key: 'inact(KB)'
    },
    {
      title: 'dirty(KB)',
      key: 'dirty(KB)'
    }

  ];
  public memPagTitle: Array<TiTableColumns> = [
    {
      title: 'pgpgin/s',
      key: 'pgpgin/s'
    },
    {
      title: 'pgpgout/s',
      key: 'pgpgout/s'
    },
    {
      title: 'fault/s',
      key: 'fault/s'
    },
    {
      title: 'majflt/s',
      key: 'majflt/s'
    },
    {
      title: 'pgscank/s',
      key: 'pgscank/s'
    },
    {
      title: 'pgscand/s',
      key: 'pgscand/s'
    },
    {
      title: '%vmeff',
      key: '%vmeff'
    }
  ];
  public memSwapTitle: Array<TiTableColumns> = [
    {
      title: 'pswpin/s',
      key: 'pswpin/s'
    },
    {
      title: 'pswpout/s',
      key: 'pswpout/s'
    }
  ];

  public numaStatisticsTitle: Array<TiTableColumns> = [
    {
      title: '名称',
    },
    {
      title: 'interleave_hit',
      key: 'interleave_hit'
    },
    {
      title: 'local_node',
      key: 'local_node'
    },
    {
      title: 'numa_foreign',
      key: 'numa_foreign'
    },
    {
      title: 'numa_miss',
      key: 'numa_miss'
    },
    {
      title: 'numa_hit',
      key: 'numahit'
    },
    {
      title: 'other_node',
      key: 'other_node'
    },
  ];

  public diskTitle: Array<TiTableColumns> = [
    {
      title: 'DEV',
      key: 'DEV'
    },
    {
      title: 'tps',
      key: 'tps'
    },
    {
      title: 'rd(KB)/s',
      key: 'rd(KB)/s'
    },
    {
      title: 'wr(KB)/s',
      key: 'wr(KB)/s'
    },
    {
      title: 'avgrq-sz',
      key: 'avgrq-sz'
    },
    {
      title: 'avgqu-sz',
      key: 'avgqu-sz'
    },
    {
      title: 'await',
      key: 'await'
    },
    {
      title: 'svctm',
      key: 'svctm'
    },
    {
      title: '%util',
      key: '%util',
      sortKey: '%util',
      mycompareFn: this.mycompareFn
    },
    {
      title: 'max_tps',
      key: 'max_tps',
    },
    {
      title: 'max_util',
      key: 'max_util',
    },
  ];
  public netOkTitle: Array<TiTableColumns> = [
    {
      title: 'IFACE',
      key: 'IFACE'
    },
    {
      title: 'rxpck/s',
      key: 'rxpck/s'
    },
    {
      title: 'txpck/s',
      key: 'txpck/s'
    },
    {
      title: 'rxkB/s',
      key: 'rxkB/s'
    },
    {
      title: 'txkB/s',
      key: 'txkB/s'
    }, {
      title: 'eth_ge',
      key: 'eth_ge'
    }
  ];
  public netErrorTitle: Array<TiTableColumns> = [
    {
      title: 'IFACE',
      key: 'IFACE'
    },
    {
      title: 'rxerr/s',
      key: 'rxerr/s'
    },
    {
      title: 'txerr/s',
      key: 'txerr/s'
    },
    {
      title: 'coll/s',
      key: 'coll/s'
    },
    {
      title: 'rxdrop/s',
      key: 'rxdrop/s'
    },
    {
      title: 'txdrop/s',
      key: 'txdrop/s'
    },
    {
      title: 'txcarr/s',
      key: 'txcarr/s'
    },
    {
      title: 'rxfram/s',
      key: 'rxfram/s'
    },
    {
      title: 'rxfifo/s',
      key: 'rxfifo/s'
    },
    {
      title: 'txfifo/s',
      key: 'txfifo/s'
    }
  ];
  // 能耗
  public consumptionTitle: Array<TiTableColumns> = [];
  public consumptionDisplayData: Array<TiTableRowData> = [];
  public consumptionContentData: TiTableSrcData;
  public consumptionCurrentPage = 1;
  public consumptionPageSize = {
    options: [10, 20, 50, 100],
    size: 10
  };

  // 优化建议提示
  public suggestMsg: any = [];
  public tabSearch = '阈值设置';
  public minValue: number;
  public maxValue: number;
  public searchTips: any;
  public leftData = 0;  // 距离左侧的距离
  public widthData = 200; // 默认的宽度
  public rightData = 200; // 距离左侧的距离
  public leftShow = false;
  public rightShow = false;
  public format = 'n0';
  public rawIndex = ''; // 用于判断点击的是否是上次那个
  public searchIndex = '';   // 判断点击的是第几个
  public searchInitialization = { start: 0, end: 100 };    // 百分比初始化值  用于筛选时的保存状态
  public Utilization: any = [];
  public minShow = false;
  public minValue2 = '0%';
  public maxShow = false;
  public maxValue2 = '100%';
  ngOnInit() {
    this.minValue = 0;
    this.maxValue = 100;
    this.tabSearch = this.i18n.sys_summary.cpupackage_tabel.cpuDataConfig;
    setTimeout(() => {
      this.getData();
    }, 50);
    if (sessionStorage.getItem('language') === 'en-us') {
      this.language = 'en';
    } else {
      this.language = 'zh';
    }

    this.numaStatisticsTitle = [
      {
        title: this.i18n.name,
        key: 'numaName'
      },
      {
        title: 'interleave_hit',
        key: 'interleave_hit'
      },
      {
        title: 'local_node',
        key: 'local_node'
      },
      {
        title: 'numa_foreign',
        key: 'numa_foreign'
      },
      {
        title: 'numa_miss',
        key: 'numa_miss'
      },
      {
        title: 'numa_hit',
        key: 'numahit'
      },
      {
        title: 'other_node',
        key: 'other_node'
      },
    ];
    this.renderer2.listen(window, 'scroll', () => {
      if (this.searchTips) {
        this.searchTips.hide();
      }
    });
    this.consumptionTitle = [
      {
        title: this.i18n.sys_summary.cpupackage_tabel.averageUnits
      },
      {
        title: this.i18n.sys_summary.cpupackage_tabel.maxPower
      },
      {
        title: this.i18n.sys_summary.cpupackage_tabel.minPower
      },
    ];
  }
  OnDestroy(): void {
    this.removeScroll();
  }

  ngAfterViewInit(): void {
    this.listenerClick();
    this.listenerScroll();
  }

  public async getData() {
    this.axiosStatus = 1;
    const params = {
      'node-id': this.nodeid,
      'query-type': 'summary',
      'query-target': '', // 例如cpu_usage, cpu_avgload, mem_usage等
    };
    try {
      const res = await this.Axios.axios.get(`/tasks/${encodeURIComponent(this.taskid)}/sys-performance/`, {
        params, headers: {
          showLoading: false,
        },
      });
      this.axiosStatus = 2;
      this.resData = res.data;
      if (Object.prototype.hasOwnProperty.call(res.data, 'cpu_usage')) {
        this.initCpu();
      }
      if (Object.prototype.hasOwnProperty.call(res.data, 'disk_usage')) {
        this.initDisk();
      }
      if (Object.prototype.hasOwnProperty.call(res.data, 'mem_usage')) {
        this.initMem();
      }
      if (Object.prototype.hasOwnProperty.call(res.data, 'net_info')) {
        this.initNet();
      }
      if (Object.prototype.hasOwnProperty.call(res.data, 'cfg_sys_power')) {
        this.initConsumption();
      }
    } catch (ettor) {
      this.axiosStatus = 2;
    }

  }

  /**
   * 设置优化建议集合
   */
  public setSuggestions(data: any) {
    if (data && data.suggestion && data.suggestion.length) {
      const suggestions = data.suggestion;
      suggestions.map((item: any) => {
        this.suggestMsg.push({
          title: this.language === 'zh' ? item.title_chs : item.title_en,
          msgbody: this.language === 'zh' ? item.suggest_chs : item.suggest_en
        });
      });
    }
  }

  public initCpu() {
    const data = this.resData.cpu_usage;
    this.totalNumber = data.specs.length;

    this.setSuggestions(data);

    data.specs.forEach((item: any, index: any) => {
      this.cpuUsageDisplayData[index] = data[item];
      this.cpuUsageDisplayData[index]['%cpu'] = parseFloat(this.cpuUsageDisplayData[index]['%cpu']);
      this.cpuUsageDisplayData[index].CPU = isNaN(item) ? item : +item;
      this.Utilization[index] = data[item];   // 保存原始数据
      this.Utilization[index].CPU = isNaN(item) ? item : +item;
    });
    this.cpuUsageSrcData = { // 表格源数据，开发者对表格的数据设置请在这里进行
      data: this.cpuUsageDisplayData, // 源数据
      state: {
        searched: false, // 源数据未进行搜索处理
        sorted: false, // 源数据未进行排序处理
        paginated: false // 源数据未进行分页处理
      }
    };
    const data2 = this.resData.cpu_avgload;
    const titles = Object.keys(data2);
    titles.forEach(item => {
      if (item === 'rung-sz') {
        this.resData.cpu_avgload['runq-sz'] = this.resData.cpu_avgload['rung-sz'];       // 暂时规避后端字段错误
      }
    });


    this.cpuAvgDisplayData[0] = data2;
    this.cpuAvgSrcData = { // 表格源数据，开发者对表格的数据设置请在这里进行
      data: this.cpuAvgDisplayData, // 源数据
      state: {
        searched: false, // 源数据未进行搜索处理
        sorted: false, // 源数据未进行排序处理
        paginated: false // 源数据未进行分页处理
      }

    };
  }
  public changeSize() {
    this.cpuUsageDisplayData = this.cpuUsageDisplayData.slice(0, 30);
  }
  public initMem() {
    const data = this.resData.mem_usage;
    this.setSuggestions(data);

    this.memUsageDisplayData[0] = data;
    this.memUsageSrcData = { // 表格源数据，开发者对表格的数据设置请在这里进行
      data: this.memUsageDisplayData, // 源数据
      state: {
        searched: false, // 源数据未进行搜索处理
        sorted: false, // 源数据未进行排序处理
        paginated: false // 源数据未进行分页处理
      }

    };
    const data2 = this.resData.mem_page;

    this.memPagDisplayData[0] = data2;
    this.memPagSrcData = { // 表格源数据，开发者对表格的数据设置请在这里进行
      data: this.memPagDisplayData, // 源数据
      state: {
        searched: false, // 源数据未进行搜索处理
        sorted: false, // 源数据未进行排序处理
        paginated: false // 源数据未进行分页处理
      }

    };

    const data3 = this.resData.mem_swap;
    this.setSuggestions(data3);

    this.memSwapDisplayData[0] = data3;
    this.memSwapSrcData = { // 表格源数据，开发者对表格的数据设置请在这里进行
      data: this.memSwapDisplayData, // 源数据
      state: {
        searched: false, // 源数据未进行搜索处理
        sorted: false, // 源数据未进行排序处理
        paginated: false // 源数据未进行分页处理
      }
    };

    const data4 = this.resData.mem_numa;
    this.setSuggestions(data4);
    if (data4 !== null) {
      Object.keys(data4).forEach(key => {
        const data5 = data4[key];
        data5.numaName = key;
        this.numaStatisticsDisplayData.push(data5);
      });
    }

    this.numaStatisticsData = { // 表格源数据，开发者对表格的数据设置请在这里进行
      data: this.numaStatisticsDisplayData, // 源数据
      state: {
        searched: false, // 源数据未进行搜索处理
        sorted: false, // 源数据未进行排序处理
        paginated: false // 源数据未进行分页处理
      }
    };
  }

  public initDisk() {
    const data = this.resData.disk_usage;

    this.setSuggestions(data);

    data.specs.forEach((item: any, index: any) => {
      this.diskDisplayData[index] = data[item];
      this.diskDisplayData[index].DEV = item;
    });
    this.diskSrcData = { // 表格源数据，开发者对表格的数据设置请在这里进行
      data: this.diskDisplayData, // 源数据
      state: {
        searched: false, // 源数据未进行搜索处理
        sorted: false, // 源数据未进行排序处理
        paginated: false // 源数据未进行分页处理
      }

    };


  }
  public initNet() {
    const data = this.resData.net_info;

    this.setSuggestions(data);

    data.specs.forEach((item: any, index: any) => {
      this.netOkDisplayData[index] = data[item];
      // 网络IO 后台数据有所改变 增加字段IFACE 如果存在优化建议 表格第一列显示小火箭
      this.netOkDisplayData[index].suggest = data[item].IFACE || ''; // 这个要在下一行的前面
      this.netOkDisplayData[index].IFACE = item;
    });
    this.netOkSrcData = { // 表格源数据，开发者对表格的数据设置请在这里进行
      data: this.netOkDisplayData, // 源数据
      state: {
        searched: false, // 源数据未进行搜索处理
        sorted: false, // 源数据未进行排序处理
        paginated: false // 源数据未进行分页处理
      }

    };

    const data2 = this.resData.net_error_info;

    data2.specs.forEach((item: any, index: any) => {
      this.netErrorDisplayData[index] = data2[item];
      this.netErrorDisplayData[index].IFACE = item;
    });
    this.netErrorSrcData = { // 表格源数据，开发者对表格的数据设置请在这里进行
      data: this.netErrorDisplayData, // 源数据
      state: {
        searched: false, // 源数据未进行搜索处理
        sorted: false, // 源数据未进行排序处理
        paginated: false // 源数据未进行分页处理
      }

    };
  }
  public initConsumption() {
    const data = this.resData.cfg_sys_power;
    this.setSuggestions(data);
    const consumption = [];
    if (data.length > 0) {
      const obj = {
        average: data[0] ? data[0] : '--',
        max: data[1] ? data[1] : '--',
        min: data[2] ? data[2] : '--'
      };
      consumption.push(obj);
    }
    this.consumptionContentData = {
      data: consumption,
      state: {
        searched: false, // 源数据未进行搜索处理
        sorted: false, // 源数据未进行排序处理
        paginated: false // 源数据未进行分页处理
      }
    };
  }
  public mycompareFn(a: any, b: any, predicate: string) {
    return b[predicate].value - a[predicate].value;
  }

  /**
   * 获取多条建议
   */
  public getMultipleSug(index: any, item: any) {
    return `${index + 1} ${item}`;
  }


  // 筛选弹窗展示隐藏
  public searchShow(e: any, i: any) {
    e.show();
    this.searchIndex = i; // 判断点击的是第几个
    if (this.searchIndex === this.rawIndex) {   // 和上次是同一个就修改最大值和最小值
      this.minValue = Number(this.searchInitialization.start);
      this.maxValue = Number(this.searchInitialization.end);
    } else {
      this.minValue = 0;
      this.maxValue = 100;
    }
    this.minValue2 = JSON.parse(JSON.stringify(this.minValue)) + '%';
    this.maxValue2 = JSON.parse(JSON.stringify(this.maxValue)) + '%';
    this.maxShow = false;
    this.minShow = false;
    this.initializationChange(); // 改变百分比 初始化位置
    this.searchTips = e;   // 保存弹窗实例
  }

  // 最大值失去焦点
  public maxOnBlur() {
    this.maxValue = Number(this.maxValue);
    this.minValue = Number(this.minValue);
    if (this.maxValue > 100) {
      this.maxValue = 100;
    }
    if (this.minValue > this.maxValue) {
      this.maxValue = 100;
    }
    this.initializationChange();
    this.maxValue2 = JSON.parse(JSON.stringify(this.maxValue)) + '%';
    this.maxShow = false;
  }
  // 筛选最大值改变事件
  public maxChange(e: any) {
    if (e.keyCode === 110 || e.keyCode === 190) {
      e.returnValue = false;
    }
  }
  // 最小值失去焦点
  public minOnBlur() {
    this.maxValue = Number(this.maxValue);
    this.minValue = Number(this.minValue);
    if (this.minValue < 0) {
      this.minValue = 0;
    }
    if (this.minValue > 100) {
      this.minValue = 99;
    }
    if (this.minValue > this.maxValue) {
      this.minValue = 0;
    }
    this.initializationChange();
    this.minValue2 = JSON.parse(JSON.stringify(this.minValue)) + '%';
    this.minShow = false;
  }
  public onFocus(e: any) {
    this.minShow = true;
    this.maxValue = Number(this.maxValue2.substring(0, this.maxValue2.length - 1));
    this.minValue = Number(this.minValue2.substring(0, this.minValue2.length - 1));
    setTimeout(() => {
      e.nativeElement.focus();
    }, 100);
  }
  public maxFocus(e: any) {
    this.maxShow = true;
    this.minValue = Number(this.minValue2.substring(0, this.minValue2.length - 1));
    this.maxValue = Number(this.maxValue2.substring(0, this.maxValue2.length - 1));
    setTimeout(() => {
      e.nativeElement.focus();
    }, 100);
  }
  // 筛选最小值改变事件
  public minChange(e: any) {
    if (e.keyCode === 110 || e.keyCode === 190) {
      e.returnValue = false;
    }
  }
  // 确认筛选
  public searchConfirm() {
    this.searchTips.hide();
    this.rawIndex = JSON.parse(JSON.stringify(this.searchIndex));  // 确认之后修改基准值
    this.searchInitialization.start = this.minValue;  // 记录当前值
    this.searchInitialization.end = this.maxValue;  // 记录当前值
    this.percentage();
  }
  // 取消筛选
  public searchCancel() {
    this.searchTips.hide();
  }
  // 点击空白取消
  public listenerClick() {
    document.addEventListener('mouseup', (e) => {
      let event: any;
      event = e;
      const tips = $('#tabSearchBox');
      if (!tips.is(event.target) && tips.has(event.target).length === 0 && this.searchTips !== undefined) {
        this.searchTips.hide();
      }
      if (this.leftShow || this.rightShow) {
        this.initialization();
      }
      this.leftShow = false;
      this.rightShow = false;
    });

  }

  // 左边拖动
  public left(e: any) {
    e.preventDefault();
    e.stopPropagation();
    const box = $('#slide');
    this.leftShow = true;
    const select = document.getElementById('range');
    box.on('mousemove', (e1) => {
      if (this.leftShow) {
        let cliX = e1.clientX - box.offset().left;
        if (cliX <= 0) {
          cliX = 0;
        }
        this.leftData = cliX;  // 记录距离左侧的距离
        if (this.leftData + 2 >= this.rightData) {
          this.leftData = this.rightData - 2;
          cliX = this.rightData - 2;
        }
        this.widthData = this.rightData - cliX;  // 记录宽度
        const left = this.leftData / 200 * 100;
        const width = (this.rightData - cliX) / 200 * 100;
        select.style.left = left + '%';
        select.style.width = width + '%';
      }
    });
  }

  // 右边拖动
  public right(e: any) {
    e.preventDefault();
    e.stopPropagation();
    this.rightShow = true;
    const widthBox = document.getElementById('slide');
    const select = document.getElementById('range');
    widthBox.onmousemove = (event) => {
      if (this.rightShow) {
        let cliX = event.clientX - widthBox.getBoundingClientRect().left;
        const boxWidth = widthBox.offsetWidth;
        if (cliX >= boxWidth) {
          cliX = boxWidth;
        }
        if (cliX <= 0) {
          cliX = 0;
        }
        cliX = cliX - this.leftData;
        this.rightData = cliX + this.leftData; // 距离左侧的距离
        if (this.rightData <= (this.leftData + 2)) {
          this.rightData = this.leftData + 2;
          cliX = 2;
        }
        this.widthData = cliX;   // 记录宽度
        const width = cliX / 200 * 100;
        const left = this.leftData / 200 * 100;
        select.style.left = left + '%';
        select.style.width = width + '%';
      }

    };
  }
  // 初始化滑动块的位置
  public initialization() {
    const select = document.getElementById('range');
    const left = Math.round(this.leftData / 200 * 100);
    const width = Math.round(this.widthData / 200 * 100);
    this.minValue = left;
    this.maxValue = (left + width);
    this.leftData = left * 200 / 100;
    this.widthData = width * 200 / 100;
    this.rightData = this.leftData + this.widthData;
    this.minValue2 = JSON.parse(JSON.stringify(this.minValue)) + '%';
    this.maxValue2 = JSON.parse(JSON.stringify(this.maxValue)) + '%';
    select.style.left = left + '%';
    select.style.width = width + '%';
  }

  // 输入框变化 滑块位置变化
  public initializationChange() {
    const select = document.getElementById('range');
    this.leftData = this.minValue * 200 / 100;
    this.widthData = (this.maxValue - this.minValue) * 200 / 100;
    this.rightData = this.leftData + this.widthData;
    select.style.left = this.minValue + '%';
    select.style.width = (this.maxValue - this.minValue) + '%';
  }

  // 百分比筛选方法
  public percentage() {
    this.minValue = Number(this.minValue);
    this.maxValue = Number(this.maxValue);
    let arr = [];
    if (this.searchIndex !== '%iowait' && this.searchIndex !== '%sys' && this.searchIndex !== 'max_use') {
      arr = this.Utilization.filter((item: any) => {
        return this.minValue <= item[this.searchIndex] && item[this.searchIndex] <= this.maxValue;
      });
    } else if (this.searchIndex === '%iowait' || this.searchIndex === '%sys') {
      arr = this.Utilization.filter((item: any) => {
        return this.minValue <= item[this.searchIndex].value && item[this.searchIndex].value <= this.maxValue;
      });
    } else if (this.searchIndex === 'max_use') {
      arr = this.Utilization.filter((item: any) => {
        const data = Number(item[this.searchIndex].split('_')[0]);
        return this.minValue <= data && data <= this.maxValue;
      });
    }
    this.totalNumber = arr.length;
    this.cpuUsageSrcData = { // 表格源数据，开发者对表格的数据设置请在这里进行
      data: arr, // 源数据
      state: {
        searched: false, // 源数据未进行搜索处理
        sorted: false, // 源数据未进行排序处理
        paginated: false // 源数据未进行分页处理
      }
    };
  }

  // 监听滚动事件
  public listenerScroll() {
    const dom = document.getElementsByClassName('summury-box')[0];
    dom.addEventListener('scroll', (e) => {
      if (this.searchTips) {
        this.searchTips.hide();
      }
    });
  }
  // 移除监听事件
  public removeScroll() {
    const dom = document.getElementsByClassName('summury-box')[0];
    dom.removeEventListener('scroll', this.listenerScroll);
  }

}
