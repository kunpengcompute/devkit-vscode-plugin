import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { TiModalService, TiTableRowData } from '@cloud/tiny3';
import { HyTheme, HyThemeService } from 'hyper';
import { Subscription } from 'rxjs';
import { I18n } from 'sys/locale';
import { CpuUsageInfo, SoftwareInterTableData, HardInterSingleTableData } from './domain';

@Component({
  selector: 'app-inter-dis-static',
  templateUrl: './inter-dis-static.component.html',
  styleUrls: ['./inter-dis-static.component.scss']
})
export class InterDisStaticComponent implements OnInit {

  @ViewChild('hardwareModal', { static: false }) hardwareModal: any;

  @Input()
  set softwareData(value: SoftwareInterTableData) {
    if (value === undefined) { return; }

    this.softwareInterData = value;
  }
  @Input()
  set hardwareData(value: HardInterSingleTableData) {
    if (value === undefined) { return; }

    this.irqDataByCpu = value;
  }
  @Input()
  set irqData(value: any) {
    if (value === undefined) { return; }

    this.allIrqData = value;
  }
  // CPU 利用率数据
  @Input()
  set cpuData(value: CpuUsageInfo) {
    if (value === undefined) { return; }

    this.cpuUsageInfo = value;
  }


  softwareInterData: SoftwareInterTableData;
  irqDataByCpu: HardInterSingleTableData;
  allIrqData: any;
  cpuUsageInfo: CpuUsageInfo;
  public currTheme: HyTheme | void; // 当前主题

  constructor(
    private hyThemeServe: HyThemeService,
    private tiModal: TiModalService) { }

  public echartsInstance: any;
  public echartsOption: any;

  // echart 硬中断 10 色
  public hardTerminalColor: Array<string> = [
    '#07a9ee', '#037dff', '#2f54eb', '#5cdbd3', '#27f0e8', '#01afb8', '#d3f261', '#8cd600', '#41ba41', '#389e0d'
  ];
  // echart 硬中断 10 色 dark
  public hardTerminalColorDark: Array<string> = [
    '#0067ff', '#2c8e8b', '#2da46f', '#3f5fc4', '#298fbb', '#4e8a30', '#8739db'
  ];
  // echart 软中断 4 色
  public softTerminalColor: Array<string> = ['#e88b00', '#f9b244', '#f05f26', '#e72e90'];
  // echart 软中断 4 色 dark
  public softTerminalColorDark: Array<string> = ['#c0691c', '#a44017', '#a47d09', '#a73074', '#ada71e'];
  // cpu 使用率
  public cpuUsageColor: Array<string> = ['#9254de', '#b37feb', '#d3adf7', '#efdbff'];
  // cpu 使用率 dark
  public cpuUsageColorDark: Array<string> = ['#a76ee6', '#b788eb', '#c7a3f0', '#d8bff5'];
  public cpuUsageName: Array<string> = [
    I18n.pcieDetailsinfo.user,
    I18n.pcieDetailsinfo.sys,
    I18n.pcieDetailsinfo.hard,
    I18n.pcieDetailsinfo.soft
  ];

  // 软硬中断下拉选择框
  public hardOption: any[];
  public hardSelected: any[];
  public hardPreSelected: any[];
  public softOption: any[];
  public softSelectd: any[];
  public usageInfo: any[][];

  private allIrqList: number[]; // 所有硬中断频次

  // echarts 相关配置
  public series: any = [];
  private xData: any = [];

  // 复选框相关配置
  public checkTitle = I18n.pcieDetailsinfo.show_all_hardware;
  public checked = false;
  public cpuCheckTitle = I18n.pcieDetailsinfo.cpu_usage;
  public cpuChecked = false;

  public showAllData = true; // 显示已选数据,false表示点击下钻
  public selectedSeries: any; // 下钻的series
  public columns: any[];
  public displayed: Array<TiTableRowData> = [];
  public srcData = {
    data: ([] as Array<TiTableRowData>),
    state: {
        searched: false,
        sorted: false,
        paginated: false,
    }
  };
  public pageSize: { options: Array<number>, size: number } = {
    options: [10, 20, 40, 80, 100],
    size: 10
  };
  public currentPage = 1;
  public totalNumber: number;
  public isSearch = false;
  public originData: any[];
  public value = '';
  public scrollDataIndex = 0;
  public lineData = {
    start: 0,
    end: 8
  };
  public themeSub: Subscription;

