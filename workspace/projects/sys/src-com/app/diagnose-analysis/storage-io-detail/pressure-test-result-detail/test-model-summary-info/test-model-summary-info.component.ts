import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { I18n } from 'sys/locale';
import { LANGUAGE_TYPE } from 'sys/src-com/app/global/constant';
import { I18nService } from 'sys/src-com/app/service';
import { LatencyIconName } from 'sys/src-com/app/shared/icon-lib/regedit/icon-static/diagnose-storage-io/io-latency-icon.interface';
import { LatencyStatus, RwType } from '../domain';
import { TestModelDetail } from '../pressure-test-result-detail.component';

@Component({
  selector: 'app-test-model-summary-info',
  templateUrl: './test-model-summary-info.component.html',
  styleUrls: ['./test-model-summary-info.component.scss']
})
export class TestModelSummaryInfoComponent implements OnInit {
  @Input() testModel: TestModelDetail;
  @Output() private expandTrigger = new EventEmitter<any>();

  // 左侧显示总览信息
  summaryLeftList: any[] = [];

  // 右侧关键指标
  keyIndicatorList: Array<{
    name: string,
    value: any,
    status?: LatencyStatus,
    suggestion?: string,
    reason?: string;
  }> = [];

  // 左侧tips内容
  formList: Array<{ name: string, value: any }> = [];

  // 时延状态对应的图标
  latencyStatus: {
    [propName in LatencyStatus]?: LatencyIconName;
  } = {
    fast: 'ioLatencyFast',
    good: 'ioLatencyGood',
    slow: 'ioLatencySlow',
  };

  // 时延优化建议对应图标
  latencySugIconName: {
    [propName: string]: LatencyIconName
  } = {
    sug: 'ioLatencySuggestion'
  };

  // 读写模式
  private rwType: {
    [key in RwType]: string
  } = {
    read: I18n.storageIo.keyMetric.read,
    write: I18n.storageIo.keyMetric.write,
    rw: I18n.storageIo.keyMetric.rw,
    randread: I18n.storageIo.keyMetric.randRead,
    randwrite: I18n.storageIo.keyMetric.randWrite,
    randrw: I18n.storageIo.keyMetric.randRw,
  };

  constructor(
    private i18nService: I18nService
  ) { }

  ngOnInit(): void {
    // 对后端返回的数据进行处理为前端显示的数据
    this.getSummaryLeftList();
    this.getFormList();
    this.getKeyIndicatorList();
  }

  /**
   * 获取左侧显示的信息
   */
  private getSummaryLeftList() {
    const modelSummaryData: any = this.testModel.summary;
    const summaryLeftArr = Object.keys(modelSummaryData).filter(key => key !== 'model_id'
      && key !== 'key_indicator' && key !== 'indicator_form');
    for (const key of summaryLeftArr) {
      if (key === 'rw_type') {
        this.summaryLeftList.push(this.rwType[modelSummaryData[key] as RwType]);
      } else {
        this.summaryLeftList.push(modelSummaryData[key]);
      }
    }
  }

  /**
   * 获取左侧tip显示内容
   */
  private getFormList() {
    const { block_size, rw_type, rw_mix_read_ratio, iodepth, ioengine,
      numjobs, direct, size, runtime } = this.testModel.summary;
    this.formList = [
      {
        name: I18n.storage_io_detail.result_tab.block_size,
        value: block_size,
      },
      {
        name: I18n.storage_io_detail.result_tab.rw_type,
        value: this.rwType[rw_type],
      },
      {
        name: I18n.storage_io_detail.result_tab.rw_mix_read_ratio,
        value: rw_mix_read_ratio,
      },
      {
        name: I18n.storage_io_detail.result_tab.io_depth,
        value: iodepth,
      },
      {
        name: I18n.storage_io_detail.result_tab.io_engine,
        value: ioengine,
      },
      {
        name: I18n.storage_io_detail.result_tab.num_jobs,
        value: numjobs,
      },
      {
        name: I18n.storage_io_detail.result_tab.direct,
        value: direct,
      },
      {
        name: I18n.storage_io_detail.result_tab.size,
        value: size,
      },
      {
        name: I18n.storage_io_detail.result_tab.run_time,
        value: runtime,
      },
    ];
  }

  /**
   * 获取右侧指标显示内容
   */
  private getKeyIndicatorList() {
    const { read_throughput, write_throughput, read_IOPS, write_IOPS,
      read_latency, write_latency } = this.testModel.summary.key_indicator;
    this.keyIndicatorList = [
      {
        name: I18n.storage_io_detail.result_tab.read_throughput,
        value: read_throughput,
      },
      {
        name: I18n.storage_io_detail.result_tab.write_throughput,
        value: write_throughput,
      },
      {
        name: I18n.storage_io_detail.result_tab.read_iops,
        value: read_IOPS,
      },
      {
        name: I18n.storage_io_detail.result_tab.write_iops,
        value: write_IOPS,
      },
      {
        name: I18n.storage_io_detail.result_tab.read_latency,
        value: read_latency.value,
        status: read_latency.status,
        suggestion: this.i18nService.currLang === LANGUAGE_TYPE.ZH ? read_latency.suggestion.suggest_chs
          : read_latency.suggestion.suggest_en,
        reason: this.i18nService.currLang === LANGUAGE_TYPE.ZH ? read_latency.suggestion.title_chs
          : read_latency.suggestion.title_en,
      },
      {
        name: I18n.storage_io_detail.result_tab.write_latency,
        value: write_latency.value,
        status: write_latency.status,
        suggestion: this.i18nService.currLang === LANGUAGE_TYPE.ZH ? write_latency.suggestion.suggest_chs
          : write_latency.suggestion.suggest_en,
        reason: this.i18nService.currLang === LANGUAGE_TYPE.ZH ? write_latency.suggestion.title_chs
          : write_latency.suggestion.title_en,
      },
    ];
  }

  handleExpand(testModel: any) {
    this.expandTrigger.emit(testModel);
  }
}
