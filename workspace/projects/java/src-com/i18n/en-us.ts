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

export const i18nUS = {
  common_term_task_nodata: 'No Data',
  profileMemorydump: {
    snapShot: {
      onlyASnapshot: '(onlyASnapshot)',
      onlyBSnapshot: '(onlyBSnapshot)',
      jdbc: {
        hot_statement: 'Hotspot Statement',
        Btotal_time: 'Snapshot B Total Duration (ms)',
        total_time: 'Total Duration Comparison (ms)',
        Baver_time: 'Snapshot B Average Execution Duration (ms) ',
        aver_time: 'Average Snapshot Execution Duration Comparison (ms) ',
        Bexec_time: 'Snapshot B Execution Times',
        exec_time: 'Comparison of Execution Times',
      }
    }
  },
  protalserver_profiling_jdbc: {
    tipsone: 'Your SQL/NoSQL statements or operations will be displayed on the current page.',
    tipstwo: 'The information is used only for performance analysis and is not saved in the system. \
          Please determine whether display the information.',
    display: 'Display SQL/NoSQL statements and operations',
    label: 'Hot Spots',
    monitor: 'Real Time Monitoring',
    start_analysis: 'Start Analysis',
    stop_analysis: 'Stop Analysis',
    hot_statement: 'Hotspot Statement',
    hot_option: 'Hotspot Operation',
    total_time: 'Total Time (ms)',
    aver_time: 'Average Execution Time (ms)',
    exec_time: 'Execution Times',
    sql_monitor: 'SQL Monitoring',
    exec_statement: 'Executed Statements',
    aver_exec_time: 'Average Execution Time',
    evnet_type: 'Event Type',
    table_name: 'Table Name',
    btn_tip: 'Starts or stops JDBC access operation analysis.'
  },
  protalserver_sampling_leak: {
    sugget: 'Tuning Suggestions',
    suggetNumber: 'You have {0} tuning suggestion.',
    suggetNumbers: 'You have {0} tuning suggestions.',
    btnIcon: '{0} suggestion is generated. Click',
    btnIcons: '{0} suggestions are generated. Click',
    look: 'to view the suggestions.'
  },
  searchBox: {
    mutlInfo: 'Enter the keyword.',
    info: 'Enter the {0} to be searched.'
  },
  common_term_java_process_search: 'Enter a process name or ID',
  common_term_operate_ok: 'OK',
  common_term_operate_cancel: 'Cancel',
  common_term_operate_close: 'Close',
  newLockGraph: {
    threadExistDeadLock: 'Deadlocks found: {0}'
  },
  common_term_flamegraph_search: 'Enter the method name that you want to search for. ',
  spinner_samplingDuration_right: '(1-300)',
  spinner_samplingInterval_right: '(1-1,000)',
  spinner_maxStackDepth_right: '(16-64)',
  protalserver_profiling_hot: {
    hotSampling: 'Collecting hotspot analysis data...',
    newHot: 'Create Hotspot Analysis',
    rebuildHot: 'Recreate Hotspot Analysis',
    changeMethodParams:'No data available. The method {0} that must be analyzed cannot be found. \
    Modify or clear the parameter.',
    rebuildHotTip: 'Are you sure you want to rebuild? After rebuilding, the previously analyzed data is cleared.',
    tip: 'The collected stack information may be different from the source code due to method inlining. If you do \
    not want to use method inlining, add the -XX:MaxInlineSize=0 parameter when starting the Java process. If the \
    method inlining is not used, the Java process will run slowly.  ',
    helpTip: 'Hotspot analysis refers to the hotspot methods analyzed by tools in the JVM. Hotspot methods \
    are displayed in inverted flame graphs. View them on the Hotspot page.',
    noData: 'No data available. Create hotspot analysis first.',
    noCapture: 'Starting with Linux 4.6, capturing the kernel call stack using the perf_events non-root process \
    requires setting two runtime variables. You can use sysctl or set them as follows: # sysctl kernel.perf_event_\
    paranoid=1 # sysctl kernel.kptr_restrict=0.',
    viewDetails: 'View details',
    samplingMode: 'Sampling mode',
    samplingDuration: 'Sampling Duration (s)',
    samplingInterval: 'Sampling Interval (ms)',
    samplingModeDesignate: 'Specified duration',
    samplingModeNotLimit: 'Unlimited duration',
    stopTips: 'If the sampling duration is not limited, you need to manually stop the sampling analysis. \
    If the size of the sampling file exceeds 100 MiB, the sampling ends in advance.',
    eventType: 'Sampling Event Type',
    depth: 'Configure Stack Depth',
    disassembling: 'Disassembly/Bytecode Analysis',
    disassemblingTip: 'If disassembly/bytecode analysis is enabled, the application performance overhead increases, \
    which may affect the program performance.',
    maxStackDepth: 'Maximum Traced Stack Depth',
    maxStackDepthTip: 'Maximum stack depth. Only applies to the Java stack.',
    exclusionMethod: 'Method Without Analysis',
    exclusionMethodP: 'Enter the following matching conditions.Multiple parameters are supported.\nUse semicolons (;) to separate them.\nExample 1: *fun matches a function ending with fun.\n\
Example 2: fun* matches a function starting with fun.\nExample 3: fun matches fun functions.\nExample 4: *fun* matches the function that contains fun.',
    analysisMethod: 'Method With Analysis',
    startMethod: 'Trigger Analysis By',
    startMethodP: 'Enter a full Native function name. Only a single parameter is supported.',
    endMethod: 'End Analysis By',
    kernelCall: 'Kernel Mode Analysis',
    kernelCallStart: 'Enable',
    kernelCallClose: 'Disable',
    error: 'Chinese characters are not allowed.',
    sameMethodError: 'The method that triggers the start of an analysis must be different from that triggers the end of analysis.',
    cancalTitle: 'Cancel Hotspot analysis',
    cancalTip: 'Confirm to cancel the current hotspot analysis files?',
  },
  hot_legend_data: {
    javaInvocation: 'Java invoked',
    javaInline: 'Java inlining',
    C: 'C++',
    kernel: 'Kernel',
    Other: 'Other',
    searchTags: 'Search markers',
  },
  common_term_recording: 'Analyzing hotspot. Sampling time',
  common_term_creating: 'Parsing hotspot analysis files...',
  common_term_start_creating: 'Requesting hotspot analysis...',
  common_term_creating_duration: 'Sampling time: ',
  stop_analysis: 'Stop Sampling',
  cancel_analysis: 'Cancel Sampling',
  JITVersion: 'JIT Compiled Version',
  hotspotRight: {
    bytecodeName: 'Byte Code',
    noBytecode: 'The byte code is not collected.',
    compileName: 'Hotspot Assembly',
    clockPeriod: 'Clock Cycle (Percentage)',
    address: 'Address',
    compilation: 'Assembly',
    noCompile: 'The current method does not collect assembly commands.',
    codeCollecting: 'Collecting bytecode data. Try again later.',
    disassemblingCollecting: 'Collecting disassemble data. Try again later.',
    noDisassembling: 'No data obtained. To use this function, enable disassembly/bytecode analysis and \
    perform hotspot analysis again.',
    assembleTip:'Found ({0}) assembly code segments of sample (s) associated with the current JAVA method. ({1}) of the JIT compilations can be viewed using the current method;{2}The remaining ({3}) interpretation compilations cannot be viewed.',
    assembleOtherTip:'({0}) JIT compilations can be viewed via \'{1}\'. '
  },
  common_advice_feedback: 'Advice Feedback',
  common_connect_fail: 'Connection Failed',
  common_connect_fail_reason: 'Network connection request fails. Try the following ways to provide suggestions:',
  common_connect_fail_reason1: '1.Check the network connection and click',
  common_connect_fail_reason2: 'again to provide suggestions.',
  common_connect_fail_reason3: '2.Scan the following QR code with your mobile phone to provide suggestions.',
};
