import {
    Component,
    OnInit,
    Input,
    ViewChild,
    Renderer2,
    ElementRef,
    ChangeDetectorRef,
    AfterViewInit,
    NgZone,
} from '@angular/core';
import { TiPageSizeConfig, TiPaginationEvent } from '@cloud/tiny3';
import { I18nService } from '../../service/i18n.service';
import { MytipService } from '../../service/mytip.service';
import { Util } from '@cloud/tiny3';
import { VscodeService, COLOR_THEME, currentTheme } from '../../service/vscode.service';
import { LeftShowService } from '../../service/left-show.service';
import { SortStatus, InterfaceService } from '../../service/interface.service';
import { DomSanitizer } from '@angular/platform-browser';
import { ViewDetailsService } from '../../service/view-details.service';
import { Utils } from 'projects/sys/src-ide/app/service/utils.service';
import { graphic } from 'echarts';

@Component({
    selector: 'app-res-cpu-sche',
    templateUrl: './res-cpu-sche.component.html',
    styleUrls: ['./res-cpu-sche.component.scss'],
})
export class ResCpuScheComponent implements OnInit, AfterViewInit {
    @ViewChild('chartBox', { static: false }) chartBox;
    @ViewChild('timeLineDetail', { static: false }) timeLineDetail;
    @ViewChild('container', { static: true }) private containerRef: ElementRef;
    @ViewChild('tagBox', { static: false }) public tagBox: any;
    // -- 筛选弹框 --
    @ViewChild('selectTaskModal', { static: false }) public selectTaskModal: any;

    @Input()
    get item(): any { return this.tpItem; }
    set item(item) {
        this.tpItem = item;
        if (item) {
            this.summaryTid = item.tid;
            if (!this.ifInit) {
                this.locatePtid();
            }
        }

    }
    public ifInit = true;
    public tpItem: any;
    public summaryTid: any;

    @Input() projectName: any;
    @Input() taskName: any;
    @Input() analysisType: any;
    @Input() taskid: any;
    @Input() nodeid: any;
    @Input() configuration: any;
    @Input() isActive: any;

    public i18n: any;
    public startTime: any;
    public endtTime: any;
    public filterSrc = './assets/img/filterNormal.svg';
    public colorList = {
        Idle: {
            normal: '#616161',
            emphasis: '#868686',
        },
        Running: {
            normal: '#2DA46F',
            emphasis: '#5DD49F',
        },
        selectedThread: {
            // 选中的线程
            normal: '#0067FF',
            emphasis: '#6CA3FF',
        },
        lockedThread: {
            // 锁定的线程
            normal: '#de9e09',
            emphasis: '#fbc64c',
        },
    };

    // chart related
    public chartInstance;
    public options;
    public updateOptions;
    public timeLineShow = false;
    public orderlist = [];

    // 类型选择
    public currentType;
    public typeList = [];

    // 选择 CPU
    public filterCPU = {
        title: '',
        allCpuOption: [],

        showCpuCategory: false,
        selectedCpuCategory: undefined,
        cpuCategoryList: [],

        cpuSelected: [],
        cpuOption: [],
    };

    // 运行时长排序
    public sortDurationSummary = {
        title: '',
        selected: undefined,
        list: [],
        sortStatus: 'desc' as SortStatus,
    };

    // 选择进程/线程
    public locatePTidData = {
        title: '',
        selected: [],
        list: [],
        tidSelected: [],
        pidSelected: [],
        tidList: [],
        pidList: [],
        // selected可能有多个，可以通过点击选中的色块，将改的色块的线程锁定，锁定线程的色块统一换一种颜色显示，方便查看
        lockedThread: undefined as number,
        // 进程/线程字典
        pid_ppid_rels: [],
    };

    // 分页【针对CPU进行分页】
    public currentPage = 1;
    public totalNumber = 0;
    public pageSize: TiPageSizeConfig = {
        options: [5, 10, 20],
        size: 10,
    };

    // 时间轴原始数据
    public timeData: any = {};
    public timeLine = { start: 0, end: 100 };

    // 图标是否被选中
    public isSelected = {
        time: true,
        percentage: false,
        position: false,
    };

    // 图标状态控制
    public iconStatus = {
        time: {
            normal: {
                checkUrl: './assets/img/resource/timeCheckNormal.svg',
                uncheckUrl: './assets/img/resource/timeUncheckNormal.svg',
            },
            hover: {
                checkUrl: './assets/img/resource/timeCheckHover.svg',
                uncheckUrl: './assets/img/resource/timeUncheckHover.svg',
            },
            press: {
                checkUrl: './assets/img/resource/timeCheckPress.svg',
                uncheckUrl: './assets/img/resource/timeUncheckPress.svg',
            },
        },
        percentage: {
            normal: {
                checkUrl: './assets/img/resource/percentageCheckNormal.svg',
                uncheckUrl: './assets/img/resource/percentageUncheckNormal.svg',
            },
            hover: {
                checkUrl: './assets/img/resource/percentageCheckHover.svg',
                uncheckUrl: './assets/img/resource/percentageUncheckHover.svg',
            },
            press: {
                checkUrl: './assets/img/resource/percentageCheckPress.svg',
                uncheckUrl: './assets/img/resource/percentageUncheckPress.svg',
            },
        },
        position: {
            normal: {
                checkUrl: './assets/img/resource/positionCheckNormal.svg',
                uncheckUrl: './assets/img/resource/positionUncheckNormal.svg',
            },
            hover: {
                checkUrl: './assets/img/resource/positionCheckHover.svg',
                uncheckUrl: './assets/img/resource/positionUncheckHover.svg',
            },
            press: {
                checkUrl: './assets/img/resource/positionCheckPress.svg',
                uncheckUrl: './assets/img/resource/positionUncheckPress.svg',
            },
        },
    };

    // 鼠标松开时的图标状态控制
    public loosenIcon = {
        time: [
            {
                id: '#time',
                url: './assets/img/resource/timeCheckHover.svg',
            },
            {
                id: '#percentage',
                url: './assets/img/resource/percentageUncheckNormal.svg',
            },
            {
                id: '#position',
                url: './assets/img/resource/positionUncheckNormal.svg',
            },
        ],
        percentage: [
            {
                id: '#percentage',
                url: './assets/img/resource/percentageCheckHover.svg',
            },
            {
                id: '#time',
                url: './assets/img/resource/timeUncheckNormal.svg',
            },
            {
                id: '#position',
                url: './assets/img/resource/positionUncheckNormal.svg',
            },
        ],
        position: [
            {
                id: '#position',
                url: './assets/img/resource/positionCheckHover.svg',
            },
            {
                id: '#time',
                url: './assets/img/resource/timeUncheckNormal.svg',
            },
            {
                id: '#percentage',
                url: './assets/img/resource/percentageUncheckNormal.svg',
            },
        ],
    };

