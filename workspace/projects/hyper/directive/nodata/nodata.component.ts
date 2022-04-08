import { ChangeDetectionStrategy, Component, Input, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { HyTheme, HyThemeService } from '../../theme';
import { HyNodataShowConfig } from './hy-nodata-show-config.interface';

@Component({
  templateUrl: './nodata.component.html',
  styleUrls: ['./nodata.component.scss']
})
export class NodataComponent{

  @Input() showConfig: HyNodataShowConfig;

  themeEnum = HyTheme;
  theme$: Observable<HyTheme>;

  constructor(
    private themeService: HyThemeService
  ) {
    this.theme$ = this.themeService.getObservable();
  }
}
