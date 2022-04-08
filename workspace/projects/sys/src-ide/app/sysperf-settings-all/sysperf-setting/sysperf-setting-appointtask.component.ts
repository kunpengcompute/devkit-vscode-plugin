import { VscodeService } from '../../service/vscode.service';
import { I18nService } from '../../service/i18n.service';
import { TiTableRowData } from '@cloud/tiny3';
import { ToolType } from 'projects/domain';

export class SysPerfAppointTaskSet {
    public static instance: SysPerfAppointTaskSet;
    // 静态实例常量
    public displayAppointTask: Array<TiTableRowData> = [];
    public checkAppointTaskList: Array<number> = []; // 默认选中项
    public i18n: any;
    public taskNameObj: object;
    public toolType: ToolType;

    constructor(
        public i18nService: I18nService,
        public vscodeService: VscodeService,
    ) {
        this.toolType = sessionStorage.getItem('toolType') as ToolType;

        SysPerfAppointTaskSet.instance = this;
        this.i18n = this.i18nService.I18n();

        this.taskNameObj = [
            {
                type: 'C/C++ Program',
                name: this.i18n.mission_modal.cProgramAnalysis
            },
            {
                type: 'java-mixed-mode',
                name: this.i18n.mission_create.java
            },
            {
                type: 'process-thread-analysis',
                name: this.i18n.mission_modal.processAnalysis,
                cpu: this.i18n.sys.cpu,
                mem: this.i18n.sys.mem,
                context: this.i18n.process.context,
                disk: this.i18n.sys.disk
            },
            {
                type: 'system',
                name: this.i18n.mission_modal.sysPowerAllAnalysis,
                net: this.i18n.sys.net,
                cpu: this.i18n.sys.cpu,
                mem: this.i18n.sys.mem,
                disk: this.i18n.sys.disk
            },
            {
                type: 'system_config',
                name: this.i18n.mission_modal.sysConfigAnalysis,
                hard: this.i18n.sys_cof.check_types.hard,
                soft: this.i18n.sys_cof.check_types.soft,
                env: this.i18n.sys_cof.check_types.env
            },
            {
                type: 'resource_schedule',
                name: this.i18n.mission_create.resSchedule
            },
            {
                type: 'system_lock',
                name: this.i18n.mission_modal.syslockAnalysis
            },
            {
                type: 'microarchitecture',
                name: this.i18n.micarch.selct_title,
            },
            {
                type: 'mem_access_analysis',
                typeList: ['mem_access', 'miss_event', 'falsesharing'],
                name: this.i18n.mission_modal.memAccessAnalysis,
                cache_access: this.i18n.ddr.types.cache_access,
                ddr_access: this.i18n.ddr.types.ddr_access
            },
            {
                type: 'ioperformance',
                name: this.i18n.mission_create.io
            },
            {
                type: 'hpc_analysis',
                name: this.i18n.mission_create.hpc
            },
            {
                type: 'memory_diagnostic',
                name: this.i18n.diagnostic.taskParams.memory_diagnose
            },
            {
                type: 'netio_diagnostic',
                name: this.i18n.network_diagnositic.analysis_type
            },
            {
                type: 'storageio_diagnostic',
                name: this.i18n.diagnostic.storage_type
            }
        ];
    }

    /**
     * 获取节点信息列表
     */
    private getNodeList() {
        return new Promise(resolve => {
            const nodeUrl = this.toolType === ToolType.DIAGNOSE ?
            '/nodes/?auto-flag=on&analysis-type=memory_diagnostic' : '/nodes/?auto-flag=on&per-page=101';
            const option = {
                url: nodeUrl
            };
            this.vscodeService.get(option, (data: any) => {
                resolve(data.data.nodeList);
            });
        });
    }

    /**
     * 预约任务管理
     */
    public getAppointTaskItems() {
        return new Promise((resolve) => {
            // 获取预约任务列表
            const result = [];
            const queryParams = this.toolType === ToolType.DIAGNOSE
                ? '?analysis-type=memory_diagnostic'
                : '';
            const option = {
                url: '/schedule-tasks/batch/' + queryParams,
                method: 'GET'
            };

            this.vscodeService.get(option, async (data: any) => {
                const loginId = String(self.webviewSession.getItem('loginId'));
                const role = self.webviewSession.getItem('role');
                if (data.data.scheduleTaskList.length > 0) {
                    // 获取节点信息
                    const nodeInfoList: any = await this.getNodeList();
                    const nodeInfoMap = {};
                    nodeInfoList.forEach(nodeInfo => {
                        nodeInfoMap[nodeInfo.id] = nodeInfo;
                    });
                    for (const task of data.data.scheduleTaskList) {
                        if (loginId === task.userId || role === 'Admin') {
                            const taskInfo = JSON.parse(task.taskInfo);

                            // 添加节点名称和ip
                            taskInfo.nodeConfig.forEach(node => {
                                node.nodeName = nodeInfoMap[node.nodeId]?.nickName;
                                node.nodeIp = nodeInfoMap[node.nodeId]?.nodeIp;
                            });

                            const taskDef = {
                                projectId: task.projectId,
                                projectName: task.projectName,
                                taskName: task.taskName,
                                scheduleStatus: this.showStatus(task),
                                data: taskInfo,
                                taskId: task.taskId,
                                analysisType: this.handleTaskType(task),
                                analysisTarget: this.handleTaskTarget(task),
                                userName: task.userName,
                            };
                            result.push(taskDef);
                        }
                    }
                }
                return resolve(result);
            });
        });
    }

    /**
     * 状态
     * @param row row
     */
    public showStatus(row) {
        switch (row.scheduleStatus) {
            case 'reserve':
                return this.i18n.preTable.reserve;
            case 'running':
                return this.i18n.preTable.running;
            case 'success':
                return this.i18n.preTable.success;
            case 'fail':
                return this.i18n.preTable.fail;
            default:
                return '';
        }
    }

    /**
     *  任务类型
     * @param row row
     */
    public handleTaskType(row) {
        for (const item of Object.keys(this.taskNameObj)) {
          const analysisType = this.taskNameObj[item];
          if (
            row.analysisType === analysisType.type ||
            (analysisType.typeList &&
              analysisType.typeList.includes(row.analysisType))
          ) {
            return analysisType.name;
          }
        }
    }

    /**
     * handleTaskTarget
     * @param row row
     */
    public handleTaskTarget(row) {
        const taskInfo = JSON.parse(row.taskInfo);
        const analysisTarget = this.getAnalysisTarget({ taskInfo });
        if (['Launch Application', 'Attach to Process'].includes(analysisTarget)) {
            return this.i18n.common_term_task_crate_path;
        } else {
            return this.i18n.common_term_projiect_task_system;
        }
    }

    /**
     * getAnalysisTarget
     * @param param0 param0
     */
    public getAnalysisTarget({ taskInfo }) {
        const missAnalysisTarget = {
            sys: 'Profile System',
            app: 'Launch Application',
            pid: 'Attach to Process'
        };
        if (taskInfo['analysis-type'] === 'miss_event') {
            return missAnalysisTarget[taskInfo.task_param.target];
        } else {
            return taskInfo['analysis-target'] || taskInfo.analysisTarget;
        }
    }
}
