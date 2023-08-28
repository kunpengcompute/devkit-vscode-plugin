export const I18N_ZH = {
  home_top_growth: '上鲲鹏社区，查看开发者新手成长路径',
  home_top_info: '上鲲鹏社区，学习使用开发套件',
  home_top_info1: '查看鲲鹏性能分析插件详细指导文档',
  home_top_info2: '有疑问？向专家咨询',
  common_term_valition_input:
    '输入不能包含中文、空格以及^ ` | ; & $ > < ! 等特殊字符',
  common_term_filename: '文件名',
  common_term_valition_rule1: '用户名不能为空',
  common_term_valition_rule3:
    '用户名必须以英文字母开头，长度为6～32个字符，可以包含字母、数字、“-”和“_”。',
  common_term_valition_rule4:
    '编译命令需以make, cmake或go开头, 正确形式如make xxx。',
  common_term_valition_rule5:
    '编译命令参数不能包含中文和< > | # ; & ` %等特殊字符',
  common_term_valition_rule6: '编译命令需以make或cmake开头, 正确形式如make xxx',
  common_term_no_password: '密码不能为空',
  common_term_no_samepwd: '新密码与确认密码必须相同。',
  common_term_valition_rule2: '新密码不能是旧密码的逆序。',
  common_term_required_tip: '输入不能为空',
  common_term_filename_tip: '输入不能为空',
  plugins_tuning_setting_label: '配置信息',
  common_term_no: '否',
  plugins_tuning_message: {
    workInfo:
      '性能分析工具工作空间不足，请及时清理历史报告。工作空间总容量为{0}GB，剩余工作空间容量为{1}GB，建议剩余工作空间容量为20%（{2}GB）以上。',
    workWarn:
      '性能分析工具工作空间不足1G，工具已停止写入操作，请立即清理历史报告以释放工作空间。工作空间总容量为{0}GB，剩余工作空间容量为{1}GB，建议剩余工作空间容量为20%（{2}GB）以上。',
    diskInfo:
      '性能分析工具磁盘空间不足，请及时清理磁盘空间。磁盘空间总容量为{0}GB，剩余磁盘空间容量为{1}GB，建议剩余磁盘空间容量为20%（{2}GB）以上。',
    diskWarn:
      '性能分析工具磁盘空间不足1G，工具已停止写入操作，请立即清理磁盘空间。磁盘空间总容量为{0}GB，剩余磁盘空间容量为{1}GB，建议剩余磁盘空间容量为20%（{2}GB）以上。',
    workDiskError: '磁盘空间不足1GB，请释放磁盘空间后再进行下一步操作。',
  },
  plugins_tuning_message_beforeInstall: '部署前必读',
  plugins_tuning_message_beforeInstallDsc1:
    '1. 在操作系统yum/apt/zypper源配置正确且联网正常的情况下，\
安装工具将自动从网络下载安装必备的软件包，例如nginx、django、python3、gcc等。\
您可参考《鲲鹏代码迁移工具 用户指南》中的“',
  plugins_tuning_message_beforeInstallDsc2: '配置操作系统yum/apt/zypper源',
  plugins_tuning_message_beforeInstallDsc3: '”章节进行yum/apt/zypper源配置。',
  plugins_tuning_message_beforeInstallDsc4:
    '2. 本工具会基于您所填写的信息（IP，端口，用户名，密码等），\
以识别您的系统状态，实现本工具一键式部署。本工具不会将这些信息用于其他目的，也不会将其传输到您的服务器以外。',
  plugins_tuning_message_beforeInstallDsc5:
    '3. 当您使用本工具时，本工具会下载并安装依赖的软件安装包，\
其中可能包含来自第三方的软件。上述来自第三方的软件均按照“如是”标准提供，我们对这些软件不承担任何责任。',
  plugins_tuning_message_arm_download_link: 'Arm安装包下载链接',
  plugins_tuning_message_x86_download_link: 'X86安装包下载链接',
  plugins_tuning_message_beforeInstallOption: '我已阅读以上文字',
  plugins_tuning_message_beforeInstallCancel: '取消',
  plugins_tuning_button_install: '点击此处部署',
  plugins_tuning_label_ip: 'IP地址',
  plugins_tuning_label_port: 'SSH端口',

  plugins_tuning_label_default_port: '默认端口：{0}',
  plugins_tuning_label_config:
    '请配置代码迁移工具的远程服务器地址，如果当前您尚未在服务器上部署工具',
  plugins_cloudied_tuning_label_config: '请配置代码迁移工具的远程服务器地址',
  plugins_tuning_button_save: '保存',
  plugins_tuning_button_modi: '修改',
  plugins_tuning_button_cancel: '取消',
  plugins_common_message_installDt1: '请确保远端运行服务器的操作系统及版本在',
  plugins_common_message_installDt2: '列表清单',
  plugins_common_message_installDt3:
    '中，并且处于联网状态。系统将为您自动完成安装。',
  plugins_common_message_upgradeDt1: '请确保远端运行服务器的操作系统及版本在',
  plugins_common_message_upgradeDt2: '列表清单',
  plugins_common_message_upgradeDt3:
    '清单中，并且处于联网状态。系统将为您自动完成升级。',
  plugins_common_message_uninstallDt:
    '请确保目标服务器正常，系统将为您自动完成卸载。',
  plugins_common_title_installTs: '目标服务器',
  plugins_tuning_label_installUser: '操作系统用户名',
  plugins_tuning_label_installPwd: '操作系统用户密码',
  plugins_tuning_message_ipError: ' 请输入正确格式的IP地址。',
  plugins_tuning_message_portError: ' 请输入正确范围的端口。(1024-65535)',
  plugins_tuning_message_bothError: '请输入正确格式的IP和端口。',
  plugins_tuning_button_installConfirm: '开始部署',
  plugins_tuning_button_uninstallConfirm: '开始卸载',
  plugins_tuning_button_upgradeConfirm: '开始升级',
  plugins_tuning_message_installingInfo:
    '请按照终端中的提示操作完成性能分析工具部署',
  plugins_tuning_message_uninstallingInfo:
    '请按照终端中的提示操作完成性能分析工具卸载',
  plugins_tuning_message_upgradingInfo:
    '请按照终端中的提示操作完成性能分析工具升级',
  plugins_tuning_title_installed: '工具部署成功',
  plugins_tuning_title_uninstalled: '工具卸载成功',
  plugins_tuning_title_upgraded: '工具升级成功',
  plugins_tuning_button_login: '登录',
  plugins_tuning_button_retry: '重试',
  plugins_tuning_button_install_failed_retry: '重新部署',
  plugins_tuning_title_installFailed: '性能分析工具部署失败',
  plugins_tuning_title_uninstallFailed: '性能分析工具卸载失败',
  plugins_tuning_title_upgradeFailed: '性能分析工具升级失败',
  plugins_tuning_message_installFailedInfo: '请按照终端中提示进行操作',
  plugins_tuning_message_install_failed_1: '请参考',
  plugins_tuning_message_install_failed_2: '官网',
  plugins_tuning_message_install_failed_3: '文档中的可能失败原因进行处理',

  plugins_tuning_label_cFile_path: '所在路径',
  plugins_common_button_term_operate_ok: '确认',
  common_term_adminpwd_check: '请输入管理员密码。',
  common_term_oldpwd_check: '请输入旧密码。',
  plugins_common_button_exit: '完成',
  common_term_valition_password:
    '必须包含大写字母、小写字母、数字以及特殊字符（`~!@#$%^&*()-_=+\\|[{}];:\'",<.>/?）中两种及以上类型的组合，不能含空格，长度为8~32个字符。',
  plugins_common_button_checkConn: '检测连接',
  plugins_common_tips_connOk: '连接检测成功，',
  plugins_common_tips_start_deploy: '点击【开始部署】进行工具安装。',
  plugins_common_tips_start_uninstall: '点击【开始卸载】进行工具卸载。',
  plugins_common_tips_start_upgrade: '点击【开始升级】进行工具升级。',
  plugins_common_tips_connFail:
    '连接检测失败，请检查用户名，密码或者私钥是否输入正确，重试次数过多也将导致检测失败。',
  plugins_common_tips_connTimeout: '连接检测失败，请检查IP端口是否正确。',
  plugins_common_message_fileName:
    '文件名称只能由字母、数字、“.”、“-”、“+”、“()”和“_”组成，长度为1~64个字符且不能以“.”开头。',
  plugins_common_message_fileName_length: '单个文件名限制最长不超过255个字符',
  plugins_common_message_command_length: '命令输入框限制最长不超过1024个字符',
  common_term_valition_path_length: '一次接收的路径最长不超过1024个字符',
  common_term_valition_realpath: '请输入合适的绝对路径，例如 /home/pathname/',
  plugins_common_tips_figerFail: '主机指纹校验失败，断开连接',
  plugins_common_tips_timeOut: '连接超时，请重试',
  plugins_common_title_sshKey: '密钥认证',
  plugins_common_title_sshPwd: '密码认证',
  plugins_common_label_selectSSHType: '选择SSH连接方式',
  plugins_common_message_sslKeyTip: '请导入id_rsa私钥文件',
  plugins_common_message_passphrase: '请输入私钥文件的密码短语',
  plugins_common_message_sshkeyFail: '请导入正确的id_rsa私钥文件',

  plugins_common_message_passphraseFail: '请输入正确的密码短语',
  plugins_common_message_sshkeyExceedMaxSize: '私钥文件大小超过10MB',
  plugins_common_label_installsshkey: '私钥',
  plugins_common_label_passphrase: '密码短语',
  plugins_common_message_sshkeyUpload: '导入',
  plugins_common_tips_sshError: 'SSH连接出现异常，请重试',
  plugins_common_tips_uploadError: '上传脚本文件到您的服务器失败',
  plugins_common_title_ipSelect:
    '工具即将向IP地址{0}发起登录请求，该地址为您安装时指定/安装后修改的web服务器地址。请确认当前地址{1}是否正确。',
  plugins_common_title_ipSelectUpgrade:
    '工具即将向IP地址{0}发起登录请求，该地址为您升级时指定/升级后修改的web服务器地址。请确认当前地址{1}是否正确。',
  plugins_common_tips_ipFault: '确认IP {0}无误',
  plugins_common_tips_ipSSH: '采用SSH连接时输入的IP地址 {0}',
  plugins_common_tips_ipExtra: '设置其他IP地址',
  plugins_tuning_weakPassword: {
    pwd_rule:
      '弱密码必须包含大写字母、小写字母、数字以及特殊字符（`~!@#$%^&*()-_=+\\|[{}];:\'",<.>/?）中两种及以上类型的组合，长度为8~32个字符，不能含空格。',
  },
  plugins_tuning_weakCheck: {
    report_list_tip: '可修改总数',
    report_suggestion: '修改建议',
    common_term_cFile_suggestion_label: '建议修改点数量',
  },
  period: '。',
  semicolon: '；',
  plugins_tuning_apply_free_env_info: '您也可以申请免费试用环境',
  plugins_tuning_apply_free_env_link: '点击此处',
  plugins_tuning_free_trial_remote_environment: '申请试用远程实验室',
  commonAdviceFeedback: '建议反馈',
  commonConnectFail: '连接失败',
  plugins_common_title_config: '配置性能分析工具远端服务器',
  plugins_common_label_config:
    '请配置性能分析工具的远程服务器地址，如您未在服务器上部署工具',
  plugins_common_button_install: '点击此处部署',
  plugins_common_apply_free_env_info: '您也可以申请免费试用环境',
  plugins_common_apply_free_env_link: '点击此处',
  plugins_common_label_ip: 'IP地址',
  plugins_common_message_ipError: ' 请输入正确格式的IP地址',
  plugins_common_enable_dns_name: '启用证书域名',
  plugins_common_label_configPort: 'HTTPS端口',
  plugins_common_placeholder_default_port: '默认端口为8086',
  plugins_common_message_portError: ' 请输入正确范围(1024~65535)的端口',
  plugins_tuning_title_upgradeDt: '升级性能分析工具',
  plugins_tuning_title_uninstallDt: '卸载性能分析工具',
  plugins_tuning_title_installDt: '部署性能分析工具',
  plugins_common_message_beforeInstall: '部署前必读',
  plugins_common_message_beforeInstallDsc4:
    '1. 本工具会基于您所填写的信息（IP，端口，用户名，密码等），\
    以识别您的系统状态，实现本工具一键式部署。本工具不会将这些信息用于其他目的，也不会将其传输到您的服务器以外。',
  plugins_common_message_beforeInstallDsc5:
    '2. 当您使用本工具时，本工具会下载并安装依赖的软件安装包，\
    其中可能包含来自第三方的软件。上述来自第三方的软件均按照“如是”标准提供，我们对这些软件不承担任何责任。',
  plugins_tuning_message_beforeInstallDsc6:
    '3. 当您使用本工具时，本工具会下载并安装必要的安装包和包校验工具，其中可能包含来自华为相关网站的下载内容。相关URL地址如下：',
  plugins_tuning_message_pg_download_link: '安装包下载链接',
  plugins_tuning_message_pg_vfc_tool_download_link: '包校验工具下载链接',
  plugins_common_remote_env: {
    use_process: '申请试用远程实验室流程',
    apply_remote_env: '申请试用远程实验室',
    apply_remote_env_info:
      '远程云服务器已经为您安装部署鲲鹏代码迁移工具、鲲鹏编译器、鲲鹏性能分析工具，动态二进制翻译工具（ExaGear）。',
    remaining_places: '剩余名额: ',
    immediately: '立即申请',
    check_email: '查收邮件',
    check_email_info:
      '申请成功后远程云端服务器信息将自动发送到您的邮箱，请您在申请时预留的邮箱中查收。',
    config_serve: '配置远端服务器',
    config_serve_info:
      '根据邮箱中的服务器信息配置登录远程服务器，您也可以配置本地已经部署鲲鹏开发套件的服务器地址。',
    config_now: '立即配置',
    early_release_or_extended_use: '提前释放/延长使用',
    early_release_or_extended_use_info:
      '申请成功后，可以在服务器申请网页提前释放资源或延长使用时间。',
  },
  common_install_panel_title: '部署服务端',
  plugins_tuning_configure_remote_server: '配置远端服务器',

  common_term_no_label: '序号',
  common_bc_suggestion_position: '建议修改代码位置',
  common_term_name_label: '依赖文件名',
  common_term_name_label_1: '文件名',

  plugins_common_title_serverException:
    '未收到服务端响应，请参考如下步骤排查异常:',
  plugins_common_message_networkErrorTip:
    '1. 本地执行curl {0}:{1}命令，检查服务端网络连通性。',
  plugins_common_message_networkErrorTip_deployScenario:
    '1. 本地执行ssh {0}命令，检查服务端网络连通性。',
  plugins_common_message_networkErrorResult1: '-正常，则执行步骤3;',
  plugins_common_message_networkErrorResult2: '-异常，则执行步骤2。',
  plugins_common_message_networkErrorYunTip:
    '2. 如果您使用华为云服务器登录，请确认您配置的登录地址是华为云的公网地址，而不是私网地址。\
    正常情况下您需要设置公网地址才能登录成功。如不涉及华为云服务器，请检查如下可能的连通性问题:',
  plugins_common_message_networkErrorYunTip_deployScenario:
    '2. 如果您使用华为云服务器登录，请确认您ssh连接的是华为云的公网地址，而不是私网地址。\
    正常情况下您需要设置公网地址才能ssh连接成功。如不涉及华为云服务器，请检查如下可能的连通性问题:',
  plugins_common_message_connIssue1: '1. 输入了实际不存在的IP',
  plugins_common_message_connIssue2:
    '2. 该服务器上没有安装服务端，或者指定了错误的服务端端口{0}',
  plugins_common_message_connIssue2_deployScenario:
    '2) IP存在，但是该服务器的ssh服务没有开启',
  plugins_common_message_connIssue3: '3. 网络物理原因，比如网线松动',
  plugins_common_message_connIssue4:
    '4. 网络策略原因，比如IT部门/网络管理员配置了拦截策略',
  plugins_common_message_connIssue5:
    '5. 其他原因，需要结合您的网络情况/网络管理员的配置具体检查',
  plugins_common_message_serverErrorTip:
    ' 3. 登录服务端操作系统检查主机或容器的服务运行状态。',
  plugins_common_message_serverErrorResult1: '-正常，则执行步骤4;',
  plugins_common_message_CommunityTip1: '{0}. 登录',
  plugins_common_message_CommunityTip2: '，反馈工具问题，并等待运维人员处理。',
  plugins_common_message_CommunityTipLink: '鲲鹏社区',
  plugins_common_message_serverErrorResult2Link: '"如何排查服务端状态异常问题"',
  plugins_common_message_serverErrorResult2_1: '-异常，请参考',
  plugins_common_message_serverErrorResult2_2: '处理。',
  plugins_common_message_figerLose:
    '主机 {0} 的可信度不能确定，指纹为SHA256:{1}，是否继续连接？',

  plugins_common_title_guide: '配置指引',
  plugins_common_label_guide:
    '请在完成鲲鹏性能分析工具部署后配置远端服务器，若您已经完成工具部署则可直接配置远端服务器。',
  plugins_common_guide: {
    install_serve: '部署服务端',
    install_serve_info: '部署鲲鹏性能分析工具到远端服务器。',
    install_now: '开始部署',
    config_serve: '配置远端服务器',
    config_serve_info: '连接已部署鲲鹏性能分析工具的远端服务器。',
    config_now: '开始配置',
  },

  // config 弹框
  plugins_common_cur_server_title: '保存远端服务器配置',
  plugins_common_cut_server:
    '是否需要关闭页面并切换服务器配置？点击确认后将退出当前服务器。',

  // 检查ssh2链接 弹框
  plugins_common_tips_checkConn_root_title: 'root用户部署',
  plugins_common_tips_checkConn_root:
    '您当前使用的是root用户，建议使用普通用户，相关加固操作请参考资料，是否确认继续操作？',
  plugins_common_tips_checkConn_noroot:
    '您当前使用的是普通用户{0}，请检查以下条件是否满足：\r\n普通用户{0}已加入用户组wheel，详细命令可参考资料，是否确认继续操作？',
  plugins_common_tips_checkConn_openFAQ: '打开资料',

  plugins_public_text_tip: '提示',
  plugins_public_button_confirm: '确认',
  plugins_public_button_cancel: '取消',
  plugins_public_button_continue: '继续',
  plugins_public_message_confirm: '是',
  plugins_public_message_cancel: '否',
  plugins_public_message_close: '关闭',

  plugins_tuning_message_versionCompatibility:
    '插件版本与服务端的软件版本不匹配。本插件可匹配的性能分析工具服务端版本为：{0}；当前性能分析工具服务端版本为：{1}。请您升级服务端版本至匹配版本。',
  plugins_tuning_message_save_config_success: '远端服务器配置成功！',
  plugins_tuning_title_save_config: '保存远端服务器配置',
  plugins_tuning_save_config_modify:
    '是否确认保存当前修改？点击确认后将登出当前用户。',
  plugins_tuning_title_root_deploy: 'root用户部署',
  plugins_common_title_errorInstruction: '服务器异常',
  plugins_common_button_checkErrorDetails: '修复建议',
  plugins_common_message_responseError:
    '服务器未响应，请确认服务器端工具已部署且网络连接正常。',
  plugins_common_message_responseError_deployScenario:
    '服务器未响应，请检查网络连接是否正常。',
  plugins_common_message_sshAlgError:
    '连接检测失败。客户端算法与服务器端算法不匹配，请参考FAQ配置安全算法。',
  plugins_common_message_sshClientCheck:
    '检测到该机器未安装SSH Client，请自行获取并安装。',
  plugins_tuning_title_finger_confirm: '确认指纹',
  plugins_tuning_button_continue_connect: '继续连接',
};
