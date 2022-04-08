import {
  Component, OnInit, Input, ViewChild
} from '@angular/core';
import { HttpService, I18nService } from 'sys/src-com/app/service';

@Component({
  selector: 'app-ddr-ddr-echarts',
  templateUrl: './ddr-ddr-echarts.component.html',
  styleUrls: ['./ddr-ddr-echarts.component.scss']
})
export class DdrDdrEchartsComponent implements OnInit {

  @ViewChild('bandwidthEcharts') bandwidthEcharts: any;
  @ViewChild('countEcharts') countEcharts: any;
  @ViewChild('timeLineDetail') timeLineDetail: any;

  @Input() nodeId: any;
  @Input() taskId: any;

  public obtainingBandwidthData = true;
  public obtainingTimesData = true;

  public bandwidthNodeOption: any = [];
  public bandwidthNodeSelected: any;
  public bandwidthTypeOption: any = [];
  public bandwidthTypeSelected: any;
  public ddrIdOption: any = [];
  public ddrIdSelected: any;

  public countNodeOption: any = [];
  public countNodeSelected: any;
  public countTypeOption: any = [];
  public countTypeSelected: any;

  public typeTips: any = {};

  public bandwidthEchartsData: any;
  public countEchartsData: any;

  public bandwidthData: any;
  public countData: any;

  public i18n: any;
  public hasDdrCount = false;
  public hasDdrid = true;

  public timeData: any = [];
  public timeLine = {
    start: 0,
    end: 100
  };

  constructor(
    public http: HttpService,
    public i18nService: I18nService,
  ) {
    this.i18n = this.i18nService.I18n();
  }

