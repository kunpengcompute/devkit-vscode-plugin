import { Component, OnInit, Input, ViewChild, NgZone, ChangeDetectorRef } from '@angular/core';
import { Utils } from '../../service/utils.service';
import { I18nService } from '../../service/i18n.service';
import { HTTP_STATUS_CODE, VscodeService } from '../../service/vscode.service';
import { SummuryDataService } from '../storage-summury/summury-data.service';
import { LeftShowService } from '../../service/left-show.service';
import { connect } from 'echarts';
import { TiModalService, TiTableColumns, TiTableRowData } from '@cloud/tiny3';
import { MessageService } from '../../service/message.service';

@Component({
    selector: 'app-ioapis',
    templateUrl: './ioapis.component.html',
    styleUrls: ['./ioapis.component.scss'],
})
export class IoapisComponent implements OnInit {

    // 时间轴组件
    @ViewChild('timeLineDetail', { static: false }) timeLineDetail;
    // 框选弹出详情组件
    @ViewChild('brushDetails', { static: false }) brushDetails;
    // 图表组件
    @ViewChild('sequenceEchart', { static: false }) sequenceEchart;

    // -- 筛选框 --
    @ViewChild('filterThreadModalComponent', { static: false }) filterThreadModalComponent: any;
    public filterThreadModal: any;

    @Input() projectName: any;
    @Input() taskName: any;
    @Input() analysisType: any;
    @Input() taskid: any;
    @Input() nodeid: any;
    @Input()
    public set select(item: any) {
        this.flameSelect = item;
        this.func = item.func;
        this.pid = item.pid;
    }
    public get select() {
        return this.flameSelect;
    }
    public flameSelect: any;
    // 不为''来判断是从summury跳转来的
    public func = '';
    public pid = '';

    public i18n: any;
    public uuid: any;
    public nodataTips = '';
    // 时间轴数据
    public timeData = [];
    public timeLine = {
        start: 0,
        end: 100
    };

    public currentPage = 1;
    public totalNumber = 0;
    public pageSize: { options: Array<number>, size: number } = {
        options: [10, 20, 30, 50],
        size: 10
    };

    // 筛选之后展示的数据
    public selectFunctionList = [];
    // 处理好的所有数据
    public totalData = [];
    // 图表框选的数据
    public brushData: object;

    public threadDisplayedData: Array<TiTableRowData> = [];
    public threadSrcData = { data: [] };

    public pidColumns: Array<TiTableColumns> = [];
    // PID选中项
    public checkedListPid: Array<any> = [];
    // 线程列
    public threadColumns: Array<TiTableColumns> = [];

    // 保存临时筛选前数据
    public someData = {
        checkedListPid: [],
        pidColumns: [],
        threadSrcData: []
    };
    // 回填一级表格触发二级表格回填锁
    public closeLock = false;
    // 上下折叠面板状态, active:展开
    public topState = 'notActive';
    public readChecked = false;
    public timeTitle = '--';
    // loading动画
    public showLoading = false;
    // 图例数据
    public legends = [];
    constructor(
        public i18nService: I18nService,
        private vscodeService: VscodeService,
        public summuryData: SummuryDataService,
        private leftShowService: LeftShowService,
        private tiModal: TiModalService,
        private zone: NgZone,
        private changeDetectorRef: ChangeDetectorRef,
        private msgService: MessageService
    ) {
        this.i18n = this.i18nService.I18n();
        this.nodataTips = this.i18n.loading;

        this.legends = [
            {
                title: this.i18n.storageIO.ioapis.Invoking_times,
                color: '#3d7ff3',
                show: true
            },
            {
                title: this.i18n.storageIO.ioapis.average_time,
                color: '#2da46f',
                show: true
            },
            {
                title: this.i18n.storageIO.ioapis.total_time,
                color: '#18aba6',
                show: true
            },
        ];

        this.threadColumns = [
            {
                title: this.i18n.storageIO.ioapis.functionName,
                width: '15%',
                key: 'fun_name',
                selected: null,
                multiple: true,
                selectAll: true,
                disabled: false,
            },
            {
                title: this.i18n.storageIO.ioapis.sysTimes,
                width: '18%',
                key: 'exec_count',
                sortKey: 'exec_count',
                disabled: false,
            },
            {
                title: this.i18n.storageIO.ioapis.average_time_s,
                width: '20%',
                key: 'avg_time',
                sortKey: 'avg_time',
                disabled: false,
            },
            {
                title: this.i18n.storageIO.ioapis.total_time_s,
                width: '19%',
                key: 'sum_time',
                sortKey: 'sum_time',
                disabled: false,
            },
            {
                title: this.i18n.storageIO.ioapis.time_ratio,
                width: '18%',
                key: 'percent',
                sortKey: 'percent',
                disabled: false,
            }
        ];
    }

