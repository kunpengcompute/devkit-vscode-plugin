import { Component, OnInit, AfterViewInit, ChangeDetectorRef,
  Input, TemplateRef, ViewChild, ElementRef } from '@angular/core';
import { AxiosService } from 'projects/sys/src-web/app/service/axios.service';
import { SvgElementInfo } from '../../model/svg-model.model';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';

@Component({
  selector: 'app-network-subsystem-chart',
  templateUrl: './network-subsystem-chart.component.html',
  styleUrls: ['./network-subsystem-chart.component.scss']
})
export class NetworkSubsystemChartComponent implements OnInit, AfterViewInit {
  @ViewChild('netWorkWarpper', { static: true, read: ElementRef }) el: ElementRef;
  @ViewChild('netCardTip', { static: true, read: TemplateRef }) netCardTipTpl: TemplateRef<any>;
  @ViewChild('newPortTip', { static: true, read: TemplateRef }) newPortTipTpl: TemplateRef<any>;

  @Input() networkData: any;
  @Input() cpuName: any;
  public i18n: any;
  public titleDetail: any = [];

  public networkCard11 = new SvgElementInfo(); // 网卡1上面大块部分
  public networkCard12 = new SvgElementInfo(); // 网卡1下面左侧第一个
  public networkCard13 = new SvgElementInfo(); // 网卡1下面左侧第二个
  public networkCard14 = new SvgElementInfo(); // 网卡1下面左侧第三个
  public networkCard15 = new SvgElementInfo(); // 网卡1下面左侧第四个
  public networkCard111 = new SvgElementInfo(); // 数据不存在时整个隐藏
  public networkCard122 = new SvgElementInfo(); // 网卡1数据不存在时网卡与网口连接的横线隐藏
  public networkCard133 = new SvgElementInfo(); // 网卡1数据不存在时网卡与网口连接的横线隐藏
  public networkCard144 = new SvgElementInfo(); // 网卡1数据不存在时网卡与网口连接的横线隐藏
  public networkCard155 = new SvgElementInfo(); // 网卡1数据不存在时网卡与网口连接的横线隐藏
  public networkCard1555 = new SvgElementInfo(); // 网卡1数据不存在时网卡与网口连接的横线隐藏

  public networkCard21 = new SvgElementInfo(); // 网卡2上面大块部分
  public networkCard22 = new SvgElementInfo(); // 网卡2下面左侧第一个
  public networkCard23 = new SvgElementInfo(); // 网卡2下面左侧第二个
  public networkCard24 = new SvgElementInfo(); // 网卡2下面左侧第三个
  public networkCard25 = new SvgElementInfo(); // 网卡2下面左侧第四个
  public networkCard211 = new SvgElementInfo(); // 数据不存在时整个隐藏
  public networkCard222 = new SvgElementInfo(); // 网卡2下面左侧第一个数据不存在时网卡与网口连接的横线隐藏
  public networkCard233 = new SvgElementInfo(); // 网卡2下面左侧第二个数据不存在时网卡与网口连接的横线隐藏
  public networkCard244 = new SvgElementInfo(); // 网卡2下面左侧第三个数据不存在时网卡与网口连接的横线隐藏
  public networkCard255 = new SvgElementInfo(); // 网卡2下面左侧第四个数据不存在时网卡与网口连接的横线隐藏
  public networkCard2555 = new SvgElementInfo(); // 网卡2下面左侧第四个数据不存在时网卡与网口连接的横线隐藏

