import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { I18nService } from '../../service/i18n.service';
import { MessageService } from '../../service/message.service';
import { TiTreeNode } from '@cloud/tiny3';
import { ProfileDownloadService } from '../../service/profile-download.service';
import { VscodeService, COLOR_THEME } from '../../service/vscode.service';
import { Subscription } from 'rxjs';
@Component({
    selector: 'app-profile-snapshot',
    templateUrl: './profile-snapshot.component.html',
    styleUrls: ['./profile-snapshot.component.scss']
})
export class ProfileSnapshotComponent implements OnInit, AfterViewInit, OnDestroy {

    @ViewChild('jdbc1', { static: false }) jdbc1: any;
    @ViewChild('mongodb1', { static: false }) mongodb1: any;
    @ViewChild('cassandra1', { static: false }) cassandra1: any;
    @ViewChild('hbase1', { static: false }) hbase1: any;
    @ViewChild('jdbcpool1', { static: false }) jdbcpool1: any;
    @ViewChild('memorydump1', { static: false }) memorydump1: any;
    @ViewChild('http1', { static: false }) http1: any;
    @ViewChild('fileIo1', { static: false }) fileIo1: any;
    @ViewChild('socketIo1', { static: false }) socketIo1: any;
    constructor(
        public i18nService: I18nService,
        private msgService: MessageService,
        private downloadService: ProfileDownloadService,
        private cdr: ChangeDetectorRef,
        public vscodeService: VscodeService,
    ) {
        this.i18n = this.i18nService.I18n();
    }
    @ViewChild('contrastSnapshot', { static: false }) contrastSnapshot: any;
    @ViewChild('popDeleteSnapshot', { static: false }) popDeleteSnapshot: any;
    @ViewChild('appConSnapshot', { static: false }) appConSnapshot: any;
    @ViewChild('snapshotFileio', { static: false }) snapshotFileio: any;
    @ViewChild('snapshotSocketIO', { static: false }) snapshotSocketIO: any;
    @ViewChild('snapshotCassandra', { static: false }) snapshotCassandra: any;
    @ViewChild('snapshotJdbcpool', { static: false }) snapshotJdbcpool: any;
    @ViewChild('snapshotHttp', { static: false }) snapshotHttp: any;
    public i18n: any;
    public leftState: any = false;
    public arr: Array<TiTreeNode>;
    public innerData: Array<TiTreeNode> = [];
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
    public profileSnapshotNodataState = false;
    public oneClickTreeState = false;
    public StopAnalysis = false;
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
    public choiceSnapshotState = false;
    public snapshotTagState = true; // 进入snapshotTag页签
    public isStopProState = false;
    public snapSub: Subscription;
    public currentPage: any = 1;
    public snapshotA: any;
    public snapshotB: any;
    public snapshotType: string;
    public baseData: Array<any> = [];
    public compareData: Array<any> = [];
    public showSnapshotError = false;
    public onConfirmDeleteDisabled = true;
    public ContrastSnapshotName: Array<any> = [];
    public currTheme = COLOR_THEME.Dark;
    // 主题颜色
    public ColorTheme = {
        Dark: COLOR_THEME.Dark,
        Light: COLOR_THEME.Light
    };
    public isIntellij = (self as any).webviewSession.getItem('tuningOperation') === 'hypertuner';
    /**
     * 初始化
     */
    ngOnInit() {
        this.snapshotA = '';
        this.snapshotB = '';

        // vscode颜色主题
        if (document.body.className.indexOf('vscode-light') !== -1) {
            this.currTheme = COLOR_THEME.Light;
        } else {
            this.currTheme = COLOR_THEME.Dark;
        }

        this.vscodeService.regVscodeMsgHandler('colorTheme', (msg: any) => {
            this.currTheme = msg.colorTheme;
        });

        this.jvmId = (self as any).webviewSession.getItem('jvmId');
        this.guardianId = (self as any).webviewSession.getItem('guardianId');
        this.downloadService.downloadItems.snapShot.snapshotTagState = this.snapshotTagState;
        this.showSnapShotData = this.downloadService.downloadItems.snapShot.showSnapShotData;
        this.profileSnapshotNodataState = this.downloadService.downloadItems.snapShot.profileSnapshotNodataState;
        this.currentPage = this.downloadService.downloadItems.snapShot.currentPage;
        this.isDownload = JSON.parse((self as any).webviewSession.getItem('downloadProfile') || 'false');
        this.isStopProState = JSON.parse((self as any).webviewSession.getItem('isProStop'));
        if (this.downloadService.downloadItems.snapShot.snapShotData) {
          if (this.isIntellij && typeof this.downloadService.downloadItems.snapShot.snapShotData === 'string'){
            try{
              JSON.parse(this.downloadService.downloadItems.snapShot.snapShotData);
            } catch {
              this.downloadService.downloadItems.snapShot.snapShotData =
                this.downloadService.downloadItems.snapShot.snapShotData.replace(/\\"/g, '"');
            }
          }
          if (this.isIntellij && typeof this.downloadService.downloadItems.snapShot.snapShotData === 'object'){
            this.snapShot = this.downloadService.downloadItems.snapShot.snapShotData;
          } else {
            this.snapShot = JSON.parse(this.downloadService.downloadItems.snapShot.snapShotData);
          }
          if (this.isIntellij){
              const typeList = ['jdbc', 'jdbcpool', 'mongodb', 'cassandra', 'hbase'];
              typeList.forEach(type => {
                this.snapShot[type]?.children.map((item: any) => {
                  item.oldLabel =  item.label;
                  item.label = this.formatDate(item.label) + ' ' + item.label.split(' ')[1];
                });
              });
            }
          this.handleDefaultSnapshot();
          if (this.isIntellij){
            this.innerDataIdx = '0_0';
          }
          if (this.showSnapShotData) {
                this.onClickTree(this.innerDataItem, this.innerDataIdx);
            } else {
                this.checkedSnapShot(this.innerData);
            }
          if (this.isDownload || this.isStopProState) {
                if (this.snapShot && this.snapShot.heapDump) {
                    delete this.snapShot.heapDump;
                }
                return this.onImportDownloadSnapData();
            }
        }
        this.selectedsSnapshot();
        if (this.myOptionsSnapshotType.length > 0) {
            this.mySelectedsSnapshotType = this.myOptionsSnapshotType[0];
            this.snapShotLabel(this.mySelectedsSnapshotType.type);
        }
        this.snapSub = this.msgService.getMessage().subscribe((msg) => {
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
        const innerDataArr = Object.values(this.innerData);
        for (let i = innerDataArr.length - 1; i >= 0; i--) {
            if (innerDataArr[i].children.length <= 0) {
                innerDataArr.splice(i, 1);
            }
        }
        this.innerData = innerDataArr;
    }

    /**
     * 格式化日期
     */
    formatDate(time: any){
      const date = new Date(time);
      let month: any = date.getMonth() + 1;
      let day: any = date.getDate();
      if (month < 10){
        month = '0' + month;
      }
      if (day < 10){
        day = '0' + day;
      }
      return `${date.getFullYear()}/${month}/${day}`;
    }
    /**
     * 组件初始化后操作
     */
    ngAfterViewInit() {
        if (!this.snapShot) { return; }
    }

    /**
     * 展开收缩左侧树
     */
    public toggleLeft() {
        this.leftState = !this.leftState;
        if (this.snapshotType === 'cassandra' || this.snapshotType === 'jdbc' || this.snapshotType === 'mongodb'
            || this.snapshotType === 'hbase') {
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
    /**
     * 左侧树改变
     */
    public changeFn(node: TiTreeNode): void {
        const checkedFile = this.innerData[0].children.filter((item) => {
            return item.checked;
        });
        this.onConfirmDeleteDisabled = checkedFile.length > 0 ? false : true;
    }
    /**
     * 点击快照树
     */
    public onClickTreeState() {
        this.currentPage = 1;
        this.oneClickTreeState = true;
        this.checkedSnapShot(this.innerData);
    }
    /**
     * 清空除内存转储的点击
     */
    public checkedSnapShot(array: any) {
        array.forEach((e: any) => {
            if (e.children && e.children.length > 0) {
                this.checkedSnapShot(e.children);
            } else {
                e.checked = false;
            }
        });
    }
    /**
     * 点击树节点
     */
    public onClickTree(item: any, index: any) {
        if ('children' in item) {  // 非叶子节点
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
            this.myOptionsSecondSnapshot.forEach((e) => {
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
            (self as any).webviewSession.setItem('snapShotTreeIdx', this.innerDataIdx);
            this.showSnapShotData = true;
            if (item.children) {
                this.innerData[0].children[index].expanded = !this.innerData[0].children[index].expanded;
                return;
            }
            this.prevHeapId = item.snapShotId;
            this.currentHeapLabel = item.label;
            this.currentType = item.type;
            this.currentIndex = index;
            setTimeout(() => {
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
                snapType[this.currentType].importSnapData(item.value, this.currentPage, item.snapShotId);
            }, 200);
            for (let i = this.innerData.length - 1; i >= 0; i--) {
                if (this.innerData[i].children.length <= 0) {
                    this.innerData.splice(i, 1);
                }
            }
        }
    }
    /**
     * 判断快照节点类型
     */
    public snapShotTypeLabel(type: any) {
        this.myOptionsSnapshotType.forEach((e) => {
            if (e.type === type) {
                this.mySelectedsSnapshotType = e;
            }
        });
    }

    /**
     * 获取innerDataIdx
     */
    public getCaption(obj: any, state: any) {
        const index = obj.lastIndexOf('\_');
        if (state === 0) {
            obj = obj.substring(0, index);
        } else {
            obj = obj.substring(index + 1, obj.length);
        }
        return obj;
    }

    /**
     * 显示快照对比弹框
     */
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
        this.hoverClose = '';
        this.showSnapShot = true;
        this.contrastSnapshot.open();
    }
    /**
     * 选择快照
     */
    public selectedsSnapshot() {
        this.myOptionsSnapshotType = [];
        if (this.snapShot) {
            this.selectedsInnerData = this.snapShot && Object.values(this.snapShot);
            this.selectedsInnerData.forEach((item) => {
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
    /**
     * 设置快照标签
     */
    public snapShotLabel(type: any) {
        this.myOptionsFirstSnapshot = [];
        this.myOptionsSecondSnapshot = [];
        if (this.snapShot[type]) {
            const firstArr = this.snapShot[type].children;
            firstArr.forEach((item: any) => {
                if (this.isIntellij){
                   const firstSnapshotObj = {
                       label: '',
                       englishname: '',
                       snapShotId: '',
                       type: '',
                       oldLabel: ''
                   };
                   firstSnapshotObj.label = item.label;
                   firstSnapshotObj.englishname = item.label;
                   firstSnapshotObj.oldLabel = item.oldLabel;
                   if (item.type === 'heapDump') {
                       firstSnapshotObj.snapShotId = item.snapShotId;
                   }
                   firstSnapshotObj.type = item.type;
                   this.myOptionsFirstSnapshot.push(firstSnapshotObj);
                } else {
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
                }
            });
            const secondArr = this.snapShot[type].children;
            secondArr.forEach((item: any) => {
                if (this.isIntellij){
                    const secondSnapshotObj = {
                      label: '',
                      englishname: '',
                      snapShotId: '',
                      type: '',
                      oldLabel: ''
                    };
                    secondSnapshotObj.label = item.label;
                    secondSnapshotObj.englishname = item.label;
                    secondSnapshotObj.oldLabel = item.oldLabel;
                    if (item.type === 'heapDump') {
                      secondSnapshotObj.snapShotId = item.snapShotId;
                    }
                    secondSnapshotObj.type = item.type;
                    this.myOptionsSecondSnapshot.push(secondSnapshotObj);
                } else {
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
                }

            });
        }
    }

    /**
     * 点击删除快照图标
     */
    public onDeleteSnapshot() {
        this.multiple = true;
        this.innerData = [
            {
                label: this.i18n.profileMemorydump.snapShot.allData,
                expanded: true,
                checked: false,
                type: 'all',
                children: []
            }
        ];
        this.handleDeleteSnapshot();
    }
    /**
     * 获取要删除的快照
     */
    public handleDeleteSnapshot() {
        if (this.snapShot) {
            const arr: Array<any> = this.snapShot && Object.values(this.snapShot);
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
    /**
     * 取消删除快照
     */
    public onCancelSnapshot() {
        this.multiple = false;
        this.handleDefaultSnapshot();
        if (!this.showSnapShotData) {
            this.checkedSnapShot(this.innerData);
        }
    }
    /**
     * 显示删除快照弹框
     */
    public onConfirmPopDeleteSnapshot() {
        this.getHeapIds(this.innerData);
        if (this.choiceSnapshotState) {
            this.hoverClose = '';
            this.popDeleteSnapshotState = true;
            this.popDeleteSnapshot.open();
        }
    }
    /**
     * 获取快照id
     */
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
                }
            } else {
                if (array[i].children && array[i].children.length > 0) {
                    this.getHeapIds(array[i].children);
                }
            }
        }
    }

    /**
     * 鼠标悬浮
     */
    public onHoverList(label: any) {
        this.currentHover = label;
    }
    /**
     * 组件销毁时执行
     */
    ngOnDestroy(): void {
        if (this.snapSub) {
            this.snapSub.unsubscribe();
        }
        this.closeLoding();
        this.onDownLoadSnapData();
        this.downloadService.downloadItems.snapShot.snapshotTagState = false;
        this.downloadService.downloadItems.snapShot.innerDataItem = this.innerDataItem;
        (self as any).webviewSession.setItem('snapShotTreeIdx', this.innerDataIdx);
    }
    /**
     * 显示加载
     */
    public showLoding() {
        document.getElementById('sample-loading-box').style.display = 'flex';
    }
    /**
     * 隐藏加载
     */
    public closeLoding() {
        document.getElementById('sample-loading-box').style.display = 'none';
    }
    /**
     * 保存当前快照数据
     */
    public onDownLoadSnapData() {
        if (this.isDownload) { return; }
        this.downloadService.downloadItems.snapShot.data = this.snapShot;
    }
    /**
     * 处理导入的快照
     */
    public onImportDownloadSnapData() {
        this.handleDefaultSnapshot();
    }

    /**
     * 显示默认快照
     */
    public handleDefaultSnapshot() {
        if (this.snapShot) {
            this.innerData = this.snapShot && Object.values(this.snapShot);
            this.innerDataItem = this.downloadService.downloadItems.snapShot.innerDataItem;
            this.innerDataIdx = (self as any).webviewSession.getItem('snapShotTreeIdx');
            this.snapshotArr = this.innerData;
            for (let i = this.innerData.length - 1; i >= 0; i--) {
                if (this.innerData[i].children.length <= 0) {
                    this.innerData.splice(i, 1);
                }
            }
            if (this.innerData.length > 0) {
                this.innerData[this.innerData.length - 1].expanded = true;
                this.innerData[this.innerData.length - 1].checked = false;
                for (const item of this.innerData) {
                    if (item.children.length > 0) {
                        this.profileSnapshotNodataState = true;
                        break;
                    } else {
                        this.profileSnapshotNodataState = false;
                    }
                }
                this.downloadService.downloadItems.snapShot.profileSnapshotNodataState =
                 this.profileSnapshotNodataState;
                this.oldSelect = 0;
                this.currentIndex = 0;
                if (this.showSnapShotData) {
                    this.innerData.forEach((e) => {
                        if (e.type === this.innerDataItem.type) {
                            e.expanded = true;
                            if (this.innerDataIdx !== undefined) {
                                e.children[this.innerDataIdx].checked = true;
                            }
                        }
                    });
                }
            } else {
                this.profileSnapshotNodataState = false;
                this.downloadService.downloadItems.snapShot.profileSnapshotNodataState =
                 this.profileSnapshotNodataState;
            }
        }
    }

    /**
     * 关闭删除快照对话框
     */
    public closeConfirmDeleteSnapshot() {
        this.popDeleteSnapshotState = false;
        this.popDeleteSnapshot.close();
    }
    /**
     * close hover
     */
    public onHoverClose(msg: any) {
        this.hoverClose = msg;
    }
    /**
     * 确认删除快照
     */
    public onConfirmDeleteSnapshot() {
        this.heapIds = this.heapIdsArr.join(',');
        this.axiosDeleteSnapshot();
        this.multiple = false;
        this.showSnapShotData = false;
        this.handleDefaultSnapshot();
        (self as any).webviewSession.setItem('snapShotTreeIdx', '0');
        this.innerDataIdx = 0;
        this.downloadService.downloadItems.snapShot.showSnapShotData = false;
        this.showSnapShotData = false;
        this.popDeleteSnapshotState = false;
        this.popDeleteSnapshot.close();
    }

    /**
     * 删除快照
     */
    public axiosDeleteSnapshot() {
        this.showLoding();
        this.vscodeService.delete({
            url: `/guardians/${encodeURIComponent(this.guardianId)}/jvms/${encodeURIComponent(this.
                jvmId)}/heaps?heapIds=${encodeURIComponent(this.heapIds)}`
        }, (resp: any) => {
            if (resp) {
                this.structureData(this.innerData);
                this.downloadService.downloadItems.snapShot.snapShotData = JSON.stringify(this.snapShot);
                this.closeLoding();
                if (this.heapIdsArr.indexOf(this.downloadService.downloadItems.heapDump.recordId) > -1) {
                    this.showSnapShotData = false;
                }
                for (let i = this.innerData.length - 1; i >= 0; i--) {
                    if (this.innerData[i].children.length <= 0) {
                        this.innerData.splice(i, 1);
                    }
                }
                if (this.innerData.length > 0) {
                    for (const item of this.innerData) {
                        if (item.children.length > 0) {
                            this.profileSnapshotNodataState = true;
                            break;
                        } else {
                            this.profileSnapshotNodataState = false;
                        }
                    }
                    this.currentType = '';
                    this.downloadService.downloadItems.snapShot.profileSnapshotNodataState =
                     this.profileSnapshotNodataState;
                } else {
                    this.profileSnapshotNodataState = false;
                    this.downloadService.downloadItems.snapShot.profileSnapshotNodataState =
                     this.profileSnapshotNodataState;
                }
            }
        });
    }
    /**
     * 处理删除快照后数据
     */
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
    /**
     * 关闭快照对比
     */
    public closeContrastSnapshot() {
        this.mySelectedsFirstSnapshot = null;
        this.mySelectedsSecondSnapshot = null;
        this.showSnapShot = false;
        this.contrastSnapshot.close();
    }

    /**
     * 选择的快照类型
     */
    public onNgModelSnapshotType(event: any): void {
        this.snapShotLabel(event.type);
        this.mySelectedsFirstSnapshot = null;
        this.mySelectedsSecondSnapshot = null;
    }

    /**
     * 第一条快照
     */
    public onNgModelFirstChange(event: any): void {
        this.snapShotLabel(event.type);
        this.myOptionsSecondSnapshot.forEach((e) => {
            if (e.label === event.label) {
                e.disabled = true;
            }
        });
        this.mySelectedsSecondSnapshot = null;
    }

    /**
     * 第二条快照
     */
    public onNgModelSecondChange(event: any): void {
        if (this.mySelectedsSecondSnapshot && this.mySelectedsFirstSnapshot) {
            this.showSnapshotError = false;
        } else {
            this.showSnapshotError = true;
        }
    }

    /**
     * 点击第二条快照
     */
    public onSecondClick(event: MouseEvent): void {
        this.myOptionsSecondSnapshot.forEach((e) => {
            if (this.mySelectedsFirstSnapshot) {
                if (e.label === this.mySelectedsFirstSnapshot.label) {
                    e.disabled = true;
                }
            }
        });
    }

    /**
     * 确认快照对比
     */
    public onContrastSnapshot() {
        if (this.mySelectedsSecondSnapshot && this.mySelectedsFirstSnapshot) {
            this.showSnapShot = false;
            this.contrastSnapshot.close();
            this.showContrastData = true;  // 显示快照对比数据
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
                if (this.isIntellij){
                    this.currentHeapLabel = this.mySelectedsSecondSnapshot.oldLabel;
                    this.prevHeapLabel = this.mySelectedsFirstSnapshot.oldLabel;
                }
                if (this.snapshotJdbcpool) {
                    this.snapshotJdbcpool.getData(this.currentHeapLabel, this.prevHeapLabel);
                }
            } else if (this.snapshotType === 'http') {
                this.currentHeapLabel = this.mySelectedsSecondSnapshot.label;
                this.prevHeapLabel = this.mySelectedsFirstSnapshot.label;
                if (this.snapshotHttp) {
                    this.snapshotHttp.getData(this.currentHeapLabel, this.prevHeapLabel);
                }
            } else if (this.snapshotType === 'cassandra' || this.snapshotType ===
             'jdbc' || this.snapshotType === 'mongodb'
                || this.snapshotType === 'hbase') {
                this.currentHeapLabel = this.mySelectedsSecondSnapshot.label;
                this.prevHeapLabel = this.mySelectedsFirstSnapshot.label;
                if (this.isIntellij){
                  this.currentHeapLabel = this.mySelectedsSecondSnapshot.oldLabel;
                  this.prevHeapLabel = this.mySelectedsFirstSnapshot.oldLabel;
                }
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

    /**
     * 返回
     * @param childData 节点
     */
    public goBack(childData: any) {
        this.showContrastData = childData;
        this.snapshotA = '';
        this.snapshotB = '';
        if (this.showSnapShotData) {
            this.onClickTree(this.innerDataItem, this.innerDataIdx);
        }
    }

    /**
     * 交换对比
     * @param obj 节点对象
     */
    public toggleSnapshotIN(obj: any) {
        if (this.isIntellij){
          obj.A = this.formatDate(obj.A) + ' ' + obj.A.split(' ')[1];
          obj.B = this.formatDate(obj.B) + ' ' + obj.B.split(' ')[1];
        }
        this.snapshotA = obj.A;
        this.snapshotB = obj.B;
        this.cdr.detectChanges();
    }
    /**
     * 交换AB图标
     * @param childData 标签
     */
    public goHistogramChild(childData: any) {
        this.showContrastData = childData;
        this.snapshotA = '';
        this.snapshotB = '';
        if (this.showSnapShotData) {
            this.onClickTree(this.innerDataItem, this.innerDataIdx);
        }
    }
}
