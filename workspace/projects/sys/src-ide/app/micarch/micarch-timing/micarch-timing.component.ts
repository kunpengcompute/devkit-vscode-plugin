import { Component, OnInit, Input, Output, EventEmitter, ElementRef, AfterViewInit } from '@angular/core';
import { AxiosService } from '../../service/axios.service';
import { I18nService } from '../../service/i18n.service';
import { MytipService } from '../../service/mytip.service';
import { Utils } from 'projects/sys/src-ide/app/service/utils.service';
import { VscodeService } from '../../service/vscode.service';


@Component({
    selector: 'app-micarch-timing',
    templateUrl: './micarch-timing.component.html',
    styleUrls: ['./micarch-timing.component.scss']
})
export class MicarchTimingComponent implements OnInit, AfterViewInit {

    @Input() projectName: any;
    @Input() taskName: any;
    @Input() analysisType: any;
    @Input() taskid: any;
    @Input() nodeid: any;
    @Input() isActive: any;
    @Output() datatype = new EventEmitter();
    @Input() typeDetail: any;
    @Output() type = new EventEmitter();
    @Output() typeName = new EventEmitter();

    public childrenData: any;   // 子数据
    public isDetailVisible = false;
    public timingData: any;
    public timingChildData: any;
    public routeData = [];
    public color = ['rgba(49, 167, 163, 0.2)', 'rgba(49, 167, 163, 0.3) ', 'rgba(49, 167, 163, 0.4)',
        'rgba(56, 193, 188, 0.5)', '#38C1BC']; // 第二层数据，为了颜色对应上。要传到子组件
    public colorData = ['rgba(49, 167, 163, 0.2)', 'rgba(49, 167, 163, 0.3) ', 'rgba(49, 167, 163, 0.4)',
        'rgba(56, 193, 188, 0.5)'];
    public firstColor = []; // 第一层颜色，要传给子组件，为了颜色对应上
    public secondColor = [];
    public childList = [];
    public dataType: 'cpu';
    public timeLine = [];
    public dataALL: any;
    public colorType: any;   // 保留渲染的数据，用于颜色筛选
    public noDataInfo = '';
    public listsData: Array<any> = [{
        id: '',
        title: 'Retiring',
        color: 'rgba(49, 167, 163, 0.2)',
        checked: true
    }, {
        id: '',
        title: 'Front-End Bound',
        color: 'rgba(49, 167, 163, 0.3)',
        checked: true
    }, {
        id: '',
        title: 'Bad Speculation',
        color: 'rgba(49, 167, 163, 0.4)',
        checked: true
    }, {
        id: '',
        title: 'Back-End Bound',
        color: 'rgba(56, 193, 188, 0.5)',
        checked: true
    }
    ];
    public lists: Array<any> = [];
    public upperData: any = [];
    public resize: any = {};
    public i18n: any;
    public typeSelected: any = 'cpu';
    public cpuSelected: any = '';
    public typeOptions: Array<any> = [];
    public cpuNumsOption: Array<any> = [];
    public chartShow = true;
    public dataTitle = {
        Timestamp: 0,
        Cycles: 1,
        Instructions: 2,
        Ipc: 3,
        Retiring: 4,
        'Front-End Bound': {
            parent: 5,
            'Fetch Latency Bound': {
                parent: 6,
                'ITLB Miss': {
                    parent: 7,
                    'L1 TLB': 8,
                    'L2 TLB': 9,
                },
                'ICache Miss': {
                    parent: 10,
                    'L1 Cache': 11,
                    'L2 Cache': 12,
                },
                'Branch Mispredict Flush': 13,
                'OOO Flush': 14,
                'Static Predictor Flush': 15,
            },
            'Fetch Bandwidth Bound': 16,
        },
        'Bad Speculation': {
            parent: 17,
            'Branch Mispredict': {
                parent: 18,
                'Indirect Branch': 19,
                'Push Branch': 20,
                'Pop Branch': 21,
                'Other Branch': 22
            },
            'Machine Clear': {
                parent: 23,
                'Nuke Flush': 24,
                'Other Flush': 25
            },
        },
        'Back-End Bound': {
            parent: 26,
            'Core Bound': {
                parent: 27,
                'Divider Stall': 28,
                'FSU Stall': 29,
                'Exe Ports Stall': 30,
            },
            'Memory Bound ': {
                parent: 31,
                'L1 Bound': 32,
                'L2 Bound': 33,
                'Ext Memory Bound': 34,
                'Store Bound': 35
            },
            'Resource Bound ': {
                parent: 36,
                'Sync Stall': 37,
                'Reorder Buffer Stall': 38,
                'Save Queue Stall': 39,
                'PC Buffer Stall': 40,
                'Physical Tag Stall': {
                    parent: 41,
                    'CC Physical Tag Stall': 42,
                    'VFP PhysicalTagStall': 43,
                    'INT PhysicalTagStall': 44
                }
            }
        }
    };

