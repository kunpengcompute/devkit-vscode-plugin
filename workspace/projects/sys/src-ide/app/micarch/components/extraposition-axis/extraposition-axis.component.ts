import {
    Component, AfterViewInit, Input,
    Output, EventEmitter, ElementRef, OnDestroy, ChangeDetectorRef, AfterViewChecked
} from '@angular/core';
import * as d3 from 'd3';

@Component({
    selector: 'app-extraposition-axis',
    templateUrl: './extraposition-axis.component.html',
    styleUrls: ['./extraposition-axis.component.scss']
})
export class ExtrapositionAxisComponent implements AfterViewInit, OnDestroy, AfterViewChecked {
    // 输入参数：
    // 1. 坐标数据
    public optionCopy: {
        domain: [number, number],
        format?: (d: number) => string,
        tickNum?: number,
    };
    // 监测传入数据，设置时间轴
    @Input()
    set option(val) {
        this.optionCopy = val;
        if (this.optionCopy != null && Object.keys(this.optionCopy).length > 0) {
            this.rerenderAxisAction();
        }
    }
    get option() {
        return this.optionCopy;
    }
    // 2. 输入的“热点”区域的范围
    @Input()
    set hotspotDomain(val: [number, number]) {
        if (!val || !this.currentHotspotDomain || val.length !== 2 || this.currentHotspotDomain.length !== 2) {
            return;
        }
        if (Math.abs(val[0] - this.currentHotspotDomain[0]) < 0.000001
            && Math.abs(val[1] - this.currentHotspotDomain[1]) < 0.000001) {
            return;
        }
        this.currentHotspotDomain = val;
        this.renderHotspotAction();
    }

    // 事件触发器   时间轴偏移事件
    @Output() axisTransform = new EventEmitter<[number, number]>();

    // 原始坐标轴的比例尺(作为参考)
    public originalAxisScale: any;
    // 当前的"热点"区域的范围
    public currentHotspotDomain: [number, number];
    // 当前是事件的执行者
    public currentEventExecutor: 'vernier' | 'hotspot';
    // 与样式值保持一致
    public tickFontSize = '12px';
    // 游标拖动时，“热点”区域的最小宽度的限制
    public minRnageLimit = 30; // 单位 （px）
    // tick 间隔得范围
    public tickIntervalRange = { intervalMin: 50, intervalMax: 100 }; // 单位 px
    // tick 数值和位置信息
    public tickInfoList: Array<{ value: string, offset: number }> = [];
    // 防抖
    public debounceTimer: any;
    public viewChangeDebounceTimer: any;

    // 选择器
    public boxSelection: JQuery;
    public hotspotSelection: JQuery;
    public vernierLeftSelection: JQuery;
    public vernierRightSelection: JQuery;

    // box 的宽度
    public currentBoxWidth: number;
    public prevBoxWidth: number;

    // 设置“热点”区域的方法，用于控制设置时机
    private renderHotspotAction = () => { };

    // 卸载绑定事件, 用于记录绑定事件的操作
    private offEventAction = () => { };

    // 重设时间轴，用于控制重设时机
    private rerenderAxisAction = () => { };

    constructor(
        private el: ElementRef,
        private cdr: ChangeDetectorRef
    ) { }

