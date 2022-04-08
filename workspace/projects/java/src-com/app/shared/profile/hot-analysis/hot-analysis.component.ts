import {
  AfterViewInit,
  Component, ElementRef, EventEmitter, Input,
  OnChanges, OnDestroy, OnInit, Output, Renderer2, SimpleChanges, ViewChild
} from '@angular/core';
import { CommonI18nService } from 'projects/java/src-com/app/service/common-i18n.service';
import * as d3 from 'd3';
import * as d3Tip from 'd3-tip';
import { Flamegraph } from '../../../service/flamegraph.service';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { TiTableColumns, TiTableRowData, TiTableSrcData, TiValidationConfig, TiValidators } from '@cloud/tiny3';
import { RegularVerify } from 'projects/java/src-com/app/utils/regular-verify';
import { LibService } from 'projects/java/src-com/app/service/lib.service';
import { EventManager } from '@angular/platform-browser';
import { fromEvent } from 'rxjs';
import { HySpinnerBlurInfo } from 'hyper';
@Component({
  selector: 'app-hot-analysis',
  templateUrl: './hot-analysis.component.html',
  styleUrls: ['./hot-analysis.component.scss']
})
export class HotAnalysisComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {
  @Input() show: boolean; // 需要全屏的dom
  @Input() hotData: any; // 火焰图数据
  @Input() noData: any; // 无数据或者检测不能分析
  @Input() startBtnDisabled: any; // 停止分析状态
  @Input() language: any; // 中英文判断
  @Input() methodData: any;
  @Input() isByteCodeFinished: any; // 字节码
  @Input() isDisassemblyFinished: any; // 热点汇编
  @Output() public hotAnalysisBn = new EventEmitter<any>();
  @Output() public cancelHotAnalysisBn = new EventEmitter<any>();
  @Output() public cleared = new EventEmitter<any>();
  @Output() public methodBn = new EventEmitter<any>();
  @Output() public selectVersion = new EventEmitter<any>();
  @ViewChild('progress', { static: false }) progress: any;
  @ViewChild('divider', { static: false }) divider: any;
  @ViewChild('leftdiv') leftdiv: ElementRef;
  @ViewChild('rightdiv') rightdiv: ElementRef;
  constructor(
    public i18nService: CommonI18nService,
    public flamegraphService: Flamegraph,
    public fb: FormBuilder,
    private renderer2: Renderer2,
    public regularVerify: RegularVerify,
    private libService: LibService,
    private eventManager: EventManager,
    private el: ElementRef,
  ) {
    this.i18n = this.i18nService.I18n();
    this.searchOptions = [
      {
        label: 'searchFlamegraph',
        value: 'searchFlamegraph',
        hints: this.i18n.common_term_flamegraph_search
      },
    ];
    this.legendData = [
      {
        bgColor: '#b7eb8f',
        label: this.i18n.hot_legend_data.javaInvocation
      },
      {
        bgColor: '#d4b106',
        label: this.i18n.hot_legend_data.javaInline
      },
      {
        bgColor: '#87e8de',
        label: this.i18n.hot_legend_data.C
      },
      {
        bgColor: '#ffc069',
        label: this.i18n.hot_legend_data.kernel
      },
      {
        bgColor: '#ff7875',
        label: this.i18n.hot_legend_data.Other
      },
      {
        bgColor: '#b37feb',
        label: this.i18n.hot_legend_data.searchTags
      },
    ];
  }
  @ViewChild('inforDetailDom', { static: false }) inforDetailDom: any;
  @ViewChild('hotFormDom', { static: false }) hotFormDom: any;
  @ViewChild('rebuildHotAnalysis', { static: false }) rebuildHotAnalysis: any;
  @ViewChild('showFullEl') showFullEl: ElementRef;
  public legendDarkColor = ['#95de64', '#ded632', '#4eccc8', '#e89954', '#e85d54', '#d8bff5'];
  // 表单验证部分
  public reportNameValidation: TiValidationConfig = {
    type: 'blur',
  };
  public i18n: any;
  public hotDisabled = true; // 按钮是否禁用
  public noDataTip: string;
  public flamegraph: any = require('d3-flame-graph');
  public hotChart: any;
  public searchOptions: any[] = [];
  public legendData: any[] = []; // 图例提示
  public inforDataHot: any[] = []; // 采样信息
  public inforDetail: any; // 查看详情
  public searchEv: any; // 搜索的值
  public isDisassemblingOpen = false;
  public showAssembleTip = false;
  public assembleTipMsg = '';
  // 采样信息表单
  public formInforData = {
    manuallyStop: {
      label: 'ManuallyStop',
      state: false,
      required: false,
    },
    samplingDuration: {
      label: 'samplingDuration',
      max: 300,
      min: 1,
      value: 60,
      placeholder: '1~300',
      rangeValue: [1, 300],
      format: 'N0',
      required: true,
      disabled: false,
    },
    samplingInterval: {
      label: 'samplingInterval',
      max: 1000,
      min: 1,
      value: 10,
      placeholder: '1~1000',
      rangeValue: [1, 1000],
      format: 'N0',
      required: true,
      disabled: false,
    },
    eventType: {
      label: 'eventType',
      required: true,
    },
    depth: {
      label: 'depth',
      required: false,
      state: true
    },
    disassembling: { // 反汇编
      label: 'disassembling',
      required: false,
      state: false
    },
    maxStackDepth: {
      label: 'maxStackDepth',
      max: 64,
      min: 16,
      value: 16,
      placeholder: '16~64',
      rangeValue: [16, 64],
      format: 'N0',
      required: true,
      disabled: false,
    },
    exclusionMethod: {
      label: 'exclusionMethod',
      placeholder: 'exclusionMethodP',
      required: false,
      disabled: false,
      maxlength: 1000,
      value: ''
    },
    analysisMethod: {
      label: 'analysisMethod',
      placeholder: 'exclusionMethodP',
      required: false,
      disabled: false,
      maxlength: 1000,
      value: ''
    },
    startMethod: {
      label: 'startMethod',
      placeholder: 'startMethodP',
      required: false,
      disabled: false,
      maxlength: 200,
      value: ''
    },
    endMethod: {
      label: 'endMethod',
      placeholder: 'startMethodP',
      required: false,
      disabled: false,
      maxlength: 200,
      value: ''
    },
    kernelCall: {
      label: 'kernelCall',
      required: false,
      state: false
    },
  };
  public hotFormHeadKey: string; // 表单的头部标题
  public hotFormGroup: FormGroup;
  public samplingDurationBlur: HySpinnerBlurInfo;
  public samplingIntervalBlur: HySpinnerBlurInfo;
  public maxStackDepthBlur: HySpinnerBlurInfo;
  public eventTypeOptions = [
    { label: 'CPU', englishname: 'CPU' },
    { label: 'CYCLES', englishname: 'CYCLES' },
  ];
  public eventTypeSelected: any = this.eventTypeOptions[0];
  public hotFormData = {
    duration: 0, // 采样时长
    frequency: 0, // 采样频度
    event: '', // 事件类型
    disassemble: false, // 反汇编
    stackDepth: 64, // 最大栈深度
    excludeMethods: '', // 需要排除的方法
    includeMethods: '', // 必须分析的方法
    startMethod: '', // 触发开始分析的方法
    endMethod: '', // 触发结束分析的方法
    kernelIgnore: false, // 分析内核态调用
  };
  public showChart = false; // 默认不显示火焰图
  public startOnHot = false;
  public showInfor = false; // 默认不显示表格信息
  public rebuildHotKey: string; // 停止热点分析的头部标题
  public docIde = false;
  public beginSample = false; // 开始采集数据
  public noDataInf: any;
  public showSinError = false; // 微调器空值校验
  public showExcError = false; // 输入校验
  public showAssError = false; // 输入校验
  public showSmdError = false; // 输入校验
  public showEmdError = false; // 输入校验
  public showMdError = false; // 开始和结束方法一直校验
  public smdValue = '';
  public emdValue = '';

