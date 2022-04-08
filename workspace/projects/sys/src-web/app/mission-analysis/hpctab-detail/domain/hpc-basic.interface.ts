export interface IHPCBasic {
    title: string;
    value: string;
    content: {
        label: string,
        value: string,
    }[];
    tableData?: any;
}

export interface IHPCBasicData {
    run_time: IHPCBasic;
    cpi: IHPCBasic;
    use_rate: IHPCBasic;
    bandwith: IHPCBasic;
    hotspots: IHPCBasic;
}
