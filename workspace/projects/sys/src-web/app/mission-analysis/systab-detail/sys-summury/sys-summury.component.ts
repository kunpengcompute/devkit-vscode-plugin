import { Component, OnInit, ViewChild, Input, ElementRef } from '@angular/core';
import { AxiosService } from 'projects/sys/src-web/app/service/axios.service';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import { MytipService } from 'projects/sys/src-web/app/service/mytip.service';

@Component({
  selector: 'app-sys-summury',
  templateUrl: './sys-summury.component.html',
  styleUrls: ['./sys-summury.component.scss']
})
export class SysSummuryComponent implements OnInit {
  constructor(public Axios: AxiosService, public i18nService: I18nService, public mytip: MytipService) {
    this.i18n = this.i18nService.I18n();
  }
  @Input() tabShowing: boolean; // 用于判断当前tab的状态，为总览页面的相同svg图之间的独立做支撑
  @Input() projectName: any;
  @Input() taskName: any;
  @Input() analysisType: any;
  @Input() isActive: any;
  @Input() taskid: any;
  @Input() nodeid: any;
  @ViewChild('viewDetailMask') viewDetailMask: any;
  public language = 'zh';
  public i18n: any;
  public configItemData: any = { data: {}, language: 'zh' };
  public showData = {
    cpuPackage: false,
    memorySubsystem: false,
    storageSubsystem: false,
    networkSubsystem: false,
    runtimeInformation: false,
    networkConfig: false,
    storageConfig: true,
  };
  public showSvgChart = {
    panoramaSvg: false,
    cpuPackageSvg: false,
    storageSvg: false,
    memorySvg: false,
    networkSvg: false,
  };
  public drillDownName = '';
  public drillDownCpuName = 'cpu0'; // 指明下钻到那个cpu的子系统
  public drillDownCpuCpuName = 'cpu0'; // 指明下钻到那个cpu的子系统
  public drillDownNetCpuName = 'cpu0'; // 初始化到有数据net那个cpu的子系统
  public drillDownStorageCpuName = 'cpu0'; // 初始化到有数据storage个cpu的子系统
  public storageNetNum: any = { storage: [], net: [] };
  public back = false;
  public cpuPackageData = {};  // cpu package 数据
  public memoryData = {}; // 内存子系统 数据
  public storageData: any; // 存储子系统数据
  public networkData: any; // 网络子系统 数据
  public runtimeInformationData = {};  // 运行时环境信息
  public chartSwitch = true; // 判断图   表展示
  public backName = '';
  public suggestMsg: any = []; // 优化建议
  public isAllSvgChartShow = false; // 判断是否为双CPU, SVG显示与否
  public pagesizeTipStr = 'NULL';  // 页表大小 优化建议
  public pagesizeShow = false;
  public borderShow = false;
  public changeHover = '';
  public okLoading = true;

  ngOnInit() {
    if (sessionStorage.getItem('language') === 'en-us') {
      this.language = 'en';
      this.configItemData.language = 'en';
    } else {
      this.language = 'zh';
      this.configItemData.language = 'zh';
    }
    this.getConfigData({ level1: 'hard', level2: 'network' });
    this.getData('CPU');
    this.getData('overView');
    this.getData('memory');
    this.getData('storage');
    this.getData('net');
    this.suggestion();
  }
  public maxLength(data: any) {
    let num = 0;
    if (data != null) {
      Object.keys(data).forEach(item => {
        if (data[item].length > num) {
          num = data[item].length;
        }
      });
    }
    return num;
  }
  public async getData(item: any) {
    const params = {
      nodeId: this.nodeid,
      queryType: 'summary',
      queryTarget: item, // 例如overView，CPU，net，storage，memory
    };
    try {
      const res = await this.Axios.axios.get(`/tasks/${encodeURIComponent(this.taskid)}/sys-performance/summary/`,
        {
          params, headers: {
            showLoading: false,
          },
        });
      if (item === 'CPU') {
        this.cpuPackageData = res.data;
        this.showData.cpuPackage = true;
      } else if (item === 'memory') {
        this.memoryData = res.data;
        this.showData.memorySubsystem = true;
      } else if (item === 'storage') {
        this.storageData = res.data;
        this.showData.storageSubsystem = true;
        if (this.storageData.cpu0.introduction && Object.keys(this.storageData.cpu0.introduction).length > 0) {
          this.drillDownStorageCpuName = 'cpu0';
          this.storageNetNum.storage.push('cpu0');
        } else {
          this.drillDownStorageCpuName = 'cpu1';
        }
        if (this.storageData.cpu1.introduction && Object.keys(this.storageData.cpu1.introduction).length > 0) {
          this.storageNetNum.storage.push('cpu1');
        }
      } else if (item === 'net') {
        this.networkData = res.data;
        this.showData.networkSubsystem = true;
        if (this.networkData.cpu0.net_total_num || this.networkData.cpu0.net_work_num) {
          this.drillDownNetCpuName = 'cpu0';
          this.storageNetNum.net.push('cpu0');
        } else {
          this.drillDownNetCpuName = 'cpu1';
        }
        if (this.networkData.cpu1.net_total_num || this.networkData.cpu1.net_work_num) {
          this.storageNetNum.net.push('cpu1');
        }
      } else if (item === 'overView') {
        if (res.data.res_cpu.cpu_type.length === 2 && res.data.topo_view === 1) {
          this.chartSwitch = false;  // 判断svg图是否展示
          this.showSvgChart.panoramaSvg = true;  // 总图展示
          this.isAllSvgChartShow = true;
        }
        this.showData.runtimeInformation = true;
        this.runtimeInformationData = res.data;
      }
      sessionStorage.setItem('chartSwitch', JSON.stringify(this.chartSwitch));
    } catch (error) {
      if (item === 'CPU') {
        this.showData.cpuPackage = true;
      } else if (item === 'memory') {
        this.showData.memorySubsystem = true;
      } else if (item === 'storage') {
        this.showData.storageSubsystem = true;
      } else if (item === 'net') {
        this.showData.networkSubsystem = true;
      } else if (item === 'overView') {
        this.showData.runtimeInformation = true;
      }
    }
  }
  // 获取配置数据
  public getConfigData(item: any) {
    const params = {
      'node-id': this.nodeid,
      'query-type': item.level1,
      'query-target': item.level2,
    };

    this.okLoading = true;
    this.Axios.axios.get(`/tasks/${encodeURIComponent(this.taskid)}/sys-config/`,
      {
        params, headers: {
          showLoading: false,
        },
      })
      .then((resp: any) => {
        if (resp.data && Object.keys(resp.data).length > 0) {
          this.showData.networkConfig = true;
          this.configItemData.data = resp.data;
        }
      })
      .catch((error: any) => {
        this.showData.networkConfig = true;
      });
  }

