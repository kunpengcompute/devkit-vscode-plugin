import { Component, OnInit, Input, ViewChild, AfterViewInit, Output, EventEmitter, } from '@angular/core';
import { AxiosService } from 'projects/sys/src-web/app/service/axios.service';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import { MytipService } from 'projects/sys/src-web/app/service/mytip.service';
@Component({
  selector: 'app-sys-net',
  templateUrl: './sys-net.component.html',
  styleUrls: ['./sys-net.component.scss']
})
export class SysNetComponent implements OnInit, AfterViewInit {
  @Input() taskid: any;
  @Input() nodeid: any;
  @Input() timeLine: any;
  @ViewChild('netOk') netOk: any;
  @ViewChild('netError') netError: any;
  @Output() public networkSelectData = new EventEmitter<any>();
  @Output() public ZoomData = new EventEmitter<any>();
  @Output() public netEchartsInstOut = new EventEmitter<any>();

  public okIfaceOption: any = [

  ];
  public errorIfaceOption: any = [

  ];
  public okIfaceSelected: any;
  public okTypeSelected: any;
  public errorIfaceSelected: any;
  public errorTypeSelected: any;
  public okTypeOption: any = [

  ];
  public errorTypeOption: any = [

  ];
  public okData: object;  // 存储echarts需要的数据
  public errorData: object;
  public okEchartsData: any = [];  // 存储echarts需要的数据
  public errorEchartsData: any = [];


  public resData: any;
  public resErrorData: any;
  public i18n: any;
  public transmission = true; // 接口传输数据量统计是否展示
  public malfunction = false; // 接口故障统计是否展示
  public okLoading = false;
  public errorLoading = true;
  constructor(public Axios: AxiosService, public i18nService: I18nService, public mytip: MytipService) {
    this.i18n = this.i18nService.I18n();
  }

  ngOnInit() { }

  ngAfterViewInit() {
    this.getData();
  }
  public okIfaceChange(e: any) {
    this.transmission = e.show;
    if (!e.show || !e.change) {    // 如果不展示接口传输数据量统计 筛选没有变化 直接结束
      return;
    }
    this.okIfaceSelected = e.data;
    this.setOkData();
    this.okIfaceOption.forEach((item: any) => {
      if (this.okIfaceSelected.length === 1) {
        if (item.id === this.okIfaceSelected[0].id) {
          item.disabled = true;
        }
      } else {
        item.disabled = false;
      }
    });
    if (this.okIfaceSelected.length !== 0 && this.okTypeSelected.length !== 0) {
      setTimeout(() => {
        this.netOk.initTable();
      }, 0);
    }
  }
  public errorIfaceChange(e: any) {
    this.malfunction = e.show;
    if (!e.show || !e.change) {    // 如果不展示接口故障统计 筛选没有变化 直接结束
      return;
    }
    this.errorIfaceSelected = e.data;
    this.setErrorData();
    this.errorIfaceOption.forEach((item: any) => {
      if (this.errorIfaceSelected.length === 1) {
        if (item.id === this.errorIfaceSelected[0].id) {
          item.disabled = true;
        }
      } else {
        item.disabled = false;
      }
    });
    if (this.errorIfaceSelected.length !== 0 && this.errorTypeSelected.length !== 0) {
      setTimeout(() => {
        this.netError.initTable();
      }, 0);
    }
  }
  public okTypeChange(e: any) {
    this.transmission = e.show;
    if (!e.show || !e.change) {    // 如果不展示接口传输数据量统计 筛选没有变化 直接结束
      return;
    }
    this.okTypeSelected = e.data;
    this.setOkData();

    this.okTypeOption.forEach((item: any) => {
      if (this.okTypeSelected.length === 1) {
        if (item.id === this.okTypeSelected[0].id) {
          item.disabled = true;
        }
      } else {
        item.disabled = false;
      }
    });

    if (this.okTypeSelected.length !== 0 && this.okIfaceSelected.length !== 0) {
      setTimeout(() => {
        this.netOk.initTable();
      }, 0);
    }
  }
  public errorTypeChange(e: any) {
    this.malfunction = e.show;
    if (!e.show || !e.change) {    // 如果不展示接口故障统计 筛选没有变化 直接结束
      return;
    }
    this.errorTypeSelected = e.data;
    this.setErrorData();
    this.errorTypeOption.forEach((item: any) => {
      if (this.errorTypeSelected.length === 1) {
        if (item.id === this.errorTypeSelected[0].id) {
          item.disabled = true;
        }
      } else {
        item.disabled = false;
      }
    });

    if (this.errorTypeSelected.length !== 0 && this.errorIfaceSelected.length !== 0) {
      setTimeout(() => {
        this.netError.initTable();
      }, 0);
      setTimeout(() => {
        const dom = window.document.getElementsByClassName('cpu-usage');
        // dom[dom.length-1].scrollIntoView()
      }, 200);
    }
  }

