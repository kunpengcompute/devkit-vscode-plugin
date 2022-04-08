/*
 * Copyright 2022 Huawei Technologies Co., Ltd
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { I18nService } from './i18nservice';

export const TOOL_NAME_DEP = 'dep';
export const TOOL_NAME_PORTING = 'porting';
export const TOOL_NAME_PERF = 'perfadvisor';

/**
 * perfadvisor 子模块
 */
export enum PERF_SUBMODULE {
    // 性能工具主界面
    TOOL_USER_MANAGEMENT = 'userManagement',
    // 系统性能分析
    TOOL_SYSPERF_ADVISOR = 'sysPerf',
    // Java性能分析
    TOOL_JAVAPERF_ADVISOR = 'javaPerf',
    // 内存诊断
    TOOL_MEM_DIAGNOSE = 'diagnose',
    // 调优助手
    TOOL_TUNINGHELPER = 'tuningHelper',
}

/**
 * perfadvisor 用户角色
 */
export enum PERF_ROLE {
    // 管理员用户
    ADMIN = 'Admin'
}

/**
 * perfadvisor 各种值的异常初始数值
 */
export enum ABNORMAL_INIT_VALUE {
    // 管理员用户
    ABNORMAL_NUMBER = -1,
    ABNORMAL_STRING = '#'
}

/**
 * perfadvisor 用户是否首次登录
 */
export enum USER_FIRST_LOGIN {
    // 管理员用户
    IS_FIRST_LOGIN = 1,
    IS_NO_FIRST_LOGIN = 0
}

/**
 * perfadvisor 子模块base-URI
 */
export const enum PERF_SUBMODULE_URIS {
    // 性能工具主界面base-URI
    TOOL_USER_MANAGEMENT = '/user-management/api/v2.2',
    // 系统性能分析base-URI
    TOOL_SYSPERF_ADVISOR = '/sys-perf/api/v2.2',
    // Java性能分析base-URI
    TOOL_JAVAPERFADVISOR = '/java-perf/api',
}

/**
 * sysperf 隐藏按钮
 */
export const enum SYSPERF_URIS {
    // perfadvisor 系统调优工程查询接口
    PERF_SYSPERF_QUERY_URI = '/projects/',
    // perfadvisor 系统调优工程单个删除接口
    PERF_SYSPERF_DELETE_URI = '/projects/',
    // perfadvisor 退出接口
    PERF_LOG_OUT = '/users/session/1/',
    // 管理员查询用户列表接口
    PERF_QUERY_USERS_URI = '/users/'
}

/**
 * sysperf 导出进度
 */
export const enum SYSPERF_EXPORT {
    // perfadvisor 待导出
    SYSPERF_EXPORT_PRE = 'pre_export',
    // perfadvisor 正在打包
    SYSPERF_EXPORT_PACKAGING = 'packaging',
    // perfadvisor 导出成功
    SYSPERF_EXPORT_SUCCESS = 'export_success'
}


/**
 * sysperf 隐藏按钮
 */
export const enum JAVAPERF_URIS {
    // perfadvisor java调优工程查询接口
    GUARDIANS_QUERY_URI = '/guardians/',
    // 获取当前用户采样记录
    SAMPLE_RECORDS_URI = '/records',
    // 根据用户id获取采样记录
    SAMPLE_RECORDS_USERS_URI = '/records/user/',
    SAMPLE_THRESHOLD_URI = '/tools/settings/report/'// 获取采样记录阈值
}

export const NO_CREATE_PANLE_IDS = ['sourPorting', 'portingPrecheck'];
export const THRESHOLD_VALUE = 1.0;

/**
 * 调优助手URL
 */
export const enum TUNINGASSISTANTURIS {
    PROJECT_QUERY_URI = '/projects/',
}

/**
 * 系统工具节点系统性能分析sysPerf和Java性能分析javaPerf
 */
