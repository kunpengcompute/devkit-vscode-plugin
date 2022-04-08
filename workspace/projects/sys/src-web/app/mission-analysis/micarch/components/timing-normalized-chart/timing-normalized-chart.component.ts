import {
  Component, OnInit, AfterViewInit, EventEmitter,
  Input, ElementRef, Output, ViewChild
} from '@angular/core';
import * as d3 from 'd3';
import { AxiosService } from 'projects/sys/src-web/app/service/axios.service';

@Component({
  selector: 'app-timing-normalized-chart',
  templateUrl: './timing-normalized-chart.component.html',
  styleUrls: ['./timing-normalized-chart.component.scss']
})
export class TimingNormalizedChartComponent implements OnInit, AfterViewInit {
  @Input()
  set option(val) {
    this.optionCopy = val;

    if (this.optionCopy == null || Object.keys(this.optionCopy).length === 1) {
      this.removeChartAction();
    } else {
      this.renderChartAction();
    }
  }
  get option() {
    return this.optionCopy;
  }
  @Input()
  set hotDomain(val) {
    this.hotDomainCopy = val;
    if (this.chartEntity) {
      this.chartEntity.transform(this.hotDomainCopy);
    }
  }
  get hotDomain() {
    return this.hotDomainCopy;
  }

  constructor(
    public axios: AxiosService
  ) { }
  @ViewChild('normalizedStackedChart', { static: true }) private containerRef: ElementRef;

  // 图表数据
  public optionCopy: {
    data: [],
    size: { width: number, height: number },
    color: string[],
    domain: [number, number],
    columns: string[],
    cd: () => {}
  } | null;

  // 热点范围
  public hotDomainCopy: [number, number];

  // 事件
  @Output() pointerMove = new EventEmitter<{
    data: any, pos: { left: number, top: number }, posInChart?: { left: number, top: number }
  }>();
  @Output() chartClick = new EventEmitter();
  @Output() chartTransform = new EventEmitter<any>();
  @Output() pointerEnter = new EventEmitter();
  @Output() pointerLeave = new EventEmitter();

  // 随机ID 及其 选择器
  public chartSelection: JQuery;
  public chartEntity: { svg: any, transform: any };

