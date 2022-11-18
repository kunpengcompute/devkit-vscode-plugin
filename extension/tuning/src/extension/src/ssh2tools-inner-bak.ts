import { Client, ConnectConfig } from 'ssh2';
import { InputAttributes } from 'ssh2-streams';
const fs = require('fs');
export class SSH2Tools {
  // deploy_sysPerf脚本
  private DEPLOY_SYSPERF: string[] = [
    '#!/bin/bash',
    'function help_info(){',
    'echo "usage bash deploy_sysperf.sh',
    '      -u url ',
    '      -c key',
    '      -h help infomation"',
    '}',
    '#get opts',
    'while getopts ":c:u:h" args',
    'do',
    ' case $args in',
    '    c)',
    '       key=$OPTARG',
    '       ;;',
    '    u)',
    '       url=$OPTARG',
    '       ;;',
    '    h)',
    '       help_info',
    '       exit 0',
    '       ;;',
    '    ?)',
    '       echo "unknow option \'-$OPTARG\'"',
    '       help_info',
    '       exit 2',
    '       ;;',
    ' esac',
    'done',
    '',
    'source /etc/profile',
    '',
    'cd `dirname $0`',
    'path=`pwd`',
    'function Logger(){',
    'if [ "Error" == $1 ]; then',
    'clean',
    'echo -e "\\e[1;31m`date \'+[%Y-%m-%d %H:%M:%S]\'` [$1] [$2] $3 \\e[0m "',
    'echo "failed" > $path/.install_sysPerf.step',
    'echo "The log path is /var/log/messages"',
    'else',
    'echo -e "`date \'+[%Y-%m-%d %H:%M:%S]\'` [$1] [$2] $3 "',
    'fi',
    'logger -t "devkit-ide" [$1] [$2] $3',
    '}',
    '',
    'function clean(){',
    'rm -rf $path/deploy_sysPerf.sh',
    'rm -rf $path/write_sysPerf_log.sh',
    '}',
    '',
    'if [ "$USER" != "root" ]; then',
    '  echo -e "\\e[1;31mPlease input your root password to start installing:\\e[0m"',
    'fi',
    'su - root -c "bash $path/write_sysPerf_log.sh -a $path -d ${key} -u $url "$USER""',
    'if [ $? == 1 ];then',
    '  Logger Error "Check Password" "Check Password failed, please check detail."',
    '  exit 1',
    'fi',
  ];

