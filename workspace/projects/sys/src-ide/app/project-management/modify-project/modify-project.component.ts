import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { TiTableColumns, TiTableRowData, TiTableSrcData, TiValidators } from '@cloud/tiny3';
import { Router, ActivatedRoute } from '@angular/router';
import { I18nService } from '../../service/i18n.service';
import { VscodeService, HTTP_STATUS_CODE } from '../../service/vscode.service';
import { FormBuilder, FormControl } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { TaskStatus } from 'sys/src-com/app/domain';
/**
 * 场景枚举
 */
const enum SENCE_VALUE {
    GENERAL_SCENARIO = 11,
    HPC = 201
}
@Component({
    selector: 'app-modify-project',
    templateUrl: './modify-project.component.html',
    styleUrls: ['./modify-project.component.scss']
})
export class ModifyProjectComponent implements OnInit {
    static MAX_NODE_ALLOW = 101;
    public myMask = false;
    public i18n: any;
    public projectInfoForm;
    public projectInfoFormGroup;
    public currentScene: any;
    public sceneId = 11;
    public sceneIds = {};  // scene id 信息列表，修改工程和查看工程根据Id就可知晓要做哪些
    public isIntellij = ((self as any).webviewSession || {}).getItem('tuningOperation') === 'hypertuner';
    constructor(
        public sanitizer: DomSanitizer,
        private route: ActivatedRoute,
        private router: Router,
        private i18nService: I18nService,
        private vscodeService: VscodeService,
        public changeDetectorRef: ChangeDetectorRef
    ) {
        this.i18n = this.i18nService.I18n();
        this.projectInfoForm = {
            scene: {  // 场景类型
                label: this.i18n.project.scenario,
                required: true,
                list: [],
                change: sceneValue => {
                    this.currentScene = sceneValue.prop.toLowerCase();
                },
            },
            component: {  // 组件
                label: this.i18n.project.component,
                required: true,
                placeholder: this.i18n.project.selectAComponent,
                list: [],
                change: value => {
                    this.projectInfoFormGroup.get('applicationScenario').reset();
                },
            },
            applicationScenario: {  // 应用场景
                label: this.i18n.project.applicationScenario,
                required: true,
                placeholder: this.i18n.project.selectAnApplicationScenario,
                list: [],
            },
            storageType: {  // 存储类型
                label: this.i18n.project.storageType,
                required: true,
                placeholder: this.i18n.project.selectStorageType,
                list: [],
                change: value => {
                    this.projectInfoFormGroup.get('storageTypeDetail').reset();
                },
            },
            storageTypeDetail: {  // 存储类型
                label: '',
                required: true,
                placeholder: '',
                list: [],
            },
            // 数据库类型
            databaseType: {
                label: this.i18n.project.databaseType,
                required: true,
                placeholder: this.i18n.project.databasePlaceholder,
                list: [],
            },
        };
        this.projectInfoFormGroup = new FormBuilder().group({
            scene: new FormControl('', TiValidators.required),
            component: new FormControl('', TiValidators.required),
            applicationScenario: new FormControl('', TiValidators.required),
            storageType: new FormControl('', TiValidators.required),
            storageTypeDetail: new FormControl('', TiValidators.required),
            databaseType: new FormControl('', TiValidators.required)
        });
        this.getScene();
        // 禁止复用路由
        this.router.routeReuseStrategy.shouldReuseRoute = () => {
            return false;
        };
    }

    // agent节点表格
    public srcAgentNodeData: TiTableSrcData;
    public agentNodeDisplay: Array<TiTableRowData> = [];
    public checkAgentNodeList: Array<TiTableRowData> = []; // 默认选中项
    public columAgentNode: Array<TiTableColumns> = [
        {
            title: ''
        },
        {
            title: '节点名称',
            width: '30%'
        },
        {
            title: '节点状态',
            width: '10%'
        },
        {
            title: '节点IP',
            width: '15%'
        },
        {
            title: '端口',
            width: '10%'
        },
        {
            title: '用户名',
            width: '15%'
        },
        {
            title: '安装路径',
            width: '20%'
        }
    ];

