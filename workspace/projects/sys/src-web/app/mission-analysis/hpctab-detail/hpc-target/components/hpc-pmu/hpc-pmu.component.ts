import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { TiTableColumns, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import { HpcPmuService } from '../../service';

@Component({
  selector: 'app-hpc-pmu',
  templateUrl: './hpc-pmu.component.html',
  styleUrls: ['./hpc-pmu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HpcPmuComponent implements OnInit {

  @Input() projectName: string;
  @Input() taskName: string;
  @Input() taskId: number;
  @Input() nodeId: number;

  public i18n: any;
  public coreData: TiTableSrcData;
  public uncoreData: TiTableSrcData;
  public coreDisplayed: Array<TiTableRowData> = [];
  public uncoreDisplayed: Array<TiTableRowData> = [];
  public coreColumns: Array<TiTableColumns> = [];
  public uncoreColumns: Array<TiTableColumns> = [];
  public isLoading = false;

  constructor(
    private i18nService: I18nService,
    private pmuService: HpcPmuService,
    private cdr: ChangeDetectorRef
  ) {
    this.i18n = this.i18nService.I18n();
  }
  ngOnInit(): void {
    this.isLoading = true;
    this.coreData = {
      data: [],
      state: {
        searched: false,
        sorted: false,
        paginated: false
      }
    };
    this.uncoreData = {
      data: [],
      state: {
        searched: false,
        sorted: false,
        paginated: false
      }
    };
    this.coreColumns = [
      { title: this.i18n.hpc.hpc_target.event, width: '50%' },
      { title: this.i18n.hpc.hpc_target.count, width: '50%', sortKey: 'count' }
    ];
    this.uncoreColumns = [
      { title: this.i18n.hpc.hpc_target.event, width: '50%' },
      { title: this.i18n.hpc.hpc_target.count, width: '50%', sortKey: 'count' }
    ];

    this.pmuService.getPMUdata(this.taskId, this.nodeId)
      .then((res: { coreData: any[], uncoreData: any[] }) => {
        this.uncoreData.data = res.uncoreData;
        this.coreData.data = res.coreData;
        this.isLoading = false;
        this.cdr.markForCheck();
      })
      .catch(() => {
        this.isLoading = false;
        this.cdr.markForCheck();
      });

  }
}