    public showLoading = true;
    public isFirst = true;
    public noData = false;
    // 获取主题颜色
    public ColorTheme = {
        Dark: COLOR_THEME.Dark,
        Light: COLOR_THEME.Light
    };
    public currTheme = COLOR_THEME.Dark;
    public isLightTheme = false;
    private updateEcharts = false;

    constructor(
        public sanitizer: DomSanitizer,
        private renderer2: Renderer2,
        public vscodeService: VscodeService,
        public i18nService: I18nService,
        public mytip: MytipService,
        public leftShowService: LeftShowService,
        private requestService: InterfaceService,
        private viewDetails: ViewDetailsService,
        private cdr: ChangeDetectorRef,
        private zone: NgZone
    ) {
        this.i18n = this.i18nService.I18n();

        this.typeList = [
            { prop: 'cpuStatus' },
            { prop: 'durationSummary' },
            { prop: 'locatePTid' },
        ];
        this.currentType = this.typeList[0].prop;

        this.filterCPU.title = this.i18n.sys_res.selectCPU;

        this.sortDurationSummary.title = this.i18n.sys_res.sort;
        this.sortDurationSummary.list = [
            { label: 'Running', prop: 'Running' },
            { label: 'Idle', prop: 'Idle' },
        ];
        this.sortDurationSummary.selected = this.sortDurationSummary.list[0];

        this.locatePTidData.title = this.i18n.sys_res.selectTIDAndPid;
    }

    /**
     * 组件初始化
     */
    ngOnInit() {
        this.colorThemeFit();
        this.renderer2.listen(this.containerRef.nativeElement, 'scroll', () => {
            Util.trigger(document, 'tiScroll');
        });

        this.options = {
            grid: {
                top: 36,
                right: 30,
                left: 30,
                containLabel: true,
            },
            legend: {
                right: 10,
                icon: 'rect',
                itemWidth: 8,
                itemHeight: 8,
                inactiveColor: this.isLightTheme ? '' : '#616161',
                formatter: (name) => {
                    if (name === 'selectedThread') {
                        return this.i18n.sys_res.selectPidTid;
                    } else if (name === 'lockedThread') {
                        return this.i18n.sys_res.lockPidTid;
                    } else {
                        return name;
                    }
                },
            },
            tooltip: {
                borderColor: 'rgba(50,50,50,0)',
                backgroundColor: this.isLightTheme ? '#fff' : '#313131',
                borderWidth: 1,
                borderRadius: 4,
                enterable: true,
                confine: true,
                padding: [10, 20],
                extraCssText: 'box-shadow: 0 3px 6px -4px rgba(0,0,0,0.48);',
                textStyle: {
                    color: this.isLightTheme ? '#616161' : '#e8e8e8',
                    fontSize: 12,
                    lineHeight: 26,
                },
            },
            xAxis: {
                scale: true,
                axisLabel: {
                    showMinLabel: false,
                    showMaxLabel: false,
                    color: this.isLightTheme ? '#616161' : '#aaa',
                },
                axisTick: {
                    show: false,
                },
                axisLine: {
                    show: false,
                },
                splitLine: {
                    lineStyle: {
                        color: this.isLightTheme ? '#ebeef4' : '#545454',
                    },
                },
            },
            yAxis: {
                inverse: true,
                data: [],
                axisLine: {
                    show: false,
                },
                axisTick: {
                    show: false,
                },
                axisLabel: {
                    show: false,
                },
            },
            series: [],
        };

        // 页面监听
        this.leftShowService.leftIfShow.subscribe(() => {
            if (this.updateEcharts) {
                this.updateEcharts = false;
                this.getData({});
            } else {
                setTimeout(() => {
                    this.chartInstance.resize();
                }, 500);
            }
        });
        if (this.tpItem) {
            this.currentType = this.typeList[2].prop;
            this.isSelected = {
                time: false,
                percentage: false,
                position: true,
            };
            setTimeout(() => {
                this.changeIcon('#position', this.iconStatus.position.press);
                this.changeMouseup(this.loosenIcon.position);
            }, 100);
        } else {
            this.currentType = this.typeList[0].prop;
        }
        this.updateWebViewPage();
    }

    /**
     * 视图初始化完成之后
     */
    ngAfterViewInit(): void {
        if (this.isLightTheme) {
            $('#time').attr('src', './assets/img/light-resource/timeCheckNormal.svg');
            $('#percentage').attr('src', './assets/img/light-resource/percentageUncheckNormal.svg');
            $('#position').attr('src', './assets/img/light-resource/positionUncheckNormal.svg');
        }
    }

