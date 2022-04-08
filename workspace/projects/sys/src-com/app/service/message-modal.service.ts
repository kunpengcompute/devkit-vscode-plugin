import { Injectable } from '@angular/core';
import { TiModalService, TiModalRef } from '@cloud/tiny3';
import { MessageModalComponent } from '../shared/components/message-modal/message-modal.component';
import { MessageModalConfig } from 'projects/sys/src-com/app/domain';

/**
 * 对tiModal的封装，使用方法基本和tiMessage一样。
 */
@Injectable({
  providedIn: 'root',
})
export class MessageModalService {
  constructor(private tiModal: TiModalService) {}

  open(config: MessageModalConfig): TiModalRef {
    // 提取tiMessageConfig的配置信息放到context中传递给MessageModalComponent组件
    const tiMessageConfig = {
      type: config.type || 'confirm',
      title: config.title || '',
      content: config.content || '',
      okButton: Object.assign({
        show: true,
        disabled: false,
        primary: true,
        autofocus: true,
      }, config.okButton),
      cancelButton: Object.assign({
        show: true,
        disabled: false,
        primary: false,
        autofocus: false,
      }, config.cancelButton)
    };
    // 过滤出属于TiModalConfig的配置属性
    const tiMessageConfigKeys = [...Object.keys(tiMessageConfig), 'context'];
    const tiModalConfigKeys = Object.keys(config).filter(item => (tiMessageConfigKeys.indexOf(item) === -1));
    const tiModalConfig = tiModalConfigKeys.reduce((tiModalConfig1: any, key: string) => {
      tiModalConfig1[key] = (config as any)[key];
      return tiModalConfig1;
    }, {});
    tiModalConfig.modalClass += ' message-modal';
    return this.tiModal.open(MessageModalComponent, {
      context: tiMessageConfig,
      ...tiModalConfig
    });
  }
}
