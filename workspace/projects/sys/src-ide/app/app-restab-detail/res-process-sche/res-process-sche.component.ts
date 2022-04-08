import {
    Component,
    OnInit,
    Input,
    ViewChild,
    NgZone,
    ChangeDetectorRef,
    Renderer2,
    ElementRef,
    AfterViewInit,
} from '@angular/core';
import { I18nService } from '../../service/i18n.service';
import { MytipService } from '../../service/mytip.service';
import { Util } from '@cloud/tiny3';
import { TiPageSizeConfig, TiModalService } from '@cloud/tiny3';
import { VscodeService, COLOR_THEME, currentTheme } from '../../service/vscode.service';
import { LeftShowService } from '../../service/left-show.service';
import { fromEvent } from 'rxjs';
import { SortStatus, InterfaceService } from '../../service/interface.service';
import { DomSanitizer } from '@angular/platform-browser';
import { ViewDetailsService } from '../../service/view-details.service';
import { Utils } from 'projects/sys/src-ide/app/service/utils.service';
import { graphic } from 'echarts';

@Component({
    selector: 'app-res-process-sche',
    templateUrl: './res-process-sche.component.html',
    styleUrls: ['./res-process-sche.component.scss'],
})
export class ResProcessScheComponent implements OnInit, AfterViewInit {
    @Input() projectName: any;
    @Input() taskName: any;
    @Input() analysisType: any;
    @Input() taskid: any;
    @Input() nodeid: any;
    @Input() isActive: any;
    @ViewChild('chartBox', { static: false }) chartBox;
    @ViewChild('timeLineDetail', { static: false }) timeLineDetail;
    @ViewChild('container', { static: true }) private containerRef: ElementRef;
    @ViewChild('tagBox', { static: false }) public tagBox: any;
    // -- 筛选弹框 --
    @ViewChild('selectTaskModal', { static: false }) public selectTaskModal: any;
    public ifInit = true;
    public originList: any; // 选中原始数据

