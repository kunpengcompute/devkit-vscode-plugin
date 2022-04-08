import { ElementRef } from '@angular/core';
import { TraceDetailComponent } from './trace-detail.component';
import * as Utils from 'projects/sys/src-com/app/util';
export class TooltipManager {
    public ctx: TraceDetailComponent;
    constructor(ctx: TraceDetailComponent) {
        this.ctx = ctx;
    }
    /**
     * 展示
     * @param elementInfo element
     * @param name 阶段名称
     * @param data 当前阶段所有数据
     * @param select 请求时延/数据时延
     * @param annotation 描述
     */
    public show(elementInfo: any, name: any, data: any, select: any, annotation: any) {
        const selection = elementInfo.selection;
        if (selection.length === 0) {
            return;
        }
        // 计算 tooltip 的位置
        const clientRect = selection.get(0).getBoundingClientRect();
        const warpperRect = this.ctx.el.nativeElement.getBoundingClientRect();
        const top = clientRect.top - warpperRect.top;
        const left = clientRect.left - warpperRect.left;
        const mainTextColor = this.ctx.currentTheme === 'light' ? '#222222' : '#e8e8e8';
        const subTextColor = this.ctx.currentTheme === 'light' ? '#616161' : '#aaaaaa';
        const html = `<div style="width: 272px;font-size:12px;color:${subTextColor}">
        <div style="margin-bottom:4px;color:${mainTextColor}">${name}</div>
        <div style="margin-bottom:10px">${this.ctx.language === 'en' ? annotation.en : annotation.zh}</div>
        <div style="display:flex;align-items:top">
          <div style="margin-right:12px;">
            <div>${this.ctx.i18n.storageIO.summury.delay_percent}</div>
            <div>${this.ctx.i18n.storageIO.summury.avg_delay}</div>
            <div>${this.ctx.i18n.storageIO.summury.max_delay}</div>
            <div>${this.ctx.i18n.storageIO.summury.min_delay}</div>
            <div>
            ${select ? this.ctx.i18n.storageIO.summury.data_volumn : this.ctx.i18n.storageIO.summury.rq_count}
            </div>
          </div>
          <div style="color:${mainTextColor}">
            <div>${data.percent}</div>
            <div>${select ? data.kb_avg : data.rq_avg}</div>
            <div>${select ? data.kb_max : data.rq_max}</div>
            <div>${select ? data.kb_min : data.rq_min}</div>
            <div>${select ? data.kb_n : data.rq_n}</div>
          </div>
        </div>
        </div>`;
        this.ctx.niceTooltipInfo = {
            top: {
                pointX: left + clientRect.width / 2,
                pointY: top
            },
            bottom: {
                pointX: left + clientRect.width / 2,
                pointY: top + clientRect.height
            },
            html,
            context: '',
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

export class SvgElementInfo {
    // 随机数的长度
    public static RADOM_ID_LEN = 20;
    // 目标选择器
    public selection: JQuery;
    public id: string;

    constructor() {
        this.id = Utils.generateConversationId(SvgElementInfo.RADOM_ID_LEN);
    }

    /**
     * 通过ID选择
     * @param el 数据
     */
    public initSelectionById(el: ElementRef) {
        this.selection = $(el.nativeElement.querySelector('#' + this.id));
    }
}
