import {
  Component, OnInit, ViewChild, TemplateRef,
  ElementRef, ViewEncapsulation, ComponentRef
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import axios from 'axios';
import { AxiosService, I18nService, MessageService, MytipService, CommonService } from '../../../service';
import { TiModalService } from '@cloud/tiny3';
import { LoadingScene } from '../../../shared/directive/loading/domain';
import { CreateLoadingRefService } from '../../../shared/directive/loading/service/create-loading-ref.service';
import {LoadingComponent} from '../../../shared/directive/loading/component/loading/loading.component';

@Component({
  selector: 'app-source-report',
  templateUrl: './source-report.component.html',
  styleUrls: ['./source-report.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SourceReportComponent implements OnInit {
  private loadingRef: ComponentRef<LoadingComponent>;

  constructor(
    public mytip: MytipService,
    private route: ActivatedRoute,
    private router: Router,
    private Axios: AxiosService,
    public i18nService: I18nService,
    private tiModal: TiModalService,
    private elementRef: ElementRef,
    public msgservice: MessageService,
    private commonService: CommonService,
    private createLoadingRefService: CreateLoadingRefService
  ) {
    this.i18n = this.i18nService.I18n();
    // 禁止复用路由
    this.router.routeReuseStrategy.shouldReuseRoute = () => {
      return false;
    };
  }
  @ViewChild('fileLocked', { static: false }) fileLocked: any;
  @ViewChild('disclaimer', { static: false }) disclaimer: any;
  @ViewChild('changeWeb', { static: false }) changeFileModal: any;
  @ViewChild('ieShowModal', { static: false }) ieShowModal: any;
  public i18n: any;
  public tipStr = '返回首页';
  public type = 'home';
  public newReporttip = '';
  public status = {
    soucePathNotExist: '0x050517', // 源码路径不存在
    weakSoucePathNotExist: '0x0b0914',  // 内存一致源码路径不存在
  };
  public souceDefPath = '';
  public showModalWarn = '';
  public showModalBtn = '';
  public haveNewReport = true;
  public isLockReport = false;
  private cancels: any = [];
  queryPage: '';
  showDiffCode = false;
  locked = false;
  currentReport: string;
  reportId = '';
  newReportId = '';
  isSign = true;
  report1: any;
  report: any;
  goBackTip = '';
  currentTab = 1;
  reportTabs = [
    {
      title: '',
      id: 1,
    },
    {
      title: '',
      id: 2,
    }
  ];
  public isFileList = true;
  public selectFileInfo: any = null;
  public lockType: any; // 报告锁定类型

  public giveupfilename: any;

  ngOnInit() {
    this.msgservice.getMessage().subscribe(msg => {
      if (msg.type === 'defaultPath' && msg.value){
        this.souceDefPath = msg.value;
      }
    });
    this.lockType = 'suggestion';
    this.route.queryParams.subscribe((data) => {
      this.currentReport = this.formatCreatedId(data.report);
      this.reportId = data.report;
      this.type = data.type;
      this.queryPage = data.page;
    });
    this.reportTabs[0].title = this.type === 'weakCheck'
      ? this.i18n.common_term_transplant_report_label_1
      : this.i18n.common_term_transplant_report_label;
    this.reportTabs[1].title = this.type === 'weakCheck'
      ? this.i18n.common_term_porting_suggestion_label_1
      : this.i18n.common_term_porting_suggestion_label;
    this.report = {
      created: this.currentReport,
      id: this.reportId
    };
    this.tipStr = this.i18n.common_term_return;
  }
  public async isOldReport() {
    // 生成loading页面
    this.loadingRef = this.createLoadingRefService.createLoading(
      document.querySelector('div.main-container'), LoadingScene.GLOBAL);
    const CancelToken = axios.CancelToken;
    await this.Axios.axios.get(`/task/progress/?task_type=${this.type === 'weakCheck' ? '10' : '0' }
    &task_id=${ encodeURIComponent(this.report.id) }`, {
        cancelToken: new CancelToken(c1 => (this.cancels.push(c1)))
    })
    .then((resp: any) => {
        this.newReportId = resp.data.id;
        this.isLockReport = false;
        if (resp.status === '0x0d0112'){
          // 报告非最新，重建新任务
          this.haveNewReport = false;
          this.isLockReport = true;
          this.showModalWarn = this.i18n.common_term_operate_locked1_noOldReport;
          this.showModalBtn = this.i18n.common_term_operate_Create;
          this.showModal();
        }else if (resp.status === '0x0d0223' || resp.status === '0x0d0a20' ){
          // 文件已锁定，请跳转-weak、源码等
          this.isLockReport = true;
          this.showModalWarn = this.i18nService.I18nReplace(
          this.i18n.common_term_operate_locked1, {
            0 : this.commonService.formatCreatedId(resp.data.id),
          });
          this.showModalBtn = this.i18n.common_term_operate_check;
          this.showModal();
        }
    });
  }

  showModal(){
    this.tiModal.open(this.ieShowModal, {
        id: 'saveModal',
        modalClass: 'del-report',
        close: (): void => { },
        dismiss: (): void => { }
    });
  }
  goHomeNew(context: any) {
    if (!this.haveNewReport) {
      history.go(-1);
    }else{
      const param = {
        queryParams: {
          report : this.newReportId,
          type : this.type
        }
      };
      this.router.navigate( ['report'] , param );
      context.close();
    }
  }
  viewSuggestion(data: any): void {
    this.selectFileInfo = data;
    const title = typeof(this.selectFileInfo.fileType) !== 'undefined'
      ? this.i18n.common_term_porting_suggestion_label
      : this.i18n.common_term_porting_suggestion_label_1;
    this.changeActiveTab({
      id: 2,
      title
    });
  }

  confirmFileList(flag: any) {
    this.isFileList = flag;
    if (!flag) {
      this.elementRef.nativeElement.querySelector('.ti3-tabs').style.display = 'none';
    } else {
      this.elementRef.nativeElement.querySelector('.ti3-tabs').style.display = 'block';
    }
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
      dismiss: (): void => {
        const param = {
          queryParams: {
            report: this.reportId,
            type: this.type,
            time: new Date().getTime(),
          }
        };
        this.router.navigate(['report'], param);
        sessionStorage.setItem('tabFlag', 'true');
      }
    });
  }
  // 获取报告锁定信息
  getReportId(e: any) {
    this.newReportId = e.id;
    this.locked = e.isLocked;
  }

  // 确认免责声明
  confirmDisclaimer() {
    this.disclaimer.Open();
    this.Axios.axios.post('/users/firstdisclaimer/').then((res: any) => {
      this.disclaimer.Close();
    });
    this.isSign = true;
  }
  // 取消免责声明
  closeDisclaimer() {
    this.disclaimer.Close();
    const param = {
      queryParams: {
        report: this.reportId,
        type: this.type,
        time: new Date().getTime(),
      }
    };
    this.router.navigate(['report'], param);
    sessionStorage.setItem('tabFlag', 'true');
  }

  // 获取报告锁定信息
  getSign(e: any) {
    this.isSign = e;
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
  goHome() {
    setTimeout(() => {
      this.giveupfilename = sessionStorage.getItem('currentfilename');
      const flag = sessionStorage.getItem('editFlag');
      if (flag === 'true') {
        this.tiModal.open(this.changeFileModal, {
          id: 'changeWeb',
          modalClass: 'modal400',
          close: (): void => {
            history.go(-1);
            sessionStorage.setItem('editFlag', 'false');
          },
          dismiss: () => { }
        });
      } else {
        history.go(-1);
      }
    }, 0);
  }

  checkChangeHandle(data: any) {
    this.showDiffCode = data;
  }

  async changeActiveTab(data: any) {
    if (data.id === this.currentTab) {
      return;
    }
    if (data.id === 1) {
      // 报告页签
      this.giveupfilename = sessionStorage.getItem('currentfilename');
      const flag = sessionStorage.getItem('editFlag');
      if (flag === 'true') {
        this.tiModal.open(this.changeFileModal, {
          id: 'changeWeb',
          modalClass: 'modal400',
          close: (): void => {
            this.currentTab = data.id;
            sessionStorage.setItem('editFlag', 'false');
          },
          dismiss: () => { }
        });
      } else {
        this.currentTab = data.id;
      }
    } else if (data.id === 2) { // 源码页签
      await this.isOldReport();
      if (this.isLockReport) {
        this.createLoadingRefService.destroyLoading(this.loadingRef);
        return;
      }
      const souceInfoUrl = data.title === this.i18n.common_term_porting_suggestion_label
        ? `/portadv/tasks/${encodeURIComponent(this.report.id)}/portinginfo/`
        : `/portadv/weakconsistency/tasks/${encodeURIComponent(this.report.id)}/portinginfo/`;
      this.checkSouceExistence(data, souceInfoUrl);
      return;
    }
  }

  // 判断源码文件是否被删除
  checkSouceExistence(data: any, souceInfoUrl: string) {
    let filePath = sessionStorage.getItem('currentfilename');
    if (this.souceDefPath !== ''){
      filePath = this.souceDefPath;
    }
    const params = {
      filepath: filePath
    };
    this.Axios.axios.post(souceInfoUrl, params).then((resp: any) => {
      this.createLoadingRefService.destroyLoading(this.loadingRef);
      if (resp.status === this.status.soucePathNotExist || resp.status === this.status.weakSoucePathNotExist) {
        const lang = sessionStorage.getItem('language');
        lang === 'zh-cn'
        ? this.mytip.alertInfo({ type: 'warn', content: resp.infochinese, time: 10000 })
        : this.mytip.alertInfo({ type: 'warn', content: resp.info, time: 10000 });
      } else {
        this.currentTab = data.id;
        // 判断文件是否被锁定
        if (this.locked) {
          this.report1 = this.formatCreatedId(this.newReportId);
          this.newReporttip = this.i18nService.I18nReplace(this.i18n.common_term_operate_locked1, { 1: this.report1 });
          this.isLocked(this.fileLocked);
          // 判断用户是否已签署免责声明
        } else if (!this.isSign) {
          this.disclaimer.Open();
        }
      }
    });
  }

  // 下载编译器配置文件锁定弹框
  downloadAutoFixLocked(type: any) {
    this.lockType = type;
    this.report1 = this.formatCreatedId(this.newReportId);
    this.newReporttip = this.i18nService.I18nReplace(this.i18n.common_term_operate_locked1, { 1: this.report1 });
    this.Axios.axios.get(`/task/progress/?task_type=10&task_id=${this.newReportId}`)
    .then((resp: any) => {
      if (resp.data.autoFix) {
        this.newReporttip = this.i18nService.I18nReplace(
          this.i18n.check_weak.lock_auto_fix_body_true, { 1: this.report1});
      } else {
        this.newReporttip = this.i18nService.I18nReplace(
          this.i18n.check_weak.lock_auto_fix_body_false, { 1: this.report1});
      }
      this.isLocked(this.fileLocked);
    })
    .catch ((error: any) => {
      this.mytip.alertInfo({ type: 'error', error, time: 5000 });
    });
  }

}
