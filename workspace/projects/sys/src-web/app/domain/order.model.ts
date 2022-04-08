/**
 * 预约定时启动的数据结构
 */
 export interface OrderConfig {
    cycle: boolean; // 是否周期采集
    cycleStart?: string; // 采集开始时间
    cycleStop?: string; // 采集截止时间
    targetTime?: string; // 采集时间
    appointment?: string; // TODO
}
