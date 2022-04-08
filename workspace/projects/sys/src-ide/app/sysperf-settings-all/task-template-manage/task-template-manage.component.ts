import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { I18nService } from '../../service/i18n.service';
import { MytipService } from '../../service/mytip.service';
import {
    VscodeService,
    COLOR_THEME,
    currentTheme,
} from '../../service/vscode.service';
import { TiTableColumns, TiTableSrcData, TiTableRowData } from '@cloud/tiny3';
import { MessageService } from '../../service/message.service';

import { BaseForm } from '../../mission-create/taskParams/BaseForm';
import { MemAnalysisModeForm } from '../../mission-create/taskParams/modules/MemAnalysisModeForm';
import { AllParams } from '../../mission-create/taskParams/AllParams';
import { DomSanitizer } from '@angular/platform-browser';
import { Utils } from 'projects/sys/src-ide/app/service/utils.service';
import { AnalysisTarget } from 'projects/sys/src-ide/app/domain';
import { ToolType } from 'projects/domain';

@Component({
    selector: 'app-task-template-manage',
    templateUrl: './task-template-manage.component.html',
    styleUrls: ['./task-template-manage.component.scss'],
})
export class TaskTemplateManageComponent implements OnInit {
    constructor(
        public i18nService: I18nService,
        public mytip: MytipService,
        public sanitizer: DomSanitizer,
        public vscodeService: VscodeService,
        private msgService: MessageService
    ) {
        this.i18n = this.i18nService.I18n();
        this.columns = [
            {
                title: this.i18n.mission_modal.templateName,
                // 设置排序时按照源数据中的哪一个属性进行排序
                sortKey: 'taskName',
                width: '25%',
            },
            {
                title: this.i18n.mission_create.analysisTarget,
                width: '24%',
                key: 'analysisTarget',
                selected: [],
                options: [
                    {
                        id: this.i18n.common_term_projiect_task_system,
                        text: this.i18n.common_term_projiect_task_system,
                    },
                    {
                        id: this.i18n.common_term_task_crate_path,
                        text: this.i18n.common_term_task_crate_path,
                    },
                ],
            },
            {
                title: this.i18n.common_term_task_analysis_type,
                width: '26%',
                // 该列的 headfilter 要过滤的字段
                key: 'analysisType',
                selected: [],
                options: [
                    {
                        id: 'resource_schedule',
                        text: this.i18n.mission_create.resSchedule,
                    },
                    {
                        id: 'C/C++ Program',
                        text: this.i18n.mission_create.cPlusPlus,
                    },
                    {
                        id: 'process-thread-analysis',
                        text: this.i18n.mission_modal.processAnalysis,
                    },
                    {
                        id: 'system',
                        text: this.i18n.mission_modal.sysPowerAllAnalysis,
                    },
                    {
                        id: 'mem_access',
                        text: this.i18n.mission_modal.memAccessAnalysis,
                    },
                    {
                        id: 'microarchitecture',
                        text: this.i18n.micarch.selct_title,
                    },
                    {
                        id: 'system_lock',
                        text: this.i18n.mission_modal.syslockAnalysis,
                    },
                    {
                        id: 'ioperformance',
                        text: this.i18n.mission_create.io,
                    },
                    {
                        id: 'hpc_analysis',
                        text: this.i18n.mission_create.hpc,
                    },
                ],
            },
            {
                title: this.i18n.preTable.action,
                sortKey: 'operate',
                width: '25%',
            },
        ];
        this.taskNameObj = [
            {
                type: 'C/C++ Program',
                name: this.i18n.mission_create.cPlusPlus,
            },
            {
                type: 'process-thread-analysis',
                name: this.i18n.mission_modal.processAnalysis,
                cpu: this.i18n.sys.cpu,
                mem: this.i18n.sys.mem,
                context: this.i18n.process.context,
                disk: this.i18n.sys.disk,
            },
            {
                type: 'system',
                name: this.i18n.mission_modal.sysPowerAllAnalysis,
                net: this.i18n.sys.net,
                cpu: this.i18n.sys.cpu,
                mem: this.i18n.sys.mem,
                disk: this.i18n.sys.disk,
            },
            {
                type: 'system_config',
                name: this.i18n.mission_modal.sysConfigAnalysis,
                hard: this.i18n.sys_cof.check_types.hard,
                soft: this.i18n.sys_cof.check_types.soft,
                env: this.i18n.sys_cof.check_types.env,
            },
            {
                type: 'resource_schedule',
                name: this.i18n.mission_create.resSchedule,
            },
            {
                type: 'system_lock',
                name: this.i18n.mission_modal.syslockAnalysis,
            },
            {
                type: 'microarchitecture',
                name: this.i18n.micarch.selct_title,
            },
            {
                type: 'mem_access_analysis',
                typeList: ['mem_access', 'miss_event', 'falsesharing'],
                name: this.i18n.mission_modal.memAccessAnalysis,
                cache_access: this.i18n.ddr.types.cache_access,
                ddr_access: this.i18n.ddr.types.ddr_access,
            },
            {
                type: 'ioperformance',
                name: this.i18n.mission_create.io,
            },
            {
                type: 'hpc_analysis',
                name: this.i18n.mission_create.hpc,
            },
            {
                type: 'memory_diagnostic',
                name: this.i18n.diagnostic.analysis_type,
            },
            {
                type: 'netio_diagnostic',
                name: this.i18n.network_diagnositic.analysis_type,
            },
            {
                type: 'storageio_diagnostic',
                name: this.i18n.diagnostic.storage_type,
            }
        ];
    }

