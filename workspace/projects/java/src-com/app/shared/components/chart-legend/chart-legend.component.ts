import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-chart-legend',
  templateUrl: './chart-legend.component.html',
  styleUrls: ['./chart-legend.component.scss']
})
export class ChartLegendComponent implements OnInit {
  @Input()
  get data() { return this.legendList; }
  set data(data){
    this.legendList = data;
  }
  constructor() { }
  public legendList: any;

  ngOnInit(): void {
  }

}
