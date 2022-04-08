import {
    Component,
    OnInit,
    Input,
    ViewChild,
    Output,
    EventEmitter,
    NgZone,
    ChangeDetectorRef,
} from '@angular/core';
import { I18nService } from '../../service/i18n.service';
import {
    VscodeService,
    COLOR_THEME,
    currentTheme,
} from '../../service/vscode.service';
import { TiTableRowData, TiTableSrcData, TiTableColumns } from '@cloud/tiny3';

import { BaseForm } from '../taskParams/BaseForm';
import { MemAnalysisModeForm } from '../taskParams/modules/MemAnalysisModeForm';
import { MemAccessForm } from '../taskParams/modules/MemAccessForm';
import { AllParams } from '../taskParams/AllParams';
import { AnalysisTarget } from 'projects/sys/src-ide/app/domain';
import { UrlService } from 'projects/sys/src-ide/app/service/url.service';

@Component({
    selector: 'app-mission-templates',
    templateUrl: './mission-templates.component.html',
    styleUrls: ['./mission-templates.component.scss'],
})
export class MissionTemplatesComponent implements OnInit {
    private url: any;
    constructor(
        public i18nService: I18nService,
        public vscodeService: VscodeService,
        private urlService: UrlService,
        private zone: NgZone,
        private changeDetectorRef: ChangeDetectorRef
    ) {
        this.url = this.urlService.Url();
        // vscode颜色主题
        this.currTheme = currentTheme();
        this.vscodeService.regVscodeMsgHandler('colorTheme', (msg: any) => {
            this.currTheme = msg.colorTheme;
        });
        this.i18n = this.i18nService.I18n();
        this.analysisTypesDir = [
            {
                name: this.i18n.mission_create.sysPro,
                type: 'system',
            },
            {
                name: this.i18n.mission_create.sysConfig,
                type: 'system_config',
            },
            {
                name: this.i18n.mission_create.resSchedule,
                type: 'resource_schedule',
            },
            {
                name: this.i18n.mission_create.structure,
                type: 'microarchitecture',
            },
            {
                name: this.i18n.mission_create.mem,
                type: 'mem_access',
            },
            {
                name: this.i18n.mission_create.process,
                type: 'process-thread-analysis',
            },
            {
                name: this.i18n.mission_create.missEvent,
                type: 'miss_event',
            },
            {
                name: this.i18n.mission_create.cPlusPlus,
                type: 'C/C++ Program',
            },
            {
                name: this.i18n.mission_create.lock,
                type: 'system_lock',
            },
            {
                name: this.i18n.mission_create.java,
                type: 'java-mixed-mode',
            },
            {
                name: this.i18n.mission_create.io,
                type: 'ioperformance',
            },
            {
                name: this.i18n.mission_create.hpc,
                type: 'hpc_analysis',
            },
        ];
    }
    public i18n: any;
    // 导入模板弹框
    @ViewChild('missionModal', { static: false }) missionModal: any;
    @Output() public outer = new EventEmitter<any>();
    @Input() public typeId: number;
    @Input() public type: string;
    @Input() missName: string;
    public missionDetail: any;
    public data: any = {
        analysisType: '',
        templateList: [],
    };
    public dataArr: any;
    public show: any;
    // 模板前缀
    public missionName: string;
    public enMissSortArr: any;
    public urlParams: string;
    public missArr: any = [
        'C/C++ Program',
        'java-mixed-mode',
        'process-thread-analysis',
        'system',
        'system_config',
        'resource_schedule',
        'system_lock',
        'mem_access',
        'microarchitecture',
        'miss_event',
        'ioperformance',
        'hpc_analysis',
    ];
    public cPs = 'Profile System';
    public cAtp = 'Attach to Process';
    public cLa = 'Launch Application';
    public analysisTypesDir: any;
    public nodata = './assets/img/projects/nodata-light.png';
    public collapsed = true;
    // 处理模板分析类型
    public taskType = {};
    public simplingArr = [
        { id: 'badSpeculation', text: 'Bad Speculation', tip: 'testtest' },
        { id: 'frontEndBound', text: 'Front-End Bound', tip: 'testtest' },
        { id: 'resourceBound', text: 'Back-End Bound->Resource Bound', tip: 'testtest' },
        { id: 'coreBound', text: 'Back-End Bound->Core Bound', tip: 'testtest' },
        { id: 'memoryBound', text: 'Back-End Bound->Memory Bound', tip: 'testtest' },
      ];
    // 单选选中项
    public selectedValue: number;
    public displayed: Array<TiTableRowData> = [];
    public srcData: TiTableSrcData;
    public colums: Array<TiTableColumns> = [];
    // 获取主题颜色
    public currTheme = COLOR_THEME.Dark;
    public ColorTheme = {
        Dark: COLOR_THEME.Dark,
        Light: COLOR_THEME.Light,
    };
    // 字符串
    public strObj = {
        kcore: 'Associate Kernel Function with Assembly Code', // 内核函数关联汇编指令
        samplingType: 'Sampling Type', // 采样类型
        calcTitle: '0.71'
    };

