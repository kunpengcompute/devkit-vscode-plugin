import { Injectable } from '@angular/core';
import * as d3 from 'd3';
import { I18nService } from '../../service/i18n.service';
import { AxiosService } from '../../service/axios.service';
import { element } from 'protractor';
import { Utils } from 'projects/sys/src-ide/app/service/utils.service';

@Injectable({
    providedIn: 'root'
})
export class TimingNormalizedService {

    // iconWarn
    public exclamtionSrc = './assets/img/template/iconWarn.svg';

    public titleDict: {};
    public tooltipDict: {};
    public i18n;

    private tooltipStyle = `
<style>
.timing_row_chart {
  height: 100%;
  width: 100%;
}

.timing_row_chart div+div {
  margin-top: 6px;
}

.timing_row_tooltip {
  z-index: 1;
  opacity: 0;
  position: fixed;
  display: inline-block;
  padding: 12px;
  font-size: 12px;
  color: #e8e8e8;
  background-color: #313131;
  border-radius: 1px;
  cursor: default;
  pointer-events: none;
  box-shadow: 0px 4px 8px 0px rgba(0, 0, 0, 0.2);
  left: -999px;
  top: 0px
}
</style>
`;

    constructor(
        public i18nService: I18nService,
        public axios: AxiosService
    ) {
        this.i18n = this.i18nService.I18n();
        this.titleDict = {
            Core: 'CPU',
            Module: this.i18n.common_term_task_tab_summary_module,
            Tid: this.i18n.common_term_task_tab_summary_thread,
            Pid: this.i18n.common_term_projiect_task_process
        };
        this.tooltipDict = {
            clickColorDlock: this.i18n.micarch.timingTable.tooltip.clickColorDlock,
            timestamp: this.i18n.micarch.timingTable.tooltip.timestamp
        };
    }

    /**
     * 绘制行
     * @param data data
     * @param eSelector dom对象
     * @param xAxisInstance 坐标轴
     * @param param3 宽高
     * @param colorDict 染色arr
     * @param chartClickCd 点击事件
     * @param scrollTableId 滚动条
     */
    public renderRow(
        data: any, eSelector: string, xAxisInstance: any,
        [w, h]: number[], colorDict: any, chartClickCd: any, scrollTableId?: string) {

        // 清除节点
        const containerDiv = $(eSelector);
        containerDiv.css({ position: 'relative', height: '100%' });
        containerDiv.empty();

        // 创建提示
        const tooltipDiv = $('<div>').addClass('timing_row_tooltip').appendTo(containerDiv);
        $(this.tooltipStyle).prependTo(containerDiv);
        const tooltipInstance = this.initTooltip(tooltipDiv);

        const cdFunc = (val) => {
            const res = data.cd(val.key);
            if (res && res.data && res.data.value.columns.length > 0) {
                chartClickCd.emit(res);
            }
        };

        // 创建绘图节点
        const chartDiv = $('<div>').addClass('timing_row_chart').appendTo(containerDiv);
        const svg = this.renderChart('row', data, xAxisInstance, [w, h],
            colorDict, containerDiv, chartDiv, tooltipInstance,
            null, cdFunc, $('#' + scrollTableId));
        chartDiv.append(svg.node());
    }

    /**
     * 绘制表
     * @param data data
     * @param eSelector dom对象
     * @param xAxisInstance 坐标轴
     * @param param3 宽高
     * @param colorDict 染色arr
     * @param chartClickCd 点击事件
     * @param scrollTableId 滚动条
     */
    public renderTable(
        data: any[], eSelector: string, xAxisInstance: any,
        [w, h]: number[], colorDict: any,
        outputFunc: any, scrollTableId?: string): any {

        const chartItemList = [];

        // 清除节点内容
        const containerDiv = $(eSelector);
        containerDiv.css({ position: 'relative', height: '100%' });
        containerDiv.empty();

        // 创建提示节点
        const tooltipDiv = $('<div>').addClass('timing_row_tooltip').appendTo(containerDiv);
        $(this.tooltipStyle).prependTo(containerDiv);
        const tooltipInstance = this.initTooltip(tooltipDiv);

        // 创建绘图节点
        const conHeight = data.length * (h + 6);

        const chartDiv = $('<div>').addClass('timing_row_chart').appendTo(containerDiv);
        chartDiv.css({ width: '100%', height: conHeight });

        const domain = Array.from(data.keys()).map(e => e.toString());
        const bandScale = d3.scaleBand()
            .domain(domain)
            .range([0, conHeight]);

        for (let i = 0; i < data.length; i++) {
            const elementObj = data[i];

            const itemDiv = $('<div>').css({ height: `${h}` })
                .on('wheel', (evt) => {
                    evt.preventDefault();
                });
            if (elementObj.name.search(':') !== -1) {
                itemDiv.css({ height: '150px' });
            }

            chartDiv.append(itemDiv[0]);

            const chartBuilder = (): Element => {
                const cdFunc = (val) => {
                    const res = elementObj.cd(val.key);
                    if (res && res.data && res.data.value.columns.length > 0) {
                        outputFunc.emit(res);
                    }
                };

                const svg = this.renderChart('table', elementObj, xAxisInstance,
                    [w, h], colorDict, containerDiv, itemDiv, tooltipInstance,
                    bandScale(i + '') + 3, cdFunc, $('#' + scrollTableId));
                return svg.node();
            };

            const chartItem = { itemNode: itemDiv, chartBuilder };
            chartItemList.push(chartItem);
        }

        const offListener = this.lazyloadSupervisor($('#' + scrollTableId), chartItemList);
        return offListener;
    }

