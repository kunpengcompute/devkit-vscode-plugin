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
import { AxiosService } from '../../service';

@Injectable({
  providedIn: 'root'
})

export class SoftwareMigrationReportApi {
  constructor(private axiosServe: AxiosService) {}

  // 获取软件迁移评估报告详情
  public getReport(reportId: string) {
    return this.axiosServe.axios({
      url: '/task/progress/',
      method: 'get',
      params: {
        task_type: 7,
        task_id: reportId
      }
    });
  }

  // 下载软件迁移评估 HTML 报告
  public downloadHTML(reportId: string) {
    return this.axiosServe.axios({
      url: `/portadv/binary/${encodeURIComponent(reportId)}/`,
      method: 'get',
      params: {
        report_type: 1
      }
    });
  }
}
