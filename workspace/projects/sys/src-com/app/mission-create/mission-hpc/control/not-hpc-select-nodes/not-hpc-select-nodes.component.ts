import { Component, Input, forwardRef } from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import {
  TiPageSizeConfig,
  TiTableColumns,
  TiTableRowData,
  TiTableSrcData,
} from '@cloud/tiny3';
import { I18n } from 'sys/locale';
import { HyTheme, HyThemeService } from 'hyper';
import { Subscription } from 'rxjs';
import { TaskStatus } from 'sys/src-com/app/domain';

type HpcNodeInfo = {
  node: string;
  disabled: boolean;
  nickName: string;
  nodeState: string;
  params: any;
  nodeId: string;
  id: number;
  [key: string]: any;
};

@Component({
  selector: 'app-not-hpc-select-nodes',
  templateUrl: './not-hpc-select-nodes.component.html',
  styleUrls: ['./not-hpc-select-nodes.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NotHpcSelectNodesComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => NotHpcSelectNodesComponent),
      multi: true,
    },
  ],
})
export class NotHpcSelectNodesComponent implements ControlValueAccessor {
  // 选择节点 适用于hpc工程下非hpc任务
  static MAX_NODE_SELECT_NUM = 10;

  // 节点信息
  @Input()
  set nodeList(val: any[]) {
    if (null == val || val.length === 0) {
      return;
    }
    this.nodeListStash = val;
    this.initTableInfo(this.checkedInfoStash, val);
  }
  get nodeList() {
    return this.nodeListStash;
  }
  // 选中的节点信息
  @Input()
  set checkedInfo(val: Array<TiTableRowData>) {
    if (null == val || val.length === 0) {
      return;
    }
    this.checkedInfoStash = val;
    this.initTableInfo(val, this.nodeListStash);
  }
  get checkedInfo() {
    return this.checkedInfoStash;
  }

  // 复选框禁用
  @Input()
  set isSelectNodeDisabled(val: boolean) {
    this.allNodeListInfo.forEach((item: any) => {
      if (val) {
        item.disabled = true;
      } else {
        item.disabled = item.nodeStatus === TaskStatus.Off;
      }
    });
    this.isSelectNodeDisStash = val;
  }
  get isSelectNodeDisabled() {
    return this.isSelectNodeDisStash;
  }
  @Input() isHPC: boolean;
  @Input() width = '952px';

  taskStatus = TaskStatus;
  currTheme: HyTheme;
  ColorTheme = {
    Dark: HyTheme.Dark,
    Light: HyTheme.Light,
  };

  checkedList: Array<HpcNodeInfo> = [];
  displayed: Array<HpcNodeInfo> = [];
  srcData: TiTableSrcData = {
    data: [],
    state: {
      searched: false, // 源数据未进行搜索处理
      sorted: false, // 源数据未进行排序处理
      paginated: false, // 源数据未进行分页处理
    },
  };
  columns: Array<TiTableColumns> = [
    {
      title: I18n.nodeManagement.nodeName,
      width: '30%',
      multiple: true,
      showFilter: false,
      showSearch: true,
      searchKey: 'nickName',
    },
    {
      title: I18n.node.status,
      width: '30%',
      multiple: true,
      showFilter: true,
      showSearch: false,
      selected: null,
      options: [
        {
          label: I18n.status_Online,
          value: TaskStatus.On,
        },
        {
          label: I18n.status_Offline,
          value: TaskStatus.Off,
        },
      ],
    },
    {
      title: I18n.nodeConfig.node,
      width: '30%',
      multiple: true,
      showFilter: false,
      showSearch: true,
      searchKey: 'node',
    },
  ];

  // 分页
  currentPage = 1;
  pageSize: TiPageSizeConfig = {
    options: [10, 20, 50, 100],
    size: 10,
  };
  totalNumber: number;
  isShowAll = true;
  searchWordsSave: { [key: string]: string } = {
    node: '',
    nickName: '',
  };

  private nodeListStash: any[] = [];
  private isSelectNodeDisStash: boolean;
  private searchListsSave: Array<TiTableRowData> = [];
  private allNodeListInfo: Array<HpcNodeInfo> = [];
  private checkedInfoStash: Array<TiTableRowData> = [];
  private themeSub: Subscription;
  private propagateChange = (_: TiTableRowData) => {};
  private propagateTunched = (_: any) => {};

  constructor(private themeServe: HyThemeService) {
    this.themeSub = this.themeServe
      .getObservable()
      .subscribe((theme: HyTheme) => {
        this.currTheme = theme;
      });
  }

  /**
   * 筛选
   * @param event 选中信息
   */
  onSelect(event: any[]) {
    if (event?.length) {
      this.allNodeListInfo = [];
      event.forEach((option: HpcNodeInfo) => {
        this.getPureNodelist(this.nodeList).filter((item) => {
          if (option.value === item.nodeState) {
            this.allNodeListInfo.push({
              ...item,
              disabled: TaskStatus.Off === item.nodeState || this.isSelectNodeDisStash,
            });
          }
        });
      });
      this.srcData.data = this.allNodeListInfo;

      const checkedInfo = JSON.parse(JSON.stringify(this.checkedList));
      this.checkedList = [];
      checkedInfo.forEach((node: any) => {
        this.allNodeListInfo.find((node1: any, index: number) => {
          if (node.id === node1.id && TaskStatus.On === node.nodeState) {
            this.checkedList.push(this.allNodeListInfo[index]);
          }
        });
      });
    }
  }

