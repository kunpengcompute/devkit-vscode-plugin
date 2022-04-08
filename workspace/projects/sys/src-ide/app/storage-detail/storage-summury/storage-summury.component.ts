import { Component, OnInit, Input, ChangeDetectorRef, NgZone } from '@angular/core';
import { TiTableColumns, TiTableRowData } from '@cloud/tiny3';
import { I18nService } from '../../service/i18n.service';
import { VscodeService, HTTP_STATUS_CODE } from '../../service/vscode.service';
import { Utils } from '../../service/utils.service';
import { SummuryDataService } from './summury-data.service';
import { MessageService } from '../../service/message.service';

@Component({
    selector: 'app-storage-summury',
    templateUrl: './storage-summury.component.html',
    styleUrls: ['./storage-summury.component.scss'],
})
export class StorageSummuryComponent implements OnInit {

    // 工程名
    @Input() projectName: any;
    // 任务名
    @Input() taskName: any;
    // 分析类型
    @Input() analysisType: any;
    // 任务id
    @Input() taskid: any;
    // 节点id
    @Input() nodeid: any;

    // 分页参数
    public diskCurrentPage = 1;
    public diskTotalNumber = 0;
    public diskPageSize: { options: Array<number>, size: number } = {
        options: [10, 20, 30, 50],
        size: 10
    };

    // APIs 分页参数
    public currentPage = 1;
    public totalNumber = 0;
    public pageSize: { options: Array<number>, size: number } = {
        options: [10, 20, 30, 50],
        size: 10
    };

    public currentLang: string;
    public i18n: any;
    // 如果是系统类型,没有apios
    public ifSys = false;
    // 磁盘I/O 数据源
    public diskDisplayedData: Array<TiTableRowData> = [];
    public diskSearchWords: Array<any> = [];
    public diskSearchKeys: Array<string> = []; // 设置过滤字段
    public diskSrcData = { data: [] };
    // 原始数据
    public diskOriginData = [];

    public diskColumns: Array<TiTableColumns> = [];
    // disk表头筛选显示
    public diskTitle: Array<TiTableColumns> = [];
    public diskColspan = 8;
    // disk选中项
    public diskCheckedData: Array<any> = [];
    public disksHeadShow = false;


    // APIs 数据源
    public threadDisplayedData: Array<TiTableRowData> = [];
    public threadSrcData = { data: [] };
    public pidColumns: Array<TiTableColumns> = [];
    // 原始数据
    public ioOriginData = [];
    public threadColumns: Array<TiTableColumns> = [];

    // 无数据提示
    public nodataTips = '';
    // 建议信息
    public suggestMsg: any = [];
    // loading动画
    public showLoading = false;
    public hasAddI2D = false; // 是否增加i2d数据
    public blockIOData: any;

