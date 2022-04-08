/**
 * 接口返回的测试模型时序图表数据类型
 */
export type RespDiagram = {
  // y轴单位
  unit: string;
  // x时间轴
  time: any[];
  // 读数据
  read: any[];
  // 写数据
  write: any[];
};