    public show = false;
    public rightData = -1;
    public leftData = 0;
    public lestShow = false;
    public boxShow = false;
    public showWidth = -1;
    public start = 0;
    public endData = -1;

    // 外部 x 轴的相关参数
    public extrapositionOption: {
        domain: [number, number],
        format: (d: number) => string
    };
    public timingChartHotDomain: [number, number];
    public showLoading = false;

    constructor(
        public vscodeService: VscodeService,
        public axios: AxiosService,
        public i18nService: I18nService,
        public mytip: MytipService,
        private el: ElementRef) {
        this.i18n = this.i18nService.I18n();
        this.noDataInfo = this.i18n.common_term_task_nodata;
    }

    /**
     * 数据类型的具体数据名称
     */
    OnChanges(): void {

    }
    /**
     * 初始化
     */
    ngOnInit() {
        this.typeOptions = [
            {
                // 进程
                label: this.i18n.common_term_projiect_task_process,
                id: 'pid',
            },
            {
                // 线程
                label: this.i18n.common_term_task_tab_summary_thread,
                id: 'tid',
            },
            {
                // 模块
                label: this.i18n.common_term_task_tab_summary_module,
                id: 'module',
            },
            {
                label: 'CPU',
                id: 'cpu',
            },
        ];
        this.lists.forEach((item, index) => {
            item.id = Utils.generateConversationId(15);
        });
        this.typeSelected = this.typeOptions[3];
        this.dataType = 'cpu';
        this.getMicarchData();
    }
    /**
     * ngAfterViewInit
     */
    ngAfterViewInit() { }

    /**
     * 获取时序图数据
     */
    public getMicarchData() {
        this.showLoading = true;
        this.vscodeService.get({
            url: `/tasks/${this.taskid}/microarchitecture/time-data/?nodeId=${this.nodeid}` +
                `&metric=${encodeURIComponent(this.dataType)}&range=entire&dataCount=100`
        }, (data) => {
            const content = data.data['time-data'].content;
            if (JSON.stringify(content) !== '{}') {
                const selectArr: any = [{ id: 'all', label: 'ALL', select: true }];
                const cpuSelected: any = [{ id: 'all', label: 'ALL' }];
                // 遍历顺序会改变
                for (const key in content) {
                    if (content.hasOwnProperty(key)) {
                        const selectObj = { id: '', label: '' };
                        selectObj.id = key.split(':')[1];
                        selectObj.label = key.split(':')[1];
                        selectArr.push(selectObj);
                        cpuSelected.push(selectObj);
                    }
                }
                selectArr.sort((a: any, b: any) => {
                    return a.label - b.label;
                });
                this.cpuNumsOption = selectArr;
                this.cpuSelected = [].concat(selectArr);
            } else {
                this.cpuNumsOption = [];
                this.cpuSelected = [];
            }

            const dataAll = this.timingDataFormat(this.dataTitle, data.data['time-data'].content);
            if (dataAll.length !== 0) {
                this.chartShow = false;
                // 改变 columns 的内容，选择要渲染的内容
                dataAll.forEach((item, index) => {
                    const arr = item.value.columns.slice(0, 1);
                    const arrData = item.value.columns.slice(4, item.value.columns.length);
                    item.value.columns = arr.concat(arrData);
                    item.type = item.name.split(':')[0];
                    item.name = item.name.split(':')[1];
                });
                // 排序
                dataAll.sort((a: any, b: any) => {
                    return a.name - b.name;
                });
                this.firstColor = this.colorData;
                this.colorType = dataAll[0].value.columns;
                // 保存渲染的数据title
                this.listsData.forEach((item, index) => {
                    item.title = this.colorType[index + 1];
                    item.color = this.colorData[index];
                });
                this.lists = this.listsData;
            } else {
                this.lists = [];
                this.chartShow = true;
            }
            // 传到子组件的数据
            this.timingData = dataAll;
            // 保留原始数据
            this.dataALL = dataAll;
            this.setExtrapositionOption(this.dataALL);
            this.showLoading = false;
        });
    }

