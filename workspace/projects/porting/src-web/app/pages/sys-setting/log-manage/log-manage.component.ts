import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { TiMenuItem } from '@cloud/tiny3';
import { TiTableColumns, TiTableRowData, TiTableSrcData, TiTableDataState , TiModalService} from '@cloud/tiny3';
import { TiMessageService } from '@cloud/tiny3';
import { FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, AbstractControl } from '@angular/forms';
import { TiValidators } from '@cloud/tiny3';
import { TiValidationConfig } from '@cloud/tiny3';
import { AxiosService } from '../../../service/axios.service';
import { MytipService } from '../../../service/mytip.service';
import { CommonService } from '../../../service/common/common.service';
import { I18nService } from '../../../service/i18n.service';
import { MessageService } from '../../../service/message.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-log-manage',
  templateUrl: './log-manage.component.html',
  styleUrls: ['./log-manage.component.scss']
})
export class LogManageComponent implements OnInit {
  constructor(
    public timessage: TiMessageService,
    public fb: FormBuilder,
    private elementRef: ElementRef,
    public Axios: AxiosService,
    private tiModal: TiModalService,
    public router: Router,
    public mytip: MytipService,
    public i18nService: I18nService,
    private msgService: MessageService,
    private commonService: CommonService
  ) {
    this.i18n = this.i18nService.I18n();
  }
public i18n: any;
public logList: TiTableSrcData;
public runlogList: TiTableSrcData;
public displayed: Array<TiTableRowData> = []; // 表示表格实际呈现的数据（开发者默认设置为[]即可）
public columsLog: Array<TiTableColumns> = [];
public displayedlog: Array<TiTableRowData> = []; // 表示表格实际呈现的数据（开发者默认设置为[]即可）
public checkedList: Array<TiTableRowData> = [];
public columsRunLog: any;
public isOperate = true;
public currentPageLog = 1;
public totalNumberLog = 0;
public reportId: any;
public pageSizeLog: { options: Array<number>; size: number } = {
  options: [10, 20, 30, 40, 50],
  size: 10,
};


// 当前是否有运行日志压缩中
public isRunLog = false;
public creatingLogManageProgressSub: Subscription; // 监听日志下载中，按钮置灰

public uploadInfo = {
  progress: '',
  upTimes: 0
};

private creatingResultMsgSub: Subscription;

public isAdmin = sessionStorage.getItem('role') === 'Admin';

// table 相关
public showGotoLink: boolean;

  ngOnInit() {
    this.showGotoLink = true;

    this.columsLog = [
      {
        title: this.i18n.common_term_log_userName,
        width: '10%'
      },
      {
        title: this.i18n.common_term_log_event,
        width: '20%'
      },
      {
        title: this.i18n.common_term_log_result,
        width: '20%'
      },
      {
        title: this.i18n.common_term_log_time,
        width: '20%'
      },
      {
        title: this.i18n.common_term_log_Detail,
        width: '30%'
      }
    ];
    this.columsRunLog = [{
      title: this.i18n.common_term_log_filename,
      width: '90%'
    }];
    this.showLogList();
    if (this.isAdmin) {
      this.showRunLogList();
    }

    this.creatingLogManageProgressSub = this.msgService.getMessage().subscribe(msg => {
      if (msg.type === 'creatingLogManageProgress') {
        this.isRunLog = msg.data;
      }
    });

    if (sessionStorage.getItem('role') === 'Admin') {
      this.getTaskUndone();
    }
  }

  // 查询当前是否有日志压缩任务
  getTaskUndone() {
    this.Axios.axios.get('/portadv/runlog/zip_log/').then((resp: any) => {
      if (resp.data.task_id && this.commonService.handleStatus(resp) === 0) {
        this.reportId = resp.data.task_id;
        this.msgService.sendMessage({
          type: 'creatingTask',
          data: {
            id: this.reportId,
            type: 'LogManage'
          }
        });
        this.isRunLog = true;
      }
    });
  }