  ngOnInit(): void {
    this.themeSub = this.hyThemeServe.getObservable().subscribe(theme => {
      this.currTheme = theme;
      if (this.xData.length > 0) {
        setTimeout(() => {
          this.initEchardOption();
        }, 0);
      }
    });

    const result = this.initHardOption();
    this.srcData.data = result[0];
    this.originData = result[0];
    this.totalNumber = this.srcData.data.length;
    if (result[0].length > 0) {
      this.hardSelected = this.getTopTen(result[0]); // TOP 10
    }
    this.allIrqList = result[1];
    this.softOption = this.initSoftOption();
    this.softSelectd = [...this.softOption];
    if (this.cpuUsageInfo) {
      this.usageInfo = this.initCpuUsage();
    }
    this.xData = this.initXAxisData();
    this.lineData.end = this.xData.length < 20 ? 100 : 8; // 初始化echarts的数据窗口范围结束的百分比
    this.initEchardOption();
    this.columns = [
      {
        label: I18n.tuninghelper.taskDetail.hardInterrupts
      },
      {
        label: I18n.pcieDetailsinfo.interrupt_num,
        sortKey: 'total',
        asc: false
      }
    ];
  }

  // ngx-echarts 初始化时调用
  public onChartInit(ec: any) {
    this.echartsInstance = ec;
    this.echartsInstance.on('click', (param: any) => {
      // 硬中断点击下钻
      if (this.showAllData && param.seriesId.indexOf('hard') >= 0 && param.seriesId !== 'hard_unselect') {
        this.showAllData = false;
        this.selectedSeries = param;
        this.echartsOption.yAxis = this.generateYAxis();
        this.updateEchartOption();
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
    this.echartsInstance.on('legendselectchanged', (params: any) => {
      const code = params.name.split(':')[0];
      if (this.allIrqData[code] !== undefined) { // 点击硬中断图例，重新计算剩余硬中断频次
        this.echartsOption.legend.selected = params.selected;
        this.echartsOption.legend.scrollDataIndex = this.scrollDataIndex;
        this.updateEchartOption();
      }
    });
  }

  // 初始化硬中断选项框，计算所有硬中断频次
  private initHardOption() {
    const hardOption: any[] = [];
    let total = new Array(Object.keys(this.irqDataByCpu).length).fill(0);
    Object.keys(this.allIrqData).forEach((interrupt: any) => {
      const target = this.allIrqData[interrupt];
      const name = `${interrupt}:${target.irq_event_name}`;
      hardOption.push({
        name,
        total: target.irq_count,
        list: target.irq_count_list
      });
      if (target.irq_count !== '--' && target.irq_count > 0) {
        total = this.getTotalCount(total, target.irq_count_list, 'add');
      }
    });
    return [hardOption, total];
  }

  // 硬中断Top 10
  private getTopTen(data: any[]) {
    const list = JSON.parse(JSON.stringify(data)).reverse().sort((a: any, b: any) => {
      return b.total - a.total;
    });
    const top10 = list.slice(0, 10);
    return data.filter((item) => {
      return JSON.stringify(top10).includes(JSON.stringify(item));
    });
  }

  /**
   * 两个数组逐项相加/相减
   * @param total 基础数组
   * @param list 计算数组
   * @param type 'add' | 'minus'
   */
  private getTotalCount(total: any[], list: any[], type: 'add' | 'minus') {
    return total.map((item: any, index: number) => {
      return type === 'add' ? (item + list[index]) : (item - list[index]);
    });
  }

  // 初始化 软中断选项框
  private initSoftOption() {
    const softOption: any[] = [];
    Object.keys(this.softwareInterData).forEach(key => {
      const target = this.softwareInterData[key];
      softOption.push({
        label: key,
        total: target.softirq_count,
        list: target.softirq_count_list
      });
    });
    return softOption;
  }

  // CPU使用率
  private initCpuUsage() {
    const usageInfo: string[][] = [[], [], [], []];
    Object.keys(this.cpuUsageInfo).forEach((cpu: any) => {
      if (cpu !== 'all') {
        const target = this.cpuUsageInfo[cpu];
        usageInfo[0].push(target['%user']);
        usageInfo[1].push(target['%sys']);
        usageInfo[2].push(target['%irq']);
        usageInfo[3].push(target['%soft']);
      }
    });
    return usageInfo;
  }

  // 初始化 echarts option
  private initEchardOption() {
    const fontColor = this.currTheme === HyTheme.Dark ? '#e8e8e8' : '#222222';
    const borderColor = this.currTheme === HyTheme.Dark ? '#545454' : '#e1e6ee';
    const option = {
      tooltip: {
        trigger: 'axis',
        confine: true,
        enterable: true,
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
          if (this.cpuChecked && this.showAllData){
            tip += I18n.pcieDetailsinfo.tip;
          }
          if (this.checked && this.showAllData) {
            tip += I18n.pcieDetailsinfo.otherTip;
          }
          let html = `<div style="max-width:832px;max-height:431px;overflow:auto">
            <p style="margin-bootom: 8px;padding-bottom: 10px;font-size: 16px;">${ params[0].name }</p>
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
          if (this.cpuChecked && this.showAllData) {
            html += `<div>
              <div style="border-bottom: 1px solid ${borderColor};padding-bottom:8px;margin-bottom:8px;">
                CPU${I18n.pcieDetailsinfo.percent}
              </div>
              <div style="display:table;max-height:338px;overflow:auto">
                <div style="display: table-row;">
                  <div style="display: table-cell;max-width:256px;word-break:break-all;margin-right:16px;
                  margin-bottom:4px;">
                    <span style="margin-right:16px">${params[0].name}${I18n.pcieDetailsinfo.percent}</span>
                  </div>
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
        width: '865px',
        itemWidth: 8,
        itemHeight: 8,
        itemGap: 24,
        right: 20,
        type: 'scroll',
        textStyle: {
          color: this.currTheme === HyTheme.Dark ? '#e8e8e8' : '#252c3c'
        },
        pageIconColor: '#267dff',
        pageIconInactiveColor: '#979797',
        pageTextStyle: {
          color: fontColor
        },
        pageIconSize: 12,
      },
      grid: {
        left: 0,
        right: 0,
        bottom: '40px',
        containLabel: true
      },
      xAxis: [
        {
          type: 'category',
          axisTick: {
            show: true,
            length: 9,
            alignWithLabel: true,
          },
          data: this.xData,
          axisLabel: {
            color: this.currTheme === HyTheme.Dark ? '#aaa' : '#252c3c',
            margin: 11,
            lineHeight: 18,
          },
          axisPointer: {
            type: 'shadow',
            shadowStyle: {
              color: 'rgba(215, 224, 239, 0.36)'
            }
          },
          axisLine: {
            lineStyle: {
              color: borderColor,
              width: 2,
            }
          }
        }
      ],
      yAxis: this.generateYAxis(),
      dataZoom: [
        {
          type: 'slider',
          start: this.lineData.start,
          end: this.lineData.end,
          height: 24,
          right: 52,
          left: 35,
          bottom: 5,
          backgroundColor: this.currTheme === HyTheme.Dark ? '#161616' : '#ffffff',
          borderColor: this.currTheme === HyTheme.Dark ? '#484a4e' : '#E1E6EE',
          handleStyle: { color: '#037dff' },
          textStyle: { color: this.currTheme === HyTheme.Dark ? '#e8e8e8' : '#252c3c' },
          // 是否开启刷选功能
          brushSelect: false
        },
        {
          type: 'inside'
        }
      ],
      series: this.generateSeries()
    };
    this.echartsOption = option;
  }

  /**
   * 渲染Tooltip内容
   * params 当前X轴对应的所有series参数
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
      } else if (v.seriesId.indexOf('cpu') >= 0){
        cpuHtml += itemHtml;
        cpuTotal += Number(v.data);
      }
    });
    if (this.showAllData && this.checked) {
      const total = this.allIrqList[params[0].name?.split('CPU')[1]];
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

  // 初始化 x 轴数据
  private initXAxisData() {
    const xAxixData: any[] = [];

    Object.keys(this.irqDataByCpu).forEach((data: any, index: number) => {
      xAxixData.push(`CPU${index}`);
    });

    return xAxixData;
  }

  // 处理 echarts-series
  private generateSeries() {
    // 硬中断
    const seriesArr: any = this.generateHardSeries();
    const softColor =  this.currTheme === HyTheme.Dark ? this.softTerminalColorDark : this.softTerminalColor;
    const cpuColor =  this.currTheme === HyTheme.Dark ? this.cpuUsageColorDark : this.cpuUsageColor;
    // 处理选择的软中断，过滤总频次为0的软中断
    const softData = this.softSelectd.filter((soft) => {
      return soft.total > 0;
    });
    softData.forEach((soft, index: number) => {
      seriesArr.push({
        name: soft.label,
        type: 'bar',
        barMaxWidth: 20,
        stack: 'soft',
        emphasis: { focus: 'series' },
        color: softColor[index % 4],
        data: soft.list,
        id: 'soft' + index
      });
    });

    // CPU使用率
    if (this.showAllData && this.cpuChecked) {
      this.usageInfo.forEach((usage, index: number) => {
        seriesArr.push({
          name: this.cpuUsageName[index],
          type: 'bar',
          barMaxWidth: 20,
          stack: 'usage',
          emphasis: { focus: 'series' },
          color: cpuColor[index],
          data: usage,
          yAxisIndex: 1,
          id: 'cpu' + index
        });
      });
    }
    return seriesArr;
  }

  // 硬中断series: 所有中断、下钻
  private generateHardSeries() {
    const hardColor =  this.currTheme === HyTheme.Dark ? this.hardTerminalColorDark : this.hardTerminalColor;
    const hardSeries: any[] = [];
    const series = {
      type: 'bar',
      barMaxWidth: 20,
      stack: 'hard',
      emphasis: { focus: 'series' },
    };
    if (this.showAllData) {
      const hardData = this.hardSelected.filter((item) => {
        return item.total > 0;
      });
      hardData.forEach((hard, index: number) => {
        hardSeries.push(Object.assign({
          id: 'hard' + index,
          name: hard.name,
          color: hardColor[index % 10],
          data: hard.list
        }, series));
      });
      if (this.checked) {
        hardSeries.push(Object.assign({
          name: I18n.pcieDetailsinfo.other_hardware,
          data: this.computeUnSelectedIrqList(),
          color: this.currTheme === HyTheme.Dark ? '#9ea4b3' : '#e1e6ee',
          id: 'hard_unselect'
        }, series));
      }
    } else {
      const code = this.selectedSeries.seriesName.split(':')[0];
      const target = this.allIrqData[code];
      // 已筛选的硬中断频率
      let total = new Array(Object.keys(this.irqDataByCpu).length).fill(0);
      this.hardSelected.forEach((hard) => {
        if (hard.total !== '--' && hard.total > 0) {
          total = this.getTotalCount(total, hard.list, 'add');
        }
      });
      hardSeries.push(Object.assign({
        name: target.irq_event_name,
        color: this.selectedSeries.color,
        data: target.irq_count_list,
        id: 'hard'
      }, series), Object.assign({
        name: I18n.pcieDetailsinfo.selected_hardware,
        color: '#e1e6ee',
        data: this.getTotalCount(total, target.irq_count_list, 'minus'), // 其他已筛选的硬中断频率
        id: 'hard_down_unselect'
      }, series));
    }
    return hardSeries;
  }

  // 处理Y轴
  private generateYAxis() {
    const yAxis = [{
      type: 'value',
      splitNumber: 2,
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: {
        show: true,
        lineStyle: { type: 'dashed', color: this.currTheme === HyTheme.Dark ? '#484a4e' : '#d4d9e6' }
      },
      axisLabel: { color: this.currTheme === HyTheme.Dark ? '#9ea4b3' : '#252c3c' },
      name: I18n.net_io.xps_rps.inter_dis.soft_hadr_time,
      nameTextStyle: {
        align: 'left',
        color: this.currTheme === HyTheme.Dark ? '#e8e8e8' : '#222222'
      }
    }];
    if (this.showAllData && this.cpuChecked) {
      yAxis.push({
        type: 'value',
        splitNumber: 2,
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: {
          show: false,
          lineStyle: { type: 'dashed', color: this.currTheme === HyTheme.Dark ? '#484a4e' : '#d4d9e6' }
        },
        axisLabel: { color: this.currTheme === HyTheme.Dark ? '#9ea4b3' : '#252c3c' },
        name: I18n.pcieDetailsinfo.cpu_usage_percent,
        nameTextStyle: {
          align: 'right',
          color: this.currTheme === HyTheme.Dark ? '#e8e8e8' : '#222222'
        }
      });
    }
    return yAxis;
  }

  // 确认筛选硬中断
  hardSelectedChange(context: any) {
    this.hardSelected = this.hardPreSelected;
    this.updateEchartOption();
    context.dismiss();
  }

  // 勾选显示所有硬中断频次
  checkBoxChange() {
    this.updateEchartOption();
  }

  // 勾选显示CPU使用率
  showCpuUsageChange() {
    this.echartsOption.yAxis = this.generateYAxis();
    this.updateEchartOption();
  }

  // 返回
  backToAllData() {
    this.showAllData = true;
    this.echartsOption.yAxis = this.generateYAxis();
    this.echartsOption.dataZoom[0].start = this.lineData.start;
    this.echartsOption.dataZoom[0].end = this.lineData.end;
    this.updateEchartOption();
  }

  // 筛选软中断
  handleSelectedChange(){
    this.updateEchartOption();
  }

  // 更新echarts的series，保留datazoom缩放位置
  private updateEchartOption() {
    this.echartsOption.series = this.generateSeries();
    this.echartsOption.dataZoom[0].start = this.lineData.start;
    this.echartsOption.dataZoom[0].end = this.lineData.end;
    if (this.echartsInstance) {
      this.echartsInstance.clear();
      this.echartsInstance.setOption(this.echartsOption);
    }
  }

  // 硬中断筛选弹窗
  openFilterModal(){
    this.srcData.data = this.originData;
    this.totalNumber = this.srcData.data.length;
    this.value = ''; // 重置搜索
    this.hardPreSelected = this.srcData.data.filter((item) => {
      return this.hardSelected.indexOf(item) >= 0;
    });
    this.currentPage = 1;
    this.tiModal.open(this.hardwareModal, {
      modalClass: 'hardware',
      id: 'hardware',
      context: {
        title: I18n.pcieDetailsinfo.filter,
      }
    });
  }

  /**
   * 搜索
   * @param event 输入字符串
   */
  comSearch(event: any) {
    const keyword = event === undefined ? '' : event.toString().trim();
    const str = encodeURIComponent(keyword);
    this.srcData.data = [];
    this.originData.forEach((val: TiTableRowData) => {
      if (val.name.indexOf(str) > -1) {
        this.srcData.data.push(val);
      }
    });
    this.totalNumber = this.srcData.data.length;
  }

  /**
   * 清空搜索框
   */
  onClear(): void {
    this.srcData.data = this.originData;
    this.totalNumber = this.srcData.data.length;
  }

  // 计算未选择的硬中断列表
  private computeUnSelectedIrqList() {
    let unSelectedIrqList: number[] = [];
    let total = new Array(Object.keys(this.irqDataByCpu).length).fill(0);

    this.hardSelected.forEach((hard) => {
      if (hard.total !== '--' && hard.total > 0) {
        total = this.getTotalCount(total, hard.list, 'add');
      }
    });
    unSelectedIrqList = this.getTotalCount(this.allIrqList, total, 'minus');

    return unSelectedIrqList;
  }
}

