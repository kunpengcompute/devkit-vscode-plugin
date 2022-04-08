import {
  Component, OnInit, Input, AfterViewInit, OnChanges, Output, EventEmitter, ViewChild
} from '@angular/core';
import { Axios2vscodeServiceService } from '../../../service/axios2vscode-service.service';
import { I18nService } from '../../../service/i18n.service';
import { MyTimeLineData } from '../../../service/myTimeLineData.service';
import { HyTheme, HyThemeService } from 'hyper';


@Component({
  selector: 'app-miss-timing',
  templateUrl: './missTiming.component.html',
  styleUrls: ['./missTiming.component.scss']
})
export class MissTimingComponent implements OnInit, AfterViewInit, OnChanges {
  public echartsInstance: any;
  public tableData: any;
  public baseTop = 6;
  public gridHeight = 32;  // 时序图高度
  public baseColor = '#e6ebf5';
  public ylabelColor = '#999';
  public time: any;
  public uuid: any;
  public option: any;
  public typeOptions: Array<any> = [];
  public i18n: any;
  public typeSelected: any;
  public cpuSelected: any;
  public cpuNumsOption: Array<any> = [];
  public dataName: 'cpu';
  public empty = true;
  public leftTitleData: any;
  public noDataInfo = '';
  public xConfigData = [];
  public startValue: any;
  public endValue: any;
  public scrollTop = 0;
  public chartDataList: any[];
  public originalData: any;
  public maxIndex: any;
  public eventData: any = [1];
  public filterName = '';
  public timeData = [];
  public originalTimeData = [];
  public timeLine = {
    start: 0,
    end: 100
  };
  public xLabels: Array<string> = [];
  public chartDataStash: any;
  @Input()
  set chartData(val: any){
    this.chartDataStash = val;
  }
  get chartData(){
    return this.chartDataStash;
  }
  @Input() nodeid: any;
  @Input() taskid: any;
  @Input() dataType: any;
  @Input() show: boolean;  // 判断是调接口还是下拉的变化
  @Input() typeDetail: any;
  @Output() obtainType = new EventEmitter();
  @ViewChild('timeLineDetail', { static: false }) timeLineDetail;  // 时间轴
  // 主题相关属性
  hyTheme = HyTheme;
  public currTheme = HyTheme.Dark;
  constructor(
    public Axios: Axios2vscodeServiceService,
    public i18nService: I18nService,
    private myTimeLineData: MyTimeLineData,
    private themeServe: HyThemeService
  ) {
    this.i18n = this.i18nService.I18n();
    this.noDataInfo = this.i18n.common_term_task_nodata;
    // vscode颜色主题适配
    this.themeServe.subscribe((msg: HyTheme) => {
      this.currTheme = msg;
      if (null == this.chartData) {
        return;
      }
      this.initTable();
    });
  }

  /**
   * 组件初始化
   */
  ngOnInit() {
    this.typeOptions = [
      { // 进程
        label: this.i18n.common_term_projiect_task_process,
        id: 'process',
      },
      { // 线程
        label: this.i18n.common_term_task_tab_summary_thread,
        id: 'thread',
      },
      { // 模块
        label: this.i18n.common_term_task_tab_summary_module,
        id: 'module',
      },
      {
        label: 'CPU',
        id: 'cpu',
      },
    ];
    this.typeSelected = this.typeOptions[3];
    this.scrollTop = 0;
  }

  /**
   * ngOnChanges
   */
  ngOnChanges(changes) {
    if (Object.keys(this.chartData).length !== 0) {
      this.empty = false;
      this.leftTitle(this.chartData);
      this.initTable();
      this.cpuNumsOption = this.typeDetail;
      if (this.show) {
        this.cpuSelected = [].concat(this.cpuNumsOption);
        this.eventData = [].concat(this.cpuNumsOption);
        this.eventData.shift();
      }
    } else {
      this.empty = true;
      this.cpuNumsOption = []; // 数据为空时清除下拉的数据及默认选项
      this.cpuSelected = [];
      this.eventData = [];
    }
    this.originalData = JSON.parse(JSON.stringify(this.chartData));
  }

  /**
   * ngAfterViewInit
   */
  ngAfterViewInit() {
    this.ngScroll();
  }

