import { Component, OnInit, ElementRef, Input, EventEmitter, Output, ViewChild } from '@angular/core';
import { MytipService } from '../../../../../service/mytip.service';
import { TiTableColumns, TiTableRowData, TiTableSrcData, TiTreeNode } from '@cloud/tiny3';
import { I18nService } from '../../../../../service/i18n.service';
import { ProfileDownloadService } from '../../../../../service/profile-download.service';
import { LibService } from '../../../../../service/lib.service';
@Component({
  selector: 'app-cassandra-compare',
  templateUrl: './cassandra-compare.component.html',
  styleUrls: ['./cassandra-compare.component.scss']
})
export class CassandraCompareComponent implements OnInit {

  @Input() currentHeapLabel: any;
  @Input() prevHeapLabel: any;
  @Input() snapshotType: any;
  @Output() private childOuter = new EventEmitter();
  @Output() private childTGSnapshotIN = new EventEmitter();
  @Output() private isExpand = new EventEmitter();
  @ViewChild('echartsModel') echartsModel: any;
  constructor(
    private el: ElementRef,
    public i18nService: I18nService,
    private downloadService: ProfileDownloadService,
    public mytip: MytipService,
    public libService: LibService
  ) {
    this.i18n = this.i18nService.I18n();
  }

  i18n: any;
  public durationTotal = 0;
  public insCountWidth = 0;
  public insCountTotal = 0;
  private columnsWidth2 = 0;

  public count = 20;
  public displayed: Array<TiTableRowData> = [];
  public srcData: TiTableSrcData;
  private data: any = [];
  public columns: Array<TiTableColumns> = [
    {
      title: 'hot_statement',
      width: '30%',
      sortKey: 'label'
    },
    {
      title: 'Btotal_time',
      width: '15%',
      sortKey: 'duration',
      isSort: true,
      sortStatus: 'sort'
    },
    {
      title: 'total_time',
      width: '15%',
      sortKey: 'totalDur',
      isSort: true,
      sortStatus: 'sort',
      compare: true
    },
    {
      title: 'Baver_time',
      width: '10%',
      sortKey: 'aver',
      isSort: true,
      sortStatus: 'sort'
    },
    {
      title: 'aver_time',
      width: '10%',
      sortKey: 'aver',
      isSort: true,
      sortStatus: 'sort',
      compare: true
    },
    {
      title: 'Bexec_time',
      width: '10%',
      sortKey: 'Bcount'
    },
    {
      title: 'exec_time',
      width: '10%',
      sortKey: 'count'
    }
  ];

  public echartItems = ['executed', 'aveTime'];
  public echartDatas: any = {
    executed: [],
    aveTime: [],
    keys: [],
    label: ['executed', 'aveTime'],
    time1: [],
    gridHeight: 100
  };

  // stack trace部分
  public stackTranceData: Array<TiTreeNode> = [];
  public startDate = '';
  public isStart = true;

