import { Component, Input, OnInit } from '@angular/core';
import { StorageIoService } from '../service/storage-io-service';
import { I18n } from 'sys/locale';

@Component({
  selector: 'app-task-log',
  templateUrl: './task-log.component.html',
  styleUrls: ['./task-log.component.scss']
})
export class TaskLogComponent implements OnInit {
  @Input() taskId: number;
  @Input() nodeId: number;
  constructor(private StIoService: StorageIoService) { }
  public collectData: string[];
  public processData: string[];
  async ngOnInit() {
    const res = await this.StIoService.getLogData(this.taskId, this.nodeId);
    this.handleData(res.data);
  }
  public handleData(data: any) {
    this.collectData = data.Collect;
    this.processData = data.process;
  }
}
