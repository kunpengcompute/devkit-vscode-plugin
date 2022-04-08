#!/bin/bash
# Compile source code.
# Copyright © Huawei Technologies Co., Ltd. 2010-2020. All rights reserved.
set -e

build_dir=$(cd $(dirname $0); pwd)
root_dir=${build_dir}/..
output_dir=${root_dir}/out
vsce_dir=${root_dir}/node_modules/.bin/vsce
# 构建结束后名称
tool_name='Kunpeng-DevKit-IDE-plugin_2.3.3.vsix'

clean()
{
    if [ -d "${output_dir}" ]; then
        rm -rf ${output_dir}
    fi
}

kunpengplugin_start_info()
{
    echo -e "###############################################################"
    echo -e "#           Start building IDE plugin - kunpengplugin         #"
    echo -e "###############################################################"
}

kunpengplugin_end_info()
{
    echo -e "###############################################################"
    echo -e "#          IDE plugin building success - kunpengplugin        #"
    echo -e "###############################################################"
}

kunpengplugin_generate_vsix()
{
    cd ${root_dir}
    npm install
    echo y |  ${vsce_dir} package -o $tool_name
    mv *.vsix ${output_dir}
}

main()
{
    clean
    kunpengplugin_start_info
    kunpengplugin_generate_vsix
    kunpengplugin_end_info
}

main
result=$?
exit ${result}
