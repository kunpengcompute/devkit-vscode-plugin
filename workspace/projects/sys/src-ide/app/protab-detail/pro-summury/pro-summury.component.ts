import {Component, OnInit, Input, NgZone, ChangeDetectorRef} from '@angular/core';
import { I18nService } from '../../service/i18n.service';
import { AxiosService } from '../../service/axios.service';
import { MytipService } from '../../service/mytip.service';
import { TableService } from '../../service/table.service';
import { VscodeService } from 'projects/sys/src-ide/app/service/vscode.service';
import { Utils } from 'projects/sys/src-ide/app/service/utils.service';

interface InfoType {
    active: boolean;
    title: Array<any>; // 存放表头信息
    data: Array<any>; // 存放分页数据
    displayed: Array<any>;
    srcData: {
        data: Array<any>, // 存放获取到的所有数据
        state: {
            searched: boolean,
            sorted: boolean,
            paginated: boolean,
        }
    };
    currentPage: number; // 分页
    totalNumber: number; // 总数
    pageSize: {
        options: Array<number>;
        size: number;
    };
}

@Component({
    selector: 'app-pro-summury',
    templateUrl: './pro-summury.component.html',
    styleUrls: ['./pro-summury.component.scss']
})
export class ProSummuryComponent implements OnInit {
    @Input() projectName: any;
    @Input() taskName: any;
    @Input() analysisType: any;
    @Input() isActive: any;
    @Input() taskid: any;
    @Input() nodeid: any;
    i18n: any;
    public cpuData: InfoType; // cpu
    public diskData: InfoType; // 存储IO
    public memData: InfoType; // 内存
    public contextData: InfoType; // 上下文切换
    public syscallData: InfoType;
    public resData: any;    // 请求得到的数据
    // 优化建议提示
    public suggestMsg: any = [];

    public language = 'zh';
    public expand = [false, false, false, false, false];
    public showLoading = false;
    public samplingTypeArr: string[] = [];

    constructor(
        public i18nService: I18nService,
        public Axios: AxiosService,
        public mytip: MytipService,
        public tableService: TableService,
        private zone: NgZone,
        private changeDetectorRef: ChangeDetectorRef,
        public vscodeService: VscodeService) {
        this.i18n = this.i18nService.I18n();
    }