    // 节点状态列表
    public nodeStatusList: any;
    public nodeList: any;
    // 工程名
    public projectName = '';
    public errorNameMessage = '';
    public errorNameMessageFlag = false;
    // 工程ID
    public projectId: any;
    // 所属面板ID
    public panelId = '';
    // 手动查询，off时不影响token生命周期
    public autoFlag = 'off';
    public isAdmin = false;
    public noNodeData = '--';
    public search = {
        words: ['', ''],
        keys: ['nickName', 'nodeIp'],
    };
    public isSelected = false; // 表格展示数据方式
    private originNodeList: any[];
    public originTotal: number;
    public currentPage = 1;
    public totalNumber = 0;
    public pageSize: { options: Array<number>, size: number } = {
        options: [10, 20, 50],
        size: 10
    };
    private srcAgentNodeDataCopy: TiTableSrcData;
    public nodeNumLimit = 10;
    // 当前工程场景
    /**
     * ngOnInit
     */
    ngOnInit() {
        this.errorNameMessage = this.i18n.common_term_projiect_name_tip;
        this.route.queryParams.subscribe((data) => {
            this.projectId = data.projectId;
            this.projectName = data.projectName;
            this.panelId = data.panelId;
        });
        this.isAdmin = VscodeService.isAdmin();
        // 初始化节点表格数据
        if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
            this.changeDetectorRef.markForCheck();
            this.changeDetectorRef.detectChanges();
        }
    }
    /**
     * 数据回显
     */
    public show(content: any) {
        const form = this.projectInfoForm;
        const formGroup = this.projectInfoFormGroup;
        formGroup.reset();
        this.sceneIds[content.sceneId].forEach(item => {
            formGroup.get(item[0]).setValue(item[1]);
            if (item[0] === 'scene') {
                form.scene.change({ prop: item[2].sceneNumber });
            }
        });
        if (this.currentScene === 'hpc') {
            this.nodeNumLimit = 101;
        } else {
            this.nodeNumLimit = 10;
        }
    }
    /**
     * 获取应用场景列表
     */
    public getScene() {
        const option = {
            url: '/projects/scene/'
        };
        this.vscodeService.get(option, (res: any) => {
            const imgPathList = {
                BIG_DATA: {  // 大数据
                    order: 1,
                    prop: 'big_data'
                },
                distributed_storage: {  // 分布式存储
                    order: 2,
                    prop: 'distributed_storage'
                },
                general_scenario: {  // 通用场景
                    order: 0,
                    checked: true,
                    prop: 'general_scenario'
                },
                HPC: {  // HPC
                    order: 3,
                    prop: 'hpc'
                },
                // 数据库
                Database: {
                    order: 4,
                    prop: 'database',
                },
            };
            const language = I18nService.getLang() ? 'en' : 'zh';
            const form = this.projectInfoForm;
            const formGroup = this.projectInfoFormGroup;
            const sceneIds = {};

            const sceneList = []; // 场景类型
            let componentList = []; // 组件
            let storageTypeList = [];  // 存储类型

            res.data.data.forEach(scene => {
                sceneIds[scene.Id] = [['scene', scene.Id, scene]];
                if (imgPathList[scene.sceneNumber]?.prop === 'database') {
                    scene.sceneNameEn = 'Database';
                }
                sceneList.push({
                    label: language === 'en' ? scene.sceneNameEn : scene.sceneName,
                    value: scene.Id,
                    ...imgPathList[scene.sceneNumber]
                });

                if (imgPathList[scene.sceneNumber]?.prop === 'distributed_storage') {  // 分布式存储
                    storageTypeList = scene.children.map(storageType => {
                        const storageTypeOption = {
                            label: language === 'en' ? storageType.sceneNameEn : storageType.sceneName,
                            value: storageType.Id,
                            _children: []
                        };

                        sceneIds[storageType.Id] =
                            [...sceneIds[scene.Id], ['storageType', storageTypeOption, storageTypeOption]];

                        storageTypeOption._children = storageType.children[0].map(item => {  // tiny会把children改成分组样式
                            const itemOption = {
                                label: language === 'en' ? item.sceneNameEn : item.sceneName,
                                value: item.Id,
                            };

                            sceneIds[item.Id] =
                                [...sceneIds[storageType.Id], ['storageTypeDetail', itemOption, itemOption]];

                            return itemOption;
                        });

                        return storageTypeOption;
                    });
                } else if (imgPathList[scene.sceneNumber]?.prop === 'big_data') { // 大数据
                    componentList = scene.children.map(component => {
                        const componentOption = {
                            label: language === 'en' ? component.sceneNameEn : component.sceneName,
                            value: component.Id,
                            _children: []
                        };

                        sceneIds[component.Id] =
                            [...sceneIds[scene.Id], ['component', componentOption, componentOption]];

                        componentOption._children = component.children[0].map(item => {  // tiny会把children改成分组样式
                            const itemOption = {
                                label: language === 'en' ? item.sceneNameEn : item.sceneName,
                                value: item.Id,
                            };

                            sceneIds[item.Id] =
                                [...sceneIds[component.Id], ['applicationScenario', itemOption, itemOption]];

                            return itemOption;
                        });

                        return componentOption;
                    });
                } else if (imgPathList[scene.sceneNumber]?.prop === 'database') { // 数据库
                    form.databaseType.list = scene.children.map((databaseType: any) => {
                        const databaseTypeOption = {
                            label: language === 'en' ? databaseType.sceneNameEn : databaseType.sceneName,
                            value: databaseType.Id,
                        };
                        sceneIds[databaseType.Id] =
                            [...sceneIds[scene.Id], ['databaseType', databaseTypeOption, databaseTypeOption]];
                        return databaseTypeOption;
                    });
                }
            });

            form.scene.list = sceneList.sort((a, b) => a.order - b.order);
            form.component.list = componentList;
            form.storageType.list = storageTypeList;
            this.sceneIds = sceneIds;
            this.initAgentNodeDataTable();
            const optionUrl = {
                url: `/projects/${this.projectId}/info/`
            };
            this.vscodeService.get(optionUrl, (resp: any) => {
                const params = resp.data;
                this.show({
                    type: 'edit',
                    projectName: params.projectName,
                    projectId: this.projectId,
                    sceneId: params.sceneId,
                    nodeList: params.nodeList,
                });
                if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
                    this.changeDetectorRef.markForCheck();
                    this.changeDetectorRef.detectChanges();
                }
            });
            if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
                this.changeDetectorRef.markForCheck();
                this.changeDetectorRef.detectChanges();
            }
            // 默认选中通用场景

        });
    }
    /**
     * 工程名校验
     */
    public checkProjectName() {
        this.projectName = this.projectName.trim();
        if (!this.projectName) {
            this.errorNameMessage = this.i18n.plugins_common_term_project_name_cannot_empty;
            this.errorNameMessageFlag = true;
        } else {
            const reg = new RegExp(/^[\w\@\#\$\%\^\&\*\(\)\[\]\<\>\.\-\!\~\+\s]{1,32}$/);
            this.errorNameMessage = this.i18n.common_term_projiect_name_tip;
            this.errorNameMessageFlag = !reg.test(this.projectName);
        }
        if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
            this.changeDetectorRef.markForCheck();
            this.changeDetectorRef.detectChanges();
        }
    }
    /**
     * 初始化AgentNodeDataTable表数据
     */
    private initAgentNodeDataTable() {
        this.srcAgentNodeData = {
            data: this.agentNodeDisplay,
            state: {
                searched: false,
                sorted: false,
                paginated: false
            }
        };
        // 节点状态列表
        this.nodeStatusList = {
            on: { text: this.i18n.plugins_common_agentNode.online, color: '#61d274' },
            off: { text: this.i18n.plugins_common_agentNode.offline, color: '#ccc' },
            init: { text: this.i18n.plugins_common_agentNodeManagement.adding, color: '#267dff' },
            lock: { text: this.i18n.plugins_common_agentNodeManagement.deleting, color: '#ffd610' },
            failed: { text: this.i18n.plugins_common_agentNode.failed, color: '#F45C5E' },
        };
        this.columAgentNode = [
            {
                key: '',
                title: ''
            },
            {
                key: 'nickName',
                title: this.i18n.plugins_common_agentNodeManagement.nodeName,
                width: '30%'
            },
            {
                key: 'nodeStatus',
                title: this.i18n.plugins_common_agentNodeManagement.nodeStatus,
                width: '10%',
                options: Object.keys(this.nodeStatusList).map(key => {
                    const label = this.nodeStatusList[key].text;
                    return { key, label };
                }),
                multiple: true,
                selected: [],
            },
            {
                key: 'nodeIp',
                title: this.i18n.plugins_common_agentNodeManagement.nodeIP,
                width: '15%'
            },
            {
                title: this.i18n.plugins_common_agentNodeManagement.nodePort,
                width: '10%'
            },
            {
                title: this.i18n.plugins_common_agentNodeManagement.userName,
                width: '15%'
            },
            {
                title: this.i18n.plugins_common_agentNodeManagement.installPath,
                width: '20%'
            }
        ];
        this.gettAgentNodeDetail();
    }

    /**
     * 获取agent节点详细信息
     */
    private gettAgentNodeDetail() {
        const maxNode = this.isIntellij ? 50 : ModifyProjectComponent.MAX_NODE_ALLOW;
        let option = {
          url: '/nodes/?auto-flag=' + this.autoFlag + '&page=1&per-page=' + maxNode
        };
        this.vscodeService.get(option, (data: any) => {
            if (HTTP_STATUS_CODE.SYSPERF_SUCCESS === data.code) {
                this.autoFlag = 'on';
                this.srcAgentNodeData.data = data.data.nodeList;
                this.originNodeList = JSON.parse(JSON.stringify(this.srcAgentNodeData.data));
                this.originTotal = this.totalNumber = data.data.totalCounts;
                const nodeNickNameMap = new Map<any, any>();
                this.srcAgentNodeData.data.forEach((item) => {
                    nodeNickNameMap.set(item.nickName, item);
                });
                option = {
                    url: '/projects/' + this.projectId + '/info/'
                };
                this.vscodeService.get(option, (rep: any) => {
                    if (HTTP_STATUS_CODE.SYSPERF_SUCCESS === data.code) {
                        rep.data.nodeList.forEach((item) => {
                            this.checkAgentNodeList.push(nodeNickNameMap.get(item.nickName));

                        });
                    }
                    if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
                        this.changeDetectorRef.markForCheck();
                        this.changeDetectorRef.detectChanges();
                    }
                });
                if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
                    this.changeDetectorRef.markForCheck();
                    this.changeDetectorRef.detectChanges();
                }
            }

        });
    }

    /**
     * 修改工程
     */
    public modifyProject() {
        let nodeList = [];

        nodeList = this.checkAgentNodeList.map(node => {
            return node.id;
        });

        const formGroup = this.projectInfoFormGroup;
        if (this.currentScene === 'big_data') {
            this.sceneId = formGroup.get('applicationScenario').value.value;
        } else if (this.currentScene === 'distributed_storage') {
            this.sceneId = formGroup.get('storageTypeDetail').value.value;
        } else if (this.currentScene === 'general_scenario') {
            this.sceneId = SENCE_VALUE.GENERAL_SCENARIO;
        } else if (this.currentScene === 'hpc') {
            this.sceneId = SENCE_VALUE.HPC;
            this.nodeNumLimit = 101;
        } else if (this.currentScene === 'database') {
            this.sceneId = formGroup.get('databaseType').value.value;
        }
        const option = {
            url: '/projects/' + this.projectId + '/',
            params: {
                projectName: this.projectName,
                nodeList,
                sceneId: this.sceneId
            }
        };
        this.vscodeService.put(option, (data: any) => {
            let type = 'info';
            let info = '';
            // hypertuner逻辑
            if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
                if (HTTP_STATUS_CODE.SYSPERF_SUCCESS === data.code) {
                    this.vscodeService.showTuningInfo(data.message, 'info', 'modifyProject');
                } else {
                    this.vscodeService.showTuningInfo(data.message, 'error', 'modifyProject');
                }
            } else { // vscode逻辑
                if (HTTP_STATUS_CODE.SYSPERF_SUCCESS === data.code) {
                    info = this.i18nService.I18nReplace(this.i18n.plugins_term_project_modify_success, {
                        0: this.projectName
                    });
                } else {
                    type = 'error';
                    info = data.message;
                }
                this.vscodeService.postMessage({
                    cmd: 'updateTree',
                    data: {
                        type,
                        info
                    }
                }, null);
            }
        });
    }

    /**
     * 取消修改
     */
    public cancel() {
        // hypertuner逻辑
        if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
            this.vscodeService.showTuningInfo('cancel', 'info', 'modifyProject');
        } else {
            this.vscodeService.postMessage({
                cmd: 'updateTree',
                data: {
                    closePanel: this.panelId
                }
            }, null);
        }
    }
    /**
     * 跳转至添加节点页面
     */
    public addNode() {
        if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
            this.vscodeService.showTuningInfo('addNode', 'info', 'addNode');
        } else {
            // 跳转到修改工程面板
            this.vscodeService.postMessage({
                cmd: 'navigateToPanel',
                data: {
                    navigate: 'sysperfSettings',
                    params: { innerItem: 'itemNodeManaga' }
                }
            }, null);
        }
    }
    onNodeStatusSelect(bool: boolean) {
        // 从每一行进行过滤筛选
        this.srcAgentNodeData.data = this.originNodeList.filter((rowData: TiTableRowData) => {
            // 遍历所有列
            for (const columnData of this.columAgentNode) {
                // 只有筛选列有选中项时进行筛选，如果某一筛选列选中项不包含当前行数据，则跳出循环
                if (columnData.selected && columnData.selected.length) {
                    const index: number = columnData.selected.findIndex((item: any) => {
                        return item.key === rowData[columnData.key];
                    });
                    if (index < 0) {
                        return false;
                    }
                }
            }

            return true;
        });
        this.selectClick(bool, this.srcAgentNodeData.data);
    }
    public selectClick(bool: boolean, nodeList: Array<any> = this.originNodeList) {
        this.isSelected = bool;
        if (bool) {
            this.srcAgentNodeData.data = nodeList.filter(node => {
                return this.checkAgentNodeList.some(item => {
                    return item.id === node.id;
                });
            });
            if (this.checkAgentNodeList.length <= 10) {
                    this.currentPage = 1;
                }
        }

        // 如果节点列表和刷新数据之前选中列表不为空，那么把选择中的节点重新勾选上
        if (this.srcAgentNodeData.data.length > 0 && this.checkAgentNodeList.length > 0) {
            const tempNodelList = this.srcAgentNodeData.data.filter(node => {
                return this.checkAgentNodeList.some(item => item.id === node.id);
            });
            this.checkAgentNodeList = tempNodelList;
        }
        this.totalNumber = this.srcAgentNodeData.data.length;
    }
}
