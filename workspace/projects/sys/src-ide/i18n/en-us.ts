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
    guide: {
        basic_title: "Basic Analysis",
        top_title: "Advanced Analysis",
        SysPertitle_title: "The System Profiler analyzes system performance in multiple scenarios, \
        locates system performance bottlenecks and hotspot functions, and provides multi-dimensional \
        optimization suggestions based on performance data of Kunpeng microarchitecture, hardware, \
        operating system, application processes/threads, and functions.",
        JavaPerf_title: "Java Profiler is a performance analysis and optimization tool for \
        Java programs running on Kunpeng-based servers. It can graphically display heap, \
        thread, lock, and garbage collection information of Java programs, collect hotspot functions, \
        locate program bottlenecks, and optimize programs.",
        MemPerf_title: "The system diagnosis tool analyzes system running indicators, \
        identifies exceptions, such as memory leakage, memory overwriting, and network \
        packet loss, and provides optimization suggestions. It also supports pressure \
        test systems, such as network I/O, to evaluate the maximum performance of the system.",
        Tuninghelper_title: "The tuning assistant organizes and analyzes performance indicators, \
        hotspot functions, and system configurations in a systematic manner to form a system \
        resource consumption chain, instructs users to analyze performance bottlenecks, \
        and provides optimization suggestions and operation guides to implement quick optimization.",
        tuninghelperDetail: 'Systematically organizes performance indicators, helps users analyze performance bottlenecks,\
        and implements quick optimization',
        sysDetail: 'Comprehensive, powerful, and professional scenario-based analysis',
        javaDetail: 'Java application performance tuning',
        diagnoseDetail: 'Quick identification of memory leaks and other exceptions',
        javaTitle: 'Java Profiler',
        howInstall: 'Learn how to install',
        addGuardian: 'Add Guardian',
        softwareScreenshot: 'Software screenshot',
    },
    hpc: {
        mission_create: {
            bandwidth: 'Memory bandwidth',
            instr_dis: 'Instruction distribution',
            analysis_type: 'Sampling Type',
            collectionType: 'Collection Type',
            MPIDirectory: 'Directory for storing MPI commands',
            selectNode: 'Selecting the node where mpirun is running',
            rankNodes: 'Configuring the Number of Running Ranks of Nodes',
            rankNum: 'Rank Quantity',
            masterIp: 'master ip',
            summary: 'Summary',
            openMpParams: 'OpenMP Parameters',
            openMpParams_validate: 'Incorrect OpenMP parameter format.',
            openMpParams_tip:
                'Set OpenMP environment variables. Use spaces to separate variables, for example, \
          OMP_NUM_THREADS=32 OMP_PROC_BIND=88.',
            mpi_env_dir: 'Directory Of MPI Command',
            mpi_env_dir_tip: 'Enter the Directory Of MPI Command',
            mpi_parameters_tips: "Set the parameters of the MPI environment variable '-x'.\
            For example, 'foo' indicates that the environment variable foo is exported from the current environment. 'foo=bar' indicates that the environment variable 'foo' is exported and its value is set to the 'bar' in the startup process.",
            mpiParams: 'MPI Parameter',
            rank: 'Rank',
            rankNums: 'Number of Ranks',
            nodeRange: 'Node Range',
            allNodes: 'All nodes',
            specifiedNode: 'Specified node'
        },
        basic_data: 'Basic Data',
        target: 'HPC Metrics',
        summary: 'Summary',
        basic: {
            exe_time: 'Execution Time',
            run_time: 'Running Time',
            serial_time: 'Serial time',
            parallel_time: 'Parallel Time',
            unbalance_time: 'Imbalance Time',
            cpi: 'CPI',
            use_rate: 'CPU Usage',
            bandwith: 'Average DRAM Bandwidth',
            reade_bandwith: 'Read Bandwidth',
            write_bandwith: 'Write Bandwidth',
        },
        hpc_target: {
            memory_width: 'Memory Bandwidth',
            read_bandwith: 'Read Bandwidth',
            ava_bandwith: 'Average DRAM Bandwidth',
            write_bandwith: 'Write Bandwidth',
            out_socket_bandwith: 'Cross-Socket Bandwidth',
            inner_socket_bandwith: 'Intra-Socket Bandwidth',
            l3_rate: 'L3 Miss Rate',
            l3_missing: 'L3 By-Pass Rate',
            l3_use: 'L3 Usage',
            directives: 'Instruction Distribution',
            memory: 'Memory',
            load: 'Load',
            store: 'Store',
            integer: 'Integer',
            float: 'Floating Point',
            advanced: 'Advanced SIMD',
            crypto: 'Crypto',
            branch: 'Branches',
            immediate: 'Immediate',
            indirect: 'Indirect',
            return: 'Return',
            barries: 'Barriers',
            instruct: 'Instruction Synchronization',
            dataSyn: 'Data Synchronization',
            datamem: 'Data Memory',
            notr: 'Not Retired',
            other: 'Other',
            hpc_top_down: 'HPC Top-Down',
            event_name: 'Event Name',
            event_rate: 'Event Ratio',
            pmu: 'Original PMU Events',
            core_pmu: 'Core-related PMU Events',
            uncore_pmu: 'Uncore-related PMU Events',
            event: 'Event',
            rank: 'rank',
            count: 'Count',
            open_mp: 'OpenMP Runtime Metrics',
            exe_time: 'Execution Time (s)',
            unbalance_time: 'Imbalance Time (s)',
            unbalance_rate: 'Imbalance Ratio (%)',
            serial_time: 'Serial time',
            parallel_time: 'Parallel Time',
        },
        tips: {
            memory: ' Percent of memory Load/Store executed instructions',
            load: 'Percent of memory reading executed instructions',
            store: 'Percent of memory writing executed instructions',
            integer: 'Percent of integer data processing executed instructions',
            float: 'Percent of floating-point data processing executed instructions',
            branches: 'Percent of branch executed instructions',
            advanced:
                'Percent of Advanced SIMD data processing executed instructions',
            crypto: 'Percent of cryptographic instructions, except PMULL and VMULL',
            immediate: 'Percent of immediate branch executed instructions',
            indirect: 'Percent of indirect branch executed instructions',
            return: 'Percent of return executed instructions',
            barriser: 'Percent of barriers executed instructions',
            instructions:
                'Percent of instruction synchronization barrier executed instructions',
            data: 'Percent of data synchronization barrier executed instructions',
            data_mem: 'Percent of data memory barrier executed instructions',
            not: 'Percent of speculatively executed, but not retired instructions',
        },
        mpi_com: {
            mpiTitle: 'MPI runtime metrics',
        },
    },
    common_term_sign_left: '(',
    common_term_sign_left_space: ' (',
    common_term_sign_right: ')',
    common_term_sign_colon: ': ',
    common_term_sign_quotation_left: '"',
    common_term_sign_quotation_right: '"',
    common_term_sign_question: '?',
    common_term_nodata_available: 'No data available',
    plugins_perf_message_firstlogin: 'Set the administrator password upon the first login.',
    plugins_perf_message_useralreadyloged: 'The user has logged in to the system.',
    plugins_perf_title_login: 'Log In to Hyper Tuner',
    plugins_perf_label_username: 'User Name',
    plugins_perf_label_password: 'Password',
    plugins_perf_button_confirm: 'OK',
    plugins_perf_message_raidtip: 'RAID level and current status',
    plugins_perf_message_devicestip: 'Unused Block Devices',
    plugins_perf_label_newProject: 'Create Project',
    plugins_perf_label_newTarget: 'Create Task',
    plugins_perf_label_checkReport: 'View Report',
    plugins_perf_label_addGuardian: 'Add Guardian',
    plugins_perf_label_selectProcess: 'Select Analysis Process',
    plugins_perf_title_toolLoginSuccess: 'Login successful.',
    plugins_perf_title_buildTargetOrCheckTarget: 'Perform the performance analysis according to the process below.',
    plugins_perf_title_projectSuccess: 'The project to the performance analysis tool is successful.',
    plugins_perf_title_viewTip: 'You can manage projects and tasks in the project tree on the left.',
    plugins_perf_title_sysAnalysisProcess: 'System Profiling Process',
    plugins_perf_title_javaAnalysisProcess: 'Java Profiling Process',
    plugins_sysperf_term_new_project: 'New Project',
    plugins_perf_button_cancel: 'Cancel',
    plugins_perf_button_login: 'Log In',
    plugins_perf_button_logDownload: 'Download',
    plugins_perf_label_admin: 'Admin',
    plugins_perf_label_normal: 'User',
    plugins_perf_term_copyright: 'Copyright © Huawei Technologies Co., Ltd. 2021. All rights reserved.',
    plugins_perf_title_changeInitial: 'Change Initial Password',
    plugins_perf_title_changePwd: 'Change Password',
    plugins_perf_message_passwordExpired: 'The password has expired. Please change the password immediately.',
    plugins_perf_tips_creatrmk: 'Change the initial password and log in again for security purposes.',
    plugins_perf_title_setting: [
        'User Management',
        'Run Logs',
        'Operation Logs',
        'Common Configuration',
        'Web Server Certificates',
        'Weak Password Dictionary',
    ],
    plugins_perf_secondtitle_setting: [
        'Run Log Level', 'Operation Log Aging Time (days)', 'MaximumNumber of Online (1-20) \
        Common Users', 'Session Timeout Period(10 min~240 min)',
        'Web Service Certificate Expiration Alarm Threshold (7 days~180 days)',
        'Agent Service Certificate Expiration Alarm Threshold (7 days~180 days)',
        'Password Validity Period (7 days~90 days)'],
    plugins_perf_title_userManager: ['Create User', 'Change Password', 'Reset Password', 'Delete User'],
    plugins_perf_button_modify: 'Modify',
    plugins_perf_title_columsOperate: 'Operation',
    plugins_perf_runlog_webServerLog: 'Web_Server run log',
    plugins_perf_runlog_webServerLog_download: 'Download {0}',
    plugins_perf_runlog_dataAnalysis: 'Data analysis run log',
    plugins_perf_runlog_dataCollection: 'Data collection run log',
    plugins_perf_runlog_tip_modifySame: 'The new value is the same as the original one.',
    plugins_perf_runLogTip: 'The log level indicates the severity of the log information.\
    <br/> DEBUG: debugging information for fault locating.\
    <br/> INFO: key information about the normal running of the service.\
    <br/> WARNING: events about the system in unexpected status that does not affect the running of the system.\
    <br/> ERROR: errors that do not affect the application running. \
    <br/> CRITICAL: errors that may cause system breakdown. ',
    plugins_perf_input_role: 'User',
    plugins_perf_label_userManager: {
        name: 'Name',
        role: 'Role',
        workspace: 'Workspace',
        password: 'Password',
        confirmPwd: 'Confirm Password',
        adminPwd: 'Admin Password',
        oldPwd: 'Old Password',
        newPwd: 'New Password',
        changePwd: 'Change Initial Password',
        managerPwd: 'Admin Password',
    },
    common_term_statement: 'Disclaimer',
    common_term_read: 'I have read the disclaimer',
    common_term_agree: 'Agree',
    common_term_Signed: 'Close',
    common_term_Think: 'Think again',
    common_term_ThinkTip: 'If you do not agree to the disclaimer, you will exit the \
    performance analysis tool. Exercise caution when deciding to do so.',
    common_search_input_tip: 'Click to search', // 翻译
    statement: {
        title: 'Once you select "I have read the disclaimer", you confirm that \
        you understand and agree to the entire content of this disclaimer:',
        content1: '1. It is recommended that you use this tool in a non-production \
        environment to prevent impact on services in the production environment.',
        content2: '2. The user name and password that are not used for the authentication \
        of the tool will not be saved in the system.',
        content3: '3. You have confirmed that you are the owner of the application or have \
        obtained authorization from the owner.',
        content4: '4. The analysis result may contain the internal information and related \
        data of the application you analyze. Please manage the analysis result properly.',
        content5: '5. Unless otherwise specified in laws and regulations or contracts, Huawei \
        does not make any express or implied statement or warranty on the analysis results, nor \
        makes any warranty or commitment on the marketability, satisfaction, non-infringement, or\
         applicability of the analysis results for specific purposes.',
        content6: '6. Any actions you take based on the analysis records shall comply with laws and \
        regulations, and you shall bear the risks.',
        content7: '7. No individual or organization may use the application and associated analytical \
        records for any activity without the authorization of Huawei. Huawei is not responsible for any \
        consequences and bears no legal liabilities. Huawei will reserve the right to pursue legal action if necessary.'
    },
    plugins_sysperf_network_disconnected: 'Network disconnected',
    plugins_sysperf_error_code: 'Error code',
    plugins_sysperf_message_export: 'Export',
    plugins_sysperf_message_exportPerf: 'Export Overall Analysis Data',
    plugins_sysperf_message_exportTips: 'The download may take a long time. Do you want to continue?',
    plugins_sysperf_message_exportWait: 'The exported overall analysis data will be automatically downloaded.',
    plugins_sysperf_message_exportFail: 'Failed to export the overall analysis data.',
    plugins_sysperf_message_reDownload: 'Retry',
    plugins_sysperf_message_download: 'Download',
    plugins_sysperf_import_tip: 'Make sure that the imported certificate file is generated by the latest CSR file',
    plugins_sysperf_import_pre_tip: 'Do not generate a new CSR file before importing the web server certificate.',
    plugins_perf_tips_delete: 'After a user is deleted, the Historical reports of the user will be deleted. \
    Exercise caution when performing this operation.',
    plugins_perf_tips_numCheck: 'Enter an integer ranging from 1 to 20',
    plugins_perf_tips_timeoutmodify: 'Enter an integer ranging from 10 to 240.',
    plugins_perf_tips_operation: 'Enter an integer ranging from 30 to 280.',
    plugins_perf_tips_certTime: 'Enter an integer ranging from 7 to 180.',
    plugins_perf_tips_pwdPeriod: 'Enter an integer ranging from 7 to 90.',
    plugins_perf_tips_userNameCheck:
        'The user name contains 6 to 32 characters, including letters, digits, hyphens (-), \
    and underscores, and it must start with a letter.',
    plugins_perf_tips_adminPwdCheck: 'Enter the administrator password.',
    plugins_perf_tips_passwordCheck: 'The password must contain at least two types of the following \
        characters: uppercase letters, lowercase letters, digits, and special \
        characters (`~!@#$%^&*()-_=+\\|[{}];:\'",<.>/?). The length ranges from 8 to 32 characters.',
    plugins_perf_tips_confirmPwdCheck: 'The passwords do not match.',
    plugins_perf_tips_isRequired: 'This field cannot be left blank.',
    plugins_perf_tips_oldPwdCheck: 'Please enter the password.',
    plugins_perf_tips_reverseCheck: 'The new password cannot be the old password in reverse order. \
        It must contain 8 to 32 characters and at least two types of the following characters: uppercase letters, \
        lowercase letters, digits, and special characters (`~!@#$%^&*()-_=+\\|[{}];:\'",<.>/?).',
    plugins_perf_tips_createUser: 'User {0} creation successful.',
    plugins_perf_tips_deleteUser: 'Succeeded in deleting the user {0}.',
    plugins_perf_tips_changePwd: 'Password reset successfully.',
    plugins_perf_tips_resetPwd: 'User password changed successfully.',
    plugins_perf_tips_changeNum: 'The maximum number of concurrent online common users is changed successfully.',
    plugins_perf_tips_operationgNum: 'The operation log aging time is changed successfully.',
    plugins_perf_tips_LogLevelNum: 'The run log level is changed successfully.',
    plugins_perf_tips_changeOutMinNums: 'The session timeout period is changed successfully.',
    plugins_perf_title_columsLog: {
        user: 'User Name',
        ip: 'IP',
        event: 'Event',
        result: 'Result',
        time: 'Time',
        detail: 'Detail',
    },
    plugins_perf_title_columsRunningLog: {
        logName: 'Log Name',
        operation: 'Operation',
    },
    plugins_perf_label_runningLogs: {
        userRunningLog: 'User management run log',
        download: 'Download',
    },
    plugins_perf_label_logDetail: 'Log Details',
    plugins_perf_label_operation: 'Operation',
    plugins_perf_label_size: 'Size',
    plugins_perf_title_downloadRunLog: 'Download User Management Run Logs',
    plugins_perf_title_sureDownloadRunLog: 'Are you sure you want to download the following run logs?',
    plugins_perf_label_rememberPwd: 'Remember password',
    plugins_perf_label_autoLogin: 'Auto login',
    plugins_common_admin_cannot_remember_password: 'The administrator cannot use the Remember Password function.',
    plugins_common_admin_cannot_auto_login: 'The administrator cannot use the Auto Login function.',
    plugins_porting_label_adminAutoLoginTip: 'The current user is an administrator and cannot save the password.',
    plugins_perf_title_loginConfig: 'Configure Login',
    plugins_sysperf_label_popUpWindow: 'Pop-up window',
    plugins_sysperf_title_filterAnalysisObjects: 'Filter analysis objects/metrics',
    plugins_sysperf_title_cpuAverageLoad: 'CPU Average Load',
    plugins_sysperf_title_indicator: 'Metrics',
    plugins_sysperf_title_interfaces: 'Interfaces',
    plugins_sysperf_title_blockDevice: 'Block Device',
    plugins_sysperf_title_dataInterface: 'Statistics of the transmitted data volume on the interface',
    plugins_sysperf_title_interfaceFault: 'Interface Fault Statistics',
    plugins_perf_tip_batchDel: 'The task templates are successfully deleted in batches.',
    plugins_perf_tip_del: 'The task template is deleted successfully.',
    plugins_perf_tip_modifySuc: 'The operation log is modified successfully.',
    plugins_perf_tip_modelSuc: 'Template saved successfully.',
    plugins_perf_tip_inputErr: 'Invalid value. Please enter an integer from 30 to 180.',
    plugins_perf_title_operaLog: 'Operation Log Aging Time (days)',
    plugin_perf_button_modelDel: 'Batch Delete',
    plugin_perf_template_del_notice: 'Delete Template',
    plugin_perf_tip_modelMulDel: 'Are you sure you want to delete the following templates?',
    plugin_perf_title_modelManage: 'Task Template Management',
    plugin_perf_tip_confirmDel: 'Are you sure you want to delete template',
    plugins_perf_tip_sameLogTime: 'The new value is the same as the original one.',
    plugins_perf_runlog_tip_invalidValue: 'The input value is invalid',
    plugins_perf_tip_operaLogFaq: 'The logs that exceed the specified time will be overwritten.',
    plugins_perf_tip_sysSet: {
        sysLog: 'System Profiler Log',
        commonRunLog: 'common run logs',
        commonOperationLog: 'common operation logs',
        accessAnalysisType: 'Access Analysis Type',
        nodeManagement: 'Node Management',
        appointManagement: 'Scheduled Task Management',
        rootPwdTip: 'If you log in as a non-root user, switch to the root user to perform operations.',
        noAppointTaskData: 'No scheduled task. Please create scheduled tasks first.',
        workingLog: 'Run Logs',
        common_term_admin_log: 'Operation Logs',
        agent: 'Agent Service Certificates',
        deleteTask: 'Delete',
        delte: 'Delete',
        run_log_level: 'Run Log Level',
        sureDownload: 'Are you sure you want to download the following run logs?',
        size: 'Size',
        Modify: 'Modify',
        download: 'Download',
        name: 'Name',
        status: 'Status',
        analysisTarget: 'Analysis Object',
        common_term_task_analysis_type: 'Analysis Type',
        action: 'Operation',
        logFileName: 'Log File Name',
        selectAll: 'ALL',
    },
    plugins_common_title_config: 'Configure Remote Server',
    plugins_common_label_config: 'Configure the remote server address for Hyper Tuner. \
    If you have not deployed the tool on the server,',
    plugins_common_button_install: 'click here to deploy',
    plugins_common_label_ip: 'IP Address',
    plugins_common_message_ipError: 'Enter a correct IP address.',
    plugins_common_label_port: 'SSH Port',
    plugins_common_label_configPort: 'HTTPS Port',
    plugins_common_placeholder_default_port: 'Default port: 8086',
    plugins_common_message_portError: 'Enter a correct port number range.(1024-65535)',
    plugins_common_service_certificate_settings: 'Service Certificate Settings',
    plugins_common_service_certificate_settings_tip1: '1. Before selecting Specify Root Certificate, \
    you need to obtain a CSR file on Web Server Certificates as the administrator, use the CSR file to \
    generate a standard X.509 certificate in the CA system or signature certificate system, and sign and \
    import the certificate. Then, you can specify the root certificate to set up a secure connection.',
    plugins_common_service_certificate_settings_tip2: '2. If you select Trust the current service certificate, \
    you trust the connection set up with the server.',
    plugins_common_specifying_root_certificate: 'Specify root certificate',
    plugins_common_trust_current_service_certificate: 'Trust the current service certificate ',
    plugins_common_specifying_local_path: 'Specify local path',
    plugins_common_no_select_certificate: 'No certificate selected',
    plugins_common_button_save: 'Save',
    plugins_common_button_cancel: 'Cancel',
    plugins_common_button_modifyConfig: 'Modify',
    plugins_common_message_beforeInstall: 'Before You Start ',
    common_term_noCallStackInfo: 'No call stack information',
    plugins_common_message_beforeInstallDsc4: '1. This tool identifies your system status based on the information \
    you entered \
    (such as the IP address, port number, user name, and password) and implements one-click deployment. \
    The information you entered will not be used for other purposes or be transferred outside your server.',
    plugins_common_message_beforeInstallDsc5: '2. During the use of this tool, you may need to download and \
    install software dependencies, \
    which may contain third-party software. The third-party software is provided "As Is", \
    and Huawei assumes no responsibility for risks incurred by using the software.',
    plugins_porting_message_beforeInstallDsc6: '3. During the use of this tool, the tool may download \
    and install necessary software \
    packages and verification tools, which may contain software from Huawei website:',
    plugins_porting_message_pg_download_link: 'Installation package',
    plugins_porting_message_pg_vfc_tool_download_link: 'Verification tool',
    plugins_common_message_beforeInstallOption: 'I have read the above information. ',
    plugins_common_message_beforeInstallConfirm: 'OK',
    plugins_common_message_beforeInstallCancel: 'Cancel',
    plugins_common_title_deploy: 'Hyper Tuner - Deployment tool',
    plugins_common_title_installTool: 'Install Hyper Tuner',
    plugins_common_message_installTool: 'If the remote server is running a {0}compatible{1} operating \
    system and can access the Internet, the tool can be installed automatically.',
    plugins_common_message_upgradeTool: 'The upgrade will complete automatically \
    if the remote server is running a {0}compatible{1} operating system and can access the Internet.',
    plugins_common_title_targetServer: 'Target Server',
    plugins_common_message_installPortError: 'Enter a correct port number range.(1-65535)',
    plugins_common_label_installUser: 'OS User Name',
    plugins_common_label_installUserTips: 'not root user',
    plugins_common_message_userError: ' Do not use the root user.',
    plugins_common_label_installPwd: 'OS User Password',
    plugins_common_button_startDeploy: 'Install',
    plugins_common_title_installing: 'Do not close this page while the tool is being installed.',
    plugins_common_message_installingInfo: 'Install the tool as prompted. ',
    plugins_common_title_installed: 'Tool installed successfully.',
    plugins_common_title_installFailed: 'Failed to install the tool.',
    plugins_common_message_installFailedInfo: 'Perform operations as prompted.',
    plugins_sysperf_message_install_failed: 'Proceed based on the causes to the installation failure provided on the \
    {0}official website{1}.',
    plugins_common_button_login: 'Log In',
    plugins_sysperf_message_firstlogin: 'Specify the administrator password upon the first login.',
    plugins_sysperf_title_switchuser: 'Change Account',
    plugins_common_title_uninstallTool: 'Uninstall Hyper Tuner',
    plugins_common_message_uninstallTool: 'If the target server is running properly, \
    the tool can be automatically uninstalled.',
    plugins_common_title_uninstallTargetServer: 'Target Server',
    plugins_common_message_uninstallPortError: 'Enter a correct port number range.(1-65535)',
    plugins_common_label_uninstallUser: 'OS User Name',
    plugins_common_label_uninstallUserTips: 'not root user',
    plugins_common_message_uninstallUserError: ' Do not use the root user.',
    plugins_common_label_uninstallPwd: 'OS User Password',
    plugins_common_button_startUninstall: 'Uninstall',
    plugins_common_title_uninstalling: 'Do not close this page while the tool is being uninstalled.',
    plugins_common_message_uninstallingInfo: 'Uninstall the tool as prompted.',
    plugins_common_title_uninstalled: 'The tool is uninstalled successfully.',
    plugins_common_title_uninstallFailed: 'Failed to uninstall the tool.',
    plugins_common_message_uninstallFailedInfo: 'Perform operations as prompted.',
    plugins_common_button_exit: 'Finished',
    plugins_common_button_retry: 'Retry',
    plugins_sysperf_button_install_failed_retry: 'Retry',
    plugins_sysperf_message_tips: {
        create_ok: 'Node {0} is created successfully.',
        edit_ok: 'Node {1} is modified successfully.',
        delete_ok: 'Node {2} is deleted successfully.',
    },
    plugins_sysperf_button_viewFunctionDetails: 'View Function Details',
    common_term_pro_name: 'System Profiler',
    common_term_mem_name: 'System Diagnostics',
    common_tern_tunning_helper_name: 'Tuning Assistant',
    common_term_welcome_tip: 'Analyzes system performance and helps you perform hyper tuner.',
    home_top_growth: 'Visit the Kunpeng community to get skills for new developer growth.',
    home_top_info: 'Visit the Kunpeng community to learn about Kunpeng DevKit.',
    home_top_info1: 'View details in the Kunpeng Hyper Tuner documents.',
    home_top_info2: 'Have any questions? Ask experts. ',
    common_term_link_feedback: 'Join the Kunpeng community and provide suggestions.',
    common_term_welcometo: 'Welcome to use',
    common_term_login_name: 'User Name',
    common_term_login_password: 'Password',
    common_term_login_btn: 'Log In',
    common_term_login_error_info: ['User name cannot be null.', 'Password cannot be null.'],
    common_term_copyright: 'Copyright © Huawei Technologies Co., Ltd. 2020. All rights reserved.',
    common_term_user_info: ['User Management', 'Operation Log', 'Change Password', 'Log Out'],
    common_term_lang_info: ['简体中文', 'English'],
    common_term_left_parentheses: '(',
    common_term_right_parentheses: ')',
    common_term_colon: ':',
    common_term_create_user: 'Create User',
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
        managerPwd: 'Admin Password',
    },
    project_manage: 'Project Management',
    restart: 'Restart',
    setting: 'Settings',
    modalSetting: 'Template Management ',
    home: 'Home',
    sysSetting: 'System Configuration',
    about: 'About',
    startTime: 'Start Time',
    endTime: 'End Time',
    dataSize: 'Collected Data(MiB)',
    common_term_preBlock: 'Previous Code Block',
    common_term_nextBlock: 'Next Code Block',
    common_term_operate: 'Operation',
    common_term_view: 'View',
    common_term_operate_del: 'Delete',
    common_term_operate_reset: 'Reset Password',
    common_term_operate_ok: 'OK',
    common_term_operate_cancel: 'Cancel',
    common_term_operate_close: 'Close',
    common_term_operate_apply: 'Apply',
    common_term_create_tip: 'The user name cannot be modified after it is saved.',
    common_term_delete_content: 'All data related to the project will be deleted. \
    Exercise caution when performing this operation.',
    common_term_delete_content_contains_scheduled_tasks: 'This project contains scheduled tasks that have not \
    been executed. All related data will be deleted. Exercise caution when performing this operation.',
    common_term_delete_title: 'Are you sure you want to delete this project?',
    common_term_log_user: 'User Name',
    common_term_log_ip: 'IP Address',
    common_term_log_event: 'Event',
    common_term_log_result: 'Result',
    common_term_log_time: 'Time',
    common_term_log_Detail: 'Details',
    common_term_source_path: 'Source Code Path',
    common_term_operate_add_pro: 'New Project',
    common_term_operate_add_project: 'New Project',
    common_term_operate_edit: 'Edit',
    common_term_projiect_name: 'Project Name:',
    common_term_projiect_owning_Tool: 'Tool',
    common_term_projiect_name_tip: 'The project name consists of 1 to 32 characters, including letters, \
    digits, spaces, and the following \
    special characters: @#$%^&*()[]<>._-!~+.',
    plugins_common_term_project_name_cannot_empty: 'The project name cannot be empty',
    common_term_operate_search: 'Please enter a keyword',
    common_term_projiect_task: '',
    common_term_projiect_task_system: 'System',
    common_term_projiect_task_process: 'Processes',
    common_term_projiect_function: 'Functions',
    common_term_projiect_task_function: 'Function Analysis Tasks',
    common_term_user_changePwd: 'Change The Original Passowrd',
    common_term_projiect_view_more: 'More',
    common_term_task_new: 'New Analysis Task',
    common_term_task_edit: 'Edit Analysis Task',
    common_term_task_restart: 'Restart Analysis Task',
    common_term_task_c: 'C/C++ Program',
    common_term_task_java: 'Java Mixed-Mode',
    common_term_task_name: 'Task Name',
    common_term_task_type: 'Task Type',
    common_term_task_status: 'Status',
    common_term_task_fail_reason: 'Reason for failure',
    common_term_task_time: 'Time Used (s)',
    common_term_task_analysis_type: 'Analysis Type',
    common_term_task_start_time: 'Created',
    common_term_task_run: 'Start',
    common_term_task_stop: 'Cancel',
    common_term_task_nodata4: 'No related code is found in the environment.',
    common_term_task_C: 'No source code is found in the C/C++ source file path.',
    common_term_task_nodata2: 'No Data',
    common_term_task_nodata: 'No Data',
    common_term_task_empty_data: 'No Data',
    common_term_task_network_interrupt: 'The network connection is interrupted. Please try again later.',
    common_term_task_new_c: 'New C/C++ Program Analysis',
    common_term_task_new_sys: 'New System Analysis ',
    common_term_task_new_java: 'New Java Program Analysis',
    common_term_task_edit_c: 'Edit C/C++ Program Analysis',
    common_term_task_edit_java: 'Edit Java Program Analysis',
    common_term_task_start_now: 'Start Now',
    common_term_task_type_launch: 'Starts the application as data collection begins. \
    The data sampling duration is determined by the execution time of the application. \
    This option is recommended for applications with short running time.',
    common_term_task_c_app: 'Absolute path of the target application to be analyzed on the server. \
    It must contain the file name. \
    For example, to analyze the cache_hit application stored in the /root/test_lq/ directory, \
    enter /root/test_lq/cache_hit.',
    common_term_task_java_app: 'Enter the absolute path of the Java virtual machine (VM) that matches the application.',
    common_term_task_type_attach: 'Collects the performance data of a process in running in real time. \
    This option is recommended \
    for applications or data collection that takes a long period of time.',
    common_term_task_type_profile: 'Collects performance data of the server. \
    This option is recommended for servers running multiple types of services and subprocesses.',
    common_term_task_start_path: 'Same as the Application Path',
    common_term_task_start_custerm: 'Customize',
    common_term_task_start_high_precision: 'High Precision',
    common_term_task_crate_path: 'Application',
    common_term_task_crate_app_path: 'Application Path',
    common_term_task_crate_parameters: 'Application Parameters',
    common_term_task_crate_app_runUser: 'Application User',
    common_term_task_crate_app_user: 'Name',
    common_term_task_crate_app_passWord: 'Password',
    common_term_task_crate_work_director: 'Working Directory',
    common_term_task_crate_interval_ms: 'Sampling Interval',
    common_term_task_crate_s: 's',
    common_term_task_crate_ms: 'ms',
    common_term_task_crate_us: 'us',
    common_term_task_crate_mask: 'CPU Mask',
    common_term_task_crate_bs_path: 'Binary/Symbol File Path',
    common_term_task_crate_c_path: 'C/C++ Source File Path',
    common_term_task_crate_collectFiles: 'Collected File Size (MiB)',
    common_term_task_crate_java_path: '	Java Source File Path',
    common_term_task_crate_duration: 'Sampling Duration (s)',
    common_term_task_crate_pid: 'PID',
    common_term_task_crate_tid: 'TID',
    common_term_task_crate_processName: 'Process Name',
    common_term_task_crate_pid_tid: 'PID',
    common_term_task_tab_congration: 'Task Information',
    common_term_top_data_congration: 'Top Data',
    common_term_task_tab_log: 'Task Logs',
    common_term_task_tab_summary: 'Summary',
    common_term_task_tab_function: 'Function',
    common_term_task_tab_graph: 'Flame Graph',
    common_term_task_tab_graph_hot: 'Hot Flame Graph',
    common_term_task_tab_graph_cold: 'Cold Flame Graph',
    common_term_task_tab_log_basic: 'Collection Process',
    common_term_task_tab_log_data: 'Data Analysis',
    common_term_task_tab_time_chart_run_time: 'Execution Time',
    common_term_task_tab_summary_statistics: 'Statistics',
    common_term_task_tab_summary_launch_time: 'Execution Time (s)',
    common_term_task_tab_summary_other_time: 'Data Sampling Duration (s)',
    common_term_task_tab_summary_cycles: 'Clock Cycles',
    common_term_task_tab_summary_cycles_mix: 'Clock Cycles(%)',
    common_term_task_tab_summary_cyclesProportion: 'Clock Cycle Proportion',
    common_term_task_tab_summary_instructions: 'Instructions',
    common_term_task_tab_summary_instructionProportion: 'Instruction Proportion',
    common_term_task_tab_summary_ipc: 'IPC',
    common_term_task_tab_summary_modulePath: 'ModulePath',
    common_term_task_tab_summary_info: 'Platform Info',
    common_term_task_tab_summary_info1: 'Collection and Platform Info',
    common_term_task_tab_summary_system: 'Operating System',
    common_term_task_tab_summary_name: 'Host Name',
    common_term_task_tab_summary_size: 'Collected Data',
    common_term_task_tab_summary_start: 'Start Time',
    common_term_task_tab_summary_end: 'End Time',
    common_term_task_tab_summary_top10: 'Top 10 Hotspots',
    common_term_task_tab_summary_function: 'Function',
    common_term_task_tab_summary_module: 'Module',
    common_term_task_tab_summary_thread: 'Thread',
    common_term_task_tab_summary_core: 'Core',
    common_term_task_tab_summary_class: 'Class',
    common_term_task_tab_summary_method: 'Method',
    common_term_task_tab_summary_callstack: 'Callstack',
    common_term_task_tab_summary_times: 'Execution Time (s)',
    common_term_task_tab_function_hard: 'Hardware Event ',
    common_term_task_tab_function_total: 'Total Events',
    common_term_task_tab_function_name: 'File Name',
    common_term_task_tab_function_source: 'Source Code',
    common_term_task_tab_function_source_line: 'Line No.',
    common_term_task_tab_function_source_code: 'Source Code',
    common_term_task_tab_function_count: 'Count (%)',
    common_term_task_tab_function_assembley: 'Assembly Code',
    common_term_task_tab_function_assembley_address: 'Address',
    common_term_task_tab_function_assembley_line: 'Line No.',
    common_term_task_tab_function_assembley_code: 'Source Code',
    common_term_task_tab_function_flow: 'Code Flow',
    common_term_admin_user: 'User Management',
    common_term_admin_log: 'Operation Logs',
    common_term_manage_log: 'Log Management',
    log: 'Log',
    common_term_return: 'Back ',
    common_term_return_home: 'Back to Home',
    common_term_help: 'Help',
    common_term_certificate: 'Create Certificate',
    feedback: 'Feedback',
    modifySchedule: 'Modify Scheduled Task',
    passwordDic: 'Weak Password Dictionary',
    weakPasswordTip: 'Weak passwords can be easily guessed or cracked. For security purposes, \
    weak passwords are not allowed.',
    keyUpdate: 'Working Key Update',
    common_term_admin_change_pwd: 'Reset Password',
    common_term_admin_log_out: 'Log Out',
    common_term_admin_user_guest: 'Guest',
    common_term_admin_user_crate: 'Create User',
    common_term_admin_user_edit_user: 'Edit User',
    common_term_admin_user_name: 'Name',
    common_term_admin_user_role: 'Role',
    common_term_admin_user_edit: 'Edit',
    common_term_admin_user_delete_title: 'Are you sure you want to delete?',
    common_term_admin_user_edit_title: 'Are you sure you want to edit?',
    common_term_admin_user_add_title: 'Are you sure you want to create?',
    common_term_admin_user_delete_detail: 'After the deletion, all historical data related to the user \
    will be deleted. Exercise caution when performing this operation.',
    common_term_delete_content_analysis: 'After the task is deleted, all historical data of this task will be deleted. \
    Exercise caution when performing this operation. ',
    common_term_delete_title_analysis: 'Are you sure you want to delete this task?',
    common_term_delete_title_appointment: 'Delete Scheduled Task',
    sureDeleteOne: 'Are you sure you want to delete',
    sureDeleteTwo: 'Are you sure you want to delete the following scheduled tasks?',
    common_term_delete_content_appointment: 'The scheduled task cannot be restored after deletion. \
    Excercise caution when deleting a scheduled task.',
    message_offline_tips_title: 'Please handle nodes in offline status!',
    message_offline_tips_context: 'No new analysis task can be created because the current project involves \
    nodes in the offline state. Handle the offline nodes first.',
    message_close: 'Close',
    common_term_another_nodename: 'Node Alias',
    common_term_another_name: 'Alias',
    common_term_node_ip: ' Node IP Address',
    common_term_node_status: 'Node Status',
    common_term_execution_status: 'Execution Status',
    common_term_password_check: 'Enter the administrator password.',
    status_Created: 'Created',
    status_Waiting: 'Waiting',
    status_Sampling: 'Sampling',
    status_Analyzing: 'Analyzing',
    status_Stopping: 'Stopping',
    status_Aborted: 'Aborted',
    status_Failed: 'Failed',
    status_Completed: 'Completed',
    status_Online: 'Online',
    status_Offline: 'Offline',
    status_Cancelled: 'Canceled',
    status_NotStart: 'Not started',
    status_Cancelling: 'Canceling',
    status_Yes: 'Yes',
    status_No: 'No',
    memInfo: {
        comma: '，',
        end: '。',
        remaining: 'and the available space is ',
        space: {
            title1: 'Workspace: ',
            title_total: 'Total Workspace Capacity',
            title2: 'Remaining Workspace: ',
            title22: 'Remaining Workspace',
            title3: 'The minimum available workspace recommended is > ',
            title_suggestFree: 'Recommended Remaining Workspace',
            tip1: 'Delete historical analysis records to release space. ',
            tip2: 'The remaining workspace is insufficient.Delete historical analysis records to release space.',
            residual_capacity_too_small: 'The available workspace of the Hyper Tuner plug-in is too small.',
            total_capacity: 'The total workspace capacity is ',
        },
        disk: {
            title1: 'Total Drive Capacity: ',
            title2: 'Remaining Drive Capacity: ',
            title22: 'Remaining Drive Capacity',
            title3: 'The minimum available space recommended is > ',
            title_suggestFree: 'Recommended Remaining Drive Capacity',
            tip1: 'Release the disk space.',
            tip2: 'The remaining drive space is insufficient. Release the drive space.',
            residual_capacity_too_small: 'The available drive space for the Hyper Tuner plug-in is too small.',
            total_capacity: 'The total drive capacity is ',
        }
    },
    disk_monitor: 'Remaining Workspace',
    workspace: 'Workspace: ',
    workremain: 'Remaining Workspace: ',
    recommend: 'Recommended Remaining Workspace> ',
    disk: 'Total Drive Capacity: ',
    disk_remain: 'Remaining Drive Capacity: ',
    disk_recommend: 'Recommended Remaining Drive Capacity> ',
    workspace_full_tip: 'Delete historical analysis records to release space. ',
    disk_full_tip: 'Release the disk space.',
    sample_opt_tip: 'The remaining workspace is insufficient.Delete historical analysis records to release space.',
    sample_opt_tip_disk: 'The remaining drive space is insufficient. Release the drive space.',
    noSourceData: 'Jump failed because the assembly instruction or source code cannot be found.',
    plugins_common_status_Yes: 'Yes',
    plugins_common_status_No: 'No',
    tip_msg: {
        system_setting_input_run_user_msg: 'The user name is a string of 1 to 128 characters that \
        can contain uppercase letters, lowercase letters, digits, periods (.), underscores (_), \
        and hyphens (-). The user name cannot start with a digit or hyphen.',
        logged_in: 'user logged in elsewhere.',
        log_error: 'Failed to obtain the log information.',
        info_error: 'Failed to obtain the information.',
        conf_error: 'Failed to obtain configuration information.',
        opr_error: 'Operation failed. ',
        common_term_timeout: 'Login timed out. Please try again.',
        task_list_error: 'Failed to obtain the task list.',
        task_start_warn: 'A task is being executed. Try again later.',
        task_start_error: 'Failed to start the collection task.',
        task_create_error: 'Failed to create the task.',
        task_exist_error: 'Failed to create the task because a task with the same already exists.',
        task_edit_error: 'Failed to edit the task.',
        task_disk_error: 'Insufficient drive space.',
        task_stop_error: 'Failed to stop the task.',
        task_del_error: 'Failed to delete the task.',
        total_results_error: 'Failed to obtain the overall statistics.',
        plat_form_error: 'Failed to obtain the platform and collection information.',
        top_function_error: 'Failed to obtain the top hotspot function.',
        log_timeout: 'Logged out or timed out.',
        log_ok: 'Login successful.',
        create_ok: 'Create successfully',
        edite_ok: 'Modified successfully.',
        edite_error: 'Failed to edit.',
        common_term_task_crate_mask_tip: 'Enter one or more CPU core IDs, for example, 2-5, 2,3,4,5, or 2,3,4-5.',
        delete_ok: 'Deleted successfully.',
        delete_error: 'Failed to delete.',
        add_ok: 'Added successfully.',
        add_error: 'Failed to add.',
        get_flame_error: 'Failed to obtain the flame graph.',
        reset_pwd_error_old: 'Failed to change the password. Please enter the correct old password.',
        reset_pwd_error_repeat: 'Failed to change the password. New password must be the different with old password.',
        peoject_exist: 'The project name already exists.',
        common_term_task_crate_c_bs_tip: 'Absolute path of the binary/symbol file. This parameter is optional.',
        common_term_task_crate_c_source_tip: 'Absolute path of the C/C++ source file on the server. \
        This parameter is optional.',
        common_term_task_crate_j_source_tip: 'Absolute path of the Java source file on the server. \
        This parameter is optional.',
        common_term_task_crate_j_source_tip_true: 'Absolute path of the Java source file on the server.',
        system_setting_input_empty_judge: 'The value cannot be empty. ',
        system_setting_input_vaild_value: 'Enter a valid integer.',
        system_setting_input_only_digits: 'Only a positive integer is allowed.',
        system_setting_input_same_value: 'The new value is the same as the original one.',
        system_setting_select_loglevel_tip: `
            <b>The log level indicates the severity of the log information.</b>
            <br/>
            DEBUG: debugging information for fault locating.
            <br/>
            INFO: key information about the normal running of the service.
            <br/>
            WARNING: events about the system in unexpected status that does not affect the running of the system.
            <br/>
            ERROR: errors that do not affect the application running.
            <br/>
            CRITICAL: errors that may cause system breakdown. `
    },

    validata: {
        name_rule: 'The user name contains 6–32 characters, including letters, digits, hyphens (-), \
        and underscores(_), and must start with a letter.',
        task_name_rule: 'The task name consists of 1 to 32 characters, including letters, digits, \
        spaces, and the following special \
        characters: @#$%^&*()[]<>._-!~+ .',
        oldPwd_rule: 'Please enter the password.',
        pwd_rule: 'The password must contain at least two types of the following characters: uppercase letters, \
        lowercase letters, digits, and special characters (`~!@#$%^&*()-_=+\\|[{}];:\'",<.>/?). \
        The length ranges from 8 to 32 characters.',
        pwd_rule2: 'Cannot be the same as the user name or the user name in reverse order.',
        pwd_rule3: 'The new password cannot be the old password in reverse order.',
        pwd_rule4: 'New password must be the different with old password.',
        pwd_conf: 'The two passwords do not match.',
        req: 'This field cannot be left blank.',
        function_name_tule: 'The function name cannot be an asterisk (*).',
        overRange: 'Enter a valid integer.',
    },

    error_inertval: 'Internal server error.',
    bad_request: 'Bad request.',
    first_login: 'Login successful. For security purposes, change the initial password upon your first login.',
    pwd_guoqi: 'The password has expired. For ensure  account security, change your password in time.',
    login_error: 'The user name or password is incorrect. You can try more times.',
    login_lock: 'Account locked. Please try again 10 minutes later.',
    login_10: 'The number of sessions of the current user has reached the upper limit (10). Wait and try again later.',
    reset_pwd_ok: 'Password changed successfully. Please log in using the new password.',
    ifLogout: 'Are you sure you want to exit the tool?',
    logout: 'Log Out ',
    logout_ok: 'You have logged out of the system.',
    logout_error: 'System error.',
    selectPlace: '-Select-',
    loading: 'LOADING...',
    functiondetail_no_get_data: 'No data returned.',
    function_error: 'Failed to obtain function information.',
    secret_title: 'Are you sure you want to create the analysis task?',
    secret_count: 'Your running data will be collected and associated with the source code \
    for performance analysis and optimization. \
    The collection will not affect software running or retain your source code.',
    system_busy: 'The system is busy, please try again later.',
    application_not_exist: 'This application does not exist.',
    application_not_access: 'You do not have the access permission.',
    cpu_mask_range: 'Enter a value from 0 to ',
    cpu_mask_format: 'Incorrect format. For example, 2,3,4-5.',
    invalid_directory: 'Invalid directory.',
    invalid_directory_common: 'Invalid directory.',
    pid_not_exist: 'The PID or TID does not exist.',
    task_name: 'Task Name',
    invalid_application_permisson: 'The current user does not have the permission to access the application.',
    invalid_directory_permisson: 'The current user does not have the permission to access the path.',
    sys: {
        environment: 'Runtime Environment Information',
        baseInfo: 'Basic System Information',
        memManage: 'Memory Management System',
        storageConfig: 'Storage Resource Configuration',
        networkConfig: 'Network Port Configuration',
        performance: 'Performance',
        kernelParams: 'Kernel Parameters',
        viewDetails: 'View Details',
        cpuType: 'CPU Model',
        coreNum: 'Cores',
        memCap: 'Total memory Capacity',
        memNum: 'DIMMs',
        nullNum: 'Empty Slots',
        totalNum: 'Drives',
        storageCap: 'Total Storage Capacity',
        netNum: 'NICs',
        netPort: 'Network Ports',
        perfDetail: 'Analysis Objects/Metrics',
        selectPerfDetail: 'Filter analysis objects/metrics',
        typeAnalysisName: 'System performance panorama analysis',
        typeAnalysisNameSuccess: 'Failed to download the overall analysis data.',
        typeAnalysisNameError: 'Downloaded the overall analysis data  successfully.',
        typeAnalysisNameing: 'Downloading overall analysis data ...',
        typeAnalysisNameExport: 'Export',
        tab_name: 'System Analysis Tasks',
        creat_btn_title: 'System Performance Panorama Analysis',
        creat_modal_title: 'New System Performance Panorama Analysis Task',
        edit_modal_title: 'Edit System Performance Panorama Analysis Task',
        interval: 'Sampling Interval (s)',
        duration: 'Sampling Duration (s)',
        type: 'Sampling Type',
        cpu: 'CPU',
        mem: 'Memory',
        disk: 'Storage I/O',
        net: 'Network I/O',
        time: '( 2-300 )',
        douhao: ', ',
        tabs: {
            mem: 'Memory',
            disk: 'Drive I/O',
            net: 'Network I/O'
        },
        titles: {
            cpuUsage: 'CPU Usage',
            avgLoad: 'Average Load',
            mem: 'Memory',
            memUsage: 'Memory Usage',
            memPag: 'Page Statistics',
            memSwap: 'Switch Statistics',
            disk: 'Drive I/O',
            diskBlock: 'Block Device Usage',
            net: 'Network I/O',
            netOk: 'Network Device Statistics',
            netError: 'Network Device Fault Statistics'
        },
        sug: 'Optimization Suggestion',
        baseValue: 'Reference value',
        selCpu: 'CPU Core',
        selNUMA: 'Select NUMA',
        averValue: 'Average',
        selBlock: 'Block Device',
        selNet: 'Network Port',
        selZhibiao: 'Indicator',
        download: 'Download',
        copy: 'Copy URL',
        copy_success: 'The URL has been copied successfully.',
        tip: {
            CPU: 'CPU core (all indicates the entire CPU).',
            '%user': 'Percentage of CPU time occupied when the system is running in user mode.',
            '%nice': 'Percentage of CPU time occupied by processes whose priorities \
            have been changed in the user mode.',
            '%sys': 'Percentage of CPU time occupied when the system is running in kernel mode. \
            This indicator does not include the time spent on service hardware and software interrupts.',
            '%iowait': 'Percentage of CPU time during which the CPU is idle and waiting for drive I/O operations.',
            '%irq': 'Percentage of CPU time spent on service hardware interrupts.',
            '%soft': 'Percentage of CPU time spent on service software interrupts.',
            '%idle': 'Percentage of CPU time during which the CPU is idle and the system \
            has no unfinished drive I/O request.',
            max_use: 'Displays the maximum usage and time during the data collection period.',
            'runq-sz': 'Length of the running queue, that is, the number of tasks to be run.',
            'rung-sz': 'Length of the running queue, that is, the number of tasks to be run.',
            'plist-sz': 'Number of tasks in the task list.',
            'ldavg-1': 'Average system load in the last minute. \
            The value is equal to the average quantity of running or runnable tasks (in R state) \
            plus the average quantity of uninterruptable sleep tasks (in D state) in a specified period.',
            'ldavg-5': 'Average system load in the past 5 minutes.',
            'ldavg-15': 'Average system load in the last 15 minutes.',
            blocked: 'Number of blocked tasks waiting for I/O operations.',
            'memfree(KB)': 'Available free memory size, in KB. The buffer and cache are not included.',
            'avail(KB)': 'Available memory size, in KB. The buffer and cache are included.',
            'memused(KB)': 'Used memory size, in KB. The buffer and cache are included.',
            '%memused(KB)': 'Percentage of used memory, that is, kbmemused/(kbmemused+kbmemfree).',
            'buffers(KB)': 'Size of the memory used as the buffer by the kernel, in KB.',
            'cached(KB)': 'Size of the memory used as the cache by the kernel, in KB.',
            'active(KB)': 'Active memory size, in KB. (The memory that has been used recently \
                is not recycled unless absolutely' +
                'necessary.)',
            'inact(KB)': 'Inactive memory size, in KB. (The memory is seldom used recently \
                and meets the recycling conditions.)',
            'dirty(KB)': 'Size of the memory where data is to be written back to the disks, in KB.',
            'pgpgin/s': 'Data swapped from disks or the SWAP partition to the memory per second (KB/s).',
            'pgpgout/s': 'Data swapped from the memory to disks to the SWAP partition per second (KB/s).',
            'fault/s': 'Number of page faults (major page faults+minor page faults) generated \
            in the system per second. \
            This parameter is not the I/O page fault number because certain page faults can be \
            resolved with I/O operations.',
            'majflt/s': 'Number of major page faults generated per second. A memory page needs \
            to be loaded from disks.',
            'pgscank/s': 'Number of pages scanned by the kswapd daemon per second.',
            'pgscand/s': 'Number of pages scanned per second.',

            '%vmeff': 'Measurement indicator of the paging recycling efficiency. If the value is close to 100%, \
            almost every page can be obtained at the bottom of the inactive list. If the value \
            is too low (for example, less than 30%), \
            the virtual memory has some problems. If no page is scanned within the interval, the value is 0.',
            'pswpin/s': 'Total number of inward swap partition pages per second.',
            'pswpout/s': 'Total number of outward swap partition pages per second.',
            tps: 'Total number of I/O transmissions per second. A transmission is an I/O request to a physical device. \
            Multiple logical requests sent to a device can be combined into a single I/O request. \
            The transfer size is uncertain.',
            'rd(KB)/s': 'Number of banwidth read from the device per second .',
            'wr(KB)/s': 'Number of banwidth written to the device per second. ',
            'avgrq-sz': 'Average data size of each drive I/O operation (unit: sector).',
            'avgqu-sz': 'Average length of disk request queues.',
            'rkB/s': 'Number of sectors read from the device per second The sector size is 512 bytes.',
            'wkB/s': 'Number of sectors written to the device per second. The sector size is 512 bytes.',
            'areq-sz': 'Average data size of each drive I/O operation (unit: sector).',
            'aqu-sz': 'Average length of disk request queues.',
            await: 'Average time consumed by each request (from the time when the request is sent to the time \
                when the request is processed), including the waiting time of request in a queue. \
                The value is equal to seek time plus queue time plus service time. The unit is millisecond. ',
            svctm: 'Average time for the system to process each request, in milliseconds. \
            The time consumed in the request queue is not included.',
            '%util': 'Percentage of CPU time consumed when an I/O request is sent to a device \
            (bandwidth usage of a device). \
            When the value is close to 100%, the disk read/write performance is almost saturated.',
            'rxpck/s': 'Total number of packets received per second.',
            'txpck/s': 'Total number of packets transmitted per second.',
            'rxkB/s': 'Total number of data received per second, in KB.',
            'txkB/s': 'Total number of data transmitted per second, in KB.',
            'rxerr/s': 'Number of damaged packets received per second.',
            eth_ge: 'Standard network port rates, such as 100GE, 50GE, 40GE, and 10GE',
            'txerr/s': 'Total number of errors per second when packets are sent.',
            'coll/s': 'Number of collisions per second when packets are sent.',
            'rxdrop/s': 'Number of packets discarded by the receiving end of a NIC per second \
            when the Linux buffer is full.',
            'txdrop/s': 'Number of network packets discarded by the sending end of a NIC per \
            second when the Linux buffer is full.',
            'txcarr/s': 'Number of carrier errors per second when data packets are sent.',
            'rxfram/s': 'Number of frame synchronization errors per second when data packets are received.',
            'rxfifo/s': 'Number of FIFO overflow errors per second when data packets are received.',
            'txfifo/s': 'Number of FIFO overflow errors per second when data packets are sent.',
            max_tps: 'Maximum I/O Transmission per Second',
            max_util: 'Displays the maximum CPU used in percentage.',
            DEV: 'Block device name',
            IFACE: 'Network port name.',
            interleave_hit: 'number of memory pages that are successfully allocated to the \
            node based on the interleave policy.',
            local_node: 'number of memory pages that are successfully allocated to the processes running on the node.',
            numa_foreign: ' number of memory pages which should be preferentially allocated by the local node \
            but are actually allocated by other nodes.',
            numa_miss: ' number of memory pages which should be preferentially allocated by other nodes but are \
            actually allocated by the local node.',
            numahit: ' number of memory pages which should be preferentially allocated by \
            the local node and succeeded.',
            other_node: 'number of memory pages that are preferentially and successfully \
            allocated from the current node \
            for the processes running on other nodes.',
        },
        scenes_bigData: 'Big Data Test Tool Configuration File Path',
        scenes_dds: 'Distributed Storage Component Configuration File Path',
        scenes_placeholder: 'File path',
        scenes_tracing: 'Collect Tracing Data',
        tracingHold: ' Input tracepoint information for procedures to be analyzed to collect the tracing data.',
        tracing_help: 'View Guide',
        tracing_event: 'Collected Data Format',
        inpu_eg: 'Example: provider:tracepoint1, or input provider:*',
        traceTips: 'Collect the tracing data of applications based on the LTTng-UST framework.',
        scenes_top: 'Collect top active processes',
        topData: 'Top Data',
    },
    sys_cof: {
        loginfo: 'System Log Info',
        dockerinfo: 'Docker Info',
        systemparameters: 'System Parameters',
        kernelconfiguration: 'Kernel Configuration',
        dockerimage: 'Docker Image',
        sum: {
            download_csv: 'download csv',
            download_svg: 'download svg',
            download_html: 'download html',
            cpus: 'CPU',
            cpu: 'CPUs',
            mem: 'Memory',
            disk: 'Drives',
            network: 'NICs',
            pcie: 'PCIe Cards',
            raid: 'RAID Controller Cards',
            raid_level: 'RAID Level',
            noRaid: 'No RAID controller card detected',
            firmware: 'Firmware Version Information',
            normal_msg: 'Basic Information',
            storage_msg: ' Storage Information',
            storage_title: 'storage_title',
            file_system_msg: 'File System Information',
            docker: 'VMs/Dockers',
            bios: 'BIOS Version',
            cpld: 'CPL Version',
            os: 'OS Version',
            kernel: 'Kernel Version',
            jdk: 'JDK Version',
            glibc: 'glibc Version',
            smmu: 'SMMU',
            open: 'Enabled',
            close: 'Disabled',
            page_size: 'PT Size',
            tran_page: 'THP',
            dirty_time: 'Remaining Cache Time of Dirty Data (centisecond)',
            time_unit: '（unit:1/100s）',
            dirty_ratio: 'Max. Ratio of Dirty Pages to Total Memory',
            dirty_memratio: 'Max. Ratio of Dirty Page Cache to Total Memory',
            hz_info: 'HZ Value',
            nohz_info: 'NOHZ Timer',

            cpu_info: {
                cpu_core: 'Cores',
                cpu_name: 'Name',
                cpu_type: 'Type',
                cpu_max_hz: 'Max. Frequency',
                cpu_cur_hz: 'Current Frequency',
                numa_node: 'NUMA Nodes',
                node_name: 'Name',
                node: 'Node',
                numa_core: ' CPU Core ID',
                total_mem: 'Total Memory',
                free_mem: 'Idle Memory',
                numa_node_dis: 'NUMA Node Distance',
                numa_zero: 0,
                numa_one: 1,
                numa_two: 2,
                numa_three: 3,
            },
            mem_info: {
                mem_null: 'Empty',
                normal_msg: 'Basic Info',
                total_mem: 'System Available Memory',
                mem_slot_0: 'Slots（SOCKET 0)',
                mem_slot_1: 'Slots（SOCKET 1)',
                mem_list: 'DIMM List',
                slot_site: 'Slot',
                mem_cap: 'Capacity',
                max_t: ' Max. Rate',
                match_t: 'Configuration Rate',
            },
            disk_info: {
                disk_name: 'Device Name',
                disk_model: 'Drive Model',
                disk_cap: 'Drive Capacity',
                disk_type: 'Drive Type',
            },
            pcie_info: {
                pcie_name: 'Device（B/D/F）',
                hard_id: 'Hardware ID',
                max_rate: 'Max. Transmission Rate',
                cur_rate: 'Current Transmission Rate',
                max_load: 'Max. Data Load (byte)',
                pcie_details: 'Details',
                rxkB_details: 'Total number of bytes (in KB) received per second',
                txkB_details: 'Total number of bytes (in KB) transmitted per second.',
                txpck_details: 'Total number of packets transmitted per second.',
                rxpck_details: 'Total number of packets received per second.',
            },
            network_info: {
                irq_aggre_title: 'Interrupt Aggregation',
                offload_title: 'Offloading',
                queue_title: 'Queue',
                numa_core_title: 'Core ID',
                numa_core_NUMA: 'Interrupt NUMA Core Pinning',
                network_name: 'NIC Name',
                network_queue: 'NIC Queue',
                queue_num: 'Queues',
                irq_aggre: {
                    adaptive_rx: 'Specifies whether to enable dynamic aggregation for an RX queue.',
                    adaptive_tx: 'Specifies whether to enable dynamic aggregation for a TX queue.',
                    rx_usecs: 'Delay time of receiving an interrupt.',
                    tx_usecs: 'Delay time of transmitting an interrupt.',
                    rx_frames: 'Number of data packets transmitted before an interrupt is generated.',
                    tx_frames: 'Number of data packets received before an interrupt is generated.',
                },
                offload: {
                    rx_checksumming: 'Checksum of the received packets.',
                    tx_checksumming: 'Checksum of the transmitted packets.',
                    scatter_gather: 'Specifies whether to enable scatter/gather.',
                    TSO: 'When a system needs to send a large segment of data over the network, \
                    the computer needs to split the \
                    segment into multiple shorter segments so that the data can pass through all \
                    network devices on the network. \
                    This process is called segmentation. TCP Segmentation Offload (TSO), also \
                    named Large Segment Offload (LSO), \
                    enables the NIC to perform TCP segmentation calculation without involving the protocol stack. \
                    This reduces the CPU calculation workload and interruption frequency, and relieves the CPU load. \
                    If TSO is enabled for the NIC, rx-checksumming, tx-checksumming, and scatter-gather \
                    must also be enabled.',
                    UFO: 'UDP Fragmentation Offload (UFO) is a technology that offloads the fragmentation \
                    of UDP packets from the \
                    CPU to NICs. You are advised to enable this function if the NIC hardware supports it.',
                    LRO: 'Large Receive Offload (LRO) aggregates multiple received TCP data packets into a \
                    large data packet and \
                    transmits it to the network protocol stack for processing. This reduces the processing \
                    overhead generated by \
                    the upper-layer protocol stack and improves the system capability of receiving TCP data packets.',
                    GSO: 'Generic Segmentation Offload (GSO) delays data fragmentation until the data is \
                    sent to the NIC driver. \
                    In this case, the system checks whether the NIC supports fragmentation (such as TSO \
                        and UFO). If yes, the data \
                    is directly sent to the NIC. If no, the data is fragmented before being sent to the \
                    NIC. In this way, a large \
                    data packet needs to go through a protocol stack only once, instead of being divided \
                    into several data packets \
                    for separate going, thereby improving efficiency.',
                    GRO: 'Generic Receive Offload (GRO)\'s basic idea is similar to that of LRO. It overcomes \
                    some disadvantages of \
                    LRO and is more common. The subsequent drivers use the GRO API instead of the LRO API.',

                },

                numa_core: {
                    inter_id: 'Interrupt ID',
                    inter_info: ' Interrupt NUMA Core Pinning Info',
                    queue_send: 'Queue Core Binding Info',
                    queue_receive: 'RX Queue Core Binding Info',
                    network_name: 'Network Port Queue Name',
                    inter: 'Interrupt Core Pinning Info',
                    inter_info_tip: 'The ID of the bound CPU core is displayed in the information of core binding interrupt.',
                },

                nic_buff: {
                    nic_name: 'Port Name',
                    circle_buff: 'Ring Buffer',
                    rx_buff_size: 'Receive buffer size',
                    tx_buff_size: 'Transmit buffer size',
                },

            },
            raid_info: {
                raid_id: 'Card ID',
                raid_model: 'Controller Model',
                raid_size: 'Cache Size (MB)',
            },
            raid_level_info: {
                volume_name: 'Volume Name',
                volume_id: 'Volume ID',
                raid_id: ' RAID Controller Card ID',
                raid_level: 'RAID Level',
                volume_size: 'Logical Drive Strip Size',
                volume_read: 'Read Policy',
                volume_write: 'Write Policy',
                volume_cache: 'Cache Policy',
                cachecade: 'CacheCade Identifier',
            },
            firmware_info: {
                bios_version: 'BIOS Firmware Version',
                bmc_version: 'BMC Firmware Version',
                drive_version: 'Drive Firmware Version',
                nic_version: 'NIC Firmwware Version',

            },
            storage_msg_info: {
                storange_name: 'Device Name',
                storage_file: 'Prefetch Size of Drive Files (byte)',
                storage_file_suggest: 'File Size Read by The Hard Disk in Advance (byte)',
                storage_io: 'Storage I/O Scheduling Mechanism',
                storage_io_suggest: 'Drive Read/Write Rule'
            },
            file_info: {
                file_info_title: 'File Systems',
                file_name: 'Partition',
                file_type: 'File System Type',
                file_type_suggest: 'File System Type,',
                file_dot: 'Mount Point',
                file_dot_suggest: 'Mount Point',
                file_msg: 'Mount Information',
            },
            virtual_info: {
                virtual_os: 'VM Libvirt Version',
                virtual_config: 'KVM VM Configuration',
                virtual_docker: 'Docker Version'
            }

        },
        selct_title: 'System Configuration Panorama Analysis',
        analysisName: 'System configuration panorama analysis',
        create_title: 'New System Configuration Panorama Analysis Task',
        edit_title: 'Eidt System Configuration Panorama Analysis Task',
        type: 'Sampling Type',
        check_types: {
            hard: 'Hardware',
            soft: 'Software',
            env: 'Operating Environment'
        }

    },
    sys_summary: {
        unit: {
            entry: 'entry',
            rate: 'MT/s'
        },
        net_subsystem_text: 'Network Subsystem',
        net_subsystem_text_export: 'Network_Subsystem',
        mem_subsystem_text: 'Memory Subsystem',
        mem_subsystem_text_export: 'Memory_Subsystem',
        storage_subsystem_text: 'Storage Subsystem',
        storage_subsystem_text_export: 'Storage_Subsystem',
        panorama: {
            tip: {
                net_port_num: 'Ports',
                cpu_type: 'Model',
                core_num: 'Cores',
                max_freq: 'Maximum Frequency',
                current_frqu: 'Current Frequency',
                total_size: 'Total Capacity',
                dimm_num: 'DIMMs',
                null_num: 'Empty Slots',
                total_cap: 'Total Capacity',
                disk_overview: 'Drive Overview',
                circle_buff: `The receive/transmit ring buffer stores the receive/transmit descriptors \
                (addresses and sizes of SKB buffers\
                    ). You can judge the receive/transmit ring buffer configuration from the network port \
                    statistic metrics, such as \
                    rxdrop/s|txdrop/s and rxfifo/s|txfifo/s.
1. rxdrop/s|txdrop/s: indicates the number of received/transmitted packets dropped per second in the \
ring buffer because of a lack of \
space in memory.
2. rxfifo/s|txfifo/s: indicates the number of packets dropped per second by the NIC physical layer \
before the packets are sent to the \
ring buffer because the transmit I/O of the ring buffer is greater than the I/O processed by the kernel.
Insufficient ring buffer space is caused when the CPU fails to process interrupts in a timely manner.`,
            }
        },
        mem_subsystem: {
            mem_total_size: 'Total Capacity',
            dimm_num: 'DIMMs',
            null_num: 'Empty Slots',
            pswpin_sec: 'pswpin/s',
            pswpout_sec: 'pswpout/s',
            memused_percentage: '%memused',
            tip: {
                mem_name: 'DIMM',
                position: 'Location',
                dimm_size: 'Capacity',
                max_rate: 'Maximum Speed',
                allocated_rate: 'Configured Speed',
                dimm_type: 'Type'
            }
        },
        storage_subsystem: {
            disk_num: 'Total Drives',
            storage_tatol: 'Total Capacity',
            tip: {
                hard_disk: 'Drive',
                disk_type: 'Type',
                disk_model: 'Model',
                disk_size: 'Capacity'
            }
        },
        cpupackage_tabel: {
            NUMA_name: 'NUMA Balancing',
            virtual: 'Not supported by VMs and containers',
            node_type_not_supported: 'Not supported by node type',
            network_port: 'Network Ports',
            name: 'Port',
            standard_page: 'Standard Hugepage',
            partition: 'Swappiness',
            partitiondetail: 'Range: 0 to 100. If it is set to 0, the swap partition will be used only\
when the physical memory is used up. The value 100 indicates aggressive swapping, which allows \
data in the memory to be moved to the swap partition in time.',
            data_interval: 'Interval for Waking Up the pdflush Process to Refresh Dirty Data',
            idle: 'Minimum Free Memory Reserved',
            raid_config: 'RAID Configuration',
            Affinity: 'Drive Request Affinity Setting',
            line_up: 'Drive Request Queue Length',
            depth: 'Drive Queue Depth',
            IO: 'I/O Merging',
            raid_group: 'RAID Arrays',
            stroug_volume: 'Volumes',
            avgLoad: 'Average CPU Load',
            index: 'Metric',
            block: 'Block Device',
            interface: 'Ports',
            interface_error: 'Port Fault Statistics',
            interface_transmission: 'Port Transmission Data Volume Statistics',
            statistics: 'NUMA Memory Statistics',
            storyData: 'Storage Capacity',
            L3: 'Nodes Sharing L3 Cache',
            rate: 'Rate',
            sysPro: 'Overall Analysis',
            fill_name: 'File Systems',
            page_number: 'Number of Hugepages',
            portsFive: 'TOP5 ports',
            portsTen: 'TOP10 ports',
            delay: 'Latency',
            NUMAnode: 'NUMA Node',
            drive: 'Kernel Driver',
            model: 'Kernel Module',
            equipment: 'subsystem',
            indexTps: 'The indicator value is the average value in the collection period.',
            networkName: 'Port Name',
            networkNoData: 'VMs and containers do not support collection of NIC information.',
            queueNoData: 'Containers do not support collection of queue information.',
            aggregation: 'VMs and containers do not support interrupt coalescing.',
            numaNuclear: 'VMs and containers do not support binding of interrupts and NUMA cores.',
            raidNode: 'VMs and containers do not support RAID Controller Cards.',
            RaidNode: 'VMs and containers do not support RAID Level.',
            cpuDataConfig: 'Threshold Settings'
        },
        distributed: {
            Configuration: '  Hardware and Software Configuration',
            typicalConfig: 'The typical configuration is based on the test of the Kunpeng big data solution.',
            solution: 'The typical configuration is based on the test of the Kunpeng distributed storage solution.',
            database: 'The typical configuration is obtained by testing the Huawei Kunpeng database solution.',
            databaseType: 'Database Type:',
            correspond: 'hardware and software configuration for the test scenarios.',
            component: 'Components',
            compSceneConfig: 'Test Scenario Configuration',
            recommendation: 'Suggestions',
            hardConfig: 'Hardware Configuration',
            softConfig: 'Software Configuration',
            applicationType: 'Application Type:',
            componentInformation: 'Component Info:',
            applicationScenario: 'Application Scenario:',
            currentValue: 'Current Value',
            suggestedValue: 'Recommended Value',
            Suggestion: 'Suggestion',
            systemCongif: 'Configuration Item',
            componentConfig: ' Configuration Item',
            clickView: 'Click to view',
            typicalConfiguration: 'Typical Configuration',
            topdata: 'Top data',
            typicalConfiguration_export: 'Typical_configuration',
            topData_export: 'Top_data',
            ip_addr: 'IP',
            node_character: 'Node attributes',
            mem_size_total: 'Total memory size',
            per_mem_size: 'Single memory size',
            mem_speed: 'Memory Speed',
            running_process: 'Random access memory',
            node_list: 'Node listing',
            cpu_core_num: 'CPU core',
            searcHold: 'Please enter the component you want to search for',
            node: 'Node',
            no_scene_data: 'Failed to query the panoramic analysis information. The scenario data does not exist.'
        },
        tracing: {
            tag: 'Tracing Data',
            baseInfo: 'Basic Tracing Info',
            title: ' Sample Tracing Data',
            downloadTip: 'You can download and view tracing information through a browser for more detailed analysis.',
            downloadbtn: 'Download Tracing Data File',
            file: 'Tracing file',
            fileSize: ' File size',
            exampleTip: '*The figure shows a sample tracing data.',
        }
    },
    sys_res: {
        notSupprot: '</br>The Tracers option and its sub-options in the kernel hacking configuration \
        item are not enabled. \
        As a result, some functions of the perf tool are unavailable.',
        sum: {
            statistics: 'Statistics',
            collection: 'Collection & Platform Info',
            process: 'Process / Thread Switching',
            cycles: 'Cycles',
            elapsed: 'Sampling Duration (s)',
            instrutions: 'Instructions',
            ipc: 'IPC',
            os: 'OS',
            computer_name: 'Computer Name',
            result_size: 'Result Size (MB)',
            collection_start: 'Start Time',
            collection_end: 'End Time',
            no: 'NO.',
            task: 'Task',
            thread_name: 'Thread Name',
            wait_duration: 'Wait Duration',
            detail: 'Click the color block to view the thread switching details',
            clickPidTid: 'Click the color block to lock the process or thread',
            switches: 'Switchovers',
            running_time: 'Running Time (ms)',
            average_delay: 'Average Scheduling Delay (ms)',
            max_scheduling: 'Maximum Scheduling Time (ms)',
            max_delay: 'Max. Scheduling Delay (ms)',
            max_delay_at: 'Max. Delay (s)',
        },
        selct_title: 'System Resource Scheduling Analysis',
        analysisName: 'System resource scheduling analysis',
        create_title: 'New System Resource Scheduling Analysis Task',
        edit_title: 'Edit System Resource Scheduling Analysis Task',
        tab: {
            numa: 'NUMA Node Switch',
            cpu: 'CPU Scheduling',
            pro: 'Process/Thread Scheduling'
        },
        cpuStatusTime: 'Displays the CPU core status by time',
        cpuStatusPercentage: 'Displays the percentage of the time duration of a CPU core in different status',
        cpuStatusPosition: 'Displays the CPU usage of the selected processes/threads',
        tidPidStatusTime: 'Displays the process/thread status by time',
        tidPidStatusPercentage: 'Displays the percentage of the time duration of the process/thread \
        in different status',
        selectPidTid: 'Selected processes/threads',
        lockPidTid: 'Locked processes/threads',
        core: 'Core',
        startTime: 'Start Time',
        processName: 'Process Name',
        PID: 'PID',
        selectCPU: 'Select CPU Core',
        all: 'All',
        applicationSpecific: 'Application-specific',
        noDataIsCollected: 'No data is collected',
        selectTime: 'Select Time',
        sort: 'Sort',
        selectTIDAndPid: 'Process/Thread',
        scheduleDelay: 'Scheduling delay',
        selectTID: 'Select TID',
        numaLegend: 'NUMA Node Configuration Info',
        numaSwitch: 'NUMA Node Switchover',
        numaColumn: {
            thread_name: 'Thread Name',
            task: 'Task',
            swtich: 'Switchovers',
            action: 'Operation',
        },
        swtichDetail: 'Switchover Details',
        conversion: 'Switchover Path',
        frequency: 'Switches',
        seeDetails: 'View',
        selecThread: 'Filter processes/threads',
        lockedThread: 'Locked processes/threads',
        viewSwtichDetail: 'View',
        selectedThread: 'Selected processes/threads',
    },
    process: {
        tabName: 'Process Analysis Tasks',
        sum: {
            pid: 'Process ID/Thread ID',
            command: 'Command corresponding to the task.',
            cpu: {
                usr: 'CPU usage of the task in the user space.',
                sys: 'CPU usage of the task in the kernel space.',
                wait: 'CPU usage of the task in the I/O waiting state.',
                cpu: 'CPU usage of the task.',

            },
            mem: {
                min: 'Number of page fault occurrences per second, that is, number of page fault \
                occurrences generated when a \
                virtual memory address is mapped to a physical memory address, and no page needs \
                to be loaded from a hard disk.',
                maj: 'Number of main page faults per second. When the virtual memory address is \
                mapped to the physical memory \
                address, the corresponding page is in the swap memory. Such page faults are major \
                page faults, which are generated \
                when the memory is insufficient and need to be loaded from the hard disk.',
                vsz: 'Size of the virtual memory used by a task, in KB.',
                rss: 'Resident Set Size: indicates the size of the physical memory allocated to the task.',
                mem: 'Memory usage of a task.',

            },
            disk: {
                rd: 'Volume of data that a task reads from a hard disk per second, in KB.',
                wr: 'Volume of data written by a task to a hard disk per second, in KB.',
                iodelay: 'I/O I/O delay (in clock cycles), including the I/O waiting time and I/O insertion end time.',
            },
            context: {
                cswch: 'Indicates the number of context changes per second in the active task. Generally, \
                the context changes are \
                caused because the task cannot obtain required resources. For example, when system \
                resources such as I/O and memory \
                resources are insufficient, a proactive task context switchover occurs.',
                nvcswch: 'Number of context switch times per second of a passive task. Generally, a \
                task is forcibly scheduled by the \
                system because the time slice is due or the process is preempted by a process with a \
                higher priority. As a result, \
                context switch occurs. For example, when a large number of processes are contending \
                for CPU, passive task context \
                switching is likely to occur.',
            },
            syscall: {
                syscall_title: 'System Call',
                time: 'Percentage of the system CPU time.',
                seconds: 'Total system CPU time, expressed in seconds.',
                usecs: 'Average system CPU time for each call, expressed in milliseconds.。',
                calls: 'Number of system calls during the collection.	',
                errors: 'Number of system calling failures during the collection.',
                syscall: 'System call name.',

            }
        },
        context: 'Context switch',
        selct_title: 'Process/Thread Performance Analysis',
        analysisName: 'Process/Thread performance analysis',
        create_title: 'New Process/Thread Performance Analysis Task',
        edit_title: 'Edit Process/Thread performance Analysis Task',
        label: {
            pid: 'PID',
            trace: 'System Call Tracing',
            thread: 'Thread Collection'
        },
        cpu: 'CPU',
        mem: 'Memory',
        disk: 'Storage I/O',
        pid: 'PID',
        tread: 'Thread Collection',
        trace: 'System call tracing',
        trace_tip: 'System call tracing is not recommended for production environments because it greatly reduces the \
        system performance when some applications are frequently called.',
        disable: 'disable',
        enable: 'enable',
        selectPid: 'Select PID',
        obtainingTheCmdline: 'Obtaining...',
        intervalTip: 'The sampling interval must be less than or equal to half of the sampling duration.',
        intervalTip1: 'The sampling interval cannot exceed half of the sampling duration or exceed 10 seconds.'

    },
    mission_modal: {
        selectTemplate: 'Select Template',
        importTemplates: 'Import Template',
        saveTemplates: 'Save as Template',
        templateName: 'Template Name',
        inputTemplateName: 'Please enter a template name',
        confirm: 'OK',
        cancle: 'Cancel',
        startNow: 'Start Now',
        cProgramAnalysis: 'Hotspot Function Analysis',
        javaMixedModeAnalysis: 'Java Program Analysis',
        processAnalysis: 'Process/Thread performance Analysis',
        sysPowerAllAnalysis: 'System Performance Panorama Analysis',
        sysConfigAnalysis: 'System Configuration Panorama Analysis',
        resourceAnalysis: ' System Resource Scheduling Analysis',
        syslockAnalysis: 'Locks and Waits Analysis',
        memAccessAnalysis: 'Memory Access Analysis',
        templateValid: 'The template name is a string of 6 to 16 characters, allowing letters, digits, \
        periods (.), and underscores (_). It must start with a letter.',
        successKeepTemplate: 'Template saved successfully',
        missionTemplate: 'Task Templates',
        delete: 'Delete',
        notice: 'Are you sure you want to delete the template?',
        confirmDeleteTemp: 'A deleted template cannot be recovered. Exercise caution when performing this operation.',
        cProcess: {
            taskname: 'Task Name',
            analysis_type: 'Analysis Type',
            application: 'Application',
            app_path: 'Application Paths',
            app_params: '	Application Parameters',
            duration: 'Sampling Duration (s)',
            pid: 'PID',
            ready_cpu_num: 'CPU Mask',
            cpu_interval: 'CPU Sampling Interval (ms) ',
            file_path: 'Binary/Symbol File Path',
            source_path: 'C/C++ Source File Path',
            processName: 'Process Name'
        },
        javaMix: {
            taskname: 'Task Name',
            analysis_type: 'Analysis Type',
            application: 'Application',
            app_params: '	Application Parameters',
            cpu_interval: '	CPU Sampling Interval (ms)',
            pid: 'PID/TID',
            duration: 'Sampling Duration (s)',
            java_path: 'Java Source File Path',
        },
        process: {
            taskname: 'Task Name',
            analysis_type: 'Analysis Type',
            interval: 'Sampling Interval (s)',
            duration: 'Sampling Duration (s)',
            task_params: 'Sampling Type',
            pid: 'Specify PID',
            thread: 'Thread Collection',
            straceAnalysis: 'System call tracing',
        },
        panoramic: {
            taskname: 'Task Name',
            analysis_type: 'Analysis Type',
            task_params: 'Sampling Type',
            interval: 'Sampling Interval (s)',
            duration: 'Sampling Duration (s)',
        },
        sysConfig: {
            taskname: 'Task Name',
            analysis_type: 'Analysis Type',
            task_params: 'Sampling Type',
        },
        sysSource: {
            taskname: 'Task Name',
            analysis_type: 'Analysis Type',
            application: 'Application',
            app_params: 'Application Parameters',
            file_path: 'Binary/Symbol File Path',
            source_path: '	C/C++ Source File Path',
            duration: '	Sampling Duration (s)',
            pid: 'PID',
            processName: 'Process Name'
        },
        syslock: {
            taskname: 'Task Name',
            analysis_type: 'Analysis Type',
            application: 'Application',
            app_params: '	Application Parameters',
            cpu_interval: 'Sampling Interval (ms)',
            pid: 'PID',
            duration: 'Sampling Duration (s)',
            function: 'Function Name',
        },
        memAccess: {
            taskname: 'Task Name',
            analysis_type: 'Analysis Type',
            interval: 'Sampling Interval (s)',
            duration: 'Sampling Duration (s)',
            task_params: 'Sampling Type'
        },
        lockSummary: {
            lock_and_wait_info: 'Lock and Wait Information',
            task_name: 'Task Name',
            module_name: 'Module Name',
            function_name: 'Function Name',
            call_times: 'Call Times',
            call_site: 'Call Site',
            source_code_name: 'Source Code File Name',
            row_num: 'Line No',
            lockWait: 'Lock and Wait Task',
            call_site_info: 'Call Site Information',
            timing: 'Timestamp',
            call_site_module_nama: 'Call Site Module Name',
            call_site_function_nama: 'Call Site Function Name',
            call_site_source_code_name: 'Call Site Source Code File Name',
            call_site_row_num: 'Call Site Row Number',
            advancced_search: 'Advanced Search',
            select_task: 'Select task',
            task_time: 'Task Time(s)',
            filname: 'Symbol File Path',
            source_path: 'C/C++ Source File Path',
            common_term_task_crate_c_bs_tip: 'Absolute path of the symbol file on the server. \
            This parameter is optional.',
            common_term_task_crate_c_source_tip: 'Absolute path of the C/C++ source file on the server. \
            This parameter is optional.',
            point_no_data: 'No data available. Click a task/module/function name to view the call site information.',
        },
        hpc: {
            mission_create: {
                bandwidth: 'Memory bandwidth',
                instr_dis: 'Instruction distribution',
                analysis_type: 'Sampling Type',
                collectionType: 'Collection Type',
                MPIDirectory: 'Directory for storing MPI commands',
                selectNode: 'Selecting the node where mpirun is running',
                runNodes: 'mpirun Node',
                rankNodes: 'Configuring the Number of Running Ranks of Nodes',
                rankNum: 'Rank Quantity',
                summary: 'Summary',
                openMpParams: 'OpenMP Parameters',
                openMpParams_validate: 'Incorrect OpenMP parameter format.',
                openMpParams_tip:
                    'Set OpenMP environment variables. Use spaces to separate variables, for example, \
                OMP_NUM_THREADS=32 OMP_PROC_BIND=88.',
                mpi_env_dir: 'Directory Of MPI Command',
                mpi_env_dir_tip: 'Enter the Directory Of MPI Command',
                mpiParams: 'MPI Parameter',
                app_params: 'Application Parameters',
                app_path: 'Application Paths',
                rank: 'Rank',
                rankNums: 'Number of Ranks',
                nodeRange: 'Node Range',
                allNodes: 'All nodes',
                specifiedNode: 'Specified node'
            },
            rank: 'Rank',
            summary: 'Summary',
            basicData: 'Basic Data',
            hpcTarget: 'HPC Target',
            mpi: 'MPI',
            openMp: "OpenMP",
            mpi_env_dir: 'Directory Of MPI Command',
            interval: 'Sampling Interval (ms)',
            duration: 'Sampling Duration (s)',
            help: '',
            label: 'Sampling Type',
            all: 'Summary',
            memory: 'Memory bandwidth',
            orders: 'Instruction distribution',
            top_down: 'HPC Top-Down',
            ram: {
                memoryBandwidth: 'Memory Bandwidth',
                aver: 'Average DRAM Bandwidth',
                read: 'Read Bandwidth',
                write: 'Write Bandwidth',
                insideSocket: 'Intra-Socket Bandwidth',
                crossSocket: 'Cross-Socket Bandwidth',
                ratio: 'L3 By-Pass Rate',
                miss_ratio: 'L3 Miss Rate',
                use_ratio: 'L3 Usage'
            },
            instruction: {
                instructionDistribution: 'Instruction Distribution',
                memory: 'Memory',
                load: 'Load',
                store: 'Store',
                integer: 'Integer',
                float: 'Floating Point',
                advanced: 'Advanced SIMD',
                crypto: 'Crypto',
                branches: 'Branches',
                immediate: 'Immediate',
                indirect: 'Indirect',
                return: 'Return',
                barriers: 'Barriers',
                instruct: 'Instruction Synchronization',
                dataSyn: 'Data Synchronization',
                datamem: 'Data Memory',
                notr: 'Not Retired',
                other: 'Other',
                tips: {
                    memory: 'Percent of memory load/store executed instructions',
                    load: 'Percent of memory reading executed instructions',
                    store: 'Percent of memory writing executed instructions',
                    integer: 'Percent of integer data processing executed instructions',
                    float: 'Percent of floating-point data processing executed instructions',
                    branches: 'Percent of branch executed instructions',
                    advanced: 'Percent of Advanced SIMD data processing executed instructions',
                    crypto: 'Percent of cryptographic instructions, except PMULL and VMULL',
                    immediate: 'Percent of immediate branch executed instructions',
                    indirect: 'Percent of indirect branch executed instructions',
                    return: 'Percent of return executed instructions',
                    barriers: 'Percent of barriers executed instructions',
                    instructions: 'Percent of instruction synchronization barrier executed instructions',
                    data: 'Percent of data synchronization barrier executed instructions',
                    data_mem: 'Percent of data memory barrier executed instructions',
                    not: 'Percent of speculatively executed, but not retired instructions'
                }
            },
            basic: {
                run_time: 'Running Time',
                serial_time: 'Serial time',
                parallel_time: 'Parallel Time',
                unbalance_time: 'Imbalance Time',
                exe_time: 'Execution Time',
                cpi: 'CPI',
                use_rate: 'CPU Usage',
                bandwith: 'Average DRAM Bandwidth',
                reade_bandwith: 'Read Bandwidth',
                write_bandwith: 'Write Bandwidth',
            },
            hpc_target: {
                memory_width: 'Memory Bandwidth',
                read_bandwith: 'Read Bandwidth',
                ava_bandwith: 'Average DRAM Bandwidth',
                write_bandwith: 'Write Bandwidth',
                out_socket_bandwith: 'Cross-Socket Bandwidth',
                inner_socket_bandwith: 'Intra-Socket Bandwidth',
                l3_rate: 'L3 Miss Rate',
                l3_missing: 'L3 By-Pass Rate',
                l3_use: 'L3 Usage',
                directives: 'Instruction Distribution',
                memory: 'Memory',
                load: 'Load',
                store: 'Store',
                branch: 'Branches',
                other: 'Other',
                hpc_top_down: 'HPC Top-Down',
                event_name: 'Event Name',
                event_rate: 'Event Ratio',
                pmu: 'Original PMU Events',
                core_pmu: 'Core-related PMU Events',
                uncore_pmu: 'Uncore-related PMU Events',
                event: 'Event',
                count: 'Count',
                open_mp: 'OpenMP Runtime Metrics',
                exe_time: 'Execution Time (s)',
                unbalance_time: 'Imbalance Time (s)',
                unbalance_rate: 'Imbalance Ratio (%)',
                serial_time: 'Serial time',
                parallel_time: 'Parallel Time',
                rank: 'rank'
            }
        },
    },
    lock: {
        selct_title: 'Locks and Waits Analysis',
        analysisName: 'Locks and Waits Analysis',
        create_title: 'New Locks and Waits Analysis',
        edit_title: 'Edit Locks and Waits Analysis',
        timing: 'Call Details',
        tip: {
            select_function: 'Select the preset glibc lock and wait function name from the drop-down list box.',
            function: 'Name of the non-standard lock and wait function to be analyzed.',
        },
        lock_input_place: 'Use commas (,) to separate multiple function names',
        form: {
            functions_label: 'Standard Function',
            custom_functions_label: 'Customized Lock and Wait Function',
            custom: 'Custom'
        },
        selectedTask: 'Selected Tasks: ',
    },
    micarch: {
        cycles: 'Clock Cycles',
        instructions: 'Instructions',
        timing: 'Time Sequence Information',
        details: 'Details',
        advance_params: 'Advanced Parameters',
        selct_title: 'Microarchitecture Analysis',
        create_title: 'Create Microarchitecture Analysis Task',
        edit_title: 'Edit Microarchitecture Analysis Task',
        summury_mode: 'Summary',
        detail_mode: 'Detail',
        summury_mode_tip: ' Collects only the PMU count and displays the top-down model data. \
        The call stack information is not collected.',
        detail_mode_tip: 'Collects both the PMU count and call stack information and displays \
        the detailed analysis data.',
        analysis_tip: 'To ensure accurate analysis results, select only one analysis indicator.',
        typeItem_all: 'All',
        typeItem_user: 'User Mode',
        typeItem_kernel: 'Kernel Mode',
        cpu_kernel: 'CPU Cores to Be Sampled',
        simpling_delay: 'Sampling Delay (s)',
        simpling_delay_tip: 'The sampling starts after the specified delay. This parameter is used \
        to ignore the program startup \
        analysis, warm up the sampling program, and eliminate sampling delay caused by factors such \
        as environment detection.',
        badSpeculation_tip: 'Pipeline resource waste due to incorrect instruction predictions.',
        frontEndBound_tip: 'Front-End is the processor portion where the instruction fetch unit fetches \
        instructions and converts \
        them into uOps for the Back-End pipeline execution. This metric reflects the ratio of unutilized \
        processor Front-End resources.',
        resourceBound_tip: 'Back-End is the processor portion that performs out-of-order dispatch and \
        execution of uOps and returns \
        results. Resource Bound is a subclass of Back-End Bound. It reflects pipeline stalls that occur \
        when uOps are dispatched to an \
        out-of-order execution scheduler due to insufficient resources. The Kunpeng 916 processor does \
        not support this metric.',
        coreBound_tip: 'Back-End is the processor portion that performs out-of-order dispatch and \
        execution of uOps and returns results. \
        Core Bound is a subclass of Back-End Bound. It reflects the ratio of performance bottlenecks \
        due to insufficient \
        CPU execution unit resources.',
        memoryBound_tip: 'Back-End is the processor portion that performs out-of-order dispatch and \
        execution of uOps and \
        returns results. Memory Bound is a subclass of Back-End Bound. It reflects pipeline stalls due \
        to data read/write waiting.',
        label: {
            simpling: 'Sampling Mode',
            type: 'CPU Type',
            analysis: ' Analysis Metrics',
            typeItem: 'Sampling Range',
        },
        eventName: 'Event Name',
        percentage: 'Event Percentage',
        suggestions: {
            title: 'The percentage of {0} events is {1}%.',
            des: 'Description：',
            possibleCause: 'Possible Cause：',
            solution: 'Solution：',
        },
        timingTable: {
            tooltip: {
                clickColorDlock: 'Click a color stripe to view the sub-indicators of an indicator',
                timestamp: 'Timestamp',
            }
        },
    },
    ddr: {
        tabCacheTitle: 'Cache Access Details',
        accessAnalysisType: 'Access Analysis Type',
        tabCatch: 'Cache Access',
        tabDdr: 'DDR Access',
        selct_title: 'Memory Access Analysis',
        analysisName: 'Memory access analysis',
        create_title: 'New Memory Access Analysis Task',
        miss_event: 'Miss event',
        indicatorType: 'Indicator Type',
        llcMiss: 'Ratio of memory request misses in the LLC.',
        tlbMiss: 'Ratio of memory accesses or instruction fetches by the CPU where no virtual-to-physical \
        mapping is found in the TLB.',
        remoteAccess: 'Number of cross-CPU DRAM accesses.',
        longLatencyLoad: 'Ratio of cross-CPU DRAM accesses where the access latency exceeds the preset \
        minimum latency.',
        analysisMode: 'Analysis Mode',
        memoryAccessStatistics: 'Memory access statistics',
        samplingInterval: 'Sampling Interval',
        instructions: 'instructions',
        leftParenthesis: '(',
        rightParenthesis: ')',
        minimumDelay: 'Minimum Delay',
        advancedParameters: 'Advanced Parameters',
        cpuToBeSamples: 'CPU Cores to Be Sampled',
        samplingRange: 'Sampling Range',
        missEventStatistics: 'Miss Event Statistics',
        timeSequence: 'Time Sequence',
        typeName: '',
        details: 'Details',
        misses: 'Misses',
        edit_title: 'Edit access analysis',
        collectionDelay: 'Sampling Delay',
        douhao: ', ',
        label: {
            interval: 'Sampling Interval (s)',
            duration: 'Sampling Duration (s)',
            type: 'Sampling Type',
            info: 'The maximum sampling duration is 300 seconds.'
        },
        types: {
            ddr_access: 'Cache access',
            cache_access: 'DDR access'
        },
        catchTypeSelectTitle: 'Type',
        catchPageTitle1: 'L1C/L2C/TLB Access Bandwidth and Hit Rate',
        catchPageTitle2: 'L3C Access Bandwidth and Hit Rate',
        ddrIdselectTitle: 'DDR Channel ID',
        DDRpageTitle1: 'DDR Access Bandwidth',
        DDRpageTitle2: 'DDR Access',
        noSupport: 'This function is not supported by the OS. Check whether the kernel version is \
        compatible with the software.',
        noSupport1616: 'This function is not supported by the OS.',
        chart: {
            bandwith: 'Bandwidth (MB/s)',
            hitrate: 'Hit Rate',
            hitbandwith: 'Hit Bandwidth(MB/s)',
            acessscount: 'Total Access',
            localaccess: ' Local DDR Accesses ',
            spandie: 'Cross-die DDR accesses',
            spanchip: 'Cross-chip DDR accesses'
        },
        select: {
            L1D: 'L1D access',
            L1I: 'L1I access',
            L2D: 'L2D access',
            L2I: 'L2I access',
            L2_TLB: 'L2 TLB access',
            L2D_TLB: 'L2D TLB access',
            L2I_TLB: 'L2I TLB access',

            L3C_RD_IN: 'In-die L3C read',
            L3C_WR_IN: 'In-die L3C write',
            L3C_RD_OUT: 'Cross-die L3C read',
            L3C_WR_OUT: 'Cross-die L3C write',

            L3C_RD: 'L3C read',
            L3C_WR: 'L3C write',

            DDR_RD: 'DDR read',
            DDR_WR: 'DDR write'
        }
    },
    storageIO: {
        callstack: 'Collect call stack',
        statistical: 'Statistical Period (s)',
        apis_title: 'I/O APIs',
        disk_title: 'Drive I/O',
        iodistribution: 'I/O Data Block Distribution',
        notdisplay: 'Do not display automatically',
        tips: 'Drag a time segment to view details.',
        apis_tips: 'View the number of drive I/O operations, IOPS, data size, throughput, latency, and queue depth.',
        diskio_tips: 'View information about the process to which the invoked function belongs, \
        return values in the selected period, and execution time.',
        times: 'Times (%)',
        summury: {
            read: 'Read',
            write: 'Write',
            data_size: 'Data Size Distribution (KB)',
            io_delay: 'I/O Latency Distribution (us)',
            d2c_io_delay: 'D2C I/O Latency Distribution',
            i2d_io_delay: 'I2D I/O Latency Distribution',
            viewDetails: 'View Details',
            roprateTime: 'Number of read operations',
            woprateTime: 'Number of write operations',
            riops: 'Read IOPS',
            wiops: 'Write IOPS',
            rdataSize: 'Read Data Size (MB)',
            wdataSize: 'Write Data Size (MB)',
            rrate: 'Read Throughput (MB/s)',
            wrate: 'Write Throughput (MB/s)',
            rdelay: 'D2C Read latency C',
            wdelay: 'D2C Write latency (ms)',
            i2drdelay: 'I2D Read latency (ms)',
            i2dwdelay: 'I2D Write latency (ms)',
            d2c_rdelay: 'D2C Read latency (ms)',
            d2c_wdelay: 'D2C Write latency (ms)',
            i2d_rdelay: 'I2D Read latency (ms)',
            i2d_wdelay: 'I2D Write latency (ms)',
        },
        ioapis: {
            siftPid: 'Filter Process/Function',
            Invoking_times: 'Number of Calls',
            average_time: 'Average Execution Time (s)',
            total_time: 'Total Execution Time (s)',
            average_time_s: 'Average Time(us)',
            total_time_s: 'Total Time(us)',
            time_ratio: 'Execution Time Ratio (%)',
            time_title: 'Time Period',
            times: '(Times)',
            time1: 'Times',
            kb: '(KB)',
            mb: '(MB/s)',
            us: '(us)',
            pid: 'PID',
            cpid: 'Subprocess ID/PID',
            pidName: 'Process Name',
            functionName: 'Function Name',
            sysTimes: 'Number of Calls',
            precent_time: 'Execution Time Ratio(%)',
            time: 'Time',
            params: 'Parameter List',
            return: 'Return Value',
        },
        diskio: {
            siftDEV: 'Filter DEV',
            object: 'Object',
            indicator: 'Indicator',
            throughput: 'Throughput',
            throughput1: 'Throughput(MB/s)',
            queueDepth: 'Queue Depth',
            oprateTimes: 'Number of Operations',
            dataSize: 'Data Size',
            dataSize1: 'Data Size(MB)',
            delayTime: 'D2C Delay',
            delayTimeI2d: 'I2D Delay',
            delayTime1: 'D2C Delay (ms)',
            delayTime1I2D: 'I2D Delay (ms)',
            top_ior: 'Top 5 read operations',
            top_iow: 'Top 5 writes operations',
            top_iopsr: 'Top 5 read IOPS',
            top_iopsw: 'Top 5 write IOPS',
            top_datar: 'Top 5 Read Data Sizes',
            top_dataw: 'Top 5 Write Data Sizes',
            top_thr: 'Top 5 read throughput',
            top_thw: 'Top 5 Write Throughput',
            top_delayr: 'Top 5 D2C Read Latency',
            top_delayw: 'Top 5 D2C Write Latency',
            top_delayr_i2d: 'TOP5 I2D Read Latency',
            top_delayw_i2d: 'TOP5 I2D Write Latency',
            top_delayr1: 'Read Latency',
            top_delayw1: 'Write Latency',
            top_datar1: 'Read Data Sizes',
            top_dataw1: 'Write Data Sizes',
            top_thr1: 'read throughput',
            top_thw1: 'Write Throughput',
            top_queue: 'Top 5 queue depth',
            ioperttion: 'I/O operation details',
            operateType: 'Operation Type',
            events: 'Events',
            blocks: 'Number of blocks',
            startBlockNo: 'Start Block No.',
            endBlockNo: 'End block No.',
            details: '  Details',
            block_dis: 'Data Block Distribution',
            read_block: 'Read data block distribution',
            write_block: 'Write data block distribution',
            delay_dis: 'D2C Delay Distribution',
            read_delay: 'D2C Read Latency distribution',
            write_delay: 'D2C Write Latency distribution',
            delay_dis_I2D: 'I2D Delay Distribution',
            read_delay_I2D: 'I2D Read Latency distribution',
            write_delay_I2D: 'I2D Write Latency distribution',
            interval: 'interval',
            times: 'Times (%)',
        },
        mission_create: {
            mission_name: 'Task Name',
            duration: 'Sampling Duration (s)',
            statistical: 'Statistical Period (s)',
            collection_size: 'Size of the Collected File(MiB)',
            stack: 'Collect Call Stacks',
            node_config: 'Configure Node Parameters',
            order: 'Scheduled Startup',
            process_name: 'Process Name',
            app_dir: 'Application Paths',
            app_params: 'Application Parameters',
            collect_way: 'Sampling Mode',
            cellect_time: 'Sampling Duration',
            cellect_date: 'Sampling Date',
        },
    },
    log_config: {
        config_key: 'Configuration Item',
        value: 'Value',
        time: 'Operation Log Aging Time (days)',
        log_tip: 'The operation log aging time is 30 to 180 days.',
    },
    function: { // 函数页签
        noChildren: 'No data.No {1} is collected for {0}.',
    },

    // 工程相关
    project: {
        newPro: 'Create a Project',
        modifyPro: 'Modify a Project',
        projectInformation: 'Project Information',
        scenario: 'Scenario',
        component: 'Component',
        selectAComponent: '-Select-',
        applicationScenario: 'Application Scenario',
        selectAnApplicationScenario: '-Select-',
        storageType: 'Storage Type',
        selectStorageType: '-Select-',

        project: 'Project',
        wrongFileType: 'Wrong file type.',
        fileExceedMaxSize: 'The file exceeds 1 GB.',
        task: 'Task',
        importedProject: 'It is an import project.',
        importTask: 'Import Task',
        exportTask: 'Export Task',
        exportSucceeded: 'Exported',
        packingSucceeded: 'Packaging successful',
        downloadTask: 'Download Task',
        unzipData: 'Decompress data',
        filePath: 'File Path',
        totalFileSize: 'File Size',
        retry: 'Retry',
        importAndExportTask: 'Import/Export Task Management',
        details: 'Details',
        endTime: 'End Time',
        toBeExported: 'To be exported',
        exportTaskStartFailed: 'Task failed to start',
        exporting: 'Exporting',
        exportFailed: 'Export failed',
        exportDataSucceeded: 'Data exported successfully.',
        packageTask: 'Pack task',
        packaging: 'Packaging',
        packagingFailed: 'Packaging failed',
        uploading: 'Uploading',
        uploadFailed: 'Upload failed',
        uploaded: 'Uploaded',
        decompressing: 'Decompressing',
        decompressionFailed: 'Decompression failed',
        decompressed: 'Decompressed',
        verificationFailed: 'Verification failed',
        toBeImported: 'To be imported',
        importTaskStartFailed: 'Task failed to start',
        importing: 'Importing',
        importFailed: 'Import failed',
        importingTaskInfo: 'Importing task info',
        importTaskFailed: 'Task info import failed',
        imported: 'Imported',
        viewTask: 'View',
        taskList: 'Task List',
        packageData: 'Package data',
        closeImportOrExportTaskTip: 'The task window is closed. You can view details on the \
        Import/Export Task page in Settings.',
        createExportTaskTip: 'Only the projects and tasks created by the current user can be exported.',
        selectProject: 'Project',
        selectProjectPlaceholder: 'Select a project.',
        selectTask: 'Task',
        selectTaskPlaceholder: 'Select a task.',
        downloadExportTaskTip: 'Ensure that the compressed file is complete when importing data for analysis.',
        createImportTaskProjectPlaceholder: 'The imported project name is used if left blank.',
        createImportTaskTaskPlaceholder: 'The imported task name is used if left blank.',
        importMode: 'Import Mode',
        uploadFile: 'Upload file',
        specifyFilePath: 'Specify file path',
        fileStoragePath: 'File Path',
        fileStoragePathPlaceholder: 'Enter the full path of the file on the server.',
        browse: 'Browse',
        viewDeletedTaskTip: 'The task has been deleted. Are you sure you want to decompress \
        the data to create the task again?',
        deleteTaskTip: 'If the task is deleted, all data related to the task will be deleted. \
        Exercise caution when performing  \
        this operation.',
        bigDataInfo: 'Collects and analyzes common CPU, memory, storage I/O, and network I/O \
        resources on a server, and provides  \
        typical configurations for big data solutions and top data statistics.',
        distributedStorageInfo: 'Collects and analyzes common CPU, memory, storage I/O, \
        and network I/O resources on servers,  \
        and provides typical configurations for distributed storage solutions and top data statistics.',
        generalScenarioInfo: 'Collects and analyzes the CPU, memory, storage I/O, and \
        network I/O resources on a server and  \
        provides top data statistics.',
        projectName: 'Project Name',
        taskName: 'Task Name',
    },

    // 节点相关
    node: {
        nodeList: 'Node List',
        selectNode: 'Select Nodes',
        status: 'Status',
        online: 'Online',
        offline: 'Offline',
        abnormal: 'Some nodes are abnormal.',
    },

    // 节点管理
    plugins_sysperf_message_nodeManagement: {
        confirmFingerprint: 'Confirm Fingerprint',
        confirmFingerprint_tip: 'The fingerprint is the SSH public key fingerprint of the server where the analysis assistant software is to be deployed.',
        nodeManagement: 'Node Management',
        addNode: 'Add',
        nodeName: 'Node Name',
        nodePort: 'SSH Port',
        installPath: 'Installation Path',
        adding: 'Adding',
        deleting: 'Deleting',
        updating: 'Updating',
        mismatch: 'Version unmatched',
        runDirectory: 'Run Directory',
        runDirectoryTip: 'Contains the files (including executable programs,configuration files, \
            and data files) required for tool running',
        logDirectory: 'Log Directory',
        logDirectoryTip: 'Contains the logs generated during the tool running process',
        validation: {
            nodeName: 'The node name can contain only letters, digits, periods (.), hyphens (-), and underscores (_). \
            It is 6 to 32 characters long and must start with a letter.',
            username: 'The user name is 1 to 32 characters long.',
        },

        nodeIp: 'IP Address',
        authenticationMode: 'Authentication Mode',
        passwordAuth: 'Password authentication',
        password: 'Password',
        private_key_auth: 'Key authentication',
        keyFile: 'Private Key File',
        passphrase: 'Passphrase',

        modifyNode: 'Modify Node',

        deleteNode: 'Delete Node',
        deleteNodeTip: 'A deleted node {0} will not be analyzed. However, you can still view \
        the historical analysis report of this node.',

        deleteNodeFailed: 'Failed to Delete the Node',
        deleteNodeFailedTip: 'The node is being used by the following projects. Modify the projects \
        before performing this operation.',
        rootAuth: 'root Password',
        nodenamePlaceholder: 'The node IP address is used by default.',
        installInfo: 'SSH Settings',
        rootPlaceholder: 'Enter the password of the root user',
        tip: 'Information',
        modalTip: 'You are logging in to the node as the root user. Ensure the SSH channel security. \
        You can also log in as a common user.',
        sshConfirmText: 'Check the fingerprint of node {0}.',
        sshUseRootConfirmText: `You are logging in to the node as the root user. Ensure the SSH channel security.
            You can also log in as a common user.Check the fingerprint of node {0}.`,
        hashType: 'Hash Type',
        keyType: 'Key Type',
        fingerPrint: 'FingerPrint',
        continue: 'Continue',
        non_root: 'If you log in as a non-root user, enter the password of the root user to switch \
        to the root user and perform operations.',
        viewLog: 'View Log',
        installationLog: 'Node {0} Installation Log',
        copyAll: 'Copy All',
        batchImport: 'Batch Import',
        batchDelete: 'Batch Delete',
    },
    ddr_summury: {
        sys_info: 'System Information',
        linux_os: 'Linux Kernel Version',
        cpu_type: 'CPU Type',
        percent: 'Percentage',
        average: 'Average',
        showAverage: 'View Average',
        averageTarget: 'Analysis Object',
        tabCacheTitle: 'Cache Access Details',
        tabDdrTitle: 'DDR Access Details',
        filterTarget: 'Filter Object/Indicator',
        poupTitle: 'Object',
        cpu: 'CPU',
        landWidth: 'Bandwidth (MB/s)',
        landWidthTitle: 'Bandwidth',
        getPerce: 'hit ratio',
        metricTitle: 'Metrics',
        ddr_access: 'DDR Access',
        cache_access: 'Cache Access',
        tlb: 'L1C/L2C/TLB Access Bandwidth and Hit Rate',
        l3c: 'L3C Access Bandwidth and Hit Rate',
        type: 'Type',
        brandwidth: 'Bandwidth (MB/s)',
        hitrate: 'Hit Rate',
        acc_hitBrandWidth: 'Access Hit Bandwidth (MB/s)',
        acc_brandWidth: 'Access Bandwidth',
        acc_hit_rate: 'Access Hit Rate',
        ddr_acc_brandwidth: 'DDR Access Bandwidth',
        ddr_id: 'DDR Channel ID',
        ddr_acc: 'DDR Access',
        total_acc: 'Total Access/s',
        local_acc: 'Local DDR Access/s',
        inter_die: 'Cross-die DDR accesses/s',
        chip_die: 'Cross-chip DDR accesses/s',
        total_die: 'DDR Access Times/s',
        maxBandWidthtip1: '1. The actual maximum bandwidth for the read memory is about 90% of \
        the theoretical maximum bandwidth.',
        maxBandWidthtip2: '2. The actual maximum bandwidth for the write memory is about 70% of \
        the theoretical maximum bandwidth.',
        maxBandWidthtip3: '3. In read/write (50%/50%) scenarios, the actual maximum bandwidth is about 50% of the \
        theoretical maximum bandwidth.',
        maxBandWidthtip4: '4. When the actual memory bandwidth reaches 60% of the \
        theoretical maximum bandwidth, the system performance deteriorates sharply.',
        maxBandWidth: 'Theoretical Maximum Bandwidth (MB/s)',
        maxBandWidthRate: 'Ratio (%)',
        maxBandWidthRateTip: 'Ratio of the current bandwidth to the theoretical maximum bandwidth',
        maxBandWidthRateTipTitle: 'Ratio of the current bandwidth to the theoretical maximum bandwidth(%)',
    },
    plugins_sysperf_title_ddrSummury: {
        sys_info: 'System Information',
        linux_os: 'Linux Kernel Version',
        cpu_type: 'CPU Type',
        ddr_access: 'DDR Access',
        cache_access: 'Cache Access',
        tlb: 'L1C/L2C/TLB Access Bandwidth and Hit Rate',
        l3c: 'L3C Access Bandwidth and Hit Rate',
        type: 'Type',
        brandwidth: 'Bandwidth (MB/s)',
        hitrate: 'Hit Rate',
        acc_hitBrandWidth: 'Access Hit Bandwidth (MB/s)',
        acc_brandWidth: 'Access Bandwidth',
        acc_hit_rate: 'Access Hit Rate',
        ddr_acc_brandwidth: 'DDR Access Bandwidth',
        ddr_id: 'DDR Channel ID',
        ddr_acc: 'DDR Access',
        total_acc: 'Total Access/s',
        local_acc: 'Local DDR Access/s',
        inter_die: 'Cross-die DDR accesses/s',
        chip_die: 'Cross-chip DDR accesses/s',
        total_die: 'DDR Access Times/s',
        maxBandWidthtip1: '1. The actual maximum bandwidth for the read memory is about 90% of \
        the theoretical maximum bandwidth.',
        maxBandWidthtip2: '2. The actual maximum bandwidth for the write memory is about 70% of \
        the theoretical maximum bandwidth.',
        maxBandWidthtip3: '3. In read/write (50%/50%) scenarios, \
        the actual maximum bandwidth is about 50% of the theoretical maximum bandwidth.',
        maxBandWidthtip4: '4. When the actual memory bandwidth reaches 60% of \
        the theoretical maximum bandwidth, the system performance deteriorates sharply.',
        maxBandWidth: 'Theoretical Maximum Bandwidth (MB/s)',
        maxBandWidthRate: 'Ratio (%)',
        maxBandWidthRateTip: 'Ratio of the current bandwidth to the theoretical maximum bandwidth',
        maxBandWidthRateTipTitle: 'Ratio of the current bandwidth to the theoretical maximum bandwidth(%)',
    },
    aboutMsg: {
        about: 'About',
        name: 'Kunpeng Hyper Tuner Plugin',
        version: 'Version V2.2.5',
        time: 'Release Date：2020.12.30',
        copyRight: 'Copyright © Huawei Technologies Co., Ltd. 2020. All rights reserved.'
    },
    preSwitch: {
        switchLabel: 'Scheduled Start',
        serverTime: 'The scheduled task start time is the server time. The current server time is',
        serverTimeWarn: 'Specify the date and time to start the scheduled task based on the date \
        and time on the current server.',
        onceColect: 'One-Time',
        duraColect: 'Periodic',
        colectMethods: 'Sampling Mode',
        pointTime: 'Start Time',
        pointDuration: 'Sampling Date',
        onceTime: 'Sampling Date and Time',
        onceTimeWarn: 'The interval between the specified sampling time and the actual sampling \
        time is no longer than 10 seconds.',
        errorMsgTime: 'Sampling Duration cannot be empty.',
        errorMsgTime1: 'The specified time cannot be earlier than the current server time.',
        errorMsg: 'Sampling Date cannot be empty.',
        errorMsg1: 'The date range is invalid. The start date must be within seven days from the \
        current date. The end date must be within 30 days from the start date.',
        errorMsgDate: 'Sampling Date and Time cannot be empty.'
    },
    preTable: {
        perMission: 'Scheduled Tasks',
        preTableTitle: 'Scheduled Task Configuration',
        tableTitle: 'Scheduled Sampling Task',
        name: 'Name',
        type: 'Type',
        status: 'Task Status',
        done: 'Completed',
        diliver: 'Delivering',
        scheduled: 'Scheduled',
        time: 'Collection Time',
        duration: 'Collection Date',
        analysis: 'Analysis Type',
        createTime: 'Created',
        action: 'Operation',
        total: 'Total',
        reserve: 'Scheduled',
        running: 'Delivering',
        success: 'Completed',
        fail: 'Failed',
        userName: 'User Name',
    },
    nodeConfig: {
        title: 'Configure Node Parameters',
        allConfig: 'Batch Configuration',
        nickName: 'Alias',
        nodeName: 'Node Name',
        node: 'Node IP Address',
        c_path: 'C/C++ Source File Path',
        application: 'Application',
        parameters: 'Application Parameters',
        processId: 'Process ID',
        status: 'Configuration Status',
        action: 'Operation',
        configed: 'Modified',
        noConfig: 'Not modified',
        couldConfig: 'Configurable',
        configParams: 'Configure Parameters',
        nodeTip: 'If this option is disabled, this task will be executed based on the current \
        parameter configuration on all nodes. ',
        inputTip: 'Enter a process ID of the current node. ',
        pointed: 'Specified',
        modifyNodeParameter: 'Modify Node Parameters',
    },
    agentCertificate: {
        nodeId: 'Node',
        verificationLable: 'Authentication Mode',
        password: 'Password',
        opt: 'Installation Path',
        keyFile: 'Private Key File',
        pwdPhrase: 'Passphrase',
        passwordAuth: 'Password authentication',
        private_key_auth: 'Key authentication',
        update_certificate: 'Update Certificate',
        update_work_key: 'Update Working Key'
    },
    certificate: {
        title: 'Web Server Certificates',
        restartService: 'The restart will disconnect the current connection. Are you sure \
        you want to restart the service',
        webNotice: 'A web server certificate is used for the web browser to communicate \
        with the web server where the Kunpeng Hyper Tuner is located.',
        name: 'Certificate Name',
        validTime: 'Certificate Expiration Time',
        status: 'Status',
        close: 'Close',
        valid: 'Valid',
        nearFailure: 'About to expire',
        failure: 'Expired',
        nodeIp: 'Node IP Address',
        nodeNickname: 'Node Alias',
        agentTitle: 'Agent Service Certificates',
        agentNotice: 'An agent service certificate is used for communication between the \
        server and agent of Hyper Tuner. ',
        notice: 'Information',
        warnNotice: 'Your agent service certificate is about to expire or has expired.',
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
        noData: 'No data. Please add weak passwords.',
        resetServer: 'Restart Server',
        changeCipher: 'Update Working Key',
        lead: 'Import',
        operate: 'Operation',
        keyFileText: 'The value cannot be empty.',
        keyPlaceHoder: 'Enter the passphrase of the private key file.',
        createSuccess: 'The certificate is generated successfully.',
        createUpdate: 'The certificate is replaced successfully.',
        workUpdate: 'The Work key is replaced successfully.',
        common_webcert_import_success: 'The certificate is imported successfully',
        country_Verification_Tips: 'Enter a two-character country code.',
        common_city_province_Verification_Tips: ' is invalid. It can contain a maximum of \
        128 characters, including only letters,\
         digits, underscores (_), hyphens (-), periods (.), and spaces. ',
        common_Verification_Tips: ' is invalid. It can contain a maximum of 64 characters, including only letters, \
        digits, underscores (_), hyphens (-), periods (.), and spaces. ',
        common_term_webcert_import_success: 'Certificate imported successfully , Take effect after service restart',
        common_term_webcert_restart_tip: 'The restart takes 5 to 10 seconds. After the restart, \
        refresh the current page.\
         Then, operations can be performed normally.',
        webWarnNotice1: 'Your web server certificate has expired. Please replace the certificate.',
        webWarnNotice2: 'Your web server certificate is about to expire on ${time}. \
        Please replace the certificate in time.',
    },
    operationLog: {
        downLoadLog: 'Download',
        workingLog: 'Run Logs',
        logLevel: 'Log Level:',
        logFileName: 'Log File Name',
        operation: 'Operation',
        download: 'Download',
        close: 'Close',
        confirmModify: 'Are you sure you want to change the current log level?',
        managerName: 'Administrator:',
        password: 'Password:',
        confirm: 'OK',
        size: 'Size',
        cancle: 'Cancel'
    },
    mission_create: {
        collectCallStack: 'Collect call stack',
        analysisTarget: 'Analysis Object',
        nodeParamsConfig: 'Configure Node Parameters',
        modeAppHolder: 'Enter the path of an application in ${path}.',
        modeHolder: 'Enter the absolute path of the application.',
        modePidHolder: 'Enter a process ID.',
        modeNameHolder: 'Enter a process name.',
        modeAppParamsHolder: 'Enter application parameters.',
        missionNameNotice: 'Enter a task name.',
        modeAppWarn: 'Incorrect format. Each path must start with a slash (/) and end with a specific file name. \
        The file name cannot contain special characters such as ^ ` / | ; & $ > < \ !.',
        modeAppPathSaftWarn: 'Caution: Ensure that the application has no security risks.',
        modeAppPathInvalid: 'Only the applications in the ${path} path are \
        supported. Contact the administrator to configure the application path.',
        modeAppPathInvalid2: 'In Java hybrid analysis mode, the application path must end with /java.',
        processName: 'Process Name',
        mode: 'Mode',
        launchApp: 'Launch application',
        attachPid: 'Attach to process',
        universal_title: 'General Analysis',
        system_title: 'System Component Analysis',
        dedicated_title: 'Specified Analysis',
        sysPro: 'Overall Performance',
        sysConfig: 'Configuration Panorama',
        resSchedule: 'Resource Scheduling',
        structure: 'Microarchitecture',
        mem: 'Memory Access Statistics',
        process: 'Process/Thread Performance',
        missEvent: 'Miss Events',
        falsesharing: 'False sharing',
        cPlusPlus: 'Hotspot Function Analysis',
        lock: 'Locks and Waits',
        java: 'Java Mixed Mode',
        io: 'I/O Performance',
        checkPreInfo: 'View Configuration',
        paramsConfigNotice: 'Some mandatory parameters are not configured.',
        restartSuccess: 'Restarted successfully',
        templateNoData: 'No template is available. Please set parameters and save the template.',
        missionNameWarn: 'The task name cannot be empty.',
        modeAppPath: 'The application cannot be empty.',
        modeAppParams: 'The application parameters cannot be empty.',
        modePidNotice: 'The PID cannot be empty.',
        modeNameNotice: 'The process name cannot be empty.',
        modePidWarn: 'The value must be a natural number.',
        modeAppNotice: 'Enter the absolute path of the application to be analyzed.',
        modeAppParamsNotice: 'Enter the parameters of the target application to be analyzed. \
        This field is optional. Set it based on \
        the actual application scenario.',
        modeAppRunUser: 'Information about the OS user that runs the application.',
        disableDataTip: 'Scheduled startup is unavailable in database scenarios.',
        disableeTip: 'When the application user is specified, the task must be executed immediately. \
        Scheduling task execution is \
        not available.',
        sysProMsg: 'Collects the information of system software and hardware configuration \
        and the running status of CPU,\
         memory, storage I/O, and network I/O resources to identify system bottlenecks and \
         provide optimization suggestions.',
        sysConfigMsg: 'The tool collects the software and hardware configuration information of the entire system, \
        and analyzes whether the configuration is appropriate.',
        resScheduleMsg: 'The tool analyzes system resource scheduling based on CPU scheduling events.',
        structureMsg: 'Collects the running status of instructions on the CPU pipeline based \
        on PMU events to quickly identify \
        the performance bottlenecks of the current application on the CPU.',
        memMsg: 'The tool analyzes the storage access times, hit rate, and bandwidth based on the PMU \
        events of the processor memory access and cache access.',
        memAccessAnalysisMsg: 'Obtains metrics such as access attempts, hit ratio, and bandwidth \
        based on the PMU events of the \
        CPU access cache and memory.',
        processMsg: 'Collects the consumption of CPU, memory, and storage I/O in processes or threads, \
        identifies the performance \
        bottleneck, and provides optimization suggestions. The system invoking of a single process is supported.',
        missEventMsg: 'Analyzes events such as LLC Miss, TLB Miss, Remote Access, and Long Latency \
        Load based on the ARM SPE capability.',
        falsesharingMsg: 'Obtains the count, proportion, instruction address, and NUMA node of false \
        sharing based on the ARM SPE \
        capability analysis.',
        cPlusPlusMsg: 'Analyzes C/C++ program code to identify performance bottlenecks and provides \
        the corresponding hot functions \
        and detailed association between source code and assembly instructions. The cold/hot flame \
        chart displays the function calling \
        relationship and helps find the optimization path.',
        lockMsg: 'Analyzes the usage of lock and wait functions based on sampling data, associates \
        the data with specific processes and \
        call sites, and provides optimization suggestions.',
        ioMsg: 'Analyzes the performance data of block devices, such as the number of I/O operations, \
        I/O data size, I/O \
        queue depth, and I/O operation latency, and associates the performance data with specific \
        I/O operation information.',
        javaMsg: 'The tool analyzes the Java program code, identifies the performance bottleneck, and provides the \
        corresponding hotspot functions.',
        hpcMsg: 'By collecting PMU events of the system, collects the key metrics, memory bandwidth, \
        instruction distribution, \
        and micro-architecture metrics for OpenMP and MPI applications.',
        app_path_input_tip: '',
        crossFieldValidation: { // 跨字段交叉校验
            samplingDelayAndSamplingTime: 'The sum of the sampling delay and sampling duration cannot exceed 900s.',
        },
        system_bigData: 'Collects the running status of system resources, such as CPU, memory, \
        storage I/O, and network I/O, and \
        obtains metrics about usage, saturation, errors, typical big data configurations, and top data to identify \
        system performance bottlenecks.',
        process_name: 'Process',
        process_alias: 'Process',
        process_input_placeholder: 'Regular input is supported',
        pid_input_placeholder: 'Supports up to 128 PIDs. Use commas (,) to separate PIDs.',
        pid_valid_tip: 'Incorrect PID format. Only numbers are allowed.',
        pid_input_placeholder_java: 'One PID can be entered',
        pid_input_tip_java: 'Support input up to Pid.',
        process_input_placeholder_java: 'Regular input is supported. The process entered can contain only one PID.',
        kcore: 'Associate Kernel Function with Assembly Code',
        hpc: 'HPC',
        disablingReason: {
            tit: 'Before using MPI mode for collection, ensure that your environment meets the following requirements:',
            firstItem: '1. Password-free SSH login has been configured for nodes involved in MPI. If not, configure password-free SSH login for <user> running mpirun.',
            secondItem: "2. The sudo permission has been configured for <user> that runs the MPI program. If not, run the following command as the root user: '/usr/bin/malluma_tools/user_sudoers_enable.sh <user>'"
        }
    },
    // falsesharing
    falsesharing: {
        filesize: 'Size of the collected file',
        filesizeTips: 'Set the size of file to prevent long analysis time',
        address: 'Cacheline Address',
        records: 'Total Records',
        rate: 'Rate（%）',
        offset: 'Offset',
        codeAddress: 'Code Address',
        symbol: 'Symbol',
        sharedObject: 'Target File Name',
        source: 'Source：Line',
        numaNode: 'NUMA Node',
        suggestMsg: [
            '1) Allocate independent cache lines for frequently used variables to reduce conflicts, \
            accelerate program running, \
        and prevent other variables that share the cache lines from being affected.',
            '2) For a hotspot lock or mutex across multiple cache lines, consider cache line alignment.',
            '3) Place the read-intensive variables to the same or adjacent cache lines.',
            '4) Optimize the code segments that cause contention in many cache lines rather than in a cache line.',
            '5) Pay attention to cache line contention for access to the shared memory from multiple processes.',
        ],
        // 参数配置建议
        paramsConfigSuggestions: 'A large amount of data needs to be collected for the false sharing analysis, \
        which takes a long time. \
        You are advised to specify the cores, increase the sampling interval, and reduce the sampling duration.',
    },
    tipMsg: {
        refreshP: 'Refresh Project',
        createP: 'Create Project',
        modifyP: 'Modify Project',
        deleteP: 'Delete Project',
        createM: 'Create Task',
        modifyM: 'Modify Task',
        deleteM: 'Delete Task',
        startM: 'Start Task',
        stopM: 'Stop Task',
        restartM: 'Restart Task',
        adminPwd: 'Admin Password',
        managerPwd: 'Admin Password',
        tiptitle: 'Modify Application Path',
        tipcontent: ' Set the application path to /home or /opt. \
        Do not use a system directory such as /, /dev, /sys, and /boot as the application path. \
        Otherwise, the system may be abnormal.',
        tipSuccess: 'Application path modified successfully.',
        system_setting_input_empty_judge: 'The value cannot be empty. ',
        system_setting_input_format_judge: 'Incorrect format. Each path must start and end with a \
        slash (/) and cannot contain \
        special characters ^ ` / |; & $ > < \!. Multiple paths are separated by  semicolons (;).',
        system_setting_input_repeat_judge: 'Duplicate path.',
    },

    system_config: {
        common_config: 'Common Settings',
        system_tuning: 'System Profiler Settings',
        diagnose_config: 'System Diagnostics Settings',
        tuning_assistant_config: 'Tuning Assistant Settings',
        user_count: 'Maximum Number of Online Common Users (1-20)',
        session_timeout: 'Session Timeout Period (min)',
        web_deadline: 'Web Service Certificate Expiration Alarm Threshold (days)',
        agent_deadline: 'Agent Service Certificate Expiration Alarm Threshold (days)',
        operation_log_period: 'Operation Log Retention Period (days)',
        run_log_level: 'Run Log Level',
        change_config: 'Change'
    },

    // 建议列表
    optimizationSuggestions: {
        Cycles: {
            desc: 'Total number of CPU cycles in the sampling duration.'
        },
        Instructions: {
            desc: 'Total number of instructions submitted in the sampling duration.'
        },
        IPC: {
            desc: 'Number of instructions submitted by the CPU in each clock cycle.'
        },
        Retiring: {
            desc: 'Number of instructions submitted by each instruction dispatch port of the CPU in each clock cycle.',
            cause: 'The low Retiring value may be caused by too many time-consuming instructions \
            such as multiplication and division instructions.',
            tips: 'A higher Retiring value indicates better performance. Code vectorization can \
            improve the program efficiency.'
        },
        'Front End Bound': {
            desc: 'Insufficient Front-End CPU instructions.',
            cause: 'Hotspot code is not centralized, causing ITLB or ICache misses.',
            tips: 'Check the sub-indicators of Front-End Bound.'
        },
        'Fetch Latency Bound': {
            desc: 'The instruction fetch delay is high and the CPU pipeline is stalled.',
            cause: 'ITLB or ICache miss, or pipeline flush due to a speculative execution failure.',
            tips: '1. Reduce the number of hotspot code branches. 2. Use PGO for compilation.'
        },
        'ITLB Miss': {
            desc: 'The ITLB is a high-speed cache in the CPU used to store mapping between virtual \
            addresses and physical addresses of \
            recent instructions. An ITLB miss means that no instruction address in the ITLB is hit.',
            cause: 'Hotspot code is not centralized.',
            tips: 'Optimize the code structure or use PGO for compilation.'
        },
        'ICache Miss': {
            desc: 'The ICache is a high-speed cache in the CPU used to store recent instructions. \
            An ICache miss means that no \
            instruction in the ICache is hit and the instruction needs to be read from the memory.',
            cause: 'Hotspot code is not centralized.',
            tips: 'Use instruction prefetching or PGO for compilation.'
        },
        'Branch Mispredict Flush': {
            desc: 'Pipeline flush due to a branch misprediction.',
            cause: 'Too many branch instructions that cannot be accurately predicted.',
            tips: '1. Reduce the number of branch instructions. 2. Use Likely and Unlikely to \
            improve the prediction accuracy. \
            3. Use PGO for compilation.'
        },
        'OOO Flush': {
            desc: 'Pipeline flush due to an out-of-order execution failure.'
        },
        'SP Flush': {
            desc: 'Pipeline flush due to a static misprediction.'
        },
        'Fetch Bandwidth': {
            desc: 'The fetched Front-End instructions are insufficient for Back-End instruction consumption.',
            cause: '1. The proportion of branch instructions is too large. 2. Frequent \
            cross-boundary instruction fetchings.',
            tips: '1. Reduce the number of branch instructions to improve the branch prediction accuracy.'
        },
        'Bad Speculation': {
            desc: 'CPU pipeline stall due to incorrect prediction of out-of-order execution.',
            cause: 'Branch misprediction or machine clear.',
            tips: ' 1. Reduce the number of hotspot code branches. 2. Use PGO for compilation.'
        },
        'Machine Clear': {
            desc: 'CPU pipeline stall due to a pipeline flush.'
        },
        'Nuke Flush': {
            desc: 'CPU pipeline flush due to a RAW hazard during load speculation.'
        },
        'Other Flush': {
            desc: 'CPU pipeline flush due to events such as System Call, ISB, and Exception, excluding Nuke Flush.'
        },
        'Brand Mispredict': {
            desc: 'Pipeline flush due to a branch misprediction.',
            cause: 'Too many branch instructions that cannot be accurately predicted.',
            tips: '1. Reduce the number of branch instructions. 2. Use Likely and Unlikely to improve the prediction \
            accuracy. 3. Use PGO for compilation.'
        },
        'Indirect Branch': {
            desc: 'Proportion of incorrect predictions of indirect jump instructions such as BR and BLR, excluding RET.'
        },
        'Immediate Branch': {
            desc: 'Direct jump of assembly instructions such as B, B.COND, and BL.'
        },
        'Push Branch': {
            desc: 'Proportion of incorrect predictions of assembly jump instructions such as \
            BL and BLR during a function calling.'
        },
        'Pop Branch': {
            desc: 'Proportion of incorrect predictions of assembly jump instructions such as \
            RET during a function return.'
        },
        'Other Branch': {
            desc: 'Proportion of incorrect predictions of branch assembly instructions such as B, B.COND, CBZ, CBNZ, \
            TBZ, and TBNZ, excluding PUSH and POP.'
        },
        'Back End Bound': {
            desc: 'Insufficient Back-End CPU resources',
            cause: 'High data read/write latency or insufficient execution units.',
            tips: 'Check the sub-indicators of Back-End Bound.'
        },
        'Core Bound': {
            desc: 'Insufficient CPU execution units.',
            cause: 'The same execution unit is used for a long time.',
            tips: 'Check the sub-indicators of Core Bound.'
        },
        Divider: {
            desc: 'Pipeline stall due to insufficient division units',
            cause: 'Too many division operations.',
            tips: '1. Change division operations by a power of 2 to right shift operations. \
            2. Save intermediate calculation results that \
            are repeatedly used. 3. Change division operations by a constant to multiplication \
            operations by the reciprocal \
            of the constant.'
        },
        'FSU Stall': {
            desc: 'Pipeline stall due to insufficient floating-point units.',
            cause: 'Too many floating-point operations.',
            tips: 'Vectorize floating-point operations.'
        },
        'Exe Port Stall': {
            desc: 'Pipeline stall due to insufficient execution units other than divider and FSU.'
        },
        'Memory Bound': {
            desc: 'Pipeline stall due to data read/write waiting.',
            cause: 'Poor locality of reference or severe cache competition.',
            tips: 'Check the sub-indicators of Memory Bound.'
        },
        'L1 Bound': {
            desc: 'CPU pipeline stall in the case of an L1 hit.',
            cause: 'A DTLB miss causes a pipeline stall.',
            tips: '1. Use 64 KB page tables or huge pages. 2. Improve the locality of reference.'
        },
        'L2 Bound': {
            desc: 'CPU pipeline stall in the case of an L2 hit.',
            cause: 'Large data blocks, poor locality of reference during data access, or severe cache conflicts.',
            tips: '1. Use data prefetching to ensure that as much data as possible is hit in the L1 cache. \
            2. Reduce the size of \
            data blocks and improve the locality of reference. 3. Use cache line alignment for hotspot data.'
        },
        'Ext Mem Bound': {
            desc: 'CPU pipeline stall in the case of an L3 or DDR hit.',
            cause: 'Large data blocks or poor locality of reference during data access.',
            tips: 'High L3 and DDR memory access latency. 1. Use data prefetching to ensure that \
            as much data as possible is hit in \
            the L1 or L2 cache. 2. Reduce the data block size and improve the locality of reference.'
        },
        'Store Bound': {
            desc: 'Pipeline stall due to data writing.',
            cause: 'Cache lines become invalid due to false sharing.',
            tips: 'Perform false sharing analysis.'
        },
        'Resource Bound': {
            desc: 'CPU pipeline stall due to insufficient CPU hardware resources.'
        }
    },
    optimization: 'Tuning Suggestions',
    optimization_no_msg: 'No metrics are identified in the tuning suggestion library. \
    Perform analyses based on site conditions.',
    weakPassword: {
        pwd_rule: 'The weak password must contain at least two types of the following characters: \
        uppercase letters, lowercase letters, \
        digits, and special characters (`~!@#$%^&*()-_=+\\|[{}];:\'",<.>/?). \
        The length ranges from 8 to 32 characters.',
        addWeakPwd: 'Add Weak Password',
        WeakPwd: 'Weak Password',
        searchWeakPwd: 'Search for weak passwords',
        deleWeakPwd: 'Delete Weak Password',
        confirmdele: 'Are you sure you want to delete the weak password'
    },

    plugins_common_agentNodeManagement: {
        nodeName: 'Node Name',
        nodePort: 'Port',
        installPath: 'Installation Path',
        adding: 'Adding',
        deleting: 'Deleting',
        nodeStatus: 'Node Status',
        nodeIP: 'Node IP Address',
        userName: 'User Name',
    },

    plugins_common_agentNode: {
        nodeList: 'Node List',
        selectNode: 'Select Nodes',
        status: 'Status',
        online: 'Online',
        offline: 'Offline',
        abnormal: 'Some nodes are abnormal',
        failed: 'failed',
    },
    plugins_term_or: ' or ',
    plugins_term_project_add: 'New Project',
    plugins_term_project_create: 'Create',
    plugins_term_project_name: 'Project Name',
    plugins_term_fill_project_name: 'Please fill out this field',
    plugins_term_add_node: 'Go to Node Management',
    plugins_term_project_add_description: 'Sampling analysis can be performed on 10 nodes at the same time.',
    plugins_term_project_modify: 'Modify a Project',
    plugins_common_term_ok: 'OK',
    plugins_common_term_cancel: 'Cancel',
    plugins_term_path_change: 'Application Path Settings',
    plugins_term_modify: 'Modify',
    plugins_term_project_add_success: 'Project {0} is created successfully.',
    plugins_term_project_add_failed: 'Failed to create project {0}.',
    plugins_term_project_modify_success: 'Project {0} is modified successfully.',
    plugins_term_project_modify_failed: 'Failed to modify project {0}.',
    plugins_term_task_immediateAnal_success: 'Task {0} analyzed successfully.',
    plugins_term_task_immediateAnal_failed: 'Task {0} analyzed failed.',
    plugins_term_task_reanalyze_success: 'Task {0} restarted successfully.',
    plugins_term_task_reanalyze_failed: 'Task {0} restarted failed.',
    plugins_term_task_modify_success: 'Task {0} is modified successfully.',
    plugins_term_task_create_success: 'Task {0} is created successfully.',
    plugins_term_scheduleTask_create_success: 'Scheduled task {0} is created successfully.',
    plugins_term_scheduleTask_modify_success: 'Scheduled task {0} is modified successfully.',
    plugins_term_delete_single_AppointTask_ok: 'Scheduled task {0} is deleted successfully',
    plugins_sysperf_message_batch_delete_AppointTask_ok: 'The scheduled tasks are successfully deleted in batches.',
    plugins_sysperf_message_batch_delete_AppointTask_fail: 'The scheduled tasks are successfully deleted in batches.',
    plugins_term_delete_title_appointment: 'Are you sure you want to delete this task?',
    plugins_sysperf_message_batch_delete_AppointTask: 'Are you sure you want to delete the following scheduled tasks? ',
    plugins_term_delete_content_appointment: 'The scheduled task cannot be restored after deletion. \
    Excercise caution when deleting a scheduled task.',
    plugins_common_term_operate_ok: 'OK',
    plugins_common_term_operate_cancel: 'Cancel',
    plugins_common_term_operate_close: 'Close',
    cpu_kernel_All: 'If no value is entered, all options are selected by default.',
    plugins_common_button_checkConn: 'Check Connection',
    plugins_common_tips_connOk: 'SSH connection check succeeded.',
    plugins_common_tips_connFail: 'Failed to check the SSH connection. Check whether \
    the user name and password are correct.\
     Too many retries will also cause the check failure.',
    plugins_project_nodeList: 'Nodes to be Analyzed',
    plugins_project_normor: 'Collects and analyzes the CPU, memory, storage I/O, and network I/O resources \
    on a server and provides top data statistics.',
    plugins_project_bigData: 'Collects and analyzes common CPU, memory, storage I/O, \
    and network I/O resources on a server, and \
    provides typical configurations for big data solutions and top data statistics.',
    plugins_project_steps: 'Collects and analyzes common CPU, memory, storage I/O, \
    and network I/O resources on servers, and provides \
    typical configurations for distributed storage solutions and top data statistics.',
    plugins_project_hpc: 'Collects PMU events of the system and displays data in multiple dimensions based on key \
    indicators of OpenMP and MPI applications.',
    plugins_project_database: 'Collects and analyzes server resources such as CPU, \
    memory, storage I/O, and network I/O, \
    as well as typical database configurations and top data.',
    plugins_project_hpc_node: 'In the HPC scenario, 101 nodes can be sampled and analyzed at the same time.',
    plugins_task_stop_error: 'Failed to stop the task {0}.',
    plugins_task_stop_success: 'task {0} is stopped successfully.',
    plugins_common_tips_interval: '(2~300)',
    plugins_sysperf_tips_interval: '(1~3600)',
    plugins_common_tips_appDescription: 'Collects data of the specified application or process for analysis.',
    plugins_sysperf_message_ddrReadAccess: 'DDR_RD',
    plugins_sysperf_message_ddrWriteAccess: 'DDR_WR',
    plugins_common_title_upgradeTool: 'Upgrade Hyper Tuner',
    plugins_common_button_startUpgrade: 'Upgrade',
    plugins_common_title_upgrading: 'Do not close this page when the tool is upgraded.',
    plugins_common_message_upgradingInfo: 'Upgrade the tool as prompted.',
    plugins_common_title_upgraded: 'The tool is upgraded successfully.',
    plugins_common_title_upgradeFailed: 'Failed to upgrade the tool.',
    plugins_common_tips_sshError: 'SSH connection exception. Please try again.',
    plugins_sysperf_title_ddrChart: {
        bandwith: 'Bandwidth (MB/s)',
        hitrate: 'Hit Rate',
        hitbandwith: 'Hit Bandwidth(MB/s)',
        acessscount: 'Total Access',
        localaccess: 'Local DDR Access',
        spandie: 'Cross-die DDR accesses',
        spanchip: 'Cross-chip DDR accesses',
        ddr_access_count: 'DDR Access Times'
    },
    plugins_common_tips_figerFail: 'Failed to set up the connection because the host fingerprint verification failed.',
    plugins_common_tips_timeOut: 'Connection timed out. Please try again.',
    plugins_common_title_sshKey: 'Key authentication',
    plugins_common_title_sshPwd: 'Password authentication',
    plugins_common_label_selectSSHType: 'SSH Connection Mode',
    plugins_common_message_sslKeyTip: 'id_rsa Private Key File',
    plugins_common_message_sshkeyFail: 'Import the correct id_rsa private key file.',
    plugins_common_message_passphrase: 'Enter the passphrase of the private key file.',
    plugins_common_message_passphraseFail: 'Enter the correct passphrase',
    plugins_common_message_sshkeyExceedMaxSize: 'The private key file size exceeds 10 MB.',
    plugins_common_label_installsshkey: 'Private Key',
    plugins_common_label_passphrase: 'Passphrase',
    plugins_common_message_sshkeyUpload: 'Import',
    plugins_common_title_install_loading: 'Uploading the install script to your server …',
    plugins_common_title_uninstall_loading: 'Uploading the uninstall script to your server …',
    plugins_common_title_upgrade_loading: 'Uploading the one-click upgrade script to your server... Please wait.',
    plugins_common_tips_uploadError: 'Failed to upload the script file to your server.',
    plugins_common_term_yes: 'Yes',
    plugins_common_term_no: 'No',
    plugins_common_title_ipSelect: 'The tool is about to send a login request to IP address {0}.\
    This IP address is the web server address specified during the installation or modified after the installation.\
    Check whether the current address {1} is correct.',
    plugins_common_title_ipSelectUpgrade: 'The tool is about to send a login request to IP address {0}.\
    This IP address is the web server address specified during the installation or modified after the installation.\
    Check whether the current address {1} is correct.',
    plugins_common_tips_ipFault: 'Confirm the IP address {0} is correct',
    plugins_common_tips_ipSSH: 'Use the IP address {0} entered for SSH connection',
    plugins_common_tips_ipExtra: 'Set IP address',
    plugins_common_message_saveConfirm: 'Are you sure you want to save the current configuration? \
    If you click OK, you will be logged out of the system.',
    plugins_common_title_saveConfirm: 'Save Configuration',
    plugins_common_title_serverException: 'The server does not respond. \
    Perform the following steps to rectify the fault:',
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
    plugins_common_message_serverErrorResult2: '- If no, rectify the fault by following \
    the instructions provided in {0}.',
    plugins_common_message_CommunityTip: '{0}. Report your problem on the {1}.',
    plugins_common_message_serverErrorResult2Link: '<a href={0}> "How Do I Troubleshoot \
    the Server in Abnormal Status?"</a>',
    plugins_common_message_CommunityTipLink: '<a href={0}>Kunpeng Community</a>',
    plugins_common_message_connIssue1: '1) The IP address entered does not exist.',
    plugins_common_message_connIssue2: '2) The DevKit application is not installed on the server, \
    or the server port {0} is incorrect.',
    plugins_common_message_connIssue2_deployScenario: '2) The server has SSH disabled.',
    plugins_common_message_connIssue3: '3) The network cables are not properly connected.',
    plugins_common_message_connIssue4: '4) Network policies, such as interception rules, are used.',
    plugins_common_message_connIssue5: '5) Check the network status and network configurations.',
    plugins_common_message_loseDir: '检测到服务端当前用户 {0} 不存在家目录/home/{0}，请自行在服务端创建家目录，并确保家目录属主为{0}，然后重试。命令参考如下：\
    1.创建家目录：mkdir /home/{0} \
    2.家目录属主为{0}：chown -R {0}:{0} /home/{0}',
    plugins_sysperf_title_consumption: {
        consumption: 'Power Consumption',
        power: 'Power',
        powerUnits: 'Power (W)',
        average: 'Average power',
        averageUnits: 'Average power (W)',
        maxPower: 'Max. Power (W)',
        minPower: 'Min. power (W)',
    },
    databaseConfig: {
        ip: 'Database Connection IP Address',
        port: 'Port',
        username: 'User Name',
        password: 'Password',
        btnTip: 'Enter the database user name and password of each node.',
        placeholderIp: 'Enter the database connection IP address.',
        placeholderPort: 'Enter the database connection port.',
        placeholderUsername: 'Enter the database user name.',
        placeholderPassword: 'Please enter the database password.',
    },
    linkage: {
        hz: 'Frequency',
        cpuAverageLoad: 'CPU Average Load',
        disk: 'Storage I/O',
        net: 'Network I/O',
        configData: 'Configuration Data',
        perfData: ' Performance Data',
        diskList: 'Drive list',
        raid_group: 'RAID group',
        stroug_volume: 'Storage volumes',
        netNum: 'NICs',
        netMsg: 'NIC details',
        netportMsg: 'Notwork port details',
        paramsSame: 'Consistent nodes parameters',
        paramsNotSame: 'Inconsistent nodes parameters',
        typicalConfig: 'Typical Configurations',
        allConfig: 'All Configurations',
        selectObj: ' Screen Objects to Compare',
        startTime: 'Task Start Time',
        endTime: 'Task End Time',
        task: 'Task',
        project: 'Project',
        version: 'Version',
        fileNum: 'File systems',
        cpuAvg: 'Average CPU Cores of Data Involved',
        cpuUsage: 'Average CPU Usage',
        memUsage: 'Memory Usage',
        tips: 'If the result of comparative analysis involved is mingled with results of PM and VM. Select the \
        comparison objects that meet the expectations. ',
        parameters: 'Parameters',
        smooth: 'Smoothing Algorithm',
        cpuPercent5: 'CPU Core Usage > 5%',
        cpuPercent10: 'CPU Core Usage > 10%',
        taskName: 'Task Name',
        selectScene: 'Select a scene',
        choseObject: 'Select comparison object',
        placeHolder: 'Enter a task name.',
        linkagedObject: 'Overall Analysis', // 翻译
        generalScenario: 'General Scenario',
        bigData: 'Big Data',
        dataBase: 'Database',
        distributedStorage: 'Distributed Storage',
        prompt: 'prompt',
        notSameScene: 'The components of the compared nodes are inconsistent.\
        The tool cannot compare typical configurations. Are you sure you want to create the task?',
        horizontal: 'Horizontal Analysis',
        vertical: 'Vertical Analysis',
        taskCreateTime: 'Created',
        nodeName: 'Node Name',
        percent: 'Percentage',
        partition: 'Swap Partition',
        diskNum: 'Total Drives',
        horizontal_analysis_tip: 'Compare the analysis results among multiple \
        nodes under the same task in the same project.',
        vertical_analysis_tip: 'Comparison of analysis results between two nodes in different tasks.',
        name: 'Name',
        allParams: 'All parameters',
        differentParams: 'Inconsistent parameters',
        typeData: 'Typical Data',
        onCPUdiff: 'onCPU differential',
        offCPUdiff: 'offCPU differential',
    },
    diffflamegraph: {
        node_name: 'Node Name',
        node_ip: 'Node IP',
        task_name: 'Task Name',
        project_name: 'Project Name',
        sample_interval: 'Sample Interval(ms)',
        period: 'Clock Cycles',
        instruction_number: 'Number of Instructions',
        ipc: 'IPC',
        os: 'Operating System',
        host_name: 'Host Name',
        search_mark: 'Search Mark',
        gen_diff: 'Generate Differertial',
        tips: 'Select two nodes for flame graph comparison analysis.\
        Ensure that the sampling intervals of the two comparison nodes reports are the same. \
        otherwise the deviation may be produced.',
        baseChoose: 'Select the base node.',
        selectChoose: 'Select the comparison node.',
        searchKey: 'Search function.'
    },

    typicalConfigTips: {
        sched_autogroup: 'Disable automatic process group scheduling in high-concurrency \
        scenarios to improve host performance',
        net_interrupt: 'The system network performance can be optimized by binding \
        interrupts based on the CPU to which the NIC belongs',
        wake_up_to_grab: `If wakeup preemption is enabled, processes will frequently \
        fall into sleep or be woken up. Disable wakeup
         preemption to prevent processes from going to sleep or being awoken frequently.\n
        echo NO_WAKEUP_PREEMPTION > /sys/kernel/debug/sched_features`,
        tcp_max_syn_backlog: `tcp_max_syn_backlog specifies the maximum number of clients \
        that can receive SYN (synchronization) packets',
        'net.core.somaxconn': 'Specifies the maximum number of clients that can process data in the server,
         that is, the maximum number of connections`,
        'net.core.rmem_max': 'Specifies the maximum size of the socket receive buffer',
        'net.core.wmem_max': 'Specifies the maximum size of the socket send buffer',
        'net.ipv4.tcp_rmem': `Specifies the size of the read buffer. The three numbers indicate the minimum, default,
        and maximum size of the read buffer, respectively.\nThe default value is 4096 87380 6291456. You are advised
         to change the value to 4096 87380 16777216.\necho \"4096 87380 16777216\" > /proc/sys/net/ipv4/tcp_rmem`,
        'net.ipv4.tcp_wmem': `Specifies the size of the write buffer. The three numbers indicate the minimum, default,
         and maximum size of the write buffer, respectively.\nThe default value is 4096 16384 4194304. You are advised
         to change the value to 4096 65536 16777216.\necho \"4096 65536 16777216\" > /proc/sys/net/ipv4/tcp_wmem`,
        'net.ipv4.max_tw_buckets': 'Specifies the maximum number of TIME_WAIT sockets that can be \
        retained by the system at the same time',
        IO_schedule: `Specifies I/O scheduling. deadline or noop is more suitable for MySQL databases. \
        In the command, \${device} indicates
         the drive name. Use the actual drive name in performance tuning. NVMe drives do not support this operation.\n
        echo deadline > /sys/block/\${device}/queue/scheduler`,
        disk_throughput: 'Specifies the drive throughput. Increase the value to add the drive throughput',
        swappiness: 'Specifies the policy of using the swap partition and memory',
        dirty_ratio: 'Specifies the percentage of dirty data allowed in the memory',
        innodb_thread_concurrency: 'Specifies the operating system threads used by InnoDB to \
        process the user transaction requests',
        innodb_read_io_threads: 'Specifies the number of threads that processes the read requests in the request queue',
        innodb_write_io_threads: '"Specifies the number of threads that process the read requests in the request queue',
        innodb_buffer_pool_instances: `Specifies the number of memory buffer pools. Enable multiple memory buffer pools
         to hash data to be buffered to different buffer pools. In this way, the memory can \
         be read and written concurrently`,
        innodb_open_files: 'Specifies the number of files that can be opened by InnoDB in the \
        innodb_file_per_table mode',
        innodb_buffer_pool_size: 'Specifies the size of the buffer that caches data and indexes',
        innodb_log_buffer_size: 'Specifies the buffer that caches redo logs',
        innodb_io_capacity: 'Specifies the maximum IOPS of InnoDB background threads',
        innodb_log_files_in_group: 'Specifies the number of redo log groups',
        innodb_log_file_size: 'Specifies the size of redo log groups',
        innodb_flush_method: `Specifies the size of the redo log file.\n
        A large value is recommended for write-intensive scenarios. However,
        large size of the redo log file causes long data restoration time.\n
        When testing the ultimate performance in the non-production environment, \
        increase the log file size as large as possible.\n
        In commercial scenarios, consider the data restoration time when setting this parameter`,
        innodb_spin_wait_delay: 'Specifies the polling interval',
        innodb_sync_spin_loops: 'Specifies the number of polling times',
        innodb_spin_wait_pause_multiplier: 'Specifies the random number used to control the polling interval',
        innodb_lru_scan_depth: 'Specifies the number of available pages in the LRU list',
        innodb_page_cleaners: 'Specifies the number of threads for refreshing dirty data',
        innodb_purge_threads: 'Specifies the number of threads for purging undo',
        table_open_cache_instances: 'Specifies the number of partitions that cache table handles in MySQL',
        table_open_cache: 'Specifies the number of tables opened by Mysqld',
        network_queue: `The single-core capability of TaiShan servers is insufficient and the number of cores is large.
         Therefore, NIC multi-queue interruption (16 queues by default) needs to \
         be deployed on the server and the client.
         The client and server must be configured with at least GE NICs and are connected through optical fibers.\n
        The recommended configuration is as follows:\nThe NIC on the server is configured with 16 interrupt queues.\n
        The NIC on the client is configured with 48 interrupt queues`,
        'tcp-segmentation-offload': `When the CPU usage of the openGauss database is greater than 90%, \
        the CPU becomes a bottleneck.
         In this case, you need to enable offloading to offload network slices to the NIC.\n
        Run the following commands to enable the tso, lro, gro and gso features`,
        'large-receive-offload': `When the CPU usage of the openGauss database is greater than 90%, \
        the CPU becomes a bottleneck.
         In this case, you need to enable offloading to offload network slices to the NIC.\n
        Run the following commands to enable the tso, lro, gro and gso features`,
        'generic-segmentation-offload': `When the CPU usage of the openGauss database is greater than 90%, \
        the CPU becomes a bottleneck.
         In this case, you need to enable offloading to offload network slices to the NIC.\n
        Run the following commands to enable the tso, lro, gro and gso features`,
        'generic-receive-offload': `When the CPU usage of the openGauss database is greater than 90%, the CPU becomes a
         bottleneck. In this case, you need to enable offloading to offload network slices to the NIC.\n
        Run the following commands to enable the tso, lro, gro and gso features`,
        'net.ipv4.tcp_timestamps': `Specifies whether to enable quick reclamation of \
        the sockets in TIME-WAIT state during
         TCP connection establishment. The default value 0 indicates that quick reclamation is disabled, and the value 1
         indicates that quick reclamation is enabled`,
        'net.ipv4.tcp_mem': `The first number indicates that the kernel does not intervene \
        when the number of pages used by
         TCP is less than 94,500,000.\nThe second number indicates that the kernel enters the memory pressure mode when
         the number of pages used by TCP exceeds 915,000,000.\nThe third number indicates \
         that the \"Out of socket memory\"
         message is displayed when the number of pages used by TCP exceeds 927,000,000`,
        'net.ipv4.tcp_max_orphans': 'Maximum number of orphan sockets',
        'net.ipv4.tcp_fin_timeout': 'Default timeout period',
        'net.ipv4.ip_local_port_range': 'Port range that can be used by TCP or UDP',
        MTU: `You can run the ifconfig command to view the network or set it to a \
        proper value.\n8192 is recommended for a 10GE NIC.\n
        If comm_tcp_mode is set to false on the database node, ensure that the MTU \
        values of all openGauss nodes are the same.
         Otherwise, communication may fail`,
        tx_queue: `You can run the ifconfig command to view the network or set it to a proper value.\n
        4096 is recommended for a 10GE NIC, which can improve network bandwidth utilization`,
        rx_queue: `You can run the ifconfig command to view the network or set it to a proper value.\n
        4096 is recommended for a 10GE NIC, which can improve network bandwidth utilization`,
        huge_page: `Check whether the transparent huge page file in /boot/grub/menu.lst is opened.\n
        Check whether transparent huge page is enabled based on the requirements`,
        max_process_memory: `The logical memory management parameter is max_process_memory, \
        which is used to control the maximum available
         memory on the database node. Set this parameter using the following formula:\nUse the following \
         formula to calculate the available
         memory for job execution:\nmax_process_memory – Shared memory \
         (including shared_buffers) – cstore_buffers\nTherefore, the memory
         available to job execution depends on shared_buffers and cstore_buffers.\nViews for logical \
         memory management are provided to
         display the used memory and peak information in each database block. You can connect to a database node and run
         pg_total_memory_detail to query information about the memory usage on this database node. \
         Alternatively, you can connect to
         the primary node of the database and run pgxc_total_memory_detail to query information \
         about the memory usage on all the
         database nodes`,
        work_mem: `If the physical memory specified by work_mem is insufficient, additional \
        operator calculation data will be
         written into temporary tables based on query characteristics and the degree of parallelism. \
         This reduces performance by five
         to ten times and prolongs the query response time from seconds to minutes.\nIn complex serial \
         query scenarios, \each query
          requires five to ten associated operations. Set work_mem using the following formula: \
          work_mem = 50% of the memory/10\nIn simple
           serial query scenarios, each query requires two to five associated operations. \
           Set work_mem using the following formula:
            work_mem = 50% of the memory/5\nFor concurrent queries, set work_mem using the \
            following formula: work_mem = work_mem in
            serial query scenarios/Number of concurrent SQL statements\nParameter Determining Whether to \
            Spill Execution Operators to Drives\n
            work_mem sets the used memory threshold. Execution operators that can be spilled to \
            drives will be written when the used memory
            exceeds the threshold. Such execution operators include Hash(VecHashJoin), \
            Agg(VecAgg), Sort(VecSort), Material(VecMaterial),
            SetOp(VecSetOp), and WindowAgg(VecWindowAgg). They can be vectorized or non-vectorized. \
            This parameter ensures concurrent
            throughput and the performance of a single query job. Therefore, you need to optimize the parameter
            based on the output of Explain Performance`,
        enable_nestloop: `You can locally control the number of concurrent jobs within the
         same resource pool on the primary node of the database.
         The number of concurrent complex jobs are controlled based on their cost.\nparctl_min_cost
         is used to determine whether a job is complex`,
        enable_bitmapscan: `Specifies whether the optimizer uses bitmap scanning. \
        If the value is on, bitmap scanning is used.
         If the value is off, it is not used.\nNote:\n
        If you only want to temporarily change the value of this parameter during the \
        current database connection (that is, the current session),
         execute the following SQL statement:\nSET enable_bitmapscan to off;\n
        The bitmap scanning applies only in the query condition where a > 1 and b > 1 \
        and indexes are created on columns a and b.
         During performance tuning,if the query performance is poor and bitmapscan operators are in the execution plan,
         set this parameter to off and check whether the performance is improved`,
        enable_hashagg: `Specifies whether to enable the optimizer's use of Hash-aggregation plan types`,
        enable_hashjoin: `Specifies whether to enable the optimizer's use of Hash-join plan types`,
        enable_mergejoin: `Specifies whether to enable the optimizer's use of Hash-merge plan types`,
        enable_indexscan: `Specifies whether to enable the optimizer's use of index-scan plan types`,
        enable_indexonlyscan: `Specifies whether to enable the optimizer's use of index-only-scan plan types`,
        enable_seqscan: `Specifies whether the optimizer uses bitmap scanning. \
        It is impossible to suppress sequential scans entirely,
         but setting this variable to off encourages the optimizer to choose other methods if available`,
        enable_sort: `Specifies the optimizer sorts. It is impossible to fully suppress explicit sorts,
         but setting this variable to off allows the optimizer to preferentially choose other methods if available`,
        rewrite_rule: 'Specifies whether the optimizer enables the LAZY_AGG and MAGIC_SET rewriting rules',
        sql_beta_feature: `Specifies whether to enable the optimizer.
         SEL_SEMI_POISSON/SEL_EXPR_INSTR/PARAM_PATH_GEN/RAND_COST_OPT/PARAM_PATH_OPT/PAGE_EST_OPT test`,
    },
    diagnostic: {
        common_title: 'Memory Diagnostic Analysis',
        analysis_type: 'Memory Diagnosic Analysis',
        analysis_log: 'System Diagnostics Logs',
        taskParams: {
            taskname: 'Task Name',
            analysisTarget: 'Analysis Object',
            Application: 'Application',
            attachTip: 'The application is running when the collection task is started. \
            The sampling duration is controlled by the configuration parameter. \
            This mode applies to scenarios where the application runs for a long time.',
            app_dir: 'Application Path',
            app_parameters: 'Application Parameters',
            app_runUser: 'Application User',
            app_runUser_pwdPlaceholder: 'Enter the system user that starts the application.',
            app_user: 'Name',
            app_passWord: 'Password',
            app_passWord_pwdPlaceholder: 'Enter the user password.',
            memory_diagnose: 'Memory Diagnosis Analysis',
            storage_type: 'Storage I/O Analysis',
            analysis_type: 'Analysis Type',
            content_diagnose: 'Diagnosis Content',
            oomTip: 'If OOM is selected, OOM diagnosis tasks and storage I/O performance analysis tasks \
            cannot be executed at the same time.',
            duration: 'Diagnosis Duration (s)',
            duration_placeholder: 'By default, the diagnosis lasts until the program ends.',
            interval: 'Sampling Interval (ms) ',
            duration_range: '(1~60000)',
            interval_tip: 'Note: The smaller the interval, the greater the impact on \
            the performance of the analysis process.',
            samplingDelay: 'Diagnosis Start Time (s)',
            switch: 'Configure Node Parameters',
            assemblyLocation: 'Binary/Symbol File Path',
            sourceLocation: 'C/C++ Source File Path',
            collectStack: 'Collect call stack',
            collectSize: 'Size of the Collected File(MiB)',
            collectSize_range: '(1~100)',
            scheduled_timing: 'Scheduled Startup',
            taskName_placeholder: 'Enter a task name',
            memory_leakage: 'Memory Leak',
            memory_consumption: 'Memory Usage',
            memory_abnormal: 'Memory Overwriting',
            memory_overwriting: 'Memory Overwriting',
            exception_tip: 'Use GCC 4.9 version or later to recompile the program, and...',
            exception_tip_detail: `Use GCC 4.9 version or later to recompile the program, and:<br/>\
         • option -fsanitize=address must be selected<br/>\
         • option -g must be selected<br/>\
         •  option -fno-omit-frame-pointer can be selected to obtain call stack information \
         that is easier to understand<br/>\
         • -O1 or a higher optimization level for compilation can be selected<br/>\
         such as gcc -fsanitize=address -fno-omit-frame-pointer -O1 -g use-after-free.c -o use-after-free<br/>\
         The compiled programs must run in GCC 4.9 or later.`,
            stopException: 'Stop Analysis After Exception Occurs',
            createTip: `<br/>\If the glibc version is earlier than 2.33, allocator statistics \
            may be inaccurate due to integer overflow.`
        },
        exception: {
            exception_type: 'Overwriting type: ',
            access_type: 'Access Type:',
            access_stack: 'Overwriting access point:',
            help: 'Auxiliary Information: ',
            more_detail: 'View More',
            more_detail_title: 'More information about memory overwriting'
        },
        consumption: {
            consumption: 'Memory Usage',
            site: 'IP Address',
            apply: 'Application',
            process_map: 'MAP Information of Process Memory',
            distributor: 'Allocator',
            mem_size: 'Physical Memory',
            summury: {
                rss_peak: 'Peak Physical Memory(KB)',
                vss_peak: 'Peak Virtual Memory(KB)',
                malloc_peak: 'Peak Requested Memory',
                malloc_count: 'Request Times',
                malloc_size: 'Requested Bytes',
                free_count: 'Release Times',
                free_size: 'Released Bytes',
                leak_count: 'Leakage Times',
                leak_size: 'Leakage Bytes',
                system_bytes_peak: 'Peak Memory Allocated by Allocator',
                in_use_bytes_peak: 'Peak Memory Used by Allocator',
                free_bytes_peak: 'Peak Idle Memory of Allocator',
                arena: 'Peak Number of Allocator Arena',
                mmap_count_peak: 'Peak Number of mmap Areas',
                mmap_size_peak: 'Peak Size of mmap Areas',
            },
            sequence: {
                rss: 'Physical Memory',
                vss: 'Virtual Memory',
                malloc_size: 'Requested Memory',
                malloc_count: 'Request Times',
                free_count: 'Release Times',
                free_size: 'Released Memory',
                system_bytes: 'Allocated Memory of Allocator',
                free_bytes: 'Idle Memory of Allocator',
                in_use_bytes: 'Used Memory of Allocator',
                arena: 'Number of Allocator Arena',
                mmap_count: 'Number of mmap Areas',
                mmap_size: 'Size of mmap Areas',
            }
        },
        searchFunction: 'Search Function',
        filterSelfLeakText: 'Functions with memory leaks',
        filterSelfReleaseText: 'Functions with abnormal memory release',
        filterAllText: 'All functions',
        tab: {
            sourceCode: 'Source Code',
        },
        table: {
            memReleaseHead1: 'malloc for application, delete for release',
            memReleaseHead2: 'malloc for application, delete[] for release',
            memReleaseHead3: 'new for application, free for release',
            memReleaseHead4: 'new[] for application, delete for release',
            memReleaseHead5: 'new[] for application, delete for release',
            memReleaseHead6: 'new[] for application, free for release',
            memReleaseHead7: 'malloc for application, munmap for release',
            memReleaseHead8: 'new for application, munmap for release',
            memReleaseHead9: 'realloc for application, delete for release',
            memReleaseHead10: 'realloc for application, delete[] for release',
            memReleaseHead11: 'realloc for application, munmap for release',
            memReleaseHead12: 'valloc for application, delete for release',
            memReleaseHead13: 'valloc for application, delete[] for release',
            memReleaseHead14: 'valloc for application, munmap for release',
            memReleaseHead15: 'mmap for application, delete for release',
            memReleaseHead16: 'mmap for application, delete[] for release',
            memReleaseHead17: 'mmap for application, free for release',
            memReleaseHead18: 'mmap for application, delete for release',
            memReleaseHead19: 'mmap for application, delete[] for release',
            memReleaseHead20: 'mremap for application, free for release',
            memReleaseHead21: 'calloc for application, delete for release',
            memReleaseHead22: 'calloc for application, delete[] for release',
            memReleaseHead23: 'calloc for application, munmap for release',
            mallocLine: 'Requested Row No',
            mallocFile: 'Requested File',
            mallocFunc: 'Requested Point',
        },
        stack: {
            nodeTipBtn: 'View Code',
            memLeakTable: {
                memLeakTimes: 'Leaks',
                memLeakSize: 'Size (Byte)',
                memLeakTableSelf: 'Self Memory Leak',
                memLeakTableChild: 'Subprogram Memory Leak',
                memReleaseTableSelf: 'Self Memory Release Exception',
                memReleaseTableChild: 'Subprogram Memory Release Exception',
            },
            invocationDepth: 'Call Depth',
            beInvocationDepth: 'Called Depth',
            stackInfo: 'Displayed nodes:{0}/Total:{1}',
            unlimited: 'Unlimited'
        },
        memException: {
            memLeakTimes: 'Memory leaks',
            memLeakSize: 'Leaked memory size',
            memAbnormalRelease: 'Memory release exceptions',
        },
        sourceCode: {
            legend: {
                selfMemLeak: 'Self Memory Leak',
                childMemLeak: 'Subprogram Memory Leak',
                selfAbnormalRelease: 'Self Release Exception',
                childAbnormalRelease: 'Subpragram Release Exception'
            }
        },
        memReleaseType: 'Abnormal release type',
        noLeak: 'No memory leak in the current process.',
        noLeakApp: 'No memory leak in the current application',
        noAbnormalRelease: 'No abnormal memory release in the current process.',
        noException: 'No memory overwriting in the current process.',
    },
    network_diagnositic: {
        analysis_type: 'Network I/O diagnosis and analysis',
    },
    oomDetail: {
        basicTitle: 'Basic Information',
        callStackTitle: 'Call Stack',
        systemMemoryTitle: 'System Memory',
        processMemoryTitle: 'Process Memory',
        totalRecords: 'Total',
        jumpTo: 'Go',
        viewDetails: 'View Details',
        oomDetailsTitle: 'OOM Details',
        shutdown: 'Close',
        placeholder: 'Please enter a keyword',
        timeLine: 'Time',
        trigger: 'Trigger',
        killer: 'Killer'
    },
    popInfo: {
        TOP10_process: 'Process/Thread Core Binding Information',
        nuclear_tied: 'Core bound',
        untied_nuclear: 'No core is bound.',
        Irq: 'Hardware interrupt core binding information',
        Irq_cpu: 'CPU hard interrupt core binding information',
        Xps: 'XPS/RPS core binding information',
        Xps_cpu: 'Device queue core binding information',
        Xps_title: 'Device queue information',
    },
    pcieDetailsinfo: {
        processBindingTitle: 'Core Pinning Status of Top 10 Processes',
        cpuView: 'CPU core view',
        processView: 'Process View',
        interruptsView: 'Interrupt Number View',
        hardInterruptTitle: 'Core Pinning Status of Hardware Interrupts',
        xrsBindingTitle: 'XPS/RPS Core Pinning Status',
        bindingState: 'Core Pinning Status',
        processTitle1: 'PID/TID',
        processTitle2: 'Process Name',
        processTitle3: 'Core Pinning Info',
        processTitle4: 'CPU core',
        processTitle5: ' Thread Info of Top 10 Processes Pinned to CPU',
        operation: 'Operation',
        viewMore: 'View',
        interrupttitle1: 'Interrupt Number',
        interrupttitle2: 'Device interrupt information',
        interrupttitle3: 'Interruption times',
        xpsTitle1: 'Network port queue ID',
        xpsTitle2: 'Device information queue',
        cmd: 'cmd information',
        disk_name: 'Device Name',
        disk_info: 'Device Info',
        interrupt: 'Interrupt Event',
        interrupt_number: 'Interrupts',
        disk_list_info: 'Device Info',
        io_value_sumury: 'I/O Size Distribution',
        io_delay_sumury: '/O Latency Distribution',
        range: 'Range (µs)',
        read: 'Read I/O Frequency (times/s)',
        write: 'Write I/O Frequency (times/s)',
        scheduling_algorithm: 'Scheduling Algorithm ',
        detail_item: 'Configuration Item',
        value: 'Value',
    },
    common_term_task_tab_pcie: 'PCIe Device Info',
    plugins_common_remote_env: {
        use_process: 'Process of Applying for a Remote Lab Trial',
        apply_remote_env: 'Applying for a Remote Lab Trial',
        apply_remote_env_info: 'Kunpeng Porting Advisor, Kunpeng Compiler, Kunpeng Hyper Tuner, \
        and dynamic binary instruction translation tool (ExaGear) have been installed and \
        deployed on the remote cloud server.',
        remaining_places: 'Remaining Free Trial Quota: ',
        immediately: 'Apply Now',
        check_email: 'Receive the email notification',
        check_email_info: 'After your application is approved, the cloud server information \
        will be sent to your reserved email box.',
        config_serve: 'Configure the cloud server',
        config_serve_info: 'Follow the information in the email to configure remote login for the cloud server. \
        You can also configure the IP address of a local server that has the Kunpeng DevKit deployed.',
        config_now: 'Configure Now',
        early_release_or_extended_use: 'Release before expiration or extend the use',
        early_release_or_extended_use_info: 'You can release resources before expiration or \
        extend the use on the webpage where you applied for the cloud server.'
    },
    plugins_common_apply_free_env_info: 'You can also apply for a free trial environment.',
    plugins_common_apply_free_env_link: 'Click here',
    plugins_common_configure_remote_server: 'Hyper Tuner – Configure Remote Server',
    plugins_common_free_trial_remote_environment: 'Applying for a Remote Lab Trial',
    common_term_file_path_error: 'Incorrect format.',
    hpc_project_node_select_title: {
        memAccessAnalysis: 'Memory access analysis supports up to 10 nodes in the HPC scenario.',
        resourceAnalysis: 'Resource scheduling analysis supports up to 10 nodes in the HPC scenario.',
        syslockAnalysis: 'Lock and wait analysis supports up to 10 nodes in the HPC scenario.',
    }
};
