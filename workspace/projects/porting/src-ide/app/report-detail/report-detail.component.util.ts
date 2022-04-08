export class ReportDetailUtil {

    /**
     * 组装html报告静态页面信息
     * @param report 报告内容
     */
    public static downloadTemplete(report: any, that: any): string {
        const argsItem = ['firstItem', 'secondItem', 'thirdItem', 'fourthItem', 'fifthItem', 'sixthItem'];
        let args = '';
        let scanTemp = '';
        const humanFlag = 'flex';
        const iii = location.href.indexOf('#');
        const api = location.href.slice(0, iii);
        const imgNoData = api.slice(0, api.lastIndexOf('/')) + '/assets/img/default-page/light-nodata-intellij.png';
        args = `<h1 style="font-size: 20px;color: #282b33;margin-bottom: 24px;font-weight: normal;line-height: 1;">
        ${that.textForm1.reportConfiureInfo}</h1>
        <div id="report-arguments" class="detail-items">
        <div class="setting-left">
          <div class="setting-left-item">
            <span class="item-label">${that.textForm1.firstItem.label}</span>
            <span class="item-content">
            ${that.textForm1.firstItem.value}</span>
          </div>
          <div class="setting-left-item">
            <span class="item-label">${that.textForm1.secondItem.label}</span>
            <span class="item-content">
            ${that.textForm1.secondItem.value}</span>
          </div>
          <div class="setting-left-item">
            <span class="item-label">${that.textForm1.thirdItem.label}</span>
            <span class="item-content">
            ${that.textForm1.thirdItem.value}</span>
          </div>
          <div class="setting-left-item">
            <span class="item-label">${that.textForm1.fourthItem.label}</span>
            <span class="item-content">
            ${that.textForm1.fourthItem.value}</span>
          </div>
          <div class="setting-left-item">
            <span class="item-label">${that.textForm1.fifthItem.label}</span>
            <span class="item-content">
            ${that.textForm1.fifthItem.value}</span>
          </div>
          <div class="setting-left-item" >
            <span class="item-label">${that.textForm1.sixthItem.label}</span>
            <span class="item-content">
            ${that.textForm1.sixthItem.value}</span>
          </div>
        </div>
        <div class="setting-right">
            <div class="setting-right-top">
            <div class="setting-right-item" >
              <p>${that.i18n.plugins_port_label_cFileSummary}</p>
              <p>${that.soFilesTotal - that.soFilesNeed}</p>
            </div>
            <div class="setting-right-item">
              <p>${that.i18n.plugins_port_label_linesSummary}</p>
              <p>${that.soFilesNeed}</p>
            </div>
            <div class="setting-right-item" >
              <p>${that.i18n.plugins_port_label_soFileSummary}</p>
              <p>${that.soFilesTotal}</p>
            </div>
            </div>

          <div class="setting-right-bottom" >
          <div class="setting-right-item"  style="display: ${humanFlag}; ">
            <p>${that.i18n.common_term_report_right_info4}</p>
            <p>${that.humanBudgetNum}<span style="font-size:14px;font-weight:400">${that.humanBudget}</span></p>
          </div>
          <div class="setting-right-item">
            <p>${that.i18n.common_term_migrate_result_cFile}</p>
            <p>${that.cfileLine}</p>
          </div>
          <div class="setting-right-item" >
            <p>${that.i18n.common_term_migrate_result_lines}</p>
            <p>${that.totalLine}</p>
          </div>
          </div>
          <p class="tit" style="display: ${humanFlag};margin-top: 12px;
            color: #616161;font-size: 14px;text-align: center;"
          >
            ${that.humanStandard}</p>
        </div>
        </div>`;
        that.scanItems.forEach((item: any, idx: any) => {
            let itemFile = '';
            let fileListCon = '';
            if (item === 'soFile') {
                if (that.binDetailSrcData.data.length > 0) {
                    that.binDetailSrcData.data.forEach((bin: any, index: any) => {
                        let optionstr = '';
                        if (bin.url === '--') {
                            optionstr = `<td style="width: 40%;white-space: nowrap;text-overflow: ellipsis;\
                        overflow: hidden;border-bottom: 1px solid #E6EBF5;">
                        <span>${that.i18n.common_term_operate_download1}</span></td>`;
                        } else {
                            optionstr = `<td style="width: 40%;white-space: nowrap;text-overflow: ellipsis;\
                        overflow: hidden;border-bottom: 1px solid #E6EBF5;"><a style="color: #0067ff;cursor: pointer"\
                         onclick="downloadSoFile('${bin.url}')">${that.i18n.common_term_operate_download}</a>
                         <span class="copy-link" onclick="onCopyLink('${bin.url}', '.copy-inp')">
                             ${that.i18n.common_term_report_copy_link}
                         </span>
                         <input class="copy-inp" />
                         </td>`;
                        }
                        if (index % 2 === 0) {
                            itemFile += `
              <tr>
                  <td style="width: 20%;white-space: nowrap;text-overflow: ellipsis;overflow: hidden;
                    border-bottom: 1px solid #E6EBF5;"
                  >
                  ${bin.number}</td>
                  <td style="width: 20%;white-space: nowrap;text-overflow: ellipsis;overflow: hidden;
                    border-bottom: 1px solid #E6EBF5;"
                  >
                  ${bin.name}</td>
                  <td style="width: 20%;white-space: nowrap;text-overflow: ellipsis;overflow: hidden;
                  border-bottom: 1px solid #E6EBF5;" title="${bin.oper}">${bin.oper}</td>
                  ${optionstr}
              </tr>
            `;
                        } else {
                            itemFile += `
              <tr>
                  <td style="width: 20%;white-space: nowrap;text-overflow: ellipsis;overflow: hidden;
                    border-bottom: 1px solid #E6EBF5;"
                  >
                  ${bin.number}</td>
                  <td style="width: 20%;white-space: nowrap;text-overflow: ellipsis;overflow: hidden;
                    border-bottom: 1px solid #E6EBF5;"
                  >
                  ${bin.name}</td>
                  <td style="width: 20%;white-space: nowrap;text-overflow: ellipsis;overflow: hidden;
                    border-bottom: 1px solid #E6EBF5;" title="${bin.oper}"
                  >${bin.oper}</td>
                  ${optionstr}
              </tr>
            `;
                        }
                    });
                } else {
                    itemFile += `
                <tr class="ti3-table-nodata">
                  <td colspan="4"></td>
                </tr>
              `;
                }

                fileListCon += `
            <div>
              <table class="resize-table" style="table-layout:fixed;width:100%; text-align: left;line-height: 28px">
              <thead>
                  <tr style="background:#F5F9FF;color:#333;font-weight: 400;border-left: none; padding: 0 10px;
                    font-size: 0.875rem;"
                  >
                      <th style="white-space: nowrap;text-overflow: ellipsis;overflow: hidden;" width="100">
                      ${that.i18n.common_term_no_label}</th>
                      <th style="white-space: nowrap;text-overflow: ellipsis;overflow: hidden;" width="200">
                      ${that.i18n.common_term_name_label}</th>
                      <th style="white-space: nowrap;text-overflow: ellipsis;overflow: hidden;" width="700">
                      ${that.i18n.common_term_operate_sugg_label}</th>
                      <th style="white-space: nowrap;text-overflow: ellipsis;overflow: hidden;">
                      ${that.i18n.common_term_operate}</th>
                  </tr>
              </thead>
              </table>
              </div>
              <div class="items-detail-container" style="height: 200px;overflow-y: auto;">
              <table class="resize-table" style="table-layout:fixed;width:100%; text-align: left;line-height: 28px">
              <thead>
                  <tr style="background:#F5F9FF;color:#333;font-weight: 400;border-left: none; padding: 0 10px;
                    font-size: 0.875rem;"
                  >
                      <th style="white-space: nowrap;text-overflow: ellipsis;overflow: hidden;" width="100">
                      </th>
                      <th style="white-space: nowrap;text-overflow: ellipsis;overflow: hidden;" width="200">
                      </th>
                      <th style="white-space: nowrap;text-overflow: ellipsis;overflow: hidden;" width="700">
                      </th>
                      <th style="white-space: nowrap;text-overflow: ellipsis;overflow: hidden;">
                      </th>
                  </tr>
              </thead>
              <tbody>${itemFile}</tbody>
              </table>
            </div>
          `;
            }
            if (item === 'cFile' && that.scanItemsObj[item].files) {
                that.cfileDetailSrcData.data.forEach((dataItem: any) => {
                    itemFile += `
            <tr>
              <td style="width: 30%;border-bottom: 1px solid #E6EBF5;" title="${dataItem.id}">
              <span style="width:100%;overflow: hidden;white-space: nowrap;text-overflow: ellipsis;
                display:inline-block"
              >
              ${dataItem.id}</span></td>
              <td style="width: 30%;border-bottom: 1px solid #E6EBF5;" title="${dataItem.filename}">
              <span style="width:100%;overflow: hidden;white-space: nowrap;text-overflow: ellipsis;
                display:inline-block"
              >
              ${dataItem.filename}</span></td>
              <td style="width: 30%;border-bottom: 1px solid #E6EBF5;" title="${dataItem.path}">
              <span style="width:100%;overflow: hidden;white-space: nowrap;text-overflow: ellipsis;
                display:inline-block"
              >
              ${dataItem.path}</span></td>
              <td style="width: 20%;border-bottom: 1px solid #E6EBF5;" title="${dataItem.fileType}">
              <span style="width:100%;overflow: hidden;white-space: nowrap;text-overflow: ellipsis;
                display:inline-block"
              >
              ${dataItem.fileType}</span></td>
              <td style="width: 10%;border-bottom: 1px solid #E6EBF5;" title="${dataItem.linecount}">
              <span style="width:100%;overflow: hidden;white-space: nowrap;text-overflow: ellipsis;
                display:inline-block"
              >
              ${dataItem.linecount}</span></td>
              </tr>`;
                });

                fileListCon += `
            <div>
              <table class="resize-table" style="table-layout:fixed;width:100%; text-align: left;line-height: 28px">
              <thead>
                  <tr style="background:#F5F9FF;color:#333;font-weight: 400;border-left: none; padding: 0 10px;
                    font-size: 0.875rem;"
                  >
                      <th style="white-space: nowrap;text-overflow: ellipsis;overflow: hidden;" width="100">
                      ${that.i18n.common_term_no_label}</th>
                      <th style="white-space: nowrap;text-overflow: ellipsis;overflow: hidden;" width="200">
                      ${that.i18n.common_term_name_label}</th>
                      <th style="white-space: nowrap;text-overflow: ellipsis;overflow: hidden;" width="700">
                      ${that.i18n.plugins_porting_label_cFile_path}</th>
                      <th style="white-space: nowrap;text-overflow: ellipsis;overflow: hidden;" width="400">
                      ${that.i18n.plugins_porting_label_file_type}</th>
                      <th style="white-space: nowrap;text-overflow: ellipsis;overflow: hidden;">
                      ${that.i18n.plugins_porting_option_linecount}</th>
                  </tr>
              </thead>
              </table>
              </div>
              <div class="items-detail-container" style="height: 200px;overflow-y: auto;">
              <table class="resize-table" style="table-layout:fixed;width:100%; text-align: left;line-height: 28px">
              <thead>
                  <tr style="background:#F5F9FF;color:#333;font-weight: 400;border-left: none; padding: 0 10px;
                    font-size: 0.875rem;"
                  >
                      <th style="white-space: nowrap;text-overflow: ellipsis;overflow: hidden;" width="100">
                      </th>
                      <th style="white-space: nowrap;text-overflow: ellipsis;overflow: hidden;" width="200">
                      </th>
                      <th style="white-space: nowrap;text-overflow: ellipsis;overflow: hidden;" width="700">
                      </th>
                      <th style="white-space: nowrap;text-overflow: ellipsis;overflow: hidden;" width="400">
                      </th>
                      <th style="white-space: nowrap;text-overflow: ellipsis;overflow: hidden;" >
                      </th>
                  </tr>
              </thead>
              <tbody >${itemFile}</tbody>
              </table>
            </div>
          `;
            }
            if (item === 'lines' && report.portingresultlist.length > 0) {
                let itemLines = '';
                report.portingresultlist.forEach((retItem: any) => {
                    retItem.portingItems.forEach((line: any) => {

                        itemLines += `
                <tr>
                    <td style="width: 30%;border-bottom: 1px solid #E6EBF5;" title="${retItem.content}">
                    <span style="width:100%;overflow: hidden;white-space: nowrap;text-overflow: ellipsis;
                      display:inline-block"
                    >
                    ${retItem.content}</span></td>
                    <td style="width: 10%;border-bottom: 1px solid #E6EBF5;">
                    <span style="width:100%;overflow: hidden;white-space: nowrap;text-overflow: ellipsis;
                      display:inline-block"
                    >
                    ${'(' + line.locbegin + ',' + line.locend + ')'}</span></td>
                    <td style="width: 30%;border-bottom: 1px solid #E6EBF5;" title="${line.keyword}">
                    <span style="width:100%;overflow: hidden;white-space: nowrap;text-overflow: ellipsis;
                      display:inline-block"
                    >
                    ${line.keyword}</span></td>
                    <td style="width: 30%;border-bottom: 1px solid #E6EBF5;" title="${line.strategy}">
                    <span style="width:100%;overflow: hidden;white-space: nowrap;text-overflow: ellipsis;
                      display:inline-block"
                    >
                    ${line.strategy}</span></td>
                </tr>
              `;
                    });

                });

                fileListCon += `
            <div>
              <table class="resize-table" style="table-layout:fixed;width:100%; text-align: left;line-height: 28px;">
              <thead>
                  <tr style="background:#F5F9FF;color:#333;font-weight: 400;border-left: none; padding: 0 10px;
                    font-size: 0.875rem;"
                  >
                      <th width="340">${that.i18n.common_term_download_html_filename}</th>
                      <th width="136">${that.i18n.common_term_download_html_lineno}</th>
                      <th width="187">${that.i18n.common_term_download_html_keyword}</th>
                      <th>${that.i18n.common_term_download_html_suggestion}</th>
                  </tr>
              </thead>
              </table>
              </div>
              <div class="items-detail-container" style="height: 200px;overflow-y: auto;margin-bottom: 30px;">
              <table class="resize-table" style="table-layout:fixed;width:100%; text-align: left;line-height: 28px;">
              <thead>
                  <tr style="background:#F5F9FF;color:#333;font-weight: 400;border-left: none; padding: 0 10px;
                    font-size: 0.875rem;"
                  >
                      <th width="340"></th>
                      <th width="136"></th>
                      <th width="187"></th>
                      <th></th>
                  </tr>
              </thead>
              <tbody>${itemLines}</tbody>
              </table>
            </div>
          `;
            }

            scanTemp += `
        <div class="table-container" style="line-height: 56px;margin-top:30px;">
          <div class="detail-label" style="display:inline-block;width: 350px;">
            <span>${that.scanItemsObj[item].label}</span>
          </div>
          <div class="detail-content" style="display:inline-block;">${that.scanItemsObj[item].content}</div>
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
                .copy-link {
                  position: relative;
                  display: inline;
                  margin-left: 16px;
                  color: #447FF5;;
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
                .ti3-table-nodata > td {
                  height: 160px!important;
                  background: url(${imgNoData}) 50% 25px no-repeat !important;
                  border-bottom: 1px solid #ccc;
                }

                .setting-right {
                  width: 50%;
                  padding-left: 15%;
                  flex-shrink: 0;
              }

            .setting-right-item {
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                position: relative;
                white-space: nowrap;
                width: 160px;
                height: 80px;
                box-sizing: border-box;

            }

            .setting-right-item:first-child {
              width: 180px;
              padding-right: 20px;
           }
           .setting-right-item:nth-child(3) {
            padding-left: 10px;
            border-left-style: solid !important;
            border-left-width: 1px !important;
            border-left-color: #AAA !important;
        }

        thead tr th {
          padding-left: 10px;
        }

        .setting-right-item p:first-child {
              font-size: 16px;
              height: 24px;
              line-height: 24px;
              text-align: center;
              color: #AAA;
          }

          .setting-right-item p:nth-child(2) {
              font-size: 48px;
              line-height: 36px;
              text-align: center;
              color: #222;
          }
          .setting-right-item p:nth-child(2) span {
            font-size: 14px;
            font-weight: normal;
            color: #616161;
        }

        .setting-right-top{
          display: flex;
      }
      .setting-right-bottom{
          display: flex;
          -ms-flex-pack: end;
          height: 80px;
          margin-top: 30px;
      }

      .detail-items {
        display: flex;
        justify-content: space-between;
        margin-top: 10px;
      }

      .setting-left {
        width: 48%;
        flex-shrink: 0;
    }

    .setting-left-item {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 18px;
  }

    .item-label {
      height: 20px;
      font-size: 14px;
      line-height: 20px;
      width: 180px;
      flex-shrink: 0;
      color: #6C7280;
  }

    .item-content{
      height: 20px;
      line-height: 20px;
      font-size: 14px;
      display: inline-block;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      width: calc(100% - 210px);
  }

              *{
                margin: 0;
                padding: 0;
              }

            </style>
        </head>
        <body style="padding:0 80px;">
          <div style="width: 100%; height: 100%;">
          <h1 style="text-align: center;font-weight: normal;font-size: 1.5rem;border-bottom: solid 1px #222;
            padding-bottom:20px"
          >
          ${that.report.created}</h1>
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

             // 点击复制下载链接
            function onCopyLink(url, select) {
                let aInp = document.querySelector(select);
                aInp.value = url;
                aInp.select();
                document.execCommand('copy', false, null); // 执行浏览器复制命令
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
}
