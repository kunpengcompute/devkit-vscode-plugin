import { Component, Input, OnInit } from '@angular/core';
import { I18n } from 'sys/locale';
import { HyTheme, HyThemeService } from 'hyper';
import { TiModalService } from '@cloud/tiny3';
import { TableContainerData } from '../../domain';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-interruption-distribution',
  templateUrl: './interruption-distribution.component.html',
  styleUrls: ['./interruption-distribution.component.scss']
})
export class InterruptionDistributionComponent implements OnInit {
  @Input()
  set interruptData(value: any) {
    if (value) {
      this.initData(value);
    }
  }
  constructor(
    private tiModal: TiModalService,
    private themeServe: HyThemeService,
  ) { }
  // 软硬中断下拉选择框
  public hardOption: any[] = [];
  public hardSelected: any[] = [];
  public softOption: any[] = [];
  public softSelectd: any[] = [];
  public cpuOption: string[] = [];
  public idleData: number[] = [];
  public distributionlabel: string;
  public checkTotal: boolean;
  public cpuUsagelabel: string;
  public checkCpuUsage: boolean;
  public echartData: { [key: string]: number[] };
  public echartsOption: any;
  public echartsInstance: any;
  public xAxisData: string[] = [];
  public baseColor = '#e1e6ee';
  public ylabelColor = '#616161';
  public hardParamsData: any;
  // false表示展示单个中断事件图
  public showAllData = true;
  // 筛选弹框组件参数
  public hardtableData: TableContainerData;
  public selectIdList: number[] = [];
  // 所有硬中断频次
  private allIrqList: number[] = [];
  // 点击单个中断事件的分布图
  public selectedSeries: any;
  // echart 硬中端 10 色
  public hardTerminalColor: Array<string> = [
    '#07a9ee', '#037dff', '#2f54eb', '#5cdbd3', '#27f0e8', '#01afb8', '#d3f261', '#8cd600', '#41ba41', '#389e0d'
  ];
  // echart 硬中端 10 色 dark
  public hardTerminalColorDark: Array<string> = [
    '#0067ff', '#2c8e8b', '#2da46f', '#3f5fc4', '#298fbb', '#4e8a30', '#8739db'
  ];
  // echart 软中断 4 色
  public softTerminalColor: Array<string> = ['#e88b00', '#f9b244', '#f05f26', '#e72e90'];
  // echart 软中断 4 色 dark
  public softTerminalColorDark: Array<string> = ['#c0691c', '#a44017', '#a47d09', '#a73074', '#ada71e'];
  // cpu 使用率
  public cpuTerminalColor: Array<string> = ['#9254de', '#b37feb', '#d3adf7', '#efdbff'];
  // cpu 使用率 dark
  public cpuTerminalColorDark: Array<string> = ['#a76ee6', '#b788eb', '#c7a3f0', '#d8bff5'];
  public currTheme: HyTheme;
  public themeSub: Subscription;
  public lineData = {
    start: 0,
    end: 8
  };
  public scrollDataIndex = 0;
  ngOnInit(): void {
    this.themeSub = this.themeServe.getObservable().subscribe(theme => {
      this.currTheme = theme;
      switch (theme) {
        case HyTheme.Dark:
          this.baseColor = '#484a4e';
          this.ylabelColor = '#aaaaaa';
          break;
        case HyTheme.Light:
          this.baseColor = '#E1E6EE';
          this.ylabelColor = '#616161';
          break;
        case HyTheme.Grey:
          this.baseColor = '#484a4e';
          this.ylabelColor = '#aaaaaa';
          break;
        default:
          break;
      }
      setTimeout(() => {
        this.setOption();
      });
    });
    this.distributionlabel = I18n.pcieDetailsinfo.show_all_hardware;
    this.cpuUsagelabel = I18n.tuninghelper.detailedData.show_cpu_usage;
  }
  // 下拉选择框改变事件
  public selectedChange(e: any) {
    this.setOption();
  }
  public checkBoxChange(e: any) {
    this.setOption();
  }