  public fireNode = {}; // 火焰图点击的Node
  public showTip = true; // 显示提示信息
  public generateID: any;
  public currTheme = 1;
  public ColorTheme = {
    Dark: 1,
    Light: 2
  };
  public dumpState: any = '';
  public recordData = {
    duration: -1,
    createTime: 0,
    startCreating: true,
  };
  public enWidth: any;
  public searchWidth: any;
  private resizeTimer: any = null;
  public showZoom = false; // 默认不显示全屏

  public clickMethodName: any; // 点击的某个方法名
  public hotspotExpand = false; // 默认不展开
  public javaByteCodes: any; // 字节码数据
  public instructionList: any; // 热点数据
  public addressLocation: any; // 时钟周期数据对象
  public hotMapData = new Map();
  // 字节码
  public showBytecode = false; // 默认不显示字节码
  public bytecodeData: any = [];
  public bytecodeL: any; // 保存可锚点的字节码
  // 热点汇编表格
  public addressArr: any = [];
  public toAddressOk: string; // 记录点击的地址
  public displayed: Array<TiTableRowData> = []; // 表示表格实际呈现的数据（开发者默认设置为[]即可）
  public srcData: TiTableSrcData;
  public clockPeriodTotal = 0; // 计算时钟周期总数
  public columns: Array<TiTableColumns> = [
    {
      title: 'clockPeriod',
      width: '15%'
    },
    {
      title: 'address',
      width: '30%'
    },
    {
      title: 'compilation',
      width: '55%'
    },
  ];
  /** 是否展开 */
  public expendState = true;
  public showVersion = false;
  public showJVMSelect = false; // 默认不显示JIT编译版本下拉框，Java调用Java内联显示JIT编译版本下拉框
  public versionOptions: Array<any> = [];
  public versionSelected: any;
  public versionID: any;
  public setBg = ''; // 设置锚点背景色
  public isIE11 = false;
  public tableDataTimer: any; // 定时器刷新表数据
  public listLength = 1000; // 限制每次推送500条
  // 设置分辨率为1280 和1366下字节码和热点汇编高度。
  public bytecodeTbHeight = '';
  public compileDomHeight = '';

  private flameGraphTipRemove: () => void;

