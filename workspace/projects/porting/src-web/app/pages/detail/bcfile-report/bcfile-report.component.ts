import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { TiTableRowData, TiTableSrcData, TiTableColumns } from '@cloud/tiny3';

import {
  MytipService, I18nService, AxiosService,
  CommonService, ReportService
} from '../../../service';
import { BcfileReportService } from './bcfile-report.service';

@Component({
  selector: 'app-bcfile-report',
  templateUrl: './bcfile-report.component.html',
  styleUrls: ['./bcfile-report.component.scss']
})
export class BCFileReportComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private i18nService: I18nService,
    private axiosService: AxiosService,
    private commonService: CommonService,
    private reportService: ReportService,
    private mytipService: MytipService,
    private bcfileReportService: BcfileReportService
  ) {
    this.i18n = this.i18nService.I18n();
  }

  public i18n: any;
  public currLang: string;
  public imgBase2: any; // 展开详情图标

  public currentReport: string;
  public reportId: string;

  // 左侧配置信息
  public settingLeftInfo: Array<{
    label: string,
    value?: string
  }>;

  // table 信息
  public scanItems: {
    soFile: {
      label: string
    },
    type: Array<string>
  };

  // 已更新依赖文件表格
  public soFiledisplayed: Array<TiTableRowData> = [];
  public soFileSrcData: TiTableSrcData;
  public soFileColumns: Array<TiTableColumns> = [
    {
      title: '',
      width: '2%'
    },
    {
      title: '',
      width: '8%'
    },
    {
      title: '',
      width: '30%'
    },
    {
      title: '',
      sortKey: 'path', // 设置排序时按照源数据中的哪一个属性进行排序
      width: '40%'
    },
    {
      title: '',
      sortKey: 'suggTotal',
      width: '20%'
    },
  ];

  public fixSum: number; // 可修改总数

  ngOnInit(): void {
    this.currLang = sessionStorage.getItem('language');

    this.route.queryParams.subscribe(data => {
      this.reportId = data.report;
      this.currentReport = this.commonService.formatCreatedId(data.report);
    });

    this.scanItems = {
      soFile: {
        label: this.i18n.check_weak.BCSuggestion.title
      },
      type: ['soFile']
    };

    this.soFileColumns[1].title = this.i18n.common_term_no_label;
    this.soFileColumns[2].title = this.i18n.common_term_name_label;
    this.soFileColumns[3].title = this.i18n.common_term_filePath_label;
    this.soFileColumns[4].title = this.i18n.common_term_cFile_suggestion_label;

    this.soFileSrcData = {
      data: [],
      state: {
        searched: false, // 源数据未进行搜索处理
        sorted: false, // 源数据未进行排序处理
        paginated: false // 源数据未进行分页处理
      }
    };

    this.searchReport();
  }

  // 查询历史报告
  searchReport() {
    this.axiosService.axios.get(`/task/progress/?task_type=11&task_id=${encodeURIComponent(this.reportId)}`)
      .then((res: any) => {
        if (this.commonService.handleStatus(res) === 0) {
          const data = this.bcfileReportService.handleReportDate(res.data);
          this.settingLeftInfo = data.settingLeftInfo;
          this.fixSum = data.fixSum;
          this.soFileSrcData.data = data.soFileSrcData;
        } else {
          const content = this.currLang === 'zh-cn' ? res.infochinese : res.info;
          this.mytipService.alertInfo({ type: 'error', content, time: 10000 });
        }
      });
  }

  // 下载历史报告
  public handleDownloadHTML() {
    const iii = location.href.indexOf('#');
    const api = location.href.slice(0, iii);
    const image2 = `${api + './assets/img/header/arrow_bottom.svg'}`;
    const getBase64 = this.commonService.getBase64;
    getBase64(image2).then(res => {
      this.imgBase2 = res;
      this.download2Html();
    });
  }

  download2Html() {
    const settingLeftInfo = {
      firstItem: {
        label: this.settingLeftInfo[0].label,
        value: this.settingLeftInfo[0].value,
        fixSum: this.fixSum
      }
    };
    const content = this.reportService.downloadTemplete(
      'BCFile',
      this.currentReport,
      settingLeftInfo,
      '',
      this.scanItems,
      this.soFileSrcData.data,
      this.imgBase2
    );
    this.reportService.downloadReportHTML(content, this.reportId + '.html');
  }

}
