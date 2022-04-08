import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MytipService } from '../../../../../service/mytip.service';
import { TiTableColumns, TiTableRowData, TiTableSrcData, TiTreeNode, TiTreeUtil, TiDragService } from '@cloud/tiny3';
import { I18nService } from '../../../../../service/i18n.service';
import { ProfileDownloadService } from '../../../../../service/profile-download.service';
import { LibService } from '../../../../../service/lib.service';
import * as echarts from 'echarts/core';

@Component({
  selector: 'app-jdbcpool-compare',
  templateUrl: './jdbcpool-compare.component.html',
  styleUrls: ['./jdbcpool-compare.component.scss']
})
export class JdbcpoolCompareComponent implements OnInit {
  @Input() currentHeapLabel: any;
  @Input() prevHeapLabel: any;
  @Input() snapshotType: any;
  @Output() private childOuter = new EventEmitter();
  @Output() private childTGSnapshotIN = new EventEmitter();
  constructor(
    public i18nService: I18nService,
    public downloadService: ProfileDownloadService,
    public mytip: MytipService,
    public libService: LibService,
  ) {
    this.i18n = this.i18nService.I18n();
    this.tipStr = this.i18n.jdbcpool.thresholdTip;
    this.typeOptions = [{
      label: this.i18n.jdbcpool.wholeForm,
      value: 'form'
    }, {
      label: this.i18n.jdbcpool.queryView,
      value: 'view'
    }];
    this.typeSelected = {
      label: this.i18n.jdbcpool.wholeForm,
      value: 'form'
    };
  }
  public threshold = {
    label: '',
    max: 10000,
    min: 10,
    value: 50,
    rangeValue: [10, 10000],
    format: 'N0',
  };
  public sugReport = true;
  public isSuggest = false;
  public tipStr: string;
  public i18n: any;
  public beginFileIo = false; // 是否开始分析
  public Threshold: any; // 阈值
  public typeOptions: any = [];
  public typeSelected: any;
  public startBtnDisabled = false;
  // 左侧 表格部分
  public displayedTable: Array<TiTableRowData> = []; // 表示表格实际呈现的数据（开发者默认设置为[]即可）
  public srcDataTable: TiTableSrcData;
  private tableData: Array<TiTableRowData> = [];
  public columnsTable: Array<TiTableColumns> = [];
  public closeOtherDetails = true;
  public noDadaInfo = '';
  public totalCount = 1000;
  public thirdLevel = false;
  public expand = false;
  public subrow: any;
  // 栈
  public stackTranceData: Array<TiTreeNode> = [];
  // 连接池配置参数表格
  public configPoolDisplayed: Array<TiTableRowData> = [];
  public tableDataPool: Array<TiTableRowData> = [];
  public configPoolSrcData: TiTableSrcData;
  public configPoolColumns: Array<TiTableColumns> = [];
  // 获取当前选中项，参数：树节点数据，选中项是否只包含叶子节点，是否多选
  selectedData: Array<TiTreeNode> = TiTreeUtil.getSelectedData(
    this.stackTranceData,
    false,
    false
  );
  public totalCountMonitor: any;
  public stackTranceDataEnd: Array<TiTreeNode> = [];
  // 获取当前选中项，参数：树节点数据，选中项是否只包含叶子节点，是否多选
  selectedDataEnd: Array<TiTreeNode> = TiTreeUtil.getSelectedData(
    this.stackTranceDataEnd,
    false,
    false
  );
  public poolSuggest: any = [];
  public snapCount = 0;
  public tipContext: any;
  public spinner = {
    label: '',
    max: 10000,
    min: 0,
    rangeValue: [0, 10000],
    format: 'N0',
  };
  public spinnerValue = 3;
  // echarts
  public data: any = [];
  public startTime = +new Date();
  public categories: any = [];
  public types: any = [];
  public seriesData: any = [];
  public updateOptions: any;
  public connectOwnerThread: any;
  public echartsOption: any = {};

  public noDataMsg = '';
  public stackBtnTip: string;
  public timer: any;