    /**
     * vscode颜色主题适配
     */
    public colorThemeFit() {
        this.currTheme = currentTheme();
        this.handleThemeChange();
        this.vscodeService.regVscodeMsgHandler('colorTheme', (msg: any) => {
            this.currTheme = msg.colorTheme;
            this.handleThemeChange();
            if (!this.isSelected.time) {
                this.changeIcon('#time', this.iconStatus.time.normal);
            }
            if (!this.isSelected.percentage) {
                this.changeIcon('#percentage', this.iconStatus.percentage.normal);
            }
            if (!this.isSelected.position) {
                this.changeIcon('#position', this.iconStatus.position.normal);
            }
            if (this.chartInstance) {
                this.options.legend.inactiveColor = this.isLightTheme ? '' : '#616161';
                this.options.tooltip.backgroundColor = this.isLightTheme ? '#fff' : '#313131';
                this.options.tooltip.textStyle.color = this.isLightTheme ? '#616161' : '#e8e8e8';
                this.options.xAxis.axisLabel.color = this.isLightTheme ? '#616161' : '#aaa';
                this.options.xAxis.splitLine.lineStyle.color = this.isLightTheme ? '#ebeef4' : '#545454';
                this.chartInstance.clear();
                this.chartInstance.setOption(this.options, true);
                if (this.isActive) {
                    this.getData({});
                } else {
                    this.updateEcharts = true;
                }
            }
        });
    }
    private handleThemeChange() {
        if (this.currTheme === this.ColorTheme.Light) {
            this.isLightTheme = true;
            this.colorList = {
                Idle: {
                    normal: '#e1e6ee',
                    emphasis: '#c6d2e6',
                },
                Running: {
                    normal: '#41ba41',
                    emphasis: '#8cd600',
                },
                selectedThread: {
                    // 选中的线程
                    normal: '#267dff',
                    emphasis: '#69c0ff',
                },
                lockedThread: {
                    // 锁定的线程
                    normal: '#e88b00',
                    emphasis: '#e88b00',
                },
            };

            // 图标状态控制
            this.iconStatus = {
                time: {
                    normal: {
                        checkUrl: './assets/img/light-resource/timeCheckNormal.svg',
                        uncheckUrl: './assets/img/light-resource/timeUncheckNormal.svg',
                    },
                    hover: {
                        checkUrl: './assets/img/light-resource/timeCheckHover.svg',
                        uncheckUrl: './assets/img/light-resource/timeUncheckHover.svg',
                    },
                    press: {
                        checkUrl: './assets/img/light-resource/timeCheckHover.svg',
                        uncheckUrl: './assets/img/light-resource/timeUncheckHover.svg',
                    },
                },
                percentage: {
                    normal: {
                        checkUrl: './assets/img/light-resource/percentageCheckNormal.svg',
                        uncheckUrl: './assets/img/light-resource/percentageUncheckNormal.svg',
                    },
                    hover: {
                        checkUrl: './assets/img/light-resource/percentageCheckHover.svg',
                        uncheckUrl: './assets/img/light-resource/percentageUncheckHover.svg',
                    },
                    press: {
                        checkUrl: './assets/img/light-resource/percentageCheckHover.svg',
                        uncheckUrl: './assets/img/light-resource/percentageUncheckHover.svg',
                    },
                },
                position: {
                    normal: {
                        checkUrl: './assets/img/light-resource/positionCheckNormal.svg',
                        uncheckUrl: './assets/img/light-resource/positionUncheckNormal.svg',
                    },
                    hover: {
                        checkUrl: './assets/img/light-resource/positionCheckHover.svg',
                        uncheckUrl: './assets/img/light-resource/positionUncheckHover.svg',
                    },
                    press: {
                        checkUrl: './assets/img/light-resource/positionCheckHover.svg',
                        uncheckUrl: './assets/img/light-resource/positionUncheckHover.svg',
                    },
                },
            };

            // 鼠标松开时的图标状态控制
            this.loosenIcon = {
                time: [
                    {
                        id: '#time',
                        url: './assets/img/light-resource/timeCheckHover.svg',
                    },
                    {
                        id: '#percentage',
                        url: './assets/img/light-resource/percentageUncheckNormal.svg',
                    },
                    {
                        id: '#position',
                        url: './assets/img/light-resource/positionUncheckNormal.svg',
                    },
                ],
                percentage: [
                    {
                        id: '#percentage',
                        url: './assets/img/light-resource/percentageCheckHover.svg',
                    },
                    {
                        id: '#time',
                        url: './assets/img/light-resource/timeUncheckNormal.svg',
                    },
                    {
                        id: '#position',
                        url: './assets/img/light-resource/positionUncheckNormal.svg',
                    },
                ],
                position: [
                    {
                        id: '#position',
                        url: './assets/img/light-resource/positionCheckHover.svg',
                    },
                    {
                        id: '#time',
                        url: './assets/img/light-resource/timeUncheckNormal.svg',
                    },
                    {
                        id: '#percentage',
                        url: './assets/img/light-resource/percentageUncheckNormal.svg',
                    },
                ],
            };
        } else {
            this.isLightTheme = false;
            this.colorList = {
                Idle: {
                    normal: '#616161',
                    emphasis: '#868686',
                },
                Running: {
                    normal: '#2DA46F',
                    emphasis: '#5DD49F',
                },
                selectedThread: {
                    // 选中的线程
                    normal: '#0067FF',
                    emphasis: '#6CA3FF',
                },
                lockedThread: {
                    // 锁定的线程
                    normal: '#de9e09',
                    emphasis: '#fbc64c',
                },
            };
            this.iconStatus = {
                time: {
                    normal: {
                        checkUrl: './assets/img/resource/timeCheckNormal.svg',
                        uncheckUrl: './assets/img/resource/timeUncheckNormal.svg',
                    },
                    hover: {
                        checkUrl: './assets/img/resource/timeCheckHover.svg',
                        uncheckUrl: './assets/img/resource/timeUncheckHover.svg',
                    },
                    press: {
                        checkUrl: './assets/img/resource/timeCheckPress.svg',
                        uncheckUrl: './assets/img/resource/timeUncheckPress.svg',
                    },
                },
                percentage: {
                    normal: {
                        checkUrl: './assets/img/resource/percentageCheckNormal.svg',
                        uncheckUrl: './assets/img/resource/percentageUncheckNormal.svg',
                    },
                    hover: {
                        checkUrl: './assets/img/resource/percentageCheckHover.svg',
                        uncheckUrl: './assets/img/resource/percentageUncheckHover.svg',
                    },
                    press: {
                        checkUrl: './assets/img/resource/percentageCheckPress.svg',
                        uncheckUrl: './assets/img/resource/percentageUncheckPress.svg',
                    },
                },
                position: {
                    normal: {
                        checkUrl: './assets/img/resource/positionCheckNormal.svg',
                        uncheckUrl: './assets/img/resource/positionUncheckNormal.svg',
                    },
                    hover: {
                        checkUrl: './assets/img/resource/positionCheckHover.svg',
                        uncheckUrl: './assets/img/resource/positionUncheckHover.svg',
                    },
                    press: {
                        checkUrl: './assets/img/resource/positionCheckPress.svg',
                        uncheckUrl: './assets/img/resource/positionUncheckPress.svg',
                    },
                },
            };
            // 鼠标松开时的图标状态控制
            this.loosenIcon = {
                time: [
                    {
                        id: '#time',
                        url: './assets/img/resource/timeCheckHover.svg',
                    },
                    {
                        id: '#percentage',
                        url: './assets/img/resource/percentageUncheckNormal.svg',
                    },
                    {
                        id: '#position',
                        url: './assets/img/resource/positionUncheckNormal.svg',
                    },
                ],
                percentage: [
                    {
                        id: '#percentage',
                        url: './assets/img/resource/percentageCheckHover.svg',
                    },
                    {
                        id: '#time',
                        url: './assets/img/resource/timeUncheckNormal.svg',
                    },
                    {
                        id: '#position',
                        url: './assets/img/resource/positionUncheckNormal.svg',
                    },
                ],
                position: [
                    {
                        id: '#position',
                        url: './assets/img/resource/positionCheckHover.svg',
                    },
                    {
                        id: '#time',
                        url: './assets/img/resource/timeUncheckNormal.svg',
                    },
                    {
                        id: '#percentage',
                        url: './assets/img/resource/percentageUncheckNormal.svg',
                    },
                ],
            };
        }
    }