  /**
   * onChartInit
   */
  onChartInit(ec) {
    this.echartsInstance = ec;
    let timer;
    this.echartsInstance.on('datazoom', params => {  // 放大缩小时调用接口
      const that = this;
      const timeData = { end: params.batch[0].end, start: params.batch[0].start };
      this.timeLine = timeData;
      this.timeLineDetail.dataConfig(timeData);
      this.xLabels = this.myTimeLineData.timeList;
      function debounce() {
        clearTimeout(timer);
        timer = setTimeout(() => {              // 一秒钟的防抖
          const dataZoom = that.echartsInstance.getModel().option.dataZoom[0];
          that.getChartData({
            range: 'period',
            startValue: Math.floor(dataZoom.startValue * 10) * 100,
            endValue: Math.ceil(dataZoom.endValue * 10) * 100,
            dataCount: 100
          });
        }, 1000);
      }
      debounce();
    });
  }

  /**
   * OnDestroy
   */
  OnDestroy(): void {
    this.rmScroll();
  }

  /**
   * initTable
   */
  public initTable() {
    this.time = 'line';
    this.setData();
    this.leftTitle(this.chartData);
  }

  /**
   * 放大缩小调用接口
   */
  public getChartData({ range, startValue, endValue, dataCount }: any) {
    const params = {
      'node-id': this.nodeid,
      'query-type': 'timeline',
      'query-target': {
        group: this.dataType,
        range,
        startTime: startValue,
        endTime: endValue,
        dataCount
      }
    };
    this.tableData.series.forEach((item) => {    //  echarts会对比新老数据进行画图，有时会出错。所以先把数据全部等于空，再画图。
      item.data = [];
    });
    this.echartsInstance.setOption({
      series: this.tableData.series
    });
    this.Axios.axios.get(`/tasks/${this.taskid}/mem-access-analysis/`, { params }).then(res => {
      const content = res.data.content;
      this.originalData = JSON.parse(JSON.stringify(res.data.content));  // 深拷贝后面会改变数据
      for (const key in this.chartData) {    // 把数据补全，不存在的等于空数组 用于后面筛选
        if (this.chartData.hasOwnProperty(key)) {
          if (this.originalData[key] == null) {
            this.originalData[key] = [];
          } else {
            this.originalData[key].forEach((item, index) => {
              item[0] = item[0] / 1000;
            });
          }
        }
      }
      this.tableData.series.forEach((dataItem, index) => {     //  接口返回的数据 不存在对应的数据就等于空
        if (index !== 0) {
          if (content[dataItem.name]) {
            dataItem.data = content[dataItem.name].map(item => {
              return [item[0] / 1000, item[1]];
            });
          } else {
            dataItem.data = [];
          }
        }
      });
      setTimeout(() => {
      this.updateSelected(this.eventData);
      }, 100);

    });
  }

  /**
   * 筛选
   */
  public updateSelected(event) {
    const obj = {};
    if (event.length === 0) {
      this.empty = true;
    } else {
      event.forEach((item, index) => {
        obj[item.id] = JSON.parse(JSON.stringify(this.originalData[item.id]));    // 获取原始数据的值
        obj['-1'] = [];
      });
    }
    this.leftTitle(obj);
    let num = 0; // 用于判断数据变更之后的位置
    this.tableData.series.forEach((item, index) => {
      if (index !== 0) {
        if (obj[item.name] == null) {
          num += 1;
          item.data.forEach((itemData) => {
            itemData[1] = '';
          });
          if (index === this.maxIndex) {
            this.filterName = item.name;
          }
          this.tableData.grid[index].show = false;
        } else {
          item.data = JSON.parse(JSON.stringify(obj[item.name]));
          this.tableData.grid[index].show = true;
          this.tableData.grid[index].top = (this.baseTop + this.gridHeight) * (index - num - 1) + 10;
          if (index === this.maxIndex) {
            this.filterName = '';
          }
        }
      }
    });
    this.echartsInstance.setOption({
      series: this.tableData.series,
      grid: this.tableData.grid,
    });
    // 重新计算画布高度
    const height = (Object.keys(obj).length - 1) * (this.gridHeight + this.baseTop) +
      (Object.keys(obj).length < 4 ? 120 : 45) - 40;
    $('#' + this.uuid + ' .table-box').css({ height: height + 'px' });
  }

