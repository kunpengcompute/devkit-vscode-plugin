import {
    Component, OnInit, ViewChild, Input,
    ElementRef, Output, EventEmitter, ChangeDetectorRef
} from '@angular/core';
import { I18nService } from '../../service/i18n.service';
import { AxiosService } from '../../service/axios.service';
import { MytipService } from '../../service/mytip.service';
import { currentTheme, VscodeService } from '../../service/vscode.service';
import { DomSanitizer } from '@angular/platform-browser';

/**
 * 颜色主题常量定义
 */
export const enum COLOR_THEME {
    Dark = 1,
    Light = 2
}
@Component({
    selector: 'app-sys-summary',
    templateUrl: './sys-summary.component.html',
    styleUrls: ['./sys-summary.component.scss']
})

export class SysSummaryComponent implements OnInit {
    constructor(
        public sanitizer: DomSanitizer,
        public Axios: AxiosService,
        public i18nService: I18nService,
        public mytip: MytipService,
        public vscodeService: VscodeService,
        private elementRef: ElementRef,
        private changeDetectorRef: ChangeDetectorRef
    ) {
        this.i18n = this.i18nService.I18n();
        // vscode颜色主题
        this.currTheme = currentTheme();

        this.vscodeService.regVscodeMsgHandler('colorTheme', (msg: any) => {
            this.currTheme = msg.colorTheme;
        });
    }
    @Input() tabShowing: boolean; // 用于判断当前tab的状态，为总览页面的相同svg图之间的独立做支撑
    @Input() projectName: any;
    @Input() taskName: any;
    @Input() analysisType: any;
    @Input() isActive: any;
    @Input() taskid: any;
    @Input() nodeid: any;
    @Output() public downloadSummury = new EventEmitter<any>();
    @ViewChild('viewDetailMask', { static: false }) viewDetailMask: any;
    public isHover = false;
    public currTheme: any = COLOR_THEME.Dark;
    public language = 'zh';
    public i18n: any;
    public configItemData: any = { data: {}, language: 'zh' };
    public showData = {
        cpuPackage: false,
        memorySubsystem: false,
        storageSubsystem: false,
        networkSubsystem: false,
        runtimeInformation: false,
        networkConfig: false,
        storageConfig: true,
    };
    public showSvgChart = {
        panoramaSvg: false,
        cpuPackageSvg: false,
        storageSvg: false,
        memorySvg: false,
        networkSvg: false,
    };
    public drillDownName = '';
    public drillDownCpuName = 'cpu0'; // 指明下钻到那个cpu的子系统
    public drillDownNetCpuName = 'cpu0'; // 初始化到有数据net那个cpu的子系统
    public drillDownStorageCpuName = 'cpu0'; // 初始化到有数据storage个cpu的子系统
    public storageNetNum = { storage: [], net: [] };
    public back = false;
    // cpu package 数据
    public cpuPackageData = {};
    // 内存子系统 数据
    public memoryData = {};
    // 存储子系统数据
    public storageData: any;
    // 网络子系统 数据
    public networkData: any;
    // 运行时环境信息
    public runtimeInformationData = {};
    // 判断图表展示
    public chartSwitch = true;
    public backName = '';
    public suggestMsg = []; // 优化建议
    public isAllSvgChartShow = false; // 判断是否为双CPU, SVG显示与否
    public pagesizeTipStr = 'NULL';  // 页表大小 优化建议
    public pagesizeShow = false;
    public borderShow = false;
    /**
     * 组件初始化
     */
    ngOnInit() {
        if (self.webviewSession.getItem('language') === 'en' || self.webviewSession.getItem('language') === 'en-us') {
            this.language = 'en';
            this.configItemData.language = 'en';
        } else {
            this.language = 'zh';
            this.configItemData.language = 'zh';
        }

        this.getConfigData({ level1: 'hard', level2: 'network' });
        this.getData('CPU');
        this.getData('overView');
        this.getData('memory');
        this.getData('storage');
        this.getData('net');
        this.suggestion();
        const that = this;
        setTimeout(() => {
            if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
                this.changeDetectorRef.markForCheck();
                this.changeDetectorRef.detectChanges();
            }
        }, 2500);
        if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
            this.changeDetectorRef.markForCheck();
            this.changeDetectorRef.detectChanges();
        }
    }

    /**
     * 获取数据长度
     * @param data 数据
     */
    public maxLength(data: any) {
        let num = 0;
        for (const item in data) {
            if (data[item].length > num) {
                num = data[item].length;
            }
        }
        return num;
    }

    /**
     * 查询数据公共方法
     * @param item 查询对象
     */
    public async getData(item: string) {
        const params1 = {
            nodeId: this.nodeid,
            queryType: 'summary',
            // 查询对象，如overView，CPU，net，storage，memory
            queryTarget: item,
        };
        const requestOption = {
            url: '/tasks/' + this.taskid + '/sys-performance/summary/?' + this.Axios.converUrl(params1)
        };
        try {
            this.vscodeService.get(requestOption, (res: any) => {
                if (item === 'CPU') {
                    this.showData.cpuPackage = true;
                    this.cpuPackageData = res.data;
                } else if (item === 'memory') {
                    this.showData.memorySubsystem = true;
                    this.memoryData = res.data;
                } else if (item === 'storage') {
                    this.showData.storageSubsystem = true;
                    this.storageData = res.data;
                    if (this.storageData.cpu0.introduction
                        && Object.keys(this.storageData.cpu0.introduction).length > 0) {
                        this.drillDownStorageCpuName = 'cpu0';
                        this.storageNetNum.storage.push('cpu0');
                    } else {
                        this.drillDownStorageCpuName = 'cpu1';
                    }
                    if (this.storageData.cpu1 &&
                        this.storageData.cpu1.introduction
                        && Object.keys(this.storageData.cpu1.introduction).length > 0) {
                        this.storageNetNum.storage.push('cpu1');
                    }
                } else if (item === 'net') {
                    this.showData.networkSubsystem = true;
                    this.networkData = res.data;
                    if (this.networkData.cpu0.net_total_num || this.networkData.cpu0.net_work_num) {
                        this.drillDownNetCpuName = 'cpu0';
                        this.storageNetNum.net.push('cpu0');
                    } else {
                        this.drillDownNetCpuName = 'cpu1';
                    }
                    if (this.networkData.cpu1 &&
                        (this.networkData.cpu1.net_total_num || this.networkData.cpu1.net_work_num)) {
                        this.storageNetNum.net.push('cpu1');
                    }
                } else if (item === 'overView') {
                    if (res.data.res_cpu.cpu_type.length === 2 && res.data.topo_view === 1) {
                        // 判断svg图是否展示
                        this.chartSwitch = false;
                        // 总图展示
                        this.showSvgChart.panoramaSvg = true;
                        this.isAllSvgChartShow = true;
                    }
                    this.showData.runtimeInformation = true;
                    this.runtimeInformationData = res.data;
                }
                self.webviewSession.setItem('chartSwitch', JSON.stringify(this.chartSwitch));
            });
        } catch (error) {
            if (item === 'CPU') {
                this.showData.cpuPackage = true;
            } else if (item === 'memory') {
                this.showData.memorySubsystem = true;
            } else if (item === 'storage') {
                this.showData.storageSubsystem = true;
            } else if (item === 'net') {
                this.showData.networkSubsystem = true;
            } else if (item === 'overView') {
                this.showData.runtimeInformation = true;
            }
        }
    }

    /**
     * 查询配置数据
     * @param item 查询对象
     */
    public getConfigData(item: any) {
        const param = {
            'node-id': this.nodeid,
            'query-type': item.level1,
            'query-target': item.level2,
        };
        const requestOption = {
            url: '/tasks/' + this.taskid + '/sys-config/?' + this.Axios.converUrl(param)
        };
        try {
            this.vscodeService.get(requestOption, (resp: any) => {
                if (resp.data && Object.keys(resp.data).length > 0) {
                    this.showData.networkConfig = true;
                    this.configItemData.data = resp.data;
                }
            });
        } catch (error) {
            this.showData.networkConfig = true;
        }
    }

    /**
     * 返回
     */
    public svgBack() {
        // 返回按钮隐藏
        this.back = false;
        // 总图 及三个列表展示
        this.showSvgChart.panoramaSvg = true;
        this.showData.runtimeInformation = true;
        this.showData.storageConfig = true;
        this.showData.networkConfig = true;
        if (this.drillDownName === 'cpu') {
            this.showSvgChart.cpuPackageSvg = false;
        } else if (this.drillDownName === 'memory') {
            this.showSvgChart.memorySvg = false;
        } else if (this.drillDownName === 'storage') {
            this.showSvgChart.storageSvg = false;
        } else if (this.drillDownName === 'network') {
            this.showSvgChart.networkSvg = false;
        }
    }

    /**
     * 下钻
     */
    public drillDown(e) {
        if (e.element === 'cpu') {
            this.backName = 'CPU Package';
            this.showSvgChart.cpuPackageSvg = true;
        } else if (e.element === 'memory') {
            this.backName = this.i18n.sys_summary.mem_subsystem_text;
            this.showSvgChart.memorySvg = true;
        } else if (e.element === 'storage') {
            this.backName = this.i18n.sys_summary.storage_subsystem_text;
            this.showSvgChart.storageSvg = true;
            this.drillDownStorageCpuName = e.cpu;
        } else if (e.element === 'network') {
            this.backName = this.i18n.sys_summary.net_subsystem_text;
            this.showSvgChart.networkSvg = true;
            this.drillDownNetCpuName = e.cpu;
        } else {
            return;
        }
        this.back = true;
        this.showSvgChart.panoramaSvg = false;   // 总图 及三个列表隐藏
        this.showData.runtimeInformation = false;
        this.showData.storageConfig = false;
        this.showData.networkConfig = false;
        this.drillDownName = e.element;
        this.drillDownCpuName = e.cpu;
    }

    /**
     * 获取优化建议
     */
    public suggestion() {
        const params1 = {
            'node-id': this.nodeid,
            'query-type': 'summary',
            'query-target': '',
            // 例如cpu_usage, cpu_avgload, mem_usage等
        };
        const requestOption = {
            url: '/tasks/' + this.taskid + '/sys-performance/?' + this.Axios.converUrl(params1)
        };
        try {
            this.vscodeService.get(requestOption, (res: any) => {
                if (res.data) {
                    this.setSuggestions(res.data.cpu_usage);
                    if (
                        res.data.cfg_normal_msg.suggestion &&
                        res.data.cfg_normal_msg.suggestion.length !== 0
                    ) {
                        this.pagesizeTipStr = res.data.cfg_normal_msg
                            .suggestion[0].suggest_chs
                            ? this.language === 'zh'
                                ? res.data.cfg_normal_msg.suggestion[0].suggest_chs
                                : res.data.cfg_normal_msg.suggestion[0].suggest_en
                            : 'NULL';
                    }
                    this.setSuggestions(res.data.cfg_normal_msg);
                    this.setSuggestions(res.data.disk_usage);
                    this.setSuggestions(res.data.mem_swap);
                    this.setSuggestions(res.data.net_info);
                    this.pagesizeShow = true;
                }
            });
        } catch (error) {
            this.suggestMsg = [];
            this.pagesizeShow = true;
        }
    }

    /**
     * 组装优化建议集合
     * @param data 优化建议
     */
    public setSuggestions(data: any) {
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
}
