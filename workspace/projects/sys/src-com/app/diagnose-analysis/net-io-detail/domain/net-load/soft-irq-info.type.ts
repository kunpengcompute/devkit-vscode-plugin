/**
 * 软中断绑核分布
 */
export type SoftIrqInfo = {
  coreId: number | string;
  irqCount: number;
  ksoft: number;
};
