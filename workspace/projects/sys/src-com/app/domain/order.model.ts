/**
 * 预约定时启动的数据结构
 */
export type OrderConfig = {
    // 是否周期采集
    cycle: boolean;
    // 采集开始时间
    cycleStart?: string;
    // 采集截止时间
    cycleStop?: string;
    // 采集时间
    targetTime?: string;
    // TODO
    appointment?: string;
};
