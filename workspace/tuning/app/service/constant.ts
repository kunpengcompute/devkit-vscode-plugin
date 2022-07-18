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
 * 运行环境名称
 */
export const enum ENV_APP_NAME {
    CLOUDIDE = 'CloudIDE'
}

/**
 * cloudIDE默认ip
 */
export const enum DEFAULT_IP {
    CLOUDIDE_DEFAULT_IP = '127.0.0.1'
}

/**
 * 下载的文件格式
 */
export const enum REPORT_SCV_HTML {
    CSV = 'csv',
    HTML = 'html'
}

/**
 * 颜色主题
 */
export const enum COLOR_THEME {
    Dark = 1,
    Light = 2
}

/**
 * 后台portworker状态
 */
export const enum PortWorkerStatus {
    PROGRESS_WAIT_WORKER_STATUS = '0x010a00',  // 无可用worker资源,任务等待中
    CREATE_TASK_LACKWORKER_STATUS = '0x010a01',  // worker为1~3
    CREATE_TASK_NOWORKER_STATUS = '0x010a10'  // worker 为0
}

export const enum HttpStatus {
    STATUS_SUCCESS_200 = 200,
}
