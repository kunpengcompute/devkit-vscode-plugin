import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { HyTheme } from '../hy-theme.enum';
import { HyThemeService } from '../hy-theme-service/hy-theme.service';
/**
 * @example
 * <hy-theme-content>
 *   <img src="./assets/img/dark-tip.png" dark>
 *   <img src="./assets/img/light-tip.png" light>
 *   <img src="./assets/img/grey-tip.png" grey>
 * </hy-theme-content>
 */
@Component({
  selector: 'hy-theme-content',
  template: `
  <ng-container [ngSwitch]="theme$ | async">
    <ng-content select="[dark]" *ngSwitchCase="themeEnum.Dark"></ng-content>
    <ng-content select="[grey]" *ngSwitchCase="themeEnum.Grey"></ng-content>
    <ng-content select="[light]" *ngSwitchDefault></ng-content>
  </ng-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HyThemeContentComponent {

  themeEnum = HyTheme;
  theme$: Observable<HyTheme>;

  constructor(
    private themeService: HyThemeService
  ) {
    this.theme$ = this.themeService.getObservable();
  }
}
