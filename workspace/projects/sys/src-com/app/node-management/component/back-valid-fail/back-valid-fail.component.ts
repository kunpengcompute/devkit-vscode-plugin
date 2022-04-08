import { Output, TemplateRef, ViewChild } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import {
  DispatchInfo,
  OpenModelFn,
  StateBaseOpreation,
  StateController,
} from '../../model';
import { TiModalRef, TiTableSrcData } from '@cloud/tiny3';
import { CommonTableData, CommonTreeNode } from 'sys/src-com/app/shared/domain';
import { BatchOptEvent, BatchOptType, VerificationMethod } from '../../domain';
import { BehaviorSubject, Subject } from 'rxjs';
import { I18n } from 'sys/locale';
import { VerificationWay } from '../../util';

type BackValidFailInfo = {
  install_path: string; // 安装路径
  ipaddr: string; // ip
  node_id?: number; // 序号
  node_name: string; // 节点名称
  node_port: string; // 端口
  password: string; // 口令
  root_password: string; // root用户密码
  ssh_user: string; // 用户名
  verification_method: VerificationMethod; // 认证方式
  identity_file: string; // 私钥文件
  passphrase: string; // 密码短语
};

@Component({
  selector: 'app-back-valid-fail',
  templateUrl: './back-valid-fail.component.html',
  styleUrls: ['./back-valid-fail.component.scss'],
})
export class BackValidFailComponent implements OnInit, StateBaseOpreation {
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
  srcData = { data: [] as BackValidFailInfo[] };
  private openModelRef: TiModalRef;

  constructor() {}

  ngOnInit(): void {
    this.inited.next({
      action: (payLoad: BackValidFailInfo[], openModel: OpenModelFn) => {
        this.processTableData.srcData.data =
          this.getPureBackValidFailInfo(payLoad);
        this.processTableData = { ...this.processTableData };
        this.processTableData.columnsTree = this.getNodeInfoCols(
          this.batchOptType
        );
        this.openModelRef = openModel(this.batchModalTpl, {
          dismiss: () => {
            this.dispatch.next({
              event: BatchOptEvent.Close,
            });
          },
        });
      },
      dismiss: () => {},
    });
  }

  onModelClose(_: any) {
    this.openModelRef.close();
    this.dispatch.next({
      event: BatchOptEvent.Close,
    });
  }

  private getPureBackValidFailInfo(nodeInfo: BackValidFailInfo[]) {
    return nodeInfo.map((node) => {
      return {
        ...node,
        verification_method: VerificationWay.markToLang(
          node.verification_method
        ),
      };
    });
  }

  private getNodeInfoCols(optType: BatchOptType): CommonTreeNode[] {
    const columns = [
      {
        key: 'count',
        label: I18n.nodeManagement.No,
        width: '10%',
        checked: true,
        canClick: true,
      },
      {
        key: 'node_name',
        label: I18n.nodeManagement.nodeName,
        width: '16%',
        checked: true,
        searchKey: 'node_name',
        canClick: true,
        hidden: BatchOptType.Delete === optType,
      },
      {
        key: 'ipaddr',
        label: I18n.nodeManagement.nodeIp1,
        width: '15%',
        checked: true,
        searchKey: 'ipaddr',
      },
      {
        key: 'node_port',
        label: I18n.nodeManagement.nodePort,
        width: '13%',
        checked: true,
      },
      {
        key: 'install_path',
        label: I18n.nodeManagement.installPath,
        width: '20%',
        checked: true,
      },
      {
        key: 'ssh_user',
        label: I18n.nodeManagement.userName,
        width: '13%',
        checked: true,
        searchKey: 'ssh_user',
      },
      {
        key: 'verification_method',
        label: I18n.nodeManagement.authenticationMode,
        width: '13%',
        checked: true,
      },
    ];

    return columns.filter((col) => !col.hidden);
  }
}
