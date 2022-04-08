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

import { I18nService, LANGUAGE_TYPE } from '../i18nservice';
import * as vscode from 'vscode';
import { TOOL_NAME_PORTING, SOFTWARE_PACKAGE_URLS } from '../constant';
import { Utils } from '../utils';

export class ReportSoftWareBuild {

    // 日期 | 包名
    public currentReport = '';

    // 配置信息 左侧
    public settingLeftInfo: any;

    // 配置信息; 右侧
    public settingRightInfo: any;

    // 表格标题以及类型
    public scanItems: any;

    // 第一个表格数据
    public soFileSrcData: any;

    // 第二个表格数据
    public cFileSrcData: any;
    public i18n: any;
    public currLang: number;

    public extensionPath = '';  // 插件安装路径

    constructor(

    ) {
        this.i18n = I18nService.I18n();
        this.currLang = I18nService.getLang();
        this.settingLeftInfo = {
            firstItem: {
                label: this.i18n.software_package_detail.common_term_path_label,
                value: ''
            },
            fifthItem: {
                label: this.i18n.software_package_detail.time,
                value: ''
            },
            seventhItem: {
                label: this.i18n.software_package_detail.path,
                value: ''
            },
            sixthItem: {
                label: this.i18n.software_package_detail.result,
                value: '',
                isSuccessed: ''
            }
        };

        this.settingRightInfo = [
            { title: this.i18n.software_package_detail.relayNum },
            { title: this.i18n.software_package_detail.lackNum },
            { title: this.i18n.common_term_report_right_info }
        ];

        this.scanItems = {
            soFile: {
                label: this.i18n.software_package_detail.relayNum
            },
            type: ['soFile']
        };

        this.soFileSrcData = {
            data: [],
            state: {
                searched: false,
                sorted: false,
                paginated: false
            }
        };
        this.cFileSrcData = {
            data: [],
            state: {
                searched: false,
                sorted: false,
                paginated: false
            }
        };
    }

    /**
     * 获取报告页详情信息
     *
     * @param context 上下文
     * @param id 报告id
     */
    public async getReportDetail(context: vscode.ExtensionContext, reportId: any): Promise<string> {
        const option = {
            url: SOFTWARE_PACKAGE_URLS.SOFTWAREPKG_REPORT_QUERY_URL + `${encodeURIComponent(reportId)}/`,
            method: 'GET',
            timeout: 10000
        };
        // 发送请求，获取报告信息
        const resp: any = await Utils.requestDataHelper(context, option, TOOL_NAME_PORTING);
        return resp;
    }

    /**
     * 获取报告页HTML元素信息
     * @param resp 报告详细信息
     */
    public async getHtmlContent(res: any, name: any): Promise<object> {
        this.currentReport = name;
        if (res.status === 0) {
            const data = res.data;
            const successList = data.replaced;
            const failList = data.missing;

            this.settingLeftInfo.firstItem.value = data.package_path;
            this.settingLeftInfo.fifthItem.value = data.report_time;
            this.settingLeftInfo.seventhItem.value = data.result_path ? data.result_path : '';
            this.settingLeftInfo.sixthItem.value = data.status
                ? this.currLang === LANGUAGE_TYPE.EN ? data.info : data.info_chinese
                : this.i18n.software_package_detail.packageSuccess;
            this.settingLeftInfo.sixthItem.isSuccessed = data.status ? 'false' : 'true';

            this.settingRightInfo[0].value = successList.length;
            this.settingRightInfo[1].value = failList.length;
            this.settingRightInfo[2].value = this.settingRightInfo[0].value + this.settingRightInfo[1].value;
            this.soFileSrcData.data = successList.map((item: any, index: number) => Object.assign(item, {
                number: ++index,
                sourceFile: this.handleStatus(item.status)
            }));

            // 重构失败
            if (data.status && failList.length) {
                this.scanItems = {
                    soFile: {
                        label: this.i18n.software_package_detail.relayNum
                    },
                    cFile: {
                        label: this.i18n.software_package_detail.lackNum
                    },
                    type: ['soFile', 'cFile']
                };

                this.cFileSrcData.data = failList.map((item: any, index: number) => Object.assign(item, {
                    number: ++index,
                    url: item.url || '--',
                    suggestion: this.handleStatus(item.status, item.url, item.name),
                    isClick: false // 是否点击了 复制链接
                }));
            }
        }
        const reportDetail = {
            currentReport: this.currentReport,
            settingLeftInfo: this.settingLeftInfo,
            settingRightInfo: {
                top: this.settingRightInfo
            },
            scanItems: this.scanItems,
            soFileSrcData: this.soFileSrcData.data,
            cFileSrcData: this.cFileSrcData.data
        };
        return reportDetail;
    }

