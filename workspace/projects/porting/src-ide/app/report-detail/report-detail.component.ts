import {
    Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef, OnDestroy, Renderer2, AfterViewInit
} from '@angular/core';
import {I18nService, LANGUAGE_TYPE} from '../service/i18n.service';
import { TiTableColumns, TiTableRowData, TiTableSrcData, TiTipRef, TiTipService, Util } from '@cloud/tiny3';
import { Router, ActivatedRoute } from '@angular/router';
import { COLOR_THEME, VscodeService } from '../service/vscode.service';
import { ReportDetailUtil } from './report-detail.component.util';
import { ReportService } from '../service/report/report.service';

@Component({
    selector: 'app-report-detail',
    templateUrl: './report-detail.component.html',
    styleUrls: ['./report-detail.component.scss']
})
export class ReportDetailComponent implements OnInit, OnDestroy, AfterViewInit {
    private tipInstance: TiTipRef;
    private tipShowState = false;
    codefileinfo: any;
    fortranfileinfo: any;
    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private i18nService: I18nService,
        private renderer2: Renderer2,
        private vscodeService: VscodeService,
        private tipService: TiTipService,
        private reportService: ReportService,
        private changeDetectorRef: ChangeDetectorRef

    ) {
        this.instance = this;
        this.i18n = this.i18nService.I18n();
        // 禁止复用路由
        this.router.routeReuseStrategy.shouldReuseRoute = () => {
            return false;
        };
    }

    @Output() getReportId = new EventEmitter();
    @Output() getIsSign = new EventEmitter();
    @Input() report: any;
    @Input() currentReport: any;
    reportId = '';
    // intelliJ调用标识
    intelliJFlagDef = false;
    intelliJOS = '';
    public isPathname = false;
    public instance: ReportDetailComponent;
    public i18n: any;
    public currTheme = COLOR_THEME.Dark;
    public tableWidth: string;
    public filePath = '';
    public humanBudgetNum = 0;
    public showHumanFlag = false;
    public showHumanBudgetNum = true;
    public humanBudget = 0;
    public humanStandard = '0';
    public showLoading = false;
    public textForm1: any = {
        textForm: {
            type: 'text'
        },
        colsNumber: 1,
        colsGap: ['40px', '40px'],

        fieldVerticalAlign: 'middle',
        reportConfiureInfo: '',
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

    // 报告详细url请求响应信息
    public cmakeNeedTrans: number;
    public asmNeedTrans: number;
    public asmFileLines: number;
    public asmlines: number;
    public makefileNeedTrans: number;
    public makefileTotal: number;
    public makefileLines: number;
    public pythonLines: number;
    public golangLines: number;
    public javaLines: number;
    public scalaLines: number;
    public soFilesNeed: number;
    public soFilesTotal: number;
    public cFileTotal: number;
    public cFileNeed: number;
    public cLines: number;
    public automakeNeedTrans: number;
    public portingLevelList: Array<any> = [];
    public packageTipStr: any;
    public scanItems = ['soFile', 'cFile', 'lines'];
    public isOpen = false;
    public goTip = '';
    public goTipSwitch: boolean;
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
            isOpen: true
        },
        lines: {
            id: '4',
            label: '',
            icon: './assets/img/home/trans.png',
            content: '',
            asmContent: '',
            hasDetail: false,
            isOpen: false
        }
    };

    // 源文件表格信息
    public cfileDetailDisplay: Array<TiTableRowData> = [];
    public cfileDetailSrcData: TiTableSrcData;
    public cfileDetailAllData: Array<TiTableRowData> = [];
    public cfileDetailColumn: Array<TiTableColumns> = [{
        title: '',
        sortKey: '',
        width: '5%'
    },
    {
        title: '',
        sortKey: '',
        width: '15%'
    },
    {
        title: '',
        sortKey: 'path',
        width: '35%'
    },
    {
        title: '',
        width: '15%',
        sortKey: '',
        key: 'firstName',
        selected: null,
        options: [{
            label: '',
        }, {
            label: 'makefile'
        }, {
            label: 'C/C++ Source File'
        }, {
            label: 'ASM File'
        }, {
            label: 'Fortran'
        }, {
            label: 'Python'
        }, {
            label: 'Go'
        }, {
            label: 'Java'
        }, {
            label: 'Scala'
        }
        ]
    },
    {
        title: '',
        sortKey: 'linecount',
        width: '15%'
    },
    {
        title: '',
        sortKey: '',
        width: '15%'
    },
    ];

    // 依赖库表格信息定义

    private binDetailDataList: Array<TiTableRowData> = [];
    public binDetailDisplay: Array<TiTableRowData> = [];
    public binDetailSrcData: TiTableSrcData;
    public binDetailColumns: Array<TiTableColumns> = [{
        title: '',
        width: '7%'
    },
    {
        title: '',
        width: '13%'
    },
    {
        title: '',
        width: '10%'
    },
    {
        title: '',
        width: '30%'
    },
    {
        title: '',
        width: '15%',
        key: 'type',
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
        width: '25%'
    },
    ];

    // 源文件按类型存放
    public fileList: Array<any> = [{
        name: 'makefile',
        label: 'makefileinfo',
        files: [],
    },
    {
        name: 'C/C++ Source File',
        label: 'codefileinfo',
        files: []
    },
    {
        name: 'ASM File',
        label: 'asmfileinfo',
        files: []
    },
    {
        name: 'Fortran',
        label: 'fortranfileinfo',
        files: []
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
    public level: any;
    public type: any;
    public flag: any;
    // 需迁移代码行数
    public totalLine: any = 0;
    public realTotalLine: any = 0;
    public cfileLine = 0;
    // C/C++/Fortran和Makefile源代码行数
    public totalCodeLins = 0;
    // 汇编代码行数
    public totalAsmLins = 0;
    public needTransStatement = '';

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
    public cfileCopy: any;
    // 源文件扫描表格空数据提示
    public cFileNoData: string;
    // 获取主题颜色
    public ColorTheme = {
        Dark: COLOR_THEME.Dark,
        Light: COLOR_THEME.Light
    };
    public copySuccess: string;  // 复制成功提示
    public cloudIdeInterval: any;
    public nodataImage: any;
    public vscodePlantForm: string;
    public currLang: any;
    showInfoBox(info: any, type: any, realStatus: any) {
        const message = {
            cmd: 'showInfoBox',
            data: {
                info,
                type,
                realStatus,
            }
        };
        this.vscodeService.postMessage(message, null);
    }
    ngOnInit() {
        this.currLang = I18nService.getLang();
        this.cloudIdeInterval = setInterval(() => {
            navigator.serviceWorker.ready.then((registration: any) => {
                if (registration.active) {
                    registration.active.postMessage({ channel: 'keepalive'});
                }
            });
        }, 20000);
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
        this.binDetailSrcData = {
            data: [],
            state: {
                searched: false,
                sorted: false,
                paginated: false
            }
        };
        this.cfileDetailSrcData = {
            data: [],
            state: {
                searched: false,
                sorted: false,
                paginated: false
            }
        };

        // 获取报告详细信息
        this.route.queryParams.subscribe((data) => {
            this.intelliJFlagDef = (data.intelliJFlag) ? true : false;
            if (this.intelliJFlagDef) {
                this.nodataImage = {
                    dark: './assets/img/default-page/dark-nodata-intellij.png',
                    light: './assets/img/default-page/light-nodata-intellij.png',
                };
                this.changeDetectorRef.markForCheck();
                this.changeDetectorRef.detectChanges();
            }
            if (data.OS) {
                this.intelliJOS = data.OS;
            }
            if (data.response.vscodePlantForm) {
              this.vscodePlantForm = data.response.vscodePlantForm;
            }
            this.reportId = data.report;
            this.currentReport = this.formatCreatedId(data.report);
            this.showLoading = true;
            this.vscodeService.get(
              { url: `/task/progress/?task_type=0&task_id=${encodeURIComponent(this.reportId)}` },
              (response: any) => {
                if ((response.status !== 1) && response.status !== 0 && response.status !== 2) {
                  const info = this.currLang === LANGUAGE_TYPE.ZH ? response.infochinese : response.info;
                  this.showInfoBox(info, 'error', response.realStatus);
                  return;
                }
                // 判断是否为最新的扫描报告
                if (response.realStatus === '0x0d0223' && response.data.id) {
                  this.isNewReport = false;
                  this.newReportId = response.data.id;
                } else {
                  this.isNewReport = true;
                  this.newReportId = '';
                }
                this.getReportDetail(response);
                this.report = {
                  created: this.currentReport,
                  id: this.reportId
                };
                this.binDetailDataList = this.binDetailSrcData.data;
                this.getConfigData();
                this.tableWidth = document.body.clientWidth - 280 + 'px';
                this.cFileNoData = this.i18nService.I18nReplace(this.i18n.plugins_porting_message_cFile_noData, {
                  0: ''
                });
                this.sortData(this.binDetailDataList);
                // 行合并处理
                if (this.portingLevelList.length) {
                  this.portingLevelList = this.linePortingLevel(this.portingLevelList);
                }
                this.showLoading = false;
                if (this.intelliJFlagDef) {
                  this.changeDetectorRef.markForCheck();
                  this.changeDetectorRef.detectChanges();
                }
              });
        });
        this.textForm1.reportConfiureInfo = this.i18n.plugins_porting_setting_label;
        this.textForm1.firstItem.label = this.i18n.common_term_ipt_label.source_code_path;
        this.textForm1.secondItem.label = this.i18n.common_term_ipt_label.target_os;
        this.textForm1.thirdItem.label = this.i18n.common_term_ipt_label.target_system_kernel_version;
        this.textForm1.fourthItem.label = this.i18n.common_term_ipt_label.compiler_version;
        this.textForm1.fifthItem.label = this.i18n.common_term_ipt_label.construct_tool;
        this.textForm1.sixthItem.label = this.i18n.common_term_ipt_label.compile_command;
        this.scanItemsObj.soFile.label = this.i18n.common_term_result_soFile;
        this.scanItemsObj.cFile.label = this.i18n.common_term_result_cFile;
        this.scanItemsObj.lines.label = this.i18n.common_term_result_lines;
        this.binDetailColumns[0].title = this.i18n.common_term_no_label;
        this.binDetailColumns[1].title = this.i18n.common_term_name_label;
        this.binDetailColumns[2].title = this.i18n.plugins_porting_label_file_type;
        this.binDetailColumns[4].options[0].label = this.i18n.plugins_porting_option_cFile_all;
        this.binDetailColumns[4].options[1].label = this.i18n.plugins_port_label_cFileSummary;
        this.binDetailColumns[4].options[2].label = this.i18n.plugins_port_label_linesSummary;
        this.binDetailColumns[3].title = this.i18n.plugins_port_option_soFileType_software_package;
        this.binDetailColumns[4].title = this.i18n.common_term_report_result;
        this.binDetailColumns[5].title = this.i18n.common_term_operate_sugg_label;
        this.cfileDetailColumn[0].title = this.i18n.common_term_no_label;
        this.cfileDetailColumn[1].title = this.i18n.common_term_download_html_filename;
        this.cfileDetailColumn[2].title = this.i18n.plugins_porting_label_cFile_path;
        this.cfileDetailColumn[3].title = this.i18n.plugins_porting_label_file_type;
        this.cfileDetailColumn[3].options[0].label = this.i18n.plugins_porting_option_cFile_all;
        this.cfileDetailColumn[4].title = this.i18n.plugins_porting_option_linecount;
        this.cfileDetailColumn[5].title = this.i18n.common_term_operate;
    }
    /**
     * 组件销毁
     */
    ngOnDestroy(): void {
        clearInterval(this.cloudIdeInterval);
    }

    ngAfterViewInit() {
        // 整个页面的滚动条监听，关闭下拉框
        const element = $('.detail-container')[0];
        this.renderer2.listen(element, 'scroll', () => {
            Util.trigger(document, 'tiScroll');
        });
    }

    /**
     * 下载报告  reportType =0 csv格式， reportType =1 html格式
     * 判断是否下载
     */

    downloadOrGoReport(reportType = 0){
        this.vscodeService.get(
            { url: `/task/progress/?task_type=0&task_id=${encodeURIComponent(this.report.id)}` },
            (resp: any) => {
                if (resp.realStatus === '0x0d0112' || resp.realStatus === '0x0d0223') {
                    const message = {
                        cmd: 'sourceInfoBox',
                        data: {
                           resp
                        }
                    };
                    this.vscodeService.postMessage(message, null);
                } else {
                    // intellij下载html走该逻辑
                    if (this.intelliJFlagDef && reportType === 1) {
                        this.vscodeService.postMessage({
                            cmd: 'sourceReportDownload',
                            data: {
                                reportId: this.report.id,
                                reportType: 1
                            }
                        }, null);
                    } else {
                        this.vscodeService.postMessage({
                            cmd: 'downloadReport',
                            data: {
                                reportId: this.report.id,
                                reportType,
                                label: this.report.id
                            }
                        }, null);
                    }
                }
            });
    }
    /**
     * intelliJ复制下载链接
     * @param url 链接
     */
    copyDownloadUrl(url: any, $event: any) {
        const selBox = document.createElement('textarea');
        selBox.style.position = 'absolute';
        selBox.style.left = '0';
        selBox.style.top = '0';
        selBox.style.opacity = '0';
        selBox.value = url;
        document.body.appendChild(selBox);
        selBox.focus();
        selBox.select();
        const success = document.execCommand('copy');
        this.tipInstance = this.tipService.create($event.target, {
            position: 'top', hasArrow: false
        });
        if (success && !this.tipShowState) {
            this.tipInstance.show(this.i18n.common_term_report_copy_success);
            setTimeout(() => {
                this.tipInstance.hide();
            }, 500);
        } else {
            this.tipInstance.hide();
            this.tipShowState = false;
        }
        document.body.removeChild(selBox);
    }

    /**
     * 组装html报告静态页面信息
     * @param report 报告内容
     */
    downloadTemplete(report: any): string {
        return ReportDetailUtil.downloadTemplete(report, this.instance);
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
        this.soFilesNeed = 0;
        let compiler = '';
        this.asmNeedTrans = 0;
        this.cmakeNeedTrans = 0;
        this.automakeNeedTrans = 0;
        this.asmFileLines = 0;
        this.asmlines = 0;
        this.makefileNeedTrans = 0;
        this.makefileTotal = 0;
        this.makefileLines = 0;
        this.soFilesTotal = 0;
        this.cLines = 0;
        this.cFileTotal = 0;
        this.cFileNeed = 0;
        this.goTipSwitch = false;
        if (resp.data.info !== {} && resp.data.portingresult !== {}) {
            const sourcedirs = resp.data.info.sourcedir.split(',');
            if (sourcedirs.length > 0) {
                sourcedirs.forEach((item: any) => {
                    this.textForm1.firstItem.value.push(item);
                });
            }
            const gf = resp.data.info.gfortran.toUpperCase() || '';
            this.textForm1.secondItem.value = resp.data.info.targetos === 'centos7.6'
                ? 'CentOS 7.6'
                : resp.data.info.targetos;
            this.textForm1.thirdItem.value = `${resp.data.info.targetkernel}`;
            // 合并编译工具的gcc字段
            if (resp.data.info.compiler.type
                || (resp.data.info.compiler.type && resp.data.info.cgocompiler.type)
            ){
                compiler = `${resp.data.info.compiler.type.toUpperCase()} ` + resp.data.info.compiler.version;
            } else if (resp.data.info.cgocompiler.type) {
                compiler = `${resp.data.info.cgocompiler.type.toUpperCase()} ` + resp.data.info.cgocompiler.version;
            }
            if (compiler && gf) {
              this.textForm1.fourthItem.value = compiler + `, ${gf}`;
            } else if (compiler && !gf) {
              this.textForm1.fourthItem.value = compiler;
            } else if (!compiler && gf) {
              this.textForm1.fourthItem.value = `${gf} `;
            } else {
              this.textForm1.fourthItem.value = '--';
            }
            this.textForm1.fifthItem.value = resp.data.info.constructtool || '--';
            this.textForm1.sixthItem.value = resp.data.info.compilecommand || '--';

            // 获取本地映射路径
            if (resp.data.info.os_mapping_dir) {
                resp.data.info.os_mapping_dir = resp.data.info.os_mapping_dir.replace(/\\\\/g, '\\');
                if (this.intelliJFlagDef) {
                    if (this.intelliJOS === 'windows') {
                        resp.data.info.os_mapping_dir = resp.data.info.os_mapping_dir.replace(/\//g, '\\');
                    } else if (this.intelliJOS === 'linux') {
                        resp.data.info.os_mapping_dir = resp.data.info.os_mapping_dir.replace(/\\/g, '/');
                    }
                }

                this.textForm1.firstItem.value[0] = resp.data.info.os_mapping_dir;
                this.filePath = resp.data.info.os_mapping_dir;
            }
            this.packageTipStr = this.textForm1.firstItem.value.join(',');


            // 获取详细结果数据
            const porting_level = resp.data.portingresult.porting_level;

            const obj: any = {};
            // 获取后端返回的提示语，并考虑兼容
            if (resp.data.portingresult.tips){
                if (resp.data.portingresult.tips.length !== 0 && this.i18nService.currLang === 'zh-cn'){
                    this.goTipSwitch = true;
                    this.goTip = resp.data.portingresult.tips[0].info_cn;
                } else if (resp.data.portingresult.tips.length !== 0
                    && (this.i18nService.currLang === 'en' || this.i18nService.currLang === 'en-us')){
                    this.goTipSwitch = true;
                    this.goTip = resp.data.portingresult.tips[0].info_en;
                }
            } else {
                this.goTip = '';
            }
            if (porting_level) {
                for (const key of Object.keys(porting_level)) {
                    if (porting_level[key].amount) {
                        obj[key] = porting_level[key];
                        this.soFilesTotal += porting_level[key].amount;
                    }
                    if (Number(key) === 2 || Number(key) === 3) {
                        porting_level[key].bin_detail_info.forEach((bin: any) => {
                            bin.level = key;
                        });
                        this.portingLevelList = this.portingLevelList.concat(porting_level[key].bin_detail_info);
                        this.soFilesNeed += porting_level[key].amount;
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
                    desc: item.desc,
                    pathName: unescape(item.url.substring(num + 1, item.url.length)),
                    oper: this.formatSuggestion(item.level, true),
                    result: this.formatSoResult(item.level, item.type, true),
                    type: this.formatSoFileType(item.type),
                    url: item.url || '--'
                };
            });

            // 版本问题规避部分字段
            const cmakelistsinfo = resp.data.portingresult.cmakelistsinfo;
            const cmakeLines = resp.data.portingresult.cmakelistslines || 0;
            const automakeinfo = resp.data.portingresult.automakeinfo;
            const automakeLines = resp.data.portingresult.automakelines || 0;

            // 组装页面展示数据
            this.binDetailSrcData.data = this.portingLevelList;
            this.cLines = resp.data.portingresult.codelines;
            this.cFileTotal = resp.data.portingresult.codefileinfo.totalcount;
            this.cFileNeed = resp.data.portingresult.codefileinfo.needtranscount;
            const codefiles = resp.data.portingresult.codefileinfo.files; // cfile
            this.asmlines = resp.data.portingresult.asmlines;
            this.asmFileLines = resp.data.portingresult.asmfilelines;
            this.asmNeedTrans = resp.data.portingresult.asmfileinfo.needtranscount;
            const asmfiles = resp.data.portingresult.asmfileinfo.files;
            this.cmakeNeedTrans = cmakelistsinfo ? cmakelistsinfo.needtranscount : 0;
            const cmakefiles = cmakelistsinfo ? cmakelistsinfo.files : [];
            this.automakeNeedTrans = automakeinfo ? automakeinfo.needtranscount : 0;
            const automakefiles = automakeinfo ? automakeinfo.files : [];
            this.makefileLines = resp.data.portingresult.makefilelines;
            const makefiles = resp.data.portingresult.makefileinfo.files; // cfile
            this.makefileTotal = resp.data.portingresult.makefileinfo.totalcount;
            this.makefileNeedTrans = resp.data.portingresult.makefileinfo.needtranscount;
            const fortranNeedTrans = resp.data.portingresult.fortranfileinfo.needtranscount;
            this.fortranfileinfo = resp.data.portingresult.fortranfileinfo.totalcount;
            const fortranLines = resp.data.portingresult.fortranlines;
            const fortranfiles = resp.data.portingresult.fortranfileinfo.files;
            const pythonNeedTrans = resp.data.portingresult.hasOwnProperty('pythonfileinfo')
                ? resp.data.portingresult.pythonfileinfo.needtranscount
                : 0;
            this.pythonLines = resp.data.portingresult.pythonlines || 0;
            const pythonfiles = resp.data.portingresult.hasOwnProperty('pythonfileinfo')
                ? resp.data.portingresult.pythonfileinfo.files
                : [];
            const golangNeedTrans = resp.data.portingresult.hasOwnProperty('golangfileinfo')
                ? resp.data.portingresult.golangfileinfo.needtranscount
                : 0;
            this.golangLines = resp.data.portingresult.golanglines || 0;
            const golangfiles = resp.data.portingresult.hasOwnProperty('golangfileinfo')
                ? resp.data.portingresult.golangfileinfo.files
                : [];
            const javaNeedTrans = resp.data.portingresult.hasOwnProperty('javafileinfo')
                ? resp.data.portingresult.javafileinfo.needtranscount
                : 0;
            this.javaLines = resp.data.portingresult.javalines || 0;
            const javafiles = resp.data.portingresult.hasOwnProperty('javafileinfo')
                ? resp.data.portingresult.javafileinfo.files
                : [];
            const scalaNeedTrans = resp.data.portingresult.hasOwnProperty('scalafileinfo')
                ? resp.data.portingresult.scalafileinfo.needtranscount
                : 0;
            this.scalaLines = resp.data.portingresult.scalalines || 0;
            const scalafiles = resp.data.portingresult.hasOwnProperty('scalafileinfo')
                ? resp.data.portingresult.scalafileinfo.files
                : [];
            this.scanItemsObj.soFile.content = this.soFilesNeed;
            this.scanItemsObj.soFile.hasDetail = this.portingLevelList.length > 0;
            this.scanItemsObj.soFile.files = soFileList;

            this.scanItemsObj.cFile.content = this.cFileNeed + this.makefileNeedTrans + this.asmNeedTrans
                + this.cmakeNeedTrans
                + this.automakeNeedTrans
                + fortranNeedTrans
                + pythonNeedTrans
                + golangNeedTrans
                + javaNeedTrans
                + scalaNeedTrans;
            this.scanItemsObj.cFile.hasDetail = (codefiles.length
                + makefiles.length
                + cmakefiles.length
                + automakefiles.length
                + asmfiles.length
                + fortranfiles.length
                + pythonfiles.length
                + golangfiles.length
                + javafiles.length
                + scalafiles.length) > 0;
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

            // 筛选标签处理
            this.fileList[0].files = makefiles.concat(cmakefiles).concat(automakefiles);
            this.fileList[1].files = codefiles;
            this.fileList[2].files = asmfiles;
            this.fileList[3].files = fortranfiles;
            this.fileList[4].files = pythonfiles;
            this.fileList[5].files = golangfiles;
            this.fileList[6].files = javafiles;
            this.fileList[7].files = scalafiles;
            for (let i = this.fileList.length - 1; i >= 0; i--) {
                if (this.fileList[i].files.length === 0) {
                    this.cfileDetailColumn[3].options.splice(i + 1, 1);
                }
            }

            // 按类型填充源文件表格
            let cfileNameArr = [];
            let fileTypeName = '';
            let filesIndex = 1;
            let folderName = '';
            if (this.filePath.length > 0) {
                folderName = this.filePath;
            }
            let showLineCount = false;
            this.fileList.forEach((item, index) => {
                fileTypeName = item.name;
                item.files.forEach((innerItem: any, innerIndex: any) => {
                    const filestatus = (typeof(innerItem) === 'string' ? innerItem : innerItem.filedirectory);
                    showLineCount = !(typeof(innerItem) === 'string');
                    cfileNameArr = filestatus.split('/');
                    let localPath = '';
                    if (folderName.length > 0) {
                        const sourcedir = sourcedirs[sourcedirs.length - 1];
                        localPath = folderName + filestatus.substring(sourcedir.length);
                        if (this.vscodePlantForm === 'win32') {
                          localPath = localPath.replace(/\//g, '\\');
                        }
                    }
                    if (this.intelliJFlagDef) {
                        if (this.intelliJOS === 'windows') {
                            localPath = localPath.replace(/\//g, '\\');
                        } else if (this.intelliJOS === 'linux') {
                            localPath = localPath.replace(/\\/g, '/');
                        }
                    }
                    this.cfileDetailSrcData.data.push({
                        id: filesIndex,
                        filename: cfileNameArr[cfileNameArr.length - 1],
                        path: localPath.length > 0 ? localPath : filestatus,
                        remotePath: filestatus,
                        fileType: fileTypeName,
                        linecount: typeof(innerItem) === 'string' ? '' : innerItem.linecount,
                        visited: false
                    });
                    this.cfileDetailAllData.push({
                        id: filesIndex,
                        filename: cfileNameArr[cfileNameArr.length - 1],
                        path: localPath.length > 0 ? localPath : innerItem,
                        remotePath: filestatus,
                        fileType: fileTypeName,
                        linecount: typeof(innerItem) === 'string' ? '' : innerItem.linecount,
                        visited: false
                    });
                    this.cfileCopy = JSON.parse(JSON.stringify(this.cfileDetailSrcData.data));
                    filesIndex = filesIndex + 1;
                });
            });
            // 旧报告不显示行数
            if (!showLineCount) {
                this.cfileDetailColumn[4].title = '';
                this.cfileDetailColumn[4].width = '0';
            }
            this.currentSelectLabel = this.i18n.plugins_porting_option_cFile_all;
            if (((self as any).webviewSession || {}).getItem('language') === 'en-us') {
                if (resp.data.portingresult.workload > 0 && resp.data.portingresult.workload <= 1) {
                    this.humanBudget = this.i18n.plugins_port_Estimated_standard_subinfo2;
                } else {
                    this.humanBudget = this.i18n.plugins_port_Estimated_standard_subinfo1;
                }
            } else {
                this.humanBudget = this.i18n.plugins_port_Estimated_standard_subinfo;
            }
            const workload = resp.data.portingresult.workload;
            if (workload) {
                this.humanBudgetNum = workload;
                this.showHumanBudgetNum = true;
            } else {
                this.showHumanBudgetNum = false;
            }
            // 词条国际化
            if (this.soFilesNeed === 1) {
                this.scanItemsObj.soFile.content = this.i18nService.I18nReplace(
                    this.i18n.common_term_report_soFile_dependent2, {
                    0: this.soFilesTotal,
                    1: this.soFilesNeed
                });
            } else {
                this.scanItemsObj.soFile.content = this.i18nService.I18nReplace(
                    this.i18n.common_term_report_soFile_dependent, {
                    0: this.soFilesTotal,
                    1: this.soFilesNeed
                });
            }
            this.cfileLine = this.scanItemsObj.cFile.content;
            this.scanItemsObj.cFile.content = this.i18nService.I18nReplace(
                this.i18n.common_term_report_cFile_dependent,
                { 0: this.scanItemsObj.cFile.content }
            );
            this.totalLine = this.cLines
                + this.makefileLines
                + cmakeLines
                + automakeLines
                + fortranLines
                + this.asmlines
                + this.asmFileLines
                + this.pythonLines
                + this.golangLines
                + this.javaLines
                + this.scalaLines;
            if (this.totalLine > 100000) {
                this.totalLine = this.totalLine.toString().substring(0, 2) + 'w+';
            }
            this.totalCodeLins = this.cLines
                + this.makefileLines
                + cmakeLines
                + automakeLines
                + fortranLines
                + this.pythonLines
                + this.golangLines
                + this.javaLines
                + this.scalaLines;
            this.totalAsmLins = this.asmlines + this.asmFileLines;
            this.needTransStatement = this.i18nService.I18nReplace(
                this.i18n.plugins_common_tips_reportDetailCtansLins, {
                1: this.totalLine,
            });
            // 做动态代码行提示
            let codelines = '';
            if (this.i18nService.currLang === 'zh-cn') {
                codelines = ' 行';
            } else if (this.i18nService.currLang === 'en' || this.i18nService.currLang === 'en-us') {
                codelines = ' lines';
            }
            if (this.makefileLines + cmakeLines + automakeLines !== 0) {
                this.needTransStatement +=
                `makefile: ${this.makefileLines + cmakeLines + automakeLines + codelines}; `;
            }
            if (this.cLines + this.asmlines !== 0) {
                this.needTransStatement +=
                `C/C++: ${this.cLines + this.asmlines + codelines}; `;
            }
            if (this.asmFileLines !== 0) {
                this.needTransStatement +=
                `ASM: ${this.asmFileLines + codelines}; `;
            }
            if (fortranLines !== 0) {
                this.needTransStatement +=
                `Fortran: ${fortranLines + codelines}; `;
            }
            if (this.pythonLines !== 0) {
                this.needTransStatement +=
                `Python: ${this.pythonLines + codelines}; `;
            }
            if (this.golangLines !== 0) {
                this.needTransStatement +=
                `Go: ${this.golangLines + codelines}; `;
            }
            if (this.javaLines !== 0) {
                this.needTransStatement +=
                `Java: ${this.javaLines + codelines}; `;
            }
            if (this.scalaLines !== 0) {
                this.needTransStatement +=
                `Scala: ${this.scalaLines + codelines}; `;
            }
            this.scanItemsObj.lines.content = this.needTransStatement;
        }

    }

    /**
     * 对数据内容一致的行进行行合
     * @param list 数据列表
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
                    // 使其以序号做次关键字排序
                    if (data[i].number > data[i + 1].number){
                        let tempCur = [];
                        tempCur = data[i];
                        data[i] = data[i + 1];
                        data[i + 1] = tempCur;
                    }
                }
            }
        }
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
        }
        return typeName;
    }
    async getConfigData() {
        const loginId = ((self as any).webviewSession || {}).getItem('loginId');
        this.vscodeService.get({ url: `/users/${encodeURIComponent(loginId)}/config/` }, (res: any) => {
            // 动态计算工作量预估标准
            const data = res.data;
            this.showHumanFlag = data.p_month_flag;
            this.humanStandard = this.i18nService.I18nReplace(this.i18n.plugins_porting_Estimated_standard_subtitle, {
                0: data.c_line || 0,
                1: data.asm_line || 0
            });
        });
        if (this.intelliJFlagDef) {
            while (this.humanStandard === '0') {
                await this.sleep(10);
            }
            this.changeDetectorRef.markForCheck();
            this.changeDetectorRef.detectChanges();
        }
    }
    /**
     * 等待指定的时间
     * @param ms 等待时间
     */
    private async sleep(ms: number) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve('');
            }, ms);
        });
    }
    formatSoResult(level: any, type: any, flag: boolean) {
        let result = '';
        switch (level) {
            case '0':
                const levelResult0En = `Download`;
                result = flag ? this.i18n.plugins_port_report_level0_result : levelResult0En; // 动态库也需要维护一个format
                break;
            case '1':
                const levelResult1En = 'Download Source Code';
                result = flag ? this.i18n.plugins_port_report_level1_result : levelResult1En;
                break;
            case '2':
                const levelResult2En = 'Obtain the source code and compile it to a' +
                    'Kunpeng-compatible version or use an alternate solution.';
                result = flag ? this.i18n.plugins_port_report_level2_result : levelResult2En;
                break;
            case '3':
                const levelResult3En = 'Verify whether it is compatible with the Kunpeng platform. If not,' +
                    ' obtain a Kunpeng-compatible version from the supplier or obtain the source code and compile ' +
                    'it to a Kunpeng-compatible version.';
                result = flag ? this.i18n.plugins_port_report_level7_result : levelResult3En;
                break;
        }
        return result;
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

                const level0En = 'so libraries have been verified on the Kunpeng platform, \
                the Kunpeng community has an arm64 version, \
                the URL is the download address (binary package).';
                suggestion = flag ? this.i18n.plugins_porting_report_level0_desc : level0En;
                break;
            case '1':

                const level1En = 'so libraries have been verified on the Kunpeng platform, \
                the Kunpeng community has an arm64 version, \
                the URL is the source address, user need to compile on the platform.';
                suggestion = flag ? this.i18n.plugins_porting_report_level1_desc : level1En;
                break;
            case '2':
                const level2En = 'so libraries cannot be supported on the Kunpeng platform, \
                and the Kunpeng community has no alternative.';
                suggestion = flag ? this.i18n.plugins_porting_report_level2_desc : level2En;
                break;
            case '3':
                const level3En = 'so libraries are not recognized on the Kunpeng platform.';
                suggestion = flag ? this.i18n.plugins_porting_report_level3_desc : level3En;
                break;
        }
        return suggestion;
    }

    formatSuggestion(level: any, flag: boolean) {
        let suggestion = '';
        switch (level) {
            case '0':
                const level0En = 'Compatible with the Kunpeng platform.';
                suggestion = flag ? this.i18n.plugins_port_report_level0_desc : level0En;
                break;
            case '1':
                const level1En = 'Compatible with the Kunpeng platform.';
                suggestion = flag ? this.i18n.plugins_port_report_level1_desc : level1En;
                break;
            case '2':
                const level2En = 'Not compatible with the Kunpeng platform.';
                suggestion = flag ? this.i18n.plugins_port_report_level2_desc : level2En;
                break;
            case '3':
                const level3En = 'The compatibility with the Kunpeng platform is unknown.';
                suggestion = flag ? this.i18n.plugins_port_report_level7_desc : level3En;
                break;
        }
        return suggestion;
    }
    /**
     * 根据文件类型标签筛选源文件列表
     * @param selectOption 筛选标签
     */
    onSelect(selectOption: any): void {
        this.currentSelectLabel = selectOption.label;
        this.cFileNoData = this.i18nService.I18nReplace(this.i18n.plugins_porting_message_cFile_noData, {
            0: this.currentSelectLabel === this.i18n.plugins_porting_option_cFile_all ? '' : this.currentSelectLabel
        });
        this.cfileDetailSrcData.data = this.cfileCopy;
        this.cfileDetailSrcData.data = this.cfileDetailSrcData.data.filter(cfileItem => {
            return cfileItem.fileType === this.currentSelectLabel
                   || this.currentSelectLabel === this.i18n.plugins_porting_option_cFile_all;
        });
    }

    // 表格组件提供的排序中字符串比较是使用基于标准字典的 Unicode 值来进行比较的。如果开发者需要本地化的排序，
    // 可使用tiHeadSort组件的compareFn接口来自定义所在列的本地化排序规则。本地化排序规则可利用 localeCompare 方法。
    public compareFn = (a: TiTableRowData, b: TiTableRowData, sortKey: string): number => {
        const language = 'zh-CN'; // 根据实际情况设置当前语言种类
        if (sortKey === 'linecount') {
          return a.linecount - b.linecount;
        }
        return a[sortKey].localeCompare(b[sortKey], language); // localeCompare方法还有更多配置，可在网上查阅。
    }

    /**
     * 下载缺失包
     * @param url 路径
     */
    downloadSoFile(url: string) {
        // intellij走该逻辑
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
     * 根据文件类型标签筛选依赖库文件
     * @param selectLabel 筛选标签
     */
    public onSelectWithSoFile(selectOption: any): void {
        const currentSelectLabel = selectOption.label;
        let fileIndex = 1;
        this.binDetailSrcData.data = [];
        this.binDetailDataList.forEach((item) => {
            const index = item.url.lastIndexOf('\/');
            if (currentSelectLabel === this.i18n.plugins_porting_option_cFile_all) {
                this.binDetailSrcData.data.push({
                    number: fileIndex++,
                    level: item.level,
                    name: item.name,
                    path: item.path,
                    desc: item.desc,
                    oper: item.oper,
                    pathName: item.url.substring(index + 1, item.url.length),
                    url: item.url,
                    result: item.result,
                    downloadDesc: item.downloadDesc,
                    path_ext: item.path_ext,
                    showSub: item.showSub,
                    type: item.type
                });
            } else if (currentSelectLabel === this.i18n.plugins_port_label_cFileSummary) {
                switch (item.level) {
                    case '0':
                        this.binDetailSrcData.data.push({
                            number: fileIndex++,
                            level: item.level,
                            name: item.name,
                            path: item.path,
                            desc: item.desc,
                            oper: item.oper,
                            pathName: item.url.substring(index + 1, item.url.length),
                            url: item.url,
                            result: item.result,
                            downloadDesc: item.downloadDesc,
                            path_ext: item.path_ext,
                            showSub: item.showSub,
                            type: item.type
                        });
                        break;
                    case '1':
                        this.binDetailSrcData.data.push({
                            number: fileIndex++,
                            level: item.level,
                            name: item.name,
                            path: item.path,
                            desc: item.desc,
                            oper: item.oper,
                            pathName: item.url.substring(index + 1, item.url.length),
                            result: item.result,
                            url: item.url,
                            downloadDesc: item.downloadDesc,
                            path_ext: item.path_ext,
                            showSub: item.showSub,
                            type: item.type
                        });
                        break;
                }
            } else {
                switch (item.level) {
                    case '2':
                        this.binDetailSrcData.data.push({
                            number: fileIndex++,
                            level: item.level,
                            name: item.name,
                            path: item.path,
                            desc: item.desc,
                            oper: item.oper,
                            pathName: item.url.substring(index + 1, item.url.length),
                            result: item.result,
                            url: item.url,
                            downloadDesc: item.downloadDesc,
                            path_ext: item.path_ext,
                            showSub: item.showSub,
                            type: item.type
                        });
                        break;
                    case '3':
                        this.binDetailSrcData.data.push({
                            number: fileIndex++,
                            level: item.level,
                            name: item.name,
                            path: item.path,
                            desc: item.desc,
                            oper: item.oper,
                            pathName: item.url.substring(index + 1, item.url.length),
                            result: item.result,
                            url: item.url,
                            downloadDesc: item.downloadDesc,
                            path_ext: item.path_ext,
                            showSub: item.showSub,
                            type: item.type
                        });
                        break;
                }
            }

        });
        // 行合处理
        this.binDetailSrcData.data = this.linePortingLevel(this.binDetailSrcData.data);
    }
    /**
     * 返回的id数据处理2019_08_22_11_43_55 => 2019/08/22 11:43:55
     * @param data 2019_08_22_11_43_55
     */
    formatCreatedId(data: any) {
        const years = data.slice(0, 4);
        const months = data.slice(4, 6);
        const days = data.slice(6, 8);
        const hours = data.slice(8, 10);
        const minutes = data.slice(10, 12);
        const seconds = data.slice(12, 14);
        return `${years}/${months}/${days} ${hours}:${minutes}:${seconds}`;
    }

    /**
     * 查看源码建议操作
     * @param remoteFileName 全路径文件名
     */
    codeSuggestingOpe(localFileName: any, remoteFileName: any, remoteFileType: any) {
        // 更新行中上一次点击的“查看建议代码”记录visited，并灰色标记
        this.colorVisited(remoteFileName);
        this.showLoading = true;
        this.vscodeService.get(
            { url: `/task/progress/?task_type=0&task_id=${encodeURIComponent(this.reportId)}` },
            (resp: any) => {
                if (resp.realStatus === '0x0d0112' || resp.realStatus === '0x0d0223') {
                const message = {
                    cmd: 'sourceInfoBox',
                    data: {
                        resp,
                        type: 'view'
                    }
                };
                this.vscodeService.postMessage(message, null);
                }else{
                    this.vscodeService.postMessage({
                        cmd: 'codeSuggestingOpt',
                        data: {
                            url: '/portadv/tasks/'.concat(encodeURIComponent(this.reportId)).concat('/portinginfo/'),
                            reportId: this.report.id,
                            filepath: localFileName,
                            remoteFilePath: remoteFileName,
                            fileType: remoteFileType
                        }
                    }, null);
                }
                this.showLoading = false;
            });
    }

    colorVisited(remoteFileName: any) {
        const cfileDetailSrcData: Array<TiTableRowData> = [];
        this.cfileDetailSrcData.data.forEach(cfileItem => {
            let visited = false;
            if (cfileItem.remotePath === remoteFileName) {
                visited = true;
            }
            cfileDetailSrcData.push({
                id: cfileItem.id,
                filename: cfileItem.filename,
                path: cfileItem.path,
                remotePath: cfileItem.remotePath,
                fileType: cfileItem.fileType,
                linecount: cfileItem.linecount,
                visited
            });
        });
        this.cfileDetailSrcData.data = cfileDetailSrcData;
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
}
