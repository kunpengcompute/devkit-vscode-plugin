import { Component, OnInit, OnDestroy, ViewEncapsulation, ElementRef, AfterViewInit } from '@angular/core';
import { StompService } from '../../service/stomp.service';
import { ExplorerType } from 'projects/user/src/app/domain';
import { ActivatedRoute, Router } from '@angular/router';
import {
  TiTreeComponent,
  TiTreeNode,
  TiTableRowData,
} from '@cloud/tiny3';
import { TiPageSizeConfig, TiPaginationEvent } from '@cloud/tiny3';
import * as d3 from 'd3';
import { I18nService } from '../../service/i18n.service';
import { fromEvent, Subscription } from 'rxjs';
import { MessageService } from '../../service/message.service';
import { SamplieDownloadService } from '../../service/samplie-cache.service';
import { LibService } from '../../service/lib.service';
import * as Util from 'projects/user/src/app/util';
import * as d3Tip from 'd3-tip';
@Component({
  selector: 'app-sample-method',
  templateUrl: './sample-method.component.html',
  styleUrls: ['./sample-method.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SampleMethodComponent implements OnInit, OnDestroy, AfterViewInit {
  constructor(
    private stompService: StompService,
    private route: ActivatedRoute,
    private router: Router,
    public i18nService: I18nService,
    private el: ElementRef,
    private downloadService: SamplieDownloadService,
    private msgService: MessageService,
    public libService: LibService
  ) {
    this.i18n = this.i18nService.I18n();
  }
  public flamegraphIns: any;
  public flamegraph: any = require('d3-flame-graph');

  // 下拉框
  public typeOptions: any = [];
  public typeSelected: any;
  public chartType = '';
  public dataOptions: any = [];
  public dataSelected: any = {};

  private chartData: any = {};

  public recordId = '';
  public topicUrl = '';

  // stack trace部分
  public stackTranceData: Array<TiTreeNode> = [];
  private treeDataJava: Array<TiTreeNode> = [];
  private treeDataNative: Array<TiTreeNode> = [];
  i18n: any;
  public isIE = false;

  private resizeTimer: any = null;
  public getDataTimer: any = null;
  public dataLens = 0;
  public methodDatas: Array<any> = [];

  private stackTracesJava: any = {
    label: 'root',
    name: 'root',
    value: 0,
    children: [],
    expanded: false
  };
  private stackTracesJavaTree: any = {
    label: 'root',
    name: 'root',
    value: 0,
    children: [],
    expanded: false
  };
  private stackTracesNative: any = {
    label: 'root',
    name: 'root',
    value: 0,
    children: [],
    expanded: false
  };
  private stackTracesNativeTree: any = {
    label: 'root',
    name: 'root',
    value: 0,
    children: [],
    expanded: false
  };

  private wsFinishSub: Subscription;
  private firstInitChart = true;
  public noDataFlag = false;
  public time1: any;
  public finishJava = false;
  public finishNative = false;

  public currentTreeSource: any = [];
  public handleCurrentNodesList: any = [];
  public handleJavaNodesList: any = [];
  public handleNativeNodesList: any = [];
  public pageNation = {
    currentPage: 1,
    totalNumber: 0
  };
  public pageSize: TiPageSizeConfig = {
    options: [10, 20, 50, 100],
    size: 20
  };
  ngOnInit() {
    this.isIE = Util.judgeExplorer() === ExplorerType.IE;
    if (this.isIE) {
      return this.showLoding();
    }
    this.chartData.Java = {};
    this.chartData.Native = {};
    this.recordId = this.getRecordId();
    this.topicUrl = `/user/queue/sample/records/${this.recordId}`;

    fromEvent(window, 'resize').subscribe(event => {
      if (!this.resizeTimer) {
        this.resizeTimer = setTimeout(() => {
          this.initChart();
          this.resizeTimer = null;
        }, 500);
      }
    });

    this.typeOptions = [
      {
        label: this.i18n.protalserver_sampling_method.flame_groph,
        id: 'Flame'
      },
      {
        label: this.i18n.protalserver_sampling_method.thread_tree,
        id: 'Tree'
      }
    ];
    this.typeSelected = this.typeOptions[0];
    this.chartType = this.typeOptions[0].id;

    this.dataOptions = [
      {
        label: this.i18n.protalserver_sampling_method.java_method_sample,
        id: 'Java'
      },
      {
        label: this.i18n.protalserver_sampling_method.native_method_sample,
        id: 'Native'
      }
    ];
    this.dataSelected = this.dataOptions[0];
    this.time1 = new Date().getTime();
    this.importCache();
    if (!this.finishJava) {
      this.getSamplingData('method_sampling', this.recordId);
      this.showLoding();
    } else {
      this.noDataFlag = this.stackTracesJava.children.length === 0 && this.stackTracesJavaTree.children.length === 0;
      this.treeDataJava = this.stackTracesJavaTree.children;
      this.chartData.Java = this.stackTracesJava;
      let tempTimer = setTimeout(() => {
        this.handleTypeChangeToTree();
        this.initChart();
        clearTimeout(tempTimer);
        tempTimer = null;
      }, 0);
    }
    this.wsFinishSub = this.msgService.getMessage().subscribe(msg => {
      if (msg.type === 'wsFinish') {
        this.closeLoding();
        this.initData();
      }
    });
  }
  // 初始化数据 默认java
  private initData() {
    const flag = this.stompService.sampleMethodJava.length > 0;
    this.methodDatas = flag ? this.stompService.sampleMethodJava : this.stompService.sampleMethodNative;
    if (!this.methodDatas.length) {
      return;
    }
    this.methodDatas.forEach((temp: any, idx: any): any => {
      if (temp.type === 'METHOD_SAMPLING' && temp.content === 'FINISH_FLAG') { return this.finishJava = true; }
      if (temp.type === 'NATIVE_METHOD_SAMPLING' && temp.content === 'FINISH_FLAG') { return this.finishNative = true; }
      if (temp.content && temp.content.length !== 0) {
        this.parseData(temp, flag ? 'Java' : 'Native');
      }
    });
  }

  ngAfterViewInit(): void {
    const flame = this.el.nativeElement.querySelector('.flame-content');
    fromEvent(flame, 'mouseover').subscribe(event => {
      let tempTimer = setTimeout(() => {
        const flameTipEl = $('.d3-flame-graph-tip.s');
        if (flameTipEl.length) {
          for (let idx = 0; idx < flameTipEl.length - 1; idx++) {
            document.body.removeChild(flameTipEl[idx]);
          }
          const left = flameTipEl[flameTipEl.length - 1].style.left;
          if (parseFloat(left) < 0) { flameTipEl[0].style.left = '10px'; }
        }
        clearTimeout(tempTimer);
        tempTimer = null;
      }, 0);
    });
  }

  ngOnDestroy() {
    this.closeLoding();
    clearTimeout(this.getDataTimer);
    clearTimeout(this.resizeTimer);
    this.getDataTimer = null;
    this.resizeTimer = null;
    this.downloadService.downloadItems.method.java = this.stackTracesJava;
    this.downloadService.downloadItems.method.javaTree = this.stackTracesJavaTree;
    this.downloadService.downloadItems.method.native = this.stackTracesNative;
    this.downloadService.downloadItems.method.nativeTree = this.stackTracesNativeTree;
    this.downloadService.downloadItems.method.isFinishJava = this.finishJava;
    this.downloadService.downloadItems.method.isFinishNative = this.finishNative;
    if (this.wsFinishSub) { this.wsFinishSub.unsubscribe(); }
    this.closeLoding();
  }

  // 火焰图 将数据赋值给对应的参数
  private parseData(newData: MonitorResponse, type: any) {
    this.stackTranceData = [];
    if (this.chartType === 'Flame') {
      this.handleSeparatorCount(newData.content[1].children);
    } else {
      this.handleSeparatorCount(newData.content[0].children);
    }
    if (type === 'Java') {
      const stackTracesJava = newData.content[1];
      this.stackTracesJava = stackTracesJava;
      this.chartData[type] = this.stackTracesJava;
      const stackTracesJavaTree = newData.content[0];
      this.stackTracesJavaTree = stackTracesJavaTree;
      this.treeDataJava = this.stackTracesJavaTree.children;
      this.noDataFlag = this.stackTracesJava.children.length === 0 && this.stackTracesJavaTree.children.length === 0;
    } else {
      const stackTracesNative = newData.content[1];
      this.stackTracesNative = stackTracesNative;
      this.chartData[type] = this.stackTracesNative;
      const stackTracesNativeTree = newData.content[0];
      this.stackTracesNativeTree = stackTracesNativeTree;
      this.treeDataNative = this.stackTracesNativeTree.children;
      this.noDataFlag = this.stackTracesNative.children.length === 0 &&
       this.stackTracesNativeTree.children.length === 0;


    }
    this.handleTypeChangeToTree();
    this.initChart();
  }
  /**
   * 全局分割树的count
   * @param data 数据
   */
  public handleSeparatorCount(data: any) {
    data.forEach((item: any) => {
      const count = this.libService.setThousandSeparator(item.label.split(' ')[0]);
      item.label = `${count} ${item.name}`;
      if (item.children.length) {
        this.handleSeparatorCount(item.children);
      } else {
        delete item.children;
      }
    });
  }
  /**
   * 切换图类型 火焰图或者树
   * @param data 数据
   */
  public typeChange(data: any): void {
    this.chartType = data.id;
    setTimeout(() => {
      this.chartType === 'Flame' ? this.initChart() : this.handleTypeChangeToTree();
    }, 10);
    this.handleIsNoData(this.dataSelected.id);
    return;
  }

  /**
   * 切换采样方法
   * @param data 数据
   */
  public dataChange(data: any): void {
    if (!this.finishNative && data.id === 'Native') {
      this.showLoding();
      this.getSamplingData('native_method_sampling', this.recordId);
    } else {
      this.handleIsNoData(data.id);
      this.treeDataNative = this.stackTracesNativeTree.children;
      this.chartData.Native = this.stackTracesNative;
      this.handleTypeChangeToTree();
      this.initChart();
      return;
    }
    this.handleIsNoData(data.id);
  }
  /**
   * 获取recordId
   * @param data 数据
   */
  private getRecordId() {
    const url = this.router.url;
    const path = this.route.routeConfig.path;
    let params = url.slice(10);
    const lastIndex = params.indexOf('/');
    params = params.slice(0, lastIndex);
    return params;
  }
  /**
   * 异步获取展开前的处理数据
   * @param TreeCom 数据
   */
  public beforeExpand(TreeCom: TiTreeComponent): void {
    const currentTree: TiTreeNode = TreeCom.getBeforeExpandNode();
    this.getChildNodes(currentTree, true);
  }
  private msieversion(): boolean {
    const ua = window.navigator.userAgent;
    const msie = ua.indexOf('MSIE');
    if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) {
      return true;
    } else {
      return false;
    }
  }
  // 自定义火焰图 hover 提示
  private createFlameGraphTip(): {tip: any} {
    const getValue = (d: any) => {
      if ('v' in d) {
        return d.value;
      } else {
        return d.data.value;
      }
    };

    const getResult = (d: any, currentValue: any): any => {
      if (d.parent) {
        return getResult(d.parent, currentValue);
      } else {
        return d3.format('.3f')(currentValue / d.data.value * 100);
      }
    };

    const getName = (d: any) => {
      return d.data.n || d.data.name;
    };

    const labelHandler = (d: any) => {
      const currentValue = getValue(d);
      const percentage = getResult(d,  currentValue);
      return getName(d) + ' (' + percentage + '%, ' + currentValue + ' samples)';
    };

    const tip = (d3Tip as any).default();
    tip
      .direction('s')
      .offset([8, 0])
      .attr('class', 'd3-flame-graph-tip')
      .html((d: any) => {
        return labelHandler(d);
      });

    return tip;
  }
  /**
   * 火焰图 初始化火焰图
   * @param TreeCom 数据
   */
  public initChart() {
    this.firstInitChart = false;
    $('#chart').html('');
    let data: any = {};
    const width = $('.chart').width() * 0.94;
    if (!width) { return; }
    this.dataSelected.id === 'Java'
      ? (data = this.chartData.Java)
      : (data = this.chartData.Native);
    if (!data.children || !data.children.length) {
      this.closeLoding();
      return;
    }
    const tip = this.createFlameGraphTip();
    const flamegraph = this.flamegraph
      .flamegraph()
      .width(width)
      .minFrameSize(1)
      .tooltip(tip)
      .selfValue(false);

    d3.select('#chart')
      .datum(data)
      .call(flamegraph);
    this.flamegraphIns = flamegraph;
    this.closeLoding();
  }
  /**
   * 获取采样到的数据
   * @param data 数据
   */
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
  private showLoding() {
    document.getElementById('sample-loading-box').style.display = 'flex';
  }
  private closeLoding() {
    document.getElementById('sample-loading-box').style.display = 'none';
  }
  /**
   * 处理导入的数据
   * @param data 数据
   */
  public importCache() {
    this.stackTracesJava = this.downloadService.downloadItems.method.java;
    this.stackTracesJavaTree = this.downloadService.downloadItems.method.javaTree;
    this.stackTracesNative = this.downloadService.downloadItems.method.native;
    this.stackTracesNativeTree = this.downloadService.downloadItems.method.nativeTree;
    this.finishJava = this.downloadService.downloadItems.method.isFinishJava;
    this.finishNative = this.downloadService.downloadItems.method.isFinishNative;
  }
  public handleIsNoData(type: any) {
    if (type === 'Java') {
      this.noDataFlag = this.stackTracesJava.children && this.stackTracesJava.children.length === 0;
    } else {
      this.noDataFlag = this.stackTracesNative.children && this.stackTracesNative.children.length === 0;
    }
  }
  /**
   * 处理切换的数据
   * @param data 数据
   */
  public handleTypeChangeToTree() {
    this.pageNation.currentPage = 1;
    this.pageNation.totalNumber = 0;
    this.pageSize.size = 20;
    this.handlePageNodes();
    this.stackTranceData = this.hanldePageChange(this.pageNation.currentPage);
  }
  public handlePageNodes() {
    const currentNodeList: any = {
      Java: this.handleJavaNodesList,
      Native: this.handleNativeNodesList
    };
    if (currentNodeList[this.dataSelected.id].length === 0) {
      this.currentTreeSource = this.dataSelected.id === 'Java' ? this.treeDataJava : this.treeDataNative;
      currentNodeList[this.dataSelected.id] = this.handleSelectedTreeNodes(this.currentTreeSource);
    }
    this.pageNation.totalNumber = currentNodeList[this.dataSelected.id].length;
    this.handleCurrentNodesList = currentNodeList[this.dataSelected.id];
  }
  /**
   * 处理选中数据对应下的节点
   * @param data 数据
   */
  public handleSelectedTreeNodes(treeDatas: Array<any>): any {
    const tempTreeData: Array<TiTreeNode> = [];
    treeDatas.forEach((item: any): any => {
      const newObj = {
        label: item.label,
        expanded: item.expanded || false,
        value: item.value,
        children: item?.children
      };
      if (item.children && item.children.length) {
        const newdata: Array<any> = this.handleSelectedTreeNodes(item.children);
        if (newdata.length) {
          newObj.children = newdata;
        }
      } else {
        delete newObj.children;
      }
      tempTreeData.push(newObj);
    });
    return tempTreeData;
  }
  /**
   * 处理分页数据
   * @param data 数据
   */
  public hanldePageChange(event: any) {
    const currentDataIndex = (event - 1) * this.pageSize.size;
    let targetPageSize = currentDataIndex + this.pageSize.size;
    if (targetPageSize > this.handleCurrentNodesList.length) { targetPageSize = this.handleCurrentNodesList.length; }
    const newData = this.handleCurrentNodesList.slice(currentDataIndex, targetPageSize);
    return newData;
  }
  public handlePageUpdate(event: TiPaginationEvent) {
    const newData = this.hanldePageChange(event.currentPage); // 将获取到的新数据放到tree组件中
    this.stackTranceData = newData;
  }
  // 获取对应节点下的children节点
  public getChildNodes(currentTree: any, isExpanded?: boolean) {
    if (!currentTree.children.length) {
      const findChild = this.currentTreeSource.find((item: any) => {
        return item.label === currentTree.label;
      });
      if (findChild) {
        currentTree.children = findChild.children;
      } else {
        delete currentTree.children;
      }
    }
    if (isExpanded) {
      currentTree.expanded = true;
    }
  }
  public selectTreeNode(event: TiTreeNode): void {
    this.getChildNodes(event);
  }

  /**
   * 展开所有树节点
   */
  public expandAllNode(row: TiTableRowData) {
    if (row.expanded) {
      return;
    } else {
      row.expanded = true;
      if (row.children && row.children.length) {
        this.toggleAllChildren(row.children);
      }
    }
  }
  /**
   * 递归展开所有子节点
   */
  private toggleAllChildren(data: Array<any>): void {
    for (const node of data) {
      node.expanded = true;
      if (node.children && node.children.length) {
        this.toggleAllChildren(node.children);
      } else {
        delete node.children;
      }
    }
  }
}

interface TreeNode {
  label: string;
  name?: string;
  value: number;
  expanded: boolean;
  children?: Array<TreeNode>;
}

interface MonitorResponse {
  type: string;
  content: any;
}

interface MonitorEvent {
  monitorClass: string;
  address: string;
  duration: number;
  thread: ThreadBasicInfo;
  stackTrace: StackTraceData;
}

interface ThreadBasicInfo {
  javaName: string;
  javaThreadId: string;
  id: number;
}

interface StackTraceData {
  frames: Array<FrameData>;
}

interface FrameData {
  type: string;
  method: MethodIF;
}

interface MethodIF {
  name: string;
  descriptor: string;
  type: {
    name: string;
  };
}
