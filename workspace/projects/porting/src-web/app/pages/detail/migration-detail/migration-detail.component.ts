import {
  Component, OnInit, OnDestroy, Output,
  EventEmitter, AfterViewChecked, ChangeDetectorRef
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {
  CommonService, AxiosService, I18nService,
  MytipService, MessageService
} from '../../../service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-migration-detail',
  templateUrl: './migration-detail.component.html',
  styleUrls: ['./migration-detail.component.scss']
})
export class MigrationDetailComponent implements OnInit, OnDestroy, AfterViewChecked {
  @Output() showMain = new EventEmitter();
  constructor(
    private Axios: AxiosService,
    public i18nService: I18nService,
    public router: Router,
    public route: ActivatedRoute,
    public mytip: MytipService,
    private msgService: MessageService,
    private ref: ChangeDetectorRef,
    private commonService: CommonService
  ) {
    this.i18n = this.i18nService.I18n();
  }
  public i18n: any;
  public barWidth = 0;
  public isX86 = true;
  public isExecute = false;
  public totalBar = 460; // 进度条总宽
  public progess = 0; // 目前数据大小
  public totalProgress = 100; // 总的数据大小
  public progessValue: string; // 显示的进度值
  goBackTip = '';
  public detailData: any = {};
  public software: any;
  public precheckData: Array<any> = [];
  public batchData: Array<any> = [];
  public stepsData: Array<any> = [];
  public mavenUrl: Array<any> = [];
  public showMaven = false;
  public displayStatic = 0;
  public stepsDataStatic: any = [];
  public checkPrecheck: Array<any> = [
    {
      id: 0,
      com: 'gcc,7.3.0',
      desc: '检查当前环境在/usr/bin或/usr/local/bin路径下是否存在gcc，且版本不低于7.3.0',
      step: 1
    },
    {
      id: 1,
      com: 'cmake,3.5.2',
      desc: '检查当前环境在/usr/bin或/usr/local/bin路径下是否存在cmake，且版本不低于3.5.2',
      step: 2
    }
  ]; // 选中项
  public checkBatch: Array<any> = [];
  public checkSteps: Array<any> = [];
  public stepsTotal: Array<any> = [];
  public isDisabled = true;
  public currStatus = 0;
  private timer: any = null;
  public currLang = '';
  public situation = 0;
  public info = '';
  public outputValue = ''; // 成功时是否包含output展示文件
  public part1: any = [];
  public part2: any = [];
  public part3: any = [];
  public taskId: any;
  public which: string;
  public fixPath = 'opt/portadv/';
  public userPath = `opt/portadv/${sessionStorage.getItem('username')}/`;
  public checkGroupTitles: Array<any> = [];
  public allGroupData: Array<any> = [];
  public hasTaskOrMsg = true;  // 保存未完成的任务或提示未确认
  public hasTaskOrMsgTip = '';
  private softwareProgressingSub: Subscription;
  private groupIdList: any = []; // 记录软件迁移的分组
  public isCheckOs = true;

  ngOnDestroy() {
    clearTimeout(this.timer);
    this.timer = null;
    if (this.softwareProgressingSub) { this.softwareProgressingSub.unsubscribe(); }
  }