export const enum PERF_TREE_ROOT_NODES_IDS {
    sysPerf = 'sysPerf',
    javaPerf = 'javaPerf',
    diagnose = 'diagnose',
    tuningAssistant = 'tuningAssistant'
}

export const SYS_PERF_SUB_NODE = {
    normalTask: { label: I18nService.I18n().plugins_sysperf_normal_task, id: 'sysNormalTask' },
    linkageTask: { label: I18nService.I18n().plugins_sysperf_linkage_task, id: 'sysLinkageTask' },
};

export const TUNING_ASSISTANT_SUB_NODE = {
    normalTask: { label: I18nService.I18n().plugins_sysperf_tuning_analysis, id: 'tuningAssitantNormalTask' },
    compareTask: { label: I18nService.I18n().plugins_sysperf_compare_task, id: 'tuningAssitantCompareTask' },
};

/**
 * 性能分析主管理设置(用户管理，公共运行日志，公共操作日志，系统配置)
 * @param command  指令名称
 * @param fun 用来标识打开的功能
 * @param param 参数
 * @param page 页面路由
 */
export const PREF_SETTING_COMMAND_TERM = [
    { command: 'extension.view.perfUserManagement', func: '', param: { innerItem: 'itemUser' }, page: 'tunset' },
    { command: 'extension.view.perfLogin', func: '', param: { innerItem: 'itemLogin' }, page: 'tunset' },
    { command: 'extension.view.perfRunningLog', func: '', param: { innerItem: 'itemRunningLog' }, page: 'tunset' },
    { command: 'extension.view.perfOperationLog', func: '', param: { innerItem: 'itemOperationLog' }, page: 'tunset' },
    { command: 'extension.view.perfSysConfigure', func: '', param: { innerItem: 'itemSysConfigure' }, page: 'tunset' },
    { command: 'extension.view.webServerCert', func: '', param: { innerItem: 'itemWebServer' }, page: 'tunset' },
    { command: 'extension.view.weakPassword', func: '', param: { innerItem: 'itemWeakServer' }, page: 'tunset' },
    { command: 'extension.view.perfModifyPassword', func: '', param: { innerItem: 'itemModifypsw' }, page: 'tunset' },
];

/**
 * system性能分析管理设置(节点管理、任务模板管理、预约任务管理、运行日志、操作日志)指令组
 * @param command  指令名称
 * @param fun 用来标识打开的功能
 * @param param 参数
 * @param page 页面路由
 */
export const SYS_PREF_SETTING_COMMAND_TERM = [
    { command: 'extension.view.perfNodesManagement', func: '', param: { innerItem: 'itemNodeManaga' }, page: 'sysperfSettings' },
    { command: 'extension.view.perfTaskTemplateManagement', func: '', param: { innerItem: 'itemTaskModel' }, page: 'sysperfSettings' },
    {
        command: 'extension.view.sysPerfImportAndExportTask', func: '', param: { innerItem: 'itemImportAndExportTask' },
        page: 'sysperfSettings'
    },
    { command: 'extension.view.perfReservationTaskManagement', func: '', param: { innerItem: 'itemAppointTask' }, page: 'sysperfSettings' },
    { command: 'extension.view.sysPerfOperationLog', func: '', param: { innerItem: 'itemOperaLog' }, page: 'sysperfSettings' },
    { command: 'extension.view.perfLog', func: '', param: { innerItem: 'itemOperaLog' }, page: 'sysperfSettings' },
    { command: 'extension.view.agentServerCert', func: '', param: { innerItem: 'itemAgent' }, page: 'sysperfSettings' },
    { command: 'extension.view.sysPerfPath', func: '', param: { innerItem: 'applicationPath' }, page: 'sysperfSettings' },
];

/**
 * Guardian操作类型
 */
export const enum GUARDIAN_OPER_TYPE {
    ADD = 0,
    MOD,
    RESTART,
    DEL,
    DEL_COMPLETE,
    DEL_PART,
    DEL_OUT
}

