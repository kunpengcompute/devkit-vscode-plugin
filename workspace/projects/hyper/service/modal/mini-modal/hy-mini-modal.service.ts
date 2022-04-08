import { Injectable } from '@angular/core';
import { TiModalConfig, TiModalService, TiPopupService } from '@cloud/tiny3';
import { HyModalConfig, HyModalRef } from '../domain';
import { MiniModalComponent } from './mini-modal.component';
import { HyMiniModalModule } from './hy-mini-modal.module';
import { PartialObserver } from 'rxjs';

@Injectable({
  providedIn: HyMiniModalModule
})
export class HyMiniModalService {

  private readonly defTiModalConfig: TiModalConfig = {
    headerAlign: 'left',
    closeIcon: true,
    backdrop: true,
    draggable: true,
    animation: true,
    closeOnEsc: false
  };

  constructor(
    private tiPopupServe: TiPopupService<MiniModalComponent>,
    private tiModalServe: TiModalService
  ) { }

  public open(config: HyModalConfig): HyModalRef {

    // 整理参数
    const configForTi = {
      id: config.id,
      modalClass: config.modalClass
        ? config.modalClass + ' hy-mini-modal'
        : 'hy-mini-modal',
      beforeClose: config.beforeClose,
      close: config.close,
      dismiss: config.dismiss
    };
    const configForHy = {
      type: config.type,
      content: config.content
    };
    const tiModalConfig: TiModalConfig
      = Object.assign({}, configForTi, this.defTiModalConfig);

    // 创建 MiniModalComponent 的引用
    const modalComponentRef = this.tiPopupServe.createCompoentRef({
      componentType: MiniModalComponent
    });

    // 获取 modalComponentRef 实例，设置参数
    const modalInstance: MiniModalComponent = modalComponentRef.instance;
    modalInstance.config = configForHy;

    // 生成弹框
    const { close, dismiss, destroy }
      = this.tiModalServe.open(modalInstance.miniTpl, tiModalConfig);

    // 监听关闭弹框动作
    const closeObserver: PartialObserver<void> = {
      next: () => { close(); }
    };
    const dismissObserver: PartialObserver<void> = {
      next: () => { dismiss(); }
    };
    modalInstance.confirm.subscribe(closeObserver);
    modalInstance.cancel.subscribe(dismissObserver);

    return { close, dismiss, destroy };
  }
}
