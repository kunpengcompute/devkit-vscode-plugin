#!/bin/bash
# Compile source code.
# Copyright © Huawei Technologies Co., Ltd. 2010-2020. All rights reserved.
set -e

build_dir=$(cd $(dirname $0); pwd)
root_dir=${build_dir}/..
output_dir=${root_dir}/out
webview_dir=${root_dir}/../../workspace
vsce_dir=${root_dir}/node_modules/.bin/vsce
# 构建结束后改名字，符合公司的命名
tool_name='Kunpeng-DevKit-IDE-porting-advisor-plugin_2.3.3.vsix'

clean()
{
    if [ -d "${output_dir}" ]; then
        rm -rf ${output_dir}
    fi
}

start_info()
{
    echo -e "#################################################"
    echo -e "#           Start building IDE plugin           #"
    echo -e "#################################################"
}

end_info()
{
    echo -e "#################################################"
    echo -e "#          IDE plugin building success          #"
    echo -e "#################################################"
}

build_port()
{
    cd ${webview_dir}
    npm install --unsafe-perm | tee
    npm run build:porting:ide
}

generate_vsix()
{
    cd ${root_dir}
    npm install --unsafe-perm | tee
    echo y | ${vsce_dir} package -o $tool_name
    mv *.vsix ${output_dir}
}

main()
{
    clean
    start_info
    build_port
    generate_vsix
    end_info
}

main
result=$?
exit ${result}
