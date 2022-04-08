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

import * as vscode from 'vscode';
import { Client, ConnectConfig } from 'ssh2';
import { InputAttributes } from 'ssh2-streams';
const fs = require('fs');
export class SSH2Tools {

    constructor() {
        this.conn = new Client();
    }

    // deploy_porting脚本
    private DEPLOY_PORTING: string[] = ['#!/bin/bash',
        'function help_info(){',
        'echo "usage bash deploy_porting.sh',
        '      -a arm ',
        '      -b x86',
        '      -c key',
        '      -h help infomation"',
        '}',
        '#get opts',
        'while getopts ":a:b:c:h" args',
        'do',
        ' case $args in',
        '    a)',
        '       arm=$OPTARG',
        '       ;;',
        '    b)',
        '       x86=$OPTARG',
        '       ;;',
        '    c)',
        '       key=$OPTARG',
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
        'cd `dirname $0`',
        'path=`pwd`',
        'function Logger(){',
        'if [ "Error" == $1 ]; then',
        'clean',
        'echo -e "\\e[1;31m`date \'+[%Y-%m-%d %H:%M:%S]\'` [$1] [$2] $3 \\e[0m "',
        'echo "failed" > $path/.install_porting.step',
        'echo "The log path is /var/log/messages"',
        'else',
        'echo -e "`date \'+[%Y-%m-%d %H:%M:%S]\'` [$1] [$2] $3 "',
        'fi',
        'logger -t "devkit-ide" [$1] [$2] $3',
        '}',
        '',
        'function clean(){',
        'rm -rf $path/write_porting_log.sh',
        'rm -rf $path/deploy_porting.sh',
        '}',
        '',
        'if [ "$USER" != "root" ]; then',
        '  echo -e "\\e[1;31mPlease input your root password to start installing:\\e[0m"',
        'fi',
        'su - root -c "cd $path && bash write_porting_log.sh -a $arm -b $x86 -c $path -d ${key} "$USER""',
        'if [ $? == 1 ];then',
        '  Logger Error "Check Password" "Check Password failed, please check detail."',
        '  exit 1',
        'fi',
    ];

