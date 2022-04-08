import { Component, OnInit, Output, Renderer2, EventEmitter, OnDestroy, Input, SecurityContext } from '@angular/core';
import { I18nService } from '../../../../service/i18n.service';
import { AxiosService } from '../../../../service/axios.service';
import { TiTableColumns, TiTableRowData, TiTableSrcData, } from '@cloud/tiny3';
import { LibService } from '../../../../service/lib.service';
import { DomSanitizer } from '@angular/platform-browser';
@Component({
  selector: 'app-histogram-tree',
  templateUrl: './histogram-tree.component.html',
  styleUrls: ['./histogram-tree.component.scss']
})
export class HistogramTreeComponent implements OnInit, OnDestroy {

  @Input() articleOneAll: boolean;
  @Input() snapShot: boolean;
  @Input() recordId: any;
  @Input() moreSnapshotNum: any;
  @Input() startBtnDisabled: any;
  @Input() isDownload: any;
  @Input() rowData: any;
  @Input() treeType: any;
  @Input() goBack: any;
  @Input() appType: any;
  @Input() offlineHeapdump: boolean; // 是否是从离线报告，内存转储进入
  @Input() offlineHeapdumpId: string;
  @Output() private childOuter = new EventEmitter();
  constructor(
    public i18nService: I18nService,
    private Axios: AxiosService,
    private renderer: Renderer2,
    public libService: LibService,
    public domSanitizer: DomSanitizer
  ) {
    this.i18n = this.i18nService.I18n();
  }
  public i18n: any;
  public guardianId: any;
  public jvmId: any;
  public totalNumberT: any = 0;
  public totalRefObjectsT: any = 0;
  public totalSHallowHeapT: any = 0;
  public totalRefShallowHeapT: any = 0;
  public OGCRtotalNumberT: any = 0;
  public currentTotal: any = 0;
  public OGCRcurrentTotal: any = 0;
  public sortKeyTree: any = '';
  public OGCRsortKeyTree: any = '';
  public sortTypeTree: any = '';
  public OGCRsortTypeTree: any = '';
  public currentNode: any = {
    childNum: 20,
    className: '',
    classId: '',
    expand: true,
    id: -1,
    isOpen: false,
    level: 0,
    percentage: '',
    pid: -1,
    retainedHeap: 0,
    shallowHeap: 0,
    totalNum: 0
  };
  // 支配树heap walker
  public OGCRcurrentNode: any = {
    childNum: 20,
    className: '',
    classId: '',
    expand: true,
    id: -1,
    isOpen: false,
    level: 0,
    percentage: '',
    pid: -1,
    retainedHeap: 0,
    shallowHeap: 0,
    totalNum: 0
  };
  public refObjectsTSort: any = [];
  public shallowHeapTSort: any = [];
  public retainedHeapTSort: any = [];
  public refShallowHeapTSort: any = [];
  public OGCRretainedHeapTSort: any = [];
  public OGCRshallowHeapTSort: any = [];
  public sortList: any = [
    {
      id: 0,
      type: '',
      imgType: 'sort',
      show: true,
      left: '20%'
    },
    {
      id: 1,
      type: 'asc', // 升序
      imgType: 'sort-ascent',
      show: false,
      left: '32%'
    },
    {
      id: 2,
      type: 'desc', // 降序
      imgType: 'sort-descent',
      show: false,
      left: '28%'
    },
  ];
  public srcDataTree: TiTableSrcData;
  public OGCRDataTree: TiTableSrcData;
  public objectClassId: any;
  public objectClassName: any;
  public objectNumOfInstance: any;