/**
 * java性能分析子节点
 */
export const PERF_TREE_SUB_NODES_IDS_JAVA = [
    {
        id: 'guardianList', name: I18nService.I18n().plugins_javaperf_label_guardianList,
        module: PERF_SUBMODULE.TOOL_JAVAPERF_ADVISOR, contextValue: 'guardianList'
    },
    {
        id: 'profillingRecords', name: I18nService.I18n().plugins_javaperf_label_profillingRecords,
        module: PERF_SUBMODULE.TOOL_JAVAPERF_ADVISOR, contextValue: 'profillingRecords'
    },
    {
        id: 'samplingRecords', name: I18nService.I18n().plugins_javaperf_label_samplingRecords,
        module: PERF_SUBMODULE.TOOL_JAVAPERF_ADVISOR, contextValue: 'samplingRecords'
    },
    {
        id: 'savedReport', name: I18nService.I18n().plugins_javaperf_label_savedReport,
        module: PERF_SUBMODULE.TOOL_JAVAPERF_ADVISOR, contextValue: 'savedReport'
    }
];

export const PERF_TREE_SAVED_REPORT = [
    {
        id: 'heapdumpReport', name: I18nService.I18n().plugins_javapref_label_heapdumpReport,
        module: PERF_SUBMODULE.TOOL_JAVAPERF_ADVISOR, contextValue: 'javaPerfHeapdumpImport'
    },
    {
        id: 'threaddumpReport', name: I18nService.I18n().plugins_javapref_label_threaddumpReport,
        module: PERF_SUBMODULE.TOOL_JAVAPERF_ADVISOR, contextValue: 'javaPerfThreaddumpImport'
    },
    {
        id: 'gclogReport', name: I18nService.I18n().plugins_javapref_label_gclogReport,
        module: PERF_SUBMODULE.TOOL_JAVAPERF_ADVISOR, contextValue: 'javaPerfGclogImport'
    }
];

export const NODE_PAGE_MAP = new Map<string, any>([
    ['guardianList', { page: '/home' }],
    ['profillingRecords', { page: '/profiling/', param: {} }],
    ['samplingRecords', { page: '/sampling/', param: {} }],
    ['heapdumpReport', { page: '/heapdumpReport' }],
    ['threaddumpReport', { page: '/threaddumpReport' }],
    ['gclogReport', { page: '/gclogReport' }]
]);

/**
 * javaperf panelId枚举
 */
export const enum JAVAPERF_PANEL {
    // perfadvisor java调优工程查询接口
    PANEL_JAVAPERF_MANAGE = 'javaPerfManage',
    PANEL_RECORD_MANAGE = 'recordManage',
    PANEL_TARGET_ENVIROMENT = 'targetEnvirpoment'
}

