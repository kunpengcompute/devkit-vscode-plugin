import { Component, OnInit, Input, OnDestroy, Pipe, ChangeDetectorRef, ViewChild } from '@angular/core';
import { I18nService, LANGUAGE_TYPE } from '../service/i18n.service';
import { MytipService } from '../service/mytip.service';
import { UtilsService } from '../service/utils.service';
import { Router, ActivatedRoute } from '@angular/router';
import { VscodeService, COLOR_THEME } from '../service/vscode.service';
import { MessageService } from '../service/message.service';

/**
 * 消息响应状态
 */
const enum STATUS {
    SUCCESS = 0,
    FAIL = 1,
    INSUFFICIENT_SPACE = '0x010611'
}

/**
 * 迁移状态
 */
export const enum MIGRATION_SERVER_STATUS {
    PROGRESS_SUCCESS = 0,
    PROGRESS_RUNNING = 1
}

const END_STEP_STATUS = -1;

@Component({
    selector: 'app-migration-detail',
    templateUrl: './migration-detail.component.html',
    styleUrls: ['./migration-detail.component.scss']
})
export class MigrationDetailComponent implements OnInit, OnDestroy {
    @ViewChild('migrationDetailModal',
      { static: false }) migrationDetailModal: { Close: () => void; Open: () => void; };

    public i18n: any;

    public detailData: any = {};
    public software: any;

    public currTheme = COLOR_THEME.Dark;

    // 展示项
    public precheckData: Array<any> = [];
    public batchData: Array<any> = [];
    public stepsData: Array<any> = [];
    public mavenUrl: Array<any> = [];
    public showMaven = false;
    public migrationDes = '';
    public downloadUrlDes = '';
    public downloadUrl: any;
    public downloadUrlVisited = false;
    public guideUrl: any;
    public guideUrlVisited = false;

    // 选中项
    public checkPrecheck: Array<any> = [];
    public checkBatch: Array<any> = [];
    public checkSteps: Array<any> = [];

    // 只提供迁移指导书的软件展示
    public isDisplay = false;

    // 操作系统不支持提示
    public migrationTip = '';
    // 正在执行任务
    public RunningTip = '';

    private submitFreshTimer: any;

    public isDisabled = false;
    public currLang = '';
    public outputName = ''; // 迁移输出文件
    public part1: Array<any> = [];
    public part2: Array<any> = [];
    public part3: Array<any> = [];
    public taskId: string;
    public fixPath = 'opt/portadv/';
    public custPath = '';
    public backParams: any;
    public endStepId: any;
    public intelliJFlag: boolean;
    public enableIntelliJView: boolean;
    public isOSDisabled = false;
    public isRunning = false; // 正在执行迁移任务
    public ColorTheme = {
        Dark: COLOR_THEME.Dark,
        Light: COLOR_THEME.Light
    };
    public taskStatus = {
        SUCCESS: MIGRATION_SERVER_STATUS.PROGRESS_SUCCESS,
        RUNNING: MIGRATION_SERVER_STATUS.PROGRESS_RUNNING,
        FAILED: END_STEP_STATUS
    };
    public reQueryState = false;
    constructor(
        public i18nService: I18nService,
        public router: Router,
        public route: ActivatedRoute,
        public mytip: MytipService,
        public vscodeService: VscodeService,
        public utilsService: UtilsService,
        private msgService: MessageService,
        private changeDetectorRef: ChangeDetectorRef
    ) {
        this.i18n = this.i18nService.I18n();
    }

    /**
     * 组件销毁
     */
    ngOnDestroy(): void {
        clearInterval(this.submitFreshTimer);
        this.submitFreshTimer = null;
    }

    /**
     * 组件初始化
     */
    ngOnInit() {
        this.route.queryParams.subscribe(data => {
            this.software = data.software;
            this.backParams = data.backParams;
            this.isRunning = data.isRunning === 'true';
            if (this.isRunning) {
              this.RunningTip = this.i18n.common_term_creating_btn_disabled_tip;
            } else {
              this.RunningTip = '';
            }
            this.intelliJFlag = data.intelliJFlag === 'true';
        });

        // 接收结束专项软件迁移任务的消息
        this.msgService.getMessage().subscribe(msg => {
            if (msg.value && msg.type === 'isSoftwarePortingChange') {
                this.setEndStepStatus();
                this.isRunning = false;
                this.RunningTip = '';
            }
            if (msg.value && msg.type === 'migrationFinished') {
                this.isRunning = false;
                this.RunningTip = '';
            }
            if (msg.value && msg.type === 'freshProgress') {
                if (msg.taskName === this.software) {
                    this.endStepId = msg.value.data.id;
                    this.freshView(msg.value);
                }
            }
        });

        this.currLang = this.getWebViewSession('language');

        if (document.body.className.indexOf('vscode-light') > -1) {
            this.currTheme = COLOR_THEME.Light;
        }

        this.vscodeService.regVscodeMsgHandler('colorTheme', (msg: any) => {
            this.currTheme = Number(msg.colorTheme);
            this.changeDetectorRef.markForCheck();
            this.changeDetectorRef.detectChanges();
        });

        this.getCustPath();
        if (this.intelliJFlag) {
            this.getRunStatus();
        }

        this.getMigrationDetail();

        this.setSubmitFreshInterval();
    }

