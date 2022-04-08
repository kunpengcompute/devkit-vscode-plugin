/**
 * 硬中断绑核分布
 */
export type HardIrqAffinity = {
  coreId: number | string,
  hardIrq: {
    affinity: number, // 绑核数据（单个硬中断只有 0 | 1，网口中断可以大于 1）
    irqCount: number, // 中断数目
    [key: string]: any
  },
  xps: {
    affinity: number,
    irqCount: number,
    [key: string]: any
  },
  rps: {
    affinity: number,
    irqCount: number,
    [key: string]: any
  }
};