export const PERF_JAVA_MANAGE_PAGE_MAP = new Map<string, any>([
    ['javaPerf', {
        page: '/javaperfsetting',
        cmdParam: [
            { cmd: 'javaPerf.view.item.javaSetting', param: { innerItem: 'itemguardianManage' }, cmdReg: true },
            { cmd: 'javaPerf.view.item.guardianManage', param: { innerItem: 'itemguardianManage' }, cmdReg: true },
            { cmd: 'javaPerf.view.item.runLog', param: { innerItem: 'itemRunLog' }, cmdReg: true },
            { cmd: 'javaPerf.view.item.operLog', param: { innerItem: 'itemOperaLog' }, cmdReg: true },
            { cmd: 'javaPerf.view.item.secretKey', param: { innerItem: 'itemSecretKey' }, cmdReg: true },
            { cmd: 'javaPerf.view.item.workingKey', param: { innerItem: 'itemWorkingkey' }, cmdReg: true },
            { cmd: 'javaPerf.view.item.samplingReportManage', param: { innerItem: 'itemReportManage' }, cmdReg: true },
            { cmd: 'javaPerf.view.item.profilingConfiguration', param: { innerItem: 'itemConfiguration' }, cmdReg: true },
        ],
        panelOption: {
            panelId: JAVAPERF_PANEL.PANEL_JAVAPERF_MANAGE, viewType: JAVAPERF_PANEL.PANEL_JAVAPERF_MANAGE,
            viewTitle: I18nService.I18n().plugins_javaperf_title_cfg, module: PERF_SUBMODULE.TOOL_JAVAPERF_ADVISOR
        }
    }],
    ['targetEnviroment', {
        page: '/targetEnviroment',
        cmdParam: [
            { cmd: 'javaPerf.view.item.addTargetEnvironment', param: { innerItem: 'targetEnviroiment' }, cmdReg: true },
        ],
        panelOption: {
            panelId: JAVAPERF_PANEL.PANEL_TARGET_ENVIROMENT, viewType: JAVAPERF_PANEL.PANEL_TARGET_ENVIROMENT,
            viewTitle: I18nService.I18n().plugins_javaperf_title_add_guardian, module: PERF_SUBMODULE.TOOL_JAVAPERF_ADVISOR
        }
    }],
    ['guardianList', {
        page: '/javaperfsetting',
        cmdParam: [
            { cmd: 'javaPerf.view.item.guardianManage', param: { innerItem: 'itemguardianManage' }, cmdReg: false }]
    }],
    ['profillingRecords', {
        page: '/recordmanage',
        cmdParam: [
            { cmd: 'javaPerf.view.item.profillingRecordManage', param: { innerItem: 'profillingAnalysisRecordManage' }, cmdReg: true },
            { cmd: 'javaPerf.view.item.importProfiling', cmdReg: true },
            { cmd: 'javaPerf.view.item.exportProfiling', cmdReg: true },
            { cmd: 'javaPerf.view.item.stopProfiling', cmdReg: true }],
        panelOption: {
            panelId: JAVAPERF_PANEL.PANEL_RECORD_MANAGE, viewType: JAVAPERF_PANEL.PANEL_RECORD_MANAGE,
            viewTitle: I18nService.I18n().plugins_javaperf_menu_analysisRecordManage, module: PERF_SUBMODULE.TOOL_JAVAPERF_ADVISOR
        }
    }],
    ['samplingRecords', {
        page: '/recordmanage',
        cmdParam: [
            { cmd: 'javaPerf.view.item.samplingRecordManage', param: { innerItem: 'samplingAnalysisRecordManage' }, cmdReg: true },
            { cmd: 'javaPerf.view.item.importSampling', cmdReg: true },
            { cmd: 'javaPerf.view.item.exportSampling', cmdReg: true },
            { cmd: 'javaPerf.view.item.deleteSampling', cmdReg: true }],
        panelOption: {
            panelId: JAVAPERF_PANEL.PANEL_RECORD_MANAGE, viewType: JAVAPERF_PANEL.PANEL_RECORD_MANAGE,
            viewTitle: I18nService.I18n().plugins_javaperf_menu_analysisRecordManage, module: PERF_SUBMODULE.TOOL_JAVAPERF_ADVISOR
        }
    }],
    ['heapdumpReport', {
        page: '/savedHeapdumpReport',
        cmdParam: [
            { cmd: 'javaPerf.view.item.exportHeapdumpReport', cmdReg: true },
            { cmd: 'javaPerf.view.item.deleteHeapdumpReport', cmdReg: true },
            { cmd: 'javaPerf.view.item.importHeapdumpReport', cmdReg: true }],
        panelOption: {
            panelId: 'savedHeapdumpReport', viewType: 'savedHeapdumpReport',
            viewTitle: '', module: PERF_SUBMODULE.TOOL_JAVAPERF_ADVISOR
        }
    }],
    ['threaddumpReport', {
        page: '/savedThreaddumpReport',
        cmdParam: [
            { cmd: 'javaPerf.view.item.exportThreaddumpReport', cmdReg: true },
            { cmd: 'javaPerf.view.item.deleteThreaddumpReport', cmdReg: true },
            { cmd: 'javaPerf.view.item.importThreaddumpReport', cmdReg: true }],
        panelOption: {
            panelId: 'savedThreaddumpReport', viewType: 'savedThreaddumpReport',
            viewTitle: '', module: PERF_SUBMODULE.TOOL_JAVAPERF_ADVISOR
        }
    }],
    ['gclogReport', {
        page: '/savedGclogReport',
        cmdParam: [
            { cmd: 'javaPerf.view.item.exportGclogReport', cmdReg: true },
            { cmd: 'javaPerf.view.item.deleteGclogReport', cmdReg: true },
            { cmd: 'javaPerf.view.item.importGclogReport', cmdReg: true }],
        panelOption: {
            panelId: 'savedGclogReport', viewType: 'savedGclogReport',
            viewTitle: '', module: PERF_SUBMODULE.TOOL_JAVAPERF_ADVISOR
        }
    }],
]);

