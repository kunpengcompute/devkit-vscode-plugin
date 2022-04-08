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

import { I18nService } from './i18nservice';
import * as vscode from 'vscode';
import { Report } from './report';
/**
 * Dependency 报告html获取类
 */
export class DepReport extends Report {
    private scanInfo: any = {
        item1: {
            package: {
                label: '',
                value: []
            },
            software: {
                label: '',
                value: []
            },
        },
    };
    // 是否展示预估人力
    private showHumanFlag = false;

    private depArgs: any = {
        package: {
            title: 'Analyze Software Installation Package',
            label: 'Installation Package Path',
            value: []
        },
        path: {
            title: 'Analyze Software Installation Path',
            label: 'Software Installation Path',
            value: []
        },

        softwareCode: {
            item2Arr: ['target_os', 'target_system_kernel_version'],
            title: 'Analyze Software Source Code',
            item2: {
                target_os: {
                    label: '',
                    value: ''
                },
                target_system_kernel_version: {
                    label: '',
                    value: ''
                }
            }
        }
    };
    public scanCNeedTrans = 0;
    public humanBudget = '';
    public humanBudgetNum = 0;
    public isOpen = false;
    public enWidth = '';
    // 计算工作量预估标准
    public humanStandard: any;

    public binLevel = {
        level0: '0',
        level3: '3',
        level6: '6'
    };

    public soFileList: any[] = [];
    public binDetailSrcData: any[] = [];
    /**
     * 扫描参数相关信息处理
     *
     * @param resp 报告详情
     */
    private setDepArgs(resp: any) {
        const contentObj = JSON.parse(resp.data.content);
        contentObj.installation_package_path.path.forEach((path: any) => {
            this.depArgs.package.value.push(path);
        });
        contentObj.software_installation_path.path.forEach((path: any) => {
            this.depArgs.path.value.push(path);
        });

        this.depArgs.softwareCode.item2.target_os.value = contentObj.target_os
            === 'centos7.6' ? 'CentOS 7.6' : contentObj.target_os;
        this.depArgs.softwareCode.item2.target_system_kernel_version.value = contentObj.target_system_kernel_version;

        this.depArgs.softwareCode.item2.target_os.label = this.i18n.common_term_ipt_label.target_os;
        this.depArgs.softwareCode.item2.target_system_kernel_version.label = this.i18n.common_term_ipt_label.target_system_kernel_version;
    }
    /**
     * 设置scaninfo
     */
    private setScanInfo() {
        this.scanInfo.item1.package.value = this.depArgs.package.value;
        this.scanInfo.item1.software.value = this.depArgs.path.value;

        this.scanInfo.item1.package.lable = this.i18n.common_term_ipt_label.package;
        this.scanInfo.item1.software.label = this.i18n.common_term_ipt_label.path;
    }

    /**
     * 处理binDetailSrcData
     *
     * @param resp 报告详情
     */
    private setBinDetailSrcData(resp: any) {
        let binDetailList: any = [];
        const obj = {};
        const contentObj = JSON.parse(resp.data.content);
        for (const pkg of contentObj.dependency_packages) {
            for (const key of Object.keys(pkg.porting_level)) {
                if (pkg.porting_level[key].amount) {
                    // 对数据进行合并处理
                    if (!obj[key]) {
                        obj[key] = pkg.porting_level[key];
                    } else {
                        obj[key].amount += pkg.porting_level[key].amount;
                        obj[key].bin_detail_info = obj[key].bin_detail_info.concat(
                            pkg.porting_level[key].bin_detail_info
                        );
                    }
                }
            }
        }

        let arr: Array<any> = [];
        for (const key of Object.keys(obj)) {
            this.soFilesTotal += obj[key].amount; // 依赖文件总数
            if (Number(key) === 2 || Number(key) === 5) {
                this.soFilesNeed += obj[key].amount; // 待验证替换
            }
            obj[key].bin_detail_info.forEach((item: any) => {
                item.level = String(key);
            });
            arr = arr.concat(obj[key].bin_detail_info);
        }
        binDetailList = arr;
        binDetailList.forEach((detail: any) => {
            this.soFileList.push(detail.libname);
        });

        this.getBinDetailList(binDetailList);
    }