  /**
   * 初始化表格数据
   * @param checkedInfo 选中数据列表
   * @param nodeList 全部节点列表
   */
  initTableInfo(checkedInfo: any, nodeList: any) {
    if (checkedInfo.length && nodeList.length) {
      // 处理节点下所有节点
      this.allNodeListInfo = this.getPureNodelist(nodeList);
      this.searchListsSave = JSON.parse(JSON.stringify(this.allNodeListInfo));
      this.srcData.data = this.allNodeListInfo;
      this.totalNumber = nodeList.length;

      // 处理选中的数据
      this.checkedList = [];
      for (const node of checkedInfo) {
        const index = this.allNodeListInfo.findIndex((node1: any) => {
          return (
            (node.nodeId === node1.id || node.id === node1.id) &&
            TaskStatus.On === node1.nodeState
          );
        });
        if (index > -1) {
          this.checkedList.push(this.allNodeListInfo[index]);
        }
      }
      if (!this.isHPC) {
        this.handelCheckedState(this.checkedList, this.allNodeListInfo);
      }
    }
  }

  /**
   * 处理checked的状态
   * @param checkedInfo 选中列表信息
   * @param allNodeListInfo 工程下所有节点列表信息
   */
  handelCheckedState(checkedInfo: any[], allNodeListInfo: HpcNodeInfo[]) {
    if (checkedInfo.length >= NotHpcSelectNodesComponent.MAX_NODE_SELECT_NUM) {
      for (const item of allNodeListInfo) {
        item.disabled = !Boolean(
          checkedInfo.filter((nodeItem: any) => nodeItem.id === item.id).length
        );
      }
    } else {
      for (const item of allNodeListInfo) {
        item.disabled = item.nodeStatus === TaskStatus.Off || this.isSelectNodeDisStash;
      }
    }
  }

  /**
   * 表头搜索弹框点击搜索事件监控
   * @param searchText 搜索文本
   * @param column 搜索列
   */
  onTableHeaderSearch(searchText?: any, column?: any) {
    this.searchWordsSave[column.searchKey] = searchText;

    if (searchText) {
      const nodeList = JSON.parse(JSON.stringify(this.allNodeListInfo));
      this.allNodeListInfo = nodeList.filter(
        (nodeItem: any) => nodeItem[column.searchKey].indexOf(searchText) > -1
      );
      this.srcData.data = this.allNodeListInfo;
    } else {
      this.allNodeListInfo = JSON.parse(JSON.stringify(this.searchListsSave));
      this.srcData.data = this.allNodeListInfo;
    }

    // 处理选中的数据
    const checkedListStash = JSON.parse(JSON.stringify(this.checkedList));
    this.checkedList = [];
    if (checkedListStash.length) {
      this.allNodeListInfo.forEach((item: any, index: number) =>
        checkedListStash.filter((nodeItem: any) => {
          if (item.id === nodeItem.id) {
            this.checkedList.push(this.allNodeListInfo[index]);
          }
        })
      );
    }
  }

  /**
   * 点击checked
   * @param _ 选中的数据
   */
  onCheckedsChange(_: any): void {
    // 处理选中数量为临界值的情况
    if (!this.isHPC) {
      this.handelCheckedState(this.checkedList, this.allNodeListInfo);
    }

    // 处理返回出去的数据
    const selectList = this.checkedList.map((item: any) => {
      return this.nodeList.filter((nodeItem) => item.id === nodeItem.id)[0];
    });
    this.propagateChange(selectList);
  }

  /**
   * 切换查看选中信息或所有信息
   * @param bool true:所有信息; false:选中信息
   */
  onChangeTableInfo(bool: boolean) {
    this.isShowAll = bool;
    this.allNodeListInfo.forEach((item) => {
      item.disabled = TaskStatus.Off === item.nodeState || this.isSelectNodeDisStash;
    });
    this.srcData.data = bool
      ? [...this.allNodeListInfo]
      : [...this.checkedList];
    this.searchListsSave = JSON.parse(JSON.stringify(this.srcData.data));
  }

  trackByFn(index: number, item: any): number {
    return item.id;
  }

  writeValue(val: Array<TiTableRowData>) {
    this.checkedInfo = val;
  }

  registerOnChange(fn: any) {
    this.propagateChange = fn;
  }

  validate(_: FormControl) {
    return this.checkedList.length
      ? null
      : { notHpcSelectNodes: { valid: false } };
  }

  registerOnTouched(fn: any) {
    this.propagateTunched = fn;
  }

  setDisabledState(status: boolean) {
    this.isSelectNodeDisabled = status;
  }

  private getPureNodelist(nodeList: Array<TiTableRowData>): HpcNodeInfo[] {
    return nodeList.map((nodeItem: any) => {
      const disabled =
        nodeItem.nodeStatus === TaskStatus.Off || this.isSelectNodeDisStash;
      const nickName = nodeItem.nickName;
      const node = nodeItem.nodeIp;
      const nodeState = nodeItem.nodeStatus;
      const nodeId = nodeItem.nodeId;
      const id = nodeItem.id;
      const params = {
        status: false,
      };
      return {
        ...nodeItem,
        node,
        disabled,
        nickName,
        nodeState,
        params,
        nodeId,
        id,
      };
    });
  }
}