    // write_porting_log文件
    private WRITE_PORTING_LOG: string[] = ['#!/bin/bash',
        'function help_info(){',
        '  echo "usage bash write_porting_log.sh',
        '      -a arm',
        '      -b x86',
        '      -c path',
        '      -d key',
        '      -h help infomation"',
        '}',
        '#get opts',
        'while getopts ":a:b:c:d:h" args',
        'do',
        '  case $args in',
        '    a)',
        '       arm=$OPTARG',
        '       ;;',
        '    b)',
        '       x86=$OPTARG',
        '       ;;',
        '    c)',
        '       path=$OPTARG',
        '       ;;',
        '    d)',
        '       key=$OPTARG',
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
        '  esac',
        'done',
        '',
        'function Logger(){',
        '  if [ "Error" == $1 ]; then',
        '    clean',
        '    echo -e "\\e[1;31m`date \'+[%Y-%m-%d %H:%M:%S]\'` [$1] [$2] $3 \\e[0m "',
        '    echo "failed" > $path/.install_porting.step',
        '    echo "The log path is /var/log/messages"',
        '    echo "You can run the following command to delete the portadv package:',
        '    rm -rf $path/*"',
        '  else',
        '    echo -e "`date \'+[%Y-%m-%d %H:%M:%S]\'` [$1] [$2] $3 "',
        '  fi',
        '}',
        '',
        'function clean(){',
        '  rm -rf $path/deploy_porting.sh',
        '  rm -rf $path/write_porting_log.sh',
        '}',
        '',
        'function port_install(){',
        '  apt install -y $1 2>/dev/null',
        '  if [ $? != 0 ]; then',
        '    yum install -y $1 2>/dev/null',
        '    if [ $? != 0 ]; then',
        '      return 1',
        '    fi',
        '  fi',
        '  return 0',
        '}',
        '',
        'function signature(){',
        '  if [ ! -f "$1" ];then',
        '    Logger Error "Signature" "Signature file is invalid.\n' +
        'KEYS download url is: ${key_url}\nAsc download url is: ${pkg_url}.asc\nYou can download' +
        ' ${pkg_name}.asc and KEYS.txt to save to path $path"',
        '    exit 2',
        '  fi',
        '  command -v gpg',
        '  if [ $? != 0 ];then',
        '    Logger Error "Signature" "You need to install signature tool gpg first."',
        '    exit 2',
        '  fi',
        '  command -v expect',
        '  if [ $? != 0 ]; then',
        '    port_install expect',
        '    if [ $? != 0 ]; then',
        '      Logger Error "Download" "You need to install shell tool expect first."',
        '      exit 2',
        '    fi',
        '  fi',
        '  gpg --import "$path/KEYS.txt"',
        '  gpg --fingerprint',
        '  /usr/bin/expect <<EOF',
        '  set timeout -1',
        '  gpg --edit-key " OpenPGP signature key for Huawei software (created on 30th Dec,2013) " trust',
        '  expect "Your decision?"',
        '  send "5',
        '"',
        '  expect "Do you really want to set this key to ultimate trust? (y/N)"',
        'send "y',
        '"',
        '  expect "gpg>"',
        '  send "quit',
        '"',
        '  expect eof',
        'EOF',
        '  result=$(gpg --verify "$1")',
        '  if [[ $result =~ "This key is not certified with a trusted signature" ]];then',
        '    Logger Error "Signature" "This key is not certified with a trusted signature."',
        '    exit 2',
        '  elif [[ $result =~ "Good signature" ]];then',
        '    Logger Step "Signature" "Signature passed successfully."',
        '    exit 0',
        '  elif [[ $result =~ "BAD signature" ]];then',
        '    Logger Error "Signature" "Signature failed.please check the completion of package."',
        '    exit 2',
        '  elif [[ $result =~ "Can\'t check signature: public key not found" ]];then',
        '    Logger Error "Signature" "Can\'t check signature: public key not found."',
        '    exit 2',
        '  elif [[ $result =~ "can\'t hash datafile: No data" ]];then',
        '    Logger Error "Signature" "Cannot find the download package.please make sure it is in the same ' +
        'folder with signature file "',
        '    exit 2',
        '  fi',
        '}',
        'Logger Step "Check Env" "Start to check cpu mode of x86 or arm."',
        'if [[ $(uname -a) =~ "x86" ]]; then',
        '  Logger Step "Check Env" "It is x86 host."',
        '  pkg_url=$x86',
        'else ',
        '  Logger Step "Check Env" "It is arm host."',
        '  pkg_url=$arm',
        'fi',
        'pkg_name=$(echo ${pkg_url} | awk -F "Packages/" \'{print $2}\')',
        'pkg_file=$(echo ${pkg_name} | awk -F ".tar.gz" \'{print $1}\')',
        'curl_url=$(echo ${pkg_url} | awk -F "/Porting" \'{print $1}\')',
        'key_url=$(echo ${key} | sed \'s/%26/\\&/g\')',
        'Logger Step "Check Env" "End to check cpu mode of x86 or arm."',
        '',
        'if [ ! -f "$path/${pkg_name}" ];then',
        '  Logger Step "Check Env" "Start to check network connection"',
        '  curl --help >/dev/null 2>&1',
        '  if [ $? != 0 ]; then',
        '    port_install curl',
        '  fi',
        '  curl -ksSL --connect-timeout 5 -I ${curl_url}',
        '  if [ $? != 0 ]; then',
        '    Logger Error "Check Env" "Network issue, please check connection.\nPackage download url is: ' +
        '${pkg_url}\n KEYS download url is ${key_url}.\nAsc download url is: ${pkg_url}.asc\nYou can download' +
        ' ${pkg_name}、${pkg_name}.asc and KEYS.txt to save to path $path"',
        '    exit 2',
        '  fi',
        '  Logger Step "Check Env" "End to check network connection successfully."',
        '  Logger Step "Check Env" "Start to check target package url"',
        '  if [[ $(curl -ksSL --connect-timeout 5 -I ${pkg_url}) =~ "404 Not Found" ]]; then',
        '    Logger Error "Check Env" "Target url is not exist, please check.\nurl: ${pkg_url}"',
        '    exit 3',
        '  fi',
        '  Logger Step "Check Env" "End to check target package url successfully."',
        '  Logger Step "Download" "Start to download portadv package."',
        '  cd $path && curl "${pkg_url}" -O -f -L --retry 3 --connect-timeout 300',
        '  if [ $? != 0 ]; then',
        '    Logger Error "Download" "Download package failed, please check detail."',
        '    clean',
        '    exit 4',
        '  fi',
        '  chmod 000 ${pkg_name}',
        '  Logger Step "Download" "End to download portadv package successfully."',
        '  Logger Step "Download" "Start to download portadv asc."',
        '  curl "${pkg_url}.asc" -O -f -L --retry 3 --connect-timeout 300',
        '  if [ $? != 0 ]; then',
        '    Logger Error "Download" "Download asc failed, please check detail."',
        '    clean',
        '    exit 4',
        '  fi',
        '  Logger Step "Download" "End to download asc successfully."',
        '  Logger Step "Download" "Start to download KEYS."',
        '  curl -s "${key_url}" -o KEYS.txt -f -L --retry 3 --connect-timeout 300',
        '  if [ $? != 0 ]; then',
        '    Logger Error "Download" "Download KEYS failed, please check detail."',
        '    clean',
        '    exit 4',
        '  fi',
        '  Logger Step "Download" "End to download KEYS successfully."',
        'fi',
        'signature $path/${pkg_name}.asc',
        'Logger Step "Decompression" "Start to extract portadv package."',
        'cd $path && tar zxf ${pkg_name} ',
        'if [ $? != 0 ]; then',
        '  Logger Error "Decompression" "Extract package failed, please check detail."',
        '  clean',
        '  exit 5',
        'fi',
        'Logger Step "Decompression" "End to extract portadv package successfully."',
        '',
        '#Step4.Install',
        'Logger Step "Install" "Start to install portadv package."',
        'cd $path/${pkg_file} && ./install web',
        'if [ $? != 0 ];then',
        '  Logger Error "Install" "Install package failed, please check detail logs above."',
        '  echo "failed" > $path/.install_porting.step',
        '  clean',
        '  exit 6',
        'else',
        '  Logger Step "Install" "End to install portadv package successfully."',
        'fi',
        'cd $(service gunicorn_port status | grep portadv | awk \'NR==1{print $4}\' | ' +
        'awk -F "/portadv/tools" \'{print $1}\')',
        'grep listen $(find ./ -name \'nginx_port.conf\') | xargs >> $path/.install_porting.step',
        '#Step4.Clean Env',
        'Logger Step "Clean Env" "Start to clean environment."',
        '',
        'echo -n "The portadv package is stored in $path. Are you sure you want to delete it? (y/n. n is default)"',
        'read ack',
        'if [ "y" == "$ack" ] || [ "Y" == "$ack" ]; then',
        '  rm -rf $path/*',
        '  if [ $? != 0 ]; then',
        '    Logger Error "Clean Env" "Clean env failed, please check detail."',
        '    clean',
        '    exit 7',
        '  fi',
        '  history -cw',
        'fi',
        '',
        'Logger Step "Clean Env" "End to clean environment successfully."',
        'Logger Step "End" "All steps finished successfully."',
        'echo "success" > $path/.install_porting.step',
        'clean'];