    constructor(
        public i18nService: I18nService,
        public vscodeService: VscodeService,
        public summuryData: SummuryDataService,
        private msgService: MessageService,
        private zone: NgZone,
        private changeDetectorRef: ChangeDetectorRef
    ) {
        this.i18n = this.i18nService.I18n();
        this.diskColumns = [
            {
                title: 'DEV',
                width: '6%',
                key: 'dev',
                searchable: true, // 该列的 headfilter 的下拉中是否开启搜索功能
                selected: null,
                multiple: true,
                selectAll: true,
                options: [],
                disabled: true,
                show: true,
            },
            {
                title: this.i18n.storageIO.summury.roprateTime,
                width: '10%',
                key: 'read_times',
                sortKey: 'read_times',
                disabled: false,
                show: true,
            },
            {
                title: this.i18n.storageIO.summury.woprateTime,
                width: '10%',
                key: 'write_times',
                sortKey: 'write_times',
                disabled: false,
                show: true,
            },
            {
                title: this.i18n.storageIO.summury.riops,
                width: '8%',
                key: 'r_iops',
                sortKey: 'r_iops',
                disabled: false,
                show: true,
            },
            {
                title: this.i18n.storageIO.summury.wiops,
                width: '8%',
                key: 'w_iops',
                sortKey: 'w_iops',
                disabled: false,
                show: true,
            },
            {
                title: this.i18n.storageIO.summury.rdataSize,
                width: '10%',
                key: 'read_size',
                sortKey: 'read_size',
                disabled: false,
                show: true,
            },
            {
                title: this.i18n.storageIO.summury.wdataSize,
                width: '10%',
                key: 'write_size',
                sortKey: 'write_size',
                disabled: false,
                show: true,
            },
            {
                title: this.i18n.storageIO.summury.rrate,
                width: '11%',
                key: 'r_throughput',
                sortKey: 'r_throughput',
                disabled: false,
                show: true,
            },
            {
                title: this.i18n.storageIO.summury.wrate,
                width: '11%',
                key: 'w_throughput',
                sortKey: 'w_throughput',
                disabled: false,
                show: true,
            },
            {
                title: this.i18n.storageIO.summury.rdelay,
                width: '11%',
                key: 'r_delay',
                sortKey: 'r_delay',
                disabled: false,
                show: true,
            },
            {
                title: this.i18n.storageIO.summury.wdelay,
                width: '11%',
                key: 'w_delay',
                sortKey: 'w_delay',
                disabled: false,
                show: true,
            },
            {
                title: this.i18n.storageIO.diskio.queueDepth,
                width: '11%',
                key: 'queue_depth',
                sortKey: 'queue_depth',
                disabled: false,
                show: true,
            },
        ];

        this.pidColumns = [
            {
                title: this.i18n.storageIO.ioapis.pid,
                width: '20%',
                key: 'tid',
                selected: null,
                multiple: true,
                searchable: true,
                selectAll: true,
                options: []
            },
            {
                title: this.i18n.storageIO.ioapis.pidName,
                width: '65%',
                key: 'pid',
                selected: null,
                multiple: true,
                selectAll: true,
                searchable: true,
                options: []
            },
        ];

        this.threadColumns = [
            {
                title: this.i18n.storageIO.ioapis.functionName,
                width: '12%',
                key: 'fun_name',
                selected: null,
                multiple: true,
                selectAll: true,
                options: []
            },
            {
                title: this.i18n.storageIO.ioapis.sysTimes,
                width: '18%',
                key: 'exec_count',
                sortKey: 'exec_count'
            },
            {
                title: this.i18n.storageIO.ioapis.average_time_s,
                width: '18%',
                key: 'avg_time',
                sortKey: 'avg_time'
            },
            {
                title: this.i18n.storageIO.ioapis.total_time_s,
                width: '18%',
                key: 'sum_time',
                sortKey: 'sum_time'
            },
            {
                title: this.i18n.storageIO.ioapis.time_ratio,
                width: '18%',
                key: 'percent',
                sortKey: 'percent'
            }
        ];

        this.diskTitle = this.diskColumns.slice(0, 8);
        this.diskCheckedData = this.diskTitle;
    }

    /**
     * 初始化
     */
    ngOnInit() {
        this.currentLang = (self as any).webviewSession.getItem('language');
        this.getSummuryData();
        this.updateWebViewPage();
    }

    /**
     * 获取总览数据
     */
    public getSummuryData() {
        this.showLoading = true;
        const params = {
            nodeId: this.nodeid,
        };
        const url = '/tasks/' + this.taskid + '/ioperformance/summary/?' + Utils.converUrl(params);
        this.vscodeService.get({ url }, (resp: any) => {
            this.showLoading = false;
            if (resp.code === HTTP_STATUS_CODE.SYSPERF_SUCCESS) {
                const data = resp.data.summary.data;
                if (data.disk_io && Object.keys(data.disk_io).length > 0) {
                    this.delDiskData(data.disk_io);
                }
                if (data.api_io && Object.keys(data.api_io).length > 0) {
                    this.delIOData(data.api_io);
                    this.ifSys = true;
                }
                if (data.suggestion && data.suggestion.length > 0) {
                    data.suggestion.forEach((item: {
                        title_en: any;
                        title_chs: any;
                        suggest_en: any;
                        suggest_chs: any;
                    }) => {
                        this.suggestMsg.push({
                            title: this.currentLang.indexOf('en') !== -1 ? item.title_en : item.title_chs,
                            msgbody: this.currentLang.indexOf('en') !== -1 ? item.suggest_en : item.suggest_chs
                        });
                    });
                }
                if (data.block_trace_statistic && Object.keys(data.block_trace_statistic).length > 0) {
                    this.blockIOData = data.block_trace_statistic;
                }
            } else {
                const message = {
                    cmd: 'showInfoBox',
                    data: {
                        info: resp.message,
                        type: 'info'
                    }
                };
                this.vscodeService.postMessage(message, null);
                this.nodataTips = this.i18n.common_term_task_nodata2;
            }
            this.updateWebViewPage();
        });
    }

