import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import { AxiosService } from 'projects/sys/src-web/app/service/axios.service';
import { TiTableColumns, TiTableComponent, TiTableDataState, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';
import { MessageService } from 'projects/sys/src-web/app/service/message.service';
import { MytipService } from 'projects/sys/src-web/app/service/mytip.service';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import { TableService } from 'sys/src-com/app/service/table.service';
import { LeftShowService } from 'projects/sys/src-web/app/service/left-show.service';
import { connect } from 'echarts';
import { SummuryDataService } from '../storage-summury/summury-data.service';
import { ConnectLegendsService } from '../components/connect-legends.service';

@Component({
  selector: 'app-ioapis',
  templateUrl: './ioapis.component.html',
  styleUrls: ['./ioapis.component.scss']
})
export class IoapisComponent implements OnInit {
  @Input() projectName: any;
  @Input() taskName: any;
  @Input() analysisType: any;
  @Input() taskid: any;
  @Input() nodeid: any;
  @ViewChild('timeLineDetail') timeLineDetail: any;  // 时间轴组件
  @ViewChild('iosifting') iosifting: any;  // 侧滑筛选框组件
  @ViewChild('brushDetails') brushDetails: any;  // 详情组件
  @ViewChild('threadScreenMask') threadScreenMaskRef: any;
  @Input()
  public set select(item: any) {
    this.flameSelect = item;
    this.func = item.func;
    this.pid = item.pid;
  }
  public get select() {
    return this.flameSelect;
  }
  public flameSelect: any;
  public func = ''; // 不为''来判断是从summury跳转来的
  public pid = '';
  public i18n: any;
  public uuid: any;
  public nodataTips = '';
  public timeData: any = []; // 时间轴数据
  public timeLine = {
    start: 0,
    end: 100
  };
  public selectFunctionList: any = []; // 筛选之后展示的数据
  public totalData: any = []; // 处理好的所有数据
  public brushData: object;
  public currentPage = 1;
  public totalNumber = 0;
  public pageSize: { options: Array<number>, size: number } = {
    options: [10, 20, 30, 50],
    size: 10
  };
  public functionCurrentPage = 1;
  public functionTotalNumber = 0;
  public functionPageSize: { options: Array<number>, size: number } = {
    options: [10, 20, 30, 50],
    size: 10
  };
  public threadDisplayedData: Array<TiTableRowData> = [];
  public threadSrcData: any = { data: [] };
  public functionDisplayedData: Array<TiTableRowData> = [];
  public functionSrcData: any = { data: [] };
  public pidColumns: Array<TiTableColumns> = [];
  public checkedListPid: Array<any> = []; // PID选中项
  public threadColumns: Array<TiTableColumns> = [];
  public diskTitle: Array<TiTableColumns> = [];
  public disksHeadShow = false;
  public diskCheckedData: Array<any> = [];
  //  表头筛选数据
  public diskHeaderData: Array<any> = [];
  public someData: any = {}; // 保存临时筛选前数据
  public closeLock = false; // 回填一级表格触发二级表格回填锁
  public legends: any[];
  public keys = ['times', 'averageTime', 'totalTime'];
  public obtainingData = false;

  // 上下折叠面板状态, active:展开
  public topState = 'notActive';
  public readChecked = false;
  public timeTitle = '--';

  constructor(
    private leftShowService: LeftShowService,
    public i18nService: I18nService,
    public Axios: AxiosService,
    private connectLegends: ConnectLegendsService,
    public summuryData: SummuryDataService,
  ) {
    this.i18n = this.i18nService.I18n();
    this.nodataTips = this.i18n.loading;
    this.threadColumns = [
      {
        title: this.i18n.storageIO.ioapis.functionName,
        width: '15%',
        key: 'fun_name',
        selected: null,
        multiple: true,
        selectAll: true,
        disabled: false,
      },
      {
        title: this.i18n.storageIO.ioapis.sysTimes,
        width: '18%',
        key: 'exec_count',
        sortKey: 'exec_count',
        disabled: false,
      },
      {
        title: this.i18n.storageIO.ioapis.average_time_s,
        width: '20%',
        key: 'avg_time',
        sortKey: 'avg_time',
        disabled: false,
      },
      {
        title: this.i18n.storageIO.ioapis.total_time_s,
        width: '19%',
        key: 'sum_time',
        sortKey: 'sum_time',
        disabled: false,
      },
      {
        title: this.i18n.storageIO.ioapis.time_ratio,
        width: '18%',
        key: 'percent',
        sortKey: 'percent',
        disabled: false,
      }
    ];

    this.legends = [{ title: this.i18n.storageIO.ioapis.Invoking_times, color: '#267DFF', show: true, key: 'times' },
    { title: this.i18n.storageIO.ioapis.average_time, color: '#07A9EE', show: true, key: 'averageTime' },
    { title: this.i18n.storageIO.ioapis.total_time, color: '#41BA41', show: true, key: 'totalTime' }];
  }

  ngOnInit() {
    const bool = sessionStorage.getItem('brushTip');
    this.topState = bool === 'true' ? 'notActive' : 'active';
    this.readChecked = bool === 'true' ? true : false;

    this.uuid = this.Axios.generateConversationId(12);
    this.getData();
    this.threadSrcData.data = this.summuryData.ioOriginData;
    this.pidColumns = this.summuryData.ioColumns;
    this.pidColumns[0].selected = this.pidColumns[0].options;
    this.pidColumns[1].selected = this.pidColumns[1].options;
    this.threadSrcData.data.forEach((val: any) => {
      val.selected = val.options;
    });
    this.totalNumber = this.summuryData.ioTableData.length;
    if (this.totalNumber === 0) {
      this.nodataTips = this.i18n.common_term_task_nodata2;
    }

  }

  /**
   * 弹出框展开详细按钮
   */
  public toggleTopOut(e: any) {
    this.topState = e.topState;
    this.timeTitle = e.timeTitle;
  }

  /**
   * 获取数据
   */
  public getData() {
    const params = {
      nodeId: this.nodeid,
    };

    this.obtainingData = true;
    this.Axios.axios.get(`/tasks/${encodeURIComponent(this.taskid)}/ioperformance/detail_all/`, {
      params,
      headers: {
        showLoading: false,
      }
    })
      .then((res: any) => {
        const data = res.data.detail_all.data;
        if (data && Object.keys(data).length > 0) {
          this.delData(data);
        } else {
          this.nodataTips = this.i18n.common_term_task_nodata2;
        }
      })
      .catch(() => {
        this.nodataTips = this.i18n.common_term_task_nodata2;
      })
      .finally(() => {
        this.obtainingData = false;
      });
  }
  /**
   * 处理请求数据
   */
  public delData(data: any) {
    const pidList = Object.keys(data);
    const total1 = pidList.length - 1;
    pidList.forEach((ele, idx) => {
      const total2 = data[ele].length;
      if (idx === 0) {
        this.timeData = data[ele][0].time;
      }
      data[ele].forEach((val: any, num: any) => {
        const func = {
          index: [num, total2, idx, total1], // 筛选第一个和最后一个分别显示图例和x轴坐标
          func: val.fun_name,
          pid: val.pid,
          function: [val.fun_name + '/' + val.pid],
          key: this.keys,
          time: val.time,
          values: {
            times: val.count,
            averageTime: val.avg,
            totalTime: val.sum,
          },
        };
        this.totalData.push(func);

      });

    });
    this.selectData();
  }

  // 处理筛选数据
  public selectData() {
    this.selectFunctionList = [];
    if (this.pid) { // 从总览跳转过来的
      this.checkedListPid = this.threadSrcData.data.filter((val: any) => {
        val.showDetails = false;
        if (val.pid === this.pid) {
          val.showDetails = true;
          val.threadCheckedList = [...val.srcData.data];
          return val;
        }
      });
      if (this.func) {
        this.checkedListPid[0].threadCheckedList = [];
        this.checkedListPid[0].srcData.data.forEach((el: any) => {
          if (el.fun_name === this.func) {
            this.checkedListPid[0].threadCheckedList.push(el);
          }
        });
        this.selectFunctionList = this.totalData.filter((ele: any, idx: any) => {
          return ele.func === this.func && ele.pid === this.pid;
        });
        this.selectFunctionList[0].index = [0, 0, 0, 0];
        return;
      }
      this.selectFunctionList = this.totalData.filter((ele: any, idx: any) => {
        return ele.pid === this.pid;
      });
      return;
    } else {
      this.checkedListPid = [...this.threadSrcData.data];
      this.threadSrcData.data.forEach((val: any) => {
        val.threadCheckedList = [...val.srcData.data];
        val.options = val.srcData.data.map((el: any) => {
          return { label: el.fun_name };
        });
        val.selected = val.options;
      });

    }
    this.selectFunctionList = this.totalData;
  }
  // 时间轴筛选
  public timeLineData(e: any) {
    this.timeLine = e;
    this.leftShowService.timelineUPData.next(e);
  }

  // 数据筛选 更新时间轴
  public dataZoom(e: any) {
    this.timeLine = e;
    this.timeLineDetail.dataConfig(e);
    this.timeLineData(e);
  }
  // 由子组件传递echartsInst, echarts图表联动
  public echartsInstOut(e: any) {
    if (e) {
      e.group = this.uuid;
    }
    connect(this.uuid);
  }

  /**
   * 框选事件
   */
  public brushOut(e: any) {
    if (e === 'click') {
      const ele = document.querySelectorAll('.mask-box') as NodeListOf<HTMLElement>;
      ele.forEach(el => {
        el.style.display = 'none';
      });
    } else {
      if (e.brushTime.length > 0) {
        this.brushData = e;
        this.brushDetails.toggleTop(
          e.pid, e.func,
          e.brushTime[0], e.brushTime[e.brushTime.length - 1],
        );
      }
    }
  }


  /**
   * 点击图例触发事件
   */
  public clickLegned(idx: any) {
    const that = this;
    that.legends[idx].show = !that.legends[idx].show;
    const showLegendList: any[] = [];
    this.keys = [];
    const selected: any = {};
    that.legends.forEach(el => {
      selected[el.title] = el.show;
      if (el.show) {
        showLegendList.push(el.title);
        this.keys.push(el.key);
      }
    });
    const params = { name: that.legends[idx].title, selected, type: 'legendselectchanged' };
    this.connectLegends.sendMessage({
      page: 'iops',
      dev: '',
      key: '',
      data: { params, showLegendList }
    });
  }


  /**
   * I/O APIs 筛选
   */
  public onProcessSelect(list: any): void {
    const pidList = this.pidColumns[0].selected.map((val: any) => {
      return val.label;
    });
    const nameList = this.pidColumns[1].selected.map((val: any) => {
      return val.label;
    });
    // 展示数据筛选
    this.threadSrcData.data = this.summuryData.ioOriginData.filter((el: any, idx: any) => {
      return pidList.indexOf(el.pid) > -1 && nameList.indexOf(el.cmd_name) > -1;
    });
    // 选中数据筛选, 筛掉的时候删除,筛出的时候不增加
    const originCheck = JSON.parse(JSON.stringify(this.checkedListPid));
    this.checkedListPid = this.threadSrcData.data.filter((val: any) => {
      let selected = false;
      originCheck.forEach((el: any) => {
        if (val.pid === el.pid && val.cmd_name === el.cmd_name) {
          selected = true;
        }
      });
      // 筛掉的去掉二级表格选中项
      if (!selected) {
        val.threadCheckedList = [];
      }
      return selected;
    });

    if (this.threadSrcData.data.length === 0) {
      this.nodataTips = this.i18n.common_term_task_nodata2;
    }
    this.totalNumber = this.threadSrcData.data.length;
  }

  // 表头筛选
  public diskHeaderChange() {
    const length = this.diskCheckedData.length;
    const arr: any = [];
    this.diskCheckedData.forEach((value) => {
      arr.push(value.title);
    });
    if (length < 4) {
      this.diskHeaderData.forEach((item, index) => {
        if (index > 3) {
          item.disabled = false;
        }
      });
    } else {
      this.diskHeaderData.forEach((item, index) => {
        if (index > 3) {
          if (arr.indexOf(item.title)) {
            item.disabled = false;
          }
          if (arr.indexOf(item.title) === -1) {
            item.disabled = true;
          }
        }
      });
    }
    this.diskTitle.forEach((item, index) => {
      if (index > 0) {
        if (arr.indexOf(item.title)) {
          item.show = true;
        }
        if (arr.indexOf(item.title) === -1) {
          item.show = false;
        }
      }
    });
  }

  /**
   *  pid选择
   */
  public pidSelectChange() {
    const pidSelect: any = [];
    this.checkedListPid.forEach(val => {
      pidSelect.push(val.pid);
    });
    this.threadSrcData.data.forEach((el: any, idx: any) => {
      if (pidSelect.indexOf(el.pid) > -1) {
        if (el.threadCheckedList.length === 0) {
          const leng = this.someData.threadSrcData[idx].threadCheckedList.length;
          // 关闭筛选框,回填的情况/ 或者函数名筛选按钮回填情况
          if (leng > 0 && leng < el.srcData.data.length && this.closeLock) {
            el.threadCheckedList = [...this.someData.threadSrcData[idx].threadCheckedList];
          } else {

            el.threadCheckedList = [...el.srcData.data];
          }
        }
      } else {
        el.threadCheckedList = [];
      }
    });
    this.closeLock = false;
  }

  /**
   * 函数选择
   * obj  进程对象
   */
  public functionSelectChange(obj: any) {
    const arr = this.checkedListPid.map(val => val.pid);
    if (obj.threadCheckedList.length === 0) {
      this.checkedListPid = [];
      this.threadSrcData.data.forEach((val: any, idx: any) => {
        if (obj.pid !== val.pid && arr.indexOf(val.pid) > -1) {
          this.checkedListPid.push(val);
        }
      });
    } else {
      // 进程id未选中的情况
      if (arr.indexOf(obj.pid) === -1) {
        this.checkedListPid = [];
        arr.push(obj.pid);
        this.threadSrcData.data.forEach((val: any, idx: any) => {
          if (arr.indexOf(val.pid) > -1) {
            this.checkedListPid.push(val);
          }
        });
      }
      // 进程id下函数未全选的情况

    }
  }

  /**
   * 函数筛选
   */
  public functionSelect(list: any, obj: any) {
    const funList = list.map((val: any) => {
      return val.label;
    });
    const originSelect = JSON.parse(JSON.stringify(obj.threadCheckedList));
    obj.threadCheckedList = [];
    obj.srcData.data = obj.originData.filter((el: any) => {
      return funList.indexOf(el.fun_name) > -1;
    });
    obj.threadCheckedList = obj.srcData.data.filter((val: any) => {
      let selected = false;
      originSelect.forEach((el: any) => {
        if (val.fun_name === el.fun_name) {
          selected = true;
        }
      });
      return selected;
    });
    obj.totalNumber = obj.srcData.data.length;
  }

  public onSelectConfirm() {
    const selectPid = this.checkedListPid.map(el => {
      return el.pid;
    });
    const selectFunctionListOrigin = this.totalData.filter((ele: { pid: any; func: any; }, idx: any) => {
      let bool = false;
      this.checkedListPid.forEach(el => {
        if (el.pid === ele.pid) {
          const funSelect = el.threadCheckedList.findIndex((val: any) => {
            return val.fun_name === ele.func;
          });
          bool = funSelect > -1 ? true : false;
        }
      });
      return bool;
    });

    this.selectFunctionList = selectFunctionListOrigin.map((val: { key: string[]; }) => {
      val.key = this.keys;
      return val;
    });
    this.threadScreenMaskRef.CloseIO();
  }

  /**
   * 打开筛选弹窗,保存筛选状态
   */
  public onThreadScreenClick() {
    this.closeLock = false;
    this.someData.checkedListPid = [...this.checkedListPid];
    this.someData.pidColumns = [...this.pidColumns];
    this.someData.threadSrcData = this.threadSrcData.data.map((el: any) => {
      el.threadCheckedList1 = JSON.parse(JSON.stringify(el.threadCheckedList));
      el.selected1 = JSON.parse(JSON.stringify(el.selected));
      el.srcData1 = JSON.parse(JSON.stringify(el.srcData.data));
      return el;
    });
    this.threadScreenMaskRef.Open();
  }


  public onSelectCancel(str?: any) {
    if (str !== 'mask') {
      this.threadScreenMaskRef.CloseIO();
    }
    setTimeout(() => {

      this.closeLock = true;
      this.checkedListPid = [...this.someData.checkedListPid];
      this.threadSrcData.data = this.someData.threadSrcData.map((val: any) => {
        val.threadCheckedList = [];
        val.srcData.data = val.originData.filter((el: any) => {
          let bool0 = false;
          val.srcData1.forEach((ele: any) => {
            if (el.fun_name === ele.fun_name) {
              bool0 = true;
            }
          });
          return bool0;
        });
        val.threadCheckedList = val.srcData.data.filter((el: any) => {
          let bool = false;
          val.threadCheckedList1.forEach((ele: any) => {
            if (el.fun_name === ele.fun_name) {
              bool = true;
            }
          });
          return bool;
        });
        val.selected = val.options.filter((el: any) => {
          let bool1 = false;
          val.selected1.forEach((ele: any) => {
            if (el.label === ele.label) {
              bool1 = true;
            }
          });
          return bool1;
        });
        return val;

      });
      this.pidColumns[0].selected = this.pidColumns[0].options;
      this.pidColumns[1].selected = this.pidColumns[1].options;

    }, 100);
  }

  // 展开函数详情
  public beforeToggleFun(row: TiTableRowData, i: any): void {
    row.showDetails = !row.showDetails;
  }

  /**
   * 切换tab页显示所有数据
   */
  public showAllData() {
    this.checkedListPid = [...this.threadSrcData.data];
    this.selectFunctionList = [...this.totalData];
  }
}
