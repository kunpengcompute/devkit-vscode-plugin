import { Component, OnInit } from '@angular/core';
import { I18nService } from 'projects/java/src-web/app/service/i18n.service';
import { MessageService } from 'projects/java/src-web/app/service/message.service';
import { AxiosService } from 'projects/java/src-web/app/service/axios.service';
import { MytipService } from 'projects/java/src-web/app/service/mytip.service';
import { ProfileDownloadService } from 'projects/java/src-web/app/service/profile-download.service';

@Component({
  selector: 'app-data-limit',
  templateUrl: './data-limit.component.html',
  styleUrls: ['./data-limit.component.scss']
})
export class DataLimitComponent implements OnInit {
  public language: 'zh-cn' | 'en-us' | string = sessionStorage.getItem('language'); // 语言环境
  public i18n: any;
  constructor(
    private i18nService: I18nService,
    public Axios: AxiosService,
    public myTip: MytipService,
    private downloadService: ProfileDownloadService,
    private msgService: MessageService,
  ) {
    this.i18n = this.i18nService.I18n();
    this.formItems = {
      over_view: {
        id: '',
        timeValue: '',
      },
      jdbc: {
        id: '',
        timeValue: '',
      },
      pool_form: {
        id: '',
        dataValue: '',
      },
      mongodb: {
        id: '',
        timeValue: '',
      },
      cassandra: {
        id: '',
        timeValue: '',
      },
      hbase: {
        id: '',
        timeValue: '',
      },
      http: {
        id: '',
        timeValue: '',
      },
      file_io: {
        id: '',
        timeValue: '',
        dataValue: ''
      },
      socket_io: {
        id: '',
        timeValue: '',
        dataValue: ''
      },
      boot_metrics: {
        id: '',
        timeValue: '',
      },
      boot_traces: {
        id: '',
        timeValue: '',
        dataValue: ''
      },
      gc: {
        id: '',
        timeValue: '',
        dataValue: ''
      }
    };
  }
  public isLoading: any = false;
  public dataTabs: any = [];
  public databaseTabs: any = [];
  public ioTabs: any = [];
  public webTabs: any = [];
  public springBootTabs: any = [];
  public commonConfig: any = {};
  public formItems: any = {};
  public formItemsName = ['over_view', 'jdbc', 'pool_form', 'mongodb',
    'cassandra', 'hbase', 'http', 'file_io', 'socket_io',
    'boot_metrics', 'boot_traces', 'gc'];
  ngOnInit() {
    this.initCommonConfig();
    const dataTab = ['overview', 'gc', 'io', 'database', 'web'];
    const databaseTab = ['jdbc', 'jdbcpool', 'mongodb', 'cassandra', 'hbase'];
    const ioTab = ['fileIo', 'socketIo'];
    const webTab = ['httpRequest', 'springBoot'];
    const springBootTab = ['metrics', 'http_traces'];
    this.initArr(dataTab, this.dataTabs);
    this.initArr(webTab, this.webTabs);
    this.initArr(databaseTab, this.databaseTabs);
    this.initArr(ioTab, this.ioTabs);
    this.initArr(springBootTab, this.springBootTabs);
    this.initDataValue();
    const sub = this.msgService.getMessage().subscribe(msg => {
      if (msg.type === 'dataLimit') {
        this.initDataValue();
      }
    });
  }

  public initArr(arr: any, arrs: any) {
    arr.forEach((tab: any, idx: any) => {
      arrs.push({
        title: this.i18n.protalserver_profiling_tab[tab],
        active: idx === 0
      });
    });
  }

  public initCommonConfig() {
    this.commonConfig = {
      over_view: {
        label: this.i18n.dataLimit.timeHorizon,
        range: [1, 3]
      },
      jdbcTime: {
        label: this.i18n.dataLimit.timeHorizon,
        range: [3, 10]
      },
      jdbcpoolData: {
        label: this.i18n.dataLimit.countHorizon,
        range: [50, 100]
      },
      mongodbTime: {
        label: this.i18n.dataLimit.timeHorizon,
        range: [3, 10]
      },
      cassandraTime: {
        label: this.i18n.dataLimit.timeHorizon,
        range: [3, 10]
      },
      hbaseTime: {
        label: this.i18n.dataLimit.timeHorizon,
        range: [3, 10]
      },
      httpTime: {
        label: this.i18n.dataLimit.timeHorizon,
        range: [3, 10]
      },
      fileIoTime: {
        label: this.i18n.dataLimit.timeHorizon,
        range: [3, 10]
      },
      fileIoData: {
        label: this.i18n.dataLimit.countHorizon,
        range: [5000, 10000]
      },
      socketIoTime: {
        label: this.i18n.dataLimit.timeHorizon,
        range: [3, 10]
      },
      socketIoData: {
        label: this.i18n.dataLimit.countHorizon,
        range: [5000, 10000]
      },
      metricsTime: {
        label: this.i18n.dataLimit.timeHorizon,
        range: [5, 10]
      },
      http_tracesTime: {
        label: this.i18n.dataLimit.timeHorizon,
        range: [5, 10]
      },
      http_tracesData: {
        label: this.i18n.dataLimit.countHorizon,
        range: [3000, 5000]
      },
      gcTime: {
        label: this.i18n.dataLimit.timeHorizon,
        range: [3, 10]
      },
      gcData: {
        label: this.i18n.dataLimit.countHorizon,
        range: [300, 500]
      },
    };
  }

