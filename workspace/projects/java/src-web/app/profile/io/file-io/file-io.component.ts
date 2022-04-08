import { Component, OnInit, OnDestroy, ElementRef, Input, ViewChild, SecurityContext } from '@angular/core';
import { StompService } from '../../../service/stomp.service';
import { MytipService } from '../../../service/mytip.service';
import {
  TiTableColumns,
  TiTableRowData,
  TiTableSrcData,
  TiTreeNode,
  TiTreeUtil,
  TiTreeComponent,
  TiValidators
} from '@cloud/tiny3';

import {
  FormBuilder,
  FormControl,
  FormGroup
} from '@angular/forms';
import { I18nService } from '../../../service/i18n.service';
import { MessageService } from '../../../service/message.service';
import { Subscription } from 'rxjs';
import { ProfileDownloadService } from '../../../service/profile-download.service';
import { LibService } from '../../../service/lib.service';
import { AxiosService } from '../../../service/axios.service';
import { DomSanitizer } from '@angular/platform-browser';
import { RegularVerify } from 'projects/java/src-com/app/utils/regular-verify';
import { SpinnerBlurInfo } from 'projects/java/src-com/app/utils/spinner-info.type';
import * as echarts from 'echarts/core';

@Component({
  selector: 'app-file-io',
  templateUrl: './file-io.component.html',
  styleUrls: ['./file-io.component.scss']
})
export class FileIoComponent implements OnInit, OnDestroy {
  fileIOWorker: Worker;
  @ViewChild('ioTimeLine') ioTimeLine: any;
  @Input() snapShot: boolean;
  @Input() snapShotData: any;
  @Input() leftState: boolean;
  constructor(
    private stompService: StompService,
    public i18nService: I18nService,
    private msgService: MessageService,
    public downloadService: ProfileDownloadService,
    private el: ElementRef,
    public mytip: MytipService,
    public libService: LibService,
    public Axios: AxiosService,
    public fb: FormBuilder,
    public regularVerify: RegularVerify,
    public domSanitizer: DomSanitizer
  ) {
    this.i18n = this.i18nService.I18n();
    this.echartsTitle = this.i18n.io.fileIo.fileIORate;
    this.tipStr = this.i18n.io.fileIoTip;
    this.fileIoBtnTip = this.i18n.io.btn_tip_file;
    this.searchValue.placeholder = this.i18nService.I18nReplace(
      this.i18n.searchBox.info,
      {
        0: this.i18n.io.fileIo.filePath
      }
    );
    this.searchThreadValue.placeholder = this.i18nService.I18nReplace(
      this.i18n.searchBox.info,
      {
        0: this.i18n.io.fileIo.threadName
      }
    );
    // 左侧
    this.columnsTable = [
      {
        title: this.i18n.io.fileIo.path,
        width: '28%',
        isSort: false,
        sortKey: 'path'
      },
      {
        title: this.i18n.io.fileIo.totalTime,
        width: '12%',
        isSort: true,
        sortKey: 'duration'
      },
      {
        title: this.i18n.io.fileIo.count,
        width: '12%',
        isSort: true,
        sortKey: 'count'
      },
      {
        title: this.i18n.io.fileIo.readCount,
        width: '12%',
        isSort: true,
        sortKey: 'rCount'
      },
      {
        title: this.i18n.io.fileIo.writeCount,
        width: '12%',
        isSort: true,
        sortKey: 'wCount'
      },
      {
        title: this.i18n.io.fileIo.readByteCount,
        width: '12%',
        isSort: true,
        sortKey: 'rByte'
      },
      {
        title: this.i18n.io.fileIo.writeByteCount,
        width: '12%',
        isSort: true,
        sortKey: 'wByte'
      }
    ];
    this.columnsTableTime = [{
      title: this.i18n.io.fileIo.threadName,
      width: '20%',
      sortKey: 'threadName'
    },
    {
      title: this.i18n.io.fileIo.operateType,
      width: '13%',
      filter: true,
      sortKey: 'type',
      key: 'type',
      selected: [], // 该列的 headfilter 下拉选中项
      options: [{
        label: 'read'
      }, {
        label: 'write'
      }, {
        label: 'open'
      }, {
        label: 'close'
      }],
      multiple: true,
      selectAll: true
    },
    {
      title: this.i18n.io.fileIo.operateTime,
      width: '20%',
      isSort: true,
      sortKey: 'start'
    },
    {
      title: this.i18n.io.fileIo.rAndWBytes,
      width: '17%',
      isSort: true,
      sortKey: 'byte'
    },
    {
      title: this.i18n.io.fileIo.eventRate,
      width: '15%',
      isSort: true,
      sortKey: 'rate'
    },
    {
      title: this.i18n.io.fileIo.duration,
      width: '15%',
      isSort: true,
      sortKey: 'duration'
    }];

    this.fileIOGroup = fb.group({
      fileIO_threshold: new FormControl(1024, {
        validators: [
          TiValidators.required,
          TiValidators.minValue(1),
          TiValidators.maxValue(10485760),
        ],
        updateOn: 'change',
      }),
    });
  }
  // sampling配置
  public fileIOGroup: FormGroup;
  public socketIOBlur: SpinnerBlurInfo;
  private μs = 1000;
  private ms = Math.pow(1000, 2);
  public i18n: any;
  public echartsTitle: string;
  public tableListData: any = [];
  public beginFileIo = false;
  public Threshold = 1;
  public tipStr: string;
  public jvmId: any;
  public guardianId: any;
  public formatData = {};
  public ioData: any = [];
  public isStopFlag = true;
  public totalCount = 0;
  public echartsName: string;
  public threshold = {
    label: '',
    min: 1,
    max: 10485760,
    value: 1024,
    rangeValue: [1, 10485760],
    format: 'N0',
  };
  public filePath: any;
  public isDownload = false;
  public selected: any;
  public filePathSelect: any;
  public fileFdSelected: any;
  public rightTableSelected: any;
  // 栈
  public stackTranceData: Array<TiTreeNode> = [];
  selectedData: Array<TiTreeNode> = TiTreeUtil.getSelectedData(
    this.stackTranceData,
    false,
    false
  );
  public totalCountMonitor: any;
  // echarts
  public chartId = Math.floor(Math.random() * 10000000000);
  public echartsLabelTop: any;
  public echartsLabelBottom = 0;
  public echartsOption: any;
  public echartsData: any = {
    timeList: [],
    readSpeed: [],
    writeSpeed: []
  };
  // 左侧 表格部分
  public displayedTable: Array<TiTableRowData> = []; // 表示表格实际呈现的数据（开发者默认设置为[]即可）
  public srcDataTable: TiTableSrcData;
  public columnsTable: Array<TiTableColumns> = [];
  public searchValue: any = {
    placeholder: 'please input search key',
    value: ''
  };
  public searchWords: Array<string> = [this.searchValue.value];
  public searchKeys: Array<string> = ['fileName'];
  public searchThreadValue: any = {
    placeholder: 'please input search key',
    value: ''
  };
  public searchThreadWords: Array<string> = [this.searchThreadValue.value];
  public searchThreadKeys: Array<string> = ['threadName'];
  public closeOtherDetails = true;
  public noDadaInfo = '';
  public expand = false;
  // 右侧 表格
  public displayedTableTime: Array<TiTableRowData> = []; // 表示表格实际呈现的数据（开发者默认设置为[]即可）
  public srcDataTableTime: TiTableSrcData;
  private dataTableTime: Array<TiTableRowData> = [];
  public columnsTableTime: Array<TiTableColumns> = [];

