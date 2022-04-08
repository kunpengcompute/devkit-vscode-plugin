import {
    Component, ElementRef, EventEmitter, Input, OnInit, Output, AfterViewInit, OnDestroy, SecurityContext
} from '@angular/core';
import { I18nService } from '../../../service/i18n.service';
import { Utils } from '../../../service/utils.service';
import { MessageService } from '../../../service/message.service';
import { DomSanitizer } from '@angular/platform-browser';
import { COLOR_THEME, currentTheme } from './../../../service/vscode.service';
import { HyTheme, HyThemeService } from 'hyper';

@Component({
    selector: 'app-disk-chart',
    templateUrl: './disk-chart.component.html',
    styleUrls: ['./disk-chart.component.scss']
})
export class DiskChartComponent implements OnInit, AfterViewInit, OnDestroy {

    @Input() datas: any;
    @Input() timeLine: any;
    // 当前是第几个图表
    @Input() curIndex: any;
    // 总计多少图表
    @Input() totalNum: any;
    @Output() public dataZoom = new EventEmitter<any>();
    @Output() public brushOut = new EventEmitter<any>();
    // 获取主题颜色
    public ColorTheme = {
        Dark: COLOR_THEME.Dark,
        Light: COLOR_THEME.Light
    };
    public currTheme = COLOR_THEME.Dark;
    public echartsInstance: any;
    public tableData: any;
    public baseTop = 30;
    public gridHeight = 80;
    public baseColor = '#484a4e';
    public ylabelColor = '#999';
    public lineColorList = ['#3d7ff3', '#2da46f', '#18aba6', '#9653e1', '#618824', '#ad2776', '#c24123', '#ab254e'];
    public time: any;
    // 读\写
    public spec: any;
    // 数据大小\时延\队列深度
    public key: any;
    // 设备
    public devArr: Array<string>;
    public uuid: any;
    public scrollDataIndex = 0;
    public option: any = {
        legend: {
            data: [],
            type: 'scroll',
            icon: 'path://M0,11 L4,11 L4,8 L0,8 L0,11 Z M6,11 L10,11 L10,8 L6,8 L6,\
                11 Z M12,11 L16,11 L16,8 L12,8 L12,11 Z',
            top: 0,
            algin: 'left',
            right: 50,
            width: '35%',
            itemHeight: ((self as any).webviewSession || {}).getItem('tuningOperation') === 'hypertuner' ? 2 : 5,
            itemWidth: 25,
            show: true,
            selectedMode: true,
            zlevel: 1051,
            inactiveColor: '#ccc',
            textStyle: {
                color: '#e8e8e8',
            }
        },
        dataZoom: [
            {
                start: 0,
                end: 100,
                xAxisIndex: [],
                left: '1.3%',
                right: '3.3%',
                height: '18',
                top: 0,
                show: false,
                textStyle: {
                    color: 'rgba(0,0,0,0)'
                }
            },
            {
                type: 'inside'
            }
        ],
        tooltip: {},
        axisPointer: {
            link: [{ xAxisIndex: 'all' }],
            snap: true
        },
        grid: [],
        xAxis: [],
        yAxis: [],
        series: [],
    };
    public i18n: any;
    public timelineSubscribe: any;

    constructor(
        public i18nService: I18nService,
        private el: ElementRef,
        private domSanitizer: DomSanitizer,
        private msgService: MessageService,
        private themeServe: HyThemeService
    ) {
        this.i18n = this.i18nService.I18n();
    }

