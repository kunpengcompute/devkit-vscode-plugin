import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import {
  CommonService, MessageService, MytipService,
  I18nService, AxiosService
} from '../../../../service';
import axios from 'axios';
import { Subscription } from 'rxjs';

const enum STATUS {
  yumFailed = '0x0d0604' // 专项软件迁移yum运行失败
}

@Component({
  selector: 'app-software-porting-progress',
  templateUrl: './software-porting-progress.component.html',
  styleUrls: ['./software-porting-progress.component.scss']
})
export class SoftwarePortingProgressComponent implements OnInit, OnDestroy {

  public i18n: any;
  constructor(
    private i18nService: I18nService,
    private Axios: AxiosService,
    private mytip: MytipService,
    private msgService: MessageService,
    private commonService: CommonService
  ) {
    this.i18n = this.i18nService.I18n();
  }

  @Input() reportId: string;
  @Input() software: string;
  @Output() createSucc = new EventEmitter();

  private currLang = 'zh-cn';

  public situation = -1;
  public msgInfo = '';
  private getStatusTimer: any = null;
  private taskId = '';
  private softwareType = '';
  public softWareText = '';
  public totalProgress = 100; // 总的数据大小
  public totalBar = 440; // 进度条总宽
  public barWidth = 0;
  public progessValue = '';

  private fixPath = 'opt/portadv/';
  private userPath = `opt/portadv/${sessionStorage.getItem('username')}/`;
  public hasDownloadFile = '';
  private outName = '';
  private softwareName = '';
  private cancels: any = [];
  private closeTaskSub: Subscription;

  ngOnInit() {
    this.currLang = sessionStorage.getItem('language');
    this.taskId = this.reportId;
    this.softwareType = this.software;
    this.getSolutionDetail();
    this.getCustomize();
    this.runningStatus();
    this.closeTaskSub = this.msgService.getMessage().subscribe(message => {
      if (message.type === 'closeTaskMsg' && message.data.result.subType === 'SoftwarePorting') {
        this.Axios.axios.delete(`/portadv/solution/${encodeURIComponent(this.taskId)}/`)
        .then((resp: any) => {
          const msg = this.currLang ? resp.infochinese : resp.info;
          if (this.getStatusTimer) {
            clearTimeout(this.getStatusTimer);
            this.getStatusTimer = null;
          }
          while (this.cancels.length > 0) {
            this.cancels.pop()();
          }
          if (this.commonService.handleStatus(resp) === 0) {
            this.createSucc.emit({id: this.reportId, type: 'SoftwarePorting', state: 'stop_success', msg});
            return;
          }
          this.createSucc.emit({ id: this.reportId, type: 'SoftwarePorting', state: 'stop_failed', msg});
        });
      }
    });
  }

  ngOnDestroy(): void {
    if (this.closeTaskSub) { this.closeTaskSub.unsubscribe(); }
  }

  public closeTask() {
    const resultMsg = {
      id: this.reportId,
      type: 'stopConfirm',
      subType: 'SoftwarePorting',
      state: 'prompt',
    };
    this.msgService.sendMessage({
      type: 'creatingResultMsg',
      data: resultMsg
    });
  }

  private getSolutionDetail() {
    this.Axios.axios(`/portadv/solution/detailinfo/`, { params: { software: this.softwareType }})
      .then((data: any) => {
        this.outName = data.data.sw_info.outname;
        const idx = this.outName.lastIndexOf('/');
        this.hasDownloadFile = idx > -1 ? this.outName.slice(idx + 1) : this.outName;
        this.softwareName = data.data.sw_info.name;
      });
  }

  private getCustomize() {
    this.Axios.axios.get(`/customize/`).then((resp: any) => {
      if (this.commonService.handleStatus(resp) === 0) {
        this.fixPath = `${resp.data.customize_path}/portadv/`;
        this.userPath = `${resp.data.customize_path}/portadv/${sessionStorage.getItem('username')}/`;
      }
    });
  }

