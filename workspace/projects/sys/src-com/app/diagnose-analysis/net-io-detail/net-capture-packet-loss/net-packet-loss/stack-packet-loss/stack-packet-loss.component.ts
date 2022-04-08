import { Component, Input, OnInit } from '@angular/core';
import { I18n } from 'sys/locale';
import { PocketLossRaw } from '../../../domain';

type StackPacketDetailList = {
  title: string,
  isActive: boolean;
};

@Component({
  selector: 'app-stack-packet-loss',
  templateUrl: './stack-packet-loss.component.html',
  styleUrls: ['./stack-packet-loss.component.scss']
})
export class StackPacketLossComponent implements OnInit {

  @Input()
  set stackPacketData(val: PocketLossRaw['proto_stat']) {
    if (!val) { return; }

    this.ipStatisticsData = val.Ip.replace(/\n/g, '<br />');
    this.icmpStatisticsData = val.Icmp.replace(/\n/g, '<br />');
    this.tcpStatisticsData = val.Tcp.replace(/\n/g, '<br />');
    this.udpStatisticsData = val.Udp.replace(/\n/g, '<br />');
  }

  public ipStatisticsData: string;
  public icmpStatisticsData: string;
  public tcpStatisticsData: string;
  public udpStatisticsData: string;

  public detailList: StackPacketDetailList[] = [
    { title: I18n.net_capture_loss.loss.stack_packet.detail_list[0], isActive: true },
    { title: I18n.net_capture_loss.loss.stack_packet.detail_list[1], isActive: false },
    { title: I18n.net_capture_loss.loss.stack_packet.detail_list[2], isActive: false },
    { title: I18n.net_capture_loss.loss.stack_packet.detail_list[3], isActive: false }
  ];

  constructor() { }

  ngOnInit(): void {
  }

  // 显示对应列表详情
  public showDetail(detail: StackPacketDetailList) {
    detail.isActive = !detail.isActive;
  }

}
