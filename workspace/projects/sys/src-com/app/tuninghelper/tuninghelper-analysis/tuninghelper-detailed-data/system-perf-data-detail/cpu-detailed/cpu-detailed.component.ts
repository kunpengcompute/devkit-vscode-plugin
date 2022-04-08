import { Component, Input, OnInit } from '@angular/core';
import { HttpService } from 'sys/src-com/app/service';
import { QueryTypeEnum, CpuUtilization, CpuLoad, CpuContextSwitch, CpuIrqInfo } from '../domain';
@Component({
  selector: 'app-cpu-detailed',
  templateUrl: './cpu-detailed.component.html',
  styleUrls: ['./cpu-detailed.component.scss']
})
export class CpuDetailedComponent implements OnInit {
  @Input() taskId: any;
  @Input() nodeid: any;
  constructor(
    private http: HttpService,
  ) { }
  // CPU Core
  public cpuCoreData: CpuUtilization[];
  // NUMA NODE
  public numaCoreData: CpuUtilization[];
  // cpu负载
  public loadData: CpuLoad;
  // 运行的进程线程
  public allProcessThreads: any;
  // 硬中断信息-硬中断编号视图
  public hardNoView: any;
  // 硬中断信息-cpu核视图
  public cpuCoreView: CpuIrqInfo[];
  // 中断设备筛选的cpu核视图
  public ethCpuData: any;
  // 软中断数据
  public softIrq: any;
  public ksoftirqdList: number[];
  // 中断分布统计
  public interruptDistribution: any;
  // 任务创建和上下文切换统计
  public cpuContextSwitch: CpuContextSwitch;
  // NUMA个数
  public numaNum = 4;

  async ngOnInit() {
    const res = await this.getCpuData(this.taskId, this.nodeid);
    const data = res.data.optimization.data;
    this.cpuCoreData = data?.cpu_utilization;
    this.numaCoreData = this.getNumaNodeData(data?.numa_info);
    this.loadData = data?.cpu_load;
    this.allProcessThreads = data?.cpu_all_process;
    this.hardNoView = data?.irq_affinity_info;
    this.ethCpuData = data?.eth_cpu_hard_irq;
    this.cpuCoreView = this.getCpuIrqInfo(data?.cpu_irq_info);
    this.softIrq = data?.softirq_sub;
    this.ksoftirqdList = data?.ksoftirqd_list;
    this.cpuContextSwitch = data?.cpu_context_switch;
    this.interruptDistribution =
      Object.assign({}, data?.interrupt_distribution, { echartOpt: data?.interrupt_distributions });
    this.numaNum = data.context_info?.numa_num;
  }

  public getCpuData(taskId: number, nodeId: number): Promise<any> {
    const params = {
      'node-id': nodeId,
      'query-type': JSON.stringify([
        QueryTypeEnum.CPUUTILIZATION,
        QueryTypeEnum.CPULOAD,
        QueryTypeEnum.CPUALLPROCESS,
        QueryTypeEnum.CPUMICROINFO,
        QueryTypeEnum.CPUHARDIRQ,
        QueryTypeEnum.CPUCONTEXTSWITCH,
        QueryTypeEnum.CPUALLIRQINFO
      ]),
    };
    return this.http.get(`/tasks/${encodeURIComponent(taskId)}/optimization/system-performance/`, { params });
  }
  public getNumaNodeData(data: any): CpuUtilization[] {
    const nodeList: CpuUtilization[] = [];
    if (!data) { return []; }
    Object.keys(data).forEach((key: string) => {
      if (key.includes('VAL')) {
        data[key].value = key.slice(0, -4);
        data.showSub = false;
        data.level = 1;
        nodeList.push(data[key]);
      }
    });
    const nodeData: CpuUtilization[] = [];
    nodeList.map((node: CpuUtilization) => {
      nodeData.push(Object.assign({}, node, { subData: data[`${node.value}`] }));
    });
    return nodeData;
  }
  public getCpuIrqInfo(value: any) {
    const irqList: CpuIrqInfo[] = [];
    if (!value) { return []; }
    Object.keys(value).forEach((key) => {
      irqList.push(Object.assign({}, value[key], { cpu_core: key }));
    });
    return irqList;
  }
}
