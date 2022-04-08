import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { AxiosService } from 'projects/sys/src-web/app/service/axios.service';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';

@Component({
  selector: 'app-runtime-information',
  templateUrl: './runtime-information.component.html',
  styleUrls: ['../sys-summury.component.scss']
})
export class RuntimeInformationComponent implements OnInit {

  constructor(public i18nService: I18nService, public Axios: AxiosService) {
    this.i18n = this.i18nService.I18n();
  }
  @Input() runtimeInformationData: any;
  @Input() taskid: any;
  @Input() nodeid: any;
  @Input() Unfold: any;
  @Input() pagesizeTipStr: any;
  @Input() borderShow: any;
  @ViewChild('viewDetailMask') viewDetailMask: any;
  public language = 'zh';
  public resData: any = {};
  public noralMsgData: any = { baseInfo: [], memManage: [], netWorks: [] };
  public dockerData: any = [{}, {}, {}]; // 虚拟机data
  public configDetail = [{ key: 'system_dmesg', value: 'systemDmesg' }, { key: 'docker images', value: 'dockerImage' },
  { key: 'kernelConfig', value: 'kernelConfig' }, { key: 'env', value: 'env' },
  { key: 'docker info', value: 'dockerInfo' },
  { key: 'sysctl', value: 'sysctl' }, { key: 'cmdline', value: 'cmdline' }];
  public configDetailItem = {
    title: '',
    data: '',
  };
  public toggle = {   //  用于判断打开关闭
    environmentalInformation: false, // 运行时环境信息
  };
  public cmdIfClick = false;
  public i18n: any;
  public nodeKvmData = true;

