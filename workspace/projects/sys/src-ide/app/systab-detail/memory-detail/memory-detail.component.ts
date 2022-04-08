import {
    Component,
    OnInit,
    Input,
    AfterViewInit,
    ViewChild,
    Output, EventEmitter, ChangeDetectorRef,
} from '@angular/core';
import { AxiosService } from '../../service/axios.service';
import { I18nService } from '../../service/i18n.service';
import { MytipService } from '../../service/mytip.service';
import { VscodeService } from '../../service/vscode.service';
import { Utils } from 'projects/sys/src-ide/app/service/utils.service';
@Component({
    selector: 'app-memory-detail',
    templateUrl: './memory-detail.component.html',
    styleUrls: ['./memory-detail.component.scss'],
})
export class MemoryDetailComponent implements OnInit, AfterViewInit {
    @ViewChild('usage', { static: false }) usage;
    @ViewChild('pag', { static: false }) pag;
    @ViewChild('swap', { static: false }) swap;
    @Input() taskid: any;
    @Input() nodeid: any;
    @Input() timeLine: any;
    @Output() public memorySelectData = new EventEmitter<any>();
    @Output() public ZoomData = new EventEmitter<any>();
    @Output() public memoryEchartsInstOut = new EventEmitter<any>();
    public usageData: any;
    public resUsageData: any;
    public pagData: any;
    public resPagData: any;
    public swapData: any;
    public resSwapData: any;
    public usageTypeOption = [];
    public usageTypeSelected: any;
    public pagOption = [];
    public pagSelected: any;
    public swapOption = [];
    public swapSelected: any;
    public i18n: any;
    public memoryUtilization = true; // 内存利用率是否展示
    public Pagination = false; // 内存分页统计是否展示
    public exchange = false; // 交换统计是否展示
    public usagEcharteData = []; //  内存利用率
    public pageEcharteData = []; // 分页统计
    public swapEcharteData = []; // 交换统计
    public showLoading = false;
    constructor(
        public Axios: AxiosService,
        public i18nService: I18nService,
        public mytip: MytipService, public vscodeService: VscodeService,
        private changeDetectorRef: ChangeDetectorRef
    ) {
        this.i18n = this.i18nService.I18n();
    }

    /**
     * 组件初始化时执行
     */
    ngOnInit() {
    }

    /**
     * 组件初始化后执行
     */
    ngAfterViewInit() {
        this.getData();
    }

