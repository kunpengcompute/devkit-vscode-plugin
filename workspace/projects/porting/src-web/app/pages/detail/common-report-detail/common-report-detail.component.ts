import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

import { I18nService } from '../../../service/i18n.service';
import { ReportService } from '../../../service/report/report.service';
import { SoftwarePackageRight, ScanItems } from './interface';
import { TiTableRowData } from '@cloud/tiny3';

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
  @Input()
    get scanItems() {
      return this.scanItemsCopy;
    }
    set scanItems(val: ScanItems) {
      this.scanItemsCopy = val;
    }

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

  constructor(
    private router: Router,
    private i18nService: I18nService,
    private reportService: ReportService
  ) {
    this.i18n = this.i18nService.I18n();
  }

  public i18n: any;
  public currLang: string; // 当前语言

  public tipStr: string;
  public configTitle: string;

  public copySuccess: string;
  public scanItemsCopy: any; // 解决类型 any 不能用于索引类型所定义的对象

  ngOnInit(): void {
    this.currLang = sessionStorage.getItem('language');
    this.copySuccess = this.i18n.common_term_report_detail.copySuccess;

    this.handleTipStr();
  }

  // 下载重构包
  downloadPackage() {
    this.handleDownloadPackage.emit();
  }
  // 下载依赖文件  ->  重构包
  handleSoftwareLink(row: any) {
    if (row.isHTTP) {
      return;
    }
    row.uploadVisited = true;
    this.handleLink.emit(row.url);
  }

  // 下载 HTML
  downloadHTML() {
    this.handleDownloadHTML.emit();
  }

  // 展开详情
  public beforeToggle(row: TiTableRowData): void {
    row.showDetails = !row.showDetails;
  }

  /**
   * 复制下载链接
   * @param url 链接地址
   * @param select 要复制的 input 类名
   * @param copy 点击 tip 名
   * @param row 每行详情
   */
  onCopy(url: string, sel: string, copy: any, row: any) {
    row.copyVisited = true;
    if (!row.isClick) {
      copy.show();
      row.isClick = true;
      setTimeout(() => {
        copy.hide();
        row.isClick = false;
      }, 3000);
    }
    this.reportService.onCopyLink(url, sel);
  }

  // 处理返回提示
  public handleTipStr() {
    switch (this.type) {
      // 软件包重构
      case 'softwarePackage':
        this.configTitle = this.i18n.common_term_config_title;
        break;
      // BC文件
      case 'BCFile':
        this.configTitle = this.i18n.common_term_setting_infor;
        break;
    }
    this.tipStr = this.i18n.common_term_return;
  }

  // 返回上一级
  public handleReturn() {
    history.go(-1);
  }

}