  public runningStatus() {
    let url = `/task/progress/?task_type=3`;
    url += this.taskId ? `&task_id=${this.taskId}` : '';
    const CancelToken = axios.CancelToken;
    this.Axios.axios.get(url, {
      cancelToken: new CancelToken( c1 => (this.cancels.push(c1)))
    }).then((data: any) => {
      if (this.commonService.handleStatus(data) === 0) {
        if (Object.keys(data.data).length === 0) {
          const msgInfo = this.currLang === 'zh-cn' ? data.infochinese : data.info;
          this.mytip.alertInfo({ type: 'warn', content: msgInfo, time: 10000 });
          this.msgService.sendMessage({ type: 'SoftwarePortingProgress', data: false});
          this.createSucc.emit({id: this.taskId, type: 'SoftwarePorting', state: 'failed', msg: ''});
        }
        let which = '';
        if (this.currLang === 'zh-cn') {
          if (data.data.type === 'steps') {
            which = ' 步骤';
          } else if (data.data.type === 'precheck') {
            which = '【环境检查】前置条件';
          } else if (data.data.type === 'bash') {
            which = '【执行脚本】步骤';
          } else if (data.data.type === 'oscheck') {
            which = '目标系统检查。';
          } else {
            which = '';
          }
          if (data.data.id === -1) {
            this.msgInfo = which + `详细日志请查询：${this.fixPath}logs/porting.log`;
          } else {
            if (data.status === STATUS.yumFailed){
              this.msgInfo = data.infochinese;
            } else {
              this.msgInfo = which + (data.data.id + 1) + `执行失败，详细日志请查询：${this.fixPath}logs/porting.log`;
            }
          }
        } else {
          if (data.data.type === 'steps') {
            which = ' step ';
          } else if (data.data.type === 'precheck') {
            which = '[Check Environment] Prerequisite';
          } else if (data.data.type === 'bash') {
            which = '[Execute Script] step';
          } else if (data.data.type === 'oscheck') {
            which = 'Check the target OS.';
          }
          if (data.data.id === -1) {
            this.msgInfo = which + `For details, see ${this.fixPath}logs/porting.log.`;
          } else {
            if (data.status === STATUS.yumFailed){
              this.msgInfo = data.info;
            } else {
            this.msgInfo =
              which + (data.data.id + 1) + ` For details about the failure, see ${this.fixPath}logs/porting.log file.`;
            }
          }
        }

        const stepsArr = data.data.steps.length > 0 ? data.data.steps : [];
        const runningstatus = data.data.runningstatus;
        let status = '';
        const isSuccess = runningstatus === 0 || runningstatus === 1;
        if (isSuccess) {
          status = runningstatus === 1 ? 'porting' : 'success';
        }
        this.msgService.sendMessage({
          type: 'softwareProgressing',
          data: {
            steps: stepsArr,
            stepId: data.data.id,
            type: data.data.type,
            softwareType: this.softwareType,
            status: isSuccess ? status : 'failed'
          }
        });
        if (runningstatus === -1) {
            this.situation = 3; // 迁移失败
            this.createSucc.emit({
              id: this.reportId,
              type: 'SoftwarePorting',
              state: 'failed',
              software: this.software,
              situation: 3,
              status: data.status,
              msg: this.msgInfo
            });
        } else if (runningstatus === 1) {
          this.softWareText = data.data.solution_xml;
          this.msgInfo = which + (data.data.type === 'oscheck' ? '' : data.data.id + 1);
          const progess = data.data.progress_fake;
          this.progessValue = progess + '%';
          this.barWidth = Math.floor((progess / this.totalProgress) * this.totalBar);
          this.situation = 1; // 迁移中
          if (this.getStatusTimer) {
            clearTimeout(this.getStatusTimer);
            this.getStatusTimer = null;
          }
          this.getStatusTimer = setTimeout(() => {
            this.runningStatus();
          }, 5000);
        } else if (runningstatus === 2) {
          this.situation = -1;
          this.createSucc.emit({
            id: this.reportId,
            type: 'SoftwarePorting',
            state: 'failed',
            software: this.software,
            situation: -1,
            msg: this.msgInfo
          });
        } else if (runningstatus === 0) {
          this.situation = 2; // 迁移成功
          this.msgInfo = '';
          this.createSucc.emit({
            id: this.reportId,
            type: 'SoftwarePorting',
            state: 'success',
            software: this.software,
            situation: 2,
            data: { file: this.hasDownloadFile, outName: this.outName},
            msg: this.i18n.common_term_migration_success
          });
        }
      } else {
        this.situation = 3; // 迁移失败
        const msg = this.currLang === 'zh-cn' ? data.infochinese : data.info;
        this.createSucc.emit({
          id: this.reportId,
          type: 'SoftwarePorting',
          state: 'failed',
          software: this.software,
          situation: 3,
          status: data.status,
          msg
        });
      }
      this.msgService.sendMessage({ type: 'SoftwarePortingProgress', data: true});
    }, (error: any) => {
      this.msgService.sendMessage({ type: 'SoftwarePortingProgress', data: false});
    });
  }

}
