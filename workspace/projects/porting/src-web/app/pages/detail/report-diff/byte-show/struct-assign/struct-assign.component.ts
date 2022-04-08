import {
  Component, OnInit, AfterViewInit, ViewEncapsulation,
  Inject, Input, Output, EventEmitter } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import 'highlight.js/styles/googlecode.css';
import 'diff2html/bundles/css/diff2html.min.css';
import { AxiosService } from '../../../../../service/axios.service';
import { I18nService } from '../../../../../service/i18n.service';
import * as d3 from 'd3';

@Component({
  selector: 'app-struct-assign',
  templateUrl: './struct-assign.component.html',
  styleUrls: ['./struct-assign.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class StructAssignComponent implements OnInit, AfterViewInit {
  subscribeScoll: any;
  @Output() step = new EventEmitter<any>();
  @Input() struckData: any;

  public stepIndexCopy: any;
  @Input()
  set stepIndex(val) {
    this.stepIndexCopy = val;
    if (this.stepIndexCopy !== null) {
      $('.struck-assign').animate({scrollTop: this.offsetHight[this.stepIndexCopy]}, 500);
    }
  }
  get stepIndex() {
    return this.stepIndexCopy;
  }
  public offsetHight = [0];
  public struckDataNew: any = [];
  public lineList: any = [];
  public struckRoot: any;
  public struckList: any;
  public i18n: any;
  public elmWrapper: any;
  public curTranslate = { x: 0, y: 0 };
  constructor(
    @Inject(DOCUMENT) private document: any,
    private axios: AxiosService,
    public i18nService: I18nService
  ) {
    this.i18n = this.i18nService.I18n();
  }

  ngOnInit() {
    this.elmWrapper = document.getElementById('wrapper');
  }

  ngAfterViewInit(): void {
    for (let i = 0; i < this.struckData['32-bits'].length; i++) {
      this.struckData['32-bits'][i].struct_type = '32位';
      this.struckData['64-bits'][i].struct_type = '64位';
      this.struckDataNew.push(this.struckData['32-bits'][i]);
      this.struckDataNew.push(this.struckData['64-bits'][i]);
    }
    this.struckRoot = this.hierarchy(this.struckDataNew);
    this.struckList = this.partition(this.struckRoot);
    const lineStyle = { color: 'black', size: 1.5 };
    const gridNode = this.render();
    $('#svgRoot').append(gridNode);
    const a = $('.struck-left');
    for (let i = 0; i < a.length; i++) {
      const element = a[i];
      if (a.eq(i).text() === '32位') {
        a.eq(i).parent().parent().append('<div class="siblings"></div>').find('.siblings').attr('id', 'siblings' + i);
        if (i !== 0 ) {
          this.offsetHight.push($('#siblings' + i).offset().top - 210);
        }
      }
    }

    $('#line').height($('#svgRoot').height() + 50);
    $('#line').width($('#svgRoot').prop('scrollWidth'));
    this.leadLine(this.struckRoot, false);
  }

  public render() {
    const root = this.struckRoot;
    const nodelist = this.struckList;
    const grid = d3.create('div')
      .style('display', 'grid')
      .style('grid-gap', '40px')
      .style('grid-auto-columns', 'auto')
      .style('grid-auto-rows', 'auto')
      .style('position', 'releative');

    const cell = grid.selectAll('div')
      .data(nodelist)
      .join('div')
      .style('grid-column-start', (d: any) => d.col)
      .style('grid-row-start', (d: any) => d.row)
      .style('position', 'relative')
      .html((d: any) => this.renderCell(d, d.id, d.lineId));

    return grid.node();
  }
  // 计算表格的单元格数和元素的坐标
  public hierarchy(list: any) {
    const http = this.axios;
    const nodeList: any = [];
    let depth = 0;
    let maxDepth = 0;
    let breadth = 0;
    function recursive(item: any, childList: any) {
      let childrenNum = 0;
      depth++;
      const node: any = {
        col: depth,
        row: breadth,
        children: [],
        value: item,
        id: http.generateConversationId(15),
        lineId: http.generateConversationId(15),
      };
      childList.push(node);
      if (maxDepth < depth) {
        maxDepth = depth;
      }
      item.suggestion_content.forEach((element: any) => {
        if (Object.keys(element.value_node).length > 0) {
          childrenNum++;
          if (childrenNum >= 2) { breadth++; }
          recursive(element.value_node, node.children);
        }
      });
      depth--;
    }

    list.forEach((item: any) => {
      breadth++;
      recursive(item, nodeList);
    });
    nodeList.breadth = breadth;
    nodeList.depth = maxDepth;
    return nodeList;
  }

  public partition(root: any) {
    const nodeList: any = [];

    function recursive(list: any) {
      list.forEach((node: any) => {
        nodeList.push(node);
        recursive(node.children);
      });
    }
    recursive(root);
    nodeList.breadth = root.breadth;
    nodeList.depth = root.depth;
    return nodeList;
  }

  // 渲染grid单元格
  public renderCell(item: any, id: string, lineId: string) {

    let contentHtml = '';
    let index = 0;
    item.value.suggestion_content.forEach((elem: any, idx: any) => {
      if (Object.keys(elem.value_node).length !== 0) {
        index++;
      }
      const str = `</ng-template>
        <div class="struck-value"
        style="${item.value.suggestion_content.length === (idx + 1)
          ? 'border-bottom:1px solid #6B708B'
          : null};"
        id=${Object.keys(elem.value_node).length !== 0 ? ('b' + (index - 1) + lineId) : null}>
          <span class="struck-span"
            title = ${Object.keys(elem.value_node).length !== 0 ? `filepath:${elem.value_node.filepath},
            starline:${elem.value_node.start_line},${elem.value_name}:${elem.value_size}B`
            : (`${(elem.value_name.length + elem.value_size.toString().length) > 16
                ? (elem.value_name + ':' + elem.value_size + 'B')
                : ''}`
              )}
        >
          <img style='padding-left:15px;display:${Object.keys(elem.value_node).length !== 0 ? null : 'none'}'
          src="./assets/img/code-diff/filestar.svg" class="open-img"">
      ${elem.value_name}<span
        style="padding-right:13px;display:${elem.value_size === 0 ? 'none' : null}">:${elem.value_size}B</span></span>
                  </div>
                  <div
                    class="struck-value"
                    style="font-size:14px;background-color:#FFEEEE;display:${!elem.byte_hole ? 'none' : null};
                  ${item.value.suggestion_content.length === (idx + 1) ? 'border-bottom:1px solid #6B708B' : null}">
                  <div class="struck-span" style="color:#EF6D6D;font-size:14px">
                  <img src="./assets/img/code-diff/tip.svg" class="open-img"">
                  ${elem.byte_hole}B hole</div>
                  </div>
                  `;
      contentHtml += str;
    });
    const title = `<span class="struck-left" id=${'l' + id}>${item.value.struct_type}</span>`;
    const struckHtml = `
    <div class="struck-box" id=${'a' + id}>
      ${item.col === 1 ? title : ''}
      <span class="struck-title" id=${id}
        title = ${item.value.struct_name.length > 18
          ? `${item.value.struct_name}`
          : ''}>${item.value.struct_name}</span>
      ${contentHtml}
    </div>
    <script>
    function showtip(name,id) {
      $('#' + id).eq(0).attr('title',name)
    }
    </script>
    <style>
      .struck-value {
          width: 130px;
          border-radius: 4px;
          border: 1px solid #6B708B;
      }
      .struck-value:last-child {
          border: 1px solid #6B708B;
      }
      .struck-span {
          margin: 5px 0;
          width: 100%;
          text-align: center;
          display: inline-block;
          color: #616161;
      }
      .open-img {
        vertical-align: text-bottom;
      }
    </style>`;
    return struckHtml;
  }

  public drawConnector(leftDiv: any, rightDiv: any, type: any) {
    let offsetX;
    let offsetY;
    if (type === 'struck') {
      offsetX = 60;
      offsetY = 80;
    } else {
      offsetX = 25;
      offsetY = 30;
    }
    const posnALeft = {
      x: leftDiv.offset().left - $('#struck-box').offset().left + leftDiv.width() + 1,
      y: leftDiv.offset().top - $('#struck-box').offset().top  + leftDiv.height() / 2
    };
    const posnBLeft = {
      x: rightDiv.offset().left - $('#struck-box').offset().left - 6,
      y: rightDiv.offset().top - $('#struck-box').offset().top  + rightDiv.height() / 2
    };

    const dStrLeft =
    'M' +
    (posnALeft.x      ) + ',' + (posnALeft.y) + ' ' +
    'C' +
    (posnALeft.x + offsetX) + ',' + (posnALeft.y) + ' ' +
    (posnBLeft.x - offsetY) + ',' + (posnBLeft.y) + ' ' +
    (posnBLeft.x      ) + ',' + (posnBLeft.y);
    const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('d', dStrLeft);
    p.setAttributeNS(null, 'stroke-width', '1');
    document.getElementById('g-box').append(p);

  }
  // 连线函数，如果传入true，则进行调整连线位置
  public leadLine(root: any, edit: any) {
    const that = this;
    const lineStyle = { color: 'black', size: 1.5 };

    function recursive(node: any) {
      if (node.children.length === 0) {
      that.struckList.forEach((item: any) => {
        if (item.col === 1) {
          that.drawConnector($('#l' + item.id), $('#a' + item.id).children('.struck-value').eq(0), 'byte');
          if ($('#a' + item.id).children('.struck-value').last().css('display') === 'none') {
            that.drawConnector($('#l' + item.id), $('#a' + item.id).children('.struck-value').eq(-2), 'byte');
          } else {
            that.drawConnector($('#l' + item.id), $('#a' + item.id).children('.struck-value').last(), 'byte');
          }
        }
      });
    }
      node.children.forEach((element: any, idx: any) => {
        if (edit !== 'scroll' && edit !== 'delete') {
          that.struckList.forEach((item: any) => {
            if (item.col === 1) {
              that.drawConnector($('#l' + item.id), $('#a' + item.id).children('.struck-value').eq(0), 'byte');
              if ($('#a' + item.id).children('.struck-value').last().css('display') === 'none') {
                that.drawConnector($('#l' + item.id), $('#a' + item.id).children('.struck-value').eq(-2), 'byte');
              } else {
                that.drawConnector($('#l' + item.id), $('#a' + item.id).children('.struck-value').last(), 'byte');
              }
            }
          });
          const leaderLine = that.drawConnector($('#b' + idx + node.lineId).eq(0), $('#' + element.id).eq(0), 'struck');
          that.lineList.push(leaderLine);
        }
        recursive(element);
      });
    }
    root.forEach((element: any) => {
      recursive(element);
    });
  }


  public drap(id: any) {
    const dv = $('#' + id)[0];
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
    $('#' + id)[0].onmousemove = (e) => {
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

      $('#' + id).css({
        transform: 'translateX(' + nl + 'px) translateY(' + nt + 'px) ',
      });
    };
    // 鼠标抬起事件
    $('#' + id)[0].onmouseup = () => {
      x = 0;
      y = 0;
      l = 0;
      t = 0;
      // 开关关闭
      isDown = false;
      dv.style.cursor = 'default';
    };
    dv.onmouseup = (e) => {
      x = 0;
      y = 0;
      l = 0;
      t = 0;
      e.stopPropagation();
      // 开关关闭
      isDown = false;
      dv.style.cursor = 'default';
    };
    dv.onmouseleave = (e) => {
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

  fixPosition(lines: any) {
    const rectWrapper = this.elmWrapper.getBoundingClientRect();
    const translate = { x: (rectWrapper.left + pageXOffset) * -1, y: (rectWrapper.top + pageYOffset) * -1 };
    if (translate.x !== 0 || translate.y !== 0) {
      // Update position of wrapper
      this.curTranslate.x += translate.x;
      this.curTranslate.y += translate.y;
      this.elmWrapper.style.transform = 'translate(' + this.curTranslate.x + 'px, ' + this.curTranslate.y + 'px)';
      // Update position of all lines
      this.lineList.forEach((line: any) => { line.position(); });
    } else if (lines) {
      // Update position of target line
    }
  }

  positonGet(event: any) {
    let clickY: any;
    const e = event;
    const scrollY = e.clientY;
    // 计算鼠标在盒子内的坐标
    clickY = scrollY + $('.struck-assign').scrollTop() - 210;
    this.offsetHight.forEach((el, i) => {
      if (el < clickY && clickY < this.offsetHight[i + 1]) {
        this.step.emit(i);
      }
      if (clickY > el && this.offsetHight.length - 1 === i) {
        this.step.emit(this.offsetHight.length - 1);
      }
    });
  }
}
