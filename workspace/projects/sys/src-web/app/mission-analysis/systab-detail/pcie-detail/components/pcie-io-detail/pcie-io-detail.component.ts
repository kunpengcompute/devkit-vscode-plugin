import { Component, Input, OnInit, OnChanges, SimpleChange } from '@angular/core';
import { TiPageSizeConfig, TiTableColumns, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';
import { I18nService } from '../../../../../service';

@Component({
  selector: 'app-pcie-io-detail',
  templateUrl: './pcie-io-detail.component.html',
  styleUrls: ['./pcie-io-detail.component.scss']
})
export class PcieIoDetailComponent implements OnInit, OnChanges {
  @Input() nodeInfo: any;
  i18n: any;
  showTable: boolean;
  tips: any;

  constructor(
    public i18nService: I18nService
  ) {
    this.i18n = this.i18nService.I18n();
  }

  public tabs: Array<any>;
  public columns: Array<TiTableColumns>;
  public displayed: Array<TiTableRowData> = []; // 表示表格实际呈现的数据（开发者默认设置为[]即可）
  public srcData: TiTableSrcData;
  public readData: Array<any>;
  public writeData: Array<any>;
  ngOnInit(): void {
    this.columns = [
      {
        title: this.i18n.pcieDetailsinfo.range,
        width: '40%'
      },
      {
        title: this.i18n.pcieDetailsinfo.read,
        width: '30%'
      },
      {
        title: this.i18n.pcieDetailsinfo.write,
        width: '30%'
      },
    ];
  }

  /**
   * Input 参数的变化时，将其赋值给相应的控件
   * @param changes 变化的 Input 参数
   */
  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    this.tabs = [
      {
        title: this.i18n.pcieDetailsinfo.io_value_sumury,
        active: true,
        onActiveChange: (isActive: boolean): void => {
          if (isActive) {
            this.tips = this.readData;
            this.srcData.data = this.readData;
            this.showTable = typeof (this.tips) === 'object' ? true : false;
          }
        }
      },
      {
        title: this.i18n.pcieDetailsinfo.io_delay_sumury,
        active: false,
        onActiveChange: (isActive: boolean): void => {
          if (isActive) {
            this.tips = this.writeData;
            this.showTable = typeof (this.tips) === 'object' ? true : false;
            this.srcData.data = this.writeData;
          }
        }
      },
    ];
    this.srcData = {
      data: this.readData,
      state: {
        searched: false,
        sorted: false,
        paginated: false
      }
    };
    if (changes.hasOwnProperty('nodeInfo')) {
      if (this.nodeInfo) {
        this.handleData(this.nodeInfo);
        if (this.tabs[0].active) {
          this.srcData.data = this.readData;
          this.tips = this.readData;
        } else {
          this.tips = this.writeData;
          this.srcData.data = this.writeData;
        }
      }
      this.showTable = typeof (this.tips) === 'object' ? true : false;
    }
  }

  /**
   * 处理io数据
   */
  public handleData(data: any) {
    if (typeof (data.io_distribution.value) === 'object') {
      const readData = [];
      for (const key of Object.keys(data.io_distribution.value)) {
        let range;
        let read;
        let write;
        range = key;
        read = data.io_distribution.value[key][0];
        write = data.io_distribution.value[key][1];
        const allData = {
          range,
          read,
          write,
        };
        readData.push(allData);
      }
      this.readData = readData;
    } else {
      this.readData = data.io_distribution.value;
    }
    if (typeof (data.io_latency.value) === 'object') {
      const writeData = [];
      for (const key of Object.keys(data.io_latency.value)) {
        let range;
        let read;
        let write;
        range = key;
        read = data.io_latency.value[key][0];
        write = data.io_latency.value[key][1];
        const allData = {
          range,
          read,
          write,
        };
        writeData.push(allData);
      }
      this.writeData = writeData;
    } else {
      this.writeData = data.io_latency.value;
    }

  }

  public trackByFn(index: number, item: any): number {
    return item.id;
  }

}
