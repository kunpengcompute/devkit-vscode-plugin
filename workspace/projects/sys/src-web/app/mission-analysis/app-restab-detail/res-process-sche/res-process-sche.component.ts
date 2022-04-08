import { Component, OnInit, Input, ViewChild, NgZone, ElementRef, SecurityContext } from '@angular/core';
import { AxiosService } from 'projects/sys/src-web/app/service/axios.service';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import { MytipService } from 'projects/sys/src-web/app/service/mytip.service';
import { LeftShowService } from 'projects/sys/src-web/app/service/left-show.service';
import { InterfaceService } from '../service/interface.service';
import { fromEvent } from 'rxjs';
import { TiPageSizeConfig, TiPaginationEvent } from '@cloud/tiny3';
import { DomSanitizer } from '@angular/platform-browser';
import * as Util from 'projects/sys/src-web/app/util';
import { SummaryDataService } from '../service/summary-data.service';
import { PublicMethodService } from '../service/public-method.service';
import { graphic } from 'echarts';

@Component({
  selector: 'app-res-process-sche',
  templateUrl: './res-process-sche.component.html',
  styleUrls: ['./res-process-sche.component.scss']
})
export class ResProcessScheComponent implements OnInit {
  @Input() taskid: any;
  @Input() nodeid: any;
  @Input() item: any;
  @ViewChild('chartBox') chartBox: any;
  @ViewChild('timeLineDetail') timeLineDetail: any;
  @ViewChild('container') private containerRef: ElementRef;
  @ViewChild('selectTaskModal') selectTaskModal: any;
  @ViewChild('tagBox') private tagBox: any;

  public i18n: any;
  public thousandSeparatorPipe: any;
  public startTime: any;
  public endtTime: any;
  public noData = '';
  public colorList = {
    Wait: {
      normal: '#e88b00',
      emphasis: '#ffa940',
    },
    Schedule: {
      normal: '#ffd666',
      emphasis: '#eab627',
    },
    Running: {
      normal: '#41ba41',
      emphasis: '#8cd600',
    },
  };
  public obtainingChartData = true;
  public originList: any; // 选中原始数据

  // chart related
  public chartInstance: any;
  public options: any;
  public updateOptions: any;
  public timeLineShow = false;
  public orderlist: any = [];

  // 类型选择
  public currentType: any;
  public typeList: { prop: any; }[] | { prop: string; tip: any; }[] = [];

  // 选择进程/线程
  public locatePTid: any = {
    title: '',
    selected: [],
    list: [],
  };

