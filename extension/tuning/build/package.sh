#!/bin/bash
# Compile source code.
# Copyright © Huawei Technologies Co., Ltd. 2010-2020. All rights reserved.
set -e

build_dir=$(cd $(dirname $0); pwd)
root_dir=${build_dir}/..
out_dir=${root_dir}/out
webview_dir=${root_dir}/../../workspace
vsce_dir=${root_dir}/node_modules/.bin/vsce
# 请更换成自己对应的idea中resources/webview路径
idea_dir=/Users/cpk/IdeaProjects/new-devkit-intellij-plugin/hypertuner/src/main/resources/webview/
# 构建结束后名字
tool_name='Kunpeng-DevKit-IDE-hyper-tuner-plugin_2.3.5.vsix'

clean()
{
    if [ -d "${out_dir}" ]; then
        rm -rf ${out_dir}/extension
    fi
}

start_info()
{
    echo -e "###############################################################"
    echo -e "#           Start building IDE plugin - perfadvisor           #"
    echo -e "###############################################################"
}

end_info()
{
    echo -e "###############################################################"
    echo -e "#          IDE plugin building success - perfadvisor          #"
    echo -e "###############################################################"
}

build_sys_java()
{
  cd ${webview_dir}
  npm install --legacy-peer-deps --unsafe-perm 
  npm run build:tuning:ide & wait
}

generate_vsix()
{
    cd ${root_dir}
    npm install --legacy-peer-deps --unsafe-perm
    echo y | ${vsce_dir} package -o $tool_name
    mv *.vsix ${out_dir}
}

zip_move_idea_dir()
{
    cd ${root_dir}
    mv out tuning
    rm -rf tuning.zip
    zip -r tuning.zip tuning
    cp -rf tuning.zip ${idea_dir}
    mv tuning out
}

main()
{
    clean
    start_info
    build_sys_java
    zip_move_idea_dir
    end_info
}

main
result=$?
exit ${result}
