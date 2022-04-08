import {
  Directive, Input, TemplateRef, ElementRef,
  ComponentRef, OnInit, OnDestroy
} from '@angular/core';
import {
  TiPositionType, TiTipRef, TiTipService,
  TiTipShowInfo, Util, TiTipConfig
} from '@cloud/tiny3';
import { HyTiTipService } from '../../service/ti-tip';
import { HyTipConfig } from '../../domain';

@Directive({
  selector: '[hyTiTip]',
  exportAs: 'hyTiTip'
})
export class HyTiTipDirective implements OnInit, OnDestroy {
  /**
   * tip显示内容配置
   * set: 监听tip值的变化，当tip为''或undefined情况下，直接隐藏tip组件
   */
  @Input('hyTiTip')
  set tiTip(value: string | TemplateRef<any>) {
    this.tiTipStash = value;
    if (HyTiTipDirective.isInValidValue(value)) {
      this.hide();
    }
  }
  get tiTip(): string | TemplateRef<any> {
    return this.tiTipStash;
  }
  /** Tip显示位置属性配置 */
  @Input() tiTipPosition?: TiPositionType = 'auto';
  /** 最大宽度 */
  @Input() tiTipMaxWidth = '276px';
  /** 是否带箭头 */
  @Input() tiTipHasArrow ?= true;
  /**
   * tip显示内容对应的上下文，tip内容类型为templateRef
   * 或Component形式时会用到该参数，参数为自定义对象形式
   * 注意：指令形式时才会使用到该参数
   */
  @Input() tiTipContext?: any;
  /**
   * tip生成方式
   *
   * 默认支持鼠标移入移出时显示/隐藏，即'mouse'
   *
   * 'click'是在鼠标点击按钮时才会显示，再次点击隐藏。同时点击tip弹窗外也会隐藏
   *
   * 注意：指令形式时才会使用到该参数
   */
  @Input() tiTipTrigger?: 'mouse' | 'manual' | 'click' = 'mouse';
  /** 决定tip水平方向位置的宿主元素配置 */
  @Input() tiTipHostEleX: Element;

  /** 拓展配置项: 样式 */
  @Input() hyTipStyle?: HyTipConfig['style'];
  /** 拓展配置项: 类型名 */
  @Input() hyTipClass?: HyTipConfig['class'];

  private tipInstance: TiTipRef;
  private hostEle: Element;
  private tiTipStash: string | TemplateRef<any>;

  constructor(
    private tiTipService: TiTipService,
    private hostEleRef: ElementRef,
    private hyTipService: HyTiTipService,
  ) {
    this.hostEle = hostEleRef.nativeElement;
  }

  private static isInValidValue(value: string | TemplateRef<any>): boolean {
    return Util.isUndefined(value) || value === '';
  }

  ngOnInit(): void {
    const tiConfig: TiTipConfig = {
      position: this.tiTipPosition,
      maxWidth: this.tiTipMaxWidth,
      hasArrow: this.tiTipHasArrow,
      hostEleX: this.tiTipHostEleX,
      trigger: 'manual', // 指令方式，定为手动
      showFn: (): TiTipShowInfo => {
        if (!this.tipInstance || HyTiTipDirective.isInValidValue(this.tiTipStash)) {
          return void 0;
        }

        return { content: this.tiTipStash, context: this.tiTipContext };
      }
    };

    const hyConfig: HyTipConfig = {
      class: this.hyTipClass,
      style: this.hyTipStyle
    };

    // 初始创建tip实例
    this.tipInstance = this.tiTipService.create(this.hostEle, tiConfig);

    // 绑定事件
    if (this.tiTipTrigger !== 'manual') {
      this.hyTipService.addTriggerEvent(
        this.hostEle, tiConfig, this.tipInstance, hyConfig, this.tiTipTrigger
      );
    }

  }

  ngOnDestroy(): void {
    this.tipInstance.hide();
    this.tipInstance = null;
  }

  /**
   * 显示tip方法
   */
  show(): ComponentRef<any> {
    if (!this.tipInstance || HyTiTipDirective.isInValidValue(this.tiTipStash)) {
      return void 0;
    }

    return this.tipInstance.show(this.tiTipStash, this.tiTipContext);
  }

  /**
   * 隐藏tip方法
   */
  hide(): void {
    if (this.tipInstance) {
      this.tipInstance.hide();
    }
  }
}
