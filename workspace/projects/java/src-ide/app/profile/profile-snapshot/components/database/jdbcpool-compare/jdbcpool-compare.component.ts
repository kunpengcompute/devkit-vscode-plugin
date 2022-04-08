import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { MytipService } from '../../../../../service/mytip.service';
import { TiTableColumns, TiTableRowData, TiTableSrcData, TiTreeNode, TiTreeUtil } from '@cloud/tiny3';
import { I18nService } from '../../../../../service/i18n.service';
import { ProfileDownloadService } from '../../../../../service/profile-download.service';
import { LibService } from '../../../../../service/lib.service';
import { COLOR_THEME, VscodeService } from '../../../../../service/vscode.service';
import * as echarts from 'echarts/core';

@Component({
    selector: 'app-jdbcpool-compare',
    templateUrl: './jdbcpool-compare.component.html',
    styleUrls: ['./jdbcpool-compare.component.scss']
})
export class JdbcpoolCompareComponent implements OnInit {
    @ViewChild('timeLineDetail', { static: false }) timeLineDetail: ElementRef;
    @Input() currentHeapLabel: any;
    @Input() prevHeapLabel: any;
    @Input() snapshotType: any;
    @Output() private childOuter = new EventEmitter();
    @Output() private childTGSnapshotIN = new EventEmitter();
    constructor(
        public i18nService: I18nService,
        private downloadService: ProfileDownloadService,
        public mytip: MytipService,
        public libService: LibService,
        private vscodeService: VscodeService
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
    public typeOptions: any[] = [];
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
    public poolSuggest: any[] = [];
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
    public data: any[] = [];
    public startTime = +new Date();
    public categories: any = [];
    public types: any[] = [];
    public seriesData: any[] = [];
    public updateOptions: any;
    public connectOwnerThread: any;
    public echartsOption: any = {};

    public noDataMsg = '';
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
    public timeData: any[] = [];  // 时间轴
    public timeData1: any[] = [];  // 时间轴
    public echartsInstance: any = {};
    public indexStart: number;
    public indexEnd: number;
    public scrollTop = 0;
    public ColorTheme = {
        Dark: COLOR_THEME.Dark,
        Light: COLOR_THEME.Light
    };
    public currTheme = COLOR_THEME.Dark;
    public aNormal = '';
    public aThreshold = '';
    public bNormal = '';
    public bThreshold = '';
    public isColSetHover = false;
    public colHoverImg = 'url("./assets/img/newSvg/icon_expand_hover_dark.svg") no-repeat';
    public colNormalImg = 'url("./assets/img/newSvg/icon_expand_normal_dark.svg") no-repeat';
    public snapShotAthreshold: string;
    public snapShotBthreshold: string;
    public alertAThreshold: any; // 报警阈值
    public alertBThreshold: any; // 报警阈值
    public isIntellij = (self as any).webviewSession.getItem('tuningOperation') === 'hypertuner';
    /**
     * 初始化
     */
    ngOnInit(): void {
        // 获取VSCode当前主题颜色
        if (document.body.className.includes('vscode-light')) {
            this.currTheme = COLOR_THEME.Light;
        } else {
            this.currTheme = COLOR_THEME.Dark;
        }
        // VSCode主题颜色切换时调用
        this.vscodeService.regVscodeMsgHandler('colorTheme', (msg: any) => {
            this.currTheme = msg.colorTheme;
        });
        this.aNormal = this.i18n.profileMemorydump.snapShot.jdbcpool.AnormalRun;
        this.bNormal = this.i18n.profileMemorydump.snapShot.jdbcpool.BnormalRun;
        this.aThreshold = this.i18n.profileMemorydump.snapShot.jdbcpool.AthresholdAlert;
        this.bThreshold = this.i18n.profileMemorydump.snapShot.jdbcpool.BthresholdAlert;
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
        if (this.snapShot) { return; }

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
    }

    /**
     * 自定义echarts系列
     * @param params 参数
     * @param api api
     */
    public renderItem(params: any, api: any) {
        const categoryIndex = api.value(0);
        const start = api.coord([api.value(1), categoryIndex]);
        const end = api.coord([api.value(2), categoryIndex]);
        const height = api.size([0, 1])[1] * 0.6;
        const duration = end[0] - start[0];
        const rectShape = echarts.graphic.clipRectByRect({
            x: start[0],
            y: start[1] - height / 2,
            width: duration > 0 ? duration + 10 : duration,
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
    /**
     * hover
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
     * 选择列
     */
    public onSelectToggle(): void {
        let InstanceNumL = 0;
        let HeapNumL = 0;
        this.columnsTable.forEach((e) => {
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

    /**
     * toggleSnapshotIN
     */
    public toggleSnapshotIN() {
        const obj = {
            A: this.snapshotA,
            B: this.snapshotB
        };
        this.childTGSnapshotIN.emit(obj);
    }

    /**
     * 获取对比数据
     */
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
    /**
     * 格式化日期
     */
    formatDate(time: any){
      const date = new Date(time);
      let month: any = date.getMonth() + 1;
      let day: any = date.getDate();
      if (month < 10){
        month = '0' + month;
      }
      if (day < 10){
        day = '0' + day;
      }
      if (this.isIntellij) {
        return `${date.getFullYear()}/${month}/${day} ${time.split(' ')[1]}`;
      } else {
        return time;
      }
    }
    /**
     * 获取快照数据
     */
    public snapShotData(snapShot: any[]) {
        this.toggleSnapshotIN();
        this.srcDataTable.data = [];
        const dataArr = snapShot[this.snapshotType].children;
        const itemArr: any[] = [];
        dataArr.forEach((item: any) => {
            if (item.label === this.snapshotA) {
                this.snapShotAthreshold = item.value.threshold;
                this.alertAThreshold = item.value.alertThreshold;
                this.snapShotADataFile = item.value.file;
                itemArr.push(Object.assign({ ...item }, { tag: 'A' }));
            } else if (item.label === this.snapshotB) {
                this.snapShotBthreshold = item.value.threshold;
                this.alertBThreshold = item.value.alertThreshold;
                this.snapShotBDataFile = item.value.file;
                this.changeColor(item);
                itemArr.push(Object.assign({ ...item }, { tag: 'B' }));
            }
        });
        this.handlePoolData(itemArr);
    }
    /**
     * 改变颜色
     */
    public changeColor(item: { value: any }) {
        item.value.series[0].data.forEach((ele: { itemStyle: any }) => {
            if (ele.itemStyle.normal.color === '#f45c5e') {
                ele.itemStyle.normal.color = '#E88B00';
            } else {
                ele.itemStyle.normal.color = '#037DFF';
            }
        });
    }
    /**
     * 处理连接池数据
     */
    public handlePoolData(itemArr: any[]) {
        const dataArr = itemArr;
        // 取最后一次保存快照的时间戳和系列
        if (dataArr[0].value.series[0].data.length > dataArr[1].value.series[0].data.length) {
            this.categories = dataArr[0].value.yAxis.data;
            this.seriesData = dataArr[0].value.series[0].data;
            this.timeData = dataArr[0].value.timeData;
        } else {
            this.categories = dataArr[1].value.yAxis.data;
            this.seriesData = dataArr[1].value.series[0].data;
            this.timeData = dataArr[1].value.timeData;
        }
        this.timeData1 = this.timeData;
        let seriesData1 = [];
        // 合并两份快照时间点相同的系列
        if (dataArr[0].value.series[0].data.length > dataArr[1].value.series[0].data.length) {
            seriesData1 = this.mergeSeriesData(dataArr[0].value.series[0].data, dataArr[1].value.series[0].data,
                dataArr[0].tag, dataArr[1].tag);
        } else {
            seriesData1 = this.mergeSeriesData(dataArr[1].value.series[0].data, dataArr[0].value.series[0].data,
                dataArr[1].tag, dataArr[0].tag);
        }

        let backGroundColor;
        let legendTextColor;
        let axisLineColor;
        if (this.currTheme === COLOR_THEME.Light) {
            backGroundColor = '#ffffff';
            legendTextColor = '#222';
            axisLineColor = '#E1E6EE';
        } else {
            backGroundColor = '#424242';
            legendTextColor = '#e8e8e8';
            axisLineColor = '#484A4E';
        }
        this.echartsOption = {
            tooltip: {
                borderWidth: 0,
                position: (point: any, params: any, dom: any, rect: any, size: any) => {
                    // 鼠标坐标和提示框位置的参考坐标系是：以外层div的左上角那一点为原点，x轴向右，y轴向下
                    // 提示框位置
                    let x = 0; // x坐标位置
                    let y = 0; // y坐标位置

                    // 当前鼠标位置
                    const pointX = point[0];
                    const pointY = point[1];

                    // 提示框大小
                    const boxWidth = size.contentSize[0];
                    const boxHeight = size.contentSize[1];
                    const echartsBoxElement = document.querySelector('#boxEchartsId') as HTMLElement;
                    echartsBoxElement.addEventListener('scroll', (e) => {
                        // 计算滚动高度
                        this.scrollTop = echartsBoxElement.scrollTop;
                    });

                    // boxWidth > pointX 说明鼠标左边放不下提示框
                    if (boxWidth > pointX) {
                        x = pointX + 5;
                    } else { // 左边放的下
                        x = pointX - boxWidth - 5;
                    }

                    // boxHeight > pointY - this.scrollTop 说明鼠标上边放不下提示框
                    if (boxHeight > pointY - this.scrollTop) {
                        y = pointY + 5;
                    } else { // 上边放得下
                        y = pointY - boxHeight - 5;
                    }

                    return [x, y];
                },
                backgroundColor: backGroundColor,
                textStyle: {
                    color: legendTextColor,
                },
                borderRadius: 5,
                padding: [10, 20, 10, 20],
                formatter: (params: any) => {
                    const textColor = this.currTheme === COLOR_THEME.Light ? '#222' : '#e8e8e8';
                    this.onClickTableRow(params.data);
                    let html = ``;
                    if (params.data) {
                        html += `
                        <div style='width: 340px;  padding-bottom: 8px; display: flex;
                        justify-content: flex-end;align-items: center;'>
                            <div style='width:27%;height:18px;font-size:12px;
                            line-height:18px;letter-spacing:0px;color:${textColor};'>
                                ${params.name[0]}
                            </div>
                            <div style='width:27%;height: 18px;font-size: 12px;
                            line-height: 18px;letter-spacing: 0px;color: ${textColor};'>
                                ${params.name[1]}
                            </div>
                        </div>`;
                        if (params.data.isOnly) {  // 不同的时间块
                            html += `
                            <div style='width: 340px;padding-bottom: 8px;display: flex;
                            justify-content: flex-end;align-items: center;'>
                                <div style='flex: 1; display: flex; align-items: center;padding-left: 10px;'>
                                    <span style='width: 9px;height: 8px;background-color:${params.color};
                                    margin-right:5px'></span>
                                    <span style='color: ${textColor};'>${params.data.label}</span>
                                </div>
                                <div style='width: 27%;height: 18px;font-size: 12px;line-height: 18px;
                                letter-spacing: 0px;color: ${textColor};'>
                                    ${params.value[3]}
                                </div>
                                <div style='width: 27%;height: 18px;font-size: 12px;line-height: 18px;
                                letter-spacing: 0px;color: ${textColor};'>
                                    ${params.data.connectOwnerThread}
                                </div>
                            </div>`;
                        } else {  // 共有的时间块
                            const aSnap = params.data.list.find((item: { tag: string }) => item.tag === 'A');
                            const bSnap = params.data.list.find((item: { tag: string }) => item.tag === 'B');
                            html += `
                                <div style='width: 340px;padding-bottom: 8px;display: flex;
                                justify-content: flex-end;align-items: center;'>
                                    <div style='flex: 1; display: flex; align-items: center;padding-left: 10px;'>
                                        <span style='width: 9px;height: 8px;
                                        background-color: ${aSnap.color};margin-right: 5px;'></span>
                                        <span style='color: ${textColor};'>${aSnap.label}</span>
                                    </div>
                                    <div style='width: 27%;height: 18px;font-size: 12px;
                                    line-height: 18px;color: ${textColor};'>
                                        ${aSnap.value}
                                    </div>
                                    <div style='width: 27%;height: 18px;font-size: 12px;
                                    line-height: 18px;color: ${textColor};'>
                                        ${aSnap.thread}
                                    </div>
                                </div>
                                <div style='width: 340px; padding-bottom: 8px;display: flex;
                                justify-content: flex-end;align-items: center;'>
                                    <div style='flex: 1; display: flex; align-items: center;padding-left: 10px;'>
                                        <span style='width: 9px;height: 8px;background-color: ${bSnap.color};
                                        margin-right: 5px;'></span>
                                        <span style='color: ${textColor};'>${bSnap.label}</span>
                                    </div>
                                    <div style='width: 27%;height: 18px;font-size: 12px;line-height: 18px;
                                    color: ${textColor};'>
                                        ${bSnap.value}
                                    </div>
                                    <div style='width: 27%;height: 18px;font-size: 12px;line-height: 18px;
                                    color: ${textColor};'>
                                        ${bSnap.thread}
                                    </div>
                                </div>`;
                        }
                    }
                    return html;
                }
            },
            legend: {
                itemHeight: 10,
                itemWidth: 10,
                icon: 'rect'
            },
            dataZoom: [{
                type: 'inside',
            }],
            grid: {
                left: 100,
                top: 20,
                right: 60,
            },
            xAxis: [{
                scale: true,
                show: false,
                position: 'top',
                axisTick: {
                    show: false
                },
                axisLine: {
                    lineStyle: {
                        color: axisLineColor,
                        width: 2
                    }
                },
                splitLine: {
                    show: true,
                    lineStyle: {
                        color: axisLineColor,
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
                        color: axisLineColor,
                        width: 2
                    }
                }
            }],

            yAxis: {
                data: this.categories,
                axisLabel: {
                    margin: 60,
                    align: 'center',
                    textStyle: {
                        color: legendTextColor,
                    }
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
                        color: [axisLineColor],
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
                data: seriesData1
            }]
        };
        setTimeout(() => {
            const chart = document.getElementById('echartId');
            if (this.categories.length > 10) {
                chart.style.height = `${this.categories.length * 38}px`;
            }
        }, 0);
    }

    /**
     * tag1对应largeArr快照
     * tag2对应smallArr快照
     */
    private mergeSeriesData(largeArr: any[], smallArr: any[], tag1: string, tag2: string) {
        const arr = [];
        for (const item1 of largeArr) {
            let flag = false;
            const obj = {
                isOnly: false,
                list: [] as any[],
                label: ''
            };
            for (const item2 of smallArr) {
                if (item1.value[1] === item2.value[1]) {  // 相同时间点发生的阈值
                    flag = true;
                    // 合并快照提示 阈值时间，快照类型，线程
                    const obj1 = this.getSnapObj(item1, tag1);
                    obj.list.push(obj1);
                    const obj2 = this.getSnapObj(item2, tag2);
                    obj.list.push(obj2);
                    break;
                }
            }
            if (!flag) { // 当前快照仅有
                // 添加快照提示
                obj.isOnly = true;
                if (tag1 === 'A') {
                    obj.label = item1.itemStyle.normal.color === '#75d874' ? this.aNormal : this.aThreshold;
                } else {
                    obj.label = item1.itemStyle.normal.color === '#037DFF' ? this.bNormal : this.bThreshold;
                }
            }
            arr.push(Object.assign({ ...obj }, { ...item1 }));
        }

        return arr;
    }
    private getSnapObj(item: any, tag: any) {
        const obj = {
            time: item.value[1],
            value: item.value[3],
            tag,
            thread: item.connectOwnerThread,
            color: item.itemStyle.normal.color,
            label: '',
        };
        if (item.itemStyle.normal.color === '#75d874') {
            obj.label = this.aNormal;
        } else if (item.itemStyle.normal.color === '#037DFF') {
            obj.label = this.bNormal;
        } else if (item.itemStyle.normal.color === '#f45c5e') {
            obj.label = this.aThreshold;
        } else if (item.itemStyle.normal.color === '#E88B00') {
            obj.label = this.bThreshold;
        }
        return obj;
    }
    /**
     * 处理数据
     */
    public handleFileOriData(base: any, compare: any) {
        if (!base || !compare) { return; }
        base.forEach((item: any) => {
            const compareFile = compare.find((compareData: { sessId: any }): any => {
                if (Object.prototype.hasOwnProperty.call(compareData, 'sessId')) {
                    return compareData.sessId === item.sessId;
                }
            });
            if (!compareFile) {
                compare.push(item);
            } else {
                compareFile.own = 'A&B';
            }
            for (const key in compareFile) {
                if (Object.prototype.hasOwnProperty.call(compareFile, key)) {
                    if (typeof compareFile[key] === 'number') {
                        if (key === 'count') {
                            compareFile.compare.Ccount = compareFile[key] - item[key];
                        } else if (key === 'duration') {
                            compareFile.compare.Cduration = compareFile[key] - item[key];
                        } else {
                            compareFile.compare[key] = compareFile[key] - item[key];
                        }
                    }
                    if (typeof compareFile[key] === 'string') {
                        if (key === 'startTime' || key === 'endTime') {
                            compareFile.compare[key] = (Number(compareFile[key]) - Number(item[key]));
                        }
                    }
                }
            }
            if (Object.prototype.hasOwnProperty.call(item, 'sessions') && compareFile) {
                const itemValue = Object.values(item.sessions);
                const compareFileValue = Object.values(compareFile.sessions);
                this.handleFileOriData(itemValue, compareFileValue);
            }
        });
        return compare;
    }
    /**
     * 获取对比数据
     */
    public handleSortCompare(base: any, compare: any) {
        this.baseData = this.sortAOrB(base, 'A');
        this.compareData = this.sortAOrB(compare, 'B');
    }
    /**
     * 将原始数据标记为A或者B
     * @param data 原始数据
     * @param AOrB 设置为A，或者B
     */
    private sortAOrB(data: any[], AOrB: any): any {
        if (!data) { return; }
        data.forEach((item) => {
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
    /**
     * 交换对比
     */
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
    }

    /**
     * beforeToggle
     */
    public beforeToggle(row: TiTableRowData): void {
        this.srcDataTable.data = this.comparedDatas;
        this.srcDataTable.data.forEach((e) => {
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

    /**
     * 点击表格某行
     */
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

    /**
     * 获取当前选中项
     */
    public onSelect(): void {
        // 获取当前选中项，参数：树节点数据，选中项是否只包含叶子节点，是否多选
        this.selectedData = TiTreeUtil.getSelectedData(
            this.stackTranceData,
            false,
            false
        );
    }

    /**
     * 展开整个树
     */
    public expandNode(state: string): void {
        const data: Array<TiTreeNode> = state === 'start' ? this.stackTranceData.concat() :
         this.stackTranceDataEnd.concat();
        TiTreeUtil.traverse(data, traverseFn);
        function traverseFn(node: TiTreeNode): void {
            node.expanded = true;
        }
        state === 'start' ? this.stackTranceData = data : this.stackTranceDataEnd = data;
    }

    /**
     * 处理时间格式
     */
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
    /**
     * 选择项改变
     */
    public onModelChange(value: any): void {
        if (!value) {
            this.spinnerValue = 0;
        }
    }

    /**
     * 设置echarts实例
     */
    public onChartInit(ec: any) {
        this.echartsInstance = ec;
        this.echartsInstance.on('datazoom', (params: any) => {  // 放大缩小时调用接口
            this.indexStart = params.batch[0].start;
            this.indexEnd = params.batch[0].end;
            this.getBottomTime(params.batch[0].start, params.batch[0].end);
            (this.timeLineDetail as any).dataConfig({ start: params.batch[0].start, end: params.batch[0].end });
        });
    }

    /**
     * 时间轴变化数据改变
     */
    public timeLineData(data: any) {
        this.echartsOption.dataZoom[0].start = data.start;
        this.echartsOption.dataZoom[0].end = data.end;
        this.echartsInstance.setOption({
            dataZoom: this.echartsOption.dataZoom
        });
        this.indexStart = data.start;
        this.indexEnd = data.end;
        this.getBottomTime(data.start, data.end);
    }

    /**
     * 获取echarts底部的时间轴
     * @param start 时间轴开始位置
     * @param end 时间轴结束位置
     */
    private getBottomTime(start: number, end: number) {
        if (this.indexStart === undefined || this.indexEnd === undefined) {
            this.timeData1 = this.timeData;
            return;
        } else {
            const unit = 100 / 18;
            let indexStart: number;
            let indexEnd: number;
            if (start === 0) {
                indexStart = start;
            } else {
                indexStart = ((start / unit) + 1) / 2 + 1;
            }
            if (end === 100) {
                indexEnd = this.timeData.length;
            } else {
                indexEnd = ((end / unit) + 1) / 2 + 1;
            }
            this.timeData1 = this.timeData.slice(indexStart, indexEnd);
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