  public ContrastHover: string;
  public snapshotA: string;
  public snapshotB: string;
  public snapShot: any;
  public snapShotADataFile: Array<any> = [];
  public snapShotBDataFile: Array<any> = [];
  public comparedDatas: Array<any> = [];
  public baseData: Array<any> = [];
  public compareData: Array<any> = [];
  public HeapNum: any = 0;
  public InstanceNum: any = 0;
  public disabled = false;
  public selectAll = true;
  public panelWidth = '250px';
  public searchable = false; // 可切换测试
  public tipPosition = 'left'; // 10.0.3版本新增，默认提示文本方向为'top'
  public currentFdTableList: Array<any> = [];
  public currentFdTableListTop: Array<any> = [];

  ngOnInit(): void {
    this.HeapNum = 1;
    this.InstanceNum = 1;
    this.columnsTable = [
      {
        title: this.i18n.profileMemorydump.snapShot.jdbcpool.linkId,
        width: '150px',
        sortKey: 'linkId',
        show: undefined,
        fixed: 'left'
      },
      {
        title: this.i18n.profileMemorydump.snapShot.jdbcpool.linkChart,
        width: '150px',
        sortKey: 'linkChart',
        show: undefined,
      },
      {
        title: this.i18n.profileMemorydump.snapShot.jdbcpool.BbeginTime,
        width: '180px',
        sortKey: 'BbeginTime',
        show: true
      },
      {
        title: this.i18n.profileMemorydump.snapShot.jdbcpool.beginTime,
        width: '150px',
        sortKey: 'beginTime',
        show: true
      },
      {
        title: this.i18n.profileMemorydump.snapShot.jdbcpool.BendTime,
        width: '180px',
        sortKey: 'endTime',
        show: true
      },
      {
        title: this.i18n.profileMemorydump.snapShot.jdbcpool.endTime,
        width: '150px',
        sortKey: 'endTime',
        show: true
      },
      {
        title: this.i18n.profileMemorydump.snapShot.jdbcpool.BeventCount,
        width: '150px',
        isSort: true,
        sortKey: 'count',
        show: true
      },
      {
        title: this.i18n.profileMemorydump.snapShot.jdbcpool.eventCount,
        width: '150px',
        isSort: true,
        sortKey: 'Ccount',
        show: true
      },
      {
        title: this.i18n.profileMemorydump.snapShot.jdbcpool.BeventCostTime,
        width: '150px',
        isSort: true,
        sortKey: 'duration',
        show: true
      },
      {
        title: this.i18n.profileMemorydump.snapShot.jdbcpool.eventCostTime,
        width: '150px',
        isSort: true,
        sortKey: 'Cduration',
        show: true
      },
    ];
    const role = sessionStorage.getItem('role');
    if (this.snapShot) { return; }
    const res = this.downloadService.downloadItems.jdbcpool.stackDepth;
    if (role === 'Admin') {
      this.stackBtnTip = this.i18nService.I18nReplace(this.i18n.newHeader.setting.stackAdmin, { 0: res });
    } else {
      this.stackBtnTip = this.i18nService.I18nReplace(this.i18n.newHeader.setting.stackUser, { 0: res });
    }
    this.srcDataTable = {
      data: this.tableData,
      state: {
        searched: false,
        sorted: false,
        paginated: false
      }
    };
    this.snapshotA = this.prevHeapLabel;
    this.snapshotB = this.currentHeapLabel;
    if (this.downloadService.downloadItems.snapShot.snapShotData) {
      this.snapShot = JSON.parse(this.downloadService.downloadItems.snapShot.snapShotData);
      this.snapShotData(this.snapShot);
      this.handleSortCompare(this.snapShotADataFile, this.snapShotBDataFile);
      this.comparedDatas = this.handleFileOriData(this.snapShotADataFile, this.snapShotBDataFile);
      this.srcDataTable.data = this.comparedDatas;
      this.tableData = this.comparedDatas;
    }
    // 左侧
  }
  public renderItem(params: any, api: any) {
    const categoryIndex = api.value(0);
    const start = api.coord([api.value(1), categoryIndex]);
    const end = api.coord([api.value(2), categoryIndex]);
    const height = api.size([0, 1])[1] * 0.6;

    const rectShape = echarts.graphic.clipRectByRect({
      x: start[0],
      y: start[1] - height / 2,
      width: end[0] - start[0],
      height
    }, {
      x: params.coordSys.x,
      y: params.coordSys.y,
      width: params.coordSys.width,
      height: params.coordSys.height
    });

    return rectShape && {
      type: 'rect',
      shape: rectShape,
      style: api.style()
    };
  }
  public onContrastHoverList(label?: any) {
    this.ContrastHover = label;
  }
  public goBack() {
    this.childOuter.emit(false);
  }
  onSelectToggle(item: TiTableColumns): void {
    const selectedColumns: Array<TiTableColumns> = this.columnsTable.filter((column: { show?: boolean }) => {
      return column.show === true || column.show === undefined;
    });
    let InstanceNumL = 0;
    let HeapNumL = 0;
    this.columnsTable.forEach(e => {
      if (e.type === 'beginTime' && e.show) {
        InstanceNumL++;
      } else if (e.type === 'endTime' && e.show) {
        HeapNumL++;
      } else if (e.type === 'count' && e.show) {
        HeapNumL++;
      } else if (e.type === 'duration' && e.show) {
        HeapNumL++;
      }
    });
    this.InstanceNum = InstanceNumL;
    this.HeapNum = HeapNumL;
  }
  public toggleSnapshotIN() {
    const obj = {
      A: this.snapshotA,
      B: this.snapshotB
    };
    this.childTGSnapshotIN.emit(obj);
  }
  public getData(currentHeapLabel: any, prevHeapLabel: any) {
    this.snapshotA = prevHeapLabel;
    this.snapshotB = currentHeapLabel;
    this.snapShot = JSON.parse(this.downloadService.downloadItems.snapShot.snapShotData);
    this.snapShotData(this.snapShot);

    this.handleSortCompare(this.snapShotADataFile, this.snapShotBDataFile);
    this.comparedDatas = this.handleFileOriData(this.snapShotADataFile, this.snapShotBDataFile);
    this.srcDataTable.data = this.comparedDatas;
    this.tableData = this.comparedDatas;
  }
  public snapShotData(snapShot: any) {
    this.toggleSnapshotIN();
    this.srcDataTable.data = [];
    const dataArr = snapShot[this.snapshotType].children;
    const itemArr: any[] = [];
    dataArr.forEach((item: any) => {
      if (item.label === this.snapshotA) {
        this.snapShotADataFile = item.value.file;
        itemArr.push(item);
      } else if (item.label === this.snapshotB) {
        this.snapShotBDataFile = item.value.file;
        this.changeColor(item);
        itemArr.push(item);
      }
    });
    this.handlePoolData(itemArr);
  }
  public changeColor(item: any) {
    item.value.series[0].data.forEach((ele: any) => {
      if (ele.itemStyle.normal.color === '#f45c5e') {
        ele.itemStyle.normal.color = '#E88B00';
      } else {
        ele.itemStyle.normal.color = '#037DFF';
      }
    });
  }
  public handlePoolData(itemArr: any[]) {
    const dataArr = itemArr;
    const seriesData = dataArr[1].value.series[0].data.concat(dataArr[0].value.series[0]);
    this.echartsOption = {
      tooltip: {
        backgroundColor: '#ffffff',
        borderRadius: 5,
        boxShadow: 'rgba(0, 0, 0, 0.5)',
        textStyle: {
          color: '#000000',
        },
        extraCssText: 'box-shadow: 0px 4px 8px 0px rgba(0, 0, 0, .2);',
        formatter: (params: any) => {
          this.onClickTableRow(params.data);
          return `${params.name[0]}: ${params.value[3]}<br>${params.name[1]}: ${params.data.connectOwnerThread}`;
        }
      },
      legend: {
        itemHeight: 10,
        itemWidth: 10,
        icon: 'rect'
      },
      dataZoom: [
        {
          type: 'slider',
          show: true,
          start: 0,
          end: 100,
          filterMode: 'filter',
          showDetail: false,
          height: 15,
          bottom: 20,
          fillerColor: 'rgba(0, 108, 255, 0.15)'
        },
        {
          type: 'inside',
          xAxisIndex: 0,
          start: 0,
          end: 100,
          filterMode: 'filter',
          zoomOnMouseWheel: true,
        }
      ],
      grid: {
        left: 100,
        top: 50,
        right: 60,
      },
      xAxis: [{
        scale: true,
        position: 'top',
        axisTick: {
          show: false
        },
        axisLine: {
          lineStyle: {
            color: '#d4d9e6',
            width: 2
          }
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: ['#d4d9e6'],
            width: 1
          }
        },
        axisLabel: {
          formatter: (val: any) => {
            const date = new Date(val);
            const hour = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
            const min = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
            const sec = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
            return `${hour}:${min}:${sec}`;
          }
        }
      }, {
        scale: true,
        position: 'bottom',
        axisTick: {
          show: false
        },
        axisLabel: {
          show: false
        },
        axisLine: {
          lineStyle: {
            color: '#d4d9e6',
            width: 2
          }
        }
      }],
      yAxis: {
        data: dataArr[dataArr.length - 1].value.yAxis.data,
        axisLabel: {
          margin: 60,
          align: 'center'
        },
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: ['#d4d9e6'],
            width: 1
          }
        }
      },
      series: [{
        type: 'custom',
        renderItem: this.renderItem,
        itemStyle: {
          height: 15,
          opacity: 0.8
        },
        encode: {
          x: [1, 2],
          y: 0
        },
        data: seriesData
      }]
    };
    this.categories = dataArr[dataArr.length - 1].value.yAxis;
    const chart = document.getElementById('echartId');
    if (this.categories.length > 10) {
      chart.style.height = `${this.categories.length * 38}px`;
    }
  }
  public handleFileOriData(base: any, compare: any): any {
    if (!base || !compare) { return; }
    base.forEach((item: any) => {
      const compareFile = compare.find((compareData: any): any => {
        if (Object.prototype.hasOwnProperty.call(compareData, 'sessId')) {
          return compareData.sessId === item.sessId;
        }
      });
      if (!compareFile) {
        compare.push(item);
      } else {
        compareFile.own = 'A&B';
        if (compareFile != null) {
          for (const key of Object.keys(compareFile)) {
            if (Object.prototype.hasOwnProperty.call(compareFile, key) && typeof compareFile[key] === 'number') {
              if (key === 'count') {
                compareFile.compare.Ccount = compareFile[key] - item[key];
              } else if (key === 'duration') {
                compareFile.compare.Cduration = compareFile[key] - item[key];
              } else {
                compareFile.compare[key] = compareFile[key] - item[key];
              }
            }
            if (Object.prototype.hasOwnProperty.call(compareFile, key) && typeof compareFile[key] === 'string') {
              if (key === 'startTime' || key === 'endTime') {
                compareFile.compare[key] = (Number(compareFile[key]) - Number(item[key]));
              }
            }
          }
        }
        if (Object.prototype.hasOwnProperty.call(item, 'sessions')) {
          const itemValue = Object.values(item.sessions);
          let compareFileValue: any = {};
          if (compareFile) {
            compareFileValue = Object.values(compareFile.sessions);
          }
          this.handleFileOriData(itemValue, compareFileValue);
        }
      }
    });
    return compare;
  }
  public handleSortCompare(base: any[], compare: any[]) {
    this.baseData = this.sortAOrB(base, 'A');
    this.compareData = this.sortAOrB(compare, 'B');
  }
  /**
   * 将原始数据标记为A或者B
   * @param data 原始数据
   * @param AOrB 设置为A，或者B
   */
  private sortAOrB(data: any[], AOrB: string): any {
    if (!data) { return; }
    data.forEach((item: any) => {
      item.own = AOrB;
      const compData = {
        Ccount: 0,
        Cduration: 0,
        CstartTime: 0,
        CendTime: 0,
      };
      item.compare = compData;
      if (Object.prototype.hasOwnProperty.call(item, 'sessions')) {
        const tableDataValue = Object.values(item.sessions);
        this.sortAOrB(tableDataValue, AOrB);
      }
    });
    return data;
  }
  public toggleSnapshot() {
    this.srcDataTable.data = [];
    this.tableData = [];
    if (this.snapshotA === this.prevHeapLabel) {
      this.snapshotA = this.currentHeapLabel;
      this.snapshotB = this.prevHeapLabel;
    } else if (this.snapshotA === this.currentHeapLabel) {
      this.snapshotA = this.prevHeapLabel;
      this.snapshotB = this.currentHeapLabel;
    }
    this.snapShot = JSON.parse(this.downloadService.downloadItems.snapShot.snapShotData);
    this.snapShotData(this.snapShot);
    this.handleSortCompare(this.snapShotADataFile, this.snapShotBDataFile);
    this.comparedDatas = this.handleFileOriData(this.snapShotADataFile, this.snapShotBDataFile);
    this.srcDataTable.data = this.comparedDatas;
    this.tableData = this.comparedDatas;
    this.stackTranceData = [];
    this.stackTranceDataEnd = [];
  }
  public openSuggest() {
    this.isSuggest = true;
  }
  public closeReport() {
    this.sugReport = false;
  }
  public beforeToggle(row: TiTableRowData): void {
    this.srcDataTable.data = this.comparedDatas;
    this.srcDataTable.data.forEach(e => {
      if (row.linkId !== e.linkId) {
        e.showDetails = false;
      }
    });
    this.currentFdTableList = [];
    this.currentFdTableListTop = [];
    const sessionsArr = Object.values(row.sessions);
    this.currentFdTableList = sessionsArr.sort((a: any, b: any) => {
      return b.count - a.count;
    });
    this.currentFdTableListTop = this.currentFdTableList.slice(0, this.spinnerValue);
    row.showDetails = !row.showDetails;
  }
  // 点击表格某行
  public onClickTableRow(row: any) {
    if (this.subrow) {
      this.subrow.isSelect = false;
    }
    this.subrow = row;
    this.subrow.isSelect = true;
    this.stackTranceData = [];
    this.stackTranceDataEnd = [];
    row.stackTraces.forEach((stack: any) => {
      if (stack.status !== 'close') {
        this.stackTranceData = stack.children;
      } else {
        this.stackTranceDataEnd = stack.children;
      }
    });
  }
  public onSelect(event: TiTreeNode): void {
    // 获取当前选中项，参数：树节点数据，选中项是否只包含叶子节点，是否多选
    this.selectedData = TiTreeUtil.getSelectedData(
      this.stackTranceData,
      false,
      false
    );
  }
  // 展开整个树
  public expandNode(state: string): void {
    const data: Array<TiTreeNode> = state === 'start' ?
     this.stackTranceData.concat() : this.stackTranceDataEnd.concat();
    TiTreeUtil.traverse(data, traverseFn);
    function traverseFn(node: TiTreeNode): void {
      node.expanded = true;
    }
    state === 'start' ? this.stackTranceData = data : this.stackTranceDataEnd = data;
  }
  public handleTimeFormat(time: any) {
    if (!time) {
      return '--';
    }
    const date = new Date(+time);
    const year = date.getFullYear();
    const month = +date.getMonth() + 1;
    const months = month < 10 ? '0' + month : month;
    const day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
    const hour = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
    const min = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
    const sec = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
    const misec = date.getMilliseconds();
    return `${year}:${months}:${day} ${hour}:${min}:${sec}.${misec}`;
  }
  public onModelChange(value: any): void {
    if (!value) {
      this.spinnerValue = 0;
    }
  }
  /**
   * 展开整个树
   * @param row row
   */
  public expandAllNode(row: TiTableRowData, index: number) {
    if (row.expanded) {
      return;
    }
    let treeData;
    if (!index) {
      treeData = this.stackTranceData;
    } else {
      treeData = this.stackTranceDataEnd;
    }
    const data: Array<TiTreeNode> = treeData.concat();
    TiTreeUtil.traverse(data, traverseFn);
    function traverseFn(node: TiTreeNode): void {
      node.expanded = true;
    }
    if (!index) {
      this.stackTranceData = data;
    } else {
      this.stackTranceDataEnd = data;
    }
  }

}
