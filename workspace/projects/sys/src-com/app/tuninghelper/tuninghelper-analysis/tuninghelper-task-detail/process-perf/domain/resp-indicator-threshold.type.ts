import { ProcessCpuTarget } from './process-cpu-target.enum';

export type RespIndicatorThreshold = {
  optimization: {
    data: {
      threshold: Array<{
        high_value: number;
        id: number;
        low_value: number;
        metric: ProcessCpuTarget;
      }>;
    };
    info: string;
    status: number;
  };
};
