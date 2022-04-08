import { PanoramaAnalysisComponent } from './panorama-analysis.component';
import { PanoramaAnalysisSvgElementInfo } from '../../classes/panorama-analysis-svg-element-info';
import { HyTheme } from 'hyper';

/**
 * 单个cpu的信息
 */
export class CpuPieceInfo {
    public state: '1' | '0'; // 状态：1———有；0———无
    public cpuType: string; // cpu类型，如："Kunpeng 920-6426"
    public cpuCores: string; // core数量，如："64"
    public currentFreq: string; // 当前频率，如："2600 MHz"
    public maxFreq: string; // 最大频率， 如："2600 MHz"
    public slotNum: string; // 插槽数量

    constructor(
        state: '1' | '0',
        cpuType: string = '',
        cpuCores: string = '',
        currentFreq: string = '',
        maxFreq: string = '',
        slotNum: string = '--'
    ) {
        this.state = state;
        this.cpuType = cpuType;
        this.cpuCores = cpuCores;
        this.currentFreq = currentFreq;
        this.maxFreq = maxFreq;
        this.slotNum = slotNum;
    }
}

/**
 * 内存子系统的信息
 */
export class MemoryInfo {
    public state: '1' | '0'; // 状态：1———有；0———无
    public dimmNum: number; // 内存条数量，如：16
    public maxCapacity: string; // 内存总大小，如：254
    public nullNum: number; // 空槽数量，如：16

    constructor(state: '1' | '0', dimmNum: number = 0, maxCapacity: string = '0', nullNum: number = 0) {
        this.state = state;
        this.dimmNum = dimmNum;
        this.maxCapacity = maxCapacity;
        this.nullNum = nullNum;
    }
}

/**
 * 单个存储子系统的信息
 */
export class StoragePieceInfo {
    public state: '1' | '0'; // 状态：1———有；0———无
    public totalSize: number; // 存储总大小，如：447.1
    public diskOverview: { type: string, size: number, num: number }[]; // 磁盘概览

    constructor(state: '1' | '0', totalSize: number = 0, diskOverview = []) {
        this.state = state;
        this.totalSize = totalSize;
        this.diskOverview = diskOverview;
    }
}

/**
 * 单个网络子系统的信息
 */
export class NetPieceInfo {
    public state: '1' | '0'; // 状态：1———有；0———无
    public partNum: number; // 网口数量
    public cardNum: number; // 网卡数量

    constructor(state: '1' | '0', partNum: number = 0, cardNum: number = 0) {
        this.state = state;
        this.partNum = partNum;
        this.cardNum = cardNum;
    }
}

/**
 * 单个内存条的信息
 */
export class MemPieceInfo {
    public pieceState: '11' | '10' | '00'; // 状态：11————既有插槽又有内存条；10————只有插槽；00————没有插槽和内存条
    public pos: string; // 内存条的位置，如："SOCKET 0 CHANNEL 0 DIMM 0"
    public cap: string; // 内存条容量，如："16384 MB", "No Module Installed"
    public cfgSpeed: string; // 配置速度，如： "2933 MT/s", "Unknown"
    public maxSpeed: string; // 最大速度，如： "2933 MT/s", "Unknown"
    public type: string; // 类型

    constructor(
        pieceState: '11' | '10' | '00',
        pos: string = '',
        cap: string = '',
        cfgSpeed: string = '',
        maxSpeed: string = '',
        type = '--'
    ) {
        this.pieceState = pieceState;
        this.pos = pos;
        this.cap = cap;
        this.cfgSpeed = cfgSpeed;
        this.maxSpeed = maxSpeed;
        this.type = type;
    }
}

export class TooltipManager {
    public ctx: PanoramaAnalysisComponent;
    constructor(ctx: PanoramaAnalysisComponent) {
        this.ctx = ctx;
    }