  // 返回
  public svgBack() {
    this.changeHover = '';
    this.back = false;  // 返回按钮隐藏
    this.showSvgChart.panoramaSvg = true;   // 总图 及三个列表展示
    this.showData.runtimeInformation = true;
    this.showData.storageConfig = true;
    this.showData.networkConfig = true;
    if (this.drillDownName === 'cpu') {
      this.showSvgChart.cpuPackageSvg = false;
    } else if (this.drillDownName === 'memory') {
      this.showSvgChart.memorySvg = false;
    } else if (this.drillDownName === 'storage') {
      this.showSvgChart.storageSvg = false;
    } else if (this.drillDownName === 'network') {
      this.showSvgChart.networkSvg = false;
    }
  }
  // 下钻
  public drillDown(e: any) {
    if (e.element === 'cpu') {
      this.backName = 'CPU Package';
      this.drillDownCpuCpuName = e.cpu;
      this.showSvgChart.cpuPackageSvg = true;
    } else if (e.element === 'memory') {
      this.backName = this.i18n.sys_summary.mem_subsystem_text;
      this.showSvgChart.memorySvg = true;
    } else if (e.element === 'storage') {
      this.backName = this.i18n.sys_summary.storage_subsystem_text;
      this.showSvgChart.storageSvg = true;
      this.drillDownStorageCpuName = e.cpu;
    } else if (e.element === 'network') {
      this.backName = this.i18n.sys_summary.net_subsystem_text;
      this.showSvgChart.networkSvg = true;
      this.drillDownNetCpuName = e.cpu;
    } else {
      return;
    }
    this.back = true;
    this.showSvgChart.panoramaSvg = false;   // 总图 及三个列表隐藏
    this.showData.runtimeInformation = false;
    this.showData.storageConfig = false;
    this.showData.networkConfig = false;
    this.drillDownName = e.element;
    this.drillDownCpuName = e.cpu;
  }

  // 优化建议
  public suggestion() {
    const params = {
      'node-id': this.nodeid,
      'query-type': 'summary',
      'query-target': '', // 例如cpu_usage, cpu_avgload, mem_usage等
    };
    this.Axios.axios.get(`/tasks/${encodeURIComponent(this.taskid)}/sys-performance/`, {
      params, headers: {
        showLoading: false,
      },
    }).then((res: any) => {
      this.setSuggestions(res.data.cpu_usage);
      if (res.data.cfg_normal_msg.suggestion && res.data.cfg_normal_msg.suggestion.length !== 0) {
        this.pagesizeTipStr = res.data.cfg_normal_msg.suggestion[0].suggest_chs ? this.language === 'zh'
        ? res.data.cfg_normal_msg.suggestion[0].suggest_chs : res.data.cfg_normal_msg.suggestion[0].suggest_en : 'NULL';
      }
      this.setSuggestions(res.data.cfg_normal_msg);
      this.setSuggestions(res.data.disk_usage);
      this.setSuggestions(res.data.mem_swap);
      this.setSuggestions(res.data.net_info);
      this.pagesizeShow = true;
    }).catch((error: any) => {
      this.suggestMsg = [];
      this.pagesizeShow = true;
    })
    .finally(() => {
      this.okLoading = false;
    });
  }


  //  设置优化建议集合
  public setSuggestions(data: any) {
    if (data && data.suggestion && data.suggestion.length) {
      const suggestions = data.suggestion;
      suggestions.map((item: any) => {
        this.suggestMsg.push({
          title: this.language === 'zh' ? item.title_chs : item.title_en,
          msgbody: this.language === 'zh' ? item.suggest_chs : item.suggest_en
        });
      });
    }
  }
  public onHover(label?: any) {
    this.changeHover = label;
  }
}
