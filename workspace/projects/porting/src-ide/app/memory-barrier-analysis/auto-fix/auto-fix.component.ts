import { Component, Input, OnInit } from '@angular/core';
import { VscodeService } from '../../service/vscode.service';
import { I18nService } from '../../service/i18n.service';
import { AUTO_GCC } from '../../global/url';
import { TiTableRowData, TiTableSrcData, TiTableColumns } from '@cloud/tiny3';

@Component({
    selector: 'app-auto-fix',
    templateUrl: './auto-fix.component.html',
    styleUrls: ['./auto-fix.component.scss']
})
export class AutoFixComponent implements OnInit {
    @Input() intellijFlag: boolean;

    public i18n: any;

    public operatingStep: Array<object>; // 操作步骤
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
    // 工具使用
    public useList: any;
    public pluginUrlCfg: any = {
        debianLibstdc: '',
        gcc: '',
        gccchecker: '',
        gunIndex: ''
    };
    constructor(
        public i18nService: I18nService,
        public vscodeService: VscodeService
    ) {
        this.i18n = this.i18nService.I18n();
    }

    ngOnInit() {
        // 获取全局url配置数据
        this.vscodeService.postMessage({ cmd: 'readUrlConfig' }, (resp: any) => {
            this.pluginUrlCfg = resp;
        });
        // 初始化 GCC 版本
        this.versionStep = [
          { label: this.i18n.plugins_porting_weakCheck.auto_fix.version_title, active: false }
        ];
        this.initVersion();
        this.initUse();
        this.operatingStep = [
            {
                label: this.i18n.plugins_porting_weakCheck.auto_fix.step1.title,
                active: false
            },
            {
                label: this.i18n.plugins_porting_weakCheck.auto_fix.step2.title,
                active: false
            }
        ];
    }

    // 展开对应的操作步骤
    showOperating(step: any): void {
        step.active = !step.active;
    }

    openUrl(url: string) {
        if (this.intellijFlag) {
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

    // 初始化工具使用
  initUse() {
    this.useList = {
        title: this.i18n.plugins_porting_weakCheck.auto_fix.use.title_2,
        active: false,
        contentList: [
          {
            title: this.i18n.plugins_porting_weakCheck.auto_fix.use.title_2_subTitle +
             this.i18n.plugins_porting_weakCheck.auto_fix.use.title_2_content_1,
            detailList: this.i18n.plugins_porting_weakCheck.auto_fix.use.detailList1
          },
          {
            title: this.i18n.plugins_porting_weakCheck.auto_fix.use.title_2_content_2,
            detailList: [
              this.i18n.plugins_porting_weakCheck.auto_fix.use.detail2,
              '`export AUTOFIXLIST=/path/to/allowlist`'
            ]
          },
          {
            title: this.i18n.plugins_porting_weakCheck.auto_fix.use.title_2_content_3,
            detailList: ['files:', '/path/to/file/a', '/path/to/./file/b', '/path/to/../file/c',
            '/path/to/file/d', 'functions:', 'func_a', 'func_b()', 'func_c(int xxx)', 'int func_d()',
             'classA::func_e', 'ns::classB::func_f()', 'std::string nsA::nsB::classC::func_g(int xxx)']
          }
        ]
      };
}

  // 初始化 gcc 版本
  initVersion(): void {
        this.versionColumns[0].title = this.i18n.plugins_porting_weakCheck.auto_fix.system;
        this.versionColumns[1].title = this.i18n.plugins_porting_weakCheck.auto_fix.gccVersion;
        this.versionSrcData = {
          data: AUTO_GCC,
          state: {
            searched: false, // 源数据未进行搜索处理
            sorted: false, // 源数据未进行排序处理
            paginated: false // 源数据未进行分页处理
        }
    };
  }
}
