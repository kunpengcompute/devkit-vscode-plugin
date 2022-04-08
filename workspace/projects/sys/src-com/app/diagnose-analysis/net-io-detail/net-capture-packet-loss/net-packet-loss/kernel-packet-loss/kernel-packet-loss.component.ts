import { Component, Input } from '@angular/core';
import { PocketLossRaw } from '../../../domain';
import { TiTableColumns, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';
import { NetIoService } from '../../../service/net-io.service';
import { BbbData, SourceData } from '../../../domain/pocket-loss/net-io-src-code.type';
import { I18n } from 'sys/locale';
import { TipService, WebviewPanelService } from 'sys/src-com/app/service';

type KernelPacketTableData = {
  funName: string, moduleName: string,
  type: string, skb: string,
  stackInfo?: string,
  children?: KernelPacketTableData[]
};

@Component({
  selector: 'app-kernel-packet-loss',
  templateUrl: './kernel-packet-loss.component.html',
  styleUrls: ['./kernel-packet-loss.component.scss']
})
export class KernelPacketLossComponent {

  @Input() taskId: number;
  @Input() nodeId: number;
  @Input()
  set kernelPacketData(val: PocketLossRaw['kfree_skb']) {
    if (val === undefined) { return; }

    this.srcData.data = this.handelKernelPacketData(val);
    this.tableData = [...this.srcData.data];
    this.totalNumber = this.srcData.data.length;
    // 保存总的条数，避免搜索结果小于10条，清空搜索后数据显示不全的问题
    this.originTotalNum = JSON.parse(JSON.stringify(this.srcData.data)).length;
    // 给筛选列赋值
    this.columns[3].options = [...new Set(this.srcData.data.map(data => data.type))].map(data => ({
      label: data
    }));
    this.columns[3].selected = [...this.columns[3].options];
  }

  public tableData: TiTableRowData[]; // 存储原始表格数据，用于表格筛选使用
  displayed: Array<TiTableRowData> = [];
  srcData: TiTableSrcData = {
    data: [],
    state: {
      searched: false,
      sorted: false,
      paginated: false
    }
  };
  columns: Array<TiTableColumns> = this.initColumns();

  // 分页数据
  currentPage = 1;
  totalNumber: number;
  pageSize: { options: Array<number>, size: number } = {
    options: [10, 20, 40, 80, 100],
    size: 10
  };

  searchInput = '';
  searchWords: string[] = [];
  searchKeys: string[] = [];
  private originTotalNum: number;

  constructor(
    private netIoServe: NetIoService,
    private tipServe: TipService,
    private panelService: WebviewPanelService
  ) { }

  // 搜索框值改变
  searchValueChange(value: string): void {
    if (value.trim() === '') {
      this.totalNumber = this.originTotalNum;
    }
    this.searchWords[0] = value;
  }

  // 对表格进行排序
  sortTableFn(a: TiTableColumns, b: TiTableColumns, predicate: string) {
    return Number(a[predicate]) - Number(b[predicate]);
  }

  // 协议类型过滤
  headFilterSelect() {
    this.srcData.data = this.tableData.filter((rowData: TiTableRowData) => {
      for (const colum of this.columns) {
        if (colum.selected && colum.selected.length) {
          const index = colum.selected.findIndex((item: any) => item.label === rowData[colum.filterKey]);
          if (index < 0) {
            return false;
          }
        } else if (colum.selected?.length === 0) {
          return false;
        }
      }
      return true;
    });

    this.totalNumber = this.srcData.data.length;
  }

  /**
   * 打开对应函数源码页签
   * @param row 点击行信息
   */
  async addFunctionTab(row: KernelPacketTableData) {
    try {
      const { data: { SourceCode: { data: sourceCode } } } =
      await this.netIoServe.pullSourceCode(this.taskId, this.nodeId, row.moduleName, row.funName);
      if (sourceCode.source || sourceCode.bbb || sourceCode.svgpath || sourceCode.graph_status) {
        // 格式化源代码
        let sourceCodeData: any[] = [];
        if (sourceCode.source && Array.isArray(sourceCode.source)) {
          sourceCodeData = sourceCode.source.map((item: SourceData, index: number) => {
            return {
              ...item,
              id: `source_${index}`,
              line: +item.line,
              line_code: item.line_code,
              count: +item.CPU_CYCLES.split('(')[0],
              proportion: item.CPU_CYCLES.split('(')[1].split(')')[0],
            };
          });
        }

        // 格式化汇编代码
        const assemblyCodeData: any = [];
        if (Array.isArray(sourceCode.bbb)) {
          sourceCode.bbb.forEach((item: BbbData) => {
            const obj = {
              ...item,
              offset: item.offset,
              line: +item.line,
              ins: item.ins,
              count: +item.CPU_CYCLES_COUNT,
              proportion: item.CPU_CYCLES.split('(')[1].split(')')[0],
              children: [] as any[]
            };

            if (!item.ins_list?.length) {
              obj.children = [];
              assemblyCodeData.push(obj);
            } else {
              obj.children = item.ins_list;
              assemblyCodeData.push(obj);
            }
          });
        }

        // 代码流
        let svgpath;
        if (sourceCode.graph_status && sourceCode.graph_status.status !== 1 && sourceCode.svgpath) {
          const svgResp: any = await this.netIoServe.pullSvgData(this.taskId, sourceCode.svgpath, this.nodeId);

          if (svgResp.length > 0) {
            svgpath = svgResp;
          }
        }

        this.panelService.addPanel({
          viewType: 'netCaptureSource',
          title: row.funName,
          message: {
            headers: [
              { label: I18n.storageIO.ioapis.functionName, content: row.funName },
              { label: I18n.nodeManagement.keyType, content: row.type },
              { label: I18n.net_capture_loss.loss.kernel_packet.skb, content: row.skb },
              { label: I18n.net_capture_loss.loss.kernel_packet.source_name, content: sourceCode.filename || '--' },
            ],
            functionDetails: {
              sourceCode: {
                data: sourceCodeData,
                message: ''
              },
              assemblyCode: {
                data: assemblyCodeData,
              },
              codeStream: {
                svgpath,
                graph_status: sourceCode.graph_status,
              }
            }
          }
        });
      } else { // 无数据
        this.tipServe.alertInfo({
          type: 'warn',
          content: I18n.noSourceData,
          time: 3500
        });
      }
    } catch (error) {
      this.tipServe.alertInfo({
        type: 'error',
        content: error.message,
        time: 3500
      });
    }
  }

  // 初始化 columns
  private initColumns(): TiTableColumns[] {
    const columns = [
      { title: '', width: '3%' },
      { title: I18n.mission_modal.lockSummary.function_name, prop: 'funName', searchShow: true, active: false },
      { title: I18n.mission_modal.lockSummary.module_name, prop: 'moduleName', searchShow: true, active: false },
      {
        title: I18n.nodeManagement.keyType, prop: 'type',
        filterKey: 'type', multiple: true,
        searchable: true
      },
      {
        title: I18n.net_capture_loss.loss.kernel_packet.skb_num, prop: 'skb', sortKey: 'skb',
        tip: I18n.net_capture_loss.loss.kernel_packet.skb_tip
      },
      { title: I18n.oomDetail.callStackTitle, prop: 'stackInfo', searchShow: true },
    ];

    return columns;
  }

  /**
   * 对后端传回的表格数据作处理
   * @param kernelPacketData 数据
   */
  private handelKernelPacketData(kernelPacketData: PocketLossRaw['kfree_skb']): KernelPacketTableData[] {
    const kernelPacketTableData: KernelPacketTableData[] = [];

    Object.keys(kernelPacketData).forEach((key: string, i: number) => {
      const children: KernelPacketTableData[] = [];

      kernelPacketData[key].forEach((data: string[], index: number) => {
        const [funName, moduleName, type, skb] = data;

        if (index === 0) {
          kernelPacketTableData.push({
            funName, moduleName,
            type, skb
          });
        } else {
          children.push({
            funName, moduleName,
            type, skb,
            stackInfo: data[4]
          });
        }
      });

      if (children.length) {
        kernelPacketTableData[i].children = children;
      }
    });

    return kernelPacketTableData;
  }

}