  public displayedTree: Array<TiTableRowData> = []; // 表示表格实际呈现的数据（开发者默认设置为[]即可）
  public columnsTree: Array<TiTableColumns> = [];
  public OGCRTree: Array<TiTableRowData> = []; // 表示表格实际呈现的数据（开发者默认设置为[]即可）
  public OGCRColumnsTree: Array<TiTableColumns> = [];
  public resdata: any;
  public expandId = 0;
  public fatherIdList: Array<TiTableColumns> = [];
  public dataArray: Array<any> = [{
    title: 'soft Ref',
    val: 'needSoftRef',
    checked: true
  }, {
    title: 'weak Ref',
    val: 'needWeakRef',
    checked: false
  }, {
    title: 'phantom Ref',
    val: 'needPhantomRef',
    checked: false
  }];
  public mySCRLogs: any = {
    needSoftRef: true,
    needWeakRef: false,
    needPhantomRef: false
  };
  public myOGCLogs: any = {
    needSoftRef: true,
    needWeakRef: false,
    needPhantomRef: false
  };
  public treeHover: string;
  public isLoading: any = false;
  ngOnInit(): void {
    if (this.appType === 'snapshot') {
      this.objectClassId = '';
      this.objectNumOfInstance = this.moreSnapshotNum;
      this.objectClassName = this.rowData.className;
    } else {
      this.objectClassId = this.rowData.classId;
      this.objectNumOfInstance = this.rowData.numOfInstance;
    }
    this.jvmId = sessionStorage.getItem('jvmId');
    this.guardianId = sessionStorage.getItem('guardianId');
    this.refObjectsTSort = JSON.parse(JSON.stringify(this.sortList));
    this.shallowHeapTSort = JSON.parse(JSON.stringify(this.sortList));
    this.retainedHeapTSort = JSON.parse(JSON.stringify(this.sortList));
    this.refShallowHeapTSort = JSON.parse(JSON.stringify(this.sortList));
    this.OGCRretainedHeapTSort = JSON.parse(JSON.stringify(this.sortList));
    this.OGCRshallowHeapTSort = JSON.parse(JSON.stringify(this.sortList));
    this.columnsTree = [
      {
        title: this.i18n.profileMemorydump.tree.className,
        width: '40%',
        sortKey: ''
      },
      {
        title: this.i18n.profileMemorydump.tree.refObjects,
        width: '15%',
        sortKey: 'refObjects',
      },
      {
        title: this.i18n.profileMemorydump.tree.shallowHeap,
        width: '15%',
        sortKey: 'shallowHeap',
      },
      {
        title: this.i18n.profileMemorydump.tree.refShallowHeap,
        width: '15%',
        sortKey: 'refShallowHeap',
      },
      {
        title: this.i18n.profileMemorydump.tree.retainedHeap,
        width: '15%',
        sortKey: 'retainedHeap',
      }
    ];
    this.OGCRColumnsTree = [
      {
        title: this.i18n.profileMemorydump.tree.className,
        width: '60%',
        sortKey: ''
      },
      {
        title: this.i18n.profileMemorydump.tree.OGCRshallowHeap,
        width: '20%',
        sortKey: 'shallowHeap',
      },
      {
        title: this.i18n.profileMemorydump.tree.OGCRretainedHeap,
        width: '20%',
        sortKey: 'retainedHeap',
      },
    ];
    this.srcDataTree = {// 表格源数据，开发者对表格的数据设置请在这里进行
      data: [], // 源数据
      state: {
        searched: false, // 源数据未进行搜索处理
        sorted: false, // 源数据未进行排序处理
        paginated: false // 源数据未进行分页处理
      }
    };
    this.OGCRDataTree = {// 表格源数据，开发者对表格的数据设置请在这里进行
      data: [], // 源数据
      state: {
        searched: false, // 源数据未进行搜索处理
        sorted: false, // 源数据未进行排序处理
        paginated: false // 源数据未进行分页处理
      }
    };
    if (this.treeType === 'shortCommonRoute') {
      this.getDomtree(0);
    } else if (this.treeType === 'objectWithGcRootsRoute') {
      this.getOGCRDomtree();
    }
  }
  ngOnDestroy(): void {
    this.isLoading = false;
  }

