import { Component, OnInit, OnDestroy } from '@angular/core';
import { I18nService } from 'projects/java/src-web/app/service/i18n.service';
import { AxiosService } from 'projects/java/src-web/app/service/axios.service';
import { MytipService } from 'projects/java/src-web/app/service/mytip.service';
import { ProfileDownloadService } from 'projects/java/src-web/app/service/profile-download.service';
@Component({
  selector: 'app-threshold',
  templateUrl: './threshold.component.html',
  styleUrls: ['./threshold.component.scss']
})
export class ThresholdComponent implements OnInit, OnDestroy {
  constructor(
    public Axios: AxiosService,
    public i18nService: I18nService,
    public myTip: MytipService,
    public downloadService: ProfileDownloadService) {
    this.i18n = this.i18nService.I18n();
    this.formItems = {
      tips: {
        title: this.i18n.newHeader.threshold.tips,
        value: '',
        errMsg: '',
        notice: '(1~20)',
        valid: true,
        isModify: false,
        require: true,
        format: 'N0'
      },
      warn: {
        title: this.i18n.newHeader.threshold.warn,
        value: '',
        errMsg: '',
        notice: '(1~20)',
        valid: true,
        isModify: false,
        require: true,
        format: 'N0'
      },
      threadDumpHistReportHints: {
        title: this.i18n.newHeader.offlineReport.threadDump.histReportHints,
        value: '',
        errMsg: '',
        notice: '(1~10)',
        valid: true,
        isModify: false,
        require: true,
        format: 'N0'
      },
      threadDumpHistReportMax: {
        title: this.i18n.newHeader.offlineReport.threadDump.histReportMax,
        value: '',
        errMsg: '',
        notice: '(1~10)',
        valid: true,
        isModify: false,
        require: true,
        format: 'N0'
      },
      histReportHints: {
        title: this.i18n.newHeader.offlineReport.heapDump.histReportHints,
        value: '',
        errMsg: '',
        notice: '(1~10)',
        valid: true,
        isModify: false,
        require: true,
        format: 'N0'
      },
      histReportMax: {
        title: this.i18n.newHeader.offlineReport.heapDump.histReportMax,
        value: '',
        errMsg: '',
        notice: '(1~10)',
        valid: true,
        isModify: false,
        require: true,
        format: 'N0'
      },
      histReportSize: {
        title: this.i18n.newHeader.offlineReport.heapDump.ImportReportSize,
        value: '',
        errMsg: '',
        notice: '',
        valid: true,
        isModify: false,
        require: true,
        format: 'N0'
      },
      GCLogsHistReportHints: {
        title: this.i18n.newHeader.offlineReport.threadDump.histReportHints,
        value: '',
        errMsg: '',
        notice: '(1~10)',
        valid: true,
        isModify: false,
        require: true,
        format: 'N0'
      },
      GCLogsHistReportMax: {
        title: this.i18n.newHeader.offlineReport.threadDump.histReportMax,
        value: '',
        errMsg: '',
        notice: '(1~10)',
        valid: true,
        isModify: false,
        require: true,
        format: 'N0'
      },
    };
  }
  public i18n: any;
  public formItems: any = {
    tips: {
      title: '',
      value: '',
      errMsg: '',
      notice: '',
      valid: true,
      isModify: false,
      require: true,
      format: 'N0'
    },
    warn: {
      title: '',
      value: '',
      errMsg: '',
      notice: '',
      valid: true,
      isModify: false,
      require: true,
      format: 'N0'
    },
    threadDumpHistReportHints: {
      title: '',
      value: '',
      errMsg: '',
      notice: '',
      valid: true,
      isModify: false,
      require: true,
      format: 'N0'
    },
    threadDumpHistReportMax: {
      title: '',
      value: '',
      errMsg: '',
      notice: '',
      valid: true,
      isModify: false,
      require: true,
      format: 'N0'
    },
    histReportHints: {
      title: '',
      value: '',
      errMsg: '',
      notice: '',
      valid: true,
      isModify: false,
      require: true,
      format: 'N0'
    },
    histReportMax: {
      title: '',
      value: '',
      errMsg: '',
      notice: '',
      valid: true,
      isModify: false,
      require: true,
      format: 'N0'
    },
    histReportSize: {
      title: '',
      value: '',
      errMsg: '',
      notice: '',
      valid: true,
      isModify: false,
      require: true,
      format: 'N0'
    },
    GCLogsHistReportHints: {
      title: '',
      value: '',
      errMsg: '',
      notice: '',
      valid: true,
      isModify: false,
      require: true,
      format: 'N0'
    },
    GCLogsHistReportMax: {
      title: '',
      value: '',
      errMsg: '',
      notice: '',
      valid: true,
      isModify: false,
      require: true,
      format: 'N0'
    },
  };
  public config = {
    tips: {
      label: '',
      range: [1, 20],
      text: '',
      value: this.formItems.warn.value
    },
    warn: {
      label: '',
      range: [1, 20],
      text: '',
      value: this.formItems.tips.value
    },
    threadDumpHintsLimit: {
      label: '',
      range: [1, 10],
      text: '',
      type: 'threadDump',
      value: this.formItems.histReportHints.value
    },
    threadDumpMaxLimit: {
      label: '',
      range: [1, 10],
      text: '',
      value: this.formItems.histReportMax.value
    },
    hintsLimit: {
      label: '',
      range: [1, 10],
      text: '',
      type: 'heapDump',
      value: this.formItems.histReportHints.value
    },
    maxLimit: {
      label: '',
      range: [1, 10],
      text: '',
      value: this.formItems.histReportMax.value
    },
    sizeLimit: {
      label: '',
      range: [1, 2048],
      text: ''
    },
    GCLogsHintsLimit: {
      label: '',
      range: [1, 10],
      text: '',
      type: 'gcLogs',
      value: this.formItems.histReportHints.value
    },
    GCLogsMaxLimit: {
      label: '',
      range: [1, 10],
      text: '',
      value: this.formItems.histReportMax.value
    },
  };
  public valueCopy: number;
  public minNum = '';
  public maxNum = '';
  public isLoading: any = false;
  ngOnInit() {
    this.config.tips.label = this.i18n.newHeader.threshold.tips;
    this.config.warn.label = this.i18n.newHeader.threshold.warn;
    this.config.warn.text = this.i18n.newHeader.threshold.warn_content;
    this.config.tips.text = this.i18n.newHeader.threshold.tips_content;
    // 线程转储
    this.config.threadDumpHintsLimit.label = this.i18n.newHeader.offlineReport.threadDump.histReportHints;
    this.config.threadDumpMaxLimit.label = this.i18n.newHeader.offlineReport.threadDump.histReportMax;
    this.config.threadDumpHintsLimit.text = this.i18n.newHeader.offlineReport.threadDump.histReportHintsText;
    this.config.threadDumpMaxLimit.text = this.i18n.newHeader.offlineReport.threadDump.histReportMaxText;
    // 内存转储
    this.config.hintsLimit.label = this.i18n.newHeader.offlineReport.heapDump.histReportHints;
    this.config.maxLimit.label = this.i18n.newHeader.offlineReport.heapDump.histReportMax;
    this.config.sizeLimit.label = this.i18n.newHeader.offlineReport.heapDump.ImportReportSize;
    this.config.hintsLimit.text = this.i18n.newHeader.offlineReport.heapDump.histReportHintsText;
    this.config.maxLimit.text = this.i18n.newHeader.offlineReport.heapDump.histReportMaxText;
    this.config.sizeLimit.text = this.i18n.newHeader.offlineReport.heapDump.ImportReportSizeText;
    // GCLogs
    this.config.GCLogsHintsLimit.label = this.i18n.newHeader.offlineReport.GCLogs.histReportHints;
    this.config.GCLogsMaxLimit.label = this.i18n.newHeader.offlineReport.GCLogs.histReportMax;
    this.config.GCLogsHintsLimit.text = this.i18n.newHeader.offlineReport.GCLogs.histReportHintsText;
    this.config.GCLogsMaxLimit.text = this.i18n.newHeader.offlineReport.GCLogs.histReportMaxText;

    this.getReportNum();
    this.getHeapDumpLimit();
    this.getThreadDumpLimit();
    this.getGCLogsLimit();
  }
  ngOnDestroy() {
    this.getReportNum();
  }
  public handleTipsConfirm(val: any) {
    if (Number(val) === Number(this.downloadService.downloadItems.report.alarmJFRCount)) {
      return;
    }
    this.isLoading = true;
    this.Axios.axios
      .post('/tools/settings/report', {
        maxJFRCount: this.formItems.warn.value,
        alarmJFRCount: Number(val)
      }, { headers: { showLoading: false } })
      .then((res: any) => {
        this.isLoading = false;
        if (res.code === 0) {
          this.myTip.alertInfo({
            type: 'success',
            content: this.i18n.tip_msg.edite_ok,
            time: 3500
          });
          this.getReportNum();
        } else {
          this.myTip.alertInfo({
            type: 'warn',
            content: this.i18n.newHeader.threshold.count,
            time: 3500
          });
          return;
        }
      }).catch(() => {
        this.isLoading = false;
      });
  }
  public handleWarnConfirm(val: any) {
    if (Number(val) === Number(this.downloadService.downloadItems.report.maxJFRCount)) {
      return;
    }
    this.isLoading = true;
    this.Axios.axios
      .post('/tools/settings/report', {
        maxJFRCount: Number(val),
        alarmJFRCount: this.formItems.tips.value
      }, { headers: { showLoading: false } })
      .then((res: any) => {
        this.isLoading = false;
        if (res.code === 0) {
          this.myTip.alertInfo({
            type: 'success',
            content: this.i18n.tip_msg.edite_ok,
            time: 3500
          });
          this.getReportNum();
        }
      }).catch(() => {
        this.isLoading = false;
      });
  }
  // 1.	查询分析报告的配置
  public getReportNum() {
    this.isLoading = true;
    this.Axios.axios.get('/tools/settings/report').then((res: any) => {
      this.isLoading = false;
      this.formItems.tips.value = res.alarmJFRCount;
      this.formItems.warn.value = res.maxJFRCount;
      this.config.tips.value = res.maxJFRCount;
      this.config.warn.value = res.alarmJFRCount;
      this.downloadService.downloadItems.report.alarmJFRCount = res.alarmJFRCount;
      this.downloadService.downloadItems.report.maxJFRCount = res.maxJFRCount;
    }).catch(() => {
      this.isLoading = false;
    });
  }
  public getHeapDumpLimit() {
    this.isLoading = true;
    this.Axios.axios.get('/tools/settings/heap').then((data: any) => {
      this.formItems.histReportHints.value = data.alarmHeapCount;
      this.formItems.histReportMax.value = data.maxHeapCount;
      this.formItems.histReportSize.value = data.maxHeapSize;
      this.config.hintsLimit.value = data.maxHeapCount; // 获取比较的value
      this.config.maxLimit.value = data.alarmHeapCount; // 获取比较的value
      this.downloadService.downloadItems.report.maxHeapCount = data.maxHeapCount;
      this.downloadService.downloadItems.report.alarmHeapCount = data.alarmHeapCount;
      this.downloadService.downloadItems.report.maxHeapSize = data.maxHeapSize;
      this.isLoading = false;
    }).catch(() => {
      this.isLoading = false;
    });
  }
  /**
   * 判断历史报告提示阈值是否合法，合法则发送数据，成功后按钮回到可修改状态，不合法则不执行，保留当前状态
   */
  public handleHistReportHints(val: number) {
    if (Number(val) === Number(this.downloadService.downloadItems.report.alarmHeapCount)) {
      return;
    }
    this.isLoading = true;
    const params =
    {
      alarmHeapCount: val, // 历史报告提示阈值
      maxHeapCount: this.formItems.histReportMax.value, // 历史报告最大阈值
      maxHeapSize: this.formItems.histReportSize.value, // 历史报告提示阈值
    };
    this.Axios.axios.post('/tools/settings/heap', params).then((res: any) => {
      this.isLoading = false;
      this.formItems.histReportHints.isModify = false;
      this.formItems.histReportHints.value = val;
      this.downloadService.downloadItems.report.alarmHeapCount = val;
      this.myTip.alertInfo({
        type: 'success',
        content: this.i18n.tip_msg.edite_ok,
        time: 3500,
      });
      this.getHeapDumpLimit();
    }).catch(() => {
      this.isLoading = false;
    });
  }
  /**
   * 判断历史报告最大阈值是否合法，合法则发送数据，成功后按钮回到可修改状态，不合法则不执行，保留当前状态
   */
  public handlehistReportMax(val: number) {
    if (Number(val) === Number(this.downloadService.downloadItems.report.maxHeapCount)) {
      return;
    }
    this.isLoading = true;
    const params =
    {
      alarmHeapCount: this.formItems.histReportHints.value, // 历史报告提示阈值
      maxHeapCount: val, // 历史报告最大阈值
      maxHeapSize: this.formItems.histReportSize.value, // 历史报告提示阈值
    };
    this.Axios.axios.post('/tools/settings/heap', params).then((res: any) => {
      this.isLoading = false;
      this.formItems.histReportHints.isModify = false;
      this.formItems.histReportMax.value = val;
      this.downloadService.downloadItems.report.maxHeapCount = val;
      this.myTip.alertInfo({
        type: 'success',
        content: this.i18n.tip_msg.edite_ok,
        time: 3500,
      });
      this.getHeapDumpLimit();
    }).catch(() => {
      this.isLoading = false;
    });
  }
  /**
   * 判断导入报告大小阈值（MB）是否合法，合法则发送数据，成功后按钮回到可修改状态，不合法则不执行，保留当前状态
   */
  public handlehistReportSize(val: number) {
    if (Number(val) === Number(this.downloadService.downloadItems.report.maxHeapSize)) {
      return;
    }
    this.isLoading = true;
    const params =
    {
      alarmHeapCount: this.formItems.histReportHints.value, // 历史报告提示阈值
      maxHeapCount: this.formItems.histReportMax.value, // 历史报告最大阈值
      maxHeapSize: val, // 历史报告提示阈值
    };
    this.Axios.axios.post('/tools/settings/heap', params).then((res: any) => {
      this.isLoading = false;
      this.formItems.histReportHints.isModify = false;
      if (res.code === 0) {
        this.formItems.histReportSize.value = val;
        this.downloadService.downloadItems.report.maxHeapSize = val;
        this.myTip.alertInfo({
          type: 'success',
          content: this.i18n.tip_msg.edite_ok,
          time: 3500,
        });
        this.getHeapDumpLimit();
      }
    }).catch(() => {
      this.isLoading = false;
    });
  }
  // 线程转储
  /**
   * 获取线程转储的数据限定
   */
  public getThreadDumpLimit() {
    this.isLoading = true;
    this.Axios.axios.get('/tools/settings/threadDump').then((data: any) => {
      this.formItems.threadDumpHistReportHints.value = data.alarmThreadDumpCount;
      this.formItems.threadDumpHistReportMax.value = data.maxThreadDumpCount;
      this.config.threadDumpHintsLimit.value = data.maxThreadDumpCount;
      this.config.threadDumpMaxLimit.value = data.alarmThreadDumpCount;
      this.downloadService.downloadItems.report.alarmThreadDumpCount = data.alarmThreadDumpCount;
      this.downloadService.downloadItems.report.maxThreadDumpCount = data.maxThreadDumpCount;
      this.isLoading = false;
    }).catch(() => {
      this.isLoading = false;
    });
  }
  /**
   * 判断历史报告提示阈值是否合法，合法则发送数据，成功后按钮回到可修改状态，不合法则不执行，保留当前状态
   */
  public handleTDHistReportHints(val: number) {
    if (Number(val) === Number(this.downloadService.downloadItems.report.alarmThreadDumpCount)) {
      return;
    }
    this.isLoading = true;
    const params =
    {
      alarmThreadDumpCount: val, // 历史报告提示阈值
      maxThreadDumpCount: this.formItems.threadDumpHistReportMax.value, // 历史报告最大阈值
    };
    this.Axios.axios.post('/tools/settings/threadDump', params).then((res: any) => {
      this.isLoading = false;
      this.formItems.threadDumpHistReportHints.isModify = false;
      this.formItems.threadDumpHistReportHints.value = val;
      this.downloadService.downloadItems.report.alarmThreadDumpCount = val;
      this.myTip.alertInfo({
        type: 'success',
        content: this.i18n.tip_msg.edite_ok,
        time: 3500,
      });
      this.getThreadDumpLimit();
    }).catch(() => {
      this.isLoading = false;
    });
  }
  /**
   * 判断历史报告提示阈值是否合法，合法则发送数据，成功后按钮回到可修改状态，不合法则不执行，保留当前状态
   */
  public handleTDHistReportMax(val: number) {
    if (Number(val) === Number(this.downloadService.downloadItems.report.maxThreadDumpCount)) {
      return;
    }
    this.isLoading = true;
    const params =
    {
      alarmThreadDumpCount: this.formItems.threadDumpHistReportHints.value, // 历史报告提示阈值
      maxThreadDumpCount: val, // 历史报告最大阈值
    };
    this.Axios.axios.post('/tools/settings/threadDump', params).then((res: any) => {
      this.isLoading = false;
      this.formItems.threadDumpHistReportMax.isModify = false;
      this.formItems.threadDumpHistReportMax.value = val;
      this.downloadService.downloadItems.report.maxThreadDumpCount = val;
      this.myTip.alertInfo({
        type: 'success',
        content: this.i18n.tip_msg.edite_ok,
        time: 3500,
      });
      this.getThreadDumpLimit();
    }).catch(() => {
      this.isLoading = false;
    });
  }
  // GCLogs
  /**
   * 获取GCLogs的数据限定
   */
  public getGCLogsLimit() {
    this.isLoading = true;
    this.Axios.axios.get('/tools/settings/gcLog').then((data: any) => {
      this.formItems.GCLogsHistReportHints.value = data.alarmGcLogCount;
      this.formItems.GCLogsHistReportMax.value = data.maxGcLogCount;
      this.config.GCLogsHintsLimit.value = data.maxGcLogCount;
      this.config.GCLogsMaxLimit.value = data.alarmGcLogCount;
      this.downloadService.downloadItems.report.alarmGCLogsCount = data.alarmGcLogCount;
      this.downloadService.downloadItems.report.maxGCLogsCount = data.maxGcLogCount;
      this.isLoading = false;
    }).catch(() => {
      this.isLoading = false;
    });
  }
  /**
   * 判断历史报告提示阈值是否合法，合法则发送数据，成功后按钮回到可修改状态，不合法则不执行，保留当前状态
   */
  public handleGCLogsHistReportHints(val: number) {
    if (Number(val) === Number(this.downloadService.downloadItems.report.alarmGCLogsCount)) {
      return;
    }
    this.isLoading = true;
    const params =
    {
      alarmGcLogCount: Number(val), // 历史报告提示阈值
      maxGcLogCount: this.formItems.GCLogsHistReportMax.value, // 历史报告最大阈值
    };
    this.Axios.axios.post('/tools/settings/gcLog', params).then((res: any) => {
      this.isLoading = false;
      this.formItems.GCLogsHistReportHints.isModify = false;
      this.formItems.GCLogsHistReportHints.value = val;
      this.downloadService.downloadItems.report.alarmGCLogsCount = val;
      this.myTip.alertInfo({
        type: 'success',
        content: this.i18n.tip_msg.edite_ok,
        time: 3500,
      });
      this.getGCLogsLimit();
    }).catch(() => {
      this.isLoading = false;
    });
  }
  /**
   * 判断历史报告提示阈值是否合法，合法则发送数据，成功后按钮回到可修改状态，不合法则不执行，保留当前状态
   */
  public handleGCLogsHistReportMax(val: number) {
    if (Number(val) === Number(this.downloadService.downloadItems.report.maxGCLogsCount)) {
      return;
    }
    this.isLoading = true;
    const params =
    {
      alarmGcLogCount: this.formItems.GCLogsHistReportHints.value, // 历史报告提示阈值
      maxGcLogCount: Number(val), // 历史报告最大阈值
    };
    this.Axios.axios.post('/tools/settings/gcLog', params).then((res: any) => {
      this.isLoading = false;
      this.formItems.GCLogsHistReportMax.isModify = false;
      this.formItems.GCLogsHistReportMax.value = val;
      this.downloadService.downloadItems.report.maxGCLogsCount = val;
      this.myTip.alertInfo({
        type: 'success',
        content: this.i18n.tip_msg.edite_ok,
        time: 3500,
      });
      this.getGCLogsLimit();
    }).catch(() => {
      this.isLoading = false;
    });
  }
}
