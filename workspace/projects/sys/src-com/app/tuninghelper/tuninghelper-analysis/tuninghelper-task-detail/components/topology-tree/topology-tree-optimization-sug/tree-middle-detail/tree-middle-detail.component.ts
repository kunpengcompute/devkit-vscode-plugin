import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { RespCommon } from 'sys/src-com/app/domain';
import { LANGUAGE_TYPE, STATUS_CODE } from 'sys/src-com/app/global/constant';
import { HttpService, I18nService, TableService } from 'sys/src-com/app/service';
import { Cat } from 'hyper';
import { OptimizationTypeEnum, SuggestionSelectValue } from '../../../../domain';
import { TuninghelperStatusService } from 'sys/src-com/app/tuninghelper/tuninghelper-analysis/service/tuninghelper-status.service';
import { NodeType } from '../../constant';
import {
  CpuIndicator,
  IndicatorDetail,
  TreeReqParams,
  TreeRespData,
  RelavantFormItem,
  Threshold,
  TreeRespOptimizationData,
  MultiTableData
} from '../../domain';
import { TreeOptimizationSugService } from '../tree-optimization-sug.service';
import { CommonTableData, CommonTreeNode } from 'sys/src-com/app/shared/domain';
import { TiTableRowData, TiTableSrcData } from '@cloud/tiny3';

@Component({
  selector: 'app-tree-middle-detail',
  templateUrl: './tree-middle-detail.component.html',
  styleUrls: ['./tree-middle-detail.component.scss']
})
export class TreeMiddleDetailComponent implements OnInit, OnChanges {

  @Input() currTreeNodeType: NodeType;
  @Input() currTreeNodeId: number;
  @Input() optimizationType: OptimizationTypeEnum;

  @Output() showPage = new EventEmitter<any>();
  // 保存当前节点id，与传入的id进行比较，避免再次重新请求
  private currNodeId: number;
  // 阈值详情
  public thresholdDetail: RelavantFormItem[] = [];
  /** 采集值 文本表单形式 */
  public collectedValueForm: RelavantFormItem[] = [];

  /** 采集值 表格形式 */
  // 相关配置
  public relavantConfigTable: CommonTableData = {
    columnsTree: ([] as Array<CommonTreeNode>),
    displayed: [] as Array<CommonTableData>,
    srcData: {
      data: [] as Array<TiTableRowData>,
      state: {
        searched: false,
        sorted: false,
        paginated: false
      },
    } as TiTableSrcData,
  };
  // 相关配置 多个表格显示
  public relavantConfigMultiTableList: Array<CommonTableData> = [];
  // 相关性能指标
  public relavantIndicatorTable: CommonTableData = {
    columnsTree: ([] as Array<CommonTreeNode>),
    displayed: [] as Array<CommonTableData>,
    srcData: {
      data: [] as Array<TiTableRowData>,
      state: {
        searched: false,
        sorted: false,
        paginated: false
      },
    } as TiTableSrcData,
  };
  // 相关性能指标 多个表格显示
  public relavantIndicatorMultiTableList: Array<CommonTableData> = [];
  public i18n: any;
  // 指标说明
  public indicatorDesc = '';

  constructor(
    public statusService: TuninghelperStatusService,
    private http: HttpService,
    private i18nService: I18nService,
    private sugService: TreeOptimizationSugService,
    public tableService: TableService,
  ) {
    this.i18n = this.i18nService.I18n();
  }

  ngOnInit(): void {
  }

