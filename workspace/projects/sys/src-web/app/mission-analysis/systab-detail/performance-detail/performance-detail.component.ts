import { Component, OnInit, Input, ElementRef, ViewChild, AfterViewInit, Renderer2 } from '@angular/core';
import { AxiosService } from 'projects/sys/src-web/app/service/axios.service';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import { MytipService } from 'projects/sys/src-web/app/service/mytip.service';
import { LeftShowService } from 'projects/sys/src-web/app/service/left-show.service';
import { TiTableColumns, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';
import { TableService } from 'sys/src-com/app/service/table.service';
import { connect } from 'echarts';
import { Util } from '@cloud/tiny3';
@Component({
  selector: 'app-performance-detail',
  templateUrl: './performance-detail.component.html',
  styleUrls: ['./performance-detail.component.scss']
})
export class PerformanceDetailComponent implements OnInit, AfterViewInit {
  @Input() projectName: any;
  @Input() taskName: any;
  @Input() analysisType: any;
  @Input() taskid: any;
  @Input() nodeid: any;
  @Input() isActive: any;
  @ViewChild('container', { static: true }) private containerRef: ElementRef;
  @ViewChild('timeChartConfig') timeChartConfig: any;
  @ViewChild('cpuDetail') cpuDetail: any;  // cpu组件
  @ViewChild('memoryDetail') memoryDetail: any;  // 内存组件
  @ViewChild('diskDetail') diskDetail: any;  // 存储IO
  @ViewChild('networkDetail') networkDetail: any;  // 网络组件
  @ViewChild('timeLineDetail') timeLineDetail: any;  // 网络组件
  @ViewChild('performanceTable') performanceTable: any;  // 网络组件
  constructor(
    public Axios: AxiosService,
    public i18nService: I18nService,
    public mytip: MytipService,
    private leftShowService: LeftShowService,
    public tableService: TableService,
    private renderer2: Renderer2,
  ) {
    this.i18n = this.i18nService.I18n();
    this.noDataInfo = this.i18n.common_term_task_nodata;
    this.selectTip = this.i18n.sys.selectPerfDetail;
  }

  public noData = false;  // 判断是否有数据
  public i18n: any;
  public isTable = false;
  public noDataInfo = '';
  public timeData: any = []; // 时间轴数据
  // cpu 利用率 表格
  public cpuTitle: Array<TiTableColumns> = [];
  public cpuDisplayData: Array<TiTableRowData> = [];
  public cpuContentData: TiTableSrcData;
  public cpuCheckedList: Array<TiTableRowData> = []; // 默认选中项
  public cpuPageSize: { options: Array<number>, size: number } = {
    options: [10, 20, 50, 100],
    size: 10
  };
  public cpuCurrentPage = 1;
  public cpuTotalNumber = 0;
  public cpuTableShow = true;


  public cpuTypeOption2: any = [];  // 平均负载 数据
  public cpuTypeSelected2: any;  // 平均负载筛选
  public averageShow = true; // 平均负载是否展示
  public averageChange = false; // 判断负载筛选是否修改

  public cpuNumsOption: any = [];  // cpu 利用率 cpu 数据
  public cpuNumSelected: any;  // cpu 利用率 cpu筛选
  public cpuNumsChange = false; // 判断筛选是否修改
  public UtilizationShow = true; // cpu 利用率是否展示
  public UtilizationShow123 = true; // cpu 利用率是否展示

  public cpuTypeOption: any = [];  // cpu 利用率 指标 数据
  public cpuTypeSelected: any;  // cpu 利用率 指标筛选
  public cpuIndicatorChange = false; // 判断筛选是否修改
  public cpuTop: any = {};

  // 内存
  public memoryUtilization = true; // 内存利用率是否展示
  public Pagination = false; // 分页是否展示
  public exchange = false; // 交换是否展示

  // 内存利用率
  public usageTypeOption: any = [];
  public usageTypeSelected: any;
  public usageTypeChange = false; // 内存利用率筛选是否修改
  // 内存分页统计
  public pagOption: any = [];
  public pagSelected: any;
  public pageStatisticsChange = false; // 内存分页统计筛选是否修改
  // 内存交换统计
  public swapOption: any = [];
  public swapSelected: any;
  public swaStatisticsChange = false; // 内存交换统计筛选是否修改

  // 存储IO
  public diskShow = true; // 存储IO是否展示
  // 存储IO 块设备
  public devOption: any = [];
  public devSelected: any;
  public deviceChange = false; // 存储IO块设备筛选是否修改
  // 存储IO 指标
  public typeOption: any = [];
  public typeSelected: any;
  public diskIndexChange = false; // 存储IO块指标筛选是否修改
  // 存储IO 表格
  public diskTitle: Array<TiTableColumns> = [];
  public diskDisplayData: Array<TiTableRowData> = [];
  public diskContentData: TiTableSrcData;
  public diskCheckedList: Array<TiTableRowData> = []; // 默认选中项
  public diskPageSize: { options: Array<number>, size: number } = {
    options: [10, 20, 50, 100],
    size: 10
  };
  public diskCurrentPage = 1;
  public diskTotalNumber = 0;
  public duskTableShow = true;
  public diskTop: any = {};


  // 网络IO
  public transmission = true; // 接口传输数据量统计是否展示
  public malfunction = false; // 接口故障统计是否展示
  // 网络IO 接口传输数据量统计 接口
  public okIfaceOption: any = [];
  public okIfaceSelected: any;
  public transmissionInterfaceChange = false; // 接口传输数据量统计 接口筛选是否修改
  // 网络IO 接口传输数据量统计 指标
  public okTypeOption: any = [];
  public okTypeSelected: any;
  public transmissionIndexChange = false; // 接口传输数据量统计 指标筛选是否修改
  // 网络IO 表格
  public okIfaceTitle: Array<TiTableColumns> = [];
  public okIfaceDisplayData: Array<TiTableRowData> = [];
  public okIfaceContentData: TiTableSrcData;
  public okIfaceCheckedList: Array<TiTableRowData> = []; // 默认选中项
  public okIfacePageSize: { options: Array<number>, size: number } = {
    options: [10, 20, 50, 100],
    size: 10
  };
  public okIfaceCurrentPage = 1;
  public okIfaceTotalNumber = 0;
  public okIfaceTableShow = true;
  public okIfaceTop: any;
  // 网络IO 接口故障统计 接口
  public errorIfaceOption: any = [];
  public errorIfaceSelected: any;
  public malfunctionInterfaceChange = false; // 接口故障统计 接口筛选是否修改
  // 网络IO 接口故障统计 指标
  public errorTypeOption: any = [];
  public errorTypeSelected: any;
  public malfunctionIndexChange = false; // 接口故障统计 指标筛选是否修改
  // 网络IO 故障表格
  public errorTitle: Array<TiTableColumns> = [];
  public errorDisplayData: Array<TiTableRowData> = [];
  public errorContentData: TiTableSrcData;
  public errorCheckedList: Array<TiTableRowData> = []; // 默认选中项
  public errorPageSize: { options: Array<number>, size: number } = {
    options: [10, 20, 50, 100],
    size: 10
  };
  public errorCurrentPage = 1;
  public errorTotalNumber = 0;
  public errorTableShow = true;
  public requiredData: any = [];
  public errorTop: any = {};
  public selectTip = '筛选分析对象/指标';
  public showData = {  // 判断 筛选是否展示
    cpuShow: true,
    memoryShow: true,
    diskShow: true,
    netWorkShow: true,
    consumption: true
  };
  public echartsShowData = {  // 判断 echarts是否展示出来
    cpuShow: true,
    memoryShow: true,
    diskShow: true,
    netWorkShow: true,
    consumption: true
  };
  public timeLine = {
    start: 0,
    end: 100
  };
  public cpuNumsOptionIndex = 3;
  public typeOptionIndex = 3;
  public okTypeOptionIndex = 3;
  public errorTypeOptionIndex = 3;

  public cpuSelected = true;  // cpu开关数据
  public cpuTotalData = 0;
  public cpuSelectData = 0;
  public cpuTableOriginal: any = [];
  public cpuTableOriginalData: any;

  public diskSelected = true;  // 磁盘开关数据
  public diskTotalData = 0;
  public diskSelectTableData = 0;
  public diskTableOriginal: any = [];

  public okIfaceSwitch = true;  // 网络 传输开关数据
  public okIfaceTotalData = 0;
  public okIfaceSelectTableData = 0;
  public okIfaceTableOriginal: any = [];

  public errorSwitchShow = true;  // 网络 故障开关数据
  public errorTotalData = 0;
  public errorSelectTableData = 0;
  public errorTableOriginal: any = [];
  // cpu 表头筛选数据
  public cpuHeaderData: Array<any> = [];
  public cpuCheckedData: Array<any> = [];
  public cpusHeadShow = false;
  // 存储IO 表头筛选数据
  public diskHeaderData: Array<any> = [];
  public diskCheckedData: Array<any> = [];
  public disksHeadShow = false;
  public diskTableOriginalData: any;
  // 网络IO 传输 表头筛选数据
  public okIfaceHeaderData: Array<any> = [];
  public okIfaceCheckedData: Array<any> = [];
  public okIfaceHeadShow = false;
  public okIfaceTableOriginalData: any;
  // 网络IO 故障 表头筛选数据
  public errorHeaderData: Array<any> = [];
  public errorCheckedData: Array<any> = [];
  public errorHeadShow = false;
  public errorTableOriginalData: any;

  public IndexExplanation = '';
  public uuid: any;




  ngOnInit() {
    this.uuid = this.Axios.generateConversationId(12);
    this.IndexExplanation = this.i18n.sys_summary.cpupackage_tabel.indexTps;
    this.cpuTitle = [
      {
        title: 'CPU',
        show: true
      },
      {
        title: 'NUMA',
        show: true
      },
    ];
    this.diskTitle = [
      {
        title: this.i18n.sys_summary.cpupackage_tabel.block,
        show: true
      },
    ];
    this.okIfaceTitle = [
      {
        title: this.i18n.sys_summary.cpupackage_tabel.interface
      },
    ];
    this.errorTitle = [
      {
        title: this.i18n.sys_summary.cpupackage_tabel.interface
      },
    ];
    this.renderer2.listen(this.containerRef.nativeElement, 'scroll', () => {
      Util.trigger(document, 'tiScroll');
      this.cpusHeadShow = false;
      this.disksHeadShow = false;
      this.okIfaceHeadShow = false;
      this.errorHeadShow = false;
    });
  }
  ngAfterViewInit(): void {
    this.listenerMouseup();
  }
  OnDestroy(): void {
    this.removeListener();
  }
  // 移除监听事件
  public removeListener() {
    document.removeEventListener('scroll', this.listenerMouseup);
  }

  // 判断点击位置 隐藏表头筛选下拉框
  public listenerMouseup() {
    document.addEventListener('click', (e) => {
      let obj: any;
      obj = e;
      const Parent1 = document.getElementsByClassName('statusFilter')[0];
      const Parent2 = document.getElementsByClassName('headerFilter')[0];
      const Parent3 = document.getElementsByClassName('statusFilter')[1];
      const Parent4 = document.getElementsByClassName('headerFilter')[1];
      const Parent5 = document.getElementsByClassName('statusFilter')[2];
      const Parent6 = document.getElementsByClassName('headerFilter')[2];
      const Parent7 = document.getElementsByClassName('statusFilter')[3];
      const Parent8 = document.getElementsByClassName('headerFilter')[3];
      const data = (e.target as unknown as HTMLElement).offsetParent;
      if (data === Parent1 || data === Parent2 || data === Parent3 || data === Parent4 || data === Parent5
        || data === Parent6 || data === Parent7 || data === Parent8) {
      } else if (data === null) {
      } else {
        this.cpusHeadShow = false;
        this.disksHeadShow = false;
        this.okIfaceHeadShow = false;
        this.errorHeadShow = false;
      }
    });
  }
  // 指标必选
  public required(option: any, select: any) {
    if (select.length === 1) {
      option.forEach((item: any) => {
        if (item.label === select[0].label) {
          item.disabled = true;
        }
      });
    } else {
      option.forEach((item: any) => {
        item.disabled = false;
      });
    }
  }
  public chart() {
    this.isTable = !this.isTable;
    this.leftShowService.leftIfShow.next();
  }
  public chartConfig() {
    this.timeChartConfig.Open();
    this.showData = JSON.parse(JSON.stringify(this.echartsShowData));
    if (this.showData.cpuShow) {
      this.cpuDetail.InitializationData(); // 初始化 cpu的配置
    }
    if (this.showData.memoryShow) {
      this.memoryDetail.InitializationData(); // 初始化 内存的配置
    }
    if (this.showData.diskShow) {
      this.diskDetail.InitializationData(); // 初始化 磁盘配置
    }
    if (this.showData.netWorkShow) {
      this.networkDetail.InitializationData(); // 初始化 网络IO配置

    }
  }
  // cpu 传过来的筛选数据
  public cpuDetailData(e: any) {
    if (e.type === 1) {
      this.cpuTypeOption2 = e.allData;
      this.cpuTypeSelected2 = this.assignment(e.allData, e.newData);
      this.averageShow = e.averageShow;  // 两个多选框的转状态
      this.UtilizationShow = e.UtilizationShow;
    } else if (e.type === 2) {
      this.cpuTop = e.allData.cpu_usage.name;
      const arrData: any = [];
      e.newData.forEach((item: any) => {
        const obj = {
          id: item.id,
        };
        arrData.push(obj);
      });
      this.cpuTableOriginalData = e.allData;
      this.cpuTableData(e.allData.numa_info, arrData);
    } else if (e.type === 3) {
      this.cpuTypeOption = e.allData;
      this.cpuTypeSelected = this.assignment(e.allData, e.newData);
    } else if (e.type === 4) {
      this.timeData = e.timeData;
    }
  }
  // cpu 自定义表格数据
  public cpuTableData(data: any, arrData: any) {
    this.cpuSelected = true;
    const cpuData = this.cpuTypeChange('');
    this.cpuTotalNumber = cpuData.length;
    const topFive = { label: 'TOP5 CPU', id: '0' };
    const topTen = { label: 'TOP10 CPU', id: '1' };
    const DIY = { label: this.i18n.common_term_task_start_custerm, id: '2' };
    if (this.cpuNumsOptionIndex !== 3) {
      let value = 0;
      this.cpuNumsOption.forEach((element: any, index: any) => {
        if (Number(element.id) === this.cpuNumsOptionIndex) {
          value = index;
        }
      });
      this.cpuNumSelected = this.cpuNumsOption[value];
      if (this.cpuNumsOptionIndex !== 2) {
        this.cpuTableShow = false;
      } else {
        this.cpuTableShow = true;
      }
    } else {
      const idx = 1;
      this.cpuTableShow = false;
      this.cpuNumsOption = [topTen, topFive, DIY];
      this.cpuNumSelected = this.cpuNumsOption[idx];
    }
    this.cpuCheckedList = this.assignment(cpuData, arrData);
    this.cpuTableOriginal = cpuData; // 保存原始值
    this.cpuTotalData = cpuData.length;
    this.cpuSelectData = this.cpuCheckedList.length;

  }
  // cpu指标筛选
  public cpuTypeChange(e: any) {
    this.cpuIndicatorChange = true; // cpu 利用率 指标是否修改
    const titleArr: any = [];
    let obj = {};
    this.required(this.cpuTypeOption, this.cpuTypeSelected);
    this.cpuTypeSelected.forEach((item: any, index: any) => {
      obj = {
        title: item.label,
        sortKey: 'name' + (index + 2),
        show: index < 2 ? true : false,
        disabled: index < 2 ? false : true,
      };
      titleArr.push(obj);
    });
    this.cpuTitle = [
      {
        title: 'CPU',
        sortKey: 'name0',
        compareFn: (a: any, b: any, predicate: string): number => {
          return Number(a[predicate].slice(3)) - Number(b[predicate].slice(3));
        },
        show: undefined,
        disabled: true
      },
      {
        title: 'NUMA',
        sortKey: 'name1',
        show: undefined,
        disabled: true
      },
    ].concat(titleArr);
    this.cpuHeaderData = this.cpuTitle;
    const cpuCheckedDataArr: any = [];
    this.cpuHeaderData.forEach((item: any) => {
      if (item.show || item.show === undefined) {
        cpuCheckedDataArr.push(item);
      }
    });
    this.cpuCheckedData = cpuCheckedDataArr;
    const numaOptionkeys = Object.keys(this.cpuTableOriginalData.numa_info);
    const cpuData: any = [];
    numaOptionkeys.forEach(item => {
      this.cpuTableOriginalData.numa_info[item].forEach((value: any) => {
        const obj1: any = {};
        obj1.name0 = 'CPU' + value;
        obj1.name1 = 'NUMA' + item;
        obj1.id = value;
        this.cpuTypeSelected.forEach((element: any, indexData: any) => {
          const indexSelect = this.cpuTableOriginalData.cpu_usage.name[element.label].name.indexOf(value);
          const value1 = this.cpuTableOriginalData.cpu_usage.name[element.label].value[indexSelect];
          const value2 = Number(value1);
          if (!isNaN(value2)) {
            obj1['name' + (indexData + 2)] = value2;
          } else {
            obj1['name' + (indexData + 2)] = value1;
          }
        });
        cpuData.push(obj1);
      });
    });
    this.cpuCheckedList = this.assignment(cpuData, this.cpuCheckedList);
    this.cpuTableOriginal = cpuData; // 保存原始值
    this.cpuSwitch(false);
    return cpuData;
  }
  // cpu 表头筛选
  public onMyChange() {
    const length = this.cpuCheckedData.length;
    const arr: any = [];
    this.cpuCheckedData.forEach((value) => {
      arr.push(value.title);
    });
    if (length < 4) {
      this.cpuHeaderData.forEach((item: any, index: any) => {
        if (index > 1) {
          item.disabled = false;
        }
      });
    } else {
      this.cpuHeaderData.forEach((item: any, index: any) => {
        if (index > 1) {
          if (arr.indexOf(item.title)) {
            item.disabled = false;
          }
          if (arr.indexOf(item.title) === -1) {
            item.disabled = true;
          }
        }
      });
    }
    this.cpuTitle.forEach((item: any, index: any) => {
      if (index > 1) {
        if (arr.indexOf(item.title)) {
          item.show = true;
        }
        if (arr.indexOf(item.title) === -1) {
          item.show = false;
        }
      }
    });
  }

  // cpu 开关
  public cpuSwitch(e: any) {
    if (e) {
      this.cpuSelected = !this.cpuSelected;
      this.cpuCurrentPage = 1;
    }
    if (this.cpuSelected) {
      this.cpuContentData = {
        data: this.cpuTableOriginal,
        state: {
          searched: false, // 源数据未进行搜索处理
          sorted: false, // 源数据未进行排序处理
          paginated: false // 源数据未进行分页处理
        }
      };
      this.cpuTotalNumber = this.cpuTableOriginal.length;
    } else {
      this.cpuContentData = {
        data: this.cpuCheckedList,
        state: {
          searched: false, // 源数据未进行搜索处理
          sorted: false, // 源数据未进行排序处理
          paginated: false // 源数据未进行分页处理
        }
      };
      this.cpuTotalNumber = this.cpuCheckedList.length;
    }
    if (e) {
      this.cpuCurrentPage = 1;
    }
  }
  // 内存 传过来的筛选数据
  public memorySelectData(e: any) {
    if (e.type === 1) {
      this.usageTypeOption = e.allData;
      this.usageTypeSelected = this.assignment(e.allData, e.newData);
      this.memoryUtilization = e.memoryUtilization;
      this.Pagination = e.Pagination;
      this.exchange = e.exchange;
    } else if (e.type === 2) {
      this.pagOption = e.allData;
      this.pagSelected = this.assignment(e.allData, e.newData);
    } else if (e.type === 3) {
      this.swapOption = e.allData;
      this.swapSelected = this.assignment(e.allData, e.newData);
    }
  }
  // 存储IO 传过来的筛选数据
  public diskSelectData(e: any) {
    if (e.type === 1) {
      const arrData: any = [];
      e.newData.forEach((item: any) => {
        const obj = {
          name: item.id,
          id: item.id,
        };
        arrData.push(obj);
      });
      this.diskTableData(e.allData, arrData);
      this.diskShow = e.diskShow;
    } else if (e.type === 2) {
      this.typeOption = e.allData;
      this.typeSelected = this.assignment(e.allData, e.newData);
      this.required(this.typeOption, this.typeSelected);
      this.diskTypeChange();
    } else if (e.type === 3) {
      this.diskTop = e.allData.disk_usage.name;
      this.diskTableOriginalData = e.allData;
    }
  }

  // 磁盘 表头筛选
  public diskHeaderChange() {
    const length = this.diskCheckedData.length;
    const arr: any = [];
    this.diskCheckedData.forEach((value) => {
      arr.push(value.title);
    });
    if (length < 4) {
      this.diskHeaderData.forEach((item: any, index: any) => {
        if (index > 0) {
          item.disabled = false;
        }
      });
    } else {
      this.diskHeaderData.forEach((item: any, index: any) => {
        if (index > 0) {
          if (arr.indexOf(item.title)) {
            item.disabled = false;
          }
          if (arr.indexOf(item.title) === -1) {
            item.disabled = true;
          }
        }
      });
    }
    this.diskTitle.forEach((item: any, index: any) => {
      if (index > 0) {
        if (arr.indexOf(item.title)) {
          item.show = true;
        }
        if (arr.indexOf(item.title) === -1) {
          item.show = false;
        }
      }
    });
  }

  // 存储IO 表格数据
  public diskTableData(data: any, arrData: any) {
    const diskData = this.diskTypeChange();
    this.diskTotalNumber = diskData.length;
    this.diskSelected = true;
    const topFive = { label: 'TOP5 DEV', id: '0' };
    const topTen = { label: 'TOP10 DEV', id: '1' };
    const DIY = { label: this.i18n.common_term_task_start_custerm, id: '2' };
    if (this.typeOptionIndex !== 3) {
      let value = 0;
      this.devOption.forEach((element: any, index: any) => {
        if (Number(element.id) === this.typeOptionIndex) {
          value = index;
        }
      });
      this.devSelected = this.devOption[value];
      if (this.typeOptionIndex !== 2) {
        this.duskTableShow = false;
      } else {
        this.duskTableShow = true;
      }
    } else {
      this.duskTableShow = false;
      this.devOption = [topTen, topFive, DIY];
      this.devSelected = topFive;
    }
    this.diskCheckedList = this.assignment(diskData, arrData);
    this.diskTotalData = diskData.length;
    this.diskSelectTableData = this.diskCheckedList.length;
  }

  // 指标筛选  表格变化
  public diskTypeChange() {
    this.diskIndexChange = true; // 存储IO块设备筛选是否修改
    const titleArr: any = [];
    let obj = {};
    if (this.typeSelected) {
      this.required(this.typeOption, this.typeSelected);
      this.typeSelected.forEach((item: any, index: any) => {
        obj = {
          title: item.label,
          sortKey: 'name' + (index + 1),
          show: index < 3 ? true : false,
          disabled: index < 3 ? false : true,
        };
        titleArr.push(obj);
      });
    }
    this.diskTitle = [
      {
        title: this.i18n.sys_summary.cpupackage_tabel.block,
        sortKey: 'name0',
        show: undefined,
        disabled: true
      },
    ].concat(titleArr);
    this.diskHeaderData = this.diskTitle;
    const cpuCheckedDataArr: any = [];
    this.diskHeaderData.forEach((item: any) => {
      if (item.show || item.show === undefined) {
        cpuCheckedDataArr.push(item);
      }
    });
    this.diskCheckedData = cpuCheckedDataArr;
    const diskData: any = [];
    this.diskTableOriginalData.spec.forEach((item: any, value: any) => {
      const obj1: any = {};
      obj1.name0 = item;
      obj1.id = item;
      if (this.typeSelected) {
        this.typeSelected.forEach((element: any, indexData: any) => {
          const indexSelect = this.diskTableOriginalData.disk_usage.name[element.label].name.indexOf(item);
          obj1['name' + (indexData + 1)] = this.diskTableOriginalData.disk_usage.name[element.label].value[indexSelect];
        });
      }
      diskData.push(obj1);
    });
    this.diskCheckedList = this.assignment(diskData, this.diskCheckedList);
    this.diskTableOriginal = diskData; // 保存原始值
    this.diskSwitch(false);
    return diskData;
  }
  // 磁盘 开关
  public diskSwitch(e: any) {
    if (e) {
      this.diskSelected = !this.diskSelected;
    }
    if (this.diskSelected) {
      this.diskContentData = {
        data: this.diskTableOriginal,
        state: {
          searched: false, // 源数据未进行搜索处理
          sorted: false, // 源数据未进行排序处理
          paginated: false // 源数据未进行分页处理
        }
      };
      this.diskTotalNumber = this.diskTableOriginal.length;
    } else {
      this.diskContentData = {
        data: this.diskCheckedList,
        state: {
          searched: false, // 源数据未进行搜索处理
          sorted: false, // 源数据未进行排序处理
          paginated: false // 源数据未进行分页处理
        }
      };
      this.diskTotalNumber = this.diskCheckedList.length;
    }
    if (e) {
      this.diskCurrentPage = 1;
    }
  }
  // 网络IO 传过来筛选数据
  public networkSelectData(e: any) {
    if (e.type === 1) {
      const arrData: any = [];
      e.newData.forEach((item: any) => {
        const obj = {
          name: item.id,
          id: item.id,
        };
        arrData.push(obj);
      });
      this.okIfaceSelectData(e.allData, arrData);
      this.transmission = e.transmission;
      this.malfunction = e.malfunction;

    } else if (e.type === 2) {
      this.okTypeOption = e.allData;
      this.okTypeSelected = this.assignment(e.allData, e.newData);
      this.required(this.okTypeOption, this.okTypeSelected);
      this.required(this.okTypeOption, this.okTypeSelected);
      this.okIfaceTypeChange();
    } else if (e.type === 3) {
      const arrData: any = [];
      e.newData.forEach((item: any) => {
        const obj = {
          name: item.id,
          id: item.id,
        };
        arrData.push(obj);
      });
      this.errorSelectData(e.allData, arrData);
    } else if (e.type === 4) {
      this.errorTypeOption = e.allData;
      this.errorTypeSelected = this.assignment(e.allData, e.newData);
      this.required(this.errorTypeOption, this.errorTypeSelected);
      this.required(this.errorTypeOption, this.errorTypeSelected);
      this.errorTypeChange();
    } else if (e.type === 5) {
      this.okIfaceTableOriginalData = e.allData;
      this.okIfaceTop = e.allData.net_info.name;
    } else if (e.type === 6) {
      this.errorTop = e.allData.net_error_info.name;
      this.errorTableOriginalData = e.allData;
    }
  }
  // 网络IO 传输量 表格数据
  public okIfaceSelectData(data: any, arrData: any) {
    const okIfaceData = this.okIfaceTypeChange();
    this.okIfaceTotalNumber = okIfaceData.length;
    const topFive = { label: this.i18n.sys_summary.cpupackage_tabel.portsFive, id: '0' };
    const topTen = { label: this.i18n.sys_summary.cpupackage_tabel.portsTen, id: '1' };
    const DIY = { label: this.i18n.common_term_task_start_custerm, id: '2' };
    if (this.okTypeOptionIndex !== 3) {
      let value = 0;
      this.okIfaceOption.forEach((element: any, index: any) => {
        if (Number(element.id) === this.okTypeOptionIndex) {
          value = index;
        }
      });
      this.okIfaceSelected = this.okIfaceOption[value];
      if (this.okTypeOptionIndex !== 2) {
        this.okIfaceTableShow = false;
      } else {
        this.okIfaceTableShow = true;
      }
    } else {

      this.okIfaceTableShow = false;
      this.okTypeSelected = [this.okTypeOption[0]];

      this.okIfaceOption = [topTen, topFive, DIY];
      this.okIfaceSelected = topFive;
    }

    this.okIfaceCheckedList = this.assignment(okIfaceData, arrData);
    this.okIfaceTotalData = okIfaceData.length;
    this.okIfaceTableOriginal = okIfaceData; // 保存原始数据
  }
  // 网络 表头筛选
  public okIfaceHeaderChange() {
    const length = this.okIfaceCheckedData.length;
    const arr: any = [];
    this.okIfaceCheckedData.forEach((value) => {
      arr.push(value.title);
    });
    if (length < 4) {
      this.okIfaceHeaderData.forEach((item: any, index: any) => {
        if (index > 0) {
          item.disabled = false;
        }
      });
    } else {
      this.okIfaceHeaderData.forEach((item: any, index: any) => {
        if (index > 0) {
          if (arr.indexOf(item.title)) {
            item.disabled = false;
          }
          if (arr.indexOf(item.title) === -1) {
            item.disabled = true;
          }
        }
      });
    }
    this.okIfaceTitle.forEach((item: any, index: any) => {
      if (index > 0) {
        if (arr.indexOf(item.title)) {
          item.show = true;
        }
        if (arr.indexOf(item.title) === -1) {
          item.show = false;
        }
      }
    });
  }
  // 指标筛选  表格变化
  public okIfaceTypeChange() {
    this.transmissionIndexChange = true; // 存储IO块设备筛选是否修改
    const titleArr: any = [];
    let obj = {};
    if (this.okTypeSelected) {
      this.required(this.okTypeOption, this.okTypeSelected);
      this.okTypeSelected.forEach((item: any, index: any) => {
        obj = {
          title: item.label,
          sortKey: 'name' + (index + 1),
          show: index < 3 ? true : false,
          disabled: index < 3 ? false : true,
        };
        titleArr.push(obj);
      });
    }

    this.okIfaceTitle = [
      {
        title: this.i18n.sys_summary.cpupackage_tabel.interface,
        sortKey: 'name0',
        show: undefined,
        disabled: true
      },
    ].concat(titleArr);
    this.okIfaceHeaderData = this.okIfaceTitle;
    const cpuCheckedDataArr: any = [];
    this.okIfaceHeaderData.forEach((item: any) => {
      if (item.show || item.show === undefined) {
        cpuCheckedDataArr.push(item);
      }
    });
    this.okIfaceCheckedData = cpuCheckedDataArr;
    const numaOptionkeys = Object.keys(this.okIfaceTableOriginalData.spec);
    const okIfaceData: any = [];
    this.okIfaceTableOriginalData.spec.forEach((item: any, value: any) => {
      const obj1: any = {};
      obj1.name0 = item;
      obj1.id = item;
      if (this.okTypeSelected) {
        this.okTypeSelected.forEach((element: any, indexData: any) => {
          const indexSelect = this.okIfaceTableOriginalData.net_info.name[element.label].name.indexOf(item);
          obj1['name' + (indexData + 1)] =
            this.okIfaceTableOriginalData.net_info.name[element.label].value[indexSelect];
        });
      }
      okIfaceData.push(obj1);
    });
    this.okIfaceCheckedList = this.assignment(okIfaceData, this.okIfaceCheckedList);
    this.okIfaceTableOriginal = okIfaceData; // 保存原始数据
    this.okIfaceSwitchData(false);
    return okIfaceData;
  }

  // 网络IO 传输量 开关
  public okIfaceSwitchData(e: any) {
    if (e) {
      this.okIfaceSwitch = !this.okIfaceSwitch;
    }
    if (this.okIfaceSwitch) {
      this.okIfaceContentData = {
        data: this.okIfaceTableOriginal,
        state: {
          searched: false, // 源数据未进行搜索处理
          sorted: false, // 源数据未进行排序处理
          paginated: false // 源数据未进行分页处理
        }
      };
      this.okIfaceTotalNumber = this.okIfaceTableOriginal.length;
    } else {
      this.okIfaceContentData = {
        data: this.okIfaceCheckedList,
        state: {
          searched: false, // 源数据未进行搜索处理
          sorted: false, // 源数据未进行排序处理
          paginated: false // 源数据未进行分页处理
        }
      };
      this.okIfaceTotalNumber = this.okIfaceCheckedList.length;
    }
    if (e) {
      this.okIfaceCurrentPage = 1;
    }

  }
  // 网络IO 故障 表格数据
  public errorSelectData(data: any, arrData: any) {
    const errorData = this.errorTypeChange();
    this.errorSwitchShow = true;
    this.errorTotalNumber = errorData.length;
    const topFive = { label: this.i18n.sys_summary.cpupackage_tabel.portsFive, id: '0' };
    const topTen = { label: this.i18n.sys_summary.cpupackage_tabel.portsTen, id: '1' };
    const DIY = { label: this.i18n.common_term_task_start_custerm, id: '2' };
    const arr = [];
    if (this.errorTypeOptionIndex !== 3) {
      let value = 0;
      this.errorIfaceOption.forEach((element: any, index: any) => {
        if (Number(element.id) === this.errorTypeOptionIndex) {
          value = index;
        }
      });
      this.errorIfaceSelected = this.errorIfaceOption[value];
      if (this.errorTypeOptionIndex !== 2) {
        this.errorTableShow = false;
      } else {
        this.errorTableShow = true;
      }
    } else {
      this.errorTableShow = false;
      this.errorIfaceOption = [topTen, topFive, DIY];
      this.errorIfaceSelected = topFive;
    }

    this.errorCheckedList = this.assignment(errorData, arrData);
    this.errorTableOriginal = errorData; // 保存原始数据
    this.errorTotalData = errorData.length;
  }

  // 网络 表头筛选
  public errorHeaderChange() {
    const length = this.errorCheckedData.length;
    const arr: any = [];
    this.errorCheckedData.forEach((value) => {
      arr.push(value.title);
    });
    if (length < 4) {
      this.errorHeaderData.forEach((item: any, index: any) => {
        if (index > 0) {
          item.disabled = false;
        }
      });
    } else {
      this.errorHeaderData.forEach((item: any, index: any) => {
        if (index > 0) {
          if (arr.indexOf(item.title)) {
            item.disabled = false;
          }
          if (arr.indexOf(item.title) === -1) {
            item.disabled = true;
          }
        }
      });
    }
    this.errorTitle.forEach((item: any, index: any) => {
      if (index > 0) {
        if (arr.indexOf(item.title)) {
          item.show = true;
        }
        if (arr.indexOf(item.title) === -1) {
          item.show = false;
        }
      }
    });
  }
  // 指标筛选  表格变化
  public errorTypeChange() {
    this.malfunctionIndexChange = true; // 存储IO块设备筛选是否修改
    const titleArr: any = [];
    let obj = {};
    if (this.errorTypeSelected) {
      this.required(this.errorTypeOption, this.errorTypeSelected);
      this.errorTypeSelected.forEach((item: any, index: any) => {
        obj = {
          title: item.label,
          sortKey: 'name' + (index + 1),
          show: index < 3 ? true : false,
          disabled: index < 3 ? false : true,
        };
        titleArr.push(obj);
      });
    }

    this.errorTitle = [
      {
        title: this.i18n.sys_summary.cpupackage_tabel.interface,
        sortKey: 'name0',
        show: undefined,
        disabled: true
      },
    ].concat(titleArr);
    this.errorHeaderData = this.errorTitle;
    const cpuCheckedDataArr: any = [];
    this.errorHeaderData.forEach((item: any) => {
      if (item.show || item.show === undefined) {
        cpuCheckedDataArr.push(item);
      }
    });
    this.errorCheckedData = cpuCheckedDataArr;
    const errorData: any = [];
    this.errorTableOriginalData.spec.forEach((item: any, value: any) => {
      const val: any = {};
      val.name0 = item;
      val.id = item;
      if (this.errorTypeSelected) {
        this.errorTypeSelected.forEach((element: any, indexData: any) => {
          const indexSelect = this.errorTableOriginalData.net_error_info.name[element.label].name.indexOf(item);
          val['name' + (indexData + 1)] =
            this.errorTableOriginalData.net_error_info.name[element.label].value[indexSelect];
        });
      }
      errorData.push(val);
    });
    this.errorCheckedList = this.assignment(errorData, this.errorCheckedList);
    this.errorTableOriginal = errorData; // 保存原始数据
    this.errorSwitchData(false);
    return errorData;
  }
  // 网络IO 故障 开关
  public errorSwitchData(e: any) {
    if (e) {
      this.errorSwitchShow = !this.errorSwitchShow;
    }

    if (this.errorSwitchShow) {
      this.errorContentData = {
        data: this.errorTableOriginal,
        state: {
          searched: false, // 源数据未进行搜索处理
          sorted: false, // 源数据未进行排序处理
          paginated: false // 源数据未进行分页处理
        }
      };
      this.errorTotalNumber = this.errorTableOriginal.length;

    } else {
      this.errorContentData = {
        data: this.errorCheckedList,
        state: {
          searched: false, // 源数据未进行搜索处理
          sorted: false, // 源数据未进行排序处理
          paginated: false // 源数据未进行分页处理
        }
      };
      this.errorTotalNumber = this.errorCheckedList.length;
    }
    if (e) {
      this.errorCurrentPage = 1;
    }

  }
  // 判断是否筛选
  public cpuTypeChange2(e: any) {
    if (e === 1) {
      this.averageChange = true;  // cpu负载是否修改
      this.required(this.cpuTypeOption2, this.cpuTypeSelected2);
    } else if (e === 2) {
      this.cpuNumsChange = true; // cpu 利用率 cpu是否修改
      if (this.cpuNumSelected.id === '2') {  // 是否展示 表格筛选
        this.required(this.cpuTypeOption, this.cpuTypeSelected);
        this.cpuTableShow = true;
      } else {
        this.cpuTableShow = false;
      }
    } else if (e === 3) {
      this.cpuIndicatorChange = true; // cpu 利用率 指标是否修改
    } else if (e === 4) {
      this.required(this.usageTypeOption, this.usageTypeSelected);
      this.usageTypeChange = true; // 内存利用率筛选是否修改
    } else if (e === 5) {
      this.required(this.pagOption, this.pagSelected);
      this.pageStatisticsChange = true; // 内存分页统计筛选是否修改
    } else if (e === 6) {
      this.required(this.swapOption, this.swapSelected);
      this.swaStatisticsChange = true; // 内存分页统计筛选是否修改
    } else if (e === 7) {
      this.deviceChange = true; // 存储IO块设备筛选是否修改
      if (this.devSelected.id === '2') {  // 是否展示 表格筛选
        this.duskTableShow = true;
        this.diskTypeChange();
      } else {
        this.duskTableShow = false;
      }
    } else if (e === 8) {
      this.diskIndexChange = true; // 存储IO块设备筛选是否修改
    } else if (e === 9) {
      if (this.okIfaceSelected.id === '2') {  // 是否展示 表格筛选
        this.okIfaceTypeChange();
        this.okIfaceTableShow = true;
      } else {
        this.okIfaceTableShow = false;
      }
      this.transmissionInterfaceChange = true; // 接口传输数据量统计 接口筛选是否修改
    } else if (e === 10) {
      this.transmissionIndexChange = true; // 接口传输数据量统计 指标筛选是否修改
    } else if (e === 11) {
      if (this.errorIfaceSelected.id === '2') {  // 是否展示 表格筛选
        this.errorTypeChange();
        this.errorTableShow = true;
      } else {
        this.errorTableShow = false;
      }
      this.malfunctionInterfaceChange = true; // 接口故障统计 接口筛选是否修改
    } else if (e === 12) {
      this.malfunctionIndexChange = true; // 接口故障统计 指标筛选是否修改
    }
  }

  // cpu 筛选方法
  public confirmCpu(detailData: any) {

    // 调用平均负载的方法
    this.cpuDetail.cpuTypeChange2({ data: detailData, show: this.averageShow, change: this.averageChange });
    this.averageChange = false;
    // cpu 利用率筛选方法
    const cpuSelectData: any = [];
    let cpuTypeSelected = [];
    if (this.cpuNumSelected.id === '2') {
      this.cpuNumsOptionIndex = 2;
      this.cpuCheckedList.forEach((item: any) => {
        const obj = {
          label: item.id,
          id: item.id
        };
        cpuSelectData.push(obj);
      });
    } else if (this.cpuNumSelected.id !== '2') {
      this.cpuNumsOptionIndex = this.cpuNumSelected.id === '0' ? 0 : 1;
      const indexData = this.cpuNumSelected.id === '0' ? 4 : 9;
      this.cpuTop[this.cpuTypeSelected[0].id].name.forEach((item: any, index: any) => {
        if (index <= indexData) {
          const obj = {
            label: item,
            id: item
          };
          cpuSelectData.push(obj);
        }
      });
    }
    this.cpuNumsChange = true;
    cpuTypeSelected = this.cpuTypeSelected;
    if (this.cpuCheckedList.length !== 0) {
      this.cpuDetail.cpuNumChange({ data: cpuSelectData, show: this.UtilizationShow, change: this.cpuNumsChange });
    }
    this.cpuNumsChange = false;
    // CPU 指标筛选方法
    this.cpuDetail.cpuTypeChange({
      data: cpuTypeSelected, show: this.UtilizationShow, change: this.cpuIndicatorChange
    });
    this.cpuIndicatorChange = false;
  }
  // 内存筛选方法
  public confirmMemory() {
    // 内存利用率筛选方法
    this.memoryDetail.usageTypeChange({
      data: this.usageTypeSelected, show: this.memoryUtilization, change: this.usageTypeChange
    });
    this.usageTypeChange = false;
    // 内存分页统计筛选方法
    this.memoryDetail.pagChange({ data: this.pagSelected, show: this.Pagination, change: this.pageStatisticsChange });
    this.pageStatisticsChange = false;
    // 内存分页统计筛选方法
    this.memoryDetail.swapChange({ data: this.swapOption, show: this.exchange, change: this.swaStatisticsChange });
    this.swaStatisticsChange = false;
  }
  // 存储IO 筛选方法
  public confirmDisk() {
    // 存储IO 块设备筛选方法
    const diskSelectData: any[][] = [];
    let typeSelected = [];
    if (this.devSelected.id === '2') {
      this.typeOptionIndex = 2;
      this.typeSelected.forEach((element: any, idx: number) => {
        diskSelectData[idx] = [];
        this.diskCheckedList.forEach((item: any) => {
          const obj = {
            label: item.id,
            id: item.id
          };
          diskSelectData[idx].push(obj);
        });
      });
    } else if (this.devSelected.id !== '2') {
      this.typeOptionIndex = this.devSelected.id === '0' ? 0 : 1;
      const indexData = this.devSelected.id === '0' ? 4 : 9;
      this.typeSelected.forEach((element: any, idx: number) => {
        diskSelectData[idx] = [];
        this.diskTop[element.id].name.forEach((item: any, index: any) => {
          if (index <= indexData) {
            const obj = {
              label: item,
              id: item
            };
            diskSelectData[idx].push(obj);
          }
        });
      });
    }
    this.deviceChange = true;
    typeSelected = this.typeSelected;
    if (this.diskCheckedList.length !== 0) {
      this.diskDetail.devChange({ data: diskSelectData, show: this.diskShow, change: this.deviceChange });
    }
    this.deviceChange = false;
    // 存储IO 指标筛选方法
    this.diskDetail.typeChange({ data: typeSelected, show: this.diskShow, change: this.diskIndexChange });
    this.diskIndexChange = false;
  }

  // 网络IO
  public confirmNetwork() {
    // 网络IO 接口传输数据量统计 接口筛选
    const okIfaceSelectData: any = [];
    let okTypeSelected = [];
    if (this.okIfaceSelected.id === '2') {
      this.okIfaceCheckedList.forEach((item: any) => {
        const obj = {
          label: item.id,
          id: item.id
        };
        okIfaceSelectData.push(obj);
      });
      this.okTypeOptionIndex = 2;
    } else if (this.okIfaceSelected.id !== '2') {
      this.okTypeOptionIndex = this.okIfaceSelected.id === '0' ? 0 : 1;
      const indexData = this.okIfaceSelected.id === '0' ? 4 : 9;
      this.okIfaceTop[this.okTypeSelected[0].id].name.forEach((item: any, index: any) => {
        if (index <= indexData) {
          const obj = {
            label: item,
            id: item
          };
          okIfaceSelectData.push(obj);
        }
      });
      this.transmissionInterfaceChange = true;
    }
    okTypeSelected = this.okTypeSelected;
    if (this.okIfaceCheckedList.length !== 0) {
      this.networkDetail.okIfaceChange({
        data: okIfaceSelectData, show: this.transmission, change: this.transmissionInterfaceChange
      });
    }
    this.transmissionInterfaceChange = false;
    // 网络IO 接口传输数据量统计 指标筛选
    this.networkDetail.okTypeChange({
      data: okTypeSelected, show: this.transmission, change: this.transmissionIndexChange
    });
    this.transmissionIndexChange = false;
    // 网络IO 接口故障统计 接口筛选
    const errorSelectData: any = [];
    let errorTypeSelected = [];
    if (this.errorIfaceSelected.id === '2') {
      this.errorCheckedList.forEach((item: any) => {
        const obj = {
          label: item.id,
          id: item.id
        };
        errorSelectData.push(obj);
      });
      this.malfunctionInterfaceChange = true;
      this.errorTypeOptionIndex = 2;
    } else if (this.errorIfaceSelected.id !== '2') {
      this.errorTypeOptionIndex = this.errorIfaceSelected.id === '0' ? 0 : 1;
      const indexData = this.errorIfaceSelected.id === '0' ? 4 : 9;
      this.errorTop[this.errorTypeSelected[0].id].name.forEach((item: any, index: any) => {
        if (index <= indexData) {
          const obj = {
            label: item,
            id: item
          };
          errorSelectData.push(obj);
        }
      });
    }
    errorTypeSelected = this.errorTypeSelected;
    if (this.errorCheckedList.length !== 0) {
      this.networkDetail.errorIfaceChange({
        data: errorSelectData, show: this.malfunction, change: this.malfunctionInterfaceChange
      });
    }
    this.malfunctionInterfaceChange = false;
    // 网络IO 接口故障统计 指标筛选
    this.networkDetail.errorTypeChange({
      data: errorTypeSelected, show: this.malfunction, change: this.malfunctionIndexChange
    });
    this.malfunctionIndexChange = false;
  }
  // 确认按钮
  public confirmConfig() {
    this.echartsShowData = JSON.parse(JSON.stringify(this.showData));
    if (this.showData.cpuShow) {
      this.confirmCpu(this.cpuTypeSelected2);
    }
    if (this.showData.memoryShow) {
      this.confirmMemory();
    }
    if (this.showData.diskShow) {
      this.confirmDisk();
    }
    if (this.showData.netWorkShow) {
      this.confirmNetwork();
    }
    this.timeChartConfig.Close();
  }
  public assignment(a: any, b: any) {
    const arr: any = [];
    a.forEach((item: any, index: any) => {
      b.forEach((itemData: any) => {
        if (item.id === itemData.id) {
          arr.push(a[index]);
        }
      });
    });
    return arr;
  }

  public trackByFn(index: number, item: any): number {
    return item.id;
  }
  // 表格必选其一
  public checkboxData(e: any) {
    if (e === 1) {
      this.cpuSelectData = this.cpuCheckedList.length;
      if (!this.cpuSelected) {
        this.cpuTotalNumber = this.cpuCheckedList.length;
      }
    }
    if (e === 2) {
      this.diskSelectTableData = this.diskCheckedList.length;
      if (!this.diskSelected) {
        this.diskTotalNumber = this.diskCheckedList.length;
      }
    }
    if (e === 3) {
      this.okIfaceSelectTableData = this.okIfaceCheckedList.length;
      if (!this.okIfaceSwitch) {
        this.okIfaceTotalNumber = this.okIfaceCheckedList.length;
      }
    }
    if (e === 4) {
      this.errorSelectTableData = this.errorCheckedList.length;
      if (!this.errorSwitchShow) {
        this.errorTotalNumber = this.errorCheckedList.length;
      }
    }
  }
  // 关闭弹窗
  public closeMask() {
    this.timeChartConfig.Close();
  }
  // 时间轴筛选
  public timeLineData(e: any) {
    this.timeLine = e;
    this.leftShowService.timelineUPData.next(e);
  }
  // 数据筛选 传过来的开始结束比例
  public dataZoom(e: any) {
    this.timeLine = e;
    this.timeLineDetail.dataConfig(e);
    this.timeLineData(e);
  }

  // 由子组件传递echartsInst, echarts图表联动
  public echartsInstOut(e: any) {
    if (e) {
      e.group = this.uuid;
    }
    connect(this.uuid);
  }
}