    /**
     * 对返回的状态码进行处理
     * @param status 状态码
     * @param url 是否有链接
     * @param fileName 文件名
     */
    public handleStatus(status: number, url?: string, fileName?: string): string | void {
        let suggestion = '';
        switch (status) {
            case 0:
                suggestion = this.i18n.software_package_detail.status.tooDownload;
                break;
            case 1:
                suggestion = this.i18n.software_package_detail.status.userUpload;
                break;
            default:
                if (fileName) {
                    const lastIndex = fileName.lastIndexOf('.');
                    const lastName = fileName.slice(lastIndex);
                    if (url) {
                        if (lastName === '.jar') {
                            suggestion = this.i18n.software_package_detail.status.suggestion_1;
                        } else {
                            suggestion = this.i18n.software_package_detail.status.suggestion;
                        }
                    } else {
                        suggestion = this.i18n.software_package_detail.common_term_report_level_result;
                    }
                }
                break;
        }
        return suggestion;
    }
    /**
     * 组装html报告页面详细信息
     * @param currentReport 日期 | 包名
     * @param settingLeftInfo 配置信息 左侧
     * @param settingRightInfo 配置信息 右侧
     * @param scanItems 表格标题以及类型
     * @param soFileSrcData 第一个表格数据
     * @param cFileSrcData 第二个表格数据
     */
    public async createReportHTML(context: vscode.ExtensionContext, reportDetail: any): Promise<string> {
        const {
            currentReport,
            settingLeftInfo,
            settingRightInfo,
            scanItems,
            soFileSrcData,
            cFileSrcData
        } = reportDetail;
        let softNone = 'flex';
        let sysNone = 'flex';
        const maxHeight = scanItems.type.length >= 2 ? '180px' : '380px';
        if (!settingLeftInfo.firstItem.value.length) {
            softNone = 'none';
        }
        if (!settingLeftInfo.seventhItem.value.length) {
            sysNone = 'none';
        }
        let args = '';
        let scanTemp = '';
        let settingRTopContent = '';
        let svgSorF = '';
        if (settingLeftInfo.sixthItem.isSuccessed === 'true') {  // 重构成功
            svgSorF = `<svg width="16px" height="16px" viewBox="0 0 16 16" version="1.1"
            xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                <title>4.组件/2.通用/icon/16/告警/成功</title>
                <defs>
                    <path d="M8,0 C12.418278,0 16,3.581722 16,8 C16,12.418278 12.418278,16 8,16 C3.581722,
                    16 0,12.418278 0,8 C0,3.581722 3.581722,0 8,0 Z" id="path-1"></path>
                </defs>
                <g id="VS-Code补全web需求-0130" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                    <g id="代码迁移工具-软件包重构-成功报告" transform="translate(-526.000000, -269.000000)">
                        <g id="中心内容" transform="translate(304.000000, 104.000000)">
                            <g id="配置信息" transform="translate(80.000000, 38.000000)">
                                <g id="编组" transform="translate(142.000000, 127.000000)">
                                    <mask id="mask-2" fill="white">
                                        <use xlink:href="#path-1"></use>
                                    </mask>
                                    <use id="蒙版" fill="#3AD53E" fill-rule="nonzero" xlink:href="#path-1"></use>
                                    <g mask="url(#mask-2)" fill="#61D274" id="3.颜色/2.成功-安全">
                                        <g>
                                            <rect id="矩形" x="0" y="0" width="16" height="16"></rect>
                                        </g>
                                    </g>
                                    <path d="M5.07067608,4.08190397 C5.28676075,4.08181549 5.46654171,4.23744964 5.50389526,
                                    4.44276966 L5.51101928,4.52188659 L5.51256655,8.29915708 L12.1905305,
                                    8.29915708 C12.4336258,8.29915708 12.6306935,8.49622474 12.6306935,8.73932001 C12.6306935,
                                    8.9554047 12.4749857,9.13512189 12.2696504,9.17239133 L12.1905305,9.17948294 L5.51256655,
                                    9.17948294 C5.0611039,9.17948294 4.6890154,8.83964178 4.63816332,8.40196604 L4.63224073,
                                    8.29933739 L4.63069346,4.52224721 C4.63059391,4.27915195 4.82758083,4.08200359 5.07067608,
                                    4.08190397 Z" id="路径" fill="#FFFFFF" fill-rule="nonzero"
                                    transform="translate(8.630693, 6.630693) rotate(-45.000000) translate(-8.630693, -6.630693) "></path>
                                </g>
                            </g>
                        </g>
                    </g>
                </g>
            </svg>`;
        } else {
            svgSorF = `<svg width="16px" height="16px" viewBox="0 0 16 16" version="1.1"
            xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
            <title>4.组件/2.通用/icon/16/告警/成功</title>
            <defs>
                <path d="M8,0 C12.418278,0 16,3.581722 16,8 C16,12.418278 12.418278,16 8,16 C3.581722,16 0,
                12.418278 0,8 C0,3.581722 3.581722,0 8,0 Z" id="path-1"></path>
            </defs>
            <g id="VS-Code补全web需求-0130" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                <g id="代码迁移工具-软件包重构-失败报告" transform="translate(-526.000000, -231.000000)">
                    <g id="中心内容" transform="translate(304.000000, 104.000000)">
                        <g id="配置信息" transform="translate(80.000000, 38.000000)">
                            <g id="编组" transform="translate(142.000000, 89.000000)">
                                <mask id="mask-2" fill="white">
                                    <use xlink:href="#path-1"></use>
                                </mask>
                                <use id="蒙版" fill="#3AD53E" fill-rule="nonzero" xlink:href="#path-1"></use>
                                <g mask="url(#mask-2)" fill="#ED4B4B" id="3.颜色/2.成功-安全">
                                    <g>
                                        <rect id="矩形" x="0" y="0" width="16" height="16"></rect>
                                    </g>
                                </g>
                                <path d="M8.203125,6.625 L8.4765625,12.5 L7,12.5 L7.21875,6.625 L8.203125,6.625 Z M8.421875,
                                4 L8.421875,5.4765625 L7.0546875,5.4765625 L7.0546875,4 L8.421875,4 Z" id="形状结合" fill="#FFFFFF"
                                fill-rule="nonzero" transform="translate(7.738281, 8.250000) scale(1, -1) translate(-7.738281, -8.250000) ">
                                </path>
                            </g>
                        </g>
                    </g>
                </g>
            </g>
        </svg>`;
        }
        settingRightInfo.top.forEach((info: any) => {
            settingRTopContent += `
        <div class="setting-right-item">
          <p>${info.title}</p>
          <p>${info.value}</p>
        </div>
      `;
        });
        args = `<h1 style="font-size: 20px;color: #282b33;margin-bottom: 24px;font-weight: normal;line-height: 1;">
        ${this.i18n.software_package_detail.common_term_config_title
            }</h1>
      <div class="setting-left">
        <div class="setting-left-item" style="display: ${softNone};">
          <span class="content ellispis">${settingLeftInfo.firstItem.label}</span>
          <span class="content ellispis">${settingLeftInfo.firstItem.value}</span>
        </div>
        <div class="setting-left-item">
          <span>${settingLeftInfo.fifthItem.label}</span>
          <span class="ellispis">${settingLeftInfo.fifthItem.value}</span>
        </div>
        <div class="setting-left-item" style="display: ${sysNone};">
          <span class="content ellispis">${settingLeftInfo.seventhItem.label}</span>
          <span class="content ellispis">${settingLeftInfo.seventhItem.value}</span>
        </div>
        <div class="setting-left-item">
          <span>${settingLeftInfo.sixthItem.label}</span>
          <span class="content ellispis" style="display: inline-block;margin: 0;">
            <span style="vertical-align: top; margin-right: 5px;">${svgSorF}</span>
            <span>${settingLeftInfo.sixthItem.value}</span>
          </span>
        </div>
      </div>
      <div class="setting-right">
        ${settingRTopContent}
      </div>
    `;
        scanItems.type.forEach((item: any) => {
            let itemFile = '';
            let fileListCon = '';
            let realHeadContent = '';
            let headContent = '';
            if (item === 'soFile') {  // 已更新依赖文件
                // 软件包重构
                realHeadContent = `
                    <th style="width: 10%;text-align: left;">${this.i18n.common_term_no_label}</th>
                    <th style="width: 20%;text-align: left;">${this.i18n.software_package_detail.common_term_name_label_1}</th>
                    <th style="width: 30%;text-align: left;">${this.i18n.software_package_detail.common_term_filePath_label}</th>
                    <th style="width: 40%;text-align: left;">${this.i18n.software_package_detail.fileSource}</th>
                `;
                headContent = `
                    <th style="width: 10%;"></th>
                    <th style="width: 20%;"></th>
                    <th style="width: 30%;"></th>
                    <th style="width: 40%;"></th>
                `;

                if (soFileSrcData.length !== 0) {
                    soFileSrcData.forEach((bin: any) => {
                        itemFile += `
                            <tr style="line-height:24px;">
                            <td style="border-bottom: 1px solid #E6EBF5;">
                                <span class="content">${bin.number}</span>
                            </td>
                            <td style="word-break: break-all;border-bottom: 1px solid #E6EBF5;">
                                <span class="content">${bin.name}</span>
                            </td>
                            <td style="word-break: break-all;border-bottom: 1px solid #E6EBF5;">
                                <span class="content">${bin.path}</span>
                            </td>
                            <td style="word-break: break-all;border-bottom: 1px solid #E6EBF5;">
                                <span class="content">${bin.sourceFile}</span>
                            </td>
                            </tr>
                        `;
                    });
                } else {
                    itemFile += `
                        <div class="ti3-table-nodata">
                        <?xml version="1.0" encoding="UTF-8"?>
<svg width="320px" height="130px" viewBox="0 0 320 130" version="1.1"
 xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <title>Web_SFW/缺省页/插画/空数据</title>
    <defs>
        <linearGradient x1="49.9902458%" y1="3.28731867%" x2="49.9902458%" y2="106.785213%" id="linearGradient-1">
            <stop stop-color="#7C8084" offset="0%"></stop>
            <stop stop-color="#7A7E82" stop-opacity="0.95" offset="14%"></stop>
            <stop stop-color="#74787D" stop-opacity="0.83" offset="33%"></stop>
            <stop stop-color="#6B6F73" stop-opacity="0.62" offset="55%"></stop>
            <stop stop-color="#5E6267" stop-opacity="0.33" offset="78%"></stop>
            <stop stop-color="#4F5359" stop-opacity="0" offset="100%"></stop>
        </linearGradient>
        <linearGradient x1="50%" y1="3.28300259%" x2="50%" y2="106.786022%" id="linearGradient-2">
            <stop stop-color="#B8BDC6" offset="0%"></stop>
            <stop stop-color="#BABFC8" stop-opacity="0.97" offset="11%"></stop>
            <stop stop-color="#BFC4CC" stop-opacity="0.88" offset="26%"></stop>
            <stop stop-color="#C8CCD3" stop-opacity="0.74" offset="42%"></stop>
            <stop stop-color="#D4D7DE" stop-opacity="0.55" offset="61%"></stop>
            <stop stop-color="#E3E5EB" stop-opacity="0.3" offset="80%"></stop>
            <stop stop-color="#F5F6FA" stop-opacity="0" offset="100%"></stop>
        </linearGradient>
    </defs>
    <g id="Web_SFW/缺省页/插画/空数据" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="浅色-空页面" transform="translate(64.000000, 7.000000)">
            <g id="编组" opacity="0.5" transform="translate(17.370822, 16.433333)" fill="url(#linearGradient-1)" fill-rule="nonzero">
                <rect id="矩形" opacity="0.17" x="0.132174015" y="0.174222222" width="30.7965456" height="26.5937778"></rect>
            </g>
            <g id="编组" opacity="0.5" transform="translate(103.424743, 6.766667)" fill-rule="nonzero">
                <rect id="矩形" fill="url(#linearGradient-2)" opacity="0.17"
                 x="0.274474266" y="0.23623176" width="84.782051" height="70.2032332"></rect>
                <rect id="矩形" fill="#FFFFFF" x="0.274474266" y="0.23623176" width="84.782051" height="3.63433476"></rect>
                <rect id="矩形" fill="#E1E4EA" x="76.5173259" y="1.23567382" width="1.52485703" height="1.51430615"></rect>
                <rect id="矩形" fill="#E1E4EA" x="79.3139137" y="1.23567382" width="1.52485703" height="1.51430615"></rect>
                <rect id="矩形" fill="#E1E4EA" x="82.1105015" y="1.23567382" width="1.52485703" height="1.51430615"></rect>
            </g>
            <path d="M192.379357,50.2357063 C181.640387,44.7764027
             172.136307,46.3323042 174.560351,59.4831599 C176.984394,72.6340156
              175.834879,83.7861596 165.595963,81.9724577 C155.357048,80.1587557
              145.121181,55.4281106 143.425875,35.6775634 C141.730569,15.9270163
               107.754322,-10.9054607 92.0879882,4.65052149 C92.0879882,4.65052149
               87.5478614,10.167451 87.9838843,20.2974921" id="路径" stroke="#0077FF"
                stroke-width="0.75" stroke-dasharray="4"></path>
            <path d="M156.604132,100.179727 L156.604132,26.1 L38.642578,26.1
             L38.642578,100.179727 L94.68339,100.179727 L94.68339,113.220273
             L76.5717545,113.220273 C75.8033378,113.220273 75.1804131,113.842536
              75.1804131,114.610136 C75.1804131,115.377737 75.8033378,116
              76.5717545,116 L118.986495,116 C119.483573,116 119.942893,115.735094
               120.191432,115.305068 C120.439971,114.875043 120.439971,114.34523
               120.191432,113.915205 C119.942893,113.485179 119.483573,113.220273
                118.986495,113.220273 L100.877884,113.220273 L100.877884,100.179727
                L156.604132,100.179727 Z" id="路径" stroke="#B8BCC1" stroke-linejoin="round"></path>
            <rect id="矩形" stroke="#B8BCC1" fill="#FBFDFF" fill-rule="nonzero"
            x="38.642578" y="25.1333333" width="117.961554" height="66.7"></rect>
            <line x1="45.4108638" y1="32.8666667" x2="152.73654" y2="32.8666667"
             id="路径" stroke="#B8BCC1" stroke-linecap="round" stroke-linejoin="round"></line>
            <rect id="矩形" fill="#B8BCC1" fill-rule="nonzero" x="146.935152"
             y="29" width="1.93379596" height="1.93333333"></rect>
            <rect id="矩形" fill="#B8BCC1" fill-rule="nonzero" x="143.06756"
             y="29" width="1.93379596" height="1.93333333"></rect>
            <rect id="矩形" fill="#B8BCC1" fill-rule="nonzero" x="150.802744"
             y="29" width="1.93379596" height="1.93333333"></rect>
            <path d="M186.897255,56.7138957 C188.870222,59.2986627
             185.944132,62.2231964 183.357989,60.2544549 L183.357989,60.2544549 C181.385023,57.6665125
             184.311113,54.7419788 186.897255,56.7138957 Z" id="路径"
              stroke="#B8BCC1" stroke-linejoin="round"></path>
            <polygon id="路径" stroke="#9398A0" fill="#B8BDC6"
            fill-rule="nonzero" stroke-linejoin="round" points="115.994417 61.8752307 127.56139 63.8 127.597192
             63.7550388 116.325583 61.8666667"></polygon>
            <polygon id="路径" stroke="#9398A0" fill="#B8BDC6"
             fill-rule="nonzero" stroke-linejoin="round" points="79.2522932 61.8752307 67.6883027
             63.8 67.6495174 63.7550388 78.9211263 61.8666667"></polygon>
            <rect id="矩形" stroke="#91969B" fill="#E8EBF2"
            fill-rule="nonzero" x="78.2853952" y="61.8666667" width="37.7090213" height="19.3333333"></rect>
            <polygon id="路径" stroke="#91969B" fill="#F0F6FF"
             fill-rule="nonzero" points="116.527044 60.9 78.3784532 60.9 74.4178033 71.5333333 119.862008 71.5333333"></polygon>
            <polygon id="矩形" fill="#0077FF" fill-rule="nonzero"
             transform="translate(97.521520, 47.759428) rotate(179.900000) translate(-97.521520, -47.759428) "
            points="96.2937569
             43.3284159 98.7493255 43.3284041 98.7492829 52.1904406 96.2937143 52.1904524"></polygon>
            <polygon id="矩形" fill="#0077FF" fill-rule="nonzero"
             transform="translate(107.348753, 51.183537) rotate(-139.940000) translate(-107.348753, -51.183537) "
             points="106.113553 46.7559029 108.571931 46.7592433 108.583953 55.6111707 106.125575 55.6078304"></polygon>
            <polygon id="矩形" fill="#0077FF" fill-rule="nonzero"
             transform="translate(87.712659, 51.219690) rotate(-40.250000) translate(-87.712659, -51.219690) "
             points="86.4894768 46.7954383 88.9478764 46.7920942
             88.9358407 55.6439418 86.4774411 55.6472859"></polygon>
            <ellipse id="椭圆形" stroke="#B8BCC1" stroke-linejoin="round" cx="24.1391082" cy="80.2333333" rx="1" ry="1"></ellipse>
            <path d="M93.906109,30.9333333 C99.4698377,38.0547194
             107.602843,53.4313938 67.7577991,47.257926
              C51.6618591,44.7621412 15.573547,35.8349108 6.31078916,43.1782777
             C-3.46521661,50.9326093 3.07641633,58 3.07641633,58"
              id="路径" stroke="#0077FF" stroke-width="0.75" stroke-dasharray="4"></path>
            <path d="M5.28459759,62.8333333
             C6.6196051,62.8333333 7.70184255,61.7513548 7.70184255,60.4166667
              C7.70184255,59.0819785 6.6196051,58 5.28459759,58
             C3.94959006,58 2.86735264,59.0819785
              2.86735264,60.4166667 C2.86735264,61.7513548
               3.94959006,62.8333333 5.28459759,62.8333333 Z"
               id="椭圆形" stroke="#0077FF" stroke-width="0.75" stroke-dasharray="4"></path>
        </g>
    </g>
</svg>
                          <div class="nodata-tip">${this.i18n.common_term_task_nodata}</div>
                        </div>
                    `;
                }
            }

            if (item === 'cFile') {  // 缺失依赖文件
                // 软件包重构
                let bool = false;
                realHeadContent = `
                    <th style="width: 5%;text-align: left;">${this.i18n.common_term_no_label}</th>
                    <th style="width: 10%;text-align: left;">${this.i18n.software_package_detail.common_term_name_label_1}</th>
                    <th style="width: 20%;text-align: left;">${this.i18n.software_package_detail.common_term_filePath_label}</th>
                `;
                headContent = `
                    <th style="width: 5%;"></th>
                    <th style="width: 10%;"></th>
                    <th style="width: 20%;"></th>
                `;

                cFileSrcData.forEach((bin: any) => {
                    let suggestionContent = '';
                    if (bin.url) {
                        if (!bool) {
                            realHeadContent += `
                                <th style="width: 45%;text-align: left;">${this.i18n.common_term_operate_sugg_label}</th>
                                <th style="width: 20%;text-align: left;">${this.i18n.common_term_operate}</th>
                            `;
                            headContent += `
                                <th style="width: 45%;"></th>
                                <th style="width: 20%;"></th>
                            `;
                            bool = true;
                        }
                        if (bin.url !== '--') {
                            suggestionContent = `
                                <td style="position: relative;border-bottom: 1px solid #E6EBF5;">
                                    <a onclick="downloadSoFile('${bin.url}')"
                                    style="color: #0067ff;cursor: pointer;
                                    text-transform: capitalize;">${this.i18n.common_term_operate_download}</a>
                                    <span class="copy-link" onclick="onCopyLink('${bin.url}', '.copy-inp')">
                                    ${this.i18n.common_term_report_detail.copyLink}</span>
                                    <input class="copy-inp" />
                                </td>
                            `;
                        } else {
                            suggestionContent = `
                                <td style="border-bottom: 1px solid #E6EBF5;"></td>
                            `;
                        }
                    } else {
                        if (!bool) {
                            realHeadContent += `
                                <th style="width: 55%;text-align: left;">${this.i18n.common_term_operate_sugg_label}</th>
                            `;
                            headContent += `
                                <th style="width: 55%;"></th>
                            `;
                            bool = true;
                        }
                        suggestionContent = '';
                    }
                    itemFile += `
                    <tr style="line-height:24px;">
                        <td style="border-bottom: 1px solid #E6EBF5;">
                        <span class="content">${bin.number}</span>
                        </td>
                        <td style="word-break: break-all;border-bottom: 1px solid #E6EBF5;">
                        <span class="content">${bin.name}</span>
                        </td>
                        <td style="word-break: break-all;border-bottom: 1px solid #E6EBF5;">
                        <span class="content">${bin.path}</span>
                        </td>
                        <td style="word-break: break-all;border-bottom: 1px solid #E6EBF5;">
                        <span class="content">${bin.suggestion}</span>
                        </td>
                        ${suggestionContent}
                    </tr>
                    `;
                });
            }

            // theade th设置 text-align: left 是为了兼容IE
            fileListCon += `
                <div class="ti-table">
                    <div class="table">
                    <table style="table-layout:fixed;text-align: left;line-height: 24px; padding-right: 17px;">
                        <thead>
                        <tr class="table-header">
                            ${realHeadContent}
                        </tr>
                        </thead>
                    </table>
                    </div>
                    <div style="max-height: ${maxHeight};overflow-x: hidden;overflow-y: auto;margin-top: -4px;
                    border-bottom: 1px solid #e1e6ee;">
                    <table class="table real-table">
                        <thead>
                        <tr>
                            ${headContent}
                        </tr>
                        </thead>
                        <tbody style="font-size: 14px;">${itemFile}</tbody>
                    </table>
                    </div>
                </div>
            `;

            scanTemp += `
                <div class="table-container" style="line-height: 56px;margin-top:30px;">
                <div class="detail-label" style="display:inline-block;width: 350px;font-size: 20px;color: #282b33;">
                    <span>${scanItems[item].label}</span>
                </div>
                </div>
                ${fileListCon}
            `;
        });
        const template = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta content="ie=edge">
            <meta name="viewport">
            <title>${currentReport}</title>
            <style>
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
              margin-top: 10px;
            }
            .setting-right-item {
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              align-items: center;
              margin-left: 14px;
              position: relative;
            }
            .setting-right-item:first-child {
              margin-right: 20px;
              padding-right: 30px;
            }
            .setting-right-item:nth-child(3) {
              border-left: 1px solid #E1E6EE;
              padding: 0 40px;
            }
            .setting-right-item p {
              margin: 0;
            }
            .setting-right-item p:first-child{
              font-size: 16px;
              padding: 0 20px;
              line-height: 24px;
              color: #979797;
              text-align: center;
            }
            .setting-right-item p:nth-child(2){
              font-size: 48px;
              color: #222;
            }
            .ti3-table-nodata {
              height: 180px !important;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
            }
            .nodata-tip{
              text-align: center;
              width: 100%;
              padding-bottom: 5px;
            }

