export interface FuncLeakInfo {
  child_leak: Array<{ count: number, size: number, stack: string }>;
  self_leak: Array<{ count: number, size: number, stack: string }>;
}

export interface GetMemoryLeakInfo {
  code: string;
  message: string;
  messageArgs: Array<string>;
  data: {
    memory_leak: {
      status: number;
      info: string;
      data: FuncLeakInfo;
    };
  };
}