    /**
     * 展示
     * @param elementInfo 数据
     */
    public show(elementInfo: PanoramaAnalysisSvgElementInfo, theme: HyTheme) {
        const selection = elementInfo.selection;
        if (selection.length === 0) {
            return;
        }

        // 计算 tooltip 提示的位置
        const clientRect = selection.get(0).getBoundingClientRect();
        const warpperRect = this.ctx.el.nativeElement.getBoundingClientRect();
        const top = clientRect.top - warpperRect.top;
        const left = clientRect.left - warpperRect.left;

        // 计算 tooltip 提示的内容
        const currentPieceInfo = this.ctx.panoramaPieceInfoMap.get(elementInfo);
        let html = '';
        switch (true) {
            case currentPieceInfo instanceof CpuPieceInfo:
                html = this.formatCpuTipHtml(currentPieceInfo, theme);
                break;
            case currentPieceInfo instanceof MemoryInfo:
                html = this.formatMemoryTipHtml(currentPieceInfo, theme);
                break;
            case currentPieceInfo instanceof StoragePieceInfo:
                html = this.formatStorageTipHtml(currentPieceInfo, theme);
                break;
            case currentPieceInfo instanceof NetPieceInfo:
                html = this.formatNetTipHtml(currentPieceInfo, theme);
                break;
            default:
        }

        // 计算 tooltip 提示的位置 和 内容
        this.ctx.niceTooltipInfo = {
            top: {
                pointX: left + clientRect.width / 2,
                pointY: top
            },
            bottom: {
                pointX: left + clientRect.width / 2,
                pointY: top + clientRect.height
            },
            html
        };
        this.ctx.niceTooltipShow = true;
    }

    /**
     * 隐藏
     */
    public hidden() {
        this.ctx.niceTooltipShow = false;
    }

    private formatCpuTipHtml(cpuInfo: CpuPieceInfo, theme: HyTheme): string {
        return `
    <style>
        .cpu-tip-container {
            color: ${HyTheme.Dark === theme ? '#AAAAAA' : '#616161'};
        }

        .cpu-tip-title {
            margin-bottom: 1.3vw;
            font-size: 1.4vw;
            color: ${HyTheme.Dark === theme ? '#E8E8E8' : '#222222'};
        }

        .cpu-tip-content-center {
            display: grid;
            grid-template-columns: 1fr 2px 1fr;
            justify-items: center;
            grid-column-gap: 3px;
            min-height: 10vh;
            font-size: 1vw;
        }

        .cpu-tip-content-center .item {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            text-align: center;
            font-size: 14px;
        }

        .cpu-tip-content-center .item .item-value {
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 18px;
            color: ${HyTheme.Dark === theme ? '#E8E8E8' : '#222222'};
        }


        .cpu-tip-content-bottom {
            display: grid;
            grid-template-columns: 1fr 1.2fr 1fr 1.2fr;
            margin-top: 1.3vw;
            font-size: 14px;
        }

        .cpu-tip-content-bottom span {
            color: ${HyTheme.Dark === theme ? '#AAAAAA' : '#616161'};
        }

        .upright-slash {
            border: 1px solid ${HyTheme.Dark === theme ? '#353535' : '#dee2e9'};
            height: 70%;
            align-self: center;
        }
    </style>
    <div class="cpu-tip-container">
        <div class="cpu-tip-title">CPU Package</div>
        <div class="cpu-tip-content-center">
            <div class="item">
                <div class="item-value"><span>${cpuInfo.cpuType}</span></div>
                <div>${this.ctx.i18n.sys_summary.panorama.tip.cpu_type}</div>
            </div>
            <div class="upright-slash">
            </div>
            <div class="item">
                <div class="item-value"><span>${cpuInfo.cpuCores}</span>${this.ctx.i18n.sys_summary.unit.entry}</div>
                <div>${this.ctx.i18n.sys_summary.panorama.tip.core_num}</div>
            </div>
        </div>
        <div class="cpu-tip-content-bottom">
            <div>${this.ctx.i18n.sys_summary.panorama.tip.max_freq}</div>
            <div><span>${cpuInfo.maxFreq}</span></div>
            <div>${this.ctx.i18n.sys_summary.panorama.tip.current_frqu}</div>
            <div><span>${cpuInfo.currentFreq}</span></div>
        </div>
    </div>
    `;
    }