    /**
     * 初始化
     */
    public init() {
        this.initTime();
    }

    /**
     * 获取时间范围
     */
    public initTime() {
        this.requestService
            .getTotalTimeRange(this.taskid, this.nodeid, 'cpu')
            .subscribe((res: any) => {
                this.startTime = res.data.start_time;
                this.endtTime = res.data.end_time;
                this.initFilterList();
            });
    }

    /**
     * 初始化筛选框的数据
     */
    private initFilterList() {
        this.requestService
            .getList(this.taskid, this.nodeid, [
                'cpu_list',
                'used_cpus',
                'app_cpus',
                'pid_ppid_rels',
                'app_ppids',
            ])
            .subscribe((res: any) => {
                this.filterCPU.allCpuOption = res.data.cpu_list.map(
                    (cpuNum) => {
                        const item: any = {
                            label: `CPU ${cpuNum}`,
                            prop: cpuNum,
                        };

                        let isUncollected: boolean;
                        if (
                            [
                                'Launch Application',
                                'Attach to Process',
                            ].includes(
                                this.configuration.task_param['analysis-target']
                            )
                        ) {
                            isUncollected = !(
                                res.data.used_cpus.includes(cpuNum) &&
                                res.data.app_cpus.includes(cpuNum)
                            );
                        } else {
                            isUncollected = !res.data.used_cpus.includes(
                                cpuNum
                            );
                        }
                        // 没有数据的CPU禁用掉，提示未采集到数据
                        if (isUncollected) {
                            item.disabled = true;
                            item.disabledReason = this.i18n.sys_res.noDataIsCollected;
                        }
                        this.filterCPU.cpuSelected.push(item);

                        return item;
                    }
                );
                this.filterCPU.cpuOption = this.filterCPU.allCpuOption;
                this.locatePTidData.selected = [];
                const pid_ppid_rels = res.data.pid_ppid_rels;
                if (pid_ppid_rels) {
                    Object.keys(pid_ppid_rels).forEach(
                        (ppid) => {

                            const item = {
                                label: Utils.transformLabel(ppid),
                                prop: +ppid.split('/')[0],
                                children: pid_ppid_rels[ppid].map((pid: any) => {
                                    const childItem = {
                                        label: Utils.transformLabel(pid),
                                        prop: +pid.split('/')[0],
                                    };
                                    // 从summary页面跳转来的, 页面初始化走这里
                                    if (this.tpItem) {
                                        if (this.tpItem.tid === childItem.prop) {
                                            this.locatePTidData.selected.push(childItem);

                                        }
                                    } else {
                                        if (this.viewDetails.topList10.indexOf(childItem.prop) > -1) {
                                            this.locatePTidData.selected.push(childItem);
                                        }
                                    }
                                    return childItem;
                                }),
                            };
                            this.locatePTidData.list.push(item);
                        }
                    );
                }
                const selectList = this.filterCPU.cpuSelected.filter(
                    (item) => !item.disabledReason
                );
                if (selectList.length === 0) {
                    this.noData = true;
                }
                this.getData({});
            });
        this.updateWebViewPage();
    }

    /**
     * 获取图表数据
     */
    public getData({
        startTime = this.startTime,
        endTime = this.endtTime,
    }: {
        // 数据窗口范围的起始数值
        startTime?: number;
        // 数据窗口范围的结束数值
        endTime?: number;
    }) {
        this.showLoading = true;
        this.tpItem = null;
        this.ifInit = false;
        let params: any = {
            currentType: this.currentType,
            taskId: this.taskid,
            nodeId: this.nodeid,
            pageNo: this.currentPage,
            pageSize: this.pageSize.size,
            startTime,
            endTime,
        };
        if (this.currentType === 'cpuStatus') {
            params = {
                ...params,
                cpuList: this.filterCPU.cpuSelected.length
                    ? this.filterCPU.cpuSelected
                        .map((cpuItem) => cpuItem.prop)
                        .join(',')
                    : '',
            };
        } else if (this.currentType === 'durationSummary') {
            params = {
                ...params,
                sortBy: this.sortDurationSummary.selected.prop,
                sortStatus: this.sortDurationSummary.sortStatus,
                cpuList: this.filterCPU.cpuSelected.length
                    ? this.filterCPU.cpuSelected
                        .map((cpuItem) => cpuItem.prop)
                        .join(',')
                    : '',
            };
        } else if (this.currentType === 'locatePTid') {
            params = {
                ...params,
                pidList: this.locatePTidData.selected.length
                    ? this.locatePTidData.selected
                        .map((pidItem) => pidItem.prop)
                        .join(',')
                    : '',
            };
        }
        this.requestService.getCpuScheduleData(params).subscribe((res: any) => {
            if (res.code.includes('Success')) {
                this.totalNumber = res.data.total_count;
                this.updateChartData(res.data);
                this.noData = false;
            } else {
                this.totalNumber = 0;
                this.noData = true;
            }

            this.showLoading = false;
            this.isFirst = false;
            this.updateWebViewPage();
        });
        this.updateWebViewPage();
    }

    /**
     * chart init
     */
    public onChartInit(chartInstance) {
        this.chartInstance = chartInstance;
        this.chartInstance.on('datazoom', (params) => {
            // 放大缩小时同步修改时间轴
            if (params.batch) {
                this.setTimeLine(params.batch[0].start, params.batch[0].end);
            }
        });

        this.chartInstance.on('mousemove', (params) => {
            // 只有筛选ptid选中的Running色块才会变成手型
            if ([this.i18n.sys_res.selectPidTid].includes(params.seriesName)) {
                this.chartInstance.getZr().setCursorStyle('pointer');
            } else {
                this.chartInstance.getZr().setCursorStyle('default');
            }
        });

        this.chartInstance.on('click', (params) => {
            if (
                [
                    this.i18n.sys_res.selectPidTid,
                    this.i18n.sys_res.lockPidTid,
                ].includes(params.seriesName)
            ) {
                this.showLoading = true;
                this.cdr.detectChanges();
                this.clickChart(params);
            }
        });

        if (this.configuration) {
            this.init();
        }
    }

