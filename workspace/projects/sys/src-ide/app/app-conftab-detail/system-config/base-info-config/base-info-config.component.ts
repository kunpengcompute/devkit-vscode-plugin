import { Component, OnInit, Input } from '@angular/core';
import { I18nService } from 'projects/sys/src-ide/app/service/i18n.service';
import { AxiosService } from 'projects/sys/src-ide/app/service/axios.service';

@Component({
  selector: 'app-base-info-config',
  templateUrl: './base-info-config.component.html',
  styleUrls: ['./base-info-config.component.scss']
})
export class BaseInfoConfigComponent implements OnInit {

  @Input() configItemData: any;


  public items: any;
  i18n: any;
  constructor(public i18nService: I18nService, public Axios: AxiosService) {
    this.i18n = this.i18nService.I18n();
  }

  /**
   * downloadCsv
   * @param data data
   */
  downloadCsv(data) {
    let str = '';
    data.forEach(val => {
      val.forEach(el => {

        str += el.title + ',' + '"' + el.data + '"' + '\t\n';
      });
    });


    // encodeURIComponent解决中文乱码
    const uri = 'data:text/csv;charset=utf-8,\ufeff' + encodeURIComponent(str);
    // 通过创建a标签实现
    const link = document.createElement('a');
    link.href = uri;
    // 对下载的文件命名
    link.download = this.i18n.sys_cof.sum.normal_msg + '.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * ngOnInit
   */
  ngOnInit() {
    const data = this.configItemData.data;
    const language = this.configItemData.language;
    this.items = [
      [{
        title: this.i18n.sys_cof.sum.bios,
        data: data.cfg_soft_version[0] || '--',
      },
      {
        title: this.i18n.sys_cof.sum.os,
        data: data.cfg_os_version[0] || '--',
      },
      {
        title: this.i18n.sys_cof.sum.kernel,
        data: data.cfg_kernel_version[0] || '--',
      },
      {
        title: this.i18n.sys_cof.sum.jdk,
        data: data.cfg_jdk_version[0] || '--',
      },
      {
        title: this.i18n.sys_cof.sum.glibc,
        data: data.cfg_glibc_version || '--',
      },
    ],

      [{
        title: this.i18n.sys_cof.sum.smmu,
        data: !Array.isArray(data.cfg_smmu_info) ? '--' : data.cfg_smmu_info.length > 0 ?
          this.i18n.sys_cof.sum.open : this.i18n.sys_cof.sum.close,
        tipStr: language === 'zh'
          ? data.suggest.suggest_chs_cfg_smmu_info.join('\n') : data.suggest.suggest_en_cfg_smmu_info.join('\n'),
      },
      {
        title: this.i18n.sys_cof.sum.page_size,
        data: data.cfg_page_size + 'B',
        tipStr: language === 'zh'
          ? data.suggest.suggest_chs_cfg_page_size.join('\n') : data.suggest.suggest_en_cfg_page_size.join('\n'),
        tipPage: language === 'zh'
          ? (data.optimize.cfg_page_size ? data.optimize.cfg_page_size.cfg_page_size.suggest_chs : null)
          : (data.optimize.cfg_page_size ? data.optimize.cfg_page_size.cfg_page_size.suggest_en : null),
      },
      {
        title: this.i18n.sys_cof.sum.tran_page,
        data: data.cfg_transparent_info || '--',
        tipStr: language === 'zh' ? data.suggest.suggest_chs_cfg_transparent_info.join('\n') :
          data.suggest.suggest_en_cfg_transparent_info.join('\n'),
      },
      {
        title: this.i18n.sys_cof.sum.dirty_time,
        data: data.cfg_dirty_time || '--',
        tipStr: language === 'zh'
          ? data.suggest.suggest_chs_cfg_dirty_time.join('\n') : data.suggest.suggest_en_cfg_dirty_time.join('\n'),
      },
      {
        title: this.i18n.sys_cof.sum.dirty_ratio,
        data: data.cfg_dirty_ratio || '--',
        tipStr: language === 'zh' ? data.suggest.suggest_chs_cfg_dirty_ratio.join('\n') :
         data.suggest.suggest_en_cfg_dirty_ratio.join('\n'),
      },
      {
        title: this.i18n.sys_cof.sum.dirty_memratio,
        data: data.cfg_dirty_memratio || '--',
        tipStr: language === 'zh' ? data.suggest.suggest_chs_cfg_dirty_memratio.join('\n') :
          data.suggest.suggest_en_cfg_dirty_memratio.join('\n'),
      },
    ],
      [{
        title: this.i18n.sys_cof.sum.hz_info,
        data: data.cfg_hz_info || '--',
        tipStr: language === 'zh'
          ? data.suggest.suggest_chs_cfg_hz_info.join('\n') : data.suggest.suggest_en_cfg_hz_info.join('\n'),
      },
      {
        title: this.i18n.sys_cof.sum.nohz_info,
        data: data.cfg_nohz_info || '--',
        tipStr: language === 'zh'
          ? data.suggest.suggest_chs_cfg_nohz_info.join('\n') : data.suggest.suggest_en_cfg_nohz_info.join('\n'),
      },
    ],
    ];
  }

}