    // uninstall_porting.sh
    private UNINSTALL_PORTING: string[] = [
        '#!/bin/bash',
        'source /etc/profile',
        'cd `dirname $0`',
        'path=`pwd`',
        'function clean(){',
        'rm -rf $path/uninstall_porting.sh',
        'rm -rf $path/uninstall_porting_log.sh',
        '}',
        'function Logger(){',
        'if [ "Error" == $1 ]; then',
        'clean',
        'echo -e "\\e[1;31m`date \'+[%Y-%m-%d %H:%M:%S]\'` [$1] [$2] $3 \\e[0m "',
        'echo "failed" > $path/.uninstall_porting.step',
        'echo "The log path is /var/log/messages"',
        'else',
        'echo -e "`date \'+[%Y-%m-%d %H:%M:%S]\'` [$1] [$2] $3 "',
        'fi',
        'logger -t "devkit-ide" [$1] [$2] $3',
        '}',
        '#Step1. UnInstall',
        'Logger Step "UnInstall" "Start to uninstall portadv package."',
        'if [ "$USER" != "root" ]; then',
        '  echo -e "\\e[1;31mPlease input your root password to start uninstalling:\\e[0m"',
        'fi',
        'su - root -c "cd $path && bash uninstall_porting_log.sh "$USER" $path"',
        'if [ $? == 1 ];then',
        '  Logger Error "Check Password" "Check Password failed, please check detail."',
        '  exit 1',
        'fi',
        'clean',
        'rm -rf $0'
    ];


