import { Component, Input, OnInit, OnChanges, SimpleChange } from '@angular/core';
import { AnalysisModeEnum } from '../../mission-domain';
import { I18nService } from '../../../service/i18n.service';

interface DetailItem {
    value: string | number;
    label: string;
    display: boolean;
}

@Component({
    selector: 'app-mession-io-detail',
    templateUrl: './mession-io-detail.component.html',
    styleUrls: ['./mession-io-detail.component.scss'],
})
export class MessionIoDetailComponent implements OnInit, OnChanges {
    /** 输入参数： 任务信息 */
    @Input() taskInfo: any;
    /** 显示列表 */
    public displayList: DetailItem[];
    /** 显示数据 */
    public displayData: { [key: string]: DetailItem };
    /** 节点数据列表 */
    public nodeList: {
        title: string;
        nodeInfo: DetailItem[]
    }[];
    /** 是否展示节点列表 */
    public isNodeListShow = false;

    /** 分析模式 */
    private analysisMode: AnalysisModeEnum;
    /** 国际化 */
    public i18n: any;

    constructor(
        private i18nService: I18nService
    ) {
        this.i18n = this.i18nService.I18n();
    }

    /**
     * 初始化
     */
    ngOnInit() {
        this.displayData = {
            taskName: {
                value: this.taskInfo.taskName,
                label: this.i18n.storageIO.mission_create.mission_name,
                display: true
            },
            analysisMode: {
                value: this.analysisMode,
                label: this.i18n.mission_create.mode,
                display: true
            },
            pid: {
                value: this.taskInfo.targetPid || '--',
                label: 'PID',
                display: this.analysisMode === AnalysisModeEnum.ATTACH_TO_PROCESS
            },
            process: {
                value: this.taskInfo.process_name || '--',
                label: this.i18n.storageIO.mission_create.process_name,
                display: this.analysisMode === AnalysisModeEnum.ATTACH_TO_PROCESS
            },
            app: {
                value: this.taskInfo.appDir || '--',
                label: this.i18n.storageIO.mission_create.app_dir,
                display: this.analysisMode === AnalysisModeEnum.LAUNCH_APPLICATION
            },
            appParams: {
                value: this.taskInfo['app-parameters'] || '--',
                label: this.i18n.storageIO.mission_create.app_params,
                display: this.analysisMode === AnalysisModeEnum.LAUNCH_APPLICATION
            },
            duration: {
                value: this.taskInfo.duration,
                label: this.i18n.storageIO.mission_create.duration,
                display: true
            },
            statistical: {
                value: this.taskInfo.statistical,
                label: this.i18n.storageIO.mission_create.statistical,
                display: true
            },
            size: {
                value: this.taskInfo.size,
                label: this.i18n.storageIO.mission_create.collection_size,
                display: true
            },
            stack: {
                value: this.taskInfo.stack ? this.i18n.process.enable : this.i18n.process.disable,
                label: this.i18n.storageIO.mission_create.stack,
                display: true
            },
            cycle: {
                value: !!this.taskInfo.cycle ? this.i18n.preSwitch.duraColect : this.i18n.preSwitch.onceColect,
                label: this.i18n.storageIO.mission_create.collect_way,
                display: this.taskInfo.cycle != null
            },
            targetTime: {
                value: this.taskInfo.targetTime,
                label: this.i18n.storageIO.mission_create.cellect_time,
                display: this.taskInfo.cycle != null
            },
            cycleDate: {
                value: !!this.taskInfo.cycle
                    ? (this.taskInfo.cycleStart || '')
                        .replace(/-/g, '/') + '—' + (this.taskInfo.cycleStop || '')
                            .replace(/-/g, '/')
                    : (this.taskInfo.appointment || '').replace(/-/g, '/'),
                label: this.i18n.storageIO.mission_create.cellect_date,
                display: this.taskInfo.cycle != null
            }
        };
        this.displayList = Object.values(this.displayData);
        if (this.taskInfo.nodeConfig.length > 1 && this.taskInfo.switch
            && this.analysisMode !== AnalysisModeEnum.PROFILE_SYSTEM) {
            this.isNodeListShow = true;
            this.nodeList = this.taskInfo.nodeConfig.map((nodeItem: any) => {
                const taskParam = nodeItem.taskParam;
                return {
                    title: nodeItem.nickName + '(' + nodeItem.nodeIp + ')',
                    nodeInfo: [
                        {
                            value: taskParam.targetPid || '--',
                            label: 'PID',
                            display: this.analysisMode === AnalysisModeEnum.ATTACH_TO_PROCESS
                        },
                        {
                            value: taskParam.process_name || '--',
                            label: this.i18n.storageIO.mission_create.process_name,
                            display: this.analysisMode === AnalysisModeEnum.ATTACH_TO_PROCESS
                        },
                        {
                            value: taskParam.appDir || '--',
                            label: this.i18n.storageIO.mission_create.app_dir,
                            display: this.analysisMode === AnalysisModeEnum.LAUNCH_APPLICATION
                        },
                        {
                            value: taskParam['app-parameters'] || '--',
                            label: this.i18n.storageIO.mission_create.app_params,
                            display: this.analysisMode === AnalysisModeEnum.LAUNCH_APPLICATION
                        }
                    ],
                };
            });
        }
    }

    /**
     * 判断分析对象
     */
    ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
        const { taskInfo } = changes;
        if (taskInfo !== null) {
            if (this.taskInfo.analysis_target) {
                this.taskInfo.analysisTarget = this.taskInfo.analysis_target;
            }
            switch (this.taskInfo.analysisTarget) {
                case 'Profile System':
                    this.analysisMode = AnalysisModeEnum.PROFILE_SYSTEM;
                    break;
                case 'Launch Application':
                    this.analysisMode = AnalysisModeEnum.LAUNCH_APPLICATION;
                    break;
                case 'Attach to Process':
                    this.analysisMode = AnalysisModeEnum.ATTACH_TO_PROCESS;
                    break;
                default:
                    break;
            }
        }
    }
}
