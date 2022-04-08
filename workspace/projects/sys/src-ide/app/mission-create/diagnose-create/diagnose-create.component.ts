import { Component, Input, Output, EventEmitter } from '@angular/core';
import { VscodeService } from '../../service/vscode.service';

@Component({
  selector: 'app-diagnose-create',
  templateUrl: './diagnose-create.component.html',
  styleUrls: ['./diagnose-create.component.scss'],
})
export class DiagnoseCreateComponent {
  @Output() closeTab = new EventEmitter<any>();
  @Output() sendMissionKeep = new EventEmitter<any>();
  @Input() taskName: string;
  @Input() projectName: string;
  @Input() projectId: string;
  @Input() actionType: any;
  @Input() taskDetail: any;
  @Input() isModifySchedule: boolean;
  @Input() networkinfo: any;
  @Input() storageIoInfo: any;
  @Input() diagnoseTarget: string;

  constructor(public vscodeService: VscodeService) {}

  cancalTab(event: any) {
    this.closeTab.emit(event);
  }
  onSendMissionKeep(event: any){
    this.sendMissionKeep.emit(event);
  }
  errorTips(event: any){
    this.vscodeService.showInfoBox(event, 'error');
  }
}
