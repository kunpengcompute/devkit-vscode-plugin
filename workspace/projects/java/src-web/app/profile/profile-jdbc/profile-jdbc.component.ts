import { Component, OnDestroy, OnInit } from '@angular/core';
import { MessageService } from '../../service/message.service';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-profile-jdbc',
  templateUrl: './profile-jdbc.component.html',
  styleUrls: ['./profile-jdbc.component.scss']
})
export class ProfileJDBCComponent implements OnInit, OnDestroy {

  constructor(private msgService: MessageService) { }

  public showSourceCode = false;
  public deleteOneTab: Subscription;
  ngOnInit() {
    this.showSourceCode = JSON.parse(sessionStorage.getItem('showSourceCode'));
    this.deleteOneTab = this.msgService.getMessage().subscribe(msg => {
      if (msg.type === 'setDeleteOne') {
        this.showSourceCode = JSON.parse(sessionStorage.getItem('showSourceCode'));
        if (!this.showSourceCode) {
          this.msgService.sendMessage({
            type: 'getDeleteOne',
            isNoData: 'true',
          });
        }
      }
    });
  }

  public showJdbcCheck(state: any) {
    if (this.deleteOneTab) { this.deleteOneTab.unsubscribe(); }
    this.showSourceCode = state;
    sessionStorage.setItem('showSourceCode', JSON.stringify(this.showSourceCode));
    if (state) {
      this.msgService.sendMessage({
        type: 'showDatabaseTab',
        data: true
      });
    }
  }
  ngOnDestroy(): void {
    if (this.deleteOneTab) { this.deleteOneTab.unsubscribe(); }
  }

}
