import { Component, OnInit } from '@angular/core';
import { TiTableColumns, TiTableRowData, TiTableSrcData, TiTableDataState, TiTableComponent } from '@cloud/tiny3';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import { AxiosService } from 'projects/sys/src-web/app/service/axios.service';
import { UrlService } from 'projects/sys/src-web/app/service/url.service';
import { ToolType } from 'projects/domain';

@Component({
  selector: 'app-sys-operate-log',
  templateUrl: './sys-operate-log.component.html',
  styleUrls: ['./sys-operate-log.component.scss']
})
export class SysOperateLogComponent implements OnInit {
  public i18n: any;
  public role = sessionStorage.getItem('role');
  private url: any;
  public displayed: Array<TiTableRowData> = [];
  public srcData: TiTableSrcData = {
    data: ([] as Array<TiTableRowData>),
    state: {
      searched: false, // 源数据未进行搜索处理
      sorted: false, // 源数据未进行排序处理
      paginated: true,
    }
  };
  public columns: Array<TiTableColumns> = [];
  public pageNo = 1;
  public pageSize: { options: Array<number>; size: number } = {
    options: [10, 20, 30, 40, 50],
    size: 20,
  };
  public total = 0;
  public isLoading: any = false;
  public isDiagnose = sessionStorage.getItem('toolType') === ToolType.DIAGNOSE;
  constructor(
    public i18nService: I18nService,
    public Axios: AxiosService,
    private urlService: UrlService
  ) {
    this.i18n = this.i18nService.I18n();
    this.url = this.urlService.Url();
    this.columns = [
      { title: this.i18n.common_term_log_user, width: '12%', },
      { title: this.i18n.common_term_log_event, width: '13%', },
      { title: this.i18n.common_term_log_result, sortKey: 'age', width: '15%', },
      { title: this.i18n.common_term_log_ip, width: '15%', },
      { title: this.i18n.common_term_log_time, width: '20%', },
      { title: this.i18n.common_term_log_Detail, width: '25%', },
    ];
  }

  ngOnInit() {
    this.getLogList(this.pageNo, this.pageSize.size);
  }

  /**
   * 获取操作日志
   * @param currentPage 页码
   * @param pageSize pageSize
   */
  private getLogList(currentPage: number, pageSize: number) {
    this.isLoading = true;
    const params = {
      page: currentPage,
      'per-page': pageSize,
    };

    this.Axios.axios.get(`${this.url.logs}`, { params, headers: { showLoading: false } }).then((data: any) => {
      this.isLoading = false;
      if (data.data.logs) {
        this.srcData.data = data.data.logs;
        this.total = data.data.totalCounts;
      }
    }).catch(() => {
      this.isLoading = false;
    });
  }

  /**
   * 日志分页改变
   * @param e $event
   */
  public logUpdate(e: TiTableComponent) {
    const dataState: TiTableDataState = e.getDataState();
    this.getLogList(
      dataState.pagination.currentPage,
      dataState.pagination.itemsPerPage
    );
  }

  /** 返回状态类 */
  public statusFormat(status: string): string {
    let statusClass = 'success-icon';
    switch (status) {
      case 'Successful':
        statusClass = 'success-icon';
        break;
      case 'Failed':
        statusClass = 'failed-icon';
        break;
      default:
        statusClass = 'success-icon';
    }
    return statusClass;
  }

  /**
   * 下载操作日志
   * @param item row data
   */
  public async downLoadLog() {
    this.isLoading = true;
    try {
      const log = await this.Axios.axios.get(
        `${this.url.logs}download/`,
        { responseType: 'blob', headers: { showLoading: false } }
      );
      this.isLoading = false;
      // 对下载的文件命名
      const str = this.isDiagnose ? this.i18n.diagnostic.analysis_log : this.i18n.operationLog.sysLog;

      // ie在客户端保存文件的方法
      if (window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(log, str + '.csv');
      } else {
        const exportBlob = new Blob([log]);
        const saveLink = document.createElement('a');
        saveLink.href = window.URL.createObjectURL(exportBlob);
        saveLink.download = str + '.csv';
        saveLink.click();
      }
    } catch (error) {
      this.isLoading = false;
    }
  }
}
