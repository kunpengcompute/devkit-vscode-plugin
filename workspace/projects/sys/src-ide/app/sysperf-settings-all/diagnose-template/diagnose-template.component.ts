import { Component, Input, OnInit, SimpleChange, OnChanges } from '@angular/core';
import { TaskDetailMode } from 'projects/sys/src-ide/app/domain';
import { AnalysisTarget } from 'projects/sys/src-ide/app/domain';
import { I18nService } from '../../service/i18n.service';

interface DetailItem {
    value: string | number | boolean;
    label: string;
    display: boolean;
}

@Component({
    selector: 'app-diagnose-template',
    templateUrl: './diagnose-template.component.html',
    styleUrls: ['./diagnose-template.component.scss']
})
export class DiagnoseTemplateComponent implements OnInit, OnChanges {
    @Input() taskInfo: any;
    @Input() detailTarget: TaskDetailMode;

    public displayList: DetailItem[];
    public displayData: { [key: string]: DetailItem };

    /** 节点数据列表 */
    public nodeList: {
        title: string;
        nodeInfo: DetailItem[]
    }[];
    /** 是否展示节点列表 */
    public isNodeListShow = false;

    public labelWidth: string;

    /** label 宽度的字典 */
    private labelWidthDict: Map<TaskDetailMode, { 'en-us': string, 'zh-cn': string }> = new Map([
        [TaskDetailMode.RESERVATION, { 'en-us': '25%', 'zh-cn': '25%' }],
        [TaskDetailMode.TEMPLATE_DETAIL, { 'en-us': '25%', 'zh-cn': '25%' }],
        [TaskDetailMode.TEMPLATE_IMPORT, { 'en-us': '210px', 'zh-cn': '140px' }],
    ]);

    /** 分析模式 */
    private analysisMode: AnalysisTarget;
    public isException: any;
    public isConsume: any;

    // 其他
    public i18n: any;

    constructor(
        private i18nService: I18nService,
    ) {
        this.i18n = this.i18nService.I18n();
    }