  public getDomtree(currentTotal: any) {
    this.isLoading = true;
    if (this.isDownload || this.startBtnDisabled) { return; }
    const params = this.mySCRLogs;
    params.predecessorId = this.currentNode.id;
    params.currentTotal = currentTotal;
    params.size = 20;
    params.analysisId = this.objectClassId;
    params.className = this.objectClassName;
    params.instanceCount = this.objectNumOfInstance;
    params.sortBy = this.sortKeyTree;
    params.position = this.currentNode.position;
    params.preClassId = this.currentNode.classId;
    params.sort = this.sortTypeTree;
    let url: string;
    if (this.offlineHeapdump) {
      url = `/heap/${this.offlineHeapdumpId}/query/shortest2root`;
    } else {
      const encodeGuardianId = encodeURIComponent(this.guardianId);
      const encodeJvmId = encodeURIComponent(this.jvmId);
      const encodeRecordId = encodeURIComponent(this.recordId);
      url = `/guardians/${encodeGuardianId}/jvms/${encodeJvmId}/heaps/${encodeRecordId}/shortest2root`;
    }
    this.Axios.axios.post(url, params, { headers: { showLoading: false } }).then((res: any) => {
      this.isLoading = false;
      res.members.forEach((item: any) => {
        item.level = this.currentNode.id === -1 ? 0 : this.currentNode.level + 1;
        item.levelArr = this.counter(item.level);
        item.pId = this.currentNode.id === -1 ? 'tiTableRoot' : this.currentNode.id;
        item.isShow = this.currentNode.id === -1 ? true : false;
        item.isOpen = false;
        item.firstAdd = 0;  // 用于判断是否第一次展开 0->请求数据; 1->仅展开收起
        item.totalNum = 0;  // 当前层级的总数量
        item.childNum = 0;  // 子树的数量
        item.flag = 0; // 0代表第一次展开，1代表点击查看更多
        item.percentage = (100 * item.percentage).toFixed(2);
      });

      // 合并树的数据
      if (this.currentNode.id === -1) {
        this.srcDataTree.data.push.apply(this.srcDataTree.data, res.members);
        this.totalNumberT = res.totalElements;
        this.totalRefObjectsT = res.totalRefObjects;
        this.totalSHallowHeapT = res.totalSHallowHeap;
        this.totalRefShallowHeapT = res.totalRefShallowHeap;
        this.currentTotal += res.members.length;
      } else {
        const childList = this.srcDataTree.data.filter(item => {
          return item.pId === this.currentNode.id && item.level === this.currentNode.level + 1;
        });
        let insertNode: any;  // 获取插入子树的位置
        if (childList.length > 0) {
          const lastChildId = childList[childList.length - 1].id;
          insertNode = (e: any) => e.id === lastChildId; // 无children时插入父级后面
        } else {
          insertNode = (e: any) => e.id === this.currentNode.id;  // 有子树时插入最后一个child后面
        }
        const cId = this.srcDataTree.data.findIndex(insertNode); // 获取定位node节点的id
        this.srcDataTree.data.splice(cId + 1, 0, ...res.members); // 继续向最后一个孩子后面插入children
        this.currentNode.totalNum = res.totalElements;  // 获取某一个树的同层级总数
        this.currentNode.childNum += res.members.length; // 当前节点的children个数
        this.currentNode.lastChildId = res.members[res.members.length - 1].id; // 获取当前节点最后一个子树的id
      }
      this.toggleChildren(this.srcDataTree.data, this.currentNode.id, this.currentNode.isOpen); // 显示新获取的数据
      if (document.getElementsByClassName(`${this.currentNode.id}load`)[0]) {
        const loadNode = document.getElementsByClassName(`${this.currentNode.id}load`)[0];
        loadNode.parentNode.removeChild(loadNode);
      }
      let tempTimer = setTimeout(() => {
        this.creatLoadMore();
        clearTimeout(tempTimer);
        tempTimer = null;
      }, 0);
    }).catch(() => {
      this.isLoading = false;
    });
  }
  public onHoverList(label?: any) {
    this.treeHover = label;
  }
  public onChangeSCR(val: any, event: any): void {
    if (val in this.mySCRLogs) {
      this.mySCRLogs[val] = event;
    }
    this.currentNode.id = -1;
    this.currentTotal = 0;
    this.totalNumberT = 0;
    this.totalRefObjectsT = 0;
    this.totalSHallowHeapT = 0;
    this.totalRefShallowHeapT = 0;
    this.srcDataTree.data = [];
    this.getDomtree(0);
  }
  public goHistogram(val: any) {
    this.childOuter.emit(val);
  }
  // 表格层级偏移位置计算
  public getLevelStyle(node: any): { 'padding-left': string } {
    return {
      'padding-left': `${node.level * 37 + 10}px`
    };
  }
  public getBorder(node: any): { 'margin-left': string } {
    return {
      'margin-left': `${node.level * 37}px`
    };
  }
  // 获取前面蓝色背景标记循环个数
  public counter(level: number) {
    const arr = [];
    for (let i = 0; i <= level; i++) {
      arr.push(i);
    }
    return arr;
  }// 蓝色标记定位距离计算
  public getbgLevelStyle(node: any, index: any): { 'left': string } {
    return {
      left: `${(index - 1) * 37}px`
    };
  }
  // tableRoot层级的查看更多
  public loadMore(currentTotal: any) {
    this.currentNode = {
      childNum: 20,
      className: '',
      expand: true,
      id: -1,
      isOpen: false,
      level: 0,
      percentage: '',
      pid: -1,
      retainedHeap: 0,
      shallowHeap: 0,
      totalNum: 0
    };
    this.getDomtree(currentTotal);
  }
  // pArray: 父级数据， pLevel: 父级层数


