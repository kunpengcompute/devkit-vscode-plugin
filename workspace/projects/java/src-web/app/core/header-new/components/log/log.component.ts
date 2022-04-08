import { Component, OnInit, ViewChild } from '@angular/core';
import { I18nService } from 'projects/java/src-web/app/service/i18n.service';
import { AxiosService } from 'projects/java/src-web/app/service/axios.service';
import { MytipService } from 'projects/java/src-web/app/service/mytip.service';
import { LibService } from 'projects/java/src-web/app/service/lib.service';
import {
  TiTableColumns,
  TiTableComponent,
  TiTableDataState,
  TiTableRowData,
  TiTableSrcData,
} from '@cloud/tiny3';

@Component({
  selector: 'app-log',
  templateUrl: './log.component.html',
  styleUrls: ['./log.component.scss']
})
export class LogComponent implements OnInit {
  public role = sessionStorage.getItem('role');
  public operationLog: any = {}; // 操作日志
  public runLog: any = {}; // 运行日志
  public publicLog: any = {}; // 公共日志
  public optimizeLog: any = {}; // 性能优化日志
  public i18n: any;
  public displayedLog: Array<TiTableRowData> = []; // 表示表格实际呈现的数据（开发者默认设置为[]即可）
  public displayedDetailLog: Array<TiTableRowData> = []; // 表示表格实际呈现的数据（开发者默认设置为[]即可）
  public displayedPublicLog: Array<TiTableRowData> = [];
  public logList: TiTableSrcData;
  public publiclogList: TiTableSrcData;
  public detailLogData: TiTableSrcData;
  public columsLog: Array<TiTableColumns> = [];
  public displayedRunLog: Array<TiTableRowData> = []; // 运行日志列表
  public runLogList: TiTableSrcData;
  public columnsRunLog: Array<TiTableColumns> = [];
  public detailLogColumns: Array<TiTableColumns> = [];
  public sortLog: any = [];
  public tab1s: any[] = [];
  public tab2s: any[] = [];

  public currentPageLog = 1;
  public totalNumberLog = 20;
  public currentPagePublicLog = 1;
  public totalNumberPublicLog = 20;
  public pageSizeLog: { options: Array<number>; size: number } = {
    options: [10, 20, 50, 100],
    size: 20,
  };
  public pageSizePublicLog: { options: Array<number>; size: number } = {
    options: [10, 20, 50, 100],
    size: 20,
  };
  public downTitle: string;
  public hoverClose: any;
  constructor(
    public i18nService: I18nService,
    public Axios: AxiosService,
    public mytip: MytipService,
    public libService: LibService
  ) {
    this.i18n = this.i18nService.I18n();
    this.tab1s = [
      {
        title: this.i18n.common_term_admin_log,
        active: true
      },
      {
        title: this.i18n.common_term_admin_run_log,
        active: false
      }
    ];
    this.tab2s = [
      {
        title: this.role === 'Admin' ? this.i18n.common_term_admin_public_log : this.i18n.common_term_user_public_log,
        active: this.role === 'Admin' ? true : false
      },
      {
        title: this.role === 'Admin' ?
         this.i18n.common_term_admin_optimize_log : this.i18n.common_term_user_optimize_log,
        active: this.role === 'Admin' ? false : true
      }
    ];
    this.operationLog = {
      title: this.i18n.common_term_admin_log,
      active: true
    };
    this.runLog = {
      title: this.i18n.common_term_admin_run_log
    };
    this.publicLog = {
      title: this.i18n.common_term_admin_public_log,
      active: true
    };
    this.optimizeLog = {
      title: this.i18n.common_term_admin_optimize_log
    };
  }
  public isLoadingPub: any = false;
  public isLoadingJava: any = false;
  public isLoadingOper: any = false;

  @ViewChild('logDown') logDown: any;

