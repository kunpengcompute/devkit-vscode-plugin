import { Component, ElementRef, Input, Output, EventEmitter, HostListener,
  AfterViewInit, ViewChild, ChangeDetectorRef, AfterViewChecked, TemplateRef } from '@angular/core';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import * as d3 from 'd3';

// 类型别名
type TwoNumberArray = [number, number];
interface CheckedItemType { name: string; color: string; isChecked: boolean; }
interface AxisOptionType { size: { width: number, height: number }; domain: TwoNumberArray; }
interface SingleTimingDataType {
  name: string;
  option: {
    data: any,
    size: { width: number, height: number },
    color: string[],
    domain: TwoNumberArray,
    columns: string[],
    cd: (d: any) => any
  };
}
interface ExtrapositionOptionType {
  domain: TwoNumberArray;
  format: (d: string | number) => string;
}
interface FlagTooltipInfoType {
  pos: { left: number, top: number };
  html: string | TemplateRef<any>;
  context?: {
    timestamp: string | number,
    tipText: string,
    tipItems: Array<any>
  };
}
interface BreadcrumbOptionType { title: string; id?: number | string; }
interface ChartDateItemType { name: string; type: string; value: any[]; cd: (d: any) => any; }
interface RowSingleChartDateType { data: ChartDateItemType; path: string; }

@Component({
  selector: 'app-timing-normalized',
  templateUrl: './timing-normalized.component.html',
  styleUrls: ['./timing-normalized.component.scss']
})
export class TimingNormalizedComponent implements AfterViewInit, AfterViewChecked {
  @ViewChild('timingNormalContainer', { static: true }) containerEl: ElementRef;
  @ViewChild('tipContent', { static: true }) tipContent: TemplateRef<any>;

  /******* 输入输出相关参数 *******/
  // 时序图表格 时序图数据
  public dataCopy: any[];
  @Input()
  set data(val: any[]) {
    if (val != null && val.length > 0) {
      this.timingNormalShow = true;
      const type = val[0].type;
      this.titleName = this.titleNameDict[type];
      this.dataCopy = val;
      this.processTableTimingData(this.currentItemChartWidthCopy, this.dataCopy);
    } else {
      this.timingNormalShow = false;
    }
  }
  // "热点区域"范围
  @Input()
  set hotspotDomain(domain: any) {
    if (domain == null || domain[1] - domain[0] <= 0) {
      return;
    }
    this.chartHotDomain = domain;
  }
  // 事件： 时序图缩放
  @Output() timingTransform = new EventEmitter<TwoNumberArray>();

  /********** 核心参数 **********/
  // 当前 chart 所在的容器的宽度
  public currentItemChartWidthCopy: number;
  set currentItemChartWidth(width) {
    this.currentItemChartWidthCopy = width;
    this.processTableTimingData(this.currentItemChartWidthCopy, this.dataCopy);
    this.prcessSingleTimingData(this.currentItemChartWidthCopy, this.currentRowSingleChartDate);
  }
  get currentItemChartWidth() {
    return this.currentItemChartWidthCopy;
  }
  // 最大的数据范围
  public maxChartDomain: TwoNumberArray;
  // "热点" 区域的范围
  public chartHotDomain: TwoNumberArray;
  // 颜色和数据项的对照表
  readonly colorList = ['#D6E4FF', '#ADC6FF', '#85A5FF', '#597EF7', '#2F54EB'];

  /******* 时序表格 相关参数 *******/
  // 图表的数据
  public tableTimingData: SingleTimingDataType[];
  // 图表中固定渲染的数据项
  readonly tableChartDefaultItems = ['Retiring', 'Front-End Bound', 'Bad Speculation', 'Back-End Bound'];
  // 数据项选择的配置列表
  public tableCheckboxOption: CheckedItemType[];
  // 数据项 与 颜色 的比例尺
  public tableColorScale: any;

