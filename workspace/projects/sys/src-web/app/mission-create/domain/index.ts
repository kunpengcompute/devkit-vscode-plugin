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

export * from './task.model';
export * from './node.model';
export * from './order.model';
export * from './database.model';
export { TaskDetailMode } from 'projects/sys/src-web/app/domain';

/**
 * 任务名称 和 任务参数
 */
export interface AppAndParams {
    app: string;
    params?: string;
}

/**
 * PID 和 进程名称
 */
export interface PidProcess {
    pid?: string; // pid 的值
    process?: string; // 进程名称
}

export interface RunUser {
    runUser: boolean;
    user: string;
    password: string;
}
