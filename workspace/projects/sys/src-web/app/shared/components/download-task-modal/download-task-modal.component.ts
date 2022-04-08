// 下载任务弹框
import { Component, OnInit, ViewChild } from '@angular/core';
import { TiTableRowData, TiModalService } from '@cloud/tiny3';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import { TaskListInterfaceService } from 'projects/sys/src-web/app/service/task-list-interface.service';
import { formatFileSizeUnit } from 'projects/sys/src-web/app/util';

@Component({
  selector: 'app-download-task-modal',
  templateUrl: './download-task-modal.component.html',
  styleUrls: ['./download-task-modal.component.scss']
})
export class DownloadTaskModalComponent implements OnInit {
  @ViewChild('modalComponent') modalComponent: any;

  public i18n: any;
  public modal: any; // modal ref

  constructor(
    private tiModal: TiModalService,
    private i18nService: I18nService,
    public taskListInterface: TaskListInterfaceService
  ) {
    this.i18n = this.i18nService.I18n();
  }

  ngOnInit() {}

  /**
   * 打开下载任务弹框
   * @param taskInfo 任务信息
   * @param modalTitle 弹框标题
   */
  public open(taskInfo: any, modalTitle: any) {
    return new Promise((resolve, reject) => {
      this.modal = this.tiModal.open(this.modalComponent, {
        id: 'downloadTaskModal', // 定义id防止同一页面出现多个相同弹框
        modalClass: 'custemModal',
        context: {
          modalTitle,
          columns: [
            { label: this.i18n.name, prop: 'fileName' },
          ],
          displayed: ([] as Array<TiTableRowData>),
          srcData: {
            data: Array(taskInfo.file_section_qty).fill(null).map((item, index) => {
              return {
                fileName: `${taskInfo.file_name}.tar${index ? '-' + (index + 1) : ''}`,
              };
            }),
            state: {
              searched: false, // 源数据未进行搜索处理
              sorted: false, // 源数据未进行排序处理
              paginated: false // 源数据未进行分页处理
            }
          },
          pageNo: 1,
          pageSize: {
            options: [10, 20, 40, 80, 100],
            size: 10
          },
          total: 0,
          fileSize: formatFileSizeUnit(taskInfo.task_filesize, 'B', 2),
          interfacing: false, // 调用接口中需要禁用掉按钮，防止点两次
          confirm: (context: any) => {  // 点击确定
            context.interfacing = true;
            context.dismiss();
            this.taskListInterface.downloadFile(taskInfo.id, taskInfo.file_section_qty);
          },
        },
      });
    });
  }
}
