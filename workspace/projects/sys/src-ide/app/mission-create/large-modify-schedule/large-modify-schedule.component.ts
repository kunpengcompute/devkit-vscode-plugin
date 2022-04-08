import {
  Component,
  OnInit,
  Output,
  ViewChild,
  EventEmitter,
  Input,
} from '@angular/core';
import { ToolType } from 'projects/domain';
import { I18n } from 'sys/locale';
import { VscodeService } from '../../service/vscode.service';

@Component({
  selector: 'app-large-modify-schedule',
  templateUrl: './large-modify-schedule.component.html',
  styleUrls: ['./large-modify-schedule.component.scss'],
})
export class LargeModifyScheduleComponent implements OnInit {
  @ViewChild('modal', { static: false }) modal: any;

  @Input() taskData: any;

  @Output() private sendPretable = new EventEmitter<any>();

  i18n = I18n;
  // 是否是修改预约任务
  isModifySchedule = false;
  // 任务类型
  analysisType: string;
  toolType: ToolType;
  projectId: number;
  nodeConfigShow: boolean;
  // 内存诊断重新加载初始化
  showDiagnose = true;
  /** 任务ID */
  scheduleTaskId: string;

  constructor(private vscodeService: VscodeService) {}

  ngOnInit(): void {
    this.toolType = sessionStorage.getItem('toolType') as ToolType;
  }

  open(item: any) {
    this.showDiagnose = true;
    this.isModifySchedule = true;
    this.analysisType = item.data['analysis-type'] || item.data.analysisType;
    this.modal.Open();
    this.projectId = item.projectId;
    let url = '';
    switch (this.toolType) {
      case ToolType.DIAGNOSE:
        url = `/diagnostic-project/${encodeURIComponent(this.projectId)}/info/`;
        break;
      default:
        url = `/projects/${encodeURIComponent(this.projectId)}/info/`;
        break;
    }
    this.vscodeService.get({ url }, (res: any) => {
      this.nodeConfigShow = res.data.nodeList.length > 1;
    });
    this.scheduleTaskId = item.taskId;
  }

  close() {
    this.showDiagnose = false;
    this.modal.Close();
  }

  handleUpdataPretable(str: string) {
    if (str === 'on') {
      this.sendPretable.emit();
    }
    this.close();
  }

  public closePopDetail(e: any) {
    if (this.toolType === ToolType.DIAGNOSE) {
      this.showDiagnose = false;
    }
  }
}
