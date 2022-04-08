import {
  AfterViewInit, Component, ElementRef, Input,
  ViewChild, OnChanges, SimpleChanges, Output, EventEmitter
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import * as d3 from 'd3';
import { Tree, NodeType, Thumbnail } from './doman';
import { calcTextWidth, Cat } from 'hyper';

const hardUrl: any = require('projects/sys/src-web/assets/hard-coding/url.json');

@Component({
  selector: 'app-cpu-topology',
  templateUrl: './cpu-topology.component.html',
  styleUrls: ['./cpu-topology.component.scss']
})
export class CpuTopologyComponent implements AfterViewInit, OnChanges {
  readonly imgUrl = {
    numa: './assets/img/pcie/numa.svg',
    rootComplex: './assets/img/pcie/root-complex.svg',
    bridgePoint: './assets/img/pcie/bridge-point.svg',
    endPoint: './assets/img/pcie/end-point.svg',
    nodeTextBg: './assets/img/linkage/linkage_text_bg.png',
  };
  @ViewChild('treeHost', { static: true }) treeHostEl: ElementRef<HTMLDivElement>;

  @Input() cpuData: any;
  @Output() sendData = new EventEmitter<any>();
  private isViewInited = false;
  private treeProps = {
    boxWidth: 0,
    boxHeight: 0,
    nodeWidth: 68,
    nodeHeight: 68,
    nodeGap: 75 + 68,
    svgPadding: 110,
    svgHeight: 0,
    nameWidth: 140,
    textBgHeight: 14,
    subNameWidth: 48
  };
  public treeD3: {
    [cpu: string]: {
      data: d3.HierarchyPointNode<Tree>,
      dom?: SVGSVGElement,
      thumbnailSrc?: SafeResourceUrl,
    }
  } = {};

  public thumbnailList: Thumbnail[] = [];
  public currCpuName: string;
  private activeNodeId: { [cpu: string]: Tree } = {};

  constructor(
    private sanitizer: DomSanitizer
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.cpuData && this.isViewInited) {
      this.initThumbnailList(this.cpuData);
      this.buildD3TreeData(this.cpuData);
      this.thumbnailList.forEach(item => {
        this.treeD3[item.cpu].dom = this.generateD3TreeDom(item.cpu, this.treeD3[item.cpu].data);
        this.treeD3[item.cpu].thumbnailSrc = this.createThumbnail(this.treeD3[item.cpu].dom);
      });
      this.treeHostEl.nativeElement.appendChild(this.treeD3[this.currCpuName].dom);
    }
  }

  ngAfterViewInit(): void {
    this.isViewInited = true;
    const treeHostClientRect = this.treeHostEl.nativeElement.getBoundingClientRect();
    this.treeProps.boxWidth = treeHostClientRect.width;
    this.treeProps.boxHeight = treeHostClientRect.height;
  }

  private initThumbnailList(data: { [key: string]: any }) {
    Object.keys(data).forEach(item => {
      if (item.indexOf('CPU') > -1 || item.indexOf('cpu') > -1) {
        this.thumbnailList.push({ cpu: item });
      }
    });
    this.currCpuName = this.thumbnailList[0].cpu;
  }

  /**
   * 为每个cpu构建d3树数据
   *
   * @param data 后端返回的数据
   */
  private buildD3TreeData(data: { [key: string]: any }) {
    this.thumbnailList.forEach(cpuThumbnail => {
      const cpuData = data[cpuThumbnail.cpu];
      const treeData = this.buildTreeData(cpuThumbnail.cpu, cpuData);
      const treeD3Data = this.generateD3TreeData(treeData);
      this.treeD3[cpuThumbnail.cpu] = {
        data: treeD3Data
      };
    });
  }

  /**
   * 根据后端返回的cpu数据构建可以用于d3的树数据结构
   *
   * @param cpuData 后端返回的cpu数据
   */
  private buildTreeData(cpu: string, cpuData: any) {
    let id = 0;
    const treeData: Tree = {
      id: ++id,
      name: 'root',
      type: NodeType.NONE,
      numa: '',
      children: [],
      nodeData: {},
    };

    const getChildren = (bdfData: any, numa: string): Tree[] => {
      const data: Tree[] = [];
      Object.keys(bdfData).forEach(bdfKey => {
        const bdf = bdfData[bdfKey];
        const nodeConfigInfo = bdf?.node_config_info ?? {};
        const suggestionFlag = this.getSuggestionFlag(nodeConfigInfo);
        data.push({
          id: ++id,
          name: bdf.node_info.device_name.value,
          nodeData: bdf,
          subName: bdfKey,
          type: bdf.node_info.node_type.value,
          numa,
          children: getChildren(bdf.children, numa),
          suggestionFlag
        });
      });
      return data;
    };

    Object.keys(cpuData).forEach(numaKey => {
      if (numaKey.indexOf('NUMA') > -1 || numaKey.indexOf('numa') > -1) {
        const children = getChildren(cpuData[numaKey].bdf_dict, numaKey);
        const node: Tree = {
          id: ++id,
          name: numaKey,
          numa: numaKey,
          type: NodeType.NUMA,
          nodeData: {},
          children: children?.length > 0 ? [{
            id: 0,
            name: 'Root complex',
            type: NodeType.ROOT_COMPLEX,
            nodeData: {},
            numa: numaKey,
            children
          }] : []
        };
        this.activeNodeId[cpu] = this.activeNodeId[cpu] || node;
        treeData.children.push(node);
      }
    });

    return treeData;
  }

  /**
   * 生成D3树视图数据
   *
   * @param treeOriginData 用于构建d3树视图数据的源数据
   */
  private generateD3TreeData(treeOriginData: Tree) {
    const treeData = d3.hierarchy(treeOriginData);
    this.treeProps.svgHeight = (treeData.height + 1) * this.treeProps.nodeGap;
    const tree = d3.tree<Tree>().nodeSize([this.treeProps.nodeGap, this.treeProps.nodeGap]);
    const root = tree(treeData);
    return root;
  }

  /**
   * 为指定cpu生成d3树svg图dom
   *
   * @param treeD3Data d3视图数据
   */
  private generateD3TreeDom(cpu: string, treeD3Data: d3.HierarchyPointNode<Tree>) {

    const shadowId = 'id' + Number(Math.random().toString().substr(3, length) + Date.now()).toString(36);

    // 创建svg
    const svg = d3.create('svg');

    const defs = svg.append('defs');

    defs.append('filter')
      .attr('id', shadowId)
      .attr('dx', 0)
      .attr('dy', 0)
      .append('feDropShadow')
      .attr('stdDeviation', 5)
      .attr('flood-color', '#000');

    defs.append('filter')
      .attr('id', shadowId + '-textBg')
      .attr('dx', 0)
      .attr('dy', 0)
      .append('feGaussianBlur')
      .attr('stdDeviation', 5)
      .attr('in', 'SourceGraphic');

    // 因为数据节点坐标x坐标以0刻度左右对称，所以需要将svg整体右移宽度的一半
    const svgWidth = this.treeProps.boxWidth + (this.treeProps.svgPadding * 2);
    const totalGroup = svg.append('g')
      .attr('transform', `translate(${this.treeProps.svgPadding + (svgWidth / 2)},
      ${this.treeProps.svgPadding - this.treeProps.nodeGap})`);

    // 画线
    totalGroup.append('g')
      .attr('fill', 'none')
      .attr('stroke', '#0067ff')
      .attr('stroke-opacity', 0.3)
      .attr('stroke-width', 4)
      .selectAll('path')
      .data(treeD3Data.links())
      .join('path')
      .filter(d => {
        if (d.source.data.type !== NodeType.NONE) {
          return true;
        }
        return false;
      })
      .attr('d', d => {
        if (d.source.data.type === NodeType.ROOT_COMPLEX) {
          return `
            M${d.source.x}, ${d.source.y}
            L${d.target.x - (d.target.x > d.source.x ? 10 : -10)}, ${d.source.y}
            Q${d.target.x}, ${d.source.y}
            ${d.target.x}, ${d.source.y + 10}
            L${d.target.x}, ${d.target.y}
          `;
        } else {
          if (d.source.x === d.target.x) {
            return `
              M${d.source.x}, ${d.source.y}
              L${d.target.x}, ${d.target.y}
            `;
          } else {
            const nodesCenterY = (d.source.y + d.target.y) / 2;
            return `
              M${d.source.x}, ${d.source.y}
              L${d.source.x}, ${nodesCenterY - 10}
              Q${d.source.x}, ${nodesCenterY}
              ${d.source.x + (d.target.x > d.source.x ? 10 : -10)}, ${nodesCenterY}
              L${d.target.x - (d.target.x > d.source.x ? 10 : -10)}, ${nodesCenterY}
              Q${d.target.x}, ${nodesCenterY}
              ${d.target.x}, ${nodesCenterY + 10}
              L${d.target.x}, ${d.target.y}
            `;
          }
        }
      });

    // 绘制节点图标
    const nodeGroup = totalGroup.append('g')
      .selectAll('g')
      .data(treeD3Data.descendants())
      .join('g')
      .filter(d => {
        if (d.data.type !== NodeType.NONE) {
          return true;
        }
        return false;
      })
      .on('click', (event, node: d3.HierarchyPointNode<Tree>) => {
        this.handleNodeClick(event, node.data);
      })
      .attr('transform', d => `
        translate(${d.x - (this.treeProps.nodeWidth / 2)}, ${d.y - (this.treeProps.nodeHeight / 2)})
      `);

    nodeGroup.append('circle')
      .attr('style', 'pointer-events: none;')
      .attr('cx', this.treeProps.nodeWidth / 2)
      .attr('cy', this.treeProps.nodeWidth / 2)
      .attr('r', 33)
      .attr('fill', 'none')
      .attr('stroke', '#eee')
      .attr('stroke-width', 1)
      .style('filter', `url(#${shadowId})`);

    nodeGroup.append('image')
      .attr('href', d => {
        switch (d.data.type) {
          case NodeType.BRIDGE: return this.imgUrl.bridgePoint;
          case NodeType.END_POINT: return this.imgUrl.endPoint;
          case NodeType.NUMA: return this.imgUrl.numa;
          case NodeType.ROOT_COMPLEX: return this.imgUrl.rootComplex;
          default: return this.imgUrl.bridgePoint;
        }
      })
      .attr('style', 'cursor: pointer;')
      .attr('width', this.treeProps.nodeWidth + 'px')
      .attr('height', this.treeProps.nodeHeight + 'px');

    nodeGroup.append('circle')
      .filter(d => (d.data.type !== NodeType.ROOT_COMPLEX))
      .attr('style', 'pointer-events: none;')
      .attr('class', d => (
        `active-circle ${d.data.id === this.activeNodeId[cpu]?.id ? 'show' : ''}`
      ))
      .attr('cx', this.treeProps.nodeWidth / 2)
      .attr('cy', this.treeProps.nodeWidth / 2)
      .attr('r', 33)
      .attr('fill', 'none')
      .attr('stroke', '#0067ff')
      .attr('stroke-width', 2);

    nodeGroup.append('circle')
      .filter(d => d.data?.suggestionFlag)
      .attr('style', 'pointer-events: none;')
      .attr('cx', this.treeProps.nodeWidth / 2)
      .attr('cy', this.treeProps.nodeWidth / 2)
      .attr('r', 33)
      .attr('fill', 'none')
      .attr('stroke', '#ed4b4b')
      .attr('stroke-width', 1);

    // 绘制节点文字
    const fontGroup = totalGroup.append('g')
      .attr('font-family', 'HuaweiSans')
      .attr('font-size', 14)
      .attr('text-anchor', 'middle')
      .selectAll('g')
      .data(treeD3Data.descendants())
      .join('g')
      .filter(d => {
        if (d.data.type !== NodeType.NONE) {
          return true;
        }
        return false;
      });

    fontGroup.append('title')
      .text(d => d.data.name);

    fontGroup.append('rect')
      .attr('width', this.treeProps.nameWidth)
      .attr('height', this.treeProps.textBgHeight)
      .attr('x', d => d.x - this.treeProps.nameWidth / 2)
      .attr('y', d => d.y + (this.treeProps.nodeHeight / 2) + 20 - this.treeProps.textBgHeight)
      .attr('fill', '#ffffff')
      .attr('filter', `url(#${shadowId + '-textBg'})`);

    fontGroup.append('text')
      .attr('x', d => d.x)
      .attr('y', d => d.y + (this.treeProps.nodeHeight / 2) + 20)
      .attr('fill', '#222222')
      .text(d => this.getOmitText(d.data.name, this.treeProps.nameWidth));

    fontGroup.append('rect')
      .filter(d => Boolean(d.data.subName))
      .attr('width', this.treeProps.subNameWidth)
      .attr('height', this.treeProps.textBgHeight)
      .attr('x', d => d.x - this.treeProps.subNameWidth / 2)
      .attr('y', d => d.y + (this.treeProps.nodeHeight / 2) + 40 - this.treeProps.textBgHeight)
      .attr('fill', '#ffffff')
      .attr('filter', `url(#${shadowId + '-textBg'})`);

    fontGroup.append('text')
      .filter(d => Boolean(d.data.subName))
      .attr('fill', '#616161')
      .attr('x', d => d.x)
      .attr('y', d => d.y + (this.treeProps.nodeHeight / 2) + 40)
      .text(d => d.data.subName || '');

    const dom = svg
      .attr('viewBox', `
        0,
        0,
        ${svgWidth},
        ${treeD3Data.height * this.treeProps.nodeGap + (this.treeProps.svgPadding * 2)}
      `)
      .attr('xmlns', hardUrl.w3cUrl)
      .node();
    return dom;
  }

  /**
   * 通过dom创建缩略图
   */
  private createThumbnail(dom: SVGSVGElement) {
    const src = 'data:image/svg+xml;base64,' + window.btoa(unescape(encodeURIComponent(dom.outerHTML)));
    return this.sanitizer.bypassSecurityTrustResourceUrl(src);
  }

  /**
   * 刷新当前展示的cpu树
   * 根据数据重新构建svg图
   *
   * @param force 是否重新生成dom和缩略图
   */
  private refreshTree(force: boolean) {
    const currShowCpu = this.treeD3[this.currCpuName];
    if (force) {
      currShowCpu.dom = this.generateD3TreeDom(this.currCpuName, currShowCpu.data);
      currShowCpu.thumbnailSrc = this.createThumbnail(currShowCpu.dom);
    }
    this.treeHostEl.nativeElement.innerHTML = '';
    this.treeHostEl.nativeElement.appendChild(currShowCpu.dom);
  }

  private handleNodeClick(event: any, node: Tree) {
    if (node?.type !== NodeType.ROOT_COMPLEX) {
      this.activeNodeId[this.currCpuName] = node;
      this.treeHostEl.nativeElement.querySelector('.active-circle.show').classList.remove('show');
      event.target.nextElementSibling.classList.add('show');
    }

    this.sendData.emit(node);
  }

  public onCpuTopologySwitch(thumbnail: Thumbnail) {
    this.currCpuName = thumbnail.cpu;
    this.refreshTree(false);
    this.sendData.emit(this.activeNodeId[this.currCpuName]);
  }

  private getOmitText(text: string, limitWidth: number) {

    const textInfo = { fontSize: '14px', fontFamily: 'HuaweiSans' };
    const ellipsisTextWidth = calcTextWidth('...', textInfo);
    const actualTextWidth = calcTextWidth(text, textInfo);

    if (ellipsisTextWidth > limitWidth) {
      return '';
    } else if (Math.abs(limitWidth - actualTextWidth) < 0.00001 || limitWidth > actualTextWidth) {
      return text;
    } else {
      return recursive(0, text.length - 1);
    }

    function recursive(startIndex: number, endIndex: number): any {
      // 结束条件
      if (endIndex - startIndex === 1) {
        const optimalText = text.substring(0, startIndex + 1) + '...';
        return calcTextWidth(optimalText, textInfo) > limitWidth
          ? ''
          : optimalText;
      }

      const stepLen = Math.floor((endIndex - startIndex) / 2);
      const pos = startIndex + stepLen;
      const omitText = text.substring(0, pos + 1) + '...';
      if (calcTextWidth(omitText, textInfo) < limitWidth) {
        return recursive(pos, endIndex);
      } else {
        return recursive(startIndex, pos);
      }
    }
  }

  private getSuggestionFlag(configInfo: { [key in string]: any }): boolean {

    let flag = false;

    const searchFlag = (config: typeof configInfo) => {

      config = Cat.isObj(config) ? config : {};

      const keyList = Object.keys(config);
      for (const key of keyList) {

        const value = config[key];
        if (key === 'suggestion_flag' && !Boolean(value)) {
          flag = true;
        }
        searchFlag(value);
      }
    };

    searchFlag(configInfo);
    return flag;
  }
}