  public startBtnDisabled = false;
  private isStopMsgSub: Subscription;
  private fileIoSub: Subscription;
  public tip1Context: any;
  public snapCount: number;

  public fileIoBtnTip = '';



  public fileNameMap: any = {};
  public currentEchartsIsFile = true;
  public currentEchartsFileName = '';
  public currentEchartsFdName = '';
  public currentStacktrace: any = [];
  public currentFdTableList: any = [];
  public currentFdTableListTop: any = [];
  private currnetEchartsData = {
    startTime: '',
    readSpeed: 0,
    writeSpeed: 0,
    readCount: 0,
    writeCount: 0
  };
  public fileIOEcharts: any;
  public leftcurrentPage = 1;
  public lefttotalNumber = 0;
  public leftpageSize: { options: Array<number>, size: number } = {
    options: [10, 20, 50, 100],
    size: 10
  };
  public currentPage = 1;
  public totalNumber = 0;
  public pageSize: { options: Array<number>, size: number } = {
    options: [10, 20, 50, 100],
    size: 10
  };
  public spinnerValue = 10;
  public spinner = {
    label: '',
    max: 10000,
    min: 0,
    rangeValue: [0, 10000],
    format: 'N0',
  };
  public dataLimit: any = {
    limitTime: '',
    limitData: '',
    primaryTime: null,
    clearBuffer: 0.2,
    dataCount: 0,
  };
  public fileIOEchartsTimer: any;
  public stackBtnTip: string;
  public isDoSnapClick = true; // 防止重复点击
  public timeData: any = [];
  public fileIoTimeout: any = null;
  public analyzID: string;
  public timer: any = '';
  ngOnInit() {
    // 设置初始化第一列 headfilter 的选中项
    this.columnsTableTime[1].selected = [
      this.columnsTableTime[1].options[0], this.columnsTableTime[1].options[1], this.columnsTableTime[1].options[2],
      this.columnsTableTime[1].options[3]
    ];
    this.startBtnDisabled = JSON.parse(sessionStorage.getItem('isProStop'));
    this.isDownload = JSON.parse(sessionStorage.getItem('download_profile'));

    this.setSpinnerBlur();

    if (!this.snapShot) {
      this.leftState = true;
      this.handleSnapShotCount('pFileIO');
      this.tableListData = this.downloadService.downloadItems.pFileIO.tableData;
    }
    this.srcDataTable = {
      data: this.tableListData,
      state: {
        searched: false,
        sorted: false,
        paginated: false
      }
    };
    // 右侧
    this.srcDataTableTime = {
      data: this.dataTableTime,
      state: {
        searched: false,
        sorted: false,
        paginated: false
      }
    };
    const role = sessionStorage.getItem('role');
    // 判断是否是快照
    if (this.snapShot) { return; }
    const res = this.downloadService.downloadItems.pFileIO.stackDepth;
    if (role === 'Admin') {
      this.stackBtnTip = this.i18nService.I18nReplace(this.i18n.newHeader.setting.stackAdmin, { 0: res });
    } else {
      this.stackBtnTip = this.i18nService.I18nReplace(this.i18n.newHeader.setting.stackUser, { 0: res });
    }
    if (this.isDownload) {
      this.handleImportDownload();
    } else {
      this.handleImportCache();
    }
    this.jvmId = sessionStorage.getItem('jvmId');
    this.guardianId = sessionStorage.getItem('guardianId');
    this.noDadaInfo = this.i18n.profileNoData.fileIo;

    this.isStopMsgSub = this.msgService.getMessage().subscribe(msg => {
      if (msg.type === 'isStopPro') {
        this.startBtnDisabled = true;
        this.beginFileIo = false;
        this.downloadService.dataSave.isFileIOStart = false;
        this.fileIoTimer();
      }
      if (msg.type === 'dataLimit' && !JSON.parse(sessionStorage.getItem('isProStop'))) {
        if (msg.data.type === 'file_io') {
          if (msg.data.value > 50) {
            this.dataLimit.limitData = this.downloadService.dataLimit.file_io.dataValue;
          }
          if (msg.data.value < 50) {
            this.dataLimit.limitTime = this.downloadService.dataLimit.file_io.timeValue;
            this.echartsData.readSpeed = [];
            this.echartsData.writeSpeed = [];
            this.echartsData.timeList = new Array(Number(this.dataLimit.limitTime) * 60).fill('');
            this.echartsLabelTop = null;
            this.updateEchartsData();
          }
        }
      }
      if (msg.type === 'isRestart') {
        this.startBtnDisabled = false;
        this.fileIOGroup.controls.fileIO_threshold.setValue(1024);
        this.snapCount = 0;
        this.fileIoTimer();
        this.clearData();
        this.getWorkerData();
      }
      if (msg.type === 'isClear' || msg.type === 'isClearOne') {
        this.clearData();
        this.getWorkerData();
      }
      if (msg.type === 'exportData') {
        this.handelSaveCache();
      }
      if (msg.type === 'setDeleteOne') {
        if (this.srcDataTable.data.length === 0) {
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
    });
    this.getWorkerData();
    this.fileIoSub = this.msgService.getFileMessage().subscribe(msg => {
      if (msg.type === 'pfileIO') {
        if (msg.data) {
          this.fileIoTimer();
        }
        if (this.fileIOWorker) {
          this.fileIOWorker.postMessage({
            type: 'fileIOWs',
            data: msg.data
          });
        }
      }
    });
  }

  /**
   * 微调器回填初始化
   */
  public setSpinnerBlur() {
    this.socketIOBlur = {
      control: this.fileIOGroup.controls.fileIO_threshold,
      min: 1,
      max: 10485760,
    };
  }

  /**
   * 微调器回填
   */
  public verifySpinnerValue(value: any) {
    this.regularVerify.setSpinnerInfo(value);
  }


  public getWorkerData() {
    if (typeof Worker !== 'undefined') {
      this.fileIOWorker = new Worker('./assets/worker/profileFileIO.worker.js');
      this.fileIOWorker.onmessage = ({ data }) => {
        this.handleAllData(data);
        if (this.fileIOEchartsTimer) {
          clearTimeout(this.fileIOEchartsTimer);
        }
        this.fileIOEchartsTimer = setTimeout(() => {
          this.handleLastCacheEchartsData();
          this.handelSaveCache();
        }, 1000);
        if (!this.fileIOEcharts) {
          this.initEchart();
        }
      };
    }
  }

  public clearData() {
    if (this.fileIOWorker) { this.fileIOWorker.terminate(); this.fileIOWorker = null; }
    this.srcDataTable.data = [];
    this.srcDataTableTime.data = [];
    this.stackTranceData = [];
    this.echartsData.readSpeed = [];
    this.echartsData.writeSpeed = [];
    this.echartsData.timeList = new Array(Number(this.dataLimit.limitTime) * 60).fill('');
    this.echartsLabelTop = null;
    this.fileNameMap = {};
    this.tableListData = [];
    this.handelClearCache();
    if (this.fileIOEcharts) {
      this.fileIOEcharts.clear();
      this.fileIOEcharts = null;
    }
  }
  /**
   * 切换页签时保存已分析的数据，同时停止worker
   */
  ngOnDestroy() {
    window.onresize = null;
    if (this.isDownload || this.snapShot) { return; }
    this.handelSaveCache();
    this.fileIOWorker.postMessage({
      type: 'fileIOWs_close',
      data: ''
    });
    if (this.fileIOWorker) { this.fileIOWorker.terminate(); this.fileIOWorker = null; }
    if (this.isStopMsgSub) { this.isStopMsgSub.unsubscribe(); }
    this.msgService.sendMessage({ type: 'getDeleteOne' });  // 清除本页面的发送事件
    if (this.fileIoSub) { this.fileIoSub.unsubscribe(); }
    if (this.fileIOEcharts) {
      this.fileIOEcharts.clear();
    }
    clearInterval(this.timer);
  }
  /**
   * 达到数据限定时清空表格数据
   * @param data 每次的数据
   */
  public handleTableDataLimit(data: any) {
    if (!this.dataLimit.primaryTime) {
      this.dataLimit.primaryTime = data[0].originTime;
    }
    if (!this.tableListData.length) {
      return;
    }
    if (this.dataLimit.dataCount > +this.dataLimit.limitData) {
      const lastTime = data[0].originTime;
      const diffTime = Math.ceil((lastTime - this.dataLimit.primaryTime) * this.dataLimit.clearBuffer) +
        this.dataLimit.primaryTime;
      this.handleClearTableData(diffTime);
      this.dataLimit.primaryTime = diffTime;
    }
  }
  /**
   * 达到数据限定时清理表格数据
   * @param lastTime 达到数据限定的最后一个时间
   */
  private handleClearTableData(diffTime: any) {
    this.dataLimit.dataCount = 0;
    let currentFileThreadCount = 0;
    const currentFileIndex = this.fileNameMap[String(this.currentEchartsFileName)] - 1;
    this.tableListData[currentFileIndex].children.forEach((fd: any) => {
      currentFileThreadCount += fd.options.length;
    });
    this.tableListData.forEach((file: any, fileIndex: any) => {
      if (
        this.currentEchartsFileName === file.fileName &&
        currentFileThreadCount < Number(this.dataLimit.limitData) * this.dataLimit.clearBuffer
      ) {
        return;
      }
      file.children.forEach((fd: any, fdIndex: any) => {
        fd.options.forEach((thread: any, threadIndex: any) => {
          if (thread.originTime <= diffTime) {
            fd.options.splice(threadIndex, 1);
          }
        });
        if (!fd.options.length) {
          file.children.splice(fdIndex, 1);
        } else {
          this.dataLimit.dataCount += fd.options.length;
        }
      });
      if (!file.children.length) {
        delete this.fileNameMap[file.fileName];
        this.tableListData.splice(fileIndex, 1);
      }
    });
  }
  /**
   * 处理从worker中传来的每一条数据
   * @param currentData 每一条数据
   */
  public handleAllData(currentData: any) {
    if (this.dataLimit.dataCount > +this.dataLimit.limitData) {
      this.handleTableDataLimit(currentData.fd.options);
    }
    this.dataLimit.dataCount += currentData.fd.options.length;
    const index = this.fileNameMap[currentData.fileName];
    const currentFile = this.handleFileIndex(index, currentData);
    const currentFd = currentData.fd;
    this.hanldeFileData(currentFile, currentFd);
    this.handleFdData(currentFile, currentFd);
    // 更新选中项
    this.handleSelectedUpdate();
    this.handleEchartsUpdate(currentData);
    this.srcDataTable.data = this.tableListData;
  }
  /**
   * 更新表格中已选中的某行数据
   */
  public handleSelectedUpdate() {
    let index = 1; // 由于index会减1， 所以现在1代表列表中的0位置
    if (this.fileNameMap[this.currentEchartsFileName]) {
      index = this.fileNameMap[this.currentEchartsFileName];
    } else {
      this.currentEchartsFileName = this.tableListData[0].fileName;
    }
    this.handleUpdateThreads(this.tableListData[index - 1]);
    if (!this.stackTranceData.length) {
      this.onClickRightTable(this.srcDataTableTime.data[0], 0);
    }
    return;
  }
  /**
   * 当MAP中没有当前路径时，添加新MAP数据，同时在数组中添加新路径地址
   * @param index 某路径在MAP中的位置
   * @param currentData 当前某一条数据
   */
  public handleFileIndex(index: any, currentData?: any) {
    if (index) { return this.tableListData[index - 1]; }
    const fileName = currentData.fileName;
    const file: any = {
      fileName,
      duration: 0,
      count: 0,
      rCount: 0,
      wCount: 0,
      rByte: 0,
      wByte: 0,
      children: [],
      isSelect: false,
      showDetails: false
    };
    this.tableListData.push(file);
    if (!this.currentFdTableList.length) {
      this.tableListData[0].isSelect = true;
      this.currentFdTableList = this.tableListData[0].children;
    }
    this.fileNameMap[fileName] = this.tableListData.length;
    return this.tableListData[this.tableListData.length - 1];
  }
  /**
   * 更新已有路径数据
   * @param currentFile 已存在的路径下的数据
   * @param currentFd 当前某一条数据
   */
  public hanldeFileData(currentFile: any, currentFd: any) {
    currentFile.duration += currentFd.duration;
    currentFile.count += currentFd.count;
    currentFile.rCount += currentFd.rCount;
    currentFile.wCount += currentFd.wCount;
    currentFile.rByte += currentFd.rByte;
    currentFile.wByte += currentFd.wByte;
  }
  /**
   * 判断当前路径下是否有当前线程，如果有则更新，没有则添加
   * @param currentFile 已存在的路径下的数据
   * @param currentFd  当前某一条数据
   */
  public handleFdData(currentFile: any, currentFd: any) {
    const oldFd = currentFile.children.find((item: any) => {
      return item.fileDes === currentFd.fileDes;
    });
    if (!oldFd) {
      currentFile.children.push(currentFd);
    } else {
      oldFd.duration += currentFd.duration;
      oldFd.count += currentFd.count;
      oldFd.rCount += currentFd.rCount;
      oldFd.wCount += currentFd.wCount;
      oldFd.rByte += currentFd.rByte;
      oldFd.wByte += currentFd.wByte;
      oldFd.options.push(currentFd.options[0]);
    }
  }
  /**
   * 更新当前已选中的某行（路径或线程）的echarts数据
   * @param currentData 当前某一条数据
   */
  public handleEchartsUpdate(currentData: any) {
    if (this.currentEchartsIsFile && currentData.fileName === this.currentEchartsFileName) {
      return this.handleCacheEchartsData(currentData.fd);
    }
    if (
      !this.currentEchartsIsFile &&
      currentData.fileName === this.currentEchartsFileName &&
      currentData.fd.fileDes === this.currentEchartsFdName
    ) {
      return this.handleCacheEchartsData(currentData.fd);
    }
  }
  /**
   * 更新当前echarts
   * @param echarts 数据
   */
  public handleEchartsData(echartsData: any) {
    const readSpeed = echartsData.readSpeed;
    const writeSpeed = echartsData.writeSpeed;
    const bigger = Math.max(+writeSpeed, +readSpeed);
    this.echartsLabelTop = Math.max(this.echartsLabelTop, bigger);
    this.echartsLabelTop = this.echartsLabelTop.toFixed(2);
    this.supplementDis(echartsData.startTime);
    this.reduceEchartsData(echartsData.startTime, readSpeed, writeSpeed);
    this.updateEchartsData();
  }
  /**
   * 更新/删除xAxis数据
   * @param time x轴数据
   */
  public reduceEchartsData(time: string, readSpeed: number, writeSpeed: number) {
    readSpeed = readSpeed === 0 ? 0.001 : readSpeed;
    writeSpeed = writeSpeed === 0 ? 0.001 : writeSpeed;
    const index = this.echartsData.timeList.findIndex((item: any) => {
      return item === '';
    });
    if (index !== -1) {
      this.echartsData.timeList[index] = time;
    } else {
      this.echartsData.timeList.shift();
      this.echartsData.readSpeed.shift();
      this.echartsData.writeSpeed.shift();
      this.echartsData.timeList.push(time);
    }
    this.timeData = this.echartsData.timeList;
    this.ioTimeLine.setTimeData(this.timeData);
    this.echartsData.readSpeed.push(readSpeed);
    this.echartsData.writeSpeed.push(writeSpeed);
  }
  /**
   * 如果当前数据时间比上一个数据时间的差多1s的倍数时，差值设置为0
   * @param timeData 当前数据时间
   */
  private supplementDis(timeData: string) {
    const len: any = [];
    this.echartsData.timeList.forEach((item: any) => {
      if (item !== '') {
        len.push(item);
      }
    });
    if (!len.length) { return; }
    const year = new Date().getFullYear();
    const date = new Date().getMonth() + 1;
    const day = new Date().getDate();
    const newDate = `${year}/${date}/${day} `;
    const nowTime = (new Date(newDate + timeData)).getTime();
    const lastTime = (new Date(newDate + len[len.length - 1])).getTime();
    const diff = Math.floor((nowTime - lastTime) / 1000);
    if (diff > 1) {
      let count = 1;
      while (count <= diff - 1) {
        const time = this.libService.dateFormat(lastTime + (count * 1000), 'hh:mm:ss');
        this.reduceEchartsData(time, 0, 0);
        count++;
      }
    }
  }
  /**
   * 更新echarts数据
   */
  public updateEchartsData() {
    if (!this.fileIOEcharts) { return; }
    this.timeData = this.echartsData.timeList;
    this.ioTimeLine.setTimeData(this.timeData);
    this.fileIOEcharts.setOption({
      yAxis: [
        {
          max: this.echartsLabelTop
        }
      ],
      series: [
        {
          data: this.echartsData.readSpeed
        },
        {
          data: this.echartsData.writeSpeed
        }
      ],
      xAxis: [
        {
          data: this.echartsData.timeList
        }
      ]
    });
  }
  /**
   * 缓存当前某条数据，当吓一跳数据的时间与当前时间不同时，讲当前时间推出，缓存下一条数据
   * @param echarts 当前数据
   */
  private handleCacheEchartsData(echartsData: any) {
    const type = echartsData.options[0].type;
    const rate = echartsData.options[0].rate;
    if (type === 'open' || type === 'close') { return; }
    if (this.currnetEchartsData.startTime && echartsData.startTime !== this.currnetEchartsData.startTime) {
      this.handleLastCacheEchartsData();
    }
    this.currnetEchartsData.startTime = echartsData.startTime;
    if (type === 'read') {
      this.currnetEchartsData.readCount++;
      this.currnetEchartsData.readSpeed += rate;
    } else {
      this.currnetEchartsData.writeCount++;
      this.currnetEchartsData.writeSpeed += rate;
    }
  }
  /**
   * 处理当前数据
   */
  private handleLastCacheEchartsData() {
    if (!this.currnetEchartsData.startTime) {
      return;
    }
    this.currnetEchartsData.readSpeed = this.currnetEchartsData.readCount === 0
      ? 0.000
      : +(this.currnetEchartsData.readSpeed / this.currnetEchartsData.readCount).toFixed(2);
    this.currnetEchartsData.writeSpeed = this.currnetEchartsData.writeCount === 0
      ? 0.000
      : +(this.currnetEchartsData.writeSpeed / this.currnetEchartsData.writeCount).toFixed(2);
    this.handleEchartsData(this.currnetEchartsData);
    this.currnetEchartsData.readCount = 0;
    this.currnetEchartsData.writeCount = 0;
    this.currnetEchartsData.readSpeed = 0;
    this.currnetEchartsData.writeSpeed = 0;
    this.currnetEchartsData.startTime = '';
  }
  /**
   * 计算当前某一条数据的读或者写速率
   * @param byte 字节数
   * @param duration 持续时间
   */
  public handleSpeedCaulate(byte: any, duration: any) {
    if (byte === 0) {
      return 0;
    }
    if (duration === 0) {
      return 0;
    }
    const kb = +byte / 1024;
    const s = duration / this.ms;
    const speed = kb / s;
    return speed;
  }
  /**
   * 判断当前选中行是否已被选中
   * @param type 判断是当前选中是路径还是线程
   * @param name 当前选中行的name值
   */
  public handleIsNowEcharts(type: any, name: any) {
    if (type && type === this.currentEchartsIsFile && name === this.currentEchartsFileName) { return; }
    if (!type && type === this.currentEchartsIsFile && name === this.currentEchartsFdName) { return; }
    this.currentEchartsFileName = type ? name : this.currentEchartsFileName;
    this.currentEchartsFdName = type ? '' : name;
    this.currentEchartsIsFile = type;
    this.echartsLabelTop = 0;
    this.echartsData.readSpeed = [];
    this.echartsData.writeSpeed = [];
    this.echartsData.timeList = new Array(Number(this.dataLimit.limitTime) * 60).fill('');
    this.timeData = this.echartsData.timeList;
    this.currnetEchartsData.startTime = '';
    this.currnetEchartsData.readSpeed = 0;
    this.currnetEchartsData.writeSpeed = 0;
    this.currnetEchartsData.readCount = 0;
    this.currnetEchartsData.writeCount = 0;
    this.updateEchartsData();
    this.handleReclickedFile(name);
  }
  /**
   * 判断是否点击了cache了echarts数据的行
   * @param name 点击的某行name值是否是cache下的name
   */
  public handleReclickedFile(name: any) { // 当状态为下载，快照，停止分析时，重新点击有echarts数据的file时调用
    if (this.isDownload || this.snapShot || this.startBtnDisabled || !this.beginFileIo) {
      if (this.downloadService.downloadItems.pFileIO.currentEchartsFileName === name) {
        this.currentEchartsFileName = this.downloadService.downloadItems.pFileIO.currentEchartsFileName;
        this.currentEchartsFdName = this.downloadService.downloadItems.pFileIO.currentEchartsFdName;
        this.echartsLabelTop = this.downloadService.downloadItems.pFileIO.echartsLabelTop;
        this.echartsData.timeList = this.downloadService.downloadItems.pFileIO.echarts.timeList;
        this.echartsData.readSpeed = this.downloadService.downloadItems.pFileIO.echarts.readSpeed;
        this.echartsData.writeSpeed = this.downloadService.downloadItems.pFileIO.echarts.writeSpeed;
        this.updateEchartsData();
      }
    }
  }
  /**
   * 初始化echarts
   */
  public initEchart() {
    this.echartsOption = {
      backgroundColor: '#fff',
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#ffffff',
        borderRadius: 5, // 边框圆角
        boxShadow: 'rgba(0, 0, 0, 0.5)',
        textStyle: {
          color: '#000000',
        },
        extraCssText: 'box-shadow: 0px 4px 8px 0px rgba(0, 0, 0, .2);',
        padding: [8, 20, 8, 20],
        formatter: (params: any) => {
          let html = '';
          let read = null;
          let write = null;
          if (params.length === 1) {
            const flag = params[0].seriesName === this.i18n.io.fileIo.readRate;
            if (flag) {
              read = params[0].data === 0.001 ? 0.00 : params[0].data;
              read = +read > 1 ? this.libService.setThousandSeparator((+read).toFixed(2)) : (+read).toFixed(3);
              write = '0.000';
            } else {
              read = '0.000';
              write = params[0].data === 0.001 ? 0.00 : params[0].data;
              write = +write > 1 ? this.libService.setThousandSeparator((+write).toFixed(2)) : (+write).toFixed(3);
            }
            html += `
                <div style="font-size:12px">${this.domSanitizer.sanitize(SecurityContext.HTML,
              this.downloadService.downloadItems.profileInfo.toolTipDate + ' ' + params[0].axisValueLabel)}</div>
                <div style='margin-top:8px;display:flex;justify-content: space-between;
                 align-items: center;font-size:12px'>
                <div style="float:left;">
                  <span style="display: inline-block;width: 8px;height: 8px;
                  background-color:${params[0].color};margin-right:8px"></span>
                  <span style='display:inline-block;'>
                  ${this.domSanitizer.sanitize(SecurityContext.HTML, params[0].seriesName)}</span>
                  </div>
                  <span style="margin-left:24px">
                    ${this.domSanitizer.sanitize(SecurityContext.HTML, params[0].data > 1 ?
                this.libService.setThousandSeparator((+params[0].data).toFixed(2)) :
                (+params[0].data).toFixed(3))}KiB/s</span>
                </div>
                `;
          } else {
            read = params[0].data === 0.001 ? 0.00 : params[0].data;
            write = params[1].data === 0.001 ? 0.00 : params[1].data;
            read = +read > 1 ? this.libService.setThousandSeparator((+read).toFixed(2)) : (+read).toFixed(3);
            write = +write > 1 ? this.libService.setThousandSeparator((+write).toFixed(2)) : (+write).toFixed(3);
            html += `
                <div style="font-size:12px">
                ${this.domSanitizer.sanitize(SecurityContext.HTML,
              this.downloadService.downloadItems.profileInfo.toolTipDate + ' ' +
              params[0].axisValueLabel)}
                </div>
                <div style='margin-top:8px;display:flex;justify-content: space-between;
                 align-items: center;font-size:12px'>
                <div>
                  <span style="display: inline-block;width: 8px;height: 8px;
                  background-color:#267DFF;margin-right:8px;"></span>
                  <span style='display:inline-block;'>
                  ${this.domSanitizer.sanitize(SecurityContext.HTML, this.i18n.io.fileIo.readRate)}</span>
                </div>
                  <span style="margin-left:24px">${this.domSanitizer.sanitize(SecurityContext.HTML, read)}KiB/s</span>
                </div>
                <div style='margin-top:8px;display:flex;justify-content: space-between;
                 align-items: center;font-size:12px'>
                <div style="float:left;">
                  <span style="display: inline-block;width: 8px;height: 8px;
                  background-color:#00BFC9;margin-right:8px"></span>
                  <span style='display:inline-block;'>
                  ${this.domSanitizer.sanitize(SecurityContext.HTML, this.i18n.io.fileIo.writeRate)}</span>
                  </div>
                  <span style="margin-left:24px">${this.domSanitizer.sanitize(SecurityContext.HTML, write)}KiB/s</span>
                  </div>
                  `;
          }
          return html;
        }
      },
      legend: {
        itemHeight: 10,
        itemWidth: 10,
        icon: 'rect',
        data: [this.i18n.io.fileIo.readRate, this.i18n.io.fileIo.writeRate],
        x: 'right',
        padding: [
          5,  // 上
          5, // 右
          70,  // 下
          5, // 左
        ]
      },
      grid: {
        left: 90,
        right: 0,
        top: 90,
        height: 130
      },
      dataZoom: [
        {
          show: false,
          type: 'slider',
          realtime: true,
          top: 30,
          start: 0,
          end: 100,
          height: 32,
          showDataShadow: true,
          dataBackground: {
            areaStyle: {
              color: 'rgba(230,233,240,0.6)' // 滑块背景阴影的填充样式
            },
            lineStyle: {
              opacity: 0.8,
              color: 'rgb(230,233,240)' // 滑块背景的边线颜色
            }
          },
          fillerColor: 'rgba(0, 103, 255, 0.15)', // 选中的区域背景色
          textStyle: {
            color: 'rgba(40, 43, 51, 0)'  // 选中区域两边的边界值样式  不显示
          },
          handleStyle: {   // 边界图标样式设置
            color: 'rgba(108, 146, 250, 1)',
            borderType: 'solid',
            borderWidth: '10',
          },
          filterMode: 'empty'
        },
        {
          type: 'inside',
          realtime: true,
          showDataShadow: false,   // 是否显示数据阴影
          filterMode: 'empty'
        }
      ],
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
            padding: [11, 0, 0, 0],
            textStyle: {
              color: '#616161',
            },
          },
          axisTick: {
            show: true,
            color: '#E1E6EE',
            width: 2,
            length: 8,
          },
          splitLine: {
            interval: 0,
            lineStyle: {
              type: 'dashed',
              opacity: 0.3
            },
            show: true
          },
          data: this.echartsData.timeList
        },
        {
          type: 'category',
          boundaryGap: false,
          axisLine: {
            onZero: false,
            lineStyle: {
              color: '#E1E6EE',
              width: 2,
            }
          }
        }
      ],
      yAxis: [
        {
          type: 'value',
          show: false,
          splitNumber: 1,
          splitLine: {
            show: false,
            lineStyle: {
              type: 'solid'
            }
          },
          max: this.echartsLabelTop,
          min: 0.1
        }
      ],
      series: [
        {
          id: 'series1',
          name: this.i18n.io.fileIo.readRate,
          type: 'line',
          itemStyle: {
            normal: {
              color: '#267DFF'
            }
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
              offset: 0,
              color: 'rgba(38,125,255,0.3)',
            }, {
              offset: 1,
              color: 'rgba(38,125,255,0.04)'
            }])
          },
          lineStyle: {
            color: '#267DFF',
          },
          data: this.echartsData.readSpeed
        },
        {
          id: 'series2',
          name: this.i18n.io.fileIo.writeRate,
          type: 'line',
          itemStyle: {
            normal: {
              color: '#00BFC9'
            }
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
              offset: 0,
              color: 'rgba(0,191,201,0.3)',
            }, {
              offset: 1,
              color: 'rgba(0,191,201,0.04)'
            }])
          },
          lineStyle: {
            color: '#00BFC9',
          },
          data: this.echartsData.writeSpeed
        }
      ]
    };
    let tempTimer = setTimeout(() => {
      this.fileIOEcharts = echarts.init(this.el.nativeElement.querySelector('#fileIOEcharts'));
      this.fileIOEcharts.setOption(this.echartsOption);
      window.onresize = this.fileIOEcharts.resize;
      this.fileIOEcharts.on('datazoom', (params: any) => {  // 放大缩小时调用接口
        this.ioTimeLine.dataConfig({ start: params.batch[0].start, end: params.batch[0].end });
      });
      clearTimeout(tempTimer);
      tempTimer = null;
    }, 0);
  }
  /**
   * 点击第一层的某行，判断是否已选中，展开或者关闭本行，更新echarts，线程列表
   * @param file 第一层数据
   * @param i 第一层数据的位置
   */
  public handleFileClicked(file: any, i: any) {
    this.handleIsNowEcharts(true, file.fileName);
    this.handleUpdateThreads(file);
    this.handleFdSelected(i, -1);
    this.handleFileSelected(i);
    this.onClickRightTable(this.srcDataTableTime.data[0], 0);
  }
  /**
   * 第一层的行的折叠情况
   * @param i 数据位置
   */
  public handleFileSelected(i: any) {
    this.tableListData.forEach((item: any, index: any) => {
      item.isSelect = index === i;
    });
  }
  /**
   * 更新当前行数据的线程列表信息
   * @param fileName 当前行数据
   */
  public handleUpdateThreads(fileName: any) {
    let threadsList: any = [];
    fileName.children.forEach((item: any) => {
      if (!this.currentEchartsIsFile && item.fileDes !== this.currentEchartsFdName) { return; }
      threadsList = threadsList.concat(item.options);
    });
    this.dataTableTime = threadsList;
    this.onTypeSelect();
  }
  /**
   * 第一层某行展开之前
   * @param row 某第一层行
   */
  public beforeToggle(row: TiTableRowData): void {
    this.currentFdTableList = [];
    this.currentFdTableListTop = [];
    this.currentFdTableList = row.children.sort((a: any, b: any) => {
      return b.count - a.count;
    });
    this.currentFdTableListTop = this.currentFdTableList.slice(0, this.spinnerValue);
    row.showDetails = !row.showDetails;
  }
  /**
   * 点击第一层中某线程
   * @param fd 某线程行数据
   * @param i 所在第一层行位置
   * @param idx 本条数据所在位置
   */
  public handleFdClicked(fd: any, i: any, idx: any) {
    this.handleIsNowEcharts(false, fd.fileDes);
    this.dataTableTime = fd.options;
    this.onTypeSelect();
    this.onClickRightTable(this.srcDataTableTime.data[0], 0);
    this.handleFdSelected(i, idx);
  }

  /**
   * 展开整个树
   */
  public expandAllNode(row: TiTableRowData) {
    if (row.expanded) {
      return;
    }
    const data: Array<TiTreeNode> = this.stackTranceData.concat();
    TiTreeUtil.traverse(data, traverseFn);
    function traverseFn(node: TiTreeNode): void {
      node.expanded = true;
    }
    this.stackTranceData = data;
  }
  /**
   * 本条数据选中情况
   * @param i 所在第一层行位置
   * @param idx 本条数据所在位置
   */
  public handleFdSelected(i: any, idx: any) {
    this.tableListData[i].children.forEach((item: any, index: any) => {
      item.isSelect = index === idx;
    });
  }
  /**
   * 讲某行数据的第一条线程信息的栈数据展示
   * @param row 某行数据
   */
  public handleStacktrace(row: any) {
    this.currentStacktrace = [];
    this.stackTranceData = [];
    this.currentStacktrace = row.stackTrace.children;
    this.currentStacktrace.forEach((item: any) => {
      this.stackTranceData.push({
        label: item.label,
        expanded: false,
        children: item.children
      });
    });
    this.treeFindChild(this.currentStacktrace);
  }
  public treeFindChild(tree: any) {
    const arr = tree[0];
    if (Object.prototype.hasOwnProperty.call(arr, 'children')) {
      if (arr.children.length) {
        this.treeFindChild(arr.children);
      } else {
        delete arr.children;
        delete arr.expanded;
      }
    }
    return tree;
  }

  /**
   * 在tree组件某节点展开之前
   * @param TreeCom 栈数据的某个节点
   */
  public beforeExpand(TreeCom: TiTreeComponent): void {
    const currentTree: TiTreeNode = TreeCom.getBeforeExpandNode();
    this.getChildNodes(currentTree);
  }
  /**
   * 获取当前节点下的所有子节点
   * @param currentTree 当前节点信息
   */
  public getChildNodes(currentTree: any) {
    if (!currentTree.children.length) {
      const findChild = this.currentStacktrace.find((item: any) => {
        return item.label === currentTree.label;
      });
      if (findChild) {
        currentTree.children = findChild.children;
      } else {
        delete currentTree.children;
      }
    }
    currentTree.expanded = true;
  }
  /**
   * 点击右侧小表格
   * @param row 右侧某行数据
   * @param index 所在位置
   */
  public onClickRightTable(row: any, index: any) {
    if (!row.stackTrace) {
      return;
    }
    this.srcDataTableTime.data.forEach((item, i) => {
      item.isSelect = index === i;
    });
    for (const item of row.stackTrace.children) {
      item.expanded = false;
    }
    this.handleStacktrace(row);
  }
  // 展开整个树
  public expandNode(): void {
    this.currentStacktrace.forEach((item: any) => {
      this.getChildNodes(item);
    });
    const data: Array<TiTreeNode> = this.stackTranceData.concat();
    TiTreeUtil.traverse(data, traverseFn);
    function traverseFn(node: TiTreeNode): void {
      node.expanded = true;
    }
    this.stackTranceData = data;
  }

  // 快照点击事件
  public compare(property: any) {
    return (a: any, b: any) => {
      const value1 = a[property];
      const value2 = b[property];
      return value2 - value1;
    };
  }
  public doSnap(type: any) {
    if (this.isDoSnapClick) {
      this.isDoSnapClick = false;
      // 事件
      this.doSnapFn(type);
      // 定时器
      let tempTimer = setTimeout(() => {
        this.isDoSnapClick = true;
        clearTimeout(tempTimer);
        tempTimer = null;
      }, 1000); // 一秒内不能重复点击
    }
  }
  public doSnapFn(type: any) {
    if (this.isDownload) { return; }
    if (this.srcDataTable.data.length < 1) {
      return this.mytip.alertInfo({
        type: 'warn',
        content: this.i18n.snapshot_analysis_noData,
        time: 3500
      });
    }
    const snapCounts = 5;
    if (this.snapCount < snapCounts) {
      const tableTop1 = this.srcDataTable.data.sort(this.compare('count'));
      const nowTime = this.libService.getSnapTime();
      const snapShot = this.downloadService.downloadItems.snapShot.snapShotData &&
        JSON.parse(this.downloadService.downloadItems.snapShot.snapShotData) || {};
      if (!snapShot[type]) {
        snapShot[type] = {
          label: this.i18n.protalserver_profiling_tab.fileIo,
          type,
          children: [],
        };
      }
      snapShot[type].children.push({
        label: nowTime,
        type,
        value: {
          fileNameMap: this.fileNameMap,
          file: tableTop1,
          threshold: this.fileIOGroup.controls.fileIO_threshold.value,
          snapCount: this.snapCount + 1,
          spinnerValue: this.spinnerValue,
          stackBtnTip: this.stackBtnTip,
          echarts: {
            currentEchartsFileName: this.currentEchartsFileName,
            currentEchartsFdName: this.currentEchartsFdName,
            echartsLabelTop: this.echartsLabelTop,
            data: this.echartsData
          }
        }
      });
      this.downloadService.downloadItems.snapShot.snapShotData = JSON.stringify(snapShot);
      this.downloadService.downloadItems.snapShot.data = snapShot;
      this.downloadService.downloadItems.pFileIO.snapCount = this.snapCount + 1;
      this.mytip.alertInfo({
        type: 'success',
        content: this.i18n.do_snapshot_success,
        time: 3500
      });
    } else {
      this.mytip.alertInfo({
        type: 'warn',
        content: this.i18n.snapshot_analysis_alert,
        time: 3500
      });
    }
    this.handleSnapShotCount(type);
  }
  public importSnapData(snapShotData: any) {
    if (!snapShotData) { return; }
    this.fileNameMap = snapShotData.fileNameMap;
    this.tableListData = snapShotData.file;
    this.srcDataTable.data = snapShotData.file;
    this.currentEchartsFileName = snapShotData.echarts.currentEchartsFileName;
    this.currentEchartsFdName = snapShotData.echarts.currentEchartsFdName;
    this.echartsLabelTop = snapShotData.echarts.echartsLabelTop;
    this.echartsData.timeList = snapShotData.echarts.data.timeList;
    this.timeData = this.echartsData.timeList;
    this.echartsData.readSpeed = snapShotData.echarts.data.readSpeed;
    this.echartsData.writeSpeed = snapShotData.echarts.data.writeSpeed;
    this.fileIOGroup.controls.fileIO_threshold.setValue(snapShotData.threshold);
    this.stackBtnTip = snapShotData.stackBtnTip;
    this.snapCount = snapShotData.snapCount;
    this.spinnerValue = snapShotData.spinnerValue;
    if (this.currentEchartsFdName) {
      this.currentEchartsIsFile = false;
    }
    if (this.currentEchartsFileName) {
      this.handleUpdateThreads(this.tableListData[this.fileNameMap[this.currentEchartsFileName] - 1]);
      this.currentFdTableList = this.tableListData[this.fileNameMap[this.currentEchartsFileName] - 1].children;
    }
    if (this.srcDataTable.data.length !== 0) {
      this.initEchart();
    }
    this.onClickRightTable(this.srcDataTableTime.data[0], 0);
  }
  public handleSnapShotCount(type: any) {
    this.snapCount = this.downloadService.downloadItems.pFileIO.snapCount;
  }
  // io时间单位
  public onChangeTime(time: any): any {
    if (time < this.μs) {
      return time.toFixed(2) + ' μs';
    } else if (this.μs < time && time < this.ms) {
      return (time / this.μs).toFixed(2) + ' ms';
    } else if (this.ms < time) {
      return (time / this.ms).toFixed(2) + ' s';
    }
  }
  public handleTimeFormat(time: any) {
    const date = new Date(time);
    return `${date.getHours() < 10 ? '0' + date.getHours() :
      date.getHours()}:${date.getMinutes() < 10 ? '0' + date.getMinutes() :
        date.getMinutes()}:${date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds()}`;
  }

  public handelSaveCache() {
    this.downloadService.downloadItems.pFileIO.currentFdTableList = this.currentFdTableList;
    this.downloadService.downloadItems.pFileIO.tableData = this.srcDataTable.data;
    this.downloadService.downloadItems.pFileIO.threshold = this.fileIOGroup.controls.fileIO_threshold.value;
    this.downloadService.downloadItems.pFileIO.currentEchartsFileName = this.currentEchartsFileName;
    this.downloadService.downloadItems.pFileIO.currentEchartsFdName = this.currentEchartsFdName;
    this.downloadService.downloadItems.pFileIO.echartsLabelTop = this.echartsLabelTop;
    this.downloadService.downloadItems.pFileIO.stackTranceData = this.stackTranceData;
    this.downloadService.downloadItems.pFileIO.echarts.timeList = this.echartsData.timeList;
    this.downloadService.downloadItems.pFileIO.echarts.readSpeed = this.echartsData.readSpeed;
    this.downloadService.downloadItems.pFileIO.echarts.writeSpeed = this.echartsData.writeSpeed;
    this.downloadService.downloadItems.pFileIO.fileNameMap = this.fileNameMap;
    this.downloadService.downloadItems.pFileIO.spinnerValue = this.spinnerValue;
    this.downloadService.downloadItems.pFileIO.primaryTime = this.dataLimit.primaryTime;
    this.downloadService.downloadItems.pFileIO.dataCount = this.dataLimit.dataCount;
  }
  public handelClearCache() {
    this.downloadService.downloadItems.pFileIO.currentFdTableList = [];
    this.downloadService.downloadItems.pFileIO.tableData = [];
    this.downloadService.downloadItems.pFileIO.threshold = this.fileIOGroup.controls.fileIO_threshold.value;
    this.downloadService.downloadItems.pFileIO.currentEchartsFileName = '';
    this.downloadService.downloadItems.pFileIO.currentEchartsFdName = '';
    this.downloadService.downloadItems.pFileIO.echartsLabelTop = null;
    this.downloadService.downloadItems.pFileIO.stackTranceData = [];
    this.downloadService.downloadItems.pFileIO.echarts.timeList = [];
    this.downloadService.downloadItems.pFileIO.echarts.readSpeed = [];
    this.downloadService.downloadItems.pFileIO.echarts.writeSpeed = [];
    this.downloadService.downloadItems.pFileIO.fileNameMap = {};
    this.downloadService.downloadItems.pFileIO.spinnerValue = 10;
    this.downloadService.downloadItems.pFileIO.primaryTime = null;
    this.downloadService.downloadItems.pFileIO.dataCount = 0;
  }
  public handleImportCache() { // 页面间切换
    this.dataLimit.limitData = this.downloadService.dataLimit.file_io.dataValue;
    this.dataLimit.limitTime = this.downloadService.dataLimit.file_io.timeValue;
    this.fileNameMap = this.downloadService.downloadItems.pFileIO.fileNameMap;
    this.tableListData = this.downloadService.downloadItems.pFileIO.tableData;
    this.beginFileIo = this.downloadService.dataSave.isFileIOStart;
    this.fileIOGroup.controls.fileIO_threshold.setValue(this.downloadService.dataSave.pfileIOThreshold);
    this.currentEchartsFileName = this.downloadService.downloadItems.pFileIO.currentEchartsFileName;
    this.currentEchartsFdName = this.downloadService.downloadItems.pFileIO.currentEchartsFdName;
    this.echartsLabelTop = this.downloadService.downloadItems.pFileIO.echartsLabelTop;
    const hasData = this.downloadService.downloadItems.pFileIO.echarts.timeList.findIndex((item: any) => {
      return item !== '';
    });
    if (hasData !== -1) {
      this.echartsData.timeList = this.downloadService.downloadItems.pFileIO.echarts.timeList;
    } else {
      this.echartsData.timeList = new Array(Number(this.dataLimit.limitTime) * 60).fill('');
    }
    this.timeData = this.echartsData.timeList;
    this.echartsData.readSpeed = this.downloadService.downloadItems.pFileIO.echarts.readSpeed;
    this.echartsData.writeSpeed = this.downloadService.downloadItems.pFileIO.echarts.writeSpeed;
    this.stackTranceData = this.downloadService.downloadItems.pFileIO.stackTranceData;
    this.currentFdTableList = this.downloadService.downloadItems.pFileIO.currentFdTableList;
    this.spinnerValue = this.downloadService.downloadItems.pFileIO.spinnerValue;
    this.dataLimit.primaryTime = this.downloadService.downloadItems.pFileIO.primaryTime;
    this.dataLimit.dataCount = this.downloadService.downloadItems.pFileIO.dataCount;
    let fileTable = [];
    if (this.currentEchartsFileName) {
      fileTable = this.tableListData[this.fileNameMap[this.currentEchartsFileName] - 1];
      this.handleUpdateThreads(fileTable);
    }
    if (this.currentEchartsFdName) {

    }
    if (this.srcDataTable.data.length !== 0) {
      this.initEchart();
    }
  }
  public handleImportDownload() {
    this.fileNameMap = this.downloadService.downloadItems.pFileIO.fileNameMap;
    this.tableListData = this.downloadService.downloadItems.pFileIO.tableData;
    this.fileIOGroup.controls.fileIO_threshold.setValue(
      this.downloadService.downloadItems.pFileIO.threshold);
    this.currentEchartsFileName = this.downloadService.downloadItems.pFileIO.currentEchartsFileName;
    this.currentEchartsFdName = this.downloadService.downloadItems.pFileIO.currentEchartsFdName;
    this.echartsLabelTop = this.downloadService.downloadItems.pFileIO.echartsLabelTop;
    this.echartsData.timeList = this.downloadService.downloadItems.pFileIO.echarts.timeList;
    this.timeData = this.echartsData.timeList;
    this.echartsData.readSpeed = this.downloadService.downloadItems.pFileIO.echarts.readSpeed;
    this.echartsData.writeSpeed = this.downloadService.downloadItems.pFileIO.echarts.writeSpeed;
    this.stackTranceData = this.downloadService.downloadItems.pFileIO.stackTranceData;
    this.currentFdTableList = this.downloadService.downloadItems.pFileIO.currentFdTableList;
    this.spinnerValue = this.downloadService.downloadItems.pFileIO.spinnerValue;
    if (this.currentEchartsFileName) {
      this.handleUpdateThreads(this.tableListData[this.fileNameMap[this.currentEchartsFileName] - 1]);
    }
    if (this.srcDataTable.data.length !== 0) {
      this.initEchart();
    }
  }
  public onControlAnalysis() {
    if (this.snapShot) { return; }
    if (!this.beginFileIo) {
      this.onStartFileIo();
    } else {
      this.onStopFileIo();
    }
    this.beginFileIo = !this.beginFileIo;
  }

  public onStartFileIo() {
    if (this.startBtnDisabled) { return; }

    if (!this.fileIOGroup.controls.fileIO_threshold.value) {
      const invalidEl = this.el.nativeElement.querySelector(`.fileIO-threshold.ng-invalid.ng-touched:not([tiFocused])`);
      if (invalidEl) {
        const inputEl = $(invalidEl).find('.ti3-spinner-input-box>.ti3-spinner-input')[0];
        inputEl.focus();
      }
      return;
    }
    this.getStack();
    this.isStopFlag = true;
    this.tableListData = [];
    this.srcDataTable.data = [];
    this.srcDataTableTime.data = [];
    this.currentFdTableList = [];
    this.echartsData.timeList = new Array(Number(this.dataLimit.limitTime) * 60).fill('');
    this.echartsData.readSpeed = [];
    this.echartsData.writeSpeed = [];
    this.fileIOEcharts = null;
    this.updateEchartsData();
    this.echartsLabelTop = null;
    this.stackTranceData = [];
    this.fileNameMap = {};
    this.selected = null;
    this.downloadService.downloadItems.pFileIO.tableData = [];
    this.downloadService.downloadItems.pFileIO.currentFdTableList = [];
    this.dataLimit.primaryTime = null;
    this.dataLimit.dataCount = 0;
    this.msgService.isClearProfile = false;
    this.msgService.clearProFileMessage();
    this.stompService.startStompRequest('/cmd/start-instrument-file', {
      jvmId: this.jvmId,
      guardianId: this.guardianId,
      threshold: this.fileIOGroup.controls.fileIO_threshold.value
    });
    this.downloadService.dataSave.pfileIOThreshold = this.fileIOGroup.controls.fileIO_threshold.value;
    this.downloadService.dataSave.isSocketIOStart = false;
    this.downloadService.dataSave.isJdbcStart = false;
    this.downloadService.dataSave.isjdbcPoolStart = false;
    this.downloadService.dataSave.isMongodbStart = false;
    this.downloadService.dataSave.isCassStart = false;
    this.downloadService.dataSave.isHbaseStart = false;
    this.downloadService.dataSave.isFileIOStart = true;
    if (!this.srcDataTable.data.length) {
      this.fileIoTimeout = setTimeout(() => {
        this.mytip.alertInfo({
          type: 'warn',
          content: this.i18n.profileNodataTip.fileIo,
          time: 10000
        });
      }, 30000);
    }
    this.timer = setInterval(() => {
      if (this.srcDataTable.data.length > 0) {
        this.beforeToggle(this.displayedTable[0]);
        clearInterval(this.timer);
      }
    }, 1000);
  }
  public getStack() {
    const role = sessionStorage.getItem('role');
    this.Axios.axios.get('tools/settings/stackDepth').then((res: any) => {
      this.downloadService.downloadItems.pFileIO.stackDepth = res;
      if (role === 'Admin') {
        this.stackBtnTip = this.i18nService.I18nReplace(this.i18n.newHeader.setting.stackAdmin, { 0: res });
      } else {
        this.stackBtnTip = this.i18nService.I18nReplace(this.i18n.newHeader.setting.stackUser, { 0: res });
      }
    });
  }
  public onStopFileIo() {
    this.stompService.startStompRequest('/cmd/stop-instrument-file', {
      jvmId: this.jvmId,
      guardianId: this.guardianId,
      threshold: this.fileIOGroup.controls.fileIO_threshold.value
    });
    this.downloadService.dataSave.pfileIOThreshold = this.fileIOGroup.controls.fileIO_threshold.value;
    this.downloadService.dataSave.isFileIOStart = false;
    this.fileIoTimer();
    let tempTimer = setTimeout(() => {
      if (!this.isStopFlag) {
        this.isStopFlag = true;
        return;
      }
      this.msgService.isClearProfile = true;
      this.msgService.clearProFileMessage();
      clearTimeout(tempTimer);
      tempTimer = null;
    }, this.stompService.fileIoStep);
  }
  public onSelect(event: TiTreeNode): void {
    this.selectedData = TiTreeUtil.getSelectedData(
      this.stackTranceData,
      false,
      false
    );
  }
  /**
   * 是否展开表格
   */
  public onClickExpand(): void {
    this.expand = !this.expand;
  }
  /**
   * 搜索
   * @param value value
   */
  keySearch(value: string): void {
    this.searchWords[0] = value;
  }
  searchClear(value: string): void {
    this.searchWords[0] = '';
  }
  threadSearch(value: string): void {
    this.searchThreadWords[0] = value;
  }
  threadClear(value: string): void {
    this.searchThreadWords[0] = '';
  }
  public onTypeSelect(): void {
    if (!this.columnsTableTime[1].selected.length) { this.srcDataTableTime.data = []; return; }
    this.srcDataTableTime.data = this.dataTableTime.filter((rowData: TiTableRowData): any => {
      const index: number = this.columnsTableTime[1].selected.findIndex((item: any) => {
        return item.label === rowData.type;
      });
      if (!(index < 0)) {
        return rowData;
      }
    });
  }
  /**
   * 二级数据限定
   * @param value value
   */
  public onModelChange(value: any): void {
    if (!value) {
      this.spinnerValue = 0;
    }
  }
  public timeLineData(data: any) {
    this.echartsOption.dataZoom[0].start = data.start;
    this.echartsOption.dataZoom[0].end = data.end;
    this.fileIOEcharts.setOption({
      dataZoom: this.echartsOption.dataZoom
    });
  }
  public fileIoTimer() {
    clearTimeout(this.fileIoTimeout);
    this.fileIoTimeout = null;
  }
}
