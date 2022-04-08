import { NetworkSubsystemChartComponent } from './network-subsystem-chart.component';

export class TooltipShowManager {
    public tooltipTimer: any;
    public ctx: NetworkSubsystemChartComponent;

    constructor(ctx: NetworkSubsystemChartComponent) {
        this.ctx = ctx;
    }

    /**
     * 展示Tips
     * @param selection 选择器
     * @param i 索引
     * @param j 索引
     * @param tipsArr 提示信息
     */
    public show(selection: JQuery, i, j, tipsArr, i18n) {
        clearTimeout(this.tooltipTimer);
        if (selection.length === 0) {
            return;
        }
        let html = '';
        if (j === 1) {
            // 网卡
            html = `<p style="margin-bottom:15px;font-size:18px;color:${
                this.ctx.currentTheme.title}">${i18n.sys_cof.sum.network}</p>`;
            tipsArr.forEach(element => {
                html += `
            <div style='display:flex;min-height:22px;line-height:22px;font-size:14px;
            color:${this.ctx.currentTheme.subTitle};margin-top:5px'>
                <div style="flex:1;display:flex">
                <span style="min-width:130px;margin-right:10px;">${element.title}</span>
                <span style="color:${this.ctx.currentTheme.content};">${element.data}</span>
                </div>
            </div>
    `;
            });
        } else {
            // 网口
            html = `<p style="margin-bottom:15px;font-size:18px;color:${this.ctx.currentTheme.title}">
            ${i18n.sys_summary.cpupackage_tabel.network_port}</p>`;
            tipsArr.forEach(element => {
                html += `
        <div style='display:flex;flex-direction:column;flex-wrap:wrap;font-size:14px;
        color:${this.ctx.currentTheme.subTitle};justify-content: space-between'>
            <div style="display:flex;justify-content: space-between;">
                <div style="flex:1;display:flex;">
                    <span style="width:62px;margin-right:10px;overflow: hidden">${element.title1}</span>
                    <span style="width:73px;color:${
                        this.ctx.currentTheme.content};overflow: hidden">${element.data1}</span>
                </div>
                <div style="flex:1;display:flex">
                    <span style="width:62px;margin-right:10px;overflow: hidden">${element.title2}</span>
                    <span style="width:73px;color:${
                        this.ctx.currentTheme.content};overflow: hidden">${element.data2}</span>
                </div>
            </div>
            <div style="display:flex;height:2px;background-color:${
                this.ctx.currentTheme.border};margin:12px auto;width:100%"></div>
            <div style="display:flex;justify-content: space-between;margin-bottom:14px;">
                <div style="flex:1;display:flex">
                    <span style="width:62px;margin-right:10px;overflow: hidden">${element.title3}</span>
                    <span style="width:73px;color:${
                        this.ctx.currentTheme.content};overflow: hidden">${element.data3}</span>
                </div>
                <div style="flex:1;display:flex">
                    <span style="width:62px;margin-right:10px;overflow: hidden">${element.title4}</span>
                    <span style="width:73px;color:${
                        this.ctx.currentTheme.content};overflow: hidden">${element.data4}</span>
                </div>
            </div>
            <div style="display:flex;justify-content: space-between">
                <div style="flex:1;display:flex">
                    <span style="width:62px;margin-right:10px;overflow: hidden">${element.title5}</span>
                    <span style="width:73px;color:${
                        this.ctx.currentTheme.content};overflow: hidden">${element.data5}</span>
                </div>
                <div style="flex:1;display:flex">
                    <span style="width:62px;margin-right:10px;overflow: hidden">${element.title6}</span>
                    <span style="width:73px;color:${
                        this.ctx.currentTheme.content};overflow: hidden">${element.data6}</span>
                </div>
            </div>
        </div>
    `;
            });
        }

        let proportion: number;
        const proportionBottom = 0.5;
        if (i === 1 && j !== 1) {
            proportion = 0.597;
        } else if (i === 2 && j !== 1) {
            proportion = 0.524;
        } else if (i === 3 && j !== 1) {
            proportion = 0.43;
        } else if (i === 4 && j !== 1) {
            proportion = 0.332;
        } else if (i === 1 && j === 1) {
            proportion = 0.45;
        } else if (i === 2 && j === 1) {
            proportion = 0.294;
        } else if (i === 3 && j === 1) {
            proportion = 0.13;
        } else if (i === 4 && j === 1) {
            proportion = 0.1;
        }
        const warpperSelection = $(this.ctx.el.nativeElement); // TODO
        const boxTop = warpperSelection.offset().top + 5;
        const boxLeft = warpperSelection.offset().left;
        const positionData = selection.get(0).getBoundingClientRect();
        const top = positionData.top - boxTop;
        const width = positionData.width * proportion;
        const widthBottom = positionData.width * proportionBottom;
        this.ctx.niceTooltipInfo = {
            top: {
                pointX: positionData.left + width - boxLeft,
                pointY: top
            },
            bottom: {
                pointX: positionData.left + widthBottom - boxLeft,
                pointY: positionData.top - boxTop + positionData.height + 5
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
