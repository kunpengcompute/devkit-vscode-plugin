import { Component, Input, OnInit } from '@angular/core';
import { NetPortTableData, NetworkBindRowInfo } from '../../domain';

@Component({
  selector: 'app-port-network-config',
  templateUrl: './port-network-config.component.html',
  styleUrls: ['./port-network-config.component.scss']
})
export class PortNetworkConfigComponent implements OnInit {

  @Input() portInfoData: NetPortTableData[] | [];
  @Input() routeData: string[][];
  @Input() arpData: string[][];
  @Input() bondInfoData: NetworkBindRowInfo[] | [];

  constructor() {
  }

  ngOnInit(): void {
  }

}
