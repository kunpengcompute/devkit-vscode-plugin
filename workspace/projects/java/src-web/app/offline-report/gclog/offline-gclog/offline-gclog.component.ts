import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-offline-gclog',
  templateUrl: './offline-gclog.component.html',
  styleUrls: ['./offline-gclog.component.scss']
})
export class OfflineGclogComponent implements OnInit {

  constructor() { }

  public offlineGcLogId: string;
  ngOnInit(): void {
    this.offlineGcLogId = sessionStorage.getItem('GCLogId');
  }
}
