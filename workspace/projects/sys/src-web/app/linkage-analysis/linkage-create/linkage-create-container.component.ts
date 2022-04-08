import { Component, EventEmitter, Output } from '@angular/core';
import { AxiosService } from 'sys/src-web/app/service/axios.service';
import { GetTreeService } from '../../core/home2/service/get-tree.service';
import { I18nService } from 'sys/src-web/app/service/i18n.service';

@Component({
  selector: 'app-linkage-create-container',
  template: `
  <app-linkage-create
    (createdTask)="onCreateTask($event)"
    (closeTab)="onCloseTab($event)">
  </app-linkage-create>`
})
export class LinkageCreateContainerComponent {

  @Output() closeTab = new EventEmitter<any>();

  constructor(
    public Axios: AxiosService,
    public getTreeService: GetTreeService,
    public i18nService: I18nService
  ) {}

  onCreateTask(info: { status: string, taskId: number }) {

    this.getTreeService.createLinkageTask.next(info);
  }

  onCloseTab(info: any) {

    this.closeTab.emit(info);
  }
}
