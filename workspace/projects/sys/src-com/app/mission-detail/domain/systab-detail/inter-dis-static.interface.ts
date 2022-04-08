// CPU使用率
interface CpuUsageInfo {
    [key: string]: {
        '%user': string,
        '%sys': string,
        '%irq': string,
        '%soft': string
    };
}

// 软中断
interface SoftwareInterTableData {
    [key: string]: {
        softirq_count_list: number[];
        softirq_count: number | string;
    };
}

// 硬中断信息
interface HardInterSingleTableData {
    [key: string]: {
        irq_affinity_mask_num: string;
        irq_affinity_mask_dict: {
            [key: string]: IrqAffinityDetail
        };
        xps_affinity_mask_num: string;
        xps_affinity_mask_dict: object;
        rps_affinity_mask_num: string;
        rps_affinity_mask_dict: object;
    };
}

interface IrqAffinityDetail {
    eth_name: string;
    irq_affinity_mask: string;
    irq_count: number | string;
    irq_count_list: 1[] | 0[];
    irq_device_bdf: string;
    irq_device_name: string;
    irq_event_name: string;
    numa_node: string;
    queue_name: string;
    rps_affinity_mask: string;
    rps_flow_cnt: string;
    xps_affinity_mask: string;
}

export {
    CpuUsageInfo,
    SoftwareInterTableData,
    HardInterSingleTableData
};
