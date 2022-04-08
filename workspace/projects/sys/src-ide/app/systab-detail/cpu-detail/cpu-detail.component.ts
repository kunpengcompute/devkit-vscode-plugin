import { Component, OnInit, Input, Output, EventEmitter, AfterViewInit, ViewChild } from '@angular/core';
import { Utils } from 'projects/sys/src-ide/app/service/utils.service';
import { AxiosService } from '../../service/axios.service';
import { I18nService } from '../../service/i18n.service';
import { MytipService } from '../../service/mytip.service';
import { VscodeService } from '../../service/vscode.service';
@Component({
    selector: 'app-cpu-detail',
    templateUrl: './cpu-detail.component.html',
    styleUrls: ['./cpu-detail.component.scss']
})
export class CpuDetailComponent implements OnInit, AfterViewInit {
    @Input() taskid: any;
    @Input() nodeid: any;
    @Input() timeLine: any;
    @ViewChild('cpuUsage', { static: false }) cpuUsage;
    @ViewChild('cpuAverage', { static: false }) cpuAverage;
    @Output() public cpuAverageData = new EventEmitter<any>();
    @Output() public ZoomData = new EventEmitter<any>();
    @Output() public cpuEchartsInstOut = new EventEmitter<any>();
    public index = 0;
    public butValue = [];
    public checkzhibiao = [];
    public cpu = 'cpu';
    public numaList: any;
    public cpuNumsOption = [];
    public numaOption = [];
    public cpuNumSelected = [];
    public cpuTypeSelected: any;
    public cpuTypeSelected2: any;
    public numaSelected: any = [];
    public cpuTypeOption = [];
    public cpuTypeOption2 = [];
    public cpuData: any;  // 存储echarts需要的数据
    public averageData: any;
    public orignData: any;
    public averageOrignData: any;
    public resData: any;
    public resAverageData: any;
    public i18n: any;
    public averageShow = true; // 平均负载是否展示
    public UtilizationShow = true; // cpu利用率是否展示
    public cpuEchartData = [];  // cpu利用率 循环数据
    public averageEchartData = [];  // cpu利用率 循环数据
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
    ngOnInit() {
        this.showLoading = true;
        this.getCpuUsageData();
        this.getCpuAvgloadData();
    }

    /**
     * 组件视图或者子组件视图初始化完成之后调用
     */
    ngAfterViewInit() {
    }

