import { Component, Input, OnInit } from '@angular/core';
import { ConsumeIOTableData } from '../../domain';

@Component({
  selector: 'app-port-consume-io',
  templateUrl: './port-consume-io.component.html',
  styleUrls: ['./port-consume-io.component.scss']
})
export class PortConsumeIOComponent implements OnInit {

  @Input() consumeIOData: ConsumeIOTableData | {};
  @Input() pidInfo: any;

  constructor() { }

  ngOnInit(): void {
  }

}
