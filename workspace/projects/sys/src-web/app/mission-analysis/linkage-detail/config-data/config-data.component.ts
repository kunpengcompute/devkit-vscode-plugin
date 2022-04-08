import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import { AxiosService } from 'projects/sys/src-web/app/service/axios.service';
import { TiTableColumns, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';
import { ConfigTableService } from '../service/config-table.service';
@Component({
  selector: 'app-config-data',
  templateUrl: './config-data.component.html',
  styleUrls: ['./config-data.component.scss']
})
export class ConfigDataComponent implements OnInit {
  @Input() projectName: string;
  @Input() taskName: string;
  @Input() taskid: any;
  @Input() nodeid: number;
  public tableData: object[];
  public initializing = true;
  public i18n: any;
  public tableTitle: string;
  public selectTableTitle: string;
  public tableType: string;
  public columns: Array<TiTableColumns> = [];
  public srcData: TiTableSrcData;
  public displayed: Array<TiTableRowData> = [];
  public checkedList: Array<TiTableRowData> = []; // 默认选中项
  public total = 0;
  public horSrcData: TiTableSrcData;
  public horColumns: Array<TiTableColumns> = [];
  public longColumns: Array<TiTableColumns> = [];
  public multipleObjectsColumns: Array<TiTableColumns> = []; // selectMask表头
  public differentNodesData: any = []; // selectMask数据

  public tabList: object[];
  @ViewChild('constastMask') constastMask: any;
  @ViewChild('selectMask') selectMask: any;
  constructor(
    public configTableService: ConfigTableService,
    private Axios: AxiosService,
    public i18nService: I18nService
  ) {
    this.tableData = JSON.parse(JSON.stringify(configTableService.configInfo));
    this.i18n = this.i18nService.I18n();
  }

  ngOnInit(): void {
    this.srcData = {
      data: ([] as Array<TiTableRowData>),
      state: {
        searched: false,
        sorted: false,
        paginated: false
      },
    };
    this.horSrcData = {
      data: ([] as Array<TiTableRowData>),
      state: {
        searched: false,
        sorted: false,
        paginated: false
      },
    };
    this.tabList = [
      {
        title: this.i18n.linkage.typicalConfig,
        active: true,
      },
      {
        title: this.i18n.linkage.allConfig,
        active: false,
      }
    ];
    this.getData();
  }

  public getData() {
    this.Axios.axios.get('/tasks/taskcontrast/static/', {
      params: { queryType: 'summary', taskId: this.taskid }, headers: {
        showLoading: true,
      }
    }).then((res: any) => {
      if (res?.data) {
        this.tableData.forEach((val: { prop: string, table: any[] }) => {
          const data = res.data[val.prop];
          val.table.forEach(el => {
            el.forEach((item: { [x: string]: any; key: string; }) => {
              item.data = this.junkData(data[item.key], item.key);
              item.clicked = false;
            });
          });
        });
      }

    })
      .finally(() => {
        this.initializing = false;
      });
  }
  /**
   * 将后端返回的各种类型数据处理成合乎规范的数据
   * @param data 后端返回的各种类型数据
   */
  public junkData(data: any, key?: string) {
    let value = '';
    if (key === 'SMMU'){
      data = !Array.isArray(data) ? '--' : data.length > 0
      ? this.i18n.sys_cof.sum.open : this.i18n.sys_cof.sum.close;
    } else if (key === 'cfg_smmu_info' && data === '--'){
      data = this.i18n.sys_cof.sum.close;
    } else {
      data = Array.isArray(data) ? data[0] : data;
    }
    // 表格数据
    if (data === null || data === '' || data === undefined || data === 'undefined') {
        data = '--';
    }
    value = data.toString()
      .replace(/kB/g, '')
      .replace(/Open/g, this.i18n.sys_cof.sum.open)
      .replace(/ON/g, this.i18n.sys_cof.sum.open)
      .replace(/CLOSE/g, this.i18n.sys_cof.sum.close)
      .replace(/OFF/g, this.i18n.sys_cof.sum.close)
      .replace(/Close/g, this.i18n.sys_cof.sum.close);
    return value;
  }

  /**
   * 清空表格数据及表头
   */
  public cleanData() {
    this.srcData.data = [];
    this.horSrcData.data = [];
    this.checkedList = [];
    this.total = 0;
    this.differentNodesData = [];
  }

  /**
   * 点击查看详情
   * @param el el信息
   */
  public viewDetails(el: {
    type: string;
    title: string;
    key: any;
    clicked: boolean;
    prop?: string;
    columns?: Array<TiTableColumns>
  }) {
    this.cleanData();
    el.clicked = true;
    this.initializing = true;
    this.tableTitle = el.title;
    this.tableType = el.type;
    let mask = this.constastMask;
    const nodeTitle = { title: this.i18n.sys_cof.sum.cpu_info.node, key: 'nodeName1' };
    const arr = [{
      title: this.i18n.common_term_task_name,
      key: 'task_name',
    },
    {
      title: this.i18n.common_term_projiect_name1,
      key: 'project_name',
    }];
    if (this.tableType === 'multipleValues' || this.tableType === 'singleData') {
      this.columns = this.configTableService.multipleValues;
      this.columns[1].title = el.prop || el.title;
      this.columns[1].key = el.key;
    } else if (this.tableType === 'multipleRows') {

    } else if (this.tableType === 'differentNodes') {
      mask = this.selectMask;
      this.selectTableTitle = el.title;
      this.multipleObjectsColumns = JSON.parse(JSON.stringify(el.columns));

    } else if (this.tableType === 'multipleObjects' || this.tableType === 'nodeObjects') {
      if (this.tableType === 'nodeObjects') {
        mask = this.selectMask;
        this.selectTableTitle = el.title;
      }
      this.multipleObjectsColumns = JSON.parse(JSON.stringify(el.columns));
      this.columns = JSON.parse(JSON.stringify(el.columns));
      this.columns.push(nodeTitle);
    }
    const params = {
      taskId: this.taskid,
      queryType: 'view_detail',
      queryTarget: el.key,
    };
    this.Axios.axios.get('/tasks/taskcontrast/static/', { params, headers: { showLoading: true } })
      .then((res: any) => {
        const resData = res.data.data;
        if (this.tableType === 'multipleRows') {
          this.dealMultipleRows(res);
        } else if (this.tableType === 'differentNodes') {
          if (!res.data?.tasksame) {
            this.multipleObjectsColumns = this.multipleObjectsColumns.concat(arr);
          }
          this.dealDifferentNodes(res);
        } else if (this.tableType === 'multipleObjects' || this.tableType === 'nodeObjects') {
          if (!res.data?.tasksame) {
            this.columns = this.columns.concat(arr);
          }
          this.dealMultipleObjects(res);
        } else {
          this.srcData.data = res.data.data.map((val: any[]) => {
            const item: any = {};
            this.columns.forEach((ele, idx) => {
              item[ele.key] = this.junkData(val[idx], ele.title);
            });
            return item;
          });
        }
        mask.Open();
      })
      .finally(() => {
        this.initializing = false;
      });
  }

  /**
   * 处理multipleRows数据
   * @param res 源数据
   */
  public dealMultipleRows(res: any) {
    const resData = res.data.data;
    const typicalData = res.data.top;
    this.total = resData.length;
    const rowColumns = [{
      title: this.i18n.linkage.parameters,
      key: 'parameters',
      options: ([] as Array<object>),
      selected: ([] as Array<object>),
    }];
    this.longColumns = rowColumns;
    res.data.title.forEach((item: string) => {
      const column = { title: item, key: item };
      this.longColumns.push(column);
    });
    this.horColumns = JSON.parse(JSON.stringify(this.longColumns));
    this.srcData.data = typicalData.map((val: any[], num: number) => {
      const item: { [x: string]: any } = { different: false };
      this.longColumns.forEach((ele: { [x: string]: any }, idx: number) => {
        item[ele.key] = item.data = this.junkData(val[idx]);
      });
      item.different = res.data.top_different[num];
      return item;
    });
    this.horSrcData.data = resData.map((val: any[], num: number) => {
      const item: { [x: string]: any } = { different: false };
      this.horColumns.forEach((ele: { [x: string]: any }, idx: number) => {
        item[ele.key] = item.data = this.junkData(val[idx]);
      });
      item.different = res.data.different[num];
      return item;
    });
    const options = [
      { label: this.i18n.linkage.allParams },
      { label: this.i18n.linkage.differentParams },
    ];
    this.longColumns[0].options = JSON.parse(JSON.stringify(options));
    this.horColumns[0].options = JSON.parse(JSON.stringify(options));
    this.longColumns[0].selected = this.longColumns[0].options[0];
    this.horColumns[0].selected = this.horColumns[0].options[0];
  }

  /**
   * 处理differentNodes数据
   * @param res 源数据
   */
  public dealDifferentNodes(res: any) {
    const resData = res.data.data;
    this.differentNodesData = resData.map((val: any, idx: number) => {
      const expand = idx === 0 ? true : false;
      const displayed: Array<TiTableRowData> = [];
      const srcData = {
        data: ([] as Array<TiTableRowData>),
        state: {
          searched: false,
          sorted: false,
          paginated: false
        },
      };
      const item: { [x: string]: any } = {
        srcData,
        expand,
        displayed,
        different: val.different || false,
        projectName: val.title,
      };
      item.srcData.data = val.data.map((el: any[]) => {
        const child: { [x: string]: any } = {};
        this.multipleObjectsColumns.forEach((it, num: number) => {
          const value = Array.isArray(el[num]) ? el[num][0] : !el[num] && el[num] !== 0 ? '--' : el[num];
          child[it.key] = this.junkData(value);
        });
        return child;
      });
      return item;
    });
  }


  /**
   * multipleObjects
   * @param res 源数据
   */
  public dealMultipleObjects(res: any) {
    const resData = res.data?.device_list;
    const devList = resData ? Object.keys(resData) : [];
    if (resData && devList.length > 0) {
      this.differentNodesData = devList.map((val: any, idx: number) => {
        const expand = idx === 0 ? true : false;
        const displayed: Array<TiTableRowData> = [];
        const srcData = {
          data: ([] as Array<TiTableRowData>),
          state: {
            searched: false,
            sorted: false,
            paginated: false
          },
        };
        const item: { [x: string]: any } = {
          srcData, expand, displayed, diffrent: false, projectName: val, checkedList: []
        };
        item.srcData.data = resData[val].map((el: any[]) => {
          const child: { [x: string]: any } = {};
          this.columns.forEach((it, num: number) => {
            child[it.key] = this.junkData(el[num]);
          });
          return child;
        });
        item.checkedList = [...item.srcData.data];
        return item;
      });
      let arr: any[] = [];
      this.differentNodesData.forEach((val: { srcData: any; }) => {
        arr = [...val.srcData.data, ...arr];
      });
      this.srcData.data = arr;
    }
  }

  /**
   * 侧滑框取消按钮
   * @param str 点击遮罩层或者取消按钮
   */
  public onSelectCancel(str?: string) {
    if (str !== 'mask') {
      this.selectMask.CloseIO();
    }
  }

  /**
   * 磁盘选择确定按钮
   */
  public onSelectConfirm() {
    let arr: any[] = [];
    this.differentNodesData.forEach((val: { checkedList: any; }) => {
      arr = [...val.checkedList, ...arr];
    });
    this.srcData.data = arr;
    this.selectMask.CloseIO();
  }

  /**
   * tab变化
   */
  public onActiveChange(e: any) {

  }

  // differentNodes 磁盘筛选的相关方法
  public onThreadScreenClick() {
    this.selectTableTitle = this.i18n.linkage.selectObj;
    this.selectMask.Open();
  }
}
