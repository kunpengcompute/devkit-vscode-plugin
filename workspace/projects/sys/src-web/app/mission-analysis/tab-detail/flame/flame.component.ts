import {
  Component,
  OnInit,
  Input,
  OnChanges,
  SimpleChanges,
  ElementRef
} from '@angular/core';
import { AxiosService } from 'projects/sys/src-web/app/service/axios.service';
import { MytipService } from 'projects/sys/src-web/app/service/mytip.service';
import { MessageService } from 'projects/sys/src-web/app/service/message.service';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import * as d3 from 'd3';
import { select } from 'd3-selection';
import { fromEvent } from 'rxjs';
@Component({
  selector: 'app-flame',
  templateUrl: './flame.component.html',
  styleUrls: ['./flame.component.scss'],
})
export class FlameComponent implements OnInit, OnChanges {
  private flamegraph = require('d3-flame-graph');
  public flameJson: any;

  @Input() projectName: any;
  @Input() taskName: any;
  @Input() Active: any;
  @Input() taskid: any;
  @Input() nodeid: any;
  @Input() flame: any;
  public hoverTimer: any;
  public updateInstans: any;
  public str: any;
  public showfire = true;
  public fireID: any;
  public i18n: any;
  public showMenu: boolean;
  public menuX: any = '0px';
  public menuY: any = '0px';
  public targetHover: any;
  public hoverFunctionName: any;
  public isStack = false;
  public obtainingFlameData = true;
  constructor(
    private Axios: AxiosService,
    public mytip: MytipService,
    private msgService: MessageService,
    public i18nService: I18nService,
    private elementRef: ElementRef
  ) {
    this.i18n = this.i18nService.I18n();
  }
  public picData = '';
  ngOnInit() {
    this.initSvg();
  }
  public initSvg() {
    this.fireID = this.Axios.generateConversationId(16);
    sessionStorage.setItem('fireID', this.fireID);
    const fireUrl =
      `/tasks/${encodeURIComponent(this.taskid)}/common/flame-graph/?node-id=${this.nodeid}&query-type=${this.flame}`;
    this.Axios.axios
      .get(fireUrl, {
        headers: {
          mask: false,
          showLoading: false,
        }
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
                timer = setTimeout(() => {              // 300毫秒的防抖
                  that.initChart();
                }, 300);
              }
              debounce();
            });
        } else {
          $('#' + this.fireID).html(
            `<div style="margin-top:12%"><img style='width:16%;
            position:relative;left:42%;display:block;margin-bottom:15px'
             src='./assets/img/projects/nodata.png' />` +
            this.i18n.common_term_task_nodata +
            `</div>`
          );
        }
      })
      .catch((error: any) => {
        $('#' + this.fireID).html(
          `<div style="margin-top:12%"><img style='width:16%;
          position:relative;left:42%;display:block;margin-bottom:15px'
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


  public initChart() {
    // d3
    $('#' + this.fireID).html('');
    const data = this.flameJson;
    const width = $('#user-guide-scroll').width() * 0.85;
    const flamegraph = this.flamegraph
      .flamegraph()
      .width(width)
      .cellHeight(18)
      .transitionEase(d3.easeCubic)
      .minFrameSize(1)
      .selfValue(true)
      .onClick((d: any) => {
        this.setTip();
      });
    if (this.flame !== 'onCPU') {
      flamegraph
        .setColorMapper((d: any) => '#0925F6');
    }
    d3.select('#' + this.fireID)
      .datum(data)
      .call(flamegraph);
    this.updateInstans = flamegraph;
    this.setTip();
  }
  private setTip() {
    const that = this;
    that.updateInstans.tooltip(false);
    that.updateInstans.setLabelHandler((d: any) => '');
    const g = d3.select('#' + this.fireID).selectAll('g');
    g.select('foreignObject')
      .each(function(d: any) {
        select(this).attr('label', '');
        select(this).attr('name', d.data.name || '--');
        select(this).attr('isStack', d.data.value || '');
        select(this).attr('module', d.data.module || '');
      });
    this.listSVGRightClick();
  }
  public update() {
    this.updateInstans.update();
    this.setTip();
  }
  public listSVGRightClick() {   // 火焰图右键菜单
    const doc: any = document;
    if (document.addEventListener) {
      document.addEventListener('DOMMouseScroll', () => { this.showMenu = false; }, false);
    }// W3C
    window.onmousewheel = doc.onmousewheel = () => { this.showMenu = false; }; // IE/Opera/Chrome
    // 鼠标滚动时隐藏menu
    document.onclick = () => { this.showMenu = false; }; // 鼠标点击页面隐藏menu
    doc.querySelectorAll('#' + this.fireID + ' svg')[0].onmouseover = (e: any) => {
      this.showMenu = false;
      const svgWidth = this.elementRef.nativeElement.querySelector('#' + this.fireID).offsetWidth;
      let targetElE;
      const tag = e.target || e.srcElement;
      if (tag.tagName === 'rect' || tag.tagName === 'title') {
        targetElE = tag.parentNode.querySelector('foreignObject');
      } else if (tag.getAttribute('class') === 'd3-flame-graph-label') {
        targetElE = tag.parentNode;
      } else {
        targetElE = tag;
      }
      if (!targetElE) { clearTimeout(this.hoverTimer); return false; }
      if (targetElE.tagName !== 'foreignObject') {
        clearTimeout(this.hoverTimer); return false;
      } // 如果右键的不是text 则不出现菜单
      if (this.hoverTimer) { clearTimeout(this.hoverTimer); }

      this.targetHover = targetElE;
      // 栈顶函数判断: value为0,name含有[]不能查看详情
      const ifFunction = /^\[(.*?)\]$/.test(this.targetHover.getAttribute('name'));
      this.isStack = this.targetHover.getAttribute('isStack') === 0
        || !this.targetHover.getAttribute('isStack') ? false : true;
      this.isStack = this.isStack && !ifFunction;
      this.hoverFunctionName = this.targetHover.getAttribute('name');
      const layOut = this.flame === 'offCPU' ? 100 : 500;
      this.hoverTimer = setTimeout(() => {
        setTimeout(() => {
          this.menuY = e.clientY + 'px';
          const tipWidth = this.elementRef.nativeElement.querySelector('#flame-menu')?.offsetWidth;
          // 防止右侧tips框折行
          if (svgWidth - e.layerX + 100 < 271) {
            this.menuX = e.clientX - tipWidth + 'px';
          } else {
            this.menuX = e.clientX + 'px';
          }
          this.showMenu = true;
        }, 0);
        this.targetHover.parentNode.onmouseleave = (v: any) => {
          const relateEle = v.relatedTarget || v.toElement;
          // 鼠标移出函数块
          if (!(relateEle.getAttribute('id') === 'flame-menu')) {
            this.showMenu = false;
          } else {
            // 鼠标移出tips框
            this.elementRef.nativeElement.querySelectorAll('#flame-menu')[0].onmouseleave = (t: any) => {
              this.showMenu = false;
            };
          }
        };
      }, layOut);

      return false;
    };
    // 移出svg tips隐藏
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
    // 调用自己的业务代码 业务代码最后需要将 #flame-menu 的display设置为none

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