  ngOnInit() {
    if (this.Unfold) {
      this.toggle.environmentalInformation = true;
    }
    if (sessionStorage.getItem('language') === 'en-us') {
      this.language = 'en';
    } else {
      this.language = 'zh';
    }

    if (JSON.stringify(this.runtimeInformationData) !== '{}') {
      this.getOperationData(this.runtimeInformationData);
    }
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
  public viewDetail(item: any, index: any) {
    if (item.data !== this.i18n.sys.viewDetails) {
      return;
    } else {
      const detail = this.configDetail.find(val => {
        return val.key === item.title;
      });
      const params = {
        nodeId: this.nodeid,
        queryType: 'config',
        queryTarget: detail.value, // 例如overView，CPU，net，storage，memory
      };
      this.Axios.axios.get(`/tasks/${encodeURIComponent(this.taskid)}/sys-performance/config-detail/`, { params })
        .then((res: any) => {

          this.configDetailItem.title = item.title;
          if (res.data === 'not message' || res.data === 'file not exist') {
            this.configDetailItem.data = this.i18n.common_term_task_nodata;
          } else {
            this.configDetailItem.data = res.data.join('\n');
          }
          this.viewDetailMask.Open();
        });
    }
    if (index === -1) {
      this.cmdIfClick = true;
    } else {
      this.noralMsgData.baseInfo[1][index].ifClick = true;
    }

  }
  // kvm 虚拟机配置参数
  public kvmConfig(item: any, i: any) {
    this.configDetailItem.title = item.slice(13);
    this.configDetailItem.data = this.resData.docker.virsual.kvm_info[item].join('\n');
    this.viewDetailMask.Open();
    this.dockerData[1].data[i].ifClick = true;
  }

  // 获取运行时环境信息
  public getOperationData(itemData: any) {
    this.resData = itemData;
    const data = this.resData.noral_msg;
    const NetworkCardVersion: any = [];
    const NetworkCardVersion1: any = [];
    const NetworkCardVersion2: any = [];
    const NetworkCardVersion3: any = [];
    this.resData.version.net_name.forEach((val: any, index: any) => {
      const obj = { title: '', data: '' };
      obj.title = val;
      obj.data = !this.resData.version.net_version[index]?.trim() || this.resData.version.net_version[index] === 'NULL'
        ? '--'
        : this.resData.version.net_version[index];
      if ((index + 1) % 3 === 0) {
        NetworkCardVersion3.push(obj);
      } else if ((index + 1) % 3 === 1) {
        NetworkCardVersion1.push(obj);
      } else {
        NetworkCardVersion2.push(obj);
      }
      NetworkCardVersion.push(obj);
    });
    this.noralMsgData = {
      baseInfo: [[{
        title: this.i18n.sys_cof.sum.bios,
        data: data.cfg_soft_version[0] || '--',
        tipStr: this.language === 'zh' ? data.suggest.suggest_chs_cfg_soft_version.join('\n')
        : data.suggest.suggest_chs_cfg_soft_version.join('\n'),
      },
      {
        title: this.i18n.sys_cof.sum.os,
        data: data.cfg_os_version[0] || '--',
        tipStr: this.language === 'zh' ? data.suggest.suggest_chs_cfg_os_version.join('\n')
        : data.suggest.suggest_chs_cfg_os_version.join('\n'),

      },
      {
        title: this.i18n.sys_cof.sum.kernel,
        data: data.cfg_kernel_version[0] || '--',
        tipStr: this.language === 'zh' ? data.suggest.suggest_chs_cfg_kernel_version.join('\n')
        : data.suggest.suggest_chs_cfg_kernel_version.join('\n'),

      },
      {
        title: this.i18n.sys_cof.sum.jdk,
        data: data.cfg_jdk_version[0] || '--',
        tipStr: this.language === 'zh' ? data.suggest.suggest_chs_cfg_jdk_version.join('\n')
        : data.suggest.suggest_chs_cfg_jdk_version.join('\n'),

      },
      {
        title: this.i18n.sys_cof.sum.glibc,
        data: data.cfg_glibc_version || '--',
        tipStr: this.language === 'zh' ? data.suggest.suggest_chs_cfg_glibc_version.join('\n')
        : data.suggest.suggest_chs_cfg_glibc_version.join('\n'),

      }],
      [{
        title: 'system_dmesg',
        data: this.i18n.sys.viewDetails,
        ifClick: false
      },
      {
        title: 'docker info',
        data: this.i18n.sys.viewDetails,
        ifClick: false
      },
      {
        title: 'sysctl',
        data: this.i18n.sys.viewDetails,
        ifClick: false
      },
      {
        title: 'kernelConfig',
        data: this.i18n.sys.viewDetails,
        ifClick: false
      },
      {
        title: 'docker images',
        data: this.i18n.sys.viewDetails,
        ifClick: false
      }
      ],
      [
        {
          title: this.i18n.sys_cof.sum.firmware_info.bmc_version,
          data: this.resData.firm_ver.get_firm_ver.BMC === 'not supported'
          ? '-- ' : this.resData.firm_ver.get_firm_ver.BMC
        }
      ]],
      memManage: [[{
        title: this.i18n.sys_cof.sum.smmu,
        data: !Array.isArray(data.cfg_smmu_info) ? '--' : data.cfg_smmu_info.length > 0
        ? this.i18n.sys_cof.sum.open : this.i18n.sys_cof.sum.close,
        tipStr: this.language === 'zh' ? data.suggest.suggest_chs_cfg_smmu_info.join('\n')
        : data.suggest.suggest_en_cfg_smmu_info.join('\n'),
      },
      {
        title: this.i18n.sys_cof.sum.page_size + '(B)',
        data: data.cfg_page_size,
        tipStr: this.language === 'zh' ? data.suggest.suggest_chs_cfg_page_size.join('\n')
        : data.suggest.suggest_en_cfg_page_size.join('\n'),
        tipStr2: this.pagesizeTipStr,
      },
      {
        title: this.i18n.sys_cof.sum.tran_page,
        data: data.cfg_transparent_info === '' ? '--' : data.cfg_transparent_info,
        tipStr: this.language === 'zh' ? data.suggest.suggest_chs_cfg_transparent_info.join('\n') :
          data.suggest.suggest_en_cfg_transparent_info.join('\n'),
      },
      {
        title: this.i18n.sys_summary.cpupackage_tabel.standard_page + '(KB)',
        data: data.cfg_hugepage_size[0] ? data.cfg_hugepage_size[0].toString().match(/[0-9]*/)[0] : '--',
      },
      {
        title: this.i18n.sys_summary.cpupackage_tabel.page_number,
        data: data.cfg_hugepage_num[0] === 0
        ? data.cfg_hugepage_num[0] : data.cfg_hugepage_num[0] ? data.cfg_hugepage_num[0] : '--',
      },
      {
        title: this.i18n.sys_summary.cpupackage_tabel.partition,
        data: data.cfg_vm_swappiness[0] || '--',
      }],
      [{
        title: this.i18n.sys_cof.sum.dirty_time,
        data: data.cfg_dirty_time || '--',
        tipStr: this.language === 'zh' ? data.suggest.suggest_chs_cfg_dirty_time.join('\n') :
          data.suggest.suggest_en_cfg_dirty_time.join('\n'),
      },
      {
        title: this.i18n.sys_cof.sum.dirty_ratio,
        data: data.cfg_dirty_ratio || '--',
        tipStr: this.language === 'zh' ? data.suggest.suggest_chs_cfg_dirty_ratio.join('\n') :
          data.suggest.suggest_en_cfg_dirty_ratio.join('\n'),
      },
      {
        title: this.i18n.sys_cof.sum.dirty_memratio,
        data: data.cfg_dirty_memratio || '--',
        tipStr: this.language === 'zh' ? data.suggest.suggest_chs_cfg_dirty_memratio.join('\n') :
          data.suggest.suggest_en_cfg_dirty_memratio.join('\n'),
      },
      {
        title: this.i18n.sys_summary.cpupackage_tabel.data_interval,
        data: data.cfg_dirty_interval[0] || '--',
      },
      {
        title: this.i18n.sys_summary.cpupackage_tabel.idle + '(KB)',
        data: data.cfg_vm_minfreekbyte[0] || '--',
      }],
      [{
        title: this.i18n.sys_cof.sum.hz_info,
        data: data.cfg_hz_info.length === 0 ? '--' : data.cfg_hz_info[0],
        tipStr: this.language === 'zh'
        ? data.suggest.suggest_chs_cfg_hz_info.join('\n') : data.suggest.suggest_en_cfg_hz_info.join('\n'),
      },
      {
        title: this.i18n.sys_cof.sum.nohz_info,
        data: data.cfg_nohz_info[0] ? data.cfg_nohz_info[0] === 'Not Support' ? '--' : data.cfg_nohz_info[0] : '--',
        tipStr: this.language === 'zh' ? data.suggest.suggest_chs_cfg_nohz_info.join('\n')
        : data.suggest.suggest_en_cfg_nohz_info.join('\n'),
        tipStr2: data.optimize.suggestion != null
        ? data.optimize.suggestion.indexOf('suggest_chs_cfg_nohz_info') !== -1 ?
        this.language === 'zh' ? data.suggest.suggest_chs_cfg_nohz_info.join('\n')
        : data.suggest.suggest_en_cfg_nohz_info.join('\n') : 'NULL' : 'NULL',
      },
      {
        title: 'cmdline',
        data: this.i18n.sys.viewDetails,
      }]],
      netWorks: [NetworkCardVersion1, NetworkCardVersion2, NetworkCardVersion3, NetworkCardVersion]
    };

    const kvmMessage: any = [];
    this.resData.docker.virsual.kvm_info.cfg_xml_list.forEach((item: any) => {
      const obj = {
        title: item,
        ifClick: false
      };
      kvmMessage.push(obj);
    });
    if (kvmMessage.length === 0) {
      this.nodeKvmData = true;
    } else {
      this.nodeKvmData = false;
    }
    this.dockerData = [
      {
        title: this.i18n.sys_cof.sum.virtual_info.virtual_os,
        data: this.resData.docker.virsual.version[0] ? this.resData.docker.virsual.version[0] : '--'
      },
      {
        title: this.i18n.sys_cof.sum.virtual_info.virtual_config,
        data: kvmMessage.length === 0 ? '--' : kvmMessage,
      },
      {
        title: this.i18n.sys_cof.sum.virtual_info.virtual_docker,
        data: this.resData.docker.virsual.docker_info[0] ? this.resData.docker.virsual.docker_info[0] : '--'
      }
    ];
  }

}
