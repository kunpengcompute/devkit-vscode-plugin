#!/bin/bash
# Compile source code.
# Copyright © Huawei Technologies Co., Ltd. 2010-2020. All rights reserved.
set -e

build_dir=$(cd $(dirname $0); pwd)
root_dir=${build_dir}/..
output_dir=${root_dir}/out
webview_dir=${root_dir}

clean()
{
    if [ -d "${output_dir}" ]; then
        rm -rf ${output_dir}
    fi
}

start_info()
{
    echo -e "#################################################"
    echo -e "#           Start building Web plugin           #"
    echo -e "#################################################"
}

end_info()
{
    echo -e "#################################################"
    echo -e "#          Web plugin building success          #"
    echo -e "#################################################"
}

build_port()
{
    cd ${webview_dir}
    npm install | tee
    npm run build:porting:web
}

generate_zip()
{
    cd ${root_dir}
    node build/porting_zip.js
}

main()
{
    clean
    start_info
    build_port
    generate_zip
    end_info
}

main
result=$?
exit ${result}
