import {
  Directive, ElementRef, Input, ComponentRef, Renderer2, OnChanges,
  ComponentFactoryResolver, Injector, OnInit, EmbeddedViewRef, ApplicationRef,
  SimpleChange
} from '@angular/core';
import { NoDataComponent } from './component/no-data/no-data.component';
import { NoDataOption } from './reference';

/**
 * @description
 * 使用时，指令会自动在 host 元素中添加 NoDataComponent 组件，通过给简单的赋值来控制显示与否。
 * 也可以通过给简单的配置来控制 NoDataComponent 中的显示样式。
 *
 * @input appNoData 控制无数据视图的显示与否
 * @input noDataOption 无数据视图显示的样式的配置
 *
 * @usageNotes
 * 该指令会对 host 元素产生副作用：在 host 元素的样式中，当 position === 'static' 为真时，
 * 将其值改为：'relative'。
 *
 * @example
 * <host-element [appNoData]="false | true"></host-element>
 * @example
 * <host-element
 *  [appNoData]="false | true"
 *  [noDataOption]="{ width: '100px', height: '100px', text: 'xxx' }">
 * </host-element>
 */
@Directive({
  selector: '[appNoData]'
})
export class NoDataDirective implements OnInit, OnChanges {
  /** 控制 NoDataComponent 的显示与否 */
  @Input('appNoData') noDataShow: boolean;

  /** NoDataComponent 组件显示的样式的配置 */
  @Input() noDataOption: NoDataOption;

  /** NoDataComponent的组件引用 */
  private componentRef: ComponentRef<NoDataComponent>;

  constructor(
    private el: ElementRef,
    private componentFactoryResolver: ComponentFactoryResolver,
    private injector: Injector,
    private renderer: Renderer2,
    private applicationRef: ApplicationRef,
  ) { }

  /**
   * 初始化
   */
  ngOnInit() {
    this.create();
  }

  /**
   * 监控 Input 参数的变化
   * @param changes 变化的 Input 参数
   */
  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    for (const propName of Object.keys(changes)) {
      switch (propName) {
        case 'noDataShow':
          this.noDataShow === true ? this.show() : this.hidden();
          break;
        case 'noDataOption':
          const optionTmp: NoDataOption = changes[propName].currentValue;
          if (optionTmp && this.componentRef) {
            this.componentRef.instance.option = optionTmp;
          }
          break;
        default:
      }
    }
  }

  /**
   * 展示组件内容
   */
  private show() {
    if (this.componentRef != null) {
      this.componentRef.instance.show();
    }
  }

  /**
   * 隐藏组件内容
   */
  private hidden() {
    if (this.componentRef != null) {
      this.componentRef.instance.hidden();
    }
  }

  /**
   * 在 host 中创建一个 nodata 的节点
   */
  private create() {
    // 如果 host 中的样式属性 position === static 为真时，将其值修改为 relative , 注意：这样做有副作用
    if ($(this.el.nativeElement).css('position').trim() === 'static') {
      $(this.el.nativeElement).css('position', 'relative');
    }

    const factory = this.componentFactoryResolver.resolveComponentFactory(NoDataComponent); // 生成 ComponentFactory
    this.componentRef = factory.create(this.injector); // 创建一个新的 NoDataComponent
    const embeddedView: EmbeddedViewRef<NoDataComponent>
    = this.componentRef.hostView as EmbeddedViewRef<NoDataComponent>; // NoDataComponent 的视图实例

    this.componentRef.instance.option = this.noDataOption; // 给 NoDataComponent 的实例中的option参数赋值
    this.componentRef.instance.nodataShow = this.noDataShow;
    this.applicationRef.attachView(embeddedView); // Attaches a view so that it will be dirty checked.

    // 将 NoDataComponent 的实例插入当前的 ElementRef 中
    for (const rootView of embeddedView.rootNodes) {
      this.renderer.appendChild(this.el.nativeElement, rootView);
    }
  }
}