  public networkCard31 = new SvgElementInfo(); // 网卡3上面大块部分
  public networkCard32 = new SvgElementInfo(); // 网卡3下面左侧第一个
  public networkCard33 = new SvgElementInfo(); // 网卡3下面左侧第二个
  public networkCard34 = new SvgElementInfo(); // 网卡3下面左侧第三个
  public networkCard35 = new SvgElementInfo(); // 网卡3下面左侧第四个
  public networkCard311 = new SvgElementInfo(); // 网卡3上面大块部分
  public networkCard322 = new SvgElementInfo(); // 网卡3下面左侧第一个
  public networkCard333 = new SvgElementInfo(); // 网卡3下面左侧第二个
  public networkCard344 = new SvgElementInfo(); // 网卡3下面左侧第三个
  public networkCard355 = new SvgElementInfo(); // 网卡3下面左侧第四个
  public networkCard3555 = new SvgElementInfo(); // 网卡3下面左侧第四个

  public networkCard41 = new SvgElementInfo(); // 网卡4上面大块部分
  public networkCard42 = new SvgElementInfo(); // 网卡4下面左侧第一个
  public networkCard43 = new SvgElementInfo(); // 网卡4下面左侧第二个
  public networkCard44 = new SvgElementInfo(); // 网卡4下面左侧第三个
  public networkCard45 = new SvgElementInfo(); // 网卡4下面左侧第四个
  public networkCard411 = new SvgElementInfo(); // 网卡4上面大块部分
  public networkCard422 = new SvgElementInfo(); // 网卡4下面左侧第一个
  public networkCard433 = new SvgElementInfo(); // 网卡4下面左侧第二个
  public networkCard444 = new SvgElementInfo(); // 网卡4下面左侧第三个
  public networkCard455 = new SvgElementInfo(); // 网卡4下面左侧第四个
  public networkCard4555 = new SvgElementInfo(); // 网卡4下面左侧第四个
  public tipsData: any = []; // 提示数据
  public turnPage = false;

  // tooltip
  public tooltipShowManager: TooltipShowManager;
  public niceTooltipInfo: {
    html: TemplateRef<any>,
    context: { tipsArr: [] },
    top: { pointX: number, pointY: number },
    bottom: { pointX: number, pointY: number },
  };
  public niceTooltipShowCopy = false;
  set niceTooltipShow(val) {
    this.niceTooltipShowCopy = val;
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }
  get niceTooltipShow() {
    return this.niceTooltipShowCopy;
  }

  constructor(private axios: AxiosService, private cdr: ChangeDetectorRef, public i18nService: I18nService) {
    this.i18n = this.i18nService.I18n();
  }

  ngOnInit() {
    const obj = new SvgElementInfo();
    this.networkData = this.networkData[this.cpuName];
    if (JSON.stringify(this.networkData) !== '{}') {
      this.getNetWorkData(this.networkData);
      this.getTipsData(this.networkData);
    }
  }

  ngAfterViewInit(): void {
    // 兼容IE11
    const doc: any = document;
    if (/*@cc_on!@*/false || !!doc.documentMode) {
      $(this.el.nativeElement.querySelector('svg')).attr({ width: 1480, height: 499 });
    }
    this.boundEvent(0);
  }