    private renderChart(
        mode: 'row' | 'table', dataObj: any, xAxisInstance: any,
        [w, h]: number[], colorDict: any, containerDiv: JQuery, itemNode: JQuery,
        tooltipInstance: any, offsetHeight: number, chartClickCd: any, scrollTableNode: JQuery) {
        const clipId = 'clip-' + Utils.generateConversationId(15);
        const titleDic = this.titleDict;
        const tooltipDic: any = this.tooltipDict;
        const data = dataObj.value;
        const height: number = h;
        const width: number = w;
        const juxtaposeIdAndKey = createJuxtaposeIdAndKey(data.columns);

        const actHeight = height;
        const actWidth = Math.max(width - 35, 0);

        // 创建绘图区域
        const svg = d3.create('svg')
            .attr('viewBox', [0, 0, width, actHeight].toString())
            .attr('width', width)
            .attr('height', actHeight)
            .attr('name', dataObj.name)
            .on('mousemove', moved);


        // 渲染区域(超出这个区域不渲染)
        const clip = svg.append('defs').append('SVG:clipPath')
            .attr('id', `${clipId}`)
            .append('SVG:rect')
            .attr('width', actWidth)
            .attr('height', actHeight)
            .attr('x', 15)
            .attr('y', 0);

        // 绘图区域
        const ggg = svg.append('g')
            .attr('clip-path', `url(#${clipId})`)
            .attr('width', actWidth)
            .attr('height', actHeight);

        // 获取填充色
        const color = d3.scaleOrdinal()
            .domain(data.columns.slice(1))
            .range(colorDict)
            .unknown(undefined);

        // 数据布局
        const series = d3.stack()
            .keys(data.columns.slice(1))
            .offset(d3.stackOffsetExpand)
            .order(d3.stackOrderReverse)
            (data);

        // 定义比例尺
        const x = d3.scaleLinear()
            .range([0 + 15, width - 20])
            .domain(d3.extent(data, (d: any) => +d.Timestamp));

        svg.on('mouseenter', (d: any) => {

            xAxisInstance.switchTo(x);
            tooltipInstance.hidden(false);
        });

        xAxisInstance.registered(x);

        const y = d3.scaleLinear()
            .range([actHeight, 0]);

        const area: any = d3.area()
            .x((d: any) => {
                return x(+d.data.Timestamp);
            })
            .y0(d => y(d[0]))
            .y1(d => y(d[1]));

        const cell = ggg.selectAll('g')
            .data(series)
            .join('g')
            .style('cursor', 'pointer')
            .on('click', (d: any) => {
                if (chartClickCd) { chartClickCd(d); }
            })
            .on('mouseenter', (d: any) => {
                const id = juxtaposeIdAndKey.key2Id(d.key);
                ggg.select('#' + id)
                    .attr('fill', '#38C1BC');
            })
            .on('mouseout', (d) => {
                const id = juxtaposeIdAndKey.key2Id(d.key);
                ggg.select('#' + id)
                    .attr('fill', color(d.key).toString());
            });

        const path = cell.append('path')
            .attr('class', 'path-area')
            .attr('fill', ({ key }): any => color(key))
            .attr('stroke', ({ key }): any => color(key))
            .attr('stroke-width', 0.5)
            .attr('d', area)
            .attr('id', (d: any): any => {
                return juxtaposeIdAndKey.key2Id(d.key);
            });


        // 坐标提示基线
        const rule = ggg.append('g')
            .append('line')
            .attr('y1', actHeight)
            .attr('y2', 0)
            .attr('stroke', '#aaaaaa')
            .attr('pointer-events', 'none');

        svg.on('mouseleave', (d: any) => {
            rule.attr('visibility', 'hidden');
            tooltipInstance.hidden(true);
        });

        function createJuxtaposeIdAndKey(keyList) {
            const arr: any[] = []; // [[id, key], [id, key], ...]

            keyList.forEach(elementObj => {
                const id: string = elementObj.toString().trim().replace(/\s+/g, '-');
                arr.push([id, elementObj]);
            });

            return {
                id2Key(id: string): string | number | void {
                    for (const e of arr) {
                        if (e[0] && (e[0] === id)) {
                            return e[1];
                        }
                    }
                },

                key2Id(key: string | number): string | void {
                    for (const e of arr) {
                        if (e[1] && (e[1] === key)) {
                            return e[0];
                        }
                    }
                }
            };
        }

        function moved() {

            // 设置鼠标hover在tooltip上时动作

            // 计算x坐标提示基线的位置对应的时间值
            const timestamp: number = x.invert((d3 as any).mouse(this)[0]);

            // 通过 rule 的位置信息来计算有效时间值和对应的数据
            const omit = (prop, { [prop]: _, ...rest }) => rest;
            const dataTmp = binarySearch(data, timestamp);
            const dataItem = omit('Timestamp', dataTmp);
            const rulePosX = x(+dataTmp.Timestamp);

            // 设置x坐标提示基线的位置
            rule.attr('transform', `translate(${rulePosX + 0.5}, 0)`)
                .attr('visibility', 'visible');

            // 计算提示框的数据
            const tipData: any = [];

            let sum = 0.00000000001;
            for (const key of Object.keys(dataItem)) {
                const itemNum = !dataItem[key] ? 0 : parseFloat(dataItem[key]); // 预防数值只为: ''
                if (color(key)) {
                    sum += itemNum;
                }
            }
            if (mode === 'table') {
                tipData.push([undefined, titleDic[dataObj.type], dataObj.name]);
                tipData.push([undefined, tooltipDic.timestamp, x.invert(rulePosX).toFixed(2) + 'ms']);
            }
            for (const key of Object.keys(dataItem)) {
                const itemNum = !dataItem[key] ? 0 : parseFloat(dataItem[key]);
                const percentage = color(key)
                    ? (itemNum / sum * 100).toFixed(2) + '%'
                    : itemNum.toFixed(2);
                tipData.push([color(key), key, percentage]);
            }
            tipData.mode = mode;

            tooltipInstance.setTipData(tipData);

            // 计算提示框的Y方向的（即将）被遮挡部分的高度
            const tipOffTop = itemNode.offset().top + 3 + tooltipInstance.getHeight();
            const containerOffTop = scrollTableNode.offset().top + scrollTableNode.height();
            const gap = tipOffTop - containerOffTop;
            const occlusionHeight = gap < 0 ? 0 : gap + 3;

            // 计算 tooltip 提示的方向
            let toolTipOrient = 'right';
            const tooltipWidth = tooltipInstance.getWidth();
            if (width - rulePosX < tooltipWidth + 50) {
                toolTipOrient = 'left';
            } else {
                toolTipOrient = 'right';
            }
            tooltipInstance.setPosition(Math.round(rulePosX), Math.round(offsetHeight),
                Math.round(occlusionHeight), toolTipOrient);

            (d3 as any).event.preventDefault();
        }

        function binarySearch(dataList: Array<any>, value: number) {
            if (dataList.length === 0) {
                return null;
            }
            if (dataList.length === 1) {
                return dataList[0];
            }
            function recursive(startIndex, endIndex) {
                // 结束条件
                if (endIndex - startIndex === 1) {
                    const startElement: any = dataList[startIndex];
                    const endElement: any = dataList[endIndex];

                    const startVal = parseFloat(startElement.Timestamp);
                    const endVal = parseFloat(endElement.Timestamp);

                    if (Math.abs(startVal - value) < Math.abs(endVal - value)) {
                        return startElement;
                    } else {
                        return endElement;
                    }
                }

                const stepLen: number = Math.floor((endIndex - startIndex) / 2);
                const pos: number = startIndex + stepLen;
                const elementObj: any = dataList[pos];
                if (parseFloat(elementObj.Timestamp) < value) {
                    return recursive(pos, endIndex);
                } else {
                    return recursive(startIndex, pos);
                }
            }
            return recursive(0, dataList.length - 1);
        }

        return svg;
    }