  // write_sysPerf_log文件
  private WRITE_SYSPERF_LOG: string[] = [
    '#!/bin/bash',
    'function help_info(){',
    'echo "usage bash write_sysperf_log.sh',
    '      -a path',
    '      -d key',
    '      -u url',
    '      -h help infomation"',
    '}',
    '#get opts',
    'while getopts ":a:d:u:h" args',
    'do',
    ' case $args in',
    '    a)',
    '       path=$OPTARG',
    '       ;;',
    '    d)',
    '       key=$OPTARG',
    '       ;;',
    '    u)',
    '       url=$OPTARG',
    '       ;;',
    '    h)',
    '       help_info',
    '       exit 0',
    '       ;;',
    '    ?)',
    '       echo "unknow option \'-$OPTARG\'"',
    '       help_info',
    '       exit 2',
    '       ;;',
    ' esac',
    'done',
    '',
    'function Logger(){',
    'if [ "Error" == $1 ]; then',
    'clean',
    'echo -e "\\e[1;31m`date \'+[%Y-%m-%d %H:%M:%S]\'` [$1] [$2] $3 \\e[0m "',
    'echo "failed" > $path/.install_sysPerf.step',
    'echo "The log path is /var/log/messages"',
    'echo "You can run the following command to delete the hyper tuner package:',
    '  rm -rf $path/*"',
    'else',
    'echo -e "`date \'+[%Y-%m-%d %H:%M:%S]\'` [$1] [$2] $3 "',
    'fi',
    'logger -t "devkit-ide" [$1] [$2] $3',
    '}',
    '',
    'function clean(){',
    'rm -rf $path/deploy_sysPerf.sh',
    'rm -rf $path/write_sysPerf_log.sh',
    '}',
    '',
    'function signature(){',
    '    if [ ! -f "$1" ];then',
    '      Logger Error "Signature" "Signature file is invalid.\n' +
      'KEYS download url is: ${key_url}\nAsc download url is: ${pkg_url}.asc\nYou can download' +
      ' ${pkg_name}.asc and KEYS.txt to save to path $path"',
    '      exit 2',
    '    fi',
    '    command -v gpg',
    '    if [ $? != 0 ];then',
    '     Logger Error "Signature" "You need to install signature tool gpg first."',
    '      exit 2',
    '    fi',
    '    command -v expect',
    '    if [ $? != 0 ]; then',
    '     Logger Error "Download" "You need to install shell tool expect first."',
    '      exit 2',
    '    fi',
    '    gpg --import "$path/KEYS.txt"',
    '    gpg --fingerprint',
    '    /usr/bin/expect <<EOF',
    '    set timeout -1',
    '    gpg --edit-key " OpenPGP signature key for Huawei software (created on 30th Dec,2013) " trust',
    'expect "Your decision?"',
    'send "5',
    '"',
    'expect "Do you really want to set this key to ultimate trust? (y/N)"',
    'send "y',
    '"',
    'expect "gpg>"',
    'send "quit',
    '"',
    'expect eof',
    'EOF',
    '    result=$(gpg --verify "$1")',
    '    if [[ $result =~ "This key is not certified with a trusted signature" ]];then',
    '      Logger Error "Signature" "This key is not certified with a trusted signature."',
    '      exit 2',
    '    elif [[ $result =~ "Good signature" ]];then',
    '      Logger Step "Signature" "Signature passed successfully."',
    '      exit 0',
    '    elif [[ $result =~ "BAD signature" ]];then',
    '      Logger Error "Signature" "Signature failed.please check the completion of package."',
    '      exit 2',
    '    elif [[ $result =~ "Can\'t check signature: public key not found" ]];then',
    '      Logger Error "Signature" "Can\'t check signature: public key not found."',
    '      exit 2',
    '    elif [[ $result =~ "can\'t hash datafile: No data" ]];then',
    '      Logger Error "Signature" "Cannot find the download package.please make sure it is in the same folder with signature file "',
    '      exit 2',
    '    fi',
    '    }',
    '#Step1. Install precheck',
    'Logger Step "Check Env" "Start to check if hyper tuner already installed."',
    'if [ -f "/home/malluma/tuningkit_conf/install.ini" ] && ' +
      '[ "$(cat /home/malluma/tuningkit_conf/install.ini | grep -w INSTALL_TOOL | cut -d \'=\' -f2)" == "all" ]; then',
    '  Logger Error "Check Env" "Hyper tuner already installed, task is exiting..."',
    '  echo "failed" > $path/.install_sysPerf.step',
    '  clean',
    '  exit 2',
    'fi',
    'Logger Step "Check Env" "End to check if hyper tuner already installed successfully."',
    '',
    '#Step2. Precheck JDK',
    'java -version > /dev/null 2>&1',
    'if [ $? != 0 ];then',
    '    Logger Warn "Precheck JDK" "The JDK environment has not been deployed on the current backend server. ' +
      'If you want to install and use the Java performance optimization tool, deploy the JDK environment first."',
    'fi',
    '',
    'pkg_url=$url',
    'pkg_name=${pkg_url##*/}',
    'if [[ ${pkg_name} =~ "tuner" ]];then',
    'pkg_file="Hyper_tuner"',
    'else',
    'pkg_file="Hyper_tuner"',
    'fi',
    'curl_url=$(echo $url | awk -F "/Tuning" \'{print $1}\')',
    "key_url=$(echo ${key} | sed 's/%26/\\&/g')",
    'Logger Step "Download" "Start to download hyper tuner package."',
    'function install_curl(){',
    '  apt install -y curl 2>/dev/null',
    '  if [ $? != 0 ]; then',
    '    yum install -y curl 2>/dev/null',
    '  fi',
    '}',
    'curl --help >/dev/null 2>&1',
    'if [ $? != 0 ]; then',
    '  install_curl',
    'fi',
    'if [ ! -f "$path/${pkg_name}" ];then',
    '    #Step1.Check Env',
    '    Logger Step "Check Env" "Start to check network connection"',
    '    curl -ksSL --connect-timeout 5 -I ${curl_url}',
    '    if [ $? != 0 ]; then',
    '        Logger Error "Check Env" "Network issue, please check connection.\nPackage download url is: ' +
      '${pkg_url}\nYou can download' +
      ' ${pkg_name} to save to path $path"',
    '        exit 4',
    '    fi',
    '    Logger Step "Check Env" "End to check network connection successfully."',
    '    Logger Step "Check Env" "Start to check target package url"',
    '    if [[ $(curl -ksSL --connect-timeout 5 -I ${pkg_url}) =~ "404 Not Found" ]]; then',
    '        Logger Error "Check Env" "Target url is not exist, please check url: ${pkg_url}"',
    '        exit 4',
    '    fi',
    '    Logger Step "Check Env" "End to check target package url successfully."',
    '    cd $path && curl "${pkg_url}" -O',
    '    if [ $? != 0 ];then',
    '        Logger Error "Download" "Download package failed, please check detail."',
    '        clean',
    '        exit 4',
    '    fi',
    'fi',
    '#Step3. Decompression',
    'Logger Step "Decompression" "Start to extract hyper tuner package."',
    'cd $path',
    'tar zxf ${pkg_name}',
    'if [ $? != 0 ];then',
    '  Logger Error "Decompression" "Extract package failed, please check detail."',
    '  clean',
    '  exit 5',
    'fi',
    'Logger Step "Decompression" "End to extract hyper tuner package successfully."',
    '',
    '#Step4. Install',
    'Logger Step "Install" "Start to install hyper tuner package."',
    'cd $path/${pkg_file} && bash install.sh -ide',
    'if [ $? != 0 ];then',
    '  Logger Error "Install" "Install package failed, please check detail logs above."',
    '  echo "failed" > $path/.install_sysPerf.step',
    "  cd $(cat /home/malluma/tuningkit_conf/install.ini | grep INSTALL_PATH | cut -d '=' -f2)",
    '  bash hyper_tuner_uninstall.sh -ide',
    '  clean',
    '  exit 6',
    'else',
    '  Logger Step "Install" "End to install hyper tuner package successfully."',
    '  clean',
    'fi',
    "cd $(cat /home/malluma/tuningkit_conf/install.ini | grep INSTALL_PATH | cut -d '=' -f2)",
    'grep listen ./tool/nginx/conf/nginx.conf | xargs >> $path/.install_sysPerf.step',
    '#Step6. Clean Env',
    'Logger Step "Clean Env" "Start to clean environment."',
    'echo -n "The hyper tuner package is stored in $path. Are you sure you want to delete it? (y/n. n is default)"',
    'read ack',
    'if [ "y" == "$ack" ] || [ "Y" == "$ack" ]; then',
    '  rm -rf $path/*',
    '  if [ $? != 0 ];then',
    '    Logger Error "Clean Env" "Clean env failed, please check detail."',
    '    clean',
    '    exit 7',
    '  fi',
    'fi',
    'history -cw',
    'Logger Step "Clean Env" "End to clean environment successfully."',
    '',
    'Logger Step "End" "All steps finished successfully."',
    'echo "success" > $path/.install_sysPerf.step',
  ];

