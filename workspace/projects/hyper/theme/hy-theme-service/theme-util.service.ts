import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { HyTheme, themeSet } from '../hy-theme.enum';
import { HyThemeServiceModule } from './hy-theme.service.module';

@Injectable({
  providedIn: HyThemeServiceModule,
})
export class ThemeUtilService {
  private renderer: Renderer2;

  constructor(private rendererFactory: RendererFactory2) {
    this.renderer = this.rendererFactory.createRenderer(null, null);
  }

  /**
   * 从 body 将识别类选择器，以此确定当前的主题
   * @param body body 的元素
   */
  getThemeOnElement(ele: HTMLElement): HyTheme | void {
    const classList = Array.from(ele.classList);
    for (const className of classList) {
      if (themeSet.has(className as any)) {
        return className as HyTheme;
      }
    }
  }

  /**
   * 在 body 将新主题设置问题类选择器
   * @param body body 元素
   * @param newTheme 新主题
   */
  setThemeOnElement(ele: HTMLElement, newTheme: HyTheme) {
    const oldTheme = this.getThemeOnElement(ele);
    if (oldTheme && oldTheme === newTheme) {
      return;
    }

    if (oldTheme) {
      this.renderer.removeClass(ele, oldTheme);
    }

    this.renderer.addClass(ele, newTheme);
  }
}
