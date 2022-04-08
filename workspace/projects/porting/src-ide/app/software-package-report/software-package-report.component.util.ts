/**
 *   报告软件包重构获取类
 */
export class SoftwarePackageUtil {


    downloadTemplate(report: any, that: any): string {
        const data = that.data;
        const maxHeight = '380px';
        let args = '';
        let scanTemp = '';
        const iii = location.href.indexOf('#');
        const api = location.href.slice(0, iii);
        const imgSuccess = api.slice(0, api.lastIndexOf('/')) + '/assets/img/analysis/icon_success.svg';
        const imgFile = api.slice(0, api.lastIndexOf('/')) + '/assets/img/analysis/icon_failure.svg';
        const imgNoData = api.slice(0, api.lastIndexOf('/')) + '/assets/img/default-page/light-nodata-intellij.png';
        args = ` <div class="setting-left-item" style="display:flex;">
                <span class="content ellispis" > ${that.i18n.common_term_report_generation_time} </span>
    <span class="content ellispis" > ${that.settingLeftInfo[1].value} </span> </div>
        <h1 style="font-size: 20px;color: #282b33;margin-bottom: 24px;font-weight: normal;line-height: 1;" >
            ${that.i18n.software_package_detail.common_term_config_title} </h1>
                <div class="setting-left" >
                    <div class="setting-left-item" style = "display:flex;" >
                        <span class="content ellispis" > ${that.settingLeftInfo[0].label} </span>
                            <span class="content ellispis" > ${that.settingLeftInfo[0].value} </span>
                                </div>
                                <div class="setting-left-item" style = "display:flex;" >
                                    <span class="content ellispis" > ${that.settingLeftInfo[2].label} </span>
                                        `;
        if (!that.settingLeftInfo[3]) {
            args += `  <img src = "${imgFile}" /> `;
        }
        args += ` <span class="content ellispis" > ${that.settingLeftInfo[2].value} </span>
    </div>  `;

        if (that.settingLeftInfo[3]) {
            args += `
            <div class="setting-left-item" style="display:flex;">
                <span class="content ellispis">${that.settingLeftInfo[3].label}</span>
                <img src="${imgSuccess}" />
                <span class="content ellispis">${that.settingLeftInfo[3].value}</span>
            </div> `;
        }
        args += ` </div>
            <div class="setting-right">
                <div class="setting-right-item">
                    <p> ${that.settingRightInfo[0].title}</p>
                    <p>${that.settingRightInfo[0].value}</p>
                </div>
                <div class="setting-right-item">
                    <p> ${that.settingRightInfo[1].title}</p>
                    <p>${that.settingRightInfo[1].value}</p>
                </div>
                <div class="setting-right-item">
                    <p> ${that.settingRightInfo[2].title}</p>
                    <p>${that.settingRightInfo[2].value}</p>
            </div>
          `;
        that.scanItems.type.forEach((item: any) => {
            let itemFile = '';
            let fileListCon = '';
            let realHeadContent = '';
            let headContent = '';
            let title = '';
            if (item === 'soFile') {  // 已更新依赖文件
                title = that.i18n.software_package_detail.relayNum;
                // 软件包重构
                realHeadContent = `
                  <th style="width: 10%;text-align: left;padding-left: 10px;">${that.i18n.common_term_no_label}</th>
                  <th style="width: 20%;text-align: left;padding-left: 10px;">
                    ${that.i18n.software_package_detail.common_term_name_label_1}</th>
                  <th style="width: 30%;text-align: left;padding-left: 10px;">
                    ${that.i18n.software_package_detail.common_term_filePath_label}</th>
                  <th style="width: 40%;text-align: left;padding-left: 10px;">
                    ${that.i18n.software_package_detail.fileSource}
                  </th>
                `;
                headContent = `
                        <th style="width: 10%;"></th>
                        <th style="width: 20%;"></th>
                        <th style="width: 30%;"></th>
                        <th style="width: 40%;"></th>
                    `;
                if (that.soFileSrcData.data.length !== 0) {
                    that.soFileSrcData.data.forEach((bin: any) => {
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
                            <tr class="ti3-table-nodata">
                            <td colspan="5"></td>
                            </tr>
                        `;
                }
            }

            if (item === 'cFile') {  // 缺失依赖文件
                title = that.i18n.software_package_detail.lackNum;
                // 软件包重构
                let bool = false;
                realHeadContent = `
                  <th style="width: 5%;text-align: left;padding-left: 10px;">${that.i18n.common_term_no_label}</th>
                  <th style="width: 10%;text-ali gn: left;padding-left: 10px;">
                  ${that.i18n.software_package_detail.common_term_name_label_1}</th>
                  <th style="width: 30%;text-align: left;padding-left: 10px;">
                  ${that.i18n.software_package_detail.common_term_filePath_label}</th>
                `;
                headContent = `
                        <th style="width: 5%;"></th>
                        <th style="width: 10%;"></th>
                        <th style="width: 30%;"></th>
                    `;

                that.cFileSrcData.data.forEach((bin: any, index: number) => {
                    let suggestionContent = '';
                    if (bin.url) {
                        if (!bool) {
                            realHeadContent += `
                              <th style="width: 45%;text-align: left;padding-left: 10px;">
                                ${that.i18n.common_term_operate_sugg_label}
                              </th>
                              <th style="width: 10%;text-align: left;padding-left: 10px;">
                                ${that.i18n.common_term_operate}
                              </th>
                            `;
                            headContent += `
                                    <th style="width: 45%;"></th>
                                    <th style="width: 10%;"></th>
                                `;
                            bool = true;
                        }
                        if (bin.url !== '--') {
                            suggestionContent = `
                                    <td style="position: relative;border-bottom: 1px solid #E6EBF5;">
                                        <a onclick="downloadSoFile('${bin.url}')"
                                        style="color: #0067ff;text-transform: capitalize;
                                        cursor: pointer">${that.i18n.common_term_operate_download}</a>
                                        <span class="copy-link" onclick="onCopyLink('${bin.url}', '.copy-inp')">
                                        ${that.i18n.common_term_report_detail.copyLink}</span>
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
                              <th style="width: 55%;text-align: left;padding-left: 10px;">
                                ${that.i18n.common_term_operate_sugg_label}
                              </th>
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
                        <table style="table-layout:fixed;text-align: left;line-height: 24px">
                            <thead>
                            <tr
                              style="background:#F5F9FF;
                              color:#333;font-weight: 400;
                              border-left: none;
                              padding: 0 10px;
                              font-size: 14px;">
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

            scanTemp += `
                    <div class="table-container" style="line-height: 56px;margin-top:30px;">
                    <div
                      class="detail-label"
                      style="display:inline-block;width: 350px;font-size: 20px;color: #282b33;"
                    > `;

            scanTemp += ` <span> ${title} </span> `;

            scanTemp += ` </div>
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
                <title>${report}</title>
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
                  margin-left: 10px;
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
                    height: 160px!important;
                  background: url(${imgNoData}) 50% 25px no-repeat !important;
                  border-bottom: 1px solid #ccc;
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
                  th {
                    padding-left: 10px;
                  }
                }
                .real-table {
                  border-spacing: 0;
                }
                table {
                  width: 100%;
                }
                tbody td {
                  position: relative;
                  padding-left: 10px;
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
            <h1 style="text-align: center;font-weight: normal;font-size: 24px;border-bottom: solid 1px #222;
            padding-bottom:20px">${that.reportTitle}</h1>
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
