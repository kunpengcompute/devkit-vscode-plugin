import { Injectable } from '@angular/core';
import { TiTableColumns } from '@cloud/tiny3';
@Injectable({
  providedIn: 'root'
})
export class HpcMpiTitleService {
  constructor() { }
  public rankCol: Array<TiTableColumns> = [
    { label: 'Rank', key: 'rank' },
    { label: 'Elapsed Time(s)', key: 'elapsedTime' },
    { label: 'Overall Wait Rate(%)', key: 'Overall' },
    { label: 'Communication(%)', key: 'Comunicate' },
    { label: 'P2P Communication(%)', key: 'P2P' },
    { label: 'Collective Communication(%)', key: 'Collective' },
    { label: 'Synchronization(%)', key: 'Syn' },
    { label: 'Single I/O(%)', key: 'Single' },
    { label: 'I/O(%)', key: 'IO' },
    { label: 'Collective I/O(%)', key: 'Colllect' },
    { label: 'Data Size(bytes)', key: 'DataSize' },
  ];
  public sendtypeCol: Array<TiTableColumns> = [
    { label: 'Send data type', key: 'sendData' },
    { label: 'Overall Wait Rate(%)', key: 'Overall' },
    { label: 'Communication(%)', key: 'Comunicate' },
    { label: 'P2P Communication(%)', key: 'P2P' },
    { label: 'Collective Communication(%)', key: 'Collective' },
    { label: 'Synchronization(%)', key: 'Syn' },
    { label: 'Single I/O(%)', key: 'Single' },
    { label: 'I/O(%)', key: 'IO' },
    { label: 'Collective I/O(%)', key: 'Colllect' },
    { label: 'Data Size(bytes)', key: 'DataSize' },
  ];
  public recvtypeCol: Array<TiTableColumns> = [
    { label: 'Recv data type', key: 'recvData' },
    { label: 'Overall Wait Rate(%)', key: 'Overall' },
    { label: 'Communication(%)', key: 'Comunicate' },
    { label: 'P2P Communication(%)', key: 'P2P' },
    { label: 'Collective Communication(%)', key: 'Collective' },
    { label: 'Synchronization(%)', key: 'Syn' },
    { label: 'Single I/O(%)', key: 'Single' },
    { label: 'I/O(%)', key: 'IO' },
    { label: 'Collective I/O(%)', key: 'Colllect' },
    { label: 'Data Size(bytes)', key: 'DataSize' },
  ];
  public funCol: Array<TiTableColumns> = [
    { label: 'Function', width: '25%', key: 'Function' },
    { label: 'Overall Wait Rate(%)', width: '25%', key: 'Overall' },
    { label: 'Call Count', width: '25%', key: 'Call' },
    { label: 'Data Size(bytes)', width: '25%', key: 'DataSize' }
  ];

  public mpiWaitCommunicator: Array<TiTableColumns> = [
    { label: 'Communicator', key: 'communicator', width: '10%' },
    { label: 'Overall Wait Rate(%)', key: 'overall_wait_rate' },
    { label: 'Communication(%)', key: 'communication' },
    { label: 'P2P Comm (%)', key: 'p2p_communication' },
    { label: 'Collective Comm (%)', key: 'collective_communication' },
    { label: 'Sync (%)', key: 'synchronization' },
    { label: 'I/O(%)', key: 'io' },
    { label: 'Single I/O(%)', key: 'single_io' },
    { label: 'Collective I/O(%)', key: 'collective_io' },
    { label: 'Data size(bytes)', key: 'data_size' },
    { label: 'Ranks', key: 'ranks' },
  ];

  public hpcSummaryHostpots: Array<TiTableColumns> = [
    { label: 'Index Name', width: '25%', key: 'index_name' },
    { label: 'Cpu Time', width: '25%', key: 'cpu_time' },
    { label: 'Instructions Retired', width: '25%', key: 'instructions_retired' },
    { label: 'Cpi', width: '25%', key: 'DataSize' }
  ];

  public hpcSummaryParallelRegions: Array<TiTableColumns> = [
    { label: 'Index Name', width: '25%', key: 'index_name' },
    { label: 'Potential Gain', width: '25%', key: 'potential_gain' },
    { label: 'Elapsed Time', width: '25%', key: 'elapsed_time' },
    { label: 'Imbalance Time', width: '25%', key: 'imbalance_time' },
    { label: 'Imbalance Time Ratio', width: '25%', key: 'imbalance_time_ratio' },
  ];


  public rankColList: any = [
    'rank',
    'elapsedTime',
    'Overall',
    'Comunicate',
    'P2P',
    'Collective',
    'Syn',
    'Single',
    'IO',
    'Colllect',
    'DataSize'];
  public sendtypeList: any = [
    'sendData',
    'Overall',
    'Comunicate',
    'P2P',
    'Collective',
    'Syn',
    'Single',
    'IO',
    'Colllect',
    'DataSize'];
  public recvtypeList: any = [
    'recvData',
    'Overall',
    'Comunicate',
    'P2P',
    'Collective',
    'Syn',
    'Single',
    'IO',
    'Colllect',
    'DataSize'];
  public funColList: any = ['Function', 'Overall', 'Call', 'DataSize'];

  public mpiWaitCommunicatorList: any = [
    'communicator',
    'overall_wait_rate',
    'communication',
    'p2p_communication',
    'collective_communication',
    'synchronization',
    'io',
    'single_io',
    'collective_io',
    'data_size',
    'ranks'
  ];

