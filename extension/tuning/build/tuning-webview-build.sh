#!/bin/bash
# Copyright Huawei Technologies Co., Ltd. 2010-2018. All rights reserved.
# 编译webview脚本
set -e

build_dir=$(cd $(dirname $0); pwd)
echo -e "\e[1;33m build_dir is ${build_dir}\e[0m"

root_path=${build_dir}/..
echo -e "\e[1;33m root_path is ${root_path}\e[0m"

workspace_path=${build_dir}/../../../workspace
echo -e "\e[1;33m workspace_path is ${workspace_path}\e[0m"

tuning_path=${workspace_path}/tuning
echo -e "\e[1;33m tuning_path is ${tuning_path}\e[0m"

# 兼容intellij，覆盖文件
echo -e "\e[1;32m ************* copy extension to workspace! ************ \e[0m"
cp -rf ${root_path}/app/* ${tuning_path}/app

# 执行打包命令
echo -e "\e[1;32m *******************start build webview! **************** \e[0m"
cd ${workspace_path}
if [ ! -d "node_modules" ];then npm install; fi
npm run build:tuning:ide

echo -e "\e[1;32m *******************Start zip tuning files! ************* \e[0m"
rm  -rf ${root_path}/../out/
mkdir ${root_path}/../out/ 
mkdir ${root_path}/../out/tuning
mkdir ${root_path}/../out/tuning/sys
mkdir ${root_path}/../out/tuning/java


cp -rf ${root_path}/out/sysperfanalysis/* ${root_path}/../out/tuning/sys
cp -rf ${root_path}/out/sysperfanalysis/* ${root_path}/../out/tuning/sys
echo ${root_path}/../out/tuning/sys
cd ${root_path}/../out
zip -r tuning.zip tuning
echo -e "\e[1;32m *********Finish build vscode-webview to Intellj********* \e[0m"