  // 获取弹窗信息
  public getTipsData(data: any) {
    let index = Math.ceil(Object.keys(data.rela).length / 4);
    if (index === 0) {
      index = 1;
    }
    const arrData: any = [];
    if (data.rela != null) {
      Object.keys(data.rela).forEach(key => {
        arrData.push(key);
      });
    }
    for (let i = 0; i < index; i++) {
      const obj = {
        svgShow: i === 0 ? true : false,
        networkTotal: arrData,
        network1: this.i18n.sys_cof.sum.network + '-' + ((index - 1) * 4) + 1,
        network2: this.i18n.sys_cof.sum.network + '-' + ((index - 1) * 4) + 2,
        network3: this.i18n.sys_cof.sum.network + '-' + ((index - 1) * 4) + 3,
        network4: this.i18n.sys_cof.sum.network + '-' + ((index - 1) * 4) + 4,
      };
      this.tipsData.push(obj);
    }
    if (Object.keys(data.rela).length < 5) {
      this.turnPage = true;
    } else {
      this.turnPage = false;
    }
  }
  public boundEvent(index: any) {
    this.tooltipShowManager = new TooltipShowManager(this);
    const that: any = this;
    for (let i = 1; i < 5; i++) {
      const titleName = 'networkCard' + i + '555';
      that[titleName].initSelectionById(this.el);
      for (let j = 1; j < 6; j++) {
        const hideName = 'networkCard' + i + j + j;
        that[hideName].initSelectionById(this.el);
        const strName = 'networkCard' + i + j;
        that[strName].initSelectionById(this.el);
        that[strName].selection.attr('cursor', 'pointer');
        const tipsArr: any = [];
        if (this.tipsData[index].networkTotal[(i - 1) + (index * 4)]) {
          const maxArrData = this.networkData.rela[this.tipsData[index].networkTotal[(i - 1) + (index * 4)]];
          const max = maxArrData.length;
          if (j <= (max + 1)) {
            if (j === 1) {
              const obj1 = {
                title: this.i18n.sys_summary.cpupackage_tabel.delay,
                data: this.networkData.rela.config[this.tipsData[index].networkTotal[(i - 1) + (0 * 4)]].Latency
                ? this.networkData.rela.config[this.tipsData[index].networkTotal[(i - 1) + (0 * 4)]].Latency : '--',
              };
              const obj2 = {
                title: this.i18n.sys_summary.cpupackage_tabel.NUMAnode,
                data: this.networkData.rela.config[this.tipsData[index].networkTotal[(i - 1) + (0 * 4)]].NUMAnode
                ? this.networkData.rela.config[this.tipsData[index].networkTotal[(i - 1) + (0 * 4)]].NUMAnode : '--',
              };
              const obj3 = {
                title: this.i18n.sys_summary.cpupackage_tabel.drive,
                data: this.networkData.rela.config[this.tipsData[index].networkTotal[(i - 1) + (0 * 4)]]
                .Kerneldriverinuse
                ? this.networkData.rela.config[this.tipsData[index].networkTotal[(i - 1) + (0 * 4)]]
                .Kerneldriverinuse : '--',
              };
              const obj4 = {
                title: this.i18n.sys_summary.cpupackage_tabel.model,
                data: this.networkData.rela.config[this.tipsData[index].networkTotal[(i - 1) + (0 * 4)]]
                .Kernelmodules
                ? this.networkData.rela.config[this.tipsData[index].networkTotal[(i - 1) + (0 * 4)]]
                .Kernelmodules : '--',
              };
              const obj5 = {
                title: this.i18n.sys_summary.cpupackage_tabel.equipment,
                data: this.networkData.rela.config[this.tipsData[index].networkTotal[(i - 1) + (0 * 4)]]
                .Systemperipheral
                ? this.networkData.rela.config[this.tipsData[index].networkTotal[(i - 1) + (0 * 4)]]
                .Systemperipheral : '--',
              };
              tipsArr.push(obj1, obj2, obj3, obj4, obj5);
            } else {
              const name = maxArrData[(j - 2)];
              let picEntity: {
                device: string,
                maxSpeed: string,
                'rxdrop/s': number,
                'rxkB/s': number,
                'txdrop/s': number,
                'txkB/s': number,
              };
              for (const key of Object.keys(this.networkData.pic)) {
                if (this.networkData.pic[key].device === name) {
                  const rawEntity = this.networkData.pic[key];
                  picEntity = {
                    device: rawEntity.device,
                    maxSpeed: rawEntity.max_speed,
                    'rxdrop/s': rawEntity['rxdrop/s'],
                    'rxkB/s': rawEntity['rxkB/s'],
                    'txdrop/s': rawEntity['txdrop/s'],
                    'txkB/s': rawEntity['txkB/s'],
                  };
                }
              }
              const obj1 = {
                title1: 'ID',
                data1: picEntity.device,
                title2: this.i18n.sys_summary.cpupackage_tabel.rate,
                data2: picEntity.maxSpeed
              };
              const obj2 = {
                title1: 'rxkB/s',
                data1: picEntity['rxkB/s'],
                title2: 'txkB/s',
                data2: picEntity['txkB/s']
              };
              const obj3 = {
                title1: 'txdrop/s',
                data1: picEntity['txdrop/s'],
                title2: 'rxdrop/s',
                data2: picEntity['rxdrop/s']
              };
              tipsArr.push(obj1, obj2, obj3);
            }
          } else {
            that[strName].selection.attr('display', 'none');
            that[hideName].selection.attr('display', 'none');
            that[titleName].selection.attr('display', 'none');

          }
        } else {
          that[strName].selection.attr('display', 'none');
          that[hideName].selection.attr('display', 'none');
          that[titleName].selection.attr('display', 'none');
        }

        that[strName].selection.on('mouseenter', (event: any) => {
          this.tooltipShowManager.show(that[strName].selection, i, j, tipsArr);
          that[strName].outSelection.attr('display', 'unset');
        });
        that[strName].selection.on('mouseleave', () => {
          that[strName].outSelection.attr('display', 'none');
          this.tooltipShowManager.hidden();
        });
      }
    }
  }