  ngOnInit(): void {
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

      DDR_RD: this.i18n.ddr.select.DDR_RD,
      DDR_WR: this.i18n.ddr.select.DDR_WR,
    };
    this.getData();
  }

  private async getDdrBandwidthData() {
    const params = {
      'node-id': this.nodeId,
      'query-type': 'detail',
      'query-target': 'ddr_bandwidth'
    };
    const res = await this.http.get(`/tasks/${encodeURIComponent(this.taskId)}/mem-access-analysis/`, {
      params,
      headers: {
        showLoading: false,
      }
    });
    return res?.data?.mem_access?.data?.ddrc_access_bandwidth;
  }

  private async getDdrCountData() {
    const params = {
      'node-id': this.nodeId,
      'query-type': 'detail',
      'query-target': 'ddr_count'
    };
    const res = await this.http.get(`/tasks/${encodeURIComponent(this.taskId)}/mem-access-analysis/`, {
      params,
      headers: {
        showLoading: false,
      }
    });
    return res?.data?.mem_access?.data?.ddrc_access_count;
  }

  private async getData() {
    try {
      const ddrAccessBandwidth = await this.getDdrBandwidthData();
      const ddrAccessCount = await this.getDdrCountData();

      this.bandwidthData = ddrAccessBandwidth;
      if (this.bandwidthData?.origin_data.time.length !== 0) {
        this.initAccessBandwidthData();
      }

      this.hasDdrCount = !!ddrAccessCount;
      this.countData = ddrAccessCount;
      if (this.countData?.origin_data.time.length !== 0) {
        this.initAccessCountData();
      }
    } finally {
      this.obtainingBandwidthData = false;
      this.obtainingTimesData = false;
    }
  }

  private initAccessBandwidthData() {
    if (this.bandwidthData.ddrid) {
      this.bandwidthData.ddrid = this.bandwidthData.ddrid.map((item: any) => item);
      this.initDDRIDOption(this.bandwidthData.ddrid);
    } else {
      this.hasDdrid = false;
    }

    this.initBandwidthNodeOption(this.bandwidthData['NUMA node']);
    this.initBandwidthTypeOption(this.bandwidthData.type);
    this.setBandwidthData();
  }

  public initDDRIDOption(data: any) {
    this.ddrIdOption = [];
    if (data.length > 0) {
      data.forEach((item: any) => {
        this.ddrIdOption.push({
          label: item,
          id: item,
          disabled: false,
        });
      });
      this.ddrIdOption[0].disabled = true;
      this.ddrIdSelected = [this.ddrIdOption[0]];
    }
  }

  private initBandwidthNodeOption(data: any) {
    this.bandwidthNodeOption = [];
    if (data.length > 0) {
      data.forEach((item: any) => {
        this.bandwidthNodeOption.push({
          label: item,
          id: item,
          disabled: false,
          englishname: item,
          code: item,
        });
      });
      this.bandwidthNodeOption[0].disabled = true;
      this.bandwidthNodeSelected = [this.bandwidthNodeOption[0]];
    }
  }

  private initBandwidthTypeOption(data: any) {
    this.bandwidthTypeOption = [];
    if (data.length > 0) {
      data.forEach((item: any) => {
        this.bandwidthTypeOption.push({
          label: item,
          id: item,
          tips: this.typeTips[item],
          disabled: false,
          englishname: this.typeTips[item],
          code: this.typeTips[item],
        });
      });
      this.bandwidthTypeOption[0].disabled = true;
      this.bandwidthTypeSelected = [this.bandwidthTypeOption[0]];
    }
  }

  private setBandwidthData() {
    this.bandwidthEchartsData = {};
    let option: any = {};
    if (this.hasDdrid) {
      option = {
        spec: this.bandwidthTypeSelected,
        die: this.bandwidthNodeSelected,
        ddrid: this.ddrIdSelected,
        key: ['bandwith'],
        data: this.bandwidthData.origin_data,
        title: 'Internet Information',
        type: 'ddrwidth',
        hasDdrid: true
      };
    } else {
      option = {
        spec: this.bandwidthTypeSelected,
        die: this.bandwidthNodeSelected,
        key: ['bandwith'],
        data: this.bandwidthData.origin_data,
        title: 'Internet Information',
        type: 'ddrwidth',
        hasDdrid: false
      };
    }
    this.bandwidthEchartsData = option;
    const data: any = [];
    option.data.time.forEach((item: any) => {
      data.push(item.toFixed(3) + 's');
    });
    this.timeData = data;
  }


  private initAccessCountData() {
    this.initCountNodeOption(this.countData['NUMA node']);
    this.initCountTypeOption(this.countData.type);
    this.setCountData();
  }

  private initCountNodeOption(data: any) {
    this.countNodeOption = [];
    if (data.length > 0) {
      data.forEach((item: any) => {
        this.countNodeOption.push({
          label: item,
          id: item
        });
      });
      this.countNodeOption[0].disabled = true;
      this.countNodeSelected = [this.countNodeOption[0]];
    }
  }
  private initCountTypeOption(data: any) {
    this.countTypeOption = [];
    if (data.length > 0) {
      data.forEach((item: any) => {
        this.countTypeOption.push({
          label: item,
          id: item,
          tips: this.typeTips[item],
          disabled: false,
          englishname: this.typeTips[item],
          code: this.typeTips[item],
        });
      });
      this.countTypeOption[0].disabled = true;
      this.countTypeSelected = [this.countTypeOption[0]];
    }
  }
  private setCountData() {
    this.countEchartsData = {};
    const option = {
      spec: this.countTypeSelected,
      die: this.countNodeSelected,
      key: ['acessscount', 'localaccess', 'spandie', 'spanchip', 'ddr_access_count'],
      key_per: ['', 'local_access_per', 'spandie_per', 'spanchip_per', 'ddr_access_per'],
      data: this.countData.origin_data,
      title: 'Network device failure(error)',
      type: 'ddrcount'
    };
    this.countEchartsData = option;
    const data: any = [];
    option.data.time.forEach((item: any) => {
      data.push(item.toFixed(3) + 's');
    });
  }


  public onBandwidthNodeChange() {
    this.setBandwidthData();
    this.bandwidthNodeOption.forEach((item: any) => {
      if (this.bandwidthNodeSelected.length === 1) {
        if (item.id === this.bandwidthNodeSelected[0].id) {
          item.disabled = true;
        }
      } else {
        item.disabled = false;
      }
    });
    if (this.hasDdrid) {
      if (this.bandwidthTypeSelected.length !== 0
        && this.bandwidthNodeSelected.length !== 0
        && this.ddrIdSelected.length !== 0) {
        setTimeout(() => {
          this.bandwidthEcharts.initTable();
        }, 0);
      }
    } else {
      if (this.bandwidthTypeSelected.length !== 0 && this.bandwidthNodeSelected.length !== 0) {
        setTimeout(() => {
          this.bandwidthEcharts.initTable();
        }, 0);
      }
    }
  }

  public onBandwidthTypeChange() {
    this.setBandwidthData();

    this.bandwidthTypeOption.forEach((item: any) => {
      if (this.bandwidthTypeSelected.length === 1) {
        if (item.id === this.bandwidthTypeSelected[0].id) {
          item.disabled = true;
        }
      } else {
        item.disabled = false;
      }
    });

    if (this.hasDdrid) {
      if (this.bandwidthTypeSelected.length !== 0
        && this.bandwidthNodeSelected.length !== 0
        && this.ddrIdSelected.length !== 0) {
        setTimeout(() => {
          this.bandwidthEcharts.initTable();
        }, 0);
      }
    } else {
      if (this.bandwidthTypeSelected.length !== 0 && this.bandwidthNodeSelected.length !== 0) {
        setTimeout(() => {
          this.bandwidthEcharts.initTable();
        }, 0);
      }
    }
  }

  public ddrIdChange() {
    this.setBandwidthData();

    this.ddrIdOption.forEach((item: any) => {
      if (this.ddrIdSelected.length === 1) {
        if (item.id === this.ddrIdSelected[0].id) {
          item.disabled = true;
        }
      } else {
        item.disabled = false;
      }
    });

    if (this.hasDdrid) {
      if (this.bandwidthTypeSelected.length !== 0
        && this.bandwidthNodeSelected.length !== 0
        && this.ddrIdSelected.length !== 0) {
        setTimeout(() => {
          this.bandwidthEcharts.initTable();
        }, 0);
      }
    } else {
      if (this.bandwidthTypeSelected.length !== 0 && this.bandwidthNodeSelected.length !== 0) {
        setTimeout(() => {
          this.bandwidthEcharts.initTable();
        }, 0);
      }
    }
  }

  public onCountNodeChange() {
    this.setCountData();
    this.countNodeOption.forEach((item: any) => {
      if (this.countNodeSelected.length === 1) {
        if (item.id === this.countNodeSelected[0].id) {
          item.disabled = true;
        }
      } else {
        item.disabled = false;
      }
    });
    if (this.countNodeSelected.length !== 0 && this.countTypeSelected.length !== 0) {
      setTimeout(() => {
        this.countEcharts.initTable();
      }, 0);
    }
  }

  public onCountTypeChange() {
    this.setCountData();
    this.countTypeOption.forEach((item: any) => {
      if (this.countTypeSelected.length === 1) {
        if (item.id === this.countTypeSelected[0].id) {
          item.disabled = true;
        }
      } else {
        item.disabled = false;
      }
    });

    if (this.countTypeSelected.length !== 0 && this.countNodeSelected.length !== 0) {
      setTimeout(() => {
        this.countEcharts.initTable();
      }, 0);
      setTimeout(() => {
        const dom = window.document.getElementsByClassName('cpu-usage');
      }, 200);
    }
  }

  public timeLineData(e: any) {
    this.timeLine = e;
    this.bandwidthEcharts.upDateTimeLine(e);
    this.countEcharts.upDateTimeLine(e);
  }

  public dataZoom(e: any) {
    this.timeLineDetail.dataConfig(e);
    this.timeLineData(e);
  }

}
