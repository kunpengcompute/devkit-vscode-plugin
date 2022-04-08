// Miss事件统计
import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { TiTableColumns, TiTableRowData, TiTableSrcData, TiPageSizeConfig } from '@cloud/tiny3';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import { AxiosService } from 'projects/sys/src-web/app/service/axios.service';
import { TableService } from 'sys/src-com/app/service/table.service';
import { MessageService } from 'projects/sys/src-web/app/service/message.service';
import { MytipService } from 'projects/sys/src-web/app/service/mytip.service';
import { LeftShowService } from 'projects/sys/src-web/app/service/left-show.service';

/** 视图列表：时序视图 | 详细视图 */
type Views = 'timeSequence' | 'details';

@Component({
  selector: 'app-miss-statistics',
  templateUrl: './miss-statistics.component.html',
  styleUrls: ['./miss-statistics.component.scss']
})
export class MissStatisticsComponent implements OnInit {
  @Input() taskid: any;
  @Input() nodeid: any;
  @Input() formEl: any;
  @Input() parentFormEl: any;
  @Input() values: any;
  @Input() analysisType: any;

  @ViewChild('subModuleFunction') subModuleFunction: any;

  public i18n: any;
  /** 当前视图 时序视图 | 详细视图 */
  public currentView: Views = 'timeSequence';
  public chartData: any;
  public dataType = 'Core';
  public typeDetail: any = [];
  public typeName: any;
  public selectOption: any;
  public dataName: string;
  public optionList: any = [];
  public obtainingTimeSequenceData = false;

  public theads: any = [];
  public columns: Array<TiTableColumns> = [];
  public predefinedColumn: any;  // 预定义的表头
  public show = true;
  public optionKeyList: any = {};

  public missEventDes: any = {};
  public hasCalcTotal = false;  // 是否已经计算过miss总次数【获取表格数据的时候计算一次就够了】

  // -- 详细视图表格 --
  public obtainingTableData = false;
  public displayed: Array<TiTableRowData> = []; // 表示表格实际呈现的数据（开发者默认设置为[]即可）
  public tableData: any = [];
  public sortBy: any = [];
  private data: Array<TiTableRowData> = [];
  public srcData: any;
  public currentPage = 1;
  public totalNumber = 0;
  public pageSize: TiPageSizeConfig = {
    options: [10, 20, 50, 100],
    width: '60px',
    size: 20
  };