  // uninstall_sysPerf脚本
  private UNINSTALL_SYSPERF: string[] = [
    '#!/bin/bash',
    'source /etc/profile',
    'cd `dirname $0`',
    'path=`pwd`',
    'function Logger(){',
    'if [ "Error" == $1 ]; then',
    'clean',
    'echo -e "\\e[1;31m`date \'+[%Y-%m-%d %H:%M:%S]\'` [$1] [$2] $3 \\e[0m "',
    'echo "failed" > $path/.uninstall_sysPerf.step',
    'echo "The log path is /var/log/messages"',
    'else',
    'echo -e "`date \'+[%Y-%m-%d %H:%M:%S]\'` [$1] [$2] $3 "',
    'fi',
    'logger -t "devkit-ide" [$1] [$2] $3',
    '}',
    '',
    'function clean(){',
    'rm -rf $path/uninstall_sysPerf.sh',
    'rm -rf $path/sysPerf_log.sh',
    '}',
    '',
    'if [ "$USER" != "root" ]; then',
    '  echo -e "\\e[1;31mPlease input your root password to start uninstalling:\\e[0m"',
    'fi',
    'su - root -c "bash $path/sysPerf_log.sh "$USER" $path"',
    'if [ $? == 1 ];then',
    '  Logger Error "Check Password" "Check Password failed, please check detail."',
    '  exit 1',
    'fi',
  ];

