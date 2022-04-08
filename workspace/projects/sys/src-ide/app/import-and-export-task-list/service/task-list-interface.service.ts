import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AxiosService } from 'projects/sys/src-ide/app/service/axios.service';
import { MessageService } from 'projects/sys/src-ide/app/service/message.service';
import { I18nService, LANGUAGE_TYPE } from 'projects/sys/src-ide/app/service/i18n.service';
import { VscodeService } from '../../service/vscode.service';
import { ToolType } from 'projects/domain';

type operate = 'retry' | 'delete' | 'downloadTask' | 'viewTask';  // 重试 | 删除 | 下载 | 查看
interface Status {
    text: string; // 描述文本
    status: 'running' | 'failed' | 'succeeded' | 'uploading'; // 状态列表，运行中 | 失败 | 成功 | 上传中
    operateList: operate[];  // 操作列表
}

@Injectable({
    providedIn: 'root'
})
export class TaskListInterfaceService {
    public language = 'en';
    public i18n;
    public exportStepsList = ['pre_export', 'export_start_fail', 'exporting', 'malluma_export_fail',
        'packaging', 'package_fail', 'export_success'];
    public importStepsList = [
        'uploading',
        'upload_fail',
        'upload_success',
        'extracting',
        'extract_fail',
        'extracting_success',
        'import_check_fail',
        'pre_import',
        'import_start_fail',
        'importing',
        'import_fail',
        'adding_task_info',
        'adding_task_info_fail',
        'import_success',
    ];
    public statusList: { [propName: string]: Status } = {}; // 所有的状态
    public operates: any;
    public listeningStatusTimer: any;  // 监听状态变化的定时器
    public listeningStatusTime = 3000;  // 定时器时长
    public toolType = sessionStorage.getItem('toolType');

    constructor(
        public Axios: AxiosService,
        public msgService: MessageService,
        private i18nService: I18nService,
        public router: Router,
        public vscodeService: VscodeService) {
        this.language = I18nService.getLang() === LANGUAGE_TYPE.ZH ? 'zh' : 'en';
        this.i18n = this.i18nService.I18n();
        this.operates = {
            retry: { text: this.i18n.project.retry, width_en: '59px' },
            delete: { text: this.i18n.common_term_operate_del },
            viewTask: { text: this.i18n.common_term_view, width_en: '59px' },
            downloadTask: { text: this.i18n.operationLog.download, width_en: '59px' },
        };

        this.statusList = {
          // 导出
          pre_export: {
            text: this.i18n.project.toBeExported,
            status: 'running',
            operateList: [],
          },
          export_start_fail: {
            text: this.i18n.project.exportTaskStartFailed,
            status: 'failed',
            operateList: ['retry', 'delete'],
          },
          exporting: {
            text: this.i18n.project.exporting,
            status: 'running',
            operateList: [],
          },
          malluma_export_fail: {
            text: this.i18n.project.exportFailed,
            status: 'failed',
            operateList: ['retry', 'delete'],
          },
          packaging: {
            text: this.i18n.project.packaging,
            status: 'running',
            operateList: [],
          },
          package_fail: {
            text: this.i18n.project.packagingFailed,
            status: 'failed',
            operateList: ['retry', 'delete'],
          },
          export_success: {
            text: this.i18n.project.exportSucceeded,
            status: 'succeeded',
            operateList: ['downloadTask', 'delete'],
          },

          // 导入
          uploading: {
            text: this.i18n.project.uploading,
            status: 'uploading',
            operateList: [],
          },
          upload_fail: {
            text: this.i18n.project.uploadFailed,
            status: 'failed',
            operateList: ['delete'],
          },
          upload_success: {
            text: this.i18n.project.uploaded,
            status: 'succeeded',
            operateList: ['delete'],
          },
          extracting: {
            text: this.i18n.project.decompressing,
            status: 'running',
            operateList: [],
          },
          extract_fail: {
            text: this.i18n.project.decompressionFailed,
            status: 'failed',
            operateList: ['retry', 'delete'],
          },
          extracting_success: {
            text: this.i18n.project.decompressed,
            status: 'succeeded',
            operateList: ['delete'],
          },
          import_check_fail: {
            text: this.i18n.project.verificationFailed,
            status: 'failed',
            operateList: ['retry', 'delete'],
          },
          pre_import: {
            text: this.i18n.project.toBeImported,
            status: 'running',
            operateList: [],
          },
          import_start_fail: {
            text: this.i18n.project.importTaskStartFailed,
            status: 'failed',
            operateList: ['retry', 'delete'],
          },
          importing: {
            text: this.i18n.project.importing,
            status: 'running',
            operateList: [],
          },
          import_fail: {
            text: this.i18n.project.importFailed,
            status: 'failed',
            operateList: ['retry', 'delete'],
          },
          adding_task_info: {
            text: this.i18n.project.importingTaskInfo,
            status: 'running',
            operateList: [],
          },
          adding_task_info_fail: {
            text: this.i18n.project.importTaskFailed,
            status: 'failed',
            operateList: ['retry', 'delete'],
          },
          import_success: {
            text: this.i18n.project.imported,
            status: 'succeeded',
            operateList: ['viewTask', 'delete'],
          },

          // 删除
          deleting: {
            text: this.i18n.plugins_sysperf_message_nodeManagement.deleting,
            status: 'running',
            operateList: [],
          },
          delete_success: {
            text: this.i18n.tip_msg.delete_ok,
            status: 'succeeded',
            operateList: [],
          },
          delete_fail: {
            text: this.i18n.tip_msg.delete_error,
            status: 'failed',
            operateList: ['delete'],
          },
        };
    }

