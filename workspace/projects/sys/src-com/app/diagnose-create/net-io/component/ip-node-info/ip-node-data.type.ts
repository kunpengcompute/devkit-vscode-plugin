import { ConnectDialForm } from '../../domain';

type ConnectDialServers = ConnectDialForm['servers'][0];

export type IPv4NodeData = Omit<ConnectDialServers, 'sourceEth'>;

export type IPv6NodeData = Omit<ConnectDialServers, 'sourceIp'>;
