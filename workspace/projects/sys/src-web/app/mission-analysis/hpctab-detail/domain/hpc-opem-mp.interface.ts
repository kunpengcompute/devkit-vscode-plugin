export interface IHpcOpenMp {
    title: string;
    exetime: string;
    unbalancetime: string;
    unbalanceratge: string;
    potential_gain_value?: string;
    cpu_utiliczation?: string;
    Spin?: string;
    overhead?: string;
    id?: number;
}

export interface IHpcRankData {
    id: number;
    exe_time: string;
    run_time: string;
    expand: boolean;
    paraller_time: string;
    unbalance_time: string;
    barrierData: Array<IHpcOpenMp>;
    paralleData: Array<IHpcOpenMp>;
}
