import { CpuPackageNumaComponent } from './cpu-package-numa.component';

export class TooltipShowManager {
    public ctx: CpuPackageNumaComponent;
    public tooltipTimer: any;

    constructor(ctx: CpuPackageNumaComponent) {
        this.ctx = ctx;
    }

    /**
     * 展示提示框
     * @param selection 选择器
     * @param a 索引
     * @param i 索引
     * @param tipsArr 提示信息
     */
    public show(selection: JQuery, a, i, tipsArr) {
        if (selection.length === 0) {
            return;
        }
        let html = '';
        const firstCpuIndex = 1;
        const fourCpuIndex = 4;
        const lastCpuIndex = 5;
        if (i !== lastCpuIndex) {
            html = `<p style="margin-bottom:15px;font-size:18px;color:${this.ctx.currentTheme.title}">CPU Core</p>`;
            tipsArr.forEach((element: any) => {
                html += `
                <div style='display:flex;height:36px;line-height:16px;font-size:14px;color:${
                    this.ctx.currentTheme.subTitle};
                justify-content: space-between'>
                  <div style="flex:1;display:flex">
                  <span style="width:70px;">${element.title1}</span>
                   <span style="width:77px; color:${this.ctx.currentTheme.content};">${element.data1}</span>
                  </div>
                  <div style="flex:1;display:flex">
                  <span style="width:70px;">${element.title2}</span>
                  <span style="width:77px;color:${this.ctx.currentTheme.content};">${element.data2}</span>
                  </div>
                </div>
            `;
            });
        } else {
            html = `<p style="margin-bottom:15px;font-size:18px;color:${this.ctx.currentTheme.title}">L3 cache</p>`;
            tipsArr.forEach(element => {
                html += `
                <div style='display:flex;height:36px;line-height:36px;font-size:14px;color:${
                    this.ctx.currentTheme.subTitle};
                justify-content: space-between'>
		   <div style="flex:1;margin-right:24px;display:flex">
                   <span style="width:170px;margin-right:10px;">${element.title}</span>
                   <span style="width:90px;color:${this.ctx.currentTheme.content};">${element.data}</span>
		   </div>
                   <div style="flex:1;display:flex">
		   </div>
                </div>
            `;
            });
        }
        let proportion = 0.5;
        let proportionBottom = 0.5;
        if (a === firstCpuIndex && i !== lastCpuIndex) {
            proportion = 0.647;
            proportionBottom = 0.351;
        } else if (a === fourCpuIndex && i !== lastCpuIndex) {
            proportion = 0.351;
            proportionBottom = 0.647;
        }
        const warpperSelection = $(this.ctx.el.nativeElement); // TODO
        const boxTop = warpperSelection.offset().top + 5;
        const boxLeft = warpperSelection.offset().left;
        const positionData = selection.get(0).getBoundingClientRect();
        const width = positionData.width * proportion;
        const widthBottom = positionData.width * proportionBottom;
        this.ctx.niceTooltipInfo = {
            top: {
                pointX: positionData.left + width - boxLeft,
                pointY: positionData.top - boxTop
            },
            bottom: {
                pointX: positionData.left + widthBottom - boxLeft,
                pointY: positionData.top - boxTop + positionData.height + 5
            },
            html,
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
