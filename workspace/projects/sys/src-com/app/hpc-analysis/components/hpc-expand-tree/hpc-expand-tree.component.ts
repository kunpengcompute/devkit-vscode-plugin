import {
  Component, ContentChild, ElementRef, Input, Renderer2, TemplateRef, OnInit,
} from '@angular/core';
import { Util, TiTreeNode, TiBaseComponent } from '@cloud/tiny3';

@Component({
  selector: 'app-hpc-expand-tree',
  templateUrl: './hpc-expand-tree.component.html',
  styleUrls: ['./hpc-expand-tree.component.scss']
})
export class HpcExpandTreeComponent extends TiBaseComponent implements OnInit {
  /**
   * Tree组件使用的数据
   */
  @Input() data: Array<TiTreeNode>;

  /**
   * @ignore
   * 获取到用户自定义的模板
   */
  @ContentChild(TemplateRef, { static: true }) itemTemplate: TemplateRef<any>;
  /**
   * @ignore
   * 模板中使用，高亮的选中项
   */
  public actived: TiTreeNode;
  constructor(
    protected elementRef: ElementRef,
    protected renderer2: Renderer2,
  ) {
    super(elementRef, renderer2);
  }

  /**
   * 初始化
   */
  ngOnInit() {
    super.ngOnInit();
    // 内部使用的数据，用于记录用户的操作改变
    // 仅在初始化时挡非法数据，是不够的。建议去除。但因为要兼容已发出的版本，所以不去除。
    this.data = !Util.isArray(this.data) ? [] : this.data;
  }

  /**
   * @ignore
   * @description 点击父节点图标执行的逻辑
   * @param  node 当前节点数据
   */
  public onClickPnodeIcon(node: TiTreeNode, event: MouseEvent): void {
    // 阻止事件冒泡：点击父节点图标无高亮样式
    event.stopPropagation();

    // 1.当前节点是展开状态
    if (node.expanded) {
      node.expanded = false;
    } else {
      node.expanded = true;
    }
  }

  /**
   * @ignore
   */
  public trackByFn(index: number, node: any): any {
    return index;
  }

  /**
   * @ignore
   * 判断是否为叶子节点
   */
  public isLeaf(node: TiTreeNode): boolean {
    if (Util.isArray(node.children) && node.children.length > 0) {
      return false;
    } else {
      return true;
    }

  }
}
