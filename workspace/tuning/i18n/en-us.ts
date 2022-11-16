export const I18N_US = {
  home_top_growth: 'Visit the Kunpeng community to get skills for new developer growth.',
  home_top_info: 'Visit the Kunpeng community to learn about Kunpeng DevKit.',
  home_top_info1: 'View details in the Kunpeng Hyper Tuner documents.',
  home_top_info2: 'Have any questions? Ask experts. ',
  common_term_valition_input: 'The value cannot contain Chinese characters, spaces, and the ' +
    'following special characters: ^ ` | ; & $ > < !.',
  common_term_filename: 'File Name',

  common_term_valition_rule1: 'The user name cannot be empty',
  common_term_no_password: 'The password cannot be empty',
  common_term_no_samepwd: 'The passwords do not match.',
  common_term_valition_rule3:
    'The user name contains 6 to 32 characters, including letters, digits, hyphens (-), \
        and underscores, and it must start with a letter.',
  common_term_valition_rule2: 'The new password cannot be the old password in reverse order.',
  common_term_valition_rule4: 'The compilation command must start with make, cmake, or go, for example, make xxx.',
  common_term_valition_rule5: 'The compile command parameter cannot contain Chinese \
    and the following special characters: < > | # ; & ` %.',
  common_term_valition_rule6: 'The compilation command must start with make or cmake, for example, make xxx.',
  common_term_required_tip: 'This parameter cannot be empty.',

  common_term_filename_tip: 'The value cannot be empty.',
  plugins_tuning_setting_label: 'Configuration',
  common_term_no: 'No',
  common_term_leave_tip2: 'If you leave this page, the data on the current page will be lost.',
  plugins_tuning_message: {
    workInfo: 'Insufficient workspace of the Profiler Advisor. Please delete some reports. ' +
      'Total workspace: {0} GB. Free workspace: {1} GB. Recommended free workspace: > 20% ({2} GB).',
    workWarn: 'The free workspace of the Profiler Advisor is less than 1 GB. The tool has stopped writing data. ' +
      'Please delete some reports immediately to release the workspace. ' +
      'Total workspace: {0} GB. Free workspace: {1} GB. Recommended free workspace: > 20% ({2} GB).',
    diskInfo: 'Insufficient drive space of the Profiler Advisor. Please release the drive space. ' +
      'Total drive space: {0} GB. Free drive space: {1} GB. Recommended free drive space: > 20% ({2} GB).',
    diskWarn: 'The free drive space of the Profiler Advisor is less than 1 GB. The tool has stopped writing data. ' +
      'Please release the drive space immediately. ' +
      'Total drive space: {0} GB. Free drive space: {1} GB. Recommended free drive space: > 20% ({2} GB).',
    workDiskError: 'The remaining drive space is less than 1 GB. \
          Please release the drive space and perform the next step.',
  },

  plugins_tuning_tip_softPackInstallPath: 'Enter the full path of the installed software, \
      for example: /home/pathname.',

  plugins_tuning_label_cFile_path: 'Path',

  plugins_tuning_message_beforeInstall: 'Before You Start ',
  plugins_tuning_message_beforeInstallDsc1: '1. If the yum/apt/zypper source of the OS is correctly configured \
    and the network connection is normal, the installation tool automatically downloads the required \
    software packages, such as Nginx, Django, python3, and GCC, from the Internet. \
    For details about how to configure the yum/apt/zypper source, see section "',
  plugins_tuning_message_beforeInstallDsc2: 'Configuring the yum/apt/zypper Source for the OS',
  plugins_tuning_message_beforeInstallDsc3: '" in the Kunpeng Porting Advisor User Guide.',
  plugins_tuning_message_beforeInstallDsc4: '2. This tool identifies your system status based on the \
    information you entered (such as the IP address, \
    port number, user name, and password) and implements one-click deployment. \
    The information you entered will not be used for other purposes or be transferred outside your server.',
  plugins_tuning_message_beforeInstallDsc5: '3. During the use of this tool, \
    you may need to download and install software dependencies, which may contain third-party software. \
    The third-party software is provided "As Is", and Huawei assumes no responsibility for risks \
    incurred by using the software.',
  plugins_tuning_message_arm_download_link: 'ARM installation package',
  plugins_tuning_message_x86_download_link: 'X86 installation package',
  plugins_tuning_message_beforeInstallOption: 'I have read the above information. ',

  plugins_tuning_message_beforeInstallCancel: 'Cancel',

  plugins_tuning_button_uninstallConfirm: 'Uninstall',
  plugins_tuning_button_upgradeConfirm: 'Upgrade',
  plugins_tuning_title_uninstalled: 'The tool is uninstalled successfully.',
  plugins_tuning_title_upgraded: 'The tool is upgraded successfully.',
  plugins_tuning_title_uninstallFailed: 'Failed to uninstall the tool.',
  plugins_tuning_title_upgradeFailed: 'Failed to upgrade the tool.',
  plugins_tuning_button_install: 'Click here to deploy',
  plugins_tuning_label_ip: 'IP Address',
  plugins_tuning_label_port: 'SSH Port',



  plugins_tuning_label_default_port: 'Default Port:{0}',

  plugins_cloudied_tuning_label_config: 'Configure the remote server address for installing porting advisor.',
  plugins_tuning_button_save: 'Save',
  plugins_tuning_button_modi: 'Modify',
  plugins_tuning_button_cancel: 'Cancel',
  plugins_common_message_installDt1: 'The install will complete automatically if the remote server is running a ',
  plugins_common_message_installDt2: 'compatible',
  plugins_common_message_installDt3: ' operating system and can access the Internet.',
  plugins_common_message_upgradeDt1: 'The upgrade will complete automatically if the remote server is running a ',
  plugins_common_message_upgradeDt2: 'compatible',
  plugins_common_message_upgradeDt3: ' operating system and can access the Internet.',
  plugins_common_message_uninstallDt: 'The uninstall will complete automatically \
      if the target server is running properly. ',
  plugins_common_title_installTs: 'Target server',
  plugins_tuning_title_installTc: 'Tool Configuration',
  plugins_tuning_label_installUser: 'OS User Name',
  plugins_tuning_label_installPwd: 'OS User Password',
  plugins_tuning_message_ipError: 'Enter a correct IP address.',
  plugins_tuning_message_portError: 'Enter a correct port number range.(1-65535)',

  plugins_tuning_button_installConfirm: 'Install',
  plugins_tuning_message_installingInfo: 'Deploy the tool as prompted. ',
  plugins_tuning_title_installed: 'Tool deployed successfully.',
  plugins_tuning_button_login: 'Log In',
  plugins_tuning_button_retry: 'Retry',
  plugins_tuning_button_install_failed_retry: 'Retry',
  plugins_tuning_title_installFailed: 'Failed to deploy the tool.',
  plugins_tuning_message_installFailedInfo: 'Perform operations as prompted.',
  plugins_tuning_message_install_failed: 'Rectify the fault based on the installation \
    failure causes provided on the {0}official website{1}.',
  plugins_tuning_message_uninstallingInfo: 'Uninstall the tool as prompted.',
  plugins_tuning_message_upgradingInfo: 'Upgrade the tool as prompted.',

  plugins_tuning_message_comm: 'Visit the Kunpeng community to learn about Kunpeng DevKit',

  plugins_common_button_term_operate_ok: 'OK',
  common_term_adminpwd_check: 'Enter the administrator password.',
  common_term_oldpwd_check: 'Enter the old password.',
  plugins_common_button_exit: 'Finished',
  common_term_valition_password:
    'It must contain 8 to 32 characters and at least two types of the following characters: uppercase letters, \
      lowercase letters, digits, and special characters (`~!@#$%^&*()-_=+\\|[{}];:\'",<.>/?), \
      and cannot contain spaces.',

  plugins_common_button_checkConn: 'Check Connection',
  plugins_common_tips_connOk: 'SSH connection check succeeded.',
  plugins_common_tips_connFail: 'The SSH connection check failed. Check whether the user name, password, \
      or private key is correct. A large number of retries also causes the check failure.',
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


  plugins_common_tips_uploadError: 'Failed to upload the script file to your server.',

  plugins_common_title_ipSelect: 'The tool is about to send a login request to IP address {0}.\
    This IP address is the web server address specified during the installation or modified after the installation.\
    Check whether the current address {1} is correct.',
  plugins_common_title_ipSelectUpgrade: 'The tool is about to send a login request to IP address {0}.\
    This IP address is the web server address specified during the installation or modified after the installation.\
    Check whether the current address {1} is correct.',
  plugins_common_tips_ipFault: 'Confirm the IP address {0} is correct',
  plugins_common_tips_ipSSH: 'Use the IP address {0} entered for SSH connection',
  plugins_common_tips_ipExtra: 'Set IP address',

  plugins_tuning_weakPassword: {
    pwd_rule: 'The weak password must contain at least two types of the following characters: \
        uppercase letters, lowercase letters, digits, and special characters (`~!@#$%^&*()-_=+\\|[{}];:\'",<.>/?). \
        The length ranges from 8 to 32 characters.Spaces are not allowed.',
  },

  plugins_tuning_weakCheck: {
    report_list_tip: 'Total Modifications',
    report_suggestion: 'Suggestion',
    common_term_cFile_suggestion_label: 'Number of Recommended Modifications',
  },

  period: '.',
  semicolon: '; ',
  plugins_tuning_apply_free_env_info: 'You can also apply for a free trial environment.',
  plugins_tuning_apply_free_env_link: 'Click here',
  plugins_tuning_free_trial_remote_environment: 'Apply For Trial Remote Laboratory',
  plugins_common_title_config: 'Configure Remote Server',
  plugins_common_label_config: 'Configure the remote server address for Hyper Tuner. \
    If you have not deployed the tool on the server,',
  plugins_common_button_install: 'click here to deploy',
  plugins_common_apply_free_env_info: 'You can also apply for a free trial environment.',
  plugins_common_apply_free_env_link: 'Click here',
  plugins_common_label_ip: 'IP Address',
  plugins_common_message_ipError: 'Enter a correct IP address.',
  plugins_common_label_configPort: 'HTTPS Port',
  plugins_common_placeholder_default_port: 'Default port: 8086',
  plugins_common_message_portError: 'Enter a correct port number range.(1024-65535)',
  plugins_tuning_title_upgradeDt: 'Upgrade Hyper Tuner',
  plugins_tuning_title_uninstallDt: 'Uninstall Hyper Tuner',
  plugins_tuning_title_installDt: 'Install Hyper Tuner',
  plugins_common_message_beforeInstall: 'Before You Start ',
  plugins_common_message_beforeInstallDsc4: '1. This tool identifies your system status based on the information \
    you entered \
    (such as the IP address, port number, user name, and password) and implements one-click deployment. \
    The information you entered will not be used for other purposes or be transferred outside your server.',
  plugins_common_message_beforeInstallDsc5: '2. During the use of this tool, you may need to download and \
    install software dependencies, \
    which may contain third-party software. The third-party software is provided "As Is", \
    and Huawei assumes no responsibility for risks incurred by using the software.',
  plugins_tuning_message_beforeInstallDsc6: '3. During the use of this tool, the tool may download \
    and install necessary software \
    packages and verification tools, which may contain software from Huawei website:',
  plugins_tuning_message_pg_download_link: 'Installation package',
  plugins_tuning_message_pg_vfc_tool_download_link: 'Verification tool',
  plugins_common_message_beforeInstallOption: 'I have read the above information. ',
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
  common_install_panel_title: 'Hyper Tuner - Deployment tool',
  plugins_tuning_configure_remote_server: 'Hyper Tuner – Configure Remote Server',
  common_term_no_label: 'No.',
  common_bc_suggestion_position: 'Code Location',
  common_term_name_label: 'File Name',
  common_term_name_label_1: 'File Name',

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
  plugins_common_message_connIssue1: '1. The IP address entered does not exist.',
  plugins_common_message_connIssue2: '2. The DevKit application is not installed on the server, \
     or the server port {0} is incorrect.',
  plugins_common_message_connIssue2_deployScenario: '2) The server has SSH disabled.',
  plugins_common_message_connIssue3: '3. The network cables are not properly connected.',
  plugins_common_message_connIssue4: '4. Network policies, such as interception rules, are used.',
  plugins_common_message_connIssue5: '5. Check the network status and network configurations.',
  plugins_common_message_serverErrorTip: '3.  Log in to the server OS and check the host or \
     container services are running properly.',
  plugins_common_message_serverErrorResult1: '- If yes, go to Step 4.',
  plugins_common_message_CommunityTip: '{0}. Report your problem on the {1}.',
  plugins_common_message_CommunityTipLink: '<a href={0}>Kunpeng Community</a>',
  plugins_common_message_serverErrorResult2Link: '<a href={0}> "How Do I Troubleshoot \
  the Server in Abnormal Status?"</a>',
  plugins_common_message_serverErrorResult2: '- If no, rectify the fault by following the \
     instructions provided in {0}.',

  // config 弹框
  plugins_common_cut_server: 'Do I need to close the page and switch server configurations? Click OK to exit the current server?',

  // 检查ssh2链接时候
  plugins_common_tips_checkConn_root: 'You are using the root user account. A common user account is recommended. For details , see FAQs. Continue?',
  plugins_common_tips_checkConn_noroot: 'You are using a common user account {0}. Check that the following conditions are met: \r\n\
        The common user {0} has been added to user group wheel. For details, see FAQs. Continue?',
  plugins_common_tips_checkConn_openFAQ: 'Open FAQ',


  plugins_public_text_tip: 'Tips',
  plugins_public_button_confirm: 'OK',
  plugins_public_button_cancel: 'cancel',
  plugins_public_message_confirm: 'Yes',
  plugins_public_message_cancel: 'No',
  plugins_public_message_close: 'Close',

  plugins_tuning_message_versionCompatibility: 'The plugin version does not match the software version of the server. \
  The server version of the code migration tool that this plugin can match is: {0}; \
  the current server version of the code migration tool is: {1}. \
  Please upgrade the server version to the matching version.',
  plugins_tuning_message_config_server_success: 'Config remote server success',
  plugins_tuning_message_save_config_success: 'Save config success!',
};