    /**
     * 初始化
     */
    ngOnInit() {
        this.language = I18nService.getLang() === 0 ? 'zh' : 'en';

        this.cpuData = {
            active: true,
            title: [
                { name: 'PID/TID', tip: this.i18n.process.sum.pid, sortKey: 'ID' },
                { name: '%user', tip: this.i18n.process.sum.cpu.usr, sortKey: '%user' },
                { name: '%system', tip: this.i18n.process.sum.cpu.sys, sortKey: '%sys' },
                { name: '%wait', tip: this.i18n.process.sum.cpu.wait, sortKey: '%wait' },
                { name: '%CPU', tip: this.i18n.process.sum.cpu.cpu, sortKey: '%CPU' },
                { name: 'Command', tip: this.i18n.process.sum.command, sortKey: '' },
            ],
            displayed: [],
            data: [],
            srcData: {
                data: [],
                state: {
                    searched: false, // 源数据未进行搜索处理
                    sorted: false, // 源数据未进行排序处理
                    paginated: false,
                }
            },
            currentPage: 1,
            totalNumber: 0,
            pageSize: {
                options: [10, 20, 30, 50],
                size: 10
            },
        };

        this.memData = {
            active: false,
            title: [
                { name: 'PID/TID', tip: this.i18n.process.sum.pid, sortKey: 'ID' },
                { name: 'Minflt/s', tip: this.i18n.process.sum.mem.min, sortKey: 'minflt/s' },
                { name: 'Majflt/s', tip: this.i18n.process.sum.mem.maj, sortKey: 'majflt/s' },
                { name: 'VSZ', tip: this.i18n.process.sum.mem.vsz, sortKey: 'VSZ' },
                { name: 'RSS', tip: this.i18n.process.sum.mem.rss, sortKey: 'RSS' },
                { name: '%MEM', tip: this.i18n.process.sum.mem.mem, sortKey: '%MEM' },
                { name: 'Command', tip: this.i18n.process.sum.command, sortKey: '' },
            ],
            displayed: [],
            data: [],
            srcData: {
                data: [],
                state: {
                    searched: false, // 源数据未进行搜索处理
                    sorted: false, // 源数据未进行排序处理
                    paginated: false,
                }
            },
            currentPage: 1,
            totalNumber: 0,
            pageSize: {
                options: [10, 20, 30, 50],
                size: 10
            },
        };

        this.diskData = {
            active: false,
            title: [
                { name: 'PID/TID', tip: this.i18n.process.sum.pid, sortKey: 'ID' },
                { name: '%kB_rd/s', tip: this.i18n.process.sum.disk.wr, sortKey: 'kB_rd/s' },
                { name: '%kB_wr/s', tip: this.i18n.process.sum.disk.rd, sortKey: 'kB_wr/s' },
                { name: '%iodelay', tip: this.i18n.process.sum.disk.iodelay, sortKey: 'iodelay' },
                { name: 'Command', tip: this.i18n.process.sum.command, sortKey: '' },
            ],
            displayed: [],
            data: [],
            srcData: {
                data: [],
                state: {
                    searched: false, // 源数据未进行搜索处理
                    sorted: false, // 源数据未进行排序处理
                    paginated: false,
                }
            },
            currentPage: 1,
            totalNumber: 0,
            pageSize: {
                options: [10, 20, 30, 50],
                size: 10
            },
        };

        this.contextData = {
            active: false,
            title: [
                { name: 'PID/TID', tip: this.i18n.process.sum.pid, sortKey: 'ID' },
                { name: 'cswch/s', tip: this.i18n.process.sum.context.cswch, sortKey: 'cswch/s' },
                { name: 'nvcswch/s', tip: this.i18n.process.sum.context.nvcswch, sortKey: 'nvcswch/s' },
                { name: 'Command', tip: this.i18n.process.sum.command },
            ],
            displayed: [],
            data: [],
            srcData: {
                data: [],
                state: {
                    searched: false, // 源数据未进行搜索处理
                    sorted: false, // 源数据未进行排序处理
                    paginated: false,
                }
            },
            currentPage: 1,
            totalNumber: 0,
            pageSize: {
                options: [10, 20, 30, 50],
                size: 10
            },
        };

        this.syscallData = {
            active: false,
            title: [
                { name: 'PID/TID', tip: this.i18n.process.sum.pid, prop: 'pid', sortKey: 'pid' },
                { name: '%time', tip: this.i18n.process.sum.syscall.time, prop: 'time', sortKey: 'time' },
                { name: 'seconds/s', tip: this.i18n.process.sum.syscall.seconds, prop: 'second', sortKey: 'second' },
                { name: 'usecs/call(s)', tip: this.i18n.process.sum.syscall.usecs, prop: 'usecs', sortKey: 'usecs' },
                { name: 'calls', tip: this.i18n.process.sum.syscall.calls, prop: 'calls', sortKey: 'calls' },
                { name: 'errors', tip: this.i18n.process.sum.syscall.errors, prop: 'errors', sortKey: 'errors' },
                { name: 'syscall', tip: this.i18n.process.sum.syscall.syscall, prop: 'syscall', sortKey: 'syscall' },
            ],
            displayed: [],
            data: [],
            srcData: {
                data: [], state: {
                    searched: false, // 源数据未进行搜索处理
                    sorted: false, // 源数据未进行排序处理
                    paginated: false,
                }
            },
            currentPage: 1,
            totalNumber: 0,
            pageSize: {
                options: [10, 20, 30, 50],
                size: 10
            },
        };

        setTimeout(() => {
            this.getprocessConfig();
        }, 50);
    }

    /**
     * 设置优化建议集合
     */
    public setSuggestions(data) {
        if (data && data.suggestion && data.suggestion.length) {
            const suggestions = data.suggestion;
            suggestions.map(item => {
                this.suggestMsg.push({
                    title: this.language === 'zh' ? item.title_chs : item.title_en,
                    msgbody: this.language === 'zh' ? item.suggest_chs : item.suggest_en
                });
            });
        }
    }

    /**
     * 重新整理表格数据
     */
    private reorganizeTableData(data, rData) {
        if (data != null) {
            Object.keys(data).forEach(key => {
                rData.srcData.data.push(data[key]);
            });
        }
        const dataCopy = [...rData.srcData.data];
        rData.data = dataCopy.splice(0, rData.pageSize.size);
        rData.totalNumber = rData.srcData.data.length;
    }

    /**
     * 初始化表格信息展开
     */
    private getList() {
        const allData = [this.cpuData, this.memData, this.diskData, this.contextData];
        for (let i = 0; i < allData.length; i++) {
            if (allData[i].srcData.data.length > 0) {
                // 控制打开表格箭头方向
                this.expand[i] = true;
                // 默认第一个数据展开
                allData[i].srcData.data[0].active = true;
                break;
            }
        }
    }

