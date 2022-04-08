import {
  Component, ContentChild, Input, OnInit, Output, EventEmitter, TemplateRef,
  ViewChildren, OnChanges, SimpleChanges, ElementRef, NgZone, AfterViewInit, Renderer2,
} from '@angular/core';
import { TiTableRowData, TiTableSrcData, TiTreeNode } from '@cloud/tiny3';
import { CommonTableData, CommonTreeNode, PaginationType } from '../../domain';
import { SortStatus, TableService } from 'sys/src-com/app/service';
import { PopDirective } from 'sys/src-com/app/shared/directives/pop/pop.directive';
import { Cat } from 'hyper';

@Component({
  selector: 'app-common-table',
  templateUrl: './common-table.component.html',
  styleUrls: ['./common-table.component.scss']
})
export class CommonTableComponent implements OnInit, OnChanges, AfterViewInit {
  @Output() trigger = new EventEmitter<any>();
  @Input()
  set commonTableData(data: CommonTableData) {
    if (data) {
      this.initTableData(data);
    }
  }
  // 是否对传入的数据序列性
  @Input() isSeriality = true;
  /**
   * 是否有详情展开
   */
  @Input() isDetails: boolean;
  /**
   * 是否有筛选图标
   */
  @Input() isFilters: boolean;
  @Output() filterColumn = new EventEmitter<Array<CommonTreeNode>>();
  @Input() isPagination = true;
  @Input() paginationType: PaginationType = 'default';
  @Input() showGotoLink = true;

  /** 搜索组件 */
  @ViewChildren('processSearchPop') processSearchPop: any;
  /**
   * @ignore
   * 获取到用户自定义的模板
   */
  @ContentChild(TemplateRef, { static: true }) itemTemplate: TemplateRef<any>;

  /** 原始数据的一个备份 */
  private tableData: TiTableRowData[];

  /** 原始搜索数据的一个备份 */
  private searchTableData: TiTableRowData[];

  /**
   * 过滤后的数据的备份，为了修复
   * tiny表格的搜索功能在第一次搜索之后会修改srcData
   * 导致后续搜索结果异常的问题
   */
  private filterData: TiTableRowData[];
  public columnsTree: Array<CommonTreeNode>;
  public columns: Array<CommonTreeNode> = [];
  public srcData: TiTableSrcData = {
    data: [], // 源数据
    state: {
      searched: false,
      sorted: false,
      paginated: false
    }
  };
  public displayed: Array<TiTableRowData> = [];
  public searchWords: Array<any> = [];
  public searchKeys: Array<string> = []; // 设置过滤字段
  public searchWordsSave: {[key: string]: string} = {};


  public maxLevel = 0;
  public allColumns: Array<any> = [];
  public tempColspanArr: Array<any> = [];
  private isFirstRightExpand = true;
  private currSortKey = '';  // 记录当前排序的列，以便搜索的时候也按照此列排序
  private currSortWay: SortStatus;  // 记录当前排序的方式
  private isNeedMergeRow = false;  // 是否需要行合并
  private isNeedSetColumnWidth = false;  // 是否需要动态设置列宽
  private isHeadDown = false;  // 鼠标是否点击thead
  private tableElement: HTMLElement;
  /**
   * 分页参数
   */
  public pageNo = 1;
  public pageSize = {
    options: [10, 20, 50, 100],
    size: 10
  };
  public hasScroll = false;

  constructor(
    public tableService: TableService,
    private el: ElementRef,
    private zone: NgZone,
    private renderer: Renderer2,
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    /** 由于tipagination 不能检测type的更新 所以只能手动触发更新分页类型 */
    if (changes.paginationType) {  // 分页类型改变
      if (!this.isFirstRightExpand) {  // 第一次加载不需要更新
        this.isPagination = false;
        setTimeout(() => {
          this.isPagination = true;
        });
      } else {
        this.isFirstRightExpand = false;
      }
    }
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    if (this.isFilters) {
      this.zone.runOutsideAngular(() => { // 避免不停触发变化检测
        const thead = this.el.nativeElement.querySelector('.ti3-table-fixed-head table thead');
        this.renderer.listen(thead, 'mousedown', (event: MouseEvent) => {
          this.isHeadDown = true;
        });
        this.renderer.listen(thead, 'mouseup', (event: MouseEvent) => {
          this.isHeadDown = false;
        });
        this.renderer.listen(thead, 'mousemove', (event: MouseEvent) => {
          if (this.isHeadDown) {
            this.getScroll();
          }
        });
      });
    }
  }