/**
 * webview 类型
 */
export enum VIEW_TYPE {
    login = 'login',
    serverConfig = 'serverConfig',
    uninstall = 'perfUninstall',
    upgrade = 'perUpgrade',
    perfdisclaimer = 'perfDisclaimer',
    feedback = 'feedback',
    perfCreateTask = 'perfCreateTask',
    perfMultiple = 'perfMultiple',
    sysPerfMultiple = 'sysPerfMultiple',
    diagnoseMultiple = 'diagnoseMultiple',
    sysPerfProjectTaskNode = 'sysPerfProjectTaskNode',
    createProject = 'createProject',
    modifyProject = 'modifyProject',
    viewProject = 'viewProject',
    loading = 'loading',
    serverError = 'serverError',
    feedbackError = 'feedbackError',
    freeTrialRemoteEnvironment = 'freeTrialRemoteEnvironment',
    tuningAssistantMultiple = 'tuningAssistantMultiple'
}

/**
 * webview panel ID
 */
export enum PANEL_ID {
    perfMultiple = 'perfMultiple',
    perfNonServerConfig = 'perfNonServerConfig',
    perfInstall = 'perfInstall',
    perfUninstall = 'perfUninstall',
    perfUpgrade = 'perfUpgrade',
    perfNonLogin = 'perfNonLogin',
    perfUserMultiple = 'perfUserMultiple',
    sysPerfMultiple = 'sysPerfMultiple',
    diagnoseMultiple = 'diagnoseMultiple',
    perfCreatescSanTask = 'perfcreatescantask',
    perDeclare = 'perdeclare',
    feedback = 'feedback',
    perfDisclaimer = 'perfdisclaimer',
    perfCreateTask = 'perfCreateTask',
    createProject = 'createProject',
    modifyProject = 'modifyProject',
    viewProject = 'viewProject',
    loading = 'loading',
    sysPerfErrorInstruction = 'sysPerfBackendError',
    javaPerfErrorInstruction = 'javaPerfBackendError',
    profiling = 'profiling',
    downloadProfile = 'downloadProfile',
    targetEnvirpoment = 'targetEnvirpoment',
    perfFreeTrialRemoteEnvironment = 'perfFreeTrialRemoteEnvironment',
    tuningAssistantMultiple = 'tuningAssistantMultiple',
    sysperfAdviceError = 'sysperfAdviceError',
    javaperfAdviceError = 'javaperfAdviceError',
}

/**
 * 上下文 ID
 */
