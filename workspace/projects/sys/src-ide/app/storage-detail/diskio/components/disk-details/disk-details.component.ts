import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { I18nService } from '../../../../service/i18n.service';
import { HttpService } from 'sys/src-ide/app/service';
import { VscodeService, HTTP_STATUS_CODE } from '../../../../service/vscode.service';
import { Utils } from '../../../../service/utils.service';
import { TiTableColumns, TiTableRowData } from '@cloud/tiny3';

@Component({
    selector: 'app-disk-details',
    templateUrl: './disk-details.component.html',
    styleUrls: ['./disk-details.component.scss'],
})
export class DiskDetailsComponent implements OnInit {
    // echarts框组件
    @ViewChild('dataTableChart', { static: false }) dataTableChart: { initTable: () => void; };
    @ViewChild('delayTableChart', { static: false }) delayTableChart: { initTable: () => void; };
    // 数据块分布图组件
    @ViewChild('dataBlock', { static: false }) dataBlock: { setData: () => void; };
    @Input() nodeid: string;
    @Input() taskid: any;
    @Input() readChecked: boolean;
    @Input() topState: string;
    @Input() timeTitle: string;
    @Output() public toggleTopOut = new EventEmitter<any>();
    @Input() selectDevArr: Array<string>;
    // 框选传递的数据
    public selectList: any;
    // 磁盘名称数组
    public devArr: any = [];
    public selectDev: any;
    public selectKey = 'iops';
    public selectKey2 = '';
    // 请求获取的总的原始数据
    public originData: any = [];
    // 详情表格显示
    public showDetailsTable = false;
    // 传给diskTable的所有数据
    public tlbData: any = {
        columns: [],
        displayed: ([] as Array<TiTableRowData>),
        srcData: {
            data: ([] as Array<TiTableRowData>),
            state: {
                searched: false,
                sorted: false,
                paginated: false
            },
        },
        pageNo: 0,
        hasPage: true,
        total: (undefined as number),
        pageSize: {
            options: [10, 20, 50, 100],
            size: 10
        },
    };
    // 操作次数&IOPS
    public dataSizeColumns: any = [];
    public diskSrcData: any = { data: [] };
    public diskDisplayedData: Array<TiTableRowData> = [];
    public diskColumns: Array<TiTableColumns> = [];
    public diskSearchWords: Array<any> = [];
    // 设置过滤字段
    public diskSearchKeys: Array<string> = [];
    public diskCurrentPage = 1;
    public diskTotalNumber = 0;
    public diskPageSize: { options: Array<number>, size: number } = {
        options: [10, 20, 30, 50],
        size: 10
    };
    public timeLine = {
        start: 0,
        end: 100
    };
    // 吞吐率和数据大小
    public dataList: any = {
        spec: [],
        key: [],
        devArr: [],
        time: [],
        data: {},
    };
    // 时延框选单个设备数据暂存
    public delayTableData: any = [];
    // I/O数据块分布图数据
    public blockData: any = {
        data: [],
        time: []
    };
    // 时延
    public delayList: any = {
        spec: [],
        key: [],
        devArr: [],
        time: [],
        data: {},
    };
    // 队列
    public queueColums: any = [];
    public i18n: any;
    public nodataTips = '';
    public isIntellij = ((self as any).webviewSession || {}).getItem('tuningOperation') === 'hypertuner';
    constructor(
        public i18nService: I18nService,
        private vscodeService: VscodeService,
        private http: HttpService,
    ) {
        this.i18n = this.i18nService.I18n();
        this.nodataTips = this.i18n.common_term_task_empty_data;
    }