  // 当前node的展开收起
  async toggle(node: any) {
    node.firstAdd += 1;
    this.currentNode = node;
    node.isOpen = !node.isOpen;
    if (!node.isOpen) {
      if (document.getElementsByClassName(`${this.currentNode.id}load`)[0]) {
        const loadNode = document.getElementsByClassName(`${this.currentNode.id}load`)[0];
        loadNode.parentNode.removeChild(loadNode);
      }
    } else {
      await this.creatLoadMore();
    }
    if (node.firstAdd > 1) {
      this.toggleChildren(this.srcDataTree.data, node.id, node.isOpen);  // 不是第一次展开，仅展开;
      return;
    } else {
      await this.getDomtree(node.childNum);  // 若为第一次展开，请求数据;//若为第一次展开，请求数据;
    }
  }
  // 创建 查看更多元素
  public creatLoadMore() {
    if (this.snapShot || this.isDownload || this.startBtnDisabled || this.currentNode.id === -1) { return; }
    if (this.currentNode.childNum < this.currentNode.totalNum) {
      // 创建元素
      const load = document.createElement('tr');
      load.className = `${this.currentNode.id}load`;
      let blueBg = ``;
      for (let i = 0; i <= this.currentNode.level; i++) {
        const bg = `<span style='position: absolute;width: 35px;
        height: 43px;top: 0;left:${i * 37}px;background-color: #f5f9ff;
          border-right:2px solid #0067ff;'></span>`;
        blueBg += bg;
      }
      const html = `<td style='border-bottom:none;position:relative;padding-left:${this.currentNode.level * 36 + 45}px;
        font-size: 12px; font-weight: 400;z-index:1'>
      ${blueBg}
      <span style="margin-right: 20px;color:#0067ff;cursor: pointer;"><span id='${this.currentNode.id}More'>
      ${this.i18n.protalserver_profiling_memoryDump.loadMore}</span></span>
      <span style="margin-right: 10px;">${this.i18n.protalserver_profiling_memoryDump.currentShow}：
      ${this.domSanitizer.sanitize(SecurityContext.HTML, this.currentNode.childNum)}</span>
      <span style="margin-right: 10px;">${this.i18n.protalserver_profiling_memoryDump.totalNum}：
      ${this.domSanitizer.sanitize(SecurityContext.HTML, this.currentNode.totalNum)}</span>
      <span style="margin-right: 10px;">${this.i18n.protalserver_profiling_memoryDump.Remain}：
      ${this.domSanitizer.sanitize(SecurityContext.HTML, this.currentNode.totalNum - this.currentNode.childNum)}</span>
      <span style="margin-left:${(this.currentNode.level + 1) * 37}px;width:100%;display:inline-block;left:0;
        border-bottom: 1px solid #e1e6ee;position: absolute;bottom: 0;">
      </td><td></td><td></td><td></td>`;
      load.innerHTML = html;
      $(load).insertAfter(`.${this.currentNode.lastChildId}`);
      const lookMore = document.getElementById(`${this.currentNode.id}More`);
      lookMore.addEventListener('click', (event) => {
        this.currentNode.flag = 1;
        const data: any = event.target;
        const loadId = Number(data.id.replace(/[a-zA-Z]/g, ''));
        const currentNode = this.srcDataTree.data.filter(item => {
          return item.id === loadId;
        });
        this.currentNode = currentNode[0];
        this.currentNode.id = this.currentNode.id;
        this.getDomtree(this.currentNode.childNum);
      });
    } else {
      return;
    }
  }