    // uninstall_porting_log文件
    private UNINSTALL_PORTING_LOG: string[] = ['#!/bin/bash',
        'path=$2',
        'function clean(){',
        '  rm -rf $path/uninstall_porting.sh',
        '  rm -rf $path/uninstall_porting_log.sh',
        '}',
        'function Logger(){',
        '  if [ "Error" == $1 ]; then',
        '    clean',
        '    echo -e "\\e[1;31m`date \'+[%Y-%m-%d %H:%M:%S]\'` [$1] [$2] $3 \\e[0m "',
        '    echo "failed" > $path/.uninstall_porting.step',
        '    echo "The log path is /var/log/messages"',
        '  else',
        '    echo -e "`date \'+[%Y-%m-%d %H:%M:%S]\'` [$1] [$2] $3 "',
        '  fi',
        '  logger -t "devkit-ide" [$1] [$2] $3',
        '}',
        '',
        'workdirectory=$(service gunicorn_port status | grep portadv | awk \'NR==1{print $4}\' | ' +
        'awk -F "/portadv/tools" \'{print $1}\')',
        'if [ ! -d "$workdirectory/portadv" ];then',
        '  Logger Error "UnInstall" "Uninstallation failed because the installation directory is not found."',
        '  exit 2',
        'fi',
        'cd $workdirectory/portadv',
        'bash tools/uninstall.sh',
        'if [ $? != 0 ];then',
        '  Logger Error "UnInstall" "UnInstall package failed, please check detail logs above."',
        '  exit 3',
        'else',
        '  if [ -d "$workdirectory/portadv" ];then',
        '    Logger Error "UnInstall" "UnInstall package failed, please check detail logs above."',
        '    exit 4',
        '  else',
        '    Logger Step "UnInstall" "End to uninstall portadv package successfully."',
        '    echo "success" > $path/.uninstall_porting.step',
        '    exit 0',
        '  fi',
        'fi',
        'rm -rf $0'];


