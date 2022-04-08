import { Component, OnInit } from '@angular/core';
import { I18n } from 'sys/locale';
import { RespCommon } from 'sys/src-com/app/domain';
import { HttpService } from 'sys/src-com/app/service';
import { TuninghelperStatusService } from '../../../service/tuninghelper-status.service';
import { RespCompareOS, RespSysConfigOSCompare } from '../domain/resp-sys-config-os-compare.type';
import { CompareItem } from '../../components/compare-text-item/compare-text-item.component';
import { getCompareValue } from '../utils/get-compare-value';

@Component({
  selector: 'app-sys-config-os-compare',
  templateUrl: './sys-config-os-compare.component.html',
  styleUrls: ['./sys-config-os-compare.component.scss']
})
export class SysConfigOsCompareComponent implements OnInit {

  public osInfo: CompareItem[] = [];

  constructor(
    private statusService: TuninghelperStatusService,
    private http: HttpService
  ) { }

  async ngOnInit() {
    const resp = await this.getData();
    if (!resp) { return; }
    this.initOSInfo(resp);
  }

  private initOSInfo(data: RespCompareOS) {
    this.osInfo = [
      {
        label: 'OS Version',
        different: !data.tuning_os_version[2],
        value: getCompareValue(data.tuning_os_version),
      },
      {
        label: 'Kernel Version',
        different: !data.tuning_kernel_version[2],
        value: getCompareValue(data.tuning_kernel_version),
      },
      {
        label: 'Glibc version',
        different: !data.tuning_glibc_version[2],
        value: getCompareValue(data.tuning_glibc_version)
      },
      {
        label: 'SMMU',
        different: !data.tuning_smmu[2],
        value: getCompareValue(data.tuning_smmu.map((item, index) => {
          if (index < 2) {
            return item === 'Open' ? I18n.sys_cof.sum.open : I18n.sys_cof.sum.close;
          } else {
            return item;
          }
        })),
        tip: I18n.sys.tip.os_config_smmu,
      },
      {
        label: 'Page Size（KB）',
        different: !data.tuning_page_size[2],
        value: getCompareValue(data.tuning_page_size)
      },
      {
        label: 'Huge Page',
        different: Object.values(data.tuning_huge_page_config).findIndex(nodeItem => {
          return Object.values(nodeItem).findIndex(sizeItem => {
            return !sizeItem[2];
          }) > -1;
        }) > -1,
        value: Object.keys(data.tuning_huge_page_config || {})
          .sort()
          .reduce((arr1: string[], node) => {
            const nodeInfo = data.tuning_huge_page_config[node];
            arr1.push(
              `${node}: ` +
                Object.keys(nodeInfo)
                  .reduce((arr2: string[], sizeKey) => {
                    arr2.push(`${sizeKey}: ${getCompareValue(nodeInfo[sizeKey])}`);
                    return arr2;
                  }, [])
                  .join(', ')
            );
            return arr1;
          }, []),
        tip: I18n.sys.tip.os_config_huge_page,
      },
      {
        label: 'Transparent Huge Page',
        different: !data.tuning_transparent_hugepage[2],
        value: getCompareValue(data.tuning_transparent_hugepage.map((item, index) => {
          if (index < 2) {
            return (item as string)[0].toUpperCase() + (item as string).slice(1);
          } else {
            return item;
          }
        })),
        tip: I18n.sys.tip.os_config_transparent_huge_page,
      },
      {
        label: 'dirty_expire_centiseconds',
        different: !data.tuning_dirty_expire_centisecs[2],
        value: getCompareValue(data.tuning_dirty_expire_centisecs),
        tip: I18n.sys.tip.os_config_dirty_expire,
      },
      {
        label: 'dirty_background_ratio',
        different: !data.tuning_dirty_background_ratio[2],
        value: getCompareValue(data.tuning_dirty_background_ratio),
        tip: I18n.sys.tip.os_config_background_ratio,
      },
      {
        label: 'dirty_ratio',
        different: !data.tuning_dirty_ratio[2],
        value: getCompareValue(data.tuning_dirty_ratio),
        tip: I18n.sys.tip.os_config_dirty_ratio,
      },
      {
        label: 'dirty_writeback_centisecs',
        different: !data.tuning_dirty_writeback_centisecs[2],
        value: getCompareValue(data.tuning_dirty_writeback_centisecs),
        tip: I18n.sys.tip.os_config_dirty_writeback,
      },
      {
        label: 'swappiness',
        different: !data.tuning_swappiness[2],
        value: getCompareValue(data.tuning_swappiness),
        tip: I18n.sys.tip.os_config_swappiness,
      },
      {
        label: 'HZ',
        different: !data.tuning_hz[2],
        value: getCompareValue(data.tuning_hz),
        tip: I18n.sys.tip.os_config_HZ
      },
      {
        label: 'nohz',
        different: !data.tuning_nohz[2],
        value: getCompareValue(data.tuning_nohz.map((item, index) => {
          if (index < 2) {
            return (item as string)[0].toUpperCase() + (item as string).slice(1);
          } else {
            return item;
          }
        })),
        tip: I18n.sys.tip.os_config_nohz,
      },
    ];
  }

  private async getData() {
    const params = {
      id: this.statusService.taskId,
      type: 'os',
    };
    const resp: RespCommon<RespSysConfigOSCompare> = await this.http.get(
      `/data-comparison/system-config-comparison/`,
      { params }
    );
    return resp?.data?.data;
  }

}
