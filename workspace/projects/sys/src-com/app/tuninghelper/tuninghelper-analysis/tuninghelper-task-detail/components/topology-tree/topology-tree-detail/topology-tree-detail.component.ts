import { Component, Input, OnDestroy, OnInit, OnChanges, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { HyTheme, HyThemeService } from 'hyper';
import { Subscription } from 'rxjs';
import { ExplorerType, RespCommon } from 'sys/src-com/app/domain';
import { LANGUAGE_TYPE, STATUS_CODE } from 'sys/src-com/app/global/constant';
import { HttpService, I18nService } from 'sys/src-com/app/service';
import { ZoomBoxDirective } from 'sys/src-com/app/shared/directives/zoom-box/zoom-box.directive';
import {
  CpuTargetStatus,
  unitedOptimizationType,
  TargetThreshold,
  OptimizationTypeEnum,
  SuggestionSelectValue
} from '../../../domain';
import {
  CurrOptimization,
  TuningHelperRightDetail,
  TuningHelperRightService
} from '../../../service/tuninghelper-right.service';
import {
  TuninghelperStatusService
} from 'sys/src-com/app/tuninghelper/tuninghelper-analysis/service/tuninghelper-status.service';
import { NodeType } from '../constant';
import {
  AdoptedType,
  IOption,
  TreeReqParams,
  TreeRespData,
  ItreeIcon,
  ItreeNode,
  TreeMsgServiceDetail,
  TreeNodeRespData
} from '../domain';
import * as Util from 'sys/src-com/app/util';
import {
  TopologyTreeMessageData,
  TopologyTreeMessageDetail,
  TaskDetailMessageService,
  TopologyTreeMessageType,
} from '../../../service/topology-tree';
import { DomSanitizer } from '@angular/platform-browser';
import { TreeIcon } from '../constant/tree-icon';

const iconPrefix = 'image://';
const enum RendererType {
  SVG = 'svg',
  CANVAS = 'canvas'
}
@Component({
  selector: 'app-topology-tree-detail',
  templateUrl: './topology-tree-detail.component.html',
  styleUrls: ['./topology-tree-detail.component.scss']
})
export class TopologyTreeDetailComponent implements OnInit, OnChanges, OnDestroy {

  @Input() optimizationType: OptimizationTypeEnum;  // 优化类型
  @Input() currCoreView: CpuTargetStatus;
  @Input() cpuTarget: {
    currTarget: any;
    currThreshold: TargetThreshold;
  };
  @Input() isNumaView = false;

  @ViewChild('zoomBox') zoomBox: ZoomBoxDirective;

  public i18n: any;
  public treeOption: IOption = {
    animation: false,
    series: [],
  };  // option选项
  public treeOpts: {
    renderer: RendererType
  } = {
    renderer: RendererType.SVG,  // 渲染方式默认svg
  };
  public treeIcon: ItreeIcon;  // 节点图标
  public seriesData: Array<ItreeNode> = [];  // series data
  public imgArr: any[] = [];
  private echartsInstance: any;
  private nodeType: NodeType = NodeType.Root;  // 树图层级
  private serviceTypeChangeSub: Subscription;
  private subTopologyTree: Subscription;
  private perfLeafHeight = 90;  // 叶子节点高度
  private maxTreeDepth = 0;
  private currTheme: HyTheme = HyTheme.Light;
  private selectTreeNodeId: any;
  private explorerType: ExplorerType = ExplorerType.Chrome;
  private treeContainerHeight: number;  // 保存当前树图容器高度，避免更新树图引起的树图位置错位问题
  private treeContainerWidth: number;  // 设置当前树图容器宽度，避免切换页签时，树图加载出现短暂的抖动现象

  constructor(
    private http: HttpService,
    private i18nService: I18nService,
    private statusService: TuninghelperStatusService,
    private rightService: TuningHelperRightService,
    private elementRef: ElementRef,
    private themeServe: HyThemeService,
    private taskDetailMessageService: TaskDetailMessageService,
    private sanitizer: DomSanitizer,
  ) {
    this.i18n = this.i18nService.I18n();
  }

  ngOnInit(): void {

    this.explorerType = Util.judgeExplorer();
    if (this.explorerType === ExplorerType.IE) {  // IE
      this.treeOpts.renderer = RendererType.CANVAS;
    } else {
      this.treeOpts.renderer = RendererType.SVG;
    }

    // 消息服务监听
    this.listenServiceTypeChange();

    // 监听主题变化
    this.themeServe.subscribe((msg: HyTheme) => {
      this.currTheme = msg || HyTheme.Light;

      // 初始化树节点图标
      this.initTreeIcon();

      if (this.echartsInstance) {
        this.updateIcon(this.treeOption.series[0].data, this.selectTreeNodeId);  // 更新树节点图标
        this.getTreeOption();
        this.echartsInstance.clear();  // 先清空再重新渲染
        this.echartsInstance.setOption(this.treeOption);
      }
    });

    // 系统配置和热点函数
    if (this.optimizationType === OptimizationTypeEnum.systemConfig
      || this.optimizationType === OptimizationTypeEnum.hotFunction) {
      // 获取拓扑图数据
      this.getTreeData();
    }
  }

  /**
   * 初始化树节点图标
   */
  private initTreeIcon() {
    if (this.explorerType === ExplorerType.IE) {
      if (this.currTheme === HyTheme.Light) {
        this.treeIcon = {
          root: {
            normal: './assets/img/turnhelper-tree/root/png/status-normal.png',
            hover: './assets/img/turnhelper-tree/root/png/status-hover.png',
            active: './assets/img/turnhelper-tree/root/png/status-active.png',
          },
          middle: {
            normal: './assets/img/turnhelper-tree/middle/png/condition-normal.png',
            hover: './assets/img/turnhelper-tree/middle/png/condition-hover.png',
            active: './assets/img/turnhelper-tree/middle/png/condition-active.png',
          },
          leaf: {
            adopted: {
              normal: './assets/img/turnhelper-tree/leaf/png/suggestion-adopted-normal.png',
              hover: './assets/img/turnhelper-tree/leaf/png/suggestion-adopted-hover.png',
              active: './assets/img/turnhelper-tree/leaf/png/suggestion-adopted-active.png',
            },
            noAdopted: {
              normal: './assets/img/turnhelper-tree/leaf/png/suggestion-noAdopted-normal.png',
              hover: './assets/img/turnhelper-tree/leaf/png/suggestion-noAdopted-hover.png',
              active: './assets/img/turnhelper-tree/leaf/png/suggestion-noAdopted-active.png',
            }
          },
        };
      }
    } else {
      // web端使用image://url格式，每次hover节点都会重新请求图标，导致出现图标闪动现象
      // 所以树图symbol图标web端采用dataURI格式引入
      if (this.currTheme === HyTheme.Light) {
        this.treeIcon = {
          root: {
            normal: this.getdataURIBySvgStr(TreeIcon.root.normal),
            hover: this.getdataURIBySvgStr(TreeIcon.root.hover),
            active: this.getdataURIBySvgStr(TreeIcon.root.active),
          },
          middle: {
            normal: this.getdataURIBySvgStr(TreeIcon.middle.normal),
            hover: this.getdataURIBySvgStr(TreeIcon.middle.hover),
            active: this.getdataURIBySvgStr(TreeIcon.middle.active),
          },
          leaf: {
            adopted: {
              normal: this.getdataURIBySvgStr(TreeIcon.leaf.adopted.normal),
              hover: this.getdataURIBySvgStr(TreeIcon.leaf.adopted.hover),
              active: this.getdataURIBySvgStr(TreeIcon.leaf.adopted.active),
            },
            noAdopted: {
              normal: this.getdataURIBySvgStr(TreeIcon.leaf.noAdopted.normal),
              hover: this.getdataURIBySvgStr(TreeIcon.leaf.noAdopted.hover),
              active: this.getdataURIBySvgStr(TreeIcon.leaf.noAdopted.active),
            }
          },
        };
      } else {
        this.treeIcon = {
          root: {
            normal: './assets/img/turnhelper-tree/root/svg/status-normal-dark.svg',
            hover: './assets/img/turnhelper-tree/root/svg/status-hover-dark.svg',
            active: './assets/img/turnhelper-tree/root/svg/status-active-dark.svg',
          },
          middle: {
            normal: './assets/img/turnhelper-tree/middle/svg/condition-normal-dark.svg',
            hover: './assets/img/turnhelper-tree/middle/svg/condition-hover-dark.svg',
            active: './assets/img/turnhelper-tree/middle/svg/condition-active-dark.svg',
          },
          leaf: {
            adopted: {
              normal: './assets/img/turnhelper-tree/leaf/svg/suggestion-adopted-normal-dark.svg',
              hover: './assets/img/turnhelper-tree/leaf/svg/suggestion-adopted-hover-dark.svg',
              active: './assets/img/turnhelper-tree/leaf/svg/suggestion-adopted-active-dark.svg'
            },
            noAdopted: {
              normal: './assets/img/turnhelper-tree/leaf/svg/suggestion-noAdopted-normal-dark.svg',
              hover: './assets/img/turnhelper-tree/leaf/svg/suggestion-noAdopted-hover-dark.svg',
              active: './assets/img/turnhelper-tree/leaf/svg/suggestion-noAdopted-active-dark.svg'
            }
          },
        };
      }
    }
    const getNodeImg = (data: any) => {
      for (const key in data) {
        if (typeof data[key] === 'object' ) {
          getNodeImg(data[key]);
        } else {
          // bypassSecurityTrustUrl 解决unsafe:data:image/svg+xml;base64的问题
          this.imgArr.push(this.sanitizer.bypassSecurityTrustUrl(data[key]));
        }
      }
    };
    getNodeImg(this.treeIcon);
  }

  /**
   * 将SVG脚本字符串转换成dataURI图片格式
   * @param svgStr 图标
   * @returns dataURI图片格式
   */
   getdataURIBySvgStr(svgStr: string): string {
    const svg64 = btoa(unescape(encodeURIComponent(svgStr.trim())));
    const b64Start = 'data:image/svg+xml;base64,';
    return b64Start + svg64;
  }

  /**
   * 监听cpu指标和cpu状态改变
   * @param changes 输入项
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.currCoreView || (changes.cpuTarget && this.cpuTarget.currTarget && this.cpuTarget.currThreshold)) {
      // 获取拓扑图数据
      this.getTreeData();
    }

    // 切换numa视图
    if (changes.isNumaView) {
      if (this.isNumaView) {
        this.clearTree();
      } else {
        // 获取拓扑图数据
        this.getTreeData();
      }
    }
  }

  ngOnDestroy(): void {
    // 取消订阅
    this.serviceTypeChangeSub?.unsubscribe();
    this.subTopologyTree?.unsubscribe();
  }

  /**
   * 消息服务监听
   */
  private listenServiceTypeChange() {

    // 监听业务类型改变
    this.serviceTypeChangeSub = this.statusService.serviceTypeChange.subscribe({
      next: () => {
        this.getTreeData();
      }
    });

    // 拓扑树图消息监听
    this.subTopologyTree = this.taskDetailMessageService.getMessege({
      next: (message: TopologyTreeMessageDetail<TopologyTreeMessageData>) => {
        // 当前优化类型下的树图
        if (this.optimizationType === message?.data?.optimizationType) {
          switch (message.type) {
            // 取消选中节点
            case TopologyTreeMessageType.cancelSelectTreeNode:
              // 取消节点选中
              const data = this.treeOption.series[0].data;
              this.updateIcon(data, -1);

              // 更新树图
              this.echartsInstance.setOption(this.treeOption);
              break;

            // 设置阈值更新树图
            case TopologyTreeMessageType.updateTree:
              this.getTreeData();
              break;

            // 更新叶子节点图标
            case TopologyTreeMessageType.updateLeafNode:
              const seriesData = this.treeOption.series[0].data;
              this.updateIcon(seriesData, this.selectTreeNodeId, message.data.isAdopted);
              // 更新树图
              this.echartsInstance.setOption(this.treeOption);
              break;
            default:
              break;
          }
        }

        // 建议范围改变更新树图
        if (message.type === TopologyTreeMessageType.suggestionSelectChange) {
          this.getTreeData();
        }
      }
    });
  }

  /**
   * 获取树图数据
   */
  private async getTreeData() {
    let params: TreeReqParams = {
      'node-id': this.statusService.nodeId,
      'service-type': this.statusService.getServiceType(),
      'optimization-type': unitedOptimizationType[this.optimizationType],
      'all-suggestion': this.statusService.suggestionSelect === SuggestionSelectValue.ThresholdFilterSuggestion
      ? false : true,
    };
    if (this.optimizationType === OptimizationTypeEnum.systemPerf
      || this.optimizationType === OptimizationTypeEnum.processPerf) {
      params = {
        ...params,
        cpu: this.cpuTarget.currTarget,
        'cpu-status': this.currCoreView,
      };
    }
    try {
      const resp: RespCommon<TreeRespData<any>> = await this.http.get(
        `/tasks/${encodeURIComponent(this.statusService.taskId)}/optimization/suggestion_list/`,
        { params }
      );
      if (resp.code === STATUS_CODE.SUCCESS) {
        const data = resp?.data?.optimization?.data;
        if (data && JSON.stringify(data) !== '{}') {
          this.initCharts(resp.data.optimization.data);
        } else {
          // 返回为空，清空树图数据
          this.clearTree();
        }
      }
    } catch (error) {
      // 请求失败,清空树图数据
      this.clearTree();
    }
  }

  /**
   * 清空树图
   */
  private clearTree() {
    this.seriesData = [];
    this.getTreeOption();

    // 更新右侧详情
    const type = this.optimizationType === OptimizationTypeEnum.systemPerf ?
      CurrOptimization.sysTreeSug : CurrOptimization.processTreeSug;
    const data: TreeMsgServiceDetail = {
      isGetTreeSug: true,
      optimizationType: this.optimizationType,
      isEmptyTree: true,
    };
    const message: TuningHelperRightDetail<any> = {type, data, };
    this.rightService.sendMessage(message);
  }
  /**
   * 初始化树图
   * @param data 返回的节点数据 obj
   */
  private initCharts(data: any) {

    this.echartsInstance?.clear();  // 清空树图再渲染

    // 获取series data
    const nodeArr: any[] = [];
    const ids: Array<number> = Object.keys(data).map(Number);
    const list: Array<any> = Object.values(data);
    for (const arr of list) {
      arr.forEach((obj: object) => {
        nodeArr.push(obj);
      });
    }
    this.seriesData = this.getSeriesData(nodeArr, ids, 0);

    // 获取树的深度
    this.maxTreeDepth = this.getTreeDepth(this.seriesData[0]);

    // 获取treeOption
    const leafNum: number = nodeArr.length - (ids.length - 1);
    this.getTreeOption();

    setTimeout(() => {
      this.setContainerHeight(leafNum);
    }, 0);

    // 获取期望值
    this.getSuggestionDetail(this.seriesData[0]);
  }

  /**
   * 获取树图节点数据
   * @param arr 所有节点
   * @param ids 除叶子节点之外的所有节点id
   * @param pid 父节点id  根节点id默认为0
   */
  private getSeriesData(arr: Array<TreeNodeRespData>, ids: Array<number>, pid: number) {
    const result: Array<ItreeNode> = [];
    let children: Array<ItreeNode> = [];
    arr.forEach(item => {
      if (item.pid === pid) {
        if (pid === 0) {  // 根节点
          const obj: ItreeNode = {
            id: item.id,
            name: this.i18nService.currLang === LANGUAGE_TYPE.ZH ? item.indicator_describe_cn
            : item.indicator_describe_en,
            symbol: iconPrefix + this.treeIcon.root.active,
            nodeType: NodeType.Root,
            isActive: true,
          };
          children = this.getSeriesData(arr, ids, item.id);  // 获取子节点
          if (children.length) {
            obj.children = children;
          }
          result.push(obj);
        } else if (ids.includes(item.id)) {  // 中间节点
          const obj: ItreeNode = {
            id: item.id,
            name: this.i18nService.currLang === LANGUAGE_TYPE.ZH ? item.indicator_describe_cn
            : item.indicator_describe_en,
            symbol: iconPrefix + this.treeIcon.middle.normal,
            nodeType: NodeType.Middle,
            isActive: false,
          };
          children = this.getSeriesData(arr, ids, item.id);  // 获取子节点
          if (children.length) {
            obj.children = children;
          }
          result.push(obj);
        } else {  // 叶子节点
          let name = '';
          if (this.optimizationType === OptimizationTypeEnum.hotFunction) {
            name = this.i18nService.currLang === LANGUAGE_TYPE.ZH ? item.indicator_describe_cn
            : item.indicator_describe_en;
          } else {
            name = this.i18nService.currLang === LANGUAGE_TYPE.ZH ? item.sug_cn : item.sug_en;
          }
          const obj: ItreeNode = {
            id: item.id,
            isAdopted: item.is_accepted,
            name,
            symbol: item.is_accepted === AdoptedType.isAdopted ? iconPrefix + this.treeIcon.leaf.adopted.normal
            : iconPrefix + this.treeIcon.leaf.noAdopted.normal,
            nodeType: NodeType.Leaf,
            isActive: false,
          };
          result.push(obj);
        }
      }
    });
    return result;
  }

  /**
   * 获取树的最大深度
   * @param node 树节点
   * @returns 树的最大深度
   */
  private getTreeDepth(node: ItreeNode) {
    if (!node.children || node.children.length === 0) {
      return 1;
    }
    const maxChildrenDepth: Array<number> = node.children.map(child => this.getTreeDepth(child));
    return 1 + Math.max.apply(null, maxChildrenDepth);
  }
  /**
   * 获取treeOption
   */
  private getTreeOption() {
    this.treeOption = {
      animation: false,
      series: [
        {
          type: 'tree',
          orient: 'horizontal',
          roam: false,
          top: 20,
          bottom: 20,
          right: this.maxTreeDepth > 3 ? '25%' : '30%',
          left: this.maxTreeDepth > 3 ? '5%' : '10%',
          symbolSize: 52,
          label: {
            color: this.currTheme === HyTheme.Light ? '#222222' : '#E8E8E8',
            fontSize: 14,
            position: 'right',
            width: 200,
            overflow: 'break',
          },
          lineStyle: {
            color: this.currTheme === HyTheme.Light ? '#CED3E0' : '#525252',
            width: 1,
            curveness: 0.5,
          },
          itemStyle: this.explorerType === ExplorerType.Firefox ? {} : {
            shadowColor: this.currTheme === HyTheme.Light ? 'rgba(0, 0, 0, 0.07)' : 'rgba(0, 0, 0, 0.2)',
            shadowBlur: this.currTheme === HyTheme.Light ? 10 : 4,
          },
          // true：首次点击触发点击事件，第二次点击节点缩放
          expandAndCollapse: false,
          leaves: {  // 叶子节点
            label: {
              position: 'right',
            },
          },
          emphasis: {
            lineStyle: {
              color: this.currTheme === HyTheme.Light ? '#CED3E0' : '#525252'
            }
          },
          data: this.seriesData,
        }]
    };
  }

  /**
   *  动态设置tree高度
   * @param leafNum 叶子节点个数
   */
   private setContainerHeight(leafNum: number) {
    if (this.treeContainerHeight === undefined) {
      this.treeContainerHeight = this.elementRef.nativeElement.querySelector('.tree-container').offsetHeight;
      this.treeContainerWidth = this.elementRef.nativeElement.querySelector('.tree-container').offsetWidth;
    }
    const treeDom = this.elementRef.nativeElement.querySelector('#echarts-tree');
    const currentHeight = this.perfLeafHeight * leafNum;
    const newHeight = Math.max(currentHeight, this.treeContainerHeight);
    treeDom.style.height = newHeight + 'px';

    // 分析任务时，选择其他页签，任务分析完成treeContainerWidth 为0
    if (this.maxTreeDepth === 3 ) {  // 树图宽度未超出容器宽度也要设置宽度，不然从热点函数或其他页签切换回来，树图加载会出现抖动现象
      treeDom.style.width = this.treeContainerWidth ? this.treeContainerWidth + 'px' : '1000px';
    }
    if (this.maxTreeDepth === 4 ) {
      treeDom.style.width = '1200px';
    }
    if (this.maxTreeDepth > 4 ) {
      treeDom.style.width = '1480px';
    }
    if (currentHeight > this.treeContainerHeight) {
      treeDom.style.transform = `translate(0px, -${(currentHeight - this.treeContainerHeight) / 2}px) scale(1, 1)`;
    } else {
      treeDom.style.transform = `translate(0px, 0px) scale(1, 1)`;
    }
  }

  /**
   * 获取优化建议详情
   * @param paramData 节点参数
   */
   private getSuggestionDetail(treeNode: ItreeNode) {
    const {nodeType, name, id} = treeNode;
    const type = this.optimizationType === OptimizationTypeEnum.systemPerf ?
      CurrOptimization.sysTreeSug : CurrOptimization.processTreeSug;
    const data: TreeMsgServiceDetail = {
      isGetTreeSug: true,
      optimizationType: this.optimizationType,
      treeNodeType: nodeType,
      treeNodeName: name,
      treeNodeId: id,
      isEmptyTree: false,
    };
    const message: TuningHelperRightDetail<TreeMsgServiceDetail> = {type, data, };
    this.rightService.sendMessage(message);
  }

  /**
   * 处理鼠标事件
   */
  private handleMouseEvent() {
    this.echartsInstance.on('mouseover', (param: any) => {
      if (!param.data.isActive) {
        this.nodeType = param.data.nodeType;
        if (this.nodeType === NodeType.Leaf) {  // 叶子节点
          param.data.symbol = param.data.isAdopted === AdoptedType.isAdopted
          ? iconPrefix + this.treeIcon[this.nodeType].adopted.hover
          : iconPrefix + this.treeIcon[this.nodeType].noAdopted.hover;
        } else {
          param.data.symbol = iconPrefix + this.treeIcon[this.nodeType].hover;
        }
        this.echartsInstance.setOption({});  // 更新树图
      }
    });

    this.echartsInstance.on('mouseout', (param: any) => {
      if (!param.data.isActive) {
        this.nodeType = param.data.nodeType;
        if (this.nodeType === NodeType.Leaf) {
          param.data.symbol = param.data.isAdopted === AdoptedType.isAdopted
          ? iconPrefix + this.treeIcon[this.nodeType].adopted.normal
          : iconPrefix + this.treeIcon[this.nodeType].noAdopted.normal;
        } else {
          param.data.symbol = iconPrefix + this.treeIcon[this.nodeType].normal;
        }
        this.echartsInstance.setOption({});  // 更新树图
      }
    });

    this.echartsInstance.on('click', (param: any) => {
      if (param.data.isActive) {
        return;
      }
      // 其他节点恢复默认图标
      const data = this.treeOption.series[0].data;
      this.updateIcon(data, param.data.id);
      this.selectTreeNodeId = param.data.id;

      // 更新树图
      this.echartsInstance.setOption(this.treeOption);

      // 获取优化建议详情
      this.getSuggestionDetail(param.data);
    });
  }

  /**
   * 更新除id节点之外的几点图标
   * @param id 选中的节点的id
   * @param data 树节点数组
   */
  private updateIcon(data: any, id: number, isAdopted?: AdoptedType) {
    for (const node of data) {
      this.nodeType = node.nodeType;
      if (node.id === id) {
        if (isAdopted !== undefined) {  // 更新叶子节点图标
          node.isAdopted = isAdopted;
        }
        if (this.nodeType === NodeType.Leaf) {  // 叶子节点
          node.symbol = node.isAdopted === AdoptedType.isAdopted
          ? iconPrefix + this.treeIcon[this.nodeType].adopted.active
          : iconPrefix + this.treeIcon[this.nodeType].noAdopted.active;
        } else {
          node.symbol = iconPrefix + this.treeIcon[this.nodeType].active;
        }
        node.isActive = true;
        if (this.explorerType !== ExplorerType.Firefox) {
          node.itemStyle = {
            shadowColor: 'rgba(0, 103, 255, 0.14)',
            shadowOffsetY: 2,
            shadowBlur: 16,
          };
        }
      } else {
        if (this.nodeType === NodeType.Leaf) {  // 叶子节点
          node.symbol = node.isAdopted === AdoptedType.isAdopted
          ? iconPrefix + this.treeIcon[this.nodeType].adopted.normal
          : iconPrefix + this.treeIcon[this.nodeType].noAdopted.normal;
        } else {
          node.symbol = iconPrefix + this.treeIcon[this.nodeType].normal;
        }
        node.isActive = false;
        if (this.explorerType !== ExplorerType.Firefox) {
          node.itemStyle = {
            shadowColor: 'rgba(0, 0, 0, 0.07)',
            shadowBlur: 10,
          };
        }
      }
      if (node.children) {
        this.updateIcon(node.children, id, isAdopted);
      }
    }
  }

  /**
   * 返回echarts实例
   * @param ec charts实例
   */
  public onChartInit(ec: any) {
    this.echartsInstance = ec;
    this.handleMouseEvent();
  }
}
