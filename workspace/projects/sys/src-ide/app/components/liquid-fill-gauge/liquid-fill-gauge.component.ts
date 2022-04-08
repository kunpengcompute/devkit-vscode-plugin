import { AfterViewInit, Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import * as d3 from 'd3';

@Component({
    selector: 'app-liquid-fill-gauge',
    templateUrl: './liquid-fill-gauge.component.html',
    styleUrls: ['./liquid-fill-gauge.component.scss']
})
export class LiquidFillGaugeComponent implements OnInit, AfterViewInit, OnChanges {
    @Input() width: string;
    @Input() value = 0;
    // 球的颜色【与值无关】
    @Input() gaugeColor: any;

    @ViewChild('fillgauge', { static: false }) fillgauge: any;

    public gauge: any;
    // 保存gauge生成之前的changes值
    public changes: any;

    constructor() { }

    /**
     * 初始化组件
     */
    ngOnInit() { }

    /**
     * 组件视图初始化完之后
     */
    ngAfterViewInit() {
        this.gauge = this.liquidfillgauge(this.fillgauge.nativeElement, this.value, this.gaugeColor, {
            waveAnimateTime: 1000,
            circleThickness: 0.1,
            circleFillGap: 0.15,
        });

        if (this.changes) {
            this.undateChanges(this.changes);
        }
    }

    /**
     * 监控父组件参数的变化
     */
    ngOnChanges(changes: SimpleChanges): void {
        if (this.gauge) {
            this.undateChanges(changes);
        } else {
            this.changes = changes;
        }
    }

    /**
     * 更新数据
     */
    public undateChanges(changes: any) {
        if (changes.value !== undefined) {
            this.gauge.updateValue(changes.value.currentValue);
        }
        if (changes.gaugeColor !== undefined) {
            this.gauge.updateGaugeColor(changes.gaugeColor.currentValue);
        }
    }

    /**
     * liquidfillgauge
     */
    public liquidfillgauge(element: any, value: any, gaugeColor: any, settings: any) {
        // Handle configuration
        const defaultConfig: any = {
            minValue: 0,
            maxValue: 100,

            // Styles
            // 外圆厚度占半径的百分比
            circleThickness: 0.05,
            // 外圆和内部的波形园之间的间隙大小，以外圆半径的百分比表示。
            circleFillGap: 0.05,
            // 背景颜色
            backgroundColor: null,
            // 如果插件没有正确检测到宽度和高度，您可能希望设置宽度和高度
            width: 0,
            height: 0,

            // Waves

            // 波高占波形园的百分比
            waveHeight: 0.05,
            // 波的个数
            waveCount: 1,
            // 多层波时的偏移量。0=无偏移。1 = 1个满波的偏移。
            waveOffset: 0,

            // Animations

            // 控制波是否应从0升至其全高，或从其全高开始
            waveRise: true,
            // 波从0上升到最终高度的时间（以毫秒为单位）
            waveRiseTime: 1000,
            // 如果设置为false，且waveRise为true，则仅禁用初始动画
            waveRiseAtStart: true,
            // 控制波是滚动还是静止
            waveAnimate: true,
            // 全波进入波圈的时间（毫秒）.
            waveAnimateTime: 18000,
            // 在低填充百分比和高填充百分比下控制波形大小缩放。
            // 当为真时，波浪高度在50%填充时达到最大值，在0%和100%填充时达到最小值。
            // 这有助于防止波使波圈在接近其最小或最大填充时显得完全满或空.
            waveHeightScaling: true,
            // 如果为true，则显示的值在加载和更新时从0开始计数到最终值。如果为false，则显示最终值.
            valueCountUp: true,
            // 如果设置为false，且valueCountUp为true，则仅禁用初始动画
            valueCountUpAtStart: true,
        };
        const idGenerator = (() => {
            let count = 0;
            return (prefix: any) => {
                return prefix + '-' + count++;
            };
        })();

        const config: Map<string, any> = new Map(Object.entries(defaultConfig));
        new Map(Object.entries(settings)).forEach((val: any, key: any) => config.set(key, val));

        const gauge = d3.select(element);

        value = Math.max(config.get('minValue'), Math.min(config.get('maxValue'), value));
        const width = config.get('width') !== 0 ? config.get('width') : parseInt(gauge.style('width'), 10);
        const height = config.get('height') !== 0 ? config.get('height') : parseInt(gauge.style('height'), 10);
        const radius = Math.min(width, height) / 2;
        const locationX = width / 2 - radius;
        const locationY = height / 2 - radius;
        const fillPercent =
          Math.max(
            config.get('minValue'),
            Math.min(config.get('maxValue'), value)
          ) / config.get('maxValue');

        let waveHeightScale;
        if (config.get('waveHeightScaling')) {
            waveHeightScale = d3.scaleLinear()
                .range([0, config.get('waveHeight'), 0])
                .domain([0, 50, 100]);
        } else {
            waveHeightScale = d3.scaleLinear()
                .range([config.get('waveHeight'), config.get('waveHeight')])
                .domain([0, 100]);
        }

        const circleThickness = config.get('circleThickness') * radius;
        const circleFillGap = config.get('circleFillGap') * radius;
        const fillCircleMargin = circleThickness + circleFillGap;
        const fillCircleRadius = radius - fillCircleMargin;
        const waveHeight = fillCircleRadius * waveHeightScale(fillPercent * 100);

        const waveLength = fillCircleRadius * 2 / config.get('waveCount');
        const waveClipCount = 1 + config.get('waveCount');
        const waveClipWidth = waveLength * waveClipCount;

        // Data for building the clip wave area.
        const data = [];
        for (let i = 0; i <= 40 * waveClipCount; i++) {
            data.push({
                x: i / (40 * waveClipCount),
                y: (i / (40))
            });
        }

        // Scales for controlling the position of the clipping path.
        const waveRiseScale = d3.scaleLinear()
            // The clipping area size is the height of the fill circle + the wave height, so we position the clip wave
            // such that the it will won't overlap the fill circle at all when at 0%, and will totally cover the fill
            // circle at 100%.
            .range([(fillCircleMargin + fillCircleRadius * 2 + waveHeight), (fillCircleMargin - waveHeight)])
            .domain([0, 1]);
        const waveAnimateScale = d3.scaleLinear()
            .range([0, waveClipWidth - fillCircleRadius * 2])
            .domain([0, 1]);

        // Center the gauge within the parent
        const gaugeGroup = gauge.append('g')
            .attr('transform', 'translate(' + locationX + ',' + locationY + ')');

        // Draw the background circle
        if (config.get('backgroundColor')) {
            gaugeGroup.append('circle')
                .attr('r', radius)
                .style('fill', config.get('backgroundColor'))
                .attr('transform', 'translate(' + radius + ',' + radius + ')');
        }

        // Draw the outer circle.
        const gaugeCircleX = d3.scaleLinear().range([0, 2 * Math.PI]).domain([0, 1]);
        const gaugeCircleY = d3.scaleLinear().range([0, radius]).domain([0, radius]);
        const gaugeCircleArc = d3.arc()
            .startAngle(gaugeCircleX(0)).endAngle(gaugeCircleX(1))
            .outerRadius(gaugeCircleY(radius)).innerRadius(gaugeCircleY(radius - circleThickness));

        gaugeGroup.append('path')
            .attr('d', gaugeCircleArc)
            .attr('transform', 'translate(' + radius + ',' + radius + ')');

        // The clipping wave area.
        const waveScaleX = d3.scaleLinear().range([0, waveClipWidth]).domain([0, 1]);
        const waveScaleY = d3.scaleLinear().range([0, waveHeight]).domain([0, 1]);
        const clipArea: any = d3.area()
            .x((d: any) => waveScaleX(d.x))
            .y0((d: any) => waveScaleY(Math.sin(Math.PI * 2 * config.get('waveOffset')
                * -1 + Math.PI * 2 * (1 - config.get('waveCount')) + d.y * 2 * Math.PI)))
            .y1((d: any) => fillCircleRadius * 2 + waveHeight);

        const gaugeGroupDefs = gaugeGroup.append('defs');

        const clipId = idGenerator('clipWave') + Math.random() + Date.now();
        const waveGroup = gaugeGroupDefs
            .append('clipPath')
            .attr('id', clipId);
        const wave = waveGroup.append('path')
            .datum(data)
            .attr('d', clipArea);

        // The inner circle with the clipping wave attached.
        const fillCircleGroup = gaugeGroup.append('g')
            .attr('clip-path', 'url(#' + clipId + ')');
        fillCircleGroup.append('circle')
            .attr('cx', radius)
            .attr('cy', radius)
            .attr('r', fillCircleRadius);

        const waveGroupXPosition = fillCircleMargin + fillCircleRadius * 2 - waveClipWidth;

        if (config.get('waveAnimate')) {
            const animateWave = () => {
                wave.transition()
                    .duration(config.get('waveAnimateTime'))
                    .ease(d3.easeLinear)
                    .attr('transform', 'translate(' + waveAnimateScale(1) + ',0)')
                    .on('end', () => {
                        wave.attr('transform', 'translate(' + waveAnimateScale(0) + ',0)');
                        animateWave();
                    });
            };
            animateWave();
        }

        const updateValue = (fromValue: any, newValue: any) => {
            newValue = Math.max(config.get('minValue'), Math.min(config.get('maxValue'), newValue));
            const toPercent = newValue / config.get('maxValue');

            if (config.get('waveRise') && config.get('waveRiseAtStart')) {
                const fromPercent = fromValue / config.get('maxValue');

                waveGroup.attr('transform', 'translate(' + waveGroupXPosition + ',' + waveRiseScale(fromPercent) + ')')
                    .transition()
                    .duration(config.get('waveRiseTime'))
                    .attr('transform', 'translate(' + waveGroupXPosition + ',' + waveRiseScale(toPercent) + ')');
            } else {
                waveGroup.attr('transform', 'translate(' + waveGroupXPosition + ',' + waveRiseScale(toPercent) + ')');
            }

            value = newValue;
        };

        const updateGaugeColor = (fromGaugeColor: any, newGaugeColor: any) => {
            if (config.get('waveRise') && config.get('waveRiseAtStart')) {
                gaugeGroup.style('fill', fromGaugeColor)
                    .transition()
                    .duration(config.get('waveRiseTime'))
                    .style('fill', newGaugeColor);

                fillCircleGroup.style('fill', fromGaugeColor)
                    .transition()
                    .duration(config.get('waveRiseTime'))
                    .style('fill', newGaugeColor);
            } else {
                gaugeGroup.style('fill', newGaugeColor);
                fillCircleGroup.style('fill', newGaugeColor);
            }

            gaugeColor = newGaugeColor;
        };

        updateValue(config.get('valueCountUp') ? config.get('minValue') : value, value);
        updateGaugeColor(gaugeColor, gaugeColor);

        gauge.on('destroy', () => {
            // Stop all the transitions
            waveGroup.interrupt().transition();
            wave.interrupt().transition();

            // Unattach events
            gauge.on('destroy', null);
        });

        function GaugeUpdater() {
            this.updateValue = (newValue: any) => updateValue(value, newValue);
            this.updateGaugeColor = (newGaugeColor: any) => updateGaugeColor(gaugeColor, newGaugeColor);
        }

        return new (GaugeUpdater as any)();
    }
}
