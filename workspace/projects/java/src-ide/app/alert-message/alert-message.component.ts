import { Component, OnInit, Output, EventEmitter, Input, OnChanges } from '@angular/core';
import { I18nService } from '../service/i18n.service';
import { UserGuideService } from '../service/user-guide.service';

@Component({
    selector: 'app-alert-message',
    templateUrl: './alert-message.component.html',
    styleUrls: ['./alert-message.component.scss'],
})
export class AlertMessageComponent implements OnInit, OnChanges {
    i18n: any;
    @Output() confirmHandle = new EventEmitter();
    @Input() toChildPassword: string;
    // 是否防呆
    @Input() isFoolproof = false;
    constructor(
        public i18nService: I18nService,
        public userGuide: UserGuideService
    ) {
        this.i18n = this.i18nService.I18n();
    }
    public showAlert = false;
    public type = 'success';
    public srcType = '';
    public width = '500px';
    public title = '';
    public content = '';
    public ValidResult = true;
    public isDisabled = false;

    /**
     * 初始化
     */
    ngOnInit() { }

    /**
     * 组件变化
     */
    ngOnChanges() {
        if (this.toChildPassword !== undefined) {
            this.isDisabled =
                this.toChildPassword === '' || this.toChildPassword.length > 255
                    ? true
                    : false;
        }

    }

    /**
     * 告警展示
     */
    alert_show() {
        this.showAlert = true;

        // user-guide
        if ((self as any).webviewSession.getItem('flogin') ===
         '1' && (self as any).webviewSession.getItem('step') === '2') {
            this.userGuide.hideMask();
            setTimeout(() => {
                $('.progress-modal').css({
                    left: '30%',
                    top: '36%',
                    transform: 'none'
                });
                (self as any).webviewSession.setItem('step', '3');
                this.userGuide.showMask('user-guide-add-guardian');
            }, 300);
        }
    }

    /**
     * 告警关闭
     */
    alert_close() {
        this.confirmHandle.emit(false); // 取消时直接关闭
        this.showAlert = false;
    }

    /**
     * 告警确认
     */
    alert_ok() {
        // user-guide
        if ((self as any).webviewSession.getItem('flogin') === '1') {
            (self as any).webviewSession.setItem('step', '4');
        }
        this.confirmHandle.emit(true); // 确定时处理后续逻辑
        this.showAlert = !this.ValidResult;
    }
}
