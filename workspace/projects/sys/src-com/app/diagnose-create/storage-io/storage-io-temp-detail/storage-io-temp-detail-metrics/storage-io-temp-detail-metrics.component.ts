import { Component, Input, OnInit } from '@angular/core';
import { TiTableColumns, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';
import { I18n } from 'sys/locale';

@Component({
  selector: 'app-storage-io-temp-detail-metrics',
  templateUrl: './storage-io-temp-detail-metrics.component.html',
  styleUrls: ['./storage-io-temp-detail-metrics.component.scss']
})
export class StorageIoTempDetailMetricsComponent implements OnInit {
  @Input() detailMetrics: any;
  public columns: Array<TiTableColumns> = [
    {
      title: I18n.storageIo.keyMetric.blockSize,
      width: '10%'
    },
    {
      title: I18n.storageIo.keyMetric.type,
      width: '10%'
    },
    {
      title: I18n.storageIo.keyMetric.rate,
      width: '10%'
    },
    {
      title: I18n.storageIo.keyMetric.ioDepth,
      width: '10%'
    },
    {
      title: I18n.storageIo.keyMetric.ioEngine,
      width: '10%'
    },
    {
      title: I18n.storageIo.keyMetric.concurrency,
      width: '10%'
    },
    {
      title: I18n.storage_io_detail.result_tab.direct,
      width: '10%'
    },
    {
      title: I18n.storageIo.keyMetric.ioSize,
      width: '10%'
    },
    {
      title: I18n.storageIo.keyMetric.testTime,
      width: '10%'
    },
    {
      title: I18n.storageIo.keyMetric.relateMetric,
      width: '10%'
    }
  ];
  public displayed: Array<TiTableRowData> = [];
  public srcData: TiTableSrcData;
  private data: Array<TiTableRowData> = [];
  public rwMixRead = [I18n.storageIo.keyMetric.rw, I18n.storageIo.keyMetric.randRw];
  constructor() { }
  public cProcessing(item: any) {
    if (item.length) {
      const count = item.split('|').map((val: any) => {
        return this.mode(val);
      });
      return count.join(' | ');
    }
  }
  public mode(item: any) {
    switch (item) {
      case 'read':
        return I18n.storageIo.keyMetric.read;
      case 'write':
        return I18n.storageIo.keyMetric.read;
      case 'rw':
        return I18n.storageIo.keyMetric.rw;
      case 'randrw':
        return I18n.storageIo.keyMetric.randRw;
      case 'randread':
        return I18n.storageIo.keyMetric.randRead;
      case 'randwrite':
        return I18n.storageIo.keyMetric.randWrite;
      case 'iops':
        return 'IOPS';
      case 'throughput':
        return I18n.storageIo.keyMetric.throughput;
      case 'latency':
        return I18n.storageIo.keyMetric.delay;
      case '1':
        return 'Y';
      case '0':
        return 'N';
      default:
        return item;
    }
  }
  ngOnInit(): void {
    this.srcData = {
      data: this.data,
      state: {
        searched: false,
        sorted: false,
        paginated: false
      }
    };
    this.srcData.data = this.detailMetrics.map((item: any) => {
      const block_size = item.block_size;
      const rwType = this.mode(item.rw_type);
      const rw_mix_read_ratio = item.rw_mix_read_ratio;
      const io_depth = item.io_depth;
      const io_engine = item.io_engine;
      const num_jobs = item.num_jobs;
      const direct = this.mode(item.direct);
      const size = item.size;
      const runtime = item.runtime;
      const indicatorType = this.cProcessing(item.indicator_type);
      return {
        block_size,
        rwType,
        rw_mix_read_ratio,
        io_depth,
        io_engine,
        num_jobs,
        direct,
        size,
        runtime,
        indicatorType,
      };
    });
  }
}

