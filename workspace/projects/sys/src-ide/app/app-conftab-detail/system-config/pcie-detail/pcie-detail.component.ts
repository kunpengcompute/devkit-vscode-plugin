import {
  Component, EventEmitter, Input,
  OnInit, Output, TemplateRef, ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { TiTableColumns, TiTableRowData, TiTableSrcData, TiModalService } from '@cloud/tiny3';
import { I18nService } from 'projects/sys/src-ide/app/service/i18n.service';
import { VscodeService } from '../../../service/vscode.service';
import { NodeType, Tree } from './components/cpu-topology/doman';
import { Color, Cat } from 'hyper';
import { HyTheme, HyThemeService } from 'hyper';
import { Observable } from 'rxjs';

interface IrqToCoreInfo {
  isBind: boolean;
  core: number;
  color: string;
  irqNum?: number;
}
type TieCoreState =  0 | 1; // 0 -- 未绑核，1 -- 已绑核
@Component({
  selector: 'app-pcie-detail',
  templateUrl: './pcie-detail.component.html',
  styleUrls: ['./pcie-detail.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PcieDetailComponent implements OnInit {

  @Input() taskId: number;
  @Input() nodeId: number;

  @Output() public downloadSummury = new EventEmitter<any>();
  @ViewChild('viewDetailMask', { static: false }) viewDetailMask: TemplateRef<any>;
  @ViewChild('viewDetailMaskCpu', { static: false }) viewDetailMaskCpu: TemplateRef<any>;

  public ligthen = Color.lighten;
  public irqToCoreData: IrqToCoreInfo[][] = [];
  public i18n: any;
  public sourceData: any;
  public sourceDataList: any[] = [];
  allIrqData: any;
  allIrqCPUData: any;
  singleIrqCPUData: any;
  showOld: boolean;
  ipiInfo: any;
  popProcess: any;
  popProcessRight: any;
  numaNum: any;
  theme$: Observable<HyTheme>;

  constructor(
    public i18nService: I18nService,
    public vscodeServe: VscodeService,
    private tiModal: TiModalService,
    private themeServe: HyThemeService
  ) {
    this.i18n = this.i18nService.I18n();
    this.theme$ = this.themeServe.getObservable();
  }
  // 进程绑核状态数据
  public processCoreBinding: any;
  public processCpu: any;
  // 进程绑核状态展示方式选择
  public processOptions: Array<any> = [];
  public processSelected: any;

  // 进程绑核状态表格数据
  public pidBindTopTen = {
    displayed: [] as Array<TiTableRowData>,
    srcData: {
      data: ([] as Array<TiTableRowData>),
      state: { searched: false, sorted: false, paginated: false }
    },
    columns: [] as Array<TiTableColumns>,
    currentPage: 1,
    totalNumber: 0,
    pageSize: {
      options: [10, 20, 50, 100],
      size: 10
    }
  };

  // cpu 解绑状态表格数据
  public displayedCpu: Array<TiTableRowData> = [];
  public srcDataCpu: TiTableSrcData;
  public columnsCpu: Array<TiTableColumns> = [];
  public currentPage = 1;
  public totalNumber: number;
  public pageSize: { options: Array<number>, size: number } = {
    options: [10, 20, 50, 100],
    size: 10
  };
  public searchProcessWords: any[] = [];
  public searchProcessKeys: any[] = [];
  public searchProcessInput = '';
  public isShowPrecessSearchBox = false;

  // 硬中断绑核模块数据
  public irqBindingInfo: any;
  public irqCpuInfo: any;
  public hardInterruptOptions: Array<any> = [];
  public hardInterruptSelected: any;
  public displayedIrq: Array<TiTableRowData> = []; // 表示表格实际呈现的数据（开发者默认设置为[]即可）
  public srcDataIrq: TiTableSrcData;
  public columnsIrq: Array<TiTableColumns> = [];
  public displayedIrqCpu: Array<TiTableRowData> = []; // 表示表格实际呈现的数据（开发者默认设置为[]即可）
  public srcDataIrqCpu: TiTableSrcData;
  public columnsIrqCpu: Array<TiTableColumns> = [];
  public currentPageIrq = 1;
  public totalNumberIrq: number;
  public pageSizeIrq: { options: Array<number>, size: number } = {
    options: [10, 20, 50, 100],
    size: 10
  };
  public currentPageIrqCpu = 1;
  public totalNumberIrqCpu: number;
  public pageSizeIrqCpu: { options: Array<number>, size: number } = {
    options: [10, 20, 50, 100],
    size: 10
  };
  public isShowIrqSearchBox = false;
  public searchIrqInput = '';
  public searchIrqWords: any[] = [];
  public searchIrqKeys: any[] = [];
  // xps/Rps绑核数据
  public xpsBindingInfo: any;
  public xpsCpuInfo: any;
  public xpsOptions: Array<any> = [];
  public xpsSelected: any;
  public displayedXps: Array<TiTableRowData> = []; // 表示表格实际呈现的数据（开发者默认设置为[]即可）
  public srcDataXps: TiTableSrcData;
  public columnsXps: Array<TiTableColumns> = [];
  public displayedXpsCpu: Array<TiTableRowData> = []; // 表示表格实际呈现的数据（开发者默认设置为[]即可）
  public srcDataXpsCpu: TiTableSrcData;
  public columnsXpsCpu: Array<TiTableColumns> = [];
  public currentPageXps = 1;
  public totalNumberXps: number;
  public pageSizeXps: { options: Array<number>, size: number } = {
    options: [10, 20, 50, 100],
    size: 10
  };
  public currentPageXpsCpu = 1;
  public totalNumberXpsCpu: number;
  public pageSizeXpsCpu: { options: Array<number>, size: number } = {
    options: [10, 20, 50, 100],
    size: 10
  };
  public isShowXpsSearchBox = false;
  public searchXpsInput = '';
  public searchXpsWords: any[] = [];
  public searchXpsKeys: any[] = [];
  public cpuData: any;
  public displayedPop: Array<TiTableRowData> = []; // 表示弹窗内表格实际呈现的数据（开发者默认设置为[]即可）
  public srcDataPop: any;
  public popTitle: string;
  public popProcessTitleLeft: string;
  public popProcessTitleRight: string;
  public isPopTableTtpe = 'TOP10_process';
  public boxInfo: any[] = [];
  // TOP10进程绑核弹窗表头
  public columnsProcessCPUPop: Array<TiTableColumns> = [];
  // TOP10进程core 编号
  public top10CpuCoreNum = 0;
  // 硬中断绑核 弹窗表头
  public columnsIrqCPUPop: Array<TiTableColumns> = [];
  // XPS/RPS绑核弹窗表头
  public columnsXpscessCPUPop: Array<TiTableColumns> = [];

  public nodeDetails: Tree;
  public nodeConfigInfoKeys: string[] = [];
  public language = 'ch';
  public softwareInterData: any;
  public cpuUsageInfo: any;
  ngOnInit(): void {
    if ((self as any).webviewSession.getItem('language').indexOf('en') !== -1) {
      this.language = 'en';
    } else {
      this.language = 'ch';
    }
    this.processOptions = [
      { label: this.i18n.pcieDetailsinfo.processView, value: 'processview' },
      { label: this.i18n.pcieDetailsinfo.cpuView, value: 'cpuView' },
    ];
    this.processSelected = this.processOptions[0];
    this.hardInterruptOptions = [
      { label: this.i18n.pcieDetailsinfo.interruptsView, value: 'interruptsView' },
      { label: this.i18n.pcieDetailsinfo.cpuView, value: 'cpuView' },
    ];
    this.hardInterruptSelected = this.hardInterruptOptions[0];
    this.xpsOptions = [
      { label: this.i18n.pcieDetailsinfo.interruptsView, value: 'xpsView' },
      { label: this.i18n.pcieDetailsinfo.cpuView, value: 'cpuView' },
    ];
    this.xpsSelected = this.xpsOptions[0];
    this.pidBindTopTen.columns = [
      {
        title: this.i18n.pcieDetailsinfo.processTitle1,
        width: '33%'
      },
      {
        title: this.i18n.pcieDetailsinfo.processTitle2,
        width: '33%'
      },
      {
        title: this.i18n.pcieDetailsinfo.processTitle3,
        width: '34%'
      }
    ];
    this.columnsCpu = [
      {
        title: this.i18n.pcieDetailsinfo.processTitle4,
        width: '20%'
      },
      {
        title: this.i18n.pcieDetailsinfo.processTitle5,
        width: '80%'
      },
    ];
    this.columnsIrq = [
      {
        title: this.i18n.pcieDetailsinfo.interrupttitle1,
        sortKey: this.i18n.pcieDetailsinfo.interrupttitle1,
        width: '15%'
      },
      {
        title: this.i18n.pcieDetailsinfo.disk_info,
        width: '15%'
      },
      {
        title: this.i18n.pcieDetailsinfo.interrupt,
        width: '15%'
      },
      {
        title: this.i18n.pcieDetailsinfo.interrupttitle3,
        sortKey: this.i18n.pcieDetailsinfo.interrupttitle3,
        width: '15%'
      },
      {
        title: this.i18n.pcieDetailsinfo.processTitle3,
        width: '30%'
      },
      {
        title: this.i18n.pcieDetailsinfo.operation,
        width: '10%'
      }
    ];
    this.columnsIrqCpu = [
      {
        title: this.i18n.pcieDetailsinfo.processTitle4,
        width: '20%'
      },
      {
        title: this.i18n.pcieDetailsinfo.interrupttitle1,
        width: '80%'
      },
    ];
    this.columnsXps = [
      {
        title: this.i18n.pcieDetailsinfo.xpsTitle1,
        width: '35%'
      },
      {
        title: this.i18n.pcieDetailsinfo.processTitle3,
        width: '20%'
      },
      {
        title: this.i18n.pcieDetailsinfo.operation,
        width: '10%'
      }
    ];
    this.columnsXpsCpu = [
      {
        title: this.i18n.pcieDetailsinfo.processTitle4,
        width: '20%'
      },
      {
        title: this.i18n.pcieDetailsinfo.xpsTitle2,
        width: '80%'
      },
    ];
    this.columnsProcessCPUPop = [
      {
        title: this.i18n.pcieDetailsinfo.processTitle5,
        width: '40%'
      },
      {
        title: this.i18n.pcieDetailsinfo.cmd,
        width: '25%'
      },
      {
        title: this.i18n.pcieDetailsinfo.processTitle3,
        width: '35%'
      },
    ];
    this.columnsIrqCPUPop = [
      {
        title: this.i18n.pcieDetailsinfo.interrupttitle1,
        sortKey: this.i18n.pcieDetailsinfo.interrupttitle1,
        width: '12%'
      },
      {
        title: this.i18n.pcieDetailsinfo.disk_name,
        width: '13.6%'
      },
      {
        title: this.i18n.pcieDetailsinfo.disk_info,
        width: '17.6%'
      },
      {
        title: this.i18n.pcieDetailsinfo.interrupt,
        width: '17.6%'
      },
      {
        title: this.i18n.pcieDetailsinfo.interrupt_number,
        width: '12%'
      },
      {
        title: this.i18n.pcieDetailsinfo.processTitle3,
        width: '27.2%'
      }
    ];
    this.columnsXpscessCPUPop = [
      {
        title: this.i18n.pcieDetailsinfo.disk_list_info,
        width: '40%'
      },
      {
        title: this.i18n.pcieDetailsinfo.processTitle3,
        width: '60%'
      }
    ];
    this.getPcieDetails();
    this.srcDataCpu = {
      data: ([] as Array<TiTableRowData>),
      state: {
        searched: false,
        sorted: false,
        paginated: false
      }
    };
    this.srcDataIrq = {
      data: ([] as Array<TiTableRowData>),
      state: {
        searched: false,
        sorted: false,
        paginated: false
      }
    };
    this.srcDataIrqCpu = {
      data: ([] as Array<TiTableRowData>),
      state: {
        searched: false,
        sorted: false,
        paginated: false
      }
    };
    this.srcDataXps = {
      data: ([] as Array<TiTableRowData>),
      state: {
        searched: false,
        sorted: false,
        paginated: false
      }
    };
    this.srcDataXpsCpu = {
      data: ([] as Array<TiTableRowData>),
      state: {
        searched: false,
        sorted: false,
        paginated: false
      }
    };
  }
  // 对象转换成数组方法
  changeObjToArry(obj: any) {
    let keyList: any;
    keyList = Object.keys(obj);
    if (keyList.length === 0) { return []; }
    if (typeof (keyList[0].substring(0, 4) * 1) === 'number') {
      // 数字排序
      keyList = keyList.sort((item: any) => item * 1);
    } else if (typeof (keyList[0] * 1) === 'number') {
      keyList = keyList.sort((item: any) => item * 1);
    } else {
      keyList = keyList.sort();
    }
    const newArry: any[] = [];
    if (keyList && keyList.length > 0) {
      keyList.forEach((item: string) => {
        newArry.push(Object.assign(obj[item], { key: item }));
      });
    }
    return newArry;
  }
  // 按需展示节点数据
  getNodeData(node: Tree) {
    if (node?.type === NodeType.ROOT_COMPLEX) { return; }
    this.nodeDetails = node;
    this.nodeConfigInfoKeys = Object.keys(node.nodeData?.node_config_info ?? {});
  }
  // 获取数据
  getPcieDetails() {
    this.vscodeServe.get({
      url: `/tasks/${this.taskId}/sys-performance/summary/?queryTarget=PCIe&queryType=summary&nodeId=${this.nodeId}`
    }, (res: any) => {
      // Top10 进程绑核状态 进程视图
      this.processCoreBinding = this.changeObjToArry(res.data.numa_common_config_info.process_affinity_mask);
      this.pidBindTopTen.srcData.data = this.processCoreBinding;
      this.pidBindTopTen.totalNumber = this.processCoreBinding.length;

      // Top10 进程绑核状态 CPU核视图
      this.processCpu = this.changeObjToArry(res.data.numa_common_config_info.cpu_process_info);
      this.totalNumber = this.processCpu.length;
      this.srcDataCpu.data = this.processCpu;

      this.cpuData = res.data;

      if (res.data.numa_common_config_info.cpu_usage_info) {
        this.allIrqData = res.data.numa_common_config_info.irq_affinity_info;
        this.allIrqCPUData = res.data.numa_common_config_info.cpu_irq_info;
        this.singleIrqCPUData = res.data.numa_common_config_info.eth_cpu_irq_info;
        this.softwareInterData = res.data.numa_common_config_info.softirq_info;
        this.cpuUsageInfo = res.data.numa_common_config_info.cpu_usage_info;
        this.ipiInfo = res.data.numa_common_config_info.rps_ipi_info;
        this.showOld = false;
        this.numaNum = res.data.numa_common_config_info.context_info?.numa_num;
      } else {

        this.showOld = true;

        // 硬中断绑核状态 中断编号视图
        this.irqBindingInfo = this.changeObjToArry(res.data.numa_common_config_info.irq_affinity_mask);
        this.srcDataIrq.data = this.irqBindingInfo;
        this.totalNumberIrq = this.irqBindingInfo.length;

        // 硬中断绑核状态 CPU核视图
        this.irqCpuInfo = this.changeObjToArry(res.data.numa_common_config_info.cpu_irq_info);
        this.srcDataIrqCpu.data = this.irqCpuInfo;
        this.totalNumberIrqCpu = this.irqCpuInfo.length;

        // XPS/RPS绑核状态信息 中断编号视图
        this.xpsBindingInfo = this.changeObjToArry(res.data.numa_common_config_info.descriptor_affinity_mask);
        this.srcDataXps.data = this.xpsBindingInfo;
        this.totalNumberXps = this.xpsBindingInfo.length;

        // XPS/RPS绑核状态信息 CPU核视图
        this.xpsCpuInfo = this.changeObjToArry(res.data.numa_common_config_info.cpu_descriptor_info);
        this.srcDataXpsCpu.data = this.xpsCpuInfo;
        this.totalNumberXpsCpu = this.xpsCpuInfo.length;
      }
    });
  }
  processSelectedChange(event: any){
    this.processSelected = event;
    this.hidePrcoessSearchBox();
  }
  hardInterruptSelectedChange(event: any){
    this.hardInterruptSelected = event;
    this.hideIrqSearchBox();
  }
  xpsSelectedChange(event: any){
    this.xpsSelected = event;
    this.hideXpsSearchBox();
  }
  // 唤起top10进程搜索框
  searchProcess(key: string){
    this.isShowPrecessSearchBox = true;
    if (key === 'pid'){
      this.searchProcessKeys = ['key'];
    } else if (key === 'name'){
      this.searchProcessKeys = ['cmdline'];
    }
  }
  // 输入内容搜索进程
  public setProcessSearch(value: string): void {
    this.searchProcessWords[0] = value;
  }
  // 失焦隐藏进程
  hidePrcoessSearchBox(){
    this.searchProcessInput = '';
    this.setProcessSearch(this.searchProcessInput);
    this.isShowPrecessSearchBox = false;
  }
  // 唤起硬中断绑核状态搜索框
  searchIrq(value: string) {
    this.isShowIrqSearchBox = true;
    if (value === 'device'){
      this.searchIrqKeys = ['irq_device_name'];
    } else if (value === 'event'){
      this.searchIrqKeys = ['irq_event_name'];
    } else {
      this.searchIrqKeys = [];
    }
  }
  // 失焦隐藏硬中断搜索框
  hideIrqSearchBox(){
    this.searchIrqInput = '';
    this.setIrqSearch(this.searchIrqInput);
    this.isShowIrqSearchBox = false;
  }
  // 搜索硬中断绑核信息内容
  setIrqSearch(value: string){
    this.searchIrqWords[0] = value;
  }
  // 唤起xps搜索框
  searchXps(){
    this.isShowXpsSearchBox = true;
    this.searchXpsKeys = ['key'];
  }
  // 失焦隐藏xps搜索框
  hideXpsSearchBox(){
    this.searchXpsInput = '';
    this.setXpsSearch(this.searchXpsInput);
    this.isShowXpsSearchBox = false;
  }
  // 输入内容搜索xps
  setXpsSearch(value: string){
    this.searchXpsWords[0] = value;
  }
  // 查看进程详情 查看硬中断详情 查看硬中断详情
  viewMoreDetail(row: any, type: string) {
    switch (type) {
      case 'TOP10_process':
        // Top10 进程绑核状态 进程视图
        this.popTitle = this.i18n.popInfo.TOP10_process;
        this.popProcessTitleLeft = this.i18n.pcieDetailsinfo.processTitle1;
        this.popProcessTitleRight = row.key;
        this.popProcess = row.cmdline;
        this.popProcessRight = this.i18n.pcieDetailsinfo.processTitle2;
        this.irqToCoreData = this.getIrqToCoreData(row);
        this.openViewDetailMask(this.viewDetailMask);
        break;
      case 'TOP10_cpu':
        this.top10CpuCoreNum = row.key || 0;
        // Top10 进程绑核状态 CPU核视图
        this.popTitle = this.i18n.popInfo.TOP10_process;
        this.isPopTableTtpe = 'TOP10_cpu';
        this.popProcess = row.cmdline;
        this.popProcessRight = this.i18n.pcieDetailsinfo.processTitle2;
        this.srcDataPop = this.changeObjToArry(row.dict_value);
        this.openViewDetailMask(this.viewDetailMaskCpu);
        break;
      case 'Irq':
        // 硬中断绑核状态 中断编号视图
        this.popProcessTitleLeft = this.i18n.pcieDetailsinfo.interrupttitle1;
        this.popProcessTitleRight = row.key;
        this.popTitle = this.i18n.pcieDetailsinfo.interrupttitle1;
        this.irqToCoreData = this.getIrqToCoreData(row);
        this.openViewDetailMask(this.viewDetailMask);
        break;
      case 'Irq_cpu':
        // 硬中断绑核状态 CPU核视图
        this.popTitle = this.i18n.popInfo.Irq_cpu;
        this.isPopTableTtpe = 'Irq_cpu';
        this.srcDataPop = this.changeObjToArry(row.dict_value);
        this.openViewDetailMask(this.viewDetailMaskCpu);
        break;
      case 'Xps':
        // XPS/RPS绑核状态信息 中断编号视图
        this.irqToCoreData = this.getIrqToCoreData(row);
        this.popProcessTitleLeft = this.i18n.popInfo.Xps_title;
        this.popProcessTitleRight = row.key;
        this.popTitle = this.i18n.popInfo.Xps;
        this.openViewDetailMask(this.viewDetailMask);
        break;
      case 'Xps_cpu':
        // XPS/RPS绑核状态信息 CPU核视图
        this.popTitle = this.i18n.popInfo.Xps_cpu;
        this.isPopTableTtpe = 'Xps_cpu';
        this.srcDataPop = this.changeObjToArry(row.dict_value);
        this.openViewDetailMask(this.viewDetailMaskCpu);
        break;
      default: break;
    }
  }
  // 处理数据
  private dealData(row: any) {
    this.boxInfo = [];
    const baseNumber = row.affinity_mask;
    const cpuInfo = baseNumber.split(',').reverse();
    cpuInfo.map((item: number) => {
      const arr = (item + '').split('');
      let arr1: any[] = [];
      arr.forEach((num: string) => {
        const decimal = parseInt(num + '', 16);
        let binary = decimal.toString(2).split('');
        // 补零
        switch (binary.length) {
          case 1:
            binary = ['0', '0', '0'].concat(binary);
            break;
          case 2:
            binary = ['0', '0'].concat(binary);
            break;
          case 3:
            binary = ['0'].concat(binary);
            break;
          default: break;
        }
        arr1 = arr1.concat(binary);
      });
      this.boxInfo.push(arr1);
    });
  }

   // 处理数据
   private getInterruptInfo(row: any): TieCoreState[][] {

    const boxInfo: TieCoreState[][] = [];
    const baseNumber = row.affinity_mask;
    const cpuInfo = baseNumber.split(',');
    cpuInfo.map((item: number) => {
      const arr = (item + '').split('');
      let arr1: any[] = [];
      arr.forEach((num: string) => {
        const decimal = parseInt(num + '', 16);
        let binary = decimal.toString(2).split('').map((b: string) => parseInt(b, 2));
        // 补零
        switch (binary.length) {
          case 1:
            binary = [0, 0, 0].concat(binary);
            break;
          case 2:
            binary = [0, 0].concat(binary);
            break;
          case 3:
            binary = [0].concat(binary);
            break;
          default: break;
        }
        arr1 = arr1.concat(binary);
      });
      boxInfo.push(arr1.reverse());
    });
    return boxInfo.reverse();
  }

  private getIrqToCoreData(row: any): IrqToCoreInfo[][] {

    const irqBaseHexColor = '#ed4b4b';
    const normalHexColor = '#e1e4e8';

    const bindInfo = this.getInterruptInfo(row);
    const irpCountList = row.irq_count_list ?? [];

    const maxIrq = Cat.isEmpty(irpCountList) ? 0 : Math.max(...irpCountList);
    const minIrq = Cat.isEmpty(irpCountList) ? 0 : Math.min(...irpCountList);
    const diffValue = maxIrq - minIrq;

    let coreNum = 0;
    const irqToCoreData: IrqToCoreInfo[][] = bindInfo.map(numa => {
      return numa.map((bindSym) => {
        const currIrq = irpCountList[coreNum] ?? void 0;
        const degree = (maxIrq - currIrq) / (diffValue + 0.0000001) * 0.7;
        return {
          isBind: Boolean(bindSym),
          core: coreNum++,
          irqNum: currIrq,
          color: currIrq === 0 || currIrq === undefined
            ? normalHexColor
            : Color.lighten(irqBaseHexColor, Math.min(degree, 0.85))
        };
      });
    });

    return irqToCoreData;
  }
  public getCpuNumber(num: number) {
    return Math.floor(num / 2);
  }
  public getNodeDetailsItemObjKeys(obj: any) {
    return Object.keys(obj).filter(item => (
      item !== 'name' && item !== 'suggestion' && item !== 'annotation'
    ));
  }

  /**
   * 打开硬中断编号 分布图弹框
   * @param modal 弹框组件
   */
  private openViewDetailMask(modal: TemplateRef<any>) {
      this.tiModal.open(modal, {
        modalClass: 'pcie-view-detail-mask-modal',
      });
    }
}