  public activeChange(arr: any, index: number) {
    arr.forEach((tab: any) => {
      tab.active = false;
    });
    arr[index].active = true;
  }

  public initDataValue() {
    this.isLoading = true;
    this.Axios.axios.get(`/limitation/`).then((resp: any) => {
      this.isLoading = false;
      resp.data.forEach((res: any) => {
        this.formItemsName.forEach(item => {
          if (res.limitationType === item) {
            if (res.limitationTimes) {
              this.formItems[item].timeValue = res.limitationTimes;
              this.downloadService.dataLimit[item].timeValue = res.limitationTimes;
            }
            if (res.limitationRecords) {
              this.formItems[item].dataValue = res.limitationRecords;
              this.downloadService.dataLimit[item].dataValue = res.limitationRecords;
            }
            this.formItems[item].id = res.id;
          }
        });
      });
    }).catch(() => {
      this.isLoading = false;
    });
  }

  public handleConfirm(val: any, type: any) {
    if (Number(val) === Number(this.downloadService.dataLimit[type].timeValue)
      || Number(val) === Number(this.downloadService.dataLimit[type].dataValue)) {
      return;
    }
    this.isLoading = true;
    let params = {};
    if (val < 50) {
      params = {
        limitationType: type,
        limitationTimes: Number(val)
      };
    } else {
      params = {
        limitationType: type,
        limitationRecords: Number(val)
      };
    }
    if (this.formItems[type].id !== -1) {
      this.Axios.axios.post(`/limitation/${encodeURIComponent(this.formItems[type].id)}`,
        params, { headers: { showLoading: false } })
        .then((data: any) => {
          this.isLoading = false;
          this.formItemsName.forEach(item => {
            if (item === type) {
              if (val < 50) {
                this.downloadService.dataLimit[item].timeValue = val;
              } else {
                this.downloadService.dataLimit[item].dataValue = val;
              }
              this.initDataValue();
              this.myTip.alertInfo({
                type: 'success',
                content: this.i18n.tip_msg.edite_ok,
                time: 3500,
              });
            }
          });
          this.msgService.sendMessage({
            type: 'dataLimit',
            data: {
              type,
              value: val
            },
          });
        }).catch(() => {
          this.isLoading = false;
        });
    } else {
      this.Axios.axios.post(`/limitation/`, params, { headers: { showLoading: false } }).then((data: any) => {
        this.isLoading = false;
        this.formItemsName.forEach(item => {
          if (item === type) {
            if (val < 50) {
              this.downloadService.dataLimit[item].timeValue = val;
            } else {
              this.downloadService.dataLimit[item].dataValue = val;
            }
            this.initDataValue();
            this.myTip.alertInfo({
              type: 'success',
              content: this.i18n.tip_msg.edite_ok,
              time: 3500,
            });
          }
        });
        this.msgService.sendMessage({
          type: 'dataLimit',
          data: {
            type,
            value: val
          },
        });
      }).catch(() => {
        this.isLoading = false;
      });
    }
  }

  public handleRestore(val: any, type: any) {
    if (val === this.downloadService.dataLimit[type].timeValue ||
      val === this.downloadService.dataLimit[type].dataValue) {
      return;
    }
    this.isLoading = true;
    let params = {};
    if (val < 50) {
      params = {
        limitationType: type,
        limitationTimes: Number(val)
      };
    } else {
      params = {
        limitationType: type,
        limitationRecords: Number(val)
      };
    }
    if (this.formItems[type].id !== -1) {
      this.Axios.axios.post(`/limitation/${encodeURIComponent(this.formItems[type].id)}`,
        params, { headers: { showLoading: false } })
        .then((data: any) => {
          this.isLoading = false;
          this.formItemsName.forEach(item => {
            if (item === type) {
              if (val < 50) {
                this.downloadService.dataLimit[item].timeValue = val;
                this.formItems[item].timeValue = val;
              } else {
                this.downloadService.dataLimit[item].dataValue = val;
                this.formItems[item].dataValue = val;
              }
              this.myTip.alertInfo({
                type: 'success',
                content: this.i18n.tip_msg.edite_ok,
                time: 3500,
              });
            }
          });
          this.msgService.sendMessage({
            type: 'dataLimit',
            data: {
              type,
              value: val
            },
          });
        }).catch(() => {
          this.isLoading = false;
        });
    } else {
      this.isLoading = false;
    }
  }
}
