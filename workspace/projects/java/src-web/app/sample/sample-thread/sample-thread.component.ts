import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  Renderer2
} from '@angular/core';
import { StompService } from '../../service/stomp.service';
import { AxiosService } from '../../service/axios.service';
import { ActivatedRoute, Router } from '@angular/router';
import { I18nService } from '../../service/i18n.service';
import { MessageService } from '../../service/message.service';
import { Subscription } from 'rxjs';
import { SamplieDownloadService } from '../../service/samplie-cache.service';
import { LibService } from '../../service/lib.service';
import { TiDragService, TiTreeNode } from '@cloud/tiny3';

@Component({
  selector: 'app-sample-thread',
  templateUrl: './sample-thread.component.html',
  styleUrls: ['./sample-thread.component.scss']
})
export class SampleThreadComponent
  implements OnInit, AfterViewInit, OnDestroy {
  constructor(
    private stompService: StompService,
    private el: ElementRef,
    private route: ActivatedRoute,
    private router: Router,
    private Axios: AxiosService,
    public i18nService: I18nService,
    private downloadService: SamplieDownloadService,
    private msgService: MessageService,
    public libService: LibService,
    private dragService: TiDragService,
    private renderer2: Renderer2,
  ) {
    this.i18n = this.i18nService.I18n();
    this.obersverOptions = [
      { label: this.i18n.newLockGraph.lock, value: 'lock' },
      { label: this.i18n.newLockGraph.thread, value: 'thread' }
    ];
    this.obersverSelect = this.obersverOptions[0];
  }
  @ViewChild('diffIns') diffIns: any;
  @ViewChild('lockGraph') lockGraph: any;
  @ViewChild('lockGraph2') lockGraph2: any;
  @ViewChild('showFullEl') showFullEl: ElementRef;
  @ViewChild('draggable') draggableEl: ElementRef;
  i18n: any;

  public stompClient: any;
  public recordId: string;
  public topicUrl = '';
  public typeOptions: any = [];
  public typeSelected: any = {};

  public currentFile: any = {};
  public fileList: Array<any> = [];

  // graph部分
  public currentGraphFile: any;
  public graphOption: any;
  public echartsIntance: any;
  public graphData: any;
  public graphLinks: any;
  private selGraphLinks: any = [];
  public graphDescs: Array<any> = [];
  public deadlockNum = 0;
  public activeFile = 0;
  public activeGraph = -1;
  private symbol = 'rect'; // 关系图节点标记的形状

  public getDataTimer: any = null;
  public dataLens = 0;
  public threadDatas: Array<any> = [];

  public relateIdx = 1;
  public fileIdx = 1;
  public sourceX = 150;
  public targetX = 550;

  public activeFileBak = -1;

  public preSelectedId = '';

  public fileListWidth: number;
  public fileNameFix: string;
  private wsFinishSub: Subscription;

  public obersverSwitch = false;
  public obersverOptions: any = [];
  public obersverSelect: any;
  public compareSwitch = false;
  public compareOptions: any = [];
  public compareSelect: any;
  public currentThreadTime: string;
  public compareThreadTime: string;
  public finishThread = false;
  public threadDump: any = [];
  public leftState = false;
  // 全屏缩放
  public wheelShowScale = 1;
  ngOnInit() {

    this.typeOptions = [
      {
        label: this.i18n.protalserver_sampling_thread.lock,
        id: 'graph'
      },
      {
        label: this.i18n.protalserver_sampling_thread.raw,
        id: 'raw'
      },
    ];
    this.typeSelected = this.typeOptions[0];
    this.graphDescs = [
      {
        label: 'Locked',
        src: './assets/img/home/solid-line.svg'
      },
      {
        label: 'Blocked On',
        src: './assets/img/home/dotted-line.svg'
      }
    ];
    this.recordId = this.getRecordId();
    this.importCache();
    if (!this.finishThread) {
      this.getSamplingData('thread_dump', this.recordId);
      this.showLoding();
    } else if (this.fileList.length > 0){
      this.currentFile = this.fileList[0];
      this.currentFile.checked = true;
      this.currentFile.expanded = false;
      this.handleCompareList(0);
      let tempTimer = setTimeout(() => {
        this.diffIns.diff(this.currentFile);
        clearTimeout(tempTimer);
        tempTimer = null;
      }, 200);
    }

    this.wsFinishSub = this.msgService.getSampleThreadDumpMessage().subscribe(msg => {
      if (msg.type === 'THREAD_DUMP' && msg.content === 'FINISH_FLAG') {
        this.closeLoding();
        this.handleAllData(this.threadDump[0]);
        this.finishThread = true;
        return;
      }
      if (msg.type === 'THREAD_DUMP') {
        this.threadDump.push(msg.content);
      }
    });
  }
  public handleAllData(data: any) {
    const startTimeLists = data.sort((a: any, b: any) => {
      return b - a;
    });
    startTimeLists.forEach((item: any, index: any) => {
      const itemFile: any = {};
      itemFile.startTime = item;
      itemFile.name = this.libService.dateFormat(item, 'yyyy/MM/dd hh:mm:ss');
      itemFile.checked = false;
      itemFile.expanded = false;
      itemFile.files = [];
      itemFile.children = [];
      itemFile.deadlockNum = 0;
      itemFile.content = '';
      this.fileList.push(itemFile);
      if (index === 0) {
        itemFile.checked = true;
        this.getAllContent(itemFile, index);
      }
    });
  }
  public getFileData(time: any) {
    const url = `/records/threadDump/${this.recordId}/${time}`;
    this.showLoding();
    return new Promise((resolve, reject) => {
      this.Axios.axios.get(url).then((res: any) => {
        this.closeLoding();
        this.handleFileData(res);
        resolve(res);
      }).catch(() => {
        this.closeLoding();
      });
    });
  }
  public handleFileData(res: any) {
    const startTime = res.startTime;
    const content = res.content;
    const reg = /\s+#\d+\s+/;
    const files = content.split('\n\n');
    const itemFile = this.fileList.find(item => {
      return item.startTime === startTime;
    });
    itemFile.content = content;
    const deadlockReg = /Found\s+\d+\s+deadlock./;
    const deadLockStrIdx = files.findIndex((item: any) => {
      return deadlockReg.test(item);
    });

    if (deadLockStrIdx >= 0) {
      const deadlock = files[deadLockStrIdx].match(/\d+/);
      itemFile.deadlockNum = deadlock[0];
    }
    const deadLockThreads: any = [];
    const deadLockStrReg = /Found one Java-level deadlock:/;
    files.forEach((file: any) => {
      const matchObj = file.match(reg);
      if (matchObj) {
        itemFile.files.push({
          fileName: file.slice(1, matchObj.index - 1),
          name: file.slice(1, matchObj.index - 1),
          content: file.slice(matchObj.index + matchObj[0].length),
        });
      }
      if (deadLockStrReg.test(file)) {
        const threads = file.split('\n');
        threads.forEach((item: any) => {
          if (deadLockStrReg.test(item)) { return; }
          const idx = item.indexOf(':');
          if (idx >= 0) {
            deadLockThreads.push({
              type: 'deadLockThread',
              name: item.slice(1, idx - 1)
            });
          }
        });
      }
    });
    itemFile.files = itemFile.files.concat(deadLockThreads);
    itemFile.children = itemFile.files;
  }
  // 锁图 处理数据 生成节点和线
  private parseLock(files: any, selIdx: any) {
    this.graphData = [];   // 节点
    this.graphLinks = [];   // 连线
    this.selGraphLinks = [];
    this.relateIdx = 1;
    this.fileIdx = 1;
    const links: any = [];
    const graphData: any = [];
    const reg = /- waiting to lock|- locked/g;
    const relationIdReg = /<\w+>/;
    const echarts = this.el.nativeElement.querySelector('#graph_echarts');
    const deadLockThreads = files.filter((item: any) => {
      return item.type === 'deadLockThread';
    });
    deadLockThreads.forEach((thr: any) => {
      const idx = files.findIndex((item: any) => {
        return item.fileName === thr.name;
      });
      if (idx > 0) {
        const tar = files.splice(idx, 1);
        files.unshift(tar[0]);
      }
    });

    const graphFiles = files.filter((item: any) => {
      return item.content;
    });

    graphFiles.forEach((file: any, index: any) => {
      const content = file.content;
      const matched = content && content.match(reg);
      if (matched) {
        this.graphDatas(
          graphData,
          file.fileName,
          selIdx,
          index,
          false,
          this.sourceX,
          null
        );

        const lines = content.split('\n\t');
        lines.forEach((line: any) => {
          let lockedCount = 1;
          if (
            line.indexOf('- waiting to lock') !== -1 &&
            line.indexOf('no object reference available') === -1
          ) {
            const target = line.match(relationIdReg);
            this.graphDatas(
              graphData,
              target[0],
              selIdx,
              index,
              false,
              null,
              this.targetX
            );
            this.graphLinksFn(
              links,
              file.fileName,
              target[0],
              selIdx,
              index,
              false,
              graphData
            );
          }
          if (line.indexOf('- locked') !== -1) {
            const target = line.match(relationIdReg);
            this.graphDatas(
              graphData,
              target[0],
              selIdx,
              index,
              true,
              null,
              this.targetX
            );
            this.graphLinksFn(
              links,
              file.fileName,
              target[0],
              selIdx,
              index,
              true,
              graphData
            );
            lockedCount++;
          }
        });
      }
    });

    if (graphData.length <= 3) {
      graphData.forEach((item: any, idx: any) => {
        if (item.x === this.targetX) {
          graphData[idx].symbolOffset = [0, 0];
        }
      });
    }
    this.graphData = graphData;

    this.graphLinks = links;
    echarts.style.height = Math.max(this.fileIdx, this.relateIdx) * 100 + 'px';
    this.graphOption = this.setOptions();  // 初始化echarts配置
    if (this.echartsIntance) {
      this.echartsIntance.clear();
      this.echartsIntance.setOption(this.graphOption, true);
    }
  }
  public onChartInit(ec: any) {
    this.echartsIntance = ec;
  }
  // 锁图 点击节点高亮置顶
  public handleClick(tar: any) {
    const selNode = tar.data;
    const fileIdx = this.currentGraphFile.findIndex((file: any) => {
      return file.fileName === selNode.name;
    });
    const delFile = this.currentGraphFile.splice(fileIdx, 1);
    this.currentGraphFile.unshift(delFile[0]);
    this.parseLock(this.currentGraphFile, 0);
  }
  // 锁图 节点间的连线
  private graphLinksFn(links: any, sourceName: any, targetName: any,
                       selIdx: any, index: any, isLock: any, graphData?: any) {
    const linkIdx = links.findIndex((item: any) => {
      return item.source === sourceName && item.target === targetName;
    });
    let lineColor = '#d4d9e6';
    if (graphData && graphData.length) {
      const idx = graphData.findIndex((item: any) => {
        return item.name === sourceName;
      });
      if (idx >= 0) {
        if (!isLock) {
          graphData[idx].itemStyle.color = 'rgba(244, 92, 94, 0.2)';
        }
        if (selIdx === index) {
          this.selGraphLinks = graphData.slice();
          const filterLockedLen = this.selGraphLinks.filter((item: any) => {
            return item.name !== sourceName && item.isLock;
          }).length;
          lineColor = filterLockedLen !== (this.selGraphLinks.length - 1) ? '#f45c5e' : '#08cc24';
          graphData[idx].itemStyle.color = lineColor;
        }
      }
    }
    if (linkIdx === -1) {
      links.push({
        source: sourceName,
        target: targetName,
        lineStyle: {
          color: lineColor,
          type: isLock ? 'solid' : 'dash'
        }
      });
    }
  }
  // 锁图 echarts节点图
  private graphDatas(graphData: any, name: any, selIdx: any, index: any, isLock?: any, sourceX?: any, targetX?: any) {
    const gpIdx = graphData.findIndex((data: any) => {
      return data.name === name;
    });
    let color = '';
    let labelColor = '';
    let y = 0;

    if (sourceX) {
      color = selIdx === index ? '#F45C5E' : '#E4F9EC';
      labelColor = selIdx === index ? '#fff' : '#333';
      y = this.fileIdx * 100;
    } else {
      color = '#838A9B';
      labelColor = '#fff';
      y = this.relateIdx * 100;
    }

    if (gpIdx === -1) {
      graphData.push({
        name,
        x: sourceX || targetX,
        y,
        value: 4,
        symbol: this.symbol,
        symbolSize: [name.length * 8, 42],
        symbolOffset: sourceX ? ['-50%', 0] : ['35%', 0],
        itemStyle: {
          color
        },
        label: {
          color: labelColor
        },
        isLock
      });
      if (sourceX) { this.fileIdx++; }
      if (targetX) { this.relateIdx++; }
    }
  }
  // 原始数据 展开列表
  public openfilesToggle(index: any) {
    const rootFile = this.fileList[index];
    rootFile.expanded = !rootFile.expanded;
    this.fileList.forEach((item, idx) => {
      if (index !== idx) { item.expanded = false; }
    });

    if (rootFile.expanded) {
      this.getFileData(rootFile.startTime);
    }
    this.activeFile = -1;
  }
  public beforeExpand(node: TiTreeNode): void {
    const idx = this.fileList.findIndex(e => e === node.beforeExpandNode);
    this.openfilesToggle(idx);
  }
  // 原始数据 获取所有内容
  public async getAllContent(file: any, idx?: any) {
    if (idx === 0) {
      this.activeFile = idx;
    } else {
      idx = this.fileList.findIndex(e => e === file);
    }
    if (!file.content) {
      await this.getFileData(file.startTime);
    }
    this.activeFile = idx;
    this.diffIns.diff(file);
  }
  // 下拉框 改变锁图和原始数据
  public typeChange(data: any) {
    if (this.preSelectedId === data.id) {
      return;
    }
    if (data.id === 'raw') {
      this.activeFile = this.activeGraph;
      this.getAllContent(this.fileList[this.activeFile], this.activeFile);
    } else {
      this.activeGraph = this.activeFile !== -1 ? this.activeFile : this.activeFileBak;
      this.getFileDataAndShowLock(this.fileList[this.activeGraph], this.activeGraph);
      let tempTimer = setTimeout(() => {
        this.onSetDraggable();
        clearTimeout(tempTimer);
        tempTimer = null;
      }, 200);
    }
    this.preSelectedId = data.id;
  }
  public async getFileDataAndShowLock(file: any, idx: any) {
    if (file && !file.content) {
      await this.getFileData(file.startTime);
    }
    this.changeParseSel(this.fileList[idx], idx);
  }
  // 锁图 切换时间段
  public changeParseSel(file: any, idx: any) {
    if (!file) {
      return;
    }
    this.currentGraphFile = file?.files; // 数据数组
    this.deadlockNum = file.deadlockNum;
    this.activeGraph = idx;    // 某个时间点
    this.currentThreadTime = file.name;
    this.handleCompareList(idx);
    this.handleFileNewData(file);
  }
  // 锁图 初始化echarts配置
  private setOptions() {
    const option = {
      tooltip: {},
      animationDurationUpdate: 1500,
      animationEasingUpdate: 'quinticInOut',

      label: {
        fontSize: 13
      },
      series: [
        {
          type: 'graph',
          layout: 'none',
          top: 50,
          left: 'center',
          roam: 'move',
          label: {
            normal: {
              show: true
            }
          },
          edgeSymbol: ['none', 'arrow'],
          edgeSymbolSize: [4, 10],
          edgeLabel: {
            normal: {
              textStyle: {
                fontSize: 20
              }
            }
          },
          // 所有节点数据
          data: this.graphData,
          links: this.graphLinks,
          lineStyle: {
            normal: {
              opacity: 0.9,
              width: 2,
              curveness: 0
            }
          }
        }
      ]
    };
    return option;
  }

  private getRecordId() {
    const url = this.router.url;
    const path = this.route.routeConfig.path;
    let params = url.slice(10);
    const lastIndex = params.indexOf('/');
    params = params.slice(0, lastIndex);
    return params;
  }

  private showLoding() {
    document.getElementById('sample-loading-box').style.display = 'flex';
  }
  private closeLoding() {
    document.getElementById('sample-loading-box').style.display = 'none';
  }

  ngAfterViewInit(): void {
    this.getFileList();
    this.fileListWidth =
      parseInt(this.el.nativeElement.querySelector('.list-content').clientWidth, 10) - 50;
    let tempTimer = setTimeout(() => {
      this.getFileDataAndShowLock(this.fileList[0], 0);
      this.onSetDraggable();
      clearTimeout(tempTimer);
      tempTimer = null;
    }, 200);
  }

  public getFileList(): void {
    const fileList = this.el.nativeElement.querySelectorAll(
      '.item-child-container .item-child span.overflow-class'
    );
    for (const itme of fileList) {
      if (itme.offsetWidth > this.fileListWidth) {
        const width = itme.offsetWidth;

        const text = itme?.innerHTML;
        const index = text.lastIndexOf('/');
        this.fileNameFix = text.slice(index);
        itme.nextElementSibling.innerHTML = this.fileNameFix;
        const fileNameFixWidth = itme.nextElementSibling.offsetWidth;
        itme.style.width =
          this.fileListWidth - fileNameFixWidth - 32 + 'px';
        itme.style.display = 'inline-block';
        itme.parentElement.title = text;
      }
    }
  }
  ngOnDestroy() {
    clearTimeout(this.getDataTimer);
    this.getDataTimer = null;
    this.downloadService.downloadItems.thread.data = this.fileList;
    this.downloadService.downloadItems.thread.isFinish = this.finishThread;
    if (this.wsFinishSub) { this.wsFinishSub.unsubscribe(); }
    this.closeLoding();
  }


  public handleFileNewData(file: any) {
    this.lockGraph.handleFileNewData(file);
  }
  public obersverSelectChange(obersver: any) {
    this.obersverSelect = obersver;
    this.lockGraph.currentTypeChange(obersver.value);
    if (this.compareSwitch) {
      this.obersverSelectChange2(obersver);
    }
  }
  public obersverSelectChange2(obersver: any) {
    if (obersver.value === 'lock') {
      this.lockGraph2.currentTypeChange('thread');
    } else {
      this.lockGraph2.currentTypeChange('lock');
    }
  }
  public compareSwitchChange() {
    const len = this.compareOptions.length;
    for (let i = 0; i < len; i++) {
      const item = this.compareOptions[i];
      if (item.disabled === true) {
        const index = i === (len - 1) ? i - 1 : i + 1;
        this.compareSelect = this.compareOptions[index];
        this.compareSelectChange(this.compareSelect);
      }
    }
  }
  public async compareSelectChange(compare: any) {
    this.compareSelect = compare;
    if (this.compareSwitch) {
      if (!this.fileList[compare.value].content) {
        await this.getFileData(compare.startTime);
      }
      const file = this.fileList[compare.value];
      this.compareThreadTime = compare.label;
      this.lockGraph2.handleFileNewData(file);
      this.obersverSelectChange2(this.obersverSelect);
    }
  }
  public handleCompareList(idx: any) {
    this.compareOptions = this.fileList.map((item, index) => {
      return { label: item.name, value: index, disabled: index === idx, startTime: item.startTime };
    });
    if (!this.compareSelect) {
      this.compareSelect = this.compareOptions[idx];
      this.compareThreadTime = this.compareSelect.name;
    }
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
  public importCache() {
    this.fileList = this.downloadService.downloadItems.thread.data;
    this.finishThread = this.downloadService.downloadItems.thread.isFinish;
  }
  public toggleLeft() {
    this.leftState = !this.leftState;
  }
  /**
   * 设置可拖拽以及鼠标滚轮事件
   */
  public onSetDraggable() {
    this.dragService.create({
      helper: this.draggableEl.nativeElement,
      stop() {
        const svgElement = document.getElementById('draggableSvg');
        const svgOffsetLeft = svgElement.offsetLeft;
        const svgOffsetTop = svgElement.offsetTop;
        const svgScrollHeight = svgElement.scrollHeight;
        if (svgOffsetLeft < -550 || svgOffsetTop < -(svgScrollHeight - 200)) {
          $('.graph-svg').css('left', '0px');
          $('.graph-svg').css('top', '0px');
        }
      }
    });
    this.renderer2.listen(this.draggableEl.nativeElement, 'wheel', this.onScrollZoom);
    this.renderer2.listen(this.draggableEl.nativeElement, 'mousewheel', this.onScrollZoom);
    this.renderer2.listen(this.draggableEl.nativeElement, 'DOMMouseScroll', this.onScrollZoom);
  }
  /**
   * 鼠标滚轮放大缩小
   */
  public wheelShowZoom(num: number) {
    this.wheelShowScale *= num;
    // 绑定鼠标滑轮
    this.renderer2.setStyle(this.draggableEl.nativeElement, 'transform', `scale(${this.wheelShowScale})`);
  }
  /**
   * 鼠标滚轮放大缩小事件
   */
  public onScrollZoom = (e: any) => {
    e = e || (window as any).event;
    // e.detail用来兼容FireFox
    if (e?.wheelDelta > 0 || e?.detail > 0) {
      this.wheelShowZoom(1.1);
    } else if (e.wheelDelta <= 0) {
      this.wheelShowZoom(0.9);
    }
  }
  /**
   * 放大缩小按钮返回的数据
   */
   public onZoomParam(num: number) {
    this.wheelShowScale = num;
  }
  public onZoomStatus(status: boolean) {
    if (status) { // 放大缩小状态
      this.renderer2.setStyle(this.showFullEl.nativeElement, 'background-color', '#FFF');
      this.renderer2.setStyle(this.showFullEl.nativeElement, 'padding', '0px 48px');
      $('.select-box').css('display', 'none');
      this.leftState = true;
    } else {
      this.renderer2.setStyle(this.showFullEl.nativeElement, 'padding', '0px');
      $('.select-box').css('display', 'flex');
      this.leftState = false;
    }
  }
}
