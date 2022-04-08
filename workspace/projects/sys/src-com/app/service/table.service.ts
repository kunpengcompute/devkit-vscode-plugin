import { Injectable } from '@angular/core';
import { TiTableColumns } from '@cloud/tiny3';

export type SortStatus = 'asc' | 'desc' | '' | 'none';

@Injectable({
  providedIn: 'root'
})

export class TableService {

  constructor() { }

  // 将所有元素与遍历到的子数组中的元素合并为一个新数组返回
  public flat(array: any) {
    const res: any = [];
    const expandArray = (resp: any, arr: any) => {
      arr.forEach((item: any) => {
        if (Array.isArray(item)) {
          expandArray(resp, item);
        } else {
          res.push(item);
        }
      });
    };

    expandArray(res, array);
    return res;
  }

  // -- 表格排序相关 --
  /**
   * 对表格按number进行排序时，对排序数值做统一处理
   * @param value 排序数值
   * @param sortStatus 排序数值
   */
  private transformValueWhenSortByNumber(value: any, sortStatus: SortStatus): number {
    // 值为'NA'时，不论升序还是降序都在最后
    if (['NA', '__', '--'].includes(value)) {
      return sortStatus === 'asc' ? Infinity : -Infinity;
    }
    // 值为字符串时，提取排序字段中的数值，比如：'100%', 'CPU100'
    if (typeof value === 'string') {
      return parseFloat(value.replace(/[^-\d.]/gi, ''));
    }
    return value;
  }

  // 对表格数据进行排序
  public sortTable(tableData: any[], columns: any[], prop: string, order: SortStatus): void {
    const sort = (data: any, sortProp: any, sortOrder: any, compareType: any) => {
      if (!data.length) {
        return;
      }

      if (compareType === 'number') {  // 转换为number来排序（例：'100%', 'CPU100'）
        if (sortOrder === 'asc') {
          data.sort((a: any, b: any) => {
            return this.transformValueWhenSortByNumber(a[sortProp], sortOrder)
              - this.transformValueWhenSortByNumber(b[sortProp], sortOrder);
          });
        } else {
          data.sort((a: any, b: any) => {
            return this.transformValueWhenSortByNumber(b[sortProp], sortOrder)
              - this.transformValueWhenSortByNumber(a[sortProp], sortOrder);
          });
        }
      } else if (Object.prototype.toString.call(data[0][sortProp]) === '[object Object]') {  // 对象格式的数据，根据value排序
        if (sortOrder === 'asc') {
          data.sort((a: any, b: any) => a[sortProp].value - b[sortProp].value);
        } else {
          data.sort((a: any, b: any) => b[sortProp].value - a[sortProp].value);
        }
      } else if (typeof data[0][sortProp] === 'string' && isNaN(data[0][sortProp])) { // 值是纯字符串
        if (sortOrder === 'asc') {
          data.sort((a: any, b: any) => a[sortProp].localeCompare(b[sortProp]));
        } else {
          data.sort((a: any, b: any) => b[sortProp].localeCompare(a[sortProp]));
        }
      } else {
        if (sortOrder === 'asc') {
          data.sort((a: any, b: any) => (((typeof b[sortProp] === 'number') as any)
          - ((typeof a[sortProp] === 'number') as any)) || (a[sortProp] > b[sortProp] ? 1 : -1));
        } else {
          data.sort((a: any, b: any) => (((typeof a[sortProp] === 'number') as any)
          - ((typeof b[sortProp] === 'number') as any)) || (b[sortProp] > a[sortProp] ? 1 : -1));
        }
      }
    };
    const sortTableData = (data: any, sortProp: any, sortOrder: any, compareType: any) => {
      sort(data, sortProp, sortOrder, compareType);

      data.forEach((child: any) => {
        if (child.children) {
          sortTableData(child.children, sortProp, sortOrder, compareType);
        }
      });
    };

    // 更新列的 sortStatus
    let column: any;
    // 转换为一维，因为有可能是多层表头
    this.flat(columns).forEach((item: any) => {
      if ((item.sortKey || item.prop) === prop) {
        item.sortStatus = order;
        column = item;
      } else {
        item.sortStatus = '';
      }
    });

    /**
     * 清除排序
     * 1、怎么做：生成表格数据的时候，index字段表示原始索引，用来清除排序
     * 2、为什么不使用表格数据深拷贝：深拷贝不会实时同步树表的展开状态等
     */
    if (order === '') {
      sortTableData(tableData, 'index', 'asc', undefined);
    } else {
      sortTableData(tableData, prop, order, column.compareType);
    }
  }

