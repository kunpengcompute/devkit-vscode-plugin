/**
 * HPC 分析模式
 */
export enum HpcPresetType {
    Summary = 'default',
    Topdown = 'top-down',
    InstrucMix = 'instruction-mix',
}
/**
 * HPC 采集模式
 */
export enum CollectionType {
    OpenMP = 'OpenMP',
    MPI = 'MPI',
}
