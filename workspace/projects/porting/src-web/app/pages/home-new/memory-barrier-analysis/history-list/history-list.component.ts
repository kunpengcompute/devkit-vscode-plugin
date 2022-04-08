import { Component, OnInit, Output, EventEmitter, ViewChild, ViewEncapsulation } from '@angular/core';
import { TiMessageService, TiTableSrcData } from '@cloud/tiny3';
import { Router } from '@angular/router';
import {
  I18nService, AxiosService, MessageService,
  MytipService, CommonService, ReportService
} from '../../../../service';
import { BcfileReportService } from '../../../detail/bcfile-report/bcfile-report.service';
import { BCFileReportApi, SourceCodeReportApi } from '../../../../api';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-history-list',
  templateUrl: './history-list.component.html',
  styleUrls: ['./history-list.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class HistoryListComponent implements OnInit {
  @Output() changeIsCommit = new EventEmitter();
  @Output() changeBCCommit = new EventEmitter();

  @ViewChild('historyListChild', { static: false }) historyListChild: any;

  public i18n: any;
  public imgBase: any;

  public reportList: Array<any> = [];
  public sourceReportList: Array<any> = [];
  public BCReportList: Array<any> = [];
  public reportId = '';
  public createBtnDisabled = false;
  public createBtnDisabledTip = '';
  public isCommit = false;

  private creatingResultMsgSub: Subscription;
  public reportServiceSub: Subscription;

  public textForm1: any = {
    firstItem: {
      label: '',
      value: []
    },
    secondItem: {
      label: '',
      value: ''
    }
  };
  public scanItems = ['soFile', 'lines'];
  public scanItemsObj: any = {
    soFile: {
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
  public cfileDetailSrcData: TiTableSrcData;
  public totalLine = 0;
  public cfileLine = 0;

  public currLang: string; // 当前语言类型

  public tabs: Array<any>;

  public safeFlagBc: boolean;
  public dangerFlagBc: boolean;
  public safeFlag: boolean;
  public dangerFlag: boolean;
  public middleStatus = {
    sourceSafeFlag: false,
    sourcedanFlag: false,
    BCSafeFlag: false,
    BCdanFlag: false
  };

  public BCCommit: boolean; // 是否不能检查 BC文件, 父容器需要

  constructor(
    public i18nService: I18nService,
    public Axios: AxiosService,
    public router: Router,
    public timessage: TiMessageService,
    private msgService: MessageService,
    public mytip: MytipService,
    private commonService: CommonService,
    private bcfileReportService: BcfileReportService,
    private reportService: ReportService,
    private bcfileReportApi: BCFileReportApi,
    private sourceCodeReportApi: SourceCodeReportApi
  ) {
    this.i18n = this.i18nService.I18n();
  }

  ngOnInit() {
    // 第一次登录 || 密码过期
    if (sessionStorage.getItem('isFirst') === '1' || sessionStorage.getItem('isExpired') === '1') { return; }

    this.currLang = sessionStorage.getItem('language');
    this.tabs = [
      {
        title: this.i18n.check_weak.sourceHistory,
        active: true,
        num: 0,
        activeChange: (isActive: boolean): void => {
          if (isActive) {
            this.reportList = this.sourceReportList;
            this.safeFlag = this.middleStatus.sourceSafeFlag;
            this.dangerFlag = this.middleStatus.sourcedanFlag;
            if (!this.reportList.length) {
              this.historyListChild.handleNoDataTitle(false);
            }
          }
        }
      },
      {
        title: this.i18n.check_weak.BCHistory,
        active: false,
        num: 0,
        activeChange: (isActive: boolean): void => {
          if (isActive) {
            this.reportList = this.BCReportList;
            this.safeFlagBc = this.middleStatus.BCSafeFlag;
            this.dangerFlagBc = this.middleStatus.BCdanFlag;
            if (!this.reportList.length) {
              this.historyListChild.handleNoDataTitle(true);
            }
          }
        }
      },
    ];

    this.msgService.getMessage().subscribe(msg => {
      if (msg.type === 'bc') {
          this.tabs[1].active = true;
          this.tabs[0].active = false;
          this.reportList = this.BCReportList;
          this.safeFlagBc = this.middleStatus.BCSafeFlag;
          this.dangerFlagBc = this.middleStatus.BCdanFlag;
          if (!this.reportList.length) {
            this.historyListChild.handleNoDataTitle(true);
          }
      }else if (msg.type === 'code') {
          this.tabs[1].active = false;
          this.tabs[0].active = true;
          this.reportList = this.sourceReportList;
          this.safeFlag = this.middleStatus.sourceSafeFlag;
          this.dangerFlag = this.middleStatus.sourcedanFlag;
          if (!this.reportList.length) {
            this.historyListChild.handleNoDataTitle(false);
          }
      }
  });

    this.cfileDetailSrcData = {
      data: [],
      state: {
        searched: false,
        sorted: false,
        paginated: false
      }
    };
    this.reportServiceSub = this.msgService.getMessage().subscribe(msg => {
      if (msg.value && msg.type === 'isreportChange') {
        this.getHistoryReport();
        this.searchBCHistory();
      }
    });
    this.creatingResultMsgSub = this.msgService.getMessage().subscribe(msg => {
      if (msg.type === 'creatingResultMsg') {
        if (msg.data.type === 'weakCheck' && msg.data.state === 'success') {
          this.getHistoryReport();
        }
        if (msg.data.type === 'bcCheck' && msg.data.state === 'success') {
          this.searchBCHistory();
        }
      }
    });
    this.getHistoryReport();
    this.searchBCHistory();
  }

  ngOnDestory() {
    if (this.reportServiceSub) {
      this.reportServiceSub.unsubscribe();
    }
    if (this.creatingResultMsgSub) {
      this.creatingResultMsgSub.unsubscribe();
    }
  }

  // 删除历史报告后查询对应的历史记录
  searchHistory(type: any) {
    // 删除全部历史报告
    if (type) {
      type === 'source' ? this.getHistoryReport() : this.searchBCHistory();
    } else { // 删除单个
      this.tabs[0].active ? this.getHistoryReport() : this.searchBCHistory(true);
    }
  }

  // 查询源码报告历史记录
  getHistoryReport() {
    this.Axios.axios.get('/portadv/weakconsistency/tasks/').then((resp: any) => {
      this.sourceReportList = [];
      if (this.commonService.handleStatus(resp) === 0) {
        this.isCommit = false;
        this.middleStatus.sourceSafeFlag = false;
        this.middleStatus.sourcedanFlag = false;
        if (resp.data.histasknumstatus === 2) {
          this.middleStatus.sourceSafeFlag = true;
        } else if (resp.data.histasknumstatus === 3) {
          this.isCommit = true;
          this.middleStatus.sourcedanFlag = true;
        }
        this.safeFlag = this.middleStatus.sourceSafeFlag;
        this.dangerFlag = this.middleStatus.sourcedanFlag;
        this.changeIsCommit.emit(this.isCommit);
        resp.data.tasklist.forEach((item: any) => {
          this.sourceReportList.push({
            created: this.commonService.formatCreatedId(item.id),
            id: item.id,
            showTip: false,
            isSource: true, // 是否为源码报告
            imgSrc: ['./assets/img/home/download.svg', './assets/img/home/delete.svg'],
            autoFix: item.autoFix, // 是否生成编译器工具配置文件
          });
        });

        if (this.tabs[0].active) {
          this.reportList = this.sourceReportList;
        }
        this.tabs[0].num = resp.data.totalcount;
        if (this.tabs[0].num > 50) {
          if (sessionStorage.getItem('reportFlag') !== 'false') {
            this.timessage.open({
              type: 'prompt',
              title: this.i18n.common_term_history_list_overflow_tip,
              content: this.i18n.common_term_history_list_overflow_tip2,
              cancelButton: {
                show: false
              },
              close(): void {
                sessionStorage.setItem('reportFlag', 'false');
              }
            });
          }
        }
      }
    });
  }

  /**
   * 查询 BC 文件历史记录
   * @param bool 是否点击的删除
   */
  searchBCHistory(bool?: boolean) {
    this.Axios.axios.get('/portadv/weakconsistency/tasks/?bc_task=True').then((res: any) => {
      this.BCReportList = [];
      if (this.commonService.handleStatus(res) === 0) {
        this.BCCommit = false;
        this.middleStatus.BCSafeFlag = false;
        this.middleStatus.BCdanFlag = false;
        if (res.data.histasknumstatus === 2) {
          this.middleStatus.BCSafeFlag = true;
        } else if (res.data.histasknumstatus === 3) {
          this.BCCommit = true;
          this.middleStatus.BCdanFlag = true;
        }
        res.data.tasklist.forEach((item: any) => {
          this.BCReportList.push({
            created: this.commonService.formatCreatedId(item.id),
            id: item.id,
            filename: item.filename,
            showTip: false,
            isSource: false, // 是否为源码报告
            imgSrc: ['./assets/img/home/download.svg', './assets/img/home/delete.svg']
          });
        });
        this.changeBCCommit.emit(this.BCCommit);
        this.tabs[1].num = res.data.totalcount;
        if (bool || this.tabs[1].active) {
          this.safeFlagBc = this.middleStatus.BCSafeFlag;
          this.reportList = this.BCReportList;
          this.dangerFlagBc = this.middleStatus.BCdanFlag;
          if (!this.reportList.length) {
            this.historyListChild.handleNoDataTitle(true);
          }
        }
        if (this.tabs[1].num > 50) {
          if (sessionStorage.getItem('reportFlag') !== 'false') {
            this.timessage.open({
              type: 'prompt',
              title: this.i18n.common_term_history_list_overflow_tip,
              content: this.i18n.common_term_history_list_overflow_tip2,
              cancelButton: { show: false },
              close(): void {
                sessionStorage.setItem('reportFlag', 'false');
              }
            });
          }
        }
      }
    });
  }

  // 前往源码报告详情页
  goReport(item: any) {
    if (item.isSource) {
      this.sourceCodeReportApi.getEnhancementsSourceReport(encodeURIComponent(item.id))
      .then((resp: any) => {
        if (this.commonService.handleStatus(resp) === 0 ||
          this.commonService.handleStatus(resp) === 1 ||
          this.commonService.handleStatus(resp) === 2) {
          const param = {
            queryParams: {
              report: item.id,
              type: 'weakCheck'
            }
          };
          this.router.navigate(['report'], param);
        } else {
          const content = this.currLang === 'zh-cn' ? resp.infochinese : resp.info;
          this.mytip.alertInfo({ type: 'error', content, time: 5000 });
        }
      });
    } else {
      this.router.navigate(['BCReport'], {
        queryParams: {
          report: item.id
        }
      });
    }
    sessionStorage.setItem('tabFlag', 'true');
  }

  // 获取历史报告信息 -> 子组件调用
  searchReportDetail(item: any) {
    this.tabs[0].active ? this.getReportDetail(item) : this.searchReport(item);
  }

  // 获取历史源码报告详情信息
  getReportDetail(report: any) {
    this.Axios.axios.defaults.headers.isLocked = true;
    this.sourceCodeReportApi.getEnhancementsSourceReport(encodeURIComponent(report.id))
      .then((resp: any) => {
        if (this.commonService.handleStatus(resp) === 0) {
          this.textForm1.firstItem.label = this.i18n.common_term_ipt_label.source_code_path;
          this.textForm1.firstItem.value = resp.data.source_dir;
          this.scanItemsObj.soFile.label = this.i18n.common_term_weak_result_cFile;
          this.scanItemsObj.lines.label = this.i18n.common_term_result_lines;
          this.scanItemsObj.soFile.content = resp.data.fix_sum;
          let cfileNameArr = [];
          this.cfileDetailSrcData.data = [];
          resp.data.result.barriers.forEach((item: any, index: any) => {
            cfileNameArr = item.file.split('/');
            this.cfileDetailSrcData.data.push({
              id: index + 1,
              filename: cfileNameArr[cfileNameArr.length - 1],
              path: item.file,
              suggestionNum: item.count
            });
          });
          const num = resp.data.fix_sum;
          this.downloadReportAsHtml(resp.data.result, report, num);
        } else {
          const content = this.currLang === 'zh-cn' ? resp.infochinese : resp.info;
          this.mytip.alertInfo({ type: 'error', content, time: 5000 });
        }
      });
  }

  // 查询 BC 报告详情
  searchReport(item: any) {
    this.bcfileReportApi.getReport(encodeURIComponent(item.id))
      .then((resp: any) => {
        if (this.commonService.handleStatus(resp) === 0) {
          const data = this.bcfileReportService.handleReportDate(resp.data);
          const iii = location.href.indexOf('#');
          const api = location.href.slice(0, iii);
          const image2 = `${api + './assets/img/header/arrow_bottom.svg'}`;
          const getBase64 = this.commonService.getBase64;
          getBase64(image2).then(res => {
            const settingLeftInfo = {
              firstItem: {
                label: data.settingLeftInfo[0].label,
                value: data.settingLeftInfo[0].value,
                fixSum: data.fixSum
              }
            };
            const content = this.reportService.downloadTemplete(
              'BCFile',
              item.id,
              settingLeftInfo,
              '',
              {
                soFile: {
                  label: this.i18n.check_weak.BCSuggestion.title
                },
                type: ['soFile']
              },
              data.soFileSrcData,
              res
            );
            this.reportService.downloadReportHTML(content, item.id + '.html');
          });
        } else {
          const content = this.currLang === 'zh-cn' ? resp.infochinese : resp.info;
          this.mytip.alertInfo({ type: 'error', content, time: 5000 });
        }
      });
  }

  // 下载 html 报告
  downloadReportAsHtml(content: any, data: any, num: any) {
    const iii = location.href.indexOf('#');
    const api = location.href.slice(0, iii);
    const image = `${api + './assets/img/home/nodata.svg'}`;
    this.getBase64(image, content, data, num);
  }

  getBase64(imgUrl: any, content: any, data: any, num: any) {
    const that = this;
    const xhr = new XMLHttpRequest();
    xhr.open('get', imgUrl, true);
    // 至关重要
    xhr.responseType = 'blob';
    xhr.onload = () => {
      if (xhr.status === 200){
        // 得到一个blob对象
        const blob = xhr.response;
        // 至关重要
        const oFileReader = new FileReader();
        oFileReader.onloadend = (e: any) => {
          let base64 = e.currentTarget.result;
          base64 = base64.replace('; charset=UTF-8', '');
          that.imgBase = base64;
          that.download2Html(content, data, num);
        };
        oFileReader.readAsDataURL(blob);
      }
    };
    xhr.send();
  }

  download2Html(reportData: any, data: any, num: any) {
    const filename = data.id + '.html';
    const content = this.downloadTemplete(reportData, data.created, num);
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

  downloadTemplete(report: any, created: any, num: any): string {
    const iii = location.href.indexOf('#');
    const api = location.href.slice(0, iii);
    const asmMessage = 'add "__asm__ volatile("dmb sy")" in the position indicated by the below items';
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
      const showTotal = scanItem === 'soFile' ? 'block' : 'none';
      if (scanItem === 'soFile' && this.scanItemsObj[scanItem].files) {
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
                  <tr class="tr-header">
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
                  <tr class="tr-header">
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
            ${ this.i18n.check_weak.report_list_tip_1 }：${ asmMessage }
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
            background: url(${api + './assets/img/home/nodata.svg'}) 50% 25px no-repeat !important;
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
          .tr-header{
            background:#f5f9ff;
            color:#333;
            font-weight: 400;
            border-left: none;
            padding: 0 10px;
            font-size: 14px;;
          }
          .h1-title{
            text-align: center;
            font-weight: normal;
            font-size: 24px;
            border-bottom: solid 1px #222;
            padding-bottom: 20px;
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
        <h1 class="h1-title">${created}</h1>
        <div>
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
}
