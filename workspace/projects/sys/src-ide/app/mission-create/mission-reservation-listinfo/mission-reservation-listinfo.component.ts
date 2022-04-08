import { Component, OnInit, Input } from '@angular/core';
import { I18nService } from '../../service/i18n.service';
import { AxiosService } from '../../service/axios.service';
import { ListInfoService } from '../../service/taskService/list-info.service';

import { BaseForm } from '../taskParams/BaseForm';
import { MemAnalysisModeForm } from '../taskParams/modules/MemAnalysisModeForm';
import { AllParams } from '../taskParams/AllParams';
import { Utils } from 'projects/sys/src-ide/app/service/utils.service';
import { AnalysisTarget } from 'projects/sys/src-ide/app/domain';

@Component({
    selector: 'app-mission-reservation-listinfo',
    templateUrl: './mission-reservation-listinfo.component.html',
    styleUrls: ['./mission-reservation-listinfo.component.scss'],
})
export class MissionReservationListinfoComponent implements OnInit {
    constructor(
        public i18nService: I18nService,
        private Axios: AxiosService,
        private listInfoService: ListInfoService
    ) {
        this.i18n = this.i18nService.I18n();
    }
    @Input() taskData: any;
    public i18n: any;
    public missionDetail: any;
    public cPs = 'Profile System';
    public cAtp = 'Attach to Process';
    public cLa = 'Launch Application';
    public configList = [];
    public missConfigList = [];
    public panelList = [];
    public ifShow = false;
    // 处理模板分析类型
    public taskType = {};
    public simplingArr = [
        { id: 'badSpeculation', text: 'Bad Speculation', tip: 'testtest' },
        { id: 'frontEndBound', text: 'Front-End Bound', tip: 'testtest' },
        {
            id: 'resourceBound',
            text: 'Back-End Bound->Resource Bound',
            tip: 'testtest',
        },
        { id: 'coreBound', text: 'Back-End Bound->Core Bound', tip: 'testtest' },
        {
            id: 'memoryBound',
            text: 'Back-End Bound->Memory Bound',
            tip: 'testtest',
        },
    ];
    // 字符串
    public strObj = {
        kcore: 'Associate Kernel Function with Assembly Code', // 内核函数关联汇编指令
    };
    /**
     * ngOnInit
     */
    ngOnInit() {
        // 详细任务条目名称
        this.missionDetail = [
            [
                [
                    // cPs
                    { title: this.i18n.mission_modal.cProcess.taskname },
                    { title: this.i18n.mission_modal.cProcess.analysis_type },
                    { title: this.i18n.mission_modal.cProcess.duration },
                    { title: this.i18n.mission_modal.cProcess.ready_cpu_num },
                    { title: this.i18n.mission_modal.cProcess.cpu_interval },
                    { title: this.i18n.mission_modal.cProcess.file_path },
                    { title: this.i18n.mission_modal.cProcess.source_path },
                ],
                [
                    // cAtp
                    { title: this.i18n.mission_modal.cProcess.taskname },
                    { title: this.i18n.mission_modal.cProcess.analysis_type },
                    { title: this.i18n.mission_modal.cProcess.pid },
                    { title: this.i18n.mission_modal.cProcess.duration },
                    { title: this.i18n.mission_modal.cProcess.cpu_interval },
                    { title: this.i18n.mission_modal.cProcess.file_path },
                    { title: this.i18n.mission_modal.cProcess.source_path },
                ],
                [
                    // cLa
                    { title: this.i18n.mission_modal.cProcess.taskname },
                    { title: this.i18n.mission_modal.cProcess.analysis_type },
                    { title: this.i18n.mission_modal.cProcess.app_params },
                    { title: this.i18n.mission_modal.cProcess.app_path },
                    { title: this.i18n.mission_modal.cProcess.cpu_interval },
                    { title: this.i18n.mission_modal.cProcess.file_path },
                    { title: this.i18n.mission_modal.cProcess.source_path },
                ],
            ],
            [
                [
                    { title: this.i18n.mission_modal.javaMix.taskname },
                    { title: this.i18n.mission_modal.javaMix.analysis_type },
                    { title: this.i18n.mission_modal.javaMix.pid },
                    { title: this.i18n.mission_modal.javaMix.duration },
                    { title: this.i18n.mission_modal.javaMix.cpu_interval },
                    { title: this.i18n.mission_modal.javaMix.java_path },
                ],
                [
                    { title: this.i18n.mission_modal.javaMix.taskname },
                    { title: this.i18n.mission_modal.javaMix.analysis_type },
                    { title: this.i18n.common_term_task_crate_app_path },
                    { title: this.i18n.mission_modal.javaMix.app_params },
                    { title: this.i18n.mission_modal.javaMix.cpu_interval },
                    { title: this.i18n.mission_modal.javaMix.java_path },
                ],
            ],
            [
                { title: this.i18n.mission_modal.process.taskname },
                { title: this.i18n.mission_modal.process.duration },
                { title: this.i18n.mission_modal.process.interval },
                { title: this.i18n.mission_modal.process.task_params },
                { title: this.i18n.mission_modal.process.pid },
                { title: this.i18n.mission_modal.process.straceAnalysis },
                { title: this.i18n.mission_modal.process.thread },
            ],
            [
                // ok
                { title: this.i18n.mission_modal.panoramic.taskname },
                { title: this.i18n.mission_modal.panoramic.interval },
                { title: this.i18n.mission_modal.panoramic.duration },
                { title: this.i18n.mission_modal.panoramic.task_params },
            ],
            [
                // ok
                { title: this.i18n.mission_modal.sysConfig.taskname },
                { title: this.i18n.mission_modal.sysConfig.task_params },
            ],
            [
                [
                    { title: this.i18n.mission_modal.sysSource.taskname },
                    { title: this.i18n.mission_modal.sysSource.analysis_type },
                    { title: this.i18n.mission_modal.sysSource.duration },
                    { title: this.i18n.mission_modal.sysSource.file_path },
                    { title: this.i18n.mission_modal.sysSource.source_path },
                ],
                [
                    { title: this.i18n.mission_modal.sysSource.taskname },
                    { title: this.i18n.mission_modal.sysSource.analysis_type },
                    { title: this.i18n.mission_modal.sysSource.pid },
                    { title: this.i18n.mission_modal.sysSource.duration },
                    { title: this.i18n.mission_modal.sysSource.file_path },
                    { title: this.i18n.mission_modal.sysSource.source_path },
                ],
                [
                    { title: this.i18n.mission_modal.sysSource.taskname },
                    { title: this.i18n.mission_modal.sysSource.analysis_type },
                    { title: this.i18n.common_term_task_crate_app_path },
                    { title: this.i18n.mission_modal.sysSource.app_params },
                    { title: this.i18n.mission_modal.sysSource.file_path },
                    { title: this.i18n.mission_modal.sysSource.source_path },
                ],
            ],
            [
                [
                    // mPs
                    { title: this.i18n.mission_modal.syslock.taskname },
                    { title: this.i18n.mission_modal.syslock.analysis_type },
                    { title: this.i18n.mission_modal.syslock.duration },
                    { title: this.i18n.mission_modal.syslock.cpu_interval },
                    { title: this.i18n.mission_modal.syslock.function },
                    { title: this.i18n.mission_modal.lockSummary.filname },
                    { title: this.i18n.mission_modal.lockSummary.source_path },
                ],
                [
                    // mAtp
                    { title: this.i18n.mission_modal.syslock.taskname },
                    { title: this.i18n.mission_modal.syslock.analysis_type },
                    { title: this.i18n.mission_modal.syslock.pid },
                    { title: this.i18n.mission_modal.syslock.duration },
                    { title: this.i18n.mission_modal.syslock.cpu_interval },
                    { title: this.i18n.mission_modal.syslock.function },
                    { title: this.i18n.mission_modal.lockSummary.filname },
                    { title: this.i18n.mission_modal.lockSummary.source_path },
                ],
                [
                    // mLa
                    { title: this.i18n.mission_modal.syslock.taskname },
                    { title: this.i18n.mission_modal.syslock.analysis_type },
                    { title: this.i18n.mission_modal.syslock.app_params },
                    { title: this.i18n.mission_modal.syslock.app_path },
                    { title: this.i18n.mission_modal.syslock.cpu_interval },
                    { title: this.i18n.mission_modal.syslock.function },
                    { title: this.i18n.mission_modal.lockSummary.filname },
                    { title: this.i18n.mission_modal.lockSummary.source_path },
                ],
            ],
            [
                { title: this.i18n.mission_modal.memAccess.taskname },
                { title: this.i18n.mission_modal.memAccess.interval },
                { title: this.i18n.mission_modal.memAccess.duration },
                { title: this.i18n.mission_modal.sysConfig.task_params },
            ],
        ];
        this.taskType = {
            net: this.i18n.sys.net,
            cpu: this.i18n.sys.cpu,
            mem: this.i18n.sys.mem,
            disk: this.i18n.sys.disk,
            hard: this.i18n.sys_cof.check_types.hard,
            soft: this.i18n.sys_cof.check_types.soft,
            env: this.i18n.sys_cof.check_types.env,
            cache_access: this.i18n.ddr.types.cache_access,
            ddr_access: this.i18n.ddr.types.ddr_access,
            context: this.i18n.process.context,
        };
        this.open();
        this.listInfoService.getMessage().subscribe((res) => { });
    }