  // 父级收起展开时控制子树的展示与隐藏
  private toggleChildren(data: Array<any>, id: any, pExpand: boolean): void {
    for (const node of data) {
      if (node.pId === id) {
        node.isShow = pExpand; // 处理当前子节点
        if (pExpand === false) {// 折叠时递归处理当前节点的子节点
          this.toggleChildren(data, node.id, false);
          if (document.getElementsByClassName(`${node.id}load`)[0]) {
            const loadNode = document.getElementsByClassName(`${node.id}load`)[0];
            this.renderer.setProperty(loadNode, 'hidden', true);
          }
        } else {  // 展开时递归处理当前节点的子节点
          if (node.isOpen === true) {
            this.toggleChildren(data, node.id, true);
            if (!this.snapShot) {
              if (document.getElementsByClassName(`${node.id}load`)[0]) {
                const loadNode = document.getElementsByClassName(`${node.id}load`)[0];
                this.renderer.setProperty(loadNode, 'hidden', false);
              }
            }
          }
        }
      }
    }
  }
  // 支配树排序
  public getDominantTreeSort(idx: any, sortKey: any) {
    if (this.srcDataTree.data.length === 0) { return; }
    // normal
    this.currentTotal = 0;
    this.refObjectsTSort = JSON.parse(JSON.stringify(this.sortList));
    this.shallowHeapTSort = JSON.parse(JSON.stringify(this.sortList));
    this.retainedHeapTSort = JSON.parse(JSON.stringify(this.sortList));
    this.refShallowHeapTSort = JSON.parse(JSON.stringify(this.sortList));
    if (idx > 1) {
      idx = 0;
    } else {
      idx++;
    }
    if (sortKey === 'refObjects') {
      this.refObjectsTSort.forEach((item: any) => {
        item.show = false;
      });
      this.refObjectsTSort[idx].show = true;
    }
    if (sortKey === 'shallowHeap') {
      this.shallowHeapTSort.forEach((item: any) => {
        item.show = false;
      });
      this.shallowHeapTSort[idx].show = true;
    }
    if (sortKey === 'refShallowHeap') {
      this.refShallowHeapTSort.forEach((item: any) => {
        item.show = false;
      });
      this.refShallowHeapTSort[idx].show = true;
    }
    if (sortKey === 'retainedHeap') {
      this.retainedHeapTSort.forEach((item: any) => {
        item.show = false;
      });
      this.retainedHeapTSort[idx].show = true;
    }
    this.sortTypeTree = this.sortList[idx].type;
    if (!this.sortTypeTree){
      this.sortKeyTree = '';
    } else{
      this.sortKeyTree = sortKey;
    }
    this.srcDataTree.data = [];
    this.currentNode.id = -1;
    this.getDomtree(0);
  }

  public toStringClass(num: any) {
    return num.toString();
  }
  // 支配树heap walker
  public getOGCRDomtree() {
    if (this.isDownload || this.startBtnDisabled) { return; }
    this.isLoading = true;
    const params = this.myOGCLogs;
    params.predecessorId = this.rowData.id;
    params.sortBy = this.OGCRsortKeyTree;
    params.sort = this.OGCRsortTypeTree;
    let url: string;
    if (this.offlineHeapdump) {
      url = `/heap/${this.offlineHeapdumpId}/query/path2root`;
    } else {
      const encodeGuardianId = encodeURIComponent(this.guardianId);
      const encodeJvmId = encodeURIComponent(this.jvmId);
      const encodeRecordId = encodeURIComponent(this.recordId);
      url = `/guardians/${encodeGuardianId}/jvms/${encodeJvmId}/heaps/${encodeRecordId}/path2root`;
    }
    this.Axios.axios.post(url, params, { headers: { showLoading: false } }).then((res: any) => {
      this.resdata = res.data;
      const array = [this.deepClone(this.rowData)];
      if (this.resdata.length > 0) {
        array[0].needOpen = true;
        array[0].expand = true;
      } else {
        array[0].expand = false;
      }
      array[0].isShow = true;
      array[0].childList = this.resdata;
      const tableArr: Array<any> = [];
      this.changeTree(array, tableArr);
      this.OGCRDataTree.data = tableArr;
      this.isLoading = false;
    }).catch(() => {
      this.isLoading = false;
    });
  }
  public changeTree(pArray: Array<any>, tableArr?: Array<any>, pLevel?: number, pNode?: any) {
    pLevel = pLevel === undefined ? 0 : pLevel + 1;
    for (const item of pArray) {
      item.level = pLevel;
      item.levelArr = this.OGCRCounter(item.level);
      if (pNode !== undefined) {
        item.isShow = pNode.needOpen;
      }
      item.pId = pNode === undefined ? 'tiTableRoot' : pNode.id;
      tableArr.push(item); // 也可以在此循环中做其他格式化处理
      if (item.needOpen && item.childList && item.childList.length) {
        item.hasData = true;
        this.changeTree(item.childList, tableArr, pLevel, item);
      }
    }
  }

