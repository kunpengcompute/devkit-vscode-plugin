import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy, Renderer2, Input } from '@angular/core';
import { MessageService } from '../../service/message.service';
import { AxiosService } from '../../service/axios.service';
import { Router } from '@angular/router';
import { I18nService } from '../../service/i18n.service';
import { Subscription } from 'rxjs';
import { ProfileDownloadService } from '../../service/profile-download.service';
import { TiTreeNode, TiDragService, TiValidationConfig, TiValidators } from '@cloud/tiny3';
import { ProfileCreateService } from '../../service/profile-create.service';
import { LibService } from '../../service/lib.service';
import { MytipService } from '../../service/mytip.service';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { RegularVerify } from 'projects/java/src-com/app/utils/regular-verify';
import * as echarts from 'echarts/core';

@Component({
  selector: 'app-profile-thread',
  templateUrl: './profile-thread.component.html',
  styleUrls: ['./profile-thread.component.scss'],
})
export class ProfileThreadComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() offlineThreadDump: boolean; // 是否是从离线报告，内存转储进入
  @Input() offlineThreadDumpId: string;
  constructor(
    private router: Router,
    public regularVerify: RegularVerify,
    public i18nService: I18nService,
    private msgService: MessageService,
    private Axios: AxiosService,
    private el: ElementRef,
    public profileDownload: ProfileDownloadService,
    public createProServise: ProfileCreateService,
    public libService: LibService,
    public mytip: MytipService,
    private dragService: TiDragService,
    private renderer2: Renderer2,
    public fb: FormBuilder,
  ) {
    this.i18n = this.i18nService.I18n();
    this.obersverOptions = [
      { label: this.i18n.newLockGraph.lock, value: 'lock' },
      { label: this.i18n.newLockGraph.thread, value: 'thread' }
    ];
    this.obersverSelect = this.obersverOptions[0];
    this.saveReportForm = fb.group({
      reportName: new FormControl('', this.regularVerify.reportNameValid(this.i18n)),
      reporRemark: new FormControl('', this.regularVerify.reportRemarkValid(this.i18n))
    });
  }
  @ViewChild('diffIns') diffIns: any;
  @ViewChild('lockGraph') lockGraph: any;
  @ViewChild('lockGraph2') lockGraph2: any;
  @ViewChild('deleteOne') deleteOne: any;
  @ViewChild('showFullEl') showFullEl: ElementRef;
  @ViewChild('draggable') draggableEl: ElementRef;
  @ViewChild('saveThreadDump') saveThreadDump: any;
  i18n: any;
  public leftState: any = false;
  public saveReportForm: FormGroup;
  public currentHover: any = '';
  public currentTabName = '';
  public threadTabs: any = [];
  public echartsInstance: any;
  public updateOptions: any;
  public echartsContainerHeight: number;
  public xLabels: Array<string> = [];
  private initChartFlag = true;
  public timeChartBox: number;
  public tableData: any;
  public baseTop = 0;
  public gridHeight = 16;
  public gridInertvalHeight = 32;
  public startTime = 0;
  public endTime = 0;
  public uuid: any;
  public sData = {};
  public fake: any = [];
  public getDatas: any = {
    spec: [],
    values: {},
  };

  public currentFile: any;
  public activeFile = -1;
  public fileList: Array<any> = [];
  public activeGraph = -1;

  public typeOptions: any = {};
  public typeSelected: any;
  public chartType = 'graph';
  public showSearch: any = true;

  // graph部分
  public currentGraphFile: any;
  public graphOption: any;
  public echartsIntance: any;
  public graphData: any;
  public graphLinks: any;
  private selGraphLinks: any = [];
  public graphDescs: Array<any> = [];
  public deadlockNum = 0;
  private symbol = 'rect'; // 关系图节点标记的形状

  public getDataTimer: any = null;
  public dataLens = 0;

  private isStopMsgSub: Subscription;
  private threadSub: Subscription;
  public startBtnDisabled: false;
  public threadWorker: any = null;
  private defaultOptions: any = [];

  public activeFileBak = 0;

  public preSelectedId = '';

  public relateIdx = 1;
  public fileIdx = 1;
  public sourceX = 150;
  public targetX = 550;

  public option: any = {
    legend: {
      data: [],
      type: 'scroll',
      icon: 'circle',
      top: this.baseTop,
      algin: 'left',
      right: 50,
    },
    // dataZoom: [],
    tooltip: {},
    axisPointer: {
      link: [{ xAxisIndex: 'all' }],
      snap: true,
    },
    grid: [],
    xAxis: [],
    yAxis: [],
    series: [],
  };
  public isDownload = false;
  private downloadWorker: any = null;

  public obersverSwitch = false;
  public obersverOptions: any = [];
  public obersverSelect: any;
  public compareSwitch = false;
  public compareOptions: any = [];
  public compareSelect: any;
  public currentThreadTime: string;
  public compareThreadTime: string;
  public threadDumpNodata = '';
  public noDataMsg = '';
  public oldThread: any = [];
  public count = 1;
  public diffThread: any = [];
  public innerData: Array<TiTreeNode> = [];
  public innerDataGraph: Array<TiTreeNode> = [];
  public multiple = false; // 是否多选
  public multipleGraph = false; // 是否多选
  public selectedData: any = {};
  public newThreadData: any = {
    default: {},
    opts: {},
    parsed: {
      spec: [],
      values: {}
    },
    xLabels: []
  };
  public scrollNum = 0;
  public searchValue = '';
  public selectOptions: any = [];
  public selectValue: any = [];
  public scrollTopPublic = 0;
  public specDataArr: any = {
    spec: [],
    values: {}
  };
  public deleteItems: any = {};
  // 切换保存数据
  public optionParsed: any = {
    spec: [],
    values: {},
  };
  private visivableMin = 0;
  private visivableMax = 36;
  public clickOver: any = true;
  public selectCount: any = true;
  public selectCountGraph: any = true;
  public echartsObj: any;
  public isLoading: any = false;
  public wheelShowScale = 1;
  public isLoadingList: any = false;
  // 保存报告
  public threadDumpList: number;
  public hoverClose = '';
  public sugReport = true;
  public saveRecordOptions: Array<any> = [];
  public saveRecordSelecteds: any = [];
  public reportNameHolder: string;
  public saveThreaddumpId: string;
  public saveReport = false;
  // 表单验证部分
  public reportNameValidation: TiValidationConfig = {
    type: 'blur',
  };
  public reportRemarkValidation: TiValidationConfig = {
    type: 'blur',
  };
  public reportName: string;
  public reportRemarks: string;
  public guardianId: any;
  public jvmId: any;
  public startTimes: Array<any> = [];
  public saveReportTip: string;
  public successSaveReportTip: string;
  public isOfflineLoading: any = false;
  public startTimesBtnDisable = false;
  public isAlermDisk = false;  // 工作空间
  ngOnInit() {
    this.isAlermDisk = this.profileDownload.downloadItems.isAlermDisk;
    this.saveReportTip = this.i18nService.I18nReplace(this.i18n.profileMemorydump.saveHeapDump.saveReportTip, {
      0: this.i18n.common_term_thread_dump,
    });
    this.successSaveReportTip =
     this.i18nService.I18nReplace(this.i18n.profileMemorydump.saveHeapDump.successSaveReportTip, {
      0: this.i18n.common_term_thread_dump,
    });
    // 报存报告
    this.threadDumpList = this.profileDownload.downloadItems.report.threaddumpList;
    // 报告输入提示语
    this.reportNameHolder = this.i18n.profileMemorydump.saveHeapDump.reportNameHolder;
    this.guardianId = sessionStorage.getItem('guardianId');
    this.jvmId = sessionStorage.getItem('jvmId');
    // 直方图支配树切换
    this.typeOptions = [
      {
        label: this.i18n.protalserver_profiling_thread.graph,
        id: 'graph'
      },
      {
        label: this.i18n.protalserver_sampling_thread.raw,
        id: 'raw'
      }
    ];
    this.typeSelected = this.typeOptions[0];
    this.chartType = this.typeOptions[0].id;
    this.echartsObj = echarts;
    this.isDownload = JSON.parse(sessionStorage.getItem('download_profile'));
    this.startBtnDisabled = JSON.parse(sessionStorage.getItem('isProStop'));
    if (this.offlineThreadDump) {
      this.fileList = [];
      this.currentTabName = 'dump';
      this.getThreadDumpReportData();
    } else {
      this.fileList = this.profileDownload.downloadItems.thread.threadDump;
      // 判断是否是导入操作
      if (this.isDownload && this.profileDownload.downloadItems.innerDataTabs.length) {
        this.threadTabs = this.profileDownload.downloadItems.innerDataTabs[0].children[1].children;
        if (this.threadTabs.length) {
          this.threadTabs.forEach((item: any, i: number) => {
            item.tabName = this.createProServise.innerDataTabs[0].children[1].children[i].tabName;
          });
        }
        const checkedArr = this.threadTabs.filter((item: any) => {
          return item.checked;
        });
        const index = this.threadTabs.findIndex((e: any) => e === checkedArr[0]);
        let tempTimer = setTimeout(() => {
          this.toggleTab(index);
          clearTimeout(tempTimer);
          tempTimer = null;
        }, 100);
        this.threadTabs[1].checked = false;
      } else {
        this.threadTabs = this.createProServise.innerDataTabs[0].children[1].children;
        this.threadTabs.forEach((item: any) => {
          item.active = false;
        });
        this.threadTabs[0].active = true;
      }
    }

    this.selectOptions = [
      {
        label: this.i18n.protalserver_profiling_thread.show_more,
        type: 'all'
      },
      {
        label: this.i18n.protalserver_profiling_thread.show_runnable,
        type: 'Runnable'
      },
      {
        label: this.i18n.protalserver_profiling_thread.show_waiting,
        type: 'Waiting'
      },
      {
        label: this.i18n.protalserver_profiling_thread.show_blocked,
        type: 'Blocked'
      },
    ];
    this.selectValue = [this.selectOptions[0], this.selectOptions[1], this.selectOptions[2], this.selectOptions[3]];
    this.noDataMsg = this.i18n.profileNoData.threadNoDataMsg;
    if (this.offlineThreadDump) {
      this.threadDumpNodata = this.i18n.common_term_task_nodata;
    } else {
      this.threadDumpNodata = this.i18n.profileNoData.threadDumpNodata;
    }
    this.currentFile = {};
    if (!this.isDownload) {
      this.getCurrentTab();
    }
    this.isStopMsgSub = this.msgService.getMessage().subscribe((msg) => {
      if (msg.type === 'isStopPro') {
        this.stopData();
        this.startBtnDisabled = msg.isStop;
        if (this.threadWorker) { this.threadWorker.terminate(); }
      }
      if (msg.type === 'isRestart') {
        this.startBtnDisabled = false;
        this.fileList = [];
        this.xLabels = [];
        this.newThreadData.xLabels = [];
        this.profileDownload.downloadItems.thread.threadList = [];
        this.newThreadData.parsed.spec = [];
        this.getDatas.spec = [];
        this.getWorkerData();
      }
      if (msg.type === 'isClear') {
        if (this.threadWorker) { this.threadWorker.terminate(); }
        this.fileList = [];
        this.xLabels = [];
        this.getDatas.spec = [];
        this.getWorkerData();
      }
      if (msg.type === 'isClearOne') {
        const tabs = this.threadTabs.filter((item: any) => {
          return item.active;
        });
        if (tabs[0].link === 'list') {
          if (this.threadWorker) { this.threadWorker.terminate(); }
          this.xLabels = [];
          this.getDatas.spec = [];
          this.getWorkerData();
        } else {
          this.fileList = [];
          this.profileDownload.downloadItems.thread.threadDump = [];
        }
      }
      if (msg.type === 'exportData') {
        this.downloadData();
      }
      if (msg.type === 'setDeleteOne') {
        if (this.currentTabName === 'list') {
          if (this.getDatas.spec.length === 0) {
            this.msgService.sendMessage({
              type: 'getDeleteOne',
              isNoData: 'true',
            });
          } else {
            this.msgService.sendMessage({
              type: 'getDeleteOne',
              isNoData: 'false',
            });
          }
        } else if (this.currentTabName === 'dump' || this.currentTabName === 'graph') {
          if (this.fileList.length === 0) {
            this.msgService.sendMessage({
              type: 'getDeleteOne',
              isNoData: 'true',
            });
          } else {
            this.msgService.sendMessage({
              type: 'getDeleteOne',
              isNoData: 'false',
            });
          }
        }
      }
    });
    if (this.profileDownload.downloadItems.thread.selectValue.length) {
      this.selectValue = [];
      this.selectOptions.forEach((item: any, index: any) => {
        this.profileDownload.downloadItems.thread.selectValue.forEach((ele: any) => {
          if (item.type === ele.type) {
            this.selectValue.push(this.selectOptions[index]);
          }
        });
      });
    }
    this.searchValue = this.profileDownload.downloadItems.thread.searchValue;
    this.getDatas.spec = this.profileDownload.downloadItems.thread.parsedSpec;
    this.newThreadData.parsed.spec = this.getDatas.spec;
    this.getDatas.values = this.profileDownload.downloadItems.thread.parsedValues;
    this.newThreadData.parsed.values = this.getDatas.values;
    if (this.isDownload) {
      const threadList = this.profileDownload.downloadItems.thread.threadList;
      if (Object.keys(threadList).length) { this.handleDownloadData(threadList); }
      if (this.fileList.length) {
        this.currentFile = this.fileList[0];
      }
      this.tableData = this.profileDownload.downloadItems.thread.updateOptions;
      this.onSelect(this.selectValue);
      return;
    } else {
      const threadList = this.profileDownload.dataSave.thread.threadList;
      if (Object.keys(threadList).length) { this.handleDownloadData(threadList); }
      if (this.fileList.length) {
        this.currentFile = this.fileList[0];
      }
      this.tableData = this.profileDownload.dataSave.thread.updateOptions;
    }
    if (this.startBtnDisabled) {
      this.onSelect(this.selectValue);
    }
    this.getWorkerData();
  }
  public getWorkerData() {
    if (typeof Worker !== 'undefined') {
      this.threadWorker = new Worker('./assets/worker/thread.worker.js');
      if (this.threadWorker) {
        this.threadWorker.postMessage({
          type: 'historyData',
          data: {
            parsed: this.getDatas,
            xLabels: this.xLabels
          }
        });
      }
      this.threadWorker.onmessage = ({ data }: any) => {
        this.newThreadData = data;
        this.onSelect(this.selectValue);
        this.removeData();

        this.xLabels = this.newThreadData.xLabels;
        this.optionParsed = { ...this.newThreadData.parsed };
        this.defaultOptions = JSON.parse(JSON.stringify(this.getDatas.spec));
        if (this.threadWorker) {
          this.threadWorker.postMessage({
            type: 'default',
            data: this.defaultOptions
          });
        }
        this.echartsContainerHeight =
          this.newThreadData.parsed.spec.length * this.gridHeight +
          (this.newThreadData.parsed.spec.length + 1) * this.gridInertvalHeight;
        this.timeChartBox =
          this.newThreadData.parsed.spec.length * this.gridHeight +
          (this.newThreadData.parsed.spec.length + 1) * this.gridInertvalHeight +
          this.baseTop * 2;
        if (this.initChartFlag) { this.initChart(this.updateOptions); }
        this.ngScroll();
      };
    }
  }
  public ngScroll() {
    if (!document.querySelector('#time-echart-box')) { return; }
    const ascroll = document.querySelector('#time-echart-box');
    ascroll.addEventListener('scroll', this.debounce(this.handleScroll(), 1000));
  }
  public handleScroll() {
    const scrollTop = document.querySelector('#time-echart-box').scrollTop;
    const scrollDiff = scrollTop - this.scrollTopPublic;
    const scrollHeight = document.querySelector('#time-echart-box').clientHeight;
    const screenNum = Math.ceil(scrollTop / scrollHeight);
    const screenDiff = screenNum - this.scrollTopPublic;
    this.scrollTopPublic = screenNum;
    if (Math.abs(screenDiff) > 0) {
      // 执行事件
      this.scrollFun(screenDiff);
    }
  }
  public debounce(fn: any, wait: any) {
    let timeout: any = null;
    return () => {
      if (timeout !== null) { clearTimeout(timeout); }
      timeout = setTimeout(fn, wait);
    };
  }
  public rmScroll() {
    if (document.querySelector('#time-echart-box')) {
      const targetScroll = document.querySelector('#time-echart-box');
      targetScroll.removeEventListener('scroll', this.ngScroll);
    }
  }
  public removeData() {
    const specArr: any = [];
    this.newThreadData.parsed.spec.forEach((item: any, index: any) => {
      specArr.push(item);
    });
    this.getDatas.spec = specArr;
  }
  public scrollFun(event: any) {
    const screenNum = Math.abs(event);
    let min = this.visivableMin;
    let max = this.visivableMax;
    if (event < 0) {
      min = min - 12 * screenNum < 0 ? 0 : min - 12 * screenNum;
      max = min + 36;
    } else {
      const len = Object.values(this.newThreadData.parsed.values).length;
      max = max + 12 * screenNum < len ? max + 12 * screenNum : len;
      min = max - 36;
    }
    this.visivableMin = min;
    this.visivableMax = max;
  }
  private handleDownloadData(datas: any) {
    const downloadData = datas.data;
    const keys = downloadData && Object.keys(downloadData);
    if (keys && !keys.length) { return; }
    this.getDatas.spec = [];
    this.xLabels = datas.xLabels;
    for (const key of keys) {
      const keyArr = key.split('(');
      const id = keyArr[1].slice(0, -1);
      this.getDatas.values[id] = downloadData[key];
      this.getDatas.spec.push({
        name: keyArr[0],
        id
      });
    }
    this.newThreadData.opts = this.profileDownload.downloadItems.thread.updateOptions;
    this.echartsContainerHeight = this.getDatas.spec.length * this.gridHeight +
      (this.getDatas.spec.length + 1) * this.gridInertvalHeight;
    this.timeChartBox = this.getDatas.spec.length * this.gridHeight +
      (this.getDatas.spec.length + 1) * this.gridInertvalHeight + this.baseTop * 2;
  }
  ngAfterViewInit() {
    this.profileDownload.downloadItems.currentTabPage = this.i18n.protalserver_profiling_thread.list;
    this.ngScroll();
    this.threadSub = this.msgService
      .getMessage()
      .subscribe((data) => {
        if (data.type === 'updata_thread') {
          const newData = data.data;
          this.getSpecData(newData);
          if (this.count > 1) {
            this.diffThread = this.getDiffArr(newData.thread, this.oldThread);
          }
          this.oldThread = newData.thread;
          this.count++;
          this.startTime = 0;
          this.endTime = data.endTime + 1000;
          if (this.threadWorker) {
            this.threadWorker.postMessage({
              type: 'ws',
              data: newData
            });
          }
        }
      });
    let tempTimer = setInterval(() => {
      this.changeParseSel(this.fileList[0], 0);
      if (this.fileList.length) {
        clearInterval(tempTimer);
        tempTimer = null;
      }
    }, 200);
    if (this.offlineThreadDump) {
      let tempDraggable = setInterval(() => {
        this.onSetDraggable();
        if (this.draggableEl) {
          clearInterval(tempDraggable);
          tempDraggable = null;
        }
      }, 200);
    }

  }
  public getSpecData(newData: any) {
    newData.thread.forEach((thread: any) => {
      const datas = this.specDataArr.spec.filter((item: any) => {
        return thread.threadId === item.id;
      });
      if (datas.length === 0) {
        this.specDataArr.spec.push({
          name: thread.threadName,
          id: thread.threadId
        });
      }
    });
    if (!this.specDataArr.spec.length) {
      return;
    }
    const endTime = newData.endTime;
    const startTimeItem = newData.startTime;
    this.specDataArr.spec.forEach((item: any, index: any) => {
      const curThread = newData.thread.filter((thr: any) => {
        return thr.threadId === item.id;
      });
      if (!this.specDataArr.values[item.id]) {
        this.specDataArr.values[item.id] = [];
        this.deleteItems[item.id] = 0;
      }
      this.specDataArr.values[item.id].push({
        start: startTimeItem,
        end: endTime,
        status: curThread.length && curThread[0].threadState || ''
      });
      if (curThread.length && curThread[0].threadState) {
        this.deleteItems[item.id] += 1;
      } else {
        this.deleteItems[item.id] -= 1;
      }
      if (this.deleteItems[item.id] < 3 && this.specDataArr.values[item.id].length >= 8) {
        delete this.deleteItems[item.id];
        delete this.specDataArr.values[item.id];
        this.specDataArr.spec.splice(index, 1);
      } else { }
    });
  }
  ngOnDestroy(): void {
    this.startTimesBtnDisable = false;
    this.rmScroll();
    this.optionParsed.spec = this.newThreadData.parsed.spec;
    this.optionParsed.values = this.newThreadData.parsed.values;
    this.downloadData();
    if (this.isStopMsgSub) { this.isStopMsgSub.unsubscribe(); }
    if (this.threadSub) { this.threadSub.unsubscribe(); }
    if (this.threadWorker) { this.threadWorker.terminate(); }
    this.msgService.sendMessage({ type: 'getDeleteOne', });  // 清除本页面的发送事件
    if (this.downloadWorker) { this.downloadWorker.terminate(); }
  }

  public downloadData() {
    const downloadEchartData: any = {
      xLabels: [],
      data: {}
    };

    for (const spec of this.optionParsed.spec) {
      if (this.optionParsed.values != null) {
        for (const key of Object.keys(this.optionParsed.values)) {
          if (key && parseInt(key, 10) === spec.id) {
            downloadEchartData.data[`${spec.name}(${spec.id})`] = this.optionParsed.values[key].slice();
          }
        }
      }
    }
    downloadEchartData.xLabels = this.xLabels;
    this.profileDownload.downloadItems.thread.updateOptions = this.newThreadData.opts;
    this.profileDownload.downloadItems.thread.searchValue = this.searchValue;
    this.profileDownload.downloadItems.thread.selectValue = this.selectValue;
    this.profileDownload.downloadItems.thread.threadList = downloadEchartData;
    this.profileDownload.downloadItems.thread.parsedSpec = this.newThreadData.parsed.spec;
    this.profileDownload.downloadItems.thread.parsedValues = this.newThreadData.parsed.values;
    this.profileDownload.dataSave.thread.updateOptions = this.newThreadData.opts;
    this.profileDownload.dataSave.thread.threadList = downloadEchartData;
  }
  public getDiffArr(array1: any, array2: any) {
    const result = [];
    for (const value2 of array2) {
      const obj = value2;
      const num = obj.threadId;
      let isExist = false;
      for (const value1 of array1) {
        const aj = value1;
        const n = aj.threadId;
        if (n === num) {
          isExist = true;
          break;
        }
      }
      if (!isExist) {
        result.push(obj);
      }
    }
    return result;
  }
  public getDumpData() {
    this.multiple = false;
    if (this.startBtnDisabled) { return; }
    this.fileList.forEach((item) => {
      item.isOpen = false;
    });
    const guardianId = sessionStorage.getItem('guardianId');
    const params = {
      jvmId: sessionStorage.getItem('jvmId'),
    };
    this.isLoading = true;
    this.Axios.axios
      .post(`/guardians/${guardianId}/cmds/dump-thread`, params, { headers: { showLoading: false } })
      .then((resp: any) => {
        this.isLoading = false;
        this.getFiles(resp);
      })
      .catch((err: any) => {
        this.isLoading = false;
      });
  }
  /**
   * 线程转储
   */
  public getThreadDumpReportData() {
    this.isOfflineLoading = true;
    this.Axios.axios
      .post(`/threadDump/${this.offlineThreadDumpId}`)
      .then((resp: any) => {
        if (resp.data.length > 0) {
          resp.data.forEach((item: any) => {
            this.getFiles(item);
          });
        }
        this.isOfflineLoading = false;
      })
      .catch((err: any) => {
        this.isOfflineLoading = false;
      });
  }

  public dumpHandle() {
    // 报存报告
    this.threadDumpList = this.profileDownload.downloadItems.report.threaddumpList;
    if (this.clickOver) {
      this.clickOver = false;
      this.getDumpData();
      let tempTimer = setTimeout(() => {
        this.clickOver = true;
        clearTimeout(tempTimer);
        tempTimer = null;
      }, 1000);
    }
  }
  private getFiles(resp: any) {
    const itemFile: any = {};
    itemFile.name = this.libService.dateFormat(resp.startTime, 'yyyy/MM/dd hh:mm:ss');
    itemFile.startTime = resp.startTime;
    itemFile.isOpen = false;
    itemFile.expanded = false;
    itemFile.checked = false;
    itemFile.files = [];
    itemFile.children = itemFile.files;
    itemFile.deadlockNum = 0;
    itemFile.content = resp.content;
    const content = resp.content;
    const files = content.split('\n\n');
    const deadlockReg = /Found\s+\d+\s+deadlock./;
    const deadLockStrIdx = files.findIndex((item: any) => {
      return deadlockReg.test(item);
    });
    if (deadLockStrIdx >= 0) {
      const deadlock = files[deadLockStrIdx].match(/\d+/);
      itemFile.deadlockNum = deadlock[0];
    }
    const reg = /\s+#\d+\s+/;
    const deadLockThreads: any = [];
    const deadLockStrReg = /Found one Java-level deadlock:/;
    files.forEach((file: any) => {
      const matchObj = file.match(reg);
      if (matchObj) {
        itemFile.files.push({
          fileName: file.slice(1, matchObj.index - 1),
          name: file.slice(1, matchObj.index - 1),
          content: file.slice(matchObj.index + matchObj[0].length),
          isActive: itemFile.files.length === 0,
          disabled: false
        });
      }
      if (deadLockStrReg.test(file)) {
        const threads = file.split('\n');
        threads.forEach((item: any, index: any) => {
          if (deadLockStrReg.test(item)) { return; }
          const idx = item.indexOf(':');
          if (idx >= 0) {
            deadLockThreads.push({
              type: 'deadLockThread',
              name: item.slice(1, idx - 1),
            });
          }
        });
      }
    });
    itemFile.files = itemFile.files.concat(deadLockThreads);
    this.fileList.push(itemFile);
    this.handleCompareList(0);
    if (!this.offlineThreadDump) {
      this.profileDownload.downloadItems.thread.threadDump = JSON.parse(JSON.stringify(this.fileList));
      this.mytip.alertInfo({
        type: 'success',
        content: this.i18n.protalserver_sampling_tab.dumpSuccess,
        time: 3500
      });
    }
  }
  public openfilesToggle(index: any) {
    const rootFile = this.fileList[index];
    rootFile.isOpen = !rootFile.isOpen;
    this.fileList.forEach((item, idx) => {
      if (index !== idx) { item.isOpen = false; }
    });

    if (rootFile.isOpen) {
      this.activeFileBak = index;
      this.currentFile = rootFile.files.find((file: any) => {
        return file.isActive;
      });
      let tempTimer = setTimeout(() => {
        this.diffIns.diff(this.currentFile);
        clearTimeout(tempTimer);
        tempTimer = null;
      }, 500);
    }
    this.activeFile = -1;
  }

  /**
   * 获取原始数据
   */
  public getAllContent(file: any) {
    this.isLoadingList = true;
    if (file.children) {
      const index = this.fileList.findIndex(e => e === file);
      this.activeFile = index;
    }
    let tempTimer = setTimeout(() => {
      this.diffIns?.diff(file);
      this.isLoadingList = false;
      clearTimeout(tempTimer);
      tempTimer = null;
    }, 1000);
    this.fileList.forEach((item) => {
      item.expended = false;
    });
  }

  toggleTab(index: any) {
    this.threadTabs.forEach((tab: any) => {
      tab.active = false;
    });
    this.threadTabs[index].active = true;
    this.profileDownload.downloadItems.currentTabPage =
     this.i18n.protalserver_profiling_thread[this.threadTabs[index].link];
    this.getCurrentTab();
  }

  private getCurrentTab() {
    const currentTab = this.threadTabs.find((tab: any) => {
      return tab.active;
    });
    this.currentTabName = currentTab.link;
    if (this.fileList.length) {
      this.typeChange(currentTab);
    }
    if (this.currentTabName === 'dump' && this.chartType === 'graph') {
      let tempDraggable = setInterval(() => {
        this.onSetDraggable();
        if (this.draggableEl) {
          clearInterval(tempDraggable);
          tempDraggable = null;
        }
      }, 200);
    }
  }

  /**
   * 获取原始数据/锁分析图类型
   */
  public typeChange(data: any) {
    if (data.link === 'dump' && this.chartType === 'raw') {
      this.activeFile = !this.isDownload ? this.activeGraph : 1;
      this.getAllContent(this.fileList[this.activeFile]);
    } else if (data.link === 'dump' && this.chartType === 'graph') {
      this.activeGraph = this.activeFile !== -1 ? this.activeFile : this.activeFileBak;
      this.changeParseSel(this.fileList[0], 0);
    }
    this.preSelectedId = data.link;
  }

  /**
   * 原始数据/锁分析图切换
   */
  public typeHasChange(data: any): void {
    this.chartType = data.id;
    if (data.id === 'graph') {
      this.typeSelected = this.typeOptions[0];
      this.activeGraph =
        this.activeFile !== -1 ? this.activeFile : this.activeFileBak;
      this.changeParseSel(this.fileList[this.activeGraph], this.activeGraph);
    } else {
      this.typeSelected = this.typeOptions[1];
      this.activeFile = !this.isDownload ? this.activeGraph : 0;
      this.fileList[0].checked = true;
      this.getAllContent(this.fileList[0]);
    }
  }
  public changeParseSel(file: any, idx: any) {
    this.isLoadingList = true;
    this.currentGraphFile = file?.files;
    this.deadlockNum = file?.deadlockNum;
    this.activeGraph = idx;
    this.currentThreadTime = file?.name;
    this.handleCompareList(idx);
    let tempTimer = setTimeout(() => {
      this.handleFileNewData(file);
      this.isLoadingList = false;
      clearTimeout(tempTimer);
      tempTimer = null;
    }, 300);
  }
  private parseLock(files: any, selIdx: any) {
    this.graphData = [];
    this.graphLinks = [];
    this.selGraphLinks = [];
    this.relateIdx = 1;
    this.fileIdx = 1;
    const links: any = [];
    const graphData: any = [];
    const reg = /- waiting to lock|- locked/g;
    const relationIdReg = /<\w+>/;
    const echartsDom = this.el.nativeElement.querySelector('#graph_echarts');
    const deadLockThreads = files.filter((item: any) => {
      return item.type === 'deadLockThread';
    });
    deadLockThreads.forEach((thr: any) => {
      const idx = files.findIndex((item: any) => {
        return item.fileName === thr.name;
      });
      if (idx > 0) {
        const tar = files.splice(idx, 1);
        files.unshift(tar[0]);
      }
    });
    const graphFiles = files.filter((item: any) => {
      return item.content;
    });
    graphFiles.forEach((file: any, index: any) => {
      const content = file.content;
      const matched = content && content.match(reg);
      if (matched) {
        this.graphDatas(
          graphData,
          file.fileName,
          selIdx,
          index,
          false,
          this.sourceX,
          null
        );

        const lines = content.split('\n\t');
        lines.forEach((line: any) => {
          let lockedCount = 1;
          if (
            line.indexOf('- waiting to lock') !== -1 &&
            line.indexOf('no object reference available') === -1
          ) {
            const target = line.match(relationIdReg);
            this.graphDatas(
              graphData,
              target[0],
              selIdx,
              index,
              false,
              null,
              this.targetX
            );
            this.graphLinksFn(
              links,
              file.fileName,
              target[0],
              selIdx,
              index,
              false,
              graphData
            );
          }
          if (line.indexOf('- locked') !== -1) {
            const target = line.match(relationIdReg);
            this.graphDatas(
              graphData,
              target[0],
              selIdx,
              index,
              true,
              null,
              this.targetX
            );
            this.graphLinksFn(
              links,
              file.fileName,
              target[0],
              selIdx,
              index,
              true,
              graphData
            );
            lockedCount++;
          }
        });
      }
    });

    if (graphData.length <= 3) {
      graphData.forEach((item: any, idx: any) => {
        if (item.x === this.targetX) {
          graphData[idx].symbolOffset = [0, 0];
        }
      });
    }
    this.graphData = graphData;

    this.graphLinks = links;
    echartsDom.style.height = Math.max(this.fileIdx, this.relateIdx) * 100 + 'px';
    this.graphOption = this.setOptions();
    if (this.echartsIntance) {
      this.echartsIntance.clear();
      this.echartsIntance.setOption(this.graphOption, true);
    }
  }

  public handleClick(tar: any) {
    const selNode = tar.data;
    const fileIdx = this.currentGraphFile.findIndex((file: any) => {
      return file.fileName === selNode.name;
    });
    const delFile = this.currentGraphFile.splice(fileIdx, 1);
    this.currentGraphFile.unshift(delFile[0]);
    this.parseLock(this.currentGraphFile, 0);
  }

  private graphLinksFn(links: any, sourceName: any, targetName: any,
                       selIdx: any, index: any, isLock: any, graphData?: any) {
    const linkIdx = links.findIndex((item: any) => {
      return item.source === sourceName && item.target === targetName;
    });
    let lineColor = '#d4d9e6';
    if (graphData && graphData.length) {
      const idx = graphData.findIndex((item: any) => {
        return item.name === sourceName;
      });
      if (idx >= 0) {
        if (!isLock) {
          graphData[idx].itemStyle.color = 'rgba(244, 92, 94, 0.2)';
        }
        if (selIdx === index) {
          this.selGraphLinks = graphData.slice();
          const filterLockedLen = this.selGraphLinks.filter((item: any) => {
            return item.name !== sourceName && item.isLock;
          }).length;
          lineColor = filterLockedLen !== (this.selGraphLinks.length - 1) ? '#f45c5e' : '#08cc24';
          if (filterLockedLen !== this.selGraphLinks.length) {

          }
          graphData[idx].itemStyle.color = lineColor;
        }
      }
    }
    if (linkIdx === -1) {
      links.push({
        source: sourceName,
        target: targetName,
        lineStyle: {
          color: lineColor,
          type: isLock ? 'solid' : 'dash',
        },
      });
    }
  }

  private graphDatas(graphData: any, name: any, selIdx: any, index: any, isLock?: any, sourceX?: any, targetX?: any) {
    const gpIdx = graphData.findIndex((data: any) => {
      return data.name === name;
    });
    let color = '';
    let labelColor = '';
    let y = 0;

    if (sourceX) {
      color = selIdx === index ? '#F45C5E' : '#E4F9EC';
      labelColor = selIdx === index ? '#fff' : '#333';
      y = this.fileIdx * 100;
    } else {
      color = '#838A9B';
      labelColor = '#fff';
      y = this.relateIdx * 100;
    }

    if (gpIdx === -1) {
      graphData.push({
        name,
        x: sourceX || targetX,
        y,
        value: 4,
        symbol: this.symbol,
        symbolSize: [name.length * 8, 42],
        symbolOffset: sourceX ? ['-50%', 0] : ['35%', 0],
        itemStyle: {
          color,
        },
        label: {
          color: labelColor,
        },
        isLock
      });
      if (sourceX) { this.fileIdx++; }
      if (targetX) { this.relateIdx++; }
    }
  }

  private setOptions() {
    const option = {
      tooltip: {},
      animationDurationUpdate: 1500,
      animationEasingUpdate: 'quinticInOut',
      label: {
        fontSize: 13,
      },
      series: [
        {
          type: 'graph',
          layout: 'none',
          left: 'center',
          top: 100,
          roam: 'move',
          label: {
            normal: {
              show: true,
            },
          },
          edgeSymbol: ['none', 'arrow'],
          edgeSymbolSize: [4, 10],
          edgeLabel: {
            normal: {
              textStyle: {
                fontSize: 20,
              },
            },
          },
          // 所有节点数据
          data: this.graphData,
          // links: [],节点间的关系数据
          links: this.graphLinks,
          lineStyle: {
            normal: {
              opacity: 0.9,
              width: 2,
              curveness: 0,
            },
          },
        },
      ],
      xAxis: [
        this.makeXAxis(0, {
          axisLabel: {
            show: true,
            color: '#999',
            inside: true,
            margin: 108
          },
          axisPointer: {
            show: true,
            lineStyle: {
              color: '#478cf1',
              width: 1.5
            }
          }
        }),
        this.makeXAxis(1, {
          axisLabel: {
            show: false,
            color: '#999',
            inside: true,
            margin: 108
          }, // 坐标轴刻度标签的相关设置
          axisPointer: {
            show: true,
            lineStyle: {
              color: '#478cf1',
              width: 1.5
            }
          }
        }),
        this.makeXAxis(3, {
          axisLabel: {
            show: false,
            // color: this.ylabelColor,
            interval: 0
          }, // 坐标轴刻度标签的相关设置
          position: 'top',
          axisPointer: {
            show: true,
            lineStyle: {
              color: '#478cf1',
              width: 1.5
            }
          }
        })
      ]
    };
    return option;
  }

  public makeXAxis(gridIndex: any, opt: any) {
    const that = this;
    return this.echartsObj.util.merge(
      {
        type: 'time',
        gridIndex,
        axisLine: { onZero: false, lineStyle: { color: '#ddd' } },
        axisTick: { show: false },
        axisLabel: {
          show: false,
          interval: 0,
          formatter(value: any) {
            const label = that.formatLabel(value / 1000);
            return label;
          },
        },
        splitLine: { show: false, lineStyle: { color: '#ddd' } },
        min: this.startTime,
        max: this.endTime,
      },
      opt || {},
      true
    );
  }
  private formatLabel(time: any) {
    let str = '';
    let h: any = Math.floor(time / 3600);
    let m: any = Math.floor((time - h * 3600) / 60);
    let s: any = Math.floor(time - h * 3600 - m * 60);
    h = h < 10 ? '0' + h : h;
    m = m < 10 ? '0' + m : m;
    s = s < 10 ? '0' + s : s;
    str = h !== '00' ? `${h}:${m}:${s}` : `${m}:${s}`;
    return str;
  }
  public makeYAxis(gridIndex: any, opt: any) {
    return this.echartsObj.util.merge(
      {
        type: 'value',
        offset: 30,
        gridIndex,
        nameLocation: 'middle',
        nameTextStyle: {
          color: '#333',
        },
        show: false,
        boundaryGap: ['30%', '30%'],
        axisTick: { show: false },
        axisLine: { lineStyle: { color: '#ccc' } },
        axisLabel: { show: false },
        splitLine: { show: false },
      },
      opt || {},
      true
    );
  }

  public makeGrid(top: any, opt: any) {
    return this.echartsObj.util.merge(
      {
        top,
        left: 0,
        right: 60,
        height: this.gridHeight,
      },
      opt || {},
      true
    );
  }
  public initChart(initOpts: any) {
    if (!initOpts) { return; }
    this.option.grid = initOpts.grid;
    this.option.series = initOpts.series;
    this.option.xAxis = initOpts.xAxis;
    this.option.yAxis = initOpts.yAxis;
    this.initChartFlag = false;

    this.timeChartBox = this.echartsContainerHeight + this.baseTop * 2;
    $('#time-echart .right').css({ height: this.timeChartBox + 'px' });
    let tempTimer = setTimeout(() => {
      this.tableData = this.option;
      if (this.echartsInstance) {
        this.echartsInstance.clear();
        this.echartsInstance.setOption(this.tableData, true);
      }
      clearTimeout(tempTimer);
      tempTimer = null;
    }, 10);
  }
  public onChartInit(e: any) {
    this.echartsInstance = e;
  }

  public handleFileNewData(file: any) {
    this.lockGraph?.handleFileNewData(file);
  }
  public obersverSelectChange(obersver: any) {
    this.obersverSelect = obersver;
    this.lockGraph.currentTypeChange(obersver.value);
    if (this.compareSwitch) {
      this.obersverSelectChange2(obersver);
    }
  }
  public obersverSelectChange2(obersver: any) {
    if (obersver.value === 'lock') {
      this.lockGraph2.currentTypeChange('thread');
    } else {
      this.lockGraph2.currentTypeChange('lock');
    }
  }
  public compareSwitchChange() {
    const len = this.compareOptions.length;
    for (let i = 0; i < len; i++) {
      const item = this.compareOptions[i];
      if (item.disabled === true) {
        const index = i === (len - 1) ? i - 1 : i + 1;
        this.compareSelect = this.compareOptions[index];
        let tempTimer = setTimeout(() => {
          this.compareSelectChange(this.compareSelect);
          clearTimeout(tempTimer);
          tempTimer = null;
        }, 0);
      }
    }
  }
  public compareSelectChange(compare: any) {
    this.compareSelect = compare;
    if (this.compareSwitch) {
      const file = this.fileList[compare.value];
      this.compareThreadTime = compare.label;
      this.lockGraph2?.handleFileNewData(file);
      this.obersverSelectChange2(this.obersverSelect);
    }
  }
  public handleCompareList(idx: any) {
    this.compareOptions = this.fileList.map((item, index) => {
      return { label: item.name, value: index, disabled: index === idx };
    });
    if (!this.compareSelect) {
      this.compareSelect = this.compareOptions[idx];
      this.compareThreadTime = this.compareSelect?.name;
    }
  }
  /**
   * 线程转储多选全选删除
   */
  public showDelete(type?: any) {
    if (type) {
      if (this.multipleGraph) { return; }
      this.multipleGraph = true;
      this.selectCountGraph = true;
      this.innerDataGraph = [
        {
          name: this.i18n.common_term_clear_allData,
          expanded: true,
          checked: false,
          type: 'all',
          children: []
        }
      ];
      const graphList: any = [];
      this.fileList.forEach(item => {
        const graphItem: any = {};
        graphItem.name = item.name;
        graphItem.expanded = item.expanded;
        graphItem.checked = item.checked;
        graphList.push(graphItem);
      });
      this.innerDataGraph[0].children = graphList;
      this.innerDataGraph[0].children.forEach(item => {
        item.expanded = false;
        item.checked = false;
      });
      return;
    }
    if (this.multiple) { return; }
    this.multiple = true;
    this.selectCount = true;
    this.innerData = [
      {
        name: this.i18n.common_term_clear_allData,
        expanded: true,
        checked: false,
        type: 'all',
        children: []
      }
    ];
    this.innerData[0].children = this.fileList;
    this.innerData[0].children.forEach(item => {
      item.expanded = false;
      item.checked = false;
    });
  }
  /**
   * 确认删除线程转储
   */
  public doDelete() {
    if (this.multipleGraph) {
      const afterDelList = this.innerDataGraph[0].children.filter(item => {
        return !item.checked;
      });
      const result = afterDelList.map(item => item.name);
      this.fileList = this.fileList.filter(item => {
        return result.indexOf(item.name) > -1;
      });
      this.multipleGraph = false;
      this.profileDownload.downloadItems.thread.threadDump = this.fileList;
      return;
    }
    this.fileList = this.innerData[0].children.filter(item => {
      return !item.checked;
    });
    this.profileDownload.downloadItems.thread.threadDump = this.fileList;
    let tempTimer = setTimeout(() => {
      this.diffIns.diff(this.fileList[0]);
      clearTimeout(tempTimer);
      tempTimer = null;
    }, 500);
    this.multiple = false;
    this.innerData[0].children.forEach(item => {
      item.expanded = false;
      item.files.forEach((items: any) => {
        items.disabled = false;
      });
    });
  }

  public showAlertDel(type?: any) {
    this.deleteOne.type = 'warn';
    this.deleteOne.alert_show();
    this.deleteOne.alertTitle = this.i18n.protalserver_profiling_threadDelTitle;
    this.deleteOne.haveContent = false;
    this.deleteOne.deleteStatu = true;
    this.deleteOne.content = this.i18n.protalserver_profiling_threadDelete;
  }

  public confirmHandle_delThread(data: any) {
    if (data) {
      this.doDelete();
      this.handleCompareList(this.activeGraph);
    }
  }

  public changeFn(node: TiTreeNode): void {
    if (this.innerData[0]) {
      const checkedFile = this.innerData[0].children.filter(item => {
        return item.checked;
      });
      this.selectCount = checkedFile.length > 0 ? false : true;
    }
  }
  public changeFn_g(node: TiTreeNode): void {
    if (this.innerDataGraph[0]) {
      const checkedFile = this.innerDataGraph[0].children.filter(item => {
        return item.checked;
      });
      this.selectCountGraph = checkedFile.length > 0 ? false : true;
    }
  }
  /**
   * 取消删除
   */
  public cancelDel(type?: any) {
    if (type) {
      this.multipleGraph = false;
      return;
    }
    this.multiple = false;
    this.innerData[0].children.forEach(item => {
      item.expanded = false;
      item.files.forEach((items: any) => {
        items.disabled = false;
      });
    });
  }
  public optionsAgain(specArr: any) {
    const optionsArr: any = {
      grid: [],
      xAxis: [],
      yAxis: [],
      series: [],
      xAxisIndexArr: [],
    };
    let tempTimer = setTimeout(() => {
      specArr.forEach((item: any) => {
        const index = this.newThreadData.opts.series.findIndex((ser: any) => {
          return ser.name === `${item.name}(${item.id})`;
        });
        optionsArr.series.push(this.newThreadData.opts.series[index]);
        optionsArr.series.push(this.newThreadData.opts.series[index + 1]);
        optionsArr.xAxis.push(this.newThreadData.opts.xAxis[index]);
        optionsArr.xAxis.push(this.newThreadData.opts.xAxis[index + 1]);
        optionsArr.yAxis.push(this.newThreadData.opts.yAxis[index]);
        optionsArr.yAxis.push(this.newThreadData.opts.yAxis[index + 1]);
        optionsArr.xAxisIndexArr.push(this.newThreadData.opts.xAxisIndexArr[index]);
        optionsArr.xAxisIndexArr.push(this.newThreadData.opts.xAxisIndexArr[index + 1]);
      });
      optionsArr.series.forEach((item: any, index: any) => {
        item.xAxisIndex = index;
        item.yAxisIndex = index;
        optionsArr.grid.push(this.newThreadData.opts.grid[index]);
        optionsArr.xAxis[index].gridIndex = index;
        optionsArr.yAxis[index].gridIndex = index;
        optionsArr.xAxisIndexArr[index] = index;
      });
      if (this.echartsInstance) {
        this.echartsInstance.setOption(optionsArr, true);
      }
      clearTimeout(tempTimer);
      tempTimer = null;
    }, 16);
  }
  public onClear(evt: any) {
    if (this.startBtnDisabled) {
      this.onSelect(this.selectValue);
      this.initChart(this.updateOptions);
    }
  }
  public spliceArr(specType: any, specArr: any) {
    specType.forEach((spec: any) => {
      specArr.forEach((item: any, index: any) => {
        if (Number(spec) === item.id) {
          specArr.splice(index, 1);
        }
      });
    });
  }
  public onSelect(option: any): void {
    const specArr: any = [];
    this.newThreadData.parsed.spec.forEach((item: any, index: any) => {
      specArr.push(item);
    });
    const specAll: any = [];
    const specRunnable: any = [];
    const specWaiting: any = [];
    const specBlocked: any = [];
    if (this.newThreadData.parsed.values != null) {
      for (const i of Object.keys(this.newThreadData.parsed.values)) {
        if (this.isAllEqual(this.newThreadData.parsed.values[i])) {
          const type = this.newThreadData.parsed.values[i][0].status;
          switch (type) {
            case 'RUNNABLE':
              specRunnable.push(i);
              break;
            case 'WAITING':
              specWaiting.push(i);
              break;
            case 'TIMED_WAITING':
              specWaiting.push(i);
              break;
            case 'BLOCKED':
              specBlocked.push(i);
              break;
            default:
              break;
          }
        } else {
          specAll.push(i);
        }
      }
    }
    this.selectOptions.forEach((item: any) => {
      if (!option.includes(item)) {
        switch (item.type) {
          case 'Runnable':
            this.spliceArr(specRunnable, specArr);
            break;
          case 'Waiting':
            this.spliceArr(specWaiting, specArr);
            break;
          case 'Blocked':
            this.spliceArr(specBlocked, specArr);
            break;
          default:
            this.spliceArr(specAll, specArr);
            break;
        }
      }
    });
    const reg = new RegExp(this.searchValue, 'i');
    const specArr1 = specArr.filter((item: any) => {
      return reg.test(item.name);
    });
    this.optionsAgain(specArr1);
    this.getDatas.spec = specArr1;
    if (!this.startBtnDisabled) {
      this.newThreadData.parsed.spec = specArr1;
    } else {
      this.echartsContainerHeight = this.getDatas.spec.length * this.gridHeight +
        (this.getDatas.spec.length + 1) * this.gridInertvalHeight;
      this.timeChartBox = this.getDatas.spec.length * this.gridHeight +
        (this.getDatas.spec.length + 1) * this.gridInertvalHeight + this.baseTop * 2;
    }
  }
  public isAllEqual(array: any): any {
    if (!array.length) { return; }
    return !array.some((value: any, index: any) => {
      if (value.status === '') {
        return false;
      } else if (array[0].status.includes('WAITING')) {
        return !value.status.includes('WAITING');
      } else {
        return value.status !== array[0].status;
      }
    });
  }
  /**
   * stopData
   */
  public stopData() {
    this.searchValue = '';
    this.selectValue = [];
    this.selectOptions.forEach((item: any, index: any) => {
      this.selectValue.push(this.selectOptions[index]);
    });
    const specArr: any = [];
    this.specDataArr.spec.forEach((item: any, index: any) => {
      specArr.push(item);
    });
    this.getDatas.spec = specArr;
    if (this.echartsInstance) {
      this.echartsInstance.clear();
    }
    this.newThreadData.parsed.spec = specArr;
    this.optionParsed.spec = this.newThreadData.parsed.spec;
    this.optionParsed.values = this.newThreadData.parsed.values;
    this.tableData = this.newThreadData.opts;
    this.downloadData();
    this.echartsContainerHeight = this.getDatas.spec.length * this.gridHeight +
      (this.getDatas.spec.length + 1) * this.gridInertvalHeight;
    this.timeChartBox = this.getDatas.spec.length * this.gridHeight +
      (this.getDatas.spec.length + 1) * this.gridInertvalHeight + this.baseTop * 2;
    this.onSelect(this.selectValue);
  }
  public toggleLeft() {
    this.leftState = !this.leftState;
  }
  public onHoverList(label?: any) {
    this.currentHover = label;
  }
  /**
   * 设置可拖拽以及鼠标滚轮事件
   */
  public onSetDraggable() {
    if (this.draggableEl) {
      this.dragService.create({
        helper: this.draggableEl?.nativeElement,
        stop() {
          const svgElement = document.getElementById('draggableSvg');
          const svgOffsetLeft = svgElement.offsetLeft;
          const svgOffsetTop = svgElement.offsetTop;
          const svgScrollHeight = svgElement.scrollHeight;
          if (svgOffsetLeft < -550 || svgOffsetTop < -(svgScrollHeight - 200)) {
            $('.graph-svg').css('left', '0px');
            $('.graph-svg').css('top', '0px');
          }
        }
      });
      // 绑定鼠标滑轮
      this.renderer2.listen(this.draggableEl?.nativeElement, 'wheel', this.onScrollZoom);
      this.renderer2.listen(this.draggableEl?.nativeElement, 'mousewheel', this.onScrollZoom);
      this.renderer2.listen(this.draggableEl?.nativeElement, 'DOMMouseScroll', this.onScrollZoom);
    }
  }
  /**
   * 鼠标滚轮放大缩小
   */
  public wheelShowZoom(num: number) {
    this.wheelShowScale *= num;
    // 绑定鼠标滑轮
    this.renderer2.setStyle(this.draggableEl.nativeElement, 'transform', `scale(${this.wheelShowScale})`);
  }
  /**
   * 鼠标滚轮放大缩小事件
   */
  public onScrollZoom = (e: any) => {
    // e.detail用来兼容FireFox
    if (e?.wheelDelta > 0 || e?.detail > 0) {
      this.wheelShowZoom(1.1);
    } else if (e.wheelDelta <= 0) {
      this.wheelShowZoom(0.9);
    }
  }
  /**
   * 放大缩小按钮返回的数据
   */
  public onZoomParam(num: number) {
    this.wheelShowScale = num;
  }
  public onZoomStatus(status: boolean) {
    if (status) { // 放大缩小状态
      this.renderer2.setStyle(this.showFullEl.nativeElement, 'background-color', '#FFF');
      this.renderer2.setStyle(this.showFullEl.nativeElement, 'padding', '0px 48px');
      $('.rightSet').css('display', 'none');
      $('.typeSelected').css('display', 'none');
      this.leftState = true;
    } else {
      this.renderer2.setStyle(this.showFullEl.nativeElement, 'padding', '0px');
      $('.rightSet').css('display', 'flex');
      $('.typeSelected').css('display', 'inline-block');
      this.leftState = false;
    }
  }
  /**
   * 打开保存报告弹框
   */
  public openSaveReport() {
    const currentSelectJvm = this.profileDownload.downloadItems.profileInfo.jvmName.split('/');
    this.reportName = currentSelectJvm[currentSelectJvm.length - 1];
    const saveRecordList: any = [];
    this.fileList.forEach(item => {
      const saveRecordItem: any = {};
      saveRecordItem.label = item.name;
      saveRecordItem.startTime = item.startTime;
      saveRecordList.push(saveRecordItem);
    });
    this.saveRecordOptions = saveRecordList;
    this.saveRecordSelecteds = [this.saveRecordOptions[0]];
    this.saveThreadDump.open();
    TiValidators.check(this.saveReportForm);
  }
  /**
   * 取消线程转储
   */
  public onCloseThreadDumpReport() {
    this.startTimesBtnDisable = false;
    this.saveThreadDump.close();
  }
  public onStartTimesChange(event: any) {
    this.startTimesBtnDisable = this.saveRecordSelecteds.length > 0 ? false : true;
  }
  /**
   * hover样式
   */
  public onHoverClose(msg: any) {
    this.hoverClose = msg;
  }
  /**
   * 关闭报告提示
   */
  public closeReport() {
    this.sugReport = false;
  }

  /**
   * 保存线程转储
   */
  public onSaveThreadDumpReport() {
    this.startTimes = [];
    this.saveRecordSelecteds.forEach((item: { startTime: string; }) => {
      this.startTimes.push(item.startTime);
    });
    const params = {
      startTimes: this.startTimes,
      reportName: this.reportName,
      comment: this.reportRemarks,
    };
    this.isLoading = true;
    const gId = encodeURIComponent(this.guardianId);
    const jId = encodeURIComponent(this.jvmId);
    this.Axios.axios.post(`/guardians/${gId}/jvms/${jId}/threadDump`,
      params).then((res: any) => {
        this.saveThreaddumpId = res.data;
        this.saveThreadDump.close();
        this.profileDownload.downloadItems.thread.saveReported = true;
        this.isLoading = false;
        this.saveReport = true;
        let tempTimer = setTimeout(() => {
          this.saveReport = false;
          clearTimeout(tempTimer);
          tempTimer = null;
        }, 5000);
      }).catch(() => {
        this.saveThreadDump.close();
        this.isLoading = false;
      });
  }
  public goHomeThreadDump() {
    sessionStorage.setItem('threaddumpReportTitle', this.reportName);
    sessionStorage.setItem('threaddumpId', this.saveThreaddumpId);
    sessionStorage.setItem('reportType', 'threaddump');
    this.router.navigate(['threaddump', this.saveThreaddumpId]);
  }
}
