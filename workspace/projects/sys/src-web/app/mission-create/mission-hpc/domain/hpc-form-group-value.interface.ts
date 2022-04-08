import { AppAndParams, OrderConfig, PidProcess } from '../../domain';
import { HpcPresetType } from '../../../domain/hpc-analysis/hpcPresetType.enum';

/**
 * HPC 的 FromGroup 的值的数据结构
 */
export interface IHpcFormGroupValue {
    taskName: string;
    appAndParams: AppAndParams;
    pidProcess: PidProcess;
    duration: number;
    preset: HpcPresetType;
    openMpParams?: string;
    mpiStatus: boolean;
    mpiEnvDir?: string;
    rank?: number;
    selectNode?: string;
    doOrder?: boolean;
    orderConfig?: OrderConfig;
    taskStartNow?: boolean;
    switch: boolean;
    mpiParams?: string;
    [rank: string]: any;
}
