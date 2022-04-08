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

export const MemPerfUrl = {
    toolTask: '/diagnostic-tasks/',
    project: '/diagnostic-project/',
    task: '/memory-tasks/task-summary/',
    logs: '/diagnostic-operation-logs/',
    nodes: '/nodes/?analysis-type=memory_diagnostic',
    configSystem: '/config/system/?analysis-type=memory_diagnostic',
    certificates: '/certificates/?analysis-type=memory_diagnostic',
    fingerPrint: '/nodes/None/finger-print/?analysis-type=memory_diagnostic',
    taskDownload: '/import_export_tasks/download/?analysis-type=memory_diagnostic',
    taskTrunkNumber: '/import_export_tasks/get_chunk_number/?analysis-type=memory_diagnostic',
    tasksIndex: '/import_export_tasks/index/?analysis-type=memory_diagnostic',
    uploadSuccess: '/import_export_tasks/upload_success/?analysis-type=memory_diagnostic',
    workKey: '/work-keys/?analysis-type=memory_diagnostic',
    runlogUpdata: '/run-logs/update/?analysis-type=memory_diagnostic'
};