    /**
     * 下载
     */
    public downloadCsv1() {
        let str = ',';
        this.usageData.data.time.forEach((ele) => {
            str += ele + ',';
        });
        str += '\n';
        this.usageData.key.forEach((val) => {
            str += val.label + ',';
            this.usageData.data.values[val.id].forEach((element) => {
                str += element + ',';
            });
            str += '\n';
        });
        // encodeURIComponent解决中文乱码
        const uri = 'data:text/csv;charset=utf-8,\ufeff' + encodeURIComponent(str);
        // 通过创建a标签实现
        const link = document.createElement('a');
        link.href = uri;
        // 对下载的文件命名
        link.download = this.i18n.sys.titles.memUsage + '.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    /**
     * 下载
     */
    public downloadCsv2() {
        let str = ',';
        this.pagData.data.time.forEach((ele) => {
            str += ele + ',';
        });
        str += '\n';
        this.pagData.key.forEach((val) => {
            str += val.label + ',';
            this.pagData.data.values[val.id].forEach((element) => {
                str += element + ',';
            });
            str += '\n';
        });
        // encodeURIComponent解决中文乱码
        const uri = 'data:text/csv;charset=utf-8,\ufeff' + encodeURIComponent(str);
        // 通过创建a标签实现
        const link = document.createElement('a');
        link.href = uri;
        // 对下载的文件命名
        link.download = this.i18n.sys.titles.memPag + '.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    /**
     * 下载
     */
    public downloadCsv3() {
        let str = ',';
        this.swapData.data.time.forEach((ele) => {
            str += ele + ',';
        });
        str += '\n';
        this.swapData.key.forEach((val) => {
            str += val.label + ',';
            this.swapData.data.values[val.id].forEach((element) => {
                str += element + ',';
            });
            str += '\n';
        });
        // encodeURIComponent解决中文乱码
        const uri = 'data:text/csv;charset=utf-8,\ufeff' + encodeURIComponent(str);
        // 通过创建a标签实现
        const link = document.createElement('a');
        link.href = uri;
        // 对下载的文件命名
        link.download = this.i18n.sys.titles.memSwap + '.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    /**
     * getData
     */
    public async getData() {
        this.showLoading = true;
        const params1 = {
            'node-id': this.nodeid,
            'query-type': 'detail',
            'query-target': 'mem_usage', // 例如cpu_usage, cpu_avgload, mem_usage等
        };
        this.vscodeService.get({
            url: '/tasks/' + this.taskid + '/sys-performance/?'
                + this.Axios.converUrl(params1)
        }, (usageResp: any) => {
            this.resUsageData = usageResp.data;
            this.initUsageData();

            params1['query-target'] = 'mem_page';
            this.vscodeService.get({
                url: '/tasks/' + this.taskid + '/sys-performance/?'
                    + this.Axios.converUrl(params1)
            }, (pageResp: any) => {
                this.resPagData = pageResp.data;
                this.initPagData();

                params1['query-target'] = 'mem_swap';
                this.vscodeService.get({
                    url: '/tasks/' + this.taskid + '/sys-performance/?'
                        + this.Axios.converUrl(params1)
                }, (swapResp: any) => {
                    this.resSwapData = swapResp.data;
                    this.initSwapData();
                });
            });
            this.showLoading = false;
        });
        if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
            this.changeDetectorRef.markForCheck();
            this.changeDetectorRef.detectChanges();
        }
    }

    /**
     * usageTypeChange
     */
    public usageTypeChange(e) {
        this.memoryUtilization = e.show;
        if (!e.show) {    // 如果不展示平均负载 直接结束
            return;
        }
        if (!e.change) {  // 如果筛选没有变化 直接结束
            return;
        }
        this.usageTypeSelected = e.data;
        this.setUsageData();
        this.usageTypeOption.forEach((item) => {
            if (this.usageTypeSelected.length === 1) {
                if (item.id === this.usageTypeSelected[0].id) {
                    item.disabled = true;
                }
            } else {
                item.disabled = false;
            }
        });
        if (this.usageTypeSelected.length !== 0) {
            setTimeout(() => {
                this.usage.initTable();
            }, 0);
        }
    }

    /**
     * pagChange
     */
    public pagChange(e) {
        this.Pagination = e.show;
        if (!e.show) {    // 如果不展示平均负载 直接结束
            return;
        }
        if (!e.change) {  // 如果筛选没有变化 直接结束
            return;
        }
        this.pagSelected = e.data;
        this.setPagData();
        this.pagOption.forEach((item) => {
            if (this.pagSelected.length === 1) {
                if (item.id === this.pagSelected[0].id) {
                    item.disabled = true;
                }
            } else {
                item.disabled = false;
            }
        });
        if (this.pagSelected.length !== 0) {
            setTimeout(() => {
                this.pag.initTable();
            }, 0);
        }
    }

    /**
     * swapChange
     */
    public swapChange(e) {
        this.exchange = e.show;
        if (!e.show) {    // 如果不展示平均负载 直接结束
            return;
        }
        if (!e.change) {  // 如果筛选没有变化 直接结束
            return;
        }
        this.swapSelected = e.data;
        this.setSwapData();
        this.swapOption.forEach((item) => {
            if (this.swapSelected.length === 1) {
                if (item.id === this.swapSelected[0].id) {
                    item.disabled = true;
                }
            } else {
                item.disabled = false;
            }
        });
        if (this.swapSelected.length !== 0) {
            setTimeout(() => {
                this.swap.initTable('swap');
            }, 0);
        }
    }

    /**
     * initUsageTypeOption
     */
    public initUsageTypeOption(data) {
        this.usageTypeOption = [];
        if (data.length > 0) {
            data.forEach((item) => {
                this.usageTypeOption.push({
                    label: item,
                    id: item,
                });
            });
            this.usageTypeOption[0].disabled = true;
            this.usageTypeSelected = [this.usageTypeOption[0]];
        }
        this.memorySelectData.emit({
            allData: this.usageTypeOption, newData: this.usageTypeSelected,
            type: 1, memoryUtilization: this.memoryUtilization, Pagination: this.Pagination, exchange: this.exchange
        });
    }

    /**
     * initPagOption
     */
    public initPagOption(data) {
        this.pagOption = [];
        if (data.length > 0) {
            data.forEach((item) => {
                this.pagOption.push({
                    label: item,
                    id: item,
                });
            });
            this.pagOption[0].disabled = true;
            this.pagSelected = [this.pagOption[0]];
        }
        this.memorySelectData.emit({ allData: this.pagOption, newData: this.pagSelected, type: 2 });
    }

    /**
     * initSwapOption
     */
    public initSwapOption(data) {
        this.swapOption = [];
        if (data.length > 0) {
            data.forEach((item) => {
                this.swapOption.push({
                    label: item,
                    id: item,
                });
            });
            this.swapOption[0].disabled = true;
            this.swapSelected = [this.swapOption[0]];
        }
        this.memorySelectData.emit({ allData: this.swapOption, newData: this.swapSelected, type: 3 });

    }

    /**
     * initUsageData
     */
    public initUsageData() {
        this.initUsageTypeOption(this.resUsageData.key);
        this.setUsageData();
    }

    /**
     * initPagData
     */
    public initPagData() {
        this.initPagOption(this.resPagData.key);
        this.setPagData();
    }

    /**
     * initSwapData
     */
    public initSwapData() {
        this.initSwapOption(this.resSwapData.key);
        this.setSwapData();
    }

    /**
     * setUsageData
     */
    public setUsageData() {
        this.usageData = {};
        const usagEcharteData = [];
        this.usagEcharteData = [];
        this.usageTypeSelected.forEach(element => {
            const option = {
                spec: [],
                key: [...[element]],
                data: this.resUsageData.origin_data,
                title: 'Memory Usage',
                type: 'Memory Usage',
            };
            usagEcharteData.push(option);
        });
        this.usagEcharteData = usagEcharteData;
    }

    /**
     * setPagData
     */
    public setPagData() {
        this.pagData = {};
        const pageEcharteData = [];
        this.pageEcharteData = [];
        this.pagSelected.forEach(element => {
            const option = {
                spec: [],
                key: [...[element]],
                data: this.resPagData.origin_data,
                title: 'Pagination',
                type: 'pag', // 生成单位的时候需要用到
            };
            pageEcharteData.push(option);
        });
        this.pageEcharteData = pageEcharteData;
    }

    /**
     * setSwapData
     */
    public setSwapData() {
        this.swapData = {};
        const swapEcharteData = [];
        this.swapEcharteData = [];
        this.swapSelected.forEach(element => {
            const option = {
                spec: [],
                key: [...[element]],
                data: this.resSwapData.origin_data,
                title: 'Swap partition',
                type: 'memswap', // 生成单位的时候需要用到
                suggestion: this.resSwapData.suggestion,
            };
            swapEcharteData.push(option);
        });
        this.swapEcharteData = swapEcharteData;
    }

    /**
     * initializationData
     */
    public initializationData() {
        this.memorySelectData.emit({
            allData: this.usageTypeOption, newData: this.usageTypeSelected, type: 1,
            memoryUtilization: this.memoryUtilization, Pagination: this.Pagination, exchange: this.exchange
        });
        this.memorySelectData.emit({ allData: this.pagOption, newData: this.pagSelected, type: 2 });
        this.memorySelectData.emit({ allData: this.swapOption, newData: this.swapSelected, type: 3 });
    }

    /**
     * 筛选数据
     */
    public upDataTimeLine(data) {
        if (this.memoryUtilization) {
            this.usage.upDateTimeLine(data);
        }
        if (this.Pagination) {
            this.pag.upDateTimeLine(data);
        }
        if (this.exchange) {
            this.swap.upDateTimeLine(data);
        }
    }

    /**
     * 时间轴传过来的数据
     */
    public dataZoom(e) {
        this.ZoomData.emit(e);
    }

    /**
     * 由子组件传递echartsInst
     */
    public echartsInstOut(e) {
        this.memoryEchartsInstOut.emit(e);
    }
}