  // sysPerf_log文件
  private SYSPERF_LOG: string[] = [
    '#!/bin/bash',
    'path=$2',
    'function Logger(){',
    'if [ "Error" == $1 ]; then',
    'clean',
    'echo -e "\\e[1;31m`date \'+[%Y-%m-%d %H:%M:%S]\'` [$1] [$2] $3 \\e[0m "',
    'echo "failed" > $path/.uninstall_sysPerf.step',
    'echo "The log path is /var/log/messages"',
    'else',
    'echo -e "`date \'+[%Y-%m-%d %H:%M:%S]\'` [$1] [$2] $3 "',
    'fi',
    'logger -t "devkit-ide" [$1] [$2] $3',
    '}',
    '',
    'function clean(){',
    'rm -rf $path/uninstall_sysPerf.sh',
    'rm -rf $path/sysPerf_log.sh',
    '}',
    '',
    '#Step1. Uninstall precheck',
    'Logger Step "Check Env" "Start to check if hyper tuner already uninstalled."',
    'if [ ! -f "/home/malluma/tuningkit_conf/install.ini" ]; then',
    '  Logger Error "Check Env" "Hyper tuner already uninstalled, task is exiting..."',
    '  echo "failed" > $path/.uninstall_sysPerf.step',
    '  clean',
    '  exit 2',
    'fi',
    'Logger Step "Check Env" "End to check if hyper tuner already uninstalled successfully."',
    '',
    '#Step2. Uninstall',
    'Logger Step "Uninstall" "Start to uninstall hyper tuner package."',
    "cd $(cat /home/malluma/tuningkit_conf/install.ini | grep INSTALL_PATH | cut -d '=' -f2)",
    'bash hyper_tuner_uninstall.sh -ide',
    'if [ -f "/home/malluma/tuningkit_conf/install.ini" ];then',
    '  Logger Error "Uninstall" "Uninstall package failed, please check detail logs above."',
    '  echo "failed" > $path/.uninstall_sysPerf.step',
    '  clean',
    '  exit 3',
    'else',
    '  Logger Step "Uninstall" "End to uninstall hyper tuner package successfully."',
    '  echo "success" > $path/.uninstall_sysPerf.step',
    '  clean',
    'fi',
  ];

  // upgrade_sysPerf脚本
  private UPGRADE_SYSPERF: string[] = [
    '#!/bin/bash',
    'function help_info(){',
    'echo "usage bash upgrade_sysperf.sh',
    '      -c key',
    '      -u url',
    '      -h help infomation"',
    '}',
    '#get opts',
    'while getopts ":c:u:h" args',
    'do',
    ' case $args in',
    '    c)',
    '       key=$OPTARG',
    '       ;;',
    '    u)',
    '       url=$OPTARG',
    '       ;;',
    '    h)',
    '       help_info',
    '       exit 0',
    '       ;;',
    '    ?)',
    '       echo "unknow option \'-$OPTARG\'"',
    '       help_info',
    '       exit 2',
    '       ;;',
    ' esac',
    'done',
    '',
    'source /etc/profile',
    '',
    'cd `dirname $0`',
    'path=`pwd`',
    'function Logger(){',
    'if [ "Error" == $1 ]; then',
    'clean',
    'echo -e "\\e[1;31m`date \'+[%Y-%m-%d %H:%M:%S]\'` [$1] [$2] $3 \\e[0m "',
    'echo "failed" > $path/.upgrade_sysPerf.step',
    'echo "The log path is /var/log/messages"',
    'else',
    'echo -e "`date \'+[%Y-%m-%d %H:%M:%S]\'` [$1] [$2] $3 "',
    'fi',
    'logger -t "devkit-ide" [$1] [$2] $3',
    '}',
    '',
    'function clean(){',
    'rm -rf $path/upgrade_sysPerf.sh',
    'rm -rf $path/sysPerf_upgrade.sh',
    '}',
    '',
    'if [ "$USER" != "root" ]; then',
    '  echo -e "\\e[1;31mPlease input your root password to start upgrading:\\e[0m"',
    'fi',
    'su - root -c "bash $path/sysPerf_upgrade.sh -a $path -d ${key} -u $url "$USER""',
    'if [ $? == 1 ];then',
    '  Logger Error "Check Password" "Check Password failed, please check detail."',
    '  exit 1',
    'fi',
  ];

