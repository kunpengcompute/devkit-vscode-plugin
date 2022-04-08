export type RespThreadInfo = {
  tid: string;
  cpu: string;
  iowait: string;
  sys: string;
  user: string;
};

export type RespThreadList = {
  optimization: {
    data: {
      process_list: Array<RespThreadInfo>;
    };
    info: string;
    status: number;
  };
};