  // 运行时长排序
  public sortDurationSummary: any = {
    title: '',
    selected: undefined,
    list: [],
    sortStatus: 'desc',
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
  public topList10: any = [];

  constructor(
    public Axios: AxiosService,
    public i18nService: I18nService,
    public mytip: MytipService,
    public ngZone: NgZone,
    public leftShowService: LeftShowService,
    private interfaceService: InterfaceService,
    private domSanitizer: DomSanitizer,
    public publicMethodService: PublicMethodService,
  ) {
    this.i18n = this.i18nService.I18n();

    this.typeList = [
      { prop: 'status', tip: this.i18n.sys_res.PTStatusSequenceChart },
      { prop: 'durationSummary', tip: this.i18n.sys_res.PTStatusDurationSummary },
    ];
    this.currentType = this.typeList[0].prop;

    this.locatePTid.title = this.i18n.sys_res.selectThread;

    this.sortDurationSummary.title = this.i18n.sys_res.sorting;
    this.sortDurationSummary.list = [
      { label: 'Wait', prop: 'Wait' },
      { label: 'Schedule', prop: 'Schedule' },
      { label: 'Running', prop: 'Running' },
    ];
    this.sortDurationSummary.selected = this.sortDurationSummary.list[2];
  }

  ngOnInit() {
    this.topList10 = this.interfaceService.topList10;
    this.noData = this.i18n.loading;

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

    // 页面监听
    fromEvent(window, 'resize').subscribe((event) => this.chartInstance.resize());
    this.leftShowService.leftIfShow.subscribe(() => setTimeout(() => this.chartInstance.resize(), 500));
  }

  public init() {
    this.initTime();
  }

  // 转换-1、:-1使用[unknown]来显示
  private transformLabel(label: string) {
    if ([-1, '-1', ':-1'].includes(label)) { return '[unknown]'; }
    if (['-1/:-1', '-1/-1', ':-1/:-1', ':-1/-1'].includes(label)) { return '[unknown]/[unknown]'; }
    return label;
  }


  // -- get data --
  // 获取时间范围
  private initTime() {
    this.obtainingChartData = true;
    this.interfaceService.getTotalTimeRange(this.taskid, this.nodeid, 'process').then((res: any) => {
      this.startTime = res.data.start_time;
      this.endtTime = res.data.end_time;
      this.initFilterList();
    }).catch((e: any) => {
      this.obtainingChartData = false;
    });
  }

  /**
   * 初始化筛选框的数据
   */
  private initFilterList() {
    this.obtainingChartData = true;
    this.interfaceService.getFilterList(this.taskid, this.nodeid, ['pid_ppid_rels', 'app_ppids']).then((data: any) => {
      this.originList = data.pid_ppid_rels;
      const pid_ppid_rels = data.pid_ppid_rels;
      const selected: any = [];
      this.locatePTid.list = Object.keys(pid_ppid_rels).map(pid => {
        return {
          label: this.transformLabel(pid),
          prop: +pid.split('/')[0],
          children: pid_ppid_rels[pid].map((ppid: string) => {
            const item = {
              label: this.transformLabel(ppid),
              prop: +ppid.split('/')[0],
            };
            if (this.topList10.indexOf(item.prop) > -1) {
              selected.push(item);
            }
            return item;
          })
        };
      });
      this.locatePTid.selected = selected;
      this.getData({ ifInit: true });
    }).catch(() => {
      this.obtainingChartData = false;
    });
  }

  // 获取图表数据
  private getData({ startTime = this.startTime, endTime = this.endtTime, ifInit = false }: {
    startTime?: number, // 数据窗口范围的起始数值
    endTime?: number, // 数据窗口范围的结束数值
    ifInit?: boolean,
  }) {
    if (this.currentType === 'status') {
      this.obtainingChartData = true;
      this.interfaceService.getPidStatusData({
        taskId: this.taskid,
        nodeId: this.nodeid,
        pageNo: this.currentPage,
        pageSize: this.pageSize.size,
        pidList: this.locatePTid.selected
        ? this.locatePTid.selected.map((item: any) => item.prop).join(',') : undefined,
        startTime,
        endTime,
        ifInit
      }).then((res: any) => {
        this.updateChartData('status', res.data.menulist, res.data.process);
        this.totalNumber = res.data.total_count;
      }).catch(e => {
        this.totalNumber = 0;
        this.noData = this.i18n.common_term_task_nodata2;
      }).finally(() => {
        this.obtainingChartData = false;
      });
    } else if (this.currentType === 'durationSummary') {
      this.obtainingChartData = true;
      this.interfaceService.getPidDurationSummaryData({
        taskId: this.taskid,
        nodeId: this.nodeid,
        pageNo: this.currentPage,
        pageSize: this.pageSize.size,
        sortBy: this.sortDurationSummary.selected.prop,
        sortStatus: this.sortDurationSummary.sortStatus,
        pidList: this.locatePTid.selected
        ? this.locatePTid.selected.map((item: any) => item.prop).join(',') : undefined,
        startTime,
        endTime,
        ifInit
      }).then((res: any) => {
        this.updateChartData('durationSummary', res.data.menulist, res.data.process);
        this.totalNumber = res.data.total_count;
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
      this.chartInstance.getZr().setCursorStyle('default');
    });

    this.init();
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
   * @param orderlist 排序过的CPU列表
   * @param cpuInfo 数据
   */
  public updateChartData(currentType: string, menulist: any[], processInfo: any) {
    /**
     * 1、所有的数据段都是ms单位，说有的数据点都是us单位（数据比较准确）
     * 2、全部转换成微秒去画图，显示使用毫秒
     */
    this.orderlist = menulist.map((key: string | number) => {
      const info = processInfo[key];
      return {
        taskname: this.transformLabel(info.taskname),
        pid: this.transformLabel(info.pid),
        ppid: this.transformLabel(info.ppid),
      };
    });
    const height = menulist.length ? (30 * menulist.length + 20) : 400;
    this.chartBox.nativeElement.style.height = `${height + 40}px`;
    setTimeout(() => this.chartInstance.resize(), 10);
    let min = Infinity;
    let max = -Infinity;

    if (currentType === 'status') { // 状态
      const runningDatas: any = [];
      const waitDatas: any = [];
      const scheduleDatas: any = [];

      menulist.forEach((item: string | number, index: any) => {
        processInfo[item].detail.forEach((detail: { start_time: any; wait_time: number; sch_delay: number;
          runtime: number; taskname: any; cpu: any; pid: any; ppid: any; callstack: any; }) => {
          const startTime = detail.start_time;
          const switchToScheduleTime = startTime + detail.wait_time * 1000;
          const switchToRunningTime = switchToScheduleTime + detail.sch_delay * 1000;
          const endTIme = switchToRunningTime + detail.runtime * 1000;
          min = Math.min(min, startTime);
          max = Math.max(max, endTIme);
          const tipInfo = [
            this.transformLabel(detail.taskname),
            detail.cpu,
            this.transformLabel(detail.pid),
            this.transformLabel(detail.ppid),
            Util.fixThouSeparator((+detail.wait_time).toFixed(3)),
            Util.fixThouSeparator((+detail.sch_delay).toFixed(3)),
            Util.fixThouSeparator((+detail.runtime).toFixed(3)),
            detail.callstack,
          ];

          waitDatas.push({
            value: [startTime, switchToScheduleTime, index, ...tipInfo],
          });

          scheduleDatas.push({
            value: [switchToScheduleTime, switchToRunningTime, index, ...tipInfo],
          });

          runningDatas.push({
            value: [switchToRunningTime, endTIme, index, ...tipInfo],
          });
        });
      });

      this.updateOptions = {
        title: {
          show: !(runningDatas.length || waitDatas.length || scheduleDatas.length),
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
          data: ['Wait', 'Schedule', 'Running'],
        },
        tooltip: {
          formatter: (params: { value: string[]; }) => {
            return `
            <div style="width: max-content">
              <table class="tipTable">
                <tr><td>${this.i18n.sys_res.threadName}</td>
                <td>${this.domSanitizer.sanitize(SecurityContext.HTML, params.value[3])}</td></tr>
                <tr><td>${this.i18n.sys_res.core}</td>
                <td>${this.domSanitizer.sanitize(SecurityContext.HTML, params.value[4])}</td></tr>
                <tr><td>TID/PID</td>
                <td>${this.domSanitizer.sanitize(SecurityContext.HTML, params.value[5]) ||
                   '--'} / ${this.domSanitizer.sanitize(SecurityContext.HTML, params.value[6]) || '--'}</td></tr>
                <tr><td>${this.i18n.sys_res.waitingDuration}</td>
                <td>${this.domSanitizer.sanitize(SecurityContext.HTML, params.value[7])} ms</td></tr>
                <tr><td>${this.i18n.sys_res.scheduleDelay}</td>
                <td>${this.domSanitizer.sanitize(SecurityContext.HTML, params.value[8])} ms</td></tr>
                <tr><td>${this.i18n.sys_res.runningTime}</td>
                <td>${this.domSanitizer.sanitize(SecurityContext.HTML, params.value[9])} ms</td></tr>
                ${this.domSanitizer.sanitize(SecurityContext.HTML, params.value[10]) ?
                   ('<tr><td>' + this.i18n.common_term_task_tab_summary_callstack + '</td><td>' +
                    this.domSanitizer.sanitize(SecurityContext.HTML, params.value[10]) + '</td></tr>') : ''}
              </table>
            <div>
            `;
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
          data: menulist,
        },
        dataZoom: [{
          type: 'inside',
          filterMode: 'weakFilter',
          disabled: false,
        }],
        series: [
          {
            name: 'Wait',
            type: 'custom',
            encode: {
              x: [0, 1],
              y: 2,
            },
            itemStyle: {
              color: this.colorList.Wait.normal,
            },
            emphasis: {
              itemStyle: {
                color: this.colorList.Wait.emphasis,
              }
            },
            data: waitDatas,
            renderItem: this.renderItem,
            progressive: 0,
          }, {
            name: 'Schedule',
            type: 'custom',
            encode: {
              x: [0, 1],
              y: 2,
            },
            itemStyle: {
              color: this.colorList.Schedule.normal,
            },
            emphasis: {
              itemStyle: {
                color: this.colorList.Schedule.emphasis,
              }
            },
            data: scheduleDatas,
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
          }
        ]
      };
    } else if (currentType === 'durationSummary') {  // 时长
      const waitDatas: any = [];
      const scheduleDatas: any = [];
      const runningDatas: any = [];

      menulist.forEach((item: string | number, index: any) => {
        const info = processInfo[item];

        const waitPercentage = info['wait_time%'] * 100;
        const schedulePercentage = info['sch_delay%'] * 100;
        const runningPercentage = info['runtime%'] * 100;
        const tipInfo = [
          Util.fixThouSeparator((+info.wait_time).toFixed(3)),
          waitPercentage,
          Util.fixThouSeparator((+info.sch_delay).toFixed(3)),
          schedulePercentage,
          Util.fixThouSeparator((+info.runtime).toFixed(3)),
          runningPercentage
        ];

        waitDatas.push({
          value: [0, waitPercentage, index, ...tipInfo],
        });

        scheduleDatas.push({
          value: [waitPercentage, waitPercentage + schedulePercentage, index, ...tipInfo],
        });

        runningDatas.push({
          value: [waitPercentage + schedulePercentage, 100, index, ...tipInfo],
        });
      });

      this.updateOptions = {
        title: {
          show: !(runningDatas.length || waitDatas.length || scheduleDatas.length),
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
          data: ['Wait', 'Schedule', 'Running'],
        },
        tooltip: {
          formatter: (params: { value: number[]; }) => {
            return `
              <table style="font-size: 12px; line-height: 28px; color: #222;">
                <tr>
                  <td>
                    <div style="display: flex; align-items: center;">
                      <div style="width: 8px; height: 8px; background: #e88b00;"></div>
                      <div style="margin-left: 8px;">Wait</div>
                    </div>
                  </td>
                  <td style="padding-left: 16px;">
                  ${this.domSanitizer.sanitize(SecurityContext.HTML, params.value[3])} ms
                   (${this.domSanitizer.sanitize(SecurityContext.HTML, params.value[4].toFixed(2))}%)</td>
                </tr>
                <tr>
                  <td>
                    <div style="display: flex; align-items: center;">
                      <div style="width: 8px; height: 8px; background: #ffd666;"></div>
                      <div style="margin-left: 8px;">Schedule</div>
                    </div>
                  </td>
                  <td style="padding-left: 16px;">${
                    this.domSanitizer.sanitize(SecurityContext.HTML, params.value[5])} ms
                   (${this.domSanitizer.sanitize(SecurityContext.HTML, params.value[6].toFixed(2))}%)</td>
                </tr>
                <tr>
                  <td>
                    <div style="display: flex; align-items: center;">
                      <div style="width: 8px; height: 8px; background: #41ba41;"></div>
                      <div style="margin-left: 8px;">Running</div>
                    </div>
                  </td>
                  <td style="padding-left: 16px;">${
                    this.domSanitizer.sanitize(SecurityContext.HTML, params.value[7])} ms
                   (${this.domSanitizer.sanitize(SecurityContext.HTML, params.value[8].toFixed(2))}%)</td>
                </tr>
              </table>
            `;
          },
        },
        xAxis: {
          min: 0,
          max: 100,
          axisLabel: {
            formatter: (val: any) => `${this.domSanitizer.sanitize(SecurityContext.HTML, (val).toFixed(2))} %`,
          },
        },
        yAxis: {
          data: menulist,
        },
        dataZoom: [{
          type: 'inside',
          filterMode: 'weakFilter',
          disabled: true,
        }],
        series: [
          {
            name: 'Wait',
            type: 'custom',
            encode: {
              x: [0, 1],
              y: 2,
            },
            itemStyle: {
              color: this.colorList.Wait.normal,
            },
            emphasis: {
              itemStyle: {
                color: this.colorList.Wait.emphasis,
              }
            },
            data: waitDatas,
            renderItem: this.renderItem,
          }, {
            name: 'Schedule',
            type: 'custom',
            encode: {
              x: [0, 1],
              y: 2,
            },
            itemStyle: {
              color: this.colorList.Schedule.normal,
            },
            emphasis: {
              itemStyle: {
                color: this.colorList.Schedule.emphasis,
              }
            },
            data: scheduleDatas,
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
          }
        ]
      };
    }

    this.setTimeData(min === Infinity ? 0 : min, max === -Infinity ? 0 : max);
    this.setTimeLine(0, 100);
  }

  /** 显示筛选弹框 */
  public showSelectTaskModal() {
    this.tagBox.isExpand = false;
    this.selectTaskModal.open();
  }
  // -- 数据切换 --
  // 切换图表类型
  public switchType(typeItem: any) {
    this.tagBox.isExpand = false;
    this.currentType = typeItem.prop;
    this.chartInstance.dispatchAction({
      type: 'dataZoom',
      start: 0,
      end: 100,
    });
    this.setTimeLine(0, 100);
    this.getData({});
  }

  // 筛选进程/线程
  public locatePtid() {
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

  // 切换分页
  public onPageUpdate(event: TiPaginationEvent): void {
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
    this.timeLineDetail.dataConfig({ start, end });
  }

  /**
   * 时间轴变化数据改变，同步设置chart的datazoom数值
   * @param e e
   */
  public timeLineDataChange(e: { start: any; end: any; }) {
    this.chartInstance.dispatchAction({
      type: 'dataZoom',
      start: e.start,
      end: e.end,
    });
  }

  /**
   * 点击tag，删除选中项, 同步侧滑框选中状态
   * @param taskItem taskItem
   */
  public deleteTask(taskItem: any) {
    const idx = this.locatePTid.selected.findIndex((val: { prop: any; }) => val.prop === taskItem.prop);
    if (idx !== -1) {
      this.locatePTid.selected.splice(idx, 1);
    }
    this.selectTaskModal.deleteTag(taskItem);
    this.currentPage = 1;
    this.getData({});
  }


  /**
   * 格式化侧滑框选中的原始数据, 侧滑框回来可能有未匹配的数据
   * @param list 选中项
   */
  public getSelected(list: any) {
    const selected: any = [];
    const arr = list.map((val: { tid: any; }) => val.tid);
    Object.keys(this.originList).forEach((pid: any) => {
      this.originList[pid].forEach((ppid: string) => {
        const item = {
          label: this.transformLabel(ppid),
          prop: +ppid.split('/')[0],
        };
        if (arr.indexOf(item.prop) > -1) {
          selected.push(item);
        }
        return item;
      });

    });
    return selected;
  }

  /** 点击筛选弹框的确定按钮 */
  public confimModal(checkedList: any) {
    this.locatePTid.selected = this.getSelected(checkedList);
    this.currentPage = 1;
    this.getData({});
  }
}
