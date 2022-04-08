import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { TiTableColumns, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';

import {
  I18nService, CommonService, ReportService, MytipService
} from '../../../service';
import { SoftwarePackageReportApi } from '../../../api';
import { getExplore } from '../../../utils';

@Component({
  selector: 'app-software-package-report',
  templateUrl: './software-package-report.component.html',
  styleUrls: ['./software-package-report.component.scss']
})
export class SoftwarePackageReportComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private i18nService: I18nService,
    private commonService: CommonService,
    private reportService: ReportService,
    private mytipServe: MytipService,
    private softwarePackageReportApi: SoftwarePackageReportApi
  ) {
    this.i18n = this.i18nService.I18n();
  }

  public i18n: any;
  public currLang: string;

  public currentReport: string;
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
  public scanItems: {
    soFile: {
      label: string
    },
    cFile?: {
      label: string
    }
    type: Array<string>
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
       width: '20%'
     },
     {
       title: '',
       width: '45%'
     },
     {
      title: '',
      width: '20%'
    },
   ];


  ngOnInit(): void {
    this.currLang = sessionStorage.getItem('language');

    this.route.queryParams.subscribe(data => {
      this.currentReport = data.name;
      this.reportId = data.report;
    });

    this.settingLeftInfo = [
      { label: this.i18n.common_term_path_label },
      { label: this.i18n.software_package_detail.time },
      { label: this.i18n.software_package_detail.path },
      { label: this.i18n.software_package_detail.result }
    ];

    this.settingRightInfo = [
      { title: this.i18n.software_package_detail.relayNum },
      { title: this.i18n.software_package_detail.lackNum },
      { title: this.i18n.common_term_name_total },
    ];

    this.scanItems = {
      soFile: {
        label: this.i18n.software_package_detail.relayNum
      },
      type: ['soFile']
    };

    this.soFileColumns[0].title = this.cFileColumns[0].title = this.i18n.common_term_no_label;
    this.soFileColumns[1].title = this.cFileColumns[1].title = this.i18n.common_term_name_label_1;
    this.soFileColumns[2].title = this.cFileColumns[2].title = this.i18n.common_term_filePath_label;
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

    this.getReportDetail();
  }

  // 获取历史报告详情数据
  public getReportDetail(): void {
    this.softwarePackageReportApi.getReport(this.reportId).then((res: any) => {
      if (this.commonService.handleStatus(res) === 0) {
        const data = res.data;
        const successList = data.replaced;
        const failList = data.missing;

        this.settingLeftInfo[0].value = data.package_path;
        this.settingLeftInfo[1].value = data.report_time;
        this.settingLeftInfo[2].value = data.result_path;
        this.settingLeftInfo[3].value = data.status
          ? this.currLang === 'en-us' ? data.info : data.info_chinese
          : this.i18n.software_package_detail.packageSuccess;
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
                width: '45%',
                title: this.i18n.common_term_operate_sugg_label
              };
              this.cFileColumns[4] = {
                width: '20%',
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

          this.cFileSrcData.data = failList.map((item: any, index: number) => {
            let isHTTP = false;
            if (item.url) {
              // 判断是否为 chrome版本
              isHTTP = getExplore() && (item.url.split('://')[0].toLowerCase() === 'http');
            }
            return Object.assign(item, {
              number: ++index,
              url: item.url || '--',
              suggestion: this.handleStatus(item.status, item.url, item.name),
              isHTTP,
              isClick: false // 是否点击了 复制链接
            });
          });
        }
      } else {
        const content = this.currLang === 'zh-cn' ? res.infochinese : res.info;
        this.mytipServe.alertInfo({ type: 'error', content, time: 5000 });
      }
    });
  }

  // 下载重构包
  public handleDownloadPackage() {
    this.reportService.downloadPackage(this.currentReport, this.reportId);
  }

  // 下载缺少依赖文件
  handleLink(url: string) {
    this.commonService.downloadLink(url);
  }

  // 下载历史报告
  public handleDownloadHTML() {
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
        value: infoData[2]?.value || ''
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
    const content = this.reportService.downloadTemplete(
      'softwarePackage',
      this.currentReport,
      settingLeftInfo,
      settingRightInfo,
      this.scanItems,
      this.soFileSrcData.data,
      '',
      this.cFileSrcData.data
    );
    this.reportService.downloadReportHTML(content, this.reportId + '.html');
  }

  /**
   * 对返回的状态码进行处理
   * @param status 状态码
   * @param url 是否有链接
   * @param fileName 文件名
   */
  handleStatus(status: number, url?: string, fileName?: string): string | void {
    switch (status) {
      case 0:
        return this.i18n.software_package_detail.status.tooDownload;
      case 1:
        return this.i18n.software_package_detail.status.userUpload;
      case 13:
        return this.i18n.software_package_detail.status.suggestion_13;
      case 14:
        return this.i18n.software_package_detail.status.suggestion_14;
      case 15:
        return this.i18n.software_package_detail.status.suggestion_15;
      case 16:
        return this.i18n.software_package_detail.status.suggestion_16;
      case 17:
        return this.i18n.software_package_detail.status.suggestion_17;
      case 18:
        return this.i18n.software_package_detail.status.suggestion_18;
      default:
        const lastIndex = fileName.lastIndexOf('.');
        const lastName = fileName.slice(lastIndex);
        return url ?
          ( lastName === '.jar'
            ? this.i18n.software_package_detail.status.suggestion_1
            : this.i18n.software_package_detail.status.suggestion
          )
          : this.i18n.common_term_report_level5_result;
    }
  }
}
