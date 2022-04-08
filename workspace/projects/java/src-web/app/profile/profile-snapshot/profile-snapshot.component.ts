import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { I18nService } from '../../service/i18n.service';
import { MessageService } from '../../service/message.service';
import { AxiosService } from '../../service/axios.service';
import { TiTreeNode } from '@cloud/tiny3';
import { ProfileDownloadService } from '../../service/profile-download.service';
import { LibService } from '../../service/lib.service';
@Component({
  selector: 'app-profile-snapshot',
  templateUrl: './profile-snapshot.component.html',
  styleUrls: ['./profile-snapshot.component.scss']
})
export class ProfileSnapshotComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('fileIo1') fileIo1: any;
  @ViewChild('socketIo1') socketIo1: any;
  @ViewChild('http1') http1: any;
  @ViewChild('jdbc1') jdbc1: any;
  @ViewChild('mongodb1') mongodb1: any;
  @ViewChild('cassandra1') cassandra1: any;
  @ViewChild('hbase1') hbase1: any;
  @ViewChild('jdbcpool1') jdbcpool1: any;
  @ViewChild('memorydump1') memorydump1: any;
  constructor(
    public i18nService: I18nService,
    private msgService: MessageService,
    private Axios: AxiosService,
    private downloadService: ProfileDownloadService,
    private cdr: ChangeDetectorRef,
    public libService: LibService
  ) {
    this.i18n = this.i18nService.I18n();
  }
  @ViewChild('contrastSnapshot') contrastSnapshot: any;
  @ViewChild('popDeleteSnapshot') popDeleteSnapshot: any;
  @ViewChild('appConSnapshot') appConSnapshot: any;
  @ViewChild('snapshotFileio') snapshotFileio: any;
  @ViewChild('snapshotSocketIO') snapshotSocketIO: any;
  @ViewChild('snapshotCassandra') snapshotCassandra: any;
  @ViewChild('snapshotJdbcpool') snapshotJdbcpool: any;
  @ViewChild('snapshotHttp') snapshotHttp: any;
  public i18n: any;
  public leftState: any = false;
  public arr: Array<TiTreeNode>;
  public innerData: any = [];
  public selectedsInnerData: Array<TiTreeNode> = [];
  // 获取当前选中项，参数：树节点数据，选中项是否只包含叶子节点，是否多选
  public selectedData: Array<TiTreeNode> = [];
  public snapShot: any;
  public currentSnapShotData: any;
  public currentType: any;
  public currentIndex: any;
  public currentHover: any;
  public oldSelect: any;
  public isDownload = false;
  public profileSnapshotNodata = '';
  public profileSnapshotNodataState = false;
  public oneClickTreeState = true;
  public StopAnalysis = false;
  public expandFlag = false;
  // 快照对比
  public popDeleteSnapshotState = false;
  public hoverClose = '';
  public showSnapShotData = false;
  public snapshotArr: Array<any> = [];
  public showTwoDate = false;
  public multiple = false; // 是否多选
  public showSnapShot = false; // 是否快照对比
  public currentHeapId: any; // 当前heapId
  public prevHeapId: any; // 对比的heapId
  public currentHeapLabel: any;
  public prevHeapLabel: any;
  public showContrastData = false;
  public myOptionsSnapshotType: Array<any> = [];
  public mySelectedsSnapshotType: any = [];
  public myOptionsFirstSnapshot: Array<any> = [];
  public mySelectedsFirstSnapshot: any;
  public myOptionsSecondSnapshot: Array<any> = [];
  public mySelectedsSecondSnapshot: any;
  public guardianId: any;
  public jvmId: any;
  public innerDataItem: any;
  public innerDataIdx: any;
  public heapIds: any;
  public heapIdsArr: Array<any> = [];
  public labelsArr: Array<any> = [];
  public typeLabel: Array<any> = []; // 存储每个类型的label
  public choiceSnapshotState = false;
  public snapshotTagState = true; // 进入snapshotTag页签
  public isStopProState = false;
  public isStopMsgSub: any;
  public deleteOneTab: Subscription;
  public currentPage: any = 1;
  public innerDataKey: any = 0;
  public snapshotA: any;
  public snapshotB: any;
  public snapshotType: string;
  public baseData: Array<any> = [];
  public compareData: Array<any> = [];
  public showSnapshotError = false;
  public onConfirmDeleteDisabled = true;
  public ContrastSnapshotName: Array<any> = [];
  public isLoading: any = false;
  ngOnInit() {
    this.snapshotA = '';
    this.snapshotB = '';
    this.jvmId = sessionStorage.getItem('jvmId');
    this.guardianId = sessionStorage.getItem('guardianId');
    this.downloadService.downloadItems.snapShot.snapshotTagState = this.snapshotTagState;
    this.showSnapShotData = this.downloadService.downloadItems.snapShot.showSnapShotData;
    this.profileSnapshotNodata = this.i18n.profileNoData.profileSnapshotNodata;
    this.profileSnapshotNodataState = this.downloadService.downloadItems.snapShot.profileSnapshotNodataState;
    this.currentPage = this.downloadService.downloadItems.snapShot.currentPage;
    this.isDownload = JSON.parse(sessionStorage.getItem('download_profile'));
    this.isStopProState = JSON.parse(sessionStorage.getItem('isProStop'));
    if (this.downloadService.downloadItems.snapShot.snapShotData) {
      this.snapShot = JSON.parse(this.downloadService.downloadItems.snapShot.snapShotData);
      if (this.isDownload || this.isStopProState) {
        if (this.snapShot && this.snapShot.heapDump) {
          delete this.snapShot.heapDump;
        }
        this.showSnapShotData = false;
        this.showContrastData = false;
        return this.onImportDownloadSnapData();
      }
      this.handleDefaultSnapshot();
      if (this.showSnapShotData) {
        this.onClickTree(this.innerDataItem, this.innerDataIdx);
      } else {
        this.checkedSnapShot(this.innerData);
      }
    }
    this.selectedsSnapshot();
    if (this.myOptionsSnapshotType.length > 0) {
      this.mySelectedsSnapshotType = this.myOptionsSnapshotType[0];
      this.snapShotLabel(this.mySelectedsSnapshotType.type);
    }
    this.isStopMsgSub = this.msgService.getMessage().subscribe(msg => {
      if (msg.type === 'isStopPro') {
        this.isStopProState = true;
        if (this.snapShot && this.snapShot.heapDump) {
          delete this.snapShot.heapDump;
        }
        this.onImportDownloadSnapData();
      }
      if (msg.type === 'isRestart' || msg.type === 'isClear') {
        this.isStopProState = false;
        this.profileSnapshotNodataState = false;
        this.innerData = [];
      }
    });
    this.deleteOneTab = this.msgService.getMessage().subscribe(msg => {
      if (msg.type === 'setDeleteOne') {
        this.msgService.sendMessage({
          type: 'getDeleteOne',
          isNoData: 'false',
        });
      }
    });
    const innerDataArr: any = Object.values(this.innerData);
    for (let i = innerDataArr.length - 1; i >= 0; i--) {
      if (innerDataArr[i].children.length <= 0) {
        innerDataArr.splice(i, 1);
      }
    }
    this.innerData = innerDataArr;
  }
  ngAfterViewInit() {
    if (!this.snapShot) { return; }
  }
  public allObjectDate() {
    this.showTwoDate = true;
  }
  public selectedsSnapshot() {
    this.myOptionsSnapshotType = [];
    if (this.snapShot) {
      this.selectedsInnerData = this.snapShot && Object.values(this.snapShot);
      this.selectedsInnerData.forEach(item => {
        const typeObj = {
          label: '',
          englishname: '',
          type: ''
        };
        typeObj.label = item.label;
        typeObj.englishname = item.label;
        typeObj.type = item.type;
        this.myOptionsSnapshotType.push(typeObj);
      });
    }
  }
  public snapShotTypeLabel(type: any) {
    this.myOptionsSnapshotType.forEach(e => {
      if (e.type === type) {
        this.mySelectedsSnapshotType = e;
      }
    });
  }
  public snapShotLabel(type: any) {
    this.myOptionsFirstSnapshot = [];
    this.myOptionsSecondSnapshot = [];
    if (this.snapShot[type]) {
      const firstArr = this.snapShot[type].children;
      firstArr.forEach((item: any) => {
        const firstSnapshotObj = {
          label: '',
          englishname: '',
          snapShotId: '',
          type: '',
        };
        firstSnapshotObj.label = item.label;
        firstSnapshotObj.englishname = item.label;
        if (item.type === 'heapDump') {
          firstSnapshotObj.snapShotId = item.snapShotId;
        }
        firstSnapshotObj.type = item.type;
        this.myOptionsFirstSnapshot.push(firstSnapshotObj);
      });
      const secondArr = this.snapShot[type].children;
      secondArr.forEach((item: any) => {
        const secondSnapshotObj = {
          label: '',
          englishname: '',
          snapShotId: '',
          type: '',
        };
        secondSnapshotObj.label = item.label;
        secondSnapshotObj.englishname = item.label;
        if (item.type === 'heapDump') {
          secondSnapshotObj.snapShotId = item.snapShotId;
        }
        secondSnapshotObj.type = item.type;
        this.myOptionsSecondSnapshot.push(secondSnapshotObj);
      });
    }
  }
  public changeFn(node: TiTreeNode): void {
    for (const key of Object.keys(this.innerData)) {
      if (this.oneClickTreeState) {
        if (this.innerData[key].type === node.type) {
          this.innerDataKey = key;
          this.oneClickTreeState = false;
        } else {
          this.innerDataKey = 0;
        }
      }
    }
    const checkedFile = this.innerData[this.innerDataKey].children.filter((item: any) => {
      return item.checked;
    });
    this.onConfirmDeleteDisabled = checkedFile.length > 0 ? false : true;
  }
  public toggleLeft() {
    this.leftState = !this.leftState;
    if (this.snapshotType === 'cassandra' || this.snapshotType === 'jdbc' || this.snapshotType === 'mongodb' ||
      this.snapshotType === 'hbase') {
      if (this.snapshotCassandra) {
        this.snapshotCassandra.toggleLeft();
      }
    } else if (this.snapshotType === 'http') {
      if (this.snapshotHttp) {
        this.snapshotHttp.toggleLeft();
      }
    } else if (this.snapshotType === 'pFileIO') {
      if (this.snapshotFileio) {
        this.snapshotFileio.toggleLeftResize();
      }
    } else if (this.snapshotType === 'pSocketIO') {
      if (this.snapshotSocketIO) {
        this.snapshotSocketIO.toggleLeftResize();
      }
    }

  }
  public onClickTreeState() {
    this.currentPage = 1;
  }
  public checkedSnapShot(array: any) { // 清空除内存转储的点击
    array.forEach((e: any) => {
      if (e.children && e.children.length > 0) {
        this.checkedSnapShot(e.children);
      } else {
        e.checked = false;
      }
    });
  }
  public onClickTree(item: any, index: any) {
    if ('children' in item) {
      return;
    } else {
      const treeIdx = index.toString();
      this.snapshotA = '';
      this.snapshotB = '';
      if (this.showContrastData) {
        this.showContrastData = !this.showContrastData;
      }
      this.selectedsSnapshot();
      this.snapShotTypeLabel(item.type);
      this.snapShotLabel(item.type);
      this.myOptionsSecondSnapshot.forEach(e => {
        if (e.label === item.label) {
          e.disabled = true;
        }
      });
      this.mySelectedsSecondSnapshot = null;
      this.downloadService.downloadItems.snapShot.showSnapShotData = true;
      this.downloadService.downloadItems.snapShot.innerDataItem = item;
      this.innerDataItem = item;
      if (treeIdx.replace(/\_+/g, '')) {
        this.innerDataIdx = this.getCaption(treeIdx, 1);
      } else {
        this.innerDataIdx = treeIdx;
      }
      this.mySelectedsFirstSnapshot = this.myOptionsFirstSnapshot[this.innerDataIdx];
      sessionStorage.setItem('snapShotTreeIdx', this.innerDataIdx);
      this.showSnapShotData = true;
      if (item.children) {
        this.innerData[0].children[index].expanded = !this.innerData[0].children[index].expanded;
        return;
      }
      this.prevHeapId = item.snapShotId;
      this.currentHeapLabel = item.label;
      this.downloadService.downloadItems.heapDump.recordId = item.snapShotId;
      this.currentType = item.type;
      this.currentIndex = index;
      let tempTimer = setTimeout(() => {
        const snapType: any = {
          pFileIO: this.fileIo1,
          pSocketIO: this.socketIo1,
          http: this.http1,
          jdbc: this.jdbc1,
          mongodb: this.mongodb1,
          cassandra: this.cassandra1,
          hbase: this.hbase1,
          jdbcpool: this.jdbcpool1,
          heapDump: this.memorydump1
        };
        snapType[this.currentType].importSnapData(item.value, this.currentPage);
        clearTimeout(tempTimer);
        tempTimer = null;
      }, 200);
      for (let i = this.innerData.length - 1; i >= 0; i--) {
        if (this.innerData[i].children.length <= 0) {
          this.innerData.splice(i, 1);
        }
      }
    }
  }
  public getCaption(obj: any, state: any) {
    const index = obj.lastIndexOf('\_');
    if (state === 0) {
      obj = obj.substring(0, index);
    } else {
      obj = obj.substring(index + 1, obj.length);
    }
    return obj;
  }
  public onNgModelSnapshotType(event: any): void {
    this.snapShotLabel(event.type);
    this.mySelectedsFirstSnapshot = null;
    this.mySelectedsSecondSnapshot = null;
  }
  public onNgModelFirstChange(event: any): void {
    this.snapShotLabel(event.type);
    this.myOptionsSecondSnapshot.forEach(e => {
      if (e.label === event.label) {
        e.disabled = true;
      }
    });
    this.mySelectedsSecondSnapshot = null;
  }
  public onNgModelSecondChange(event: any): void {
    if (this.mySelectedsSecondSnapshot && this.mySelectedsFirstSnapshot) {
      this.showSnapshotError = false;
    } else {
      this.showSnapshotError = true;
    }
  }
  public onSecondClick(event: MouseEvent): void {
    this.myOptionsSecondSnapshot.forEach(e => {
      if (this.mySelectedsFirstSnapshot) {
        if (e.label === this.mySelectedsFirstSnapshot.label) {
          e.disabled = true;
        }
      }
    });
  }
  public showContrastSnapshot() {
    this.selectedsSnapshot();
    if (this.myOptionsSnapshotType.length > 0) {
      if (this.mySelectedsSnapshotType.length === 0) {
        this.mySelectedsSnapshotType = this.myOptionsSnapshotType[0];
        this.snapShotLabel(this.mySelectedsSnapshotType.type);
      } else {
        this.snapShotLabel(this.mySelectedsSnapshotType.type);
      }
    }
    if (this.innerDataIdx >= 0) {
      this.mySelectedsFirstSnapshot = this.myOptionsFirstSnapshot[this.innerDataIdx];
      this.mySelectedsSecondSnapshot = null;
    }
    for (let i = this.innerData.length - 1; i >= 0; i--) {
      if (this.innerData[i].children.length <= 0) {
        this.innerData.splice(i, 1);
      }
    }
    this.showSnapShot = true;
    this.contrastSnapshot.open();
  }
  public closeContrastSnapshot() {
    this.mySelectedsFirstSnapshot = null;
    this.mySelectedsSecondSnapshot = null;
    this.showSnapShot = false;
    this.contrastSnapshot.close();
  }
  public onContrastSnapshot() {
    if (this.mySelectedsSecondSnapshot && this.mySelectedsFirstSnapshot) {
      this.showSnapShot = false;
      this.contrastSnapshot.close();
      this.showContrastData = true;
      this.snapshotType = this.mySelectedsSnapshotType.type;
      if (this.snapshotType === 'heapDump') {
        this.currentHeapId = this.mySelectedsSecondSnapshot.snapShotId;
        this.currentHeapLabel = this.mySelectedsSecondSnapshot.label;
        this.prevHeapId = this.mySelectedsFirstSnapshot.snapShotId;
        this.prevHeapLabel = this.mySelectedsFirstSnapshot.label;
        if (this.appConSnapshot) {
          this.appConSnapshot.getContrastData(1, 20, this.currentHeapId, this.prevHeapId);
        }
      } else if (this.snapshotType === 'pFileIO') {
        this.currentHeapLabel = this.mySelectedsSecondSnapshot.label;
        this.prevHeapLabel = this.mySelectedsFirstSnapshot.label;
        if (this.snapshotFileio) {
          this.snapshotFileio.getIoData(this.currentHeapLabel, this.prevHeapLabel);
        }
      } else if (this.snapshotType === 'pSocketIO') {
        this.currentHeapLabel = this.mySelectedsSecondSnapshot.label;
        this.prevHeapLabel = this.mySelectedsFirstSnapshot.label;
        if (this.snapshotSocketIO) {
          this.snapshotSocketIO.getIoData(this.currentHeapLabel, this.prevHeapLabel);
        }
      } else if (this.snapshotType === 'jdbcpool') {
        this.currentHeapLabel = this.mySelectedsSecondSnapshot.label;
        this.prevHeapLabel = this.mySelectedsFirstSnapshot.label;
        if (this.snapshotFileio) {
          this.snapshotFileio.getData(this.currentHeapLabel, this.prevHeapLabel);
        }
      } else if (this.snapshotType === 'http') {
        this.currentHeapLabel = this.mySelectedsSecondSnapshot.label;
        this.prevHeapLabel = this.mySelectedsFirstSnapshot.label;
        if (this.snapshotHttp) {
          this.snapshotHttp.getData(this.currentHeapLabel, this.prevHeapLabel);
        }
      } else if (
        this.snapshotType === 'cassandra' || this.snapshotType === 'jdbc' || this.snapshotType === 'mongodb' ||
        this.snapshotType === 'hbase'
      ) {
        this.currentHeapLabel = this.mySelectedsSecondSnapshot.label;
        this.prevHeapLabel = this.mySelectedsFirstSnapshot.label;
        if (this.snapshotCassandra) {
          this.snapshotCassandra.getData(this.currentHeapLabel, this.prevHeapLabel);
        }
      }
      this.ContrastSnapshotName = this.ContrastSnapshotName.concat(this.currentHeapLabel, this.prevHeapLabel);
      this.selectedsSnapshot();
      this.mySelectedsFirstSnapshot = null;
      this.mySelectedsSecondSnapshot = null;
    } else {
      this.showSnapshotError = true;
    }

  }
  public goHistogramChild(childData: any) {
    this.showContrastData = childData;
    this.snapshotA = '';
    this.snapshotB = '';
    if (this.showSnapShotData) {
      this.onClickTree(this.innerDataItem, this.innerDataIdx);
    }
  }
  public goBack(childData: any) {
    this.showContrastData = childData;
    this.snapshotA = '';
    this.snapshotB = '';
    if (this.showSnapShotData) {
      this.onClickTree(this.innerDataItem, this.innerDataIdx);
    }
  }
  public toggleSnapshotIN(obj: any) {
    this.snapshotA = obj.A;
    this.snapshotB = obj.B;
    this.cdr.detectChanges();
  }
  public onDeleteSnapshot() {

    this.innerData = [
      {
        label: this.i18n.common_term_clear_allData,
        expanded: true,
        checked: false,
        type: 'all',
        children: []
      }
    ];
    this.handleDeleteSnapshot();
    this.onConfirmDeleteDisabled = true;
    let tempTimer = setTimeout(() => {
      const arr: Array<any> = this.snapShot && Object.values(this.snapShot);
      for (const key of arr) {
        key.checked = false;
        key.children.filter((item: any) => {
          item.checked = false;
        });
      }
      this.multiple = true;
      clearTimeout(tempTimer);
      tempTimer = null;
    }, 10);

  }
  public onCancelSnapshot() {
    this.multiple = false;
    this.handleDefaultSnapshot();
    if (!this.showSnapShotData) {
      this.checkedSnapShot(this.innerData);
    }
  }
  public onConfirmPopDeleteSnapshot() {
    this.getHeapIds(this.innerData);
    if (this.choiceSnapshotState) {
      this.popDeleteSnapshotState = true;
      this.popDeleteSnapshot.open();
    }
  }
  public onConfirmDeleteSnapshot() {
    this.heapIds = this.heapIdsArr.join(',');
    if (this.heapIds.length > 0) {
      this.axiosDeleteSnapshot();
    }
    this.upSnapshoData();
    this.multiple = false;
    this.handleDefaultSnapshot();
    sessionStorage.setItem('snapShotTreeIdx', '0');
    this.innerDataIdx = 0;
    this.popDeleteSnapshotState = false;
    if (this.labelsArr.indexOf(this.currentHeapLabel) > -1) {
      this.showSnapShotData = false;
    }
    this.downloadService.downloadItems.snapShot.showSnapShotData = this.showSnapShotData;
    this.popDeleteSnapshot.close();
  }
  public axiosDeleteSnapshot() {
    this.isLoading = true;
    const encodeGuardianId = encodeURIComponent(this.guardianId);
    const encodeJvmId = encodeURIComponent(this.jvmId);
    const encodeHeapIds = encodeURIComponent(this.heapIds);
    this.Axios.axios.delete(`guardians/${encodeGuardianId}/jvms/${encodeJvmId}/heaps?heapIds=${encodeHeapIds}`,
    { headers: { showLoading: false } }).then((res: any) => {
      this.isLoading = false;
      if (res) {
        if (this.heapIdsArr.indexOf(this.downloadService.downloadItems.heapDump.recordId) > -1) {
          this.showSnapShotData = false;
        }
      }
    }).catch(() => {
      this.isLoading = false;
    });
  }
  /**
   *
   */
  public upSnapshoData() {
    this.structureData(this.innerData);
    this.downloadService.downloadItems.snapShot.snapShotData = JSON.stringify(this.snapShot);
    for (let i = this.innerData.length - 1; i >= 0; i--) {
      if (this.innerData[i].children.length <= 0) {
        this.innerData.splice(i, 1);
      }
    }
    if (this.innerData.length > 0) {
      for (const key of Object(this.innerData)) {
        if (key.children.length > 0) {
          this.profileSnapshotNodataState = true;
          break;
        } else {
          this.profileSnapshotNodataState = false;
        }
      }
      this.downloadService.downloadItems.snapShot.profileSnapshotNodataState = this.profileSnapshotNodataState;
    } else {
      this.profileSnapshotNodataState = false;
      this.downloadService.downloadItems.snapShot.profileSnapshotNodataState = this.profileSnapshotNodataState;
    }
  }

  public closeConfirmDeleteSnapshot() {
    this.popDeleteSnapshotState = false;
    this.popDeleteSnapshot.close();
  }
  public getHeapIds(array: any) {
    for (let i = array.length - 1; i >= 0; i--) {
      if (array[i].checked && typeof array[i].checked === 'boolean') {
        if (array[i].children && array[i].children.length > 0) {
          this.getHeapIds(array[i].children);
        } else {
          if (array[i].checked) {
            this.choiceSnapshotState = true;
          }
          if (array[i].snapShotId) {
            this.heapIdsArr.push(array[i].snapShotId);
          }
          if (array[i].label) {
            this.labelsArr.push(array[i].label);
          }
        }
      } else {
        if (array[i].children && array[i].children.length > 0) {
          this.getHeapIds(array[i].children);
        }
      }
    }
  }
  public structureData(array: Array<any>) {
    for (let i = array.length - 1; i >= 0; i--) {
      if (array[i].checked && typeof array[i].checked === 'boolean') {
        if (array[i].children && array[i].children.length > 0) {
          this.structureData(array[i].children);
        } else {
          this.downloadService.downloadItems[array[i].type].snapCount =
           this.snapShot[array[i].type].children.length - 1;
          if (this.showContrastData) {
            if (this.ContrastSnapshotName.indexOf(array[i].label) > -1) {
              this.snapshotA = '';
              this.snapshotB = '';
              this.showSnapShotData = false;
              this.showContrastData = false;
            }
          }
          array.splice(i, 1);
        }
      } else {
        if (array[i].children && array[i].children.length > 0) {
          this.structureData(array[i].children);
        }
      }
    }
  }
  public onHoverList(label: any) {
    this.currentHover = label;
  }
  ngOnDestroy(): void {
    this.isLoading = false;
    this.onDownLoadSnapData();
    this.downloadService.downloadItems.snapShot.snapshotTagState = false;
    this.downloadService.downloadItems.snapShot.innerDataItem = this.innerDataItem;
    this.msgService.sendMessage({ type: 'getDeleteOne', });  // 清除本页面的发送事件
    sessionStorage.setItem('snapShotTreeIdx', this.innerDataIdx);
    if (this.deleteOneTab) { this.deleteOneTab.unsubscribe(); }
  }
  public onDownLoadSnapData() {
    if (this.isDownload) { return; }
    this.downloadService.downloadItems.snapShot.data = this.snapShot;
  }
  public onImportDownloadSnapData() {
    this.handleDefaultSnapshot();
  }
  public handleDeleteSnapshot() {
    if (this.snapShot) {
      this.oneClickTreeState = true;
      const arr: Array<any> = this.snapShot && Object.values(this.snapShot);
      for (const key of arr) {
        key.children.filter((item: any) => {
          item.checked = false;
        });
      }
      for (let i = arr.length - 1; i >= 0; i--) {
        if (arr[i].children.length <= 0) {
          arr.splice(i, 1);
        }
      }
      this.innerData[0].children = arr;
      this.oldSelect = 0;
      this.currentIndex = 0;
    }
  }
  public disabledSnapShot(obj: any) {
    obj.disabled = true;
    if (obj.children && obj.children.length > 0) {
      obj.children.forEach((e: any) => {
        e.disabled = true;
      });
    }
  }
  public handleDefaultSnapshot() {
    if (this.snapShot) {
      this.innerData = this.snapShot && Object.values(this.snapShot);
      this.innerDataItem = this.downloadService.downloadItems.snapShot.innerDataItem;
      this.innerDataIdx = sessionStorage.getItem('snapShotTreeIdx');
      this.snapshotArr = this.innerData;
      for (let i = this.innerData.length - 1; i >= 0; i--) {
        if (this.innerData[i].children.length <= 0) {
          this.innerData.splice(i, 1);
        }
      }
      if (this.innerData.length > 0) {
        this.innerData[this.innerData.length - 1].expanded = true;
        this.innerData[this.innerData.length - 1].checked = false;
        if (this.innerData != null) {
          for (const key of Object.keys(this.innerData)) {
            if (this.innerData[key].children.length > 0) {
              this.profileSnapshotNodataState = true;
              break;
            } else {
              this.profileSnapshotNodataState = false;
            }
          }
        }
        this.downloadService.downloadItems.snapShot.profileSnapshotNodataState = this.profileSnapshotNodataState;
        this.oldSelect = 0;
        this.currentIndex = 0;
        if (this.showSnapShotData) {
          this.innerData.forEach((e: any) => {
            this.typeLabel = [];
            if (e.type === this.innerDataItem.type) {
              e.children.forEach((el: any) => {
                this.typeLabel.push(el.label);
              });
              if (this.typeLabel.indexOf(this.currentHeapLabel) > -1) {
                e.children[this.typeLabel.indexOf(this.currentHeapLabel)].checked = true;
                e.expanded = true;
              }
            }
          });
        }
      } else {
        this.profileSnapshotNodataState = false;
        this.downloadService.downloadItems.snapShot.profileSnapshotNodataState = this.profileSnapshotNodataState;
      }
    }
  }
  public onHoverClose(msg: any) {
    this.hoverClose = msg;
  }
  /**
   * 传送热点语句height是否展开与收缩
   */
  public isExpand(event: any){
    this.expandFlag = event;
  }
}
