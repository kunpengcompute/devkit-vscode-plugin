import { Component, Input, OnInit } from '@angular/core';
import { I18n } from 'sys/locale';
import { CommonTableData } from 'sys/src-com/app/shared/domain';
import { CompareHandleService } from '../../service/compare-handle.service';

@Component({
  selector: 'app-interrupt-msg-compare',
  templateUrl: './interrupt-msg-compare.component.html',
  styleUrls: ['./interrupt-msg-compare.component.scss']
})
export class InterruptMsgCompareComponent implements OnInit {
  @Input()
  set hardIrqData(value: any[]) {
    if (value) {
      this.getHardTableData(value);
    }
  }
  @Input()
  set cpuCoreData(value: any[]) {
    if (value) {
      this.getCoreTableData(value);
    }
  }
  constructor(
    public compareHandle: CompareHandleService
  ) { }
  public interOption: Array<any>;
  public interSelected: { label: string; index: number; };
  public hardIrqTableData: CommonTableData;
  public coreTableData: CommonTableData;

  ngOnInit(): void {
    this.interOption = [
      { label: I18n.net_io.xps_rps.hard_info.selected_list[0], index: 0 },
      { label: I18n.net_io.xps_rps.hard_info.selected_list[1], index: 1 }
    ];
    this.interSelected = this.interOption[0];
  }
  public getHardTableData(data: any) {
    const columns = [
      {
        label: I18n.net_io.xps_rps.hard_info.inter_name,
        width: '20%',
        key: 'irqName',
        checked: true,
        expanded: true,
        disabled: true,
        searchKey: 'irqName'
      },
      {
        label: I18n.tuninghelper.taskDetail.compareValue,
        width: '10%',
        key: 'compareValue',
        checked: true,
        expanded: true,
        children: [
          {
            label: I18n.net_io.xps_rps.hard_info.inter_time,
            width: '10%',
            key: 'compareValue_string',
            checked: true,
            expanded: true,
            sortKey: 'compareValue',
            compareType: 'number',
            tip: ''
          }
        ]
      },
      {
        label: I18n.tuninghelper.taskDetail.objectOne,
        width: '35%',
        key: 'objectOne',
        checked: true,
        expanded: true,
        children: [
          {
            label: I18n.net_io.xps_rps.hard_info.inter_time,
            width: '10%',
            key: 'irq_freq1',
            checked: true,
            expanded: true,
            sortKey: 'irq_freq1',
            compareType: 'number',
            tip: ''
          },
          {
            label: I18n.net_io.xps_rps.hard_info.hardware_info,
            width: '12%',
            key: 'hardware_info',
            checked: true,
            expanded: true,
            compareType: 'number',
            tip: '',
            children: [
              {
                label: I18n.net_io.xps_rps.hard_info.device_info,
                width: '12%',
                key: 'irq_device_name1',
                checked: true,
                expanded: true,
                compareType: 'number',
              }
            ]
          },
          {
            label: I18n.net_io.xps_rps.hard_info.rps_xps_info,
            width: '10%',
            key: 'rps_hard_inter',
            checked: true,
            expanded: true,
            compareType: 'number',
            tip: '',
            children: [
              {
                label: I18n.net_io.xps_rps.hard_info.network_name,
                width: '10%',
                key: 'eth_name1',
                checked: true,
                expanded: true,
                compareType: 'number',
              }
            ]
          }
        ]
      },
      {
        label: I18n.tuninghelper.taskDetail.objectSecond,
        width: '35%',
        key: 'objectSecond',
        checked: true,
        expanded: true,
        children: [
          {
            label: I18n.net_io.xps_rps.hard_info.inter_time,
            width: '10%',
            key: 'irq_freq2',
            checked: true,
            expanded: true,
            sortKey: 'irq_freq2',
            compareType: 'number',
            tip: ''
          },
          {
            label: I18n.net_io.xps_rps.hard_info.hardware_info,
            width: '12%',
            key: 'hardware_info',
            checked: true,
            expanded: true,
            compareType: 'number',
            tip: '',
            children: [
              {
                label: I18n.net_io.xps_rps.hard_info.device_info,
                width: '12%',
                key: 'irq_device_name2',
                checked: true,
                expanded: true,
                compareType: 'number',
              }
            ]
          },
          {
            label: I18n.net_io.xps_rps.hard_info.rps_xps_info,
            width: '10%',
            key: 'rps_hard_inter',
            checked: true,
            expanded: true,
            compareType: 'number',
            tip: '',
            children: [
              {
                label: I18n.net_io.xps_rps.hard_info.network_name,
                width: '10%',
                key: 'eth_name2',
                checked: true,
                expanded: true,
                compareType: 'number',
              }
            ]
          }
        ]
      }
    ];
    const hardData = Object.keys(data).map((key) => {
      if (!data[key]) { return; }
      const obj =
      {
        irqName: key,
        compareValue: this.getDiff(data[key].irq_freq[0], data[key].irq_freq[1]),
        compareValue_string: this.compareHandle.getCompareValue(data[key].irq_freq),
        irq_freq1: data[key].irq_freq[0],
        eth_name1: data[key].father.eth_name,
        irq_device_name1: data[key].father.irq_device_name,
        irq_freq2: data[key].irq_freq[1],
        eth_name2: data[key].child.eth_name,
        irq_device_name2: data[key].child.irq_device_name,
      };
      const newData = JSON.parse(JSON.stringify(obj));
      return newData;
    });
    this.hardIrqTableData = {
      srcData: {
        data: JSON.parse(JSON.stringify(hardData)),
        state: {
          searched: false,
          sorted: false,
          paginated: false
        }
      },
      columnsTree: columns,
    };
  }
  public getCoreTableData(data: any) {
    const columns = [
      {
        label: I18n.sys_res.core,
        width: '10%',
        key: 'value',
        checked: true,
        expanded: true,
        disabled: true,
        searchKey: 'value'
      },
      {
        label: I18n.tuninghelper.taskDetail.compareValue,
        width: '30%',
        key: 'compareValue',
        checked: true,
        expanded: true,
        children: [
          {
            label: I18n.net_io.xps_rps.hard_info.num_hard_inter,
            width: '10%',
            key: 'irq_affinity_mask_num_string',
            checked: true,
            expanded: true,
            sortKey: 'irq_affinity_mask_num',
            compareType: 'number',
            tip: ''
          },
          {
            label: I18n.net_io.xps_rps.hard_info.xps_hard_inter,
            width: '10%',
            key: 'rps_affinity_mask_num_string',
            checked: true,
            expanded: true,
            sortKey: 'rps_affinity_mask_num',
            compareType: 'number',
            tip: ''
          },
          {
            label: I18n.net_io.xps_rps.hard_info.rps_hard_inter,
            width: '10%',
            key: 'xps_affinity_mask_num_string',
            checked: true,
            expanded: true,
            sortKey: 'xps_affinity_mask_num',
            compareType: 'number',
            tip: ''
          }
        ]
      },
      {
        label: I18n.tuninghelper.taskDetail.objectOne,
        width: '30%',
        key: 'objectOne',
        checked: true,
        expanded: true,
        children: [
          {
            label: I18n.net_io.xps_rps.hard_info.num_hard_inter,
            width: '10%',
            key: 'irq_affinity_mask_num1',
            checked: true,
            expanded: true,
            sortKey: 'irq_affinity_mask_num1',
            compareType: 'number',
            tip: ''
          },
          {
            label: I18n.net_io.xps_rps.hard_info.xps_hard_inter,
            width: '10%',
            key: 'rps_affinity_mask_num1',
            checked: true,
            expanded: true,
            sortKey: 'rps_affinity_mask_num1',
            compareType: 'number',
            tip: ''
          },
          {
            label: I18n.net_io.xps_rps.hard_info.rps_hard_inter,
            width: '10%',
            key: 'xps_affinity_mask_num1',
            checked: true,
            expanded: true,
            sortKey: 'xps_affinity_mask_num1',
            compareType: 'number',
            tip: ''
          }
        ]
      },
      {
        label: I18n.tuninghelper.taskDetail.objectSecond,
        width: '30%',
        key: 'objectSecond',
        checked: true,
        expanded: true,
        children: [
          {
            label: I18n.net_io.xps_rps.hard_info.num_hard_inter,
            width: '10%',
            key: 'irq_affinity_mask_num2',
            checked: true,
            expanded: true,
            sortKey: 'irq_affinity_mask_num2',
            compareType: 'number',
            tip: ''
          },
          {
            label: I18n.net_io.xps_rps.hard_info.xps_hard_inter,
            width: '10%',
            key: 'rps_affinity_mask_num2',
            checked: true,
            expanded: true,
            sortKey: 'rps_affinity_mask_num2',
            compareType: 'number',
            tip: ''
          },
          {
            label: I18n.net_io.xps_rps.hard_info.rps_hard_inter,
            width: '10%',
            key: 'xps_affinity_mask_num2',
            checked: true,
            expanded: true,
            sortKey: 'xps_affinity_mask_num2',
            compareType: 'number',
            tip: ''
          }
        ]
      }
    ];
    const compareData = this.handleData(data);
    this.coreTableData = {
      srcData: {
        data: compareData,
        state: {
          searched: false,
          sorted: false,
          paginated: false
        }
      },
      columnsTree: columns,
    };

  }
  public handleData(value: any) {
    const type = ['irq_affinity_mask_num', 'rps_affinity_mask_num', 'xps_affinity_mask_num'];
    const compareData = Object.keys(value).map((key) => {
      const cpuCoreObj: any = {};
      type.forEach((item: string) => {
        cpuCoreObj[item] = value[key][item][0] - value[key][item][1];
        cpuCoreObj[item + '_string'] = this.compareHandle.getCompareValue(value[key][item]);
        cpuCoreObj[item + '1'] = value[key][item][0];
        cpuCoreObj[item + '2'] = value[key][item][1];
      });
      cpuCoreObj.value = key.toString();
      return cpuCoreObj;
    });
    return compareData;
  }
  /**
   * 获取差值
   * @param str1 对象1
   * @param str2 对象2
   * @returns 对象1-对象2 或 '--'
   */
  public getDiff(str1: any, str2: any) {
    if (str1 === '--' || str2 === '--') {
      return '--';
    } else {
      return parseFloat(str1) - parseFloat(str2);
    }
  }
}
