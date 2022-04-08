import { Injectable } from '@angular/core';
import { I18nService } from '../i18n.service';
import { AxiosService } from '../axios.service';
import { CommonService } from '../common/common.service';
import { MytipService } from '../mytip.service';

import { RightItem, TextForm } from './Interface';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private i18n: any;

  constructor(
    private i18nService: I18nService,
    private Axios: AxiosService,
    private commonServe: CommonService,
    private mytipServe: MytipService
  ) {
    this.i18n = this.i18nService.I18n();
  }

  /**
   * 点击复制下载链接
   * @param url 链接地址
   * @param select 要复制的 input 类名
   */
  onCopyLink(url: string, select: string): void {
    const aInp: HTMLInputElement = document.querySelector(select);
    aInp.value = url;
    aInp.select();
    document.execCommand('copy', false, null); // 执行浏览器复制命令
  }

  /**
   * 通过 form 构建 下载重构包
   * @param reportName 软件包名
   * @param reportId 软件包 id
   */
  downloadPackage(reportName: string, reportId: string): void {
    const idx = reportName.lastIndexOf('.');
    const suffix = reportName.slice(idx + 1);
    const pathStr = reportId && reportId + '/';
    let type = '';
    if (suffix === 'txt' || suffix === 'rpm' || suffix === 'deb') {
      type = 'report/packagerebuild';
    } else if (suffix === 'jar') {
      type = 'jars';
    } else {
      type = 'sos';
    }
    const form = document.createElement('form');
    form.action = `${location.origin}/porting/api/portadv/download/`;
    form.method = 'post';
    const input0 = document.createElement('input');
    input0.type = 'hidden';
    input0.name = 'sub_path';
    input0.value = type;
    form.appendChild(input0);
    const input1 = document.createElement('input');
    input1.type = 'hidden';
    input1.name = 'jwt';
    input1.value = sessionStorage.getItem('token').slice(3).trim();
    form.appendChild(input1);
    const input2 = document.createElement('input');
    input2.type = 'hidden';
    input2.name = 'file_path';
    input2.value = pathStr + decodeURIComponent(reportName);
    form.appendChild(input2);
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  }

  /**
   * 下载 csv 报告
   * @param id 报告的 id
   * @param url 下载csv 的url
   */
  downloadCSV(id: string, url?: string): void {
    if (!url) {
      // 软件迁移评估
      url = `/portadv/binary/${encodeURIComponent(id)}/?report_type=0`;
    }
    this.Axios.axios.get(url).then((resp: any) => {
      if (resp.status && this.commonServe.handleStatus(resp) !== 0) {
        const content = sessionStorage.getItem('language') === 'zh-cn'
          ? resp.infochinese
          : resp.info;
        this.mytipServe.alertInfo({ type: 'error', content, time: 5000 });
        return;
      }
      const file = new Blob(['\ufeff' + resp]);
      // 如果是 IE 浏览器
      if (window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(file, id + '.csv');
      } else {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(file);
        link.setAttribute('style', 'visibility:hidden');
        link.download = id + '.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    });
  }

  /**
   * 通过 a 链接 下载 html 报告
   * @param content 下载内容
   * @param fileName 下载名字
   */
  downloadReportHTML(content: any, fileName: string) {
    const blob = new Blob([content]);
    if ('download' in document.createElement('a')) {
      const link = document.createElement('a');
      link.setAttribute('style', 'visibility:hidden');
      link.download = fileName;
      link.href = URL.createObjectURL(blob);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      if (window.navigator && window.navigator.msSaveOrOpenBlob) {
        // for IE
        window.navigator.msSaveOrOpenBlob(blob, fileName);
      }
    }
  }

  /**
   * 下载 html 模板
   * @param type 具体功能
   * @param currentReport 日期 | 包名
   * @param settingLeftInfo 配置信息 左侧
   * @param settingRightInfo 配置信息 右侧
   * @param scanItems 表格标题以及类型
   * @param soFileSrcData 第一个表格数据
   * @param imgBase2 下拉图片
   * @param cFileSrcData 第二个表格数据
   */
  downloadTemplete(
    type: string,
    currentReport: string,
    settingLeftInfo: TextForm,
    settingRightInfo: {
      top: Array<object>
    } | '',
    scanItems: any,
    soFileSrcData: Array<object>,
    imgBase2?: any,
    cFileSrcData?: Array<object>,
  ): string {
    let softNone = 'flex';
    let sysNone = 'flex';
    let rightNone = 'flex';
    let maxHeight = scanItems.type.length >= 2 ? '190px' : '380px';
    if (!settingLeftInfo.firstItem.value.length) {
      softNone = 'none';
    }
    if (settingLeftInfo.seventhItem && !settingLeftInfo.seventhItem.value.length) {
      sysNone = 'none';
    }
    if (!settingRightInfo) {
      rightNone = 'none';
    }
    const iii = location.href.indexOf('#');
    const api = location.href.slice(0, iii);
    let args = '';
    let scanTemp = '';
    let tipImg = '';
    let settingRTopContent = '';

    // 软件包重构
    if (type === 'softwarePackage') {
      const tipImgsrc = settingLeftInfo.sixthItem.isSuccessed === 'true'
        ? `${api + './assets/img/common/success_tip_16.png'}`
        : `${api + './assets/img/common/fail_tip_16.png'}`;
      tipImg = `<img src="${tipImgsrc}">`;
    }

    if (settingRightInfo) {
      settingRightInfo?.top.forEach((info: RightItem) => {
        settingRTopContent += `
          <div class="setting-right-item">
            <p>${ info.title }</p>
            <p>${ info.value }</p>
          </div>
        `;
      });
    }

    const settingInfo = this.handleSettingInfo(type, settingLeftInfo, sysNone, tipImg);

    args = `
      <h1 style="font-size: 20px;color: #282b33;margin-bottom: 24px;font-weight: normal;line-height: 1;">
      ${ this.i18n.common_term_setting_infor }</h1>
      <div class="setting-left">
        <div class="setting-left-item" style="display: ${softNone};">
          <span class="content ellispis">${settingLeftInfo.firstItem.label}</span>
          <span class="content ellispis">${settingLeftInfo.firstItem.value}</span>
        </div>
        ${settingInfo}
      </div>
      <div class="setting-right" style="display: ${rightNone};">
        ${ settingRTopContent }
      </div>
    `;
    scanItems.type.forEach((item: any) => {
      let itemFile = '';
      let fileListCon = '';
      let soFoilePadding = '';
      let realHeadContent = '';
      let headContent = '';
      if (item === 'soFile') {
        // 软件迁移评估
        if (type === 'softwareEvaluation') {
          maxHeight = '500px';
          let count = -1;
          let isPathExt = false;
          soFoilePadding = soFileSrcData.length > 10
              ? 'padding-right: 17px;'
              : '';
          soFileSrcData.forEach((row: any) => {
            if (row.path_ext.length) {
              isPathExt = true;
            }
          });
          if (soFileSrcData.length !== 0) {
            let rowSpan = 0;
            soFileSrcData.forEach((bin: any, index: number) => {
              const EXT_LENGTH = bin.path_ext.length;
              let optionstr = '';
              const aarch64 = bin.hasOwnProperty('isAarch64') ? bin.isAarch64 : false;
              // 处理处理建议栏数据
              if (bin.urlName === '--') {
                if (aarch64 && (bin.level === '0' || bin.level === '3' || bin.level === '6')) {
                  optionstr = `<span>--</span>`;
                } else {
                    optionstr = `<span class="content">${bin.result}</span>`;
                }
              } else if (bin.urlName === bin.url) {  // 返回包名
                optionstr = `
                    <span class="content">${this.i18n.common_upload_unable}</span>
                `;
              } else {
                optionstr = `
                  <span class="ellispis">
                    <a
                      onclick="downloadSoFile('${bin.url}')"
                      style="color: #0067ff;text-transform: capitalize;"
                    >${bin.result}</a>
                    <span class="copy-link link${index}" onclick="onCopyLink('${bin.url}', '.copy-inp', ${index})">
                    ${ this.i18n.common_term_report_detail.copyLink }</span>
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
              if (rowSpan > 1) { // 合行显示操作，被合行的数据
                itemfileMiddle = `
                  <td class="rowspan${index}" rowspan="${bin.rowSpan}" showtd="${bin.showTd}"></td>
                  <td class="border-color rowspan${index}" rowspan="${bin.rowSpan}"></td>
                  <td class="p-relative border-color rowspan${index}" rowspan="${bin.rowSpan}"></td>
                `;
                rowSpan--;
              } else { // 合行展示数据
                itemfileMiddle += `
                  <td
                    class="border-color border-right-color rowspan${index}"
                    rowspan="${bin.rowSpan}" showtd="${bin.showTd}"
                  >
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
              // 折叠行的子数据处理
              if (EXT_LENGTH !== 0) {
                  count++;
                  if (!bin.soFileHasUrl) {
                    imgTd = `
                        <td class="p-relative border-color">
                            <img
                              src="${imgBase2}" class="path_more"
                              onclick="openDetail(${count}, ${bin.number}, '${bin.showTd}')"
                            />
                        </td>
                    `;
                    for (let i = 0; i < EXT_LENGTH; i++) {
                      subFile += `
                        <tr class="ext${count}" style="display:none;">
                          <td class="no-border">
                            <div class="ext_more p-relative" style="height: 32px;"></div>
                            <div style="height: 32px;"></div>
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
                                <img src="${imgBase2}" class="path_more" onclick="openSoDetail(${count})"/>
                            </td>
                        `;
                        for (let i = 0; i < bin.soInfoList.length; i++) {
                            const son = bin.soInfoList[i];
                            let sonResultstr = '';
                            if (son.urlName === '--') {  // 没有软件包
                                sonResultstr = `
                                    <span class="content">${ son.result }</span>
                                `;
                            } else if (son.result === '--') {  // 有软件包无下载链接
                                sonResultstr = `
                                    <span class="content">${ this.i18n.common_upload_unable }</span>
                                `;
                            } else {  // 有下载链接
                                sonResultstr = `
                                    <span class="ellispis">
                                      <a
                                        onclick="downloadSoFile('${son.url}')"
                                        style="color: #0067ff;text-transform: capitalize;"
                                      >${son.result}</a>
                                      <span
                                        class="copy-link sonlink${i}"
                                        onclick="onCopySonLink('${son.url}', '.copy-inp', ${i})"
                                      >${ this.i18n.common_term_report_detail.copyLink }</span>
                                      <input class="copy-inp" />
                                    </span>
                                `;
                            }
                            subFile += `
                            <tr class="ext${count}" style="display:none;">
                                <td class="no-border">
                                    <div class="ext_more p-relative" style="height: 32px;"></div>
                                    <div style="height: 32px;"></div>
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
                                  tiOverflow rowspan="${son.mergeRowSpan.urlName}"
                                  showtd="${son.showTd.urlName}" class="sonRowSpan border-color border-right-color"
                                >${son.urlName}</td>
                                <td
                                  tiOverflow rowspan="${son.mergeRowSpan.oper}" showtd="${son.showTd.oper}"
                                  class="sonRowSpan border-color border-right-color"
                                >${son.oper}</td>
                                <td
                                  tiOverflow rowspan="${son.mergeRowSpan.result}"
                                  showtd="${son.showTd.result}" class="sonRowSpan border-color"
                                >
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
            realHeadContent = `
              <th style="width: 2%;text-align: left;"></th>
              <th style="width: 5%;text-align: left;">${this.i18n.common_term_no_label}</th>
              <th style="width: 10%;text-align: left;">${this.i18n.common_term_name_label_1}</th>
              <th style="width: 10%;text-align: left;">${this.i18n.common_term_type_label}</th>
              <th style="width: 20%;text-align: left;">${this.i18n.commonTermSoftFilePath}</th>
              <th style="width: 20%;text-align: left;">${this.i18n.common_term_operate_analysis_name}</th>
              <th style="width: 10%;text-align: left;">${this.i18n.common_term_operate_analysis_result}</th>
              <th style="width: 23%;text-align: left;">${this.i18n.common_term_operate_sugg_label}</th>
            `;
            headContent = `
              <th style="width: 2%;"></th>
              <th style="width: 5%;"></th>
              <th style="width: 10%;"></th>
              <th style="width: 10%;"></th>
              <th style="width: 20%;"></th>
              <th style="width: 20%;"></th>
              <th style="width: 10%;"></th>
              <th style="width: 23%;"></th>
            `;
          } else {
            realHeadContent = `
              <th style="width: 5%;text-align: left;">${this.i18n.common_term_no_label}</th>
              <th style="width: 10%;text-align: left;">${this.i18n.common_term_name_label_1}</th>
              <th style="width: 10%;text-align: left;">${this.i18n.common_term_type_label}</th>
              <th style="width: 20%;text-align: left;">${this.i18n.commonTermSoftFilePath}</th>
              <th style="width: 20%;text-align: left;">${this.i18n.common_term_operate_analysis_name}</th>
              <th style="width: 10%;text-align: left;">${this.i18n.common_term_operate_analysis_result}</th>
              <th style="width: 23%;text-align: left;">${this.i18n.common_term_operate_sugg_label}</th>
            `;
            headContent = `
              <th style="width: 5%;"></th>
              <th style="width: 10%;"></th>
              <th style="width: 10%;"></th>
              <th style="width: 20%;"></th>
              <th style="width: 20%;"></th>
              <th style="width: 10%;"></th>
              <th style="width: 23%;"></th>
            `;
          }
        }

        // 软件包重构
        if (type === 'softwarePackage') {
          realHeadContent = `
            <th style="width: 10%;text-align: left;">${this.i18n.common_term_no_label}</th>
            <th style="width: 20%;text-align: left;">${this.i18n.common_term_name_label_1}</th>
            <th style="width: 30%;text-align: left;">${this.i18n.common_term_filePath_label}</th>
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
              <tr>
                <td colspan="5" style="border: none;">
                  <div class="nodata-image"></div>
                  <div style="text-align: center;border-bottom: 1px solid #e1e6e6;padding-bottom: 5px;">
                  ${this.i18n.common_term_task_nodata}</div>
                </td>
              </tr>
            `;
          }
        }

        // BC文件
        if (type === 'BCFile') {
          let count = -1;
          soFoilePadding = soFileSrcData.length > 10
              ? 'padding-right: 17px;'
              : '';
          if (soFileSrcData.length !== 0) {
            soFileSrcData.forEach((bin: any) => {
              const EXT_LENGTH = bin.data.length;
              let imgTd = '<td class="border-color"></td>';
              let subFile = '';
              let bodyData = '';
              if (EXT_LENGTH !== 0) {
                count++;
                imgTd = `
                  <td style="position: relative;border-bottom: 1px solid #E6EBF5;">
                    <img src="${imgBase2}" class="path_more" onclick="openDetail(${count}, null, null)"/>
                  </td>
                `;
                for (let i = 0; i < EXT_LENGTH; i++) {
                  bodyData +=  `
                    <tr style="line-height:24px;">
                      <td class="border-color">
                        <span class="content">${bin.data[i].num}</span>
                      </td>
                      <td class="border-color">
                        <span class="content">${bin.data[i].position}</span>
                      </td>
                    </tr>
                  `;
                }
                subFile += `
                  <tr class="ti3-details-tr ext${count}" style="display:none;">
                    <td class="nested-table-container" colspan="5">
                      <table class="table">
                        <thead>
                          <tr class="thead-tr">
                            <th style="width: 10%;text-align: left;">${this.i18n.common_term_no_label}</th>
                            <th style="width: 90%;text-align: left;">${this.i18n.common_suggestion_position}</th>
                          </tr>
                        </thead>
                        <tbody style="font-size: 14px;">
                          ${bodyData}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                  `;
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
                    <span class="content">${bin.path}</span>
                  </td>
                  <td class="border-color">
                    <span class="content">${bin.suggTotal}</span>
                  </td>
                </tr>
              `;
              itemFile += subFile;
            });
          } else {
            itemFile += `
              <tr class="ti3-table-nodata">
                <td colspan="4" style="border: none;"></td>
              </tr>
            `;
          }

          realHeadContent = `
            <th style="width: 2%;text-align: left;"></th>
            <th style="width: 8%;text-align: left;">${this.i18n.common_term_no_label}</th>
            <th style="width: 30%;text-align: left;">${this.i18n.common_term_name_label_1}</th>
            <th style="width: 40%;text-align: left;">${this.i18n.common_term_filePath_label}</th>
            <th style="width: 20%;text-align: left;">${this.i18n.common_term_cFile_suggestion_label}</th>
          `;
          headContent = `
            <th style="width: 2%;text-align: left;"></th>
            <th style="width: 8%;text-align: left;"></th>
            <th style="width: 30%;text-align: left;"></th>
            <th style="width: 40%;text-align: left;"></th>
            <th style="width: 20%;text-align: left;"></th>
          `;

        }
      }

      if (item === 'cFile') {
        soFoilePadding = cFileSrcData.length > 10
          ? 'padding-right: 17px;'
          : '';
        // 软件包重构
        if (type === 'softwarePackage') {
          let bool = false;
          realHeadContent = `
            <th style="width: 5%;text-align: left;">${this.i18n.common_term_no_label}</th>
            <th style="width: 10%;text-align: left;">${this.i18n.common_term_name_label_1}</th>
            <th style="width: 20%;text-align: left;">${this.i18n.common_term_filePath_label}</th>
          `;
          headContent = `
            <th style="width: 5%;"></th>
            <th style="width: 10%;"></th>
            <th style="width: 20%;"></th>
          `;

          cFileSrcData.forEach((bin: any, i: number) => {
            let suggestionContent = '';
            if (bin.url) {
              if (!bool) {
                realHeadContent += `
                  <th style="width: 45%;text-align: left;">${this.i18n.common_term_operate_sugg_label}</th>
                  <th style="width: 20%;text-align: left;">${this.i18n.common_term_log_down}</th>
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
                    <a
                      onclick="downloadSoFile('${bin.url}')"
                      style="color: #0067ff;text-transform: capitalize;"
                    >${this.i18n.common_term_operate_download}</a>
                    <span class="copy-link link${i}" onclick="onCopyLink('${bin.url}', '.copy-inp', ${i})">
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
      }

      // theade th设置 text-align: left 是为了兼容IE
      fileListCon += `
      <div class="ti-table">
        <div class="table" style="${soFoilePadding}">
          <table style="table-layout:fixed;text-align: left;line-height: 24px">
            <thead class="table-header">
              <tr class="thead-tr">
                ${realHeadContent}
              </tr>
            </thead>
          </table>
        </div>
        <div style="max-height: ${maxHeight};overflow-x: hidden;overflow-y: auto;margin-top: -4px;">
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

      let suggText = '';
      if (type === 'BCFile') {
        suggText = `
          <div class="BCFile">
            <span class="total">${this.i18n.check_weak.report_list_tip}：${settingLeftInfo.firstItem.fixSum}</span>
            <span class="suggestion">
              ${this.i18n.check_weak.report_list_tip_1}
              ：add "__asm__ volatile("dmb sy")" in the position indicated by the below items
            </span>
          </div>
        `;
      }
      scanTemp += `
        <div class="table-container">
          <div class="detail-label">
            <span>${ scanItems[item].label }</span>
          </div>
          ${suggText}
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
          <style>
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
            .width400 {
              display: inline-block;
              width: 400px;
              margin: 0;
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
            .ti3-table-nodata > td {
              height: 150px !important;
              background: url(${api + './assets/img/home/no-data.png'}) 50% no-repeat !important;
              border-bottom: 1px solid #e1e6e6;
            }
            .nodata-image {
              height: 135px;
              background: url(${api + './assets/img/home/no-data.png'}) 50% no-repeat;
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
            .BCFile {
              box-sizing: border-box;
              height: 32px;
              margin-top: -10px;
              margin-bottom: 10px;
              padding: 0 10px;
              border: 1px solid #0067ff;
              background-color: #f0f6ff;
              font-size: 14px;
              color: #0067ff;
              line-height: 32px;
            }
            .BCFile .suggestion {
              margin-left: 24px;
            }
            .nested-table-container {
              position: relative;
              padding: 0 0 0 28px;
              background-color: #fff;
            }
            .nested-table-container::before {
              position: absolute;
              left: 0;
              top: 0;
              bottom: 0;
              content: '';
              width: 24px;
              border-right: 2px solid #0067FF;
              background-color: #F5F9FF;
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
              width: 38px;
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
            th, td {
              padding: 5px 10px;
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
              overflow: hidden;
              width: 100%;
              padding-left: 10px;
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
      </head>
      <body style="padding:0 80px;">
        <div style="min-width: 1300px;width: 100%; height: 100%;">
        <h1
          style="text-align: center;font-weight: normal;
                 font-size: 24px;border-bottom: solid 1px #222;padding-bottom:20px"
        >
        ${ currentReport }</h1>
        <div>
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

            let sontrtds = document.querySelectorAll('.sonRowSpan');
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
   * 对配置信息左侧做处理
   * @param type 类型
   * @param settingLeftInfo 详细信息
   * @param sysNone 显示样式
   * @param tipImg 提示图标
   */
  handleSettingInfo(type: string, settingLeftInfo: any, sysNone: string, tipImg: any): string {
    switch (type) {
      // BC文件 报告
      case 'BCFile':
        return '';
      default:
        return `
          <div class="setting-left-item">
            <span>${settingLeftInfo.fifthItem.label}</span>
            <span class="ellispis">${settingLeftInfo.fifthItem.value}</span>
          </div>
          <div class="setting-left-item" style="display: ${sysNone};">
            <span class="content ellispis">${ settingLeftInfo.seventhItem.label }</span>
            <span class="content ellispis">${settingLeftInfo.seventhItem.value}</span>
          </div>
          <div class="setting-left-item">
            <span>${settingLeftInfo.sixthItem.label}</span>
            <p class="width400 content ellispis">
              ${tipImg}
              <span>${settingLeftInfo.sixthItem.value}</span>
            </p>
          </div>
        `;
    }
  }
}

