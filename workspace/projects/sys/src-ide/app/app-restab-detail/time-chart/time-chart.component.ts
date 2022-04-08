import { Component, OnInit, AfterViewInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { LeftShowService } from '../../service/left-show.service';
import { fromEvent } from 'rxjs';
import { I18nService } from '../../service/i18n.service';
import { Utils } from 'projects/sys/src-ide/app/service/utils.service';
import { util } from 'echarts';

interface SelectedIcon {
    time: boolean;
    percentage: boolean;
    position?: boolean;
}

@Component({
    selector: 'app-time-chart',
    templateUrl: './time-chart.component.html',
    styleUrls: ['./time-chart.component.scss']
})
export class TimeChartComponent implements OnInit, AfterViewInit, OnChanges {
    constructor(
        public leftShowService: LeftShowService,
        public i18nService: I18nService
    ) {
        this.i18n = this.i18nService.I18n();
    }
    public echartsInstance: any;

    public tableData: any;
    public baseTop = 40;
    public gridHeight = 16;
    public gridInertvalHeight = 32;
    public startTime = 0;
    public endTime = 0;
    public uuid: any;
    public sData = {};
    public fakes = {};
    public colorList = {
        WAIT_BLOCKED: '#fdca5a',
        WAIT_FOR_CPU: '#6c92fa',
        RUNNING: '#2DA46F',
        idle: '#616161'
    };
    public i18n: any;
    @Input() timeLine: any;
    @Input() echartsWidth: any;
    @Input() getDatas: any;
    @Input() isSelected: SelectedIcon;
    @Input() percentageData: any;
    @Output() check = new EventEmitter();
    @Output() public dataZoom = new EventEmitter<any>();
    public option = {
        legend: {
            data: [],
            type: 'scroll',
            icon: 'circle',
            top: this.baseTop,
            algin: 'left',
            right: 120
        },
        dataZoom: [],
        tooltip: {},
        axisPointer: {
            link: [{ xAxisIndex: 'all' }],
            snap: true,
            z: 1,
            show: false
        },
        grid: [],
        xAxis: [],
        yAxis: [],

        series: []
    };

    /**
     * 初始化
     */
    ngOnInit() {
        // 点击左侧echarts需要自适应
        this.leftShowService.leftIfShow.subscribe(() => {
            this.width();
        });
        fromEvent(window, 'resize')
            .subscribe(() => {
                let timer;
                function debounce() {
                    clearTimeout(timer);
                    timer = this.width();
                }
                debounce();
            });
        this.uuid = Utils.generateConversationId(12);
    }

    /**
     * 组件视图初始化完之后
     */
    ngAfterViewInit() {
        this.initData(true);
        this.dataZoom.emit({ start: this.startTime, end: this.endTime });
    }

    /**
     * 监听父组件件传递下来的值的变化
     * @param changes 父组件传递下来的所有值
     */
    ngOnChanges(changes: SimpleChanges) {
        if (changes.hasOwnProperty('isSelected')) {
            this.initData();
        }
    }

    /**
     * 初始化数据
     * @param isFirst 是否为第一次
     */
    initData(isFirst = false) {
        this.getDatas.spec.forEach(item => {
            this.sData[item] = [];
            this.fakes[item] = [];
            if (this.isSelected.percentage) {
                const interfaceTime = this.percentageData[item].runningPercentage * this.timeLine.end;
                this.sData[item].push([
                    {
                        xAxis: 0,
                        value: item + ',' + 0,
                        itemStyle: { color: this.colorList.RUNNING }
                    }, {
                        xAxis: interfaceTime,
                        value: item + ',' + 0,
                    }
                ]);
                this.sData[item].push([
                    {
                        xAxis: interfaceTime,
                        value: item + ',' + 0,
                        itemStyle: { color: this.colorList.idle }
                    }, {
                        xAxis: this.percentageData[item].endTime,
                        value: item + ',' + 0,
                    }
                ]);
                this.fakes[item].push({
                    name: item + ',' + 0,
                    value: [
                        0,
                        interfaceTime,
                    ]
                });
                this.fakes[item].push({
                    name: item + ',' + 0,
                    value: [
                        interfaceTime,
                        this.percentageData[item].endTime,
                    ]
                });
                return;
            }
            this.getDatas.values[item].forEach((val, index) => {
                const runningPercentage = (val.runtime / (val.idle_time + val.runtime));
                const interfaceTime = runningPercentage * (val.end_time - val.start_time) + val.start_time;
                this.sData[item].push([
                    {
                        xAxis: val.start_time,
                        value: item + ',' + index,
                        itemStyle: { color: this.colorList.RUNNING }
                    }, {
                        xAxis: interfaceTime,
                        value: item + ',' + index,
                    }
                ]);
                this.sData[item].push([
                    {
                        xAxis: interfaceTime,
                        value: item + ',' + index,
                        itemStyle: { color: this.colorList.idle }
                    }, {
                        xAxis: val.end_time,
                        value: item + ',' + index,
                    }
                ]);
                this.fakes[item].push({
                    name: item + ',' + index,
                    value: [
                        val.start_time,
                        interfaceTime,
                    ]
                });
                this.fakes[item].push({
                    name: item + ',' + index,
                    value: [
                        interfaceTime,
                        val.end_time,
                    ]
                });
            });
        });

        if (isFirst) {
            let startList = [];
            let endList = [];
            Object.keys(this.getDatas.values).forEach(key => {
                startList.push(this.getDatas.values[key][0].start_time);
                endList.push(this.getDatas.values[key][this.getDatas.values[key].length - 1].end_time);
            });
            startList = startList.sort((a, b) => a - b);
            endList = endList.sort((a, b) => a - b);
            this.endTime = endList[endList.length - 1];
            if (this.endTime <= 0) { this.endTime = 1000000; }
            this.startTime = this.getDatas.startTime * 1000000;
            if (this.startTime <= 0) { this.startTime = 0; }
        }

        setTimeout(() => {
            this.initChart(this.timeLine);
        });
    }

    /**
     * 绘制X轴
     * @param gridIndex 索引
     */
    public makeXAxis(gridIndex, opt) {
        return util.merge(
            {
                type: 'time',
                gridIndex,
                axisLine: { onZero: false, lineStyle: { color: '#ddd' } },
                axisTick: { show: false },
                axisLabel: {
                    show: false, textStyle: { color: '#282b33', fontSize: '14' }, formatter(value) {
                        return Utils.setThousandSeparator(value / 1000 + 'ms');
                    }
                },
                splitLine: { show: false, lineStyle: { color: '#ddd' } },
                min: this.startTime,
                max: this.endTime,
                axisPointer: {
                    show: false,
                    lineStyle: { color: 'transparent' },
                    z: 1
                }
            },
            opt || {},
            true
        );
    }

    /**
     * 宽度
     */
    public width() {
        setTimeout(() => {
            const width = $('#user-guide-scroll').width() * this.echartsWidth.right;
            this.echartsInstance.resize({ width });
            $('#chart-left').width($('#user-guide-scroll').width() * this.echartsWidth.left);
        }, 200);
    }

    /**
     * 绘制Y轴
     * @param gridIndex 索引
     */
    public makeYAxis(gridIndex, opt) {
        return util.merge(
            {
                type: 'value',
                gridIndex,
                nameLocation: 'middle',
                nameTextStyle: {
                    color: '#333'
                },
                show: false,
                boundaryGap: ['30%', '30%'],
                axisTick: { show: false },
                axisLine: { lineStyle: { color: '#ccc' } },
                axisLabel: { show: false },
                splitLine: { show: false }
            },
            opt || {},
            true
        );
    }

    /**
     * 绘制网格
     */
    public makeGrid(top, opt) {
        return util.merge(
            {
                top,
                left: '5%',
                right: '5%',
                name: 'grid',
                height: this.gridHeight
            },
            opt || {},
            true
        );
    }

    /**
     * 初始化图表
     * @param timeData 时间数据
     */
    public initChart(timeData) {
        this.option.series = [];
        this.option.grid = [];
        this.option.xAxis = [];
        this.option.yAxis = [];
        let i = 0;
        this.getDatas.spec.forEach((item, index) => {
            // 处理grid
            i++;
            if (index === this.getDatas.spec.length - 1) {
                if (this.getDatas.spec.length === 1) {
                    this.option.grid.push(
                        this.makeGrid(this.baseTop
                        + this.gridHeight * index
                        + ((index + 1) * this.gridInertvalHeight), {})
                    );
                    this.option.grid.push(
                        this.makeGrid(this.baseTop, {
                            show: true,
                            height: 0,
                            borderColor: '#e6ebf5',
                            borderWidth: 1,
                            z: 1,
                        })
                    );
                    this.option.grid.push(
                        this.makeGrid(
                            this.baseTop + this.gridHeight * index + (index * this.gridInertvalHeight) +
                            this.gridHeight + 2 * this.gridInertvalHeight,
                            {
                                show: true,
                                height: 0,
                                borderColor: '#e6ebf5',
                                borderWidth: 1,
                                z: 1,
                            }
                        )
                    );
                } else {
                    this.option.grid.push(
                        this.makeGrid(this.baseTop
                        + this.gridHeight * index
                        + ((index + 1) * this.gridInertvalHeight), {})
                    );
                    this.option.grid.push(
                        this.makeGrid(
                            this.baseTop + this.gridHeight * index + (index * this.gridInertvalHeight) +
                            this.gridHeight + 2 * this.gridInertvalHeight,
                            {
                                show: true,
                                height: 0,
                                borderColor: '#e6ebf5',
                                borderWidth: 1,
                                z: 1,
                            }
                        )
                    );
                }
            } else {
                if (i === 1) {
                    this.option.grid.push(
                        this.makeGrid(this.baseTop
                        + this.gridHeight * index
                        + ((index + 1) * this.gridInertvalHeight), {})
                    );
                    this.option.grid.push(
                        this.makeGrid(this.baseTop + this.gridHeight * index + (index * this.gridInertvalHeight), {
                            show: true,
                            height: 0,
                            borderColor: '#e6ebf5',
                            borderWidth: 1,
                            z: 1,
                        })
                    );
                } else {
                    this.option.grid.push(
                        this.makeGrid(
                            this.baseTop + this.gridHeight * index + ((index + 1) * this.gridInertvalHeight),
                            {}
                        )
                    );
                    this.option.grid.push(
                        // 显示的轴
                        this.makeGrid(this.baseTop + this.gridHeight * index + (index * this.gridInertvalHeight), {
                            show: true,
                            height: 0,
                            borderColor: 'transparent',
                            borderWidth: 1,
                            z: 1,
                        })
                    );
                }
            }

            // 处理serise
            this.option.series.push(
                {
                    name: item,
                    type: 'line',
                    symbol: 'circle',
                    symbolSize: 2,
                    xAxisIndex: index * 2,
                    yAxisIndex: index * 2,
                    silent: false,
                    sampling: 'average',
                    zlevel: 1111,
                    markArea: {
                        data: this.sData[item]
                    }
                }
            );

            this.option.series.push({
                name: 'fake',
                type: 'line',
                symbol: 'none',
                symbolSize: 1110,
                sampling: 'average',
                itemStyle: {
                    normal: { color: 'transparent' }
                },
                xAxisIndex: index * 2 + 1,
                yAxisIndex: index * 2 + 1,
                data: this.fakes[item]
            });
            // 处理xAxis
            this.option.xAxis.push(
                this.makeXAxis(index * 2, {
                    axisLine: { show: false },
                    axisPointer: {
                        show: false,
                        z: 1,
                        lineStyle: {
                            color: '#478cf1',
                            width: 1.5
                        }
                    }
                })
            );
            if (index === 0) {
                this.option.xAxis.push(
                    this.makeXAxis(index * 2 + 1, {
                        position: 'top',
                        axisLine: { show: false, onZero: false },
                        splitLine: { show: false },
                        axisLabel: {
                            show: true, textStyle: { color: '#aaa', fontSize: '12' }, formatter(value) {
                                return Utils.setThousandSeparator((value / 1000).toFixed(2) + 'ms');
                            }
                        },

                    })
                );
            } else {
                this.option.xAxis.push(
                    this.makeXAxis(index * 2 + 1, {
                        position: 'top',
                        axisLine: { show: false, onZero: false }
                    })
                );
            }

            // 处理yAxis
            this.option.yAxis.push(
                this.makeYAxis(index * 2, {
                    name: item,
                })
            );
            this.option.yAxis.push(
                this.makeYAxis(index * 2 + 1, {})
            );
        });

        // 处理tooltip
        this.option.tooltip = {
            trigger: 'axis',
            borderColor: 'rgba(50,50,50,0)',
            backgroundColor: '#fff',
            borderWidth: 1,
            hideDelay: 200,
            confine: true,
            enterable: true,
            borderRadius: 0,
            padding: [10, 10, 10, 20],
            extraCssText: 'box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);',
            formatter: (params) => {
                params.forEach(item => {
                    item.key = item.name.split(',')[0];
                    item.myIndex = item.name.split(',')[1];
                });

                if (params.length) {
                    let html = `<div>`;
                    if (this.getDatas.type === 'cpu') {
                        html += `<div>
                            <span style="width:60px;display:inline-block;color:#282b33;">
                                ${this.i18n.sys_res.core}
                            </span>
                            <span style="width:100px;display:inline-block;color:#282b33;">
                                ${this.i18n.sys_res.startTime}
                            </span>
                            <span style="width:120px;display:inline-block;color:#282b33;">
                                ${this.i18n.sys_res.processName}
                            </span>
                            <span style="width:80px;display:inline-block;color:#282b33;">
                                ${this.i18n.sys_res.PID}
                            </span>
                        </div>`;
                    } else if (this.getDatas.type === 'process') {
                        html += `<div>
                            <span style="width:100px;display:inline-block;color:#999;">
                                ${this.i18n.sys_res.startTime}
                            </span>
                            <span style="width:60px;display:inline-block;color:#999;">${this.i18n.sys_res.core}</span>
                        </div>`;
                    }

                    params.map((seriesName) => {

                        if (this.getDatas.type === 'cpu') {
                            html += `<div style="margin-top:12px">
                                <span style="width:60px;display:inline-block">${seriesName.key}</span>
                                <span style="width:100px;display:inline-block">
                                    ${Utils.setThousandSeparator((seriesName.axisValue / 1000).toFixed(1))}ms
                                </span>
                                <span style="width:120px;display:inline-block">
                                    ${Utils.setThousandSeparator(
                                        this.getDatas.values[seriesName.key][seriesName.myIndex].comm)}
                                </span>
                                <span style="width:80px;display:inline-block">
                                    ${this.getDatas.values[seriesName.key][seriesName.myIndex].pid}
                                </span>
                            </div>`;
                        } else if (this.getDatas.type === 'process') {
                            html += `<div style="margin-top:12px">
                                <span style="width:100px;display:inline-block">
                                    ${Utils.setThousandSeparator((seriesName.axisValue / 1000).toFixed(1))}ms
                                </span>
                                <span style="width:60px;display:inline-block">
                                    ${Utils.setThousandSeparator(
                                        this.getDatas.values[seriesName.key][seriesName.myIndex].core)}
                                </span>
                            </div>`;
                        }

                    });
                    html += `</div>`;
                    return '';
                }
                return '';
            }
        };

        const height =
            this.getDatas.spec.length * this.gridHeight
            + (this.getDatas.spec.length + 1) * this.gridInertvalHeight
            + this.baseTop * 1;
        const xAxisIndex = [];
        this.getDatas.spec.forEach((item, index) => {
            xAxisIndex.push((index) * 2);
            xAxisIndex.push((index + 1) * 2 - 1);
        });

        this.option.dataZoom = [{
            type: 'slider',
            start: timeData.start,
            end: timeData.end,
            xAxisIndex,
            show: false,
            minValueSpan: 50000,
            height: '18',
            left: '6%',
            right: '6%',
            filterMode: 'weakFilter',
            top: this.getDatas.spec.length * this.gridHeight + (this.getDatas.spec.length + 1) *
                this.gridInertvalHeight + this.baseTop * 1 + 35,
            labelFormatter(value) {
                return Utils.setThousandSeparator((value / 1000).toFixed(2) + 'ms');
            }
        }];
        $('#' + this.uuid + ' .right').css({ height: height + 'px' });
        setTimeout(() => {
            this.tableData = this.option;
            if (this.echartsInstance) {
                this.echartsInstance.clear();
                this.echartsInstance.setOption(this.tableData, true);
            }
        }, 100);
    }

    /**
     * 初始化图表
     */
    public onChartInit(e) {
        this.echartsInstance = e;
        this.echartsInstance.on('click', res => {
            // 找到现在选中的事spec的哪个元素
            const col = this.getDatas.spec[res.seriesIndex / 2];
            const index = res.dataIndex;
            this.check.emit({ key: col, index });
        });
        this.echartsInstance.on('mousemove', res => {
            const key = res.value.split(',')[0];
            const myIndex = res.value.split(',')[1];
            let html = `<div style="padding: 0 8px;">`;
            if (this.isSelected.position) {
                html += `<div style="margin-bottom:9px; height:18px;">
                    <span style="float:left; width:16px; height:16px; margin:1px 8px 0 0;
                        background:url(./assets/img/resource/positionUncheckNormal.svg); background-size:17px;">
                    </span>
                    <span style="float:left; line-height:18px; font-size:12px; color:#aaa;">
                        ${this.i18n.sys_res.sum.detail}
                    </span>
                </div>`;
            }
            if (this.isSelected.time || this.isSelected.position) {
                html += `<div style="float: left; margin: -4px 23px -4px 0;">
                    <p style="margin-bottom:4px; line-height:20px; font-size:12px; color:#e8e8e8;">
                        ${this.i18n.sys_res.sum.thread_name}
                    </p>
                    <p style="margin-bottom:4px; line-height:20px; font-size:12px; color:#e8e8e8;">TID/PID</p>
                    <p style="margin-bottom:4px; line-height:20px; font-size:12px; color:#e8e8e8;">
                        ${this.i18n.sys_res.sum.wait_duration}
                    </p>
                    <p style="margin-bottom:4px; line-height:20px; font-size:12px; color:#e8e8e8;">
                        ${this.i18n.common_term_task_tab_time_chart_run_time}
                    </p>
                    <p style="line-height:20px; font-size:12px; color:#e8e8e8;">
                        ${this.i18n.common_term_task_tab_summary_callstack}
                    </p>
                </div>`;
            } else if (this.isSelected.percentage) {
                if (this.getDatas.type === 'cpu') {
                    html += `<div style="float: left; margin-right: 23px; margin: -4px 23px -4px 0;">
                        <p style="margin-bottom:4px; line-height:20px; font-size:12px; color:#e8e8e8;">Runing</p>
                        <p style="line-height:20px; font-size:12px; color:#e8e8e8;">Idle</p>
                    </div>`;
                } else if (this.getDatas.type === 'process') {
                    html += `<div style="float: left; margin-right: 23px; margin: -4px 23px -4px 0;">
                        <p style="margin-bottom:4px; line-height:20px; font-size:12px; color:#e8e8e8;">Runing</p>
                        <p style="margin-bottom:4px; line-height:20px; font-size:12px; color:#e8e8e8;">Schedule</p>
                        <p style="line-height:20px; font-size:12px; color:#e8e8e8;">Wait</p>
                    </div>`;
                }
            }
            if (this.isSelected.time || this.isSelected.position) {
                html += `<div style="float: left; margin: -4px 0;">
                    <p style="margin-bottom:4px; line-height:20px; font-size:12px; color:#e8e8e8;">
                        ${this.getDatas.values[key][myIndex].taskname}
                    </p>
                    <p style="margin-bottom:4px; line-height:20px; font-size:12px; color:#e8e8e8;">
                        ${this.getDatas.values[key][myIndex].pid}/${this.getDatas.values[key][myIndex].ppid}
                    </p>
                    <p style="margin-bottom:4px; line-height:20px; font-size:12px; color:#e8e8e8;">
                        ${Utils.setThousandSeparator((this.getDatas.values[key][myIndex].idle_time / 1000)
                            .toFixed(3))}s
                    </p>
                    <p style="margin-bottom:4px; line-height:20px; font-size:12px; color:#e8e8e8;">
                        ${Utils.setThousandSeparator((this.getDatas.values[key][myIndex].runtime / 1000).toFixed(3))}s
                    </p>
                    <p style="line-height:20px; font-size:12px; color:#e8e8e8;">--</p>
                    <div style="clear: both;"></div>
                </div>`;
            } else if (this.isSelected.percentage) {
                if (this.getDatas.type === 'cpu') {
                    html += `<div style="float: left; margin: -4px 0;">
                        <p style="margin-bottom:4px; line-height:20px; font-size:12px; color:#e8e8e8;">
                            ${Utils.setThousandSeparator(this.percentageData[key].runningPercentage.toFixed(2))}%
                        </p>
                        <p style="line-height:20px; font-size:12px; color:#e8e8e8;">
                            ${Utils.setThousandSeparator(this.percentageData[key].idlePercentage.toFixed(2))}%
                        </p>
                        <div style="clear: both;"></div>
                    </div>`;
                } else if (this.getDatas.type === 'process') {
                    html += `<div style="float: left; margin: -4px 0;">
                        <p style="margin-bottom:4px; line-height:20px; font-size:12px; color:#e8e8e8;">
                            ${Utils.setThousandSeparator((this.getDatas.values[key][myIndex].start_time / 1000)
                                .toFixed(3))}ms
                        </p>
                        <p style="margin-bottom:4px; line-height:20px; font-size:12px; color:#e8e8e8;">
                            ${Utils.setThousandSeparator((this.getDatas.values[key][myIndex].start_time / 1000)
                                .toFixed(3))}ms
                        </p>
                        <p style="line-height:20px; font-size:12px; color:#e8e8e8;">
                            ${Utils.setThousandSeparator(this.getDatas.values[key][myIndex].core)}
                        </p>
                        <div style="clear: both;"></div>
                    </div>`;
                }
            }
            const pageX = document.body.clientWidth;

            let x = parseInt(res.event.event.pageX, 10) + 10;
            const y = parseInt(res.event.event.pageY, 10) + 20;
            if (x > pageX / 2) {
                if (this.getDatas.type === 'process') { x = x - 10 - 205 - 10; } else { x = x - 10 - 405 - 10; }
            }

            $('.chartTip').html(html).css({
                display: 'inline-block',
                transform: 'translateX(' + x + 'px) translateY(' + y + 'px)',
                left: '0px',
                top: '0px',
                borderColor: 'rgba(50,50,50,0)',
                backgroundColor: '#313131',
                borderWidth: 1,
                borderRadius: '4px',
                'box-shadow': '0 0 3px rgba(0, 0, 0, 0.3)',
            });
        });

        this.echartsInstance.on('mouseout', () => {
            $('.chartTip').html('');
            $('.chartTip').css({ display: 'none' });
        });

        this.echartsInstance.on('datazoom', params => {
            this.dataZoom.emit({ start: params.batch[0].start, end: params.batch[0].end });
        });
    }

    /**
     * 二分查找
     * @param arr 数组
     * @param item 查找项
     */
    public BinarySearch(arr, item) {
        let left = 0;
        let right = arr.length - 1;
        while (left <= right) {
            const mid = Math.floor((left + right) / 2);
            if (arr[mid][0].xAxis <= item && arr[mid][1].xAxis >= item) {
                return mid;
            } else if (arr[mid][0].xAxis > item) {
                right = mid - 1;
            } else {
                left = mid + 1;
            }
        }
        return 0;
    }

    /**
     * 时间轴改变 数据变化
     * @param data 数据
     */
    public upDateTimeLine(data) {
        this.option.dataZoom[0].start = data.start;
        this.option.dataZoom[0].end = data.end;
        this.echartsInstance.setOption({
            dataZoom: this.option.dataZoom
        });
    }
}