    /**
     * 1、selectedThread 状态下点击
     *   1.1、已有锁定的线程，切换锁定线程为该线程
     *   1.2、没有锁定的线程，设置该线程为锁定线程
     * 2、lockedThread 状态下点击
     *   2.1、取消锁定改线程
     */
    private clickChart(params) {
        setTimeout(() => {
            this.locatePTidData.lockedThread =
                this.locatePTidData.lockedThread === params.value[4]
                    ? undefined
                    : params.value[4];

            const series = this.chartInstance.getOption().series;
            const lockedThreadSeries = series.find(
                (item) => item.name === this.i18n.sys_res.lockPidTid
            );
            const selectedThreadSeries = series.find(
                (item) => item.name === this.i18n.sys_res.selectPidTid
            );
            const newLockedThreadDatas = [];

            if (this.locatePTidData.lockedThread !== undefined) {
                for (
                    let index = 0;
                    index < selectedThreadSeries.data.length;
                    index++
                ) {
                    if (
                        selectedThreadSeries.data[index].value[4] ===
                        params.value[4]
                    ) {
                        newLockedThreadDatas.push(
                            selectedThreadSeries.data.splice(index--, 1)[0]
                        );
                    }
                }
            }
            selectedThreadSeries.data.push(...lockedThreadSeries.data);
            lockedThreadSeries.data = newLockedThreadDatas;

            this.updateOptions = {
                series,
            };
            this.showLoading = false;
            this.cdr.detectChanges();
        });
    }

    private renderItem(params, api) {
        const categoryIndex = api.value(2);
        const start = api.coord([api.value(0), categoryIndex]);
        const end = api.coord([api.value(1), categoryIndex]);
        const height = 20;
        const width = end[0] - start[0];

        if (width > 0.1) {
            const rectShape = graphic.clipRectByRect(
                {
                    x: start[0],
                    y: start[1] - height / 2,
                    width: end[0] - start[0],
                    height,
                },
                {
                    x: params.coordSys.x,
                    y: params.coordSys.y,
                    width: params.coordSys.width,
                    height: params.coordSys.height,
                }
            );

            return (
                rectShape && {
                    type: 'rect',
                    shape: rectShape,
                    style: api.style(),
                    styleEmphasis: api.styleEmphasis(),
                }
            );
        }
    }

    /**
     * 更新 chart 数据
     * @param resData 返回数据
     */
    public updateChartData(resData) {
        /**
         * 1、所有的数据段都是ms单位，说有的数据点都是us单位（数据比较准确）
         * 2、汇总信息为毫秒为单位，取第一条 detail 的 start_time 为起始值，最后一条 detail 的 end_time 为终止值
         *  2.1、detail[0].start_time + (runtime + idletime) * 1000 = detail.slice(-1)[0].end_time
         * 3、全部转换成微秒去画图，显示使用毫秒
         */
        this.totalNumber = resData.total_count;
        this.orderlist = resData.orderlist.map((cpuNum) =>
            this.filterCPU.cpuOption.find((option) => option.prop === cpuNum)
        );
        const height = resData.orderlist.length
            ? 56 * resData.orderlist.length + 20
            : 400;
        this.chartBox.nativeElement.style.height = `${height + 40}px`;
        setTimeout(() => this.chartInstance.resize(), 10);
        let min = Infinity;
        let max = -Infinity;

        if (this.currentType === 'cpuStatus') {
            // CPU 状态
            const runningDatas = [];
            let idleDatas = [];

            resData.orderlist.forEach((cpuNum, index) => {
                resData.cpu_info[cpuNum].detail.forEach((detail) => {
                    const startTime = detail.start_time;
                    const switchTime = startTime + detail.runtime * 1000;
                    const endTIme = detail.end_time;
                    min = Math.min(min, startTime);
                    max = Math.max(max, endTIme);
                    const tipInfo = [
                        Utils.transformLabel(detail.taskname),
                        Utils.transformLabel(detail.pid),
                        Utils.transformLabel(detail.ppid),
                        detail.idle_time,
                        detail.runtime,
                        detail.callstack,
                    ];

                    runningDatas.push({
                        value: [startTime, switchTime, index, ...tipInfo],
                    });

                    idleDatas.push({
                        value: [switchTime, endTIme, index, ...tipInfo],
                    });
                });
            });

            idleDatas = this.idleDataSupplement(resData, min, max, idleDatas);

            this.updateOptions = this.updateDatas(
                height,
                min,
                max,
                resData,
                runningDatas,
                idleDatas
            );
        } else if (this.currentType === 'durationSummary') {
            // CPU 时长
            const runningDatas = [];
            const idleDatas = [];

            resData.orderlist.forEach((cpuNum, index) => {
                const info = resData.cpu_info[cpuNum];

                if (info.detail.length) {
                    const runtimePercentage = info['runtime%'] * 100;
                    const idletimePercentage = info['idletime%'] * 100;
                    const tipInfo = [
                        info.runtime,
                        runtimePercentage,
                        info.idletime,
                        idletimePercentage,
                    ];

                    runningDatas.push({
                        value: [0, runtimePercentage, index, ...tipInfo],
                    });

                    idleDatas.push({
                        value: [runtimePercentage, 100, index, ...tipInfo],
                    });
                }
            });

            this.updateOptions = this.updateDatas(
                height,
                0,
                100,
                resData,
                runningDatas,
                idleDatas
            );
        } else if (this.currentType === 'locatePTid') {
            // 筛选pid tid
            const selectDatas = [];
            const lockDatas = [];
            const runningDatas = [];
            let idleDatas = [];

            resData.orderlist.forEach((cpuNum, index) => {
                resData.cpu_info[cpuNum].detail.forEach((detail) => {
                    const startTime = detail.start_time;
                    const switchTime = startTime + detail.runtime * 1000;
                    const endTIme = detail.end_time;
                    min = Math.min(min, startTime);
                    max = Math.max(max, endTIme);
                    const tipInfo = [
                        Utils.transformLabel(detail.taskname),
                        Utils.transformLabel(detail.pid),
                        Utils.transformLabel(detail.ppid),
                        detail.idle_time,
                        detail.runtime,
                        detail.callstack,
                    ];

                    if (detail.highlight) {
                        // 选择进程/线程选中
                        if (detail.pid === this.locatePTidData.lockedThread) {
                            // 锁定的线程统一换一种颜色标记
                            lockDatas.push({
                                value: [
                                    startTime,
                                    switchTime,
                                    index,
                                    ...tipInfo,
                                ],
                            });
                        } else {
                            selectDatas.push({
                                value: [
                                    startTime,
                                    switchTime,
                                    index,
                                    ...tipInfo,
                                ],
                            });
                        }
                    } else {
                        runningDatas.push({
                            value: [startTime, switchTime, index, ...tipInfo],
                        });
                    }

                    idleDatas.push({
                        value: [switchTime, endTIme, index, ...tipInfo],
                    });
                });
            });

            idleDatas = this.idleDataSupplement(resData, min, max, idleDatas);

            this.updateOptions = this.updateDatas(
                height,
                min,
                max,
                resData,
                runningDatas,
                idleDatas,
                selectDatas,
                lockDatas
            );
        }

        if (this.chartInstance) {
            this.chartInstance.clear();
            this.chartInstance.setOption(this.options, true);
        }

        this.setTimeData(
            min === Infinity ? 0 : min,
            max === -Infinity ? 0 : max
        );
        this.setTimeLine(0, 100);
    }

