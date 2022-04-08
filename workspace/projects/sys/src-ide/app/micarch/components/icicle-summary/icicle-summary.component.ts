import {
    Component, Input, ElementRef, HostListener, AfterViewInit,
    AfterViewChecked, EventEmitter, Output
} from '@angular/core';
import * as d3 from 'd3';
import { AxiosService } from '../../../service/axios.service';
import { I18nService } from '../../../service/i18n.service';
import { Utils } from 'projects/sys/src-ide/app/service/utils.service';

@Component({
    selector: 'app-icicle-summary',
    templateUrl: './icicle-summary.component.html',
    styleUrls: ['./icicle-summary.component.scss']
})
export class IcicleSummaryComponent implements AfterViewInit, AfterViewChecked {
    public dataCopy: any;

    @Input()
    set data(val) {
        this.dataCopy = val;
        if (val) {
            setTimeout(() => {
                this.render(this, val);
            });
        }
    }
    get data() {
        return this.dataCopy;
    }
    @Input() type: string;
    @Input() width = 1200;
    @Input() height = 600;
    @Input() padding = { top: 20, right: 1, bottom: 0, left: 1 };

    @Output() private changeHeight = new EventEmitter<number>();

    private chartID: string;
    private tooltipID: string;

    public summuryNode: any;
    public summuryWidth = 0;
    public summuryHeight = 0;
    public topImgUrl = './assets/img/micarch/top-summary.png';

    public i18n: any;
    public echartHeight: any = 600;

    /**
     * 事件监听
     */
    @HostListener('window:resize')
    onResize() {
        if (this.summuryNode) {
            this.summuryWidth = this.summuryNode.clientWidth;
            this.summuryHeight = this.summuryNode.clientHeight;
            this.getMinHeight();
        }
    }

    constructor(
        private el: ElementRef,
        public i18nService: I18nService,
        private axios: AxiosService
    ) {

        this.i18n = this.i18nService.I18n();
        // 生成随机数
        this.chartID = 'summury_icicle_chart_' + Utils.generateConversationId(15); // 获取一个唯一的ID值
        this.tooltipID = 'summury_icicle_chart_tip_' + Utils.generateConversationId(15);
    }

    /**
     * 初始化
     */
    ngAfterViewInit(): void {
        // 设置随机数
        this.summuryNode = this.el.nativeElement.querySelector('#summury_icicle_chart');
        this.summuryNode.setAttribute('id', this.chartID);
        const tooltipNode = this.el.nativeElement.querySelector('#summury_icicle_chart_tip');
        tooltipNode.setAttribute('id', this.tooltipID);
    }

    /**
     * 这个 hook 在窗口尺寸改变时不一定触发，所以还需要窗口的 resize 事件来更新值
     */
    ngAfterViewChecked(): void {
        if (this.summuryNode) {
            this.summuryWidth = this.summuryNode.clientWidth;
            this.summuryHeight = this.summuryNode.clientHeight;
            this.getMinHeight();
        }
    }

