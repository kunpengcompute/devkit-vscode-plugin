import {
  Component, OnInit, ComponentFactoryResolver, ViewChild,
  ComponentRef, ElementRef, ViewContainerRef,
  Renderer2, DoCheck, Input, AfterViewChecked
} from '@angular/core';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import { ServerNodeService } from './services/server-node.service';
import { ServerNodeComponent } from './components/server-node/server-node.component';
import { ServerNodeLigatureService } from './services/server-node-ligature.service';
import {
  GplotType, TwoNumber, TreeDirection, TreeNodeRef,
  GplotNode, GplotNodeInfo, GplotNodeData, GplotNodeType,
  GplotNodeTypeEnum, AnalysisScenarioEnum, TreeDirectionEnum
} from './classes/reference';
import { throttleTime } from 'rxjs/operators';
import { OpenNodeService } from 'projects/sys/src-web/app/core/home2/project-manage/services/open-node.service';

/**
 * 服务节点拓扑图组件
 *
 * @description
 * 根据后端服务器的节点数据，以平铺或关系图的方式展示节点之间的关系。
 * 通过 assemble 方法，在组件生命周期阶段 ngOnInit 开始装载节点——将 ServerNodeComponent 为模板，
 * 根据数据实例化之后，载入容器中：nameNodeContainer，dataNodeContainer。在装载完成后，在适当的条件下，
 * 会执行 ligature 方法，ligature 会根据数据判断是否生成连线。
 *
 * @input nodeId: 节点ID
 * @input taskId: 任务ID
 * @input nodeIP: 节点IP
 *
 * @usageNotes
 * 在此组件中，仅关注于 ServerNodeComponent 组件实例的装载和之后的“连线”。并不关心 ServerNodeComponent 组件的具体逻辑。
 * 同时，接口数据的处理由服务 ServerNodeService 提供。具体的 “连线” 生成的逻辑由服务 ServerNodeLigatureService 提供。
 */
@Component({
  selector: 'app-server-node-gplot',
  templateUrl: './server-node-gplot.component.html',
  styleUrls: ['./server-node-gplot.component.scss']
})
export class ServerNodeGplotComponent implements OnInit, DoCheck, AfterViewChecked {
  @ViewChild('nameNodeContainer', { static: true, read: ViewContainerRef }) nameNodeContainerRef: ViewContainerRef;
  @ViewChild('dataNodeContainer', { static: true, read: ViewContainerRef }) dataNodeContainerRef: ViewContainerRef;
  @ViewChild('gplotContainer', { static: true, read: ElementRef }) gplotElRef: ElementRef;
  @ViewChild('nameNodeEl', { static: true, read: ElementRef }) nameNodeElRef: ElementRef;
  @ViewChild('dataNodeEl', { static: true, read: ElementRef }) dataNodeElRef: ElementRef;
  @ViewChild('svgContainer', { static: true, read: ElementRef }) svgElRef: ElementRef;

  // 入参
  @Input() nodeId: number;
  @Input() taskId: number;
  @Input() taskName: string;

  // 拓扑图和节点相关
  public gplotType: GplotType;
  public nameNodeList: GplotNode[];
  public dataNodeList: GplotNode[];
  public allNodeList: GplotNode[];

  // 组件实例列表，用于记录
  public nameComponentRefList: ComponentRef<ServerNodeComponent>[] = [];
  public dataComponentRefList: ComponentRef<ServerNodeComponent>[] = [];

  // 拓扑图的渲染过程控制：doneLigatured——完成节点连线， doneAssembled——完成节点装载
  private doneLigatured = false;
  private doneAssembled = false;

  /** 因为 tab 页面的切换使用的 hidden 方式，所以需要判断页面是否处于 hidden === true 的状态，以避免dom塌缩的影响 */
  private atHiddenStatus = true;

  // 其他
  public i18n: any;
  private prevBoxWidth = 0;

