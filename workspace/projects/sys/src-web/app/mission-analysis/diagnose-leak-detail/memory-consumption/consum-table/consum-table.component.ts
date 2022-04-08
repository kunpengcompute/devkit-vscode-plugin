import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { AxiosService } from 'projects/sys/src-web/app/service/axios.service';
import { TiTableColumns, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import { MytipService } from 'projects/sys/src-web/app/service/mytip.service';

@Component({
  selector: 'app-consum-table',
  templateUrl: './consum-table.component.html',
  styleUrls: ['./consum-table.component.scss']
})
export class ConsumTableComponent implements OnInit, OnDestroy {

  constructor(public Axios: AxiosService, public i18nService: I18nService, public mytip: MytipService) {
    this.i18n = this.i18nService.I18n();
  }
  @Input() projectName: any;
  @Input() taskName: any;
  @Input() analysisType: any;
  @Input() taskId: any;
  @Input() nodeId: any;
  @Input()
  get pid() {
    return this.ppid;
  }
  set pid(data: any) {
    if (data !== '--') {
      this.ppid = data;
      this.getSummury();
    }
  }
  @Input()
  get tableData() {
    return this.originData;
  }
  set tableData(data: any) {
    if (data && data.length > 0) {
      this.originData = data;
      this.memPagSrcData.data = data;
      this.totalPage = data.length;
    }
  }
  public ppid: any;
  public originData: any[] = [];
  public language = 'zh';
  public i18n: any;
  public appData: any = [];
  public systemData: any = [];
  public distData: any = [];
  public hardConfigData: any = [];
  public softConfigData: any = [];
  public memPagDisplayData: Array<TiTableRowData> = [];
  public memPagSrcData: TiTableSrcData = {
    data: ([] as Array<TiTableRowData>),
    state: {
      searched: false, // 源数据未进行搜索处理
      sorted: false, // 源数据未进行排序处理
      paginated: false,
    }
  };
  public pageSize = {
    options: [10, 20, 50, 100],
    size: 10
  };
  public currentPage = 1;
  public totalPage: number;
  public isSearch = false;
  public value = '';
  public memPagTitle: Array<TiTableColumns> = [];
  ngOnInit(): void {
    this.systemData = [{ title: '', data: '--', key: 'rss_peak', important: true, unit: ' KB' },
    { title: '', data: '--', key: 'vss_peak', important: false, unit: 'KB' }];
    this.appData = [{ title: '', data: '--', key: 'malloc_peak', important: true, unit: 'KB' },
    { title: '', data: '--', key: 'malloc_count', important: false, unit: this.i18n.storageIO.ioapis.time1 },
    { title: '', data: '--', key: 'malloc_size', important: false, unit: 'KB' },
    { title: '', data: '--', key: 'free_count', important: false, unit: this.i18n.storageIO.ioapis.time1 },
    { title: '', data: '--', key: 'free_size', important: false, unit: 'KB' }, {
      title: '', data: '--', key: 'leak_count', important: false, unit: this.i18n.storageIO.ioapis.time1
    },
    { title: '', data: '--', key: 'leak_size', important: false, unit: 'KB' }];
    this.distData = [{ title: '', data: '--', key: 'system_bytes_peak', important: true, unit: 'KB' },
    { title: '', data: '--', key: 'in_use_bytes_peak', important: false, unit: 'KB' },
    { title: '', data: '--', key: 'free_bytes_peak', important: true, unit: 'KB' },
    { title: '', data: '--', key: 'arena', important: false, unit: this.i18n.sys_summary.unit.entry },
    { title: '', data: '--', key: 'mmap_count_peak', important: false, unit: this.i18n.sys_summary.unit.entry },
    { title: '', data: '--', key: 'mmap_size_peak', important: false, unit: 'KB' }];
    this.memPagTitle = [
      {
        title: this.i18n.diagnostic.consumption.site,
        key: 'address'
      },
      {
        title: 'Mapping',
        key: 'mmapping'
      },
      {
        title: this.i18n.diagnostic.consumption.summury.rss_peak,
        key: 'rss_peak'
      },
      {
        title: this.i18n.diagnostic.consumption.summury.vss_peak,
        key: 'vss_peak'
      }
    ];
    document.addEventListener('click', (event) => {
      this.clickHidden(event);
    }, true);
  }
  private clickHidden(event: MouseEvent){
    const searchBox = document.querySelector('.consum-table-search');
    if (searchBox && (searchBox === event.target || searchBox.contains(event.target as Node))){
    } else if (this.isSearch){
      this.isSearch = false;
    }
  }
  ngOnDestroy() {
    this.isSearch = false;
    document.removeEventListener('click', this.clickHidden, true);
  }

  /**
   * 搜索
   * @param event 输入字符串
   */
  public comSearch(event: any) {
    const keyword = event === undefined ? '' : event.toString().trim();
    const str = encodeURIComponent(keyword);
    this.memPagSrcData.data = [];
    this.originData.forEach((val: TiTableRowData) => {
      if (val.mmapping.indexOf(str) > -1) {
        this.memPagSrcData.data.push(val);
      }
    });
    this.totalPage = this.memPagSrcData.data.length;
    this.isSearch = false;
  }

  /**
   * 清空搜索框
   */
  public onClear(): void {
    const str = '';
    this.memPagSrcData.data = this.originData;
    this.totalPage = this.memPagSrcData.data.length;
  }

  /**
   * 获取汇总信息
   */
  public getSummury() {
    const params = {
      nodeId: this.nodeId,
      pid: this.pid,
    };
    this.Axios.axios.get('/memory-analysis/' + this.taskId + '/mem-consume-summary/', {
      params, headers: {
        showLoading: false,
      },
    })
      .then((resp: any) => {
        const titleArr = resp.data?.mem_consume_summary?.data?.title;
        const summuryData = resp.data?.mem_consume_summary?.data?.data[0];
        if (titleArr.length > 0) {
          this.systemData.forEach((item: { key: string | number; title: any; data: any; }) => {
            const idx = titleArr.indexOf(item.key);
            item.title = this.i18n.diagnostic.consumption.summury[item.key];
            if (idx > -1 && summuryData) {
              item.data = summuryData[idx];
            }
          });
          this.appData.forEach((item: { key: string | number; title: any; data: any; }) => {
            const idx = titleArr.indexOf(item.key);
            item.title = this.i18n.diagnostic.consumption.summury[item.key];
            if (idx > -1 && summuryData) {
              item.data = summuryData[idx];
            }
          });
          this.distData.forEach((item: { key: string | number; title: any; data: any; }) => {
            const idx = titleArr.indexOf(item.key);
            item.title = this.i18n.diagnostic.consumption.summury[item.key];
            if (idx > -1 && summuryData) {
              item.data = summuryData[idx];
            }
          });
        }
      });
  }

}
