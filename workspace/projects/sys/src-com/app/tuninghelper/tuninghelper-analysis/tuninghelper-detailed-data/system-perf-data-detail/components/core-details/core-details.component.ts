import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CoreDetail, TableContainerData } from '../../domain';
import { I18n } from 'sys/locale';
import { WebviewPanelService } from 'sys/src-com/app/service';
@Component({
  selector: 'app-core-details',
  templateUrl: './core-details.component.html',
  styleUrls: ['./core-details.component.scss']
})
export class CoreDetailsComponent implements OnInit {
  @Output() public closeModal = new EventEmitter<any>();
  @Input() taskId: any;
  @Input() nodeid: any;
  @Input() set coreData(value: CoreDetail) {
    if (value) {
      this.coreDetail = value;
      this.threadList = value.cpu_process;
      this.initData();
    }
  }
  constructor(private panelService: WebviewPanelService) { }
  public coreDetail: CoreDetail;
  public hardData: TableContainerData;
  public softData: TableContainerData;
  public threadList: string[];
  ngOnInit(): void { }

  /**
   * 初始化软中断、硬中断表格数据
   */
  public initData() {
    this.hardData = {
      title: I18n.tuninghelper.taskDetail.hardInterrupts,
      height: '205px',
      columns: [
        { title: 'intr number', prop: 'intr number', width: '25%' },
        { title: 'intr/s', prop: 'intr/s', width: '75%' }
      ],
      srcData: this.coreDetail.cpu_hard_irq
    };
    this.softData = {
      title: I18n.tuninghelper.taskDetail.softInterrupts,
      height: '205px',
      columns: [
        { title: 'type', prop: 'type', width: '25%' },
        { title: 'intr/s', prop: 'intr/s', width: '75%' }
      ],
      srcData: this.coreDetail.cpu_soft_irq
    };
  }

  /**
   * 打开进程详情pannel
   * @param thread 进程名称
   */
  public viewThreadsData(thread: string) {
    this.closeModal.emit();
    this.panelService.addPanel({
      viewType: 'tuninghelperProcessPidDetailsysPerf',
      title: `${thread}${I18n.tuninghelper.treeDetail.detail}`,
      id: `TuninghelperProcessPidDetail-${this.taskId}-${this.nodeid}-${thread}`,
      router: 'tuninghelperProcessPidDetail',
      message: {
        nodeId: this.nodeid,
        taskId: this.taskId,
        pid: +thread.split('PID')[1].split(')')[0],
        showIndicatorInfo: true
      }
    });
  }
}
