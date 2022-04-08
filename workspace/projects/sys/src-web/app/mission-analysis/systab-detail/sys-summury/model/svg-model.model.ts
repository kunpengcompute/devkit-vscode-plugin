import { ElementRef } from '@angular/core';

export class SvgElementInfo {
    public static RADOM_ID_LEN = 20; // 随机数的长度
    public selection: JQuery; // 目标选择器
    public id: string;
    public outSelection: JQuery; // 轮廓选择器
    public outId: string;

    constructor() {
        this.id = this.generateConversationId(SvgElementInfo.RADOM_ID_LEN);
        this.outId = this.generateConversationId(SvgElementInfo.RADOM_ID_LEN);
    }

    protected generateConversationId(len: any) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
        const uuid = [];
        let i;
        const radix = chars.length;
        if (len) {
            for (i = 0; i < len; i++) {
              uuid[i] = chars[Math.floor(Math.random() * radix)];
            }
        } else {
            uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
            uuid[14] = '4';
            let r;
            for (i = 0; i < 36; i++) {
              if (!uuid[i]) {
                r = Math.floor(Math.random() * 16);
                uuid[i] = chars[i === 19 ? Math.floor(Math.random() * 4) + 8 : r];
              }
            }
        }
        return uuid.join('');
    }

    public initSelectionById(el: ElementRef) {
        this.selection = $(el.nativeElement.querySelector('#' + this.id));
        this.outSelection = $(el.nativeElement.querySelector('#' + this.outId));
    }
}

export class MemorySubsystemSvgElementInfo extends SvgElementInfo {
    public slotSelection: JQuery; // 插槽选择器
    public slotId: string;

    constructor(
    ) {
        super();
        this.slotId = this.generateConversationId(SvgElementInfo.RADOM_ID_LEN);
    }

    public initSelectionById(el: ElementRef) {
        super.initSelectionById(el);
        this.slotSelection = $(el.nativeElement.querySelector('#' + this.slotId));
    }
}

export class PanoramaAnalysisSvgElementInfo extends SvgElementInfo {
    public fenceSelection: JQuery; // “围栏”选择器
    public fenceId: string;
    public textSelection: JQuery; // 文字（描述）选择器
    public textId: string;
    public pcieSelection: JQuery; // 总线（连线）选择器
    public pcieId: string;

    constructor() {
        super();
        this.fenceId = super.generateConversationId(SvgElementInfo.RADOM_ID_LEN);
        this.textId = super.generateConversationId(SvgElementInfo.RADOM_ID_LEN);
        this.pcieId = super.generateConversationId(SvgElementInfo.RADOM_ID_LEN);
    }

    public initSelectionById(el: ElementRef) {
        super.initSelectionById(el);
        this.fenceSelection = $(el.nativeElement.querySelector('#' + this.fenceId));
        this.textSelection = $(el.nativeElement.querySelector('#' + this.textId));
        this.pcieSelection = $(el.nativeElement.querySelector('#' + this.pcieId));
    }
}

export class StorageSubsystemSvgElementInfo extends SvgElementInfo {
    public textSelection: JQuery;
    public textId: string; // 文字（描述）选择器

    constructor() {
        super();
        this.textId = super.generateConversationId(SvgElementInfo.RADOM_ID_LEN);
    }

    public initSelectionById(el: ElementRef) {
        super.initSelectionById(el);
        this.textSelection = $(el.nativeElement.querySelector('#' + this.textId));
    }
}