    /**
     * 无数据的时间段用idle补齐
     */
    public idleDataSupplement(resData, min, max, idleDatas): [] {
        resData.orderlist.forEach((cpuNum, index) => {
            if (
                resData.cpu_info[cpuNum].detail &&
                resData.cpu_info[cpuNum].detail.length
            ) {
                const startrTime =
                    resData.cpu_info[cpuNum].detail[0].start_time;
                const endTime = resData.cpu_info[cpuNum].detail.slice(-1)[0]
                    .end_time;
                if (startrTime > min) {
                    idleDatas.push({
                        value: [+min, startrTime, index],
                    });
                }
                if (endTime < max) {
                    idleDatas.push({
                        value: [endTime, +max, index],
                    });
                }
            } else {
                idleDatas.push({
                    value: [+min, +max, index],
                });
            }
        });
        return idleDatas;
    }

    /**
     * 三种图例的 chart 数据
     */
    public updateDatas(
        height,
        min,
        max,
        resData,
        runningDatas?,
        idleDatas?,
        selectDatas?,
        lockDatas?
    ) {
        const allSameDatas = {
            grid: {
                height,
            },
            xAxis: {
                min,
                max,
                axisLabel: {
                    formatter: (val) =>
                        this.currentType === 'durationSummary'
                            ? `${val.toFixed(2)} %`
                            : `${(val / 1000).toFixed(2)} ms`,
                },
            },
            yAxis: {
                data: resData.orderlist,
            },
            dataZoom: [
                {
                    type: 'inside',
                    filterMode: 'weakFilter',
                    disabled: false,
                },
            ],
        };
        let cpuStatusAndDurationSummaryDatas = {};
        if (this.currentType !== 'locatePTid') {
            const progressive =
                this.currentType === 'cpuStatus' ? { progressive: 0 } : {};
            cpuStatusAndDurationSummaryDatas = {
                title: {
                    show: !(runningDatas.length || idleDatas.length),
                    textStyle: {
                        color: '#bcbcbc',
                    },
                    text: this.i18n.common_term_task_nodata,
                    left: 'center',
                    top: 'center',
                },
                legend: {
                    data: ['Running', 'Idle'],
                    textStyle: {
                        color: this.isLightTheme ? '#222' : '#e8e8e8',
                    },
                },
                series: [
                    {
                        name: 'Running',
                        type: 'custom',
                        encode: {
                            x: [0, 1],
                            y: 2,
                        },
                        itemStyle: {
                            color: this.colorList.Running.normal,
                        },
                        emphasis: {
                            itemStyle: {
                                color:
                                    this.currentType === 'durationSummary'
                                        ? this.colorList.Running.normal
                                        : this.colorList.Running.emphasis,
                            },
                        },
                        data: runningDatas,
                        renderItem: this.renderItem,
                        ...progressive,
                    },
                    {
                        name: 'Idle',
                        type: 'custom',
                        encode: {
                            x: [0, 1],
                            y: 2,
                        },
                        itemStyle: {
                            color: this.colorList.Idle.normal,
                        },
                        emphasis: {
                            itemStyle: {
                                color:
                                    this.currentType === 'durationSummary'
                                        ? this.colorList.Idle.normal
                                        : this.colorList.Idle.emphasis,
                            },
                        },
                        data: idleDatas,
                        renderItem: this.renderItem,
                        ...progressive,
                    },
                ],
            };
        }
        if (this.currentType === 'cpuStatus') {
            return {
                ...allSameDatas,
                ...cpuStatusAndDurationSummaryDatas,
                tooltip: {
                    formatter: (params) => {
                        if (params.value[3] !== undefined) {
                            const html = `
                                <table class='chart-tip'>
                                    <tr><td>${this.i18n.sys_res.sum.thread_name
                                }</td><td style="padding-left: 16px; line-height: 28px;">
                                        ${params.value[3]}</td></tr>
                                    <tr><td>TID/PID</td><td style="padding-left: 16px; line-height: 28px;">
                                        ${params.value[4] || '--'} / ${params.value[5] || '--'
                                }</td></tr>
                                    <tr><td>${this.i18n.sys_res.sum.wait_duration
                                }</td><td style="padding-left: 16px; line-height: 28px;">
                                        ${params.value[6]} ms</td></tr>
                                    <tr><td>${this.i18n
                                    .common_term_task_tab_time_chart_run_time
                                }</td>
                                        <td style="padding-left: 16px; line-height: 28px;">${params.value[7]
                                } ms</td></tr>
                                    ${params.value[8]
                                    ? `<tr><td>${this.i18n.common_term_task_tab_summary_callstack}</td>
                                        <td style="padding-left: 16px; line-height: 28px;">` +
                                    params.value[8] +
                                    '</td></tr>'
                                    : ''
                                }
                                </table>
                            `;
                            // 修改鼠标经过tips框离开触发区域,tips不消失的问题
                            const tipBoxContent = $('.cpu-echart-content');
                            const tipBox = $('.cpu-echart-content' + ' .chart-tip').parent();
                            if (tipBox) {
                                tipBoxContent[0].onmouseleave = (e) => {
                                    tipBox.css('display', 'none');
                                };
                            }
                            return html;
                        }
                    },
                },
            };
        } else if (this.currentType === 'durationSummary') {
            return {
                ...allSameDatas,
                ...cpuStatusAndDurationSummaryDatas,
                tooltip: {
                    formatter: (params) => {
                        const html = `
                            <table style="font-size: 12px; line-height: 28px; color: #222;" class='chart-tip'>
                                <tr>
                                    <td>
                                        <div style="display: flex; align-items: center;">
                                        <div style="width: 8px; height: 8px; background: ${this.isLightTheme
                                ? '#52c41a' : '#2DA46F'
                            };"></div>
                                        <div style="margin-left: 8px; color: ${this.isLightTheme ? '' : '#e8e8e8'
                            };">Running</div>
                                        </div>
                                    </td>
                                    <td style="padding-left: 16px; color: ${this.isLightTheme ? '' : '#e8e8e8'
                            };">
                                        ${params.value[3]
                            } ms (${params.value[4].toFixed(2)}%)
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <div style="display: flex; align-items: center;">
                                        <div style="width: 8px; height: 8px; background: ${this.isLightTheme
                                ? '#e1e6ee' : '#616161'
                            };"></div>
                                        <div style="margin-left: 8px; color: ${this.isLightTheme ? '' : '#e8e8e8'
                            };">Idle</div>
                                        </div>
                                    </td>
                                    <td style="padding-left: 16px; color: ${this.isLightTheme ? '' : '#e8e8e8'
                            };">
                                        ${params.value[5]
                            } ms (${params.value[6].toFixed(2)}%)
                                    </td>
                                </tr>
                            </table>
                        `;
                        // 修改鼠标经过tips框离开触发区域,tips不消失的问题
                        const tipBoxContent = $('.cpu-echart-content');
                        const tipBox = $('.cpu-echart-content' + ' .chart-tip').parent();
                        if (tipBox) {
                            tipBoxContent[0].onmouseleave = (e) => {
                                tipBox.css('display', 'none');
                            };
                        }
                        return html;
                    },
                },
            };
        } else if (this.currentType === 'locatePTid') {
            return {
                ...allSameDatas,
                color: [
                    this.colorList.selectedThread.normal,
                    this.colorList.lockedThread.normal,
                    this.colorList.Running.normal,
                    this.colorList.Idle.normal,
                ],
                title: {
                    show: !(
                        selectDatas.length ||
                        lockDatas.length ||
                        runningDatas.length ||
                        idleDatas.length
                    ),
                    textStyle: {
                        color: '#bcbcbc',
                    },
                    text: this.i18n.common_term_task_nodata,
                    left: 'center',
                    top: 'center',
                },
                legend: {
                    data: [
                        this.i18n.sys_res.selectPidTid,
                        this.i18n.sys_res.lockPidTid,
                        'Running',
                        'Idle',
                    ],
                    textStyle: {
                        color: this.isLightTheme ? '#222' : '#e8e8e8',
                    },
                },
                tooltip: {
                    formatter: (params) => {
                        if (params.value[3] !== undefined) {
                            const html = `
                            <div class='chart-tip'>
                                ${params.seriesName ===
                                    this.i18n.sys_res.selectPidTid
                                    ? '<div style="margin-bottom: 10px; color: ' +
                                    (this.isLightTheme ? '#616161' : '#aaa') + '; font-size: 12px;' +
                                    'line-height: 18px; display: flex; align-items: center;">' +
                                    '<div style="background-image:url(./assets/img/resource/positionThread.svg);' +
                                    'background-size: 16px; width: 16px; height: 16px; margin: 1px 8px 0 0;"></div>' +
                                    this.i18n.sys_res.sum.clickPidTid +
                                    '</div>'
                                    : ''
                                }
                                <table>
                                <tr><td>${this.i18n.sys_res.sum.thread_name
                                }</td><td style="padding-left: 16px; line-height: 28px;">
                                    ${params.value[3]}</td></tr>
                                <tr><td>TID/PID</td><td style="padding-left: 16px; line-height: 28px;">
                                    ${params.value[4]} / ${params.value[5] || '--'
                                }</td></tr>
                                <tr><td>${this.i18n.sys_res.sum.wait_duration
                                }</td><td style="padding-left: 16px; line-height: 28px;">
                                    ${params.value[6]} ms</td></tr>
                                <tr><td>${this.i18n
                                    .common_term_task_tab_time_chart_run_time
                                }</td>
                                    <td style="padding-left: 16px; line-height: 28px;">${params.value[7]
                                } ms</td></tr>
                                    ${params.value[8]
                                    ? `<tr><td>${this.i18n.common_term_task_tab_summary_callstack}
                                        </td><td style="padding-left: 16px; line-height: 28px;">` +
                                    params.value[8] +
                                    '</td></tr>'
                                    : ''
                                }
                                </table>
                                </div>
                            `;
                            // 修改鼠标经过tips框离开触发区域,tips不消失的问题
                            const tipBoxContent = $('.cpu-echart-content');
                            const tipBox = $('.cpu-echart-content' + ' .chart-tip').parent();
                            if (tipBox) {
                                tipBoxContent[0].onmouseleave = (e) => {
                                    tipBox.css('display', 'none');
                                };
                            }
                            return html;
                        }
                    },
                },
                series: [
                    {
                        name: this.i18n.sys_res.selectPidTid,
                        type: 'custom',
                        encode: {
                            x: [0, 1],
                            y: 2,
                        },
                        data: selectDatas,
                        renderItem: this.renderItem,
                        progressive: 0,
                    },
                    {
                        name: this.i18n.sys_res.lockPidTid,
                        type: 'custom',
                        encode: {
                            x: [0, 1],
                            y: 2,
                        },
                        data: lockDatas,
                        renderItem: this.renderItem,
                        progressive: 0,
                    },
                    {
                        name: 'Running',
                        type: 'custom',
                        encode: {
                            x: [0, 1],
                            y: 2,
                        },
                        data: runningDatas,
                        renderItem: this.renderItem,
                        progressive: 0,
                    },
                    {
                        name: 'Idle',
                        type: 'custom',
                        encode: {
                            x: [0, 1],
                            y: 2,
                        },
                        data: idleDatas,
                        renderItem: this.renderItem,
                        progressive: 0,
                    },
                ],
            };
        }
    }

