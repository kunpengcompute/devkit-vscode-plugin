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

import { MenuHelper } from './toolmenu/menu-helper';
import { I18nService } from './i18nservice';
import { ReportHelper } from './report-helper';

export const TOOL_NAME_DEP = 'dep';
export const TOOL_NAME_PORTING = 'porting';
export const TOOL_NAME_SOFTWARE_PACKAGE = 'softwarepkg';

/**
 * 软件迁移评估
 */
export const enum BINARY_URIS {
    // 软件迁移评估历史报告查询接口
    PORT_REPORT_QUERY_URI = '/portadv/binary/',
    // 删除单个软件迁移评估历史报告接口
    PORT_REPORT_DELETE_URI = '/portadv/binary/report/',
    // 清空软件迁移评估历史报告
    PORT_REPORT_DELETE_ALL_URI = '/portadv/binary/',
}

/**
 * porting 隐藏按钮
 */
export const enum PORTING_URIS {
    // Porting 历史报告查询接口
    PORT_REPORT_QUERY_URI = '/portadv/tasks/',
    // Poorting 删除单个历史报告接口
    PORT_REPORT_DELETE_URI = '/portadv/tasks/report/',
    // porting清空历史报告接口
    PORT_REPORT_CLEAR_URI = '/portadv/tasks/all/',
    // Porting 退出接口
    PORTING_LOG_OUT = '/users/logout/'
}

/**
 * 软件包重构 隐藏按钮
 */
export const enum SOFTWARE_PACKAGE_URLS {
    // softwarepkg 删除单个历史报告、清空历史报告接口
    SOFTWAREPKG_REPORT_DELETE_URL = '/portadv/autopack/history/',
    // softwarepkg 历史报告查询接口
    SOFTWAREPKG_REPORT_QUERY_URL = '/portadv/autopack/history/',
    // softwarepkg 下载软件重构包接口
    SOFTWAREPKG_PACKAGE_DOWNLOAD_URL = '/porting/api/portadv/download/',
    // softwarepkg cloudIDE下载软件重构包接口
    SOFTWAREPKG_DOWNLOAD_PKG = '/opt/portadv/portadmin/report/packagerebuild/'
}

/**
 * 深浅色图片路径
 */
export const enum PIC_PATH {
    DARK = '/src/extension/assets/dark/',
    LIGHT = '/src/extension/assets/light/',
}

/**
 * porting 左侧树根节点ID枚举
 */
export const enum PORTING_ROOT_NODE_ID {
    SRC_PORTING = 'sourPorting',
    PKG_REBUILD = 'softBuild',
    SOFT_PORTING = 'softPorting',
    MODE_PRECHECK = 'portingPrecheck',
    MIG_APPRAISE = 'portingAppraise'
}
/**
 * 上下文 ID
 */
export const enum CONTEXT_VALUES {
    depreport = 'depreport',
    portreport = 'portreport',
    portsource = 'portsource',
    softBuild = 'softBuild',
    softPorting = 'softPorting',
    portingPrecheck = 'portingPrecheck',
    preCheckDetail = 'preCheckDetail',
    portingAppraise = 'portingAppraise',
    pkgRebuildF = 'pkgRebuildF',  // 软件包重构失败
    pkgRebuildS = 'pkgRebuildS',  // 软件包重构成功
}

export const PORTING_MENU_PARAM = [
    {
        id: PORTING_ROOT_NODE_ID.MIG_APPRAISE,
        label: I18nService.I18n().plugins_port_migration_appraise,
        contextValue: CONTEXT_VALUES.portingAppraise,
        getChildren: ReportHelper.getDepReportList,
        extHandler: ReportHelper.extHandlerDep
    },
    {
        id: PORTING_ROOT_NODE_ID.SRC_PORTING,
        label: I18nService.I18n().port_source_migrate,
        contextValue: CONTEXT_VALUES.portsource,
        getChildren: ReportHelper.getPortReportList,
        extHandler: ReportHelper.extHandlerPorting
    },
    {
        id: PORTING_ROOT_NODE_ID.PKG_REBUILD,
        label: I18nService.I18n().port_software_build, contextValue: CONTEXT_VALUES.softBuild,
        getChildren: MenuHelper.getPkgRebuildHis,
        childrenParam: {
            iconPath: MenuHelper.getPkgRebuildIcon
        },
        extHandler: ReportHelper.extHandlerSoftwarepkg
    },
    {
        id: PORTING_ROOT_NODE_ID.SOFT_PORTING,
        label: I18nService.I18n().port_software_migration,
        contextValue: CONTEXT_VALUES.softPorting
    },
    {
        id: PORTING_ROOT_NODE_ID.MODE_PRECHECK,
        label: I18nService.I18n().plugins_porting_enhance_function_label,
        contextValue: CONTEXT_VALUES.portingPrecheck,
        getChildren: MenuHelper.getPreCheckNodes
    }
];
export const PORTING_TOKEN = 'portingToken';
export const PORTING_SESSION = 'portingSession';
export const PORTING_ADMIN = 'Admin';
export const NO_CREATE_PANLE_IDS = ['sourPorting', 'portingPrecheck', 'portingAppraise', 'softBuild'];
export const THRESHOLD_VALUE = 1.0;

