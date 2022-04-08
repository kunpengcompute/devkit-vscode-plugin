import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ProfileDownloadService {
  public downloadItems: any = {
    diskAlarm: false,
    report: {
      alarmJFRCount: 0,
      maxJFRCount: 0,
      heapdumpReturnTitle: '',
      reportTab: '',
      threaddumpList: 0,
      alarmThreadDumpCount: 0,
      maxThreadDumpCount: 0,
      threaddumpName: '',
      heapdumpList: 0,
      alarmHeapCount: 0,
      maxHeapCount: 0,
      maxHeapSize: 0,
      heapdumpName: '',
      gcLogList: 0,
      alarmGCLogsCount: 0,
      maxGCLogsCount: 0,
      GCLogName: '',
      earlyWarningDays: 0, // 内部通信证书告警时间
    },
    profileInfo: {
      jvmId: '',
      jvmName: '',
      nowTime: '',
      toolTipDate: '',
      suggestArr: [],
      ProfilingList: [],
    },
    overview: {
      echarts: {},
      xAxisData: [],
      realtime: [],
      maxDate: [],
      timeNow: 0,
      option: {},
      environment: {},
      arguments: '',
      keyword: {},
      suggestArr: [],
      showNodate: false
    },
    thread: {
      threadList: {},
      threadDump: [],
      updateOptions: {},
      parsedSpec: [],
      parsedValues: {},
      searchValue: '',
      selectValue: [],
      saveReported: false,
      xLabels: []
    },
    javaHeap: {
      classes: []
    },
    jdbc: {
      threshold: 50,
      snapCount: 0,
      isCheck: false,
      hotspot: [],
      monitor: {
        startDate: '',
        data: {}
      },
    },
    jdbcpool: {
      threshold: 50,
      snapCount: 0,
      jdbcpoolConfig: [],
      configTitle: '',
      alertThreshold: null,
      spinnerValue: 3,
      tableData: [],
      echartsData: [],
      monitor: {
        startDate: '',
        data: {}
      },
      suggestArr: [],
      stackDepth: 0
    },
    mongodb: {
      threshold: 50,
      snapCount: 0,
      hotspot: [],
      monitor: {
        startDate: '',
        data: {}
      },
    },
    cassandra: {
      threshold: 50,
      snapCount: 0,
      hotspot: [],
      monitor: {
        startDate: '',
        data: {}
      },
    },
    hbase: {
      threshold: 50,
      snapCount: 0,
      hotspot: [],
      monitor: {
        startDate: '',
        data: {}
      },
    },
    http: {
      threshold: 50,
      snapCount: 0,
      hotspot: [],
      monitor: {
        startDate: '',
        data: {}
      },
    },
    springBoot: {
      contentTip: '',
      springBootInfo: {},
      tabs: [],
      health: {},
      beans: [],
      metrics: {
        echarts1: [],
        echarts2: [],
        echarts3: [],
        echarts4: [],
        echarts5: [],
        echartsTime: [],
        metrics: [],
      },
      httpTraces: {
        traceFailReason: '',
        allHttpTraces: [],
        httpOptions: {},
        threshold: 0,
        filterTime: {
          data: '',
          start: '',
          end: '',
        }
      },
    },
    gc: {
      tableData: [],
      startDate: {},
      maxValue: {
        yGcact: '',
        yGcstore: '',
        ycGcback: '',
        yGcpause: '',
        yGcthread: ''
      },
      suggestArr: [],
      segData: [],
      saveReported: false,
    },
    gclog: {
      gcLogId: '',
      isFinished: '',
      keyIndicatorArray: [],
      metricsData: [],
      causeSrcData: {},
      pieData: [],
      selectValue: {},
      pauseSrcData: {},
      memoryUsedArray: [],
      collectSrcData: {},
      GCHeapUsedData: {},
      GCHeapUsedArray: [],
      GCPauseTimeArray: [],
      suggestArr: [],
      youngData: {},
      mixedData: {},
      initMarkData: {},
      saveReported: false,
      showData: false,
    },
    pFileIO: {
      threshold: 1024,
      snapCount: 0,
      tableData: [],
      fileNameMap: {},
      currentEchartsFileName: '',
      currentEchartsFdName: '',
      echartsLabelTop: '',
      echartsLabelBottom: '',
      stackTranceData: [],
      currentFdTableList: [],
      spinnerValue: 10,
      primaryTime: null,
      dataCount: 0,
      echarts: {
        timeList: new Array(180).fill(''),
        readSpeed: [],
        writeSpeed: []
      },
      stackDepth: 0
    },
    pSocketIO: {
      threshold: 256,
      snapCount: 0,
      tableData: [],
      fileIPMap: {},
      isCurrentType: '',
      currentIpIndex: null,
      currentHostIndex: null,
      currentFdIndex: null,
      currentEchartsIPName: '',
      currentEchartsAddrName: '',
      currentEchartsFdName: '',
      echartsLabelTop: '',
      echartsLabelBottom: '',
      stackTranceData: [],
      currentHostTableList: [],
      currentFdTableList: [],
      spinnerValue: 10,
      primaryTime: null,
      dataCount: 0,
      echarts: {
        timeList: new Array(180).fill(''),
        readSpeed: [],
        writeSpeed: []
      },
      stackDepth: 0
    },
    heapDump: {
      recordId: '',
      newRecordId: '',
      showNodate: true,
      saveReported: false,
      dumpState: '',
      chartType: '',
      snapCount: 0,
      histogramStatus: {
        totalNumber: 0,
        currentPage: 1,
        size: 20
      },
      domtreeStatus: {
        totalNumberT: 0,
        currentTotal: 0,
      },
      histogram: [],
      domtree: []
    },
    hot: {
      hotData: {},
      params: {},
      inforData: [],
      startOnHot: false,
      beginSample: false,
      recordDataCreateTime: 0,
      recordDataDuration: 0,
      hotMethodInf: {},
      startCreating: true,
    },
    snapShot: {
      data: {},
      showSnapShotData: false,
      innerDataItem: {},
      innerDataIdx: -1,
      currentPage: 1,
      snapshotTagState: false,
      profileSnapshotNodataState: false,
      snapShotData: '',
    },
    currentTabPage: '',
    innerDataTabs: [],
    language: ''
  };
  public dataSave: any = {
    jdbcThreshold: 50,
    mongodbThreshold: 50,
    cassThreshold: 50,
    hbaseThreshold: 50,
    httpThreshold: 50,
    sprThreshold: 0,
    pfileIOThreshold: 1024,
    psocketThreshold: 256,
    jdbcPoolThreshold: 50,
    jdbcPoolAlertThreshold: null,
    jdbcPoolSpinnerValue: 3,
    jdbcPoolTableData: [],
    jdbcPoolConnect: {},
    jdbcSnapshot: 0,
    jdbcPoolSnapshot: 0,
    mongodbSnapshot: 0,
    cassandraSnapshot: 0,
    hbaseSnapshot: 0,
    httpSnapshot: 0,
    pfileIOSnapshot: 0,
    psocketIOSnapshot: 0,
    isjdbcPoolStart: false,
    isSocketIOStart: false,
    isFileIOStart: false,
    isJdbcStart: false,
    isMongodbStart: false,
    isCassStart: false,
    isHbaseStart: false,
    isHttpStart: false,
    isSpringBootStart: false,
    isSpringBootTabActive: 'health',
    isAsyncDis: false,
    isCheckAsync: false,
    jdbcpoolConfigData: [],
    configTitle: '',
    gc: {
      tableData: [],
      startDate: {},
    },
    thread: {
      threadList: {},
      threadDump: [],
      updateOptions: {}
    },
  };
  public leavePageCheck = false;
  public currentSelectJvmName = '';
  public homeFlag: any = false;
  public homeJvmVersion: any = [];
  public dataLimit: any = {
    over_view: {
      timeValue: '1',
    },
    jdbc: {
      timeValue: '3',
    },
    pool_form: {
      dataValue: '50',
    },
    mongodb: {
      timeValue: '3',
    },
    cassandra: {
      timeValue: '3',
    },
    hbase: {
      timeValue: '3',
    },
    http: {
      timeValue: '3',
    },
    file_io: {
      timeValue: '3',
      dataValue: '5000'
    },
    socket_io: {
      timeValue: '3',
      dataValue: '5000'
    },
    boot_metrics: {
      timeValue: '5',
    },
    boot_traces: {
      timeValue: '5',
      dataValue: '3000'
    },
    gc: {
      timeValue: '3',
      dataValue: '300'
    }
  };

  /**
   * 初始化 downloadItems
   */
  public initDatabase() {
    this.downloadItems = {
      diskAlarm: false,
      report: {
        alarmJFRCount: 0,
        maxJFRCount: 0,
        heapdumpReturnTitle: '',
        reportTab: '',
        threaddumpList: 0,
        alarmThreadDumpCount: 0,
        maxThreadDumpCount: 0,
        threaddumpName: '',
        heapdumpList: 0,
        alarmHeapCount: 0,
        maxHeapCount: 0,
        maxHeapSize: 0,
        heapdumpName: '',
        gcLogList: 0,
        alarmGCLogsCount: 0,
        maxGCLogsCount: 0,
        GCLogName: '',
        earlyWarningDays: 0, // 内部通信证书告警时间
      },
      profileInfo: {
        jvmId: '',
        jvmName: '',
        nowTime: '',
        toolTipDate: '',
        suggestArr: [],
        ProfilingList: [],
      },
      overview: {
        echarts: {},
        xAxisData: [],
        realtime: [],
        maxDate: [],
        timeNow: 0,
        option: {},
        environment: {},
        arguments: '',
        keyword: {},
        suggestArr: [],
        showNodate: false
      },
      thread: {
        threadList: {},
        threadDump: [],
        updateOptions: {},
        parsedSpec: [],
        parsedValues: {},
        searchValue: '',
        saveReported: false,
        selectValue: [],
        xLabels: []
      },
      javaHeap: {
        classes: []
      },
      jdbc: {
        threshold: 50,
        snapCount: 0,
        isCheck: false,
        hotspot: [],
        monitor: {
          startDate: '',
          data: {}
        },
      },
      jdbcpool: {
        threshold: 50,
        snapCount: 0,
        jdbcpoolConfig: [],
        configTitle: '',
        alertThreshold: null,
        spinnerValue: 3,
        tableData: [],
        echartsData: [],
        monitor: {
          startDate: '',
          data: {}
        },
        suggestArr: [],
        stackDepth: 0
      },
      mongodb: {
        threshold: 50,
        snapCount: 0,
        hotspot: [],
        monitor: {
          startDate: '',
          data: {}
        },
      },
      cassandra: {
        threshold: 50,
        snapCount: 0,
        hotspot: [],
        monitor: {
          startDate: '',
          data: {}
        },
      },
      hbase: {
        threshold: 50,
        snapCount: 0,
        hotspot: [],
        monitor: {
          startDate: '',
          data: {}
        },
      },
      http: {
        threshold: 50,
        snapCount: 0,
        hotspot: [],
        monitor: {
          startDate: '',
          data: {}
        },
      },
      springBoot: {
        contentTip: '',
        springBootInfo: {},
        tabs: [],
        health: {},
        beans: [],
        metrics: {
          echarts1: [],
          echarts2: [],
          echarts3: [],
          echarts4: [],
          echarts5: [],
          echartsTime: [],
          metrics: [],
        },
        httpTraces: {
          traceFailReason: '',
          allHttpTraces: [],
          httpOptions: {},
          threshold: 0,
          filterTime: {
            data: '',
            start: '',
            end: '',
          }
        }
      },
      gc: {
        tableData: [],
        startDate: {},
        maxValue: {
          yGcact: '',
          yGcstore: '',
          ycGcback: '',
          yGcpause: '',
          yGcthread: ''
        },
        suggestArr: [],
        segData: [],
        saveReported: false,
      },
      gclog: {
        gcLogId: '',
        isFinished: '',
        keyIndicatorArray: [],
        metricsData: [],
        causeSrcData: {},
        pieData: [],
        selectValue: {},
        pauseSrcData: {},
        GCPauseTimeArray: [],
        memoryUsedArray: [],
        collectSrcData: {},
        GCHeapUsedData: {},
        GCHeapUsedArray: [],
        suggestArr: [],
        youngData: {},
        mixedData: {},
        initMarkData: {},
        showData: false,
        saveReported: false,
      },
      pFileIO: {
        threshold: 1024,
        snapCount: 0,
        tableData: [],
        fileNameMap: {},
        currentEchartsFileName: '',
        currentEchartsFdName: '',
        echartsLabelTop: '',
        echartsLabelBottom: '',
        stackTranceData: [],
        currentFdTableList: [],
        spinnerValue: 10,
        primaryTime: null,
        dataCount: 0,
        echarts: {
          timeList: new Array(180).fill(''),
          readSpeed: [],
          writeSpeed: []
        },
        stackDepth: 0
      },
      pSocketIO: {
        threshold: 256,
        snapCount: 0,
        tableData: [],
        fileIPMap: {},
        isCurrentType: '',
        currentIpIndex: null,
        currentHostIndex: null,
        currentFdIndex: null,
        currentEchartsIPName: '',
        currentEchartsAddrName: '',
        currentEchartsFdName: '',
        echartsLabelTop: '',
        echartsLabelBottom: '',
        stackTranceData: [],
        currentHostTableList: [],
        currentFdTableList: [],
        spinnerValue: 10,
        primaryTime: null,
        dataCount: 0,
        echarts: {
          timeList: new Array(180).fill(''),
          readSpeed: [],
          writeSpeed: []
        },
        stackDepth: 0
      },
      heapDump: {
        recordId: '',
        newRecordId: '',
        chartType: '',
        showNodate: true,
        saveReported: false,
        dumpState: '',
        snapCount: 0,
        histogramStatus: {
          totalNumber: 0,
          currentPage: 1,
          size: 20
        },
        domtreeStatus: {
          totalNumberT: 0,
          currentTotal: 0,
        },
        histogram: [],
        domtree: []
      },
      hot: {
        hotData: {},
        params: {},
        inforData: [],
        startOnHot: false,
        beginSample: false,
        recordDataCreateTime: 0,
        recordDataDuration: 0,
        hotMethodInf: {},
        startCreating: true,
      },
      snapShot: {
        data: {},
        showSnapShotData: false,
        innerDataItem: {},
        innerDataIdx: -1,
        currentPage: 1,
        snapshotTagState: false,
        profileSnapshotNodataState: false,
        snapShotData: '',
      },
      currentTabPage: '',
      innerDataTabs: [],
      language: ''
    };
    this.dataSave = {
      jdbcThreshold: 50,
      mongodbThreshold: 50,
      cassThreshold: 50,
      hbaseThreshold: 50,
      httpThreshold: 50,
      sprThreshold: 0,
      pfileIOThreshold: 1024,
      psocketThreshold: 256,
      jdbcPoolThreshold: 50,
      jdbcPoolAlertThreshold: null,
      jdbcPoolSpinnerValue: 3,
      jdbcPoolTableData: [],
      jdbcPoolConnect: {},
      jdbcSnapshot: 0,
      jdbcPoolSnapshot: 0,
      mongodbSnapshot: 0,
      cassandraSnapshot: 0,
      hbaseSnapshot: 0,
      httpSnapshot: 0,
      pfileIOSnapshot: 0,
      psocketIOSnapshot: 0,
      isjdbcPoolStart: false,
      isSocketIOStart: false,
      isFileIOStart: false,
      isJdbcStart: false,
      isMongodbStart: false,
      isCassStart: false,
      isHbaseStart: false,
      isHttpStart: false,
      isSpringBootStart: false,
      isSpringBootTabActive: 'health',
      isAsyncDis: false,
      isCheckAsync: false,
      jdbcpoolConfigData: [],
      configTitle: '',
      gc: {
        tableData: [],
        startDate: {},
      },
      thread: {
        threadList: {},
        threadDump: [],
        updateOptions: {}
      },
    };
  }
  constructor() { }
}
