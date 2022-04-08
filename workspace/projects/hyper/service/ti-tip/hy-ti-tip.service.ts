import {
  Injectable, ComponentRef, NgZone, Renderer2, RendererFactory2
} from '@angular/core';
import { TiTipConfig, TiTipRef, TiTipShowInfo } from '@cloud/tiny3';
import { HyTiTipServiceModule } from './hy-ti-tip.service.module';
import { HyTipConfig } from '../../domain';

@Injectable({
  providedIn: HyTiTipServiceModule
})
export class HyTiTipService {
  private render: Renderer2;

  constructor(
    private zone: NgZone,
    private rendererFactory: RendererFactory2
  ) {
    this.render = this.rendererFactory.createRenderer(null, null);
  }

  // 根据trigger配置为宿主元素添加事件，该事件用于控制tip的显示/隐藏
  addTriggerEvent(
    hostEle: Element, config: TiTipConfig, tipInstance: TiTipRef, hyConfig: HyTipConfig, trigger: 'mouse' | 'click'
  ): void {
    if (trigger === 'mouse') {
      this.triggerWithMouse(hostEle, config, tipInstance, hyConfig);
    } else if (trigger === 'click') {
      this.triggerWithClick(hostEle, config, tipInstance, hyConfig);
    }
  }

  /**
   * 添加鼠标移入移出控制tip显示/隐藏的事件
   */
  private triggerWithMouse(hostEle: Element, config: TiTipConfig, tipInstance: TiTipRef, hyConfig: HyTipConfig) {
    let tipComponentRef: ComponentRef<any> = null;
    this.zone.runOutsideAngular(() => {
      const unlistenMouseenterFn: () => void = this.render.listen(hostEle, 'mouseenter', () => {
        if (typeof config.showFn !== 'function') {
          return;
        }
        const showInfo: TiTipShowInfo = config.showFn();
        if (!showInfo) {
          return;
        }
        this.zone.run(() => {
          tipComponentRef = tipInstance.show(showInfo.content, showInfo.context);
          if (!tipComponentRef) {
            return;
          }

          // 设置拓展配置
          this.setHyTipConfig(tipComponentRef, hyConfig);

          // 根据trigger配置添加tip元素本身事件，此处事件用于支持移出tip元素时tip消失
          const targetEle: Element = tipComponentRef.location.nativeElement;
          this.render.listen(targetEle, 'mouseleave', (event: MouseEvent) => {
            /**
             * 此处处理是为了解决Chrome高版本下，连续点击tip区域情况下，导致tip消失的问题
             * 【问题原因】chrome高版本（chrome60以上版本）下，连续的click事件会触发tipEle的mouseleave事件,
             * 从而导致tip消失
             * 【解决方案】如mouseleve事件是由tip元素本身点击触发的，则event.relatedTarget为null，则通过该
             * 方式进行特殊情况排除
             */
            if (event.relatedTarget === null) {
              return;
            }
            tipInstance.hide();
            tipComponentRef = null;
          });
        });
      });
      const unlistenMouseleaveFn: () => void = this.render.listen(hostEle, 'mouseleave', (event: MouseEvent) => {
        // 鼠标移入tip时，tip不消失
        if (tipComponentRef && !tipComponentRef.location.nativeElement.contains(event.relatedTarget)) {
          this.zone.run(() => {
            tipInstance.hide();
            tipComponentRef = null;
          });
        }
      });
      // 给实例添加销毁方法
      tipInstance.destroy = (): void => {
        // 先隐藏tip示例再取消监听事件
        tipInstance.hide();
        unlistenMouseenterFn();
        unlistenMouseleaveFn();
      };
    });
  }

  /**
   * 添加鼠标点击控制tip显示/隐藏的事件
   */
  private triggerWithClick(hostEle: Element, config: TiTipConfig, tipInstance: TiTipRef, hyConfig: HyTipConfig) {
    let tipComponentRef: ComponentRef<any> = null;
    let isShow = false;
    this.zone.runOutsideAngular(() => {
      let unlistenBodyClickFn: () => void;
      const unlistenClickFn: () => void = this.render.listen(hostEle, 'click', () => {
        if (typeof config.showFn !== 'function') {
          return;
        }
        const showInfo: TiTipShowInfo = config.showFn();
        if (!showInfo) {
          return;
        }
        this.zone.run(() => {
          if (!isShow) {
            isShow = true;
            tipComponentRef = tipInstance.show(showInfo.content, showInfo.context);
            if (!tipComponentRef) {
              return;
            }

            // 设置拓展配置
            this.setHyTipConfig(tipComponentRef, hyConfig);

            // 在点击tip之外的地方时隐藏tip
            const targetEle: Element = tipComponentRef.location.nativeElement;
            // 释放掉之前添加的监听事件
            unlistenBodyClickFn?.();
            // 以新的tip节点作为body点击事件回调函数里的参数
            unlistenBodyClickFn = this.render.listen(document.body, 'click', (event) => {
              if (!isShow) {
                return;
              }
              // 如果点击的Dom不是绑定HyTiTip的Dom，且绑定HyTiTip的Dom不包含点击的dom；
              // 并且，点击的Dom不是绑定tip的Dom，且tip的Dom不包含点击的dom
              // 则隐藏tip
              if (event.target !== targetEle && !targetEle.contains(event.target)
              && event.target !== hostEle && !hostEle.contains(event.target)) {
                isShow = false;
                tipInstance.hide();
                tipComponentRef = null;
              }
            });
          } else {
            isShow = false;
            tipInstance.hide();
            tipComponentRef = null;
          }
        });
      });
      const hide = tipInstance.hide;
      // 修改hide方法
      tipInstance.hide = (): void => {
        // 先隐藏tip示例再取消监听事件
        hide.apply(tipInstance);
        isShow = false;
        unlistenBodyClickFn?.();
      };
      // 给实例添加销毁方法
      tipInstance.destroy = (): void => {
        // 先隐藏tip示例再取消监听事件
        tipInstance.hide();
        unlistenClickFn();
      };
    });
  }

  /**
   * 给 tip 设置相应的拓展属性
   * @param tipComponentRef tip的组件引用
   * @param hyConfig 拓展配置
   */
  private setHyTipConfig(tipComponentRef: ComponentRef<any>, hyConfig: HyTipConfig): void {
    const nativeEl = tipComponentRef?.location?.nativeElement;

    if (nativeEl == null) { return; }

    const classList = hyConfig.class || [];
    const style = hyConfig.style || {};

    classList?.forEach?.(item => {
      this.render.addClass(nativeEl, item.toString());
    });
    for (const item of Object.keys(style)) {
      this.render.setStyle(nativeEl, item, style[item]);
    }
  }
}