  // 监听数据变化
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.currTreeNodeId) {
      if (this.currTreeNodeType === NodeType.Middle) {
        // 获取数据
        this.getTreeMiddleOptimization();
      }
    }
  }

  /**
   * 判断是否有采集值
   */
  get hasCollectedValue() {
    return this.collectedValueForm.length || this.relavantConfigTable.srcData.data.length
      || this.relavantIndicatorTable.srcData.data.length || this.relavantConfigMultiTableList.length
      || this.relavantIndicatorMultiTableList.length;
  }

  /**
   * 获取阈值和采集值详情
   */
  private async getTreeMiddleOptimization() {
    const params: TreeReqParams = {
      'node-id': this.statusService.nodeId,
      id: this.currTreeNodeId,
      'all-suggestion': this.statusService.suggestionSelect === SuggestionSelectValue.ThresholdFilterSuggestion
        ? false : true,
    };
    const url = `/tasks/${encodeURIComponent(this.statusService.taskId)}/optimization/expected-value/`;
    try {
      const resp: RespCommon<TreeRespData<TreeRespOptimizationData>> = await this.http.get(url, { params });
      this.clearData();
      if (resp.code === STATUS_CODE.SUCCESS) {
        const data = resp?.data?.optimization?.data;
        if (data && JSON.stringify(data) !== '{}') {
          this.getMiddleSugDetail(data);
        }
      }
      this.showPage.emit({});
    } catch (error) {
      this.clearData();
      this.showPage.emit({});
    }
  }

  /**
   * 清空数据
   */
  private clearData() {
    this.thresholdDetail = [];
    this.collectedValueForm = [];
    this.relavantConfigTable = {
      columnsTree: [],
      displayed: [],
      srcData: {
        data: [],
        state: {
          searched: false,
          sorted: false,
          paginated: false
        },
      },
    };
    this.relavantIndicatorTable = {
      columnsTree: [],
      displayed: [],
      srcData: {
        data: [],
        state: {
          searched: false,
          sorted: false,
          paginated: false
        },
      },
    };
    this.relavantConfigMultiTableList = [];
    this.relavantIndicatorMultiTableList = [];
  }
  /**
   * 获取中间点数据详情
   * @param data 后端返回的数据
   */
  getMiddleSugDetail(data: TreeRespOptimizationData) {
    // 指标说明
    this.indicatorDesc = this.i18nService.currLang === LANGUAGE_TYPE.ZH
      ? data.sug_introduction_cn : data.sug_introduction_en;
    this.indicatorDesc = this.indicatorDesc.trim();
    if (this.indicatorDesc.length > 0) {
      if (this.indicatorDesc.charAt(this.indicatorDesc.length - 1) === '）') {
        this.indicatorDesc = this.indicatorDesc.substr(0, this.indicatorDesc.length - 1);
      }
    }
    // 获取阈值详情
    if (data.threshold.length) {
      this.thresholdDetail = this.getThresholdData(data.threshold);
    }

    // 获取采集值
    if (data.detail_data && JSON.stringify(data.detail_data) !== '{}') {
      const { relavant_config = [], relavant_indicator = [] } = data.detail_data;

      if (Cat.isArr(relavant_config)) {
        this.sugService.getRelavantDataForm(this.collectedValueForm, relavant_config as Array<IndicatorDetail>);
      }

      if (Cat.isObj(relavant_config)) {
        const { form_list = [], multi_data_list = [] } = relavant_config as CpuIndicator;
        if (form_list.length) {
          this.sugService.getRelavantDataForm(this.collectedValueForm, form_list as Array<IndicatorDetail>);
        }
        if (multi_data_list.length) {
          // 多个表格情况
          multi_data_list.forEach((tableObj: MultiTableData) => {
            this.getMultiTableList(this.relavantConfigMultiTableList, tableObj);
          });
        } else {
          // 只有一个表格
          this.sugService.getRelavantDataTable(this.relavantConfigTable, relavant_config as CpuIndicator);
        }
      }

      if (Cat.isArr(relavant_indicator)) {
        this.sugService.getRelavantDataForm(this.collectedValueForm, relavant_indicator as Array<IndicatorDetail>);
      }

      if (Cat.isObj(relavant_indicator)) {
        const { form_list = [], multi_data_list = [] } = relavant_indicator as CpuIndicator;
        if (form_list.length) {
          this.sugService.getRelavantDataForm(this.collectedValueForm, form_list as Array<IndicatorDetail>);
        }
        if (multi_data_list.length) {
          // 多个表格情况
          multi_data_list.forEach((tableObj: MultiTableData) => {
            this.getMultiTableList(this.relavantIndicatorMultiTableList as CommonTableData[], tableObj);
          });
        } else {
          // 只有一个表格
          this.sugService.getRelavantDataTable(this.relavantIndicatorTable, relavant_indicator as CpuIndicator);
        }
      }
    }
  }

  /**
   * 获取单层表格的数据
   * @param tableList 多个单层表格组成的数组
   * @param tableObj 返回的表格数据
   */
  private getMultiTableList(tableList: Array<CommonTableData>, tableObj: MultiTableData) {
    const tableData: CommonTableData = {
      columnsTree: ([] as Array<CommonTreeNode>),
      displayed: [],
      srcData: {
        data: [],
        state: {
          searched: false,
          sorted: false,
          paginated: false
        },
      },
      title: this.i18nService.currLang === LANGUAGE_TYPE.ZH ? tableObj.title_cn : tableObj.title_en,
      // 对应显示多层表头的表格
      tableName: tableObj.table_name,
    };
    if (tableObj.table_name === 'sub_collumn') {
      // 展开详情的表格
      this.sugService.getDoubleHeadTableData(tableData, tableObj as MultiTableData);
      tableData.isDetails = true;
      tableData.isFilters = true;
    } else if (tableObj.table_name === 'process_memory_affinity') {
      // 内存亲和性 需要行合并的表格
      this.sugService.getRelavantDataTable(tableData, tableObj as MultiTableData, false);
      const col = tableObj.desc[0].indicator;
      // 行合并
      this.tableService.mergeTableRow(tableData.srcData.data, [col]);
      tableData.isNeedMergeRow = true;
    } else {
      this.sugService.getRelavantDataTable(tableData, tableObj as MultiTableData);
    }
    tableList.push(tableData);
  }

  /**
   * 获取阈值信息
   * @param data 数据
   * @returns 数组
   */
  private getThresholdData(data: Array<Threshold>) {
    return data.map((item: Threshold) => {
      let name = '';
      let desc = '';
      if (this.i18nService.currLang === LANGUAGE_TYPE.ZH) {
        name = item.indicator_cn ? item.indicator_cn.replace(/\(\%\)/g, '') : item.indicator;
        desc = item.desc_cn;
      } else {
        name = item.indicator_en ? item.indicator_en.replace(/\(\%\)/g, '') : item.indicator;
        desc = item.desc_en;
      }
      return {
        name,
        value: item.indicator_cn.includes('(%)') ? item.expected_value + '%' : item.expected_value,
        desc,
      };
    });
  }
}
