import { HTTP_STATUS_CODE, isLightTheme, VscodeService } from '../../service/vscode.service';
import { I18nService } from '../../service/i18n.service';
import { Utils } from '../../service/utils.service';
import { Component, OnInit, Input, ViewChild, NgZone, ChangeDetectorRef } from '@angular/core';
import { TiModalService, TiTableColumns, TiTableRowData } from '@cloud/tiny3';
import { SummuryDataService } from '../storage-summury/summury-data.service';
import { MessageService } from '../../service/message.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'app-diskio',
    templateUrl: './diskio.component.html',
    styleUrls: ['./diskio.component.scss'],
})
export class DiskioComponent implements OnInit {
    // 时间轴组件
    @ViewChild('timeLineDetail', { static: false }) timeLineDetail;
    // -- 筛选框 --
    @ViewChild('diskFilterThreadModalComponent', { static: false }) diskFilterThreadModalComponent: any;
    // 详情组件
    @ViewChild('brushDetails', { static: false }) brushDetails: any;
    public filterThreadModal: any;
    @Input() projectName: any;
    @Input() taskName: any;
    @Input() analysisType: any;
    @Input() taskid: any;
    @Input() nodeid: any;
    @Input() // 从总览页面来的筛选设备
    public set select(item: any) {
        this.flameSelect = item;
        this.dev = item.dev;
    }
    public get select() {
        return this.flameSelect;
    }
    // 框选数据
    public brushKeyData: object;
    public flameSelect: any;
    // 不为''来判断是从summury跳转来的
    public dev = '';
    public nodataTips = '';
    public i18n: any;
    public uuid: any;
    public timeLine = {
        start: 0,
        end: 100
    };
    public selectFunctionList: any = {
        showLe: false,
        showAxis: false,
        spec: [],
        key: [],
        devArr: [],
        time: [],
        data: {},
    };
    // 将show的指标拆开来
    public chartList: any = [];
    // 所有show的指标
    public showKeys: Array<any>;
    // 选择show的指标
    public selectShowKeys: Array<any>;
    public ifNoData = false;
    // 被选中的列表
    public threadCheckedList: any = [];
    // 保存筛选取消前的状态
    public someData: any = {};
    //  表头筛选数据
    public diskTitle: Array<TiTableColumns> = [];
    public originDiskData: any = [];
    // 判断Top筛选是否展示
    public showTopData: any = [];
    // 自定义筛选
    public custermSelect = true;
    // 表头右边筛选箭头
    public disksHeadShow = false;
    public threadColumns: Array<TiTableColumns> = [];
    public diskCheckedData: Array<any> = [];
    // 筛选弹出框表格数据源
    public threadDisplayedData: Array<TiTableRowData> = [];
    public threadSrcData: any = { data: [] };
    // 筛选弹出框表格分页组件
    public currentPage = 1;
    public totalNumber = 0;
    public pageSize: { options: Array<number>, size: number } = {
        options: [10, 20, 30, 50],
        size: 10
    };
    public disData: any = []; // 分布图数据
    // 上下折叠面板状态, active:展开
    public topState = 'notActive';
    public readChecked = false;
    public timeTitle = '--';
    // loading动画
    public showLoading = false;
    public filterImg = './assets/img/micarch/filterNormal.svg';