    // upgrade_porting.sh
    private UPGRADE_PORTING: string[] = [
        '#!/bin/bash',
        '# 1.Add x86 and arm judgement.',
        '# 2.Download specific version or get lastet version automatically.',
        '# 3.upgrade',
        'function help_info(){',
        'echo "usage bash deploy_sysperf.sh',
        '      -a arm',
        '      -b x86',
        '      -c key',
        '      -h help infomation"',
        '}',
        '#get opts',
        'while getopts ":a:b:c:h" args',
        'do',
        ' case $args in',
        '    a)',
        '       arm=$OPTARG',
        '       ;;',
        '    b)',
        '       x86=$OPTARG',
        '       ;;',
        '    c)',
        '       key=$OPTARG',
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
        'cd `dirname $0`',
        'path=`pwd`',
        'function Logger(){',
        'if [ "Error" == $1 ]; then',
        'clean',
        'echo -e "\\e[1;31m`date \'+[%Y-%m-%d %H:%M:%S]\'` [$1] [$2] $3 \\e[0m "',
        'echo "failed" > $path/.upgrade_porting.step',
        'echo "The log path is /var/log/messages"',
        'else',
        'echo -e "`date \'+[%Y-%m-%d %H:%M:%S]\'` [$1] [$2] $3 "',
        'fi',
        'logger -t "devkit-ide" [$1] [$2] $3',
        '}',
        'function clean(){',
        'rm -rf $path/upgrade_porting_log.sh',
        'rm -rf $path/upgrade_porting.sh',
        '}',
        'if [ "$USER" != "root" ]; then',
        '  echo -e "\\e[1;31mPlease input your root password to start upgrade:\\e[0m"',
        'fi',
        'su - root -c "bash $path/upgrade_porting_log.sh -a $arm -b $x86 -c $path -d ${key} "$USER""',
        'if [ $? == 1 ];then',
        '  Logger Error "Check Password" "Check Password failed, please check detail."',
        '  exit 1',
        'fi',
    ];


