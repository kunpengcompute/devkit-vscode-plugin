import { Component, OnInit } from '@angular/core';
import { I18n } from 'sys/locale';
import { RespCommon } from 'sys/src-com/app/domain';
import { HttpService, TipService } from 'sys/src-com/app/service';
import {
  TuninghelperStatusService
} from 'sys/src-com/app/tuninghelper/tuninghelper-analysis/service/tuninghelper-status.service';
import { RespOSConfig, RespSystemConfigOS } from '../domain/resp-system-config-os.type';

@Component({
  selector: 'app-sys-config-os',
  templateUrl: './sys-config-os.component.html',
  styleUrls: ['./sys-config-os.component.scss']
})
export class SysConfigOsComponent implements OnInit {

  public osInfo: {
    label: string;
    question?: string;
    texts: string[];
  }[] = [];

  constructor(
    private statusService: TuninghelperStatusService,
    private http: HttpService,
    private tip: TipService,
  ) { }

  async ngOnInit() {
    const data = await this.getData();
    this.initOSInfo(data);
  }

  private initOSInfo(data: RespOSConfig) {
    if (!data) { return; }
    this.osInfo = [
      { label: 'OS Version', texts: [data.tuning_os_version || '--'] },
      { label: 'Kernel Version', texts: [data.tuning_kernel_version || '--'] },
      { label: 'Glibc version', texts: [data.tuning_glibc_version || '--'] },
      {
        label: 'SMMU',
        texts: [data.tuning_smmu === 'Open' ? I18n.sys_cof.sum.open : I18n.sys_cof.sum.close],
        question: I18n.sys.tip.os_config_smmu
      },
      { label: 'Page Size（KB）', texts: [data.tuning_page_size || '--'] },
      {
        label: 'Huge Page',
        texts: Object.keys(data.tuning_huge_page_config || {}).sort().reduce((arr1: string[], node) => {
          const nodeInfo = data.tuning_huge_page_config[node];
          arr1.push(`${node}: ` + Object.keys(nodeInfo).reduce((arr2: string[], sizeKey) => {
            arr2.push(`${sizeKey}: ${nodeInfo[sizeKey]}`);
            return arr2;
          }, []).join(', '));
          return arr1;
        }, []),
        question: I18n.sys.tip.os_config_huge_page
      },
      {
        label: 'Transparent Huge Page',
        texts: [data.tuning_transparent_hugepage && data.tuning_transparent_hugepage !== '--'
          ? data.tuning_transparent_hugepage[0].toUpperCase() + data.tuning_transparent_hugepage.slice(1)
          : '--'],
        question: I18n.sys.tip.os_config_transparent_huge_page
      },
      {
        label: 'dirty_expire_centiseconds',
        texts: [data.tuning_dirty_expire_centisecs || '--'],
        question: I18n.sys.tip.os_config_dirty_expire
      },
      {
        label: 'dirty_background_ratio',
        texts: [data.tuning_dirty_background_ratio || '--'],
        question: I18n.sys.tip.os_config_background_ratio
      },
      {
        label: 'dirty_ratio',
        texts: [data.tuning_dirty_ratio || '--'],
        question: I18n.sys.tip.os_config_dirty_ratio
      },
      {
        label: 'dirty_writeback_centisecs',
        texts: [data.tuning_dirty_writeback_centisecs || '--'],
        question: I18n.sys.tip.os_config_dirty_writeback
      },
      {
        label: 'swappiness',
        texts: [data.tuning_swappiness || '--'],
        question: I18n.sys.tip.os_config_swappiness
      },
      {
        label: 'HZ',
        texts: [data.tuning_hz || '--'],
        question: I18n.sys.tip.os_config_HZ
      },
      {
        label: 'nohz',
        texts: [data.tuning_nohz
          ? data.tuning_nohz[0].toUpperCase() + data.tuning_nohz.slice(1)
          : '--'],
        question: I18n.sys.tip.os_config_nohz
      },
    ];
  }

  private async getData() {
    const params = {
      'node-id': this.statusService.nodeId,
      'config-type': 'os',
    };
    const resp: RespCommon<RespSystemConfigOS> = await this.http.get(
      `/tasks/${encodeURIComponent(this.statusService.taskId)}/optimization/system-config/`,
      { params }
    );
    return resp?.data?.optimization?.data;
  }

}
