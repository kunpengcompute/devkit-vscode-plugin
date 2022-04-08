import {
  Component,
  OnInit,
  Output,
  TemplateRef,
  ViewEncapsulation,
} from '@angular/core';
import { TiModalConfig, TiModalRef, TiModalService } from '@cloud/tiny3';
import { StateController, DispatchInfo, StateBaseOpreation } from '../model';
import { AddStateMachine, DeleteStateMachine } from '../util';
import { StateSchedulerService } from '../service';
import { BehaviorSubject, Subject } from 'rxjs';
import { importStateMap } from './batch-import-map';
import { deleteStateMap } from './batch-delete-map';
import { BatchOptType } from '../domain/batch-opt-type.enum';

@Component({
  selector: 'app-batch-node-operation',
  template: '',
  styleUrls: ['./batch-node-operation.component.scss'],
  providers: [StateSchedulerService],
  encapsulation: ViewEncapsulation.None,
})
export class BatchNodeOperationComponent implements OnInit, StateBaseOpreation {
  @Output() inited = new BehaviorSubject<StateController>(null);
  @Output() dispatch = new Subject<DispatchInfo>();

  constructor(
    private tiModal: TiModalService,
    private stateScheduler: StateSchedulerService
  ) {}

  ngOnInit(): void {
    this.stateScheduler.dispatch.subscribe((info: DispatchInfo) => {
      if (null == info) {
        return;
      }
    });
    this.inited.next({
      action: (payLoad: BatchOptType) => {
        this.startSchedule(payLoad);
      },
    });
  }

  /**
   * 开始进行批量操作的调度
   * @param batchOptType 批量操作类型
   */
  private startSchedule(batchOptType: BatchOptType) {
    this.stateScheduler.dispatch.subscribe((dispatchInfo) => {
      this.dispatch.next(dispatchInfo);
    });

    this.stateScheduler.inited.subscribe((controller: StateController) => {
      if (null == controller) {
        return;
      }
      switch (batchOptType) {
        case BatchOptType.Delete:
          controller.action(
            {
              batchOptType: BatchOptType.Delete,
              fsmRef: new DeleteStateMachine(),
              stateMap: deleteStateMap,
            },
            this.getModelOpen()
          );
          break;
        case BatchOptType.Import:
          controller.action(
            {
              batchOptType: BatchOptType.Import,
              fsmRef: new AddStateMachine(),
              stateMap: importStateMap,
            },
            this.getModelOpen()
          );
          break;
        default:
          break;
      }
    });
  }

  /**
   * 获取 Model 弹窗的方法（912px）
   * @returns Model 弹窗的方法
   */
  private getModelOpen() {
    const open = (
      tpl: TemplateRef<any>,
      config?: TiModalConfig
    ): TiModalRef => {
      const modalRef = this.tiModal.open(
        tpl,
        Object.assign(
          {
            closeIcon: false,
            modalClass: 'batch-opreation-class',
            animation: false,
            closeOnEsc: false,
          },
          config
        )
      );
      return modalRef;
    };

    return open;
  }
}