    /**
     * 格式化文件大小单位，例：1024M => 1G
     * @param value 文件大小
     * @param unit value 使用的单位
     */
    public formatFileSizeUnit = (value: number, unit: 'B' | 'KB' | 'MB' | 'GB'): string => {
        if (value === 0) {
            return `0 ${unit}`;
        }

        const unitList = [
            { label: 'B', prop: 'B', rate: 1 },
            { label: 'KB', prop: 'KB', rate: 1024 },
            { label: 'MB', prop: 'MB', rate: 1024 * 1024 },
            { label: 'GB', prop: 'GB', rate: 1024 * 1024 * 1024 },
        ];
        const baseValue = value * unitList.find(item => item.prop === unit).rate;
        let usedUnit;
        for (let index = 0; index < unitList.length; index++) {
            const rate = unitList[index].rate;
            const nextRate = unitList[index + 1] ? unitList[index + 1].rate : Infinity;
            if ((baseValue >= rate) && (baseValue < nextRate)) {
                usedUnit = unitList[index];
                break;
            }
        }
        return `${(baseValue / usedUnit.rate).toFixed(2)} ${usedUnit.label}`;
    }


    /**
     * 获取任务列表信息
     * @param params params
     */
    public getTaskList({ pageNo, pageSize, autoFlag }: {
        pageNo?: number, // 页码从1开始
        pageSize?: number,
        autoFlag?: 'on',  // 是否不算入超时退出功能
    }) {
        return new Promise((resolve, reject) => {
            const type = this.toolType === ToolType.DIAGNOSE ? '&analysis-type=memory_diagnostic' : '';
            try {
                const option = {
                    url: '/import_export_tasks/?page=' + pageNo + '&per-page=' + pageSize +
                        '&language=' + this.language + '&auto-flag=' + autoFlag + type,
                };
                this.vscodeService.get(option, (res: any) => {
                    resolve(res);
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * 删除任务
     * @param taskId 任务 id
     * @param userId 用户 id
     */
    public deleteTsk(taskId: any, userId: any) {
        return new Promise((resolve, reject) => {
            try {
                const params = {
                    user_id: userId,
                };
                const option = {
                    url: `/import_export_tasks/${taskId}/`,
                    params,
                };
                this.vscodeService.delete(option, (resp: any) => {
                    resolve(resp);
                });
            } catch (error) {
                reject(error);
            }
        });
    }
}
