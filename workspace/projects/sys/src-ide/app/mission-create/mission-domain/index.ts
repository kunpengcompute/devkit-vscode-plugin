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

/**
 * 详情展示的对象
 */
export enum DetailTarget {
    TEMPLATE_DETAIL = 'templateDetail',
    RESERVATION = 'reservation',
    TEMPLATE_IMPORT = 'templateImport',
}


/**
 * 任务名称 和 任务参数
 */
export interface AppAndParams {
    app: string;
    params: string;
}


/**
 * PID 和 进程名称
 */
export interface PidProcess {
    pid?: string; // pid 的值
    process?: string; // 进程名称
}

/**
 *  分析对模式枚举
 */
export enum AnalysisModeEnum {
    PROFILE_SYSTEM = 'Profile System',
    LAUNCH_APPLICATION = 'Launch Application',
    ATTACH_TO_PROCESS = 'Attach to Process',
}


/**
 *  分析对象枚举
 */
export enum AnalysisTargetEnum {
    SYSTEM = 'System',
    APPLICATION = 'Application',
}

/**
 * 任务的执行类型
 */
export enum TaskActionType {
    EDIT = 'edit',
    RESTART = 'restart',
    CREATE = 'create',
    SCHEDULEEDIT = 'scheduleEdit'
}

/**
 * 预约定时启动的数据结构
 */
export interface OrderConfig {
    cycle: boolean; // 是否周期采集
    cycleStart?: string; // 采集开始时间
    cycleStop?: string; // 采集截止时间
    targetTime?: string; // 采集时间
    appointment?: string; // TODO
}

/**
 * TaskDetail
 */
export interface TaskDetail {
    'analysis-target': string;
    'analysis-type': string;
    children: any;
    createtime: string;
    expanded: boolean;
    id: number;
    label: string;
    level: string;
    nodeList: [];
    ownerId: string;
    parent: string;
    parentNode: any;
    status: string;
    status_code: string;
    switch: boolean;
    'task-status': string;
    task_data: any;
    task_info: string;
    task_param: any;
    taskname: string;
    timeconsuming: any;
}

/**
 * 指定运行用户下发启动任务的数据结构
 */
export interface RunUserDataObj {
    [key: string]: {
        user_name: string,
        password: string
    };
}


/* launch-application模式下。应用运行用户信息 */
export interface LaunchRunUser {
    [key: string]: {
        runUser: boolean,
        user_name: string;
        password: string;
    };
}
export interface RunUser {
    runUser: boolean;
    user: string;
    password: string;
}
