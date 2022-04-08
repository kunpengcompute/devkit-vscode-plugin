import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { MytipService } from '../../../../service/mytip.service';
import { TiTreeNode } from '@cloud/tiny3';
import { I18nService } from '../../../../service/i18n.service';
import { ProfileDownloadService } from '../../../../service/profile-download.service';
import { LibService } from '../../../../service/lib.service';

@Component({
  selector: 'app-http-compare',
  templateUrl: './http-compare.component.html',
  styleUrls: ['./http-compare.component.scss']
})
export class HttpCompareComponent implements OnInit {
  @Input() currentHeapLabel: any;
  @Input() prevHeapLabel: any;
  @Input() snapshotType: any;
  @Output() private childOuter = new EventEmitter();
  @Output() private childTGSnapshotIN = new EventEmitter();
  @ViewChild('echartsModel') echartsModel: any;
  constructor(
    public i18nService: I18nService,
    private downloadService: ProfileDownloadService,
    public mytip: MytipService,
    public libService: LibService
  ) {
    this.i18n = this.i18nService.I18n();
    this.echartDatas.keys = [
      {
        label: this.i18n.protalserver_profiling_http.request,
        unit: this.i18n.common_term_jdbc_times
      },
      {
        label: this.i18n.protalserver_profiling_http.average_exec_time,
        unit: ' ms'
      }
    ];
  }
  i18n: any;
  public stompClient: any;
  public jvmId = '';
  public guardianId = '';
  public startBtnDisabled: boolean;

  public tip1Context: any;
  public jdbcThresholdTip = '';
  public isStart = true;
  public currentTabName = '';
  public httpTreeData: Array<TiTreeNode> = [];
  public httpTabs = [
    {
      label: 'hot_spots',
      name: 'hot',
      selected: true
    },
    {
      label: 'real_time',
      name: 'real',
      selected: false
    }
  ];

  public count = 1;
  public step = 3000;
  public updateOptions: any;
  public startDate = '';
  public echartItems = ['request', 'aveTime'];
  public echartDatas: any = {
    request: [],
    aveTime: [],
    keys: [],
    label: ['request', 'aveTime'],
    time1: [],
    gridHeight: 100
  };
  public threshold = {
    label: '',
    max: 10000,
    min: 10,
    value: 50,
    rangeValue: [10, 10000],
    format: 'N0',
  };
  public treeDataCached: Array<any> = [];
  public cachedTimer: any = null;
  public snapCount: number;
  public httpBtnTip: any;
  public limitTime: any;

  public ContrastHover: string;
  public snapshotA: string;
  public snapshotB: string;
  public snapShot: any;
  public snapShotADataFile: Array<any> = [];
  public snapShotBDataFile: Array<any> = [];
  public snapShotAthreshold: string;
  public snapShotBthreshold: string;
  public snapShotADataEcharts: Array<any> = [];
  public snapShotBDataEcharts: Array<any> = [];
  public baseData: Array<any> = [];
  public compareData: Array<any> = [];
  public comparedDatas: Array<any> = [];
  public compareEchartData: any = {
    startDate: '',
    snapshotA: {},
    snapshotB: {}
  };
  public AorBBig = false;
  public alen: number;
  public blen: number;
  public tipStr: string;
  public res: any;
  public isLoading: any = false;
  ngOnInit(): void {
    this.tipStr = this.i18n.profileMemorydump.snapShot.http.BSnapshot;
    this.httpTreeData.push({
      label: 'Hot URL',
      tree_label: 'Hot URL',
      children: [],
      expanded: false
    });
    this.snapshotA = this.prevHeapLabel;
    this.snapshotB = this.currentHeapLabel;
    if (this.downloadService.downloadItems.snapShot.snapShotData) {
      this.snapShotFileData();
    }
  }
  public toggleLeft() {
    this.echartsModel.toggleLeftResize();
  }
  public snapShotFileData() {
    this.snapShot = JSON.parse(this.downloadService.downloadItems.snapShot.snapShotData);
    this.snapShotData(this.snapShot);
    this.handleSortCompare(this.snapShotADataFile, this.snapShotBDataFile);
    this.patch(this.snapShotADataFile, this.snapShotBDataFile);

    if (this.alen > this.blen) {
      // 说明a在b里面，b深度更深
      const compareB = this.getObjById(this.snapShotADataFile[0].tree_label, this.snapShotBDataFile);
      const compareBArr = [];
      compareBArr.push(compareB);
      this.comparedDatas = this.handleFileOriData(this.snapShotADataFile, compareBArr);
      this.replaceCompared(this.snapShotADataFile[0].tree_label, this.snapShotBDataFile, this.comparedDatas);
      this.httpTreeData[0].children = this.snapShotBDataFile;
      this.isLoading = false;
    } else {
      const compareA = this.getObjById(this.snapShotBDataFile[0].tree_label, this.snapShotADataFile);
      const compareAArr = [];
      compareAArr.push(compareA);
      // 定位的位置卡this.handleFileOriData
      this.comparedDatas = this.handleFileOriData(compareAArr, this.snapShotBDataFile);
      this.replaceCompared(this.snapShotADataFile[0].tree_label, this.snapShotADataFile, this.comparedDatas);
      this.httpTreeData[0].children = this.snapShotADataFile;
      this.isLoading = false;
    }
  }
  public goBack() {
    this.childOuter.emit(false);
  }
  public getData(currentHeapLabel: any, prevHeapLabel: any) {
    this.snapshotA = prevHeapLabel;
    this.snapshotB = currentHeapLabel;
    this.snapShotFileData();
  }
  public handleSortCompare(base: any, compare: any) {
    this.baseData = this.sortAOrB(base, 'A');
    this.compareData = this.sortAOrB(compare, 'B');
  }
  // 比较某个字符串出现的次数

