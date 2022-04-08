import {
  Component, OnInit, ViewChild, ElementRef, Input, OnDestroy, Output, EventEmitter
 } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup, ValidationErrors } from '@angular/forms';
import { TiValidators, TiValidationConfig, TiLocale, TiModalService } from '@cloud/tiny3';
import {
  LoginService, AxiosService, CommonService,
  MessageService, MytipService, I18nService
} from '../../service';
import { Subscription } from 'rxjs';
import { VerifierUtil } from '../../../../../hyper';
const hardUrl: any = require('../../../assets/hard-coding/url.json');

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Input() bannerShow: boolean;
  @Output() openAdvice = new EventEmitter<any>();

  constructor(
    private elementRef: ElementRef,
    public Axios: AxiosService,
    public router: Router,
    public mytip: MytipService,
    public i18nService: I18nService,
    private tiModal: TiModalService,
    private messageServe: MessageService,
    private loginService: LoginService,
    private commonService: CommonService
  ) {
    this.i18n = this.i18nService.I18n();
  }
  @ViewChild('updatePwdModal', { static: false }) updatePwdModal: any;
  @ViewChild('about', { static: false }) aboutMask: any;
  @ViewChild('disclaimer', { static: false }) disclaimerMask: any;
  @ViewChild('certificateModal', { static: false }) certificateModal: any;
  @ViewChild('logoutModal', { static: false }) logoutModal: any;
  @ViewChild('changeWeb', { static: false }) changeFileModal: any;

  public leftMenuList: any = []; // 展示的左侧菜单栏选项
  public pwdShow = true;
  public managementTaskId: any;
  public username: string;
  public role: string;
  public loginUserId: any; // 登录用户的相关信息
  public bcFileSrcData: any;
  public bcFileResult: any;
  public bcResultPartial = false;

  public i18n: any;
  public status: any = '';

  // 用户列表翻页
  public label: any;
  public validation: TiValidationConfig = {
    // 失焦验证
    type: 'blur',
    errorMessage: {
      regExp: '',
      required: ''
    }
  };

  public langSelected: any;
  public xmltimer: any = null;
  public langOptions: Array<any> = [];

  public soinfo: any = {
    ing: '',
    success: '',
    fail: '',
    tip: '',
    operation: '',
    progessValue: '',
    barWidth: '0'
  };
  public ischangePwd = false;
  public totalBar = 460; // 进度条总宽 //目前数据大小
  public totalProgress = 100; // 总的数据大小
  public changePwdForm: FormGroup;
  public isCheck = false;
  public currLang = '';
  public backupZh = {
    ing: '备份中...',
    success: '备份成功',
    fail: '备份失败',
    operation: '备份进行中，请勿关闭当前界面'
  };
  public backupEn = {
    ing: 'Backing up…',
    success: 'Backup Success',
    fail: 'Backup Failure',
    operation: 'Backup task is in process. Do not close the current page.'
  };
  public recoveryZh = {
    ing: '恢复中...',
    success: '恢复成功',
    fail: '恢复失败',
    operation: '恢复进行中，请勿关闭当前界面'
  };
  public recoveryEn = {
    ing: 'Restoration task in process…',
    success: 'Restoration Success',
    fail: 'Restoration Failure',
    operation: 'Restoration task in process. Do not close the current page.'
  };
  public upgradeZh = {
    ing: '升级中...',
    success: '升级成功',
    fail: '升级失败',
    operation: '升级进行中，请勿关闭当前界面'
  };
  public upgradeEn = {
    ing: 'Upgrade task in process…',
    success: 'Upgrade Success',
    fail: 'Upgrade Failure',
    operation: 'Upgrade task in process. Do not close the current page.'
  };

  public xmlinfo: any = {
    ing: '',
    success: '',
    fail: '',
    tip: '',
    barWidth: '0',
    progessValue: ''
  };
  public timer: any = null;
  public xmlsituation = 0;
  public soSituation = 0;
  // tslint:disable-next-line: variable-name
  public task_name: any;

  public giveupfilename: any;

  public creatingProgressList: any = [];
  public creatingMsgList: any = [];
  private autoDelTimerObj: any = {};
  public creatingProgressBottom = 10;
  public resultContainerBottom = 10;

  private creatingTaskSub: Subscription;
  private creatingMsgSub: Subscription;
  private uploadingContainerSub: Subscription;

  public certExpiredTip = '';

  /**
   * stopBack
   */
  public stopBack(e: any) {
    return this.commonService.stopBack(e);
  }

  /**
   * 子组件传过来的方法
   * @param data 数据
   */
  public resultOptions(data: any) {
    this.messageServe.sendMessage({
      type: 'resultOption',
      data
    });
    this.resultOptByType(data);
    const idx = this.creatingMsgList.findIndex((item: any) => {
      return item.id === data.id && item.type === data.type;
    });
    if (idx >= 0) { this.creatingMsgList.splice(idx, 1); }
  }

  /**
   * 右下角全局弹框 任务 列表有变化
   * @param data 子组件传过来的数据
   */
  public taskListChange(data: any) {
    this.messageServe.sendMessage({
      type: 'taskComplete',
      data
    });
    this.creatingMsgList = this.creatingMsgList.filter((item: any) => item.id !== data.id );
    if (data.type === 'SoftwarePackage' && data.state === 'failed') {
      this.messageServe.sendMessage({
        type: 'creatingResultMsg',
        data
      });
    }
    if (data.state === 'failed' && !data.msg) { return; }
    if (data.state === 'stop_success') {
      this.stopProgress(data.type);
      this.msgBottomComputed(2);
      this.creatingProBottomComputed(2);
      return;
    }
    if (data.state === 'success' || data.state === 'stop_failed' || (data.data && data.data.type)) {
      this.messageServe.sendMessage({
        type: 'creatingResultMsg',
        data
      });
    }

    this.filterSameMsg(data);
  }

  public expandChange(data: any) {
    this.msgBottomComputed(1);
  }

  private stopProgress(type: any) {
    switch (type) {
      case 'PackagePorting':
        this.messageServe.sendMessage({ type: 'creatingPackPortingProgress', data: false });
        break;
      case 'SourceCode':
        this.messageServe.sendMessage({ type: 'creatingSourceCodeProgress', data: false });
        break;
      case 'SoftwarePackage':
        this.messageServe.sendMessage({ type: 'creatingPackageProgress', data: false });
        break;
      case 'SoftwarePorting':
        this.messageServe.sendMessage({ type: 'SoftwarePortingProgress', data: false });
        break;
      case 'PortingPreCheck':
        this.messageServe.sendMessage({ type: 'CreatingPreCheckProgress', data: false });
        break;
      case 'ByteAlignment':
        this.messageServe.sendMessage({ type: 'CreatingByteAlignmentProgress', data: false });
        break;
      case 'CachelineAlignment':
        this.messageServe.sendMessage({ type: 'CreatingCachelineProgress', data: false });
        break;
      case 'weakCheck':
        this.messageServe.sendMessage({ type: 'creatingWeakCheckProgress', data: false });
        break;
      case 'weakCompiler':
        this.messageServe.sendMessage({ type: 'creatingWeakCompilerProgress', data: false });
        break;
      case 'LogManage':
        this.messageServe.sendMessage({ type: 'creatingLogManageProgress', data: false });
        break;
      case 'bcCheck':
        this.messageServe.sendMessage({ type: 'creatingbcCheckProgress', data: false });
        break;
      default:
        break;
    }
  }

  private filterSameProgress(id: any, type: any, software: any) {
    this.creatingProgressBottom = 10;
    const len = this.creatingProgressList.filter((item: any) => {
      return item.id === id && item.type === type ;
    }).length;
    if (len === 0) {
      this.creatingProgressList.push({
        type,
        id,
        software
      });
    }
    this.creatingProBottomComputed(0);
  }
  private filterSameMsg(msg: any) {
    this.resultContainerBottom = 10;
    const len = this.creatingMsgList.filter((item: any) => {
      return item.type === msg.type && item.id === msg.id;
    }).length;
    if (len === 0) {
      this.creatingMsgList.push({...msg});
    }
    this.filterAutoDelList();
    if (this.creatingMsgList.length > 5) {
      const autoDelMsg = this.creatingMsgList[0];
      this.creatingMsgList = this.creatingMsgList.slice(-5);
      if (autoDelMsg.type !== 'SourceCode' || autoDelMsg.type !== 'PackagePorting') {
        this.stopProgress(autoDelMsg.type);
      }
    }
    this.msgBottomComputed(0);
  }

  // 隐藏弹出框
  private filterAutoDelList() {
    this.creatingMsgList.forEach((item: any, index: any) => {
      if (
        ((item.type === 'SourceCode'
          || item.type === 'PackagePorting'
          || item.type === 'LogManage'
          || item.type === 'weakCompiler'
          || item.type === 'bcCheck'
        )
        && item.state === 'success'
        && item.id)
        || (item.type === 'weakCheck' && item.state === 'success' && item.id && !this.bcResultPartial)
      ) {
        if (this.autoDelTimerObj[item.id]) { return; }
        let time = 10000;
        if (item.type === 'LogManage' || item.type === 'weakCompiler') { time = 3000; }
        const timer = setTimeout(() => {
          const idx = this.creatingMsgList.findIndex((msg: any) => {
            return msg.id === item.id && msg.type === item.type;
          });
          let resultMsgList = JSON.parse(sessionStorage.getItem('resultMsgList'));
          resultMsgList = resultMsgList.filter((res: any) => {
            return res.id !== item.id;
          });
          sessionStorage.setItem('resultMsgList', JSON.stringify(resultMsgList));
          if (idx >= 0) {
            this.creatingMsgList.splice(idx, 1);
          }
          if (this.autoDelTimerObj[item.id]) {
            clearTimeout(this.autoDelTimerObj[item.id]);
            delete this.autoDelTimerObj[item.id];
          }
          this.msgBottomComputed(1);
          this.creatingProBottomComputed(1);
        }, time);
        this.autoDelTimerObj[item.id] = timer;
      }
    });

  }

  // 隱藏內存一致性檢查彈出框
  private filterWeakCheck() {
    const resList = JSON.parse(sessionStorage.getItem('resultMsgList'));
    if (resList) {
      resList.forEach((item: any, index: any) => {
        if (item.type === 'weakCheck' && item.state === 'success') {
          const resultMsgList = JSON.parse(sessionStorage.getItem('resultMsgList'));
          resultMsgList.splice(index, 1);
          sessionStorage.setItem('resultMsgList', JSON.stringify(resultMsgList));
        }
      });
    }
  }

  sortByAsc(col: string) {
    return (pre: any, nex: any) => {
      const preLower = pre[col].toLowerCase();
      const nexLower = nex[col].toLowerCase();
      if (preLower > nexLower){
          return -1;
      }else {
        return 0;
      }
    };
  }


  // 计算任务列表的bottom值
  private creatingProBottomComputed(count: any) {
    let timer = setTimeout(() => {
      const uploadContainerEl = $('.upload-container');
      this.creatingProgressBottom =  uploadContainerEl.length && uploadContainerEl.height();
      const creatingContainerEl = this.elementRef.nativeElement.querySelector('.creating-container');
      this.resultContainerBottom = creatingContainerEl && creatingContainerEl.offsetHeight;
      this.resultContainerBottom += this.creatingProgressBottom;
      if (count <= 3) {
        clearTimeout(timer);
        timer = null;
        count += 1;
        this.creatingProBottomComputed(count);
      }
    }, 100);
  }

  // 计算分析结果弹框的bottom
  private msgBottomComputed(count: any) {
    let timer = setTimeout(() => {
      const creatingContainerEl = this.elementRef.nativeElement.querySelector('.creating-container');
      const uploadContainerEl = $('.upload-container');
      const uploadHeight = uploadContainerEl.length && uploadContainerEl.height();
      this.resultContainerBottom = creatingContainerEl && creatingContainerEl.offsetHeight;
      this.resultContainerBottom += uploadHeight;
      if (count <= 3) {
        clearTimeout(timer);
        timer = null;
        count += 1;
        this.msgBottomComputed(count);
      }
    }, 100);
  }

  private resultOptByType(msg: any) {
    switch (msg.type) {
      case 'SourceCode':
        const param = {
          queryParams: {
            report: msg.id
          }
        };
        this.router.navigate(['report'], param);
        sessionStorage.setItem('tabFlag', 'true');
        sessionStorage.setItem('routerFileDQJC', 'false');
        break;
      case 'weakCheck':
        const param1 = {
          queryParams: {
            report: msg.id,
            type: 'weakCheck'
          }
        };
        this.router.navigate(['report'], param1);
        sessionStorage.setItem('tabFlag', 'true');
        sessionStorage.setItem('routerFileDQJC', 'false');
        break;
      case 'bcCheck':
        const param2 = {
          queryParams: {
            report: msg.id,
          }
        };
        this.router.navigate(['BCReport'], param2);
        sessionStorage.setItem('tabFlag', 'true');
        sessionStorage.setItem('routerFileDQJC', 'false');
        break;
      case 'PackagePorting':
        const params = {
          queryParams: {
            report: msg.id
          }
        };
        this.router.navigate(['softwareMigrationReport'], params);
        sessionStorage.setItem('tabFlag', 'true');
        sessionStorage.setItem('routerFileDQJC', 'false');
        break;
      case 'PortingPreCheck':
        if (msg.data) {
          this.messageServe.sendMessage({type: 'CreatingPreCheckProgress', data: false });
          sessionStorage.setItem('routerFile', 'true');
          sessionStorage.setItem('routerFileDQJC', 'false');
          sessionStorage.setItem('routerFileCacheLine', 'false');
          this.router.navigate(['reportDiff'], msg.data );
        }
        break;
      case 'ByteAlignment':
        if (msg.data) {
        this.messageServe.sendMessage({type: 'CreatingByteAlignmentProgress', data: false });
        sessionStorage.setItem('routerFile', 'false');
        sessionStorage.setItem('routerFileDQJC', 'true');
        sessionStorage.setItem('routerFileCacheLine', 'false');
        this.router.navigate(['reportDiff'], msg.data);
        }
        break;
      case 'CachelineAlignment':
        if (msg.data) {
        this.messageServe.sendMessage({type: 'CreatingCachelineProgress', data: false });
        sessionStorage.setItem('routerFile', 'false');
        sessionStorage.setItem('routerFileDQJC', 'false');
        sessionStorage.setItem('routerFileCacheLine', 'true');
        this.router.navigate(['reportDiff'], msg.data);
        }
        break;
      default:
        break;
    }
  }

  // 查看软件迁移评估有误正在执行的任务
  private getTaskBinary() {
    this.Axios.axios.get('/task/progress/?task_type=7').then((resp: any) => {
      if (!resp.data) { return; }
      if (this.commonService.handleStatus(resp) === 0 && resp.data.task_name) {
        this.messageServe.sendMessage({
          type: 'creatingTask',
          data: {
            id: resp.data.task_name,
            type: 'PackagePorting'
          }
        });
      }
    });
  }

  // 查看源码迁移有无正在执行的任务
  private getTaskUndone() {
    this.Axios.axios.get('/portadv/tasks/taskundone/').then((resp: any) => {
      if (this.commonService.handleStatus(resp) === 0 && resp.data.id) {
        this.messageServe.sendMessage({
          type: 'creatingTask',
          data: {
            id: resp.data.id,
            type: 'SourceCode'
          }
        });
      }
    });
  }

  // 查询有无正在执行的内存一致性任务
  private checkWeakStatus() {
    this.Axios.axios.get('/portadv/weakconsistency/tasks/taskundone/').then((resp: any) => {
      if (this.commonService.handleStatus(resp) === 0 && resp.data.length) {
        resp.data.forEach((el: any) => {
          const reportId = el.task_name;
          const type = el.task_type;
          if (type === 9) {
            this.messageServe.sendMessage({
              type: 'creatingTask',
              data: {
                id: reportId,
                type: 'weakCompiler'
              }
            });
          } else if (type === 10) {
            this.messageServe.sendMessage({
              type: 'creatingTask',
              data: {
                id: reportId,
                type: 'weakCheck'
              }
            });
          } else if (type === 11) {
            this.messageServe.sendMessage({
              type: 'creatingTask',
              data: {
                id: reportId,
                type: 'bcCheck'
              }
            });
          }
        });
      }
    });
  }

  // 查询有无正在执行的日志压缩任务
  private checkLogStatus() {
    this.Axios.axios.get('/portadv/runlog/zip_log/').then((resp: any) => {
      if (resp.data.task_id && this.commonService.handleStatus(resp) === 0) {
        this.messageServe.sendMessage({
          type: 'creatingTask',
          data: {
            id: resp.data.task_id,
            type: 'LogManage'
          }
        });
      }
    });
  }

  // 软件包构建初始任务查询
  private checkPackageStatus() {
    const url = '/task/progress/?task_type=1';
    this.Axios.axios.get(url).then((resp: any) => {
      if (!resp.data) { return; }
      if (resp.data.task_name) {
        this.messageServe.sendMessage({
          type: 'creatingTask',
          data: {
            id: resp.data.task_name,
            type: 'SoftwarePackage'
          }
        });
      }
    });
  }

  // 查看有无正在执行的预检任务
  public checkStatus(count: any) {
    this.Axios.axios.get('/portadv/tasks/migrationrunning/').then((data: any) => {
      if (this.commonService.handleStatus(data) === 0) {
        count = 0;
        if (data.data.id) {
          this.messageServe.sendMessage({
            type: 'creatingTask',
            data: {
              id: data.data.id,
              type: 'PortingPreCheck'
            }
          });
        }
      } else {
        count++;
        if (count <= 3) {
          this.checkStatus(count);
        }
      }
    }).catch((error: any) => {
      count++;
      if (count <= 3) {
        this.checkStatus(count);
      }
    });
  }

  // 查看有无正在执行的对齐检查任务
  public checkStatusDQJC(count: any) {
    this.Axios.axios.get('/portadv/tasks/migration/bytealignment/taskinfo/').then((data: any) => {
      if (this.commonService.handleStatus(data) === 0) {
        count = 0;
        if (data.data.task_id) {
          this.messageServe.sendMessage({
            type: 'creatingTask',
            data: {
              id: data.data.task_id,
              type: 'ByteAlignment'
            }
          });
        }
      } else {
        count++;
        if (count <= 3) {
          this.checkStatusDQJC(count);
        }
      }
    }).catch((error: any) => {
      count++;
      if (count <= 3) {
        this.checkStatusDQJC(count);
      }
    });
  }

  // 查看有无正在执行的对齐检查任务
  public checkStatusCache(count: any) {
    this.Axios.axios.get('/portadv/tasks/migration/cachelinealignment/task/').then((data: any) => {
      if (this.commonService.handleStatus(data) === 0) {
        count = 0;
        if (data.data.task_id) {
          this.messageServe.sendMessage({
            type: 'creatingTask',
            data: {
              id: data.data.task_id,
              type: 'CachelineAlignment'
            }
          });
        }
      } else {
        count++;
        if (count <= 3) {
          this.checkStatusCache(count);
        }
      }
    }).catch((error: any) => {
      count++;
      if (count <= 3) {
        this.checkStatusCache(count);
      }
    });
  }

  // 获取软件迁移任务状态
  private checkSoftwarePortStatus() {
    const url = '/task/progress/?task_type=3';
    this.Axios.axios.get(url).then((data: any) => {
      if (this.commonService.handleStatus(data) === 0) {
        if (!data.data) { return; }

        if (data.data.runningstatus === 1) {
          // 迁移中
          this.messageServe.sendMessage({
            type: 'creatingTask',
            data: {
              id: data.data.task_name,
              type: 'SoftwarePorting',
              software: data.data.solution_xml
            }
          });
        }
      }
    });
  }

  /**
   * 切换语言
   * @param data 切换语言类型
   */
  langChange(data: { id: string }): void {
    const callback = (): void => {
      if (data.id === 'zh-cn') {
        TiLocale.setLocale(TiLocale.ZH_CN);
        sessionStorage.setItem('language', 'zh-cn');
      } else {
        TiLocale.setLocale(TiLocale.EN_US);
        sessionStorage.setItem('language', 'en-us');
      }
      window.location.reload();
      sessionStorage.setItem('resultMsgList', '[]');
    };
    if (!this.isUpdateReport(callback)) {
      callback();
    }
  }

  ngOnDestroy() {
    sessionStorage.setItem('resultMsgList', '[]');
  }

  // 读取证书信息
  private getCertInfo() {
    this.certExpiredTip = '';
    this.Axios.axios.get('/cert/').then((data: any) => {
      if (this.commonService.handleStatus(data) === 0) {
        this.status = data.data.cert_flag;
        const date = data.data.cert_expired.split('T')[0];
        if (data.data.cert_flag === '1') { return; }
        if (data.data.cert_flag === '-1') {
          this.certExpiredTip = this.i18n.common_term_webcert_expired;
        }
        if (data.data.cert_flag === '0') {
          this.certExpiredTip = this.i18nService.I18nReplace(
            this.i18n.common_term_webcert_will_expire,
            {0: date}
          );
        }
        this.tiModal.open(this.certificateModal, {
          id: 'certificateModal',
          modalClass: 'modal400'
        });
      }
    });
  }

  ngOnInit() {
    this.messageServe.getMessage().subscribe(msg => {
      if (msg.type === 'bcCheckResult') {
        this.bcFileResult = msg.data;
        const bcCheckFailed = msg.data.data.bc_check_result.bc_check_failed;
        const bcCheckSucces = msg.data.data.bc_check_result.bc_check_succeeded;
        let bcCheckRes = [];
        if (bcCheckFailed.length > 0 && bcCheckSucces.length > 0) {
          bcCheckRes = bcCheckSucces.concat(bcCheckFailed);
          this.bcResultPartial = true;
        }else {
          this.bcResultPartial = false;
        }
        this.bcFileSrcData = {
          data: bcCheckRes,
          state: {
              searched: false, // 源数据未进行搜索处理
              sorted: false, // 源数据未进行排序处理
              paginated: false // 源数据未进行分页处理
          }
        };
      }
    });
    this.filterWeakCheck();
    // 系统配置管理
    this.leftMenuList = [
      { title: this.i18n.common_term_user_info[0], path: 'setting/user', admin: true }, // 用户管理
      { title: this.i18n.passwordDic, path: 'setting/weak', admin: false }, // 弱口令字典
      { title: this.i18n.sysSetting,  path: 'setting/sys', admin: true }, // 系统配置
      {
        title: sessionStorage.getItem('role') === 'Admin'
          ? this.i18n.common_term_user_info[7]
          : this.i18n.common_term_user_info[1],
        path: 'setting/log',
        admin: false
      }, // 日志
      { title: this.i18n.common_term_user_info[3], path: 'setting/dep-dictionary', admin: true }, // 依赖字典
      { title: this.i18n.common_term_user_info[4], path: 'setting/template', admin: true }, // 软件迁移模板
      { title: this.i18n.common_term_setting_label, path: 'setting/scan-parameter', admin: false }, // 扫描参数配置
      { title: this.i18n.common_term_history_label, path: 'setting/threshold', admin: true }, // 阈值设置
      { title: this.i18n.certificate.title, path: 'setting/certificate', admin: false }, // 证书
      {
        title: this.i18n.certificate_revocation_list.title,
        path: 'setting/certificate-revocation-list',
        admin: false }, // 证书吊销列表
    ];
    if (
      sessionStorage.getItem('isFirst') !== '1'
      && sessionStorage.getItem('isExpired') !== '1'
      && sessionStorage.getItem('token')
    ) {
      this.checkStatus(0);
      this.checkStatusDQJC(0);
      this.getTaskUndone();
      this.getTaskBinary();
      this.checkSoftwarePortStatus();
      this.checkPackageStatus();
      this.checkWeakStatus();

      if (sessionStorage.getItem('role') === 'Admin') {
        this.checkLogStatus();
      }

      const msgList = sessionStorage.getItem('resultMsgList');
      this.creatingMsgList = msgList ? JSON.parse(msgList) : [];
      this.creatingMsgList = this.creatingMsgList.filter((item: any) => {
        return !((item.type === 'SourceCode' || item.type === 'PackagePorting') && item.state === 'success');
      });
      sessionStorage.setItem('resultMsgList', JSON.stringify(this.creatingMsgList));

      this.creatingTaskSub = this.messageServe.getMessage().subscribe(msg => {
        if (msg.type === 'creatingTask') {
          const id = msg.data.id;
          const taskType = msg.data.type;
          const software =  msg.data.software || ''; // 软件迁移
          this.filterSameProgress(id, taskType, software);
        }
      });

      this.creatingMsgSub = this.messageServe.getMessage().subscribe(msg => {
        if (msg.type === 'creatingResultMsg') {
          this.filterSameMsg(msg.data);
        }
      });

      // 监听上传弹框，重新计算消息框及任务列表的bottom
      this.uploadingContainerSub = this.messageServe.getMessage().subscribe(msg => {
        if (msg.type === 'uploadingContainer') {
          if (msg.data === 'start' || msg.data === 'end') {
            this.msgBottomComputed(3);
            this.creatingProBottomComputed(3);
          }
        }
      });
      this.messageServe.getMessage().subscribe(msg => {
        if (msg.type === 'changeBannerBg' || msg.type === 'collapseBanner') {
          this.bannerShow = msg.data;
        }
      });
    }

    const isfirst = Number(sessionStorage.getItem('isFirst'));
    if (isfirst !== 1 && sessionStorage.getItem('isExpired') !== '1' && sessionStorage.getItem('token')) {
      this.getCertInfo();
    }
    sessionStorage.setItem('editFlag', 'false');
    this.soSituation = -1;
    this.xmlsituation = -1;
    this.currLang = sessionStorage.getItem('language');
    const oldwhich = localStorage.getItem('which');
    this.bannerShow = JSON.parse(sessionStorage.getItem('bannerShow'));

    if (/backup/.test(oldwhich)) {
      if (sessionStorage.getItem('language') === 'zh-cn') {
        this.soinfo.ing = this.backupZh.ing;
        this.soinfo.success = this.backupZh.success;
        this.soinfo.fail = this.backupZh.fail;
        this.soinfo.operation = '备份进行中，请勿关闭当前界面';
      } else {
        this.soinfo.ing = this.backupEn.ing;
        this.soinfo.success = this.backupEn.success;
        this.soinfo.fail = this.backupEn.fail;
        this.soinfo.operation = 'Backup task is in process. Do not close the current page.';
      }
    } else if (/upgrade/.test(oldwhich)) {
      if (sessionStorage.getItem('language') === 'zh-cn') {
        this.soinfo.ing = this.upgradeZh.ing;
        this.soinfo.success = this.upgradeZh.success;
        this.soinfo.fail = this.upgradeZh.fail;
        this.soinfo.operation = '升级进行中，请勿关闭当前界面';
      } else {
        this.soinfo.ing = this.upgradeEn.ing;
        this.soinfo.success = this.upgradeEn.success;
        this.soinfo.fail = this.upgradeEn.fail;
        this.soinfo.operation = 'Upgrade task in process. Do not close the current page.';
      }
    } else if (/recovery/.test(oldwhich)) {
      if (sessionStorage.getItem('language') === 'zh-cn') {
        this.soinfo.ing = this.recoveryZh.ing;
        this.soinfo.success = this.recoveryZh.success;
        this.soinfo.fail = this.recoveryZh.fail;
        this.soinfo.operation = '恢复进行中，请勿关闭当前界面';
      } else {
        this.soinfo.ing = this.recoveryEn.ing;
        this.soinfo.success = this.recoveryEn.success;
        this.soinfo.fail = this.recoveryEn.fail;
        this.soinfo.operation = 'Restoration task in process. Do not close the current page.';
      }
    }

    if (
      sessionStorage.getItem('role') === 'Admin'
      && sessionStorage.getItem('isExpired') !== '1'
      && sessionStorage.getItem('token')
    ) {
      let urlWhite = `/task/progress/?task_type=2`;
      urlWhite += this.task_name ? `&task_name=${this.task_name}` : '';

      this.Axios.axios.get(urlWhite).then((data: any) => {
        if (this.commonService.handleStatus(data) === 0) {
          if (data.data.status === 0) {
            this.soinfo.tip = this.chooseInfoLanguage(data);
            this.soSituation = 2;
            if (this.timer) {
              clearTimeout(this.timer);
              this.timer = null;
            }
          } else if (data.data.status === 2) {
            this.soinfo.tip = this.chooseInfoLanguage(data);
            this.soSituation = 3;
            if (this.timer) {
              clearTimeout(this.timer);
              this.timer = null;
            }
          } else if (data.data.status === 1) {
            this.soinfo.tip = this.chooseInfoLanguage(data);
            this.soinfo.progessValue = data.data.progress + '%';
            this.soinfo.barWidth = Math.floor((data.data.progress / this.totalProgress) * this.totalBar);
            this.soSituation = 1;
            if (this.timer) {
              clearTimeout(this.timer);
              this.timer = null;
            }
            this.timer = setTimeout(() => this.getsoStatus(), 1000);
          }
        }
      });
      let url;
      url = `/task/progress/?task_type=4`;
      url += this.managementTaskId ? `&task_id=${this.managementTaskId}` : '';

      this.Axios.axios.get(url).then((data: any) => {
        if (this.commonService.handleStatus(data) === 0) {
          if (/备份/.test(data.data.progress_chinese)) {
            if (sessionStorage.getItem('language') === 'zh-cn') {
              this.xmlinfo.ing = this.backupZh.ing;
              this.xmlinfo.success = this.backupZh.success;
              this.xmlinfo.fail = this.backupZh.fail;
              this.xmlinfo.operation = '备份进行中，请勿关闭当前界面';
            } else {
              this.xmlinfo.ing = this.backupEn.ing;
              this.xmlinfo.success = this.backupEn.success;
              this.xmlinfo.fail = this.backupEn.fail;
              this.xmlinfo.operation = 'Backup task is in process. Do not close the current page.';
            }
          }
          if (/恢复/.test(data.data.progress_chinese)) {
            if (sessionStorage.getItem('language') === 'zh-cn') {
              this.xmlinfo.ing = this.recoveryZh.ing;
              this.xmlinfo.success = this.recoveryZh.success;
              this.xmlinfo.fail = this.recoveryZh.fail;
              this.xmlinfo.operation = '恢复进行中，请勿关闭当前界面';
            } else {
              this.xmlinfo.ing = this.recoveryEn.ing;
              this.xmlinfo.success = this.recoveryEn.success;
              this.xmlinfo.fail = this.recoveryEn.fail;
              this.xmlinfo.operation = 'Restoration task in process. Do not close the current page.';
            }
          }
          if (/升级/.test(data.data.progress_chinese)) {
            if (sessionStorage.getItem('language') === 'zh-cn') {
              this.xmlinfo.ing = this.upgradeZh.ing;
              this.xmlinfo.success = this.upgradeZh.success;
              this.xmlinfo.fail = this.upgradeZh.fail;
              this.xmlinfo.operation = '升级进行中，请勿关闭当前界面';
            } else {
              this.xmlinfo.ing = this.upgradeEn.ing;
              this.xmlinfo.success = this.upgradeEn.success;
              this.xmlinfo.fail = this.upgradeEn.fail;
              this.xmlinfo.operation = 'Upgrade task in process. Do not close the current page.';
            }
          }
          if (data.data.runningstatus === 0) {
            // 打包成功
            this.xmlinfo.tip = this.choosexmlInfoLanguage(data);
            this.xmlsituation = 2;
            clearTimeout(this.xmltimer);
            this.xmltimer = null;
          } else if (data.data.runningstatus === 1) {
            // 正在打包
            this.xmlinfo.tip = this.choosexmlInfoLanguage(data);
            this.xmlinfo.progessValue = data.data.progress + '%';
            this.xmlinfo.barWidth = Math.floor((data.data.progress / this.totalProgress) * this.totalBar);
            this.xmlsituation = 1;
            if (this.xmltimer) {
              clearTimeout(this.xmltimer);
              this.xmltimer = null;
            }
            this.xmltimer = setTimeout(() => this.getxmlStatus(), 3000);
          } else if (data.data.runningstatus === -1) {
            // 打包失败
            clearTimeout(this.timer);
            this.xmltimer = null;
            this.xmlinfo.tip = this.choosexmlInfoLanguage(data);
            this.xmlsituation = 3;
          }
        }
      });
    }
    this.langOptions = [
      {
        id: 'zh-cn',
        label: this.i18n.common_term_lang_info[0],
      },
      {
        id: 'en-us',
        label: this.i18n.common_term_lang_info[1],
      },
    ];
    this.langSelected = this.currLang === 'zh-cn'
      ? this.langOptions[0]
      : this.langOptions[1];
    this.username = sessionStorage.getItem('username');
    this.role = sessionStorage.getItem('role');
    this.loginUserId = sessionStorage.getItem('loginId');
    this.label = {
      Name: this.i18n.common_term_user_label.name,
      Cpwd: this.i18n.common_term_user_label.confirmPwd,
      oldPwd: this.i18n.common_term_user_label.oldPwd,
      newPwd: this.i18n.common_term_user_label.newPwd,
    };

    // 输入密码校验
    this.changePwdForm = new FormGroup({
      userName: new FormControl(this.username),
      oldPwd: new FormControl('', [this.regOldPwd]),
      pwd: new FormControl('', [this.updatePwdConfirm]),
      cpwd: new FormControl('', [this.userPwdConfirm])
    });
  }

  /**
   * 前往对应的 路由
   * @param item 点击菜单详情
   */
  goSettingRouter(item: { path: string }) {
    sessionStorage.setItem('settingsNotFresh', 'true');
    const callback = () => this.router.navigate([item.path]);
    if (!this.isUpdateReport(callback, 'goSetting')) {
      callback();
    }
  }

  chooseInfoLanguage(data: any) {
    const info = this.currLang === 'zh-cn'
      ? data.data.option_info_chinese
      : data.data.option_info;
    return info;
  }
  choosexmlInfoLanguage(data: any) {
    const info = this.currLang === 'zh-cn'
      ? data.data.infochinese
      : data.data.info;
    return info;
  }

  chooseLangType(data: any) {
    const type = this.commonService.handleStatus(data) === 0 ? 'success' : 'warn';
    const content = this.currLang === 'zh-cn' ? data.infochinese : data.info;
    this.mytip.alertInfo({ type, content, time: 10000 });
  }

  /**
   * header点击修改密码
   */
  public updatePassword() {
    this.updatePwdModal.Open();
    this.pwdShow = true;
  }

  /**
   * 退出登录
   * @params modalTemplate 弹出框名
   */
  public logOut(modalTemplate?: any): void {
    sessionStorage.setItem('bannerShow', 'true');
    sessionStorage.setItem('navShow', 'true');
    sessionStorage.setItem('routerFile', 'false');
    sessionStorage.setItem('routerFileDQJC', 'false');
    const callback = () => this.loginService.logout();
    if (!this.isUpdateReport(callback)) {
      this.handleLogout();
    }
  }

  // 退出登录中间件处理
  private handleLogout() {
    this.tiModal.open(this.logoutModal, {
      id: 'logoutModal',
      modalClass: 'modal400',
      close: (): void => {
        this.loginService.logout();
      },
      dismiss: () => { }
    });
  }

  /**
   * 判断是否在处于修改文件状态
   * @param callback 回调函数
   * @param clickType 点击类型
   */
  isUpdateReport(callback: () => void, clickType?: string): boolean {
    let isUpdate = false;
    // 源码迁移 | 64位运行模式检查页面
    if (this.router.url.indexOf('/report?report=') >= 0
      || this.router.url.indexOf('reportDiff?created=') >= 0
    ) {
      const flag = sessionStorage.getItem('editFlag');
      // 判断文件是否处于修改状态
      if (flag === 'true') {
        isUpdate = true;
        // 64位运行模式检查
        if (this.router.url.indexOf('reportDiff?created=') >= 0) {
          this.giveupfilename = sessionStorage.getItem('filename');
        } else { // 源码迁移建议
          this.giveupfilename = sessionStorage.getItem('currentfilename');
        }
        this.tiModal.open(this.changeFileModal, {
          id: 'changeWeb',
          modalClass: 'del-report',
          close: (): void => {
            sessionStorage.setItem('editFlag', 'false');
            callback?.();
          },
          dismiss: (): void => {
            isUpdate = true;
          }
        });
      } else {
        isUpdate = false;
      }
    }
    return isUpdate;
  }

  // 打开 关于 弹框
  public showAboutMask() {
    this.aboutMask.Open();
  }
  // 关闭 关于 弹框
  public closeAbout() {
    this.aboutMask.Close();
  }

  public getxmlStatus() {
    this.Axios.axios
      .get(`/task/progress/?task_type=4&task_id=${this.managementTaskId}`)
      .then((data: any) => {
        if (this.commonService.handleStatus(data) === 0) {
          if (data.data.runningstatus === 0) {
            // 打包成功
            this.xmlinfo.tip = this.choosexmlInfoLanguage(data);
            this.xmlsituation = 2;
            clearTimeout(this.xmltimer);
            this.xmltimer = null;
          } else if (data.data.runningstatus === 1 || data.data.runningstatus === 2) {
            // 正在打包
            this.xmlinfo.tip = this.choosexmlInfoLanguage(data);
            this.xmlinfo.progessValue = data.data.progress + '%';
            this.xmlinfo.barWidth = Math.floor((data.data.progress / this.totalProgress) * this.totalBar);
            this.xmlsituation = 1;
            if (this.xmltimer) {
              clearTimeout(this.xmltimer);
              this.xmltimer = null;
            }
            this.xmltimer = setTimeout(() => this.getxmlStatus(), 3000);
          } else if (data.data.runningstatus === -1) {
            // 打包失败
            clearTimeout(this.timer);
            this.xmltimer = null;
            this.xmlinfo.tip = this.choosexmlInfoLanguage(data);
            this.xmlsituation = 3;
          }
        }
      });
  }

  public getsoStatus() {
    this.Axios.axios.get(
      `/task/progress/?task_type=2&task_id=${encodeURIComponent(this.task_name)}`
    ).then((data: any) => {
      if (this.commonService.handleStatus(data) === 0) {
        if (data.data.status === 0) {
          // 打包成功
          this.soinfo.tip = this.chooseInfoLanguage(data);
          this.soSituation = 2;
          clearTimeout(this.timer);
          this.timer = null;
        } else if (data.data.status === 1) {
          // 正在打包
          this.soinfo.tip = this.chooseInfoLanguage(data);
          this.soinfo.progessValue = data.data.progress + '%';
          this.soinfo.barWidth = Math.floor((data.data.progress / this.totalProgress) * this.totalBar);
          this.soSituation = 1;
          if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
          }
          this.timer = setTimeout(() => this.getsoStatus(), 1000);
        } else if (data.data.status === 2) {
          // 打包失败
          clearTimeout(this.timer);
          this.timer = null;
          this.soinfo.tip = this.chooseInfoLanguage(data);
          this.soSituation = 3;
        }
      }
    });
  }

  // 请求修改密码
  public setUserPwd(): boolean | void {
    this.ischangePwd = true;
    if (this.checkGroup() === false) {
      return false;
    }
    const params = {
      old_password: this.changePwdForm.get('oldPwd').value,
      new_password: this.changePwdForm.get('pwd').value,
      confirm_password: this.changePwdForm.get('cpwd').value
    };
    this.Axios.axios.post(`/users/${encodeURIComponent(this.loginUserId)}/resetpassword/`, params)
      .then((data: any) => {
      if (data && this.commonService.handleStatus(data) === 0) {
        this.changePwdForm.reset({userName: this.username, oldPwd: '', pwd: '', cpwd: ''});
        this.updatePwdModal.Close();
        this.pwdShow = false;
        this.loginService.logout();
      }
      this.chooseLangType(data);
      this.ischangePwd = false;
    });
  }

  public closeUserPwd(e: any) {
    // 如果按下的不是鼠标左键 直接返回
    if (e.button !== 0) { return; }
    this.changePwdForm.reset({userName: this.username, oldPwd: '', pwd: '', cpwd: ''});
    $(`.change-password-modal`).find('ti-error-msg').remove();
    this.updatePwdModal.Close();
    this.pwdShow = false;
    this.ischangePwd = false;
  }

  checkGroup(): boolean | void {
    if (this.ischangePwd) {
      const errorchgPwd1: ValidationErrors | null = TiValidators.check(this.changePwdForm);
      if (errorchgPwd1) {
        // 注意：要保证fb.group时各个FormControl的顺序与对应表单元素dom放置顺序一致
        const adminPwdError: any = Object.keys(errorchgPwd1)[0];
        this.elementRef.nativeElement.querySelector(`[formControlName=${adminPwdError}]`).focus();
        this.elementRef.nativeElement.querySelector(`[formControlName=${adminPwdError}]`).blur();
        return false;
      }
    }
  }

  // 旧密码校验
  regOldPwd = (control: FormControl) => {
    let newPwd = '';
    if (this.changePwdForm?.controls) {
      newPwd = this.changePwdForm.controls.pwd.value;
    }
    if (!control.value) {
      return { oldPwd: {tiErrorMessage: this.i18n.common_term_no_password } };
    } else if (newPwd) { // 如果新密码存在 则每次输入旧密码都去校验新密码规则
      this.changePwdForm.get('pwd').updateValueAndValidity();
      return null;
    }
    return null;
  }

  updatePwdConfirm = (control: FormControl) => {
    let oldPwd = '';
    if (this.changePwdForm?.controls) {
      oldPwd = this.changePwdForm.controls.oldPwd.value;
    }
    if (!control.value) {
      return { pwd: { confirm: true, error: true, tiErrorMessage: this.i18n.common_term_no_password } };
    } else if (control.value === oldPwd) { // 相同
      return { pwd: { confirm: true, error: true, tiErrorMessage: this.i18n.reg_pwd.different } };
    } else if (control.value === oldPwd.split('').reverse().join('')) { // 逆序
      return { pwd: { confirm: true, error: true, tiErrorMessage: this.i18n.reg_pwd.reverse } };
    } else if (!VerifierUtil.passwordVerification(control.value)) { // 复杂度
      return { pwd: { confirm: true, error: true, tiErrorMessage: this.i18n.reg_pwd.complex } };
    } else if (this.changePwdForm.controls.cpwd.value) {
      this.changePwdForm.get('cpwd').updateValueAndValidity();
      return {};
    }
    return {};
  }

  userPwdConfirm = (control: FormControl) => {
    if (!control.value) {
      return { cpwd: { confirm: true, error: true, tiErrorMessage: this.i18n.common_term_no_samepwd } };
    } else if (control.value !== this.changePwdForm.controls.pwd.value) {
      return { cpwd: { confirm: true, error: true, tiErrorMessage: this.i18n.common_term_no_samepwd } };
    }
    return {};
  }

  // 跳转联机帮助
  help() {
    this.commonService.goHelp();
  }

  // 前往建议反馈页
  public jumpCommunity() {
    this.openAdvice.emit(hardUrl.bannerUrlZn4);
  }

  // 打开免责声明弹窗
  showDisclaimer() {
    this.disclaimerMask.Open();
  }
  // 关闭免责声明弹框
  closeDisclaimer() {
    this.disclaimerMask.Close();
  }
}