    /**
     * 整理syscall数据
     */
    public getSyscall(data) {
        if (data && Object.prototype.toString.call(data.syscall) === '[object Object]') {
            this.syscallData.srcData.data = Object.keys(data.syscall).map((second, index) => {
                return {
                    index,
                    pid: `PID ${data.pid[index]}`,
                    time: data['%time'][index],
                    second: data.seconds[index],
                    usecs: data['usecs/call'][index],
                    calls: data.calls[index],
                    errors: data.errors[index] === 'NULL' ? null : data.errors[index],
                    syscall: data.syscall[index],
                };
            });
            const dataCopy = [...this.syscallData.srcData.data];
            this.syscallData.data = dataCopy.splice(0, this.syscallData.pageSize.size);
            this.syscallData.totalNumber = this.syscallData.data.length;
            this.updateWebViewPage();
        }
    }

    /**
     * 获取配置数据
     */
    public async getprocessConfig() {
        this.showLoading = true;
        const params = {
            'node-id': encodeURIComponent(this.nodeid),
            'query-type': 'summary',
            'query-target': ''
        };
        let url = `/tasks/${this.taskid}/process-analysis/?`;
        url += Utils.converUrl(params);
        this.vscodeService.get({ url }, (res: any) => {
            // 由于对象直接传递后顺序变乱，所以转化成了json
            if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
                this.resData = (res || {}).data;
            }else{
                this.resData = (JSON.parse(res) || {}).data;
            }
            this.samplingTypeArr = Object.keys(this.resData);

            const treeCpuData = this.getTreeData(this.resData.cpu_usage);
            const treeMemData = this.getTreeData(this.resData.mem_usage);
            const treeDiskData = this.getTreeData(this.resData.disk_usage);
            const treeContextkData = this.getTreeData(this.resData.context_info);
            this.reorganizeTableData(treeCpuData, this.cpuData);
            this.reorganizeTableData(treeMemData, this.memData);
            this.reorganizeTableData(treeDiskData, this.diskData);
            this.reorganizeTableData(treeContextkData, this.contextData);
            this.getSyscall(this.resData.syscall_info);
            this.getList();
            this.showLoading = false;
            this.updateWebViewPage();
        });
    }

    /**
     * 组装数据
     * @param data 数据
     */
    public getTreeData(data: any) {
        this.setSuggestions(data);
        const returnData: any = {};
        let tempPid = '';
        let index = 0;
        if (data != null) {
            Object.keys(data).forEach(key => {
                if (key.indexOf('P') > -1) {
                    const addObj = {
                        index: index++,
                        title: 'PID ' + key.slice(4),
                        active: false,
                        expand: true, // 为了与微架构分析等表格排序一致，微架构分析是通过expand决定是否排序子元素
                    };
                    returnData[key] = Object.assign(data[key], addObj);
                    returnData[key].children = [];
                    returnData[key].ID = key.slice(4);
                    tempPid = key;
                } else if ((tempPid !== '') && (key !== 'suggestion')) {
                    data[key].title = 'TID ' + key.slice(4);
                    data[key].ID = key.slice(4);
                    data[key].index = index++;
                    returnData[tempPid].children.push(data[key]);
                }
            });
        }
        return returnData;
    }

    /**
     * 判断值 然后转换 解决数值为0的情况显示
     */
    getValue(val) {
        if (val.value || val.value === 0) {
            return val.value;
        }
        return val;
    }
    /**
     * 判断总览页面cpu,内存,存储IO,上下文切换是否都无数据
     * @returns boolean
     */
    public hasData() {
        const cpu = Boolean(this.cpuData.data.length);
        const mem = Boolean(this.memData.data.length);
        const disk = Boolean(this.diskData.data.length);
        const context = Boolean(this.contextData.data.length);
        const sysCall = Boolean(this.syscallData.data.length);
        // loading关闭, 并且cpu,内存,存储IO,上下文切换,都无数据时展示无数据照片
        return !this.showLoading && !cpu && !mem && !disk && !context && !sysCall;
    }
    /**
     * 手动设置分页
     * @param e 分页信息
     * @param tableInfo tableInfo
     */
    public updateCpuPage(e: any, tableInfo?: any) {
        const dataCopy = [...tableInfo.srcData.data];
        const beginNum = e.size * (e.currentPage - 1);
        tableInfo.data = dataCopy.splice(beginNum, e.size);
    }

    /**
     * IntellIj刷新webview页面
     */
    public updateWebViewPage() {
        if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
            this.zone.run(() => {
                this.changeDetectorRef.checkNoChanges();
                this.changeDetectorRef.detectChanges();
            });
        }
    }
}
