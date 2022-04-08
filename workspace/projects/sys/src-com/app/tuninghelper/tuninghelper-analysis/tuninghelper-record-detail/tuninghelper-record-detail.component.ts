import { Component, Input, OnInit, Output, ViewChild, OnDestroy, ElementRef, EventEmitter, } from '@angular/core';
import { HttpService, I18nService, TipService } from 'sys/src-com/app/service';
import { ZoomBoxDirective } from 'sys/src-com/app/shared/directives/zoom-box/zoom-box.directive';
import html2canvas from 'html2canvas';
import * as Utils from 'projects/sys/src-com/app/util';
import * as d3 from 'd3';
import { Subject, Subscription } from 'rxjs';
export const openHelper = new Subject<any>();
export const refSug = new Subject<any>();
const hardUrl: any = require('projects/sys/src-com/assets/hard-coding/url.json');
@Component({
  selector: 'app-tuninghelper-record-detail',
  templateUrl: './tuninghelper-record-detail.component.html',
  styleUrls: ['./tuninghelper-record-detail.component.scss']
})
export class TuninghelperRecordDetailComponent implements OnInit, OnDestroy {
  @ViewChild('zoomBox') zoomBox: ZoomBoxDirective;
  public i18n: any;
  @Input() taskDetail: any;
  @Input() projectName: any;
  @Input() taskName: any;
  @Input() status: any;
  @Input() currentTool: string;
  @Output() showInfoBox = new EventEmitter<any>();
  public taskId: any;
  public nodeId: any;
  public selectedServe: any;
  public serveOption: any;
  public top = 0;
  public left = 0;
  public pathData: any;
  public detailList: Array<any> = [];
  public name: string;
  public tabChangeLock = false;
  private nodeStatus: Array<any> = [];
  public nodataTip: object = { text: '' };
  public nodes: d3.HierarchyPointNode<any>[];
  public currentNode: d3.HierarchyNode<any>;
  public enterUrl = './assets/img/tuninghelper/enter-normal.svg';
  private lang = sessionStorage.getItem('language');
  public isIE = navigator.userAgent.indexOf('Trident') >= 0;
  public treeDepth: { [x: number]: number } = {};
  private refSugStatus: Subscription;
  constructor(
    private mytip: TipService,
    private http: HttpService,
    private i18nService: I18nService,
    private el: ElementRef<HTMLDivElement>,
  ) {
    this.i18n = this.i18nService.I18n();
  }
  ngOnInit(): void {
    this.name = this.taskDetail.level === 'task' ? this.taskDetail.taskname : this.taskDetail.nodeNickName;
    this.taskId = this.taskDetail.level === 'task' ? this.taskDetail.id : this.taskDetail.taskId;
    this.getNodeData();
    this.refSugStatus = refSug.subscribe((taskId) => {
      if (this.taskId === taskId ||  this.taskId === taskId.data) {
        this.getServeData(this.nodeId, true);
      }
    });
    document.addEventListener('click', (event) => {
      const searchBox = this.el.nativeElement.querySelector('.hidden-select');
      if (searchBox && (searchBox === event.target || searchBox.contains(event.target as Node))){
      } else if (this.serveOption){
        this.serveOption = null;
      }
    }, true);
  }

