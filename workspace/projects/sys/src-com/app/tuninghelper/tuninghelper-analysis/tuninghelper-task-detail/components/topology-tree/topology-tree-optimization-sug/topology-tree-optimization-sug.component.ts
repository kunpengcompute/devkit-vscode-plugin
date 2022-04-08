import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { I18nService } from 'sys/src-com/app/service';
import { OptimizationTypeEnum } from '../../../domain';
import {
  TuningHelperRightDetail,
  TuningHelperRightService } from '../../../service/tuninghelper-right.service';
import { TuninghelperStatusService } from 'sys/src-com/app/tuninghelper/tuninghelper-analysis/service/tuninghelper-status.service';
import { NodeType } from '../constant';
import { TreeMsgServiceDetail } from '../domain';
import { I18n } from 'sys/locale';
import { LANGUAGE_TYPE } from 'sys/src-com/app/global/constant';

@Component({
  selector: 'app-topology-tree-optimization-sug',
  templateUrl: './topology-tree-optimization-sug.component.html',
  styleUrls: ['./topology-tree-optimization-sug.component.scss']
})
export class TopologyTreeOptimizationSugComponent implements OnInit, OnDestroy {

  @Input() optimizationType: OptimizationTypeEnum;

  @ViewChild('treeRootOptimization') treeRootOptimization: any;

  public currNodeType: NodeType = NodeType.Root;  // 树节点类型  用于控制显示根节点、中间节点和叶子节点的优化建议
  public currNodeId: any;  // 树节点id
  public currNodeName = '';  // 树节点名称
  public nodeTypes: {
    [name in NodeType]: NodeType
  } = {
    root: NodeType.Root,
    middle: NodeType.Middle,
    leaf: NodeType.Leaf
  };
  public i18n: any;
  public hasData = false;
  private subRight: Subscription;
  public showPage = false;
  public treeNodeType: NodeType;  // 传到子组件的节点类型

  constructor(
    private rightService: TuningHelperRightService,
    public statusService: TuninghelperStatusService,
    private i18nService: I18nService,
  ) {
    this.i18n = this.i18nService.I18n();
  }

  ngOnInit(): void {
    // 获取详情页数据
    this.getSugDetail();
  }

  ngOnDestroy(): void {
    // 取消订阅
    this.subRight?.unsubscribe();
  }

  /**
   * 获取优化建议详情数据
   */
  private getSugDetail() {
    this.subRight = this.rightService.subscribe({
      next: (message: TuningHelperRightDetail<TreeMsgServiceDetail>) => {
        // 当前优化建议类型对应的树节点优化建议详情
        if (this.optimizationType === message.data.optimizationType && message.data.isGetTreeSug) {
          if (message.data.isEmptyTree) {
            this.hasData = false;
          } else {
            const {treeNodeType, treeNodeName, treeNodeId } = message.data;
            this.treeNodeType = treeNodeType;

            if (this.optimizationType === OptimizationTypeEnum.systemConfig && treeNodeType === this.nodeTypes.root) {
              // 系统配置阈值设置
              if (this.i18nService.currLang === LANGUAGE_TYPE.ZH) {
                this.currNodeName = treeNodeName + I18n.tuninghelper.treeDetail.thresholdSetting;
              } else {
                this.currNodeName = treeNodeName + ' ' + I18n.tuninghelper.treeDetail.thresholdSetting;
              }
            } else {
              this.currNodeName = treeNodeName;
            }
            this.currNodeId = treeNodeId;
            this.hasData = true;

            // 根节点获取优化建议
            if (treeNodeType === this.nodeTypes.root) {
              // 热点函数不显示阈值设置
              if (this.optimizationType === OptimizationTypeEnum.hotFunction) {
                this.hasData = false;
                return;
              }
              setTimeout(() => {
                this.treeRootOptimization?.getTreeRootOptimization(treeNodeId);
              }, 50);
            }
          }
        }
      }
    });
  }

  /**
   * 获取到节点优化建议之后再显示页面
   */
  public onShowPage() {
    this.currNodeType = this.treeNodeType;
  }
}
