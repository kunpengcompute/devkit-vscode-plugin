import { Component, Input, OnInit, ElementRef } from '@angular/core';
import { DownloadFileService } from 'sys/src-com/app/service';
import { CapturePkgRaw } from '../../domain';
import { NetIoService } from '../../service/net-io.service';

type CaptureServiceData = {
  data: {
    NetCaught: CapturePkgRaw
  }
};

@Component({
  selector: 'app-net-capture-packet',
  templateUrl: './net-capture-packet.component.html',
  styleUrls: ['./net-capture-packet.component.scss']
})
export class NetCapturePacketComponent implements OnInit {
  @Input() nodeId: number;
  @Input() taskId: number;

  constructor(
    private netIoServe: NetIoService,
    private downloadServe: DownloadFileService,
    public el: ElementRef
  ) { }

  public captureData: CapturePkgRaw['tcpdump_info'] = [];

  ngOnInit(): void {
    this.netIoServe.pullCaptureData(this.taskId, this.nodeId).then((data: CaptureServiceData) => {
      this.captureData = data.data.NetCaught.tcpdump_info;
    });
  }

  // 下载 .cap文件
  downloadCap() {
    this.downloadServe.download(`/diagnostic-tasks/${encodeURIComponent(this.taskId)}/netio_analysis/download/`,
      this.nodeId);
  }
}
