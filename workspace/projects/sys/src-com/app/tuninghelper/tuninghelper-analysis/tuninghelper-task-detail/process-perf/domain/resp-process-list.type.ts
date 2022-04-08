export type RespProcessInfo = {
  pid: string;
  cpu: string;
  iowait: string;
  sys: string;
  user: string;
};

export type RespProcessList = {
  optimization: {
    data: {
      sys: Array<RespProcessInfo>;
      app: Array<RespProcessInfo>;
    };
    info: string;
    status: number;
  };
};
