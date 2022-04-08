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

export const I18N_EN = {
    perf_sysperf_advisor: 'System Profiler',
    perf_javaperf_advisor: 'Java Profiler',
    perf_memory_diagnose: 'System Diagnostics',
    perf_tuning_assistant: 'Tuning Assistant',
    plugins_common_title_noData: 'No Data',
    plugins_common_title_create_project: 'Please create a project.',
    perfadvisor_login: 'Log In to Hyper Tuner',
    perf_setting: 'Hyper Tuner - Settings',
    sysperf_setting: 'System Profiler Settings',
    diagnose_setting: 'System Diagnostics Settings',
    plugins_tuning_assistant_setting: 'Tuning Assistant Settings',
    plugins_sysperf_message_logout: 'Are you sure you want to logout Hyper Tuner?',
    plugins_sysperf_message_logout_ok: 'You have logged out of the system.',
    plugins_sysperf_button_confirm: 'OK',
    plugins_sysperf_button_cancel: 'Cancel',
    plugins_sysperf_title_createtask: 'Create Task',
    plugins_sysperf_title_reanalyzeTask: 'Reanalyze Task',
    plugins_sysperf_title_reanalyzeServer: 'Reanalyze Server',
    plugins_sysperf_label_targetName: 'Task Name',
    plugins_sysperf_label_analysisTarget: 'Analysis Object',
    plugins_sysperf_label_diagnoseObj: 'Diagnosis Object',
    plugins_sysperf_label_analysisType: 'Analysis Type',
    plugins_sysperf_label_allTargets: ['Profile System', 'Launch Application'],
    plugins_sysperf_label_compareType: 'Comparison Type',
    plugins_sysperf_label_horizontal: 'Horizontal Analysis',
    plugins_sysperf_label_hvertical: 'Vertical Analysis',
    plugins_sysperf_label_linkagedObject: 'Overall Analysis',
    plugins_sysperf_label_hotspotAnalysis: 'Hotspot Function',
    plugins_common_message_sshClientCheck: 'The SSH client is not installed on the device. Obtain and install the SSH client.',
    plugins_sysperf_label_allTypes: [
        'Hotspot Function Analysis',
        'Overall Analysis',
        'Process/Thread Performance',
        'Resource Scheduling',
        'Locks and Waits',
        'Memory Access Statistics',
        'Microarchitecture',
        'I/O Performance',
        'HPC',
        'Memory',
        'Tuning Assistant',
        'Network I/O',
        'Storage I/O'
    ],
    plugins_perf_message_process: {
        preTip: '{0}/{1} is to be exported.',
        packagingTip: '{0}/{1} packing data.',
        packageSucTip: '{0}/{1} data packed successfully.',
        exportingTip: '{0}/{1} exporting...',
        exportSucDetail: '{0}/{1} exported successfully. {3} packages in total, {4}.',
        exportFail: ' Import task failed. ',
        download: 'Download',
        importSuccess: 'Import {0}/{1} successful.',
        importPorject: 'Import Project-'
    },

    threshold: {
        tips_content: 'The number of sampling analysis records has reached the warning threshold ({0}/{1}). Delete some records.',
        warn_content: 'The number of sampling analysis records has reached the limit ({0}/{1}). Delete some records.',
        heapdump_tips_content: 'The number of heap dump files has reached the upper limit ({0}/{1}). Delete some heap dump.',
        heapdump_warn_content: 'The number of heap dump files has reached the upper limit ({0}/{1}). \
        Functions for new data have been disabled. Delete some files. ',
        heapdump_max_size_tips_normal: 'Failed to upload heap dump file {0}. The size of the data to be uploaded exceeds {1} MiB. \
        Contact the administrator to adjust the threshold.',
        heapdump_max_size_tips_admin: 'Failed to upload the heap dump file {0}. The size of the data to be uploaded \
        exceeds {1} MiB. Choose Threshold Configuration > Heap Dump to adjust the threshold. ',
        heapdump_report_name_tip: 'The file name must start with a letter and contain 6 to 128 characters, allowing only letters, \
        digits, spaces, periods (.), plus signs (+), hyphens (-), round brackets (( )), and underscores (_). ',
        threaddump_tips_content: 'The number of thread dump has reached the upper limit ({0}/{1}). Delete some thread dump.',
        threaddump_warn_content: 'The number of thread dump has reached the upper limit ({0}/{1}). \
        Functions for new data have been disabled. Delete some thread dump.',
        threaddump_max_size_tips_normal: 'Failed to upload the thread dump file {0}. The size of the data to be uploaded exceeds {1} MiB.',
        threaddump_max_size_tips_admin: 'Failed to upload the thread dump file {0}. The size of the data to be uploaded exceeds {1} MiB.',
        threaddump_report_name_tip: 'The file name must start with a letter and contain 6 to 128 characters, allowing only letters, \
        digits, spaces, periods (.), plus signs (+), hyphens (-), round brackets (( )), and underscores (_).',
        gclog_tips_content: 'The number of GC logs has reached the warning threshold ({0}/{1}). Delete some logs.',
        gclog_warn_content: 'The number of GC logs has reached the upper limit ({0}/{1}). Functions for new data have \
        been disabled. Delete some logs.',
        gclog_max_size_tips_normal: 'Failed to upload the GC log {0}.The size of the data to be uploaded exceeds {1} MiB. \
        Contact the administrator to adjust the threshold.',
        gclog_max_size_tips_admin: 'Failed to upload the GC log {0}. The size of the data to be uploaded exceeds {1} MiB.',
        gclog_report_name_tip: 'The file name must start with a letter and contain 6 to 128 characters, allowing only letters, \
        digits, spaces, periods (.), plus signs (+), hyphens (-), round brackets (( )), and underscores (_).'
    },
    plugins_common_configure_remoteServer: 'Hyper Tuner – Configure Remote Server',
    plugins_perfadvisor_free_trial_remote_environment: 'Applying for a Remote Lab Trial',
    plugins_common_message_configSuccess: 'Configuration saved successfully.',
    plugins_common_button_login: 'Log In',
    plugin_common_button_look: 'View Now',
    plugins_common_title_login: 'Log In to Hyper Tuner',
    plugins_common_term_login_other: 'You have logged in from another terminal. Please check and try again.',
    plugins_common_term_report_401: 'Login timeout or not logged in.',
    common_term_timeout: 'Login timed out. Please try again.',
    plugins_common_certificate_verification_failed: 'Certificate verification failed. Please select a certificate again.',
    plugins_common_uninstall_remoteServer: 'Uninstall Hyper Tuner',
    plugins_perfadvisor_title_disclaimer: 'read the disclaimer',
    plugins_common_upgrade_remoteServer: 'Upgrade Hyper Tuner',
    plugins_sysperf_createProject: 'Create Project',
    plugins_sysperf_modifyProject: 'Modify Project',
    plugins_sysperf_continueExport: 'Continue Export',
    plugins_sysperf_detail: 'detail',
    plugins_sysperf_deleteProject: 'Project {0} is deleted successfully.',
    plugins_sysperf_deleteProject_confirm: 'Are you sure you want to delete project {0}?',
    plugins_sysperf_deleteTask_confirm: 'Are you sure you want to delete task {0}?',
    plugins_sysperf_message_task_forbidden_delete: 'Failed to delete task {0} because data is being collected for the task.',
    plugins_sysperf_message_task_forbidden_modify: 'Failed to modify task {0} because data is being collected for the task.',
    plugins_sysperf_deleteTask: 'Task {0} is deleted successfully.',
    plugins_sysperf_exportTask_openUrl: 'Open User Guide',
    plugins_sysperf_exportTask: 'You are about to export task {0} of project {1}. \
    The exported content does not involve user privacy and key assets. \
    See the description about exported content in the User Guide to find more information. \
    Continue',
    plugins_common_button_save: 'save',
    plugins_sysperf_dowloadPath: 'File downloaded successfully. Save path: {0}',
    plugins_sysperf_term_new_project: 'New Project',
    plugins_perf_cert_expiring: 'The cert.pem certificate of the Hyper Tuner backend server will expire on {0}. \
    Please update the certificate in time.',
    plugins_perf_cert_expired: 'The cert.pem certificate of the Hyper Tuner backend server has expired. \
    Please update the certificate immediately.',
    plugins_perf_cert_none: 'The cert.pem certificate of the backend server of the Hyper Tuner to be connected does not exist.',
    plugins_perf_message_versionCompatibility: 'The plugin version does not match the software version on the server. \
    Unpredictable errors may occur if you continue. You are advised to use a plugin version that matches the software \
    version on the server. Software versions that match the current plugin: {0}. Current software version on the server: {1}.',
    plugins_common_message_responseError: 'The server does not respond. \
    Check that the tool has been deployed on the server and the network connection is normal.',
    plugins_common_message_responseError_deployScenario: 'The server does not respond. \
    Check that the network connection is normal.',
    plugins_common_right_click_menu: 'Right-click for more settings.',
    plugins_common_button_checkErrorDetails: 'Handling Suggestions',
    plugins_common_title_errorInstruction: 'Server Exception',
    plugins_common_show_user_current_user: 'Current User: ',
    plugins_common_show_user_normal_user: 'common user',
    plugins_common_show_user_admin_user: 'administrator',
    plugins_common_show_user: 'user',
    plugins_common_show_user_btn_true: 'OK',
    plugins_common_message_figerLose: 'The authenticity of host {0} can\'t be established. The fingerprint is SHA256:{1}. \
    Are you sure you want to continue connecting (Yes/No)?',
    pligins_common_message_confirm: 'Yes',
    pligins_common_message_cancel: 'No',
    plugins_common_message_figerWarn: 'The number of fingerprints stored in the local configuration file exceeds 100. \
    Delete the fingerprints from src/extension/assets/config.json in the plug-in installation directory.',
    plugins_common_message_resqust_timeout: 'Network timeout.',
    plugins_javaperf_title_create_guardian: 'Add a Guardian',
    plugins_javaperf_title_add_guardian: 'Add Guardian',
    plugins_javaperf_title_cfg: 'Java Profiler Settings',
    plugins_javaperf_label_guardianList: 'Guardian List',
    plugins_javaperf_label_profillingRecords: 'Profiling Analysis',
    plugins_javaperf_label_samplingRecords: 'Sampling Analysis',
    plugins_javaperf_label_savedReport: 'Data List',
    plugins_javaperf_label_no_permission_display: 'You do not have the permissions to view common user\'s analysis information.',
    plugins_javapref_label_heapdumpReport: 'Heap Dump',
    plugins_javapref_label_threaddumpReport: 'Thread Dump',
    plugins_javapref_label_gclogReport: 'GC Logs',
    plugins_javaperf_menu_analysisRecordManage: 'Analysis record management',
    plugins_javaperf_message_stopProfiling: 'Stop the profiling analysis of the current process?',
    plugins_common_message_upload_installFailed: 'Failed to deploy the tool. \
    Check whether the /tmp directory on the server is readable and writeable and whether the following files exist. \
    If yes, delete the files and try again.',
    plugins_common_message_upload_uninstallFailed: 'Failed to uninstall the tool. \
    Check whether the /tmp directory on the server is readable and writeable and whether the following files exist. \
    If yes, delete the files and try again.',
    plugins_common_message_upload_upgradeFailed: 'Failed to upgrade the tool. \
    Check whether the /tmp directory on the server is readable and writeable and whether the following files exist. \
    If yes, delete the files and try again.',
    plugins_perf_java_profiling_dulTip: 'You have a profiling task being analyzed. Close the page first.',
    plugins_perf_java_profiling_dulTip2:
        'Are you sure you want to create an online analysis task? If you click OK, the current online analysis record will be closed.',
    plugins_perf_java_sampling_delete_tip: 'Are you sure you want to delete analysis record {0}?',
    plugins_perf_java_sampling_delete_user_tip: 'Are you sure you want to delete ({0}) analysis record {1}?',
    plugins_perf_java_heapdump_report_delete_tip: 'Are you sure you want to delete heap dump file {0}?',
    plugins_perf_java_heapdump_report_delete_user_tip: 'Are you sure you want to delete ({0}) heap dump file {1}?',
    plugins_perf_java_heapdump_report_export_loading: 'Exporting heap dump file {0}',
    plugins_perf_java_threaddump_report_delete_tip: 'Are you sure you want to delete thread dump file {0}?',
    plugins_perf_java_threaddump_report_delete_user_tip: 'Are you sure you want to delete ({0}) thread dump file {1}?',
    plugins_perf_java_threaddump_report_export_loading: 'Exporting thread dump file {0}',
    plugins_perf_java_gclog_report_delete_tip: 'Are you sure you want to delete gc log {0}?',
    plugins_perf_java_gclog_report_delete_user_tip: 'Are you sure you want to delete ({0}) gc log {0}?',
    plugins_perf_java_gclog_report_export_loading: 'Exporting gc log {0}',
    plugins_perf_java_heapdump_report_import_success: 'Data imported. View it in the Data List.',
    plugins_perf_java_saved_report_sucess: 'Data saved. View it in the Data List on the left. ',
    plugins_javaperf_message_importProfiling_warningtip:
        'Importing a profiling record will stop the ongoing profiling process. Exercise caution when performing this operation.',
    plugins_javaperf_message_importProfiling_warningtip2:
        'Are you sure you want to import the online analysis records? If you click OK, the current record will be closed.',
    plugins_javaperf_message_importProfiling_errTip: 'The imported profiling record data is incorrect.',
    plugins_common_message_sshAlgError: 'Connection detection failed. The algorithm on the client side does not match that on the \
    server side. For details about how to configure a security algorithm, see FAQ.',
    plugins_common_tips_checkConn_root:
        'You are using the root user account. A common user account is recommended. For details , see FAQs. Continue?',
    plugins_common_tips_checkConn_noroot: 'You are using a common user account {0}. Check that the following conditions are met: \r\n\
        The common user {0} has been added to user group wheel. For details, see FAQs. Continue?',
    plugins_common_tips_checkConn_openFAQ: 'Open FAQ',
    plugins_common_tips_copySucceeded: 'Backup successful',
    plugins_common_term_upload: 'Uploading...',
    plugins_javaperf_import_sampling_error: 'The size of the file to be uploaded cannot exceed 250 MiB.',
    plugins_common_term_view: 'View',
    plugins_sysperf_project: {
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
        importAndExportTask: 'Import/Export Task',
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
        closeImportOrExportTaskTip: 'The task window is closed. You can view details on the Import/Export Task page in Settings.',
        createExportTaskTip: 'Only the projects and tasks created by the current user can be exported.',
        selectProject: 'Project',
        selectProjectPlaceholder: 'Select a project.',
        selectTask: 'Task',
        selectTaskPlaceholder: 'Select a task.',
        downloadExportTaskTip: 'Ensure that the compressed file is complete when importing data for analysis.',
        createImportTaskProjectPlaceholder: 'If no project name is entered, the project name in the task imported will be used.',
        createImportTaskTaskPlaceholder: 'If no task name is entered, the name of the task imported will be used.',
        importMode: 'Import Mode',
        uploadFile: 'Upload file',
        specifyFilePath: 'Specify file path',
        fileStoragePath: 'File Path',
        fileStoragePathPlaceholder: 'Enter the full path of the file on the server.',
        browse: 'Browse',
        viewDeletedTaskTip: 'The task has been deleted. Are you sure you want to decompress the data to create the task again?',
        deleteTaskTip: 'If the task is deleted, all data related to the task will be deleted. Exercise caution when performing  \
        this operation.',
        bigDataInfo: 'Collects and analyzes common CPU, memory, storage I/O, and network I/O resources on a server, and provides  \
        typical configurations for big data solutions and top data statistics.',
        distributedStorageInfo: 'Collects and analyzes common CPU, memory, storage I/O, and network I/O resources on servers,  \
        and provides typical configurations for distributed storage solutions and top data statistics.',
        generalScenarioInfo: 'Collects and analyzes the CPU, memory, storage I/O, and network I/O resources on a server and  \
        provides top data statistics.',
    },
    plugins_javaperf_title_createTime: ' Create Time:',
    plugins_javaperf_title_importTime: ' Import Time:',
    plugins_sysperf_disk_message: {
        spaceTip: 'The total disk space is {0}GB, \
        and the remaining disk space is {1}GB. Recommended remaining disk space is greater than {2}GB, \
        Delete some historical analysis records to free up space. ',
        space: 'The remaining workspace of the Kunpeng Hyper Tuner Plugin approaches to the threshold. The total workspace capacity is \
        {0}GB, and the available space is {1}GB. The minimum available workspace recommended is > {2}GB, \
        Delete historical analysis records to release space. ',
        diskTip: 'The total workspace capacity is {0}GB, \
        and the remaining workspace is {1}GB. Recommended remaining workspace space is greater than {2}GB, \
        Delete some historical analysis records to free up space. ',
        disk: 'The available drive space of the Kunpeng Hyper Tuner Plugin approaches to the threshold. The total drive capacity is {0}GB, \
        and the available space is {1}GB. The minimum available space recommended is > {2}GB, \
        Delete historical analysis records to release space. ',
    },
    plugins_sysperf_normal_task: 'Common Analysis',
    plugins_sysperf_linkage_task: 'Associated Analysis',
    plugins_sysperf_tuning_analysis: 'Tuning Analysis',
    plugins_sysperf_compare_task: 'Comparison Report',
    plugins_common_tips_connFail: 'Failed to check the SSH connection. Check whether the user name and password are correct.\
     Too many retries will also cause the check failure.',
    plugins_common_term_task_detail: 'Task details',
    plugins_common_term_connect_fail: 'Connection Fail'
};
