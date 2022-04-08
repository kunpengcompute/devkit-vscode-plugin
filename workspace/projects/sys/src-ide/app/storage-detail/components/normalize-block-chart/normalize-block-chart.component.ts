import {
    Component, ElementRef, EventEmitter, HostListener, Input,
    OnInit, Output, Renderer2, ViewChild, AfterViewInit, AfterViewChecked, ChangeDetectionStrategy
} from '@angular/core';
import * as d3 from 'd3';
import { NormalizeBlockData, POIBlockData } from '../normalize-block/domain';
import { COLOR_THEME, isLightTheme } from './../../../service/vscode.service';
import { HyTheme, HyThemeService } from 'hyper';

type ChartData = [
    {
        time: any,
        [key: string]: {
            value: number,
            percent: number,
        }
    }
];


/**
 * 渲染归一化堆叠式柱形图
 * @input rawData 渲染所需的数据
 * @input colors 数据对应的色块
 * @usageNotes 希望被放在一个具有任意宽高的盒子中，图形会在充满盒子的空间，并在窗口变化时重新适应盒子尺寸的变化
 */
@Component({
    selector: 'app-normalize-block-chart',
    template: '<div #d3Container (mouseleave)="blockMouseleave.emit();" style="height: 100%; width: 100%;"></div>',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NormalizeBlockChartComponent implements OnInit, AfterViewInit, AfterViewChecked {
    @ViewChild('d3Container', { read: ElementRef, static: true }) d3Container: ElementRef;
    /** 输入数据 */
    @Input()
    set rawData(val: NormalizeBlockData) {
        this.rawDataCopy = val;
        if (this.doneRender) {
            this.currentNode = this.load(this.d3Container.nativeElement, val, this.currentNode);
        }
    }
    get rawData() {
        return this.rawDataCopy;
    }
    /** 色块字典 */
    @Input() colors: { [key: string]: string };
    /** 颜色主题 */
    @Input() currTheme: any;
    /** emit 事件 */
    @Output() blockMouseenter = new EventEmitter<POIBlockData>();
    /** emit 事件 */
    @Output() blockMouseleave = new EventEmitter<void>();
    private rawDataCopy: NormalizeBlockData;
    /** 图形容器的选择器 */
    private containerSelection: JQuery;
    /** 状态记录 */
    private prevClientWidth = 0;
    /** 是否渲染 */
    private doneRender = false;
    /** 防抖计时器 */
    private resizeTimer: any = null;
    /** 当前挂载中svg的节点 */
    private currentNode: any = null;
    public fillColor = '#8a4f18';

    constructor(
        private renderer2: Renderer2,
        private themeServe: HyThemeService
    ) { }

    /**
     * 初始化
     */
    ngOnInit() {
        if (isLightTheme) {
            this.currTheme = COLOR_THEME.Light;
            this.fillColor = this.currTheme === COLOR_THEME.Light ? '#AD4E00' : '#8a4f18';
        }
        this.themeServe.subscribe((msg: HyTheme) => {
            this.currTheme = msg === 'light' ? COLOR_THEME.Light : COLOR_THEME.Dark;
            this.fillColor = msg === 'light' ? '#AD4E00' : '#8a4f18';
            this.containerSelection?.empty();
            this.currentNode = this.load(this.d3Container.nativeElement, this.rawData, this.currentNode);
        });
    }

    /**
     * 当浏览器窗口发生尺寸改变时，当图形渲染过之后，根据窗口尺寸，重新渲染
     */
    @HostListener('window:resize')
    onResize() {
        if (!this.doneRender) { return; }
        if (this.containerSelection.width() === this.prevClientWidth) { return; }
        clearTimeout(this.resizeTimer);
        this.resizeTimer = setTimeout(() => {
            this.currentNode = this.load(this.d3Container.nativeElement, this.rawData, this.currentNode);
        }, 100);
    }

    /**
     * 初始化图形容器的选择器
     */
    ngAfterViewInit() {
        this.containerSelection = $(this.d3Container.nativeElement);
    }

    /**
     * 监控视图变化————应对display: none下的取不到DOM的宽高
     */
    ngAfterViewChecked(): void {
        if (this.prevClientWidth === 0 && this.containerSelection.width() > 0) { // 渲染的必要条件: 视图突变
            if (this.doneRender) { return; }
            this.currentNode = this.load(this.d3Container.nativeElement, this.rawData, this.currentNode);
            this.doneRender = true;
        }
        this.prevClientWidth = this.containerSelection.width(); // 在判断之后，将经过判断的值暂存
    }

    /**
     * 挂载节点
     * @param containerNode 容器节点
     * @param rawData 传入数据
     * @param unloadNode 即将被卸载的节点, 第一次挂载可为空
     */
    private load(
        containerNode: Element, rawData: NormalizeBlockData, unloadNode: Element | null
    ): Element {
        if (rawData == null) { return void 0; }
        // 转换数据
        const { data, columns } = this.transform(rawData);
        // 删除就节点
        if (unloadNode != null) {
            this.renderer2.removeChild(containerNode, unloadNode);
        }
        // 生成新节点
        const svgNode = this.render(containerNode, data, columns, this.colors);
        // 挂载新节点
        this.renderer2.appendChild(containerNode, svgNode);
        // 返回新节点
        return svgNode;
    }

    /**
     * 图表渲染
     * @param hostElement 挂载点
     * @param rawData 原始数据
     * @
     * @param color 色块对照表
     */
    private render(
        hostElement: Element, data: ChartData | any, columns: string[], color: { [key: string]: string }
    ): SVGSVGElement {
        const that = this;
        // FIXME
        color.All = this.currTheme === COLOR_THEME.Dark ? '#fff2e4' : 'rgba(173,78,0,0.1)';
        const thisSelf: NormalizeBlockChartComponent = this;
        const width = $(hostElement).width();
        const height = $(hostElement).height();
        const margin = { top: 0, right: 0, bottom: 0, left: 0 };
        if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
            const startCol = columns[0];
            const endCol = columns[columns.length - 1];
            columns = columns.slice(1, columns.length - 1).sort((a, b) => {
                const aStr = a.split('-')[0];
                const bStr = b.split('-')[0];
                const aNum = Number(aStr.substring(0, aStr.indexOf('KB')));
                const bNum = Number(bStr.substring(0, bStr.indexOf('KB')));
                return aNum - bNum;
            });
            columns.unshift(startCol);
            columns.push(endCol);
        }

        const seriesBuilder = d3.stack()
            .keys(columns.slice(1))
            .value((v: any, k: any) => v[k].percent);
        const series = seriesBuilder(data).map(b => {
            b.forEach((w: any) => {
                w.key = b.key;
            });
            return b;
        });
        const x = d3.scaleBand()
            .domain(data.map((d: any) => d.time))
            .range([margin.left, width - margin.right])
            .padding(0.001);
        const y = d3.scaleLinear()
            .domain([0, d3.max(series, d => d3.max(d, dd => dd[1]))])
            .rangeRound([height - margin.bottom, margin.top]);
        const formatValue = (val: any) => isNaN(val) ? 'N/A' : val.toString();
        const svg = d3.create('svg')
            .attr('viewBox', [0, 0, width, height].toString())
            .attr('width', width)
            .attr('height', height);
        svg.append('g')
            .selectAll('g')
            .data(series)
            .join('g')
            .attr('fill', ((d) => {
                return color[d.key];
            })).selectAll('rect')
            .data(d => d)
            .join('rect')
            .attr('x', (d: any, i) => x(d.data.time))
            .attr('y', d => y(d[1]))
            .attr('height', d => y(d[0]) - y(d[1]))
            .attr('width', x.bandwidth())
            .on('mouseenter', function f(event, d: any) {
                const domRect: DOMRectReadOnly = (this as any).getBoundingClientRect();
                const poiBlock: POIBlockData = {
                    domRect,
                    data: {
                        key: d.key,
                        time: d.data.time,
                        value: d.data[d.key].value,
                        percent: d.data[d.key].percent,
                    }
                };
                thisSelf.blockMouseenter.emit(poiBlock);
                d3.select(this)
                    .attr('fill', that.fillColor);
            })
            .on('mouseleave', function f(event, d: any) {
                thisSelf.blockMouseleave.emit();
                d3.select(this).attr('fill', color[d.key]);
            });

        return svg.node();
    }

    /**
     * 原始数据 => 渲染数据
     * @param rawData 原始数据
     * @returns 渲染数据
     *
     * 原始数据：
     * {
     *   time: [0, 1, 2],
     *   data: {
     *     '0kb-8kb': [1, 3, 7],
     *     '8kb-16kb': [7, 3, 1],
     *     '16kb-32kb': [1, 7, 3],
     *   },
     * }
     *
     * TO
     *
     * 渲染数据：
     * {
     *   data: [
     *     {
     *      time: 0, 0kb-8kb:
     *          {value: 1, percent: 10,}, 8kb-16kb: {value: 7, percent: 70,}, 16kb-32kb: {value: 1, percent: 10,},},
     *     {
     *      time: 1, 0kb-8kb:
     *          {value: 3, percent: 30,}, 8kb-16kb: {value: 3, percent: 30,}, 16kb-32kb: {value: 7, percent: 70,},},
     *     {
     *      time: 2, 0kb-8kb:
     *          {value: 7, percent: 70,}, 8kb-16kb: {value: 1, percent: 10,}, 16kb-32kb: {value: 3, percent: 30,},},
     *   ],
     *   columns: [
     *     'time',
     *     '0kb-8kb',
     *     '8kb-16kb',
     *     '16kb-32kb',
     *   ],
     * }
     */
    private transform(rawData: NormalizeBlockData): { data: ChartData, columns: string[] } {
        // FIXME 填充空白
        rawData.data.All = new Array(100).toString().split(',').map(() => 0.000001);
        const data: any = [];
        const columns: string[] = ['time'].concat(Object.keys(rawData.data));
        for (let i = 0; i < rawData.time.length; i++) {
            const time = rawData.time[i];
            const tmp: any = { time };
            let sum = 0;
            const rawKeys = Object.keys(rawData.data);
            for (const key of rawKeys) {
                const value = rawData.data[key];
                sum += value[i];
            }
            for (const key of rawKeys) {
                const value = rawData.data[key];
                tmp[key] = {
                    percent: (value[i] / sum * 100),
                    value: value[i],
                };
            }
            data.push(tmp);
        }

        return { data, columns };
    }
}
