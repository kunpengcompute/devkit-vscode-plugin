export type RespMemDeviceConfig = {
  socket: string;
  channel: string;
  dimm: string;
  max_speed: number;
  data_width: string;
  band_width: number;
  size: number;
  numa_node: string;
};

export type RespMemConfig = {
  total_band_width: number;
  total_size: number;
  device: Array<RespMemDeviceConfig>;
};

export type RespSystemConfigMem = {
  optimization: {
    data: RespMemConfig;
    info: string;
    status: number;
  };
};
