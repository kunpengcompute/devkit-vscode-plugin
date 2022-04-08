import { Component, Input, OnInit } from '@angular/core';
import { TiModalService } from '@cloud/tiny3';
import { I18n } from 'sys/locale';
import { PocketLossRaw } from '../../domain';
import { SuggestionList } from '../../domain/pocket-loss/pocket-loss-raw.type';
import { NetIoService } from '../../service/net-io.service';

type PacketLossDetailList = {
  title: string,
  isActive: boolean;
};

@Component({
  selector: 'app-net-packet-loss',
  templateUrl: './net-packet-loss.component.html',
  styleUrls: ['./net-packet-loss.component.scss']
})
export class NetPacketLossComponent implements OnInit {

  @Input() taskId: number;
  @Input() nodeId: number;

  IOPacketData: PocketLossRaw['net_err_stat'];
  IOEhtStatData: PocketLossRaw['eth_stat'];
  queuePacketData: PocketLossRaw['softnet_stat'];
  stackPacketData: PocketLossRaw['proto_stat'];
  kernelPacketData: PocketLossRaw['kfree_skb'];

  detailList: PacketLossDetailList[] = [
    { title: I18n.net_capture_loss.loss.detai_list[0], isActive: true },
    { title: I18n.net_capture_loss.loss.detai_list[1], isActive: false },
    { title: I18n.net_capture_loss.loss.detai_list[2], isActive: false },
    { title: I18n.net_capture_loss.loss.detai_list[3], isActive: false }
  ];

  suggestionList: SuggestionList[] = [];

  constructor(
    private netIoServe: NetIoService,
    private tiModal: TiModalService
  ) { }

  async ngOnInit() {
    const requestData = await this.netIoServe.pullPacketLossData(this.taskId, this.nodeId);
    const { net_err_stat, eth_stat, softnet_stat, proto_stat, kfree_skb } = requestData.data.PacketLoss;

    this.IOPacketData = net_err_stat;
    this.IOEhtStatData = eth_stat;
    this.queuePacketData = softnet_stat;
    this.stackPacketData = proto_stat;
    this.kernelPacketData = kfree_skb;
  }

  // 显示对应列表详情
  showDetail(detail: PacketLossDetailList) {
    detail.isActive = !detail.isActive;
  }

  /**
   * 打开 排查建议弹框
   * @param modalTem 弹框模板
   * @param index 点击下标
   */
  showSuggestion(modalTem: any, index: number) {
    this.suggestionList = this.handleSuggestionList(index);

    this.tiModal.open(modalTem, {
      modalClass: 'modal832'
    });
  }

  /**
   * 处理不同点击列表的排查建议
   * @param index 下标
   */
  private handleSuggestionList(index: number) {
    let suggestionList: SuggestionList[] = [];

    switch (index) {
      case 0:
        suggestionList = [
          {
            title: I18n.net_capture_loss.loss.suggestion_list_1[0].title, isActive: true,
            children: [
              {
                reason: I18n.net_capture_loss.loss.suggestion_list_1[0].reason,
                suggList: I18n.net_capture_loss.loss.suggestion_list_1[0].sugg_list
              }
            ]
          },
          {
            title: I18n.net_capture_loss.loss.suggestion_list_1[1].title, isActive: true,
            children: [
              {
                reason: I18n.net_capture_loss.loss.suggestion_list_1[1].reason,
                suggList: I18n.net_capture_loss.loss.suggestion_list_1[1].sugg_list
              },
              {
                reason: I18n.net_capture_loss.loss.suggestion_list_1[1].reason_1,
                suggList: I18n.net_capture_loss.loss.suggestion_list_1[1].sugg_list_1
              }
            ]
          },
          {
            title: I18n.net_capture_loss.loss.suggestion_list_1[2].title, isActive: true,
            children: [
              {
                reason: I18n.net_capture_loss.loss.suggestion_list_1[2].reason,
                suggList: I18n.net_capture_loss.loss.suggestion_list_1[2].sugg_list
              },
              {
                reason: I18n.net_capture_loss.loss.suggestion_list_1[2].reason_1,
                suggList: I18n.net_capture_loss.loss.suggestion_list_1[2].sugg_list_1
              },
              {
                reason: I18n.net_capture_loss.loss.suggestion_list_1[2].reason_2,
                suggList: I18n.net_capture_loss.loss.suggestion_list_1[2].sugg_list_2
              },
              {
                reason: I18n.net_capture_loss.loss.suggestion_list_1[2].reason_3,
                suggList: I18n.net_capture_loss.loss.suggestion_list_1[2].sugg_list_3
              },
              {
                reason: I18n.net_capture_loss.loss.suggestion_list_1[2].reason_4,
                suggList: I18n.net_capture_loss.loss.suggestion_list_1[2].sugg_list_4
              },
              {
                reason: I18n.net_capture_loss.loss.suggestion_list_1[2].reason_5,
                suggList: I18n.net_capture_loss.loss.suggestion_list_1[2].sugg_list_5
              },
              {
                reason: I18n.net_capture_loss.loss.suggestion_list_1[2].reason_6,
                suggList: I18n.net_capture_loss.loss.suggestion_list_1[2].sugg_list_6
              }
            ]
          }
        ];
        break;
      case 1:
        suggestionList = [
          {
            title: I18n.net_capture_loss.loss.suggestion_list_2[0].title, isActive: true,
            children: [
              {
                reason: I18n.net_capture_loss.loss.suggestion_list_2[0].reason,
                suggList: I18n.net_capture_loss.loss.suggestion_list_2[0].sugg_list
              }
            ]
          },
        ];
        break;
      case 2:
        suggestionList = [
          {
            title: I18n.net_capture_loss.loss.suggestion_list_3[0].title, isActive: true,
            children: [
              {
                reason: I18n.net_capture_loss.loss.suggestion_list_3[0].reason,
                suggList: I18n.net_capture_loss.loss.suggestion_list_3[0].sugg_list
              },
              {
                reason: I18n.net_capture_loss.loss.suggestion_list_3[0].reason_1,
                suggList: I18n.net_capture_loss.loss.suggestion_list_3[0].sugg_list_1
              }
            ]
          },
        ];
        break;
      default:
        suggestionList = [];
        break;
    }

    return suggestionList;
  }
}


