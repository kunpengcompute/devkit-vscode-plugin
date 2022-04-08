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

import * as vscode from 'vscode';
import { Utils } from './utils';
import * as constant from './constant';
import { I18nService } from './i18nservice';

const i18n = I18nService.I18n();

/**
 * 64位迁移预检帮助类
 */
export class PreCheckHelper {

    /**
     * 打开迁移预检源文件
     * @param nodeId: 菜单节点id
     * @param taskId: 迁移预检任务id
     */
    static async createFile(nodeId: string, taskId: string, context: vscode.ExtensionContext, taskType?: any) {

        if (taskId === '') {
            return;
        }

        if (taskType === 'weakCheck') {
            const option = {
                url: `/portadv/weakconsistency/tasks/${encodeURIComponent(taskId)}/portinginfo/`,
                method: 'POST',
                params: { filepath: nodeId }
            };
            const resp = await Utils.requestDataHelper(context, option, constant.TOOL_NAME_PORTING);
            if (resp.status === 0) {
                const arr: any[] = [];
                resp.data.portingitems.forEach((item: any) => {
                    const obj = {
                        suggestiontype: constant.suggestionType.suggestionType1996,
                        description: i18n.plugins_porting_weakcheck_suggest,
                        keyword: '',
                        col: item.col,
                        locbegin: item.line,
                        locend: item.line,
                        quickfix: item.quick_fix,
                        strategy: item.quick_fix ? i18n.plugins_porting_weakcheck_suggest
                            : i18n.plugins_porting_enhance_function_weak_check_quickfix_tip,
                        quickfixcontent: i18n.plugins_porting_weakcheck_quickfix
                    };
                    arr.push(obj);
                });
                const res = { diffList: arr, oldString: resp.data.content };
                return new Promise((resolve, reject) => {
                    resolve(res);
                });
            }
        } else if (taskType === 'cacheCheck') {
            const option = {
                url: `/portadv/tasks/migration/cachelinealignment/taskresult/`,
                method: 'POST',
                params: { file_path: nodeId, task_name: taskId }
            };
            const resp = await Utils.requestDataHelper(context, option, constant.TOOL_NAME_PORTING);
            if (resp.status === 0) {
                const arr: any[] = [];
                resp.data.line.forEach((item: any) => {
                    const obj = {
                        suggestiontype: constant.suggestionType.suggestionType2500,
                        description: resp.data.description,
                        keyword: '',
                        locbegin: 0,
                        locend: 0,
                        strategy: resp.data.suggestion + ' in line '
                    };
                    obj.locbegin = item[0];
                    obj.locend = item[1];
                    obj.strategy = obj.strategy + obj.locend + '.';
                    arr.push(obj);
                });
                const res = { diffList: arr, oldString: resp.data.content };
                return new Promise((resolve, reject) => {
                    resolve(res);
                });
            }

        } else {
            const option = {
                url: `/portadv/tasks/migrationscaninfo/`,
                method: 'POST',
                params: { file_path: nodeId, task_name: taskId }
            };
            const resp = await Utils.requestDataHelper(context, option, constant.TOOL_NAME_PORTING);
            if (resp.status === 0) {
                const arr: any[] = [];
                resp.data.line.forEach((item: any) => {
                    const obj = {
                        suggestiontype: constant.suggestionType.suggestionType1996,
                        description: i18n.plugins_porting_portcheck_suggest,
                        keyword: '',
                        locbegin: 0,
                        locend: 0,
                        linebegin: 0,
                        lineend: 0,
                        strategy: i18n.plugins_porting_64strategy
                    };
                    obj.locbegin = parseInt(item.split(':')[0], 10);
                    obj.locend = parseInt(item.split(':')[0], 10);
                    obj.linebegin = parseInt(item.split(':')[1], 10);
                    obj.lineend = parseInt(item.split(':')[1], 10);
                    arr.push(obj);
                });
                const res = { diffList: arr, oldString: resp.data.content };
                return new Promise((resolve, reject) => {
                    resolve(res);
                });
            }
        }
    }
}
