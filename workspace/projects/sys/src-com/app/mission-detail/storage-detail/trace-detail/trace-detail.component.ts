import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, Input, ChangeDetectorRef } from '@angular/core';
import { TiTableRowData, TiTableColumns } from '@cloud/tiny3';
import { I18nService } from '../../../service/i18n.service';
import { TooltipManager, SvgElementInfo } from './trace-detail.helper';
import { HyTheme, HyThemeService } from 'hyper';
import * as Util from '../../../util';

// 操作类型
const OPERATE = {
  READ_AND_WRITE: 0,
  READ: 1,
  WRITE: 2,
};
// legend
const LEGEND_NUMBER = 3;
// svg线条范围
const LINE_WIDTH = {
  MIN: 1,
  MAX: 6,
  INTERVAL: 5
};
const PAGE_ID_LENGTH = 20;
// 平均时延最小精度
const AVG_DELAY_MIN_PRECISION = 0.000001;
@Component({
  selector: 'app-trace-detail',
  templateUrl: './trace-detail.component.html',
  styleUrls: ['./trace-detail.component.scss']
})

export class TraceDetailComponent implements OnInit, AfterViewInit {

  @ViewChild('svgWrapper', { static: true, read: ElementRef }) el: ElementRef;
  @Input() staticData: any;
  @Input() header: any;
  @Input() descData: any;
  @Input() platform: any;
  public i18n: any;
  public isTable = false;
  public myOptions: Array<any> = [];
  public typeOptions: Array<any> = [];
  public select: any;
  public selectType: any;
  public displayedData: Array<TiTableRowData> = [];
  public srcData: any = { data: [] };
  public columns: Array<TiTableColumns> = [];
  public svgData: any;
  public threshold = [
    { min: 0, max: 0},
    { min: 0, max: 0},
    { min: 0, max: 0},
  ];
  public kbArr: any = [];
  public rqArr: any = [];
  public kbAvgArr: any = [];
  public rqAvgArr: any = [];
  public color = ['#2aa956', '#e66e11', '#e2253b'];
  public showSort = false;
  public valueBack: any = [];
  public currentTheme: void | HyTheme;
  public mainHeader: any = [];
  public pageId: string;
  // 记录被 mouseenter 事件污染（“触摸”）的元素对象
  public currentSvgElement: any;

  // 存储所有SVG元素的数组，便于批量操作
  public storageSubsystemArray: Array<any> = [];
  public Q2M = new SvgElementInfo();
  public M2D = new SvgElementInfo();
  public M2I = new SvgElementInfo();
  public Q2G = new SvgElementInfo();
  public G2I = new SvgElementInfo();
  public I2D = new SvgElementInfo();
  public D2C = new SvgElementInfo();
  public G2D = new SvgElementInfo();
  public idArray = ['D2C', 'G2I', 'Q2G', 'Q2M', 'I2D', 'M2D', 'M2I', 'G2D'];
  public language: string;
  public totalStage = 0;

  // tooltip
  private tooltipManager: TooltipManager;
  public niceTooltipInfo: {
    html: string,
    context: any,
    top: { pointX: number, pointY: number },
    bottom: { pointX: number, pointY: number }
  };
  public niceTooltipShowCopy = false;
  set niceTooltipShow(val) {
    this.niceTooltipShowCopy = val;
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }
  get niceTooltipShow() {
    return this.niceTooltipShowCopy;
  }
  // 渲染动作
  public renderSvgAction = () => { };