    /**
     * dataShow
     */
    dataShow(data) {
        const arr = [];
        if (data.length >= 15) {
            for (let i = 1; i <= 15; i++) {
                let index = Math.floor((data.length / 15) * i);
                if (index === data.length) {
                    index = index - 1;
                }
                arr.push(data[index - 1]);
            }
        } else {
            data.forEach((element, index) => {
                if (index === 0 || index === data.length - 1) {
                } else {
                    arr.push(element);
                }
            });
        }
        this.timeLine = arr;
    }


    /**
     * 处理数据的方法
     */
    public timingDataFormat(title, content) {
        function initDataDict(title1: any) {
            const vessel = [];
            recursive(title1, vessel);
            function recursive(data, vess) {
                for (const key in data) {
                    if (data.hasOwnProperty(key)) {
                        const value = data[key];
                        if (key === 'parent') {
                        } else if (typeof value === 'object') {
                            const tmpObj = {
                                name: key,
                                dataIndex: value.parent,
                                children: [
                                    vess[0],
                                ],
                            };
                            vess.push(tmpObj);
                            recursive(value, tmpObj.children);
                        } else {
                            const tmpObj = {
                                name: key,
                                dataIndex: value,
                                children: []
                            };
                            vess.push(tmpObj);
                        }
                    }
                }
            }
            return vessel;
        }

        const dict = initDataDict(title);

        function initData(contentPar, dictPar) {
            if (!contentPar || !dictPar) {
                return null;
            }
            if (contentPar.toString() === '{}' || dictPar.toString() === '[]') {
                return [];
            }
            const data = [];
            for (const item in contentPar) {
                if (contentPar.hasOwnProperty(item)) {
                    // 初始化数据结构
                    const obj: any = {
                        name: item,
                        value: []
                    };
                    // 装载数据
                    const rowData = contentPar[item];
                    for (const j of rowData) {
                        const rowItem = j;
                        const tmpObj = {};
                        for (const i of dictPar) {
                            const dictObj = i;
                            tmpObj[dictObj.name] = rowItem[dictObj.dataIndex];
                        }
                        obj.value.push(tmpObj);
                    }

                    // 设置 columns 和 cd
                    obj.value.columns = [];
                    for (const i of dictPar) {
                        const dictObj = i;
                        obj.value.columns.push(dictObj.name);
                    }
                    const fn = (key) => {
                        let dictChildren = [];
                        for (const i of dictPar) {
                            const dictObj = i;
                            if (dictObj.name.toString().trim() === key.toString().trim()) {
                                dictChildren = dictObj.children;
                            }
                        }
                        const tempData = initData(contentPar, dictChildren);
                        let dataObj = null;
                        for (const n of tempData) {
                            if (n.name === item) {
                                dataObj = n;
                            }
                        }
                        return { data: dataObj, path: key };
                    };
                    obj.cd = fn;
                    data.push(obj);
                }
            }
            return data;
        }
        const res = initData(content, dict);
        return res;
    }

    /**
     * 下拉选择
     */
    public typeChange(event) {
        this.dataType = event.id;
        this.getMicarchData();
        this.isDetailVisible = false;
        this.firstColor = this.colorData;
        this.lists.forEach((item) => {
            item.checked = true;
        });
        this.upperData = [];
        this.routeData = [];
    }

    /**
     * 筛选每条
     */
    public cpuChange(event) {
        if (event.length !== 0) {
            this.chartShow = false;
            if (event[0].id === 'all') {
                if (event[0].select) {
                    this.cpuNumsOption[0].select = false;
                    this.cpuSelected = event.slice(1);
                    const arr = [];
                    this.dataALL.forEach((item, index) => {
                        event.forEach((data) => {
                            if (item.name === data.id) {
                                arr.push(item);
                            }
                        });
                    });
                    this.timingData = arr;
                } else {
                    this.cpuNumsOption[0].select = true;
                    this.timingData = this.dataALL;
                    this.cpuSelected = [].concat(this.cpuNumsOption);
                }
            } else {
                const arr = [];
                if (this.cpuNumsOption[0].select) {
                    if (this.cpuNumsOption.length === event.length + 1) {
                        this.cpuSelected = [];
                        this.chartShow = true;
                        this.isDetailVisible = false;
                        this.cpuNumsOption[0].select = false;
                    }
                } else {
                    if (this.cpuNumsOption.length === event.length + 1) {
                        this.cpuNumsOption[0].select = true;
                        this.cpuSelected = [].concat(this.cpuNumsOption);
                    }
                }
                this.dataALL.forEach((item, index) => {
                    event.forEach((data) => {
                        if (item.name === data.id) {
                            arr.push(item);
                        }
                    });
                });
                this.timingData = arr;
            }
            if (this.routeData.length !== 0) {
                let num = 0;
                this.cpuSelected.forEach((item, index) => {
                    if (item.id === this.routeData[0].split(':')[1]) {
                        num += 1;
                    }
                });
                if (num === 0) {
                    this.routeData = [];
                    this.upperData = [];
                    this.isDetailVisible = false;
                }
            }

        } else {
            this.chartShow = true;
            this.isDetailVisible = false;
            this.routeData = [];
            this.upperData = [];
        }
    }

