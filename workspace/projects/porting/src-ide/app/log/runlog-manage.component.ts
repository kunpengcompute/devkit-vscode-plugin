import { VscodeService } from '../service/vscode.service';
import { I18nService } from '../service/i18n.service';
import { LogManagerComponent } from './logManager.component';
import { MessageService } from '../service/message.service';

const enum STATUS {
    SUCCESS = 0,
    FAIL = 1,
    INSUFFICIENT_SPACE = 2,
    COMPRESSING = 2
}

const enum LANGUAGE_TYPE {
    ZH = 0,
    EN = 1,
}

const enum PROCESS_STATE {
    PORT_RUNLOG = 5,
    PORT_CANCELRUNLOG = 12,
    NOT_SHOW = -1,
}

const RUNLOGNAME = 'log.zip';
const VSSTATUS = '1';
const SITUATION = 0;

export class RunLogManageComponent {
    public static instance: RunLogManageComponent;
    public currLang: any;
    // 创建任务id
    public taskId: any;
    // 保存路径
    public osSavePath: any;
    // 右下角弹框进度条
    public situation = SITUATION;
    // 进度条提示
    public progressInfo = '';
    // 结束运行日志任务标记
    public stopRunLogFlag = false;
    // 震荡进度条标记
    public timer: any;
    // 当前是否有运行日志压缩中
    public isRunLog = false;

    // 静态实例常量
    constructor(
        public i18nService: I18nService,
        public vscodeService: VscodeService,
        private msgService: MessageService
    ) {
        RunLogManageComponent.instance = this;
    }

    /**
     * 创建运行日志下载任务
     */
    public createRunLogTask(callback: any) {
        const params = {
            download_path: ''
        };
        const option = {
            url: '/portadv/runlog/create_log/',
            params
        };
        this.vscodeService.post(option, (resp: any) => {
            if (resp && resp.status === 0) {
                // 进行日志压缩任务
                const obj = {
                    cmd: 'compressLogTask',
                    data: {
                        logName: RUNLOGNAME,  // 日志文件名
                        taskId: resp.data.task_id  // 创建下载运行日志的任务id
                    }
                };
                this.vscodeService.postMessage(obj, (data: any) => {
                    callback();
                });
            } else {
                this.showMessageByLang(resp, 'error');
                callback();
            }
        });
    }


    /**
     * 查询当前是否有日志压缩任务
     */
    public getRunLogTask() {
        const option = {
            url: '/portadv/runlog/zip_log/',
        };
        this.vscodeService.get(option, (resp: any) => {
            if (resp.data.task_id && resp.status === STATUS.SUCCESS) {
                this.taskId = resp.data.task_id;
                this.osSavePath = resp.data.download_path;
                this.getRunLogStatus();
            }
        });
    }

    /**
     * 查询正在压缩日志的任务状态
     */
    public getRunLogStatus() {
        const option = {
            url: `/portadv/runlog/zip_log/?task_id=${encodeURIComponent(this.taskId)}`,
        };
        this.vscodeService.get(option, (resp: any) => {
            if (resp.status === STATUS.SUCCESS) {
                this.isRunLog = true;
                this.runLogProgress(resp);
            } else {
                this.situation = PROCESS_STATE.NOT_SHOW;
            }
        });
    }

    /**
     * 运行日志压缩进度条
     * @param resp 响应数据
     */
    private runLogProgress(resp: any) {
        if (resp.data.status === STATUS.COMPRESSING) {
            this.isRunLog = true;
            this.loopRunLogBar(resp);
        } else if (resp.data.status === STATUS.SUCCESS) {
            this.situation = PROCESS_STATE.NOT_SHOW;
            this.downloadRunLog();
        } else {
            this.showMessageByLang(resp, 'error');
            this.situation = PROCESS_STATE.NOT_SHOW;
        }
    }

    /**
     * 进度条循环动画
     */
    private loopRunLogBar(resp: any) {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
        if (!this.stopRunLogFlag && (resp.status === STATUS.SUCCESS)) {
            this.timer = setTimeout(() => this.getRunLogStatus(), 500);
        }
    }

    /**
     * 日志下载
     */
    public downloadRunLog() {
        const params = {
            sub_path: 'downloadlog',
            file_path: RUNLOGNAME
        };
        const option = {
            url: '/portadv/download/',
            responseType: 'arraybuffer',
            params
        };
        this.vscodeService.post(option, (resp: any) => {
            this.isRunLog = false;
            this.downRunlogByName(resp);
        });
    }

    /**
     * 开启运行日志数据下载
     * @param dataLog 日志数据
     */
    public downRunlogByName(dataLog: any) {
        const runLogParams = {
            data: dataLog,
            reportId: RUNLOGNAME,
            status: VSSTATUS,
            contentType: 'arraybuffer',
            download_path: this.osSavePath
        };
        const option = {
            cmd: 'downloadRunLog',
            data: runLogParams
        };
        this.vscodeService.postMessage(option, null);
    }

    /**
     * 结束日志下载任务
     */
    public endRunLogTask(logManage: LogManagerComponent) {
        this.stopRunLogFlag = false;
        const option = {
            url: `/portadv/runlog/zip_log/?task_id=${encodeURIComponent(this.taskId)}`,
        };
        this.vscodeService.delete(option, (data: any) => {
            if (data.status === STATUS.SUCCESS) {
                this.showInfoBox(logManage.i18n.plugins_porting_clear_label, 'info');
                this.stopRunLogFlag = true;
            } else if (data.status === STATUS.FAIL) {
                this.showMessageByLang(data, 'warn');
            } else {
                this.showMessageByLang(data, 'error');
            }
        });
        this.situation = PROCESS_STATE.NOT_SHOW;
    }

    /**
     * 发送消息中英文判断
     */
    showMessageByLang(data: any, type: any) {
        this.currLang = I18nService.getLang();
        if (this.currLang === LANGUAGE_TYPE.ZH) {
            this.showInfoBox(data.infochinese, type);
        } else {
            this.showInfoBox(data.info, type);
        }
    }

    /**
     * 发送消息给vscode, 右下角弹出提醒框
     * @param info 弹框消息
     * @param type 消息类型
     */
    showInfoBox(info: any, type: any) {
        const message = {
            cmd: 'showInfoBox',
            data: {
                info,
                type
            }
        };
        this.vscodeService.postMessage(message, null);
    }
}