  // upgrade_sysPerf_log文件
  private UPGRADE_SYSPERF_LOG: string[] = [
    '#!/bin/bash',
    'function help_info(){',
    'echo "usage bash upgrade_sysperf_log.sh',
    '      -u url',
    '      -d key',
    '      -h help infomation"',
    '}',
    '#get opts',
    'while getopts ":a:d:u:h" args',
    'do',
    ' case $args in',
    '    a)',
    '       path=$OPTARG',
    '       ;;',
    '    d)',
    '       key=$OPTARG',
    '       ;;',
    '    u)',
    '       url=$OPTARG',
    '       ;;',
    '    h)',
    '       help_info',
    '       exit 0',
    '       ;;',
    '    ?)',
    '       echo "unknow option \'-$OPTARG\'"',
    '       help_info',
    '       exit 2',
    '       ;;',
    ' esac',
    'done',
    '',
    'function Logger(){',
    'if [ "Error" == $1 ]; then',
    'clean',
    'echo -e "\\e[1;31m`date \'+[%Y-%m-%d %H:%M:%S]\'` [$1] [$2] $3 \\e[0m "',
    'echo "failed" > $path/.upgrade_sysPerf.step',
    'echo "The log path is /var/log/messages"',
    'echo "You can run the following command to delete the hyper tuner package:',
    '  rm -rf $path/*"',
    'else',
    'echo -e "`date \'+[%Y-%m-%d %H:%M:%S]\'` [$1] [$2] $3 "',
    'fi',
    'logger -t "devkit-ide" [$1] [$2] $3',
    '}',
    '',
    'function clean(){',
    'rm -rf $path/upgrade_sysPerf.sh',
    'rm -rf $path/sysPerf_upgrade.sh',
    '}',
    '',
    'function signature(){',
    '    if [ ! -f "$1" ];then',
    '      Logger Error "Signature" "Signature file is invalid.\n' +
      'KEYS download url is: ${key_url}\nAsc download url is: ${pkg_url}.asc\nYou can download' +
      ' ${pkg_name}.asc and KEYS.txt to save to path $path"',
    '      exit 2',
    '    fi',
    '    command -v gpg',
    '    if [ $? != 0 ];then',
    '     Logger Error "Signature" "You need to install signature tool gpg first."',
    '      exit 2',
    '    fi',
    '    command -v expect',
    '    if [ $? != 0 ]; then',
    '     Logger Error "Download" "You need to install shell tool expect first."',
    '      exit 2',
    '    fi',
    '    gpg --import "$path/KEYS.txt"',
    '    gpg --fingerprint',
    '    /usr/bin/expect <<EOF',
    '    set timeout -1',
    '    gpg --edit-key " OpenPGP signature key for Huawei software (created on 30th Dec,2013) " trust',
    'expect "Your decision?"',
    'send "5',
    '"',
    'expect "Do you really want to set this key to ultimate trust? (y/N)"',
    'send "y',
    '"',
    'expect "gpg>"',
    'send "quit',
    '"',
    'expect eof',
    'EOF',
    '    result=$(gpg --verify "$1")',
    '    if [[ $result =~ "This key is not certified with a trusted signature" ]];then',
    '      Logger Error "Signature" "This key is not certified with a trusted signature."',
    '      exit 2',
    '    elif [[ $result =~ "Good signature" ]];then',
    '      Logger Step "Signature" "Signature passed successfully."',
    '      exit 0',
    '    elif [[ $result =~ "BAD signature" ]];then',
    '      Logger Error "Signature" "Signature failed.please check the completion of package."',
    '      exit 2',
    '    elif [[ $result =~ "Can\'t check signature: public key not found" ]];then',
    '      Logger Error "Signature" "Can\'t check signature: public key not found."',
    '      exit 2',
    '    elif [[ $result =~ "can\'t hash datafile: No data" ]];then',
    '      Logger Error "Signature" "Cannot find the download package.please make sure it is in the same folder with signature file "',
    '      exit 2',
    '    fi',
    '    }',
    'pkg_url=$url',
    'pkg_name=${pkg_url##*/}',
    'if [[ ${pkg_name} =~ "tuner" ]];then',
    'pkg_file="Hyper_tuner"',
    'else',
    'pkg_file="hyper_tuner"',
    'fi',
    'curl_url=$(echo $url | awk -F "/Tuning" \'{print $1}\')',
    "key_url=$(echo ${key} | sed 's/%26/\\&/g')",
    '',
    'Logger Step "Download" "Start to download hyper tuner package."',
    'function install_curl(){',
    '  apt install -y curl 2>/dev/null',
    '  if [ $? != 0 ]; then',
    '    yum install -y curl 2>/dev/null',
    '  fi',
    '}',
    'curl --help >/dev/null 2>&1',
    'if [ $? != 0 ]; then',
    '  install_curl',
    'fi',
    'if [ ! -f "$path/${pkg_name}" ];then',
    '    #Step1.Check Env',
    '    Logger Step "Check Env" "Start to check network connection"',
    '    curl -ksSL --connect-timeout 5 -I ${curl_url}',
    '    if [ $? != 0 ]; then',
    '        Logger Error "Check Env" "Network issue, please check connection.\nPackage download url is: ' +
      '${pkg_url}\n You can download' +
      ' ${pkg_name} to save to path $path"',
    '        exit 2',
    '    fi',
    '    Logger Step "Check Env" "End to check network connection successfully."',
    '    Logger Step "Check Env" "Start to check target package url"',
    '    if [[ $(curl -ksSL --connect-timeout 5 -I ${pkg_url}) =~ "404 Not Found" ]]; then',
    '        Logger Error "Check Env" "Target url is not exist, please check url: ${pkg_url}"',
    '        exit 2',
    '    fi',
    '    Logger Step "Check Env" "End to check target package url successfully."',
    '    cd $path && curl "${pkg_url}" -O',
    '    if [ $? != 0 ];then',
    '        Logger Error "Download" "Download package failed, please check detail."',
    '        clean',
    '        exit 2',
    '    fi',
    'fi',
    'Logger Step "Download" "End to download hyper tuner package successfully."',
    '',
    '#Step2. Decompression',
    'Logger Step "Decompression" "Start to extract hyper tuner package."',
    'cd $path',
    'tar zxf ${pkg_name}',
    'cd $path/${pkg_file}',
    'tar zxf ${pkg_name}',
    'if [ $? != 0 ];then',
    '  Logger Error "Decompression" "Extract package failed, please check detail."',
    '  clean',
    '  exit 2',
    'fi',
    'Logger Step "Decompression" "End to extract hyper tuner package successfully."',
    '',
    '#Step2. Upgrade',
    'Logger Step "Upgrade" "Start to upgrade hyper tuner package."',
    "cd $(cat /home/malluma/tuningkit_conf/install.ini | grep INSTALL_PATH | cut -d '=' -f2)",
    './Upgrade upgrade $path/${pkg_file}/${pkg_name} -ide',
    'if [ -f "$path/Hyper_tuner/Hyper_tuner/status_file" ];then',
    '  Logger Step "Upgrade" "End to upgrade hyper tuner package successfully."',
    '  clean',
    'else',
    '  Logger Error "Upgrade" "Upgrade package failed, please check detail logs above."',
    '  echo "failed" > $path/.upgrade_sysPerf.step',
    '  clean',
    '  exit 2',
    'fi',
    "cd $(cat /home/malluma/tuningkit_conf/install.ini | grep INSTALL_PATH | cut -d '=' -f2)",
    'grep listen ./tool/nginx/conf/nginx.conf | xargs >> $path/.upgrade_sysPerf.step',
    '#Step6. Clean Env',
    'Logger Step "Clean Env" "Start to clean environment."',
    'echo -n "The hyper tuner package is stored in $path. Are you sure you want to delete it? (y/n. n is default)"',
    'read ack',
    'if [ "y" == "$ack" ] || [ "Y" == "$ack" ]; then',
    '  rm -rf $path/*',
    '  if [ $? != 0 ];then',
    '    Logger Error "Clean Env" "Clean env failed, please check detail."',
    '    clean',
    '    exit 7',
    '  fi',
    'fi',
    'history -cw',
    'Logger Step "Clean Env" "End to clean environment successfully."',
    '',
    'Logger Step "End" "All steps finished successfully."',
    'echo "success" > $path/.upgrade_sysPerf.step',
  ];
  private conn: Client;