    /**
     * 点击下一层的数据
     */
    public childData(event) {
        const data = event;
        data.data.name = this.typeSelected.label + ':' + data.data.name.split(':')[1];
        this.processData(data, true);

        this.secondColor = this.color;
        this.routeData = [event.data.name, event.path];
        const obj = {
            data: event.data,
            color: JSON.parse(JSON.stringify(this.secondColor)),
            list: JSON.parse(JSON.stringify(this.childList)),
        };
        this.upperData[0] = obj;
    }

    /**
     *  下下层返回的数据
     */
    public backData(event) {
        this.upperData[this.upperData.length - 1].color = JSON.parse(JSON.stringify(this.secondColor));
        this.upperData[this.upperData.length - 1].list = JSON.parse(JSON.stringify(this.childList));
        this.processData(event, true);
        this.routeData.push(event.path);
        const obj = {
            data: event.data,
            color: JSON.parse(JSON.stringify(this.secondColor)),
            list: JSON.parse(JSON.stringify(this.childList)),
        };
        this.upperData[this.upperData.length] = obj;
        this.secondColor = this.color;
    }

    /**
     * 返回数据之后对数据的处理
     */
    public processData(event, status) {
        this.childrenData = event.data;
        this.isDetailVisible = true;
        const colorData = event.data.value.columns;
        const colorArr = [];
        colorData.forEach((item, index) => {
            if (index !== 0) {
                const obj = { id: '', title: '', color: '', checked: true };
                obj.id = Utils.generateConversationId(15);
                obj.title = item;
                obj.color = this.color[index - 1];
                colorArr.push(obj);
            }
        });
        if (status) {
            this.childList = colorArr;
        }
    }

    /**
     * 颜色筛选
     */
    public colorChange(event) {
        const arr = [this.childrenData.value.columns[0]];
        const colorData = [];
        const data = this.deepClone(this.childrenData);
        this.childList.forEach((item) => {
            if (item.checked) {
                arr.push(item.title);
                colorData.push(item.color);
            }
        });
        this.secondColor = colorData;
        data.value.columns = arr;
        this.childrenData = data;
    }

    /**
     * 返回上一层级
     */
    public Switch(index) {
        if (index === 0) {
            this.isDetailVisible = false;
            this.upperData = [];
            this.routeData = [];
        } else {
            const obj = { data: this.upperData[index - 1].data };
            this.processData(obj, false);
            this.secondColor = this.upperData[index - 1].color;
            this.childList = this.upperData[index - 1].list;
            this.routeData = this.routeData.slice(0, index + 1);
            this.colorChange('');
            this.upperData.splice(index);
        }
    }

    /**
     * 深拷贝
     */
    public deepClone(obj) {
        const t = new obj.constructor();
        if (obj instanceof Date) {
            return new Date(obj);
        }
        if (obj instanceof RegExp) {
            return new RegExp(obj);
        }
        if (typeof obj !== 'object') {
            return obj;
        }
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                t[key] = this.deepClone(obj[key]);
            }
        }
        return t;
    }

    /**
     * onExtraAxisTransform
     */
    public onExtraAxisTransform(val) {
        this.timingChartHotDomain = val;
    }

    /**
     * onTimingTransform
     */
    public onTimingTransform(domain) {
        this.timingChartHotDomain = domain;
    }

    /**
     * setExtrapositionOption
     */
    public setExtrapositionOption(data) {
        // 找出最大 timestamp 的范围
        const maxLength = Math.max(...data.map((item: any) => item.value.length));
        const maxTimestampLenItem: any = data.find((d) => d.value.length === maxLength);
        const timestampArry = maxTimestampLenItem ? maxTimestampLenItem.value.map(d => d.Timestamp) : [];
        const domainRange: [number, number] = [Math.min(...timestampArry), Math.max(...timestampArry)];

        this.extrapositionOption = {
            domain: domainRange,
            format: (d: number) => this.axios.setThousandSeparator(d + 'ms')
        };
    }
}