    /**
     * 初始化
     */
    ngOnInit() {
        this.dataSizeColumns = [
            { label: this.i18n.storageIO.ioapis.time, key: 'time', width: '14%' },
            { label: this.i18n.storageIO.diskio.events, key: 'event', width: '14%' },
            { label: this.i18n.storageIO.diskio.blocks, key: 'block', width: '14%' },
            { label: this.i18n.sys_res.core, key: 'cpu', width: '14%' },
            { label: this.i18n.storageIO.ioapis.pid, key: 'pid', width: '14%' },
            { label: this.i18n.storageIO.ioapis.pidName, key: 'process_name', width: '14%' },
            { label: this.i18n.common_term_task_tab_summary_callstack, key: 'stack', width: '16%' }
        ];
        this.diskColumns = [
            { label: this.i18n.storageIO.ioapis.time, sortKey: 'time' },
            { label: 'DEV', sortKey: 'dev' },
            { label: this.i18n.storageIO.diskio.operateType, sortKey: 'operation_type' },
            { label: this.i18n.storageIO.diskio.delayTime1I2D, sortKey: 'i2d_delay' },
            { label: this.i18n.storageIO.diskio.delayTime1, sortKey: 'd2c_delay' },
            { label: this.i18n.storageIO.diskio.startBlockNo, sortKey: 'start_offset' },
            { label: this.i18n.storageIO.diskio.endBlockNo, sortKey: 'end_offset' },
            { label: this.i18n.storageIO.diskio.dataSize1, sortKey: 'data_size' },
            { label: this.i18n.storageIO.diskio.throughput1, sortKey: 'throughput' }
        ];
        this.queueColums = [
            { label: this.i18n.storageIO.ioapis.time, sortKey: 'time', key: 'time', width: '10%' },
            { label: 'DEV', key: 'dev', width: '10%' },
            { label: this.i18n.storageIO.diskio.events, key: 'event', width: '10%' },
            { label: this.i18n.storageIO.diskio.operateType,
              sortKey: 'operation_type', key: 'operation_type', width: '10%' },
            { label: this.i18n.storageIO.diskio.startBlockNo,
              sortKey: 'start_offset', key: 'start_offset', width: '10%' },
            { label: this.i18n.storageIO.diskio.blocks, sortKey: 'block', key: 'block', width: '10%' },
            { label: this.i18n.sys_res.core, sortKey: 'cpu', key: 'cpu', width: '10%' },
            { label: this.i18n.storageIO.ioapis.pid, sortKey: 'pid', key: 'pid', width: '10%' },
            { label: this.i18n.storageIO.ioapis.pidName, sortKey: 'process_name', key: 'process_name', width: '10%' },
            { label: this.i18n.common_term_task_tab_summary_callstack, key: 'stack', width: '10%' }
        ];
        this.dataList.spec = [
            { title: this.i18n.storageIO.summury.read, key: 'read' },
            { title: this.i18n.storageIO.summury.write, key: 'write' }
        ];
        this.dataList.key = [
            { title: this.i18n.storageIO.diskio.dataSize,
              key: 'data_size', ifShow: true, unit: this.i18n.storageIO.ioapis.kb },
            { title: this.i18n.storageIO.diskio.throughput,
              key: 'throughput', ifShow: true, unit: this.i18n.storageIO.ioapis.mb }
        ];

        this.delayList.spec = [
            { title: this.i18n.storageIO.summury.read, key: 'read' },
            { title: this.i18n.storageIO.summury.write, key: 'write' }
        ];
    }

    /**
     * 打开详情划框
     */
    public toggleTop(refresh?: any) {
        if (!refresh) { // 手动点击按钮
            this.topState === 'active'
                ? (this.topState = 'notActive')
                : (this.topState = 'active');
        } else {// 框选事件触发
            this.selectList = refresh;
            this.topState = 'active';
            const brushTime = this.selectList.brushTime;
            this.timeTitle = brushTime[0] + '-' + brushTime[1];
            this.getBrushData(brushTime[0], brushTime[1]);
        }

        this.toggleTopOut.emit({
            topState: this.topState,
            timeTitle: this.timeTitle
        });
    }

