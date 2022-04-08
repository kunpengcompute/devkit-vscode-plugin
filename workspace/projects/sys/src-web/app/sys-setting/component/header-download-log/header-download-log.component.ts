import { Component, OnInit, ViewChild } from '@angular/core';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import { AxiosService } from 'projects/sys/src-web/app/service/axios.service';
import { MytipService } from 'projects/sys/src-web/app/service/mytip.service';
import { TiTableColumns, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';
import { MessageModalService } from 'projects/sys/src-web/app/service/message-modal.service';
import { ToolType } from 'projects/domain';

@Component({
  selector: 'app-header-download-log',
  templateUrl: './header-download-log.component.html',
  styleUrls: ['./header-download-log.component.scss']
})
export class HeaderDownloadLogComponent implements OnInit {
  @ViewChild('downLoad') downLoad: any;
  @ViewChild('CollectDownLoad') CollectDownLoad: any;
  public i18n: any;
  constructor(
    public i18nService: I18nService,
    public Axios: AxiosService,
    public tiMessage: MessageModalService,
    public mytip: MytipService
  ) {
    this.i18n = this.i18nService.I18n();
    this.nodataTip = this.i18n.loading;
  }
  public nodataTip = '';
  public statusList: any = [];
  public fileList: any[] = [];
  public nodeList: any[];
  public displayed: Array<TiTableRowData> = []; // 表示表格实际呈现的数据（开发者默认设置为[]即可）
  public srcData: TiTableSrcData;
  private logListdata: any[] = [];
  public columns: Array<TiTableColumns> = [];
  public columnsTitle: Array<TiTableColumns> = [];
  public detailColumns: Array<TiTableColumns> = [];
  public columnsCollect: Array<TiTableColumns> = [];
  // 采集表格
  public displayedCollect: Array<TiTableRowData> = [];
  public displayedCollectData: Array<TiTableRowData> = [];
  public srcCollectData: TiTableSrcData;
  public checkedList: Array<TiTableRowData> = []; // 默认选中项
  // 分级表格
  public columnsTask: Array<TiTableColumns> = [];
  public displayedDetailsOk: Array<TiTableRowData> = [];
  public srcDataDetails: TiTableSrcData;
  /** 数据采集运行日志二级表格 */
  public collectionLog = {
    obtaining: false, // 获取数据中
    hasObtained: false, // 是否已经获取过数据，第一次获取不显示无数据
  };

  public displayedOk: Array<TiTableRowData> = [];
  public srcDataOk: TiTableSrcData;
  public askLock = false; // 采集日志数据连续请求互锁
  public downloadItem: any = {};
  /** 弹框的标题 */
  public modalTitle: string;
  public isLoading: any = false;
  public isDiagnose = sessionStorage.getItem('toolType') === ToolType.DIAGNOSE;
  ngOnInit() {
    this.columns = [
      {
        title: this.i18n.operationLog.logFileName,
        width: '70%'
      },
      {
        title: this.i18n.operationLog.size,
        width: '30%'
      },
    ];
    this.columnsTitle = [
      {
        title: '',
        width: '5%'
      },
      {
        title: this.i18n.operationLog.logFileName,
      },
      {
        title: this.i18n.operationLog.operation,
        width: '440px'
      },
    ];
    this.detailColumns = [
      {
        title: this.i18n.operationLog.logFileName,
      },
      {
        title: this.i18n.operationLog.size,
        width: '440px'
      },
    ];
    this.columnsCollect = [
      {
        title: ''
      },
      {
        title: this.i18n.operationLog.logFileName,
        width: '70%'
      },
      {
        title: this.i18n.operationLog.size,
        width: '30%'
      },
    ];
    this.srcData = { // 表格源数据，开发者对表格的数据设置请在这里进行
      data: [], // 源数据
      // 用来标识传进来的源数据是否已经进行过排序、搜索、分页操作，
      // 已经做过的，tiny就不再做了
      // 如果没做，tiny会对传入的源数据做进一步处理（前提是开发者设置了相关特性，比如分页），然后作为displayedData显示出来
      // 本示例中，开发者没有设置分页、搜索和排序这些特性，因此tiny不会对数据进行进一步的处理
      state: {
        searched: false, // 源数据未进行搜索处理
        sorted: false, // 源数据未进行排序处理
        paginated: false // 源数据未进行分页处理
      }
    };
    this.srcDataOk = { // 表格源数据，开发者对表格的数据设置请在这里进行
      data: [], // 源数据
      state: {
        searched: false, // 源数据未进行搜索处理
        sorted: false, // 源数据未进行排序处理
        paginated: false // 源数据未进行分页处理
      }
    };
    this.srcDataDetails = { // 表格源数据，开发者对表格的数据设置请在这里进行
      data: [], // 源数据
      state: {
        searched: false, // 源数据未进行搜索处理
        sorted: false, // 源数据未进行排序处理
        paginated: false // 源数据未进行分页处理
      }
    };
    this.srcCollectData = {
      data: [], // 源数据
      state: {
        searched: false, // 源数据未进行搜索处理
        sorted: false, // 源数据未进行排序处理
        paginated: false // 源数据未进行分页处理
      }
    };
    const lang: string = sessionStorage.getItem('language');
    this.logListdata = [
      {
        id: 1,
        fileName: this.i18n.operationLog.webServerLog,
        params: 'webServerLog',
        modalTitle: `${this.i18n.operationLog.download}${
          lang === 'en-us' ? ' ' : ''}${this.i18n.operationLog.webServerLog
        }`,
        oparates: [
          { label: this.i18n.operationLog.download, onClick: (row: any) => this.getOperationFiles(row) },
        ],
      },
      {
        id: 2,
        fileName: this.i18n.operationLog.analysisLog,
        params: 'analysisLog',
        modalTitle: `${this.i18n.operationLog.download}${
          lang === 'en-us' ? ' ' : ''}${this.i18n.operationLog.analysisLog
        }`,
        oparates: [
          { label: this.i18n.operationLog.download, onClick: (row: any) => this.getOperationFiles(row) },
        ],
      },
      {
        id: 3,
        fileName: this.i18n.operationLog.collectionLog,
        params: 'collectionLog',
        modalTitle: `${this.i18n.operationLog.downloadAllCollectionLog}`,
        oparates: [
          { label: this.i18n.operationLog.downloadAll, onClick: (row: any) => this.getOperationFiles(row) },
        ],
      }
    ];
    this.srcData.data = this.logListdata;
  }
  // 获取数据---主
  public async getOperationFiles(item: any) {
    this.isLoading = true;
    this.downloadItem = item;
    this.fileList = [];
    const that = this;
    const lang: string = sessionStorage.getItem('language');
    let res: any;
    switch (item.params) {
      case 'webServerLog':
        try {
          const urlLog = this.isDiagnose ? '/run-logs/?analysis-type=memory_diagnostic' : '/run-logs/';
          res = await this.Axios.axios.get(urlLog, { headers: { showLoading: false } });
        } catch (error) {
          this.isLoading = false;
        }
        break;
      case 'analysisLog':
        try {
          const urlAnalyzer = this.isDiagnose
            ? '/run-logs/analyzer/?analysis-type=memory_diagnostic' : '/run-logs/analyzer/';
          res = await this.Axios.axios.get(urlAnalyzer, { headers: { showLoading: false } });
        } catch (error) {
          this.isLoading = false;
        }
        break;
      case 'collectionLog':
        if (this.askLock) { this.isLoading = false; return; }
        this.askLock = true;
        try {
          const urlColl = this.isDiagnose
            ? '/run-logs/collector/?analysis-type=memory_diagnostic' : '/run-logs/collector/';
          res = await this.Axios.axios.get(urlColl, { headers: { showLoading: false } });
        } catch (error) {
          this.isLoading = false;
        }
        break;
    }
    this.isLoading = false;
    const fileData: TiTableRowData[] = [];
    if (item.params === 'collectionLog') {
      res.data.logs.forEach((node: any) => {
        node.file_name.forEach((ele: string, idx: string | number) => {
          const item1 = { name: '', size: '', ip: '', params: '', file_name: '', modalTitle: '' };
          item1.file_name = node.node_name;
          item1.size = node.file_size[idx];
          item1.ip = node.node_name;
          item1.params = 'collectionLog';
          item1.name = ele;
          item1.modalTitle = `${this.i18n.operationLog.download}${
            lang === 'en-us' ? ' ' : ''}${this.i18n.operationLog.collectionLog
          }`;
          fileData.push(item1);
          this.fileList.push(ele);
        });
      });
      this.srcDataDetails.data = fileData;  // 节点详情
      this.askLock = false;
    } else {
      this.fileList = res.data.logs.file_name;
      res.data.logs.file_name.forEach((ele: string, idx: string | number) => {
        const item2 = { name: '', size: '' };
        item2.name = ele;
        item2.size = res.data.logs.file_size[idx];
        fileData.push(item2);
      });
    }
    this.srcDataOk.data = fileData; // 源数据

    // caiji
    this.srcCollectData.data = fileData;
    this.checkedList = fileData.slice(); // 初始选中项
    // 分开打开
    this.modalTitle = item.modalTitle;
    if (item.params === 'collectionLog') {
      that.CollectDownLoad.Open();
    } else {
      that.downLoad.Open();
    }
  }
  // 获取采集数据-详情
  public async getFiles() {
    if (this.askLock) { return; }
    try {
      this.nodataTip = this.i18n.loading;
      this.askLock = true;
      this.collectionLog.obtaining = true;
      const urlCollector = this.isDiagnose
        ? '/run-logs/collector/?analysis-type=memory_diagnostic' : '/run-logs/collector/';
      const res = await this.Axios.axios.get(urlCollector, {
        headers: {
          showLoading: false,
        }
      });
      const fileData: any = [];
      this.fileList = [];
      const lang: string = sessionStorage.getItem('language');
      res.data.logs.forEach((node: any) => {
        node.file_name.forEach((ele: string, idx: string | number) => {
          const item = { name: '', size: '', ip: '', params: '', file_name: '', modalTitle: '' };
          item.file_name = node.node_name;
          item.size = node.file_size[idx];
          item.ip = node.node_name;
          item.params = 'collectionLog';
          item.name = ele;
          item.modalTitle = `${this.i18n.operationLog.download}${
            lang === 'en-us' ? ' ' : ''}${this.i18n.operationLog.collectionLog
          }`;
          fileData.push(item);
          this.fileList.push(ele);
        });
      });
      this.srcDataDetails.data = fileData;  // 节点详情
    }
    finally {
      this.collectionLog.obtaining = false;
      if (!this.collectionLog.hasObtained) { this.collectionLog.hasObtained = true; }
      this.nodataTip = this.i18n.common_term_task_nodata2;
      this.askLock = false;
    }
  }
  // 展开详情
  public beforeToggle(row: TiTableRowData): void {
    // 展开时
    if (!row.showDetails) {
      row.showDetails = !row.showDetails;
      this.getFiles();
    } else {
      // 收起时
      row.showDetails = !row.showDetails;
    }
  }
  public downloadOk() {
    const that = this;
    switch (this.downloadItem.params) {
      default:
        this.fileList.forEach(val => {
          this.downloadAsk(false, val);
        });
        break;

    }
    this.downLoad.Close();
    this.CollectDownLoad.Close();
  }
  // 打开节点下载详情
  public openNodeFiles(row: any) {
    this.downloadItem = this.logListdata[2];
    this.nodeList = this.srcDataDetails.data.filter((el: any) => {
      return el.ip === row.ip;
    });
    const fileData: any = [];
    this.fileList = [];
    this.nodeList.forEach((val: any, idx: any) => {
      const item = { name: '', size: '' };
      item.name = val.name;
      item.size = val.size;
      fileData.push(item);
      // 先清空原数组
      this.fileList.push(val.name);
    });
    this.srcDataOk.data = fileData; // 源数据
    this.modalTitle = row.modalTitle;
    this.downLoad.Open();
  }
  public downloadSureOk() {
    this.fileList = [];
    this.checkedList.forEach(val => {
      this.fileList.push(val.name);
    });
    this.downloadOk();
  }

  /**
   * 下载请求
   * @param val 文件名称
   * @param ifUser baseUrl
   */
  public downloadAsk(ifUser: any, val: string) {
    this.isLoading = true;
    const that = this;
    const baseURL = ifUser ? '../user-management/api/v2.2' : 'api/v2.2';
    const type = this.isDiagnose ? '&analysis-type=memory_diagnostic' : '';
    this.Axios.axios.get(
      '/run-logs/download/?log-name=' + val + type,
      { baseURL, responseType: 'blob', headers: { showLoading: false }
    })
      .then((log: any) => {
        this.isLoading = false;
        that.downloadFile(log, val);
      }).catch((e: any) => {
        this.isLoading = false;
        const reader = new FileReader();
        // 通过四种方式读取文件
        reader.onload = function() {
          // 查看文件输出内容
          const res = JSON.parse(this.result as string);
          that.mytip.alertInfo({ type: 'warn', content: res.message, time: 3500 });
        };
        reader.readAsText(e.response.data);
      });
  }

  public downloadFile(file: any, name: string) {
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
  public closeDownload() {
    this.downLoad.Close();
    this.CollectDownLoad.Close();
  }
  public trackByFn(index: number, item: any): number {
    return item.id;
  }
}