    /**
     * 根据 taskInfo 返回 analysisTarget
     */
    public getAnalysisTarget({ taskInfo }) {
        const missAnalysisTarget = {
            sys: 'Profile System',
            app: 'Launch Application',
            pid: 'Attach to Process',
        };
        if (taskInfo['analysis-type'] === 'miss_event') {
            return missAnalysisTarget[taskInfo.task_param.target];
        } else {
            return taskInfo['analysis-target'] || taskInfo.analysisTarget;
        }
    }

    /**
     * 根据 taskInfo 返回分析类型
     */
    public getAnalysisType({ taskInfo }) {
        return taskInfo['analysis-type'] || taskInfo.analysisType;
    }

    /**
     * 根据 template 计算出显示信息【目前只有访存分析在使用】
     */
    public calcTemplateInfo(
        formEl,
        template,
        listNotDisplay = ['analysisObject', 'analysisType']
    ) {
        const templateInfo: any = {};
        const parentFormEl = new MemAnalysisModeForm();
        parentFormEl.generateFormGroup();
        parentFormEl.customForm({ formEl: parentFormEl });

        const values = formEl.paramsToValues({
            params: JSON.parse(JSON.stringify(template)),
        });
        const configList = [];

        parentFormEl.setValues({
            values,
            formEl: parentFormEl,
            type: 'text',
            i18n: this.i18n,
        });
        const parentFormElDisplayedElementList =
            parentFormEl.displayedElementList.filter((item) => {
                return !listNotDisplay.includes(item);
            });
        configList.push(
            ...parentFormElDisplayedElementList
                .map((item) => {
                    const el = parentFormEl.form[item];

                    return {
                        key: el.label,
                        text: [undefined, ''].includes(el.text) ? '--' : el.text,
                        requier: '',
                        order: el.order,
                    };
                })
                .sort((a, b) => a.order - b.order)
        );

        if (formEl.setAnalysisObject) {
            formEl.setAnalysisObject(values.analysisObject);
        }
        formEl.setValues({
            values,
            formEl,
            type: 'text',
            i18n: this.i18n,
        });
        configList.push(
            ...formEl.displayedElementList
                .filter((item) => {
                    return !listNotDisplay.includes(item);
                })
                .map((item) => {
                    const el = formEl.form[item];

                    return {
                        key: el.label,
                        text: [undefined, ''].includes(el.text) ? '--' : el.text,
                        requier: '',
                        order: el.order,
                    };
                })
                .sort((a, b) => a.order - b.order)
        );

        templateInfo.configList = configList;

        // 添加节点参数
        if (formEl.hasNodeConfig) {
            const nodeEditList = formEl.getNodeConfigKeys({
                analysisObject: values.analysisObject,
                analysisMode: values.analysisMode,
            });

            templateInfo.panelList = template.nodeConfig.map((node) => {
                const nodeFormEL = new BaseForm();
                const allParamsClone = nodeFormEL.deepClone(new AllParams().allParams);

                nodeFormEL.displayOrder = nodeEditList;
                nodeFormEL.displayedElementList = nodeEditList;
                nodeEditList.forEach((key) => {
                    nodeFormEL.form[key] = allParamsClone[key];
                });
                nodeFormEL.generateFormGroup();

                const nodeValues = formEl.paramsToValues({
                    params: node.task_param,
                });

                nodeFormEL.setValues({
                    values: nodeValues,
                    formEl: nodeFormEL,
                    type: 'text',
                    i18n: this.i18n,
                });

                return nodeFormEL.displayedElementList
                    .map((item) => {
                        const el = nodeFormEL.form[item];

                        return {
                            key: el.label,
                            text: [undefined, ''].includes(el.text) ? '--' : el.text,
                            requier: '',
                            order: el.order,
                        };
                    })
                    .sort((a, b) => a.order - b.order);
            });
        }

        return templateInfo;
    }

