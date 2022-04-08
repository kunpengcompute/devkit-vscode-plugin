import { Component, OnInit, ElementRef, OnDestroy, ViewChild, SecurityContext } from '@angular/core';
import { I18nService } from '../../service/i18n.service';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  AbstractControl,
} from '@angular/forms';
import { TiValidators, TiTableColumns, TiTableSrcData, TiTableRowData, TiDatetimeFormat } from '@cloud/tiny3';
import { TiValidationConfig } from '@cloud/tiny3';
import { AxiosService } from '../../service/axios.service';
import { TiMessageService } from '@cloud/tiny3';
import { Router } from '@angular/router';
import { MytipService } from '../../service/mytip.service';
import { StompService } from '../../service/stomp.service';
import { MessageService } from '../../service/message.service';
import { Subscription } from 'rxjs';
import { ProfileDownloadService } from '../../service/profile-download.service';
import { LibService, disableCtrlZ } from '../../service/lib.service';
import { ProfileCreateService } from '../../service/profile-create.service';
import { DomSanitizer } from '@angular/platform-browser';

import { RegularVerify } from 'projects/java/src-com/app/utils/regular-verify';
import { SpinnerBlurInfo } from 'projects/java/src-com/app/utils/spinner-info.type';
import * as echarts from 'echarts/core';

@Component({
  selector: 'app-spring-boot',
  templateUrl: './spring-boot.component.html',
  styleUrls: ['./spring-boot.component.scss']
})
export class SpringBootComponent implements OnInit, OnDestroy {
  i18n: any;
  form: FormGroup;
  @ViewChild('TimeLine') TimeLine: any;
  constructor(
    private stompService: StompService,
    private elementRef: ElementRef,
    public Axios: AxiosService,
    public timessage: TiMessageService,
    public fb: FormBuilder,
    public regularVerify: RegularVerify,
    public router: Router,
    public i18nService: I18nService,
    public mytip: MytipService,
    private msgService: MessageService,
    private downloadService: ProfileDownloadService,
    public libService: LibService,
    public createProServise: ProfileCreateService,
    public domSanitizer: DomSanitizer
  ) {
    this.i18n = this.i18nService.I18n();
    this.form = fb.group({
      name: new FormControl('', [TiValidators.required]),
      pwd: new FormControl(
        '',
        CustomValidators.isEqualTo(this.i18n.common_term_login_error_info[1])
      ),
    });

    this.springbootGroup = fb.group({
      springboot_threshold: new FormControl(0, {
        validators: [
          TiValidators.required,
          TiValidators.minValue(0),
          TiValidators.maxValue(10000),
        ],
        updateOn: 'change',
      }),
    });
  }

