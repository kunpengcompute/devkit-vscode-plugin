import { Component, Input, OnInit } from '@angular/core';
import { TiMessageButtonConfig } from '@cloud/tiny3';
import { I18nService } from 'projects/sys/src-com/app/service/i18n.service';

@Component({
  selector: 'app-message-modal',
  templateUrl: './message-modal.component.html',
  styleUrls: ['./message-modal.component.scss'],
})
export class MessageModalComponent implements OnInit {
  @Input() type: 'confirm' | 'warn' | 'error' | 'prompt';
  @Input() title: string;
  @Input() content: string;
  @Input() okButton: TiMessageButtonConfig;
  @Input() cancelButton: TiMessageButtonConfig;

  public i18n: any;
  public iconClass = '';

  constructor(private i18nService: I18nService) {
    this.i18n = this.i18nService.I18n();
  }

  ngOnInit(): void {
    this.iconClass = {
      confirm: 'ti3-icon-check-circle',
      prompt: 'ti3-icon-info-circle',
      warn: 'ti3-icon-warn',
      error: 'ti3-icon-exclamation-circle'
    }[this.type];
  }

  // 模板中实际调用的是Modal服务提供的close和dismiss方法，并非此处定义的方法；
  // 在此处定义close和dismiss方法只是为了避免生产环境打包时报错
  close(): void {}
  dismiss(): void {}
}
