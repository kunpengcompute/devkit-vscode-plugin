export interface ProcessReleaseStack {
  /** 最里面数组1模块名，2函数名，3自身释放次数，4子程序释放次数，5泄露类型 */
  [pid: string]: Array<[string, string, number, number, number[]]>;
}

export interface GetMemoryRelease {
  code: string;
  message: string;
  messageArgs: Array<string>;
  data: {
    memory_release: {
      status: number;
      info: string;
      data: ProcessReleaseStack;
    };
  };
}