    /** 判断分析对象 */
    ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
        const { taskInfo } = changes;
        if (taskInfo != null) {
            switch (this.taskInfo.analysisTarget) {
                case 'Profile System':
                    this.analysisMode = AnalysisTarget.PROFILE_SYSTEM;
                    break;
                case 'Launch Application':
                    this.analysisMode = AnalysisTarget.LAUNCH_APPLICATION;
                    break;
                case 'Attach to Process':
                    this.analysisMode = AnalysisTarget.ATTACH_TO_PROCESS;
                    break;
            }
        }
    }

    ngOnInit() {
        this.labelWidth = this.labelWidthDict.get(this.detailTarget)
            ?.[(sessionStorage.getItem('language') as 'en-us' | 'zh-cn')];
        this.isException = this.taskInfo.diagnosticType.includes('mem_exception');
        this.isConsume = this.taskInfo.diagnosticType.includes('mem_consume');
        // 是否为 Attach模式
        const isAttach = this.taskInfo.nodeConfig[0].taskParam.analysisTarget === AnalysisTarget.ATTACH_TO_PROCESS;
        this.displayData = {
            taskName: {
                value: this.taskInfo.taskName,
                label: this.i18n.storageIO.mission_create.mission_name,
                display: true,
            },
            app: {
                value: this.taskInfo.appDir || '--',
                label: this.i18n.storageIO.mission_create.app_dir,
                display: isAttach ? false : true
            },
            appParameters: {
                value: this.taskInfo.appParameters || '--',
                label: this.i18n.storageIO.mission_create.app_params,
                display: isAttach ? false : true
            },
            processName: {
              value: this.taskInfo.processName || '--',
              label: this.i18n.mission_create.process_alias,
              display: isAttach ? true : false,
            },
            processPid: {
              value: this.taskInfo.processPid || '--',
              label: 'PID',
              display: isAttach ? true : false,
            },
            diagnoseType: {
                value: this.getDiagnoseType(this.taskInfo.diagnosticType) || '--',
                label: this.i18n.diagnostic.taskParams.content_diagnose,
                display: true,
            },
            assemblyLocation: {
                value: this.taskInfo.assemblyLocation || '--',
                label: this.i18n.diagnostic.taskParams.assemblyLocation,
                display: !this.isException,
            },
            sourceLocation: {
                value: this.taskInfo.sourceLocation || '--',
                label: this.i18n.diagnostic.taskParams.sourceLocation,
                display: true,
            },
            startTime: {
                value: this.taskInfo.samplingDelay,
                label: this.i18n.diagnostic.taskParams.samplingDelay,
                display: !this.isException && !isAttach,
            },
            duration: {
                value: this.taskInfo.duration || '--',
                label: this.i18n.diagnostic.taskParams.duration,
                display: !this.isException,
            },
            interval: {
                value: this.taskInfo.interval || '--',
                label: this.i18n.diagnostic.taskParams.interval,
                display: !this.isException && this.isConsume,
            },
            stack: {
                value: this.taskInfo.collectStack ? this.i18n.process.enable : this.i18n.process.disable,
                label: this.i18n.storageIO.mission_create.stack,
                display: !this.isException,
            },
            stopException: {
                value: this.taskInfo.stopException ? this.i18n.sys_cof.sum.open : this.i18n.sys_cof.sum.close,
                label: this.i18n.diagnostic.taskParams.stopException,
                display: this.isException,
            },
            size: {
                value: this.taskInfo.collectSize,
                label: this.i18n.storageIO.mission_create.collection_size,
                display: true,
            },
            cycle: {
                value: !!this.taskInfo.cycle ? this.i18n.preSwitch.duraColect : this.i18n.preSwitch.onceColect,
                label: this.i18n.storageIO.mission_create.collect_way,
                display: this.taskInfo.cycle != null,
            },
            targetTime: {
                value: this.taskInfo.targetTime,
                label: this.i18n.storageIO.mission_create.cellect_time,
                display: this.taskInfo.cycle != null,
            },
            cycleDate: {
                value: !!this.taskInfo.cycle
                    ? (this.taskInfo.cycleStart || '').replace(/-/g, '/') + '—'
                      + (this.taskInfo.cycleStop || '').replace(/-/g, '/')
                    : (this.taskInfo.appointment || '').replace(/-/g, '/'),
                label: this.i18n.storageIO.mission_create.cellect_date,
                display: this.taskInfo.cycle != null,
            },
        };
        this.displayList = Object.values(this.displayData);

        if (this.taskInfo.nodeConfig.length > 1
            && this.taskInfo.switch
            && this.analysisMode !== AnalysisTarget.PROFILE_SYSTEM) {
            this.isNodeListShow = true;
            this.nodeList = this.taskInfo.nodeConfig.map((nodeItem: any) => {
                const taskParam = nodeItem.taskParam;
                return {
                    title: nodeItem.nickName + '(' + nodeItem.nodeIp + ')',
                    nodeInfo: [{
                        value: taskParam.appDir || '--',
                        label: this.i18n.storageIO.mission_create.app_dir,
                        display: !isAttach ? true : false
                    },
                    {
                        value: taskParam.appParameters || '--',
                        label: this.i18n.storageIO.mission_create.app_params,
                        display: !isAttach ? true : false
                    },
                    {
                      value: taskParam.processName || '--',
                      label: this.i18n.mission_create.process_alias,
                      display: isAttach ? true : false
                    },
                    {
                      value: taskParam.processPid || '--',
                      label: 'PID',
                      display: isAttach ? true : false
                    },
                    {
                        value: taskParam.assemblyLocation || '--',
                        label: this.i18n.diagnostic.taskParams.assemblyLocation,
                        display: !this.isException

                    }, {
                        value: taskParam.sourceLocation || '--',
                        label: this.i18n.diagnostic.taskParams.sourceLocation,
                        display: true
                    }],
                };
            });
        }
    }

    public getDiagnoseType(list: any[]): string {
        let str = '';
        str += list.indexOf('mem_leak') > -1 ? this.i18n.diagnostic.taskParams.memory_leakage + '、' : '';
        str += list.indexOf('mem_consume') > -1 ? this.i18n.diagnostic.taskParams.memory_consumption + '、' : '';
        str += list.indexOf('oom') > -1 ? 'OOM' + '、' : '';
        str += list.indexOf('mem_exception') > -1 ? this.i18n.diagnostic.taskParams.memory_abnormal + '、' : '';
        return str.substring(0, str.length - 1);
    }
}
