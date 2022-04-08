import { Component, Input, OnInit } from '@angular/core';
import { TiModalService } from '@cloud/tiny3';
import { I18n } from 'sys/locale';
import { CpuIrqInfo, TableContainerData, IrqAffinityDetail } from '../../domain';

@Component({
  selector: 'app-interrupt-msg',
  templateUrl: './interrupt-msg.component.html',
  styleUrls: ['./interrupt-msg.component.scss']
})
export class InterruptMsgComponent implements OnInit {
  @Input() taskId: any;
  @Input() nodeid: any;
  @Input() numaNum = 4;
  @Input()
  set cpuCoreView(value: CpuIrqInfo[]) {
    if (value) {
      this.cpuData = JSON.parse(JSON.stringify(value));
      this.cpuCoreViewData.srcData = value;
    }
  }
  @Input()
  set hardNoView(value: { [irqNumber: number]: IrqAffinityDetail }) {
    if (value) {
      this.irqAffinityData = value;
    }
  }
  @Input()
  set ethCpuData(value: any) {
    if (value) {
      this.filterCpuData = value;
      this.initSelect(value);
    }
  }
  public interOption: Array<any>;
  public interSelected: { label: string; index: number; };
  public cpuOption: Array<any>;
  public cpuSelected: { label: string; id: string; };
  public cpuCoreViewData: TableContainerData;
  public irqAffinityData: { [irqNumber: number]: IrqAffinityDetail };
  public filterCpuData: any;
  public cpuData: any;
  public columns: any;
  constructor(
    private tiModal: TiModalService
  ) {
    this.columns = [
      {
        title: I18n.sys_res.core,
        prop: 'cpu_core',
        width: '20%',
        searchKey: 'cpu_core'
      },
      {
        title: I18n.net_io.xps_rps.hard_info.num_hard_inter,
        sortKey: 'irq_affinity_mask_num',
        asc: 'none',
        prop: 'irq_affinity_mask_num',
        dataKey: 'irq_affinity_mask_dict',
        width: '20%',
        callBack: true,
      },
      {
        title: I18n.net_io.xps_rps.hard_info.xps_hard_inter,
        sortKey: 'xps_affinity_mask_num',
        asc: 'none',
        prop: 'xps_affinity_mask_num',
        dataKey: 'xps_affinity_mask_dict',
        width: '20%',
        callBack: true
      },
      {
        title: I18n.net_io.xps_rps.hard_info.rps_hard_inter,
        sortKey: 'rps_affinity_mask_num',
        asc: 'none',
        prop: 'rps_affinity_mask_num',
        dataKey: 'rps_affinity_mask_dict',
        width: '40%',
        callBack: true
      },
    ];
  }
  ngOnInit(): void {
    this.interOption = [
      { label: I18n.net_io.xps_rps.hard_info.selected_list[0], index: 0 },
      { label: I18n.net_io.xps_rps.hard_info.selected_list[1], index: 1 }
    ];
    this.interSelected = this.interOption[0];
    this.cpuOption = [
      { label: I18n.popInfo.all, id: 'all' },
    ];
    this.cpuSelected = this.cpuOption[0];
    this.cpuCoreViewData = {
      title: '',
      columns: this.columns,
      srcData: this.cpuCoreView
    };

  }
  /**
   * CPU核视图 弹框展示
   * @param e 当前选中
   */

  public viewDetails(e: { prop: string, data: CpuIrqInfo }, modal: any) {
    const title = e.prop.includes('irq_affinity_mask') ? I18n.tuninghelper.detailedData.hard_bound
      : e.prop.includes('xps_affinity_mask') ? I18n.tuninghelper.detailedData.xps_bound
        : I18n.tuninghelper.detailedData.rps_bound;
    const data: any = e.data;
    const index = this.cpuCoreViewData.columns.findIndex((item: any) => {
      return item.prop === e.prop;
    });
    this.tiModal.open(modal, {
      modalClass: 'boundDetailsClass',
      context: {
        bodyTitle: title,
        count: this.cpuCoreViewData.columns[index].title,
        number: data[e.prop],
        cpu: e.data.cpu_core,
        data: data[`${this.cpuCoreViewData.columns[index].dataKey}`]
      }
    });
  }
  /**
   * 初始化cpu核视图筛选下拉框参数
   * @param data 筛选的数据
   */
  public initSelect(data?: any) {
    for (const key of Object.keys(data)) {
      if (key !== 'other') {
        const option = {
          label: key,
          id: key
        };
        this.cpuOption.push(option);
      }
    }
    this.cpuOption.push({
      label: I18n.popInfo.other,
      id: 'other'
    });
  }
  /**
   * cpu核视图筛选
   * @param selectedData 选中的中断设备
   */
  public cpuSelectedChange(selectedData: { id: string; }) {
    if (selectedData.id === 'all') {
      this.cpuCoreViewData = {
        title: '',
        columns: this.columns,
        srcData: this.cpuData
      };
    } else {
      const filterData = Object.keys(this.filterCpuData[selectedData.id]).sort().map((key: any, index: number) => {
        if (this.filterCpuData[selectedData.id]) {
          this.filterCpuData[selectedData.id][key].cpu_core = index;
          return this.filterCpuData[selectedData.id][key];
        }
      });
      this.cpuCoreViewData = {
        title: '',
        columns: this.columns,
        srcData: JSON.parse(JSON.stringify(filterData))
      };
    }
  }
}
