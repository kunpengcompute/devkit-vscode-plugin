export interface FuncReleaseInfo {
  childleak: Array<{
    count: number,
    function_name: string,
    module: string,
    oper: number[],
    stack: string,
  }>;
  selfleak: Array<{
    count: number,
    function_name: string,
    module: string,
    oper: number[],
    stack: string,
  }>;
}

export interface GetMemoryReleaseInfo {
  code: string;
  message: string;
  messageArgs: Array<string>;
  data: {
    memory_release: {
      status: number;
      info: string;
      data: FuncReleaseInfo;
    };
  };
}

