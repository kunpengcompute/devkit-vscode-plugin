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

// 联机帮助
const ONLINE_HELP = {
    ZH_HELP: './assets/onlinehelp-zh/index.html', // 中文首页
    EN_HELP: './assets/onlinehelp-en/index.html', // 英文首页
    ZH_COMMAND_HELP: './assets/onlinehelp-zh/zh-cn_topic_0320090988.html', // 编译命令联中文
    EN_COMMAND_HELP: './assets/onlinehelp-en/en-us_topic_0320090988.html', // 编译命令联英文
    ZH_WEAK_HELP: './assets/onlinehelp-zh/zh-cn_topic_0292866532.html', // 内存一致性中文
    EN_WEAK_HELP: './assets/onlinehelp-en/en-us_topic_0292866532.html', // 内存一致性英文
    ZH_FILE_HELP: './assets/onlinehelp-zh/zh-cn_topic_0290794906.html', // 文件超过 1G 中文
    EN_FILE_HELP: './assets/onlinehelp-en/en-us_topic_0290794906.html', // 文件超过 1G 英文
    ZH_ENHANCED_HELP: './assets/onlinehelp-zh/zh-cn_topic_0189775177.html', // 源码增强检查联机帮助
    EN_ENHANCED_HELP: './assets/onlinehelp-en/en-us_topic_0189775177.html', // 源码增强检查联机帮助
    rebuildFaildZh: './assets/onlinehelp-zh/index.html#zh-cn_topic_0222610840.html', // 软件包重构失败联机帮助中文
    rebuildFaildEn: './assets/onlinehelp-en/index.html#en-us_topic_0222610840.html', // 软件包重构失败联机帮助英文
    depDictionaryFaildZh: './assets/onlinehelp-zh/index.html#zh-cn_topic_0000001188634639.html', // 依赖字典操作失败联机帮助中文
    depDictionaryFaildEn: './assets/onlinehelp-en/index.html#en-us_topic_0000001188634639.html', // 依赖字典操作失败联机帮助英文
    MigTemplateFaildZh: './assets/onlinehelp-zh/index.html#zh-cn_topic_0000001142714726.html', // 迁移模板操作失败联机帮助中文
    MigTemplateFaildEn: './assets/onlinehelp-en/index.html#en-us_topic_0000001142714726.html', // 迁移模板操作失败联机帮助英文
    scanNoPermissionZh: './assets/onlinehelp-zh/index.html#zh-cn_topic_0000001188754467.html', // 扫描无权限联机帮助中文
    scanNoPermissionEn: './assets/onlinehelp-en/index.html#en-us_topic_0000001188754467.html', // 扫描无权限联机帮助英文
    yumFailedZh: './assets/onlinehelp-zh/index.html#zh-cn_topic_0000001155123910.html', // 专项软件迁移yum命令无法执行联机帮助中文
    yumFailedEn: './assets/onlinehelp-en/index.html#en-us_topic_0000001155123910.html', // 专项软件迁移yum命令无法执行联机帮助英文


};

// 压缩包上传支持类型
const ACCEPT_TYPE = {
    softwareMigration: '.deb,.egg,.gz,.jar,.rpm,.tar,.tar.bz,.tar.gz,.tbz,.tbz2,.tgz,.war,.whl,.zip',
    sourceMigration: '.tar,.tar.bz,.tar.bz2,.tar.gz,.tar.xz,.tbz,.tbz2,.tgz,.txz,.zip',
    softwareRebuild: '.deb,.rpm',
    byteAlignment: '.tar,.tar.bz,.tar.bz2,.tar.gz,.tar.xz,.tbz,.tbz2,.tgz,.txz,.zip', // 64位迁移预检和字节对齐
    weakCheck: '.tar,.tar.bz,.tar.bz2,.tar.gz,.tar.xz,.tbz,.tbz2,.tgz,.txz,.zip',
    depDictionary: '.tar.gz' // 依赖字典 或 软件迁移模版
};
// IE11 或 Mac 下压缩包上传支持类型
const ACCEPT_TYPE_IE = {
    softwareMigration: '.bz,.deb,.egg,.gz,.jar,.rpm,.tar,.tbz,.tbz2,.tgz,.war,.whl,.zip',
    sourceMigration: '.bz,.bz2,.gz,.tar,.tbz,.tbz2,.tgz,.txz,.xz,.zip',
    byteAlignment: '.bz,.bz2,.gz,.tar,.tbz,.tbz2,.tgz,.txz,.xz,.zip', // 64位迁移预检和字节对齐
    weakCheck: '.bz,.bz2,.gz,.tar,.tbz,.tbz2,.tgz,.txz,.xz,.zip',
    depDictionary: '.gz' // 依赖字典 或 软件迁移模版
};