  // ssh支持的加密算法
  private algorithms = {
    kex: ['curve25519-sha256', 'diffie-hellman-group-exchange-sha256'],
    cipher: [
      'aes256-gcm',
      'aes256-gcm@openssh.com',
      'aes256-ctr',
      'aes192-ctr',
      'aes128-ctr',
    ],
    hmac: ['hmac-sha2-512', 'hmac-sha2-256'],
    serverHostKey: [
      'ecdsa-sha2-nistp256',
      'ecdsa-sha2-nistp384',
      'ecdsa-sha2-nistp521',
    ],
  };
  public onCloseBefore?: () => Promise<any>;
  public status: 'connected' | 'closed' = 'closed';
  constructor() {
    this.conn = new Client();
  }

  /**
   * 检测是否安装ssh client
   */
  public sshClientCheck() {
    return new Promise((resolve) => {
      const { exec } = require('child_process');
      exec('ssh', (error: any, stdout: any, stderr: any) => {
        // 由于ssh的用法必须要带参数hostname，所以这里直接调用ssh必定会进入该if分支
        if (error) {
          const outString = error.toString();
          if (outString.search(/usage/) !== -1) {
            resolve(true);
          } else {
            resolve(false);
          }
        }
        resolve(true);
      });
    });
  }

  /**
   * 检测是否真的存在密码短语
   * @param msg msg
   * @returns 存在返回true
   */
  public checkRealExistPassphrase(msg: any): boolean {
    if (msg.privateKey && msg.privateKey.trim() !== '') {
      const tmpContent = fs.readFileSync(msg.privateKey).toString();
      const hasPassPhrase = msg.passphrase && msg.passphrase.trim() !== '';
      if (
        !/\bProc-Type:\s*?\d+,\s*?ENCRYPTED\b/.test(tmpContent) &&
        hasPassPhrase
      ) {
        return false;
      }
    }
    return true;
  }
  /**
   * 连接
   * @param server server
   */
  public connect(server: ConnectConfig) {
    return new Promise((resolve, reject) => {
      this.conn.end();
      server.algorithms = this.algorithms;
      // 毫秒
      server.readyTimeout = 60000;
      this.conn
        .on('ready', () => {
          this.status = 'connected';
          resolve(this);
        })
        .on('error', (err) => {
          reject(err);
        })
        .on('end', () => {
          this.conn.end();
          this.status = 'closed';
        })
        .on('close', () => {
          this.conn.end();
          this.status = 'closed';
        })
        .connect(server);
    });
  }