/**
 * webview 类型
 */
export const enum VIEW_TYPE {
    report = 'report',
    login = 'login',
    serverConfig = 'serverConfig',
    createTask = 'createTask',
    multipleview = 'multipleview',
    disclaimerView = 'disclaimer',
    uninstallView = 'uninstall',
    upgradeView = 'upgrade',
    serverError = 'serverError',
    portPreCheck = 'PortingPre-check',
    portAppraise = 'migrationAppraise',
    freeTrialRemoteEnvironment = 'freeTrialRemoteEnvironment',
    adviceLinkError = 'adviceLinkError'
}

/**
 * 弹框类型枚举
 */
export const enum NAVIGATE_PAGE {
    portsettings = 'portsettings'
}

/**
 * webview panel ID
 */
export const enum PANEL_ID {
    portNonServerConfig = 'portNonServerConfig',
    portInstall = 'portInstall',
    portUnInstall = 'portUnInstall',
    portUpgrade = 'portUpgrade',
    portNonLogin = 'portNonLogin',
    portMultipleview = 'depmultipleview',
    portCreatescSanTask = 'portcreatescantask',
    portDisclaimerView = 'portdisclaimer',
    portErrorInstruction = 'portBackendError',
    portPreCheck = 'PortingPre-check',
    portAppraise = 'migrationAppraise',
    portSoftBuild = 'softBuild',
    portSoftPorting = 'softPorting',
    portCheckFile = 'checkFile',
    portFreeTrialRemoteEnvironment = 'portFreeTrialRemoteEnvironment',
    portAdviceError = 'portAdviceError'
}

// 调用后端服务器接口成功
export const STATUS_SUCCESS = 0;
// 调用后端服务器接口失败
export const STATUS_FAILED = 1;
// 调用后端服务器接口磁盘空间不足
export const STATUS_INSUFFICIENT_SPACE = 2;

/**
 * http 状态枚举
 */
export const enum HTTP_STATUS {
    HTTP_200_OK = 200,
    HTTP_401_UNAUTHORIZED = 401,
    HTTP_404_NOTFOUND = 404,
    HTTP_413_UPLOADFAILED = 413,
    HTTP_502_SERVERERROR = 502,
    HTTP_406_NOTACCEPTABLE = 406,
    TIMEOUT_10000 = 10000,
    HTTP_423_LOCKED = 423
}

/**
 * 历史报告阈值预警
 */
export const enum HISTORY_REPORT_NUM_STATUS {
    FREE = 1,
    SAFE = 2,
    DANGEROUS = 3
}

// porting模块的免责声明
export const PORT_DESCLAIMER_CONF = 'portDisclaimer';


/* 未确认免责声明前可以打开的页面
 *module: 模块
 *desclaimer: context.globalState中免责声明的缓存参数
 *panels: 未确认免责声明仍然可以打开的页面
 */
export const DESCLAIMER_BYPASS = [
    {
        module: TOOL_NAME_PORTING,
        desclaimer: PORT_DESCLAIMER_CONF,
        panels: [
            PANEL_ID.portNonLogin,
            PANEL_ID.portNonServerConfig,
            PANEL_ID.portErrorInstruction,
            PANEL_ID.portInstall,
            PANEL_ID.portUnInstall,
            PANEL_ID.portUpgrade,
            PANEL_ID.portFreeTrialRemoteEnvironment
        ]
    }
];

/**
 * 增强功能
 */
export const enum ENHANCE_TYPE {
    PRECHECK = 1,
    BYTE_ALGIN = 2,
    WEAK_MEMORY = 3
}

/**
 * 颜色主题
 */
export const enum COLOR_THEME {
    Dark = 1,
    Light = 2
}

/**
 * 源码建议类型
 */
