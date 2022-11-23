
export const I18N_EN = {
    perf_sysperf_advisor: 'System Profiler',
    perfadvisor_login: 'Log In to Hyper Tuner',
    perf_setting: 'Hyper Tuner - Settings',
    sysperf_setting: 'System Profiler Settings',
    plugins_sysperf_message_logout: 'Are you sure you want to logout Hyper Tuner?',
    plugins_sysperf_message_logout_ok: 'You have logged out of the system.',
    plugins_sysperf_button_confirm: 'OK',
    plugins_sysperf_button_cancel: 'cancel',
    plugins_common_message_sshClientCheck: 'The SSH client is not installed on the device. Obtain and install the SSH client.',
    plugins_common_configure_remoteServer: 'Hyper Tuner – Configure Remote Server',
    common_install_panel_title: 'Hyper Tuner - Deployment tool',
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
    plugins_sysperf_detail: 'detail',
    plugins_common_button_save: 'save',


    plugins_perf_cert_expiring: 'The cert.pem certificate of the Hyper Tuner backend server will expire on {0}. \
    Please update the certificate in time.',
    plugins_perf_cert_expired: 'The cert.pem certificate of the Hyper Tuner backend server has expired. \
    Please update the certificate immediately.',
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
    plugins_common_tips_checkConn_root_title: 'Deployment of root user',
    plugins_common_tips_checkConn_root:
        'You are using the root user account. A common user account is recommended. For details , see references. Continue?',
    plugins_common_tips_checkConn_noroot: 'You are using a common user account {0}. Check that the following conditions are met: \r\n\
        The common user {0} has been added to user group wheel. For details, see FAQs. Continue?',
    plugins_common_tips_checkConn_openFAQ: 'Open reference',
    plugins_common_tips_connFail: 'Failed to check the SSH connection. Check whether the user name and password are correct.\
     Too many retries will also cause the check failure.',
    plugins_common_message_sshAlgError: 'Connection detection failed. The algorithm on the client side does not match that on the \
     server side. For details about how to configure a security algorithm, see FAQ.',
    common_login: 'Kunpeng Hyper Tuner Tool',
    plugins_common_message_resqust_timeout: 'Network timeout.',
    plugins_common_message_responseError: 'The server does not respond. \
     Check that the tool has been deployed on the server and the network connection is normal.',
    plugins_common_message_responseError_deployScenario: 'The server does not respond. \
     Check that the network connection is normal.',

    plugins_common_cut_server: 'Switch server',
    plugins_tuning_title_createTime: ' Create Time:',
    plugins_tuning_title_importTime: ' Import Time:',
    plugins_tuning_dowloadPath: 'File downloaded successfully. Save path: {0}',
    plugins_tuning_message_cart: 'After the certificate is imported successfully, \
    restart VS Code for the certificate to take effect.',
    page_loading: "Page loading...",

    server_not_configered: '您还未链接远端服务器',
    button_configure_server: '配置远程服务器',
    free_trial_tip: '您也可申请免费试用鲲鹏远程实验室，该环境已预装鲲鹏代码迁移工具、鲲鹏编译器、鲲鹏性能分析工具、动态二进制翻译工具（ExaGear）。',
    free_trial_button: '免费试用',
    no_login_tip: "您还未登录",
    no_login_button: "登录",
    configure_server_again: "您已经连接远端服务器",
    configure_server_again_button: "重新配置服务器",
    ip_address_title: "IP地址",
    port_title: "端口"
};
