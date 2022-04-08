export interface GetMemoryLeakRelation {
  code: string;
  message: string;
  messageArgs: Array<string>;
  data: {
    memory_leak: {
      status: number;
      info: string;
      data: Array<Array<string>>;
    };
  };
}
