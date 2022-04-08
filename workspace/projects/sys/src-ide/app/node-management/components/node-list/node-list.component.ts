// 节点列表【用途：节点管理、新建工程、编辑工程、查看工程节点列表】
import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { TiTableColumns, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';

import { I18nService } from '../../../service/i18n.service';
import { AxiosService } from '../../../service/axios.service';
import {COLOR_THEME, currentTheme, VscodeService} from '../../../service/vscode.service';
import { MessageService } from '../../../service/message.service';
import { ThousandSeparatorPipe } from 'projects/sys/src-ide/app/pipes/thousand-separator.pipe';
import { ToolType } from 'projects/domain';
import { INodeListRef } from '../../node-list-ref.model';
import { HPC_NODE_NUM_MAX } from 'sys/src-com/app/global/constant';
import { HttpService } from 'sys/src-ide/app/service';

// columns 的接口
interface TableColumn extends TiTableColumns {
    prop: string;
    title: string;
}

@Component({
    selector: 'app-node-list',
    templateUrl: './node-list.component.html',
    styleUrls: ['./node-list.component.scss']
})

export class NodeListComponent implements OnInit, OnDestroy, INodeListRef {
    @Input() hasCheckBox = false;
    @Input() hasOperate = false;
    @Input() hasAlarmInfo = false;  // 添加运行目录和日志目录列
    @Input() hasPagination = false;
    @Input() selectedNodeIds: any;
    @Output() editNodeName = new EventEmitter();
    @Output() deleteNode = new EventEmitter();
    @Output() viewLogs = new EventEmitter();
    // 当节点数量大于或等于最大值时，将
    @Output() maxNodeAllow = new EventEmitter<boolean>();
    public i18n;

    public columns: Array<TableColumn> = [];
    public srcData: TiTableSrcData;
    // 表示表格实际呈现的数据（开发者默认设置为[]即可）
    public displayed: Array<TiTableRowData> = [];
    public toolType = sessionStorage.getItem('toolType');
    public currentPage = 1;
    public totalNumber = 0;
    public pageSize: { options: Array<number>, size: number } = {
        options: [10, 20, 50],
        size: 10
    };

    // 运行目录and日志目录
    public subscription: any;
    public alarmInfo: any = {};

    public nodeStatusList: any = {};

    public allNodeIds: Array<any> = [];

    public noNodeData = '--';
    // 判断是否是管理员
    public userRoleFlag = false;
    public showLoading = false;
    // 获取主题颜色
    public ColorTheme = {
        Dark: COLOR_THEME.Dark,
        Light: COLOR_THEME.Light
    };
    public currTheme = COLOR_THEME.Dark;
    public search = {
        words: ['', '', ''],
        keys: ['nodeName', 'nodeIP', 'username'],
    };

    private getNodesInterval: any;
    private originNodeList: any[];
    constructor(
        public i18nService: I18nService,
        public Axios: AxiosService,
        public vscodeService: VscodeService,
        private msgService: MessageService,
        private http: HttpService) {
        this.i18n = this.i18nService.I18n();
        const operateList = {
            edit: {
                label: this.i18n.common_term_operate_edit,
                onclick: (node: any) => this.editNodeName.emit(node),
            },
            delete: {
                label: this.i18n.common_term_operate_del,
                onclick: (node: any) => this.deleteNode.emit(node),
            },
            viewLogs: {
                label: this.i18n.plugins_sysperf_message_nodeManagement.viewLog,
                onclick: (node: any) => this.viewLogs.emit(node),
            },
        };
        this.nodeStatusList = {
            on: {
                text: this.i18n.node.online,
                operate: (nodeInfo: any) => this.isLocalNode(nodeInfo) ? [operateList.edit]
                    : [operateList.edit, operateList.viewLogs, operateList.delete],
                className: 'icon_nodeStatus',
                color: '#61d274',
            },
            off: {
                text: this.i18n.node.offline,
                operate: [operateList.edit, operateList.viewLogs, operateList.delete],
                className: 'icon_nodeStatus',
                color: '#ccc',
            },
            init: {
                text: this.i18n.plugins_sysperf_message_nodeManagement.adding,
                operate: [operateList.viewLogs],
                className: 'runing',
            },
            lock: {
                text: this.i18n.plugins_sysperf_message_nodeManagement.deleting,
                operate: [operateList.viewLogs],
                className: 'runing',
            },
            failed: {
                text: this.i18n.status_Failed,
                operate: [operateList.viewLogs, operateList.delete],
                className: 'icon_nodeStatus',
                color: '#F45C5E',
            },
        };
    }

    /**
     * 组件初始化
     */
    ngOnInit() {
        // vscode颜色主题适配
        this.currTheme = currentTheme();
        this.vscodeService.regVscodeMsgHandler('colorTheme', (msg: any) => {
            this.currTheme = msg.colorTheme;
        });
        // 判断是否为管理员
        this.userRoleFlag = VscodeService.isAdmin();

        this.columns = [
            {
                prop: 'nodeName',
                title: this.i18n.plugins_sysperf_message_nodeManagement.nodeName,
                width: '130px',
                search: true,
                searchIndex: 0
            },
            {
                prop: 'nodeStatus',
                title: this.i18n.common_term_node_status,
                width: '130px',
                filter: true,
                options: Object.keys(this.nodeStatusList).map(key => {
                    const label = this.nodeStatusList[key].text;
                    return { key, label};
                }),
                multiple: true,
                selected: [],
            },
            {
                prop: 'nodeIP',
                title: this.i18n.nodeConfig.node,
                width: '140px',
                search: true,
                searchIndex: 1
            },
            {
                prop: 'port',
                title: this.i18n.plugins_sysperf_message_nodeManagement.nodePort,
                width: '100px'
            },
            {
                prop: 'username',
                title: this.i18n.common_term_login_name,
                width: '120px',
                search: true,
                searchIndex: 2
            },
            {
                prop: 'installPath',
                title: this.i18n.plugins_sysperf_message_nodeManagement.installPath,
                width: '130px'
            },
        ];

        if (this.hasAlarmInfo) {
            this.columns.push({
                prop: 'Installation',
                title: this.i18n.plugins_sysperf_message_nodeManagement.runDirectory,
                iconTip: this.i18n.plugins_sysperf_message_nodeManagement.runDirectoryTip,
                width: '150px',
            });
            this.columns.push({
                prop: 'Log',
                title: this.i18n.plugins_sysperf_message_nodeManagement.logDirectory,
                iconTip: this.i18n.plugins_sysperf_message_nodeManagement.logDirectoryTip,
                width: '150px',
            });

            this.msgService.sendMessage({
                type: 'sendAlarmInfo',
                status: true,
            });

            const i18n = this.i18n;
            const gaugeColors: any = {
                True: '#ED4B4B',
                False: '#FF9B00',
                Normal: '#0067ff',
            };
            const decimalNum = 2; // 保留两位小数
            const thousandSeparatorPipe = new ThousandSeparatorPipe();
            const parse = (value: any) => thousandSeparatorPipe.transform((+value).toFixed(decimalNum));
            // 磁盘的词条和数值
            const diskData = (data: any, level: any) => {
                const res: any = {
                    usageRatio: [0, null, undefined, '0'].includes(data.disk_value_total)
                        ? 0 : (1 - data.disk_value_free / data.disk_value_total) * 100,
                    gaugeColor: gaugeColors[level],
                };
                const unit = 'GB';
                if (res.usageRatio < 20) { res.usageRatio = 20; }

                res.free = i18n.memInfo.disk.title22
                    + i18n.common_term_colon
                    + ' ' + parse(data.disk_value_free / 1024)
                    + ' ' + unit;
                res.total = `${i18n.memInfo.disk.title1}${parse(data.disk_value_total / 1024)} ${unit}`;
                res.suggest = `${i18n.memInfo.disk.title_suggestFree}${i18n.common_term_colon}
                    > ${parse(data.disk_value_space / 1024)} ${unit}`;

                if (['True', 'False'].includes(level)) {
                    res.suggestion = this.i18n.memInfo.disk.tip1;
                }
                return res;
            };
            // 工作空间的词条和数值
            const toolData = (key: any, data: any, level: any) => {
                const res: any = {
                    usageRatio: [0, null, undefined, '0'].includes(data.tool_value_total)
                        ? 0 : (1 - data.tool_value_free / data.tool_value_total) * 100,
                    gaugeColor: gaugeColors[level],
                };
                let unit = 'GB';
                if (res.usageRatio < 20) { res.usageRatio = 20; }

                if (key.endsWith('Log')) {
                    unit = 'MB';
                    res.free = this.i18n.memInfo.space.title22
                        + this.i18n.common_term_colon
                        + ' ' + parse(data.tool_value_free)
                        + ' ' + unit;
                    res.total = `${this.i18n.memInfo.space.title_total}${this.i18n.common_term_colon}
                        ${parse(data.tool_value_total)} ${unit}`;
                    res.suggest = `${this.i18n.memInfo.space.title_suggestFree}${this.i18n.common_term_colon}
                    > ${parse(data.tool_value_space)} ${unit}`;
                } else {
                    res.free = `${this.i18n.memInfo.space.title22}${this.i18n.common_term_colon}
                        ${parse(data.tool_value_free / 1024)} ${unit}`;
                    res.total = `${this.i18n.memInfo.space.title_total}${this.i18n.common_term_colon}
                        ${parse(data.tool_value_total / 1024)} ${unit}`;
                    res.suggest = `${this.i18n.memInfo.space.title_suggestFree}${this.i18n.common_term_colon}
                        > ${parse(data.tool_value_space / 1024)} ${unit}`;
                }

                if (['True', 'False'].includes(level)) {
                    res.suggestion = this.i18n.memInfo.space.tip1;
                }
                return res;
            };
            const parseData = (key: any, data: any) => {
                if (data.tool_alarm === 'True') {
                    return toolData(key, data, 'True');
                } else if (data.disk_alarm === 'True') {
                    return diskData(data, 'True');
                } else if (data.tool_alarm === 'False') {
                    return toolData(key, data, 'False');
                } else if (data.disk_alarm === 'False') {
                    return diskData(data, 'False');
                } else {
                    return toolData(key, data, 'Normal');
                }
            };
            this.getMemInfo(parseData);
        }

        if (this.userRoleFlag) {
            this.columns.push({ prop: 'operate', title: this.i18n.common_term_operate, width: '226px' });
        }

        // 表格源数据，开发者对表格的数据设置请在这里进行
        this.srcData = {
            // 源数据
            data: [],
            state: {
                searched: false, // 源数据未进行搜索处理
                sorted: false,   // 源数据未进行排序处理
                paginated: false  // 源数据未进行分页处理
            }
        };

        this.getNodes(true);
        this.getNodesInterval = setInterval(() => {
            this.getNodes(false);
        }, 5000);
    }

    /**
     * 组件结束后操作
     */
    ngOnDestroy() {
        clearInterval(this.getNodesInterval);

        if (this.hasAlarmInfo) {
            this.msgService.sendMessage({
                type: 'sendAlarmInfo',
                status: false,
            });
            this.subscription.unsubscribe();
        }
    }

    onNodeStatusSelect(_: any, __: any) {
        // 从每一行进行过滤筛选
        this.srcData.data = this.filterSeletedData(this.originNodeList, this.columns);
    }

    /**
     * 判断是否是本地节点【安装包自身的节点】
     *
     * @param nodeInfo 节点信息
     */
    public isLocalNode(nodeInfo: any) {
        // 端口、用户名和安装路径都没有的就是本地节点(此判断条件有变，server节点用户名与安装路径有值)，只有agent的网口为22
        return !nodeInfo.nodePort;
    }

    /**
     * 格式化节点列表
     *
     * @param nodeList 节点列表
     */
    public formatNodeList(nodeList: any) {
        return nodeList.map((item: any) => {
            const operate = this.nodeStatusList[item.nodeStatus].operate;

            return {
                id: item.id,
                nodeName: item.nickName,
                nodeStatus: item.nodeStatus,
                nodeStatusInfo: item.nodeStatusInfo,
                nodeIP: item.nodeIp,
                port: item.nodePort ? item.nodePort : this.noNodeData,
                username: item.userName ? item.userName : this.noNodeData,
                installPath: item.installPath ? item.installPath : this.noNodeData,
                operate: typeof operate === 'function' ? operate(item) : operate,
            };
        });
    }

    /**
     * 获取节点
     */
    public getNodes(isInit: boolean) {
        if (isInit) {
            this.showLoading = true;
        }
        const params = {
            'auto-flag': 'on',
            page: 1,
            'per-page': HPC_NODE_NUM_MAX,
        };
        const headers = {
            showLoading: false
        };
        const urlNode = this.toolType === ToolType.DIAGNOSE ? '/nodes/?analysis-type=memory_diagnostic' : '/nodes/';
        this.http.get(urlNode, {params, headers})
            .then((res: any) => {
                const data = res.data;
                const tabelData: any[] = this.formatNodeList(data.nodeList);
                this.originNodeList = [...tabelData];
                this.allNodeIds = this.srcData.data.map(item => item.id);
                this.totalNumber = tabelData.length ?? 0;
                this.maxNodeAllow.emit(tabelData.length >= HPC_NODE_NUM_MAX);
                this.srcData.data = this.filterSeletedData(this.originNodeList, this.columns);
            })
            .catch((err) => {
                this.vscodeService.showInfoBox(err.message, 'warn');
            })
            .finally(() => {
                this.showLoading = false;
            });
    }

    /**
     * 跟踪数据
     */
    public trackByFn(index: number, item: any): number {
        return item.ip;
    }

    /**
     * 判断是否为空
     */
    public isNull(params: any) {
        return isNaN(params) || [null, undefined, ''].includes(params);
    }

    /**
     * 需要根据剩余空间是否超出隐藏来判断tips框中是否添加剩余空间的显示
     */
    public updateGaugeTipContent(el: any, obj: any) {
        const span = el.hostEle.childNodes[1];
        obj.hasOverflow = span.scrollWidth > span.offsetWidth;
    }

    /**
     * 获取agent磁盘空间容量的告警和恢复信息
     */
    public getMemInfo(parseData: any) {
        // 手动请求一次之后跟extension那边的查询保持一致
        this.vscodeService.get({ url: '/projects/1/alarm/?auto-flag=on&date=' + Date.now() }, (res: any) => {
            if (res.code && res.code === 'SysPerf.Success') {
                const msg = res.data.agent_alarm_data;
                Object.keys(msg).forEach(key => msg[key] = parseData(key, msg[key]));
                this.alarmInfo = msg;
            }
        });
        // 从extension拿数据
        this.vscodeService.regVscodeMsgHandler('memoryInfo', (msg: any) => {
            Object.keys(msg).forEach(key => msg[key] = parseData(key, msg[key]));
            this.alarmInfo = msg;
        });
    }

    /**
     * 过滤数据
     * @param originData 原始数据
     * @param columns 列表配置
     * @returns 过滤数据
     */
    private filterSeletedData(originData: any[], columns: TiTableColumns[]) {
        return originData.filter((rowData: TiTableRowData) => {
        // 遍历所有列
        for (const columnData of columns) {
            // 只有筛选列有选中项时进行筛选，如果某一筛选列选中项不包含当前行数据，则跳出循环
            if (columnData.selected && columnData.selected.length) {
            const index: number = columnData.selected.findIndex((item: any) => {
                return item.key === rowData[columnData.prop];
            });
            if (index < 0) {
                return false;
            }
            }
        }
        return true;
        });
    }
}
