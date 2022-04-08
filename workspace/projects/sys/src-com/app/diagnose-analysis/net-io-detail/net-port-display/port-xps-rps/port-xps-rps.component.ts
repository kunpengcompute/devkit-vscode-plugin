import { Component, Input, OnInit } from '@angular/core';
import { HartInterSingleCPUTableData, HartInterSingleTableData, INetLoadRawData } from '../../domain';

type SoftwareInterTableData =  INetLoadRawData['softirq_info'];

@Component({
  selector: 'app-port-xps-rps',
  templateUrl: './port-xps-rps.component.html',
  styleUrls: ['./port-xps-rps.component.scss']
})
export class PortXPSRPSComponent implements OnInit {

  @Input() bindName: string;
  @Input() singleIrqData: HartInterSingleTableData[];
  @Input() allIrqData: HartInterSingleTableData;
  @Input() singleIrqCPUData: HartInterSingleCPUTableData[];
  @Input() allIrqCPUData: HartInterSingleCPUTableData;
  @Input() softwareInterData: SoftwareInterTableData;
  @Input() ksoftirqdList: number[];
  @Input() ipiInfo: INetLoadRawData['rps_ipi_info'];

  constructor() { }

  ngOnInit(): void {
  }

}
