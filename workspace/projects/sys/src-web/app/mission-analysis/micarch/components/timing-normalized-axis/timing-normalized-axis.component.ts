import {
  Component, OnInit, AfterViewInit, AfterViewChecked,
  ElementRef, Input, ViewChild
} from '@angular/core';
import * as d3 from 'd3';
import { AxiosService } from 'projects/sys/src-web/app/service/axios.service';
import * as Util from 'projects/sys/src-web/app/util';

@Component({
  selector: 'app-timing-normalized-axis',
  templateUrl: './timing-normalized-axis.component.html',
  styleUrls: ['./timing-normalized-axis.component.scss']
})
export class TimingNormalizedAxisComponent implements OnInit, AfterViewInit, AfterViewChecked {
  @ViewChild('normalizedStackedAxis', { static: true }) axisContainerEl: ElementRef;

  // 图表数据
  public optionCopy: {
    size: { width: number, height: number },
    domain: [number, number]
  };
  @Input()
  set option(val) {
    this.optionCopy = val;
    if (this.optionCopy) {
      this.renderXAxisAction();
    }
  }
  get option() {
    return this.optionCopy;
  }

  // 热点区域
  public hotDomainCopy: [number, number];
  @Input()
  set hotDomain(val) {
    this.hotDomainCopy = val;
    if (this.xAxisEntity) {
      this.xAxisEntity.transform(this.hotDomainCopy);
    }
  }
  get hotDomain() {
    return this.hotDomainCopy;
  }

  public axisSelection: JQuery;
  public xAxisEntity: { svg: any, transform: any, amend: () => void };
  public currentAxisWidth = 0;
  public viewChangeDebounceTimer: any;
  // tick 值的format方法
  public format: (d: number) => string;
  // 渲染动作
  public renderXAxisAction = () => { };

  constructor(
    private axios: AxiosService,
  ) {
    this.format = (num: number) => Util.fixThouSeparator(num + 'ms');
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.axisSelection = $(this.axisContainerEl.nativeElement);
    // 挂载SVG
    this.renderXAxisAction = () => {
      if (this.option != null && Object.keys(this.option).length > 0) {
        this.axisSelection.empty();
        this.xAxisEntity = this.renderXAxis(this.option);
        this.axisSelection.append(this.xAxisEntity.svg.node());
        // 在 node 挂载完成后手动修正坐标样式
        this.xAxisEntity.amend();
      }
    };
    this.renderXAxisAction();
  }

  /**
   * 监控视图变化, 在dispaly：none的情况下，不能获取DOM元素的实际宽高
   */
  ngAfterViewChecked(): void {
    if (this.axisSelection
      && this.axisSelection.length > 0
      && this.xAxisEntity
      && this.option) {
      if (this.currentAxisWidth === 0 && this.axisSelection.width() > 0) { // 视图突变
        this.xAxisEntity.amend();
      }
      this.currentAxisWidth = this.axisSelection.width();
    }
  }

  public renderXAxis({ size, domain }: any): { svg: any, transform: (d: any) => void, amend: () => void } {
    const width: number = size.width;
    const height: number = size.height;

    const svg = d3.create('svg')
      .attr('viewBox', [0, 0, width, height].toString())
      .attr('width', width)
      .attr('height', height);

    const xChart = svg.append('g')
      .attr('class', 'axis-warpper');

    const xScale = d3.scaleLinear()
      .range([0, width])
      .domain([Math.min(...domain), Math.max(...domain)]);

    const xAxis = d3.axisBottom(xScale)
      .tickFormat((d: any) => {
        return this.format(d);
      })
      .tickSizeInner(3)
      .tickSizeOuter(0);

    // 修正坐标轴的样式
    const amendAxisStyle = (axis: any) => {
      xChart.call(axis)
        .call(g => g.selectAll('.domain')
          .attr('stroke', '#E6EBF5'))
        .call(g => g.selectAll('.tick text')
          .attr('fill', '#9EA4B3'))
        .call(g => g.selectAll('.tick line')
          .attr('stroke', '#9EA4B3'))
        .call(g => {
          const svgRect = svg.node().getBoundingClientRect();

          const tickNodes: any[] = g.selectAll('.tick').nodes();
          const firstTickNode = tickNodes[0];
          const lastTickNode = tickNodes[tickNodes.length - 1];

          const firstTickRect = firstTickNode.getBoundingClientRect();
          const lastTickRect = lastTickNode.getBoundingClientRect();
          if (firstTickRect.left < svgRect.left) {
            $(firstTickNode).attr({ opacity: 0 });
          }

          if (lastTickRect.right > svgRect.right) {
            $(lastTickNode).attr({ opacity: 0 });
          }
        });
    };
    amendAxisStyle(xAxis);

    // 缩放函数
    const transform = (newDomain: any) => {
      const newXScale = d3.scaleLinear()
        .range([0, width])
        .domain([Math.min(...newDomain), Math.max(...newDomain)]);
      amendAxisStyle(xAxis.scale(newXScale));
    };

    return { svg, transform, amend: () => amendAxisStyle(xAxis) };
  }
}