    /**
     * 切换类型
     * @param type 当前点击的图标
     * @param selected 被选中的图标
     */
    public switchType(type, selected) {
        this.tagBox.isExpand = false;
        this.isSelected = {
            time: false,
            percentage: false,
            position: false,
        };
        this.isSelected[selected] = true;

        this.currentType = type;
        this.chartInstance.dispatchAction({
            type: 'dataZoom',
            start: 0,
            end: 100,
        });
        this.getData({});
    }

    /**
     * 筛选CPU
     * CPU 种类变化时【筛选CPU】
     */
    public cpuCategoryChange(e) {
        this.filterCPU.cpuOption = this.filterCPU.allCpuOption.filter((item) =>
            e.list.includes(item.prop)
        );
    }

    /**
     * 选中 CPU 变化时
     */
    public cpuChange() {
        this.noData = false;
        const selectList = this.filterCPU.cpuSelected.filter(
            (item) => !item.disabledReason
        );
        if (selectList.length === 0) {
            this.noData = true;
            return;
        }
        this.getData({});
    }

    /**
     * 运行时长排序
     */
    public switchDurationSummarySortBy() {
        if (this.noData) {
            return;
        }
        this.getData({});
    }

    /**
     * 排序
     */
    public switchDurationSummarySortStatus() {
        switch (this.sortDurationSummary.sortStatus) {
            case 'asc':
                this.sortDurationSummary.sortStatus = 'desc';
                break;
            case 'desc':
                this.sortDurationSummary.sortStatus = '';
                break;
            default:
                this.sortDurationSummary.sortStatus = 'asc';
                break;
        }

        if (this.noData) {
            return;
        }
        this.getData({});
    }

