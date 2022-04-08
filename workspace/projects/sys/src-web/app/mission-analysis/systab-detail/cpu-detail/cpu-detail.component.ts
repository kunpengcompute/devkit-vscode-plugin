import { Component, OnInit, Input, Output, EventEmitter, AfterViewInit, ViewChild } from '@angular/core';
import { debug } from 'console';
import { AxiosService } from 'projects/sys/src-web/app/service/axios.service';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import { MytipService } from 'projects/sys/src-web/app/service/mytip.service';
@Component({
  selector: 'app-cpu-detail',
  templateUrl: './cpu-detail.component.html',
  styleUrls: ['./cpu-detail.component.scss']
})
export class CpuDetailComponent implements OnInit, AfterViewInit {
  @Input() taskid: any;
  @Input() nodeid: any;
  @Input() timeLine: any;
  @ViewChild('cpuUsage') cpuUsage: any;
  @ViewChild('cpuAverage') cpuAverage: any;
  @Output() public cpuAverageData = new EventEmitter<any>();
  @Output() public ZoomData = new EventEmitter<any>();
  @Output() public cpuEchartsInstOut = new EventEmitter<any>();
  public index = 0;
  public butValue: any = [];
  public checkzhibiao: any = [];
  public cpu = 'cpu';
  public numaList: any;
  public cpuNumsOption: any = [

  ];
  public numaOption: any = [

  ];
  public cpuNumSelected: any = [];
  public cpuTypeSelected: any;
  public cpuTypeSelected2: any;
  public numaSelected: any;
  public cpuTypeOption: any = [

  ];
  public cpuTypeOption2: any = [

  ];
  public cpuData: object;  // 存储echarts需要的数据
  public averageData: object;
  public orignData: any;
  public averageOrignData: any;
  public resData: any;
  public resAverageData: any;
  public i18n: any;
  public averageShow = true; // 平均负载是否展示
  public UtilizationShow = true; // cpu利用率是否展示
  public cpuEchartData: any = [];  // cpu利用率 循环数据
  public averageEchartData: any = [];  // cpu利用率 循环数据
  public avgloadLoading = true;
  public usageLoading = false;
  constructor(public Axios: AxiosService, public i18nService: I18nService, public mytip: MytipService) {
    this.i18n = this.i18nService.I18n();
  }

  ngOnInit() {
  }
  ngAfterViewInit() {
    this.getData();
  }

  public selectHeight() {
    if (this.numaSelected.length === 1) {
      $('#myselect1').addClass('select');
    } else {
      $('#myselect1').removeClass('select');
    }
    if (this.cpuNumSelected.length === 1) {
      $('#myselect2').addClass('select');
    } else {
      $('#myselect2').removeClass('select');
    }
    if (this.cpuTypeSelected.length === 1) {
      $('#myselect3').addClass('select');
    } else {
      $('#myselect3').removeClass('select');
    }
  }

  public numaChange(e: any) {
    this.selectHeight();
    this.numaOption.forEach((item: any) => {
      if (this.numaSelected.length === 1) {
        if (item.id === this.numaSelected[0].id) {
          item.disabled = true;
        }
      } else {
        item.disabled = false;
      }
    });
    if (this.numaSelected.length !== 0) {
      const cpuSelectedIdList: any = [];
      this.numaSelected.forEach((item: any) => {
        cpuSelectedIdList.push(...this.numaList[item.id]);
      });
      this.initCpuNumOption(cpuSelectedIdList);
      this.setCpuData();
      setTimeout(() => {
        this.cpuUsage.initTable();
      }, 0);
    }
  }
  public cpuNumChange(e: any) {
    this.UtilizationShow = e.show;
    if (!e.show) {    // 如果不展示平均负载 直接结束
      return;
    }
    if (!e.change) {  // 如果筛选没有变化 直接结束
      return;
    }
    this.cpuNumSelected = e.data;
    this.selectHeight();
    this.setCpuData();
    if (this.cpuNumSelected.length !== 0 && this.cpuTypeSelected.length !== 0) {
      setTimeout(() => {
        this.cpuUsage.initTable();
      }, 0);
    }
  }

