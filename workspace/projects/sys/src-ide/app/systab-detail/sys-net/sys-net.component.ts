import { Component, OnInit, Input, ViewChild, AfterViewInit, Output, EventEmitter, } from '@angular/core';
import { AxiosService } from '../../service/axios.service';
import { I18nService } from '../../service/i18n.service';
import { MytipService } from '../../service/mytip.service';
import { VscodeService } from '../../service/vscode.service';
@Component({
    selector: 'app-sys-net',
    templateUrl: './sys-net.component.html',
    styleUrls: ['./sys-net.component.scss']
})
export class SysNetComponent implements OnInit, AfterViewInit {
    @Input() taskid: any;
    @Input() nodeid: any;
    @Input() timeLine: any;
    @ViewChild('netOk', { static: false }) netOk;
    @ViewChild('netError', { static: false }) netError;
    @Output() public networkSelectData = new EventEmitter<any>();
    @Output() public ZoomData = new EventEmitter<any>();
    @Output() public sysNetEchartsInstOut = new EventEmitter<any>();
    public okIfaceOption = [

    ];
    public errorIfaceOption = [

    ];
    public okIfaceSelected: any;
    public okTypeSelected: any;
    public errorIfaceSelected: any;
    public errorTypeSelected: any;
    public okTypeOption = [

    ];
    public errorTypeOption = [

    ];
    public okData: any;  // 存储echarts需要的数据
    public errorData: any;
    public okEchartsData = [];  // 存储echarts需要的数据
    public errorEchartsData = [];

    public resData: any;
    public resErrorData: any;
    public i18n: any;
    public transmission = true; // 接口传输数据量统计是否展示
    public malfunction = false; // 接口故障统计是否展示
    public showLoading = false;
    constructor(
        public Axios: AxiosService,
        public i18nService: I18nService,
        public mytip: MytipService,
        public vscodeService: VscodeService) {
        this.i18n = this.i18nService.I18n();
    }

    /**
     * 页面初始化时执行
     */
    ngOnInit() { }

