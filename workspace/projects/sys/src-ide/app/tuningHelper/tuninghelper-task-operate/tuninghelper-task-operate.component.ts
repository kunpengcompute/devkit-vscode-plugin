import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { I18nService } from '../../service/i18n.service';
import { VscodeService } from '../../service/vscode.service';

@Component({
  selector: 'app-tuninghelper-task-operate',
  templateUrl: './tuninghelper-task-operate.component.html',
  styleUrls: ['./tuninghelper-task-operate.component.scss']
})
export class TuninghelperTaskOperateComponent implements OnInit {
  @Output() private closeTab = new EventEmitter<any>();
  @Input() node: any;
  public i18n: any;
  constructor(
    public i18nService: I18nService,
    public vscodeService: VscodeService,
  ) {
    this.i18n = this.i18nService.I18n();
  }
  public showTipType = 'popTip';
  ngOnInit(): void { }
  public createdTask(e: any) {
    if (e.type === 'info') {
      this.vscodeService.showInfoBox(
        this.i18nService.I18nReplace(this.i18n.plugins_term_task_create_success, {
          0: e.msg
        }), 'info');
    } else {
      this.vscodeService.showInfoBox(e.msg, 'error');
    }
  }
  public closeTabTo(e: any) {
    this.closeTab.emit(e);
  }
}
