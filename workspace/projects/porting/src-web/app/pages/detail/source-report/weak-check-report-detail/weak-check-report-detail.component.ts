import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ViewEncapsulation } from '@angular/core';
import { TiTableColumns, TiTableRowData, TiTableSrcData, TiModalService } from '@cloud/tiny3';
import {
  CommonService, AxiosService, I18nService,
  MytipService, ReportService, MessageService
} from '../../../../service';
import axios from 'axios';
import { Router } from '@angular/router';

@Component({
  selector: 'app-weak-check-report-detail',
  templateUrl: './weak-check-report-detail.component.html',
  styleUrls: ['./weak-check-report-detail.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class WeakCheckReportDetailComponent implements OnInit {
  @Output() viewSuggestion = new EventEmitter();
  @Output() getIsSign = new EventEmitter();
  @Output() getReportId = new EventEmitter();
  @Output() downloadAutoFixLocked = new EventEmitter();
  @Input() report: any;
  @ViewChild('ieShowModal', { static: false }) ieShowModal: any;

  public i18n: any;
  public textForm1: any = {
    firstItem: {
      label: '',
      value: []
    }
  };
  public autoFix: any;
  public lockStatus: any;
  public scanItems = ['cFile', 'lines'];
  public scanItemsObj: any = {
    cFile: {
      id: '3',
      label: '',
      icon: './assets/img/home/source.png',
      content: '',
      files: [],
      hasDetail: false,
      isOpen: true
    },
    lines: {
      id: '4',
      label: '',
      icon: './assets/img/home/trans.png',
      content: '',
      hasDetail: false,
      isOpen: false
    }
  };

  public cfileDetailDisplay: Array<TiTableRowData> = [];
  public cfileDetailSrcData: TiTableSrcData;
  public cfileDetailColumn: Array<TiTableColumns> = [
    {
      title: '',
      width: '5%'
    },
    {
      title: '',
      width: '20%'
    },
    {
      title: '',
      sortKey: 'path',
      width: '35%'
    },
    {
      title: '',
      sortKey: 'suggestionNum',
      width: '20%'
    },
    {
      title: '',
      width: '20%'
    }
  ];
  private cancels: any = [];
  public haveNewReport = true;
  public IsLockReport = false;
  public showModalWarn = '';
  public showModalBtn = '';
  public newReportId = '';
  constructor(
    private Axios: AxiosService,
    public i18nService: I18nService,
    public mytip: MytipService,
    private commonService: CommonService,
    private reportService: ReportService,
    public msgservice: MessageService,
    public router: Router,
    private tiModal: TiModalService
  ) {
    this.i18n = this.i18nService.I18n();
  }

  public curLang = '';
  ngOnInit() {
    this.lockStatus = '0x0d0a20';
    this.curLang = sessionStorage.getItem('language');
    const tabFlag = JSON.parse(sessionStorage.getItem('tabFlag'));
    if (tabFlag) {
      sessionStorage.setItem('tabFlag', 'false');
      this.Axios.axios.get('/users/disclaimercounts/').then((resp: any) => {
        if (this.commonService.handleStatus(resp) === 0) {
          if (resp.data.disclreadcounts === 0) {
            this.getIsSign.emit(false);
          } else {
            this.getIsSign.emit(true);
          }
        }
        sessionStorage.setItem('tabFlag', 'true');
      });
      this.getReportDetail();
    }
    this.cfileDetailSrcData = {
      data: [],
      state: {
        searched: false,
        sorted: false,
        paginated: false
      }
    };
    this.textForm1.firstItem.label = this.i18n.common_term_ipt_label.source_code_path;
    this.scanItemsObj.cFile.label = this.i18n.common_term_weak_result_cFile;
    this.scanItemsObj.lines.label = this.i18n.common_term_result_lines;
    this.cfileDetailColumn[0].title = this.i18n.common_term_no_label;
    this.cfileDetailColumn[1].title = this.i18n.common_term_name_label;
    this.cfileDetailColumn[2].title = this.i18n.common_term_cFile_path_label;
    this.cfileDetailColumn[3].title = this.i18n.common_term_cFile_suggestion_label;
    this.cfileDetailColumn[4].title = this.i18n.common_term_log_down;
  }
  public async isOldReport(type: any = 'View') {
    const CancelToken = axios.CancelToken;
    this.haveNewReport = true;
    this.IsLockReport = false;
    await this.Axios.axios.get(`/task/progress/?task_type=10&task_id=${encodeURIComponent(this.report.id)}`, {
        cancelToken: new CancelToken(c1 => (this.cancels.push(c1)))
    })
    .then((resp: any) => {
        this.newReportId = resp.data.id;
        if (resp.status === '0x0d0112') {
          this.haveNewReport = false;
          this.IsLockReport = true;
          this.showModal();
          this.showModalWarn = this.i18n.common_term_operate_locked1_noOldReport;
          this.showModalBtn = this.i18n.common_term_operate_Create;
        }else if (resp.status === '0x0d0a20') {
          this.IsLockReport = true;
          this.showModal();
          this.showModalWarn = this.i18nService.I18nReplace(
          this.i18n[type === 'View' ? 'common_term_operate_locked1' : 'common_term_operate_locked1_download']
         , {
            0 : this.commonService.formatCreatedId(resp.data.id),
          });
          this.showModalBtn = this.i18n[type === 'View' ? 'common_term_operate_check' : 'common_term_operate_Download'];
        }
    });
  }
  showModal(){
    setTimeout(() => {
      this.tiModal.open(this.ieShowModal, {
          id: 'saveModal',
          modalClass: 'del-report',
          close: (): void => { },
          dismiss: (): void => { }
      });
    }, 500);
  }

  goHome(context: any) {
    if (this.IsLockReport && !this.haveNewReport) {
      this.router.navigate(['homeNew/PortingPre-check']);
    }else{
      const param = {
        queryParams: {
          report : this.newReportId,
          type : 'weakCheck'
        }
      };
      this.router.navigate(['report'], param);
    }
    context.close();
  }
  // 获取历史报告详情信息
  getReportDetail() {
    this.Axios.axios.defaults.headers.isLocked = true;
    this.Axios.axios.get(`/task/progress/?task_type=10&task_id=${encodeURIComponent(this.report.id)}`)
      .then((resp: any) => {
        if (this.commonService.handleStatus(resp) === 0 || this.commonService.handleStatus(resp) === 1) {
          this.getReportId.emit({ id: '', isLocked: false });
        } else if (resp.status === this.lockStatus) {
          this.getReportId.emit({ id: resp.data.id, isLocked: true });
        }
        if (resp.data.result !== {}) {
          this.textForm1.firstItem.value = resp.data.source_dir;
          this.scanItemsObj.cFile.content = resp.data.fix_sum;
          this.autoFix = resp.data.autoFix;
          let cfileNameArr = [];
          resp.data.result.barriers.forEach((item: any, index: any) => {
            cfileNameArr = item.file.split('/');
            this.cfileDetailSrcData.data.push({
              id: index + 1,
              filename: cfileNameArr[cfileNameArr.length - 1],
              path: item.file,
              suggestionNum: item.count
            });
          });
          this.msgservice.sendMessage(
            {type: 'defaultPath', value: JSON.parse(JSON.stringify(this.cfileDetailSrcData.data))[0].path});
        }
      });
  }
  // 排序函数
  public compareFn = (a: TiTableRowData, b: TiTableRowData, sortKey: string): number => {
    const language = 'zh-CN'; // 根据实际情况设置当前语言种类
    if (sortKey === 'suggestionNum') {
      return a.suggestionNum - b.suggestionNum;
    }
    return a[sortKey].localeCompare(b[sortKey], language); // localeCompare方法还有更多配置，可在网上查阅。
  }
  // 下载 html 报告
  async downloadReportAsHtml() {
    await this.isOldReport('Download');
    if (this.IsLockReport) { return; }
    this.Axios.axios.get(`/task/progress/?task_type=10&task_id=${encodeURIComponent(this.report.id)}`)
      .then((resp: any) => {
        if (this.commonService.handleStatus(resp) === 0 || resp.status === this.lockStatus) {
          const content = resp.data.result;
          const num = resp.data.fix_sum;
          const iii = location.href.indexOf('#');
          const api = location.href.slice(0, iii);
          const image = `${api + './assets/img/home/nodata.svg'}`;
          this.getBase64(image, content, num);
        }
    });
  }
  getBase64(imgUrl: any, content: any, num: any) {
    const that = this;
    const xhr = new XMLHttpRequest();
    xhr.open('get', imgUrl, true);
    // 至关重要
    xhr.responseType = 'blob';
    xhr.onload = () => {
      if (xhr.status === 200) {
        // 得到一个blob对象
        const blob = xhr.response;
        // 至关重要
        const oFileReader = new FileReader();
        oFileReader.onloadend = (e: any) => {
          let base64 = e.currentTarget.result;
          base64 = base64.replace('; charset=UTF-8', '');
          that.download2Html(content, num);
        };
        oFileReader.readAsDataURL(blob);
      }
    };
    xhr.send();
  }

  download2Html(reportData: any, num: any) {
    const filename = this.report.id + '.html';
    const content = this.downloadTemplete(reportData, num);
    const blob = new Blob([content]);
    if ('download' in document.createElement('a')) {
      const link = document.createElement('a');
      link.setAttribute('style', 'visibility:hidden');
      link.download = filename;
      link.href = URL.createObjectURL(blob);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      if (window.navigator && window.navigator.msSaveOrOpenBlob) {
        // for IE
        window.navigator.msSaveOrOpenBlob(blob, filename);
      }
    }
  }

  // 前往源码修改建议
  public async goReportDiff(data: any) {
    await this.isOldReport();
    if (this.IsLockReport) { return; }
    sessionStorage.setItem('currentfilename', data.path);
    this.viewSuggestion.emit(data);
  }

  downloadTemplete(report: any, num: any): string {
    const iii = location.href.indexOf('#');
    const api = location.href.slice(0, iii);
    let args = '';
    let scanTemp = '';
    const firstValueTitle = this.textForm1.firstItem.value.length >= 48
      ? this.textForm1.firstItem.value
      : '';
    args = `<h1 style="font-size: 20px;color: #282b33;margin-bottom: 24px;font-weight: normal;line-height: 1;">${
      this.i18n.common_term_setting_infor
    }</h1>
      <div class="setting-left" style="float: left;width: 50%;">
        <div class="setting-left-item" style="display: flex; justify-content: flex-start;margin-bottom: 20px;">
          <span style="width: 240px;color: #6C7280;">${this.textForm1.firstItem.label}</span>
          <span style="width: 370px;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;"
          title="${firstValueTitle}">${this.textForm1.firstItem.value}</span>
        </div>
      </div>`;
    const cFilePadding = this.cfileDetailSrcData.data.length > 10
      ? 'padding-right: 17px;'
      : '';
    this.scanItems.forEach((scanItem) => {
      let itemFile = '';
      let fileListCon = '';
      const showTotal = scanItem === 'cFile' ? 'block' : 'none';
      if (scanItem === 'cFile' && this.scanItemsObj[scanItem].files) {
        if (this.cfileDetailSrcData.data.length !== 0 ) {
          this.cfileDetailSrcData.data.forEach((item: any) => {
            itemFile += `
              <tr style="line-height:28px;">
                <td style="border-bottom: 1px solid #E6EBF5;">
                  <span class="content">${item.id}</span>
                </td>
                <td style="border-bottom: 1px solid #E6EBF5;">
                  <span class="content">${item.filename}</span>
                </td>
                <td style="border-bottom: 1px solid #E6EBF5;">
                  <span class="content">${item.path}</span>
                </td>
                <td style="border-bottom: 1px solid #E6EBF5;" >
                  <span class="content">${item.suggestionNum}</span>
                </td>
              </tr>
            `;
          });
        } else {
          itemFile += `
            <tr class="ti3-table-nodata">
              <td colspan="5" style="border: none;"></td>
            </tr>
          `;
        }
        // theade th设置 text-align: left 是为了兼容IE
        fileListCon += `
          <div class="ti-table">
            <div class="items-detail-container table" style="${cFilePadding}">
              <table style="table-layout:fixed; text-align: left;line-height: 28px">
                <thead>
                  <tr
                    style="background:#f5f9ff;
                      color:#333;font-weight: 400;
                      border-left: none; padding: 0 10px;
                      font-size: 14px;"
                  >
                    <th style="width: 10%;text-align: left;" >${this.i18n.common_term_no_label}</th>
                    <th style="width: 20%;text-align: left;">${this.i18n.common_term_name_label}</th>
                    <th style="width: 50%;text-align: left;">${this.i18n.common_term_cFile_path_label}</th>
                    <th style="width: 20%;text-align: left;">${this.i18n.common_term_cFile_suggestion_label}</th>
                  </tr>
                </thead>
              </table>
            </div>
            <div class="table-box" style="max-height: 380px;overflow-y: auto;margin-top: -4px;">
              <table class="table">
                <thead>
                  <tr>
                    <th style="width: 10%;"></th>
                    <th style="width: 20%;"></th>
                    <th style="width: 50%;"></th>
                    <th style="width: 20%;"></th>
                  </tr>
                </thead>
                <tbody style="font-size: 14px;">${itemFile}</tbody>
              </table>
            </div>
          </div>
        `;
      }
      if (scanItem === 'lines' && report.barriers.length > 0) {
        let itemLines = '';
        const linePadding = report.barriers.length > 8
            ? 'padding-right: 17px;'
            : '';
        if (num !== 0 ) {
          report.barriers.forEach((item: any) => {
            if (item.locs.length !== 0) {
              item.locs.forEach((line: any) => {
                line.strategy = 'add "__asm__ volatile("dmb sy")" in the position indicated by the below items';
                itemLines += `
                  <tr style="line-height:23px;">
                    <td style="border-bottom: 1px solid #E6EBF5;">
                      <span class="content">${item.file}</span>
                    </td>
                    <td style="border-bottom: 1px solid #E6EBF5;">
                      <span class="content">${'(' + line.line + ',' + line.line + ')'}</span>
                    </td>
                    <td style="width: 45%;border-bottom: 1px solid #E6EBF5;">
                      <span class="content">${line.strategy}</span>
                    </td>
                  </tr>
                `;
              });
            }
          });
        } else {
          itemLines += `
            <tr>
            <td colspan="5" style="border: none;">
            <div class="nodata-image"></div>
            <div class="nodata-text">${this.i18n.common_term_task_nodata}</div>
            </td>
            </tr>
          `;
        }
        fileListCon += `
          <div class="ti-table">
            <div class="items-detail-container" style="${linePadding}">
              <table style="text-align: left;line-height: 28px;table-layout: fixed;">
                <thead>
                  <tr
                    style="background:#f5f9ff;
                      color:#333;
                      font-weight: 400;border-left: none;
                      padding: 0 10px;
                      font-size: 14px;"
                  >
                    <th style="width: 45%;">${this.i18n.common_term_download_html_filename}</th>
                    <th style="width: 15%;">${this.i18n.common_term_download_html_lineno}</th>
                    <th style="width: 40%;">${this.i18n.common_term_download_html_suggestion}</th>
                  </tr>
                </thead>
              </table>
            </div>
            <div class="table-box" style="max-height: 280px;overflow-y: auto;margin-top: -4px;">
              <table style="text-align: left;line-height: 28px;table-layout:fixed">
                <thead>
                  <tr>
                    <th style="width: 45%;"></th>
                    <th style="width: 15%;"></th>
                    <th style="width: 40%;"></th>
                  </tr>
                </thead>
                <tbody style="font-size: 14px;">${itemLines}</tbody>
              </table>
            </div>
          </div>
        `;
      }
      scanTemp += `
        <div class="table-container" style="line-height: 56px;margin-top:30px;">
          <div class="detail-label" style="display:inline-block;min-width: 350px;font-size: 20px;color: #282b33;">
            <span>${this.scanItemsObj[scanItem].label}</span>
          </div>
          <div class="detail-content" style="display: ${showTotal}">
            <span style="margin-right: 24px;">
              ${ this.i18n.check_weak.report_list_tip }：${ this.scanItemsObj[scanItem].content }
            </span>
            <span>
              ${ this.i18n.check_weak.report_list_tip_1 }：
                add "__asm__ volatile("dmb sy")" in the position indicated by the below items
            </span>
          </div>
        </div>
        ${fileListCon}
      `;
    });
    const template = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <title>Document</title>
        <style>
          .ti3-table-nodata > td {
            height: 160px !important;
            background: url(${api + './assets/img/home/no-data.png'}) 50% 25px no-repeat !important;
          }
          .nodata-text {
            text-align: center;
            border-bottom: 1px solid #e1e6e6;
            padding-bottom: 5px;
          }
          .nodata-image {
            height: 135px;
            background: url(${api + './assets/img/home/no-data.png'}) 50% no-repeat;
          }
          .detail-content {
            margin-bottom: 14px;
            padding-left: 10px;
            border: 1px solid #0067FF;
            background-color: #F0F6FF;
            color: #0067FF;
            font-size: 14px;
            line-height: 30px;
          }
          .table{
            table-layout: fixed;
          }
          table {
            width: 100%;
          }
          td span {
            display: inline-block;
            width: 100%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        </style>
      </head>
      <body style="padding:0 80px;">
        <div style="min-width: 1300px;width: 100%; height: 100%;">
        <h1
          style=
            "text-align: center;
            font-weight: normal;
            font-size: 24px;
            border-bottom: solid 1px #222;padding-bottom:20px"
        >
          ${this.report.created}
        </h1>
        <div >
        ${args}
        </div>
        <div style ="float:left;width:100%">
          ${scanTemp}
        </div>
        </div>
        <script>
          // 设置 title 属性
          function setTitle() {
            var tdList = document.querySelectorAll('.content');
            tdList = Array.prototype.slice.call(tdList);
            for (let i = 0; i < tdList.length; i++) {
              const td = tdList[i];
              td.removeAttribute('title');
              if (td.clientWidth < td.scrollWidth) {
                td.setAttribute('title', td.innerText);
              }
            }
          }
          window.onload = function(){
            setTitle();
          }
          window.onresize = function() {
            setTitle();
          }
        </script>
      </body>
    </html>
    `;
    return template;
  }

  // 下载编译器配置文件
  async downloadAutoFixList() {
    this.Axios.axios.get(`/task/progress/?task_type=10&task_id=${encodeURIComponent(this.report.id)}`)
      .then((resp: any) => {
        if (this.commonService.handleStatus(resp) === 0) {
          const autoFixList = resp.data.autofixlist;
          if (autoFixList.length === 0) {
            const msgInfo = this.i18n.check_weak.BcConfigFileInvalid;
            this.mytip.alertInfo({ type: 'error', content: msgInfo, time: 5000 });
            return;
          }
          let content = '';
          autoFixList.forEach((con: any) => {
            content = content + con;
          });
          const filename = 'autofixlist-' + this.report.id + '.txt';
          this.reportService.downloadReportHTML(content, filename);
        } else if (resp.status === this.lockStatus) {
          this.downloadAutoFixLocked.emit('autofix');
        } else if (resp.status === '0x0d0112') {
          this.haveNewReport = false;
          this.IsLockReport = true;
          this.showModalWarn = this.i18n.common_term_operate_locked1_noOldReport;
          this.showModalBtn = this.i18n.common_term_operate_Create;
          this.showModal();
        } else {
          const content = this.curLang === 'zh-cn' ? resp.infochinese : resp.info;
          this.mytip.alertInfo({ type: 'warn', content, time: 5000 });
        }
    });
  }

}
