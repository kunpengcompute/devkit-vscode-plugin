import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { RespCommon } from 'sys/src-com/app/domain';
import { LANGUAGE_TYPE, STATUS_CODE } from 'sys/src-com/app/global/constant';
import { HttpService, I18nService } from 'sys/src-com/app/service';
import { OptimizationTypeEnum, SuggestionSelectValue } from '../../../../domain';
import { TuninghelperStatusService } from 'sys/src-com/app/tuninghelper/tuninghelper-analysis/service/tuninghelper-status.service';
import { TabName } from '../../constant';
import { TreeReqParams, TreeRespData, TreeRespOptimizationData, TreeSugTab } from '../../domain';

@Component({
  selector: 'app-tree-root-detail',
  templateUrl: './tree-root-detail.component.html',
  styleUrls: ['./tree-root-detail.component.scss']
})
export class TreeRootDetailComponent implements OnInit {

  @Input() optimizationType: OptimizationTypeEnum;
  @Output() showPage = new EventEmitter<any>();

  public tabs: TreeSugTab[];
  public activeTab: TabName = TabName.Setting;
  public activeTabs: {
    [name in TabName]: TabName
  } = {
    setting: TabName.Setting,
    detail: TabName.Detail,
  };
  // 优化详情
  public optimizationData: TreeRespOptimizationData = {
    detail_data: {},
    threshold: [],
  };
  public i18n: any;

  /** 优化建议类型 */
  public optimizationTypes: {
    [name in OptimizationTypeEnum]: OptimizationTypeEnum
  } = {
    systemConfig: OptimizationTypeEnum.systemConfig,
    hotFunction: OptimizationTypeEnum.hotFunction,
    systemPerf: OptimizationTypeEnum.systemPerf,
    processPerf: OptimizationTypeEnum.processPerf,
  };
   // 指标说明
  public indicatorDesc = '';

  constructor(
    private http: HttpService,
    public statusService: TuninghelperStatusService,
    private i18nService: I18nService,
  ) {
    this.i18n = this.i18nService.I18n();
  }

  ngOnInit(): void {
    this.tabs = [
      {
        name: TabName.Setting,
        label: this.i18n.tuninghelper.treeDetail.thresholdSetting,
        isActive: true,
      },
      {
        name: TabName.Detail,
        label: this.i18n.tuninghelper.treeDetail.detail,
        isActive: false,
      }
    ];
  }

  /**
   * 获取阈值详情
   */
  public async getTreeRootOptimization(currTreeNodeId: any) {
    let params: TreeReqParams = {
      'node-id': this.statusService.nodeId,
      id: currTreeNodeId,
      'all-suggestion': this.statusService.suggestionSelect === SuggestionSelectValue.ThresholdFilterSuggestion
      ? false : true,
    };
    if (this.optimizationType === OptimizationTypeEnum.systemConfig) {
      params = {
        ...params,
        'service-type': this.statusService.getServiceType(),
      };
    }
    const url = `/tasks/${encodeURIComponent(this.statusService.taskId)}/optimization/expected-value/`;
    try {
      const resp: RespCommon<TreeRespData<TreeRespOptimizationData>> = await this.http.get(url, { params });
      if (resp.code === STATUS_CODE.SUCCESS) {
        const data = resp?.data?.optimization?.data;
        if (data && JSON.stringify(data) !== '{}') {
          this.optimizationData = resp.data.optimization.data;
          this.indicatorDesc = this.i18nService.currLang === LANGUAGE_TYPE.ZH
          ? this.optimizationData.sug_introduction_cn : this.optimizationData.sug_introduction_en;
        } else {
          this.optimizationData = {
            detail_data: {},
            threshold: [],
          };
        }
        this.showPage.emit({});
      }
    } catch (error) {
      this.optimizationData = {
        detail_data: {},
        threshold: [],
      };
      this.showPage.emit({});
    }
  }

  /**
   * tab改变
   * @param idx 下标
   */
   public activeChange(idx: number) {
    this.tabs.forEach((tab: TreeSugTab, index: number) => {
      tab.isActive = index === idx;
    });
    this.activeTab = this.tabs[idx].name;
  }

}