  public initData(value: any) {
    if (!value.echartOpt) { return; }
    this.echartData = JSON.parse(JSON.stringify(value.echartOpt));
    this.hardParamsData = JSON.parse(JSON.stringify(value.hard_event_list));
    const hardList: string[] = [];
    this.hardOption = Object.keys(this.hardParamsData).map((key: string, index: number) => {
      hardList.push(key);
      return { label: key, id: index, frequency: +this.hardParamsData[key] };
    });
    this.softOption = value.soft_event_list.map((item: string, index: number) => {
      return { label: item, id: index };
    });
    this.hardSelected = this.getTopTen(this.hardOption);
    this.selectIdList = this.hardSelected.map((item: any) => {
      return item.id;
    });
    this.softSelectd = this.softOption;
    this.cpuOption = ['%user', '%sys', '%irq', '%soft'];
    this.idleData = this.echartData['%idle'];
    this.xAxisData = this.initXAxisData(value);
    let allHardIrq = new Array(Object.keys(this.xAxisData).length).fill(0);
    this.hardOption.forEach((item: any) => {
      allHardIrq = this.getTotalCount(allHardIrq, this.echartData[item.label], 'add');
    });
    this.allIrqList = allHardIrq;
    this.setOption();
  }

  public setOption() {
    if (!this.hardOption.length) { return; }
    const seriesData = this.getSeriesData();
    const fontColor = this.currTheme === HyTheme.Dark ? '#e8e8e8' : '#222222';
    const borderColor = this.currTheme === HyTheme.Dark ? '#353535' : '#e1e6ee';
    const option: any = {
      tooltip: {
        trigger: 'axis',
        enterable: true,
        confine: true,
        axisPointer: {
          type: 'shadow'
        },
        padding: [10, 20, 10, 20],
        borderWidth: 1,
        borderColor: 'rgba(50,50,50,0)',
        backgroundColor: this.currTheme === HyTheme.Dark ? '#424242' : '#fff',
        borderRadius: 4,
        boxShadow: 'rgba(0, 0, 0, 0.2)',
        extraCssText: `color: ${this.currTheme === HyTheme.Dark ? '#e8e8e8' : '#222'};
          box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);z-index: 1003; `,
        formatter: (params: any) => {
          const [hardHtml, softHtml, cpuHtml, cpuTotal] = this.handleTooltip(params);
          let tip = I18n.pcieDetailsinfo.tip_1;
          if (this.checkCpuUsage && this.showAllData) {
            tip += I18n.pcieDetailsinfo.tip;
          }
          if (this.checkTotal && this.showAllData) {
            tip += I18n.pcieDetailsinfo.otherTip;
          }
          let html = `<div style="max-width:885px;overflow:auto">
            <p style="margin-bootom: 8px;padding-bottom: 10px;font-size: 16px;">${params[0].name}</p>
            <div style="color: #979797;font-size:12px;white-space:normal">${tip}</div>
            <div style="display:flex;align-items: flex-start;margin-top:16px;color:${fontColor};font-size:12px;">`;

          if (hardHtml) {
            html += `<div style="margin-right:32px">
              <div style="border-bottom: 1px solid ${borderColor};padding-bottom:8px;margin-bottom:8px;">
                ${I18n.pcieDetailsinfo.hard_inter}
              </div>
              <div style="display:table;max-height:338px;overflow:auto">${hardHtml}</div>
            </div>`;
          }
          if (softHtml) {
            html += `<div style="margin-right:32px">
              <div style="border-bottom: 1px solid ${borderColor};padding-bottom:8px;margin-bottom:8px;">
                ${I18n.pcieDetailsinfo.soft_inter}
              </div>
              <div style="display:table;max-height:338px;overflow:auto">${softHtml}</div>
            </div>`;
          }
          if (this.checkCpuUsage) {
            html += `<div>
              <div style="border-bottom: 1px solid ${borderColor};padding-bottom:8px;margin-bottom:8px;">
                CPU${I18n.pcieDetailsinfo.percent}
              </div>
              <div style="display:table;max-height:338px;overflow:auto">
                <div style="display: table-row;">
                  <div style="display: table-cell;max-width:256px;word-break:break-all;margin-right:16px;
                  margin-bottom:4px;">${params[0].name}${I18n.pcieDetailsinfo.percent}&nbsp;&nbsp;&nbsp;</div>
                  <div style="display: table-cell">${cpuTotal}%</div>
                </div>
                ${cpuHtml}
              </div>
            </div>`;
          }
          html += `</div>`;
          return html;
        }
      },
      legend: {
        type: 'scroll',
        scrollDataIndex: 0,
        right: 12,
        width: '80%',
        itemWidth: 8,
        itemHeight: 8,
        textStyle: {
          color: this.ylabelColor
        },
        pageIconColor: '#979797',
        pageIconInactiveColor: '#cccccc',
        pageTextStyle: {
          color: fontColor
        }
      },
      grid: {
        top: '20%',
        left: '2%',
        right: '3%',
        bottom: '15%',
        containLabel: true
      },
      xAxis: [
        {
          type: 'category',
          boundaryGap: true,
          axisLine: {
            lineStyle: {
              color: this.baseColor,
              width: 2
            }
          },
          axisTick: {
            length: 8,
            show: true,
            alignWithLabel: true,
            lineStyle: {
              width: 2,
              color: this.baseColor
            }
          },
          axisLabel: {
            lineHeight: 18,
            margin: 11,
            color: this.ylabelColor,
          },
          axisPointer: {
            type: 'shadow',
            shadowStyle: {
              color: this.currTheme === HyTheme.Dark ? 'rgba(52, 52, 52, 0.36)' : 'rgba(215, 224, 239, 0.36)',
            }
          },
          data: this.xAxisData
        }
      ],
      yAxis: [
        {
          type: 'value',
          name: I18n.net_io.xps_rps.inter_dis.soft_hadr_time,
          position: 'left',
          min: 0,
          axisLine: { show: false },
          axisTick: { show: false },
          splitLine: {
            show: true,
            lineStyle: { type: 'dashed', color: this.currTheme === HyTheme.Dark ? '#484a4e' : '#d4d9e6' }
          },
          axisLabel: { color: this.currTheme === HyTheme.Dark ? '#9ea4b3' : '#252c3c' },
          nameTextStyle: {
            align: 'left',
            color: this.currTheme === HyTheme.Dark ? '#e8e8e8' : '#222222',
            padding: [10, 0, 10, -58]
          },
          splitNumber: 2
        },

      ],
      dataZoom: [
        {
          type: 'slider',
          start: 0,
          end: this.xAxisData.length < 20 ? 100 : 8,
          height: 24,
          right: 52,
          left: 50,
          bottom: 0,
          backgroundColor: this.currTheme === HyTheme.Dark ? '#161616' : '#ffffff',
          borderColor: this.baseColor,
          handleStyle: { color: '#037dff' },
          textStyle: { color: this.currTheme === HyTheme.Dark ? '#e8e8e8' : '#252c3c' },
          // 是否开启刷选功能
          brushSelect: false
        },
        {
          type: 'inside'
        }
      ],
      series: seriesData
    };
    if (this.checkCpuUsage) {
      option.yAxis.push(
        {
          type: 'value',
          name: I18n.tuninghelper.detailedData.cpuUsage,
          position: 'right',
          min: 0,
          max: 100,
          axisLine: { show: false },
          axisTick: { show: false },
          splitLine: {
            show: true,
            lineStyle: { type: 'dashed', color: this.currTheme === HyTheme.Dark ? '#484a4e' : '#d4d9e6' }
          },
          axisLabel: { color: this.currTheme === HyTheme.Dark ? '#9ea4b3' : '#252c3c' },
          nameTextStyle: {
            align: 'center',
            color: this.currTheme === HyTheme.Dark ? '#e8e8e8' : '#222222',
            padding: [10, 22, 10, 0]
          },
          splitNumber: 2
        }
      );
    }
    this.echartsOption = option;
    this.updateEchartOption();
  }
  /**
   * 获取tip
   * @param params 柱状图hover参数
   * @returns tip的html
   */
  private handleTooltip(params: any[]) {
    let hardHtml = '';
    let softHtml = '';
    let cpuHtml = '';
    let cpuTotal = 0; // 当前cpu总利用率
    params.forEach((v: any) => {
      const itemHtml = `<div style="display: table-row;margin-bottom:4px;">
        <div style="display: table-cell;word-break:break-all;margin-right:16px;">
          <span style="display: inline-block;width: 8px;height: 8px;margin-right: 8px; border-radius: 2px;
          background: ${v.color};vertical-align:top;margin-top:7px"></span>
          <div style="margin-right: 16px;max-width: 240px;display:inline-block;">${v.seriesName}</div>
        </div>
        <div style="display: table-cell;vertical-align:top">
          ${Number(v.data).toFixed(2)}${v.seriesId.indexOf('cpu') >= 0 ? '%' : I18n.pcieDetailsinfo.units}
        </div>
      </div>`;
      if (v.seriesId.indexOf('hard') >= 0 && v.data > 0) {
        // 所有硬中断频率和其他硬中断频率置顶显示
        hardHtml = v.seriesId === 'hard_unselect' ? (itemHtml + hardHtml) : (hardHtml + itemHtml);
      } else if (v.seriesId.indexOf('soft') >= 0 && v.data > 0) {
        softHtml += itemHtml;
      } else if (v.seriesId.indexOf('cpu') >= 0) {
        cpuHtml += itemHtml;
        cpuTotal = Number((100 - this.idleData[v.dataIndex]).toFixed(2));
      }
    });
    if (this.showAllData && this.checkTotal) {
      const total = this.allIrqList[params[0].name?.split('cpu')[1]];
      hardHtml = `<div style="display: table-row;margin-bottom:4px;">
      <div style="display: table-cell;word-break:break-all;margin-right:16px;">
        <span style="display: inline-block;width: 8px;height: 8px;margin-right: 8px; border-radius: 2px;
        background: transparent;vertical-align:top;margin-top:7px"></span>
        <div style="margin-right: 16px;max-width: 240px;display:inline-block;">
        ${I18n.pcieDetailsinfo.all_hardware}
        </div>
      </div>
      <div style="display: table-cell;vertical-align:top">
        ${Number(total).toFixed(2)}${I18n.pcieDetailsinfo.units}
      </div>
    </div>` + hardHtml;
    }
    return [hardHtml, softHtml, cpuHtml, cpuTotal.toFixed(2)];
  }
  /**
   * 初始化echart实例方法
   * @param ec echart实例
   */
  public onChartInit(ec: any) {
    this.echartsInstance = ec;
    this.echartsInstance.on('click', (param: any) => {
      // 硬中断点击单个事件
      if (this.showAllData && param.seriesId.indexOf('hard') >= 0 && param.seriesId !== 'hard_unselect') {
        this.showAllData = false;
        this.selectedSeries = param;
        this.setOption();
      }
    });
    this.echartsInstance.on('legendscroll', (params: any) => {
      this.scrollDataIndex = params.scrollDataIndex;
    });
    this.echartsInstance.on('datazoom', (params: any) => {
      if (Reflect.has(params, 'start')) {
        this.lineData.start = params.start;
        this.lineData.end = params.end;
      } else if (params.batch?.length > 0) {
        this.lineData.start = params.batch[0].start;
        this.lineData.end = params.batch[0].end;
      }
    });
  }
  /**
   * 初始化X轴数据
   * @returns X轴数据
   */
  private initXAxisData(value: any) {
    const xAxixData: any[] = [];
    Object.keys(value).forEach((key: any) => {
      if ((/^[0-9]*$/).test(key)) {
        xAxixData.push(`cpu${key}`);
      }
    });
    return xAxixData;
  }

