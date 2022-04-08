import { Component, OnInit, Input, ViewChild, AfterViewInit } from '@angular/core';
import { TiTableColumns, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';
import { MessageService } from 'projects/sys/src-web/app/service/message.service';
import { AxiosService } from 'projects/sys/src-web/app/service/axios.service';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import { MytipService } from 'projects/sys/src-web/app/service/mytip.service';
import '../../../../string.extensions';
@Component({
  selector: 'app-function',
  templateUrl: './function.component.html',
  styleUrls: ['./function.component.scss']
})
export class FunctionComponent implements OnInit, AfterViewInit {
  @Input() projectName: any;
  @Input() taskName: any;
  @Input() analysisType: any;
  @Input() taskid: any;
  @Input() nodeid: any;
  @ViewChild('table1', { static: true }) table1: any;
  tabName: any = { name: '_do_soft' };
  @Input()
  public set select(item: any) {
    this.flameSelect = item;
    this.flameFunction = item.functionName;
  }
  public get select() {
    return this.flameSelect;
  }
  public flameSelect: any;
  public flameFunction = ''; // 不为''来判断是从火焰图跳转来的
  public i18n: any;
  public language = 'zh';
  public commonTerms: any;
  public isIE = false;
  public isSearch = false;
  public value = ''; // 搜索输入框内容
  public str: string;
  private childLock = false;
  constructor(
    private messageService: MessageService,
    public Axios: AxiosService,
    public i18nService: I18nService,
    public mytip: MytipService
  ) {
    this.i18n = this.i18nService.I18n();

    // 公共术语对应表【key与name保持一致】
    const commonTerms = {
      function: this.i18n.common_term_task_tab_summary_function,
      callstack: this.i18n.common_term_task_tab_summary_callstack,
      module: this.i18n.common_term_task_tab_summary_module,
      thread: this.i18n.common_term_task_tab_summary_thread,
      core: this.i18n.common_term_task_tab_summary_core,
      class: this.i18n.common_term_task_tab_summary_class,
      method: this.i18n.common_term_task_tab_summary_method
    };
    this.commonTerms = commonTerms;

    // 解决中英文混杂问题，label后续有用到，就暂时新增了title来作为label，以防影响未知的东西
    this.allOptions = [
      {
        label: 'Function/Callstack View',
        title: `${commonTerms.function}/${commonTerms.callstack}`,
        searchKey: 'function',
        searchString: 'Function',
        type: 'all'
      },
      {
        label: 'Module/Function/Callstack',
        title: `${commonTerms.module}/${commonTerms.function}/${commonTerms.callstack}`,
        searchKey: 'module',
        searchString: 'Module',
        type: 'all'
      },
      {
        label: 'Thread/Function/Callstack',
        title: `${commonTerms.thread}/${commonTerms.function}/${commonTerms.callstack}`,
        searchKey: 'thread',
        searchString: 'ThreadName',
        type: 'all'
      },
      {
        label: 'Core/Function/Callstack',
        title: `${commonTerms.core}/${commonTerms.function}/${commonTerms.callstack}`,
        searchKey: 'core',
        searchString: 'Core',
        type: 'Core'
      },
      {
        label: 'Class/Method/Callstack',
        title: `${commonTerms.class}/${commonTerms.method}/${commonTerms.callstack}`,
        searchKey: 'class',
        searchString: 'Class',
        type: 'Class'
      },
      {
        label: 'Function/Thread/Core/Callstack View',
        title: `${commonTerms.function}/${commonTerms.thread}/${commonTerms.core}/${commonTerms.callstack}`,
        nameList: ['function', 'thread', 'core', 'callstack'],
        searchKey: 'function',
        searchString: 'Function',
        type: 'all',
      },
    ];

    this.selectOption = this.allOptions[0];
  }
  public id = 0;
  public showTable = true;
  public moduleName: any;
  public functionName: any;
  public coreName: any;
  public tidName: any;
  public className: any;
  public methodNode: any;
  public notShowList: any = {};
  public noDataInfo = '';
  public allOptions: Array<any> = [];
  public options: Array<any> = [];
  public selectOption: any;
  public displayed: Array<TiTableRowData> = []; // 表示表格实际呈现的数据（开发者默认设置为[]即可）
  public srcData: TiTableSrcData;
  public showFlameTable = true;
  private data: Array<TiTableRowData> = []; // 扁平化的所有数据
  public columns: Array<TiTableColumns> = [];
  public treeData: Array<any> = [ // 后台请求的完整树状数据

  ];

  public currentPage = 1;
  public totalNumber = 0;
  public pageSize: { options: Array<number>, size: number } = {
    options: [10, 20, 50, 100],
    size: 20
  };
  public obtainingTableData = true;


  public jumpDetail(node: any) {

  }

  public addFunctionTab(row: any): any {
    if (row.name !== 'function') { return false; }

    this.Axios.axios.get(`/tasks/${encodeURIComponent(this.taskid)}/common/code-mapping/`, {
      headers: {
        mask: false
      },
      params: {
        'node-id': this.nodeid,
        func: row.Function,
        module: row.Module,
        'nav-name': 'Code',
        javamix: Object.prototype.hasOwnProperty.call(row, 'Type') ? parseInt(row.Type, 10) : 0,
        field: 'CPU_CYCLES',
      }
    }).then(async (res: any) => {
      const data = res.data;

      if (data.source || data.bbb || data.svgpath || data.graph_status) {
        // 格式化源代码
        let sourceCodeData = [];
        if (data.source && Array.isArray(data.source.code)) {
          sourceCodeData = data.source.code.map((item: any, index: any) => {
            return {
              ...item,
              id: `source_${index}`,
              line: +item.line,
              line_code: item.line_code,
              count: +item.CPU_CYCLES.split('(')[0],
              proportion: item.CPU_CYCLES.split('(')[1].split(')')[0],
            };
          });
        }

        // 格式化汇编代码
        const assemblyCodeData: any = [];
        if (Array.isArray(data.bbb)) {
          data.bbb.forEach((item: any, index: any) => {
            const obj = {
              ...item,
              offset: item.offset,
              line: +item.line,
              ins: item.ins,
              count: +item.CPU_CYCLES_COUNT,
              proportion: item.CPU_CYCLES.split('(')[1].split(')')[0],
            };

            if (item.parent === null) {
              obj.children = [];
              assemblyCodeData.push(obj);
            } else {
              assemblyCodeData.find((block: any) => block.id === item.parent).children.push(obj);
            }
          });
        }

        // 代码流
        let svgpath;
        if (data.graph_status && data.graph_status.status !== 1 && data.svgpath) {
          const svgResp: any = await this.Axios.axios.get(
            `/tasks/${encodeURIComponent(this.taskid)}/c-analysis/svg-content/`, {
            headers: { mask: false },
            params: {
              'svg-name': data.svgpath,
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
            functionName: row.Function,
            nodeid: this.nodeid,
            taskid: this.taskid,
            taskType: 'lock',
            headers: [
              { label: this.i18n.common_term_task_tab_function_hard, content: 'CPU Cycles' },
              { label: this.i18n.common_term_task_tab_function_total, content: data.pmutotal.CPU_CYCLES },
              { label: this.i18n.common_term_task_tab_function_name, content: data.filename || '--' },
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
                graph_status: data.graph_status,
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
      this.noDataInfo = this.i18n.common_term_task_nodata2;
    });
  }
  ngOnInit(): void {
    if (window.navigator.msSaveOrOpenBlob) {
      this.isIE = true;
    }
    if (sessionStorage.getItem('language') === 'en-us') {
      this.language = 'en';
    } else {
      this.language = 'zh';
    }
    this.noDataInfo = this.i18n.loading;

    this.columns = [
      {
        title: this.selectOption.title
      },
      {
        title: this.i18n.common_term_task_tab_summary_times
      },
      {
        title: this.i18n.common_term_task_tab_summary_cycles
      },
      {
        title: this.i18n.common_term_task_tab_summary_cyclesProportion
      },
      {
        title: this.i18n.common_term_task_tab_summary_instructions
      },
      {
        title: this.i18n.common_term_task_tab_summary_instructionProportion
      },
      {
        title: this.i18n.common_term_task_tab_summary_ipc
      },
      {
        title: this.i18n.common_term_task_tab_summary_module
      },
    ];

  }
  ngAfterViewInit() {
    this.getFunctionGroup();
  }
  public initData(dataList: any, add: any) {
    let i = 0;
    this.data = this.getTreeTableArr(dataList);
    if (this.srcData) {
      this.srcData.data.forEach((item, index) => {
        this.data.forEach(item2 => {
          if (item.uuid === item2.uuid) {
            if (Object.prototype.hasOwnProperty.call(item2, 'expand')) {
              item2.expand = item.expand;
            }
          }
        });
      });
    }
    const a = Object.keys(this.notShowList);
    this.data.forEach(item => {
      if (a.indexOf(item.uuid.toString()) > -1) {
        item.isShow = false;

      }
      if (item.isShow === true) { i++; }
    });

    this.totalNumber = i;
    this.srcData = { // 表格源数据，开发者对表格的数据设置请在这里进行
      data: this.data, // 源数据
      state: {
        searched: false, // 源数据未进行搜索处理
        sorted: false, // 源数据未进行排序处理
        paginated: false // 源数据未进行分页处理
      }
    };
    this.srcData.data = this.data.filter((item, idx) => {
      if (this.str) {
        return this.filterReturn(item, idx);
      } else {
        return item.isShow === true;
      }
    });
    this.totalNumber = this.srcData.data.length;
    this.ifShowTable();
  }

  // pArray: 父级数据， pLevel: 父级层数
  // 将有层级结构的数据扁平化
  private getTreeTableArr(pArray: Array<any>, pLevel?: number, pId?: any, father?: any, add?: boolean): Array<any> {

    let tableArr: Array<any> = [];
    if (pArray === undefined) {
      return tableArr;
    }
    pLevel = pLevel === undefined ? 0 : pLevel + 1;
    pId = pId === undefined ? 'tiTableRoot' : pId;
    add = add === undefined ? false : true;
    let temp: any;
    pArray.forEach((item, index) => {
      this.id++;
      temp = this.deepClone(item);
      temp.id = this.id;
      delete temp.children;
      temp.level = pLevel;
      pLevel === 0 ? temp.isShow = true : temp.isShow = add;
      temp.pId = pId;
      if (Object.prototype.hasOwnProperty.call(item, 'father')) {
        temp.father += item.father + '.' + index;
      } else {
        temp.father += father + '.' + index;
      }
      temp.hasChildren = false;
      temp.expand = false;
      temp.isShow = true;
      if (item.Function === 'do_csum.part.0' || item.suggestion) {
        temp.tipStr = item.suggestion == null ? 'NULL' : item.suggestion.suggest_chs ? this.language === 'zh'
          ? item.suggestion.suggest_chs : item.suggestion.suggest_en : 'NULL';
      }
      temp.showinTable = 'yes';
      tableArr.push(temp); // 也可以在此循环中做其他格式化处理

      if (item.children) {
        temp.hasChildren = true;
        if (item.children.length > 0) { temp.expand = true; }

        tableArr = tableArr.concat(this.getTreeTableArr(item.children, pLevel, temp.id, temp.father, false));
      }
    });
    return tableArr;
  }
  public getFatherInTree(node: any) {
    const parent = node.father.split('.');
    let res = this.treeData[0];
    for (let j = 1; j < parent.length - 1; j++) {
      res = res.children[parent[j + 1]];
    }
    return res;
  }
  public toggle(node: any): void {
    if (node.name === 'module') {
      this.moduleName = node.Module;
    } else if (node.name === 'function') {
      this.functionName = node.Function;
      this.moduleName = node.Module;
    } else if (node.name === 'thread') {
      this.tidName = node.Thread;
    } else if (node.name === 'core') {
      this.coreName = node.Core;
    } else if (node.name === 'class') {
      this.className = node.Class;
    } else if (node.name === 'method') {
      this.methodNode = node;
    }

    const parent = node.father.split('.');
    const test = this.getFatherInTree(node);
    if (node.expand === false) {
      if (this.selectOption.label === 'Function/Callstack View' && test.children.length === 0) {
        if (parent.length === 2) {
          this.getFunctionList(node);
        } else if (parent.length === 3) {
          this.getCallstack(node);
        }
      } else if (this.selectOption.label === 'Module/Function/Callstack' && test.children.length === 0) {
        if (parent.length === 2) {
          this.getModuleList(node);
        } else if (parent.length === 3) {
          this.getFunctionList(node);
        } else if (parent.length === 4) {
          this.getCallstack(node);
        }
      } else if (this.selectOption.label === 'Thread/Function/Callstack' && test.children.length === 0) {
        if (parent.length === 2) {
          this.getThreadList(node);
        } else if (parent.length === 3) {
          this.getFunctionList(node);
        } else if (parent.length === 4) {
          this.getCallstack(node);
        }
      } else if (this.selectOption.label === 'Core/Function/Callstack' && test.children.length === 0) {
        if (parent.length === 2) {
          this.getCoreList(node);
        } else if (parent.length === 3) {
          this.getFunctionList(node);
        } else if (parent.length === 4) {
          this.getCallstack(node);
        }
      } else if (this.selectOption.label === 'Class/Method/Callstack' && test.children.length === 0) {
        if (parent.length === 2) {
          this.getClassList(node);
        } else if (parent.length === 3) {
          this.getMethodList(node);
        } else if (parent.length === 4) {
          this.getCallstack(node);
        }
      } else if (this.selectOption.label === 'Function/Thread/Core/Callstack View' && test.children.length === 0) {
        if (!node.level) {
          this.getFunctionList(node);
        } else {
          const nameList = this.selectOption.nameList;
          const treeNode = this.getFatherInTree(node);

          const queryParams = node.queryParams ? JSON.parse(node.queryParams) : {
            func: '',
            module: '',
            tid: '',
            core: '',
          };

          if (node.name === 'function') {
            queryParams.func = node.Function;
            queryParams.module = node.Module;
          } else if (node.name === 'thread') {
            queryParams.tid = node.Tid;
          } else if (node.name === 'core') {
            queryParams.core = node.Core;
          }

          const name = nameList[nameList.indexOf(node.name) + 1];

          if (name === 'callstack') {
            this.getCallstack(node, queryParams);
          } else {
            this.getTableData({ node: treeNode, queryParams, name });
          }
        }
      }
      node.expand = true;
    } else {
      node.expand = false;

    }
    this.toggleChildren(this.data, node.id, node.expand);

    this.srcData.data = this.data.filter((item, idx) => {
      if (item.isShow === false) {
        this.notShowList[item.uuid] = item;
      } else {
        delete this.notShowList[item.uuid];
      }
      if (this.str) {
        return this.filterReturn(item, idx);
      } else {
        return item.isShow === true;
      }
    });
    this.totalNumber = this.srcData.data.length;
  }

  private toggleChildren(data: Array<any>, pId: any, pExpand: boolean): void {
    let i = 0;
    for (const node of data) {
      if (node.pId === pId) {
        i++;
        node.isShow = pExpand; // 处理当前子节点
        if (pExpand === false) {// 折叠时递归处理当前节点的子节点
          this.toggleChildren(data, node.id, false);
        } else {  // 展开时递归处理当前节点的子节点
          if (node.expand === true) {
            this.toggleChildren(data, node.id, true);
          }
        }
      }
    }
    if (i === 0) {    // 当递归结束的时候  重新给srcdata赋值

      this.srcData.data = this.data.filter(item => {
        return item.isShow === true;
      });
    }
  }

  public getLevelStyle(node: any): { 'padding-left': string } {
    return {
      'padding-left': `${node.level * 18 + 10}px`
    };
  }

  private deepClone(obj: any): any { // 深拷贝，类似于1.x中的angular.copy() TODO: 是否需要将该方法写进组件
    if (typeof (obj) !== 'object' || obj === null) {
      return obj;
    }

    let clone: any;

    clone = Array.isArray(obj) ? obj.slice() : { ...obj };

    const keys: Array<string> = Object.keys(clone);

    for (const key of keys) {
      clone[key] = this.deepClone(clone[key]);
    }

    return clone;
  }

  public doSelectOption(e: any) {    // 下拉框事件
    this.moduleName = '';
    this.functionName = '';
    this.tidName = '';
    this.coreName = '';
    this.className = '';
    this.methodNode = '';
    this.value = '';
    this.str = '';
    if (this.srcData) {
      this.srcData.data = [];
    }
    this.data.length = 1;
    if (this.treeData.length > 0) {
      this.treeData[0].children = [];
    }
    this.columns[0].title = e.title;
    this.notShowList = [];
    this.getFunctionTop();

    if (e.label === 'Function/Thread/Core/Callstack View') {
      const idx = this.columns.findIndex(el => {
        return el.prop === 'pid' || el.prop === 'tid';
      });
      if (idx === -1) {
        this.columns.push(...[
          { title: this.i18n.common_term_task_crate_pid, prop: 'pid' },
          { title: this.i18n.common_term_task_crate_tid, prop: 'tid' },
        ]);
      }

    } else {
      for (let index = 0; index < this.columns.length; index++) {
        if (['pid', 'tid'].includes(this.columns[index].prop)) {
          this.columns.splice(index--, 1);
        }
      }
    }
  }
  /**
   * 从火焰图跳转过来,找不到函数详情,隐藏table
   */
  public ifShowTable() {
    if (this.flameFunction !== '' && this.srcData.data) {
      if (this.selectOption.type === 'Class') {
        this.showFlameTable = this.srcData.data.length > 0 ? true : false;
      } else if (this.selectOption.label === 'Function/Thread/Core/Callstack View'
        || this.selectOption.label === 'Function/Callstack View') {
        this.showFlameTable = this.srcData.data.length > 1 ? true : false;
      } else {
        this.showFlameTable = this.srcData.data.length > 2 ? true : false;
      }
    }
  }

  public getFunctionTop() {    // 获取总体Function统计信息

    const url = `/tasks/${encodeURIComponent(this.taskid)}/c-analysis/total-func-results/?`;

    const params = {
      'node-id': this.nodeid,
      'nav-name': 'Function',
      key: ''
    };

    this.obtainingTableData = true;
    this.Axios.axios.get(url, {
      params,
      headers: {
        showLoading: false,
      }
    })
      .then(async (data: any) => {
        this.obtainingTableData = false;
        data.data[0].children = [];
        data.data[0].id = 0;
        data.data[0].total = 'Total';
        data.data[0].name = 'totalfunction';
        data.data[0].uuid = this.generateConversationId(32);
        this.treeData = data.data;
        await this.initData(this.treeData, false);
        const node = this.srcData.data[0];
        if (this.selectOption.type === 'Class' && this.flameFunction !== '') {
        } else {
          this.toggle(node);

        }
      })
      .catch(() => {
        this.noDataInfo = this.i18n.common_term_task_nodata2;
        this.obtainingTableData = false;
      });
  }

  public getFunctionGroup() {
    const params = {
      'node-id': this.nodeid,
      'nav-name': 'Configuration'
    };
    const url = `/tasks/${encodeURIComponent(this.taskid)}/common/function-grouping/?` + this.Axios.converUrl(params);
    this.obtainingTableData = true;
    this.Axios.axios.get(url, {
      headers: {
        showLoading: false,
      }
    })
      .then((data: any) => {
        const typeList = ['all'];
        if (data.data.hasCore === 1) {
          typeList.push('Core');
        }
        if (data.data.hasclass === 1) {
          typeList.push('Class');
        }

        this.options = this.allOptions.filter(item => {
          // class类和函数无关
          return typeList.includes(item.type);
        });
        this.selectOption = this.options[0];
        let selectIndex = 0;
        if (this.flameFunction !== '') {    // 如果是火焰图点击跳转过来的
          this.showFlameTable = false;
          this.options.forEach((item, index) => {
            if (item.label.indexOf('Function/Thread') > -1) {
              selectIndex = index;
            }
          });
        }
        this.selectOption = this.options[selectIndex];
        this.doSelectOption(this.selectOption);
      }).catch((e: any) => {
        this.noDataInfo = this.i18n.common_term_task_nodata2;
        this.getFunctionTop();
      });
  }

  public getModuleList(node: any) {
    const url = `/tasks/${encodeURIComponent(this.taskid)}/c-analysis/topdown-modules/?`;

    const fatherInTree = this.getFatherInTree(node);
    const params = {
      'node-id': this.nodeid,
      func: this.flameFunction,
      'nav-name': 'Configuration',
      key: ''
    };
    this.obtainingTableData = true;
    this.Axios.axios.get(url, {
      params,
      headers: {
        showLoading: false,
      }
    })
      .then(async (data: any) => {
        this.obtainingTableData = false;
        if (Array.isArray(data.data) ? data.data.length : Object.keys(data.data).length) {
          const conData = data.data.filter((item: any) => {
            item.children = item.Module === '[unknown]' ? undefined : [];
            item.next = 'function';
            item.name = 'module';
            item.uuid = this.generateConversationId(32);
            return item['Time(s)'] !== 0;
          });
          fatherInTree.children = conData;
          await this.initData(this.treeData, true);
          if (this.flameFunction !== '') {
            const node1 = this.srcData.data[1];
            this.toggle(node1);
          }
        }
      })
      .catch(() => {
        this.obtainingTableData = false;
        this.noDataInfo = this.i18n.common_term_task_nodata2;
      });

  }

  public getThreadList(node: any) {
    const url = `/tasks/${encodeURIComponent(this.taskid)}/c-analysis/topdown-threads/?`;
    const fatherInTree = this.getFatherInTree(node);
    const params = {
      'node-id': this.nodeid,
      'nav-name': 'Configuration',
      func: this.flameFunction,
      key: ''
    };
    this.obtainingTableData = true;
    this.Axios.axios.get(url, {
      params,
      headers: {
        showLoading: false,
      }
    })
      .then(async (data: any) => {
        this.obtainingTableData = false;
        if (Array.isArray(data.data) ? data.data.length : Object.keys(data.data).length) {
          const conData = data.data.filter((item: any) => {
            item.children = [];
            item.next = 'function';
            item.name = 'thread';
            item.ThreadName = item.Common + '(TID:' + item.Thread + ')';
            item.uuid = this.generateConversationId(32);
            return item['Time(s)'] !== 0;
          });
          fatherInTree.children = conData;
          node.expand = true;
          await this.initData(this.treeData, true);
          if (this.flameFunction !== '') {
            const node1 = this.srcData.data[1];
            this.toggle(node1);
          }
        } else {
          this.noDataInfo = this.i18n.common_term_task_nodata2;
        }
      })
      .catch(() => {
        this.obtainingTableData = false;
        this.noDataInfo = this.i18n.common_term_task_nodata2;
      });
  }

  public getCoreList(node: any) {
    const fatherInTree = this.getFatherInTree(node);
    const params = {
      'node-id': this.nodeid,
      func: this.flameFunction,
      'nav-name': 'Configuration',
      key: ''
    };
    const url = `/tasks/${encodeURIComponent(this.taskid)}/c-analysis/topdown-cores/?`;
    this.obtainingTableData = true;
    this.Axios.axios.get(url, {
      params,
      headers: {
        showLoading: false,
      }
    })
      .then(async (data: any) => {
        this.obtainingTableData = false;
        if (Array.isArray(data.data) ? data.data.length : Object.keys(data.data).length) {
          const conData = data.data.filter((item: any) => {
            item.children = [];
            item.next = 'function';
            item.name = 'core';
            item.uuid = this.generateConversationId(32);
            return item['Time(s)'] !== 0;
          });
          const conData1 = conData.sort((a: any, b: any) => a.Core - b.Core);  // 排序
          fatherInTree.children = conData1;
          await this.initData(this.treeData, true);
          if (this.flameFunction !== '') {
            const node1 = this.srcData.data[1];
            this.toggle(node1);
          }
        } else {
          this.noDataInfo = this.i18n.common_term_task_nodata2;
        }
      })
      .catch(() => {
        this.obtainingTableData = false;
        this.noDataInfo = this.i18n.common_term_task_nodata2;
      });
  }

  public getClassList(node: any) {
    const fatherInTree = this.getFatherInTree(node);
    const params = {
      'node-id': this.nodeid,
      'nav-name': 'Configuration',
      key: ''
    };
    const url = `/tasks/${encodeURIComponent(this.taskid)}/java-analysis/classes/?`;
    this.obtainingTableData = true;
    this.Axios.axios.get(url, {
      params,
      headers: {
        showLoading: false,
      }
    })
      .then((data: any) => {
        this.obtainingTableData = false;
        if (Array.isArray(data.data) ? data.data.length : Object.keys(data.data).length) {
          const conData = data.data.filter((item: any) => {
            item.children = [];
            item.next = 'method';
            item.name = 'class';
            item.uuid = this.generateConversationId(32);
            return item['Time(s)'] !== 0;
          });
          const conData1 = conData.sort((a: any, b: any) => a.Core - b.Core);  // 排序
          fatherInTree.children = conData1;
          this.initData(this.treeData, true);
        } else {
          this.noDataInfo = this.i18n.common_term_task_nodata2;
        }
      })
      .catch(() => {
        this.obtainingTableData = false;
        this.noDataInfo = this.i18n.common_term_task_nodata2;
      });
  }

  public getMethodList(node: any) {
    const fatherInTree = this.getFatherInTree(node);
    const params = {
      'node-id': this.nodeid,

      'nav-name': 'Configuration',
      key: '',
      class: this.className
    };
    const url = `/tasks/${encodeURIComponent(this.taskid)}/java-analysis/methods/?`;
    this.obtainingTableData = true;
    this.Axios.axios.get(url, {
      params,
      headers: {
        showLoading: false,
      }
    })
      .then((data: any) => {
        this.obtainingTableData = false;
        if (Array.isArray(data.data) ? data.data.length : Object.keys(data.data).length) {
          const conData = data.data.filter((item: any) => {
            item.children = [];
            item.next = 'callstack';
            item.name = 'method';
            item.uuid = this.generateConversationId(32);
            return item['Time(s)'] !== 0;
          });
          const conData1 = conData.sort((a: any, b: any) => a.Core - b.Core);  // 排序
          fatherInTree.children = conData1;
          this.initData(this.treeData, true);
        } else {
          this.noDataInfo = this.i18n.common_term_task_nodata2;
        }
      })
      .catch(() => {
        this.obtainingTableData = false;
        this.noDataInfo = this.i18n.common_term_task_nodata2;
      });
  }

  /**
   * 获取所有函数/调用栈
   */
  public getFunctionList(node: any) {
    const url = `/tasks/${encodeURIComponent(this.taskid)}/c-analysis/topdown-funcs/?`;
    const fatherInTree = this.getFatherInTree(node);
    const params = {
      'node-id': this.nodeid,

      'nav-name': 'Configuration',
      key: '',
      core: this.coreName || '',
      module: this.moduleName || '',
      tid: this.tidName || ''
    };
    this.obtainingTableData = true;
    this.Axios.axios.get(url, {
      params,
      headers: {
        showLoading: false,
      }
    })
      .then((data: any) => {
        this.obtainingTableData = false;
        if (Array.isArray(data.data) ? data.data.length : Object.keys(data.data).length) {
          const conData = data.data.filter((item: any) => {
            item.children = (item.Original === 'unknown' && item.Module === '[unknown]') ? undefined : [];
            item.next = 'callstack',
              item.name = 'function';
            item.uuid = this.generateConversationId(128);
            return item['Time(s)'] !== 0;
          });
          if (this.flameFunction !== '') {
            const func = this.flameFunction;
            const funcReg = func.replace('[', '\\[').replace(']', '\\]');
            const reg = new RegExp('^' + funcReg + '\\[(.*?)\\]$', 'g');
            const reg1 = new RegExp('^' + funcReg + '$', 'g');
            fatherInTree.children = conData.filter((item: any) => {
              const indexValue = reg.test(item.Original) || reg1.test(item.Original);
              const ifvalue = indexValue && item.Module === this.flameSelect.module;
              this.flameFunction = ifvalue ? item.Original : this.flameFunction;
              return ifvalue;
            });
            this.noDataInfo = fatherInTree.children.length > 0 ? this.i18n.loading : this.i18n.common_term_task_nodata2;
          } else {
            fatherInTree.children = conData;
          }
          node.expand = true;
          this.initData(this.treeData, true);
        } else {
          this.noDataInfo = this.i18n.common_term_task_nodata2;
        }
      })
      .catch(() => {
        this.obtainingTableData = false;
        this.noDataInfo = this.i18n.common_term_task_nodata2;
      });
  }


  public getCallstack(node: any, queryParams?: any) {
    const url = `/tasks/${encodeURIComponent(this.taskid)}/c-analysis/func-callstacks/?`;

    const fatherInTree = this.getFatherInTree(node);
    const parent = node.father.split('.');

    if (!queryParams) {
      queryParams = {
        key: '',
        module: this.moduleName || '',
        tid: this.tidName || '',
        func: this.functionName || '',
        core: this.coreName || '',
      };

    }
    const params = {
      'node-id': this.nodeid,
      'nav-name': 'Configuration',
      ...queryParams,
    };
    this.obtainingTableData = true;
    this.Axios.axios.get(url, {
      params,
      headers: {
        showLoading: false,
      }
    }).then((data: any) => {
      this.obtainingTableData = false;
      if (Array.isArray(data.data) ? data.data.length : Object.keys(data.data).length) {
        const conData = data.data.filter((item: any) => {
          item.name = 'callstack';
          item.uuid = this.generateConversationId(32);
          return item['Time(s)'] !== 0;
        });
        fatherInTree.children = conData;

        this.initData(this.treeData, true);
      } else {
        fatherInTree.children = undefined;
        this.initData(this.treeData, true);
      }
    })
      .catch(() => {
        this.obtainingTableData = false;
        this.noDataInfo = this.i18n.common_term_task_nodata2;
      });
  }

  public generateConversationId(len: any) {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split(
      ''
    );
    const uuid = [];
    let i;
    const radix = chars.length;

    if (len) {
      for (i = 0; i < len; i++) {
        uuid[i] = chars[Math.floor(Math.random() * radix)];
      }
    } else {
      uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
      uuid[14] = '4';

      let r;
      for (i = 0; i < 36; i++) {
        if (!uuid[i]) {
          r = Math.floor(Math.random() * 16);
          uuid[i] = chars[i === 19 ? Math.floor(Math.random() * 4) + 8 : r];
        }
      }
    }
    return uuid.join('');
  }

  /*
    获取表格数据
    index: 点击node在tableData中的索引，新的数据往后插入
    level: 当前要获取数据的层级
  */
  public getTableData({ node, queryParams, name }: any) {
    const nameList = this.selectOption.nameList;
    const params = {
      'node-id': this.nodeid,
      'nav-name': 'Configuration',
      ...queryParams,
    };
    const nodeNamePropList: any = {  // 不同组织方式下的nodeName
      function: (node1: any) => node1.Function,
      thread: (node2: any) => `Thread(TID:${node2.Tid})`,
      core: (node3: any) => node3.Core,
    };

    this.obtainingTableData = true;
    this.Axios.axios.post(`/tasks/${encodeURIComponent(this.taskid)}/c-analysis/topdown-funcsfilter/`, params, {
      headers: {
        showLoading: false,
      },
    }).then((res: any) => {
      node.children = res.data.map((item: any, index: any) => {
        return {
          index,
          name,
          nodeName: nodeNamePropList[name](item),
          uuid: this.generateConversationId(32),
          children: (name === nameList.slice(-1)[0]) ? undefined : [],
          queryParams: JSON.stringify(queryParams),
          ...item,
        };
      });

      this.initData(this.treeData, true);
    }).catch((e: any) => {
      this.noDataInfo = this.i18n.common_term_task_nodata2;
    }).finally(() => {
      this.obtainingTableData = false;
    });
  }

  /**
   * 将从火焰图跳转过来的筛选状态刷新到初始状态/从分页展开状态刷新到初始状态
   */
  public refreshFunction() {
    this.noDataInfo = this.i18n.loading;
    this.showFlameTable = true;
    this.flameFunction = '';
    this.doSelectOption(this.selectOption);
  }

  public replaceAll(originStr: string, searchVal: string, replaceVal: string): string {
    if (originStr == null) {
      return void 0;
    }
    return originStr.toString().replace(new RegExp(searchVal, 'gm'), replaceVal);
  }

  /**
   * 搜索
   * @param event 输入字符串
   * @param data 数据来源
   */
  public comSearch(event: any) {
    const keyword = event === undefined ? '' : event.toString().trim();
    this.str = encodeURIComponent(keyword);
    this.srcData.data = this.data.filter((item, idx) => {
      return this.filterReturn(item, idx);
    });
    this.totalNumber = this.srcData.data.length;
    this.isSearch = false;
  }
  /**
   * 搜索筛选
   */
  private filterReturn(item: any, idx: number) {
    let bool = false;
    if (idx === 0) {
      bool = true;
    } else if (item.name === this.selectOption.searchKey) {
      this.childLock = false;
      if (item[this.selectOption.searchString].toString().includes(this.str)) {
        this.childLock = item.expand;
        bool = true;
      }
    } else if (this.childLock) {
      bool = true;
    }
    return bool;
  }

  /**
   * 清空搜索框
   */
  public onClear(): void {
    this.value = '';
    this.str = '';
    this.srcData.data = this.data.filter((item, idx) => {
      let bool = false;
      if (idx === 0) {
        bool = true;
      } else {
        bool = item.isShow;
      }
      return bool;
    });
    this.totalNumber = this.srcData.data.length;
  }
}
