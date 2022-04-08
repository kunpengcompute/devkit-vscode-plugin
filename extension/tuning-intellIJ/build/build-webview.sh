#!/bin/bash
# Copyright Huawei Technologies Co., Ltd. 2010-2018. All rights reserved.
# 编译webview脚本
set -e

build_dir=$(cd $(dirname $0); pwd)
root_path=${build_dir}/..
workspace_path=${build_dir}/../../../workspace
sys_path=${workspace_path}/projects/sys
java_path=${workspace_path}/projects/java

echo "************* copy src-ide to src-intellij ************"
cp -rf ${root_path}/sys/* ${sys_path}/src-ide
cp -rf ${root_path}/java/* ${java_path}/src-ide
echo "*******************start build webview!****************"
cd ${workspace_path}
if [ ! -d "node_modules" ];then npm install; fi
npm run build:sys:ide
npm run build:java:ide

echo "*******************Start zip tuning files*************"
mkdir ${root_path}/out/
mkdir ${root_path}/out/tuning
mkdir ${root_path}/out/tuning/sys
mkdir ${root_path}/out/tuning/java
cp -rf ${root_path}/../perfadvisor/out/sysperfanalysis/* ${root_path}/out/tuning/sys
cp -rf ${root_path}/../perfadvisor/out/javaperfanalysis/* ${root_path}/out/tuning/java
cd ${root_path}/out
zip -r tuning.zip tuning
echo "*********Finish build vscode-webview to Intellj*********"