import {
    Component,
    OnInit,
    OnDestroy,
    Input,
    ViewChild,
    Output,
    EventEmitter,
} from '@angular/core';
import { I18nService } from '../../../service/i18n.service';
import { AxiosService } from '../../../service/axios.service';
import { TiTableColumns, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';
import { TaskService } from '../../../service/taskService/nodeList.service';
import { VscodeService } from 'projects/sys/src-ide/app/service/vscode.service';

@Component({
    selector: 'app-mission-node-thread',
    templateUrl: './mission-node-thread.component.html',
    styleUrls: ['./mission-node-thread.component.scss']
})
export class MissionNodeThreadComponent implements OnInit {

    constructor(
        public i18nService: I18nService,
        private Axios: AxiosService,
        public taskServices: TaskService,
        public vscodeService: VscodeService
    ) {
        this.i18n = this.i18nService.I18n();
    }
    @ViewChild('mission_config', { static: false }) missionConfig: any;
    @Input() formData: any = '';
    @Input() isAbled: boolean;
    @Input() taskType: string;
    @Input() projectId: number;
    @Input() nodeConfigShow: boolean;

    @Output() private onsControlNode = new EventEmitter<any>();
    // 节点列表
    public displayed: Array<TiTableRowData> = []; // 表示表格实际呈现的数据（开发者默认设置为[]即可）
    public srcData: TiTableSrcData;
    public checkedList: Array<TiTableRowData> = []; // 默认选中项
    public columns: Array<TiTableColumns> = [];
    // 国际化
    public i18n: any;

    // 获取节点ip列表
    public nodeDatas = new Array();
    public processStatus = false;

    /**
     * 初始化
     */
    ngOnInit() {
        this.columns = [
            {
                title: this.i18n.nodeConfig.nickName,
            },
            {
                title: this.i18n.nodeConfig.node,
            },
            {
                title: this.i18n.nodeConfig.processId,
            },
        ];
        this.srcData = {
            // 表格源数据，开发者对表格的数据设置请在这里进行
            data: [], // 源数据
            // 用来标识传进来的源数据是否已经进行过排序、搜索、分页操作，
            // 已经做过的，tiny就不再做了
            // 如果没做，tiny会对传入的源数据做进一步处理（前提是开发者设置了相关特性，比如分页），然后作为displayedData显示出来
            // 本示例中，开发者设置了分页特性，且源数据未进行分页处理，因此tiny会对数据进行分页处理
            state: {
                searched: false, // 源数据未进行搜索处理
                sorted: false, // 源数据未进行排序处理
                paginated: false, // 源数据未进行分页处理
            },
        };
    }

    /**
     * 获取项目节点信息
     */
    public getProjectNodes(method) {
        this.onsControlNode.emit(this.taskType);
        const url = `/projects/${this.projectId}/info/`;
        const message = {
            cmd: 'getData',
            data: {
                url,
                method,
            }
        };
        this.vscodeService.postMessage(message, (res) => {
            this.srcData.data = res.data.nodeList.map((item) => {
                const nickName = item.nickName;
                const node = item.nodeIp;
                const nodeState = item.nodeStatus;
                const status = item.status;
                const nodeId = item.nodeId;
                const id = item.id;
                const params = {
                    status: false,
                    pid: '',
                };
                return {
                    nickName,
                    node,
                    status,
                    nodeState,
                    params,
                    nodeId,
                    id,
                };
            });
        });
    }

    /**
     * 获取节点状态
     */
    public getNodeListStatus() {
        this.srcData.data.map((item) => {
            if (item.params.pid === '') {
                this.processStatus = false;
                return;
            }
        });
        this.processStatus = true;
    }

    /**
     * 监听节点状态
     */
    public pidChange(val: string) {
        if (val) {
            this.processStatus = true;
        } else {
            this.processStatus = false;
        }
    }

    /**
     * 处理状态
     */
    public statusFormat(status: boolean): string {
        let statusClass = '';
        switch (status) {
            case true:
                statusClass = 'success-icon';
                break;
            case false:
                statusClass = 'reserve-icon';
                break;
            default:
                statusClass = 'reserve-icon';
                break;
        }
        return statusClass;
    }
    /**
     * 清除
     */
    public clear() {
        this.formData = '';
        this.srcData.data = [];
        this.onsControlNode.emit('');
    }

    /**
     * 获取节点配置参数
     */
    public getNodesConfigParams(): object {
        const nodeConfig = [];
        this.srcData.data.forEach((item, index) => {
            nodeConfig.push({
                nodeId: item.id,
                nickName: item.nickName,
                task_param: Object.assign({}, this.formData, item.params),
            });
        });
        return nodeConfig;
    }


    /**
     * 获取节点配置参数
     */
    public getNodesConfigParamsAll() {
        this.onsControlNode.emit('process-thread-analysis');
        const url = `/projects/${this.projectId}/info/`;
        return new Promise((resolve, reject) => {
            this.vscodeService.get({ url }, (res) => {
                const nodeConfig = [];
                res.data.nodeList.forEach((item) => {
                    const params = {
                        pid: '',
                        status: false,
                    };
                    nodeConfig.push({
                        nodeId: item.id,
                        nickName: item.nickName,
                        task_param: Object.assign({}, this.formData, params),
                    });
                });
                resolve(nodeConfig);
                return nodeConfig;
            });
        });

    }


    /**
     * 导入模板
     */
    public importTemp(e) {
        this.processStatus = false;
        const url = `/projects/${this.projectId}/info/`;
        this.vscodeService.get({ url }, (res) => {
            this.srcData.data = res.data.nodeList.map((item) => {
                const nickName = item.nickName;
                const node = item.nodeIp;
                const nodeState = item.nodeStatus;
                const status = item.status;
                const nodeId = item.nodeId;
                const id = item.id;
                const params = {
                    pid: '',
                };
                e.forEach((items, index) => {
                    if (item.nickName === items.nodeName
                        || item.nickName === items.nodeNickName
                        || item.id === items.nodeId) {
                        params.pid = items.task_param.pid;
                    }
                });
                return {
                    nickName,
                    node,
                    status,
                    nodeState,
                    params,
                    nodeId,
                    id,
                };
            });
            this.getNodeListStatus();
        });
    }
}
