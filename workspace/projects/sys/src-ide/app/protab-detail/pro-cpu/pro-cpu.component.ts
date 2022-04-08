import { Component, OnInit, Input, ViewChild, ElementRef, NgZone, ChangeDetectorRef } from '@angular/core';
import { I18nService } from '../../service/i18n.service';
import { MytipService } from '../../service/mytip.service';
import { VscodeService } from 'projects/sys/src-ide/app/service/vscode.service';
import { Utils } from 'projects/sys/src-ide/app/service/utils.service';
import { TiTableColumns, TiTableRowData } from '@cloud/tiny3';
import { DomSanitizer } from '@angular/platform-browser';

const ORIGINDATA_KEY = 'origin_data';

@Component({
    selector: 'app-pro-cpu',
    templateUrl: './pro-cpu.component.html',
    styleUrls: ['./pro-cpu.component.scss']
})
export class ProCpuComponent implements OnInit {
    @Input() projectName: any;
    @Input() taskName: any;
    @Input() analysisType: any;
    @Input() taskid: any;
    @Input() nodeid: any;
    @Input() devType: string;
    i18n: any;
    @ViewChild('cpuChart', { static: false }) cpuChart;
    @ViewChild('timeLineDetail', { static: false }) timeLineDetail;
    @ViewChild('threadScreenMask', { static: false }) threadScreenMask: any;
    public sivCpuOption = true;
    public index = 0;
    public pidTree = {};
    public displayData: any;
    public processNameList = [];
    public testData = {
        origin_data: {
            time: [],
            values: {}
        },
        key: [],
        spec: []
    };
    public timeLine = { start: 0, end: 100 };
    public timeData = [];
    public showLoading = false;
    public showFilterLoading = false;
    public isShowTimeTable: boolean;
    public keys: Array<string> = [];

    public threadDataSheet: any = []; // 所有的线程的及其数据的列表
    public selectedThreadList: any = []; // 经过 CPU选择 后的线程列表
    public threadCheckedList: any = []; // 被选中的线程的列表
    public prevThreadCheckedList: any = [];
    public threadSrcData: any = { data: [] };
    public processOptions: any = [];
    public threadDisplayedData: Array<TiTableRowData> = [];
    public threadColumns: Array<TiTableColumns> = [
        {
            title: 'PID/TID',
            key: 'pid',
            selected: [],
            multiple: true,
            selectAll: true
        }
    ];
    public titleWidth = 202;
    // 分页
    public currentPage = 1;
    public totalNumber = 0;
    public pageSize: { options: Array<number>, size: number } = {
        options: [10, 20, 30, 50],
        size: 20
    };
    public filterSrc = './assets/img/filterNormal.svg';
    public disksHeadShow = false;
    // 选中项
    public filterCheckedData: Array<any> = [];
    public diskColspan: number;
    public lastPageThreadSrcData: any[] = [];
    public lang: string;
    public isIntellij: boolean = (self as any).webviewSession.getItem('tuningOperation') === 'hypertuner';

    constructor(
        public sanitizer: DomSanitizer,
        public i18nService: I18nService,
        public mytip: MytipService,
        public vscodeService: VscodeService,
        private zone: NgZone,
        private cdr: ChangeDetectorRef,
        private el: ElementRef) {
        this.i18n = this.i18nService.I18n();
        this.lang = self.webviewSession.getItem('language');
    }

    /**
     * 初始化
     */
    ngOnInit() {
        if (this.devType === 'cpu') {
            this.keys = ['%CPU', '%user', '%system', '%wait'];
        } else if (this.devType === 'disk') {
            // 存储IO
            this.keys = ['iodelay', 'kB_rd/s', 'kB_wr/s'];
        } else if (this.devType === 'mem') {
            this.keys = ['%MEM', 'minflt/s', 'majflt/', 'VSZ', 'RSS'];
        } else if (this.devType === 'context') {
            this.keys = ['cswch/s', 'nvcswch/s'];
        }
        this.keys.forEach(item => {
            this.threadColumns.push({
                title: item,
                key: item,
                selected: item,
                sortKey: item
            });
        });
        // 表头显示
        this.filterCheckedData = [...this.threadColumns];
        this.diskColspan = this.threadColumns.length;
        this.filterCheckedData.push({
            title: 'Command',
            key: 'Command',
            selected: 'Command',
            sortKey: 'Command'
        }, {
            title: 'cmdline',
            key: 'cmdline',
            selected: 'cmdline',
            sortKey: 'cmdline'
        });
        this.showLoading = true;
        setTimeout(() => {
            this.getData();
        });
        this.updateWebViewPage();
    }