  ngOnInit() {
    if (sessionStorage.getItem('isCheck') === 'true') {
      this.isX86 = true;
      this.ref.markForCheck();
      this.ref.detectChanges();
    } else {
      this.isX86 = false;
    }
    this.route.queryParams.subscribe(data => {
      this.software = data.software;
    });
    this.getMigrationDetail();
    if (sessionStorage.getItem('isFirst') !== '1') {
      this.Axios.axios.get(`/customize/`).then((resp: any) => {
        if (this.commonService.handleStatus(resp) === 0) {
          this.fixPath = `${resp.data.customize_path}/portadv/`;
          this.userPath = `${resp.data.customize_path}/portadv/${sessionStorage.getItem('username')}/`;
        }
      });
    }
    this.goBackTip = this.i18n.common_term_go_back_tab2;
    this.currLang = sessionStorage.getItem('language');

    const msgList = sessionStorage.getItem('resultMsgList');
    const resultMsgList = msgList ? JSON.parse(msgList) : [];
    const portObj = resultMsgList.find( (msg: any) => msg.type === 'SoftwarePorting');
    if (portObj && portObj.id) {
      this.taskId = portObj.id;
      this.hasTaskOrMsg = true;
      this.hasTaskOrMsgTip = this.i18n.common_term_creating_btn_disabled_tip;
    } else {
      this.hasTaskOrMsg = false;
    }
    this.checkSoftwarePortStatus();
    this.msgService.getMessage().subscribe(msg => {
      if (msg.type === 'SoftwarePortingProgress') {
        this.hasTaskOrMsg = msg.data;
        if (msg.data === false) {
          this.isExecute = false;
        }
        this.hasTaskOrMsgTip = this.hasTaskOrMsg ? this.i18n.common_term_creating_btn_disabled_tip : '';
      }
      // 订阅关闭迁移任务信息
      if (msg.type === 'closeTaskMsg') {
        this.isX86 = false;
        this.isExecute = false;
        this.stepsData.forEach((el) => {
          // 正在进行的任务状态调为失败
          if (el.status === 'porting') {
            el.status = 'failed';
          }
        });
        this.ref.markForCheck();
        this.ref.detectChanges();
      }
    });
    this.msgService.getMessage().subscribe(msg => {
      if (msg.type === 'softwareProgressing') {
        const msgInfo = {...msg.data};

        if (msgInfo.softwareType === this.software) {
          if (this.groupIdList.length === 0) {
            msgInfo.steps.forEach((step: any) => {
              const stepObj = this.stepsData.find(item => item.stepid === step);
              if (stepObj && stepObj.hasOwnProperty('group_id')) {
                const sameGId = this.groupIdList.indexOf(stepObj.group_id) >= 0;
                if (!sameGId) { this.groupIdList.push(stepObj.group_id); }
              }
            });

            const checkedGroup: any = [];
            this.allGroupData.forEach(item => {
              if (this.groupIdList.indexOf(item.group_id) >= 0) {
                checkedGroup.push(item);
              }
            });
            this.stepsChange(checkedGroup);
            this.checkGroupTitles = checkedGroup.slice();
          }
          this.stepsData.forEach(item => {
            item.status = '';
            if (item.hasOwnProperty('stepid') && msgInfo.steps.indexOf(item.stepid) >= 0) {
              if (msgInfo.stepId > item.stepid) {
                item.status = 'success';
              } else if (msgInfo.stepId === item.stepid) {
                item.status = msgInfo.status;
              }
            }
          });
        }
      }
    });
  }

  // 每当 Angular 做完组件视图和子视图或包含该指令的视图的变更检测之后调用
  ngAfterViewChecked() {
    $('.info-detail').find('a').css('line-height', '20px');
  }

  public batchChange(checkeds: Array<any>): void {
    this.part2 = checkeds;
    this.isNoCheck();
  }
  public stepsChange(checkeds: Array<any>): void {
    let isSend = false;
    isSend = checkeds.some((el) => {
      return el.group_id === this.allGroupData[this.allGroupData.length - 1].group_id;
    });
    if (isSend) {
      sessionStorage.setItem('isSelect', 'selectLast');
    } else {
      sessionStorage.setItem('isSelect', 'notSelectLast');
    }
    this.part3 = checkeds;
    if (checkeds.length === this.allGroupData.length) {
      this.stepsTotal = this.stepsData.slice();
      this.isDisabled = this.part3.length === 0;
      return;
    }

    const chkDiff: any = [];
    this.allGroupData.forEach(item => {
      const obj = checkeds.find(chk => chk.group_id === item.group_id);
      if (obj && obj.hasOwnProperty('group_id')) { return; }
      chkDiff.push(item.group_id);
    });
    let filterArr = this.stepsData.slice();
    chkDiff.forEach((chk: any) => {
      filterArr = filterArr.filter(step => step.group_id !== chk);
    });
    this.stepsTotal = filterArr.slice();
    this.isNoCheck();
  }
  isNoCheck() {
    this.isDisabled = this.part3.length === 0;
  }
  goBack() {
    this.router.navigate(['homeNew/' + sessionStorage.getItem('chooseTab')]);
  }

  public chooseLangType(data: any) {
    if (this.commonService.handleStatus(data) === 0) {
      if (sessionStorage.getItem('language') === 'zh-cn') {
        this.mytip.alertInfo({
          type: 'success',
          content: data.infochinese,
          time: 5000
        });
      } else {
        this.mytip.alertInfo({
          type: 'success',
          content: data.info,
          time: 5000
        });
      }
    } else {
      if (sessionStorage.getItem('language') === 'zh-cn') {
        this.mytip.alertInfo({
          type: 'warn',
          content: data.infochinese,
          time: 10000
        });
      } else {
        this.mytip.alertInfo({ type: 'warn', content: data.info, time: 10000 });
      }
    }
  }