  showLogList() {
    this.Axios.axios.get('/portadv/log/?download=false')
      .then((data: any) => {
        if (data.data.loglist) {
          this.logList = {
            data: data.data.loglist,
            state: {
              searched: false, // 源数据未进行搜索处理
              sorted: false, // 源数据未进行排序处理
              paginated: false, // 源数据未进行分页处理
            },
          };
          this.totalNumberLog = data.data.totalcount;
        }
      });
  }
  showRunLogList() {
    this.Axios.axios.get('/portadv/runlog/').then((data: any) => {
      if (data) {
        this.runlogList = {
          data: data.data.loglist,
          state: {
            searched: false, // 源数据未进行搜索处理
            sorted: false, // 源数据未进行排序处理
            paginated: false // 源数据未进行分页处理
          }
        };
      }
    });
  }
  onPageUpdateLog(data: any) {
    this.showLogList();
   }
   downloadLog() {
    this.Axios.axios.get(`/portadv/log/?download=true`).then((resp: any) => {
      if (this.commonService.handleStatus(resp) === 0) {
        this.downloadJson2Csv(resp.data.loglist);
      }
    });
  }
  public downloadRunLog() {
    this.Axios.axios.post('/portadv/runlog/create_log/', {
      download_path: ''
    }).then((resp: any) => {
      if (resp.data.task_id && this.commonService.handleStatus(resp) === 0) {
        this.reportId = resp.data.task_id;
        this.Axios.axios.get(`/portadv/runlog/zip_log/?task_id=${encodeURIComponent(this.reportId)}`)
        .then((data: any) => {
          if (this.commonService.handleStatus(data) === 0) {
            this.msgService.sendMessage({
              type: 'creatingTask',
              data: {
                id: this.reportId,
                type: 'LogManage'
              }
            });
            this.isRunLog = true;
            return;
          }
          const failInfo = sessionStorage.getItem('language') === 'zh-cn' ? data.infochinese : data.info;
          const resultMsg = {
            id: this.reportId,
            type: 'LogManage',
            state: 'failed',
            msg: failInfo
          };
          this.msgService.sendMessage({
            type: 'creatingResultMsg',
            data: resultMsg
          });
          this.isRunLog = true;
        });
      } else if (this.commonService.handleStatus(resp) === 1) {
        const lang = sessionStorage.getItem('language');
        lang === 'zh-cn'
          ? this.mytip.alertInfo({ type: 'warn', content: resp.infochinese, time: 10000 })
          : this.mytip.alertInfo({ type: 'warn', content: resp.info, time: 10000 });
      }
    });
  }
  public showLoding() {
    document.getElementById('loading-box').style.display = 'flex';
  }
  public closeLoding() {
    document.getElementById('loading-box').style.display = 'none';
  }
  downloadJson2Csv(report: any) {
    const CSV = this.formateDataToCSV(report);
    const filename = 'log';
    if (!CSV) {
      return;
    }
    const blob = new Blob(['\uFEFF' + CSV]);
    if (window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveOrOpenBlob(blob, filename + '.csv');
    } else {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('style', 'visibility:hidden');
      link.download = filename + '.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
  formateDataToCSV(report: any) {
    let row1 = 'User Name,	Event,	Result,	Time,	Details\r\n';
    report.forEach((item: any, index: any) => {
      row1 += item.username + ',' + item.event + ',' + item.result +
        ',' + item.time + '\t' + ',' + '"' + item.detail + '"' + '\r\n';
    });
    const CSV = row1;
    return CSV;
  }
  public statusFormat(status: string): string {
    let statusClass = 'success-icon';
    switch (status) {
      case 'Successful':
        statusClass = 'success-icon';
        break;
      case 'Failed':
        statusClass = 'failed-icon';
        break;
      case 'Timeout':
        statusClass = 'timeout-icon';
        break;
      default:
        statusClass = 'success-icon';
    }
    return statusClass;
  }
}