    private setSubmitFreshInterval() {
        const that = this;
        this.submitFreshTimer = setInterval(() => {
            if (that.checkSteps.length === 0) {
                that.isDisabled = true;
            }
        }, 10);
    }

    private getCustPath() {
        if (this.getWebViewSession('isFirst') !== '1') {
            const options = {
                url: '/customize/'
            };
            this.vscodeService.get(options, (resp: any) => {
                if (resp.status === STATUS.SUCCESS) {
                    this.custPath = resp.data.customize_path;
                }
            });
        }
    }

    private getWebViewSession(paramName: string) {
        return ((self as any).webviewSession || {}).getItem(paramName);
    }

    /**
     * 软件迁移前检查项选择响应
     * @param checkeds 勾选的软件迁移前检查项
     */
    public precheckChange(checkeds: Array<any>): void {
        this.part1 = checkeds;
        this.isNoCheck();
    }

    /**
     * 软件迁移批量处理项选择响应
     * @param checkeds 软件迁移批量处理项
     */
    public batchChange(checkeds: Array<any>): void {
        this.part2 = checkeds;
        this.isNoCheck();
    }

    /**
     * 软件迁移步骤选择响应
     * @param checkeds 软件迁移步骤
     */
    public stepsChange(checkeds: Array<any>): void {
        this.part3 = checkeds;
        this.isNoCheck();
    }

    private isNoCheck() {
        if (!this.part1.length && !this.part2.length && !this.part3.length) {
            this.isDisabled = true;
        } else {
            this.isDisabled = false;
        }
    }

    /**
     * 取消按钮响应
     */
    goBack() {
        setTimeout(() => {
            const params = {
                queryParams: {
                    backParams: this.backParams,
                    intelliJFlag: this.intelliJFlag,
                    isRunning: this.isRunning,
                    fromPage: 'detail'
                }
            };
            this.router.navigate(['migrationCenter'], params);
        }, 0);
        this.RunningTip = '';
    }

    private checkOS() {
        const options = {
            url: '/portadv/solution/check_os/',
            params: {
                xmlname: this.software,
                precheck: this.getPrecheck(),
                bash: this.getBash(),
                steps: this.getSteps()
            }
        };
        this.vscodeService.post(options, (resp: any) => {
            if (resp.status !== STATUS.SUCCESS) {
                this.migrationTip = resp.info;
                const lang = I18nService.getLang();
                if (lang === LANGUAGE_TYPE.ZH) {
                    this.migrationTip = resp.infochinese;
                }
                this.isDisabled = true;
                this.isOSDisabled = true;
            } else {
                this.isOSDisabled = false;
            }
        });
    }

    /**
     * 获取软件迁移详情
     */
    public getMigrationDetail() {

        const options = {
            url: `/portadv/solution/detailinfo/?software=${encodeURIComponent(this.software)}`
        };
        this.vscodeService.get(options, (data: any) => {
            if (data.status === STATUS.SUCCESS && data.data) {
                this.outputName = data.data.sw_info.outname;

                if (data.data.sw_info.mavensource) {
                    data.data.sw_info.mavensource.split(';').forEach( (urlItem: any) => {
                        this.mavenUrl.push({
                            url: urlItem,
                            visited: false
                        });
                    });
                    this.showMaven = true;
                }

                this.detailData = data.data;

                if (this.detailData.display === 1) {
                    this.isDisplay = true;
                }

                // 避免移植描述的链接样式被angular清除
                this.processInfoDes();

                this.checkPrecheck = JSON.parse(JSON.stringify(this.detailData.precheck));
                this.precheckData = this.getPreCheckData();

                this.checkBatch = JSON.parse(JSON.stringify(this.detailData.batch));
                this.batchData = this.getBatchData();

                this.checkSteps = JSON.parse(JSON.stringify(this.detailData.steps));
                this.stepsData = this.getStepsData();

                this.checkOS();
            }
        });
    }

