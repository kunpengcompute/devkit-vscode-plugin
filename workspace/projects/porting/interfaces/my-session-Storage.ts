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
 * 数据请求接口
 */
export abstract class MySessionStorage {

  readonly length: number;

  // 获取 key
  abstract key(index: number): string;

  // 保存数据
  abstract setItem(key: string, value: string): void;

  // 获取数据
  abstract getItem(key: string): string;

  // 删除保存的数据
  abstract removeItem(key: string): void;

  // 删除所有保存的数据
  abstract clear(): void;
}