  /**
   * x轴配置
   */
  public makeXAxis(gridIndex, opt, index) {
    const options = {
      type: 'value',
      gridIndex,
      show: index === gridIndex ? true : false,
      offset: 0,
      minInterval: 1,
      axisLine: { show: false, onZero: true, lineStyle: { color: '#e6ebf5', width: 2, show: false } },
      axisTick: { show: false }, // 坐标轴刻度相关设置
      axisLabel: { show: false }, // 坐标轴刻度标签的相关设置
      splitLine: {
        show: false,  // 刻度线
        lineStyle: { color: this.baseColor },
        interval: 0
      },
      min: this.startValue,
      max: this.endValue,
      lineStyle: { color: 'transparent' }
    };
    if (opt) {
      Object.assign(options, opt);
    }
    return options;
  }

  /**
   * y轴配置
   */
  public makeYAxis(gridIndex, opt) {
    const options = {
      type: 'value',
      show: false,
      gridIndex,
      nameLocation: 'middle',
      boundaryGap: ['0.01', '0.1'],
      nameGap: 30,
      nameRotate: 0,
      offset: 0,
      nameTextStyle: {
        color: '#333'
      },
      axisTick: { show: false },
      axisLine: { show: false },
      splitLine: { show: false },
      splitNumber: 10 // y轴刻度间隔
    };
    if (opt) {
      Object.assign(options, opt);
    }
    return options;
  }

  /**
   * 表格配置
   */
  public makeGrid(top, opt) {
    const options = {
      top: top + 10,
      height: this.gridHeight,
      show: opt === 0 ? false : true,
      backgroundColor: 'rgba(35,118,115,0.1)',
      borderColor: 'transparent',
      left: 30,
      right: 25,
    };
    return options;
  }

  /**
   * 画图
   */
  public setData() {
    this.option = {
      legend: {
        data: [],
        type: 'scroll',
        icon: 'circle',
        algin: 'left',
        right: 50,
        width: '35%',
        show: true,
        top: 20,
        itemGap: 20,
      },
      dataZoom: [
        {
          type: 'slider',
          realtime: false,
          showDataShadow: false,
          showDetail: true,
          show: false,
          top: 15,
          height: 20,
          start: 0,
          end: 100,
          labelPrecision: 1,
          xAxisIndex: this.controlAxis(this.chartData)   // 控制到第几根轴
        },
        {
          type: 'inside',
          realtime: false,
          filterMode: 'weakFilter',
          throttle: 300,  // 延迟变化
          xAxisIndex: this.controlAxis(this.chartData),
        }
      ],
      tooltip: {
        trigger: 'axis',
        borderColor: 'rgba(50,50,50,0)',
        backgroundColor: this.currTheme === HyTheme.Light ? '#fff' : 'rgba(49, 49, 49, 1)',
        borderWidth: 1,
        borderRadius: 0,
        padding: [0, 20, 10, 20],
        triggerOn: 'mousemove',
        position: (point, params, dom, rect, size) => {
          let x = 0; // x坐标位置
          let y = 0; // y坐标位置
          // 当前鼠标位置
          const pointX = point[0];
          const pointY = point[1];
          // 提示框大小
          const boxWidth = size.contentSize[0];
          const boxHeight = size.contentSize[1];
          // boxHeight > pointY 说明鼠标上边放不下提示框
          if (this.scrollTop === 0) {
            if (boxHeight > pointY) {
              y = 10;
            } else { // 上边放得下
              y = pointY - boxHeight;
            }
          } else {
            if (boxHeight > (pointY - this.scrollTop)) {
              y = pointY;
            } else { // 上边放得下
              y = pointY - boxHeight;
            }
          }
          // boxWidth > pointX 说明鼠标左边放不下提示框
          if (boxWidth > (pointX - 30)) {
            x = (pointX + 30);
          } else { // 左边放的下
            x = (pointX - boxWidth) - 30;
          }
          return [x, y];
        },
        axisPointer: {
          type: 'line',
          lineStyle: {
            color: this.currTheme === HyTheme.Light ? '#478cf1' : '#7E8083',
            width: 1.5
          }
        },
        formatter: (params) => {
          if (params.length) {
            const start = params[params.length - 1].seriesName;   // 判断鼠标现在在那一组数据上面
            if (this.filterName !== '' && this.filterName === start || start === '-1') {
              return '';
            }
            let html = '';
            params.forEach(param => {
              if (param.seriesName === start) {
                html += `
                <div style="display: flex;">
                  <div style='margin-top:5px;'>
                       <span style="font-size: 12px; color:${this.currTheme === HyTheme.Light
                        ? '#616161' : '#A8A8A8'}">${params[params.length - 1].value[0]}s</span>
                       <div style="display: flex; justify-content: space-between;">
                          <span style="display: inline-block;
                            width: 8px; height:8px;background-color: #88C26E;flex: 1;margin-top:8px;">
                          </span>
                          <span style="margin-left: 10px; color:${this.currTheme === HyTheme.Light
                            ? '#222' : '#e8e8e8'};font-size:12px; flex: 1;">
                          ${this.dataName}${param.seriesName}
                          </span>
                       </div>
                  </div>
                  <div style=' margin-left: 32px; margin-top:5px;color:${this.currTheme === HyTheme.Light
                    ? '#222' : '#e8e8e8'};font-size:12px;max-width:220px; flex:1'>
                    <span style="white-space:normal;
                      word-break:break-all;word-wrap:break-word;display:block ;max-width:170px;" >
                    ${this.typeDetail[0].typename}
                    </span>
                    <span style="font-size:12px; color:${this.currTheme === HyTheme.Light
                      ? '#222' : '#e8e8e8'}">${param.value[1]}</span>
                  </div>
                </div> `;
              }
            });
            return html;
          }
          return '';
        }
      },
      // 绘制多少表格
      grid: this.xAxis(this.chartData),
      yAxis: this.yConfig(this.chartData),
      series: this.dataConfig(this.chartData, true),
      xAxis: this.xConfigData
    };
    const height = (Object.keys(this.chartData).length - 1) * (this.gridHeight + this.baseTop) +
      (Object.keys(this.chartData).length < 4 ? 120 : 45);
    $('#' + this.uuid + ' .table-box').css({ height: height + 'px' });
    this.tableData = this.option;
  }
  /**
   * 滑动条控制多少根轴
   */
  public controlAxis(data) {
    const arr = [];
    const index = Object.keys(data).length;
    for (let i = 0; i < index; i++) {
      arr.push(i);
    }
    return arr;
  }