  constructor(
    public i18nService: I18nService,
    public Axios: AxiosService,
    public tableService: TableService,
    private messageService: MessageService,
    public mytip: MytipService,
    public leftShowService: LeftShowService,
  ) {
    this.i18n = this.i18nService.I18n();

    this.optionList = [
      {
        list: [
          { key: 'Function', disabled: true, tip: this.i18n.common_term_noCallStackInfo },
          { key: 'Callstack' },
        ],
        label: '',
        value: '',
        checked: true
      }, {
        list: [
          { key: 'Module' },
          { key: 'Function', disabled: true, tip: this.i18n.common_term_noCallStackInfo },
          { key: 'Callstack' },
        ],
        label: '',
        value: ''
      }, {
        list: [
          { key: 'Thread' },
          { key: 'Function', disabled: true, tip: this.i18n.common_term_noCallStackInfo },
          { key: 'Callstack' },
        ],
        label: ''
        , value: ''
      }, {
        list: [
          { key: 'Core' },
          { key: 'Thread' },
          { key: 'Function', disabled: true, tip: this.i18n.common_term_noCallStackInfo },
          { key: 'Callstack' },
        ],
        label: '',
        value: ''
      }, {
        list: [
          { key: 'Process' },
          { key: 'Function' },
          { key: 'Thread', disabled: true, tip: this.i18n.common_term_noCallStackInfo },
          { key: 'Callstack' },
        ],
        label: '',
        value: ''
      }, {
        list: [
          { key: 'Process' },
          { key: 'Thread' },
          { key: 'Module' },
          { key: 'Function', disabled: true, tip: this.i18n.common_term_noCallStackInfo },
          { key: 'Callstack' },
        ],
        label: '',
        value: ''
      }, {
        list: [
          { key: 'Process' },
          { key: 'Module' },
          { key: 'Thread' },
          { key: 'Function', disabled: true, tip: this.i18n.common_term_noCallStackInfo },
          { key: 'Callstack' },
        ],
        label: '',
        value: '',
      }, {
        list: [
          { key: 'Process' },
          { key: 'Module' },
          { key: 'Function' },
          { key: 'Thread', disabled: true, tip: this.i18n.common_term_noCallStackInfo },
          { key: 'Callstack' },
        ],
        label: '',
        value: ''
      }, {
        list: [
          { key: 'Function' },
          { key: 'Thread' },
          { key: 'Core', disabled: true, tip: this.i18n.common_term_noCallStackInfo },
          { key: 'Callstack' },
        ],
        label: '',
        value: '',
      },
    ];

    // option key list
    this.optionKeyList = {
      Function: this.i18n.common_term_task_tab_summary_function,
      Callstack: this.i18n.common_term_task_tab_summary_callstack,
      Module: this.i18n.common_term_task_tab_summary_module,
      Thread: this.i18n.common_term_task_tab_summary_thread,
      Core: this.i18n.common_term_task_tab_summary_core,
      Class: this.i18n.common_term_task_tab_summary_class,
      Method: this.i18n.common_term_task_tab_summary_method,
      Process: this.i18n.common_term_projiect_task_process,
    };

    this.optionList.forEach((option: any) => {
      if (!option.label && option.list) {
        option.label = option.list.map((item: any) => this.optionKeyList[item.key]).join('/');
      }
    });

    this.selectOption = this.optionList.find((item: any) => item.checked) || this.optionList[0];

    this.predefinedColumn = {
      name: {
        title: this.selectOption.label,
        prop: 'name',
      },
      missTimes: {
        title: this.i18n.ddr.misses,
        prop: 'missTimes',
        sortKey: 'missTimes',
        parseData: (value: any) => +value,
      },
      Module: {
        title: this.i18n.common_term_task_tab_summary_modulePath,
        prop: 'Module',
      },
      pid: {
        title: this.i18n.common_term_task_crate_pid,
        prop: 'pid',
      },
      tid: {
        title: this.i18n.common_term_task_crate_tid,
        prop: 'tid',
      },
    };

    this.srcData = { // 表格源数据，开发者对表格的数据设置请在这里进行
      data: this.data, // 源数据
      state: {
        searched: false, // 源数据未进行搜索处理
        sorted: true, // 源数据未进行排序处理
        paginated: false // 源数据未进行分页处理
      },
      sort: {
        sortNum: 1,
        list: []
      }
    };
  }

  ngOnInit() {
    this.dataName = 'cpu';
  }

  // 初始化
  public init() {
    this.getMissTiming();
    const analysisMode = this.values.analysisMode;

    this.missEventDes = {
      application: {
        order: 0,
        show: analysisMode === 'app',
        label: this.parentFormEl.form.application.label,
        value: this.values.application,
      },
      pid: {
        order: 1,
        show: ![null, undefined, ''].includes(this.values.pid),
        label: this.parentFormEl.form.pid.label,
        value: this.values.pid,
      },
      process_name: {
        order: 1,
        show: !!this.values.process_name,
        label: this.parentFormEl.form.process_name.label,
        value: this.values.process_name,
      },
      indicatorType: {
        order: 2,
        show: true,
        label: this.formEl.formGroup.get('indicatorType').value.label,
        value: '--',
      },
    };

    this.subModuleFunction.init({});
  }


  // -- 表单 --
  public trackByFn(a: any, b: any) {
    return a.order - b.order;
  }


