import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'app-color-checkbox',
    templateUrl: './color-checkbox.component.html',
    styleUrls: ['./color-checkbox.component.scss']
})
export class ColorCheckboxComponent implements OnInit {

    // 控制 色块复选框 渲染的参数列表
    public optionCheckList: Array<{ name: string, color: string, isChecked: boolean }> = [];
    // 输入 色块复选框 参数列表
    @Input()
    set option(val: Array<{ name: string, color: string, isChecked: boolean }>) {
        if (val == null) { return; }
        this.optionCheckList = val;
    }
    // 派发
    @Output() clickColor = new EventEmitter<{ name: string, color: string }[]>();
    constructor() { }

    /**
     * 初始化
     */
    ngOnInit() {
    }
    /**
     * 点击色块和文字时的处理函数
     * @param index 被点击的索引
     */
    public onClick(index) {
        const option = this.optionCheckList[index];
        option.isChecked = !option.isChecked;
        this.clickColor.emit(this.optionCheckList);
    }
}
