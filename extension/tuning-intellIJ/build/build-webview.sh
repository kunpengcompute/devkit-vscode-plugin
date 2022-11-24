#!/bin/bash
# Copyright Huawei Technologies Co., Ltd. 2010-2018. All rights reserved.
# 编译webview脚本
set -e

build_dir=$(cd $(dirname $0); pwd)
root_path=${build_dir}/..
workspace_path=${build_dir}/../../../workspace

echo "************* copy src-ide to src-intellij ************"
cp -rf ${root_path}/tuning/* ${workspace_path}/tuning
echo "*******************start build webview!****************"
cd ${workspace_path}
if [ ! -d "node_modules" ];then npm install; fi
npm run build:tuning:ide & wait

echo "*******************Start zip tuning files*************"
if [ -d "${root_path}/out/" ]; then
  rm -rf ${root_path}/out/
fi
mkdir ${root_path}/out/
mkdir ${root_path}/out/tuning/
cp -rf ${root_path}/../tuning/out/* ${root_path}/out/tuning
cd ${root_path}/out
mv ${root_path}/out/tuning/sysperfanalysis ${root_path}/out/tuning/sys
rm -rf tuning.zip
zip -r tuning.zip tuning
echo "*********Finish build vscode-webview to Intellj*********"