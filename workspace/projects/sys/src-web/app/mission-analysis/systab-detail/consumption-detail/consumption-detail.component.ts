import { Component, OnInit, Input, ViewChild, AfterViewInit, Output, EventEmitter, } from '@angular/core';
import { AxiosService } from 'projects/sys/src-web/app/service/axios.service';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';

@Component({
  selector: 'app-consumption-detail',
  templateUrl: './consumption-detail.component.html',
  styleUrls: ['./consumption-detail.component.scss']
})
export class ConsumptionDetailComponent implements OnInit {

  constructor(public Axios: AxiosService, public i18nService: I18nService) {
    this.i18n = this.i18nService.I18n();
  }
  @Input() taskid: any;
  @Input() nodeid: any;
  @Input() timeLine: any;
  @Output() public ZoomData = new EventEmitter<any>();
  @Output() public consumptionEchartsInstOut = new EventEmitter<any>();
  @ViewChild('consumption') consumption: any;

  public consumptionEchartData: any = [];  // 存储echarts需要的数据
  public resData: any;
  public consumptionShow = true; // 能耗是否展示
  public i18n: any;
  public okLoading = false;

  ngOnInit() {
    this.getData();
  }

  // 获取数据
  public getData() {
    const params = {
      'node-id': this.nodeid,
      'query-type': 'detail',
      'query-target': 'cfg_sys_power'      // 例如cpu_usage, cpu_avgload, mem_usage等
    };

    this.okLoading = true;
    this.Axios.axios.get(`/tasks/${encodeURIComponent(this.taskid)}/sys-performance/`, {
      params, headers: {
        showLoading: false,
      },
    }).then((res: any) => {
      this.resData = res.data;
      const consumptionEchartData = [];
      const dataArr: any = {
        time: [],
        values: {},
      };
      dataArr.time = this.resData.origin_data.time;
      const objPower: any = {};
      const keyName = this.i18n.sys_summary.cpupackage_tabel.powerUnits;
      objPower[keyName] = this.resData.origin_data.values.power_val;
      const objAll: any = {};
      objAll[keyName] = this.resData.origin_data.values.avg_power;
      const valuesObj: any = {};
      valuesObj[this.i18n.sys_summary.cpupackage_tabel.power] = objPower;
      valuesObj.all = objAll;
      dataArr.time = this.resData.origin_data.time;
      dataArr.values = valuesObj;
      const key = [];
      const obj = {
        label: keyName,
        id: keyName,
        disabled: true
      };
      key.push(obj);
      const spec = [];
      const object = {
        label: this.i18n.sys_summary.cpupackage_tabel.power,
        id: this.i18n.sys_summary.cpupackage_tabel.power,
      };
      spec.push(object);
      const option = {
        spec,
        key,
        data: dataArr,
        title: 'CPU Usage',
        type: 'consumption'
      };
      consumptionEchartData.push(option);
      this.consumptionEchartData = consumptionEchartData;
    })
    .catch(() => {
      this.okLoading = false;
    });
  }

  // 时间轴筛选
  public upDataTimeLine(data: any) {
    if (this.consumptionShow) {
      this.consumption.upDateTimeLine(data);
    }
  }

  // 数据筛选 更新时间轴
  public dataZoom(e: any) {
    this.ZoomData.emit(e);
  }
  // 返回echarts实例 用于绑定echarts
  public echartsInstOut(e: any) {
    this.consumptionEchartsInstOut.emit(e);
  }

}
