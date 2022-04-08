import { Injectable } from '@angular/core';
import { I18nService } from '../i18n.service';
import { TextForm } from './Interface';

@Injectable({
    providedIn: 'root'
})
export class ReportService {
    private i18n: any;

    constructor(
        private i18nService: I18nService
    ) {
        this.i18n = this.i18nService.I18n();
    }

    /**
     * 点击复制下载链接
     * @param url 链接地址
     * @param select 要复制的 input 类名
     */
    onCopyLink(url: string): void {
        const aInp: HTMLInputElement = document.createElement('input');
        aInp.style.opacity = '0';
        aInp.value = url;
        document.body.appendChild(aInp);
        aInp.select();
        document.execCommand('copy', false, null); // 执行浏览器复制命令
        document.body.removeChild(aInp);
    }

    /**
     * 点击下载链接下载
     * @param url 地址
     */
    downloadLink(url: string): void {
        const a = document.createElement('a');
        a.setAttribute('href', url);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    /**
     * 返回的id数据处理20190822114355 => 2019/08/22 11:43:55
     * @param data 时间戳
     */
    formatCreatedId(data: string | any[]) {
        const years = data.slice(0, 4);
        const months = data.slice(4, 6);
        const days = data.slice(6, 8);
        const hours = data.slice(8, 10);
        const minutes = data.slice(10, 12);
        const seconds = data.slice(12, 14);
        return `${years}/${months}/${days} ${hours}:${minutes}:${seconds}`;
    }

    /**
     * 下载 html 模板
     * @param type 具体功能
     * @param currentReport 日期 | 包名
     * @param settingLeftInfo 配置信息 左侧
     * @param scanItems 表格标题以及类型
     * @param soFileSrcData 第一个表格数据
     * @param intellijFlag 是否intellij
     * @param imgBase2 下拉图片
     */
    downloadTemplete(
        type: string,
        currentReport: string,
        settingLeftInfo: TextForm,
        scanItems: any,
        soFileSrcData: Array<object>,
        intellijFlag: boolean,
        imgBase2?: any
    ): string {
        let softNone = 'flex';
        const rightNone = 'none';
        const maxHeight = scanItems.type.length >= 2 ? '160px' : '380px';
        if (!settingLeftInfo.firstItem.value.length) {
            softNone = 'none';
        }
        const api = location.href.slice(0, 0);
        let args = '';
        let scanTemp = '';
        const settingRTopContent = '';

        const settingInfo = '';

        args = `
      <h1 style="font-size: 20px;color: #282b33;margin-bottom: 24px;font-weight: normal;line-height: 1;">
        ${this.i18n.plugins_porting_setting_label}</h1>
      <div class="setting-left">
        <div class="setting-left-item" style="display: ${softNone};">
          <span class="content ellispis">${settingLeftInfo.firstItem.label}</span>
          <span class="content ellispis">${settingLeftInfo.firstItem.value}</span>
        </div>
        ${settingInfo}
      </div>
      <div class="setting-right" style="display: ${rightNone};">
        ${settingRTopContent}
      </div>
    `;
        scanItems.type.forEach((item: any) => {
            let itemFile = '';
            let fileListCon = '';
            let soFoilePadding = '';
            let realHeadContent = '';
            let headContent = '';
            if (item === 'soFile') {
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
                                if (intellijFlag) {
                                    imgTd = `
                        <td style="position: relative;border-bottom: 1px solid #E6EBF5;">
                            <span class="path_more" onclick="openDetail(${count}, null, null)">
                                <svg width="16px" height="16px" viewBox="0 0 10 6" version="1.1"
                                    xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                                    <title>arrow</title>
                                    <defs>
                                        <path d="M11.9750423,5.5 L4.02468497,5.5 C3.55928566,5.5 3.32401474,
                                        6.06187132 3.65442254,6.39042319 L7.62960121,10.3473305 C7.83401693,
                                        10.5508898 8.16571037,10.5508898 8.37012609,10.3473305 L12.3453048,
                                        6.39042319 C12.6757126,6.06187132 12.4417273,5.5 11.9750423,5.5" id="path-1">
                                        </path>
                                    </defs>
                                    <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                                        <g transform="translate(-1017.000000, -747.000000)">
                                            <g transform="translate(390.000000, 412.000000)">
                                                <g transform="translate(10.000000, 324.000000)">
                                                    <g transform="translate(200.000000, 0.000000)">
                                                        <g transform="translate(414.000000, 6.000000)">
                                                            <mask id="mask-2" fill="white">
                                                                <use xlink:href="#path-1"></use>
                                                            </mask>
                                                            <use id="Mask" fill="#979797" xlink:href="#path-1"></use>
                                                            <g mask="url(#mask-2)" fill="#979797">
                                                                <g>
                                                                    <rect x="0" y="0" width="16" height="16"></rect>
                                                                </g>
                                                            </g>
                                                        </g>
                                                    </g>
                                                </g>
                                            </g>
                                        </g>
                                    </g>
                                </svg>
                            </span>
                        </td>
                        `;
                                } else {
                                    imgTd = `
                        <td style="position: relative;border-bottom: 1px solid #E6EBF5;">
                            <img src="${imgBase2}" class="path_more" onclick="openDetail(${count}, null, null)"/>
                        </td>
                        `;
                                }
                                for (let i = 0; i < EXT_LENGTH; i++) {
                                    bodyData += `
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
                            <th style="width: 90%;text-align: left;">${this.i18n.common_bc_suggestion_position}</th>
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
                    <span class="content">${bin.id}</span>
                  </td>
                  <td class="border-color">
                    <span class="content">${bin.filename}</span>
                  </td>
                  <td class="border-color">
                    <span class="content">${bin.path}</span>
                  </td>
                  <td class="border-color">
                    <span class="content">${bin.suggestionNum}</span>
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
            <th style="width: 40%;text-align: left;">${this.i18n.plugins_porting_label_cFile_path}</th>
            <th style="width: 20%;text-align: left;">
                ${this.i18n.plugins_porting_weakCheck.common_term_cFile_suggestion_label}
            </th>
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

            // theade th设置 text-align: left 是为了兼容IE
            fileListCon += `
      <div class="ti-table">
        <div class="table" style="${soFoilePadding}">
          <table style="table-layout:fixed;text-align: left;line-height: 24px">
            <thead>
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
            <span class="total">
                ${this.i18n.plugins_porting_weakCheck.report_list_tip}：${settingLeftInfo.firstItem.fixSum}
            </span>
            <span class="suggestion">${this.i18n.plugins_porting_weakCheck.report_suggestion
                }：add "__asm__ volatile("dmb sy")" in the position indicated by the below items</span>
          </div>
        `;
            }
            scanTemp += `
        <div class="table-container">
          <div class="detail-label">
            <span>${scanItems[item].label}</span>
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
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="X-UA-Compatible" content="ie=edge">
          <meta charset="UTF-8">
          <title>Report</title>
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
              border-right: 1px solid #E1E6EE;
            }
            .setting-right-item p {
              margin: 0;
            }
            .setting-right-item p:first-child{
              font-size: 16px;
              height: 24px;
              padding: 0 20px;
              line-height: 24px;
              color: #979797;
              text-align: center;
            }
            .setting-right-item p:nth-child(2){
              font-size: 48px;
              color: #222;
            }
            .ti3-table-nodata > td {
              height: 150px !important;
              background: url(${api + './assets/img/home/no_data.png'}) 50% 25px no-repeat !important;
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
              padding: 0 10px;
            }
            td span {
              display: inline-block;
              width: 100%;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
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
        <h1 style="text-align: center;
            font-weight: normal;
            font-size: 24px;
            border-bottom: solid 1px #222;
            padding-bottom:20px">
            ${currentReport}</h1>
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

            if (num === null) return;

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

    handlePositon(locs: any): Array<any> {
        const arr: any[] = [];
        if (locs.length) {
            locs.forEach((item: any, index: number) => {
                arr.push({
                    num: index + 1,
                    position: `Line:${item.line}，Column:${item.col}`
                });
            });
        }
        return arr;
    }

    /**
     * 将图片转换为 base64 格式
     * @param imgUrl 图片地址
     * @param return 返回 Promise 对象
     */
    public getBase64(imgUrl: string): Promise<any> {
        return new Promise(resolve => {
            const xhr = new XMLHttpRequest();
            xhr.open('get', imgUrl, true);
            xhr.responseType = 'blob';
            xhr.onload = function() {
                if (this.status === 200) {
                    // 得到一个blob对象
                    const blob = this.response;
                    const oFileReader = new FileReader();
                    oFileReader.onloadend = (e: any) => {
                        let base64 = e.currentTarget.result;
                        base64 = base64.replace('; charset=UTF-8', '');
                        resolve(base64);
                    };
                    oFileReader.readAsDataURL(blob);
                }
            };
            xhr.send();
        });
    }
}
