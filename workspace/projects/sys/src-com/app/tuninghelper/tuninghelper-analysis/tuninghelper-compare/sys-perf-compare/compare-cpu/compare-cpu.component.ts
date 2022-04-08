import { Component, OnInit } from '@angular/core';
import { I18n } from 'sys/locale';
import { HttpService } from 'sys/src-com/app/service';
import { CommonTableData } from 'sys/src-com/app/shared/domain';
import { TuninghelperStatusService } from '../../../service/tuninghelper-status.service';
import { CompareQueryTypeEnum } from '../domain/compare-query-type.enum';
import { CompareHandleService } from '../service/compare-handle.service';
import * as Utils from 'projects/sys/src-com/app/util';

@Component({
  selector: 'app-compare-cpu',
  templateUrl: './compare-cpu.component.html',
  styleUrls: ['./compare-cpu.component.scss'],
  providers: [
    { provide: CompareHandleService }
  ]
})
export class CompareCpuComponent implements OnInit {

  constructor(
    private http: HttpService,
    private tuninghelperStatusService: TuninghelperStatusService,
    public compareHandle: CompareHandleService
  ) { }
  public hasData = false;
  // CPU Core
  public cpuCoreData: any;
  // NUMA NODE
  public numaCoreData: any;
  // cpu负载
  public loadTableData: CommonTableData;
  // 硬中断信息-硬中断编号视图
  public hardNoView: any;
  // 硬中断信息-cpu核视图
  public cpuCoreView: any;
  // 中断分布统计
  public interruptDistribution: any;
  // 任务创建和上下文切换统计
  public cTextSwitchTableData: CommonTableData;
  // 微架构
  public mrcioTableData: CommonTableData;
  public mrcioInfo: any;

