import { Component, Input, OnInit } from '@angular/core';
import { TiTreeNode } from '@cloud/tiny3';
import { I18n } from 'sys/locale';
import { CommonTableData } from 'sys/src-com/app/shared/domain';
import { CompareHandleService } from '../../service/compare-handle.service';

@Component({
  selector: 'app-cpu-usage-compare',
  templateUrl: './cpu-usage-compare.component.html',
  styleUrls: ['./cpu-usage-compare.component.scss'],
  providers: [
    { provide: CompareHandleService }
  ]
})
export class CpuUsageCompareComponent implements OnInit {
  @Input()
  set cpuData(value: any[]) {
    if (value) {
      this.getCpuTableData(value);
    }
  }
  @Input()
  set numaData(value: any[]) {
    if (value) {
      this.getNumaTableData(value);
    }
  }
  constructor(
    public compareHandle: CompareHandleService
  ) { }
  public cpuOption: Array<any>;
  public cpuSelected: { label: string; };
  public selectType = 0;
  public columns: Array<TiTreeNode>;
  public cpuTableData: CommonTableData;
  public numaTableData: CommonTableData;
  public type = ['usr', 'nice', 'sys', 'iowait', 'irq', 'soft', 'idle'];
  ngOnInit(): void {
    this.cpuOption = [
      { label: 'CPU core', index: 0 },
      { label: 'NUMA NODE', index: 1 }
    ];
    this.cpuSelected = this.cpuOption[0];
    this.columns = [
      {
        label: 'CPU core',
        key: 'value',
        checked: true,
        expanded: true,
        disabled: true,
        compareType: 'number',
        searchKey: 'value',
      },
      {
        label: I18n.tuninghelper.taskDetail.compareValue,
        key: 'compareValue',
        checked: true,
        expanded: true,
        children: [
          {
            label: '%user',
            key: 'usr_string',
            checked: true,
            expanded: true,
            sortKey: 'usr',
            compareType: 'number',
            tip: I18n.net_io.tip.user_tip
          },
          {
            label: '%nice',
            key: 'nice_string',
            checked: true,
            expanded: true,
            sortKey: 'nice',
            compareType: 'number',
            tip: I18n.net_io.tip.nice_tip
          },
          {
            label: '%system',
            key: 'sys_string',
            checked: true,
            expanded: true,
            sortKey: 'sys',
            compareType: 'number',
            tip: I18n.net_io.tip.system_tip
          },
          {
            label: '%iowait',
            key: 'iowait_string',
            checked: true,
            expanded: true,
            sortKey: 'iowait',
            compareType: 'number',
            tip: I18n.net_io.tip.iowait_tip
          },
          {
            label: '%irq',
            key: 'irq_string',
            checked: true,
            expanded: true,
            sortKey: 'irq',
            compareType: 'number',
            tip: I18n.net_io.tip.irq_tip
          },
          {
            label: '%soft',
            key: 'soft_string',
            checked: true,
            expanded: true,
            sortKey: 'soft',
            compareType: 'number',
            tip: I18n.net_io.tip.soft_tip
          },
          {
            label: '%idle',
            key: 'idle_string',
            checked: true,
            expanded: true,
            sortKey: 'idle',
            compareType: 'number',
            tip: I18n.net_io.tip.idle_tip
          },
        ]
      },
      {
        label: I18n.tuninghelper.taskDetail.objectOne,
        key: 'objectOne',
        checked: true,
        expanded: true,
        children: [
          {
            label: '%user',
            key: 'usr1',
            checked: true,
            expanded: true,
            sortKey: 'usr1',
            compareType: 'number',
            tip: I18n.net_io.tip.user_tip
          },
          {
            label: '%nice',
            key: 'nice1',
            checked: false,
            expanded: true,
            sortKey: 'nice1',
            compareType: 'number',
            tip: I18n.net_io.tip.nice_tip
          },
          {
            label: '%system',
            key: 'sys1',
            checked: false,
            expanded: true,
            sortKey: 'sys1',
            compareType: 'number',
            tip: I18n.net_io.tip.system_tip
          },
          {
            label: '%iowait',
            key: 'iowait1',
            checked: false,
            expanded: true,
            sortKey: 'iowait1',
            compareType: 'number',
            tip: I18n.net_io.tip.iowait_tip
          },
          {
            label: '%irq',
            key: 'irq1',
            checked: false,
            expanded: true,
            sortKey: 'irq1',
            compareType: 'number',
            tip: I18n.net_io.tip.irq_tip
          },
          {
            label: '%soft',
            key: 'soft1',
            checked: false,
            expanded: true,
            sortKey: 'soft1',
            compareType: 'number',
            tip: I18n.net_io.tip.soft_tip
          },
          {
            label: '%idle',
            key: 'idle1',
            checked: false,
            expanded: true,
            sortKey: 'idle1',
            compareType: 'number',
            tip: I18n.net_io.tip.idle_tip
          },
        ]
      },
      {
        label: I18n.tuninghelper.taskDetail.objectSecond,
        key: 'objectSecond',
        checked: true,
        expanded: true,
        children: [
          {
            label: '%user',
            key: 'usr2',
            checked: true,
            expanded: true,
            sortKey: 'usr2',
            compareType: 'number',
            tip: I18n.net_io.tip.user_tip
          },
          {
            label: '%nice',
            key: 'nice2',
            checked: false,
            expanded: true,
            sortKey: 'nice2',
            compareType: 'number',
            tip: I18n.net_io.tip.nice_tip
          },
          {
            label: '%system',
            key: 'sys2',
            checked: false,
            expanded: true,
            sortKey: 'sys2',
            compareType: 'number',
            tip: I18n.net_io.tip.system_tip
          },
          {
            label: '%iowait',
            key: 'iowait2',
            checked: false,
            expanded: true,
            sortKey: 'iowait2',
            compareType: 'number',
            tip: I18n.net_io.tip.iowait_tip
          },
          {
            label: '%irq',
            key: 'irq2',
            checked: false,
            expanded: true,
            sortKey: 'irq2',
            compareType: 'number',
            tip: I18n.net_io.tip.irq_tip
          },
          {
            label: '%soft',
            key: 'soft2',
            checked: false,
            expanded: true,
            sortKey: 'soft2',
            compareType: 'number',
            tip: I18n.net_io.tip.soft_tip
          },
          {
            label: '%idle',
            key: 'idle2',
            checked: false,
            expanded: true,
            sortKey: 'idle2',
            compareType: 'number',
            tip: I18n.net_io.tip.idle_tip
          },
        ]
      }
    ];
  }
  /**
   * 下拉框切换
   * @param selectedData 选中项
   */
  public cpuSelectedChange(selectedData: { index: number; }) {
    this.selectType = selectedData.index;
    this.columns[0].label = selectedData.index ? 'NUMA NODE' : 'CPU core';
  }