  /**
   * 连接
   * @param server server
   * @param then then
   * @param callback callback
   */
  public connectTest(server: any, then: any, callback: any) {
    const conn = new Client();
    server.algorithms = this.algorithms;
    // 毫秒
    server.readyTimeout = 60000;
    server.debug = (data: any) => {
      if (data.search(/password auth failed/) !== -1) {
        callback('USERAUTH_FAILURE');
        callback = () => {};
      } else if (data.search(/publickey auth failed/) !== -1) {
        callback('USERAUTH_FAILURE');
        callback = () => {};
      } else if (
        data.search(/GLOBAL_REQUEST/) !== -1 ||
        data.search(/USERAUTH_SUCCESS/) !== -1
      ) {
        callback('SUCCESS');
        conn.end();
        callback = () => {};
      }
    };
    try {
      conn
        .on('ready', () => {})
        .on('error', callback)
        .on('end', () => {
          conn.end();
        })
        .on('close', (hadError: any) => {
          conn.end();
        })
        .connect(server);
    } catch (error) {
      callback(error);
    }
  }
  /**
   * 在远端服务器创建目录
   *
   * @param dirPath 目录路径
   * @param inputAttributes 目录属性
   */
  public mkdir(dirPath: string, inputAttributes: InputAttributes) {
    return new Promise((resolve, reject) => {
      this.conn.sftp((err, sftp) => {
        if (err) {
          reject(err);
        }
        sftp.mkdir(dirPath, inputAttributes, (mkErr: any) => {
          if (mkErr) {
            reject(new Error(`mkdir ${dirPath} err: ${mkErr}`));
          }
        });
        resolve(true);
      });
    });
  }
  /**
   * 上传文件localFile到服务器remoteFile
   * @param filename 文件名字
   * @param remoteFile 远端文件
   */
  public writeFile(filename: string, remoteFile: string) {
    const shellData = this.getData(this.getCurrentFile(filename));
    const options = { mode: '500' };
    return new Promise((resolve, reject) => {
      this.conn.sftp((err, sftp: any) => {
        if (err) {
          reject(err);
        }
        sftp.writeFile(
          remoteFile,
          shellData,
          options,
          (putErr: any, result: any) => {
            if (putErr) {
              reject(new Error(`write file ${remoteFile} failed`));
            }
            resolve('success');
          }
        );
      });
    });
  }
  private getCurrentFile(localFile: string) {
    if (localFile.search(/deploy_sysPerf/) !== -1) {
      return this.DEPLOY_SYSPERF;
    } else if (localFile.search(/write_sysPerf/) !== -1) {
      return this.WRITE_SYSPERF_LOG;
    } else if (localFile.search(/uninstall_sysPerf/) !== -1) {
      return this.UNINSTALL_SYSPERF;
    } else if (localFile.search(/sysPerf_log/) !== -1) {
      return this.SYSPERF_LOG;
    } else if (localFile.search(/upgrade_sysPerf/) !== -1) {
      return this.UPGRADE_SYSPERF;
    } else if (localFile.search(/sysPerf_upgrade/) !== -1) {
      return this.UPGRADE_SYSPERF_LOG;
    }
    return [];
  }
  // 获取脚本数据
  private getData(content: string[]) {
    const shellData: string[] = [];
    for (let line of content) {
      line = line + '\n';
      shellData.push(line);
    }
    return shellData.toString().replace(/,/g, '');
  }

