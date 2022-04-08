import { Component, OnInit, Input, ViewChild, AfterViewInit, Output, EventEmitter, } from '@angular/core';
import { AxiosService } from '../../service/axios.service';
import { I18nService } from '../../service/i18n.service';
import { MytipService } from '../../service/mytip.service';
import { VscodeService } from '../../service/vscode.service';
@Component({
    selector: 'app-sys-disk',
    templateUrl: './sys-disk.component.html',
    styleUrls: ['./sys-disk.component.scss']
})
export class SysDiskComponent implements OnInit, AfterViewInit {
    constructor(
        public Axios: AxiosService,
        public i18nService: I18nService,
        public mytip: MytipService,
        public vscodeService: VscodeService) {
        this.i18n = this.i18nService.I18n();
    }
    @Input() taskid: any;
    @Input() nodeid: any;
    @Input() timeLine: any;
    @Output() public diskSelectData = new EventEmitter<any>();
    @Output() public ZoomData = new EventEmitter<any>();
    @Output() public sysDiskEchartsInstOut = new EventEmitter<any>();

    public i18n: any;
    @ViewChild('disk', { static: false }) disk;

    public devOption = [

    ];
    public devSelected: any;
    public typeSelected: any;

    public typeOption = [

    ];

    public diskData: any;  // 存储echarts需要的数据
    public diskEchartData = [];  // 存储echarts需要的数据
    public resData: any;
    public diskShow = true; // 块设备是否展示
    public showLoading = false;

    /**
     * 页面初始化时执行
     */
    ngOnInit() {
    }

    /**
     * 下载
     */
    public downloadCsv1() {
        let str = '';
        this.diskData.spec.forEach((el, index) => {
            str += this.i18n.sys.selBlock + ',' + el.label + '\n' + ',';
            this.diskData.data.time.forEach(ele => {
                str += ele + ',';
            });
            str += '\n';
            this.diskData.key.forEach(val => {
                str += val.label + ',';
                this.diskData.data.values[el.id][val.label].forEach(element => {
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
        link.download = this.i18n.sys.titles.diskBlock + '.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }


    /**
     * 页面初始化后执行
     */
    ngAfterViewInit() {
        this.getData();
    }

    /**
     * devChange
     */
    public devChange(e) {
        this.diskShow = e.show;
        if (!e.show || !e.change) {    // 如果不展示平均负载 筛选没有变化 直接结束
            return;
        }
        this.devSelected = e.data;
        this.setDiskData();
        this.devOption.forEach(item => {
            if (this.devSelected.length === 1) {
                if (item.id === this.devSelected[0].id) {
                    item.disabled = true;
                }
            } else {
                item.disabled = false;
            }
        });
        if (this.devSelected.length !== 0 && this.typeSelected.length !== 0) {
            setTimeout(() => {
                this.disk.initTable();
            }, 0);
        }
    }

    /**
     * typeChange
     */
    public typeChange(e) {
        this.diskShow = e.show;
        if (!e.show || !e.change) {    // 如果不展示平均负载 筛选没有变化 直接结束
            return;
        }
        this.typeSelected = e.data;
        this.setDiskData();

        this.typeOption.forEach(item => {
            if (this.typeSelected.length === 1) {
                if (item.id === this.typeSelected[0].id) {
                    item.disabled = true;
                }
            } else {
                item.disabled = false;
            }
        });

        if (this.typeSelected.length !== 0 && this.devSelected.length !== 0) {
            setTimeout(() => {
                this.disk.initTable();
            }, 0);
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
            'query-target': 'disk_usage'      // 例如cpu_usage, cpu_avgload, mem_usage等


        };
        this.vscodeService.get({
            url: '/tasks/' + this.taskid + '/sys-performance/?'
                + this.Axios.converUrl(params1)
        }, (usageResp: any) => {
            this.resData = usageResp.data;
            this.diskSelectData.emit({ allData: this.resData, newData: this.devSelected, type: 3 });
            this.initDatas();
            this.showLoading = false;
        });
    }

    /**
     * initDatas
     */
    public initDatas() {
        this.initDevOption(this.resData.spec);
        this.initTypeOption(this.resData.key);
        for (const key of Object.keys(this.resData.origin_data.values)) {
            for (const key2 of Object.keys(this.resData.origin_data.values[key])) {
                if (key2 === 'util') {
                    this.resData.origin_data.values[key][key2] =
                        this.resData.origin_data.values[key][key2].map(item => item * 100);
                }
            }
        }
        this.setDiskData();
    }

    /**
     * initDevOption
     */
    public initDevOption(data) {
        this.devOption = [];
        this.devSelected = [];
        if (data.length > 0) {
            data.forEach(item => {
                this.devOption.push({
                    label: item,
                    id: item
                });
            });
            this.devOption.forEach((item: any, index: number) => {
                if (index < 5) {
                    this.devSelected.push(item);
                    this.devOption[index].disabled = true;
                }
            });
        }
        this.diskSelectData.emit({
            allData: this.devOption, newData: this.devSelected, type: 1, diskShow: this.diskShow
        });

    }

    /**
     * initTypeOption
     */
    public initTypeOption(data) {
        this.typeOption = [];
        if (data.length > 0) {
            data.forEach(item => {
                this.typeOption.push({
                    label: item,
                    id: item
                });
            });
            this.typeOption[0].disabled = true;
            this.typeSelected = [this.typeOption[0]];
        }
        this.diskSelectData.emit({ allData: this.typeOption, newData: this.typeSelected, type: 2 });

    }

    /**
     * setDiskData
     */
    public setDiskData() {
        this.diskData = {};
        const diskEchartData = [];
        this.diskEchartData = [];
        this.typeSelected.forEach(element => {
            const option = {
                spec: [...this.devSelected],
                key: [...[element]],
                data: this.resData.origin_data,
                title: 'CPU Usage',
                type: 'disk'
            };
            diskEchartData.push(option);
        });

        this.diskEchartData = diskEchartData;
    }

    /**
     * initializationData
     */
    public initializationData() {
        this.diskSelectData.emit({
            allData: this.devOption, newData: this.devSelected, type: 1, diskShow: this.diskShow
        });
        this.diskSelectData.emit({ allData: this.typeOption, newData: this.typeSelected, type: 2 });
    }

    /**
     * 时间轴筛选
     */
    public upDataTimeLine(data) {
        if (this.diskShow) {
            this.disk.upDateTimeLine(data);
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
        this.sysDiskEchartsInstOut.emit(e);
    }

}
