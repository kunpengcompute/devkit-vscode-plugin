import { Component, Input, AfterViewInit, ChangeDetectorRef, OnInit, ElementRef,
   ViewChild, ViewEncapsulation, TemplateRef } from '@angular/core';
import { AxiosService } from 'projects/sys/src-web/app/service/axios.service';
import { SvgElementInfo } from '../../model/svg-model.model';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import * as Util from 'projects/sys/src-web/app/util';

@Component({
  selector: 'app-cpu-package-numa',
  templateUrl: './cpu-package-numa.component.html',
  styleUrls: ['./cpu-package-numa.component.scss']
})
export class CpuPackageNumaComponent implements OnInit, AfterViewInit {
  @ViewChild('cpuPackageWarpper', { static: true, read: ElementRef }) el: ElementRef;
  @ViewChild('l3CacheTip', { static: true, read: TemplateRef }) l3CacheTipTpl: TemplateRef<any>;
  @ViewChild('cpuCoreTip', { static: true, read: TemplateRef }) cpuCoreTipTpl: TemplateRef<any>;

  @Input() cpuPackageData: any;
  @Input() cpuName: any;
  public i18n: any;
  public titleDetail: any = [];


  public numa1row1col1 = new SvgElementInfo(); // numa1第一排 左边数1到8
  public numa1row1col2 = new SvgElementInfo(); // numa1第一排第二个
  public numa1row1col3 = new SvgElementInfo(); // numa1第一排第三个
  public numa1row1col4 = new SvgElementInfo(); // numa1第一排第四个
  public numa1row1col5 = new SvgElementInfo(); // numa1第一排第五个
  public numa1row1col6 = new SvgElementInfo(); // numa1第一排第六个
  public numa1row1col7 = new SvgElementInfo(); // numa1第一排第七个
  public numa1row1col8 = new SvgElementInfo(); // numa1第一排第八个

  public numa1row2col1 = new SvgElementInfo(); // numa1第二排 左边数1到8
  public numa1row2col2 = new SvgElementInfo(); // numa1第二排第二个
  public numa1row2col3 = new SvgElementInfo(); // numa1第二排第三个
  public numa1row2col4 = new SvgElementInfo(); // numa1第二排第四个
  public numa1row2col5 = new SvgElementInfo(); // numa1第二排第五个
  public numa1row2col6 = new SvgElementInfo(); // numa1第二排第六个
  public numa1row2col7 = new SvgElementInfo(); // numa1第二排第七个
  public numa1row2col8 = new SvgElementInfo(); // numa1第二排第八个

  public numa1row3col1 = new SvgElementInfo(); // numa1第三排 左边数1到8
  public numa1row3col2 = new SvgElementInfo();
  public numa1row3col3 = new SvgElementInfo();
  public numa1row3col4 = new SvgElementInfo();
  public numa1row3col5 = new SvgElementInfo();
  public numa1row3col6 = new SvgElementInfo();
  public numa1row3col7 = new SvgElementInfo();
  public numa1row3col8 = new SvgElementInfo();

  public numa1row4col1 = new SvgElementInfo(); // numa1第四排 左边数1到8
  public numa1row4col2 = new SvgElementInfo();
  public numa1row4col3 = new SvgElementInfo();
  public numa1row4col4 = new SvgElementInfo();
  public numa1row4col5 = new SvgElementInfo();
  public numa1row4col6 = new SvgElementInfo();
  public numa1row4col7 = new SvgElementInfo();
  public numa1row4col8 = new SvgElementInfo();
  public numa1row5col1 = new SvgElementInfo(); // numa1第五排最宽的那个

  public numa2row1col1 = new SvgElementInfo(); // numa2第一排 左边数1到8
  public numa2row1col2 = new SvgElementInfo();
  public numa2row1col3 = new SvgElementInfo();
  public numa2row1col4 = new SvgElementInfo();
  public numa2row1col5 = new SvgElementInfo();
  public numa2row1col6 = new SvgElementInfo();
  public numa2row1col7 = new SvgElementInfo();
  public numa2row1col8 = new SvgElementInfo();