  public getMigrationDetail() {
    this.precheckData = [];
    this.batchData = [];
    this.stepsData = [];
    this.Axios.axios(`/portadv/solution/detailinfo/`, {
      params: { software: this.software }
    }).then((data: any) => {
      this.outputValue = data.data.sw_info.outname;

      if (this.commonService.handleStatus(data) === 0) {
        if (data.data) {
          if (data.data.display) {
            this.displayStatic =  data.data.display;
          }
          if (data.data.sw_info && data.data.sw_info.mavensource) {
            this.mavenUrl = data.data.sw_info.mavensource.split(';');
            this.showMaven = true;
          }
          this.detailData = { ...data.data.sw_info };
          if (this.detailData.alturl_cn !== undefined) {
            this.detailData.des_cn = this.detailData.des_cn + '<br>' + this.detailData.alturl_cn;
          }
          if (this.detailData.alturl_en !== undefined) {
            this.detailData.des_en = this.detailData.des_en + '<br>' + this.detailData.alturl_en;
          }
          this.checkPrecheck = data.data.precheck;
          this.checkBatch = data.data.batch;
          this.checkSteps = data.data.steps;
          // 新增多选框数据组
          const stepArr: any = [];
          this.checkSteps.forEach(item => {
            if (item.group_id >= 0 && !item.hasOwnProperty('stepid')) {
              this.checkGroupTitles.push(item);
            }
            if (item.hasOwnProperty('stepid')) {
              stepArr.push(item.stepid);
            }
          });
          this.isDisabled = this.checkGroupTitles.length === 0;
          const precheckArr: any = [];
          const batchArr: any = [];
          this.checkPrecheck.forEach(item => { precheckArr.push(item.id); });
          this.checkBatch.forEach(item => { batchArr.push(item.id); });
          const soParams = {
            precheck: precheckArr,
            xmlname: this.software,
            bash: batchArr,
            steps: stepArr
          };
          this.checkSo(soParams);
          this.stepsTotal = JSON.parse(JSON.stringify(this.checkSteps));
          if (this.checkPrecheck.length) {
            this.checkPrecheck.forEach((el, i) => {
              let name = '';
              let version = '';
              if (el.com) {
                const arr = el.com.split(',');
                name = arr[0];
                version = arr[1];
              }
              el.desc = this.i18nService.I18nReplace(this.i18n.common_term_com_tip, { 0: name, 1: version });
              el.step = i + 1;
              this.precheckData.push(el);
            });
          }
          if (this.checkBatch.length) {
            this.checkBatch.forEach((el, j) => {
              el.step = j + 1;
              this.batchData.push(el);
            });
          }
          if (this.checkSteps.length) {
            this.checkSteps.forEach((el, k) => {
              if (el.file_name) {
                el.file_name2 = this.i18nService.I18nReplace(this.i18n.common_term_edit_file, { 1: el.file_name });
                if (el.op_list.length > 0) {
                  el.op_list.forEach((opt: any) => {
                    if (opt.opname === 'replace_once') {
                      opt.optname = this.i18nService.I18nReplace(this.i18n.comon_term_edit_line, { 1: opt.line });
                    } else if (opt.opname === 'add_new_line') {
                      opt.optname = this.i18nService.I18nReplace(this.i18n.common_term_add_line, { 1: opt.line });
                    } else if (opt.opname === 'delete_one_line') {
                      opt.optname = this.i18nService.I18nReplace(this.i18n.common_term_delete_line, { 1: opt.line });
                    }
                  });
                }
              }
              if (el.stepid >= 0) {
                el.step = el.stepid + 1;
                el.status = '';
              }
              this.stepsData.push(el);
              if (el.stepid === undefined) {
                this.allGroupData.push(el);
              }
            });
            let temp = [];
            const stepsDataStaticTemp = [];
            for (let i = 0; i < this.stepsData.length; i++) {
              if (this.stepsData[i].des_cn !== '') {
                temp.push(this.stepsData[i]);
                for (const tem of temp) {
                  if (tem.group_id !== this.stepsData[i].group_id) {
                    temp.pop();
                    stepsDataStaticTemp.push(temp);
                    temp = [];
                    temp.push(this.stepsData[i]);
                  }
                }
              }
              if (i === this.stepsData.length - 1) {
                stepsDataStaticTemp.push(temp);
              }
            }
            this.stepsDataStatic = stepsDataStaticTemp;
          }
        }
      }
    });
  }

  // 检查迁移环境是否支持
  private checkSo(params: any) {
    this.Axios.axios.post('/portadv/solution/check_os/', params)
      .then((resp: any) => {
        if (this.commonService.handleStatus(resp) !== 0) {
          this.isCheckOs = true;
          this.hasTaskOrMsgTip = this.currLang === 'zh-cn' ? resp.infochinese : resp.info;
        } else {
          this.isCheckOs = false;
        }
      });
  }