  // 渲染动作 目的：便于控制动作有效的时机，减少额外的判据
  private renderChartAction = () => { };
  private removeChartAction = () => { };

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.chartSelection = $(this.containerRef.nativeElement);
    this.removeChartAction = () => {
      this.chartSelection.empty();
    };
    this.renderChartAction = () => {
      this.removeChartAction();
      this.chartEntity = this.renderChart(this.option);
      this.chartSelection.append(this.chartEntity.svg.node());
    };
    this.renderChartAction();
    // 处理滚轮事件
    this.chartSelection.on('wheel', (evt) => { evt.preventDefault(); });
  }

  private renderChart({ data, size, color, domain, columns, cd }: any) {
    const componentCtx: TimingNormalizedChartComponent = this;
    const clipId = 'clip-' + this.axios.generateConversationId(20);
    const height: number = size.height;
    const width: number = size.width;
    let currentXScale: any;
    const stackHoverColor = '#1D39C4';

    // 创建绘图区域
    const svg = d3.create('svg')
      .attr('viewBox', [0, 0, width, height].toString())
      .attr('width', width)
      .attr('height', height)
      .on('mousemove', moved)
      .on('mouseenter', () => {
        componentCtx.pointerEnter.emit();
      })
      .on('mouseleave', () => {
        componentCtx.pointerLeave.emit();
      });

    // 渲染区域(超出这个区域不渲染)
    svg.append('defs').append('SVG:clipPath')
      .attr('id', clipId)
      .append('SVG:rect')
      .attr('width', width)
      .attr('height', height)
      .attr('x', 0)
      .attr('y', 0);

    // 绘图区域
    const clipPath = svg.append('g')
      .attr('clip-path', `url(#${clipId})`)
      .attr('width', width)
      .attr('height', height);

    // 获取填充色
    const colorScale = d3.scaleOrdinal()
      .domain(columns)
      .range(color);

    // 数据布局: TODO 明确order
    const series = d3.stack()
      .keys(columns)
      .offset(d3.stackOffsetExpand)
      .order(d3.stackOrderReverse)
      (data);

    const xScale = d3.scaleLinear()
      .range([0, width])
      .domain([Math.min(...domain), Math.max(...domain)]);
    currentXScale = xScale;

    const yScale = d3.scaleLinear()
      .range([height, 0]);

    // path d参数生成函数
    const area: any = d3.area()
      .x((d: any) => {
        return xScale(+d.data.Timestamp);
      })
      .y0(d => yScale(d[0]))
      .y1(d => yScale(d[1]));

    // 由于 path 元素不能绑定事件, 故再外层 添加一个 <g> 元素
    const cell = clipPath.selectAll('g')
      .data(series)
      .join('g')
      .style('cursor', 'pointer')
      .on('click', (event, d: any) => {
        const res = cd(d.key);
        if (res && res.data && res.data.value.columns.length > 0) {
          componentCtx.chartClick.emit(res);
        }
      })
      .on('mouseenter', function f() {
        d3.select(this).select('path')
          .attr('fill', stackHoverColor);
      })
      .on('mouseleave', function f(event, d) {
        d3.select(this).select('path')
          .attr('fill', colorScale(d.key).toString());
      });

    // 每个单独的色块(由path生成)
    const path = cell.append('path')
      .attr('class', 'path-area')
      .attr('fill', ({ key }): any => colorScale(key))
      .attr('stroke', ({ key }): any => colorScale(key))
      .attr('stroke-width', 0.5)
      .attr('d', (d) => {
        return area(d);
      });

    // 缩放设置
    const zoom = d3.zoom()
      .scaleExtent([1, 32])
      .translateExtent([[0, 0], [width, height]])
      .extent([[0, 0], [width, height]])
      .on('zoom', (event) => {
        currentXScale = event.transform.rescaleX(xScale);
        const newDomain: [number, number] = [currentXScale.invert(0), currentXScale.invert(width)];
        componentCtx.chartTransform.emit(newDomain);
        this.hotDomain = newDomain;
        clipPath.selectAll('.path-area').attr('d', area.x((d: any) => currentXScale(+d.data.Timestamp)));
      });
    clipPath.call(zoom);

    function transform(newDomain: any) {
      currentXScale = d3.scaleLinear()
        .range([0, width])
        .domain([Math.min(...newDomain), Math.max(...newDomain)]);
      clipPath.selectAll('.path-area').attr('d', area.x((d: any) => currentXScale(+d.data.Timestamp)));
    }

    function moved(event: MouseEvent) {
      const { left, top } = componentCtx.chartSelection.get(0).getBoundingClientRect();

      // 计算x坐标提示基线的位置对应的时间值
      const timestamp: number = currentXScale.invert(d3.pointer(event, this)[0]);

      // 通过 rule 的位置信息来计算有效时间值和对应的数据
      const dataTmp = binarySearch(data, timestamp);
      const actPosX = currentXScale(+dataTmp.Timestamp);

      componentCtx.pointerMove.emit({
        data: dataTmp, pos: { left: left + actPosX, top }, posInChart: { left: actPosX, top }
      });
    }

    function binarySearch(dataList: Array<any>, value: number) {
      if (dataList.length === 0) {
        return null;
      }
      if (dataList.length === 1) {
        return dataList[0];
      }
      function recursive(startIndex: any, endIndex: any): any {
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
        const element: any = dataList[pos];
        if (parseFloat(element.Timestamp) < value) {
          return recursive(pos, endIndex);
        } else {
          return recursive(startIndex, pos);
        }
      }
      return recursive(0, dataList.length - 1);
    }

    return { svg, transform };
  }
}