  async ngOnInit() {
    const res = await this.requestData();
    const data = res.data;
    this.hasData = !!data;
    this.cpuCoreData = data?.cpu_utilization;
    this.numaCoreData = data?.numa_info;
    this.hardNoView = data?.cpu_irq_info;
    this.cpuCoreView = data?.irq_cpu_info;
    this.interruptDistribution =
      Object.assign({}, data?.interrupt_distribution, { echartOpt: data?.interrupt_distributions });
    this.handleCpuLoadData(data?.cpu_load);
    this.getcTextSwitchData(data?.cpu_context_switch);
    this.getMrcioData(data?.cpu_micro);
  }
  public requestData(): Promise<any> {
    const params = {
      id: this.tuninghelperStatusService.taskId,
      'query-type': JSON.stringify([
        CompareQueryTypeEnum.CPUUTILIZATION,
        CompareQueryTypeEnum.NUMA_INFO,
        CompareQueryTypeEnum.CPULOAD,
        CompareQueryTypeEnum.CPUMICRO,
        CompareQueryTypeEnum.CPUCONTEXTSWITCH,
        CompareQueryTypeEnum.CPU_IRQ_INFO,
        CompareQueryTypeEnum.IRQ_CPU_INFO,
        CompareQueryTypeEnum.INTERRUPT_DISTRIBUTION,
        CompareQueryTypeEnum.INTERRUPT_DISTRIBUTIONS,
      ]),
    };
    return this.http.get(`/data-comparison/system-performance-comparison/`, { params });
  }
  public handleCpuLoadData(data: any) {
    const columns = [
      {
        label: I18n.tuninghelper.taskDetail.compareValue,
        key: 'compareValue',
        checked: true,
        expanded: true,
        disabled: true,
        children: [
          {
            label: 'runq-sz',
            key: 'runq-sz_string',
            checked: true,
            expanded: true,
            disabled: true,
            compareType: 'number',
            tip: I18n.net_io.tip.runq_tip
          },
          {
            label: 'plist-sz',
            key: 'plist-sz_string',
            checked: true,
            disabled: true,
            expanded: true,
            compareType: 'number',
            tip: I18n.net_io.tip.plist_tip
          },
          {
            label: 'ldavg-1',
            key: 'ldavg-1_string',
            checked: true,
            expanded: true,
            disabled: true,
            compareType: 'number',
            tip: I18n.net_io.tip.idavg_1_tip
          },
          {
            label: 'ldavg-5',
            key: 'ldavg-5_string',
            checked: true,
            expanded: true,
            disabled: true,
            compareType: 'number',
            tip: I18n.net_io.tip.idavg_5_tip
          },
          {
            label: 'ldavg-15',
            key: 'ldavg-15_string',
            checked: true,
            expanded: true,
            disabled: true,
            compareType: 'number',
            tip: I18n.net_io.tip.idavg_15_tip
          },
          {
            label: 'blocked',
            key: 'blocked_string',
            checked: true,
            expanded: true,
            disabled: true,
            compareType: 'number',
            tip: I18n.net_io.tip.blocked_tip
          }
        ]
      },
      {
        label: I18n.tuninghelper.taskDetail.objectOne,
        key: 'objectOne',
        checked: true,
        expanded: true,
        children: [
          {
            label: 'runq-sz',
            key: 'runq-sz1',
            checked: true,
            expanded: true,
            compareType: 'number',
            tip: I18n.net_io.tip.runq_tip
          },
          {
            label: 'plist-sz',
            key: 'plist-sz1',
            checked: false,
            expanded: true,
            compareType: 'number',
            tip: I18n.net_io.tip.plist_tip
          },
          {
            label: 'ldavg-1',
            key: 'ldavg-11',
            checked: false,
            expanded: true,
            compareType: 'number',
            tip: I18n.net_io.tip.idavg_1_tip
          },
          {
            label: 'ldavg-5',
            key: 'ldavg-51',
            checked: false,
            expanded: true,
            compareType: 'number',
            tip: I18n.net_io.tip.idavg_5_tip
          },
          {
            label: 'ldavg-15',
            key: 'ldavg-151',
            checked: false,
            expanded: true,
            compareType: 'number',
            tip: I18n.net_io.tip.idavg_15_tip
          },
          {
            label: 'blocked',
            key: 'blocked',
            checked: false,
            expanded: true,
            compareType: 'number',
            tip: I18n.net_io.tip.blocked_tip
          }
        ]
      },
      {
        label: I18n.tuninghelper.taskDetail.objectSecond,
        key: 'objectSecond',
        checked: true,
        expanded: true,
        children: [
          {
            label: 'runq-sz',
            key: 'runq-sz2',
            checked: true,
            expanded: true,
            compareType: 'number',
            tip: I18n.net_io.tip.runq_tip
          },
          {
            label: 'plist-sz',
            key: 'plist-sz2',
            checked: false,
            expanded: true,
            compareType: 'number',
            tip: I18n.net_io.tip.plist_tip
          },
          {
            label: 'ldavg-1',
            key: 'ldavg-12',
            checked: false,
            expanded: true,
            compareType: 'number',
            tip: I18n.net_io.tip.idavg_1_tip
          },
          {
            label: 'ldavg-5',
            key: 'ldavg-52',
            checked: false,
            expanded: true,
            compareType: 'number',
            tip: I18n.net_io.tip.idavg_5_tip
          },
          {
            label: 'ldavg-15',
            key: 'ldavg-152',
            checked: false,
            expanded: true,
            compareType: 'number',
            tip: I18n.net_io.tip.idavg_15_tip
          },
          {
            label: 'blocked',
            key: 'blocked2',
            checked: false,
            expanded: true,
            compareType: 'number',
            tip: I18n.net_io.tip.blocked_tip
          }
        ]
      }
    ];
    const type = ['runq-sz', 'plist-sz', 'ldavg-1', 'ldavg-5', 'ldavg-15', 'blocked'];
    const cpuCoreObj: any = {};
    type.forEach((item: string) => {
      cpuCoreObj[item] = data[item][2];
      cpuCoreObj[item + '_string'] = this.compareHandle.getCompareValue(data[item]);
      cpuCoreObj[item + '1'] = Utils.setThousandSeparator(data[item][0]);
      cpuCoreObj[item + '2'] = Utils.setThousandSeparator(data[item][1]);
    });
    this.loadTableData = {
      srcData: {
        data: [...cpuCoreObj],
        state: {
          searched: false,
          sorted: false,
          paginated: false
        }
      },
      columnsTree: columns,
    };
  }

