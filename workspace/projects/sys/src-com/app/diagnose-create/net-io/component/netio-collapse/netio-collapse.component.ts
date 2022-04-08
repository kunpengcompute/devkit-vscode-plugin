import { Component, EventEmitter, Input, Output } from '@angular/core';
import { HyThemeService, HyTheme } from 'hyper';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-netio-collapse',
  templateUrl: './netio-collapse.component.html',
  styleUrls: ['./netio-collapse.component.scss'],
})
export class NetioCollapseComponent {
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
