import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TiTableColumns, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';
import {
  CommonService, AxiosService, I18nService,
  MytipService, ReportService
} from '../../../service';
import { SoftwareMigrationService } from './software-migration.service';
import { SoftwareMigrationReportApi } from '../../../api';

@Component({
  selector: 'app-software-migration-report-detail',
  templateUrl: './software-migration-report-detail.component.html',
  styleUrls: ['./software-migration-report-detail.component.scss']
})
export class SoftwareMigrationReportDetailComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private i18nService: I18nService,
    private Axios: AxiosService,
    public mytip: MytipService,
    private reportService: ReportService,
    private commonService: CommonService,
    private softwareMigrationService: SoftwareMigrationService,
    private softwareMigrationReportApi: SoftwareMigrationReportApi
  ) {
    this.i18n = this.i18nService.I18n();
  }
  public imgBase2: any;
  public i18n: any;
  public currentReport: string;
  public tipStr: string;
  public report: any = {
    id: ''
  };
  public textForm1: any = {
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
    },
    seventhItem: {
      label: '',
      value: []
    }
  };
  public soFilesNeed: number;
  public soFilesTotal: number;
  public soFilesUse: number; // 可兼容替换数
  public portingLevelList: Array<any> = [];

  public scanItems: any = {
    soFile: {
      label: ''
    },
    type: ['soFile']
  };

  public binDetailDisplay: Array<TiTableRowData> = [];
  public binDetailSrcData: TiTableSrcData;
  public searchWords: Array<any> = [''];
  public searchKeys: Array<string> = ['oper']; // 设置过滤字段
  public binDetailColumns: Array<TiTableColumns> = [
    {
      title: '',
      width: '2%'
    },
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
      width: '10%'
    },
    {
      title: '',
      width: '20%'
    },
    {
      title: '',
      width: '20%'
    },
    {
      title: '',
      width: '15%',
      key: 'oper', // 该列的 headfilter 要过滤的字段
      selected: null, // 该列的 headfilter 下拉选中项
      panelWidth: '160px', // 该列的 headfilter 的下拉框宽度
      options: []
    },
    {
      title: '',
      width: '23%'
    }
  ];

  public curLang = '';
  public copySuccess: string;
  public isPathExt: boolean;
  public packageNameStr = '';

  ngOnInit() {
    this.curLang = sessionStorage.getItem('language');
    this.copySuccess = this.i18n.common_term_report_detail.copySuccess;
    this.route.queryParams.subscribe(data => {
      this.report.id = data.report;
      this.currentReport = this.commonService.formatCreatedId(data.report);
    });
    this.tipStr = this.i18n.common_term_return;

    this.binDetailSrcData = {
      data: [],
      state: {
        searched: false,
        sorted: false,
        paginated: false
      }
    };

    this.scanItems.soFile.label = this.i18n.common_term_result_soFile;

    this.getBinDetaiColumns(this.binDetailColumns.length - 1);
    this.getReportDetail();
  }

  // 获取历史报告详情数据
  getReportDetail() {
    this.softwareMigrationReportApi.getReport(encodeURIComponent(this.report.id)).then((resp: any) => {
      if (this.commonService.handleStatus(resp) === 0) {
        const reportData = this.softwareMigrationService.handleReportDate(resp.data.result);
        this.textForm1 = reportData.textForm1;
        for (const item of this.textForm1.firstItem.value) {
            this.packageNameStr += item + ', ';
        }
        this.packageNameStr = this.packageNameStr.substring(0, this.packageNameStr.lastIndexOf(','));
        this.soFilesTotal = reportData.soFilesTotal;
        this.soFilesNeed = reportData.soFilesNeed;
        this.soFilesUse = reportData.soFilesUse;
        this.portingLevelList = reportData.list;
        this.isPathExt = false;
        for (const item of this.portingLevelList) {
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

        // 版本问题规避部分字段
        this.binDetailSrcData.data = this.portingLevelList;
      } else {
        const content = this.curLang === 'zh-cn' ? resp.infochinese : resp.info;
        this.mytip.alertInfo({ type: 'error', content, time: 5000 });
      }
    });
  }

  /**
   * 获取表格列字段
   * @columns 列数
   */
  private getBinDetaiColumns(columns: number) {
    this.binDetailColumns[columns - 1].options = [
      { // 该列的 headfilter 下拉选择项
        label: this.i18n.common_term_report_all
      }, {
        label: this.i18n.common_term_report_level0_desc
      }, {
        label: this.i18n.common_term_report_level5_desc
      }
    ];
    // 设置初始化第一列 headfilter 的选中项
    this.binDetailColumns[columns - 1].selected = this.binDetailColumns[columns - 1].options[0];

    // 国际化词条初始化
    this.binDetailColumns[columns - 6].title = this.i18n.common_term_no_label;
    this.binDetailColumns[columns - 5].title = this.i18n.common_term_name_label_1;
    this.binDetailColumns[columns - 4].title = this.i18n.common_term_type_label;
    this.binDetailColumns[columns - 3].title = this.i18n.commonTermSoftFilePath;
    this.binDetailColumns[columns - 2].title = this.i18n.common_term_operate_analysis_name;
    this.binDetailColumns[columns - 1].title = this.i18n.common_term_operate_analysis_result;
    this.binDetailColumns[columns].title = this.i18n.common_term_operate_sugg_label;
  }

  // 展开详情
  public beforeToggle(row: TiTableRowData): void {
    row.showDetails = !row.showDetails;
    if (row.soFileHasUrl) {  // jar行下面的.so文件径有下载链接，子路径单独合并
        this.softwareMigrationService.mergeSoInfoList(row.soInfoList, ['urlName', 'oper', 'result']);
    } else {  //  jar层级进行合并
        const data = this.binDetailSrcData.data;
        const subPathCount = row.showDetails ? row.path_ext.length : -row.path_ext.length;
        let num = row.number - 1;
        // 是否为第一个合并项
        if (row.showTd) {
          row.rowSpan += subPathCount;
        } else {
          // 是否和上一个 tr 为合并项
          if (
            data[num].url === data[num - 1].url && data[num].oper === data[num - 1].oper
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

  // 使 headfilter 和表格搜索联动。根据 headfilter 选中项给表格的搜索接口传入对应的搜索值，进行表格数据搜索。
  public onBinDetailSelect(item: any, column: TiTableColumns): void {
    const index: number = this.searchKeys.indexOf(column.key);
    const labelKey: string = column.labelKey || 'label';
    this.searchWords[index] = item[labelKey] === this.i18n.common_term_report_all ? '' : item[labelKey];
  }

  /**
   * 下载软件包
   * @param url 下载地址
   */
  downloadSoFile(row: any): void {
    if (row.isHTTP) {
      return;
    }
    row.uploadVisited = true;
    this.commonService.downloadLink(row.url);
  }

  // 下载 csv 报告
  downloadReportAsCvs() {
    this.reportService.downloadCSV(this.report.id);
  }

  // 下载 html 报告
  downloadReportAsHtml() {
    this.softwareMigrationReportApi.downloadHTML(this.report.id).then((resp: any) => {
      if (this.commonService.handleStatus(resp) === 0) {
        const iii = location.href.indexOf('#');
        const api = location.href.slice(0, iii);
        const image2 = `${api + './assets/img/header/arrow_bottom.svg'}`;
        const getBase64 = this.commonService.getBase64;
        getBase64(image2).then(res => {
          this.imgBase2 = res;
          this.download2Html();
        });
      }
    });
  }

  download2Html() {
    const settingRightInfo = {
      top: [
        {
          title: this.i18n.common_term_report_level0_desc,
          value: this.soFilesUse
        },
        {
          title: this.i18n.common_term_report_level2_desc,
          value: this.soFilesNeed
        },
        {
            title: this.i18n.common_term_name_total,
            value: this.soFilesTotal
        }
      ]
    };
    // 先把要合并的数据处理好再下载
    this.binDetailSrcData.data.forEach(item => {
        if (item.soFileHasUrl) {
            this.softwareMigrationService.mergeSoInfoList(item.soInfoList, ['urlName', 'oper', 'result']);
        }
    });
    const content = this.reportService.downloadTemplete(
      'softwareEvaluation',
      this.currentReport,
      this.textForm1,
      settingRightInfo,
      this.scanItems,
      this.binDetailSrcData.data,
      this.imgBase2
    );
    this.reportService.downloadReportHTML(content, this.report.id + '.html');
  }

  // 返回软件迁移评估页面
  goHome(): void {
    history.go(-1);
  }
}