export const enum CONTEXT_VALUES {
    noProject = 'noProject',
    sysPerf = 'sysPerf',
    diagnose = 'diagnose',
    tuningAssistant = 'tuningAssistant',
    javaPerf = 'javaPerf',
    javaPerfProject = 'javaPerfProject',
    javaPerfProfiling = 'javaPerfProfiling',
    javaPerfDownloadProfile = 'javaPerfDownloadProfile',
    javaPerfSampling = 'javaPerfSampling',
    javaPerfSamplingDelete = 'javaPerfSamplingDelete',
    javaPerfHeapdump = 'javaPerfHeapdump',
    javaPerfHeapdumpDelete = 'javaPerfHeapdumpDelete',
    javaPerfThreaddump = 'javaPerfThreaddump',
    javaPerfThreaddumpDelete = 'javaPerfThreaddumpDelete',
    javaPerfGclog = 'javaPerfGclog',
    javaPerfGclogDelete = 'javaPerfGclogDelete',
    sysPerfProject = 'sysPerfProject',
    sysPerfProject_self = 'sysPerfProject_self',
    sysPerfProject_noself_admin = 'sysPerfProject_noself_admin',
    sysPerfProject_importProject = 'sysPerfProject_importProject',
    sysPerfProject_importTask = 'sysPerfProject_importTask',
    sysPerfProjectTask = 'sysPerfProjectTask',
    sysPerfProjectTaskNode = 'sysPerfProjectTaskNode',
    sysPerfProjectTask_isCreated = 'sysPerfProjectTask_isCreated',
    sysPerfProjectTask_isReserved = 'sysPerfProjectTask_isReserved',
    sysPerfProjectTask_isCompleted = 'sysPerfProjectTask_isCompleted',
    sysPerfProjectTask_isRunning = 'sysPerfProjectTask_isRunning',
    sysPerfProjectTask_isRunning_self = 'sysPerfProjectTask_isRunning_self',
    sysPerfProjectTask_isCreated_self = 'sysPerfProjectTask_isCreated_self',
    sysPerfProjectTask_isReserved_self = 'sysPerfProjectTask_isReserved_self',
    sysPerfProjectTask_isCompleted_self = 'sysPerfProjectTask_isCompleted_self',
    sysPerfProjectTask_isCreated_noself_admin = 'sysPerfProjectTask_isCreated_noself_admin',
    sysPerfProjectTask_isReserved_noself_admin = 'sysPerfProjectTask_isReserved_noself_admin',
    sysPerfProjectTask_isCompleted_noself_admin = 'sysPerfProjectTask_isCompleted_noself_admin',
    sysFolderNormalTask = 'sysFolderNormalTask',
    sysFolderLinkageTask = 'sysFolderLinkageTask',
    linkageTask = 'linkageTask',
    linkageTaskSelf = 'linkageTaskSelf',
    linkageTaskAdmin = 'linkageTaskAdmin',
    diagnoseProject = 'diagnoseProject',
    diagnoseProjectSelf = 'diagnoseProjectSelf',
    diagnoseProjectImport = 'diagnoseProjectImport',
    diagnoseProjectAdmin = 'diagnoseProjectAdmin',
    diagnoseTaskCreatedSelf = 'diagnoseTaskCreatedSelf',
    diagnoseTaskImport = 'diagnoseTaskImport',
    diagnoseTaskCreated = 'diagnoseTaskCreated',
    diagnoseTaskReservedSelf = 'diagnoseTaskReservedSelf',
    diagnoseTaskReserved = 'diagnoseTaskReserved',
    diagnoseTaskRunningSelf = 'diagnoseTaskRunningSelf',
    diagnoseTaskRunning = 'diagnoseTaskRunning',
    diagnoseTaskCompletedSelf = 'diagnoseTaskCompletedSelf',
    diagnoseTaskCompleted = 'diagnoseTaskCompleted',
    tuningAssistantTaskReanalyze = 'tuningAssistantTaskReanalyze',
    tuningAssistantTaskStop = 'tuningAssistantTaskStop',
    tuningAssistantTaskDelete = 'tuningAssistantTaskDelete',
    tuningAssistantTaskNormal = 'tuningAssistantTaskNormal',
    tuningAssistantTassNoOpreate = 'tuningAssistantTassNoOpreate',
    tuningAssistantNodeRA = 'tuningAssistantNodeRA',
    tuningAssistantNodeA = 'tuningAssistantNodeA',
    tuningAssistantFolderNormalTask = 'tuningAssistantFolderNormalTask',
    tuningAssistantFolderCompareTask = 'tuningAssistantFolderCompareTask',
}