  public numa2row2col1 = new SvgElementInfo(); // numa2第二排 左边数1到8
  public numa2row2col2 = new SvgElementInfo();
  public numa2row2col3 = new SvgElementInfo();
  public numa2row2col4 = new SvgElementInfo();
  public numa2row2col5 = new SvgElementInfo();
  public numa2row2col6 = new SvgElementInfo();
  public numa2row2col7 = new SvgElementInfo();
  public numa2row2col8 = new SvgElementInfo();

  public numa2row3col1 = new SvgElementInfo(); // numa2第三排 左边数1到8
  public numa2row3col2 = new SvgElementInfo();
  public numa2row3col3 = new SvgElementInfo();
  public numa2row3col4 = new SvgElementInfo();
  public numa2row3col5 = new SvgElementInfo();
  public numa2row3col6 = new SvgElementInfo();
  public numa2row3col7 = new SvgElementInfo();
  public numa2row3col8 = new SvgElementInfo();

  public numa2row4col1 = new SvgElementInfo(); // numa2第四排 左边数1到8
  public numa2row4col2 = new SvgElementInfo();
  public numa2row4col3 = new SvgElementInfo();
  public numa2row4col4 = new SvgElementInfo();
  public numa2row4col5 = new SvgElementInfo();
  public numa2row4col6 = new SvgElementInfo();
  public numa2row4col7 = new SvgElementInfo();
  public numa2row4col8 = new SvgElementInfo();
  public numa2row5col1 = new SvgElementInfo(); // numa2第五排最宽的那个

  public numa3row1col1 = new SvgElementInfo(); // numa3第一排 左边数1到8
  public numa3row1col2 = new SvgElementInfo();
  public numa3row1col3 = new SvgElementInfo();
  public numa3row1col4 = new SvgElementInfo();
  public numa3row1col5 = new SvgElementInfo();
  public numa3row1col6 = new SvgElementInfo();
  public numa3row1col7 = new SvgElementInfo();
  public numa3row1col8 = new SvgElementInfo();

  public numa3row2col1 = new SvgElementInfo(); // numa3第二排 左边数1到8
  public numa3row2col2 = new SvgElementInfo();
  public numa3row2col3 = new SvgElementInfo();
  public numa3row2col4 = new SvgElementInfo();
  public numa3row2col5 = new SvgElementInfo();
  public numa3row2col6 = new SvgElementInfo();
  public numa3row2col7 = new SvgElementInfo();
  public numa3row2col8 = new SvgElementInfo();

  public numa3row3col1 = new SvgElementInfo(); // numa3第三排 左边数1到8
  public numa3row3col2 = new SvgElementInfo();
  public numa3row3col3 = new SvgElementInfo();
  public numa3row3col4 = new SvgElementInfo();
  public numa3row3col5 = new SvgElementInfo();
  public numa3row3col6 = new SvgElementInfo();
  public numa3row3col7 = new SvgElementInfo();
  public numa3row3col8 = new SvgElementInfo();

  public numa3row4col1 = new SvgElementInfo(); // numa3第四排 左边数1到8
  public numa3row4col2 = new SvgElementInfo();
  public numa3row4col3 = new SvgElementInfo();
  public numa3row4col4 = new SvgElementInfo();
  public numa3row4col5 = new SvgElementInfo();
  public numa3row4col6 = new SvgElementInfo();
  public numa3row4col7 = new SvgElementInfo();
  public numa3row4col8 = new SvgElementInfo();
  public numa3row5col1 = new SvgElementInfo(); // numa3第五排最宽的那个

  public numa4row1col1 = new SvgElementInfo(); // numa4第四排 左边数1到8
  public numa4row1col2 = new SvgElementInfo();
  public numa4row1col3 = new SvgElementInfo();
  public numa4row1col4 = new SvgElementInfo();
  public numa4row1col5 = new SvgElementInfo();
  public numa4row1col6 = new SvgElementInfo();
  public numa4row1col7 = new SvgElementInfo();
  public numa4row1col8 = new SvgElementInfo();

  public numa4row2col1 = new SvgElementInfo(); // numa4第二排 左边数1到8
  public numa4row2col2 = new SvgElementInfo();
  public numa4row2col3 = new SvgElementInfo();
  public numa4row2col4 = new SvgElementInfo();
  public numa4row2col5 = new SvgElementInfo();
  public numa4row2col6 = new SvgElementInfo();
  public numa4row2col7 = new SvgElementInfo();
  public numa4row2col8 = new SvgElementInfo();

