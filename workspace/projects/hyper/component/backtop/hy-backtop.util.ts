import { EventEmitter } from '@angular/core';
import { HyElementMatchFeature } from './hy-backtop.component';

export class BacktopUtil {
  constructor() {}

  /**
   * 缓动函数
   * @param ele 滚动元素
   * @param position 滚动的位置
   * @param reachTop 到顶事件通知
   */
  static scrollTopSmooth(
    ele: HTMLElement,
    position: number,
    reachTop: EventEmitter<any>
  ) {
    const frameFn =
      window.requestAnimationFrame ??
      ((cb: any) => {
        return setTimeout(cb, 17);
      });

    // 当前滚动高度
    let scrollTop = ele.scrollTop;
    // step
    const step = () => {
      const distance = position - scrollTop;
      scrollTop = scrollTop + distance / 5;
      if (Math.abs(distance) < 1) {
        ele.scrollTo(0, position);
        reachTop.emit();
      } else {
        ele.scrollTo(0, scrollTop);
        frameFn(step);
      }
    };
    step();
  }

  /**
   * startup为真时：从元素本身开始，向上查找 Y 轴可滑动的元素， feature 使得查找更精确
   * startup为非真时：从元素本身开始，向上查找feature匹配的元素
   * @param elem 起始元素
   * @param feature 匹配特征
   * @param startup 是否为自动查找
   * @returns 目标元素
   */
  static findScrollableEle(
    elem: HTMLElement,
    feature: HyElementMatchFeature,
    startup: boolean
  ): HTMLElement | void {
    const find: any = (el: HTMLElement) => {
      let isScroll = false;
      try {
        isScroll = startup
          ? this.eleCanScroll(el) && this.matchFeature(el, feature)
          : this.matchFeature(el, feature);
      } catch (_) {
        return void 0;
      }
      return isScroll ? el : find(el?.parentElement);
    };

    return find(elem);
  }

  /**
   * 判断一个元素时不是 Y 轴可滑动的元素
   * @param ele 被判断元素
   * @returns 结论
   */
  private static eleCanScroll(ele: HTMLElement): boolean {
    if (!(ele instanceof HTMLElement)) {
      throw new Error('Please pass in DOM Elements');
    }
    const { scrollHeight, clientHeight } = ele;
    return scrollHeight > clientHeight;
  }

  /**
   * id > class > tag 的方式来匹配, 如果 null == feature, 直接返回 true
   * @param ele 被匹配元素
   * @param feature 匹配特征
   */
  private static matchFeature(
    ele: HTMLElement,
    feature: HyElementMatchFeature
  ): boolean {
    if (null == feature) {
      return true;
    }

    const eleInfo = {
      id: ele.id,
      classes: Array.from(ele.classList ?? []),
      tag: ele.tagName,
    };

    if (eleInfo.id === feature.id) {
      return true;
    }
    if (
      this.takeIntersection(eleInfo.classes, feature.classes ?? []).length > 0
    ) {
      return true;
    }
    if (eleInfo.tag.toUpperCase() === feature.tag?.toUpperCase()) {
      return true;
    }
    return false;
  }

  /**
   * 两个数组是否有交集
   * @param twoDimenArr 二维数组
   * @returns 交集
   */
  private static takeIntersection(...twoDimenArr: any[][]): any[] {
    const res = twoDimenArr.reduce((data: any, item: any) => {
      return data.filter((i: any) => {
        return item.some((j: any) => {
          return i === j;
        });
      });
    });
    return res;
  }
}