    constructor(
        public sanitizer: DomSanitizer,
        public i18nService: I18nService,
        private vscodeService: VscodeService,
        public summuryData: SummuryDataService,
        private msgService: MessageService,
        private tiModal: TiModalService,
        private zone: NgZone,
        public changeDetectorRef: ChangeDetectorRef
    ) {
        this.i18n = this.i18nService.I18n();
        this.nodataTips = this.i18n.loading;
        this.showKeys = [
            {
                title: this.i18n.storageIO.diskio.oprateTimes,
                key: 'times',
                ifShow: true,
                unit: this.i18n.storageIO.ioapis.times
            },
            { title: 'IOPS', key: 'iops', ifShow: true, unit: this.i18n.storageIO.ioapis.times },
            {
                title: this.i18n.storageIO.diskio.dataSize,
                key: 'data_size',
                ifShow: true,
                unit: this.i18n.storageIO.ioapis.kb
            },
            {
                title: this.i18n.storageIO.diskio.throughput,
                key: 'throughput',
                ifShow: true,
                unit: this.i18n.storageIO.ioapis.mb
            },
            {
                title:
                    this.i18n.storageIO.diskio.delayTimeI2d,
                key: 'i2d_delay_avg',
                ifShow: true,
                unit: this.i18n.storageIO.ioapis.us
            },
            {
                title:
                    this.i18n.storageIO.diskio.delayTime,
                key: 'd2c_delay_avg',
                ifShow: true,
                unit: this.i18n.storageIO.ioapis.us
            },
            { title: this.i18n.storageIO.diskio.queueDepth, key: 'queue_depth', ifShow: true, unit: '' },
        ];
        this.showTopData = [
            { title: this.i18n.storageIO.diskio.top_ior, key: 'read.times', ifShow: false, },
            { title: this.i18n.storageIO.diskio.top_iow, key: 'write.times', ifShow: false },
            { title: this.i18n.storageIO.diskio.top_iopsr, key: 'read.iops', ifShow: false },
            { title: this.i18n.storageIO.diskio.top_iopsw, key: 'write.iops', ifShow: false },
            { title: this.i18n.storageIO.diskio.top_datar, key: 'read.data_size', ifShow: false },
            { title: this.i18n.storageIO.diskio.top_dataw, key: 'write.data_size', ifShow: false },
            { title: this.i18n.storageIO.diskio.top_thr, key: 'read.throughput', ifShow: false },
            { title: this.i18n.storageIO.diskio.top_thw, key: 'write.throughput', ifShow: false },
            { title: this.i18n.storageIO.diskio.top_delayr_i2d, key: 'read.i2d_delay_avg', ifShow: false },
            { title: this.i18n.storageIO.diskio.top_delayw_i2d, key: 'write.i2d_delay_avg', ifShow: false },
            { title: this.i18n.storageIO.diskio.top_delayr, key: 'read.d2c_delay_avg', ifShow: false },
            { title: this.i18n.storageIO.diskio.top_delayw, key: 'write.d2c_delay_avg', ifShow: false },
            { title: this.i18n.storageIO.diskio.top_queue, key: 'read.queue_depth', ifShow: false },
            { title: this.i18n.common_term_task_start_custerm, key: 'custerm', ifShow: true },
        ];
        this.threadColumns = [
            {
                title: 'DEV',
                width: '6%',
                key: 'dev',
                searchable: true, // 该列的 headfilter 的下拉中是否开启搜索功能
                selected: null,
                multiple: true,
                selectAll: true,
                options: [],
                show: true,
                disabled: true
            },
            {
                title: this.i18n.storageIO.summury.roprateTime,
                width: '10%',
                key: 'read_times',
                sortKey: 'read_times',
                show: true,
                disabled: false
            },
            {
                title: this.i18n.storageIO.summury.woprateTime,
                width: '10%',
                key: 'write_times',
                sortKey: 'write_times',
                show: true,
                disabled: false
            },
            {
                title: this.i18n.storageIO.summury.riops,
                width: '8%',
                key: 'r_iops',
                sortKey: 'r_iops',
                show: true,
                disabled: false
            },
            {
                title: this.i18n.storageIO.summury.wiops,
                width: '8%',
                key: 'w_iops',
                sortKey: 'w_iops',
                show: true,
                disabled: false
            },
            {
                title: this.i18n.storageIO.summury.rdataSize,
                width: '10%',
                key: 'read_size',
                sortKey: 'read_size',
                show: true,
                disabled: true
            },
            {
                title: this.i18n.storageIO.summury.wdataSize,
                width: '10%',
                key: 'write_size',
                sortKey: 'write_size',
                show: true,
                disabled: true
            },
            {
                title: this.i18n.storageIO.summury.rrate,
                width: '11%',
                key: 'r_throughput',
                sortKey: 'r_throughput',
                show: true,
                disabled: true
            },
            {
                title: this.i18n.storageIO.summury.wrate,
                width: '11%',
                key: 'w_throughput',
                sortKey: 'w_throughput',
                show: true,
                disabled: true
            },
            {
                title: this.i18n.storageIO.summury.i2drdelay,
                width: '11%',
                key: 'i2d_r_delay',
                sortKey: 'i2d_r_delay',
                show: true,
                disabled: true,
            },
            {
                title: this.i18n.storageIO.summury.i2dwdelay,
                width: '11%',
                key: 'i2d_w_delay',
                sortKey: 'i2d_w_delay',
                show: true,
                disabled: true,
            },
            {
                title: this.i18n.storageIO.summury.rdelay,
                width: '11%',
                key: 'd2c_r_delay',
                sortKey: 'd2c_r_delay',
                show: true,
                disabled: true
            },
            {
                title: this.i18n.storageIO.summury.wdelay,
                width: '11%',
                key: 'd2c_w_delay',
                sortKey: 'd2c_w_delay',
                show: true,
                disabled: true
            },
            {
                title: this.i18n.storageIO.diskio.queueDepth,
                width: '11%',
                key: 'queue_depth',
                sortKey: 'queue_depth',
                show: true,
                disabled: true
            }
        ];
        this.diskTitle = this.threadColumns.slice(0, 3);
        this.diskCheckedData = this.diskTitle;
    }