  public childData: GplotNodeData;

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private serverNodeService: ServerNodeService,
    private ligatureService: ServerNodeLigatureService,
    private renderer: Renderer2,
    private i18nService: I18nService,
    private openNodeService: OpenNodeService
  ) {
    this.i18n = this.i18nService.I18n();
  }

  /**
   * 开始装载节点
   */
  ngOnInit() {
    this.assemble();
  }

  /**
   * 监控数据变化，当发现节点装载完成，不在hidden状态时，开始执行节点连线操作
   */
  ngDoCheck(): void {
    if (this.doneAssembled && !this.doneLigatured && !this.atHiddenStatus) {
      if (this.gplotType && this.gplotType.type === AnalysisScenarioEnum.BIG_DATA && this.gplotType.hasTopolopy) {
        this.ligature();
      }
      this.doneLigatured = true;
    }
  }

  /**
   * 通过监控Element（gplotElRef）的宽度由零到大于零的变化，监控视图变化 hidden: true -> false
   */
  ngAfterViewChecked(): void {
    const currentBoxWidth = $(this.gplotElRef.nativeElement).width();
    if (this.prevBoxWidth === 0 && currentBoxWidth > 0) { // 视图突变
      this.atHiddenStatus = false;
    }
    this.prevBoxWidth = currentBoxWidth;
  }

  /**
   * 装载节点，即是将节点对应的组件实例加入对应的DOM（nameNodeContainerRef, dataNodeContainerRef）中
   */
  public async assemble() {
    // 生成 节点 列表
    this.gplotType = await this.serverNodeService.getGplotType(this.taskId, this.nodeId);
    if (this.gplotType == null) { return; }
    if (this.gplotType.type === AnalysisScenarioEnum.BIG_DATA && this.gplotType.hasTopolopy) {
      this.nameNodeList = this.serverNodeService.getNameNodeList();
      this.dataNodeList = this.serverNodeService.getDataNodeList();
      this.nameNodeContainerRef.clear();
      for (const nameNode of this.nameNodeList) {
        const componentRef = this.loadComponent(nameNode, this.nameNodeContainerRef);
        this.nameComponentRefList.push(componentRef);
      }
      this.dataNodeContainerRef.clear();
      for (const dataNode of this.dataNodeList) {
        const componentRef = this.loadComponent(dataNode, this.dataNodeContainerRef);
        this.dataComponentRefList.push(componentRef);
      }
    } else {
      this.allNodeList = this.serverNodeService.getAllNodeList();
      this.nameNodeContainerRef.clear();
      for (const node of this.allNodeList) {
        this.loadComponent(node, this.nameNodeContainerRef);
      }
    }
    setTimeout(() => {
      // 装载完成
      this.doneAssembled = true;
    });
  }

  /**
   * 将已装载好的节点用线连接起来， 具体为：
   * 1. 获取节点的位置；
   * 2. 使用ServerNodeLigatureService服务计算出所有的连线所对应的SVGSVGElement；
   * 3. 将SVGSVGElement插入相应的DOM（svgElRef）中；
   */
  public ligature() {
    // 处理具名节点的SVGSVGElement
    const nameNodePosList: TwoNumber[] = [];
    for (const nameComponentRef of this.nameComponentRefList) {
      const pos: TwoNumber = (nameComponentRef.instance as ServerNodeComponent).getComponentPos('bottom');
      nameNodePosList.push(pos);
    }
    const nameLinkElement = this.genNodeLinkElement(nameNodePosList, GplotNodeTypeEnum.NAMENODE);
    this.renderer.appendChild(this.svgElRef.nativeElement, nameLinkElement);

    // 处理数据节点的SVGSVGElement
    const dataNodePosList: TwoNumber[] = [];
    for (const dataComponentRef of this.dataComponentRefList) {
      const pos: TwoNumber = (dataComponentRef.instance as ServerNodeComponent).getComponentPos('top');
      dataNodePosList.push(pos);
    }
    const dataLinkElement = this.genNodeLinkElement(dataNodePosList, GplotNodeTypeEnum.DATANODE);
    this.renderer.appendChild(this.svgElRef.nativeElement, dataLinkElement);
  }

  /**
   * 根据节点位置的列表， 计算其连线对应的 SVGSVGElement
   * @param nodePosList 节点位置的列表
   * @param nodeType 节点类型
   */
  private genNodeLinkElement(nodePosList: TwoNumber[], nodeType: GplotNodeType): SVGSVGElement {

    const nameNodeRect = this.nameNodeElRef.nativeElement.getBoundingClientRect();
    const dataNodeRect = this.dataNodeElRef.nativeElement.getBoundingClientRect();

    const parentPos: TwoNumber = nodeType === GplotNodeTypeEnum.NAMENODE
      ? [(nameNodeRect.left + nameNodeRect.right) / 2, nameNodeRect.bottom]
      : [(dataNodeRect.left + dataNodeRect.right) / 2, dataNodeRect.top];

    const direction: TreeDirection
      = nodeType === GplotNodeTypeEnum.NAMENODE ? TreeDirectionEnum.UP : TreeDirectionEnum.DOWN;

    const treeRef: TreeNodeRef = {
      trunkLen: 10,
      borderRadius: 0,
      parentPos: this.adjustCoordinate(parentPos) as TwoNumber,
      childenPos: this.adjustCoordinate(nodePosList) as TwoNumber[],
      direction
    };
    return this.ligatureService.getTreeSvgElement(treeRef);
  }

  /**
   * 将 component 载入 viewContainer 中
   * @param node 被载入的node
   * @param viewContainer node容器
   */
  private loadComponent(node: GplotNode, viewContainerRef: ViewContainerRef) {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(node.component);
    const componentRef = viewContainerRef.createComponent(componentFactory);
    const nodeInfo: GplotNodeInfo = {
      isFocusNode: this.taskName.includes(node.data.IP),
      isBigData: this.gplotType.type === AnalysisScenarioEnum.BIG_DATA,
      nodeData: node.data,
    };
    (componentRef.instance as ServerNodeComponent).nodeInfo = nodeInfo;
    (componentRef.instance as ServerNodeComponent).nodeClick
      .pipe(throttleTime(2000))
      .subscribe((nodeIp: string) => {
        this.openSomeNode(nodeIp);
      });
    return componentRef;
  }

  /**
   * 校准给定的位置，使之相对于 gplotElRef
   * @param posData 位置数据，可以是单个位置，也可以是位置列表
   */
  private adjustCoordinate(posData: TwoNumber | TwoNumber[]): TwoNumber | TwoNumber[] {
    const { left, top } = this.gplotElRef.nativeElement.getBoundingClientRect();
    if (Array.isArray(posData[0])) {
      const posList: TwoNumber[] = posData as TwoNumber[];
      return posList.map(it => [it[0] - left, it[1] - top]) as TwoNumber[];
    } else {
      const pos: TwoNumber = posData as TwoNumber;
      return [pos[0] - left, pos[1] - top];
    }
  }

  /**
   * 通知 home2 组件，打开某个节点
   * @param nodeIp 节点IP
   */
  private openSomeNode(nodeIp: string) {
    this.openNodeService.openNode({ taskId: this.taskId, nodeIp });
  }
}