    /**
     * 初始化
     */
    ngOnInit() {
        this.currTheme = currentTheme();
        if (this.currTheme === this.ColorTheme.Light) {
            this.baseColor = '#e6ebf5';
            this.option.legend.textStyle.color = '#252c3c';
        }
        this.timelineSubscribe = this.msgService.getMessage().subscribe((msg) => {
            if (msg.type === 'diskioUpdateTime') {
                this.upDateTimeLine(msg.data);
            } else if (msg.page === 'diskio' && this.key[0].key !== msg.key && this.key[0].key !== 'queue_depth') {
                this.rebuildOption(msg.data.params, msg.data.showLegendList);
            }
        });
        this.themeServe.subscribe((msg) => {
            this.setTheme(msg);
        });
        this.uuid = Utils.generateConversationId(12);
    }
    private setTheme(theme: HyTheme) {
        if (!theme) {
            return;
        }
        this.currTheme = theme === 'light' ? this.ColorTheme.Light : this.ColorTheme.Dark;
        this.themeStyleChange();
    }

    public themeStyleChange() {
        this.baseColor = this.currTheme === this.ColorTheme.Light ? '#e6ebf5' : '#484a4e';
        this.echartsInstance?.setOption({
            legend: {
                inactiveColor: this.currTheme === this.ColorTheme.Light ? '#e8e8e8' : '#ccc',
                textStyle: {
                    color: this.currTheme === this.ColorTheme.Light ? '#282b33' : '#E8E8E8',
                }
            },
            tooltip: {
                backgroundColor: this.currTheme === this.ColorTheme.Light ? '#ffffff' : '#424242',
            },
        });
        this.setLeft();
    }

    /**
     * 页面渲染完成
     */
    ngAfterViewInit() {
        this.initTable();
    }

    /**
     * 初始化数据
     */
    public initTable() {
        this.time = this.datas.time;
        this.spec = this.datas.spec;
        this.key = this.datas.key;
        this.devArr = this.datas.devArr;
        setTimeout(() => {
            this.setData(this.timeLine);
        }, 10);
    }

