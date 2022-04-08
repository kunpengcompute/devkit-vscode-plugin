import {
    Component, Input, OnInit
} from '@angular/core';
import { TaskDetailMode } from '../../../domain';
import { AnalysisTarget, HpcPresetType } from 'projects/sys/src-web/app/domain';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';

interface IDetailItem {
    value: string | number;
    label: string;
    display: boolean;
}

@Component({
    selector: 'app-mission-diagnose-detail',
    templateUrl: './mission-diagnose-detail.component.html',
    styleUrls: ['./mission-diagnose-detail.component.scss']
})
export class MissionDiagnoseDetailComponent implements OnInit {

    @Input() taskInfo: any;
    @Input() detailTarget: TaskDetailMode;

    displayList: IDetailItem[];
    displayData: { [key: string]: IDetailItem };

    labelWidth: string;

    // 其他
    i18n: any;

    private labelWidthDict: Map<TaskDetailMode, { 'en-us': string, 'zh-cn': string }> = new Map([
        [TaskDetailMode.RESERVATION, { 'en-us': '25%', 'zh-cn': '25%' }],
        [TaskDetailMode.TEMPLATE_DETAIL, { 'en-us': '25%', 'zh-cn': '25%' }],
        [TaskDetailMode.TEMPLATE_IMPORT, { 'en-us': '210px', 'zh-cn': '140px' }],
    ]);

    private presetValueDict: Map<HpcPresetType, string>;

    /** 分析模式 */
    private analysisMode: AnalysisTarget = AnalysisTarget.LAUNCH_APPLICATION;
    /** 是否展示节点列表 */
    public isNodeListShow = false;
    /** 节点数据列表 */
    public nodeList: {
        title: string;
        nodeInfo: IDetailItem[]
    }[];
    constructor(
        private i18nService: I18nService
    ) {

        this.i18n = this.i18nService.I18n();

        this.presetValueDict = new Map([
            [HpcPresetType.Summary, this.i18n.hpc.mission_create.summary],
            [HpcPresetType.Topdown, 'HPC Top-Down'],
            [HpcPresetType.InstrucMix, this.i18n.hpc.mission_create.instr_dis]
        ]);
    }

    ngOnInit() {
        this.labelWidth = this.labelWidthDict.get(this.detailTarget)
            ?.[(sessionStorage.getItem('language') as 'en-us' | 'zh-cn')];
        const isException = this.taskInfo.diagnosticType.includes('mem_exception');
        const isConsume = this.taskInfo.diagnosticType.includes('mem_consume');
        const diagnosticType: string[] = [];
        this.taskInfo.diagnosticType.forEach((item: string) => {
            switch (item) {
                case 'mem_leak':
                    diagnosticType.push(this.i18n.diagnostic.taskParams.memory_leakage);
                    break;
                case 'mem_consume':
                    diagnosticType.push(this.i18n.diagnostic.taskParams.memory_consumption);
                    break;
                case 'oom':
                    diagnosticType.push('OOM');
                    break;
                case 'mem_exception':
                    diagnosticType.push(this.i18n.diagnostic.taskParams.memory_abnormal);
                    break;
            }
        });

        // 是否为 Attach模式
        const isAttach = this.taskInfo.analysisTarget === AnalysisTarget.ATTACH_TO_PROCESS;
        if (isAttach) {
          this.analysisMode = AnalysisTarget.ATTACH_TO_PROCESS;
        }
        this.displayData = {
            analysisTarget: {
                value: this.taskInfo.analysisTarget || '--',
                label: this.i18n.mission_create.mode,
                display: true,
            },
            appDir: {
                value: this.taskInfo.appDir || '--',
                label: this.i18n.storageIO.mission_create.app_dir,
                display: !isAttach ? true : false,
            },
            appParameters: {
                value: this.taskInfo.appParameters || '--',
                label: this.i18n.storageIO.mission_create.app_params,
                display: !isAttach ? true : false,
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
            diagnosticType: {
                value: diagnosticType.join('、'),
                label: this.i18n.diagnostic.taskParams.content_diagnose,
                display: true,
            },
            assemblyLocation: {
                value: this.taskInfo.assemblyLocation || '--',
                label: this.i18n.diagnostic.taskParams.assemblyLocation,
                display: !isException,
            },
            sourceLocation: {
                value: this.taskInfo.sourceLocation || '--',
                label: this.i18n.diagnostic.taskParams.sourceLocation,
                display: true,
            },
            samplingDelay: {
                value: this.taskInfo.samplingDelay,
                label: this.i18n.diagnostic.taskParams.samplingDelay,
                display: !isException && !isAttach,
            },
            duration: {
                value: this.taskInfo.duration || '--',
                label: this.i18n.diagnostic.taskParams.duration,
                display: !isException,
            },
            interval: {
                value: this.taskInfo.interval || '--',
                label: this.i18n.diagnostic.taskParams.interval,
                display: !isException && isConsume,
            },
            collectStack: {
                value: this.taskInfo.collectStack
                    ? this.i18n.sys_cof.sum.open
                    : this.i18n.sys_cof.sum.close,
                label: this.i18n.diagnostic.taskParams.collectStack,
                display: !isException,
            },
            stopException: {
                value: this.taskInfo.stopException ? this.i18n.sys_cof.sum.open : this.i18n.sys_cof.sum.close,
                label: this.i18n.diagnostic.taskParams.stopException,
                display: isException,
            },
            collectSize: {
                value: this.taskInfo.collectSize || '--',
                label: this.i18n.diagnostic.taskParams.collectSize,
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
                        display: this.analysisMode === AnalysisTarget.LAUNCH_APPLICATION,
                    }, {
                        value: taskParam.appParameters || '--',
                        label: this.i18n.storageIO.mission_create.app_params,
                        display: this.analysisMode === AnalysisTarget.LAUNCH_APPLICATION,
                    },
                    {
                      value: taskParam.processName || '--',
                      label: this.i18n.mission_create.process_alias,
                      display: isAttach ? true : false,
                    },
                    {
                      value: taskParam.processPid || '--',
                      label: 'PID',
                      display: isAttach ? true : false,
                    },
                    {
                        value: taskParam.assemblyLocation || '--',
                        label: this.i18n.diagnostic.taskParams.assemblyLocation,
                        display: !isException,
                    }, {
                        value: taskParam.sourceLocation || '--',
                        label: this.i18n.diagnostic.taskParams.sourceLocation,
                        display: this.analysisMode === AnalysisTarget.LAUNCH_APPLICATION || isAttach
                    }],
                };
            });
        }
    }
}

