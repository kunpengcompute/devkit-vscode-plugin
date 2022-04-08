import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef, NgZone } from '@angular/core';
import { I18nService } from '../service/i18n.service';
import { VscodeService } from '../service/vscode.service';
import { MemAnalysisModeForm } from '../mission-create/taskParams/modules/MemAnalysisModeForm';
import { MemAccessForm } from '../mission-create/taskParams/modules/MemAccessForm';
import { MissEventForm } from '../mission-create/taskParams/modules/MissEventForm';
import { FalseSharingForm } from '../mission-create/taskParams/modules/FalseSharingForm';
import { Utils } from 'projects/sys/src-ide/app/service/utils.service';
import { AnalysisTarget } from 'projects/sys/src-ide/app/domain';
import { TiTableRowData, TiTableSrcData } from '@cloud/tiny3';
import { UrlService } from 'projects/sys/src-ide/app/service/url.service';
import { ConfigTableService } from '../mission-analysis/linkage-detail/service/config-table.service';
import { CustomValidatorsService } from '../service';
import { ToolType } from 'projects/domain';
import { MemPerfUrl } from 'sys/src-ide/url/memperf';
import { CommonTableData, CommonTreeNode } from 'sys/src-com/app/shared/domain';

interface IParentConfig {
    key: string;
    text: string;
    requier: string;
    order: number;
}
interface TaskInfoItemType {
    key: string;
    text: string;
    requier: string;
    status: string;
    taskcode: string;
}
@Component({
    selector: 'app-configuration',
    templateUrl: './configuration.component.html',
    styleUrls: ['./configuration.component.scss']
})
export class ConfigurationComponent implements OnInit {
    @Input() projectName: any;
    @Input() taskName: any;
    @Input() analysisType: any;
    @Input() taskid: any;
    @Input() nodeid: any;
    @Input() status: any;
    @Input() taskDetail: any;

    @Output() private returnConfigInfo = new EventEmitter<any>();
    i18n: any;
    constructor(
        public I18n: I18nService,
        public i18nService: I18nService,
        public vscodeService: VscodeService,
        public configTableService: ConfigTableService,
        private urlService: UrlService,
        private changeDetectorRef: ChangeDetectorRef,
        private zone: NgZone,
        public customValidatorsService: CustomValidatorsService
    ) {
        this.i18n = this.i18nService.I18n();
    }
    private url: any;
    public configList: Array<any> = [];
    public arrStatus = false;
    public timeData: any = [];
    public simplingArr = [
        { id: 'badSpeculation', text: 'Bad Speculation', tip: 'testtest' },
        { id: 'frontEndBound', text: 'Front-End Bound', tip: 'testtest' },
        { id: 'resourceBound', text: 'Back-End Bound->Resource Bound', tip: 'testtest' },
        { id: 'coreBound', text: 'Back-End Bound->Core Bound', tip: 'testtest' },
        { id: 'memoryBound', text: 'Back-End Bound->Memory Bound', tip: 'testtest' },
    ];
    public linkageData: TiTableSrcData;
    public mipTableData: CommonTableData = {
        columnsTree: [] as Array<CommonTreeNode>,
        displayed: [] as Array<CommonTableData>,
        srcData: {
            data: [] as Array<TiTableRowData>,
            state: {
                searched: false,
                sorted: false,
                paginated: false
            }
        }
    };
    public mpiDisplayed: Array<TiTableRowData> = [];

