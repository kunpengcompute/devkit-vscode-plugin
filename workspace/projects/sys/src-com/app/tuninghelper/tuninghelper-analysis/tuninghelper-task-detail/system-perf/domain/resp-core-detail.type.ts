export type RespProcessInfo = {
  command: string;
  cpu_id: string;
  cpu_usage: string | number;
  guest: string;
  id: number;
  pid: string | number;
  system: string | number;
  tid: string;
  usr: string | number;
};

export type RespHardInterrunptsInfo = {
  affinity: string;
  device_name: string;
  event_name: string;
  id: number;
  'intr/s': number;
  intr_num: number
};

export type RespSoftInterrunptsInfo = {
  'intr/s': number;
  type: string;
};

export type RespCoreDetail = {
  optimization: {
    data: {
      process: Array<RespProcessInfo>;
      hard_interrupts: Array<RespHardInterrunptsInfo>;
      soft_interrupts: Array<RespSoftInterrunptsInfo>;
    };
    info: string;
    status: number;
  };
};
