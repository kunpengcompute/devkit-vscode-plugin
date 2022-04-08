import { Component, OnInit } from '@angular/core';
import { MessageService } from '../../service/message.service';

@Component({
    selector: 'app-profile-jdbc',
    templateUrl: './profile-jdbc.component.html',
    styleUrls: ['./profile-jdbc.component.scss']
})
export class ProfileJDBCComponent implements OnInit {

    constructor(private msgService: MessageService) { }

    public showSourceCode = false;

    /**
     * 初始化
     */
    ngOnInit() {
        this.showSourceCode = JSON.parse((self as any).webviewSession.getItem('showSourceCode'));
    }

    /**
     * 显示JDBC
     * @param state 状态
     */
    public showJdbcCheck(state: any) {
        this.showSourceCode = state;
        (self as any).webviewSession.setItem('showSourceCode', JSON.stringify(this.showSourceCode));
        if (state) {
            this.msgService.sendMessage({
                type: 'showDatabaseTab',
                data: true
            });
        }
    }

}
