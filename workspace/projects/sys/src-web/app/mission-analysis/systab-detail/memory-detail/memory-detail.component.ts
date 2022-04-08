import {
  Component,
  OnInit,
  Input,
  AfterViewInit,
  ViewChild,
  Output, EventEmitter,
} from '@angular/core';
import { AxiosService } from 'projects/sys/src-web/app/service/axios.service';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import { MytipService } from 'projects/sys/src-web/app/service/mytip.service';
@Component({
  selector: 'app-memory-detail',
  templateUrl: './memory-detail.component.html',
  styleUrls: ['./memory-detail.component.scss'],
})
export class MemoryDetailComponent implements OnInit, AfterViewInit {
  @ViewChild('usage') usage: any;
  @ViewChild('pag') pag: any;
  @ViewChild('swap') swap: any;
  @Input() taskid: any;
  @Input() nodeid: any;
  @Input() timeLine: any;
  @Output() public memorySelectData = new EventEmitter<any>();
  @Output() public ZoomData = new EventEmitter<any>();
  @Output() public memoryEchartsInstOut = new EventEmitter<any>();
  public usageData: any;
  public resUsageData: any;
  public pagData: any;
  public resPagData: any;
  public swapData: any;
  public resSwapData: any;
  public usageTypeOption: any = [];
  public usageTypeSelected: any;
  public pagOption: any = [];
  public pagSelected: any;
  public swapOption: any = [];
  public swapSelected: any;
  public i18n: any;
  public memoryUtilization = true; // 内存利用率是否展示
  public Pagination = false; // 内存分页统计是否展示
  public exchange = false; // 交换统计是否展示
  public usagEcharteData: any = []; //  内存利用率
  public pageEcharteData: any = []; // 分页统计
  public swapEcharteData: any = []; // 交换统计
  public usageLoading = false;
  public swapLoading = true;
  public pageLoading = true;
  constructor(
    public Axios: AxiosService,
    public i18nService: I18nService,
    public mytip: MytipService
  ) {
    this.i18n = this.i18nService.I18n();
  }

  ngOnInit() {
  }
  ngAfterViewInit() {
    this.getData();
  }

