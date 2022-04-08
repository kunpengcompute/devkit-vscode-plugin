/**
 * Dependency 报告DepReportHtml获取类
 */
export class DepReportDetailUtil {
  /**
   * 组装html报告静态页面信息
   * @param report 报告内容
   */
  displayOrNot(label: string): string {
      let displayValue = 'flex';
      if (!label.length) {
          displayValue = 'none';
      }
      return displayValue;
  }

  downloadTemplate(currentReport: string, that: any): string {
      const iii = location.href.indexOf('#');
      const api = location.href.slice(0, iii);
      const imgDown = api.slice(0, api.lastIndexOf('/')) + '/assets/img/home/row.svg';
      const imgNoData = api.slice(0, api.lastIndexOf('/')) + '/assets/img/default-page/light-nodata-intellij.png';
      let args = '';
      let scanTemp = '';
      args = `<h1 style="font-size: 20px;color: #282b33;margin-bottom: 24px;font-weight: normal;line-height: 1;">${
          that.i18n.plugins_porting_setting_label
          }</h1>
        <div class="setting-left">
          <div class="setting-left-item" style="display: ${this.displayOrNot(that.scanInfo.item1.package.value)};
          justify-content: flex-start;margin-bottom: 20px;">
            <span>${that.scanInfo.item1.package.lable}</span>
            <span style="width: 370px;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;" class="content">
            ${that.scanInfo.item1.package.value}</span>
          </div>
          <div class="setting-left-item" style="display: ${this.displayOrNot(that.scanInfo.item1.software.value)};
          justify-content: flex-start;margin-bottom: 20px;">
            <span>${that.i18n.plugins_porting_label_softPackInstallPath}</span>
            <span style="max-width: 556px;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;">
            ${that.scanInfo.item1.software.value}</span>
          </div>
          <div class="setting-left-item" style="display:
          ${this.displayOrNot(that.depArgs.softwareCode.item2.target_os.value)};
          justify-content: flex-start;margin-bottom: 20px; ">
            <span>${that.depArgs.softwareCode.item2.target_os.label}</span>
            <span style="max-width: 460px;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;">
              ${that.depArgs.softwareCode.item2.target_os.value}</span>
          </div>
          <div class="setting-left-item" style="display:
          ${this.displayOrNot(that.depArgs.softwareCode.item2.target_system_kernel_version.value)};
          justify-content: flex-start;margin-bottom: 20px;">
            <span>${that.depArgs.softwareCode.item2.target_system_kernel_version.label}</span>
            <span style="max-width: 556px;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;">
            ${that.depArgs.softwareCode.item2.target_system_kernel_version.value}</span>
          </div>
        </div>
        <div class="setting-right">
          <div class="setting-right-item">
            <p>${that.i18n.plugins_port_label_cFileSummary}</p>
            <p>${that.soFilesTotal - that.soFilesNeed}</p>
          </div>
          <div class="setting-right-item">
            <p>${that.i18n.plugins_port_label_linesSummary}</p>
            <p>${that.soFilesNeed}</p>
          </div>
          <div class="setting-right-item">
            <p>${that.i18n.plugins_port_label_soFileSummary}</p>
            <p>${that.soFilesTotal}</p>
          </div>
        </div>
      `;

      that.scanItems.forEach((item: any) => {
          let itemFile = '';
          let fileListCon = '';
          let soFoilePadding = '';
          if (item === 'soFile') {
              let count = -1;
              soFoilePadding = that.binDetailSrcData.data.length > 10
                  ? 'padding-right: 17px;'
                  : '';
              if (that.binDetailSrcData.data.length !== 0) {
                  that.binDetailSrcData.data.forEach((bin: any, index: any) => {
                      const EXT_LENGTH = bin.path_ext.length;
                      let optionstr = '';
                      if (bin.url === '') {
                          if (bin.level === 0 || bin.level === 3 || bin.level === 6) {
                              optionstr = `<td style="border-bottom: 1px solid #E6EBF5;"><span>--</span></td>`;
                          } else {
                              optionstr = `<td style="border-bottom: 1px solid #E6EBF5;">
                  <span class="content">${bin.result}</span></td>`;
                          }
                      } else {
                          const downloadDesc = bin.downloadDesc ? `<span class="content">
                ${bin.downloadDesc + ' ' + bin.url}</span>` :
                              (
                                  (bin.level === 0 || bin.level === 3 || bin.level === 6)
                                      ? (`<a onclick="downloadSoFile('${bin.url}')"
                    style="color: #0067ff;text-transform: capitalize;cursor: pointer">${bin.result}</a>
                      `)
                                      : (
                                          (bin.result !== '下载源码' && bin.result !== 'Download Source Code')
                                              ? `<a style="color: #0067ff;cursor: pointer"
                                              onclick="downloadSoFile('${bin.url}')">${bin.result}</a>`
                                              : `<a href="${bin.url}" target="_blank">${bin.result}</a>`
                                      )
                              );
                          const aarch64 =
                              bin.hasOwnProperty('isAarch64') && bin.isAarch64
                              ? `<span class="ellispis">${ that.i18n.common_kunpeng_platform_compatible }</span>`
                              : ``;
                          optionstr = `<td style="position: relative;border-bottom: 1px solid #E6EBF5;">
                                <span class="ellispis">
                                  ${downloadDesc}
                                  <span class="copy-link" onclick="onCopyLink('${bin.url}', '.copy-inp')">
                                      ${that.i18n.common_term_report_copy_link}
                                  </span>
                                  <input class="copy-inp" />
                                </span>
                                ${aarch64}
                              </td>`;
                      }

                      if (EXT_LENGTH !== 0) {
                          count++;
                          itemFile += `
                              <tr style="line-height:24px;">
                              <td style="position: relative;border-bottom: 1px solid #E6EBF5;">
                                  <img src="${imgDown}" class="path_more row_collapse_icon" />
                              </td>
                              <td style="border-bottom: 1px solid #E6EBF5;">
                                  <span class="content">${bin.number}</span>
                              </td>
                              <td style="border-bottom: 1px solid #E6EBF5;">
                                  <span class="content">${bin.name}</span>
                              </td>
                              <td style="border-bottom: 1px solid #E6EBF5;">
                                  <span class="content">${bin.fileType}</span>
                              </td>
                              <td style="border-bottom: 1px solid #E6EBF5;">
                                  <span class="content" style="width: 90%;">${bin.path}</span>
                              </td>
                              <td style="border-bottom: 1px solid #E6EBF5;">
                                  <span class="content" style="width: 90%;">${bin.urlName}</span>
                              </td>
                              <td style="border-bottom: 1px solid #E6EBF5;">
                                  <span class="content">${bin.oper}</span>
                              </td>
                              ${optionstr}
                              </tr>
                          `;
                          if (!bin.soFileHasUrl) {
                              for (let i = 0; i < EXT_LENGTH; i++) {
                                  itemFile += `
                                  <tr class="ext${count}" style="display:none;line-height:24px;">
                                      <td class="ext_more"></td>
                                      <td style="border-bottom: 1px solid #E6EBF5;"></td>
                                      <td style="border-bottom: 1px solid #E6EBF5;"></td>
                                      <td style="border-bottom: 1px solid #E6EBF5;">
                                          <span class="content">${bin.fileType}</span>
                                      </td>
                                      <td style="border-bottom: 1px solid #E6EBF5;">
                                          <span class="content">${bin.path_ext[i]}</span>
                                      </td>
                                      <td style="border-bottom: 1px solid #E6EBF5;"></td>
                                      <td style="border-bottom: 1px solid #E6EBF5;"></td>
                                      <td style="border-bottom: 1px solid #E6EBF5;"></td>
                                  </tr>
                                  `;
                              }
                          } else {
                              for (let i = 0; i < bin.soInfoList.length; i++) {
                                  const son = bin.soInfoList[i];
                                  let sonResultstr = '';
                                  if (son.urlName === '--') {  // 没有软件包
                                      sonResultstr = `
                                          <span class="content">${ son.result }</span>
                                      `;
                                  } else if (son.result === '--') {  // 有软件包无下载链接
                                      sonResultstr = `
                                          <span class="content">${ that.i18n.common_upload_unable }</span>
                                      `;
                                  } else {  // 有下载链接
                                      sonResultstr = `
                                          <span class="ellispis">
                                              <a onclick="downloadSoFile('${son.url}')"
                                              style="color: #0067ff;text-transform: capitalize;">${son.result}</a>
                                              <span class="copy-link sonlink${i}" onclick="onCopyLink('${son.url}',
                                                '.copy-inp', ${i})"
                                              >
                                              ${ that.i18n.common_term_report_detail.copyLink }</span>
                                              <input class="copy-inp" />
                                          </span>
                                      `;
                                  }
                                  itemFile += `
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
                                          <span class="content">${bin.fileType}</span>
                                      </td>
                                      <td class="border-color border-right-color">
                                          <span class="content">${son.path}</span>
                                      </td>
                                      <td tiOverflow rowspan="${son.mergeRowSpan.urlName}"
                                        showtd="${son.showTd.urlName}"
                                        class="sonRowSpan border-color border-right-color">${son.urlName}</td>
                                      <td tiOverflow rowspan="${son.mergeRowSpan.oper}" showtd="${son.showTd.oper}"
                                      class="sonRowSpan border-color border-right-color">${son.oper}</td>
                                      <td tiOverflow rowspan="${son.mergeRowSpan.result}"
                                      showtd="${son.showTd.result}" class="sonRowSpan border-color">
                                          ${sonResultstr}
                                      </td>
                                  </tr>
                              `;
                              }
                          }
                      } else {
                          itemFile += `
                          <tr style="line-height:24px;">
                          <td style="border-bottom: 1px solid #E6EBF5;"></td>
                          <td style="border-bottom: 1px solid #E6EBF5;">
                              <span class="content">${bin.number}</span>
                          </td>
                          <td style="word-break: break-all;border-bottom: 1px solid #E6EBF5;">
                              <span class="content">${bin.name}</span>
                          </td>
                          <td style="word-break: break-all;border-bottom: 1px solid #E6EBF5;">
                              <span class="content">${bin.fileType}</span>
                          </td>
                          <td style="word-break: break-all;border-bottom: 1px solid #E6EBF5;">
                              <span class="content">${bin.path}</span>
                          </td>
                          <td style="word-break: break-all;border-bottom: 1px solid #E6EBF5;">
                              <span class="content">${bin.urlName}</span>
                          </td>
                          <td style="word-break: break-all;border-bottom: 1px solid #E6EBF5;">
                              <span class="content">${bin.oper}</span>
                          </td>
                          ${optionstr}
                          </tr>
                      `;
                      }
                  });
              } else {
                  itemFile += `
                      <tr class="ti3-table-nodata">
                      <td colspan="5"></td>
                      </tr>`
                  ;
              }
              // theade th设置 text-align: left 是为了兼容IE
              fileListCon += `
                  <div class="ti-table">
                      <div class="items-detail-container table table-bordered" style="${soFoilePadding}">
                      <table style="table-layout:fixed;text-align: left;line-height: 24px">
                          <thead>
                          <tr style="background:#f5f9ff;color:#333;font-weight: 400;
                          border-left: none; padding: 0 10px;font-size: 14px;">
                              <th style="width: 2%;text-align: left;"></th>

                              <th style="width: 5%;text-align: left;">${that.i18n.common_term_no_label}</th>
                              <th style="width: 10%;text-align: left;">${that.i18n.common_term_name_label}</th>
                              <th style="width: 10%;text-align: left;">${that.i18n.plugins_porting_label_file_type}</th>
                              <th style="width: 20%;text-align: left;">${that.i18n.common_term_path_label}</th>
                              <th style="width: 20%;text-align: left;">
                              ${that.i18n.plugins_port_option_soFileType_software_package}</th>
                              <th style="width: 10%;text-align: left;">${that.i18n.common_term_report_result}</th>
                              <th style="width: 23%;text-align: left;">${that.i18n.common_term_operate_sugg_label}</th>
                          </tr>
                          </thead>
                      </table>
                      </div>
                      <div class="table-box" style="max-height: 380px;overflow-y: auto;margin-top: -4px;">
                      <table class="table table-bordered">
                          <thead>
                          <tr>
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
                          <tbody style="font-size: 14px;">${itemFile}</tbody>
                      </table>
                      </div>
                  </div>
                  `;
              scanTemp += `
                  <div class="table-container" style="line-height: 56px;margin-top:30px;">
                  <div class="detail-label" style="display:inline-block;width: 350px;font-size: 20px;color: #282b33;">
                      <span>${that.i18n.common_term_result_soFile}</span>
                  </div>
                  </div>
                  ${fileListCon}
              `;
          }


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
              .setting-left span:first-child{
                width: 240px;
                color: #6C7280;
              }
              .setting-left span:last-child{
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
                height: 160px!important;
                background: url(${imgNoData}) 50% 25px no-repeat !important;
                border-bottom: 1px solid #ccc;
              }
              thead tr th {
                padding-left: 10px;
             }
              .path_more{
                position: absolute;
                top: 40%;
                width: 16px;
                height: 16px;
                transform: translateY(-50%);
                cursor: pointer;
              }
              .ext_more {
                position: relative;
              }
              .ext_more span,
              .ext_more p {
                margin-left: 64px;
              }
              .ext_more::before {
                position: absolute;
                content: '';
                height: 32px;
                width: 24px;
                background-color: #f0f3fa;
                border-right: 2px solid #0067ff;
                top: 0px;
                left: 0px;
              }
              .table{
                table-layout: fixed;
              }
              table {
                width: 100%;
              }
              tbody td {
                position: relative;
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
                color: #447FF5;
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
            </style>
        </head>
        <body style="padding:0 80px;">
          <div style="min-width: 1300px;width: 100%; height: 100%;">
          <h1 style="text-align: center;font-weight: normal;font-size: 24px;
          border-bottom: solid 1px #222;padding-bottom:20px">${currentReport}</h1>
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
            // 点击复制下载链接
            function onCopyLink(url, select) {
              let aInp = document.querySelector(select);
              aInp.value = url;
              aInp.select();
              document.execCommand('copy', false, null); // 执行浏览器复制命令
            }
            window.onload = function(){
              setTitle();
              let moreIcon = document.getElementsByClassName("path_more")
              for (let index = 0; index < moreIcon.length; index++) {
                const element = moreIcon[index];
                moreIcon[index].index= index;
                moreIcon[index].onclick = function () {
                  let extArr = document.querySelectorAll('.ext'+ this.index)
                  for (let i = 0; i < extArr.length; i++) {
                    const element = extArr[i];
                    if (element.style.display == "none") {
                      element.style.display = "";
                      moreIcon[index].style.transform = "translateY(-50%) rotateZ(90deg)";
                    } else {
                      element.style.display = "none"
                      moreIcon[index].style.transform = "translateY(-50%)";
                    }
                  }
                }
              }
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