  public getcTextSwitchData(data: any) {
    const columns = [
      {
        label: I18n.tuninghelper.taskDetail.compareValue,
        key: 'compareValue',
        checked: true,
        expanded: true,
        children: [
          {
            label: 'proc/s',
            key: 'proc_string',
            checked: true,
            expanded: true,
            disabled: true,
            compareType: 'number',
            tip: I18n.tuninghelper.detailedData.proc_tip
          },
          {
            label: 'cswch/s',
            key: 'cswch_string',
            checked: true,
            expanded: true,
            disabled: true,
            compareType: 'number',
            tip: I18n.tuninghelper.detailedData.cswch_tip
          }
        ]
      },
      {
        label: I18n.tuninghelper.taskDetail.objectOne,
        key: 'objectOne',
        checked: true,
        expanded: true,
        children: [
          {
            label: 'proc/s',
            key: 'proc1',
            checked: true,
            expanded: true,
            compareType: 'number',
            tip: I18n.tuninghelper.detailedData.proc_tip
          },
          {
            label: 'cswch/s',
            key: 'cswch1',
            checked: true,
            expanded: true,
            compareType: 'number',
            tip: I18n.tuninghelper.detailedData.cswch_tip
          }
        ]
      },
      {
        label: I18n.tuninghelper.taskDetail.objectSecond,
        key: 'objectSecond',
        checked: true,
        expanded: true,
        children: [
          {
            label: 'proc/s',
            key: 'proc2',
            checked: true,
            expanded: true,
            compareType: 'number',
            tip: I18n.tuninghelper.detailedData.proc_tip
          },
          {
            label: 'cswch/s',
            key: 'cswch2',
            checked: true,
            expanded: true,
            compareType: 'number',
            tip: I18n.tuninghelper.detailedData.cswch_tip
          }
        ]
      }
    ];
    const type = ['proc', 'cswch'];
    const ctsObj: any = {};
    type.forEach((item: string) => {
      ctsObj[item] = Utils.setThousandSeparator(data[item][0] - data[item][1]);
      ctsObj[item + '_string'] = this.compareHandle.getCompareValue(data[item]);
      ctsObj[item + '1'] = Utils.setThousandSeparator(data[item][0]);
      ctsObj[item + '2'] = Utils.setThousandSeparator(data[item][1]);
    });
    this.cTextSwitchTableData = {
      srcData: {
        data: [...ctsObj],
        state: {
          searched: false,
          sorted: false,
          paginated: false
        }
      },
      columnsTree: columns,
    };
  }
  public getMrcioData(data: any) {
    const columns = [
      {
        label: I18n.micarch.eventName,
        key: 'event',
        checked: true,
        expanded: true,
        disabled: true,
        searchKey: 'event'
      },
      {
        label: I18n.tuninghelper.taskDetail.compareValue,
        key: 'compareValue',
        checked: true,
        expanded: true,
        children: [
          {
            label: I18n.tuninghelper.taskDetail.value,
            key: 'compareVal_string',
            checked: true,
            expanded: true,
            compareType: 'number',
            tip: ''
          }
        ]
      },
      {
        label: I18n.tuninghelper.taskDetail.objectOne,
        key: 'objectOne',
        checked: true,
        expanded: true,
        children: [
          {
            label: I18n.tuninghelper.taskDetail.value,
            key: 'value1',
            checked: true,
            expanded: true,
            compareType: 'number',
            tip: ''
          }
        ]
      },
      {
        label: I18n.tuninghelper.taskDetail.objectSecond,
        key: 'objectSecond',
        checked: true,
        expanded: true,
        children: [
          {
            label: I18n.tuninghelper.taskDetail.value,
            key: 'value2',
            checked: true,
            expanded: true,
            compareType: 'number',
            tip: ''
          }
        ]
      }
    ];
    const info = [];
    info.push(
      {
        key: 'Cycles',
        value1: data.cycles[0],
        value2: data.cycles[1]
      },
      {
        key: 'Instructions',
        value1: data.instructions[0],
        value2: data.instructions[1]
      },
      {
        key: 'IPC',
        value1: data.IPC[0],
        value2: data.IPC[1]
      },
    );
    this.mrcioInfo = info;
    const mrcioData: any = [];
    Object.keys(data).sort().map((key) => {
      if (key !== 'cycles' && key !== 'instructions' && key !== 'IPC' && !key.includes('rate')) {
        let rateKey = '';
        if (key.includes('misses')) {
          rateKey = key.split(' ')[0] + ' miss rate';
          if (!data[rateKey]) {
            rateKey = key.split(' ')[0] + ' cache miss rate';
          }
        }
        const mrcioObj: any = {};
        mrcioObj.event = key;
        mrcioObj.compareVal = Utils.setThousandSeparator(data[key][0] - data[key][1]);
        mrcioObj.compareVal_string = this.compareHandle.getCompareValue(data[key]);
        mrcioObj.value1 =
          `${Utils.setThousandSeparator(data[key][0])}${data[rateKey] ?
            I18n.common_term_sign_left + data[rateKey][0] + I18n.common_term_sign_right : ''}`;
        mrcioObj.value2 = `${Utils.setThousandSeparator(data[key][1])}${data[rateKey] ?
          I18n.common_term_sign_left + data[rateKey][1] + I18n.common_term_sign_right : ''}`;
        mrcioData.push(mrcioObj);
      }
    });
    this.mrcioTableData = {
      srcData: {
        data: mrcioData,
        state: {
          searched: false,
          sorted: false,
          paginated: false
        }
      },
      columnsTree: columns,
    };
  }
}
