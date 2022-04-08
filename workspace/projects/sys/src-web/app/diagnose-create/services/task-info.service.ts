import { Injectable } from '@angular/core';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';

@Injectable()
export class TaskInfoService {

    private i18n: any;
    public taskInfo: any = [];

    constructor(
        public i18nService: I18nService,
    ) {
        this.i18n = this.i18nService.I18n();
        this.taskInfo = [
            {
              id: 'mode',
              label: this.i18n.mission_create.mode,
              modeList: [
                {
                  name: this.i18n.mission_create.launchApp,
                  value: 0,
                  display: true
                },
                {
                  name: this.i18n.mission_create.attachPid,
                  value: 1,
                  display: true
                }
              ],
              require: false,
              show: true
            },
            /* Launch Application start */
            {
                id: 'app_dir',
                label: this.i18n.diagnostic.taskParams.app_dir,
                require: true,
                tipMsg: this.i18n.mission_create.modeAppNotice,
                show: true
            },
            {
                id: 'app_parameters',
                label: this.i18n.diagnostic.taskParams.app_parameters,
                require: false,
                tipMsg: this.i18n.mission_create.modeAppParamsNotice,
                show: true
            },
            {
                id: 'app_runUser',
                label: this.i18n.diagnostic.taskParams.app_runUser,
                require: false,
                tipMsg: this.i18n.mission_create.modeAppRunUser,
                show: true
            },
            /* Attach to process */
            {
              id: 'attachProcess',
              require: true,
              show: false
            },
            {
                id: 'memory_diagnose',
                label: this.i18n.diagnostic.taskParams.content_diagnose,
                require: true,
                show: true
            },
            {
                id: 'assemblyLocation',
                label: this.i18n.diagnostic.taskParams.assemblyLocation,
                tipMsg: this.i18n.tip_msg.common_term_task_crate_c_bs_tip,
                require: false,
                show: true,
                type: 1 // 表示非内存诊断
            },
            {
                id: 'sourceLocation',
                label: this.i18n.diagnostic.taskParams.sourceLocation,
                tipMsg: this.i18n.tip_msg.common_term_task_crate_c_source_tip,
                require: false,
                show: true
            },
            {
                id: 'samplingDelay',
                label: this.i18n.diagnostic.taskParams.samplingDelay,
                tipMsg: this.i18n.micarch.simpling_delay_tip,
                require: false,
                show: true,
                type: 1 // 表示非内存诊断
            },
            {
                id: 'duration',
                label: this.i18n.diagnostic.taskParams.duration,
                require: false,
                show: true,
                type: 1 // 表示非内存诊断
            },
            {
                id: 'interval',
                label: this.i18n.diagnostic.taskParams.interval,
                require: false,
                show: false,
                type: 1 // 表示非内存诊断
            },
            {
                id: 'collectStack',
                label: this.i18n.diagnostic.taskParams.collectStack,
                require: false,
                show: true,
                type: 1 // 表示非内存诊断
            },
            {
                id: 'stopException',
                label: this.i18n.diagnostic.taskParams.stopException,
                require: false,
                show: false,
                type: 2 // 表示内存异常
            },
            {
                id: 'switch',
                label: this.i18n.diagnostic.taskParams.switch,
                require: false,
                show: true
            },
            {
                id: 'collectSize',
                label: this.i18n.diagnostic.taskParams.collectSize,
                tipMsg: this.i18n.falsesharing.filesizeTips,
                require: false,
                show: true
            },
        ];
    }
}