    /**
     * 处理列表需要展示的数据
     */
    public getBinDetailList(binDetailList: any[]) {
        let noPathDesc = '';
        const list: Array<any> = [];
        binDetailList.forEach((item: any, index: number) => {
            noPathDesc = I18nService.I18nReplace(this.i18n.common_term_runlib, { 0: this.formatSoFileType(item.type) });
            let isAarch64 = false;
            if (item.hasOwnProperty('is_aarch64')) {
              isAarch64 = item.is_aarch64;
            }
            list.push({
                number: index + 1,
                level: item.level,
                name: item.libname,
                path: item.path || noPathDesc,
                urlName: item.url ? this.handelDownloadUrl(item.url) : '--',
                oper: this.formatSoSuggestion(item.level),
                result: this.formatSoResult(item.level),
                url: item.url,
                path_ext: item.path_ext,
                showSub: false, // 是否显示子内容
                type: this.formatSoFileType(item.type),
                so_info: item.so_info,
                isAarch64
            });
        });

        list.forEach((item: any) => {
            if (!item.url) {  // jar包没有下载链接
                if (item.so_info && item.so_info.length) {  // 有子路径
                    const soInfo = [];

                    // 查看子路径是否有下载链接
                    for (const [pathName, pathUrl] of item.so_info) {
                        if (pathUrl) {
                            item.soFileHasUrl = true;  // 存在.so文件有下载链接或返回包名
                            break;
                        }
                    }

                    for (const [pathName, pathUrl] of item.so_info) {
                        let soObj: {
                            path: string  // 路径
                            urlName: string,  // 待下载的软件包名称
                            oper: string,  // 分析结果
                            result: string,  // 处理建议
                            url: string,  // 下载url
                        };
                        if (pathUrl) {  // 子路径有下载链接或返回包名
                            if (pathUrl.includes('http')) {  // 是下载链接
                                soObj = {
                                    path: pathName,
                                    urlName: this.handelDownloadUrl(pathUrl),
                                    oper: this.formatSoSuggestion('0'),
                                    result: this.formatSoResult('0'),
                                    url: pathUrl,
                                };
                            } else {  // 返回的包名
                                soObj = {
                                    path: pathName,
                                    urlName: pathUrl,
                                    oper: this.formatSoSuggestion(item.level),
                                    result: '--',
                                    url: '',
                                };
                            }
                        } else {  // 子路径没有下载链接或没有返回包名
                            soObj = {
                                path: pathName,
                                urlName: '--',
                                oper: this.formatSoSuggestion(item.level),
                                result: this.formatSoResult(item.level),
                                url: '',
                            };
                        }
                        soInfo.push(soObj);
                    }
                    item.soInfoList = soInfo;  // 子路径数组对象
                }
            } else {  // jar包有下载链接
                if (item.path_ext.length) {  // 有子路径
                    const pathList: any[] = [];
                    item.path_ext.forEach((path: string) => {
                        pathList.push({
                            path
                        });
                    });
                    item.soInfoList = pathList;
                }
            }
        });
        this.binDetailSrcData = this.linePortingLevel(list);
        // 先把要合并的数据处理好再下载
        this.binDetailSrcData.forEach(item => {
            if (item.soFileHasUrl) {
                this.mergeSoInfoList(item.soInfoList, ['urlName', 'oper', 'result']);
            }
        });
    }

    /**
     * 对下载url进行切割
     * @param url 返回的链接或包名
     * @returns string
     */
    public handelDownloadUrl(url: string): string {
        if (url.lastIndexOf('/') > -1) {
            const lastIndex = url.lastIndexOf('/');
            return url.slice(lastIndex + 1);
        } else {
            return url;
        }

    }

    /**
     * 对表格进行行合并处理
     * @param list 表格数据
     */
    public linePortingLevel(list: Array<any>): Array<any> {
        let rowSpan = 1;
        list[0] = Object.assign(list[0], { rowSpan, showTd: true });
        list.reduce((pre, cur) => {
            if (pre.url === cur.url && pre.oper === cur.oper && pre.result === cur.result
                && !pre.soFileHasUrl && !cur.soFileHasUrl) {
                rowSpan++;
                pre = Object.assign(pre, { rowSpan, showTd: true });
                cur = Object.assign(cur, { rowSpan: 1, showTd: false });
                return pre;
            } else {
                rowSpan = 1;
                cur = Object.assign(cur, { rowSpan, showTd: true });
                return cur;
            }
        });
        return list;
    }

    /**
     * 对表格jar子路径进行行合并处理
     * @param list 表格jar子路径数据
     * @param cols 需要合并的项
     */
    public mergeSoInfoList(list: Array<any>, cols: Array<string>): Array<any> {
        list.forEach(item => {
            item.mergeRowSpan = {};  // 保存合并项合并的行数
            item.showTd = {};  // 合并的字段是否显示
        });
        cols.forEach(key => {
            let rowSpan = 1;
            list[0].mergeRowSpan[key] = 1;
            list[0].showTd[key] = true;
            list.reduce((pre, cur) => {
                if (key === 'result') {
                    if (pre.urlName === cur.urlName) {  // 判断包名
                        rowSpan++;
                        pre.mergeRowSpan[key] = rowSpan;
                        pre.showTd[key] = true;
                        cur.mergeRowSpan[key] = 1;
                        cur.showTd[key] = false;
                        return pre;
                    } else {
                        rowSpan = 1;
                        cur.mergeRowSpan[key] = rowSpan;
                        cur.showTd[key] = true;
                        return cur;
                    }
                } else {
                    if (pre[key] === cur[key]) {  // 合并key相同的项
                        rowSpan++;
                        pre.mergeRowSpan[key] = rowSpan;
                        pre.showTd[key] = true;
                        cur.mergeRowSpan[key] = 1;
                        cur.showTd[key] = false;
                        return pre;
                    } else {
                        rowSpan = 1;
                        cur.mergeRowSpan[key] = rowSpan;
                        cur.showTd[key] = true;
                        return cur;
                    }
                }
            });
        });
        return list;
    }

