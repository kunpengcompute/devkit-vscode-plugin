import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-diagnose-create',
  templateUrl: './diagnose-create.component.html',
  styleUrls: ['./diagnose-create.component.scss']
})
export class DiagnoseCreateComponent implements OnInit {

  @Output() closeTab = new EventEmitter<any>();
  @Output() sendMissionKeep = new EventEmitter<any>();
  @Input() taskName: string;
  @Input() projectName: string;
  @Input() actionType: any;
  @Input() taskDetail: any;
  @Input() diagnoseTarget: string;
  @Input() isModifySchedule: boolean;
  @Input() networkinfo: any;
  @Input() storageIoInfo: any;

  constructor() { }

  ngOnInit(): void { }

  onClose(event: any) {
    this.closeTab.emit(event);
  }
  onSendMissionKeep(event: any) {
    this.sendMissionKeep.emit(event);
  }
}
