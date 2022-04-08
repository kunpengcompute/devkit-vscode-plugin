import { Injectable } from '@angular/core';
import { LANGUAGE_TYPE } from 'sys/src-com/app/global/constant';
import { I18nService } from 'sys/src-com/app/service/i18n.service';
import { CommonTableData, CommonTreeNode } from 'sys/src-com/app/shared/domain';
import { CpuIndicator, IndicatorDesc, IndicatorDetail, MultiTableData, RelavantFormItem } from '../domain';

@Injectable({
  providedIn: 'root'
})
export class TreeOptimizationSugService {

  constructor(
    private i18nService: I18nService,
  ) { }

  /**
   * 获取相关配置、性能指标信息
   * @param relavantForm 表单数据
   * @param data 数据
   * @returns 文本表单显示的数组
   */
  public getRelavantDataForm(relavantForm: Array<RelavantFormItem>, data: Array<IndicatorDetail>) {
    data.forEach(item => {
      let name = '';
      let desc = '';
      let value = '';
      if (this.i18nService.currLang === LANGUAGE_TYPE.ZH) {
        name = item.indicator_cn.replace(/\(\%\)/g, '');
        desc = item.desc_cn;
      } else {
        name = item.indicator_en.replace(/\(\%\)/g, '');
        desc = item.desc_en;
      }
      value = (item.indicator_en.includes('(%)') || item.indicator_cn.includes('(%)')) ? item.value + '%' : item.value;
      relavantForm.push({ name, value, desc });
    });
  }

  /**
   * 获取单层表格数据
   * @param table 表格显示数据
   * @param cpuIndicator CpuIndicator
   * @param isNeedSort 默认需要有排序
   */
  public getRelavantDataTable(table: CommonTableData, cpuIndicator: CpuIndicator | MultiTableData,
                              isNeedSort: boolean = true) {
    const { data_list = [], desc = [] } = cpuIndicator;
    // 表格数据
    table.srcData.data = data_list;

    // 获取表格列字段
    const getColumms = (columns: IndicatorDesc[], columnName: 'indicator_cn' | 'indicator_en',
                        tip: 'desc_cn' | 'desc_en') => {
      columns.forEach((item: IndicatorDesc) => {
        const column: CommonTreeNode = {
          key: item.indicator,
          label: item[columnName] ? item[columnName] : item.indicator,
          tip: item[tip],
        };
        // pid表格
        if (item.indicator === 'pid') {
          Object.assign(column, { searchKey: item.indicator });
        }
        table.columnsTree.push(column);
      });
    };
    if (this.i18nService.currLang === LANGUAGE_TYPE.ZH) {
      getColumms(desc, 'indicator_cn', 'desc_cn');
    } else {
      getColumms(desc, 'indicator_en', 'desc_en');
    }

    if (isNeedSort) {
      table.columnsTree.forEach(item => Object.assign(item, {sortKey: item.key}));
    }
  }

  /**
   * 获取双层表头表格data和columns
   * @param table 表格显示数据
   * @param tableObj MultiTableData
   */
  public getDoubleHeadTableData(table: CommonTableData, tableObj: MultiTableData) {
    const { data_list = [], desc = [], table_name = '' } = tableObj;
    // 表格数据
    table.srcData.data = data_list;

    // 遍历处理表格列字段
    if (this.i18nService.currLang === LANGUAGE_TYPE.ZH) {
      this.loopColumnsTree(table_name, desc, 'indicator_cn', 'desc_cn');
    } else {
      this.loopColumnsTree(table_name, desc, 'indicator_en', 'desc_en');
    }
    table.columnsTree = desc;
    table.columnsTree[0].disabled = true;
  }

  /**
   * 返回表格列
   * @param tableName 表格名称：sub_collumn（展开详情的表格：PID）、process_memory_affinity（内存亲和性表格）
   * @param columns 后端返回的表格列desc
   * @param columnName 表格列显示名称
   * @param tip 表格列提示
   */
  private loopColumnsTree(tableName: string, columns: IndicatorDesc[], columnName: 'indicator_cn' | 'indicator_en',
                          tip: 'desc_cn' | 'desc_en') {
    columns.forEach((column: IndicatorDesc & CommonTreeNode, index: number) => {
      if (!column.children) {
        Object.assign(
          column,
          {
            key: column.indicator,
            label: column[columnName] ? column[columnName] : column.indicator,
            tip: column[tip],
            checked: true,
          }
        );
        // pid表格
        if (column.indicator === 'pid') {
          Object.assign(column, { searchKey: column.indicator });
        }
        // pid展开详情
        if (tableName === 'sub_collumn') {
          if (column.indicator !== 'command') {
            Object.assign(column, { sortKey: column.indicator });
          }
        }
      } else {
        Object.assign(
          column,
          {
            label: column.indicator,
            checked: true,
            expanded: true,
          }
        );
        this.loopColumnsTree(tableName, column.children, columnName, tip);
      }
    });
  }
}

