import {
  Component,
  OnInit,
  Input,
  OnChanges,
  SimpleChanges,
  ElementRef,
  AfterViewInit
} from '@angular/core';
import { AxiosService } from 'projects/sys/src-web/app/service/axios.service';
import { MytipService } from 'projects/sys/src-web/app/service/mytip.service';
import { MessageService } from 'projects/sys/src-web/app/service/message.service';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import * as d3 from 'd3';
import { fromEvent } from 'rxjs';
import { ConfigTableService } from '../../linkage-detail/service/config-table.service';
import { TiTableColumns, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';
import { FormControl } from '@angular/forms';
import { TiSearchboxModule } from '@cloud/tiny3';
import { NONE_TYPE } from '@angular/compiler';
import { FlamegraphService } from 'sys/src-com/app/service/flamegraph.service';
@Component({
  selector: 'app-differential',
  templateUrl: './differential.component.html',
  styleUrls: ['./differential.component.scss'],
})

export class DifferentialComponent implements OnInit, OnChanges, AfterViewInit {
  public myDisabled = true;
  public disabled = true;

  public chart: any;
  public placeholder = 'please input search key';
  public value = '';
  public maxlength = 5;
  public aaControl: FormControl = new FormControl('aa');
  public myOptions: Array<any> = [];
  public mySelected1: any;
  public mySelected2: any;
  public flameJson: any;
  @Input() projectName: any;
  @Input() taskName: any;
  @Input() Active: any;
  @Input() taskid: any;
  @Input() nodeid: any;
  @Input() flame: any;
  public linkageData: TiTableSrcData;
  public configTableService: ConfigTableService;
  public hoverTimer: any;
  public updateInstans: any;
  public str: any;
  public showfire = false;
  public fireID: any;
  public i18n: any;
  public showMenu: boolean;
  public menuX: any = '0px';
  public menuY: any = '0px';
  public targetHover: any;
  public hoverFunctionName: any;
  public isStack = false;
  public obtainingFlameData = true;
  public legends: any[];
  public requestDict: any = {};
  public displayed: Array<TiTableRowData> = []; // ????????????????????????????????????????????????????????????[]?????????
  public srcData: TiTableSrcData;
  private data: Array<TiTableRowData> = [];
  public topData: any;
  public flamegraph2 = require('d3-flame-graph');
  public flamegraphService: FlamegraphService;
  constructor(
    private Axios: AxiosService,
    public mytip: MytipService,
    private msgService: MessageService,
    public i18nService: I18nService,
    private elementRef: ElementRef
  ) {
    this.i18n = this.i18nService.I18n();
  }
  public columns: Array<TiTableColumns> = [];
  public flameInfo: any = {
    queryType: null,
    taskId: null,
    baseTaskId: null,
    compareTaskId: null,
    baseNodeId: null,
    compareNodeId: null
  };
  public picData = '';
  readonly omitLabel = '...';
  ngAfterViewInit() {
    this.obtainingFlameData = false;
  }

  ngOnInit() {
    this.legends = [{ title: 'reductions', color: '#1890ff', show: true, key: 'reductions' },
    { title: 'growth', color: '#f5222d', show: true, key: 'growth' },
    { title: this.i18n.diffflamegraph.search_mark, color: '#b37feb', show: true, key: 'search mark' }];
    this.fireID = this.Axios.generateConversationId(16);

    this.getTopData();
    this.flameInfo.taskId = this.taskid;
    this.columns = [
      {
        title: this.i18n.diffflamegraph.node_name,
        width: '7%'
      },
      {
        title: this.i18n.diffflamegraph.node_ip,
        width: '7%'
      },
      {
        title: this.i18n.diffflamegraph.task_name,
        width: '8%'
      },
      {
        title: this.i18n.diffflamegraph.project_name,
        width: '8%'
      },
      {
        title: this.i18n.diffflamegraph.sample_interval,
        width: '10%'
      },
      {
        title: this.i18n.diffflamegraph.period,
        width: '10%'
      },
      {
        title: this.i18n.diffflamegraph.instruction_number,
        width: '10%'
      },
      {
        title: this.i18n.diffflamegraph.ipc,
        width: '10%'
      },
      {
        title: this.i18n.diffflamegraph.os,
        width: '20%'
      },
      {
        title: this.i18n.diffflamegraph.host_name,
        width: '10%'
      },
    ];
    this.srcData = {
      data: this.data,
      state: {
        searched: false,
        sorted: false,
        paginated: false
      }
    };
  }



  public onSelect(option: any): void {

  }

  public getTopData() {
    const params = {
      nodeId: this.nodeid,
    };
    this.Axios.axios.get('/tasks/taskcontrast/static/', {
      params: { queryType: 'hotspot', taskId: this.taskid }, headers: {
        showLoading: true,
      }
    }).then((res: any) => {

      this.topData = res.data.hotspot;
      this.myOptions.push({ label: this.omitLabel });
      this.topData.forEach((element: any) => {
        const node_name = element.node_name;
        const nodeIp = element.ip_addr;
        const taskName = element.taskname;
        const projectName = element.project;
        const sampleInterval = element.interval;
        const period = element.cycles;
        const instructionNumber = element.instructions;
        const ipc = element.ipc.toFixed(2);
        const os = element.OS;
        const hostName = element.hostname;
        const singleObj = {
          node_name,
          nodeIp,
          taskName,
          projectName,
          sampleInterval,
          period,
          instructionNumber,
          ipc,
          os,
          hostName
        };
        this.data.push(singleObj);
        const dictLabel = nodeIp + '-' + projectName + '-' + taskName;
        this.requestDict[dictLabel] = {
          task_id: element.task_id,
          nodeId: element.nodeId,
        };
        this.myOptions.push({ label: dictLabel });
      });
    });
  }

  public initSvg() {
    sessionStorage.setItem('fireID', this.fireID);
    const fireUrl = `/tasks/taskcontrast/hotspot/diff-flame/`;
    this.obtainingFlameData = true;
    this.Axios.axios.get(fireUrl, {
      headers: {
        mask: false,
        showLoading: false,
      },
      params: this.flameInfo
    })
      .then((resp: any) => {

        this.flameJson = resp.data;
        if (resp.data.children) {
          this.initChart();

          fromEvent(window, 'resize')
            .subscribe((event) => {
              let timer: any;
              const that = this;
              function debounce() {
                clearTimeout(timer);
                timer = setTimeout(() => {              // 300???????????????
                  that.initChart();
                }, 300);
              }
              debounce();
            });
        } else {
          $('#' + this.fireID).html(
            `<div style="margin-top:12%"><img style='width:16%;position:relative;
            left:42%;display:block;margin-bottom:15px'
             src='./assets/img/projects/nodata.png' />` +
            this.i18n.common_term_task_nodata +
            `</div>`
          );
        }
        this.obtainingFlameData = false;
      })
      .catch((error: any) => {
        $('#' + this.fireID).html(
          `<div style="margin-top:12%"><img
          style='width:16%;position:relative;left:42%;display:block;margin-bottom:15px'
         src='./assets/img/projects/nodata.png' />` +
          this.i18n.common_term_task_nodata +
          `</div>`
        );
        this.mytip.alertInfo({
          type: 'warn',
          content: this.i18n.tip_msg.get_flame_error,
          time: 3500,
        });
      })
      .finally(() => {
        this.obtainingFlameData = false;
      });
  }


  public onClick(event: MouseEvent): void {
    this.showfire = true;
    let flameType = null;
    if (this.flame === 'onCPU') {
      flameType = 'hotspot';
    } else if (this.flame === 'offCPU') {
      flameType = 'coldspot';
    }
    this.flameInfo = {
      query_type: flameType,
      taskId: this.taskid,
      baseTaskId: this.requestDict[this.mySelected1.label].task_id,
      compareTaskId: this.requestDict[this.mySelected2.label].task_id,
      baseNodeId: this.requestDict[this.mySelected1.label].nodeId,
      compareNodeId: this.requestDict[this.mySelected2.label].nodeId
    };
    this.initSvg();
  }

  public onNgModelChange(event: any): void {
    if (
      this.mySelected1 &&
      this.mySelected2 &&
      this.mySelected1?.label !== this.omitLabel &&
      this.mySelected2?.label !== this.omitLabel
    ) {
      this.disabled = false;
    } else {
      this.disabled = true;
    }
    this.myOptions.forEach((item) => {
      if (item.label !== this.omitLabel) {
        if (item.label === this.mySelected1?.label || item.label === this.mySelected2?.label) {
          item.disabled = true;
        } else {
          item.disabled = false;
        }
      }
    });
    if (this.mySelected1.label === this.omitLabel && this.mySelected2.label === this.omitLabel) {
      this.myOptions.forEach((item) => {
        item.disabled = false;
      });
    }
    this.myOptions = [...this.myOptions]; // ??????????????????????????????;
  }

  public onSearch(value: string) {
    if (value) {
      this.chart.search(value);
    } else {
      this.chart.clear();
    }

  }
  public onClear(event: MouseEvent): void {
    this.chart.clear();
  }
  public initChart() {
    // d3

    $('#' + this.fireID).html('');
    const data = this.flameJson;
    let width = $('.ti3-tab-content').width() * 0.85;
    if (!width) {
      width = width = $('.tab-content').width() * 0.85;
    }

    const flamegraph = this.flamegraph2
      .flamegraph()
      .width(width)
      .cellHeight(18)
      .transitionEase(d3.easeCubic)
      .minFrameSize(1)
      .selfValue(true)
      .differential(true)
      .setColorMapper(this.setColor);

    this.chart = flamegraph;
    this.flamegraphService = new FlamegraphService(this.chart, data);
    d3.select('#' + this.fireID)
      .datum(data)
      .call(flamegraph);
    this.updateInstans = flamegraph;
  }

  /**
   * ?????????????????????
   */
   setColor = (d: any) => {
    return d.highlight ? '#b37feb' : this.flamegraphService.colorHash(d);
  }
  public update() {
    this.updateInstans.update();
  }
  public listSVGRightClick() {   // ?????????????????????
    const doc: any = document;
    if (document.addEventListener) {
      document.addEventListener('DOMMouseScroll', () => { this.showMenu = false; }, false);
    }// W3C
    window.onmousewheel = doc.onmousewheel = () => { this.showMenu = false; }; // IE/Opera/Chrome
    // ?????????????????????menu
    document.onclick = () => { this.showMenu = false; }; // ????????????????????????menu
    doc.querySelectorAll('#' + this.fireID + ' svg')[0].onmouseover = (e: any) => {
      const svgWidth = this.elementRef.nativeElement.querySelector('#' + this.fireID).offsetWidth;
      let targetElE;
      const tag = e.target || e.srcElement;
      if (tag.tagName === 'rect') {
        targetElE = tag.nextSibling;
      } else {
        targetElE = tag;
      }
      if (!targetElE) { clearTimeout(this.hoverTimer); return false; }
      if (targetElE.getAttribute('class') !== 'd3-flame-graph-label') {
        clearTimeout(this.hoverTimer); return false;
      } // ?????????????????????text ??????????????????
      if (this.hoverTimer) { clearTimeout(this.hoverTimer); }

      this.showMenu = false;
      this.targetHover = targetElE;
      // ??????????????????: value???0,name??????[]??????????????????
      const ifFunction = /^\[(.*?)\]$/.test(this.targetHover.getAttribute('name'));
      this.isStack = this.targetHover.getAttribute('isStack') === 0 ||
        !this.targetHover.getAttribute('isStack') ? false : true;
      this.isStack = this.isStack && !ifFunction;
      this.hoverFunctionName = this.targetHover.getAttribute('name');
      const layOut = this.flame === 'offCPU' ? 100 : 500;
      this.hoverTimer = setTimeout(() => {
        this.showMenu = true;
        setTimeout(() => {
          this.menuY = e.clientY + 'px';
          const tipWidth = this.elementRef.nativeElement.querySelector('#flame-menu').offsetWidth;
          // ????????????tips?????????
          if (svgWidth - e.layerX + 100 < 271) {
            this.menuX = e.clientX - tipWidth + 'px';
          } else {
            this.menuX = e.clientX + 'px';
          }
        }, 0);
        this.targetHover.parentNode.onmouseleave = (v: any) => {
          const relateEle = v.relatedTarget || v.toElement;
          // ?????????????????????
          if (!(relateEle.getAttribute('id') === 'flame-menu')) {
            this.showMenu = false;
          } else {
            // ????????????tips???
            this.elementRef.nativeElement.querySelectorAll('#flame-menu')[0].onmouseleave = (t: any) => {
              this.showMenu = false;
            };
          }
        };
      }, layOut);

      return false;
    };
    // ??????svg tips??????
    this.elementRef.nativeElement.querySelectorAll('.d3-container')[0].onmouseleave = (e: any) => {
      if (e.relatedTarget && e.relatedTarget.className.indexOf('ti3-tab-active') > -1) {
        clearTimeout(this.hoverTimer);
        this.showMenu = false;
      }
    };
  }
  public clickMenu1() {
    const detail = {
      module: this.targetHover.getAttribute('module'),
      functionName: this.targetHover.getAttribute('name'),
    };

    this.msgService.sendMessage({
      function: 'openFunction',
      detail,
      taskName: this.taskName
    });
    this.showMenu = false;
    // ??????????????????????????? ??????????????????????????? #flame-menu ???display?????????none

  }
  ngOnChanges(changes: SimpleChanges): void {
    sessionStorage.setItem('fireID', this.fireID);
    if (changes.Active.currentValue) {
      setTimeout(() => {
        if (this.updateInstans) {
          this.update();
        }
      }, 50);
    }
  }
}


