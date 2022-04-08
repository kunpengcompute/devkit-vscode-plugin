import { Component, OnInit, Input, ViewChild, AfterViewInit, Output, EventEmitter, } from '@angular/core';
import { AxiosService } from 'projects/sys/src-web/app/service/axios.service';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import { MytipService } from 'projects/sys/src-web/app/service/mytip.service';
@Component({
  selector: 'app-sys-disk',
  templateUrl: './sys-disk.component.html',
  styleUrls: ['./sys-disk.component.scss']
})
export class SysDiskComponent implements OnInit, AfterViewInit {
  constructor(public Axios: AxiosService, public i18nService: I18nService, public mytip: MytipService) {
    this.i18n = this.i18nService.I18n();
  }
  @Input() taskid: any;
  @Input() nodeid: any;
  @Input() timeLine: any;
  @Output() public diskSelectData = new EventEmitter<any>();
  @Output() public ZoomData = new EventEmitter<any>();
  @Output() public diskEchartsInstOut = new EventEmitter<any>();
  public i18n: any;
  @ViewChild('disk') disk: any;

  public devOption: any = [

  ];
  public devSelected: any[][] = [];
  public initSelected: any[];
  public typeSelected: any;

  public typeOption: any = [

  ];

  public diskData: object;  // 存储echarts需要的数据
  public diskEchartData: any = [];  // 存储echarts需要的数据
  public resData: any;
  public diskShow = true; // 块设备是否展示
  public diskLoading = false;

  ngOnInit() {
  }



  ngAfterViewInit() {
    this.getData();
  }
  public devChange(e: any) {
    this.diskShow = e.show;
    if (!e.show || !e.change) {    // 如果不展示平均负载 筛选没有变化 直接结束
      return;
    }
    this.devSelected = e.data;
    this.setDiskData();
    this.devOption.forEach((item: any) => {
      if (this.devSelected[0].length === 1) {
        if (item.id === this.devSelected[0][0].id) {
          item.disabled = true;
        }
      } else {
        item.disabled = false;
      }
    });
    if (this.devSelected.length !== 0 && this.typeSelected.length !== 0) {
      setTimeout(() => {
        this.disk.initTable();
      }, 0);
    }
  }

  public typeChange(e: any) {
    this.diskShow = e.show;
    if (!e.show || !e.change) {    // 如果不展示平均负载 筛选没有变化 直接结束
      return;
    }
    this.typeSelected = e.data;
    this.setDiskData();
    this.typeOption.forEach((item: any) => {
      if (this.typeSelected.length === 1) {
        if (item.id === this.typeSelected[0].id) {
          item.disabled = true;
        }
      } else {
        item.disabled = false;
      }
    });

    if (this.typeSelected.length !== 0 && this.devSelected.length !== 0) {
      setTimeout(() => {
        this.disk.initTable();
      }, 0);
    }
  }

  public async getData() {
    const params = {
      'node-id': this.nodeid,
      'query-type': 'detail',
      'query-target': 'disk_usage'      // 例如cpu_usage, cpu_avgload, mem_usage等
    };
    try {
      this.diskLoading = true;
      const res = await this.Axios.axios.get(`/tasks/${encodeURIComponent(this.taskid)}/sys-performance/`,
        {
          params, headers: {
            showLoading: false,
          },
        });
      this.resData = res.data;
      this.diskSelectData.emit({ allData: this.resData, newData: this.devSelected, type: 3 });
      this.initDatas();
    }
    catch {
      this.diskLoading = false;
    }

  }

  public initDatas() {
    this.initDevOption(this.resData.disk_usage.name[this.resData.key[0]].name);
    this.initTypeOption(this.resData.key);
    if (this.resData.origin_data.values !== null) {
      Object.keys(this.resData.origin_data.values).forEach(key => {
        Object.keys(this.resData.origin_data.values[key]).forEach(key2 => {
          if (key2 === 'util') {
            this.resData.origin_data.values[key][key2] =
              this.resData.origin_data.values[key][key2].map((item: any) => item * 100);
          }
        });
      });
    }
    this.setDiskData();
  }
  public initDevOption(data: any) {
    this.devOption = [];
    this.initSelected = [];
    this.devSelected[0] = [];
    if (data.length > 0) {
      data.forEach((item: any) => {
        this.devOption.push({
          label: item,
          id: item
        });
      });
      this.devOption.forEach((item: any, index: number) => {
        if (index < 5) {
          this.initSelected.push(item);
          this.devSelected[0].push(item);
        }
      });
    }
    this.diskSelectData.emit({ allData: this.devOption, newData: this.initSelected, type: 1, diskShow: this.diskShow });
  }

  public initTypeOption(data: any) {
    this.typeOption = [];
    if (data.length > 0) {
      data.forEach((item: any) => {
        this.typeOption.push({
          label: item,
          id: item
        });
      });
      this.typeOption[0].disabled = true;
      this.typeSelected = [this.typeOption[0]];
    }
    this.diskSelectData.emit({ allData: this.typeOption, newData: this.typeSelected, type: 2 });

  }
  public setDiskData() {
    this.diskData = {};
    const diskEchartData: any = [];
    this.diskEchartData = [];
    this.typeSelected.forEach((element: any, index: number) => {
      const option = {
        spec: [...this.devSelected[index]],
        key: [...[element]],
        data: this.resData.origin_data,
        title: 'CPU Usage',
        type: 'disk'
      };
      diskEchartData.push(option);
    });

    this.diskEchartData = diskEchartData;
  }
  public InitializationData() {
    this.diskSelectData.emit({ allData: this.devOption, newData: this.initSelected, type: 1, diskShow: this.diskShow });
    this.diskSelectData.emit({ allData: this.typeOption, newData: this.typeSelected, type: 2 });
  }
  // 时间轴筛选
  public upDataTimeLine(data: any) {
    if (this.diskShow) {
      this.disk.upDateTimeLine(data);
    }
  }

  // 数据筛选 更新时间轴
  public dataZoom(e: any) {
    this.ZoomData.emit(e);
  }
  public echartsInstOut(e: any) {
    this.diskEchartsInstOut.emit(e);
  }

}