            th, td {
              padding: 5px 10px;
            }
            .path_more{
              position: absolute;
              top: 40%;
              width: 16px;
              height: 16px;
              transform: translateY(-50%) rotateZ(-90deg);
              cursor: pointer;
            }
            .no-border {
              display: flex;
              padding: 0 !important;
              border-bottom: none !important;
            }
            .no-border div:first-child {
              box-sizing: border-box;
              width: 22px;
            }
            .no-border div:last-child {
              flex: 1;
              border-bottom: 1px solid #e6ebf5;
            }
            .ext_more::before {
              position: absolute;
              top: 0;
              left: 0;
              content: '';
              width: 100%;
              height: calc(100% + 1px);
              border-right: 2px solid #0067ff;
              background-color: #F5F9FF;
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
              line-height: 1;
            }
            .copy-link {
              position: relative;
              display: inline;
              margin-left: 16px;
              color: #0067FF;
              cursor: pointer;
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
      </head>
      <body style="padding:0 80px;">
        <div style="min-width: 1300px;width: 100%; height: 100%;">
        <h1 style="text-align: center;font-weight: normal;font-size: 24px;border-bottom: solid 1px #222;
        padding-bottom:20px">${currentReport}</h1>
        <div >
        ${args}
        </div>
        <div style ="float:left;width:100%">
          ${scanTemp}
        </div>
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
          function onCopyLink(url, select) {
            const aInp = document.querySelector(select);
            aInp.value = url;
            aInp.select();
            document.execCommand('copy', false, null); // 执行浏览器复制命令
          }
          // 设置 title 属性
          function setTitle() {
            let tdList = document.querySelectorAll('.content');
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

            // 进行行合并处理
            num--;
            let rowspan = document.querySelectorAll('.rowspan'+ num);
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
}