  public OGCRtoggle(node: any): void {
    node.needOpen = !node.needOpen;
    const treeArr = this.OGCRDataTree.data;
    const nodeChildList = node.childList;
    nodeChildList.forEach((item: any) => {
      item.level = node.level + 1;
      item.levelArr = this.counter(item.level);
      item.pId = node.id;
    });
    if (!node.hasData) {
      this.OGCRDataTree.data.splice(treeArr.indexOf(node) + 1, 0, ...nodeChildList);
      node.hasData = true;
    }
    this.toggleChildren1(node, node.needOpen);
  }

  private toggleChildren1(data: any, isShow: any): void {
    for (const node of data.childList) {
      if (node.pId === data.id) {
        node.isShow = isShow; // 处理当前子节点
        if (node.childList && node.needOpen) {// 折叠时递归处理当前节点的子节点
          this.toggleChildren1(node, isShow);
        }
      }
    }
  }
  private deepClone(obj: any): any { // 深拷贝，类似于1.x中的angular.copy() TODO: 是否需要将该方法写进组件
    if (typeof (obj) !== 'object' || obj === null) {
      return obj;
    }

    let clone: any;

    clone = Array.isArray(obj) ? obj.slice() : { ...obj };

    const keys: Array<string> = Object.keys(clone);

    for (const key of keys) {
      clone[key] = this.deepClone(clone[key]);
    }

    return clone;
  }

  // 表格层级偏移位置计算
  public getOGCRLevelStyle(node: any): { 'padding-left': string } {
    return {
      'padding-left': `${node.level * 37 + 10}px`
    };
  }
  public getOGCRBorder(node: any): { 'margin-left': string } {
    return {
      'margin-left': `${node.level * 37}px`
    };
  }
  // 获取前面蓝色背景标记循环个数
  public OGCRCounter(level: number) {
    const arr = [];
    for (let i = 0; i <= level; i++) {
      arr.push(i);
    }
    return arr;
  }// 蓝色标记定位距离计算
  public getOGCRbgLevelStyle(node: any, index: any): { 'left': string } {
    return {
      left: `${(index - 1) * 37}px`
    };
  }

  // 支配树排序
  public getOGCRDominantTreeSort(idx: any, sortKey: any) {
    if (this.OGCRDataTree.data.length === 0) { return; }
    // normal
    this.OGCRretainedHeapTSort = JSON.parse(JSON.stringify(this.sortList));
    this.OGCRshallowHeapTSort = JSON.parse(JSON.stringify(this.sortList));
    if (idx > 1) {
      idx = 0;
    } else {
      idx++;
    }
    if (sortKey === 'retainedHeap') {
      this.OGCRretainedHeapTSort.forEach((item: any) => {
        item.show = false;
      });
      this.OGCRretainedHeapTSort[idx].show = true;
    }
    if (sortKey === 'shallowHeap') {
      this.OGCRshallowHeapTSort.forEach((item: any, index: any) => {
        item.show = false;
      });
      this.OGCRshallowHeapTSort[idx].show = true;
    }
    this.OGCRsortTypeTree = this.sortList[idx].type;
    if (!this.OGCRsortTypeTree){
      this.OGCRsortKeyTree = '';
    } else{
      this.OGCRsortKeyTree = sortKey;
    }
    this.OGCRDataTree.data = [];
    this.getOGCRDomtree();
  }
  public onChangeOGC(val: any, event: any): void {
    if (val in this.myOGCLogs) {
      this.myOGCLogs[val] = event;
    }
    this.OGCRDataTree.data = [];
    this.getOGCRDomtree();
  }

}
