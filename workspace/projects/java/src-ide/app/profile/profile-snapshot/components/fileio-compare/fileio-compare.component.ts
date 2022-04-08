import { Component, OnInit, Output, Input, EventEmitter, ViewChild } from '@angular/core';
import { TiTableColumns, TiTableRowData, TiTableSrcData, TiTreeNode,
   TiTreeUtil, TiTreeComponent, TiTableComponent } from '@cloud/tiny3';
import { I18nService } from '../../../../service/i18n.service';
import { ProfileDownloadService } from '../../../../service/profile-download.service';
import { LibService } from '../../../../service/lib.service';
import { COLOR_THEME, VscodeService } from '../../../../service/vscode.service';
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
    @ViewChild('fileioTimeLine', { static: false }) fileioTimeLine: any;
    @ViewChild('leftTableComp', { static: false }) leftTableComp: TiTableComponent;
    @ViewChild('rightTableComp', { static: false }) rightTableComp: TiTableComponent;
    constructor(
        public i18nService: I18nService,
        public libService: LibService,
        private downloadService: ProfileDownloadService,
        private vscodeService: VscodeService
    ) {
        this.i18n = this.i18nService.I18n();
        this.echartsTitle = this.i18n.io.fileIo.fileIORate;
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
                width: '200px',
                isSort: true,
                sortKey: 'duration',
                show: true
            },
            {
                title: this.i18n.profileMemorydump.snapShot.fileIo.IOTotalTime,
                width: '180px',
                isSort: true,
                sortKey: 'duration',
                show: true
            },
            {
                title: this.i18n.profileMemorydump.snapShot.fileIo.BSnapshotCount,
                width: '150px',
                isSort: true,
                sortKey: 'count',
                show: true
            },
            {
                title: this.i18n.profileMemorydump.snapShot.fileIo.CountComparison,
                width: '150px',
                isSort: true,
                sortKey: 'count',
                show: true
            },
            {
                title: this.i18n.profileMemorydump.snapShot.fileIo.BRCount,
                width: '180px',
                isSort: true,
                sortKey: 'rCount',
                show: true
            },
            {
                title: this.i18n.profileMemorydump.snapShot.fileIo.RCount,
                width: '180px',
                isSort: true,
                sortKey: 'rCount',
                show: true
            },
            {
                title: this.i18n.profileMemorydump.snapShot.fileIo.BWCount,
                width: '180px',
                isSort: true,
                sortKey: 'wCount',
                show: true
            },
            {
                title: this.i18n.profileMemorydump.snapShot.fileIo.WCount,
                width: '180px',
                isSort: true,
                sortKey: 'wCount',
                show: true
            },
            {
                title: this.i18n.profileMemorydump.snapShot.fileIo.BRBytes,
                width: '200px',
                isSort: true,
                sortKey: 'rByte',
                show: true
            },
            {
                title: this.i18n.profileMemorydump.snapShot.fileIo.RBytes,
                width: '180px',
                isSort: true,
                sortKey: 'rByte',
                show: true
            },
            {
                title: this.i18n.profileMemorydump.snapShot.fileIo.BWBytes,
                width: '200px',
                isSort: true,
                sortKey: 'wByte',
                show: true
            },
            {
                title: this.i18n.profileMemorydump.snapShot.fileIo.WBytes,
                width: '180px',
                isSort: true,
                sortKey: 'wByte',
                show: true
            },
        ];
        // 右侧
        this.columnsTableTime = [{
            title: this.i18n.io.fileIo.threadName,
            width: '110px',
            sortKey: 'threadName',
            fixed: 'left'
        },
        {
            title: this.i18n.profileMemorydump.snapShot.fileIo.ownSnapshot,
            width: '150px',
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
            width: '150px',
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
            width: '200px',
            isSort: true,
            sortKey: 'start'
        },
        {
            title: this.i18n.io.fileIo.rAndWBytes,
            width: '200px',
            isSort: true,
            sortKey: 'byte'
        },
        {
            title: this.i18n.io.fileIo.eventRate,
            width: '150px',
            isSort: true,
            sortKey: 'rate'
        },
        {
            title: this.i18n.io.fileIo.duration,
            width: '150px',
            isSort: true,
            sortKey: 'duration'
        }];
        this.leftTable.searchOptions = [
            {
                label: this.i18n.plugins_perf_java_profiling_fileIO_path,
                value: 'filePath'
            }
        ];
        this.rightTable.searchOptions = [
            {
                label: this.i18n.io.fileIo.threadName,
                value: 'threadName'
            }
        ];
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
    public searchKeys: Array<string> = [];
    public closeOtherDetails = true;
    public currentFdTableList: Array<any> = [];
    public currentFdTableListTop: Array<any> = [];
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
    public dataLimit = {
        limitTime: '',
        limitData: '',
        primaryTime: null as any,
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
    public echartsData = {
        timeList: [] as any[],
        readSpeed: [] as any[],
        writeSpeed: [] as any[]
    };
    public snapShot: any;
    public snapShotADataFile: Array<any> = [];
    public snapShotBDataFile: Array<any> = [];
    public snapShotAthreshold: string;
    public snapShotBthreshold: string;
    public fileNameMap = {};
    public fileIOEcharts: any;
    public compareEchartsData = {
        timeList: [] as any[],
        timeAList: [] as any[],
        timeBList: [] as any[],
        ReadSpeedA: [] as any[],
        WeadSpeedA: [] as any[],
        ReadSpeedB: [] as any[],
        WeadSpeedB: [] as any[]
    };
    public comparedDatas: Array<any> = [];
    public tablePath: string;
    public timeData: any = [];
    public leftTable: {
        pageNo: number,
        total: number,
        pageSize: object,
        searchOptions: Array<any>,
        searchWords: Array<any>,
        searchKeys: Array<any>,
    } = {
            pageNo: 1,
            total: 0,
            pageSize: {
                options: [10, 20, 50, 100],
                size: 10
            },
            searchOptions: [],
            searchWords: [],
            searchKeys: []
        };
    public rightTable: {
        pageNo: number,
        total: number,
        pageSize: object,
        searchOptions: Array<any>,
        searchWords: Array<any>,
        searchKeys: Array<any>,
    } = {
            pageNo: 1,
            total: 0,
            pageSize: {
                options: [10, 20, 50, 100],
                size: 10
            },
            searchOptions: [],
            searchWords: [],
            searchKeys: []
        };
    public isColSetHover = false;
    public colHoverImg = 'url("./assets/img/newSvg/icon_expand_hover_dark.svg") no-repeat';
    public colNormalImg = 'url("./assets/img/newSvg/icon_expand_normal_dark.svg") no-repeat';
    public currTheme: any;
    public colorTheme = {
        Dark: COLOR_THEME.Dark,
        Light: COLOR_THEME.Light
    };
    public isIntellij: boolean = (self as any).webviewSession.getItem('tuningOperation') === 'hypertuner';
    /**
     * 初始化
     */
    ngOnInit(): void {
        // 获取VSCode当前主题颜色
        if (document.body.className.indexOf('vscode-light') !== -1) {
            this.currTheme = COLOR_THEME.Light;
        } else {
            this.currTheme = COLOR_THEME.Dark;
        }
        // VSCode主题颜色切换时调用
        this.vscodeService.regVscodeMsgHandler('colorTheme', (msg: any) => {
            this.currTheme = msg.colorTheme;
        });

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
        // 设置初始化第一列、第二列 headfilter 的选中项
        this.columnsTableTime[1].selected = [
            this.columnsTableTime[1].options[0], this.columnsTableTime[1].options[1],
            this.columnsTableTime[1].options[2]
        ];
        this.columnsTableTime[2].selected = [
            this.columnsTableTime[2].options[0], this.columnsTableTime[2].options[1],
            this.columnsTableTime[2].options[2], this.columnsTableTime[2].options[3]
        ];
        this.snapshotA = this.prevHeapLabel;
        this.snapshotB = this.currentHeapLabel;
        if (this.downloadService.downloadItems.snapShot.snapShotData) {
            if (this.isIntellij){
              if (typeof this.downloadService.downloadItems.snapShot.snapShotData === 'string'){
                this.snapShot = JSON.parse(this.downloadService.downloadItems.snapShot.snapShotData);
              } else {
                this.snapShot = this.downloadService.downloadItems.snapShot.snapShotData;
              }
            }
            if (!this.isIntellij){
              this.snapShot = JSON.parse(this.downloadService.downloadItems.snapShot.snapShotData);
            }
            this.snapShotData(this.snapShot);
            this.handleSortCompare(this.snapShotADataFile, this.snapShotBDataFile);
            this.comparedDatas = this.handleFileOriData(this.snapShotADataFile, this.snapShotBDataFile);
            this.comparedDatas.map((item) => {
                item.showDetails = false;
            });
            this.srcDataTable.data = this.comparedDatas;
        }
        this.leftTable.total = this.srcDataTable.data.length;
        this.handleFileClicked(this.srcDataTable.data[0], 0);
    }
    /**
     * 快照切换
     */
    public toggleSnapshotIN() {
        const obj = {
            A: this.snapshotA,
            B: this.snapshotB
        };
        this.childTGSnapshotIN.emit(obj);
    }
    /**
     * 列动态显示隐藏
     */
    public onSelectToggle(): void {
        let InstanceNumL = 0;
        let HeapNumL = 0;
        this.columnsTable.forEach((e) => {
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

    /**
     * 获取快照数据
     */
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

    private showLoding() {
        document.getElementById('sample-loading-box').style.display = 'flex';
    }
    private closeLoding() {
        document.getElementById('sample-loading-box').style.display = 'none';
    }
    /**
     * 遍历查找两个日期快照的数据
     * @param snapShot 所有快照数据
     */
    public snapShotData(snapShot: any) {
        this.showLoding();
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
     * 对比数据
     */
    public handleSortCompare(base: any, compare: any) {
        this.baseData = this.sortAOrB(base, 'A');
        this.compareData = this.sortAOrB(compare, 'B');
    }
    /**
     * 搜索
     */
    public searchEvent(event: any, type: any): void {
        if (type === 'left') {
            this.leftTable.searchKeys[0] = event.key;
            this.leftTable.searchWords[0] = event.value;
            setTimeout(() => {
                this.leftTable.total = this.leftTableComp.getSearchedResult().length;
            }, 10);
        } else {
            this.rightTable.searchKeys[0] = event.key;
            this.rightTable.searchWords[0] = event.value;
            setTimeout(() => {
                this.rightTable.total = this.rightTableComp.getSearchedResult().length;
            }, 10);
        }
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
                if (Object.prototype.hasOwnProperty.call(compareData, 'filePath')) {
                    return compareData.filePath === item.filePath;
                }
                if (Object.prototype.hasOwnProperty.call(compareData, 'fd')) {
                    return compareData.fd === item.fd;
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
                if (Object.prototype.hasOwnProperty.call(compareFile, 'fd')) {
                    compareFile.options = this.threadCompare(item.options, compareFile.options);
                }
            }
            for (const key in compareFile) {
                if (Object.prototype.hasOwnProperty.call(compareFile, key) && typeof compareFile[key] === 'number') {
                    compareFile.compare[key] = compareFile[key] - item[key];
                }
            }
            if (item.children && compareFile && compareFile.children) {
                this.handleFileOriData(item.children, compareFile.children);
            }
        });
        return compare;
    }
    private threadCompare(base: any, compare: any) {
        base.forEach((baseThread: any) => {
            const compareThread = compare.find((compThread: any) => {
                return compThread.threadName === baseThread.threadName &&
                 compThread.originTime === baseThread.originTime
                    && compThread.type === baseThread.type;
            });
            if (!compareThread) {

            } else {
                compareThread.own = 'A&B';
            }
        });
        return compare;
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
        this.currnetEchartsData.readSpeed = this.currnetEchartsData.readCount === 0 ? 0.000 :
            +(this.currnetEchartsData.readSpeed / this.currnetEchartsData.readCount).toFixed(2);
        this.currnetEchartsData.writeSpeed = this.currnetEchartsData.writeCount === 0 ? 0.000 :
            +(this.currnetEchartsData.writeSpeed / this.currnetEchartsData.writeCount).toFixed(2);
        this.handleEchartsData(this.currnetEchartsData, own);
        this.currnetEchartsData.readCount = 0;
        this.currnetEchartsData.writeCount = 0;
        this.currnetEchartsData.readSpeed = 0;
        this.currnetEchartsData.writeSpeed = 0;
        this.currnetEchartsData.startTime = '';
    }
    /**
     * 更新当前echarts
     * @param echartsData 数据
     */
    public handleEchartsData(echartsData: any, own?: any) {
        const readSpeed = echartsData.readSpeed;
        const writeSpeed = echartsData.writeSpeed;
        const bigger = Math.max(+writeSpeed, +readSpeed);
        this.echartsLabelTop = Math.max(this.echartsLabelTop, bigger);
        this.echartsLabelTop = this.echartsLabelTop.toFixed(2);
        this.supplementDis(echartsData.startTime, own);
        this.reduceEchartsData(echartsData.startTime, readSpeed, writeSpeed, own);
    }
    /**
     * 如果当前数据时间比上一个数据时间的差多1s的倍数时，差值设置为0
     * @param time 当前数据时间
     */
    private supplementDis(time: string, own?: any) {
        const len: any[] = [];
        let timeList = [];
        if (own === 'A') {
            timeList = this.compareEchartsData.timeAList;
        } else {
            timeList = this.compareEchartsData.timeBList;
        }
        timeList.forEach((item) => {
            if (item !== '') {
                len.push(item);
            }
        });
        if (!len.length) { return; }
        const year = new Date().getFullYear();
        const date = new Date().getMonth() + 1;
        const day = new Date().getDate();
        const newDate = `${year}/${date}/${day} `;
        const nowTime = (new Date(newDate + time)).getTime();
        const lastTime = (new Date(newDate + len[len.length - 1])).getTime();
        const diff = Math.floor((nowTime - lastTime) / 1000);
        if (diff > 1) {
            let count = 1;
            while (count <= diff - 1) {
                this.reduceEchartsData(this.libService.dateFormat(lastTime + (count * 1000), 'hh:mm:ss'), 0, 0, own);
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
     * 更新当前行数据的线程列表信息
     * @param fileName 当前行数据
     */
    public handleUpdateThreads(fileName: any) {
        let threadsList: any[] = [];
        if (this.snapshotType === 'pFileIO') {
            fileName.children.forEach((item: any) => {
                if (!this.currentEchartsIsFile && item.fd !== this.currentEchartsFdName) { return; }
                threadsList = threadsList.concat(item.options);
            });
        } else if (this.snapshotType === 'pSocketIO') {
            fileName.children.forEach((host: { children: any[] }) => {
                host.children.forEach((fd) => {
                    threadsList = threadsList.concat(fd.options);
                });
            });
        }
        this.srcDataTableTime.data = threadsList;
        this.rightTable.total = this.srcDataTableTime.data.length;
        this.dataTableTime = threadsList;
        this.onTypeSelect();
    }
    /**
     * 鼠标悬浮
     */
    public onContrastHoverList(label?: any) {
        this.ContrastHover = label;
    }
    /**
     * 返回
     */
    public goBack() {
        this.childOuter.emit(false);
    }
    /**
     * 交换快照对比
     */
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
        this.comparedDatas.map((item) => {
            item.showDetails = false;
        });
        this.srcDataTable.data = this.comparedDatas;
        this.handleUpdateThreads(this.srcDataTable.data[0]);
        this.onClickRightTable(this.srcDataTableTime.data[0], 0);
        this.handleEchartsCompare();
    }
    /**
     * 触发点击事件
     */
    public handleFileClicked(file: any, i: any) {
        this.handleIsNowEcharts(true, file.filePath);
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
    public handleFileSelected(i: number) {
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
        this.handleIsNowEcharts(false, fd.fd);
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
    public handleFdSelected(i: number, idx: number) {
        this.srcDataTable.data[i].children.forEach((item: { isSelect: boolean }, index: number) => {
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
    }
    /**
     * 点击右侧小表格
     * @param row 右侧某行数据
     * @param index 所在位置
     */
    public onClickRightTable(row: any, index: number) {
        const stackTrace = 'stackTrace';
        if (!row[stackTrace]) {
            return;
        }
        this.srcDataTableTime.data.forEach((item, i) => {
            item.isSelect = index === i;
        });
        this.deExpandNode(row.stackTrace.children);
        this.handleStacktrace(row);
    }

    private deExpandNode(treeData: any): void {
        const data: Array<TiTreeNode> = treeData.concat();
        TiTreeUtil.traverse(data, traverseFn);

        function traverseFn(node: TiTreeNode): void {
            node.expanded = false;
        }
        this.stackTranceData = data;
    }

    /**
     * io时间单位
     */
    public onChangeTime(time: any): any {
        if (time < this.μs) {
            return time.toFixed(2) + 'μs';
        } else if (this.μs < time && time < this.ms) {
            return (time / this.μs).toFixed(2) + 'ms';
        } else if (this.ms < time) {
            return (time / this.ms).toFixed(2) + 's';
        }
    }
    /**
     * 选择显示列
     */
    public onTypeSelect(): void {
        console.log(this.columnsTableTime[1].selected);
        console.log(this.columnsTableTime[2].selected);
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
            this.rightTable.total = 0;
            return;
        }
        this.rightTable.total = this.srcDataTableTime.data.length;
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
     * 讲某行数据的第一条线程信息的栈数据展示
     * @param row 某行数据
     */
    public handleStacktrace(row: any) {
        this.currentStacktrace = [];
        this.stackTranceData = [];
        this.currentStacktrace = row.stackTrace.children;
        this.currentStacktrace.forEach((item, index) => {
            this.stackTranceData.push({
                label: item.label,
                expanded: false,
                children: index === 0 ? item.children : []
            });
        });
        this.handleSelectedTreeData(this.stackTranceData);
    }
    /**
     * 处理树节点数据,删除children为空的数据
     */
    handleSelectedTreeData(data: Array<any>) {
        data.forEach((item: any) => {
            if (item.children && item.children.length) {
                this.handleSelectedTreeData(item.children);
            } else {
                delete item.children;
            }
        });
        return data;
    }
    /**
     * 栈跟踪选择
     */
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
            const findChild = this.currentStacktrace.find((item) => {
                return item.label === currentTree.label;
            });
            currentTree.children = findChild ? findChild.children : [];
        }
        currentTree.expanded = true;
    }

    /**
     * 展开整个树
     */
    public expandNode(): void {
        this.currentStacktrace.forEach((item) => {
            this.getChildNodes(item);
        });
        const data: Array<TiTreeNode> = this.stackTranceData.concat();
        TiTreeUtil.traverse(data, traverseFn);
        function traverseFn(node: TiTreeNode): void {
            node.expanded = true;
        }
        this.stackTranceData = data;
    }

    /**
     * 图表数据对比，处理IO echarts数据
     */
    public handleEchartsCompare() {
        this.closeLoding();
        this.compareEchartsData.timeAList = [];
        this.compareEchartsData.timeBList = [];
        this.compareEchartsData.timeList = [];
        this.compareEchartsData.ReadSpeedA = [];
        this.compareEchartsData.WeadSpeedA = [];
        this.compareEchartsData.ReadSpeedB = [];
        this.compareEchartsData.WeadSpeedB = [];
        let threadA: any[] = [];
        let threadB: any[] = [];
        this.srcDataTableTime.data.forEach((item) => {
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
        this.compareEchartsData.timeList = [...new Set(this.compareEchartsData.timeAList.concat(
          this.compareEchartsData.timeBList))];
        this.timeData = this.compareEchartsData.timeList;
        this.fullEchartsData('A', threadAFirstTime);
        this.fullEchartsData('B', threadBFirstTime);
        this.initEchart();
    }
    private fullEchartsData(own: any, firstTime: any) {
        const index = this.compareEchartsData.timeList.findIndex((item) => {
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
        const timeColor = this.currTheme === COLOR_THEME.Light ? '#616161' : '#aaaaaa';
        const textColor = this.currTheme === COLOR_THEME.Light ? '#222222' : '#E8E8E8';
        const bgColor = this.currTheme === COLOR_THEME.Light ? '#ffffff' : '#424242';
        const axisLineColor = this.currTheme === COLOR_THEME.Light ? '#E1E6EE' : '#484A4E';
        const that = this;
        this.echartsOption = {
            tooltip: {
                borderWidth: 0,
                trigger: 'axis',
                backgroundColor: bgColor,
                borderRadius: 5, // 边框圆角
                extraCssText: 'box-shadow: 0px 4px 8px 0px rgba(0, 0, 0, .2);',
                padding: [12, 16, 12, 16],
                formatter: (params: any) => {
                    if (params.length > 0) {
                        let html = ``;
                        html += `<div><div style="color:${timeColor}">${params[0].axisValueLabel}</div>`;
                        params.forEach((param: any, index: number) => {
                            html += `
                                    <div style='margin-top:10px'>
                                        <span style="display: inline-block;width: 8px;height: 8px;
                                        background-color: ${param.color};
                                        margin-right: 3px;"></span>
                                        <span style='width:150px;display:inline-block;
                                        color:${textColor}'>${param.seriesName}</span>
                                        <span style="color:${textColor}">
                                        ${that.libService.onChangeUnit(param.data * 1024)}/s</span>
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
                    this.i18n.profileMemorydump.snapShot.fileIo.ARrate,
                    this.i18n.profileMemorydump.snapShot.fileIo.AWrate,
                    this.i18n.profileMemorydump.snapShot.fileIo.BRrate,
                    this.i18n.profileMemorydump.snapShot.fileIo.BWrate
                ],
                x: 'right',
                padding: [
                    5,  // 上
                    5, // 右
                    70,  // 下
                    5 // 左
                ],
                textStyle: {
                    color: textColor
                }
            },
            grid: {
                left: this.isIntellij ? '10' : '0',
                right: '40',
                bottom: this.isIntellij ? '10' : '0',
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
                        borderWidth: '10'
                    }
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
                            color: axisLineColor,
                            width: 2
                        }
                    },
                    axisLabel: {
                        padding: [11, 0, 0, 0],
                        textStyle: {
                            color: textColor
                        },
                    },
                    axisTick: {
                        show: true,
                        color: axisLineColor,
                        width: 2,
                        length: 8
                    },
                    data: this.compareEchartsData.timeList
                }
            ],
            yAxis: [
                {
                    type: 'value',
                    show: true,
                    min: 0,
                    max: this.echartsLabelTop,
                    interval: this.echartsLabelTop,
                    splitLine: {
                        show: true,
                        lineStyle: {
                            type: 'solid',
                            color: axisLineColor,
                        }
                    },
                    axisLabel: {
                        show: true,
                        color: textColor,
                        formatter: (value: any) => {
                            return `${that.libService.onChangeUnit(value * 1024)}/s`;
                        }
                    },
                    axisLine: {
                        show: false,
                    },
                    axisTick: {
                        show: false
                    }
                }
            ],
            series: [
                {
                    id: 'series1',
                    name: this.i18n.profileMemorydump.snapShot.fileIo.ARrate,
                    type: 'line',
                    itemStyle: {
                        normal: {
                            color: '#3d7ff3'
                        }
                    },
                    areaStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                            offset: 0,
                            color: 'rgba(38,125,255,0.3)'
                        }, {
                            offset: 1,
                            color: 'rgba(38,125,255,0.04)'
                        }])
                    },
                    lineStyle: {
                        color: '#3d7ff3'
                    },
                    smooth: false,
                    data: this.compareEchartsData.ReadSpeedA
                },
                {
                    id: 'series2',
                    name: this.i18n.profileMemorydump.snapShot.fileIo.AWrate,
                    type: 'line',
                    itemStyle: {
                        normal: {
                            color: '#298a5f'
                        }
                    },
                    areaStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                            offset: 0,
                            color: 'rgba(0,191,201,0.3)'
                        }, {
                            offset: 1,
                            color: 'rgba(0,191,201,0.04)'
                        }])
                    },
                    lineStyle: {
                        color: '#298a5f'
                    },
                    smooth: false,
                    data: this.compareEchartsData.WeadSpeedA
                },
                {
                    id: 'series3',
                    name: this.i18n.profileMemorydump.snapShot.fileIo.BRrate,
                    type: 'line',
                    itemStyle: {
                        normal: {
                            color: '#c0691c'
                        }
                    },
                    areaStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                            offset: 0,
                            color: 'rgba(38,125,255,0.3)'
                        }, {
                            offset: 1,
                            color: 'rgba(38,125,255,0.04)'
                        }])
                    },
                    lineStyle: {
                        color: '#c0691c'
                    },
                    smooth: false,
                    data: this.compareEchartsData.ReadSpeedB
                },
                {
                    id: 'series4',
                    name: this.i18n.profileMemorydump.snapShot.fileIo.BWrate,
                    type: 'line',
                    itemStyle: {
                        normal: {
                            color: '#8739db'
                        }
                    },
                    areaStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                            offset: 0,
                            color: 'rgba(0,191,201,0.3)'
                        }, {
                            offset: 1,
                            color: 'rgba(0,191,201,0.04)'
                        }])
                    },
                    lineStyle: {
                        color: '#8739db'
                    },
                    smooth: false,
                    data: this.compareEchartsData.WeadSpeedB
                }
            ]
        };
        setTimeout(() => {
            this.fileIOEcharts = (echarts as any).init(document.getElementById('fileIOEcharts'));
            this.fileIOEcharts.setOption(this.echartsOption);
            window.onresize = this.fileIOEcharts.resize;
            this.fileIOEcharts.on('datazoom', (params: { batch: any[] }) => {  // 放大缩小时调用接口
                this.fileioTimeLine.dataConfig({ start: params.batch[0].start, end: params.batch[0].end });
            });
        }, 0);
    }
    /**
     * toggleLeft
     */
    public toggleLeftResize() {
        setTimeout(() => {
            this.fileIOEcharts.resize();
        }, 100);
    }
    /**
     * 获取时间轴
     */
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