  public getSeriesData() {
    const seriesArr: any = [];
    // 显示所有
    if (this.showAllData) {
      // 处理选择的硬中断
      this.hardSelected.forEach((hart, index: number) => {
        seriesArr.push({
          name: hart.label,
          type: 'bar',
          stack: 'hart',
          barMaxWidth: 17,
          yAxisIndex: '0',
          color: this.hardTerminalColor[index % 10],
          id: 'hard' + index,
          data: this.echartData[hart.label]
        });
      });
      // 显示核总中断分布
      if (this.checkTotal) {
        seriesArr.push({
          name: I18n.pcieDetailsinfo.other_hardware,
          type: 'bar',
          stack: 'hart',
          barMaxWidth: 17,
          yAxisIndex: '0',
          id: 'hard_unselect',
          color: this.currTheme === HyTheme.Dark ? '#9ea4b3' : '#e1e6ee',
          data: this.getUnselectTotal(),
        });
      }
    } else {
      // 点击单个中断事件
      const irqName = this.selectedSeries.seriesName;
      const target = this.echartData[irqName];
      seriesArr.push(
        {
          name: irqName,
          color: this.selectedSeries.color,
          data: target,
          id: 'hard',
          type: 'bar',
          barWidth: 17,
          stack: 'hard',
        },
        {
          name: I18n.pcieDetailsinfo.selected_hardware,
          color: this.currTheme === HyTheme.Dark ? '#9ea4b3' : '#e1e6ee',
          data: this.getTotalCount(this.allIrqList, target, 'minus'),
          id: 'hard_down_unselect',
          type: 'bar',
          barWidth: 17,
          stack: 'hard',
        }
      );
    }


    // 处理选择的软中断
    this.softSelectd.forEach((soft, index: number) => {
      seriesArr.push({
        name: soft.label,
        type: 'bar',
        stack: 'soft',
        barMaxWidth: 17,
        yAxisIndex: '0',
        color: this.softTerminalColor[index % 4],
        id: 'soft' + index,
        data: this.echartData[soft.label]
      });
    });

    // 处理cpu利用率
    if (this.checkCpuUsage) {
      this.cpuOption.forEach((cpu, index: number) => {
        seriesArr.push({
          name: cpu,
          type: 'bar',
          stack: 'cpu_core',
          barMaxWidth: 5,
          yAxisIndex: '1',
          color: this.cpuTerminalColor[index % 4],
          id: 'cpu' + index,
          data: this.echartData[cpu]
        });
      });
    }
    return seriesArr;
  }


