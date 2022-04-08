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
  common_term_sign_left: '(',
  common_term_sign_left_space: ' (',
  common_term_sign_right: ')',
  common_term_sign_colon: ': ',
  common_term_sign_quotation_left: '"',
  common_term_sign_quotation_right: '"',
  common_term_sign_question: '?',
  common_term_pro_name: 'Kunpeng Hyper Tuner',
  common_term_welcome_tip: 'Analyzes system performance and helps you perform performance tuning.',
  common_term_welcometo: 'Welcome to use',
  common_term_login_name: 'User Name',
  common_term_login_password: 'Password',
  common_term_login_btn: 'Log In',
  common_weakPwd_tip: 'The current password is weak and should be changed.',
  common_term_login_error_info: ['User name cannot be null.', 'Password cannot be null.'],
  common_term_copyright: 'Copyright © Huawei Technologies Co., Ltd. year. All rights reserved.',

  common_term_user_info: ['User Management', 'Operation Logs', 'Change Password', 'Log Out', 'Run Logs'],
  common_term_lang_info: ['简体中文', 'English'],
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
    managerPwd: 'Admin Password'
  },
  common_term_operate: 'Operation',
  common_term_operate_del: 'Delete',
  common_term_operate_reset: 'Reset Password',
  common_term_operate_ok: 'OK',
  common_term_operate_cancel: 'Cancel',
  common_term_operate_close: 'Close',
  common_term_delete_content: 'All data related to the project will be deleted. \
  Exercise caution when performing this operation.',
  common_term_delete_title: 'Are you sure you want to delete this project?',
  common_term_log_user: 'User Name',
  common_term_log_ip: 'IP Address',
  common_term_log_event: 'Event',
  common_term_log_result: 'Result',
  common_term_log_time: 'Time',
  common_term_log_Detail: 'Details',
  common_term_source_path: 'Source Code Path',
  common_term_operate_add_pro: 'New Project',
  common_term_operate_edit: 'Edit',
  common_term_projiect_name: 'Project Name:',
  common_term_projiect_name_tip: 'The project name is a string of 6 to 32 characters, allowing letters, digits,\
   periods (.), and underscores (_). It must start with a letter.',
  common_term_operate_search: 'Please enter a keyword',
  common_term_projiect_task: '',
  common_term_projiect_task_system: 'Systems',
  common_term_projiect_task_process: 'Processes',
  common_term_projiect_function: 'Functions',
  common_term_projiect_task_function: 'Function Analysis Tasks',
  common_term_user_changePwd: 'Change The Original Passowrd',
  common_term_projiect_view_more: 'More',
  common_term_task_new: 'New Analysis Task',
  common_term_task_c: 'C/C++ Program',
  common_term_task_java: 'Java Mixed-Mode',
  common_term_task_name: 'Task Name',
  common_term_task_type: 'Task Type',
  common_term_task_status: 'Status',
  common_term_task_time: 'Time Used (s)',
  common_term_task_analysis_type: 'Analysis Type',
  common_term_task_start_time: 'Created',
  common_term_task_run: 'Start',
  common_term_task_stop: 'Stop',
  common_term_task_nodata: 'No Data',
  common_term_task_new_c: 'New C/C++ Program Analysis',
  common_term_task_new_sys: 'New System Analysis ',
  common_term_task_new_java: 'New Java Program Analysis',
  common_term_task_edit_c: 'Edit C/C++ Program Analysis',
  common_term_task_edit_java: 'Edit Java Program Analysis',
  common_term_task_start_now: 'Start Now',
  common_term_task_type_launch: 'Starts the application as data collection begins. The data Sampling \
  duration is determined by the execution time of the application. This option is recommended for applications \
  with short running time.',
  common_term_task_type_attach: 'Collects the performance data of a process in running in real time. This option\
   is recommended for applications or data collection that takes a long period of time.',
  common_term_task_type_profile: 'Collects data of the entire system regardless of running application types. \
  The data Sampling duration is determined by configuration parameters. This option is recommended for scenarios \
  with multiple types of services and subprocesses.',
  common_term_task_start_path: 'Same as the Application Path',
  common_term_task_start_custerm: 'Customize',
  common_term_task_start_high_precision: 'High Precision',
  common_term_task_crate_path: 'Application',
  common_term_task_crate_parameters: 'Application Parameters',
  common_term_task_crate_work_director: 'Working Directory',
  common_term_task_crate_interval_ms: 'CPU Sampling Interval',
  common_term_task_crate_ms: 'ms',
  common_term_task_crate_us: 'us',
  common_term_task_crate_mask: 'CPU Mask',
  common_term_task_crate_bs_path: 'Binary/Symbol File Path',
  common_term_task_crate_c_path: 'C/C++ Source File Path',
  common_term_task_crate_java_path: '	Java Source File Path',
  common_term_task_crate_duration: 'Sampling Duration (s)',
  common_term_task_crate_pid: 'PID',
  common_term_task_crate_pid_tid: 'PID/TID',
  common_term_task_tab_congration: 'Configuration',
  common_term_task_tab_log: 'Collection Logs',
  common_term_task_tab_summary: 'Summary',
  common_term_task_tab_function: 'Function',
  common_term_task_tab_graph: 'Flame Graph',
  common_term_task_tab_log_basic: 'Collection Process',
  common_term_task_tab_log_data: 'Data Analysis',
  common_term_task_tab_summary_statistics: 'Statistics',
  common_term_task_tab_summary_launch_time: 'Execution Time (s)',
  common_term_task_tab_summary_other_time: 'Data Collection Time (s)',
  common_term_task_tab_summary_cycles: 'Clock Cycles',
  common_term_task_tab_summary_instructions: 'Instructions',
  common_term_task_tab_summary_ipc: 'IPC',
  common_term_task_tab_summary_info: 'Collection and Platform Info',
  common_term_task_tab_summary_system: 'Operating System',
  common_term_task_tab_summary_name: 'Host Name',
  common_term_task_tab_summary_size: 'Collected Data Size',
  common_term_task_tab_summary_start: 'Collection Start Time',
  common_term_task_tab_summary_end: 'Collection End Time',
  common_term_task_tab_summary_top10: 'Top 10 Hotspots',
  common_term_task_tab_summary_function: 'Function',
  common_term_task_tab_summary_module: 'Module',
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
  common_term_admin_change_pwd: 'Change Password',
  common_term_admin_log_out: 'Log Out',
  common_term_admin_user_normal: 'User',
  common_term_admin_user_guest: 'Guest',
  common_term_admin_user_create: 'New',
  common_term_admin_user_create_title: 'New User',
  common_term_admin_user_edit_user: 'Reset Password',
  common_term_admin_user_name: 'Name',
  common_term_admin_user_role: 'Role',
  common_term_admin_user_edit: 'Reset Password',
  common_term_admin_user_delete_title: 'Delete User',
  common_term_admin_user_edit_title: 'Are you sure you want to edit?',
  common_term_admin_user_add_title: 'Are you sure you want to create?',
  common_term_valition_rule2: 'The password must be a string of 8 to 32 characters that contains at least two \
  of the following character types: uppercase letters, lowercase letters, digits, and special characters \
  (`~!@#$%^&*()-_=+\\|[{}];:\'", <.>/?). Spaces are not allowed.',
  common_term_admin_user_delete_detail: 'After delete the user, all historical data related to the user will \
  be deleted. Exercise caution when performing this operation.',
  common_term_delete_content_analysis: 'Deleting the record will delete historical data related to the import/export \
  task. Are you sure you want to delete the record?',
  common_term_delete_title_analysis: 'Are you sure you want to delete this task?',
  common_term_firstlogin_tit: 'Set the administrator password upon your first login.',
  common_term_max_user_num: 'Maximum Number of Online Common Users:',
  common_term_no_samepwd: 'The passwords do not match.',
  common_term_log_usernum_change: 'Are you sure you want to modify the current settings?',
  common_term_login_name2: 'Administrator :',
  common_term_login_password2: 'Password :',
  common_term_password_check: 'Enter the administrator password.',
  common_term_return: 'Back',
  common_term_admin_sys_log: 'System Profiler Logs',
  common_term_admin_java_log: 'Java Profiler Logs',
  common_term_login_timeout: 'Login timed out. Please try again.',
  feedback: 'Feedback',
  log: 'Logs',
  sysSetting: 'System Settings',
  webCert: 'Web Server Certificates',
  downLoadLog: 'Download',
  downLoadLogTip: 'The system displays only the operation logs of the last 30 days \
  and a maximum of 2000 operation logs.',
  adminDownLoadLogTip: 'A maximum of 100,000 operation logs (within recent 30 days) are saved',
  javaLog: 'Java Profiler Logs',
  sysLog: 'System Profiler Logs',
  commonLog: 'Common Logs',
  commonOperateLog: 'Common Operation Logs',
  status_Created: 'Created',
  status_Waiting: 'Waiting',
  status_Sampling: 'Sampling',
  status_Analyzing: 'Analyzing',
  status_Aborted: 'Aborted',
  status_Failed: 'Failed',
  status_Completed: 'Completed',
  passwordDic: 'Weak Password Dictionary',
  weakPasswordTip: 'For security purposes, do not use passwords in the weak password dictionary. Otherwise, you are \
  required to reset the password.',
  weakPassword: {
    pwd_rule: 'The weak password must contain at least two types of the following characters: uppercase letters, \
    lowercase letters, digits, and special characters (`~!@#$%^&*()-_=+\\|[{}];:\'",<.>/?). \
    The length ranges from 8 to 32 characters.',
    addWeakPwd: 'Add',
    addWeakPwdTitle: 'Add Weak Password',
    WeakPwd: 'Weak Password',
    searchWeakPwd: 'Please enter a weak password',
    deleWeakPwd: 'Delete Weak Password',
    confirmdele: 'Are you sure you want to delete the weak password '
  },
  operationLog: { // 公共日志
    workingLog: 'Run Logs',
    logFileName: 'Log File Name',
    operation: 'Operation',
    size: 'Size',
    download: 'Download',
    sureDownload: 'Are you sure you want to download the following run logs?',
    userManageLog: 'User management run log',
  },
  tip_msg: {
    hyper_tuner_in_ie: 'Some functions of the tool are not compatible with Internet Explorer. Chrome is recommended.',
    logged_in: 'User has logged in.',
    log_error: 'Failed to obtain the log information.',
    info_error: 'Failed to obtain the information.',
    conf_error: 'Failed to obtain configuration information.',
    opr_error: 'Operation failed. ',
    task_list_error: 'Failed to obtain the task list.',
    task_start_warn: 'A task is being executed. Try again later.',
    task_start_error: 'Failed to start the collection task.',
    task_create_error: 'Failed to create the task.',
    task_edit_error: 'Failed to edit the task.',
    task_disk_error: 'Insufficient drive space.',
    task_stop_error: 'Failed to stop the task.',
    task_del_error: 'Failed to delete the task.',
    total_results_error: 'Failed to obtain the overall statistics.',
    plat_form_error: 'Failed to obtain the platform and collection information.',
    top_function_error: 'Failed to obtain the top hotspot function.',
    log_timeout: 'Logged out or timed out.',
    log_ok: 'Login successful.',
    edite_ok: 'Modified successfully.',
    edite_error: 'Modification failed.',
    common_term_task_crate_mask_tip: 'Enter one or more CPU core IDs, for example, 2-5, 2,3,4,5, or 2,3,4-5.',
    delete_ok: 'Deleted successfully.',
    delete_error: 'Failed to delete.',
    add_ok: 'Added successfully.',
    add_error: 'Failed to add.',
    get_flame_error: 'Failed to obtain the flame graph.',
    reset_pwd_error_old: 'Failed to change the password. Please enter the correct old password.',
    reset_pwd_error_repeat: 'Failed to change the password. New password must be the different with old password.',
    peoject_exist: 'The project name already exists.',
    common_term_task_crate_c_bs_tip: 'If the binary or symbol file is stored in another directory, for \
    example, /symbol, the subdirectory of the directory must be the same as the absolute path of the target \
    application. For example, if the application to be analyzed is in the /home directory, the source file must \
    be saved in the /symbol/home directory.',
    common_term_task_crate_c_source_tip: 'If the C/C++ source file is stored in another directory, for \
    example, /Source, the subdirectory of the directory must be the same as the absolute path of the \
    target application. For example, if the application to be analyzed is in the /home directory, \
    the source file must be saved in the /Source/home directory.',
    common_term_task_crate_j_source_tip: 'If the Java source file is stored in another directory, \
    for example, /Source, the subdirectory of the directory must be the same as the absolute path of \
    the target application. For example, if the application to be analyzed is in the /home directory, \
    the source file must be saved in the /Source/home directory.',
    system_setting_input_empty_judge: 'The value cannot be empty. ',
    system_setting_input_vaild_value: 'Enter a valid integer.',
    system_setting_input_only_digits: 'Only a positive integer is allowed.',
    system_setting_input_same_value: 'The new value cannot be the same as the current one.',
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
  system_config: {
    common_config: 'Common Settings',
    system_tuning: 'System Profiler Settings',
    user_count: 'Maximum Number of Online Common Users',
    session_timeout: 'Session Timeout Period (min)',
    web_deadline: 'Web Service Certificate Expiration Alarm Threshold (days)',
    agent_deadline: 'Agent Service Certificate Expiration Alarm Threshold (days)',
    operation_log_period: 'Operation Log Retention Period (days)',
    run_log_level: 'Run Log Level',
    user_man_run_log_level: 'Run Log Level',
    change_config: 'Change',
    password_out_date: 'Password Validity Period (days)',
  },
  validata: {
    name_rule: 'The user name contains 6–32 characters, including letters, digits, hyphens (-), and underscores(_),\
    and must start with a letter.',
    name_req: 'This user name cannot be left blank.',
    task_name_rule: 'The task name is a string of 6 to 32 characters, allowing letters, digits, periods (.), and\
    underscores (_). It must start with a letter.',
    oldPwd_rule: 'Please enter the password.',
    pwd_rule: 'The password must be a string of 8 to 32 characters that contains at least two of the following\
    character types: uppercase letters, lowercase letters, digits, and special characters \
    (`~!@#$%^&*()-_=+\\|[{}];:\'", <.>/?). Spaces are not allowed.',
    pwd_rule2: 'Cannot be the same as the user name or the user name in reverse order.',
    pwd_rule4: 'New password must be the different with old password.',
    pwd_rule3: 'The new password cannot be the old password in reverse order.',
    pwd_conf: 'The two passwords do not match.',
    req: 'This password cannot be left blank.'
  },

  error_inertval: 'Internal server error.',
  bad_request: 'Request error.',
  first_login: 'Login successful. For security purposes, change the initial password upon your first login.',
  pwd_guoqi: 'The password has expired. For ensure  account security, change your password in time.',
  login_error: 'The user name or password is incorrect. You can try more times.',
  login_lock: 'Account locked. Please try again 10 minutes later.',
  login_up: 'Login failed. The number of current login users has reached the upper limit. ',
  login_10: 'The number of sessions of the current user has reached the upper limit (10). Wait and try again later.',
  reset_pwd_ok: 'Password changed successfully. Please log in using the new password.',
  ifLogout: 'Are you sure you want to exit the current user?',
  logout: 'Log Out',
  logout_ok: 'You have logged out of the system.',
  logout_error: 'System error.',
  selectPlace: '-Select-',
  loading: 'LOADING...',
  functiondetail_no_get_data: 'No data returned.',
  function_error: 'Failed to obtain function information.',
  secret_title: 'Are you sure you want to create the analysis task?',
  secret_count: 'Your running data will be collected and associated with the source code for performance\
 analysis and optimization. The collection will not affect software running or retain your source code.',
  system_busy: 'The system is busy. Try again later.',
  application_not_exist: 'This application does not exist.',
  application_not_access: 'You do not have the access permission.',
  cpu_mask_range: 'Enter a value from 0 to ',
  cpu_mask_format: 'Incorrect format. For example, 2,3,4-5.',
  invalid_directory: 'Invalid directory.',
  invalid_directory_common: 'Invalid directory.',
  pid_not_exist: 'The PID or TID does not exist.',
  task_name: 'Task name',
  invalid_application_permisson: 'The current user does not have the permission to access the application.',
  invalid_directory_permisson: 'The current user does not have the permission to access the path.',
  sys: {
    typeAnalysisName: 'System performance panorama analysis',
    tab_name: 'System Analysis Tasks',
    creat_btn_title: 'Performance Panorama Analysis',
    creat_modal_title: 'New System Performance Panorama Analysis Task',
    edit_modal_title: 'Edit System Performance Panorama Analysis Task',
    interval: 'Sampling Interval (s)',
    duration: 'Sampling Duration (s)',
    type: 'Sampling Type',
    cpu: 'CPU',
    mem: 'Memory',
    disk: 'Drive I/O',
    net: 'Network I/O',
    time: 'The sampling duration is up tp 300 seconds',
    douhao: ', ',
    tabs: {
      mem: 'Memory',
      disk: 'Disk I/O',
      net: 'Network I/O'
    },
    titles: {
      cpuUsage: 'CPU Usage',
      avgLoad: 'Average Load',
      mem: 'Memory',
      memUsage: 'Memory Usage',
      memPag: 'Page Statistics',
      memSwap: 'Switch Statistics',
      disk: 'Disk I/O',
      diskBlock: 'Block Device Usage',
      net: 'Network I/O',
      netOk: 'Network Device Statistics',
      netError: 'Network Device Fault Statistics'
    },
    ref: 'Reference Value',
    sug: 'Optimization Suggestion',
    selCpu: 'CPU Core',
    selBlock: 'Block Device',
    selNet: 'Network Port',
    selZhibiao: 'Indicator',
    tip: {
      CPU: 'CPU core (all indicates the entire CPU).',
      '%user': 'Percentage of CPU time occupied when the system is running in user mode.',
      '%nice': 'Percentage of CPU time occupied by processes whose priorities have been changed in the user mode.',
      '%sys': 'Percentage of CPU time occupied when the system is running in kernel mode. This indicator\
     does not include the time spent on service hardware and software interrupts.',
      '%iowait': 'Percentage of CPU time during which the CPU is idle and waiting for disk I/O operations.',
      '%irq': 'Percentage of CPU time spent on service hardware interrupts.',
      '%soft': 'Percentage of CPU time spent on service software interrupts.',
      '%idle': 'Percentage of CPU time during which the CPU is idle and the system has no unfinished disk I/O request.',
      'runq-sz': 'Length of the running queue, that is, the number of tasks to be run.',
      'rung-sz': 'Length of the running queue, that is, the number of tasks to be run.',
      'plist-sz': 'Number of tasks in the task list.',
      'ldavg-1': 'Average system load in the last minute. The value is equal to the average quantity of running\
     or runnable tasks (in R state) plus the average quantity of uninterruptable \
     sleep tasks (in D state) in a specified period.',
      'ldavg-5': 'Average system load in the past 5 minutes.',
      'ldavg-15': 'Average system load in the last 15 minutes.',
      blocked: 'Number of blocked tasks waiting for I/O operations.',
      kbmemfree: 'Available free memory size, in KB. The buffer and cache are not included.',
      kbavail: 'Available memory size, in KB. The buffer and cache are included.',
      kbmemused: 'Used memory size, in KB. The buffer and cache are included.',
      '%memused': 'Percentage of used memory, that is, kbmemused/(kbmemused+kbmemfree).',
      kbbuffers: 'Size of the memory used as the buffer by the kernel, in KB.',
      kbcached: 'Size of the memory used as the cache by the kernel, in KB.',
      kbactive: 'Active memory size, in KB. (The memory that has been used recently \
      is not recycled unless absolutely necessary.)',
      kbinact: 'Inactive memory size, in KB. (The memory is seldom used recently and meets the recycling conditions.)',
      kbdirty: 'Size of the memory where data is to be written back to the disks, in KB.',
      'pgpgin/s': 'Data swapped from disks or the SWAP partition to the memory per second (KB/s).',
      'pgpgout/s': 'Data swapped from the memory to disks to the SWAP partition per second (KB/s).',
      'fault/s': 'Number of page faults (major page faults+minor page faults) generated in the system per second.\
     This parameter is not the I/O page fault number because certain page faults can be resolved with I/O operations.',
      'majflt/s': 'Number of major page faults generated per second. A memory page needs to be loaded from disks.',
      'pgscank/s': 'Number of pages scanned by the kswapd daemon per second.',
      'pgscand/s': 'Number of pages scanned per second.',

      '%vmeff': 'Measurement indicator of the paging recycling efficiency. If the value is close to 100%, almost\
     every page can be obtained at the bottom of the inactive list. \
     If the value is too low (for example, less than 30%),\
      the virtual memory has some problems. If no page is scanned within the interval, the value is 0.',
      'pswpin/s': 'Total number of inward swap partition pages per second.',
      'pswpout/s': 'Total number of outward swap partition pages per second.',
      tps: 'Total number of I/O transmissions per second. A transmission is an I/O request to a physical device.\
     Multiple logical requests sent to a device can be combined into a single I/O request. \
     The transfer size is uncertain.',
      'rd_sec/s': 'Number of sectors read from the device per second The sector size is 512 bytes.',
      'wr_sec/s': 'Number of sectors written to the device per second. The sector size is 512 bytes.',
      'avgrq-sz': 'Average data size of each disk I/O operation (unit: sector).',
      'avgqu-sz': 'Average length of disk request queues.',
      'rkB/s': 'Number of sectors read from the device per second The sector size is 512 bytes.',
      'wkB/s': 'Number of sectors written to the device per second. The sector size is 512 bytes.',
      'areq-sz': 'Average data size of each disk I/O operation (unit: sector).',
      'aqu-sz': 'Average length of disk request queues.',
      await: 'Average time consumed by each request (from the time when the request is sent to the time when the\
       request is processed), including the waiting time of request in a queue. The value is equal to seek time\
        plus queue time plus service time. The unit is millisecond. ',
      svctm: 'Average time for the system to process each request, in milliseconds. \
    The time consumed in the request queue is not included.',
      '%util': 'Percentage of CPU time consumed when an I/O request is sent to a device (bandwidth usage of a device).\
     When the value is close to 100%, the disk read/write performance is almost saturated.',
      'rxpck/s': 'Total number of packets received per second.',
      'txpck/s': 'Total number of packets transmitted per second.',
      'rxkB/s': 'Total number of data received per second, in KB.',
      'txkB/s': 'Total number of data transmitted per second, in KB.',
      'rxerr/s': 'Number of damaged packets received per second.',
      'txerr/s': 'Total number of errors per second when packets are sent.',
      'coll/s': 'Number of collisions per second when packets are sent.',
      'rxdrop/s': 'Number of packets discarded by the receiving end of a NIC per second when the Linux buffer is full.',
      'txdrop/s': 'Number of network packets discarded by the sending end of a \
    NIC per second when the Linux buffer is full.',
      'txcarr/s': 'Number of carrier errors per second when data packets are sent.',
      'rxfram/s': 'Number of frame synchronization errors per second when data packets are received.',
      'rxfifo/s': 'Number of FIFO overflow errors per second when data packets are received.',
      'txfifo/s': 'Number of FIFO overflow errors per second when data packets are sent.',
      DEV: 'Block device name',
      IFACE: 'Network port name.'


    }
  },
  sys_cof: {
    sum: {

      cpu: 'CPUs',
      mem: 'Memory',
      disk: 'Drives',
      network: 'NIs',
      pcie: 'PCIe Cards',
      raid: 'RAID Controller Cards',
      raid_level: 'RAID Level',
      normal_msg: 'Basic Info',
      storage_msg: ' Storage Info',
      storage_title: 'storage_title',
      file_system_msg: 'File System Info',
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
        total_mem: 'Total Memory (MB)',
        free_mem: 'Idle Memory (MB)',
        numa_node_dis: 'NUMA Node Distance',
        numa_zero: 0,
        numa_one: 1,
        numa_two: 2,
        numa_three: 3,
      },
      mem_info: {
        mem_null: 'Empty',
        normal_msg: 'Basic Info',
        total_mem: 'Total Memory',
        mem_slot: 'Slots',
        mem_list: 'DIMM List',
        slot_site: 'Slot',
        mem_cap: 'Capacity (GB)',
        max_t: ' Max. Rate (MT/s)',
        match_t: 'Configuration Rate (MT/s)',
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
      },
      network_info: {
        irq_aggre_title: 'Interrupt Aggregation',
        offload_title: 'offload',
        queue_title: 'Queue',
        numa_core_title: 'Interrupt NUMA Core Pinning',
        network_name: 'NIC Name',
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
          rx_checksumming: 'Checksum of an RX packet',
          tx_checksumming: 'Checksum of a TX packet.',
          scatter_gather: 'Specifies whether to enable scatter/gather.',
          TSO: 'When a system needs to send a large segment of data over the network, the computer needs to split the\
       segment into multiple shorter segments so that the data can pass through all network devices on the network.\
        This process is called segmentation. TCP Segmentation Offload (TSO), also named Large Segment Offload (LSO),\
         enables the NIC to perform TCP segmentation calculation without involving the protocol stack. This reduces\
          the CPU calculation workload and interruption frequency, and relieves the CPU load. If TSO is enabled for\
           the NIC, rx-checksumming, tx-checksumming, and scatter-gather must also be enabled.',
          UFO: 'UDP Fragmentation Offload (UFO) is a technology that offloads the fragmentation of UDP packets from the\
       CPU to NICs. You are advised to enable this function if the NIC hardware supports it.',
          LRO: 'Large Receive Offload (LRO) aggregates multiple received TCP data packets into a large data packet and\
       transmits it to the network protocol stack for processing. This reduces the processing overhead generated by\
        the upper-layer protocol stack and improves the system capability of receiving TCP data packets.',
          GSO: 'Generic Segmentation Offload (GSO) delays data fragmentation until the data is sent to the NIC driver.\
       In this case, the system checks whether the NIC supports fragmentation (such as TSO and UFO). If yes, the data\
        is directly sent to the NIC. If no, the data is fragmented before being sent to the NIC. In this way, a large\
         data packet needs to go through a protocol stack only once, instead of being divided into several data packets\
          for separate going, thereby improving efficiency.',
          GRO: 'Generic Receive Offload (GRO)\'s basic idea is similar to that of LRO. It overcomes some disadvantages of\
       LRO and is more common. The subsequent drivers use the GRO API instead of the LRO API.',

        },

        numa_core: {
          inter_id: 'Interrupt ID',
          inter_info: ' Interrupt NUMA Core Pinning Info',
          queue_send: 'TX Queue Core Binding Info',
          queue_receive: 'RX Queue Core Binding Info'
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
      },
      storage_msg_info: {
        storange_name: 'Device Name',
        storage_file: 'Prefetch Size of Drive Files (byte)',
        storage_file_suggest: '硬盘文件预读大小（字节）',
        storage_io: 'Drive I/O Scheduling Mechanism',
        storage_io_suggest: 'Disk I/O scheduling mechanismDisk I/O scheduling mechanism'
      },
      file_info: {
        file_info_title: 'File Systems',
        file_name: 'Partition',
        file_type: 'File System Type',
        file_type_suggest: 'File System Type,',
        file_dot: 'Mount Point',
        file_dot_suggest: '挂载点',
        file_msg: 'Mount Information',
      },
      virtual_info: {
        virtual_os: 'VM Libvirt Version',
        virtual_config: 'KVM VM Configuration',
        virtual_docker: 'Docker Version'
      }

    },
    selct_title: 'Configuration Panorama Analysis',
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
  sys_res: {
    sum: {
      statistics: 'Statistics',
      collection: 'Collection & Platform Info',
      process: 'Process / Thread Switching',
      cycles: 'Cycles',
      elapsed: 'Elapsed Time (s)',
      instrutions: 'Instructions',
      ipc: 'IPC',
      os: 'OS',
      computer_name: 'Computer Name',
      result_size: 'Result Size (MB)',
      collection_start: 'Collection Start Time',
      collection_end: 'Collection End Time',
      no: 'NO.',
      task: 'Task',
      switches: 'Switchovers',
      average_delay: 'Average Scheduling Delay (ms)',
      max_delay: 'Max. Scheduling Delay (ms)',
      max_delay_at: 'Max. Delay (s)',
    },
    selct_title: 'Resource Scheduling Analysis',
    analysisName: 'System resource scheduling analysis',
    create_title: 'New System Resource Scheduling Analysis Task',
    edit_title: 'Edit System Resource Scheduling Analysis Task',
    tab: {
      numa: 'NUMA Node Switch',
      cpu: 'CPU Scheduling',
      pro: 'Process/Thread Scheduling'
    },
    selectCPU: 'Select CPU Core',
    selectTime: 'Select Time',
    selectTID: 'Select TID',
    numaLegend: 'NUMA Node Configuration Info',
    numaSwitch: 'NNUMA Node Switchover',
    numaColumn: {
      no: 'PID',
      task: 'Task',
      swtich: 'Switchovers'
    },
    swtichDetail: 'Switchover Details',
    conversion: 'Switchover Path',
    frequency: 'Switches'
  },
  process: {
    tabName: 'Process Analysis Tasks',
    sum: {
      pid: 'Process ID/Thread ID',
      command: 'Name of the command corresponding to the current task.',
      cpu: {
        usr: 'CPU usage of a task in the user space.',
        sys: 'CPU usage of a task in the kernel space.',
        wait: 'CPU usage of the task in the I/O waiting state.',
        cpu: 'CPU usage of a task.',

      },
      mem: {
        min: 'Number of page fault occurrences per second, that is, number of page fault occurrences generated when a\
     virtual memory address is mapped to a physical memory address, and no page needs to be loaded from a hard disk.',
        maj: 'Number of main page faults per second. When the virtual memory address is mapped to the physical memory\
     address, the corresponding page is in the swap memory. Such page faults are major page faults, which are generated\
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
        cswch: 'Indicates the number of context changes per second in the active task. Generally, the context changes\
     are caused because the task cannot obtain required resources. For example, when system resources such as I/O\
      and memory resources are insufficient, a proactive task context switchover occurs.',
        nvcswch: 'Number of context switch times per second of a passive task. Generally, a task is forcibly scheduled\
     by the system because the time slice is due or the process is preempted by a process with a higher priority.\
      As a result, context switch occurs. For example, when a large number of processes are contending for CPU,\
       passive task context switching is likely to occur.',
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
    context: 'Context Switch',
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
    disk: 'Drive I/O',
    pid: 'PID',
    tread: 'Thread Collection',
    trace: 'System call tracing',
    trace_tip: 'System call tracing is not recommended for production environments because it greatly reduces\
   the system performance when some applications are frequently called.',
    disable: 'disable',
    enable: 'enable',
    selectPid: 'Select PID',
    intervalTip: 'The sampling interval must be less than or equal to half of the sampling duration.'

  },
  homeInfo: 'Perform profiling and performance tuning easily and efficiently.',
  sysTitle: 'System Profiler',
  javaTitle: 'Java Profiler',
  memTitle: 'System Diagnosis',
  tuninghelperTitle: 'Tuning Assistant',
  sysHelp: 'System Profiler Online Help',
  javaHelp: 'Java Profiler Online Help',
  memHelp: 'System Diagnostics Online Help',
  tuningHelp: 'Tuning Assistant Online Help',
  login: 'Login',
  softwareScreenshot: 'Software screenshot',
  aboutMsg: {
    about: 'About',
    name: 'Kunpeng Hyper Tuner',
    version: 'Version ',
    time: 'Release Date：',
    copyRight: 'Copyright © Huawei Technologies Co., Ltd. year. All rights reserved.'
  },
  certificate: {
    valid: 'Valid',
    nearFailure: 'About to expire',
    failure: 'Expired',
    notice: 'Information',
    webWarnNotice1: 'Your web server certificate has expired. Please replace the certificate.',
    webWarnNotice2: 'Your web server certificate is about to expire on ${time}. Please replace the certificate in time.',
    name: 'Certificate Name',
    validTime: 'Certificate Expiration Time',
    status: 'Status',
    createCsr: 'Generate CSR File\xa0',
    leadCsr: 'Import Certificate',
    changeCipher: 'Update Working Key',
    resetServer: 'Restart Server',
    common_term_webcert_restart_tip: 'The restart takes about 5 to 10 seconds. After the restart, \
  you can perform operations normally.',
    common_term_webcert_import_success: 'Certificate imported successfully , Take effect after service restart',
    country_Verification_Tips: 'Enter a two-character country code.',
    common_city_province_Verification_Tips: 'Incorrect input format. Only letters, digits, underscores (_), \
  hyphens (-), dots (.), and spaces are allowed. The maximum length is 128 characters.',
    common_Verification_Tips: 'Incorrect input format. Only letters, digits, underscores (_), \
  hyphens (-), dots (.), and spaces are allowed. The maximum length is 64 characters.',
    title: 'Web Server Certificates',
    common_term_webcert_import_pre_tip: 'Do not generate a new CSR file before importing the web server certificate.',
    country: 'Country',
    province: 'Province',
    city: 'City',
    organization: 'Company',
    department: 'Department',
    commonName: 'Common Name',
    csrFile: 'Certificate File',
    lead: 'Import',
    common_term_webcert_import_tip: 'Make sure that the imported certificate file is generated by the latest CSR file',
  },
  tuninghelperDetail: 'Quickly optimize system performance.',
  sysDetail: 'Comprehensive, powerful, and professional scenario-based analysis',
  javaDetail: 'Java application performance tuning',
  diagnoseDetail: 'Diagnose system exceptions and evaluate system performance.',
  basic_title: "Basic Analysis",
  top_title: "Advanced Analysis",
  SysPertitle_title: "The System Profiler analyzes system performance in multiple scenarios, locates system performance bottlenecks and hotspot functions, and provides multi-dimensional optimization suggestions based on performance data of Kunpeng microarchitecture, hardware, operating system, application processes/threads, and functions.",
  JavaPerf_title: "Java Profiler is a performance analysis and optimization tool for Java programs running on Kunpeng-based servers. It can graphically display heap, thread, lock, and garbage collection information of Java programs, collect hotspot functions, locate program bottlenecks, and optimize programs.",
  MemPerf_title: "The system diagnosis tool analyzes system running indicators, identifies exceptions, such as memory leakage, memory overwriting, and network packet loss, and provides optimization suggestions. It also supports pressure test systems, such as network I/O, to evaluate the maximum performance of the system.",
  Tuninghelper_title: "The tuning assistant organizes and analyzes performance indicators, hotspot functions, and system configurations in a systematic manner to form a system resource consumption chain, instructs users to analyze performance bottlenecks, and provides optimization suggestions and operation guides to implement quick optimization.",
  common_advice_feedback: 'Advice Feedback',
  common_connect_fail: 'Connection Failed',
  common_connect_fail_reason: 'Network connection request fails. Try the following ways to provide suggestions:',
  common_connect_fail_reason1: '1.Check the network connection and click',
  common_connect_fail_reason2: 'again to provide suggestions.',
  common_connect_fail_reason3: '2.Scan the following QR code with your mobile phone to provide suggestions.',
};
