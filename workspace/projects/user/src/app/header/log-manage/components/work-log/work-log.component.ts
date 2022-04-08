import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { TiTableColumns, TiTableRowData, TiTableSrcData, TiModalService } from '@cloud/tiny3';
import { I18nService } from 'projects/user/src/app/service/i18n.service';
import { AxiosService } from 'projects/user/src/app/service/axios.service';
import { MytipService } from 'projects/user/src/app/service/mytip.service';
import { Subject } from 'rxjs';
export const UpdateLogSub = new Subject<any>();

@Component({
  selector: 'app-work-log',
  templateUrl: './work-log.component.html',
  styleUrls: ['./work-log.component.scss']
})
export class WorkLogComponent implements OnInit {
  @ViewChild('downLoad') downLoad: ElementRef;

  public i18n: any;

  /** 运行日志表格 */
  public runLogsTable = {
    displayed: ([] as Array<TiTableRowData>),
    srcData: ({
      data: ([] as Array<TiTableRowData>),
      state: {
        searched: false, // 源数据未进行搜索处理
        sorted: false, // 源数据未进行排序处理
        paginated: false // 源数据未进行分页处理
      }
    } as TiTableSrcData),
    columns: ([] as Array<TiTableColumns>),
  };

  /** 下载任务列表表格 */
  public downloadFilesTable = {
    displayed: ([] as Array<TiTableRowData>),
    srcData: ({
      data: ([] as Array<TiTableRowData>),
      state: {
        searched: false, // 源数据未进行搜索处理
        sorted: false, // 源数据未进行排序处理
        paginated: false // 源数据未进行分页处理
      }
    } as TiTableSrcData),
    columns: ([] as Array<TiTableColumns>),
  };

  constructor(
    private i18nService: I18nService,
    private Axios: AxiosService,
    private tiModal: TiModalService,
    private mytip: MytipService,
  ) {
    this.i18n = this.i18nService.I18n();

    this.runLogsTable.columns = [
      { title: this.i18n.operationLog.logFileName },
      { title: this.i18n.operationLog.operation },
    ];

    this.downloadFilesTable.columns = [
      { title: this.i18n.operationLog.logFileName },
      { title: this.i18n.operationLog.size },
    ];
  }
  public isLoading: any = false;

  ngOnInit() {
    const lang: string = sessionStorage.getItem('language');

    this.runLogsTable.srcData.data = [
      {
        fileName: this.i18n.operationLog.userManageLog,
        prop: 'userManageLog',
        modalTitle: `${this.i18n.operationLog.download}${lang === 'en-us' ? ' ' : ''}
        ${this.i18n.operationLog.userManageLog}`,
      },
    ];
  }

  /**
   * 打开下载弹框
   * @param row 行数据
   */
  public async getOperationFiles(row: any) {
    this.downloadFilesTable.srcData.data = [];
    this.isLoading = true;
    if (row.prop === 'userManageLog') {
      this.Axios.axios.get(`/run-logs/`, { headers: { showLoading: false } }).then((res: any) => {
        this.downloadFilesTable.srcData.data = res.data.logs.file_name.map((item: string, index: number) => {
          return {
            name: item,
            size: res.data.logs.file_size[index],
          };
        });

        this.tiModal.open(this.downLoad, {
          id: 'downloadModal', // 定义id防止同一页面出现多个相同弹框
          modalClass: 'custemModal downLoadModal',
          context: {
            title: `${row.modalTitle}`,
            interfacing: false, // 调用接口中需要禁用掉按钮，防止点两次
            confirm: (context: any) => {  // 点击确定
              context.interfacing = true;
              context.dismiss();

              res.data.logs.file_name.forEach((val: any) => {
                this.downloadAsk(val);
              });
            },
          },
        });
      })
        .finally(() => {
          this.isLoading = false;
          UpdateLogSub.next();
        });
    }
  }

  /**
   * 下载请求
   * @param val 文件名称
   */
  private downloadAsk(val: any) {
    this.isLoading = true;
    const that = this;
    const params = {
      'log-name': val,
    };
    this.Axios.axios.get(`/run-logs/download/`, {
      params,
      responseType: 'blob',
      headers: { showLoading: false }
    }).then((log: any) => {
      that.downloadFile(log, val);
    }).catch((e: any) => {
      const reader = new FileReader();
      // 通过四种方式读取文件
      reader.onload = function() {
        // 查看文件输出内容
        const res = JSON.parse(this.result as string);
        that.mytip.alertInfo({ type: 'warn', content: res.message, time: 3500 });
      };
      reader.readAsText(e.response.data);
    })
      .finally(() => {
        this.isLoading = false;
        UpdateLogSub.next();
      });
  }

  /**
   * 下载文件
   * @param file 文件内容
   * @param name 文件名
   */
  private downloadFile(file: any, name: any) {
    // ie在客户端保存文件的方法
    if (window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveOrOpenBlob(file, name);
    } else {
      const exportBlob = new Blob([file]);
      const saveLink = document.createElement('a');
      saveLink.href = window.URL.createObjectURL(exportBlob);
      saveLink.download = name;
      saveLink.click();
    }
  }
}
