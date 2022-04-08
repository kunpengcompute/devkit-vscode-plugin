import {
  Component, OnInit, Input, AfterViewInit, SecurityContext,
  ViewContainerRef, TemplateRef, ElementRef, ViewChild,
  ChangeDetectorRef
} from '@angular/core';
import { TiTableColumns, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';
import { TableService } from 'sys/src-com/app/service/table.service';
import { DomSanitizer } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { I18n } from 'sys/locale';
import { TipService } from 'sys/src-com/app/service';
import * as Utils from 'projects/sys/src-com/app/util';

interface IFunctionDetails { // 函数详情
  sourceCode: { // 源代码
    data: any[],  // 表格数据
    message: string
  };
  assemblyCode: { // 汇编代码
    data: any[],  // 表格数据
    hasCodeBlock?: boolean,  // 是否有代码块【跳转代码块功能】【暂时只有Miss事件没有，所以值为false才表示没有， 默认不传表示有】
  };
  codeStream?: {  // 代码流【undefined表示没有代码流图】
    svgpath: any,  // 代码流的svg图
    graph_status?: { // 状态
      status: any,  // 是1的时候表示没有代码流图且后端返回原因
      info_cn: string,  // 没有代码流图时的显示词【中文】
      info_en: string,  // 没有代码流图时的显示词【英文】
    },
  };
}

@Component({
  selector: 'app-net-capture-source',
  templateUrl: './net-capture-source.component.html',
  styleUrls: ['./net-capture-source.component.scss']
})
export class NetCaptureSourceComponent implements OnInit, AfterViewInit {

  @ViewChild('assembleVisible', { static: true, read: ElementRef })
  private assembleVisible: ElementRef;
  @ViewChild('assembleContainer', { static: true, read: ViewContainerRef })
  private assembleContainer: ViewContainerRef;
  @ViewChild('assembleItem', { static: true, read: TemplateRef })
  private assembleItem: TemplateRef<any>;

  @Input() headers?: [{  // 头部，可以不传，表示没有
    label: string,
    content: string,
  }];
  @Input()
  get functionDetails() {
    return this.functionDetailsStash;
  }
  set functionDetails(val: IFunctionDetails) {
    this.functionDetailsStash = val;
    if (val != null) {
      // 源代码无数据原因
      this.sourceData.noData = val.sourceCode.message == null
        ? I18n.common_term_task_nodata
        : I18n.common_term_task_tab_function_source_file_path;
    }
  }

  boxID: any;
  svgScale = 1; // svg缩放倍数
  i18n: any;
  demandLoadInfo: {
    container: ViewContainerRef;
    template: TemplateRef<any>;
    visibleArea: ElementRef;
  };

  /**
   * 源代码表格
   */
  public sourceData: any = {
    currentRow: undefined,
    activeRow: [],  // 通过行号选择时可能有多个高亮的行
    displayed: ([] as Array<TiTableRowData>),
    srcData: ({} as TiTableSrcData),
    columns: ([] as Array<TiTableColumns>),
    noData: ''
  };

  /**
   * 汇编代码
   */
  public assemblerData: any = {
    currentRow: undefined,
    activeRow: [],  // 通过行号选择时可能有多个高亮的行
    nonZeroBlock: [], // 数量不为0的代码块【点击汇编代码的上一个/下一个代码块使用】
    hasLastBlock: false,  // 是否有上一个可跳转的代码块
    hasNextBlock: false,  // 是否有下一个可跳转的代码块
    displayed: ([] as Array<TiTableRowData>),
    srcData: ({} as TiTableSrcData),
    columns: ([] as Array<TiTableColumns>),
    loadData: []
  };
  public isFold = false;
  private functionDetailsStash: IFunctionDetails;

  private assemblerDataIterator: IterableIterator<any[]>;
  private assembleDemandSource: Subject<any[]>;

  constructor(
    public mytip: TipService,
    public tableService: TableService,
    private domSanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef
  ) {

    this.sourceData.columns = [
      { label: I18n.common_term_task_tab_function_source_line, prop: 'line', width: '20%' },
      { label: I18n.common_term_task_tab_function_source_code, prop: 'line_code', width: '60%' },
      { label: I18n.common_term_task_tab_function_count, prop: 'countAndProportion', width: '20%', sortKey: 'count' },
    ];
    this.sourceData.srcData = {
      data: [],
      state: {
        searched: false, // 源数据未进行搜索处理
        sorted: false, // 源数据未进行排序处理
        paginated: false // 源数据未进行分页处理
      }
    };

    this.assemblerData.columns = [
      { label: '', width: '40px' },
      { label: I18n.common_term_task_tab_function_assembley_address, prop: 'offset',  width: '120px' },
      { label: I18n.common_term_task_tab_function_assembley_line, prop: 'line', width: '90px' },
      { label: I18n.common_term_task_tab_function_assembley_code, prop: 'ins' },
      { label: I18n.common_term_task_tab_function_count, prop: 'CPU_CYCLES',  width: '120px', sortKey: 'count' },
    ];
    this.assemblerData.srcData = {
      data: [],
      state: {
        searched: false, // 源数据未进行搜索处理
        sorted: false, // 源数据未进行排序处理
        paginated: false // 源数据未进行分页处理
      }
    };
  }
  /**
   * ngOnInit
   */
  ngOnInit(): void {
    this.boxID = Utils.generateConversationId(16);
    this.demandLoadInfo = {
      container: this.assembleContainer,
      template: this.assembleItem,
      visibleArea: this.assembleVisible
    };

    // 源代码
    this.sourceData.srcData.data = this.functionDetails.sourceCode.data;
    // 汇编代码
    this.formatTreeData(this.functionDetails.assemblyCode.data);
  }

  ngAfterViewInit() {
    // 代码流
    if (this.functionDetails.codeStream) {
      const status = this.functionDetails.codeStream.graph_status;

      if (status && status.status === 1) {
        this.setSvgNoData(sessionStorage.getItem('language') === 'zh-cn' ? status.info_cn : status.info_en);
      } else if (this.functionDetails.codeStream.svgpath) {
        this.initSvg(this.functionDetails.codeStream.svgpath);
      } else {
        this.setSvgNoData(I18n.common_term_task_nodata2);
      }
    }
  }

  // 高亮源代码表格
  public highlightSourceCodeTr({ line, row, scrollIntoView = false }: {
    line?: any,  // 通过行号寻找要高亮的行【点击汇编代码和代码流的方块是通过这个】
    row?: any,  // 直接传递要高亮的行【自身表格点击高亮是通过这个，因为伪共享分析存在行号重复的情况】
    scrollIntoView?: boolean,  // 是否需要滚动至可视区域内【点击表格高亮不需要】【点击代码流需要】
  }) {
    this.sourceData.activeRow.forEach((row1: any) => row1.active = false);
    this.sourceData.activeRow = [];

    if (row !== undefined) {
      row.active = true;
      this.sourceData.activeRow = [row];
    } else if (line !== undefined) {
      this.sourceData.srcData.data.forEach((item: any) => {
        if (item.line === line) {
          item.active = true;
          this.sourceData.activeRow.push(item);
        }
      });
    }

    this.sourceData.currentRow = this.sourceData.activeRow[0];
    if (scrollIntoView && this.sourceData.currentRow) {
      const target = document.querySelector(
        `#${this.boxID} .source-left #${this.sourceData.currentRow.id}`) as HTMLElement;
      const scroll = () => {
        $(`#${this.boxID} .source-left .ti3-table-container`).animate({
          scrollTop: target.offsetTop
        }, 50);
      };
      setTimeout(scroll, 200);
    }
  }


  // -- 格式化汇编代码数据 --
  public formatTreeData(data: any) {
    // 添加代码块索引和id
    data.forEach((item: any, index: any) => {
      item.blockIndex = index;
      item.id = `asm_${index}`;

      if (item.children) {
        const childrenLength = item.children.length;

        item.children.forEach((child: any, childIndex: any) => {
          child.blockIndex = index + (childIndex + 1) / (childrenLength + 1);
          child.id = `asm_${index}_${child.blockIndex}`;
        });

        item.showChildren = false;
        item.trackId = Utils.generateConversationId(8);
      }
    });
    this.assemblerDataIterator = Utils.sliceArray(data, 10, 15);
    this.assemblerData.srcData.data = data;
    this.assemblerData.nonZeroBlock = data.filter((item: any) => (item.ins.indexOf('Basic Block') > -1) && item.count);
    this.assemblerData.hasLastBlock = !!this.assemblerData.nonZeroBlock.length;
    this.assemblerData.hasNextBlock = !!this.assemblerData.nonZeroBlock.length;
  }

  // 高亮汇编代码表格
  public highlightAssemblerCodeTr({ line, row, scrollIntoView = false }: {
    line?: any,  // 通过行号寻找要高亮的行【点击源代码是通过这个】
    row?: any,  // 直接传递要高亮的行【点击代码流和自身表格点击高亮是通过这个】
    scrollIntoView?: boolean,  // 是否需要滚动至可视区域内【点击表格高亮不需要】【点击代码流需要】
  }) {
    this.assemblerData.activeRow.forEach((row2: any) => row2.active = false);
    this.assemblerData.activeRow = [];

    if (row !== undefined) {
      row.active = true;
      this.assemblerData.activeRow = [row];
    } else if (line !== undefined) {
      this.assemblerData.srcData.data.forEach((item: any) => {
        if (item.line === line && item.ins.indexOf('Basic') > -1) {
          item.active = true;
          this.assemblerData.activeRow.push(item);
        }
      });
    }

    this.assemblerData.currentRow = this.assemblerData.activeRow[0];
    if (this.assemblerData.nonZeroBlock.length) {
      this.assemblerData.hasLastBlock =
        this.assemblerData.currentRow.blockIndex > this.assemblerData.nonZeroBlock[0].blockIndex;
      this.assemblerData.hasNextBlock =
        this.assemblerData.currentRow.blockIndex < this.assemblerData.nonZeroBlock.slice(-1)[0].blockIndex;
    }

    if (scrollIntoView && this.assemblerData.currentRow) {
      // 如果当前列表不存在，先创建
      const jumpToBlockId = this.assemblerData.currentRow.id;
      let hasJumpBlock = (this.assemblerData.loadData as []).some((item: any) => {
        return item.id === jumpToBlockId;
      });
      const tempLoadData = [];
      while (!hasJumpBlock) {
        const segment = this.assemblerDataIterator.next();
        const segmentValue: any[] = segment.value || [];
        tempLoadData.push(...segmentValue);
        hasJumpBlock = segment.done || segmentValue.some((item: any) => {
          return item.id === jumpToBlockId;
        });
      }
      tempLoadData.push(...(this.assemblerDataIterator.next().value || []));
      this.assembleDemandSource.next(tempLoadData);
      const target = document.querySelector(`#${this.boxID} .assembly-right #${jumpToBlockId}`) as HTMLElement;
      setTimeout(() => {
        $(`#${this.boxID} .assembly-right .ti3-table-container`).animate({
          scrollTop: target.offsetTop
        }, 50);
      }, 500);
    }
  }

  /**
   *  上一个/下一个代码块【只跳转是代码块且有数量不为0的】
   */
  public preBlock(dirction: any) {
    if ((!this.assemblerData.hasLastBlock && dirction === 'pre')
      || (!this.assemblerData.hasNextBlock && dirction === 'next')) {
      return;
    }
    const nonZeroBlock = this.assemblerData.nonZeroBlock;
    let block: { ins: string | any[]; line: any; };

    if (this.assemblerData.currentRow) {
      const currentIndex = this.assemblerData.currentRow.blockIndex;

      if (dirction === 'pre') {
        for (let index = nonZeroBlock.length - 1; index >= 0; index--) {
          if (nonZeroBlock[index].blockIndex < currentIndex) {
            block = nonZeroBlock[index];
            break;
          }
        }
      } else {
        for (const key of nonZeroBlock) {
          if (key.blockIndex > currentIndex) {
            block = key;
            break;
          }
        }
      }
    } else {  // 表格中没有选中的，跳至第一个有数量的代码块
      block = this.assemblerData.nonZeroBlock[0];
    }

    if (block) {
      this.highlight(block);
    }
  }

  /**
   * 高亮源代码界面、汇编代码界面、代码流界面
   */
  public highlight(row: { line: any; ins: string | any[]; }) {
    // 高亮源代码界面、汇编代码界面
    this.highlightAssemblerCodeTr({ row, scrollIntoView: true });
    this.highlightSourceCodeTr({ line: row.line, scrollIntoView: true });

    // 高亮代码流界面
    const list = document.getElementsByClassName('node');
    const self = this;
    Array.prototype.forEach.call(list, (i: any) => {
      const ins = i.children[0].innerHTML || i.children[0].textContent;
      if (ins && row.ins.indexOf(ins) > -1) {
        $('#' + self.boxID + ' svg .node').removeAttr('stroke-dasharray');
        $('#' + self.boxID + ' svg .node').attr('stroke-width', 1);
        i.setAttribute('stroke-dasharray', '4');
        i.setAttribute('stroke-width', 3);
      }
    });
  }

  /**
   *  代码流 --
   */
  public initSvg(svgpath: any) {
    $('#' + this.boxID + ' #insvg').html(svgpath);
    (document.querySelector(`#${this.boxID} #insvg`) as any).onmousewheel = (e: any) => {
      this.mouseScale(e);
      e.preventDefault();
    };

    setTimeout(() => {
      $('#' + this.boxID + ' svg').attr(
        'width',
        $('#' + this.boxID + ' #source-img')[0].offsetWidth - 22 + 'px'
      );
      $('#' + this.boxID + ' svg').removeAttr('height');
      this.resizeSvg();
      this.listenSvg();
      this.listenSvgClick();

      // 修改svg样式适配暗主题
      const background: any = document.querySelector('#insvg>svg>g>polygon');
      const nodes = document.querySelectorAll('#insvg>svg>g>g.node');
      const edges = document.querySelectorAll('#insvg>svg>g>g.edge');
      const colorTheme = 'dark';
      const colors = {  // light就是接口返回的类型
          background: { // 背景
              light: { fill: '#ffffff' },
              dark: { fill: 'transparent' },
          },
          block: {
              BasicBlock: { // 黄色代码块
                  light: { polygonFill: '#ffffcc', textFill: '#000000' },
                  dark: { polygonFill: '#BAB42B', textFill: '#333333' },
              },
              Addr: { // 灰色Addr
                  light: { polygonFill: '#d3d3d3', textFill: '#000000' },
                  dark: { polygonFill: '#AAAAAA', textFill: '#333333' },
              },
              redBasicBlock: {  // 标红的 BasicBlock
                  light: { polygonFill: '#e31a1c', textFill: '#000000' },
                  dark: { polygonFill: '#A44017', textFill: '#E8E8E8' },
              },
          },
          edge: { // 边
              light: { stroke: '#000000' },
              dark: { stroke: '#888888' },
          },
          polygon: {
              light: {
                  stroke: '#000000'
              },
              dark: {
                  stroke: '#ffffff'
              }
          }
      };

      background.style.fill = colors.background[colorTheme].fill;
      background.setAttribute('stroke', 'none');

      nodes.forEach(node => {
          node.setAttribute('stroke-width', '0');
          const polygon = node.querySelector('polygon');
          polygon.setAttribute('stroke', colors.polygon[colorTheme].stroke);
          const text = node.querySelector('text');
          const blockColor = Object.values(colors.block)
              .find(item => item.light.polygonFill === polygon.getAttribute('fill'));
          if (blockColor) {
              polygon.style.fill = blockColor[colorTheme].polygonFill;
              text.style.fill = blockColor[colorTheme].textFill;
          }
      });

      edges.forEach(edge => {
          edge.querySelector('path').style.stroke = colors.edge[colorTheme].stroke;
          edge.querySelector('polygon').style.stroke = colors.edge[colorTheme].stroke;
          edge.querySelector('polygon').style.fill = colors.edge[colorTheme].stroke;
      });
    }, 200);
  }
  /**
   * svg数据
   */
  public setSvgNoData(info: any) {
    $('#' + this.boxID + ' #insvg').html(
      `<div class='chen-nodata-td'>
        <img style='width:9.5%;display:block;margin-bottom:15px' src='./assets/img/projects/nodata.png' />
        <span style='display: inline-block'>${this.domSanitizer.sanitize(SecurityContext.HTML, info)}</span>
      </div>`
    );
  }
  /**
   * 鼠标缩放
   */
  public mouseScale(e: any) {
    e.stopPropagation();
    if (e.wheelDelta > 0) {
      this.scale(true);
    } else {
      this.scale(false);
    }
  }
  /**
   * 点击缩放
   */
  public scale(state: any) {
    if (state) {
      this.svgScale = 1.1;
    } else {
      this.svgScale = 0.9;
    }

    const boxDom: any = document.querySelector(`#${this.boxID} #insvg`);
    const svgDom = document.querySelector(`#${this.boxID} svg`);
    const width = svgDom.getClientRects()[0].width * this.svgScale;
    const height = svgDom.getClientRects()[0].height * this.svgScale;

    // 最小缩放到代码流框的80%
    if (Math.max(width - boxDom.offsetWidth * 0.8, height - boxDom.offsetHeight * 0.8) < 0) {
      return;
    }

    $('#' + this.boxID + ' svg').attr('width', width + 'px');
    $('#' + this.boxID + ' svg').attr('height', height + 'px');
  }
  /**
   * svg click
   */
  public listenSvgClick() {
    const list = document.getElementsByClassName('node');
    const self = this;
    Array.prototype.forEach.call(list, (i: any) => {
      i.addEventListener('click', function(e: any): any {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        const ins = $(this).children()[0].innerHTML || $(this).children()[0].textContent;

        if (ins.indexOf('Basic') === -1) {
          return false;
        }
        $('#' + self.boxID + ' svg .node').removeAttr('stroke-dasharray');
        $('#' + self.boxID + ' svg .node').attr('stroke-width', 1);
        this.setAttribute('stroke-dasharray', '4');
        this.setAttribute('stroke-width', 3);
        if (ins.indexOf('Basic') > -1) {
          const temp = self.assemblerData.srcData.data.find((x: any) => x.ins.indexOf(ins) > -1);

          self.highlightAssemblerCodeTr({ row: temp, scrollIntoView: true });
          self.highlightSourceCodeTr({ line: temp.line, scrollIntoView: true });
        }
      });
    });
  }
  /**
   * resizeSvg
   */
  public resizeSvg(): any {
    const svgw = document
      .querySelectorAll('#' + this.boxID + ' svg')[0]
      .getClientRects()[0].width;
    const svgh = document
      .querySelectorAll('#' + this.boxID + ' svg')[0]
      .getClientRects()[0].height;
    const boxw = document
      .querySelectorAll('#' + this.boxID + ' #insvg')[0]
      .getClientRects()[0].width;
    const boxh = document
      .querySelectorAll('#' + this.boxID + ' #insvg')[0]
      .getClientRects()[0].height;
    if (boxh < svgh) {
      this.scale(false);
      this.resizeSvg();
    } else {
      if (boxw < svgw) {
        this.scale(false);
        this.resizeSvg();
      } else {
        return false;
      }
    }
  }
  /**
   * 监听svg
   */
  public listenSvg() {
    const dv = $('#' + this.boxID + ' #insvg')[0];
    let x = 0;
    let y = 0;
    let l = 0;
    let t = 0;
    let isDown = false;
    // 鼠标按下事件
    dv.onmousedown = (e) => {
      e.stopPropagation();
      e.preventDefault();
      const regex1 = /\((.+?)\)/g;
      if (dv.style.transform.indexOf('translate') > -1) {
        const transform = dv.style.transform.match(regex1);
        const tempx = transform[0].split('');
        tempx.length = tempx.length - 3;
        tempx.shift();

        const tempy = transform[1].split('');
        tempy.length = tempy.length - 3;
        tempy.shift();

        l = parseInt(tempx.join(''), 10);
        t = parseInt(tempy.join(''), 10);
      } else {
        l = 10;
        t = 10;
      }
      dv.style.cursor = 'move';
      // 获取x坐标和y坐标
      x = e.clientX;
      y = e.clientY;

      // 获取左部和顶部的偏移量

      // 开关打开
      isDown = true;
      // 设置样式
      dv.style.cursor = 'move';
    };

    // 鼠标移动
    dv.onmousemove = (e) => {
      e.stopPropagation();
      e.preventDefault();
      if (isDown === false) {
        return;
      }

      // 获取x和y
      const nx = e.clientX;
      const ny = e.clientY;

      // 计算移动后的左偏移量和顶部的偏移量
      const nl = nx - (x - l);
      const nt = ny - y + t;

      $('#' + this.boxID + ' #insvg').css({
        transform: 'translateX(' + nl + 'px) translateY(' + nt + 'px) ',
      });
    };
    // 鼠标抬起事件
    $('#' + this.boxID + ' .func-main')[0].onmouseup = e => {
      x = 0;
      y = 0;
      l = 0;
      t = 0;
      // 开关关闭
      isDown = false;
      dv.style.cursor = 'default';
    };
    dv.onmouseup = e => {
      x = 0;
      y = 0;
      l = 0;
      t = 0;
      e.stopPropagation();
      // 开关关闭
      isDown = false;
      dv.style.cursor = 'default';
    };
    dv.onmouseleave = e => {
      e.stopPropagation();
      e.preventDefault();
      x = 0;
      y = 0;
      l = 0;
      t = 0;
      e.stopPropagation();
      // 开关关闭
      isDown = false;
      dv.style.cursor = 'default';
    };
  }

  public toggleTop() {
    this.isFold = !this.isFold;
  }

  public onDemandData(demandSource: Subject<any[]>) {
    this.assembleDemandSource = demandSource;
    if (this.assemblerDataIterator == null) {
      return;
    }
    const block = this.assemblerDataIterator.next();
    if (!block.done) {
      demandSource.next(block.value);
    }
  }

  public onRelasedata(loadedData: any[]) {
    this.assemblerData.loadData = loadedData;
    this.cdr.detectChanges();
  }

  public trackByAssembleId(index: number, item: any) {
    return item.id;
  }

}
