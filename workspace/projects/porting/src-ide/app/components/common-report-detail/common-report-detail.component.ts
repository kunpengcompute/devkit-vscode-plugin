import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';

import { I18nService } from '../../service/i18n.service';
import { ReportService } from '../../service/report/report.service';
import { SoftwarePackageRight } from './interface';
@Component({
    selector: 'app-common-report-detail',
    templateUrl: './common-report-detail.component.html',
    styleUrls: ['./common-report-detail.component.scss']
})
export class CommonReportDetailComponent implements OnInit {
    @Input() currentReport: string;
    @Input() type: string;
    @Input() settingLeftInfo: Array<{
        label: string;
        value: string;
        isSuccessed?: string;
    }>;
    @Input() settingRightInfo: Array<SoftwarePackageRight>;
    @Input() scanItems: any;

    @Input() soFiledisplayed: any;
    @Input() soFileSrcData: any;
    @Input() soFileColumns: any;

    @Input() cFiledisplayed: any;
    @Input() cFileSrcData: any;
    @Input() cFileColumns: any;

    // 软件包重构相关
    @Output() handleDownloadPackage = new EventEmitter();
    @Output() handleDownloadHTML = new EventEmitter();
    @Output() handleLink = new EventEmitter();

    @Input() intelliJFlagDef: any;
    public nodataImage = {};
    constructor(
        public i18nService: I18nService,
        private reportService: ReportService,
        private changeDetectorRef: ChangeDetectorRef,
    ) {
        this.i18n = this.i18nService.I18n();
    }

    public i18n: any;
    public configTitle: string;
    public copySuccess: string;

    ngOnInit(): void {
        this.copySuccess = this.i18n.common_term_report_detail.copySuccess;
        this.configTitle = this.i18n.software_package_detail.common_term_config_title;
        if (this.intelliJFlagDef) {
            this.nodataImage = {
                dark: './assets/img/default-page/dark-nodata-intellij.png',
                light: './assets/img/default-page/light-nodata-intellij.png',
            };
            this.changeDetectorRef.markForCheck();
            this.changeDetectorRef.detectChanges();
        } else {
            this.nodataImage = {
                dark: './assets/img/default-page/dark_nodata.png',
                light: './assets/img/default-page/light-nodata.png',
            };
        }
    }

    /**
     * 下载依赖文件  ->  重构包
     * @param url 下载链接地址
     */
    public handleSoftwareLink(url: string) {
        this.handleLink.emit(url);
    }

    /**
     * 下载重构包
     */
    public downloadPackage() {
        this.handleDownloadPackage.emit();
    }

    /**
     * 下载重构包
     */
    public downloadHTML() {
        this.handleDownloadHTML.emit();
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
