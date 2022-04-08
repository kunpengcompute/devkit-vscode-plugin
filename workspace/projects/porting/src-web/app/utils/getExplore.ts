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

// 判断是否为 Chrome 并且版本在 85 及以上
const getExplore = (): boolean => {
  const userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.indexOf('chrome') > -1 && userAgent.indexOf('safari') > -1) {
    const reg = userAgent.match(/chrome\/([\d\.]+)/);
    return parseInt(reg[1], 10) >= 85;
  }
  return false;
};

// 判断是否为 Mac 系统
const isMac = (): boolean => {
  return navigator.userAgent.includes('Mac OS X');
};

export {
  getExplore,
  isMac
};