    /**
     * open
     */
    public open() {
        this.ifShow = true;
        const taskData = this.taskData;
        const analysisType = taskData['analysis-type'] || taskData.analysisType;
        if (analysisType.indexOf('C++') > -1) {
            let nameArr = [
                { key: this.i18n.task_name, text: taskData.taskname, requier: '' },
            ];
            if (taskData['analysis-target'] !== 'Profile System') {
                nameArr = [
                    { key: this.i18n.task_name, text: taskData.taskname, requier: '' },
                    {
                        key: this.i18n.ddr.analysisMode,
                        text: taskData['analysis-target'],
                        requier: '',
                    }, // 分析类型
                ];
            }

            const publicArr1 = [
                {
                    key: this.i18n.mission_modal.syslock.cpu_interval,
                    text: taskData.interval,
                }, // 采样间隔（毫秒）
                {
                    key: this.i18n.ddr.samplingRange,
                    text: Utils.formattingSamplingRange(
                        this.i18n,
                        taskData.samplingSpace.label
                    ),
                }, // 采样范围
            ];
            const publicArr2 = [
                {
                    key: this.i18n.mission_modal.lockSummary.filname,
                    text: taskData.assemblyLocation || '--',
                }, // 符号文件路径
                {
                    key: this.i18n.mission_modal.lockSummary.source_path,
                    text: taskData.sourceLocation || '--',
                }, // C/C++源文件路径
                {
                    // 采集文件大小
                    key:
                        this.i18n.falsesharing.filesize +
                        ' ' +
                        this.i18n.ddr.leftParenthesis +
                        'MiB' +
                        this.i18n.ddr.rightParenthesis,
                    text: taskData.size,
                },
                {
                    key: this.i18n.mission_create.kcore,
                    text: taskData.kcore
                        ? this.i18n.process.enable
                        : this.i18n.process.disable,
                    requier: '',
                },
            ];
            let diffArr1 = [];
            let diffArr2 = [];
            if (taskData['analysis-target'] === 'Profile System') {
                diffArr1 = [
                    {
                        key: this.i18n.mission_modal.syslock.duration,
                        text: taskData.duration,
                    },
                ]; // 采样时长
                diffArr2 = [
                    {
                        key: this.i18n.micarch.cpu_kernel,
                        text: taskData['cpu-mask'] || '--',
                    },
                ]; // 待采样CPU核
            } else if (taskData['analysis-target'] === 'Launch Application') {
                diffArr1 = [
                    {
                        key: this.i18n.mission_modal.cProcess.app_path,
                        text: taskData['app-dir'],
                    },
                    {
                        key: this.i18n.mission_modal.syslock.app_params,
                        text: taskData['app-parameters'] || '--',
                    },
                ];
            } else if (taskData['analysis-target'] === 'Attach to Process') {
                diffArr1 = [
                    {
                        key: this.i18n.mission_create.process_alias,
                        text: decodeURIComponent(taskData.process_name) || '--',
                    },
                    {
                        key: this.i18n.common_term_task_crate_pid,
                        text: taskData['target-pid'] || '--',
                    },
                    {
                        key: this.i18n.mission_modal.syslock.duration,
                        text: taskData.duration,
                    },
                ];
            }
            this.configList = [
                ...nameArr,
                ...diffArr1,
                ...publicArr1,
                ...diffArr2,
                ...publicArr2,
            ];
            if (taskData['analysis-target'] === 'Launch Application') {
                this.panelList = taskData.nodeConfig.map((item: any, index: any) => {
                    return [
                        {
                            key: this.i18n.common_term_task_crate_app_path,
                            text: item.task_param['app-dir'] || '--',
                            requier: '',
                        },
                        {
                            key: this.i18n.common_term_task_crate_parameters,
                            text: item.task_param['app-parameters'] || '--',
                            requier: '',
                        },
                        {
                            key: this.i18n.common_term_task_crate_bs_path,
                            text: item.task_param.assemblyLocation || '--',
                            requier: '',
                        },
                        {
                            key: this.i18n.common_term_task_crate_c_path,
                            text: item.task_param.sourceLocation || '--',
                            requier: '',
                        },
                    ];
                });
            } else if (taskData['analysis-target'] === 'Attach to Process') {
                this.panelList = taskData.nodeConfig.map((item: any, index: any) => {
                    return [
                        {
                            key: this.i18n.common_term_task_crate_pid,
                            text:
                                item.task_param['target-pid'] !== undefined &&
                                    item.task_param['target-pid'] !== ''
                                    ? item.task_param['target-pid']
                                    : '--',
                            requier: '',
                        },
                        {
                            key: this.i18n.mission_create.process_alias,
                            text:
                                item.task_param.process_name !== undefined &&
                                    item.task_param.process_name !== ''
                                    ? item.task_param.process_name
                                    : '--',
                            requier: '',
                        },
                        {
                            key: this.i18n.common_term_task_crate_bs_path,
                            text: item.task_param.assemblyLocation || '--',
                            requier: '',
                        },
                        {
                            key: this.i18n.common_term_task_crate_c_path,
                            text: item.task_param.sourceLocation || '--',
                            requier: '',
                        },
                    ];
                });
            } else if (taskData['analysis-target'] === 'Profile System') {
                this.panelList = taskData.nodeConfig.map((item: any, index: any) => {
                    return [
                        {
                            key: this.i18n.ddr.cpuToBeSamples,
                            text: item.task_param['cpu-mask'] || '--',
                            requier: '',
                        },
                        {
                            key: this.i18n.common_term_task_crate_bs_path,
                            text: item.task_param.assemblyLocation || '--',
                            requier: '',
                        },
                        {
                            key: this.i18n.common_term_task_crate_c_path,
                            text: item.task_param.sourceLocation || '--',
                            requier: '',
                        },
                    ];
                });
            }
        } else if (analysisType.indexOf('java') > -1) {
            let nameArr = [
                { key: this.i18n.task_name, text: taskData.taskname, requier: '' },
            ];
            if (taskData['analysis-target'] !== 'Profile System') {
                nameArr = [
                    { key: this.i18n.task_name, text: taskData.taskname, requier: '' },
                    {
                        key: this.i18n.ddr.analysisMode,
                        text: taskData['analysis-target'],
                        requier: '',
                    }, // 分析类型
                ];
            }
            const publicArr = [
                {
                    key: this.i18n.mission_modal.syslock.cpu_interval,
                    text: taskData.interval,
                }, // 采样间隔（毫秒）
                {
                    key: this.i18n.ddr.samplingRange,
                    text: Utils.formattingSamplingRange(
                        this.i18n,
                        taskData.samplingSpace.label
                    ),
                }, // 采样范围
                {
                    key: this.i18n.common_term_task_crate_java_path,
                    text: taskData.javaSoucreLocation || '--',
                }, // Java源文件路径
                {
                    // 采集文件大小
                    key:
                        this.i18n.falsesharing.filesize +
                        ' ' +
                        this.i18n.ddr.leftParenthesis +
                        'MiB' +
                        this.i18n.ddr.rightParenthesis,
                    text: taskData.size,
                },
            ];
            let diffArr = [];
            if (taskData['analysis-target'] === 'Launch Application') {
                diffArr = [
                    {
                        key: this.i18n.mission_modal.cProcess.app_path,
                        text: taskData['app-dir'],
                    },
                    {
                        key: this.i18n.mission_modal.syslock.app_params,
                        text: taskData['app-parameters'],
                    },
                ];
                this.panelList = taskData.nodeConfig.map((item) => {
                    return [
                        {
                            key: this.i18n.common_term_task_crate_app_path,
                            text: item.task_param['app-dir'] || '--',
                            requier: '',
                        },
                        {
                            key: this.i18n.common_term_task_crate_parameters,
                            text: item.task_param['app-parameters'] || '--',
                            requier: '',
                        },
                        {
                            key: this.i18n.common_term_task_crate_java_path,
                            text: item.task_param.javaSoucreLocation || '--',
                            requier: '',
                        },
                    ];
                });
            } else if (taskData['analysis-target'] === 'Attach to Process') {
                diffArr = [
                    {
                        key: this.i18n.mission_create.process_alias,
                        text: decodeURIComponent(taskData.process_name) || '--',
                    },
                    {
                        key: this.i18n.common_term_task_crate_pid,
                        text: taskData['target-pid'] || '--',
                    },
                    {
                        key: this.i18n.mission_modal.syslock.duration,
                        text: taskData.duration,
                    }, // 采样时长
                ];
                this.panelList = taskData.nodeConfig.map((item) => {
                    return [
                        {
                            key: this.i18n.common_term_task_crate_pid,
                            text: item.task_param['target-pid'] || '--',
                            requier: '',
                        },
                        {
                            key: this.i18n.common_term_task_crate_java_path,
                            text: item.task_param.javaSoucreLocation || '--',
                            requier: '',
                        },
                    ];
                });
            }
            this.configList = [...nameArr, ...diffArr, ...publicArr];
        } else if (analysisType === 'system') {
            this.configList = [
                {
                    key: this.i18n.task_name,
                    text: taskData.taskname,
                },
                {
                    key: this.i18n.sys.interval,
                    text: taskData.interval,
                },
                {
                    key: this.i18n.sys.duration,
                    text: taskData.duration,
                },
            ];
        } else if (analysisType.indexOf('resource') > -1) {
            // 资源调度
            let nameArr = [
                { key: this.i18n.task_name, text: taskData.taskname, requier: '' },
            ];
            if (taskData['analysis-target'] !== 'Profile System') {
                nameArr = [
                    { key: this.i18n.task_name, text: taskData.taskname, requier: '' },
                    {
                        key: this.i18n.ddr.analysisMode,
                        text: taskData['analysis-target'],
                        requier: '',
                    }, // 分析类型
                ];
            }
            const publicArr = [
                {
                    key: this.i18n.mission_modal.lockSummary.filname,
                    text: taskData.assemblyLocation || '--',
                }, // 符号文件路径
                {
                    // 采集文件大小
                    key:
                        this.i18n.falsesharing.filesize +
                        ' ' +
                        this.i18n.ddr.leftParenthesis +
                        'MiB' +
                        this.i18n.ddr.rightParenthesis,
                    text: taskData.size,
                },
            ];
            let diffArr = [];
            if (taskData['analysis-target'] === 'Profile System') {
                diffArr = [
                    {
                        key: this.i18n.mission_modal.syslock.duration,
                        text: taskData.duration,
                    },
                ]; // 采样时长
                this.panelList = taskData.nodeConfig.map((item) => {
                    return [
                        {
                            key: this.i18n.common_term_task_crate_bs_path,
                            text: item.task_param.assemblyLocation || '--',
                            requier: '',
                        },
                    ];
                });
            } else if (taskData['analysis-target'] === 'Launch Application') {
                diffArr = [
                    {
                        key: this.i18n.common_term_task_crate_app_path,
                        text: taskData['app-dir'],
                    }, // 应用
                    {
                        key: this.i18n.common_term_task_crate_parameters,
                        text: taskData['app-parameters'] || '--',
                    }, // 应用参数
                ];
                this.panelList = taskData.nodeConfig.map((item) => {
                    return [
                        {
                            key: this.i18n.common_term_task_crate_app_path,
                            text: item.task_param['app-dir'] || '--',
                            requier: '',
                        },
                        {
                            key: this.i18n.common_term_task_crate_parameters,
                            text: item.task_param['app-parameters'] || '--',
                            requier: '',
                        },
                        {
                            key: this.i18n.common_term_task_crate_bs_path,
                            text: item.task_param.assemblyLocation || '--',
                            requier: '',
                        },
                    ];
                });
            } else if (taskData['analysis-target'] === 'Attach to Process') {
                diffArr = [
                    {
                        key: this.i18n.mission_create.process_alias,
                        text: decodeURIComponent(taskData['process-name']) || '--',
                    },
                    {
                        key: this.i18n.common_term_task_crate_pid,
                        text: taskData['target-pid'] || '--',
                    },
                    {
                        key: this.i18n.mission_modal.syslock.duration,
                        text: taskData.duration,
                    }, // 采样时长
                ];
                this.panelList = taskData.nodeConfig.map((item) => {
                    return [
                        {
                            key: this.i18n.common_term_task_crate_pid,
                            text: item.task_param['target-pid'] || '--',
                            requier: '',
                        },
                        {
                            key: this.i18n.mission_create.process_alias,
                            text: item.task_param['process-name'] || '--',
                            requier: '',
                        },
                        {
                            key: this.i18n.common_term_task_crate_bs_path,
                            text: item.task_param.assemblyLocation || '--',
                            requier: '',
                        },
                    ];
                });
            }
            this.configList = [...nameArr, ...diffArr, ...publicArr];
        } else if (analysisType === 'microarchitecture') {
            let simplingIndex = '';
            let samplingSpace = '';
            this.simplingArr.forEach((val) => {
                if (taskData.analysisIndex.indexOf(val.id) > -1) {
                    simplingIndex += ',' + val.text;
                }
            });
            if (simplingIndex) {
                simplingIndex = simplingIndex.slice(1);
            } else {
                simplingIndex = '--';
            }

            if (taskData.samplingSpace === 'all') {
                samplingSpace = this.i18n.micarch.typeItem_all;
            } else if (taskData.samplingSpace === 'user') {
                samplingSpace = this.i18n.micarch.typeItem_user;
            } else if (taskData.samplingSpace === 'kernel') {
                samplingSpace = this.i18n.micarch.typeItem_kernel;
            } else {
                samplingSpace = '--';
            }

            if (taskData.analysisTarget.indexOf('Launch') > -1) {
                let nameArr = [];
                if (taskData['analysis-target'] !== 'Profile System') {
                    nameArr = [
                        {
                            // 分析类型
                            key: this.i18n.ddr.analysisMode,
                            text: taskData.analysisTarget,
                            requier: '',
                        },
                    ];
                }
                this.configList = [
                    {
                        key: this.i18n.task_name,
                        text: taskData.taskName,
                        requier: '',
                    },
                    ...nameArr,
                    {
                        key: this.i18n.common_term_task_crate_app_path,
                        text: taskData.appDir || '--',
                        requier: '',
                    },
                    {
                        key: this.i18n.common_term_task_crate_parameters,
                        text: taskData.appParameters || '--',
                        requier: '',
                    },
                    {
                        key: this.i18n.micarch.label.simpling,
                        text: taskData.samplingMode || '--',
                        requier: '',
                    },
                    {
                        key: this.i18n.sys.duration,
                        text: taskData.duration || '--',
                        requier: '',
                    },
                    {
                        key: this.i18n.mission_modal.syslock.cpu_interval,
                        text: taskData.interval || '--',
                        requier: '',
                    },
                    {
                        key: this.i18n.micarch.label.analysis,
                        text: simplingIndex,
                        requier: '',
                    },
                    {
                        key: this.i18n.micarch.label.typeItem,
                        text: samplingSpace,
                        requier: '',
                    },
                    {
                        key: this.i18n.micarch.simpling_delay,
                        text: taskData.samplingDelay
                            ? taskData.samplingDelay
                            : taskData.samplingDelay === 0
                                ? 0
                                : '--',
                        requier: '',
                    },
                    {
                        key: this.i18n.mission_create.kcore,
                        text: taskData.kcore
                            ? this.i18n.process.enable
                            : this.i18n.process.disable,
                        requier: '',
                    },
                    {
                        key: this.i18n.common_term_task_crate_c_path,
                        text:
                            taskData.sourceLocation !== undefined &&
                                taskData.sourceLocation !== ''
                                ? taskData.sourceLocation
                                : '--',
                        requier: '',
                    },
                ];
                this.panelList = taskData.nodeConfig.map((item) => {
                    return [
                        {
                            key: this.i18n.common_term_task_crate_app_path,
                            text: item.taskParam.appDir || '--',
                            requier: '',
                        },
                        {
                            key: this.i18n.common_term_task_crate_parameters,
                            text: item.taskParam.appParameters || '--',
                            requier: '',
                        },
                        {
                            key: this.i18n.common_term_task_crate_c_path,
                            text: item.taskParam.sourceLocation || '--',
                            requier: '',
                        },
                    ];
                });
            } else if (taskData.analysisTarget.indexOf('Profile') > -1) {
                let nameArr = [];
                if (taskData['analysis-target'] !== 'Profile System') {
                    nameArr = [
                        {
                            // 分析类型
                            key: this.i18n.ddr.analysisMode,
                            text: taskData.analysisTarget,
                            requier: '',
                        },
                    ];
                }
                this.configList = [
                    {
                        key: this.i18n.task_name,
                        text: taskData.taskName,
                        requier: '',
                    },
                    ...nameArr,
                    {
                        key: this.i18n.micarch.label.simpling,
                        text: taskData.samplingMode || '--',
                        requier: '',
                    },
                    {
                        key: this.i18n.sys.duration,
                        text: taskData.duration || '--',
                        requier: '',
                    },
                    {
                        key: this.i18n.mission_modal.syslock.cpu_interval,
                        text: taskData.interval || '--',
                        requier: '',
                    },
                    {
                        key: this.i18n.micarch.label.analysis,
                        text: simplingIndex,
                        requier: '',
                    },
                    {
                        key: this.i18n.micarch.cpu_kernel,
                        text: taskData.cpuMask
                            ? taskData.cpuMask
                            : taskData.cpuMask === 0
                                ? 0
                                : '--',
                        requier: '',
                    },
                    {
                        key: this.i18n.micarch.label.typeItem,
                        text: samplingSpace,
                        requier: '',
                    },
                    {
                        key: this.i18n.micarch.simpling_delay,
                        text: taskData.samplingDelay
                            ? taskData.samplingDelay
                            : taskData.samplingDelay === 0
                                ? 0
                                : '--',
                        requier: '',
                    },
                    {
                        key: this.i18n.mission_create.kcore,
                        text: taskData.kcore
                            ? this.i18n.process.enable
                            : this.i18n.process.disable,
                        requier: '',
                    },
                    {
                        key: this.i18n.common_term_task_crate_c_path,
                        text:
                            taskData.sourceLocation !== undefined &&
                                taskData.sourceLocation !== ''
                                ? taskData.sourceLocation
                                : '--',
                        requier: '',
                    },
                ];
                this.panelList = taskData.nodeConfig.map((item) => {
                    return [
                        {
                            key: this.i18n.micarch.cpu_kernel,
                            text: item.taskParam.cpuMask || '--',
                            requier: '',
                        },
                        {
                            key: this.i18n.common_term_task_crate_c_path,
                            text: item.taskParam.sourceLocation || '--',
                            requier: '',
                        },
                    ];
                });
            } else if (taskData.analysisTarget.indexOf('Attach') > -1) {
                let nameArr = [];
                if (taskData['analysis-target'] !== 'Profile System') {
                    nameArr = [
                        {
                            // 分析类型
                            key: this.i18n.ddr.analysisMode,
                            text: taskData.analysisTarget,
                            requier: '',
                        },
                    ];
                }
                this.configList = [
                    {
                        key: this.i18n.task_name,
                        text: taskData.taskName,
                        requier: '',
                    },
                    ...nameArr,
                    {
                        key: this.i18n.mission_create.process_alias,
                        text: decodeURIComponent(taskData.process_name) || '--',
                        requier: '',
                    },
                    {
                        key: this.i18n.common_term_task_crate_pid,
                        text: taskData.targetPid || '--',
                        requier: '',
                    },
                    {
                        key: this.i18n.micarch.label.simpling,
                        text: taskData.samplingMode || '--',
                        requier: '',
                    },
                    {
                        key: this.i18n.sys.duration,
                        text: taskData.duration || '--',
                        requier: '',
                    },
                    {
                        key: this.i18n.mission_modal.syslock.cpu_interval,
                        text: taskData.interval || '--',
                        requier: '',
                    },
                    {
                        key: this.i18n.micarch.label.analysis,
                        text: simplingIndex,
                        requier: '',
                    },
                    {
                        key: this.i18n.micarch.label.typeItem,
                        text: samplingSpace,
                        requier: '',
                    },
                    {
                        key: this.i18n.micarch.simpling_delay,
                        text: taskData.samplingDelay
                            ? taskData.samplingDelay
                            : taskData.samplingDelay === 0
                                ? 0
                                : '--',
                        requier: '',
                    },
                    {
                        key: this.i18n.mission_create.kcore,
                        text: taskData.kcore
                            ? this.i18n.process.enable
                            : this.i18n.process.disable,
                        requier: '',
                    },
                    {
                        key: this.i18n.common_term_task_crate_c_path,
                        text:
                            taskData.sourceLocation !== undefined &&
                                taskData.sourceLocation !== ''
                                ? taskData.sourceLocation
                                : '--',
                        requier: '',
                    },
                ];
                this.panelList = taskData.nodeConfig.map((item) => {
                    return [
                        {
                            key: this.i18n.mission_create.process_alias,
                            text: decodeURIComponent(taskData.process_name) || '--',
                            requier: '',
                        },
                        {
                            key: this.i18n.common_term_task_crate_pid,
                            text: item.taskParam.targetPid || '--',
                            requier: '',
                        },
                        {
                            key: this.i18n.common_term_task_crate_c_path,
                            text: item.taskParam.sourceLocation || '--',
                            requier: '',
                        },
                    ];
                });
            }
        } else if (analysisType === 'system_config') {
            let a = '';
            taskData.task_param.type.forEach((item, index) => {
                if (index < taskData.task_param.type.length - 1) {
                    a += this.i18n.sys_cof.check_types[item] + this.i18n.sys.douhao;
                } else {
                    a += this.i18n.sys_cof.check_types[item];
                }
            });
            this.configList = [
                {
                    key: this.i18n.task_name,
                    text: taskData.taskname,
                    requier: '',
                },

                {
                    key: this.i18n.sys.type,
                    text: a,
                    requier: '',
                },
            ];
        } else if (analysisType === 'process-thread-analysis') {
            // 进程线程
            let a = '';
            taskData.task_param.type.forEach((typeItem, index) => {
                if (index < taskData.task_param.type.length - 1) {
                    a += this.taskType[typeItem] + this.i18n.sys.douhao;
                } else {
                    a += this.taskType[typeItem];
                }
            });
            let nameArr = [
                { key: this.i18n.task_name, text: taskData.taskname, requier: '' },
            ];
            if (taskData['analysis-target'] !== 'Profile System') {
                nameArr = [
                    { key: this.i18n.task_name, text: taskData.taskname, requier: '' },
                    {
                        key: this.i18n.ddr.analysisMode,
                        text: taskData.nodeConfig[0].task_param['analysis-target'],
                        requier: '',
                    },
                ];
            }
            const publicArr = [
                {
                    // 采样时长
                    key: this.i18n.sys.duration,
                    text: taskData.duration,
                    requier: '',
                },
                {
                    // 采样间隔
                    key: this.i18n.sys.interval,
                    text: taskData.interval,
                    requier: '',
                },
                {
                    // 采样类型
                    key: this.i18n.sys.type,
                    text: a,
                    requier: '',
                },
                {
                    // 采集线程信息
                    key: this.i18n.mission_modal.process.thread,
                    text:
                        taskData.thread === 'enable'
                            ? this.i18n.process.enable
                            : this.i18n.process.disable,
                    requier: '',
                },
            ];
            let diffArr = [];
            if (
                taskData.nodeConfig[0].task_param['analysis-target'] ===
                'Launch Application'
            ) {
                diffArr = [
                    {
                        key: this.i18n.mission_modal.cProcess.app_path,
                        text:
                            taskData.nodeConfig.length &&
                                taskData.nodeConfig[0].task_param &&
                                taskData.nodeConfig[0].task_param['app-dir']
                                ? taskData.nodeConfig[0].task_param['app-dir']
                                : '',
                        requier: '',
                    },
                    {
                        key: this.i18n.mission_modal.syslock.app_params,
                        text:
                            taskData.nodeConfig.length &&
                                taskData.nodeConfig[0].task_param &&
                                taskData.nodeConfig[0].task_param['app-parameters']
                                ? taskData.nodeConfig[0].task_param['app-parameters']
                                : '--',
                        requier: '',
                    },
                ];
                publicArr.push({
                    // 跟踪系统调用
                    key: this.i18n.process.trace,
                    text:
                        taskData['strace-analysis'] === 'enable'
                            ? this.i18n.process.enable
                            : this.i18n.process.disable,
                    requier: '',
                });
            } else if (
                taskData.nodeConfig[0].task_param['analysis-target'] ===
                'Attach to Process'
            ) {
                diffArr = [
                    {
                        key: this.i18n.mission_create.process_alias,
                        text: decodeURIComponent(taskData.process_name) || '--',
                        requier: '',
                    },
                    {
                        key: this.i18n.common_term_task_crate_pid,
                        text: taskData.pid || '--',
                        requier: '',
                    },
                ];
                publicArr.push({
                    // 跟踪系统调用
                    key: this.i18n.process.trace,
                    text:
                        taskData['strace-analysis'] === 'enable'
                            ? this.i18n.process.enable
                            : this.i18n.process.disable,
                    requier: '',
                });
            }
            this.configList = [...nameArr, ...diffArr, ...publicArr];
            if (taskData['analysis-target'] === 'Launch Application') {
                this.panelList = taskData.nodeConfig.map((item: any, index: any) => {
                    return [
                        {
                            key: this.i18n.common_term_task_crate_app_path,
                            text: item.task_param['app-dir'] || '--',
                            requier: '',
                        },
                        {
                            key: this.i18n.common_term_task_crate_parameters,
                            text: item.task_param['app-parameters'] || '--',
                            requier: '',
                        },
                    ];
                });
            } else if (taskData['analysis-target'] === 'Attach to Process') {
                this.panelList = taskData.nodeConfig.map((item: any, index: any) => {
                    return [
                        {
                            key: this.i18n.common_term_task_crate_pid,
                            text: item.task_param.targetPid || '--',
                            requier: '',
                        },
                        {
                            key: this.i18n.common_term_task_crate_processName,
                            text: item.task_param.process_name || '--',
                            requier: '',
                        },
                    ];
                });
            }
        } else if (analysisType.indexOf('system_lock') > -1) {
            // 锁与等待
            let nameArr = [
                { key: this.i18n.task_name, text: taskData.taskname, requier: '' },
            ];
            if (taskData['analysis-target'] !== 'Profile System') {
                nameArr = [
                    { key: this.i18n.task_name, text: taskData.taskname, requier: '' },
                    {
                        key: this.i18n.ddr.analysisMode,
                        text: taskData['analysis-target'],
                        requier: '',
                    }, // 分析类型
                ];
            }

            const publicArr = [
                {
                    key: this.i18n.mission_modal.syslock.cpu_interval,
                    text: taskData.interval,
                },
                {
                    key: this.i18n.ddr.samplingRange,
                    text: Utils.formattingSamplingRange(
                        this.i18n,
                        taskData.collect_range
                    ),
                },
                {
                    key: this.i18n.mission_modal.syslock.function,
                    text: taskData.functionname.split('^_{,2}').join('') || '--',
                },
                {
                    key: this.i18n.mission_modal.lockSummary.filname,
                    text: taskData.assemblyLocation || '--',
                },
                {
                    key: this.i18n.mission_modal.lockSummary.source_path,
                    text: taskData.sourceLocation || '--',
                },
                {
                    key:
                        this.i18n.falsesharing.filesize +
                        ' ' +
                        this.i18n.ddr.leftParenthesis +
                        'MiB' +
                        this.i18n.ddr.rightParenthesis,
                    text: taskData.collect_file_size,
                },
                {
                    key: this.i18n.mission_create.kcore,
                    text: taskData.kcore
                        ? this.i18n.process.enable
                        : this.i18n.process.disable,
                    requier: '',
                },
            ];
            let diffArr = [];
            if (taskData['analysis-target'] === 'Profile System') {
                diffArr = [
                    {
                        key: this.i18n.mission_modal.syslock.duration,
                        text: taskData.duration,
                    },
                ];
            } else if (taskData['analysis-target'] === 'Launch Application') {
                diffArr = [
                    {
                        key: this.i18n.mission_modal.cProcess.app_path,
                        text: taskData['app-dir'],
                    },
                    {
                        key: this.i18n.mission_modal.syslock.app_params,
                        text: taskData['app-parameters'] || '--',
                    },
                ];
            } else if (taskData['analysis-target'] === 'Attach to Process') {
                diffArr = [
                    {
                        key: this.i18n.mission_create.process_alias,
                        text: decodeURIComponent(taskData.process_name) || '--',
                    },
                    {
                        key: this.i18n.common_term_task_crate_pid,
                        text: taskData['target-pid'] || '--',
                    },
                    {
                        key: this.i18n.mission_modal.syslock.duration,
                        text: taskData.duration,
                    },
                ];
            }
            this.configList = [...nameArr, ...diffArr, ...publicArr];
            if (taskData['analysis-target'] === 'Launch Application') {
                this.panelList = taskData.nodeConfig.map((item: any, index: any) => {
                    return [
                        {
                            key: this.i18n.common_term_task_crate_app_path,
                            text: item.task_param['app-dir'] || '--',
                            requier: '',
                        },
                        {
                            key: this.i18n.common_term_task_crate_parameters,
                            text: item.task_param['app-parameters'] || '--',
                            requier: '',
                        },
                        {
                            key: this.i18n.mission_modal.lockSummary.filname,
                            text: item.task_param.assemblyLocation || '--',
                            requier: '',
                        },
                        {
                            key: this.i18n.common_term_task_crate_c_path,
                            text: item.task_param.sourceLocation || '--',
                            requier: '',
                        },
                    ];
                });
            } else if (taskData['analysis-target'] === 'Attach to Process') {
                this.panelList = taskData.nodeConfig.map((item: any, index: any) => {
                    return [
                        {
                            key: this.i18n.common_term_task_crate_pid,
                            text:
                                item.task_param['target-pid'] !== undefined &&
                                    item.task_param['target-pid'] !== ''
                                    ? item.task_param['target-pid']
                                    : '--',
                            requier: '',
                        },
                        {
                            key: this.i18n.mission_create.process_alias,
                            text:
                                item.task_param.process_name !== undefined &&
                                    item.task_param.process_name !== ''
                                    ? item.task_param.process_name
                                    : '--',
                            requier: '',
                        },
                        {
                            key: this.i18n.mission_modal.lockSummary.filname,
                            text: item.task_param.assemblyLocation || '--',
                            requier: '',
                        },
                        {
                            key: this.i18n.common_term_task_crate_c_path,
                            text: item.task_param.sourceLocation || '--',
                            requier: '',
                        },
                    ];
                });
            } else if (taskData['analysis-target'] === 'Profile System') {
                this.panelList = taskData.nodeConfig.map((item: any, index: any) => {
                    return [
                        {
                            key: this.i18n.mission_modal.lockSummary.filname,
                            text: item.task_param.assemblyLocation || '--',
                            requier: '',
                        },
                        {
                            key: this.i18n.common_term_task_crate_c_path,
                            text: item.task_param.sourceLocation || '--',
                            requier: '',
                        },
                    ];
                });
            }
        } else if (analysisType === 'system') {
            let scenesTitle = '';
            if (this.taskData.hasOwnProperty('sceneSolution')) {
                scenesTitle =
                    this.taskData.sceneSolution === 0
                        ? this.i18n.sys.scenes_dds
                        : this.i18n.sys.scenes_bigData;
            }
            this.configList = [
                {
                    key: this.i18n.task_name,
                    text: taskData.taskname,
                },
                {
                    key: this.i18n.sys.interval,
                    text: this.Axios.setThousandSeparator(taskData.interval) || '--',
                },
                {
                    key: this.i18n.sys.duration,
                    text: taskData.duration || '--',
                },
                {
                    key: scenesTitle,
                    text: taskData.configDir || '--',
                    ifShow: taskData.hasOwnProperty('configDir'),
                },
                {
                    key: this.i18n.sys.scenes_top,
                    text: taskData.topCheck || false,
                },
            ];
        } else if (analysisType === 'mem_access') {
            // 访存统计分析
            let a = '';
            taskData.task_param.type.forEach((typeItem, index) => {
                if (index < taskData.task_param.type.length - 1) {
                    a += this.taskType[typeItem] + this.i18n.sys.douhao;
                } else {
                    a += this.taskType[typeItem];
                }
            });
            const publicArr = [
                { key: this.i18n.task_name, text: taskData.taskname, requier: '' },
                {
                    key: this.i18n.ddr.accessAnalysisType,
                    text: this.i18n.mission_create.mem,
                    requier: '',
                }, // 访存分析类型
                {
                    // 采样时长
                    key: this.i18n.sys.duration,
                    text: taskData.duration,
                    requier: '',
                },
                {
                    // 采样间隔
                    key: this.i18n.sys.interval,
                    text: taskData.interval,
                    requier: '',
                },
                {
                    // 采样类型
                    key: this.i18n.sys.type,
                    text: a,
                    requier: '',
                },
            ];
            this.configList = [...publicArr];
            this.panelList = this.configList;
        } else if (analysisType === 'miss_event') { // Miss事件统计
            let nameArr = [
                { key: this.i18n.task_name, text: taskData.taskname, requier: '' },
            ];
            if (taskData['analysis-target'] !== 'Profile System') {
                nameArr = [
                    { key: this.i18n.task_name, text: taskData.taskname, requier: '' },
                    {
                        // 分析类型
                        key: this.i18n.ddr.analysisMode,
                        text:
                            taskData.task_param.target === 'app'
                                ? 'Launch Application'
                                : 'Attach to Process',
                        requier: '',
                    },
                    {
                        key: this.i18n.ddr.accessAnalysisType,
                        text: this.i18n.mission_create.missEvent,
                        requier: '',
                    }, // 访存分析类型
                ];
            }
            const publicArr1 = [
                {
                    // 采样时长
                    key: this.i18n.sys.duration,
                    text: taskData.task_param.duration,
                    requier: '',
                },
                {
                    // 采样间隔（指令数）
                    key:
                        this.i18n.sys.interval +
                        this.i18n.ddr.leftParenthesis +
                        this.i18n.common_term_task_tab_summary_instructions +
                        this.i18n.ddr.rightParenthesis,
                    text: taskData.task_param.period,
                    requier: '',
                },
                {
                    // 指标类型
                    key: this.i18n.ddr.indicatorType,
                    text: taskData.task_param.metrics,
                    requier: '',
                },
            ];
            const publicArr2 = [
                {
                    // 采样范围
                    key: this.i18n.ddr.samplingRange,
                    text: Utils.formattingSamplingRange(
                        this.i18n,
                        taskData.task_param.space
                    ),
                    requier: '',
                },
                {
                    // 延迟采样时长
                    key: this.i18n.ddr.collectionDelay,
                    text: Utils.formattingSamplingRange(
                        this.i18n,
                        taskData.task_param.startDelay
                    ),
                    requier: '',
                },
                {
                    // C/C++源文件路径
                    key: this.i18n.mission_modal.lockSummary.source_path,
                    text: taskData.task_param.srcDir || '--',
                    requier: '',
                },
                {
                    // 采集文件大小
                    key:
                        this.i18n.falsesharing.filesize +
                        ' ' +
                        this.i18n.ddr.leftParenthesis +
                        'MiB' +
                        this.i18n.ddr.rightParenthesis,
                    text: taskData.task_param.perfDataLimit,
                    requier: '',
                },
                {
                    key: this.i18n.mission_create.kcore,
                    text: taskData.task_param.kcore
                        ? this.i18n.process.enable
                        : this.i18n.process.disable,
                    requier: '',
                },
            ];
            let diffArr1 = [];
            let diffArr2 = [];
            if (taskData.task_param.target === 'sys') {
                diffArr2 = [
                    {
                        key: this.i18n.micarch.cpu_kernel,
                        text: taskData.task_param.cpu || '--',
                        requier: '',
                    },
                ]; // 待采样CPU核
                this.panelList = taskData.nodeConfig.map((item: any, index: any) => {
                    return [
                        {
                            key: this.i18n.ddr.cpuToBeSamples,
                            text: item.task_param.task_param.cpu || '--',
                            requier: '',
                        },
                        {
                            key: this.i18n.common_term_task_crate_c_path,
                            text: item.task_param.task_param.srcDir || '--',
                            requier: '',
                        },
                    ];
                });
            } else if (taskData.task_param.target === 'app') {
                diffArr1 = [
                    {
                        // 应用路径
                        key: this.i18n.mission_modal.cProcess.app_path,
                        text: taskData.task_param.app,
                        requier: '',
                    },
                    {
                        key: this.i18n.mission_modal.syslock.app_params,
                        text: taskData.task_param.appArgs || '--',
                        requier: '',
                    },
                ];
                this.panelList = taskData.nodeConfig.map((item: any, index: any) => {
                    return [
                        {
                            key: this.i18n.common_term_task_crate_app_path,
                            text: item.task_param.task_param.app || '--',
                            requier: '',
                        },
                        {
                            key: this.i18n.mission_modal.cProcess.app_params,
                            text: item.task_param.task_param.appArgs || '--',
                            requier: '',
                        },
                        {
                            key: this.i18n.common_term_task_crate_c_path,
                            text: item.task_param.task_param.srcDir || '--',
                            requier: '',
                        },
                    ];
                });
            } else if (taskData.task_param.target === 'pid') {
                diffArr1 = [
                    {
                        key: this.i18n.mission_create.process_alias,
                        text: decodeURIComponent(taskData.task_param.process_name) || '--',
                        requier: '',
                    },
                    {
                        key: this.i18n.common_term_task_crate_pid,
                        text: taskData.task_param.pid || '--',
                        requier: '',
                    },
                ];
                this.panelList = taskData.nodeConfig.map((item: any, index: any) => {
                    return [
                        {
                            key: this.i18n.sys_res.processName,
                            text: item.task_param.task_param.process_name || '--',
                            requier: '',
                        },
                        {
                            key: this.i18n.common_term_task_crate_pid,
                            text: item.task_param.task_param.pid || '--',
                            requier: '',
                        },
                        {
                            key: this.i18n.common_term_task_crate_c_path,
                            text: item.task_param.task_param.srcDir || '--',
                            requier: '',
                        },
                    ];
                });
            }
            this.configList = [
                ...nameArr,
                ...diffArr1,
                ...publicArr1,
                ...diffArr2,
                ...publicArr2,
            ];
        } else if (analysisType === 'falsesharing') {
            // 伪共享分析
            let nameArr = [
                { key: this.i18n.task_name, text: taskData.taskname, requier: '' },
            ];
            if (taskData['analysis-target'] !== 'Profile System') {
                nameArr = [
                    { key: this.i18n.task_name, text: taskData.taskname, requier: '' },
                    {
                        // 分析类型
                        key: this.i18n.ddr.analysisMode,
                        text: taskData['analysis-target'],
                        requier: '',
                    },
                    {
                        key: this.i18n.ddr.accessAnalysisType,
                        text: this.i18n.mission_create.falsesharing,
                        requier: '',
                    }, // 访存分析类型
                ];
            }
            const publicArr = [
                {
                    // 采样时长
                    key: this.i18n.sys.duration,
                    text: taskData.duration,
                    requier: '',
                },
                {
                    // 采样间隔（指令数）
                    key:
                        this.i18n.sys.interval +
                        this.i18n.ddr.leftParenthesis +
                        this.i18n.common_term_task_tab_summary_instructions +
                        this.i18n.ddr.rightParenthesis,
                    text: taskData.period,
                    requier: '',
                },
                {
                    // 待采样CPU核
                    key: this.i18n.micarch.cpu_kernel,
                    text: taskData.cpuMask || '--',
                    requier: '',
                },
                {
                    // 采样范围
                    key: this.i18n.ddr.samplingRange,
                    text: Utils.formattingSamplingRange(
                        this.i18n,
                        taskData.samplingSpace
                    ),
                    requier: '',
                },
                {
                    // 延迟采样时长
                    key: this.i18n.ddr.collectionDelay,
                    text: taskData.samplingDelay,
                    requier: '',
                },
                {
                    // 符号文件路径
                    key: this.i18n.mission_modal.lockSummary.filname,
                    text: taskData.assemblyLocation || '--',
                    requier: '',
                },
                {
                    // C/C++源文件路径
                    key: this.i18n.mission_modal.lockSummary.source_path,
                    text: taskData.sourceLocation || '--',
                    requier: '',
                },
                {
                    // 采集文件大小
                    key:
                        this.i18n.falsesharing.filesize +
                        ' ' +
                        this.i18n.ddr.leftParenthesis +
                        'MiB' +
                        this.i18n.ddr.rightParenthesis,
                    text: taskData.filesize,
                    requier: '',
                },
                {
                    key: this.i18n.mission_create.kcore,
                    text: taskData.kcore
                        ? this.i18n.process.enable
                        : this.i18n.process.disable,
                    requier: '',
                },
            ];
            let diffArr = [];
            if (taskData['analysis-target'] === 'Launch Application') {
                diffArr = [
                    {
                        // 应用路径
                        key: this.i18n.mission_modal.cProcess.app_path,
                        text: taskData.appDir,
                        requier: '',
                    },
                    {
                        key: this.i18n.mission_modal.syslock.app_params,
                        text: taskData.appParameters || '--',
                        requier: '',
                    },
                ];
                this.panelList = taskData.nodeConfig.map((item: any, index: any) => {
                    return [
                        {
                            key: this.i18n.common_term_task_crate_app_path,
                            text: item.task_param.appDir || '--',
                            requier: '',
                        },
                        {
                            key: this.i18n.common_term_task_crate_parameters,
                            text: item.task_param.appParameters || '--',
                            requier: '',
                        },
                        {
                            key: this.i18n.ddr.cpuToBeSamples,
                            text: item.task_param.cpuMask || '--',
                            requier: '',
                        },
                        {
                            key: this.i18n.mission_modal.lockSummary.filname,
                            text: item.task_param.assemblyLocation || '--',
                            requier: '',
                        },
                        {
                            key: this.i18n.common_term_task_crate_c_path,
                            text: item.task_param.sourceLocation || '--',
                            requier: '',
                        },
                        {
                            key: this.i18n.common_term_task_crate_collectFiles,
                            text: item.task_param.filesize || '--',
                            requier: '',
                        },
                    ];
                });
            } else if (taskData['analysis-target'] === 'Attach to Process') {
                diffArr = [
                    {
                        key: this.i18n.mission_create.process_alias,
                        text: decodeURIComponent(taskData.process_name) || '--',
                        requier: '',
                    },
                    {
                        key: this.i18n.common_term_task_crate_pid,
                        text: taskData.pid || '--',
                        requier: '',
                    },
                ];
                this.panelList = taskData.nodeConfig.map((item: any, index: any) => {
                    return [
                        {
                            key: this.i18n.sys_res.processName,
                            text: item.task_param.process_name || '--',
                            requier: '',
                        },
                        {
                            key: this.i18n.common_term_task_crate_pid,
                            text: item.task_param.pid || '--',
                            requier: '',
                        },
                        {
                            key: this.i18n.ddr.cpuToBeSamples,
                            text: item.task_param.cpuMask || '--',
                            requier: '',
                        },
                        {
                            key: this.i18n.mission_modal.lockSummary.filname,
                            text: item.task_param.assemblyLocation || '--',
                            requier: '',
                        },
                        {
                            key: this.i18n.common_term_task_crate_c_path,
                            text: item.task_param.sourceLocation || '--',
                            requier: '',
                        },
                        {
                            key: this.i18n.common_term_task_crate_collectFiles,
                            text: item.task_param.filesize || '--',
                            requier: '',
                        },
                    ];
                });
            } else {
                this.panelList = taskData.nodeConfig.map((item: any, index: any) => {
                    return [
                        {
                            key: this.i18n.ddr.cpuToBeSamples,
                            text: item.task_param.cpuMask || '--',
                            requier: '',
                        },
                        {
                            key: this.i18n.mission_modal.lockSummary.filname,
                            text: item.task_param.assemblyLocation || '--',
                            requier: '',
                        },
                        {
                            key: this.i18n.common_term_task_crate_c_path,
                            text: item.task_param.sourceLocation || '--',
                            requier: '',
                        },
                        {
                            key: this.i18n.common_term_task_crate_collectFiles,
                            text: item.task_param.filesize || '--',
                            requier: '',
                        },
                    ];
                });
            }
            this.configList = [...nameArr, ...diffArr, ...publicArr];
        } else if (analysisType === 'ioperformance') {
            this.configList = [
                {
                    key: this.i18n.task_name,
                    text: taskData.taskName,
                },
                {
                    key: this.i18n.sys.duration,
                    text: taskData.duration,
                },
                {
                    key: this.i18n.storageIO.statistical,
                    text: taskData.statistical,
                },
                {
                    key:
                        this.i18n.falsesharing.filesize +
                        ' ' +
                        this.i18n.ddr.leftParenthesis +
                        'MiB' +
                        this.i18n.ddr.rightParenthesis,
                    text: taskData.size ? taskData.size : '--',
                    requier: '',
                },
                {
                    key: this.i18n.storageIO.callstack,
                    text:
                        taskData.stack === true
                            ? this.i18n.process.enable
                            : this.i18n.process.disable,
                },
            ];

            if (taskData.analysisTarget.indexOf('Launch') > -1) {
                this.configList.splice(
                    1,
                    0,
                    {
                        key: this.i18n.ddr.analysisMode,
                        text: taskData.analysisTarget,
                        requier: '',
                    },
                    {
                        key: this.i18n.common_term_task_crate_app_path,
                        text: taskData['app-dir'] || taskData.appDir || '--',
                        requier: '',
                    },
                    {
                        key: this.i18n.common_term_task_crate_parameters,
                        text:
                            taskData['app-parameters'] !== undefined &&
                                taskData['app-parameters'] !== ''
                                ? taskData['app-parameters']
                                : '--',
                        requier: '',
                    }
                );
                this.panelList = taskData.nodeConfig.map((item: any, index: any) => {
                    return [
                        {
                            key: this.i18n.common_term_task_crate_app_path,
                            text: item.taskParam['app-dir'] || '--',
                            requier: '',
                        },
                        {
                            key: this.i18n.common_term_task_crate_parameters,
                            text: item.taskParam['app-parameters'] || '--',
                            requier: '',
                        },
                    ];
                });
            } else if (taskData.analysisTarget.indexOf('Attach') > -1) {
                this.configList.splice(
                    1,
                    0,
                    {
                        key: this.i18n.ddr.analysisMode,
                        text: taskData.analysisTarget,
                        requier: '',
                    },
                    {
                        key: this.i18n.common_term_task_crate_pid,
                        text: taskData.targetPid || '--',
                        requier: '',
                    },
                    {
                        key: this.i18n.mission_create.process_alias,
                        text: decodeURIComponent(taskData.process_name) || '--',
                        requier: '',
                    }
                );
                this.configList.splice(2, 0, {
                    key: this.i18n.mission_create.process_alias,
                    text: decodeURIComponent(taskData.process_name) || '--',
                    requier: '',
                });
                this.panelList = taskData.nodeConfig.map((item: any, index: any) => {
                    return [
                        {
                            key: this.i18n.common_term_task_crate_pid,
                            text: item.taskParam.targetPid || '--',
                            requier: '',
                        },
                        {
                            key: this.i18n.mission_create.process_alias,
                            text: item.taskParam.process_name || '--',
                            requier: '',
                        },
                    ];
                });
            }
        } else if (analysisType.indexOf('hpc') > -1) {
            if (taskData['analysis-target'].includes('Launch')) {
                this.configList = [
                    {
                        key: this.i18n.ddr.analysisMode,
                        text: taskData['analysis-target'],
                    },
                    {
                        key: this.i18n.mission_modal.hpc.duration,
                        text: taskData.duration,
                    },
                    {
                        key: this.i18n.mission_modal.hpc.label,
                        text: taskData.preset === 'default' ? this.i18n.mission_modal.hpc.all :
                            taskData.preset === 'instruction-mix' ? this.i18n.mission_modal.hpc.orders :
                                this.i18n.mission_modal.hpc.top_down,
                    },
                    {
                        key: this.i18n.hpc.mission_create.collectionType,
                        text: taskData.mpi_status ? 'MPI' : 'OpenMP',
                    },
                    {
                        key: this.i18n.hpc.mission_create.openMpParams,
                        text: taskData.open_mp_param || '--',
                    }
                ];

                if (taskData['analysis-target'] === 'Launch Application') {
                    this.panelList = taskData.nodeConfig.map((item: any, index: any) => {
                        return [
                            {
                                key: this.i18n.common_term_task_crate_app_path,
                                text: item.task_param['app-dir'] || '--',
                            },
                            {
                                key: this.i18n.common_term_task_crate_parameters,
                                text: item.task_param['app-parameters'] || '--',
                            },
                            {
                                key: this.i18n.hpc.mission_create.openMpParams,
                                text: item.task_param.open_mp_param || '--',
                            },
                        ];
                    });
                }

            } else {
                this.configList = [
                    {
                        key: this.i18n.mission_modal.hpc.duration,
                        text: taskData.duration,
                    },
                    {
                        key: this.i18n.mission_modal.hpc.label,
                        text:
                            taskData.preset === 'default'
                                ? this.i18n.mission_modal.hpc.all
                                : taskData.preset === 'instruction-mix'
                                    ? this.i18n.mission_modal.hpc.orders
                                    : this.i18n.mission_modal.hpc.top_down,
                    },
                ];
                if (taskData['analysis-target'] === 'Attach to Process') {
                    this.configList.unshift({
                        key: this.i18n.ddr.analysisMode,
                        text: taskData['analysis-target'],
                    });
                    this.panelList = taskData.nodeConfig.map((item: any, index: any) => {
                        return [
                            {
                                key: this.i18n.common_term_task_crate_pid,
                                text: item.task_param.targetPid || '--',
                            },
                            {
                                key: this.i18n.mission_create.process_alias,
                                text: decodeURIComponent(item.task_param.process_name) || '--',
                            },
                        ];
                    });
                }
            }

            if (taskData['analysis-target'].indexOf('Launch') > -1) {
                this.configList.splice(
                    2,
                    0,
                    {
                        key: this.i18n.common_term_task_crate_app_path,
                        text: taskData['app-dir'] || taskData.appDir || '--',
                    },
                    {
                        key: this.i18n.common_term_task_crate_parameters,
                        text:
                            taskData['app-parameters'] !== undefined &&
                                taskData['app-parameters'] !== ''
                                ? taskData['app-parameters']
                                : '--',
                    }
                );
            } else if (
                taskData['analysis-target'] === AnalysisTarget.ATTACH_TO_PROCESS
            ) {
                this.configList.splice(
                    2,
                    0,
                    {
                        key: this.i18n.common_term_task_crate_processName,
                        text: taskData?.process_name || '--',
                        requier: '',
                    },
                    {
                        key: this.i18n.common_term_task_crate_pid,
                        text: taskData?.targetPid || taskData?.['target-pid'] || '--',
                        requier: '',
                    }
                );
            }
        }
        const info = [
            {
                // 是否是周期
                key: this.i18n.preSwitch.colectMethods,
                text: taskData.cycle
                    ? this.i18n.preSwitch.duraColect
                    : this.i18n.preSwitch.onceColect,
                requier: '',
            },
            {
                key: this.i18n.preSwitch.pointTime,
                text: taskData.targetTime,
                requier: '',
            },
            {
                key: this.i18n.preSwitch.pointDuration,
                text: this.handleColectDate(taskData),
                requier: '',
            },
        ];
        this.configList = [...this.configList, ...info];
    }

    /**
     * close
     */
    public close() { }

    /**
     * 处理采集日期
     * @param obj obj
     */
    public handleColectDate(obj) {
        return obj.cycle
            ? obj.cycleStart && obj.cycleStart
                ? obj.cycleStart.split('-').join('/') +
                '一' +
                obj.cycleStop.split('-').join('/')
                : ''
            : obj.appointment
                ? obj.appointment.split('-').join('/')
                : '';
    }

    /**
     * handleObj
     * @param val val
     */
    handleObj(val) {
        let arr = [];
        arr = val.type.map((item) => {
            return this.taskType[item];
        });
        return arr.join(',');
    }
}
