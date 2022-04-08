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

export const I18N_US = {
    common_term_welcome_tip: 'Analyzes software source code, and provides application porting suggestions.',
    common_term_welcometo: 'Welcome to',
    common_term_login_name: 'User Name',
    common_term_user_name: 'User name is ',
    common_term_login_name1: 'Administrator',
    common_term_login_name2: 'Administrator :',
    common_term_login_password: 'Password',
    common_term_login_password2: 'Password :',
    weak_pwd_login_tip: 'Weak password. Enter another one.',
    common_term_login_btn: 'Log In',
    common_term_copyright: 'Copyright @ Huawei Technologies Co., Ltd. 2021. All rights reserved.',
    common_term_help_tip: 'Help',
    common_term_upload_unable: 'The download URL is not available because the \
      dependency file is not an open-source file.',
    common_term_valition_input: 'The value cannot contain Chinese characters, spaces, and the ' +
      'following special characters: ^ ` | ; & $ > < !.',
    plugins_porting_menu_modify_password: 'Change Password',
    plugins_porting_menu_user_management: 'User Management',
    plugins_porting_menu_weak_password_dic: 'Weak Password Dictionary',
    plugins_porting_menu_system_config: 'System Settings',
    plugins_porting_menu_login_config: 'Configure Login',
    plugins_porting_menu_log: 'Log Management',
    plugins_porting_menu_operation_log: 'Operation\
    Log',
    plugins_porting_menu_run_log: 'Run Log',
    plugins_porting_menu_dependency_dic: 'Dependency Dictionary Management',
    plugins_porting_menu_software_migrate_temp: 'Template Management',
    plugins_porting_menu_scan_params_settings: 'Scan Parameter Settings',
    plugins_porting_menu_threshold_settings: 'Threshold Settings',
    plugins_porting_menu_certificate_settings: 'Certificate Management',
    plugins_porting_menu_crl_settings: 'Certificate Revocation List',
    system_setting: {
      info: 'The new value is the same as the original one. '
    },
    common_term_runLogLevel: 'Run Log Level',
    common_term_CRL_config: 'Certificate Validity Check',
    common_term_go_back_tab1: 'Back',
    common_term_go_back_tab2: 'Back',
    common_term_user_label: {
        name: 'User Name',
        role: 'Role',
        workspace: 'Workspace',
        password: 'Password',
        confirmPwd: 'Confirm Password',
        adminPwd: 'Administrator Password',
        oldPwd: 'Old Password',
        newPwd: 'New Password',
    },
    common_term_select: 'Configuration',
    common_term_operate: 'Operation',
    common_term_filename: 'File Name',
    common_term_size: 'Size',
    common_term_status: 'Status',
    common_term_detail: 'Detail',
    common_term_upload_fail: 'Upload Fail',
    common_term_upload_success: 'Upload successfully',
    common_term_create_user: 'Add',
    common_term_create_user_title: 'Add User',
    common_term_operate_del: 'Delete',
    common_term_operate_reset: 'Reset Password',
    common_term_operate_change: 'Change Password',
    common_term_operate_modify: 'Change',
    common_term_title_change: 'Change Password',
    common_term_operate_delete_title: 'Delete User',
    common_term_operate_delete_tip1: 'The data of a deleted user and their tasks that are being executed \
    or queued for execution will be deleted.',
    common_term_num_modify_tip1: 'Incorrect input parameter. Enter an integer ranging from 1 to 20.',
    plugins_porting_term_config_valid: 'Incorrect input parameter. Enter an integer ranging from 1 to 99,999.',
    plugins_porting_tips_timeoutmodify: 'Incorrect input parameter. Enter an integer ranging from 10 to 240.',
    plugins_porting_title_timeout: 'Session Timeout Period(10 to 240 min)',
    plugins_porting_message_soFile_noData1: 'The scan is completed. No dependent \
      library file related to the architecture is found.',
    common_term_operate_ok: 'OK',
    common_term_operate_cancel: 'Cancel',
    common_term_operate_close: 'Close',
    common_term_agree: 'Agree',
    common_term_admin_log_out: 'Log Out',
    common_term_operate_check: 'Check Now',
    plugins_porting_tips_sourcetip: 'Upload the local source code folder/ Upload the local source code package.',
    plugins_porting_tips_apprisetip: 'Select the source code uploaded or enter the source code path on the server.',
    plugins_porting_title_fileType: 'File Type',
    plugins_porting_tips_creatrmk: 'Change the initial password and log in again for security purposes.',
    plugins_porting_title_migBackup: 'Back Up',
    plugins_porting_tips_migBackupOpera: 'After the software porting template is backed up, \
    you can restore the software porting template to the source version. The system retains \
    only the latest software porting template backup.',
    plugins_porting_button_migStartGrade: 'Upgrade',
    plugins_porting_title_migUpgrade: 'Upgrade',
    plugins_porting_tips_migUpgradeOpera: 'Before upgrading the software porting template, \
    log in to the Kunpeng community to download the ',
    plugins_porting_tips_migUpgradePackage: 'Software Porting Template Resource Package',
    plugins_porting_tips_migUpgradePackage_download: 'software porting template resource package',
    plugins_porting_tips_upgrade_inputprompt: 'The uploaded resource package is saved in the',
    plugins_porting_tips_upgrade_inputpromptsub: 'directory by default',
    plugins_porting_title_migRecover: 'Restore',
    plugins_porting_tips_migRecoverOpera: 'Restore to Stable Version.',
    plugins_porting_buttton_migStartRecover: 'Restore',
    plugins_porting_tips_migManagerPwd: 'Administrator Password',
    plugins_porting_tips_managePwdCheck: 'Enter the administrator password.',
    plugins_porting_tips_createUser: 'User {0} creation successful.',
    plugins_porting_tips_deleteUser: 'Succeeded in deleting the user {0}.',
    plugins_porting_tips_changePwd: 'Password reset successfully.',
    plugins_porting_tips_resetPwd: 'User password changed successfully.',
    plugins_porting_tips_wrongFileType: 'Wrong file type.',
    plugins_porting_tips_fileNameIsValidity: 'The file or folder name cannot contain Chinese characters, \
    spaces, and the following special characters: ^`/|;&$><!.',
    plugins_porting_tips_changeNum: 'The number of max online users modified successfully.',
    plugins_porting_network_disconnected: 'Network disconnected',
    plugins_porting_error_code: 'Error code',
    common_term_operate_locked1: 'The file is locked by the new report',
    common_term_operate_locked2: '. Please check the new report and perform modification',
    common_term_operate_lockedTitle: 'The file is locked and cannot be viewed or modified.',
    common_term_create_tip: 'The user name cannot be modified after it is saved.',
    common_term_log_userName: 'User Name',
    common_term_log_event: 'Event',
    common_term_log_result: 'Result',
    common_term_log_time: 'Time',
    common_term_log_Detail: 'Details',
    common_term_analysis_package_label: 'Analyze Software Installation Package',
    common_term_analysis_path_label: 'Analyze Installed Software (x86 platform only)',
    common_term_analysis_softwareCode_label: 'Analyze Source Code',
    plugins_porting_apprisetip_info: 'Automatically scans and analyzes software packages (not source code packages) \
    and installed software, and provides porting assessment reports.',
    common_term_analysis_package_tip: 'Scans and analyzes the porting feasibility of the software packages \
     in the RPM, DEB, JAR, WAR, TAR, ZIP, or gzip format.',
    common_term_analysis_installed_tip: 'Scan and analyzes the porting feasibility \
      of the software installed on the x86 platform.',
    plugins_porting_tip_info: 'Checks and analyzes source code files in compiled language \
      (such as C, C++, Fortran, Go, Interpreted) and assembly files, locates the code to be ported, \
      and provides porting suggestions. It supports editing and one-click code replacement.',
    common_term_analysis_source_code_path1: 'Enter a relative path by using either of the following methods:\
    (1) Click Upload Source Code on the right. \
    The relative path will be automatically generated after the source code is uploaded.\
    (2) Manually upload the source code to a directory on the server. For example, \
    if the source code is uploaded to ',
    common_term_analysis_installed_path_hint: 'Fill in the path relative to the workspace \
    in either of the following ways:\
    (1) Enter the path manually. For example, \
    if the full path is /opt/portadv/portadmin/example/, you should enter example.\
    (2) Click the Upload Source Code button on the right. \
    The relative path is automatically filled in.',
    common_term_analysis_installed_path_hint1: 'Fill in the relative Workspace path. For example, if the full path is ',
    common_term_analysis_installed_path_hint2: 'example.rpm, the relative Workspace path is example.rpm. ',
    common_term_analysis_installed_path_hint3: 'example/, the relative Workspace path is example. ',
    common_term_analysis_installed_path_hint4: 'Upload the dependencies required for building the software package.',

    common_term_analysis_installed_path_hint5: 'Enter a relative path by using either of the following methods: \
    (1) Click Upload Software Package on the right. The relative path will be automatically generated after \
    the software package is uploaded. (2) Manually upload the software package to a directory on the server. \
    For example, if the software package is uploaded to ',
    common_term_analysis_installed_path_hint6: 'example/, enter the relative path example.',

    common_term_analysis_installed_path_hint7: 'Enter a relative path by using either of the following methods: \
    (1) Click Upload Source Code on the right. \
    The relative path will be automatically generated after the source code is uploaded.\
     (2) Manually upload the source code to a directory on the server. For example, if the source code is uploaded to ',
    common_term_analysis_softwareCode_tip: 'Enter the path of the source code, and click Analyze.',
    common_term_analysis_title1: 'Configure Software Scanning Information',
    common_term_analysis_title2: 'Configure Target Environment',
    common_term_history_project_label: 'Historical Reports',
    common_term_analysis_btn: 'Analyze',
    common_term_history_project_downloadc: 'Download Report (.csv)',
    common_term_history_project_downloadh: 'Download Report (.html)',
    common_term_ipt_label: {
        interpreted: 'Interpreted',
        delete_report: 'Delete Report',
        delete_all_report: 'Delete All Reports',
        package: 'Installation Package Path',
        path: 'Software Installation Path',
        source_code_path: 'Source Code File Path',
        enhanced_check: 'Source Code Enhancement Check',
        enhanced_tip_label: 'The check improves the performance of the source code running on the Kunpeng platform, \
          for example, by checking whether the structure variables are aligned with the Kunpeng Cache Line. \
          For details, see the ',
        compiler_tip_label: 'The C/C++/ASM and GO languages share the same compiler version.',
        bc_file_path: 'BC File Path',
        compiler_version: 'Compiler Version',
        construct_tool: 'Build Tool',
        compile_command: 'Compile Command',
        target_os: 'Target OS',
        target_system_kernel_version: 'Target OS Kernel Version',
        fortran: 'Source Code Type',
        compile_command_faq: 'Compilation commands are defined in makefile or CMakeLists.txt. For details, see the ',
        compile_command_faq_symbol: '.'
    },
    common_term_porting_tip: 'Assembly code cannot be re-scanned after porting and migration.\
     Re-scanning will cause inaccurate analysis results.',
    common_term_interpreted_language_tip: 'Interpretive languages include Python, Java and Scala.',
    common_term_srcpath_tip:
        'Check items: compiler options, compiler macros, assemblers, built-in functions and attributes.',
    common_term_analysising: 'Analyzing...',
    common_term_not_close_page: 'Please do not close the page while analyzing.',
    common_term_analysis_completed: 'Analysis completed',
    common_term_analysis_report: 'report created successfully',
    common_term_report_result: 'Analysis Results',
    common_term_result_package: 'Installation Packages',
    common_term_result_soFile: 'Architecture-Related Dependencies',
    plugins_porting_Estimated_standard_subtitle: 'Estimation standard: \
    1 person month = {0} lines of C/C++/Fortran/Go source code or {1} lines of assembly code',
    plugins_porting_message_soFile_noData: 'The scan is completed, and no {0} related to the architecture is found.',
    plugins_port_message_reportLevelDownloadOptDesc: 'Install it from the image source \
      using the software installation commands.',
    plugins_port_message_reportLevel01NotUrlDesc: 'This SO dependency library supports the Kunpeng platform.',
    plugins_port_message_reportLevel34NotUrlDesc: 'This software package supports the Kunpeng platform.',
    plugins_port_message_reportLevel6NotUrlDesc: 'This JAR package supports the Kunpeng platform.',
    plugins_port_message_level0Desc: 'This SO dependency library supports the Kunpeng platform. \
    You can download the library in the Operation column.',
    plugins_port_message_level1Desc: 'This SO dependency library supports the Kunpeng platform. \
    You can download the source code in the Operation column and compile and install it on the Kunpeng platform.',
    plugins_port_message_level2Desc: 'This SO dependency library does not support the Kunpeng platform. \
    You are advised to obtain the source code and recompile and package it on the Kunpeng platform.',
    plugins_port_message_level3Desc: 'This software package supports the Kunpeng platform. \
    You can download the package in the Operation column.',
    plugins_port_message_level4Desc: 'This software package supports the Kunpeng platform. \
    You can download the source code in the Operation column and compile and install it on the Kunpeng platform.',
    plugins_port_message_level5Desc: 'This software package does not support the Kunpeng platform. \
    You are advised to obtain the source code and recompile and package it on the Kunpeng platform.',
    plugins_port_message_level6Desc: 'This JAR package supports the Kunpeng platform. You can download the package in \
    the Operation column.',
    plugins_port_download_source_code: 'Download Source Code',
    plugins_port_report_left_item_title: 'Scan Task Settings',
    plugins_port_report_right_item_title: 'Target Environment',
    plugins_port_option_soFileType_dynamic_library: 'Dynamic library',
    plugins_port_option_soFileType_static_library: 'Static library',
    plugins_port_option_soFileType_software_package: 'Software Package to Download',
    plugins_port_option_soFileType_executable_file: 'Executable file',
    plugins_port_option_soFileType_jar_packagey: 'Jar package',
    plugins_port_message_soPathSearch: 'No path available. \
      The {0} is a dependency obtained from the current software package',
    plugins_port_message_jarMissing: 'Missing the aarch64 native binary file in the jar package.',
    plugins_porting_tips_remoteSoftPack: 'Click the text box and select the software package from the drop-down list,\
    or manually enter the software package name.',
    common_term_result_cFile: 'Source Files to Be Ported',
    plugins_porting_message_cFile_noData: 'The scan is completed. No source {0} file to be ported is found.',
    plugins_porting_option_cFile_all: 'All',
    plugins_porting_option_linecount: 'Code Lines to Modify',
    common_term_result_lines: 'Source Code to Be Ported',
    common_term_valition_rule1: 'The user name cannot be empty',
    common_term_operate_success: 'Successful',
    common_term_no_report: {
        weakNoData: 'No static check source code report',
        BCNoData: 'No static check BC report'
    },
    common_term_change_initial: 'Change Initial Password',
    common_term_change_initial1: 'Change Password',
    common_term_no_password: 'The password cannot be empty',
    reg_pwd: {
        different: 'The new and old passwords must be different',
        reverse: 'The new password cannot be the old password in reverse order.',
        complex: 'It must contain 8 to 32 characters and at least two types of the following characters: \
        uppercase letters, lowercase letters, digits, and special characters (`~!@#$%^&*()-_=+\\|[{}];:\'",<.>/?). \
        Spaces are not allowed.'
    },
    common_term_valition_username: 'The name must contain 6 to 32 characters, \
      including at least two types of the following characters: digits, letters, and symbols.',
    common_term_no_sameoldpwd: 'The new and old passwords must be different.',
    common_term_no_samepwd: 'The passwords do not match.',
    common_term_valition_rule3:
        'The user name contains 6 to 32 characters, including letters, digits, hyphens (-), \
        and underscores, and it must start with a letter.',
    common_term_valition_rule2: 'The new password cannot be the old password in reverse order.',
    common_term_valition_rule4: 'The compilation command must start with make, cmake, or go, for example, make xxx.',
    common_term_valition_rule5: 'The compile command parameter cannot contain Chinese \
    and the following special characters: < > | # ; & ` %.',
    common_term_valition_rule6: 'The compilation command must start with make or cmake, for example, make xxx.',
    common_term_transplant_report_label: 'Porting Report',
    common_term_porting_suggestion_label: 'Porting Suggestion',
    common_term_file_list_label: 'File list',
    common_term_orginal_source_code_label: 'Original Source Code',
    common_term_advised_source_code_label: 'Advised Source Code',
    common_term_advised_prev_label: 'Previous',
    common_term_advised_next_label: 'Next',
    common_term_suggestion_tip1:
        'Your source code will be displayed on the left, and advised source code will be displayed on the right. \
        The advised source code is only modification suggestions and does not affect the source code.',
    common_term_show_source_code: 'Display Source Code',
    common_term_operate_download: 'Download',
    common_term_operate_download1:
        'The download link cannot be found. Please check.',
    common_term_no_label: 'No.',
    common_bc_suggestion_position: 'Code Location',
    common_term_name_label: 'File Name',
    common_term_name_label_1: 'File Name',
    common_term_operate_sugg_label: 'Handling Suggestions',
    plugins_term_report_detail_ctans_lins:
        'C/C++/Fortran and Makefile source code',
    common_term_report_soFile_dependent:
        '{1} of a total of {0} need to be ported.',
    common_term_report_soFile_dependent2:
        '{1} of a total of {0} needs to be ported.',
    common_term_report_401: 'Login timeout or not logged in.',
    common_term_report_500: '500 Internal Server Error.',
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
    common_term_history_list_overflow_tip: 'Exceeded 50 Historical reports.',
    common_term_history_list_overflow_tip2:
        'Please delete unnecessary Historical reports in time.',
    common_term_history_report_del_tip:
        'Are you sure you want to delete the Historical report?',
    common_term_history_report_del_tip2:
        'The Historical report deleted cannot be restored. Exercise caution when performing deletion.',
    common_term_download_html_filename: 'File Name',
    common_term_download_html_lineno: 'Line Number(Start Line, End Line)',
    common_term_download_html_colno: 'Column Number',
    common_term_download_html_keyword: 'Keywords',
    common_term_download_html_suggestion: 'Suggestion',
    common_term_required_tip: 'This parameter cannot be empty.',
    common_term_src_ipt_tip:
        'Decompress the source code package before scanning.',
    common_term_headerTab1_label: 'Source Code Scanning',
    common_term_report_copy_link: 'Copy Link',
    common_term_report_copy_success: 'Link Copied',
    plugins_porting_migration_compatible_tip_title: 'Confirm',
    plugins_porting_migration_compatible_tip: 'The file name contains keywords Arm64 or AArch64, \
    which may be compatible with the Kunpeng platform. Are you sure you want to upload it?',
    plugins_porting_migration_header: 'Dedicated Software Porting',
    plugins_porting_migration_info_name: 'Software Name: ',
    plugins_porting_migration_info_ver: 'Version: ',
    plugins_porting_migration_info_des: 'Task Description: ',
    plugins_porting_migration_info_env: 'OS: ',
    plugins_porting_migration_info_mvn: 'Huawei Maven Source Repository: ',
    plugins_porting_migration_table_label1: 'Software Name',
    plugins_porting_migration_table_label2: 'Version',
    plugins_porting_migration_table_label3: 'Description',
    plugins_porting_migration_table_label4: 'Operation',
    plugins_porting_migration_table_label4_content: 'Porting',
    plugins_porting_migration_tip_title: 'Before You Start',

    plugins_porting_migration_tip_dsc: 'During the software porting process, \
    you may need to install dependent components, \
    modify system configurations, download the software to be ported, and perform operations such as modification, \
    compilation, and building. \
    Read the procedure description carefully before you start.During dedicated software porting process, \
    you may need to obtain dependency packages. For details about the download URLs, \
    see Appendix A.1 in the Kunpeng Porting Advisor \
    User Guide.',
    plugins_porting_migration_tip_option: 'I have read the above text',
    plugins_porting_migration_tip_confirm: 'Confirm',
    plugins_porting_migration_tip_cancel: 'Cancel',
    common_term_community: 'Feedback',
    plugins_porting_migration_steps_label: 'Step ',
    plugins_porting_migration_check_label: 'Prerequisite',
    plugins_porting_migration_execute_label: 'Execute',
    plugins_porting_migration_edit_file: 'Modify the {1} file.',
    plugins_porting_migration_edit_line: 'Modify the code in line {1}.',
    plugins_porting_migration_edit_all_line: 'Replace all',
    plugins_porting_migration_delete_line: 'Delete the code in line {1}.',
    plugins_porting_migration_add_line: 'Add the code in line {1}.',
    plugins_porting_migration_orig_code: 'Before modification',
    plugins_porting_migration_new_code: 'After modification',
    plugins_porting_migration_execute: 'Start',
    plugins_porting_migration_back: 'Back ',
    plugins_porting_migration_info: 'Porting... Executing ',
    plugins_porting_migration_precond_label: 'Check Environment',
    plugins_porting_migration_batch_label: 'Execute Script',
    plugins_porting_migration_steps: 'Procedure',
    plugins_porting_migration_info_label: 'Basic Information',
    plugins_porting_migration_step: 'Porting Procedure',
    plugins_porting_migration_select_all: 'Select All',
    plugins_porting_migration_mainContent: 'Contents of the main directory',
    plugins_porting_migration_desc: 'Automatically modifies and compiles common solution-specific software source code \
    and builds a package compatible with the Kunpeng platform. The tool must run on the Kunpeng platform.',
    common_term_build_tip_title: 'Notes:',
    common_term_build_tip_title2: 'Note:',
    plugins_porting_enhance_function_precheck: 'Enhanced Functions-64-bit Mode Check',
    plugins_porting_enhance_function_byte_align: 'Enhanced Functions-Structure Byte Alignment Check',
    plugins_porting_enhance_backtoenhancepage: 'Back',
    common_term_build_tip: 'This feature supports only the 64-bit x86 platform and \
      does not support the Kunpeng platform.',
    common_term_path_source: 'Resource File Path',
    common_term_upload_resource: 'Upload Resource File',
    common_term_upload_software: 'Upload Software Package',
    common_term_creating_btn_disabled_tip: 'There are ongoing tasks or windows to be closed. \
  Perform this operation after the tasks are complete or the windows are closed.',
    common_term_path_label: 'Package Path',
    common_term_input_tip: 'A full path of the x86 software package. \
      You can enter a detailed path or a software package name suffixed with .rpm or .deb.',
    common_term_author: 'Allow access to Internet for obtaining dependencies',
    common_term_opt_check: 'Start Pre-check',
    common_term_checking: 'Performing porting pre-check:',
    common_term_waiting: 'Performing porting pre-check waiting...',
    common_term_portingcheck_tip: 'You can perform other operations during the porting pre-check process. \
    Leaving the page does not interrupt the task.',
    common_term_portingcheck_fail: 'The porting pre-check has failed.',
    common_term_portingcheck_failmassage: 'The failure details:',
    common_term_portingcheck_success: '64-bit mode check succeeded. ({0})',
    common_term_cachecheck_success: 'Cache line check succeeded. ({0})',
    common_term_bytecheck_success: 'Byte alignment check succeeded. ({0})',
    common_term_build_err_tip: 'Failed to find the software package. \
      Check whether the software package name is correct.',
    common_term_analysizing: 'Building: ',

    common_term_webpacking_tip: 'You can perform other operations during the package building process. \
    Leaving the page does not interrupt the task.',

    plugins_porting_migration_tip: 'You can perform other operations during the software porting. \
    Leaving this page does not interrupt the software porting task.',
    common_term_wepack_fail: 'Failed to build the software package',
    common_term_webpack_success: 'Software package built successfully.',
    common_term_download_package: 'Download Rebuilt Package',
    common_term_webpack_success_tip:
        'By default, the built software package is stored in the {1} directory.',
    common_term_filename_tip: 'The value cannot be empty.',
    common_term_filename_tip2: 'You can enter the detailed path or software package name in the text box. \
      The file name extension must be .rpm or .deb.',
    plugins_porting_migration_sort_BD: 'Big Data',
    plugins_porting_migration_sort_MS: 'Middle Software',
    plugins_porting_migration_sort_DS: 'SDS',
    plugins_porting_migration_sort_DB: 'Database',
    plugins_porting_migration_sort_NW: 'Network',
    plugins_porting_migration_sort_RTL: 'Run Time Library/Enviroment',
    plugins_porting_migration_sort_HPC: 'HPC',
    plugins_porting_migration_sort_SDS: 'SDS',
    plugins_porting_migration_sort_CLOUD: 'CLOUD',
    plugins_porting_migration_sort_NATIVE: 'Native',
    plugins_porting_migration_sort_WEB: 'Web',
    plugins_porting_setting_label: 'Configuration',
    common_term_keep_going_tip:
        'Continue Scanning upon Finding Arm/Arm64/AArch64',
    common_term_yes: 'Yes',
    common_term_no: 'No',
    common_term_userPwd_label: 'User Password',
    plugins_porting_migration_com_tip:
        'Check whether {0} exists in the \'/usr/bin\' or \'/usr/local/bin\' directory in the current environment and whether the version is later than {1}.',
    common_term_back_tip:
        'Backup task is in process. Do not close the current page.',
    plugins_porting_migration_success: 'The porting task is successfully.',
    plugins_porting_migration_fail: 'Failed to execute the porting task.',
    plugins_porting_migration_success_file_tips: 'Download the porting result from this dialog box. \
      The porting result will be lost after you close the dialog box.',
    plugins_porting_migration_success_file_output: 'Porting Result',
    plugins_porting_migration_success_file_download: 'Download Porting Result',
    plugins_porting_migration_success_file_close_tips:
        'Are you sure you want to discard the current execution result?',
    plugins_porting_migration_success_file_close_content:
        'Download the rebuilt package. The rebuilt package will be lost after you close the dialog box.',
    plugins_porting_migration_info_steps: '[Perform Step] step',
    plugins_porting_migration_info_precheck: '[Check Environment] Prerequisite',
    plugins_porting_migration_info_bash: '[Execute Script] step',
    plugins_porting_migration_info_oscheck: 'Failed to check the target OS, ',
    common_term_about: 'About',
    common_term_clear_btn: 'Clear',
    common_term_all_history_tip: 'Are you sure to delete all the historical reports?',

    common_term_all_history_tip2: 'The historical reports cannot be restored after deletion. \
    Exercise caution when performing this operation.',
    common_term_log_filename: 'Log File Name',
    common_term_log_down: 'Operation',
    common_term_log_level_change: 'Are you sure you want to change the current log level?',
    common_term_log_usernum_change: 'Are you sure you want to modify the current settings?',
    common_term_log_level: 'Log Level',
    plugins_porting_button_download_log: 'Download',
    common_term_max_user_num: 'Maximum Number of Online Common Users(1 to 20)',
    common_term_firstlogin_tit: 'Specify the administrator password upon the first login.',
    common_term_upload_list: 'Upload List',
    common_term_upload_source: 'Upload Resource Package',
    common_term_upload_code: 'Upload',
    plugins_common_button_upcode: 'Upload',
    plugins_common_button_addcode: 'Add File',
    common_term_upload_compressed: 'Compressed package',
    common_term_upload_directory: 'Directory',
    common_term_login_other: 'You have logged in from another terminal. Please check and try again.',
    common_term_fail_analysis: 'Failed',
    common_term_sure_save_tip1: 'Are you sure you want to save the {1} file?',
    common_term_sure_giveup_tip1: 'Are you sure you want to cancel the modification of the {1}?',
    common_term_sure_leave_tip1: 'Are you sure you want to to leave the current page?',
    plugins_weak_messg_backtitle: 'Back to Task Creation',
    plugins_weak_messg_backtip: 'This report is unavailable after you leave this page. Are you sure you want to leave?',
    common_term_sure_giveup_tip2: 'Are you sure you want to discard the current execution result?',
    common_term_sure_save_tip2: 'The original source code has been modified. The source file will be backed up \
    when the modifications are saved.',
    common_term_giveup_tip2: 'The modifications will be lost.',
    common_term_giveup_tip3: 'Download the rebuilt package. \
      The rebuilt package will be lost after you close the dialog box.',
    common_term_leave_tip2: 'If you leave this page, the data on the current page will be lost.',
    plugins_porting_message: {
        workInfo: 'Insufficient workspace of the Porting Advisor. Please delete some reports. ' +
            'Total workspace: {0} GB. Free workspace: {1} GB. Recommended free workspace: > 20% ({2} GB).',
        workWarn: 'The free workspace of the Porting Advisor is less than 1 GB. The tool has stopped writing data. ' +
            'Please delete some reports immediately to release the workspace. ' +
            'Total workspace: {0} GB. Free workspace: {1} GB. Recommended free workspace: > 20% ({2} GB).',
        diskInfo: 'Insufficient drive space of the Porting Advisor. Please release the drive space. ' +
            'Total drive space: {0} GB. Free drive space: {1} GB. Recommended free drive space: > 20% ({2} GB).',
        diskWarn: 'The free drive space of the Porting Advisor is less than 1 GB. The tool has stopped writing data. ' +
            'Please release the drive space immediately. ' +
            'Total drive space: {0} GB. Free drive space: {1} GB. Recommended free drive space: > 20% ({2} GB).',
        workDiskError: 'The remaining drive space is less than 1 GB. \
          Please release the drive space and perform the next step.',
    },
    common_term_needCodeType: 'Select the source code package type',
    common_term_weak_compiler_tip: 'Generating the BC file...',
    plugins_port_migration_appraise: 'Software Porting Assessment',
    common_term_min_report_num: 'Report Warning Threshold(1 to 49)',
    common_term_min_report_tit: 'If the number of reports reaches this value, a message will be displayed, \
    asking you to delete some reports.',
    common_term_max_report_num: 'Maximum Report Threshold(2 to 50)',
    common_term_max_report_tit: 'If the number of reports reaches this value, \
    the report storage space is full and new tasks can be created only after some reports are deleted.',
    common_term_report_safe_tit: 'Too many reports. Please delete some reports to release the storage space.',
    common_term_report_danger_tit: 'New tasks cannot be created because the number of reports ' +
    'has reached the upper limit. Please delete reports that are not required.',
    common_term_modify_set: 'Modify',
    common_term_report_warn: 'The warning threshold of the history report must be smaller \
    than the maximum threshold of the history report.',
    commom_term_min_err: 'Incorrect parameter. Enter an integer ranging from 1 to 49.',
    commom_term_max_err: 'Incorrect parameter. Enter an integer ranging from 2 to 50.',
    plugins_porting_label_softPackPath: 'Path: ',
    common_term_report_right_info4: 'Manpower',
    source_code_type_tip: 'Select the source code type based on the programming \
      language type to prevent incorrect scanning results.',
    plugins_port_term_analysis_package_label: 'Analyze Software Package',
    plugins_porting_message_isX86Evn_info: 'The analysis of installed software works only on the x86 platform.',
    plugins_port_label_soFileSummary: 'Total Dependencies',
    plugins_port_label_cFileSummary: 'Compatible',
    plugins_port_label_linesSummary: 'To Be Verified',
    plugins_port_Estimated_standard_subinfo1: 'person months',
    plugins_port_Estimated_standard_subinfo2: 'person month',
    plugins_port_report_level_download_opt_desc: 'Install it from the image source using \
      the software installation commands. ',
    plugins_port_report_level0_desc: 'Compatible ',
    plugins_port_report_level0_result: 'Download',
    plugins_port_report_level1_desc: 'Compatible ',
    plugins_porting_term_c_line: 'Estimation Standard for C/C++/Fortran/Go Code Porting Workloads (Line/Person-Month)',
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
      Kunpeng-compatible version from the supplier or obtain the source code and compile \
      it to a Kunpeng-compatible version.',
    plugins_port_report_level6_desc: 'Compatible',
    plugins_port_report_level6_result: 'Download',
    plugins_port_report_level7_desc: 'To Be Verified',
    plugins_port_report_level7_result: 'Verify whether it is compatible with the Kunpeng platform. \
      If not, obtain a Kunpeng-compatible \
      version from the supplier or obtain the source code and compile it to a Kunpeng-compatible version.',
    plugins_porting_tips_localSoftPack: 'Upload the software package',
    plugins_porting_label_softPackInstallPath: 'Software Installation Path (x86)',
    plugins_porting_tip_softPackInstallPath: 'Enter the full path of the installed software, \
      for example: /home/pathname.',
    plugins_porting_tips_remoteSourceCode: 'Enter the relative path of the source code file. For example, \
      if the source code file is stored in {0}, enter example. Use commas (,) to separate multiple paths. ',
    common_term_save: 'Save',
    common_term_back: 'Roll Back',
    login_porting_tool: 'Log In to Kunpeng Porting Advisor',
    login_switch_user: 'Change Account',
    common_term_report_generation_time: 'Report generation time: ',
    common_term_report_overview: 'Summary',
    common_term_setting_infor: 'Scanning configuration parameters',
    common_term_migrate_wait: 'To Be Ported: ',
    common_term_migrate_result_soFile: 'Dependency Libraries',
    common_term_migrate_result_cFile: 'Source Code Files',
    common_term_migrate_result_lines: 'Lines of Code',
    plugins_porting_message_passwordExpired: 'The validity period of the tool password is 90 days. \
    The password has expired. Please change the password before using the tool.',
    plugins_porting_message_fileExceedMaxSize: 'The file exceeds 1 G. \
    You need to manually upload the file and change the file owner and permission.',
    plugins_porting_message_certExceedMaxSize: 'The certificate size cannot be greater than 1 MB.',
    plugins_porting_message_crlExceedMaxSize: 'The file exceeds 5M.',
    plugins_porting_message_folderSucess: 'Upload and decompress successfully',
    plugins_porting_title_remoteSourceCode: 'Uploaded source code',
    plugins_porting_title_remoteBc: 'Uploaded BC file',
    plugins_porting_title_remoteSourceCodeTips: 'Click the text box and select the source code path \
    from the drop-down list, or manually enter the source code path.',
    plugins_porting_title_portPreCheckTips: 'Click the text box and select the source code path \
    from the drop-down list, or manually enter the source code path.',
    plugins_porting_title_localSourceCode: 'Upload source code',
    plugins_porting_title_file: 'Upload the source code package.',
    plugins_porting_title_folder: 'Upload the source code folder.',
    plugins_porting_title_localBc: 'Upload BC file',
    plugins_porting_title_localBcPlaceholder: 'Click the text box and select the BC file \
    from the drop-down list, or manually enter the BC file name.',
    common_suggestion_position: 'Code Location',
    plugins_porting_title_localSourceCodeTips: 'Upload local source code',
    plugins_porting_title_bcTips: 'Upload the BC file.',
    plugins_porting_title_targetOSSetting: 'Target Environment Configuration',
    plugins_porting_analysis_center_title: 'Software Package Rebuilding',
    plugins_porting_analysis_center_tip: 'Analyzes the composition of the software packages to be ported and \
      rebuilds software packages compatible with the Kunpeng platform. The tool must run on the Kunpeng platform.',
    plugins_porting_analysis_package_select: 'Select the software package to be rebuilt',
    plugins_porting_analysis_resource_select: 'Configure dependencies',
    plugins_porting_analysis_package_repack: 'Rebuild',
    plugins_porting_analysis_confirm_repack: 'Rebuild',
    plugins_porting_upload_path_hint: 'Upload the software package.',
    plugins_porting_store_path_pre_hint: 'Click the text box and select the software package \
    from the drop-down list, or manually enter the software package name.',
    plugins_porting_store_path_tail_hint: '(2) If the software package is stored in a subdirectory, \
    enter the relative path of the subdirectory and the software package name, for example: example/xx.rpm.',
    plugins_porting_analysis_center_save_path: 'Package Path: ',
    plugins_porting_analysis_resource_save_path: 'Destination Path of Dependency Files: ',
    plugins_porting_analysis_resource_label: 'Upload the dependencies (SO libraries and JAR files) \
    required for rebuilding the software package.',
    plugins_porting_analysis_upload: 'Upload',
    plugins_porting_analysis_previous: 'Previous',
    plugins_porting_analysis_next: 'Next',
    plugins_porting_uploaded_package: 'Uploaded package',
    plugins_porting_local_upload: 'Upload software package',
    plugins_term_report_detail_asm_lins: 'assembly source code',
    common_term_report_cFile_dependent: 'Total Files: {0}',
    plugins_porting_label_file_type: 'File Type',
    plugins_porting_label_cFile_path: 'Path',
    plugins_porting_label_cFile_path1: 'Path: ',
    plugins_porting_message_beforeInstall: 'Before You Start ',
    plugins_porting_message_beforeInstallDsc1: '1. If the yum/apt/zypper source of the OS is correctly configured \
    and the network connection is normal, the installation tool automatically downloads the required \
    software packages, such as Nginx, Django, python3, and GCC, from the Internet. \
    For details about how to configure the yum/apt/zypper source, see section "',
    plugins_porting_message_beforeInstallDsc2: 'Configuring the yum/apt/zypper Source for the OS',
    plugins_porting_message_beforeInstallDsc3: '" in the Kunpeng Porting Advisor User Guide.',
    plugins_porting_message_beforeInstallDsc4: '2. This tool identifies your system status based on the \
    information you entered (such as the IP address, \
    port number, user name, and password) and implements one-click deployment. \
    The information you entered will not be used for other purposes or be transferred outside your server.',
    plugins_porting_message_beforeInstallDsc5: '3. During the use of this tool, \
    you may need to download and install software dependencies, which may contain third-party software. \
    The third-party software is provided "As Is", and Huawei assumes no responsibility for risks \
    incurred by using the software.',
    plugins_porting_message_beforeInstallDsc6: '4. During the use of this tool, \
    the tool may download and install necessary software \
    packages and verification tools, which may contain software from Huawei website:',
    plugins_porting_message_arm_download_link: 'ARM installation package',
    plugins_porting_message_x86_download_link: 'X86 installation package',
    plugins_porting_message_pg_vfc_tool_download_link: 'Verification tool',
    plugins_porting_message_beforeInstallOption: 'I have read the above information. ',
    plugins_porting_message_beforeInstallConfirm: 'Confirm',
    plugins_porting_message_beforeInstallCancel: 'Cancel',
    plugins_porting_message_beforeInstallEnd: 'Cancel',
    plugins_porting_close_task_confirm_tip: 'Are you sure you want to cancel the current {0} task?',
    plugins_porting_precheck_label: '64-Bit Environment Porting Pre-check',
    plugins_porting_clear_label: 'Task canceled.',
    plugins_porting_cleardata_label: ',failed to cancel the task.',
    plugins_porting_title_uninstallDt: 'Uninstall Porting Advisor',
    plugins_porting_title_upgradeDt: 'Upgrade Porting Advisor',
    plugins_porting_button_uninstallConfirm: 'Uninstall',
    plugins_porting_button_upgradeConfirm: 'Upgrade',
    plugins_porting_title_uninstalled: 'The tool is uninstalled successfully.',
    plugins_porting_title_upgraded: 'The tool is upgraded successfully.',
    plugins_porting_title_uninstallFailed: 'Failed to uninstall the tool.',
    plugins_porting_title_upgradeFailed: 'Failed to upgrade the tool.',
    plugins_porting_button_install: 'Click here to deploy',
    plugins_porting_label_ip: 'IP Address',
    plugins_porting_label_port: 'SSH Port',
    plugins_porting_label_portt: 'HTTPS Port',
    plugins_porting_default_port_tip: 'Default port: 8084',
    plugins_common_service_certificate_settings: 'Service Certificate Settings',
    plugins_common_service_certificate_settings_tip1: '1. Before selecting "Specify Root Certificate", \
    you need to obtain a CSR file on "Web Server Certificates" as the administrator, use the CSR file to \
    generate a standard X.509 certificate in the CA system or signature certificate system, and sign and \
    import the certificate. Then, you can specify the root certificate to set up a secure connection.',
    plugins_common_service_certificate_settings_tip2: '2. If you select Trust the current service certificate, \
    you trust the connection set up with the server.',
    plugins_common_specifying_root_certificate: 'Specify root certificate',
    plugins_common_trust_current_service_certificate: 'Trust the current service certificate ',
    plugins_common_specifying_local_path: 'Specify local path',
    plugins_common_no_select_certificate: 'No certificate selected',
    plugins_porting_label_default_port: 'Default Port:{0}',
    plugins_porting_title_config: 'Configure Remote Server',
    plugins_porting_label_config: 'Configure the remote server address for installing porting advisor. \
    If you have not deployed the tool on the server',
    plugins_cloudied_porting_label_config: 'Configure the remote server address for installing porting advisor.',
    plugins_porting_button_save: 'Save',
    plugins_porting_button_modi: 'Modify',
    plugins_porting_button_cancel: 'Cancel',
    plugins_porting_title_installDt: 'Install Porting Advisor',
    plugins_common_message_installDt1: 'The install will complete automatically if the remote server is running a ',
    plugins_common_message_installDt2: 'compatible',
    plugins_common_message_installDt3: ' operating system and can access the Internet.',
    plugins_common_message_upgradeDt1: 'The upgrade will complete automatically if the remote server is running a ',
    plugins_common_message_upgradeDt2: 'compatible',
    plugins_common_message_upgradeDt3: ' operating system and can access the Internet.',
    plugins_common_message_uninstallDt: 'The uninstall will complete automatically \
      if the target server is running properly. ',
    plugins_common_title_installTs: 'Target server',
    plugins_porting_title_installTc: 'Tool Configuration',
    plugins_porting_label_installUser: 'OS User Name',
    plugins_porting_label_installPwd: 'OS User Password',
    plugins_porting_message_ipError: 'Enter a correct IP address.',
    plugins_porting_message_portError: 'Enter a correct port number range.(1-65535)',
    plugins_porting_message_configPortError: 'Enter a correct port number range.(1024-65535)',
    plugins_porting_label_installMode: 'Installation mode',
    plugins_porting_message_installModeHost: 'Physical machine',
    plugins_porting_button_installConfirm: 'Install',
    plugins_porting_message_installingInfo: 'Deploy the tool as prompted. ',
    plugins_porting_title_installed: 'Tool deployed successfully.',
    plugins_porting_button_login: 'Log In',
    plugins_porting_button_retry: 'Retry',
    plugins_porting_button_install_failed_retry: 'Retry',
    plugins_porting_title_installFailed: 'Failed to deploy the tool.',
    plugins_porting_message_installFailedInfo: 'Perform operations as prompted.',
    plugins_porting_message_install_failed: 'Rectify the fault based on the installation \
    failure causes provided on the {0}official website{1}.',
    plugins_porting_message_uninstallingInfo: 'Uninstall the tool as prompted.',
    plugins_porting_message_upgradingInfo: 'Upgrade the tool as prompted.',
    common_install_panel_title: 'Porting Advisor - Deployment tool',
    plugins_porting_message_learnMap: 'Visit the Kunpeng community to get skills for new developer growth',
    plugins_porting_message_doc: 'View the Kunpeng Porting Advisor documents',
    plugins_porting_message_comm: 'Visit the Kunpeng community to learn about Kunpeng DevKit',
    plugins_porting_message_forum: 'If you have any questions, visit the Kunpeng forum.',
    plugins_porting_analysis_build_Tip: 'Note:',
    plugins_porting_analysis_os_Tip: '1. The Software Package Rebuilding function works only on the Kunpeng platform.',
    plugins_porting_analysis_rpm_Tip: '2. The RPM package can be executed only on a Red Hat Linux system. \
    The system component "rpmrebuild/rpmbuild/rpm2cpio" is required during rebuilding. \
    Check whether the system environment meets the requirements.',
    plugins_porting_analysis_dep_Tip: '3. The DEB package can be executed only on a Debian Linux system. \
    The system component "ar/dpkg-deb" is required during rebuilding. \
    Check whether the system environment meets the requirements.',
    plugins_porting_analysis_jre_Tip: '4. If the RPM or DEB package contains JAR packages, \
    check whether any JAR command exists in the system. If not, install the JDK tool.',
    plugins_porting_analysis_save_Tip: '5. By default, the softwarepackage rebuilding result is saved in the \
    "{0}task_id/" directory(task_id indicates the task creation time). After the rebuilding is complete, \
    go to the directory to view the rebuilt software package or \
    the rebuilding failure report and handle the problem based on suggestions.',
    plugins_porting_analysis_http_Tip: '6. During software package rebuilding, \
    you need to obtain dependency packages form some websites. \
    For details, see Appendix A.1 in the Porting Advisor User Guide.',
    plugins_porting_report_suggestion: 'View Suggestion Code',
    plugins_porting_64_analysis_btn: 'Check',
    plugins_porting_cert_expired: 'The cert.pem certificate of the Porting Advisor backend server has expired. \
    Please update the certificate immediately.',
    plugins_porting_cert_expiring: 'The cert.pem certificate of the Porting Advisor backend server will expire on {0}. \
    Please update the certificate in time.',
    plugins_porting_disclaimer_title: 'Disclaimer',
    common_term_read: 'I have read the above.',
    common_term_ThinkTip: 'If you do not agree to the disclaimer, you will exit the \
    Porting Advisor tool. Exercise caution when deciding to do so.',
    common_term_Think: 'Think again',
    common_term_tip: 'Information',
    plugins_porting_message_versionCompatibility: 'The plugin version does not match the software version on the \
    server. Unpredictable errors may occur if you continue. \
    You are advised to use a plugin version that matches the software version on the server. \
    Software versions that match the current plugin: {0}. \
    Current software version on the server: {1}.',
    plugins_porting_disclaimer_desc: 'Once you click OK, you acknowledge that you have understood and agreed to \
      all content of this Disclaimer.',
    plugins_porting_disclaimer_item_zero: '1. To prevent impact on services in the production environment, \
    it is recommended that you use this tool in a non-production environment.',
    plugins_porting_disclaimer_item_one: '2. Before uploading and viewing the source code, \
      you have confirmed that you are the source code owner or have obtained full authorization and \
      consent from the source code owner.',
    plugins_porting_disclaimer_item_two: '3. No individual or organization shall use the source code for any purpose \
      without the authorization of the source code owner. Huawei is not liable for any consequences or legal \
      liabilities arising therefrom. \
      If necessary, Huawei may pursue legal actions against individuals or organizations aforementioned.',
    plugins_porting_disclaimer_item_three: '4. No individual or organization shall spread the source code without \
      the authorization of the source code owner. Huawei is not liable for any consequences or legal liabilities \
      arising therefrom. If necessary, Huawei \
      may pursue legal actions against individuals or organizations aforementioned.',
    plugins_porting_disclaimer_item_four: '5. The source code and related content such as the porting reports, \
      pre-check reports, and suggestions are for reference only, and do not have legal effect or constitute \
      specific guidelines or legal suggestions of any kind.',
    plugins_porting_disclaimer_item_five: '6. Unless otherwise specified by laws, regulations, or contracts, \
      Huawei does not make any explicit or implicit statements, warranties, \
      or commitments on the porting suggestions and related content, or on the marketability, \
      satisfaction, non-infringement, or applicability for specific purposes of the porting suggestions and \
      related content.',
    plugins_porting_disclaimer_item_six: '7. You shall assume any risks arising from your actions based on the \
      porting suggestions and related content. Huawei is not liable for any damage or loss of any nature \
      under any circumstances.',
    plugins_porting_disclaimer_item_seven: '8. After you click OK, the source code will be uploaded to the \
      working directory of the current server for scanning and analysis. \
      The source code uploaded will not be used for other purposes. In addition, \
      other users who logged in to the server are not authorized to view the code in your working directory.',
    plugins_porting_message_useralreadyloged: 'The user has logged in to the system.',
    plugins_porting_tips_whiteListManagement_confirm:
        'The dependency dictionary records SO files and software supported by the Kunpeng platform \
    and their support status. You can restore the dependency dictionary. \
    When the a new dependency dictionary version is released, \
    you need to download the latest dependency dictionary and upgrade the dependency dictionary in a timely manner.',
    plugins_porting_label_whiteListManagement_backUp: 'Backup',
    plugins_porting_label_whiteListManagement_upgrade: 'Upgrade',
    plugins_porting_label_whiteListManagement_recovery: 'Restore',
    plugins_porting_tips_whiteListManagement_backUp: 'After the dependency dictionary is backed up, \
    you can restore the dependency dictionary to the source version. \
    The system retains only the latest dependency dictionary backup.',
    plugins_porting_button_whiteListManagement_startBackUp: 'Back Up',
    plugins_porting_button_whiteListManagement_startUpgrade: 'Upgrade',
    plugins_porting_button_whiteListManagement_startRecovery: 'Restore',
    plugins_porting_tips_whiteListManagement_confirmRecovery: 'Restore to Stable Version',
    plugins_porting_tips_whiteListManagement_uploadPath: 'The dependency dictionary package is saved in the \
    {0} directory after it is uploaded to the server.',
    plugins_porting_label_whiteListManagement_uploadZip: 'Dependency Dictionary',
    plugins_porting_tips_whiteListManagement_uploadZip: 'Before upgrading the dependency dictionary, \
    log in to the Kunpeng community to download the latest ',
    plugins_porting_tips_whiteListManagement_uploadZip_link: 'dependency dictionary',
    plugins_porting_tips_whiteListManagement_period: '.',
    plugins_porting_title_whiteListManagement_managerPwd: 'Administrator Password',
    plugins_common_button_term_operate_ok: 'OK',
    plugins_common_button_term_operate_cancel: 'Cancel',
    plugins_porting_label_portcheck_title: '64-bit Mode Check',
    plugins_porting_label_portcheck_desc: 'Checks the software that is originally running on 32-bit platform and \
    provides suggestions on porting it to the 64-bit platform. The tool must run on the x86 platform.',
    plugins_porting_label_portcheck_note1: 'Note:',
    plugins_porting_label_portcheck_note2: '1. The 64-bit mode check works only on the x86/x64 platform and \
    does not support the Kunpeng platform.',
    plugins_porting_label_portcheck_note3: '2. The tool checks the 32-bit applications to be ported from the \
    x86 platform to the 64-bit application platform. It supports GCC 4.8.5 to GCC 9.3.0.',
    plugins_porting_label_portcheck_note4: '1. The Structure Byte Alignment works only on the x86/x64 platform \
    and does not support the Kunpeng platform.',
    plugins_porting_label_portcheck_note5: '2. The tool checks the 32-bit applications to be ported from the x86 \
    platform to the 64-bit application platform. It supports GCC 4.8.5 to GCC 9.3.0.',
    plugins_porting_message_portcheck_runError: 'View the failure details in the run log.',
    plugins_porting_message_portcheck_noModify: 'Byte alignment check succeeded: The specified analysis path or \
    analysis package does not contain the content to be aligned.',
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
    plugins_porting_message_bytecheck_noModify: '字节对齐检查成功：您指定的分析路径/分析包中没有需要对齐的内容',
    plugins_porting_message_enhancefun: 'Enhanced Functions',
    disable_tip: {
        analysis_center_tip: 'The Software Package Rebuilding is not available in a non-Kunpeng environment',
        x86_tip: 'This function applies to the x86 platform only. The current operating environment \
          is a Kunpeng platform.',
        arm_tip: 'This function applies to the Kunpeng platform only. The current operating \
          environment is a x86 platform.',
        precheck_tip: 'The 64-bit mode check is not available in a non-x86 environment',
        byte_tip: 'The structure byte alignment check is not available in a non-x86 environment',
        version_tip: 'The plugin version does not match the software version on the \
        server.The cacheline alignment check is not supported.'
    },
    plugins_porting_message_enhancefun_label: {
        sourceCode: 'Original Source Code',
        type: 'Check Type',
        precheck: '64-bit Running Mode',
        byte: 'Structure Byte Alignment',
        cache: 'Cacheline Alignment',
        byteOperation: 'Alignment Check',
        weak: 'Memory consistency check',
        precheckDesc: 'Checks the software that is to be ported from the 32-bit platform to the 64-bit platform and \
        provides modification suggestions. (The tool supports GCC4.8.5 to GCC9.3.0.)',
        byteDesc: 'If byte alignment needs to be considered, check the byte alignment of the structure type variables \
        in the source code. (The tool supports GCC4.8.5 to GCC9.3.0.)',
        cacheDesc: '128-byte alignment check is performed on the structure variables \
        in the C/C++ source code to improve the memory access performance.',
        weakMemoryCheck: 'Memory Consistency',
        weakMemoryDesc: 'Check and rectify the memory consistency problems of the Kunpeng platform.\
         (The tool must run on the Kunpeng platform)'
    },
    plugins_porting_message_enhancefun_desc: 'Supports enhanced functions such as 64-bit running mode\
    check, structure byte alignment check, cache line alignment check, and memory consistency check.',
    plugins_porting_message_enhancefun_struct: {
        tableTitle: 'Structural Variable Memory Allocation',
        bitOf32: '32 bits',
        bitOf64: '64 bits'
    },
    plugins_porting_report_suggest_operate_warn: 'The report is not the latest. \
    View or modify the source code in the latest analysis report: {0}.',
    plugins_porting_message_userError: ' Do not use the root user.',
    plugins_porting_message_disclaimer_confirmed: 'By using this plugin, you confirm that you fully agree to and \
      accept this disclaimer.',
    plugins_porting_message_noData: 'No Data',
    plugins_porting_empty_noData: 'No Data',
    plugins_porting_network_interrupt: 'The network connection is interrupted. Please try again later.',
    plugins_porting_message_file_exist: 'Failed, file already exist.',
    common_term_adminpwd_check: 'Enter the administrator password.',
    common_term_oldpwd_check: 'Enter the old password.',
    plugins_common_button_exit: 'Finished',
    common_term_valition_password:
      'It must contain 8 to 32 characters and at least two types of the following characters: uppercase letters, \
      lowercase letters, digits, and special characters (`~!@#$%^&*()-_=+\\|[{}];:\'",<.>/?), \
      and cannot contain spaces.',
    common_term_source_code_path_empty: 'The path for storing source code files cannot be empty.',
    common_term_package_path_empty: 'The path or name of the software package cannot be empty.',
    plugins_porting_message_file_type_incorrect: 'Wrong file type.',
    plugins_common_label_installUserTips: 'not root user',
    plugins_common_button_checkConn: 'Check Connection',
    plugins_common_tips_connOk: 'SSH connection check succeeded.',
    plugins_common_tips_connFail: 'The SSH connection check failed. Check whether the user name, password, \
      or private key is correct. A large number of retries also causes the check failure.',
    plugins_porting_message_analysis_center: {
        title: 'Are you sure you want to continue the rebuild?',
        rpmExit: 'The uploaded RPM package already exists on the Kunpeng image site. Download the RPM package \
          of the correct version.',
        software: 'Software',
        version: 'Version',
        osVersion: 'OS Version',
        imageSource: 'Huawei Image Source',
        portGuide: 'Porting Guide',
        view: 'View',

        rpmUnexit: 'The uploaded RPM package exists in the Kunpeng mirror site. You can configure the \
          Kunpeng mirror source and install it using yum.',
        stepOne: '1. Back up the configuration file.',
        stepOneMore: 'mv /etc/yum.repos.d/ /etc/yum.repos.d-bak',
        stepTwo: '2. Write the new configuration to the repo file.',
        stepTwoMore: `mkdir /etc/yum.repos.d`,

        stepTwoMoreExtra: 'echo -e "[kunpeng]\\nname=CentOS-kunpeng - Base - mirror.iscas.ac.cn\\nbaseurl=\
        {0}\\ngpgcheck=0\\nenabled=1\\n\\n[bigdata-HDP]\\nname=\
        CentOS-kunpeng - bigdata-HDP - mirror.iscas.ac.cn\\nbaseurl=\
        {1}\\ngpgcheck=0\\nenabled=\
        1\\n\\n[bigdata-HDP-GPL]\\nname=CentOS-kunpeng - bigdata-HDP-GPL - mirror.iscas.ac.cn\\nbaseurl=\
        {2}\\ngpgcheck=0\\nenabled=\
        1\\n\\n[bigdata-HDP-UTILS]\\nname=CentOS-kunpeng - bigdata-HDP-UTILS - mirror.iscas.ac.cn\\nbaseurl=\
        {3}\\ngpgcheck=0\\nenabled=\
        1\\n\\n[bigdata-ambari]\\nname=CentOS-kunpeng - bigdata-ambari - mirror.iscas.ac.cn\\nbaseurl=\
        {4}\\ngpgcheck=0\\nenabled=1" >\
         /etc/yum.repos.d/CentOS-Base-kunpeng.repo',
        stepThree: '3. Update the yum source configuration.',
        stepThreeMore: `yum clean all          #Clear all yum caches in the system.`,
        stepThreeMoreExtra: `yum makecache         #Create yum caches.`,
        rebuild: 'Rebuild',
        stepsMirrorSource: {
            packagesName: 'Repository URL:',
            bigdataName: 'Big data RPM package URL:',
            webName: 'Web RPM package URL:',
            cephName: 'Distributed storage URL:',
            dataBaseName: 'Database RPM package URL:',
            cloudName: 'Cloud and virtualization RPM package URL:',
            nativeName: 'Native application RPM package URL:',
        },
        exit: {
            title: 'Duplicate File',
            content: `{0} already exists. Do you want to replace it? `,
            replace: 'Replace',
            save_as: 'Save As',
            file_name: 'File Name',
            delete_file: 'Delete File',
            delete_file_content: `Are you sure you want to delete the {0} file?`,
            delete_unable: 'If you want to delete files, contact the administrator.'
        }
    },
    plugins_porting_uploadPrefix_sourceCode: 'Source code file to be analyzed',
    plugins_porting_uploadPrefix_rpmRebuild: 'Software package to be reconstructed',
    plugins_porting_uploadPrefix_appraise: 'Software Package to be assessment',
    plugins_porting_uploadPrefix_depPackage: 'Dependency file',
    plugins_porting_uploadPrefix_portCheck: 'Source code file to be checked',
    plugins_porting_uploadPrefix_whiteListPack: 'Dependency Dictionary upgrade package',
    plugins_porting_uploadPrefix_crl: 'Certificate Revocation List',
    plugins_common_tips_figerFail: 'Failed to set up the connection because the host fingerprint verification failed.',
    plugins_common_tips_timeOut: 'Connection timed out. Please try again.',
    plugins_common_title_sshKey: 'Key authentication',
    plugins_common_title_sshPwd: 'Password authentication',
    plugins_common_label_selectSSHType: 'SSH Connection Mode',
    plugins_common_message_sslKeyTip: 'id_rsa Private Key File',
    plugins_common_message_passphrase: 'Enter the passphrase of the private key file.',
    plugins_common_message_sshkeyFail: 'Import the correct id_rsa private key file.',
    plugins_common_message_passphraseFail: 'Enter the correct passphrase',
    plugins_common_message_sshkeyExceedMaxSize: 'The private key file size exceeds 10 MB.',
    plugins_common_label_installsshkey: 'Private Key',
    plugins_common_label_passphrase: 'Passphrase',
    plugins_common_message_sshkeyUpload: 'Import',
    plugins_common_message_fileName: 'The file name can contain only uppercase and lowercase letters, digits, \
    and special characters including underscores (_), hyphens (-), plus sign (+), periods (.)\
     and round brackets. It cannot start with a period (.) or exceed 64 characters.',
    plugins_common_message_fileName_length: 'The maximum length of a single filename is 255 characters.',
    plugins_common_message_command_length: 'The command input box can contain no more than 1024 characters.',
    common_term_valition_realpath: 'Enter a proper absolute path, for example, /home/pathname/',
    common_term_valition_path_length: 'The path name can contain a maximum of 1024 characters.',
    plugins_common_tips_sshError: 'SSH connection exception. Please try again.',
    plugins_common_tips_reportDetailCtansLins: 'Code Lines：{1} lines; ',
    plugins_common_tips_platFormFail: 'The 64-bit mode check works only on the x86/x64 platform.',
    plugins_common_tips_platForm: 'The structure byte alignment check works only on the x86/x64 platform.',
    plugins_common_tips_platFormFailWeak: 'The memory consistency check works only on the Kunpeng\
     platform, but not on the x86/x64 platform.',
    plugins_common_tips_platFormFailed: 'Not x86 platform',
    plugins_common_tips_rebuildPlatForm_X86: 'The software package rebuilding is supported only by the \
      Kunpeng platform. The x86 platform does not support it.',
    plugins_common_tips_uploadError: 'Failed to upload the script file to your server.',
    plugins_porting_label_rememberPwd: 'Remember password',
    plugins_porting_label_autoLogin: 'Auto login',
    plugins_common_admin_cannot_remember_password: 'The administrator cannot use the Remember Password function.',
    plugins_common_admin_cannot_auto_login: 'The administrator cannot use the Auto Login function.',
    plugins_porting_label_adminAutoLoginTip: 'The current user is an administrator and cannot save the password.',
    plugins_common_title_install_loading: 'Uploading the one-click deployment script to your server... Please wait.',
    plugins_common_title_uninstall_loading: 'Uploading the one-click uninstall script to your server... Please wait.',
    plugins_common_title_upgrade_loading: 'Uploading the one-click upgrade script to your server... Please wait.',
    plugins_common_title_ipSelect: 'The tool is about to send a login request to IP address {0}.\
    This IP address is the web server address specified during the installation or modified after the installation.\
    Check whether the current address {1} is correct.',
    plugins_common_title_ipSelectUpgrade: 'The tool is about to send a login request to IP address {0}.\
    This IP address is the web server address specified during the installation or modified after the installation.\
    Check whether the current address {1} is correct.',
    plugins_common_tips_ipFault: 'Confirm the IP address {0} is correct',
    plugins_common_tips_ipSSH: 'Use the IP address {0} entered for SSH connection',
    plugins_common_tips_ipExtra: 'Set IP address',
    plugins_porting_message_automake_evn_check: {
        tip: 'The Glibc version is earlier than 2.28. \
        Upgrade the Glibc version perform operations by referring to the installation guide. \
        Otherwise, the automatic translation of assembly files cannot be used.',
        link: 'View Installation Guide',
        guide_title: '[Installation Guidelines]',
        guide_tip1: 'If the server can access the Internet, run sh addAsmLibraries.sh in {1}tools/all_asm/bin.',
        guide_tip2: 'If the server cannot access the Internet, download the following RPM package to \
        the {1}/tools/all_asm/tmp/rpm directory and run bash addAsmLibraries.sh in {2}/tools/all_asm/bin.',
        hide_guide: 'Collapse'
    },
    plugins_porting_message_weak_evn_check: {
        tip: 'If the libstdc++ version is before 6.0.24 or the libtinfo version is not 5.9, follow\
         the installation guide to install the dependency library for memory consistency check. Otherwise,\
          the memory consistency check function is not available.',
        link: 'Installation Guide',
        guide_title: '[Installation Guidelines]',
        guide_tip1: '- If the system is connected to the network, go to the  \
        {1}tools/weakconsistency/staticcodeanalyzer directory and run the bash ./add_libraries.sh command.',
        guide_tip2: '- If the system is not connected to the network, upload the DEB or RPM package to any directory \
        (for example, /home) on the server. Then go to the {1}tools/weakconsistency/staticcodeanalyzer directory, \
        and run the bash ./add_libraries.sh -d /home \
        command (/home indicates the directory where the DEB or RPM package is uploaded).',
        hide_guide: 'Collapse'
    },
    plugins_porting_logzip_title: 'Compressing logs ...',
    plugins_porting_log_label: 'run log download',
    plugins_porting_download_log: 'One-Click Download',
    plugins_porting_webServerCertificate: {
        webNotice: 'Before replacing the web server certificate, generate a CSR file, use the CSR to \
        generate a standard X.509 certificate in the CA system or self-signed digital certificate system, \
        and import the signed certificate.',
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
        leadCsr: '\xa0Import Web Server Certificate',
        more: '\xa0More',
        noData: 'No data. Please add weak passwords.',
        resetServer: 'Restart Server',
        changeCipher: 'Update Working Key',
        confirmChangeCipher: 'Are you sure you want to update the working key?',
        lead: 'Import',
        upload: 'Upload',
        operate: 'Operation',
        keyFileText: 'The value cannot be empty.',
        keyPlaceHoder: 'Enter the passphrase of the private key file.',
        createSuccess: 'The certificate is generated successfully.',
        createUpdate: 'The certificate is replaced successfully.',
        workUpdate: 'The Work key is replaced successfully.',
        country_Verification_Tips: 'Enter a two-character country code.',
        province_Verification_Tips: 'It can contain a maximum of 128 characters, \
          including only letters, digits, underscores (_), hyphens (-), periods (.), and spaces. ',
        city_Verification_Tips: 'It can contain a maximum of 128 characters, including only letters, \
          digits, underscores (_), hyphens (-), periods (.), and spaces. ',
        organization_Verification_Tips: 'It can contain a maximum of 64 characters, \
          including only letters, digits, underscores (_), hyphens (-), periods (.), and spaces. ',
        department_Verification_Tips: 'It can contain a maximum of 64 characters, \
          including only letters, digits, underscores (_), hyphens (-), periods (.), and spaces. ',
        commonName_Verification_Tips: 'It can contain a maximum of 64 characters, \
          including only letters, digits, underscores (_), hyphens (-), periods (.), and spaces. ',
        common_term_webcert_import_success: 'Certificate imported successfully , Take effect after service restart',
        common_term_webcert_restart_tip: 'The restart takes 5 to 10 seconds. After the restart, \
          refresh the current page. Then, operations can be performed normally.',
        webWarnNotice1: 'Your web server certificate has expired. Please replace the certificate.',
        webWarnNotice2: 'Your web server certificate is about to expire on ${time}. \
          Please replace the certificate in time.',
        import_tip: 'Ensure that the imported certificate is generated based on the CSR file.',
        import_pre_tip: 'Do not generate a new CSR file before importing the web server certificate.',
        setting_cert_config: 'Certificate Expiry Alarm Threshold (7 to 180 per days)',
        cert_warn_value: 'Web Service Certificate Expiry Alarm Threshold (7 to 180 days)',
        import_placeholder: 'The certificate must be in .crt, .cer, or .pem format.',
        errorWebCertFlag: 'Incorrect input parameter. Enter an integer ranging from 7 to 180.',
        upload_failed_tip: 'The file uploaded is in incorrect format.',
    },
    plugins_certificate_revocation_list: {
      title: 'Certificate Revocation List',
      import_btn: 'Import',
      webNotice: 'During software package reconstruction, the CRL checks the certificate validity of the server where \
        the dependency files are downloaded. A maximum of three certificates can be imported. Only the administrator \
        can perform this operation.',
      name: 'Certificate Name',
      issuedBy: 'Issued By',
      validTime: 'Effective Date',
      updateTime: 'Next Update Time',
      certStatus: 'Cert Status',
      certIsValidate: 'The certificate is valid.',
      certIsNotValidate: 'The certificate has expired. Import the latest certificate.',
      options: 'Operation',
      delete: 'Delete',
      deletCRL: 'Delete File',
      confirm: 'Confirm',
      serialNumber: 'Serial Number',
      revocationDate: 'Revocation Date',
      deleteCRLTips: 'After a file is deleted, all historical data related to the file will be deleted. \
        Exercise caution when performing this operation.',
      maxLimitTitle: 'Notice',
      maxLimitTips: 'The number of CRLs has reached the upper limit. Delete unnecessary certificates.',
      close: 'Close',
      replace: 'Replace',
      cancel: 'Cancel',
      importDuplicateTitle: 'Import Duplicate Files',
      importDuplicateTips: `The {1} certificate already exists. Do you want to replace it? \
        The contents of the original file will be overwritten after the file is replaced.`,
      fileSize: 'The file exceeds 5 M.',
      importStatus: 'Importing...'
    },
    plugins_porting_weakPassword: {
        pwd_rule: 'The weak password must contain at least two types of the following characters: \
        uppercase letters, lowercase letters, digits, and special characters (`~!@#$%^&*()-_=+\\|[{}];:\'",<.>/?). \
        The length ranges from 8 to 32 characters.Spaces are not allowed.',
        addWeakPwd: 'Add',
        addWeakPwdTitle: 'Add Weak Password',
        WeakPwd: 'Weak Password',
        searchWeakPwd: 'Search for weak passwords',
        deleWeakPwd: 'Delete Weak Password',
        weakPasswordTip: 'Weak passwords are passwords that can be easily guessed or cracked by tools. \
        For security purposes, the system does not allow weak passwords when users are setting or modifying passwords.',
        confirmdele: 'Are you sure you want to delete the weak password '
    },
    plugins_porting_message_saveConfirm: 'Are you sure you want to save the current configuration? \
    If you click OK, you will be logged out of the system.',
    plugins_porting_title_saveConfirm: 'Save Configuration',
    plugins_porting_weakCheck: {
        delete_report: 'Delete Report',
        delete_all_report: 'Delete All Reports',
        check_tip: 'If the GCC version is earlier than 5.4, upgrade the GCC version. Otherwise, \
        the memory consistency check is unavailable.',
        mode_name: 'Check Mode',
        mode_0: 'Auto repair by compiler',
        mode_1: 'Static check',
        mode_2: 'Source Code File',
        mode_3: 'BC File',
        mode_tip: 'Current Kunpeng Code Scanner running environment:',
        mode_tip_1: '. Ensure that the project to be checked has been successfully compiled on the Kunpeng platform.',
        errmsg: 'Parsing failed. You can upload a compilation command file.',
        bc_tip: 'Upload Type',
        bc_tip1: 'BC(BitCode) files are binary files of intermediate representation (IR),\
         which are generated through the Clang or LLVM compilation.For details, see the ',
        compile_command: 'Compile Command',
        bc_file: 'BC File',
        cmd_holder: 'Enter compilation commands. Use semicolons (;) to separate multiple commands. \
Compilation commands support make, cmake, configure, shell commands, and shell scripts. \
make install is not supported when the make command is used. \
Building commands or scripts cannot be used to create or modify directories and files except the user space ({0}).',
        bc_giveup: 'the static check of the BC file?',
        wait_test: 'BC File',
        start_check: 'Check',
        compiler_tool_configuration: 'Generating compiler tool configuration files',
        download_compiler_config: 'Download compiler configuration files',
        lock_auto_fix_body_true: 'The report is not up-to-date. \
Download the compiler configuration file in the latest analysis report: {0}.',
        lock_auto_fix_body_false: 'The report is not up-to-date. \
Download the compiler configuration file in the latest analysis report: {0}.\
Generate compiler configuration file is not selected in the latest report.',
        bc_download_on: 'If the source code is too large, you can',
        bc_download_un: 'the generated BC file',
        bc_download: 'Download BC File',
        bcAutoFixinvalidation: 'Invalid configuration file. Generate a new one.',
        bc_result: {
          head: 'Memory consistency check result',
          title: 'The memory consistency check is successful. The check result is as follows:',
          filename: 'File Name',
          scan_result: 'Check Results',
          hand_suggesst: 'Handling Suggestions',
          no_modify: 'No content needs to be modified in the specified analysis path or analysis package',
          success: 'Check succeeded.',
          view_report: 'View Reports',
        },
        bc_modal: {
          num: 'No.',
          filename: 'File Name',
          path: 'Path',
          operating: 'Operation',
          download_btn: 'Download',
          download_tip: 'download',
        },
        step: [
            {
                title: 'Upload Source Code File',
                path: 'Source Code File Path: ',
                path_bc: 'BC File Path:',
            },
            {
                title_compileComand: 'Select the generated BC file',
                title_compiler: 'Select the generated BC file',
                title_can: 'You can',
                title_download: 'download',
                title_compileOrUploadFile: 'the compilation command file, or',
                title_replace: 'upload',
                title_compileFile: 'a new compilation command file.',
            },
            {
                title: 'Start Check',
            }
        ],
        confirm_title: 'Check',
        prev_btn: 'Previous',
        next_btn: 'Next',
        textarea_step1_weak: 'Enter a relative path by performing either of the following: \
        1. Click the Upload button to upload the compressed package \
        (automatically decompressed during the upload process), and then enter the name of the source code folder.\
        2. Manually upload the source code file to a path on the server, for example',
        textarea_step1_weak_example: 'and then enter the relative path, such as example.',
        report_list_tip: 'Total Modifications',
        report_suggestion: 'Suggestion',
        auto_fix: {
            version: 'OS and GCC Versions Supported',
            version_title: 'List of Supported OSs and GCC Versions',
            system: 'OS',
            gccVersion: 'GCC Versions',
            desc: 'NOTE',
            question: 'The following lists the default GCC versions supported by the OSs. \
              If the GCC version has been upgraded on \
              the server OS, compatibility issues may occur.',
            operating: 'Preparation',
            step1: {
                title: 'Step 1 Install the memory consistency repair component',
                title_downloadFixComponent: '1. Obtaining the memory consistency repair component',
                title_fixComponent: 'memory consistency repair component:',
                title_libstdc: 'libstdc++6.so dependent library:',
                title_allDependency: '(This dependency is indispensable for Debian and Red Hat OSs)',
                title_decompress: '2. Decompress the dependency package',
                title_confirmFiles: 'Decompress the package and check that the following files exist in the \
                  gcctool/bin directory:',
                note: 'CAUTION: ',
                title_setting: '3. Configure environment variables',
                title_setEvn: 'Place gcctool in the installation directory and configure environment variables:',
            },
            step2: {
                title: 'Step 2 Modify and compile the GCC',
                title_downloadGccSourceCode: '1. Download the GCC source code',
                title_gccSource: 'GCC source code:',
                title_downloadGcc: '(Download the source code of the correct version from the official GCC website)',
                title_gccPath: 'GCC repair tool patch:',
                title_dependcyPack: '(Download the patch of the corresponding GCC version)',
                title_applyGcc: '2. Apply the GCC patch',
                title_installFirst: 'If "patch" command not found" is displayed, install the following first:',
                title_debian: 'Debian OSs:',
                title_radhat: 'Red Hat OSs:',
                title_compileGcc: '3. Compile GCC',
                title_gccTips: 'For details, see the official GCC documents. The patch applied does not affect the \
                GCC compilation dependencies and compilation process. For any GCC compilation problems, visit the',
                title_GNU: 'GNU community',
            },
            use: {
                title: 'Procedure',
                title_1: 'Step 1 Set the optimization level of the memory consistency repair component',
                title_tips: 'You can set this environment variable to specify the level for repairing the memory consistency. \
                If you do not set this environment variable, the repair tool does not take effect.',
                title_level0: '0: disables the memory consistency repair function.',
                title_level1: '1: uses that the application component optimization rules to minimize performance loss.',
                title_level2: '2: uses the most secure repair policy, which compromises the performance a lot.',
                title_2: 'Step 2 (Optional) Define the source code to be automatically fixed',
                title_2_subTitle: '1. Specify the source code to be automatically fixed by file or function in an \
                  allowlist. Only the content in the allowlist can be fixed.',
                link: 'View More',
                title_2_content_1: ' The allowlist must comply with the following rules: ',
                detailList1: ['a) The file list must start with "files":. Each file occupies one line.',
                    'b) Only absolute paths are allowed for files.',
                    'c) Only C, C++, and Fortran files are supported. Assembly files are not supported.',
                    'd) The function list must start with "functions":. Each function occupies a line.',
                    'e) Common C/C++ functions are supported. Templates or functions with \
                    the "abi_tag" attribute are not supported.'],
                title_2_content_2: '2. Set the allowlist path',
                detail2: 'Set environment variables to specify the path of the allowlist. \
                  By default, the path is not set.',
                title_compile: 'Step 3 Compile the software',
                title_compile_content: 'You can compile the software. The compilation process remains unchanged.\
                 (Remove the -pipe compilation option if it is used in the original compilation. \
                    This does not affect the original compilation result.)',
                hide_guide: 'Collapse'
            }
        },
        analysis_center: {
            step1: '选择待重构软件包',
            step2: '配置依赖文件',
            step3: '执行重构'
        },
        sourceHistory: 'Source Code',
        BCHistory: 'BC',
        common_term_weak_result_cFile: 'Source Code Files to Be Modification',
        common_term_bc_suggestion_title: 'Modifications Summary',
        common_term_cFile_suggestion_label: 'Number of Recommended Modifications',
        common_term_cFile_path_label: 'Path',
        common_term_check_code_warn: 'A large amount of source code may consume resources. It is recommended \
        that the code not exceed 100,000 lines; Each time a memory consistency check task is created, \
        the source code file needs to be uploaded again.',
        common_term_compile_info_1: 'Check the following software compile command list. You can modify and \
        upload it. Ensure that the command list is correct. It will be used as input for the subsequent check.',
        common_term_compile_info_2: 'Incorrect compile commands will cause the check to fail.'
    },
    plugins_porting_title_serverException: 'The server does not respond. \
      Perform the following steps to rectify the fault:',
    plugins_porting_message_networkErrorTip: '1. Run the curl {0}:{1} command the local host \
    to check whether the server is reachable.',
    plugins_porting_message_networkErrorTip_deployScenario: '1. Run the ssh {0} command the local host \
    to check the server is reachable.',
    plugins_porting_message_networkErrorResult1: '- If yes, go to step 3.',
    plugins_porting_message_networkErrorResult2: '- If no, go to step 2.',
    plugins_porting_message_networkErrorYunTip: '2. If you use a HUAWEI cloud server, \
      ensure that the server address is a public IP address of HUAWEI CLOUD. \
      You cannot access the server with a private IP address. \
      If the peer server is not a HUAWEI cloud server, check for the following issues:',
    plugins_porting_message_networkErrorYunTip_deployScenario: '2. If you use a HUAWEI cloud server, \
      ensure that the server address is a public IP address of HUAWEI CLOUD. \
      You cannot access the server with a private IP address. \
      If the peer server is not a HUAWEI cloud server, check for the following issues:',
    plugins_porting_message_serverErrorTip: '3.  Log in to the server OS and check the host or container \
      services are running properly.',
    plugins_porting_message_serverErrorResult1: '- If yes, go to step 4.',
    plugins_porting_message_serverErrorResult2: '- If no, rectify the fault by following the instructions provided in \
    <a href="{0}">How Do I Troubleshoot the Server in Abnormal Status?</a>.',
    plugins_porting_message_CommunityTip: '{0}. Report your problem on the <a href="{1}">Kunpeng Community</a>.',
    plugins_porting_message_connIssue1: '1) The IP address entered does not exist.',
    plugins_porting_message_connIssue2: '2) The DevKit application is not installed on the server, \
      or the server port {0} is incorrect.',
    plugins_porting_message_connIssue2_deployScenario: '2) The server has SSH disabled.',
    plugins_porting_message_connIssue3: '3) The network cables are not properly connected.',
    plugins_porting_message_connIssue4: '4) Network policies, such as interception rules, are used.',
    plugins_porting_message_connIssue5: '5) Check the network status and network configurations.',
    plugins_porting_message_weak_pwd_noData: 'No results found',
    plugins_porting_software_relay_file: {
        failTitle: 'Folder cannot be uploaded',
        title: 'Upload Dependencies',
        des1: 'Drag and drop files here, or ',
        des2: 'click upload.',
        tip: 'Each file to be uploaded cannot exceed 1 GB. If a file with the same name exists, \
      it will be overwritten by the newly selected file',
        progressSuffix: 'uploading…',
        fileTitle: ' files to be uploaded',
        successFile: ' files uploaded successful',
        successSize: 'Size: ',
        fileNum: ' files',
        content: '{0} already exists. Do you want to replace it?',
        replaceTitle: 'Replace File',
        replaceMsg: 'File Replaced',
        cancelTipTitle: 'Cancel File Upload',
        cancelTip: 'After you click OK, the file upload stops. Exercise caution when performing this operation.',
    },
    common_term_modal: {
        relayArm: {
            title: 'Confirm',
            content: 'The file name contains keywords Arm64 or AArch64,\
             which may be compatible with the Kunpeng platform. Are you sure you want to upload it?'
        }
    },
    login_timeout_tip: 'Login timeout',
    common_term_report_detail: {
        copyLink: 'Copy Link',
        copySuccess: 'Link copied'
    },
    software_package_detail: {
        time: 'Report Generated',
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
              and rebuild the software.',
          suggestion_13: 'Insecure communication protocols. Manually disable CRL check or download the file, \
            upload the file to the dependency path, and rebuild the software package.',
          suggestion_14: 'Failed to obtain the proxy information. Manually disable CRL check or download the file, \
            upload the file to the dependency path, and rebuild the software package.',
          suggestion_15: ' Failed to obtain the certificate. Manually disable CRL check or download the file, \
            upload the file to the dependency path, and rebuild the software package.',
          suggestion_16: 'The certificate has expired. Manually disable CRL check or download the file, \
            upload the file to the dependency path, and rebuild the software package',
          suggestion_17: 'The CA is untrusted. Manually disable CRL check or download the file, \
            upload the file to the dependency path, and rebuild the software package.',
          suggestion_18: 'The certificate has been revoked. Manually disable CRL check or download the file, \
            upload the file to the dependency path, and rebuild the software package.',
        },
        common_term_config_title: 'Rebuild Information',
        common_term_name_label_1: 'File Name',
        common_term_filePath_label: 'Path',
        common_term_report_level_result: 'Verify whether it is compatible with the Kunpeng platform. If not, \
          obtain a Kunpeng-compatible version from your vendor or obtain the source code and compile it to \
          a Kunpeng-compatible version.',
    },
    plugins_porting_common_role: {
        Admin: 'Admin',
        User: 'User'
    },
    about_more: {
        about_more_btn: 'More',
        title: 'Obtain More Operating Systems',
        about_more_step1: '1. Supported OSs.',
        about_more_step2: '2. If the target OS is not in the compatibility list, \
          log in to the Kunpeng community to download the latest ',
        about_more_step4: '4. After the upgrade, return to the task creation page to check the OS list.',
        about_more_step4_desc1: 'If the target OS is in the list, select it.'
    },
    period: '.',
    semicolon: '; ',
    plugins_porting_remote_env: {
        use_process: 'Process of Applying for a Remote Lab Trial',
        apply_remote_env: 'Applying for a Remote Lab Trial',
        apply_remote_env_info: 'You can also apply for a Kunpeng remote lab for trial. \
          A remote lab is pre-installed with the Kunpeng Porting Advisor, Kunpeng Compiler, \
          Kunpeng Hyper Tuner, and Dynamic Binary Translator (ExaGear).',
        remaining_places: 'Remaining Free Trial Quota: ',
        immediately: 'Apply Now',
        check_email: 'Receive the email notification',
        check_email_info: 'After your application is approved, the cloud server information will be \
          sent to your reserved email box.',
        config_serve: 'Configure the cloud server',
        config_serve_info: 'Follow the information in the email to configure remote login for the cloud server. \
        You can also configure the IP address of a local server that has the Kunpeng DevKit deployed.',
        config_now: 'Configure Now',
        early_release_or_extended_use: 'Release before expiration or extend the use',
        early_release_or_extended_use_info: 'You can release resources before expiration or \
        extend the use on the webpage where you applied for the cloud server.'
    },
    plugins_porting_apply_free_env_info: 'You can also apply for a free trial environment.',
    plugins_porting_apply_free_env_link: 'Click here',
    plugins_porting_configure_remote_server: 'Porting Advisor – Configure Remote Server',
    plugins_porting_free_trial_remote_environment: 'Apply For Trial Remote Laboratory',
    commonTermUserSyslogRemark: 'The operation logs of a maximum of 30 days or 2000 records are displayed.'
};