  public submit() {
    this.isX86 = false;
    document.getElementsByClassName('migration-detail')[0].scrollTop = 0;
    this.situation = -1;
    const precheck: any = [];
    const bash: any = [];
    const steps: any = [];
    this.groupIdList = [];
    if (this.checkPrecheck) {
      this.checkPrecheck.forEach(item => {
        precheck.push(item.id);
      });
    }
    if (this.checkBatch) {
      this.checkBatch.forEach(item => {
        bash.push(item.id);
      });
    }
    this.stepsTotal.forEach(elem => {
      if (elem.hasOwnProperty('stepid')) { steps.push(elem.stepid); }
    });
    const params = {
      xmlname: this.software,
      precheck,
      bash,
      steps
    };
    this.Axios.axios.post('/portadv/solution/', params).then((data: any) => {
      if (this.commonService.handleStatus(data) === 0) {
        this.isExecute = true;
        if (Object.keys(data.data).length === 0) {
          const msgInfo = this.currLang === 'zh-cn' ? data.infochinese : data.info;
          this.mytip.alertInfo({ type: 'warn', content: msgInfo, time: 10000 });
          this.hasTaskOrMsg = false;
          return;
        } else {
          this.hasTaskOrMsg = true;
        }
        this.taskId = data.data.id;
        if (this.taskId) {
          this.msgService.sendMessage({
            type: 'creatingTask',
            data: {
              id: this.taskId,
              type: 'SoftwarePorting',
              software: this.software
            }
          });
        }
      } else {
        const content = this.currLang === 'zh-cn' ? data.infochinese : data.info;
        this.mytip.alertInfo({ type: 'error', content, time: 10000 });
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
          this.msgService.sendMessage({
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
  public runningStatus() {
    let url = '';
    const taskId =  sessionStorage.getItem('softwarePortingId');
    this.taskId = this.taskId || taskId || '';
    url = `/task/progress/?task_type=3`;
    url += this.taskId ? `&task_id=${encodeURIComponent(this.taskId)}` : '';

    this.Axios.axios.get(url).then((data: any) => {
      if (this.commonService.handleStatus(data) === 0) {
        if (!data.data) { return; }
        this.software = data.data.solution_xml || this.software;
        if (sessionStorage.getItem('language') === 'zh-cn') {
          if (data.data.type === 'steps') {
            this.which = ' 步骤';
          } else if (data.data.type === 'precheck') {
            this.which = '【环境检查】前置条件';
          } else if (data.data.type === 'bash') {
            this.which = '【执行脚本】步骤';
          } else if (data.data.type === 'oscheck') {
            this.which = '目标系统检查。步骤';
          } else {
            this.which = '';
          }
          if (data.data.id === -1) {
            this.info = this.which + `详细日志请查询：${this.fixPath}logs/porting.log`;
          } else {
            this.info = this.which + (data.data.id + 1) + `执行失败，详细日志请查询：${this.fixPath}logs/porting.log`;
          }
        } else {
          if (data.data.type === 'steps') {
            this.which = ' step ';
          } else if (data.data.type === 'precheck') {
            this.which = '[Check Environment] Prerequisite';
          } else if (data.data.type === 'bash') {
            this.which = '[Execute Script] step';
          } else if (data.data.type === 'oscheck') {
            this.which = 'Check the target OS. Step';
          }
          if (data.data.id === -1) {
            this.info = this.which + `For details, see ${this.fixPath}logs/porting.log.`;
          } else {
            this.info =
              this.which
              + (data.data.id + 1)
              + ` For details about the failure, see ${this.fixPath}logs/porting.log file.`;
          }
        }

        if (data.data.runningstatus === -1) {
            this.situation = 3; // 迁移失败
            this.hasTaskOrMsg = true;
        } else if (data.data.runningstatus === 1) {
          this.hasTaskOrMsg = true;
          // 迁移中
          this.msgService.sendMessage({
            type: 'creatingTask',
            data: {
              id: this.taskId || data.data.task_name,
              type: 'SoftwarePorting',
              software: this.software
            }
          });
        } else if (data.data.runningstatus === 2) {
          this.hasTaskOrMsg = true;
          this.situation = -1;
        } else if (data.data.runningstatus === 0) {
          this.hasTaskOrMsg = true;
          this.situation = 2; // 迁移成功
          this.info = '';
        } else {
          this.hasTaskOrMsg = false;
        }
      }
    });
  }

  private downloadFileFormat() {
    let file = '';
    const idx = this.outputValue.lastIndexOf('/');
    file = idx > -1 ? this.outputValue.slice(idx + 1) : this.outputValue;
    return file;
  }

  public toTop() {
    $('#migration-top').animate({scrollTop: 0}, 'slow');
  }
}
