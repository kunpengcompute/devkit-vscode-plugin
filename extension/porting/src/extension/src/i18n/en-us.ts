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
    common_term_download_success: 'File downloaded successfully. Save path: {0}',
    common_term_migration_success: '[{0}] Porting task successful.',
    common_term_migration_fail: '[{0}] Porting task failed.',
    common_term_migration_info: '[{0}] Porting… {1}. Executing {2}.',
    common_term_migration_success_file_tips: 'Download the file({0}) in the current dialog box. \
    If you close the dialog box, the file will be lost.',
    common_term_migration_success_file_download: 'Download Porting Result',
    common_term_migration_fail_content: '{0}, For detailed log information, see {1}logs/porting.log.',
    common_term_migration_fail_steps: 'step {0} ',
    common_term_migration_fail_precheck: '[Check Environment] Prerequisite {0} ',
    common_term_migration_fail_bash: '[Execute Script] step {0} ',
    common_term_migration_fail_oscheck: 'Check the target system ',
    common_term_migration_fail_sup: 'fail',
    common_term_report_soFile_dependent: '{1} of a total of {0} need to be ported.',
    common_term_report_soFile_dependent2: '{1} of a total of {0} needs to be ported.',
    common_term_report_soFile_dependent3: 'Total: {0}',
    common_term_report_detail_ctans_lins: 'Code Lines：{1} lines; ',
    plugins_porting_Estimated_standard_subtitle: 'Estimation standard: 1 person month = {0} \
    lines of C/C++/Fortran/Go source code or {1} lines of assembly code',
    common_Estimated_standard_subinfo: 'person months',
    common_Estimated_standard_subinfo2: 'person month',
    plugins_port_report_level0_desc: 'Compatible ',
    plugins_port_report_level0_result: 'Download',
    plugins_port_report_level1_desc: 'Compatible ',
    plugins_porting_term_c_line: 'Estimation Standard for C/C++ Code Porting Workloads (Line/Person-Month)',
    plugins_porting_term_asm_line: 'Estimation Standard for Assembly Code Porting Workloads (Line/Person-Month)',
    plugins_porting_term_p_month_flag: 'Display Workload Estimation Results',
    plugins_port_report_level1_result: 'Download the source code of the Kunpeng version and compile it directly.',
    plugins_port_report_level2_desc: 'To Be Verified',
    plugins_port_report_level2_result: 'Obtain the source code and compile it to a Kunpeng-compatible version or use \
    an alternate solution.',
    plugins_port_report_level3_desc: 'Compatible',
    plugins_port_report_level3_result: 'Download',
    plugins_port_report_level4_desc: 'Compatible',
    plugins_port_report_level4_result: 'Download the source code of the Kunpeng version and compile it directly.',
    plugins_port_report_level5_desc: 'To Be Verified',
    plugins_port_report_level5_result: 'Verify whether it is compatible with the Kunpeng platform. If not, obtain a \
Kunpeng-compatible version from the supplier or obtain the source code and compile it to a Kunpeng-compatible version.',
    plugins_port_report_level6_desc: 'Compatible',
    plugins_port_report_level6_result: 'Download',
    plugins_port_report_level7_desc: 'To Be Verified',
    plugins_port_report_level7_result: 'Verify whether it is compatible with the Kunpeng platform. If not, \
obtain a Kunpeng-compatible \
version from the supplier or obtain the source code and compile it to a Kunpeng-compatible version.',
    common_term_report_result: 'Analysis Results',
    common_term_report_right_info: 'Total Dependencies',
    common_term_report_right_info1: 'Dependency Libraries',
    common_term_report_right_info2: 'Compatible',
    common_term_report_right_info3: 'To be Verified',
    common_term_report_right_info4: 'Manpower',
    common_term_operate_download: 'Download',
    plugins_port_option_soFileType_software_package: 'Software Package to Download',
    plugins_port_option_soFileType_dynamic_library: 'Dynamic library',
    plugins_port_option_soFileType_static_library: 'Static library',
    plugins_port_option_soFileType_executable_file: 'Executable file',
    plugins_port_option_soFileType_jar_packagey: 'Jar package',
    common_term_no_label: 'No.',
    common_term_name_label: 'File',
    plugins_common_term_type_label: 'Type',
    common_term_path_label: 'Path',
    common_term_operate_sugg_label: 'Handling Suggestions',
    common_term_operate: 'Handling Suggestions',
    plugins_common_cfile_name_laebl: 'File Name',
    plugins_common_term_file_type: 'File Type',
    plugins_common_software_package: 'Software Package to Download',
    plugins_dep_message_no_download_link: 'The download link cannot be found. Please check.',
    plugins_dep_option_soFileType_dynamic_library: 'Dynamic library',
    plugins_dep_option_soFileType_static_library: 'Static library',
    plugins_dep_option_soFileType_software_package: 'Software Package to Download',
    plugins_dep_option_soFileType_executable_file: 'Executable file',
    plugins_dep_option_soFileType_jar_packagey: 'Jar package',
    common_term_modify_suc: 'Modify history task threshold successfully.',
    common_term_report_level0_desc: 'The Kunpeng community provides a verified Arm64 version of this SO library.',
    plugins_term_report_level_desc: 'Compatible',
    plugins_term_report_leeif_desc: 'To Be Verified',
    common_term_report_level1_desc: 'So libraries have been verified on the Kunpeng platform, \
the Kunpeng community has an arm64 version, \
user need to compile on the platform.',
    common_term_report_level2_desc: 'So libraries cannot be supported on the Kunpeng platform, \
    and the Kunpeng community has no alternative.',
    common_term_report_level3_desc: 'Software are compatible with Kunpeng platform.',
    common_term_report_level4_desc: 'Software are compatible with Kunpeng platform. \
You need to complie on the platform.',
    common_term_report_level5_desc: 'Cannot determine whether the Kunpeng platform supports the file. Please check',
    plugins_dep_message_reportLevel01NotUrlDesc: 'This SO dependency library supports the Kunpeng platform.',
    plugins_dep_message_reportLevel34NotUrlDesc: 'This software package supports the Kunpeng platform.',
    plugins_dep_message_reportLevel6NotUrlDesc: 'This JAR package supports the Kunpeng platform.',
    plugins_dep_message_level0Desc: 'This SO dependency library supports the Kunpeng platform. \
    You can download the library in the Operation column.',
    plugins_dep_message_level1Desc: 'This SO dependency library supports the Kunpeng platform. \
    You can download the source code in the Operation column and compile and install it on the Kunpeng platform.',
    plugins_dep_message_level2Desc: 'This SO dependency library does not support the Kunpeng platform. \
    You are advised to obtain the source code and recompile and package it on the Kunpeng platform.',
    plugins_dep_message_level3Desc: 'This software package supports the Kunpeng platform. \
    You can download the package in the Operation column.',
    plugins_dep_message_level4Desc: 'This software package supports the Kunpeng platform. \
    You can download the source code in the Operation column and compile and install it on the Kunpeng platform.',
    plugins_dep_message_level5Desc: 'This software package does not support the Kunpeng platform. \
    You are advised to obtain the source code and recompile and package it on the Kunpeng platform.',
    plugins_dep_message_level6Desc: 'This JAR package supports the Kunpeng platform. \
You can download the package in the Operation column.',
    plugins_port_download_source_code: 'Download Source Code',
    common_term_report_level6_desc: 'JAR package already has a compatible version on the Kunpeng platform. \
    The URL is the download address of the JAR package',
    common_term_ipt_label: {
        package: 'Installation Package Path',
        path: 'Software Installation Path',
        source_code_path: 'Source Code File Path',
        enhanced_check: 'Source Code Enhancement Check',
        compiler_version: 'Compiler Version',
        construct_tool: 'Build Tool',
        compile_command: 'Compilation Command',
        target_os: 'Target OS',
        target_system_kernel_version: 'Target OS Kernel Version',
        fortran: 'Source Code Type'
    },
    common_term_result_soFile: 'Architecture-Related Dependencies',
    common_term_result_cFile: 'Source Files to Be Ported',
    common_term_result_lines: 'Source Code to Be Ported',
    common_term_setting_infor: 'Configuration',
    common_term_migrate_result_soFile: 'Dependency Libraries',
    common_term_migrate_wait: 'To Be Ported: ',
    common_term_migrate_result_cFile: 'Source Code Files',
    common_term_migrate_result_lines: 'Lines of Code',
    common_term_cFile_path_label: 'Path',
    common_term_download_html_filename: 'File Name',
    common_term_download_html_lineno: 'Line Number(Start Line, End Line)',
    common_term_download_html_keyword: 'Keywords',
    common_term_download_html_suggestion: 'Suggestion',
    common_term_operate_download1: 'The download link cannot be found. Please check.',
    common_term_report_cFile_dependent: 'Total Files: {0}',
    common_term_report_confiure_info: 'Configuration',
    port_configure_remote_server: 'Porting Advisor – Configure Remote Server',
    plugins_porting_free_trial_remote_environment: 'Apply For Trial Remote Laboratory',
    port_create_source_task: 'New Source Code Porting Task',
    port_create_affinity_task: 'New Scan Kunpeng Affinity Task',
    port_setting: 'Porting Advisor – Settings',
    plugins_term_name_total: 'Total Dependencies',
    port_login: 'Login Porting Advisor',
    port_source_migrate: 'Source Code Porting',
    port_software_build: 'Software Package Rebuilding',
    port_software_build_task: 'New Software Package Rebuilding Task',
    port_software_migration: 'Dedicated Software Porting',
    plugins_porting_enhance_function_label: 'Enhanced Functions',
    plugins_porting_enhance_function_precheck: 'Enhanced Functions-64-bit Mode Check',
    plugins_porting_enhance_function_byte_align: 'Enhanced Functions-Structure Byte Alignment Check',
    plugins_porting_enhance_function_byte_align_processing: 'Checking the alignment analyzing...',
    plugins_porting_enhance_function_byte_align_fail: 'Failed to check the byte alignment of the structure:',
    plugins_porting_enhance_function_byte_align_waiting: 'Checking the alignment waiting...',
    plugins_porting_enhance_function_byte_align_task: 'checking the alignment',
    plugins_porting_weakcheck_progress_label_waiting: 'Checking memory consistency waiting...',
    plugins_porting_weakcheck_suggest: 'add "__asm__ volatile("dmb sy")" in the position indicated by the below items',
    plugins_porting_weakcheck_quickfix: '__asm__ volatile("dmb sy");',
    plugins_porting_enhance_function_weak_check_processing_tip: 'Checking memory consistency: It takes about one hour \
to check 50,000 code lines in C programming language in the 64-core environment. \
The code is more complex when it contains more lines. \
As a result, the time required for checking increases exponentially.',
    plugins_porting_enhance_function_weak_check_quickfix_tip: 'This line has multiple points to be modified, \
Therefore, the quick fix function is unavailable,please add "__asm__ volatile("dmb sy")"',
    port_migration_precheck: '64-bit Mode Check',
    confirm_delete_report: 'Are you sure you want to delete the report {0}?',
    plugins_apprise_message_deleteReport: 'Are you sure you want to delete the code scanner report {0}?',
    plugins_porting_message_deleteReport: 'Are you sure you want to delete the porting report {0}?',
    confirm_button: 'OK',
    cancel_button: 'Cancel',
    delete_report_success: 'Report {0} deleted successfully.',
    confirm_clear_reports: 'Are you sure you want to clear all reports?',
    plugins_apprise_message_clearReport: 'The historical reports cannot be restored after deletion.\
    Are you sure you want to clear all code scanner reports?',
    plugins_porting_message_clearReport: 'The historical reports cannot be restored after deletion.\
    Are you sure you want to clear all porting reports?',
    plugins_softpkg_message_clearReport: 'The historical reports cannot be restored after deletion.\
    Are you sure you want to clear all Software Package Rebuilding reports?',
    clear_reports_success: 'Reports cleared successfully.',
    download_report_success: 'Report downloaded successfully. Download path:{0}.',
    download_autofix_success: 'Files downloaded successfully. Download path:{0}.',
    plugins_porting_rundownload_success: 'Run Log downloaded successfully. Download path:{0}.',
    plugins_porting_csrdownload_success: 'File downloaded successfully. Download path:{0}.',
    plugins_porting_optdownload_success: 'Operation Log downloaded successfully. Download path:{0}.',
    plugins_porting_bcdownload_success: 'BC file downloaded successfully. Download path:{0}.',
    common_term_runlib: 'No path available. The {0} is a dependency obtained from the current software package',
    common_term_aarch44: 'Missing the aarch64 native binary file in the jar package',
    plugins_dependency_message_createAnalysisReport: 'Software porting assessment succeeded ',
    plugins_dependency_message_sourceReport: 'The source code porting task is successful.',
    plugins_apprise_message_analysising: 'Software porting assessment analyzing...',
    plugins_porting_message_analysising: 'Source code porting analyzing...',
    plugins_porting_message_waiting: 'Source code porting analysis task waiting...',
    plugins_common_message_iss: 'Configuration saved successfully.',
    pligins_common_message_il: 'Log in now',
    common_report_lint: 'Report not found:',
    plugins_porting_message_logout: 'Are you sure you want to logout Porting Advisor?',
    plugins_porting_migBackUping: 'Backing up... Executing  {0}%',
    plugins_porting_migBackUpSuc: 'Backup Success',
    plugins_porting_migUpgrading: 'Upgrade task in process... Executing  {0}%',
    plugins_porting_migUpgradSuc: 'Upgrade Success',
    plugins_porting_migRecovering: 'Restoration task in process... Executing  {0}%',
    plugins_porting_migRecoverSuc: 'Restoration Success',
    plugins_porting_webpack_success: 'Softeware package built successfully',
    plugins_porting_webpack_task_success: 'Package rebuild task created successfully',
    plugins_porting_webpack_task_progress: ' {0}%',
    plugins_porting_webpack_fail: 'Failed to rebuild the software package: ',
    plugins_porting_webpack_tip: 'You can perform other operations during the package building process. \
    Leaving the page does not interrupt the task.',
    plugins_porting_webpack_success_file_download: 'Download Rebuilt Package',
    plugins_porting_webpack_file_download_path: 'Dowload successfully, package storage path：',
    plugins_porting_webpack_file_exist: 'Upload failed, file already exist',
    plugins_porting_webpack_file_size_exceed: 'The file exceeds 1 GB.  \
    You need to manually upload the file and change the file owner and permission.',
    plugins_porting_webpack_delConfirm: 'Are you sure you want to delete the software package \
rebuild history report {0}?',
    plugins_porting_webpack_confirm: 'OK',
    plugins_porting_webpack_cancel: 'Cancel',
    plugins_common_upload_tip: 'Uploading... ',
    plugins_porting_upload_tip: ', Uploading... ',
    plugins_porting_webpack_download_failed: 'download failed',
    plugins_common_term_report_500: '500 Internal Server Error.',
    plugins_common_message_http_404: 'Network connection error. \
Check the network status and remote server configuration.',
    plugins_common_term_report_401: 'Login timeout or not logged in.',
    plugins_common_certificate_verification_failed: 'Certificate verification failed. \
Please select a certificate again.',
    plugins_common_term_login_other: 'You have logged in from another terminal. Please check and try again.',
    plugins_common_logout_ok: 'You have logged out of the system.',
    plugins_common_report_safe_tit: 'Too many reports. Please delete some reports to release the storage space.',
    plugins_common_report_danger_tit: 'New tasks cannot be created because the number of reports \
    has reached the upper limit. Please delete reports that are not required.',
    plugins_common_message_whiteListManagement_backUping: 'backUping...',
    plugins_common_message_whiteListManagement_recoverying: 'recoverying...',
    plugins_common_message_whiteListManagement_upgrading: 'upgrading...',
    plugins_common_message_responseError: 'The server does not respond. \
    Check that the tool has been deployed on the server and the network connection is normal. ',
    plugins_common_message_responseError_deployScenario: 'The server does not respond. \
    Check that the network connection is normal.',
    plugins_common_button_checkErrorDetails: 'Handling Suggestions',
    plugins_common_title_errorInstruction: 'Server Exception',
    plugins_common_title_noData: 'No historical report,Create an analysis task',
    plugins_porting_disclaimer_title: 'Porting Advisor Disclaimer',
    plugins_porting_portcheck_title: '64-bit Mode Check',
    plugins_porting_precheck_label: '64-Bit Environment Porting Pre-check',
    plugins_common_cacheline_check: {
        title: 'Cache Line Alignment',
        operation: 'Checking the alignment of the cache lines...',
        success_tip: 'Cache line alignment scanned successfully.',
        success_tip_without_contents_tip: 'Cache line alignment scanned successfully. \
    The specified analysis path or analysis package does not contain any content that needs to be modified.',
        fail_tip: 'Failed to scan cache line alignment. For details about the failure, see run logs.',
        exit_report: 'Exit',
        fail_tips_common: 'Failed to scan cache line alignment: ',
        close_tip: 'Cache line alignment for the current environment is complete. \
  The check results will be lost after the dialog box is closed.'
    },
    plugins_porting_portcheck_checking: 'Performing porting pre-check: ',
    upload_maxium: 'The file upload task is queuing...',
    plugins_porting_portcheck_waiting: 'Performing porting pre-check waiting...',
    plugins_porting_portcheck_suggest: 'This line needs to be adapted for the 64-bit environment.',
    plugins_porting_suggest_replace: 'Replace the code with the suggested code.',
    plugins_port_migration_appraise: 'Software Porting Assessment',
    plugins_port_newmigration_appraise: 'New Software Porting Assessment',
    plugins_porting_code_save_failed: 'Failed to save the file.',
    plugins_porting_message_uninstall: 'Uninstall Porting Advisor',
    plugins_porting_message_upgrade: 'Upgrade Porting Advisor',
    plugins_common_message_versionCompatibility: 'The plugin version does not match the software version on the \
server. Unpredictable errors may occur if you continue. You are advised to use a plugin version that matches the \
software version on the server. Software versions that match the current plugin: {0}. \
Current software version on the server: {1}.',
    plugins_common_message_figerLose: 'The authenticity of host {0} can\'t be established. \
The fingerprint is SHA256:{1}. Are you sure you want to continue connecting (Yes/No)?',
    pligins_common_message_confirm: 'Yes',
    pligins_common_message_cancel: 'No',
    plugins_common_message_figerWarn: 'The number of fingerprints stored in the local configuration file exceeds 100. \
    Delete the fingerprints from src/extension/assets/config.json in the plug-in installation directory.',
    plugins_common_message_upload_installFailed: 'Failed to deploy the tool. \
    Check whether the /tmp directory on the server is readable and writeable and whether the following files exist. \
    If yes, delete the files and try again.',
    plugins_common_message_upload_uninstallFailed: 'Failed to uninstall the tool. \
    Check whether the /tmp directory on the server is readable and writeable and whether the following files exist. \
    If yes, delete the files and try again.',
    plugins_common_message_upload_upgradeFailed: 'Failed to upgrade the tool. \
    Check whether the /tmp directory on the server is readable and writeable and whether the following files exist. \
    If yes, delete the files and try again.',
    plugins_common_show_user_current_user: 'Current User: ',
    plugins_common_show_user_normal_user: 'common user',
    plugins_common_show_user_admin_user: 'administrator',
    plugins_common_show_user_btn_true: 'OK',
    plugins_porting_label_cFile_path: 'Path',
    plugins_porting_label_file_type: 'Type',
    plugins_porting_option_linecount: 'Code Lines to Modify',
    plugins_porting_report_level0_desc:
        'The Kunpeng community provides a verified Arm64 version of this SO library.',
    plugins_porting_report_level1_desc:
        'So libraries have been verified on the Kunpeng platform, the Kunpeng community has an arm64 version, \
        user need to compile on the platform.',
    plugins_porting_report_level2_desc:
        'So libraries cannot be supported on the Kunpeng platform, and the Kunpeng community has no alternative.',
    plugins_porting_report_level3_desc:
        'Unable to determine whether the Kunpeng platform supports the file. Please check the source code and confirm.',
    common_kunpeng_platform_compatible: 'This file is compatible with the Kunpeng platform.',
    plugins_porting_file_type_error: 'The tool does not support source code porting analysis of a single file. \
Please select a directory.',
    plugins_porting_file_size_error: 'The tool supports only the folder smaller than 1 GB.',
    plugins_porting_tips_fileNameIsValidity: 'The file or folder name cannot contain Chinese characters, \
    spaces, and the following special characters: ^`/|;&$><!.',
    plugins_porting_modified_warning: 'If your source code has been changed after analysis, \
the result may be incorrect.',
    plugins_common_nomore_alert: 'Do not remind me again',
    plugins_porting_isPorting_alert: 'There is source code to be analyzed. Close the page and create a task.',
    plugins_common_closePage: 'Close',
    plugins_porting_file_uploadFailed: 'Internal server error, file upload failed.',
    plugins_porting_file_empty_error: 'Analysis failed because the directory is empty.',
    plugins_porting_close_task_confirm_tip: 'Are you sure you want to cancel the current {0} task?',
    plugins_porting_code_label: 'Analyze Source Code',
    plugins_porting_assessment_label: 'Software Porting Assessment',
    plugins_porting_rebuilding_label: 'Software Package Rebuilding',
    plugins_porting_dedicated_label: 'Dedicated Software Porting',
    plugins_porting_whitelist_upgrade: 'Dependency Dictionary Upgrade',
    plugins_porting_clear_label: 'Task canceled.',
    plugins_porting_clearFail_label: 'failed to cancel the task.',
    plugins_porting_64strategy: 'This line needs to be adapted for the 64-bit environment.',
    plugins_porting_code_suggest_all_replace: 'Are you sure you want to apply this type \
of repair to {0} in the {1} file in batches?',
    plugins_porting_suggest_all_replace: 'Apply this kind of modification in this file',
    plugins_common_message_sshClientCheck: 'The SSH client is not installed on the device. \
Obtain and install the SSH client.',
    plugins_porting_weak_check_compile_file: 'Generating the BC file...',
    plugins_porting_weak_check_compile_file_waiting: 'Generating the BC file waiting...',
    plugins_porting_weak_check_compile_file_task: 'Generat the BC file',
    plugins_common_message_sshAlgError: 'Connection detection failed. The algorithm on the client side does not \
match that on the server side.For details about how to configure a security algorithm, see FAQ.',
    plugins_common_tips_checkConn_root:
        'You are using the root user account. A common user account is recommended. For details , see FAQs. Continue?',
    plugins_common_tips_checkConn_noroot: 'You are using a common user account {0}. \
Check that the following conditions are met: \r\n\
The common user {0} has been added to user group wheel. For details, see FAQs. Continue?',
    plugins_common_tips_checkConn_openFAQ: 'Open FAQ',
    software_package_detail: {
        time: 'Report Generated',
        common_term_path_label: 'Package Path',
        path: 'Path of the Software Package Rebuilt',
        result: 'Rebuild Result',
        relayNum: 'Dependencies Updated',
        lackNum: 'Dependencies Missing',
        fileSource: 'File Source',
        packageButton: 'Download Package Rebuilt',
        packageSuccess: 'Rebuild successful',
        status: {
            tooDownload: 'Downloaded by tool',
            userUpload: 'Uploaded by user',
            suggestion: 'Manually download the file, decompress and extract the missing dependencies, \
            and upload the dependencies to the target directory. Then, rebuild the software. ',
            suggestion_1: 'Manually download the file, upload the file to the directory for dependencies, \
and rebuild the software.'
        },
        common_term_config_title: 'Rebuild Information',
        common_term_name_label_1: 'File Name',
        common_term_filePath_label: 'Path',
        common_term_report_level_result: 'Verify whether it is compatible with the Kunpeng platform. If not, \
obtain a Kunpeng-compatible version from your vendor or obtain the source code and compile it \
to a Kunpeng-compatible version.',
    },
    common_term_report_detail: {
        copyLink: 'Copy Link',
        copySuccess: 'Link copied'
    },
    tip_lack_worker: 'The current tool cannot reach the maximum concurrent processing.\
     Task execution may be delayed. Follow the User Guide to enable maximum concurrent processing for the tool.',
    tip_bc1: ' You can manually generate the BC file by referring to the FAQ.',
    tip_bc: 'Failed to generate the BC file: ',
    btn_faq: 'Go to the FAQ',
    btn_user_guide: 'Go to the User Guide',
    tip_no_worker: 'The tool cannot analyze tasks. Make sure the tool can run properly. \
For details, see the User Guide.',
    common_term_upload_unable: 'The download URL is not available because the dependency file \
is not an open-source file.',
    log_compress_running: 'Log file is in the compression...',
    log_compress: 'log compression',
    common_term_task_nodata: 'No Data',
    plugins_common_tips_connFail: 'Failed to check the SSH connection. Check whether the user name and password are \
correct. Too many retries will also cause the check failure.',
    plugins_common_tips_weak: 'Memory consistency check',
    plugins_common_view_report: 'Go to View',
    pluginsCommonViewReport: ' For details, see FAQ.',
    pluginsCommonViewFaq: 'View FAQ',
    pluginsCommonTermConnectFail: '',
    plugins_porting_report_notNewReport: 'The report is not the latest.Create a new analysis task.',
    common_term_operate_Create: 'Create',
    common_term_operate_locked1_download: 'The report is not the latest.Download the latest analysis report:{0}.',
    common_term_operate_locked1_view: 'The report is not the latest. \
    View or modify the source code in the latest analysis report: {0}.',
    common_term_operate_Download: 'Download',
    common_term_operate_view: 'Go',

};