export enum suggestionType {
    suggestionType100 = 100, // avx2neon.h的quickfix类型
    suggestionType200 = 200, // avx2neon.h的quickfix类型
    suggestionType300 = 300, // avx2neon.h的quickfix类型
    suggestionType400 = 400, // .S纯汇编文件，只有模糊建议的quickfix类型
    suggestionType500 = 500, // .c.h文件，可以给出替换代码的quickfix类型
    suggestionType600 = 600, // .c.h文件，只有模糊建议的quickfix类型
    suggestionType700 = 700, // .c.h文件，只有模糊建议的quickfix类型
    suggestionType800 = 800, //  CMakeList 、Makefile文件，只有模糊建议的quickfix类型
    suggestionType900 = 900, // fortran文件，只有模糊建议的quickfix类型
    suggestionType1000 = 1000, // 针对包含预处理的文件的quickfix类型
    suggestionType1010 = 1010, // 预编译、win宏的quickfix类型
    suggestionType1100 = 1100, // 全汇编翻译的quickfix类型
    suggestionType1200 = 1200, // 全汇编翻译的quickfix类型
    suggestionType1300 = 1300, // 需要添加KunpengTrans.h头文件的quickfix类型
    suggestionType1400 = 1400, // fortran相关文件中移植关键字有明确建议
    suggestionType1500 = 1500, // fortran相关文件中移植的内建函数有明确建议
    suggestionType1600 = 1600, //  c/c++源码中使用特殊头文件有提示建议的quickfix类型
    suggestionType1996 = 1996,
    suggestionType2200 = 2200, // 内嵌汇编等文件中移植关键字有模糊建议的quickfix类型
    suggestionType2500 = 2500, // c/c++中特殊结构的模糊建议的quickfix类型
    suggestionType2600 = 2600, // python扫描到加载so的提示
    suggestionType2700 = 2700, // java扫描到加载so的提示
    suggestionType2800 = 2800, // scala扫描到加载so的提示
}


/**
 * 支持批量修改的源码建议类型
 */
export enum replaceAllSuggestionType {
    suggestionType100 = 100,
    suggestionType200 = 200,
    suggestionType300 = 300,
    suggestionType500 = 500,
    suggestionType600 = 600,
    suggestionType700 = 700,
    suggestionType1010 = 1010, // 预编译、win宏的quickfix类型
    suggestionType1000 = 1000,
    suggestionType1100 = 1100,
    suggestionType1300 = 1300,
    suggestionType1400 = 1400,
    suggestionType1500 = 1500,
    suggestionType1600 = 1600,
    suggestionType2200 = 2200,
}

/**
 * 全量替换不加空行的替换类型
 */
export const doNotAddBlankSuggestionType =
  [suggestionType.suggestionType1010,
      suggestionType.suggestionType2200];

/**
 * 一键式安装卸载升级脚本路径
 */
export const enum SHELL_FILE_PATH {
    WORKDIR = '/tmp/vscode'
}

/**
 * 运行环境名称
 */
export const enum ENV_APP_NAME {
    CLOUDIDE = 'CloudIDE'
}
/**
 * cloudIDE默认配置
 */
export const enum CLOUDIDE_DEFAULT_CONFIG {
    DEFAULT_IP = '127.0.0.1',
    DEFAULT_PORT = '8084'
}

/**
 * 后台portworker状态
 */
export const enum PortWorkerStatus {

    // 任务分析状态
    PROGRESS_WAIT_WORKER_STATUS = '0x010a00',  // 无可用worker资源,任务等待中
    PROGRESS_WAIT_WORKER_TIMEOUT_STATUS = '0x010a11',  // 任务等待worker超时
}

/**
 * 缓存行检查任务状态
 */
export const enum CacheLineStatus {
    // 缓存行对齐检查
    CACHE_CHECK_TASK_SCAN_SUCCESS = '0x0d0c00', // 检查成功
    CACHE_CHECK_TASK_RUNNING = '0x0d0c01', // 任务运行中
    CACHE_CHECK_TASK_NO_PORTED = '0x0d0c02', // 无需要迁移
    CACHE_CHECK_TASK_NOT_EXIST = '0x0d0c11', // 任务不存在
    CACHE_CHECK_TASK_SCAN_FAIL = '0x0d0c12', // 扫描失败
}

/**
 * 右下角消息弹框类型
 */
export const enum MessageType {
    INFO = 'info',
    WARN = 'warning',
    ERROR = 'error',
}