  public numa4row3col1 = new SvgElementInfo(); // numa4第三排 左边数1到8
  public numa4row3col2 = new SvgElementInfo();
  public numa4row3col3 = new SvgElementInfo();
  public numa4row3col4 = new SvgElementInfo();
  public numa4row3col5 = new SvgElementInfo();
  public numa4row3col6 = new SvgElementInfo();
  public numa4row3col7 = new SvgElementInfo();
  public numa4row3col8 = new SvgElementInfo();

  public numa4row4col1 = new SvgElementInfo(); // numa4第四排 左边数1到8
  public numa4row4col2 = new SvgElementInfo();
  public numa4row4col3 = new SvgElementInfo();
  public numa4row4col4 = new SvgElementInfo();
  public numa4row4col5 = new SvgElementInfo();
  public numa4row4col6 = new SvgElementInfo();
  public numa4row4col7 = new SvgElementInfo();
  public numa4row4col8 = new SvgElementInfo();
  public numa4row5col1 = new SvgElementInfo(); // numa4第五排最宽的那个
  public turnPage = false;

  // tooltip
  public tooltipShowManager: TooltipShowManager;
  public svgData: any = [];
  public niceTooltipInfo: {
    html: TemplateRef<any>,
    context: { tipsArr: [] },
    top: { pointX: number, pointY: number },
    bottom: { pointX: number, pointY: number }
  };
  public tipsData: any = []; // 提示数据
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
    this.cpuPackageData = this.cpuPackageData[this.cpuName];
    if (JSON.stringify(this.cpuPackageData) !== '{}') {
      this.getCpuPackageData(this.cpuPackageData);
      this.getTipsData(this.cpuPackageData);
    }
  }

  ngAfterViewInit(): void {
    // 兼容IE11
    const doc: any = document;
    if (/*@cc_on!@*/false || !!doc.documentMode) {
      $(this.el.nativeElement.querySelector('svg')).attr({ width: 1371, height: 443 });
    }
    this.boundEvent(0);
  }
  public boundEvent(index: any) {
    this.tooltipShowManager = new TooltipShowManager(this);
    let idleCount = 0;
    const that: any = this;
    for (let a = 1; a < 5; a++) {
      for (let i = 1; i < 6; i++) {
        for (let j = 1; j < 9; j++) {
          const strName = 'numa' + a + 'row' + i + 'col' + j;
          that[strName].initSelectionById(this.el);
          const tipsArr: any = [];
          if (i === 5) {
            const obj = {
              title: this.i18n.sys_cof.sum.raid_info.raid_size,
              data: Util.fixThouSeparator(this.cpuPackageData.l3[0])
            };
            const obj2 = {
              title: this.i18n.sys_summary.cpupackage_tabel.L3,
              data: a < 3 ? this.tipsData[index].numa1 + ' ' + this.tipsData[index].numa2
              : this.tipsData[index].numa3 + ' ' + this.tipsData[index].numa4
            };
            tipsArr.push(obj, obj2);
          }
          const iData = Math.ceil(this.tipsData[index].core / 8);
          const jData = this.tipsData[index].core % 8 === 0 ? 8 : this.tipsData[index].core % 8;
          if (i <= iData && j <= jData && i !== 5) {
            const obj1 = {
              title1: 'ID',
              data1: this.cpuPackageData.model.implementer,
              title2: this.i18n.sys_cof.sum.cpu_info.cpu_max_hz,
              data2: Util.fixThouSeparator(a === 1 || a === 2 ? this.cpuPackageData.core.cpu.max_freq[0]
                : this.cpuPackageData.core.cpu.max_freq[1]),
            };
            const obj2 = {
              title1: this.i18n.sys_cof.sum.cpu_info.cpu_cur_hz,
              data1: Util.fixThouSeparator(a === 1 || a === 2 ? this.cpuPackageData.core.cpu.current_freq[0]
                : this.cpuPackageData.core.cpu.current_freq[1]),
              title2: 'L1l',
              data2: Util.fixThouSeparator(this.cpuPackageData.core.l1i[0] ? this.cpuPackageData.core.l1i[0] : '--')
            };
            const obj3 = {
              title1: 'L2',
              data1: Util.fixThouSeparator(this.cpuPackageData.core.l2[0] ? this.cpuPackageData.core.l2[0] : '--'),
              title2: 'L1D',
              data2: Util.fixThouSeparator(this.cpuPackageData.core.l1d[0] ? this.cpuPackageData.core.l1d[0] : '--'),
            };
            const idleValues = Object.values(this.cpuPackageData.core.idle);
            const obj4 = {
              title1: '%idle',
              data1: Util.fixThouSeparator(idleValues[idleCount++] as string),
              title2: '',
              data2: ''
            };

            tipsArr.push(obj1, obj2, obj3, obj4);

          } else if (i !== 5) {
            that[strName].selection.attr('display', 'none');
          }
          that[strName].selection.on('mouseenter', (event: any) => {
            this.tooltipShowManager.show(that[strName].selection, i, tipsArr);
            that[strName].outSelection.attr('display', 'unset');
          });
          that[strName].selection.on('mouseleave', () => {
            this.tooltipShowManager.hidden();
            that[strName].outSelection.attr('display', 'none');
          });
          if (i === 5) {      // 第五排只有一个，所以执行一次之后就结束当前循环，接着执行后面的循环
            break;
          }
        }
      }
    }
  }

  // 获取 cpu package数据
  public getCpuPackageData(data: any) {
    this.titleDetail = [{
      title: this.i18n.sys.cpuType,
      data: data.core.cpu.type[0],
    },
    {
      title: this.i18n.sys_cof.sum.cpu_info.cpu_max_hz + '：',
      data: data.core.cpu.max_freq[0] || '--',
    },
    {
      title: this.i18n.sys_cof.sum.cpu_info.cpu_cur_hz + '：',
      data: data.core.cpu.current_freq[0] || '--',
    },
    {
      title: this.i18n.sys.coreNum,
      data: data.core.cpu.cores[0],
    },
    ];
  }
  public getTipsData(data: any) {
    const index = Math.ceil(data.numa_info.numa_node.name.length / 4);
    for (let i = 0; i < index; i++) {
      const dataLength = data.numa_info.numa_node.cpu_core[i * 4];
      const length = dataLength.split(' ').length;
      const obj = {
        svgShow: i === 0 ? true : false,
        numa1: data.numa_info.numa_node.name[i * 4],
        numa2: data.numa_info.numa_node.name[(i * 4) + 1],
        numa3: data.numa_info.numa_node.name[(i * 4) + 2],
        numa4: data.numa_info.numa_node.name[(i * 4) + 3],
        core: length
      };
      this.tipsData.push(obj);
    }
    if (this.tipsData.length <= 1) {
      this.turnPage = true;
    } else {
      this.turnPage = false;
    }
  }

  public leftSwitch(index: any) {
    if (this.tipsData[index - 1]) {
      this.tipsData[index].svgShow = false;
      this.tipsData[index - 1].svgShow = true;
      this.boundEvent(index - 1);
    }
  }
  public rightSwitch(index: any) {
    if (this.tipsData[index + 1]) {
      this.tipsData[index].svgShow = false;
      this.tipsData[index + 1].svgShow = false;
      this.boundEvent(index + 1);
    }
  }

}
class TooltipShowManager {
  public ctx: CpuPackageNumaComponent;
  public tooltipTimer: any;

  constructor(ctx: CpuPackageNumaComponent) {
    this.ctx = ctx;
  }

  public show(selection: JQuery, i: any, tipsArr: any) {
    if (selection.length === 0) {
      return;
    }
    const html = i === 5 ? this.ctx.l3CacheTipTpl : this.ctx.cpuCoreTipTpl;
    const warpperSelection = $(this.ctx.el.nativeElement);
    const boxTop = warpperSelection.offset().top + 5;
    const boxLeft = warpperSelection.offset().left;
    const positionData = selection.get(0).getBoundingClientRect();
    const width = positionData.width / 2;
    const widthBottom = positionData.width / 2;
    this.ctx.niceTooltipInfo = {
      top: {
        pointX: positionData.left + width - boxLeft,
        pointY: positionData.top - boxTop
      },
      bottom: {
        pointX: positionData.left + widthBottom - boxLeft,
        pointY: positionData.top - boxTop + positionData.height + 5
      },
      html,
      context: { tipsArr },
    };
    this.ctx.niceTooltipShow = true;
  }

  public hidden() {
    this.ctx.niceTooltipShow = false;
  }
}
