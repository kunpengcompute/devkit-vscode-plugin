import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-offline-memorydump',
  templateUrl: './offline-memorydump.component.html',
  styleUrls: ['./offline-memorydump.component.scss']
})
export class OfflineMemorydumpComponent implements OnInit {

  constructor() { }
  public currentSnapShotData: any;
  public heapdumpId: string;
  ngOnInit(): void {
    this.heapdumpId = sessionStorage.getItem('heapdumpId');
  }

}
