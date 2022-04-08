export type NodeFingerprint = {
  nodeName: string;
  nodeIp: string;
  fingerprint: {
    [key in string]: {
      key_length: string;
      hash_type: string;
      finger_print: string;
      node_ip: string;
      key_type: string;
    }[];
  };
};
