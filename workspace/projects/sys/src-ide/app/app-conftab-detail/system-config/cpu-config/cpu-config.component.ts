import { Component, OnInit, Input } from '@angular/core';
import { I18nService } from 'projects/sys/src-ide/app/service/i18n.service';
import { AxiosService } from 'projects/sys/src-ide/app/service/axios.service';
@Component({
  selector: 'app-cpu-config',
  templateUrl: './cpu-config.component.html',
  styleUrls: ['./cpu-config.component.scss']
})
export class CpuConfigComponent implements OnInit {

  @Input() configItemData: any;

  public switchState = true;
  public i18n: any;
  public list: Array<any> = [];
  public columns: Array<any> = [];
  public dotData: Array<any> = [];
  public numaTitle: any;
  public numaInfo: Array<any> = [];
  public dotDistance: any;
  public checked = true;
  public coreNum: any;
  public tipStr = '123';
  public numaTipStr: any;
  constructor(public i18nService: I18nService, public Axios: AxiosService) {
    this.i18n = this.i18nService.I18n();
  }

  /**
   * downloadCsv
   */
  downloadCsv() {
    let str = this.i18n.sys_cof.sum.cpu_info.cpu_core + ',';
    str += this.coreNum + '\n';
    // cpu核数
    this.columns.forEach(el => {
      str += el.title + ',';
    });
    str += '\n';
    this.list.forEach(el => {
        for (const item of Object.keys(el)) {
          str += '"' + el[item] + '"' + '\t,';
        }
        str += '\n';
      });

    // numa节点
    str += '\n' + this.i18n.sys_cof.sum.cpu_info.numa_node + '\n';
    this.numaTitle.forEach(el => {
      str += el.title + ',';
    });
    str += '\n';
    this.numaInfo.forEach(el => {
        for (const item of Object.keys(el)) {
          let strEl2 = el[item];
          if (typeof (el[item]) === 'string' && el[item].indexOf(',') > -1) {
            strEl2 = el[item].replace(/,/g, '，');
          }
          str += strEl2 + '\t,';
        }
        str += '\n';
      });

    // numa节点距离
    str += '\n' + this.i18n.sys_cof.sum.cpu_info.numa_node_dis + '\n';
    this.dotDistance.forEach(el => {
      str += el.title + ',';
    });
    str += '\n';
    this.dotData.forEach(el => {
        for (const item in el) {
          if (el[item] === undefined) {
            str += ',';
          } else {
            let strEl3 = el[item];
            if (typeof (el[item]) === 'string' && el[item].indexOf(',') > -1) {
              strEl3 = el[item].replace(/,/g, '，');
            }
            str += strEl3 + '\t,';
          }
        }
        str += '\n';
      });

    // encodeURIComponent解决中文乱码
    const uri = 'data:text/csv;charset=utf-8,\ufeff' + encodeURIComponent(str);
    // 通过创建a标签实现
    const link = document.createElement('a');
    link.href = uri;
    // 对下载的文件命名
    link.download = this.i18n.sys_cof.sum.cpu + '.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }


  /**
   * maxLength
   * @param data data
   */
  public maxLength(data) {
    let num = 0;
    for (const item in data) {
      if (data[item].length > num) {
        num = data[item].length;
      }
    }
    return num;
  }

  /**
   * ngOnInit
   */
  ngOnInit() {


    const data = this.configItemData.data;

    this.numaTipStr = this.configItemData.language === 'zh' ? data.suggest.suggest_chs_cfg_numa_info.join('\n') :
      data.suggest.suggest_en_cfg_numa_info.join('\n');
    // cpu核数

    this.coreNum = data.cpu.core_num ? data.cpu.core_num[0] : '';

    this.columns = [
      {
        title: this.i18n.sys_cof.sum.cpu,

      },
      {
        title: this.i18n.sys_cof.sum.cpu_info.cpu_type,
      },
      {
        title: this.i18n.sys_cof.sum.cpu_info.cpu_max_hz,
      },
      {
        title: this.i18n.sys_cof.sum.cpu_info.cpu_cur_hz,
      },
    ];


    // 重整CPU数据
    if (Object.keys(data.cpu).length > 0) {
      for (let i = 0; i < this.maxLength(data.cpu); i++) {
        this.list.push({

          name: data.cpu.name ? data.cpu.name[i] : i,
          version: data.cpu.type ? data.cpu.type[i] : '',
          maxSpeed: data.cpu.max_hz ? data.cpu.max_hz[i] : '',
          nowSpeed: data.cpu.cur_hz ? data.cpu.cur_hz[i] : '',
        });

      }

    }



    this.numaTitle = [
      {
        title: this.i18n.sys_cof.sum.cpu_info.node_name,

      },
      {
        title: this.i18n.sys_cof.sum.cpu_info.numa_core,
      },
      {
        title: this.i18n.sys_cof.sum.cpu_info.total_mem,
      },
      {
        title: this.i18n.sys_cof.sum.cpu_info.free_mem,
      },
    ];

    // numa数据
    for (let i = 0; i < this.maxLength(data.numa_node); i++) {

      this.numaInfo.push({
        dotname: data.numa_node.name[i],
        CPUs: data.numa_node.cpu_core[i],
        size: data.numa_node.total_mem[i],
        free: data.numa_node.free_mem[i]
      });
    }

    this.dotDistance = [
      {
        title: this.i18n.sys_cof.sum.cpu_info.node,

      },
      {
        title: this.i18n.sys_cof.sum.cpu_info.numa_zero,
      },
      {
        title: this.i18n.sys_cof.sum.cpu_info.numa_one,
      },
      {
        title: this.i18n.sys_cof.sum.cpu_info.numa_two,
      },
      {
        title: this.i18n.sys_cof.sum.cpu_info.numa_three,
      },
    ];

    // 节点距离数据
    for (let i = 0; i < this.maxLength(data.numa_dis); i++) {
      this.dotData.push({
        dot: data.numa_dis.node_id ? data.numa_dis.node_id[i] : '',
        zero: data.numa_dis['0'] ? data.numa_dis['0'][i] : '',
        one: data.numa_dis['1'] ? data.numa_dis['1'][i] : '',
        two: data.numa_dis['2'] ? data.numa_dis['2'][i] : '',
        three: data.numa_dis['3'] ? data.numa_dis['3'][i] : '',
      });
    }
  }
}