  // -- 详细视图表格 --
  // 下拉框的选项改变时
  public selectChange({ option }: any): void {
    this.selectOption = option;

    this.columns = [];
    this.theads = [this.columns];
    this.predefinedColumn.name.title = this.selectOption.label;

    this.tableData = [];

    this.getChildren({
      node: {
        children: this.tableData
      }
    });
  }

  // 将有层级结构的树表数据扁平化，同时动态计算表头
  public getTreeTableArrAndColumns(tableData: any) {
    const data: any = [];
    const columnProps: any = [];

    const addData = (children: any) => {
      children.forEach((child: any) => {
        data.push(child);

        if (child.columnProps) {
          child.columnProps.forEach((columnProp: any, columnPropIndex: any) => {
            if (!columnProps.includes(columnProp)) {
              columnProps.splice(columnProps.indexOf(child.columnProps[columnPropIndex - 1]) + 1, 0, columnProp);
            }
          });
        }

        if (child.expand && child.children) {
          addData(child.children);
        }
      });
    };
    addData(tableData);

    const predefinedColumn = JSON.parse(JSON.stringify(this.predefinedColumn));
    this.columns = columnProps.map((columnProp: any) => {
      return this.columns.find(column => column.prop === columnProp) || predefinedColumn[columnProp]
        || { title: columnProp, prop: columnProp };
    });
    this.theads = [this.columns];

    return data;
  }

  // 获取子数据
  public getChildren({ node }: any): void {
    // 如果选项禁用，跳出
    if (node.disabled) {
      return;
    }

    node.expand = !node.expand;

    if (node.expand && !node.hasGetChildren) {
      const list = this.selectOption.list.map((option: any) => option.key);
      const newGroup = {
        group: list.slice(0, list.indexOf(node.level) + 2).join('/')
      };

      let newParam;
      if (node.level === 'Process') {
        newParam = { pid: +node.name };
      } else if (node.level === 'Thread') {
        newParam = { tid: +node.name };
      } else if (node.level === 'Module') {
        newParam = { module: node.name };
      } else if (node.level === 'Function') {
        newParam = { function: node.name };
      } else if (node.level === 'Core') {
        newParam = { core: +node.name };
      }

      this.getTableData({
        tableData: node.children,
        level: list[list.indexOf(node.level) + 1],
        queryTarget: Object.assign(node.queryTarget || {}, newGroup, newParam),
        node
      });
    } else {
      const expandedData = this.getTreeTableArrAndColumns(this.tableData);
      this.srcData.data = expandedData;
      // 算下总条数
      this.totalNumber = this.srcData.data.length;
    }
  }

