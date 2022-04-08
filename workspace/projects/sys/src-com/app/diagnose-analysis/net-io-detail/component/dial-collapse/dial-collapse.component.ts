import { Component, EventEmitter, Input, Output } from '@angular/core';
import { HyThemeService, HyTheme } from 'hyper';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-dial-collapse',
  templateUrl: './dial-collapse.component.html',
  styleUrls: ['./dial-collapse.component.scss'],
})
export class DialCollapseComponent {
  @Input() title: string;
  @Input() content: string;
  @Input() width: string;
  @Input() isCollapsed = false;

  @Output() trigger = new EventEmitter<void>();

  theme$: Observable<HyTheme>;

  constructor(private themeServe: HyThemeService) {
    this.theme$ = this.themeServe.getObservable();
  }
}