// 自动修复 GCC 版本
const AUTO_GCC = [
  {
    system: 'BC-Linux 7.6/7.7',
    version: 'GCC 4.8.5/4.9.3/5.1.0/5.2.0/5.3.0/5.4.0/5.5.0/6.1.0/6.2.0/6.3.0/6.4.0/6.5.0/7.1.0/7.2.0/\
    7.3.0/7.4.0/8.1.0/8.2.0/8.3.0/9.1.0/9.2.0/9.3.0'
  },
  {
    system: 'CentOS 7.4/7.5/7.6/7.7',
    version: 'GCC 4.8.5/4.9.3/5.1.0/5.2.0/5.3.0/5.4.0/5.5.0/6.1.0/6.2.0/6.3.0/6.4.0/6.5.0/7.1.0/7.2.0/\
    7.3.0/7.4.0/8.1.0/8.2.0/8.3.0/9.1.0/9.2.0/9.3.0'
  },
  { system: 'CentOS 8.0', version: 'GCC 8.2.0/8.3.0/9.1.0/9.2.0/9.3.0' },
  { system: 'CentOS 8.1/8.2', version: 'GCC 8.3.0/9.1.0/9.2.0/9.3.0' },
  { system: 'Debian 10', version: 'GCC 8.3.0/9.1.0/9.2.0/9.3.0' },
  { system: 'Deepin 15.2',
    version: 'GCC 6.3.0/6.4.0/6.5.0/7.1.0/7.2.0/7.3.0/7.4.0/8.1.0/8.2.0/8.3.0/9.1.0/9.2.0/9.3.0' },
  { system: 'iSoft 5.1', version: 'GCC 7.3.0/7.4.0/8.1.0/8.2.0/8.3.0/9.1.0/9.2.0/9.3.0' },
  { system: 'Kylin V10 SP1', version: 'GCC 7.3.0/7.4.0/8.1.0/8.2.0/8.3.0/9.1.0/9.2.0/9.3.0' },
  { system: 'LinxOS 6.0.90',
    version: 'GCC 6.3.0/6.4.0/6.5.0/7.1.0/7.2.0/7.3.0/7.4.0/8.1.0/8.2.0/8.3.0/9.1.0/9.2.0/9.3.0' },
  {
    system: 'NeoKylin V7U6',
    version: 'GCC 4.8.5/4.9.3/5.1.0/5.2.0/5.3.0/5.4.0/5.5.0/6.1.0/6.2.0/6.3.0/6.4.0/6.5.0/7.1.0/7.2.0/\
    7.3.0/7.4.0/8.1.0/8.2.0/8.3.0/9.1.0/9.2.0/9.3.0'
  },
  { system: 'openEuler 20.03', version: 'GCC 7.3.0/7.4.0/8.1.0/8.2.0/8.3.0/9.1.0/9.2.0/9.3.0' },
  { system: 'openEuler 20.03 LTS SP1', version: 'GCC 7.3.0/7.4.0/8.1.0/8.2.0/8.3.0/9.1.0/9.2.0/9.3.0' },
  { system: 'openEuler 20.03 LTS SP2', version: 'GCC 7.3.0/7.4.0/8.1.0/8.2.0/8.3.0/9.1.0/9.2.0/9.3.0' },
  { system: 'SUSE SLES15.1', version: 'GCC 7.4.0/8.1.0/8.2.0/8.3.0/9.1.0/9.2.0/9.3.0' },
  { system: 'Ubuntu 18.04.x', version: 'GCC 7.3.0/7.4.0/8.1.0/8.2.0/8.3.0/9.1.0/9.2.0/9.3.0' },
  { system: 'Ubuntu 20.04.x', version: 'GCC 9.3.0' },
  { system: 'UOS 20 SP1', version: 'GCC 8.3.0/9.1.0/9.2.0/9.3.0' },
  { system: 'uosEuler 20', version: 'GCC 7.3.0/7.4.0/8.1.0/8.2.0/8.3.0/9.1.0/9.2.0/9.3.0' }
];


export {
    ONLINE_HELP,
    ACCEPT_TYPE,
    ACCEPT_TYPE_IE,
    AUTO_GCC
};
