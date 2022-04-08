import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { I18nService, LANGUAGE_TYPE } from '../service/i18n.service';
import { TiTableColumns, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';
import { Router, ActivatedRoute, RouterLinkWithHref } from '@angular/router';
import { COLOR_THEME, VscodeService } from '../service/vscode.service';
import { ReportService } from '../service/report/report.service';

const enum STATUS {
    SUCCESS = 0,
    FAIL = 1,
    WEAK_FILE_LOCKED = '0x0d0a20',
    HTTPS_200 = 200
}

const enum TASK_STATUS {
    INPROGRESS = 1,
    DONE = 2,
}

const enum TASK_TYPE {
    PRECHECK = '5',
    BYTE_CHECK = '6',
    WEAK_CHECK = '10',
    BC_CHECK = '11',
    CACHE_CHECK = '12'
}
const enum VSCODE_OS_TYPE {
    WINDOWS = 'win32'
}

@Component({
    selector: 'app-enhance-function-report',
    templateUrl: './enhance-function-report.component.html',
    styleUrls: ['./enhance-function-report.component.scss']
})

export class EnhanceFunctionReportComponent implements OnInit {
    modifyCount: any;
    currLang: any;
    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private i18nService: I18nService,
        private vscodeService: VscodeService,
        private reportService: ReportService,
        public activaedRoute: ActivatedRoute
    ) {
        this.i18n = this.i18nService.I18n();
        this.currLanguege = I18nService.getLang();
        // 禁止复用路由
        this.router.routeReuseStrategy.shouldReuseRoute = () => {
            return false;
        };
    }
    @ViewChild('leavePage', { static: false }) leavePage: { Close: () => void; Open: () => void; };
    @Output() getReportId = new EventEmitter();
    @Output() getIsSign = new EventEmitter();
    @Input() report: any;
    @Input() currentReport: any;
    public sourcePath: any = '';
    public bcPath: any = '';
    public reportId: any;
    public resultList: any = [];
    public i18n: any;
    public currTheme = COLOR_THEME.Dark;
    public tableWidth: string;
    public filePath: any = [];
    public resp: any = {};
    public generationTime: any;
    public autoFix: any;
    public lockInfo: any;
    private intellijFlag = false;
    private intelliJOS = '';
    private vscodePlatform = '';
    private osMappingDir = '';
    public settingInfo: any = {
        textForm: {
            type: 'text'
        },
        colsNumber: 1,
        colsGap: ['40px', '40px'],

        fieldVerticalAlign: 'middle',

        firstItem: {
            label: '',
            value: []
        },
        secondItem: {
            label: '',
            value: ''
        },
        thirdItem: {
            label: '',
            value: ''
        },
        fourthItem: {
            label: '',
            value: ''
        },
        fifthItem: {
            label: '',
            value: ''
        },
        sixthItem: {
            label: '',
            value: ''
        }
    };

    // 源文件表格信息
    public fileDetailDisplay: Array<TiTableRowData> = [];
    public fileDetailSrcData: TiTableSrcData;
    public columnDetail: Array<TiTableColumns> = [{
        title: '',
        width: '5%'
    },
    {
        title: '',
        width: '20%'
    },
    {
        title: '',
        sortKey: 'path',
        width: '45%'
    },
    {
        title: '',
        sortKey: 'suggestionNum',
        width: '15%'
    },
    {
        title: '',
        width: '15%'
    },
    ];

    // 主题模式
    public theme = 'black';
    // 报告为空时的图片展示
    public blackBlank = './assets/black-blank.svg';
    public whiteBlank = './assets/white-blank.svg';
    public imgBase: any;
    // 是否是最新的扫描报告
    public isNewReport = true;
    // 新报告id
    public newReportId: any;
    // 当前表格筛选值
    public currentSelectLabel: any;
    // 源文件扫描表格空数据提示
    public cFileNoData: string;
    // 获取主题颜色
    public ColorTheme = {
        Dark: COLOR_THEME.Dark,
        Light: COLOR_THEME.Light
    };

    public taskId: any;
    public taskType: any;
    public scanItems = ['cFile', 'lines'];
    public scanItemsObj: any = {
        cFile: {
            id: '1',
            label: '',
            icon: './assets/img/home/source.png',
            content: '',
            files: [],
            hasDetail: false,
            isOpen: true
        },
        lines: {
            id: '2',
            label: '',
            icon: './assets/img/home/trans.png',
            content: '',
            hasDetail: false,
            isOpen: false
        }
    };
    public taskFlag = {
        PRECHECK: '5',
        BYTE_CHECK: '6',
        WEAK_CHECK: '10',
        BC_CHECK: '11',
        CACHE_CHECK: '12'
    };
    public workPath: any;
    public constructTool: any;
    public compileCommand: any;
    public LANG_TYPE = {
        ZH: 0,
        EN: 1,
    };
    public currLanguege: any;
    ngOnInit() {
        // vscode颜色主题
        if (document.body.className.indexOf('vscode-light') > -1) {
            this.currTheme = COLOR_THEME.Light;
        }

        this.vscodeService.regVscodeMsgHandler('colorTheme', (msg: any) => {
            this.currTheme = msg.colorTheme;
        });

        this.fileDetailSrcData = {
            data: [],
            state: {
                searched: false,
                sorted: false,
                paginated: false
            }
        };

        this.settingInfo.firstItem.label = this.i18n.common_term_ipt_label.source_code_path;
        this.settingInfo.secondItem.label = this.i18n.common_term_ipt_label.compiler_version;
        this.settingInfo.thirdItem.label = this.i18n.common_term_ipt_label.construct_tool;
        this.settingInfo.fourthItem.label = this.i18n.common_term_ipt_label.compile_command;
        this.settingInfo.fifthItem.label = this.i18n.common_term_ipt_label.target_os;
        this.settingInfo.sixthItem.label = this.i18n.common_term_ipt_label.target_system_kernel_version;

        this.columnDetail[0].title = this.i18n.common_term_no_label;
        this.columnDetail[1].title = this.i18n.common_term_name_label_1;
        this.columnDetail[2].title = this.i18n.plugins_porting_label_cFile_path;
        this.tableWidth = document.body.clientWidth - 280 + 'px';
        this.cFileNoData = this.i18nService.I18nReplace(this.i18n.plugins_porting_message_cFile_noData, {
            0: ''
        });

        this.scanItemsObj.lines.label = this.i18n.plugins_porting_weakCheck.report_list_tip;
        this.activaedRoute.queryParams.subscribe((data: any) => {
            if (data.taskId) {
                this.taskType = data.taskType;
                this.taskId = data.taskId;
                this.filePath = data.filePath;
                this.workPath = data.workspace;
                this.constructTool = data.selected;
                this.compileCommand = data.command;
                this.intellijFlag = (data.intellijFlag) ? true : false;
                this.intelliJOS = data.OS;
                this.vscodePlatform = data.vscodePlatform;
                this.osMappingDir = data.osMappingDir;
                if (data.resp) {
                    if (this.intellijFlag) {
                        this.resp = JSON.parse(data.resp.replace(/'/g, '"'));
                    } else {
                        this.resp = JSON.parse(data.resp);
                    }
                    this.vscodePlatform = this.resp.vscodePlatform;
                    this.osMappingDir = this.resp.data.os_mapping_dir;
                }
                this.generationTime = this.formatCreatedId(this.taskId);
                this.getTaskReport(data.taskId);
            }
        });
    }

    getTaskReport(id: any) {
        if (this.taskType === TASK_TYPE.WEAK_CHECK) {
            this.columnDetail[3].title = this.i18n.plugins_porting_weakCheck.common_term_cFile_suggestion_label;
            this.columnDetail[4].title = this.i18n.common_term_operate;
            // 获取历史报告详情信息
            if (this.resp !== {}) {
                this.getReportDetail();
            }
        } else if (this.taskType === TASK_TYPE.BC_CHECK) {
            this.columnDetail = [
                {
                    title: '',
                    width: '3%'
                },
                {
                    title: this.i18n.common_term_no_label,
                    width: '7%'
                },
                {
                    title: this.i18n.common_term_name_label_1,
                    width: '30%'
                },
                {
                    title: this.i18n.plugins_porting_label_cFile_path,
                    sortKey: 'path',
                    width: '40%'
                },
                {
                    title: this.i18n.plugins_porting_weakCheck.common_term_cFile_suggestion_label,
                    sortKey: 'suggestionNum',
                    width: '20%'
                },
            ];
            if (this.resp !== {}) {
                this.getBCReportDetail();
            }
        } else {
            this.columnDetail[3].title = this.i18n.common_term_operate;
            if (this.columnDetail.length === 5) {
                this.columnDetail.pop();
                this.columnDetail[1].width = '25%';
                this.columnDetail[2].width = '50%';
                this.columnDetail[3].width = '20%';
            }
            this.filePath.forEach((item: any, index: any) => {
                let filePath = item;
                const temFile = item.split(this.workPath)[1].split('/');
                // 获取本地映射路径
                if (this.resp.data?.os_mapping_dir) {
                    this.resp.data.os_mapping_dir = this.resp.data.os_mapping_dir.replace(/\\\\/g, '\\');
                    if (this.intellijFlag) {
                        if (this.intelliJOS === 'windows') {
                            this.resp.data.os_mapping_dir = this.resp.data.os_mapping_dir.replace(/\//g, '\\');
                            const temDir = this.resp.data.os_mapping_dir.split('\\');
                            // 删除多余文件名
                            temDir.pop();
                            const temFilePath = temDir.concat(temFile);
                            filePath = temFilePath.join('\\');
                        } else if (this.intelliJOS === 'linux') {
                            this.resp.data.os_mapping_dir = this.resp.data.os_mapping_dir.replace(/\\/g, '/');
                            const temDir = this.resp.data.os_mapping_dir.split('/');
                            // 删除多余文件名
                            temDir.pop();
                            const temFilePath = temDir.concat(temFile);
                            filePath = temFilePath.join('/');
                        }
                    }
                }
                // vscode端判断是否有本地路径
                if (!this.intellijFlag && this.osMappingDir !== undefined && this.osMappingDir.length !== 0) {
                    filePath = filePath.replace(this.workPath, '');
                    const tempDirArray = filePath.split('/');
                    if (tempDirArray.length > 1) {
                        // 将打包的目录去除
                        tempDirArray.splice(0, 1);
                    }
                    // 其实位置处添加目录符
                    filePath = '/' + tempDirArray.join('/');
                    // 如果vscode平台是windows
                    if (this.vscodePlatform === VSCODE_OS_TYPE.WINDOWS) {
                        filePath = filePath.replace(/\//g, '\\');
                    }
                    filePath = this.osMappingDir + filePath;
                }
                this.fileDetailSrcData.data.push({
                    id: index + 1,
                    filename: temFile[temFile.length - 1],
                    path: filePath,
                    visited: false,
                    remoteFilePath: item
                });
            });
            if (this.intellijFlag && this.resp.data.os_mapping_dir) {
               // 重新设置workpath为本地路径用于报告显示
               this.workPath = this.resp.data.os_mapping_dir;
            }
            if (!this.intellijFlag && this.osMappingDir !== undefined && this.osMappingDir.length !== 0) {
              this.workPath = this.osMappingDir;
            }

        }
    }

    getReportDetail() {
        // 此处需要设置header.isLocked = true; 参考：this.Axios.axios.defaults.headers.isLocked = true;
        if (this.resp.status === STATUS.SUCCESS) {
            this.isNewReport = true;
            this.newReportId = '';
            this.getReportId.emit({ id: '', isLocked: false });
        } else if (this.resp.realStatus === STATUS.WEAK_FILE_LOCKED) {
            this.isNewReport = false;
            this.newReportId = this.resp.data.id;
            this.getReportId.emit({ id: this.resp.data.id, isLocked: true });
        } else {
            this.isNewReport = true;
            this.newReportId = '';
            this.showMessageByLang(this.resp, 'error');
            return;
        }
        if (this.resp.data.result !== {}) {
            this.scanItemsObj.cFile.label = this.i18n.plugins_porting_weakCheck.common_term_weak_result_cFile;
            this.sourcePath = this.resp.data.source_dir;
            this.modifyCount = this.resp.data.fix_sum;
            this.scanItemsObj.cFile.content = this.resp.data.fix_sum;
            if (this.resp.data.autoFix) {
              this.autoFix = true;
            } else {
              this.autoFix = false;
            }
            let cfileNameArr = [];
            this.resp.data.result.barriers.forEach((item: any, index: any) => {
                cfileNameArr = item.file.split('/');
                let filePath = item.file;
                const temFile = item.file.split(this.sourcePath + '/')[1].split('/');
                // 获取本地映射路径
                if (this.resp.data.os_mapping_dir) {
                    this.resp.data.os_mapping_dir = this.resp.data.os_mapping_dir.replace(/\\\\/g, '\\');
                    if (this.intellijFlag) {
                        if (this.intelliJOS === 'windows') {
                            this.resp.data.os_mapping_dir = this.resp.data.os_mapping_dir.replace(/\//g, '\\');
                            const temDir = this.resp.data.os_mapping_dir.split('\\');
                            const temFilePath = temDir.concat(temFile);
                            filePath = temFilePath.join('\\');
                        } else if (this.intelliJOS === 'linux') {
                            this.resp.data.os_mapping_dir = this.resp.data.os_mapping_dir.replace(/\\/g, '/');
                            const temDir = this.resp.data.os_mapping_dir.split('/');
                            const temFilePath = temDir.concat(temFile);
                            filePath = temFilePath.join('/');
                        }
                    } else {
                        // vscode端判断是否有本地路径
                        if (this.osMappingDir !== undefined && this.osMappingDir.length !== 0) {
                            filePath = temFile.join('/');
                            filePath = '/' + filePath;
                            // 如果vscode平台是windows
                            if (this.vscodePlatform === VSCODE_OS_TYPE.WINDOWS) {
                                filePath = filePath.replace(/\//g, '\\');
                            }
                            filePath = this.osMappingDir + filePath;
                        }
                    }
                }
                this.fileDetailSrcData.data.push({
                    id: index + 1,
                    filename: cfileNameArr[cfileNameArr.length - 1],
                    path: filePath,
                    remoteFilePath: item.file,
                    suggestionNum: item.count,
                    visited: false
                });
            });
            // 重新设置sourcePath为本地路径用于报告显示
            if (this.resp.data.os_mapping_dir) {
                this.sourcePath = this.resp.data.os_mapping_dir;
            }
        }
    }

    getBCReportDetail() {
        if (this.resp.status === STATUS.SUCCESS) {
            if (this.resp.data.result !== {}) {
                this.scanItemsObj.cFile.label = this.i18n.plugins_porting_weakCheck.common_term_bc_suggestion_title;
                this.bcPath = this.resp.data.source_dir;
                this.modifyCount = this.resp.data.fix_sum;
                this.scanItemsObj.cFile.content = this.resp.data.fix_sum;
                let cfileNameArr = [];
                this.resp.data.result.barriers.forEach((item: any, index: any) => {
                    cfileNameArr = item.file.split('/');
                    this.fileDetailSrcData.data.push({
                        id: index + 1,
                        filename: cfileNameArr[cfileNameArr.length - 1],
                        path: item.file,
                        suggestionNum: item.count,
                        data: this.reportService.handlePositon(item.locs)
                    });
                });
            }
        } else {
            this.showMessageByLang(this.resp, 'error');
        }
    }

    /**
     * 根据接口返回值中展示对应语言的提示信息
     * @param data 响应数据{info:'',chineseinfo:''}
     * @param type 响应类型
     */
    showMessageByLang(data: any, type: any, msg?: any) {
        if (!msg) {
            msg = '';
        }
        this.currLang = I18nService.getLang();
        if (this.currLang === LANGUAGE_TYPE.ZH) {
            this.showInfoBox(data.infochinese + msg, type);
        } else {
            this.showInfoBox(data.info + msg, type);
        }
    }

    showInfoBox(info: any, type: any) {
        const message = {
            cmd: 'showInfoBox',
            data: {
                info,
                type
            }
        };
        this.vscodeService.postMessage(message, null);
    }

    formatCreatedId(data: string) {
        const years = data.slice(0, 4);
        const months = data.slice(4, 6);
        const days = data.slice(6, 8);
        const hours = data.slice(8, 10);
        const minutes = data.slice(10, 12);
        const seconds = data.slice(12, 14);
        return `${years}/${months}/${days} ${hours}:${minutes}:${seconds}`;
    }

    /**
     * 查看报告详情
     * @param item 报告项
     */
    async codeSuggesting(item: any) {
        item.visited = true;
        await this.vscodeService.get(
            { url: `/task/progress/?task_type=${encodeURIComponent(this.
                taskType)}&task_id=${encodeURIComponent(this.taskId)}` },
            (resp: any) => {
                if (resp.realStatus === '0x0d0112' || resp.realStatus === '0x0d0a20') {
                    const message = {
                        cmd: 'unableDownInfoBox',
                        data: {
                           resp ,
                           btnType: 'view'
                        }
                    };
                    this.vscodeService.postMessage(message, null);
                    return;
                }
                if (this.taskType === TASK_TYPE.BYTE_CHECK) {
                    // 打开新的页签
                    const data = {
                        cmd: 'openNewPage',
                        data: {
                            router: 'bytereport',
                            panelId: 'enhancereport' + item.remoteFilePath,
                            viewTitle: item.remoteFilePath,
                            message: {
                                reportId: this.taskId,
                                diffPath: item.remoteFilePath,
                                intellijFlag: this.intellijFlag
                            }
                        }
                    };
                    this.vscodeService.postMessage(data, null);
                } else if (this.taskType === TASK_TYPE.PRECHECK) {
                    const param = {
                        id: this.taskId,
                        url: '/portadv/tasks/'.concat(encodeURIComponent(this.taskId)).concat('/portinginfo/'),
                        filePath: item.path,
                        remoteFilePath: item.remoteFilePath
                    };
                    this.vscodeService.postMessage({ cmd: 'createPortCheckTree', data: param }, null);
                } else if (this.taskType === TASK_TYPE.CACHE_CHECK) {
                    const param = {
                      id: this.taskId,
                      filePath: item.path,
                      remoteFilePath: item.remoteFilePath
                    };
                    this.vscodeService.postMessage({ cmd: 'createCacheCheckTree', data: param }, null);
                } else {
                    const param = {
                        id: this.taskId,
                        filePath: item.path,
                        remoteFilePath: item.remoteFilePath
                    };
                    this.vscodeService.postMessage({ cmd: 'openWeakReport', data: param }, null);
                }
            });
    }

    /**
     * 返回增强功能页面
     */
    goBack() {
        // 发送消息，关闭打开的报告详情页面
        const param = {
            taskId: this.taskId,
            localFilePath: this.resp.data?.os_mapping_dir
        };
        this.vscodeService.postMessage({ cmd: 'clearEnhanceReport', data: param }, null);
        if (this.osMappingDir !== undefined && this.osMappingDir.length > 0) {
            let tempFilename = this.osMappingDir.split('/').pop();
            if (this.vscodePlatform === VSCODE_OS_TYPE.WINDOWS) {
              tempFilename = this.osMappingDir.split('\\').pop();
            }
            const parameter: any = {
                queryParams: {
                    isLoginRouter: true,
                    filePath: this.osMappingDir,
                    fileName: tempFilename,
                    isSingle: 'false'
                }
            };
            this.router.navigate(['PortingPre-check'], parameter);
        } else {
            this.router.navigate(['PortingPre-check']);
        }
    }
    /**
     * 打开弹框
     */
    public openMadal() {
        this.leavePage.Open();
    }

    /**
     * 关闭弹框
     */
    closeMask() {
        this.leavePage.Close();
    }

    /**
     * 确认离开
     */
    public onConfirmLeavePage() {
        this.leavePage.Close();
        this.goBack();
    }
    // 排序功能
    public compareFn = (a: TiTableRowData, b: TiTableRowData, sortKey: string): number => {
      const language = 'zh-CN'; // 根据实际情况设置当前语言种类
      if (sortKey === 'suggestionNum') {
        return a.suggestionNum - b.suggestionNum;
      }
      return a[sortKey].localeCompare(b[sortKey], language); // localeCompare方法还有更多配置，可在网上查阅。
    }
    // 下载html 报告
    downloadReportAsHtml() {
        if (this.resp.realStatus === '0x0d0112' || this.resp.realStatus === '0x0d0a20') {
            const message = {
                cmd: 'unableDownInfoBox',
                data: {
                   resp: this.resp
                }
            };
            this.vscodeService.postMessage(message, null);
            return;
        }else{
            this.download2Html(this.resp);
        }
    }

    download2Html(reportData: any) {
        if (this.taskType === TASK_TYPE.BC_CHECK) {
            if (this.intellijFlag) {
                this.getHtmlContent(reportData);
            } else {
                const getBase64 = this.reportService.getBase64;
                const image2 = './assets/img/header/arrow_bottom.svg';
                getBase64(image2).then(res => {
                    this.getHtmlContent(reportData, res);
                });
            }
        } else {
            const num = reportData.data.fix_sum;
            const content = this.downloadTemplete(reportData.data.result, num);
            this.downloadHtml(content);
        }
    }

    downloadHtml(content: any) {
        this.vscodeService.postMessage({
            cmd: 'downloadReportHtml',
            data: {
                htmlContent: content,
                fileName: this.taskId + '.html'
            }
        }, null);
    }

    getHtmlContent(reportData: any, imgBase2?: any) {
        const settingLeftInfo = {
            firstItem: {
                label: this.i18n.common_term_ipt_label.bc_file_path,
                value: reportData.data.source_dir,
                fixSum: reportData.data.fix_sum
            }
        };
        const content = this.reportService.downloadTemplete(
            'BCFile',
            this.formatCreatedId(this.taskId),
            settingLeftInfo,
            {
                soFile: {
                    label: this.i18n.plugins_porting_weakCheck.common_term_bc_suggestion_title
                },
                type: ['soFile']
            },
            this.fileDetailSrcData.data,
            this.intellijFlag,
            imgBase2
        );
        this.downloadHtml(content);
    }

    downloadTemplete(report: any, num: any): string {
        const api = location.href.slice(0, 0);
        let args = '';
        let scanTemp = '';
        const asmMessage = 'add "__asm__ volatile("dmb sy")" in the position indicated by the below items';
        args = `<h1 style="font-size: 20px;color: #282b33;margin-bottom: 24px;font-weight: normal;line-height: 1;">
        ${this.i18n.plugins_porting_setting_label}</h1>
          <div class="setting-left" style="float: left;width: 100%;">
            <div class="setting-left-item" style="display: flex; justify-content: flex-start;margin-bottom: 20px;">
              <span style="width: 240px;color: #6C7280;margin-right: 16px;">
                ${this.i18n.common_term_ipt_label.source_code_path}
              </span>
              <span
                style="max-width: 556px;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;"
                title="${this.resp.data.source_dir}"
              >
                ${this.resp.data.source_dir}
              </span>
            </div>
          </div>`;
        this.scanItems.forEach((item: any) => {
            let itemFile = '';
            let fileListCon = '';
            const showTotal = item === 'cFile' ? 'block' : 'none';
            if (item === 'cFile' && this.scanItemsObj[item].files) {
                if (this.fileDetailSrcData.data.length !== 0) {
                    this.fileDetailSrcData.data.forEach((itemInner) => {
                        itemFile += `
              <tr style="line-height:23px;font-size: 14px;">
                <td style="width: 10%;border-bottom: 1px solid #E6EBF5;" title="${itemInner.id}">
                  <span
                    style="overflow: hidden;
                        white-space: nowrap;
                        text-overflow: ellipsis;
                        width:100%;
                        display:inline-block">
                      ${itemInner.id}
                  </span>
                </td>
                <td style="width: 20%;border-bottom: 1px solid #E6EBF5;" title="${itemInner.filename}">
                    <span
                        style="overflow: hidden;
                        white-space: nowrap;
                        text-overflow: ellipsis;
                        width:100%;display:inline-block">
                        ${itemInner.filename}
                    </span>
                </td>
                <td style="width: 40%;border-bottom: 1px solid #E6EBF5;" title="${itemInner.remoteFilePath}">
                    <span
                        style="overflow: hidden;
                            white-space: nowrap;
                            text-overflow: ellipsis;
                            width:100%;display:inline-block">
                        ${itemInner.remoteFilePath}
                    </span>
                </td>
                    <td style="width: 30%;border-bottom: 1px solid #E6EBF5;" title="${itemInner.suggestionNum}">
                        <span
                            style="overflow: hidden;
                            white-space: nowrap;
                            text-overflow: ellipsis;
                            width:100%;display:inline-block">
                            ${itemInner.suggestionNum}
                        </span>
                    </td>
                </tr>`;
                    });
                } else {
                    itemFile += `
            <tr class="ti3-table-nodata">
              <td colspan="5" style="border: none;"></td>
            </tr>
            `;
                }

                fileListCon += `
              <div class="items-detail-container" style="max-height: 300px;">
                <table class="myTable" style="table-layout:fixed; text-align: left;line-height: 28px">
                  <thead>
                    <tr
                        style="background:#f5f9ff;
                        color:#333;
                        font-weight: 400;
                        border-left: none;
                        padding: 0 10px;
                        font-size: 14px;">
                      <th style="width: 10%;" >${this.i18n.common_term_no_label
                    }</th>
                      <th style="width: 20%;">${this.i18n.common_term_download_html_filename
                    }</th>
                      <th style="width: 40%;">
                        ${this.i18n.plugins_porting_weakCheck.common_term_cFile_path_label}
                      </th>
                      <th style="width: 30%;">
                        ${this.i18n.plugins_porting_weakCheck.common_term_cFile_suggestion_label}
                      </th>
                    </tr>
                  </thead>
                <tbody style="font-size: 14px;">${itemFile}</tbody>
                </table>
              </div>
            `;
            }
            if (item === 'lines' && report.barriers.length > 0) {
                let itemLines = '';
                if (num !== 0) {
                    report.barriers.forEach((itemInner: any) => {
                        itemInner.locs.forEach((line: any) => {
                            line.strategy = 'add "__asm__ volatile("dmb sy")" in the position\ ' +
                              'indicated by the below items';
                            itemLines += `
                  <tr style="line-height:23px;font-size: 14px;">
                    <td style="width: 45%;border-bottom: 1px solid #E6EBF5;" title="${itemInner.file
                                }"><span style="overflow: hidden;white-space: nowrap;text-overflow: ellipsis;
                                width:100%;display:inline-block">${itemInner.file
                                }</span></td>
                    <td style="width: 15%;border-bottom: 1px solid #E6EBF5;">
                      <span
                        style="overflow: hidden;
                        white-space: nowrap;
                        text-overflow: ellipsis;
                        width:100%;display:inline-block">
                        ${'(' + line.line + ',' + line.line + ')'}
                      </span>
                    </td>
                    <td style="width: 40%;border-bottom: 1px solid #E6EBF5;">
                      <span style="white-space: nowrap;width:100%;display:inline-block">
                      ${line.strategy}</span>
                    </td>
                  </tr>
                `;
                        });
                    });
                } else {
                    itemLines += `
                    <tr>
                    <td colspan="5" style="border: none;">
                    <div class="nodata-image">
        <?xml version="1.0" encoding="UTF-8"?>
        <svg width="320px" height="130px" viewBox="0 0 320 130" version="1.1"
         xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
            <title>Web_SFW/缺省页/插画/空数据</title>
            <defs>
                <linearGradient
                    x1="49.9902458%" y1="3.28731867%" x2="49.9902458%" y2="106.785213%" id="linearGradient-1">
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
                    <g
                        id="编组"
                        opacity="0.5"
                        transform="translate(17.370822, 16.433333)"
                        fill="url(#linearGradient-1)"
                        fill-rule="nonzero">
                        <rect
                            id="矩形"
                            opacity="0.17"
                            x="0.132174015"
                            y="0.174222222"
                            width="30.7965456"
                            height="26.5937778"></rect>
                    </g>
                    <g id="编组" opacity="0.5" transform="translate(103.424743, 6.766667)" fill-rule="nonzero">
                        <rect id="矩形" fill="url(#linearGradient-2)" opacity="0.17"
                         x="0.274474266" y="0.23623176" width="84.782051" height="70.2032332"></rect>
                        <rect
                            id="矩形"
                            fill="#FFFFFF"
                            x="0.274474266"
                            y="0.23623176"
                            width="84.782051"
                            height="3.63433476"></rect>
                        <rect
                            id="矩形"
                            fill="#E1E4EA"
                            x="76.5173259"
                            y="1.23567382"
                            width="1.52485703"
                            height="1.51430615"></rect>
                        <rect
                            id="矩形"
                            fill="#E1E4EA"
                            x="79.3139137"
                            y="1.23567382"
                            width="1.52485703"
                            height="1.51430615"></rect>
                        <rect
                            id="矩形"
                            fill="#E1E4EA"
                            x="82.1105015"
                            y="1.23567382"
                            width="1.52485703"
                            height="1.51430615"></rect>
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
                    <polygon
                        id="路径"
                        stroke="#91969B"
                        fill="#F0F6FF"
                        fill-rule="nonzero"
                        points="116.527044 60.9 78.3784532 60.9 74.4178033 71.5333333 119.862008 71.5333333"></polygon>
                    <polygon id="矩形" fill="#0077FF" fill-rule="nonzero"
                     transform="translate(97.521520, 47.759428) rotate(179.900000) translate(-97.521520, -47.759428) "
                     points="96.2937569
                     43.3284159 98.7493255 43.3284041 98.7492829 52.1904406 96.2937143 52.1904524"></polygon>
                    <polygon id="矩形" fill="#0077FF" fill-rule="nonzero"
                     transform="translate(107.348753, 51.183537) rotate(-139.940000) translate(-107.348753, -51.183537)"
                     points="106.113553 46.7559029 108.571931 46.7592433 108.583953 55.6111707 106.125575 55.6078304">
                    </polygon>
                    <polygon id="矩形" fill="#0077FF" fill-rule="nonzero"
                     transform="translate(87.712659, 51.219690) rotate(-40.250000) translate(-87.712659, -51.219690) "
                     points="86.4894768 46.7954383 88.9478764 46.7920942
                     88.9358407 55.6439418 86.4774411 55.6472859"></polygon>
                    <ellipse
                        id="椭圆形"
                        stroke="#B8BCC1"
                        stroke-linejoin="round"
                        cx="24.1391082"
                        cy="80.2333333" rx="1" ry="1"></ellipse>
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
                    </div>
                    <div class="nodata-text">${this.i18n.plugins_porting_message_noData}</div>
                    </td>
                    </tr>
              `;
                }
                fileListCon += `
              <div class="items-detail-container" style="max-height: 300px;margin-bottom: 30px;">
                <table class="myTable" style="text-align: left;line-height: 28px;table-layout: fixed;width:100%;">
                <thead>
                    <tr
                        style="background:#f5f9ff;
                        color:#333;font-weight: 400;
                        border-left: none;
                        padding: 0 10px;font-size: 14px;">
                        <th style="width: 45%;">${this.i18n.common_term_download_html_filename}</th>
                        <th style="width: 15%;">${this.i18n.common_term_download_html_lineno}</th>
                        <th style="width: 40%;">${this.i18n.common_term_download_html_suggestion}</th>
                    </tr>
                </thead>
                <tbody>${itemLines}</tbody>
                </table>
              </div>
            `;
            }
            scanTemp += `
          <div class="table-container" style="line-height: 56px;margin-top:30px;">
            <div class="detail-label" style="display:inline-block;min-width: 350px;font-size: 20px;color: #282b33;">
              <span>${this.scanItemsObj[item].label}</span>
            </div>
            <div class="detail-content" style="display: ${showTotal}">
              <span style="margin-right: 24px;">
                ${ this.i18n.plugins_porting_weakCheck.report_list_tip }：${ this.scanItemsObj[item].content }
              </span>
              <span>
              ${ this.i18n.plugins_porting_weakCheck.report_suggestion }：${ asmMessage }
              </span>
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
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <meta http-equiv="X-UA-Compatible" content="ie=edge">
              <title>Document</title>
              <style>
                .ti3-table-nodata > td {
                  height: 160px !important;
                  background: url(${api + './assets/img/home/nodata.svg'}) 50% 25px no-repeat !important;
                }
                .detail-content {
                  margin-bottom: 14px;
                  padding-left: 10px;
                  border: 1px solid #0067FF;
                  background-color: #F0F6FF;
                  color: #0067FF;
                  font-size: 14px;
                  line-height: 30px;
                }
                .nodata-text {
                    text-align: center;
                    border-bottom: 1px solid #e1e6e6;
                    padding-bottom: 5px;
                  }
                  .nodata-image {
                    height: 135px;
                    display: flex;
                    align-items: center;
                    flex-direction: column;
                  }
                .myTable tbody {
                    display:block;
                    max-height:288px;
                    width:1724px;
                    overflow-y:scroll;
                    text-align: left;
                }
                .myTable thead, tbody tr {
                    display:table;
                    width: 1707px;
                    table-layout:fixed;
                }
              </style>
          </head>
          <body style="padding:0 80px;">
            <div style="min-width: 1300px;width: 100%; height: 100%;">
            <h1
                style="text-align: center;
                font-weight: normal;
                font-size: 24px;
                border-bottom: solid 1px #222;
                padding-bottom:20px">
            ${this.generationTime}</h1>
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
                let tab = detailContainer.children[0];
                changeTableWidth(tab);
              }

              function closeDetail(e) {
                let openIcon = e.target;
                let detailContainer = openIcon.parentElement.parentElement.parentElement.nextElementSibling;
                openIcon.style.display= 'none';
                openIcon.parentElement.firstElementChild.style.display = 'inline-block';
                detailContainer.style.display = 'none';
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
                    if (event.offsetX > this.offsetWidth - 10)
                        this.style.cursor = 'col-resize';
                    else
                        this.style.cursor = 'default';
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
          </body>
        </html>
        `;
        return template;
    }

    downloadAutoFixList() {
      this.vscodeService.get({
            url: `/task/progress/?task_type=${
              encodeURIComponent(this.taskType)}&task_id=${encodeURIComponent(this.taskId)}`
          }, (resp: any) => {
              if (resp.status === STATUS.SUCCESS) {
                const autoFixList = resp.data.autofixlist;
                if (autoFixList.length === 0) {
                  this.showInfoBox(
                    this.i18n.plugins_porting_weakCheck.bcAutoFixinvalidation, 'error');
                  return;
                }
                let content = '';
                autoFixList.forEach((con: any) => {
                  content = content + con;
                });
                this.vscodeService.postMessage({
                  cmd: 'downloadReportHtml',
                  data: {
                      htmlContent: content,
                      fileName: 'autofixlist-' + this.taskId + '.txt',
                      is_file: 'true',
                      autoFix: true,
                  }
              }, null);
              } else if (resp.realStatus === '0x0d0112' || resp.realStatus === '0x0d0a20') {
                const message = {
                    cmd: 'unableDownInfoBox',
                    data: {
                       resp
                    }
                };
                this.vscodeService.postMessage(message, null);
                return;
            }
      });
  }

  // 查看最新报告是否勾选生成编译器配置文件
  getAutoFix(callback: any) {
    this.vscodeService.get({
      url: `/task/progress/?task_type=${
        encodeURIComponent(this.taskType)}&task_id=${encodeURIComponent(this.newReportId)}`
    }, (res: any) => {
      if (res.data.autoFix) {
        this.lockInfo = this.i18nService.I18nReplace(
          this.i18n.plugins_porting_weakCheck.lock_auto_fix_body_true, {
            0: this.formatCreatedId(this.newReportId)}
        );
      } else {
        this.lockInfo = this.i18nService.I18nReplace(
          this.i18n.plugins_porting_weakCheck.lock_auto_fix_body_false, {
            0: this.formatCreatedId(this.newReportId)}
        );
      }
      callback(res);
      }
    );
  }
}
