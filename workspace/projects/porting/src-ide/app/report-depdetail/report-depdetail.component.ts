import { Component, OnInit, Input, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { I18nService } from '../service/i18n.service';
import { TiTableColumns, TiTableRowData, TiTableSrcData, TiTipRef, TiTipService } from '@cloud/tiny3';
import { COLOR_THEME, VscodeService } from '../service/vscode.service';
import { DepReportDetailUtil } from '../report-depdetail/report-depdetail.component.util';
import { ReportService } from '../service/report/report.service';
import { ENV_APP_NAME, REPORT_SCV_HTML } from '../service/constant';
import { CloudIDEService } from '../service/cloudIDE.service';
@Component({
    selector: 'app-report-depdetail',
    templateUrl: './report-depdetail.component.html',
    styleUrls: ['./report-depdetail.component.scss']
})
export class ReportDepDetailComponent implements OnInit, OnDestroy {
    constructor(
        private route: ActivatedRoute,
        private I18n: I18nService,
        public vscodeService: VscodeService,
        private reportService: ReportService,
        private changeDetectorRef: ChangeDetectorRef,
        private cloudIDEService: CloudIDEService
    ) {
        this.instance = this;
        this.i18n = this.I18n.I18n();
    }
    // 针对代码行数，完整显示的上限值为99999，五位数,若超出阈值，显示为9999+
    CODELINES_THRESHOLD_VALUE = 100000;
    CODELINES_OVERFLOW_VALUE = '9999+';
    @Input() report: any;
    intelliJFlagDef = false;
    public instance: ReportDepDetailComponent;
    public i18n: any;
    public currTheme = COLOR_THEME.Dark;
    public humanBudgetNum = 0;
    public enWidth: string;
    public currLang: string;
    public tableWidth: string;
    public currentReport: string;
    public reportPath: string;
    public reportDetailData: any;
    public workload: number;
    public argumentList = ['package', 'path', 'softwareCode'];
    public depArgs: any = {
        package: {
            title: '',
            label: '',
            value: []
        },
        path: {
            title: '',
            label: '',
            value: []
        },

        softwareCode: {
            item2Arr: ['compiler_version', 'target_os', 'target_system_kernel_version'],
            title: '',

            item2: {
                compiler_version: {
                    label: '',
                    value: ''
                },
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
    tipStr = '';
    public cmakeNeedTrans: number;
    public asNeedTrans: number;
    public asmFileLines: number;
    public asmLines: number;
    public makefileNeedTrans: number;
    public automakeNeedTrans: number;
    public makefileTotal: number;
    public makefileLines: number;
    public soFilesNeed = 0;  // 待验证替换
    public soFilesTotal = 0;
    public scanCTotal = 0;
    public scanCNeedTrans = 0;
    public cLines = 0;
    public binDetailList: any[] = [];

    public scanItems = ['soFile', 'lines'];
    public isOpen = false;
    public scanItemsObj: any = {
        soFile: {
            label: 'Dependency SO Files to Be Ported',
            icon: './assets/img/home/file.png',
            content: ``,
            files: [],
            hasDetail: false,
            isOpen: false,
            hasTable: true
        },
        lines: {
            label: 'Source Code Lines to Be Ported',
            icon: './assets/img/home/trans.png',
            content: '',
            hasDetail: false,
            isOpen: false,
            hasTable: false
        }
    };
    public scanInfo: any = {
        item1: {
            package: {
                label: '',
                value: []
            },
            software: {
                label: '',
                value: []
            },
            code: {
                label: '',
                value: []
            }
        },
        item2: {
            compiler: {
                label: '',
                value: ''
            },
            tool: {
                label: '',
                value: ''
            },
            command: {
                label: '',
                value: ''
            }
        }
    };

    public isMonthFlag = '';
    public packageTipStr = '';
    private binDetailDataList: Array<TiTableRowData> = [];
    public binDetailDisplay: Array<TiTableRowData> = [];
    public binDetailSrcData: TiTableSrcData;
    public binDetailColumns: Array<TiTableColumns> = [
        {
            title: '',
            width: '3%'
        },
        {
            title: '',
            width: '5%'
        },
        {
            title: '',
            width: '15%'
        },
        {
            title: '',
            width: '10%'
        },
        {
            title: '',
            width: '27%'
        },
        {
            title: '',
            width: '20%'
        },
        {
            title: '',
            width: '10%',
            key: 'oper',
            selected: null,
            options: [{
                label: '',
            },
            { label: '' },
            { label: '' }
            ],
        },
        {
            title: '',
            width: '20%'
        }
    ];

    // 新增代码段，支持Type列筛选
    public searchWords: Array<any> = [];

    // 设置过滤字段
    public searchKeys: Array<string> = ['oper'];

    // 依赖库文件表格类型筛选值&空数据提示
    public curTypeLabelWithSoFile: any;
    public soFileNoData: string;
    public level: any;
    public type: any;
    public flag: any;
    public isPathname = false;
    public cloudIdeInterval: any;
    // 当前表格筛选值
    public currentSelectLabel: any;
    // 源文件扫描表格空数据提示
    public cFileNoData: string;
    // 获取主题颜色
    public ColorTheme = {
        Dark: COLOR_THEME.Dark,
        Light: COLOR_THEME.Light
    };
    public copySuccess: string;
    public currEnvAppName: string;  // 环境名称
    public REPORT_SCV_HTML = {
        CSV: REPORT_SCV_HTML.CSV,
        HTML: REPORT_SCV_HTML.HTML
    };

    public nodataImage = {};
    public isPathExt: boolean;

    showDetails(item: string | number) {
        this.scanItemsObj[item].isOpen = true;
    }

    hideDetail(item: string | number) {
        this.scanItemsObj[item].isOpen = false;
    }

    downloadReport(type: string) {
        let reportCategory;
        if (type === REPORT_SCV_HTML.CSV) {
            reportCategory = '0';
        } else {
            reportCategory = '1';
        }
        const reportParams = {
            reportId: this.reportPath,
            reportType: reportCategory,
            label: this.currentReport
        };
        if (this.intelliJFlagDef && reportCategory === '1') {
            this.vscodeService.postMessage({
                cmd: 'downloadDepReportHtml',
                data: {
                    reportType: 1,
                    reportId: this.reportPath
                }
            }, null);
        } else {
            let option: any;
            if (this.currEnvAppName === ENV_APP_NAME.CLOUDIDE) {  // cloudIDE环境
                option = {
                    cmd: 'cloudIDEDownloadDepReport',
                    data: reportParams
                };
                this.vscodeService.postMessage(option, (data: any) => {
                    //  下载html报告
                    if (type === REPORT_SCV_HTML.HTML) {
                        this.cloudIDEService.downloadReportHTML(data, this.reportPath);
                    } else {
                        this.cloudIDEService.downloadReportCsv(data, this.reportPath);
                    }
                });
            } else {
                option = {
                    cmd: 'downloadDepReport',
                    data: reportParams
                };
                this.vscodeService.postMessage(option, null);
            }
        }
    }

    /**
     * 组装html报告静态页面信息
     * @param report 报告内容
     */
    downloadIntellijReportHtml(report: any): string {
        return new DepReportDetailUtil().downloadTemplate(this.formatCreatedId(report), this.instance);
    }

    // 返回的id数据处理20190822114355 => 2019/08/22 11:43:55
    formatCreatedId(data: string | any[]) {
        const years = data.slice(0, 4);
        const months = data.slice(4, 6);
        const days = data.slice(6, 8);
        const hours = data.slice(8, 10);
        const minutes = data.slice(10, 12);
        const seconds = data.slice(12, 14);
        return `${years}/${months}/${days} ${hours}:${minutes}:${seconds}`;
    }

    ngOnInit() {
        this.cloudIdeInterval = setInterval(() => {
            navigator.serviceWorker.ready.then((registration: any) => {
                if (registration.active) {
                    registration.active.postMessage({ channel: 'keepalive' });
                }
            });
        }, 20000);
        this.vscodeService.postMessage({ cmd: 'getCurrentAppName' }, (appName: string) => {
            this.currEnvAppName = appName;
        });
        this.copySuccess = this.i18n.common_term_report_copy_success;
        // vscode颜色主题
        if (document.body.className.indexOf('vscode-light') > -1) {
            this.currTheme = COLOR_THEME.Light;
        }
        this.vscodeService.regVscodeMsgHandler('colorTheme', (msg: any) => {
            this.currTheme = msg.colorTheme;
            this.changeDetectorRef.markForCheck();
            this.changeDetectorRef.detectChanges();
        });
        this.currLang = ((self as any).webviewSession || {}).getItem('language');
        // 国际化词条初始化
        this.argumentList.forEach(arg => {
            this.depArgs[arg].title = this.i18n[`common_term_analysis_${arg}_label`];
            if (arg !== 'softwareCode') {
                this.depArgs[arg].label = this.i18n.common_term_ipt_label[arg];
            }
            if (arg === 'softwareCode') {
                this.depArgs[arg].item2Arr.forEach((item2: string | number) => {
                    this.depArgs[arg].item2[item2].label = this.i18n.common_term_ipt_label[item2];
                });
            }
        });
        this.scanInfo.item1.title = this.i18n.plugins_port_report_left_item_title;
        this.scanInfo.item2.title = this.i18n.plugins_port_report_right_item_title;
        this.scanInfo.item1.package.lable = this.i18n.common_term_ipt_label.package;
        this.scanInfo.item1.software.label = this.i18n.common_term_ipt_label.path;
        this.scanInfo.item1.code.label = this.i18n.common_term_ipt_label.source_code_path;
        this.scanInfo.item2.compiler.label = this.i18n.common_term_ipt_label.compiler_version;
        this.scanInfo.item2.tool.label = this.i18n.common_term_ipt_label.construct_tool;
        this.scanInfo.item2.command.label = this.i18n.common_term_ipt_label.compile_command;
        this.binDetailSrcData = {
            data: [],
            state: {
                searched: false,
                sorted: false,
                paginated: false
            }
        };

        this.scanItems.forEach(scanItem => {
            this.scanItemsObj[scanItem].label = this.i18n[`plugins_port_title_${scanItem}`];
        });
        let response: any;
        this.route.queryParams.subscribe(data => {
            this.intelliJFlagDef = (data.intelliJFlag) ? true : false;
            if (this.intelliJFlagDef) {
                this.nodataImage = {
                    dark: './assets/img/default-page/dark-nodata-intellij.png',
                    light: './assets/img/default-page/light-nodata-intellij.png',
                };
                this.changeDetectorRef.markForCheck();
                this.changeDetectorRef.detectChanges();
            }
            response = data.response.replace(/#/g, ':');
            response = JSON.parse(response);
            this.currentReport = this.formatCreatedId(data.report);
            this.reportPath = data.report;
        });

        this.getBinDetaiColumns(this.binDetailColumns.length - 1);
        this.getReportDetail(response);
        this.binDetailDataList = this.binDetailSrcData.data;
        this.soFilesTotal = this.binDetailDataList.length;

        this.tableWidth = document.body.clientWidth - 280 + 'px';
        this.cFileNoData = this.I18n.I18nReplace(this.i18n.plugins_porting_message_cFile_noData, {
            0: ''
        });
        this.soFileNoData = this.I18n.I18nReplace(this.i18n.plugins_porting_message_soFile_noData, {
            0: this.i18n.plugins_port_label_soFileSummary
        });
        this.currentSelectLabel = this.i18n.plugins_porting_option_cFile_all;
        this.curTypeLabelWithSoFile = this.i18n.plugins_porting_option_cFile_all;
    }
    /**
     * 组件销毁
     */
    ngOnDestroy(): void {
        clearInterval(this.cloudIdeInterval);
    }

    changeData(data: any[], field: string | number) {
        // 重复项的第一项
        let count = 0;
        // 下一项
        let indexCount = 1;
        while (indexCount < data.length) {
            // 获取没有比较的第一个对象
            const item = data.slice(count, count + 1)[0];
            if (!item.rowSpan) {
                // 初始化为1
                item.rowSpan = 1;
            }
            if (data[indexCount][field]) {
                this.isPathname = true;
            }
            // 第一个对象与后面的对象相比，有相同项就累加，并且后面相同项设置为0
            if (item[field] === data[indexCount][field] &&
                data[indexCount][field] !== '' && item[field] !== ''
                && data[indexCount][field] !== '--' && item[field] !== '--') {
                item.rowSpan++;
                data[indexCount].rowSpan = 0;
            } else {
                count = indexCount;
            }
            indexCount++;
        }
    }

    /**
     * 对数据进行排序
     * @param data 列表
     */
    sortData(data: any[]) {
        for (let i = 0; i < data.length; i++) {
            for (let u = i + 1; u < data.length; u++) {
                if (data[i].pathName === data[u].pathName) {
                    let num = [];
                    num = data[i + 1];
                    data[i + 1] = data[u];
                    data[u] = num;
                }
            }
        }
    }
    getReportDetail(resp: any) {
        const soFileList: any[] = [];
        this.soFilesNeed = 0;
        this.asNeedTrans = 0;
        this.cmakeNeedTrans = 0;
        this.automakeNeedTrans = 0;
        this.asmFileLines = 0;
        this.asmLines = 0;
        this.makefileNeedTrans = 0;
        this.makefileTotal = 0;
        this.makefileLines = 0;
        this.soFilesTotal = 0;
        this.scanCTotal = 0;
        this.scanCNeedTrans = 0;
        this.cLines = 0;
        if (resp.status === 0) {
            this.binDetailList = [];
            this.reportDetailData = resp.data;
            // 提交扫描任务当时，若是否显示工作量预估值扫描参数的值为true
            // 报告中portingresult节点下将包含c_line、asm_line、workload信息
            // 据此判断生成的报告在前台展示时是否要展示工作量预估信息
            resp.data.result.software_installation_path.path.forEach((path: any) => {
                this.scanInfo.item1.software.value.push(path);
            });
            resp.data.result.installation_package_path.path.forEach((path: any) => {
                this.scanInfo.item1.package.value.push(path);

            });
            this.depArgs.softwareCode.item2.target_os.value = resp.data.result.target_os;
            this.depArgs.softwareCode.item2.target_system_kernel_version.value =
                resp.data.result.target_system_kernel_version;
            for (const item of this.scanInfo.item1.package.value) {
                this.packageTipStr += item + ', ';
            }
            this.packageTipStr = this.packageTipStr.substring(0, this.packageTipStr.lastIndexOf(','));
            let gf: any;
            if (resp.data.gfortran_version) {
                gf = resp.data.gfortran_version.toUpperCase() || '';
            }
            const obj: any = {};
            for (const pkg of resp.data.result.dependency_packages) {
                for (const key of Object.keys(pkg.porting_level)) {
                    if (pkg.porting_level[key].amount) {
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
            // 计算总依赖文件
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

            this.binDetailList = arr;
            this.binDetailList.forEach(detail => {
                soFileList.push(detail.libname);
            });

            this.binDetailDataList = this.binDetailDataList.sort((report1: any, report2: any) => {
                return report1.number - report2.number;
            });

            let noPathDesc = '';
            const list: Array<any> = [];
            this.binDetailList.forEach((item, index) => {
                noPathDesc = this.I18n.I18nReplace(
                    this.i18n.plugins_port_message_soPathSearch, { 0: this.formatSoFileType(item.type) });
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
                    isAarch64,
                    path_ext: item.path_ext,
                    showSub: false, // 是否显示子内容
                    fileType: this.formatSoFileType(item.type),
                    so_info: item.so_info,
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

            this.isPathExt = false;
            for (const item of list) {
              if (item.path_ext.length) {
                this.isPathExt = true;
                break;
              }
            }
            if (this.isPathExt) {
              if (this.binDetailColumns[0].title !== '') {
                this.binDetailColumns.unshift({
                  title: '',
                  width: '2%'
                });
              }
            } else {
              this.binDetailColumns.splice(0, 1);
            }

            this.getBinDetaiColumns(this.binDetailColumns.length - 1);
            this.binDetailSrcData.data = this.linePortingLevel(list);

            let hasDetailFlag;
            for (const element of resp.data.result.dependency_packages) {
                hasDetailFlag = element.porting_level[0].amount;
            }
            this.scanItemsObj.soFile.hasDetail = this.soFilesNeed + hasDetailFlag > 0;
            this.scanItemsObj.soFile.files = soFileList;

            // 版本问题规避部分字段
            if (resp.data.result.hasOwnProperty('portingresult')) {
                const cmakelistsinfo = resp.data.result.portingresult.cmakelistsinfo;
                const cmakeLines = resp.data.result.portingresult.cmakelistslines || 0;

                const automakeinfo = resp.data.result.portingresult.automakeinfo;
                const automakeLines = resp.data.result.portingresult.automakelines || 0;

                this.scanCNeedTrans = resp.data.result.portingresult.codefileinfo.needtranscount;
                this.asNeedTrans = resp.data.result.portingresult.asmfileinfo.needtranscount;
                this.cmakeNeedTrans = cmakelistsinfo ? cmakelistsinfo.needtranscount : 0;
                this.automakeNeedTrans = automakeinfo ? automakeinfo.needtranscount : 0;
                this.asmFileLines = resp.data.result.portingresult.asmfilelines;
                this.makefileNeedTrans = resp.data.result.portingresult.makefileinfo.needtranscount;
                this.makefileTotal = resp.data.result.portingresult.makefileinfo.totalcount;
                this.makefileLines = resp.data.result.portingresult.makefilelines;

                this.cLines = resp.data.result.portingresult.codelines + this.makefileLines
                    + cmakeLines + automakeLines;
                this.asmLines = resp.data.result.portingresult.asmlines + this.asmFileLines;
            }
        }
    }

    /**
     * 获取表格列字段
     * @columns 列数
     */
    private getBinDetaiColumns(columns: number) {
        this.binDetailColumns[columns - 6].title = this.i18n.common_term_no_label;
        this.binDetailColumns[columns - 5].title = this.i18n.common_term_name_label;
        this.binDetailColumns[columns - 4].title = this.i18n.plugins_porting_label_file_type;
        this.binDetailColumns[columns - 3].title = this.i18n.common_term_path_label;
        this.binDetailColumns[columns - 2].title = this.i18n.plugins_port_option_soFileType_software_package;
        this.binDetailColumns[columns - 1].options[0].label = this.i18n.plugins_porting_option_cFile_all;
        this.binDetailColumns[columns - 1].options[1].label = this.i18n.plugins_port_label_cFileSummary;
        this.binDetailColumns[columns - 1].options[2].label = this.i18n.plugins_port_label_linesSummary;
        this.binDetailColumns[columns - 1].title = this.i18n.common_term_report_result;
        this.binDetailColumns[columns].title = this.i18n.common_term_operate_sugg_label;
        this.binDetailColumns[columns - 1].selected = this.binDetailColumns[columns - 1].options[0];
    }
    // 对下载url进行切割
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
                    if (pre.urlName === cur.urlName) {  // 包名相同，则合并
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
     * 下载缺失包
     * @param url 路径
     */
    downloadSoFile(url: string) {
        if (this.intelliJFlagDef) {
            this.vscodeService.postMessage({
                cmd: 'openHyperlinks',
                data: {
                    hyperlinks: url
                }
            }, null);
        } else {
            const a = document.createElement('a');
            a.setAttribute('href', url);
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    }

    /**
     * 复制下载链接
     * @param url 链接地址
     * @param select 要复制的 input 类名
     * @param copy 点击 tip 名
     * @param row 每行详情
     */
    onCopy(url: string, copy: any, row: any) {
        if (!row.isClick) {
            copy.show();
            row.isClick = true;
            setTimeout(() => {
                copy.hide();
                row.isClick = false;
            }, 1000);
        }
        this.reportService.onCopyLink(url);
    }

    // 使 headfilter 和表格搜索联动。根据 headfilter 选中项给表格的搜索接口传入对应的搜索值，进行表格数据搜索。
    public onBinDetailSelect(item: any, column: TiTableColumns): void {
        const index: number = this.searchKeys.indexOf(column.key);
        const labelKey: string = column.labelKey || 'label';
        this.searchWords[index] = item[labelKey] === this.i18n.plugins_porting_option_cFile_all ? '' : item[labelKey];
    }

    /**
     * 处理意见
     * @param level 待验证或可兼容
     */
    formatSoResult(level: any) {
        let result = '';
        switch (level) {
            case '0':
                result = this.i18n.plugins_port_report_level0_result; // 动态库也需要维护一个format
                break;
            case '1':
                result = this.i18n.plugins_port_report_level1_result;
                break;
            case '2':
                result = this.i18n.plugins_port_report_level2_result;
                break;
            case '3':
                result = this.i18n.plugins_port_report_level3_result;
                break;
            case '4':
                result = this.i18n.plugins_port_report_level4_result;
                break;
            case '5':
                result = this.i18n.plugins_port_report_level5_result;
                break;
            case '6':
                result = this.i18n.plugins_port_report_level6_result;
                break;
            default:
                break;
        }
        return result;
    }

    /**
     * 根据文件类型标签筛选源文件列表
     * @param selectLabel 筛选标签
     */
    public onSelect(selectLabel: string): void {
        this.currentSelectLabel = selectLabel;
        this.cFileNoData = this.I18n.I18nReplace(this.i18n.plugins_porting_message_cFile_noData, {
            0: this.currentSelectLabel === this.i18n.plugins_porting_option_cFile_all ? '' : this.currentSelectLabel
        });
    }

    /**
     * 分析结果
     * @param level level
     */
    formatSoSuggestion(level: any) {
        let suggestion = '';
        // 0,5待验证替换
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

    /**
     * 映射依赖库文件类型
     * @param fielType 依赖库文件类型
     */
    formatSoFileType(fielType: any) {
        let typeName = '--';
        switch (fielType) {
            case 'DYNAMIC_LIBRARY':
                typeName = this.i18n.plugins_port_option_soFileType_dynamic_library;
                break;
            case 'STATIC_LIBRARY':
                typeName = this.i18n.plugins_port_option_soFileType_static_library;
                break;
            case 'EXEC':
                typeName = this.i18n.plugins_port_option_soFileType_executable_file;
                break;
            case 'SOFTWARE':
                typeName = this.i18n.plugins_port_option_soFileType_software_package;
                break;
            case 'JAR':
                typeName = this.i18n.plugins_port_option_soFileType_jar_packagey;
                break;
            default:
                break;
        }
        return typeName;
    }

    /**
     * 展开详情
     * @param row 表格行
     */
    public beforeToggle(row: TiTableRowData): void {
        row.showSub = !row.showSub;
        row.showDetails = !row.showDetails;  // details-icon-column对应showDetails属性
        if (row.soFileHasUrl) {  // jar行下面的.so文件径有下载链接，子路径单独合并
            this.mergeSoInfoList(row.soInfoList, ['urlName', 'oper', 'result']);
        } else {
            const data = this.binDetailSrcData.data;
            const subPathCount = row.showDetails ? row.path_ext.length : -row.path_ext.length;
            let num = row.number - 1;
            // 是否为第一个合并项
            if (row.showTd) {
                row.rowSpan += subPathCount;
            } else {
                // 是否和上一个 tr 为合并项
                if (data[num].url === data[num - 1].url && data[num].oper === data[num - 1].oper
                    && data[num].result === data[num - 1].result) {
                    num--;
                    while (num >= 0) {
                        if (data[num].showTd) {
                            data[num].rowSpan += subPathCount;
                            return;
                        }
                        num--;
                    }
                }
            }
        }
    }

    public trackByFn(index: number): number {
        return index;
    }
}
