import { MytipService } from '../service/mytip.service';
import { I18nService } from '../service/i18n.service';
import { VscodeService } from '../service/vscode.service';
import { TiTableSrcData, TiTableRowData, TiTableColumns, TiMessageService } from '@cloud/tiny3';
import { Component, OnInit } from '@angular/core';
import { RunLogManageComponent } from './runlog-manage.component';
import { MessageService } from '../service/message.service';
import { OperLogManageComponent } from './operlog-manage.component';

const enum STATUS {
    SUCCESS = 0,
    FAIL = 1,
    INSUFFICIENT_SPACE = 2
}

const enum PROCESS_STATE {
    PORT_RUNLOG = 5,
    PORT_CANCELRUNLOG = 12,
    NOT_SHOW = -1,
}
@Component({
    selector: 'app-logmanager',
    templateUrl: './logManager.component.html',
    styleUrls: ['./logManager.component.scss']
})
export class LogManagerComponent implements OnInit {
    public isAdmin: boolean;
    public operLogList: TiTableSrcData;
    public runLogList: TiTableSrcData;
    // 静态实例常量
    constructor(
        public timessage: TiMessageService,
        public mytip: MytipService,
        public i18nService: I18nService,
        public vscodeService: VscodeService,
        private msgService: MessageService
    ) {
        this.i18n = this.i18nService.I18n();
        this.runLogManageComponent = new RunLogManageComponent(i18nService, vscodeService, msgService);
        this.operLogManageComponent = new OperLogManageComponent(i18nService, vscodeService, msgService);
    }
    public runLogManageComponent: RunLogManageComponent;
    public operLogManageComponent: OperLogManageComponent;
    public logDisplayed: Array<TiTableRowData> = [];
    public runLogDisplay: Array<TiTableRowData> = [];
    public columnLog: Array<TiTableColumns> = [];
    public i18n: any;
    public checkedList: Array<TiTableRowData> = [];
    public columsRunLog: Array<TiTableColumns> = [];
    // 分页
    public currentPage = 1;
    public totalNumber: number;
    public pageSize: { options: Array<number>, size: number } = {
        options: [5, 10, 20, 50],
        size: 10
    };

    public runLogShowLoading = false;
    public operatLogShowLoading = false;
    public isDownLoad = false;  // 是否正在下载运行日志

    ngOnInit() {
        if (((self as any).webviewSession || {}).getItem('role') === 'Admin') { this.isAdmin = true; }
        // 接收运行日志任务创建的消息
        this.msgService.getMessage().subscribe(msg => {
            if (msg.value && msg.type === 'isRunLogTaskCreate') {
                this.runLogManageComponent.taskId = msg.taskId;
                this.runLogManageComponent.osSavePath = msg.osSavePath;
                this.runLogManageComponent.situation = PROCESS_STATE.PORT_RUNLOG;
                this.runLogManageComponent.isRunLog = true;
                this.runLogManageComponent.getRunLogStatus();
            } else if (msg.value && msg.type === 'closeRunLogTaskMsg') {
                this.runLogManageComponent.endRunLogTask(this);
            }
        });

        // 刷新操作日志
        this.msgService.getMessage().subscribe(msg => {
          if (msg.type === 'refreshOperationLog') {
            this.getOperalogList();
          }
        });

        // 操作日志，列名
        this.columnLog = [{
            title: this.i18n.common_term_log_userName
        },
        {
            title: this.i18n.common_term_log_event,
            width: '20%'
        },
        {
            title: this.i18n.common_term_log_result
        },
        {
            title: this.i18n.common_term_log_time,
            width: '20%'
        },
        {
            title: this.i18n.common_term_log_Detail,
            width: '30%'
        }];

        this.columsRunLog = [{
            title: this.i18n.common_term_log_filename,
            width: '70%',
        },
        {
            title: this.i18n.plugins_porting_migration_table_label4,
            width: '30%',
        }];

        if (((self as any).webviewSession || {}).getItem('role') === 'Admin') {
            this.runLogShowLoading = true;
            this.operatLogShowLoading = true;
            this.getRunlogList();
            // 二次进入日志下载查询是否有正在压缩的任务
            setTimeout(() => {
                this.runLogManageComponent.getRunLogTask();
            }, 700);
        }
        this.getOperalogList();
    }

    /**
     *  查询操作日志列表
     */
    public getOperalogList() {
        const isVersionMismatch = this.checkToolVersion();
        const option = {
            url: isVersionMismatch ? '/portadv/log/' : '/portadv/log/?download=false'
        };
        this.vscodeService.get(option, (data: any) => {
            if (data.status === STATUS.SUCCESS) {
                this.operLogList = {
                    data: data.data.loglist,
                    state: {
                        searched: false,
                        sorted: false,
                        paginated: false
                    }
                };
                this.totalNumber = this.operLogList.data.length;
            } else {
                this.comMsgNotify(data);
            }
        });
        return this.operLogList;
    }

    /**
     * 下载操作日志
     */
    dowloadOperLog() {
        const isVersionMismatch = this.checkToolVersion();
        const option = {
            url: isVersionMismatch ? '/portadv/log/' : '/portadv/log/?download=true'
        };
        this.vscodeService.get(option, (data: any) => {
            if (data.status === STATUS.SUCCESS) {
                this.operLogList = {
                    data: data.data.loglist,
                    state: {
                        searched: false,
                        sorted: false,
                        paginated: false
                    }
                };
                this.operLogManageComponent.downloadInfo(this.operLogList);
            } else {
                this.comMsgNotify(data);
            }
        });
    }

    /**
     * 查询运行日志列表
     */
    public getRunlogList() {
        this.runLogShowLoading = true;
        const option = {
            url: '/portadv/runlog/'
        };
        this.vscodeService.get(option, (data: any) => {
            if (data.status === STATUS.SUCCESS) {
                this.runLogList = {
                    data: data.data.loglist,
                    state: {
                        searched: false,
                        sorted: false,
                        paginated: false
                    }
                };
            } else {
                this.comMsgNotify(data);
            }

            this.runLogShowLoading = false;
        });
        return this.runLogList;
    }

    /**
     * 打开下载运行日志页面
     */
    public openRunLog() {
        this.isDownLoad = true;
        this.runLogManageComponent.createRunLogTask(() => {
            this.isDownLoad = false;
        });
    }

    /**
     *  与vscode的交互
     */
    comMsgNotify(data: any) {
        if (data.status === STATUS.SUCCESS) {
            this.runLogManageComponent.showMessageByLang(data, 'info');
        } else {
            this.runLogManageComponent.showMessageByLang(data, 'error');
        }
    }

    // 前后端版本校验，只保留2个版本，2.3.0(包括)起，目前cacheline功能在老服务器上禁用；log接口更新，以保证对老服务器的兼容
    checkToolVersion() {
        let isVersionMismatch: boolean;
        this.vscodeService.get({ url: '/tools/version/' }, (resp: any) => {
            if (resp){
                const params = {
                    cmd: 'readVersionConfig',
                    data: '' // 无需传，防报错
                };
                this.vscodeService.postMessage(params, (data: any) => {
                    // 2.3.0版本与2.3.T21等同
                    if (data[0] === 'Porting Advisor 2.3.T21' ){
                        data[1] = 'Porting Advisor 2.3.0';
                    } else if (data[0] === 'Porting Advisor 2.3.0') {
                        data[1] = 'Porting Advisor 2.3.T21';
                    }
                    isVersionMismatch = !data.includes(resp.version);
                });
            }
        });
        return isVersionMismatch;
    }
}