    /**
     * 根据框选内容,请求详细信息
     */
    public getBrushData(startTime: any, endTime: any) {
        this.nodataTips = this.i18n.loading;
        let param = '';
        this.selectKey = this.selectList.item.key;
        switch (this.selectKey) {
            case 'iops':
                this.selectKey2 = 'detail_event_org_data_by_time';
                param = 'event_org_data_by_time';
                break;
            case 'times':
                this.selectKey2 = 'detail_event_org_data_by_time';
                param = 'event_org_data_by_time';
                break;
            case 'data_size':
                this.selectKey2 = 'detail_io_op_size';
                param = 'io_op_size';
                break;
            case 'throughput':
                this.selectKey2 = 'detail_io_op_size';
                param = 'io_op_size';
                break;
            case 'd2c_delay_avg':
                this.selectKey2 = 'detail_io_op_delay';
                param = 'io_op_delay';
                this.delayList.key = [{
                  title: this.i18n.storageIO.diskio.delayTime, key: 'd2c_delay_avg',
                  ifShow: true, unit: this.i18n.storageIO.ioapis.us
                }, ];
                break;
              case 'i2d_delay_avg':
                this.selectKey2 = 'detail_io_op_delay';
                param = 'io_op_delay';
                this.delayList.key = [{
                  title: this.i18n.storageIO.diskio.delayTimeI2d, key: 'i2d_delay_avg',
                  ifShow: true, unit: this.i18n.storageIO.ioapis.us
                }, ];
                break;
            case 'queue_depth':
                this.selectKey2 = 'detail_event_org_data_by_id';
                param = 'event_org_data_by_id';
                break;
            default:
                break;
        }
        const params = {
            nodeId: this.nodeid,
            startTime,
            endTime,
        };
        this.http.get(`/tasks/${this.taskid}/ioperformance/${this.selectKey2}/`, { params }).then((resp: any) => {
            if (resp.code === HTTP_STATUS_CODE.SYSPERF_SUCCESS) {
                const data = resp.data[param].data;
                if (data) {
                    this.originData = data;
                    this.beforeDel(data, this.selectKey2);
                }
            } else {
                this.nodataTips = this.i18n.common_term_task_empty_data;
            }
        }).catch((error: any) => {
            this.nodataTips = this.i18n.common_term_task_empty_data;
        });
    }

    /**
     * 处理数据
     * @param data 源数据
     * @param key 源数据类型
     */
    public beforeDel(data: any, key: any) {
        const devList = this.selectDevArr;
        const devArr1 = devList.filter(el => {
            let hasData = false;
            if (Object.prototype.toString.call(data[el]) === '[object Object]'
             && Object.prototype.hasOwnProperty.call(data[el], 'chart')) {
                hasData = data[el].chart.length > 0;
            } else {
                hasData = data[el].length > 0;
            }
            return hasData;
        });
        this.devArr = devList.map(val => ({ label: val }));
        this.selectDev = devArr1[0] ? { label: devArr1[0] } : this.devArr[0]; // 下拉框默认选中第一个有数据的
        this.delDevData(data[this.selectDev.label], key, this.selectDev.label);
    }

    /**
     * 选择设备下拉框
     * @param e ti-select选择框选中对象
     */
    public devChange(e: any) {
        this.delDevData(this.originData[e.label], this.selectKey2, e.label);
    }

    /**
     *  选择展示设备数据
     */
    public delDevData(data: any, key: any, dev?: string) {
        this.showDetailsTable = false;
        switch (key) {
            case 'detail_event_org_data_by_time':
                this.delTimesIops(data);
                break;
            case 'detail_io_op_size':
                this.delthroughSize(data, dev);
                break;
            case 'detail_io_op_delay':
                this.delDelay(data, dev);
                break;
            case 'detail_event_org_data_by_id':
                this.delQueue(data);
                break;
            default:
                break;
        }
    }

    /**
     * 操作次数&IOPS
     */
    public delTimesIops(data: any) {
        this.tlbData.columns = this.dataSizeColumns;
        if (!data) {
            this.diskSrcData.data = [];
            return;
        }
        const dataLine: any = [];
        data.forEach((val: any, index: any) => {
            const item = val[0];
            item.showDetails = false;
            item.dev = this.selectDev.label;
            if (item.operation_type.indexOf('W') > -1) {
                item.operation_type = this.i18n.storageIO.summury.write;
            } else {
                item.operation_type = this.i18n.storageIO.summury.read;
            }
            item.children = val.slice(1);
            dataLine.push(item);
            this.diskTotalNumber = index;
        });
        this.diskSrcData.data = dataLine;
        if (dataLine.length === 0) {
            this.nodataTips = this.i18n.common_term_task_empty_data;
        }
    }