  /**
   * 绘制多少表格
   */
  public xAxis(data) {
    const arr = [];
    const index = Object.keys(data).length;
    for (let i = 0; i < index; i++) {
      arr.push(this.makeGrid((this.baseTop + this.gridHeight) * (i === 0 ? i : (i - 1)), i));
    }
    return arr;
  }

  /**
   * x轴相关配置
   */
  public xConfig(data) {
    const arr = [];
    const index = Object.keys(this.chartData).length;
    for (let i = 0; i < index; i++) {
      arr.push(this.makeXAxis(i, {
        axisLabel: {
          show: false,    // x坐标要不要展示
          color: this.ylabelColor,
          inside: true,
          formatter: (value) => {
            return value.toFixed(1) + 's';
          },
          margin: (this.baseTop + this.gridHeight) * (data + 1) + 20    // 宽度乘第几个 加上36  x轴坐标有多有少，取最多的。
        },
      }, data));
    }
    this.xConfigData = arr;
  }

  /**
   * y轴配置
   */
  public yConfig(data) {
    const arr = [];
    const index = Object.keys(data).length;
    for (let i = 0; i < index; i++) {
      arr.push(this.makeYAxis(i, {}));
    }
    return arr;
  }

  /**
   * 数据配置
   */
  public dataConfig(dataTime, type) {
    const arr = [];
    for (const key in dataTime) {
      if (dataTime.hasOwnProperty(key)) {
        const obj = {
          name: 'Committed Size',
          type: 'line',
          symbol: 'circle',
          smooth: false,
          symbolSize: 4,
          xAxisIndex: 0,
          yAxisIndex: 0,
          areaStyle: {},
          stack: '',
          itemStyle: {
            normal: {
              color: 'rgba(136,194,110,0.4)'
            }
          },
          lineStyle: {
            opacity: '0'
          },
          data: ''
        };
        obj.name = key;
        obj.data = dataTime[key];
        arr.push(obj);
      }

    }
    const name = '-1';
    arr.forEach((item, index) => {
      if (item.name === name) {        // 找到在数据中对应的是哪一个，然后把索传过去
        this.startValue = item.data[0][0];        // 时间轴开始值
        this.endValue = item.data[item.data.length - 1][0];  // 时间轴结束值
        this.timeData = [];
        const timeArr = [];
        item.data.forEach((timeData, timeIndex) => {
          timeArr.push(timeData[0] + 's');
          this.originalTimeData.push(timeData[0]);

        });
        this.timeData = timeArr;
        if (type) {
          this.xConfig(0);
          this.maxIndex = index;
        }
      }

      if (index === arr.length - 1) {
        item.xAxisIndex = 0;
        item.yAxisIndex = 0;
      } else {
        item.xAxisIndex = index + 1;
        item.yAxisIndex = index + 1;
      }
    });
    const timeingData = { end: 100, start: 0 };
    if (this.timeLineDetail) {
      this.timeLine = timeingData;
      this.timeLineDetail.dataConfig(timeingData);
    }
    arr.unshift(arr[arr.length - 1]);
    arr.pop();
    arr[0].data.forEach((item) => {
      item[1] = '';
    });
    return arr;
  }