    public i18n: any;
    public startTime: any;
    public endtTime: any;
    public colorList = {
        Wait: {
            normal: '#E38839',
            emphasis: '#ECAA70',
        },
        Schedule: {
            normal: '#CFC726',
            emphasis: '#E2DA41',
        },
        Running: {
            normal: '#2DA46F',
            emphasis: '#5DD49F',
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

    // 选择进程/线程
    public locatePTidData = {
        title: '',
        selected: [],
        list: [],
        tidSelected: [],
        pidSelected: [],
        tidList: [],
        pidList: [],
        pid_ppid_rels: [], // 进程/线程字典
    };

    // 运行时长排序
    public sortDurationSummary = {
        title: '',
        selected: undefined,
        list: [],
        sortStatus: 'desc' as SortStatus,
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

    public isSelected = {
        time: true,
        percentage: false,
    };
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
    };
    public loosenIcon = {
        time: [
            {
                id: '#processTime',
                url: './assets/img/resource/timeCheckHover.svg',
            },
            {
                id: '#processPercentage',
                url: './assets/img/resource/percentageUncheckNormal.svg',
            },
        ],
        percentage: [
            {
                id: '#processPercentage',
                url: './assets/img/resource/percentageCheckHover.svg',
            },
            {
                id: '#processTime',
                url: './assets/img/resource/timeUncheckNormal.svg',
            },
        ],
    };

    public showLoading = true;
    public isFirst = true;
    public noData = false;
    // 获取主题颜色
    public ColorTheme = {
        Dark: COLOR_THEME.Dark,
        Light: COLOR_THEME.Light,
    };
    public currTheme = COLOR_THEME.Dark;
    public isLightTheme = false;
    public filterSrc = './assets/img/filterNormal.svg';
    private updateEcharts = false;

    constructor(
        public sanitizer: DomSanitizer,
        private renderer2: Renderer2,
        public vscodeService: VscodeService,
        public i18nService: I18nService,
        public mytip: MytipService,
        public ngZone: NgZone,
        private zone: NgZone,
        public changeDetectorRef: ChangeDetectorRef,
        public leftShowService: LeftShowService,
        private viewDetails: ViewDetailsService,
        private requestService: InterfaceService,
        private tiModal: TiModalService,
    ) {
        this.i18n = this.i18nService.I18n();

        this.typeList = [{ prop: 'status' }, { prop: 'durationSummary' }];
        this.currentType = this.typeList[0].prop;

        this.locatePTidData.title = this.i18n.sys_res.selectTIDAndPid;

        this.sortDurationSummary.title = this.i18n.sys_res.sort;
        this.sortDurationSummary.list = [
            { label: 'Wait', prop: 'Wait' },
            { label: 'Schedule', prop: 'Schedule' },
            { label: 'Running', prop: 'Running' },
        ];
        this.sortDurationSummary.selected = this.sortDurationSummary.list[2];
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
        fromEvent(window, 'resize').subscribe(() =>
            this.chartInstance.resize()
        );
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
    }

    /**
     * 视图初始化完成之后
     */
    ngAfterViewInit(): void {
        if (this.isLightTheme) {
            $('#processTime').attr('src', './assets/img/light-resource/timeCheckNormal.svg');
            $('#processPercentage').attr('src', './assets/img/light-resource/percentageUncheckNormal.svg');
        }
        this.updateWebViewPage();

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
                this.changeIcon('#processTime', this.iconStatus.time.normal);
            }
            if (!this.isSelected.percentage) {
                this.changeIcon('#processPercentage', this.iconStatus.percentage.normal);
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
                Wait: {
                    normal: '#e88b00',
                    emphasis: '#ffa940',
                },
                Schedule: {
                    normal: '#ffd666',
                    emphasis: '#eab627',
                },
                Running: {
                    normal: '#41ba41',
                    emphasis: '#8cd600',
                },
            };

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
            };
            this.loosenIcon = {
                time: [
                    {
                        id: '#processTime',
                        url: './assets/img/light-resource/timeCheckHover.svg',
                    },
                    {
                        id: '#processPercentage',
                        url: './assets/img/light-resource/percentageUncheckNormal.svg',
                    },
                ],
                percentage: [
                    {
                        id: '#processPercentage',
                        url: './assets/img/light-resource/percentageCheckHover.svg',
                    },
                    {
                        id: '#processTime',
                        url: './assets/img/light-resource/timeUncheckNormal.svg',
                    },
                ],
            };
        } else {
            this.isLightTheme = false;
            this.colorList = {
                Wait: {
                    normal: '#E38839',
                    emphasis: '#ECAA70',
                },
                Schedule: {
                    normal: '#CFC726',
                    emphasis: '#E2DA41',
                },
                Running: {
                    normal: '#2DA46F',
                    emphasis: '#5DD49F',
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
            };
            this.loosenIcon = {
                time: [
                    {
                        id: '#processTime',
                        url: './assets/img/resource/timeCheckHover.svg',
                    },
                    {
                        id: '#processPercentage',
                        url: './assets/img/resource/percentageUncheckNormal.svg',
                    },
                ],
                percentage: [
                    {
                        id: '#processPercentage',
                        url: './assets/img/resource/percentageCheckHover.svg',
                    },
                    {
                        id: '#processTime',
                        url: './assets/img/resource/timeUncheckNormal.svg',
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
            .getTotalTimeRange(this.taskid, this.nodeid, 'process')
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
                'pid_ppid_rels',
                'app_ppids',
            ])
            .subscribe((res: any) => {
                this.locatePTidData.selected = [];
                this.originList = res.data.pid_ppid_rels;
                const pid_ppid_rels = res.data.pid_ppid_rels;
                if (pid_ppid_rels) {
                    Object.keys(pid_ppid_rels).forEach(
                        (tid) => {

                            pid_ppid_rels[tid].forEach(
                                (pid) => {
                                    const pidItem = {
                                        label: Utils.transformLabel(pid),
                                        prop: +pid.split('/')[0],
                                    };
                                    this.locatePTidData.pidList.push(pidItem);
                                    this.locatePTidData.pidSelected.push(pidItem);
                                }
                            );

                            const item = {
                                label: Utils.transformLabel(tid),
                                prop: +tid.split('/')[0],
                                children: pid_ppid_rels[tid].map((pid: string) => {
                                    const childItem = {
                                        label: Utils.transformLabel(pid),
                                        prop: +pid.split('/')[0],
                                    };
                                    if (this.viewDetails.topList10.indexOf(childItem.prop) > -1) {
                                        this.locatePTidData.selected.push(childItem);
                                    }
                                    return childItem;
                                }),
                            };
                            this.locatePTidData.list.push(item);
                        }
                    );
                }
                if (this.locatePTidData.pidSelected.length === 0) {
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
        startTime?: number; // 数据窗口范围的起始数值
        endTime?: number; // 数据窗口范围的结束数值
    }) {
        this.showLoading = true;

        let params: any = {
            currentType: this.currentType,
            taskId: this.taskid,
            nodeId: this.nodeid,
            pageNo: this.currentPage,
            pageSize: this.pageSize.size,
            pidList: this.locatePTidData.selected
                ? this.locatePTidData.selected.map((item) => item.prop).join(',')
                : '',
            startTime,
            endTime,
        };
        if (this.currentType === 'durationSummary') {
            params = {
                ...params,
                sortBy: this.sortDurationSummary.selected.prop,
                sortStatus: this.sortDurationSummary.sortStatus,
            };
        }
        this.requestService
            .getPidTidScheduleData(params)
            .subscribe((res: any) => {
                if (res.code.includes('Success')) {
                    this.totalNumber = res.data.total_count;
                    this.updateChartData(res.data.menulist, res.data.process);
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

        this.chartInstance.on('mousemove', () => {
            // 只有筛选ptid选中的Running色块才会变成手型
            this.chartInstance.getZr().setCursorStyle('default');
        });

        this.init();
    }

    private renderItem(params, api) {
        const categoryIndex = api.value(2);
        const start = api.coord([api.value(0), categoryIndex]);
        const end = api.coord([api.value(1), categoryIndex]);
        const height = ((self as any).webviewSession || {}).getItem('tuningOperation') === 'hypertuner' ? 12 : 20;
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
     * @param menulist 排序过的CPU列表
     * @param processInfo 数据
     */
    public updateChartData(menulist, processInfo) {
        /**
         * 1、所有的数据段都是ms单位，说有的数据点都是us单位（数据比较准确）
         * 2、汇总信息为毫秒为单位，取第一条 detail 的 start_time 为起始值，最后一条 detail 的 end_time 为终止值
         *  2.1、detail[0].start_time + (runtime + idletime) * 1000 = detail.slice(-1)[0].end_time
         * 3、全部转换成微秒去画图，显示使用毫秒
         */
        this.orderlist = menulist.map((key) => {
            const info = processInfo[key];
            return {
                taskname: Utils.transformLabel(info.taskname),
                pid: Utils.transformLabel(info.pid),
                ppid: Utils.transformLabel(info.ppid),
            };
        });
        let num = 56;
        if (((self as any).webviewSession || {}).getItem('tuningOperation') === 'hypertuner') {
          num = 35;
        }
        const height = menulist.length ? num * menulist.length + 20 : 400;
        this.chartBox.nativeElement.style.height = `${height + 40}px`;
        setTimeout(() => this.chartInstance.resize(), 10);
        let min = Infinity;
        let max = -Infinity;
        const runningDatas = [];
        const waitDatas = [];
        const scheduleDatas = [];

        if (this.currentType === 'status') {
            // 状态
            menulist.forEach((item, index) => {
                processInfo[item].detail.forEach((detail) => {
                    const startTime = detail.start_time;
                    const switchToScheduleTime =
                        startTime + detail.wait_time * 1000;
                    const switchToRunningTime =
                        switchToScheduleTime + detail.sch_delay * 1000;
                    const endTIme = switchToRunningTime + detail.runtime * 1000;
                    min = Math.min(min, startTime);
                    max = Math.max(max, endTIme);
                    const tipInfo = [
                        Utils.transformLabel(detail.taskname),
                        detail.cpu,
                        Utils.transformLabel(detail.pid),
                        Utils.transformLabel(detail.ppid),
                        detail.wait_time,
                        detail.sch_delay,
                        detail.runtime,
                        detail.callstack,
                    ];

                    waitDatas.push({
                        value: [
                            startTime,
                            switchToScheduleTime,
                            index,
                            ...tipInfo,
                        ],
                    });

                    scheduleDatas.push({
                        value: [
                            switchToScheduleTime,
                            switchToRunningTime,
                            index,
                            ...tipInfo,
                        ],
                    });

                    runningDatas.push({
                        value: [
                            switchToRunningTime,
                            endTIme,
                            index,
                            ...tipInfo,
                        ],
                    });
                });
            });

            this.updateOptions = this.updateDatas(
                height,
                min,
                max,
                runningDatas,
                waitDatas,
                scheduleDatas,
                menulist
            );
        } else if (this.currentType === 'durationSummary') {
            // 时长
            menulist.forEach((item, index) => {
                const info = processInfo[item];

                if (info.detail.length) {
                    const waitPercentage = info['wait_time%'] * 100;
                    const schedulePercentage = info['sch_delay%'] * 100;
                    const runningPercentage =
                        100 - waitPercentage - schedulePercentage;
                    const tipInfo = [
                        info.wait_time,
                        waitPercentage,
                        info.sch_delay,
                        schedulePercentage,
                        info.runtime,
                        runningPercentage,
                    ];

                    waitDatas.push({
                        value: [0, waitPercentage, index, ...tipInfo],
                    });

                    scheduleDatas.push({
                        value: [
                            waitPercentage,
                            waitPercentage + schedulePercentage,
                            index,
                            ...tipInfo,
                        ],
                    });

                    runningDatas.push({
                        value: [
                            waitPercentage + schedulePercentage,
                            100,
                            index,
                            ...tipInfo,
                        ],
                    });
                }
            });

            this.updateOptions = this.updateDatas(
                height,
                0,
                100,
                runningDatas,
                waitDatas,
                scheduleDatas,
                menulist
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
     * 两种图例的 chart 数据
     */
    public updateDatas(
        height,
        min,
        max,
        runningDatas,
        waitDatas,
        scheduleDatas,
        menulist
    ) {
        const progressive =
            this.currentType === 'status' ? { progressive: 0 } : {};
        const allSameDatas = {
            title: {
                show: !(
                    runningDatas.length ||
                    waitDatas.length ||
                    scheduleDatas.length
                ),
                textStyle: {
                    color: '#bcbcbc',
                },
                text: this.i18n.common_term_task_nodata,
                left: 'center',
                top: 'center',
            },
            grid: {
                height,
            },
            legend: {
                data: ['Wait', 'Schedule', 'Running'],
                textStyle: {
                    color: this.isLightTheme ? '#222' : '#e8e8e8',
                },
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
                data: menulist,
            },
            dataZoom: [
                {
                    type: 'inside',
                    filterMode: 'weakFilter',
                    disabled: false,
                },
            ],
            series: [
                {
                    name: 'Wait',
                    type: 'custom',
                    encode: {
                        x: [0, 1],
                        y: 2,
                    },
                    itemStyle: {
                        color: this.colorList.Wait.normal,
                    },
                    emphasis: {
                        itemStyle: {
                            color:
                                this.currentType === 'durationSummary'
                                    ? this.colorList.Wait.normal
                                    : this.colorList.Wait.emphasis,
                        },
                    },
                    data: waitDatas,
                    renderItem: this.renderItem,
                    ...progressive,
                },
                {
                    name: 'Schedule',
                    type: 'custom',
                    encode: {
                        x: [0, 1],
                        y: 2,
                    },
                    itemStyle: {
                        color: this.colorList.Schedule.normal,
                    },
                    emphasis: {
                        itemStyle: {
                            color:
                                this.currentType === 'durationSummary'
                                    ? this.colorList.Schedule.normal
                                    : this.colorList.Schedule.emphasis,
                        },
                    },
                    data: scheduleDatas,
                    renderItem: this.renderItem,
                    ...progressive,
                },
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
            ],
        };
        if (this.currentType === 'status') {
            return {
                ...allSameDatas,
                tooltip: {
                    formatter: (params) => {
                        const html = `
                            <table class='chart-tip'>
                                <tr><td>${this.i18n.sys_res.sum.thread_name
                            }</td><td style="padding-left: 16px; line-height: 28px;">
                                    ${params.value[3]}</td></tr>
                                <tr><td>${this.i18n.sys_res.core
                            }</td><td style="padding-left: 16px; line-height: 28px;">
                                    ${params.value[4]}</td></tr>
                                <tr><td>TID/PID</td><td style="padding-left: 16px; line-height: 28px;">
                                    ${params.value[5] || '--'} / ${params.value[6] || '--'
                            }</td></tr>
                                <tr><td>${this.i18n.sys_res.sum.wait_duration
                            }</td><td style="padding-left: 16px; line-height: 28px;">
                                    ${params.value[7]} ms</td></tr>
                                <tr><td>${this.i18n.sys_res.scheduleDelay
                            }</td><td style="padding-left: 16px; line-height: 28px;">
                                    ${params.value[8]} ms</td></tr>
                                <tr><td>${this.i18n
                                .common_term_task_tab_time_chart_run_time
                            }</td>
                                    <td style="padding-left: 16px; line-height: 28px;">${params.value[9]
                            } ms</td></tr>
                                ${params.value[10]
                                ? `<tr><td>${this.i18n.common_term_task_tab_summary_callstack}</td>
                                    <td style="padding-left: 16px; line-height: 28px;">` +
                                params.value[10] +
                                '</td></tr>'
                                : ''
                            }
                            </table>
                        `;
                        // 修改鼠标经过tips框离开触发区域,tips不消失的问题
                        const tipBoxContent = $('.process-echart-content');
                        const tipBox = $('.process-echart-content' + ' .chart-tip').parent();
                        if (tipBox) {
                            tipBoxContent[0].onmouseleave = (e) => {
                                tipBox.css('display', 'none');
                            };
                        }
                        return html;
                    },
                },
            };
        } else if (this.currentType === 'durationSummary') {
            return {
                ...allSameDatas,
                tooltip: {
                    formatter: (params) => {
                        const html = `
                            <table style="font-size: 12px; line-height: 28px; color: #222;" class='chart-tip'>
                                <tr>
                                    <td>
                                        <div style="display: flex; align-items: center;">
                                            <div style="width: 8px; height: 8px; background:
                                            ${this.isLightTheme ? '#e88b00' : '#E38839'
                            };"></div>
                                            <div style="margin-left: 8px; color: ${this.isLightTheme ? '' : '#e8e8e8'
                            };">Wait</div>
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
                                            <div style="width: 8px; height: 8px; background: ${this.isLightTheme ?
                                                '#ffd666' : '#CFC726'
                            };"></div>
                                            <div style="margin-left: 8px; color: ${this.isLightTheme ? '' : '#e8e8e8'
                            };">Schedule</div>
                                        </div>
                                    </td>
                                    <td style="padding-left: 16px; color: ${this.isLightTheme ? '' : '#e8e8e8'
                            };">
                                        ${params.value[5]
                            } ms (${params.value[6].toFixed(2)}%)
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <div style="display: flex; align-items: center;">
                                            <div style="width: 8px; height: 8px; background:
                                            ${this.isLightTheme ? '#41ba41' : '#2DA46F'
                            };"></div>
                                            <div style="margin-left: 8px; color: ${this.isLightTheme ? '' : '#e8e8e8'
                            };">Running</div>
                                        </div>
                                    </td>
                                    <td style="padding-left: 16px; color: ${this.isLightTheme ? '' : '#e8e8e8'
                            };">
                                        ${params.value[7]
                            } ms (${params.value[8].toFixed(2)}%)
                                    </td>
                                </tr>
                            </table>
                        `;
                        // 修改鼠标经过tips框离开触发区域,tips不消失的问题
                        const tipBoxContent = $('.process-echart-content');
                        const tipBox = $('.process-echart-content' + ' .chart-tip').parent();
                        if (tipBox) {
                            tipBoxContent[0].onmouseleave = (e) => {
                                tipBox.css('display', 'none');
                            };
                        }
                        return html;
                    },
                },
            };
        }
    }
    /** 显示筛选弹框 */
    public showSelectTaskModal() {
        this.tagBox.isExpand = false;
        this.selectTaskModal.open();
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


    /**
     * 格式化侧滑框选中的原始数据, 侧滑框回来可能有未匹配的数据
     * @param list 选中项
     */
    public getSelected(list: any) {
        const selected: any = [];
        const arr = list.map((val: { tid: any; }) => val.tid);
        Object.keys(this.originList).forEach((pid: any) => {
            this.originList[pid].forEach((ppid: string) => {
                const item = {
                    label: Utils.transformLabel(ppid),
                    prop: +ppid.split('/')[0],
                };
                if (arr.indexOf(item.prop) > -1) {
                    selected.push(item);
                }
                return item;
            });

        });
        return selected;
    }

    /** 点击筛选弹框的确定按钮 */
    public confimModal(checkedList: any) {
        this.locatePTidData.selected = this.getSelected(checkedList);
        this.currentPage = 1;
        if (this.locatePTidData.selected.length === 0) {
            this.noData = true;
            this.totalNumber = 0;
        } else {
            this.getData({});
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
        };
        this.isSelected[selected] = true;

        this.currentType = type;
        this.chartInstance.dispatchAction({
            type: 'dataZoom',
            start: 0,
            end: 100,
        });
        this.getData({});
        this.updateWebViewPage();
    }


    /**
     * 选择线程
     */
    public locatePid() {
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
     * 运行时长排序
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
     * 分页
     */
    public onPageUpdate(): void {
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
    }

    /**
     * 时间轴变化数据改变，同步设置chart的datazoom数值
     * @param e e
     */
    public timeLineDataChange(e) {
        this.chartInstance.dispatchAction({
            type: 'dataZoom',
            start: e.start,
            end: e.end,
        });
    }

    /**
     * 图标的移入、移出和按下效果
     * @param iconId 图标id
     * @param iconUrl 图标路径
     */
    public changeIcon(iconId: string, iconUrl: any) {
        let icon: string;
        if (iconId === '#processTime') {
            icon = 'time';
        } else if (iconId === '#processPercentage') {
            icon = 'percentage';
        }
        const url = iconUrl[this.isSelected[icon] ? 'checkUrl' : 'uncheckUrl'];
        $(iconId).attr('src', url);
    }

    /**
     * 图标的松开事件
     * @param allStatus 所有图标的id和url
     */
    public changeMouseup(allStatus: any) {
        allStatus.forEach((item: { id: any; url: any }) => {
            $(item.id).attr('src', item.url);
        });
    }
    /**
     * 筛选 鼠标移入
     */
    public mouseenter() {
        this.filterSrc = './assets/img/filterHover.svg';
    }
    /**
     * 筛选 鼠标移出
     */
    public mouseleave() {
        this.filterSrc = './assets/img/filterNormal.svg';
    }

    /**
     * intellIj刷新webview页面
     */
    public updateWebViewPage() {
        if (((self as any).webviewSession || {}).getItem('tuningOperation') === 'hypertuner') {
            this.zone.run(() => {
                this.changeDetectorRef.detectChanges();
                this.changeDetectorRef.checkNoChanges();
            });
        }
    }
}
