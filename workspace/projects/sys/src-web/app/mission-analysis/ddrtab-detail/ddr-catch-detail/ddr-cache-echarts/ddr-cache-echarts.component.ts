import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { AxiosService } from 'projects/sys/src-web/app/service/axios.service';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import { RespTlbData, RespCpu } from '../doman';

@Component({
  selector: 'app-ddr-cache-echarts',
  templateUrl: './ddr-cache-echarts.component.html',
  styleUrls: ['./ddr-cache-echarts.component.scss']
})
export class DdrCacheEchartsComponent implements OnInit {

  @ViewChild('tlbEcharts') tlbEcharts: any;
  @ViewChild('l3cEcharts') l3cEcharts: any;
  @ViewChild('timeLineDetail') timeLineDetail: any;

  @Input() nodeId: any;
  @Input() taskId: any;
  @Input() cpu: number;
  @Input() tlbFilterTableData: RespTlbData[];

  public i18n: any;
  public typeTips: { [key: string]: string } = {};
  public currSelectedCpuList: string[];

  public obtainingL1cL2cTlbData = true;
  public obtainingL3cData = true;
  public cpu1616 = RespCpu.CPU1616;

  public tlbData: object;  // 存储echarts需要的数据
  public respTlbEchartsData: any;
  public tlbCPUOption: any[] = [];
  public tlbCPUSelected: any;
  public tlbTypeOption: any[] = [];
  public tlbTypeSelected: any;

  public l3cData: object;
  public respL3cEchartsData: any;
  public l3cNodeOption: any[] = [];
  public l3cNodeSelected: any;
  public l3cTypeOption: any[] = [];
  public l3cTypeSelected: any;

  public timeData: any = []; // 时间轴数据
  public timeLine = {  // 时间轴开始结束时间
    start: 0,
    end: 100
  };

  constructor(
    public axiosService: AxiosService,
    public i18nService: I18nService
  ) {
    this.i18n = this.i18nService.I18n();
    this.typeTips = {
      L1D: this.i18n.ddr.select.L1D,
      L1I: this.i18n.ddr.select.L1I,
      L2D: this.i18n.ddr.select.L2D,
      L2I: this.i18n.ddr.select.L2I,
      L2_TLB: this.i18n.ddr.select.L2_TLB,
      L2D_TLB: this.i18n.ddr.select.L2D_TLB,
      L2I_TLB: this.i18n.ddr.select.L2I_TLB,

      L3C_RD_IN: this.i18n.ddr.select.L3C_RD_IN,
      L3C_WR_IN: this.i18n.ddr.select.L3C_WR_IN,
      L3C_RD_OUT: this.i18n.ddr.select.L3C_RD_OUT,
      L3C_WR_OUT: this.i18n.ddr.select.L3C_WR_OUT,

      L3C_RD: this.i18n.ddr.select.L3C_RD,
      L3C_WR: this.i18n.ddr.select.L3C_WR,

      DR_RD: this.i18n.ddr.select.DR_RD,
      DDR_WR: this.i18n.ddr.select.DDR_WR,
    };
  }

  async ngOnInit() {
    if (this.cpu !== RespCpu.CPU1616){
      await this.getL3cData();
      this.initL3cEcharts();
    }
  }

  public async onFilterCpu(selectedCpuList: string[]) {
    if (!this.currSelectedCpuList) {
      // 初始化的时候currSelectedCpuList为undefined
      this.currSelectedCpuList = selectedCpuList;
      await this.getTlbData();
      this.initTlbEcharts();
    } else {
      // 更新的时候有些初始化的方法不需要执行
      this.currSelectedCpuList = selectedCpuList;
      await this.getTlbData();
      this.initTlbCPUOption(this.respTlbEchartsData.core);
      this.tlbCPUChange();
    }
  }

  private async getTlbData() {
    const params = {
      'node-id': this.nodeId,
      'query-type': 'detail',
      'query-target': 'l1c_l2c',
      'query-cpu-list': this.currSelectedCpuList.join(',')
    };
    const res = await this.axiosService.axios.get(`/tasks/${encodeURIComponent(this.taskId)}/mem-access-analysis/`, {
      params,
      headers: { showLoading: false }
    });
    this.respTlbEchartsData = res.data.mem_access.data.l1c_l2c_tlb_count;
    this.obtainingL1cL2cTlbData = false;
  }

  public initTlbEcharts() {
    if (this.respTlbEchartsData.origin_data.time.length > 0) {
      this.initTlbCPUOption(this.respTlbEchartsData.core);
      this.initTlbTypeOption(this.respTlbEchartsData.type);
      this.setTlbData();
    }
  }

  public initTlbCPUOption(data: any) {
    this.tlbCPUOption = [];
    if (data.length > 0) {
      data.forEach((item: any) => {
        this.tlbCPUOption.push({
          label: item,
          id: item
        });
      });
      this.tlbCPUSelected = [...this.tlbCPUOption];
    }
  }

  public initTlbTypeOption(data: any) {
    this.tlbTypeOption = [];
    if (data.length > 0) {
      data.forEach((item: any) => {
        this.tlbTypeOption.push({
          label: item,
          id: item,
          tips: this.typeTips[item]
        });
      });
      this.tlbTypeOption[0].disabled = true;
      this.tlbTypeSelected = [this.tlbTypeOption.find(item => item.label === 'L1D')];

    }
  }