  /**
   * 对commonTable表格数据进行排序
   * @param tableData 当前表格数据
   * @param columns 表格列
   * @param prop 排序的列
   * @param order 排序方式
   * @param originData 排序之前的表格数据
   * @param compareType 排序类型，按number or string 排序
   */
  public sortCommotableTable(tableData: any[], columns: any[],
                             prop: string, order: SortStatus, originData: any[], compareType?: string): void {
    const sort = (data: any, sortProp: any, sortOrder: any) => {
      if (!data.length) {
        return;
      }
      if (compareType && compareType === 'string'){
        if (sortOrder === 'asc') {
          data.sort((a: any, b: any) => a[sortProp].localeCompare(b[sortProp]));
        } else {
          data.sort((a: any, b: any) => b[sortProp].localeCompare(a[sortProp]));
        }
        return;
      }
      if (compareType === 'number') {  // 转换为number来排序（例：'100%', 'CPU100'）
        if (sortOrder === 'asc') {
          data.sort((a: any, b: any) => {
            return this.transformValueWhenSortByNumber(a[sortProp], sortOrder)
              - this.transformValueWhenSortByNumber(b[sortProp], sortOrder);
          });
        } else {
          data.sort((a: any, b: any) => {
            return this.transformValueWhenSortByNumber(b[sortProp], sortOrder)
              - this.transformValueWhenSortByNumber(a[sortProp], sortOrder);
          });
        }
        return;
      }
      if (sortOrder === 'asc') {  // 升序
        data.sort((a: any, b: any) => {
          // 数值比较 包括小数和百分数
          if (parseFloat(a[sortProp]).toString() !== 'NaN' && parseFloat(b[sortProp]).toString() !== 'NaN') {
            // 两个都是数值
            return parseFloat(a[sortProp]) - parseFloat(b[sortProp]);
          } else if (parseFloat(a[sortProp]).toString() !== 'NaN' && parseFloat(b[sortProp]).toString() === 'NaN') {
            // a[sortProp]为数值 b[sortProp]非数值 a[sortProp]排在前面
            return -1;
          } else if (parseFloat(a[sortProp]).toString() === 'NaN' && parseFloat(b[sortProp]).toString() !== 'NaN') {
            // a[sortProp]为非数值 b[sortProp]数值 b[sortProp]排在前面
            return 1;
          } else {  // 字符串比较
            if (a[sortProp] > b[sortProp]) {
              return 1;
            }
            if (a[sortProp] < b[sortProp]) {
              return -1;
            }
            return 0;
          }
        });
      } else {  // 降序
        data.sort((a: any, b: any) => {
          // 数值比较 包括小数和百分数 parseFloat 转换形如PID100会为NaN
          if (parseFloat(a[sortProp]).toString() !== 'NaN' && parseFloat(b[sortProp]).toString() !== 'NaN') {
            return parseFloat(b[sortProp]) - parseFloat(a[sortProp]);
          } else if (parseFloat(a[sortProp]).toString() !== 'NaN' && parseFloat(b[sortProp]).toString() === 'NaN') {
            // a[sortProp]为数值 b[sortProp]非数值 a[sortProp]排在前面
            return -1;
          } else if (parseFloat(a[sortProp]).toString() === 'NaN' && parseFloat(b[sortProp]).toString() !== 'NaN') {
            // a[sortProp]为非数值 b[sortProp]数值 b[sortProp]排在前面
            return 1;
          } else {  // 字符串比较
            if (a[sortProp] > b[sortProp]) {
              return -1;
            }
            if (a[sortProp] < b[sortProp]) {
              return 1;
            }
            return 0;
          }
        });
      }
    };
    const sortTableData = (data: any, sortProp: any, sortOrder: any) => {
      sort(data, sortProp, sortOrder);

      data.forEach((child: any) => {
        // childNotSort 值为true是表示children列表不排序
        if (child.children && !child.childNotSort) {
          sortTableData(child.children, sortProp, sortOrder);
        }
      });
    };

    // 更新列的 sortStatus
    columns.forEach((column: TiTableColumns) => {
      if (column.sortKey === prop) {
        column.sortStatus = order;
      } else {
        column.sortStatus = '';
      }
    });

    /**
     * 清除排序
     * 1、怎么做：生成表格数据的时候，index字段表示原始索引，用来清除排序
     * 2、为什么不使用表格数据深拷贝：深拷贝不会实时同步树表的展开状态等
     */
    if (order === '') {  // 清除排序返回原始表格数据
      tableData.splice(0, tableData.length, ...originData);
    } else {
      sortTableData(tableData, prop, order);
    }
  }

  // -- 树表相关 --
  // 将有层级结构的树表数据扁平化
  getTreeTableArr(tableData: any) {
    const data: any = [];
    function addData(children: any) {
      children.forEach((child: any) => {
        data.push(child);

        if (child.expand && child.children) {
          addData(child.children);
        }
      });
    }
    addData(tableData);

    return data;
  }

  /**
   * 对表格的cols列进行行合并处理
   * @param list 表格数据
   * @param cols 需要合并的项
   */
   mergeTableRow(list: Array<any>, cols: Array<string>): Array<any> {
    list.forEach(item => {
      item.mergeRowSpan = {};  // 保存合并项合并的行数
      item.showTd = {};  // 合并的字段是否显示
    });
    cols.forEach(key => {
      let rowSpan = 1;
      list[0].mergeRowSpan[key] = 1;
      list[0].showTd[key] = true;
      list.reduce((pre, cur) => {
        if (pre[key] === cur[key]) {  // 合并key相同的项
          rowSpan++;
          pre.mergeRowSpan[key] = rowSpan;
          pre.showTd[key] = true;
          cur.mergeRowSpan[key] = 1;
          cur.showTd[key] = false;
          return pre;
        } else {
          rowSpan = 1;
          cur.mergeRowSpan[key] = rowSpan;
          cur.showTd[key] = true;
          return cur;
        }
      });
    });
    return list;
  }
}