    // upgrade_porting_log文件
    private UPGRADE_PORTING_LOG: string[] = ['#!/bin/bash',
        'function help_info(){',
        '  echo "usage bash write_porting_log.sh',
        '      -a arm',
        '      -b x86',
        '      -c path',
        '      -d key',
        '      -h help infomation"',
        '}',
        '#get opts',
        'while getopts ":a:b:c:d:h" args',
        'do',
        '  case $args in',
        '    a)',
        '       arm=$OPTARG',
        '       ;;',
        '    b)',
        '       x86=$OPTARG',
        '       ;;',
        '    c)',
        '       path=$OPTARG',
        '       ;;',
        '    d)',
        '       key=$OPTARG',
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
        '  esac',
        'done',
        '',
        'function Logger(){',
        '  if [ "Error" == $1 ]; then',
        '    clean',
        '    echo -e "\\e[1;31m`date \'+[%Y-%m-%d %H:%M:%S]\'` [$1] [$2] $3 \\e[0m "',
        '    echo "failed" > $path/.upgrade_porting.step',
        '    echo "The log path is /var/log/messages"',
        '    echo "You can run the following command to delete the portadv package:',
        '    rm -rf $path/*"',
        '  else',
        '    echo -e "`date \'+[%Y-%m-%d %H:%M:%S]\'` [$1] [$2] $3 "',
        '  fi',
        '  logger -t "devkit-ide" [$1] [$2] $3',
        '}',
        '',
        'function clean(){',
        '  rm -rf $path/upgrade_porting.sh',
        '  rm -rf $path/upgrade_porting_log.sh',
        '}',
        '',
        'function port_install(){',
        '  apt install -y $1 2>/dev/null',
        '  if [ $? != 0 ]; then',
        '    yum install -y $1 2>/dev/null',
        '    if [ $? != 0 ]; then',
        '      return 1',
        '    fi',
        '  fi',
        '  return 0',
        '}',
        '',
        'function signature(){',
        '  if [ ! -f "$1" ];then',
        '    Logger Error "Signature" "Signature file is invalid.\n' +
        'KEYS download url is: ${key_url}\nAsc download url is: ${pkg_url}.asc\nYou can download' +
        ' ${pkg_name}.asc and KEYS.txt to save to path $path"',
        '    exit 2',
        '  fi',
        '  command -v gpg',
        '  if [ $? != 0 ];then',
        '    Logger Error "Signature" "You need to install signature tool gpg first."',
        '    exit 2',
        '  fi',
        '  command -v expect',
        '  if [ $? != 0 ]; then',
        '    port_install expect',
        '    if [ $? != 0 ]; then',
        '      Logger Error "Download" "You need to install shell tool expect first."',
        '      exit 2',
        '    fi',
        '  fi',
        '  gpg --import "$path/KEYS.txt"',
        '  gpg --fingerprint',
        '  /usr/bin/expect <<EOF',
        '  set timeout -1',
        '  gpg --edit-key " OpenPGP signature key for Huawei software (created on 30th Dec,2013) " trust',
        '  expect "Your decision?"',
        '  send "5',
        '"',
        '  expect "Do you really want to set this key to ultimate trust? (y/N)"',
        '  send "y',
        '"',
        '  expect "gpg>"',
        '  send "quit',
        '"',
        '  expect eof',
        'EOF',
        '  result=$(gpg --verify "$1")',
        '  if [[ $result =~ "This key is not certified with a trusted signature" ]];then',
        '    Logger Error "Signature" "This key is not certified with a trusted signature."',
        '    exit 2',
        '  elif [[ $result =~ "Good signature" ]];then',
        '    Logger Step "Signature" "Signature passed successfully."',
        '    exit 0',
        '  elif [[ $result =~ "BAD signature" ]];then',
        '    Logger Error "Signature" "Signature failed.please check the completion of package."',
        '    exit 2',
        '  elif [[ $result =~ "Can\'t check signature: public key not found" ]];then',
        '    Logger Error "Signature" "Can\'t check signature: public key not found."',
        '    exit 2',
        '  elif [[ $result =~ "can\'t hash datafile: No data" ]];then',
        '    Logger Error "Signature" "Cannot find the download package.please make sure it is in the same ' +
        'folder with signature file "',
        '    exit 2',
        '  fi',
        '}',
        '#Step1. Check Env',
        'Logger Step "Check Env" "Start to check cpu mode of x86 or arm."',
        'if [[ $(uname -a) =~ "x86" ]]; then',
        '  Logger Step "Check Env" "It is x86 host."',
        '  pkg_url=$x86',
        'else ',
        '  Logger Step "Check Env" "It is arm host."',
        '  pkg_url=$arm',
        'fi',
        'pkg_name=$(echo ${pkg_url} | awk -F "Packages/" \'{print $2}\')',
        'pkg_file=$(echo ${pkg_name} | awk -F ".tar.gz" \'{print $1}\')',
        'curl_url=$(echo ${pkg_url} | awk -F "/Porting" \'{print $1}\')',
        'key_url=$(echo ${key} | sed \'s/%26/\\&/g\')',
        'Logger Step "Check Env" "End to check cpu mode of x86 or arm."',
        '',
        'if [ ! -f "$path/${pkg_name}" ];then',
        '  Logger Step "Check Env" "Start to check network connection"',
        '  curl --help >/dev/null 2>&1',
        '  if [ $? != 0 ]; then',
        '    port_install curl',
        '  fi',
        '  curl -ksSL --connect-timeout 5 -I ${curl_url}',
        '  if [ $? != 0 ];then',
        '    Logger Error "Check Env" "Network issue, please check connection.\nPackage download url is:' +
        '${pkg_url}\n KEYS download url is ${key_url}.\nAsc download url is: ${pkg_url}.asc\nYou can download' +
        ' ${pkg_name}、${pkg_name}.asc and KEYS.txt to save to path $path"',
        '    exit 2',
        '  fi',
        '  Logger Step "Check Env" "End to check network connection successfully."',
        '  Logger Step "Check Env" "Start to check target package url"',
        '  if [[ $(curl -ksSL --connect-timeout 5 -I ${pkg_url}) =~ "404 Not Found" ]];then',
        '    Logger Error "Check Env" "Target url is not exist, please check.\nurl: ${pkg_url}"',
        '    exit 3',
        '  fi',
        '  Logger Step "Check Env" "End to check target package url successfully."',
        '  Logger Step "Download" "Start to download portadv package."',
        '  cd $path && curl "${pkg_url}" -O -f -L --retry 3 --connect-timeout 300',
        '  if [ $? != 0 ];then',
        '    Logger Error "Download" "Download package failed, please check detail."',
        '    clean',
        '    exit 4',
        '  fi',
        '  chmod 000 ${pkg_name}',
        '  Logger Step "Download" "End to download portadv package successfully."',
        '  Logger Step "Download" "Start to download portadv asc."',
        '  curl "${pkg_url}.asc" -O -f -L --retry 3 --connect-timeout 300',
        '  if [ $? != 0 ]; then',
        '    Logger Error "Download" "Download asc failed, please check detail."',
        '    clean',
        '    exit 4',
        '  fi',
        '  Logger Step "Download" "End to download asc successfully."',
        '  Logger Step "Download" "Start to download KEYS."',
        '  curl -s "${key_url}" -o KEYS.txt -f -L --retry 3 --connect-timeout 300',
        '  if [ $? != 0 ]; then',
        '    Logger Error "Download" "Download KEYS failed, please check detail."',
        '    clean',
        '    exit 4',
        '  fi',
        '  Logger Step "Download" "End to download KEYS successfully."',
        'fi',
        'signature $path/${pkg_name}.asc',
        '#Step4. upgrade',
        'Logger Step "upgrade" "Start to upgrade portadv package."',
        'workingDirectory=$(cat /etc/systemd/system/gunicorn_port.service ' +
        '|grep WorkingDirectory= |awk -F \'WorkingDirectory=\' \'{print $2}\')',
        'cd $workingDirectory && cd ../../ && ./upgrade $path/Porting*.tar.gz',
        'if [ $? != 0 ];then',
        '  Logger Error "Upgrade" "Upgrade package failed, please check detail logs above."',
        '  echo "failed" > $path/.upgrade_porting.step',
        '  exit 2',
        'else',
        '  Logger Step "Upgrade" "End to upgrade portadv package successfully."',
        'fi',
        'cd $(service gunicorn_port status | grep portadv | awk \'NR==1{print $4}\' | ' +
        'awk -F "/portadv/tools" \'{print $1}\')',
        'grep listen $(find ./ -name \'nginx_port.conf\') | xargs >> $path/.upgrade_porting.step',
        '',
        '#Step5. clean env',
        'Logger Step "Clean Env" "Start to clean environment."',
        '',
        'echo -n "The portadv package is stored in $path. Are you sure you want to delete it? (y/n. n is default)"',
        'read ack',
        'if [ "y" == "$ack" ] || [ "Y" == "$ack" ]; then',
        '  rm -rf $path/*',
        '  if [ $? != 0 ];then',
        '    Logger Error "Clean Env" "Clean env failed, please check detail."',
        '    clean',
        '    exit 6',
        '  fi',
        '  history -cw',
        'fi',
        '',
        'Logger Step "Clean Env" "End to clean environment successfully."',
        'Logger Step "End" "All steps finished successfully."',
        'echo "success" > $path/.upgrade_porting.step',
        'clean'];

