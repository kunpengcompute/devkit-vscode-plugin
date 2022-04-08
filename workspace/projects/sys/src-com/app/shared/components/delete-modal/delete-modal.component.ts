import {
  Component, OnInit, ViewChild, Output, EventEmitter
} from '@angular/core';
import { I18n } from 'sys/locale';
import { TiModalService } from '@cloud/tiny3';
import { HttpService } from 'sys/src-com/app/service';

@Component({
  selector: 'app-delete-modal',
  templateUrl: './delete-modal.component.html',
  styleUrls: ['./delete-modal.component.scss']
})
export class DeleteModalComponent implements OnInit {
  @Output() closaModal = new EventEmitter<any>();
  @ViewChild('viewStack') viewStack: any;
  public compareData: any[] = [];
  public compareTitle: any[];
  public deleteModelTitle: string;
  public deleteModelTip: string;
  public i18n = I18n;
  constructor(
    private tiModal: TiModalService,
    private http: HttpService,
  ) { }

  ngOnInit(): void {
  }
  /**
   * 删除之前提示会删除关联的对比分析任务
   */
  public async deleteBefore(id: number, isTask: boolean) {
    const params = {
      id,
      'is-task': isTask
    };
    const res = await this.http.get(`/data-comparison/query-deletion-report/`, { params });
    return Promise.resolve(res.data);
  }
  /**
   * 删除关联对比分析提示弹框
   */
  public deleteModel(isTask: boolean, list: Array<any>, name: string, item: any, parent?: any) {
    this.compareData = list.map((val: string) => {
      return { name: val, tool: this.i18n.common_tern_tunning_helper_name };
    });
    this.compareTitle = [
      { title: this.i18n.common_term_task_name, key: 'name', width: '80%' },
      { title: this.i18n.compareCreate.tool, key: 'tool', width: '20%' }
    ];
    if (isTask) {
      this.deleteModelTitle = this.i18n.compareCreate.delTask;
      this.deleteModelTip = (this.i18n.compareCreate.delTaskTip as string).replace('${project}', name);
    } else {
      this.deleteModelTitle = this.i18n.compareCreate.delProject;
      this.deleteModelTip = (this.i18n.compareCreate.delProjectTip as string).replace('${project}', name);
    }
    this.tiModal.open(this.viewStack, {
      id: 'compareLinkage',
      modalClass: 'compareModal',
      context: {
        item,
        parent
      }
    });
  }
  public closeModal(context: any) {
    this.closaModal.next(context);
    context.dismiss();
  }
}