/**
 * 调优助手左侧树上下文ID
 */
export const enum TUNING_ASSISTANT_CONTEXT_VALUE {
    tuningAssistantProject = 'tuningAssistantProject',
    tuningAssistantProjectSelf = 'tuningAssistantProjectSelf',
    tuningAssistantProjectAdmin = 'tuningAssistantProjectAdmin',
}

/**
 * project 状态枚举
 */
export const enum PROJECT_STATUS {
    NORMAL = 'normal',
    ABNORMAL = 'abnormal',
}


/**
 * 弹框类型枚举
 */
export const enum NAVIGATE_PAGE {
    config = 'config',
    tunset = 'tunset',
    install = 'install',
    uninstall = 'uninstall',
    upgrade = 'upgrade',
    home = 'home',
    importTask = 'import',
    login = 'login',
    nodeManagement = 'nodeManagement',
    configuration = 'configuration',
    configurationlog = 'configurationlog',
    function = 'function',
    flame = 'flame',
    test = 'test',
    timeChart = 'timeChart',
    sysperfSettings = 'sysperfSettings',
    add = 'add',
    createProject = 'createProject',
    modifyProject = 'modifyProject',
    viewProject = 'viewProject',
    loading = 'loading',
    javaperfsetting = 'javaperfsetting',
    targetEnviroment = 'targetEnviroment',
    recordmanage = 'recordmanage',
    freeTrialProcessEnvironment = 'freeTrialProcessEnvironment',
    tuningAssistantTaskInfoLog = 'tuningAssistantTaskInfoLog'
}

/**
 * 提示信息类型
 */
export const enum MESSAGE_TYPE {
    INFO = 'info',
    ERROR = 'error',
    WARNING = 'warn',
}

/**
 * project 状态图标路径枚举
 */
export const enum PROJECT_STATUS_PIC {
    NORMAL = 'normal.svg',
    ABNORMAL = 'abnormal.svg',
    IMPORTPROJECT = 'importPro.svg',
}

/**
 * 深浅色图片路径
 */
export const enum PIC_PATH {
    DARK_BASE_PATH = '/src/extension/assets/dark/',
    LIGHT_BASE_PATH = '/src/extension/assets/light/',
}

/**
 * task 状态枚举
 */
export const enum TASK_STATUS {
    CREATED = 'Created',
    WAITING = 'Waiting',
    SAMPLING = 'Sampling',
    ANALYZING = 'Analyzing',
    STOPPING = 'Stopping',
    CANCELLING = 'Cancelling',
    COMPLETED = 'Completed',
    FAILED = 'Failed',
    RUNNING = 'running',
    CANCELLED = 'Cancelled',
}


/**
 * task 状态图标路径枚举
 */
export const enum TASK_STATUS_PIC {
    CREATED = 'laterrun.svg',
    RESERVATIONTASK = 'reservationtask.svg',
}

/**
 * node 状态枚举
 */
export const enum NODE_STATUS {
    CREATED = 'Created',
    WAITING = 'Waiting',
    COMPLETED = 'Completed',
    ABORTED = 'Aborted',
    FAILED = 'Failed',
    SAMPLING = 'Sampling',
    CANCELLED = 'Cancelled',
    ANALYZING = 'Analyzing',
    STOPPING = 'Stopping',
    CANCELLING = 'Cancelling',
}

/**
 * task 状态图标路径枚举
 */