  ngOnInit(): void {
    this.srcData = { // 表格源数据，开发者对表格的数据设置请在这里进行
      data: [], // 源数据
      state: {
        searched: false, // 源数据未进行搜索处理
        sorted: false, // 源数据未进行排序处理
        paginated: false // 源数据未进行分页处理
      }
    };
    /**
     * 判断反汇编/字节码解析开关状态
     */
    this.isDisassemblingOpen = this.formInforData.disassembling.state;
    // vscode颜色主题
    if (document.body.className.indexOf('vscode-dark') !== -1) {
      this.currTheme = 1;
      this.setBg = '#313131';
      this.legendData.forEach((item, index) => {
        item.bgColor = this.legendDarkColor[index];
      });
    } else {
      this.currTheme = 2;
      this.setBg = '#F7FAFF';
    }
    if (this.language === 'en-us' || this.language.indexOf('en') !== -1) {
      this.enWidth = '700px';
      this.searchWidth = '360px';
    } else {
      this.searchWidth = '260px';
    }
    fromEvent(window, 'resize').subscribe(event => {
      if (!this.resizeTimer) {
        this.resizeTimer = setTimeout(() => {
          if (Object.keys(this.hotData).length !== 0) {
            if (this.searchEv?.value) {
              this.hotChart.search(this.searchEv.value);
            } else {
              this.initChart();
            }
            this.resizeTimer = null;
            if (this.showZoom) {
              setTimeout(() => {
                this.flameGraphTipRemove?.();
              }, 1000);
            }
          } else {
            this.resizeTimer = null;
          }
        }, 500);
      }
    });
    this.eventManager.addGlobalEventListener('window', 'keyup.esc',
      () => { this.onZoomStatus(false); });
    this.isIE11 = this.msieversion();
    if (document.body.className.indexOf('vscode-light') !== -1 ||
      document.body.className.indexOf('vscode-dark') !== -1) {
      this.docIde = true; // 确认为ide项目打开
    }
    this.generateID = this.libService.generateConversationId(8);
    this.hotFormHeadKey = this.i18n.protalserver_profiling_hot.newHot;
    this.rebuildHotKey = this.i18n.protalserver_profiling_hot.rebuildHot;
    this.hotFormGroup = this.fb.group({
      samplingDuration: new FormControl('', [
        TiValidators.required,
        TiValidators.minValue(1),
        TiValidators.maxValue(300),
      ]),
      samplingInterval: new FormControl('', [
        TiValidators.required,
        TiValidators.minValue(1),
        TiValidators.maxValue(1000),
      ]),
      eventType: new FormControl('', []),
      depth: new FormControl('', []),
      disassembling: new FormControl('', []),
      maxStackDepth: new FormControl('', [
        TiValidators.required,
        TiValidators.minValue(16),
        TiValidators.maxValue(64),
      ]),
      exclusionMethod: new FormControl('', []),
      analysisMethod: new FormControl('', []),
      startMethod: new FormControl('', []),
      endMethod: new FormControl('', []),
      kernelCall: new FormControl('', []),
    });
    /**
     * 微调器回填的初始化
     */
    this.setSpinnerBlur();
    this.initInforDataHot();
    if (Object.keys(this.hotData).length !== 0 && this.hotData?.c.length >= 0) {
      this.initChart();
    }
  }
  ngAfterViewInit(): void {
    const flame = this.el.nativeElement.querySelector('.flame-content');
    fromEvent(flame, 'mouseover').subscribe(event => {
      let tempTimer = setTimeout(() => {
        const flameTipEl = $('.d3-flame-graph-tip.s');
        if (flameTipEl.length) {
          for (let idx = 0; idx < flameTipEl.length - 1; idx++) {
            document.body.removeChild(flameTipEl[idx]);
          }
          const left = flameTipEl[flameTipEl.length - 1].style.left;
          if (parseFloat(left) < 0) { flameTipEl[0].style.left = '10px'; }
        }
        clearTimeout(tempTimer);
        tempTimer = null;
      }, 0);
    });
    // 适配1366 和1280分辨率下字节码和热点汇编高度。
    if (document.body.clientWidth > 1366) {
      this.compileDomHeight = 'calc(100% - 330px)';
      this.bytecodeTbHeight = '260px';
    } else if (document.body.clientWidth <= 1366 && document.body.clientWidth > 1280 ) {
      this.compileDomHeight = 'calc(100% - 282px)';
      this.bytecodeTbHeight = '230px';
    } else if (document.body.clientWidth <= 1280) {
      this.compileDomHeight = 'calc(100% - 257px)';
      this.bytecodeTbHeight = '210px';
    }
  }
  ngOnDestroy() {
    this.divider.hide();
    clearTimeout(this.resizeTimer);
    this.resizeTimer = null;
  }
  initInforDataHot() {
    this.inforDataHot = [
      {
          key: this.i18n.protalserver_profiling_hot.samplingDuration,
          value: '',
          longInfor: false,
          type: 'duration',
        },
        {
          key: this.i18n.protalserver_profiling_hot.samplingInterval,
          value: '',
          longInfor: false,
          type: 'frequency',
        },
      {
        key: this.i18n.protalserver_profiling_hot.eventType,
        value: '',
        longInfor: false,
        type: 'event',
      },
      {
        key: this.i18n.protalserver_profiling_hot.disassembling,
        value: '',
        longInfor: false,
        type: 'disassembling',
      },
      {
        key: this.i18n.protalserver_profiling_hot.maxStackDepth,
        value: '',
        longInfor: false,
        type: 'stackDepth',
      },
      {
        key: this.i18n.protalserver_profiling_hot.exclusionMethod,
        value: '',
        longInfor: false,
        type: 'excludeMethods',
      },
      {
        key: this.i18n.protalserver_profiling_hot.analysisMethod,
        value: '',
        longInfor: false,
        type: 'includeMethods',
      },
      {
        key: this.i18n.protalserver_profiling_hot.startMethod,
        value: '',
        longInfor: false,
        type: 'startMethod',
      },
      {
        key: this.i18n.protalserver_profiling_hot.endMethod,
        value: '',
        longInfor: false,
        type: 'endMethod',
      },
      {
        key: this.i18n.protalserver_profiling_hot.kernelCall,
        value: '',
        longInfor: false,
        type: 'kernelIgnore',
      },
    ];
  }
  /**
   * @param value 微调器回填的初始化
   */
  public setSpinnerBlur(){
    this.samplingDurationBlur = {
      control: this.hotFormGroup.controls.samplingDuration,
      min: 1,
      max: 300,
      defaultValue: 60,
    };
    this.samplingIntervalBlur = {
      control: this.hotFormGroup.controls.samplingInterval,
      min: 1,
      max: 1000,
      defaultValue: 10,
    };
    this.maxStackDepthBlur = {
      control: this.hotFormGroup.controls.maxStackDepth,
      min: 16,
      max: 64,
      defaultValue: 16,
    };
  }
  /**
   * @returns 微调器空值校验
   */
   public verifySpinnerValue(value: any){
    const { control, min, max , defaultValue } = value;
    const changeVal = +control?.value; // number, NaN
    if (changeVal == null || isNaN(changeVal)) {
      this.showSinError = true;
    } else {
      this.showSinError = false;
    }
   }
  /**
   * 判断是否是IE浏览器
   * @returns true false
   */
  private msieversion(): boolean {
    const ua = window.navigator.userAgent;
    const msie = ua.indexOf('MSIE');
    if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) {
      return true;
    } else {
      return false;
    }
  }
  /**
   * 重置输入表单
   */
  resetHotFormDom() {
    this.formInforData.manuallyStop.state = false;
    this.formInforData.disassembling.state = false;
    this.formInforData.samplingDuration.disabled = false;
    this.formInforData.samplingDuration.value = 60;
    this.formInforData.samplingInterval.value = 10;
    this.eventTypeSelected = this.eventTypeOptions[0];
    this.formInforData.depth.state = true;
    this.formInforData.maxStackDepth.value = 16;
    this.formInforData.exclusionMethod.value = '';
    this.formInforData.analysisMethod.value = '';
    this.formInforData.startMethod.value = '';
    this.formInforData.endMethod.value = '';
    this.formInforData.kernelCall.state = false;
  }
  /**
   * 触发点击热点分析按钮
   */
  public onHot() {
    if (!this.startOnHot) {
      this.dataReboot();
      this.resetHotFormDom();
      this.initInforDataHot();
      this.hotFormDom.type = 'none';
      this.hotFormDom.alertTitle = this.i18n.protalserver_profiling_hot.newHot;
      this.hotFormDom.alert_show();
    } else {
      this.rebuildHotAnalysis.alertTitle = this.i18n.protalserver_profiling_hot.rebuildHot;
      this.rebuildHotAnalysis.deleteStatu = true;
      this.rebuildHotAnalysis.type = 'none';
      this.rebuildHotAnalysis.alert_show();
    }
  }
  public dataReboot() {
    this.inforDataHot.forEach(e => {
      if (e.longInfor) {
        e.longInfor = false;
      }
    });
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes.startBtnDisabled) {
      this.startBtnDisabledParams(changes);
    }
    if (changes.noData) {
      this.noDataParams(changes);
    }
    if (changes.hotData) {
      this.hotDataParams(changes);
    }
    if (changes.methodData) {
      this.methodDataParams(changes);
    }
  }
  startBtnDisabledParams(changes: SimpleChanges) {
    if (changes.startBtnDisabled?.currentValue) {
      this.startOnHot = false;
      this.beginSample = false;
    } else {
      this.showChart = false;
    }
  }
  noDataParams(changes: SimpleChanges) {
    if (!changes.noData.currentValue) { return; }
    if (changes.noData.currentValue.code === -1) {
      this.hotDisabled = true;
      this.noDataTip = changes.noData.currentValue.message;
    } else if (changes.noData.currentValue.state === 'ERROR') {
      this.hotDisabled = false;
      this.startOnHot = true;
      this.noDataTip = this.i18n.common_term_task_nodata;
    } else {
      this.hotDisabled = false;
      this.noDataTip = this.i18n.protalserver_profiling_hot.noData;
      if (!this.beginSample && !this.showChart) {
        this.startOnHot = false;
      }
    }
  }
  hotDataParams(changes: SimpleChanges) {
    if (Object.keys(this.hotData)?.length === 0) {
      this.noDataTip = this.i18n.protalserver_profiling_hot.noData;
      return;
    }
    if (changes.hotData.currentValue.c?.length >= 0) {
      this.closeProgress();
      this.startOnHot = true;
      this.beginSample = false;
      this.initChart();
    } else {
      this.showChart = false;
      this.beginSample = false;
      if (this.hotFormData.includeMethods) {
        this.noDataTip = this.i18nService.I18nReplace(this.i18n.protalserver_profiling_hot.changeMethodParams,
          { 0: this.hotFormData.includeMethods });
      } else {
        this.noDataTip = this.i18n.protalserver_profiling_hot.noData;
      }
    }
  }
  methodDataParams(changes: SimpleChanges) {
    if (!changes.methodData.currentValue) { return; }
    if (changes.methodData.currentValue.versionList) {
      this.showVersion = true;
      const versionList = changes.methodData.currentValue.versionList;
      versionList.forEach((e: any) => {
        const versionObj = {
          label: this.i18n.JITVersion + e,
          id: e,
        };
        this.versionOptions.push(versionObj);
      });
      const currentVersion = changes.methodData.currentValue.currentVersion;
      if (currentVersion) {
        this.versionID = currentVersion;
      }
      if (this.versionID) {
        this.versionSelected = this.versionOptions[this.versionID - 1];
      } else {
        this.versionSelected = this.versionOptions[currentVersion.length - 1];
      }
    } else {
      this.showVersion = false;
    }
    this.instructionList = changes.methodData.currentValue.instructionList;
    this.javaByteCodes = changes.methodData.currentValue.javaByteCodes;
    if (this.javaByteCodes || this.javaByteCodes?.length > 0) {
      this.bytecodeData = this.javaByteCodes;
    }
    if (this.instructionList || this.instructionList?.length > 0) {
      this.srcData.data = [];
      this.getAddressArr(this.instructionList);
      this.getClockPeriodTotal();
      this.showTableData();
    } else {
      this.srcData.data = [];
    }
  }
  public onVersionChange(e: any) {
    this.versionOptions = [];
    this.versionID = e.id;
    this.selectVersion.emit(e);
  }
  closeProgress = () => {
    if (this.progress ){
      this.progress.isCreatingModal = false;
    }
  }
  initChart() {
    if (!(Object.keys(this.hotData).length !== 0 && this.hotData?.c.length >= 0)) {
      return ;
    }
    this.showInfor = true;
    this.showChart = true;
    $('#hotChart').html('');
    // 删除每次刷新的前一个tip
    const code = document.getElementsByClassName('d3-flame-graph-tip');
    for (let i = code.length - 1; i >= 0; i--) {
      code[i].parentNode.removeChild(code[i]);
    }
    let chartWidth = $('.hotChart').width();
    if (chartWidth < 900) { chartWidth = 900; }

    const {tip, remove} = this.createFlameGraphTip();
    this.flameGraphTipRemove = remove;

    this.hotChart = this.flamegraph.flamegraph()
      .width(chartWidth - 8)
      .cellHeight(18)
      .minFrameSize(1) // 最小帧大小
      .onClick(this.onClick)
      .inverted(true)// 倒火焰图
      .selfValue(false) // 默认不显示自己的value
      .setColorMapper(this.setColor)
      .tooltip(tip);

    if (this.msieversion()) {
      setTimeout(() => {
        d3.select('#hotChart')
          .datum(this.hotData)
          .call(this.hotChart);
      }, 100);
    } else {
      d3.select('#hotChart')
        .datum(this.hotData)
        .call(this.hotChart);
    }
  }
  initData() {
    this.assembleTipMsg = '';
    this.bytecodeData = [];
    this.srcData.data = [];
    this.versionOptions = [];
    this.clockPeriodTotal = 0;
  }
  onClick = (d: any) => {
    this.initData();
    const disassemblingOpen = this.inforDataHot.find((e) =>
      e.type === 'disassembling'
    );
    if (disassemblingOpen.value === this.i18n.protalserver_profiling_hot.kernelCallClose) {
      this.isDisassemblingOpen = false;
      this.hotspotExpand = false;
      this.divider.hide();
      setTimeout(() => {
        if (this.searchEv?.value) {
          this.hotChart.search(this.searchEv.value);
        } else {
          this.initChart();
        }
      }, 100);
    } else {
      this.isDisassemblingOpen = true;
      this.hotspotExpand = true;
    }
    if (this.clickMethodName !== d.data.n) {
      clearInterval(this.tableDataTimer);
    }
    this.clickMethodName = d.data.n;
    if (this.clickMethodName === 'root') {
      this.rootParams();
      return;
    }
    if (!this.isDisassemblingOpen){
      return;
    }
    this.javaParams(d);
    this.methodBn.emit(d.data);
    this.divider.expand();
    if (this.searchEv?.value) {
      this.hotChart.search(this.searchEv.value);
    } else {
      this.initChart();
    }
  }
  rootParams() {
    this.showVersion = false;
    this.hotspotExpand = false;
    this.srcData.data = [];
    this.bytecodeData = [];
    this.showBytecode = false;
    this.divider.hide();
    setTimeout(() => {
      if (this.searchEv?.value) {
        this.hotChart.search(this.searchEv.value);
      } else {
        this.initChart();
      }
    }, 100);
    return;
  }
  javaParams(d: any) {
    let otherTip = '';
    if (d.data.l === 1 || d.data.l === 2) { // 点击的是java方法
      this.showBytecode = true;
      this.showJVMSelect = true;
    } else {
      this.showBytecode = false;
      this.showJVMSelect = false;
    }
    this.addressLocation = d.data?.a;
    this.hotMapData = new Map();
    if (this.addressLocation != null) {
      for (const key of Object.keys(this.addressLocation)) {
        this.clockPeriodTotal += this.addressLocation[key];
        this.hotMapData.set(key, this.addressLocation[key]);
      }
    }
    if (!this.isDisassemblingOpen){
      return;
    }
    if (d.data?.d?.o) {
      this.showAssembleTip = true;
      const allCount = d.data.d.t;
      const thisCount = d.data.d.c;
      const interpreter = d.data.d.i;
      for (const key of Object.keys(d.data?.d?.o)) {
        otherTip += this.i18nService.I18nReplace(this.i18n.hotspotRight.assembleOtherTip,
          { 0: d.data.d.o[key] , 1: key });
      }
      this.assembleTipMsg = this.i18nService.I18nReplace(this.i18n.hotspotRight.assembleTip,
        { 0: allCount, 1: thisCount, 2: otherTip, 3: interpreter });
    } else {
      this.showAssembleTip = false;
    }
  }

  /**
   * 当数据量过大的时候分批显示数据
   */
  public showTableData() {
    if (this.instructionList.length > this.listLength) {
      let i = 0;
      this.tableDataTimer = setInterval(() => {
        if (this.instructionList.length <= this.srcData.data.length) {
          clearInterval(this.tableDataTimer);
          this.tableDataTimer = null;
        }
        if (this.instructionList.length - i >= this.listLength) {
          this.srcData.data.push.apply(this.srcData.data, this.instructionList.slice(i, i + this.listLength));
          i += this.listLength;
        } else {
          this.srcData.data.push.apply(this.srcData.data, this.instructionList.slice(i, this.instructionList.length));
          i = i + (this.instructionList.length - i);
        }
      }, 200);
    } else {
      this.srcData.data = this.instructionList;
    }

  }
  /**
   * 获取时钟周期总数
   */
  getClockPeriodTotal = () => {
    this.clockPeriodTotal = 0;
    if (this.hotMapData && this.instructionList) {
      this.instructionList.forEach((e: { a: any; }) => {
        this.clockPeriodTotal +=  this.hotMapData.get(e?.a) === undefined ? 0 : this.hotMapData.get(e?.a);
      });
    }
  }
  /**
   * 筛选出表格是否显示时钟周期的数据
   * @param index 表格标记
   */
  public clockPeriodValue(index: any) {
    const indexStr = index.toString();
    if (this.hotMapData.get(indexStr)) {
      return `${this.hotMapData.get(indexStr)}
       (${((this.hotMapData.get(indexStr) / this.clockPeriodTotal) * 100).toFixed(2)
        }%)`;
    } else {
      return '';
    }

  }
  // 搜索之后的颜色为#b37feb 默认颜色通过colorHash去设置
  setColor = (d: any) => {
    return d.highlight ? '#b37feb' : this.flamegraphService.colorHash(this.flamegraphService.getName(d),
      this.flamegraphService.getLibtype(d));
  }

  /**
   * 搜索
   */
  searchEvent = (event: { value: any }): void => {
    if (event.value) {
      this.searchEv = event;
      this.hotChart.search(event.value);
    } else {
      this.searchEv.value = '';
      this.initChart();
    }
  }
  /**
   * 获取地址栏数组
   */
  public getAddressArr(arr: any) {
    if (arr) {
      arr.forEach((e: { a: any; }) => {
        this.addressArr.push(e.a);
      });
    }
  }
  /**
   * 获取字节码地址
   */
  public getRowJ(row: any) {
    if (Object.prototype.hasOwnProperty.call(row, 'j')) {
      return row.j;
    } else {
      return '';
    }
  }
  public showAssSvg(row: any) {
    if (!row?.o) { return false; }
    if (this.toAddressOk === row.a || this.toAddressOk === this.setOX(row)) {
      return true;
    } else {
      return false;
    }
  }
  public setOX(row: any) {
    if (!row?.o) { return; }
    return row.o.slice(row.o.indexOf('0x'), row.o.length);
  }
  public showO(row: any) {
    if (!row?.o) { return false; }
    if (row?.o.indexOf('0x') !== -1 && row?.o.length - row?.o.indexOf('0x') >= 12) {
      return true;
    } else {
      return false;
    }
  }
  /**
   * 判断表格锚点之后的颜色
   */
  public setBgTable(row: { a: string; o: string; j: string; }) {
    if (!row?.o) { return false; }
    if (this.toAddressOk === row.a || this.toAddressOk === this.setOX(row) ||
      (row?.j === this.bytecodeL && row?.j)) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * 获取汇编key为C的数据
   */
  public getRowC(row: any) {
    if (Object.prototype.hasOwnProperty.call(row, 'c')) {
      return row.c;
    } else {
      return '';
    }
  }
  /**
   * 锚点到指定地址
   */
  public bytecodeClick(item: any) {
    const targetView = document.getElementById(item.l);
    if (targetView) {
      const oldtargetView = document.getElementById(this.bytecodeL);
      if (oldtargetView) {
        oldtargetView.classList.remove('setBg');
        oldtargetView.style.background = '';
      }
      this.bytecodeL = item.l;
      targetView.classList.add('setBg');
      targetView.scrollIntoView();
    }
  }
  /**
   * 锚点到指定地址
   */
  public clickToAddress(toAddress: any) {
    const targetView: Element = document.getElementById(toAddress);
    if (targetView) {
      this.toAddressOk = toAddress;
      targetView.scrollIntoView();
    }
  }
  public presenceAddress(toAddress: any) {
    return this.addressArr.includes(toAddress);
  }
  /**
   * 分隔器事件
   */
  public dividerEvent(e: any) {
    if (e) {
      this.hotspotExpand = true;
    } else {
      this.hotspotExpand = false;
    }
    setTimeout(() => {
      if (this.searchEv?.value) {
        this.hotChart.search(this.searchEv.value);
      } else {
        this.initChart();
      }
    }, 100);
  }
  /**
   * 查看详情
   */
  public viewInforDetail(event: any) {
    this.inforDetail = event;
    if (this.inforDetail) {
      setTimeout(() => {
        this.inforDetailDom.show();
      }, 100);
    }
  }
  /**
   * 采样间隔校验
   */
  public onSamplingIntervalChange(e: any) {
  }
  /**
   * 配置反汇编/字节码解析开关
   */
  public disassemblingChange(state: any) {
    this.formInforData.disassembling.state = state;
  }
  /**
   * 配置堆栈深度开关
   */
   public depthChange(state: any) {
    this.formInforData.depth.state = state;
    this.formInforData.maxStackDepth.disabled = !state;
    if (!state) {
      this.formInforData.maxStackDepth.value = 16;
    }
  }
  /**
   * 最大栈深
   */
  public onMaxStackDepthChange(e: any) {
  }
  /**
   * 分析内核态调用开关
   */
  public kernelCallChange(e: any) {
  }
  public dividerHide() {
    this.divider.hide();
  }
  /**
   * 返回火焰图输入表单数据
   */
  public hotFormConfirmHandle(e: any) {
    if (e) {
      this.initInforDataHot();
      // 重置右侧
      this.hotspotExpand = false;
      this.clickMethodName = '';
      if (this.srcData && this.srcData.data){
        this.srcData.data = [];
      }
      this.showChart = false;
      if (!this.formInforData.manuallyStop.state) {
        this.hotFormData.duration = this.formInforData.samplingDuration.value;
      } else {
        this.hotFormData.duration = -1;
      }
      this.hotFormData.frequency = this.formInforData.samplingInterval.value;
      this.hotFormData.event = this.eventTypeSelected.label;
      this.hotFormData.disassemble = this.formInforData.disassembling.state;
      if (this.formInforData.depth.state){
        this.hotFormData.stackDepth = this.formInforData.maxStackDepth.value ;
      } else {
        delete this.hotFormData.stackDepth;
      }
      this.hotFormData.excludeMethods = this.formInforData.exclusionMethod.value;
      this.hotFormData.includeMethods = this.formInforData.analysisMethod.value;
      this.hotFormData.startMethod = this.formInforData.startMethod.value;
      this.hotFormData.endMethod = this.formInforData.endMethod.value;
      this.hotFormData.kernelIgnore = !this.formInforData.kernelCall.state;
      this.hotAnalysisBn.emit({
        hotFormData: this.hotFormData,
        inforData: this.inforDataHot
      });
    }
  }
  public startSvg() {
    this.recordData.duration = this.formInforData.manuallyStop.state ? -1
      : this.formInforData.samplingDuration.value * 1000;
    this.recordData.createTime = +new Date() / 1000;
    this.recordData.startCreating = false;
    if (this.progress) {
      this.progress.start();
    }
  }
  /**
   * 停止采样或者取消采样
   */
  public hideCreating(e: any) {
    // true 停止采样
    if (e) {
      this.hotFormData.duration = e.time;
      this.setInforData(this.hotFormData);
      this.hotAnalysisBn.emit(false);
    } else {
      // 取消采样
      this.hotDisabled = false;
      this.startOnHot = false;
      this.showInfor = false;
      this.beginSample = false;
      this.recordData.duration = -1;
      this.formInforData.samplingDuration.value = -1;
      this.cancelHotAnalysisBn.emit(true);
    }
  }

  public setInforData(data: any) {
    this.showInfor = true;
    this.inforDataHot.forEach(e => {
      switch (e.type) {
        case 'duration':
          e.value = data.duration > 0 ? data.duration : '--' ;
          break;
        case 'frequency':
          e.value = data.frequency;
          break;
        case 'event':
          e.value = data.event;
          break;
        case 'disassembling':
          if (!data.disassemble) {
            e.value = this.i18n.protalserver_profiling_hot.kernelCallClose;
          } else {
            e.value = this.i18n.protalserver_profiling_hot.kernelCallStart;
          }
          break;
        case 'stackDepth':
          if (this.formInforData.depth.state) {
            e.value = data.stackDepth;
          }
          break;
        case 'excludeMethods':
          e.value = data.excludeMethods;
          if (data.excludeMethods.length > 30) { e.longInfor = true; } else { e.longInfor = false; }
          break;
        case 'includeMethods':
          e.value = data.includeMethods;
          if (data.includeMethods.length > 30) { e.longInfor = true; } else { e.longInfor = false; }
          break;
        case 'startMethod':
          e.value = data.startMethod;
          if (data.startMethod.length > 30) { e.longInfor = true; } else { e.longInfor = false; }
          break;
        case 'endMethod':
          e.value = data.endMethod;
          if (data.endMethod.length > 30) { e.longInfor = true; } else { e.longInfor = false; }
          break;
        case 'kernelIgnore':
          if (data.kernelIgnore) {
            e.value = this.i18n.protalserver_profiling_hot.kernelCallClose;
          } else {
            e.value = this.i18n.protalserver_profiling_hot.kernelCallStart;
          }
          break;
        default:
          break;
      }
    });
  }
  public rebuildHotConfirmHandle(e: any) {
    if (e) {
      this.divider.hide();
      this.recordData.duration = -1;
      this.recordData.createTime = 0;
      this.recordData.startCreating = true;
      this.srcData.data = [];
      this.bytecodeData = [];
      this.showBytecode = false;
      this.showJVMSelect = false;
      this.cleared.emit(true);
      setTimeout(() => {
        this.resetHotFormDom();
        this.hotFormDom.type = 'none';
        this.hotFormDom.alertTitle = this.i18n.protalserver_profiling_hot.rebuildHot;
        this.hotFormDom.alert_show();
      }, 300);
    }
  }
  public onZoomStatus(status: boolean) {
    if (status) { // 全屏
      this.showZoom = true;
      $('.compilationID').css('white-space', 'none');
      $('.compilationID').removeAttr('tiOverflow');
      $('.chartOper>.zoom-screen').css('bottom', '11px');
      $('.flamegraph').css('height', 'calc(100% + 104px)');
      if (this.docIde) {
        $('.profile-tabs').css('display', 'none');
        $('.btns-box').css('display', 'none');
        $('.cpu-detail-tab').css('display', 'none');
        $('.leftListHeader').css('display', 'none');
        $('.hot-head').css('display', 'none');
        $('.infor-collection').css('display', 'none');
        $('.list-content').css('padding-top', '26px');
        $('.main-container-sample').css('padding', '0px');
      } else {
        this.renderer2.setStyle(this.showFullEl.nativeElement, 'background-color', '#FFF');
        this.renderer2.setStyle(this.showFullEl.nativeElement, 'padding', '20px 48px');
      }
    } else {
      this.showZoom = false;
      $('.chartOper>.zoom-screen').css('bottom', '40px');
      $('.flamegraph').css('height', 'calc(100% - 86px)');
      if (this.docIde) {
        $('.profile-tabs').css('display', 'flex');
        $('.btns-box').css('display', 'inherit');
        $('.cpu-detail-tab').css('display', 'block');
        $('.leftListHeader').css('display', 'block');
        $('.hot-head').css('display', 'flex');
        $('.infor-collection').css('display', 'block');
      } else {
        this.renderer2.setStyle(this.showFullEl.nativeElement, 'padding', '0px');
      }
    }
  }
  exclusionMethodBlur(e: any, type: string) {
    const reg = new RegExp(/[\u4E00-\u9FA5]/i);
    if (reg.test(e)) {
      switch (type) {
        case 'exc':
          this.showExcError = true; // 校验错误
          break;
        case 'ass':
          this.showAssError = true; // 校验错误
          break;
        case 'smd':
          this.showSmdError = true; // 校验错误
          break;
        case 'emd':
          this.showEmdError = true;
          this.showMdError = false;
          break;
      }
    } else {
      switch (type) {
        case 'exc':
          this.showExcError = false; // 校验通过
          break;
        case 'ass':
          this.showAssError = false;
          break;
        case 'smd':
          this.smdValue = e;
          this.showSmdError = false;
          break;
        case 'emd':
          this.emdValue = e;
          this.showEmdError = false;
          break;
      }
      if (this.smdValue === this.emdValue && this.smdValue !== '' && this.emdValue !== '') {
        this.showMdError = true;
        this.showEmdError = false;
      } else {
        this.showMdError = false;
      }
    }
  }
  manuallyStopChange(state: any) {
    this.formInforData.manuallyStop.state = state;
    this.formInforData.samplingDuration.disabled = state;
  }
  public toggleTop() {
    this.expendState = !this.expendState;
  }

  private createFlameGraphTip(): {tip: any, remove: () => void} {
    const getValue = (d: any) => {
      if ('v' in d) {
        return d.v;
      } else {
        return d.data.v;
      }
    };

    const getResult = (d: any, currentValue: any): any => {
      if (d.parent) {
        return getResult(d.parent, currentValue);
      } else {
        return d3.format('.3f')(currentValue / d.data.v * 100);
      }
    };

    const getName = (d: any) => {
      return d.data.n || d.data.name;
    };

    const labelHandler = (d: any) => {
      const currentValue = getValue(d);
      const percentage = getResult(d,  currentValue);
      return getName(d) + ' (' + percentage + '%, ' + currentValue + ' samples)';
    };

    const tip = (d3Tip as any).default();
    tip
      .direction('s')
      .offset([8, 0])
      .attr('class', 'd3-flame-graph-tip')
      .attr('id', 'd3-flame-graph-tip-hot-analysis')
      .html((d: any) => {
        return labelHandler(d);
      });

    const remove = () => {
      const fragment = document.createDocumentFragment();
      fragment.appendChild(document.getElementById('d3-flame-graph-tip-hot-analysis'));
      this.showFullEl.nativeElement.appendChild(fragment);
    };

    return {
      tip,
      remove
    };
  }
}