  constructor(
    public i18nService: I18nService,
    private cdr: ChangeDetectorRef,
    private themeServe: HyThemeService
    ) {
    this.i18n = this.i18nService.I18n();
  }
  ngOnInit(): void {
    const lang = sessionStorage.getItem('language') || (self as any).webviewSession.getItem('language');
    this.language = lang.indexOf('en') >= 0 ? 'en' : 'zh';
    this.myOptions = [
      { value: 0, label: this.i18n.storageIO.summury.rq_delay },
      { value: 1, label: this.i18n.storageIO.summury.kb_delay }
    ];
    this.typeOptions = [
      { value: 0, label: this.i18n.storageIO.summury.rw_static },
      { value: 1, label: this.i18n.storageIO.summury.r_static },
      { value: 2, label: this.i18n.storageIO.summury.w_static },
    ];
    this.currentTheme = this.themeServe.getTheme();
    if (this.currentTheme === HyTheme.Light) {
      this.color = ['#2aa956', '#e66e11', '#e2253b'];
    } else {
      this.color = ['#61d274', '#e66e11', '#ed4b4b'];
    }
    this.select = this.myOptions[0];
    this.selectType = this.typeOptions[0];
    this.getQ2CData();
    this.getThreshold();
    this.mainHeader = JSON.parse(JSON.stringify(this.header[0]));
    const mainHeaderOptions = [
      { name: 'A', label: this.i18n.storageIO.summury.rw_static },
      { name: 'R', label: this.i18n.storageIO.summury.r_static },
      { name: 'W', label: this.i18n.storageIO.summury.w_static },
    ];
    this.mainHeader.unshift({
      title: this.i18n.storageIO.summury.io_operate,
      rowspan: 2,
      sort: false,
      options: mainHeaderOptions,
      selected: mainHeaderOptions,
      multiple: true,
      selectAll: true,
      key: '',
    }, {
      title: this.i18n.storageIO.stage,
      rowspan: 2,
      sort: true,
      sortKey: 'stage',
      width: '80px'
    });
    Object.keys(this.staticData).forEach((operate: any) => {
      Object.keys(this.staticData[operate]).forEach((param: any) => {
        const obj = this.flatten(this.staticData[operate][param]);
        obj.operate = operate;
        obj.operateName = this.getOperateName(operate);
        obj.stage = param;
        this.valueBack.push(obj);
      });
    });
    this.totalStage = Object.keys(this.staticData?.A).length;
    this.srcData.data = this.valueBack;
    this.pageId = Util.generateConversationId(PAGE_ID_LENGTH);
  }
  ngAfterViewInit() {
    this.storageSubsystemArray = [this.D2C, this.G2I, this.Q2G, this.Q2M, this.I2D, this.M2D, this.M2I, this.G2D];

    for (const item of this.storageSubsystemArray) {
      item.initSelectionById(this.el);
    }
    this.renderThresholdSvg();
    this.renderPercentSvg();
    this.tooltipManager = new TooltipManager(this);

    // 设置有效SVG元素的 mouseenter 和 mouseleave 事件
    this.storageSubsystemArray.forEach((item: any, index: number) => {
      item.selection
        .on('mouseenter', () => {
          this.currentSvgElement = item;
          const name = this.idArray[index];
          this.tooltipManager.show(item, name, this.svgData[name], this.select.value, this.descData[name].annotation);
        })
        .on('mouseleave', () => {
          this.tooltipManager.hidden();
        });
    });
  }
  private getOperateName(operate: string){
    if (operate === 'A') {
      return this.i18n.storageIO.summury.rw_static;
    } else if (operate === 'R') {
      return this.i18n.storageIO.summury.r_static;
    } else {
      return this.i18n.storageIO.summury.w_static;
    }
  }
  public getQ2CData() {
    if (this.selectType.value === OPERATE.READ_AND_WRITE) {
      this.svgData = this.staticData.A;
    } else if (this.selectType.value === OPERATE.READ) {
      this.svgData = this.staticData.R;
    } else {
      this.svgData = this.staticData.W;
    }
  }
  public onTraceTypeChange() {
    this.getQ2CData();
    this.getThreshold();
    this.renderThresholdSvg();
    this.renderPercentSvg();
  }
  private getThreshold() {
    this.kbArr = [];
    this.rqArr = [];
    this.kbAvgArr = [];
    this.rqAvgArr = [];
    this.idArray.forEach((stage: any) => {
      this.kbArr.push(parseFloat(this.svgData[stage].kb_n));
      this.rqArr.push(parseFloat(this.svgData[stage].rq_n));
      this.kbAvgArr.push(parseFloat(this.svgData[stage].kb_avg));
      this.rqAvgArr.push(parseFloat(this.svgData[stage].rq_avg));
    });
  }
  public renderThresholdSvg() {
    const legendMin = Math.min.apply(null, this.select.value ? this.kbAvgArr : this.rqAvgArr);
    const legendMax = Math.max.apply(null, this.select.value ? this.kbAvgArr : this.rqAvgArr);
    const legendInterval = +((legendMax - legendMin) / LEGEND_NUMBER).toFixed(6);
    const lineMin = Math.min.apply(null, this.select.value ? this.kbArr : this.rqArr);
    const lineMax = Math.max.apply(null, this.select.value ? this.kbArr : this.rqArr);
    const lineInterval = (lineMax - lineMin) / LINE_WIDTH.INTERVAL;
    if (legendMax === legendMin) {
      this.threshold = [
        {
          min: legendMin, max : legendMax
        }
      ];
    } else {
      this.threshold = [
        {
          min: legendMin,
          max: (legendMin + legendInterval).toFixed(6)
        },
        {
          min: (legendMin + legendInterval + AVG_DELAY_MIN_PRECISION).toFixed(6),
          max: (legendMax - legendInterval).toFixed(6)
        },
        {
          min: (legendMax - legendInterval + AVG_DELAY_MIN_PRECISION).toFixed(6),
          max: legendMax
        },
      ];
    }
    this.idArray.forEach((id: any) => {
      let colorPeriod = 0;
      let widthPeriod = 0;
      const currentAvgValue = this.select.value ? +this.svgData[id].kb_avg : +this.svgData[id].rq_avg;
      const currentCountValue = this.select.value ? +this.svgData[id].kb_n : +this.svgData[id].rq_n;
      if (!legendInterval) {
        colorPeriod = 0;
      } else if (currentAvgValue === legendMax) {
        colorPeriod = this.color.length - 1;
      } else {
        colorPeriod = this.threshold.findIndex((item: any) => {
          return item.min <= currentAvgValue && currentAvgValue <= item.max;
        });
      }
      if (lineInterval) {
        widthPeriod = Math.floor((currentCountValue - lineMin) / lineInterval);
      }
      const line = document.querySelector('#' + this.pageId + ' #' + id + ' #Top');
      line.setAttribute('stroke', this.color[colorPeriod]);
      line.setAttribute('stroke-width', widthPeriod + LINE_WIDTH.MIN + '');
      document.querySelector('#' + this.pageId + ' #' + id + ' #Down').setAttribute('fill', this.color[colorPeriod]);
      document.querySelector('#' + this.pageId + ' #' + id + 'Name').setAttribute('fill', this.color[colorPeriod]);
    });
  }
  private renderPercentSvg() {
    const name = this.i18n.storageIO.summury.trace_static + ' ';
    this.storageSubsystemArray.forEach((item: any, index: number) => {
      const target = this.idArray[index];
      item.selection.find('#' + target + 'Text tspan').text(name + this.svgData[target].percent + '%');
    });
  }
  public onSelect(){
    const operateTarget = this.mainHeader[0];
    this.srcData.data = this.valueBack.filter((rowData: any) => {
      if (operateTarget.selected?.length > 0) {
        const index: number = operateTarget.selected.findIndex((item: any) => {
          return item.name === rowData.operate;
        });
        return index >= 0;
      } else {
        return false;
      }
    });
    if (operateTarget.selected?.length === 1) {
      this.showSort = true;
    } else {
      this.showSort = false;
    }
  }
  private flatten(obj: any) {
    const result: any = {};

    function recurse(src: any, prop: any) {
        const toString = Object.prototype.toString;
        if (toString.call(src) === '[object Object]') {
            let isEmpty = true;
            Object.keys(src).forEach((p: any) => {
              isEmpty = false;
              recurse(src[p], prop ? prop + '.' + p : p);
            });
            if (isEmpty && prop) {
                result[prop] = {};
            }
        } else if (toString.call(src) === '[object Array]') {
            const len = src.length;
            if (len > 0) {
                src.forEach((item: any, index: number) => {
                    recurse(item, prop ? prop + '.[' + index + ']' : index);
                });
            } else {
                result[prop] = [];
            }
        } else {
            result[prop] = src;
        }
    }
    recurse(obj, '');

    return result;
  }
}

