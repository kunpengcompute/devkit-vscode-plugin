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

// 自动修复 GCC 版本
const AUTO_GCC = [
    { system: 'BC-Linux 7.6/7.7', version: 'GCC 4.8.5/4.9.3/5.1.0/5.2.0/5.3.0/5.4.0/5.5.0/6.1.0/6.2.0/6.3.0/6.4.0/' +
    '6.5.0/7.1.0/7.2.0/7.3.0/7.4.0/8.1.0/8.2.0/8.3.0/9.1.0/9.2.0/9.3.0' },
    { system: 'CentOS 7.4/7.5/7.6/7.7', version: 'GCC 4.8.5/4.9.3/5.1.0/5.2.0/5.3.0/5.4.0/5.5.0/6.1.0/6.2.0/6.3.0/' +
    '6.4.0/6.5.0/7.1.0/7.2.0/7.3.0/7.4.0/8.1.0/8.2.0/8.3.0/9.1.0/9.2.0/9.3.0' },
    { system: 'CentOS 8.0', version: 'GCC 8.2.0/8.3.0/9.1.0/9.2.0/9.3.0' },
    { system: 'CentOS 8.1/8.2', version: 'GCC 8.3.0/9.1.0/9.2.0/9.3.0' },
    { system: 'Debian 10', version: 'GCC 8.3.0/9.1.0/9.2.0/9.3.0' },
    { system: 'Deepin 15.2',
      version: 'GCC 6.3.0/6.4.0/6.5.0/7.1.0/7.2.0/7.3.0/7.4.0/8.1.0/8.2.0/8.3.0/9.1.0/9.2.0/9.3.0' },
    { system: 'iSoft 5.1', version: 'GCC 7.3.0/7.4.0/8.1.0/8.2.0/8.3.0/9.1.0/9.2.0/9.3.0' },
    { system: 'Kylin V10 SP1', version: 'GCC 7.3.0/7.4.0/8.1.0/8.2.0/8.3.0/9.1.0/9.2.0/9.3.0' },
    { system: 'LinxOS 6.0.90',
      version: 'GCC 6.3.0/6.4.0/6.5.0/7.1.0/7.2.0/7.3.0/7.4.0/8.1.0/8.2.0/8.3.0/9.1.0/9.2.0/9.3.0' },
    { system: 'NeoKylin V7U6', version: 'GCC 4.8.5/4.9.3/5.1.0/5.2.0/5.3.0/5.4.0/5.5.0/6.1.0/6.2.0/' +
     '6.3.0/6.4.0/6.5.0/7.1.0/7.2.0/7.3.0/7.4.0/8.1.0/8.2.0/8.3.0/9.1.0/9.2.0/9.3.0' },
    { system: 'openEuler 20.03', version: 'GCC 7.3.0/7.4.0/8.1.0/8.2.0/8.3.0/9.1.0/9.2.0/9.3.0' },
    { system: 'openEuler 20.03 LTS SP1', version: 'GCC 7.3.0/7.4.0/8.1.0/8.2.0/8.3.0/9.1.0/9.2.0/9.3.0' },
    { system: 'openEuler 20.03 LTS SP2', version: 'GCC 7.3.0/7.4.0/8.1.0/8.2.0/8.3.0/9.1.0/9.2.0/9.3.0' },
    { system: 'SUSE SLES15.1', version: 'GCC 7.4.0/8.1.0/8.2.0/8.3.0/9.1.0/9.2.0/9.3.0' },
    { system: 'Ubuntu 18.04.x', version: 'GCC 7.3.0/7.4.0/8.1.0/8.2.0/8.3.0/9.1.0/9.2.0/9.3.0' },
    { system: 'Ubuntu 20.04.x', version: 'GCC 9.3.0' },
    { system: 'UOS 20 SP1', version: 'GCC 8.3.0/9.1.0/9.2.0/9.3.0' },
    { system: 'uosEuler 20 ', version: 'GCC 7.3.0/7.4.0/8.1.0/8.2.0/8.3.0/9.1.0/9.2.0/9.3.0' },
];

export {
    AUTO_GCC
};