    /**
     * 处理disk数据
     */
    public delDiskData(data: { [x: string]: any; }) {
        const delData: any = [];
        if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
            let hyDev = Object.keys(data); // 设备名称
            hyDev = hyDev.sort((aStr: any, bStr: any) => {
                const strA = aStr.toUpperCase();
                const strB = bStr.toUpperCase();
                if (strA < strB) {
                    return -1;
                }
                if (strA > strB) {
                    return 1;
                }
                return aStr - bStr;
            });
            this.diskColumns[0].options = hyDev.map(val => {
                return { label: val };
            });
            this.diskColumns[0].selected = this.diskColumns[0].options;
            hyDev.forEach((val, idx) => {
                data[val].dev = val;
                data[val].showDetails = false;
                delData.push(data[val]);
            });
            this.diskOriginData = JSON.parse(JSON.stringify(delData));
            this.diskSrcData.data = delData;
            this.diskTotalNumber = delData.length;
            this.summuryData.diskTableData = JSON.parse(JSON.stringify(delData));
        } else {
            const dev = Object.keys(data); // 设备名称
            this.diskColumns[0].options = dev.map(val => {
                return { label: val };
            });
            this.diskColumns[0].selected = this.diskColumns[0].options;
            dev.forEach((val, idx) => {
                data[val].dev = val;
                data[val].showDetails = false;
                delData.push(data[val]);
            });
            this.diskOriginData = JSON.parse(JSON.stringify(delData));
            this.diskSrcData.data = delData;
            this.diskTotalNumber = delData.length;
            this.summuryData.diskTableData = JSON.parse(JSON.stringify(delData));
        }
        if (delData && Object.prototype.hasOwnProperty.call(delData[0], 'd2c_w_delay')) {
            this.hasAddI2D = true;
            this.diskColumns.splice(9, 2, {
                title: this.i18n.storageIO.summury.i2d_rdelay,
                width: '11%',
                key: 'i2d_r_delay',
                sortKey: 'i2d_r_delay',
                disabled: false,
                show: true,
            }, {
                title: this.i18n.storageIO.summury.i2d_wdelay,
                width: '11%',
                key: 'i2d_w_delay',
                sortKey: 'i2d_w_delay',
                disabled: false,
                show: true,
            }, {
                title: this.i18n.storageIO.summury.d2c_rdelay,
                width: '11%',
                key: 'd2c_r_delay',
                sortKey: 'd2c_r_delay',
                disabled: false,
                show: true,
            }, {
                title: this.i18n.storageIO.summury.d2c_wdelay,
                width: '11%',
                key: 'd2c_w_delay',
                sortKey: 'd2c_w_delay',
                disabled: false,
                show: true,
            });
        }
    }

    /**
     * 处理io数据
     */
    public delIOData(data: { [x: string]: any; }) {

        const dev = Object.keys(data); // PID
        const delData = [];
        const rfilter = [];
        dev.forEach((val, idx) => {
            // 筛选数据项
            this.pidColumns[0].options.push({ label: val });
            if (rfilter.indexOf(data[val].cmd_name) === -1) {
                rfilter.push(data[val].cmd_name);
                this.pidColumns[1].options.push({ label: data[val].cmd_name });
            }
            if (idx === 0) {
                data[val].showDetails = true;
            } else {
                data[val].showDetails = false;
            }
            data[val].pid = val;
            data[val].displayedData = [];
            data[val].srcData = { data: [] };
            data[val].originData = JSON.parse(JSON.stringify(data[val].fun_info));
            data[val].srcData.data = [...data[val].originData];
            data[val].threadCheckedList = [];
            data[val].options = data[val].srcData.data.map((item: { fun_name: any; }) => {
                return { label: item.fun_name };
            });
            data[val].selected = data[val].options;
            data[val].pageSize = {
                options: [10, 20, 30, 50],
                size: 10
            };
            data[val].currentPage = 1;
            data[val].totalNumber = data[val].fun_info.length;
            delData.push(data[val]);
        });
        this.ioOriginData = JSON.parse(JSON.stringify(delData));
        this.ioOriginData.forEach((el: { selected: any; options: any; }) => {
            el.selected = el.options;
        });
        this.threadSrcData.data = this.ioOriginData;
        this.totalNumber = this.ioOriginData.length;
        this.summuryData.ioTableData = delData;
        this.summuryData.ioColumns = JSON.parse(JSON.stringify(this.pidColumns));
        this.summuryData.ioOriginData = JSON.parse(JSON.stringify(delData));
        this.pidColumns[0].selected = this.pidColumns[0].options;
        this.pidColumns[1].selected = this.pidColumns[1].options;
    }


    /**
     * I/O APIs 筛选
     */
    public onProcessSelect(list: any): void {
        const pidList = this.pidColumns[0].selected.map((val: { label: any; }) => {
            return val.label;
        });
        const nameList = this.pidColumns[1].selected.map((val: { label: any; }) => {
            return val.label;
        });
        this.threadSrcData.data = this.ioOriginData.filter((el: { pid: any; cmd_name: any; }, idx: any) => {
            return pidList.indexOf(el.pid) > -1 && nameList.indexOf(el.cmd_name) > -1;
        });
        if (this.threadSrcData.data.length === 0) {
            this.nodataTips = this.i18n.common_term_task_nodata2;
        }
        this.totalNumber = this.threadSrcData.data.length;
    }

    /**
     * 磁盘I/O 表单第一列DEV筛选
     * @param item 数据
     */
    public onDiskSelect(item: any): void {
        const selectList = item.map((val: { label: any; }) => val.label);
        // 从每一行进行过滤筛选
        this.diskSrcData.data = this.diskOriginData.filter((diskItem: any) => {
            return selectList.indexOf(diskItem.dev) > -1;
        });
        this.diskTotalNumber = this.diskSrcData.data.length;
        if (this.diskTotalNumber === 0) {
            this.nodataTips = this.i18n.common_term_task_nodata2;
        }
    }

    /**
     * 函数筛选
     */
    public functionSelect(list, obj) {
        const funList = list.map(val => {
            return val.label;
        });
        obj.srcData.data = obj.originData.filter(el => {
            return funList.indexOf(el.fun_name) > -1;
        });
        obj.totalNumber = obj.srcData.data.length;
    }


    /**
     * 展开APIs进程函数详情
     * @param row 该条数据
     * @param i 数组内下标
     */
    public beforeToggleFun(row: TiTableRowData, i): void {
        row.showDetails = !row.showDetails;
    }

    /**
     * 获取表单id
     * @param index 下标
     * @param item 数据
     */

    public trackByFn(index: number, item: any): number {
        return item.id;
    }

    /**
     * 磁盘 表头筛选
     */
    public diskHeaderChange() {
        const length = this.diskCheckedData.length;
        this.diskColspan = length + 2;
        const arr = [];
        this.diskCheckedData.forEach((value) => {
            arr.push(value.title);
        });
        if (length < 15) {
            this.diskColumns.forEach((item, index) => {
                if (item.key !== 'dev') {
                    item.disabled = false;
                }
            });
        } else {
            this.diskColumns.forEach((item, index) => {
                if (index > 0) {
                    if (arr.indexOf(item.title)) {
                        item.disabled = false;
                    }
                    if (arr.indexOf(item.title) === -1) {
                        item.disabled = true;
                    }
                }
            });
        }
        this.diskTitle.forEach((item, index) => {
            if (index > 0) {
                if (arr.indexOf(item.title)) {
                    item.show = true;
                }
                if (arr.indexOf(item.title) === -1) {
                    item.show = false;
                }
            }
        });
    }

    /**
     * 查看详细信息
     */
    public viewDiskDetails(obj, type: string, func?) {
        const detail = {
            dev: obj.dev || '',
            piName: obj.cmd_name || '',
            pid: obj.pid || '',
            func: ''
        };
        if (func) {
            detail.func = func.fun_name;
        }
        this.msgService.sendMessage({
            function: type,
            detail,
            taskName: this.taskName,
        });
    }
    /**
     * IntellIj刷新webview页面
     */
    public updateWebViewPage() {
        if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
            this.zone.run(() => {
                this.changeDetectorRef.markForCheck();
                this.changeDetectorRef.checkNoChanges();
                this.changeDetectorRef.detectChanges();
            });
        }
    }
}

