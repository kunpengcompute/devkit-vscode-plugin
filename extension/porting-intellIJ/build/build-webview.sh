#!/bin/bash
# Copyright Huawei Technologies Co., Ltd. 2010-2018. All rights reserved.
# 编译webview脚本
set -e

build_dir=$(cd $(dirname $0); pwd)
root_path=${build_dir}/..
workspace_path=${build_dir}/../../../workspace
porting_path=${workspace_path}/projects/porting

echo "************* copy src-ide to src-intellij ************"
rm -rf ${porting_path}/src-intellij
cp -r ${porting_path}/src-ide ${porting_path}/src-intellij
cp -rf ${root_path}/src/* ${porting_path}/src-intellij

echo "*******************start build webview!****************"
cd ${workspace_path}
if [ ! -d "node_modules" ];then npm install; fi
npm run build:porting:intellij
rm -rf ${porting_path}/src-intellij

echo "*******************Start zip porting files*************"
cp -rf ${root_path}/report_temp/* ${root_path}/out/porting
cp -rf ${root_path}/ttf/* ${root_path}/out/porting
cd ${root_path}/out
zip -r porting.zip porting
echo "*********Finish build vscode-webview to Intellj*********"