  /**
   * 初始化分页
   */
  private initPaginition() {
    this.pageNo = 1;
    this.pageSize.size = 10;
  }

  /**
   * 初始化表格数据
   * @param data 父组件传过来的表格数据
   */
  private async initTableData(data: CommonTableData) {
    await this.initPaginition();   // 需要异步处理，解决切换分页后，下拉框选择其他表格时，表格数据更新，但界面未更新的问题
    this.tableData = data.srcData.data.slice();
    this.searchTableData = data.srcData.data.slice();
    this.filterData = this.tableData;
    if (this.isSeriality) {
      this.srcData = JSON.parse(JSON.stringify(data.srcData));  // 使用json系列化，不然会改变传值data
    } else {
      this.srcData = data.srcData;
    }
    this.columnsTree = data.columnsTree;
    this.isNeedSetColumnWidth = data.isNeedSetColumnWidth;
    this.isNeedMergeRow = data.isNeedMergeRow;
    this.collationHeaderData(true);
    if (data.isNeedMergeRow) {
      this.onPageUpdate();
    }
    if (this.isFilters) {
      this.tableElement = this.el.nativeElement.querySelector('.ti3-table-container');
      setTimeout(() => {
        this.getScroll();
      });
    }
  }

  /**
   * 判断表格是否有滚动条
   */
  private getScroll() {
    if (this.tableElement.scrollWidth > this.tableElement.clientWidth) {
      this.hasScroll = true;
    } else {
      this.hasScroll = false;
    }
  }

  /**
   * 处理表头数据
   */
  public collationHeaderData(isInit: boolean) {
    if (isInit) {
      this.maxLevel = 0;
      this.getMaxLevel(this.columnsTree, 0);
      this.allColumns = [];
      for (let i = 0; i <= this.maxLevel; i++) {
        this.allColumns.push([]);
      }
    }
    this.columns = [];
    if (this.isNeedSetColumnWidth) {
      this.setColumnsWidth(this.columnsTree);
    }
    this.constructTableHeaderSpan(this.columnsTree, this.maxLevel, isInit);
    if (isInit) {
      this.initTableSearchKey();
    }
  }

  /**
   * 初始化表格searchKeys
   */
  public initTableSearchKey() {
    this.searchKeys = [];
    this.searchWords = [];
    this.columns.forEach((column: any) => {
      if (column.searchKey) {
        if (this.searchKeys.indexOf(column.searchKey) === -1) {
          this.searchKeys.push(column.searchKey);
          this.searchWordsSave[column.searchKey] = '';
          this.searchWords.push(this.searchWordsSave[column.searchKey]);
        }
      }
    });
  }

  /**
   * 筛选器筛选表头
   * @param node 当前选中的节点
   */
  public selectFn(node: TiTreeNode): void {
    this.collationHeaderData(false);
    this.filterColumn.emit(this.columnsTree);
  }