    /**
     * ngx-echarts 初始化时调用
     */
    onChartInit(ec: any) {
        this.echartsInstance = ec;
        this.echartsInstance.on('datazoom', (params: any) => {  // 放大缩小时调用接口
            this.dataZoom.emit({ start: params.batch[0].start, end: params.batch[0].end });
        });
        this.echartsInstance.on('legendscroll', (params: any) => {
            this.scrollDataIndex = params.scrollDataIndex;
        });
        this.echartsInstance.on('legendselectchanged', (params: any) => {  // 点击图例
            const showLegendList = [];
            for (const key of Object.keys(params.selected)) {
                const isSelected = params.selected[key];
                if (isSelected) {
                    showLegendList.push(key);
                }
            }
            this.rebuildOption(params, showLegendList);
            if (this.key[0].key !== 'queue_depth') {
                this.msgService.sendMessage({
                    page: 'diskio',
                    dev: '',
                    key: this.key[0].key,
                    data: { params, showLegendList }
                });
            }
        });
        setTimeout(() => {

            let canvas = this.el.nativeElement.querySelector('canvas');
            if (this.datas.showLe) {
                canvas = this.el.nativeElement.querySelectorAll('canvas')[1];
            }
            canvas.onmousedown = (e: any) => { // 如果选中canvas,阻止默认事件
                if (!(e.layerY < 25 && this.datas.showLe)) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.onBrush(e);
                }
            };
        }, 1500);
    }

    /**
     * 重建canvas
     */
    private rebuildOption(params: any, list: any[]) {
        this.echartsInstance.group = '';    // 解除 echarts
        const lineNum: any = [];
        const option = this.tableData;
        option.legend.selected = params.selected;
        option.legend.scrollDataIndex = this.scrollDataIndex;
        option.series.forEach((series: any) => {
            if (list.indexOf(series.name) >= 0) {
                if (lineNum.indexOf(series.name) === -1) {
                    lineNum.push(series.name);
                }
            }
        });
        setTimeout(() => {    // 异步更新数据
            this.tableData = option;
            this.echartsInstance.clear();
            this.echartsInstance.setOption(option, true);
            this.themeStyleChange();
        }, 100);
    }

    /**
     * 更新时间轴筛选
     */
    public upDateTimeLine(data: any) {
        this.option.dataZoom[0].start = data.start;
        this.option.dataZoom[0].end = data.end;
        this.echartsInstance.setOption({
            dataZoom: this.option.dataZoom
        });
    }

    /**
     * 导入数据生成canvas
     */
    public setData(timeData: any) {
        this.option.series = [];
        this.option.grid = [];
        this.option.xAxis = [];
        this.option.yAxis = [];
        this.option.dataZoom[0].start = timeData.start;
        this.option.dataZoom[0].end = timeData.end;
        this.option.dataZoom[0].xAxisIndex = this.key.map((item: any, index: any) => index);
        this.option.dataZoom[0].top = this.key.length * this.gridHeight;
        const legends: any = [];
        this.devArr.forEach((dev, dieIndex) => {
            this.spec.forEach((spec: any) => {
                if (spec.key === 'write') {
                    legends.push({
                        name: dev + '/' + spec.title,
                        icon: 'path://M0,11 L4,11 L4,8 L0,8 L0,11 Z M6,11 L10,11 L10,\
                            8 L6,8 L6,11 Z M12,11 L16,11 L16,8 L12,8 L12,11 Z',
                    });
                } else {
                    if (this.key[0].key === 'queue_depth') {
                        legends.push({ name: dev, icon: 'rect', });
                    } else {
                        legends.push({ name: dev + '/' + spec.title, icon: 'rect', });
                    }
                }
            });
        });
        this.option.legend.data = legends;
        if (this.spec.length === 0 || !this.datas.showLe) {
            this.option.legend.show = false;
        }
        this.baseTop = this.datas.showLe ? 30 : 0;
        this.key.forEach((item: any, index: any) => {
            this.option.grid.push(this.makeGrid(this.baseTop, {}));
            this.option.yAxis.push(
                this.makeYAxis(index, {
                    name: item.title,
                    max: (value: any) => {
                        if (value.max === 0 || value.max === -Infinity) {
                            $('#' + this.uuid + ' .table-y ' + ` .${item.title}`).html('1.00' + this.key[0].unit);
                            return 1;
                        } else {
                            const maxTitle = value.max * 1.5 > 1
                                ? Utils.setThousandSeparator((value.max * 1.5).toFixed(0))
                                : Utils.setThousandSeparator((value.max * 1.5));
                            $('#' + this.uuid + ' .table-y ' + ` .${item.title
                                .replace('%', 'x')
                                .replace('/', 'x')}`)
                                .html(
                                    this.domSanitizer.sanitize(SecurityContext.HTML,
                                        maxTitle + this.key[0].unit));
                            return value.max * 1.5;
                        }
                    }   // 暂时全部自动最大
                }),
            );
            if (!this.datas.showAxis) {
                this.option.xAxis.push(
                    this.makeXAxis(index, {
                        axisLabel: {
                            show: false,
                            color: 'rgba(0,0,0,0)',               // 为了symbol 使用这里的间隔策略，所以显示标签但是设置为透明
                            interval: this.time.length < 21 ? 0 : Math.floor((this.time.length / 21)),
                            formatter(value: any) { return value; }
                        }, // 坐标轴刻度标签的相关设置
                        axisPointer: {
                            show: true,
                            lineStyle: {
                                color: '#6C7280',
                                width: 1
                            }
                        }
                    })
                );
            } else {
                this.option.xAxis.push(
                    this.makeXAxis(index, {
                        axisLabel: {
                            show: false,
                            color: this.ylabelColor,
                            interval: this.time.length < 21 ? 0 : Math.floor((this.time.length / 21)),
                            formatter(value: any) { return value; }
                        }, // 坐标轴刻度标签的相关设置
                        axisPointer: { show: true, lineStyle: { color: '#6C7280', width: 1 } }
                    })
                );
            }
        });
        if (this.spec.length > 0) {// 设置series
            this.devArr.forEach((dev, ideIndex) => {
                this.key.forEach((item: any, index: any) => {
                    let colorIndex1 = 0;
                    if (this.lineColorList.length <= ideIndex) { // 如果颜色不够用
                        colorIndex1 = ideIndex % this.lineColorList.length;
                    } else {
                        colorIndex1 = ideIndex;
                    }
                    this.spec.forEach((item2: any, index2: any) => {
                        let name = dev + '/' + item2.title;
                        if (this.key[0].key === 'queue_depth') {
                            name = dev;
                        }
                        const seriesObj: any = {
                            name,
                            type: 'line',
                            symbol: 'none',
                            symbolSize: 4,
                            showAllSymbol: false,
                            xAxisIndex: index,
                            yAxisIndex: index,
                            smooth: true,
                            itemStyle: {
                                normal: {
                                    color: this.lineColorList[colorIndex1], // 折点颜色
                                },
                                color: this.lineColorList[colorIndex1]  // 折线颜色
                            },
                            lineStyle: {
                                width: 2,
                            },
                            data: this.datas.data[dev][item2.key][item.key],
                            legendHoverLink: false,
                        };
                        if (item2.key === 'write') {
                            // 关键点，为true是不支持虚线的，实线就用true
                            seriesObj.smooth = false;
                            seriesObj.itemStyle.normal.lineStyle = {
                                type: 'dashed',
                                width: 2
                            };
                        }
                        this.option.series.push(seriesObj);
                    });
                });
            });
        }
        this.makeTooltip();
        const height = this.gridHeight + this.baseTop;
        $('#' + this.uuid + ' .table-box').css({ height: height + 'px' });
        this.setLeft();
        setTimeout(() => {
            this.tableData = this.option;
            if (this.echartsInstance) {
                this.echartsInstance.clear();
                this.echartsInstance.setOption(this.tableData, true);
                this.themeStyleChange();
            }
        }, 100);
    }

    /**
     * 设置坐标系
     */
    public makeGrid(top: any, opt: any) {
        const options = {
            top,
            height: this.gridHeight,
            left: 25,
            right: 20,
        };
        if (opt) {
            Object.assign(options, opt);
        }
        return options;
    }

    /**
     * 设置X轴
     */
    public makeXAxis(gridIndex: any, opt: any) {
        const option = {
            type: 'category',
            gridIndex,
            boundaryGap: false,
            offset: 0,
            data: this.time,
            axisLine: {
                show: false,
                lineStyle: { color: this.baseColor, width: 1 }
            },
            axisTick: { show: false }, // 坐标轴刻度相关设置
            axisLabel: {
                show: false,
                color: this.ylabelColor,
                interval: this.time.length < 21 ? 0 : Math.floor((this.time.length / 21)),
                formatter(value: any) {
                    value = parseFloat(value);
                    return value.toFixed(3) + 's';
                }
            }, // 坐标轴刻度标签的相关设置
            splitLine: {
                show: true,
                lineStyle: { color: this.baseColor },
                interval: this.time.length < 300 ? 0 : Math.floor((this.time.length / 200)),
            },
            axisPointer: { lineStyle: { color: 'transparent' } }
        };
        if (option) { Object.assign(option, opt); }
        return option;
    }

    /**
     * 设置Y轴
     */
    public makeYAxis(gridIndex: any, opt: any) {
        const options = {
            type: 'value',
            show: false,
            gridIndex,
            nameLocation: 'middle',
            nameGap: 30,
            nameRotate: 0,
            offset: 0,
            nameTextStyle: {
                color: '#333'
            },
            min: (value: any) => {
                return -value.max * 1.5 * 0.025;
            },
            axisTick: { show: false },
            axisLine: { show: false },
            splitLine: {
                show: true,
            },
            // y轴刻度间隔
            splitNumber: 0.1
        };
        if (opt) {
            Object.assign(options, opt);
        }
        return options;
    }

    /**
     * 设置图表tooltip
     */
    public makeTooltip() {
        this.option.tooltip = {
            trigger: 'axis',
            borderColor: 'rgba(50,50,50,0)',
            backgroundColor: this.currTheme === this.ColorTheme.Dark ? '#424242' : '#fff',
            borderWidth: 1,
            borderRadius: 5,
            padding: [10, 20, 10, 20],
            hideDelay: 0,
            confine: true,
            alwaysShowContent: false,
            enterable: false,
            extraCssText: 'box-shadow: 0 0 3px rgba(0, 0, 0, 0.3); z-index: 1003;',
            axisPointer: {
                type: 'line',
                lineStyle: {
                    color: this.currTheme === this.ColorTheme.Dark ? '#478cf1' : '#6C7280',
                    width: 1.5
                }
            },
            textStyle: {
                color: this.currTheme === this.ColorTheme.Dark ? '#aaaaaa' : '#222222',
                fontSize: 12,
            },
            formatter: (params: any): any => {
                if (params.length) {
                    const nameArr: any = [];
                    const dataArr: any = [];
                    params.forEach((item: any, index: any) => {
                        if (nameArr.indexOf(item.seriesName) === -1) {
                            nameArr.push(item.seriesName);
                            dataArr.push(item);
                        }
                    });
                    let html = ` <div style="max-height:200px;overflow-y:auto;padding-right:5px"> `;
                    const unit = this.key[0].unit;
                    dataArr.forEach((param: any, index: any) => {
                        const ifRead = param.seriesName.indexOf('read') > -1 || param.seriesName.indexOf('读') > -1
                            ? true : false;
                        if (index === 0) {
                            html += `<p style="color:${this.currTheme === this.ColorTheme.Dark ?
                                '#E8E8E8' : '#282b33'};font-size:12px; line-height: 12px;margin-bottom:12px">
                            ${this.domSanitizer.sanitize(SecurityContext.HTML, param.axisValue)}</p>`;
                        }
                        html += `<div style="color:${this.currTheme === this.ColorTheme.Dark ?
                            '#E8E8E8' : '#282b33'};font-size:12px; line-height: 12px;
                            margin-bottom:10px;display:flex;justify-content: space-between;">
                            <div style="display:flex;align-items: center;min-width:110px">`;
                        if (ifRead || this.key[0].key === 'queue_depth') {
                            html += `<span *ngIf="ifRead"
                            style="display:block;margin-right:16px;height:3px;width:16px;background:
                                ${this.domSanitizer.sanitize(SecurityContext.HTML, param.color)}"></span>`;
                        } else {
                            html += `<span  style="display:block;margin-right:16px;">
                                <svg width="16px" height="3px" viewBox="0 0 16 3" version="1.1"
                                xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                                <g id="storage-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                                <g id="disk-0" transform="translate(-1280.000000, -276.000000)"
                                fill="${this.domSanitizer.sanitize(SecurityContext.HTML, param.color)}"
                                fill-rule="nonzero">
                                <g id="arr-2" transform="translate(1280.000000, 268.000000)">
                                <path d="M0,11 L4,11 L4,8 L0,8 L0,11 Z M6,11 L10,11 L10,
                                8 L6,8 L6,11 Z M12,11 L16,11 L16,8 L12,8 L12,11 Z"
                                id="path-20"></path></g></g></g></svg></span>`;
                        }

                        html += ` <p> ${this.domSanitizer.sanitize(SecurityContext.HTML, param.seriesName)}:</p>
                            </div>
                            <p> ${this.domSanitizer.sanitize(SecurityContext.HTML,
                            Utils.setThousandSeparator(param.data) + unit)}</p>
                        </div>
                        `;
                    });
                    html += `</div>`;
                    return html;
                }
            }
        };
    }

    /**
     * 设置左侧title
     */
    public setLeft() {
        let html = '';
        if (!this.key) { return; }
        const itemName = this.key[0].title;
        if (this.datas.showLe) {
            html += `<div class="title-box" style="height:${this.gridHeight - 2}px;
                color:${this.ylabelColor};margin-top:${this.baseTop}px;">`;
        } else {
            html += `<div class="title-box" style="height:${this.gridHeight - 2}px;color:${this.ylabelColor};">`;
        }
        html += `<span class="title-num ${itemName}"></span>
        <span class="title" style="color:${this.currTheme === this.ColorTheme.Dark ? '#e8e8e8' : '#6c7280'}">
            ${itemName}
        </span>
        <span class="title-num">0</span></div>`;
        $('#' + this.uuid + ' .table-y').html(html);
    }

    /**
     * 鼠标按下框选
     */
    public onBrush(e: any) {
        const canvasBox = this.el.nativeElement.querySelector('#' + this.uuid);
        const maskBox = this.el.nativeElement.querySelector('.mask-box');
        const brushBox = this.el.nativeElement.querySelector('.brush-box');
        // 将tips框隐藏,防止碍事
        const tootipBox = this.el.nativeElement.querySelector('.echarts-box div').nextSibling;
        // 左侧title宽度
        const leftTitleWidth = $('#' + this.uuid + ' .table-y')[0].offsetWidth;
        tootipBox.style.display = 'none';
        maskBox.style.display = 'none';
        this.brushOut.emit('click');
        brushBox.style.width = 0;
        // 只有左键按下可框选
        if (e.which !== 1) {
            return;
        }
        const anchorDot = e.clientX; // 鼠标点下原点
        // 框选框距离canvans左边框的距离
        const diffX = e.clientX - canvasBox.getBoundingClientRect().left - this.option.grid[0].left - leftTitleWidth;
        // 点击距离框选右侧距离
        const diffXR = diffX - canvasBox.offsetWidth + this.option.grid[0].left + this.option.grid[0].right;
        if (diffX < 0 || diffXR > 0) {
            return;
        }
        let rightSite = 0; // 框选右侧位置
        let leftSite = 0; // 框选左侧位置
        brushBox.style.left = diffX + 'px';

        document.onmousemove = (ev) => {
            tootipBox.style.display = 'none';
            maskBox.style.display = 'block';
            leftSite = diffX / maskBox.offsetWidth;
            brushBox.style.left = leftSite * 100 + '%';
            let mouseSite = ev.clientX;
            const diffXLMove = ev.clientX - canvasBox.getBoundingClientRect().left
                - this.option.grid[0].left - leftTitleWidth;
            const diffXRMove = ev.clientX - canvasBox.getBoundingClientRect().left
                - canvasBox.offsetWidth + this.option.grid[0].right;
            if (diffXLMove < 0) {
                mouseSite = canvasBox.getBoundingClientRect().left + this.option.grid[0].left + leftTitleWidth;
            } else if (diffXRMove > 0) {
                mouseSite = canvasBox.getBoundingClientRect().left
                    + maskBox.offsetWidth + this.option.grid[0].left + leftTitleWidth;
            }
            const disX = (mouseSite - anchorDot) / maskBox.offsetWidth;
            if (disX >= 0) {
                brushBox.style.width = disX * 100 + '%';
                rightSite = leftSite + disX;
            } else {
                const disX1 = Math.abs(disX);
                brushBox.style.width = disX1 * 100 + '%';
                brushBox.style.left = (leftSite - disX1) * 100 + '%';
                rightSite = leftSite - disX1;
            }
        };

        document.onmouseup = () => {
            this.dealBrushTime(leftSite, rightSite);
            document.onmousemove = null;
            document.onmouseup = null;
            document.onmousedown = null;
        };

    }

    /**
     * 处理框选时间
     */
    public dealBrushTime(left: number, right: number) {
        const dataNum = this.datas.time.length - 1;
        const totalTime = this.datas.time[dataNum];
        const leftTime = Number((totalTime * left).toFixed(6));
        const rightTime = Number((totalTime * right).toFixed(6));
        const brushTime = [leftTime, rightTime].sort((a, b) => {
            return a - b;
        });
        if (left !== right) {
            const data = Object.assign(this.datas, { brushTime, item: this.key[0] });
            this.brushOut.emit(data);
        }
    }


    /**
     * 取消订阅
     */
    ngOnDestroy() {
        if (this.timelineSubscribe) {
            this.timelineSubscribe.unsubscribe();
        }
    }

}