  /******* 时序单列 相关参数 *******/
  // 单列的数据
  public singleTimingData: SingleTimingDataType;
  // 数据项选择的配置列表
  public singleCheckboxOption: CheckedItemType[];
  // 面包屑数据
  public breadcrumbOptionList: BreadcrumbOptionType[];
  // 图表数据字典
  public singleTimingDataDict: any = {};
  // 数据选项字典
  public singleCheckboxDict: any = {};
  // 当前图表数据
  public currentRowSingleChartDate: RowSingleChartDateType;
  // 数据项 与 颜色 的比例尺
  public singleColorScale: any;

  /******** tooltip 相关参数 *******/
  // tooltip 信息
  public flagTooltipInfo: FlagTooltipInfoType;
  public flagTooltipShow = false;

  /******* 时间轴 相关参数 ********/
  // 外部 x 轴的相关参数
  public extrapositionOption: ExtrapositionOptionType = {
    domain: [0, 0],
    format: (d) => d.toString()
  };
  // 单个 x 时间轴的参数
  public xAxisOption: AxisOptionType;

  /*********** 其他参数 **********/
  public i18n: any;
  public titleName = 'CPU';
  public titleNameDict: any;
  public containerSelection: JQuery;
  public prevClientWidth = 0;
  public onResizeTimer: any;
  private doneViewInit = false;
  readonly timestampName = 'Timestamp';
  public timingNormalShow = true; // FIXME 通过 opacity 来实现无数据实在不行

  @HostListener('window:resize')
  onResize() {
    if (this.containerSelection != null
      && this.containerSelection.length > 0
      && this.containerSelection.width() > 0) {
      clearTimeout(this.onResizeTimer);
      this.onResizeTimer = setTimeout(() => {
        this.currentItemChartWidth = this.containerSelection.width() - 90;
      }, 100);
    }
  }

  constructor(
    private cdr: ChangeDetectorRef,
    public i18nService: I18nService,
  ) {
    this.i18n = this.i18nService.I18n();
    this.titleNameDict = {
      Core: 'CPU',
      Module: this.i18n.common_term_task_tab_summary_module,
      Tid: this.i18n.common_term_task_tab_summary_thread,
      Pid: this.i18n.common_term_projiect_task_process
    };
  }

  ngAfterViewInit(): void {
    this.containerSelection = $(this.containerEl.nativeElement);

    // TODO：修改魔法数字
    this.currentItemChartWidth = this.containerSelection.width() - 90;
    this.processTableTimingData(this.currentItemChartWidth, this.dataCopy);
  }

  // 监控视图变化————应对display: none下的取不到DOM的宽高
  ngAfterViewChecked(): void {
    if (this.containerSelection) {
      if (this.prevClientWidth === 0 && this.containerSelection.width() > 0) { // 渲染的必要条件: 视图突变
        if (this.doneViewInit) { return; }
        this.currentItemChartWidth = this.containerSelection.width() - 90;
        this.doneViewInit = true;
      }
      this.prevClientWidth = this.containerSelection.width(); // 在判断之后，将经过判断的值暂存
    }
  }