  ngOnDestroy(): void {
    this.refSugStatus?.unsubscribe();
    document.removeEventListener('click', this.serveOption = null, true);
  }
  /**
   * 树图
   */
  public drawSvg() {
    const canvasDom = (this.el.nativeElement.querySelector('#record-stack-box') as HTMLCanvasElement);
    if (canvasDom.querySelector('svg')) {
      canvasDom.removeChild(canvasDom.querySelector('svg'));
    }
    const hierarchyData = d3.hierarchy(this.pathData)
      .sum((d: any) => {
        return d.value;
      });
    this.geTreeDepth(hierarchyData);
    const maxHeight: number = Object.values(this.treeDepth).sort((a, b) => b - a)[0];
    const maxDepth = hierarchyData.height;
    const nodeHeight = maxHeight * 80;
    const nodeWidth = maxDepth * 300;
    const canvasClientRect = canvasDom.getBoundingClientRect();
    const width = canvasClientRect.width;
    const height = canvasClientRect.height;
    const addWidth = 150;
    this.left = width > nodeWidth ? (width - nodeWidth) / 2 : 0;
    this.top = height > nodeHeight ? (height - nodeHeight) / 2 : 0;
    const svg = d3.create('svg')
      .attr('viewBox', `0, 0, ${Math.max(nodeWidth + addWidth, width)},${Math.max(nodeHeight, height)}`)
      .attr('xmlns', hardUrl.w3cUrl)
      .attr('width', Math.max(nodeWidth + addWidth, width))
      .attr('height', Math.max(nodeHeight, height));
    const g = svg.append('g')
      .attr('transform', `translate(${this.left}, ${this.top})`);

    const uuid = Utils.generateConversationId(8);
    // 添加渐变
    const linear = svg.append('defs')
      .append('linearGradient')
      .attr('id', 'linear-' + uuid)
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '80%')
      .attr('y2', '0%');
    linear.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#979797');
    linear.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#cdcece');
    // 添加箭头
    const triangle = svg.append('defs')
      .append('marker')
      .attr('id', 'triangle-' + uuid)
      .attr('markerWidth', '5')
      .attr('markerHeight', '4')
      .attr('refX', '-2')
      .attr('refY', '2')
      .attr('orient', 'auto');
    triangle.append('path')
      .attr('d', 'M 0 0 L 2.5 2 L 0 4 z')
      .attr('stroke', '#cdcece')
      .attr('fill', '#cdcece');
    // 添加圆点
    const circle = svg.append('defs')
      .append('marker')
      .attr('id', 'circle-' + uuid)
      .attr('markerWidth', '4')
      .attr('markerHeight', '4')
      .attr('refX', '6')
      .attr('refY', '2')
      .attr('orient', 'auto');
    circle.append('circle')
      .attr('r', 2)
      .attr('cx', '2')
      .attr('cy', '2')
      .attr('fill', '#979797')
      .attr('stroke', 'none');

    const tree = d3.tree()
      .size([nodeHeight, nodeWidth])
      .separation((a, b) => {
        return a.parent === b.parent ? 1 : 2;
      });
    const treeData = tree(hierarchyData);
    this.nodes = treeData.descendants()
      .map((val: any, idx: number) => {
        if (val.data.task_id === this.taskId) {
          val.selected = true;
          this.currentNode = val;
        } else {
          val.selected = false;
        }
        return val;
      });
    const links = treeData.links();

    // 创建一个贝塞尔生成曲线生成器
    const BézierCurve = d3.linkHorizontal()
      .x((d) => d[1])
      .y((d) => d[0]);


    g.append('g')
      .selectAll('path')
      .data(links)
      .enter()
      .append('path')
      .attr('d', (d, idx) => {
        const start: [number, number] = [d.source.x, d.source.y + 140];
        const end: [number, number] = [d.target.x + 0.01, d.target.y];
        return BézierCurve({ source: start, target: end });
      })
      .attr('fill', 'none')
      .attr('stroke', `url(#linear-${uuid})`)
      .attr('stroke-width', 1)
      .attr('marker-end', `url(#triangle-${uuid})`)
      .attr('marker-start', `url(#circle-${uuid})`);


    const gs = g.append('g')
      .selectAll('g')
      .data(this.nodes)
      .enter()
      .append('g')
      .attr('transform', (d) => {
        const cx = d.x;
        const cy = d.y;
        return 'translate(' + cy + ',' + cx + ')';
      });