  // sampling配置
  public springbootGroup: FormGroup;
  public springbootBlur: SpinnerBlurInfo;
  public echartsInstance: any;
  public nameValidation: TiValidationConfig = {};
  public pwdValidation: TiValidationConfig = {};
  public springBootTabs: any = [];
  public health: any = {};
  public beans: any = [];
  public beansShowTip: any = false;
  public metrics: any = [];
  // metrics echartsOptions 参数集合
  public options: any = [];
  public updateMetrics: any = [];
  public metricsOption: any = {
    top: '0',
    first: false,
    metricsDate: [],
    metricsTime: [],
  };
  public showLogin: any = '';
  public isStart: any = false;
  public threshold: any = {
    label: '',
    value: '0',
    min: '0',
    max: '10000',
    format: 'N0',
  };
  public httpOptions: any = {};
  public httpUptate: any = {
    time: [],
    line1: [],
    line2: [],
    line3: [],
    maxNum: [],
    filterPath: []
  };
  private isStopMsgSub: Subscription;
  public deleteOneTab: Subscription;
  private healthSub: Subscription;
  private metricsSub: Subscription;
  private httpTracesSub: Subscription;
  public isDownload = false;
  public startBtnDisabled: boolean;
  public column: Array<TiTableColumns>;
  public srcData: TiTableSrcData;
  public displayed: Array<TiTableRowData> = [];
  public searchWords: Array<any> = ['', ''];
  public searchKeys: Array<string> = ['method_', 'contentType_']; // 设置过滤字段
  public currentPage: any = 1;
  public totalNumber: any = 0;
  public pageSize: { options: Array<number>, size: number } = {
    options: [10, 20, 50, 100],
    size: 10
  };
  public httpTraces: any = [];
  public allHttpTraces: any = [];
  public noDadaInfo = '';
  public guardianId: any;
  public jvmId: any;
  public isSpringBoot: any = '';
  public metricsCount: any = 0;
  public projectInfo: any = {};
  public httpTracesLength: any = 0;
  public pathFilterLength: any = 0;
  public pathValue: any = '';
  public pathValueModel: any = '';
  public timestampValue: any = 0;
  public methodValue: any = '';
  public statusValue: any = '';
  public timeTakenValue: any = 0;
  public httpOption: any = {};
  public httpUpdateOption = {};
  public endTime: any = 0;
  public startTime: any = 0;
  public stimeValue: any = '';
  public etimeValue: any = '';
  public sureFilter: any = false;
  public min: any = '';
  public format: any = 'HH:mm:ss';
  public filterShow: any = false;
  public statusShow: any = false;
  public dataArray1: Array<any> = [
    { id: 1, text: '200 - 299', key: '2' },
    { id: 2, text: '300 - 399', key: '3' },
    { id: 3, text: '400 - 499', key: '4' },
    { id: 4, text: '500 - 599', key: '5' }
  ];
  public checkedArray1: Array<any> =
    [this.dataArray1[0],
    this.dataArray1[3],
    this.dataArray1[1],
    this.dataArray1[2]
    ];
  public todayTime: any = '';
  public httpTracesCount: any = 0;
  public haveFilter: any = false;
  public beansNoDate: any = false;
  public httpTracesNoDate: any = false;
  public statusReg: any;
  public ecahrtsTime: any = [];
  public echarts1: any = {
    show: true,
    created: [],
    expired: [],
    rejected: []
  };
  public echarts2: any = {
    show: true,
    current: [],
    max: []
  };
  public echarts3: any = {
    show: true,
    count: []
  };
  public echarts4: any = {
    show: true,
    capacity: [],
    used: []
  };
  public echarts5: any = {
    show: true,
    info: [],
    warn: [],
    trace: [],
    debug: [],
    error: []
  };
  public allMetricsOpt: any = {
    time: [],
    echarts1: {},
    echarts2: {},
    echarts3: {},
    echarts4: {},
    echarts5: {}
  };
  public sameOpt: any = {
    type: 'time',
    backgroundColor: '#fff',
    // 提示框
    tooltip: {
      trigger: 'axis',
      confine: true,
      backgroundColor: '#fff',
      padding: [8, 20, 8, 20],
      extraCssText: 'box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2)',
      axisPointer: {
        lineStyle: {
          color: '#d4d9e6'
        }
      },
      textStyle: {
        color: '#282b33',
      },
      formatter: (params: any) => {
        let html = `
            <div>
              <div style='margin-top:8px'>
                <span>${this.domSanitizer.sanitize(SecurityContext.HTML,
          this.downloadService.downloadItems.profileInfo.toolTipDate +
          ' ' + params[0].axisValueLabel)}</span>
              </div>
            `;
        params.forEach((item: any) => {
          item.value = this.libService.setThousandSeparator(item.value);
          html += `
                <div style='margin-top:8px;display:flex;justify-content: space-between; align-items: center;'>
                    <div style="float:left;">
                    <span style='margin-right:8px; width:8px;height:8px;
                    display:inline-block;background:${item.color}'></span>
                    <span>${this.domSanitizer.sanitize(SecurityContext.HTML, item.seriesName)}&nbsp:</span>
                    </div>
                    <span style='margin-left:24px'>
                    ${this.domSanitizer.sanitize(SecurityContext.HTML, item.value)}</span>
                  </div>
                  `;
        });
        html += `</div>`;
        return html;
      }
    },
    // 网格
    grid: {
      left: '10',
      right: '50',
      top: '40',
      bottom: '20',
      containLabel: true
    },
    dataZoom: [  // 放大缩小
      {
        type: 'inside',
        realtime: true,
        fillerColor: 'rgba(0, 108, 255, 0.15)',
        filterMode: 'empty'
      }
    ],
    xAxis: [
      {
        type: 'category',
        boundaryGap: ['20%', '20%'],  // 最大值最小值延伸20%
        axisLine: {
          onZero: false,
          lineStyle: {
            color: '#d4d9e6',
            width: 2
          }
        },
        axisLabel: {
          show: true,
          padding: [5, 0, 0, 0],
          textStyle: {
            color: '#616161',
          },
        },
        axisTick: {
          show: true,
          alignWithLabel: true, // label与刻度线对齐
          length: 8,
          lineStyle: {
            color: '#616161',
            width: 1
          }
        },
        splitLine: {
          show: false,
          lineStyle: {
            type: 'solid',
            opacity: .3
          }
        },
        data: []
      },
      {
        type: 'category',
        axisLine: {
          onZero: false,
          lineStyle: {
            color: '#d4d9e6',
            width: 2,
          }
        }
      }
    ],
    yAxis: [
      {
        type: 'value',
        splitNumber: '1',
        axisLine: {
          show: false,
          onZero: false,
          lineStyle: {
            color: '#d4d9e6',
            width: 1
          }
        },
        axisTick: {
          show: false
        },
        splitLine: {
          show: false,
          lineStyle: {
            type: 'dashed',
            opacity: .3
          }
        },
        axisLabel: {
          textStyle: {
            color: '#616161',
          },
          formatter: (params: any) => {
            return this.libService.setThousandSeparator(params);
          }
        }
      }
    ],
  };
  public metricsOpt1: any = {
    type: this.sameOpt.type,
    backgroundColor: this.sameOpt.backgroundColor,
    tooltip: this.sameOpt.tooltip,
    grid: this.sameOpt.grid,
    xAxis: this.sameOpt.xAxis,
    yAxis: this.sameOpt.yAxis,
    dataZoom: this.sameOpt.dataZoom,
    color: ['#267DFF', '#00BFC9', '#41BA41'],
    legend: {
      itemHeight: 10,
      itemWidth: 10,
      x: 'right',
      icon: 'rect',
      data: ['created', 'expired', 'rejected']
    },
    series: [
      {
        id: 'created',
        name: 'created',
        type: 'line',
        data: []
      },
      {
        id: 'expired',
        name: 'expired',
        type: 'line',
        data: []
      },
      {
        id: 'rejected',
        name: 'rejected',
        type: 'line',
        data: []
      },
    ]
  };
  public metricsOpt2: any = {
    type: this.sameOpt.type,
    color: ['#267DFF', '#00BFC9'],
    legend: { x: 'right', icon: 'rect', itemHeight: 10, itemWidth: 10, data: ['active.current', 'active.max'] },
    backgroundColor: this.sameOpt.backgroundColor,
    tooltip: this.sameOpt.tooltip,
    grid: this.sameOpt.grid,
    xAxis: this.sameOpt.xAxis,
    yAxis: this.sameOpt.yAxis,
    dataZoom: this.sameOpt.dataZoom,
    series: [
      {
        id: 'active.current',
        name: 'active.current',
        type: 'line',
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
            offset: 0,
            color: 'rgba(38,125,255,0.3)',
          }, {
            offset: 1,
            color: 'rgba(38,125,255,0.04)'
          }])
        },
        data: []
      },
      {
        id: 'active.max',
        name: 'active.max',
        type: 'line',
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
            offset: 0,
            color: 'rgba(0,191,201,0.3)',
          }, {
            offset: 1,
            color: 'rgba(0,191,201,0.04)'
          }])
        },
        data: []
      }
    ]
  };
  public metricsOpt3: any = {
    type: this.sameOpt.type,
    backgroundColor: this.sameOpt.backgroundColor,
    color: ['#267DFF'],
    legend: { x: 'right', icon: 'rect', itemHeight: 10, itemWidth: 10, data: ['count'] },
    tooltip: this.sameOpt.tooltip,
    grid: this.sameOpt.grid,
    xAxis: this.sameOpt.xAxis,
    yAxis: this.sameOpt.yAxis,
    dataZoom: this.sameOpt.dataZoom,
    series: [
      {
        id: 'count',
        name: 'count',
        type: 'line',
        areaStyle: {
          normal: {
            opacity: '0.2',
          }
        },
        data: []
      }
    ]
  };
  public metricsOpt4: any = {
    type: this.sameOpt.type,
    backgroundColor: this.sameOpt.backgroundColor,
    color: ['#267DFF', '#00BFC9'],
    legend: {
      x: 'right', icon: 'rect', itemHeight: 10, itemWidth: 10, data: ['total.capacity', 'memory.used']
    },
    tooltip: this.sameOpt.tooltip,
    grid: this.sameOpt.grid,
    xAxis: this.sameOpt.xAxis,
    yAxis: this.sameOpt.yAxis,
    dataZoom: this.sameOpt.dataZoom,
    series: [
      {
        id: 'total.capacity',
        name: 'total.capacity',
        type: 'line',
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
            offset: 0,
            color: 'rgba(38,125,255,0.3)',
          }, {
            offset: 1,
            color: 'rgba(38,125,255,0.04)'
          }])
        },
        data: []
      },
      {
        id: 'memory.used',
        name: 'memory.used',
        type: 'line',
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
            offset: 0,
            color: 'rgba(0,191,201,0.3)',
          }, {
            offset: 1,
            color: 'rgba(0,191,201,0.04)'
          }])
        },
        data: []
      }
    ]
  };
  public metricsOpt5: any = {
    type: this.sameOpt.type,
    color: ['#267DFF', '#00BFC9', '#41BA41', '#E88B00', '#A050E7'],
    backgroundColor: this.sameOpt.backgroundColor,
    legend: {
      x: 'right', icon: 'rect', itemHeight: 10, itemWidth: 10, data: ['info', 'warn', 'trace', 'debug', 'error'],
      selected: {
        debug: false
      }
    },
    tooltip: this.sameOpt.tooltip,
    grid: this.sameOpt.grid,
    xAxis: this.sameOpt.xAxis,
    yAxis: this.sameOpt.yAxis,
    dataZoom: this.sameOpt.dataZoom,
    series: [
      {
        id: 'info',
        name: 'info',
        type: 'line',
        data: []
      },
      {
        id: 'warn',
        name: 'warn',
        type: 'line',
        data: []
      },
      {
        id: 'trace',
        name: 'trace',
        type: 'line',
        data: []
      },
      {
        id: 'debug',
        name: 'debug',
        type: 'line',
        data: []
      },
      {
        id: 'error',
        name: 'error',
        type: 'line',
        data: []
      }
    ]
  };
  public isLoading: any = false;
  public haveMetrics = false;
  public tabActive: any = 'health';
  public springBootBtnTip = '';
  public contentTip: any = '';
  public traceFailReason: any = '';
  public limitTime: any;
  public limitTimeData: any;
  public limitTimeTraces: any;
  public tabsShow: any = false;
  public timeData: any = [];
  public isBeansLoading: any = false;
  public analyzID: string;
  async ngOnInit() {
    this.isDownload = JSON.parse(sessionStorage.getItem('download_profile'));
    this.downloadService.downloadItems.currentTabPage = this.i18n.protalserver_profiling_springBoot.health;

    this.setSpinnerBlur();

    if (this.isDownload && this.downloadService.downloadItems.innerDataTabs.length) {
      this.springBootTabs = this.downloadService.downloadItems.springBoot.tabs;
      const checkedArr = this.springBootTabs.filter((item: any) => {
        return item.checked;
      });
      const index = this.springBootTabs.findIndex((e: any) => e === checkedArr[0]);
      this.tabActive = this.springBootTabs[index].link;
    } else {
      this.springBootTabs = this.downloadService.downloadItems.springBoot.tabs;
    }
    this.traceFailReason =
      this.downloadService.downloadItems.springBoot.httpTraces.traceFailReason =
      this.traceFailReason;
    this.limitTime = Number(this.downloadService.dataLimit.boot_metrics.timeValue);
    this.limitTimeTraces = Number(this.downloadService.dataLimit.boot_traces.timeValue);
    this.limitTimeData = Number(this.downloadService.dataLimit.boot_traces.dataValue);
    this.springBootBtnTip = this.i18n.protalserver_profiling_springBoot.btn_tip;
    this.jvmId = sessionStorage.getItem('jvmId');
    this.guardianId = sessionStorage.getItem('guardianId');
    this.startBtnDisabled = JSON.parse(sessionStorage.getItem('isProStop'));
    this.springbootGroup.controls.springboot_threshold.setValue(this.downloadService.dataSave.sprThreshold);
    this.isStart = this.downloadService.dataSave.isSpringBootStart;
    this.noDadaInfo = this.i18n.common_term_task_nodata;
    this.threshold.label = this.i18n.protalserver_profiling_springBoot.threshold;
    if (!this.startBtnDisabled) {
      await this.getProjectInfo();
    } else {
      this.isStart = false;
    }
    this.column = [
      {
        title: this.i18n.profiling_table.timestamp,
        width: '15%',
        selected: null,
        key: 'timestamp_',
      },
      {
        title: this.i18n.profiling_table.session,
        width: '17%',
        select: null,
        key: 'session_',
        options: [
          {
            label: 'ALL'
          }
        ]
      },
      {
        title: this.i18n.profiling_table.method,
        width: '8%',
        selected: null,
        key: 'method_',
        options: [],
      },
      {
        title: this.i18n.profiling_table.url,
        width: '22%',
        select: null,
        key: 'url_'
      },
      {
        title: this.i18n.profiling_table.status,
        width: '8%',
        selected: null,
        key: 'status_',
      },
      {
        title: this.i18n.profiling_table.content,
        width: '22%',
        key: 'contentType_',
        selected: null,
        options: []
      },
      {
        title: this.i18n.profiling_table.timeTaken,
        width: '8%',
        selected: null,
        sortKey: 'timeTaken_',
      }
    ];
    this.srcData = {
      data: [],
      state: {
        searched: false,
        sorted: false,
        paginated: false
      }
    };
    this.nameValidation = {
      type: 'blur',
      errorMessage: {
        required: this.i18n.common_term_login_error_info[0],
      },
    };
    this.pwdValidation = {
      type: 'blur',
      errorMessage: {
        required: this.i18n.common_term_login_error_info[1],
      }
    };
    this.beans.forEach((item: any) => {
      item.select = false;
    });
    this.httpOption = {
      type: 'time',
      backgroundColor: '#fff',
      color: ['#73D13D', '#FADB14', '#FA541C'],
      // 提示框
      tooltip: {
        trigger: 'axis',
        confine: true,
        backgroundColor: '#fff',
        padding: [8, 20, 8, 20],
        extraCssText: 'box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2)',
        axisPointer: {
          type: 'none',
        },
        textStyle: {
          color: '282b33',
        },
        formatter: (params: any): any => {
          let totalCount = 0;
          params.forEach((item: any) => {
            totalCount += item.value;
          });
          if (params.length) {
            let html = `
                  <div>
                    <div>
                      <span>${this.domSanitizer.sanitize(SecurityContext.HTML,
              this.downloadService.downloadItems.profileInfo.toolTipDate
              + ' ' + params[0].axisValueLabel)}</span>
                    </div>
                  `;
            const tipKeys: any = [
              {
                key: this.i18n.protalserver_profiling_springBoot.filterPath,
                unit: '',
                value: this.httpUptate.filterPath[params[0].dataIndex]
              },
              {
                key: this.i18n.protalserver_profiling_springBoot.requestCount,
                unit: '',
                value: totalCount
              },
              {
                key: this.i18n.protalserver_profiling_springBoot.maxTime,
                unit: ' ms',
                value: this.libService.setThousandSeparator(this.httpUptate.maxNum[params[0].dataIndex])
              },
            ];
            params.forEach((item: any) => {
              if (item.seriesIndex === 0) {
                const successed = {
                  key: this.i18n.protalserver_profiling_springBoot.successed,
                  unit: '',
                  value: item.value
                };
                tipKeys.splice(-1, 0, successed);
              }
              if (item.seriesIndex === 1) {
                const status4 = {
                  key: this.i18n.protalserver_profiling_springBoot.status4,
                  unit: '',
                  value: item.value
                };
                tipKeys.splice(-1, 0, status4);
              }
              if (item.seriesIndex === 2) {
                const status5 = {
                  key: this.i18n.protalserver_profiling_springBoot.status5,
                  unit: '',
                  value: item.value
                };
                tipKeys.splice(-1, 0, status5);
              }
            });
            tipKeys.forEach((item: any) => {
              html += `
              <div style='margin-top:8px;display:flex;justify-content: space-between; align-items: center;'>
                            <span style="">${this.domSanitizer.sanitize(SecurityContext.HTML, item.key)}:</span>
                            <span style='margin-left:24px'>
                            ${this.domSanitizer.sanitize(SecurityContext.HTML, item.value)}
                            ${this.domSanitizer.sanitize(SecurityContext.HTML, item.unit)}</span>
                          </div>
                        `;
            });

            html += `</div>`;
            return html;
          }
        }
      },
      legend: {
        itemHeight: 10,
        itemWidth: 10,
        icon: 'rect',
        x: 'right',
        right: 'auto',
        data: [this.i18n.protalserver_profiling_springBoot.successed,
        this.i18n.protalserver_profiling_springBoot.status4,
        this.i18n.protalserver_profiling_springBoot.status5]
      },
      dataZoom: [  // 放大缩小
        {
          type: 'inside',
          realtime: true,
          filterMode: 'empty'
        }
      ],
      // 网格
      grid: {
        left: '10',
        right: '25',
        top: '40',
        bottom: '10',
        containLabel: true
      },
      xAxis: [
        {
          type: 'category',
          boundaryGap: false,
          position: 'bottom',
          axisLine: {
            onZero: false,
            lineStyle: {
              color: '#E1E6EE',
              width: 2
            }
          },
          axisLabel: {
            show: true,
            padding: [11, 0, 0, 0],
            textStyle: {
              color: '#616161',
            },
          },
          axisTick: {
            textStyle: {
              color: '#616161',
            },
            show: true,
            length: 8,
            width: 1,
          },
          splitLine: {
            show: false,
            lineStyle: {
              type: 'solid',
              opacity: .3
            }
          },
          data: []
        },
        {
          type: 'time',
          boundaryGap: false,
          axisLine: {
            onZero: false,
            lineStyle: {
              type: 'dashed',
              color: '#E1E6EE',
              width: 1,
            }
          },
        }
      ],
      yAxis: [
        {
          type: 'value',
          splitNumber: 2,
          axisLine: {
            show: false,
            onZero: false,
            lineStyle: {
              color: '#E1E6EE',
              width: 1
            }
          },
          axisTick: {
            show: false
          },
          splitLine: {
            lineStyle: {
              type: 'dashed',
              opacity: .3
            }
          },
          axisLabel: {
            textStyle: {
              color: '#616161',
            },
            formatter: (params: any) => {
              return this.libService.setThousandSeparator(params);
            }
          }
        }
      ],
      series: [
        {
          id: 'line1',
          name: this.i18n.protalserver_profiling_springBoot.successed,
          type: 'line',
          data: []
        },
        {
          id: 'line2',
          name: this.i18n.protalserver_profiling_springBoot.status4,
          type: 'line',
          data: []
        },
        {
          id: 'line3',
          name: this.i18n.protalserver_profiling_springBoot.status5,
          type: 'line',
          data: []
        },
      ]
    };


    this.isStopMsgSub = this.msgService.getMessage().subscribe(msg => {
      if (msg.type === 'isStopPro') {
        this.isStart = false;
        this.startBtnDisabled = true;
      }
      if (msg.type === 'isRestart') {
        this.startBtnDisabled = false;
        this.health = {};
        this.beans = [];
        this.dataInitMetrics();
        this.dataInitHttp();
      }
      if (msg.type === 'isClear') {
        this.health = {};
        this.beans = [];
        this.dataInitMetrics();
        this.dataInitHttp();
      }
      if (msg.type === 'isClearOne') {
        this.tabActive = this.downloadService.dataSave.isSpringBootTabActive;
        if (this.tabActive === 'health') {
          this.health = {};
        }
        if (this.tabActive === 'beans') {
          this.beans = [];
          this.beansNoDate = true;
        }
        if (this.tabActive === 'metrics') {
          this.dataInitMetrics();
        }
        if (this.tabActive === 'http_traces') {
          this.dataInitHttp();
          this.httpTracesNoDate = true;
        }
      }
      if (msg.type === 'exportData') {
        this.downloadData();
      }
    });
    this.downLoad();
    this.healthSub = this.msgService.getMessage().subscribe(msg => {
      if (msg.type === 'health') {
        if (msg.data.eventName_ === '') {
          return;
        }
        this.health = msg.data;
        if (this.health.dataBase_.length > 0) {
          this.health.dataBase_.forEach((item: any) => {
            if (item.name_ === 'mongo') {
              item.name_ = 'MongoDB';
            }
            if (item.name_ === 'cassandra') {
              item.name_ = 'Cassandra';
            }
            if (item.name_ === 'redis') {
              item.name_ = 'Redis';
            }
          });
        }
      }
    });
    this.metricsSub = this.msgService.getMessage().subscribe(msg => {
      if (msg.type === 'dataLimit' && msg.data.type === 'boot_metrics') {
        if (msg.data.value < 50) {
          this.limitTime = Number(this.downloadService.dataLimit.boot_metrics.timeValue);
          this.dataInitMetrics();
        }
      }
      if (msg.type === 'metrics') {
        if (msg.data.metricsInfo_.length === 0) {
          return;
        }
        const timestamp = msg.data.timestamp_;
        const metricsDate = msg.data.metricsInfo_.filter((item: any) => {
          return item.baseUnit_ !== 'seconds';
        });
        const metrics = JSON.parse(JSON.stringify(metricsDate));
        metrics.forEach((item: any) => {
          item.measurements_ = this.getMeasurements(item.measurements_);
        });
        this.metrics = metrics;
        this.ecahrtsTime.push(this.dateFormat(timestamp).time);
        this.metricsCategory(metrics);
      }
    });
    this.httpTracesSub = this.msgService.getMessage().subscribe(msg => {
      if (msg.type === 'dataLimit' && msg.data.type === 'boot_traces') {
        if (msg.data.value < 50) {
          this.limitTimeTraces = Number(this.downloadService.dataLimit.boot_traces.timeValue);
          this.httpUptate.time = [];
          this.httpUptate.line1 = [];
          this.httpUptate.line2 = [];
          this.httpUptate.line3 = [];
          this.httpUptate.maxNum = [];
          this.httpUptate.filterPath = [];
          this.timeData = [];
        }
        if (msg.data.value > 50) {
          this.limitTimeData = Number(this.downloadService.dataLimit.boot_traces.dataValue);
        }
      }
      if (msg.type === 'httptrace') {
        if (msg.data.failReason_ !== '') {
          this.traceFailReason = msg.data.failReason_;
          return;
        } else {
          this.traceFailReason = '';
        }
        if (msg.data.httpTraces_.length === 0) {
          return;
        }
        // 修改时间戳展示样式，处理contentType_的[]
        msg.data.httpTraces_.forEach((item: any) => {
          item.newTime = this.httpDateFormat(item.timestamp_, 'yyyy/MM/dd hh:mm:ss.S');
          item.contentType_ = item.contentType_.replace(/[\[\]]/g, '');
        });
        // 对新增数据进行路径过滤
        if (this.pathValue !== '') {
          msg.data.httpTraces_ = msg.data.httpTraces_.filter((item: any) => {
            return item.uri_.indexOf(this.pathValue) > -1;
          });
          this.pathFilterLength += msg.data.httpTraces_.length;
        }
        const httpTraces = msg.data.httpTraces_;
        const timestamp = msg.data.timestamp_;
        this.todayTime = this.dateFormat(timestamp).data;
        this.downloadService.downloadItems.springBoot.httpTraces.filterTime.data = this.todayTime;
        // allHttpTraces 保存最新的5000条分析数据，所有的数据。不含过滤条件
        this.allHttpTraces.unshift.apply(this.allHttpTraces, httpTraces);
        if (this.allHttpTraces.length > this.limitTimeData) {
          this.allHttpTraces = this.allHttpTraces.slice(0, this.limitTimeData);
          this.filterPath(this.pathValue);
        }
        this.getCtOptions();
        this.getMethodOpt();
        this.httpTracesLength = this.allHttpTraces.length;
        this.fliterHttptraces(httpTraces, timestamp); // 获取三条line的参数
        this.srcData.data = this.allHttpTraces;
        this.httpTracesNoDate = false;
        // 数据推送更新的所有过滤状态记录
        if (this.sureFilter || this.haveFilter) {
          this.filterTimeAndStatus();
        }
      }
    });
    this.deleteOneTab = this.msgService.getMessage().subscribe(msg => {
      if (msg.type === 'setDeleteOne') {
        if ((this.isSpringBoot === 'false' && this.contentTip !== '' && this.isStart) || this.showLogin === 'true' ||
          (!this.health.eventName_ &&
            this.beans.length === 0 &&
            this.metrics.length === 0 &&
            this.allHttpTraces.length === 0)) {
          this.msgService.sendMessage({
            type: 'getDeleteOne',
            isNoData: 'true',
          });
        } else {
          if (msg.tabActive === 'health' && typeof (this.health.eventName_) === 'undefined' && !this.isStart) {
            this.msgService.sendMessage({
              type: 'getDeleteOne',
              isNoData: 'true',
            });
          } else if (msg.tabActive === 'beans' && this.beans.length === 0 && this.beansNoDate) {
            this.msgService.sendMessage({
              type: 'getDeleteOne',
              isNoData: 'true',
            });
          } else if (msg.tabActive === 'metrics' && this.metrics.length === 0 && !this.isStart) {
            this.msgService.sendMessage({
              type: 'getDeleteOne',
              isNoData: 'true',
            });
          } else if (msg.tabActive === 'http_traces' && this.allHttpTraces.length === 0 && this.httpTracesNoDate) {
            this.msgService.sendMessage({
              type: 'getDeleteOne',
              isNoData: 'true',
            });
          } else {
            if (msg.tabActive === 'beans' && this.beans.length === 0) {
              this.beansNoDate = 'true';
            } else {
              this.beansNoDate = 'false';
            }
            this.msgService.sendMessage({
              type: 'getDeleteOne',
              isNoData: 'false',
            });
          }

        }
      }
    });
  }

  /**
   * 微调器回填初始化
   */
  public setSpinnerBlur() {
    this.springbootBlur = {
      control: this.springbootGroup.controls.springboot_threshold,
      min: 0,
      max: 10000,
    };
  }

  /**
   * 微调器回填
   */
  public verifySpinnerValue(value: any) {
    this.regularVerify.setSpinnerInfo(value);
  }
  public dataInitMetrics() {
    this.metrics = [];
    this.ecahrtsTime = [];
    this.echarts1.created = [];
    this.echarts1.expired = [];
    this.echarts1.rejected = [];
    this.echarts2.current = [];
    this.echarts2.max = [];
    this.echarts3.count = [];
    this.echarts4.capacity = [];
    this.echarts4.used = [];
    this.echarts5.info = [];
    this.echarts5.warn = [];
    this.echarts5.trace = [];
    this.echarts5.debug = [];
    this.echarts5.error = [];
    this.getEchartOpt();
  }
  public dataInitHttp() {
    this.allHttpTraces = [];
    this.httpUptate.time = [];
    this.timeData = [];
    this.httpUptate.line1 = [];
    this.httpUptate.line2 = [];
    this.httpUptate.line3 = [];
    this.httpUptate.maxNum = [];
    this.httpUptate.filterPath = [];
    this.srcData.data = [];
    this.setHttpOptions();
  }
  public downLoad() {
    this.projectInfo = this.downloadService.downloadItems.springBoot.springBootInfo;
    this.isSpringBoot = this.projectInfo.springbootProject ? 'true' : 'false';
    this.showLogin = 'false';
    this.health = this.downloadService.downloadItems.springBoot.health;
    this.beans = this.downloadService.downloadItems.springBoot.beans;
    if (this.downloadService.downloadItems.springBoot.metrics.metrics.length > 0) {
      this.metrics = this.downloadService.downloadItems.springBoot.metrics.metrics;
      this.echarts1 = this.downloadService.downloadItems.springBoot.metrics.echarts1;
      this.echarts2 = this.downloadService.downloadItems.springBoot.metrics.echarts2;
      this.echarts3 = this.downloadService.downloadItems.springBoot.metrics.echarts3;
      this.echarts4 = this.downloadService.downloadItems.springBoot.metrics.echarts4;
      this.echarts5 = this.downloadService.downloadItems.springBoot.metrics.echarts5;
      this.ecahrtsTime = this.downloadService.downloadItems.springBoot.metrics.echartsTime;
    }
    if (this.downloadService.downloadItems.springBoot.httpTraces.allHttpTraces.length > 0) {
      this.allHttpTraces = this.downloadService.downloadItems.springBoot.httpTraces.allHttpTraces;
      this.getCtOptions();
      this.getMethodOpt();
      this.todayTime = this.downloadService.downloadItems.springBoot.httpTraces.filterTime.data;
      this.stimeValue = this.downloadService.downloadItems.springBoot.httpTraces.filterTime.start;
      this.etimeValue = this.downloadService.downloadItems.springBoot.httpTraces.filterTime.end;
      this.httpTraces = this.allHttpTraces;
      this.srcData.data = this.httpTraces;
      this.totalNumber = this.srcData.data.length;
      this.httpTracesLength = this.allHttpTraces.length;
      this.httpUptate = this.downloadService.downloadItems.springBoot.httpTraces.httpOptions;
      this.springbootGroup.controls.springboot_threshold.setValue(
        this.downloadService.downloadItems.springBoot.httpTraces.threshold);
      this.setHttpOptions();
      this.getEchartOpt();
    }
  }
  public getProjectInfo() {
    if (this.isDownload) { return; }
    this.isLoading = true;
    const gId = encodeURIComponent(this.guardianId);
    const jId = encodeURIComponent(this.jvmId);
    this.Axios.axios.get(`/springboot/${gId}/jvm/${jId}/getProjectInfo`)
      .then((resp: any) => {
        this.isLoading = false;
        this.projectInfo = resp;
        sessionStorage.setItem('springBoot', JSON.stringify(resp));
        this.downloadService.downloadItems.springBoot.springBootInfo = resp;
        this.isSpringBoot = resp.springbootProject ? 'true' : 'false';
        if (resp.failReason !== '') {
          this.contentTip = resp.failReason;
        }
        if (this.isSpringBoot === 'false') {
          return;
        }
        this.haveMetrics = this.projectInfo.displayTablePage.includes('metrics');
        if (this.isDownload && this.downloadService.downloadItems.innerDataTabs.length) {
          this.downloadService.downloadItems.springBoot.tabs = this.springBootTabs;
        } else {
          this.springBootTabs = [
            {
              tabName: this.i18n.protalserver_profiling_springBoot.health,
              link: 'health',
              active: true,
              checked: true
            },
            {
              tabName: this.i18n.protalserver_profiling_springBoot.beans,
              link: 'beans',
              active: false,
              checked: true
            },
            {
              tabName: this.i18n.protalserver_profiling_springBoot.metrics,
              link: 'metrics',
              active: false,
              checked: true
            },
            {
              tabName: this.i18n.protalserver_profiling_springBoot.http_traces,
              link: 'http_traces',
              active: false,
              checked: true
            }
          ];
        }
        if (!this.haveMetrics) {
          this.springBootTabs[2].checked = false;
        } else {
          this.springBootTabs[2].checked = true;
        }
        this.springBootTabs.forEach((item: any) => {
          item.active = false;
        });
        this.springBootTabs[0].active = true;
        if (this.projectInfo.configUserPassword) {
          const spLogin = JSON.parse(sessionStorage.getItem('springBootToken'));
          if (spLogin) {
            if (spLogin.jvmId === this.jvmId && spLogin.login) {
              this.showLogin = 'false';
            } else {
              this.showLogin = 'true';
            }
          } else {
            this.showLogin = 'true';
          }
        } else {
          this.showLogin = 'false';
        }
      }).catch(() => {
        this.isLoading = false;
        this.contentTip = this.i18n.profileNoData.springBoot;
      });
  }

  // 获取metrics数据分类
  public metricsCategory(metrics: any) {
    if (metrics.length === 0) { return; }
    const tomcatList = metrics.filter((item: any) => {
      return item.name_.includes('tomcat');
    });
    const jvmList = metrics.filter((item: any) => {
      return item.name_.includes('jvm');
    });
    const logbackList = metrics.filter((item: any) => {
      return item.name_.includes('logback');
    });
    this.getMetricsOpt(tomcatList, jvmList, logbackList);
  }

  // 添加metrics的echarts图数据
  public getMetricsOpt(tomcatList: any, jvmList: any, logbackList: any) {
    if (this.ecahrtsTime.length > this.limitTime * 60 / 5) {
      this.ecahrtsTime.shift();
    }
    // echarts1
    const countList = tomcatList.filter((item: any) => {
      return item.measurements_.count >= 0;
    });
    // 获取echarts1的created、expired、rejected参数
    const created = countList.filter((item: any) => {
      return item.name_.includes('created');
    });
    const expired = countList.filter((item: any) => {
      return item.name_.includes('expired');
    });
    const rejected = countList.filter((item: any) => {
      return item.name_.includes('rejected');
    });
    if (created.length > 0 && expired.length > 0 && rejected.length > 0) {
      if (this.echarts1.created.length > this.limitTime * 60 / 5) {
        this.echarts1.created.shift();
        this.echarts1.expired.shift();
        this.echarts1.rejected.shift();
      }
      this.echarts1.created.push(created[0].measurements_.count);
      this.echarts1.expired.push(expired[0].measurements_.count);
      this.echarts1.rejected.push(rejected[0].measurements_.count);
    } else {
      this.echarts1.show = false;
    }

    // echarts2
    const valueList = tomcatList.filter((item: any) => {
      return item.measurements_.value;
    });
    // 获取echarts2的current、max参数
    const current = valueList.filter((item: any) => {
      return item.name_.includes('current');
    });
    const max = valueList.filter((item: any) => {
      return item.name_.includes('max');
    });
    if (current.length > 0 && max.length > 0) {
      if (this.echarts2.current.length > this.limitTime * 60 / 5) {
        this.echarts2.current.shift();
        this.echarts2.max.shift();
      }
      this.echarts2.current.push(current[0].measurements_.value);
      this.echarts2.max.push(max[0].measurements_.value);
    } else {
      this.echarts2.show = false;
    }

    // echarts3
    const jvmCount = jvmList.filter((item: any) => {
      return item.name_.includes('count');
    });
    if (jvmCount.length > 0) {
      if (this.echarts3.count.length > this.limitTime * 60 / 5) {
        this.echarts3.count.shift();
      }
      this.echarts3.count.push(jvmCount[0].measurements_.value);
    } else {
      this.echarts3.show = false;
    }


    // echarts4
    const jvmTCapacity = jvmList.filter((item: any) => {
      return item.name_.includes('total');
    });
    const jvmMused = jvmList.filter((item: any) => {
      return item.name_.includes('memory');
    });
    if (jvmTCapacity.length > 0 && jvmMused.length > 0) {
      if (this.echarts4.capacity.length > this.limitTime * 60 / 5) {
        this.echarts4.capacity.shift();
        this.echarts4.used.shift();
      }
      this.echarts4.capacity.push((+jvmTCapacity[0].measurements_.value / 1024 / 1024).toFixed(1));
      this.echarts4.used.push((+jvmMused[0].measurements_.value / 1024 / 1024).toFixed(1));
    } else {
      this.echarts4.show = false;
    }

    // echarts5
    const logInfo = logbackList.filter((item: any) => {
      return item.name_.includes('info');
    });
    const logWarn = logbackList.filter((item: any) => {
      return item.name_.includes('warn');
    });
    const logTrace = logbackList.filter((item: any) => {
      return item.name_.includes('trace');
    });
    const logDebug = logbackList.filter((item: any) => {
      return item.name_.includes('debug');
    });
    const logError = logbackList.filter((item: any) => {
      return item.name_.includes('error');
    });
    if (logInfo.length > 0 && logWarn.length > 0 && logTrace.length > 0 && logDebug.length > 0 && logError.length > 0) {
      if (this.echarts5.info.length > this.limitTime * 60 / 5) {
        this.echarts5.info.shift();
        this.echarts5.warn.shift();
        this.echarts5.trace.shift();
        this.echarts5.debug.shift();
        this.echarts5.error.shift();
      }
      this.echarts5.info.push(logInfo[0].measurements_.count);
      this.echarts5.warn.push(logWarn[0].measurements_.count);
      this.echarts5.trace.push(logTrace[0].measurements_.count);
      this.echarts5.debug.push(logDebug[0].measurements_.count);
      this.echarts5.error.push(logError[0].measurements_.count);
    } else {
      this.echarts5.show = false;
    }
    this.getEchartOpt();
  }

  // metrics图的merge数据
  public getEchartOpt() {
    // echart1 更新参数
    const title1 = {
      text: this.i18n.protalserver_profiling_springBoot.metricsTitle1,
      textStyle: {
        color: '#282b33',
        fontWeight: 'normal',
        fontSize: 16
      }
    };
    const xAxis1 = {
      data: this.ecahrtsTime
    };
    const series1 = [
      {
        id: 'created',
        data: this.echarts1.created
      },
      {
        id: 'expired',
        data: this.echarts1.expired
      },
      {
        id: 'rejected',
        data: this.echarts1.rejected
      }
    ];
    this.allMetricsOpt.echarts1 = {
      title: title1,
      xAxis: xAxis1,
      series: series1
    };
    // echarts2 更新参数
    const title2 = {
      text: this.i18n.protalserver_profiling_springBoot.metricsTitle2,
      textStyle: {
        color: '#282b33',
        fontWeight: 'normal',
        fontSize: 16
      }
    };
    const series2 = [
      {
        id: 'active.current',
        data: this.echarts2.current
      },
      {
        id: 'active.max',
        data: this.echarts2.max
      }
    ];
    this.allMetricsOpt.echarts2 = {
      title: title2,
      xAxis: xAxis1,
      series: series2
    };
    // echarts3
    const title3 = {
      text: this.i18n.protalserver_profiling_springBoot.metricsTitle3,
      textStyle: {
        color: '#282b33',
        fontWeight: 'normal',
        fontSize: 16
      }
    };
    const series3 = [
      {
        id: 'count',
        data: this.echarts3.count
      },
    ];
    this.allMetricsOpt.echarts3 = {
      title: title3,
      xAxis: xAxis1,
      series: series3
    };
    // echarts4
    const title4 = {
      text: this.i18n.protalserver_profiling_springBoot.metricsTitle4,
      textStyle: {
        color: '#282b33',
        fontWeight: 'normal',
        fontSize: 16
      }
    };
    const series4 = [
      {
        id: 'total.capacity',
        data: this.echarts4.capacity
      },
      {
        id: 'memory.used',
        data: this.echarts4.used
      },
    ];
    this.allMetricsOpt.echarts4 = {
      title: title4,
      xAxis: xAxis1,
      series: series4
    };
    // echarts5
    const title5 = {
      text: this.i18n.protalserver_profiling_springBoot.metricsTitle5,
      textStyle: {
        color: '#282b33',
        fontWeight: 'normal',
        fontSize: 16
      }
    };
    const series5 = [
      {
        id: 'info',
        data: this.echarts5.info
      },
      {
        id: 'warn',
        data: this.echarts5.warn
      },
      {
        id: 'trace',
        data: this.echarts5.trace
      },
      {
        id: 'debug',
        data: this.echarts5.debug
      },
      {
        id: 'error',
        data: this.echarts5.error
      },
    ];
    this.allMetricsOpt.echarts5 = {
      title: title5,
      xAxis: xAxis1,
      series: series5
    };

  }
  public onSelect(item: any, column: TiTableColumns): void {
    const index: number = this.searchKeys.indexOf(column.key);
    this.searchWords[index] = item.label === 'ALL' ? '' : item.label;
  }
  // 获取内容类型筛选参数
  public getCtOptions() {
    const filterCt = [];
    const contentTypeOpt = new Set();
    this.allHttpTraces.forEach((item: any) => {
      contentTypeOpt.add(item.contentType_.replace('\[\]', ''));
    });
    contentTypeOpt.forEach((item) => {
      if (item !== '') {
        filterCt.push({ label: item });
      }
    });
    filterCt.unshift({ label: 'ALL' });
    this.column[5].options = filterCt;
  }
  public getMethodOpt() {
    const methodFilter = [];
    const methodOpt = new Set();
    this.allHttpTraces.forEach((item: any) => {
      methodOpt.add(item.method_);
    });
    methodOpt.forEach((item) => {
      if (item !== '') {
        methodFilter.push({ label: item });
      }
    });
    methodFilter.unshift({ label: 'ALL' });
    this.column[2].options = methodFilter;

  }
  // 显示时间过滤框
  public timestampFilter() {
    this.endTime = this.allHttpTraces[0].timestamp_;
    this.startTime = this.allHttpTraces[this.allHttpTraces.length - 1].timestamp_;
    this.stimeValue = this.dateFormat(this.startTime).time;
    this.downloadService.downloadItems.springBoot.httpTraces.filterTime.start = this.stimeValue;
    this.etimeValue = this.dateFormat(this.endTime).time;
    this.downloadService.downloadItems.springBoot.httpTraces.filterTime.end = this.etimeValue;
    this.filterShow = !this.filterShow;
  }
  // 时间过滤确认按钮
  public fliterTime() {
    this.sureFilter = true;
    this.filterShow = !this.filterShow;
    this.filterTimeAndStatus();
  }
  public cancleFliterTime() {
    this.endTime = 0;
    this.startTime = 0;
    this.sureFilter = false;
    this.filterTimeAndStatus();
    this.filterShow = !this.filterShow;
  }
  // 时间和状态过滤方法
  public filterTimeAndStatus() {
    // 执行筛选的时间戳
    const start = `${this.todayTime} ${this.stimeValue}`;
    const end = `${this.todayTime} ${this.etimeValue}`;
    const startS = new Date(start).getTime();
    const endS = new Date(end).getTime() + 999;
    // 筛选状态
    const arr: any = [];
    this.checkedArray1.forEach((item) => {
      arr.push(item.key);
    });
    if (arr.length > 0) {
      const status = arr.toString().replace(/,/g, '|');
      const reg = new RegExp('^[' + status + ']');
      this.statusReg = reg;
    } else {
      this.statusReg = new RegExp('^[1-9]');
    }
    if (arr.length < 4 && arr.length > 0) {
      this.haveFilter = true;
    } else {
      this.haveFilter = false;
    }
    const statusFilter = this.allHttpTraces.filter((item: any) => {
      const timestamp = +item.timestamp_;
      if (this.sureFilter) {
        return this.statusReg.test(item.status_.toString()) && timestamp >= startS && timestamp <= endS;
      } else {
        return this.statusReg.test(item.status_.toString());
      }
    });
    this.srcData.data = statusFilter;
  }
  // 显示状态过滤框
  public statusFilter() {
    this.statusShow = !this.statusShow;
  }
  // 点击确认状态过滤
  public fliterStatus() {
    this.statusShow = !this.statusShow;
    this.filterTimeAndStatus();
  }
  // 路径过滤
  public filterPath(pathValueModel: any) {
    this.pathValue = this.pathValueModel;
    if (pathValueModel === '') {
      this.pathFilterLength = 0;
      return;
    }
    const httpTraces = this.allHttpTraces.filter((item: any) => {
      return item.uri_.indexOf(pathValueModel) > -1;
    });
    this.pathFilterLength = httpTraces.length;
  }
  public startSpringBoot() {
    if (this.startBtnDisabled) { return; }
    this.tabsShow = true;
    this.stompService.startStompRequest(
      '/cmd/start-actuator-health',
      { jvmId: this.jvmId, guardianId: this.guardianId }
    );
    this.stompService.startStompRequest(
      '/cmd/start-actuator-metrics',
      { jvmId: this.jvmId, guardianId: this.guardianId }
    );
    this.stompService.startStompRequest(
      '/cmd/start-actuator-httptrace',
      {
        jvmId: this.jvmId,
        guardianId: this.guardianId,
        threshold: this.springbootGroup.controls.springboot_threshold.value
      }
    );
    this.isStart = !this.isStart;
    if (this.tabActive === 'beans') {
      this.getBeansDate();
    }
  }
  public stopSpringBoot() {
    const gId = encodeURIComponent(this.guardianId);
    const jId = encodeURIComponent(this.jvmId);
    this.Axios.axios.get(`/springboot/${gId}/jvm/${jId}/stopSpringbootActuator`)
      .then((res: any) => {
        if (res) {
          this.isStart = !this.isStart;
        }
      });
  }
  public fliterHttptraces(httptrace: any, timestamp: any) {
    const maxNum = Math.max.apply(Math, httptrace.map((o: any) => o.timeTaken_));
    const filterPath = this.pathValue === '' ? '--' : this.pathValue;
    const updataTime = this.dateFormat(timestamp).time;
    const success = httptrace.filter((item: any) => {
      return /^2/.test(item.status_.toString());
    });
    const filed4 = httptrace.filter((item: any) => {
      return /^4/.test(item.status_.toString());
    });
    const filed5 = httptrace.filter((item: any) => {
      return /^5/.test(item.status_.toString());
    });
    if (this.httpUptate.time.length > this.limitTimeTraces * 60 / 5) {
      this.httpUptate.time.shift();
      this.httpUptate.line1.shift();
      this.httpUptate.line2.shift();
      this.httpUptate.line3.shift();
      this.httpUptate.maxNum.shift();
      this.httpUptate.filterPath.shift();
      this.timeData = this.httpUptate.time;
    }
    if (httptrace.length === 0) {
      this.httpUptate.time.push(updataTime);
      this.httpUptate.line1.push(0);
      this.httpUptate.line2.push(0);
      this.httpUptate.line3.push(0);
      this.httpUptate.maxNum.push(0);
      this.httpUptate.filterPath.push(filterPath);
      this.timeData = this.httpUptate.time;
    } else {
      this.httpUptate.time.push(updataTime);
      this.httpUptate.line1.push(success.length);
      this.httpUptate.line2.push(filed4.length);
      this.httpUptate.line3.push(filed5.length);
      this.httpUptate.maxNum.push(maxNum);
      this.httpUptate.filterPath.push(filterPath);
      this.timeData = this.httpUptate.time;
    }
    this.setHttpOptions();
  }
  public setHttpOptions() {
    const xAxis = {
      data: this.httpUptate.time
    };
    const series = [
      {
        id: 'line1',
        data: this.httpUptate.line1
      },
      {
        id: 'line2',
        data: this.httpUptate.line2
      },
      {
        id: 'line3',
        data: this.httpUptate.line3
      }
    ];

    this.httpUpdateOption = {
      xAxis,
      series
    };
    this.timeData = this.httpUptate.time;
    if (this.TimeLine) {
      this.TimeLine.setTimeData(this.timeData);
    }
  }
  public selectBeans(value: any, index: any) {
    if (value.dependencies[0] === '' && (value.resource === '' || value.resource === 'null')) { return; }
    this.beans[index].select = !this.beans[index].select;
    this.beans.forEach((item: any, idx: any) => {
      if (index !== idx) { item.select = false; }
    });
  }
  public activeChange(tab: any) {
    this.tabActive = tab.link;
    this.downloadService.dataSave.isSpringBootTabActive = this.tabActive;
    this.downloadService.downloadItems.currentTabPage = this.i18n.protalserver_profiling_springBoot[tab.link];
    if (tab.link === 'beans' && this.beans.length === 0 && this.isStart) {
      this.beansNoDate = true;
      this.getBeansDate();
    }
  }
  public getBeansDate() {
    if (this.startBtnDisabled) {
      return;
    }
    this.isBeansLoading = true;
    const gId = encodeURIComponent(this.guardianId);
    const jId = encodeURIComponent(this.jvmId);
    this.Axios.axios.get(`/springboot/${gId}/jvm/${jId}/getSpringBootBeansInfo`)
      .then((res: any) => {
        this.isBeansLoading = false;
        res.springBootBeansList.forEach((item: any) => {
          item.dependencies = item.dependencies.replace(/[\[\]]/g, '').split(',');
        });
        this.beansNoDate = false;
        this.beans = res.springBootBeansList;
        this.downloadService.downloadItems.springBoot.beans = this.beans;

      }).catch(() => {
        this.isBeansLoading = false;
      });
  }
  public login(): any {
    if (!this.checkGroup()) {
      return false;
    }
    const params = {
      userName: this.form.get('name').value,
      password: this.form.get('pwd').value,
    };
    this.isLoading = true;
    const gId = encodeURIComponent(this.guardianId);
    const jId = encodeURIComponent(this.jvmId);
    this.Axios.axios
      .post(`/springboot/${gId}/jvm/${jId}/springbootUserAuth`,
        params, { headers: { showLoading: false } })
      .then(
        (resp: any) => {
          this.isLoading = false;
          if (resp) {
            const spLogin = {
              jvmId: this.jvmId,
              login: resp
            };
            sessionStorage.setItem('springBootToken', JSON.stringify(spLogin));
            this.showLogin = 'false';
          } else {
            this.mytip.alertInfo({
              type: 'warn',
              content: this.i18n.protalserver_profiling_springBoot_login.errorLogin,
              time: 3500,
            });
          }
        }
      ).catch((error: any) => {
        this.isLoading = false;
        this.mytip.alertInfo({
          type: 'warn',
          content: error.response.data.message,
          time: 3500,
        });
        this.showLogin = 'true';
      });
  }
  public checkGroup() {
    const errors: ValidationErrors | null = TiValidators.check(this.form);
    // const errors = false;
    // 整体校验后如果需要聚焦到第一个校验不通过元素，请参考以下代码
    if (errors) {
      // 注意：要保证fb.group时各个FormControl的顺序与对应表单元素dom放置顺序一致
      const firstError: any = Object.keys(errors)[0];
      this.elementRef.nativeElement
        .querySelector(`[formControlName=${firstError}]`)
        .focus();
      this.elementRef.nativeElement
        .querySelector(`[formControlName=${firstError}]`)
        .blur();
    }
    if (errors) {
      return false;
    } else {
      return true;
    }
  }
  public getMeasurements(str: any) {
    const measurements: any = {};
    if (typeof str === 'string') {
      str = str.replace(/[\[\]\{\}\s]/g, '');
      const arr = str.split(',');
      if (arr.length === 2) {
        const key = arr[0].split('=')[1].toLowerCase();
        const value = +arr[1].split('=')[1];
        measurements[key] = value.toFixed(1) || 0;
        return measurements;
      } else {
        return {};
      }
    } else {
      return str;
    }

  }
  ngOnDestroy(): void {
    if (this.isDownload) { return; }
    this.downloadData();
    if (this.isStopMsgSub) { this.isStopMsgSub.unsubscribe(); }
    if (this.healthSub) { this.healthSub.unsubscribe(); }
    if (this.metricsSub) { this.metricsSub.unsubscribe(); }
    if (this.httpTracesSub) { this.httpTracesSub.unsubscribe(); }
    this.msgService.sendMessage({ type: 'getDeleteOne', });  // 清除本页面的发送事件
    if (this.deleteOneTab) { this.deleteOneTab.unsubscribe(); }
  }

  public downloadData() {
    this.downloadService.dataSave.isSpringBootStart = this.isStart;
    this.downloadService.downloadItems.springBoot.health = this.health;
    this.downloadService.downloadItems.springBoot.tabs = this.springBootTabs;
    this.downloadService.downloadItems.springBoot.metrics.metrics = this.metrics;
    this.downloadService.downloadItems.springBoot.metrics.echarts1 = this.echarts1;
    this.downloadService.downloadItems.springBoot.metrics.echarts2 = this.echarts2;
    this.downloadService.downloadItems.springBoot.metrics.echarts3 = this.echarts3;
    this.downloadService.downloadItems.springBoot.metrics.echarts4 = this.echarts4;
    this.downloadService.downloadItems.springBoot.metrics.echarts5 = this.echarts5;
    this.downloadService.downloadItems.springBoot.metrics.echartsTime = this.ecahrtsTime;
    this.downloadService.downloadItems.springBoot.httpTraces.allHttpTraces = this.allHttpTraces;
    this.downloadService.downloadItems.springBoot.httpTraces.httpOptions = this.httpUptate;
    this.downloadService.dataSave.sprThreshold =
      this.springbootGroup.controls.springboot_threshold.value;

    if (this.traceFailReason !== '') {
      this.downloadService.downloadItems.springBoot.httpTraces.traceFailReason = this.traceFailReason;
    }
  }
  public bytesToSize(bytes: any) {
    return this.libService.onChangeUnit(bytes);
  }
  // 获取echarts图的时间轴 时间格式
  public dateFormat(time: any) {
    const timeObj = {
      data: this.httpDateFormat(time, 'yyyy/MM/dd hh:mm:ss').split(' ')[0],
      time: this.httpDateFormat(time, 'yyyy/MM/dd hh:mm:ss').split(' ')[1]
    };
    return timeObj;
  }
  public httpDateFormat(date: any, fmt: any) {
    const getDate = new Date(parseInt(date, 10));
    const o: any = {
      'M+': getDate.getMonth() + 1,
      'd+': getDate.getDate(),
      'h+': getDate.getHours(),
      'm+': getDate.getMinutes(),
      's+': getDate.getSeconds(),
      'q+': Math.floor((getDate.getMonth() + 3) / 3),
      S: this.checkTime(getDate.getMilliseconds())
    };
    if (/(y+)/.test(fmt)) {
      fmt = fmt.replace(
        RegExp.$1,
        (getDate.getFullYear() + '').substr(4 - RegExp.$1.length)
      );
    }
    for (const k of Object.keys(o)) {
      if (new RegExp('(' + k + ')').test(fmt)) {
        fmt = fmt.replace(
          RegExp.$1,
          RegExp.$1.length === 1
            ? o[k]
            : ('00' + o[k]).substr(('' + o[k]).length)
        );
      }
    }
    return fmt;
  }
  public checkTime(i: any) {
    if (i < 100 && i > 9) {
      i = '0' + i;
    }
    if (i < 10) {
      i = '00' + i;
    }
    return i;
  }
  onChartInit(ec: any) {
    this.echartsInstance = ec;
  }
  public timeLineData(event: any) {
    this.httpOption.dataZoom[0].start = event.start;
    this.httpOption.dataZoom[0].end = event.end;
    this.echartsInstance.setOption({
      dataZoom: this.httpOption.dataZoom
    });
  }
  public handleDatazoom(event: any) {
    this.TimeLine.dataConfig({
      start: event.batch[0].start,
      end: event.batch[0].end,
    });
  }
  public disableCtrlZ(event: any) {
    return disableCtrlZ(event);
  }
}
export class CustomValidators {
  // 自定义校验规则
  public static isEqualTo(msg: any): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      return control.value === ''
        ? { isEqualTo: { tiErrorMessage: msg } }
        : null;
    };
  }
  public static password(i18n: any): ValidatorFn {
    const reg = new RegExp(/^(?![A-Z]+$)(?![a-z]+$)(?!\d+$)(?![\W_]+$)\S{6,32}$/);
    return (control: AbstractControl): ValidationErrors | null => {
      return reg.test(control.value) === false
        ? { pwd: { tiErrorMessage: i18n } }
        : null;
    };
  }

  public static username(i18n: any): ValidatorFn {
    const reg = new RegExp(/[a-zA-Z][a-zA-Z0-9_-]{5,31}$/);
    return (control: AbstractControl): ValidationErrors | null => {
      return reg.test(control.value) === false
        ? { oldPwd: { tiErrorMessage: i18n } }
        : null;
    };
  }
}
