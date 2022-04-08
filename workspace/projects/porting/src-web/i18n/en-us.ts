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

const hardUrl: any = require('../assets/hard-coding/url.json');

export const i18n_US = {
  common_term_pro_name: 'Kunpeng Porting Advisor',
  common_term_tool_version: 'V2.3.0',
  aboutMsg: {
    about: 'About',
    name: 'Kunpeng Porting Advisor',
    version: 'Version 2.3.0',
    time: 'Release Date：2021.12.30',
    copyRight: 'Copyright © Huawei Technologies Co., Ltd. 2021. All rights reserved.'
  },
  common_term_welcome_tip: 'Analyzes software source code, and provides application porting suggestions.',
  common_term_welcometo: 'Welcome to',
  common_term_login_name: 'User Name',
  common_term_login_name1: 'Administrator',
  common_term_login_name2: 'Administrator :',
  common_term_login_password: 'Password',
  common_term_login_password2: 'Password :',
  weak_pwd_login_tip: 'Weak password. Enter another one.',
  common_term_login: {
    logout: {
      title: 'Log Out',
      content: 'Are you sure you want to log out of the Kunpeng Porting Advisor?'
    }
  },
  common_term_login_btn: 'Log In',
  common_term_search: 'Search',
  logout_ok: 'You have logged out of the system.',
  reset_pwd_ok:
        'Password changed successfully. Please log in using the new password.',
  common_term_copyright: 'Copyright © Huawei Technologies Co., Ltd. 2021. All rights reserved.',
  common_term_help_tip: 'Online Help',
  common_term_user_info: [
    'User Management', 'Operation Log', 'Change Password', 'Dependency Dictionary Management',
    'Template Management', 'Log Out', 'Run Log', 'Log Management'
  ],
  common_term_lang_info: ['简体中文', 'English'],
  passwordDic: 'Weak Password Dictionary',
  weakPasswordTip: 'Weak passwords are usually passwords that are easily guessed by others or cracked by crackers. \
  If the password is in the weak password dictionary when users set or change the password, the system forces the user to reset the password to improve password security.',
  weakPassword: {
    pwd_rule: 'The weak password must contain at least two types of the following characters: \
    uppercase letters, lowercase letters, digits, and special characters (`~!@#$%^&*()-_=+\\|[{}];:\'",<.>/?). \
    The length ranges from 8 to 32 characters.Spaces are not allowed.',
    addWeakPwd: 'Add Weak Password',
    title: 'Add',
    WeakPwd: 'Weak Password',
    searchWeakPwd: 'Search for weak passwords',
    deleWeakPwd: 'Delete Weak Password',
    confirmdele: 'Are you sure you want to delete the weak password'
  },
  sysSetting: 'System Settings',
  common_upload_unable: 'The download URL is not available because the dependency file is not an open-source file.',
  common_isHttp_disable: 'The browser version does not support direct download. Copy the link to download the file.',
  common_term_user_info_backup: 'Back Up',
  common_term_user_info_restore: 'Restore',
  common_term_user_info_upgrade: 'Upgrade',
  common_term_return: 'Back',
  common_term_user_sysLog_remark: 'A maximum of 2,000 operation logs (within recent 30 days) are displayed.',
  common_term_go_back_tab: 'Back',
  common_term_go_back_tab1: 'Back',
  common_term_go_back_tab2: 'Back',
  common_term_go_back_tab3: 'Back',
  common_term_go_back_tab4: 'Back',
  common_term_user_label: {
    tip: 'To ensure account security, change the initial password and log in again.',
    name: 'User Name',
    role: 'Role',
    workspace: 'Workspace',
    password: 'Password',
    confirmPwd: 'Confirm Password',
    adminPwd: 'Administrator Password',
    oldPwd: 'Old Password',
    newPwd: 'New Password',
  },
  common_term_password_check: 'Enter the administrator password.',
  common_term_select: 'Configuration',
  common_term_operate: 'Operation',
  common_term_create_user: 'Add User',
  common_term_create_user_title: 'Add',
  common_term_operate_del: 'Delete',
  common_term_file_too_large_error: 'The file is too large and cannot be uploaded.',
  common_term_operate_reset: 'Reset Password',
  common_term_operate_change: 'Change Password',
  common_term_operate_delete_title: 'Delete User',
  common_term_operate_delete_tip1: 'The data of a deleted user and their tasks that are \
  being executed or queued for execution will be deleted.',
  common_term_operate_ok: 'OK',
  common_term_operate_cancel: 'Cancel',
  common_term_operate_close: 'Close',
  common_term_operate_check: 'Go',
  common_term_operate_Download: 'Download',
  common_term_operate_Create: 'Create',
  common_term_operate_locked1: 'View or modify the source code in the latest analysis report {1}.',
  common_term_operate_lockedTitle: 'The report is not the latest.',
  common_term_operate_locked1_download: 'Download the latest analysis report: {0} .',
  common_term_operate_locked1_noOldReport: 'Create a new analysis task.',
  common_term_create_tip: 'The user name cannot be modified after it is saved.',
  common_term_log_userName: 'User Name',
  common_term_log_event: 'Event',
  common_term_log_result: 'Result',
  common_term_log_time: 'Time',
  common_term_log_Detail: 'Details',
  common_term_analysis_package_label: 'Analyze Software Installation Package',
  common_term_analysis_path_label: 'Analyze Installed Software',
  common_term_analysis_softwareCode_label: 'Analyze Source Code',
  common_term_analysis_package_tip: 'Enter the path or name of the software installation package, and click Analyze.',
  common_term_analysis_installed_tip: 'Enter the installation path of the software, and click Analyze.',
  common_term_analysis_source_code_path: 'Click Upload Source Code on the right to upload a compressed \
  package (automatically decompressed during the upload) or directory.',
  common_term_analysis_source_portcode_path: 'Click Upload Source Code on the right to upload \
  a compressed package (automatically decompressed during the upload).',
  common_term_analysis_source_software_path: 'Click Upload on the right to upload a software package.',
  common_term_analysis_source_code_path1: 'Enter a relative path using either of the methods: ',
  common_term_analysis_source_code_path2: '1. Click Upload to upload the compressed package (automatically \
  decompressed during the upload) or the folder.',
  common_term_analysis_source_code_path3: '2. Upload the source code file to the specified path ({1}) on the server, \
  grant the read, write and execute permissions to the porting user, and then click the drop-down list to select the source code path. \
  Alternatively, enter the source code path.',
  common_term_analysis_installed_path_hint4: 'Upload the dependencies (SO libraries and JAR files) required',
  common_term_analysis_installed_path_hint5: ' for rebuilding the software package.',
  common_term_analysis_rebuild_package_path1: 'Enter a relative path using either of the methods:',
  common_term_analysis_rebuild_package_path2: '1. Click Upload to upload the software package;',
  common_term_analysis_rebuild_package_path3: '2. Upload the software package to the specified path ({1}) on the server, \
  grant the read, write and execute permissions to the porting user, and then click the drop-down list to select the software package. \
  Alternatively, enter the software package name.',
  common_term_analysis_installed_path_hint9: 'on the server, and then click the text box to select \
  the software package from the drop-down list. You can also manually enter the software package name.',
  common_term_analysis_installed_path_hint7: 'Enter a relative path using either of the methods: \
  1. Click Upload to upload the compressed package (automatically decompressed during the upload) or the folder.\
  2. Upload the source code file to the specified path ({1}) on the server, and then click \
  the text box to select the source code path from the drop-down list. \
  You can also manually enter the source code path.',
  common_term_analysis_sourcecode_path1: 'Enter a relative path using either of the methods: ',
  common_term_analysis_sourcecode_path2: '1. Click Upload to upload the compressed package (automatically \
  decompressed during the upload) or the folder.',
  common_term_analysis_sourcecode_path3: '2. Upload the source code file to the specified path ({1}) on the server,\
  grant the read, write and execute permissions to the porting user, and then click the drop-down list to select the source code path. \
  Alternatively, enter the source code path. Use commas (,) to separate multiple paths.',
  common_term_analysis_softwareCode_tip: 'Enter the path of the source code, and click Analyze.',
  common_term_analysis_title1: 'Configure Software Scanning Information',
  common_term_analysis_title2: 'Configure Target Environment',
  common_term_history_record: {
    tipInstruct: 'Download command issued'
  },
  common_term_history_project_label: 'Historical Reports',
  common_term_analysis_btn: 'Analyze',
  common_term_history_project_downloadc: 'Download Report (.csv)',
  common_term_history_project_downloadh: 'Download Report (.html)',
  common_term_monaco_information: 'Information',
  common_term_monaco_upload_information: 'Download Tips',
  commmon_term_monaco_upload_tip: 'The file has not been saved. Please save it and download it again?',
  commmon_term_monaco_IE_tip: 'The Monaco Editor is no longer compatible with Internet Explorer,\
   which may cause some functions to be unavailable. You are advised to use Google Chrome.',
  commmon_term_compatibility_tips_IE: 'Internet Explorer has poor compatibility with the current page,\
   which may cause some functions to be unavailable. Chrome is recommended.',
  common_term_ipt_label: {
    interpreted: 'Interpreted',
    packageName: 'Software Package Path or Name',
    package: 'Installation Package Path',
    pathName: 'Software Path on x86',
    path: 'Software Installation Path',
    source_code_path: 'Source Code File Path',
    enhanced_check: 'Source Code Enhancement Check',
    enhanced_tip_label: 'The check improves the performance of the source code running on the Kunpeng platform, \
    for example, by checking whether the structure variables are aligned with the Kunpeng Cache Line. \
    For details, see ',
    compiler_tip_label: 'The C/C++/ASM and GO languages share the same compiler version.',
    compiler_version: 'Compiler Version',
    construct_tool: 'Build Tool',
    compile_command: 'Compile Command',
    command_tip: 'Compile commands are defined in makefile or CMakeLists.txt. For details, see the ',
    bc_tip: ' For details, see the ',
    target_os: 'Target OS',
    target_system_kernel_version: 'Target OS Kernel Version',
    fortran: 'Source Code Type'
  },
  common_term_source_code_path_empty: 'The path for storing source code files cannot be empty.',
  common_porting_message_file_type_incorrect: 'Wrong file type.',
  common_term_porting_tip: 'Assembly code cannot be re-scanned after porting and migration.\
     Re-scanning will cause inaccurate analysis results.',
  common_term_interpreted_language_tip: 'Interpretive languages include Python, Java and Scala.',
  common_term_migrate_wait: 'To Be Ported:',
  common_term_setting_infor: 'Configuration',
  common_term_config_title: 'Rebuild Information',
  common_term_migrate_result_soFile: 'Dependency Libraries',
  common_term_migrate_result_cFile: 'Source Code Files',
  common_term_migrate_result_lines: 'Lines of Code',
  common_term_report_right_info4: 'Manpower',
  common_term_srcpath_tip:
    'Checked items: compile options, compile macros, assembler programs, built-in functions, attributes.',
  common_term_analysising: 'Analyzing...',
  common_term_not_close_page: 'Please do not close the page while analyzing.',
  common_term_analysis_completed: 'Analysis completed',
  common_term_analysis_report: 'report created successfully',
  common_term_report_result: 'Analysis Results',
  common_Estimated_standard_subtitle: 'Estimation standard: 1 person month = {0} lines of \
  C/C++/Fortran/Go/Build File source code or {1} lines of assembly code',
  common_Estimated_standard_subinfo1: 'person months',
  common_Estimated_standard_subinfo2: 'person month',
  common_term_result_package: 'Installation Packages',
  common_term_result_soFile: 'Architecture-Related Dependencies',
  common_term_result_cFile: 'Source Files to Be Ported',
  common_term_weak_result_cFile: 'Source Code Files to Be Modification',
  common_term_result_lines: 'Source Code to Be Ported',
  common_term_valition_rule1: 'The user name cannot be empty',
  common_term_operate_success: 'Successful',
  common_term_no_report: {
    softwareNoData: 'No software porting assessment record',
    sourceNoData: 'No source code porting record',
    rebuildNoData: 'No software package rebuild record',
    weakNoData: 'No static check source code records',
    BCNoData: 'No static check BC records'
  },
  common_no_table: {
    weakPwd: 'No results found'
  },
  reg_pwd: {
    different: 'The new and old passwords must be different',
    reverse: 'The new password cannot be the old password in reverse order.',
    complex: 'It must contain 8 to 32 characters and at least two types of the following characters: \
    uppercase letters, lowercase letters, \
    digits, and special characters (`~!@#$%^&*()-_=+\\|[{}];:\'",<.>/?). Spaces are not allowed.'
  },
  common_term_change_initial: 'Change Initial Password',
  common_term_change_initial1: 'Change Password',
  common_term_no_password: 'The password cannot be empty.',
  common_porting_message_passwordExpired: 'The validity period of the tool password is 90 days.',
  common_term_valition_username: 'The name must contain 6 to 32 characters, including at least two types \
  of the following characters: digits, letters, and symbols.',
  common_term_no_samepwd: 'The passwords do not match.',
  common_term_valition_adminRule: 'It must contain 8 to 32 characters and at least two types of the \
  following characters: uppercase letters, lowercase letters, digits, and special characters \
  (`~!@#$%^&*()-_=+\\|[{}];:\'",<.>/?). Spaces are not allowed.',
  common_term_valition_rule3: 'The user name contains 6 to 32 characters, including letters, digits, hyphens (-),\
   and underscores, and it must start with a letter.',
  common_term_valition_rule:
    'The new password cannot be the old password in reverse order. It must contain 8 to 32 characters \
    and at least two types of the following characters: uppercase letters, lowercase letters, digits, \
    and special characters (`~!@#$%^&*()-_=+\\|[{}];:\'",<.>/?),Spaces are not allowed.',
  common_term_valition_rule4: 'The compilation command must start with make, cmake, or go, for example, make xxx.',
  common_term_valition_rule5: 'The compile command parameter cannot contain Chinese \
  and the following special characters: < > | # ; & ` %.',
  common_term_valition_rule6: 'The compilation command must start with make or cmake, for example, make xxx.',
  common_term_transplant_report_label: 'Porting Report',
  common_term_porting_suggestion_label: 'Source Code Porting Suggestions',
  common_term_transplant_report_label_1: 'Check Report',
  common_term_porting_suggestion_label_1: 'Source Code Modification Suggestion',
  common_term_file_list_label: 'File list',
  common_term_orginal_source_code_label: 'Original Source Code',
  common_term_advised_source_code_label: 'Advised Source Code',
  common_term_advised_prev_label: 'Previous',
  common_term_advised_next_label: 'Next',
  common_term_suggestion_tip1:
    'Your source code will be displayed on the left, and advised source code will be displayed \
    on the right. The advised source code is only modification suggestions and does not affect the source code.',
  common_term_show_source_code: 'Display Source Code',
  common_term_operate_download: 'Download',
  common_term_operate_download1: 'The download link cannot be found. Please check.',
  common_term_no_label: 'No',
  common_term_type_label: 'File Type',
  common_term_filePath_label: 'Path',
  commonTermSoftFilePath: 'Package Storage Path',
  common_term_name_label: 'File Name',
  common_term_size_label: 'Size',
  common_term_detail_label: 'Detail',
  common_term_name_label_1: 'File Name',
  common_term_name_total: 'Total Dependencies',
  common_term_cFile_path_label: 'Path',
  common_term_cFile_suggestion_label: 'Number of Recommended Modifications',
  common_suggestion_position: 'Code Location',
  common_term_operate_analysis_name: 'Software Package to Download',
  common_term_operate_analysis_result: 'Analysis Results',
  common_term_operate_sugg_label: 'Handling Suggestions',
  common_term_option_cFile_all: 'All',
  common_term_option_lincount: 'Code Lines to Modify',
  common_term_report_detail_ctans_lins: 'Code Lines：{1} lines; ',
  common_term_report_soFile_dependent: 'Total: {1}, To be checked: {0}',
  common_term_report_cFile_dependent: 'Total Files:{0}',
  common_term_report_401: 'Login timeout or not logged in.',
  common_term_report_500: '500 Internal Server Error.',
  common_term_report_404: 'Page Not Found.',
  common_term_report_timeout: 'Request timed out',
  common_term_report_level_download_opt_desc: 'Install it from the image source using the \
  software installation commands.',
  common_term_report_detail: {
    copyLink: 'Copy Link',
    copySuccess: 'Link copied'
  },
  common_term_report_all: 'All',
  common_term_report_level0_desc: 'Compatible',
  common_term_report_level0_result: 'Download',
  common_term_report_level1_desc: 'Compatible ',
  common_term_report_level1_result: 'Download the source code of the Kunpeng version and compile it directly.',
  common_term_report_level2_desc: 'To be Verified',
  common_term_report_level2_result: 'Obtain the source code and compile it to a Kunpeng-compatible version or \
  use an alternate solution.',
  common_term_report_level3_desc: 'Compatible',
  common_term_report_level3_result: 'Download',
  common_term_report_level4_desc: 'Compatible',
  common_term_report_level4_result: 'Download the source code of the Kunpeng version and compile it directly.',
  common_term_report_level5_desc: 'To be Verified',
  common_term_report_level5_result: 'Verify whether it is compatible with the Kunpeng platform. \
  If not, obtain a Kunpeng-compatible version from your vendor or obtain the source code and \
  compile it to a Kunpeng-compatible version.',
  common_term_report_level6_desc: 'Compatible',
  common_term_report_level6_result: 'Download',
  common_term_report_level7_desc: 'To be Verified',
  common_term_report_level7_result: 'Verify whether it is compatible with the Kunpeng platform. \
  If not, obtain a Kunpeng-compatible version from your vendor or obtain the source code and \
  compile it to a Kunpeng-compatible version.',
  common_term_report_type: {
    dynamic_library: 'Dynamic library',
    static_library: 'Static library',
    exec: 'Executable file',
    jar: 'Jar package',
    software: 'Software Package to Download'
  },
  common_kunpeng_platform_compatible: 'This file is compatible with the Kunpeng platform.',
  common_term_history_report_del_title: 'Delete Tip',
  common_term_history_list_overflow_tip: 'Exceeded 50 historical reports.',
  common_term_history_list_overflow_tip2:
    'Please delete unnecessary historical reports in time.',
  common_term_history_report_del_tip:
    'Are you sure you want to delete the historical report?',
  common_term_history_report_del_tip2:
    'The historical report deleted cannot be restored. Exercise caution when performing deletion. \
    Are you sure you want to delete the historical report?',
  common_term_download_html_filename: 'File Name',
  common_term_download_html_lineno: 'Line Number(Start Line, End Line)',
  common_term_download_html_keyword: 'Keywords',
  common_term_download_html_suggestion: 'Suggestion',
  common_term_modal: {
    relayArm: {
      title: 'Confirm',
      content: 'The file name contains keywords Arm64 or AArch64, which may be compatible with \
      the Kunpeng platform. Are you sure you want to upload it?'
    }
  },
  common_term_headerTab1_label: 'Source Code Porting',
  common_term_headerTab1_labe_0: 'Software Porting Assessment',
  common_term_headerTab1_labe_1: 'Analyze Source Code',
  common_term_headerTab2_label: 'Dedicated Software Porting',
  common_term_headerTab3_label: 'Software Package Rebuilding',
  common_term_headerTab4_label: 'Enhanced Functions',
  common_term_headerTab3_label2: '64-Bit Environment Porting Pre-check',
  common_term_tab2_table_label1: 'Software Name',
  common_term_tab2_table_label2: 'Version',
  common_term_tab2_table_label3: 'Porting Description',
  common_term_tab2_table_label4: 'OS',
  common_term_tab2_table_label5: 'Huawei Maven Repository',
  common_term_headerTab1_label_tip: 'Checks and analyzes source code files in compiled \
  language (such as C, C++, Fortran, Go, Interpreted) and assembly files, locates the code to be ported, \
  and provides porting suggestions. It supports editing and one-click code replacement.',
  common_term_headerTab3_label_tip: 'Analyzes the composition of the software packages to be ported and \
  rebuilds software packages compatible with the Kunpeng platform. (The tool must run on the Kunpeng platform)',
  common_term_headerTab4_label_tip: 'Supports enhanced functions such as 64-bit running mode check, \
  structure byte alignment check, cache line alignment check, and memory consistency check.',
  common_term_community: 'Suggestion Feedback',
  common_term_user_manager: 'Administrator',
  common_term_user_common_user: 'User',
  common_term_steps_label: 'Perform Step',
  common_term_check_label: 'Prerequisite',
  common_term_execute_label: 'Execute',
  common_term_edit_file: 'Modify the {1} file.',
  comon_term_edit_line: 'Modify the code in line {1}.',
  common_term_edit_all_line: 'Replace all',
  common_term_delete_line: 'Delete the code in line {1}.',
  common_term_add_line: 'Add the code in line {1}.',
  common_term_orig_code: 'Before modification',
  common_term_new_code: 'After modification',
  common_term_migration_pre_tip: {
    title: 'Before You Start',
    content: 'During software porting process, you may need to install dependency components, \
    modify system configurations, download the software, and perform operations such as modification, \
    compilation, and building. Read the procedure description carefully before you start porting. \
    During dedicated software porting process, you may need to obtain dependency packages. \
    For details about the download URLs, see Appendix A.1 in the user guide.',
    label: 'I have read the above.',
    btn: 'OK'
  },
  common_term_migration_execute: 'Start',
  common_term_migration_info: 'Porting... Executing ',
  common_term_precond_label: 'Check Environment',
  common_term_batch_label: 'Execute Script',
  common_term_steps: 'Perform Step',
  common_term_info_label: 'Basic Information',
  common_term_migration_step: 'Porting Procedure',
  common_term_analysis_desc2: 'Supports pre-check for porting applications from the 32-bit x86 platform \
  to the 64-bit using GCC 4.8.5 to 9.1.',
  common_term_analysis_desc:
    'By analyzing the software composition and hardware dependency, the software analysis and \
    building function provides the capability of rebuilding the x86 platform software package \
    (in RPM or DEB format) on the Kunpeng platform.',
  common_term_migration_desc:
    'The software porting function provides software porting templates based on the Huawei TaiShan solution. \
    You can select the software corresponding to a template to port source code. \
    After the source code is ported, they will be automatically compiled and packaged.',
  common_term_build_tip_title: 'Note:',
  common_term_build_tip_title2: 'Note:',
  common_term_build_tip:
    '1. The 64-bit mode check works only on the x86/x64 platform and does not support the Kunpeng platform.',
  common_term_build_tip_1: '2. The tool checks the 32-bit applications to be ported from \
  the x86 platform to the 64-bit application platform. It supports GCC 4.8.5 to GCC 9.3.0.',
  common_term_build_tip_2:
    '1. The Structure Byte Alignment works only on the x86/x64 platform and does not support the Kunpeng platform.',
  common_term_build_tip_3: '2. The tool checks the 32-bit applications to be ported from \
  the x86 platform to the 64-bit application platform. It supports GCC 4.8.5 to GCC 9.3.0.',
  common_term_build_tip1: '1. The Software Package Rebuilding function works only on the Kunpeng platform.',
  common_term_build_tip2: '2. The RPM package can be executed only on a Red Hat Linux system. \
  The system component "rpmrebuild/rpmbuild/rpm2cpio" is required during rebuilding. \
  Check whether the system environment meets the requirements.',
  common_term_build_tip3:'3. The DEB package can be executed only on a Debian Linux system. \
  The system component "ar/dpkg-deb" is required during rebuilding. \
  Check whether the system environment meets the requirements.',
  common_term_build_tip4: '4. If the RPM or DEB package contains JAR packages, \
  check whether any JAR command exists in the system. If not, install the JDK tool.',
  common_term_build_tip5: '5. By default, the softwarepackage rebuilding result is saved in the \
  "{0}task_id/" directory(task_id indicates the task creation time). After the rebuilding is complete, \
  go to the directory to view the rebuilt software package or \
  the rebuilding failure report and handle the problem based on suggestions.',
  common_term_build_tip6: '6. During software package rebuilding, \
  you need to obtain dependency packages form some websites. \
  For details, see Appendix A.1 in the Porting Advisor User Guide.',
  common_term_path_source: 'Destination Path of Dependency Files',
  common_term_upload_resource: 'Upload',
  common_term_upload_file_resource: 'Uploading file ... Please try again later',
  common_term_upload_software: 'Upload',
  common_term_path_label: 'Package Path',
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
    }
  },
  source_code_info: {
    mac_info: 'This function does not support analyzing source code compressed into JAR or WAR packages.',
    consistency_mac_info: 'This function does not support analyzing source code compressed into JAR or \
    WAR or TBZ or TGZ packages.'
  },
  bit_operating_mode_check: {
    err_info_3: 'View the failure details in the run log.'
  },
  upload_maxium: 'The file upload task is queuing...',
  common_term_input_tip: 'A full path of the x86 software package. You can enter a detailed path or \
  a software package name suffixed with .rpm or .deb.',
  common_term_author:
    'Allow access to Internet for obtaining dependencies',
  common_term_opt_webpack: 'Rebuild',
  common_term_opt_check: 'Check',
  common_term_opt_check_exit: 'Back',
  common_term_checking: 'Performing porting pre-check:',
  common_term_portingcheck_tip: 'If you can perform other operations during the porting pre-check process. \
  Leaving the page does not interrupt the task.',
  common_term_portingcheck_fail: 'The porting pre-check has failed:',
  common_term_portingcheck_failmassage: 'The failure details:',
  common_term_portingcheck_success: '64-bit mode check succeeded',
  common_term_build_err_tip: 'Failed to find the software package. Check whether the software package name is correct.',
  common_term_analysizing: 'Rebuilding: ',
  common_term_webpacking_tip: 'You can perform other operations during the Software Package Rebuilding process. \
  Leaving the page does not interrupt the task.',
  common_term_migration_tip: 'You can perform other operations during the software porting. \
  Leaving this page does not interrupt the software porting task.',
  common_term_wepack_fail: 'Failed to rebuild the software package',
  common_term_wepack_fail_replacePack: 'The following files have been replaced. You can download them.',
  common_term_webpack_success: 'Software package rebuilt successfully',
  common_term_download_package: 'Download Rebuilt Package',
  common_term_webpack_success_tip:
    'By default, the rebuilt software package is stored in the {1} directory.',
  common_term_filename_tip: 'The value cannot be empty.',
  common_term_filename_tip2: 'You can enter the detailed path or software package name in the text box. \
  The file name extension must be .rpm or .deb.',
  common_term_migration_sort_BD: 'Big Data',
  common_term_migration_sort_BD_desc: 'Automatically ports, modifies, and compiles the \
  source code of common big data software to build software packages compatible with the \
  Kunpeng platform. (The tool must run on the Kunpeng platform)',
  common_term_migration_sort_MS: 'Middle Software',
  common_term_migration_sort_DS: 'SDS',
  common_term_migration_sort_DB: 'Database',
  common_term_migration_sort_DB_desc: 'Automatically ports, modifies, and compiles the \
  source code of common database software to build software packages compatible with the \
  Kunpeng platform. (The tool must run on the Kunpeng platform)',
  common_term_migration_sort_NW: 'Network',
  common_term_migration_sort_RTL: 'Run Time Library/Enviroment',
  common_term_migration_sort_HPC: 'HPC',
  common_term_migration_sort_HPC_desc: 'Automatically ports, modifies, and compiles the \
  source code of common HPC software to build software packages compatible with the \
  Kunpeng platform. (The tool must run on the Kunpeng platform)',
  common_term_migration_sort_SDS: 'SDS',
  common_term_migration_sort_CLOUD: 'CLOUD',
  common_term_migration_sort_NATIVE: 'Native',
  common_term_migration_sort_WEB: 'Web',
  common_term_migration_sort_WEB_desc: 'Automatically ports, modifies, and compiles the \
  source code of common web software to build software packages compatible with the \
  Kunpeng platform. (The tool must run on the Kunpeng platform)',
  common_term_setting_label: 'Scan Parameter Settings',
  common_term_keep_going_tip:
    'Keyword Scan',
  common_term_keep_going_tip_remark: 'Arm, Arm64, or AArch64 is detected. Are you sure you want to continue?',
  common_term_c_line: 'C/C++/Fortran/Go Porting Workload Estimation',
  common_term_asm_line: 'Assembly Porting Workload Estimation',
  common_term_c_line_unit: ' (Lines/Person-Month)',
  common_term_p_month_flag: 'Display Workload Estimation Results',
  common_term_config_valid: 'Incorrect parameter. Enter an integer ranging from 1 to 99,999.',
  common_term_yes: 'Yes',
  common_term_no: 'No',
  common_term_userPwd_label: 'User Password',
  common_term_com_tip:
    'Check whether {0} exists in the \'/usr/bin\' or \'/usr/local/bin\' directory in the current environment and whether the version is later than {1}.',
  common_term_back_tip:
    'Backup task is in process. Do not close the current page.',
  common_term_migration_success: 'The porting task is successfully.',
  common_term_migration_fail: 'Failed to execute the porting task.',
  common_term_migration_success_file_tips:
    'Download the porting result from this dialog box. The porting result will be lost after you close the dialog box.',
  common_term_migration_success_file_output: 'Porting Result',
  common_term_migration_success_file_download: 'Download Porting Result',
  common_term_migration_success_file_close_tips:
    'Are you sure you want to discard the current execution result?',
  common_term_migration_success_file_close_content:
    'Download the rebuilt package. The rebuilt package will be lost after you close the dialog box.',
  common_term_about: 'About',
  common_term_clear_btn: 'Clear',
  common_term_all_history_tip: 'Are you sure to delete all the historical reports?',
  common_term_all_history_tip2:
    'The historical reports cannot be restored after deletion. Exercise caution when performing this operation. Are you sure to delete all the historical reports?',
  common_term_log_filename: 'Log File Name',
  common_term_log_down: 'Operation',
  common_term_report_view: 'View Suggested Source Code',
  common_term_log_level_change: 'Are you sure you want to change the current log level?',
  common_term_log_usernum_change: 'Are you sure you want to modify the current settings?',
  common_term_log_level: 'Log Level',
  common_term_download_log: 'Download Log',
  common_term_download_runlog: 'One-click Download',
  common_term_CRL_config: 'Certificate Validity Check',
  common_term_max_user_num: 'Maximum Number of Online Common Users',
  common_term_firstlogin_tit: 'Specify the administrator password upon the first login.',
  common_term_upload_list: 'Upload List',
  common_term_upload_slow: 'The network speed is slow. Please wait until the upload is complete.',
  common_term_upload_decompressing: 'Decompressing',
  common_term_upload_source: 'Upload Resource Package',
  common_term_upload_code: 'Upload',
  common_term_upload_compressed: 'Compressed package',
  common_term_upload_directory: 'Directory',
  common_term_login_other: 'You have logged in from another terminal. Please check and try again.',
  common_term_fail_analysis: 'Failed',
  common_term_sure_save_tip1: 'Are you sure you want to save the ',
  common_term_sure_save_tip4: 'file?',
  common_term_sure_giveup_tip1: 'Are you sure you want to cancel the modification on the ',
  common_term_sure_giveup_tip3: 'file?',
  common_term_sure_leave_tip1: 'Are you sure you want to leave this page?',
  common_term_sure_giveup_tip2: 'Are you sure you want to discard the current execution result?',
  common_term_sure_save_tip: 'Save',
  common_term_sure_save_tip2: 'The source file will be backed up when the modification is saved.',
  common_term_sure_save_tip3: 'Are you sure you want to apply ${2} modifications in the',
  common_term_sure_save_tip5: 'file?',
  common_term_success_tip: 'Applied ${1} modifications in the ${2} file successfully.',
  common_term_giveup_tip2: 'If you cancel the modification, the modified data will be lost.',
  common_term_leave_tip2: 'If you leave this page, the data on the current page will be lost.',
  common_term_giveup_tip3: 'Download the latest reconstruction software package in the \
  displayed dialog box. You can download it in history after you close the dialog box.',
  common_term_giveup_tip4: 'Cancel the modification',
  disk_monitor: {
    label: 'Remaining Workspace',
    workspace: 'Workspace: ',
    workremain: 'Remaining Workspace: ',
    recommend: 'Recommended Remaining Workspace: > ',
    disk: 'Total Drive Capacity: ',
    disk_remain: 'Remaining Drive Capacity: ',
    disk_recommend: 'Recommended Remaining Drive Capacity> ',
    workspace_full_tip: 'Delete historical analysis records to release space. ',
    disk_full_tip: 'Release The Disk Space.',
    sample_opt_tip:
      'The remaining workspace is insufficient.Delete historical analysis records to release space.',
    sample_opt_tip_disk:
      'The remaining drive space is insufficient. Release the drive space.',
  },
  common_term_needCodeType: 'Select the source code package type',
  common_term_history_label: 'Threshold Settings',
  // 阈值设置
  thresholdSettings: {
    infoTip: 'The warning threshold of the history report must be smaller than the maximum \
    threshold of the history report.'
  },
  common_term_history_label_warnNum: 'Report Warning Threshold',
  common_term_history_label_warnTip: 'If the number of reports reaches this value, a message will be \
  displayed, asking you to delete some reports.',
  common_term_history_label_maxNum: 'Maximum Report Threshold',
  common_term_history_label_maxTip: 'If the number of reports reaches this value, the \
  report storage space is full and new tasks can be created only after some reports are deleted.',
  common_term_min_report_num: 'Alarm Threshold',
  common_term_min_report_tit: 'An alarm will be displayed prompting user to delete reports.',
  common_term_max_report_num: 'Function Disabling Threshold',
  common_term_max_report_tit: 'An alarm will be displayed indicating that the \
  number of reports has reached the limit and new analysis tasks are not allowed. Users need to delete reports.',
  common_term_report_safe_tit: 'Too many reports. Please delete some reports to release the storage space.',
  common_term_report_danger_tit: 'New tasks cannot be created because the \
  number of reports has reached the upper limit. Please delete reports that are not required.',
  disclaimer_modal: {
    title: 'Information',
    content: 'If you do not agree with the disclaimer, this tool will exit. \
    Exercise caution when performing this operation!',
    confirm: 'Cancel'
  },
  user_disclaimer: {
    title: 'Disclaimer',
    list1: 'Once you click OK, you acknowledge that you have understood and agreed to all content of this Disclaimer. ',
    list12: 'When you use this tool: state that you have agreed to and accepted this statement in its entirety',
    list10: '1. To prevent impact on services in the production environment, \
    it is recommended that you use this tool in a non-production environment.',
    list11: '2. Before uploading and viewing the source code, you have confirmed that \
    you are the source code owner or have obtained full authorization and consent from the source code owner.',
    list2: '3. No individual or organization shall use the source code for any purpose without the \
    authorization of the source code owner. Huawei is not liable for any consequences or \
    legal liabilities arising therefrom. If necessary, Huawei may pursue legal actions against \
    individuals or organizations aforementioned.',
    list3: '4. No individual or organization shall spread the source code without the authorization of the \
    source code owner. Huawei is not liable for any consequences or legal liabilities arising therefrom. \
    If necessary, Huawei may pursue legal actions against individuals or organizations aforementioned.',
    list4: '5. The source code and related content such as the porting reports, pre-check reports, \
    and suggestions are for reference only, and do not have legal effect or constitute specific \
    guidelines or legal suggestions of any kind.',
    list5: '6. Unless otherwise specified by laws, regulations, or contracts, Huawei does not make any \
    explicit or implicit statements, warranties, or commitments on the porting suggestions and \
    related content, or on the marketability, satisfaction, non-infringement, or applicability for \
    specific purposes of the porting suggestions and related content.',
    list6: '7. You shall assume any risks arising from your actions based on the porting suggestions and \
    related content. Huawei is not liable for any damage or loss of any nature under any circumstances.',
    list7: '8. After you click OK, the source code will be uploaded to the working directory of the \
    current server for scanning and analysis. The source code uploaded will not be used for other purposes. \
    In addition, other users who logged in to the server are not authorized to view the code in your working directory.'
  },
  certificate: {
    download_title: 'The certificate generated during tool installation is a self-signed certificate. \
    For security purposes, replace the certificate with your own certificate. ',
    download_link_name: 'Download Root Certificate',
    title: 'Certificate Management',
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
    notice: 'Information',
    warnNotice: 'Your web server certificate is about to expire or has expired.',
    country: 'Country',
    province: 'Province',
    city: 'City',
    organization: 'Company',
    department: 'Department',
    commonName: 'Common Name',
    options: 'Operation',
    generation_file: 'Generate CSR File',
    export_file: 'Import Web Server Certificate',
    more: 'More',
    restart: 'Restart Server',
    update: 'Update Working Key',
    file_label: 'Certificate File'
  },
  certificate_revocation_list: {
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
    filesizeTips: 'The file exceeds 5 M.',
    importStatus: 'Importing...',
    certificateEmpty: 'No certificate revocation list import information is available',
  },
  common_term_save: 'Save',
  common_term_back: 'Roll Back',
  common_term_upload_fail: 'Upload Fail',
  common_term_upload_time_out: 'Execution timed out. Manually upload and decompress the package.',
  common_term_upload_success: 'Upload successfully',
  upload_file_tip: {
    reg_fail: 'The file or folder name cannot contain Chinese characters, spaces, and the \
    following special characters: ^ ` / | ; & $ > < !. Modify the file or folder name and try again.'
  },
  common_term_upload_max_size_tip: 'The file exceeds 1 G. You need to manually upload the \
  file and change the file owner and permission. For details, see the ',
  common_term_upload_success_tip: 'Upload and decompress successfully',
  common_term_upload_exist_tip: 'Failed, file already exist.',
  common_term_creating_btn_disabled_tip: 'There are ongoing tasks or windows to be closed. \
  Perform this operation after the tasks are complete or the windows are closed.',
  common_term_quickfix_replacement: 'Replace with the recommended code.',
  common_term_quickfix_all_replacement: 'Apply modifications of this class in this file.',
  common_term_pre_check_clost_tip: '64-bit mode check for the current environment is complete. \
  The check results will be lost after the dialog box is closed.',
  common_term_byte_alignment_clost_tip: 'The byte alignment check is completed. If you exit from the check, \
  the check result will be lost.',
  common_term_view_report_btn: 'View Report',
  common_term_pre_check_success_tip: '64-bit mode check succeeded.',
  common_term_pre_check_success_tip1: '64-bit mode check succeeded: The specified analysis path or analysis \
  package does not contain the content that needs to be modified.',
  common_term_byte_check_success_tip1: 'Byte alignment check succeeded: The specified analysis path or \
  analysis package does not contain the content to be aligned.',
  common_term_source_code_failed_tip: 'Source code porting failed: ',
  common_term_workload_failed_tip: 'Software porting assessment failed：',
  common_term_workload_success_tip: 'Software porting assessment succeeded',
  common_term_source_code_porting_tip: 'Source code porting analyzing...',
  common_term_source_code_porting_wait_tip: 'Source code porting analysis task waiting...',
  common_term_workload_porting_tip: 'Software porting assessment analyzing...',
  common_term_software_porting_failed_tip: 'Software porting failed',
  common_term_software_package_failed_tip: 'Failed to rebuild the software package: ',
  common_term_software_package_failed_tip_1: 'Failed to create the software rebuild task: ',
  common_term_close_task_confirm_tip: 'Are you sure you want to cancel the current {0} task?',
  common_term_log_manage_tip: 'Compressing run logs...',
  common_term_log_manage_1_tip: 'log compression',
  common_term_log_manage_fail_tip: 'Compressing run logs failed: ',
  common_term_weak_check_porting_tip: 'Static check of memory consistency is in progress …',
  common_term_bc_check_porting_tip: 'Checking the BC file...',
  common_term_weak_check_porting_tip_1: 'It takes about one hour to check 50,000 code lines in C programming \
  language in the 64-core environment. The code is more complex when it contains more lines. As a result, \
  the time required for checking increases exponentially.',
  common_term_weak_check_success_tip: 'The static check report of the memory consistency generated successfully',
  common_term_weak_check_fail_tip: 'The static check failed: ',
  common_term_weak_compiler_tip: 'Generating the BC file...',
  common_term_weak_compiler_fail_tip: 'Failed to generate the BC file:',
  commmon_term_bc_tip: ' You can ',
  commmon_term_bc_tip1: 'manually generate the BC file by referring to the ',
  commmon_term_bc_tip2: 'manually generate the BC file by referring to the ',
  prevStr: 'Previous',
  nextStr: 'Next',
  common_term_task_nodata: 'No Data',
  common_term_design_nodata: 'No dependency file for this architecture was found.',
  commom_term_min_err: 'Incorrect parameter. Enter an integer ranging from 1 to 49.',
  commom_term_max_err: 'Incorrect parameter. Enter an integer ranging from 2 to 50.',
  tip_msg: {
    logged_in: 'user logged in elsewhere.',
    log_timeout: 'Logged out or timed out.',
    log_ok: 'Login successful.',
    create_ok: 'Create successfully',
    edite_ok: 'Modified successfully.',
    edite_error: 'Failed to edit.',
    delete_ok: 'Deleted successfully.',
    delete_error: 'Failed to delete.',
    add_ok: 'Added successfully.',
    add_error: 'Failed to add.',
    reset_pwd_error_old: 'Failed to change the password. Please enter the correct old password.',
    reset_pwd_error_repeat: 'Failed to change the password. New password must be the different with old password.',
    incorrect_value_range: 'Incorrect value range.',
    valueErrorScope: 'Incorrect input parameter. Enter an integer ranging from {1} to {2}.',
    cannot_be_empty: 'The value cannot be empty.',
    numberOnly: 'The value must be a number.',
  },
  backup : {
    ing: 'Backing up…',
    success: 'dependency dictionary Backup Success',
    fail: 'dependency dictionary Backup Failure',
    operation: 'Backup task is in process. Do not close the current page.',
    title: 'Are you sure you want to back up the dependency dictionary?',
    ps1: 'The system keeps only the latest dependency dictionary backup. \
    The historical backup is replaced by the latest one.'
  },
  restore : {
    ing: 'Restoration task in process…',
    success: 'Restoration Success',
    fail: 'Restoration Failure',
    operation: 'Restoration task in process. Do not close the current page.',
    title: 'Are you sure you want to restore the dependency dictionary?',
    ps1: 'Before restoring the dependency dictionary, ensure that the dependency dictionary has \
    been backed up and you have the administrator rights.'
  },
  upgrade : {
    ing: 'Upgrade task in process…',
    success: 'Upgrade Success',
    fail: 'Upgrade Failure',
    operation: 'Upgrade task in process. Do not close the current page.',
    title: 'Are you sure you want to upgrade the dependency dictionary?',
    ps1: 'Before upgrading the dependency dictionary, ensure that you have downloaded the \
    compressed dependency dictionary package and uploaded it to the server.'
  },
  backupSolution : {
    ing: 'Backing up…',
    success: 'Backup Success',
    fail: 'Backup Failure',
    operation: 'Backup task is in process. Do not close the current page.',
    title: 'Are you sure you want to back up the software porting template?',
    ps1: 'The system keeps only the latest software porting template backup. \
    The historical backup is replaced by the latest one.'
  },
  restoreSolution : {
    ing: 'Restoration task in process…',
    success: 'Restoration Success',
    fail: 'Restoration Failure',
    operation: 'Restoration task in process. Do not close the current page.',
    title: 'Are you sure you want to restore the software porting template?',
    ps1: 'Before restoring the software porting template, ensure that the software porting template \
    has been backed up and you have the administrator rights.'
  },
  upgradeSolution : {
    ing: 'Upgrade task in process…',
    success: 'Upgrade Success',
    fail: 'Upgrade Failure',
    operation: 'Upgrade task in process. Do not close the current page.',
    title: 'Are you sure you want to upgrade the software porting template? ',
    ps1: 'Before upgrading the porting template,\
     ensure that you have downloaded the porting template resource package and uploaded it to the server.'
  },
  whitelist: {
    backup: 'Back Up',
    backupRemark: 'After the dependency dictionary is backed up, you can restore the dependency dictionary to \
    the source version. The system retains only the latest dependency dictionary backup.',
    backupOp: 'Back Up',
    upgrade: 'Upgrade',
    upgradeRemark: 'Before upgrading the dependency dictionary, \
    log in to the Kunpeng community to download the latest ',
    whitelistPackage: ' dependency dictionary',
    upgradeOp: 'Upgrade',
    restore: 'Restore',
    restoreRemark: 'Restore to Stable Version.',
    restoreOp: 'Restore',
    upload: 'Dependency Dictionary'
  },
  softwarePortTem: {
    backup: 'Back Up',
    backupRemark: 'After the software porting template is backed up, you can restore the software porting template \
    to the source version. The system retains only the latest software porting template backup.',
    backupOp: 'Back Up',
    upgrade: 'Upgrade',
    upgradeRemark: 'Before upgrading the software porting template, log in to the Kunpeng community to download the ',
    softwarePackage: 'software porting template resource package',
    upgradeOp: 'Upgrade',
    restore: 'Restore',
    restoreRemark: 'Restore to Stable Version.',
    restoreOp: 'Restore',
    upload: 'Software Porting Template Resource Package'
  },
  theme_directory_contents: 'Contents',
  compilation_preCheck: 'Compilation Pre-check',
  compilation_preCheck_1: '64-bit Mode Check',
  compilation_preCheck_1_tip: 'Checks the software that is to be ported from the 32-bit platform to the \
  64-bit platform and provides modification suggestions. (The tool must run on the x86 platform)',
  compilation_preCheck_1_tip_more: 'View>>',
  compilation_preCheck_1_tip_see_more: 'Note',
  common_alignment_check: {
    title: 'Structure Byte Alignment ',
    operation: 'Alignment Check',
    statusIng: 'Checking the alignment...',
    preWaiting: '64-bit mode check task waiting...',
    byteWaiting: 'Structure byte alignment task waiting...',
    weakWaiting: 'Memory consistency check task waiting...',
    statusSuccess: 'Byte alignment check succeeded.',
    exit: 'Back',
    tableTitle: 'Structural Variable Memory Allocation',
    description: 'Checks the byte alignment of structure variables in the source code when byte alignment is required.'
  },
  common_cacheline_check: {
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
  common_task_list: 'Task List',
  common_term_changeConfig: 'Modify',
  common_term_timeout_period: 'Session Timeout Period ',
  common_term_timeout_period_unit: 'Session Timeout Period (minutes)',
  common_term_log_level_current: 'Current Log Level ',
  common_term_cert_config_title: 'Certificate Expiry Alarm Threshold',
  common_term_setting_cert_config: 'Web Service Certificate Expiry Alarm Threshold (days)',
  common_term_setting_cert_config_tip: 'The certificate is verified once every day.',
  common_term_cert_import_btn: 'Import',
  common_term_valition_city: 'The value can contain a maximum of 128 characters, \
  allowing letters, digits, hyphens (-), underscores (_), periods (.), and spaces.',
  common_term_valition_country: 'Enter a two-character country code.',
  common_term_valition_company: 'Enter a string of a maximum of 64 characters, \
  allowing letters, digits, hyphens (-), underscores (_), periods (.), and spaces.',
  common_term_valition_filename: 'The file name can contain only uppercase and lowercase letters, \
  digits, and special characters including underscores (_), hyphens (-), plus sign (+), periods (.)\
   and round brackets. It cannot start with a period (.) or exceed 64 characters.',
  common_term_valition_input: 'The value cannot contain Chinese characters, spaces, and the \
  following special characters: ^ ` | ; & $ > < !.',
  common_term_valition_filename_length: 'The maximum length of a single filename is 255 characters.',
  common_term_valition_command_length: 'The command input box can contain no more than 1024 characters.',
  common_term_valition_realpath: 'Enter a proper absolute path, for example, /home/pathname/',
  common_term_valition_path_length: 'The path name can contain a maximum of 1024 characters.',
  common_term_required_tip: 'This field cannot be left blank.',
  common_term_webcert_import_placeholder: 'The certificate must be in .crt, .cer, or .pem format.',
  common_term_webcert_import_tip: 'Ensure that the imported certificate is generated based on the CSR file.',
  common_term_webcert_import_pre_tip: 'Do not generate a new CSR file before importing the web server certificate.',
  common_term_webcert_restart_tip: 'The restart takes about 5 to 10 seconds. After the restart, \
  the operation can be performed normally.',
  common_term_webcert_update_key_tip: 'Are you sure you want to update the working key?',
  common_term_webcert_update_key_failed_title: 'Failed to update the working key.',
  common_term_webcert_tip: 'Warning',
  common_term_webcert_will_expire: 'Your web server certificate is about to expire on {0}. \
  Please replace the certificate in time.',
  common_term_webcert_expired: 'Your web server certificate has expired. Please replace the certificate.',
  analysis_center: {
    step1: 'Select the software package to be rebuilt',
    step2: 'Configure dependencies',
    step3: 'Rebuild',
    confirm_btn: 'Rebuild',
    prev_btn: 'Previous',
    next_btn: 'Next',
    title: 'Are you sure you want to continue the rebuild?',
    rpmExit: 'The uploaded RPM package already exists on the Kunpeng image site. \
    Download the RPM package of the correct version.',
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
    stepTwoMore2: `echo -e "[kunpeng]\\nname=CentOS-kunpeng - Base - mirror.iscas.ac.cn\\nbaseurl=\
${hardUrl.yumBase}\\ngpgcheck=0\\nenabled=1\\n\\n[bigdata-HDP]\
    \\nname=CentOS-kunpeng - bigdata-HDP - mirror.iscas.ac.cn\\nbaseurl=\
${hardUrl.yumBigDataHDP}\\ngpgcheck=0\\nenabled=1\\n\\n[bigdata-HDP-GPL]\
    \\nname=CentOS-kunpeng - bigdata-HDP-GPL - mirror.iscas.ac.cn\\nbaseurl=\
${hardUrl.yumBigDataHDPGPL}\\ngpgcheck=0\\nenabled=1\\n\\n[bigdata-HDP-UTILS]\
    \\nname=CentOS-kunpeng - bigdata-HDP-UTILS - mirror.iscas.ac.cn\\nbaseurl=\
${hardUrl.yumBigDataHDPUtils}\\ngpgcheck=0\\nenabled=1\\n\\n[bigdata-ambari]\
    \\nname=CentOS-kunpeng - bigdata-ambari - mirror.iscas.ac.cn\\nbaseurl=\
${hardUrl.yumBigDataAmbari}\\ngpgcheck=0\\nenabled=1" > \
    /home/mjt/CentOS-Base-kunpeng.repo`,
    stepThree: '3. Update the yum source configuration.',
    stepThreeMore: `yum clean all          #Clear all yum caches in the system.`,
    stepThreeMore2: `yum makecache         #Create yum caches.`,
    rebuild: 'Rebuild',
    stepsMirrorSource: [
      {
        name: 'Repository URL:',
        url: hardUrl.warehouseAddress,
      },
      {
        name: 'Big data RPM package URL:',
        url: hardUrl.bigDataAddress,
      },
      {
        name: 'Web RPM package URL:',
        url: hardUrl.webAddress,
      },
      {
        name: 'Distributed storage URL:',
        url: hardUrl.distributedStorageAddress,
      },
      {
        name: 'Database RPM package URL:',
        url: hardUrl.databaseAddress,
      },
      {
        name: 'Cloud and virtualization RPM package URL:',
        url: hardUrl.cloudAddress,
      }
    ],
    delete_file_content: `Are you sure you want to delete the file?`,
    exit: {
      title: 'Duplicate File',
      content: `{1} already exists. Do you want to replace it? `,
      replace: 'Replace',
      replaceTitle: 'Replace File',
      replaceMsg: 'File Replaced',
      save_as: 'Save As',
      file_name: 'File Name',
      delete_file: 'Delete File',
      delete_file_content: `Are you sure you want to delete the {1} file?`,
      delete_unable: 'If you want to delete files, contact the administrator.',
      cancel_title: 'Cancel File Upload',
      cancel_content: 'After you click OK, the file upload stops. Exercise caution when performing this operation.'
    },
    retry: {
      tip: 'A network exception occurs',
      title: 'Retry',
      excTip: 'Upload Exception',
    }
  },
  software_rebuild_x86_tip: 'The software package rebuilding is supported only by the Kunpeng platform. \
  The x86 platform does not support it.',
  certificate_upload_failed_tip: 'The file uploaded is in incorrect format.',
  certificate_size_failed: 'The certificate size cannot be greater than 1 MB.',
  source_code_type_tip: 'Select the source code type based on the programming language type to prevent \
  incorrect scanning results.',
  common_term_package_path_empty: 'The path or name of the software package cannot be empty.',
  porting_workload_label: {
    title: 'Automatically scans and analyzes software packages(not source code packages) and \
    installed software, and provides port evaluation reports.',
    type: 'Analysis Type',
    path: 'Software Package Path or Name: ',
    x86Path: 'Software Installation Path (x86)',
    path_package_tip: 'Enter the software package to be ported (such as a RPM, DEB, or \
      JAR/WAR package, or TAR, ZIP, and GZIP package). The tool scans and analyzes the porting feasibility.',
    path_installed_tip: 'Enter the installation path of the software installed on the x86 platform. \
    The tool scans and analyzes the porting capability.',
    type1: 'Analyze Software Package',
    type2: 'Analyze Installed Software (x86 platform only)',
    path_package_placeholder1: 'Enter a relative path using either of the methods: ',
    path_package_placeholder2: '1. Click Upload to upload the software package. ',
    path_package_placeholder3: '2. Upload the software package to the specified path ({1}) on the server, \
    grant the read, write and execute permissions to the porting user, and then click the drop-down list to select the software package. \
    Alternatively, enter the software package name. Use commas (,) to separate multiple paths.',
    path_installed_placeholder: 'You need to fill in the full path of the directory where the tool is installed. \
    For example, /home/pathname/'
  },
  software_relay_file: {
    failTitle: 'Folder cannot be uploaded',
    title: 'Upload Dependencies',
    des1: 'Drag and drop files here, or ',
    des2: 'click upload',
    des3: 'Add File',
    tip: 'Each file to be uploaded cannot exceed 1 GB. If a file with the same name exists, \
    it will be overwritten by the newly selected file',
    progressTitle: 'Uploading file…',
    fileTitle: ' files to be uploaded',
    successFile: ' files uploaded successful',
    successSize: 'Size: '
  },
  onlineHelp: {
    tip: ' For details, see the ',
    url: 'online help'
  },
  enhanced_functions_label: {
    type: 'Check Type',
    precheck: '64-bit Running Mode',
    byte: 'Structure Byte Alignment',
    cache: 'Cacheline Alignment',
    weak: 'Memory Consistency',
    precheck_desc: 'Checks the software that is to be ported from the 32-bit platform to the \
    64-bit platform and provides modification suggestions. (The tool supports GCC4.8.5 to GCC9.3.0.)',
    byte_desc: 'Checks the byte alignment of the structure variables in the source code if \
    byte alignment is required. (The tool supports GCC4.8.5 to GCC9.3.0.)',
    weak_desc: 'Check and rectify the memory consistency problems of the Kunpeng platform. \
    (The tool must run on the Kunpeng platform)',
    cache_desc: '128-byte alignment check is performed on the structure variables \
    in the C/C++ source code to improve the memory access performance.'
  },
  automake_evn_check: {
    tip: 'The Glibc version is earlier than 2.28. \
    Upgrade the Glibc version or perform operations by referring to the installation guide. \
    Otherwise, the automatic translation of assembly files cannot be used.',
    link: 'View Installation Guide',
    guide_title: '[Installation Guide]',
    guide_tip1: 'If the server can access the Internet, run bash addAsmLibraries.sh in {1}/tools/all_asm/bin.',
    guide_tip2: 'If the server cannot access the Internet, download the following RPM package to \
    the {1}/tools/all_asm/tmp/rpm directory and run bash addAsmLibraries.sh in {2}/tools/all_asm/bin.',
    hide_guide: 'Collapse'
  },
  weak_env_no: {
    tip: 'If the libstdc++ version is before 6.0.24 or the libtinfo version is not 5.9, \
    follow the installation guide to install the dependency library for memory consistency check. \
    Otherwise, the memory consistency check function is not available. ',
    tip_1: ' If the system is connected to the network, go to \
    the {1}/portadv/tools/weakconsistency/staticcodeanalyzer directory and run the bash ./add_libraries.sh command.',
    tip_2: 'If the system is not connected to the network, upload the DEB or RPM package to \
    any directory (for example, /home) on the server. Then go to \
    the {1}/portadv/tools/weakconsistency/staticcodeanalyzer directory, and run the \
    bash ./add_libraries.sh -d /home command (/home indicates the directory where the DEB or RPM package is uploaded).'
  },
  system_setting: {
    info: 'The new value is the same as the original one. '
  },
  disable_tip: {
    analysis_center_tip: 'The Software Package Rebuilding is not available in a non-Kunpeng environment',
    x86_tip: 'This function applies to the x86 platform only. The current operating environment is a Kunpeng platform.',
    arm_tip: 'This function applies to the Kunpeng platform only. The current operating environment is a x86 platform.',
    precheck_tip: 'The 64-bit mode check is not available in a non-x86 environment',
    byte_tip: 'The structure byte alignment check is not available in a non-x86 environment'
  },
  check_weak: {
    warn_title: 'A large amount of source code may consume resources. It is recommended that the code not exceed \
    100,000 lines; Each time a memory consistency check task is created, \
    the source code file needs to be uploaded again.',
    mode_name: 'Check Mode',
    mode_0: 'Auto repair by compiler',
    mode_1: 'Static check',
    mode_2: 'Source Code File',
    mode_3: 'BC File',
    cFile_noData: 'The scan is completed. No source file to be modification is found.',
    mode_tip: 'Current Kunpeng Code Scanner running environment: ',
    bc_tip: 'Upload Type',
    bc_tip1: 'BC(BitCode) files are binary files of intermediate representation (IR), \
    which are generated through the Clang or LLVM compilation. For details, see the ',
    mode_tip_1: '. Ensure that the project to be checked has been successfully compiled on the Kunpeng platform.',
    wait_test: 'BC File',
    start_check: 'Check',
    compile_command: 'Compile Command',
    bc_file: 'BC File',
    cmd_holder: 'Enter compilation commands. Use semicolons (;) to separate multiple commands. \
Compilation commands support make, cmake, configure, shell commands, and shell scripts. \
make install is not supported when the make command is used. Building commands or \
scripts cannot be used to create or modify directories and files except the user space ({0}).',
    sourceHistory: 'Source Code',
    BCHistory: 'BC',
    BcConfigFileInvalid: 'Invalid configuration file. Generate a new one.',
    quickfix_tip: 'This line has multiple points to be modified,Therefore, \
    the quick fix function is unavailable,please add "__asm__ volatile("dmb sy")"',
    bc_giveup: 'the static check of the BC file?',
    compiler_tool_configuration: 'Generating compiler tool configuration files',
    download_compiler_config: 'Download compiler configuration files',
    lock_auto_fix_title: 'The compiler configuration file is not up-to-date',
    lock_auto_fix_body_true: 'Download the compiler configuration file in the latest analysis report: {0}.',
    lock_auto_fix_body_false: 'Download the compiler configuration file in the latest analysis report: {0}, \
and do not select Generate compiler configuration file in the latest report.',
    bc_download_on: 'If the source code is too large, you can',
    bc_download_un: 'the generated BC file',
    bc_download: 'Download BC File',
    bc_result: {
      title: 'The memory consistency check is successful. The check result is as follows:',
      filename: 'File Name',
      scan_result: 'Scan Results',
      hand_suggesst: 'Handling Suggestions',
      no_modify: 'No content needs to be modified in the specified analysis path or analysis package',
      success: 'Check succeeded.',
    },
    bc_modal: {
      num: 'No.',
      filename: 'File Name',
      path: 'Path',
      operating: 'Operation',
      download_btn: 'Download',
    },
    step: [
      {
        title: 'Upload Source Code File',
        path: 'Source Code File Path',
        path_bc: 'BC File Path:',
      },
      {
        tip1: 'Check the following software compile command list. You can modify and upload it. \
        Ensure that the command list is correct. It will be used as input for the subsequent check. ',
        tip2: 'Incorrect compile commands will cause the check to fail.',
        title_1: 'Select the generated BC file',
        title_2: 'Select the generated BC file',
        title_3_1: 'You can ',
        title_3_2: 'download ',
        title_3_3: 'the compilation command file, or upload a compilation command file to ',
        title_3_4: 'replace ',
        title_3_5: 'the original one.',
        err_tip_1: 'Parsing failed. You can ',
        err_tip_2: 'upload ',
        err_tip_3: 'a compilation command file.'
      },
      {
        title: 'Start Check',
      }
    ],
    confirm_title: 'Check',
    textarea_weak_bc1: 'Enter a relative path using either of the methods: ',
    textarea_weak_bc2: '1. Click Upload to upload the BC file.',
    textarea_weak_bc3: '2. Upload the BC file to the specified path ({1}) on the server,\
    grant the read, write and execute permissions to the porting user, and then click the drop-down list to select the BC file. \
    Alternatively, enter the BC file name.',
    textarea_step1_weak_example: 'on the server, and then click the text box to select the \
    source code path from the drop-down list. You can also manually enter the source code path.',
    textarea_step1_weak_example1: ',enter the BC file name again.',
    BCFile: 'BC File Path',
    BCSuggestion: {
      title: 'Modifications Summary'
    },
    report_list_tip: 'Total Modifications',
    report_list_tip_1: 'Suggestion',
    auto_fix: {
      version: 'OS and GCC Versions Supported',
      version_title: 'List of Supported OSs and GCC Versions',
      system: 'OS',
      gccVersion: 'GCC Versions',
      desc: 'NOTE: ',
      question: 'The following lists the default GCC versions supported by the OSs. \
      If the GCC version has been upgraded on the server OS, compatibility issues may occur.',
      operating: 'Preparation',
      step1: {
        title: 'Step 1 Install the memory consistency repair component',
        title_1: '1. Obtaining the memory consistency repair component',
        title_1_content_1: 'Component: ',
        title_1_content_1_path: 'in the Porting Advisor installation directory',
        title_1_content_2: 'libstdc++6.so dependency library: ',
        title_1_content_3: '(for Debian and Red Hat series OS)',
        title_2: '2. Decompress the dependency package',
        title_2_content: 'Decompress the package and check that the following files exist in the \
        gcctool/bin directory: gcctool，gcctool-bin，libstdc++.so.6',
        note: 'CAUTION: ',
        title_3: '3. Configure environment variables',
        title_3_content: 'Place gcctool in the installation directory and \
        configure environment variables: export PATH=/path/to/gcctool/bin:$PATH',
      },
      step2: {
        title: 'Step 2 Modify and compile the GCC',
        title_1: '1. Download the GCC source code',
        title_1_content_1: 'GCC source code:',
        title_1_content_2: '(Download the source code of the correct version from the official GCC website)',
        title_1_content_3: 'GCC repair tool patch:',
        title_1_content_4: '(Download the patch of the corresponding GCC version)',
        title_2: '2. Apply the GCC patch',
        title_2_content_1: 'If "patch" command not found" is displayed, install the following first:',
        title_2_content_2: 'Debian OSs:',
        title_2_content_3: 'Red Hat OSs:',
        title_3: '3. Compile GCC',
        title_3_content_1: 'For details, see the official GCC documents. \
        The patch applied does not affect the GCC compilation dependencies and compilation process. \
        For any GCC compilation problems, visit the',
        title_3_content_2: 'GNU community',
      },
      use: {
        title: 'Procedure',
        title_1: 'Step 1 Set the optimization level of the memory consistency repair componen',
        title_1_content_1: 'You can set this environment variable to specify the level for repairing the memory \
        consistency. If you do not set this environment variable, the repair tool does not take effect.',
        title_1_content_2: '0: disables the optimization policy. This setting causes the greatest performance loss.',
        title_1_content_3: '1: uses the most secure repair policy. This setting compromises performance.',
        title_1_content_4: '2: applies component optimization rules.',
        title_2: 'Step 2 (Optional) Define the source code to be automatically fixed',
        title_2_subTitle: '1. Specify the source code to be automatically fixed by file or function in an allowlist. \
        Only the content in the allowlist can be fixed.',
        link: 'View More',
        title_2_content_1: ' The allowlist must comply with the following rules: ',
        detailList1: ['a) The file list must start with "files":. Each file occupies one line.', 'b) \
        Only absolute paths are allowed for files.', 'c) Only C, C++, and Fortran files are supported. \
        Assembly files are not supported.', 'd) The function list must start with "functions":. \
        Each function occupies a line.', 'e) Common C/C++ functions are supported. Templates or functions with the \
        abi_tag attribute are not supported.'],
        title_2_content_2: '2. Set the allowlist path',
        detail2: 'Set environment variables to specify the path of the allowlist. By default, the path is not set.',
        title_2_content_3: '3. Example: ',
        title_3: 'Step 3 Compile the software',
        title_3_content_1: 'You can compile the software. The compilation process remains unchanged. \
        (Remove the -pipe compilation option if it is used in the original compilation. \
          This does not affect the original compilation result.)'
      }
    }
  },
  about_more: {
    about_more_btn: 'More',
    title: 'Obtain More Operating Systems',
    about_more_step1: '1. Supported OSs',
    about_more_step2: '2. If the target OS is not in the compatibility list, \
    log in to the Kunpeng community to download the latest',
    about_more_step4: '4. After the upgrade, return to the task creation page to check the OS list.',
    about_more_step4_desc1: 'If the target OS is in the list, select it.',
  },
  period: '.',
  commonUploadSameFile: 'Upload failed: A file or folder with the same name is being scanned.'
};
