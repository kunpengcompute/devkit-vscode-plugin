import { Injectable } from '@angular/core';
import { TreeDirectionEnum, TreeNodeRef, TwoNumber } from '../classes/reference';
import * as d3 from 'd3';

@Injectable({
  providedIn: 'root'
})
export class ServerNodeLigatureService {

  constructor() { }

  /**
   * 获取该树对应的所有 <path> 元素的 d 的数据
   * @param treeNode 树节点信息
   */
  public getTreeSvgElement(treeNode: TreeNodeRef): SVGSVGElement {
    const pathDList: string[] = [];
    // 圆角半径
    const radius: number = treeNode.borderRadius || 0;
    // 重排 子节点坐标列表
    const chPosList: TwoNumber[] = treeNode.childenPos.sort((a, b) => {
      return a[0] - b[0];
    });
    // 父节点坐标
    const paPos = treeNode.parentPos;
    if (treeNode.direction === TreeDirectionEnum.UP) {
      // 计算起始位置
      let originPos: TwoNumber;
      if (treeNode.trunkLen > 0) {
        originPos = [paPos[0], paPos[1] - treeNode.trunkLen];
      } else {
        originPos = paPos;
      }
      const trunkD = this.genStraightLine([paPos, originPos]);
      pathDList.push(trunkD);

      // 处理 子位置节点
      if (chPosList.length > 1) {
        const firstPos = chPosList.shift();
        const finalPos = chPosList.pop();

        const firstD = this.genBrokenLine([originPos, [firstPos[0], originPos[1]], firstPos], radius);
        pathDList.push(firstD);
        const finalD = this.genBrokenLine([finalPos, [finalPos[0], originPos[1]], originPos], radius);
        pathDList.push(finalD);
        for (const chPos of chPosList) {
          const chD = this.genStraightLine([[chPos[0], originPos[1]], chPos]);
          pathDList.push(chD);
        }
      } else {
        const onlyD = this.genStraightLine([paPos, chPosList[0]]);
        pathDList.push(onlyD);
      }
    } else {
      // 计算起始位置
      let originPos: TwoNumber;
      if (treeNode.trunkLen > 0) {
        originPos = [paPos[0], paPos[1] + treeNode.trunkLen];
      } else {
        originPos = paPos;
      }
      const trunkD = this.genStraightLine([paPos, originPos]);
      pathDList.push(trunkD);

      // 处理 子位置节点
      if (chPosList.length > 1) {
        const firstPos = chPosList.shift();
        const finalPos = chPosList.pop();

        const firstD = this.genBrokenLine([firstPos, [firstPos[0], originPos[1]], originPos], radius);
        pathDList.push(firstD);
        const finalD = this.genBrokenLine([originPos, [finalPos[0], originPos[1]], finalPos], radius);
        pathDList.push(finalD);
        for (const chPos of chPosList) {
          const chD = this.genStraightLine([[chPos[0], originPos[1]], chPos]);
          pathDList.push(chD);
        }
      } else {
        const onlyD = this.genStraightLine([paPos, chPosList[0]]);
        pathDList.push(onlyD);
      }
    }
    return this.genSvgElement(pathDList);
  }

  /**
   * 计算一条线的 d 的实参
   * @param p 一点线的两个端点
   */
  private genStraightLine(p: [TwoNumber, TwoNumber]): string {
    return `M${p[0].join(' ')} L${p[1].join(' ')}`;
  }

  /**
   * 计算一条折线的 d 的实参
   * @param p 一条折线的三个端点
   * @param borderRadius 折点的圆角大小
   */
  private genBrokenLine(p: [TwoNumber, TwoNumber, TwoNumber], borderRadius: number): string {
    const p1 = p[0];
    const p3 = p[1];
    const p5 = p[2];
    const p2 = this.calcPoint(p3, p1, borderRadius);
    const p4 = this.calcPoint(p3, p5, borderRadius);

    return `M${p1.join(' ')} L${p2.join(' ')} M${p2.join(' ')}
    Q${p3.join(' ')} ${p4.join(' ')} M${p4.join(' ')} L${p5.join(' ')}`;
  }

  /**
   * 根据路径属性 d 的列表，生成相应的 svg 元素
   * @param pathDList 路径属性 d 的列表
   */
  private genSvgElement(pathDList: string[]): SVGSVGElement {
    const svg = d3.create('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .style('position', 'absolute')
      .style('top', 0)
      .style('left', 0);

    svg.append('g')
      .selectAll('path')
      .data(pathDList)
      .join('path')
      .attr('d', d => d)
      .attr('stroke', '#616161')
      .attr('fill', 'none');

    return svg.node();
  }

  /**
   * 求在向量ab(a->b)上，距离a为m的点。如果记该点为c, 则向量ac(a->c)的与向量ab(a->b)的方向一致。
   * @param a a点
   * @param b b点
   * @param m 距离
   */
  private calcPoint(a: TwoNumber, b: TwoNumber, m: number) {
    let k;
    const dy = b[1] - a[1];
    const dx = b[0] - a[0];
    if (dx < 0.01 && dy > 0) {
      k = dy / Math.abs(dy) * Math.PI / 2;
    } else if (dx < 0.01 && dy < 0.01) {
      return a;
    } else {
      k = dy / dx;
    }
    const x = m * Math.cos(k) + a[0];
    const y = m * Math.sin(k) + b[1];
    return [Math.round(x), Math.round(y)];
  }
}