  public getCpuTableData(value: any) {
    const compareData = this.handleData(value);
    const allObj = compareData?.pop();
    compareData?.unshift(allObj);
    this.cpuTableData = {
      srcData: {
        data: compareData,
        state: {
          searched: false,
          sorted: false,
          paginated: false
        }
      },
      columnsTree: this.columns,
    };
  }

  public getNumaTableData(value: any) {
    const numaVal: any = {};
    Object.keys(value).sort().forEach((key) => {
      if (key.includes('VAL')) {
        numaVal[key] = value[key];
      }
    });
    const numaNodeData = Object.keys(numaVal).sort().map((key, index) => {
      const compareData: any = {};
      this.type.forEach((item: string) => {
        const idx = key[5];
        if (!numaVal[key][idx]) { return; }
        compareData[item + '_string'] = this.compareHandle.getCompareValue(numaVal[key][idx][item]);
        compareData[item] = numaVal[key][idx][item] ? numaVal[key][idx][item][0] - numaVal[key][idx][item][1] : '--';
        compareData[item + '1'] = numaVal[key][idx][item][0];
        compareData[item + '2'] = numaVal[key][idx][item][1];
        compareData.value = key.slice(0, -4);
        compareData.expanded = false;
        compareData.childNotSort = true;
        compareData.children = this.handleData(value[key.slice(0, -4)]);
      });
      return compareData;
    });
    this.numaTableData = {
      srcData: {
        data: numaNodeData,
        state: {
          searched: false,
          sorted: false,
          paginated: false
        }
      },
      columnsTree: this.columns,
    };
  }

  public handleData(value: any) {
    const type = ['usr', 'nice', 'sys', 'iowait', 'irq', 'soft', 'idle'];
    const compareData = Object.keys(value).map((key) => {
      const cpuCoreObj: any = {};
      type.forEach((item: string) => {
        cpuCoreObj[item + '_string'] = this.compareHandle.getCompareValue(value[key][item]);
        cpuCoreObj[item] = value[key][item] ? (value[key][item][0] - value[key][item][1]).toString() : '--';
        cpuCoreObj[item + '1'] = value[key][item][0];
        cpuCoreObj[item + '2'] = value[key][item][1];
      });
      cpuCoreObj.value = key.toString();
      return cpuCoreObj;
    });
    return compareData;
  }
}