    /**
     * 设置各层级复选组绑定items数据
     * @param treeData Array<any>
     * @param items Array<any>
     * @param parentData Array<any>
     * @returns Array<any>
     */
    private getCheckgroupItems(treeData: Array<any>, items: Array<any>, parentData?: Array<any>): any {
        if (treeData) {
            for (const data of treeData) {
                if (data.tidArr) {
                    this.getCheckgroupItems(data.tidArr, items);
                } else {
                    items.push(data);
                }
            }
        } else {
            items.push(parentData);
        }
        return items;
    }
    /**
     * 获取数据
     */
    public getItems(data: Array<any>, parentData?: Array<any>): Array<any> {
        const items: Array<any> = [];
        return this.getCheckgroupItems(data, items, parentData);
    }

    /**
     * 下载文件
     */
    public downloadCsv() {
        let str = '';
        this.displayData.spec.forEach(val => {
            str += this.i18n.process.selectPid + ',,' + val + '\n,';
            this.displayData.data.time.forEach(el => {
                str += el + ',';
            });
            str += '\n';
            this.displayData.key.forEach(item => {
                if (item === '%usr') {
                    str += '%user' + ',';
                } else {
                    str += item + ',';
                }

                // 修复bug
                if (item === 'CPU ID') {
                    item = 'CPU';
                }
                this.displayData.data.values[val][item].forEach(ele => {
                    str += ele + ',';
                });
                str += '\n';
            });
            str += '\n';
        });

        // encodeURIComponent解决中文乱码
        const uri = 'data:text/csv;charset=utf-8,\ufeff' + encodeURIComponent(str);
        // 通过创建a标签实现
        const link = document.createElement('a');
        link.href = uri;
        // 对下载的文件命名
        link.download = this.i18n.process.cpu + '.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        const message = {
            cmd: 'downloadFile',
            data: {
                fileName: 'CPU.csv',
                fileContent: '\ufeff' + str,
                invokeLocalSave: true
            }
        };
        this.vscodeService.postMessage(message, {});
        this.updateWebViewPage();
    }

    private async getData() {
        const params = {
            'node-id': encodeURIComponent(this.nodeid),
            'query-type': 'detail',
            'query-target': this.devType
        };
        let url = `/tasks/${this.taskid}/process-analysis/?`;
        url += Utils.converUrl(params);
        await this.vscodeService.get({ url }, (res: any) => {
            this.testData = res.data;
            this.testData.spec.forEach((item, index) => {
                if (item.indexOf('P') > -1) {
                    this.pidTree[item] = [];
                    for (let i = index + 1; i < this.testData.spec.length; i++) {
                        if (this.testData.spec[i].indexOf('T') > -1) {
                            this.pidTree[item].push(this.testData.spec[i]);
                        } else {
                            break;
                        }
                    }
                }
            });
            this.setThreadDataSheet(this.testData, this.pidTree);
            // 默认选中并展示前5个pid及其包含的tid
            const originSelect = this.interceptArr(this.threadDataSheet, 0, 6);
            originSelect.forEach(item => {
                item.tidArr.map((it: any) => {
                    this.threadCheckedList.push(it);
                });
            });
            this.setDiskData();
            // 设置分页的totalNumber
            this.totalNumber = this.threadDataSheet.length;
            this.threadSrcData.data = this.threadDataSheet;

            // 设置进程筛选项
            this.processOptions = this.threadSrcData.data.map((item: any) => {
                const option = { label: item.pid };
                return option;
            });
            this.showLoading = false;
            this.updateWebViewPage();
        });
    }

    /**
     * 截取数组的数据
     * @param arr 数组
     * @param tem 截取位置
     * @param num 截取几个
     */
    public interceptArr(arr: Array<any>, tem: number, num: number) {
        const info = [...arr];
        return info.splice(tem, num - 1);
    }

    /**
     * 预处理数据
     */
    public setDiskData() {
        const spec: any = [];
        if (this.testData.key.indexOf('Command') > -1) {
            const index = this.testData.key.indexOf('Command');
            this.testData.key.splice(index, 1);
        }
        this.threadCheckedList.forEach((ele: { pid: any; tid: any; }) => {
            if (spec.indexOf(ele.pid) === -1) {
                spec.push(ele.pid);
            }
            if (spec.indexOf(ele.tid) === -1) {
                spec.push(ele.tid);
            }
        });
        const option = {
            spec,
            key: this.testData.key,
            data: this.testData[ORIGINDATA_KEY],
            title: 'CPU Usage',
            type: 'cpu'
        };
        this.displayData = option;
        this.timeData = option.data.time;
    }

    /**
     * 时间轴变化数据改变
     */
    public timeLineData(e) {
        this.timeLine = e;
        this.cpuChart.upDateTimeLine(e);
    }

    /**
     * 数据筛选时间轴改变
     */
    public dataZoom(e) {
        this.timeLineDetail.dataConfig(e);
    }
    /**
     * 判断时刻表是否显示
     * @param $event boolean
     */
    public timeDataArr($event) {
        this.isShowTimeTable = $event;
    }
    /**
     * 确认筛选
     */
    public onSelectConfirm() {
        const option = JSON.parse(JSON.stringify(this.displayData));
        const specSet = new Set<string>();
        for (const item of this.threadCheckedList) {
            specSet.add(item.pid);
            specSet.add(item.tid);
        }
        option.spec = Array.of(...specSet);
        this.displayData = option;
        setTimeout(() => {
            this.cpuChart.initTable();
        }, 0);
        this.threadScreenMask.Close();
    }
    /**
     * 取消筛选
     */
    public onSelectCancel() {
        this.threadScreenMask.Close();
    }
    /**
     * 整理filter弹框表格数据
     * @param rawData 行数据
     * @param pidTree pid
     */
    public setThreadDataSheet(rawData: any, pidTree: any) {
        const originValue = rawData.origin_data.values;
        this.threadDataSheet = [];
        const threadDataSheet = [];
        for (const pid of Object.keys(pidTree)) {
            const threadList = pidTree[pid];
            const phValue = originValue[pid];
            const pidItem: any = { pid, tidArr: [], showSub: false, disabled: true };
            this.keys.forEach(key => {
                if (key === '%user') {
                    const keyInstead = '%usr';
                    pidItem[key] = this.getAvg(phValue, keyInstead);
                } else {
                    pidItem[key] = this.getAvg(phValue, key);
                }
                if (pidItem[key] !== null) {
                    pidItem.disabled = false;
                }
            });
            for (const tid of threadList) {
                const thValue = originValue[tid];
                const tidItem: any = { tid, pid, disabled: true };
                this.keys.forEach(key => {
                    tidItem[key] = this.getAvg(thValue, key);
                    if (tidItem[key] !== null) {
                        tidItem.disabled = false;
                    }
                });
                pidItem.tidArr.push(tidItem);
            }
            pidItem.Command = originValue[pid].Command[0];
            threadDataSheet.push(pidItem);
        }
        this.threadDataSheet = threadDataSheet.sort((a, b) => b[this.keys[0]] - a[this.keys[0]]);
    }
    private getAvg(originValue: { [x: string]: any; }, key: string | number) {
        const reducer = (accumulator: any, currentValue: any) => accumulator + currentValue;
        const isNULL = (item: any) => item === 'NULL';
        const notNULL = (item: any) => item !== 'NULL';
        const valueArr: [] = originValue[key] || [];
        const valueSum: number | null = valueArr.every(isNULL) ? null : valueArr.filter(notNULL).reduce(reducer, 0);
        const valAvg: number | null = valueSum == null ? null : valueSum / (valueArr.length + 0.0000001);
        return valAvg;
    }
    /**
     * 表头筛选
     * @param filterInfo 要筛选出来的数据
     */
    public onProcessSelect(filterInfo: any): void {
        this.threadSrcData.data = [];
        const allArr: any = [];
        // 遍历选中的数据
        filterInfo.map((item: any) => {
            // 从threadDataSheet中过滤筛选
            const data = this.threadDataSheet.filter((it: any) => it.pid === item.label);
            allArr.push(data[0]);
        });
        this.threadSrcData.data = [...allArr];
        this.totalNumber = this.threadSrcData.data.length;
    }
    /**
     * 打开筛选弹窗
     */
    public onThreadScreenClick() {
        this.threadScreenMask.Open();
    }

    /**
     * 筛选 鼠标移入
     */
    public mouseenter() {
        this.filterSrc = './assets/img/filterHover.svg';
    }
    /**
     * 筛选 鼠标移出
     */
    public mouseleave() {
        this.filterSrc = './assets/img/filterNormal.svg';
    }

    /**
     * IntellIj刷新webview页面
     */
    public updateWebViewPage() {
        if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
            this.zone.run(() => {
                this.cdr.checkNoChanges();
                this.cdr.detectChanges();
            });
        }
    }
}
