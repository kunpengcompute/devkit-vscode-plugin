import { Component, OnInit } from '@angular/core';
import {
  CommonService, I18nService, AxiosService
} from '../../../../service';
import { AUTO_GCC } from '../../../../global/url';

import { TiTableRowData, TiTableSrcData, TiTableColumns } from '@cloud/tiny3';
const autoFix: any = require('../../../../../assets/hard-coding/url.json');

@Component({
  selector: 'app-auto-fix',
  templateUrl: './auto-fix.component.html',
  styleUrls: ['./auto-fix.component.scss']
})
export class AutoFixComponent implements OnInit {
  public i18n: any;
  public currLang: any;
  public autoFixUrl: any;

  // 操作系统
  public versionStep = [
    { label: '', active: false }
  ];
  public versionDisplayed: Array<TiTableRowData> = []; // 表示表格实际呈现的数据（开发者默认设置为[]即可）
  public versionSrcData: TiTableSrcData;
  public versionColumns: Array<TiTableColumns> = [
    { title: '', width: '20%' },
    { title: '', width: '80%' }
  ];

  public operatingStep = [
    {
      label: '',
      active: false
    },
    {
      label: '',
      active: false
    }
  ]; // 操作步骤

  // 工具使用
  public useList: Array<object>;

  constructor(
    public i18nService: I18nService,
    public Axios: AxiosService,
    private commonService: CommonService
  ) {
    this.i18n = this.i18nService.I18n();
  }

  public fixHTML: string;

  ngOnInit() {
    this.currLang = sessionStorage.getItem('language');

    // 初始化 GCC 版本
    this.versionStep = [
      { label: this.i18n.check_weak.auto_fix.version_title, active: false }
    ];
    this.initVersion();
    this.initUse();

    this.operatingStep = [
      {
        label: this.i18n.check_weak.auto_fix.step1.title,
        active: false
      },
      {
        label: this.i18n.check_weak.auto_fix.step2.title,
        active: false
      }
    ];

    this.autoFixUrl = autoFix;
    let html = '';
    if (this.currLang === 'zh-cn') {
      html = `
        <span>从Porting安装路径下，找到</span>
        <span style="color: #0067FF">tools/weakconsistency/gccchecker/gcctool.tar.gz</span>
      `;
    } else {
      html = `
        <a style="color: #0067FF; cursor: inherit">tools/weakconsistency/gccchecker/gcctool.tar.gz</a>
        <span> in the Porting Advisor installation directory</span>
      `;
    }
    this.fixHTML = `${ this.i18n.check_weak.auto_fix.step1.title_1_content_1 }` + html;
  }

  // 初始化 gcc 版本
  initVersion(): void {
    this.versionColumns[0].title = this.i18n.check_weak.auto_fix.system;
    this.versionColumns[1].title = this.i18n.check_weak.auto_fix.gccVersion;
    this.versionSrcData = {
      data: AUTO_GCC,
      state: {
        searched: false, // 源数据未进行搜索处理
        sorted: false, // 源数据未进行排序处理
        paginated: false // 源数据未进行分页处理
      }
  };
  }

  // 初始化工具使用
  initUse() {
    this.useList = [
      {
        title: this.i18n.check_weak.auto_fix.step1.title,
        contentList: [
          { content: this.i18n.check_weak.auto_fix.use.title_1_content_1 },
          { content: 'export HW_DEBUG=[ 0 | 1 | 2 ]' },
          { content: this.i18n.check_weak.auto_fix.use.title_1_content_2 },
          { content: this.i18n.check_weak.auto_fix.use.title_1_content_3 },
          { content: this.i18n.check_weak.auto_fix.use.title_1_content_4 }
        ]
      },
      {
        title: this.i18n.check_weak.auto_fix.use.title_2,
        active: false,
        contentList: [
          {
            title: this.i18n.check_weak.auto_fix.use.title_2_subTitle
              + this.i18n.check_weak.auto_fix.use.title_2_content_1,
            detailList: this.i18n.check_weak.auto_fix.use.detailList1
          },
          {
            title: this.i18n.check_weak.auto_fix.use.title_2_content_2,
            detailList: [this.i18n.check_weak.auto_fix.use.detail2, '`export AUTOFIXLIST=/path/to/allowlist`']
          },
          {
            title: this.i18n.check_weak.auto_fix.use.title_2_content_3,
            detailList: [
              'files:', '/path/to/file/a', '/path/to/./file/b', '/path/to/../file/c',
              '/path/to/file/d', 'functions:', 'func_a', 'func_b()', 'func_c(int xxx)',
              'int func_d()', 'classA::func_e', 'ns::classB::func_f()',
              'std::string nsA::nsB::classC::func_g(int xxx)'
            ]
          }
        ]
      },
      {
        title: this.i18n.check_weak.auto_fix.use.title_3,
        contentList: [
          { content: this.i18n.check_weak.auto_fix.use.title_3_content_1 }
        ]
      }
    ];
  }

  // 展开对应的操作步骤
  showOperating(step: any): void {
    step.active = !step.active;
    if (!step.active) {
      $('.router-content')[0].scrollTop = 0;
    }
  }

  // 前往联机帮助
  help() {
    this.commonService.goHelp('weak');
  }
}
