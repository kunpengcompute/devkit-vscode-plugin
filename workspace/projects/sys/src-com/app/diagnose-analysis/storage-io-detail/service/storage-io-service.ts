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

import { Injectable } from '@angular/core';
import { RespCommon } from 'sys/src-com/app/domain';
import { HttpService } from 'sys/src-com/app/service';
import { I18n } from 'sys/locale';
import { RespModelDetailData, RespModelSummaryData } from '../pressure-test-result-detail/domain';

@Injectable({
  providedIn: 'root'
})
export class StorageIoService {

  constructor(
    private http: HttpService
  ) { }

  /**
   * 或取压测结果总览数据
   * @param taskId 任务id
   * @param nodeId 节点id
   * @returns 总览数据
   */
  getSummryData(
    taskId: number,
    nodeId: number
  ): Promise<RespCommon<RespModelSummaryData>> {
    const params = {
      nodeId,
      queryTarget: 'Diagnostics',
    };
    return this.http.get(`/diagnostic-tasks/${encodeURIComponent(taskId)}/io-summary/`, {
      params,
    });
  }

  /**
   * 获取压测模型详情数据
   * @param taskId 任务id
   * @param nodeId 节点id
   * @param modelId 压测模型id
   * @returns 压测模型详情
   */
  getModelData(
    taskId: number,
    nodeId: number,
    modelId: number
  ): Promise<RespCommon<RespModelDetailData>> {
    const params = {
      nodeId,
      modelId,
      queryTarget: 'Diagnostics',
    };
    return this.http.get(`/diagnostic-tasks/${encodeURIComponent(taskId)}/io-summary/`, {
      params,
    });
  }
  getDialingData(taskId: number, nodeId: number): Promise<{ data: any }> {
    const params = {
      queryTarget: 'Load',
      nodeId,
    };
    return this.http.get(`/diagnostic-tasks/${encodeURIComponent(taskId)}/netio-summary/`, {
      params,
    });
  }

  /**
   * 任务信息
   * @param taskId 任务Id
   * @param nodeId 任务节点
   * @returns 任务信息
   */
  getInfoData(taskId: number, nodeId: number): Promise<{ data: any }> {
    const params = {
      'node-id': nodeId,
    };
    return this.http.get(`/diagnostic-tasks/${encodeURIComponent(taskId)}/configuration/`, {
      params,
    });
  }

  /**
   * 任务日志
   * @param taskId 任务Id
   * @param nodeId 节点id
   * @returns 任务日志
   */
  getLogData(taskId: number, nodeId: number): Promise<{ data: any }> {
    const params = {
      'node-id': nodeId,
      'nav-name': 'Collection_Log',
    };
    return this.http.get(`/diagnostic-tasks/${encodeURIComponent(taskId)}/collection-logs/`, {
      params,
    });
  }
  /**
   * 将后端返回的字段转换界面此
   * @param funName 字段
   */
  public transformLabel(str: string) {
    switch (str) {
      case 'read':
        return I18n.storageIo.keyMetric.read;
      case 'write':
        return I18n.storageIo.keyMetric.write;
      case 'rw':
        return I18n.storageIo.keyMetric.rw;
      case 'randread':
        return I18n.storageIo.keyMetric.randRead;
      case 'randwrite':
        return I18n.storageIo.keyMetric.randWrite;
      case 'randrw':
        return I18n.storageIo.keyMetric.randRw;
      case 'iops':
        return 'IOPS';
      case 'latency':
        return I18n.storageIo.keyMetric.delay;
      case 'throughput':
        return I18n.storageIo.keyMetric.throughput;
      default:
        return str;
    }
  }
}
