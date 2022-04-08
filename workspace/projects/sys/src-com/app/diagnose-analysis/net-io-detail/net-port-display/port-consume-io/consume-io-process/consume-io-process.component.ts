import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { TiTableColumns, TiTableRowData, TiTableSrcData, TiModalService } from '@cloud/tiny3';
import { ConsumeIOTableData } from '../../../domain';
import { I18nService } from 'sys/src-com/app/service';
import { SORTSTATUS } from '../domain';
import { CommonTableData, CommonTreeNode } from 'sys/src-com/app/shared/domain';

@Component({
  selector: 'app-consume-io-process',
  templateUrl: './consume-io-process.component.html',
  styleUrls: ['./consume-io-process.component.scss'],
  encapsulation: ViewEncapsulation.None // 要想设置的样式生效，此处必须配置成 ViewEncapsulation.None
})
export class ConsumeIoProcessComponent implements OnInit {

  @Input() consumeIOData: ConsumeIOTableData | {};
  @Input() pidInfo: any;

  public i18n: any;
  public selectPID: TiTableRowData;

  // 占用网络IO的进程
  public ioProcessTable: CommonTableData = {
    columnsTree: ([] as Array<CommonTreeNode>),
    displayed: [] as Array<CommonTableData>,
    srcData: {
      data: [] as Array<TiTableRowData>,
      state: {
        searched: false,
        sorted: false,
        paginated: false
      },
    } as TiTableSrcData,
  };

  // cpu内存消耗表格
  public cpuMemoryConsumeTable: CommonTableData = {
    columnsTree: ([] as Array<CommonTreeNode>),
    displayed: [] as Array<CommonTableData>,
    srcData: {
      data: [] as Array<TiTableRowData>,
      state: {
        searched: false,
        sorted: false,
        paginated: false
      },
    } as TiTableSrcData,
    isFilters: true,
    isDetails: true,
  };
  private cpuMemoryAllColumns: Array<CommonTreeNode> = [];

  // cpu亲和性表格
  public cpuAffinityTable: CommonTableData = {
    columnsTree: ([] as Array<CommonTreeNode>),
    displayed: [] as Array<CommonTableData>,
    srcData: {
      data: [] as Array<TiTableRowData>,
      state: {
        searched: false,
        sorted: false,
        paginated: false
      },
    } as TiTableSrcData,
    isDetails: true,
  };

  // 内存亲和性表格
  public memoryAffinityTable: CommonTableData = {
    columnsTree: ([] as Array<CommonTreeNode>),
    displayed: [] as Array<CommonTableData>,
    srcData: {
      data: [] as Array<TiTableRowData>,
      state: {
        searched: false,
        sorted: false,
        paginated: false
      },
    } as TiTableSrcData,
  };

  // 内存段NUMA分布
  public numAllocationTable: CommonTableData = {
    columnsTree: ([] as Array<CommonTreeNode>),
    displayed: [] as Array<CommonTableData>,
    srcData: {
      data: [] as Array<TiTableRowData>,
      state: {
        searched: false,
        sorted: false,
        paginated: false
      },
    } as TiTableSrcData,
    isFilters: true,
  };

  constructor(
    private tiModal: TiModalService,
    private i18nService: I18nService,
  ) {
    this.i18n = this.i18nService.I18n();
  }

  ngOnInit(): void {
    this.initColumns();
    const newData: any[] = [];
    if (!Object.keys(this.consumeIOData).length) {
      this.ioProcessTable.srcData.data = [];
      return;
    }
    Object.keys(this.consumeIOData).forEach((key: string) => {
      (this.consumeIOData as ConsumeIOTableData)[key].forEach((data: string[]) => {
        newData.push(this.handelConsumeDatas(data, key));
      });
    });
    this.ioProcessTable.srcData.data = newData;
  }

