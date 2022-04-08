import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import { AxiosService } from 'projects/sys/src-web/app/service/axios.service';
import { TiTableColumns, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';
import { ConfigTableService } from '../service/config-table.service';
import { connect } from 'echarts';
@Component({
  selector: 'app-perf-data',
  templateUrl: './perf-data.component.html',
  styleUrls: ['./perf-data.component.scss']
})
export class PerfDataComponent implements OnInit {
  @Input() projectName: string;
  @Input() taskName: string;
  @Input() taskid: any;
  @Input() nodeid: number;
  public i18n: any;
  public columns: Array<TiTableColumns> = [];
  public srcData: TiTableSrcData;
  public displayed: Array<TiTableRowData> = [];
  public differentNodesData: any = []; // selectMask数据
  public timeLine = { start: 0, end: 100 };
  public timeData: any = [];
  public initializing = true;
  public storageDev: any[] = [];
  public netDev: any[] = [];
  public smoothOptions: object[] = [];
  public maskType: string;
  public memData: any; // mem_usage数据暂存
  public uuid: any;
  public netNodataTip = '';
  public diskNodataTip = '';
  public usage: any = {
    cpuOptions: [],
    cpuSelected: {},
    smoothSelected: [],
    displayData: {
      time: []
    }
  };
  public average: any = {
    smoothSelected: [],
    displayData: {
      time: []
    }
  };
  public memUsage: any = {
    smoothSelected: [],
    displayData: {
      time: []
    }
  };
  public disk: any = {
    smoothSelected: [],
    displayData: {
      time: []
    },
    deviceDict: {},
  };
  public net: any = {
    smoothSelected: [],
    displayData: {
      time: []
    },
    deviceDict: {},
  };
  public consumption: any = {
    smoothSelected: [],
    displayData: {
      time: []
    }
  };
  @ViewChild('selectMask') selectMask: any;
  @ViewChild('timeLineDetail') timeLineDetail: any;
  @ViewChild('usageChart') usageChart: any;
  @ViewChild('avageChart') avageChart: any;
  @ViewChild('memChart') memChart: any;
  @ViewChild('diskChart') diskChart: any;
  @ViewChild('netChart') netChart: any;
  @ViewChild('consumptionChart') consumptionChart: any;
  constructor(
    private Axios: AxiosService,
    public i18nService: I18nService,
    public configTableService: ConfigTableService
  ) {
    this.i18n = this.i18nService.I18n();
  }

  ngOnInit(): void {
    this.uuid = this.Axios.generateConversationId(12);
    this.usage.cpuOptions = [
      { label: this.i18n.linkage.cpuPercent5, key: 5 },
      { label: this.i18n.linkage.cpuPercent10, key: 10 },
      { label: 'None', key: '' },
    ];
    this.usage.cpuSelected = this.usage.cpuOptions[0];
    this.smoothOptions = [
      { label: 'SES', key: 'SES' },
      { label: 'None', key: '' },
    ];
    this.usage.smoothSelected = this.smoothOptions[0];
    this.average.smoothSelected = this.smoothOptions[0];
    this.memUsage.smoothSelected = this.smoothOptions[0];
    this.disk.smoothSelected = this.smoothOptions[0];
    this.net.smoothSelected = this.smoothOptions[0];
    this.consumption.smoothSelected = this.smoothOptions[0];
    this.columns = [{
      title: this.i18n.sys_cof.sum.disk_info.disk_name,
      key: 'dev',
    }];
    this.getData('cpu_usage');
    this.getData('cpu_avgload');
    this.getData('mem_usage');
    this.getData('cfg_sys_power');
    this.getDevData();
    this.netNodataTip = this.i18n.loading;
    this.diskNodataTip = this.i18n.loading;
  }

  /**
   * 请求数据
   * @param el type
   */
  public getData(el: any) {
    this.initializing = true;
    let params: { [x: string]: any } = {};
    if (el === 'cpu_usage') {
      if (this.usage.cpuSelected.key) {
        params.usagePercent = this.usage.cpuSelected.key;
      }
      if (this.usage.smoothSelected.key) {
        params.smoothing = this.usage.smoothSelected.key;
      }
    } else if (el === 'cpu_avgload' && this.average.smoothSelected.key) {
      params.smoothing = this.average.smoothSelected.key;

    } else if ((el === 'mem_usage' || el === 'mem_page') && this.memUsage.smoothSelected.key) {
      params.smoothing = this.memUsage.smoothSelected.key;
    } else if (el === 'disk_usage') {
      params = {
        deviceDict: this.disk.deviceDict,
      };
      if (this.disk.smoothSelected.key) {
        params.smoothing = this.disk.smoothSelected.key;
      }
    } else if (el === 'net_info') {
      params = {
        deviceDict: this.net.deviceDict,
      };
      if (this.net.smoothSelected.key) {
        params.smoothing = this.net.smoothSelected.key;
      }
    } else if (el === 'cfg_sys_power' && this.consumption.smoothSelected.key) {
      params.smoothing = this.consumption.smoothSelected.key;
    }

    params.taskId = this.taskid;
    params.queryTarget = el;

    this.Axios.axios.get('/tasks/taskcontrast/dynamic/', {
      params,
      headers: {
        showLoading: false,
      }
    }).then((res: any) => {
      if (this.timeData.length === 0 && res.data.time) {
        this.timeData = res.data.time;
      }
      if (el === 'mem_usage') {
        this.memData = res?.data;
        this.getData('mem_page');
      } else {
        this.dealChartData(el, res.data);
      }
    })
      .finally(() => {
        this.initializing = false;
      });
  }
  /**
   * 处理chart数据
   * @param el 类型
   */
  public dealChartData(el: string, data: any) {
    const resData: { [x: string]: any } = {};
    let key: any;
    let legends: any = [];
    if (el === 'net_info' || el === 'disk_usage') {
      const dev = Object.keys(data.table);
      data.title.forEach((item: string, num: number) => {
        dev.forEach(item2 => {
          if (data.table[item2]) {
            key = Object.keys(data.table[item2]);
            const str = item + '-' + item2;
            resData[str] = {};
            key.forEach((item3: string | number) => {
              const value = data.table[item2][item3].data[item];
              if (value) {
                if (!legends.includes(str)) { legends.push(str); }
                resData[str][item3] = value;
              }
            });
          }
        });
      });
    } else {

      let tableData = data.table;
      // 加上 mem_usage
      if (el === 'mem_page' && this.memData?.table) {
        tableData = Object.assign(this.memData.table, data.table);
      }
      key = Object.keys(tableData);
      legends = data.title;
      legends.forEach((tit: string | number, idx: number) => {
        resData[tit] = {};
        key.forEach((val: string | number) => {
          resData[tit][val] = tableData[val].data[idx];
        });
      });
    }
    const option = {
      spec: legends,
      time: data.time || [],
      key,
      data: resData,
      title: '',
      type: el,
    };
    if (el === 'cpu_usage') {
      if (this.usageChart) {
        this.usage.displayData = option;
        setTimeout(() => {
          this.usageChart.setData(this.timeLine);
        });
      } else {
        this.usage.displayData = option;
      }
    } else if (el === 'cpu_avgload') {
      if (this.avageChart) {
        this.average.displayData = option;
        setTimeout(() => {
          this.avageChart.setData(this.timeLine);
        });
      } else {
        this.average.displayData = option;
      }
    } else if (el === 'mem_page') {
      if (this.memChart) {
        this.memUsage.displayData = option;
        setTimeout(() => {
          this.memChart.setData(this.timeLine);
        });
      } else {
        this.memUsage.displayData = option;
      }
    } else if (el === 'disk_usage') {
      if (legends.length === 0) {
        this.disk.displayData.time = [];
        return;
      }
      if (this.diskChart) {
        this.disk.displayData = option;
        setTimeout(() => {
          this.diskChart.setData(this.timeLine);
        });
      } else {
        this.disk.displayData = option;
      }
    } else if (el === 'net_info') {
      if (legends.length === 0) {
        this.net.displayData.time = [];
        return;
      }
      if (this.netChart) {
        this.net.displayData = option;
        setTimeout(() => {
          this.netChart.setData(this.timeLine);
        });
      } else {
        this.net.displayData = option;
      }
    } else if (el === 'cfg_sys_power') {
      if (this.consumptionChart) {
        this.consumption.displayData = option;
        setTimeout(() => {
          this.consumptionChart.setData(this.timeLine);
        });
      } else {
        this.consumption.displayData = option;
      }

    }
  }

  /**
   * 获取设备数据
   */
  public getDevData() {
    this.initializing = true;
    const params = {
      taskId: this.taskid
    };
    this.Axios.axios.get('/tasks/taskcontrast/device-list/', {
      params,
      headers: {
        showLoading: false,
      }
    }).then((res: any) => {
      const diskData = res?.data?.disk_usage;
      const netData = res?.data?.net_info;
      this.dealDev(diskData, 'storage');
      this.dealDev(netData, 'net');
      this.diskNodataTip = this.i18n.common_term_nodata_available;
      this.netNodataTip = this.i18n.common_term_nodata_available;
    })
      .catch(() => {
        this.diskNodataTip = this.i18n.common_term_task_nodata2;
        this.netNodataTip = this.i18n.common_term_task_nodata2;
      })
      .finally(() => {
        this.initializing = false;
      });
  }
  /**
   * 处理设备数据
   * @param resData 源数据
   */
  private dealDev(resData: { [x: string]: any[]; }, str: string) {
    const devList = Object.keys(resData);
    const data = devList.map((val: any, idx: number) => {
      const expand = idx === 0 ? true : false;
      const displayed: Array<TiTableRowData> = [];
      const srcData = {
        data: ([] as Array<TiTableRowData>),
        state: {
          searched: false,
          sorted: false,
          paginated: false
        },
      };
      // 剔除max_tps和max_util
      const tpsIdx = resData[val].indexOf('max_tps');
      if (tpsIdx !== -1) {
        resData[val].splice(tpsIdx, 1);
      }
      const utilIdx = resData[val].indexOf('max_util');
      if (tpsIdx !== -1) {
        resData[val].splice(utilIdx, 1);
      }
      const item: { [x: string]: any } = {
        srcData,
        expand,
        displayed,
        diffrent: false,
        projectName: val,
        checkedList: [],
      };
      item.srcData.data = resData[val].map((el: string) => {
        const child: { [x: string]: any } = {};
        this.columns.forEach((it, num: number) => {
          child[it.key] = el;
        });
        child.disabled = false;
        child.checked = false;
        return child;
      });
      return item;
    });
    if (str === 'storage') {
      this.storageDev = data;
    } else {
      this.netDev = data;
    }
  }

  /**
   *  时间轴变化数据改变
   */
  public timeLineData(e: any) {
    this.timeLine = e;
    this.configTableService.timelineUPData.next(e);
  }

  /**
   *  数据筛选时间轴改变
   */
  public dataZoom(e: any) {
    this.timeLine = e;
    this.timeLineDetail.dataConfig(e);
  }
  /**
   * 侧滑框取消按钮
   * @param str 点击遮罩层或者取消按钮
   */
  public onSelectCancel(str?: string) {
    if (str !== 'mask') {
      this.selectMask.CloseIO();
    }
  }

  /**
   * 磁盘选择确定按钮
   */
  public onSelectConfirm(type: string) {
    const device: { [x: string]: any } = {};
    let iSelected = false;
    this.differentNodesData.forEach((val: { projectName: string; checkedList: any[]; }) => {
      if (val.checkedList.length > 0) { iSelected = true; }
      device[val.projectName] = val.checkedList.map(el => {
        return el.dev;
      });
    });
    if (type === 'storage') {
      if (iSelected) {
        this.disk.deviceDict = device;
        this.getData('disk_usage');
      } else {
        if (this.disk.displayData) { this.disk.displayData.time = []; }
      }

    } else {
      if (iSelected) {
        this.net.deviceDict = device;
        this.getData('net_info');
      } else {
        if (this.net.displayData) { this.net.displayData.time = []; }
      }
    }
    this.selectMask.CloseIO();
  }

  /**
   *  differentNodes磁盘筛选的相关方法
   */
  public onThreadScreenClick(type: string) {
    this.differentNodesData = [];
    this.maskType = type;
    if (type === 'storage') {
      this.differentNodesData = this.storageDev;
    } else {
      this.differentNodesData = this.netDev;
    }
    this.selectMask.Open();
  }

  /**
   * 控制表格选中最多10个
   * @param e 选中列表
   * @param displayed 展示列表
   */
  public onMyChange(e: any, displayed: { disabled: boolean; checked: boolean; }[]) {
    let selected = 0;
    this.differentNodesData.forEach((el: { checkedList: any[] }) => {
      selected += el.checkedList.length;
    });
    displayed.forEach((val: { disabled: boolean; checked: boolean; }) => {
      val.checked = false;
    });
    e.forEach((val: { checked: boolean; }) => { val.checked = true; });
    this.differentNodesData.forEach((el: { displayed: any[]; }) => {
      el.displayed.forEach((val: { disabled: boolean; checked: boolean; }) => {
        if (selected >= 10) {
          val.disabled = val.checked === false ? true : false;
        } else {
          val.disabled = false;
        }
      });
    });
  }
  // 由子组件传递echartsInst, echarts图表联动
  public echartsInstOut(e: any) {
    if (e) {
      e.group = this.uuid;
    }
    connect(this.uuid);
  }
}