  public onCharPointerMove({ data, pos, posInChart }: any, target: 'table' | 'single') {
    if (posInChart != null && posInChart.left < 0) {
      this.flagTooltipShow = false;
      return;
    }
    this.flagTooltipShow = true;

    const tipItemList: { color: string | null, title: string, value: string | number }[] = [];

    // 计算tooltip的数据
    switch (target) {
      case 'table':
        const effectKeys = this.tableCheckboxOption.filter(item => item.isChecked).map(item => item.name);
        const otherKeys = Object.keys(data).filter(key => !effectKeys.includes(key) && key !== this.timestampName);

        for (const key of otherKeys) {
          tipItemList.push({ color: null, title: key, value: data[key] });
        }
        let effectItemsSum = 0.000001;
        for (const key of effectKeys) {
          effectItemsSum += (+data[key]);
        }
        for (const key of effectKeys) {
          const tmpValue = Math.round(data[key] / effectItemsSum * 10000) / 100;
          tipItemList.push({ color: this.tableColorScale(key), title: key, value: tmpValue + '%' });
        }
        break;
      case 'single':
        const singleEffectKeys = this.singleCheckboxOption.filter(item => item.isChecked).map(item => item.name);

        let singleItemsSum = 0.000001;
        for (const key of singleEffectKeys) {
          singleItemsSum += (+data[key]);
        }
        for (const key of singleEffectKeys) {
          const tmpValue = Math.round(data[key] / singleItemsSum * 10000) / 100;
          tipItemList.push({ color: this.singleColorScale(key), title: key, value: tmpValue + '%' });
        }
        break;
      default:
    }

    // 计算 tooltip 的位置
    const { left, top } = this.containerSelection.get(0).getBoundingClientRect();
    let actTop = pos.top - top;
    const actleft = pos.left - left;
    if ( actTop > 222 ) {
      target === 'table' ? actTop = 222 : actTop = actTop - 80 ;
    }

    this.flagTooltipInfo = {
        pos: {
          left: actleft,
          top: actTop
        },
        html: this.tipContent,
        context: {
          timestamp: data[this.timestampName],
          tipText: this.i18n.micarch.timingTable.tooltip.clickColorDlock,
          tipItems: tipItemList
        }
      };
    this.cdr.markForCheck();
    this.cdr.detectChanges();

  }

  public onChartTransform(domain: TwoNumberArray) {
    this.chartHotDomain = domain;
    this.cdr.detectChanges();
    this.timingTransform.emit(domain);
  }

  public onChartPointerLeave() {
    this.flagTooltipShow = false;
  }

  public onChartPointerEnter() {
    this.flagTooltipShow = true;
  }

  public onTableChartClick(val: RowSingleChartDateType) {
    const { data, path } = val;

    this.currentRowSingleChartDate = val;
    this.singleTimingDataDict = {};
    this.singleCheckboxDict = {};
    this.breadcrumbOptionList = [];

    this.breadcrumbOptionList.push({ title: data.name });
    this.breadcrumbOptionList.push({ title: path });

    const { timingData, checkboxOption } = this.prcessSingleTimingData(this.currentItemChartWidth, val);
    this.singleTimingDataDict[path] = timingData;
    this.singleCheckboxDict[path] = checkboxOption;
  }

  public onSingleChartClick(val: RowSingleChartDateType) {
    this.currentRowSingleChartDate = val;
    this.breadcrumbOptionList.push({ title: val.path });

    const { timingData, checkboxOption } = this.prcessSingleTimingData(this.currentItemChartWidth, val);
    this.singleTimingDataDict[val.path] = timingData;
    this.singleCheckboxDict[val.path] = checkboxOption;
  }

  public onBreadcrumbClick(crumbList: BreadcrumbOptionType[]) {
    this.breadcrumbOptionList = crumbList;

    const crumbLen = crumbList.length;
    if (crumbLen > 0) {
      const { title } = crumbList[crumbLen - 1];
      this.singleTimingData = this.singleTimingDataDict[title];
      this.singleCheckboxOption = this.singleCheckboxDict[title];
    } else {
      this.singleTimingData = null;
    }
  }

  public onTableCheckboxClick(checkedOption: CheckedItemType[]) {
    this.tableCheckboxOption = checkedOption;

    const tmp = this.tableTimingData.map((item: SingleTimingDataType) => {
      item.option.columns = checkedOption.filter(item1 => item1.isChecked).map(item1 => item1.name);
      item.option.color = checkedOption.filter(item2 => item2.isChecked).map(item2 => item2.color);
      return item;
    });
    this.tableTimingData = this.cloneDeep(tmp);
  }

