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
    plugins_perf_javaperfsetting: {
        runLog: 'Run Logs',
        runLogLeve: 'Run Log Level',
        logModify: ' Modify',
        logConfirm: 'Ok',
        logCancel: 'Cancel',
        logDownLoad: 'Download',
        operaLog: 'Operation Logs',
        guardianManage: 'Guardian Management',
        samplingReportManage: 'Threshold Configuration',
        javaRunLogName: 'Java Profiler Run Log',
        logFileName: ' Log File Name',
        logOpera: 'Operation',
        common_term_log_user: 'User Name',
        common_term_log_event: 'Event',
        common_term_log_result: 'Result',
        common_term_log_ip: 'IP Address',
        common_term_log_time: 'Time',
        common_term_log_Detail: 'Details',
        javaRunLog: 'tuningKit-java-perf',
        optimize_log: 'Java Profiler Logs',
        runLogModifySuc: 'The run log level is changed successfully.',
        plugins_perf_runlog_tip_modifySame: 'The new value is the same as the original one.',
        javaOperaLog: 'log',
        runLogTip: 'The log level indicates the severity of the log information. <br/>\
            DEBUG: debugging information for fault locating.<br/>\
            INFO: key information about the normal running of the service. <br/>\
            WARNING: events about the system in unexpected status that does not affect the running of the system. <br/>\
            ERROR: errors that do not affect the application running.',
        secretKey: 'Internal Communication Certificates'
    },
    plugins_javaperf_title_cfg: 'Java Profiler Settings',
    plugins_javaperf_tip_delThreaadTip: 'Are you sure you want to delete the thread dump? \
     Exercise caution when performing this operation.',
    plugins_javaperf_tip_delThreaad: 'Delete Thread Dump',
    plugins_javaperf_button_clear_all: 'All',
    plugins_javaperf_button_clear_one: ' Current Page',
    plugins_javaperf_button_clear: 'Clear Data',
    plugins_javaperf_button_cancel: 'Cancel',
    plugins_javaperf_button_confirm: 'OK',
    plugins_javaperf_tip_delAll: 'Clear All Data ',
    plugins_javaperf_tip_delAllTip: 'Are you sure you want to clear all data? Exercise caution \
     when performing this operation.',
    plugins_javaperf_tip_delOne: 'Clear Current {0} Data',
    plugins_javaperf_tip_delOneTip: 'Are you sure you want to clear the {0} data? Exercise caution \
     when performing this operation.',
    common_term_back: 'Home',
    common_term_link_doc: 'View Java Profiler User Guide.',
    common_term_link_news: 'Visit the Kunpeng community to keep yourself updated with the latest information.',
    common_term_link_expert: 'Any questions? Find answers in the Kunpeng Forum.',
    common_term_pro_name: 'Java Profiler',
    common_term_welcome_tip:
        'Collects and analyzes the JVM GC, heap, thread, and method data, and provides performance \
         tuning of Java applications.',
    common_term_welcometo: 'Welcome',
    common_term_loading: 'Loading',
    common_term_max_length_tip: 'Enter a maximum of {0} characters.',
    common_term_login_name: 'User Name',
    common_term_login_password: 'Password',
    common_term_login_btn: 'Log In',
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

    common_term_create_user: 'Create User',
    common_term_system_config: 'System Configuration',
    common_term_dictionary: 'Weak Password Dictionary',
    common_term_system_help: 'Help',
    common_term_logout: 'Log Out',
    common_term_statement: 'Disclaimer',
    common_term_agree: 'Agree',
    common_term_Signed: 'Signed',
    common_term_read: 'I have read the disclaimer',
    common_term_logout_notice: 'Are you sure you want to exit Hyper Tuner?',
    common_term_about: 'About',
    common_term_backSetting: 'Back',
    common_term_log: 'Log',
    common_term_log_manage: 'Log Management',
    common_term_certificate: 'Certificate',
    common_term_java_certificate: 'Internal Communication Certificates',
    common_term_work_key: 'Working Key',
    common_term_return_home: 'Back to Home',
    common_term_timeout: 'Login timed out. Please try again.',
    newHeader: {
        nullNotice: 'The value cannot be empty. ',
        errNotice: 'Enter a valid integer.',
        plugins_java_tip_onlyDigits: 'Only a positive integer is allowed.',
        setting: {
            shareSetting: 'Common Settings',
            javaSetting: 'Java Profiler Settings',
            maxusers: 'Maximum Number of Online Common Users',
            overTime: 'Session Timeout Period (10 min~240 min)',
            webCert: 'Web Service Certificate Expiration Alarm Threshold (7 days~180 days)',
            operateOutTime: 'Operation Log Retention Period (days)',
            runLogLevel: 'Run Log Level',
            modeify: 'Change',
            userRunLogLevel: 'Run Log Level',
            javaCertificate: 'Internal Communication Certificate Expiration Alarm Threshold (7 days~180 days)',
            userRunLogTip: 'The log level indicates the severity of the log information. \
             <br/>DEBUG: debugging information for fault locating. \<br/>INFO: key information \
              about the normal running of the service. \
            <br/>WARN: events about the system in unexpected status that does not affect the running of the system. \
            <br/>ERROR: errors that do not affect the application running. \
             <br/>CRITICAL: errors that may cause system breakdown.',
            runLogTip: 'The log level indicates the severity of the log information. <br/>DEBUG: \
            debugging information for fault locating. <br/>INFO: key information about the normal \
             running of the service. \
            <br/>WARN: events about the system in unexpected status that does not affect the running of the system. \
            <br/>ERROR: errors that do not affect the application running.',
            stackDepth: 'Stack Depth',
            stackAdmin: 'The stack depth is {0}. You can choose Java Profiler Settings and change it.',
            stackUser: 'The stack depth is {0}. If you need to change the stack depth, contact the administrator.'
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
            name_rule: 'The user name contains 6–32 characters, including letters, digits, hyphens (-), \
             and underscores(_), and must start with a letter.',
            task_name_rule: 'The task name is a string of 6 to 32 characters, allowing letters, digits, periods (.), \
            and underscores (_). It must start with a letter.',
            oldPwd_rule: 'Please enter the password.',
            pwd_rule: 'The password must contain at least two types of the following characters: uppercase letters, \
            lowercase letters, digits, and special characters (`~!@#$%^&*()-_=+\\|[{}];:\'",<.>/?). \
            The length ranges from 8 to 32 characters.',
            pwd_rule2: 'Cannot be the same as the user name or the user name in reverse order.',
            pwd_rule3: 'The new password cannot be the old password in reverse order. \
             It must contain 8 to 32 characters and at least two types of the following \
              characters: uppercase letters, lowercase letters, digits, \
            and special characters (`~!@#$%^&*()-_=+\\|[{}];:\'",<.>/?).',
            pwd_conf: 'The two passwords do not match.',
            req: 'This field cannot be left blank.',
            function_name_tule: 'The function name cannot be an asterisk (*).',
            overRange: 'Enter a valid integer.',
        },
        threshold: {
            tip1: 'Sampling Warning Threshold (1-20)',
            tip2: 'Maximum Sampling Threshold (1-20)',
            tips: 'Sampling Warning Threshold',
            tips_content: 'When the number of samples is greater than or equal to the value of this parameter, \
             a message is displayed, indicating that the number of samples is large and some samples need to \
              be deleted.',
            warnTip: 'The number of sampling analysis records has reached the warning threshold ({0}/{1}). \
             Delete some records. ',
            warn: 'Maximum Sampling Threshold',
            warn_content: 'When the number of sampled files reaches the value of this parameter, \
             a message is displayed, indicating that the number of sampled files has reached the upper limit. \
              Delete some files. Otherwise, new sampling analysis tasks cannot be added.',
            fullTip: 'The number of sampling analysis records has reached the limit ({0}/{1}). Delete some records.',
            count: 'Maximum Reports Threshold cannot be less than Warning Threshold.',
            samplingAnalysis: 'Sampling Analysis',
            histReportHints: 'Data List-Heap Dump ({0}-{1})',
            histReportMax: 'Maximum Historical Threshold ({0}-{1})',
            heapDumpThreshold: 'Data List-Heap Dump',
            heapDump: {
                histReportHintsText: 'When the number of heap dump files is greater than or equal to the threshold, \
                 a message is displayed, indicating that the number of current files is large and some files need to \
                  be deleted.',
                histReportMaxText: 'When the number of heap dump files reaches this parameter, a message \
                 is displayed, indicating that the number of current files has reached the upper limit. \
                  Delete some files. Otherwise, new heap dump files cannot be added.',
                importReportSize: 'Imported Data Size Threshold (MiB) {0}-{1}',
                importReportSizeText: 'When the size of the heap dump file to be imported exceeds this value, \
                 a message is displayed, indicating that the import fails, and the size needs to be adjusted.',
                countTip: 'Maximum Threshold cannot be less than Warning Threshold.'
            },
            threadDumpThreshold: 'Data List - Thread Dump',
            threadDump: {
                histReportHintsText: 'When the number of thread dump files is greater than or equal to \
                 the value of this parameter,a message is displayed, indicating that the number of current \
                  files is large and some files need to be deleted. ',
                histReportMaxText: 'When the number of thread dump files reaches the value of this parameter, \
                 a message is displayed, indicating that the number of current files reaches the upper limit, \
                  delete some files. Otherwise, new thread dump files cannot be added.',
                countTip: 'Maximum Reports Threshold cannot be less than Warning Threshold.'
            },
            gclogThreshold: 'Data List - GC Logs',
            gclog: {
                histReportHintsText: 'When the number of GC logs is greater than or equal to the value of \
                 this parameter, a message is displayed, indicating that the number of current files is large, \
                  and some files need to be deleted. ', histReportMaxText: 'When the number of GC logs reaches \
                   the value of this parameter, a message is displayed, indicating that the number of current \
                    files has reached the upper limit, delete some GC log files. Otherwise, GC log files cannot \
                    be added.',
                countTip: 'Maximum Reports Threshold cannot be less than Warning Threshold.'
            },
        }
    },

    common_term_user_label: {
        name: 'Name',
        role: 'Role',
        workspace: 'Workspace',
        password: 'Password',
        confirmPwd: 'Confirm Password',
        adminPwd: 'Admin Password',
        oldPwd: 'Old Password',
        newPwd: 'New Password',
        changePwd: 'Change Initial Password',
    },

    common_term_user_all: 'All',
    common_term_no_records: 'No record',
    common_term_recording: 'Recording',
    common_term_finished: 'Finish',
    common_term_failure: 'Failed',
    common_term_max_limit_records:
        '<em>Note: </em>The number of sampling records is about to reach the upper limit. Please delete some records. ',
    common_term_jdbc_times: ' Times',
    common_term_profiling: 'Profiling Analysis',
    common_term_file_IO_profiling: 'Analyzing file I/O...',
    common_term_socket_IO_profiling: 'Analyzing socket I/O...',
    common_term_profiling_tip:
        'Click Profiling Analysis to analyze the process. The analysis obviously decreases \
         the performance of the process.',
    common_term_profiling_tip_disabled: 'This process is performing a {0} by the current or \
     another user. Try again after finishing this analysis task.',
    common_term_other_guardian_opt_disabled_tip: '\{{0}\} is in the \{{1}\} state. Analysis is not allowed.',
    common_term_has_profiling_stop_tip:
        'Are you sure you want to stop profiling of the current process?',
    common_term_has_import_profiling_tip: 'Are you sure you want to import the profiling record?',
    common_term_has_import_profiling_content:
        'Importing a profiling record will stop the ongoing profiling process. Exercise caution when \
         performing this operation.',
    common_term_has_import_profiling_type_tip:
        'The format of the imported profiling record file is incorrect. Only JSON files are supported.',
    common_term_has_import_profiling_data_tip: 'The imported profiling record data is incorrect.',
    common_term_has_profiling_stop_content: 'The current online analysis task will be stopped and the analyzed \
        data will be cleared , if a new online analysis task is started',
    common_term_jvm_version_lower_tip:
        'The current JRE version does not support sampling. Use JRE 11 or later.',
    common_term_jvm_version_lower_8_tip:
        'The current JRE version does not support profiling. Use JRE 8 or later.',
    common_term_sampling: 'Sampling Analysis',
    common_term_sample: 'Sampling Records',
    common_term_profile: 'Profiling Records',
    common_term_import: 'Import',
    common_term_export: 'Export',
    common_term_task_noPrimary: 'No host process exists in the current Guardian.',
    common_term_task_noContainer: 'No container process exists in the current Guardian',
    common_term_ensure_root_content: 'The root user has the highest permission. To avoid risks to the system, \
     use a non-root user to deploy the Guardian.',
    common_term_java_primary_process: 'Host Processes',
    common_term_java_container_process: 'Container Processes',
    common_term_uploadList: 'Upload List',
    common_term_upload: 'Uploading...',
    common_term_upload_fail: 'Upload failed',
    common_term_upload_size: 'The size of the file to be uploaded cannot exceed 250 MB.',
    common_term_upload_disk: 'The remaining workspace is insufficient.',
    common_term_add_guardian: 'Add',
    common_term_add_guardian_success: 'Guardian added successfully',
    common_term_edit_guardian: 'Edit Guardian',
    common_term_java_process: 'Java Processes List',
    common_term_java_process_search: 'Enter a process name or ID',
    common_term_ok: 'OK',
    common_term_reset: 'Reset',
    common_term_add_tips: 'Add',
    common_term_modify_tips: 'Modify',
    common_term_delete_tips: 'Delete',
    common_term_guardian_forms: {
        environmentType: 'Environment Type',
        remoteServer: 'Remote Server',
        localServer: 'Local Server',
        name: 'Name：',
        ip: 'Server IP Address：',
        userName: 'User Name：',
        password: 'Password：',
        port: 'port：',
        add_tips:
            'The system will use SSH to access the server where Guardian is to be deployed. Ensure that the server \
             information is correct.',
        edit_tips:
            'This password is used for deploying Guardian only and is not stored in the system.',
    },
    common_term_guardian_container: 'Container environment: ',
    common_term_guardian_physics: 'Physical environment: ',
    common_term_guardian_normal: 'Normal',
    common_term_guardian_disconnected: 'Offline',
    common_term_guardian_restart: ', Restart a Guardian.',
    common_term_guardian_deploying: 'Deploying',
    common_term_guardian_connecting: 'Connecting',
    common_term_guardian_fingerprint_tip: 'The fingerprint is {0}',
    common_term_guardian_fingerprint_content: 'Are you sure you want to add {0}?',
    common_term_guardian_Permission_tip:
        'Analysis of Guardian created by other users is not allowed.',
    common_term_delete_guardian_tip:
        'Are you sure you want to delete {0} ?',
    common_term_delete_guardian_connect_content: 'The current Guardian status is Normal. \
    Deleting the Guardian will stop all the analysis tasks being executed by the Guardian. \
     Are you sure you want to delete {0}? ',
    common_term_delete_guardian_deployed_content:
        'The current Guardian status is Creating. Check whether {0} needs to be deleted.',
    common_term_delete_guardian_disconnect_content: 'The current Guardian status is Offline. \
    Enter the account name and password used for deploying {0} and click OK to delete all files related to {0}. \
    If you click OK without entering the password, you need to manually delete the guardian. ',
    common_term_delete_guardian_disconnect_manually: 'The current Guardian status is Offline. After clicking OK, \
    you need to manually delete the Guardian executable files from the remote server.',
    common_term_new_sampling: 'Add Sampling Analysis',
    common_term_new_sampling_interval_tip: 'The dump interval must be less than or equal to the record duration. ',
    common_term_delete_record_title: 'Are you sure that you want to delete the {0} analysis record?',
    common_term_delete_record_content: 'After you click OK, all history data related to the current \
     analysis record will be deleted. Please exercise caution when performing this operation.',
    common_term_sampling_forms: {
        recordWay: 'Recording Mode',
        planTime: 'Specified duration',
        noPlanTime: 'Unlimited duration',
        recordSec: 'Duration(s)',
        recordNeedTime: 'Duration',
        recordSecTips: 'Sampling analysis takes only the last 5 minutes.',
        stop: 'Manual Stop',
        stopTips: 'If you do not specify the record duration, enable manual stop. After the sampling is \
        \ manually stopped, \
        the system analyzes only the sampling data collected 5 minutes before the sampling is stopped.',
        methodSample: 'Method Sampling',
        javaMethodInterval: 'Java Method Sampling Interval(ms)',
        nativeMethodInterval: 'Native Method Sampling Interval(ms)',
        threadDump: 'Thread Dump',
        threadDumpInterval: 'Dump Interval(1s~300s)',
        recording: 'Sampling…',
        duration: 'Duration：',
        stop_analysis: 'Stop Sampling',
        cancel_analysis: 'Cancel Sampling',
        common_term_recording: 'Sampling:',
        fileIoSample: 'File I/O Sampling ',
        socketIoSample: 'Socket I/O Sampling',
        leakSample: ' Old-Generation Object Sampling',
        leakSampleThred: 'Event Collecting Stack Depth'
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
        suggestions: 'Suggestions',
        dumpSuccess: 'Thread dump created successfully.',
        cpu: 'CPU'
    },
    protalserver_sampling_enviroment: {
        cpu: 'CPU Usage',
        usaged: 'Machine Total',
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
        config: 'GC Configuration',
        young: 'Young-Generation Garbage Collector',
        old: 'Old-Generation Garbage Collector',
        concurrent_thread: 'Concurrent GC Threads',
        parallel_thread: 'Parallel GC Threads',
        concurrent_display: 'Concurrent Execution of System.gc()',
        display_disabled: 'Disable System.gc()',
        use_thread: 'Use Dynamic GC Threads',
        time_ratio: 'GC Time Ratio',
        time_ratio_msgValue: 'Garbage collection time as a percentage of program running time. \
         Formula: 1/(1 + GCTimeRatio).',
    },
    protalserver_sampling_memory_heap: {
        config: 'Heap Configuration',
        initial: 'Initial Heap Size',
        min_size: 'Min. Heap Size',
        max_size: 'Max. Heap Size',
        isuse: 'Use Compressed Oops',
        isuse_msgValue: 'Whether compressed oops (object reference is represented as \
             32-bit offset instead of 64-bit pointer) \
        are used to optimize 64-bit performance.',
        compressed: 'Compressed Oops Mode',
        compressed_msgValue: 'Compressed oop mode.',
        address_size: 'Heap Address Size',
        objects_alignment: 'Object Alignment',
        objects_alignment_msgValue: 'Memory alignment mode (in bytes) for Java objects. The default value is 8 bytes.'
    },
    protalserver_sampling_memory_generation: {
        config: 'Young Generation Configuration',
        min_size: 'Min. Young Generation Size',
        max_size: 'Max. Young Generation Size',
        new_ratio: 'New Ratio',
        initial_lifttime: 'Initial Tenuring Threshold',
        initial_lifttime_msgValue: 'Initial number of times that a young-generation object can \
         be copied before it is tenured.',
        max_lifttime: 'Max. Tenuring Threshold',
        max_lifttime_msgValue: 'Maximum number of times that a young-generation object can be copied \
         before it is tenured.',
        used: 'Use TLAB',
        used_msgValue: 'Whether the thread local allocation buffer is used.',
        min_tlab_size: 'Min. TLAB Size',
        min_tlab_size_msgValue: 'Minimum TLAB size.',
        waste_limit: 'TLAB Refill Waste Limit',
        waste_limit_msgValue: 'Max TLAB waste at a refill. If the requested memory is greater than \
         the value specified, memory will be allocated from the heap. Otherwise, a new TLAB will be \
          created to allocate memory.',
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
        longest_pause: 'Max. Pause Duration (ms)',
        before_memory: 'Memory Before GC',
        after_memory: 'Memory After GC',
    },
    protalserver_sampling_memory_pause: {
        label: 'Pause Phase',
        pause_phase: 'Event Type',
        name: 'Name',
        duration: 'Duration (µs)',
        start: 'Start Time',
    },
    protalserver_sampling_lock_monitor_title: 'Monitor',
    protalserver_sampling_lock_monitor: {
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
            stack_size: 'Stack Trace'
        },
        sugget: 'Tuning Suggestions',
        tabMark: ':',
        suggetNumber: 'You have {0} tuning suggestion.',
        suggetNumbers: 'You have {0} tuning suggestions.',
        btnIcon: '{0} suggestion is generated. Click to',
        btnIcons: '{0} suggestions are generated. Click to ',
        look: 'view the suggestions',
        noSugget: 'No suggestion for the current analysis.',
        phenomenon: 'Phenomenon',
        viewDetail:'View Details'
    },
    protalserver_sampling_object_class: {
        label: 'Classes',
        name: 'Class',
        max_count: 'Max. Real Time Count',
        max_size: 'Max. Real Time Size',
        total_allocation: 'Memory Allocated',
    },
    protalserver_sampling_object_memory: 'Memory Allocation',
    protalserver_sampling_object_stackTrance: 'Stack Trace',
    protalserver_profiling_stop_analysis: 'Stop Analysis',
    protalserver_profiling_tab: {
        overview: 'Overview',
        thread: 'Threads',
        memory: 'Java Heaps',
        memoryDump: 'Memory',
        hot: 'Hotspot',
        snapshot: 'Snapshot',
        jdbc: 'JDBC',
        jdbcpool: 'JDBC Connection Pool',
        database: 'Database',
        mongodb: 'MongoDB',
        cassandra: 'Cassandra',
        hbase: 'HBase',
        httpRequest: 'HTTP Requests',
        io: 'IO',
        fileIo: 'File IO',
        socketIo: 'Socket IO',
        springBoot: 'Spring Boot',
        gc: 'GC',
        cpu: 'CPU',
        web: 'Web',
        gcAnalysis: 'GC Analysis',
        gcLog: 'GC Logs',
        exportHotLimit: 'Hot data cannot be exported.',
        exportLimit: 'Memory dump data cannot be exported.',
        exportGClogLimit: 'GC log data cannot be exported.',
        exportThreadLimit: 'Thread dump data cannot be exported.',
        exportDisabledTip: 'Grayed-out tabs cannot be exported. You can open the tab separately \
         and save data if necessary.',
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
        dumpContent: 'Analyzing the heap dump file ... The file size is {0}. It will take {1} to {2} seconds.',
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
        PercentageTip: 'Percentage of the retained heap for the instance to the total heap',
        startTip: 'A heap dump is a snapshot of all the objects that are in memory in the JVM at a certain moment.',
        histogram: {
            shortCommonRoute: 'Shortest Common Path from GC Roots to Objects',
            allObject: 'List All Objects of the Class',
            common_term_back: 'Back',
            shortCommonRouteLeft: 'Shortest Common Path from GC Roots to (',
            shortCommonRouteRight: 'Instance)',
            choiceExtend: 'Select Extended Information',
            allObjectLeft: 'List All Objects of (',
            allObjectRight: ')',
            objectWithGcRootsRoute: 'Path from Object to GC Roots',
            objectWithGcRootsRouteLeft: 'Path from (',
            objectWithGcRootsRouteRight: ') to GC Roots',
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
        searchBox: {
            mutlInfo: 'Enter the keyword.',
            info: 'Enter the {0} to be searched.'
        },
        savedReportSucess: 'Data saved. View it in the Data List on the left. '
    },
    plugins_common_report: {
        saved_report: 'Save',
        display_tip: 'View the saved data in the Data List-{0} on the left.',
        common_term_report_name_tip: 'The data name can only contain letters, digits, \
        spaces, and special characters .+-()_. The length ranges from 6 to 128 characters. \
         It must start with an English letter.',
        type: 'Data Type',
        memory_dump: 'Heap Dump',
        thread_dump: 'Thread Dump',
        gclog: 'GC Logs',
        heapdumpReport: 'Heap Dump',
        threaddumpReport: 'Thread Dump',
        gclogReport: 'GC Logs',
        name: 'Data Name',
        input_name_placehloder: 'Enter a data name.',
        remark: 'Remarks',
        input_remark_placehloder: 'Enter remarks.',
        report_info: 'Data Info',
        creat_time: 'Created Time',
        import_time: 'Import Time',
        categorization: 'Category',
        process_name: 'Process Name',
        process_id: 'PID',
        process_param: 'Progress Parameter',
        self_collection: 'Self-collection',
        import: 'Import',
        heapdump_tips_content: 'The number of saved data records has reached the upper limit ({0}/{1}). \
         Delete some data. ',
        saveTDReportSizeTip: 'The number of thread dump records has reached the upper limit. Delete some records.',
        saveThreadDump: {
            saveReport: 'Save',
            saveReportTip: 'View the saved data in the Data List-{0} on the left. ',
            saveReportTip1: 'If multiple thread dumps are saved for the same online analysis, only one record is generated.',
            saveReportSizeTip: 'The number of heap dump records has reached the upper limit. Delete some records.',
            saveTDReportSizeTip: 'The number of thread dump records has reached the upper limit. Delete some records.',
            reportType: 'Data Type',
            threadDump: 'Thread Dump',
            saveRecord: 'Save Records',
            saveRecordHolder: 'Please select a record to save.',
            reportName: 'Data Name',
            reportNameHolder: 'Enter a data name.',
            reportRemarks: 'Remarks',
            successSaveReportTip: 'Data saved. You can view it in Saved Reports on the left.'
        },
    },
    protalserver_profiling_snapshot: {

    },
    plugins_perf_java_profiling_spring_boot: {
        tabs: {
            health: 'App Health Status',
            beans: 'Bean Component Info',
            metrics: 'Metrics Change',
            http_traces: 'Hotspot HTTP Traces',
        },
        init_nodata: 'No data. Please analyze Spring Boot first.',
        protalserver_profiling_springBoot_login: {
            login: 'Log in to Spring Boot',
            springBootName: 'Enter the Spring Boot user name.',
            password: 'Enter the password',
            savePpassword: '（Used only to verify the current session and is not saved）',
        },
        login_form: {
            title1: 'Log in to Spring Boot',
            placeholder_username: 'Enter the Spring Boot user name',
            label_password_suffix: '(Used only to verify the current session and is not saved)',
            placeholder_password: 'Enter the password',
            login_failed: 'Incorrect user name or password. Please re-enter.'
        },
        start_button: {
            start_analysis: 'Start Analysis',
            stop_analysis: 'Stop Analysis',
            help: 'Start or stop the analysis of the Spring Boot access operations.'
        },
        threshold: {
            tip: 'The value ranges from 0 to 10,000. The system analyzes only the HTTP traces whose \
                execution duration exceeds the threshold.',
            label: 'Threshold(ms)',
        },
        health: {
            instance: 'Instance',
            disk: 'Drive Space',
            diskTotal: 'Total',
            diskFree: 'Available',
            diskThreshold: 'Threshold',
            version: 'Version',
        },
        beans: {
            resource: 'Source',
            dependence: 'Dependency',
        },
        metrics: {
            metricsTitle1: 'tomcat.sessions(Session Count)',
            metricsTitle2: 'jvm.buffer(Current Session Value)',
            metricsTitle3: 'jvm.buffer(Buffer Count)',
            metricsTitle4: 'jvm.buffer(MB)',
            metricsTitle5: 'logback.events.level(Event Count)',
        },
        http_traces: {
            filter_input: {
                placeholder: 'Path',
                button: 'Filter',
                tip: 'Only the content in the specified path is obtained for analysis.'
            },
            legend: {
                status2: 'Status code 2xx',
                status4: 'Status code 4xx',
                status5: 'Status code 5xx',
            },
            tooltip: {
                requestCount: 'Total requests',
                maxTime: 'Maximum duration',
                lastedTime: 'Current duration',
            },
            table: {
                timestamp: 'Timestamp',
                session: 'Session ID',
                method: 'Method',
                url: 'Path',
                status: 'Status',
                content: 'Content-Type',
                timeTaken: 'Time Used (ms)'
            },
            select_time: {
                filterTime: 'Filter time range',
                from: 'From',
                to: 'To',
            }
        },
        notSpringBootProcess: 'This process is not a Spring Boot process and cannot be analyzed.'
    },
    protalserver_profiling_overview: {
        heap: 'Heap Memory',
        nonHeap: 'Non-heap Memory',
        physicalMemory: 'Physical Memory',
        gc_activety: 'GC Activity',
        class: 'Class',
        thread: 'Thread',
        cpu_load: 'CPU Load',

        heapUsedSize: 'Used heap memory',
        heapCommittedSize: 'Committed heap memory',
        nonHeapUsedSize: 'Used non-heap memory',
        nonHeapCommittedSize: 'Committed non-heap memory',

        systemFreePhysicalMemorySize: 'Free system memory',
        processPhysicalMemoryUsedSize: 'Memory used by Java process',
        gc_tip: 'Pause Time',
        class_tip: 'Loaded Classes',
        thread_tip1: 'Running Threads',
        thread_tip2: 'Waiting Threads',
        thread_tip3: 'Blocked Threads',
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
        raw: 'Raw data',
        dumpbtn: 'Dump',
        dumptips:
            'A snapshot of all the threads  running at a specific time of the JVM.',
        graphbtn: 'Generate',
        graphtips: '',
        selector: {
            label: 'Display Mode',
            placeholder: '-Select-',
            options: {
                various: 'multiple states',
                runnable: 'RUNNABLE state',
                waiting: 'WAITING state',
                blocked: 'BLOCKED state'
            }
        }
    },
    protalserver_profiling_memory: {
        histogram: 'Object Allocation',
        btn: 'Refresh Data',
        name: 'Class',
        instance: 'Instance',
        size: 'Memory Used (KB)',
        memory: 'Heaps',
        free_size: 'Used',
        commit_size: 'Committed',
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
        table_name: 'Table Name'
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
        stack_no_data: 'No data. Click the monitor above to view the stack tracing information.',
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
            per: 'GC Time'
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
            afterGC: 'After GC',
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
        total: 'total',
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
        forHelp: 'Consult the help'
    },
    protalserver_profiling_http_threshold: 'Threshold(ms)',
    protalserver_profiling_http_threshold_tip: 'The value ranges from 0 to 10,000. The system analyzes only \
        the operations whose execution duration exceeds the threshold.',
    common_term_operate: 'Operation',
    common_term_operate_del: 'Delete',
    common_term_operate_reset: 'Edit',
    common_term_operate_ok: 'OK',
    common_term_operate_cancel: 'Cancel',
    common_term_operate_close: 'Close',
    common_term_delete_content:
        'After the project is deleted, the historical data of this project will be deleted. \
        Exercise caution when performing this operation. ',
    common_term_delete_title: 'Are you sure you want to delete this project?',
    common_term_log_user: 'User Name',
    common_term_log_ip: 'IP Address',
    common_term_log_event: 'Event',
    common_term_log_result: 'Result',
    common_term_log_time: 'Time',
    common_term_log_Detail: 'Details',
    common_term_log_size: 'Size',
    common_term_source_path: 'Source Code Path',
    common_term_operate_add_pro: 'New Project',
    common_term_operate_edit: 'Edit',
    common_term_projiect_name: 'Project Name:',
    common_term_projiect_name_tip: 'The project name is a string of 6 to 32 characters, \
     allowing letters, digits, periods (.), \
    and underscores (_). It must start with a letter.',
    common_term_operate_search: 'Please enter a keyword',
    common_term_projiect_task: '',
    common_term_projiect_task_system: 'System',
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
    common_term_task_nodata: 'No Data',
    common_term_task_empty_data: 'No Data',
    common_term_task_network_interrupt: 'The network connection is interrupted. Please try again later.',
    common_term_task_new_c: 'New C/C++ Program Analysis',
    common_term_task_new_java: 'New Java Program Analysis',
    common_term_task_edit_c: 'Edit C/C++ Program Analysis',
    common_term_task_edit_java: 'Edit Java Program Analysis',
    common_term_task_start_now: 'Start Now',
    common_term_task_type_launch: 'When a collection task is started and the application is started, \
     the collection duration is controlled by the execution time of the application. This mode is \
      applicable to applications that run for short time.',
    common_term_task_type_attach: 'When a collection task is started and the application is running, \
     the collection duration is controlled by configuration parameters. This mode is applicable to \
      applications that run for short time.',
    common_term_task_type_profile: 'The running applications in the system can be ignored when \
     collecting the data of the entire system. The collection duration is controlled by \
      configuration parameters. This mode applies to scenarios where multiple services are running \
    and there are subprocesses.',
    common_term_admin_user: 'User Management',
    common_term_admin_log: 'Operation Logs',
    common_term_admin_run_log: 'Run Logs',
    run_log: {
        admin_manager_log: 'User management run log',
        java_run_log: 'Java Profiler Run Log'
    },
    common_term_log_download: 'Are you sure you want to download the following run logs?',
    common_term_log_detail: 'Log',
    common_term_admin_public_log: 'Common Logs',
    common_term_admin_optimize_log: 'Java Profiler Logs',

    common_term_admin_download_log: 'Download',
    common_term_admin_downLoad: 'Download',
    common_term_admin_log_fileName: 'Log File Name',
    common_term_admin_log_level: 'Log Level',
    common_term_admin_log_adit:
        'Are you sure you want to change the current log level?',
    common_term_admin_manager_name: 'Administrator：',
    common_term_admin_log_password_tip:
        'Incorrect password. Enter the correct password.',
    common_term_admin_change_pwd: 'Reset Password',
    common_term_admin_log_out: 'Log Out',
    common_term_admin_user_normal: 'User',
    common_term_admin_user_guest: 'Guest',
    common_term_admin_user_crate: 'Create User',
    common_term_admin_user_edit_user: 'Edit User',
    common_term_admin_user_name: 'Name',
    common_term_admin_user_role: 'Role',
    common_term_admin_user_edit: 'Edit',
    common_term_admin_user_delete_title: 'Are you sure you want to delete?',
    common_term_admin_user_delete_detail:
        'After the deletion, all historical data related to the user will be deleted. \
         Exercise caution when performing this operation.',
    common_term_delete_content_analysis:
        'After the task is deleted, all historical data of this task will be deleted. \
         Exercise caution when performing this operation. ',
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
        task_disk_error: 'Insufficient drive space.',
        task_stop_error: 'Failed to stop the task.',
        task_del_error: 'Failed to delete the task.',
        total_results_error: 'Failed to obtain the overall statistics.',
        plat_form_error:
            'Failed to obtain the platform and collection information.',
        top_function_error: 'Failed to obtain the top hotspot function.',
        log_timeout: 'Logged out or timed out.',
        log_ok: 'Login successful.',
        logged_in: 'user logged in elsewhere.',
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
         for example, /symbol,the subdirectory of the directory must be the same as the absolute path \
          of the target application. \
        For example, if the application to be analyzed is in the /home directory, \
        the source file must be saved in the /symbol/home directory.',
        common_term_task_crate_c_source_tip: 'If the C/C++ source file is stored in another directory, \
         for example, /Source, \
        the subdirectory of the directory must be the same as the absolute path of the target application. \
        For example, if the application to be analyzed is in the /home directory, \
        the source file must be saved in the /Source/home directory.',
        common_term_task_crate_j_source_tip: 'If the Java source file is stored in another directory, \
         for example, /Source,\
         the subdirectory of the directory must be the same as the absolute path of the target application. \
         For example, if the application to be analyzed is in the /home directory, \
         the source file must be saved in the /Source/home directory.',
    },
    validata: {
        guardian_name_rule:
            'The value must start with a letter and contain 6 to 32 characters, including letters, digits, \
             dots (.), and underscores (_).',
        name_rule:
            'The user name contains 6–32 characters, including letters, digits, hyphens (-), and underscores(_), \
            and must start with a letter.',
        task_name_rule: 'The task name is a string of 6 to 32 characters, allowing letters, digits, \
         periods (.), and underscores (_). \
        It must start with a letter.',
        pwd_rule: `The password must contain at least two types of the following characters: uppercase letters, \
        lowercase letters, digits, and special characters (\`~!@#$%^&*()-_=+|[{}];: \' \\\",<>/?). \
        The length ranges from 8 to 32 characters.`,
        pwd_conf: 'The two passwords do not match.',
        req: 'This field cannot be left blank.',
        report_name_rule: 'The data name can only contain letters, digits, spaces, and special characters .+-()_. \
            The length ranges from 6 to 128 characters. It must start with an English letter.',
    },

    error_inertval: 'Internal server error.',
    webSocket_connect_error: 'Failed to set up a WebSocket connection. Possible causes: \
     1. The network proxy is incorrect. 2. The network \
     is unstable. 3. The root certificate is not installed.',
    bad_request: 'Bad request.',
    first_login:
        'Login successful. For security purposes, change the initial password upon your first login.',
    pwd_guoqi:
        'The password has expired. For ensure  account security, change your password in time.',
    login_error:
        'The user name or password is incorrect. You can try more times.',
    login_lock: 'Account locked. Try again 10 minutes later.',
    login_10:
        'The number of sessions of the current user has reached the upper limit (10). Try again later.',
    reset_pwd_ok:
        'Password changed successfully. Please log in using the new password.',
    logout_ok: 'You have logged out of the system.',
    logout_error: 'System error.',
    selectPlace: '-Select-',
    loading: 'LOADING...',
    functiondetail_no_get_data: 'No data returned.',
    function_error: 'Failed to obtain function information.',
    secret_title: 'Are you sure you want to create the analysis task?',
    secret_count: 'Your software running data will be collected and associated with the \
    source code for performance analysis and tuning. The collection will not affect software running \
     or retain your source code.',
    system_busy: 'The system is busy, please try again later.',
    application_not_exist: 'This application does not exist.',
    application_not_access: 'No access permission.',
    cpu_mask_range: 'Enter a value from 0 to ',
    cpu_mask_format: 'Incorrect format. For example, 2,3,4-5.',
    invalid_directory: 'Invalid directory.',
    invalid_directory_common: 'Invalid directory.',
    pid_not_exist: 'The PID or TID does not exist.',
    task_name: 'Task name',
    invalid_application_permisson:
        'No access permission.',
    invalid_directory_permisson:
        'No access permission.',
    add_guardian_ssh_tip:
        'The system will use SSH to access the server where Guardian is to be deployed. \
         Ensure that the server information is correct.',
    add_guardian_password_tip:
        'This password is used for deploying Guardian only and is not stored in the system.',
    aboutMsg: {
        about: 'About',
        name: 'Kunpeng Hyper Tuner Plugin',
        version: 'Version: v2.2.5',
        time: 'Release Date: 2020.12.30',
        copyRight: 'Copyright © Huawei Technologies Co., Ltd. 2021. All rights reserved.',
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
        sample_opt_tip: 'Insufficient work space. Free up some space.',
        sample_opt_tip_disk: 'The remaining drive space is insufficient. Release the drive space.',
    },
    progress_close_btn_tip: 'The analysis is still in progress after the window is closed',
    io: {
        beginFileIo: 'Start Analysis',
        endFileIo: 'Stop Analysis',
        threshold: 'Threshold(KiB/s)',
        thresholdMs: 'Threshold(KiB/s)',
        btn_tip_file: 'Starts or stops File IO access operation analysis.',
        fileIoTip: 'The value ranges from 1 to 10,485,760. The system analyzes only the file I/Os \
         within the threshold.',
        btn_tip_socket: 'Starts or stops Socket IO access operation analysis.',
        socketIoTip: 'The value ranges from 1 to 10,485,760. The system analyzes only the \
         socket I/Os within the threshold.',
        sfileIoTip: 'The value ranges from 1 to 1000. The system captures only the file I/Os \
         that exceed the threshold for analysis.',
        ssocketIoTip: 'The value ranges from 1 to 1000. The system captures only the socket I/Os \
         that exceed the threshold for analysis.',
        fileIo: {
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
            operateType: 'Operation Type',
            operateTime: 'Operation Time',
            rAndWBytes: 'Read and Written Bytes',
            duration: 'Time Used',
            readRate: 'Read speed',
            writeRate: 'Write speed',
            fileIORate: 'File I/O Read/Write Speed',
            socketIORate: 'Socket I/O Read/Write Speed',
            eventRate: 'Rate',
        }
    },
    jdbcpool: {
        suggestions: 'There are optimization suggestions for current indicators.Click',
        look: 'View Now',
        info: 'to learn more',
        analysisDbPool: 'Also analyze database connection pool',
        begin: 'Start Analysis',
        end: 'Stop Analysis',
        btnTip: 'Starts or stops JDBC Connection Pool access operation analysis.',
        threshold: 'Threshold (ms)',
        thresholdus: 'Threshold (μs)',
        alertThreshold: 'Alarm Threshold（us）',
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
        jdbcpoolConfig: ' Configure Connection Pool Parameters',
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
        pwd_rule: 'The weak password must contain at least two types of the following characters: uppercase letters, \
        lowercase letters, digits, and special characters (`~!@#$%^&*()-_=+\\|[{}];:\'",<.>/?). \
         The length ranges from 8 to 32 characters.',
        addWeakPwd: 'Add Weak Password',
        WeakPwd: 'Weak Password',
        searchWeakPwd: 'Search for weak passwords',
        deleWeakPwd: 'Delete Weak Password',
        confirmdele: 'Are you sure you want to delete the weak password',
        sureDelteWeakPwd: 'Are you sure you want to delete the weak password "{0}" ?',
        tip: 'Weak passwords are easily guessed or cracked. If a password in the weak password dictionary is set, \
        the user will be asked to reset the password forcibly. '
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
        GCCircle: 'GC Memory Size',
    },
    snapshot_analysis_tips: 'You can view the snapshots on the Snapshots tab page. A maximum of five\
     snapshots can be saved for a single analysis type.',
    memorydump_snapshot_analysis_tips: 'You can view the saved snapshots on the Snapshots tab page.\
     A maximum of five snapshots can be saved for an analysis task. Only one snapshot needs to \
      be saved for a heap dump.\
      Multiple snapshots can be saved for multiple heap dumps for snapshot comparison.',
    snapshot_analysis: 'Hotspot Analysis Snapshot',
    snapshot_analysis_content1: ' You can choose ',
    snapshot_analysis_content2: 'Snapshot > Hotspot Analysis Snapshot ',
    snapshot_analysis_content3: 'to view the saved snapshots. A maximum of two snapshots can be saved.',
    snapshot_analysis_alert: 'A maximum of five snapshots can be saved',
    snapshot_success_alert: '快照保存成功',
    snapshot_analysis_overSize: 'The number of snapshots has reached the upper limit. Delete the earlier \
     snapshots and try again.',
    snapshot_analysis_noData: 'Unable to save the snapshot when no data is available for the current analysis type.',
    plugins_pref_java_saved_report_analysis_noData: 'The data cannot be saved if no data is available for \
     the current analysis type.',
    memorydump_snapshot_analysis_alert: ' A maximum of five snapshots can be saved for a single analysis type.',
    memorydump_snapshot_analysis_content1: ' Only one snapshot needs to be saved for a heap dump. Multiple snapshots\
     can be saved for multiple heap dumps for snapshot comparison.',
    jdbcpool_config_title: 'Set the number of level-2 entries',
    jdbcpool_config_top: 'TOP',
    jdbcpool_optimization_title: 'Tuning Suggestions:',
    jdbcpool_txt: 'The minimum number of idle connections is the maximum number of connections. ',
    newLockGraph: {
        obersver: 'Observation',
        obersverTip: 'If it is enabled, the threads and their locks or the locks and \
         their requested threads will be highlighted.',
        compare: 'Comparison',
        compareTip: 'After enabling this mode, you need to select the thread dump to be compared. \
        By default, the comparison result of the threads and their locks are displayed. \
        By using the comparison mode and the observation mode together, \
        you can better observe the status change of the threads and the locks at different time points. \
        You can also select lock to observe the status change of a lock and its requested \
         threads at different time points. ',
        lock: 'Lock',
        thread: 'Thread',
        hasLocked: 'Holding lock',
        requestLocked: 'Requesting lock',
        threadExistDeadLock: 'Deadlocks found: {0}',
        lockLabel: 'id:',
        lockFound: 'Found',
        lockDead: 'Deadlock'
    },
    userGuide: {
        next: 'Next',
        done: 'Done',
        addProject: 'Add Guardian',
        addProjectDes: 'Click the plus (+) icon and set parameters to add a Guardian.',
        configParams: 'Set Guardian Parameters',
        configParamsDes: 'After setting Guardian parameters, click OK.',
        confirmAdd: 'Confirm',
        confirmAddDes: 'Check that the public key fingerprint is correct and click OK. \
        Note: The fingerprint is the SSH public key fingerprint of the server where the Guardian is to be deployed.',
        createTask: 'Create Analysis Task',
        createTaskDes: 'After the Guardian is added, \
        select the Java process to be analyzed in the Java Processes area and click Profiling Analysis.',
        profileAna: 'Profiling Report',
        profileAnaDes: 'Profiling (real-time Java performance analysis) consists of analysis of the target \
         JVM and the Java program. \
        The report includes the JVM internal status, such as heap, GC activities, and thread status, \
        and Java program performance analysis, such as call chain analysis, hotspot functions, lock analysis, \
        program thread status, and object generation and distribution.',
        profileManage: 'Manage Analysis Record',
        profileManageDes: 'Click a record name to view the analysis report. You can also delete, import, \
         and export analysis records.',
        viewWizard: 'View Wizard',
        viewWizardDes: 'The Java Profiler process is complete. You can click Wizard from the menu bar again.',
    },
    plugins_perf_java_profileNoData: {
        threadDumpNodata: ' No data. Perform thread dump first',
        profileSnapshotNodata: 'No snapshot is available. Save the snapshot first.',
        http: 'No data. Start HTTP analysis first',
        http2: 'Analyzing the HTTP request ...',
        fileIo: 'No analysis data is available. Start file I/O analysis first',
        socketIo: 'No analysis data is available. Start the Socket I/O analysis first',
        heapDumpNodata: 'No dump file is available. Perform heap dump first',
        springBoot: 'No analysis data is available. Start Spring Boot analysis first',
        jdbcNoDataMsg: 'No analysis data is available. Start JDBC analysis first',
        jdbcPoolNoDataMsg: 'No analysis data is available. Start the JDBC database connection pool analysis first',
        jdbcPoolNoData: 'No parameter configured. Start JDBC database connection pool analysis first.',
        mongoDBNoDataMsg: 'No analysis data is available. Start MongoDB analysis first',
        cassandraNoDataMsg: 'No analysis data is available. Start Cassandra analysis first',
        hBaseNoDataMsg: 'No analysis data is available. Start HBase analysis first',
        jdbcAnalysisMsg: 'JDBC is analysising, Please wait...',
        jdbcPoolAnalysisMsg: 'The JDBC database connection pool is analysising, Please wait...',
        mongoDBAnalysisMsg: 'MongoDB is analysising, Please wait...',
        cassandraAnalysisMsg: 'Cassandra is analysising, Please wait...',
        hBaseAnalysisMsg: 'HBase is analysising, Please wait...',

    },
    profileMemorydump: {
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
            allObjectRight: '）',
            common_term_back: 'Back',
            allObject: 'List All Objects of the Class',
            choiceExtend: 'Select Extended Information',
        },
        snapShot: {
            allData: 'All',
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
            confirmSnapshot: 'Are you sure you want to delete this snapshot?',
            popStopProfilingAnalysis: 'Stop Online Analysis',
            confirmStopProfilingAnalysis: 'After the analysis is stopped, you can view only \
             the current retained data and some functions will be unavailable. Are you sure \
              you want to continue?',
            stopProfilingAnalysisNoData: 'Analysis has been stopped. The snapshot function is unavailable.',
            snapshotType: 'Snapshot Type',
            firstSnapshot: 'First',
            secondSnapshot: 'Second',
            formulaSnapshot: 'Formula:',
            subtracted: 'Subtract',
            snapshotError: 'Compare Snapshots',
            onlyASnapshot: '(onlyASnapshot)',
            onlyBSnapshot: '(onlyBSnapshot)',
            squareBracketL: '[',
            squareBracketR: ']',
            protalserver_profiling_delSnapshotTip: 'The clear function does not apply to snapshot data.\
            Delete the snapshot in the snapshot list on the left.',
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
                common_unit_kibs: 'KiB/s',
                ownSnapshot: 'Snapshot Type'
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
                AnormalRun: 'A snapshot normal',
                AthresholdAlert: 'A snapshot alarm',
                AthresholdAlert1: 'A snapshot alarm(ms)',
                BnormalRun: 'B snapshot normal',
                BthresholdAlert: 'B snapshot alarm',
                BthresholdAlert1: 'B snapshot alarm(ms)',
                ASnapshotThreshold: 'Snapshot A Threshold(ms)',
                BSnapshotThreshold: 'Snapshot B Threshold(ms)',
            }
        }
    },
    plugins_perf_java_profiling_import_record_name: 'Import',
    plugins_perf_java_guardianManage: 'Guardian Management',
    plugins_perf_java_guardianManage_name: 'Name',
    plugins_perf_java_guardianManage_status: 'Status',
    plugins_perf_java_guardianManage_ip: 'IP',
    plugins_perf_java_guardianManage_port: 'Port',
    plugins_perf_java_guardianManage_owner: 'User',
    plugins_perf_java_guardianManage_oper: 'Operation',
    plugins_perf_java_guardianManage_reconnect: 'Restart',
    plugins_perf_java_guardianManage_delete: 'Delete',
    plugins_perf_java_guardianManage_status_creating: 'Deploying',
    plugins_perf_java_guardianManage_status_connected: 'Online',
    plugins_perf_java_guardianManage_status_disconnected: 'Offline',
    plugins_perf_java_guardianManage_guardianName: 'Guardian Name',
    plugins_perf_java_guardianManage_serverIP: 'Server IP Address',
    plugins_perf_java_guardianManage_delete_type: 'Delete Mode',
    plugins_perf_java_guardianManage_delete_part: 'Partial',
    plugins_perf_java_guardianManage_delete_complete: 'All',
    plugins_perf_java_guardianManage_delete_title: 'Delete {0}',
    plugins_perf_java_guardianManage_delete_tip: 'The current Guardian status is Normal. \
    Deleting the Guardian will stop all the analysis tasks being executed by the Guardian. \
     Are you sure you want to delete {0}? ',
    plugins_perf_java_guardianManage_restart: 'Restart Offline Guardian',
    plugins_perf_java_guardianManage_userName: 'User Name',
    plugins_perf_java_guardianManage_password: 'Password',
    plugins_perf_java_guardianManage_restart_tip: 'This password is used for deploying Guardian \
     only and is not stored in the system.',
    plugins_perf_java_guardianCreate_add_title: 'Add {0}',
    plugins_perf_java_guardianHome_connected_noData: 'No Java process exists in the current Guardian.',
    plugins_perf_java_search_guardian_nodata: 'No related process is found.',
    plugins_perf_java_guardianHome_disconnected_noData: 'The Guardian is in offline state. \
     Please restart it and check.',
    plugins_perf_java_guardianHome_containerId: 'Container ID:',
    plugins_common_message_ipError: 'Enter a correct IP address.',
    plugins_perf_java_guardianManage_part_delete_tip: 'The Guardian is in offline state. \
    After you click OK, you need to manually delete the executable file of {0} on the remote server.',
    plugins_perf_java_guardianManage_all_delete_tip: 'The remote server cannot be connected. \
    Are you sure you want to forcibly delete the Guardian data in the software? After you click OK, \
    you need to manually delete the executable file of {0} on the remote server.',
    plugins_perf_java_guardianManage_nameError: 'The guardian name is a string of 6 to 32 characters, \
     allowing letters, \
     digits, periods (.),and underscores (_). It must start with a letter.',
    plugins_perf_java_guardianManage_noData: 'No Guardian has been added',
    plugins_common_message_installPortError: 'Enter a correct port number range.(1-65535)',
    plugins_perf_java_profiling_tip: 'Profiling Analysis',
    plugins_perf_network_disconnected: 'Network disconnected',
    plugins_perf_error_code: 'Error code',
    plugins_perf_java_sampling_tip: 'Sampling Analysis',
    plugins_perf_java_database_jdbcTip: 'Starts or stops JDBC access operation analysis.',
    plugins_perf_java_guardianManage_partial_deleteTip: 'The local configuration and analysis records will be deleted. \
    You need to manually delete the remaining files of the current Guardian on the remote server.',
    plugins_perf_java_label_profilingThreadName: 'Thread',
    plugins_common_message_bannerInfo_growth: 'Visit the Kunpeng community to get skills for new developer growth.',
    plugins_common_message_bannerInfo1: 'Visit the Kunpeng community to learn about Kunpeng DevKit.',
    plugins_common_message_bannerInfo2: 'View details in the Kunpeng Hyper Tuner documents.',
    plugins_common_message_bannerInfo3: 'Have any questions? Ask experts. ',
    plugins_perf_java_profiling_thread_dumpNodata: 'No dump file is available. Perform thread dump first',
    plugins_perf_java_samplingIO_noData: 'No data found. The system does not detect I/O events \
     that exceed the threshold.',
    plugins_perf_java_sampling_strackTrace: {
        more: 'More',
        moreInfo: 'Current:{0} Total:{0} Reset:{0}',
        checkAll: 'Check All'
    },
    searchBox: {
        mutlInfo: 'Enter the keyword.',
        info: 'Enter the {0} to be searched.'
    },
    plugins_perf_java_sampling_gc: 'Collected GC Event Info',
    plugins_perf_java_sampling_gcPauseTime: 'Pause Time (ms)',
    plugins_perf_java_sampling_gcConfig: 'Configuration Information',
    plugins_perf_java_sampling_gcChart: {
        used_heap_size: 'Used Size',
        free_heap_size: 'Free Size',
        committed_heap_size: 'Committed Size',
        meta_space: 'Metaspace (MiB)',
        used_meta_space: 'Used Metaspace',
        free_meta_space: 'Free Metaspace',
        commited_meta_space: 'Committed Metaspace'
    },
    plugins_perf_java_profiling_limitation: {
        name: 'Real-Time Data Limit',
        operate: {
            reset: 'Restore Defaults'
        },
        notice: {
            defaultValue: 'The current value is the default value.',
            sameValue: 'The new value is the same as the original one.',
        },
        subtabs: {
            jdbc: 'JDBC',
            thread: 'Thread List',
            pool_form: 'JDBC Connection Pool',
            mongodb: 'MongoDB',
            cassandra: 'Cassandra',
            hbase: 'HBase',
            file_io: 'File IO',
            socket_io: 'Socket IO',
            boot_metrics: 'Spring Boot-Metrics Change',
            boot_traces: 'Spring Boot-Hotspot HTTP Traces',
            http: 'HTTP Requests',
        },
        type: {
            times: 'Time Limit',
            records: 'Restore Defaults'
        },
        pauseTip: '(No data is collected between {0} and {1}.)',
        msgbox: {
            title: 'Leave Current Page',
            content: 'If you leave the current page, the data collection will be paused. \
            The data collection will continue after you switch back to the page again. \
             Are you sure you want to leave this page?',
            checkboxLabel: 'Do not remind me again for this analysis'
        }
    },
    plugins_common_caFile_title: 'Installing a Root Certificate',
    plugins_common_caFile_messages: 'Before the profiling, you need to load the certificate. \
     Perform the following steps:\
    （If the certificate does not take effect after you perform the following steps, restart VSCode and try again.)',
    plugins_common_caFileDownLoad_label: '1. Download the root certificate.',
    plugins_common_caFileDownLoad_messages1: 'Click ',
    plugins_common_caFileDownLoad_messages2: 'the link ',
    plugins_common_caFileDownLoad_messages3: 'to download the certificate to the local computer.',
    plugins_common_caFileInstall_label: '2. Install the root certificate.',
    plugins_common_caFileInstall_messages1: 'For details, see the ',
    plugins_common_caFileInstall_messages2: 'FAQs',
    plugins_common_caFileInstall_messages3: '.',
    plugins_perf_java_sampling_name: 'Sampling Analysis',
    plugins_perf_java_profiling_name: 'Profiling Analysis',
    plugins_perf_java_profiling_export: {
        title: 'Export Report',
        tip: 'Select the content to be exported',
        all: 'All'
    },
    plugins_perf_java_profiling_fileIO_path: 'File Path',
    plugins_perf_java_profiling_fileIO_address: 'Remote Address',
    plugins_common_title_serverException: 'The server does not respond. Perform the following \
     steps to rectify the fault:',
    plugins_common_message_networkErrorTip: '1. Run the curl {0}:{1} command the local PC \
    to check the server is reachable.',
    plugins_common_message_networkErrorTip_deployScenario: '1. Run the ssh {0} command the local PC \
    to check the server is reachable.',
    plugins_common_message_networkErrorResult1: '- If yes, go to Step 3.',
    plugins_common_message_networkErrorResult2: '- If no, go to Step 2.',
    plugins_common_message_networkErrorYunTip: '2. If you use a HUAWEI cloud server, ensure that the server address is \
    a public IP address of HUAWEI CLOUD. You cannot access the server with a private IP address. \
    If the peer server is not a HUAWEI cloud server, check for the following issues:',
    plugins_common_message_networkErrorYunTip_deployScenario: '2. If you use a HUAWEI cloud server, \
     ensure that the server address is \
    a public IP address of HUAWEI CLOUD. You cannot access the server with a private IP address. \
    If the peer server is not a HUAWEI cloud server, check for the following issues:',
    plugins_common_message_serverErrorTip: '3.  Log in to the server OS and check the host or \
     container services are running properly.',
    plugins_common_message_serverErrorResult1: '- If yes, go to Step 4.',
    plugins_common_message_serverErrorResult2: '- If no, rectify the fault by following the \
     instructions provided in {0}.',
    plugins_common_message_CommunityTip: '{0}. Report your problem on the {1}.',
    plugins_common_message_serverErrorResult2Link: '<a href={0}> "How Do I Troubleshoot \
     the Server in Abnormal Status?"</a>',
    plugins_common_message_CommunityTipLink: '<a href={0}>Kunpeng Community</a>',
    plugins_common_message_connIssue1: '1. The IP address entered does not exist.',
    plugins_common_message_connIssue2: '2. The DevKit application is not installed on the server, \
     or the server port {0} is incorrect.',
    plugins_common_message_connIssue2_deployScenario: '2) The server has SSH disabled.',
    plugins_common_message_connIssue3: '3. The network cables are not properly connected.',
    plugins_common_message_connIssue4: '4. Network policies, such as interception rules, are used.',
    plugins_common_message_connIssue5: '5. Check the network status and network configurations.',
    plugins_perf_java_record_manage: {
        table_head: {
            record_name: '记录名称',
            record_time: '记录时间',
            record_state: '状态',
            operation: '操作'
        }
    },
    profileNodataTip: {
        fileIo: 'If no analysis data is output for a long period of time during the File IO analysis, \
         the possible causes are as follows:  \
        1. The threshold is too low. 2. No related operation is performed. ',
        socketIo: 'If no analysis data is output for a long period of time during the Socket IO analysis, \
         the possible causes are as \
        follows:  1. The threshold is too low. 2. No related operation is performed. ',
        jdbc: 'If no analysis data is output for a long period of time during the JDBC analysis, \
         the possible causes are as follows:  1. \
        The threshold is too low. 2. No related operation is performed. \
         3. The related functions are not supported.',
        jdbcpool: 'If no analysis data is output for a long period of \
         time during the JDBC Connection Pool analysis, the possible \
        causes are as follows:  1. The threshold is too low. 2. No related \
         operation is performed. 3. The related functions are not supported.',
        mongodb: 'If no analysis data is output for a long period of time during the MongoDB \
         analysis, the possible causes are as follows:  1. The threshold is too low. 2. No related operation \
          is performed. 3. The related functions are not supported.',
        cassandra: 'If no analysis data is output for a long period of time during the Cassandra analysis, \
         the possible causes are as follows:  1. The threshold is too low. 2. No related operation is performed. \
          3. The related functions are not supported.',
        hbase: 'If no analysis data is output for a long period of time during the HBase analysis, \
         the possible causes are as follows:  1. The threshold is too low. 2. No related operation is performed. \
          3. The related functions are not supported.',
        http: 'If no analysis data is output for a long period of time during the HTTP Requests analysis, \
         the possible causes are as follows:  1. The threshold is too low. 2. No related operation is performed. \
          3. The related functions are not supported.'
    },
    plugins_java_space_message: {
        disk: 'drive space',
        workplace: 'workspace',
        tip: 'Insufficient {0} for {1} analysis.',
        profiling: 'profiling',
        sampling: 'sampling'
    },
    plugins_javaperf_title_createTime: ' Create Time:',
    plugins_javaperf_add_guardian_modalTitle: 'Add Guardian',
    plugins_javaperf_guardian_noData: 'No Guardian is available.',
    plugins_javaperf_message_cart: 'After the certificate is imported successfully, \
     restart VS Code for the certificate to take effect.',
    common_advice_feedback: 'Advice Feedback',
    common_connect_fail: 'Connection Failed',
    common_connect_fail_reason: 'Network connection request fails. Try the following ways to provide suggestions:',
    common_connect_fail_reason1: '1.Check the network connection and click ',
    common_connect_fail_reason2: 'again to provide suggestions.',
    common_connect_fail_reason3: '2.Scan the following QR code with your mobile phone to provide suggestions.',
    common_term_link_feedback: 'Join the Kunpeng community and provide suggestions.',
};
