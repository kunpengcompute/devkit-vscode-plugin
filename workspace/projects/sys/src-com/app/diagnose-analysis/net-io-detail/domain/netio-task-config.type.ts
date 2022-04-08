// 抓包数据
export type NetioTaskConfig = {
  analysisTarget: string;
  analysisType: 'netio_diagnostic';
  dialing: {
    connection: {
      servers: {
        destinationIp: string;
        serverIp: string;
        sourceIp: string;
      }[];
      [key: string]: any;
    };
    tcp: {
      client: { clientIp: string; connectPort: string };
      server: { serverIp: string; listenPort: string };
      [key: string]: any;
    };
    udp: {
      client: { clientIp: string; connectPort: string };
      server: { serverIp: string; listenPort: string };
      [key: string]: any;
    };
  };
  functions: string[];
  nodeConfig: { nodeId: number; nodeIp: string; [key: string]: any }[];
  projectName: string;
  netCaught: any;
  packetLoss: any;
  taskName: string;
  [key: string]: any;
};
