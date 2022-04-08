import { Component, OnInit, Input, ViewChild, ElementRef, SecurityContext } from '@angular/core';
import { TiPageSizeConfig, TiPaginationEvent } from '@cloud/tiny3';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import { LeftShowService } from 'projects/sys/src-web/app/service/left-show.service';
import { InterfaceService } from '../service/interface.service';
import { DomSanitizer } from '@angular/platform-browser';
import * as Util from 'projects/sys/src-web/app/util';
import { PublicMethodService } from '../service/public-method.service';
import { graphic } from 'echarts';

@Component({
  selector: 'app-res-cpu-sche',
  templateUrl: './res-cpu-sche.component.html',
  styleUrls: ['./res-cpu-sche.component.scss']
})
export class ResCpuScheComponent implements OnInit {
  @Input() taskid: any;
  @Input() nodeid: any;
  @Input() configuration: any;
  i18n: any;
  @ViewChild('chartBox') chartBox: any;
  @ViewChild('timeLineDetail') timeLineDetail: any;
  @ViewChild('container') private containerRef: ElementRef;
  @ViewChild('tagBox') private tagBox: any;
  // -- 筛选弹框 --
  @ViewChild('selectTaskModal') selectTaskModal: any;
  @Input()
  get item(): any { return this.tpItem; }
  set item(item) {
    this.tpItem = item;
    if (item) {
      this.summaryTid = item.tid;
      if (!this.ifInit) {
        this.locatePtid();
      }
    }

  }
  public tpItem: any; // 从summary页面跳转过来
  public summaryTid: any;
  public ifInit = true;
  public startTime: any;
  public endtTime: any;
  public noData = '';
  public thousandSeparatorPipe: any;

  public colorList = {
    Idle: {
      normal: '#e1e6ee',
      emphasis: '#c6d2e6',
    },
    Running: {
      normal: '#41ba41',
      emphasis: '#8cd600',
    },
    selectedThread: { // 选中的线程
      normal: '#267dff',
      emphasis: '#69c0ff',
    },
    lockedThread: { // 锁定的线程
      normal: '#e88b00',
      emphasis: '#e88b00',
    },
  };
  public waitInit = false;
  public obtainingChartData = true;

  // chart related
  public chartInstance: any;
  public options: any;
  public updateOptions: any;
  public timeLineShow = false;
  public orderlist: any = [];

  // 类型选择
  public currentType: any;
  public typeList: any = [];

  // 选择 CPU
  public filterCPU: any = {
    title: '',
    allCpuOption: [],

    showCpuCategory: false,
    selectedCpuCategory: undefined,
    cpuCategoryList: [],

    cpuSelected: [],
    cpuOption: [],
  };

  // 运行时长排序
  public sortDurationSummary: any = {
    title: '',
    selected: undefined,
    list: [],
    sortStatus: 'desc',
  };

  // 选择进程/线程
  public locatePTidData: any = {
    title: '',
    selected: [],
    lockedThread: (undefined as number), // selected可能有多个，可以通过点击选中的色块，将改的色块的线程锁定，锁定线程的色块统一换一种颜色显示，方便查看
    list: [],
  };

  // 分页【针对CPU进行分页】
  public currentPage = 1;
  public totalNumber = 0;
  public pageSize: TiPageSizeConfig = {
    options: [5, 10, 20],
    size: 10
  };

  // 时间轴原始数据
  public timeData: any = {};
  public timeLine = { start: 0, end: 100 };
  public subTop10: any;



  constructor(
    public i18nService: I18nService,
    public leftShowService: LeftShowService,
    private interfaceService: InterfaceService,
    private domSanitizer: DomSanitizer,
    public publicMethodService: PublicMethodService,
  ) {
    this.i18n = this.i18nService.I18n();
    this.typeList = [
      { prop: 'cpuStatus', tip: this.i18n.sys_res.CPUCoreStatusSequenceChart },
      { prop: 'durationSummary', tip: this.i18n.sys_res.CPUCoreStatusDurationSummary },
      { prop: 'locatePTid', tip: this.i18n.sys_res.locatingPTStatus },
    ];

    this.filterCPU.title = this.i18n.sys_res.selectCPU;

    this.sortDurationSummary.title = this.i18n.sys_res.sorting;
    this.sortDurationSummary.list = [
      { label: 'Running', prop: 'Running' },
      { label: 'Idle', prop: 'Idle' },
    ];
    this.sortDurationSummary.selected = this.sortDurationSummary.list[0];

    this.locatePTidData.title = this.i18n.sys_res.selectThread;
  }

