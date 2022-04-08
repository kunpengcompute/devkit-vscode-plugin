import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { I18nService } from '../../../../service/i18n.service';
import { PidProcess } from '../../../domain';

interface PidNodeConfigData {
  nodeName: string;
  nodeIP: string;
  rawData: any;
  param: {
    status: boolean;
    pid: string;
    process_name: string;
  };
}

@Component({
  selector: 'app-process-node-config-pid',
  templateUrl: './process-node-config-pid.component.html',
  styleUrls: ['./process-node-config-pid.component.scss']
})
export class ProcessNodeConfigPidComponent implements OnInit {
  @ViewChild('missionPublic') missionPublic: any;

  /** */
  @Input()
  set configData(val: PidNodeConfigData) {
    this.nodeName = val.nodeName;
    this.nodeIP = val.nodeIP;
    this.rawData = val.rawData;
    const pidProces: PidProcess = {
      pid: val.param.pid || '',
      process: val.param.process_name || '',
    };
    this.ppCroup.controls.pidProcess.setValue(pidProces);
  }
  @Output() confirmConfig = new EventEmitter<PidNodeConfigData>();
  @Input() labelWidth = '200px';
  @Input() drawerLevel: number;

  public nodeName = '';
  public nodeIP = '';

  public i18n: any;
  private rawData: any;
  public ppCroup = new FormGroup({
    pidProcess: new FormControl(''),
  });
  public pidProcessValid = true;

  constructor(
    public i18nService: I18nService,
  ) {
    this.i18n = this.i18nService.I18n();
    const statusChanges$ = this.ppCroup.controls.pidProcess.statusChanges;
    statusChanges$.subscribe(status => {
      this.pidProcessValid = ('VALID' === status) ? true : false;
    });
  }

  ngOnInit() { }

  // 确认
  public confirm() {
    this.confirmConfig.emit({
      nodeName: this.nodeName,
      nodeIP: this.nodeIP,
      rawData: this.rawData,
      param: {
        status: true,
        pid: this.ppCroup.controls.pidProcess.value.pid,
        process_name: this.ppCroup.controls.pidProcess.value.process,
      }
    });
    this.missionPublic.close();
  }

  // 打开
  public open() {
    this.missionPublic.open();
  }

  public close() {
    this.missionPublic.close();
  }
}
