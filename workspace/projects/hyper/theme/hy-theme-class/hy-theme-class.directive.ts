import { Directive, ElementRef, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { HyTheme } from '../hy-theme.enum';
import { HyThemeService } from '../hy-theme-service/hy-theme.service';
import { ThemeUtilService } from '../hy-theme-service/theme-util.service';

/**
 * 可将主题标志（light, dark, grey）作为类选择器植入任何元素中，并在主题变化时更新
 */
@Directive({
  selector: '[hyThemeClass]',
})
export class HyThemeClassDirective implements OnDestroy {
  private themeSub: Subscription;

  constructor(
    private elementRef: ElementRef,
    private themeUtil: ThemeUtilService,
    private themeServe: HyThemeService
  ) {
    this.themeSub = this.themeServe.subscribe((theme: HyTheme) => {
      this.themeUtil.setThemeOnElement(this.elementRef.nativeElement, theme);
    });
  }

  ngOnDestroy() {
    this.themeSub.unsubscribe();
  }
}
