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
const i18n = I18nService.I18n();
import { ReportHelper } from './report-helper';
import * as vscode from 'vscode';
import * as constant from './constant';

/**
 * reporting报告处理工具
 */
export class ReportDetailUtil {
    public textForm1: any = {
        textForm: {
            type: 'text',
        },
        colsNumber: 1,
        colsGap: ['40px', '40px'],
        fieldVerticalAlign: 'middle',
        reportConfiureInfo: i18n.common_term_report_confiure_info,
        firstItem: {
            label: i18n.common_term_ipt_label.source_code_path,
            value: [],
        },
        secondItem: {
            label: i18n.common_term_ipt_label.compiler_version,
            value: '',
        },
        thirdItem: {
            label: i18n.common_term_ipt_label.construct_tool,
            value: '',
        },
        fourthItem: {
            label: i18n.common_term_ipt_label.compile_command,
            value: '',
        },
        fifthItem: {
            label: i18n.common_term_ipt_label.target_os,
            value: '',
        },
        sixthItem: {
            label: i18n.common_term_ipt_label.target_system_kernel_version,
            value: '',
        }
    };
    public soFilesNeed = 0;
    public soFilesTotal = 0;
    public cfileLine = 0;
    public totalLine = 0;
    public scanItems = ['soFile', 'cFile', 'lines'];
    public binDetailSrcData: {
        data: Array<any>;
        state: {
            searched: boolean;
            sorted: boolean;
            paginated: boolean;
        };
    } = {
            data: [],
            state: {
                searched: false,
                sorted: false,
                paginated: false,
            },
        };
    public scanItemsObj: any = {
        soFile: {
            id: '2',
            label: '',
            icon: './assets/img/home/file.png',
            content: '',
            files: [],
            hasDetail: false,
            isOpen: true,
        },
        cFile: {
            id: '3',
            label: '',
            icon: './assets/img/home/source.png',
            content: '',
            files: [],
            hasDetail: false,
            isOpen: true,
        },
        lines: {
            id: '4',
            label: '',
            icon: './assets/img/home/trans.png',
            content: '',
            asmContent: '',
            hasDetail: false,
            isOpen: false,
        },
    };
    public cfileDetailSrcData: {
        data: Array<any>;
        state: {
            searched: boolean;
            sorted: boolean;
            paginated: boolean;
        };
    } = {
            data: [],
            state: {
                searched: false,
                sorted: false,
                paginated: false,
            },
        };
    // 当前报告标题
    public currentReport: any;
    public portingLevelList: Array<any> = [];
    public cFileNeed = 0;
    public makefileNeedTrans = 0;
    public asmNeedTrans = 0;
    public cmakeNeedTrans = 0;
    public automakeNeedTrans = 0;
    // 源文件按类型存放
    public fileList: Array<any> = [
        {
            name: 'makefile',
            label: 'makefileinfo',
            files: [],
        },
        {
            name: 'C/C++ Source File',
            label: 'codefileinfo',
            files: [],
        },
        {
            name: 'ASM File',
            label: 'asmfileinfo',
            files: [],
        },
        {
            name: 'Fortran',
            label: 'fortranfileinfo',
            files: [],
        },
        {
            name: 'Python',
            laber: 'pythonfileinfo',
            files: [],
        },
        {
            name: 'Go',
            laber: 'golangfileinfo',
            files: [],
        },
        {
          name: 'Java',
          laber: 'javafileinfo',
          files: [],
        },
        {
          name: 'Scala',
          laber: 'scalafileinfo',
          files: [],
        }
    ];
    public cLines = 0;
    public makefileLines = 0;
    public asmlines = 0;
    public asmFileLines = 0;
    public pythonLines = 0;
    public golangLines = 0;
    public javaLines = 0;
    public scalaLines = 0;
    // C/C++/Fortran和Makefile源代码行数
    public totalCodeLins = 0;
    // 汇编代码行数
    public totalAsmLins = 0;
    public humanBudgetNum = 0;
    public humanBudget = '0';
    public humanStandard = 0;
    public goTip = '';
    public goTipSwitch = false;
    i18nService: any;
    showHumanFlag: boolean | undefined;
    vscodeService: any;
    public extensionPath = '';
    public codefileinfo: any;
    public fortranLines: any;
    constructor() {
        this.textForm1.firstItem.label = i18n.common_term_ipt_label.source_code_path;
        this.textForm1.secondItem.label = i18n.common_term_ipt_label.target_os;
        this.textForm1.thirdItem.label = i18n.common_term_ipt_label.target_system_kernel_version;
        this.textForm1.fourthItem.label = i18n.common_term_ipt_label.compiler_version;
        this.textForm1.fifthItem.label = i18n.common_term_ipt_label.construct_tool;
        this.textForm1.sixthItem.label = i18n.common_term_ipt_label.compile_command;
        this.scanItemsObj.soFile.label = i18n.common_term_result_soFile;
        this.scanItemsObj.cFile.label = i18n.common_term_result_cFile;
        this.scanItemsObj.lines.label = i18n.common_term_result_lines;
    }