  ngOnInit() {
    this.columsLog = [
      {
        title: this.i18n.common_term_log_user,
        width: '12%',
      },
      {
        title: this.i18n.common_term_log_event,
        width: '13%',
      },
      {
        title: this.i18n.common_term_log_result,
        sortKey: 'age',
        width: '12.5%',
      },
      {
        title: this.i18n.common_term_log_ip,
        width: '12.5%',
      },
      {
        title: this.i18n.common_term_log_time,
        width: '15%',
      },
      {
        title: this.i18n.common_term_log_Detail,
        width: '35%',
      },
    ];
    // run log
    this.columnsRunLog = [
      {
        title: this.i18n.common_term_admin_log_fileName,
        width: '70%',
      },
      {
        title: this.i18n.common_term_operate,
        width: '30%',
      },
    ];
    this.detailLogColumns = [
      {
        title: this.i18n.common_term_admin_log_fileName,
        width: '70%'
      }, {
        title: this.i18n.common_term_admin_log_size,
        width: '30%'
      }
    ];
    this.sortLog = [
      this.i18n.run_log.java_run_log
    ];
    this.detailLogData = {
      data: [],
      state: {
        searched: false, // 源数据未进行搜索处理
        sorted: false, // 源数据未进行排序处理
        paginated: false, // 源数据未进行分页处理
      },
    };
    this.showLogList(this.currentPageLog, this.pageSizeLog.size);
    this.showPublicLog(this.currentPagePublicLog, this.pageSizePublicLog.size);
  }
  public tabsToggle(index: any) {
    this.tab1s.forEach((tab: any) => {
      tab.active = false;
    });
    this.tab1s[index].active = true;
  }
  public tabsToggle2(index: any) {
    this.tab2s.forEach((tab: any) => {
      tab.active = false;
    });
    this.tab2s[index].active = true;
  }

  public stateUpdate(tiTable: TiTableComponent): void {
    const dataState: TiTableDataState = tiTable.getDataState();
    this.showLogList(
      dataState.pagination.currentPage,
      dataState.pagination.itemsPerPage
    );
  }
  public statePublicUpdate(tiTable: TiTableComponent): void {
    const dataState: TiTableDataState = tiTable.getDataState();
    this.showPublicLog(
      dataState.pagination.currentPage,
      dataState.pagination.itemsPerPage
    );
  }
  // java调优日志显示
  public showLogList(currentPageLog: any, totalNumberLog: any) {
    this.isLoadingJava = true;
    this.Axios.axios
      .get(`/audits?page=${encodeURIComponent(currentPageLog - 1)}&size=${encodeURIComponent(totalNumberLog)}`)
      .then((data: any) => {
        this.isLoadingJava = false;
        if (data) {
          this.logList = {
            data: data.members,
            state: {
              searched: false, // 源数据未进行搜索处理
              sorted: false, // 源数据未进行排序处理
              paginated: true, // 源数据未进行分页处理
            },
          };
          this.totalNumberLog = data.totalElements;
        }
      }).catch(() => {
        this.isLoadingJava = false;
      });
  }
  // 公共日志显示
  public showPublicLog(currentPageLog: any, totalNumberLog: any) {
    this.isLoadingPub = true;
    const cLog = encodeURIComponent(currentPageLog);
    this.Axios.axios.get(`/operation-logs/?page=${cLog}&per-page=${encodeURIComponent(totalNumberLog)}`,
    { baseURL: '../user-management/api/v2.2' }).then((data: any) => {
      this.isLoadingPub = false;
      if (data) {
        data.data.logs.forEach((item: any) => {
          if (item.Time.indexOf('-') !== -1) {
            item.Time = item.Time.split('-').join('/');
          }
        });
        this.publiclogList = {
          data: data.data.logs,
          state: {
            searched: false, // 源数据未进行搜索处理
            sorted: false, // 源数据未进行排序处理
            paginated: true, // 源数据未进行分页处理
          }
        };
        this.totalNumberPublicLog = data.data.totalCounts;
      }
    }).catch(() => {
      this.isLoadingPub = false;
    });
  }

