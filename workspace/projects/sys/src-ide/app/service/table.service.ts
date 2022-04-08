import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class TableService {

  constructor() { }

  /**
   * 将所有元素与遍历到的子数组中的元素合并为一个新数组返回
   */
  public flat(array: Array<any>) {
    const resp = [];
    const expandArray = (res, arr) => {
      arr.forEach(item => {
        if (Array.isArray(item)) {
          expandArray(res, item);
        } else {
          res.push(item);
        }
      });
    };

    expandArray(resp, array);
    return resp;
  }

  // -- 表格排序相关 --
  /**
   * 对表格数据进行排序
   */
  public sortTable(tableData: any[], columns: any[], prop: string, order: 'asc' | 'desc' | ''): void {
    const sort = (data, sortProp, sortOrder, compareType) => {
      if (!data.length) {
        return;
      }

      if (compareType === 'number') {  // 转换为number来排序（例：'100%', 'CPU100'）
        if (sortOrder === 'asc') {
          data.sort((a, b) => +a[sortProp].replace(/[^0-9]/ig, '') - +b[sortProp].replace(/[^0-9]/ig, ''));
        } else {
          data.sort((a, b) => +b[sortProp].replace(/[^0-9]/ig, '') - +a[sortProp].replace(/[^0-9]/ig, ''));
        }
      } else if (Object.prototype.toString.call(data[0][sortProp]) === '[object Object]') {  // 对象格式的数据，根据value排序
        if (sortOrder === 'asc') {
          data.sort((a, b) => a[sortProp].value - b[sortProp].value);
        } else {
          data.sort((a, b) => b[sortProp].value - a[sortProp].value);
        }
      } else if (typeof data[0][sortProp] === 'string' && isNaN(data[0][sortProp])) { // 值是纯字符串
        if (sortOrder === 'asc') {
          data.sort((a, b) => a[sortProp].localeCompare(b[sortProp]));
        } else {
          data.sort((a, b) => b[sortProp].localeCompare(a[sortProp]));
        }
      } else {
        if (sortOrder === 'asc') {
          data.sort((a, b) => (((typeof b[sortProp] === 'number') as any) - ((typeof a[sortProp] === 'number') as any))
          || (a[sortProp] > b[sortProp] ? 1 : -1));
        } else {
          data.sort((a, b) => (((typeof a[sortProp] === 'number') as any) - ((typeof b[sortProp] === 'number') as any))
          || (b[sortProp] > a[sortProp] ? 1 : -1));
        }
      }
    };
    const sortTableData = (data, sortProp, sortOrder, compareType) => {
      sort(data, sortProp, sortOrder, compareType);

      data.forEach(child => {
        if (child.children) {
          sortTableData(child.children, sortProp, sortOrder, compareType);
        }
      });
    };

    // 更新列的 sortStatus
    let column;
    // 转换为一维，因为有可能是多层表头
    this.flat(columns).forEach(item => {
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


  // -- 树表相关 --
  /**
   * 将有层级结构的树表数据扁平化
   * @param tableData tableData
   */
  getTreeTableArr(tableData) {
    const data = [];
    function addData(children) {
      children.forEach(child => {
        data.push(child);

        if (child.expand && child.children) {
          addData(child.children);
        }
      });
    }
    addData(tableData);

    return data;
  }
}