    /**
     * ngAfterViewInit
     */
    ngAfterViewInit(): void {
        // 1. 设置可操作元素的选择器
        this.boxSelection = $(this.el.nativeElement.querySelector('#extraposition-axis-box'));
        this.hotspotSelection = $(this.el.nativeElement.querySelector('#extraposition-axis-hotspot'));
        this.vernierLeftSelection = $(this.el.nativeElement.querySelector('#extraposition-axis-vernier-left'));
        this.vernierRightSelection = $(this.el.nativeElement.querySelector('#extraposition-axis-vernier-right'));

        this.rerenderAxisAction = () => {
            if (this.optionCopy != null && Object.keys(this.optionCopy).length > 0) {
                // 2. 获取box的宽度
                this.currentBoxWidth = this.boxSelection.width();
                this.currentHotspotDomain = [Math.min(...this.option.domain), Math.max(...this.option.domain)];

                // 3. 设置游标相关事件, 设置“热点区域”相关事件
                this.attachVernierEvent(this.vernierLeftSelection, this.vernierRightSelection);
                const hotEventOff: () => void = this.attachHotspotEvent(this.hotspotSelection);
                this.offEventAction = () => {
                    hotEventOff();
                };

                // 4. 设置 原始比例尺 和 初始 “热点区域” 范围
                this.originalAxisScale = d3.scaleLinear()
                    .range([0, this.currentBoxWidth]) // 图表尺寸（单位：px）
                    .domain(this.currentHotspotDomain);
                // 5. 设置 “热点区域” 的方法
                this.renderHotspotAction = () => { this.renderHotspot(this.currentHotspotDomain); };
                this.renderHotspotAction();

                // 6. 设置坐标轴的 tick 的数据
                this.setTickInfoList(this.option);
            }
        };
        this.rerenderAxisAction();
    }

    /**
     * 监控视图变化
     */
    ngAfterViewChecked(): void {
        if (this.boxSelection) {
            if (this.currentBoxWidth === 0 && this.boxSelection.width() > 0) { // 渲染的必要条件: 视图突变
                this.currentBoxWidth = this.boxSelection.width();
                this.rerenderAxisAction();
            } else if (this.prevBoxWidth > 0
                && this.boxSelection.width() > 0
                && this.prevBoxWidth !== this.boxSelection.width()) {
                this.currentBoxWidth = this.boxSelection.width();
                // 防抖
                clearTimeout(this.viewChangeDebounceTimer);
                this.viewChangeDebounceTimer = setTimeout(() => {
                    this.rerenderAxisAction();
                }, 100);
            }
            this.prevBoxWidth = this.boxSelection.width(); // 在判断之后，将经过判断的值暂存
        }
    }

    /**
     * it is ngOnDestroy
     */
    ngOnDestroy(): void {
        this.offEventAction();
    }

