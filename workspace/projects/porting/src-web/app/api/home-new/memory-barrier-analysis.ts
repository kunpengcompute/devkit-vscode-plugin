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
import { AnalysePrecheck, AnalyseBytecheck } from './modules/memory-barrier-analysis.interface';

@Injectable({
  providedIn: 'root'
})

export class EnhancementsApi {
  constructor(private axiosServe: AxiosService) {}

  /* 64位运行模式检查 start */
  // 分析源码包
  public analysePrecheck(data: AnalysePrecheck): Promise<object> {
    return this.axiosServe.axios({
      url: '/portadv/tasks/migrationscan/',
      method: 'post',
      data
    });
  }
  /* 64位运行模式检查 end */

  /* 结构体字节对齐检查 start */
  // 分析源码
  public analyseBytecheck(data: AnalyseBytecheck): Promise<object> {
    return this.axiosServe.axios({
      url: '/portadv/tasks/migration/bytealignment/task/',
      method: 'post',
      data
    });
  }
  /* 结构体字节对齐检查 end */

  /* cacheline对齐检查 start */
  public analyseCachecheck(data: AnalysePrecheck): Promise<object> {
    return this.axiosServe.axios({
      url: '/portadv/tasks/migration/cachelinealignment/task/',
      method: 'post',
      data
    });
  }
  /* cacheline对齐检查 end */
}
