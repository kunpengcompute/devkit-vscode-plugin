#!/bin/bash
# Compile source code.
# Copyright © Huawei Technologies Co., Ltd. 2010-2020. All rights reserved.
set -e

build_dir=$(cd $(dirname $0); pwd)
root_dir=${build_dir}/..
out_dir=${root_dir}/out
webview_dir=${root_dir}/../../workspace
vsce_dir=${root_dir}/node_modules/.bin/vsce
# 构建结束后名字
tool_name='Kunpeng-DevKit-IDE-hyper-tuner-plugin_23.0.1.vsix'

clean()
{
    if [ -d ${out_dir} ]; then
        rm -rf ${out_dir}/extension
    fi
}


generate_vsix()
{
    cd ${root_dir}
    npm install --legacy-peer-deps --unsafe-perm
    echo y | ${vsce_dir} package -o ${tool_name}
    mv *.vsix ${out_dir}
}

main()
{
    clean
    generate_vsix
}

main
result=$?
exit ${result}