    /**
     * 初始化坐标轴
     * @param eSelector 坐标轴渲染的位置
     * @param param1 坐标轴的尺寸
     */
    public initXAxis(eSelector: string, [w, h = 30]: number[]): { zoom: any, switchTo: any, registered: any } {
        const xMap: Map<any, any> = new Map();

        const width: number = w;
        const height: number = h;
        let debounceTimer;


        // 清除节点内容
        const containerDiv = $(eSelector);
        containerDiv.css({ height: 'auto', width: '100%' });
        containerDiv.empty();

        // 指定坐标轴绘图区域
        const svg = d3.create('svg')
            .attr('viewBox', [0, 0, width, height].toString())
            .attr('width', width)
            .attr('height', height + 30);
        containerDiv.append(svg.node());

        // 根据坐标轴实例（xAxis）绘图
        const xChart = svg.append('g')
            .attr('transform', 'translate(0, 25)');

        // 缩放函数
        const zoom = (xDomain, xScale) => {
            const xAxis = xMap.get(xScale);
            instanteXChart(xAxis.scale(xDomain));
        };

        // 注册
        const registered = (xScale) => {
            xMap.set(xScale, getXAxisInstance(xScale));
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                instanteXChart(getXAxisInstance(xScale));
            }, 20);
        };

        // 切换坐标
        const switchTo = (xScale) => {
            const xAxis = xMap.get(xScale);
            instanteXChart(xAxis);
        };

        function instanteXChart(xAxis) {
            xChart.call(xAxis)
                .call(g => {
                    g.selectAll('.domain');
                    g.select('path')
                        .attr('color', '#383838')
                        .attr('stroke-width', '2px');
                })
                .call(g => {
                    g.selectAll('.tick text')
                        .attr('fill', '#aaaaaa')
                        .attr('y', 14);
                    g.selectAll('.tick line')
                        .attr('stroke', '#383838')
                        .attr('color', '#383838')
                        .attr('stroke-width', '2px')
                        .attr('y1', 0)
                        .attr('y2', 8);
                });
        }

        /**
         * 由（xScale）生成相应的坐标轴实例
         * @param xScale x轴的比例尺
         */
        function getXAxisInstance(xScale) {
            const xAxis = d3.axisBottom(xScale)
                .ticks(12)
                .tickFormat(d => {
                    return d + 'ms';
                })
                .tickSizeInner(0)
                .tickSizeOuter(0)
                .tickPadding(0);

            return xAxis;
        }

        return {
            zoom,
            switchTo,
            registered
        };
    }

    private initTooltip(tooltipNode: JQuery): {
        hidden: (isHidden: boolean) => void,
        setTipData: (tipData: any) => void, getHeight: () => number, getWidth: () => number,
        setPosition: (rulePosX: number, offsetHeight: number, occlusionHeight: number, toolTipOrient: string) => void,
        hoverDectect: (x: number, y: number) => void,
        moveOpacity: () => void
    } {

        const exclamSrc = this.exclamtionSrc;
        const prePos = { rulePosX: -1, offsetHeight: -1 };
        let updateTipContent = () => { };
        const currentActualPos = { x: -1, y: -1 };
        const tooltipDic: any = this.tooltipDict;
        let moveOpacityTimer;
        let isHover = false;

        const hidden = (isHidden: boolean) => {
            if (isHidden) {
                tooltipNode.animate({ opacity: 0.0 }, 500);
            } else {
                tooltipNode.stop().css({ opacity: 1.0 });
            }
        };

        const getHeight = () => {
            return tooltipNode.get(0).clientHeight;
        };

        const getWidth = () => {
            return tooltipNode.get(0).clientWidth;
        };

        const getParentElement = () => {
            return tooltipNode.get(0).parentElement;
        };

        const setTipData = (tipData: any) => {
            let tipContent = '';

            if (tipData.mode === 'table') {
                tipContent += `
                    <div class='timing_row_tooltip-item'
                    style='display: flex; height: 16px; justify-content: space-between;'>
                      <p >
                        <img src='${exclamSrc}' style=' display: inline-block;width: 16px;height: 16px;'/>
                        <span style='position: relative; top: -3px;color:#aaaaaa !important'>${
                            tooltipDic.clickColorDlock
                        }</span>
                      </p>
                    </div>
                  `;
            }
            for (const item of tipData) {
                const strHtml = `
                          <div class='timing_row_tooltip-item'
                          style='display: flex; height: 16px; justify-content: space-between;'>
                            <p >
                              <span style='
                                display: inline-block;
                                background-color: ${item[0]};
                                width: 16px;
                                height: 16px;
                                border-radius: 8px;'>
                              </span>
                              <span style='position: relative; top: -3px;'>${item[1]}</span>
                            </p>
                            <p style='width:70px; margin-left: 30px; text-align:start;
                              text-overflow: ellipsis; overflow: hidden; white-space: nowrap;'>${item[2]}</p>
                          </div>
                          `;
                tipContent += strHtml;
            }
            tipContent += `
                  <style>
                    .timing_row_tooltip-item+.timing_row_tooltip-item {
                      margin-top: 6px;
                    }
                  <style>
                  `;

            // 先给tooltipNode 设置内容，目的是为了 getHeight 和 getWidth 提供计算依据
            if (tooltipNode.html() === '') {
                tooltipNode.html(tipContent);
            }

            // 设置提示框的内容的函数
            updateTipContent = () => {
                tooltipNode.html(tipContent);
            };
        };

        const setPosition = (
            rulePosX: number,
            offsetHeight: number,
            occlusionHeight: number,
            toolTipOrient: string
        ) => {
            const tipParentNode = getParentElement();

            // 判断是否移动，决定是否渲染
            if (rulePosX === prePos.rulePosX && offsetHeight === prePos.offsetHeight) {
                return;
            }

            // 计算 tooltip 提示的位置
            let xPos = 0;
            let yPos = 0;
            if (toolTipOrient === 'left') {
                xPos = rulePosX - getWidth() - 32;
            } else {
                xPos = rulePosX + 32;
            }
            if (offsetHeight) {
                yPos = offsetHeight - occlusionHeight;
            } else {
                yPos = 3;
            }
            xPos = xPos + tipParentNode.getBoundingClientRect().left;
            yPos = yPos + tipParentNode.getBoundingClientRect().top;

            // 设置 tooltip 提示的位置 和 方向
            setTimeout(() => {
                tooltipNode.css({ left: xPos, top: yPos })
                    .attr('orient', toolTipOrient);
                updateTipContent();
            });

            prePos.rulePosX = rulePosX;
            prePos.offsetHeight = offsetHeight;

            currentActualPos.x = xPos;
            currentActualPos.y = yPos;
        };

        const hoverDectect = (x: number, y: number) => {

            const x0 = currentActualPos.x;
            const y0 = currentActualPos.y;
            const x1 = x0 + tooltipNode.get(0).clientWidth;
            const y1 = y0 + tooltipNode.get(0).clientHeight;

            if (x0 < x && x1 > x && y0 < y && y1 > y) {
                isHover = true;
                if (tooltipNode.css('opacity') !== '0.7') {
                    tooltipNode.css({ opacity: 0.7 });
                }
            } else {
                isHover = false;
                if (tooltipNode.css('opacity') !== '1') {
                    tooltipNode.css({ opacity: 1.0 });
                }
            }
        };

        const moveOpacity = () => {
            tooltipNode.stop().css({ opacity: 0.7 });
            clearTimeout(moveOpacityTimer);
            moveOpacityTimer = setTimeout(() => {
                if (!isHover) {
                    tooltipNode.animate({ opacity: 1 }, 500);
                }
            }, 500);
        };

        return {
            hidden,
            setTipData,
            getHeight,
            getWidth,
            setPosition,
            hoverDectect,
            moveOpacity
        };
    }

    // 懒加载
    private lazyloadSupervisor(
        scrollContainerNode: JQuery,
        itemList: { itemNode: JQuery, chartBuilder: () => any }[]
    ): () => void {
        let scrollThrottleTimer;

        // 计算并并执行加载的方法
        function calculate() {
            // 计算可视区域的上下限
            const visibleScope = {
                up: scrollContainerNode.offset().top,
                low: scrollContainerNode.offset().top + scrollContainerNode.get(0).clientHeight
            };

            for (const item of itemList) {
                const itemNode = item.itemNode;
                const chartBuilder = item.chartBuilder;
                const itemScope = {
                    up: itemNode.offset().top,
                    low: itemNode.offset().top + itemNode.get(0).clientHeight
                };

                if (itemScope.up < visibleScope.low && itemScope.low > visibleScope.up) {
                    if (itemNode.html() === '') {
                        const chartNode = chartBuilder();
                        itemNode.append(chartNode);
                    }
                }
            }
        }

        // 在页面初始化时执行一次
        calculate();

        // 监听滚动事件
        scrollContainerNode.on('scroll.scrollContainerNodeScroll', () => {
            if (!scrollThrottleTimer) {
                scrollThrottleTimer = setTimeout(() => {
                    calculate();
                    scrollThrottleTimer = null;
                }, 300);
            }
        });

        // 取消监听滚动事件的方法
        const offListener = () => {
            scrollContainerNode.off('.scrollContainerNodeScroll');
        };

        return offListener;
    }
}