  public onSingleCheckboxClick(checkedOption: CheckedItemType[]) {
    const option = this.singleTimingData.option;

    option.columns = checkedOption.filter(item => item.isChecked).map(item => item.name);
    option.color = checkedOption.filter(item => item.isChecked).map(item => item.color);
    this.singleTimingData = this.cloneDeep(this.singleTimingData);

    const crumb = this.breadcrumbOptionList[this.breadcrumbOptionList.length - 1];
    this.singleTimingDataDict[crumb.title] = this.singleTimingData;
  }

  private processTableTimingData(width: number, chartData: ChartDateItemType[]) {
    if (width == null || width <= 0) {
      return;
    }
    if (chartData == null || chartData.length === 0) {
      return;
    }

    // 计算 color-checkbox 的参数
    // 比例尺，应与 timing-normal-chart 使用相同的比例尺
    this.tableColorScale = d3.scaleOrdinal()
      .domain(this.tableChartDefaultItems)
      .range(this.colorList);

    this.tableCheckboxOption = [];
    for (const name of this.tableChartDefaultItems) {
      this.tableCheckboxOption.push({ name, color: this.tableColorScale(name) as string, isChecked: true });
    }

    // 找出最大 timestamp 的范围
    const maxLength = Math.max(...chartData.map((item: any) => item.value.length));
    const maxTimestampLenItem = chartData.find((d) => d.value.length === maxLength);
    const timestampArry = maxTimestampLenItem.value.map(d => d.Timestamp);
    this.maxChartDomain = [Math.min(...timestampArry), Math.max(...timestampArry)];

    // 处理颜色 及其显示列
    const timingData = chartData.map(item => {
      const option = {
        data: item.value,
        size: { width, height: 56 }, // TODO 明确常数的意义
        color: this.tableCheckboxOption.map(item1 => item1.color),
        domain: this.maxChartDomain,
        columns: this.tableCheckboxOption.map(item2 => item2.name),
        cd: item.cd
      };
      return { ...item, option };
    });

    this.tableTimingData = timingData;
    this.xAxisOption = { size: { width, height: 32 }, domain: this.maxChartDomain }; // TODO 明确常数的意义
    this.cdr.detectChanges();
  }

  private prcessSingleTimingData(width: any, singleChartData: RowSingleChartDateType): {
    timingData: SingleTimingDataType,
    checkboxOption: CheckedItemType[]
  } {
    if (width == null || width <= 0) {
      return void 0;
    }
    if (singleChartData == null || Object.keys(singleChartData).length === 0) {
      return void 0;
    }

    const singleData = singleChartData.data;

    // 计算 color-checkbox 的参数
    const effectiveItems: string[] = Object.keys(singleData.value[0]).filter(item => item !== 'Timestamp');
    // 比例尺，应与 timing-normal-chart 使用相同的比例尺
    this.singleColorScale = d3.scaleOrdinal()
      .domain(effectiveItems)
      .range(this.colorList);

    this.singleCheckboxOption = [];
    for (const name of effectiveItems) {
      this.singleCheckboxOption.push({ name, color: this.singleColorScale(name) as string, isChecked: true });
    }

    const option = {
      data: singleData.value,
      size: { width, height: 118 }, // TODO 明确常数的意义
      color: this.singleCheckboxOption.map(item => item.color),
      domain: this.maxChartDomain,
      columns: this.singleCheckboxOption.map(item => item.name),
      cd: singleData.cd
    };

    this.singleTimingData = { ...singleData, option };

    return {
      timingData: this.singleTimingData,
      checkboxOption: this.singleCheckboxOption
    };
  }

  private cloneDeep(value: any) {
    function clone(obj: any) {
      const tmp = new obj.constructor();
      if (obj instanceof Date) {
        return new Date(obj);
      }
      if (obj instanceof RegExp) {
        return new RegExp(obj);
      }
      if (typeof obj !== 'object') {
        return obj;
      }
      for (const item of Object.keys(obj)) {
        tmp[item] = clone(obj[item]);
      }
      return tmp;
    }

    return clone(value);
  }
}