    /**
     * 展开详情
     * @param row 单列数据
     */
    public beforeToggle(row: any): void {
        // 展开时
        if (!row.showDetails) {
        // 导入数据后再将其展开
            this.diskSrcData.data.forEach((val: any) => {
                val.showDetails = false;
            });
            this.tlbData.srcData.data = row.children;
        }
        row.showDetails = !row.showDetails;
    }

    /**
     * 吞吐率和data size
     */
    public delthroughSize(data: any, dev: any) {
        this.dataList.time = [];
        this.dataList.data = this.selectList.data;
        this.dataList.data[dev].read.data_size = [];
        this.dataList.data[dev].write.data_size = [];
        this.dataList.data[dev].read.throughput = [];
        this.dataList.data[dev].write.throughput = [];
        this.dataList.devArr = [dev];
        data.detail.forEach((ele: any) => {
            this.dataList.time.push(ele.time);
            this.dataList.data[dev].read.data_size.push(ele.read[0]);
            this.dataList.data[dev].read.throughput.push(ele.read[1]);
            this.dataList.data[dev].write.data_size.push(ele.write[0]);
            this.dataList.data[dev].write.throughput.push(ele.write[1]);
        });
        setTimeout(() => {
            if (this.dataTableChart) {
                this.dataTableChart.initTable();
            }
        }, 100);
        this.tlbData.columns = this.dataSizeColumns;
        this.delayTableData = data.detail;
        this.blockData.data = [];
        this.blockData.time = [];
        data.chart.forEach((ele: any) => {
            const item = [ele.time, ele.start_offset, ele.end_offset];
            this.blockData.data.push(item);
            this.blockData.time.push(ele.time);
        });
        setTimeout(() => {
            if (this.dataBlock) {
                this.dataBlock.setData();
            }
        }, 100);
    }

    /**
     * 点击查看详情按钮
     */
    public diskViewDetails(time: any) {
        const showData = this.delayTableData.filter((val: any, idx: any) => {
            return val.time === time;
        });
        this.tlbData.total = showData.length;
        this.tlbData.srcData.data = showData.map((item: any) => {
            if (item.pid === null) { item.pid = '--'; }
            return item;
        });
        this.showDetailsTable = true;
    }

    /**
     * 关闭详情
     */
    public closeDetails(type: any) {
        this.showDetailsTable = false;
    }

    /**
     * 时延详情
     */
    public delDelay(data: any, dev: any) {
        this.delayList.data = this.selectList.data;
        this.delayList.time = [];
        this.delayList.devArr = [dev];
        this.delayList.data[dev].read.delay_avg = [];
        this.delayList.data[dev].write.delay_avg = [];
        data.forEach((ele: any) => {
            this.delayList.time.push(ele.time);
            this.delayList.data[dev].read.delay_avg.push(ele.read);
            this.delayList.data[dev].write.delay_avg.push(ele.write);
        });
        if (this.delayTableChart) {
            this.delayTableChart.initTable();
        }
        this.tlbData.columns = this.dataSizeColumns;
        this.delayTableData = data;
    }

    /**
     * 队列深度详情
     */
    public delQueue(data: any) {
        this.tlbData.columns = this.queueColums;
        this.tlbData.total = data.length;
        this.tlbData.srcData.data = data.map((item: any) => {
            item.dev = this.selectDev.label;
            if (item.operation_type.indexOf('W') > -1) {
                item.operation_type = this.i18n.storageIO.summury.write;
            } else {
                item.operation_type = this.i18n.storageIO.summury.read;
            }
            if (item.pid === null) { item.pid = '--'; }
            if (item.stack === null) { item.stack = '--'; }
            return item;
        });
    }
}