  public hpcSummaryHostpotsList: any = [
    'index_name',
    'cpu_time',
    'instructions_retired',
    'DataSize'
  ];
  public hpcSummaryParallelRegionsList: any = [
    'index_name',
    'potential_gain',
    'elapsed_time',
    'imbalance_time',
    'imbalance_time_ratio'
  ];

  public mpiCols: any = {
    rank: this.rankCol,
    function: this.funCol,
    'send-type': this.sendtypeCol,
    'recv-type': this.recvtypeCol,
    'mpi-comm': this.mpiWaitCommunicator,
    hpcSummaryHostpots: this.hpcSummaryHostpots,
    hpcSummaryParallelRegions: this.hpcSummaryParallelRegions
  };
  public mpiColList: any = {
    rank: this.rankColList,
    function: this.funColList,
    'send-type': this.sendtypeList,
    'recv-type': this.recvtypeList,
    'mpi-comm': this.mpiWaitCommunicatorList,
    hpcSummaryHostpots: this.hpcSummaryHostpotsList,
    hpcSummaryParallelRegions: this.hpcSummaryParallelRegionsList
  };
  public mpiFunTable: any = {
    rank: this.setMpiWaitRank,
    function: this.setMpiWaitFunction,
    'send-type': this.setMpiWaitSendType,
    'recv-type': this.setMpiWaitRecvType,
    'mpi-comm': this.setMpiWaitCommunicator,
    hpcSummaryHostpots: this.setHpcSummaryHostpots,
    hpcSummaryParallelRegions: this.sethpcSummaryParallelRegions
  };
  public setMpiWaitRank(data: any[]) {
    const rank = data[0];
    const elapsedTime = data[1];
    const Overall = data[2];
    const Comunicate = data[3];
    const P2P = data[4];
    const Collective = data[5];
    const Syn = data[6];
    const Single = data[7];
    const IO = data[8];
    const Colllect = data[9];
    const DataSize = data[10];
    return { rank, elapsedTime, Overall, Comunicate, P2P, Collective, Syn, Single, IO, Colllect, DataSize };
  }
  public setMpiWaitSendType(data: any[]) {
    const sendData = data[0];
    const Overall = data[1];
    const Comunicate = data[2];
    const P2P = data[3];
    const Collective = data[4];
    const Syn = data[5];
    const Single = data[6];
    const IO = data[7];
    const Colllect = data[8];
    const DataSize = data[9];
    return { sendData, Overall, Comunicate, P2P, Collective, Syn, Single, IO, Colllect, DataSize };
  }
  public setMpiWaitRecvType(data: any[]) {
    const recvData = data[0];
    const Overall = data[1];
    const Comunicate = data[2];
    const P2P = data[3];
    const Collective = data[4];
    const Syn = data[5];
    const Single = data[6];
    const IO = data[7];
    const Colllect = data[8];
    const DataSize = data[9];
    return { recvData, Overall, Comunicate, P2P, Collective, Syn, Single, IO, Colllect, DataSize };
  }
  public setMpiWaitFunction(data: any[]) {
    const Function = data[0];
    const Overall = data[1];
    const Call = data[2];
    const DataSize = data[3];
    return { Function, Overall, Call, DataSize };
  }

  public setMpiWaitCommunicator(data: any[]) {
    const communicator = data[0];
    // tslint:disable-next-line:variable-name
    const overall_wait_rate = data[1];
    const communication = data[2];
    // tslint:disable-next-line:variable-name
    const p2p_communication = data[3];
    // tslint:disable-next-line:variable-name
    const collective_communication = data[4];
    const synchronization = data[5];
    const io = data[6];
    // tslint:disable-next-line:variable-name
    const single_io = data[7];
    // tslint:disable-next-line:variable-name
    const collective_io = data[8];
    // tslint:disable-next-line:variable-name
    const data_size = data[9];
    const ranks = data[10];
    return {
      communicator,
      overall_wait_rate,
      communication,
      p2p_communication,
      collective_communication,
      synchronization,
      io,
      single_io,
      collective_io,
      data_size,
      ranks
    };
  }

  public setHpcSummaryHostpots(data: any[]) {
    // tslint:disable-next-line:variable-name
    const index_name = data[0];
    // tslint:disable-next-line:variable-name
    const cpu_time = data[1];
    // tslint:disable-next-line:variable-name
    const instructions_retired = data[2];
    const DataSize = data[3];
    return {
      index_name,
      cpu_time,
      instructions_retired,
      DataSize
    };
  }

  public sethpcSummaryParallelRegions(data: any[]) {
    // tslint:disable-next-line:variable-name
    const index_name = data[0];
    // tslint:disable-next-line:variable-name
    const potential_gain = data[1];
    // tslint:disable-next-line:variable-name
    const elapsed_time = data[2];
    // tslint:disable-next-line:variable-name
    const imbalance_time = data[3];
    // tslint:disable-next-line:variable-name
    const imbalance_time_ratio = data[4];
    return {
      index_name,
      potential_gain,
      elapsed_time,
      imbalance_time,
      imbalance_time_ratio
    };
  }

  public setGenData(data: any, type: any) {
    const resultSet = this.mpiFunTable[type](data);
    return resultSet;
  }



}
