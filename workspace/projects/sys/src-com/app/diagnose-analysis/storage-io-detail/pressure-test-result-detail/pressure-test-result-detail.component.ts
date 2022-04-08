import { Component, Input, OnInit } from '@angular/core';
import { I18n } from 'sys/locale';
import { RespCommon } from 'sys/src-com/app/domain';
import { STATUS_CODE } from 'sys/src-com/app/global/constant';
import { StorageIoService } from '../service/storage-io-service';
import { ModelDetailData, ModelSummaryData, RespModelDetailData, RespModelSummaryData } from './domain';

/** 展开项label类型 */
export type ExpandItemName =
  // 基础指标
  'basic_indicator' |
  // 时延时序数据
  'latency_diagram' |
  // iops时序数据
  'iops_diagram' |
  // 吞吐量时序数据
  'throughput_diagram' |
  // 时延
  'latency' |
  // 时延分布
  'latency_distribution' |
  // io深度分布
  'io_distribution' |
  // 压测进程性能
  'process_perf' |
  // 存储设备性能
  'dev_perf';

/** 测试模型展开项数据类型 */
export type TestModeExpandItem = {
  name: string;
  // 是否展开
  expand: boolean;
  // 表格或图表数据
  data: any;
};

/** 测试模型详情类型 */
export type TestModelDetail = {
  // 用于控制行展开
  index: number;
  // 测试模型简要信息
  summary: ModelSummaryData;
  // 展开详情
  children: TestModeExpandItem[];
  // 是否展开
  expand: boolean;
  // 是否是第一次展开
  isFirstExpand: boolean;
};

@Component({
  selector: 'app-pressure-test-result-detail',
  templateUrl: './pressure-test-result-detail.component.html',
  styleUrls: ['./pressure-test-result-detail.component.scss'],
})
export class PressureTestResultDetailComponent implements OnInit {
  @Input() taskId: number;
  @Input() nodeId: number;
  @Input() hasDiagram: boolean;

  // 压测对象
  pressureTestObject = '';

  // 测试模型详情
  testModelList: TestModelDetail[] = [];

  // 展开项的名称，用于判断展开项
  expandItemName: {
    [name in ExpandItemName]: string
  };

  constructor(
    private storageIoService: StorageIoService,
  ) {
  }

  ngOnInit(): void {
    this.expandItemName = {
      basic_indicator: I18n.storage_io_detail.result_tab.basic_indicator,
      latency_diagram: I18n.storage_io_detail.result_tab.latency_diagram,
      iops_diagram: I18n.storage_io_detail.result_tab.iops_diagram,
      throughput_diagram: I18n.storage_io_detail.result_tab.throughput_diagram,
      latency: I18n.storage_io_detail.result_tab.latency,
      latency_distribution: I18n.storage_io_detail.result_tab.latency_distribution,
      io_distribution: I18n.storage_io_detail.result_tab.io_distribution,
      process_perf: I18n.storage_io_detail.result_tab.process_perf,
      dev_perf: I18n.storage_io_detail.result_tab.dev_perf,
    };
    this.getData();
  }

  /**
   * 调用接口获取测试模型数据
   */
  private getData() {
    this.testModelList = [];
    this.storageIoService.getSummryData(this.taskId, this.nodeId)
      .then((res: RespCommon<RespModelSummaryData>) => {
        if (res?.code === STATUS_CODE.SUCCESS) {
          const data: { test_object: string, summary_list: any[] } = res.data?.Diagnostics.data;
          this.pressureTestObject = data.test_object;
          if (data.summary_list && data.summary_list.length) {
            this.testModelList = data.summary_list.map((summary: ModelSummaryData, index: number) => {
              return {
                index,
                summary,
                children: [],
                expand: false,
                isFirstExpand: false
              };
            });
          }

          if (this.testModelList.length) {
            // 获取展开的详情数据
            this.getModelDetail(this.testModelList[0]);
          }
        }
      })
      .catch((error) => {
      });
  }

  /**
   * 获取模型详情数据
   * @param model 模型详情
   */
  private getModelDetail(model: TestModelDetail) {
    this.storageIoService.getModelData(this.taskId, this.nodeId, model.summary.model_id)
      .then((res: RespCommon<RespModelDetailData>) => {
        if (res?.code === STATUS_CODE.SUCCESS) {
          const modelDetail: ModelDetailData = res.data?.Diagnostics.data;
          Object.keys(modelDetail).forEach((key: ExpandItemName) => {
            const expandItem: TestModeExpandItem = {
              name: this.expandItemName[key],
              expand: true,
              data: modelDetail[key],
            };
            model.children.push(expandItem);
          });

          // 没有开启统计周期，不显示时序图
          if (!this.hasDiagram) {
            model.children = model.children.filter(
              item => item.name !== I18n.storage_io_detail.result_tab.latency_diagram
                && item.name !== I18n.storage_io_detail.result_tab.iops_diagram
                && item.name !== I18n.storage_io_detail.result_tab.throughput_diagram
            );
          }
        }

        this.hideOtherRow(model);
        model.expand = true;
        model.isFirstExpand = true;
      })
      .catch((error) => {
        model.expand = true;
      });
  }

  /**
   * 点击展开行
   * @param model model
   */
  handleExpand(model: TestModelDetail) {
    if (!model.isFirstExpand) {
      this.getModelDetail(model);
    } else {
      this.hideOtherRow(model);
      model.expand = !model.expand;
    }
  }

  /**
   * 折叠其他行
   * @param row 当前行
   */
  private hideOtherRow(row: TestModelDetail) {
    this.testModelList.forEach((item: TestModelDetail) => {
      // 其他行折叠
      if (item.index !== row.index) {
        item.expand = false;
      }
    });
  }

  /**
   * 点击展开行
   * @param rowChild 行里面子项
   */
  handleExpandChild(rowChild: TestModeExpandItem) {
    rowChild.expand = !rowChild.expand;
  }
}