  public setTlbData() {
    this.tlbData = {};
    const option = {
      spec: this.tlbTypeSelected,
      die: this.tlbCPUSelected,
      key: ['bandwith', 'hitrate'],
      data: this.respTlbEchartsData.origin_data,
      title: 'Internet Information',
      type: 'catchl1'
    };
    this.tlbData = option;
    const data: any = [];
    option.data.time.forEach((item: any) => {
      data.push(item.toFixed(3) + 's');
    });
    this.timeData = data;
  }

  public async getL3cData() {
    const params = {
      'node-id': this.nodeId,
      'query-type': 'detail',
      'query-target': 'l3c',
    };
    const l3cres = await this.axiosService.axios.get(`/tasks/${encodeURIComponent(this.taskId)}/mem-access-analysis/`, {
      params,
      headers: { showLoading: false }
    });
    this.respL3cEchartsData = l3cres.data.mem_access.data.l3c;
    this.obtainingL3cData = false;
  }

  public initL3cEcharts() {
    if (this.respL3cEchartsData.origin_data.time.length > 0) {
      this.initL3cNodeOption(this.respL3cEchartsData['NUMA node']);
      this.initL3cTypeOption(this.respL3cEchartsData.type);
      this.setL3cData();
    }
  }

  public initL3cNodeOption(data: any) {
    this.l3cNodeOption = [];
    if (data.length > 0) {
      data.forEach((item: any) => {
        this.l3cNodeOption.push({
          label: item,
          id: item
        });
      });
      this.l3cNodeOption[0].disabled = true;
      this.l3cNodeSelected = [this.l3cNodeOption[0]];
    }
  }

  public initL3cTypeOption(data: any) {
    this.l3cTypeOption = [];
    if (data.length > 0) {
      data.forEach((item: any) => {
        this.l3cTypeOption.push({
          label: item,
          id: item,
          tips: this.typeTips[item],
          disabled: false,
          englishname: this.typeTips[item],
          code: this.typeTips[item],
        });
      });
      this.l3cTypeOption[0].disabled = true;
      this.l3cTypeSelected = [this.l3cTypeOption[0]];
    }
  }

  public setL3cData() {
    this.l3cData = {};
    const option = {
      spec: this.l3cTypeSelected,
      die: this.l3cNodeSelected,
      key: ['hitbandwith', 'bandwith', 'hitrate'],
      data: this.respL3cEchartsData.origin_data,
      title: 'Network device failure(error)',
      type: 'catchl2'
    };
    const data: any = [];
    option.data.time.forEach((item: any) => {
      data.push(item.toFixed(3) + 's');
    });
    this.l3cData = option;
  }

  public l3cNodeChange() {
    this.setL3cData();
    this.l3cNodeOption.forEach((item: any) => {
      if (this.l3cNodeSelected.length === 1) {
        if (item.id === this.l3cNodeSelected[0]?.id) {
          item.disabled = true;
        }
      } else {
        item.disabled = false;
      }
    });
    if (this.l3cNodeSelected.length !== 0 && this.l3cTypeSelected.length !== 0) {
      setTimeout(() => {
        this.l3cEcharts.initTable();
      }, 0);
    }
  }

  public l3cTypeChange() {
    this.setL3cData();
    this.l3cTypeOption.forEach((item: any) => {
      if (this.l3cTypeSelected.length === 1) {
        if (item.id === this.l3cTypeSelected[0]?.id) {
          item.disabled = true;
        }
      } else {
        item.disabled = false;
      }
    });

    if (this.l3cTypeSelected.length !== 0 && this.l3cNodeSelected.length !== 0) {
      setTimeout(() => {
        this.l3cEcharts.initTable();
      }, 0);
      setTimeout(() => {
        const dom = window.document.getElementsByClassName('cpu-usage');
      }, 200);
    }
  }

  public tlbCPUChange() {
    this.setTlbData();
    this.tlbCPUOption.forEach((item: any) => {
      if (this.tlbCPUSelected.length === 1) {
        if (item.id === this.tlbCPUSelected[0]?.id) {
          item.disabled = true;
        }
      } else {
        item.disabled = false;
      }
    });
    if (this.tlbCPUSelected.length !== 0 && this.tlbTypeSelected.length !== 0) {
      setTimeout(() => {
        this.tlbEcharts.initTable();
      }, 0);
    }
  }

  public tlbTypeChange() {
    this.setTlbData();
    this.tlbTypeOption.forEach((item: any) => {
      if (this.tlbTypeSelected.length === 1) {
        if (item.id === this.tlbTypeSelected[0]?.id) {
          item.disabled = true;
        }
      } else {
        item.disabled = false;
      }
    });

    if (this.tlbTypeSelected.length !== 0 && this.tlbCPUSelected.length !== 0) {
      setTimeout(() => {
        this.tlbEcharts.initTable();
      }, 0);
    }
  }

  // 时间轴变化
  public timeLineData(e: any) {
    this.timeLine = e;
    this.tlbEcharts.upDateTimeLine(e);
    this.l3cEcharts.upDateTimeLine(e);
  }

  // 数据筛选 传过来的开始结束比例
  public dataZoom(e: any) {
    this.timeLineDetail.dataConfig(e);
    this.timeLineData(e);
  }

}
