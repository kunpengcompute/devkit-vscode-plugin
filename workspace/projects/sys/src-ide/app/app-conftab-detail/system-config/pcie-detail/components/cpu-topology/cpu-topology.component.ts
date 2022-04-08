import {
  AfterViewInit, Component, ElementRef, Input, OnInit,
  ViewChild, OnChanges, SimpleChanges, Output, EventEmitter, OnDestroy
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import * as d3 from 'd3';
import { Tree, NodeType, Thumbnail } from './doman';
import * as hardUrl from 'sys/src-com/assets/hard-coding/url.json';
import { HyThemeService, HyTheme } from 'hyper';
import { Subscription } from 'rxjs';
import { calcTextWidth } from 'hyper';

@Component({
  selector: 'app-cpu-topology',
  templateUrl: './cpu-topology.component.html',
  styleUrls: ['./cpu-topology.component.scss']
})
export class CpuTopologyComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  readonly imgUrl: {[theme in HyTheme]: { [key: string]: string }} = {
    dark: {
      numa: './assets/img/pcie/numa-dark.svg',
      rootComplex: './assets/img/pcie/root-complex-dark.svg',
      bridgePoint: './assets/img/pcie/bridge-point-dark.svg',
      endPoint: './assets/img/pcie/end-point-dark.svg',
    },
    light: {
      numa: './assets/img/pcie/numa.svg',
      rootComplex: './assets/img/pcie/root-complex.svg',
      bridgePoint: './assets/img/pcie/bridge-point.svg',
      endPoint: './assets/img/pcie/end-point.svg',
    },
    grey: {
      numa: './assets/img/pcie/numa.svg',
      rootComplex: './assets/img/pcie/root-complex.svg',
      bridgePoint: './assets/img/pcie/bridge-point.svg',
      endPoint: './assets/img/pcie/end-point.svg',
    }
  };
  readonly colorTheme: {[theme in HyTheme]: { [key: string]: string }} = {
    dark: {
      primaryFont: '#e8e8e8',
      secondaryFont: '#aaaaaa',
    },
    light: {
      primaryFont: '#222222',
      secondaryFont: '#616161',
    },
    grey: {
      primaryFont: '#e8e8e8',
      secondaryFont: '#aaaaaa',
    }
  };
  @ViewChild('treeHost', { static: true }) treeHostEl: ElementRef<HTMLDivElement>;

  @Input() cpuData: any;
  @Output() sendData = new EventEmitter<any>();
  private isViewInited = false;
  private isFirstDrawOver = false;
  private treeProps = {
    boxWidth: 0,
    boxHeight: 0,
    nodeWidth: 68,
    nodeHeight: 68,
    nodeGap: 75 + 68,
    svgPadding: 110,
    svgHeight: 0,
    nameWidth: 140
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
  /** 每个cpu当前显示的numa */
  private currNumaName: { [cpu: string]: string } = {};

  private currTheme: HyTheme;
  private themeServeSub: Subscription;
  private activeNodeId: { [cpu: string]: Tree } = {};

  constructor(
    private sanitizer: DomSanitizer,
    private themeServe: HyThemeService
  ) {
    if (document.body.className.includes('vscode-dark')) {
      this.currTheme = HyTheme.Dark;
    } else {
      this.currTheme = HyTheme.Light;
    }

    this.themeServeSub = this.themeServe.subscribe((msg) => {
      this.currTheme = msg;
      if (this.isFirstDrawOver) {
        this.refreshTree(true);
      }
    });
  }

  ngOnInit(): void { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.cpuData && this.isViewInited) {
      this.initThumbnailList(this.cpuData);
      this.buildD3TreeData(this.cpuData);
      this.thumbnailList.forEach(item => {
        this.treeD3[item.cpu].dom = this.generateD3TreeDom(item.cpu, this.treeD3[item.cpu].data);
        this.treeD3[item.cpu].thumbnailSrc = this.createThumbnail(this.treeD3[item.cpu].dom);
      });
      this.treeHostEl.nativeElement.appendChild(this.treeD3[this.currCpuName].dom);
      this.isFirstDrawOver = true;
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
        data.push({
          id: ++id,
          name: bdf.node_info.device_name.value,
          nodeData: bdf,
          subName: bdfKey,
          type: bdf.node_info.node_type.value,
          numa,
          children: getChildren(bdf.children, numa)
        });
      });
      return data;
    };

    Object.keys(cpuData).forEach(numaKey => {
      if (numaKey.toLowerCase().indexOf('numa') > -1) {
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
    // 创建svg
    const svg = d3.create('svg');
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
        this.handleNodeClick(node.data);
      })
      .attr('transform', d => `
        translate(${d.x - (this.treeProps.nodeWidth / 2)}, ${d.y - (this.treeProps.nodeHeight / 2)})
      `);

    nodeGroup.append('image')
      .attr('href', d => {
        switch (d.data.type) {
          case NodeType.BRIDGE: return this.imgUrl[this.currTheme].bridgePoint;
          case NodeType.END_POINT: return this.imgUrl[this.currTheme].endPoint;
          case NodeType.NUMA: return this.imgUrl[this.currTheme].numa;
          case NodeType.ROOT_COMPLEX: return this.imgUrl[this.currTheme].rootComplex;
          default: return this.imgUrl[this.currTheme].bridgePoint;
        }
      })
      .attr('style', 'cursor: pointer;')
      .attr('width', this.treeProps.nodeWidth + 'px')
      .attr('height', this.treeProps.nodeHeight + 'px');

    nodeGroup.append('circle')
      .filter(d => (d.data.type !== NodeType.ROOT_COMPLEX && d.data.id === this.activeNodeId[cpu]?.id))
      .attr('style', 'pointer-events: none;')
      .attr('cx', this.treeProps.nodeWidth / 2)
      .attr('cy', this.treeProps.nodeWidth / 2)
      .attr('r', 33)
      .attr('fill', '#00000000')
      .attr('stroke', '#0067ff')
      .attr('stroke-width', 2);

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

    fontGroup.append('text')
      .attr('fill', this.colorTheme[this.currTheme].primaryFont)
      .attr('x', d => d.x)
      .attr('y', d => d.y + (this.treeProps.nodeHeight / 2) + 20)
      .text(d => this.getOmitText(d.data.name, this.treeProps.nameWidth));

    fontGroup.append('text')
      .filter(d => Boolean(d.data.subName))
      .attr('fill', this.colorTheme[this.currTheme].secondaryFont)
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
      .attr('xmlns:xlink', hardUrl.xlinkUrl)
      .node();
    return dom;
  }

  /**
   * 通过dom创建缩略图
   */
  private createThumbnail(dom: SVGSVGElement) {
    const svgStr = unescape(encodeURIComponent(dom.outerHTML));
    const pureSvg = this.sanitizer.bypassSecurityTrustHtml(svgStr);
    return pureSvg;
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

  private handleNodeClick(node: Tree) {
    if (node?.type !== NodeType.ROOT_COMPLEX) {
      this.activeNodeId[this.currCpuName] = node;
      this.refreshTree(true);
    }

    this.sendData.emit(node);
  }

  public onCpuTopologySwitch(thumbnail: Thumbnail) {
    this.currCpuName = thumbnail.cpu;
    this.refreshTree(false);
    this.sendData.emit(this.activeNodeId[this.currCpuName]);
  }

  ngOnDestroy(): void {
    this.themeServeSub.unsubscribe();
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
}