  /**
   * 获取筛选硬中断表格的选中项
   * @param e 选中列表
   */
  public changeHartSelect(e: any) {
    this.selectIdList = e;
  }

  private getTopTen(data: any[]) {
    const list = JSON.parse(JSON.stringify(data)).reverse().sort((a: any, b: any) => {
      return b.frequency - a.frequency;
    });
    const top10 = list.slice(0, 10);
    return data.filter((item) => {
      return JSON.stringify(top10).includes(JSON.stringify(item));
    });
  }

  /**
   * 打开筛选硬中断弹框
   * @param modal 筛选弹框
   */
  public openFilterModal(modal: any) {
    const selectedId: number[] = [];
    this.hardSelected.forEach((item: any) => {
      selectedId.push(item.id);
    });
    this.hardtableData = {
      height: '327px',
      columns: [
        {
          title: I18n.tuninghelper.taskDetail.hardInterrupts,
          prop: 'label',
          width: '50%',
          searchKey: 'label'
        },
        {
          title: I18n.tuninghelper.detailedData.irq_frequency,
          prop: 'frequency',
          width: '50%',
          sortKey: 'frequency',
          asc: false
        },
      ],
      srcData: this.hardOption,
      selectedData: selectedId
    };
    this.tiModal.open(modal, {
      modalClass: 'filterIrqClass',
      context: {
        confirm: (context: any) => {
          // 表格筛选后的选中项
          this.hardSelected = [];
          this.hardOption.forEach((item: any) => {
            if (this.selectIdList.includes(item.id)) {
              this.hardSelected.push(item);
            }
          });
          this.setOption();
          context.close();
        },
      }
    });
  }

