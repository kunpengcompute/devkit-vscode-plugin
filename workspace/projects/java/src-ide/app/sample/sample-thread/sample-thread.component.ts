import {
    Component,
    OnInit,
    ViewChild,
    ElementRef,
    AfterViewInit,
    AfterViewChecked,
    OnDestroy,
    Renderer2
} from '@angular/core';
import { StompService } from '../../service/stomp.service';
import { I18nService } from '../../service/i18n.service';
import { MessageService } from '../../service/message.service';
import { Subscription } from 'rxjs';
import { SamplieDownloadService } from '../../service/samplie-cache.service';
import { COLOR_THEME, VscodeService } from '../..//service/vscode.service';
import { Utils } from '../../service/utils.service';
import { TiDragService, TiTreeNode } from '@cloud/tiny3';
import { EventManager } from '@angular/platform-browser';

@Component({
    selector: 'app-sample-thread',
    templateUrl: './sample-thread.component.html',
    styleUrls: ['./sample-thread.component.scss']
})
export class SampleThreadComponent
    implements OnInit, AfterViewInit, AfterViewChecked, OnDestroy {
    constructor(
        public vscodeService: VscodeService,
        private stompService: StompService,
        private el: ElementRef,
        public i18nService: I18nService,
        private downloadService: SamplieDownloadService,
        private msgService: MessageService,
        private dragService: TiDragService,
        private renderer2: Renderer2,
        private eventManager: EventManager,
    ) {
        this.i18n = this.i18nService.I18n();
        this.obersverOptions = [
            { label: this.i18n.newLockGraph.lock, value: 'lock' },
            { label: this.i18n.newLockGraph.thread, value: 'thread' }
        ];
        this.obersverSelect = this.obersverOptions[0];
        this.viewModel = this.obersverOptions[0].label;
    }
    @ViewChild('diffIns', { static: false }) diffIns: any;
    @ViewChild('lockGraph', { static: false }) lockGraph: any;
    @ViewChild('lockGraph2', { static: false }) lockGraph2: any;
    @ViewChild('draggable', { static: false }) draggableEl: ElementRef;
    @ViewChild('showFullEl', { static: false }) showFullEl: ElementRef;
    i18n: any;

    public stompClient: any;
    public recordId: string;
    public multiple = false;
    public topicUrl = '';
    public typeOptions: any[] = [];
    public typeSelected: any = {};
    // 获取主题颜色
    public ColorTheme = {
        Dark: COLOR_THEME.Dark,
        Light: COLOR_THEME.Light
    };
    public currTheme = COLOR_THEME.Dark;
    public currentFile: any = {};
    public fileList: Array<any> = [];
    // graph部分
    public currentGraphFile: any;
    public graphOption: any;
    public echartsIntance: any;
    public graphData: any;
    public graphLinks: any;
    private selGraphLinks: any[] = [];
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

    public preSelectedId = '';

    public fileListWidth: number;
    public fileNameFix: string;
    private wsFinishSub: Subscription;

    public obersverSwitch = false;
    public obersverOptions: any[] = [];
    public obersverSelect: any;
    public compareSwitch = false;
    public compareOptions: any[] = [];
    public compareSelect: any;
    public compareSelectIndex: any;
    public currentThreadTime: string;
    public compareThreadTime: string;
    public finishThread = false;
    public leftState = false;
    public threadDump: any[] = [];

    public showLoading = false;

    public wheelShowScale = 1;
    private isChangeType = false;
    private isFullScreen = false;


    public isIntellij: boolean = (self as any).webviewSession.getItem('tuningOperation') === 'hypertuner';
    public viewModel: string;
    public compareModel: string;
    public viewDownFlag = false;
    public compareDownFlag = false;
    /**
     * 初始化
     */
    ngOnInit() {
        this.eventManager.addGlobalEventListener('window', 'keyup.esc',
            () => { this.onZoomStatus(false, 'keyupEsc'); });
        this.showLoading = true;
        this.typeOptions = [
            {
                label: this.i18n.protalserver_sampling_thread.lock,
                id: 'graph'
            },
            {
                label: this.i18n.protalserver_sampling_thread.raw,
                id: 'raw'
            }
        ];
        if (document.body.className.indexOf('vscode-light') !== -1) {
            this.currTheme = COLOR_THEME.Light;
        }
        this.vscodeService.regVscodeMsgHandler('colorTheme', (msg: any) => {
            this.currTheme = msg.colorTheme;
            if (this.isFullScreen) {
                const backgroundColor = (self as any).webviewSession.getItem('tuningOperation') === 'hypertuner'
                ? '#313335' : '#272727';
                this.renderer2.setStyle(this.showFullEl.nativeElement, 'background-color',
                    this.currTheme === this.ColorTheme.Dark ? backgroundColor : '#fff');
            }
        });
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
        } else {
            this.currentFile = this.fileList[0];
            setTimeout(() => {
                this.getFileDataAndShowLock(this.currentFile, 0);
                this.showLoading = false;
            }, 200);
        }

        this.wsFinishSub = this.msgService.getSampleThreadDumpMessage().subscribe((msg) => {
            if (msg.type === 'THREAD_DUMP' && msg.content === 'FINISH_FLAG') {
                this.showLoading = false;
                this.handleAllData(this.threadDump[0]);
                this.finishThread = true;
                return;
            }
            if (msg.type === 'THREAD_DUMP') {
                this.threadDump.push(msg.content);
            }
        });
    }
    private dataChange(len: any) {
        this.showLoading = true;
        this.threadDatas = this.stompService.sampleDatas11;
        if (
            this.dataLens !== this.threadDatas.length ||
            this.threadDatas.length === 0
        ) {
            this.dataLens = this.threadDatas.length;
            this.getDataTimer = setTimeout(() => {
                this.dataChange(this.dataLens);
            }, 300);
            return;
        }
        clearTimeout(this.getDataTimer);
        this.getDataTimer = null;
        this.threadDatas.forEach((temp) => {
            this.getFiles(temp);
        });
        if (this.dataLens === this.threadDatas.length) {
            this.showLoading = false;
        }
    }
    // 原始数据 数据处理函数
    private getFiles(data: any) {
        this.showLoading = false;
        let sortedData = [];
        sortedData = data.sort((a: any, b: any) => {
            return b.startTime - a.startTime;
        });
        sortedData.forEach((sFile: any) => {
            const itemFile: any = {};
            itemFile.name = this.dateFormat(sFile.startTime, 'yyyy/MM/dd hh:mm:ss');
            itemFile.isOpen = false;
            itemFile.files = [];
            itemFile.deadlockNum = 0;
            itemFile.content = sFile.content;
            const content = sFile.content;
            const files = content.split('\n\n');
            const deadlockReg = /Found\s+\d+\s+deadlock./;
            const deadLockStrIdx = files.findIndex((item: any) => {
                return deadlockReg.test(item);
            });

            if (deadLockStrIdx >= 0) {
                const deadlock = files[deadLockStrIdx].match(/\d+/);
                itemFile.deadlockNum = deadlock[0];
            }
            const reg = /\s+#\d+\s+/;
            const deadLockThreads: any[] = [];
            const deadLockStrReg = /Found one Java-level deadlock:/;
            files.forEach((file: any) => {
                const matchObj = file.match(reg);
                if (matchObj) {
                    itemFile.files.push({
                        fileName: file.slice(1, matchObj.index - 1),
                        content: file.slice(matchObj.index + matchObj[0].length),
                        isActive: itemFile.files.length === 0
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
            // 原始数据列表
            this.fileList.push(itemFile);
        });
        this.currentFile = this.fileList[0];
        this.handleCompareList(0);
        this.diffIns.diff(this.currentFile);
    }
    /**
     * 获取所有数据
     */
    public handleAllData(data: any) {
        const startTimeLists = data.sort((a: any, b: any) => {
            return b - a;
        });
        startTimeLists.forEach((item: any, index: number) => {
            const itemFile: any = {};
            itemFile.startTime = item;
            itemFile.name = this.dateFormat(item, 'yyyy/MM/dd hh:mm:ss');
            itemFile.isOpen = false;
            itemFile.checked = false;
            itemFile.expanded = false;
            itemFile.files = [];
            itemFile.children = [];
            itemFile.deadlockNum = 0;
            itemFile.content = '';
            this.fileList.push(itemFile);
            if (index === 0) {
                this.getFileDataAndShowLock(itemFile, index);
                if (this.draggableEl) {
                  this.onSetDraggable();
                }
            }
        });
    }
    /**
     * 获取单一文件数据
     */
    public getFileData(time: any) {
        this.showLoading = true;
        return new Promise((resolve) => {
            const option = {
                url: `/records/threadDump/${this.recordId}/${time}`,
            };
            this.vscodeService.get(option, (res: any) => {
                this.showLoading = false;
                this.handleFileData(res);
                resolve(res);
            });
        });
    }
    /**
     * 处理数据
     */
    public handleFileData(res: any) {
        const startTime = res.startTime;
        const content = res.content;
        const reg = /\s+#\d+\s+/;
        const files = content.split('\n\n');
        const itemFile = this.fileList.find((item) => {
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
        const deadLockThreads: any[] = [];
        const deadLockStrReg = /Found one Java-level deadlock:/;
        files.forEach((file: any) => {
            const matchObj = file.match(reg);
            if (matchObj) {
                itemFile.files.push({
                    fileName: file.slice(1, matchObj.index - 1),
                    content: file.slice(matchObj.index + matchObj[0].length),
                    isActive: itemFile.files.length === 0
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
        const links: any[] = [];
        const graphData: any[] = [];
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

        graphFiles.forEach((file: any, index: number) => {
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
            graphData.forEach((item, idx) => {
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
    /**
     * 初始化echarts
     * @param ec ec
     */
    public onChartInit(ec: any) {
        this.echartsIntance = ec;
    }
    /**
     * 锁图 点击节点高亮置顶
     * @param tar tar
     */
    public handleClick(tar: any) {
        const selNode = tar.data;
        const fileIdx = this.currentGraphFile.findIndex((file: any) => {
            return file.fileName === selNode.name;
        });
        const delFile = this.currentGraphFile.splice(fileIdx, 1);
        this.currentGraphFile.unshift(delFile[0]);
        this.parseLock(this.currentGraphFile, 0);
    }
    /**
     * 锁图 节点间的连线
     * @param links links
     * @param sourceName sourceName
     * @param targetName targetName
     * @param selIdx selIdx
     * @param index index
     * @param isLock isLock
     * @param graphData graphData
     */
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
                    const filterLockedLen = this.selGraphLinks.filter((item) => {
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
    /**
     * 获取选中文件内容
     * @param file 文件
     */
    public getContent(file: any) {
        this.diffIns.diff(file);
    }

    /**
     * 原始数据 展开列表
     * @param index index
     */
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
    /**
     * 展开列表
     */
    public toggleLeft() {
        this.leftState = !this.leftState;
    }
    /**
     * 展开列表
     */
    public beforeExpand(node: TiTreeNode): void {
        const idx = this.fileList.findIndex((e) => e === node.beforeExpandNode);
        this.openfilesToggle(idx);
    }
    /**
     * 原始数据 获取所有内容
     * @param file file
     * @param idx idx
     */
    public async getAllContent(file: any, idx?: any) {
        let preActiveFile: any;
        if (idx === 0) {
            this.activeFile = idx;
        } else {
            idx = this.fileList.findIndex(e => e === file);
            preActiveFile = this.activeFile;
        }
        if (!file.content) {
            await this.getFileData(file.startTime);
        }
        $('#tree li div').removeClass('ti3-tree-item-active');
        this.activeFile = idx;
        this.diffIns.diff(file);
    }
    /**
     * 原始数据 打开对应的 小段内容
     * @param file file
     * @param fileIndex fileIndex
     * @param index index
     */
    public getCurrentFile(file: any, fileIndex: any, index: any) {
        this.currentFile = file.files[fileIndex];
        this.fileList[index].files.forEach((item: any) => {
            item.isActive = false;
        });
        this.fileList[index].files[fileIndex].isActive = true;
        this.diffIns.diff(this.currentFile);
    }
    /**
     * 下拉框 改变锁图和原始数据
     * @param data data
     */
    public typeChange(data: any) {
        if (this.preSelectedId === data.id) {
            return;
        }
        if (data.id === 'raw') {
            const preActiveFile = this.activeFile;
            this.activeFile = this.activeGraph >= 0 ? this.activeGraph : 0;
            this.getAllContent(this.fileList[this.activeFile], this.activeFile);
            this.isChangeType = true;
            setTimeout(() => {
                this.selectTreeNode(preActiveFile, this.activeFile);
            }, 0);
        } else {
            this.activeGraph = this.activeFile >= 0 ? this.activeFile : 0;
            this.getFileDataAndShowLock(this.fileList[this.activeGraph], this.activeGraph);
            if (this.draggableEl) {
              this.onSetDraggable();
            }
        }
        this.preSelectedId = data.id;
    }
    /**
     * 选中节点
     * @param preIndex 上一个选中的位置
     * @param index 位置
     */
    public selectTreeNode(preIndex: number, index: number) {
        let stackTreeNodes = $('.ti3-tree-content-box:visible');
        if ((self as any).webviewSession.getItem('tuningOperation') === 'hypertuner') {
            stackTreeNodes = $('.ti3-tree-node-text-wrapper:visible');
        }
        if (preIndex >= 0) {
            stackTreeNodes.eq(preIndex).removeClass('ti3-tree-item-active');
        }
        stackTreeNodes.eq(index).addClass('ti3-tree-item-active');
    }
    /**
     * 锁图 切换时间段
     * @param file file
     * @param idx idx
     */
    public async getFileDataAndShowLock(file: any, idx: any) {
        if (!file.content) {
            await this.getFileData(file.startTime);
        }
        this.changeParseSel(this.fileList[idx], idx);
    }
    /**
     * 锁图 下拉框
     * @param file file
     * @param idx idx
     */
    public changeParseSel(file: any, idx: any) {
        this.currentGraphFile = file.files; // 数据数组
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
        return (self as any).webviewSession.getItem('recordId');
    }

    private dateFormat(date: any, fmt: any) {
        const getDate = new Date(date);
        const o = {
            'M+': getDate.getMonth() + 1,
            'd+': getDate.getDate(),
            'h+': getDate.getHours(),
            'm+': getDate.getMinutes(),
            's+': getDate.getSeconds(),
            'q+': Math.floor((getDate.getMonth() + 3) / 3),
            S: getDate.getMilliseconds()
        };
        if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(
                RegExp.$1,
                (getDate.getFullYear() + '').substr(4 - RegExp.$1.length)
            );
        }
        for (const k in o) {
            if (new RegExp('(' + k + ')').test(fmt)) {
                fmt = fmt.replace(
                    RegExp.$1,
                    RegExp.$1.length === 1
                        ? (o as any)[k]
                        : ('00' + (o as any)[k]).substr(('' + (o as any)[k]).length)
                );
            }
        }
        return fmt;
    }
    /**
     * ngAfterViewInit
     */
    ngAfterViewInit(): void {
        this.fileListWidth =
            parseInt(this.el.nativeElement.querySelector('.list-content').clientWidth, 10) - 50;
        let tempDraggable = setInterval(() => {
          if (this.draggableEl) {
              this.onSetDraggable();
              clearInterval(tempDraggable);
              tempDraggable = null;
          }
        }, 200);
    }
    /**
     * ngAfterViewChecked
     */
    ngAfterViewChecked(): void {
        const fileList = this.el.nativeElement.querySelectorAll(
            '.item-child-container .item-child span.overflow-class'
        );
        for (const item of fileList) {
            if (item.offsetWidth > this.fileListWidth) {
                const width = item.offsetWidth;
                const text = item.innerHTML;
                const index = text.lastIndexOf('/');
                this.fileNameFix = text.slice(index);
                item.nextElementSibling.innerHTML = this.fileNameFix;
                const fileNameFixWidth = item.nextElementSibling.offsetWidth;
                item.style.width =
                    this.fileListWidth - fileNameFixWidth - 32 + 'px';
                item.style.display = 'inline-block';
                item.parentElement.title = text;
            }
        }
    }
    /**
     * 切换页签时缓存数据
     */
    ngOnDestroy() {
        clearTimeout(this.getDataTimer);
        this.getDataTimer = null;
        this.downloadService.downloadItems.thread.data = this.fileList;
        this.downloadService.downloadItems.thread.isFinish = this.finishThread;
        if (this.wsFinishSub) { this.wsFinishSub.unsubscribe(); }
    }

    /**
     * handleFileNewData
     * @param file file
     */
    public handleFileNewData(file: any) {
        this.lockGraph.handleFileNewData(file);
    }
    /**
     * obersverSelectChange
     * @param obersver obersver
     */
    public obersverSelectChange(obersver: any) {
        if ( (self as any).webviewSession.getItem('tuningOperation') === 'hypertuner'){
          this.obersverSelect = obersver.value;
          this.viewModel = obersver.label;
          $('.obersver .menuList').css('display', 'none');
          this.viewDownFlag = false;
        }
        this.lockGraph.currentTypeChange(obersver.value);
        if (this.compareSwitch) {
            this.obersverSelectChange2(obersver);
        }
    }
    /**
     * obersverSelectChange2
     * @param obersver obersver
     */
    public obersverSelectChange2(obersver: any) {
        if (obersver.value === 'lock') {
            this.lockGraph2.currentTypeChange('thread');
        } else {
            this.lockGraph2.currentTypeChange('lock');
        }
    }
    /**
     * compareSwitchChange
     */
    public compareSwitchChange() {
        const len = this.compareOptions.length;
        for (let i = 0; i < len; i++) {
            const item = this.compareOptions[i];
            if (item.disabled === true) {
                const index = i === (len - 1) ? i - 1 : i + 1;
                this.compareSelect = this.compareOptions[index];
                this.compareModel = this.compareOptions[index];
                setTimeout(() => {
                    return this.compareSelectChange(this.compareSelect);
                }, 0);
                return;
            }
        }
    }
    /**
     * compareSelectChange
     */
    public async compareSelectChange(compare: any) {
        if ( (self as any).webviewSession.getItem('tuningOperation') === 'hypertuner'){
          this.compareModel = compare.label;
          $('.compare .menuList').css('display', 'none');
          this.compareDownFlag = false;
        }
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
    /**
     * handleCompareList
     * @param idx idx
     */
    public handleCompareList(idx: any) {
        this.compareOptions = this.fileList.map((item, index) => {
            return { label: item.name, value: index, disabled: index === idx, startTime: item.startTime };
        });
        if (!this.compareSelect) {
            this.compareSelect = this.compareOptions[idx];
            this.compareThreadTime = this.compareSelect.name;
        }
    }
    /**
     * getSamplingData
     * @param type type
     * @param data data
     */
    private getSamplingData(type: any, data: any) {
        const uuid = Utils.generateConversationId(8);
        const requestUrl = `/user/queue/sample/records/${encodeURIComponent(data)}/${encodeURIComponent(uuid)}/${type}`;
        this.stompService.subscribeStompFn(requestUrl);
        this.stompService.startStompRequest('/cmd/sub-record', {
            recordId: data,
            recordType: type.toUpperCase(),
            uuid
        });
    }
    /**
     * importCache
     */
    public importCache() {
        this.fileList = this.downloadService.downloadItems.thread.data;
        this.finishThread = this.downloadService.downloadItems.thread.isFinish;
    }
    /**
     * 设置可拖拽以及鼠标滚轮事件
     */
    public onSetDraggable() {
        this.dragService.create({
            helper: this.draggableEl?.nativeElement
        });
        // 绑定鼠标滑轮
        this.renderer2.listen(this.draggableEl?.nativeElement, 'wheel', this.onScrollZoom);
    }
    /**
     * 鼠标滚轮放大缩小
     */
    public onWheelShowZoom(num: number) {
        this.wheelShowScale *= num;
        // 绑定鼠标滑轮
        this.renderer2.setStyle(this.draggableEl?.nativeElement, 'transform', `scale(${this.wheelShowScale})`);
    }
    /**
     * 鼠标滚轮放大缩小事件
     */
    public onScrollZoom = (e: any) => {
        e.wheelDelta > 0 || e.detail > 0 ? this.onWheelShowZoom(1.1) : this.onWheelShowZoom(0.9);
    }
    /**
     * 放大缩小按钮返回的数据
     */
     public onZoomParam(num: number) {
      this.wheelShowScale = num;
    }
    /**
     * 是否全屏状态
     */
    public onZoomStatus(status: boolean, type?: string) {
        if (status) { // 放大缩小状态
            if (this.currTheme === this.ColorTheme.Dark) {
              const backgroundColor = (self as any).webviewSession.getItem('tuningOperation') === 'hypertuner'
                ? '#313335' : '#272727';
              this.renderer2.setStyle(this.showFullEl.nativeElement, 'background-color', backgroundColor);
            } else {
              this.renderer2.setStyle(this.showFullEl.nativeElement, 'background-color', '#fff');
            }
            this.renderer2.setStyle(this.showFullEl.nativeElement, 'padding', '0px 48px');
            $('.profile-tabs').css('display', 'none');
            $('.cpu-detail-tab').css('display', 'none');
            $('.leftListHeader').css('display', 'none');
            $('.list-content').css('padding-top', '26px');
            $('.main-container-sample').css('padding', '0px');
            $('.method-box').css('padding', '0px');
            $('.select-box').css('display', 'none');
            this.leftState = true;
            this.isFullScreen = true;
        } else {
            this.renderer2.setStyle(this.showFullEl.nativeElement, 'background-color', 'initial');
            this.renderer2.setStyle(this.showFullEl.nativeElement, 'padding', '0px');
            $('.leftListHeader').css('display', 'block');
            $('.profile-tabs').css('display', 'flex');
            $('.cpu-detail-tab').css('display', 'block');
            $('.main-container-sample').css('padding', '40px 56px 0 80px');
            $('.method-box').css('padding', '20px 0 40px 0');
            $('.select-box').css('display', 'flex');
            this.leftState = false;
            this.isFullScreen = false;
            if ((self as any).webviewSession.getItem('tuningOperation') === 'hypertuner' && type === 'keyupEsc') {
                this.renderer2.setStyle(this.showFullEl.nativeElement, 'background-color',
                  this.currTheme === this.ColorTheme.Dark ? '#313335' : '#fff');
                this.renderer2.setStyle(this.showFullEl.nativeElement, 'padding', '0px');
                $('.main-container-sample').css('padding', '23px 32px');
                this.leftState = false;
                this.isFullScreen = false;
                this.onExitFullScreen(document);
            }
        }
    }

    /**
     * 比较下拉框
     */
    compareMenuList(){
      this.compareOptions.map(item => {
        if (item.label === this.compareModel){
          item.isChecked = true;
        } else {
          item.isChecked = false;
        }
      });
      if (this.compareDownFlag){
        $('.compare .menuList').css('display', 'none');
        this.compareDownFlag = false;
      } else {
        $('.compare .menuList').css('display', 'block');
        this.compareDownFlag = true;
      }
    }
    /**
     * 展示下拉框
     */
    showMenuList(){
      this.obersverOptions.map(item => {
        if (item.label === this.viewModel){
          item.isChecked = true;
        } else {
          item.isChecked = false;
        }
      });
      if (this.viewDownFlag){
        $('.obersver .menuList').css('display', 'none');
        this.viewDownFlag = false;
      } else {
        $('.obersver .menuList').css('display', 'block');
        this.viewDownFlag = true;
      }
    }
    /**
     * 退出全屏
     * @param element dom
     */
    private onExitFullScreen(element: any) {
      if (element.exitFullscreen) {
        element.exitFullscreen();
      } else if (element.webkitExitFullscreen) {
        element.webkitExitFullscreen();
      } else if (element.mozCancelFullScreen) {
        element.mozCancelFullScreen();
      } else if (element.msExitFullscreen) {
        element.msExitFullscreen();
      }
    }
}