  // 初始化 columns
  private initColumns() {
    this.ioProcessTable.columnsTree = [
      { label: 'Local Interface', key: 'localInterface' },
      { label: 'Protocol', key: 'protocol' },
      { label: 'Local IP', key: 'localIP', searchKey: 'localIP' },
      { label: 'Local Port', key: 'localPort', searchKey: 'localPort' },
      { label: 'Remote IP', key: 'remoteIP' },
      { label: 'Remote Port', key: 'remotePort' },
      { label: 'PID', key: 'PID', searchKey: 'PID' },
      { label: 'Command', key: 'command', searchKey: 'command' }
    ];
    this.cpuAffinityTable.columnsTree = [
      {
        label: 'PID/TID',
        key: 'pid',
      },
      {
        label: 'CPU affinity',
        key: 'cpuAffinity'
      },
      {
        label: 'CPU core',
        key: 'cpuCore'
      },
      {
        label: 'NUMA NODE',
        key: 'numaNode'
      }
    ];
    this.memoryAffinityTable.columnsTree = [
      {
        label: 'Allocation area',
        key: 'allocationArea'
      },
      {
        label: 'Node 0',
        key: 'node0'
      },
      {
        label: 'Node 1',
        key: 'node1'
      },
      {
        label: 'Node 2',
        key: 'node2'
      },
      {
        label: 'Node 3',
        key: 'node3'
      },
      {
        label: 'Total',
        key: 'total'
      }
    ];
    this.numAllocationTable.columnsTree = [
      {
        label: this.i18n.disgnose.netIO.startAddress,
        key: 'startAddress',
        disabled: true,
      },
      {
        label: this.i18n.disgnose.netIO.module,
        key: 'module',
      },
      {
        label: this.i18n.disgnose.netIO.mapType,
        key: 'mapType',
      },
      {
        label: this.i18n.disgnose.netIO.mapQuantity,
        key: 'mapQuantity',
      },
      {
        label: this.i18n.disgnose.netIO.modifiedQuantity,
        key: 'modifiedQuantity',
      },
      {
        label: this.i18n.disgnose.netIO.memoryPage,
        key: 'memoryPage',
      },
      {
        label: 'Node 0',
        key: 'node0',
      },
      {
        label: 'Node 1',
        key: 'node1',
      },
      {
        label: 'Node 2',
        key: 'node2',
      },
      {
        label: 'Node 3',
        key: 'node3',
      }
    ];
    // CPU 内存消耗
    this.cpuMemoryConsumeTable.columnsTree = [
      {
        label: 'PID/TID',
        key: 'pid',
        disabled: true,
      },
      {
        label: 'Command',
        key: 'command',
        disabled: true,
      },
      {
        label: 'CPU',
        children: [
          {
            label: '%user',
            key: 'user',
            sortKey: 'user',
          },
          {
            label: '%system',
            key: 'system',
            sortKey: 'system',
          },
          {
            label: '%iowait',
            key: 'iowait',
            sortKey: 'iowait',
          },
          {
            label: '%CPU',
            key: 'cpu',
            sortKey: 'cpu',
          },
        ]
      },
      {
        label: 'Memory',
        children: [
          {
            label: 'minflt/s',
            key: 'minflts',
            sortKey: 'minflts',
          },
          {
            label: 'majflt/s',
            key: 'majflts',
            sortKey: 'majflts',
          },
          {
            label: 'VSZ(KB)',
            key: 'vsz',
            sortKey: 'vsz',
          },
          {
            label: 'RSS(KB)',
            key: 'rss',
            sortKey: 'rss',
          },
          {
            label: '%MEM',
            key: 'mem',
            sortKey: 'mem',
          }
        ]
      }
    ];

    const loop = (data: Array<CommonTreeNode>) => {
      data.forEach((column: CommonTreeNode) => {
        if (!column.children) {
          this.cpuMemoryAllColumns.push(column);
        } else {
          loop(column.children);
        }
      });
    };
    loop(this.cpuMemoryConsumeTable.columnsTree);
  }

  // 处理 网络IO进程消耗 表格数据
  private handelConsumeDatas(consumeData: string[], localInterface: string) {
    const [
      protocol, localIP, localPort, remoteIP, remotePort,
      PID, command, tip
    ] = consumeData;

    return {
      localInterface,
      protocol,
      localIP,
      localPort,
      remoteIP,
      remotePort,
      PID,
      command,
      tip
    };
  }

  /**
   * pid详情弹框
   * @param row pid
   */
  public viewDetailsPID(viewStack: any, row: TiTableRowData) {
    if (row.PID === '-') { return; }
    this.selectPID = row;
    const {
      pidstat_info = [],
      cpu_affinity_info = [],
      mem_affinity_info = [],
      process_numa_allocation = []
    } = this.pidInfo[row.PID];

    // 先清空表格数据
    this.clearTableData();

    // cpu内存消耗
    if (pidstat_info.length) {
      this.cpuMemoryConsumeTable.srcData.data = this.getPidTidTableData(pidstat_info, this.cpuMemoryAllColumns);
    }
    // cpu亲和性
    if (cpu_affinity_info.length) {
      this.cpuAffinityTable.srcData.data = this.getPidTidTableData(cpu_affinity_info,
        this.cpuAffinityTable.columnsTree);
    }

    // 内存亲和性
    if (mem_affinity_info.length) {
      this.memoryAffinityTable.srcData.data = this.getGeneralTableData(mem_affinity_info,
        this.memoryAffinityTable.columnsTree);
    }

    // 内存段NUMA分布
    if (process_numa_allocation.length) {
      this.numAllocationTable.srcData.data = this.getGeneralTableData(process_numa_allocation,
        this.numAllocationTable.columnsTree);
    }

    this.tiModal.open(viewStack, {
      id: 'pid-details',
      modalClass: 'pid-modal-class',
      context: {}
    });
  }

  /**
   * 清空表格数据
   */
  private clearTableData() {
    this.cpuMemoryConsumeTable.srcData.data = [];
    this.cpuAffinityTable.srcData.data = [];
    this.memoryAffinityTable.srcData.data = [];
    this.numAllocationTable.srcData.data = [];
  }

  /**
   * 处理PID/TID表格数据
   * @param data 源数据
   * @param columns 表格列
   * @returns 表格显示数据
   */
  private getPidTidTableData(data: any, columns: Array<CommonTreeNode>) {
    const rowData: TiTableRowData = {
      children: [],
      showDetails: true,
    };
    data.forEach((arr: any[]) => {
      let isParent = false;
      if (arr[0] !== '-') { // 父节点
        isParent = true;
      }
      if (isParent) {  // 父节点从第二项开始取下一位
        columns.forEach((column: CommonTreeNode, idx: number) => {
          rowData[column.key] = idx === 0 ? arr[idx] : arr[idx + 1];
        });
      } else { // 子节点都从第二项开始取
        const child: { [name: string]: any} = {};
        columns.forEach((column: CommonTreeNode, idx: number) => {
          child[column.key] = arr[idx + 1];
        });
        rowData.children.push(child);
      }
    });
    return [rowData];
  }

  /**
   * 处理普通表格数据
   * @param data 源数据
   * @param columns 表格列
   * @returns 表格显示数据
   */
  private getGeneralTableData(data: any, columns: Array<CommonTreeNode>) {
    const rowList: any[] = [];
    data.forEach((arr: any[]) => {
      const row: any = {};
      columns.forEach((column: CommonTreeNode, idx: number) => {
        row[column.key] = arr[idx];
      });
      rowList.push(row);
    });
    return rowList;
  }
}