  public async getData() {
    const params = {
      'node-id': this.nodeid,
      'query-type': 'detail',
      'query-target': 'net_info'      // 例如cpu_usage, cpu_avgload, mem_usage等
    };
    try {
      this.okLoading = true;
      const res = await this.Axios.axios.get(`/tasks/${encodeURIComponent(this.taskid)}/sys-performance/`,
        {
          params, headers: {
            showLoading: false,
          },
        });
      this.resData = res.data;
      this.networkSelectData.emit({ allData: this.resData, type: 5 });
      this.initDatas();
    }
    finally {
      this.okLoading = false;
    }

    try {
      this.errorLoading = true;
      params['query-target'] = 'net_error_info';
      const average = await this.Axios.axios.get(`/tasks/${encodeURIComponent(this.taskid)}/sys-performance/`,
        {
          params, headers: {
            showLoading: false,
          },
        });
      this.resErrorData = average.data;
      this.networkSelectData.emit({ allData: this.resErrorData, type: 6 });
      this.initError();
    }
    finally {
      this.errorLoading = false;
    }
  }
  public initError() {
    this.initErrorIfaceOption(this.resErrorData.net_error_info.name[this.resErrorData.key[0]].name);
    this.initErrorTypeOption(this.resErrorData.key);


    this.setErrorData();
  }
  public initDatas() {
    this.initOkIfaceOption(this.resData.net_info.name[this.resData.key[0]].name);
    this.initOkTypeOption(this.resData.key);

    this.setOkData();
  }
  public initOkIfaceOption(data: any) {
    this.okIfaceOption = [];
    this.okIfaceSelected = [];
    if (data.length > 0) {
      data.forEach((item: any) => {
        this.okIfaceOption.push({
          label: item,
          id: item
        });
      });
      this.okIfaceOption.forEach((item: any, index: number) => {
        if (index < 5) {
          this.okIfaceSelected.push(item);
        }
      });
    }
    this.networkSelectData.emit({
      allData: this.okIfaceOption, newData: this.okIfaceSelected,
      type: 1, transmission: this.transmission, malfunction: this.malfunction
    });
  }
  public initErrorIfaceOption(data: any) {
    this.errorIfaceOption = [];
    this.errorIfaceSelected = [];
    if (data.length > 0) {
      data.forEach((item: any) => {
        this.errorIfaceOption.push({
          label: item,
          id: item
        });
      });
      this.errorIfaceOption.forEach((item: any, index: number) => {
        if (index < 5) {
          this.errorIfaceSelected.push(item);
        }
      });
    }
    this.networkSelectData.emit({ allData: this.errorIfaceOption, newData: this.errorIfaceSelected, type: 3 });
  }
  public initErrorTypeOption(data: any) {
    this.errorTypeOption = [];
    if (data.length > 0) {
      data.forEach((item: any) => {
        this.errorTypeOption.push({
          label: item,
          id: item
        });
      });
      this.errorTypeOption[0].disabled = true;
      this.errorTypeSelected = [this.errorTypeOption[0]];
    }
    this.networkSelectData.emit({ allData: this.errorTypeOption, newData: this.errorTypeSelected, type: 4 });

  }
  public initOkTypeOption(data: any) {
    this.okTypeOption = [];
    if (data.length > 0) {
      data.forEach((item: any) => {
        this.okTypeOption.push({
          label: item,
          id: item
        });
      });
      this.okTypeOption[0].disabled = true;
      this.okTypeSelected = [this.okTypeOption[0]];
    }
    this.networkSelectData.emit({ allData: this.okTypeOption, newData: this.okTypeSelected, type: 2 });
  }
  public setOkData() {
    this.okData = {};
    const okEchartsData: any = [];
    this.okEchartsData = [];
    this.okTypeSelected.forEach((element: any) => {
      const option = {
        spec: [...this.okIfaceSelected],
        key: [...[element]],
        data: this.resData.origin_data,
        title: 'Internet Information',
        type: 'netOk'
      };
      okEchartsData.push(option);
    });
    this.okEchartsData = okEchartsData;
  }
  public setErrorData() {
    this.errorData = {};
    this.errorEchartsData = [];
    const errorEchartsData: any = [];
    this.errorTypeSelected.forEach((element: any) => {
      const option = {
        spec: [...this.errorIfaceSelected],
        key: [...[element]],
        data: this.resErrorData.origin_data,
        title: 'Network device failure(error)',
        type: 'netError'
      };
      errorEchartsData.push(option);
    });
    this.errorEchartsData = errorEchartsData;
  }
  public InitializationData() {
    this.networkSelectData.emit({
      allData: this.okIfaceOption, newData: this.okIfaceSelected,
      type: 1, transmission: this.transmission, malfunction: this.malfunction
    });
    this.networkSelectData.emit({ allData: this.okTypeOption, newData: this.okTypeSelected, type: 2 });
    this.networkSelectData.emit({ allData: this.errorIfaceOption, newData: this.errorIfaceSelected, type: 3 });
    this.networkSelectData.emit({ allData: this.errorTypeOption, newData: this.errorTypeSelected, type: 4 });
  }
  //
  public upDataTimeLine(data: any) {
    if (this.transmission) {
      this.netOk.upDateTimeLine(data);
    }
    if (this.malfunction) {
      this.netError.upDateTimeLine(data);
    }
  }

  // 数据筛选 更新时间轴
  public dataZoom(e: any) {
    this.ZoomData.emit(e);
  }
  public echartsInstOut(e: any) {
    this.netEchartsInstOut.emit(e);
  }

}
