import { Utils } from '../../service/utils.service';
import { Component, Input, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { VscodeService } from '../../service/vscode.service';
import { I18nService } from '../../service/i18n.service';

@Component({
    selector: 'app-report-config-info',
    templateUrl: './report-config-info.component.html',
    styleUrls: ['./report-config-info.component.scss'],
})
export class ReportConfigInfoComponent implements OnInit {

    @Input() reportId: string;
    @Input() reportType: string;

    public i18n: any;
    public configInfoList: Array<any> = [];
    constructor(
        private vscodeService: VscodeService,
        private i18nService: I18nService,
        public changeDetectorRef: ChangeDetectorRef,
        public zone: NgZone,
        private utils: Utils
    ) {
        this.i18n = this.i18nService.I18n();
    }

    /**
     * 初始化
     */
    ngOnInit() {
        if (this.reportType === 'threaddump') {
            this.getThreadDumpReportInfor();
        } else if (this.reportType === 'heapdump') {
            this.getHeapDumpReportInfor();
        } else if (this.reportType === 'gclog') {
            this.getGclogReportInfor();
        }
    }
    public getThreadDumpReportInfor() {
        const option = {
            url: `/threadDump/${this.reportId}`
        };
        this.vscodeService.get(option, (resp: any) => {
            if (resp.code === 0 && resp.data) {
                let isImport = false;
                if (resp.data.reportSource === 'IMPORT') {
                    isImport = true;
                }
                this.configInfoList = [
                    {
                        title: this.i18n.plugins_common_report.name,
                        detailText: resp.data.reportName || '--'
                    },
                    {
                        title: isImport ? this.i18n.plugins_common_report.import_time :
                            this.i18n.plugins_common_report.creat_time,
                        detailText: this.utils.dateFormat(resp.data.createTime, 'yyyy-MM-dd hh:mm:ss')
                    },
                    {
                        title: this.i18n.plugins_common_report.categorization,
                        detailText: isImport ? this.i18n.plugins_common_report.import :
                            this.i18n.plugins_common_report.self_collection,
                        isSplit: true
                    },
                    {
                        title: this.i18n.plugins_common_report.process_name,
                        detailText: resp.data.lvmName || '--'
                    },
                    {
                        title: this.i18n.plugins_common_report.process_id,
                        detailText: resp.data.lvmId || '--'
                    },
                    {
                        title: this.i18n.plugins_common_report.process_param,
                        detailText: resp.data.params || '--'
                    },
                    {
                        title: this.i18n.plugins_common_report.remark,
                        detailText: resp.data.comment || '--'
                    }
                ];
            }
            this.updateWebViewPage();
        });
    }

    public getHeapDumpReportInfor() {
        const option = {
            url: `/heap/actions/record/${this.reportId}`
        };
        this.vscodeService.get(option, (resp: any) => {
            if (resp.code === 0 && resp.data) {
                let isImport = false;
                if (resp.data.source === 'IMPORT') {
                    isImport = true;
                }
                this.configInfoList = [
                    {
                        title: this.i18n.plugins_common_report.name,
                        detailText: resp.data.alias || '--'
                    },
                    {
                        title: isImport ? this.i18n.plugins_common_report.import_time :
                            this.i18n.plugins_common_report.creat_time,
                        detailText: isImport ? this.utils.dateFormat(resp.data.importTime, 'yyyy-MM-dd hh:mm:ss') :
                            this.utils.dateFormat(resp.data.createTime, 'yyyy-MM-dd hh:mm:ss')
                    },
                    {
                        title: this.i18n.plugins_common_report.categorization,
                        detailText: isImport ? this.i18n.plugins_common_report.import :
                            this.i18n.plugins_common_report.self_collection,
                        isSplit: true
                    },
                    {
                        title: this.i18n.plugins_common_report.process_name,
                        detailText: resp.data.pidName || '--'
                    },
                    {
                        title: this.i18n.plugins_common_report.process_id,
                        detailText: resp.data.lvmId || '--'
                    },
                    {
                        title: this.i18n.plugins_common_report.process_param,
                        detailText: resp.data.param || '--'
                    },
                    {
                        title: this.i18n.plugins_common_report.remark,
                        detailText: resp.data.comments || '--'
                    }
                ];
            }
            this.updateWebViewPage();
        });
    }

    public getGclogReportInfor() {
        const option = {
            url: `/gcLog/${this.reportId}`
        };
        this.vscodeService.get(option, (resp: any) => {
            if (resp.code === 0 && resp.data) {
                let isImport = false;
                if (resp.data.reportSource === 'IMPORT') {
                    isImport = true;
                }
                this.configInfoList = [
                    {
                        title: this.i18n.plugins_common_report.name,
                        detailText: resp.data.logName || '--'
                    },
                    {
                        title: isImport ? this.i18n.plugins_common_report.import_time :
                            this.i18n.plugins_common_report.creat_time,
                        detailText: this.utils.dateFormat(resp.data.createTime, 'yyyy-MM-dd hh:mm:ss')
                    },
                    {
                        title: this.i18n.plugins_common_report.categorization,
                        detailText: isImport ? this.i18n.plugins_common_report.import :
                            this.i18n.plugins_common_report.self_collection,
                        isSplit: true
                    },
                    {
                        title: this.i18n.plugins_common_report.process_name,
                        detailText: resp.data.lvmName || '--'
                    },
                    {
                        title: this.i18n.plugins_common_report.process_id,
                        detailText: resp.data.lvmId || '--'
                    },
                    {
                        title: this.i18n.plugins_common_report.process_param,
                        detailText: resp.data.params || '--'
                    },
                    {
                        title: this.i18n.plugins_common_report.remark,
                        detailText: resp.data.comment || '--'
                    }
                ];
            }
            this.updateWebViewPage();
        });
    }
    /**
     * IntellIj刷新webview页面
     */
    public updateWebViewPage() {
        if ((self as any).webviewSession.getItem('tuningOperation') === 'hypertuner') {
            this.zone.run(() => {
                this.changeDetectorRef.checkNoChanges();
                this.changeDetectorRef.detectChanges();
            });
        }
    }
}