    /**
     * 页面初始化时执行
     */
    ngOnInit() {
        this.mipTableData.columnsTree = [
            {
                title: 'IP',
                width: '20%'
            },
            {
                title: this.i18n.hpc.mission_create.rankNum,
                width: '20%'
            },
        ];
        if (this.taskDetail?.isCreateDiagnoseTask) {  // 调优助手优化建议创建的诊断分析任务
            this.url = MemPerfUrl;
        } else {
            this.url = this.urlService.Url();
        }
        this.linkageData = {
            data: ([] as Array<TiTableRowData>),
            state: {
                searched: false,
                sorted: false,
                paginated: false
            },
        };
        const analysisTypesDir: { [x: string]: string } = {
            hpc_analysis: this.i18n.mission_create.hpc,
            system: this.i18n.mission_create.sysPro,
            system_config: this.i18n.mission_create.sysConfig,
            resource_schedule: this.i18n.mission_create.resSchedule,
            microarchitecture: this.i18n.mission_create.structure,
            'process-thread-analysis': this.i18n.mission_create.process,
            mem_access: this.i18n.mission_modal.memAccessAnalysis,
            miss_event: this.i18n.mission_modal.memAccessAnalysis,
            falsesharing: this.i18n.mission_modal.memAccessAnalysis,
            'C/C++ Program': this.i18n.mission_create.cPlusPlus,
            system_lock: this.i18n.mission_create.lock,
            'java-mixed-mode': this.i18n.mission_create.java,
            ioperformance: this.i18n.mission_create.io,
            memory_diagnostic: this.i18n.diagnostic.common_title
        };
        const toolType = this.taskDetail?.isCreateDiagnoseTask ? ToolType.DIAGNOSE
            : sessionStorage.getItem('toolType');
        let urlParams = '';
        if (this.analysisType === 'task_contrast') {
            urlParams = '/tasks/taskcontrast/configuration/?taskId=' + this.taskid;
        } else {
            urlParams = this.url.toolTask +
                encodeURIComponent(this.taskid) +
                (toolType === ToolType.DIAGNOSE ? '' : '/common') +
                '/configuration/?node-id=' + this.nodeid;
        }
        this.vscodeService.get({ url: urlParams }, (data: any) => {
            if (data.data) {
                let taskStatus = '';
                let nodeNickName: string;
                let nodeData: any = {};
                let analysisType: string;
                let statusCode: string;
                let analysisTarget: string;
                const configInfo = [];
                if (this.analysisType !== 'task_contrast') {
                    const allNodeData = data.data.nodeConfig.filter((item: any) => {
                        return item.nodeId = this.nodeid;
                    });
                    taskStatus = allNodeData[0].taskStatus;
                    nodeNickName = allNodeData[0].nodeNickName;
                    statusCode = allNodeData[0].statusCode;
                    nodeData = allNodeData[0].task_param || allNodeData[0].taskParam;
                    analysisType = nodeData['analysis-type'] || nodeData.analysisType || data.data.analysisType;
                    analysisTarget = this.getAnalysisTarget(nodeData);
                    if (analysisType.indexOf('C++') > -1) {
                        if (nodeData['analysis-target'].indexOf('Launch') > -1) {
                            this.configList = [
                                {
                                    key: this.i18n.task_name,
                                    text: nodeData.taskname,
                                    requier: ''
                                },
                                {
                                    key: this.i18n.common_term_task_crate_app_path,
                                    text: (nodeData['app-dir'] !== undefined && nodeData['app-dir'] !== '')
                                        ? nodeData['app-dir'] : '--',
                                    requier: ''
                                },
                                {
                                    key: this.i18n.common_term_task_crate_parameters,
                                    text: (nodeData['app-parameters'] !== undefined
                                        && nodeData['app-parameters'] !== '') ? nodeData['app-parameters'] : '--',
                                    requier: ''
                                },
                                {
                                    key: this.i18n.common_term_task_crate_interval_ms + ' (' + (
                                        nodeData.interval === '0.71'
                                            ? this.i18n.common_term_task_crate_us
                                            : this.i18n.common_term_task_crate_ms) + ')',
                                    text: (nodeData.interval !== undefined && nodeData.interval !== '')
                                        ? nodeData.interval : '--',
                                    requier: ''
                                },

                                {
                                    key: this.i18n.common_term_task_crate_bs_path,
                                    text: (nodeData.assemblyLocation !== undefined
                                        && nodeData.assemblyLocation !== '') ? nodeData.assemblyLocation : '--',
                                    requier: ''
                                },
                                {
                                    key: this.i18n.common_term_task_crate_c_path,
                                    text: (nodeData.sourceLocation !== undefined
                                        && nodeData.sourceLocation !== '') ? nodeData.sourceLocation : '--',
                                    requier: ''
                                },
                                {
                                    key: this.i18n.mission_create.kcore,
                                    text: nodeData.kcore ? this.i18n.process.enable : this.i18n.process.disable,
                                    requier: ''
                                },
                                {
                                    key: this.i18n.falsesharing.filesize + this.i18n.ddr.leftParenthesis + 'MiB'
                                        + this.i18n.ddr.rightParenthesis,
                                    text: (nodeData.size !== undefined && nodeData.size !== '') ? nodeData.size : '--',
                                    requier: ''
                                },
                                {
                                    key: this.i18n.ddr.samplingRange,
                                    text: Utils.formattingSamplingRange(this.i18n, nodeData.samplingSpace),
                                    requier: ''
                                }
                            ];
                        } else if (nodeData['analysis-target'].indexOf('Profile') > -1) {
                            this.configList = [
                                {
                                    key: this.i18n.task_name,
                                    text: nodeData.taskname,
                                    requier: ''
                                },
                                {
                                    key: this.i18n.common_term_task_crate_interval_ms + ' (' + (
                                        nodeData.interval === '0.71'
                                            ? this.i18n.common_term_task_crate_us
                                            : this.i18n.common_term_task_crate_ms) + ')',
                                    text: (nodeData.interval !== undefined && nodeData.interval !== '')
                                        ? nodeData.interval : '--',
                                    requier: ''
                                },
                                {
                                    key: this.i18n.common_term_task_crate_mask,
                                    text: (nodeData['cpu-mask'] !== undefined && nodeData['cpu-mask'] !== '')
                                        ? nodeData['cpu-mask'] : '--',
                                    requier: ''
                                },
                                {
                                    key: this.i18n.common_term_task_crate_bs_path,
                                    text: (nodeData.assemblyLocation !== undefined
                                        && nodeData.assemblyLocation !== '') ? nodeData.assemblyLocation : '--',
                                    requier: ''
                                },
                                {
                                    key: this.i18n.common_term_task_crate_c_path,
                                    text: (nodeData.sourceLocation !== undefined
                                        && nodeData.sourceLocation !== '') ? nodeData.sourceLocation : '--',
                                    requier: ''
                                },
                                {
                                    key: this.i18n.common_term_task_crate_duration,
                                    text: (nodeData.duration !== undefined && nodeData.duration !== '')
                                        ? nodeData.duration : '--',
                                    requier: ''
                                },
                                {
                                    key: this.i18n.mission_create.kcore,
                                    text: nodeData.kcore ? this.i18n.process.enable : this.i18n.process.disable,
                                    requier: ''
                                },
                                {
                                    key: this.i18n.falsesharing.filesize + this.i18n.ddr.leftParenthesis + 'MiB'
                                        + this.i18n.ddr.rightParenthesis,
                                    text: (nodeData.size !== undefined && nodeData.size !== '') ? nodeData.size : '--',
                                    requier: ''
                                },
                                {
                                    key: this.i18n.ddr.samplingRange,
                                    text: Utils.formattingSamplingRange(this.i18n, nodeData.samplingSpace),
                                    requier: ''
                                }
                            ];
                        } else if (nodeData['analysis-target'].indexOf('Attach') > -1) {
                            this.configList = [
                                {
                                    key: this.i18n.task_name,
                                    text: nodeData.taskname,
                                    requier: ''
                                },
                                {
                                    key: this.i18n.common_term_task_crate_interval_ms + ' (' + (
                                        nodeData.interval === '0.71'
                                            ? this.i18n.common_term_task_crate_us
                                            : this.i18n.common_term_task_crate_ms) + ')',
                                    text: (nodeData.interval !== undefined && nodeData.interval !== '')
                                        ? nodeData.interval : '--',
                                    requier: ''
                                },
                                {
                                    key: this.i18n.mission_create.process_alias,
                                    text: decodeURIComponent(nodeData['process-name']) || '--',
                                    requier: ''
                                },
                                {
                                    key: this.i18n.common_term_task_crate_pid,
                                    text: nodeData['target-pid'] || '--',
                                    requier: ''
                                },
                                {
                                    key: this.i18n.common_term_task_crate_bs_path,
                                    text: (nodeData.assemblyLocation !== undefined
                                        && nodeData.assemblyLocation !== '') ? nodeData.assemblyLocation : '--',
                                    requier: ''
                                },
                                {
                                    key: this.i18n.common_term_task_crate_c_path,
                                    text: (nodeData.sourceLocation !== undefined
                                        && nodeData.sourceLocation !== '') ? nodeData.sourceLocation : '--',
                                    requier: ''
                                },
                                {
                                    key: this.i18n.mission_create.kcore,
                                    text: nodeData.kcore ? this.i18n.process.enable : this.i18n.process.disable,
                                    requier: ''
                                },
                                {
                                    key: this.i18n.common_term_task_crate_duration,
                                    text: (nodeData.duration !== undefined
                                        && nodeData.duration !== '') ? nodeData.duration : '--',
                                    requier: ''
                                },
                                {
                                    key: this.i18n.falsesharing.filesize + this.i18n.ddr.leftParenthesis + 'MiB'
                                        + this.i18n.ddr.rightParenthesis,
                                    text: (nodeData.size !== undefined && nodeData.size !== '') ? nodeData.size : '--',
                                    requier: ''
                                },
                                {
                                    key: this.i18n.ddr.samplingRange,
                                    text: Utils.formattingSamplingRange(this.i18n, nodeData.samplingSpace),
                                    requier: ''
                                }
                            ];
                        }
                    } else if (analysisType === 'system') {
                        this.configList = [
                            {
                                key: this.i18n.task_name,
                                text: nodeData.taskname,
                            },
                            {
                                key: this.i18n.sys.interval,
                                text: nodeData.interval,
                            },
                            {
                                key: this.i18n.sys.duration,
                                text: nodeData.duration,
                            },
                        ];

                    } else if (analysisType.indexOf('resource') > -1) {
                        if (nodeData['analysis-target'].indexOf('Launch') > -1) {
                            this.configList = [
                                {
                                    key: this.i18n.task_name,
                                    text: nodeData.taskname,
                                    requier: ''
                                },
                                {
                                    key: this.i18n.common_term_task_crate_app_path,
                                    text: (nodeData['app-dir'] !== undefined && nodeData['app-dir'] !== '')
                                        ? nodeData['app-dir'] : '--',
                                    requier: ''
                                },
                                {
                                    key: this.i18n.common_term_task_crate_parameters,
                                    text: (nodeData['app-parameters'] !== undefined
                                        && nodeData['app-parameters'] !== '') ? nodeData['app-parameters'] : '--',
                                    requier: ''
                                },
                                {
                                    key: this.i18n.common_term_task_crate_bs_path,
                                    text: (nodeData.assemblyLocation !== undefined
                                        && nodeData.assemblyLocation !== '') ? nodeData.assemblyLocation : '--',
                                    requier: ''
                                },
                                {
                                    key: this.i18n.mission_create.collectCallStack,
                                    text: nodeData['dis-callstack'] === undefined ? '--' : (nodeData['dis-callstack']
                                        ? this.i18n.process.enable : this.i18n.process.disable),
                                    requier: ''
                                },
                            ];
                        } else if (nodeData['analysis-target'].indexOf('Profile') > -1) {
                            this.configList = [
                                {
                                    key: this.i18n.task_name,
                                    text: nodeData.taskname,
                                    requier: ''
                                },
                                {
                                    key: this.i18n.common_term_task_crate_bs_path,
                                    text: (nodeData.assemblyLocation !== undefined
                                        && nodeData.assemblyLocation !== '') ? nodeData.assemblyLocation : '--',
                                    requier: ''
                                },
                                {
                                    key: this.i18n.common_term_task_crate_duration,
                                    text: (nodeData.duration !== undefined && nodeData.duration !== '')
                                        ? nodeData.duration : '--',
                                    requier: ''
                                },
                                {
                                    key: this.i18n.mission_create.collectCallStack,
                                    text: nodeData['dis-callstack'] === undefined ? '--' : (nodeData['dis-callstack']
                                        ? this.i18n.process.enable : this.i18n.process.disable),
                                    requier: ''
                                },
                            ];
                        } else if (nodeData['analysis-target'].indexOf('Attach') > -1) {
                            this.configList = [
                                {
                                    key: this.i18n.task_name,
                                    text: nodeData.taskname,
                                    requier: ''
                                },
                                {
                                    key: this.i18n.mission_create.process_alias,
                                    text: decodeURIComponent(nodeData['target-comm']) || '--',
                                    requier: ''
                                },
                                {
                                    key: this.i18n.common_term_task_crate_pid,
                                    text: nodeData['target-pid'] || '--',
                                    requier: ''
                                },
                                {
                                    key: this.i18n.common_term_task_crate_bs_path,
                                    text: (nodeData.assemblyLocation !== undefined
                                        && nodeData.assemblyLocation !== '') ? nodeData.assemblyLocation : '--',
                                    requier: ''
                                },
                                {
                                    key: this.i18n.common_term_task_crate_duration,
                                    text: (nodeData.duration !== undefined
                                        && nodeData.duration !== '') ? nodeData.duration : '--',
                                    requier: ''
                                },
                                {
                                    key: this.i18n.mission_create.collectCallStack,
                                    text: nodeData['dis-callstack'] === undefined ? '--' : (nodeData['dis-callstack']
                                        ? this.i18n.process.enable : this.i18n.process.disable),
                                    requier: ''
                                },
                            ];
                        }
                    } else if (analysisType === 'microarchitecture') {
                        let simplingIndex = '';
                        let samplingSpace = '';
                        this.simplingArr.forEach(val => {
                            if (nodeData.analysisIndex.indexOf(val.id) > -1) {
                                simplingIndex += ',' + val.text;
                            }
                        });
                        if (simplingIndex) {
                            simplingIndex = simplingIndex.slice(1);
                        } else {
                            simplingIndex = '--';
                        }

                        if (nodeData.samplingSpace === 'all') {
                            samplingSpace = this.i18n.micarch.typeItem_all;
                        } else if (nodeData.samplingSpace === 'user') {
                            samplingSpace = this.i18n.micarch.typeItem_user;
                        } else if (nodeData.samplingSpace === 'kernel') {
                            samplingSpace = this.i18n.micarch.typeItem_kernel;
                        } else {
                            samplingSpace = '--';
                        }

                        if (nodeData.analysisTarget.indexOf('Launch') > -1) {
                            this.configList = [
                                {
                                    key: this.i18n.task_name,
                                    text: nodeData.taskName,
                                    requier: ''
                                },
                                {
                                    key: this.i18n.common_term_task_crate_app_path,
                                    text: nodeData.appDir || '--',
                                    requier: ''
                                },
                                {
                                    key: this.i18n.common_term_task_crate_parameters,
                                    text: nodeData.appParameters || '--',
                                    requier: ''
                                },
                                {
                                    key: this.i18n.micarch.label.simpling,
                                    text: nodeData.samplingMode || '--',
                                    requier: ''
                                },
                                {
                                    key: this.i18n.sys.duration,
                                    text: nodeData.duration || '--',
                                    requier: ''
                                },
                                {
                                    key: this.i18n.mission_modal.syslock.cpu_interval,
                                    text: nodeData.interval || '--',
                                    requier: ''
                                },
                                {
                                    key: this.i18n.micarch.label.analysis,
                                    text: simplingIndex,
                                    requier: ''
                                },
                                {
                                    key: this.i18n.micarch.label.typeItem,
                                    text: samplingSpace,
                                    requier: ''
                                },
                                {
                                    key: this.i18n.micarch.simpling_delay,
                                    text: nodeData.samplingDelay ? nodeData.samplingDelay
                                        : nodeData.samplingDelay === 0 ? 0 : '--',
                                    requier: ''
                                },
                                {
                                    key: this.i18n.common_term_task_crate_c_path,
                                    text: (nodeData.sourceLocation !== undefined
                                        && nodeData.sourceLocation !== '') ? nodeData.sourceLocation : '--',
                                    requier: ''
                                },
                                {
                                    key: this.i18n.mission_create.kcore,
                                    text: nodeData.kcore ? this.i18n.process.enable : this.i18n.process.disable,
                                    requier: ''
                                },
                                {
                                    key: this.i18n.common_term_task_crate_collectFiles,
                                    text: nodeData.perfDataLimit,
                                    requier: ''
                                },
                            ];
                        } else if (nodeData.analysisTarget.indexOf('Profile') > -1) {
                            this.configList = [
                                {
                                    key: this.i18n.task_name,
                                    text: nodeData.taskName,
                                    requier: ''
                                },
                                {
                                    key: this.i18n.micarch.label.simpling,
                                    text: nodeData.samplingMode || '--',
                                    requier: ''
                                },
                                {
                                    key: this.i18n.sys.duration,
                                    text: nodeData.duration || '--',
                                    requier: ''
                                },
                                {
                                    key: this.i18n.mission_modal.syslock.cpu_interval,
                                    text: nodeData.interval || '--',
                                    requier: ''
                                },
                                {
                                    key: this.i18n.micarch.label.analysis,
                                    text: simplingIndex,
                                    requier: ''
                                },
                                {
                                    key: this.i18n.micarch.cpu_kernel,
                                    text: nodeData.cpuMask ? nodeData.cpuMask : nodeData.cpuMask === 0 ? 0 : '--',
                                    requier: ''
                                },
                                {
                                    key: this.i18n.micarch.label.typeItem,
                                    text: samplingSpace,
                                    requier: ''
                                },
                                {
                                    key: this.i18n.micarch.simpling_delay,
                                    text: nodeData.samplingDelay ? nodeData.samplingDelay
                                        : nodeData.samplingDelay === 0 ? 0 : '--',
                                    requier: ''
                                },
                                {
                                    key: this.i18n.common_term_task_crate_c_path,
                                    text: (nodeData.sourceLocation !== undefined
                                        && nodeData.sourceLocation !== '') ? nodeData.sourceLocation : '--',
                                    requier: ''
                                },
                                {
                                    key: this.i18n.mission_create.kcore,
                                    text: nodeData.kcore ? this.i18n.process.enable : this.i18n.process.disable,
                                    requier: ''
                                },
                                {
                                    key: this.i18n.common_term_task_crate_collectFiles,
                                    text: nodeData.perfDataLimit,
                                    requier: ''
                                },
                            ];
                        } else if (nodeData.analysisTarget.indexOf('Attach') > -1) {
                            this.configList = [
                                {
                                    key: this.i18n.task_name,
                                    text: nodeData.taskName,
                                    requier: ''
                                },
                                {
                                    key: this.i18n.mission_create.process_alias,
                                    text: decodeURIComponent(nodeData.process_name) || '--',
                                    requier: ''
                                },
                                {
                                    key: this.i18n.common_term_task_crate_pid,
                                    text: nodeData.targetPid || '--',
                                    requier: ''
                                },
                                {
                                    key: this.i18n.micarch.label.simpling,
                                    text: nodeData.samplingMode || '--',
                                    requier: ''
                                },
                                {
                                    key: this.i18n.sys.duration,
                                    text: nodeData.duration || '--',
                                    requier: ''
                                },
                                {
                                    key: this.i18n.mission_modal.syslock.cpu_interval,
                                    text: nodeData.interval || '--',
                                    requier: ''
                                },
                                {
                                    key: this.i18n.micarch.label.analysis,
                                    text: simplingIndex,
                                    requier: ''
                                },
                                {
                                    key: this.i18n.micarch.label.typeItem,
                                    text: samplingSpace,
                                    requier: ''
                                },
                                {
                                    key: this.i18n.micarch.simpling_delay,
                                    text: nodeData.samplingDelay ? nodeData.samplingDelay
                                        : nodeData.samplingDelay === 0 ? 0 : '--',
                                    requier: ''
                                },
                                {
                                    key: this.i18n.common_term_task_crate_c_path,
                                    text: (nodeData.sourceLocation !== undefined
                                        && nodeData.sourceLocation !== '') ? nodeData.sourceLocation : '--',
                                    requier: ''
                                },
                                {
                                    key: this.i18n.mission_create.kcore,
                                    text: nodeData.kcore ? this.i18n.process.enable : this.i18n.process.disable,
                                    requier: ''
                                },
                                {
                                    key: this.i18n.common_term_task_crate_collectFiles,
                                    text: nodeData.perfDataLimit,
                                    requier: ''
                                },
                            ];
                        }
                    } else if (analysisType === 'system_config') {
                        let type = '';
                        nodeData.task_param.type.forEach((item: string | number, index: number) => {
                            if (index < nodeData.task_param.type.length - 1) {
                                type += this.i18n.sys_cof.check_types[item] + this.i18n.sys.douhao;
                            } else {
                                type += this.i18n.sys_cof.check_types[item];
                            }
                        });
                        this.configList = [
                            {
                                key: this.i18n.task_name,
                                text: nodeData.taskname,
                                requier: ''
                            },

                            {
                                key: this.i18n.sys.type,
                                text: type,
                                requier: ''
                            },
                        ];

                    } else if (analysisType === 'process-thread-analysis') { // 进程线程
                        let type = '';
                        nodeData.task_param.type.forEach((item: string | number, index: number) => {
                            if (index < nodeData.task_param.type.length - 1) {
                                type += this.i18n.process[item] + this.i18n.sys.douhao;
                            } else {
                                type += this.i18n.process[item];
                            }
                        });
                        this.configList = [
                            {
                                key: this.i18n.task_name,
                                text: nodeData.taskname,
                                requier: ''
                            },
                            {
                                key: this.i18n.sys.interval,
                                text: nodeData.interval,
                                requier: ''
                            },
                            {
                                key: this.i18n.sys.duration,
                                text: nodeData.duration,
                                requier: ''
                            },
                            {
                                key: this.i18n.sys.type,
                                text: type,
                                requier: ''
                            },
                            {
                                key: this.i18n.process.trace,
                                text: nodeData['strace-analysis'] === 'enable' ? this.i18n.process.enable
                                    : this.i18n.process.disable,
                                requier: ''
                            },
                            {
                                key: this.i18n.process.tread,
                                text: nodeData.thread === 'enable' ? this.i18n.process.enable
                                    : this.i18n.process.disable,
                                requier: ''
                            },
                        ];
                    } else if (analysisType.indexOf('system_lock') > -1) {
                        const nameArr = [
                            { key: this.i18n.task_name, text: nodeData.taskname, requier: '' },
                        ];
                        const publicArr = [
                            { key: this.i18n.mission_modal.syslock.cpu_interval, text: nodeData.interval },
                            {
                                key: this.i18n.ddr.samplingRange,
                                text: Utils.formattingSamplingRange(this.i18n, nodeData.collect_range)
                            },
                            {
                                key: this.i18n.mission_modal.syslock.function,
                                text: nodeData.functionname.split('^_{,2}').join('') || '--',
                            },
                            {
                                key: this.i18n.mission_modal.lockSummary.filname,
                                text: nodeData.assemblyLocation || '--'
                            },
                            {
                                key: this.i18n.mission_modal.lockSummary.source_path,
                                text: nodeData.sourceLocation || '--'
                            },
                            {
                                key: this.i18n.falsesharing.filesize
                                    + ' '
                                    + this.i18n.ddr.leftParenthesis
                                    + 'MiB'
                                    + this.i18n.ddr.rightParenthesis,
                                text: nodeData.collect_file_size
                            },
                            {
                                key: this.i18n.mission_create.kcore,
                                text: nodeData.kcore ? this.i18n.process.enable : this.i18n.process.disable,
                                requier: ''
                            }
                        ];
                        let diffArr: { key: any; text: any; }[] = [];
                        if (nodeData['analysis-target'] === 'Profile System') {
                            diffArr = [
                                { key: this.i18n.mission_modal.syslock.duration, text: nodeData.duration }
                            ];
                        } else if (nodeData['analysis-target'] === 'Launch Application') {
                            diffArr = [
                                { key: this.i18n.mission_modal.cProcess.app_path, text: nodeData['app-dir'] || '--' },
                                {
                                    key: this.i18n.mission_modal.syslock.app_params,
                                    text: nodeData['app-parameters'] || '--'
                                }
                            ];
                        } else if (nodeData['analysis-target'] === 'Attach to Process') {
                            diffArr = [
                                {
                                    key: this.i18n.mission_create.process_alias,
                                    text: decodeURIComponent(nodeData.process_name) || '--',
                                },
                                {
                                    key: this.i18n.common_term_task_crate_pid,
                                    text: nodeData['target-pid'] || '--'
                                },
                                { key: this.i18n.mission_modal.syslock.duration, text: nodeData.duration }
                            ];
                        }
                        this.configList = [...nameArr, ...diffArr, ...publicArr];
                    } else if (analysisType.indexOf('mem_access') > -1) {  // 访存统计分析
                        const parentFormEl = new MemAnalysisModeForm();
                        parentFormEl.generateFormGroup();
                        parentFormEl.customForm({ formEl: parentFormEl });
                        const formEl = new MemAccessForm(); // 访存统计分析的表单参数
                        formEl.generateFormGroup();

                        const values = formEl.paramsToValues({ params: JSON.parse(JSON.stringify(nodeData)) });

                        parentFormEl.setValues({
                            values,
                            formEl: parentFormEl,
                            type: 'text',
                            i18n: this.i18n,
                        });
                        const parentFormElDisplayedElementList = parentFormEl.displayedElementList.filter(item => {
                            return !['analysisObject', 'analysisMode', 'analysisType'].includes(item);
                        });
                        const parentConfigList = parentFormElDisplayedElementList.map(item => {
                            const el = parentFormEl.form[item];
                            if (el.label === this.i18n.plugins_perf_tip_sysSet.accessAnalysisType) {
                                return {
                                    key: el.label,
                                    text: this.i18n.mission_create.mem,
                                    requier: '',
                                    order: el.order
                                };
                            } else {
                                return {
                                    key: el.label,
                                    text: [undefined, ''].includes(el.text) ? '--' : el.text,
                                    requier: '',
                                    order: el.order
                                };
                            }
                        }).sort((a, b) => a.order - b.order);

                        formEl.setValues({
                            values,
                            formEl,
                            type: 'text',
                            i18n: this.i18n
                        });
                        const configList = formEl.displayedElementList.map(item => {
                            const el = formEl.form[item];

                            return {
                                key: el.label,
                                text: [undefined, ''].includes(el.text) ? '--' : el.text,
                                requier: '',
                                order: el.order
                            };
                        }).sort((a, b) => a.order - b.order);

                        this.configList = [...parentConfigList, ...configList];
                        this.returnConfigInfo.emit({ formElList: [parentFormEl, formEl], values });
                    } else if (analysisType.indexOf('miss_event') > -1) {  // Miss事件统计
                        const parentFormEl = new MemAnalysisModeForm();
                        parentFormEl.generateFormGroup();
                        parentFormEl.customForm({ formEl: parentFormEl });
                        const formEl = new MissEventForm(this.customValidatorsService); // Miss事件统计的表单参数
                        formEl.generateFormGroup();

                        const values = formEl.paramsToValues({ params: JSON.parse(JSON.stringify(nodeData)) });
                        parentFormEl.setValues({
                            values,
                            formEl: parentFormEl,
                            type: 'text',
                            i18n: this.i18n,
                        });
                        const parentFormElDisplayedElementList = parentFormEl.displayedElementList.filter(item => {
                            return !['analysisObject', 'analysisMode', 'analysisType'].includes(item);
                        });
                        const parentConfigList: any = [];
                        parentFormElDisplayedElementList.map(item => {
                            if (['switchState', 'user_name', 'password'].indexOf(item) === -1) {
                                const el = parentFormEl.form[item];
                                if (el.label === this.i18n.sys_res.processName) {
                                    parentConfigList.push({
                                        key: el.label,
                                        text: [undefined, ''].includes(el.text) ? '--' : decodeURIComponent(el.text),
                                        requier: '',
                                        order: el.order
                                    });
                                } else if (el.label === this.i18n.plugins_perf_tip_sysSet.accessAnalysisType) {
                                    parentConfigList.push({
                                        key: el.label,
                                        text: this.i18n.mission_create.missEvent,
                                        requier: '',
                                        order: el.order
                                    });
                                } else {
                                    parentConfigList.push({
                                        key: el.label,
                                        text: [undefined, ''].includes(el.text) ? '--' : el.text,
                                        requier: '',
                                        order: el.order
                                    });
                                }
                            }
                        });
                        parentConfigList.sort((a: IParentConfig, b: IParentConfig) => a.order - b.order);
                        formEl.setAnalysisObject(values.analysisObject);
                        formEl.setValues({
                            values,
                            formEl,
                            type: 'text',
                            i18n: this.i18n
                        });
                        const configList = formEl.displayedElementList.map(item => {
                            const el = formEl.form[item];

                            return {
                                key: el.label,
                                text: [undefined, ''].includes(el.text) ? '--' : this.format(el.text),
                                requier: '',
                                order: el.order
                            };
                        }).sort((a, b) => a.order - b.order);
                        this.configList = [...parentConfigList, ...configList];
                        this.returnConfigInfo.emit({ formElList: [parentFormEl, formEl], values });
                    } else if (analysisType.indexOf('falsesharing') > -1) {  // 伪共享分析
                        const parentFormEl = new MemAnalysisModeForm();
                        parentFormEl.generateFormGroup();
                        parentFormEl.customForm({ formEl: parentFormEl });
                        const formEl: any = new FalseSharingForm(this.i18n, this.customValidatorsService); // 伪共享分析的表单参数
                        formEl.generateFormGroup();

                        const values = formEl.paramsToValues({ params: JSON.parse(JSON.stringify(nodeData)) });

                        parentFormEl.setValues({
                            values,
                            formEl: parentFormEl,
                            type: 'text',
                            i18n: this.i18n,
                        });
                        const parentFormElDisplayedElementList = parentFormEl.displayedElementList.filter(item => {
                            return !['analysisObject', 'analysisMode', 'analysisType'].includes(item);
                        });
                        const parentConfigList: any = [];
                        parentFormElDisplayedElementList.map(item => {
                            if (['switchState', 'user_name', 'password'].indexOf(item) === -1) {
                                const el = parentFormEl.form[item];
                                if (el.label === this.i18n.sys_res.processName) {
                                    parentConfigList.push({
                                        key: el.label,
                                        text: [undefined, ''].includes(el.text) ? '--' : decodeURIComponent(el.text),
                                        requier: '',
                                        order: el.order
                                    });
                                } else if (el.label === this.i18n.plugins_perf_tip_sysSet.accessAnalysisType) {
                                    parentConfigList.push({
                                        key: el.label,
                                        text: this.i18n.mission_create.falsesharing,
                                        requier: '',
                                        order: el.order
                                    });
                                } else {
                                    parentConfigList.push({
                                        key: el.label,
                                        text: [undefined, ''].includes(el.text) ? '--' : el.text,
                                        requier: '',
                                        order: el.order
                                    });
                                }
                            }
                        });
                        parentConfigList.sort((a: IParentConfig, b: IParentConfig) => a.order - b.order);
                        if (formEl.setAnalysisObject) {
                            formEl.setAnalysisObject(values.analysisObject);
                        }
                        formEl.setValues({
                            values,
                            formEl,
                            type: 'text',
                            i18n: this.i18n
                        });
                        const configList = formEl.displayedElementList.map((item: string | number) => {
                            const el = formEl.form[item];

                            return {
                                key: el.label,
                                text: [undefined, ''].includes(el.text) ? '--' : el.text,
                                requier: '',
                                order: el.order
                            };
                        }).sort((a: { order: number; }, b: { order: number; }) => a.order - b.order);
                        this.configList = [...parentConfigList, ...configList];
                        this.returnConfigInfo.emit({ formElList: [parentFormEl, formEl], values });
                    } else if (analysisType === 'ioperformance') {
                        this.configList = [
                            {
                                key: this.i18n.task_name,
                                text: nodeData.taskName,
                            },
                            {
                                key: this.i18n.sys.duration,
                                text: nodeData.duration,
                            },
                            {
                                key: this.i18n.storageIO.statistical,
                                text: nodeData.statistical,
                            },
                            {
                                key: this.i18n.falsesharing.filesize
                                    + ' '
                                    + this.i18n.ddr.leftParenthesis
                                    + 'MiB'
                                    + this.i18n.ddr.rightParenthesis,
                                text: nodeData.size ? nodeData.size : '--',
                                requier: ''
                            },
                            {
                                key: this.i18n.storageIO.callstack,
                                text: nodeData.stack === true ? this.i18n.process.enable : this.i18n.process.disable,
                            },
                        ];

                        if (nodeData.analysisTarget.indexOf('Launch') > -1) {
                            this.configList.splice(1, 0, {
                                key: this.i18n.common_term_task_crate_app_path,
                                text: nodeData['app-dir'] || nodeData.appDir || '--',
                                requier: ''
                            });
                            this.configList.splice(2, 0,
                                {
                                    key: this.i18n.common_term_task_crate_parameters,
                                    text: (nodeData['app-parameters'] !== undefined
                                        && nodeData['app-parameters'] !== '') ?
                                        nodeData['app-parameters'] : '--',
                                    requier: ''
                                });
                        } else if (nodeData.analysisTarget.indexOf('Attach') > -1) {
                            this.configList.splice(1, 0, {
                                key: this.i18n.common_term_task_crate_pid,
                                text: nodeData.targetPid || '--',
                                requier: ''
                            });
                            this.configList.splice(2, 0,
                                {
                                    key: this.i18n.mission_create.process_alias,
                                    text: decodeURIComponent(nodeData.process_name) || '--',
                                    requier: '',
                                });
                        }
                    } else if (analysisType.indexOf('hpc') > -1) {
                        this.configList = [
                            {
                                key: this.i18n.task_name,
                                text: nodeData.taskname,
                            },
                            {
                                key: this.i18n.mission_modal.hpc.duration,
                                text: data.data.duration,
                            },
                            {
                                key: this.i18n.mission_modal.hpc.label,
                                text: data.data.preset === 'default' ? this.i18n.mission_modal.hpc.all :
                                    data.data.preset === 'instruction-mix' ? this.i18n.mission_modal.hpc.orders :
                                        this.i18n.mission_modal.hpc.top_down,
                            },
                        ];
                        if (analysisTarget === 'Launch Application') {  // 应用
                            if (data.data.mpi_status) {
                                this.configList = [...this.configList, ...[
                                    {
                                        key: this.i18n.mission_modal.hpc.mission_create.collectionType,
                                        text: this.i18n.mission_modal.hpc.mpi,
                                    },
                                    {
                                        key: this.i18n.mission_modal.hpc.mpi_env_dir,
                                        text: data.data.mpi_env_dir || '--',
                                    },
                                    {
                                        key: this.i18n.mission_modal.hpc.mission_create.runNodes,
                                        text: data.data.master_ip || '--',
                                    },
                                    {
                                        key: this.i18n.mission_modal.hpc.rank,
                                        text: '',
                                    }
                                ]];
                                this.mipTableData.srcData.data = data.data?.hpc_mlt_rank_info.map((item: any) => {
                                    const nodeName = item.IP;
                                    const rank = item.rank;
                                    return {
                                        nodeName,
                                        rank
                                    };
                                });
                            } else {
                                this.configList = [
                                    ...this.configList,
                                    ...[
                                        {
                                            key: this.i18n.mission_modal.hpc.mission_create.collectionType,
                                            text: this.i18n.mission_modal.hpc.openMp,
                                        },
                                        {
                                            key: this.i18n.mission_modal.hpc.mission_create.openMpParams,
                                            text: data.data.open_mp_param || '--',
                                        },
                                    ]
                                ];
                            }
                        }
                        let appOrPidConfig: any[] = [];
                        if (nodeData['analysis-target'] === AnalysisTarget.LAUNCH_APPLICATION) {
                            appOrPidConfig = [
                                {
                                    key: this.i18n.common_term_task_crate_app_path,
                                    text: data.data['app-dir'] || data.data.appDir || '--',
                                },
                                {
                                    key: this.i18n.mission_modal.cProcess.app_params,
                                    text: nodeData['app-parameters'] || '--',
                                }
                            ];
                        } else if (nodeData['analysis-target'] === AnalysisTarget.ATTACH_TO_PROCESS) {
                            appOrPidConfig = [
                                {
                                    key: this.i18n.common_term_task_crate_pid,
                                    text: data.data.targetPid || data.data['target-pid'] || '--',
                                    requier: ''
                                },
                                {
                                    key: this.i18n.mission_create.process_alias,
                                    text: data.data.process_name || '--',
                                    requier: '',
                                },
                            ];
                        }
                        this.configList.splice(1, 0, ...appOrPidConfig);
                        this.returnConfigInfo.emit(data);
                    } else if (analysisType === 'memory_diagnostic') { // 诊断调试
                        this.returnConfigInfo.emit({
                            diagnosticType: nodeData.diagnosticType
                        });
                        let appOrPidConfig: any = [];
                        const isLaunch = data.data.analysisTarget === 'Launch Application';

                        if (isLaunch) {
                            appOrPidConfig = [
                                {
                                    key: this.i18n.common_term_task_crate_app_path,
                                    text: nodeData.appDir || '--',
                                    requier: '',
                                },
                                {
                                    key: this.i18n.mission_modal.cProcess.app_params,
                                    text: nodeData.appParameters || '--',
                                    requier: '',
                                }
                            ];
                        } else { // Attach 模式
                            appOrPidConfig = [
                                {
                                    key: this.i18n.mission_create.process_alias,
                                    text: nodeData.process_name || '--',
                                    requier: '',
                                },
                                {
                                    key: 'PID',
                                    text: nodeData.process_pid || '--',
                                    requier: '',
                                }
                            ];
                        }
                        if (this.status === 'Completed') {
                            const commonInfo = allNodeData[0].commonInfo;
                            this.timeData = [
                                {
                                    key: this.i18n.startTime,
                                    text: commonInfo.start_time || '--',
                                    requier: ''
                                },
                                {
                                    key: this.i18n.endTime,
                                    text: commonInfo.end_time || '--',
                                    requier: ''
                                },
                                {
                                    key: this.i18n.dataSize,
                                    text: commonInfo.size
                                        ? Utils.setThousandSeparator(commonInfo.size.replace(/MB/, '')) : '--',
                                    requier: ''
                                }
                            ];
                        } else {
                            this.timeData = [
                                {
                                    key: this.i18n.startTime,
                                    text: '--',
                                    requier: ''
                                },
                                {
                                    key: this.i18n.endTime,
                                    text: '--',
                                    requier: ''
                                },
                                {
                                    key: this.i18n.dataSize,
                                    text: '--',
                                    requier: ''
                                }
                            ];
                        }
                        const diagnosticType = nodeData.diagnosticType.map((item: string) => {
                            switch (item) {
                                case 'mem_leak':
                                    return this.i18n.diagnostic.taskParams.memory_leakage;
                                case 'mem_consume':
                                    return this.i18n.diagnostic.taskParams.memory_consumption;
                                case 'mem_exception':
                                    return this.i18n.diagnostic.taskParams.memory_abnormal;
                                case 'oom':
                                    return 'OOM';
                                default: return '';
                            }
                        }).join(',');
                        let collectStack = '';
                        if (nodeData.collectStack === false) {
                            collectStack = this.i18n.sys_cof.sum.close;
                        } else if (nodeData.collectStack === true) {
                            collectStack = this.i18n.sys_cof.sum.open;
                        } else {
                            collectStack = '--';
                        }
                        let stopException = '';
                        if (nodeData.stopException === false) {
                            stopException = this.i18n.sys_cof.sum.close;
                        } else if (nodeData.stopException === true) {
                            stopException = this.i18n.sys_cof.sum.open;
                        } else {
                            stopException = '--';
                        }
                        const interval: any[] = [];
                        if (nodeData.diagnosticType.includes('mem_consume')) {
                            interval.push({
                                key: this.i18n.diagnostic.taskParams.interval,
                                text: nodeData.interval || '--',
                                requier: ''
                            });
                        }
                        const isException = nodeData.diagnosticType.includes('mem_exception');
                        this.configList = [
                            {
                                key: this.i18n.task_name,
                                text: data.data.taskName,
                                requier: ''
                            },
                            ...appOrPidConfig,
                            {
                                key: this.i18n.diagnostic.taskParams.content_diagnose,
                                text: diagnosticType,
                                requier: ''
                            },
                            {
                                key: !isException ? this.i18n.diagnostic.taskParams.assemblyLocation : '',
                                text: nodeData.assemblyLocation || '--',
                                requier: ''
                            },
                            {
                                key: this.i18n.diagnostic.taskParams.sourceLocation,
                                text: nodeData.sourceLocation || '--',
                                requier: ''
                            },
                            {
                                key: !isException ? this.i18n.diagnostic.taskParams.samplingDelay : '',
                                text: nodeData.samplingDelay,
                                requier: '',
                                display: isLaunch ? 'inline-block' : 'none'
                            },
                            {
                                key: !isException ? this.i18n.diagnostic.taskParams.duration : '',
                                text: nodeData.duration || '--',
                                requier: ''
                            },
                            ...interval,
                            {
                                key: isException ? this.i18n.diagnostic.taskParams.stopException : '',
                                text: stopException,
                                requier: ''
                            },
                            {
                                key: !isException ? this.i18n.diagnostic.taskParams.collectStack : '',
                                text: collectStack,
                                requier: ''
                            },
                            {
                                key: this.i18n.diagnostic.taskParams.collectSize,
                                text: nodeData.collectSize || '--',
                                requier: ''
                            },
                            ...this.timeData
                        ];
                    }

                    if (analysisType === 'memory_diagnostic') {
                        analysisTarget = data.data.analysisTarget;
                    }

                    // 公共 info 部分
                    const info = {
                        nickName: { // 节点别名
                            key: this.i18n.common_term_another_nodename,
                            text: nodeNickName,
                            requier: ''
                        },
                        target: { // 分析对象
                            key: this.i18n.common_term_task_analysis_type,
                            text: analysisTypesDir[analysisType],
                            requier: ''
                        },
                        sys: { // 分析类型，系统
                            key: this.i18n.mission_create.analysisTarget,
                            text: this.i18n.common_term_projiect_task_system,
                            requier: ''
                        },
                        app: {  // 分析类型，应用
                            key: this.i18n.mission_create.analysisTarget,
                            text: this.i18n.common_term_task_crate_path,
                            requier: ''
                        },
                        mode: { // 当分析类型为‘应用’时，有分析模式
                            key: this.i18n.mission_create.mode,
                            text: analysisTarget,
                            requier: ''
                        },
                        appDir: {
                            key: this.i18n.common_term_task_crate_app_path,
                            text: nodeData && nodeData['app-dir'] ? nodeData['app-dir'] : '--',
                            requier: ''
                        },
                        appParams: {
                            key: this.i18n.common_term_task_crate_parameters,
                            text: nodeData && nodeData['app-parameters'] ? nodeData['app-parameters'] : '--',
                            requier: ''
                        },
                        pid: {
                            key: this.i18n.common_term_task_crate_pid,
                            text: nodeData && nodeData.pid ? nodeData.pid : '--',
                            requier: ''
                        },
                        pidName: {
                            key: this.i18n.mission_create.process_alias,
                            text: nodeData && nodeData.process_name ? decodeURIComponent(nodeData.process_name) : '--',
                            requier: ''
                        }
                    };
                    configInfo.push(info.nickName);
                    configInfo.push(info.target);
                    if (!analysisTarget || analysisTarget === 'Profile System') {
                        configInfo.push(info.sys);
                    } else {
                        configInfo.push(info.app);
                        configInfo.push(info.mode);
                        if (analysisType.indexOf('process-thread-analysis') > -1) {
                            if (analysisTarget === 'Launch Application') {
                                configInfo.push(info.appDir);
                                configInfo.push(info.appParams);
                            } else if (analysisTarget === 'Attach to Process') {
                                configInfo.push(info.pid);
                                configInfo.push(info.pidName);
                            }
                        }
                    }
                    for (let i = configInfo.length - 1; i >= 0; i--) {
                        this.configList.splice(1, 0, configInfo[i]);
                    }
                } else { // 联动分析任务信息
                    analysisType = 'task_contrast';
                    taskStatus = data.data.taskStatus || '--';
                    this.returnConfigInfo.emit({
                        LinkageStatus: taskStatus,
                    });
                    this.configList = [
                        {
                            key: this.i18n.task_name,
                            text: data.data.taskName,
                            requier: ''
                        },
                        {
                            key: this.i18n.common_term_task_type,
                            text: analysisTypesDir[data.data.analysisType] || '--',
                            requier: ''
                        },
                        {
                            key: this.i18n.linkage.taskCreateTime,
                            text: data.data.timeCreated,
                            requier: ''
                        },
                    ];
                    this.linkageData.data = data.data.taskDetail;
                }
                // 任务信息中新增任务状态和失败原因

                let taskInfo: TaskInfoItemType[] = [];
                if (taskStatus === 'Completed' || taskStatus === 'Cancelled') {
                    taskInfo = [{
                        key: this.i18n.common_term_task_status,
                        text: this.failtoText(taskStatus) || '--',
                        requier: '',
                        status: taskStatus,
                        taskcode: '',
                    }];
                } else {
                    taskInfo = [
                        {
                            key: this.i18n.common_term_task_status,
                            text: this.failtoText(taskStatus),
                            requier: '',
                            status: taskStatus,
                            taskcode: statusCode || '--',
                        },
                    ];
                }

                if (taskStatus !== 'Created' && taskStatus !== 'Failed' && taskStatus !== 'Cancelled') {
                    if (analysisType !== 'microarchitecture' && analysisType !== 'miss_event'
                        && analysisType !== 'task_contrast' && analysisType !== 'memory_diagnostic') {
                        this.getCommonTime();
                    }
                }
                this.configList.forEach((element, index) => {
                    if (element.key === this.i18n.common_term_another_nodename) {
                        this.configList.splice((index + 1), 0, taskInfo[0]);
                    }
                });
                // 大数据和分布式路径信息
                if ('sceneSolution' in nodeData) {
                    const sceneSolution = nodeData.sceneSolution;
                    if (sceneSolution !== 2) {
                        this.addNodeInfo({
                            key: nodeData.sceneSolution === 0 ? this.i18n.sys.scenes_dds : this.i18n.sys.scenes_bigData,
                            text: nodeData.configDir || '--',
                            requier: '',
                            status: '',
                            taskcode: '',
                        });
                    } else {
                        this.addNodeInfo({
                            key: this.i18n.sys.scenes_tracing,
                            text: nodeData.traceSwitch === true ? this.i18n.status_Yes : this.i18n.status_No,
                            requier: '',
                            status: '',
                            taskcode: '',
                        });
                        this.addNodeInfo({
                            key: this.i18n.sys.tracing_event,
                            text: nodeData.events || '--',
                            requier: '',
                            status: '',
                            taskcode: '',
                        });

                        this.addNodeInfo({
                            key: this.i18n.databaseConfig.port,
                            text: nodeData.sqlPort || '--',
                            requier: '',
                            status: '',
                            taskcode: '',
                        });
                        this.addNodeInfo({
                            key: this.i18n.databaseConfig.ip,
                            text: nodeData.sqlIp,
                            requier: '',
                            status: '',
                            taskcode: '',
                        });
                    }
                }
                // 采集Top活跃进程信息
                if ('topCheck' in nodeData) {
                    this.addNodeInfo({
                        key: this.i18n.sys.scenes_top,
                        text: nodeData.topCheck === true ? this.i18n.plugins_common_status_Yes
                            : this.i18n.plugins_common_status_No,
                        requier: '',
                        status: '',
                        taskcode: '',
                    });
                }
            }
            if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
                this.changeDetectorRef.markForCheck();
                this.changeDetectorRef.detectChanges();
            }
        });
    }

    /**
     * 添加任务信息节点
     */
    private addNodeInfo(info: { key: any; text: any; requier: string; status: string; taskcode: string; }) {
        this.configList.forEach((el, index) => {
            if (el.key === this.i18n.mission_create.analysisTarget) {
                this.configList.splice((index + 1), 0, info);
            }
        });
    }
    /**
     * 状态小圆点
     */
    public statusFormat(status: any) {
        let iconColor = '';
        switch (status) {
            case 'Completed':
                iconColor = 'analyzing-icon';
                break;
            case 'Failed':
                iconColor = 'failed-icon';
                break;
            case 'Cancelled':
                iconColor = 'failed-icon';
                break;
            case 'Created':
                iconColor = 'created-icon';
                break;
            default:
                break;
        }
        return iconColor;
    }
    /**
     * 失败原因转换文字
     */
    private failtoText(status: string) {
        let statusText;
        switch (status) {
            case 'Completed':
                statusText = this.i18n.status_Completed;
                break;
            case 'Failed':
                statusText = this.i18n.status_Failed;
                break;
            case 'Cancelled':
                statusText = this.i18n.status_Cancelled;
                break;
            case 'Created':
                statusText = this.i18n.status_NotStart;
                break;
            default:
                break;
        }
        return statusText;
    }
    /**
     * getAnalysisTarget
     */
    public getAnalysisTarget(taskInfo: any) {
        const missAnalysisTarget: any = {
            sys: 'Profile System',
            app: 'Launch Application',
            pid: 'Attach to Process'
        };
        if (taskInfo['analysis-type'] === 'miss_event') {
            return missAnalysisTarget[taskInfo.task_param.target];
        } else {
            return taskInfo['analysis-target'] || taskInfo.analysisTarget;
        }
    }

    /**
     * getCommonTime
     */
    public getCommonTime() {
        this.vscodeService.get({
            url: '/tasks/' + this.taskid + '/common/common-info/?node-id=' + this.nodeid
        }, (resp: any) => {
            if (resp.data) {
                this.timeData = [
                    {
                        key: this.i18n.startTime,
                        text: resp.data.start_time || '--',
                        requier: ''
                    },
                    {
                        key: this.i18n.endTime,
                        text: resp.data.end_time || '--',
                        requier: ''
                    },
                    {
                        key: this.i18n.dataSize,
                        text: resp.data.size ? Utils.setThousandSeparator(resp.data.size.replace(/MB/, '')) : '--',
                        requier: ''
                    }
                ];
                this.configList = this.configList.concat(this.timeData);
            }
            this.updateWebViewPage();
        });
    }
    /**
     * 格式化
     */
    public isInterval(text: string | any[]) {
        if (text && (text.includes(this.i18n.common_term_task_crate_interval_ms)
            || text.includes(this.i18n.falsesharing.filesize))) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * 显示失败原因
     * @param arrStatus 状态
     */
    public showFailReason(arrStatus: any) {
        if (!arrStatus) {
            this.arrStatus = true;
        } else {
            this.arrStatus = false;
        }
        this.updateWebViewPage();
    }

    private format(num: string) {
        const reg = /\d{1,3}(?=(\d{3})+$)/g;
        return (num + '').replace(reg, '$&,');
    }

    /**
     * IntellIj刷新webview页面
     */
    public updateWebViewPage() {
        if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
            this.zone.run(() => {
                this.changeDetectorRef.checkNoChanges();
                this.changeDetectorRef.detectChanges();
            });
        }
    }
}
