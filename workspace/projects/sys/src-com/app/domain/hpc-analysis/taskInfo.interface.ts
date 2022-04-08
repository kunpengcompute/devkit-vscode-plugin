import { AnalysisTarget, AnalysisType } from 'sys/src-com/app/domain';

interface IHpcTaskBase {
    'analysis-target': AnalysisTarget;
    'analysis-type': AnalysisType;
    'app-dir'?: string;
    'app-parameters'?: string;
    'targetPid'?: string;
    'process_name'?: string;
    taskname: string;
    duration: number;
    // hpc 分析模式
    preset?: string;
    // openMP参数
    open_mp_param?: string;
    // mpi 开关
    mpi_status?: boolean;
    // mpi 环境路径
    mpi_env_dir?: string;
    // mpi Rank 范围
    rank?: number;
    appointment?: string;
    targetTime?: string;
    cycle?: boolean;
    cycleStart?: string;
    cycleStop?: string;
    projectname?: string;
    switch: boolean;
}

interface IHpcTaskParam extends IHpcTaskBase {
    // 节点配置开关的标志
    status: boolean;
}

/**
 * 修改 和 重启任务时，后端返回的任务详情的数据结构
 */
export interface IHpcTaskInfo extends IHpcTaskBase {
    nodeConfig: {
        nodeId: number,
        nodeIp: string,
        nodeNickName: string,
        statusCode: string,
        taskStatus: string,
        task_param: IHpcTaskParam,
    }[];
}

/**
 * 创建、修改、重启任务，修改预约任务时，传递给后端的数据结构
 */
export interface IHpcSendTaskInfo extends IHpcTaskBase {
    nodeConfig: {
        nickName: string,
        nodeId: number,
        task_param: IHpcTaskParam,
    }[];
    status: string;
    user_message?: {
        [key: string]: {
            user_name: string,
            password: string
        }
    };
}

/**
 * 修改 HPC 预约任务时，后端返回的任务详情的数据结构
 */
export interface IHpcSchTaskInfo extends IHpcTaskBase {
    nodeConfig: {
        nickName: string,
        nodeId: number,
        nodeIp: string,
        nodeName: string,
        task_param: IHpcTaskParam,
    }[];
}