    const dom = svg.node();
    canvasDom.querySelector('.download-box').appendChild(dom);
  }
  /**
   * task点击事件, 切换task不更改树状图
   * @param msg 信息
   */
  public taskClick(msg: any) {
    this.currentNode = msg;
    if (msg.data.task_id !== this.taskId) {
      this.nodes.forEach((val: any) => {
        val.selected = val.data.task_name === msg.data.task_name ? true : false;
      });
      this.taskId = msg.data.task_id;
      this.getNodeData(true);
      this.tabChangeLock = true;
    }
  }

  /**
   * 获取树状图高度
   * @param data 树状图数据
   * @returns 数据高度
   */
  private geTreeDepth(data: d3.HierarchyNode<any>) {
    this.treeDepth[data.depth] ? this.treeDepth[data.depth]++ : this.treeDepth[data.depth] = 1;
    if (data.children) {
      data.children.forEach((val: d3.HierarchyNode<any>) => {
        this.geTreeDepth(val);
      });
    }
  }

  /**
   * 箭头点击事件
   * @param msg 信息
   */
  public arrowClick(msg: any) {
    this.enterUrl = './assets/img/tuninghelper/enter-active.svg';
    this.getTaskStatus(msg.data.task_id)
    .then((res: any) => {
        this.nodeStatus = res.data;
        if (!msg.data.node) { return; }
        if (msg.data.node.length > 1 && this.taskDetail.level === 'task') {
          this.serveOption = msg.data.node.map((val: any) => {
            val.taskId = msg.data.task_id;
            val.taskName = msg.data.task_name;
            return val;
          });
          const select = this.el.nativeElement.querySelector('.hidden-select') as HTMLElement;
          select.style.setProperty('top', msg.x + this.top + 23 + 'px');
          select.style.setProperty('left', msg.y + this.left + 90 + 'px');
        } else {
          let data;
          if (this.taskDetail.level === 'node') {
            data = {
              parent: [{ projectName: this.taskDetail.parent || this.taskDetail.task.parent },
              {
                taskname: msg.data.task_name, 'analysis-type': this.taskDetail['analysis-type']
                  || this.taskDetail.task['analysis-type']
              }],
              taskId: msg.data.task_id,
              nodeId: this.taskDetail.nodeId,
              nodeNickName: this.taskDetail.nodeNickName,
              taskType: this.taskDetail['analysis-type'] || this.taskDetail.task['analysis-type'],
              sampleStatus: res.data.find((val: { node_ip: any; }) => val.node_ip === this.taskDetail.nodeIP)?.status,
              nodeIP: this.taskDetail.nodeIP,
              analysisTarget: this.taskDetail['analysis-target'],
              ownerId: this.taskDetail.ownerId
            };
          } else {
            data = {
              parent: [{ projectName: this.taskDetail.parent || this.taskDetail.task.parent },
              {
                taskname: msg.data.task_name, 'analysis-type': this.taskDetail['analysis-type']
                  || this.taskDetail.task['analysis-type']
              }],
              taskId: msg.data.task_id,
              nodeId: msg.data.node[0].node_id,
              nodeNickName: msg.data.node[0].node_name,
              taskType: this.taskDetail['analysis-type'] || this.taskDetail.task['analysis-type'],
              sampleStatus: res.data.find((val: { node_ip: any; }) => val.node_ip === msg.data.node[0].ip)?.status,
              nodeIP: msg.data.node[0].ip,
              analysisTarget: this.taskDetail['analysis-target'],
              ownerId: this.taskDetail.ownerId
            };
          }
          openHelper.next(data);
        }
      });
  }

  /**
   * serve跳转
   */
  public async selectServe(el: any) {
    this.serveOption = null;
    const data = {
      parent: [{ projectName: this.taskDetail.parent || this.taskDetail.task.parent },
      {
        taskname: el.taskName, 'analysis-type': this.taskDetail['analysis-type'] ||
          this.taskDetail.task['analysis-type']
      }],
      taskId: el.taskId,
      nodeId: el.node_id,
      nodeNickName: el.node_name,
      sampleStatus: this.nodeStatus.find((val: { node_ip: any; }) => val.node_ip === el.ip)?.status,
      nodeIP: el.ip,
      analysisTarget: this.taskDetail['analysis-target'],
      ownerId: this.taskDetail.ownerId
    };
    openHelper.next(data);
  }

  /**
   * 跳转前判断任务是否已被删除
   * @param taskId taskId
   */
  private getTaskStatus(taskId: number) {
    return new Promise((resolve, reject) => {
      this.http.get('/tasks/' + encodeURIComponent(taskId) + '/optimization/task-exists/', {
        headers: {
          showLoading: false,
        }
      }).then((res: any) => {
        resolve(res);
      })
        .catch((error) => {
          if (this.currentTool === 'popTip') {
            this.showInfoBox.emit({ msg: this.i18n.tuninghelper.record.taskNotExists, type: 'warn' });
          } else {
            this.mytip.alertInfo({
              type: 'warn',
              content: this.i18n.tuninghelper.record.taskNotExists,
              time: 3500
            });
          }
          reject(error);
        });
    });
  }

  /**
   * 无优化建议跳转
   * @params item tab
   */
  public noDataClick(item: { taskId: number; nodeId: number; taskName: string; }) {
    const currentNodeId = item.nodeId;
    delete this.currentNode.children;
    delete this.currentNode.parent;
    const currentNode = JSON.parse(JSON.stringify(this.currentNode));
    const node = currentNode.data?.node.filter((val: { node_id: number; }) => {
      return val.node_id === currentNodeId;
    });
    currentNode.data.node = node;
    this.arrowClick(currentNode);
  }
  /**
   *    下载树图
   * @param fileName  文件名称
   */
  public downLandSvg() {
    this.zoomBox?.restore();
    html2canvas(document.querySelector('.download-box')).then((canvas: any) => {
      const fileName = this.projectName + '-' + this.name + this.i18n.tuninghelper.record.analysisPath + '.png';
      const img = canvas.toDataURL('image/png');
      if (this.currentTool === 'popTip') {
        const img1 = img.replace('data:image/png;base64,', '');
        const msg = {
          cmd: 'downloadFile',
          data: {
            fileName,
            fileContent: img1,
            contentType: 'base64',
            invokeLocalSave: true
          }
        };
        this.showInfoBox.emit({ msg, type: null });
      } else {
        // ie在客户端保存文件的方法
        if (window.navigator.msSaveOrOpenBlob) {
          const imgStr = atob(img.split(',')[1]);
          let n = imgStr.length;
          const u8Arr = new Uint8Array(n);
          while (n--) {
            u8Arr[n] = imgStr.charCodeAt(n);
          }
          const blob = new Blob([u8Arr]);
          window.navigator.msSaveOrOpenBlob(blob, fileName);
        } else {
          const a = document.createElement('a');
          a.href = img;
          document.body.appendChild(a);
          a.download = fileName;
          a.click();
          a.remove();
        }
      }
    });
  }
  /**
   * 获取node列表
   */
  public getNodeData(taskChange?: boolean) {
    this.http.get('/tasks/' + encodeURIComponent(this.taskId) + '/optimization/get-node-id/').then((res: any) => {
      const nodeIdArr = res.data;
      this.detailList = nodeIdArr.map((val: any) => {
        const item: object = {
          label: val.node_name,
          title: val.ip_address,
          nodeId: val.node_id,
          active: false,
          serve: [],
        };
        return item;
      });
      this.nodeId = this.taskDetail.level === 'node' ? this.taskDetail.nodeId : nodeIdArr[0].node_id;
      this.getServeData(this.nodeId, taskChange);
    });
  }
  /**
   * 获取建议数据及路径
   * @params nodeid 点击任务默认请求第一个nodeid,
   * is_valid 0 未知
   * is_valid 1 有效
   * is_valid 2 无效
   */
  public getServeData(nodeid: number, taskChange?: boolean) {
    this.http.get('/tasks/' + encodeURIComponent(this.taskId)
    + '/optimization/task-optimization-records/?node-id=' + encodeURIComponent(nodeid))
      .then((res: any) => {
        const recorData = res.data.records;
        const suggestData = res.data.suggestions.map((val: any) => {
          const item: any = {
            title: this.lang === 'zh-cn' ? val.indicator_describe_cn : val.indicator_describe_en,
            data: []
          };
          item.data = val.sub_title.map((item2: { sug_cn: any; sug_en: any; is_valid: number; id: any; }) => {
            const child = {
              title: this.lang === 'zh-cn' ? item2.sug_cn : item2.sug_en,
              effect: item2.is_valid === 1 ? true : false,
              invalid: item2.is_valid === 2 ? true : false,
              id: item2.id,
            };
            return child;
          });
          return item;
        });
        this.detailList.forEach((ele: any) => {
          if (nodeid === ele.nodeId) {
            ele.active = true;
            ele.serve = suggestData;
            ele.taskId = recorData.task_id;
            ele.taskName = recorData.task_name;
            ele.node = recorData.node.filter((val: { node_id: number; }) => {
              return val.node_id === nodeid;
            });
          } else {
            ele.active = false;
          }
        });
        this.tabChangeLock = false;
        if (!taskChange) {
          this.pathData = res.data.records;
          this.drawSvg();
        }

      });
  }

  /**
   * tab页签切换
   * @param e msg
   */
  public change(e: any) {
    if (e.active === true && !this.tabChangeLock) {
      this.nodeId = e.nodeId;
      this.getServeData(e.nodeId, true);
    }
  }
}
