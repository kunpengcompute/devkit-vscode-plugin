/**
 * 内存子系统概览的信息
 */
export class MemOverviewInfo {
    public state: '1' | '0'; // 状态：1———有；0———无
    public dimmNum: number; // 内存条数量，如：16
    public maxCapacity: number; // 内存总大小，如：254
    public nullNum: number; // 空槽数量，如：16

    constructor(state: '1' | '0', dimmNum: number = 0, maxCapacity: number = 0, nullNum: number = 0) {
        this.state = state;
        this.dimmNum = dimmNum;
        this.maxCapacity = maxCapacity;
        this.nullNum = nullNum;
    }
}

/**
 * 单个内存条的信息
 */
export class MemDimmInfo {
    public pieceState: '11' | '10' | '00'; // 状态：11————既有插槽又有内存条；10————只有插槽；00————没有插槽和内存条
    public pos: string; // 内存条的位置，如："SOCKET 0 CHANNEL 0 DIMM 0"
    public cap: string; // 内存条容量，如："16384 MB", "No Module Installed"
    public cfgSpeed: string; // 配置速度，如： "2933 MT/s", "Unknown"
    public maxSpeed: string; // 最大速度，如： "2933 MT/s", "Unknown"
    public type: string; // 类型

    constructor(pieceState: '11' | '10' | '00', pos: string = '',
                cap: string = '', cfgSpeed: string = '', maxSpeed: string = '', type = '--') {
        this.pieceState = pieceState;
        this.pos = pos;
        this.cap = cap;
        this.cfgSpeed = cfgSpeed;
        this.maxSpeed = maxSpeed;
        this.type = type;
    }
}

/**
 * cpu的概览的信息
 */
export class CpuInfo {
    public state: '1' | '0'; // 状态：1———有；0———无
    public cpuType: string; // cpu类型，如："Kunpeng 920-6426"
    public cpuCores: string; // core数量，如："64"

    constructor(state: '1' | '0', cpuType: string = '', cpuCores: string = '') {
        this.state = state;
        this.cpuType = cpuType;
        this.cpuCores = cpuCores;
    }
}
/**
 * cpu的详细的信息
 */
export class CpuDetailInfo extends CpuInfo {
    public currentFreq: string; // 当前频率，如："2600 MHz"
    public maxFreq: string; // 最大频率， 如："2600 MHz"
    public slotNum: string; // 插槽数量

    constructor(state: '1' | '0', cpuType: string = '', cpuCores: string = '', currentFreq: string = '',
                maxFreq: string = '', slotNum: string = '--') {
        super(state, cpuType, cpuCores);
        this.currentFreq = currentFreq;
        this.maxFreq = maxFreq;
        this.slotNum = slotNum;
    }
}

/**
 * 存储子系统概览的信息
 */
export class StorageOverViewInfo {
    public state: '1' | '0'; // 状态：1———有；0———无
    public totalSize: number; // 存储总大小，如：447.1
    public diskOverview: { type: string, size: number, num: number }[]; // 磁盘概览

    constructor(state: '1' | '0', totalSize: number = 0, diskOverview: any= []) {
        this.state = state;
        this.totalSize = totalSize;
        this.diskOverview = diskOverview;
    }
}

/**
 * 单个存储块的信息
 */
export class StoragePieceInfo {
    public state: '1' | '0'; // 状态：1————有；0————无
    public name: string; // 磁盘ID，如："/dev/sda"
    public type: string; // 磁盘类型，如： "SSD"
    public cap: string; // 磁盘容量，如："447.1G"
    public model: string; // 磁盘型号， 如："SAMSUNG"
    public avgquSz: number;
    public await: number;
    public svctm: number;
    public util: number;

    constructor(state: '1' | '0', name: string = '', type: string = '', cap: string = '', model: string = '',
                avgquSz = 0 , avait = 0 , svctm = 0 , util = 0 ) {
        this.state = state;
        this.name = name;
        this.type = type;
        this.cap = cap;
        this.model = model;
        this.avgquSz = avgquSz;
        this.await = avait;
        this.svctm = svctm;
        this.util = util;
    }
}

/**
 * 存储子系统概览的信息
 */
export class NetOverViewInfo {
    public state: '1' | '0'; // 状态：1———有；0———无
    public partNum: number; // 网口数量
    public cardNum: number; // 网卡数量

    constructor(state: '1' | '0', partNum: number = 0, cardNum: number = 0) {
        this.state = state;
        this.partNum = partNum;
        this.cardNum = cardNum;
    }
}
