import { Component, OnInit, Input, Output, EventEmitter,
TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';

import { TiModalService } from '@cloud/tiny3';

import { I18nService } from '../../../../../service/i18n.service';
import { AxiosService } from '../../../../../service/axios.service';
import { MytipService } from '../../../../../service/mytip.service';
import { CommonService } from '../../../../../service/common/common.service';
import { HyMiniModalService } from 'hyper';
import { ReportService } from '../../../../../service/report/report.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-common-history-list',
  templateUrl: './common-history-list.component.html',
  styleUrls: ['./common-history-list.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CommonHistoryListComponent implements OnInit {
  @Input() type: string;
  @Input() reportTotalNum: number;
  @Input() tabs: Array<any>;
  @Input() safeFlag: boolean;
  @Input() dangerFlag: boolean;
  @Input() safeFlagBc: boolean;
  @Input() dangerFlagBc: boolean;
  @Input() reportList: Array<object>;
  @Output() goReport = new EventEmitter();
  @Output() getReportDetail = new EventEmitter();
  @Output() searchHistory = new EventEmitter();

  @ViewChild('allModal', { static: false }) allModal: any;
  @ViewChild('fileLocked', { static: false }) fileLocked: any;
  @ViewChild('ieShowModal', { static: false }) ieShowModal: any;
  constructor(
    private tiModal: TiModalService,
    public i18nService: I18nService,
    public router: Router,
    public axiosService: AxiosService,
    public reportService: ReportService,
    private mytipService: MytipService,
    private miniModalServe: HyMiniModalService,
    private commonService: CommonService,
  ) {
    this.i18n = this.i18nService.I18n();
  }

  public i18n: any;
  public currLang: string;

  public noDataTitle: string;
  public newReportId: string; // 新报告ID
  public newReporttip: any;
  public reportIdFormat: any;
  public lockStatus: any;
  // 去新报告则赋值
  public goNewReport = '';
  public isOldReport = false;
  public showModalWarn = '';
  public showModalBtn = '';
  ngOnInit(): void {
    this.currLang = sessionStorage.getItem('language');
    this.noDataTitle = this.handleNoDataTitle(false);
    this.lockStatus = '0x0d0a20';
  }

  /**
   * 删除单个历史报告
   * @param modalTemplate 模态框组件
   * @param id 删除报告 id
   */
  delOneHistory(id: number) {
    const delOneUrl = this.handleDelOneUrl(id);
    this.miniModalServe.open({
      type: 'warn',
      content: {
        title: this.i18n.common_term_history_report_del_title,
        body: this.i18n.common_term_history_report_del_tip2
      },
      close: (): void => {
        this.axiosService.axios.delete(delOneUrl, { delete_flag: 0 }).then((data: any) => {
          if (this.commonService.handleStatus(data) === 0) {
            const msgInfo = this.currLang === 'zh-cn' ? data.infochinese : data.info;
            this.mytipService.alertInfo({ type: 'success', content: msgInfo, time: 3000 });
            this.searchHistory.emit();
          }
        });
      },
      dismiss: () => { }
    });
  }

  /**
   * 清空历史报告
   * @param type 内存一致性才有 点击类型
   */
  deleteAll(type?: string): void {
    let delAllUrl = '';
    if (type) {
      // 如果没有历史记录，则不让点击
      if (type === 'source') {
        if (!this.tabs[0].num) { return; }
        delAllUrl = '/portadv/weakconsistency/tasks/';
      } else{
        if (!this.tabs[1].num) { return; }
        delAllUrl = '/portadv/weakconsistency/tasks/?bc_task=True';
      }
    }
    this.miniModalServe.open({
      type: 'warn',
      content: {
        title: this.i18n.common_term_history_report_del_title,
        body: this.i18n.common_term_all_history_tip2
      },
      close: (): void => {
        this.axiosService.axios.delete(delAllUrl, { delete_flag: 1 }).then((data: any) => {
          if (this.commonService.handleStatus(data) === 0) {
            const msgInfo = this.currLang === 'zh-cn' ? data.infochinese : data.info;
            this.mytipService.alertInfo({ type: 'success', content: msgInfo, time: 3000 });
            this.searchHistory.emit(type);
          }
        });
      },
      dismiss: () => { }
    });
  }
   async getIsOldReport(id: any){
    this.isOldReport = false;
    const  res = await this.axiosService.axios.get(`/task/progress/?task_type=10
    &task_id=${ encodeURIComponent(id) }`, { });
    if (res.status !== '0x0d0a20' && res.status !== '0x0d0112') { return; }
    this.goNewReport = (res.status === '0x0d0a20') ? res.data.id : '';
    if (res.status === '0x0d0112') {
      this.showModalWarn = this.i18n.common_term_operate_locked1_noOldReport;
      this.showModalBtn = this.i18n.common_term_operate_Create;
    } else {
      this.showModalWarn = this.i18nService.I18nReplace(
        this.i18n.common_term_operate_locked1_download,
        {0 : this.commonService.formatCreatedId(res.data.id) }
      );
      this.showModalBtn = this.i18n.common_term_operate_Download;
    }
    if (res.status === '0x0d0a20' || res.status === '0x0d0112'){
      this.isOldReport = true;
      this.showModal();
    }
   }
  /**
   * 下载报告
   * @param data 报告内容
   * @param type 下载类型
   */
  async download(data: any, type: string) {
    await this.getIsOldReport(data.id);
    if (this.isOldReport){
      return;
    }
    this.showTipInstruct(data);
    if (type === 'html') {
      this.getReportDetail.emit(data);
    }
  }
  goHome(context: any) {
    if (this.goNewReport) {
      const item = {
        id: this.goNewReport,
        showTip: false,
        isSource: true,
        autoFix: true
      };
      this.goReport.emit(item);
    }
    context.close();
  }
  showModal(){
    setTimeout(() => {
      this.tiModal.open(this.ieShowModal, {
          id: 'saveModal',
          modalClass: 'del-report-notDown',
          close: (): void => { },
          dismiss: (): void => { }
      });
    }, 500);
  }
  // 前往报告详情页
  goReportDetail(item: any): void {
    this.goReport.emit(item);
  }

  // 控制 下发指令 tip显示或隐藏
  showTipInstruct(item: any): void {
    if (!item.showTip) {
      item.showTip = true;
      window.setTimeout(() => {
        item.showTip = false;
      }, 3000);
    }
  }

  /**
   * 处理删除单个报告请求地址
   * @param id 删除报告 id
   */
  handleDelOneUrl(id: number): string {
    switch (this.type) {
      case 'weakCheck':
        return this.tabs[0].active
          ? `/portadv/weakconsistency/task/${encodeURIComponent(id)}/`
          : `/portadv/weakconsistency/task/${encodeURIComponent(id)}/?bc_task=True`;
      default:
        return '';
    }
  }

  /**
   * 改变 history 报告图标
   * @param num 第几个图标
   * @param bool true: 移出   false: 移入
   * @param item hover数据信息
   */
  public changeHistoryImgSrc(num: number, bool: boolean, item: any): void {
    if (!num) {
      item.imgSrc[num] = !bool ? './assets/img/home/download_hover.svg' : './assets/img/home/download.svg';
    } else {
      item.imgSrc[num] = !bool ? './assets/img/home/delete_hover.svg' : './assets/img/home/delete.svg';
    }
  }

  /**
   * 无历史记录时的标题
   * @param bool 内存一致性 父组件传过来的参数
   */
  handleNoDataTitle(bool?: boolean): string {
    switch (this.type) {
      // 内存一致性
      case 'weakCheck':
        // 定义一个变量是为了父组件调用时 重新赋值
        const noData = !bool ? this.i18n.common_term_no_report.weakNoData : this.i18n.common_term_no_report.BCNoData;
        this.noDataTitle = noData;
        return noData;
      default:
        return '';
    }
  }

   async downloadAutoFix(reportId: any) {
      this.axiosService.axios.get(`/task/progress/?task_type=10&task_id=${encodeURIComponent(reportId)}`)
        .then((resp: any) => {
          if (this.commonService.handleStatus(resp) === 0) {
            const autoFixList = resp.data.autofixlist;
            if (autoFixList.length === 0) {
              const msgInfo = this.i18n.check_weak.BcConfigFileInvalid;
              this.mytipService.alertInfo({ type: 'error', content: msgInfo, time: 5000 });
              return;
            }
            let content = '';
            autoFixList.forEach((con: any) => {
              content = content + con;
            });
            const filename = 'autofixlist-' + reportId + '.txt';
            this.reportService.downloadReportHTML(content, filename);
          } else if (resp.status === this.lockStatus) {
            this.newReportId = resp.data.id;
            this.reportIdFormat = this.formatCreatedId(this.newReportId);
            this.axiosService.axios.get(`/task/progress/?task_type=10&task_id=${this.newReportId}`)
              .then((res: any) => {
                if (res.data.autoFix) {
                  this.newReporttip = this.i18nService.I18nReplace(
                    this.i18n.check_weak.lock_auto_fix_body_true, {1: this.reportIdFormat});
                } else {
                  this.newReporttip = this.i18nService.I18nReplace(
                    this.i18n.check_weak.lock_auto_fix_body_false, {1: this.reportIdFormat});
                }
              });
            this.isLocked(this.fileLocked);
          } else if (resp.status === '0x0d0112') {
              this.showModalWarn = this.i18n.common_term_operate_locked1_noOldReport;
              this.showModalBtn = this.i18n.common_term_operate_Create;
              this.showModal();
          } else {
           const content = this.currLang === 'zh-cn' ? resp.infochinese : resp.info;
           this.mytipService.alertInfo({ type: 'warn', content, time: 5000 });
         }
      });
    }

  // 锁定弹窗
  isLocked(modalTemplate: TemplateRef<any>) {
    this.tiModal.open(modalTemplate, {
      id: 'fileLocked',
      close: (): void => {
        const param = {
          queryParams: {
            report: this.newReportId,
            type: this.type
          }
        };
        this.router.navigate(['report'], param);
        sessionStorage.setItem('tabFlag', 'true');
      },
    });
  }

  // 返回的id数据处理2019_08_22_11_43_55 => 2019/08/22 11:43:55
  formatCreatedId(data: any) {
    const years = data.slice(0, 4);
    const months = data.slice(4, 6);
    const days = data.slice(6, 8);
    const hours = data.slice(8, 10);
    const minutes = data.slice(10, 12);
    const seconds = data.slice(12, 14);
    return `${years}/${months}/${days} ${hours}:${minutes}:${seconds}`;
  }

}
