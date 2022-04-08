import { Component, Input, OnInit } from '@angular/core';
import { TiTableColumns, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';
import { I18n } from 'sys/locale';
import { CommonTableData } from 'sys/src-com/app/shared/domain';
import { CapturePkgRaw } from '../../../domain';

type CaptureTableData = {
  time: string,
  mac1: string,
  ip1: string,
  port1: string,
  mac2: string,
  ip2: string,
  port2: string,
  agreement: string,
  len: number,
  headerInfo: string
};
@Component({
  selector: 'app-capture-packet-table',
  templateUrl: './capture-packet-table.component.html',
  styleUrls: ['./capture-packet-table.component.scss']
})
export class CapturePacketTableComponent implements OnInit {

  @Input()
  set captureData(val: CapturePkgRaw['tcpdump_info']) {
    if (!val) { return; }

    this.srcData.data = this.handelCaptureData(val);

    this.tableData = [...this.srcData.data];
    this.totalNumber = this.srcData.data.length;
    setTimeout(() => {
      // 给筛选列赋值
      this.columns[3].filterConfig.options = [...new Set(this.srcData.data.map(data => data.agreement))].map(data => ({
        label: data
      }));
      this.columns[3].filterConfig.selected = [...this.columns[3].filterConfig.options];
      this.commonTableData = {
        srcData: {
          data: JSON.parse(JSON.stringify(this.tableData)),
          state: {
            searched: false,
            sorted: false,
            paginated: false,
          },
        },
        columnsTree: this.columns,
      };
    }, 0);
  }
  public tableData: TiTableRowData[]; // 存储原始表格数据，用于表格筛选使用
  public displayed: Array<TiTableRowData> = [];
  public srcData: TiTableSrcData = {
    data: [],
    state: {
      searched: false,
      sorted: false,
      paginated: false
    }
  };
  public columns: Array<TiTableColumns> = [];

  // 分页数据
  public currentPage = 1;
  public totalNumber: number;
  public pageSize: { options: Array<number>, size: number } = {
    options: [10, 20, 40, 80, 100],
    size: 10
  };

  public searchWords: any[] = [];
  public searchKeys: any[] = [];
  public isShowSearchBox = false;
  public searchInput = '';
  public commonTableData: CommonTableData;

  constructor() { }

  ngOnInit(): void {
    this.columns = this.initColumns();
  }
  // 初始化 columns
  private initColumns(): TiTableColumns[] {
    const columns: any = [
      { label: I18n.mission_modal.lockSummary.timing, key: 'time', sortKey: 'time', compareType: 'string' },
      { label: I18n.net_capture_loss.capture.mac_address_1, key: 'mac1', searchKey: 'mac1', active: false },
      { label: I18n.net_capture_loss.capture.mac_address_2, key: 'mac2', searchKey: 'mac2', active: false },
      {
        label: I18n.nodeManagement.keyType,
        key: 'agreement',
        filterConfig: {
          multiple: true,
          searchable: true,
          options: [],
          selected: [],
        }
      },
      { label: I18n.net_capture_loss.capture.byte, key: 'len', sortKey: 'len' },
      { label: I18n.net_capture_loss.capture.ip_address_1, key: 'ip1', searchKey: 'ip1', active: false },
      { label: I18n.net_capture_loss.capture.port_1, key: 'port1', searchKey: 'port1', active: false },
      { label: I18n.net_capture_loss.capture.ip_address_2, key: 'ip2', searchKey: 'ip2', active: false },
      { label: I18n.net_capture_loss.capture.port_2, key: 'port2', searchKey: 'port2', active: false },
      { label: I18n.net_capture_loss.capture.header_info, key: 'headerInfo', searchKey: 'headerInfo', active: false }
    ];
    return columns;
  }

  /**
   * 对后端传回的表格数据作处理
   * @param captureData 数据
   */
  private handelCaptureData(captureData: CapturePkgRaw['tcpdump_info']): CaptureTableData[] {
    const captureTableData: CaptureTableData[] = [];

    captureData.forEach((data: string[]) => {
      const [time, mac1, mac2, agreement, len, ip1, port1, ip2, port2, headerInfo] = data;

      captureTableData.push({
        time, mac1, mac2, agreement,
        len: Number(len), ip1, port1, ip2, port2,
        headerInfo
      });
    });

    return captureTableData;
  }

  /**
   * 显示搜索框
   * @param column 点击表头行详情
   */
  public showSearchBox(column: TiTableColumns) {
    this.searchKeys[0] === column.prop
      ? this.handleSearchStatus(column, false)
      : this.handleSearchStatus(column, true);
    this.searchInput = '';
    this.searchValueChange('');
  }

  /**
   * 对搜索框 显示 隐藏 作不同处理
   * @param column 点击表头行详情
   * @param flag 开关状态
   */
  private handleSearchStatus(column: TiTableColumns, flag: boolean) {
    this.isShowSearchBox = flag;
    this.searchKeys = !flag ? [] : [column.prop];
    this.columns.forEach((col) => {
      col.active = false;
    });
    column.active = flag;
  }

  // 搜索框值改变
  public searchValueChange(value: string): void {
    this.searchWords[0] = value;
  }

  // 协议类型过滤
  public headFilterSelect() {
    this.srcData.data = this.tableData.filter((rowData: TiTableRowData) => {
      for (const colum of this.columns) {
        if (colum.selected && colum.selected.length) {
          const index = colum.selected.findIndex((item: any) => item.label === rowData[colum.filterKey]);
          if (index < 0) {
            return false;
          }
        } else if (colum.selected?.length === 0) {
          return false;
        }
      }
      return true;
    });

    this.totalNumber = this.srcData.data.length;
  }
}