  /**
   * 关闭连接
   */
  public closeConnect() {
    if (this.onCloseBefore) {
      this.onCloseBefore().then(() => {
        this.conn.end();
      });
    } else {
      this.conn.end();
    }
  }

  /**
   * 使用tail -f流读取服务器文件
   *
   * @param path 远端文件路径
   * @param listener 数据监听函数
   */
  public tailFlow(path: string, listener: (data: string) => void) {
    return new Promise((resolve, reject) => {
      this.conn.exec(
        `touch ${path} && chmod 600 ${path} && tail -f ${path}`,
        { pty: true },
        (err, clientChannel) => {
          if (err) {
            reject(err);
          }
          clientChannel.on('data', (chunk: any) => {
            resolve('');
            listener(Buffer.from(chunk).toString());
          });
        }
      );
    });
  }
  /**
   * 如果有的话，删除服务器文件
   *
   * @param filePathList 文件路径列表
   * @param retry 重试次数
   */
  public clear(filePathList: Array<string>, retry: number = 1) {
    return new Promise((resolve, reject) => {
      this.conn.sftp((err, sftp) => {
        if (err) {
          reject(err);
        }
        const results: Array<{ filePath: string; error: Error | undefined }> =
          [];
        filePathList.forEach((filePath) => {
          const result = { filePath, error: undefined };
          results.push(result);
          for (let i = 0; i < retry; i++) {
            const r = sftp.unlink(filePath, (unlinkErr: any) => {
              result.error = unlinkErr;
            });
            if (r) {
              result.error = undefined;
              return;
            }
          }
        });
        resolve(results);
      });
    });
  }

  /**
   * 在远端执行command命令
   * @param command 命令
   */
  public exec(command: string) {
    return new Promise((resolve, reject) => {
      this.conn.exec(command, (err, clientChannel) => {
        if (err) {
          reject(err);
        }
        clientChannel
          .on('data', (chunk: any) => {
            resolve(Buffer.from(chunk).toString());
            clientChannel.close();
          })
          .on('close', () => {
            resolve('close');
          });
      });
    });
  }
}