  /*
    获取表格数据
    index: 点击node在tableData中的索引，新的数据往后插入
    level: 当前要获取数据的层级
  */
  public getTableData({ tableData, level, queryTarget, node }: any) {
    const params = {
      'node-id': this.nodeid,
      'query-type': 'detail_enhance',
      'query-target': queryTarget
    };

    this.obtainingTableData = true;
    this.Axios.axios.get(`/tasks/${encodeURIComponent(this.taskid)}/mem-access-analysis/`, {
      params,
      headers: {
        showLoading: false,
      }
    }).then((res: any) => {
      const data = res.data;

      if (!data.content || !data.content.length) {  // 如果是空数据，去掉前面的展开按钮
        delete node.children;
      } else {
        const nameIndex = data.title.indexOf(level);
        const levelInfo = this.selectOption.list.find((option: any) => option.key === level);

        // 数据列在表头中的对应
        const titleTocolumns = data.title.map((title: any, titleIndex: any) => {
          if (title === this.values.indicatorType) {
            return this.predefinedColumn.missTimes;
          }
          if (titleIndex === nameIndex) {
            return this.predefinedColumn.name;
          }

          return this.predefinedColumn[title] || { prop: title };
        });

        tableData.push(...data.content.map((item: any, index: any) => {
          const rowData: any = {};
          titleTocolumns.forEach((column: any, columnIndex: any) => {
            rowData[column.prop] = typeof column.parseData === 'function'
              ? column.parseData(item[columnIndex]) : item[columnIndex];
          });

          const row: any = {
            ...rowData,
            index,
            expand: false,
            children: item[nameIndex] !== '[unknown]' && [],
            hasGetChildren: false,
            title: data.title,
            queryTarget: JSON.parse(JSON.stringify(queryTarget)),
            level,
            levelIndex: this.selectOption.list.findIndex((option: any) => option.key === level),
            id: `${item[nameIndex]}_${Date.now()}`,
            disabled: levelInfo.disabled,
            tip: levelInfo.tip,
          };
          if (data.title[1] === 'Module') { // 如果接口返回带有module，下层数据的接口需要带上该值
            row.queryTarget.module = item[1];
          }
          if (!index) { // 保存下表头信息，用来在展开折叠列时动态计算表头【接口获取的title都是重复的，保存一个就够了】【cmdline 不需要添加表头】
            row.columnProps = titleTocolumns.map((column: any) => column.prop).filter((columnProp: any) =>
              !['cmdline'].includes(columnProp));
          }
          return row;
        }));

        node.hasGetChildren = true;

        // 算下总的Miss次数
        if (!this.hasCalcTotal) {
          this.missEventDes.indicatorType.value = tableData.reduce((prev: any, current: any) =>
            ({ missTimes: prev.missTimes + current.missTimes })).missTimes;
          this.hasCalcTotal = true;
        }

        // 如果有排序在生效，将新获取的数据进行排序
        const sortColumn = this.columns.find(column => !!column.sortStatus);
        if (sortColumn) {
          this.tableService.sortTable(this.tableData, this.columns, sortColumn.sortKey, sortColumn.sortStatus);
        }

        this.srcData.data = this.getTreeTableArrAndColumns(this.tableData);
        this.totalNumber = this.srcData.data.length;
      }
    }).catch((error: any) => { }).finally(() => {
      this.obtainingTableData = false;
    });
  }

  // 表格排序
  public sortTableData({ prop, order }: any) {
    this.tableService.sortTable(this.tableData, this.columns, prop, order);
    const expandedData = this.tableService.getTreeTableArr(this.tableData);
    this.srcData.data = expandedData;
  }