    /**
     * 初始化
     */
    ngOnInit() {
        if (isLightTheme) {
            this.filterImg = './assets/img/micarch/filterNormal-light.svg';
        }
        const bool = sessionStorage.getItem('brushTip');
        this.topState = bool === 'true' ? 'notActive' : 'active';
        this.readChecked = bool === 'true' ? true : false;
        this.uuid = Utils.generateConversationId(12);
        this.threadSrcData.data = this.summuryData.diskTableData;
        this.totalNumber = this.summuryData.diskTableData.length;
        this.getData();
    }

    /**
     * 获取数据
     */
    public getData() {
        this.showLoading = true;
        const params = {
            nodeId: encodeURIComponent(this.nodeid),
        };
        const url = '/tasks/' + this.taskid + '/ioperformance/detail_io_op_all/?' + Utils.converUrl(params);
        this.vscodeService.get({
            url
        }, (resp: any) => {
            this.showLoading = false;
            if (resp.code === HTTP_STATUS_CODE.SYSPERF_SUCCESS) {
                this.originDiskData = resp.data.io_op_all.data;
                const data = resp.data.io_op_all.data.val;
                this.selectFunctionList.devArr = [];
                if (data && Object.keys(data).length > 0) {
                    const devArr = Object.keys(data);
                    const test = devArr.map(val => {
                        if (Object.prototype.hasOwnProperty.call(data[val], 'time')) {
                            this.selectFunctionList.time = data[val].time;
                            return;
                        }
                    });
                    // 如果是从总览跳转过来的
                    if (this.dev) {
                        if (data[this.dev]) {
                            this.selectFunctionList.devArr = [this.dev];
                            this.ifNoData = false;
                        } else {
                            this.ifNoData = true;
                        }
                        this.threadCheckedList = this.threadSrcData.data.filter((el: any) => {
                            return el.dev === this.dev;
                        });
                    } else {
                        this.threadCheckedList = this.threadSrcData.data.filter((el: any) => {
                            return !el.is_empty;
                        });
                        this.selectFunctionList.devArr = this.threadCheckedList.map((val: any) => val.dev);
                    }
                    this.delData(data);
                }
            } else {
                const message = {
                    cmd: 'showInfoBox',
                    data: {
                        info: resp.message,
                        type: 'warn'
                    }
                };
                this.vscodeService.postMessage(message, null);
                this.nodataTips = this.i18n.common_term_task_nodata2;
            }
            this.updateWebViewPage();
        });
    }

    /**
     * 处理请求数据
     */
    public delData(data: any) {
        this.selectFunctionList.spec = [
            { title: this.i18n.storageIO.summury.read, key: 'read' },
            { title: this.i18n.storageIO.summury.write, key: 'write' }
        ];
        if (!this.custermSelect) {  // 非自定义数据
            const selectType = this.showTopData.find((val: any) => val.ifShow);
            const selectArr = selectType.key.split('.');
            const selectDevArr = this.originDiskData.top[selectArr[0]][selectArr[1]];
            this.selectFunctionList.devArr = selectDevArr;
            this.showKeys = this.showKeys.map(val => {
                val.ifShow = val.key === selectArr[1] ? true : false;
                return val;
            });
            this.selectFunctionList.spec = this.selectFunctionList.spec.filter((el: any) => {
                return el.key === selectArr[0];
            });
        } else {
            this.selectFunctionList.devArr = this.threadCheckedList.map((el: any) => {
                return el.dev;
            });
        }

        this.selectFunctionList.devArr.forEach((el: any) => {
            this.disData[el] = this.originDiskData.val[el];
        });
        const keyLest = this.showKeys.filter((el) => el.ifShow === true);
        this.selectFunctionList.data = data;
        this.chartList = [];
        // key: 指标; spec: 读/写;
        keyLest.forEach((el, idx) => {
            const showLe = idx === 0 || el.key === 'queue_depth' ? true : false;
            const showAxis = idx === keyLest.length - 1 ? true : false;
            this.selectFunctionList.showLe = showLe;
            this.selectFunctionList.showAxis = showAxis;
            this.selectFunctionList.key = [el];
            if (el.key === 'queue_depth') {
                this.selectFunctionList.spec = [{ title: this.i18n.storageIO.summury.read, key: 'read' }];
            }
            this.chartList.push(JSON.parse(JSON.stringify(this.selectFunctionList)));
        });

    }

