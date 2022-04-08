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

import { Observable } from 'rxjs';

/**
 * 数据请求接口
 */
export interface MyHttp {
    readonly interceptors: {
        response: Observable<any>,
        request: Observable<any>
    };

    get(url: string, prarms): Promise<any>;
    post(url: string, prarms): Promise<any>;
    put(url: string, prarms): Promise<any>;
    patch(url: string, prarms): Promise<any>;
    delete(url: string, prarms): Promise<any>;
}
