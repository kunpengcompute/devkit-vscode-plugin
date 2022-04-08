import { StorageSubsystemSvgElementInfo } from '../../classes/storage-subsystem-svg-element-info';
import { StorageSubsystemComponent } from './storage-subsystem.component';

export class TooltipManager {
    public ctx: StorageSubsystemComponent;
    constructor(ctx: StorageSubsystemComponent) {
        this.ctx = ctx;
    }
    /**
     * 展示
     * @param elementInfo 数据
     */
    public show(elementInfo: StorageSubsystemSvgElementInfo) {
        const selection = elementInfo.selection;
        if (selection.length === 0) {
            return;
        }

        // 计算 tooltip 的位置
        const clientRect = selection.get(0).getBoundingClientRect();
        const warpperRect = this.ctx.el.nativeElement.getBoundingClientRect();
        const top = clientRect.top - warpperRect.top;
        const left = clientRect.left - warpperRect.left;

        // 计算 tooltip 的内容
        const pieceInfo: PieceInfo = this.ctx.storagePieceInfoMap.get(elementInfo);
        const html = `
        <p style="margin-bottom:15px;font-size:18px;color:${this.ctx.currentTheme.title}">
        ${this.ctx.i18n.sys_summary.storage_subsystem.tip.hard_disk}</p>
        <div style='display:flex;flex-direction:column;flex-wrap:wrap;font-size:14px;
        color:${this.ctx.currentTheme.subTitle};justify-content: space-between'>
                    <div style="display:flex;justify-content: space-between;margin-bottom:14px;">
                        <div style="flex:1;display:flex;">
                            <span style="width:40px;margin-right:10px;overflow: hidden">ID</span>
                            <span style="width:107px;color:${
                                this.ctx.currentTheme.content};overflow: hidden">${pieceInfo.name}</span>
                        </div>
                        <div style="flex:1;display:flex">
                            <span style="width:62px;margin-right:10px;overflow: hidden">
                            ${this.ctx.i18n.sys_summary.storage_subsystem.tip.disk_type}</span>
                            <span style="width:85px;color:${
                                this.ctx.currentTheme.content};overflow: hidden">${pieceInfo.type}</span>
                        </div>
                    </div>
                    <div style="display:flex;justify-content: space-between">
                        <div style="flex:1;display:flex">
                            <span style="width:40px;margin-right:10px;overflow: hidden">
                            ${this.ctx.i18n.sys_summary.storage_subsystem.tip.disk_model}</span>
                            <span style="width:107px;color:${
                                this.ctx.currentTheme.content};overflow: hidden">${pieceInfo.model}</span>
                        </div>
                        <div style="flex:1;display:flex">
                            <span style="width:62px;margin-right:10px;overflow: hidden">
                            ${this.ctx.i18n.sys_summary.storage_subsystem.tip.disk_size}</span>
                            <span style="width:85px;color:${
                                this.ctx.currentTheme.content};overflow: hidden">${pieceInfo.cap}</span>
                        </div>
                    </div>
                    <div style="display:flex;height:2px;background-color:${
                        this.ctx.currentTheme.border};margin:12px auto;width:100%"></div>
                    <div style="display:flex;justify-content: space-between;margin-bottom:14px;">
                        <div style="flex:1;display:flex">
                            <span style="width:40px;margin-right:10px;overflow: hidden">%util</span>
                            <span style="width:107px;color:${
                                this.ctx.currentTheme.content};overflow: hidden">${pieceInfo.util}</span>
                        </div>
                        <div style="flex:1;display:flex">
                            <span style="width:62px;margin-right:10px;overflow: hidden">avgqu_sz</span>
                            <span style="width:85px;color:${
                                this.ctx.currentTheme.content};overflow: hidden">${pieceInfo.avg}</span>
                        </div>
                    </div>
                    <div style="display:flex;justify-content: space-between">
                        <div style="flex:1;display:flex">
                            <span style="width:40px;margin-right:10px;overflow: hidden">await</span>
                            <span style="width:107px;color:${
                                this.ctx.currentTheme.content};overflow: hidden">${pieceInfo.awaits}</span>
                        </div>
                        <div style="flex:1;display:flex">
                            <span style="width:62px;margin-right:10px;overflow: hidden">svctm</span>
                            <span style="width:85px;color:${
                                this.ctx.currentTheme.content};overflow: hidden">${pieceInfo.svctm}</span>
                        </div>
                    </div>
                </div>
    `;

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
}

/**
 * 单个磁盘信息
 */
export class PieceInfo {
    public state: '1' | '0'; // 状态：1————有；0————无
    public name: string; // 磁盘ID，如："/dev/sda"
    public type: string; // 磁盘类型，如： "SSD"
    public cap: string; // 磁盘容量，如："447.1G"
    public model: string; // 磁盘型号， 如："SAMSUNG"
    public util: number;
    public avg: number;
    public awaits: number;
    public svctm: number;

    constructor(
        state: '1' | '0', name: string = '', type: string = '', cap: string = '', model: string = '',
        util: number = 0, avg: number = 0, awaits: number = 0, svctm: number = 0) {
        this.state = state;
        this.name = name;
        this.type = type;
        this.cap = cap;
        this.model = model;
        this.util = util;
        this.avg = avg;
        this.awaits = awaits;
        this.svctm = svctm;

    }
}
