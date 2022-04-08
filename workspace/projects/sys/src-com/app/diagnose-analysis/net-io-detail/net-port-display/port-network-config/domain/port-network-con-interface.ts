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

// 路由配置信息
interface RouteRowInfo {
  destination: string;
  gateway: string;
  genmask: string;
  flags: string;
  network: string;
}

// ARP 信息
interface ARPRowInfo {
  address: string;
  hWtype: string;
  hWaddress: string;
  flags: string;
  network: string;
}

// 复合表头
interface PortTheads {
  title: string;
  prop?: string;
  width?: string;
  colspan?: number;
  rowspan?: number;
  align?: 'center' | '';
  show?: boolean;
  isActive?: boolean;
  children?: PortTheads[];
}

export {
  RouteRowInfo,
  ARPRowInfo,
  PortTheads
};
