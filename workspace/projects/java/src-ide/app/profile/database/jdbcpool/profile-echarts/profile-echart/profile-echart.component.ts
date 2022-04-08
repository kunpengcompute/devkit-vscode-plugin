import { Component, OnInit, Input } from '@angular/core';
import { I18nService } from '../../../../../service/i18n.service';
import * as echarts from 'echarts/core';

@Component({
    selector: 'app-profile-echart',
    templateUrl: './profile-echart.component.html',
    styleUrls: ['./profile-echart.component.scss']
})
export class ProfileEchartComponent implements OnInit {

    constructor(
        public i18nService: I18nService,
    ) {
        this.i18n = this.i18nService.I18n();
    }
    @Input() datas: any;
    @Input() startDate: any;
    @Input() updateOptions: any;
    public i18n: any;
    public data: any[] = [];
    public dataCount = 10;
    public startTime = +new Date();
    public categories = [
        '8134', '3654', '6535', '2545', '5347', '65762', '2578',
        '74562', '6578', '64578', '37863', '3785', '87567', '28578',
        '67857', '6578', '64578', '37863', '5393', '5392', '5391', '5390'
    ];
    public types = [
        { name: '持续时间(毫秒)', color: '#75d874' },
    ];
    public echartsOption: any;

    /**
     * 组件初始化
     */
    ngOnInit() {
        this.initEchart();
    }

    /**
     * Echart初始化
     */
    public initEchart() {
        const chart = document.getElementById('main');
        const myChart = (echarts as any).init(chart);
        // Generate mock data
        (echarts as any).util.each(this.categories, (category: any, index: number) => {
            let baseTime = this.startTime;
            for (let i = 0; i < this.dataCount; i++) {
                const typeItem =
                this.types[Math.round(window.crypto.getRandomValues(new Uint32Array(1))[0] * (this.types.length - 1))];
                const duration = Math.round(window.crypto.getRandomValues(new Uint32Array(1))[0]);
                this.data.push({
                    name: typeItem.name,
                    value: [
                        index,
                        baseTime,
                        baseTime += duration,
                        duration
                    ],
                    itemStyle: {
                        normal: {
                            color: typeItem.color
                        }
                    }
                });
                baseTime += Math.round(window.crypto.getRandomValues(new Uint32Array(1))[0] * 2000);
            }
        });
        const option = {
            tooltip: {
                borderWidth: 0,
                formatter: (params: any) => {
                    return params.marker + params.name + ': ' + params.value[3] + ' ms';
                }
            },
            legend: [] as any[],
            dataZoom: {
                xAxisIndex: 0,
                filterMode: 'weakFilter',
                height: 15,
                top: 0
            },
            grid: {
                left: 60,
                top: 40,
                right: 60,
                bottom: 20
            },
            xAxis: [{
                min: this.startTime,
                scale: true,
                position: 'top',
                axisTick: {
                    show: false
                },
                axisLabel: {
                    formatter: (val: any) => {
                        return Math.max(0, val - this.startTime) + ' ms';
                    }
                }
            }, {}],
            yAxis: {
                data: this.categories,
                axisLine: {
                    show: false
                },
                axisTick: {
                    show: false
                }
            },
            series: [{
                type: 'custom',
                renderItem: this.renderItem,
                itemStyle: {
                    height: 17,
                    opacity: 0.8
                },
                encode: {
                    x: [1, 2],
                    y: 0
                },
                data: this.data
            }]
        };
        this.echartsOption = option;
        chart.style.height = `${this.handleEchartsHeight()}px`;
        myChart.setOption(option);
    }

    /**
     * renderItem
     * @param params params
     * @param api api
     */
    public renderItem(params: any, api: any) {
        const categoryIndex = api.value(0);
        const start = api.coord([api.value(1), categoryIndex]);
        const end = api.coord([api.value(2), categoryIndex]);
        const height = api.size([0, 1])[1] * 0.6;

        const rectShape = echarts.graphic.clipRectByRect({
            x: start[0],
            y: start[1] - height / 2,
            width: end[0] - start[0],
            height
        }, {
            x: params.coordSys.x,
            y: params.coordSys.y,
            width: params.coordSys.width,
            height: params.coordSys.height
        });

        return rectShape && {
            type: 'rect',
            shape: rectShape,
            style: api.style()
        };
    }

    /**
     * handleEchartsHeight
     */
    public handleEchartsHeight() {
        return this.categories.length * 40;
    }
}
