import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ViewEncapsulation } from '@angular/core';
import { TiModalService, TiModalRef, TiTreeUtil, TiTreeNode } from '@cloud/tiny3';
import { VscodeService } from '../../../service/vscode.service';
import { I18nService } from '../../../service/i18n.service';
import { ProfileDownloadService } from '../../../service/profile-download.service';

@Component({
    selector: 'app-profile-export',
    templateUrl: './profile-export.component.html',
    styleUrls: ['./profile-export.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class ProfileExportComponent implements OnInit {
    /**
     * 实时数据限定设置弹窗
     */
    @ViewChild('profileExportModal', { static: false }) profileExportModal: any;
    @Output() public getActive = new EventEmitter<any>();

    /**
     * 拦截active的setter方法，在active为true时打开弹窗
     */
    @Input()
    set active(active: boolean) {
        if (active) {
            this.show();
        }
    }

    /**
     * 弹窗关闭事件
     */
    @Output() dismiss = new EventEmitter<void>();

    public i18n: any;
    public treeData: Array<any>;
    private downloadData: any;
    private modal: TiModalRef;
    public tabs: any[] = [];
    public selectedData: any[] = [];
    public tipActive = true;

    constructor(
        private tiModal: TiModalService,
        private vscodeService: VscodeService,
        private i18nService: I18nService,
        private downloadService: ProfileDownloadService
    ) {
        this.i18n = this.i18nService.I18n();
    }

    /**
     * 组件初始化
     */
    ngOnInit() {
        this.initExportData();
        this.initDownloadData();
    }

    /**
     * 初始化导出数据
     */
    public initExportData() {
        this.treeData = [{
            label: this.i18n.plugins_perf_java_profiling_export.all,
            expanded: true,
            checked: true,
            children: [
                {
                    label: this.i18n.protalserver_profiling_tab.overview,
                    // 页签的数据在downloadService.downloadItems里面的位置
                    dataIndex: ['overview'],
                    tabName: 'overview',
                    checked: true,
                    link: 'overview'
                },
                {
                    label: this.i18n.protalserver_profiling_tab.cpu,
                    dataIndex: ['thread'],
                    tabName: 'cpu',
                    link: 'thread',
                    checked: true,
                    expanded: true,
                    children: [
                        {
                            label: this.i18n.protalserver_profiling_thread.list,
                            dataIndex: ['thread.threadList', 'thread.updateOptions'],
                            checked: true,
                            tabName: 'list'
                        },
                        {
                            label: this.i18n.protalserver_profiling_thread.dump,
                            dataIndex: ['thread.threadDump'],
                            tabName: 'dump',
                            disabled: true,
                            tip: this.i18n.protalserver_profiling_tab.exportThreadLimit
                        },
                    ]
                },
                {
                    label: this.i18n.protalserver_profiling_tab.memoryDump,
                    // 页签的数据在downloadService.downloadItems里面的位置
                    dataIndex: ['memoryDump'],
                    tabName: 'memoryDump',
                    link: 'memoryDump',
                    disabled: true,
                    tip: this.i18n.protalserver_profiling_tab.exportLimit
                },
                {
                  label: this.i18n.protalserver_profiling_tab.hot,
                  dataIndex: ['hot'],
                  tabName: 'hot',
                  link: 'hot',
                  disabled: true,
                  tip: this.i18n.protalserver_profiling_tab.exportHotLimit
                },
                {
                    label: this.i18n.protalserver_profiling_tab.gc,
                    dataIndex: ['gc'],
                    tabName: 'gc',
                    link: 'gc',
                    checked: true,
                    expanded: true,
                    children: [
                        {
                            label: this.i18n.protalserver_profiling_tab.gcAnalysis,
                            dataIndex: ['gc'],
                            tabName: 'gcAnalysis',
                            checked: true,
                            link: 'analysis',
                        },
                        {
                            label: this.i18n.protalserver_profiling_tab.gcLog,
                            dataIndex: ['gc.gcLog'],
                            tabName: 'gcLog',
                            disabled: true,
                            tip: this.i18n.protalserver_profiling_tab.exportGClogLimit
                        }
                    ]
                },
                {
                    label: this.i18n.protalserver_profiling_tab.io,
                    dataIndex: ['pFileIO', 'pSocketIO'],
                    tabName: 'io',
                    link: 'io',
                    checked: true,
                    expanded: true,
                    children: [
                        {
                            label: this.i18n.protalserver_profiling_tab.fileIo,
                            dataIndex: ['pFileIO'],
                            checked: true,
                            tabName: 'fileIo'
                        },
                        {
                            label: this.i18n.protalserver_profiling_tab.socketIo,
                            dataIndex: ['pSocketIO'],
                            checked: true,
                            tabName: 'socketIo'
                        }
                    ]
                },
                {
                    label: this.i18n.protalserver_profiling_tab.database,
                    dataIndex: ['jdbc', 'jdbcpool', 'mongodb', 'cassandra', 'hbase'],
                    tabName: 'database',
                    link: 'database',
                    checked: true,
                    expanded: true,
                    children: [
                        {
                            label: this.i18n.protalserver_profiling_tab.jdbc,
                            dataIndex: ['jdbc'],
                            checked: true,
                            tabName: 'jdbc'
                        },
                        {
                            label: this.i18n.protalserver_profiling_tab.jdbcpool,
                            dataIndex: ['jdbcpool'],
                            checked: true,
                            tabName: 'jdbcpool'
                        },
                        {
                            label: this.i18n.protalserver_profiling_tab.mongodb,
                            dataIndex: ['mongodb'],
                            checked: true,
                            tabName: 'mongodb'
                        },
                        {
                            label: this.i18n.protalserver_profiling_tab.cassandra,
                            dataIndex: ['cassandra'],
                            checked: true,
                            tabName: 'cassandra'
                        },
                        {
                            label: this.i18n.protalserver_profiling_tab.hbase,
                            dataIndex: ['hbase'],
                            checked: true,
                            tabName: 'hbase'
                        }
                    ]
                },
                {
                    label: this.i18n.protalserver_profiling_tab.web,
                    dataIndex: ['http', 'springBoot'],
                    tabName: 'web',
                    link: 'web',
                    checked: true,
                    expanded: true,
                    children: [
                        {
                            label: this.i18n.protalserver_profiling_tab.httpRequest,
                            dataIndex: ['http'],
                            checked: true,
                            tabName: 'httpRequest',
                        },
                        {
                            label: this.i18n.protalserver_profiling_tab.springBoot,
                            dataIndex: ['springBoot'],
                            checked: true,
                            tabName: 'springBoot',
                        }
                    ]
                },
                {
                    label: this.i18n.protalserver_profiling_tab.snapshot,
                    dataIndex: ['snapShot'],
                    link: 'snapshot',
                    checked: true,
                    tabName: 'snapshot',
                },
            ]
        }];
    }

    /**
     * 初始化下载数据
     */
    private initDownloadData() {
        this.downloadData = {
            tabs: [],
            profileInfo: {
                jvmId: '',
                jvmName: '',
                createTime: 0
            },
            overview: {
                echarts: {},
                xAxisData: [],
                realtime: [],
                maxDate: [],
                timeNow: 0,
                option: {},
                environment: {},
                arguments: '',
                keyword: {}
            },
            thread: {
                threadList: {},
                threadDump: [],
                updateOptions: {},
                threadListData: {},
                threadTabs: [],
            },
            javaHeap: {
                classes: []
            },
            jdbc: {
                threshold: 50,
                snapCount: 0,
                isCheck: false,
                hotspot: [],
                monitor: {
                    startDate: '',
                    data: {}
                },
            },
            jdbcpool: {
                threshold: 50,
                snapCount: 0,
                jdbcpoolConfig: [],
                configTitle: '',
                alertThreshold: null,
                spinnerValue: 3,
                tableData: [],
                echartsData: [],
                monitor: {
                    startDate: '',
                    data: {}
                },
            },
            mongodb: {
                threshold: 50,
                snapCount: 0,
                hotspot: [],
                monitor: {
                    startDate: '',
                    data: {}
                },
            },
            cassandra: {
                threshold: 50,
                snapCount: 0,
                hotspot: [],
                monitor: {
                    startDate: '',
                    data: {}
                },
            },
            hbase: {
                threshold: 50,
                snapCount: 0,
                hotspot: [],
                monitor: {
                    startDate: '',
                    data: {}
                },
            },
            http: {
                threshold: 50,
                snapCount: 0,
                hotspot: [],
                monitor: {
                    startDate: '',
                    data: {}
                },
            },
            springBoot: {
                contentTip: '',
                springBootInfo: {},
                tabs: [],
                health: {},
                beans: [],
                metrics: {
                    echarts1: [],
                    echarts2: [],
                    echarts3: [],
                    echarts4: [],
                    echarts5: [],
                    echartsTime: [],
                    metrics: [],
                },
                httpTraces: {
                    traceFailReason: '',
                    allHttpTraces: [],
                    httpOptions: {},
                    threshold: 0,
                    filterTime: {
                        data: '',
                        start: '',
                        end: '',
                    }
                },
            },
            gc: {
                tableData: [],
                startDate: {},
                maxValue: {
                    yGcact: '',
                    yGcstore: '',
                    ycGcback: '',
                    yGcpause: '',
                    yGcthread: ''
                }
            },
            gclog: {
                isFinished: '',
                keyIndicatorArray: [],
                metricsData: [],
                causeSrcData: {},
                pieData: [],
                selectValue: {},
                pauseSrcData: {},
                showNodate: '',
                memoryUsedArray: [],
                collectSrcData: {},
                GCHeapUsedData: {},
                GCHeapUsedArray: [],
                GCPauseTimeArray: [],
                suggestArr: [],
            },
            pFileIO: {
                threshold: 1024,
                snapCount: 0,
                tableData: [],
                fileNameMap: {},
                currentEchartsFileName: '',
                currentEchartsFdName: '',
                echartsLabelTop: '',
                echartsLabelBottom: '',
                stackTranceData: [],
                currentFdTableList: [],
                spinnerValue: 10,
                primaryTime: null,
                dataCount: 0,
                echarts: {
                    timeList: new Array(180).fill(''),
                    readSpeed: [],
                    writeSpeed: []
                },
            },
            pSocketIO: {
                threshold: 256,
                snapCount: 0,
                tableData: [],
                fileIPMap: {},
                isCurrentType: '',
                currentIpIndex: null,
                currentHostIndex: null,
                currentFdIndex: null,
                currentEchartsIPName: '',
                currentEchartsAddrName: '',
                currentEchartsFdName: '',
                echartsLabelTop: '',
                echartsLabelBottom: '',
                stackTranceData: [],
                currentHostTableList: [],
                currentFdTableList: [],
                spinnerValue: 10,
                primaryTime: null,
                dataCount: 0,
                echarts: {
                    timeList: new Array(180).fill(''),
                    readSpeed: [],
                    writeSpeed: []
                },
            },
            heapDump: {
                recordId: '',
                newRecordId: '',
                showNodate: true,
                dumpState: '',
                chartType: '',
                snapCount: 0,
                histogramStatus: {
                    totalNumber: 0,
                    currentPage: 1,
                    size: 20
                },
                domtreeStatus: {
                    totalNumberT: 0,
                    currentTotal: 0,
                },
                histogram: [],
                domtree: []
            },
            hot: {
                hotData: {},
                inforData: [],
                startOnHot: false,
            },
            snapShot: {
                data: {},
                innerDataItem: {},
                innerDataIdx: 0,
                currentPage: 1,
                snapShotData: '',
            }
        };
        this.downloadData.profileInfo.jvmId = (self as any).webviewSession.getItem('jvmId');
        this.downloadData.profileInfo.jvmName = (self as any).webviewSession.getItem('currentSelectJvm');
    }

    /**
     * 显示弹窗
     */
    private show() {
        this.tipActive = true;
        this.initExportData();
        this.selectFn();
        // 打开弹窗
        this.modal = this.tiModal.open(this.profileExportModal, {
            id: 'profileExportModal',
            closeIcon: false,
            draggable: true,
            dismiss: () => {
                this.dismiss.emit();
            }
        });

    }

    /**
     * 选中
     */
    public selectFn(): void {
        this.selectedData = TiTreeUtil.getSelectedData(this.treeData, false, true);
    }

    /**
     * 处理确认按钮点击事件
     * 下载已选的数据
     */
    public handleClickOk() {
        this.initDownloadData();
        const selectedData = TiTreeUtil.getSelectedData(this.treeData, false, true);
        selectedData.forEach((item: any) => {
            let parentTabName = '';
            let parentLink = '';
            if (item.parent && item.parent.length > 1) {
                parentTabName = item.parent[1].tabName;
                parentLink = item.parent[1].link;
            }
            const tab = {
                tabName: item.tabName,
                link: item.link || item.tabName,
                parentTabName,
                parentLink
            };
            this.downloadData.tabs.push(tab);
            item.dataIndex.forEach((dataIndex: string) => {
                this.deepDataCopy(this.downloadService.downloadItems, dataIndex, this.downloadData);
            });
        });

        const option = {
            cmd: 'downloadFile',
            data: {
                fileName: this.downloadData.profileInfo.jvmName + '.json',
                fileContent: JSON.stringify(this.downloadData),
                invokeLocalSave: true,
                filters: {
                    json: ['json']
                }
            }
        };
        this.vscodeService.postMessage(option, null);
        this.getActive.emit(false);
        this.modal.close();
    }

    /**
     * 深层对象赋值
     * 在不影响目标对象其他属性的情况下，将源对象的值复制到目标对象相同索引下
     *
     * @param object 源对象
     * @param index 索引
     * @param targetObject 目标对象
     */
    private deepDataCopy(object: any, index: string, targetObject: any) {
        const indexArr = index.split('.');
        const value = indexArr.reduce((obj, nextIndex) => {
            return obj[nextIndex];
        }, object);
        const newObj = { [indexArr[indexArr.length - 1]]: value };
        let target = targetObject;
        for (let i = 0; i < indexArr.length - 1; i++) {
            target = target[indexArr[i]];
        }
        Object.assign(target, newObj);
    }
}