    private formatMemoryTipHtml(memoryInfo: MemoryInfo, theme: HyTheme): string {
        return `
    <style>
        .memory-tip-container {
            color: ${HyTheme.Dark === theme ? '#AAAAAA' : '#616161'};
        }

        .memory-tip-title {
            margin-bottom: 26px;
            font-size: 18px;
            color: ${HyTheme.Dark === theme ? '#E8E8E8' : '#222222'};
        }

        .memory-tip-content-center {
            display: grid;
            grid-template-columns: 1fr 2px 1fr 2px 1fr;
            justify-items: center;
            grid-column-gap: 3px;
            min-height: 50px;
            font-size: 14px;
            margin-bottom: 12px;
        }

        .memory-tip-content-center .item {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            text-align: center;
            font-size: 14px;
        }

        .memory-tip-content-center .item span {
            font-size: 18px;
            color: ${HyTheme.Dark === theme ? '#E8E8E8' : '#222222'};
        }

        .upright-slash {
            border: 1px solid #353535;
            height: 70%;
            align-self: center;
        }
    </style>
    <div class="memory-tip-container">
        <div class="memory-tip-title">${this.ctx.i18n.sys_summary.mem_subsystem_text}</div>
        <div class="memory-tip-content-center">
            <div class="item">
                <div><span>${memoryInfo.maxCapacity}</span>GB</div>
                <div>${this.ctx.i18n.sys_summary.panorama.tip.total_size}</div>
            </div>
            <div class="upright-slash">
            </div>
            <div class="item">
                <div><span>${memoryInfo.dimmNum}</span>${this.ctx.i18n.sys_summary.unit.entry}</div>
                <div>${this.ctx.i18n.sys_summary.panorama.tip.dimm_num}</div>
            </div>
            <div class="upright-slash">
            </div>
            <div class="item">
                <div><span>${memoryInfo.nullNum}</span>${this.ctx.i18n.sys_summary.unit.entry}</div>
                <div>${this.ctx.i18n.sys_summary.panorama.tip.null_num}</div>
            </div>
        </div>
    </div>
    `;

    }
    private formatStorageTipHtml(storageInfo: StoragePieceInfo, theme: HyTheme): string {
        let overview = '';
        for (const item of storageInfo.diskOverview) {
            overview += `<span>${item.type}*${item.num}&nbsp;${item.size}GB</span>`;
        }

        return `
    <style>
        .storage-tip-container {
            color: ${HyTheme.Dark === theme ? '#AAAAAA' : '#616161'};
        }

        .storage-tip-title {
            font-size: 18px;
            color: ${HyTheme.Dark === theme ? '#E8E8E8' : '#222222'};
        }

        .storage-tip-content-center {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            text-align: center;
            font-size: 14px;
            min-height: 50px;
            margin: 24px 0;
        }

        .storage-tip-content-center span {
            font-size: 18px;
            color: ${HyTheme.Dark === theme ? '#E8E8E8' : '#222222'};
        }


        .storage-tip-content-bottom {
            display: grid;
            grid-template-columns: auto 1fr;
            column-gap: 10px;
            font-size: 14px;
            margin-bottom: 16px;
        }

        .storage-tip-content-bottom span {
            font-size: 14px;
            color: ${HyTheme.Dark === theme ? '#AAAAAA' : '#616161'};
        }
    </style>
    <div class="storage-tip-container">
        <div class="storage-tip-title">${this.ctx.i18n.sys_summary.storage_subsystem_text}</div>
        <div class="storage-tip-content-center">
            <div><span>${storageInfo.totalSize}</span>GB</div>
            <div>${this.ctx.i18n.sys_summary.panorama.tip.total_cap}</div>
        </div>
        <div class="storage-tip-content-bottom">
            <div>${this.ctx.i18n.sys_summary.panorama.tip.disk_overview}</div>
            <div>
              ${overview}
            </div>
        </div>
    </div>
    `;
    }

    private formatNetTipHtml(netInfo: NetPieceInfo, theme: HyTheme): string {
        return `
    <style>
        .net-tip-container {
            color: ${HyTheme.Dark === theme ? '#AAAAAA' : '#616161'};
        }

        .net-tip-title {
            font-size: 18px;
            color: ${HyTheme.Dark === theme ? '#E8E8E8' : '#222222'};
        }

        .net-tip-content {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            text-align: center;
            font-size: 14px;
            min-height: 6.5vh;
            margin: 1.8vw 0 0.9vw 0;
        }

        .net-tip-content span {
            font-size: 18px;
            color: ${HyTheme.Dark === theme ? '#E8E8E8' : '#222222'};
        }
    </style>
    <div class="net-tip-container">
        <div class="net-tip-title">${this.ctx.i18n.sys_summary.net_subsystem_text}</div>
        <div class="net-tip-content">
            <div><span>${netInfo.partNum}</span>${this.ctx.i18n.sys_summary.unit.entry}</div>
            <div>${this.ctx.i18n.sys_summary.panorama.tip.net_port_num}</div>
        </div>
    </div>
    `;
    }
}

