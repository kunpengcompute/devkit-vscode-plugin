import {
  Component,
  EventEmitter,
  TemplateRef,
  Input,
  OnInit,
  Output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  TiModalConfig,
  TiModalService,
  TiTableColumns,
  TiTableRowData,
} from '@cloud/tiny3';
import { NodeRankInfo, RankSetControl } from '../../../domain';
import { I18n } from 'sys/locale';

@Component({
  selector: 'app-rank-number-set',
  templateUrl: './rank-number-set.component.html',
  styleUrls: ['./rank-number-set.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class RankNumberSetComponent implements OnInit {
  static MIN_RANK_NUM = 1;
  static MAX_RANK_NUN = 128;

  @ViewChild('configRankModal', { static: true })
  configRankModal: TemplateRef<any>;

  // 组件初始化完成
  @Input()
  set nodeInfoList(val: NodeRankInfo[]) {
    if (null == val) {
      return;
    }
    this.data = JSON.parse(JSON.stringify(val));
    this.nodeInfoListStash = val;
    this.searchListsSave = JSON.parse(JSON.stringify(val));
  }
  get nodeInfoList() {
    return this.nodeInfoListStash;
  }
  @Output() inited = new EventEmitter<RankSetControl>();
  @Output() updateData = new EventEmitter<NodeRankInfo[]>();

  formData = {
    rankNum: {
      label: I18n.hpc.mission_create.rankNums,
      required: false,
      value: 4,
    },
    nodeRange: {
      label: I18n.hpc.mission_create.nodeRange,
      required: false,
      value: 1,
    },
    allNodes: {
      label: I18n.hpc.mission_create.allNodes,
      required: false,
      value: 1,
    },
    specifiedNode: {
      label: I18n.hpc.mission_create.specifiedNode,
      required: false,
      value: 2,
    },
  };
  nodeInfoListStash: NodeRankInfo[];

  data: NodeRankInfo[] = [];
  selectNode = 1; // 默认选择全部节点
  displayed: Array<TiTableRowData> = [];
  srcData: TiTableRowData = {
    data: [],
    state: {
      searched: false, // 源数据未进行搜索处理
      sorted: false, // 源数据未进行排序处理
      paginated: false, // 源数据未进行分页处理
    },
  };
  columns: Array<TiTableColumns> = [
    {
      title: I18n.common_term_node_ip,
      width: '30%',
      showSort: false,
      showSearch: true,
      searchKey: 'nodeIp',
    },
    {
      title: I18n.nodeManagement.nodeName,
      width: '30%',
      showSort: false,
      showSearch: true,
      searchKey: 'nickName',
    },
    {
      title: I18n.hpc.mission_create.rankNum,
      width: '30%',
      showSort: true,
      sortKey: 'rank',
      showSearch: false,
    },
  ];
  checkedList: Array<NodeRankInfo> = [];
  checkedListStash: Array<NodeRankInfo> = [];
  // 分页
  currentPage = 1;
  totalNumber: number;
  pageSize: { options: Array<number>; size: number } = {
    options: [10, 20, 50, 100],
    size: 10,
  };
  isShowAll = true;

  // 表格搜索
  searchWordsSave: { [key: string]: string } = {
    node: '',
    nickName: '',
  };
  private searchListsSave: Array<NodeRankInfo> = [];
  private propagateChange = (_: NodeRankInfo) => {};
  private propagateTunched = (_: any) => {};

  constructor(private tiModal: TiModalService) {}

  ngOnInit(): void {
    this.inited.emit({
      action: (nodeInfoList: NodeRankInfo[]) => {
        this.data = JSON.parse(JSON.stringify(nodeInfoList));
        // 给表格参数赋值
        this.srcData.data = this.data;
        this.totalNumber = this.data.length;
        this.checkedList = [];
        if (this.checkedListStash.length) {
          this.checkedList = this.checkedListStash.map((item: NodeRankInfo) => {
            const s = this.srcData.data.find(
              (rankItem: NodeRankInfo) => item.id === rankItem.id
            );
            return s;
          });
        }

        this.checkedList = this.selectNode === 1 ? this.data : this.checkedList;

        // 打开model, 并获取其引用
        this.tiModal.open(this.configRankModal, {
          id: 'configRankModal',
          modalClass: 'config-rank-class custemModal smallModal',
        } as TiModalConfig);
      },
    });
  }
  onBlurRankNumVerify() {
    switch (true) {
      case this.formData.rankNum.value < RankNumberSetComponent.MIN_RANK_NUM:
        this.formData.rankNum.value = RankNumberSetComponent.MIN_RANK_NUM;
        break;
      case this.formData.rankNum.value > RankNumberSetComponent.MAX_RANK_NUN:
        this.formData.rankNum.value = RankNumberSetComponent.MAX_RANK_NUN;
        break;
      default:
        break;
    }
  }

  /**
   * 表头搜索弹框点击搜索事件监控
   * @param searchText 搜索文本
   * @param column 搜索列
   */
  onTableHeaderSearch(searchText?: any, column?: any) {
    this.searchWordsSave[column.searchKey] = searchText;
    // 过滤后展示数据
    let nodeInfoList: any[];
    if (searchText) {
      nodeInfoList = this.data.filter(
        (nodeItem: any) => nodeItem[column.searchKey].indexOf(searchText) > -1
      );
    } else {
      nodeInfoList = JSON.parse(JSON.stringify(this.searchListsSave));
    }
    this.srcData.data = nodeInfoList;
    this.totalNumber = this.srcData.data.length;

    // 处理选中的数据
    const checkedListStash = JSON.parse(JSON.stringify(this.checkedList));
    this.checkedList = [];
    checkedListStash.forEach((node: any) => {
      nodeInfoList.map((nodeItem: any, index: number) => {
        if (node.id === nodeItem.id) {
          this.checkedList.push(nodeInfoList[index]);
        }
      });
    });
  }

  // 点击确认
  onConfigRankClick(context: any): void {
    this.onApplyClick();
    context.close();
  }

  // 点击应用
  onApplyClick(): void {
    const selectID = this.checkedList.map((item: NodeRankInfo) => {
      return item.id;
    });
    this.srcData.data.forEach((item: NodeRankInfo) => {
      if (selectID.indexOf(item.id) !== -1) {
        item.rank = this.formData.rankNum.value;
      }
    });
    this.checkedListStash = this.checkedList;
    if (this.srcData.data.length) {
      this.updateData.emit(this.srcData.data);
    }
  }

  ngModelChange($event: any): void {
    if (this.selectNode === 1) {
      // 全部节点
      this.srcData.data = this.data;
      this.checkedList = this.data;
    } else {
      // 指定节点
      this.checkedList = [];
      this.srcData.data = this.isShowAll ? this.data : this.checkedList;
    }
  }

  onChangeTableInfo(bool: boolean) {
    this.isShowAll = bool;

    if (this.selectNode === 2) {
      this.srcData.data = bool ? this.data : this.checkedList;
    }
  }

  trackByFn(index: number, item: any): number {
    return item.id;
  }
}