    /**
     *  时间轴筛选
     * @param e  时间
     */
    public timeLineData(e: any) {
        this.timeLine = e;
        this.msgService.sendMessage({
            type: 'diskioUpdateTime',
            data: e
        });
    }

    /**
     * 数据筛选 更新时间轴
     * @param e 时间
     */
    public dataZoom(e: any) {
        this.timeLine = e;
        this.timeLineDetail.dataConfig(e);
        this.timeLineData(e);
    }

    /**
     * 框选事件
     */
    public brushOut(e: any) {
        if (e === 'click') {
            const ele = document.querySelectorAll('.mask-box') as NodeListOf<HTMLElement>;
            ele.forEach(el => {
                el.style.display = 'none';
            });
        } else {
            if (e.brushTime.length > 0) {
                this.brushKeyData = JSON.parse(JSON.stringify(e));
                this.brushDetails.toggleTop(this.brushKeyData);
            }
        }
    }

    /**
     * 自定义筛选
     */
    public onThreadScreenClick() {
        this.someData.devList = this.threadCheckedList.map((el: any) => el.dev);
        this.someData.showTopData = JSON.parse(JSON.stringify(this.showTopData));
        this.someData.showKeys = JSON.parse(JSON.stringify(this.showKeys));
        this.someData.custermSelect = this.custermSelect;

        this.filterThreadModal = this.tiModal.open(this.diskFilterThreadModalComponent, {
            // 定义id防止同一页面出现多个相同弹框
            id: 'diskFilterThreadModal',
            modalClass: 'diskFilterThreadModal',
            context: {
                confirm: (context) => {
                    context.close();
                    this.onSelectConfirm();
                }
            },
            dismiss: modalRef => {
                this.onSelectCancel();
            },
            draggable: false
        });
    }

    /**
     * top数据筛选,单选
     */
    public selectTopData(item: any, index: any) {
        if (this.showTopData[index].ifShow === true) { return; }
        this.showTopData.forEach((val: any, idx: any) => {
            val.ifShow = false;
        });
        this.showTopData[index].ifShow = true;
        const arrLength = this.showTopData.length;
        if (index === arrLength - 1) { // 自定义筛选
            this.custermSelect = this.showTopData[index].ifShow;
        } else {
            this.custermSelect = false;
        }
    }

    /**
     * 磁盘弹出筛选框表头筛选
     */
    public diskHeaderChange() {
        const length = this.diskCheckedData.length;
        const arr: any = [];
        this.diskCheckedData.forEach((value) => {
            arr.push(value.title);
        });
        if (length < 3) {
            this.threadColumns.forEach((item, index) => {
                if (item.key !== 'dev') {
                    item.disabled = false;
                }
            });
        } else {
            this.threadColumns.forEach((item, index) => {
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
     * 筛选弹出框-指标选择,多选
     */
    public keySelect(item: any, index: any) {
        const selectArr = this.showKeys.filter((val, idx) => {
            return val.ifShow;
        });
        // 至少选择一个指标
        if (selectArr.length < 2 && item.ifShow) { return; }
        this.showKeys[index].ifShow = !this.showKeys[index].ifShow;
    }

    /**
     * 筛选弹框确认
     */
    public onSelectConfirm() {
        this.delData(this.originDiskData.val);
    }

    /**
     * 筛选弹框取消
     */
    public onSelectCancel(str?: any) {
        this.threadCheckedList = this.threadSrcData.data.filter((el: any) => {
            return !el.is_empty && this.someData.devList.indexOf(el.dev) > -1;
        });
        this.showTopData = this.someData.showTopData;
        this.showKeys = this.someData.showKeys;
        this.custermSelect = this.someData.custermSelect;
    }

    /**
     * 弹出框展开详细按钮
     */
    public toggleTopOut(e) {
        this.topState = e.topState;
        this.timeTitle = e.timeTitle;
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

    public closeFilter() {
        this.disksHeadShow = false;
    }
    public showAllData() {
        this.threadCheckedList = this.threadSrcData.data.filter((el: any) => {
            return !el.is_empty;
        });
        this.delData(this.originDiskData.val);
    }
}