  /**
   * 表头搜索弹框点击搜索事件监控
   * @param searchText 搜索文本
   * @param column 搜索列
   */
  public onTableHeaderSearch(searchText?: any, column?: any) {
    if (column) {
      const index = this.searchKeys.indexOf(column.searchKey);
      if (index > -1 && this.searchWords.length > index) {
        this.searchWordsSave[column.searchKey] = searchText ?? '';
        this.searchWords[index] = this.searchWordsSave[column.searchKey];
      }
      if (index > -1 && this.processSearchPop._results?.length > index) {
        const curSearchPop: PopDirective = this.processSearchPop._results[index];
        curSearchPop.hide();
      }
    }
    let tempData: Array<any> = [];
    if (column.searchByCompare) {
      const uniqueKey: string = this.columns.find(item => item.uniqueKey)?.key;
      const newFilterData: any = {};
      this.filterData.forEach((item: any) => {
        if (newFilterData[item[uniqueKey]]) {
          newFilterData[item[uniqueKey]].push(item);
        } else {
          newFilterData[item[uniqueKey]] = [item];
        }
      });
      Object.keys(newFilterData).forEach((key: any) => {
        const item = newFilterData[key];
        let add = true;
        this.searchWords.forEach((searchWord: any, wordIndex: number) => {
          const searchKey = this.searchKeys[wordIndex];
          if (!add) { return; }
          add = item.some((n: any) => {
            if (typeof n[searchKey] === 'string') {
              return n[searchKey].toLowerCase().indexOf(searchWord.trim().toLowerCase()) > -1;
            }
            if (Cat.isObj(n[searchKey])) {
              return (n[searchKey].value ?? '').toLowerCase().indexOf(searchWord.trim().toLowerCase()) > -1;
            }
            return false;
          });
        });
        if (add) {
          tempData = tempData.concat(item);
        }
      });
    } else {
      this.filterData.forEach((item: any) => {
        let add = true;
        this.searchWords.forEach((searchWord: any, wordIndex: number) => {
          const searchKey = this.searchKeys[wordIndex];
          if (!item[searchKey]) {
            if (!['', '--'].includes(searchWord.trim().toLowerCase())) {
              add = false;
            }
          }
          if (typeof item[searchKey] === 'string') {
            if (item[searchKey].toLowerCase().indexOf(searchWord.trim().toLowerCase()) === -1) {
              add = false;
            }
          }
          if (Cat.isObj(item[searchKey])) {
            if ((item[searchKey].value ?? '').toLowerCase().indexOf(searchWord.trim().toLowerCase()) === -1) {
              add = false;
            }
          }
        });
        if (add) {
          tempData.push(item);
        }
      });
    }
    this.pageNo = 1;  // 搜索时页号置为1，解决点击其他页号搜索为空的问题
    setTimeout(() => {  // 需要异步更新
      this.srcData.data = tempData;
      if (this.currSortKey) {
        this.tableService.sortCommotableTable(this.srcData.data, this.columns,
          this.currSortKey, this.currSortWay, this.searchTableData);
      }
      // 保存搜索的数据，以便排序时候还原
      this.searchTableData = JSON.parse(JSON.stringify(this.srcData.data));
    }, 0);
  }

  public onFilterSelect(selected: any, column: any) {
    setTimeout(() => {
      const onSelect = column.filterConfig.select;
      if (typeof onSelect === 'function') {
        const filterData = onSelect(selected, column, this.columns, this.tableData);
        if (filterData) {
          this.srcData.data = filterData;
        }
      } else {
        this.srcData.data = this.tableData.filter((rowData: TiTableRowData) => {
          // 遍历所有列
          for (const columnData of this.columns) {
            if (!columnData.filterConfig?.selected) {
              continue;
            }
            const labelKey = columnData.filterConfig.labelKey || 'label';
            if (!columnData.filterConfig.multiple) {
              return columnData.filterConfig.selected[labelKey] === rowData[columnData.key];
            } else if (columnData.filterConfig.selected.length) {
              const index: number = columnData.filterConfig.selected.findIndex((item: any) => {
                return item[labelKey] === rowData[columnData.key];
              });
              if (index < 0) {
                return false;
              }
            }
          }
          return true;
        });
      }
      this.filterData = this.srcData.data.slice();
      column.filterConfig.filterStatus = this.getFilteredStatus(column.filterConfig);
      this.onTableHeaderSearch();
    }, 0);
  }

  private getFilteredStatus(filterConfig: any): boolean {
    const labelKey = filterConfig.labelKey || 'label';
    if (filterConfig.multiple) {
      if (filterConfig.selectAll) {
        return filterConfig.selected && filterConfig.selected[labelKey] !== 'all';
      }
      return filterConfig.selected && filterConfig.selected.length;
    } else {
      return Boolean(filterConfig.selected && !filterConfig.selected.isAll);
    }
  }

  /**
   * 点击查看详情
   * @param key key
   * @param value value
   * @param bool i
   */
  public viewDetails(key: string, value: any, bool: boolean, row: any) {
    if (!bool) { return; }
    this.trigger.next({key, value, row});
  }

  /**
   * 计算最大子代等级
   * @param data 原始数据
   * @param depth 初始等级
   */
  public getMaxLevel(data: any, depth: any) {
    for (const column of data) {
      column.level = depth;
      this.maxLevel = depth > this.maxLevel ? depth : this.maxLevel;
      column.childrenNum = 0;
      if (column.hasOwnProperty('children') && column.children.length) {
        this.getMaxLevel(column.children, depth + 1);
        column.childrenNum = column.children.length;
      }
    }
  }

