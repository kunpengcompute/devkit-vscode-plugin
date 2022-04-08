import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import { TiTableColumns, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';
import { analyzeAndValidateNgModules } from '@angular/compiler';
import { ConfigTableService } from '../service/config-table.service';
import { DomSanitizer } from '@angular/platform-browser';
import { currentTheme, VscodeService } from '../../../service/vscode.service';
import { Utils } from '../../../service/utils.service';
import { connect } from 'echarts';
import { COLOR_THEME, HTTP_STATUS } from '../../../service/vscode.service';
import { HyTheme, HyThemeService } from 'hyper';

@Component({
  selector: 'app-typical-data',
  templateUrl: './typical-data.component.html',
  styleUrls: ['./typical-data.component.scss']
})
export class TypicalDataComponent implements OnInit {
  @Input() nodeid: any;
  @Input() taskid: any;
  @Input() projectName: string;
  @Input() taskName: string;
  @ViewChild('viewDetailMask') viewDetailMask: any;
  @Input() sceneSolution: any;
  @Input() currTheme: any;
  public headData: any = [];
  public hardData: any = [];
  public systemData: any = [];
  public componentData: any = [];
  public searchComponent: Array<any>;
  public originComponentData: Array<any>;
  public hardConfigData: any = [];
  public softConfigData: any = [];
  public toggle = {
    hard: true,
    soft: true,
    hardTab: true,
    syttemTab: true,
    componentTab: true,
  };
  // 硬件
  public hardTitle: Array<TiTableColumns> = [];
  public hardDisplayData: Array<TiTableRowData> = [];
  public hardContentData: TiTableSrcData;
  public hardCurrentPage = 1;
  public hardPageSize = {
    options: [10, 20, 50, 100],
    size: 10
  };
  public hardTotalNumber = 0;
  // 系统
  public systemTitle: Array<TiTableColumns> = [];
  public systemDisplayData: Array<TiTableRowData> = [];
  public systemContentData: TiTableSrcData;
  public systemCurrentPage = 1;
  public systemPageSize = {
    options: [10, 20, 50, 100],
    size: 10
  };
  public systemTotalNumber = 0;
  // 组件
  public componentitle: Array<TiTableColumns> = [];
  public componentDisplayData: Array<TiTableRowData> = [];
  public componentContentData: TiTableSrcData;
  public componentCurrentPage = 1;
  public componentPageSize = {
    options: [10, 20, 50, 100],
    size: 10
  };
  public componentTotalNumber = 0;

  public ifConfig = false;  // 判断点击的是 查看还是优化建议
  public closeHover = false;
  public language = 'zh';
  public scene: string;
  public nodeData = false;
  public isMySQL = false;
  public MySQLData: object[] = [];

  public i18n: any;

  public value = '';
  public searchWords: Array<string> = [''];
  public ColorTheme = {
    Dark: HyTheme.Dark,
    Light: HyTheme.Light
  };
  public isSuggest = false;
  public tableData: object[];
  public initializing = true;
  public tableTitle: string;
  public selectTableTitle: string;
  public tableType: string;
  public columns: Array<TiTableColumns> = [];
  public srcData: TiTableSrcData;
  public displayed: Array<TiTableRowData> = [];
  public checkedList: Array<TiTableRowData> = [];
  public total = 0;
  public horSrcData: TiTableSrcData;
  public horColumns: Array<TiTableColumns> = [];
  public longColumns: Array<TiTableColumns> = [];
  public multipleObjectsColumns: Array<TiTableColumns> = [];
  public differentNodesData: any = [];
  @ViewChild('constastMask') constastMask: any;
  public suggestHover = false;


  constructor(
    public i18nService: I18nService,
    private themeServe: HyThemeService,
    private vscodeService: VscodeService) {
    this.i18n = this.i18nService.I18n();
  }


  ngOnInit() {
    this.srcData = {
      data: ([] as Array<TiTableRowData>),
      state: {
        searched: false,
        sorted: false,
        paginated: false
      },
    };
    if (sessionStorage.getItem('language') === 'en-us' || sessionStorage.getItem('language') === 'en') {
      this.language = 'en';
    } else {
      this.language = 'zh';
    }
    if (this.sceneSolution === 2) {
      this.headData = [
        {
          title: this.i18n.sys_summary.distributed.applicationType,
          data: '',
        },
        {
          title: this.i18n.sys_summary.distributed.databaseType,
          data: '',
        },
      ];
    } else {
      this.headData = [
        {
          title: this.i18n.sys_summary.distributed.applicationType,
          data: '',
        },
        {
          title: this.i18n.sys_summary.distributed.componentInformation,
          data: '',
        },
        {
          title: this.i18n.sys_summary.distributed.applicationScenario,
          data: '',
        }
      ];
    }
    this.hardTitle = [
      {
        title: this.i18n.sys_summary.distributed.hardConfig
      },
      {
        title: this.i18n.sys_summary.distributed.suggestedValue
      },
      {
        title: this.i18n.sys_summary.distributed.Suggestion
      },
    ];
    this.systemTitle = [
      {
        title: this.i18n.sys_summary.distributed.systemCongif
      },
      {
        title: this.i18n.sys_summary.distributed.suggestedValue
      },
      {
        title: this.i18n.sys_summary.distributed.Suggestion
      },
    ];
    this.componentitle = [
      {
        title: this.i18n.sys_summary.distributed.componentConfig
      },
      {
        title: this.i18n.sys_summary.distributed.suggestedValue
      },
      {
        title: this.i18n.sys_summary.distributed.Suggestion
      },
    ];
    this.GetCondigData();
    this.themeServe.subscribe(msg => {
      this.currTheme = msg;
    });
    if (document.body.className.includes('vscode-dark')) {
      this.currTheme = HyTheme.Dark;
    } else {
      this.currTheme = HyTheme.Light;
    }
  }
  // 点击查看
  public viewConfig(e: any) {
    this.ifConfig = e;
    if (!e) {
      this.isSuggest = true;
    }
    this.viewDetailMask.Open();
  }

  public closeDetailMask() {
    this.viewDetailMask.Close();
    this.isSuggest = false;
    this.suggestHover = false;
  }

  public viewDetails(el: {
    type: string; title: string;
    ask_name: string; key: any; clicked: boolean; prop?: string; columns?: Array<TiTableColumns>
  }) {
    el.clicked = true;
    this.initializing = true;
    this.tableTitle = el.title;
    this.tableType = el.type;
    const nodeTitle = { title: this.i18n.sys_cof.sum.cpu_info.node, key: 'nodeName1' };
    this.columns = [{
      title: this.i18n.nodeManagement.nodeName,
      key: 'node',
    },
    {
      title: this.i18n.common_term_projiect_name1,
      key: 'percentage',
    },
    {
      title: this.i18n.common_term_node_ip,
      key: 'node_ip',
    },
    {
      title: this.i18n.common_term_task_name,
      key: 'task_name',
    },
    {
      title: this.i18n.common_term_projiect_name1,
      key: 'project_name',
    }
    ];
    this.columns[1].title = el.prop || el.title;
    this.columns[1].key = el.key;
    const params = {
      taskId: this.taskid,
      queryType: 'view_detail',
      queryTarget: el.ask_name,
    };
    let url = `/tasks/taskcontrast/static/?`;
    url += Utils.converUrl(params);
    this.vscodeService.get({ url }, (res: any) => {
      const resData = res.data.data;
      this.srcData.data = resData.map((val: any[]) => {
        const item: any = {};
        this.columns.forEach((ele, idx) => {
          item[ele.key] = val[idx];
        });
        return item;
      });
      this.constastMask.Open();
    });
  }

  public GetCondigData() {
    const params = {
      queryType: 'scene',
      taskId: this.taskid
    };
    // 配置数据
    let url = `/tasks/taskcontrast/static/?`;
    url += Utils.converUrl(params);
    this.vscodeService.get({ url }, (res: any) => {
      if (res.data.sceneData.length === 2) {
        this.headData = [
          {
            title: this.i18n.sys_summary.distributed.applicationType,
            data: '',
          },
          {
            title: this.i18n.sys_summary.distributed.databaseType,
            data: '',
          },
        ];
      }
      res.data.sceneData.forEach((item: any, index: any) => {
        this.headData[index].data = this.language === 'zh' ? item[1] : item[2];
      });

      this.scene = res.data.sceneData[0][2];
      if (res.data.sceneData[1][1].indexOf('MySQL') > -1) {
        this.isMySQL = true;
      }
      if (res.data.hard === 'NOT SUPPORT') {
        this.nodeData = true;
        return;
      }
      this.recommendation(res.data.data);
      let configData: { [x: string]: any; hard?: any; soft?: any; };
      if (this.language === 'zh') {
        configData = res.data.environment;
      } else {
        configData = res.data.environment_en;
      }
      if (this.isMySQL) {
        this.MySQLData = [];
        const list = Object.keys(configData);
        list.forEach(val => {
          const item = { toggle: true, title: '', data: [{}] };
          item.toggle = true;
          item.title = val;
          item.data = configData[val];
          this.MySQLData.push(item);
        });
      } else {
        const hardArr: any = [];
        const softArr: any = [];
        configData.hard.forEach((item: any) => {
          const obj = {
            title: item[0],
            data: item.slice(1),
          };
          hardArr.push(obj);
        });
        configData.soft.forEach((item: any) => {
          const obj = {
            title: item[0],
            data: item.slice(1),
          };
          softArr.push(obj);
        });
        this.hardConfigData = hardArr;
        this.softConfigData = softArr;
      }
    });

  }
  // 全量建议
  public recommendation(data: any) {
    try {
      this.getHardData(data.hard);
    } catch (error) {
    }

    try {
      this.getSystemData(data.system);
    } catch (error) {
    }

    try {
      this.getComponentData(data.component);
      this.originComponentData = data.component;
    } catch (error) {
    }

  }
  // 硬件
  public getHardData(data: any) {
    const hardData: any = [];
    const hatdConfigData: any = [];
    data.forEach((item: any) => {
      const obj = {
        config: item.display_indicators,
        ask_name: item.indicators,
        current: item.cur_value,
        suggest: item.value,
        suggestValue: this.language === 'zh' ? item.sug : item.sug_en,
      };
      const object = {
        title: item.display_indicators,
        ask_name: item.indicators,
        data: item.cur_value,
        tip: item.equal ? 'NULL' : this.language === 'zh' ? item.sug : item.sug_en
      };
      hardData.push(obj);
      hatdConfigData.push(object);
    });
    this.hardTotalNumber = hardData.length;
    this.hardData = hatdConfigData;
    this.hardContentData = {
      data: hardData,
      state: {
        searched: false,
        sorted: false,
        paginated: false
      }
    };
  }
  // 系统
  public getSystemData(data: any) {
    const systemData: any = [];
    const systemConfigData: any = [];
    data.forEach((item: any) => {
      const obj = {
        config: item.display_indicators,
        ask_name: item.indicators,
        current: item.cur_value,
        suggest: item.value,
        suggestValue: this.language === 'zh' ? item.sug : item.sug_en,
      };
      systemData.push(obj);
      const object = {
        title: item.display_indicators,
        ask_name: item.indicators,
        data: item.cur_value,
        tip: item.equal ? 'NULL' : this.language === 'zh' ? item.sug : item.sug_en
      };
      systemConfigData.push(object);
    });
    this.systemTotalNumber = systemData.length;
    this.systemData = systemConfigData;
    this.systemContentData = {
      data: systemData,
      state: {
        searched: false,
        sorted: false,
        paginated: false
      }
    };
  }
  // 组件
  public getComponentData(data: any, searchWords?: string) {
    const componentData: any = [];
    const componentConfigData: any = [];
    data.forEach((item: any) => {
      const obj = {
        config: item.display_indicators,
        ask_name: item.indicators,
        current: item.cur_value,
        suggest: item.value,
        suggestValue: this.language === 'zh' ? item.sug : item.sug_en,
      };
      const object = {
        title: item.display_indicators,
        ask_name: item.indicators,
        data: item.cur_value,
        tip: item.equal ? 'NULL' : this.language === 'zh' ? item.sug : item.sug_en
      };
      if (searchWords) {
        if (item.display_indicators.indexOf(searchWords) > -1) {
          componentData.push(obj);
          componentConfigData.push(object);
        }
      } else {
        componentData.push(obj);
        componentConfigData.push(object);
      }

    });
    this.componentTotalNumber = componentData.length;
    if (!searchWords && this.componentData.length === 0) {
      this.componentData = componentConfigData;
    }
    this.searchComponent = componentConfigData;
    this.componentContentData = {
      data: componentData,
      state: {
        searched: false,
        sorted: false,
        paginated: false
      }
    };
  }

  /**
   * 搜索弱组件
   * @param event 输入字符串
   */
  public comSearch(event: any) {
    const keyword = event === undefined ? '' : event.toString().trim();
    const str = encodeURIComponent(keyword);
    this.getComponentData(this.originComponentData, str);
  }

  /**
   * 清空搜索框
   */
  public onClear(): void {
    const str = '';
    this.getComponentData(this.originComponentData, str);
  }

}

