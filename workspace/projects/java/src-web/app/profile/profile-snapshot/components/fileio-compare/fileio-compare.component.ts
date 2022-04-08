import { Component, OnInit, Output, Input, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { TiTableColumns, TiTableRowData, TiTableSrcData, TiTreeNode, TiTreeUtil, TiTreeComponent } from '@cloud/tiny3';
import { I18nService } from '../../../../service/i18n.service';
import { Subscription } from 'rxjs';
import { ProfileDownloadService } from '../../../../service/profile-download.service';
import { LibService } from '../../../../service/lib.service';
import * as echarts from 'echarts/core';

@Component({
  selector: 'app-fileio-compare',
  templateUrl: './fileio-compare.component.html',
  styleUrls: ['./fileio-compare.component.scss']
})
export class FileioCompareComponent implements OnInit {
  @Input() currentHeapLabel: any;
  @Input() prevHeapLabel: any;
  @Input() snapshotType: any;
  @Input() leftState: boolean;
  @Output() private childOuter = new EventEmitter();
  @Output() private childTGSnapshotIN = new EventEmitter();
  @ViewChild('TimeLine') TimeLine: any;
  constructor(
    public i18nService: I18nService,
    public libService: LibService,
    public downloadService: ProfileDownloadService,
    private elementRef: ElementRef,
  ) {
    this.i18n = this.i18nService.I18n();
    this.echartsTitle = this.i18n.io.fileIo.fileIORate;
    this.searchValue.placeholder = this.i18nService.I18nReplace(
      this.i18n.searchBox.info,
      {
        0: this.i18n.io.fileIo.filePath
      }
    );
    this.searchThreadValue.placeholder = this.i18nService.I18nReplace(
      this.i18n.searchBox.info,
      {
        0: this.i18n.io.fileIo.threadName
      }
    );
    // 左侧
    this.columnsTable = [
      {
        title: this.i18n.io.fileIo.path,
        width: '180px',
        isSort: false,
        sortKey: 'path',
        fixed: 'left',
        show: undefined
      },
      {
        title: this.i18n.profileMemorydump.snapShot.fileIo.IOBTotalTime,
        width: '8%',
        isSort: true,
        sortKey: 'duration',
        show: true
      },
      {
        title: this.i18n.profileMemorydump.snapShot.fileIo.IOTotalTime,
        width: '8%',
        isSort: true,
        sortKey: 'duration',
        show: true
      },
      {
        title: this.i18n.profileMemorydump.snapShot.fileIo.BSnapshotCount,
        width: '8%',
        isSort: true,
        sortKey: 'count',
        show: true
      },
      {
        title: this.i18n.profileMemorydump.snapShot.fileIo.CountComparison,
        width: '8%',
        isSort: true,
        sortKey: 'count',
        show: true
      },
      {
        title: this.i18n.profileMemorydump.snapShot.fileIo.BRCount,
        width: '8%',
        isSort: true,
        sortKey: 'rCount',
        show: true
      },
      {
        title: this.i18n.profileMemorydump.snapShot.fileIo.RCount,
        width: '8%',
        isSort: true,
        sortKey: 'rCount',
        show: true
      },
      {
        title: this.i18n.profileMemorydump.snapShot.fileIo.BWCount,
        width: '8%',
        isSort: true,
        sortKey: 'wCount',
        show: true
      },
      {
        title: this.i18n.profileMemorydump.snapShot.fileIo.WCount,
        width: '8%',
        isSort: true,
        sortKey: 'wCount',
        show: true
      },
      {
        title: this.i18n.profileMemorydump.snapShot.fileIo.BRBytes,
        width: '8%',
        isSort: true,
        sortKey: 'rByte',
        show: true
      },
      {
        title: this.i18n.profileMemorydump.snapShot.fileIo.RBytes,
        width: '8%',
        isSort: true,
        sortKey: 'rByte',
        show: true
      },
      {
        title: this.i18n.profileMemorydump.snapShot.fileIo.BWBytes,
        width: '8%',
        isSort: true,
        sortKey: 'wByte',
        show: true
      },
      {
        title: this.i18n.profileMemorydump.snapShot.fileIo.WBytes,
        width: '8%',
        isSort: true,
        sortKey: 'wByte',
        show: true
      },
    ];
    // 右侧
    this.columnsTableTime = [{
      title: this.i18n.io.fileIo.threadName,
      width: '20%',
      sortKey: 'threadName',
      fixed: 'left'
    },
    {
      title: this.i18n.io.fileIo.snapshotOwn,
      width: '14%',
      filter: true,
      sortKey: 'own',
      key: 'own',
      selected: [], // 该列的 headfilter 下拉选中项
      options: [{
        label: 'A'
      }, {
        label: 'B'
      }, {
        label: 'A&B'
      }],
      multiple: true,
      selectAll: true
    },
    {
      title: this.i18n.io.fileIo.operateType,
      width: '13%',
      filter: true,
      sortKey: 'type',
      key: 'type',
      selected: [], // 该列的 headfilter 下拉选中项
      options: [{
        label: 'read'
      }, {
        label: 'write'
      }, {
        label: 'open'
      }, {
        label: 'close'
      }],
      multiple: true,
      selectAll: true
    },
    {
      title: this.i18n.io.fileIo.operateTime,
      width: '13%',
      isSort: true,
      sortKey: 'start'
    },
    {
      title: this.i18n.io.fileIo.rAndWBytes,
      width: '13%',
      isSort: true,
      sortKey: 'byte'
    },
    {
      title: this.i18n.io.fileIo.eventRate,
      width: '13%',
      isSort: true,
      sortKey: 'rate'
    },
    {
      title: this.i18n.io.fileIo.duration,
      width: '13%',
      isSort: true,
      sortKey: 'duration'
    }];
  }
  public HeapNum: any = 0;
  public InstanceNum: any = 0;
  public disabled = false;
  public selectAll = true;
  public panelWidth = '250px';
  public searchable = false; // 可切换测试
  public tipPosition = 'left'; // 10.0.3版本新增，默认提示文本方向为'top'
  public i18n: any;
  // 左侧 表格部分
  public displayedTable: Array<TiTableRowData> = []; // 表示表格实际呈现的数据（开发者默认设置为[]即可）
  public srcDataTable: TiTableSrcData;
  public columnsTable: Array<TiTableColumns> = [];
  public searchValue: any = {
    placeholder: 'please input search key',
    value: ''
  };
  public searchWords: Array<string> = [this.searchValue.value];
  public searchThreadValue: any = {
    placeholder: 'please input search key',
    value: ''
  };
  public searchThreadWords: Array<string> = [this.searchThreadValue.value];
  public searchKeys: Array<string> = [];
  public closeOtherDetails = true;
  public currentFdTableList: Array<any> = [];
  public currentFdTableListTop: Array<any> = [];
  public leftcurrentPage = 1;
  public lefttotalNumber = 0;
  public leftpageSize: { options: Array<number>, size: number } = {
    options: [10, 20, 50, 100],
    size: 10
  };
  public currentPage = 1;
  public totalNumber = 0;
  public pageSize: { options: Array<number>, size: number } = {
    options: [10, 20, 50, 100],
    size: 10
  };
  public spinnerValue = 10;
  public spinner = {
    label: '',
    max: 10000,
    min: 0,
    rangeValue: [0, 10000],
    format: 'N0',
  };
  public startBtnDisabled = false;
  public expand = false;
  public threadListData: Array<any> = [];
  public baseData: Array<any> = [];
  public compareData: Array<any> = [];

  public ContrastHover: string;
  public snapshotA: string;
  public snapshotB: string;
  private μs = 1000;
  private ms = Math.pow(1000, 2);
  public tableListData: Array<any> = [];
  public echartsTitle: string;

  // 右侧 表格
  public displayedTableTime: Array<TiTableRowData> = []; // 表示表格实际呈现的数据（开发者默认设置为[]即可）
  public srcDataTableTime: TiTableSrcData;
  private dataTableTime: Array<TiTableRowData> = [];
  public columnsTableTime: Array<TiTableColumns> = [];
  public searchThreadKeys: Array<string> = ['threadName'];
  public tip1Context: any;
  public snapCount: number;
  public currentEchartsIsFile = true;
  public currentEchartsFileName = '';
  public currentEchartsFdName = '';
  public currentStacktrace: Array<any> = [];
  private currnetEchartsData = {
    startTime: '',
    readSpeed: 0,
    writeSpeed: 0,
    readCount: 0,
    writeCount: 0
  };
  public dataLimit: any = {
    limitTime: '',
    limitData: '',
    primaryTime: null,
    clearBuffer: 0.2,
    dataCount: 0,
  };
  // 栈
  public stackTranceData: Array<TiTreeNode> = [];
  selectedData: Array<TiTreeNode> = TiTreeUtil.getSelectedData(
    this.stackTranceData,
    false,
    false
  );
  public totalCountMonitor: any;
  public beginFileIo = false;
  public Threshold = 1;
  public threshold = {
    label: '',
    min: 1,
    max: 10485760,
    value: 1024,
    rangeValue: [1, 10485760],
    format: 'N0',
  };
  // echarts
  public chartId = Math.floor(Math.random() * 10000000000);
  public echartsLabelTop: any;
  public echartsLabelBottom = 0;
  public echartsOption: any;
  public echartsData: any = {
    timeList: [],
    readSpeed: [],
    writeSpeed: []
  };
  public stackBtnTip: string;
  public snapShot: any;
  public snapShotADataFile: Array<any> = [];
  public snapShotBDataFile: Array<any> = [];
  public snapShotAthreshold: string;
  public snapShotBthreshold: string;
  public fileNameMap: any = {};
  public fileIOEcharts: any;
  public compareEchartsData: any = {
    timeList: [],
    timeAList: [],
    timeBList: [],
    ReadSpeedA: [],
    WeadSpeedA: [],
    ReadSpeedB: [],
    WeadSpeedB: []
  };
  public comparedDatas: Array<any> = [];
  public tablePath: string;
  public timeData: any = [];
  public isLoading: any = false;
  ngOnInit(): void {
    // 设置初始化第一列 headfilter 的选中项
    this.columnsTableTime[1].selected = [
      this.columnsTableTime[1].options[0], this.columnsTableTime[1].options[1], this.columnsTableTime[1].options[2]
    ];
    this.HeapNum = 1;
    this.InstanceNum = 1;
    if (this.snapshotType === 'pFileIO') {
      this.tablePath = this.i18n.io.fileIo.path;
    } else if (this.snapshotType === 'pSocketIO') {
      this.tablePath = this.i18n.io.fileIo.socketPath;
    }
    // 左侧
    this.srcDataTable = {
      data: [],
      state: {
        searched: false,
        sorted: false,
        paginated: false
      }
    };
    // 右侧
    this.srcDataTableTime = {
      data: [],
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
    }
    this.handleFileClicked(this.srcDataTable.data[0], 0);
    const role = sessionStorage.getItem('role');
    if (role === 'Admin') {
      this.stackBtnTip = this.i18nService.I18nReplace(
        this.i18n.newHeader.setting.stackAdmin,
        { 0: this.downloadService.downloadItems.pFileIO.stackDepth }
      );
    } else {
      this.stackBtnTip = this.i18nService.I18nReplace(
        this.i18n.newHeader.setting.stackUser,
        { 0: this.downloadService.downloadItems.pFileIO.stackDepth }
      );
    }
  }
  public toggleSnapshotIN() {
    const obj = {
      A: this.snapshotA,
      B: this.snapshotB
    };
    this.childTGSnapshotIN.emit(obj);
  }
  onSelectToggle(item: TiTableColumns): void {
    const selectedColumns: Array<TiTableColumns> = this.columnsTable.filter((column: { show?: boolean }) => {
      return column.show === true || column.show === undefined;
    });
    let InstanceNumL = 0;
    let HeapNumL = 0;
    this.columnsTable.forEach(e => {
      if (e.type === 'duration' && e.show) {
        InstanceNumL++;
      } else if (e.type === 'count' && e.show) {
        HeapNumL++;
      } else if (e.type === 'rCount' && e.show) {
        HeapNumL++;
      } else if (e.type === 'wCount' && e.show) {
        HeapNumL++;
      } else if (e.type === 'rByte' && e.show) {
        HeapNumL++;
      } else if (e.type === 'wByte' && e.show) {
        HeapNumL++;
      }
    });
    this.InstanceNum = InstanceNumL;
    this.HeapNum = HeapNumL;
  }
  public getIoData(currentHeapLabel: any, prevHeapLabel: any) {
    this.snapshotA = prevHeapLabel;
    this.snapshotB = currentHeapLabel;
    this.snapShot = JSON.parse(this.downloadService.downloadItems.snapShot.snapShotData);
    this.snapShotData(this.snapShot);
    this.handleSortCompare(this.snapShotADataFile, this.snapShotBDataFile);
    this.comparedDatas = this.handleFileOriData(this.snapShotADataFile, this.snapShotBDataFile);
    this.srcDataTable.data = this.comparedDatas;
    this.handleUpdateThreads(this.srcDataTable.data[0]);
    this.onClickRightTable(this.srcDataTableTime.data[0], 0);
    this.handleEchartsCompare();
  }

  /**
   * 遍历查找两个日期快照的数据
   * @param snapShot 所有快照数据
   */
  public snapShotData(snapShot: any) {
    this.isLoading = true;
    this.srcDataTable.data = [];
    this.srcDataTableTime.data = [];
    this.toggleSnapshotIN();
    const dataArr = snapShot[this.snapshotType].children;
    dataArr.forEach((item: any) => {
      if (item.label === this.snapshotA) {
        this.snapShotAthreshold = item.value.threshold;
        this.snapShotADataFile = item.value.file;
      } else if (item.label === this.snapshotB) {
        this.snapShotBthreshold = item.value.threshold;
        this.snapShotBDataFile = item.value.file;
      }
    });
  }
  /**
   * 是否展开表格
   */
  public onClickExpand(): void {
    this.expand = !this.expand;
  }
  /**
   * 搜索
   * @param value value
   */
  keySearch(value: string): void {
    this.searchWords[0] = value;
  }
  searchClear(value: string): void {
    this.searchWords[0] = '';
  }
  threadSearch(value: string): void {
    this.searchThreadWords[0] = value;
  }
  threadClear(value: string): void {
    this.searchThreadWords[0] = '';
  }
  public handleSortCompare(base: any, compare: any) {
    this.baseData = this.sortAOrB(base, 'A');
    this.compareData = this.sortAOrB(compare, 'B');
  }
  /**
   * 将原始数据标记为A或者B
   * @param data 原始数据
   * @param AOrB 设置为A，或者B
   */
  private sortAOrB(data: any, AOrB: any) {
    if (!data) { return; }
    data.forEach((item: any) => {
      item.own = AOrB;
      const compData = {
        count: 0,
        duration: 0,
        rByte: 0,
        rCount: 0,
        wByte: 0,
        wCount: 0
      };
      item.compare = compData;
      if (Object.prototype.hasOwnProperty.call(item, 'children')) {
        this.sortAOrB(item.children, AOrB);
      }
      if (Object.prototype.hasOwnProperty.call(item, 'options')) {
        this.sortAOrB(item.options, AOrB);
      }
    });
    return data;
  }
  /**
   * 以基准数据为底，判断compare数据变化(线程还没对比，线程数据不会变化，但是需要区分A，B和A&B)
   * @param base 基准数据
   * @param compare 对比数据
   */
  public handleFileOriData(base: any, compare: any) {
    if (!base || !compare) { return; }
    base.forEach((item: any) => {
      const compareFile = compare.find((compareData: any): any => {
        if (Object.prototype.hasOwnProperty.call(compareData, 'fileName')) {
          return compareData.fileName === item.fileName;
        }
        if (Object.prototype.hasOwnProperty.call(compareData, 'fileDes')) {
          return compareData.fileDes === item.fileDes;
        }
        if (Object.prototype.hasOwnProperty.call(compareData, 'ip')) {
          return compareData.ip === item.ip;
        }
        if (Object.prototype.hasOwnProperty.call(compareData, 'host')) {
          return compareData.host === item.host;
        }
      });
      if (!compareFile) {
        compare.push(item);
      } else {
        compareFile.own = 'A&B';
        if (Object.prototype.hasOwnProperty.call(compareFile, 'fileDes')) {
          compareFile.options = this.threadCompare(item.options, compareFile.options);
        }
      }
      if (compareFile != null) {
        for (const key of Object.keys(compareFile)) {
          if (Object.prototype.hasOwnProperty.call(compareFile, key) && typeof compareFile[key] === 'number') {
            compareFile.compare[key] = compareFile[key] - item[key];
          }
          if (item.children) {
            this.handleFileOriData(item.children, compareFile.children);
          }
        }
      }
    });
    return compare;
  }
  private threadCompare(base: any, compare: any) {
    base.forEach((baseThread: any) => {
      const compareThread = compare.find((compThread: any) => {
        return compThread.threadName === baseThread.threadName &&
          compThread.originTime === baseThread.originTime &&
          compThread.type === baseThread.type;
      });
      if (!compareThread) {

      } else {
        compareThread.own = 'A&B';
      }
    });
    return compare;
  }
  /**
   * 达到数据限定时清空表格数据
   * @param data 每次的数据
   */
  public handleTableDataLimit(data: any) {
    if (!this.dataLimit.primaryTime) {
      this.dataLimit.primaryTime = data[0].originTime;
    }
    if (!this.srcDataTable.data.length) {
      return;
    }
    if (this.dataLimit.dataCount > +this.dataLimit.limitData) {
      const lastTime = data[0].originTime;
      const diffTime = Math.ceil((lastTime - this.dataLimit.primaryTime) * this.dataLimit.clearBuffer) +
        this.dataLimit.primaryTime;
      this.handleClearTableData(diffTime);
      this.dataLimit.primaryTime = diffTime;
    }
  }
  /**
   * 达到数据限定时清理表格数据
   * @param lastTime 达到数据限定的最后一个时间
   */
  private handleClearTableData(diffTime: any) {
    this.dataLimit.dataCount = 0;
    let currentFileThreadCount = 0;
    const currentFileIndex = this.fileNameMap[String(this.currentEchartsFileName)] - 1;
    this.srcDataTable.data[currentFileIndex].children.forEach((fd: any) => {
      currentFileThreadCount += fd.options.length;
    });
    this.srcDataTable.data.forEach((file, fileIndex) => {
      if (
        this.currentEchartsFileName === file.fileName &&
        currentFileThreadCount < Number(this.dataLimit.limitData) * this.dataLimit.clearBuffer
      ) {
        return;
      }
      file.children.forEach((fd: any, fdIndex: any) => {
        fd.options.forEach((thread: any, threadIndex: any) => {
          if (thread.originTime <= diffTime) {
            fd.options.splice(threadIndex, 1);
          }
        });
        if (!fd.options.length) {
          file.children.splice(fdIndex, 1);
        } else {
          this.dataLimit.dataCount += fd.options.length;
        }
      });
      if (!file.children.length) {
        delete this.fileNameMap[file.fileName];
        this.srcDataTable.data.splice(fileIndex, 1);
      }
    });
  }
  /**
   * 处理从worker中传来的每一条数据
   * @param currentData 每一条数据
   */
  public handleAllData(currentData: any) {
    if (this.dataLimit.dataCount > +this.dataLimit.limitData) {
      this.handleTableDataLimit(currentData.fd.options);
    }
    this.dataLimit.dataCount += currentData.fd.options.length;
    const index = this.fileNameMap[currentData.fileName];
    const currentFile = this.handleFileIndex(index, currentData);
    const currentFd = currentData.fd;
    this.hanldeFileData(currentFile, currentFd);
    this.handleFdData(currentFile, currentFd);
    // 更新选中项
    this.handleSelectedUpdate();
    this.handleEchartsUpdate(currentData);
  }
  /**
   * 更新当前已选中的某行（路径或线程）的echarts数据
   * @param currentData 当前某一条数据
   */
  public handleEchartsUpdate(currentData: any) {
    if (this.currentEchartsIsFile && currentData.fileName === this.currentEchartsFileName) {
      return this.handleCacheEchartsData(currentData.fd);
    }
    if (
      !this.currentEchartsIsFile &&
      currentData.fileName === this.currentEchartsFileName &&
      currentData.fd.fileDes === this.currentEchartsFdName
    ) {
      return this.handleCacheEchartsData(currentData.fd);
    }
  }
  /**
   * 缓存当前某条数据，当吓一跳数据的时间与当前时间不同时，讲当前时间推出，缓存下一条数据
   * @param echartsData 当前数据
   */
  private handleCacheEchartsData(echartsData: any, own?: any) {
    const type = echartsData.type;
    const rate = echartsData.rate;
    if (type === 'open' || type === 'close') { return; }
    if (this.currnetEchartsData.startTime && echartsData.start !== this.currnetEchartsData.startTime) {
      this.handleLastCacheEchartsData(own);
    }
    this.currnetEchartsData.startTime = echartsData.start;
    if (type === 'read') {
      this.currnetEchartsData.readCount++;
      this.currnetEchartsData.readSpeed += rate;
    } else {
      this.currnetEchartsData.writeCount++;
      this.currnetEchartsData.writeSpeed += rate;
    }
  }
  /**
   * 处理当前数据
   */
  private handleLastCacheEchartsData(own?: any) {
    if (!this.currnetEchartsData.startTime) {
      return;
    }
    this.currnetEchartsData.readSpeed = this.currnetEchartsData.readCount === 0
      ? 0.000
      : +(this.currnetEchartsData.readSpeed / this.currnetEchartsData.readCount).toFixed(2);
    this.currnetEchartsData.writeSpeed = this.currnetEchartsData.writeCount === 0
      ? 0.000
      : +(this.currnetEchartsData.writeSpeed / this.currnetEchartsData.writeCount).toFixed(2);
    this.handleEchartsData(this.currnetEchartsData, own);
    this.currnetEchartsData.readCount = 0;
    this.currnetEchartsData.writeCount = 0;
    this.currnetEchartsData.readSpeed = 0;
    this.currnetEchartsData.writeSpeed = 0;
    this.currnetEchartsData.startTime = '';
  }
  /**
   * 更新当前echarts
   * @param echarts 数据
   */
  public handleEchartsData(echartsData: any, own?: any) {
    const readSpeed = echartsData.readSpeed;
    const writeSpeed = echartsData.writeSpeed;
    const bigger = Math.max(+writeSpeed, +readSpeed);
    this.echartsLabelTop = Math.max(this.echartsLabelTop, bigger);
    this.echartsLabelTop = this.echartsLabelTop.toFixed(2);
    this.supplementDis(echartsData.startTime, own);
    this.reduceEchartsData(echartsData.startTime, readSpeed, writeSpeed, own);
    this.updateEchartsData();
  }
  /**
   * 如果当前数据时间比上一个数据时间的差多1s的倍数时，差值设置为0
   * @param timeData 当前数据时间
   */
  private supplementDis(timeData: string, own?: any) {
    const len: any = [];
    let timeList = [];
    if (own === 'A') {
      timeList = this.compareEchartsData.timeAList;
    } else {
      timeList = this.compareEchartsData.timeBList;
    }
    timeList.forEach((item: any) => {
      if (item !== '') {
        len.push(item);
      }
    });
    if (!len.length) { return; }
    const year = new Date().getFullYear();
    const date = new Date().getMonth() + 1;
    const day = new Date().getDate();
    const newDate = `${year}/${date}/${day} `;
    const nowTime = (new Date(newDate + timeData)).getTime();
    const lastTime = (new Date(newDate + len[len.length - 1])).getTime();
    const diff = Math.floor((nowTime - lastTime) / 1000);
    if (diff > 1) {
      let count = 1;
      while (count <= diff - 1) {
        const time = this.libService.dateFormat(lastTime + (count * 1000), 'hh:mm:ss');
        this.reduceEchartsData(time, 0, 0, own);
        count++;
      }
    }
  }
  /**
   * 更新/删除xAxis数据
   * @param time x轴数据
   */
  public reduceEchartsData(time: string, readSpeed: number, writeSpeed: number, own?: string) {
    if (own === 'A') {
      this.compareEchartsData.timeAList.push(time);
      this.compareEchartsData.ReadSpeedA.push(readSpeed);
      this.compareEchartsData.WeadSpeedA.push(writeSpeed);
    } else {
      this.compareEchartsData.timeBList.push(time);
      this.compareEchartsData.ReadSpeedB.push(readSpeed);
      this.compareEchartsData.WeadSpeedB.push(writeSpeed);
    }
  }
  /**
   * 更新已有路径数据
   * @param currentFile 已存在的路径下的数据
   * @param currentFd 当前某一条数据
   */
  public hanldeFileData(currentFile: any, currentFd: any) {
    currentFile.duration += currentFd.duration;
    currentFile.count += currentFd.count;
    currentFile.rCount += currentFd.rCount;
    currentFile.wCount += currentFd.wCount;
    currentFile.rByte += currentFd.rByte;
    currentFile.wByte += currentFd.wByte;
  }
  /**
   * 判断当前路径下是否有当前线程，如果有则更新，没有则添加
   * @param currentFile 已存在的路径下的数据
   * @param currentFd  当前某一条数据
   */
  public handleFdData(currentFile: any, currentFd: any) {
    const oldFd = currentFile.children.find((item: any) => {
      return item.fileDes === currentFd.fileDes;
    });
    if (!oldFd) {
      currentFile.children.push(currentFd);
    } else {
      oldFd.duration += currentFd.duration;
      oldFd.count += currentFd.count;
      oldFd.rCount += currentFd.rCount;
      oldFd.wCount += currentFd.wCount;
      oldFd.rByte += currentFd.rByte;
      oldFd.wByte += currentFd.wByte;
      oldFd.options.push(currentFd.options[0]);
    }
  }
  /**
   * 当MAP中没有当前路径时，添加新MAP数据，同时在数组中添加新路径地址
   * @param index 某路径在MAP中的位置
   * @param currentData 当前某一条数据
   */
  public handleFileIndex(index: any, currentData?: any) {
    if (index) { return this.srcDataTable.data[index - 1]; }
    const fileName = currentData.fileName;
    const file: any = {
      fileName,
      duration: 0,
      count: 0,
      rCount: 0,
      wCount: 0,
      rByte: 0,
      wByte: 0,
      children: [],
      isSelect: false,
      showDetails: false
    };
    this.srcDataTable.data.push(file);
    if (!this.currentFdTableList.length) {
      this.srcDataTable.data[0].isSelect = true;
      this.currentFdTableList = this.srcDataTable.data[0].children;
    }
    this.fileNameMap[fileName] = this.srcDataTable.data.length;
    return this.srcDataTable.data[this.srcDataTable.data.length - 1];
  }
  /**
   * 更新表格中已选中的某行数据
   */
  public handleSelectedUpdate() {
    let index = 1; // 由于index会减1， 所以现在1代表列表中的0位置
    if (this.fileNameMap[this.currentEchartsFileName]) {
      index = this.fileNameMap[this.currentEchartsFileName];
    } else {
      this.currentEchartsFileName = this.srcDataTable.data[0].fileName;
    }
    this.handleUpdateThreads(this.srcDataTable.data[index - 1]);
    if (!this.stackTranceData.length) {
      this.onClickRightTable(this.srcDataTableTime.data[0], 0);
    }
    return;
  }
  /**
   * 更新当前行数据的线程列表信息
   * @param fileName 当前行数据
   */
  public handleUpdateThreads(fileName: any) {
    let threadsList: any = [];
    if (this.snapshotType === 'pFileIO') {
      fileName.children.forEach((item: any) => {
        if (!this.currentEchartsIsFile && item.fileDes !== this.currentEchartsFdName) { return; }
        threadsList = threadsList.concat(item.options);
      });
    } else if (this.snapshotType === 'pSocketIO') {
      fileName.children.forEach((host: any) => {
        host.children.forEach((fd: any) => {
          threadsList = threadsList.concat(fd.options);
        });
      });
    }
    this.srcDataTableTime.data = threadsList;
    this.dataTableTime = threadsList;
    this.onTypeSelect();
  }
  /**
   * 处理线程数据，生成echarts数据
   */
  private handleThrToEch() {
    const len = this.threadListData.length;
    const starTime = this.threadListData[0].startTime;
    const endTime = this.threadListData[len - 1].startTime;
    const timeList = this.handleEchTimeList(starTime, endTime);
    const Aecharts: any = {
      readSpeed: [],
      writeSpeed: [],
      timeList
    };
    const Becharts: any = {
      readSpeed: [],
      writeSpeed: [],
      timeList
    };
    timeList.forEach(item => {
      const threads = this.threadListData.some(thread => {
        return thread.startTime === item;
      });
      if (!threads) { }
    });
  }
  /**
   * 时序图时间轴
   */
  private handleEchTimeList(starTime: string, endTime: string) {
    const timeList = [];
    const year = new Date().getFullYear();
    const date = new Date().getMonth() + 1;
    const day = new Date().getDate();
    const newDate = `${year}/${date}/${day} `;
    const start = (new Date(newDate + starTime)).getTime();
    const end = (new Date(newDate + endTime)).getTime();
    const diff = Math.floor((start - end) / 1000);
    let count = 1;
    timeList.push(starTime);
    while (count <= diff - 1) {
      const time = this.libService.dateFormat(start + (count * 1000), 'hh:mm:ss');
      timeList.push(time);
      count++;
    }
    timeList.push(endTime);
    return timeList;
  }
  public onContrastHoverList(label?: any) {
    this.ContrastHover = label;
  }
  public goBack() {
    this.childOuter.emit(false);
  }
  public toggleSnapshot() {
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
    this.handleUpdateThreads(this.srcDataTable.data[0]);
    this.onClickRightTable(this.srcDataTableTime.data[0], 0);
    this.handleEchartsCompare();
  }
  public handleFileClicked(file: any, i: any) {
    this.handleIsNowEcharts(true, file.fileName);
    this.handleUpdateThreads(file);
    this.handleFdSelected(i, -1);
    this.handleFileSelected(i);
    this.onClickRightTable(this.srcDataTableTime.data[0], 0);
    this.handleEchartsCompare();
  }
  /**
   * 第一层的行的折叠情况
   * @param i 数据位置
   */
  public handleFileSelected(i: any) {
    this.srcDataTable.data.forEach((item, index) => {
      item.isSelect = index === i;
    });
  }
  /**
   * 第一层某行展开之前
   * @param row 某第一层行
   */
  public beforeToggle(row: TiTableRowData): void {
    this.currentFdTableList = [];
    this.currentFdTableListTop = [];
    this.currentFdTableList = row.children.sort((a: any, b: any) => {
      return b.count - a.count;
    });
    this.currentFdTableListTop = this.currentFdTableList.slice(0, this.spinnerValue);
    row.showDetails = !row.showDetails;
  }
  /**
   * 点击第一层中某线程
   * @param fd 某线程行数据
   * @param i 所在第一层行位置
   * @param idx 本条数据所在位置
   */
  public handleFdClicked(fd: any, i: any, idx: any) {
    this.handleIsNowEcharts(false, fd.fileDes);
    this.srcDataTableTime.data = fd.options;
    this.dataTableTime = fd.options;
    this.onTypeSelect();
    this.onClickRightTable(this.srcDataTableTime.data[0], 0);
    this.handleFdSelected(i, idx);
    this.handleEchartsCompare();
  }
  /**
   * 本条数据选中情况
   * @param i 所在第一层行位置
   * @param idx 本条数据所在位置
   */
  public handleFdSelected(i: any, idx: any) {
    this.srcDataTable.data[i].children.forEach((item: any, index: any) => {
      item.isSelect = index === idx;
    });
  }
  /**
   * 判断当前选中行是否已被选中
   * @param type 判断是当前选中是路径还是线程
   * @param name 当前选中行的name值
   */
  public handleIsNowEcharts(type: any, name: any) {
    if (type && type === this.currentEchartsIsFile && name === this.currentEchartsFileName) { return; }
    if (!type && type === this.currentEchartsIsFile && name === this.currentEchartsFdName) { return; }
    this.currentEchartsFileName = type ? name : this.currentEchartsFileName;
    this.currentEchartsFdName = type ? '' : name;
    this.currentEchartsIsFile = type;
    this.echartsLabelTop = 0;
    this.echartsData.readSpeed = [];
    this.echartsData.writeSpeed = [];
    this.echartsData.timeList = new Array(Number(this.dataLimit.limitTime) * 60).fill('');
    this.currnetEchartsData.startTime = '';
    this.currnetEchartsData.readSpeed = 0;
    this.currnetEchartsData.writeSpeed = 0;
    this.currnetEchartsData.readCount = 0;
    this.currnetEchartsData.writeCount = 0;
    this.updateEchartsData();
    this.handleReclickedFile(name);
  }
  /**
   * 点击右侧小表格
   * @param row 右侧某行数据
   * @param index 所在位置
   */
  public onClickRightTable(row: any, index: any) {
    if (!row) {
      return;
    }
    if (!row.stackTrace) {
      return;
    }
    this.srcDataTableTime.data.forEach((item, i) => {
      item.isSelect = index === i;
    });
    for (const item of row.stackTrace.children) {
      item.expanded = false;
    }
    this.handleStacktrace(row);
  }
  // io时间单位
  public onChangeTime(time: any): any {
    if (time < this.μs) {
      return time.toFixed(2) + 'μs';
    } else if (this.μs < time && time < this.ms) {
      return (time / this.μs).toFixed(2) + 'ms';
    } else if (this.ms < time) {
      return (time / this.ms).toFixed(2) + 's';
    }
  }
  public onTypeSelect(): void {
    if (this.columnsTableTime[1].selected.length && this.columnsTableTime[2].selected.length) {
      this.srcDataTableTime.data = this.srcDataTableTime.data.filter((rowData: TiTableRowData): any => {
        const index: number = this.columnsTableTime[1].selected.findIndex((item: any) => {
          return item.label === rowData.own;
        });
        if (!(index < 0)) {
          return rowData;
        }
      });
      this.srcDataTableTime.data = this.dataTableTime.filter((rowData: TiTableRowData): any => {
        const index: number = this.columnsTableTime[2].selected.findIndex((item: any) => {
          return item.label === rowData.type;
        });
        if (!(index < 0)) {
          return rowData;
        }
      });
    } else if (this.columnsTableTime[1].selected.length) {
      this.srcDataTableTime.data = this.dataTableTime.filter((rowData: TiTableRowData): any => {
        const index: number = this.columnsTableTime[1].selected.findIndex((item: any) => {
          return item.label === rowData.own;
        });
        if (!(index < 0)) {
          return rowData;
        }
      });
    } else if (this.columnsTableTime[2].selected.length) {
      this.srcDataTableTime.data = this.dataTableTime.filter((rowData: TiTableRowData): any => {
        const index: number = this.columnsTableTime[2].selected.findIndex((item: any) => {
          return item.label === rowData.type;
        });
        if (!(index < 0)) {
          return rowData;
        }
      });
    } else {
      this.srcDataTableTime.data = [];
      return;
    }
  }
  /**
   * 二级数据限定
   * @param value value
   */
  public onModelChange(value: any): void {
    if (!value) {
      this.spinnerValue = 0;
    }
  }

  /**
   * 更新echarts数据
   */
  public updateEchartsData() {
  }
  /**
   * 判断是否点击了cache了echarts数据的行
   * @param name 点击的某行name值是否是cache下的name
   */
  public handleReclickedFile(name: any) { // 当状态为下载，快照，停止分析时，重新点击有echarts数据的file时调用
  }

  /**
   * 讲某行数据的第一条线程信息的栈数据展示
   * @param row 某行数据
   */
  public handleStacktrace(row: any) {
    this.currentStacktrace = [];
    this.stackTranceData = [];
    this.currentStacktrace = row.stackTrace.children;
    this.currentStacktrace.forEach(item => {
      this.stackTranceData.push({
        label: item.label,
        expanded: false,
        children: item.children
      });
    });
  }
  public onSelect(event: TiTreeNode): void {
    this.selectedData = TiTreeUtil.getSelectedData(
      this.stackTranceData,
      false,
      false
    );
  }
  /**
   * 在tree组件某节点展开之前
   * @param TreeCom 栈数据的某个节点
   */
  public beforeExpand(TreeCom: TiTreeComponent): void {
    const currentTree: TiTreeNode = TreeCom.getBeforeExpandNode();
    this.getChildNodes(currentTree);
  }
  /**
   * 获取当前节点下的所有子节点
   * @param currentTree 当前节点信息
   */
  public getChildNodes(currentTree: any) {
    if (!currentTree.children.length) {
      const findChild = this.currentStacktrace.find(item => {
        return item.label === currentTree.label;
      });
      currentTree.children = findChild ? findChild.children : [];
    }
    currentTree.expanded = true;
  }
  // 展开整个树
  public expandNode(): void {
    this.currentStacktrace.forEach(item => {
      this.getChildNodes(item);
    });
    const data: Array<TiTreeNode> = this.stackTranceData.concat();
    TiTreeUtil.traverse(data, traverseFn);
    function traverseFn(node: TiTreeNode): void {
      node.expanded = true;
    }
    this.stackTranceData = data;
  }
  // 处理IO echarts数据

  public handleEchartsCompare() {
    this.isLoading = false;
    this.compareEchartsData.timeAList = [];
    this.compareEchartsData.timeBList = [];
    this.compareEchartsData.timeList = [];
    this.compareEchartsData.ReadSpeedA = [];
    this.compareEchartsData.WeadSpeedA = [];
    this.compareEchartsData.ReadSpeedB = [];
    this.compareEchartsData.WeadSpeedB = [];
    let threadA: any = [];
    let threadB: any = [];
    this.srcDataTableTime.data.forEach(item => {
      switch (item.own) {
        case 'A':
          threadA.push(item);
          break;
        case 'B':
          threadB.push(item);
          break;
        default:
          threadA.push(item);
          threadB.push(item);
          break;
      }
    });
    threadA = this.sortThread(threadA);
    threadB = this.sortThread(threadB);
    const threadAFirstTime = threadA.length && threadA[0].start;
    const threadBFirstTime = threadB.length && threadB[0].start;
    this.createEchartsData(threadA, 'A');
    this.handleLastCacheEchartsData('A');
    this.createEchartsData(threadB, 'B');
    this.handleLastCacheEchartsData('B');
    this.compareEchartsData.timeList = [...new Set(this.compareEchartsData.
      timeAList.concat(this.compareEchartsData.timeBList))];
    this.timeData = this.compareEchartsData.timeList;
    this.fullEchartsData('A', threadAFirstTime);
    this.fullEchartsData('B', threadBFirstTime);
    this.initEchart();
  }
  private fullEchartsData(own: any, firstTime: any) {
    const index = this.compareEchartsData.timeList.findIndex((item: any) => {
      return item === firstTime;
    });
    if (index < 0) { return; }
    const nullArr = new Array(index).fill(null);
    if (own === 'A') {
      if (index > 0) {
        this.compareEchartsData.ReadSpeedA = nullArr.concat(this.compareEchartsData.ReadSpeedA);
        this.compareEchartsData.WeadSpeedA = nullArr.concat(this.compareEchartsData.WeadSpeedA);
      }
    } else {
      if (index > 0) {
        this.compareEchartsData.ReadSpeedB = nullArr.concat(this.compareEchartsData.ReadSpeedB);
        this.compareEchartsData.WeadSpeedB = nullArr.concat(this.compareEchartsData.WeadSpeedB);
      }
    }
  }
  private createEchartsData(threads: any, own: any) {
    threads.forEach((thread: any) => {
      this.handleCacheEchartsData(thread, own);
    });
  }
  private sortThread(thread: any) {
    if (!thread.length) { return []; }
    thread = thread.sort((a: any, b: any) => {
      return a.originTime - b.originTime;
    });
    return thread;
  }
  /**
   * 初始化echarts
   */
  public initEchart() {
    this.echartsOption = {
      backgroundColor: '#fff',
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#ffffff',
        borderRadius: 5, // 边框圆角
        boxShadow: 'rgba(0, 0, 0, 0.5)',
        textStyle: {
          color: '#000000',
        },
        extraCssText: 'box-shadow: 0px 4px 8px 0px rgba(0, 0, 0, .2);',
        formatter: (params: any) => {
          if (params.length > 0) {
            let html = ``;
            html += `<div><div style="color:#616161">${params[0].axisValueLabel}</div>`;
            params.forEach((param: any, index: number) => {
              html += `
                          <div style='margin-top:10px'>
                              <span style="display: inline-block;width: 8px;height: 8px;
                              background-color: ${param.color};
                              margin-right: 3px;"></span>
                              <span style='width:150px;display:inline-block;
                              color:#222222'>${param.seriesName}</span>
                              <span style="color:#222222">
                              ${this.libService.onChangeUnit(param.data * 1024)}/s</span>
                          </div>`;
            });
            html += `</div>`;
            return html;
          } else {
            return '';
          }
        }
      },
      legend: {
        itemHeight: 10,
        itemWidth: 10,
        icon: 'rect',
        data: [
          this.i18n.io.fileIo.readRate + 'A', this.i18n.io.fileIo.writeRate + 'A', this.i18n.io.fileIo.readRate + 'B',
          this.i18n.io.fileIo.writeRate + 'B'
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
        left: '2%',
        right: '40',
        bottom: '0',
        top: '90',
        containLabel: true
      },
      dataZoom: [
        {
          show: false,
          type: 'slider',
          realtime: true,
          top: 30,
          start: 0,
          end: 100,
          height: 32,
          showDataShadow: true,
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
            color: 'rgba(40, 43, 51, 0)'  // 选中区域两边的边界值样式  不显示
          },
          handleStyle: {   // 边界图标样式设置
            color: 'rgba(108, 146, 250, 1)',
            borderType: 'solid',
            borderWidth: '10',
          },
        },
        {
          type: 'inside',
          realtime: true,
          showDataShadow: false   // 是否显示数据阴影
        }
      ],
      xAxis: [
        {
          type: 'category',
          boundaryGap: false,
          position: 'bottom',
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
          splitLine: {
            interval: 0,
            lineStyle: {
              type: 'dashed',
              opacity: 0.3
            },
            show: true
          },
          data: this.compareEchartsData.timeList
        },
        {
          type: 'category',
          boundaryGap: false,
          axisLine: {
            onZero: false,
            lineStyle: {
              color: '#E1E6EE',
              width: 2,
            }
          }
        }
      ],
      yAxis: [
        {
          type: 'value',
          show: false,
          splitNumber: 1,
          splitLine: {
            show: false,
            lineStyle: {
              type: 'solid'
            }
          },
          max: this.echartsLabelTop
        }
      ],
      series: [
        {
          id: 'series1',
          name: this.i18n.io.fileIo.readRate + 'A',
          type: 'line',
          itemStyle: {
            normal: {
              color: '#037DFF'
            }
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
              offset: 0,
              color: 'rgba(38,125,255,0.3)',
            }, {
              offset: 1,
              color: 'rgba(38,125,255,0.04)'
            }])
          },
          lineStyle: {
            color: '#037DFF',
          },
          data: this.compareEchartsData.ReadSpeedA
        },
        {
          id: 'series2',
          name: this.i18n.io.fileIo.writeRate + 'A',
          type: 'line',
          itemStyle: {
            normal: {
              color: '#00BFC9'
            }
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
              offset: 0,
              color: 'rgba(0,191,201,0.3)',
            }, {
              offset: 1,
              color: 'rgba(0,191,201,0.04)'
            }])
          },
          lineStyle: {
            color: '#00BFC9',
          },
          data: this.compareEchartsData.WeadSpeedA
        },
        {
          id: 'series3',
          name: this.i18n.io.fileIo.readRate + 'B',
          type: 'line',
          itemStyle: {
            normal: {
              color: '#41BA41'
            }
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
              offset: 0,
              color: 'rgba(38,125,255,0.3)',
            }, {
              offset: 1,
              color: 'rgba(38,125,255,0.04)'
            }])
          },
          lineStyle: {
            color: '#41BA41',
          },
          data: this.compareEchartsData.ReadSpeedB
        },
        {
          id: 'series4',
          name: this.i18n.io.fileIo.writeRate + 'B',
          type: 'line',
          itemStyle: {
            normal: {
              color: '#E88B00 '
            }
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
              offset: 0,
              color: 'rgba(0,191,201,0.3)',
            }, {
              offset: 1,
              color: 'rgba(0,191,201,0.04)'
            }])
          },
          lineStyle: {
            color: '#E88B00 ',
          },
          data: this.compareEchartsData.WeadSpeedB
        }
      ]
    };
    let tempTimer = setTimeout(() => {
      this.fileIOEcharts = echarts.init(this.elementRef.nativeElement.querySelector('#fileIOEcharts'));
      this.fileIOEcharts.setOption(this.echartsOption);
      window.onresize = this.fileIOEcharts.resize;
      this.fileIOEcharts.on('datazoom', (params: any) => {  // 放大缩小时调用接口
        this.TimeLine.dataConfig({ start: params.batch[0].start, end: params.batch[0].end });
      });
      clearTimeout(tempTimer);
      tempTimer = null;
    }, 0);
  }
  public toggleLeftResize() {
    let tempTimer = setTimeout(() => {
      this.fileIOEcharts.resize();
      clearTimeout(tempTimer);
      tempTimer = null;
    }, 100);
  }
  public timeLineData(data: any) {
    this.echartsOption.dataZoom[0].start = data.start;
    this.echartsOption.dataZoom[0].end = data.end;
    this.fileIOEcharts.setOption({
      dataZoom: this.echartsOption.dataZoom
    });
  }
  /**
   * 展开整个树
   */
  public expandAllNode(row: TiTableRowData) {
    if (row.expanded) {
      return;
    }
    const data: Array<TiTreeNode> = this.stackTranceData.concat();
    TiTreeUtil.traverse(data, traverseFn);
    function traverseFn(node: TiTreeNode): void {
      node.expanded = true;
    }
    this.stackTranceData = data;
  }
}
