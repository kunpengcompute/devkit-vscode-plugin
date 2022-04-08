import { Component, Input, OnInit } from '@angular/core';
import { INetLoadRawData } from '../domain';
import { NetIoService } from '../service/net-io.service';
@Component({
  selector: 'app-net-load-monitor',
  templateUrl: './net-load-monitor.component.html',
  styleUrls: ['./net-load-monitor.component.scss'],
})
export class NetLoadMonitorComponent implements OnInit {
  @Input() nodeId: number;
  @Input() taskId: number;
  public netLoadData: INetLoadRawData;

  constructor(private netIoService: NetIoService) {}

  async ngOnInit() {
    const res = await this.netIoService.pullLoadData(this.taskId, this.nodeId);
    this.netLoadData = res.data.Load;
  }
}