  /**
   * 返回总分布图
   */
  public backToAllData() {
    this.showAllData = true;
    this.setOption();
  }
  /**
   * 获取未选中的硬中断事件频率在单个cpu上的和
   */
  public getUnselectTotal() {
    let UnselectedTotal = new Array(Object.keys(this.xAxisData).length).fill(0);
    if (!this.selectIdList.length) { return UnselectedTotal; }
    const unselected = this.hardOption.filter((item: any) => {
      return !this.selectIdList.includes(item.id);
    });
    unselected.forEach((item: any) => {
      UnselectedTotal = this.getTotalCount(UnselectedTotal, this.echartData[item.label], 'add');
    });
    return UnselectedTotal;
  }
  /**
   * 两个数组对应index求和做差
   * @param total 基础数组
   * @param list 计算数组
   * @param type 操作类型
   * @returns 结果数组
   */
  private getTotalCount(total: any[], list: any[], type: 'add' | 'minus') {
    return total.map((item: any, index: number) => {
      return type === 'add' ? (item + list[index]) : (item - list[index]);
    });
  }
  /**
   * datazoom记忆
   */
  private updateEchartOption() {
    this.echartsOption.series = this.getSeriesData();
    this.echartsOption.dataZoom[0].start = this.lineData.start;
    this.echartsOption.dataZoom[0].end = this.lineData.end;
    if (this.echartsInstance) {
      this.echartsInstance.clear();
      this.echartsInstance.setOption(this.echartsOption);
    }
  }
}