    /**
     * 获取html报告的内容
     *
     * @param resp 掉用后端下载接口的返回
     * @param context 插件上下文
     * @param label 报告的创建时间
     */
    public getReportHtml(resp: any, context: vscode.ExtensionContext, label: string): string | undefined {

        // 从插件上下文中获取插件安装路径，并通过反斜杠替换避免字符串转义问题
        this.extensionPath = context.extensionPath.replace(/\\/g, '/');

        if (resp.status === 0 && resp.data) {

            this.setDepArgs(resp);

            this.setScanInfo();

            this.setBinDetailSrcData(resp);

            this.setScanItemsObj(resp);

            return this.getHtmlTemplate(label);
        }

        return undefined;
    }

    /**
     * 将相关信息存储到ScanItemsObj
     *
     * @param resp 报告详情
     */
    private setScanItemsObj(resp: any) {
        const contentObj = JSON.parse(resp.data.content);

        this.scanItemsObj.soFile.content = this.soFilesNeed;
        let hasDetailFlag;
        for (const element of contentObj.dependency_packages) {
            hasDetailFlag = element.porting_level[0].amount;
        }
        this.scanItemsObj.soFile.hasDetail = this.soFilesNeed + hasDetailFlag > 0;
        this.scanItemsObj.soFile.files = this.soFileList;

        const soFilesNeedNum = 1;
        if (this.soFilesNeed === soFilesNeedNum) {
            this.scanItemsObj.soFile.content = I18nService.I18nReplace(this.i18n.common_term_report_soFile_dependent2, {
                0: this.soFilesTotal,
                1: this.soFilesNeed
            });
        } else {
            this.scanItemsObj.soFile.content = I18nService.I18nReplace(this.i18n.common_term_report_soFile_dependent, {
                0: this.soFilesTotal,
                1: this.soFilesNeed
            });
        }
    }