export const enum NODE_STATUS_PIC {
    COMPLETED = 'normal.svg',
    ABORTED = 'normal.svg',
    CREATED = 'laterrun.svg',
    WAITING = 'laterrun.svg',
    FAILED = 'abnormal.svg',
    CANCELLED = 'abnormal.svg',
    SAMPLING = 'loading.gif',
    STOP = 'stop.svg',
    JAVAPERF_SAMPLE_DONE = 'sample-done.svg',
    JAVAPERF_SAMPLE_DOING = 'sample-doing.gif',
    JAVAPERF_CONTAINER_CONNECTED = 'container-connected.svg',
    JAVAPERF_CONTAINER_DISCONNECTED = 'container-disconnected.svg',
    JAVAPERF_CONTAINER_CREATING = 'container-creating.svg',
    JAVAPERF_PHYSICS_CONNECTED = 'physics-connected.svg',
    JAVAPERF_PHYSICS_DISCONNECTED = 'physics-disconnected.svg',
    JAVAPERF_PHYSICS_CREATING = 'physics-creating.svg',
    JAVAPERF_PROFILING = 'guardian-creating.gif'
}


// 调用后端服务器接口成功
export const STATUS_SUCCESS = 0;
// 调用后端服务器接口失败
export const STATUS_FAILED = 1;
// 调用后端服务器接口磁盘空间不足
export const STATUS_INSUFFICIENT_SPACE = 2;

// porting模块的免责声明
export const PORT_DESCLAIMER_CONF = 'disclaimer';


/* 未确认免责声明前可以打开的页面
 *module: 模块
 *desclaimer: context.globalState中免责声明的缓存参数
 *panels: 未确认免责声明仍然可以打开的页面
 */
export const DESCLAIMER_BYPASS = [
    {
        module: 'sysPerf',
        desclaimer: PORT_DESCLAIMER_CONF,
        panels: [
            PANEL_ID.perfNonLogin,
            PANEL_ID.perfNonServerConfig,
            PANEL_ID.perfUninstall,
            PANEL_ID.perfInstall,
            PANEL_ID.perfUpgrade,
            PANEL_ID.sysPerfErrorInstruction,
            PANEL_ID.javaPerfErrorInstruction,
            PANEL_ID.perfFreeTrialRemoteEnvironment
        ]
    }
];
/**
 * http 状态枚举
 */
export const enum HTTP_STATUS {
    HTTP_200_OK = 200,
    HTTP_401_UNAUTHORIZED = 401,
    HTTP_404_NOTFOUND = 404,
    HTTP_408_REQUEST_TIMEOUT = 408,
    HTTP_500_SERVERERROR = 500,
    HTTP_502_SERVERERROR = 502,
    HTTP_503_SERVERERROR = 503,
    HTTP_400_BAD_REQUEST = 400,
    HTTP_409_CONFLICT = 409,
    HTTP_407_SERVERERROR = 407,
    HTTP_507_SERVERERROR = 507
}

/**
 * http 状态码枚举
 */
export const enum HTTP_STATUS_CODE {
    SYSPERF_SUCCESS = 'SysPerf.Success',
    USERMANAGE_SUCCESS = 'UserManage.Success',
    USERMANAGE_FIRST_LOGIN = 'UserManage.session.Post.FirstLogin'
}

/**
 * 颜色主题
 */
export const enum COLOR_THEME {
    Dark = 1,
    Light = 2
}

/**
 * 一键式安装卸载升级脚本路径
 */
export const enum SHELL_FILE_PATH {
    WORKDIR = '/tmp/vscode'
}

/**
 * 打开新的的webview消息类型
 */
export const enum OPEN_NEWPAGE_MGS_TYPE {
 PathToDetail = 'pathToDetail',  // 分析路径跳转任务详情
 DetailToPath = 'detailToPath', // 优化建议详情页跳转分析路径
 TuningViewSysReport = 'tuningViewSysReport',  // 优化建议详情页查看sys任务分析报告
 TuningCreateDiagnoseTask = 'tuningCreateDiagnoseTask',  // 调优助手优化建议详情页创建内存诊断分析任务
 TuningViewDiagnoseReport = 'tuningViewDiagnoseReport',  // 调优助手优化建议详情页查看内存诊断分析报告
}