    /**
     * 下载
     */
    public downloadCsv1() {
        let str = '';
        this.cpuData.spec.forEach((el, index) => {
            str += this.i18n.sys.selCpu + ',' + el.label + '\n' + ',';
            this.cpuData.data.time.forEach(ele => {
                str += ele + ',';
            });
            str += '\n';
            this.cpuData.key.forEach(val => {
                str += val.label + ',';
                this.cpuData.data.values[el.id][val.label].forEach(element => {
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
        link.download = this.i18n.sys.titles.cpuUsage + '.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    /**
     * 下载
     */
    public downloadCsv2() {
        let str = ',';
        this.averageData.data.time.forEach(ele => {
            str += ele + ',';
        });
        str += '\n';
        this.averageData.key.forEach(val => {
            str += val.label + ',';
            this.averageData.data.values[val.id].forEach(element => {
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
        link.download = this.i18n.sys.titles.avgLoad + '.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    /**
     * 设置高度
     */
    public selectHeight() {
        if (this.numaSelected.length === 1) {
            $('#myselect1').addClass('select');
        } else {
            $('#myselect1').removeClass('select');
        }
        if (this.cpuNumSelected.length === 1) {
            $('#myselect2').addClass('select');
        } else {
            $('#myselect2').removeClass('select');
        }
        if (this.cpuTypeSelected.length === 1) {
            $('#myselect3').addClass('select');
        } else {
            $('#myselect3').removeClass('select');
        }
    }

    /**
     * numaChange
     */
    public numaChange(e) {
        this.selectHeight();

        this.numaOption.forEach(item => {
            if (this.numaSelected.length === 1) {
                if (item.id === this.numaSelected[0].id) {
                    item.disabled = true;
                }
            } else {
                item.disabled = false;
            }
        });
        if (this.numaSelected.length !== 0) {
            const cpuSelectedIdList = [];
            this.numaSelected.forEach(item => {
                cpuSelectedIdList.push(...this.numaList[item.id]);
            });
            this.initCpuNumOption(cpuSelectedIdList);
            this.setCpuData();
            setTimeout(() => {
                this.cpuUsage.initTable();
            }, 0);
        }
    }

    /**
     * cpuNumChange
     */
    public cpuNumChange(e) {
        this.UtilizationShow = e.show;
        if (!e.show) {    // 如果不展示平均负载 直接结束
            return;
        }
        if (!e.change) {  // 如果筛选没有变化 直接结束
            return;
        }
        this.cpuNumSelected = e.data;
        this.selectHeight();
        this.setCpuData();
        if (this.cpuNumSelected.length !== 0 && this.cpuTypeSelected.length !== 0) {
            setTimeout(() => {
                this.cpuUsage.initTable();
            }, 0);
        }
    }

    /**
     * cpuTypeChange
     */
    public cpuTypeChange(e) {
        this.UtilizationShow = e.show;
        if (!e.show) {    // 如果不展示平均负载 直接结束
            return;
        }
        if (!e.change) {  // 如果筛选没有变化 直接结束
            return;
        }
        this.selectHeight();
        this.cpuTypeSelected = e.data;
        this.checkzhibiao = e.data;
        this.setCpuData();
        this.cpuTypeOption.forEach(item => {
            if (this.cpuTypeSelected.length === 1) {
                if (item.id === this.cpuTypeSelected[0].id) {
                    item.disabled = true;
                }
            } else {
                item.disabled = false;
            }
        });

        if (this.cpuTypeSelected.length !== 0 && this.cpuNumSelected.length !== 0) {
            setTimeout(() => {
                this.cpuUsage.initTable();
            }, 0);
        }
        if (this.numaSelected.length !== 0) {
            const cpuSelectedIdList = [];
            this.numaSelected.forEach(item => {
                cpuSelectedIdList.push(...this.numaList[item.id]);
            });
            this.initCpuNumOption(cpuSelectedIdList);
            this.setCpuData();
            setTimeout(() => {
                this.cpuUsage.initTable();
            }, 0);
        }
    }

    /**
     * cpuTypeChange2
     */
    public cpuTypeChange2(e) {
        this.averageShow = e.show;
        if (!e.show) {    // 如果不展示平均负载 直接结束
            return;
        }
        if (!e.change) {  // 如果筛选没有变化 直接结束
            return;
        }
        this.cpuTypeSelected2 = JSON.parse(JSON.stringify(e.data));
        this.setAverageData();
        this.cpuTypeOption2.forEach(item => {
            if (this.cpuTypeSelected2.length === 1) {
                if (item.id === this.cpuTypeSelected2[0].id) {
                    item.disabled = true;
                }
            } else {
                item.disabled = false;
            }
        });

        if (this.cpuTypeSelected2.length !== 0) {
            setTimeout(() => {
                this.cpuAverage.initTable();
            }, 0);
            setTimeout(() => {
                const dom = window.document.getElementsByClassName('cpu-usage');
            }, 200);
        }
    }

    /**
     * converUrl
     */
    public converUrl(data) {
        const result = [];
        for (const key of Object.keys(data)) {
            const value = data[key];
            if (value.constructor === Array) {
                value.forEach((val) => {
                    result.push(key + '=' + val);
                });
            } else {
                result.push(key + '=' + value);
            }
        }
        return result.join('&');
    }

    /**
     * 获取CpuUsage数据
     */
    public async getCpuUsageData() {
        const params = {
            'node-id': this.nodeid,
            'query-type': 'detail',
            'query-target': 'cpu_usage'      // 例如cpu_usage, cpu_avgload, mem_usage等
        };
        this.vscodeService.get(
            { url: '/tasks/' + this.taskid + '/sys-performance/?' + this.converUrl(params) }, (resp: any) => {
                this.resData = resp.data;
                this.initDatas();
                this.showLoading = false;
            });
    }
    /**
     * 获取CpuAvgload数据
     */
    public async getCpuAvgloadData() {
        const params = {
            'node-id': this.nodeid,
            'query-type': 'detail',
            'query-target': 'cpu_avgload'      // 例如cpu_usage, cpu_avgload, mem_usage等
        };
        this.vscodeService.get(
            { url: '/tasks/' + this.taskid + '/sys-performance/?' + this.converUrl(params) }, (data: any) => {
                this.resAverageData = data.data;
                this.initAverage();
                this.showLoading = false;
            });
    }

    /**
     * 初始化Average
     */
    public initAverage() {
        this.initCpuTypeOption2(this.resAverageData.key);
        this.averageOrignData = this.resAverageData.origin_data;
        this.cpuAverageData.emit({ timeData: this.averageOrignData.time, type: 4 });
        this.setAverageData();
    }

    /**
     * 初始化第一，三个下拉框数据
     */
    public initDatas() {
        this.orignData = this.resData.origin_data;
        this.initCpuTypeOption(this.resData.key); // 第三个下拉框
        this.initNumaOption(this.resData.numa_info); // 第一个下拉框

        this.setCpuData();
    }

    /**
     * 初始化第一个下拉框数据
     */
    public initNumaOption(data) {
        if (data) {
            // 第一个下拉框
            this.numaList = data;
            const numaOptionkeys = Object.keys(data);
            numaOptionkeys.forEach(item => {
                this.numaOption.push({
                    label: 'NUMA ' + item,
                    id: item
                });
            });

            this.numaOption[0].disabled = true;
            this.numaSelected = this.numaOption;
            let arrData: any = [];
            this.numaSelected.forEach((element: any) => {
              arrData = arrData.concat(data[element.id]);
            });
            // 对第二个下拉框
            this.initCpuNumOption(arrData);
        }
    }

    /**
     * 初始化第一个下拉框数据
     */
    public isDisCpuNumOption(nums) {
        // 判断是否加disable
        let num = 0;
        this.orignData.values[nums]['%user'].forEach(item => {
            if (item === 0 || item === '-') {
                num++;
            }
        });
        if (num === this.orignData.values[nums]['%user'].length) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * 初始化CpuNumOption
     */
    public initCpuNumOption(data) {
        const selectedCpuList = [...this.cpuNumSelected];   // 记录以前选中项
        this.cpuNumsOption = [];
        if (data.length > 0) {
            data.forEach(item => {
                if (this.isDisCpuNumOption(item)) {
                    this.cpuNumsOption.push({
                        label: item + '-CPU',
                        id: item,
                        disabled: true
                    });
                } else {
                    this.cpuNumsOption.push({
                        label: item + '-CPU',
                        id: item
                    });
                }
            });
            for (let i = 0; i < this.cpuNumsOption.length; i++) {
                if (!this.cpuNumsOption[i].disabled) {
                    this.index = i;
                    break;
                }
            }
            this.cpuNumSelected.length = 0;
            if (selectedCpuList.length > 0) {    // 如果以前有选中项
                selectedCpuList.forEach(item => {
                    this.cpuNumsOption.forEach(cpuItem => {
                        if (item.id === cpuItem.id) {
                            this.cpuNumSelected.push(cpuItem);
                        }
                    });
                });
            }
            if (this.cpuNumSelected.length === 0) {                  // 如果没有选中项则默认选中列表第一个disable:false的
                this.cpuNumsOption.forEach((item: any, index: number) => {
                    if (index < 5) {
                        this.cpuNumSelected.push(this.cpuNumsOption[this.resData.cpu_usage.name['%user'].name[index]]);
                    }
                });
            }
            if (this.cpuNumSelected.length === 1) {              // 只有一个选中时要默认disabled
                this.cpuNumSelected[0].disabled = true;
            }
        }
        this.butValue = this.cpuNumsOption;
        this.cpuAverageData.emit({ allData: this.resData, newData: this.cpuNumSelected, type: 2 });
    }

    /**
     * 初始化CpuNumOption
     */
    public initCpuTypeOption2(data) {
        this.cpuTypeOption2 = [];
        if (data.length > 0) {
            data.forEach(item => {
                this.cpuTypeOption2.push({
                    label: item,
                    id: item
                });
            });
            this.cpuTypeOption2[0].disabled = true;
            this.cpuTypeSelected2 = [this.cpuTypeOption2[0]];
        }
        this.cpuAverageData.emit({
            allData: this.cpuTypeOption2, newData: this.cpuTypeSelected2,
            type: 1, averageShow: this.averageShow, UtilizationShow: this.UtilizationShow
        });
    }

    /**
     * 初始化第三个下拉框
     */
    public initCpuTypeOption(data) {// 第三个下拉框
        this.cpuTypeOption = [];
        if (data.length > 0) {
            data.forEach(item => {
                this.cpuTypeOption.push({
                    label: item,
                    id: item
                });
            });
            this.cpuTypeOption[0].disabled = true;
            this.cpuTypeSelected = [this.cpuTypeOption[0]];
        }
        this.cpuAverageData.emit({ allData: this.cpuTypeOption, newData: this.cpuTypeSelected, type: 3 });
    }

    /**
     * 设置CpuData
     */
    public setCpuData() {
        this.cpuData = {};
        this.cpuEchartData = [];
        const cpuEchartData = [];
        this.cpuTypeSelected.forEach((item) => {
            const option = {
                spec: [...this.cpuNumSelected],
                key: [...[item]],
                data: this.orignData,
                title: 'CPU Usage',
                type: 'cpu'
            };
            cpuEchartData.push(option);
        });
        this.cpuEchartData = cpuEchartData;
    }

    /**
     * 设置AverageData
     */
    public setAverageData() {
        this.averageData = {};
        this.averageEchartData = [];
        const averageEchartData = [];
        this.cpuTypeSelected2.forEach((item) => {
            const option = {
                spec: [],
                key: [...[item]],
                data: this.averageOrignData,
                title: 'Average Load',
                type: 'cpuavg'
            };
            averageEchartData.push(option);
        });
        this.averageEchartData = averageEchartData;
    }

    /**
     * 初始化事件
     */
    public initializationData() {
        this.cpuAverageData.emit({ allData: this.cpuTypeOption, newData: this.cpuTypeSelected, type: 3 });
        this.cpuAverageData.emit({
            allData: this.cpuTypeOption2, newData: this.cpuTypeSelected2, type: 1,
            averageShow: this.averageShow, UtilizationShow: this.UtilizationShow
        });
        this.cpuAverageData.emit({ allData: this.resData, newData: this.cpuNumSelected, type: 2 });
    }

    /**
     * 更新时间轴
     */
    public upDataTimeLine(data) {
        if (this.averageShow) {
            this.cpuAverage.upDateTimeLine(data);
        }
        if (this.UtilizationShow) {
            this.cpuUsage.upDateTimeLine(data);
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
        this.cpuEchartsInstOut.emit(e);
    }
}
