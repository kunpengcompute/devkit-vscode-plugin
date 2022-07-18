import { Injectable } from '@angular/core';

import { I18nService } from './i18n.service';
import { VscodeService } from './vscode.service';

/**
 * 告警状态
 */
const enum AlarmStatus {
    NoAlarm,
    WorkRedAlarm,
    DiskRedAlarm,
    WorkYellowAlarm,
    DiskYellowAlarm,
}

/**
 * 数据转换进制
 */
const enum Radix {
    Binary = 2,
    Octal = 8,
    Decimal = 10,
    Hexadecimal = 16,
}

const thresholdPercent = 0.2;
const thresholdValue = 1.0;

@Injectable({
    providedIn: 'root'
})
export class UtilsService {
    constructor(
        public i18nService: I18nService,
        public vscodeService: VscodeService) {
        this.i18n = this.i18nService.I18n();
    }
    public i18n: any = {};
    public diskMessage: any = {};

    /**
     * 加载结束，放开限制，允许修改页面数据
     */
    public static endLoading() {
        $('#loadingcover').hide();
    }

    /**
     * 加载过程，不允许修改页面数据
     */
    public static startLoading() {
        const loadingCover = $('#loadingcover');
        if (loadingCover && loadingCover.length > 0) {
            loadingCover.show();
        } else {
            const a = `<div class="loading-box" id="loadingcover">
                <div class="spinner">
                    <div class="rect1"></div>
                    <div class="rect2"></div>
                    <div class="rect3"></div>
                    <div class="rect4"></div>
                    <div class="rect5"></div>
                </div>
            </div>`;
            $('body').append(a);
        }
    }

    public intellijDismiss(intelliJFlagDef: boolean) {
        if (intelliJFlagDef) {
            $('ti-modal-wrapper').remove();
            $('ti-backdrop').remove();
        }
    }

    /**
     * 检测上传上传压缩包 | 文件夹是否符合规则 是否包含中文 空格以及^ ` / | ; & $ > < \ !
     * @param fileName 文件名
     */
    public checkUploadFileNameValidity(fileName: string): boolean {
        const reg = new RegExp(/[\u4e00-\u9fa5\s\^`\/\|;&$<>\\\!]/g);
        return reg.test(fileName);
    }

    /**
     * 查询磁盘状态
     */
    public queryDiskState() {
        const option = {
            url: '/space/',
            method: 'GET',
        };
        // 调用后端接口
        this.vscodeService.get(option, (resp: any) => {
            const diskInfo = {
                alarmStatus: resp.alarm_status,
                diskTotal: resp.partitionTotal,
                diskRemain: resp.partRemain,
                workTotal: resp.softNeeded,
                workRemain: resp.softRemain,
            };
            this.sendDiskMessage(diskInfo);
        });
    }

    /**
     * 发送磁盘信息
     * @param diskData: 磁盘数据
     */
    public sendDiskMessage(diskData: any) {
        this.diskMessage = { ...diskData };

        // 工作空间不足提示
        if (this.diskMessage.alarmStatus === AlarmStatus.WorkRedAlarm
            || this.diskMessage.alarmStatus === AlarmStatus.WorkYellowAlarm) {
            const workTotal = parseInt(this.diskMessage.workTotal.toFixed(), Radix.Decimal);
            const workRemain = this.diskMessage.workRemain > 0 ? parseFloat(this.diskMessage.workRemain.toFixed(2)) : 0;
            const workRecommand = workTotal * thresholdPercent;
            if (workRemain < thresholdValue) {
                this.diskMessage.content = this.i18nService.I18nReplace(
                    this.i18n.plugins_tuning_message.workWarn, { 0: workTotal, 1: workRemain, 2: workRecommand });
            } else {
                this.diskMessage.content = this.i18nService.I18nReplace(
                    this.i18n.plugins_tuning_message.workInfo, { 0: workTotal, 1: workRemain, 2: workRecommand });
            }
            const message = { cmd: 'showDiskMessage', data: this.diskMessage };
            this.vscodeService.postMessage(message, null);
        }

        // 磁盘空间不足提示
        if (this.diskMessage.alarmStatus === AlarmStatus.DiskRedAlarm
            || this.diskMessage.alarmStatus === AlarmStatus.DiskYellowAlarm) {
            const diskTotal = parseInt(this.diskMessage.diskTotal.toFixed(), Radix.Decimal);
            const diskRemain = this.diskMessage.diskRemain > 0 ? parseFloat(this.diskMessage.diskRemain.toFixed(2)) : 0;
            const diskRecommand = parseFloat((diskTotal * thresholdPercent).toFixed(2));
            if (diskRemain < thresholdValue) {
                this.diskMessage.content = this.i18nService.I18nReplace(
                    this.i18n.plugins_tuning_message.diskWarn, { 0: diskTotal, 1: diskRemain, 2: diskRecommand });
            } else {
                this.diskMessage.content = this.i18nService.I18nReplace(
                    this.i18n.plugins_tuning_message.diskInfo, { 0: diskTotal, 1: diskRemain, 2: diskRecommand });
            }
            const message = { cmd: 'showDiskMessage', data: this.diskMessage };
            this.vscodeService.postMessage(message, null);
        }
    }

    /**
     * 发送磁盘告警信息
     * @param alertMessage: 告警信息
     */
    public sendDiskAlertMessage() {
        const message = { cmd: 'showDiskAlertMessage', data: this.i18n.plugins_tuning_message.workDiskError };
        this.vscodeService.postMessage(message, null);
    }

    /**
     * 获取session信息
     */
    public getWebViewSession(paramName: string) {
        return ((self as any).webviewSession || {}).getItem(paramName);
    }

    /**
     * uuid生成
     * @param len uuid长度
     */
    public generateConversationId(len: number) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
        const uuid = [];
        let i;
        const radix = chars.length;

        if (len) {
            for (i = 0; i < len; i++) {
                uuid[i] = chars[Math.round(window.crypto.getRandomValues(new Uint8Array(1))[0] * 0.001 * radix)];
            }
        } else {
            uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
            uuid[14] = '4';

            let r;
            for (i = 0; i < 36; i++) {
                if (!uuid[i]) {
                    r = Math.round(window.crypto.getRandomValues(new Uint32Array(1))[0] * 0.001 * 16);
                    uuid[i] = chars[i === 19
                        ? Math.round(window.crypto.getRandomValues(new Uint32Array(1))[0] * 0.001 * 4) + 8
                        : r];
                }
            }
        }
        return uuid.join('');
    }

    /**
     * 等待指定的时间
     * @param ms 等待时间
     */
    public async sleep(ms: number) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve('');
            }, ms);
        });
    }

    /**
     * 后端worker数量状态提示
     * @param type 消息类型
     */
    public showMessageByWorker(type: string) {
        const message = {
            cmd: 'showMessageByWorker',
            data: {
                type
            }
        };
        this.vscodeService.postMessage(message, null);
    }

    /**
     * 文本消息弹框
     * @param msg 文本消息类容
     * @param type 文本消息类型 info,warn,error
     */
    public showTextMsg(msg: string, type: string) {
        const message = {
            cmd: 'showTextMsg',
            data: {
                type,
                msg
            }
        };
        this.vscodeService.postMessage(message, null);
    }

    /**
     * 跳转建议反馈链接
     */
    public openFeedback(event: any) {
        const a = document.createElement('a');
        a.setAttribute('href', event);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
}
