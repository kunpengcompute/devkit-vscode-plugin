import { Component, OnInit, Input } from '@angular/core';
import { TiTableColumns, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';
import { I18n } from 'sys/locale';
@Component({
  selector: 'app-storage-io-temp-detail-pressure',
  templateUrl: './storage-io-temp-detail-pressure.component.html',
  styleUrls: ['./storage-io-temp-detail-pressure.component.scss']
})
export class StorageIoTempDetailPressureComponent implements OnInit {
  @Input() detailPressure: any;
  public columns: Array<TiTableColumns> = [
    {
      title: I18n.storageIo.pressObj.nodeIp,
      width: '25%'
    },
    {
      title: I18n.storageIo.pressObj.nodeName,
      width: '25%'
    },
    {
      title: I18n.storageIo.pressObj.fileName,
      width: '45%'
    }
  ];
  public displayed: Array<TiTableRowData> = [];
  public srcData: TiTableSrcData;
  private data: Array<TiTableRowData> = [];
  constructor() { }

  ngOnInit(): void {
    this.srcData = {
      data: this.data,
      state: {
        searched: false,
        sorted: false,
        paginated: false
      }
    };
    this.data = this.detailPressure.map((item: any) => {
      const nodeIp = item.nodeIp;
      const nodeName = item.nodeName;
      const file_name = item.taskParam.file_name;
      return {
        nodeIp,
        nodeName,
        file_name
      };
    });
    this.srcData.data = this.data;
  }
}