    /**
     * 初始加载
     */
    ngOnInit() {
        this.srcData = {
            data: [],
            state: {
                searched: false,
                sorted: false,
                paginated: false,
            },
        };
        this.colums = [
            {
                title: '',
            },
            {
                title: '',
                width: '6%',
            },
            {
                title: this.i18n.mission_modal.templateName,
                width: '30%',
            },
            {
                title: this.i18n.plugins_perf_tip_sysSet.analysisTarget,
                width: '30%',
            },
            {
                title: this.i18n.plugins_perf_tip_sysSet.common_term_task_analysis_type,
                width: '34%',
            },
        ];
        // 详细任务条目名称
        this.missionDetail = [
            [
                [
                    // cPs
                    { title: this.i18n.mission_modal.cProcess.taskname },
                    { title: this.i18n.mission_modal.cProcess.analysis_type },
                    { title: this.i18n.mission_modal.cProcess.duration },
                    { title: this.i18n.mission_modal.cProcess.ready_cpu_num },
                    {
                        calcTitle: (obj) => `${this.i18n.common_term_task_crate_interval_ms}
                                        (${obj.interval === this.strObj.calcTitle
                                ? this.i18n.common_term_task_crate_us
                                : this.i18n.common_term_task_crate_ms
                            })`,
                    },
                    { title: this.i18n.mission_modal.cProcess.file_path },
                    { title: this.i18n.mission_modal.cProcess.source_path },
                    { title: this.i18n.mission_create.kcore },
                ],
                [
                    // cAtp
                    { title: this.i18n.mission_modal.cProcess.taskname },
                    { title: this.i18n.ddr.analysisMode },
                    { title: this.i18n.mission_modal.cProcess.processName },
                    { title: this.i18n.mission_modal.cProcess.pid },
                    { title: this.i18n.mission_modal.cProcess.duration },
                    {
                        calcTitle: (obj) => `${this.i18n.common_term_task_crate_interval_ms}
                                        (${obj.interval === this.strObj.calcTitle
                                ? this.i18n.common_term_task_crate_us
                                : this.i18n.common_term_task_crate_ms
                            })`,
                    },
                    { title: this.i18n.mission_modal.cProcess.file_path },
                    { title: this.i18n.mission_modal.cProcess.source_path },
                    { title: this.i18n.mission_create.kcore },
                ],
                [
                    // cLa
                    { title: this.i18n.mission_modal.cProcess.taskname },
                    { title: this.i18n.ddr.analysisMode },
                    { title: this.i18n.mission_modal.cProcess.app_params },
                    { title: this.i18n.mission_modal.cProcess.app_path },
                    {
                        calcTitle: (obj) => `${this.i18n.common_term_task_crate_interval_ms}
                                         (${obj.interval === this.strObj.calcTitle
                                ? this.i18n.common_term_task_crate_us
                                : this.i18n.common_term_task_crate_ms
                            })`,
                    },
                    { title: this.i18n.mission_modal.cProcess.file_path },
                    { title: this.i18n.mission_modal.cProcess.source_path },
                    { title: this.i18n.mission_create.kcore },
                ],
            ],
            [
                [
                    // cAtp
                    { title: this.i18n.mission_modal.javaMix.taskname },
                    { title: this.i18n.ddr.analysisMode },
                    { title: this.i18n.mission_modal.cProcess.processName },
                    { title: this.i18n.mission_modal.javaMix.pid },
                    { title: this.i18n.mission_modal.javaMix.duration },
                    {
                        calcTitle: (obj) => `${this.i18n.common_term_task_crate_interval_ms}
                                        (${obj.interval === this.strObj.calcTitle
                                ? this.i18n.common_term_task_crate_us
                                : this.i18n.common_term_task_crate_ms
                            })`,
                    },
                    { title: this.i18n.mission_modal.javaMix.java_path },
                    { title: this.i18n.mission_create.kcore },
                ],
                [
                    { title: this.i18n.mission_modal.javaMix.taskname },
                    { title: this.i18n.ddr.analysisMode },
                    { title: this.i18n.common_term_task_crate_app_path },
                    { title: this.i18n.mission_modal.javaMix.app_params },
                    {
                        calcTitle: (obj) => `${this.i18n.common_term_task_crate_interval_ms}
                                        (${obj.interval === this.strObj.calcTitle
                                ? this.i18n.common_term_task_crate_us
                                : this.i18n.common_term_task_crate_ms
                            })`,
                    },
                    { title: this.i18n.mission_modal.javaMix.java_path },
                    { title: this.i18n.mission_create.kcore },
                ],
            ],
            [
                { title: this.i18n.mission_modal.process.taskname },
                { title: this.i18n.mission_modal.process.duration },
                { title: this.i18n.mission_modal.process.interval },
                { title: this.i18n.mission_modal.process.task_params },
                { title: this.i18n.mission_modal.cProcess.processName },
                { title: this.i18n.mission_modal.process.pid },
                { title: this.i18n.mission_modal.process.straceAnalysis },
                { title: this.i18n.mission_modal.process.thread },
            ],
            [
                // ok
                { title: this.i18n.mission_modal.panoramic.taskname },
                { title: this.i18n.mission_modal.panoramic.interval },
                { title: this.i18n.mission_modal.panoramic.duration },
                {
                    dssTitle: this.i18n.sys.scenes_dds,
                    bigDataTitle: this.i18n.sys.scenes_bigData,
                },
                { title: this.i18n.sys.scenes_top },
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
                    // cAtp
                    { title: this.i18n.mission_modal.sysSource.taskname },
                    { title: this.i18n.ddr.analysisMode },
                    { title: this.i18n.mission_modal.cProcess.processName },
                    { title: this.i18n.mission_modal.sysSource.pid },
                    { title: this.i18n.mission_modal.sysSource.duration },
                    { title: this.i18n.mission_modal.sysSource.file_path },
                    { title: this.i18n.mission_modal.sysSource.source_path },
                ],
                [
                    { title: this.i18n.mission_modal.sysSource.taskname },
                    { title: this.i18n.ddr.analysisMode },
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
                    { title: this.i18n.mission_modal.syslock.duration },
                    {
                        calcTitle: (obj) => `${this.i18n.common_term_task_crate_interval_ms}
                                        (${obj.interval === this.strObj.calcTitle
                                ? this.i18n.common_term_task_crate_us
                                : this.i18n.common_term_task_crate_ms
                            })`,
                    },
                    { title: this.i18n.mission_modal.syslock.function },
                    { title: this.i18n.mission_modal.lockSummary.filname },
                    { title: this.i18n.mission_modal.lockSummary.source_path },
                    { title: this.i18n.mission_create.kcore },
                ],
                [
                    // mAtp
                    { title: this.i18n.mission_modal.syslock.taskname },
                    { title: this.i18n.ddr.analysisMode },
                    { title: this.i18n.mission_modal.cProcess.processName },
                    { title: this.i18n.mission_modal.syslock.pid },
                    { title: this.i18n.mission_modal.syslock.duration },
                    {
                        calcTitle: (obj) => `${this.i18n.common_term_task_crate_interval_ms}
                                        (${obj.interval === this.strObj.calcTitle
                                ? this.i18n.common_term_task_crate_us
                                : this.i18n.common_term_task_crate_ms
                            })`,
                    },
                    { title: this.i18n.mission_modal.syslock.function },
                    { title: this.i18n.mission_modal.lockSummary.filname },
                    { title: this.i18n.mission_modal.lockSummary.source_path },
                    { title: this.i18n.mission_create.kcore },
                ],
                [
                    // mLa
                    { title: this.i18n.mission_modal.syslock.taskname },
                    { title: this.i18n.ddr.analysisMode },
                    { title: this.i18n.common_term_task_crate_app_path },
                    { title: this.i18n.mission_modal.syslock.app_params },
                    {
                        calcTitle: (obj) => `${this.i18n.common_term_task_crate_interval_ms}
                                        (${obj.interval === this.strObj.calcTitle
                                ? this.i18n.common_term_task_crate_us
                                : this.i18n.common_term_task_crate_ms
                            })`,
                    },
                    { title: this.i18n.mission_modal.syslock.function },
                    { title: this.i18n.mission_modal.lockSummary.filname },
                    { title: this.i18n.mission_modal.lockSummary.source_path },
                    { title: this.i18n.mission_create.kcore },
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
    }

    /**
     * 展开合并
     * @param i i
     */
    public beforeToggle(i: number): void {
        this.data.templateList.map((item, index) => {
            if (index === i) {
                item.showDetails = !item.showDetails;
            } else {
                item.showDetails = false;
            }
        });
    }
    /**
     * typeList是因为访存分析对应访存统计分析和Miss事件两个任务，需要同时获取
     * open
     * @param type type
     */
    public open({ type, typeList }: any): void {
        this.missName = type;
        if (type === 'network_diagnostic') {
            this.getData(['network_diagnostic']);
        } else if (type === 'memory_diagnostic') {
            this.getData(['memory_diagnostic']);
        } else if (type === 'storageio_diagnostic') {
            this.getData(['storageio_diagnostic']);
        } else {
            this.data.templateList = [];
            const getUrlParams = (analysisType: any) => {
                return analysisType === 'C/C++ Program'
                    ? 'c-cpp-program'
                    : analysisType;
            };
            if (this.missName) {
                this.getData(
                    typeList
                        ? typeList.map((item: any) => getUrlParams(item))
                        : [getUrlParams(type)]
                );
            }
        }
        this.missionModal.Open();
    }

    /**
     * 确认导入模板
     */
    public confirm(): any {
        this.data.templateList.forEach((item: any, index: number) => {
            if (index === this.selectedValue) {
                this.outer.emit(item);
            }
            // 关闭本组件
            this.missionModal.Close();
        });
        this.updateWebViewPage();
    }

    /**
     * isInterval
     */
    public isInterval(text) {
        if (
            text.includes(this.i18n.common_term_task_crate_interval_ms) ||
            text.includes(this.i18n.ddr.collectionDelay)
        ) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * 取消或关闭模板导入操作
     */
    public cancle() {
        this.missionModal.Close();
        this.updateWebViewPage();
    }

    /**
     * 根据 taskInfo 返回 analysisTarget
     * @param param0  param0
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
     * @param param0 param0
     */
    public getAnalysisType({ taskInfo }) {
        return taskInfo['analysis-type'] || taskInfo.analysisType;
    }

    /**
     * 根据 template 计算出显示信息【目前只有访存分析在使用】
     * @param formEl formEl
     * @param template template
     */
    public calcTemplateInfo(formEl, template) {
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
                return !['analysisObject', 'analysisType'].includes(item);
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

        // 附加预约任务参数
        if (template.hasOwnProperty('cycle')) {
            const scheduleParams = [
                {
                    // 是否是周期
                    key: this.i18n.preSwitch.colectMethods,
                    text: template.cycle
                        ? this.i18n.preSwitch.duraColect
                        : this.i18n.preSwitch.onceColect,
                    requier: '',
                },
                {
                    key: this.i18n.preSwitch.pointTime,
                    text: template.targetTime,
                    requier: '',
                },
                {
                    key: this.i18n.preSwitch.pointDuration,
                    text: this.handleColectDate(template),
                    requier: '',
                },
            ];
            configList.push(...scheduleParams);
        }

        templateInfo.configList = configList;

        // 添加节点参数
        if (formEl.hasNodeConfig) {
            const nodeEditList = formEl.getNodeConfigKeys({
                analysisObject: values.analysisObject,
                analysisMode: values.analysisMode,
            });

            templateInfo.panelList = template.nodeConfig.map((node, index) => {
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
     * C/C++性能分析 新增字段
     * @param data data
     */
    public getMicarchType(data) {
        let samplingSpace = '';
        if (data === 'all') {
            samplingSpace = this.i18n.micarch.typeItem_all;
        } else if (data === 'user') {
            samplingSpace = this.i18n.micarch.typeItem_user;
        } else if (data === 'kernel') {
            samplingSpace = this.i18n.micarch.typeItem_kernel;
        } else {
            samplingSpace = '--';
        }
        return samplingSpace;
    }

    /**
     * 查询需要导入的模板类型
     */
    public getData(urlParamsList): void {
        // 当前所需的模板类型
        let requiredTemplateType = [];
        if (this.typeId === 0) {
            requiredTemplateType = ['Profile System', 'sys', undefined];
        } else if (this.typeId === 1) {
            requiredTemplateType = ['Launch Application', 'app'];
        } else if (this.typeId === 2) {
            requiredTemplateType = ['Attach to Process', 'pid'];
        }
        // 获取模板列表
        const getTemplateList = (urlParams) => {
            return new Promise((resolve) => {
                let isnet = false;
                let analysisTypeio = '';
                let urlPath = `/tasks/templates/?analysis-type=${encodeURIComponent(
                    urlParams
                )}`;
                if (urlParamsList[0] === 'memory_diagnostic') {
                    urlPath = '/memory-tasks/templates/';
                } else if (urlParamsList[0] === 'network_diagnostic') {
                    urlPath = '/memory-tasks/templates/';
                    analysisTypeio = 'netio_diagnostic';
                    isnet = true;
                } else if (urlParamsList[0] === 'storageio_diagnostic') {
                    urlPath = '/memory-tasks/templates/';
                    analysisTypeio = 'storageio_diagnostic';
                }
                const option = {
                    url: urlPath,
                };

                this.vscodeService.get(option, (res: any) => {
                    const storageioTemplateList1: any = [];
                    const templateList: any = [];
                    res.data['template-list'].forEach((template: any) => {
                        const analysisTarget = this.getAnalysisTarget({
                            taskInfo: template,
                        });
                        const analysisType = this.getAnalysisType({ taskInfo: template });

                        if (requiredTemplateType.includes(analysisTarget)) {
                            const taskData = template;
                            if (analysisType === 'mem_access') {
                                // 访存统计分析
                                const formEl: any = new MemAccessForm();
                                formEl.generateFormGroup();
                                const templateInfo = this.calcTemplateInfo(formEl, template);
                                Object.assign(template, templateInfo);
                                templateList.push(template);
                            } else if (analysisType === 'miss_event') {
                                // Miss事件统计
                                let nameArr = [
                                    {
                                        key: this.i18n.task_name,
                                        text: taskData.taskname,
                                        requier: '',
                                    },
                                    {
                                        key: this.i18n.ddr.accessAnalysisType,
                                        text: this.i18n.mission_create.missEvent,
                                        requier: '',
                                    }, // 访存分析类型
                                ];
                                if (taskData['analysis-target'] !== 'Profile System') {
                                    nameArr = [
                                        {
                                            key: this.i18n.task_name,
                                            text: taskData.taskname,
                                            requier: '',
                                        },
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
                                        text: this.formattingSamplingRange(
                                            taskData.task_param.space
                                        ),
                                        requier: '',
                                    },
                                    {
                                        // 延迟采样时长
                                        key: this.i18n.ddr.samplingRange,
                                        text: this.formattingSamplingRange(
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
                                        text: taskData.kcore
                                            ? this.i18n.process.enable
                                            : this.i18n.process.disable,
                                        requier: '',
                                    },
                                ];
                                let diffArr1 = [];
                                let diffArr2 = [];
                                if (taskData.task_param.target === 'sys') {
                                    // 待采样CPU核
                                    diffArr2 = [
                                        {
                                            key: this.i18n.micarch.cpu_kernel,
                                            text: taskData.task_param.cpu || '--',
                                            requier: '',
                                        },
                                    ];
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
                                            text: taskData.task_param.appArgs,
                                            requier: '',
                                        },
                                    ];
                                } else if (taskData.task_param.target === 'pid') {
                                    diffArr1 = [
                                        {
                                            key: this.i18n.common_term_task_crate_processName,
                                            text: decodeURIComponent(
                                                taskData.task_param.process_name
                                            ),
                                            requier: '',
                                        },
                                        {
                                            key: this.i18n.common_term_task_crate_pid,
                                            text: taskData.task_param.pid,
                                            requier: '',
                                        },
                                    ];
                                }
                                taskData.configList = [
                                    ...nameArr,
                                    ...diffArr1,
                                    ...publicArr1,
                                    ...diffArr2,
                                    ...publicArr2,
                                ];
                                templateList.push(taskData);
                            } else if (analysisType === 'microarchitecture') {
                                let simplingIndex = '';
                                this.simplingArr.forEach((val: any) => {
                                if (template.analysisIndex.indexOf(val.id) > -1) {
                                    simplingIndex = val.text;
                                }
                                });
                                if (simplingIndex) {
                                simplingIndex = simplingIndex;
                                } else {
                                simplingIndex = '--';
                                }
                                template.analysisIndex = simplingIndex;
                                // 伪共享分析
                                let nameArr = [
                                    {
                                        key: this.i18n.task_name,
                                        text: taskData.taskname,
                                        requier: '',
                                    },
                                    {
                                        // 访存分析类型
                                        key: this.i18n.ddr.accessAnalysisType,
                                        text: this.i18n.mission_create.falsesharing,
                                        requier: '',
                                    },
                                ];
                                if (taskData['analysis-target'] !== 'Profile System') {
                                    nameArr = [
                                        {
                                            key: this.i18n.task_name,
                                            text: taskData.taskname,
                                            requier: '',
                                        },
                                        {
                                            // 分析类型
                                            key: this.i18n.ddr.analysisMode,
                                            text: taskData['analysis-target'],
                                            requier: '',
                                        },
                                        {
                                            // 访存分析类型
                                            key: this.i18n.ddr.accessAnalysisType,
                                            text: this.i18n.mission_create.falsesharing,
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
                                        text: this.formattingSamplingRange(taskData.samplingSpace),
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
                                            text: taskData.appParameters,
                                            requier: '',
                                        },
                                    ];
                                } else if (
                                    taskData['analysis-target'] === 'Attach to Process'
                                ) {
                                    diffArr = [
                                        {
                                            key: this.i18n.common_term_task_crate_processName,
                                            text: decodeURIComponent(taskData.process_name),
                                            requier: '',
                                        },
                                        {
                                            key: this.i18n.common_term_task_crate_pid,
                                            text: taskData.pid,
                                            requier: '',
                                        },
                                    ];
                                }
                                taskData.configList = [...nameArr, ...diffArr, ...publicArr];
                                templateList.push(template);
                            } else if (analysisType === 'process-thread-analysis') {
                                // 进程/线程分析
                                let a = '';
                                taskData.task_param.type.forEach((typeItem, index) => {
                                    if (index < taskData.task_param.type.length - 1) {
                                        a += this.taskType[typeItem] + this.i18n.sys.douhao;
                                    } else {
                                        a += this.taskType[typeItem];
                                    }
                                });
                                let nameArr = [
                                    {
                                        key: this.i18n.task_name,
                                        text: taskData.taskname,
                                        requier: '',
                                    },
                                ];
                                if (taskData['analysis-target'] !== 'Profile System') {
                                    nameArr = [
                                        {
                                            key: this.i18n.task_name,
                                            text: taskData.taskname,
                                            requier: '',
                                        },
                                        {
                                            // 分析类型
                                            key: this.i18n.ddr.analysisMode,
                                            text: taskData['analysis-target'],
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
                                if (taskData['analysis-target'] === 'Launch Application') {
                                    diffArr = [
                                        {
                                            key: this.i18n.mission_modal.cProcess.app_path,
                                            text:
                                                taskData.nodeConfig.length &&
                                                    taskData.nodeConfig[0].task_param &&
                                                    taskData.nodeConfig[0].task_param['app-dir']
                                                    ? taskData.nodeConfig[0].task_param['app-dir']
                                                    : '--',
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
                                    taskData['analysis-target'] === 'Attach to Process'
                                ) {
                                    diffArr = [
                                        {
                                            key: this.i18n.common_term_task_crate_processName,
                                            text: decodeURIComponent(taskData.process_name),
                                            requier: '',
                                        },
                                        {
                                            key: this.i18n.common_term_task_crate_pid,
                                            text: taskData.pid,
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
                                taskData.configList = [...nameArr, ...diffArr, ...publicArr];
                                taskData.panelList = taskData.nodeConfig.map((nodeParams) => {
                                    return [
                                        {
                                            // 进程ID
                                            key: this.i18n.nodeConfig.processId,
                                            text: nodeParams.task_param.pid,
                                            requier: '',
                                        },
                                    ];
                                });
                                templateList.push(template);
                            } else if (analysisType === 'resource_schedule') {
                                // 资源调度
                                let nameArr = [
                                    {
                                        key: this.i18n.task_name,
                                        text: taskData.taskname,
                                        requier: '',
                                    },
                                ];
                                if (taskData['analysis-target'] !== 'Profile System') {
                                    nameArr = [
                                        {
                                            key: this.i18n.task_name,
                                            text: taskData.taskname,
                                            requier: '',
                                        },
                                        {
                                            // 分析类型
                                            key: this.i18n.ddr.analysisMode,
                                            text: taskData['analysis-target'],
                                            requier: '',
                                        },
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
                                } else if (
                                    taskData['analysis-target'] === 'Launch Application'
                                ) {
                                    diffArr = [
                                        {
                                            key: this.i18n.mission_modal.cProcess.app_path,
                                            text:
                                                taskData.nodeConfig.length &&
                                                    taskData.nodeConfig[0].task_param &&
                                                    taskData.nodeConfig[0].task_param['app-dir']
                                                    ? taskData.nodeConfig[0].task_param['app-dir']
                                                    : '--',
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
                                } else if (
                                    taskData['analysis-target'] === 'Attach to Process'
                                ) {
                                    diffArr = [
                                        {
                                            key: this.i18n.common_term_task_crate_processName,
                                            text:
                                                decodeURIComponent(
                                                    taskData.process_name || taskData['process-name']
                                                ) || '--',
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
                                }
                                template.configList = [...nameArr, ...diffArr, ...publicArr];
                                templateList.push(template);
                            } else if (analysisType === 'system_lock') {
                                // 锁与等待
                                let nameArr = [
                                    {
                                        title: this.i18n.task_name,
                                        text: taskData.taskname,
                                        requier: '',
                                    },
                                ];
                                if (taskData['analysis-target'] !== 'Profile System') {
                                    nameArr = [
                                        {
                                            title: this.i18n.task_name,
                                            text: taskData.taskname,
                                            requier: '',
                                        },
                                        {
                                            // 分析类型
                                            title: this.i18n.ddr.analysisMode,
                                            text: taskData['analysis-target'],
                                            requier: '',
                                        },
                                    ];
                                }
                                const publicArr = [
                                    {
                                        title: this.i18n.mission_modal.syslock.cpu_interval,
                                        text: taskData.interval,
                                    },
                                    {
                                        title: this.i18n.ddr.samplingRange,
                                        text: this.formattingSamplingRange(taskData.collect_range),
                                    },
                                    {
                                        title: this.i18n.mission_modal.syslock.function,
                                        text:
                                            taskData.functionname.split('^_{,2}').join('') || '--',
                                    },
                                    {
                                        title: this.i18n.mission_modal.lockSummary.filname,
                                        text: taskData.assemblyLocation || '--',
                                    },
                                    {
                                        title: this.i18n.mission_modal.lockSummary.source_path,
                                        text: taskData.sourceLocation || '--',
                                    },
                                    {
                                        title:
                                            this.i18n.falsesharing.filesize +
                                            ' ' +
                                            this.i18n.ddr.leftParenthesis +
                                            'MiB' +
                                            this.i18n.ddr.rightParenthesis,
                                        text: taskData.collect_file_size,
                                    },
                                    {
                                        title: this.i18n.mission_create.kcore,
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
                                            title: this.i18n.mission_modal.syslock.duration,
                                            text: taskData.duration,
                                        },
                                    ];
                                } else if (
                                    taskData['analysis-target'] === 'Launch Application'
                                ) {
                                    diffArr = [
                                        {
                                            title: this.i18n.mission_modal.cProcess.app_path,
                                            text: taskData['app-dir'] || '--',
                                        },
                                        {
                                            title: this.i18n.mission_modal.syslock.app_params,
                                            text: taskData['app-parameters'] || '--',
                                        },
                                    ];
                                } else if (
                                    taskData['analysis-target'] === 'Attach to Process'
                                ) {
                                    diffArr = [
                                        {
                                            title: this.i18n.common_term_task_crate_processName,
                                            text: decodeURIComponent(taskData.process_name) || '--',
                                        },
                                        {
                                            title: this.i18n.common_term_task_crate_pid,
                                            text: taskData['target-pid'] || '--',
                                        },
                                        {
                                            title: this.i18n.mission_modal.syslock.duration,
                                            text: taskData.duration,
                                        },
                                    ];
                                }
                                taskData.configList = [...nameArr, ...diffArr, ...publicArr];
                                templateList.push(taskData);
                            } else if (analysisType === 'C/C++ Program') {
                                // C/C++性能分析
                                let nameArr = [
                                    {
                                        title: this.i18n.task_name,
                                        text: taskData.taskname,
                                        requier: '',
                                    },
                                ];
                                if (taskData['analysis-target'] !== 'Profile System') {
                                    nameArr = [
                                        {
                                            title: this.i18n.task_name,
                                            text: taskData.taskname,
                                            requier: '',
                                        },
                                        {
                                            // 分析类型
                                            title: this.i18n.ddr.analysisMode,
                                            text: taskData['analysis-target'],
                                            requier: '',
                                        },
                                    ];
                                }

                                const publicArr1 = [
                                    {
                                        title: this.i18n.mission_modal.syslock.cpu_interval,
                                        text: taskData.interval,
                                    }, // 采样间隔（毫秒）
                                    {
                                        // 采样范围
                                        title: this.i18n.ddr.samplingRange,
                                        text: this.formattingSamplingRange(
                                            taskData.samplingSpace.label
                                        ),
                                    },
                                ];
                                const publicArr2 = [
                                    {
                                        title: this.i18n.mission_modal.lockSummary.filname,
                                        text: taskData.assemblyLocation,
                                    }, // 符号文件路径
                                    {
                                        title: this.i18n.mission_modal.lockSummary.source_path,
                                        text: taskData.sourceLocation,
                                    }, // C/C++源文件路径
                                    {
                                        // 采集文件大小
                                        title:
                                            this.i18n.falsesharing.filesize +
                                            ' ' +
                                            this.i18n.ddr.leftParenthesis +
                                            'MiB' +
                                            this.i18n.ddr.rightParenthesis,
                                        text: taskData.size,
                                    },
                                    {
                                        title: this.i18n.mission_create.kcore,
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
                                            title: this.i18n.mission_modal.syslock.duration,
                                            text: taskData.duration,
                                        }, // 采样时长
                                    ];
                                    diffArr2 = [
                                        {
                                            title: this.i18n.micarch.cpu_kernel,
                                            text: taskData['cpu-mask'],
                                        },
                                    ]; // 待采样CPU核
                                } else if (
                                    taskData['analysis-target'] === 'Launch Application'
                                ) {
                                    diffArr1 = [
                                        {
                                            title: this.i18n.mission_modal.cProcess.app_path,
                                            text: taskData['app-dir'],
                                        },
                                        {
                                            title: this.i18n.mission_modal.syslock.app_params,
                                            text: taskData['app-parameters'],
                                        },
                                    ];
                                } else if (
                                    taskData['analysis-target'] === 'Attach to Process'
                                ) {
                                    diffArr1 = [
                                        {
                                            title: this.i18n.common_term_task_crate_processName,
                                            text: decodeURIComponent(taskData.process_name),
                                        },
                                        {
                                            title: this.i18n.common_term_task_crate_pid,
                                            text: taskData['target-pid'],
                                        },
                                        {
                                            title: this.i18n.mission_modal.syslock.duration,
                                            text: taskData.duration,
                                        },
                                    ];
                                }
                                taskData.configList = [
                                    ...nameArr,
                                    ...diffArr1,
                                    ...publicArr1,
                                    ...diffArr2,
                                    ...publicArr2,
                                ];
                                templateList.push(taskData);
                            } else if (analysisType === 'hpc_analysis') {
                                let nameArr = [
                                    {
                                        key: this.i18n.task_name,
                                        text: taskData.taskname,
                                        requier: '',
                                    },
                                ];
                                if (taskData['analysis-target'] !== 'Profile System') {
                                    nameArr = [
                                        {
                                            key: this.i18n.task_name,
                                            text: taskData.taskname,
                                            requier: '',
                                        },
                                        {
                                            // 分析类型
                                            key: this.i18n.ddr.analysisMode,
                                            text: taskData['analysis-target'],
                                            requier: '',
                                        },
                                    ];
                                }
                                let publicArr = [];
                                if (taskData.mpi_status) {
                                    publicArr = [
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
                                        {
                                            key: this.i18n.mission_modal.hpc.mpi_env_dir,
                                            text: taskData.mpi_env_dir || '--',
                                        },
                                        {
                                            key: this.i18n.mission_modal.hpc.mission_create.selectNode,
                                            text: taskData.master_ip || '--',
                                            requier: '',
                                        },
                                    ];
                                } else {
                                    publicArr = [
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
                                }

                                let diffArr = [];
                                if (
                                    taskData['analysis-target'] ===
                                    AnalysisTarget.LAUNCH_APPLICATION
                                ) {
                                    diffArr = [
                                        {
                                            key: this.i18n.mission_modal.hpc.mission_create.collectionType,
                                            text: taskData.mpi_status === true ? 'MPI' : 'OpenMP',
                                        },
                                        {
                                            key: this.i18n.mission_modal.hpc.mission_create.app_path,
                                            text: taskData['app-dir'] || '--',
                                            requier: '',
                                        },
                                        {
                                            key: this.i18n.mission_modal.hpc.mission_create.app_params,
                                            text: taskData['app-parameters'] || '--',
                                            requier: '',
                                        },
                                    ];
                                    if (!taskData.mpi_status) {
                                        diffArr.push({
                                            key: this.i18n.mission_modal.hpc.mission_create.openMpParams,
                                            text: taskData.open_mp_param || '--',
                                            requier: '',
                                        });
                                    }
                                } else if (
                                    taskData['analysis-target'] ===
                                    AnalysisTarget.ATTACH_TO_PROCESS
                                ) {
                                    diffArr = [
                                        {
                                            key: this.i18n.common_term_task_crate_processName,
                                            text: taskData?.process_name || '--',
                                            requier: '',
                                        },
                                        {
                                            key: this.i18n.common_term_task_crate_pid,
                                            text: taskData?.targetPid || '--',
                                            requier: '',
                                        },
                                    ];
                                }
                                template.configList = [...nameArr, ...diffArr, ...publicArr];
                                templateList.push(template);
                            } else if (analysisType === 'netio_diagnostic') {
                                // 系统诊断-网络IO分析
                                storageioTemplateList1.push(template);
                            } else if (analysisType === 'storageio_diagnostic') {
                                // 系统诊断-存储IO分析
                                templateList.push(template);
                            } else {
                                templateList.push(template);
                            }
                        }
                    });
                    if (isnet) {
                        resolve(storageioTemplateList1);
                    } else {
                        resolve(templateList);
                    }
                });
            });
        };
        Promise.all(
            urlParamsList.map((urlParams) => getTemplateList(urlParams))
        ).then((res: any) => {
            this.data.templateList = [].concat.apply([], res);
            this.updateWebViewPage();
        });
    }

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

    /**
     * 处理分析类型
     * @param type type
     */
    handleAnalysisType(type) {
        return this.analysisTypesDir.find((item) => {
            return (item.name = item.type === type);
        });
    }
    /**
     * 解码
     * @param str 乱码
     */
    public decoding(str) {
        return decodeURIComponent(str);
    }

    /**
     * 格式化采样范围
     * @param samplingRange 采样范围
     */
    public formattingSamplingRange(samplingRange: string) {
        if (['all', 'ALL'].includes(samplingRange)) {
            return this.i18n.micarch.typeItem_all;
        } else if (['user', 'USER', 'all-user'].includes(samplingRange)) {
            return this.i18n.micarch.typeItem_user;
        } else if (['kernel', 'SYS', 'all-kernel'].includes(samplingRange)) {
            return this.i18n.micarch.typeItem_kernel;
        } else {
            return samplingRange || '--';
        }
    }

    /**
     * IntellIj刷新webview页面
     */
    private updateWebViewPage() {
        if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
            this.zone.run(() => {
                this.changeDetectorRef.checkNoChanges();
                this.changeDetectorRef.detectChanges();
            });
        }
    }
}
