import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { TiTableColumns, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';

import { VscodeService } from '../service/vscode.service';
import { I18nService } from '../service/i18n.service';
import { ReportService } from '../service/report/report.service';
import { SoftwarePackageUtil } from './software-package-report.component.util';
import { ENV_APP_NAME } from '../service/constant';
import { CloudIDEService } from '../service/cloudIDE.service';

@Component({
    selector: 'app-software-package-report',
    templateUrl: './software-package-report.component.html',
    styleUrls: ['./software-package-report.component.scss']
})
export class SoftwarePackageReportComponent implements OnInit, OnDestroy {

    constructor(
        private route: ActivatedRoute,
        private i18nService: I18nService,
        private vscodeService: VscodeService,
        private reportService: ReportService,
        private changeDetectorRef: ChangeDetectorRef,
        private cloudIDEService: CloudIDEService
    ) {
        this.i18n = this.i18nService.I18n();
        this.instance = this;
        this.showLoading = true;
    }
    public instance: SoftwarePackageReportComponent;
    public i18n: any;
    public currLang: string;
    intelliJFlagDef = false;
    public currentReport: string;  // 日期或者包名
    public reportName: string;
    public reportTitle: string;
    public reportId: string;
    // 左侧配置信息
    public settingLeftInfo: Array<{
        label: string,
        value?: string,
        isSuccessed?: string
    }>;
    // 右侧配置信息
    public settingRightInfo: Array<{
        title: string,
        value?: number
    }>;
    public middleSettingLeftInfo: any; // 中间件，为了传参需要

    // table 信息
    public scanItems: any = {
        soFile: {
            label: '',
        },
        cFile: {
            label: ''
        },
        type: []
    };

    // 已更新依赖文件表格
    public soFiledisplayed: Array<TiTableRowData> = [];
    public soFileSrcData: TiTableSrcData;
    public soFileColumns: Array<TiTableColumns> = [
        {
            title: '',
            width: '10%'
        },
        {
            title: '',
            width: '20%'
        },
        {
            title: '',
            width: '30%'
        },
        {
            title: '',
            width: '40%'
        },
    ];

    // 缺失依赖文件表格
    public cFiledisplayed: Array<TiTableRowData> = [];
    public cFileSrcData: TiTableSrcData;
    public cFileColumns: Array<TiTableColumns> = [
        {
            title: '',
            width: '5%'
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
            width: '45%'
        },
        {
            title: '',
            width: '10%'
        },
    ];
    public showLoading = true;
    public reportInfo: {
        name: string,  // 文件包名
        path: string,  // 报告reportId 时间戳
    };
    public currEnvAppName: string;  // 环境名称
    public cloudIdeInterval: any;
    public pkgRebuildPath: string;  // 重构后的软件包存放路径

    ngOnInit(): void {
        this.cloudIdeInterval = setInterval(() => {
            navigator.serviceWorker.ready.then((registration: any) => {
                if (registration.active) {
                    registration.active.postMessage({ channel: 'keepalive'});
                }
            });
        }, 20000);
        this.vscodeService.postMessage({ cmd: 'getCurrentAppName' }, (appName: string) => {
            this.currEnvAppName = appName;
        });

        this.currLang = ((self as any).webviewSession || {}).getItem('language');

        this.settingLeftInfo = [
            { label: this.i18n.common_term_path_label },
            { label: this.i18n.software_package_detail.time },
            { label: this.i18n.software_package_detail.path },
            { label: this.i18n.software_package_detail.result }
        ];

        this.settingRightInfo = [
            { title: this.i18n.software_package_detail.relayNum },
            { title: this.i18n.software_package_detail.lackNum },
            { title: this.i18n.plugins_port_label_soFileSummary }
        ];

        this.scanItems = {
            soFile: {
                label: this.i18n.software_package_detail.relayNum
            },
            type: ['soFile']
        };

        this.soFileColumns[0].title = this.i18n.common_term_no_label;
        this.cFileColumns[0].title = this.i18n.common_term_no_label;
        this.soFileColumns[1].title = this.i18n.software_package_detail.common_term_name_label_1;
        this.cFileColumns[1].title = this.i18n.software_package_detail.common_term_name_label_1;
        this.soFileColumns[2].title = this.i18n.software_package_detail.common_term_filePath_label;
        this.cFileColumns[2].title = this.i18n.software_package_detail.common_term_filePath_label;
        this.soFileColumns[3].title = this.i18n.software_package_detail.fileSource;

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

        let response: any;
        this.route.queryParams.subscribe(data => {
            this.intelliJFlagDef = (data.intelliJFlag) ? true : false;
            this.reportId = data.path;
            response = JSON.parse(data.response.replace(/#/g, ':'));
            this.currentReport = this.reportService.formatCreatedId(data.report);
            this.reportInfo = {
                name: data.name,
                path: data.report
            };
        });
        this.getReportDetail(response);
    }

    /**
     * 组件销毁
     */
    ngOnDestroy(): void {
        clearInterval(this.cloudIdeInterval);
    }
    /**
     * 获取详情页界面需要的数据
     * @param res 报告信息
     */
    private getReportDetail(res: any): void {
        const data = res.data;
        const successList = data.replaced;
        const failList = data.missing;
        this.currentReport = data.report_time;
        if (this.intelliJFlagDef) {
            this.reportTitle = data.package_path.substring(data.package_path.lastIndexOf('/') + 1);
        }
        if (data.result_path) {
            this.reportName = data.result_path.substring(data.result_path.lastIndexOf('/') + 1);
            this.pkgRebuildPath = data.result_path;
        }
        this.settingLeftInfo[0].value = data.package_path;
        this.settingLeftInfo[1].value = data.report_time;
        this.settingLeftInfo[2].value = data.result_path;
        if (data.status === 0) {  // 重构成功
            this.settingLeftInfo[3].value = this.i18n.software_package_detail.packageSuccess;
        } else {
            this.settingLeftInfo[3].value = this.currLang.includes('en') ? data.info : data.info_chinese;
        }
        this.settingLeftInfo[3].isSuccessed = data.status ? 'false' : 'true';
        this.middleSettingLeftInfo = JSON.parse(JSON.stringify(this.settingLeftInfo));

        this.settingRightInfo[0].value = successList.length;
        this.settingRightInfo[1].value = failList.length;
        this.settingRightInfo[2].value = this.settingRightInfo[0].value + this.settingRightInfo[1].value;

        this.soFileSrcData.data = successList.map((item: any, index: number) => Object.assign(item, {
            number: ++index,
            sourceFile: this.handleStatus(item.status)
        }));

        // 重构失败
        if (data.status && failList.length) {
            this.settingLeftInfo.splice(2, 1);
            this.scanItems = {
                soFile: {
                    label: this.i18n.software_package_detail.relayNum
                },
                cFile: {
                    label: this.i18n.software_package_detail.lackNum
                },
                type: ['soFile', 'cFile']
            };

            // 如果有下载地址
            let bool = true;
            failList.forEach((item: any) => {
                if (item.url) {
                    this.cFileColumns[3] = {
                        width: '40%',
                        title: this.i18n.common_term_operate_sugg_label
                    };
                    this.cFileColumns[4] = {
                        width: '15%',
                        title: this.i18n.common_term_log_down
                    };
                    bool = false;
                    return;
                }
            });
            // 没有下载地址的情况
            if (bool) {
                this.cFileColumns.splice(3, 2, {
                    width: '55%',
                    title: this.i18n.common_term_operate_sugg_label
                });
            }

            this.cFileSrcData.data = failList.map((item: any, index: number) => Object.assign(item, {
                number: ++index,
                url: item.url || '--',
                suggestion: this.handleStatus(item.status, item.url, item.name),
                isClick: false // 是否点击了 复制链接
            }));
        }
        this.showLoading = false;
    }

    /**
     * 下载缺少依赖文件
     * @param url 地址
     */
    public handleLink(url: string) {
        if (this.intelliJFlagDef) {
            this.vscodeService.postMessage({
                cmd: 'openHyperlinks',
                data: {
                    hyperlinks: url
                }
            }, null);
        } else {
            this.reportService.downloadLink(url);
        }
        if (this.intelliJFlagDef) {
            this.changeDetectorRef.markForCheck();
            this.changeDetectorRef.detectChanges();
        }
    }

    /**
     * 下载重构包
     */
    public handleDownloadPackage() {
        let option: any;
        if (this.currEnvAppName === ENV_APP_NAME.CLOUDIDE) {
            option = {
                cmd: 'cloudIDEDownloadRebuildPkg',
                data: {
                    path: this.pkgRebuildPath || ''
                }
            };
            this.vscodeService.postMessage(option, null);
        } else {
            option = {
                cmd: 'downloadRebuildPkg',
                data: this.intelliJFlagDef ? {
                    path: this.reportId,
                    name: this.reportName
                } : this.reportInfo
            };
            this.vscodeService.postMessage(option, null);
        }
    }
    /**
     * 下载HTML
     */
    public handleDownloadHTML() {
        if (this.intelliJFlagDef) {  // intellig
            this.vscodeService.get({
                url: `/portadv/autopack/history/${encodeURIComponent(this.reportId)}/`
            }, (resp: any) => {
                const content = resp.data.report_time;
                const htmlFile = this.downloadTemplate(content);
                this.vscodeService.postMessage({
                    cmd: 'downloadRebuildHTML',
                    data: {
                        htmlContent: htmlFile,
                        fileName: this.reportId + '.html'
                    }
                }, null);
            });
        } else {  // vscode
            const htmlData = this.getDownloadHTML();
            let option: any;
            if (this.currEnvAppName === ENV_APP_NAME.CLOUDIDE) {  // cloudIDE环境
                option = {
                    cmd: 'getSoftPkgRebuildHTMLContent',
                    data: {
                        reportInfo: this.reportInfo,
                        htmlData
                    }
                };
                this.vscodeService.postMessage(option, (htmlContent: string) => {
                    const fileName = `${this.reportInfo.name}_${this.reportInfo.path}`;
                    //  下载html报告
                    this.cloudIDEService.downloadReportHTML(htmlContent, fileName);
                });
            } else {  // vscode环境
                option = {
                    cmd: 'downloadRebuildHTML',
                    data: {
                        reportInfo: this.reportInfo,
                        htmlData
                    }
                };
                this.vscodeService.postMessage(option, null);
            }
        }
    }
    /**
     * 组装html报告静态页面信息
     * @param report 报告内容
     */
    downloadTemplate(report: any): string {
        return new SoftwarePackageUtil().downloadTemplate(report, this.instance);
    }

    /**
     * 获取下载的HTML内容
     */
    private getDownloadHTML() {
        const infoData = this.middleSettingLeftInfo;
        const settingLeftInfo = {
            firstItem: {
                label: infoData[0].label,
                value: infoData[0].value
            },
            fifthItem: {
                label: infoData[1].label,
                value: infoData[1].value
            },
            seventhItem: {
                label: infoData[2].label,
                value: (infoData[2] && infoData[2].value) ? infoData[2].value : ''
            },
            sixthItem: {
                label: infoData[3].label,
                value: infoData[3].value,
                isSuccessed: infoData[3].isSuccessed
            }
        };
        const settingRightInfo = {
            top: this.settingRightInfo
        };

        // 页面需要的元素
        const htmlData = {
            currentReport: this.reportInfo.name,
            settingLeftInfo,
            settingRightInfo,
            scanItems: this.scanItems,
            soFileSrcData: this.soFileSrcData.data,
            cFileSrcData: this.cFileSrcData.data
        };
        return htmlData;
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
            case 13:
              suggestion = this.i18n.software_package_detail.status.suggestion_13;
              break;
            case 14:
              suggestion = this.i18n.software_package_detail.status.suggestion_14;
              break;
            case 15:
              suggestion = this.i18n.software_package_detail.status.suggestion_15;
              break;
            case 16:
              suggestion = this.i18n.software_package_detail.status.suggestion_16;
              break;
            case 17:
              suggestion = this.i18n.software_package_detail.status.suggestion_17;
              break;
            case 18:
              suggestion = this.i18n.software_package_detail.status.suggestion_18;
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
}
