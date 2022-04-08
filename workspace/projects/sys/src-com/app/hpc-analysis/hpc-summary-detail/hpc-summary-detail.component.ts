import { ChangeDetectorRef, Component, Input, NgZone, OnInit } from '@angular/core';
import { TiTableRowData, TiTableSrcData } from '@cloud/tiny3';
import { Cat } from 'hyper';
import { I18n } from 'sys/locale';
import { AnalysisTarget } from '../../domain';
import { HttpService, I18nService, TipService } from '../../service';
import { CommonTableData, CommonTreeNode } from '../../shared/domain';

@Component({
  selector: 'app-hpc-summary-detail',
  templateUrl: './hpc-summary-detail.component.html',
  styleUrls: ['./hpc-summary-detail.component.scss']
})
export class HpcSummaryDetailComponent implements OnInit {

  @Input() projectName: string;
  @Input() taskName: string;
  @Input() taskId: number;
  @Input() nodeId: number;

  public summaryDetailData: any = [];
  public i18n: any;

  private hotSpotsData: any;
  public facetOptions: Array<any> = [];
  public currentFacet = '';

  public hotSpotsTable: CommonTableData = {  // Hotspots表格
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

  public serialTable: CommonTableData = {  // 串行时间表格
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

  public parallelTable: CommonTableData = {  // 不平衡时间表格
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

  public topSerialHotspots = 'Top Serial hotspots';
  public topParallelHotspots = 'Top parallel regions';
  private analysisTarget: AnalysisTarget = AnalysisTarget.PROFILE_SYSTEM;  // 分析对象

  constructor(
    private http: HttpService,
    private changeDetectorRef: ChangeDetectorRef,
    private zone: NgZone,
    private i18nService: I18nService,
    private tipServe: TipService,
  ) {
    this.i18n = this.i18nService.I18n();
  }
  /**
   * 初始化
   */
  ngOnInit() {
    this.facetOptions = [
      { label: I18n.common_term_projiect_function, id: 'function' },
      { label: I18n.common_term_task_tab_summary_module, id: 'module' },
      { label: 'parallel-region', id: 'parallel-region' },
      { label: 'barrier-to-barrier-segment', id: 'barrier-to-barrier-segment' },
    ];

    this.hotSpotsTable.columnsTree = [
      {
        label: I18n.common_term_projiect_function,
        key: 'index_name',
        searchKey: 'index_name',
      },
      {
        label: 'CPU Times(s)',
        key: 'cpu_time',
        sortKey: 'cpu_time',
        sortStatus: 'desc',
      },
      {
        label: 'Instructions Retired',
        key: 'instructions_retired',
        sortKey: 'instructions_retired',
      },
      {
        label: 'Cycles per Insturction(CPI)',
        key: 'cpi',
        sortKey: 'cpi',
      },
      {
        label: 'Retiring(%)',
        key: 'retiring',
        sortKey: 'retiring',
      },
      {
        label: 'Backend Bound(%)',
        key: 'backend_bound',
        sortKey: 'backend_bound',
      },
      {
        label: 'Fronted Bound(%)',
        key: 'frontend_bound',
        sortKey: 'frontend_bound',
      },
      {
        label: 'Bad Speculation(%)',
        key: 'bad_speculation',
        sortKey: 'bad_speculation',
      }
    ];

    this.serialTable.columnsTree = [
      {
        label: I18n.common_term_projiect_function,
        key: 'funName',
        searchKey: 'funName',
      },
      {
        label: 'CPU Times(s)',
        key: 'cpuTime',
        sortKey: 'cpuTime',
      },
      {
        label: 'Instructions Retired',
        key: 'insRet',
        sortKey: 'insRet',
      },
      {
        label: 'Cycles per Instruction',
        key: 'CPI',
        sortKey: 'CPI',
      }
    ];
    this.parallelTable.columnsTree = [
      {
        label: 'Parallel region',
        key: 'parallelRegion',
      },
      {
        label: 'Potential Gain(s)',
        key: 'CPI',
        sortKey: 'CPI',
      },
      {
        label: 'Run Time(s)',
        key: 'runTime',
        sortKey: 'runTime',
      },
      {
        label: 'Imbalance time(s)',
        key: 'imbalanceTime',
        sortKey: 'imbalanceTime',
      },
      {
        label: 'Imbalance ratio(%)',
        key: 'imbalanceRatio',
        sortKey: 'imbalanceRatio',
      }
    ];
    this.currentFacet = I18n.common_term_projiect_function;

    this.getBasicDate();
    this.updateWebViewPage();
  }
  /**
   * 获取基础数据
   */
  private async getBasicDate() {
    // 获取hotspots数据
    this.hotSpotsData = await this.getHotspotsData(this.taskId, this.nodeId);

    // 获取Configuration数据
    const respConfigurationData: any = await this.http.get('/tasks/' + encodeURIComponent(this.taskId)
      + '/common/configuration/?node-id=' + encodeURIComponent(this.nodeId));

    // 获取总览数据
    let respHpcSummaryData: any;
    try {
      respHpcSummaryData = await this.http.get('/tasks/' + encodeURIComponent(this.taskId)
        + '/hpc-analysis/basicinfo/?node-id=' + encodeURIComponent(this.nodeId) + '&query-type=summary');
    } catch (error) {
      this.tipServe.alertInfo({
        type: 'error',
        content: error.message,
        time: 3500
      });
    }
    this.analysisTarget = respConfigurationData?.data?.['analysis-target'];

    if (respHpcSummaryData && !Cat.isEmpty(respHpcSummaryData.data.hpc.data)) {
      this.handleSummaryData(respHpcSummaryData.data.hpc.data, respConfigurationData.data.mpi_status);
      this.handleHotspots('function');

      const topSerialHot = respHpcSummaryData.data.hpc.data?.top_n_hotspots || [];
      const topParallelHot = respHpcSummaryData.data.hpc.data?.top_n_parallel_regions || [];
      this.serialTable.srcData.data = topSerialHot.map((arr: any[]) => {
        const [funName, cpuTime, insRet, CPI] = arr;
        return { funName, cpuTime, insRet, CPI };
      });
      this.parallelTable.srcData.data = topParallelHot.map((arr: any[]) => {
        const [parallelRegion, CPI, runTime, imbalanceTime, imbalanceRatio] = arr;
        return { parallelRegion, CPI, runTime, imbalanceTime, imbalanceRatio };
      });

      this.updateWebViewPage();
    }
  }

  /**
   * 处理总览页签数据
   * @param data launch data
   * @param isMPI 采集类型是否是MPI
   */
  private handleSummaryData(data: any, isMPI: boolean) {
    this.summaryDetailData = [
      {
        levelIndex: 0,
        name: I18n.mission_modal.hpc.basic.exe_time,
        value: data['Elapsed Time'] || '--',
        expand: false,
      },
      {
        levelIndex: 0,
        name: I18n.mission_modal.hpc.basic.cpi,
        value: data['Cycles per Instruction (CPI)'] || '--',
        children: null,
        expand: false
      },
      {
        levelIndex: 0,
        name: I18n.mission_modal.hpc.basic.use_rate,
        value: data['CPU Utilization'] || '--',
        children: null,
        expand: false
      },
      {
        levelIndex: 0,
        name: 'Hotspots',
        value: '',
        children: [
          {
            levelIndex: 1,
            name: 'hotSpotTable',
            value: '',
            showTable: true,
            expand: false,
            isLastChild: true,
          }
        ],
        expand: false,
      }
    ];

    // 应用类型
    if (this.analysisTarget !== AnalysisTarget.PROFILE_SYSTEM &&
        this.analysisTarget !== AnalysisTarget.ATTACH_TO_PROCESS
    ) {
      // MPI
      if (isMPI) {
        const mpiWaitRate = {
          levelIndex: 0,
          name: 'MPI Wait Rate',
          value: data['MPI Wait Rate'] || '--',
          expand: false,
          children: [
            {
              levelIndex: 1,
              name: 'Communication',
              value: data.Communication || '--',
              expand: false,
              children: [
                {
                  levelIndex: 2,
                  name: 'Point to point',
                  value: data['Point to point'] || '--',
                  expand: false,
                  isLastChild: true,
                },
                {
                  levelIndex: 2,
                  name: 'Collective Communication',
                  value: data['Collective Communication'] || '--',
                  expand: false,
                  isLastChild: true,
                }
              ]
            },
            {
              levelIndex: 1,
              name: 'Synchronization',
              value: data.Synchronization || '--',
              expand: false,
            },
            {
              levelIndex: 1,
              name: 'IO',
              value: data['I/O'] || '--',
              expand: false,
              children: [
                {
                  levelIndex: 2,
                  name: 'Single',
                  value: data.Single || '--',
                  expand: false,
                  isLastChild: true,
                },
                {
                  levelIndex: 2,
                  name: 'Collective I/O',
                  value: data['Collective I/O'] || '--',
                  expand: false,
                  isLastChild: true,
                }
              ]
            },
          ]
        };
        this.summaryDetailData.splice(3, 0, mpiWaitRate);
      } else {
        // OpenMP
        const openMpTeam: any = {
          levelIndex: 0,
          name: I18n.mission_modal.hpc.basic.openMp_rate,
          value: data['OpenMP Team Utilization'] || '--',
          children: null,
          expand: false
        };
        this.summaryDetailData.splice(3, 0, openMpTeam);
        this.summaryDetailData[0].children = [
          {
            levelIndex: 1,
            name: I18n.mission_modal.hpc.basic.serial_time,
            value: data['Serial Time'] || '--',
            expand: false,
            children: [
              {
                levelIndex: 2,
                name: this.topSerialHotspots,
                expand: false,
                isLastChild: true,
                showTable: true,
                tableData: data?.top_n_hotspots
              }
            ],
          },
          {
            levelIndex: 1,
            name: I18n.mission_modal.hpc.basic.parallel_time,
            value: data['Parallel Time'] || '--',
            expand: false,
            children: [
              {
                levelIndex: 2,
                name: I18n.mission_modal.hpc.basic.unbalance_time,
                value: data.Imbalance || '--',
                expand: false,
                isLastChild: true,
              },
              {
                levelIndex: 2,
                name: this.topParallelHotspots,
                expand: false,
                isLastChild: true,
                showTable: true,
                tableData: data?.top_n_parallel_regions,
              },
            ]
          }
        ];
      }
    }
  }
  public getHotspotsData(taskId: number, nodeId: number) {
    return new Promise<any>(async (resolve) => {
      // 使用模板字符串拼接换行会有空格
      const url = '/tasks/' + encodeURIComponent(taskId) + '/hpc-analysis/hotspots/'
        + '?node-id=' + encodeURIComponent(nodeId) + '&query-type=hotspots';
      const resp: any = await this.http.get(url);
      resolve(resp.data.hpc.data);
    });
  }
  /**
   * 不同维度筛选
   * @param type 不同维度 module/模块、function/函数、parallel-region、barrier-to-barrier-segment
   */
  public handleHotspots(type: string) {
    this.hotSpotsTable.srcData.data = this.hotSpotsData[type];
  }
  public onSelect(option: any): void {
    this.hotSpotsTable.columnsTree[0].label = option.label;
    this.handleHotspots(option.id);
    // 深拷贝触发表格更新
    this.hotSpotsTable = JSON.parse(JSON.stringify(this.hotSpotsTable));
  }
  public compareFn(a: any, b: any, predicate: string): number {
    return a[predicate] - b[predicate];
  }

  /**
   * IntellIj刷新webview页面
   */
  public updateWebViewPage() {
    if ((self as any)?.webviewSession?.getItem('tuningOperation') === 'hypertuner') {
      this.zone.run(() => {
        this.changeDetectorRef.checkNoChanges();
        this.changeDetectorRef.detectChanges();
      });
    }
  }

}