  // 获取网络子系统数据
  public getNetWorkData(data: any) {
    this.titleDetail = [{
      title: this.i18n.sys_cof.sum.network + '：',
      data: Object.keys(data.rela).length - 1,
    }, {
      title: this.i18n.sys_summary.cpupackage_tabel.network_port + '：',
      data: data.net_work_num ? data.net_work_num : '--',
    }];
  }
  public leftSwitch(index: any) {
    if (this.tipsData[index - 1]) {
      this.boundEvent(index - 1);
    }
  }
  public rightSwitch(index: any) {
    if (this.tipsData[index + 1]) {
      this.boundEvent(index + 1);
    }
  }
}

class TooltipShowManager {
  public ctx: NetworkSubsystemChartComponent;
  public tooltipTimer: any;

  constructor(ctx: NetworkSubsystemChartComponent) {
    this.ctx = ctx;
  }

  public show(selection: JQuery, i: any, j: any, tipsArr: any) {
    clearTimeout(this.tooltipTimer);
    if (selection.length === 0) {
      return;
    }

    const html = j === 1 ? this.ctx.netCardTipTpl : this.ctx.newPortTipTpl;

    let proportion: number;
    const proportionBottom = 0.5;
    if (i === 1 && j !== 1) {
      proportion = 0.597;
    } else if (i === 2 && j !== 1) {
      proportion = 0.524;
    } else if (i === 3 && j !== 1) {
      proportion = 0.43;
    } else if (i === 4 && j !== 1) {
      proportion = 0.332;
    } else if (i === 1 && j === 1) {
      proportion = 0.45;
    } else if (i === 2 && j === 1) {
      proportion = 0.294;
    } else if (i === 3 && j === 1) {
      proportion = 0.13;
    } else if (i === 4 && j === 1) {
      proportion = 0.1;
    }
    const warpperSelection = $(this.ctx.el.nativeElement); // TODO
    const boxTop = warpperSelection.offset().top + 5;
    const boxLeft = warpperSelection.offset().left;
    const positionData = selection.get(0).getBoundingClientRect();
    const top = positionData.top - boxTop;
    const width = positionData.width * proportion;
    const widthBottom = positionData.width * proportionBottom;
    this.ctx.niceTooltipInfo = {
      top: {
        pointX: positionData.left + width - boxLeft,
        pointY: top,
      },
      bottom: {
        pointX: positionData.left + widthBottom - boxLeft,
        pointY: positionData.top - boxTop + positionData.height + 5,
      },
      html,
      context: { tipsArr, },
    };
    this.ctx.niceTooltipShow = true;
  }

  public hidden() {
    this.ctx.niceTooltipShow = false;
  }
}