  ngOnInit() {
    this.subTop10 = this.interfaceService.topList10;
    this.noData = this.i18n.loading;

    this.initOption();
    if (this.tpItem) {
      this.currentType = this.typeList[2].prop;
    } else {
      this.currentType = this.typeList[0].prop;
    }
    // 页面监听
    this.leftShowService.leftIfShow.subscribe(() => setTimeout(() => this.chartInstance.resize(), 500));
  }

  public init() {
    this.initTime();
  }

  /** 初始化echarts配置项 */
  private initOption() {
    this.options = {
      grid: {
        top: 36,
        right: 35,
        left: 30,
        containLabel: true,
      },
      legend: {
        right: 10,
        icon: 'rect',
        itemWidth: 8,
        itemHeight: 8,
        formatter: (name: any) => {
          if (name === 'selectedThread') {
            return this.i18n.sys_res.selectedThread;
          } else if (name === 'lockedThread') {
            return this.i18n.sys_res.lockedThread;
          } else {
            return name;
          }
        },
      },
      tooltip: {
        borderColor: 'rgba(50,50,50,0)',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderRadius: 0,
        enterable: false,
        confine: true,
        padding: [10, 20],
        extraCssText: 'box-shadow: 0 5px 8px rgba(51,56,84,0.25);',
        textStyle: {
          color: '#616161',
          fontSize: 12,
          lineHeight: 26,
        },
      },
      xAxis: {
        scale: true,
        axisLabel: {
          showMinLabel: false,
          showMaxLabel: false,
          color: '#616161',
        },
        axisTick: {
          show: false,
        },
        axisLine: {
          show: false,
        },
        splitLine: {
          lineStyle: {
            color: '#ebeef4',
          },
        },
      },
      yAxis: {
        inverse: true,
        data: [],
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          show: false,
        },
      },
      series: []
    };
  }

  // 转换-1、:-1使用[unknown]来显示
  private transformLabel(label: any) {
    if ([-1, '-1', ':-1'].includes(label)) { return '[unknown]'; }
    if (['-1/:-1', '-1/-1', ':-1/:-1', ':-1/-1'].includes(label)) { return '[unknown]/[unknown]'; }
    return label;
  }

  // -- get data --
  // 获取时间范围
  public initTime() {
    this.obtainingChartData = true;
    this.interfaceService.getTotalTimeRange(this.taskid, this.nodeid, 'cpu').then((res: any) => {
      this.startTime = res.data.start_time;
      this.endtTime = res.data.end_time;
      this.initFilterList();
    }).catch(e => {
      this.obtainingChartData = false;
    });
  }

  /**
   * 初始化筛选框的数据
   */
  private initFilterList() {
    this.obtainingChartData = true;
    this.interfaceService.getFilterList(this.taskid, this.nodeid,
      ['cpu_list', 'used_cpus', 'app_cpus', 'pid_ppid_rels', 'app_ppids']).then((data: any) => {
        // 应用模式需要显示 全部显示 和 应用相关 下拉框来筛选CPU
        if (['Launch Application', 'Attach to Process'].includes(this.configuration.task_param['analysis-target'])) {
          this.filterCPU.cpuCategoryList = [
            {
              label: this.i18n.sys_res.all,
              prop: 'all',
              list: data.cpu_list,
              checked: false
            }, {
              label: this.i18n.sys_res.applicationSpecific,
              prop: 'applicationRelated',
              list: data.app_cpus,
              checked: true
            }
          ];

          // 没有数据的CPU和应用相关的CPU禁用掉，提示未采集到数据
          this.filterCPU.allCpuOption = data.cpu_list.map((cpuNum: any) => {
            const item: any = {
              label: `CPU ${cpuNum}`,
              prop: cpuNum,
            };

            // 没有数据时提示 未采集到数据
            if (!(data.used_cpus.includes(cpuNum) && data.app_cpus.includes(cpuNum))) {
              item.disabled = true;
              item.disabledReason = this.i18n.sys_res.noDataIsCollected;
            }

            return item;
          });

          this.filterCPU.showCpuCategory = true;
          this.filterCPU.selectedCpuCategory = this.filterCPU.cpuCategoryList.find((item: any) => item.checked);
          this.cpuCategoryChange(this.filterCPU.selectedCpuCategory);
        } else {  // profile system
          this.filterCPU.allCpuOption = data.cpu_list.map((cpuNum: any) => {
            const item: any = {
              label: `CPU ${cpuNum}`,
              prop: cpuNum,
            };

            // 没有数据的CPU禁用掉，提示未采集到数据
            if (!data.used_cpus.includes(cpuNum)) {
              item.disabled = true;
              item.disabledReason = this.i18n.sys_res.noDataIsCollected;
            }

            return item;
          });

          this.filterCPU.cpuOption = this.filterCPU.allCpuOption;
          this.filterCPU.cpuSelected = [...this.filterCPU.cpuOption];
        }

        const pid_ppid_rels = data.pid_ppid_rels;
        const selected: any = [];
        this.locatePTidData.list = Object.keys(pid_ppid_rels).map(ppid => {
          return {
            label: this.transformLabel(ppid),
            prop: +ppid.split('/')[0],
            children: pid_ppid_rels[ppid].map((pid: any) => {
              const item = {
                label: this.transformLabel(pid),
                prop: +pid.split('/')[0],
              };

              // 从summary页面跳转来的, 页面初始化走这里
              if (this.tpItem) {
                if (this.tpItem.tid === item.prop) {
                  selected.push(item);

                }
              } else {
                if (this.subTop10.indexOf(item.prop) > -1) {
                  selected.push(item);
                }
              }
              return item;
            })
          };
        });
        this.locatePTidData.selected = selected;
        this.getData({ ifInit: true });
      }).catch(() => {
        this.obtainingChartData = false;
      });
  }

  /**
   * 筛选未采集到数据的CPU
   * @param selectData 选择的CPU数据
   */
   private getFilterCpuData(selectData: any[]): string {
    // 当选择的数据只有未采集到数据时返回undefined
    if (selectData.some((cpuItem: any) => !cpuItem.disabled)) {
      return selectData.map((cpuItem: any) => cpuItem.prop).join(',');
    } else {
      return '';
    }
  }

  // 获取图表数据
  public getData({ startTime = this.startTime, endTime = this.endtTime, ifInit = false }: {
    startTime?: number, // 数据窗口范围的起始数值
    endTime?: number, // 数据窗口范围的结束数值
    ifInit?: boolean,
  }) {
    this.tpItem = null;
    this.ifInit = false;
    if (this.currentType === 'cpuStatus') {
      this.obtainingChartData = true;
      this.interfaceService.getCpuStatusData({
        taskId: this.taskid,
        nodeId: this.nodeid,
        pageNo: this.currentPage,
        pageSize: this.pageSize.size,
        cpuList: this.filterCPU.cpuSelected.length
          ? this.getFilterCpuData(this.filterCPU.cpuSelected) : undefined,
        startTime,
        endTime,
        ifInit,
      }).then((res: any) => {
        this.totalNumber = res.data.total_count;
        this.updateChartData('cpuStatus', res.data);
      }).catch(e => {
        this.totalNumber = 0;
        this.noData = this.i18n.common_term_task_nodata2;
      }).finally(() => {
        this.obtainingChartData = false;
      });
    } else if (this.currentType === 'durationSummary') {
      this.obtainingChartData = true;
      this.interfaceService.getDurationSummaryData({
        taskId: this.taskid,
        nodeId: this.nodeid,
        pageNo: this.currentPage,
        pageSize: this.pageSize.size,
        sortBy: this.sortDurationSummary.selected.prop,
        sortStatus: this.sortDurationSummary.sortStatus,
        cpuList: this.filterCPU.cpuSelected.length
          ? this.getFilterCpuData(this.filterCPU.cpuSelected) : undefined,
        startTime,
        endTime,
        ifInit,
      }).then((res: any) => {
        this.totalNumber = res.data.total_count;
        this.updateChartData('durationSummary', res.data);
      }).catch(e => {
        this.totalNumber = 0;
        this.noData = this.i18n.common_term_task_nodata2;
      }).finally(() => {
        this.obtainingChartData = false;
      });
    } else if (this.currentType === 'locatePTid') {
      this.obtainingChartData = true;
      this.interfaceService.getLocatePTidData({
        taskId: this.taskid,
        nodeId: this.nodeid,
        pageNo: this.currentPage,
        pageSize: this.pageSize.size,
        pidList: this.locatePTidData.selected.length
          ? this.locatePTidData.selected.map((item: any) => item.prop).join(',') : undefined,
        startTime,
        endTime,
        ifInit,
      }).then((res: any) => {
        this.totalNumber = res.data.total_count;
        this.updateChartData('locatePTid', res.data);
      }).catch(e => {
        this.totalNumber = 0;
        this.noData = this.i18n.common_term_task_nodata2;
      }).finally(() => {
        this.obtainingChartData = false;
      });
    }
  }


  // -- chart --
  // chart init
  public onChartInit(chartInstance: any) {
    this.chartInstance = chartInstance;
    this.chartInstance.on('datazoom', (params: any) => { // 放大缩小时同步修改时间轴
      if (params.batch) {
        this.setTimeLine(params.batch[0].start, params.batch[0].end);
      }
    });

    this.chartInstance.on('mousemove', (params: any) => {  // 只有筛选ptid选中的Running色块才会变成手型
      if (['selectedThread'].includes(params.seriesName)) {
        this.chartInstance.getZr().setCursorStyle('pointer');
      } else {
        this.chartInstance.getZr().setCursorStyle('default');
      }
    });

    this.chartInstance.on('click', (params: any) => {
      if (['selectedThread', 'lockedThread'].includes(params.seriesName)) {
        /**
         * 1、selectedThread 状态下点击
         *   1.1、已有锁定的线程，切换锁定线程为该线程
         *   1.2、没有锁定的线程，设置该线程为锁定线程
         * 2、lockedThread 状态下点击
         *   2.1、取消锁定改线程
         */
        this.locatePTidData.lockedThread = this.locatePTidData.lockedThread === params.value[4]
          ? undefined : params.value[4];

        const series = this.chartInstance.getOption().series;
        const lockedThreadSeries = series.find((item: any) => item.name === 'lockedThread');
        const selectedThreadSeries = series.find((item: any) => item.name === 'selectedThread');
        const newLockedThreadDatas = [];

        if (this.locatePTidData.lockedThread !== undefined) {
          for (let index = 0; index < selectedThreadSeries.data.length; index++) {
            if (selectedThreadSeries.data[index].value[4] === params.value[4]) {
              newLockedThreadDatas.push(selectedThreadSeries.data.splice(index--, 1)[0]);
            }
          }
        }
        selectedThreadSeries.data.push(...lockedThreadSeries.data);
        lockedThreadSeries.data = newLockedThreadDatas;

        const legendDatas = ['Running', 'Idle'];
        if (selectedThreadSeries.data.length) {
          legendDatas.unshift('selectedThread');
        }
        if (lockedThreadSeries.data.length) {
          legendDatas.unshift('lockedThread');
        }

        this.updateOptions = {
          legend: {
            data: legendDatas,
          },
          series
        };
      }
    });

    if (this.configuration) {
      this.init();
    } else {
      this.waitInit = true;
    }
  }

  private renderItem(params: any, api: any): any {
    const categoryIndex = api.value(2);
    const start = api.coord([api.value(0), categoryIndex]);
    const end = api.coord([api.value(1), categoryIndex]);
    const height = 10;
    const width = end[0] - start[0];

    if (width > 0.8) {
      const rectShape = graphic.clipRectByRect({
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
        style: api.style(),
        styleEmphasis: api.styleEmphasis(),
      };
    }
    return void 0;
  }

  /**
   * 更新 chart 数据
   * @param currentType 图标类型
   * @param resData 返回数据
   */
  public updateChartData(currentType: any, resData: any) {
    /**
     * 1、所有的数据段都是ms单位，所有的数据点都是us单位（数据比较准确）
     * 2、全部转换成微秒去画图，显示使用毫秒
     */
    this.orderlist = resData.orderlist.map(
      (cpuNum: any) => this.filterCPU.cpuOption.find((option: any) => option.prop === cpuNum));
    const height = resData.orderlist.length ? (30 * resData.orderlist.length + 20) : 400;
    this.chartBox.nativeElement.style.height = `${height + 40}px`;
    setTimeout(() => this.chartInstance.resize(), 10);
    let min = Infinity;
    let max = -Infinity;

    if (currentType === 'cpuStatus') { // CPU 状态
      const runningDatas: any = [];
      const idleDatas: any = [];

      resData.orderlist.forEach((cpuNum: any, index: any) => {
        resData.cpu_info[cpuNum].detail.forEach((detail: any) => {
          const startTime = detail.start_time;
          const switchTime = startTime + detail.runtime * 1000;
          const endTIme = detail.end_time;
          min = Math.min(min, startTime);
          max = Math.max(max, endTIme);
          const tipInfo = [
            this.transformLabel(detail.taskname),
            this.transformLabel(detail.pid),
            this.transformLabel(detail.ppid),
            Util.fixThouSeparator((+detail.idle_time).toFixed(3)),
            Util.fixThouSeparator((+detail.runtime).toFixed(3)),
            detail.callstack,
          ];

          runningDatas.push({
            value: [startTime, switchTime, index, ...tipInfo],
          });

          idleDatas.push({
            value: [switchTime, endTIme, index, ...tipInfo],
          });
        });
      });

      // 无数据的时间段用idle补齐
      resData.orderlist.forEach((cpuNum: any, index: any) => {
        if (resData.cpu_info[cpuNum].detail && resData.cpu_info[cpuNum].detail.length) {
          const startrTime = resData.cpu_info[cpuNum].detail[0].start_time;
          const endTime = resData.cpu_info[cpuNum].detail.slice(-1)[0].end_time;
          if (startrTime > min) {
            idleDatas.push({
              value: [+min, startrTime, index],
            });
          }
          if (endTime < max) {
            idleDatas.push({
              value: [endTime, +max, index],
            });
          }
        } else {
          idleDatas.push({
            value: [+min, +max, index],
          });
        }
      });

      this.updateOptions = {
        title: {
          show: !(runningDatas.length || idleDatas.length),
          textStyle: {
            color: '#bcbcbc'
          },
          text: 'No Data',
          left: 'center',
          top: 'center'
        },
        grid: {
          height,
        },
        legend: {
          data: ['Running', 'Idle']
        },
        tooltip: {
          formatter: (params: any): any => {
            if (params.value[3] !== undefined) {
              return `
              <div style="width: max-content;">
                <table class="tipTable">
                  <tr><td>${this.i18n.sys_res.threadName}</td>
                  <td>${this.domSanitizer.sanitize(SecurityContext.HTML, params.value[3])}</td></tr>
                  <tr><td>TID/PID</td>
                  <td>${this.domSanitizer.sanitize(SecurityContext.HTML, params.value[4])
                || '--'} / ${this.domSanitizer.sanitize(SecurityContext.HTML, params.value[5]) || '--'}</td></tr>
                  <tr><td>${this.i18n.sys_res.waitingDuration}</td>
                  <td>${this.domSanitizer.sanitize(SecurityContext.HTML, params.value[6])} ms</td></tr>
                  <tr><td>${this.i18n.sys_res.runningTime}</td>
                  <td>${this.domSanitizer.sanitize(SecurityContext.HTML, params.value[7])} ms</td></tr>
                  ${params.value[8] ? ('<tr><td>' + this.i18n.common_term_task_tab_summary_callstack +
                  '</td><td>' + this.domSanitizer.sanitize(SecurityContext.HTML, params.value[8]) + '</td></tr>') : ''}
                </table>
              </div>
              `;
            }
          },
        },
        xAxis: {
          min,
          max,
          axisLabel: {
            formatter: (val: number) => `${(val / 1000).toFixed(2)} ms`,
          },
        },
        yAxis: {
          data: resData.orderlist,
        },
        dataZoom: [{
          type: 'inside',
          filterMode: 'weakFilter',
          disabled: false,
        }],
        series: [{
          name: 'lockedThread',
          type: 'custom',
          encode: {
            x: [0, 1],
            y: 2,
          },
          itemStyle: {
            color: this.colorList.lockedThread.normal,
          },
          emphasis: {
            itemStyle: {
              color: this.colorList.lockedThread.emphasis,
            }
          },
          data: [],
          renderItem: this.renderItem,
          progressive: 0,
        }, {
          name: 'selectedThread',
          type: 'custom',
          encode: {
            x: [0, 1],
            y: 2,
          },
          itemStyle: {
            color: this.colorList.selectedThread.normal,
          },
          emphasis: {
            itemStyle: {
              color: this.colorList.selectedThread.emphasis,
            }
          },
          data: [],
          renderItem: this.renderItem,
          progressive: 0,
        }, {
          name: 'Running',
          type: 'custom',
          encode: {
            x: [0, 1],
            y: 2,
          },
          itemStyle: {
            color: this.colorList.Running.normal,
          },
          emphasis: {
            itemStyle: {
              color: this.colorList.Running.emphasis,
            }
          },
          data: runningDatas,
          renderItem: this.renderItem,
          progressive: 0,
        }, {
          name: 'Idle',
          type: 'custom',
          encode: {
            x: [0, 1],
            y: 2,
          },
          itemStyle: {
            color: this.colorList.Idle.normal,
          },
          emphasis: {
            itemStyle: {
              color: this.colorList.Idle.emphasis,
            }
          },
          data: idleDatas,
          renderItem: this.renderItem,
          progressive: 0,
        }]
      };
    } else if (currentType === 'durationSummary') {  // CPU 时长
      const runningDatas: { value: any[]; }[] = [];
      const idleDatas: any = [];

      resData.orderlist.forEach((cpuNum: any, index: any) => {
        const info = resData.cpu_info[cpuNum];

        const runtimePercentage = info['runtime%'] * 100;
        const idletimePercentage = info['idletime%'] * 100;
        const tipInfo = [
          Util.fixThouSeparator((+info.runtime).toFixed(3)),
          runtimePercentage,
          Util.fixThouSeparator((+info.idletime).toFixed(3)),
          idletimePercentage
        ];

        runningDatas.push({
          value: [0, runtimePercentage, index, ...tipInfo],
        });

        idleDatas.push({
          value: [runtimePercentage, 100, index, ...tipInfo],
        });
      });

      this.updateOptions = {
        title: {
          show: !(runningDatas.length || idleDatas.length),
          textStyle: {
            color: '#bcbcbc'
          },
          text: 'No Data',
          left: 'center',
          top: 'center'
        },
        grid: {
          height,
        },
        legend: {
          data: ['Running', 'Idle']
        },
        tooltip: {
          formatter: (params: any) => {
            return `
              <table style="font-size: 12px; line-height: 28px; color: #222;">
                <tr>
                  <td>
                    <div style="display: flex; align-items: center;">
                      <div style="width: 8px; height: 8px; background: #52c41a;"></div>
                      <div style="margin-left: 8px;">Running</div>
                    </div>
                  </td>
                  <td style="padding-left: 16px;">
                  ${this.domSanitizer.sanitize(SecurityContext.HTML, params.value[3])} ms
                  (${this.domSanitizer.sanitize(SecurityContext.HTML, params.value[4].toFixed(2))}%)</td>
                </tr>
                <tr>
                  <td>
                    <div style="display: flex; align-items: center;">
                      <div style="width: 8px; height: 8px; background: #e1e6ee;"></div>
                      <div style="margin-left: 8px;">Idle</div>
                    </div>
                  </td>
                  <td style="padding-left: 16px;">
                  ${this.domSanitizer.sanitize(SecurityContext.HTML, params.value[5])} ms
                  (${this.domSanitizer.sanitize(SecurityContext.HTML, params.value[6].toFixed(2))}%)</td>
                </tr>
              </table>
            `;
          },
        },
        xAxis: {
          min: 0,
          max: 100,
          axisLabel: {
            formatter: (val: any) => `${(val).toFixed(2)} %`,
          },
        },
        yAxis: {
          data: resData.orderlist,
        },
        dataZoom: [{
          type: 'inside',
          filterMode: 'weakFilter',
          disabled: true,
        }],
        series: [{
          name: 'lockedThread',
          type: 'custom',
          encode: {
            x: [0, 1],
            y: 2,
          },
          itemStyle: {
            color: this.colorList.lockedThread.normal,
          },
          emphasis: {
            itemStyle: {
              color: this.colorList.lockedThread.emphasis,
            }
          },
          data: [],
          renderItem: this.renderItem,
        }, {
          name: 'selectedThread',
          type: 'custom',
          encode: {
            x: [0, 1],
            y: 2,
          },
          itemStyle: {
            color: this.colorList.selectedThread.normal,
          },
          emphasis: {
            itemStyle: {
              color: this.colorList.selectedThread.emphasis,
            }
          },
          data: [],
          renderItem: this.renderItem,
        }, {
          name: 'Running',
          type: 'custom',
          encode: {
            x: [0, 1],
            y: 2,
          },
          itemStyle: {
            color: this.colorList.Running.normal,
          },
          emphasis: {
            itemStyle: {
              color: this.colorList.Running.emphasis,
            }
          },
          data: runningDatas,
          renderItem: this.renderItem,
        }, {
          name: 'Idle',
          type: 'custom',
          encode: {
            x: [0, 1],
            y: 2,
          },
          itemStyle: {
            color: this.colorList.Idle.normal,
          },
          emphasis: {
            itemStyle: {
              color: this.colorList.Idle.emphasis,
            }
          },
          data: idleDatas,
          renderItem: this.renderItem,
        }]
      };
    } else if (currentType === 'locatePTid') {  // 筛选pid tid
      const runningDatas: any = [];
      const idleDatas: any = [];
      const selectedThreadDatas: any = [];
      const lockedThreadDatas: any = [];

      resData.orderlist.forEach((cpuNum: any, index: any) => {
        resData.cpu_info[cpuNum].detail.forEach((detail: any) => {
          const startTime = detail.start_time;
          const switchTime = startTime + detail.runtime * 1000;
          const endTIme = detail.end_time;
          min = Math.min(min, startTime);
          max = Math.max(max, endTIme);
          const tipInfo = [
            this.transformLabel(detail.taskname),
            this.transformLabel(detail.pid),
            this.transformLabel(detail.ppid),
            Util.fixThouSeparator((+detail.idle_time).toFixed(3)),
            Util.fixThouSeparator((+detail.runtime).toFixed(3)),
            detail.callstack,
          ];

          if (detail.highlight) { // 选择进程/线程选中
            if (detail.pid === this.locatePTidData.lockedThread) { // 锁定的线程统一换一种颜色标记
              lockedThreadDatas.push({
                value: [startTime, switchTime, index, ...tipInfo],
              });
            } else {
              selectedThreadDatas.push({
                value: [startTime, switchTime, index, ...tipInfo],
              });
            }
          } else {
            runningDatas.push({
              value: [startTime, switchTime, index, ...tipInfo],
            });
          }

          idleDatas.push({
            value: [switchTime, endTIme, index, ...tipInfo],
          });
        });
      });

      // 无数据的时间段用idle补齐
      resData.orderlist.forEach((cpuNum: any, index: any) => {
        if (resData.cpu_info[cpuNum].detail && resData.cpu_info[cpuNum].detail.length) {
          const startrTime = resData.cpu_info[cpuNum].detail[0].start_time;
          const endTime = resData.cpu_info[cpuNum].detail.slice(-1)[0].end_time;
          if (startrTime > min) {
            idleDatas.push({
              value: [+min, startrTime, index],
            });
          }
          if (endTime < max) {
            idleDatas.push({
              value: [endTime, +max, index],
            });
          }
        } else {
          idleDatas.push({
            value: [+min, +max, index],
          });
        }
      });

      const legendDatas = ['Running', 'Idle'];
      if (selectedThreadDatas.length) {
        legendDatas.unshift('selectedThread');
      }
      if (lockedThreadDatas.length) {
        legendDatas.unshift('lockedThread');
      }

      this.updateOptions = {
        title: {
          show: !(runningDatas.length || idleDatas.length),
          textStyle: {
            color: '#bcbcbc'
          },
          text: 'No Data',
          left: 'center',
          top: 'center'
        },
        grid: {
          height,
        },
        legend: {
          data: legendDatas,
        },
        tooltip: {
          formatter: (params: any): any => {
            if (params.value[3] !== undefined) {
              return `
                ${params.seriesName === 'selectedThread' ? (
                  '<div style="margin-bottom: 10px; color: #616161; font-size: 12px;' +
                  ' line-height: 18px; display: flex; align-items: center;">'
                  + '<img src="./assets/img/projects/locate.svg" alt="" style="margin-right: 8px;">'
                  + this.i18n.sys_res.lockThread
                  + '</div>'
                ) : ''}
                <div style="width: max-content">
                  <table class="tipTable">
                    <tr><td>${this.i18n.sys_res.threadName}</td>
                    <td>${this.domSanitizer.sanitize(SecurityContext.HTML, params.value[3])}</td></tr>
                    <tr>
                      <td>TID/PID</td>
                      <td>${this.domSanitizer.sanitize(SecurityContext.HTML, params.value[4])
                || '--'} / ${this.domSanitizer.sanitize(SecurityContext.HTML, params.value[5]) || '--'}</td>
                    </tr>
                    <tr><td>${this.i18n.sys_res.waitingDuration}</td>
                    <td>${this.domSanitizer.sanitize(SecurityContext.HTML, params.value[6])} ms</td></tr>
                    <tr><td>${this.i18n.sys_res.runningTime}</td><td>${params.value[7]} ms</td></tr>
                    ${this.domSanitizer.sanitize(SecurityContext.HTML, params.value[8]) ?
                  ('<tr><td>' + this.i18n.common_term_task_tab_summary_callstack
                    + '</td><td>'
                    + this.domSanitizer.sanitize(SecurityContext.HTML, params.value[8]) + '</td></tr>') : ''}
                  </table>
                </div>
              `;
            }
          },
        },
        xAxis: {
          min,
          max,
          axisLabel: {
            formatter: (val: any) => `${(val / 1000).toFixed(2)} ms`,
          },
        },
        yAxis: {
          data: resData.orderlist,
        },
        dataZoom: [{
          type: 'inside',
          filterMode: 'weakFilter',
          disabled: false,
        }],
        series: [
          {
            name: 'lockedThread',
            type: 'custom',
            encode: {
              x: [0, 1],
              y: 2,
            },
            itemStyle: {
              color: this.colorList.lockedThread.normal,
            },
            emphasis: {
              itemStyle: {
                color: this.colorList.lockedThread.emphasis,
              }
            },
            data: lockedThreadDatas,
            renderItem: this.renderItem,
            progressive: 0,
          }, {
            name: 'selectedThread',
            type: 'custom',
            encode: {
              x: [0, 1],
              y: 2,
            },
            itemStyle: {
              color: this.colorList.selectedThread.normal,
            },
            emphasis: {
              itemStyle: {
                color: this.colorList.selectedThread.emphasis,
              }
            },
            data: selectedThreadDatas,
            renderItem: this.renderItem,
            progressive: 0,
          }, {
            name: 'Running',
            type: 'custom',
            encode: {
              x: [0, 1],
              y: 2,
            },
            itemStyle: {
              color: this.colorList.Running.normal,
            },
            emphasis: {
              itemStyle: {
                color: this.colorList.Running.emphasis,
              }
            },
            data: runningDatas,
            renderItem: this.renderItem,
            progressive: 0,
          }, {
            name: 'Idle',
            type: 'custom',
            encode: {
              x: [0, 1],
              y: 2,
            },
            itemStyle: {
              color: this.colorList.Idle.normal,
            },
            emphasis: {
              itemStyle: {
                color: this.colorList.Idle.emphasis,
              }
            },
            data: idleDatas,
            renderItem: this.renderItem,
            progressive: 0,
          }
        ]
      };
    }

    this.setTimeData(min === Infinity ? 0 : min, max === -Infinity ? 0 : max);
    this.setTimeLine(0, 100);
  }


  // -- 数据切换 --
  // 切换图表类型
  public switchType(typeItem: any) {
    this.tagBox.isExpand = false;
    // 切换至“进程/线程状态定位图”和从“进程/线程状态定位图”切换至其他图，重置下页码，因为这两种图总条数不一致，页码超出范围会报错
    if (this.currentType === 'locatePTid' || typeItem.prop === 'locatePTid') {
      this.currentPage = 1;
    }
    this.currentType = typeItem.prop;
    this.chartInstance.dispatchAction({
      type: 'dataZoom',
      start: 0,
      end: 100,
    });
    this.getData({});
  }

  // CPU 种类变化时【筛选CPU】
  public cpuCategoryChange(e: any) {
    this.filterCPU.cpuOption = this.filterCPU.allCpuOption.filter((item: any) => e.list.includes(item.prop));
    this.filterCPU.cpuSelected = [...this.filterCPU.cpuOption];
  }

  // 筛选CPU
  public cpuChange() {
    this.currentPage = 1;
    this.getData({});
  }

  // 运行时长排序
  public switchDurationSummarySortBy() {
    this.getData({});
  }

  public switchDurationSummarySortStatus() {
    if (this.sortDurationSummary.sortStatus === 'desc') {
      this.sortDurationSummary.sortStatus = 'asc';
    } else if (this.sortDurationSummary.sortStatus === 'asc') {
      this.sortDurationSummary.sortStatus = 'desc';
    }

    this.getData({});
  }


  /**
   *  筛选进程/线程
   *  页面初始化之后从summary页面跳转来的
   */
  public locatePtid() {
    this.locatePTidData.selected = [];
    this.locatePTidData.list.forEach((val: { children: { prop: any; }[]; }) => {
      val.children.forEach((el: { prop: any; }) => {
        if (el.prop === this.tpItem.tid) {
          this.locatePTidData.selected.push(el);
        }
      });
    });
    this.currentType = this.typeList[2].prop;
    this.currentPage = 1;
    this.switchType(this.typeList[2]);
  }
  /** 显示筛选弹框 */
  public showSelectTaskModal() {
    this.tagBox.isExpand = false;
    this.selectTaskModal.open();
  }


  /**
   * 点击tag，删除选中项, 同步侧滑框选中状态
   * @param taskItem taskItem
   */
  public deleteTask(taskItem: any) {
    const idx = this.locatePTidData.selected.findIndex((val: { prop: any; }) => val.prop === taskItem.prop);
    if (idx !== -1) {
      this.locatePTidData.selected.splice(idx, 1);
    }
    this.selectTaskModal.deleteTag(taskItem);
    this.currentPage = 1;
    this.getData({});
  }

  // 切换分页
  public onPageUpdate(event: TiPaginationEvent): void {
    this.getData({});
  }

  /** 点击筛选弹框的确定按钮 */
  public confimModal(checkedList: any) {
    this.locatePTidData.selected = checkedList.map((val: { task: string; tid: any; }) => {
      const label = val.task.split('/')[0];
      return { label, prop: val.tid };
    });
    this.currentPage = 1;
    this.getData({});
  }



  // -- 时间轴 --
  /**
   * 修改时间轴的总起始时间
   * @param start 时间轴的总开始数值
   * @param end 时间轴的总结束数值
   */
  public setTimeData(start: number, end: number) {
    if (start !== undefined && end !== undefined) {
      this.timeData = { start, end };
      this.timeLineShow = true;
    } else {
      this.timeLineShow = false;
    }
  }

  /**
   * 修改时间轴选中区域大小
   * @param start 选中区域的开始百分比
   * @param end 选中区域的结束百分比
   */
  public setTimeLine(start: number, end: number) {
    if (this.timeLineDetail) {
      this.timeLineDetail.dataConfig({ start, end });
    }
  }

  /**
   * 时间轴变化数据改变，同步设置chart的datazoom数值
   * @param e e
   */
  public timeLineDataChange(e: any) {
    this.chartInstance.dispatchAction({
      type: 'dataZoom',
      start: e.start,
      end: e.end,
    });
  }
}