    /**
     * 绑定 “游标” 平移的相关事件； 计算平移的数据； 渲染 “热点区域” 的位置，并触发 axisTransform 事件
     * @param vLeftSlection 左边 “游标” 的DOM的选择器
     * @param vRightSelection 右边边 “游标” 的DOM的选择器
     */
    public attachVernierEvent(vLeftSlection: JQuery, vRightSelection: JQuery) {
        // 设置事件，目的是动态设置游标移动和制止的判断标志
        let isMouseDown = false; // 判断标志：是否在两个“游标”上激发 mousedown 事件
        let mousedownTag: 'left' | 'right' | ''; // 判断标志：具体在哪个“游标”上激发 mousedown 事件
        vLeftSlection.on('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.currentEventExecutor = 'vernier';
            isMouseDown = true;
            mousedownTag = 'left';
        });
        vRightSelection.on('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.currentEventExecutor = 'vernier';
            isMouseDown = true;
            mousedownTag = 'right';
        });
        this.boxSelection.on('mouseleave mouseup', (e) => {
            e.preventDefault();
            if (this.currentEventExecutor === 'vernier') {
                isMouseDown = false;
                mousedownTag = '';
            }
        });

        const boxOffLeft = this.boxSelection.offset().left;
        // 处理mousemove事件的数据
        this.boxSelection.on('mousemove', (evt) => {
            if (this.currentEventExecutor !== 'vernier') {
                return;
            }
            if (!isMouseDown) {
                return;
            }
            const pointerX = evt.clientX - boxOffLeft;
            const hotspotRangeLeft = this.originalAxisScale(this.currentHotspotDomain[0]);
            const hotspotRangeRight = this.originalAxisScale(this.currentHotspotDomain[1]);

            if (mousedownTag === 'left') {
                if (pointerX >= 0 && pointerX <= (hotspotRangeRight - this.minRnageLimit)) { // 游标移动范围限制
                    this.currentHotspotDomain = [this.originalAxisScale.invert(pointerX), this.currentHotspotDomain[1]];
                    this.axisTransform.emit(this.currentHotspotDomain);
                    this.renderHotspotByRange([pointerX, hotspotRangeRight]);
                }
            } else if (mousedownTag === 'right') {
                if (pointerX >= (hotspotRangeLeft + this.minRnageLimit)
                    && pointerX <= this.currentBoxWidth) { // 游标移动范围限制
                    this.currentHotspotDomain = [this.currentHotspotDomain[0], this.originalAxisScale.invert(pointerX)];
                    this.axisTransform.emit(this.currentHotspotDomain);
                    this.renderHotspotByRange([hotspotRangeLeft, pointerX]);
                }
            }
        });

        return () => { };
    }

    /**
     * 绑定 “热点区域” 平移的相关事件； 计算平移的数据； 渲染 “热点区域” 的位置，并触发 axisTransform 事件
     * @param hotSelection “热点区域” 的DOM的选择器
     */
    public attachHotspotEvent(hotSelection: JQuery): () => void {
        let prevClientX;

        // 设置事件，目的是动态设置游标移动和制止的判断标志
        let isMouseDown = false; // 判断标志：是否在“热点”区域上激发 mousedown 事件
        hotSelection.on('mousedown', (evt) => {
            evt.preventDefault();
            evt.stopPropagation();
            this.currentEventExecutor = 'hotspot';
            isMouseDown = true;
        });

        const muoseupHandler = (evt) => {
            evt.preventDefault();
            if (this.currentEventExecutor === 'hotspot') {
                isMouseDown = false;
                prevClientX = undefined;
            }
        };
        $(document).on('mouseup', muoseupHandler);

        // 处理mousemove事件的数据
        const mousemoveHandler = (evt) => {
            evt.preventDefault();
            if (this.currentEventExecutor !== 'hotspot') {
                return;
            }
            if (!isMouseDown) {
                return;
            }
            const nowClientX = evt.clientX;
            const progress = nowClientX - (prevClientX == null ? nowClientX : prevClientX);
            const hotRangeLeft = this.originalAxisScale(this.currentHotspotDomain[0]);
            const hotRangeRight = this.originalAxisScale(this.currentHotspotDomain[1]);

            // 限制数据范围
            let veryProgress = progress;
            if (hotRangeLeft + progress < 0) {
                veryProgress = 0 - hotRangeLeft;
            }
            if (hotRangeRight + progress > this.currentBoxWidth) {
                veryProgress = this.currentBoxWidth - hotRangeRight;
            }
            const nowHotRange = [hotRangeLeft + veryProgress, hotRangeRight + veryProgress];
            this.currentHotspotDomain = [
                this.originalAxisScale.invert(nowHotRange[0]),
                this.originalAxisScale.invert(nowHotRange[1]),
            ];
            this.axisTransform.emit(this.currentHotspotDomain);
            this.renderHotspotByRange(nowHotRange);
            prevClientX = nowClientX;
        };
        $(document).on('mousemove', mousemoveHandler);

        return () => {
            $(document).off('mouseup', muoseupHandler);
            $(document).off('mousemove', mousemoveHandler);
        };
    }

    private renderHotspot(domain) {
        if (domain[1] - domain[0] <= 0) {
            return;
        }
        if (!this.originalAxisScale) {
            return;
        }
        const hotLeft = this.originalAxisScale(domain[0]);
        const hotRight = this.originalAxisScale(domain[1]);
        this.hotspotSelection.css({ width: hotRight - hotLeft, left: hotLeft });
    }

    private renderHotspotByRange(range) {
        if (range[1] - range[0] <= 0) {
            return;
        }
        if (!this.originalAxisScale) {
            return;
        }
        this.hotspotSelection.css({ width: range[1] - range[0], left: range[0] });
    }

    private setTickInfoList(option) {
        const { domain, format } = option;
        const maxTickStr = format == null ? domain[1].toString() : format(domain[1]).toString();
        const maxTickWidth = this.calculateTextWidth(maxTickStr, { fontSize: this.tickFontSize });

        const { intervalMin, intervalMax } = this.tickIntervalRange;
        const limit: [number, number] = [
            this.currentBoxWidth / (maxTickWidth + intervalMax),
            this.currentBoxWidth / (maxTickWidth + intervalMin),
        ];
        const tickDomainList = this.calcOptimalTickList(domain, limit);

        const tickPosList = tickDomainList.map(item => {
            const tmp = { value: format(item), offset: this.originalAxisScale(item) };
            return tmp;
        });
        const tickStart = tickPosList[0];
        const tickEnd = tickPosList[tickPosList.length - 1];
        let tickStartTextWidth: number;
        let tickEndTextWidth: number;
        if (tickStart) {
            tickStartTextWidth = this.calculateTextWidth(tickStart.value, { fontSize: this.tickFontSize });
            tickEndTextWidth = this.calculateTextWidth(tickEnd.value, { fontSize: this.tickFontSize });
            if ((tickStart.offset - tickStartTextWidth / 2) < 0) {
                tickPosList.shift();
            }

            if ((tickEnd.offset + tickEndTextWidth / 2) > this.currentBoxWidth) {
                tickPosList.pop();
            }
        }

        this.tickInfoList = tickPosList;
        this.cdr.detectChanges();
    }

    private calcOptimalTickList(domain: [number, number], limit: [number, number]): number[] {
        const stepLen = calcOptimalSteplen(domain, limit);

        const rawOrigin = domain[0];
        const tmp = rawOrigin - (rawOrigin % stepLen);
        const comOrigin = rawOrigin > 0 ? tmp + stepLen : tmp;

        const tickList = [];
        let tick = comOrigin;
        while (tick < domain[1]) {
            tickList.push(tick);
            tick += stepLen;
        }
        return tickList;

        function calcOptimalSteplen(doma: [number, number], lim: [number, number]): number {
            const valLen = doma[1] - doma[0];
            const raw = valLen / ((lim[1] + lim[0]) / 2);
            const comMoreList = calcCompleteMore(raw);

            for (const item of comMoreList) {
                const fraction = valLen / item;
                if (lim[0] <= fraction && lim[1] >= fraction) {
                    return item;
                }
            }
            return raw;
        }

        function calcCompleteMore(val: number): number[] {
            const BOUNDARY = 1000000;
            const num = Math.trunc(val * BOUNDARY);
            const len = num.toString().length;

            const comList = [];

            for (let i = len - 1; i > 0; i--) {
                const base = Math.pow(10, i);
                const ceil = Math.ceil(num / base) * base;
                const floor = Math.floor(num / base) * base;
                const average = (ceil + floor) / 2;

                comList.push(ceil / BOUNDARY);
                comList.push(floor / BOUNDARY);
                comList.push(average / BOUNDARY);
            }
            return comList;
        }
    }

    /**
     * 计算并返回一段文本在dom中的宽度
     * @param text 文本
     * @param font 文本样式
     */
    private calculateTextWidth(text: string, font: { fontSize: string, fontFamily?: string, }): number {
        const element = document.createElement('div');
        const textNode = document.createTextNode(text);

        element.appendChild(textNode);
        element.style.fontSize = font.fontSize || '14px';
        element.style.fontFamily = font.fontFamily || 'unset';
        element.style.position = 'absolute';
        element.style.visibility = 'hidden';
        element.style.height = 'auto';
        element.style.left = '-999px';
        element.style.top = '-999px';

        document.body.appendChild(element);
        const textWidth = element.offsetWidth;
        element.parentNode.removeChild(element);
        return textWidth;
    }
}
