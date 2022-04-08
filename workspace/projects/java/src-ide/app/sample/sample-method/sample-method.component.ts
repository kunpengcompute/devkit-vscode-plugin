import { Component, OnInit, OnDestroy, ViewEncapsulation,
   ElementRef, AfterViewInit , NgZone, ChangeDetectorRef } from '@angular/core';
import { StompService } from '../../service/stomp.service';
import { TiTreeComponent, TiTreeNode, TiTableRowData } from '@cloud/tiny3';
import { TiPageSizeConfig, TiPaginationEvent } from '@cloud/tiny3';
import * as d3 from 'd3';
import { I18nService } from '../../service/i18n.service';
import { fromEvent, Subscription } from 'rxjs';
import { MessageService } from '../../service/message.service';
import { SamplieDownloadService } from '../../service/samplie-cache.service';
import { Utils } from '../../service/utils.service';
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
        public i18nService: I18nService,
        public changeDetectorRef: ChangeDetectorRef,
        private zone: NgZone,
        private el: ElementRef,
        private downloadService: SamplieDownloadService,
        private msgService: MessageService
    ) {
        this.i18n = this.i18nService.I18n();
    }
    public flamegraphIns: any;
    public flamegraph: any = require('d3-flame-graph');

    // 下拉框
    public typeOptions: any[] = [];
    public typeSelected: any;
    public chartType = '';
    public dataOptions: any[] = [];
    public dataSelected: any = {};

    private chartData: any = {};

    public recordId = '';
    public topicUrl = '';

    // stack trace部分
    public stackTranceData: Array<TiTreeNode> = [];
    private treeDataJava: Array<TiTreeNode> = [];
    private treeDataNative: Array<TiTreeNode> = [];
    i18n: any;

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

    // 选择过的数据源-数据量太大导致卡顿
    public seletedTreeSource: any[] = [];

    public currentTreeSource: any[] = [];
    public handleCurrentNodesList: any[] = [];
    public handleJavaNodesList: any[] = [];
    public handleNativeNodesList: any[] = [];
    public pageNation = {
        currentPage: 1,
        totalNumber: 0
    };
    public pageSize: TiPageSizeConfig = {
        options: [20, 40, 60, 80],
        size: 20
    };

    // 树颜色指示块最大值
    public totalCountStackTrace = 0;

    public showLoading = false;
    public ideType: any;
    /**
     * ngOnInit
     */
    ngOnInit() {
        if (((self as any).webviewSession || {}).getItem('tuningOperation') === 'hypertuner') {
            this.ideType = 'intellij';
        } else {
            this.ideType = 'other';
        }
        this.showLoading = true;

        this.chartData.Java = {};
        this.chartData.Native = {};
        this.recordId = this.getRecordId();
        this.topicUrl = `/user/queue/sample/records/${encodeURIComponent(this.recordId)}`;

        fromEvent(window, 'resize').subscribe(() => {
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
        } else {
            this.handleIsNoData(this.typeSelected.id);
            if (this.dataSelected.id === 'Java') {
                this.treeDataJava = this.stackTracesJava.children;
                this.chartData.Java = this.stackTracesJava;
            } else {
                this.treeDataNative = this.stackTracesNative.children;
                this.chartData.Native = this.stackTracesNative;
            }
            setTimeout(() => {
                this.handleTypeChangeToTree();
                this.initChart();
            }, 0);
        }
        this.wsFinishSub = this.msgService.getMessage().subscribe((msg) => {
            if (msg.type === 'wsFinish') {
                this.initData();
                this.showLoading = false;
            }
        });
        this.updateWebViewPage();
    }

    /**
     * 初始化数据 默认java
     */
    private initData() {
        const flag = this.stompService.sampleMethodJava.length > 0;
        this.methodDatas = flag ? this.stompService.sampleMethodJava : this.stompService.sampleMethodNative;
        if (!this.methodDatas.length) {
            return;
        }
        this.methodDatas.forEach((temp): any => {
            if (temp.type === 'METHOD_SAMPLING' && temp.content === 'FINISH_FLAG') { return this.finishJava = true; }
            if (temp.type === 'NATIVE_METHOD_SAMPLING' &&
                temp.content === 'FINISH_FLAG') { return this.finishNative = true; }
            if (temp.content && temp.content.length !== 0) {
                this.parseData(temp, flag ? 'Java' : 'Native');
            }
        });
        this.updateWebViewPage();
    }

    /**
     * ngAfterViewInit
     */
    ngAfterViewInit(): void {
        const flame = this.el.nativeElement.querySelector('.flame-content');
        fromEvent(flame, 'mouseover').subscribe(() => {
            setTimeout(() => {
                const flameTipEl = $('.d3-flame-graph-tip.s');
                if (flameTipEl.length) {
                    for (let idx = 0; idx < flameTipEl.length - 1; idx++) {
                        document.body.removeChild(flameTipEl[idx]);
                    }
                    const left = flameTipEl[flameTipEl.length - 1].style.left;
                    if (parseFloat(left) < 0) { flameTipEl[0].style.left = '10px'; }
                }
            }, 0);
        });
    }

    /**
     * ngOnDestroy
     */
    ngOnDestroy() {
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
        this.showLoading = false;
    }

    /**
     * 火焰图 将数据赋值给对应的参数
     * @param newData 数据
     * @param typeLocal 采样类型 Java || Native
     */
    private parseData(newData: MonitorResponse, typeLocal: any, flag?: any) {
        this.stackTranceData = [];
        if (typeLocal === 'Java') {
            const stackTracesJava = newData.content[1];
            this.stackTracesJava = stackTracesJava;
            this.chartData[typeLocal] = this.stackTracesJava;
            const stackTracesJavaTree = newData.content[0];
            this.stackTracesJavaTree = stackTracesJavaTree;
            this.treeDataJava = this.stackTracesJavaTree.children;
            this.noDataFlag = this.stackTracesJava.children.length === 0 &&
                this.stackTracesJavaTree.children.length === 0;
        } else {
            const stackTracesNative = newData.content[1];
            this.stackTracesNative = stackTracesNative;
            this.chartData[typeLocal] = this.stackTracesNative;
            const stackTracesNativeTree = newData.content[0];
            this.stackTracesNativeTree = stackTracesNativeTree;
            this.treeDataNative = this.stackTracesNativeTree.children;
            this.noDataFlag = this.stackTracesNative.children.length === 0 &&
                this.stackTracesNativeTree.children.length === 0;
        }
        this.handleTypeChangeToTree();
        this.initChart();
        this.updateWebViewPage();
    }

    /**
     * 切换图类型 火焰图或者树
     * @param data data
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
     * @param data data
     */
    public dataChange(data: any): void {
        if (data.id === 'Java') {
            if (!this.finishJava) {
                this.getSamplingData('method_sampling', this.recordId);
                this.showLoading = true;
                return;
            } else {
                this.treeDataJava = this.stackTracesJavaTree.children;
                this.chartData.Java = this.stackTracesJava;
            }
        } else {
            if (!this.finishNative) {
                this.showLoading = true;
                this.getSamplingData('native_method_sampling', this.recordId);
                return;
            } else {
                this.treeDataNative = this.stackTracesNativeTree.children;
                this.chartData.Native = this.stackTracesNative;
            }
        }
        this.handleIsNoData(data.id);
        this.handleTypeChangeToTree();
        this.initChart();
    }

    /**
     * 获取recordId
     */
    private getRecordId() {
        return (self as any).webviewSession.getItem('recordId');
    }

    /**
     * 树节点展开前的事件回调，一般用于异步数据获取
     * @param TreeCom TreeCom
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
  private createFlameGraphTip(): { tip: any } {
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
        return d3.format('.3f')((currentValue / d.data.value) * 100);
      }
    };

    const getName = (d: any) => {
      return d.data.n || d.data.name;
    };

    const labelHandler = (d: any) => {
      const currentValue = getValue(d);
      const percentage = getResult(d, currentValue);
      return (
        getName(d) + ' (' + percentage + '%, ' + currentValue + ' samples)'
      );
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
            this.showLoading = false;
            return;
        }
        const tip = this.createFlameGraphTip();
        const flamegraph = this.flamegraph
            .flamegraph()
            .width(width)
            .minFrameSize(1)
            .tooltip(tip)
            .selfValue(false);

        const chart = d3.select('#chart')
            .datum(data)
            .call(flamegraph);
        this.flamegraphIns = flamegraph;
        this.showLoading = false;
        this.updateWebViewPage();
    }

    /**
     * getSamplingData
     * @param type type
     * @param data data
     */
    public getSamplingData(typeLocal: any, data: any) {
        const uuid = Utils.generateConversationId(8);
        const requestUrl = `/user/queue/sample/records/${data}/${encodeURIComponent(uuid)}/${typeLocal}`;
        this.stompService.subscribeStompFn(requestUrl);
        this.stompService.startStompRequest('/cmd/sub-record', {
            recordId: data,
            recordType: typeLocal.toUpperCase(),
            uuid
        });
        this.updateWebViewPage();
    }

    /**
     * 获取页面释放时的缓存的数据信息
     */
    public importCache() {
        this.stackTracesJava = this.downloadService.downloadItems.method.java;
        this.stackTracesJavaTree = this.downloadService.downloadItems.method.javaTree;
        this.stackTracesNative = this.downloadService.downloadItems.method.native;
        this.stackTracesNativeTree = this.downloadService.downloadItems.method.nativeTree;
        this.finishJava = this.downloadService.downloadItems.method.isFinishJava;
        this.finishNative = this.downloadService.downloadItems.method.isFinishNative;
    }

    /**
     * 判断数据是否为空
     */
    public handleIsNoData(typeLocal: any) {
        if (typeLocal === 'Java') {
            this.noDataFlag = this.stackTracesJava.children &&
                this.stackTracesJava.children.length === 0 && this.stackTracesJavaTree.children.length === 0;
        } else {
            this.noDataFlag = this.stackTracesNative.children &&
                this.stackTracesNative.children.length === 0 && this.stackTracesNativeTree.children.length === 0;
        }
    }

    /**
     * handleTypeChangeToTree
     */
    public handleTypeChangeToTree() {
        this.pageNation.currentPage = 1;
        this.pageNation.totalNumber = 0;
        this.pageSize.size = 20;
        this.handlePageNodes();
        this.stackTranceData = this.hanldePageChange(this.pageNation.currentPage);
    }

    /**
     * handlePageNodes
     */
    public handlePageNodes() {
        const currentNodeList: any = {
            Java: this.handleJavaNodesList,
            Native: this.handleNativeNodesList
        };
        if (currentNodeList[this.dataSelected.id].length === 0) {
            this.currentTreeSource = this.dataSelected.id === 'Java' ? this.treeDataJava : this.treeDataNative;
            this.totalCountStackTrace = 0;
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
                children: item?.children,
                needReserved: false
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
     * hanldePageChange
     */
    public hanldePageChange(event: any) {
        const currentDataIndex = (event - 1) * this.pageSize.size;
        let targetPageSize = currentDataIndex + this.pageSize.size;
        if (targetPageSize > this.handleCurrentNodesList.length) {
            targetPageSize = this.handleCurrentNodesList.length;
        }
        const newData = this.handleCurrentNodesList.slice(currentDataIndex, targetPageSize);
        const newSeletedTreeSource = this.currentTreeSource.slice(currentDataIndex, targetPageSize);
        const oldNeedReservedTreeSource = this.seletedTreeSource.filter((item) => {
            return item.needReserved;
        });
        this.seletedTreeSource = newSeletedTreeSource.concat(oldNeedReservedTreeSource);
        return newData;
    }

    /**
     * handlePageUpdate
     */
    public handlePageUpdate(event: TiPaginationEvent) {
        const newData = this.hanldePageChange(event.currentPage); // 将获取到的新数据放到tree组件中
        this.stackTranceData = newData;
    }

    /**
     * 获取对应节点下的children节点
     */
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

    /**
     * intellIj刷新webview页面
     */
    public updateWebViewPage() {
        if (((self as any).webviewSession || {}).getItem('tuningOperation') === 'hypertuner') {
            this.zone.run(() => {
                this.changeDetectorRef.detectChanges();
                this.changeDetectorRef.checkNoChanges();
            });
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
    content: Array<MonitorEvent>;
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
