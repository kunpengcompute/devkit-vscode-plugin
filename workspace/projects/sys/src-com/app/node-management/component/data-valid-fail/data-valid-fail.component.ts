import {
  Component,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { BatchOptEvent, BatchNodeErrorInfo, BatchOptType } from '../../domain';
import {
  StateController,
  DispatchInfo,
  StateBaseOpreation,
  OpenModelFn,
} from '../../model';
import { TiModalRef, TiTableSrcData } from '@cloud/tiny3';
import { CommonTableData, CommonTreeNode } from 'sys/src-com/app/shared/domain';
import { Cat } from 'hyper';
import { I18n } from 'sys/locale';
import { BehaviorSubject, Subject } from 'rxjs';
import { VerificationWay } from '../../util';

@Component({
  selector: 'app-data-valid-fail',
  templateUrl: './data-valid-fail.component.html',
  styleUrls: ['./data-valid-fail.component.scss'],
})
export class DataValidFailComponent implements OnInit, StateBaseOpreation {
  @ViewChild('batchModal', { static: true }) batchModalTpl: TemplateRef<any>;

  @Output() inited = new BehaviorSubject<StateController>(null);
  @Output() dispatch = new Subject<DispatchInfo>();

  // 批量操作类型
  batchOptType: BatchOptType;
  batchOptTypeEnum = BatchOptType;
  processTableData: CommonTableData = {
    srcData: {
      data: [],
      state: {
        searched: false,
        sorted: false,
        paginated: false,
      },
    } as TiTableSrcData,
    columnsTree: [],
  };

  private openModelRef: TiModalRef;
  isNothing = (obj: any) => Cat.isNil(obj) || Cat.isEmpty(obj);

  constructor() {}

  ngOnInit(): void {
    this.inited.next({
      action: (payLoad: BatchNodeErrorInfo[], openModel: OpenModelFn) => {
        this.processTableData.srcData.data = this.getPureNodeInfo(payLoad);
        this.processTableData.columnsTree = this.getNodeInfoCols(
          this.batchOptType
        );
        this.processTableData = { ...this.processTableData };
        this.openModelRef = openModel(this.batchModalTpl, {
          dismiss: () => {
            this.dispatch.next({
              event: BatchOptEvent.Close,
            });
          },
        });
      },
    });
  }

  onModelClose(_: any) {
    this.openModelRef.close();
    this.dispatch.next({
      event: BatchOptEvent.Close,
    });
  }

  private getPureNodeInfo(nodeInfo: BatchNodeErrorInfo[]) {
    return nodeInfo.map((node) => {
      return {
        ...node,
        verification_method: {
          value: VerificationWay.markToLang(node.verification_method.value),
          error: node.verification_method.error,
        },
      };
    }).filter(node => {
      return Object.values(node).some(item => item.error && !Cat.isEmpty(item.error));
    });
  }

  private getNodeInfoCols(batchOptState: BatchOptType): CommonTreeNode[] {
    const columns = [
      {
        key: 'count',
        label: I18n.nodeManagement.No,
        width: '7%',
        checked: true,
        canClick: true,
      },
      {
        key: 'node_name',
        label: I18n.nodeManagement.nodeName,
        width: '10%',
        checked: true,
        searchKey: 'node_name',
        canClick: true,
        hidden: BatchOptType.Delete === batchOptState,
      },
      {
        key: 'ip',
        label: I18n.nodeManagement.nodeIp1,
        width: '12%',
        checked: true,
        searchKey: 'ip',
      },
      {
        key: 'port',
        label: I18n.nodeManagement.nodePort,
        width: '7%',
        checked: true,
        hidden: BatchOptType.Delete === batchOptState,
      },
      {
        key: 'agent_install_path',
        label: I18n.nodeManagement.installPath,
        width: '9%',
        checked: true,
        hidden: BatchOptType.Delete === batchOptState,
      },
      {
        key: 'user_name',
        label: I18n.nodeManagement.userName,
        width: '9%',
        checked: true,
        searchKey: 'user_name',
      },
      {
        key: 'verification_method',
        label: I18n.nodeManagement.authenticationMode,
        width: '9%',
        checked: true,
      },
      {
        key: 'password',
        label: I18n.nodeManagement.password,
        width: '9%',
        checked: true,
        isSecret: true
      },
      {
        key: 'identity_file',
        label: I18n.nodeManagement.keyFile,
        width: '9%',
        checked: true,
        isSecret: true
      },
      {
        key: 'passphrase',
        label: I18n.nodeManagement.passphrase,
        width: '9%',
        checked: true,
        isSecret: true
      },
      {
        key: 'root_password',
        label: I18n.nodeManagement.pwOfRoot,
        width: '10%',
        checked: true,
        isSecret: true
      },
    ];

    return columns.filter((item) => !item.hidden);
  }
}