  public async getData() {
    const params = {
      'node-id': this.nodeid,
      'query-type': 'detail',
      'query-target': 'mem_usage', // 例如cpu_usage, cpu_avgload, mem_usage等
    };
    try {
      this.usageLoading = true;
      const res1 = await this.Axios.axios.get(`/tasks/${encodeURIComponent(this.taskid)}/sys-performance/`,
        {
          params, headers: {
            showLoading: false,
          },
        });
      this.resUsageData = res1.data;
      this.initUsageData();
    }
    catch {
      this.usageLoading = false;
    }

    try {
      this.pageLoading = true;
      params['query-target'] = 'mem_page';
      const res2 = await this.Axios.axios.get(`/tasks/${encodeURIComponent(this.taskid)}/sys-performance/`,
        {
          params, headers: {
            showLoading: false,
          },
        });
      this.resPagData = res2.data;
      this.initPagData();
    }
    catch {
      this.pageLoading = false;
    }
    try {
      this.swapLoading = true;
      params['query-target'] = 'mem_swap';
      const res3 = await this.Axios.axios.get(`/tasks/${encodeURIComponent(this.taskid)}/sys-performance/`,
        {
          params, headers: {
            showLoading: false,
          },
        });
      this.resSwapData = res3.data;
      this.initSwapData();
    }
    catch {
      this.swapLoading = false;
    }
  }
  public usageTypeChange(e: any) {
    this.memoryUtilization = e.show;
    if (!e.show) {    // 如果不展示平均负载 直接结束
      return;
    }
    if (!e.change) {  // 如果筛选没有变化 直接结束
      return;
    }
    this.usageTypeSelected = e.data;
    this.setUsageData();
    this.usageTypeOption.forEach((item: any) => {
      if (this.usageTypeSelected.length === 1) {
        if (item.id === this.usageTypeSelected[0].id) {
          item.disabled = true;
        }
      } else {
        item.disabled = false;
      }
    });
    if (
      this.usageTypeSelected.length !== 0 &&
      this.usageTypeSelected.length !== 0
    ) {
      setTimeout(() => {
        this.usage.initTable();
      }, 0);
    }
  }
  public pagChange(e: any) {
    this.Pagination = e.show;
    if (!e.show) {    // 如果不展示平均负载 直接结束
      return;
    }
    if (!e.change) {  // 如果筛选没有变化 直接结束
      return;
    }
    this.pagSelected = e.data;
    this.setPagData();
    this.pagOption.forEach((item: any) => {
      if (this.pagSelected.length === 1) {
        if (item.id === this.pagSelected[0].id) {
          item.disabled = true;
        }
      } else {
        item.disabled = false;
      }
    });
    if (this.pagSelected.length !== 0 && this.pagSelected.length !== 0) {
      setTimeout(() => {
        this.pag.initTable();
      }, 0);
    }
  }
  public swapChange(e: any) {
    this.exchange = e.show;
    if (!e.show) {    // 如果不展示平均负载 直接结束
      return;
    }
    if (!e.change) {  // 如果筛选没有变化 直接结束
      return;
    }
    this.swapSelected = e.data;
    this.setSwapData();
    this.swapOption.forEach((item: any) => {
      if (this.swapSelected.length === 1) {
        if (item.id === this.swapSelected[0].id) {
          item.disabled = true;
        }
      } else {
        item.disabled = false;
      }
    });
    if (this.swapSelected.length !== 0 && this.swapSelected.length !== 0) {
      setTimeout(() => {
        this.swap.initTable('swap');
      }, 0);
    }
  }
  public initUsageTypeOption(data: any) {
    this.usageTypeOption = [];
    if (data.length > 0) {
      data.forEach((item: any) => {
        this.usageTypeOption.push({
          label: item,
          id: item,
        });
      });
      this.usageTypeOption[0].disabled = true;
      this.usageTypeSelected = [this.usageTypeOption[3]];
    }
    this.memorySelectData.emit({
      allData: this.usageTypeOption,
      newData: this.usageTypeSelected, type: 1, memoryUtilization: this.memoryUtilization, Pagination: this.Pagination,
      exchange: this.exchange
    });
  }
  public initPagOption(data: any) {
    this.pagOption = [];
    if (data.length > 0) {
      data.forEach((item: any) => {
        this.pagOption.push({
          label: item,
          id: item,
        });
      });
      this.pagOption[0].disabled = true;
      this.pagSelected = [this.pagOption[0]];
    }
    this.memorySelectData.emit({ allData: this.pagOption, newData: this.pagSelected, type: 2 });
  }
  public initSwapOption(data: any) {
    this.swapOption = [];
    if (data.length > 0) {
      data.forEach((item: any) => {
        this.swapOption.push({
          label: item,
          id: item,
        });
      });
      this.swapOption[0].disabled = true;
      this.swapSelected = [this.swapOption[0]];
    }
    this.memorySelectData.emit({ allData: this.swapOption, newData: this.swapSelected, type: 3 });

  }
  public initUsageData() {
    this.initUsageTypeOption(this.resUsageData.key);
    this.setUsageData();
  }
  public initPagData() {
    this.initPagOption(this.resPagData.key);
    this.setPagData();
  }
  public initSwapData() {
    this.initSwapOption(this.resSwapData.key);
    this.setSwapData();
  }
  public setUsageData() {
    this.usageData = {};
    const usagEcharteData: any = [];
    this.usagEcharteData = [];
    this.usageTypeSelected.forEach((element: any) => {
      const option: any = {
        spec: [],
        key: [...[element]],
        data: this.resUsageData.origin_data,
        title: 'Memory Usage',
        type: 'Memory Usage',
      };
      usagEcharteData.push(option);
    });
    this.usagEcharteData = usagEcharteData;
  }
  public setPagData() {
    this.pagData = {};
    const pageEcharteData: any = [];
    this.pageEcharteData = [];
    this.pagSelected.forEach((element: any) => {
      const option: any = {
        spec: [],
        key: [...[element]],
        data: this.resPagData.origin_data,
        title: 'Pagination',
        type: 'pag', // 生成单位的时候需要用到
      };
      pageEcharteData.push(option);
    });
    this.pageEcharteData = pageEcharteData;
  }
  public setSwapData() {
    this.swapData = {};
    const swapEcharteData: any = [];
    this.swapEcharteData = [];
    this.swapSelected.forEach((element: any) => {
      const option: any = {
        spec: [],
        key: [...[element]],
        data: this.resSwapData.origin_data,
        title: 'Swap partition',
        type: 'memswap', // 生成单位的时候需要用到
        suggestion: this.resSwapData.suggestion,
      };
      swapEcharteData.push(option);
    });
    this.swapEcharteData = swapEcharteData;
  }
  public InitializationData() {
    this.memorySelectData.emit({
      allData: this.usageTypeOption, newData: this.usageTypeSelected,
      type: 1, memoryUtilization: this.memoryUtilization, Pagination: this.Pagination, exchange: this.exchange
    });
    this.memorySelectData.emit({ allData: this.pagOption, newData: this.pagSelected, type: 2 });
    this.memorySelectData.emit({ allData: this.swapOption, newData: this.swapSelected, type: 3 });
  }
  // 筛选数据
  public upDataTimeLine(data: any) {
    if (this.memoryUtilization) {
      this.usage.upDateTimeLine(data);
    }
    if (this.Pagination) {
      this.pag.upDateTimeLine(data);
    }
    if (this.exchange) {
      this.swap.upDateTimeLine(data);
    }
  }
  // 时间轴传过来的数据
  public dataZoom(e: any) {
    this.ZoomData.emit(e);
  }
  public echartsInstOut(e: any) {
    this.memoryEchartsInstOut.emit(e);
  }
}