  /**
   * 构造每一个表头的列宽
   * @param data 原始数据
   * @param max 表头最大层级
   */
  public constructTableHeaderSpan(data: any, max: any, isInit: boolean, isNeedBefore?: boolean) {
    data.forEach((column: CommonTreeNode, index: number) => {
      if (column.level > 0) {
        column.isNeedBefore = isNeedBefore;
      }
      if (column.checked === undefined) {  // undefined为未传checked的情况 checked赋初值为true
        column.show = column.checked = true;
      } else {
        column.show = Boolean(column.checked);
      }
      if (index === 0) {
        if (column.label === 'local interface' || column.label === 'interface name') {
          column.searchKey = column.key;
          column.sortKey = '';
        }
      }
      column.show = Boolean(column.checked);
      if (column.hasOwnProperty('children') && column.children.length) {
        if (column.expanded === undefined) {
          column.expanded = true;
        }
        const tempColspanArr: any[] = [];
        this.getCheckedAllChildNode(column.children, tempColspanArr);
        column.colspan = tempColspanArr.length;
        column.rowspan = 1;
        if (column.level === 0) {
          this.constructTableHeaderSpan(column.children, max, isInit, index !== data.length - 1);
        } else {
          this.constructTableHeaderSpan(column.children, max, isInit, isNeedBefore);
        }
      } else {
        column.colspan = 1;
        column.rowspan = max - column.level + 1;
      }
      if (isInit) {
        this.allColumns[column.level].push(column);
      } else {
        this.allColumns[column.level].forEach((item: TiTreeNode) => {
          if (item.label === column.label && item.key === column.key) {
            item = column;
          }
        });
      }
      if (column.colspan === 1 && column.childrenNum === 0) {
        this.columns.push(column);
      }
    });
  }

  /**
   * 设置列宽
   * @param columnsTreeArr 源表格列数据
   */
  private setColumnsWidth(columnsTreeArr: Array<CommonTreeNode>) {
    columnsTreeArr.forEach(column => {
      if (column.widthType === 'px' && column.children?.length) {
        column.width = this.getParentColumnWidth(column.children);
      }
    });
  }

  /**
   * 获取父级列宽
   * @param columns 子列
   * @returns 列宽
   */
  private getParentColumnWidth(columns: Array<CommonTreeNode>): string {
    let width = 0;
    const getWidth = (columnArr: Array<CommonTreeNode>, w: number) => {
      columnArr.forEach((column: CommonTreeNode) => {
        if (column.checked) {
          width += parseFloat(column.width) + w;
          if (column.children?.length) {
            getWidth(column.children, width);
          }
        }
      });
    };
    getWidth(columns, width);

    return width + 'px';
  }

  /**
   * 计算子节点数量
   * @param data 数据源
   * @param nodeArr 所有节点的载体
   */
  public getCheckedAllChildNode(data: any, nodeArr: any[]) {
    for (const column of data) {
      if (column.hasOwnProperty('children') && column.children.length) {
        this.getCheckedAllChildNode(column.children, nodeArr);
      } else {
        if (column.checked || column.checked === undefined) {  // undefined为未传checked的情况 checked赋初值为true
          column.checked = true;
          nodeArr.push(column);
        }
      }
    }
  }

  /**
   * 处理表格排序
   */
   public handleSort(sort: SortStatus, sortKey: string, compareType?: string) {
    this.currSortWay = sort;
    if (sort === 'asc' || sort === 'desc') {
      this.currSortKey = sortKey;
    } else {
      this.currSortKey = '';
    }
    this.tableService.sortCommotableTable(
      this.srcData.data, this.columns, sortKey, sort, this.searchTableData, compareType);
  }

  /**
   * 分页更新
   * @param event TiPaginationEvent
   */
  async onPageUpdate(): Promise<void> {
    if (this.isNeedMergeRow) {
      const col = this.columns[0].key;
      setTimeout(() => {
        this.tableService.mergeTableRow(this.displayed, [col]);  // 行合并
      });
    }
  }
}
