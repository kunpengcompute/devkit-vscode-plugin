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

export const i18nZH = {
  common_term_task_nodata: '无数据',
  profileMemorydump: {
    snapShot: {
      onlyASnapshot: '(仅为A快照内容)',
      onlyBSnapshot: '(仅为B快照内容)',
      jdbc: {
        hot_statement: '热点语句',
        Btotal_time: 'B快照总耗时（毫秒）',
        total_time: '总耗时对比（毫秒）',
        Baver_time: 'B快照平均执行时间（毫秒）',
        aver_time: '平均执行时间对比（毫秒）',
        Bexec_time: 'B快照执行次数',
        exec_time: '执行次数对比',
      }
    }
  },
  protalserver_profiling_jdbc: {
    tipsone: '您的SQL/NoSQL语句或操作将显示在当前页面。',
    tipstwo: '该信息仅用于性能分析，不会保存在系统中。请确认是否授权显示？',
    display: '显示SQL/NoSQL语句或操作',
    label: '热点',
    monitor: '实时数据监控',
    start_analysis: '启动分析JDBC',
    stop_analysis: '停止分析JDBC',
    hot_statement: '热点语句',
    hot_option: '热点操作',
    total_time: '总耗时（毫秒）',
    aver_time: '平均执行时间（毫秒）',
    exec_time: '执行次数',
    sql_monitor: 'SQL监控',
    exec_statement: '执行语句数',
    aver_exec_time: '语句平均执行时间',
    evnet_type: '事件类型',
    table_name: '表名',
    btn_tip: '开启或停止对JDBC访问操作的分析。'
  },
  protalserver_sampling_leak: {
    sugget: '优化建议',
    suggetNumber: '当前产生{0}个优化建议。',
    suggetNumbers: '当前产生{0}个优化建议。',
    btnIcon: '针对当前页面已产生{0}份优化建议，请点击',
    btnIcons: '针对当前页面已产生{0}份优化建议，请点击',
    look: '按钮查看。'
  },
  searchBox: {
    mutlInfo: '请输入想要搜索的内容',
    info: '请输入想要搜索的{0}'
  },
  common_term_java_process_search: '请输入进程名或进程ID',
  common_term_operate_ok: '确认',
  common_term_operate_cancel: '取消',
  common_term_operate_close: '关闭',
  newLockGraph: {
    threadExistDeadLock: '发现{0}个死锁。'
  },
  common_term_flamegraph_search: '请输入想要搜索的方法名',
  spinner_samplingDuration_right: '(1-300)',
  spinner_samplingInterval_right: '(1-1,000)',
  spinner_maxStackDepth_right: '(16-64)',
  protalserver_profiling_hot: {
    hotSampling: '热点分析数据采集中，请稍后…',
    newHot: '新建热点分析',
    rebuildHot: '重建热点分析',
    changeMethodParams:'当前无数据，未找到该必须分析的方法{0}，请更换或清空该参数',
    rebuildHotTip: '确认是否重建？重建后会清除之前分析的数据',
    tip: '方法内联可能会造成某些热点方法采集的堆栈信息与源码不同，如不想使用方法内联，可在启动java进程时添加参数 -XX:MaxInlineSize=0。注意：去除方法内联将会造成运行缓慢。',
    helpTip: '热点分析指的是JVM中经工具分析的热点方法，热点方法以倒火焰图形式呈现，请到热点界面查看',
    noData: '当前无数据，请先新建热点分析',
    noCapture: '从 Linux 4.6 开始，使用perf_events非 root 进程捕获内核调用堆栈需要设置两个运行时变量。您可以使用 sysctl \
    或如下设置它们：# sysctl kernel.perf_event_paranoid=1 # sysctl kernel.kptr_restrict=0',
    viewDetails: '查看详情',
    samplingMode: '采样方式',
    samplingDuration: '采样时长(秒)',
    samplingModeDesignate: '指定采样时长',
    samplingModeNotLimit: '不限制采样时长',
    stopTips: '不限制采样时长时，需要手动停止采样分析，如采样文件大小超过100MiB，则会提前结束采样。',
    samplingInterval: '采样间隔(毫秒)',
    eventType: '采样事件类型',
    depth: '配置堆栈深度',
    disassembling: '反汇编/字节码分析',
    disassemblingTip: '开启反汇编/字节码分析，应用性能开销将增大，可能会影响程序性能',
    maxStackDepth: '追踪的最大栈深',
    maxStackDepthTip: '最大栈深度，只限制java栈',
    exclusionMethod: '需排除分析的方法',
    exclusionMethodP: '请输入以下匹配条件，支持多个参数，以";"分割\n例1：*fun  匹配以fun结尾的函数，\n例2：fun*  匹配以fun开头的函数，\n例3：fun   匹配fun函数，\n例4：*fun* 匹配包含fun的函数',
    analysisMethod: '必须分析的方法',
    startMethod: '触发开始分析的方法',
    startMethodP: '请输入完整的Native函数名，只支持单个参数',
    endMethod: '触发结束分析的方法',
    kernelCall: '分析内核态调用',
    kernelCallStart: '开启',
    kernelCallClose: '关闭',
    error: '不允许输入中文',
    sameMethodError: '触发开始分析的方法不能与触发结束分析的方法相同',
    cancalTitle: '取消执行热点分析',
    cancalTip: '确认是否取消执行热点分析',
  },
  hot_legend_data: {
    javaInvocation: 'Java调用',
    javaInline: 'Java内联',
    C: 'C++',
    kernel: '内核',
    Other: '其他',
    searchTags: '搜索标记',
  },
  common_term_recording: '热点分析中，采样时间',
  common_term_creating: '热点分析文件解析中...',
  common_term_start_creating: '热点分析请求中...',
  common_term_creating_duration: '采样时间：',
  stop_analysis: '停止采样',
  cancel_analysis: '取消采样',
  JITVersion: 'JIT编译版本',
  hotspotRight: {
    bytecodeName: '字节码',
    noBytecode: '未采集到字节码',
    compileName: '热点汇编',
    clockPeriod: '时钟周期(占比)',
    address: '地址',
    compilation: '汇编',
    noCompile: '当前方法未采集到汇编指令',
    codeCollecting: '字节码数据收集中，请稍后再试',
    disassemblingCollecting: '反汇编数据收集中，请稍后再试',
    noDisassembling: '未获取到数据，若要使用该功能，请开启反汇编/字节码分析后再次执行热点分析',
    assembleTip:'发现（{0}）个samlpe（s）的汇编代码段与当前JAVA方法相关联。其中（{1}）个JIT汇编可通过当前方法查看；{2} 剩余（{3}）个解释汇编暂不支持查看。',
    assembleOtherTip:'（{0}）个JIT汇编可通过{1}查看；'
  },
  common_advice_feedback: '建议反馈',
  common_connect_fail: '连接失败',
  common_connect_fail_reason: '网络连接请求失败,可参考如下方式进行建议反馈：',
  common_connect_fail_reason1: '1.请检查网络后，重新点击',
  common_connect_fail_reason2: '进行建议反馈。',
  common_connect_fail_reason3: '2.通过手机扫描以下二维码进行建议反馈。',
};