    @ViewChild('missionModal', { static: false }) missionModal: any;
    @ViewChild('deleteMask', { static: false }) deleteMask;
    @ViewChild('multipleDeleteMask', { static: false }) multipleDeleteMask;
    @Input() missName: string;

    public i18n: any;
    public templateAll = false;
    public ifShow = false;
    public image = {
        dark: './assets/img/projects/dark-noproject.png',
        light: './assets/img/projects/light-noproject.png',
    };
    public displayed: Array<TiTableRowData> = [];
    public checkedIdList: Array<number> = [];
    // 指定删除的模板
    public template: { id: string; name: string } = {
        id: '',
        name: '',
    };
    // 上一次成功批量删除的选中项
    public lastDeletecheckedIdMap: Map<any, any> = new Map<any, any>();
    public srcData: TiTableSrcData;
    public columns: Array<TiTableColumns> = [];
    public srcDataOk: TiTableSrcData;
    public checkedListOk: Array<TiTableRowData> = [];
    public displayedOk: Array<TiTableRowData> = [];
    // 处理好的完整数据
    public completeData = [];
    public taskNameObj = [];
    public nodataTips = '';
    // 保存任务列表长度
    public totalNumber = 0;
    public currentPage = 1;
    public pageSize: { options: Array<number>; size: number } = {
        options: [10, 20, 30, 40, 50],
        size: 10,
    };
    // 模板列表种类图标路径
    public imgSrc: any;
    public nodata: any = '';
    // 数据获取保存
    public data: any = {
        templateList: [],
    };
    // 任务模板详细条目
    public missionDetail: any;
    // 模板前缀
    public missionName: string;
    // 种类名称国际化
    public enMissSortArr: any;
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
    ];
    public cPs = 'Profile System';
    public cAtp = 'Attach to Process';
    public cLa = 'Launch Application';

    public collapsed = true;
    // 处理模板分析类型
    public taskType = {};
    public themeDark = COLOR_THEME.Dark;
    public themeLight = COLOR_THEME.Light;
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
    // 当前主题
    public currTheme = COLOR_THEME.Dark;

    public isToggleOpened: any = {};

    public filterImgStatus = {
        analysisTarget: './assets/img/filterNormal.svg',
        analysisType: './assets/img/filterNormal.svg',
    };
    public filterImgStatusList = {
        normal: './assets/img/filterNormal.svg',
        hover: './assets/img/filterHover.svg',
        click: './assets/img/filterClick.svg',
    };
    // 字符串
    public strObj = {
        kcore: 'Associate Kernel Function with Assembly Code', // 内核函数关联汇编指令
    };
    public toolType: ToolType;
    public ToolType = ToolType;
    public tempStatus: any = {};

    /**
     * ngOnInit
     */
    ngOnInit() {
        this.toolType = sessionStorage.getItem('toolType') as ToolType;

        this.currTheme = currentTheme();
        // 监听主题变更事件
        this.vscodeService.regVscodeMsgHandler('colorTheme', (msg: any) => {
            this.currTheme = msg.colorTheme;
        });

        // 接收通知刷新任务模板管理页面数据
        this.msgService.getMessage().subscribe((msg) => {
            if (msg && msg.type && msg.type.indexOf('taskTemplateManager') !== -1) {
                this.getData(true);
            }
        });

        this.srcData = {
            data: [],
            state: {
                searched: false,
                sorted: false,
                paginated: false,
            },
        };

        // 确认删除table
        this.srcDataOk = {
            data: [],
            state: {
                searched: false,
                sorted: false,
                paginated: false,
            },
        };

        // 详细任务条目名称
        this.missionDetail = [
            [
                // 进程
                [
                    // cPs
                    { title: this.i18n.mission_modal.cProcess.duration },
                    {
                        calcTitle: (obj) => `${this.i18n.common_term_task_crate_interval_ms}
                                             (${obj.interval === '0.71'
                                ? this.i18n.common_term_task_crate_us
                                : this.i18n.common_term_task_crate_ms
                            })`,
                    },
                    { title: this.i18n.ddr.samplingRange },
                    { title: this.i18n.ddr.cpuToBeSamples },
                    { title: this.i18n.mission_modal.cProcess.file_path },
                    { title: this.i18n.mission_modal.cProcess.source_path },
                    { title: this.i18n.mission_create.kcore },
                    {
                        title:
                            this.i18n.falsesharing.filesize +
                            this.i18n.ddr.leftParenthesis +
                            'MiB' +
                            this.i18n.ddr.rightParenthesis,
                    },
                ],
                [
                    // cAtp
                    { title: this.i18n.mission_modal.cProcess.pid },
                    { title: this.i18n.mission_modal.cProcess.duration },
                    {
                        calcTitle: (obj) => `${this.i18n.common_term_task_crate_interval_ms}
                                                (${obj.interval === '0.71'
                                ? this.i18n.common_term_task_crate_us
                                : this.i18n.common_term_task_crate_ms
                            })`,
                    },
                    { title: this.i18n.ddr.samplingRange },
                    { title: this.i18n.mission_modal.cProcess.file_path },
                    { title: this.i18n.mission_modal.cProcess.source_path },
                    { title: this.i18n.mission_create.kcore },
                    {
                        title:
                            this.i18n.falsesharing.filesize +
                            this.i18n.ddr.leftParenthesis +
                            'MiB' +
                            this.i18n.ddr.rightParenthesis,
                    },
                ],
                [
                    // cLa
                    { title: this.i18n.common_term_task_crate_app_path },
                    { title: this.i18n.mission_modal.cProcess.app_params },
                    {
                        calcTitle: (obj) => `${this.i18n.common_term_task_crate_interval_ms}
                                                (${obj.interval === '0.71'
                                ? this.i18n.common_term_task_crate_us
                                : this.i18n.common_term_task_crate_ms
                            })`,
                    },
                    { title: this.i18n.ddr.samplingRange },
                    { title: this.i18n.mission_modal.cProcess.file_path },
                    { title: this.i18n.mission_modal.cProcess.source_path },
                    { title: this.i18n.mission_create.kcore },
                    {
                        title:
                            this.i18n.falsesharing.filesize +
                            this.i18n.ddr.leftParenthesis +
                            'MiB' +
                            this.i18n.ddr.rightParenthesis,
                    },
                ],
            ],
            [
                // java
                [
                    { title: this.i18n.mission_modal.javaMix.pid },
                    { title: this.i18n.mission_modal.javaMix.duration },
                    {
                        calcTitle: (obj) => `${this.i18n.common_term_task_crate_interval_ms}
                                                (${obj.interval === '0.71'
                                ? this.i18n.common_term_task_crate_us
                                : this.i18n.common_term_task_crate_ms
                            })`,
                    },
                    { title: this.i18n.ddr.samplingRange },
                    { title: this.i18n.mission_modal.javaMix.java_path },
                    {
                        title:
                            this.i18n.falsesharing.filesize +
                            this.i18n.ddr.leftParenthesis +
                            'MiB' +
                            this.i18n.ddr.rightParenthesis,
                    },
                ],
                [
                    { title: this.i18n.common_term_task_crate_app_path },
                    { title: this.i18n.mission_modal.javaMix.app_params },
                    {
                        calcTitle: (obj) => `${this.i18n.common_term_task_crate_interval_ms}
                                                (${obj.interval === '0.71'
                                ? this.i18n.common_term_task_crate_us
                                : this.i18n.common_term_task_crate_ms
                            })`,
                    },
                    { title: this.i18n.ddr.samplingRange },
                    { title: this.i18n.mission_modal.javaMix.java_path },
                    {
                        title:
                            this.i18n.falsesharing.filesize +
                            this.i18n.ddr.leftParenthesis +
                            'MiB' +
                            this.i18n.ddr.rightParenthesis,
                    },
                ],
            ],
            [
                { title: this.i18n.mission_modal.process.interval },
                { title: this.i18n.mission_modal.process.duration },
                { title: this.i18n.mission_modal.process.task_params },
                { title: this.i18n.mission_modal.process.pid },
                { title: this.i18n.mission_modal.process.straceAnalysis },
                { title: this.i18n.mission_modal.process.thread },
            ],
            [
                // 全景分析
                { title: this.i18n.mission_modal.panoramic.taskname },
                { title: this.i18n.mission_modal.panoramic.interval },
                { title: this.i18n.mission_modal.panoramic.duration },
                { title: this.i18n.sys.scenes_top },
            ],
            [
                // ok
                { title: this.i18n.mission_modal.sysConfig.task_params },
            ],
            [
                [
                    { title: this.i18n.mission_modal.sysSource.duration },
                    { title: this.i18n.mission_modal.sysSource.file_path },
                    { title: this.i18n.mission_modal.sysSource.source_path },
                    {
                        title:
                            this.i18n.falsesharing.filesize +
                            ' ' +
                            this.i18n.ddr.leftParenthesis +
                            'MiB' +
                            this.i18n.ddr.rightParenthesis,
                    },
                ],
                [
                    { title: this.i18n.mission_modal.sysSource.pid },
                    { title: this.i18n.mission_modal.sysSource.duration },
                    { title: this.i18n.mission_modal.sysSource.file_path },
                    { title: this.i18n.mission_modal.sysSource.source_path },
                    {
                        title:
                            this.i18n.falsesharing.filesize +
                            ' ' +
                            this.i18n.ddr.leftParenthesis +
                            'MiB' +
                            this.i18n.ddr.rightParenthesis,
                    },
                ],
                [
                    { title: this.i18n.common_term_task_crate_app_path },
                    { title: this.i18n.mission_modal.sysSource.app_params },
                    { title: this.i18n.mission_modal.sysSource.file_path },
                    { title: this.i18n.mission_modal.sysSource.source_path },
                    {
                        title:
                            this.i18n.falsesharing.filesize +
                            ' ' +
                            this.i18n.ddr.leftParenthesis +
                            'MiB' +
                            this.i18n.ddr.rightParenthesis,
                    },
                ],
            ],
            [
                [
                    // mPs
                    { title: this.i18n.mission_modal.syslock.duration },
                    {
                        calcTitle: (obj) => `${this.i18n.common_term_task_crate_interval_ms}
                                                (${obj.interval === '0.71'
                                ? this.i18n.common_term_task_crate_us
                                : this.i18n.common_term_task_crate_ms
                            })`,
                    },
                    { title: this.i18n.mission_modal.syslock.function },
                    { title: this.i18n.mission_modal.lockSummary.filname },
                    { title: this.i18n.mission_modal.lockSummary.source_path },
                    { title: this.i18n.mission_create.kcore },
                    {
                        title:
                            this.i18n.falsesharing.filesize +
                            ' ' +
                            this.i18n.ddr.leftParenthesis +
                            'MiB' +
                            this.i18n.ddr.rightParenthesis,
                    },
                ],
                [
                    // mAtp
                    { title: this.i18n.mission_modal.syslock.pid },
                    { title: this.i18n.mission_modal.syslock.duration },
                    {
                        calcTitle: (obj) => `${this.i18n.common_term_task_crate_interval_ms}
                                                (${obj.interval === '0.71'
                                ? this.i18n.common_term_task_crate_us
                                : this.i18n.common_term_task_crate_ms
                            })`,
                    },
                    { title: this.i18n.mission_modal.syslock.function },
                    { title: this.i18n.mission_modal.lockSummary.filname },
                    { title: this.i18n.mission_modal.lockSummary.source_path },
                    { title: this.i18n.mission_create.kcore },
                    {
                        title:
                            this.i18n.falsesharing.filesize +
                            ' ' +
                            this.i18n.ddr.leftParenthesis +
                            'MiB' +
                            this.i18n.ddr.rightParenthesis,
                    },
                ],
                [
                    // mLa
                    { title: this.i18n.mission_modal.syslock.app_params },
                    { title: this.i18n.mission_modal.syslock.app_path },
                    {
                        calcTitle: (obj) => `${this.i18n.common_term_task_crate_interval_ms}
                                                (${obj.interval === '0.71'
                                ? this.i18n.common_term_task_crate_us
                                : this.i18n.common_term_task_crate_ms
                            })`,
                    },
                    { title: this.i18n.mission_modal.syslock.function },
                    { title: this.i18n.mission_modal.lockSummary.filname },
                    { title: this.i18n.mission_modal.lockSummary.source_path },
                    { title: this.i18n.mission_create.kcore },
                    {
                        title:
                            this.i18n.falsesharing.filesize +
                            ' ' +
                            this.i18n.ddr.leftParenthesis +
                            'MiB' +
                            this.i18n.ddr.rightParenthesis,
                    },
                ],
            ],
            [
                { title: this.i18n.mission_modal.memAccess.interval },
                { title: this.i18n.mission_modal.memAccess.duration },
                { title: this.i18n.mission_modal.memAccess.task_params },
            ],
        ];
        this.enMissSortArr = [
            this.i18n.mission_modal.cProgramAnalysis,
            this.i18n.mission_modal.javaMixedModeAnalysis,
            this.i18n.mission_modal.processAnalysis,
            this.i18n.mission_modal.sysPowerAllAnalysis,
            this.i18n.mission_modal.sysConfigAnalysis,
            this.i18n.mission_modal.resourceAnalysis,
            this.i18n.mission_modal.syslockAnalysis,
            this.i18n.mission_create.mem,
            this.i18n.micarch.selct_title,
            this.i18n.mission_create.missEvent,
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
        this.open('all');
        this.getData(false);
        this.columns.forEach((val) => {
            if (val.hasOwnProperty('options')) {
                val.selected = [...val.options];
            }
        });
    }

    /**
     * 筛选数据
     */
    public onMyChange() {
        this.srcData.data =
            this.toolType === ToolType.DIAGNOSE
                ? this.completeData
                : this.completeData.filter((val) => {
                    const t1 = this.ifTrue(
                        val['analysis-type'],
                        this.columns[2].selected
                    );
                    const t2 = this.ifTrue(
                        val.analysisTarget,
                        this.columns[1].selected
                    );
                    const test = t1 && t2;
                    return test;
                });
        this.totalNumber = this.srcData.data.length;
        if (this.totalNumber === 0) {
            this.nodataTips = this.i18n.mission_create.templateNoData;
        }
    }

    /**
     * 采样范围
     * @param template template
     */
    public getCorJavaType(template) {
        const typeOptions = [
            {
                label: this.i18n.micarch.typeItem_all,
                id: 'all',
            },
            {
                label: this.i18n.micarch.typeItem_user,
                id: 'user',
            },
            {
                label: this.i18n.micarch.typeItem_kernel,
                id: 'kernel',
            },
        ];
        const item = typeOptions.find((val) => {
            return val.id === template;
        });
        const typeItem = item ? item.label : '--';
        return typeItem;
    }

    /**
     * C/C++性能分析 资源调度新增字段
     * @param data  data
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
     * ifTrue，类型判断
     * @param item item
     * @param data data
     */
    public ifTrue(item: any, data: any) {
        let val = false;
        data.forEach((ele) => {
            if (item === ele.id) {
                val = true;
            }
            if (
                (item === 'miss_event' && ele.id === 'mem_access') ||
                (item === 'falsesharing' && ele.id === 'mem_access')
            ) {
                val = true;
            }
        });
        return val;
    }

    /**
     * 过滤
     * @param index index
     * @param item item
     */
    public trackByFn(index: number, item: any): number {
        return item.id;
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
     * 多选删除任务模板
     */
    public multipleDelete() {
        if (this.checkedIdList.length === 0) {
            return;
        }
        const checkedList = this.srcData.data.filter((item) =>
            this.checkedIdList.includes(item.id)
        );
        this.srcDataOk.data = JSON.parse(JSON.stringify(checkedList));
        this.checkedListOk = [...this.srcDataOk.data];
        this.multipleDeleteMask.Open();
    }

    /**
     * 同步模态框选项
     */
    public toggleSelect() {
        this.checkedIdList = this.srcData.data
            .filter((val) => {
                return this.checkedListOk.find((el) => {
                    return val.templateName === el.templateName;
                });
            })
            .map((item) => item.id);
    }

    /**
     * 关闭多选删除弹框
     */
    public closeDelete() {
        this.multipleDeleteMask.Close();
        this.checkedListOk = [];
    }

    /**
     * 确认批量删除
     */
    public multipleDeleteOk() {
        if (this.checkedListOk.length === 0) {
            return;
        }
        const taskIdArr = this.checkedListOk.map((val) => {
            return val.id;
        });
        const params =
            this.toolType === ToolType.DIAGNOSE
                ? { templateIds: taskIdArr }
                : { template_ids: taskIdArr };
        const url =
            this.toolType === ToolType.DIAGNOSE ? '/memory-tasks/' : '/tasks/';
        const option = {
            url: url + 'templates/batch-delete/',
            params,
        };
        this.vscodeService.delete(option, (res: any) => {
            if (res.code === 'SysPerf.Success') {
                // 清空上一次删除项
                this.lastDeletecheckedIdMap.clear();
                // 获取当前删除项
                this.checkedIdList.forEach((item) => {
                    this.lastDeletecheckedIdMap.set(item, item);
                });
                const batchContent = this.i18n.plugins_perf_tip_batchDel;
                this.vscodeService.showInfoBox(batchContent, 'info');
                this.getData(false);
            } else {
                this.vscodeService.showInfoBox(res.message, 'error');
            }
        });
        this.closeDelete();
    }

    /**
     * 展开详情
     * @param row row
     */
    public beforeToggle(row: TiTableRowData): void {
        if (!row.showDetails) {
            // 展开 true
            this.isToggleOpened[row.id] = true;
            row.showDetails = !row.showDetails;
        } else {
            // 收起 false
            this.isToggleOpened[row.id] = false;
            row.showDetails = !row.showDetails;
        }
    }

    /**
     * 展开合并
     * @param i i
     */
    public change(i: number): void {
        this.data.templateList[i].isShow = !this.data.templateList[i].isShow;

        for (let j = 0; j !== i; j++) {
            this.data.templateList[j].isShow = true;
        }
        for (let j = this.data.templateList.length - 1; j !== i; j--) {
            this.data.templateList[j].isShow = true;
        }
    }

    /**
     * 打开模板操作
     * @param type type
     */
    public open(type) {
        this.missName = type;
        this.missionName = '';

        if (this.missName === 'all') {
            this.getData(false);
        }
        this.ifShow = true;
    }

    /**
     * 取消模板操作
     */
    public cancle() {
        if (this.data.templateList) {
            for (const list of this.data.templateList) {
                list.isShow = true;
            }
        }
        this.ifShow = false;
    }

    /**
     * 删除指定模板
     * @param item item
     */
    public delete(item: any): any {
        let str1 = '';
        let str2 = '';
        // 传给父组件
        const tem = document.getElementsByName('template');
        for (const list of this.data.templateList) {
            list.isShow = true;
        }
        str1 = item.id;
        if (item['analysis-type'] === 'C/C++ Program') {
            str2 = 'c-cpp-program';
        } else {
            str2 = item['analysis-type'];
        }
        this.template = {
            id: str1,
            name: item['template-name'],
        };
        this.deleteMask.Open();
    }

    /**
     * 确认删除指定模板
     */
    public deleteOk() {
        const url =
            this.toolType === ToolType.DIAGNOSE ? '/memory-tasks/' : '/tasks/';
        const option = {
            url: url + 'templates/' + encodeURIComponent(this.template.id) + '/',
        };
        this.vscodeService.delete(option, (res: any) => {
            if (res.code === 'SysPerf.Success') {
                const content = this.i18n.plugins_perf_tip_del;
                this.vscodeService.showInfoBox(content, 'info');
            }
            this.getData(false);
            this.deleteMask.Close();
        });
    }

    /**
     * 关闭指定删除弹框
     */
    public closeSingleDelete() {
        this.deleteMask.Close();
    }

    /**
     * 任务模板处理
     * @param row row
     */
    public handleTaskTarget(row: any) {
        const analysisTarget = this.getAnalysisTarget({ taskInfo: row });
        if (['Launch Application', 'Attach to Process'].includes(analysisTarget)) {
            return this.i18n.common_term_task_crate_path;
        } else {
            return this.i18n.common_term_projiect_task_system;
        }
    }

    /**
     * 任务类型
     * @param row row
     */
    public handleTaskType(row: any) {
        for (const analysisType of this.taskNameObj) {
            if (
                row['analysis-type'] === analysisType.type ||
                (analysisType.typeList &&
                    analysisType.typeList.includes(row['analysis-type']))
            ) {
                return analysisType.name;
            }
        }
    }

    /**
     * 分析类模板
     * @param row row
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

    public getTemplateName(row: any) {
        return row['template-name'] || row.templateName;
    }

    /**
     * 获取所有模板列表数据
     */
    public getData(autoUpdate: any) {
        const url =
            this.toolType === ToolType.DIAGNOSE ? '/memory-tasks/' : '/tasks/';
        const option = { url: url + 'templates/' };
        this.vscodeService.get(option, (res: any) => {
            this.data.templateList = res.data['template-list'];
            this.data.templateList.forEach((item: any) => {
                const taskData = item;
                item.isShow = true;
                const analysisType = this.getAnalysisType({ taskInfo: item });
                if (analysisType === 'ioperformance') {
                    item.analysis_target = item.analysisTarget;
                }
                if (this.toolType === ToolType.DIAGNOSE) {
                    if (analysisType === 'memory_diagnostic') {
                        item['analysis-type'] = 'memory_diagnostic';
                    } else if (analysisType === 'netio_diagnostic') {
                        item['analysis-type'] = 'netio_diagnostic';
                    } else if (analysisType === 'storageio_diagnostic') {
                        item['analysis-type'] = 'storageio_diagnostic';
                    }
                }
                item.analysisTarget = this.handleTaskTarget(item);
                item.analysisType = this.handleTaskType(item);
                item.templateName = this.getTemplateName(item);
                if (analysisType === 'mem_access') {
                    // 访存统计分析
                    const templateInfo: any = {};
                    let a = '';
                    taskData.task_param.type.forEach((typeItem, index: number) => {
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
                            {
                                key: this.i18n.task_name,
                                text: taskData.taskname,
                                requier: '',
                            },
                            {
                                key: this.i18n.ddr.analysisMode,
                                text: 'Profile System',
                                requier: '',
                            }, // 分析类型
                        ];
                    }
                    const publicArr = [
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
                    templateInfo.configList = [...nameArr, ...publicArr];
                    Object.assign(item, templateInfo);
                } else if (analysisType === 'miss_event') {
                    // Miss事件统计
                    const templateInfo: any = {};
                    let nameArr = [
                        { key: this.i18n.task_name, text: taskData.taskname, requier: '' },
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
                                    taskData.task_param.target === 'sys'
                                        ? 'Profile System'
                                        : taskData.task_param.target === 'app'
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
                            key: this.i18n.ddr.samplingRange,
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
                            key: this.i18n.mission_create.kcore,
                            text: taskData.task_param.kcore
                                ? this.i18n.process.enable
                                : this.i18n.process.disable,
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
                                key: this.i18n.mission_create.process_alias,
                                text:
                                    decodeURIComponent(taskData.task_param.process_name) || '--',
                                requier: '',
                            },
                            {
                                key: this.i18n.common_term_task_crate_pid,
                                text: taskData.task_param.pid || '--',
                                requier: '',
                            },
                        ];
                    }
                    templateInfo.configList = [
                        ...nameArr,
                        ...diffArr1,
                        ...publicArr1,
                        ...diffArr2,
                        ...publicArr2,
                    ];
                    Object.assign(item, templateInfo);
                } else if (analysisType === 'falsesharing') {
                    // 伪共享分析
                    const templateInfo: any = {};
                    let nameArr = [
                        { key: this.i18n.task_name, text: taskData.taskname, requier: '' },
                        {
                            key: this.i18n.ddr.accessAnalysisType,
                            text: this.i18n.mission_create.falsesharing,
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
                            text: item.assemblyLocation || '--',
                            requier: '',
                        },
                        {
                            // C/C++源文件路径
                            key: this.i18n.mission_modal.lockSummary.source_path,
                            text: taskData.sourceLocation || '--',
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
                    }
                    templateInfo.configList = [...nameArr, ...diffArr, ...publicArr];
                    Object.assign(item, templateInfo);
                } else if (analysisType === 'process-thread-analysis') {
                    // 进程/线程分析
                    const templateInfo: any = {};
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
                            {
                                key: this.i18n.task_name,
                                text: taskData.taskname,
                                requier: '',
                            },
                            {
                                key: this.i18n.ddr.analysisMode,
                                text: taskData['analysis-target'],
                                requier: '',
                            }, // 分析类型
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
                    if (item['analysis-target'] === 'Launch Application') {
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
                        templateInfo.panelList = taskData.nodeConfig.map(
                            (nodeParams, index) => {
                                return [
                                    {
                                        key: this.i18n.mission_modal.cProcess.app_path,
                                        text: nodeParams.task_param['app-dir'],
                                        requier: '',
                                    },
                                    {
                                        key: this.i18n.mission_modal.syslock.app_params,
                                        text: nodeParams.task_param['app-parameters'],
                                        requier: '',
                                    },
                                ];
                            }
                        );
                    } else if (item['analysis-target'] === 'Attach to Process') {
                        diffArr = [
                            {
                                key: this.i18n.mission_create.process_alias,
                                text: decodeURIComponent(item.process_name) || '--',
                                requier: '',
                            },
                            {
                                key: this.i18n.common_term_task_crate_pid,
                                text: item.pid || '--',
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
                        templateInfo.panelList = taskData.nodeConfig.map(
                            (nodeParams, index) => {
                                return [
                                    {
                                        key: this.i18n.mission_create.process_alias,
                                        text: nodeParams.task_param.process_name,
                                        requier: '',
                                    },
                                    {
                                        // 进程ID
                                        key: this.i18n.nodeConfig.processId,
                                        text: nodeParams.task_param.pid,
                                        requier: '',
                                    },
                                ];
                            }
                        );
                    }
                    templateInfo.configList = [...nameArr, ...diffArr, ...publicArr];
                    Object.assign(item, templateInfo);
                } else if (analysisType === 'microarchitecture') {
                    // 微架构
                    this.simplingArr.forEach((val) => {
                        if (item.analysisIndex.indexOf(val.id) > -1) {
                            item.analysisIndex = val.text || '--';
                        }
                    });
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
                                title: this.i18n.ddr.analysisMode,
                                text: taskData['analysis-target'],
                                requier: '',
                            }, // 分析类型
                        ];
                    }

                    const publicArr = [
                        {
                            title: this.i18n.mission_modal.syslock.cpu_interval,
                            text: item.interval,
                        },
                        {
                            title: this.i18n.ddr.samplingRange,
                            text: Utils.formattingSamplingRange(
                                this.i18n,
                                item.collect_range
                            ),
                        },
                        {
                            title: this.i18n.mission_modal.syslock.function,
                            text: item.functionname.split('^_{,2}').join('') || '--',
                        },
                        {
                            title: this.i18n.mission_modal.lockSummary.filname,
                            text: item.assemblyLocation,
                        },
                        {
                            title: this.i18n.mission_modal.lockSummary.source_path,
                            text: item.sourceLocation,
                        },
                        {
                            title: this.i18n.mission_create.kcore,
                            text: taskData.kcore
                                ? this.i18n.process.enable
                                : this.i18n.process.disable,
                            requier: '',
                        },
                        {
                            title:
                                this.i18n.falsesharing.filesize +
                                ' ' +
                                this.i18n.ddr.leftParenthesis +
                                'MiB' +
                                this.i18n.ddr.rightParenthesis,
                            text: item.collect_file_size,
                        },
                    ];
                    let diffArr = [];
                    if (item['analysis-target'] === 'Profile System') {
                        diffArr = [
                            {
                                title: this.i18n.mission_modal.syslock.duration,
                                text: item.duration,
                            },
                        ];
                    } else if (item['analysis-target'] === 'Launch Application') {
                        diffArr = [
                            {
                                title: this.i18n.mission_modal.cProcess.app_path,
                                text: item['app-dir'],
                            },
                            {
                                title: this.i18n.mission_modal.syslock.app_params,
                                text: item['app-parameters'],
                            },
                        ];
                    } else if (item['analysis-target'] === 'Attach to Process') {
                        diffArr = [
                            {
                                title: this.i18n.mission_create.process_alias,
                                text: decodeURIComponent(item.process_name) || '--',
                            },
                            {
                                title: this.i18n.common_term_task_crate_pid,
                                text: item['target-pid'] || '--',
                            },
                            {
                                title: this.i18n.mission_modal.syslock.duration,
                                text: item.duration,
                            },
                        ];
                    }
                    item.configList = [...nameArr, ...diffArr, ...publicArr];
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
                                title: this.i18n.ddr.analysisMode,
                                text: taskData['analysis-target'],
                                requier: '',
                            }, // 分析类型
                        ];
                    }

                    const publicArr1 = [
                        {
                            title: this.i18n.mission_modal.syslock.cpu_interval,
                            text: item.interval,
                        }, // 采样间隔（毫秒）
                        {
                            // 采样范围
                            title: this.i18n.ddr.samplingRange,
                            text: Utils.formattingSamplingRange(
                                this.i18n,
                                item.samplingSpace.label
                            ),
                        },
                    ];
                    const publicArr2 = [
                        {
                            title: this.i18n.mission_modal.lockSummary.filname,
                            text: item.assemblyLocation,
                        }, // 符号文件路径
                        {
                            title: this.i18n.mission_modal.lockSummary.source_path,
                            text: item.sourceLocation,
                        }, // C/C++源文件路径
                        {
                            title: this.i18n.mission_create.kcore,
                            text: taskData.kcore
                                ? this.i18n.process.enable
                                : this.i18n.process.disable,
                            requier: '',
                        },
                        {
                            // 采集文件大小
                            title:
                                this.i18n.falsesharing.filesize +
                                ' ' +
                                this.i18n.ddr.leftParenthesis +
                                'MiB' +
                                this.i18n.ddr.rightParenthesis,
                            text: item.size,
                        },
                    ];
                    let diffArr1 = [];
                    let diffArr2 = [];
                    if (item['analysis-target'] === 'Profile System') {
                        diffArr1 = [
                            {
                                title: this.i18n.mission_modal.syslock.duration,
                                text: item.duration,
                            }, // 采样时长
                        ];
                        diffArr2 = [
                            { title: this.i18n.micarch.cpu_kernel, text: item['cpu-mask'] },
                        ]; // 待采样CPU核
                    } else if (item['analysis-target'] === 'Launch Application') {
                        diffArr1 = [
                            {
                                title: this.i18n.mission_modal.cProcess.app_path,
                                text: item['app-dir'],
                            },
                            {
                                title: this.i18n.mission_modal.syslock.app_params,
                                text: item['app-parameters'],
                            },
                        ];
                    } else if (item['analysis-target'] === 'Attach to Process') {
                        diffArr1 = [
                            {
                                title: this.i18n.mission_create.process_alias,
                                text: decodeURIComponent(item.process_name) || '--',
                            },
                            {
                                title: this.i18n.common_term_task_crate_pid,
                                text: item['target-pid'] || '--',
                            },
                            {
                                title: this.i18n.mission_modal.syslock.duration,
                                text: item.duration,
                            },
                        ];
                    }
                    item.configList = [
                        ...nameArr,
                        ...diffArr1,
                        ...publicArr1,
                        ...diffArr2,
                        ...publicArr2,
                    ];
                } else if (analysisType === 'resource_schedule') {
                    // 资源调度
                    let nameArr = [
                        { key: this.i18n.task_name, text: taskData.taskname, requier: '' },
                    ];
                    if (taskData['analysis-target'] !== 'Profile System') {
                        nameArr = [
                            {
                                key: this.i18n.task_name,
                                text: taskData.taskname,
                                requier: '',
                            },
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
                    } else if (taskData['analysis-target'] === 'Launch Application') {
                        diffArr = [
                            {
                                key: this.i18n.common_term_task_crate_app_path,
                                text: taskData['app-dir'],
                            }, // 应用
                            {
                                key: this.i18n.common_term_task_crate_parameters,
                                text: taskData['app-parameters'],
                            }, // 应用参数
                        ];
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
                    }
                    item.configList = [...nameArr, ...diffArr, ...publicArr];
                } else if (analysisType === 'java-mixed-mode') {
                    // java混合模式
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
                                title: this.i18n.ddr.analysisMode,
                                text: taskData['analysis-target'],
                                requier: '',
                            }, // 分析类型
                        ];
                    }
                    const publicArr = [
                        {
                            title: this.i18n.mission_modal.syslock.cpu_interval,
                            text: item.interval,
                        }, // 采样间隔（毫秒）
                        {
                            // 采样范围
                            title: this.i18n.ddr.samplingRange,
                            text: Utils.formattingSamplingRange(
                                this.i18n,
                                item.samplingSpace.label
                            ),
                        },
                        {
                            title: this.i18n.common_term_task_crate_java_path,
                            text: item.javaSoucreLocation || '--',
                        }, // Java源文件路径
                        {
                            // 采集文件大小
                            title:
                                this.i18n.falsesharing.filesize +
                                ' ' +
                                this.i18n.ddr.leftParenthesis +
                                'MiB' +
                                this.i18n.ddr.rightParenthesis,
                            text: item.size,
                        },
                    ];
                    let diffArr = [];
                    if (item['analysis-target'] === 'Launch Application') {
                        diffArr = [
                            {
                                title: this.i18n.mission_modal.cProcess.app_path,
                                text: item['app-dir'],
                            },
                            {
                                title: this.i18n.mission_modal.syslock.app_params,
                                text: item['app-parameters'],
                            },
                        ];
                    } else if (item['analysis-target'] === 'Attach to Process') {
                        diffArr = [
                            {
                                title: this.i18n.mission_create.process_alias,
                                text: decodeURIComponent(item.process_name) || '--',
                            },
                            {
                                title: this.i18n.common_term_task_crate_pid,
                                text: item['target-pid'] || '--',
                            },
                            {
                                title: this.i18n.mission_modal.syslock.duration,
                                text: item.duration,
                            }, // 采样时长
                        ];
                    }
                    item.configList = [...nameArr, ...diffArr, ...publicArr];
                } else if (analysisType === 'hpc_analysis') {
                    let nameArr = [
                        {
                            key: this.i18n.task_name,
                            text: taskData.taskname,
                        },
                    ];
                    if (taskData['analysis-target'] !== 'Profile System') {
                        nameArr = [
                            {
                                key: this.i18n.task_name,
                                text: taskData.taskname,
                            },
                            {
                                // 分析类型
                                key: this.i18n.ddr.analysisMode,
                                text: taskData['analysis-target'],
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
                        taskData['analysis-target'] === AnalysisTarget.LAUNCH_APPLICATION
                    ) {
                        diffArr = [
                            {
                                key: this.i18n.mission_modal.hpc.mission_create.collectionType,
                                text: taskData.mpi_status === true ? 'MPI' : 'OpenMP',
                            },
                            {
                                key: this.i18n.mission_modal.hpc.mission_create.app_path,
                                text: taskData['app-dir'] || '--',
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
                        taskData['analysis-target'] === AnalysisTarget.ATTACH_TO_PROCESS
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
                    item.configList = [...nameArr, ...diffArr, ...publicArr];
                }
            });
            this.updataTable(autoUpdate);
        });
    }

    onClick(objId: number, idx: number) {
        if (this.tempStatus?.[objId]) {
            if (this.tempStatus[objId]?.[idx]) {
                this.tempStatus[objId][idx] = false;
            } else {
                this.tempStatus[objId][idx] = true;
            }
        } else {
            this.tempStatus[objId] = {};
            this.tempStatus[objId][idx] = true;
        }
    }

    /**
     * 刷新表格
     */
    updataTable(autoUpdate) {
        this.completeData = JSON.parse(JSON.stringify(this.data.templateList));
        if (autoUpdate) {
            this.srcData.data =
                this.toolType === ToolType.DIAGNOSE
                    ? this.completeData
                    : this.completeData.filter((val) => {
                        const t1 = this.ifTrue(
                            val['analysis-type'],
                            this.columns[2].selected
                        );
                        const t2 = this.ifTrue(
                            val.analysisTarget,
                            this.columns[1].selected
                        );
                        const test = t1 && t2;
                        return test;
                    });

            for (const row of this.srcData.data) {
                row.showDetails = this.isToggleOpened[row.id];
            }
            this.displayed = this.srcData.data;
        } else {
            this.srcData.data = this.data.templateList;
        }
        if (this.completeData.length === 0) {
            this.nodataTips = this.i18n.mission_create.templateNoData;
        }
    }

    /**
     * 处理采集日期
     * @param obj obj
     */
    public handleColectDate(obj: any) {
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
    handleObj(val: any) {
        let arr = [];
        arr = val.type.map((item) => {
            return this.taskType[item];
        });
        return arr.join(',');
    }
    /**
     * 解码
     * @param str 乱码
     */
    public decoding(str) {
        return decodeURIComponent(str);
    }

    /**
     * 刷新图标状态变化
     * @param status 图标状态
     * @param prop 列名
     */
    public imgStatusChange(status: string, prop: string) {
        this.filterImgStatus[prop] = this.filterImgStatusList[status];
    }
}