  public cpuTypeChange(e: any) {
    this.UtilizationShow = e.show;
    if (!e.show) {    // 如果不展示平均负载 直接结束
      return;
    }
    if (!e.change) {  // 如果筛选没有变化 直接结束
      return;
    }
    this.selectHeight();
    this.cpuTypeSelected = e.data;
    this.checkzhibiao = e.data;
    this.setCpuData();
    this.cpuTypeOption.forEach((item: any) => {
      if (this.cpuTypeSelected.length === 1) {
        if (item.id === this.cpuTypeSelected[0].id) {
          item.disabled = true;
        }
      } else {
        item.disabled = false;
      }
    });
    if (this.cpuTypeSelected.length !== 0 && this.cpuNumSelected.length !== 0) {
      setTimeout(() => {
        this.cpuUsage.initTable();
      }, 0);
    }
    if (this.numaSelected.length !== 0) {
      const cpuSelectedIdList: any = [];
      this.numaSelected.forEach((item: any) => {
        cpuSelectedIdList.push(...this.numaList[item.id]);
      });
      this.initCpuNumOption(cpuSelectedIdList);
      this.setCpuData();
      setTimeout(() => {
        this.cpuUsage.initTable();
      }, 0);
    }
  }
  public cpuTypeChange2(e: any) {
    this.averageShow = e.show;
    if (!e.show) {    // 如果不展示平均负载 直接结束
      return;
    }
    if (!e.change) {  // 如果筛选没有变化 直接结束
      return;
    }
    this.cpuTypeSelected2 = JSON.parse(JSON.stringify(e.data));
    this.setAverageData();
    this.cpuTypeOption2.forEach((item: any) => {
      if (this.cpuTypeSelected2.length === 1) {
        if (item.id === this.cpuTypeSelected2[0].id) {
          item.disabled = true;
        }
      } else {
        item.disabled = false;
      }
    });

    if (this.cpuTypeSelected2.length !== 0) {
      setTimeout(() => {
        this.cpuAverage.initTable();
      }, 0);
      setTimeout(() => {
        const dom = window.document.getElementsByClassName('cpu-usage');
      }, 200);
    }
  }
  public async getData() {
    const params = {
      'node-id': this.nodeid,
      'query-type': 'detail',
      'query-target': 'cpu_usage'      // 例如cpu_usage, cpu_avgload, mem_usage等
    };
    try {
      this.usageLoading = true;
      const res = await this.Axios.axios.get(`/tasks/${encodeURIComponent(this.taskid)}/sys-performance/`,
        {
          params, headers: {
            showLoading: false,
          },
        });
      this.resData = res.data;
      this.initDatas();
    }
    catch {
      this.usageLoading = false;
    }

    try {
      this.avgloadLoading = true;
      params['query-target'] = 'cpu_avgload';
      const average = await this.Axios.axios.get(`/tasks/${encodeURIComponent(this.taskid)}/sys-performance/`,
        {
          params, headers: {
            showLoading: false,
          },
        });
      this.resAverageData = average.data;
      this.initAverage();
    }
    catch {
      this.avgloadLoading = false;
    }
  }
  public initAverage() {
    this.initCpuTypeOption2(this.resAverageData.key);
    this.averageOrignData = this.resAverageData.origin_data;
    this.cpuAverageData.emit({ timeData: this.averageOrignData.time, type: 4 });
    this.setAverageData();
  }
  public initDatas() {
    this.orignData = this.resData.origin_data;
    this.initCpuTypeOption(this.resData.key); // 第三个下拉框
    this.initNumaOption(this.resData.numa_info); // 第一个下拉框

    this.setCpuData();
  }
  public initNumaOption(data: any) {// 第一个下拉框
    this.numaList = data;
    const numaOptionkeys = Object.keys(data);
    numaOptionkeys.forEach(item => {
      this.numaOption.push({
        label: 'NUMA ' + item,
        id: item
      });
    });

    this.numaOption[0].disabled = true;
    this.numaSelected = this.numaOption;
    let arrData: any = [];
    this.numaSelected.forEach((element: any) => {
      arrData = arrData.concat(data[element.id]);
    });
    this.initCpuNumOption(arrData); // 对第二个下拉框
  }
  public isDisCpuNumOption(nums: any) {
    // 判断是否加disable
    let num = 0;
    this.orignData.values[nums]['%cpu'].forEach((val: string | number) => {
      if (val === 0 || val === '-') {
        num++;
      }
    });
    if (num === this.orignData.values[nums]['%cpu'].length) {
      return true;
    } else {
      return false;
    }
  }
  public initCpuNumOption(data: any) {
    const selectedCpuList = [...this.cpuNumSelected];   // 记录以前选中项
    this.cpuNumsOption = [];
    if (data.length > 0) {
      data.forEach((item: any) => {
        if (this.isDisCpuNumOption(item)) {
          this.cpuNumsOption.push({
            label: item + '-CPU',
            id: item,
            disabled: true
          });
        } else {
          this.cpuNumsOption.push({
            label: item + '-CPU',
            id: item
          });
        }
      });
      for (let i = 0; i < this.cpuNumsOption.length; i++) {
        if (!this.cpuNumsOption[i].disabled) {
          this.index = i;
          break;
        }
      }
      this.cpuNumSelected.length = 0;
      if (selectedCpuList.length > 0) {    // 如果以前有选中项
        selectedCpuList.forEach(item => {
          this.cpuNumsOption.forEach((cpuItem: any) => {
            if (item.id === cpuItem.id) {
              this.cpuNumSelected.push(cpuItem);
            }
          });
        });
      } else {
        if (this.cpuNumsOption.length > 4) {
          for (let i = 0; i < 5; i++) {
            this.cpuNumSelected.push(this.cpuNumsOption[this.resData.cpu_usage.name['%cpu'].name[i]]);
          }
        }
      }
      if (this.cpuNumSelected.length === 0) {                  // 如果没有选中项则默认选中列表第一个disable:false的
        this.cpuNumSelected = [this.cpuNumsOption[this.index]];
      }
      if (this.cpuNumSelected.length === 1) {              // 只有一个选中时要默认disabled
        this.cpuNumSelected[0].disabled = true;
      }
    }
    this.butValue = this.cpuNumsOption;
    this.cpuAverageData.emit({ allData: this.resData, newData: this.cpuNumSelected, type: 2 });
  }
  public initCpuTypeOption2(data: any) {
    this.cpuTypeOption2 = [];
    if (data.length > 0) {
      data.forEach((item: any) => {
        this.cpuTypeOption2.push({
          label: item,
          id: item
        });
      });
      this.cpuTypeOption2[0].disabled = true;
      this.cpuTypeSelected2 = [this.cpuTypeOption2[0]];
    }
    this.cpuAverageData.emit({ allData: this.cpuTypeOption2, newData: this.cpuTypeSelected2,
       type: 1, averageShow: this.averageShow, UtilizationShow: this.UtilizationShow });
  }
  public initCpuTypeOption(data: any) {// 第三个下拉框
    this.cpuTypeOption = [];
    if (data.length > 0) {
      data.forEach((item: any) => {
        this.cpuTypeOption.push({
          label: item,
          id: item
        });
      });
      this.cpuTypeOption[this.cpuTypeOption.length - 1].disabled = true;
      this.cpuTypeSelected = [this.cpuTypeOption[this.cpuTypeOption.length - 1]];
    }
    this.cpuAverageData.emit({ allData: this.cpuTypeOption, newData: this.cpuTypeSelected, type: 3 });
  }
  public setCpuData() {
    this.cpuData = {};
    this.cpuEchartData = [];
    const cpuEchartData: any = [];
    this.cpuTypeSelected.forEach((item: any) => {
      const option = {
        spec: [...this.cpuNumSelected],
        key: [...[item]],
        data: this.orignData,
        title: 'CPU Usage',
        type: 'cpu'
      };
      cpuEchartData.push(option);
    });
    this.cpuEchartData = cpuEchartData;
  }
  public setAverageData() {
    this.averageData = {};
    this.averageEchartData = [];
    const averageEchartData: any = [];
    this.cpuTypeSelected2.forEach((item: any) => {
      const option: any = {
        spec: [],
        key: [...[item]],
        data: this.averageOrignData,
        title: 'Average Load',
        type: 'cpuavg'
      };
      averageEchartData.push(option);
    });
    this.averageEchartData = averageEchartData;
  }
  public InitializationData() {
    this.cpuAverageData.emit({ allData: this.cpuTypeOption, newData: this.cpuTypeSelected, type: 3 });
    this.cpuAverageData.emit({ allData: this.cpuTypeOption2, newData: this.cpuTypeSelected2,
      type: 1, averageShow: this.averageShow, UtilizationShow: this.UtilizationShow });
    this.cpuAverageData.emit({ allData: this.resData, newData: this.cpuNumSelected, type: 2 });
  }
  // 时间轴筛选
  public upDataTimeLine(data: any) {
    if (this.averageShow) {
      this.cpuAverage.upDateTimeLine(data);
    }
    if (this.UtilizationShow) {
      this.cpuUsage.upDateTimeLine(data);
    }
  }

  // 数据筛选 更新时间轴
  public dataZoom(e: any) {
    this.ZoomData.emit(e);
  }
  public echartsInstOut(e: any) {
    this.cpuEchartsInstOut.emit(e);
  }
}
