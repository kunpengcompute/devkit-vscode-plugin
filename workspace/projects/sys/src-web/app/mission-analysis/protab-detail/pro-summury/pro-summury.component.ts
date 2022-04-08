import { Component, OnInit, Input } from '@angular/core';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import { AxiosService } from 'projects/sys/src-web/app/service/axios.service';
import { MytipService } from 'projects/sys/src-web/app/service/mytip.service';
import { TableService, BatchRequestService } from 'sys/src-com/app/service/index';
import { TiTableColumns, TiTableComponent, TiTableDataState, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';
@Component({
  selector: 'app-pro-summury',
  templateUrl: './pro-summury.component.html',
  styleUrls: ['./pro-summury.component.scss']
})
export class ProSummuryComponent implements OnInit {
  @Input() projectName: any;
  @Input() taskName: any;
  @Input() analysisType: any;
  @Input() isActive: any;
  @Input() taskid: any;
  @Input() nodeid: any;
  i18n: any;
  public cpuData: any;
  public diskData: any;
  public memData: any;
  public contextData: any;
  public syscallData: any;
  public resData: any;    // 请求得到的数据
  // 优化建议提示
  public suggestMsg: any = [];
  public obtainingProcessConfig = true;

  public language = 'zh';
  public expand = [false, false, false, false, false];
  constructor(
    public i18nService: I18nService,
    public Axios: AxiosService,
    public mytip: MytipService,
    public tableService: TableService,
    private batchRequest: BatchRequestService,
  ) {
    this.i18n = this.i18nService.I18n();
  }


  /**
   * 设置优化建议集合
   */
  public setSuggestions(data: any ) {
    if (data && data.suggestion && data.suggestion.length) {
      const suggestions = data.suggestion;
      suggestions.map((item: any ) => {
        this.suggestMsg.push({
          title: this.language === 'zh' ? item.title_chs : item.title_en,
          msgbody: this.language === 'zh' ? item.suggest_chs : item.suggest_en
        });
      });
    }
  }

  // 重新整理数据
  public getData(data: any, rData: any) {
    if (data != null) {
      Object.keys(data).forEach(key => {
        rData.srcData.data.push(data[key]);
      });
    }
    rData.totalNumber = rData.srcData.data.length;
  }

  // 确定初始展开状态
  public getList() {
    const allData = [this.cpuData, this.memData, this.diskData, this.contextData, ];
    for (let i = 0; i < allData.length; i++) {
      if (allData[i].srcData.data.length > 0) {
        this.expand[i] = true;
        allData[i].srcData.data[0].active = true;
        break;
      }
    }
  }

  // 整理syscall数据
  public getSyscall(data: any ) {
    if (data && Object.prototype.toString.call(data.syscall) === '[object Object]') {
      this.syscallData.srcData.data = Object.keys(data.syscall).map((second, index) => {
        return {
          index,
          pid: `PID ${data.pid[index]}`,
          time: data['%time'][index],
          second: data.seconds[index],
          usecs: data['usecs/call'][index],
          calls: data.calls[index],
          errors: data.errors[index] === 'NULL' ? null : data.errors[index],
          syscall: data.syscall[index],
        };
      });
      this.syscallData.totalNumber = this.syscallData.srcData.data.length;
    }
  }
  // 获取配置数据
  public async getprocessConfig() {
    const params = {
      'node-id': this.nodeid,
      'query-type': 'summary',
      'query-target': ''
    };

    this.obtainingProcessConfig = true;
    try {
      const res = await this.Axios.axios.get(`/tasks/${encodeURIComponent(this.taskid)}/process-analysis/`, {
        params,
        headers: {
          showLoading: false,
        },
      });
      this.obtainingProcessConfig = false;
      this.resData = res.data;
      const treeCpuData = this.getTreeData(this.resData.cpu_usage, 'cpu');
      const treeMemData = this.getTreeData(this.resData.mem_usage);
      const treeDiskData = this.getTreeData(this.resData.disk_usage);
      const treeContextkData = this.getTreeData(this.resData.context_info);
      this.getData(treeCpuData, this.cpuData);
      this.getData(treeMemData, this.memData);
      this.getData(treeDiskData, this.diskData);
      this.getData(treeContextkData, this.contextData);
      this.getSyscall(this.resData.syscall_info);
      this.batchRequest.threadCpuDataSheet = this.cpuData.srcData.data;
      this.batchRequest.threadMemDataSheet = this.memData.srcData.data;
      this.batchRequest.threadDiskDataSheet = this.diskData.srcData.data;
      this.batchRequest.threadContextDataSheet = this.contextData.srcData.data;
      this.batchRequest.sumRequest.next();
      this.getList();
    } catch (error) {
      this.obtainingProcessConfig = false;
    }
  }

  public getTreeData(data: any, type?: string) {
    this.setSuggestions(data);

    const returnData: any  = {};
    let tempPid = '';
    let index = 0;
    const pidTree: any = {};
    if (data != null) {
      Object.keys(data).forEach(key => {
        if (key.indexOf('P') > -1) {
          const addObj: any = {
            index: index++,
            title: 'PID ' + key.slice(4),
            active: false,
            expand: true, // 为了与微架构分析等表格排序一致，微架构分析是通过expand决定是否排序子元素
            disabled: false,
            pid: key,
          };
          returnData[key] = Object.assign(data[key], addObj);
          if (type === 'cpu'){
            returnData[key]['%system'] = returnData[key]['%sys'];
          }
          returnData[key].children = [];
          returnData[key].ID = key.slice(4);
          tempPid = key;
          pidTree[key] = [];
        } else if ((tempPid !== '') && (key !== 'suggestion')) {
          data[key].title = 'TID ' + key.slice(4);
          data[key].ID = key.slice(4);
          data[key].index = index++;
          data[key].disabled = false;
          data[key].tid = key;
          data[key].pid = tempPid;
          if (type === 'cpu'){
            data[key]['%system'] = data[key]['%sys'];
          }
          returnData[tempPid].children.push(data[key]);
          pidTree[tempPid].push(key);
        }
      });
    }
    return returnData;
  }






  public expandToggle(num: any ) {
    const bool = this.expand[num];
    this.expand[num] = !bool;
  }
  ngOnInit() {

    if (sessionStorage.getItem('language') === 'en-us') {
      this.language = 'en';
    } else {
      this.language = 'zh';
    }

    this.cpuData = {
      active: true,
      title: [
        { name: 'PID/TID', tip: this.i18n.process.sum.pid, sortKey: 'ID', compareType: 'number' },
        { name: '%user', tip: this.i18n.process.sum.cpu.usr, sortKey: '%user' },
        { name: '%system', tip: this.i18n.process.sum.cpu.sys, sortKey: '%sys' },
        { name: '%wait', tip: this.i18n.process.sum.cpu.wait, sortKey: '%wait' },
        { name: '%CPU', tip: this.i18n.process.sum.cpu.cpu, sortKey: '%CPU' },
        { name: 'Command', tip: this.i18n.process.sum.command, sortKey: '' },
      ],
      data: [], // 原始数据
      displayed: [],
      srcData: {
        data: [], state: {
          searched: false, // 源数据未进行搜索处理
          sorted: false, // 源数据未进行排序处理
          paginated: false,
        }
      },
      currentPage: 1,
      totalNumber: 0,
      pageSize: {
        options: [10, 20, 30, 50],
        size: 10
      },
    };

    this.memData = {
      active: false,
      title: [
        { name: 'PID/TID', tip: this.i18n.process.sum.pid, sortKey: 'ID', compareType: 'number' },
        { name: 'Minflt/s', tip: this.i18n.process.sum.mem.min, sortKey: 'minflt/s' },
        { name: 'Majflt/s', tip: this.i18n.process.sum.mem.maj, sortKey: 'majflt/s' },
        { name: 'VSZ', tip: this.i18n.process.sum.mem.vsz, sortKey: 'VSZ' },
        { name: 'RSS', tip: this.i18n.process.sum.mem.rss, sortKey: 'RSS' },
        { name: '%MEM', tip: this.i18n.process.sum.mem.mem, sortKey: '%MEM' },
        { name: 'Command', tip: this.i18n.process.sum.command, sortKey: '' },
      ],
      data: [],
      displayed: [],
      srcData: { data: [], state: {
        searched: false, // 源数据未进行搜索处理
        sorted: false, // 源数据未进行排序处理
        paginated: false,
      } },
      currentPage: 1,
      totalNumber: 0,
      pageSize: {
        options: [10, 20, 30, 50],
        size: 10
      },
    };

    this.diskData = {
      active: false,
      title: [
        { name: 'PID/TID', tip: this.i18n.process.sum.pid, sortKey: 'ID', compareType: 'number' },
        { name: 'kB_rd/s', tip: this.i18n.process.sum.disk.wr, sortKey: 'kB_rd/s' },
        { name: 'kB_wr/s', tip: this.i18n.process.sum.disk.rd, sortKey: 'kB_wr/s' },
        { name: 'iodelay', tip: this.i18n.process.sum.disk.iodelay, sortKey: 'iodelay' },
        { name: 'Command', tip: this.i18n.process.sum.command, sortKey: '' },
      ],
      data: [],
      displayed: [],
      srcData: { data: [], state: {
        searched: false, // 源数据未进行搜索处理
        sorted: false, // 源数据未进行排序处理
        paginated: false,
      } },
      currentPage: 1,
      totalNumber: 0,
      pageSize: {
        options: [10, 20, 30, 50],
        size: 10
      },
    };

    this.contextData = {
      active: false,
      title: [
        { name: 'PID/TID', tip: this.i18n.process.sum.pid, sortKey: 'ID', compareType: 'number' },
        { name: 'cswch/s', tip: this.i18n.process.sum.context.cswch, sortKey: 'cswch/s' },
        { name: 'nvcswch/s', tip: this.i18n.process.sum.context.nvcswch, sortKey: 'nvcswch/s' },
        { name: 'Command', tip: this.i18n.process.sum.command },
      ],
      data: [],
      displayed: [],
      srcData: { data: [], state: {
        searched: false, // 源数据未进行搜索处理
        sorted: false, // 源数据未进行排序处理
        paginated: false,
      } },
      currentPage: 1,
      totalNumber: 0,
      pageSize: {
        options: [10, 20, 30, 50],
        size: 10
      },
    };

    this.syscallData = {
      active: false,
      pid: '',
      title: [
        { name: 'PID/TID', tip: this.i18n.process.sum.pid, prop: 'pid', sortKey: 'pid', compareType: 'number' },
        { name: '%time', tip: this.i18n.process.sum.syscall.time, prop: 'time', sortKey: 'time' },
        { name: 'seconds/s', tip: this.i18n.process.sum.syscall.seconds, prop: 'second', sortKey: 'second' },
        { name: 'usecs/call(s)', tip: this.i18n.process.sum.syscall.usecs, prop: 'usecs', sortKey: 'usecs' },
        { name: 'calls', tip: this.i18n.process.sum.syscall.calls, prop: 'calls', sortKey: 'calls' },
        { name: 'errors', tip: this.i18n.process.sum.syscall.errors, prop: 'errors', sortKey: 'errors' },
        { name: 'syscall', tip: this.i18n.process.sum.syscall.syscall, prop: 'syscall', sortKey: 'syscall' },
      ],
      data: [],
      displayed: [],
      srcData: { data: [], state: {
        searched: false, // 源数据未进行搜索处理
        sorted: false, // 源数据未进行排序处理
        paginated: false,
      } },
      currentPage: 1,
      totalNumber: 0,
      pageSize: {
        options: [10, 20, 30, 50],
        size: 10
      },
    };

    setTimeout(() => {
      this.getprocessConfig();
    }, 50);
  }

  /**
   * 判断值 然后转换 解决数值为0的情况显示
   */
  getValue(val: any ) {
    if (val.value || val.value === 0) { // 判断是不是Object
      return val.value;
    }
    return val;
  }

  /**
   * 手动分页
   */
  public cpuPageUpdate(e: any , type?: any ) {
    const beginNum = e.size * (e.currentPage - 1);
    const endNum = e.size * e.currentPage;
    const that: any = this;
    that[type].srcData.data = that[type].data.slice(beginNum, endNum);
  }
}
