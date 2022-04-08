import {
  ChangeDetectionStrategy, Component, EventEmitter,
  Input, Output, TemplateRef, ViewChild, ViewEncapsulation
} from '@angular/core';
import { HyModalConfig } from '../domain';
import { HyLocale } from '../../../locale';

type HyModalComConfig = Pick<HyModalConfig, 'type' | 'content'>;

@Component({
  selector: 'hy-mini-modal',
  templateUrl: './mini-modal.component.html',
  styleUrls: ['./mini-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None // 改变视图封装模式，使当前样式在子组件生效
})

export class MiniModalComponent {

  @ViewChild('miniModal', { static: true }) miniTpl: TemplateRef<any>;

  @Input() config: HyModalComConfig;

  @Output() confirm: EventEmitter<void> = new EventEmitter();

  @Output() cancel: EventEmitter<void> = new EventEmitter();

  constructor() { }

  onConfirm() {
    this.confirm.emit();
  }

  onCancel() {
    this.cancel.emit();
  }
}
