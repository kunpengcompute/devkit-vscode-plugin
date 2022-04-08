import { Component, ComponentRef, Input, ViewChild } from '@angular/core';
import { TiModalService, TiTableColumns, TiTableRowData, TiTableSrcData, TiTipDirective } from '@cloud/tiny3';
import { I18n } from 'sys/locale';
import { PocketLossRaw } from '../../../domain';

type IOPacketTableData = {
  iface: string, rxerr: string,
  txerr: string, coll: string,
  rxdrop: string, txdrop: string, txcarr: string,
  rxfram: string, rxfifo: string, txfifo: string,
  children?: IOPacketTableData[]
};

@Component({
  selector: 'app-network-io-packet-loss',
  templateUrl: './network-io-packet-loss.component.html',
  styleUrls: ['./network-io-packet-loss.component.scss']
})
export class NetworkIOPacketLossComponent {

  @Input()
  set IOPacketData(val: PocketLossRaw['net_err_stat']) {
    if (!val) { return; }

    this.srcData.data = this.handelIOPacketData(val);
    // 保存总的条数，避免搜索结果小于10条，清空搜索后数据显示不全的问题
    this.originTotalNum = JSON.parse(JSON.stringify(this.srcData.data)).length;
    this.totalNumber = this.srcData.data.length;
  }

  @Input() IOEhtStatData: PocketLossRaw['eth_stat'];

  searchWord = '';
  searchWords = [''];
  searchKeys = ['iface'];

  displayed: Array<TiTableRowData> = [];
  srcData: TiTableSrcData = {
    data: [],
    state: {
      searched: false,
      sorted: false,
      paginated: false
    }
  };
  columns: Array<TiTableColumns> = this.initColumns();

  // 分页数据
  currentPage = 1;
  totalNumber: number;
  pageSize: { options: Array<number>, size: number } = {
    options: [10, 20, 40, 80, 100],
    size: 10
  };
  private originTotalNum: number;

  constructor(private tiModal: TiModalService) { }

  // 对表格进行排序
  sortTableFn(a: TiTableColumns, b: TiTableColumns, predicate: string) {
    return Number(a[predicate]) - Number(b[predicate]);
  }

  /**
   * 搜索框值改变事件
   * @param value 输入值
   */
  searchValueChange(value: string) {
    if (value.trim() === '') {
      this.totalNumber = this.originTotalNum;
    }
    this.searchWords[0] = value;
  }

  /**
   * 打开 统计信息弹框
   * @param column 点击行详情
   * @param modalTem 弹框模板
   */
  showStatisticModal(column: TiTableColumns, modalTem: any) {
    const { iface } = column;

    this.tiModal.open(modalTem, {
      modalClass: 'modal832',
      context: {
        title: iface,
        msg: this.IOEhtStatData[iface].replace(/\n/g, '<br />')
      }
    });
  }

  // 初始化 columns
  private initColumns(): TiTableColumns[] {
    const columns = [
      { title: '', width: '3%' },
      { title: 'IFACE', prop: 'iface', searchShow: true, tip: I18n.sys.tip.IFACE },
      { title: 'rxerr/s', prop: 'rxerr', sortKey: 'rxerr', tip: I18n.sys.tip['rxerr/s'] },
      { title: 'txerr/s', prop: 'txerr', sortKey: 'txerr', tip: I18n.net_capture_loss.loss.io_packet.txerr },
      { title: 'coll/s', prop: 'coll', sortKey: 'coll', tip: I18n.net_capture_loss.loss.io_packet.coll },
      { title: 'rxdrop/s', prop: 'rxdrop', sortKey: 'rxdrop', tip: I18n.net_capture_loss.loss.io_packet.rxdrop },
      { title: 'txdrop/s', prop: 'txdrop', sortKey: 'txdrop', tip: I18n.net_capture_loss.loss.io_packet.txdrop },
      { title: 'txcarr/s', prop: 'txcarr', sortKey: 'txcarr', tip: I18n.net_capture_loss.loss.io_packet.txcarr },
      { title: 'rxfram/s', prop: 'rxfram', sortKey: 'rxfram', tip: I18n.net_capture_loss.loss.io_packet.rxfram },
      { title: 'rxfifo/s', prop: 'rxfifo', sortKey: 'rxfifo', tip: I18n.net_capture_loss.loss.io_packet.rxfifo },
      { title: 'txfifo/s', prop: 'txfifo', sortKey: 'txfifo', tip: I18n.net_capture_loss.loss.io_packet.txfifo }
    ];

    return columns;
  }

  /**
   * 对后端传回的表格数据作处理
   * @param queuePacketData 数据
   */
  private handelIOPacketData(IOPacketData: PocketLossRaw['net_err_stat']): IOPacketTableData[] {
    const ioPacketTableData: IOPacketTableData[] = [];

    Object.keys(IOPacketData).forEach((key: string, i: number) => {
      const children: IOPacketTableData[] = [];

      IOPacketData[key].forEach((data: string[], index: number) => {
        const [
          iface, rxerr, txerr, coll,
          rxdrop, txdrop, txcarr,
          rxfram, rxfifo, txfifo
        ] = data;

        if (index === 0) {
          ioPacketTableData.push({
            iface, rxerr, txerr, coll,
            rxdrop, txdrop, txcarr,
            rxfram, rxfifo, txfifo
          });
        } else {
          children.push({
            iface, rxerr, txerr, coll,
            rxdrop, txdrop, txcarr,
            rxfram, rxfifo, txfifo
          });
        }
      });

      if (children.length) {
        ioPacketTableData[i].children = children;
      }
    });

    return ioPacketTableData;
  }

}