  // 跳转至源码界面
  public addFunctionTab(row: any) {
    this.Axios.axios.get(`/tasks/${encodeURIComponent(this.taskid)}/mem-access-analysis/`, {
      headers: {
        mask: false
      },
      params: {
        'node-id': this.nodeid,
        'query-type': 'srcAsm',
        'query-target': {
          module: row.queryTarget ? row.queryTarget.module : row.ModulePath,
          function: row.name,
          metric: this.values.indicatorType,
        },
      },
    }).then(async (res: any) => {
      const data = res.data;

      if (data.src || data.bbb || data.svg) {
        let total = 0;

        // 格式化源代码
        let sourceCodeData = [];
        if (data.src && Array.isArray(data.src.content)) {
          const sourceIndex = {
            line: data.src.title.indexOf('SrcLine'),
            line_code: data.src.title.indexOf('SrcCode'),
            count: data.src.title.indexOf('PmuCount'),
            proportion: data.src.title.indexOf('Proportion'),
          };

          sourceCodeData = data.src.content.map((item: any, index: any) => {
            return {
              id: `source_${index}`,
              line: +item[sourceIndex.line],
              line_code: item[sourceIndex.line_code],
              count: +item[sourceIndex.count],
              proportion: item[sourceIndex.proportion] === '0'
                ? 0 : ((item[sourceIndex.proportion] * 100).toFixed(3) + '%'),
            };
          });
        }

        // 格式化汇编代码
        const assemblyCodeData: any = [];
        if (Array.isArray(data.bbb)) {
          data.bbb.forEach((item: any, index: any) => {
            const obj: any = {
              id: item.id,
              offset: item.IP || item.end,
              line: +item.SrcLine,
              ins: item.Instruct || item.ins,
              count: +item.PmuCount,
              proportion: item.Proportion === '0' ? 0 : ((item.Proportion * 100).toFixed(3) + '%'),
              children: [],
            };

            if (item.parent === null) {
              total += +item.PmuCount;
              assemblyCodeData.push(obj);
            } else {
              assemblyCodeData.find((block: any) => block.id === item.parent).children.push(obj);
            }
          });
        }

        // 代码流
        let svgpath;
        if (data.svg) {
          const svgResp: any = await this.Axios.axios.get(
            `/tasks/${encodeURIComponent(this.taskid)}/c-analysis/svg-content/`, {
            headers: { mask: false },
            params: {
              'svg-name': data.svg,
              nodeid: data.nodeid,
            },
          });

          if (svgResp.length > 0) {
            svgpath = svgResp;
          }
        }

        this.messageService.sendMessage({
          function: 'functionTab',
          msg: {
            functionName: row.name,
            nodeid: this.nodeid,
            taskid: this.taskid,
            taskType: 'lock',
            headers: [
              {
                label: this.i18n.common_term_task_tab_function_hard,
                content: this.formEl.formGroup.get('indicatorType').value.label
              },
              { label: this.i18n.common_term_task_tab_function_total, content: total },
              { label: this.i18n.common_term_task_tab_function_name, content: this.values.c_source },
            ],
            functionDetails: {
              sourceCode: {
                data: sourceCodeData,
                message: data?.source?.message
              },
              assemblyCode: {
                data: assemblyCodeData,
              },
              codeStream: {
                svgpath,
              },
            },
          }
        });
      } else {  // 无数据
        this.mytip.alertInfo({
          type: 'warn',
          content: this.i18n.noSourceData,
          time: 3500,
        });
      }
    }).catch((e: any) => {
      this.mytip.alertInfo({
        type: 'warn',
        content: e.message,
        time: 3500,
      });
    });
  }


  /*
   获取时序图数据
 */
  public getMissTiming() {
    const params = {
      'node-id': this.nodeid,
      'query-type': 'timeline',
      'query-target': {
        group: this.dataType, range: 'entire', dataCount: 100,
      }
    };

    this.obtainingTimeSequenceData = true;
    this.Axios.axios.get(`/tasks/${encodeURIComponent(this.taskid)}/mem-access-analysis/`, {
      params,
      headers: {
        showLoading: false,
      }
    }).then((data: any) => {
      const missData = data.data.content;
      let arr: any;
      if (missData != null) {
        this.typeName = this.formEl.formGroup.get('indicatorType').value.label;
        arr = [];
        Object.keys(missData).forEach(key => {
          if (Object.prototype.hasOwnProperty.call(missData, key)) {
            const obj = {              // 获取数据类型对应的子数据
              id: '',
              label: '',
              num: '',
            };
            obj.id = key;
            obj.label = key;
            obj.num = missData[key][missData[key].length - 1][0];
            arr.push(obj);
            missData[key].forEach((item: any, index: any) => {
              item[0] = item[0] / 1000;
            });
          }
        });
      }
      const arrSort = JSON.parse(JSON.stringify(arr));
      arrSort.sort((a: any, b: any) => {
        return b.num - a.num;  // 按照data 的数据多少进行排序
      });
      missData['-1'] = JSON.parse(JSON.stringify(missData[arrSort[0].id]));
      this.chartData = missData; // 传到子组件的数据
      this.typeDetail = arr;
      this.show = true;
    }).catch((error: any) => { }).finally(() => {
      this.obtainingTimeSequenceData = false;
    });
  }
  /**
   *
   * @param event 获取子组件传过来的数据类型
   */
  public obtainType(event: any) {
    const map = new Map([['cpu', 'Core'], ['process', 'Process'], ['thread', 'Thread'], ['module', 'Module']]);
    this.dataName = event.label;
    this.dataType = map.get(event.id);
    this.getMissTiming();
  }

  public tabChang(view: Views) {
    this.currentView = view;
    this.leftShowService.leftIfShow.next();
  }
}
