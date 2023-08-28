import { Inject, Injectable, Optional } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { HyGlobalNotify } from '../hy-global-notify.abstract';
import { HyTheme } from '../hy-theme.enum';
import { HyThemeServiceModule } from './hy-theme.service.module';
import { Cat } from '../../util';
import { ThemeUtilService } from './theme-util.service';

/**
 * 主题的基本操作
 */
export interface HyThemeBasisOperation {
  setTheme(theme: HyTheme): void;
  getTheme(): HyTheme | void;
  toDark?(): void;
  toLight?(): void;
  toGery?(): void;
}

@Injectable({
  providedIn: HyThemeServiceModule,
})
export class HyThemeService
  extends HyGlobalNotify<HyTheme>
  implements HyThemeBasisOperation
{
  private bodyEl: HTMLBodyElement;

  constructor(
    @Optional() @Inject(DOCUMENT) private document: any,
    private themeUtil: ThemeUtilService
  ) {
    super('theme');
    this.bodyEl = this.document?.body;
  }

  /**
   * 设置主题
   * @param newTheme 新主题
   */
  setTheme(newTheme: HyTheme) {
    if (Cat.isNil(this.bodyEl)) {
      return;
    }

    this.themeUtil.setThemeOnElement(this.bodyEl, newTheme);
    this.notify(newTheme);
  }

  /**
   * 获取当前主题
   * @returns 当前主题
   */
  getTheme() {
    if (Cat.isNil(this.bodyEl)) {
      return;
    }

    return this.themeUtil.getThemeOnElement(this.bodyEl);
  }

  /**
   * 设置深色主题
   */
  toDark() {
    if (Cat.isNil(this.bodyEl)) {
      return;
    }

    this.themeUtil.setThemeOnElement(this.bodyEl, HyTheme.Dark);
    this.notify(HyTheme.Dark);
  }

  /**
   * 设置浅色主题
   */
  toLight() {
    if (Cat.isNil(this.bodyEl)) {
      return;
    }

    this.themeUtil.setThemeOnElement(this.bodyEl, HyTheme.Light);
    this.notify(HyTheme.Light);
  }

  /**
   * 设置灰色主题
   */
  toGery() {
    if (Cat.isNil(this.bodyEl)) {
      return;
    }

    this.themeUtil.setThemeOnElement(this.bodyEl, HyTheme.Grey);
    this.notify(HyTheme.Grey);
  }
}