    private processInfoDes() {
        let des = this.detailData.sw_info.des_en;
        let altUrl = '';
        if (this.detailData.sw_info.alturl_en !== undefined) {
          altUrl = this.detailData.sw_info.alturl_en;
        }
        const lang = I18nService.getLang();
        if (lang === LANGUAGE_TYPE.ZH) {
            des = this.detailData.sw_info.des_cn;
            if (this.detailData.sw_info.alturl_cn !== undefined) {
              altUrl = this.detailData.sw_info.alturl_cn;
            }
        }
        const regx = /^([^<>]*)<a href="([^"]+)".*/;
        let matchArr = regx.exec(des);
        if (matchArr && matchArr.length >= 3) {
            this.migrationDes = matchArr[1];
            this.guideUrl = matchArr[2];
        } else {
            this.migrationDes = des;
        }
        if (altUrl) {
          matchArr = regx.exec(altUrl);
          if (matchArr && matchArr.length >= 3) {
            this.downloadUrlDes = matchArr[1];
            this.downloadUrl = matchArr[2];
          } else {
            this.downloadUrlDes = des;
          }
        }

    }

    private getStepsData() {
        const stepsData: Array<any> = [];
        if (this.checkSteps.length) {
            this.checkSteps.forEach((el) => {
                if (el.file_name) {
                    el.file_name2 = this.i18nService
                      .I18nReplace(this.i18n.plugins_porting_migration_edit_file, { 1: el.file_name });
                    if (el.op_list.length > 0) {
                        el.op_list.forEach((opt: any) => {
                            if (opt.opname === 'replace_once') {
                                opt.optname = this.i18nService
                                  .I18nReplace(this.i18n.plugins_porting_migration_edit_line, { 1: opt.line });
                            } else if (opt.opname === 'add_new_line') {
                                opt.optname = this.i18nService
                                  .I18nReplace(this.i18n.plugins_porting_migration_add_line, { 1: opt.line });
                            } else if (opt.opname === 'delete_one_line') {
                                opt.optname = this.i18nService
                                  .I18nReplace(this.i18n.plugins_porting_migration_delete_line,
                                    { 1: opt.line });
                            }
                        });
                    }
                }
                if (el.stepid >= 0) {
                    el.step = el.stepid + 1;
                    el.disabled = true;
                }
                stepsData.push(el);
            });
        }
        return stepsData;
    }

    private getBatchData() {
        const batchData: Array<any> = [];
        if (this.checkBatch.length) {
            this.checkBatch.forEach((el, j) => {
                el.step = j + 1;
                batchData.push(el);
            });
        }
        return batchData;
    }

    private getPreCheckData() {
        const precheckData: Array<any> = [];
        if (this.checkPrecheck.length) {
            this.checkPrecheck.forEach((el, i) => {
                let name = '';
                let version = '';
                if (el.com) {
                    const arr = el.com.split(',');
                    name = arr[0];
                    version = arr[1];
                }
                el.desc = this.i18nService
                  .I18nReplace(this.i18n.plugins_porting_migration_com_tip, { 0: name, 1: version });
                el.step = i + 1;
                precheckData.push(el);
            });
        }
        return precheckData;
    }

    /**
     * 开始迁移按钮响应
     */
    public submit() {
        if (document.getElementsByClassName('migration-detail')[0]) {
            document.getElementsByClassName('migration-detail')[0].scrollTop = 0;
        }
        const options = {
            url: '/portadv/solution/',
            params: {
                xmlname: this.software,
                precheck: this.getPrecheck(),
                bash: this.getBash(),
                steps: this.getSteps()
            }
        };
        this.vscodeService.post(options, (data: any) => {
            if (data.status === STATUS.SUCCESS) {
                this.taskId = data.data.id;
                this.runningStatus();
                if (this.intelliJFlag !== true) {
                    this.isRunning = true;
                    this.RunningTip = this.i18n.common_term_creating_btn_disabled_tip;
                }
            } else if (data.realStatus === STATUS.INSUFFICIENT_SPACE) {
                this.utilsService.sendDiskAlertMessage();
                this.isRunning = false;
                this.RunningTip = '';
            } else {
                this.showAlertInfo(data, 'warn');
                this.isRunning = false;
                this.RunningTip = '';
            }
        });
    }

    showAlertInfo(data: any, type: any) {
        let info = '';
        if (this.currLang === 'zh-cn') {
            info = data.infochinese;
        } else {
            info = data.info;
        }
        const message = {
            cmd: 'showInfoBox',
            data: {
                info,
                type
            }
        };
        this.vscodeService.postMessage(message, null);
    }

    private getSteps() {
        // 先选出组，再由组选出步骤
        const steps: Array<any> = [];
        if (this.checkSteps) {
            const checkGroups: Array<any> = [];
            this.checkSteps.forEach(item => {
                if (item.group_id >= 0 && !item.stepid && item.stepid !== 0) {
                    checkGroups.push(item.group_id);
                }
            });
            checkGroups.forEach(item => {
                this.detailData.steps.forEach((elem: any) => {
                    if (item === elem.group_id && elem.stepid >= 0) {
                        steps.push(elem.stepid);
                    }
                });
            });
        }
        return steps;
    }

    private getBash() {
        const bash: any[] = [];
        if (this.checkBatch) {
            this.checkBatch.forEach(item => {
                bash.push(item.id);
            });
        }
        return bash;
    }

    private getPrecheck() {
        const precheck: any[] = [];
        if (this.checkPrecheck) {
            this.checkPrecheck.forEach(item => {
                precheck.push(item.id);
            });
        }
        return precheck;
    }

    /**
     * 获取任务状态
     */
    private getRunStatus() {
        const options = {
            url: `/task/progress/?task_type=3`,
            params: {
                task_type: 3,
                timestamp: new Date().getTime()
            }
        };
        this.vscodeService.get(options, (data: any) => {
            if (data.status === STATUS.SUCCESS) {
                if (data.data.task_name) {
                    this.taskId = data.data.task_name;
                    if (this.software === this.getWebViewSession('softWare')) {
                        this.runningStatus();
                    }
                }
            }
        });
    }

    /**
     * 获取迁移状态
     */
    public runningStatus() {
        // 清除上次迁移状态
        this.clearStepsStatus();

        this.fixPath = `${this.custPath}/portadv/`;
        this.taskId = this.taskId || '';
        const message = {
            cmd: 'showProgress',
            data: {
                url: '/task/progress/?task_type=3&task_id=' + encodeURIComponent(this.taskId),
                method: 'GET',
                outputName: this.outputName,
                fixPath: this.fixPath,
                taskID: encodeURIComponent(this.taskId),
                steps: this.stepsData,
                reQueryState: this.isRunning ? (this.isRunning === true).toString() : 'false',
            }
        };
        this.vscodeService.postMessage(message, (resp: any) => {
            if (this.intelliJFlag && resp.data) {
                this.freshView(resp);
                if (resp.data.runningstatus === MIGRATION_SERVER_STATUS.PROGRESS_RUNNING) {
                    this.isRunning = true;
                    this.RunningTip = this.i18n.common_term_creating_btn_disabled_tip;
                } else {
                    this.isRunning = false;
                    this.RunningTip = '';
                }
                ((self as any).webviewSession || {}).setItem('softWare', resp.data.solution_xml);
            }
            if (resp.intelliJNotify) {
                this.isRunning = false;
                this.RunningTip = '';
                this.setStepStatus(resp.data.id, END_STEP_STATUS);
            } else {
                if (resp.enableView === true || resp.enableView === false) {
                    this.enableIntelliJView = resp.enableView;
                    return;
                }
            }
            if (this.intelliJFlag) {
                this.changeDetectorRef.markForCheck();
                this.changeDetectorRef.detectChanges();
            }
        });
    }

    private freshView(resp: any) {
        if (resp.data.type !== 'steps') {
            return;
        }
        const steps = resp.data.steps.sort((a: any, b: any) => {
            return a - b;
        });
        steps.forEach((step: any) => {
            if (step < resp.data.id) {
                this.setStepStatus(step, MIGRATION_SERVER_STATUS.PROGRESS_SUCCESS);
            } else if (step === resp.data.id) {
                this.setStepStatus(step, resp.data.runningstatus);
            }
        });
    }

    private clearStepsStatus() {
        this.stepsData.forEach((step) => {
            step.status = undefined;
        });
    }

    private setStepStatus(stepId: any, status: any) {
        this.stepsData.forEach((step) => {
            if (step.stepid === stepId) {
                step.status = status;
                return;
            }
        });
    }

    /**
     * 任务结束时，结束步骤状态变更
     */
    private setEndStepStatus() {
        this.stepsData.forEach((step) => {
            if (step.stepid === this.endStepId) {
                step.status = END_STEP_STATUS;
                return;
            }
        });
    }

    private enableView(flag: boolean) {
        if (flag) {
            this.migrationDetailModal.Close();
        } else {
            this.migrationDetailModal.Open();
        }
    }

}
