import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-offline-threaddump',
  templateUrl: './offline-threaddump.component.html',
  styleUrls: ['./offline-threaddump.component.scss']
})
export class OfflineThreaddumpComponent implements OnInit {

  constructor() { }

  public threaddumpId: string;
  ngOnInit(): void {
    this.threaddumpId = sessionStorage.getItem('threaddumpId');
  }

}
