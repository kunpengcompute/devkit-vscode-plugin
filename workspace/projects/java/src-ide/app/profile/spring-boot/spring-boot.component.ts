import { Component, OnInit, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { I18nService } from '../../service/i18n.service';
import { FormBuilder, FormControl, FormGroup, ValidationErrors } from '@angular/forms';
import { TiValidators, TiTableColumns, TiTableSrcData, TiTableRowData } from '@cloud/tiny3';
import { TiValidationConfig } from '@cloud/tiny3';
import { AxiosService } from '../../service/axios.service';
import { TiMessageService } from '@cloud/tiny3';
import { Router } from '@angular/router';
import { StompService } from '../../service/stomp.service';
import { MessageService } from '../../service/message.service';
import { Subscription } from 'rxjs';
import { ProfileDownloadService } from '../../service/profile-download.service';
import { VscodeService, COLOR_THEME } from '../../service/vscode.service';
import { LibService } from './../../service/lib.service';

import { RegularVerify } from 'projects/java/src-com/app/utils/regular-verify';
import { SpinnerBlurInfo } from 'projects/java/src-com/app/utils/spinner-info.type';

@Component({
    selector: 'app-spring-boot',
    templateUrl: './spring-boot.component.html',
    styleUrls: ['./spring-boot.component.scss'],
})
export class SpringBootComponent implements OnInit, OnDestroy {
    @ViewChild('metricsTimeLine', { static: false }) metricsTimeLine: any;
    @ViewChild('httpTracesTimeLine', { static: false }) httpTracesTimeLine: any;
    i18n: any;
    // 登录表单
    form: FormGroup;
    // 用户名校验规则
    public nameValidation: TiValidationConfig = {};
    // 密码校验规则
    public pwdValidation: TiValidationConfig = {};
    // 是否登录失败
    public isLoginFailed = false;
    public isIntellij = (self as any).webviewSession.getItem('tuningOperation') === 'hypertuner';

    constructor(
        formBuilder: FormBuilder,
        private stompService: StompService,
        private elementRef: ElementRef,
        public Axios: AxiosService,
        public timessage: TiMessageService,
        public fb: FormBuilder,
        public regularVerify: RegularVerify,
        public router: Router,
        public i18nService: I18nService,
        private msgService: MessageService,
        private downloadService: ProfileDownloadService,
        private vscodeService: VscodeService,
        public libService: LibService
    ) {
        this.i18n = this.i18nService.I18n();
        this.form = formBuilder.group({
            name: new FormControl('', TiValidators.required),
            pwd: new FormControl('', TiValidators.required),
        });

        if (document.body.className.indexOf('vscode-light') !== -1) {
            this.currTheme = COLOR_THEME.Light;
        } else {
            this.currTheme = COLOR_THEME.Dark;
        }
        this.setThemeColor();
        this.vscodeService.regVscodeMsgHandler('colorTheme', (msg: any) => {
            this.currTheme = msg.colorTheme;
            this.setThemeColor();
        });

        this.springbootGroup = fb.group({
            springboot_threshold: new FormControl(0, {
                validators: [
                    TiValidators.required,
                    TiValidators.minValue(0),
                    TiValidators.maxValue(10000),
                ],
                updateOn: 'change',
            }),
        });
    }

    // sampling配置
    public springbootGroup: FormGroup;
    public springbootBlur: SpinnerBlurInfo;
    // 是否显示二级菜单
    public showTabs = false;
    public springBootTabs: any = [];
    public health: any = {};
    public beans: any = [];
    public beansShowTip: any = false;
    public metrics: any = [];
    // metrics echartsOptions 参数集合
    public metricsTimeData: any[] = [];
    public options: any = [];
    public updateMetrics: any = [];
    public metricsOption: any = {
        top: '0',
        first: false,
        metricsDate: [],
        metricsTime: [],
    };
    public baseColor = '#484a4e';
    // 是否显示登录页
    public showLogin: any = '';
    public isStart: any = false;
    public textType = 'password';
    // http traces阈值
    public threshold = 0;
    public httpOptions: any = {};
    public httpUptate: any = {
        time: [],
        line1: [],
        line2: [],
        line3: [],
    };
    public maxTimeTakens: Map<string, string> = new Map();
    private isStopMsgSub: Subscription;
    public isDownload = false;
    public startBtnDisabled: boolean;
    public column: Array<TiTableColumns>;
    public srcData: TiTableSrcData;
    public displayed: Array<TiTableRowData> = [];
    public searchWords: Array<any> = ['', ''];
    // 设置过滤字段
    public searchKeys: Array<string> = ['method_', 'contentType_'];
    public currentPage: any = 1;
    public totalNumber: any = 0;
    public pageSize: { options: Array<number>; size: number } = {
        options: [10, 20, 50, 100],
        size: 10,
    };
    public httpTraces: any = [];
    public allHttpTraces: any = [];
    public noDadaInfo = '';
    public guardianId: any;
    public jvmId: any;
    public isSpringBoot: boolean;
    public metricsCount: any = 0;
    public projectInfo: any = {};
    public httpTracesLength: any = 0;
    public pathFilterLength: any = 0;
    // http traces路径过滤输入值
    public pathInputValue: any = '';
    // http traces路径过滤值
    public pathValue: any = '';
    public timestampValue: any = 0;
    public methodValue: any = '';
    public statusValue: any = '';
    public timeTakenValue: any = 0;
    public httpOption = {};
    public httpUpdateOption: any = {};
    // http traces时间轴数据
    public httpTracesTimeData: any[] = [];
    public endTime: any = 0;
    public startTime: any = 0;
    public stimeValue: any = '';
    public etimeValue: any = '';
    public sureFilter: any = false;
    public min: any = '';
    public format: any = 'HH:mm:ss';
    public filterShow: any = false;
    public statusShow: any = false;
    public dataArray1: Array<any> = [
        { id: 1, text: '200 - 299', key: '2' },
        { id: 2, text: '300 - 399', key: '3' },
        { id: 3, text: '400 - 499', key: '4' },
        { id: 4, text: '500 - 599', key: '5' },
    ];
    public checkedArray1: Array<any> = [this.dataArray1[0], this.dataArray1[3], this.dataArray1[1], this.dataArray1[2]];
    public todayTime: any = '';
    public textColor = '#E8E8E8';
    public tooltipBgColor = '#424242';
    public xLabelColor = '#aaaaaa';
    public httpTracesCount: any = 0;
    public haveFilter: any = false;
    public statusReg: any;
    public statusCode = 400;
    // metrics echarts实例
    public metricsEchartsInstances: any = [];
    public ecahrtsTime: any = [];
    public echarts1: any = {
        created: [],
        expired: [],
        rejected: [],
    };
    public echarts2: any = {
        current: [],
        max: [],
    };
    public echarts3: any = {
        count: [],
    };
    public echarts4: any = {
        capacity: [],
        used: [],
    };
    public echarts5: any = {
        info: [],
        warn: [],
        trace: [],
        debug: [],
        error: [],
    };
    public allMetricsOpt: any = {
        echarts1: {},
        echarts2: {},
        echarts3: {},
        echarts4: {},
        echarts5: {},
    };
    // metrics图表通用设置
    public sameOpt = {
        type: 'time',
        tooltip: {
            borderWidth: 0,
            trigger: 'axis',
            // 使用手动触发
            triggerOn: 'none',
            confine: true,
            backgroundColor: this.tooltipBgColor,
            borderRadius: 5,
            padding: [10, 20, 10, 20],
            extraCssText: 'box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2)',
            axisPointer: {
                z: 0,
                lineStyle: {
                    color: '#7E8083',
                },
            },
            textStyle: {
                color: this.textColor,
                fontSize: 12,
            },
            formatter: (params: any) => {
                let html = `
                <div class='metrics-tooltip'>
                    <div style='margin-top:5px;'
                    [ngStyle]="{'color':currTheme === COLOR_THEME.Dark ? '#e8e8e8' : '#222'}">
                        <span>${params[0].axisValueLabel}</span>
                    </div>
                `;
                params.forEach((item: any) => {
                    html += `
                    <div style='margin-top:5px;display:flex; justify-content: space-between; align-items: center;'>
                        <div><span style='margin-right:5px;
                         width:8px;height:8px;display:inline-block;background:${item.color}'></span>
                        <span>${item.seriesName}&nbsp:</span></div>
                        <span style='margin-left:10px'>${item.value}</span>
                    </div>
                    `;
                });
                html += `</div>`;
                return html;
            },
        },
        grid: {
            left: '10',
            right: '25',
            top: '40',
            bottom: '10',
            containLabel: true,
        },
        dataZoom: [
            // 放大缩小
            {
                type: 'inside',
                realtime: true,
                start: 0,
                end: 100,
            },
        ],
        xAxis: [
            // 下x轴样式设置
            {
                type: 'category',
                boundaryGap: false,
                axisLine: {
                    onZero: false,
                    lineStyle: {
                        color: this.baseColor,
                        width: 1,
                    },
                },
                axisLabel: {
                    show: true,
                    padding: [5, 0, 0, 0],
                    textStyle: {
                        color: this.xLabelColor,
                    },
                },
                axisTick: {
                    show: true,
                    alignWithLabel: true, // label与刻度线对齐
                    length: 8,
                    lineStyle: {
                        color: this.xLabelColor,
                        width: 1,
                    },
                },
                splitLine: {
                    show: false,
                },
                data: [] as any[],
            },
            // 上x轴样式设置
            {
                type: 'category',
                axisLine: {
                    onZero: false,
                    lineStyle: {
                        color: this.baseColor,
                        width: 1,
                    },
                },
            },
        ],
        yAxis: [
            // 左y轴样式设置
            {
                type: 'value',
                splitNumber: '1',
                axisLine: {
                    show: false,
                },
                axisTick: {
                    show: false,
                },
                splitLine: {
                    show: false,
                },
                axisLabel: {
                    textStyle: {
                        color: this.xLabelColor,
                    },
                    padding: [0, 0, 0, 8],
                },
            },
        ],
    };
    // 3266C3, 45CC90, 4ECCC8 三种颜色到透明的echarts渐变设置
    public areaColorLinears = [
        {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
                {
                    offset: 0,
                    color: '#3d7ff3',
                },
                {
                    offset: 1,
                    color: 'rgba(61,127,243,0.4)',
                },
            ],
        },
        {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
                {
                    offset: 0,
                    color: '#2da46f',
                },
                {
                    offset: 1,
                    color: 'rgba(45,164,111,0.4)',
                },
            ],
        },
        {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
                {
                    offset: 0,
                    color: '#18aba6',
                },
                {
                    offset: 1,
                    color: 'rgba(24,171,166,0.4)',
                },
            ],
        },
    ];
    public metricsOpt1 = {
        type: this.sameOpt.type,
        tooltip: this.sameOpt.tooltip,
        grid: this.sameOpt.grid,
        xAxis: [] as any[],
        yAxis: this.sameOpt.yAxis,
        dataZoom: this.sameOpt.dataZoom,
        color: ['#3d7ff3', '#2da46f', '#18aba6'],
        legend: {
            itemHeight: 10,
            itemWidth: 10,
            right: 25,
            icon: 'rect',
            data: ['created', 'expired', 'rejected'],
            textStyle: {
                color: this.textColor,
            },
            inactiveColor: '#616161',
        },
        series: [
            {
                id: 'created',
                name: 'created',
                type: 'line',
                showSymbol: false,
                smooth: false,
                data: [] as any[],
                z: 9
            },
            {
                id: 'expired',
                name: 'expired',
                type: 'line',
                showSymbol: false,
                smooth: false,
                data: [],
                z: 9
            },
            {
                id: 'rejected',
                name: 'rejected',
                type: 'line',
                showSymbol: false,
                smooth: false,
                data: [],
                z: 9
            },
        ],
    };
    public metricsOpt2 = {
        type: this.sameOpt.type,
        tooltip: this.sameOpt.tooltip,
        grid: this.sameOpt.grid,
        xAxis: [] as any[],
        yAxis: this.sameOpt.yAxis,
        dataZoom: this.sameOpt.dataZoom,
        color: ['#3d7ff3', '#2da46f'],
        legend: {
            right: 25,
            icon: 'rect',
            itemHeight: 10,
            itemWidth: 10,
            data: ['active.current', 'active.max'],
            textStyle: {
                color: this.textColor,
            },
            inactiveColor: '#616161',
        },
        series: [
            {
                id: 'active.current',
                name: 'active.current',
                type: 'line',
                areaStyle: {
                    color: this.areaColorLinears[0],
                    opacity: 0.5,
                },
                showSymbol: false,
                smooth: false,
                data: [] as any[],
                z: 9
            },
            {
                id: 'active.max',
                name: 'active.max',
                type: 'line',
                areaStyle: {
                    color: this.areaColorLinears[1],
                    opacity: 0.5,
                },
                showSymbol: false,
                smooth: false,
                data: [],
                z: 9
            },
        ],
    };
    public metricsOpt3 = {
        type: this.sameOpt.type,
        tooltip: this.sameOpt.tooltip,
        grid: this.sameOpt.grid,
        xAxis: [] as any[],
        yAxis: this.sameOpt.yAxis,
        dataZoom: this.sameOpt.dataZoom,
        color: ['#3d7ff3'],
        legend: {
            right: 25,
            icon: 'rect',
            itemHeight: 10,
            itemWidth: 10,
            data: ['count'],
            textStyle: {
                color: this.textColor,
            },
            inactiveColor: '#616161',
        },
        series: [
            {
                id: 'count',
                name: 'count',
                type: 'line',
                smooth: false,
                areaStyle: {
                    color: '#3d7ff3',
                    opacity: 0.2,
                },
                showSymbol: false,
                data: [] as any[],
                z: 9
            },
        ],
    };
    public metricsOpt4 = {
        type: this.sameOpt.type,
        tooltip: this.sameOpt.tooltip,
        grid: this.sameOpt.grid,
        xAxis: [] as any[],
        yAxis: this.sameOpt.yAxis,
        dataZoom: this.sameOpt.dataZoom,
        color: ['#3d7ff3', '#2da46f'],
        legend: {
            right: 25,
            icon: 'rect',
            itemHeight: 10,
            itemWidth: 10,
            data: ['total.capacity', 'memory.used'],
            textStyle: {
                color: this.textColor,
            },
            inactiveColor: '#616161',
        },
        series: [
            {
                id: 'total.capacity',
                name: 'total.capacity',
                type: 'line',
                areaStyle: {
                    color: this.areaColorLinears[0],
                    opacity: 0.5,
                },
                smooth: false,
                showSymbol: false,
                data: [] as any[],
                z: 9
            },
            {
                id: 'memory.used',
                name: 'memory.used',
                type: 'line',
                areaStyle: {
                    color: this.areaColorLinears[1],
                    opacity: 0.5,
                },
                smooth: false,
                showSymbol: false,
                data: [],
                z: 9
            },
        ],
    };
    public metricsOpt5 = {
        type: this.sameOpt.type,
        tooltip: this.sameOpt.tooltip,
        grid: this.sameOpt.grid,
        xAxis: [] as any[],
        yAxis: this.sameOpt.yAxis,
        dataZoom: this.sameOpt.dataZoom,
        color: ['#3d7ff3', '#2da46f', '#18aba6', '#9653e1', '#618824'],
        legend: {
            right: 25,
            icon: 'rect',
            itemHeight: 10,
            itemWidth: 10,
            data: ['info', 'warn', 'trace', 'debug', 'error'],
            textStyle: {
                color: this.textColor,
            },
            inactiveColor: '#616161',
            selected: {
                debug: false,
            },
        },
        series: [
            {
                id: 'info',
                name: 'info',
                type: 'line',
                smooth: false,
                showSymbol: false,
                data: [] as any[],
                z: 9
            },
            {
                id: 'warn',
                name: 'warn',
                type: 'line',
                smooth: false,
                showSymbol: false,
                data: [],
                z: 9
            },
            {
                id: 'trace',
                name: 'trace',
                type: 'line',
                smooth: false,
                showSymbol: false,
                data: [],
                z: 9
            },
            {
                id: 'debug',
                name: 'debug',
                type: 'line',
                smooth: false,
                showSymbol: false,
                data: [],
                z: 9
            },
            {
                id: 'error',
                name: 'error',
                type: 'line',
                smooth: false,
                showSymbol: false,
                data: [],
                z: 9
            },
        ],
    };
    public tabActive: any = 'health';
    public nodataTip = '';
    public currTheme = COLOR_THEME.Dark;
    public ColorTheme = {
        Dark: COLOR_THEME.Dark,
        Light: COLOR_THEME.Light
    };
    private metricsTimelimit = 5;
    private httpTracesTimelimit = 5;
    private httpTracesDatalimit = 3000;
    // 获取springboot信息的interval
    private pollingGetProjectInfo: any;
    public showLoading = false;
    /**
     * 设置主题色
     */
    public setThemeColor() {
        if (this.currTheme === COLOR_THEME.Light) {
            this.baseColor = '#d4d9e6';
            this.textColor = '#222';
            this.tooltipBgColor = '#ffffff';
            this.xLabelColor = '#616161';
        } else {
            this.textColor = '#E8E8E8';
            this.baseColor = '#484a4e';
            this.tooltipBgColor = '#424242';
            this.xLabelColor = '#aaa';
        }
    }

    /**
     * ngOnInit
     */
    async ngOnInit() {

        this.setSpinnerBlur();

        this.metricsOpt1.legend.textStyle.color = this.textColor;
        this.metricsOpt2.legend.textStyle.color = this.textColor;
        this.metricsOpt3.legend.textStyle.color = this.textColor;
        this.metricsOpt4.legend.textStyle.color = this.textColor;
        this.metricsOpt5.legend.textStyle.color = this.textColor;

        this.metricsOpt1.tooltip.backgroundColor = this.tooltipBgColor;
        this.metricsOpt2.tooltip.backgroundColor = this.tooltipBgColor;
        this.metricsOpt3.tooltip.backgroundColor = this.tooltipBgColor;
        this.metricsOpt4.tooltip.backgroundColor = this.tooltipBgColor;
        this.metricsOpt5.tooltip.backgroundColor = this.tooltipBgColor;

        this.metricsOpt1.tooltip.textStyle.color = this.textColor;
        this.metricsOpt2.tooltip.textStyle.color = this.textColor;
        this.metricsOpt3.tooltip.textStyle.color = this.textColor;
        this.metricsOpt4.tooltip.textStyle.color = this.textColor;
        this.metricsOpt5.tooltip.textStyle.color = this.textColor;

        this.metricsOpt1.xAxis = this.setxAxis();
        this.metricsOpt2.xAxis = this.setxAxis();
        this.metricsOpt3.xAxis = this.setxAxis();
        this.metricsOpt4.xAxis = this.setxAxis();
        this.metricsOpt5.xAxis = this.setxAxis();


        this.showLoading = true;
        this.metricsTimelimit = this.downloadService.dataLimit.boot_metrics.timeValue;
        this.httpTracesTimelimit = this.downloadService.dataLimit.boot_traces.timeValue;
        this.httpTracesDatalimit = this.downloadService.dataLimit.boot_traces.dataValue;

        this.guardianId = (self as any).webviewSession.getItem('guardianId');
        this.jvmId = (self as any).webviewSession.getItem('jvmId');
        this.startBtnDisabled = JSON.parse((self as any).webviewSession.getItem('isProStop') || 'false');
        this.isDownload = JSON.parse((self as any).webviewSession.getItem('downloadProfile') || 'false');
        this.springbootGroup.controls.springboot_threshold.setValue(this.downloadService.dataSave.sprThreshold);
        this.isStart = this.downloadService.dataSave.isSpringBootStart;
        this.noDadaInfo = this.i18n.common_term_task_nodata;
        this.springBootTabs = this.downloadService.downloadItems.springBoot.tabs;
        this.nodataTip = this.isDownload ? this.i18n.common_term_task_nodata :
            this.i18n.plugins_perf_java_profiling_spring_boot.notSpringBootProcess;
        if (!this.isDownload) {
            await this.getProjectInfo();
        }
        // http traces表格列头
        this.column = [
            {
                title: this.i18n.plugins_perf_java_profiling_spring_boot.http_traces.table.timestamp,
                width: '15%',
                select: null,
                key: 'timestamp_',
            },
            {
                title: this.i18n.plugins_perf_java_profiling_spring_boot.http_traces.table.session,
                width: '17%',
                select: null,
                key: 'session_',
            },
            {
                title: this.i18n.plugins_perf_java_profiling_spring_boot.http_traces.table.method,
                width: '6%',
                selected: null,
                key: 'method_',
                // 该列的 headfilter 下拉选择项
                options: [
                    {
                        label: 'ALL',
                    },
                    {
                        label: 'GET',
                    },
                    {
                        label: 'POST',
                    },
                    {
                        label: 'DELETE',
                    },
                    {
                        label: 'PATCH',
                    },
                ],
            },
            {
                title: this.i18n.plugins_perf_java_profiling_spring_boot.http_traces.table.url,
                width: '22%',
                select: null,
                key: 'url_',
            },
            {
                title: this.i18n.plugins_perf_java_profiling_spring_boot.http_traces.table.status,
                width: '6%',
                select: null,
                key: 'status_',
            },
            {
                title: this.i18n.plugins_perf_java_profiling_spring_boot.http_traces.table.content,
                width: '22%',
                key: 'contentType_',
                selected: null,
                options: [],
            },
            {
                title: this.i18n.plugins_perf_java_profiling_spring_boot.http_traces.table.timeTaken,
                width: '12%',
                selected: null,
                sortKey: 'timeTaken_',
            },
        ];
        this.srcData = {
            data: [],
            state: {
                searched: false,
                sorted: false,
                paginated: false,
            },
        };
        // 登录页面用户名输入框验证
        this.nameValidation = {
            type: 'blur',
            errorMessage: {
                required: this.i18n.common_term_login_error_info[0],
            },
        };
        // 登录页面密码输入框验证
        this.pwdValidation = {
            type: 'blur',
            errorMessage: {
                required: this.i18n.common_term_login_error_info[1],
            },
        };
        this.httpOption = {
            type: 'time',
            color: ['#5BA239', '#F7B212', '#E34439'],
            // 提示框
            tooltip: {
                borderWidth: 0,
                trigger: 'axis',
                confine: true,
                backgroundColor: this.currTheme === COLOR_THEME.Dark ? '#424242' : '#ffffff',
                padding: [10, 20, 10, 20],
                extraCssText: 'box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2)',
                axisPointer: {
                    z: 0,
                    lineStyle: {
                        color: '#7E8083',
                    },
                },
                textStyle: {
                    color: this.textColor,
                    fontSize: 12,
                },
                formatter: (params: any): any => {
                    const maxTimeTaken = this.maxTimeTakens.get(params[0].axisValueLabel);
                    let totalCount = 0;
                    params.forEach((item: any) => {
                        totalCount += item.value;
                    });
                    if (params.length) {
                        let html = `
                        <div>
                            <div style='margin-top:5px;'
                             [ngStyle]="{'color':currTheme === COLOR_THEME.Dark ? '#e8e8e8' : '#222'}">
                                <span>${params[0].axisValueLabel}</span>
                            </div>
                        `;
                        const tipKeys: Array<any> = [
                            {
                                key: this.i18n.plugins_perf_java_profiling_spring_boot.http_traces.tooltip.requestCount,
                                unit: '',
                                value: totalCount,
                            },
                            {
                                key: this.i18n.plugins_perf_java_profiling_spring_boot.http_traces.tooltip.maxTime,
                                unit: 'ms',
                                value: maxTimeTaken,
                            },
                        ];
                        const i18nLegendValues =
                            Object.values(this.i18n.plugins_perf_java_profiling_spring_boot.http_traces.legend);
                        for (let i = 0; i < params.length; i++) {
                            tipKeys.splice(1 + i, 0, {
                                key: i18nLegendValues[params[i].seriesIndex],
                                unit: '',
                                value: params[i].value,
                                legend: params[i].color,
                            });
                        }
                        tipKeys.forEach((item) => {
                            let legendDomStr = '';
                            if (item.legend) {
                                legendDomStr = `
                                    <span style='
                                        display: inline-block;
                                        width: 10px;
                                        height: 10px;
                                        background: ${item.legend}'>
                                    </span>
                                `;
                            }
                            html += `
                            <div style='margin-top:5px;display:flex; justify-content: space-between;'>
                                <div>
                                    ${legendDomStr}
                                    <span>${item.key}:</span>
                                </div>
                                <span style='margin-left:10px'>${item.value}${item.unit}</span>
                            </div>
                            `;
                        });

                        html += `</div>`;
                        return html;
                    }
                },
            },
            legend: {
                itemHeight: 10,
                itemWidth: 10,
                right: 25,
                icon: 'rect',
                textStyle: {
                    color: this.textColor,
                    fontSize: 16,
                },
                inactiveColor: '#616161',
                data: [
                    this.i18n.plugins_perf_java_profiling_spring_boot.http_traces.legend.status2,
                    this.i18n.plugins_perf_java_profiling_spring_boot.http_traces.legend.status4,
                    this.i18n.plugins_perf_java_profiling_spring_boot.http_traces.legend.status5,
                ],
            },
            dataZoom: [
                // 放大缩小
                {
                    type: 'inside',
                    realtime: true,
                    start: 0,
                    end: 100,
                },
            ],
            // 网格
            grid: {
                left: '0',
                right: '25',
                top: '40',
                bottom: '10',
                containLabel: true,
            },
            xAxis: [
                // 下x轴样式设置
                {
                    type: 'category',
                    boundaryGap: false,
                    axisLine: {
                        onZero: false,
                        lineStyle: {
                            color: this.baseColor,
                            width: 1,
                        },
                    },
                    axisLabel: {
                        show: true,
                        padding: [5, 0, 0, 0],
                        textStyle: {
                            color: this.xLabelColor,
                        },
                    },
                    axisTick: {
                        show: true,
                        alignWithLabel: true, // label与刻度线对齐
                        length: 8,
                        lineStyle: {
                            color: this.baseColor,
                            width: 2,
                        },
                    },
                    splitLine: {
                        show: false,
                    },
                    data: [],
                },
            ],
            yAxis: [
                {
                    type: 'value',
                    axisLine: {
                        show: false,
                    },
                    axisTick: {
                        show: false,
                    },
                    splitLine: {
                        lineStyle: {
                            color: this.baseColor,
                        },
                    },
                    axisLabel: {
                        textStyle: {
                            color: this.xLabelColor,
                        },
                    },
                },
            ],
            series: [
                {
                    id: 'line1',
                    name: this.i18n.plugins_perf_java_profiling_spring_boot.http_traces.legend.status2,
                    type: 'line',
                    smooth: false,
                    showSymbol: false,
                    data: [],
                    z: 9
                },
                {
                    id: 'line2',
                    name: this.i18n.plugins_perf_java_profiling_spring_boot.http_traces.legend.status4,
                    type: 'line',
                    smooth: false,
                    showSymbol: false,
                    data: [],
                    z: 9
                },
                {
                    id: 'line3',
                    name: this.i18n.plugins_perf_java_profiling_spring_boot.http_traces.legend.status5,
                    type: 'line',
                    smooth: false,
                    showSymbol: false,
                    data: [],
                    z: 9
                },
            ],
        };
        this.downloadService.clearTabs.currentTabPage = this.i18n.protalserver_profiling_tab.springBoot;
        // 订阅停止profiling分析消息
        this.isStopMsgSub = this.msgService.getMessage().subscribe((msg) => {
            if (msg.type === 'isStopPro') {
                this.isStart = false;
                this.startBtnDisabled = true;
            }
            if (msg.type === 'isClear' || msg.type === this.i18n.protalserver_profiling_tab.springBoot) {
                if (msg.type === 'isClear') {
                    this.health = {};
                    this.beans = [];
                    this.dataInitMetrics();
                    this.dataInitHttp();
                }
                if (msg.type === this.i18n.protalserver_profiling_tab.springBoot) {
                    if (this.tabActive === 'health') {
                        this.health = {};
                    }
                    if (this.tabActive === 'beans') {
                        this.beans = [];
                    }
                    if (this.tabActive === 'metrics') {
                        this.dataInitMetrics();
                    }
                    if (this.tabActive === 'httpTracs') {
                        this.dataInitHttp();
                    }
                }
            }
        });
        this.downLoad();
        this.stompService.health = this.msgService.getMessage().subscribe((msg) => {
            if (msg.type === 'health') {
                if (msg.data.eventName_ === '') {
                    return;
                }
                this.health = msg.data;
                if (this.health.dataBase_.length > 0) {
                    this.health.dataBase_.forEach((item: any) => {
                        if (item.name_ === 'mongo') {
                            item.name_ = 'MongoDB';
                        }
                        if (item.name_ === 'cassandra') {
                            item.name_ = 'Cassandra';
                        }
                        if (item.name_ === 'redis') {
                            item.name_ = 'Redis';
                        }
                    });
                }
                this.updateDownloadItems('health');
            }
        });
        this.stompService.metrics = this.msgService.getMessage().subscribe((msg) => {
            if (msg.type === 'dataLimit' && msg.data.name === 'boot_metrics') {
                this.metricsTimelimit = msg.data.value;
            }
            if (msg.type === 'metrics') {
                if (msg.data.metricsInfo_.length === 0) {
                    return;
                }
                const metrics = msg.data.metricsInfo_.filter((item: any) => {
                    return item.baseUnit_ !== 'seconds';
                });
                this.metrics = metrics;
                const timestamp = msg.data.timestamp_;
                this.ecahrtsTime.push(this.dateFormat(timestamp).time);
                // 5秒1条数据，限制数据量在this.metricsTimelimit分钟内
                const outNumber = this.ecahrtsTime.length - 12 * this.metricsTimelimit;
                if (outNumber > 0) {
                    this.ecahrtsTime.splice(0, outNumber);
                }
                this.metricsTimeData = JSON.parse(JSON.stringify(this.ecahrtsTime));
                this.metricsCategory(metrics);
                this.updateDownloadItems('metrics');
            }
        });
        this.stompService.httptrace = this.msgService.getMessage().subscribe((msg) => {
            if (msg.type === 'dataLimit' && msg.data.name === 'boot_traces') {
                if (msg.data.type === 'times') {
                    this.httpTracesTimelimit = msg.data.value;
                } else if (msg.data.type === 'records') {
                    this.httpTracesDatalimit = msg.data.value;
                }
            }
            if (msg.type === 'httptrace') {
                if (msg.data.httpTraces_.length === 0) {
                    return;
                }
                // 修改时间戳展示样式，处理contentType_的[]
                msg.data.httpTraces_.forEach((item: any) => {
                    item.newTime = this.httpDateFormat(item.timestamp_, 'yyyy-MM-dd hh:mm:ss.S');
                    item.contentType_ = item.contentType_.replace(/[\[\]]/g, '');
                });
                // 对新增数据进行路径过滤
                if (this.pathValue !== '') {
                    msg.data.httpTraces_ = msg.data.httpTraces_.filter((item: any) => {
                        return item.uri_.indexOf(this.pathValue) > -1;
                    });
                    this.pathFilterLength += msg.data.httpTraces_.length;
                } else {
                    this.pathFilterLength = 0;
                }
                const httpTraces = msg.data.httpTraces_;
                const timestamp = msg.data.timestamp_;
                this.todayTime = this.dateFormat(timestamp).data;
                this.downloadService.downloadItems.springBoot.httpTraces.filterTime.data = this.todayTime;
                // allHttpTraces 保存最新的this.httpTracesDatalimit条分析数据，所有的数据。不含过滤条件
                this.allHttpTraces.unshift.apply(this.allHttpTraces, httpTraces);
                if (this.allHttpTraces.length > this.httpTracesDatalimit) {
                    this.allHttpTraces = this.allHttpTraces.slice(0, this.httpTracesDatalimit);
                    this.refreshPathFilterLength();
                }
                this.getCtOptions();
                this.getMethodOpt();
                this.httpTracesLength = this.allHttpTraces.length;
                this.fliterHttptraces(httpTraces, timestamp); // 获取三条line的参数
                this.srcData.data = this.allHttpTraces;
                // 数据推送更新的所有过滤状态记录
                if (this.sureFilter || this.haveFilter) {
                    this.filterTimeAndStatus();
                }
                this.updateDownloadItems('httptrace');
            }
        });
    }

    /**
     * 微调器回填初始化
     */
    public setSpinnerBlur() {
        this.springbootBlur = {
            control: this.springbootGroup.controls.springboot_threshold,
            min: 0,
            max: 10000,
        };
    }

    /**
     * 微调器回填
     */
    public verifySpinnerValue(value: any) {
        this.regularVerify.setSpinnerInfo(value);
        if (this.isIntellij){
          const { control, min, max } = value;
          const curValue = +control?.value; // number, NaN
          if (curValue == null || isNaN(curValue)){
            control.setValue(min);
          }
          if ( curValue <= min){
            control.setValue(min);
          }
          if (curValue >= max){
            control.setValue(max);
          }
        }
    }

    public setxAxis(): any {
        const xAxis = [
            // 下x轴样式设置
            {
                type: 'category',
                boundaryGap: false,
                axisLine: {
                    onZero: false,
                    lineStyle: {
                        color: this.baseColor,
                        width: 1,
                    },
                },
                axisLabel: {
                    show: true,
                    padding: [5, 0, 0, 0],
                    textStyle: {
                        color: this.xLabelColor,
                    },
                },
                axisTick: {
                    show: true,
                    alignWithLabel: true, // label与刻度线对齐
                    length: 8,
                    lineStyle: {
                        color: this.xLabelColor,
                        width: 1,
                    },
                },
                splitLine: {
                    show: false,
                },
                data: [] as any[],
            },
            // 上x轴样式设置
            {
                type: 'category',
                axisLine: {
                    onZero: false,
                    lineStyle: {
                        color: this.baseColor,
                        width: 1,
                    },
                },
            },
        ];
        return xAxis;
    }

    /**
     * 处理metrics echarts图上的鼠标移动事件
     * 手动显示所有tooltip
     *
     * @param event 事件对象
     */
    public handleMousemove(event: any) {
        this.metricsEchartsInstances.forEach((echartsInstantce: any) => {
            echartsInstantce.dispatchAction({
                type: 'showTip',
                x: event.zrX,
                y: 40,
            });
        });
    }

    /**
     * 发送消息给vscode, 右下角弹出提醒框
     * @param info info
     * @param type type
     */
    showInfoBox(info: any, type: any) {
        const message = {
            cmd: 'showInfoBox',
            data: {
                info,
                type
            }
        };
        this.vscodeService.postMessage(message, null);
    }

    /**
     * 处理metrics echarts图上的缩放事件
     * 手动缩放所有echarts图和时间轴
     *
     * @param event dataZoom事件对象
     */
    public handleMetricsDatazoom(event: any) {
        this.metricsEchartsInstances.forEach((echartsInstance: any) => {
            echartsInstance.setOption({
                dataZoom: [
                    {
                        start: event.batch[0].start,
                        end: event.batch[0].end,
                    },
                ],
            });
        });
        this.metricsTimeLine.dataConfig({
            start: event.batch[0].start,
            end: event.batch[0].end,
        });
    }

    /**
     * 处理http traces echarts图上的缩放事件
     * 手动缩放时间轴
     *
     * @param event dataZoom事件对象
     */
    public handleHttptracesDatazoom(event: any) {
        this.httpTracesTimeLine.dataConfig({
            start: event.batch[0].start,
            end: event.batch[0].end,
        });
    }

    /**
     * 初始化Metrics
     */
    public dataInitMetrics() {
        this.ecahrtsTime = [];
        this.echarts1.created = [];
        this.echarts1.expired = [];
        this.echarts1.rejected = [];
        this.echarts2.current = [];
        this.echarts2.max = [];
        this.echarts3.count = [];
        this.echarts4.capacity = [];
        this.echarts4.used = [];
        this.echarts5.info = [];
        this.echarts5.warn = [];
        this.echarts5.trace = [];
        this.echarts5.debug = [];
        this.echarts5.error = [];
        this.getEchartOpt();
    }

    /**
     * 初始化http
     */
    public dataInitHttp() {
        this.httpUptate.time = [];
        this.httpUptate.line1 = [];
        this.httpUptate.line2 = [];
        this.httpUptate.line3 = [];
        this.httpUptate.maxNum = [];
        this.srcData.data = [];
        this.httpTraces = [];
        this.allHttpTraces = [];
        this.setHttpOptions();
    }

    /**
     * downLoad
     */
    public downLoad() {
        this.projectInfo = this.downloadService.downloadItems.springBoot.springBootInfo;
        this.isSpringBoot = this.projectInfo.springbootProject ? true : false;
        if (this.isDownload) {
            this.showLogin = 'false';
            this.showLoading = false;
        }
        this.health = this.downloadService.downloadItems.springBoot.health;
        this.beans = this.downloadService.downloadItems.springBoot.beans;
        this.metrics = this.downloadService.downloadItems.springBoot.metrics.metrics;
        this.echarts1 = this.downloadService.downloadItems.springBoot.metrics.echarts1;
        this.echarts2 = this.downloadService.downloadItems.springBoot.metrics.echarts2;
        this.echarts3 = this.downloadService.downloadItems.springBoot.metrics.echarts3;
        this.echarts4 = this.downloadService.downloadItems.springBoot.metrics.echarts4;
        this.echarts5 = this.downloadService.downloadItems.springBoot.metrics.echarts5;
        this.ecahrtsTime = this.downloadService.downloadItems.springBoot.metrics.echartsTime;
        this.metricsTimeData = JSON.parse(JSON.stringify(this.ecahrtsTime));
        this.allMetricsOpt = this.downloadService.downloadItems.springBoot.metrics.options;
        this.allHttpTraces = this.downloadService.downloadItems.springBoot.httpTraces.allHttpTraces;
        this.getCtOptions();
        this.getMethodOpt();
        this.todayTime = this.downloadService.downloadItems.springBoot.httpTraces.filterTime.data;
        this.stimeValue = this.downloadService.downloadItems.springBoot.httpTraces.filterTime.start;
        this.etimeValue = this.downloadService.downloadItems.springBoot.httpTraces.filterTime.end;
        this.httpTraces = this.allHttpTraces;
        this.srcData.data = this.httpTraces;
        this.totalNumber = this.srcData.data.length;
        this.httpTracesLength = this.allHttpTraces.length;
        this.httpUptate = this.downloadService.downloadItems.springBoot.httpTraces.httpOptions;
        this.springbootGroup.controls.springboot_threshold.setValue(
            this.downloadService.downloadItems.springBoot.httpTraces.threshold);
        this.setHttpOptions();
        this.getEchartOpt();
        this.showTabs = this.health.eventName_ ||
            this.beans.length > 0 ||
            this.metrics.length > 0 ||
            this.allHttpTraces.length > 0;
    }
    /**
     * 获取spring boot应用信息，根据应用信息初始化页面
     */
    public getProjectInfo(): any {
        if ((self as any).webviewSession.getItem('springBoot')) {
            if (this.startBtnDisabled) {
                return;
            }
        }
        return new Promise<void>((resolve) => {
            // 轮询接口：只有在后端jvm初始化完成后，接口才可正常访问
            this.pollingGetProjectInfo = setInterval(() => {
                this.vscodeService.get({ url: `/springboot/${this.guardianId}/jvm/${this.jvmId}/getProjectInfo` },
                    (projectInfo: any) => {
                        // spring boot 应用特殊情况后端会返回 failReason
                        if (projectInfo.failReason !== '') {
                            this.nodataTip = projectInfo.failReason;
                            this.isSpringBoot = false;
                            this.showLoading = false;
                            return;
                        }
                        if (projectInfo.status && projectInfo.status === this.statusCode) {
                            this.isSpringBoot = false;
                            this.showLoading = false;
                            return;
                        }
                        clearInterval(this.pollingGetProjectInfo);
                        this.projectInfo = projectInfo;
                        (self as any).webviewSession.setItem('springBoot', JSON.stringify(projectInfo));
                        this.downloadService.downloadItems.springBoot.springBootInfo = projectInfo;
                        this.isSpringBoot = projectInfo.springbootProject;
                        this.showLoading = false;
                        this.springBootTabs = [
                            {
                                id: 'health',
                                tabName: this.i18n.plugins_perf_java_profiling_spring_boot.tabs.health,
                                active: true,
                            },
                            {
                                id: 'beans',
                                tabName: this.i18n.plugins_perf_java_profiling_spring_boot.tabs.beans,
                                active: false,
                            },
                            {
                                id: 'httpTracs',
                                tabName: this.i18n.plugins_perf_java_profiling_spring_boot.tabs.http_traces,
                                active: false,
                            },
                        ];
                        if (projectInfo.displayTablePage.includes('metrics')) {
                            this.springBootTabs.splice(2, 0, {
                                id: 'metrics',
                                tabName: this.i18n.plugins_perf_java_profiling_spring_boot.tabs.metrics,
                                active: false,
                            });
                        }
                        this.downloadService.downloadItems.springBoot.tabs = this.springBootTabs;
                        if (this.projectInfo.configUserPassword) {
                            let spLogin = (self as any).webviewSession.getItem('springBootToken');
                            if (spLogin) {
                                spLogin = JSON.parse(spLogin);
                                if (spLogin.jvmId === this.jvmId && spLogin.login) {
                                    this.showLogin = 'false';
                                } else {
                                    this.showLogin = 'true';
                                }
                            } else {
                                this.showLogin = 'true';
                            }
                        } else {
                            this.showLogin = 'false';
                        }
                        resolve();
                    });
            }, 1000);
        });
    }

    /**
     * 获取metrics数据分类
     * @param metrics metrics
     */
    public metricsCategory(metrics: any) {
        if (metrics.length === 0) {
            return;
        }
        metrics.forEach((item: any) => {
            item.measurements_ = JSON.parse(JSON.stringify(this.getMeasurements(item.measurements_)));
        });
        const tomcatList = metrics.filter((item: any) => {
            return item.name_.includes('tomcat');
        });
        const jvmList = metrics.filter((item: any) => {
            return item.name_.includes('jvm');
        });
        const logbackList = metrics.filter((item: any) => {
            return item.name_.includes('logback');
        });
        this.getMetricsOpt(tomcatList, jvmList, logbackList);
    }

    /**
     * 添加metrics的echarts图数据
     * @param tomcatList tomcatList
     * @param jvmList jvmList
     * @param logbackList logbackList
     */
    public getMetricsOpt(tomcatList: any, jvmList: any, logbackList: any) {
        // echarts1
        const countList = tomcatList.filter((item: any) => {
            return item.measurements_.count;
        });
        // 获取echarts1的created、expired、rejected参数
        const created = countList.filter((item: any) => {
            return item.name_.includes('created');
        });
        const expired = countList.filter((item: any) => {
            return item.name_.includes('expired');
        });
        const rejected = countList.filter((item: any) => {
            return item.name_.includes('rejected');
        });
        this.echarts1.created.push(created[0].measurements_.count);
        this.echarts1.expired.push(expired[0].measurements_.count);
        this.echarts1.rejected.push(rejected[0].measurements_.count);

        // echarts2
        const valueList = tomcatList.filter((item: any) => {
            return item.measurements_.value;
        });
        // 获取echarts2的current、max参数
        const current = valueList.filter((item: any) => {
            return item.name_.includes('current');
        });
        const max = valueList.filter((item: any) => {
            return item.name_.includes('max');
        });
        this.echarts2.current.push(current[0].measurements_.value);
        this.echarts2.max.push(max[0].measurements_.value);

        // echarts3
        const jvmCount = jvmList.filter((item: any) => {
            return item.name_.includes('count');
        });
        this.echarts3.count.push(jvmCount[0].measurements_.value);

        // echarts4
        const jvmTCapacity = jvmList.filter((item: any) => {
            return item.name_.includes('total');
        });
        const jvmMused = jvmList.filter((item: any) => {
            return item.name_.includes('memory');
        });
        this.echarts4.capacity.push(+jvmTCapacity[0].measurements_.value / 1024);
        this.echarts4.used.push(+jvmMused[0].measurements_.value / 1024);

        // echarts5
        const logInfo = logbackList.filter((item: any) => {
            return item.name_.includes('info');
        });
        const logWarn = logbackList.filter((item: any) => {
            return item.name_.includes('warn');
        });
        const logTrace = logbackList.filter((item: any) => {
            return item.name_.includes('trace');
        });
        const logDebug = logbackList.filter((item: any) => {
            return item.name_.includes('debug');
        });
        const logError = logbackList.filter((item: any) => {
            return item.name_.includes('error');
        });
        this.echarts5.info.push(logInfo[0].measurements_.count);
        this.echarts5.warn.push(logWarn[0].measurements_.count);
        this.echarts5.trace.push(logTrace[0].measurements_.count);
        this.echarts5.debug.push(logDebug[0].measurements_.count);
        this.echarts5.error.push(logError[0].measurements_.count);

        const outNumber = this.echarts5.error.length - 12 * this.metricsTimelimit;
        if (outNumber > 0) {
            this.echarts1.created.splice(0, outNumber);
            this.echarts1.expired.splice(0, outNumber);
            this.echarts1.rejected.splice(0, outNumber);
            this.echarts2.current.splice(0, outNumber);
            this.echarts2.max.splice(0, outNumber);
            this.echarts3.count.splice(0, outNumber);
            this.echarts4.capacity.splice(0, outNumber);
            this.echarts4.used.splice(0, outNumber);
            this.echarts5.info.splice(0, outNumber);
            this.echarts5.warn.splice(0, outNumber);
            this.echarts5.trace.splice(0, outNumber);
            this.echarts5.debug.splice(0, outNumber);
            this.echarts5.error.splice(0, outNumber);
        }

        this.getEchartOpt();
    }

    /**
     * metrics图的merge数据
     */
    public getEchartOpt() {
        const titleTextStyle = {
            color: this.textColor,
            fontWeight: 'normal',
            fontSize: 20,
        };
        // echart1 更新参数
        const title1 = {
            text: this.i18n.plugins_perf_java_profiling_spring_boot.metrics.metricsTitle1,
            textStyle: titleTextStyle,
        };
        const xAxis1 = {
            data: this.ecahrtsTime,
        };
        const series1 = [
            {
                id: 'created',
                data: this.echarts1.created,
            },
            {
                id: 'expired',
                data: this.echarts1.expired,
            },
            {
                id: 'rejected',
                data: this.echarts1.rejected,
            },
        ];
        this.allMetricsOpt.echarts1 = {
            title: title1,
            xAxis: xAxis1,
            series: series1,
        };
        // echarts2 更新参数
        const title2 = {
            text: this.i18n.plugins_perf_java_profiling_spring_boot.metrics.metricsTitle2,
            textStyle: titleTextStyle,
        };
        const series2 = [
            {
                id: 'active.current',
                data: this.echarts2.current,
            },
            {
                id: 'active.max',
                data: this.echarts2.max,
            },
        ];
        this.allMetricsOpt.echarts2 = {
            title: title2,
            xAxis: xAxis1,
            series: series2,
        };
        // echarts3
        const title3 = {
            text: this.i18n.plugins_perf_java_profiling_spring_boot.metrics.metricsTitle3,
            textStyle: titleTextStyle,
        };
        const series3 = [
            {
                id: 'count',
                data: this.echarts3.count,
            },
        ];
        this.allMetricsOpt.echarts3 = {
            title: title3,
            xAxis: xAxis1,
            series: series3,
        };
        // echarts4
        const title4 = {
            text: this.i18n.plugins_perf_java_profiling_spring_boot.metrics.metricsTitle4,
            textStyle: titleTextStyle,
        };
        const series4 = [
            {
                id: 'total.capacity',
                data: this.echarts4.capacity,
            },
            {
                id: 'memory.used',
                data: this.echarts4.used,
            },
        ];
        this.allMetricsOpt.echarts4 = {
            title: title4,
            xAxis: xAxis1,
            series: series4,
        };
        // echarts5
        const title5 = {
            text: this.i18n.plugins_perf_java_profiling_spring_boot.metrics.metricsTitle5,
            textStyle: titleTextStyle,
        };
        const series5 = [
            {
                id: 'info',
                data: this.echarts5.info,
            },
            {
                id: 'warn',
                data: this.echarts5.warn,
            },
            {
                id: 'trace',
                data: this.echarts5.trace,
            },
            {
                id: 'debug',
                data: this.echarts5.debug,
            },
            {
                id: 'error',
                data: this.echarts5.error,
            },
        ];
        this.allMetricsOpt.echarts5 = {
            title: title5,
            xAxis: xAxis1,
            series: series5,
        };
    }
    /**
     * onSelect
     * @param item item
     * @param column column
     */
    public onSelect(item: any, column: TiTableColumns): void {
        const index: number = this.searchKeys.indexOf(column.key);
        this.searchWords[index] = item.label === 'ALL' ? '' : item.label;
    }

    /**
     * 获取http traces内容类型筛选参数
     */
    public getCtOptions() {
        const filterCt = [];
        const contentTypeOpt = new Set();
        this.allHttpTraces.forEach((item: any) => {
            contentTypeOpt.add(item.contentType_.replace('[]', ''));
        });
        contentTypeOpt.forEach((item) => {
            if (item !== '') {
                filterCt.push({ label: item });
            }
        });
        filterCt.unshift({ label: 'ALL' });
        this.column[5].options = filterCt;
    }

    /**
     * 获取http traces内容类型筛选参数-方法
     */
    public getMethodOpt() {
        const methodFilter = [];
        const methodOpt = new Set();
        this.allHttpTraces.forEach((item: any) => {
            methodOpt.add(item.method_);
        });
        methodOpt.forEach((item) => {
            if (item !== '') {
                methodFilter.push({ label: item });
            }
        });
        methodFilter.unshift({ label: 'ALL' });
        this.column[2].options = methodFilter;
    }

    /**
     * 显示时间过滤框
     */
    public timestampFilter() {
        this.filterShow = !this.filterShow;
        // 转成时间戳比大小//获取allHttptraces中最老的数据的时间与最新的时间
        this.endTime = this.allHttpTraces[0].timestamp_;
        this.startTime = this.allHttpTraces[this.allHttpTraces.length - 1].timestamp_;
        this.stimeValue = this.dateFormat(this.startTime).time;
        this.downloadService.downloadItems.springBoot.httpTraces.filterTime.start = this.stimeValue;
        this.etimeValue = this.dateFormat(this.endTime).time;
        this.downloadService.downloadItems.springBoot.httpTraces.filterTime.end = this.etimeValue;
    }
    /**
     * 时间过滤确认按钮
     */
    public fliterTime() {
        this.sureFilter = true;
        this.filterShow = !this.filterShow;
        this.filterTimeAndStatus();
    }
    /**
     * cancleFliterTime
     */
    public cancleFliterTime() {
        this.endTime = 0;
        this.startTime = 0;
        this.sureFilter = false;
        this.filterTimeAndStatus();
        this.filterShow = false;
    }
    /**
     * filterTimeAndStatus
     */
    public filterTimeAndStatus() {
        // 执行筛选的时间戳
        const start = `${this.todayTime} ${this.stimeValue}`;
        const end = `${this.todayTime} ${this.etimeValue}`;
        const startS = new Date(start).getTime();
        const endS = new Date(end).getTime() + 999;
        // 筛选状态
        const arr: any[] = [];
        this.checkedArray1.forEach((item) => {
            arr.push(item.key);
        });
        if (arr.length > 0) {
            const status = arr.toString().replace(/,/g, '|');
            const reg = new RegExp('^[' + status + ']');
            this.statusReg = reg;
        } else {
            this.statusReg = new RegExp('^[1-9]');
        }
        if (arr.length < 4 && arr.length > 0) {
            this.haveFilter = true;
        } else {
            this.haveFilter = false;
        }
        const statusFilter = this.allHttpTraces.filter((item: any) => {
            const timestamp = +item.timestamp_;
            if (this.sureFilter) {
                return this.statusReg.test(item.status_.toString()) && timestamp >= startS && timestamp <= endS;
            } else {
                return this.statusReg.test(item.status_.toString());
            }
        });
        this.srcData.data = statusFilter;
    }
    /**
     * 显示状态过滤框
     */
    public statusFilter() {
        this.statusShow = !this.statusShow;
    }
    /**
     * 点击确认状态过滤
     */
    public fliterStatus() {
        this.statusShow = !this.statusShow;
        this.filterTimeAndStatus();
    }

    /**
     * 刷新符合过滤路径的数据长度
     */
    public refreshPathFilterLength() {
        if (this.pathValue === '') {
            this.pathFilterLength = 0;
            return;
        }
        const httpTraces = this.allHttpTraces.filter((item: any) => {
            return item.uri_.indexOf(this.pathValue) > -1;
        });
        this.pathFilterLength = httpTraces.length;
    }

    /**
     * 开始过滤路径
     */
    public filterPath() {
        this.pathValue = this.pathInputValue;
        this.refreshPathFilterLength();
    }
    /**
     * 处理阈值输入框按键事件
     * 限制输入值为自然数
     */
    public onThresholdKeyUp() {
        let threshold = String(this.springbootGroup.controls.springboot_threshold.value);
        threshold = threshold.replace(/[^0-9]/g, '');
        this.springbootGroup.controls.springboot_threshold.setValue(Number(threshold));
    }

    /**
     * startSpringBoot
     */
    public startSpringBoot() {
        if (this.startBtnDisabled) {
            return;
        }
        if (this.beans.length === 0) {
            this.getBeansData();
        }
        this.stompService.startStompRequest('/cmd/start-actuator-health',
            { jvmId: this.jvmId, guardianId: this.guardianId });
        this.stompService.startStompRequest('/cmd/start-actuator-metrics',
            { jvmId: this.jvmId, guardianId: this.guardianId });
        this.stompService.startStompRequest('/cmd/start-actuator-httptrace', {
            jvmId: this.jvmId,
            guardianId: this.guardianId,
            threshold: this.springbootGroup.controls.springboot_threshold.value || 0,
        });
        this.isStart = true;
        this.showTabs = true;
        this.downloadService.dataSave.isSpringBootStart = true;
    }
    /**
     * stopSpringBoot
     */
    public stopSpringBoot() {
        this.vscodeService.get({ url: `/springboot/${this.guardianId}/jvm/${this.jvmId}/stopSpringbootActuator` },
            (res: any) => {
                if (res) {
                    this.isStart = false;
                    this.downloadService.dataSave.isSpringBootStart = false;
                }
            });
    }
    /**
     * 设置Http traces图数据
     *
     * @param httptrace httptrace
     * @param timestamp timestamp
     */
    public fliterHttptraces(httptrace: any, timestamp: string) {
        const updataTime = this.dateFormat(timestamp).time;
        // 存储updataTime时间的http traces最大耗时
        const maxTimeTaken = Math.max.apply(
            Math,
            httptrace.map((o: any) => o.timeTaken_)
        );
        this.maxTimeTakens.set(updataTime, maxTimeTaken < 0 ? 0 : maxTimeTaken);
        const success = httptrace.filter((item: any) => {
            return /^2/.test(item.status_.toString());
        });
        const filed4 = httptrace.filter((item: any) => {
            return /^4/.test(item.status_.toString());
        });
        const filed5 = httptrace.filter((item: any) => {
            return /^5/.test(item.status_.toString());
        });
        this.httpUptate.time.push(updataTime);
        this.httpUptate.line1.push(success.length);
        this.httpUptate.line2.push(filed4.length);
        this.httpUptate.line3.push(filed5.length);
        const outNumber = this.httpUptate.time.length - 12 * this.httpTracesTimelimit;
        if (outNumber > 0) {
            this.httpUptate.time.splice(0, outNumber);
            this.httpUptate.line1.splice(0, outNumber);
            this.httpUptate.line2.splice(0, outNumber);
            this.httpUptate.line3.splice(0, outNumber);
        }
        this.setHttpOptions();
    }
    /**
     * 更新http traces图
     */
    public setHttpOptions() {
        // 更新时间轴数据
        this.httpTracesTimeData = JSON.parse(JSON.stringify(this.httpUptate.time));
        const xAxis = {
            data: this.httpUptate.time,
        };
        const series = [
            {
                id: 'line1',
                data: this.httpUptate.line1,
            },
            {
                id: 'line2',
                data: this.httpUptate.line2,
            },
            {
                id: 'line3',
                data: this.httpUptate.line3,
            },
        ];

        this.httpUpdateOption = {
            xAxis,
            series,
        };
    }
    /**
     * selectBeans
     * @param item item
     * @param index index
     */
    public selectBeans(item: any, index: any) {
        if (item.dependencies[0] === '' && (item.resource === '' || item.resource === 'null')) {
            return;
        }
        this.beans[index].select = !this.beans[index].select;
        this.beans.forEach((itemLocal: any, idx: number) => {
            if (index !== idx) {
                itemLocal.select = false;
            }
        });
    }
    /**
     * activeChange
     * @param tab tab
     */
    public activeChange(tab: any) {
        this.tabActive = tab.id;
    }
    /**
     * 获取 Beans组件信息 数据
     */
    public getBeansData() {
        if (this.startBtnDisabled) {
            return;
        }
        this.vscodeService.get({ url: `/springboot/${this.guardianId}/jvm/${this.jvmId}/getSpringBootBeansInfo` },
            (res: any) => {
                res.springBootBeansList.forEach((item: any) => {
                    item.dependencies = item.dependencies.replace(/[\[\]]/g, '').split(',');
                });
                this.beans = res.springBootBeansList.map((item: any) => {
                    item.select = false;
                    return item;
                });
                this.downloadService.downloadItems.springBoot.beans = this.beans;
            });
    }
    /**
     * login
     */
    public login(): any {
        this.isLoginFailed = false;
        if (!this.checkGroup()) {
            return false;
        }
        const params = {
            userName: this.form.get('name').value,
            password: this.form.get('pwd').value,
        };
        const option = {
            url: `/springboot/${this.guardianId}/jvm/${this.jvmId}/springbootUserAuth`,
            params,
        };
        this.vscodeService.post(option, (resp: any) => {
            if (resp) {
                if ((self as any).webviewSession.getItem('tuningOperation') === 'hypertuner'){
                    if (resp.data === 'true' ) {
                        const spLogin = {
                            jvmId: this.jvmId,
                            login: resp,
                        };
                        (self as any).webviewSession.setItem('springBootToken', JSON.stringify(spLogin));
                        this.showLogin = 'false';
                        this.form.get('pwd').setValue('0000000000');
                        this.form.get('pwd').setValue('0000000000');
                        this.form.get('pwd').setValue('0000000000');
                    } else {
                        this.isLoginFailed = true;
                    }
                }else{
                    const spLogin = {
                        jvmId: this.jvmId,
                        login: resp,
                    };
                    (self as any).webviewSession.setItem('springBootToken', JSON.stringify(spLogin));
                    this.showLogin = 'false';
                    this.form.get('pwd').setValue('0000000000');
                    this.form.get('pwd').setValue('0000000000');
                    this.form.get('pwd').setValue('0000000000');
                }
            } else {
                this.isLoginFailed = true;
            }
        });
    }
    /**
     * 表单整体校验
     */
    public checkGroup() {
        const errors: ValidationErrors | null = TiValidators.check(this.form);
        // 整体校验后如果需要聚焦到第一个校验不通过元素，请参考以下代码
        if (errors) {
            // 注意：要保证fb.group时各个FormControl的顺序与对应表单元素dom放置顺序一致
            const firstError: any = Object.keys(errors)[0];
            this.elementRef.nativeElement.querySelector(`[formControlName=${firstError}]`).focus();
            return false;
        } else {
            return true;
        }
    }
    /**
     * getMeasurements
     * @param str str
     */
    public getMeasurements(str: any) {
        const measurements: any = {};
        str = str.replace(/[\[\]\s]/g, '');
        const arr = str.split('},');
        if (arr.length > 0) {
            arr.forEach((item: any) => {
                item = item.replace(/[\{\}\s]/g, '').split(',');
                const key = item[0].split('=')[1].toLowerCase();
                const value = +item[1].split('=')[1];
                measurements[key] = value.toFixed(1) || 0;
            });
            return measurements;
        } else {
            return {};
        }
    }

    /**
     * 更新指定类型的数据到导出数据对象
     */
    private updateDownloadItems(type: any) {
        switch (type) {
            case 'health': {
                this.downloadService.downloadItems.springBoot.health = this.health;
                break;
            }
            case 'metrics': {
                this.downloadService.downloadItems.springBoot.metrics.metrics = this.metrics;
                this.downloadService.downloadItems.springBoot.metrics.echarts1 = this.echarts1;
                this.downloadService.downloadItems.springBoot.metrics.echarts2 = this.echarts2;
                this.downloadService.downloadItems.springBoot.metrics.echarts3 = this.echarts3;
                this.downloadService.downloadItems.springBoot.metrics.echarts4 = this.echarts4;
                this.downloadService.downloadItems.springBoot.metrics.echarts5 = this.echarts5;
                this.downloadService.downloadItems.springBoot.metrics.echartsTime = this.ecahrtsTime;
                this.downloadService.downloadItems.springBoot.metrics.options = this.allMetricsOpt;
                break;
            }
            case 'httptrace': {
                this.downloadService.downloadItems.springBoot.httpTraces.allHttpTraces = this.allHttpTraces;
                this.downloadService.downloadItems.springBoot.httpTraces.httpOptions = this.httpUptate;
                break;
            }
            default: break;
        }
    }

    /**
     * ngOnDestroy
     */
    ngOnDestroy(): void {
        if (this.isDownload) {
            return;
        }
        // 销毁echarts实例引用
        this.metricsEchartsInstances.forEach((echartsInstance: any) => {
            echartsInstance.dispose();
            echartsInstance = null;
        });
        clearInterval(this.pollingGetProjectInfo);
        this.pollingGetProjectInfo = null;
        this.downloadService.dataSave.sprThreshold = this.springbootGroup;
    }

    /**
     * bytesToSize
     * @param bytes bytes
     */
    public bytesToSize(bytes: any) {
        if (bytes === 0) {
            return '0 B';
        }
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
    }

    /**
     * 获取echarts图的时间轴 时间格式
     * @param time time
     */
    public dateFormat(time: any) {
        const timeObj = {
            data: this.httpDateFormat(time, 'yyyy-MM-dd hh:mm:ss').split(' ')[0],
            time: this.httpDateFormat(time, 'yyyy-MM-dd hh:mm:ss').split(' ')[1],
        };
        return timeObj;
    }
    /**
     * httpDateFormat
     * @param date date
     * @param fmt fmt
     */
    public httpDateFormat(date: any, fmt: any) {
        const getDate = new Date(parseInt(date, 10));
        const o = {
            'M+': getDate.getMonth() + 1,
            'd+': getDate.getDate(),
            'h+': getDate.getHours(),
            'm+': getDate.getMinutes(),
            's+': getDate.getSeconds(),
            'q+': Math.floor((getDate.getMonth() + 3) / 3),
            S: this.checkTime(getDate.getMilliseconds()),
        };
        if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (getDate.getFullYear() + '').substr(4 - RegExp.$1.length));
        }
        for (const k in o) {
            if (new RegExp('(' + k + ')').test(fmt)) {
                fmt = fmt.replace(RegExp.$1, RegExp.$1.length === 1
                    ? (o as any)[k]
                    : ('00' + (o as any)[k]).substr(('' + (o as any)[k]).length));
            }
        }
        return fmt;
    }
    /**
     * checkTime
     * @param i i
     */
    public checkTime(i: any) {
        if (i < 100 && i > 9) {
            i = '0' + i;
        }
        if (i < 10) {
            i = '00' + i;
        }
        return i;
    }

    /**
     * metrics时间轴筛选事件
     * @param event 时间轴开始和结束百分比数值
     */
    public metricsTimeLineData(event: any) {
        this.metricsEchartsInstances.forEach((echartsInstance: any) => {
            echartsInstance.setOption({
                dataZoom: [
                    {
                        start: event.start,
                        end: event.end,
                    },
                ],
            });
        });
    }

    /**
     * http traces时间轴筛选事件
     * @param event 时间轴开始和结束百分比数值
     */
    public httpTracesTimeLineData(event: any) {
        this.httpUpdateOption = {
            dataZoom: [
                {
                    type: 'inside',
                    realtime: true,
                    start: event.start,
                    end: event.end,
                },
            ],
        };
    }

    /**
     * 在点击容器其他地方时，关闭http traces的弹窗
     *
     * @param event 事件实例
     */
    public closeHttpTracesPop(event: any) {
        const dom: HTMLElement = event.target;
        const domClass: string = event.target.className;
        if (domClass.includes('ti3-head-filter-icon')) {
            return;
        }
        if (this.filterShow && !domClass.includes('select-time') && !dom.closest('.select-time')) {
            this.filterShow = false;
        }
        if (this.statusShow && !domClass.includes('status-filter') && !dom.closest('.status-filter')) {
            this.statusShow = false;
        }
    }

    /**
     * 改变密文
     */
    changeType() {
        this.textType = 'password';
    }

    /**
     *  改变明文
     */
    changeType1() {
        this.textType = 'text';
    }
}
