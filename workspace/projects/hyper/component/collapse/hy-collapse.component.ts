import { Component, EventEmitter, Input, Output } from '@angular/core';
import { HyThemeService, HyTheme } from '../../theme';
import { Observable } from 'rxjs';

@Component({
  selector: 'hy-collapse',
  templateUrl: './collapse.component.html',
  styleUrls: ['./collapse.component.scss'],
})
export class HyCollapseComponent {
  @Input() title: string;
  @Input() content: string;
  @Input() width: string;

  @Output() trigger = new EventEmitter<void>();

  theme$: Observable<HyTheme>;
  isCollapsed = false;

  constructor(private themeServe: HyThemeService) {
    this.theme$ = this.themeServe.getObservable();
  }
}