    /**
     * 组装html报告页面内容
     *
     * @param context 上下文
     * @param id 报告id
     */
    public async getHtmlContent(context: vscode.ExtensionContext, id: any, content: any): Promise<string> {
        const data: any = await ReportHelper.getReportDetail(context, id, constant.TOOL_NAME_PORTING);
        let response = data.replace(/#/g, ':');
        response = JSON.parse(response);
        this.currentReport = this.formatCreatedId(id);
        this.getReportDetail(response);
        const res: any = await ReportHelper.getConfigData(context, id, constant.TOOL_NAME_PORTING);
        let humresponse = res.replace(/#/g, ':');
        humresponse = JSON.parse(humresponse);
        // 动态计算工作量预估标准
        const humandata = humresponse.data;
        this.humanStandard = I18nService.I18nReplace(i18n.plugins_porting_Estimated_standard_subtitle, {
            0: humandata.c_line || 0,
            1: humandata.asm_line || 0
        });
        // 从插件上下文中获取插件安装路径，并通过反斜杠替换避免字符串转义问题
        this.extensionPath = context.extensionPath.replace(/\\/g, '/');
        return this.buildReportDetailString(content);
    }

    /**
     * 组装html报告页面详细信息
     * @param report 报告内容
     */
    public buildReportDetailString(report: any): string {
        let args = '';
        let scanTemp = '';
        const humanFlag = 'block';
        args = `<h1 style="font-size: 20px;color: #282b33;margin-bottom: 24px;font-weight: normal;line-height: 1;">
        ${this.textForm1.reportConfiureInfo}</h1>
        <div class="setting-left" style="float: left; width: 50%;">
          <div class="setting-left-item" style="display: flex; justify-content: flex-start;margin-bottom: 20px;">
            <span style="width: 240px;color: #6C7280;">${this.textForm1.firstItem.label}</span>
            <span style="min-width: 440px;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;flex:1;"
              title="${this.textForm1.firstItem.value}"
            >${this.textForm1.firstItem.value}</span>
          </div>
          <div class="setting-left-item" style="display: flex; justify-content: flex-start;margin-bottom: 20px;">
            <span style="width: 240px;color: #6C7280;">${this.textForm1.secondItem.label}</span>
            <span style="max-width: 556px;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;">
            ${this.textForm1.secondItem.value}</span>
          </div>
          <div class="setting-left-item" style="display: flex; justify-content: flex-start;margin-bottom: 20px;">
            <span style="width: 240px;color: #6C7280;">${this.textForm1.thirdItem.label}</span>
            <span style="max-width: 556px;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;">
            ${this.textForm1.thirdItem.value}</span>
          </div>
          <div class="setting-left-item" style="display: flex; justify-content: flex-start;margin-bottom: 20px;">
            <span style="width: 240px;color: #6C7280;">${this.textForm1.fourthItem.label}</span>
            <span style="max-width: 556px;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;">
            ${this.textForm1.fourthItem.value || '--'}</span>
          </div>
          <div class="setting-left-item" style="display: flex; justify-content: flex-start;margin-bottom: 20px;">
            <span style="width: 240px;color: #6C7280;">${this.textForm1.fifthItem.label}</span>
            <span style="max-width: 556px;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;">
            ${this.textForm1.fifthItem.value || '--'}</span>
          </div>
          <div class="setting-left-item" style="display: flex; justify-content: flex-start;margin-bottom: 20px;">
            <span style="width: 240px;color: #6C7280;">${this.textForm1.sixthItem.label}</span>
            <span style="max-width: 556px;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;">
            ${this.textForm1.sixthItem.value  || '--'}</span>
          </div>
        </div>
          <div class="setting-right" style="position: relative;float: right; margin-top: 10px;width:50%">
          <div class="setting-right-top" style="  display: flex;  justify-content: flex-end;  height: 80px;">
            <div class="setting-right-item" style="  display: flex;   flex-direction: column;   justify-content: space-between;
            align-items: center;    margin-left: 14px;  min-width: 160px;  position: relative;">
              <p>${i18n.plugins_term_report_level_desc}</p>
              <p>${this.soFilesTotal - this.soFilesNeed}</p>
            </div>
            <div class="setting-right-item" style="  display: flex;   flex-direction: column;   justify-content: space-between;
            align-items: center;    margin-left: 14px;  min-width: 160px;  position: relative;margin-right: 20px;
            padding-right: 30px;  border-right: 1px solid #E1E6EE;">
              <p>${i18n.plugins_term_report_leeif_desc}</p>
              <p>${this.soFilesNeed}</p>
            </div>
            <div class="setting-right-item"  style="  display: flex;   flex-direction: column;   justify-content: space-between;
            align-items: center;    margin-left: 14px;  min-width: 160px;  position: relative;">
              <p>${i18n.plugins_term_name_total}</p>
              <p>${this.soFilesTotal}</p>
            </div>
        </div>
        <div class="setting-right-bottom" style="margin-top: 30px; display: flex;  justify-content: flex-end;  height: 80px;">
          <div
            class="setting-right-item"
            style="display: flex; flex-direction: column;
            justify-content: space-between;  align-items: center;min-width: 160px; position: relative;"
          >
            <p>${i18n.common_term_migrate_result_cFile}</p>
            <p>${this.cfileLine}</p>
          </div>
          <div class="setting-right-item" style="display: flex; flex-direction: column;justify-content: space-between;
          align-items: center; margin-left: 13px; margin-right: 20px; padding-right: 31px;
          min-width: 160px;position: relative; border-right: 1px solid #E1E6EE;">
            <p>${i18n.common_term_migrate_result_lines}</p>
            <p>${this.totalLine}</p>
          </div>
          <div class="setting-right-item" style="display: flex; flex-direction: column; justify-content: space-between;
          align-items: center;margin-left: 14px;min-width: 160px; position: relative;">
           <p>${i18n.common_term_report_right_info4}</p>
           <p>${this.humanBudgetNum}<span style="font-size:14px;font-weight:400">${this.humanBudget}</span></p>
         </div>
        </div>
        <p class="tit" style="margin-top: 12px;color: #616161;font-size: 14px;text-align: right;">
        ${this.humanStandard}</p>
        </div>`;
        this.scanItems.forEach((item: any, idx: any) => {
            let itemFile = '';
            let fileListCon = '';
            let block;
            if (item === 'soFile') {
                if (this.binDetailSrcData.data.length > 7) {
                    block = '17px';
                } else {
                    block = '';
                }
                if (this.binDetailSrcData.data.length > 0) {
                    let rowSpan = 0;
                    this.binDetailSrcData.data.forEach((bin: any, index: any) => {
                        let optionstr = '';
                        if (bin.url === '--') {
                            optionstr = `<span class="content">${bin.result}</span>`;
                        } else if (bin.url.lastIndexOf('/') === -1) {
                          optionstr = `<span title="${i18n.common_term_upload_unable}">--</span>`;
                        } else {
                            const downloadDesc = bin.downloadDesc
                              ? `<span>${bin.downloadDesc + ' ' + bin.url}</span>`
                              : ((bin.level === 0 || bin.level === 3 || bin.level === 6)
                                ? `<a onclick="downloadSoFile('
                                ${bin.url}')" style="text-transform: capitalize;">${bin.result}</a>`
                                : (( bin.result !== '下载源码' && bin.result !== 'Download Source Code' )
                                  ? `<a onclick="downloadSoFile('${bin.url}')">${bin.result}</a>`
                                  : `<a href="${bin.url}" target="_blank">${bin.result}</a>`)
                                );
                            optionstr = `<span class="content">${downloadDesc}
                              <span class="copy-link link${index}" onclick="onCopyLink('${bin.url}', '.copy-inp', ${index})">
                                ${ i18n.common_term_report_detail.copyLink }
                              </span>
                            </span>
                            <input class="copy-inp" />`;
                        }
                        let itemfileMiddle = '';
                        if (rowSpan > 1) {
                          rowSpan--;
                        } else {
                          itemfileMiddle = `
                            <td class="border-color border-right-color" rowspan${index}" rowspan="${bin.rowSpan}">
                              <span class="content">${bin.pathName || '--'}</span>
                            </td>
                            <td
                              class="border-color border-right-color rowspan${index}"
                              rowspan="${bin.rowSpan}" showtd="${bin.showTd}"
                            >
                              <span class="content">${bin.oper}</span>
                            </td>
                            <td class="border-color rowspan${index}" rowspan="${bin.rowSpan}">
                              ${optionstr}
                            </td>
                          `;
                          rowSpan = bin.rowSpan;
                        }
                        itemFile += `
                          <tr style="line-height:28px;font-size: 14px;">
                            <td style="white-space: nowrap;text-overflow: ellipsis;overflow: hidden;
                                border-bottom: 1px solid #E6EBF5;"><span class="content">${bin.number}</span></td>
                            <td style="white-space: nowrap;text-overflow: ellipsis;overflow: hidden;
                                border-bottom: 1px solid #E6EBF5;"><span class="content">${bin.name}</span></td>
                            <td style="white-space: nowrap;text-overflow: ellipsis;overflow: hidden;
                                border-bottom: 1px solid #E6EBF5;" class="border-right-color"><span class="content">${bin.type}</span></td>
                            ${itemfileMiddle}
                          </tr>
                        `;
                    });
                } else {
                    itemFile += `
                        <tr class="ti3-table-nodata" style="height:160px!important;
                    background:url(${this.extensionPath.concat('/src/extension/assets/report/no_data.png')}) 50% 25px no-repeat !important">
                            <td colspan="6" style="border: none;"></td>
                        </tr>`;
                }

                fileListCon += `
                  <div class="ti-table">
                    <div class="items-detail-container table table-bordered">
                      <table style="width: 100%;table-layout:fixed; text-align: left;line-height:28px;padding-right:${block}">
                        <thead>
                          <tr class="table-header">
                            <th style="width: 7%;text-align: left;">${i18n.common_term_no_label}</th>
                            <th style="width: 13%;text-align: left;">${i18n.plugins_common_cfile_name_laebl}</th>
                            <th style="width: 10%;text-align: left;">${i18n.plugins_common_term_file_type}</th>
                            <th style="width: 30%;text-align: left;">${i18n.plugins_common_software_package}</th>
                            <th style="width: 15%;text-align: left;">${i18n.common_term_report_result}</th>
                            <th style="width: 25%;text-align: left;">${i18n.common_term_operate}</th>
                          </tr>
                        </thead>
                      </table>
                    </div>
                    <div class="table-box">
                      <table class="table" style="width: 100%;table-layout:fixed; text-align: left;line-height: 20px;
                      ">
                        <thead>
                          <tr>
                            <th style="width: 7%;"></th>
                            <th style="width: 13%;"></th>
                            <th style="width: 10%;"></th>
                            <th style="width: 30%;"></th>
                            <th style="width: 15%;"></th>
                            <th style="width: 25%;"></th>
                          </tr>
                        </thead>
                        <tbody style="font-size: 14px;">${itemFile}</tbody>
                      </table>
                    </div>
                  </div>
                `;
            }
            if (item === 'cFile' && this.scanItemsObj[item].files) {
                this.cfileDetailSrcData.data.forEach((dataItem: any) => {
                itemFile += `
                  <tr>
                    <td style="border-bottom: 1px solid #E6EBF5;" title="${dataItem.id}">
                      <span style="width:100%;overflow: hidden;white-space: nowrap;text-overflow: ellipsis;display:inline-block">
                    ${dataItem.id}</span>
                    </td>
                    <td style="border-bottom: 1px solid #E6EBF5;" title="${dataItem.filename}">
                      <span style="width:100%;overflow: hidden;white-space: nowrap;text-overflow: ellipsis;display:inline-block">
                    ${dataItem.filename}</span>
                    </td>
                    <td style="border-bottom: 1px solid #E6EBF5;" title="${dataItem.path}">
                      <span style="width:100%;overflow: hidden;white-space: nowrap;text-overflow: ellipsis;display:inline-block">
                    ${dataItem.path}</span>
                    </td>
                    <td style="border-bottom: 1px solid #E6EBF5;" title="${dataItem.fileType}">
                      <span style="width:100%;overflow: hidden;white-space: nowrap;text-overflow: ellipsis;display:inline-block">
                    ${dataItem.fileType}</span>
                    <td style="border-bottom: 1px solid #E6EBF5;" title="${dataItem.linecount}">
                      <span style="width:100%;overflow: hidden;white-space: nowrap;text-overflow: ellipsis;display:inline-block">
                    ${dataItem.linecount}</span>
                    </td>
                   </tr>
                  `;
                });

                fileListCon += `
                <div class="ti-table">
                  <div class="items-detail-container" style="padding-right:17px;">`;
                if (item === 'cFile' && this.goTipSwitch) {
                  fileListCon +=  `<div class="go-tip-div">
                        <span class="go-tip">${ this.goTip }</span>
                      </div>`;
                }
                fileListCon += `<table style="width:100%;table-layout:fixed; text-align: left;line-height: 28px">
                      <thead>
                        <tr class="table-header">
                          <th style="width: 10%;white-space: nowrap;text-overflow: ellipsis;overflow: hidden;">
                          ${i18n.common_term_no_label}</th>
                          <th style="width: 20%;white-space: nowrap;text-overflow: ellipsis;overflow: hidden;">
                          ${i18n.common_term_name_label}</th>
                          <th style="width: 40%;white-space: nowrap;text-overflow: ellipsis;overflow: hidden;">
                          ${i18n.plugins_porting_label_cFile_path}</th>
                          <th style="width: 20%;white-space: nowrap;text-overflow: ellipsis;overflow: hidden;">
                          ${i18n.plugins_porting_label_file_type}</th>
                          <th style="width: 10%;white-space: nowrap;text-overflow: ellipsis;overflow: hidden;">
                          ${i18n.plugins_porting_option_linecount}</th>
                        </tr>
                      </thead>
                    </table>
                  </div>
                  <div class="table-box">
                    <table style="width: 100%;text-align: left;line-height: 28px;table-layout:fixed">
                      <thead>
                        <tr>
                          <th style="width: 10%;"></th>
                          <th style="width: 20%;"></th>
                          <th style="width: 40%;"></th>
                          <th style="width: 20%;"></th>
                          <th style="width: 10%;"></th>
                        </tr>
                      </thead>
                      <tbody style="font-size: 14px;">${itemFile}</tbody>
                    </table>
                  </div>
                </div>
              `;
            }
            if (item === 'lines' && report.portingresultlist.length > 0) {
                let itemLines = '';
                report.portingresultlist.forEach((retItem: any) => {
                  retItem.portingItems.forEach((line: any) => {
                    itemLines += `
                      <tr>
                        <td style="border-bottom: 1px solid #E6EBF5;" title="${retItem.content}">
                          <span style="width:100%;overflow: hidden;white-space: nowrap;text-overflow: ellipsis;display:inline-block">
                        ${retItem.content}</span>
                        </td>
                        <td style="border-bottom: 1px solid #E6EBF5;">
                          <span style="width:100%;overflow: hidden;white-space: nowrap;text-overflow: ellipsis;display:inline-block">
                        ${'(' + line.locbegin + ',' + line.locend + ')'}</span>
                        </td>
                        <td style="border-bottom: 1px solid #E6EBF5;" title="${line.keyword}">
                        <span style="width:100%;overflow: hidden;white-space: nowrap;text-overflow: ellipsis;display:inline-block">
                        ${line.keyword}</span></td>
                        <td style="border-bottom: 1px solid #E6EBF5;" title="${line.strategy}">
                          <span style="width:100%;overflow: hidden;white-space: nowrap;text-overflow: ellipsis;display:inline-block">
                        ${line.strategy}</span>
                        </td>
                      </tr>
                    `;
                  });
                });

                fileListCon += `
                  <div class="ti-table">
                    <div class="items-detail-container" style="padding-right:17px;">
                      <table style="width: 100%;text-align: left;line-height: 28px;table-layout:fixed">
                        <thead>
                          <tr class="table-header">
                            <th style="width: 30%;text-align: left;">${i18n.common_term_download_html_filename}</th>
                            <th style="width: 15%;text-align: left;">${i18n.common_term_download_html_lineno}</th>
                            <th style="width: 15%;text-align: left;">${i18n.common_term_download_html_keyword}</th>
                            <th style="width: 40%;text-align: left;">${i18n.common_term_download_html_suggestion}</th>
                          </tr>
                        </thead>
                      </table>
                    </div>
                    <div class="table-box">
                      <table style="width: 100%;text-align: left;line-height: 28px;table-layout:fixed">
                        <thead>
                          <tr>
                            <th style="width: 30%;"></th>
                            <th style="width: 15%;"></th>
                            <th style="width: 15%;"></th>
                            <th style="width: 40%;"></th>
                          </tr>
                        </thead>
                        <tbody style="font-size: 14px;">${itemLines}</tbody>
                      </table>
                    </div>
                  </div>
                `;
            }

            scanTemp += `
        <div class="table-container" style="line-height: 56px;margin-top:30px;">
          <div class="detail-label" style="display:inline-block;width: 350px;font-size: 20px">
            <span>${this.scanItemsObj[item].label}</span>
          </div>
          <div class="detail-content" style="display:inline-block;">${this.scanItemsObj[item].content}</div>
        </div>
          ${fileListCon}
        `;
        });

        const template = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="X-UA-Compatible" content="ie=edge">
            <title>Document</title>
        </head>
        <style>
          *{
              margin: 0;
              padding: 0;
          }
          .setting-left {
            span {
                height:18px;
                font-size: 14px;
                line-height: 18px;
            }
          }
          .setting-left-item {
            font-size: 14px;
          }
          .table-box {
            max-height: 200px;
            overflow-y: auto;
            margin-top: -4px;
            border-bottom: 1px solid #ccc;
          }
          .header-title {
            text-align: center;
            font-weight: normal;
            font-size: 1.5rem;
            border-bottom: solid 1px #222;
            padding-bottom:20px;
            margin-bottom: 20px;
          }
          .setting-right-item p:first-child{
              font-size: 16px;
              height: 24px;
              line-height: 24px;
              color: #AAA;
              text-align: center;
              white-space: nowrap;
          }
          .setting-right-item p:nth-child(2){
              font-size: 48px;
              color: #222;
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
          table th {
            font-size:12px;
          }
          table td {
            font-size:12px;
          }
          .detail-content {
            font-size:14px;
          }
          .go-tip-div {
            height: 32px;
            background-color: #f0f6ff;
            border-radius: 2px;
            border: solid 1px #0067ff;
            display:flex;
            align-items: center;
            margin-bottom: 3px;
          }
          .go-tip {
            height: 18px;
            font-family: FZLTHJW--GB1-0;
            font-size: 12px;
            font-weight: normal;
            font-stretch: normal;
            line-height: 18px;
            letter-spacing: 0px;
            color: #222222;
            margin-left: 10px;
          }
          a {
            color: #0067ff;
          }
          a:hover {
            color: #267DFF;
            cursor: pointer;
          }
          td span {
            box-sizing: border-box;
            display: inline-block;
            overflow: hidden;
            padding-left: 10px;
            width: 100%;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          .ellispis {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          .border-color {
            border-bottom: 1px solid #E6EBF5;
          }
          .border-right-color {
            border-right: 1px solid #E6EBF5;
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
        </style>
        <body style="padding:0 80px;min-width: 1366px;overflow-x: auto;">
          <div style="width: 100%; height: 100%;margin: 40px 0 0">
          <h1 class="header-title">
          ${this.currentReport}</h1>
          <div >
          ${args}
          </div>
          <div style ="float:left;width:100%">
            ${scanTemp}
          </div>
          </div>
          <script>
            function openDetail(e) {
                let closeIcon = e.target;
                let detailContainer = closeIcon.parentElement.parentElement.parentElement.nextElementSibling;
                closeIcon.style.display= 'none';
                closeIcon.parentElement.lastElementChild.style.display = 'inline-block';
                detailContainer.style.display = 'block';
                let tab = detailContainer.children[0]
                changeTableWidth(tab)
            }

            function closeDetail(e) {
                let openIcon = e.target;
                let detailContainer = openIcon.parentElement.parentElement.parentElement.nextElementSibling;
                openIcon.style.display= 'none';
                openIcon.parentElement.firstElementChild.style.display = 'inline-block';
                detailContainer.style.display = 'none';
            }
            function downloadSoFile(url) {
              if (url != '--') {
                window.open(url, '_blank');
              } else {
                return;
              }

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
            window.onload = function(){
              setTitle();
            }
            window.onresize = function() {
              setTitle();
            }
            function changeTableWidth(element){
              let tTD;
              let ele = element;
              for (j = 0; j < ele.rows[0].cells.length; j++) {
                  ele.rows[0].cells[j].onmousedown = function () {
                      tTD = this;
                      if (event.offsetX > tTD.offsetWidth - 10) {
                          tTD.mouseDown = true;
                          tTD.oldX = event.x;
                          tTD.oldWidth = tTD.offsetWidth;
                      }
                      ele = tTD;
                      while (ele.tagName != 'TABLE') ele = ele.parentElement;
                      tTD.tableWidth = ele.offsetWidth;
                  };
                  document.body.onmouseup = function () {
                      if (tTD == undefined) tTD = this;
                      tTD.mouseDown = false;
                      tTD.style.cursor = 'default';
                  };
                  ele.rows[0].cells[j].onmousemove = function () {
                      if (event.offsetX > that.offsetWidth - 10)
                          that.style.cursor = 'col-resize';
                      else
                          that.style.cursor = 'default';
                      if (tTD == undefined) tTD = this;
                      if (tTD.mouseDown != null && tTD.mouseDown == true) {
                          tTD.style.cursor = 'default';
                          if (tTD.oldWidth + (event.x - tTD.oldX) > 0){
                              tTD.width = tTD.oldWidth + (event.x - tTD.oldX);
                          }
                          tTD.style.width = tTD.width + "px";
                          tTD.style.cursor = 'col-resize';
                          ele = tTD;
                          while (ele.tagName != 'TABLE') ele = ele.parentElement;
                          for (j = 0; j < ele.rows.length; j++) {
                              ele.rows[j].cells[tTD.cellIndex].width = tTD.width;
                          }
                          ele.width = tTD.tableWidth + (tTD.offsetWidth - tTD.oldWidth) + 'px';
                          ele.style.width = ele.width;
                      }
                  };
              }
            }
          </script>
            <script type="text/javascript">
              let tables = document.getElementsByClassName('resize-table');
              for (let k = 0; k < tables.length; k++) {
                  let tTD;
                  let ele = tables[k];
                  for (j = 0; j < ele.rows[0].cells.length; j++) {
                      ele.rows[0].cells[j].onmousedown = function () {
                          tTD = this;
                          if (event.offsetX > tTD.offsetWidth - 10) {
                              tTD.mouseDown = true;
                              tTD.oldX = event.x;
                              tTD.oldWidth = tTD.offsetWidth;
                          }
                      };
                      ele.rows[0].cells[j].onmouseup = function () {
                          if (tTD == undefined) tTD = this;
                          tTD.mouseDown = false;
                          tTD.style.cursor = 'default';
                      };
                      ele.rows[0].cells[j].onmousemove = function () {
                          if (event.offsetX > this.offsetWidth - 10) {
                              this.style.cursor = 'col-resize';
                          } else {
                              this.style.cursor = 'default';
                          }
                          if (tTD == undefined) tTD = this;
                          if (tTD.mouseDown != null && tTD.mouseDown == true) {
                              tTD.style.cursor = 'default';
                              if (tTD.oldWidth + (event.x - tTD.oldX)>0)
                              tTD.width = tTD.oldWidth + (event.x - tTD.oldX);
                              tTD.style.width = tTD.width;
                              tTD.style.cursor = 'col-resize';
                              ele = tTD; while (ele.tagName != 'TABLE') ele = ele.parentElement;
                              for (j = 0; j < ele.rows.length; j++) {
                                  ele.rows[j].cells[tTD.cellIndex].width = tTD.width;
                              }
                          }
                      };
                  }
              }
            </script>
        </body>
      </html>
      `;
        return template;
    }

    /**
     * 填充报告详细页信息
     * @param resp 请求详细信息
     */
    getReportDetail(resp: any) {
        // 定义响应数据
        this.portingLevelList = [];
        this.soFilesNeed = 0;
        const soFileList: any = [];
        let compiler = '';
        this.asmNeedTrans = 0;
        this.cmakeNeedTrans = 0;
        this.automakeNeedTrans = 0;
        this.asmFileLines = 0;
        this.asmlines = 0;
        this.makefileNeedTrans = 0;
        this.makefileLines = 0;
        this.soFilesTotal = 0;
        this.cLines = 0;
        this.cFileNeed = 0;
        this.goTipSwitch = false;
        if (resp.data.info !== {}) {
            const sourcedirs = resp.data.info.sourcedir.split(',');
            if (sourcedirs.length > 0) {
                sourcedirs.forEach((item: any) => {
                    this.textForm1.firstItem.value.push(item);
                });
            }
            this.textForm1.secondItem.value = resp.data.info.targetos === 'centos7.6' ? 'CentOS 7.6' : resp.data.info.targetos;
            this.textForm1.thirdItem.value = `${resp.data.info.targetkernel}`;
            const gf = resp.data.info.gfortran.toUpperCase() || '';
            if (resp.data.info.compiler.type
              || (resp.data.info.compiler.type && resp.data.info.cgocompiler.type)
            ) {
              compiler = `${resp.data.info.compiler.type.toUpperCase()} ` + resp.data.info.compiler.version;
            } else if (resp.data.info.cgocompiler.type) {
              // if(cgo) || if(!c && !cgo)
              compiler = `${resp.data.info.cgocompiler.type.toUpperCase()} ` + resp.data.info.cgocompiler.version;
            }
            if (compiler && gf) {
                this.textForm1.fourthItem.value = compiler + `, ${gf}`;
            } else if (compiler && !gf) {
                this.textForm1.fourthItem.value = compiler;
            } else if (!compiler && gf) {
                this.textForm1.fourthItem.value = `${gf} `;
            }
            this.textForm1.fifthItem.value = resp.data.info.constructtool;
            this.textForm1.sixthItem.value = resp.data.info.compilecommand;
        }
        if (resp.data.portingresult !== {}) {
            const portingLevel = resp.data.portingresult.porting_level;
            const obj: any = {};
            if (resp.data.portingresult.tips) {
              if (resp.data.portingresult.tips.length !== 0 && I18nService.getLang() === 0) {
                this.goTipSwitch = true;
                this.goTip = resp.data.portingresult.tips[0].info_cn;
              } else if (resp.data.portingresult.tips.length !== 0 && I18nService.getLang() === 1) {
                this.goTipSwitch = true;
                this.goTip = resp.data.portingresult.tips[0].info_en;
              }
            } else {
              this.goTip = '';
            }
            if (portingLevel) {
              for (const key of Object.keys(portingLevel)) {
                if (portingLevel[key].amount) {
                    obj[key] = portingLevel[key];
                    this.soFilesTotal += portingLevel[key].amount;
                }
                if (key !== '0') {
                  portingLevel[key].bin_detail_info.forEach((bin: any) => {
                        bin.level = key;
                    });
                  this.portingLevelList = this.portingLevelList.concat(portingLevel[key].bin_detail_info);
                  this.soFilesNeed += portingLevel[key].amount;
                }
              }
            }
            let arr: any = [];
            for (const key of Object.keys(obj)) {
                obj[key].bin_detail_info.forEach((item: any) => {
                    item.level = String(key);
                });
                arr = arr.concat(obj[key].bin_detail_info);
            }
            this.portingLevelList = arr;
            this.portingLevelList = this.portingLevelList.map((item, index) => {
                const num = item.url.lastIndexOf('\/');
                return {
                    number: index + 1,
                    level: item.level,
                    name: item.libname,
                    desc: item.desc || '--',
                    pathName: unescape(item.url.substring(num + 1, item.url.length)),
                    type: this.formatSoFileType(item.type),
                    oper: this.formatSoSuggestion(item.level, true) || '--',
                    result: this.formatSoResult(item.level, item.type, true),
                    url: item.url || '--',
                };
            });

            // 行合并处理
            if (this.portingLevelList.length) {
              this.portingLevelList = this.linePortingLevel(this.portingLevelList);
            }
            // 版本问题规避部分字段
            const cmakelistsinfo = resp.data.portingresult.cmakelistsinfo;
            const cmakeLines = resp.data.portingresult.cmakelistslines || 0;
            const automakeinfo = resp.data.portingresult.automakeinfo;
            const automakeLines = resp.data.portingresult.automakelines || 0;

            // 组装页面展示数据
            this.binDetailSrcData.data = this.portingLevelList;
            this.cLines = resp.data.portingresult.codelines;
            this.asmlines = resp.data.portingresult.asmlines;
            this.fortranLines = resp.data.portingresult.fortranlines;
            this.pythonLines = resp.data.portingresult.pythonlines || 0;
            this.golangLines = resp.data.portingresult.golanglines || 0;
            this.javaLines = resp.data.portingresult.javalines || 0;
            this.scalaLines = resp.data.portingresult.scalalines || 0;
            this.asmFileLines = resp.data.portingresult.asmfilelines;
            this.makefileLines = resp.data.portingresult.makefilelines;
            this.cFileNeed = resp.data.portingresult.codefileinfo.needtranscount;
            const fortranNeedTrans = resp.data.portingresult.fortranfileinfo.needtranscount;
            const pythonNeedTrans = resp.data.portingresult.hasOwnProperty('pythonfileinfo')
              ? resp.data.portingresult.pythonfileinfo.needtranscount
              : 0;
            const golangNeedTrans =  resp.data.portingresult.hasOwnProperty('golangfileinfo')
              ? resp.data.portingresult.golangfileinfo.needtranscount
              : 0;
            const javaNeedTrans =  resp.data.portingresult.hasOwnProperty('javafileinfo')
              ? resp.data.portingresult.javafileinfo.needtranscount
              : 0;
            const scalaNeedTrans =  resp.data.portingresult.hasOwnProperty('scalafileinfo')
              ? resp.data.portingresult.scalafileinfo.needtranscount
              : 0;
            this.asmNeedTrans = resp.data.portingresult.asmfileinfo.needtranscount;
            this.cmakeNeedTrans = cmakelistsinfo ? cmakelistsinfo.needtranscount : 0;
            this.automakeNeedTrans = automakeinfo ? automakeinfo.needtranscount : 0;
            this.makefileNeedTrans = resp.data.portingresult.makefileinfo.needtranscount;
            this.scanItemsObj.soFile.content = this.soFilesNeed;
            this.scanItemsObj.soFile.hasDetail = this.portingLevelList.length > 0;
            this.scanItemsObj.soFile.files = soFileList;
            // cfile下拉files
            const makefiles = resp.data.portingresult.makefileinfo.files; // cfile
            const cmakefiles = cmakelistsinfo ? cmakelistsinfo.files : [];
            const asmfiles = resp.data.portingresult.asmfileinfo.files;
            const codefiles = resp.data.portingresult.codefileinfo.files; // cfile
            const automakefiles = automakeinfo ? automakeinfo.files : [];
            const fortranfiles = resp.data.portingresult.fortranfileinfo.files;
            const pythonfiles = resp.data.portingresult.hasOwnProperty('pythonfileinfo')
              ? resp.data.portingresult.pythonfileinfo.files
              : [];
            const golangfiles = resp.data.portingresult.hasOwnProperty('golangfileinfo')
              ? resp.data.portingresult.golangfileinfo.files
              : [];
            const javafiles = resp.data.portingresult.hasOwnProperty('javafileinfo')
              ? resp.data.portingresult.javafileinfo.files
              : [];
            const scalafiles = resp.data.portingresult.hasOwnProperty('scalafileinfo')
              ? resp.data.portingresult.scalafileinfo.files
              : [];
            this.scanItemsObj.cFile.content =
                this.cFileNeed
                + this.makefileNeedTrans
                + this.asmNeedTrans
                + this.cmakeNeedTrans
                + this.automakeNeedTrans
                + fortranNeedTrans
                + pythonNeedTrans
                + golangNeedTrans
                + javaNeedTrans
                + scalaNeedTrans;
            this.scanItemsObj.cFile.hasDetail =
                codefiles.length
                + makefiles.length
                + cmakefiles.length
                + asmfiles.length
                + automakefiles.length
                + fortranfiles.length
                + pythonfiles.length
                + golangfiles.length
                + javafiles.length
                + scalafiles.length > 0;
            this.scanItemsObj.cFile.files = codefiles
                .concat(asmfiles)
                .concat(makefiles)
                .concat(cmakefiles)
                .concat(automakefiles)
                .concat(fortranfiles)
                .concat(pythonfiles)
                .concat(golangfiles)
                .concat(javafiles)
                .concat(scalafiles);

            this.fileList[0].files = makefiles.concat(cmakefiles).concat(automakefiles);
            this.fileList[1].files = codefiles;
            this.fileList[2].files = asmfiles;
            this.fileList[3].files = fortranfiles;
            this.fileList[4].files = pythonfiles;
            this.fileList[5].files = golangfiles;
            this.fileList[6].files = javafiles;
            this.fileList[7].files = scalafiles;

            // 按类型填充源文件表格
            let cfileNameArr = [];
            let fileTypeName = '';
            let filesIndex = 1;
            this.fileList.forEach((item, index) => {
                fileTypeName = item.name;
                item.files.forEach((innerItem: any, innerIndex: any) => {
                    const filestatus = (typeof(innerItem) === 'string' ? innerItem : innerItem.filedirectory);
                    cfileNameArr = filestatus.split('/');
                    const dataItem = {
                        id: filesIndex++,
                        filename: cfileNameArr[cfileNameArr.length - 1],
                        path: filestatus,
                        fileType: fileTypeName,
                        linecount: typeof(innerItem) === 'string' ? '' : innerItem.linecount,
                        visited: false,
                    };
                    this.cfileDetailSrcData.data.push(dataItem);
                });
            });
            if (vscode.env.language === 'en-us') {
                if (resp.data.portingresult.workload > 0 && resp.data.portingresult.workload <= 1) {
                    this.humanBudget = i18n.common_Estimated_standard_subinfo2;
                } else {
                    this.humanBudget = i18n.common_Estimated_standard_subinfo;
                }
            } else {
                this.humanBudget = i18n.common_Estimated_standard_subinfo;
            }
            const workload = resp.data.portingresult.workload;
            if (workload) {
                this.humanBudgetNum = workload;
            }
            // 词条国际化
            if (this.soFilesNeed === 1) {
                this.scanItemsObj.soFile.content = I18nService.I18nReplace(i18n.common_term_report_soFile_dependent2, {
                    0: this.soFilesTotal,
                    1: this.soFilesNeed,
                });
            } else {
                this.scanItemsObj.soFile.content = I18nService.I18nReplace(i18n.common_term_report_soFile_dependent, {
                    0: this.soFilesTotal,
                    1: this.soFilesNeed,
                });
            }
            this.scanItemsObj.soFile.content = '';
            this.cfileLine = this.scanItemsObj.cFile.content;
            this.scanItemsObj.cFile.content = I18nService.I18nReplace(i18n.common_term_report_cFile_dependent, {
                0: this.scanItemsObj.cFile.content,
            });
            this.totalLine = this.cLines + this.makefileLines + cmakeLines +
            automakeLines + this.fortranLines + this.asmlines +
            this.asmFileLines + this.pythonLines + this.golangLines + this.javaLines + this.scalaLines;

            this.totalCodeLins = this.cLines
              + this.makefileLines
              + cmakeLines
              + automakeLines
              + this.fortranLines
              + this.pythonLines
              + this.golangLines
              + this.javaLines
              + this.scalaLines;
            this.totalAsmLins = this.asmlines + this.asmFileLines;

            this.scanItemsObj.lines.content = I18nService.I18nReplace(i18n.common_term_report_detail_ctans_lins, {
                0: this.totalLine,
            });
            // 做动态代码行提示
            let codelines = '';
            if (I18nService.getLang() === 0) {
              codelines = ' 行';
            } else if (I18nService.getLang() === 1) {
              codelines = ' lines';
            }
            if (this.makefileLines + cmakeLines + automakeLines !== 0) {
              this.scanItemsObj.lines.content +=
                `makefile: ${this.makefileLines + cmakeLines + automakeLines + codelines};`;
            }
            if (this.cLines + this.asmlines !== 0) {
              this.scanItemsObj.lines.content +=
                `C/C++: ${this.cLines + this.asmlines + codelines};`;
            }
            if (this.asmFileLines !== 0) {
              this.scanItemsObj.lines.content +=
                `ASM: ${this.asmFileLines + codelines};`;
            }
            if (this.fortranLines !== 0) {
              this.scanItemsObj.lines.content +=
                `Fortran: ${this.fortranLines + codelines};`;
            }
            if (this.pythonLines !== 0) {
              this.scanItemsObj.lines.content +=
                `Python: ${this.pythonLines + codelines};`;
            }
            if (this.golangLines !== 0) {
              this.scanItemsObj.lines.content +=
                `Go: ${this.golangLines + codelines};`;
            }
            if (this.javaLines !== 0) {
              this.scanItemsObj.lines.content +=
                `Java: ${this.javaLines + codelines};`;
            }
            if (this.scalaLines !== 0) {
              this.scanItemsObj.lines.content +=
                `Scala: ${this.scalaLines + codelines};`;
            }
        }
    }

    /**
     * 映射依赖库文件类型
     * @param list 依赖库文件类型
     */
    linePortingLevel(list: Array<any>): Array<any> {
      let rowSpan = 1;
      list[0] = Object.assign(list[0], { rowSpan, showTd: true });
      list.reduce((pre, cur) => {
        if (pre.url === cur.url && pre.oper === cur.oper && pre.result === cur.result) {
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
     * 映射依赖库文件类型
     * @param fielType 依赖库文件类型
     */
    formatSoFileType(fielType: any) {
        let typeName = '--';
        switch (fielType) {
            case 'DYNAMIC_LIBRARY':
                typeName = i18n.plugins_port_option_soFileType_dynamic_library;
                break;
            case 'STATIC_LIBRARY':
                typeName = i18n.plugins_port_option_soFileType_static_library;
                break;
            case 'EXEC':
                typeName = i18n.plugins_port_option_soFileType_executable_file;
                break;
            case 'SOFTWARE':
                typeName = i18n.plugins_port_option_soFileType_software_package;
                break;
            case 'JAR':
                typeName = i18n.plugins_port_option_soFileType_jar_packagey;
                break;
        }
        return typeName;
    }

    /**
     * 格式化修改建议
     * @param level 建议级别
     * @param flag 修改标志
     */
    formatSoSuggestion(level: any, flag: any) {
        let suggestion = '';
        switch (level) {
            case '0':
                const level0En = 'Compatible with the Kunpeng platform.';
                suggestion = flag ? i18n.plugins_port_report_level0_desc : level0En;
                break;
            case '1':
                const level1En = 'Compatible with the Kunpeng platform.';
                suggestion = flag ? i18n.plugins_port_report_level1_desc : level1En;
                break;
            case '2':
                const level2En = 'Not compatible with the Kunpeng platform.';
                suggestion = flag ? i18n.plugins_port_report_level2_desc : level2En;
                break;
            case '3':
                const level3En = 'The compatibility with the Kunpeng platform is unknown.';
                suggestion = flag ? i18n.plugins_port_report_level7_desc : level3En;
                break;
        }
        return suggestion;
    }

    /**
     * 格式化依赖库文件结果
     */
    formatSoResult(level: any, type: any, flag: boolean) {
        let result = '';
        switch (level) {
            case '0':
                const levelResult0En = `Download`;
                result = flag ? i18n.plugins_port_report_level0_result : levelResult0En; // 动态库也需要维护一个format
                break;
            case '1':
                const levelResult1En = 'Download Source Code';
                result = flag ? i18n.plugins_port_report_level1_result : levelResult1En;
                break;
            case '2':
                const levelResult2En = 'Obtain the source code and compile it to a' +
                    'Kunpeng-compatible version or use an alternate solution.';
                result = flag ? i18n.plugins_port_report_level2_result : levelResult2En;
                break;
            case '3':
                const levelResult3En = 'Verify whether it is compatible with the Kunpeng platform. If not,' +
                    ' obtain a Kunpeng-compatible version from the supplier or obtain the source code and compile ' +
                    'it to a Kunpeng-compatible version.';
                result = flag ? i18n.plugins_port_report_level7_result : levelResult3En;
                break;
        }
        return result;
    }

    /**
     * 返回的id数据处理20190822114355 => 2019/08/22 11:43:55
     * @param data 20190822114355
     */
    public formatCreatedId(data: string) {
        const years = data.slice(0, 4);
        const months = data.slice(4, 6);
        const days = data.slice(6, 8);
        const hours = data.slice(8, 10);
        const minutes = data.slice(10, 12);
        const seconds = data.slice(12, 14);
        return `${years}/${months}/${days} ${hours}:${minutes}:${seconds}`;
    }
}
