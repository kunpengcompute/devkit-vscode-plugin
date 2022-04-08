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
    common_unit_kib: 'KiB',
    common_unit_mib: 'MiB',
    common_unit_bib: 'GiB',
    common_unit_kibs: 'KiB/s',
    common_unit_mibs: 'MiB/s',
    common_unit_bibs: 'GiB/s',
    common_time_hour: 'hour',
    common_time_min: 'min',
    common_time_second: 'second',
    common_term_back: 'Home',
    common_term_link_doc: 'Join the Kunpeng community and learn more about the DevKit.',
    home_top_info4: 'Visit the Kunpeng community to learn about Kunpeng DevKit. ',
    home_top_info5: 'View details in the Kunpeng Hyper Tuner documents.',
    home_top_info6: 'Visit the Kunpeng community to get skills for new developer growth.',
    common_term_link_news: 'View the detailed guide of the Kunpeng Hyper Tuner.',
    common_term_link_expert: 'Have any questions? Ask experts. ',
    common_term_pro_name: 'Java Profiler',
    common_term_welcome_tip:
        'Collects and analyzes the JVM GC, heap, thread, and method data, and provides Performance Tuning of \
         Java applications.',
    common_term_welcometo: 'Welcome to',
    common_term_loading: 'Loading',
    common_term_login_name: 'User Name',
    common_term_login_password: 'Password',
    common_term_login_btn: 'LOG IN',
    common_term_main_btn: 'Home',
    common_term_login_error_info: [
        'User name cannot be null.',
        'Password cannot be null.',
    ],
    common_term_copyright:
        'Copyright @ Huawei Technologies Co., Ltd. 2021. All rights reserved.',
    common_term_user_info: [
        'User Management',
        'Operation Logs',
        'Change Password',
        'Log Out',
    ],
    common_term_lang_info: ['简体中文', 'English'],
    common_term_home_guardian: 'Guardian List',
    common_term_create_user: 'Create User',
    common_term_system_config: 'System Settings',
    common_term_dictionary: 'Weak Password Dictionary',
    common_term_dataLimit: 'Real-Time Data Limit',
    common_term_system_help: 'Online Help',
    common_term_system_feedback: 'Feedback',
    common_term_logout: 'Log Out',
    common_term_guide: 'Wizard',
    common_term_statement: 'Disclaimer',
    common_term_agree: 'OK',
    common_term_Signed: 'Close',
    common_term_read: 'I have read the disclaimer',
    common_term_logout_notice: 'Are you sure you want to log out the current user?',
    common_term_about: 'About',
    common_term_backSetting: 'Back',
    common_term_log: 'Log',
    common_term_log_manage: 'Logs',
    common_term_certificate: 'Certificate',
    common_term_threshold: 'Threshold Configuration',
    common_term_import_report: 'Import',
    common_term_offline_report: 'Offline Threshold Configuration',
    common_term_java_certificate: 'Internal Communication Certificates',
    common_term_web_certificate: 'Web Server Certificate',
    common_term_work_key: 'Working Key',
    common_term_return_home: 'Back to Home',
    common_term_timeout: 'Request timed out.',
    common_term_maxLogs: 'The system displays only the operation logs of the last 30 days and a maximum of 2000 \
     operation logs.',
    common_term_admin_maxLogs: 'The system displays only the operation logs of the last 30 days and a maximum of\
     100000 operation logs.',
    common_term_java_process_search: 'Enter a process name or ID',
    common_term_java_guardianManage_owner: 'Owning User',
    common_term_java_guardianManage_user: 'User',
    common_term_java_parentheses_left: '(',
    common_term_java_parentheses_right: ')',
    newHeader: {
        nullNotice: 'The value cannot be empty. ',
        errNotice: 'Enter a valid integer.',
        onlyDigits: 'Only a positive integer is allowed.',
        sameValue: 'The new value cannot be the same as the current one.',
        setting: {
            shareSetting: 'Common Settings',
            javaSetting: 'Java Profiler Settings',
            maxusers: 'Maximum Number of Online Common Users',
            overTime: 'Session Timeout Period (min)',
            webCert: 'Web Service Certificate Expiration Alarm Threshold (days)',
            operateOutTime: 'Operation Logs Retention Period (days)',
            runLogLevel: 'Run Log Level',
            modeify: 'Change',
            modeifyConfig: 'Change',
            userRunLogLevel: 'Run Log Level',
            javaCertificate: 'Internal Communication Certificate Expiration Alarm Threshold (days)',
            title: '<b>The log level indicates the severity of the log information. </b>',
            userRunLogTip: 'DEBUG: debugging information for fault locating. <br/>INFO: key information about \
            the normal running of the service. <br/>WARNING: events about the system in unexpected status that \
            does not affect the running of the system. <br/>ERROR: errors that do not affect the application running. \
            <br/>CRITICAL: errors that may cause system breakdown.',
            runLogTip: 'DEBUG: debugging information for fault locating. <br/>INFO: key information about the normal \
            running of the service. <br/>WARNING: events about the system in unexpected status that does not affect \
             the running of the system. <br/>ERROR: errors that do not affect the application running.',
            stackDepth: 'Stack Depth',
            stackAdmin: 'The stack depth is {0}. You can choose Java Profiler Settings and change it.',
            stackUser: 'The stack depth is {0}. If you need to change the stack depth, contact the administrator.',
            password_out_date: 'Password Validity Period (days)'
        },
        aboutMsg: {
            about: 'About',
            name: 'Kunpeng Hyper Tuner',
            version: 'Version ',
            time: 'Release Date: ',
            copyRight: 'Copyright © Huawei Technologies Co., Ltd. 2021. All rights reserved.'
        },
        certificate: {
            refreshKey: 'Refresh',
            certName: 'Certificate Name',
            certType: 'Certificate Type',
            certValid: 'Certificate Expiration Time',
            status: 'Status',
            VALID: 'Valid',
            EXPIRING: 'Expiring',
            EXPIRED: 'Expired',
            NONE: 'Permanently valid',
            workingKey: 'The working key is used to encrypt the data to be protected in the software. ',
            internalCert: 'The certificates are used for TLS communication between the server and Guardian \
            and between the server and agents.'
        },
        validata: {
            name_rule: 'The user name contains 6–32 characters, including letters, digits, hyphens (-), and \
            underscores(_), and must start with a letter.',
            task_name_rule: 'The task name is a string of 6 to 32 characters, allowing letters, digits, periods (.), \
            and underscores (_). It must start with a letter.',
            name_req: 'This user name cannot be left blank.',
            oldPwd_rule: 'This password cannot be left blank.',
            pwd_rule: 'The password must be a string of 8 to 32 characters that contains at least two of the following \
            character types: uppercase letters, lowercase letters, digits, and special characters \
             (`~!@#$%^&*()-_=+\\|[{}];:\'", <.>/?). Spaces are not allowed.',
            pwd_rule2: 'Cannot be the same as the user name or the user name in reverse order.',
            pwd_rule3: 'The new password cannot be the old password in reverse order.',
            pwd_rule4: 'New password must be the different with old password.',
            pwd_conf: 'The two passwords do not match.',
            req: 'This password cannot be left blank.',
            function_name_tule: 'The function name cannot be an asterisk (*).',
            overRange: 'Enter a valid integer.',
        },
        threshold: {
            tips: 'Sampling Warning Threshold',
            tips_content: 'When the number of samples is greater than or equal to the value of this parameter, a \
             message is displayed, indicating that the number of samples is large and some samples need to be deleted.',
            warn: 'Maximum Sampling Threshold',
            warn_content: ' When the number of sampled files reaches the value of this parameter, a message is \
             displayed,  indicating that the number of sampled files has reached the upper limit. Delete some files. \
              Otherwise, new sampling analysis tasks \
            cannot be added.',
            count: 'The maximum sampling threshold cannot be less than the warning threshold.',
            heapdumpMaxCount: 'The maximum historical threshold cannot be less than the warning threshold.',
        },
        offlineReport: {
            heapDumpThreshold: 'Data List-Heap Dump',
            heapDump: {
                histReportHints: 'Historical Warning Threshold',
                histReportHintsText: 'When the number of heap dump files is greater than or equal to the threshold, \
                 a message is displayed, indicating that the number of current files is large and some files need to \
                  be deleted.',
                histReportMax: 'Maximum Historical Threshold',
                histReportMaxText: 'When the number of heap dump files reaches this parameter, a message is displayed, \
                 indicating that the number of current files has reached the upper limit. Delete some files. \
                  Otherwise, new heap dump files cannot be added.',
                ImportReportSize: 'Import Report Size (MiB) ',
                ImportReportSizeText: 'When the size of the heap dump file to be imported exceeds this value, \
                 a message  is displayed, indicating that the import fails, and the size needs to be adjusted.',
            },
            threadDumpThreshold: 'Data List - Thread Dump',
            threadDump: {
                histReportHints: 'Historical Warning Threshold',
                histReportHintsText: 'When the number of thread dump files is greater than or equal to the value \
                 of this parameter, a message is displayed, indicating that the number of current files is large \
                  and some files need to be deleted. ',
                histReportMax: 'Maximum Historical Threshold',
                histReportMaxText: 'When the number of thread dump files reaches the value of this \
                 parameter, a message is displayed, indicating that the number of current files reaches \
                  the upper limit, delete some files. Otherwise, new thread dump files cannot be added.',
            },
            GCLogsThreshold: 'Data List - GC Log',
            GCLogs: {
                histReportHints: 'Historical Warning Threshold',
                histReportHintsText: 'When the number of GC logs is greater than or equal to the value of this \
                 parameter, a message is displayed, indicating that the number of current files is large, and some \
                  files need to be deleted. ',
                histReportMax: 'Maximum Historical Threshold',
                histReportMaxText: 'When the number of GC logs reaches the value of this parameter, a message is \
                 displayed, indicating that the number of current files has reached the upper limit, delete some \
                  GC log files. Otherwise, GC log files cannot be added.',
            },
        }
    },

    common_term_user_label: {
        currentUser: 'Current User',
        name: 'Name',
        role: 'Role',
        workspace: 'Workspace',
        password: 'Password',
        confirmPwd: 'Confirm Password',
        adminPwd: 'Admin Password',
        oldPwd: 'Old Password',
        newPwd: 'New Password',
        changePwd: 'Change Initial Password',
        click: 'Click and enter the user name.',
    },

    common_term_user_all: 'All',
    common_term_max_length_tip: 'Enter a maximum of {0} characters.',
    common_term_no_records: 'No record',
    common_term_no_guardian1: 'No Java process is detected. Please add the target environment first.',
    common_term_no_guardian: 'Add the target environment.',
    common_term_recording: 'Sampling',
    common_term_recording_ing: 'Sampling…',
    common_term_max_limit_records:
        '<em>Note: </em>The number of sampling records is about to reach the upper limit. Please delete some records. ',
    common_term_jdbc_times: ' Times',
    common_term_profiling: 'Profiling Analysis',
    common_term_profiling_tip:
        'The perfomance of process that is under profiling analysis will be greatly affected.',
    common_term_profiling_tip_disabled: 'This process is performing a {0} by the current or another user. \
     Try again after finishing this analysis task.',
    common_term_other_guardian_opt_disabled_tip: '\{{0}\} is in the \{{1}\} state. Analysis is not allowed.',
    common_term_has_profiling_stop_tip:
        'Are you sure you want to stop profiling of the current process?',
    common_term_has_import_profiling_tip: 'Are you sure you want to import the profiling record?',
    common_term_has_import_profiling_content:
        'Importing a profiling record will stop the ongoing profiling process.',
    common_term_has_import_profiling_type_tip:
        'The format of the imported profiling record file is incorrect. Only JSON files are supported.',
    common_term_has_import_profiling_data_tip: 'The imported profiling record data is incorrect.',
    common_term_has_profiling_stop_content:
        'After profiling analysis is stopped, the analysis data will be cleared.',
    common_term_has_profiling_stop_content1: 'The current online analysis task will be stopped and the analyzed \
    data will be cleared if a new online analysis task is started',
    common_term_has_profiling_stop_title1: 'Online Analysis Conflict',
    common_term_ensure_root_title: 'Tip',
    common_term_ensure_root_content: 'The root user has the highest permission. To avoid risks to the system, \
    use a non-root user to deploy the Guardian.',
    common_term_jvm_version_lower_tip:
        'The current JRE version does not support sampling. Use JRE 11 or later.',
    common_term_sampling: 'Sampling Analysis',
    common_term_attach: 'Failed to attach to target application from guardian.',
    common_term_version: 'Checking the status.Please wait.',
    common_term_sample: 'Sampling Analysis Records',
    common_term_profile: 'Profiling Records',
    common_term_save_report: 'Data List',
    common_term_offline_list: 'Offline Data List',
    common_term_memory_dump: 'Heap Dump',
    common_term_thread_dump: 'Thread Dump',
    common_term_gc_log: 'GC Logs',
    common_term_tab_gc_log: 'GC Logs({0})',
    common_term_import: 'Import',
    common_term_export: 'Export',
    common_term_exporting: 'Exporting',
    common_term_import_time: 'Import Time',
    common_term_create_time: 'Create Time',
    common_term_export_report: 'Export Report',
    common_term_export_reportTab: 'Select the pages to be exported.',
    common_term_no_export_reportTip: 'Grayed-out tabs cannot be exported. You can open the tab separately and \
     save data if necessary. ',
    common_term_clear: 'Clear Data',
    common_term_clear_all: 'All',
    common_term_clear_allData: 'All',
    common_term_clear_one: 'Current Page',
    common_term_uploadList: 'Upload List',
    common_term_upload: 'Uploading...',
    common_term_upload_fail: 'Upload failed',
    common_term_upload_size: 'The size of the file to be uploaded cannot exceed 250 MiB.',
    common_term_heapdump_upload_size: 'The size of the file to be uploaded cannot exceed 2 GiB.',
    common_term_threaddump_upload_size: 'The size of the file to be uploaded cannot exceed 50 MiB.',
    common_term_upload_disk: 'The remaining workspace is insufficient.',

    common_term_add_guardian: 'Add Guardian',
    common_term_edit_guardian: 'Edit Guardian',
    common_term_reset_guardian: 'Restart Guardian',
    common_term_reset_success: 'The target environment is restarted.',
    common_term_delete_guardian: 'Delete Guardian',
    common_term_delete_recored: 'Delete Records',
    common_term_delete_user_recored: 'Delete ({0}) Records',
    common_term_delete_report: 'Delete Data',
    common_term_delete_user_report: 'Delete ({0}) Data',
    common_term_java_process: 'Java Processes List',
    common_term_java_primary_process: 'Host Processes',
    common_term_java_container_process: 'Container Processes',
    common_term_ok: 'OK',
    common_term_reset: 'Reset',
    common_term_add_tips: 'Add',
    common_term_modify_tips: 'Modify',
    common_term_restart_tips: 'Restart',
    common_term_delete_tips: 'Delete',
    common_term_sampling_isIETip: 'In the current scenario, a large amount of data needs to be processed.\ You are advised to switch to Chrome for better user experience.',
    common_term_sampling_tips: 'Too many files. Delete some to release the space.',
    common_term_sampling_warning: 'The number of files has reached the upper limit. Delete some files to release \
     the space so that you can create more sampling analysis tasks.',
    common_term_sampling_workTip: 'Insufficient workspace. Ensure that the available workspace \
     is greater than 100 MiB.',
    common_term_sampling_workTip1: 'Insufficient workspace for sampling analysis.',
    common_term_sampling_workTip0: 'Insufficient workspace for profiling analysis.',
    common_term_heapdump_hinting: 'Too many files. Delete some to release the space.',
    common_term_heapdump_warning: 'The number of files has reached the upper limit. Delete some files \
     to release the space so that you can create more Heap dump files.',
    common_term_threaddump_warning: 'The number of files has reached the upper limit. Delete some files to \
     release the space so that you can create more Thread dump files.',
    common_term_gcLog_warning: 'The number of files has reached the upper limit. Delete some files to release \
     the space so that you \
    can create more GC log files.',
    common_term_guardian_forms: {
        environmentType: 'Environment Type',
        remoteServer: 'Remote Server',
        localServer: 'Local Server',
        name: 'Name:',
        ip: 'Server IP Address:',
        userName: 'User Name:',
        password: 'Password:',
        port: 'Port:',
        add_tips:
            'The system will use SSH to access the server where Guardian is to be deployed. Ensure that the server \
             information is correct.',
        edit_tips:
            'This password is used for deploying Guardian only and is not stored in the system.',
    },
    common_term_guardian_container: 'Container environment: ',
    common_term_guardian_physics: 'Physical environment: ',
    common_term_guardian_containerId: 'Container ID:',
    common_term_guardian_normal: 'Normal',
    common_term_guardian_disconnected: 'Offline',
    common_term_guardian_restart: ', Restart a Guardian.',
    common_term_guardian_deploying: 'Deploying',
    common_term_guardian_connecting: 'Connecting',
    common_term_guardian_fingerprint_tip: 'The {0} fingerprint is {1}',
    common_term_guardian_fingerprint_content: 'Are you sure you want to add {0}?',
    common_term_guardian_Permission_tip:
        'You do not have the permission to analyze the Guardian of other users.',
    common_term_delete_guardian_tip:
        'Delete {0} ?',
    common_term_delete_guardian_connect_content: 'The current Guardian status is Normal. Deleting the Guardian will \
     stop all the analysis tasks being executed by the Guardian. Are you sure you want to delete {0}? ',
    common_term_delete_guardian_deployed_content:
        'The current Guardian status is Creating. Check whether {0} needs to be deleted.',
    common_term_delete_guardian_disconnect_content: 'The current Guardian status is Offline. Enter the account \
     name and password used for deploying {0} and click OK to delete all files related to {1}. If you click OK \
      without entering the password, you need to manually delete the guardian. ',
    common_term_delete_guardian_disconnect_manually: 'The current Guardian status is Offline. After clicking OK, \
     you need to manually delete the Guardian executable files from the remote server.',
    common_term_new_sampling: 'Add Sampling Analysis',
    common_term_new_sampling_interval_tip: 'The dump interval must be less than or equal to the sampling duration. ',
    common_term_delete_record_title: 'Are you sure that you want to delete the {0} analysis record?',
    common_term_delete_report_title: 'Are you sure that you want to delete the {0} analysis Reports?',
    common_term_delete_report_content: 'All historical data related to the current data will be deleted after \
     confirmation.',
    common_term_delete_record_content: 'After you click OK, all history data related to the current analysis \
     record will be deleted.',
    common_term_downTip: 'Download instruction issued.',
    common_term_sampling_forms: {
        creating: 'Generating the sampling report...',
        recordName: 'Name',
        recordSec: 'Duration(s)',
        recordSecTips: 'The sampling analysis of the last five minutes only are recorded.',
        stop: 'Manual Stop',
        recordingMode: 'Recording Mode',
        recordingModeDesignate: 'Specified duration',
        recordingModeNotLimit: 'Unlimited duration',
        stopTips: 'If you do not specify the record duration, enable manual stop. After the sampling is \
         manually stopped, the system analyzes only the sampling data collected 5 minutes before the \
          sampling is stopped.',
        methodSample: 'Method Sampling',
        javaMethodInterval: 'Java Method Sampling Interval(ms)',
        nativeMethodInterval: 'Native Method Sampling Interval(ms)',
        threadDump: 'Thread Dump',
        threadDumpInterval: 'Dump Interval(s)',
        recording: 'Recording xxx...',
        duration: 'Sampling time:',
        stop_analysis: 'Stop',
        cancel_analysis: 'Cancel',
        fileIoSample: 'File I/O Sampling ',
        socketIoSample: 'Socket I/O Sampling',
        leakSample: ' Old-Generation Object Sampling',
        leakSampleThred: 'Event Collecting Stack Depth'
    },
    protalserver_threaddump_tab: {
        threaddump: 'Thread Dump',
        reportInf: 'Data Info',
    },
    protalserver_heapdump_tab: {
        memorydump: 'Heap Dump',
        reportInf: 'Data Info',
        importTypePlaceholder: 'Select a data type.',
        saveReportType: 'Data Category',
        saveReportTypePlaceholder: 'Select a data category.',
    },
    protalserver_gclog_tab: {
        offgclog: 'GC Log',
        reportInf: 'Data Info',
    },
    protalserver_sampling_tab: {
        enviroment: 'Overview',
        gc: 'GC',
        lock: 'Lock and Wait',
        threadDump: 'Thread Dump',
        methodSample: 'Method Sampling',
        objects: 'Memory',
        io: 'IO',
        leak: 'Old-Generation Objects',
        allObjects: 'All Objects',
        cpu: 'CPU',
        suggestions: 'Suggestions',
        dumpSuccess: 'Thread dump created successfully.'
    },
    protalserver_sampling_enviroment: {
        cpu: 'CPU Usage',
        usaged: 'Total system usage',
        jvmUserMode: 'JVM User Mode',
        jvmSystemMode: 'JVM System Mode',
        systemproperty: 'Java System Property',
        spkeyword: 'Key',
        spvalue: 'Value',
    },
    protalserver_sampling_enviroment_system: {
        system: 'System Environment',
        cpu: 'CPU',
        cores: 'Cores',
        memory: 'Memory',
        os: 'OS',
    },
    protalserver_sampling_enviroment_ev: {
        enviromentvariable: 'Environment Variables',
        keyword: 'Variable',
        value: 'Value',
    },
    protalserver_sampling_memory_gc: {
        config_info: 'Configuration Information',
        config: 'GC Configuration',
        young: 'YoungCollector',
        old: 'OldCollector',
        concurrent_thread: 'ConcGCThreads',
        parallel_thread: 'ParallelGCThreads',
        concurrent_display: 'ExplicitGCInvokesConcurrent',
        display_disabled: 'DisableExplicitGC',
        use_thread: 'UseDynamicNumberOfGCThreads',
        time_ratio: 'GCTimeRatio',
        time_ratio_msgValue: 'Garbage collection time as a percentage of program running time. \
         Formula: 1/(1 + GCTimeRatio).',
        time_out: 'Pause Time (ms)',
        heap: 'Heaps (MiB)',
        used_heap_size: 'Used Size',
        free_heap_size: 'Free Size',
        committed_heap_size: 'Committed Size',
        meta_space: 'Metaspace (MiB)',
        used_meta_space: 'Used Metaspace',
        free_meta_space: 'Free Metaspace',
        commited_meta_space: 'Committed Metaspace'
    },
    protalserver_sampling_memory_heap: {
        config: 'Heap Configuration',
        initial: 'InitialHeapSize',
        min_size: 'MinHeapSize',
        max_size: 'MaxHeapSize',
        isuse: 'UseCompressedOops',
        isuse_msgValue: 'Whether compressed oops (object reference is represented as 32-bit offset \
             instead of 64-bit pointer) are used to optimize 64-bit performance.',
        compressed: 'PrintCompressedOopsMode',
        compressed_msgValue: 'Compressed oop mode.',
        address_size: 'heapAddressBits',
        objects_alignment: 'ObjectAlignmentInBytes',
        objects_alignment_msgValue: 'Memory alignment mode (in bytes) for Java objects. The default value is 8 bytes.'
    },
    protalserver_sampling_memory_generation: {
        config: 'Young Generation Configuration',
        min_size: 'NewSize',
        max_size: 'MaxNewSize',
        new_ratio: 'NewRatio',
        initial_lifttime: 'InitialTenuringThreshold',
        initial_lifttime_msgValue: 'Initial number of times that a young-generation object can be copied \
         before it is tenured.',
        max_lifttime: 'MaxTenuringThreshold',
        max_lifttime_msgValue: 'Maximum number of times that a young-generation object can be copied before \
         it is tenured.',
        used: 'UseTLAB',
        used_msgValue: 'Whether the thread local allocation buffer is used.',
        min_tlab_size: 'MinTLABSize',
        min_tlab_size_msgValue: 'Minimum TLAB size.',
        waste_limit: 'TLABRefillWasteFraction',
        waste_limit_msgValue: 'Max TLAB waste at a refill. If the requested memory is greater than the value \
         specified, memory will  be allocated from the heap. Otherwise, a new TLAB will be created \
          to allocate memory.',
    },
    protalserver_sampling_memory_heap_pause: {
        heap: 'Heaps',
        pause: 'GC Pause Time',
    },
    protalserver_sampling_memory_gc_activity: {
        label: 'GC Activities',
        activity: 'GC Activity',
        cause: 'Cause',
        collector_name: 'Collector Name',
        before_memory: 'Memory Before GC',
        after_memory: 'Memory After GC',
        longest_pause: 'Max Pause Duration',
    },
    protalserver_sampling_memory_pause: {
        label: 'Pause Phase',
        pause_phase: 'Event Type',
        name: 'Name',
        duration: 'Duration (µs)',
        start: 'Start Time',
    },
    protalserver_sampling_lock_monitor: {
        label: 'Monitor',
        name: 'Class',
        total_block_time: 'Total Block Time (ms)',
        thread: 'Blocked Threads',
        count: 'Sampling Count',
    },
    protalserver_sampling_lock_thread: {
        label: 'Threads',
        name: 'Thread',
        total_block_time: 'Total Block Time (ms)',
        count: 'Sampling Count',
    },
    protalserver_sampling_lock_stack: 'Stack Trace',
    protalserver_sampling_thread: {
        label: 'Type',
        raw: 'Raw data',
        lock: 'Lock Analysis',
    },
    protalserver_sampling_method: {
        graph_type: 'Graph Type',
        flame_groph: 'Flame graph',
        thread_tree: 'Call tree by thread',
        sample_data: 'Sample Data',
        java_method_sample: 'Java method sample',
        native_method_sample: 'Native method sample',
    },
    protalserver_sampling_object_class: {
        label: 'Classes',
        name: 'Class',
        max_count: 'Max. Real Time Count',
        max_size: 'Max. Real Time Size',
        total_allocation: 'Memory Allocated',
    },
    protalserver_sampling_leak: {
        object: 'Object',
        stack: 'Stack Trace',
        size: ' Used Heap',
        reference: 'Reference Link',
        pages: 'Total Records',
        tabel: {
            time: ' Time',
            object: ' Object',
            thread: ' Thread',
            stack_size: 'Used Heap'
        },
        sugget: 'Tuning Suggestions',
        suggetNumber: 'You have {0} tuning suggestion.',
        suggetNumbers: 'You have {0} tuning suggestions.',
        btnIcon: '{0} suggestion is generated. Click to',
        btnIcons: '{0} suggestions are generated. Click to ',
        look: 'view the suggestions.'
    },
    protalserver_sampling_object_memory: 'Memory Allocation',
    protalserver_sampling_object_stackTrance: 'Stack Trace',
    protalserver_profiling_stop_analysis: 'Stop Analysis',
    protalserver_profiling_stop_content: 'Are you sure you want to stop profiling of the current process?',
    protalserver_profiling_stop_content2: 'After the analysis is stopped, only the current data retained can be viewed \
     and some functions will be unavailable. Continue?',
    protalserver_profiling_re_analysis: 'Restart',
    protalserver_profiling_re_title: 'Restart Online Analysis',
    protalserver_profiling_re_tip: 'The current process is used by another user. Please try again later.',
    protalserver_profiling_re_content: 'Are you sure you want to start online analysis again? If yes, \
     all data will be cleared.',
    protalserver_profiling_delAll: 'Clear All Data',
    protalserver_profiling_delAllTip: 'Are you sure you want to clear all data?',
    protalserver_profiling_delOne: 'Clear Data on the Current Page',
    protalserver_profiling_delOneTip: 'Are you sure you want to clear data of {0}?',
    protalserver_profiling_noData: 'No data needs to be cleared on this page.',
    protalserver_profiling_delSnapshot: 'Clear Data on the Current Page',
    protalserver_profiling_delSnapshotTip: 'The clear function does not apply to snapshot data. \
     Delete the snapshot in the snapshot list \
    on the left.',
    protalserver_profiling_threadDelTitle: 'Delete Thread Dump File',
    protalserver_profiling_threadDelete: 'Are you sure you want to delete the thread dump file?',
    protalserver_profiling_graphDelete: 'Are you sure you want to delete the Lock Analysis file?',
    protalserver_profiling_tab: {
        overview: 'Overview',
        thread: 'Threads',
        cpu: 'CPU',
        hot: 'Hotspot',
        memory: 'Java Heaps',
        memoryDump: 'Memory',
        snapshot: 'Snapshot',
        jdbc: 'JDBC',
        jdbcpool: 'JDBC Connection Pool',
        database: 'Database',
        mongodb: 'MongoDB',
        cassandra: 'Cassandra',
        hbase: 'Hbase',
        httpRequest: 'HTTP Requests',
        io: 'IO',
        fileIo: 'File IO',
        socketIo: 'Socket IO',
        springBoot: 'Spring Boot',
        metrics: 'Metrics Change',
        http_traces: 'Hotspot HTTP Traces',
        gc: 'GC',
        gcAnalysis: 'GC Analysis',
        gcLog: 'GC Logs',
        web: 'Web',
        jdbcPoolNoData: 'No parameter configured. Start JDBC database connection pool analysis first.',
    },
    protalserver_profiling_memoryDump: {
        start: 'Start Heap Dump',
        cancal: 'Cancal',
        state1: 'Generate heap dump file',
        state2: 'Transfer heap dump file',
        state3: 'Parse heap dump file',
        state4: 'Finish',
        cancalSuccess: 'Canceled successfully.',
        cancalTitle: 'Cancal Dump',
        cancalTip: 'Confirm to cancel the current heap dump file?',
        dumpState: 'Generating the heap dump file...',
        dumpTransfer: 'Transferring the heap dump file...',
        dumpContent: 'Analyzing the heap dump file ... The file size is {0}. It will take {1} to {2} ',
        dumpContent1: 'Analyzing the heap dump file ... The file size is {0}.',
        dumpType: {
            type: 'Display',
            histogram: 'Histogram',
            dominantTree: 'Dominator tree'
        },
        class: 'Class Name',
        instance: 'Number of Instances',
        sHeap: 'Shallow Heap Size',
        rHeap: 'Retained Heap Size',
        Percentage: 'Percentage',
        loading: 'Dumping the memory...',
        loadMore: 'More',
        currentShow: 'Current',
        totalNum: 'Total',
        Remain: 'Remaining',
        PercentageTip: 'Percentage of the reserved heap to the total heap of the instance',
        startTip: 'A heap dump is a snapshot of all the objects that are in memory in the JVM at a certain moment.',
        exportLimit: 'Heap dump data cannot be exported.',
        exportHot: 'Hot data cannot be exported.',
        exportGClogLimit: 'GC log data cannot be exported.',
        exportThreadLimit: 'Thread dump data cannot be exported.',
    },
    protalserver_profiling_springBoot: {
        health: 'App Health Status',
        beans: 'Bean Component Info',
        metrics: 'Metrics Change',
        http_traces: 'Hotspot HTTP Traces',
        start_analysis: 'Start Analysis',
        stop_analysis: 'Stop Analysis',
        threshold: 'Threshold(ms):',
        version: 'Version',
        disk: 'Drive Space',
        diskTotal: 'Total capacity',
        diskFree: 'Available space',
        diskThreshold: 'Threshold capacity',
        resource: 'Source',
        dependence: 'Dependency',
        metricsCount: 'Metrics Count',
        metricsTip: 'Count',
        success: 'success',
        clientError: 'Client Error.',
        serverError: 'Server Error',
        instance: 'Instance',
        versionTip: 'There is a security risk, the version number cannot be obtained.',
        filterTime: 'Filter time range',
        requestCount: 'Total requests',
        successed: 'Successful ',
        status4: 'Status 4XX',
        status5: 'Status 5XX',
        maxTime: 'Maximum duration',
        lastedTime: 'Current duration',
        from: 'From',
        to: 'To',
        thresholdTip: 'The value ranges from 0 to 10,000. The system analyzes only the HTTP traces whose execution \
         duration exceeds the \
        threshold.',
        metricsTitle1: 'tomcat.sessions(Session Count)',
        metricsTitle2: 'tomcat.sessions(Current Session Value)',
        metricsTitle3: 'jvm.buffer(Buffer Count)',
        metricsTitle4: 'jvm.buffer(MiB)',
        metricsTitle5: 'logback.events.level(Event Count)',
        notSpringBootProcess: 'Spring Boot is not detected for this application.',
        filterTip: 'The data is scrolled and refreshed continuously. The filtered data may not contain the data of \
         the specified start \
        time.',
        btn_tip: 'Starts or stops Spring Boot access operation analysis.',
        filter: 'Filter',
        filterPath: 'Filter Path',
        pathFilte: 'Enter the path',
    },
    profiling_table: {
        timestamp: 'Timestamp',
        session: 'Session ID',
        method: 'Method',
        url: 'Path',
        status: 'Status',
        content: 'Content-Type',
        length: 'length',
        timeTaken: 'Time Used (ms)'
    },
    protalserver_profiling_springBoot_login: {
        login: 'Log in to Spring Boot',
        springBootName: 'Enter the Spring Boot user name.',
        password: 'Enter the password',
        savePpassword: '(Used only to verify the current session and is not saved)',
        errorLogin: 'The user name or password is incorrect. '
    },
    protalserver_profiling_overview: {
        heap: 'Heap Memory',
        usedHeap: 'Used heap memory',
        commitHeap: 'Committed heap memory',
        nonHeap: 'Non-heap Memory',
        physicalMemory: 'Physical Memory',
        usedSize: 'Used non-heap memory',
        committedSize: 'Committed non-heap memory',
        systemFreePhysicalMemorySize: 'Free system memory',
        processPhysicalMemoryUsedSize: 'Memory used by Java processes',
        gc_tip: 'Pause Time',
        gc_activety: 'GC Activity',
        class: 'Class',
        class_tip: 'Loaded Classes',
        thread: 'Thread',
        thread_tip1: 'Running processes',
        thread_tip2: 'Waiting processes',
        thread_tip3: 'Blocked processes',
        cpu_load: 'CPU Load',
        cpu_tip1: 'System CPU usage',
        cpu_tip2: 'CPU usage of Java process',
    },
    protalserver_profiling_overview_parame: 'Parameters',
    protalserver_profiling_overview_env: {
        env: 'Environment',
        committed: 'Committed',
        used: 'Used',
        pause_time: 'Pause Time',
        loaded: 'Loaded',
        total: 'Total',
        blocked: 'Blocked',
        waiting: 'Waiting',
        runing: 'Running',
        usage: 'Usage',
        keyword: 'Keyword',
        value: 'Value',
        runable: 'RUNNABLE',
        blocked2: 'BLOCKED',
        waiting2: 'WAITING',
        waitingTime: 'TIMED_WAITING'
    },
    protalserver_profiling_thread: {
        list: 'Thread List',
        dump: 'Thread Dump',
        graph: 'Lock Analysis',
        dumpbtn: 'Dump',
        dumptips:
            'A snapshot of all the threads  running at a specific time of the JVM. To view details, \
             choose Threads > Thread Dump.',
        graphbtn: 'Generate',
        graphtips: '',
        thread_list_placehold: 'Enter the thread name',
        show_use: 'Display Mode',
        show_placehold: '-Select-',
        show_more: 'multiple states',
        show_runnable: 'RUNNABLE state',
        show_waiting: 'WAITING state',
        show_blocked: 'BLOCKED state',
    },
    protalserver_profiling_memory: {
        histogram: 'Object Allocation',
        btn: 'Refresh Data',
        name: 'Class',
        instance: 'Instance',
        size: 'Memory Used (KiB)',
        memory: 'Heaps',
        free_size: 'Used',
        commit_size: 'Committed',
    },
    protalserver_profiling_jdbc: {
        tipsone: 'Your SQL/NoSQL statements or operations will be displayed on the current page.',
        tipstwo: 'The information is used only for performance analysis and is not saved in the system. \
         Please determine whether display \
        the information.',
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
    protalserver_profiling_hbase: {
        start_analysis: 'Start Analysis',
        stop_analysis: 'Stop Analysis',
        btn_tip: 'Starts or stops HBase access operation analysis.'
    },
    protalserver_profiling_cass: {
        start_analysis: 'Start Analysis',
        stop_analysis: 'Stop Analysis',
        btn_tip: 'Starts or stops Casssndra access operation analysis.'
    },
    protalserver_profiling_mongodb: {
        start_analysis: 'Start Analysis',
        stop_analysis: 'Stop Analysis',
        btn_tip: 'Starts or stops MongoDB access operation analysis.'
    },
    protalserver_profiling_http: {
        hot_spots: 'Hot Spots',
        real_time: 'Real-Time Monitoring',
        start: 'Start Analysis',
        stop: 'Stop Analysis',
        request: 'Executed Requests',
        average_exec_time: 'Average Execution Time',
        btn_tip: 'Starts or stops HTTP Requests access operation analysis.'
    },
    protalserver_profiling_gc_log: {
        start_collect: 'Collect GC Log',
        showTypes: 'Data Type',
        no_data: 'No data found. Collect GC logs first',
        cancel: 'Cancel Collection',
        translate: 'Transferring GC log files',
        analysis: 'Parsing GC log files',
        finish: 'Complete',
        cancalTitle: 'Cancel Collection',
        cancalTip: 'Are you sure you want to cancel GC log collection?',
        showType: {
            key: 'G1 GC key metrics',
            cause: 'G1 GC Causes',
            detail: 'Detailed Analysis of GC Activities'
        },
        key_point: 'Key Metrics',
        throughput: 'GC throughput',
        cost: 'GC overhead',
        average: 'Linearity',
        aver_pause_time: 'Average GC pause',
        highest_pause_time: ' Maximum pause',
        pauseCount: 'GC Pauses',
        pause_table: {
            durationTime: 'Duration(ms)',
            pause: 'GCs',
            percent: 'Percentage'
        },
        collectType: 'GC Linearity',
        cause_table: {
            reason: 'GC Cause',
            count: 'Count',
            aver: 'Average Time(ms)',
            max: 'Maximum Time(ms)',
            total: 'Total Time(ms)',
            per: 'GC Time',
            totalCount: 'Total'
        },
        collectStage: 'G1 Collection Phase Statistics',
        pauseAndMemoryUsed: 'GC Pause & Memory Usage Change',
        collect_table: {
            type: 'Metric Type',
            young: 'Young Phase',
            hybrid: 'Hybrid Phase',
            gc: 'Full GC',
            young_recycle: ' Young Generation Collection',
            origin: 'Initial Markers',
            scan: 'Concurrency Root Zone Scanning',
            tag: 'Concurrent Marks',
            re_tag: 'Re-mark',
            clean: 'Cleaning Phase',
            con_clean: 'Concurrent Cleaning',
            tip: 'Click to view detailed analysis'
        },
        young_table: {
            type: 'Metric Type',
            pre: 'Pre Evacuate',
            evacuate: 'Evacuate CSet',
            post: 'Post Evacuate CSet',
            other: 'Other',
            choose: 'Choose CSet',
            humongous: 'Humongous Register',
            failure: 'Evacuation Failure',
            fixup: 'Code Roots Fixup',
            clear: 'Clear CT',
            reference: 'Reference Proc',
            weak: 'Weak Proc',
            purge: 'Code Roots Purge',
            redirty: 'Redirty Cards',
            free: 'Free CSet',
            reclaim: 'Humongous Reclaim',
        },
        init_table: {
            type: 'Metric Type',
            parallel: 'Parallel Time',
            fixup: 'Code Roots Fixup',
            purge: 'Code Roots Purge',
            clear: 'Clear CT',
            other: 'Other',
            failure: 'Evacuation Failure',
            choose: 'Choose CSet',
            refProc: 'Ref Proc',
            refEnq: 'Ref Enq',
            redirty: 'Redirty Cards',
            register: 'Humongous Register',
            reclaim: 'Humongous Reclaim',
            free: 'Free CSet',
        },
        comitans_table: {
            type: 'Metric Type',
            exit: 'Ext Roots Scanning',
            update: 'Update RS',
            scan: 'Scan RS',
            code: 'Code Root Scanning',
            object: 'Object Copy',
            termination: 'Termination',
            gcWorker: 'GC Worker Other',
        },
        memory_table: {
            pauseTime: 'GC Pause Duration',
            heapState: 'Heap Usage',
            oldState: 'Old Zone Usage',
            edenState: 'Eden Zone Usag',
            surviorState: 'Survior Zone Usage',
            originDate: 'Metadata Zone Usage',
        },
        detailInfo: {
            youngRecycle: 'Detailed Analysis of Young Generation Collection',
            initialMark: 'Detailed Analysis of Initial Markers',
            mixedPhase: 'Detailed Analysis of Hybrid Phase',
            serialPhase: 'Serial Phase',
            comitansPhase: 'Paralleled Phase',
            collectPhase: 'Collection Phase',
            count: 'Count',
            totalTime: 'Total GC Time',
            averageTime: 'Average GC Time',
            averageTimeOffset: 'Average Time Standard Deviation',
            minAndMaxTime: 'Minimum/Maximum Time',
            averageIntervalTime: 'Average Interval',
        },
        legendName: {
            youngGC: 'Young GC',
            initMark: 'Initial mark',
            mixedGC: 'Mixed GC',
            fullGC: 'Full GC',
            beforeGC: 'Before GC',
            afterGC: ' After GC',
            submitHeap: 'Committed heap memory',
        },
        serialPointeType: {
            maxTime: 'Maximum Time Consumption',
            minTime: 'Minimum Time Consumption',
            averageTime: 'Average Time Consumption',
            sumTime: 'Total Time'
        },
        parallelPointeType: {
            maxTime: 'Maximum Time Consumption',
            minTime: 'Minimum Time Consumption',
            averageTime: 'Average Time Consumption',
            diffTime: 'Average Deviation of Time Consumption'
        },
        memorySize: 'Memory Size(MiB)',
        pauseTime: 'Pause Duration({0})',
        total: 'Total',
        keyAnalysisType: {
            yongGC: 'Young GC (evacuation pause)',
            initialMark: ' Initial mark',
            retryMark: 'Remark',
            clear: 'Cleanup',
            mixGC: 'Mixed GC (evacuation pause)',
            fullGC: ' Full GC pause',
            all: 'Total(All Paused)',
        },
        totalData: 'Total ',
        gcTimePercent: 'GC Time',
        linearity: 'Linearity(%)',
        systemTime: 'System running time: ',
        linearyTip: 'Linearity presents CPU multi-core usage and is calculated using the following formula: \
        (Time consumed by users + Time consumed by the system) / Actual time consumed.',
        gcLogTip: 'Collects GC log files of the Java process, analyzes log contents, and generates \
         visualized indicators.',
        nodataTip: 'No data is obtained. Check whether to enable the corresponding log level.',
        forHelp: 'Consult the help',
    },
    protalserver_profiling_http_threshold: 'Threshold(ms)',
    protalserver_profiling_http_threshold_tip: 'The value ranges from 0 to 10,000. \
     The system analyzes only the operations whose \
    execution duration exceeds the threshold.',
    common_term_operate: 'Operation',
    common_term_operate_del: 'Delete',
    common_term_operate_reset: 'Edit',
    common_term_operate_ok: 'OK',
    common_term_operate_continue: 'OK',
    common_term_operate_cancel: 'Cancel',
    common_term_operate_close: 'Close',
    common_term_delete_content:
        'After the project is deleted, the historical data of this project will be deleted. ',
    common_term_delete_title: 'Are you sure you want to delete this project?',
    common_term_log_user: 'User Name',
    common_term_log_ip: 'IP',
    common_term_log_event: 'Event',
    common_term_log_result: 'Result',
    common_term_log_time: 'Time',
    common_term_log_Detail: 'Detail',
    common_term_source_path: 'Source Code Path',
    common_term_operate_add_pro: 'New Project',
    common_term_operate_edit: 'Edit',
    common_term_projiect_name: 'Project Name:',
    common_term_projiect_name_tip: 'The project name is a string of 6 to 32 characters, allowing letters, \
     digits, periods (.), and underscores (_). It must start with a letter.',
    common_term_operate_search: 'Please enter a keyword',
    common_term_projiect_task: '',
    common_term_projiect_task_system: 'Systems',
    common_term_projiect_task_process: 'Processes',
    common_term_projiect_function: 'Functions',
    common_term_projiect_task_function: 'Function Analysis Tasks',
    common_term_user_changePwd: 'Change The Original Passowrd',
    common_term_projiect_view_more: 'More',
    common_term_task_new: 'New Analysis',
    common_term_task_c: 'C/C++ Program',
    common_term_task_java: 'Java Mixed-Mode',
    common_term_task_name: 'Task Name',
    common_term_task_type: 'Task Type',
    common_term_task_status: 'Status',
    common_term_task_time: 'Time Used(s)',
    common_term_task_analysis_type: 'Analysis Type',
    common_term_task_start_time: 'Created Time',
    common_term_task_run: 'Start',
    common_term_task_stop: 'Stop',
    common_term_task_noPrimary: 'No host process exists in the current Guardian.',
    common_term_task_noContainer: 'No container process exists in the current Guardian',
    common_term_task_nodata: 'No data',
    common_term_guardian_nodata: 'No Java process exists in the current Guardian.',
    common_term_search_guardian_nodata: 'No process found.',
    common_term_guardian_disconnected_noData: 'The Guardian is in offline state. Restart the Guardian \
     and check the Java process of the Guardian.',
    common_term_task_new_c: 'New C/C++ Program Analysis',
    common_term_task_new_java: 'New Java Program Analysis',
    common_term_task_edit_c: 'Edit C/C++ Program Analysis',
    common_term_task_edit_java: 'Edit Java Program Analysis',
    common_term_task_start_now: 'Start Now',
    common_term_task_type_launch: 'When a collection task is started and the application is \
     started, the collection duration is controlled by the execution time \
    of the application. This mode is applicable to applications that run for short time.',
    common_term_task_type_attach: 'When a collection task is started and the application is running, \
     the collection duration is controlled by configuration parameters. This mode is applicable \
      to applications that run for short time.',
    common_term_task_type_profile: 'The running applications in the system can be ignored when \
     collecting the data of the entire system. The collection duration is controlled by \
      configuration parameters. This mode applies to scenarios where multiple services are running \
       and there are subprocesses.',
    common_term_admin_user: 'User Management',
    common_term_admin_log: 'Operation Logs',
    common_term_admin_run_log: 'Run Logs',
    run_log: {
        admin_manager_log: ' User management run logs',
        java_run_log: ' Java Profiler run log',
        java_run_log_download: 'Download',
    },
    common_term_log_download: 'Are you sure you want to download the following run logs?',
    common_term_log_detail: 'Log Details',
    common_term_admin_public_log: 'Common Logs',
    common_term_admin_optimize_log: 'Java Profiler Logs',
    common_term_user_public_log: 'Common Operation Logs',
    common_term_user_optimize_log: 'Java Profiler Operation Logs',

    common_term_admin_download_log: 'Download',
    common_term_admin_downLoad: 'Download',
    common_term_admin_log_fileName: 'Log File Name',
    common_term_admin_log_size: 'Size',
    common_term_admin_log_level: 'Log Level',
    common_term_admin_log_adit:
        'Are you sure you want to change the current log level?',
    common_term_admin_manager_name: 'Administrator:',
    common_term_admin_log_password_tip:
        'Incorrect password. Please enter a correct one.',
    common_term_admin_change_pwd: 'Change Password',
    common_term_admin_log_out: 'Log Out',
    common_term_admin_user_normal: 'User',
    common_term_admin_user_guest: 'Guest',
    common_term_admin_user_create: 'New',
    common_term_admin_user_create_title: 'New User',
    common_term_admin_user_notAllowEdit: 'The user name created cannot be changed.',
    common_term_admin_user_edit_user: 'Reset Password',
    common_term_admin_user_name: 'Name',
    common_term_admin_user_role: 'Role',
    common_term_admin_user_edit: 'Reset Password',
    common_term_admin_user_delete_title: 'Delete User',
    common_term_admin_user_delete_detail:
        'After the deletion, all historical data related to the user will be deleted.',
    common_term_delete_content_analysis:
        'After the task is deleted, all historical data of this task will be deleted.',
    common_term_delete_title_analysis:
        'Are you sure you want to delete this task?',
    status_Created: 'Created',
    status_Sampling: 'Sampling',
    status_Analyzing: 'Analyzing',
    status_Aborted: 'Aborted',
    status_Failed: 'Failed',
    status_Completed: 'Completed',

    tip_msg: {
        log_error: 'Failed to obtain the log information.',
        conf_error: 'Failed to obtain configuration information.',
        opr_error: 'Operation failed. ',
        task_list_error: 'Failed to obtain the task list.',
        task_start_warn: 'A task is being executed. Try again later.',
        task_start_error: 'Failed to start the collection task.',
        task_create_error: 'Failed to create the task.',
        task_disk_error: 'The remaining drive space is insufficient.',
        task_stop_error: 'Failed to stop the task.',
        task_del_error: 'Failed to delete the task.',
        total_results_error: 'Failed to obtain the overall statistics.',
        plat_form_error:
            'Failed to obtain the platform and collection information.',
        top_function_error: 'Failed to obtain the top hotspot function.',
        log_timeout: 'Logged out or timed out.',
        log_ok: 'Login successful.',
        logged_in: 'User has logged in.',
        edite_ok: 'Modified successfully.',
        edite_error: 'Failed to edit.',
        common_term_task_crate_mask_tip:
            'Enter one or more CPU core IDs, for example, 2-5, 2,3,4,5, or 2,3,4-5.',
        delete_ok: 'Deleted successfully.',
        delete_error: 'Failed to delete.',
        add_ok: 'Added successfully.',
        add_error: 'Failed to add.',
        get_flame_error: 'Failed to obtain the flame graph.',
        reset_pwd_error_old:
            'Failed to change the password. Please enter the correct old password.',
        reset_pwd_error_repeat:
            'Failed to change the password. New password must be the different with old password.',
        peoject_exist: 'The project name already exists.',
        common_term_task_crate_c_bs_tip: 'If the binary or symbol file is stored in another directory, \
         for example, /symbol, the subdirectory of the directory must be the same as the absolute path \
          of the target application. For example, if the application to be analyzed is in the /home directory, \
           the source file must be saved in the /symbol/home directory.',
        common_term_task_crate_c_source_tip: 'If the C/C++ source file is stored in another directory, \
         for example, /Source, the subdirectory of the directory must be the same as the absolute path of \
          the target application. For example, if the application  to be analyzed is in the /home directory, \
           the source file must be saved in the /Source/home directory.',
        common_term_task_crate_j_source_tip: 'If the Java source file is stored in another directory, \
         for example, /Source, the subdirectory of the directory must be the same as the absolute path of \
          the target application. For example, if the application to be analyzed is in the /home directory, \
           the source file must be saved in the /Source/home directory.',
        default_value: 'The current value is the default value.',
    },
    validata: {
        guardian_name_rule:
            'The value must start with a letter and contain 6 to 32 characters, including letters, \
             digits, dots (.), and underscores (_).',
        name_rule:
            'The user name contains 6–32 characters, including letters, digits, hyphens (-), \
             and underscores(_), and must start with a letter.',
        task_name_rule: 'The task name is a string of 6 to 32 characters, allowing letters, digits, \
         periods (.), and underscores (_). It must start with a letter.',
        pwd_rule: 'The password must be a string of 8 to 32 characters that contains at least two of \
         the following character types: uppercase letters, lowercase letters, digits, and special \
          characters (`~!@#$%^&*()-_=+\\|[{}];:\'", <.>/?). Spaces are not allowed.',
        pwd_conf: 'The two passwords do not match.',
        req: 'This password cannot be left blank.',
        name_req: 'This user name cannot be left blank.',
        ip_req: 'This server ip address cannot be left blank.',
        port_req: 'This port cannot be left blank.',
        report_name_rule: 'The data name can only contain letters, digits, spaces, and special characters .+-()_. \
            The length ranges from 6 to 128 characters. It must start with an English letter.',
    },

    error_inertval: 'Internal server error.',
    bad_request: 'Bad request.',
    first_login:
        'Login successful. For security purposes, change the initial password upon your first login.',
    pwd_guoqi:
        'The password has expired. For ensure  account security, change your password in time.',
    login_error:
        'The user name or password is incorrect. You can try more times.',
    login_lock: 'Account locked. Please try again 10 minutes later.',
    login_10:
        'The number of sessions of the current user has reached the upper limit (10). Wait until other sessions \
         end and try again.',
    reset_pwd_ok:
        'Password changed successfully. Please log in using the new password.',
    logout_ok: 'You have logged out of the system.',
    logout_error: 'System error.',
    selectPlace: '-Select-',
    loading: 'LOADING...',
    functiondetail_no_get_data: 'No data returned.',
    function_error: 'Failed to obtain function information.',
    secret_title: 'Are you sure you want to create the analysis task?',
    secret_count: 'Your running data will be collected and associated with the source code for performance \
     analysis and optimization. \
    The collection will not affect software running or retain your source code.',
    system_busy: 'The system is busy, please try again later.',
    application_not_exist: 'This application does not exist.',
    application_not_access: 'You do not have the access permission.',
    cpu_mask_range: 'Enter a value from 0 to ',
    cpu_mask_format: 'Incorrect format. For example, 2,3,4-5.',
    invalid_directory: 'Invalid directory.',
    invalid_directory_common: 'Invalid directory.',
    pid_not_exist: 'The PID or TID does not exist.',
    task_name: 'Task name',
    invalid_application_permisson:
        'The current user does not have the permission to access the application.',
    invalid_directory_permisson:
        'The current user does not have the permission to access the path.',
    add_guardian_ssh_tip:
        'The system will use SSH to access the server where Guardian is to be deployed. Ensure that \
         the server information is correct.',
    add_guardian_password_tip:
        'This password is used for deploying Guardian only and is not stored in the system.',
    aboutMsg: {
        name: 'Java Profiler',
        version: 'Version ',
        time: 'Release Date: ',
        copyRight: 'Copyright @ Huawei Technologies Co.',
    },
    guardian_not_fount: 'Guardian({0}) Not Found',
    disk_monitor: {
        label: 'Remaining Workspace',
        workspace: 'Workspace: ',
        remain: 'Remaining Workspace: ',
        recommend: 'Recommended Remaining Workspace> ',
        disk: 'Total Drive Capacity: ',
        disk_remain: 'Remaining Drive Capacity: ',
        disk_recommend: 'Recommended Remaining Drive Capacity> ',
        workspace_full_tip: 'Delete historical analysis records to release space. ',
        disk_full_tip: 'Release the disk space.',
        sample_opt_tip: 'The remaining workspace is insufficient.Delete historical analysis records to release space.',
        sample_opt_tip_disk: 'The remaining drive space is insufficient. Release the drive space.',
    },
    progress_close_btn_tip: 'The analysis is still in progress after the window is closed',
    io: {
        beginFileIo: 'Start Analysis',
        endFileIo: 'Stop Analysis',
        btn_tip_file: 'Starts or stops File IO access operation analysis.',
        btn_tip_socket: 'Starts or stops Socket IO access operation analysis.',
        threshold: 'Threshold(KiB/s)',
        thresholdMs: 'Threshold(KiB/s)',
        fileIoTip: 'The value ranges from 1 to 10,485,760. The system analyzes only the file I/Os \
         within the threshold.',
        socketIoTip: 'The value ranges from 1 to 10,485,760. The system analyzes only the socket I/Os \
         within the threshold.',
        sfileIoTip: 'The value ranges from 1 to 1000. The system captures only the file I/Os that \
         exceed the threshold for analysis.',
        ssocketIoTip: 'The value ranges from 1 to 1000. The system captures only the socket I/Os \
         that exceed the threshold for analysis.',
        noOperate: 'No data found. The system does not detect I/O events that exceed the threshold.',
        fileIo: {
            filePath: 'File Path',
            remoteIp: 'Remote Address',
            path: 'File Path/File Descriptor',
            socketPath: 'Remote Address/Port/File Descriptor',
            sampPath: 'File Path/Thread Invoked',
            smapSocketPath: 'Remote Address/Port/Thread Invoked',
            totalTime: 'Total I/O Duration',
            count: 'Count',
            readCount: 'Read Count',
            writeCount: 'Write Count',
            readByteCount: 'Read Bytes',
            writeByteCount: 'Written Bytes',
            threadName: 'Thread Name',
            snapshotOwn: 'Snapshot',
            operateType: 'Operation Type',
            operateTime: 'Operation Time',
            rAndWBytes: 'Read and Written Bytes',
            duration: 'Time Used',
            readRate: 'Read speed',
            writeRate: 'Write speed',
            fileIORate: 'File I/O Read/Write Speed',
            socketIORate: 'Socket I/O Read/Write Speed',
            eventRate: 'Rate',
            subDataLimit: 'Set the number of level-2 and level-3 entries. '
        }
    },
    jdbcpool: {
        suggestions: 'There are optimization suggestions for current indicators.Click',
        look: 'View Now',
        info: 'to learn more',
        analysisDbPool: 'Also analyze database connection pool',
        begin: 'Start Analysis',
        end: 'Stop Analysis',
        btn_tip: 'Starts or stops JDBC Connection Pool access operation analysis.',
        threshold: 'Threshold (ms)',
        thresholdus: 'Threshold (μs)',
        alertThreshold: 'Alarm Threshold (us)',
        inputThreshold: 'Enter the alarm threshold',
        visibleType: 'Display',
        wholeForm: 'Complete data form',
        queryView: 'Real-time monitoring view',
        linkId: 'Link ID',
        linkChart: 'Connection String',
        beginTime: 'Start Time',
        endTime: 'End Time',
        eventCount: 'Event Count',
        eventCostTime: 'Event Duration',
        jdbcpoolConfig: ' Connection Pool Parameters',
        normalRun: 'Normal Run',
        thresholdAlert: 'Threshold Alert',
        idleWaiting: 'Waiting',
        initialSize: 'initialSize',
        minIdle: 'minIdle',
        maxActive: 'maxActive',
        minEvictableIdleTimeMillis: 'minEvictableIdleTimeMillis',
        maxWait: 'maxWait',
        timeBetweenEvictionRunsMillis: 'timeBetweenEvictionRunsMillis',
        removeAbandonedTimeout: 'removeAbandonedTimeout',
        maxPoolPreparedStatementPerConnectionSize: 'maxPoolPreparedStatementPerConnectionSize',
        testOnBorrow: 'testOnBorrow',
        testOnReturn: 'testOnReturn',
        testWhileIdle: 'testWhileIdle',
        url: 'url',
        initialPoolSize: 'initialPoolSize',
        maxPoolSize: 'maxPoolSize',
        minPoolSize: 'minPoolSize',
        acquireIncrement: 'acquireIncrement',
        maxIdleTime: 'maxIdleTime',
        maxConnectorAge: 'maxConnectorAge',
        maxIdleTimeExcessConnections: 'maxIdleTimeExcessConnections',
        idleConnectionTestPeriod: 'idleConnectionTestPeriod',
        testConnectionOnCheckin: 'testConnectionOnCheckin',
        testConnectionOnCheckout: 'testConnectionOnCheckout',
        acquireRetryAttempts: 'acquireRetryAttempts',
        acquireRetryDelay: 'acquireRetryDelay',
        driverClassName: 'driverClassName',
        maxTotal: 'maxTotal',
        idleTimeout: 'idleTimeout',
        maxLifeTime: 'maxLifeTime',
        connectionTimeout: 'connectionTimeout',
        maxIdle: 'maxIdle',
        thresholdTip: 'Value range: 10 to 10000 ms',
        softMinEvictableIdleTimeMillis: 'softMinEvictableIdleTimeMillis',
        numTestsPerEvictionRun: 'numTestsPerEvictionRun',
        logAbandoned: 'logAbandoned',
        durationTime: 'Duration (us)',
        thread: ' Invoked Thread',
        moreThresholdTip: 'The data that exceeds the alarm threshold will be displayed in red.',
        configTwoInstructions: 'Only top events are displayed.'
    },
    weakPassword: {
        pwd_rule: 'The weak password must contain at least two types of the following characters: \
         uppercase letters, lowercase letters, digits, and special characters \
          (`~!@#$%^&*()-_=+\\|[{}];:\'",<.>/?). The length ranges from 8 to 32 characters.',
        addWeak: 'Add',
        addWeakPwd: 'Add Weak Password',
        WeakPwd: 'Weak Password',
        searchWeakPwd: 'Please enter a weak password',
        deleWeakPwd: 'Delete Weak Password',
        confirmdele: 'Are you sure you want to delete the weak password?',
        sureDelteWeakPwd: 'Are you sure you want to delete the weak password "{0}" ?',
        tip: 'To enhance user system security, passwords in the weak password dictionary are not allowed.'
    },
    profikeGC: {
        Timestamp: 'Timestamp',
        GCCause: 'GC Cause',
        GarbageCollector: 'Garbage Collector',
        MemoryAppliedforGC: 'Memory Applied for GC',
        MemoryBeforeGC: 'Memory Before GC',
        MemoryAfterGC: 'Memory After GC',
        GCThreads: 'GC Threads',
        PauseTime: 'Pause Time (ms)',
        CollectedGCEventInfo: 'Collected GC Event Info',
        GCActivities: 'GC Activities',
        Memory: 'Memory',
        GC: 'GC',
        GCCircle: 'GC Memory Size'
    },
    snapshot_analysis: 'Hotspot Analysis Snapshot',
    snapshot_analysis_content1: 'You can view the snapshots on the Snapshots tab page. \
     A maximum of five snapshots can be saved for a single analysis type.',
    memorydump_snapshot_analysis_content1: 'You can view the saved snapshots on the Snapshots tab page. \
     A maximum of five snapshots can \
    be saved for an analysis task. Only one snapshot needs to be saved for a heap dump. \
     Multiple snapshots can be saved for multiple \
    heap dumps for snapshot comparison.',
    snapshot_analysis_alert: ' A maximum of five snapshots can be saved for a single analysis type.',
    memorydump_snapshot_analysis_alert: ' A maximum of five snapshots can be saved for a single analysis type.',
    do_snapshot_success: 'Snapshot saved successfully.',
    snapshot_analysis_overSize: 'The number of snapshots has reached the upper limit. \
     Delete the earlier snapshots and try again.',
    snapshot_analysis_noData: 'Unable to save the snapshot when no data is available for the current analysis type.',
    jdbcpool_config_title: 'Set the number of level-2 entries',
    jdbcpool_config_top: 'TOP',
    jdbcpool_optimization_title: 'Tuning Suggestions:',
    jdbcpool_txt: 'The minimum number of idle connections is the maximum number of connections. ',
    newLockGraph: {
        obersver: 'Observation',
        obersverTip: 'If it is enabled, the threads and their locks or the locks and their requested \
         threads will be highlighted.',
        compare: 'Comparison',
        compareTip: 'After enabling this mode, you need to select the thread dump to be compared. By default, \
         the comparison result of the threads and their locks are displayed. By using the comparison mode \
          and the observation mode together, you can better observe the status change of the threads and \
           the locks at different time points. You can also select lock to observe the status change of \
        a lock and its requested threads at different time points. ',
        lock: 'Lock',
        thread: 'Thread',
        hasLocked: 'Holding lock',
        requestLocked: 'Requesting lock',
        threadExistDeadLock: 'Deadlocks found: {0}'
    },
    userGuide: {
        next: 'Next',
        done: 'Finish',
        addProject: 'Add Guardian',
        addProjectDes: 'Click the plus (+) icon and set parameters to add a Guardian.',
        configParams: 'Set Guardian Parameters',
        configParamsDes: 'After setting Guardian parameters, click OK.',
        confirmContinue: 'Confirm',
        confirmContinueDes: 'Performing remote deployment as the root user poses security risks. \
         If you want to continue, click OK.',
        confirmAdd: 'Confirm',
        confirmAddDes: 'Check that the public key fingerprint is correct and click OK. \
         Note: The fingerprint is the SSH public key \
        fingerprint of the server where the Guardian is to be deployed.',
        createTask: 'Create Analysis Task',
        createTaskDes: 'After the Guardian is added, select the Java process to be analyzed under \
         Host Processes or Container Processes in the Java process list and click Profiling Analysis.',
        createTaskContainerDes: 'After the Guardian is added, select the Java process to be analyzed under \
         Container Processes in the Java process list and click Profiling Analysis.',
        missingJavaProcess: 'Java Process Missing',
        missingJavaProcessDes: 'Online analysis and sampling analysis cannot be performed \
         because no Java process exists in the current \
        Guardian. To view again, choose More > Wizard.',
        targeEnvCreation: 'Target Environment Creation',
        targeEnvCreationDes: 'The target environment is being created.',
        endWizard: 'Close Wizard',
        profileAna: 'Profiling Report',
        profileAnaDes: 'Profiling (real-time Java performance analysis) consists of analysis \
         of the target JVM and the Java program. The report includes the JVM internal status, \
          such as heap, GC activities, and thread status, and Java program performance analysis, \
        such as call chain analysis, hotspot functions, lock analysis, program thread status, \
         and object generation and distribution.',
        profileManage: 'Manage Analysis Record',
        profileManageDes: 'Click a record name to view the analysis report. You can also delete, \
         import, and export analysis records.',
        viewWizard: 'View Wizard',
        viewWizardDes: 'The Java Profiler process is complete. You can click Wizard from the menu bar again.',
        noJavaProcess: 'No process can be analyzed'
    },
    statement: {
        title: 'Once you select "I have read the disclaimer", you confirm that you understand \
         and agree to the entire content of this \
        disclaimer:',
        content1: '1. It is recommended that you use this tool in a non-production environment \
         to prevent impact on services in the production environment.',
        content2: '2. The user name and password that are not used for the authentication of the \
         tool will not be saved in the system.',
        content3: '3. You have confirmed that you are the owner of the application or have obtained \
         authorization from the owner.',
        content4: '4. The analysis result may contain the internal information and related data of the \
         application you analyze. Please \
        manage the analysis result properly.',
        content5: '5. Unless otherwise specified in laws and regulations or contracts, Huawei does not make \
         any express or implied statement or warranty on the analysis results, nor makes any warranty or \
          commitment on the marketability, satisfaction, \
        non-infringement, or applicability of the analysis results for specific purposes.',
        content6: '6. Any actions you take based on the analysis records shall comply with laws and regulations, \
         and you shall bear the risks.',
        content7: '7. No individual or organization may use the application and associated analytical records \
         for any activity without the authorization of Huawei. Huawei is not responsible for any consequences \
          and bears no legal liabilities. Huawei will reserve the right to pursue legal action if necessary.'
    },
    profileNoData: {
        threadDumpNodata: ' No dump file is available. Perform thread dump first',
        threadDumpNodata2: 'Performing thread dump ...',
        profileSnapshotNodata: 'No snapshot is available. Save the snapshot first.',
        http: 'No analysis data is available. Start HTTP analysis first',
        http2: 'Collecting HTTP request data ...',
        fileIo: 'No analysis data is available. Start file I/O analysis first',
        fileIo2: 'Collecting file I/O data...',
        socketIo: 'No analysis data is available. Start the Socket I/O analysis first',
        socketIo2: 'Collecting Socket I/O data...',
        heapDumpNodata: 'No dump file is available. Perform heap dump first',
        heapDumpNodata2: 'Performing heap dump ...',
        springBoot: 'No analysis data is available. Start Spring Boot analysis first',
        springBoot2: 'Collecting Spring Boot data...',
        jdbcNoDataMsg: 'No analysis data is available. Start JDBC analysis first',
        jdbcNoDataMsg2: 'Collecting JDBC data...',
        jdbcPoolNoDataMsg: 'No analysis data is available. Start the JDBC database connection pool analysis first',
        jdbcPoolNoDataMsg2: 'Collecting the JDBC database connection pool data...',
        mongoDBNoDataMsg: 'No analysis data is available. Start MongoDB analysis first',
        mongoDBNoDataMsg2: 'Collecting MongoDB data...',
        cassandraNoDataMsg: 'No analysis data is available. Start Cassandra analysis first',
        cassandraNoDataMsg2: 'Collecting Cassandra data...',
        hBaseNoDataMsg: 'No analysis data is available. Start HBase analysis first',
        hBaseNoDataMsg2: 'Collecting HBase data...',
    },
    profileGC: {
        GCLogs: {
            GCLogs: 'GC Logs',
        }
    },
    profileMemorydump: {
        saveHeapDump: {
            saveReport: 'Save',
            input_remark_placehloder: 'Enter remarks.',
            saveReportTip: 'View the saved data on the Home-Data List-{0}.',
            saveReportTip1: 'If multiple thread dumps are saved for the same online analysis, only one record is generated.',
            saveReportSizeTip: 'The number of heap dump records has reached the upper limit. Delete some records.',
            saveTDReportSizeTip: 'The number of thread dump records has reached the upper limit. Delete some records.',
            saveGCLogReportSizeTip: 'The number of GC Logs records has reached the upper limit. Delete some records.',
            reportType: 'Data Type',
            heapDump: 'Heap Dump',
            saveRecord: 'Save Records',
            saveRecordHolder: 'Please select a record to save.',
            reportName: 'Data Name',
            reportNameHolder: 'Enter a data name.',
            reportRemarks: 'Remarks',
            successSaveReportTip: 'Data saved. View it on the Home-Data List-{0}.'
        },
        histogram: {
            seeShortCommonRoute: 'Query the Shortest Common Path from GC Roots to Objects',
            shortCommonRoute: 'Shortest Common Path from GC Roots to Objects',
            seeObjectWithGcRootsRoute: 'Query Path from Object to GC Roots',
            objectWithGcRootsRoute: 'Path from Object to GC Roots',
            shortCommonRouteLeft: 'Shortest Common Path from GC Roots to (',
            shortCommonRouteRight: 'Instance)',
            objectWithGcRootsRouteLeft: 'Path from (',
            objectWithGcRootsRouteRight: ') to GC Roots',
            allObjectLeft: 'List All Objects of (',
            allObjectRight: ')',
            common_term_back: 'Back',
            allObject: 'List All Objects of the Class',
            choiceExtend: 'Select Extended Information',
        },
        tree: {
            className: 'Class',
            refObjects: 'Referenced Instances',
            shallowHeap: 'Shallow Heap Size of the Current Object',
            refShallowHeap: 'Shallow Heap Size of Referenced Instances',
            retainedHeap: 'Reserved Heap Size of the Current Object',
            OGCRshallowHeap: 'Shallow Heap Size',
            OGCRretainedHeap: 'Retained Heap Size'
        },
        snapShot: {
            noData: 'No data. Select the snapshot file to be viewed.',
            compare: 'Compare',
            instance: 'Comparison of Instances',
            instanceASnapshot: 'A snapshot instance',
            instanceBSnapshot: 'Number of Snapshot B Instances ',
            retentionHeap: 'Retained Heap Comparison',
            retentionHeapASnapshot: 'A snapshot retentionHeap',
            retentionHeapBSnapshot: 'retained Heap of Snapshot B',
            and: 'and',
            snapshotContrast: 'Comparison of Snapshots',
            popChoiceTwoSnapshot: 'Compare Snapshots',
            popPleaseSnapshotType: 'Select a snapshot type.',
            popPleaseChoiceSnapshot: 'Select the snapshot to be compared.',
            deleteSnapshot: 'Delete Snapshot',
            confirmSnapshot: 'Are you sure you want to delete the snapshot?',
            popStopProfilingAnalysis: 'Stop Online Analysis',
            confirmStopProfilingAnalysis: 'After the analysis is stopped, only the current data retained \
             can be viewed and some functions \
            will be unavailable. Continue?',
            stopProfilingAnalysisNoData: 'Analysis has been stopped. The snapshot function is unavailable.',
            snapshotType: 'Snapshot Type',
            firstSnapshot: 'First',
            secondSnapshot: 'Second',
            formulaSnapshot: 'Formula:',
            subtracted: 'Subtract',
            snapshotError: 'Compare Snapshots',
            onlyASnapshot: '(onlyASnapshot)',
            onlyBSnapshot: '(onlyBSnapshot)',
            fileIo: {
                ASnapshot: 'Snapshot A',
                BSnapshot: 'Snapshot B',
                ABSnapshot: 'Snapshots A&B',
                ARrate: 'Snapshot A read rate',
                AWrate: 'Snapshot A write rate',
                BRrate: 'Snapshot B read rate',
                BWrate: 'Snapshot B write rate',
                IOBTotalTime: 'Total I/O time of snapshot B',
                IOTotalTime: 'Total I/O time',
                BSnapshotCount: 'Snapshot B count',
                CountComparison: 'Count comparison',
                BRCount: 'Snapshot B read count',
                RCount: 'Read count',
                BWCount: 'Snapshot B write count',
                WCount: 'Write count',
                BRBytes: 'Bytes Read for snapshot B',
                RBytes: 'Bytes read',
                BWBytes: 'Bytes written for snapshot B',
                WBytes: 'Bytes written',
                ASnapshotThreshold: 'Snapshot A Threshold(KiB/s)',
                BSnapshotThreshold: 'Snapshot B Threshold(KiB/s)',
            },
            jdbc: {
                hot_statement: 'Hotspot Statement',
                Btotal_time: 'Snapshot B Total Duration (ms)',
                total_time: 'Total Duration Comparison (ms)',
                Baver_time: 'Snapshot B Average Execution Duration (ms) ',
                aver_time: 'Average Snapshot Execution Duration Comparison (ms) ',
                Bexec_time: 'Snapshot B Execution Times',
                exec_time: 'Comparison of Execution Times',
            },
            http: {
                BSnapshot: 'Snapshot B ',
                hot: 'Hotspot'
            },
            jdbcpool: {
                linkId: 'Link ID',
                linkChart: 'Connection String',
                BbeginTime: 'Snapshot B start time',
                BendTime: 'Snapshot B end time',
                BeventCount: 'Snapshot B event count',
                BeventCostTime: 'Snapshot B event duration',
                beginTime: 'Start time comparison',
                endTime: 'End time comparison',
                eventCount: 'Event count comparison',
                eventCostTime: 'Event duration comparison',
                AnormalRun: 'A normal',
                AthresholdAlert: 'A alarm',
                BnormalRun: 'B normal',
                BthresholdAlert: 'B alarm',
            }
        }
    },
    squareBracketL: '[',
    squareBracketR: ']',
    strackTrace: {
        more: 'More',
        moreInfo: 'Current:{0} Total:{0} Reset:{0}',
        checkAll: 'Check All'
    },
    dataLimit: {
        timeHorizon: 'Time Limit (minutes)',
        countHorizon: 'Data Record Limit',
        restoreValue: 'Restore Defaults',
        tip: 'Ensure page performance by limiting the online analysis time and the number of records analyzed.'
    },
    searchBox: {
        mutlInfo: 'Enter the keyword.',
        info: 'Enter the {0} to be searched.'
    },
    leavePage: {
        leave_page_title: 'Leave Current Page',
        leave_page_content: 'If you leave the current page, the data collection will be paused.\
         The data collection will continue after you switch back to the page again. Are you sure \
          you want to leave this page?',
        leave_page_tip: 'Do not remind me again for this analysis',
        stop_leave: '(No data is collected between {0} and {1}.)'
    },
    certificate: {
        title: 'Web Server Certificates',
        webNotice: 'A web server certificate is used for the web browser to communicate with the web \
         server where the Kunpeng Hyper Tuner \
        is located.',
        name: 'Certificate Name',
        validTime: 'Certificate Expiration Time',
        status: 'Status',
        close: 'Close',
        valid: 'Valid',
        nearFailure: 'About to expire',
        failure: 'Expired',
        notice: 'Information',
        warnNotice: 'Your web server certificate is about to expire or has expired.',
        country: 'Country',
        province: 'Province',
        city: 'City',
        organization: 'Company',
        department: 'Department',
        commonName: 'Common Name',
        csrFile: 'Certificate File',
        createCsr: 'Generate CSR File\xa0',
        leadCsr: '\xa0Import Certificate',
        more: '\xa0More',
        noData: 'No Data',
        resetServer: 'Restart Server',
        changeCipher: 'Update Working Key',
        lead: 'Import',
        operate: 'Operation',
        country_Verification_Tips: 'Enter a two-character country code.',
        province_Verification_Tips: '{0} is invalid. It can contain a maximum of 128 characters, \
         including only letters, digits, underscores (_), hyphens (-), periods (.), and spaces. ',
        city_Verification_Tips: '{0} is invalid. It can contain a maximum of 128 characters, including only \
         letters, digits, underscores (_), hyphens (-), periods (.), and spaces. ',
        organization_Verification_Tips: '{0} is invalid. It can contain a maximum of 64 characters, including \
         only letters, digits, underscores (_), hyphens (-), periods (.), and spaces. ',
        department_Verification_Tips: '{0} is invalid. It can contain a maximum of 64 characters, including only \
         letters, digits, underscores (_), hyphens (-), periods (.), and spaces. ',
        commonName_Verification_Tips: '{0} is invalid. It can contain a maximum of 64 characters, including only \
         letters, digits, underscores (_), hyphens (-), periods (.), and spaces. ',
        common_term_webcert_import_success: 'Certificate imported successfully , Take effect after service restart',
        common_term_webcert_restart_tip: 'The restart takes about 5 to 10 seconds. After the restart, \
         you can perform operations normally.',
        webWarnNotice1: 'Your web server certificate has expired. Please replace the certificate.',
        webWarnNotice2: 'Your web server certificate is about to expire on ${time}. Please replace the \
         certificate in time.',
        common_term_webcert_import_tip: 'Make sure that the imported certificate file is generated by the \
         latest CSR file',
        common_term_webcert_import_pre_tip: 'Do not generate a new CSR file before importing the web \
         server certificate.',
    },
    profileNodataTip: {
        fileIo: 'The system fails to collect file I/O data for a long time. The possible causes are as follows: \
         1. The threshold is too low. 2. No file I/Os occur.',
        socketIo: 'The system fails to collect Socket I/O data for a long time. The possible causes are \
         as follows: 1. The threshold is too low. 2. No Socket I/Os occur.',
        jdbc: 'The system fails to collect JDBC data for a long time. The possible causes are as follows: \
         1. The threshold is too high. 2. The operation statements in this database are not executed.',
        jdbcpool: 'The system fails to collect JDBC connection pool data for a long time. The possible causes \
         are as follows: 1. The threshold is too high. 2. The JDBC connection pool is not used.',
        mongodb: 'The system fails to collect MongoDB data for a long time. The possible causes are as follows: \
         1. The threshold is too high. 2. The operation statements in this database are not executed.',
        cassandra: 'The system fails to collect Cassandra data for a long time. The possible causes are as follows: \
         1. The threshold is too high. 2. The operation statements in this database are not executed.',
        hbase: 'The system fails to collect HBase data for a long time. The possible causes are as follows: \
         1. The threshold is too high. 2. The operation statements in this database are not executed.',
        http: 'The system fails to collect HTTP request data for a long time. The possible causes are as follows: \
         1. The threshold is too high. 2. No HTTP requests are triggered.'
    },
    webSocket_connect_error: 'WebSocket connection failed. Possible causes: 1. The user network proxy is incorrectly \
     configured. 2. The network is unstable. Please try again.',
    langTipEn: 'The current recording language is English. You are advised to switch the environment language.',
    langTipCh: 'The current recording language is Chinese. You are advised to switch the environment language.',
    offlineRecode: {
        heapdump: {
            reportName: 'Data Name',
            importNameCreated: 'Created Time',
            importNameImported: 'Imported Time',
            type: 'Category',
            processName: 'Process Name',
            processId: 'Process ID',
            processParameters: 'Process parameters',
            processRemarks: 'Remarks',
            selfCollection: 'Self Collection',
            import: 'Import'
        }
    }
};
