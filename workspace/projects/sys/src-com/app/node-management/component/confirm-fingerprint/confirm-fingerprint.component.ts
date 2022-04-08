import {
  Component,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  TiModalRef,
  TiSearchboxComponent,
  TiTableColumns,
  TiTableRowData,
} from '@cloud/tiny3';
import {
  BatchNodeInfo,
  BatchOptEvent,
  BatchOptType,
  NodeFingerprint,
} from '../../domain';
import {
  DispatchInfo,
  OpenModelFn,
  StateBaseOpreation,
  StateController,
} from '../../model';
import { I18n } from 'sys/locale';
import { BehaviorSubject, Subject } from 'rxjs';
import { HyMiniModalService } from 'hyper';

interface FingerprintForTable extends TiTableRowData {
  nodeName: string;
  nodeIp: string;
  fingerprint: {
    key_length: string;
    hash_type: string;
    finger_print: string;
    node_ip: string;
    key_type: string;
  }[];
}

@Component({
  selector: 'app-confirm-fingerprint',
  templateUrl: './confirm-fingerprint.component.html',
  styleUrls: ['./confirm-fingerprint.component.scss'],
})
export class ConfirmFingerprintComponent implements OnInit, StateBaseOpreation {
  @ViewChild('batchModal', { static: true }) batchModalTpl: TemplateRef<any>;
  @ViewChild('tiSearch') tiSearch: TiSearchboxComponent;

  @Output() inited = new BehaviorSubject<StateController>(null);
  @Output() dispatch = new Subject<DispatchInfo>();
  // 批量操作类型
  batchOptType: BatchOptType;
  batchOptTypeEnum = BatchOptType;
  closeOtherDetails = true;
  isShowSearchBox = false;
  searchInput = '';
  searchKeys: any[] = [];
  searchWords: any[] = [];
  nodeNameStyle = {
    left: '106px',
    top: '148px',
    'z-index': '1000',
    position: 'fixed',
  };
  nodeIpStyle = {
    left: '270px',
    top: '148px',
    'z-index': '1000',
    position: 'fixed',
  };
  table: any = {
    displayed: [] as Array<TiTableRowData>,
    srcData: {
      data: [],
      state: {
        searched: false,
        sorted: false,
        paginated: false,
      },
      columns: [] as Array<TiTableColumns>,
      pageNo: 1,
      pageSize: {
        options: [10, 20, 40, 80, 100],
        size: 10,
      },
      total: 0,
    },
  };

  private openModelRef: TiModalRef;
  private batchNodeInfo: BatchNodeInfo[];
  constructor(private miniModal: HyMiniModalService) {
    this.table.columns = [
      { label: '', prop: '', width: '5%' },
      { label: I18n.nodeManagement.nodeName, prop: 'nodeName', width: '20%' },
      { label: I18n.nodeManagement.nodeIp1, prop: ' nodeIp', width: '75%' },
    ];
  }

  ngOnInit(): void {
    this.inited.next({
      action: (
        payLoad: {
          nodeInfo: BatchNodeInfo[];
          fingerPrint: NodeFingerprint[];
        },
        openModel: OpenModelFn
      ) => {
        this.batchNodeInfo = payLoad.nodeInfo;
        this.table.srcData.data = this.transFingerprintForTable(
          payLoad.fingerPrint
        );
        this.setPreDetailShow(this.table.srcData.data);
        this.table.srcData.total = this.table.srcData.data.length;

        this.openModelRef = openModel(this.batchModalTpl, {
          dismiss: () => {
            this.dispatch.next({
              event: BatchOptEvent.Cancel,
            });
          },
        });
      },
      dismiss: () => {},
    });
  }

  // 唤起搜索框
  onSearchNode(key: string) {
    this.isShowSearchBox = true;
    if (key === 'nodeName') {
      this.searchKeys = ['nodeName'];
    } else if (key === 'nodeIp') {
      this.searchKeys = ['nodeIp'];
    }
  }

  // 失焦隐藏进程
  hideSearchBox() {
    this.searchWords[0] = '';
    this.isShowSearchBox = false;
  }

  onClear() {
    this.searchWords[0] = '';
  }

  // 输入内容搜索进程
  setSearch(value: string): void {
    this.searchWords[0] = value;
    this.isShowSearchBox = false;
  }

  beforeToggle(row: TiTableRowData): void {
    row.showDetails = !row.showDetails;
  }

  onCancel(_: any) {
    this.miniModal.open({
      type: 'warn',
      content: {
        title:
          BatchOptType.Import === this.batchOptType
            ? I18n.nodeManagement.cancelImport
            : I18n.nodeManagement.cancelDelet,
        body:
          BatchOptType.Import === this.batchOptType
            ? I18n.nodeManagement.cancelImportWarn
            : I18n.nodeManagement.cancelDeletWarn,
      },
      close: (): void => {
        this.openModelRef.close();
        this.dispatch.next({
          event: BatchOptEvent.Cancel,
        });
      },
      dismiss: () => {},
    });
  }

  onConfirm(_: any) {
    this.openModelRef.close();
    this.dispatch.next({
      event: BatchOptEvent.Confirm,
      payLoad: this.batchNodeInfo,
    });
  }

  /**
   * 转化后台接口数据格式为前台表格数据格式
   */
  private transFingerprintForTable(
    rawData: NodeFingerprint[]
  ): FingerprintForTable[] {
    const tableData = rawData.map((item) => {
      const rawPrint = item.fingerprint;
      const tablePrint = Object.values(rawPrint).reduce((sum, next) => {
        return sum.concat(next);
      });

      return { ...item, fingerprint: tablePrint };
    });

    return tableData;
  }

  /**
   * 设置第一行展开详情
   */
  private setPreDetailShow(data: FingerprintForTable[], preNum = 1) {
    for (let i = 0; i < preNum; i++) {
      data[i].showDetails = true;
    }
  }
}