  public patch(a: any, b: any) {
    for (let i = 0; i < a.length; i++) {
      this.alen = a[i].tree_label.split('/').length - 1;
      const btlabel = b[i].tree_label;
      this.blen = btlabel.split('/').length - 1;
      if (this.alen > this.blen) {
        break;
      } else if (this.alen === this.blen) {
        if (a[i].children && Object.prototype.hasOwnProperty.call(a[i], 'children')) {
          this.patch(a[i].children, b[i].children);
        }
      } else {
        break;
      }
    }
  }

  /**
   * @param将数组插入指定位置
   */
  public replaceCompared(level: any, list: any, compared: any) {
    for (let i = 0; i < list.length; i++) {
      if (list[i].tree_label === level) {
        list[i] = compared[0];
        return;
      }
      if (list[i].children) {
        this.replaceCompared(level, list[i].children, compared);
      }
    }
  }
  /*
  *@param  需要遍历的数组
  *@param  查询所需要的level
  */
  public getObjById(level: any, list: any): any {
    // 判断list是否是数组
    // 遍历数组
    if (list != null) {
      for (const i of Object.keys(list)) {
        const item = list[i];
        if (item.tree_label === level) {
          return item;
        } else {
          // 查不到继续遍历
          if (item.children) {
            const value = this.getObjById(level, item.children);
            // 查询到直接返回
            if (value) {
              return value;
            }
          }
        }
      }
    }
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
        if (Object.prototype.hasOwnProperty.call(compareData, 'tree_label')) {
          return compareData.tree_label === item.tree_label;
        }
      });
      if (!compareFile) {
        compare.push(item);
      } else {
        compareFile.own = 'A&B';
        if (compareFile != null) {
          for (const key of Object.keys(compareFile)) {
            if (Object.prototype.hasOwnProperty.call(compareFile, key) && typeof compareFile[key] === 'number') {
              compareFile.compare[key] = compareFile[key] - item[key];
            }
          }
        }
        if (item.children) {
          this.handleFileOriData(item.children, compareFile.children);
        }
        if (compareFile && compareFile.own === 'A&B') {
          if (compareFile.compare.count !== 0) {
            compareFile.compare.Average = `${(compareFile.Average - item.Average).toFixed(2)}`;
          } else {
            compareFile.Average = `${(compareFile.totalDuration / compareFile.count).toFixed(2)}`;
            compareFile.compare.Average = '0';
          }
          if (compareFile.count !== 0) {
            compareFile.Average = `${(compareFile.totalDuration / compareFile.count).toFixed(2)}`;
          } else {
            compareFile.Average = '0';
          }
        }
      }
    });
    return compare;
  }
  private sortAOrB(data: any, AOrB: any) {
    if (!data) { return; }
    data.forEach((item: any) => {
      item.own = AOrB;
      const compData = {
        count: 0,
        totalDuration: 0,
        Average: 0
      };
      item.compare = compData;
      if (item.compare.count !== 0) {
        item.compare.Average = `${(item.compare.totalDuration / item.compare.count).toFixed(2)}`;
      } else {
        item.compare.Average = '0';
      }
      if (item.count !== 0) {
        item.Average = `${(item.totalDuration / item.count).toFixed(2)}`;
      } else {
        item.Average = '0';
      }
      if (Object.prototype.hasOwnProperty.call(item, 'children')) {
        this.sortAOrB(item.children, AOrB);
      }
    });
    return data;
  }
  public snapShotData(snapShot: any) {
    this.toggleSnapshotIN();
    const dataArr = snapShot[this.snapshotType].children;
    dataArr.forEach((item: any) => {
      if (item.label === this.snapshotA) {
        this.snapShotAthreshold = item.value.threshold;
        this.snapShotADataFile = item.value.file;
        this.snapShotADataEcharts = item.value.echarts.data;
        this.compareEchartData.snapshotA = item.value.echarts.data; // 快照A echart数据
        this.compareEchartData.startDate = item.value.echarts.startDate; // 当前日期
      } else if (item.label === this.snapshotB) {
        this.snapShotBthreshold = item.value.threshold;
        this.snapShotBDataFile = item.value.file;
        this.snapShotBDataEcharts = item.value.echarts.data;
        this.compareEchartData.snapshotB = item.value.echarts.data; // 快照B echart数据
      }
    });
  }
  public onContrastHoverList(label?: any) {
    this.ContrastHover = label;
  }
  public toggleSnapshotIN() {
    const obj = {
      A: this.snapshotA,
      B: this.snapshotB
    };
    this.childTGSnapshotIN.emit(obj);
  }
  public toggleSnapshot() {
    this.isLoading = true;
    if (this.snapshotA === this.prevHeapLabel) {
      this.snapshotA = this.currentHeapLabel;
      this.snapshotB = this.prevHeapLabel;
    } else if (this.snapshotA === this.currentHeapLabel) {
      this.snapshotA = this.prevHeapLabel;
      this.snapshotB = this.currentHeapLabel;
    }
    this.snapShotFileData();
    this.echartsModel.showEcharts();
  }
}