  /**
   * 左侧title,赋值之后直接在页面上展示，比较好控制样式
   */
  public leftTitle(data) {
    const arr = [];
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        if (this.dataName === undefined) {
          this.dataName = 'cpu';
        }
        arr.push(key);
      }
    }
    arr.splice(arr.indexOf('-1'), 1);
    this.leftTitleData = arr;
    return arr;
  }

  /**
   * 数据类型
   */
  public typeChange(data) {
    this.obtainType.emit(data);
    this.cpuSelected = [];
    this.dataName = data.label;
    const scroll: any = document.getElementsByClassName('memory-detail')[0];  // 筛选时滚动条回到顶部
    scroll.scrollTop = 0;
  }

  /**
   * 数据详细类型
   */
  public cpuChange(event) {
    if (event.length !== 0) {
      this.empty = false; // 只要不等于0 就要让echarts显示
      if (event[0].id === 'all') {
        if (event[0].select) {           // 如果选中，并且上一次的状态也是选中，那么现在就取消（对应情况是，all选中，并且现在点击其他的，那么就取消all）
          this.cpuNumsOption[0].select = false;
          event.splice(0, 1);
          this.cpuSelected = [].concat(event);
        } else {                          // 如果现在选中，并且上一次没有选中。那么就代表，这次点击的是all，此时吧所有数据展示出来
          this.cpuNumsOption[0].select = true;
          this.cpuSelected = [].concat(this.cpuNumsOption);
          event = this.cpuNumsOption.slice(1, this.cpuNumsOption.length);
        }
        this.updateSelected(event);
        this.eventData = event;
      } else {
        if (this.cpuNumsOption[0].select) {
          if (this.cpuNumsOption.length === event.length + 1) {     // 点击all 全部取消
            this.cpuSelected = [];
            this.cpuNumsOption[0].select = false;
            this.updateSelected([]);
            this.eventData = [];
          }
        } else {
          if (this.cpuNumsOption.length === event.length + 1) {     // 如果其他都选了，那么all也选上
            this.cpuNumsOption[0].select = true;
            this.cpuSelected = [].concat(this.cpuNumsOption);
          }
          this.updateSelected(event);
          this.eventData = event;
        }
      }

    } else {
      this.updateSelected([]);
      this.eventData = [];
    }
  }

  /**
   * 滚动事件   用于判断滚动时图表弹窗放置的位置
   */
  public ngScroll() {
    const scroll = document.getElementsByClassName('memory-detail')[0];
    scroll.addEventListener('scroll', () => {
      const scrollTop = scroll.scrollTop;
      this.scrollTop = scrollTop;
    });
  }

  /**
   * 删除滚动事件
   */
  public rmScroll() {
    const targetScroll = document.getElementsByClassName('memory-detail')[0];
    targetScroll.removeEventListener('scroll', this.ngScroll);
  }

  /**
   * 时间轴改变
   */
  public timeLineData(e) {
    this.option.dataZoom[0].start = e.start;
    this.option.dataZoom[0].end = e.end;
    this.echartsInstance.setOption({
      dataZoom: this.option.dataZoom
    });

    const dataZoom = this.echartsInstance.getModel().option.dataZoom[0];
    this.getChartData({
      range: 'period',
      startValue: Math.floor(dataZoom.startValue * 10) * 100,
      endValue: Math.ceil(dataZoom.endValue * 10) * 100,
      dataCount: 100
    });
    const timeData = { end: e.end, start: e.start };
    this.timeLine = timeData;
    this.xLabels = this.myTimeLineData.timeList;
  }
}
