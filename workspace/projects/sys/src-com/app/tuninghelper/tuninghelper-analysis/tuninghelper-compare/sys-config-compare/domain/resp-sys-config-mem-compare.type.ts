import { CommonValue } from './common-value.type';

export type RespCompareDevice = {
  /**
   * key的实例: CPU1/SOCCKET0,CHANNEL 0,DIMM 0
   */
  [key: string]: {
    max_speed: CommonValue;
    data_width: CommonValue;
    band_width: CommonValue;
    size: CommonValue;
    numa_node: CommonValue;
  };
};

export type RespSysConfigMemCompare = {
  data: {
    total_size: CommonValue;
    total_band_width: CommonValue;
    device: RespCompareDevice;
  }
};