    // ssh支持的加密算法
    private algorithms = vscode.version === '1.52.1'
        ? {
            kex: ['diffie-hellman-group-exchange-sha256'],
            hmac: ['hmac-sha2-512', 'hmac-sha2-256'],
            serverHostKey: ['ecdsa-sha2-nistp256', 'ecdsa-sha2-nistp384', 'ecdsa-sha2-nistp521']
        }
        : {
            kex: ['curve25519-sha256', 'diffie-hellman-group-exchange-sha256'],
            cipher: ['aes256-gcm', 'aes256-gcm@openssh.com', 'aes256-ctr', 'aes192-ctr', 'aes128-ctr'],
            hmac: ['hmac-sha2-512', 'hmac-sha2-256'],
            serverHostKey: ['ecdsa-sha2-nistp256', 'ecdsa-sha2-nistp384', 'ecdsa-sha2-nistp521']
        };

    private conn: Client;
    /**
     * 连接状态
     */
    public status: 'connected' | 'closed' = 'closed';

    public onCloseBefore?: () => Promise<any>;

    /**
     * 检测是否真的存在密码短语
     * @param msg msg
     * @returns 存在返回true
     */
    public checkRealExistPassphrase(msg: any): boolean {
        if (msg.privateKey && msg.privateKey.trim() !== '') {
            const tmpContent = fs.readFileSync(msg.privateKey).toString();
            const hasPassPhrase = msg.passphrase && msg.passphrase.trim() !== '';
            if (!/\bProc-Type:\s*?\d+,\s*?ENCRYPTED\b/.test(tmpContent) && hasPassPhrase) {
                return false;
            }
        }
        return true;
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
            }).connect(server);
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
        server.readyTimeout = 60000;
        server.debug = (data: any) => {
            if (data.search(/password auth failed/) !== -1) {
                callback('USERAUTH_FAILURE');
                callback = () => { };
            } else if (data.search(/publickey auth failed/) !== -1) {
                callback('USERAUTH_FAILURE');
                callback = () => { };
            } else if (data.search(/GLOBAL_REQUEST/) !== -1 || data.search(/USERAUTH_SUCCESS/) !== -1) {
                callback('SUCCESS');
                conn.end();
                callback = () => { };
            }
        };
        try {
            conn.on('ready', () => {});
            conn.on('error', callback);
            conn.on('end', () => {
                conn.end();
            });
            conn.on('close', (hadError: any) => {
                conn.end();
            });
            conn.connect(server);
        } catch (error) {
            callback(error);
        }
    }

    /**
     * 在远端执行command命令
     * @param command 命令
     */
    public exec(command: string) {
        return new Promise((resolve, reject) => {
            this.conn.exec(command, (err, clientChannel) => {
                if (err) { reject(err); }
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

    /**
     * 如果有的话，删除服务器文件
     *
     * @param filePathList 文件路径列表
     * @param retry 重试次数
     */
    public clear(filePathList: Array<string>, retry: number = 1) {
        return new Promise((resolve, reject) => {
            this.conn.sftp((err, sftp) => {
                if (err) { reject(err); }
                const results: Array<{ filePath: string, error: Error | undefined }> = [];
                filePathList.forEach(filePath => {
                    const result = { filePath, error: undefined };
                    results.push(result);
                    for (let i = 0; i < retry; i++) {
                        const r = sftp.unlink(filePath, (unlinkErr: any) => { result.error = unlinkErr; });
                        if (r) { result.error = undefined; return; }
                    }
                });
                resolve(results);
            });
        });
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
                if (err) { reject(err); }
                sftp.mkdir(dirPath, inputAttributes, (mkErr: any) => {
                    if (mkErr) { reject(new Error(`mkdir ${dirPath} err: ${mkErr}`)); }
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
        const options = {mode: '500'};
        return new Promise((resolve, reject) => {
            this.conn.sftp((err, sftp: any) => {
                if (err) { reject(err); }
                sftp.writeFile(remoteFile, shellData, options, (putErr: any, result: any) => {
                    if (putErr) { reject(new Error(`write file ${remoteFile} failed`)); }
                    resolve('success');
                });
            });
        });
    }

    /**
     * 使用tail -f流读取服务器文件
     *
     * @param path 远端文件路径
     * @param listener 数据监听函数
     */
    public tailFlow(path: string, listener: (data: string) => void) {
        return new Promise((resolve, reject) => {
            this.conn
              .exec(`touch ${path} && chmod 600 ${path} && tail -f ${path}`, { pty: true }, (err, clientChannel) => {
                if (err) { reject(err); }
                clientChannel.on('data', (chunk: any) => {
                    resolve('');
                    listener(Buffer.from(chunk).toString());
                });
            });
        });
    }

    private getCurrentFile(localFile: string) {
        if (localFile.search(/deploy_porting/) !== -1) {
            return this.DEPLOY_PORTING;
        } else if (localFile.search(/write_porting/) !== -1) {
            return this.WRITE_PORTING_LOG;
        } else if (localFile.search(/uninstall_porting_log/) !== -1) {
            return this.UNINSTALL_PORTING_LOG;
        } else if (localFile.search(/upgrade_porting_log/) !== -1) {
            return this.UPGRADE_PORTING_LOG;
        } else if (localFile.search(/uninstall_porting/) !== -1) {
            return this.UNINSTALL_PORTING;
        } else if (localFile.search(/upgrade_porting/) !== -1) {
            return this.UPGRADE_PORTING;
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
}