  public operationLogDownload() {
    this.isLoadingJava = true;
    this.Axios.axios.get(`/audits/file`).then((resp: any) => {
      this.isLoadingJava = false;
      this.downloadJson2Csv(resp.members);
    }).catch(() => {
      this.isLoadingJava = false;
    });
  }
  public publicLogDownload() {
    this.isLoadingPub = true;
    this.Axios.axios.get(`/operation-logs/download/`, { baseURL: '../user-management/api/v2.2', responseType: 'blob' })
    .then((resp: any) => {
      this.isLoadingPub = false;
      this.downloadPublic2Csv(resp);
    }).catch(() => {
      this.isLoadingPub = false;
    });
  }
  public downloadPublic2Csv(report: any) {
    const filename = this.i18n.common_term_admin_public_log;
    if (window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveOrOpenBlob(report, filename + '.csv');
    } else {
      const exportBlob = new Blob([report]);
      const saveLink = document.createElement('a');
      saveLink.href = window.URL.createObjectURL(exportBlob);
      saveLink.download = filename + '.csv';
      saveLink.click();
    }
  }
  public downloadJson2Csv(report: any) {
    const str = this.formateDataToCSV(report);
    const CSV = 'data:text/csv;charset=utf-8,\ufeff' + encodeURIComponent(str);
    const filename = this.i18n.common_term_admin_optimize_log;
    const link = document.createElement('a');
    link.href = CSV;
    link.setAttribute('style', 'visibility:hidden');
    link.download = filename + '.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  formateDataToCSV(report: any) {
    const language = sessionStorage.getItem('language');
    let row1 = '';
    if (language === 'zh-cn') {
      row1 = '操作用户, 操作名称, 操作结果, 操作主机IP, 操作时间, 操作详情' + '\r\n';
    } else {
      row1 = 'User Name, Event, Result, IP, Time, Detail' + '\r\n';
    }
    report.forEach((item: any, index: any) => {
      const status = item.succeed ? 'Successful' : 'Failed';
      const time = this.libService.dateFormat(item.createTime * 1000, 'yyyy/MM/dd hh:mm:ss');
      row1 +=
        `${item.username},"${item.operation}",${status},"${item.clientIp}",${time},"${item.resource}"\r\n`;
    });
    const CSV = row1;
    return CSV;
  }
  public logDownload(data: any) {
    this.downTitle = data;
    if (data === this.i18n.run_log.admin_manager_log) {
      this.getDetailData();
    } else {
      this.getRunLogFile();
    }
  }
  // 下载运行日志
  public downloadRunLog() {
    if (this.downTitle === this.i18n.run_log.admin_manager_log) {
      this.adminRunLog(this.detailLogData.data[0].fileName);
    } else {
      this.runLogDownload(this.detailLogData.data[0].fileName);
    }
  }
  public adminRunLog(data: any) {
    this.Axios.axios.get(`/run-logs/download/?log-name=${encodeURIComponent(data)}`,
      { baseURL: '../user-management/api/v2.2', responseType: 'blob' }).then((res: any) => {
      this.logDown.close();
      if (window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(res, data);
      } else {
        const exportBlob = new Blob([res]);
        const saveLink = document.createElement('a');
        saveLink.href = window.URL.createObjectURL(exportBlob);
        saveLink.download = data;
        saveLink.click();
      }
    });
  }
  public runLogDownload(data: any) {
    this.Axios.axios.get(`/logging/files/download?fileName=${encodeURIComponent(data)}`,
    { responseType: 'blob', headers: { showLoading: true } }).then((res: any) => {
      this.logDown.close();
      if ('msSaveOrOpenBlob' in navigator) {
        window.navigator.msSaveOrOpenBlob(res, data);
      } else {
        const href = URL.createObjectURL(res);
        const link: any = document.createElement('a'); // 转换完成，创建一个a标签用于下载
        link.style.display = 'none';
        link.href = href;
        link.setAttribute('download', data);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }).catch((error: any) => {
      const reader = new FileReader();
      reader.readAsText(error.response.data);
      reader.onload = (e) => {
        const msgObj = JSON.parse(reader.result as string);
        this.mytip.alertInfo({
          type: 'warn',
          content: msgObj.message,
          time: 10000,
        });
      };
    });
  }
  // Java运行日志列表
  public getRunLogFile() {
    this.isLoadingOper = true;
    this.Axios.axios.get('/logging/files').then((res: any) => {
      this.isLoadingOper = false;
      this.logDown.open();
      const data = res.members;
      this.detailLogData.data = data;
    }).catch(() => {
      this.isLoadingOper = false;
    });
  }
  // 用户运行日志
  public getDetailData() {
    this.isLoadingOper = true;
    this.Axios.axios.get('/run-logs/', { baseURL: '../user-management/api/v2.2' }).then((res: any) => {
      this.isLoadingOper = false;
      this.logDown.open();
      const data = [{
        fileName: res.data.logs.file_name[0],
        fileSize: res.data.logs.file_size[0]
      }];
      this.detailLogData.data = data;
    }).catch(() => {
      this.isLoadingOper = false;
    });
  }

  public closeLogDown() {
    this.logDown.close();
    this.hoverClose = '';
  }
  public onHoverClose(msg: any) {
    this.hoverClose = msg;
  }
}
