import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { TiTableRowData, TiTableSrcData } from '@cloud/tiny3';
import { HpcMpiComService } from '../components/hpc-com/hpc-mpi-com.service';
import { HpcMpiTitleService } from '../components/hpc-com/hpc-mpi-title.service';
import { HttpService, I18nService } from 'sys/src-com/app/service';
import { CommonTableData, CommonTreeNode } from '../../shared/domain';


@Component({
  selector: 'app-hpc-mpi-com',
  templateUrl: './hpc-mpi-com.component.html',
  styleUrls: ['./hpc-mpi-com.component.scss']
})

export class HpcMpiComComponent implements OnInit {
  @Input() projectName: string;
  @Input() taskName: string;
  @Input() taskId: number;
  @Input() nodeId: number;

  public i18n: any;
  public mpiTableData: CommonTableData = {  // Hotspots表格
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
  public miRestData: any;
  public mpiOps: any = [
    { label: 'rank' },
    { label: 'function' },
    { label: 'send-type' },
    { label: 'recv-type' },
    { label: 'mpi-comm' }
  ];
  public mpiSelected: any = this.mpiOps[0];
  public noDataSuggest: string;
  public isLoading = false;
  constructor(
    private i18nService: I18nService,
    private hpcMpiCom: HpcMpiComService,
    private hpcMpiTitle: HpcMpiTitleService,
    private http: HttpService,
  ) {
    this.i18n = this.i18nService.I18n();
    this.noDataSuggest = this.i18n.common_term_task_nodata;
  }

  public handlerMpiData(mpiData: any, selectItem: any) {
    let columns: any[];
    columns = this.hpcMpiTitle.mpiCols[selectItem];
    const keys: any[] = [];
    columns.forEach((item: { label: string, key: string }) => {
      keys.push(item.key);
    });

    // 获取表格数据
    const arrData = mpiData.hpc.data[selectItem] ?? [];
    if (arrData.length > 0) {
      this.mpiTableData.srcData.data = arrData.map((arr: any[]) => {
        const column: {[x: string]: any} = {};
        keys.forEach((key: string, index: number) => {
          column[key] = arr[index];
        });
        return column;
      });
    }


    // 获取表格列
    this.mpiTableData.columnsTree = columns.map((column: any, index: number) => {
      if (index === 0) {
        column.searchKey = column.key;
      } else {
        column.sortKey = column.key;
      }
      return column;
    });
    // 深拷贝，避免切换分页的时候下拉选择其他项表格无数据
    this.mpiTableData = JSON.parse(JSON.stringify(this.mpiTableData));
  }

  ngOnInit(): void {
    this.isLoading = true;
    const params = { 'node-id': this.nodeId, 'query-type': 'mpi-wait' };
    this.http.get(`/tasks/${encodeURIComponent(this.taskId)}/hpc-analysis/mpi/`, {
      params,
      headers: { showLoading: false }
    }).then((resp: any) => {
      this.miRestData = resp;
      this.handlerMpiData(this.miRestData.data, this.mpiOps[0].label);
      this.isLoading = false;
    }).catch((error: any) => {
      this.isLoading = false;
    });
  }
}
