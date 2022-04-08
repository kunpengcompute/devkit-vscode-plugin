/** 协议类型 */
type KeyType = 'ECDSA' | 'RSA' | 'ED25519' | 'DSA';

/** 加密类型 */
type HashType = 'SHA5' | 'SHA256';

/** 指纹信息 */
export type FingerPrintInfo = {
  [propName in HashType]: Array<{
    finger_print: string;
    hash_type: HashType;
    key_length: number;
    key_type: KeyType;
    node_ip: string;
  }>;
};
