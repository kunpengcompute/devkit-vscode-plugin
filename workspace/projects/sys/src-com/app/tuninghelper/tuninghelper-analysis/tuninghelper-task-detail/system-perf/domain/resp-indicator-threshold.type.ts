import { SystemCpuTarget } from '.';
export type RespIndicatorThreshold = {
  optimization: {
    data: {
      threshold: Array<{
        high_value: number;
        id: number;
        low_value: number;
        metric: SystemCpuTarget;
      }>;
    };
    info: string;
    status: number;
  };
};