    /**
     * 初始化
     */
    ngOnInit() {
        const bool = sessionStorage.getItem('brushTip');
        this.topState = bool === 'true' ? 'notActive' : 'active';
        this.readChecked = bool === 'true' ? true : false;

        this.uuid = Utils.generateConversationId(12);
        this.getData();
        if (this.summuryData.ioOriginData) {
            this.threadSrcData.data = [...this.summuryData.ioOriginData];
        }
        if (this.summuryData.ioColumns) {
            this.pidColumns = this.summuryData.ioColumns;
            if (this.pidColumns.length > 0) {
                this.pidColumns[0].selected = this.pidColumns[0].options;
            }
            if (this.pidColumns.length > 1) {
                this.pidColumns[1].selected = this.pidColumns[1].options;
            }
        }

        this.totalNumber = this.summuryData.ioTableData.length;
        if (this.totalNumber === 0) {
            this.nodataTips = this.i18n.common_term_task_nodata2;
        }
        this.threadSrcData.data.forEach((val: any) => {
            val.selected = val.options;
        });
    }


    /**
     * 获取数据
     */
    public getData() {
        this.showLoading = true;
        const params = {
            nodeId: this.nodeid,
        };
        this.vscodeService.get({
            url: '/tasks/' + this.taskid + '/ioperformance/detail_all/?' + Utils.converUrl(params)
        }, (resp: any) => {
            this.showLoading = false;
            if (resp.code === HTTP_STATUS_CODE.SYSPERF_SUCCESS) {
                const data = resp.data.detail_all.data;
                if (data && Object.keys(data).length > 0) {
                    this.delData(data);
                } else {
                    this.nodataTips = this.i18n.common_term_task_nodata2;
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
    public delData(data) {
        const pidList = Object.keys(data);
        const total1 = pidList.length - 1;
        pidList.forEach((ele, idx) => {
            const total2 = data[ele].length;
            if (idx === 0) {
                this.timeData = data[ele][0].time;
            }
            data[ele].forEach((val, num) => {
                const func = {
                    index: [num, total2, idx, total1], // 筛选第一个和最后一个分别显示图例和x轴坐标
                    func: val.fun_name,
                    pid: val.pid,
                    function: [val.fun_name + '/' + val.pid],
                    key: ['times', 'averageTime', 'totalTime'],
                    time: val.time,
                    values: {
                        times: val.count,
                        averageTime: val.avg,
                        totalTime: val.sum,
                    },
                };
                this.totalData.push(func);

            });

        });
        this.selectData();
    }

    /**
     * 处理筛选数据
     */
    public selectData() {
        this.selectFunctionList = [];
        // 从总览跳转过来的
        if (this.pid) {
            this.checkedListPid = this.threadSrcData.data.filter(val => {
                val.showDetails = false;
                if (val.pid === this.pid) {
                    val.showDetails = true;
                    val.threadCheckedList = [...val.srcData.data];
                    return val;
                }
            });
            if (this.func) {
                this.checkedListPid[0].threadCheckedList = [];
                this.checkedListPid[0].srcData.data.forEach(el => {
                    if (el.fun_name === this.func) {
                        this.checkedListPid[0].threadCheckedList.push(el);
                    }
                });
                this.selectFunctionList = this.totalData.filter((ele, idx) => {
                    return ele.func === this.func && ele.pid === this.pid;
                });
                this.selectFunctionList[0].index = [0, 0, 0, 0];
                return;
            }
            this.selectFunctionList = this.totalData.filter((ele, idx) => {
                return ele.pid === this.pid;
            });
            return;
        } else {
            if (this.threadSrcData.data) {
                this.checkedListPid = [...this.threadSrcData.data];
                this.threadSrcData.data.forEach(val => {
                    val.threadCheckedList = [...val.srcData.data];
                    val.options = val.srcData.data.map((item: any) => {
                        return { label: item.fun_name };
                    });
                    val.selected = val.options;
                });
            }

        }
        this.selectFunctionList = this.totalData;
    }

    /**
     * 时间轴筛选
     */
    public timeLineData(e) {
        this.timeLine = e;
        this.msgService.sendMessage({
            type: 'ioAPIsUpdateTime',
            data: e
        });
    }

    /**
     * 数据筛选 更新时间轴
     */
    public dataZoom(e) {
        this.timeLine = e;
        this.timeLineDetail.dataConfig(e);
        this.timeLineData(e);
    }

    /**
     * 由子组件传递echartsInst, echarts图表联动
     */
    public echartsInstOut(e) {
        if (e) {
            e.group = this.uuid;
        }
        connect(this.uuid);
    }

    /**
     * 点击图例触发事件
     */
    public clickLegned(idx) {
        const that = this;
        that.legends[idx].show = !that.legends[idx].show;
        const showLegendList = [];
        const selected = {};
        that.legends.forEach((el: any) => {
            selected[el.title] = el.show;
            if (el.show) {
                showLegendList.push(el.title);
            }
        });
        const params = { name: that.legends[idx].title, selected, type: 'legendselectchanged' };
        this.msgService.sendMessage({
            page: 'iops',
            dev: '',
            key: '',
            data: { params, showLegendList }
        });
    }

    /**
     * I/O APIs 表单筛选
     */
    public onProcessSelect(list: any): void {
        const pidList = this.pidColumns[0].selected.map(val => {
            return val.label;
        });
        const nameList = this.pidColumns[1].selected.map(val => {
            return val.label;
        });
        // 展示数据筛选
        this.threadSrcData.data = this.summuryData.ioOriginData.filter((el, idx) => {
            return pidList.indexOf(el.pid) > -1 && nameList.indexOf(el.cmd_name) > -1;
        });
        // 选中数据筛选, 筛掉的时候删除,筛出的时候不增加
        const originCheck = JSON.parse(JSON.stringify(this.checkedListPid));
        this.checkedListPid = this.threadSrcData.data.filter(val => {
            let selected = false;
            originCheck.forEach(el => {
                if (val.pid === el.pid && val.cmd_name === el.cmd_name) {
                    selected = true;
                }
            });
            // 筛掉的去掉二级表格选中项
            if (!selected) {
                val.threadCheckedList = [];
            }
            return selected;
        });

        if (this.threadSrcData.data.length === 0) {
            this.nodataTips = this.i18n.common_term_task_nodata2;
        }
        this.totalNumber = this.threadSrcData.data.length;
    }

    /**
     *  pid选择
     */
    public pidSelectChange() {
        const pidSelect = [];
        this.checkedListPid.forEach(val => {
            pidSelect.push(val.pid);
        });
        this.threadSrcData.data.forEach((el, idx) => {
            if (pidSelect.indexOf(el.pid) > -1) {
                if (el.threadCheckedList.length === 0) {
                    const leng = this.someData.threadSrcData[idx].threadCheckedList.length;
                    // 关闭筛选框,回填的情况/ 或者函数名筛选按钮回填情况
                    if (leng > 0 && leng < el.srcData.data.length && this.closeLock) {
                        el.threadCheckedList = [...this.someData.threadSrcData[idx].threadCheckedList];
                    } else {
                        el.threadCheckedList = [...el.srcData.data];
                    }
                }
            } else {
                el.threadCheckedList = [];
            }
        });
        this.closeLock = false;
    }

    /**
     * 函数选择
     * obj  进程对象
     */
    public functionSelectChange(obj) {
        const arr = this.checkedListPid.map(val => val.pid);
        setTimeout(() => {
            if (obj.threadCheckedList.length === 0) {
                this.checkedListPid = [];
                this.threadSrcData.data.forEach((val, idx) => {
                    if (obj.pid !== val.pid && arr.indexOf(val.pid) > -1) {
                        this.checkedListPid.push(val);
                    }
                });
            } else {
                // 进程id未选中的情况
                if (arr.indexOf(obj.pid) === -1) {
                    this.checkedListPid = [];
                    arr.push(obj.pid);
                    this.threadSrcData.data.forEach((val, idx) => {
                        if (arr.indexOf(val.pid) > -1) {
                            this.checkedListPid.push(val);
                        }
                    });
                }
                // 进程id下函数未全选的情况
            }
        }, 10);
    }

    /**
     * 函数筛选
     */
    public functionSelect(list, obj) {
        const funList = list.map(val => {
            return val.label;
        });
        const originSelect = JSON.parse(JSON.stringify(obj.threadCheckedList));
        obj.threadCheckedList = [];
        obj.srcData.data = obj.originData.filter(el => {
            return funList.indexOf(el.fun_name) > -1;
        });
        obj.threadCheckedList = obj.srcData.data.filter(val => {
            let selected = false;
            originSelect.forEach(el => {
                if (val.fun_name === el.fun_name) {
                    selected = true;
                }
            });
            return selected;
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
     * 弹出框展开详细按钮
     */
    public toggleTopOut(e) {
        this.topState = e.topState;
        this.timeTitle = e.timeTitle;
    }

    /**
     * 打开筛选弹窗,保存筛选状态
     */
    public onThreadScreenClick() {
        this.closeLock = false;
        this.someData.checkedListPid = [...this.checkedListPid];
        this.someData.pidColumns = [...this.pidColumns];
        this.someData.threadSrcData = this.threadSrcData.data.map(el => {
            el.threadCheckedList1 = JSON.parse(JSON.stringify(el.threadCheckedList));
            el.selected1 = JSON.parse(JSON.stringify(el.selected));
            el.srcData1 = JSON.parse(JSON.stringify(el.srcData.data));
            return el;
        });

        this.filterThreadModal = this.tiModal.open(this.filterThreadModalComponent, {
            // 定义id防止同一页面出现多个相同弹框
            id: 'filterThreadModal',
            modalClass: 'filterThreadModal',
            context: {
                confirm: (context) => {
                    context.close();
                    this.confirmFilter();
                }
            },
            dismiss: modalRef => {
                this.cancelFilter();
            },
            draggable: false
        });
    }

    /**
     * 确认筛选
     */
    public confirmFilter() {
        this.selectFunctionList = this.totalData.filter((ele: any) => {
            let bool = false;
            this.checkedListPid.forEach(el => {
                if (el.pid === ele.pid) {
                    const funSelect = el.threadCheckedList.findIndex((val: any) => {
                        return val.fun_name === ele.func;
                    });
                    bool = funSelect > -1 ? true : false;
                }
            });
            return bool;
        });
    }

    /**
     * 取消筛选
     */
    public cancelFilter() {
        setTimeout(() => {
            this.closeLock = true;
            this.checkedListPid = [...this.someData.checkedListPid];
            this.threadSrcData.data = this.someData.threadSrcData.map((val: any) => {
                val.threadCheckedList = [];
                val.srcData.data = val.originData.filter((el: any) => {
                    let bool0 = false;
                    val.srcData1.forEach((ele: any) => {
                        if (el.fun_name === ele.fun_name) {
                            bool0 = true;
                        }
                    });
                    return bool0;
                });
                val.threadCheckedList = val.srcData.data.filter((el: any) => {
                    let bool = false;
                    val.threadCheckedList1.forEach((ele: any) => {
                        if (el.fun_name === ele.fun_name) {
                            bool = true;
                        }
                    });
                    return bool;
                });
                val.selected = val.options.filter((el: any) => {
                    let bool1 = false;
                    val.selected1.forEach((ele: any) => {
                        if (el.label === ele.label) {
                            bool1 = true;
                        }
                    });
                    return bool1;
                });
                return val;
            });
            this.pidColumns[0].selected = this.pidColumns[0].options;
            this.pidColumns[1].selected = this.pidColumns[1].options;
        }, 100);
    }

    /**
     * 框选事件
     */
    public brushOut(e) {
        if (e === 'click') {
            const ele = document.querySelectorAll('.mask-box') as NodeListOf<HTMLElement>;
            ele.forEach(el => {
                el.style.display = 'none';
            });
        } else {
            if (e.brushTime.length > 0) {
                this.brushData = e;
                this.brushDetails.toggleTop(
                    e.pid, e.func,
                    e.brushTime[0], e.brushTime[e.brushTime.length - 1],
                );
            }
        }
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

    /**
     * 切换tab页显示所有数据
     */
    public showAllData() {
      this.checkedListPid = [...this.threadSrcData.data];
      this.selectFunctionList = [...this.totalData];
    }
}