    /**
     * 下载
     */
    public downloadCsv1() {
        let str = '';
        this.okData.spec.forEach((el, index) => {
            str += this.i18n.sys.selNet + ',' + el.label + '\n' + ',';
            this.okData.data.time.forEach(ele => {
                str += ele + ',';
            });
            str += '\n';
            this.okData.key.forEach(val => {
                str += val.label + ',';
                this.okData.data.values[el.id][val.label].forEach(element => {
                    str += element + ',';
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
        link.download = this.i18n.sys.titles.netOk + '.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    /**
     * 下载
     */
    public downloadCsv2() {
        let str = '';
        this.errorData.spec.forEach((el, index) => {
            str += this.i18n.sys.selNet + ',' + el.label + '\n' + ',';
            this.errorData.data.time.forEach(ele => {
                str += ele + ',';
            });
            str += '\n';
            this.errorData.key.forEach(val => {
                str += val.label + ',';
                this.errorData.data.values[el.id][val.label].forEach(element => {
                    str += element + ',';
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
        link.download = this.i18n.sys.titles.netError + '.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    /**
     * 页面初始化之后执行
     */
    ngAfterViewInit() {
        this.getData();
    }

    /**
     * okIfaceChange
     */
    public okIfaceChange(e) {
        this.transmission = e.show;
        if (!e.show || !e.change) {    // 如果不展示接口传输数据量统计 筛选没有变化 直接结束
            return;
        }
        this.okIfaceSelected = e.data;
        this.setOkData();
        this.okIfaceOption.forEach(item => {
            if (this.okIfaceSelected.length === 1) {
                if (item.id === this.okIfaceSelected[0].id) {
                    item.disabled = true;
                }
            } else {
                item.disabled = false;
            }
        });
        if (this.okIfaceSelected.length !== 0 && this.okTypeSelected.length !== 0) {
            setTimeout(() => {
                this.netOk.initTable();
            }, 0);
        }
    }

    /**
     * errorIfaceChange
     */
    public errorIfaceChange(e) {
        this.malfunction = e.show;
        if (!e.show || !e.change) {    // 如果不展示接口故障统计 筛选没有变化 直接结束
            return;
        }
        this.errorIfaceSelected = e.data;
        this.setErrorData();
        this.errorIfaceOption.forEach(item => {
            if (this.errorIfaceSelected.length === 1) {
                if (item.id === this.errorIfaceSelected[0].id) {
                    item.disabled = true;
                }
            } else {
                item.disabled = false;
            }
        });
        if (this.errorIfaceSelected.length !== 0 && this.errorTypeSelected.length !== 0) {
            setTimeout(() => {
                this.netError.initTable();
            }, 0);
        }
    }

    /**
     * okTypeChange
     */
    public okTypeChange(e) {
        this.transmission = e.show;
        if (!e.show || !e.change) {    // 如果不展示接口传输数据量统计 筛选没有变化 直接结束
            return;
        }
        this.okTypeSelected = e.data;
        this.setOkData();

        this.okTypeOption.forEach(item => {
            if (this.okTypeSelected.length === 1) {
                if (item.id === this.okTypeSelected[0].id) {
                    item.disabled = true;
                }
            } else {
                item.disabled = false;
            }
        });

        if (this.okTypeSelected.length !== 0 && this.okIfaceSelected.length !== 0) {
            setTimeout(() => {
                this.netOk.initTable();
            }, 0);
        }
    }

    /**
     * errorTypeChange
     */
    public errorTypeChange(e) {
        this.malfunction = e.show;
        if (!e.show || !e.change) {    // 如果不展示接口故障统计 筛选没有变化 直接结束
            return;
        }
        this.errorTypeSelected = e.data;
        this.setErrorData();
        this.errorTypeOption.forEach(item => {
            if (this.errorTypeSelected.length === 1) {
                if (item.id === this.errorTypeSelected[0].id) {
                    item.disabled = true;
                }
            } else {
                item.disabled = false;
            }
        });

        if (this.errorTypeSelected.length !== 0 && this.errorIfaceSelected.length !== 0) {
            setTimeout(() => {
                this.netError.initTable();
            }, 0);
            setTimeout(() => {
                const dom = window.document.getElementsByClassName('cpu-usage');
            }, 200);
        }
    }

    /**
     * getData
     */
    public async getData() {
        this.showLoading = true;
        const params1 = {
            'node-id': this.nodeid,
            'query-type': 'detail',
            'query-target': 'net_info'      // 例如cpu_usage, cpu_avgload, mem_usage等
        };
        this.vscodeService.get({
            url: '/tasks/' + this.taskid + '/sys-performance/?' + this.Axios.converUrl(params1)
        }, (netInfoResp: any) => {
            this.resData = netInfoResp.data;
            this.networkSelectData.emit({ allData: this.resData, type: 5 });
            this.initDatas();

            params1['query-target'] = 'net_error_info';
            this.vscodeService.get({
                url: '/tasks/' + this.taskid + '/sys-performance/?' + this.Axios.converUrl(params1)
            }, (netErrorInfoResp: any) => {
                this.resErrorData = netErrorInfoResp.data;
                this.networkSelectData.emit({ allData: this.resErrorData, type: 6 });
                this.initError();
                this.showLoading = false;
            });
        });
    }

    /**
     * initError
     */
    public initError() {
        this.initErrorIfaceOption(this.resErrorData.spec);
        this.initErrorTypeOption(this.resErrorData.key);


        this.setErrorData();
    }

    /**
     * initDatas
     */
    public initDatas() {
        this.initOkIfaceOption(this.resData.spec);
        this.initOkTypeOption(this.resData.key);

        this.setOkData();
    }

    /**
     * initOkIfaceOption
     */
    public initOkIfaceOption(data) {
        this.okIfaceOption = [];
        this.okIfaceSelected = [];
        if (data.length > 0) {
            data.forEach(item => {
                this.okIfaceOption.push({
                    label: item,
                    id: item
                });
            });
            this.okIfaceOption.forEach((item: any, index: number) => {
                if (index < 5) {
                    this.okIfaceSelected.push(item);
                    this.okIfaceOption[index].disabled = true;
                }
            });
        }
        this.networkSelectData.emit({
            allData: this.okIfaceOption, newData: this.okIfaceSelected,
            type: 1, transmission: this.transmission, malfunction: this.malfunction
        });
    }

    /**
     * initErrorIfaceOption
     */
    public initErrorIfaceOption(data) {
        this.errorIfaceOption = [];
        this.errorIfaceSelected = [];
        if (data.length > 0) {
            data.forEach(item => {
                this.errorIfaceOption.push({
                    label: item,
                    id: item
                });
            });
            this.errorIfaceOption.forEach((item: any, index: number) => {
                if (index < 5) {
                    this.errorIfaceSelected.push(item);
                    this.errorIfaceOption[index].disabled = true;
                }
            });
        }
        this.networkSelectData.emit({ allData: this.errorIfaceOption, newData: this.errorIfaceSelected, type: 3 });
    }

    /**
     * initErrorTypeOption
     */
    public initErrorTypeOption(data) {
        this.errorTypeOption = [];
        if (data.length > 0) {
            data.forEach(item => {
                this.errorTypeOption.push({
                    label: item,
                    id: item
                });
            });
            this.errorTypeOption[0].disabled = true;
            this.errorTypeSelected = [this.errorTypeOption[0]];
        }
        this.networkSelectData.emit({ allData: this.errorTypeOption, newData: this.errorTypeSelected, type: 4 });

    }

    /**
     * initOkTypeOption
     */
    public initOkTypeOption(data) {
        this.okTypeOption = [];
        if (data.length > 0) {
            data.forEach(item => {
                this.okTypeOption.push({
                    label: item,
                    id: item
                });
            });
            this.okTypeOption[2].disabled = true;
            this.okTypeOption[3].disabled = true;
            this.okTypeSelected = [this.okTypeOption[2], this.okTypeOption[3]];
        }
        this.networkSelectData.emit({ allData: this.okTypeOption, newData: this.okTypeSelected, type: 2 });
    }

    /**
     * setOkData
     */
    public setOkData() {
        this.okData = {};
        const okEchartsData = [];
        this.okEchartsData = [];
        this.okTypeSelected.forEach(element => {
            const option = {
                spec: [...this.okIfaceSelected],
                key: [...[element]],
                data: this.resData.origin_data,
                title: 'Internet Information',
                type: 'netOk'
            };
            okEchartsData.push(option);
        });
        this.okEchartsData = okEchartsData;
    }

    /**
     * setErrorData
     */
    public setErrorData() {
        this.errorData = {};
        this.errorEchartsData = [];
        const errorEchartsData = [];
        this.errorTypeSelected.forEach(element => {
            const option = {
                spec: [...this.errorIfaceSelected],
                key: [...[element]],
                data: this.resErrorData.origin_data,
                title: 'Network device failure(error)',
                type: 'netError'
            };
            errorEchartsData.push(option);
        });
        this.errorEchartsData = errorEchartsData;
    }

    /**
     * initializationData
     */
    public initializationData() {
        this.networkSelectData.emit({
            allData: this.okIfaceOption, newData: this.okIfaceSelected, type: 1,
            transmission: this.transmission, malfunction: this.malfunction
        });
        this.networkSelectData.emit({ allData: this.okTypeOption, newData: this.okTypeSelected, type: 2 });
        this.networkSelectData.emit({ allData: this.errorIfaceOption, newData: this.errorIfaceSelected, type: 3 });
        this.networkSelectData.emit({ allData: this.errorTypeOption, newData: this.errorTypeSelected, type: 4 });
    }

    /**
     * upDataTimeLine
     */
    public upDataTimeLine(data) {
        if (this.transmission) {
            this.netOk.upDateTimeLine(data);
        }
        if (this.malfunction) {
            this.netError.upDateTimeLine(data);
        }
    }

    /**
     * 数据筛选 更新时间轴
     */
    public dataZoom(e) {
        this.ZoomData.emit(e);
    }

    /**
     * 由子组件传递echartsInst
     */
    public echartsInstOut(e) {
        this.sysNetEchartsInstOut.emit(e);
    }
}