    /**
     *  筛选进程/线程
     *  页面初始化之后从summary页面跳转来的
     */
    public locatePtid() {
        this.locatePTidData.selected = [];
        this.locatePTidData.list.forEach((val: { children: { prop: any; }[]; }) => {
            val.children.forEach((el: { prop: any; }) => {
                if (el.prop === this.tpItem.tid) {
                    this.locatePTidData.selected.push(el);
                }
            });
        });
        this.currentType = this.typeList[2].prop;
        this.currentPage = 1;
        this.switchType('locatePTid', 'position');
        setTimeout(() => {
            this.changeIcon('#position', this.iconStatus.position.press);
            this.changeMouseup(this.loosenIcon.position);
        }, 100);
    }
    /** 显示筛选弹框 */
    public showSelectTaskModal() {
        this.selectTaskModal.open();
        this.tagBox.isExpand = false;
    }

    /**
     * 点击tag，删除选中项, 同步侧滑框选中状态
     * @param taskItem taskItem
     */
    public deleteTask(taskItem: any) {
        const idx = this.locatePTidData.selected.findIndex((val: { prop: any; }) => val.prop === taskItem.prop);
        if (idx !== -1) {
            this.locatePTidData.selected.splice(idx, 1);
        }
        this.selectTaskModal.deleteTag(taskItem);
        this.currentPage = 1;
        if (this.locatePTidData.selected.length === 0) {
            this.noData = true;
            this.totalNumber = 0;
        } else {
            this.getData({});
        }
        this.updateWebViewPage();
    }

    /** 点击筛选弹框的确定按钮 */
    public confimModal(checkedList: any) {
        this.locatePTidData.selected = checkedList.map((val: { task: string; tid: any; }) => {
            const label = val.task.split('/')[0];
            return { label, prop: val.tid };
        });
        this.currentPage = 1;
        if (this.locatePTidData.selected.length === 0) {
            this.noData = true;
            this.totalNumber = 0;
        } else {
            this.getData({});
        }
        this.updateWebViewPage();
    }
    /**
     * 分页
     */
    public onPageUpdate(event: TiPaginationEvent): void {
        this.getData({});
    }

    /**
     * 时间轴
     * 修改时间轴的总起始时间
     * @param start 时间轴的总开始数值
     * @param end 时间轴的总结束数值
     */
    public setTimeData(start: number, end: number) {
        if (start !== undefined && end !== undefined) {
            this.timeData = { start, end };
            this.timeLineShow = !this.isSelected.percentage;
        } else {
            this.timeLineShow = false;
        }
    }

    /**
     * 修改时间轴选中区域大小
     * @param start 选中区域的开始百分比
     * @param end 选中区域的结束百分比
     */
    public setTimeLine(start: number, end: number) {
        if (this.timeLineDetail) {
            this.timeLineDetail.dataConfig({ start, end });
        }
        this.updateWebViewPage();
    }

    /**
     * 时间轴变化数据改变，同步设置chart的datazoom数值
     */
    public timeLineDataChange(e) {
        this.chartInstance.dispatchAction({
            type: 'dataZoom',
            start: e.start,
            end: e.end,
        });
        this.updateWebViewPage();
    }

    /**
     * 图标的移入、移出和按下效果
     * @param iconId 图标id
     * @param iconUrl 图标路径
     */
    public changeIcon(iconId: string, iconUrl: any) {
        $(iconId).attr(
            'src',
            iconUrl[
            this.isSelected[iconId.substr(1)] ? 'checkUrl' : 'uncheckUrl'
            ]
        );
        this.updateWebViewPage();
    }

    /**
     * 图标的松开事件
     * @param allStatus 所有图标的id和url
     */
    public changeMouseup(allStatus: any) {
        allStatus.forEach((item) => {
            $(item.id).attr('src', item.url);
        });
        this.updateWebViewPage();
    }

    /**
     * 筛选 鼠标移入
     */
    public mouseenter() {
        this.filterSrc = './assets/img/filterHover.svg';
        this.updateWebViewPage();
    }
    /**
     * 筛选 鼠标移出
     */
    public mouseleave() {
        this.filterSrc = './assets/img/filterNormal.svg';
        this.updateWebViewPage();
    }
    /**
     * IntellIj刷新webview页面
     */
    public updateWebViewPage() {
        if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
            this.zone.run(() => {
                this.cdr.checkNoChanges();
                this.cdr.detectChanges();
            });
        }
    }
}