  private expandNodes: any = {};
  public snapCount = 0;
  public ContrastHover: string;
  public snapshotA: string;
  public snapshotB: string;
  public snapShot: any;
  public snapShotADataFile: Array<any> = [];
  public snapShotBDataFile: Array<any> = [];
  public snapShotADataEcharts: Array<any> = [];
  public snapShotBDataEcharts: Array<any> = [];
  public snapShotAthreshold: string;
  public snapShotBthreshold: string;
  public baseData: Array<any> = [];
  public compareData: Array<any> = [];
  public comparedDatas: Array<any> = [];
  public tableData: any;
  public compareFile: Array<any> = [];
  public baseFile: Array<any> = [];
  public comparedData: Array<any> = [];
  public compareEchartData: any = {};
  public maxNumTotal: number;
  public echartsOption: any = {
    startDate: '',
    snapshotA: {},
    snapshotB: {}
  };
  public AdurationTotal: any;
  public BdurationTotal: any;
  public initialsGet = false;
  public isLoading: any = false;
  private originData: any;  // 保存未排序的表格数据
  private onlyASnapshot: any; // 仅A快照内容
  private onlyBSnapshot: any; // 仅B快照内容
  private conSnapshot: any; // A&B
  ngOnInit(): void {
    this.initialsGet = true;
    this.srcData = {
      data: [], // 源数据
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
      this.snapDataFile(this.comparedDatas);
    }
    this.isStart = this.downloadService.dataSave.isCassStart;
    for (const item of this.data) {
      item.isShow = true;
      item.expend = false;
    }
  }
  public toggleLeft() {
    this.echartsModel.toggleLeftResize();
  }
  public getData(currentHeapLabel: any, prevHeapLabel: any) {
    this.snapshotA = prevHeapLabel;
    this.snapshotB = currentHeapLabel;
    this.snapShot = JSON.parse(this.downloadService.downloadItems.snapShot.snapShotData);
    this.snapShotData(this.snapShot);
    this.handleSortCompare(this.snapShotADataFile, this.snapShotBDataFile);
    this.comparedDatas = this.handleFileOriData(this.snapShotADataFile, this.snapShotBDataFile);
    this.snapDataFile(this.comparedDatas);
  }
  public toggleSnapshotIN() {
    const obj = {
      A: this.snapshotA,
      B: this.snapshotB
    };
    this.childTGSnapshotIN.emit(obj);
  }
  /**
   * 遍历查找两个日期快照的数据
   * @param snapShot 所有快照数据
   */
  public snapShotData(snapShot: any) {
    this.isLoading = true;
    this.toggleSnapshotIN();
    const dataArr = snapShot[this.snapshotType].children;
    dataArr.forEach((item: any) => {
      if (item.label === this.snapshotA) {
        this.snapShotAthreshold = item.value.threshold;
        this.AdurationTotal = item.value.durationTotal;
        this.snapShotADataFile = item.value.file;
        this.snapShotADataEcharts = item.value.echarts.data;
        this.compareEchartData.snapshotA = item.value.echarts.data; // 快照A echart数据
        this.compareEchartData.startDate = item.value.echarts.startDate; // 当前日期
      } else if (item.label === this.snapshotB) {
        this.snapShotBthreshold = item.value.threshold;
        this.BdurationTotal = item.value.durationTotal;
        this.snapShotBDataFile = item.value.file;
        this.snapShotBDataEcharts = item.value.echarts.data;
        this.compareEchartData.snapshotB = item.value.echarts.data; // 快照B echart数据
      }
    });
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
        aver: 0,
        duration: 0,
        percentage: 0,
      };
      item.compare = compData;
      if (Object.prototype.hasOwnProperty.call(item, 'children')) {
        this.sortAOrB(item.children, AOrB);
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
        if (Object.prototype.hasOwnProperty.call(compareData, 'name')) {
          return compareData.name === item.name;
        }
      });
      if (!compareFile) {
        compare.push(item);
      } else {
        compareFile.own = 'A&B';
        compareFile.Alabel = item.label;
        compareFile.compare.percentage = item.duration / this.AdurationTotal;
      }
      if (compareFile != null) {
        for (const key of Object.keys(compareFile)) {
          if (Object.prototype.hasOwnProperty.call(compareFile, key) && typeof compareFile[key] === 'number') {
            compareFile.compare[key] = compareFile[key] - item[key];
          }
          if (Object.prototype.hasOwnProperty.call(compareFile, key) && typeof compareFile[key] === 'string') {
            if (key === 'aver') {
              compareFile.compare[key] = (Number(compareFile[key]) - Number(item[key])).toFixed(2).toString();
            }
          }
        }
      }
    });
    return compare;
  }
  public onContrastHoverList(label?: any) {
    this.ContrastHover = label;
  }

  private mapDownloadTree(data: any, pId?: any) {
    data.map((item: any) => {
      pId = pId || '';
      item.id = pId + item.label;
      item.isShow = false;
      if (item.children && item.children.length) {
        this.mapDownloadTree(item.children, item.id);
      }
    });
    return data;
  }
  public toggleSnapshot() {
    this.initialsGet = true;
    this.srcData.data = [];
    this.data = [];
    this.snapShotADataFile = [];
    this.snapShotBDataFile = [];
    if (this.snapshotA === this.prevHeapLabel) {
      this.snapshotA = this.currentHeapLabel;
      this.snapshotB = this.prevHeapLabel;
    } else if (this.snapshotA === this.currentHeapLabel) {
      this.snapshotA = this.prevHeapLabel;
      this.snapshotB = this.currentHeapLabel;
    }
    // 清除排序
    this.columns.forEach(item => {
      item.sortStatus = 'sort';
    });
    this.snapShot = JSON.parse(this.downloadService.downloadItems.snapShot.snapShotData);
    this.snapShotData(this.snapShot);
    this.handleSortCompare(this.snapShotADataFile, this.snapShotBDataFile);
    this.comparedDatas = this.handleFileOriData(this.snapShotADataFile, this.snapShotBDataFile);
    this.snapDataFile(this.comparedDatas);
    this.echartsModel.showEcharts();
  }

  private getCountProportion() {
    if (this.data.length === 0) { return; }
    this.onlyASnapshot = [];
    this.onlyBSnapshot = [];
    this.conSnapshot = [];
    this.data.forEach((item: any) => {
      item.insCountWidth = (item.duration / this.BdurationTotal) * this.insCountTotal;
      item.totalDurPer = item.duration / 1000 + '(' + ((item.duration / this.BdurationTotal) * 100).toFixed(2) + '%)';
      item.compare.totalDur = item.compare.duration / 1000;
      item.compare.totalPer = (
        ((item.duration / this.BdurationTotal) - item.compare.percentage) / item.compare.percentage * 100
      ).toFixed(2);
      this.srcData.data.push(JSON.parse(JSON.stringify(item)));
      item.children = item.stackTraces ? item.stackTraces.children : item.children;
      if (item.own === 'A') {
        this.onlyASnapshot.push(JSON.parse(JSON.stringify(item)));
      } else if (item.own === 'B') {
          this.onlyBSnapshot.push(JSON.parse(JSON.stringify(item)));
      } else {
          this.conSnapshot.push(JSON.parse(JSON.stringify(item)));
      }
    });
    this.originData = this.deepClone(this.data);
    const srcData = [...this.data];
    this.srcData.data = this.getTreeTableArr(srcData);
    let arr: any = [];
    this.srcData.data.map(el => {
      el.compare.duration > 0 ? arr.push(el.compare.duration) : arr.push(- el.compare.duration);
    });
    this.maxNumTotal = Math.max(...arr);
    arr = [];
    this.isLoading = false;
  }
  public goBack() {
    this.childOuter.emit(false);
  }
  public downloadData() {
    this.downloadService.dataSave.isCassStart = this.isStart;
    this.downloadService.downloadItems.cassandra.hotspot = this.downloadClone(this.data);
    this.downloadService.downloadItems.cassandra.monitor.data = this.handleDownloadData();
    this.downloadService.downloadItems.cassandra.monitor.startDate = this.startDate;
  }
  // pArray: 父级数据， pLevel: 父级层数
  // 将有层级结构的数据扁平化
  private getTreeTableArr(pArray: Array<any>, pLevel?: number, pId?: any): Array<any> {
    let tableArr: Array<any> = [];
    if (pArray === undefined) {
      return tableArr;
    }
    pLevel = pLevel === undefined ? 0 : pLevel + 1;
    pId = pId === undefined ? 'tiTableRoot' : pId;

    let temp: any;
    for (const item of pArray) {
      let isShow = item.isShow;
      let expand = false;
      if (!this.initialsGet) {
        if (this.expandNodes[item.id]) {
          isShow = this.expandNodes[item.id].isShow;
          expand = this.expandNodes[item.id].expand;
        }
      }
      temp = this.deepClone(item);
      delete temp.children;
      temp.level = pLevel;
      temp.pId = pId;
      temp.isShow = isShow;
      temp.hasChildren = false;
      temp.insCountWidth = (temp.duration / this.BdurationTotal) * this.insCountTotal;
      temp.totalDurPer = temp.duration / 1000 + '(' + ((temp.duration / this.BdurationTotal) * 100).toFixed(2) + '%)';
      temp.compare.totalDur = temp.compare.duration / 1000;
      if (item.compare.percentage === 0) {
        temp.compare.totalPer = 0;
      } else {
        temp.compare.totalPer = (
          ((item.duration / this.BdurationTotal) - item.compare.percentage) / item.compare.percentage * 100
        ).toFixed(2);
      }
      temp.isShowTip = (temp.insCountWidth + temp.totalDurPer.length * 8) >= this.columnsWidth2;
      tableArr.push(temp); // 也可以在此循环中做其他格式化处理
      if (item.children && item.children.length) {
        temp.hasChildren = true;
        temp.expand = expand;
        tableArr = tableArr.concat(this.getTreeTableArr(item.children, pLevel, temp.id));
      }
    }
    return tableArr;
  }
  public toggle(node: any): void {
    this.initialsGet = false;
    node.expand = !node.expand;
    if (node.expand) {
      if (!this.expandNodes[node.id]) { this.expandNodes[node.id] = {}; }
      if (node.own === 'A&B') {
        const duibiA = this.getObjById(node.Alabel, this.snapShotADataFile);
        const duibiB = this.getObjById(node.label, this.snapShotBDataFile);
        let compared;
        if (Object.prototype.hasOwnProperty.call(duibiA, 'children') &&
         Object.prototype.hasOwnProperty.call(duibiB, 'children')) {
          compared = this.handleFileOriData(duibiA.children, duibiB.children);
        } else if (Object.prototype.hasOwnProperty.call(duibiB, 'children')) {
          compared = duibiB.children;
        } else if (Object.prototype.hasOwnProperty.call(duibiA, 'children')) {
          compared = duibiA.children;
        }
        if (compared) {
          this.replaceCompared(node.id, this.comparedDatas, compared);
        }
        this.snapDataFile(this.comparedDatas);
      }
    }
    this.toggleChildren(this.srcData.data, node.id, node.expand);
    this.expandNodes[node.id].expand = node.expand;
    this.expandNodes[node.id].isShow = node.isShow;
    if (!this.expandNodes[node.id].isShow) { delete this.expandNodes[node.id]; }
  }
  public replaceCompared(level: any, item: any, compared: any) {
    for (const val of item) {
      if (val.label === level) {
        val.children = compared;
        return;
      }
      if (val.children) {
        this.replaceCompared(level, val.children, compared);
      }
    }
  }

  /*
  *@param  需要遍历的数组
  *@param  查询所需要的id
  */
  public getObjById(level: any, list: any): any {
    // 遍历数组
    for (const item of list) {
      if (item.label === level) {
        return item;
      } else {
        // 查不到继续遍历
        if (item.children) {
          this.getObjById(level, item.children);
          const value = this.getObjById(level, item.children);
          // 查询到直接返回
          if (value) {
            return value;
          }
        }
      }
    }
  }

  private toggleChildren(data: Array<any>, pId: any, pExpand: boolean): void {
    for (const node of data) {
      if (node.pId === pId) {
        node.isShow = pExpand; // 处理当前子节点
        if (pExpand === false) {// 折叠时递归处理当前节点的子节点
          delete this.expandNodes[node.id];
          this.toggleChildren(data, node.id, false);
        } else {  // 展开时递归处理当前节点的子节点
          this.expandNodes[node.id] = this.expandNodes[node.id] || {};
          this.expandNodes[node.id].isShow = true;
          this.expandNodes[node.id].expand = false;
          node.expand = false;
          if (node.expand === true) {
            this.toggleChildren(data, node.id, true);
          }
        }
      }
    }
  }

  public getLevelStyle(node: any): { 'padding-left': string } {
    return {
      'padding-left': `${node.level * 18 + 10}px`
    };
  }

  private deepClone(obj: any): any { // 深拷贝，类似于1.x中的angular.copy() TODO: 是否需要将该方法写进组件
    if (typeof (obj) !== 'object' || obj === null) {
      return obj;
    }

    let clone: any;

    clone = Array.isArray(obj) ? obj.slice() : { ...obj };

    const keys: Array<string> = Object.keys(clone);

    for (const key of keys) {
      clone[key] = this.deepClone(clone[key]);
    }

    return clone;
  }

  private downloadClone(obj: any): any {
    if (typeof (obj) !== 'object' || obj === null) {
      return obj;
    }
    let clone: any;
    clone = Array.isArray(obj) ? obj.slice() : { ...obj };
    const keys: Array<string> = Object.keys(clone);
    for (const key of keys) {
      clone[key] = this.downloadClone(clone[key]);
      if (key === 'id' || key === 'isShow' || key === 'insCountWidth' ||
        key === 'totalDurPer' || key === 'isShowTip' || key === 'stackTraces' || key === 'label_name') {
        delete clone[key];
      }
    }

    return clone;
  }

  private handleDownloadData() {
    const downloadData: any = {};
    this.echartDatas.time1.forEach((item: any, idx: any) => {
      downloadData[item] = {
        averTime: this.echartDatas.aveTime[idx],
        averCount: this.echartDatas.executed[idx]
      };
    });
    return downloadData;
  }

  public snapDataFile(snapShotData: any) {
    this.data = this.mapDownloadTree(snapShotData);
    let total = 0;
    for (const item of this.data) {
      item.isShow = true;
      item.expend = false;
      total += item.duration;
    }
    let tempTimer = setTimeout(() => {
      this.getCountProportion();
      clearTimeout(tempTimer);
      tempTimer = null;
    }, 0);
    this.isStart = false;
  }
  /**
   * 表格排序
   */
  public onTableSort(index: number) {
    const column = this.columns[index];
    // 清除其他字段的排序
    this.columns.forEach((item, idx) => {
        if (item.isSort && idx !== index) {
            item.sortStatus = 'sort';
        }
    });
    let srcData: any = [];
    let groupA = this.deepClone(this.onlyASnapshot);
    let groupB = [];
    let sortData = [];
    if ( column.title === 'Btotal_time' || column.title === 'Baver_time') {
        sortData = [...this.deepClone(this.onlyBSnapshot), ...this.deepClone(this.conSnapshot)];
    } else {
        groupB = this.deepClone(this.onlyBSnapshot);
        sortData = this.deepClone(this.conSnapshot);
    }
    switch (column.sortStatus) {
        case 'sort-ascent':
            column.sortStatus = 'sort-descent';
            groupA = this.sortArray(groupA, column);
            groupB = this.sortArray(groupB, column);
            sortData = this.sortArray(sortData, column);
            srcData = [...sortData, ...groupB, ...groupA];
            break;
        case 'sort-descent':
            column.sortStatus = 'sort';
            srcData = this.deepClone(this.originData);
            break;
        default:
            column.sortStatus = 'sort-ascent';
            groupA = this.sortArray(groupA, column);
            groupB = this.sortArray(groupB, column);
            sortData = this.sortArray(sortData, column);
            srcData = [...groupA, ...groupB, ...sortData];
            break;
    }
    this.srcData.data = this.getTreeTableArr(srcData);
  }
  private sortArray(data: Array<any>, column: any) {
    const key = column.sortKey;
    const isCompare = column.compare;
    data.sort((a: any, b: any) => {
        if (column.sortStatus === 'sort-descent') {
            return isCompare ? (b.compare[key] - a.compare[key]) : (b[key] - a[key]);
        } else {
            return isCompare ? (a.compare[key] - b.compare[key]) : (a[key] - b[key]);
        }
    });
    return data;
  }
  /**
   * 传送expandNodes数据
   */
  public send_ExpandData(e: any) {
    this.expandNodes = e;
  }
  /**
   * 传送热点语句height是否展开与收缩
   */
  public sendExpandFlag(event: boolean){
    this.isExpand.emit(event);
  }
}