    /**
     * 绘制
     */
    public render(ctx, data) {
        const height = ctx.height;
        const width = ctx.width;
        const padding: any = ctx.padding;
        const viewBox: number[] = [0, 0, width + padding.left + padding.right, height + padding.top + padding.bottom];
        const summuryWidth = $(ctx.summuryNode).width();
        const clipPathId = Utils.generateConversationId(15);
        const polygonStrokeWidth = 2;
        const rectBetweenGap = 3;
        const tooltipWidth = 326; // 这个值是样式中写死的，单位为px
        const rectTextLimitWidth = 16;

        // 数据处理
        // 1. 生成绘图所需的百分比值Path
        const dataGood = reasonableData(data);
        // 2. 生成对应的层级数据，新增：深度、高度
        const dataHierarchy = d3.hierarchy(dataGood);
        // 3. 将生成的层级数据进行平铺, 新增：实际坐标轴
        const root: [] = getPartition(dataHierarchy);

        // svg 及其相关参数
        const svg = d3.select('#' + ctx.chartID)
            .append('svg')
            .attr('viewBox', viewBox.join(' '))
            .style('font', '14px')
            .attr('pointer-events', 'auto');

        // 兼容 IE11
        if (ctx.isIE()) {
            svg.attr('width', `${summuryWidth}`)
                .attr('height', `${summuryWidth / width * height}`);
        }

        // clip-path 限制渲染区域
        const clipPath = svg.append('defs').append('clipPath')
            .attr('id', `${clipPathId}`)
            .append('rect')
            .attr('width', width)
            .attr('height', height)
            .attr('x', polygonStrokeWidth / 2 * -1)
            .attr('y', polygonStrokeWidth / 2 * -1);

        // 绘图区域
        const chartArea = svg.append('g')
            .attr('id', `icicleSvg`)
            .attr('clip-path', `url(#${clipPathId})`)
            .attr('transform', `translate(${padding.left}, ${padding.top})`);

        // 提示框
        const tooltip = $('#' + ctx.tooltipID)
            .css('opacity', 0.0);

        // 每个数据对应的盒子
        const cell = chartArea.selectAll('g')
            .data(root.slice(1))
            .join('g')
            .attr('transform', (d: any) => `translate(${d.x0}, ${d.y0})`)
            .style('cursor', 'pointer')
            .on('click', (event, d) => handleCellClick(d, this))
            .on('mouseenter', handleMouseenter)
            .on('mouseout', handleMouseout);

        // 在每个盒子中添加的矩形
        const rect = cell.append('rect')
            .attr('width', d => getRectWidth(d))
            .attr('height', d => getRectHeight(d))
            .attr('rx', 2) // 圆角
            .attr('ry', 2)
            .attr('fill', d => getRectFill(d));

        // 盒子文本的容器
        const text = cell.append('g')
            .attr('fill', '#ffffff')
            .attr('pointer-events', 'none')
            .attr('transform', (d: any) => `translate(0, ${(d.y1 - d.y0) / 2 + 5})`)
            .call(setCellText, this);

        // 独立于盒子和矩形的线段
        const polygon = chartArea.append('polygon')
            .attr('stroke', '#A3C1F5')
            .attr('stroke-width', polygonStrokeWidth)
            .attr('fill', 'none')
            .attr('pointer-events', 'none')
            .attr('stroke-linejoin', 'round');
        this.getMinHeight();

        function handleCellClick(p, that) {
            p = p.isTop ? p.parent : p;

            root.forEach((d: any) => {
                d.isTop = false;
                if (d.depth >= p.depth) {
                    d.x0 = (d.pos.x0 - p.pos.x0) / (p.pos.x1 - p.pos.x0) * width;
                    d.x1 = (d.pos.x1 - p.pos.x0) / (p.pos.x1 - p.pos.x0) * width;
                }
            });

            let pNode = p.parent;
            p.isTop = true;
            while (pNode) {
                pNode.isTop = true;
                root.forEach((d: any) => {
                    if (d.depth === pNode.depth) {
                        d.x0 = (d.pos.x0 - pNode.pos.x0) / (pNode.pos.x1 - pNode.pos.x0) * width;
                        d.x1 = (d.pos.x1 - pNode.pos.x0) / (pNode.pos.x1 - pNode.pos.x0) * width;
                    }
                });
                pNode = pNode.parent;
            }

            const t = cell.transition().duration(750)
                .on('start', () => {
                    svg.attr('pointer-events', 'none');
                })
                .on('end', () => {
                    svg.attr('pointer-events', 'auto');
                })
                .attr('transform', (d: any) => `translate(${d.x0}, ${d.y0})`)
                .style('opacity', (d: any) => {
                    const opacity = d.isTop ? 0.6 : 1.0;
                    return opacity;
                });
            rect.transition(t).attr('width', d => getRectWidth(d));
            text.call(setCellText, that);
        }

        function setCellText(textSelection, that) {
            const ellipsisTextWidth = getSvgTextWidth('...');
            textSelection.each((d) => {
                const sumWidth: number = getRectWidth(d);
                let nameWidth: number = getSvgTextWidth(d.data.name);
                const imageWidth: number = d.data.maxValue && that.type !== 'hpc' ? 19 : 0;
                let maxValueWidth: number = d.data.maxValue ? getSvgTextWidth(d.data.maxValue + '%') : 0;
                d.actualTextInfo = { nameWidth, imageWidth, maxValueWidth };

                if ((nameWidth + imageWidth + maxValueWidth) > sumWidth) {
                    nameWidth = sumWidth - imageWidth - maxValueWidth;
                }

                if ((imageWidth + maxValueWidth) > sumWidth) {
                    nameWidth = 0;
                    maxValueWidth = sumWidth - imageWidth;
                }

                if (imageWidth > sumWidth) {
                    maxValueWidth = 0;
                    nameWidth = 0;
                }

                if (nameWidth < ellipsisTextWidth) {
                    nameWidth = 0;
                }

                if (maxValueWidth < ellipsisTextWidth) {
                    maxValueWidth = 0;
                }

                const setOffX = Math.max((sumWidth - (nameWidth + imageWidth + maxValueWidth)) / 2, 0.3);
                d.renderTextInfo = { setOffX, nameWidth, imageWidth, maxValueWidth };
            });

            let name = textSelection.select('.name');
            let image = textSelection.select('.imageUp');
            let maxValue = textSelection.select('.maxValue');

            if (name.empty()) {
                name = textSelection.append('g').attr('class', 'name');
            }
            if (image.empty()) {
                image = textSelection.append('g').attr('class', 'imageUp');
            }
            if (maxValue.empty()) {
                maxValue = textSelection.append('g').attr('class', 'maxValue');
            }

            const trans = d3.transition().duration(750);
            name.transition(trans)
                .attr('transform', (d: any) => `translate(${d.renderTextInfo.setOffX}, 0)`);

            image.transition(trans)
                .attr('transform', (d: any) => {
                    const offSet = d.renderTextInfo.setOffX + d.renderTextInfo.nameWidth;
                    return `translate(${offSet}, 0)`;
                });

            maxValue.transition(trans)
                .attr('transform', (d: any) => {
                    const offSet = d.renderTextInfo.setOffX + d.renderTextInfo.nameWidth + d.renderTextInfo.imageWidth;
                    return `translate(${offSet}, 0)`;
                });

            name.select('text').remove();
            name.append('text')
                .text(d => {
                    return (d.x1 - d.x0) > rectTextLimitWidth ?
                        getOmitText(d.data.name, d.renderTextInfo.nameWidth, d.actualTextInfo.nameWidth) : undefined;
                });
            image.select('image').remove();
            image.append('image')
                .attr('href', (d) => {
                    const url = d.data.maxValue ? ctx.topImgUrl : undefined;
                    return (d.x1 - d.x0) > rectTextLimitWidth ? url : undefined;
                })
                .attr('height', 14)
                .attr('width', 13)
                .attr('transform', (d) => {
                    const offSet = Math.max((getRectWidth(d) - 13) / 2, 0);
                    return `translate(${Math.min(offSet, 3)}, -12)`;
                });
            if (that.type === 'hpc') {
                image.select('image').remove();
            }
            maxValue.select('text').remove();
            maxValue.append('text')
                .text((d: any) => {
                    return (d.x1 - d.x0) > rectTextLimitWidth
                        ? getOmitText(
                            d.data.maxValue + '%',
                            d.renderTextInfo.maxValueWidth,
                            d.actualTextInfo.maxValueWidth
                        )
                        : undefined;
                });

            function getOmitText(textStr: string, limitWidth: number, actualWidth: number) {
                if (ellipsisTextWidth > limitWidth) {
                    return '';
                } else if (Math.abs(limitWidth - actualWidth) < 0.00001 || limitWidth > actualWidth) {
                    return textStr;
                } else {
                    return recursive(0, textStr.length - 1);
                }

                // TODO 优化
                function recursive(startIndex: number, endIndex: number) {
                    // 结束条件
                    if (endIndex - startIndex === 1) {
                      const optimalText = textStr.substring(0, startIndex + 1) + '...';
                      return getSvgTextWidth(optimalText) > limitWidth ? '' : optimalText;
                    }

                    const stepLen = Math.floor((endIndex - startIndex) / 2);
                    const pos = startIndex + stepLen;
                    const omitText = textStr.substring(0, pos + 1) + '...';
                    if (getSvgTextWidth(omitText) < limitWidth) {
                        return recursive(pos, endIndex);
                    } else {
                        return recursive(startIndex, pos);
                    }
                }
            }

            function getSvgTextWidth(textStr, font = { fontSize: '14px' }) {
                const element = document.createElement('div');
                const textNode = document.createTextNode(textStr);

                element.appendChild(textNode);
                element.style.fontSize = font.fontSize;
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

        function getRectFill(d: any) {
            if (d.data.name === 'retiring') {
                return '#237673';
            }
            return '#2E508D';
        }

        function getRectHeight(d): number {
            return d.y1 - d.y0 - rectBetweenGap;
        }

        function getRectWidth(d: any): number {
            return d.x1 - d.x0 - Math.min(rectBetweenGap, (d.x1 - d.x0) * 0.999);
        }

        function handleMouseenter(event: MouseEvent, d: any): void {
            // 控制矩形的颜色改变的 flag
            d.over = true;

            // 设置包裹矩形的线段
            const datum: [number, number][] = getLinePathByAxis(d);
            polygon.attr('points', datum.join(' '));

            // 设置矩形的颜色
            rect.attr('fill', (dd: any) => {
                return dd.over ? ((self as any).webviewSession || {}).getItem('tuningOperation') === 'hypertuner'
                    ? '#3a70cc' : '#5d89d8' : getRectFill(dd);
            });

            // 设置字体的颜色
            text.attr('fill', (dd: any) => {
                return dd.over ? '#ffffff' : '#ffffff';
            });

            // 初始化提示框的值赋值
            let content: string;
            if (d.data.suggestions == null) {
                content = `<p>${ctx.i18n.micarch.eventName}: ${d.data.name}<p/>
              <p>${ctx.i18n.micarch.percentage}: ${d.data.proportion}</P>`;
            } else {
                const desc = d.data.suggestions.desc == null
                    ? '' : ctx.i18n.micarch.suggestions.des + d.data.suggestions.desc;
                const cause = d.data.suggestions.cause == null
                    ? '' : ctx.i18n.micarch.suggestions.possibleCause + d.data.suggestions.cause;
                const tips = d.data.suggestions.tips == null
                    ? '' : ctx.i18n.micarch.suggestions.solution + d.data.suggestions.tips;
                const point = `<p>${desc}</p><p>${cause}</p><p>${tips}</p>`;
                content = `<p>${ctx.i18n.micarch.eventName}: ${d.data.name}</p>
              <p>${ctx.i18n.micarch.percentage}: ${d.data.proportion}</p>
              ${point}`;
            }

            // 计算矩形的中心位置（单位为:px）
            const widthRatio = ctx.summuryWidth / (width + padding.left + padding.right);
            const offX = (d.x0 + padding.left) * widthRatio;
            const rectW = getRectWidth(d) * widthRatio;
            const tipX = (offX + rectW / 2);

            const heightRatio = ctx.summuryHeight / (height + padding.top + padding.bottom);
            const offY = (d.y0 + padding.top) * heightRatio;
            const rectH = (d.y1 - d.y0) * heightRatio;
            const tipY = (offY + rectH / 2);

            // 计算整个 svg 的真实宽高（单位为:px）
            const svgW = widthRatio * width;
            const svgH = heightRatio * height;

            // 计算提示框的小尖位置
            const pos = {
                orient: 'tip-bottom',
                offset: 5,
            };
            const offLeft = tipX;  // 距离左边框的距离
            const offRight = svgW - tipX; // 距离右边框的距离

            if (offLeft < (tooltipWidth / 2)) {
                const dd = (offLeft / (tooltipWidth / 2)) * 10 * 0.45;
                pos.offset = (dd < 5) ? Math.floor(dd) : 5;
            } else if (offRight < (tooltipWidth / 2)) {
                const bb = (offRight / (tooltipWidth / 2)) * 10 * 0.45;
                pos.offset = ((10 - bb) > 5) ? Math.ceil(10 - bb) : 5;
            }

            // 计算提示框的朝向
            if (rectW / 2 > tooltipWidth + 200) {
                pos.orient = 'tip-right';
            }

            // 设置提示框的位置、朝向和小尖的位置

            tooltip.stop()
                .animate({ left: tipX, top: tipY }, 500)
                .css('opacity', 1.0)
                .attr('orient', () => {
                    return pos.orient;
                })
                .attr('offset', () => {
                    return pos.offset;
                })
                .html(content);
        }

        function handleMouseout(event: MouseEvent, d: any): void {
            // 控制矩形的颜色改变的 flag
            d.over = false;

            // 提示和路径改变逻辑
            polygon.attr('points', '');
            tooltip.stop().animate({ opacity: 0.0 }, 500);

            // 矩形颜色改变逻辑
            rect.attr('fill', (dd: any) => {
                return dd.over ? ((self as any).webviewSession || {}).getItem('tuningOperation') === 'hypertuner'
                    ? '#3a70cc' : '#5d89d8' : getRectFill(dd);
            });

            // 字体颜色改变逻辑
            text.attr('fill', (dd: any) => {
                return dd.over ? '#ffffff' : '#ffffff';
            });
        }

        function getLinePathByAxis(d): [number, number][] {
            let p = d;
            const datumLeft: [number, number][] = [];
            const datumright: [number, number][] = [];
            while (p.parent) {
                datumLeft.push([p.x0, p.y0 + getRectHeight(p)]);
                datumLeft.push([p.x0, p.parent.parent ? p.y0 - rectBetweenGap : p.y0]);
                datumright.push([p.x0 + getRectWidth(p), p.y0 + getRectHeight(p)]);
                datumright.push([p.x0 + getRectWidth(p), p.parent.parent ? p.y0 - rectBetweenGap : p.y0]);
                p = p.parent;
            }
            const datum = datumLeft.concat(datumright.reverse());
            return datum;
        }

        function getPartition(rootPos): any {
            rootPos.sum(d => d.value);
            rootPos.count();
            const p = d3.partition()
                .size([width, (rootPos.height + 1) * (height - (padding.top + padding.bottom)) / 6])
                (rootPos);

            // 矫正每个分区的宽度
            // 因为实在无能力查明为什么6.6.2版本的d3分区图在计算完之后各个区块位置大小会有问题
            // 故这里手动去矫正各个区块位置大小。
            // 如后续有大佬知道怎么解决，欢迎删除这段代码并使用正确方式实现！
            const currectPos = (node: any) => {
                const children = node.children;
                if (children) {
                    let prevChild: any;
                    children.forEach((child: any) => {
                        child.x0 = prevChild?.x1 || child.parent?.x0 || 0;
                        const parentWidth = child.parent.x1 - child.parent.x0;
                        child.x1 = (child.data.value / child.parent.data.value) * parentWidth + child.x0;
                        prevChild = child;
                    });
                    children.forEach((child: any) => {
                        currectPos(child);
                    });
                }
            };
            currectPos(p);

            function mapN(node) {
                const cNode = node.children;
                if (cNode) {
                    for (const element of cNode) {
                        mapN(element);
                    }
                }

                // 整个图往上移一格
                node.y0 = node.parent ? node.parent.y0 : 0;
                node.y1 = node.parent ? node.parent.y1 : 0;

                node.pos = {
                    x0: node.x0,
                    x1: node.x1,
                    y0: node.y0,
                    y1: node.y1
                };
                return node;
            }
            mapN(p);

            return p.descendants();
        }

        // 处理数据，两个操作：1.将属性proportion的值处理成value值，2.标记出每层的最值
        function reasonableData(val) {
            const tempData = deepClone(val);

            function recursive(node, pValue) {
                node.value = Number(parseFloat(pValue).toFixed(2));
                const nodes: any[] = node.children;

                if (nodes && nodes.length > 0) {
                    // 求和
                    const sumVuale = nodes.reduce((sum, next) => {
                        return sum + parseFloat(next.proportion);
                    }, 0.00000001);

                    for (const element of nodes) {
                        const value = pValue * (element.proportion / sumVuale); // 归一化
                        recursive(element, value);
                    }
                }
                return node;
            }

            function findMax(maxNode) {
                maxNode.maxValue = parseFloat(maxNode.proportion).toFixed(2);

                const nodes: any[] = maxNode.children;
                if (nodes && nodes.length > 0) {
                    const max = nodes.find((e) => {
                        return e.max;
                    });
                    findMax(max);
                }
            }

            recursive(tempData, tempData.proportion);
            if (ctx.type !== 'hpc') {
              findMax(tempData);
            }

            return tempData;
        }

        function deepClone(val) {
            const type = typeof val;
            if (type !== 'object' || val === null) {
                return val;
            }

            const isArr = Array.isArray(val);
            const tmpCopy = isArr ? [] : {};

            for (const element of Object.keys(val)) {
                tmpCopy[element] = deepClone(val[element]);
            }
            return tmpCopy;
        }

        return svg.node();
    }

    /**
     * 浏览器类型判断
     */
    public isIE() {
        // Internet Explorer 6-11
        return /*@cc_on!@*/false || !!(document as any).documentMode;
    }

    public getMinHeight() {
        const svgDom = this.el.nativeElement.querySelector('#icicleSvg');
        if (svgDom) {
            const minHeight = Math.ceil(svgDom.getBoundingClientRect().height);
            if (minHeight) {
                this.echartHeight = minHeight + 90;
                this.changeHeight.emit(this.echartHeight);
            }
        } else {
            this.echartHeight = 600;
            this.changeHeight.emit(this.echartHeight);
        }
    }
}