    /**
     * 根据html模板將报告内容填入报告中
     *
     * @param label 报告创建时间
     */
    private getHtmlTemplate(label: string): string {

        this.scanItems.forEach(scanItem => {
            this.scanItemsObj[scanItem].label = this.i18n[`common_term_result_${scanItem}`];
        });

        // 扫描路径
        const path: string = this.setPath();

        // 扫描参数
        const args = this.getArgs(path);

        // 扫描报告中除扫描参数剩余的报告块
        const scanTemp = this.getScanTemp();

        // 最终返回的模板
        const template = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="X-UA-Compatible" content="ie=edge">
            <title>Document</title>
            <style>
            *{
              margin: 0;
              padding: 0;
            }

            table{
              border-collapse: collapse;
              width: 100%;
              font-size: 14px;
            }

            th,td{
              min-width: 100px;
            }

            th{
              padding-top: 5px;
              padding-bottom: 5px;
            }

            td{
              padding:0px 10px;
            }

            tr{
              height: 32px;
            }

            .ext_more span{
              margin-left: 64px!important;
              width: calc(100% - 64px)!important;
            }

            .line{
              border-left: 2px solid #ffffff;
            }

            .project-detail {
              flex: 5;
            }

            .config-list-table {
              display: flex;
              flex-direction: column;
            }

            .item-child-container {
              display: flex;
              justify-content: flex-start;
              margin-bottom: 20px;
            }

            .item-label {
              color: #6C7280;
              width: 200px;
            }

            .item-content {
			  font-size: 14px;
              margin-left: 30px;
              height: 20px;
              font-size: 14px;
              display: inline-block;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              width: 260px;
              flex:1;
            }

            .page-container {
              height: 100%;
              min-width: 1366px;
              min-height: 768px;
              overflow: hidden;
              padding: 40px 0px 0px;
            }

            .items-detail-container {
              max-height: 500px;
              overflow: auto;
            }
            .project-result{
              flex: 5;
              display: flex;
              justify-content: flex-end;
            }

            .block-data {
              display: flex;
              justify-content: center;
              padding-top: 20px;
              position: relative;
            }

            .block-data p {
              color: #222222;
              font-size: 64px;
            }

            .block-data div {
              position: absolute;
              bottom: 10px;
              width: 500%;
              right: 0px;
              font-size: 14px;
              color: #6c7280;
              text-align: end;
            }

            .block-data span {
              line-height: 121px;
              color: #666666;
              font-size: 14px;
            }

            .detail-title {
              color: #282b33;
              font-size: 1.25rem;
              flex: 2;
              line-height: 56px;
            }

            .path_more {
              vertical-align: unset;
              margin-left: 8px;
            }

            .ext_more {
              position: relative;
            }

            .ext_more span,
            .ext_more p {
              margin-left: 64px;
            }

            .line {
              margin-top: 6px;
              margin-bottom: 16px;
              border-top: 1px solid #e1e6ee;
            }

            .cursor-default {
                cursor: default;
            }
            .p-relative {
                position: relative;
            }
            .border-color {
                border-bottom: 1px solid #E6EBF5;
            }
            .border-right-color {
                border-right: 1px solid #E6EBF5;
            }
            .ellispis {
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            .setting-left {
                float: left;
                width: 50%;
            }
            .setting-left span,
            .setting-left div {
                height: 18px;
                font-size: 14px;
                line-height: 18px;
            }
            .setting-left-item {
                display: flex;
                justify-content: flex-start;
                margin-bottom: 20px;
            }
            .setting-left-item span:first-child{
                width: 200px;
                margin-right: 10px;
                color: #6C7280;
            }
            .setting-left-item span:last-child{
                width: 370px;
                color: #222;
            }

            .setting-right {
                float: right;
                width: 50%;
                height: 84px;
                display: flex;
                justify-content: flex-end;
            }
            .setting-right-item {
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                align-items: center;
                margin-left: 14px;
                position: relative;
            }
            .setting-right-item:last-child {
                border-left: 2px solid #E1E6EE;
            }
            .setting-right-item p {
                margin: 0;
            }
            .setting-right-item p:first-child{
                font-size: 16px;
                height: 24px;
                padding: 0 40px;
                line-height: 24px;
                color: #979797;
                text-align: center;
                white-space: nowrap;
            }
            .setting-right-item p:nth-child(2){
                font-size: 48px;
                color: #222;
            }
            .thead-tr {
                padding: 0 10px;
                border-left: none;
                background:#f5f9ff;
                font-size: 14px;
                color:#333;
                font-weight: 400;
                line-height: 24px;
            }
            .table-container {
                line-height: 56px;
            }
            .detail-label {
                display:inline-block;
                width: 350px;
                font-size: 20px;
                color: #282b33;
            }
            .path_more{
                position: absolute;
                top: 40%;
                width: 16px;
                height: 16px;
                transform: translateY(-50%) rotateZ(-90deg);
                cursor: pointer;
                left: 0;
            }
            .no-border {
                display: flex;
                padding: 0 !important;
                border-bottom: none !important;
            }
            .no-border div:first-child {
                box-sizing: border-box;
                width: 28px;
            }
            .table{
                table-layout: fixed;
            }
            .real-table {
                border-spacing: 0;
            }
            table {
                width: 100%;
            }
            tbody td {
                position: relative;
            }
            .table-header {
              padding: 0 10px;
              border-left: none;
              background:#f5f9ff;
              color:#333;
              font-size: 14px;
              font-weight: 400;
            }
            .table-header > th {
              box-sizing: border-box;
              padding-left: 10px;
            }
            td span {
                box-sizing: border-box;
                display: inline-block;
                width: 100%;
                padding-left: 10px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            td > span {
              padding-top: 5px
            }
            .ti3-table-nodata > td {
                height: 160px!important;
                background: url(${this.extensionPath.concat('/src/extension/assets/report/nodata.png')}) 50% 25px no-repeat !important;
            }
            .copy-link {
                position: relative;
                display: inline;
                margin-left: 16px;
                color: #0067FF;
                cursor: pointer;
            }
            .copy-link:hover,
                a:hover {
                color: #267DFF;
            }
            .copy-link::before {
                display: inline-block;
                position: absolute;
                top: 50%;
                left: -8px;
                content: '';
                width: 1px;
                height: 12px;
                margin-top: -6px;
                background-color: #E1E6EE;
            }
            .copy-inp {
                position: absolute;
                top: 0;
                left: 0;
                z-index: -666;
                opacity: 0;
            }
            .cursor-link {
                color: #0067FF;
                cursor: pointer;
            }
            .page-title {
              font-size: 20px;
              color: #282b33;
              margin-bottom: 24px;
              font-weight: normal;
              line-height: 1;
            }

            .project-parms {
              display: flex;
              margin-bottom: 20px;
            }

            </style>
        </head>
        <body style="padding: 0 80px">
        <div class="page-container">
        <h1 style="text-align: center;font-weight:normal;font-size: 1.5rem; border-bottom: solid 1px #222;
        padding-bottom: 20px; margin-bottom: 20px;">${label}</h1>
        ${args}
        ${scanTemp}
      </div>
      <script>
          // 点击下载
          function downloadSoFile(url) {
            const a = document.createElement('a');
            a.setAttribute('href', url);
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          }
          // 点击复制下载链接
          function onCopyLink(url, select, index) {
            const aLink = document.querySelector('.link' + index);
            aLink.style.color = '#0057D9';
            const aInp = document.querySelector(select);
            aInp.value = url;
            aInp.select();
            document.execCommand('copy', false, null); // 执行浏览器复制命令
          }
          // 点击复制.so下载链接
          function onCopySonLink(url, select, index) {
            const aLink = document.querySelector('.sonlink' + index);
            aLink.style.color = '#0057D9';
            const aInp = document.querySelector(select);
            aInp.value = url;
            aInp.select();
            document.execCommand('copy', false, null); // 执行浏览器复制命令
          }
          // 设置 title 属性
          function setTitle() {
            var tdList = document.querySelectorAll('.content');
            tdList = Array.prototype.slice.call(tdList);
            for (let i = 0; i < tdList.length; i++) {
              const td = tdList[i];
              td.removeAttribute('title');
              if (td.clientWidth < td.scrollWidth) {
                td.setAttribute('title', td.innerText);
              }
            }
          }
          // 展开详情
          function openDetail(index, num, showTd) {
            let moreIcon = document.getElementsByClassName("path_more");
            let extArr = document.querySelectorAll('.ext' + index);
            let subPathCount = 0;
            for (let i = 0, len = extArr.length; i < len; i++) {
              const element = extArr[i];
              if (element.style.display === "none") {
                element.style.display = "";
                moreIcon[index].style.transform = "translateY(-50%)";
                subPathCount = extArr.length;
              } else {
                element.style.display = "none";
                moreIcon[index].style.transform = "translateY(-50%) rotateZ(-90deg)";
                subPathCount = -extArr.length;
              }
            }

            if (num === null) return;

            // 进行行合并处理
            num--;
            var rowspan = document.querySelectorAll('.rowspan'+ num);
            let bool = false;
            for (let i = 0; i < 3; i++) {
              // 是否为第一个合并项
              if (JSON.parse(showTd)) {
                let rowLen = Number(rowspan[i].getAttribute('rowspan'));
                rowLen += subPathCount;
                rowspan[i].setAttribute('rowspan', rowLen);
              } else {
                // 是否和上一个 tr 为合并项
                bool = true;
                break;
              }
            }

            if (bool) {
              beforeToggle(num, subPathCount);
            }
          }
          // 点击的不是第一个合并项 对行合并进行相关处理
          function beforeToggle(num, subPathCount) {
            num--;
            while (num >= 0) {
              let newspan = document.querySelectorAll('.rowspan'+ num);
              if(JSON.parse(newspan[0].getAttribute('showtd'))) {
                for (let i = 0; i < 3; i++) {
                  let rowLen = Number(newspan[i].getAttribute('rowspan'));
                  rowLen += subPathCount;
                  newspan[i].setAttribute('rowspan', rowLen);
                }
                return;
              }
              num--;
            }
          }

          // .so文件有下载链接展开详情
          function openSoDetail(index) {

            let moreIcon = document.getElementsByClassName("path_more");
            let extArr = document.querySelectorAll('.ext' + index);
            for (let i = 0, len = extArr.length; i < len; i++) {
              const element = extArr[i];
              if (element.style.display === "none") {
                element.style.display = "";
                moreIcon[index].style.transform = "translateY(-50%)";
              } else {
                element.style.display = "none";
                moreIcon[index].style.transform = "translateY(-50%) rotateZ(-90deg)";
              }
            }

            let sontrtds = document.querySelectorAll('.sonRowSpan' + index);
            let tdList = Array.prototype.slice.call(sontrtds);
            for (let i = 0; i < tdList.length; i++) {
                const td = tdList[i];
                if (JSON.parse(td.getAttribute('showtd'))) {
                    td.style.display = '';
                } else {
                    td.style.display = 'none';
                }
            }
          }

          window.onload = function(){
            setTitle();
          }
          window.onresize = function() {
            setTitle();
          }
        </script>
      </body>
      </html>
      `;
        return template;
    }

    /**
     * 设置模板中需要的path字段
     */
    private setPath(): string {
        let packageStr = '';
        let softwareStr = '';

        this.scanInfo.item1.package.value.forEach((path: any) => {
            packageStr += `${path}, `;
        });
        packageStr = packageStr.substring(0, packageStr.lastIndexOf(','));
        this.scanInfo.item1.software.value.forEach((path: any) => {
            softwareStr += `${path}`;
        });
        let nonePack = 'flex';
        let noneSoft = 'flex';

        if (!packageStr) {
            nonePack = 'none';
        }
        if (!softwareStr) {
            noneSoft = 'none';
        }
        return `<div class="item-child-container" style="display: ${nonePack}">
        <div class="item-label"> ${this.scanInfo.item1.package.lable}</div>
        <div class="item-content" title="${packageStr}">${packageStr}</div>
      </div>
      <div class="item-child-container" style="display: ${noneSoft}">
        <div class="item-label">${this.scanInfo.item1.software.label}</div>
        <div class="item-content" title="${packageStr}">${softwareStr}</div>
      </div>`;
    }
    /**
     * 扫描参数
     *
     * @param path 扫描路径
     */
    private getArgs(path: string): string {
        let humanFlag = 'flex';
        if (!this.showHumanFlag) {
            humanFlag = 'none';
        }
        const args = `
        <h1 class="page-title">${ this.i18n.common_term_setting_infor }</h1>
        <div class="project-parms">
          <div class="project-detail">
            <div class="config-list-table">
            ${path}
            <div class="item-child-container">
                <div class="item-label">${this.depArgs.softwareCode.item2.target_os.label}</div>
                <div class="item-content">${this.depArgs.softwareCode.item2.target_os.value}</div>
            </div>
            <div class="item-child-container">
                <div class="item-label">${this.depArgs.softwareCode.item2.target_system_kernel_version.label}</div>
                <div class="item-content">${this.depArgs.softwareCode.item2.target_system_kernel_version.value}
                </div>
              </div>
            </div>
          </div>
        <div class="project-result">
        <div class="setting-right" >
        <div class="setting-right-item">
          <p>${this.i18n.common_term_report_right_info2}</p>
          <p>${this.soFilesTotal - this.soFilesNeed}</p>
        </div>
        <div class="setting-right-item">
          <p>${this.i18n.common_term_report_right_info3}</p>
          <p>${this.soFilesNeed}</p>
        </div>
        <div class="setting-right-item">
          <p>${this.i18n.common_term_report_right_info}</p>
          <p>${this.soFilesTotal}</p>
        </div>
      </div>
    </div>
      </div>
      `;
        return args;
    }

    /**
     * 获取scantemp
     */
    private getScanTemp(): string {
        const showStyle = 'display: inline-block';
        const hideStyle = 'display: none';
        let scanTemp = '';
        this.scanItems.forEach((item) => {
            let isShowDetailIcon = showStyle;
            if (!this.scanItemsObj[item].hasDetail) {
                isShowDetailIcon = hideStyle;
            }
            // 处理依赖库文件
            scanTemp += this.handleSoFile(item);
        });
        return scanTemp;
    }

    /**
     * 处理需要迁移的依赖库
     *
     * @param item 依赖库文件
     */
    private handleSoFile(item: string): string {
        let itemFile = '';
        let fileListCon = '';
        let scanTemp = '';

        if (item === 'soFile') {
            let count = -1;
            let isPathExt = false;
            let soFoilePadding = '';
            soFoilePadding = this.binDetailSrcData.length > 14
                  ? 'padding-right: 20px;'
                  : '';
            for (const row of this.binDetailSrcData) {
              if (row.path_ext.length) {
                isPathExt = true;
                break;
              }
            }
            if (this.binDetailSrcData.length !== 0) {
                let rowSpan = 0;
                this.binDetailSrcData.forEach((bin: any, index: number) => {
                    const EXT_LENGTH = bin.path_ext.length;
                    let optionstr = '';
                    const aarch64 = bin.hasOwnProperty('isAarch64') ? bin.isAarch64 : false;
                    if (bin.urlName === '--') {
                        if (aarch64 && (bin.level === '0' || bin.level === '3' || bin.level === '6')) {
                            optionstr = `<span>--</span>`;
                        } else {
                            optionstr = `<span class="content">${bin.result}</span>`;
                        }
                    } else if (bin.urlName === bin.url) {  // 返回包名
                        optionstr = `
                        <span class="content">${this.i18n.common_term_upload_unable}</span>
                    `;
                    } else {
                        optionstr = `
                      <span class="ellispis">
                        <a onclick="downloadSoFile('${bin.url}')"
                        style="color: #0067ff;text-transform: capitalize;">${bin.result}</a>
                        <span class="copy-link link${index}" onclick="onCopyLink('${bin.url}', '.copy-inp', ${index})">
                        ${this.i18n.common_term_report_detail.copyLink}</span>
                        <input class="copy-inp" />
                      </span>
                    `;
                        if (aarch64) {
                            optionstr += `<span class="ellispis">${ this.i18n.common_kunpeng_platform_compatible }</span>`;
                        }
                    }

                    let imgTd = '<td class="border-color"></td>';
                    let itemfileMiddle = '';
                    let subFile = '';
                    if (rowSpan > 1) {
                        itemfileMiddle = `
                      <td class="rowspan${index}" rowspan="${bin.rowSpan}" showtd="${bin.showTd}"></td>
                      <td class="border-color rowspan${index}" rowspan="${bin.rowSpan}"></td>
                      <td class="p-relative border-color rowspan${index}" rowspan="${bin.rowSpan}"></td>
                    `;
                        rowSpan--;
                    } else {
                        itemfileMiddle += `
                      <td class="border-color border-right-color rowspan${index}" rowspan="${bin.rowSpan}" showtd="${bin.showTd}">
                        <span class="content">${bin.urlName}</span>
                      </td>
                      <td class="border-color border-right-color rowspan${index}" rowspan="${bin.rowSpan}">
                        <span class="content">${bin.oper}</span>
                      </td>
                      <td class="p-relative border-color rowspan${index}" rowspan="${bin.rowSpan}">
                        ${optionstr}
                      </td>
                    `;
                        rowSpan = bin.rowSpan;
                    }
                    if (EXT_LENGTH !== 0) {
                        count++;
                        const svg = `
                            <svg class="path_more" width="10px" height="6px" viewBox="0 0 10 6" version="1.1"
                                xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                                <defs>
                                    <path d="M11.9750423,5.5 L4.02468497,5.5 C3.55928566,5.5 3.32401474,
                                    6.06187132 3.65442254,6.39042319 L7.62960121,10.3473305 C7.83401693,
                                    10.5508898 8.16571037,10.5508898 8.37012609,10.3473305 L12.3453048,
                                    6.39042319 C12.6757126,6.06187132 12.4417273,5.5 11.9750423,5.5" id="path-1"></path>
                                </defs>
                                <g id="dep&amp;port合入" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                                    <g id="" transform="translate(-1017.000000, -747.000000)">
                                        <g id="" transform="translate(390.000000, 412.000000)">
                                            <g id="" transform="translate(10.000000, 324.000000)">
                                                <g id="" transform="translate(200.000000, 0.000000)">
                                                    <g id="" transform="translate(414.000000, 6.000000)">
                                                        <mask id="mask-2" fill="white">
                                                            <use xlink:href="#path-1"></use>
                                                        </mask>
                                                        <use id="Mask" fill="#979797" xlink:href="#path-1"></use>
                                                        <g mask="url(#mask-2)" fill="#979797" id="3.颜色/10.辅助说明文本">
                                                            <g>
                                                                <rect id="矩形备份-6" x="0" y="0" width="16" height="16"></rect>
                                                            </g>
                                                        </g>
                                                    </g>
                                                </g>
                                            </g>
                                        </g>
                                    </g>
                                </g>
                            </svg>
                        `;
                        if (!bin.soFileHasUrl) {
                            imgTd = `
                            <td class="p-relative border-color">
                                <span onclick="openDetail(${count}, ${bin.number}, '${bin.showTd}')">
                                    ${svg}
                                </span>
                            </td>
                        `;
                            for (let i = 0; i < EXT_LENGTH; i++) {
                                subFile += `
                            <tr class="ext${count}" style="display:none;">
                              <td class="no-border">
                                <div class="ext_more p-relative" style="height: 32px;"></div>
                              </td>
                              <td class="border-color"></td>
                              <td class="border-color">
                                <span class="content">${bin.name}</span>
                              </td>
                              <td class="border-color">
                                <span class="content">${bin.type}</span>
                              </td>
                              <td class="border-color border-right-color">
                                <span class="content">${bin.path_ext[i]}</span>
                              </td>
                            </tr>
                          `;
                            }
                        } else {  // .so文件有下载链接或者包名
                            imgTd = `
                                <td class="p-relative border-color">
                                    <span onclick="openSoDetail(${count})">
                                        ${svg}
                                    </span>
                                </td>
                            `;
                            for (let i = 0; i < bin.soInfoList.length; i++) {
                                const son = bin.soInfoList[i];
                                let sonResultstr = '';
                                if (son.urlName === '--') {  // 没有软件包
                                    sonResultstr = `
                                        <span class="content">${son.result}</span>
                                    `;
                                } else if (son.result === '--') {  // 有软件包无下载链接
                                    sonResultstr = `
                                        <span class="content">${this.i18n.common_term_upload_unable}</span>
                                    `;
                                } else {  // 有下载链接
                                    sonResultstr = `
                                        <span class="ellispis">
                                            <a onclick="downloadSoFile('${son.url}')"
                                            style="color: #0067ff;text-transform: capitalize;">${son.result}</a>
                                            <span class="copy-link sonlink${i}"
                                            onclick="onCopySonLink('${son.url}', '.copy-inp', ${i})">
                                            ${this.i18n.common_term_report_detail.copyLink}</span>
                                            <input class="copy-inp" />
                                        </span>
                                    `;
                                }
                                subFile += `
                                <tr class="ext${count}" style="display:none;">
                                    <td class="no-border">
                                        <div class="ext_more p-relative" style="height: 32px;"></div>
                                    </td>
                                    <td class="border-color"></td>
                                    <td class="border-color">
                                        <span class="content">${bin.name}</span>
                                    </td>
                                    <td class="border-color">
                                        <span class="content">${bin.type}</span>
                                    </td>
                                    <td class="border-color border-right-color">
                                        <span class="content">${son.path}</span>
                                    </td>
                                    <td
                                        rowspan="${son.mergeRowSpan.urlName}"
                                        showtd="${son.showTd.urlName}"
                                        class="sonRowSpan${count} border-color border-right-color">${son.urlName}</td>
                                    <td
                                        rowspan="${son.mergeRowSpan.oper}"
                                        showtd="${son.showTd.oper}"
                                        class="sonRowSpan${count} border-color border-right-color">${son.oper}</td>
                                    <td rowspan="${son.mergeRowSpan.result}"
                                        showtd="${son.showTd.result}"
                                        class="sonRowSpan${count} border-color">
                                        ${sonResultstr}
                                    </td>
                                </tr>
                            `;
                            }
                        }
                    }
                    if (!isPathExt) {
                      imgTd = '';
                    }
                    itemFile += `
                    <tr style="line-height:24px;">
                      ${imgTd}
                      <td class="border-color">
                        <span class="content">${bin.number}</span>
                      </td>
                      <td class="border-color">
                        <span class="content">${bin.name}</span>
                      </td>
                      <td class="border-color">
                        <span class="content">${bin.type}</span>
                      </td>
                      <td class="border-color border-right-color">
                        <span class="content">${bin.path}</span>
                      </td>
                      ${itemfileMiddle}
                    </tr>
                  `;
                    itemFile += subFile;
                });
            } else {
                itemFile += `
                  <tr class="ti3-table-nodata">
                    <td colspan="5" style="border: none;"></td>
                  </tr>
                `;
            }
            if (isPathExt) {
              fileListCon += `
                <div class="ti-table">
                    <div class="items-detail-container table table-bordered" style="${soFoilePadding}">
                        <table class="resize-table" style="text-align: left;line-height: 24px;table-layout:fixed;">
                            <thead>
                                <tr class="table-header">
                                    <th style="width: 2%;text-align: left;"></th>
                                    <th class="line" style="width: 5%;text-align: left;">${this.i18n.common_term_no_label}</th>
                                    <th class="line" style="width: 10%;text-align: left;">${this.i18n.plugins_common_cfile_name_laebl}</th>
                                    <th class="line" style="width: 10%;text-align: left;">${this.i18n.plugins_common_term_file_type}</th>
                                    <th class="line" style="width: 20%;text-align: left;">
                                        ${this.i18n.software_package_detail.common_term_path_label}
                                    </th>
                                    <th class="line" style="width: 20%;text-align: left;">
                                        ${this.i18n.plugins_port_option_soFileType_software_package}
                                    </th>
                                    <th class="line" style="width: 10%;text-align: left;">${this.i18n.common_term_report_result}</th>
                                    <th class="line" style="width: 23%;text-align: left;">${this.i18n.common_term_operate_sugg_label}</th>
                                </tr>
                            </thead>
                        </table>
                    </div>
                    <div class="table-box items-detail-container">
                        <table class="table" style="width: 100%;table-layout:fixed; text-align: left;
                            line-height: 28px;padding-bottom: 10px; border-bottom: 1px solid #ccc;"
                        >
                            <thead>
                                <tr style="height: 0">
                                    <th style="width: 2%;"></th>
                                    <th style="width: 5%;"></th>
                                    <th style="width: 10%;"></th>
                                    <th style="width: 10%;"></th>
                                    <th style="width: 20%;"></th>
                                    <th style="width: 20%;"></th>
                                    <th style="width: 10%;"></th>
                                    <th style="width: 23%;"></th>
                                </tr>
                            </thead>
                            <tbody>${itemFile}</tbody>
                        </table>
                    </div>
                </div>`;
            } else {
              fileListCon += `
                <div class="ti-table">
                    <div class="items-detail-container table table-bordered" style="${soFoilePadding}">
                        <table class="resize-table" style="text-align: left;line-height: 24px;table-layout:fixed;">
                            <thead>
                                <tr class="table-header">
                                    <th class="line" style="width: 5%;text-align: left;">${this.i18n.common_term_no_label}</th>
                                    <th class="line" style="width: 10%;text-align: left;">${this.i18n.plugins_common_cfile_name_laebl}</th>
                                    <th class="line" style="width: 10%;text-align: left;">${this.i18n.plugins_common_term_file_type}</th>
                                    <th class="line" style="width: 20%;text-align: left;">
                                        ${this.i18n.software_package_detail.common_term_path_label}
                                    </th>
                                    <th class="line" style="width: 20%;text-align: left;">
                                        ${this.i18n.plugins_port_option_soFileType_software_package}
                                    </th>
                                    <th class="line" style="width: 10%;text-align: left;">${this.i18n.common_term_report_result}</th>
                                    <th class="line" style="width: 25%;text-align: left;">${this.i18n.common_term_operate_sugg_label}</th>
                                </tr>
                            </thead>
                        </table>
                    </div>
                    <div class="table-box items-detail-container">
                        <table class="table" style="width: 100%;table-layout:fixed; text-align: left;
                            line-height: 28px;padding-bottom: 10px; border-bottom: 1px solid #ccc;"
                        >
                            <thead>
                                <tr style="height: 0">
                                    <th style="width: 5%;"></th>
                                    <th style="width: 10%;"></th>
                                    <th style="width: 10%;"></th>
                                    <th style="width: 20%;"></th>
                                    <th style="width: 20%;"></th>
                                    <th style="width: 10%;"></th>
                                    <th style="width: 25%;"></th>
                                </tr>
                            </thead>
                            <tbody>${itemFile}</tbody>
                        </table>
                    </div>
                </div>`;
            }
            scanTemp = `
                <div style="display: flex;">
                    <div class="detail-label">
                    <div class="detail-title">${this.scanItemsObj[item].label}</div>
                    </div>
                    <div style="flex: 6;"></div>
                </div>
                ${fileListCon}
            `;
        }
        return scanTemp;
    }
    /**
     * 分析结果数据
     * @param level 参数
     */
    formatSoSuggestion(level: string) {
        let suggestion = '';
        switch (level) {
            case '0':
                suggestion = this.i18n.plugins_port_report_level0_desc;
                break;
            case '1':
                suggestion = this.i18n.plugins_port_report_level1_desc;
                break;
            case '2':
                suggestion = this.i18n.plugins_port_report_level2_desc;
                break;
            case '3':
                suggestion = this.i18n.plugins_port_report_level3_desc;
                break;
            case '4':
                suggestion = this.i18n.plugins_port_report_level4_desc;
                break;
            case '5':
                suggestion = this.i18n.plugins_port_report_level5_desc;
                break;
            case '6':
                suggestion = this.i18n.plugins_port_report_level6_desc;
                break;
            default:
                break;
        }
        return suggestion;
    }
}
