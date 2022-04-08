import { Component, Input, OnInit } from '@angular/core';
import { I18n } from 'sys/locale';
import { TaskStatus } from '../../domain';
import { StorageIoService } from './service/storage-io-service';

type RespTabFuncs = 'storageDiagnostic' | 'systemMonitor';

// 页签名
type StorageIoTabName = 'pressure_test_result' | 'system_load' | 'task_info' | 'task_log';

// 页签项
type StorageIoTabType = {
  name: StorageIoTabName;
  title: string;
  active: boolean;
  show: boolean;
  order: number;
};

@Component({
  selector: 'app-storage-io-detail',
  templateUrl: './storage-io-detail.component.html',
  styleUrls: ['./storage-io-detail.component.scss']
})
export class StorageIoDetailComponent implements OnInit {

  @Input() nodeId: number;
  @Input() taskId: number;
  @Input() status: string;

  storageIoTabList: StorageIoTabType[] = [];
  storageIoTabObj: {
    [key in StorageIoTabName]: StorageIoTabName
  } = {
    pressure_test_result: 'pressure_test_result',
    system_load: 'system_load',
    task_info: 'task_info',
    task_log: 'task_log'
  };
  hasDiagram = false;

  constructor(
    private storageIoService: StorageIoService
  ) {}

  ngOnInit(): void {
    this.getTaskInfo();
  }

  /**
   * 获取任务信息
   */
  private async getTaskInfo() {
    try {
      const resTaskInfo = await this.storageIoService.getInfoData(this.taskId, this.nodeId);
      const taskConfig = resTaskInfo?.data;
      this.hasDiagram = taskConfig.cycleOn;
      const funcs = (taskConfig?.diagnosticFunc ?? []) as RespTabFuncs[];
      const currNodeStatus = taskConfig?.nodeConfig?.find(
        (item: any) => item.nodeId === this.nodeId
      ).taskStatus as TaskStatus;

      this.createTabs(funcs, currNodeStatus);
    } catch (error) {
      this.createTabs([]);
    }
  }

  /**
   * 创建tab页签
   * @param funcs 后端返回的显示tab
   * @param nodeStatus 节点状态
   */
  private createTabs(funcs: RespTabFuncs[] = [], nodeStatus?: TaskStatus) {
    this.storageIoTabList = [
      {
        name: 'pressure_test_result',
        title: I18n.storage_io_detail.pressure_test_result,
        active: false,
        show: funcs.includes('storageDiagnostic') && TaskStatus.Completed === nodeStatus,
        order: 0,
      },
      {
        name: 'system_load',
        title: I18n.storage_io_detail.system_load,
        active: false,
        show: funcs.includes('systemMonitor') && TaskStatus.Completed === nodeStatus,
        order: 1,
      },
      {
        name: 'task_info',
        title: I18n.common_term_task_tab_congration,
        active: false,
        show: true,
        order: 2,
      },
      {
        name: 'task_log',
        title: I18n.common_term_task_tab_log,
        active: false,
        show: TaskStatus.Completed === nodeStatus,
        order: 3,
      },
    ];
    const tabs = this.storageIoTabList.filter(tab => tab.show)
    .sort((pre, next) => pre.order = next.order);
    if (tabs.length) {
      tabs[0].active = true;
    }
  }
}
