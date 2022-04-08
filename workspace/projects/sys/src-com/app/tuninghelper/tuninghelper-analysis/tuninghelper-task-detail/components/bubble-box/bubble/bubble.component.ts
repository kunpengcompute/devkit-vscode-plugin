import { Component, Input, OnInit, TemplateRef } from '@angular/core';
import { CpuTargetStatus } from '../../../domain';

@Component({
  selector: 'app-bubble',
  templateUrl: './bubble.component.html',
  styleUrls: ['./bubble.component.scss']
})
export class BubbleComponent implements OnInit {

  @Input() active: boolean;
  @Input() status: CpuTargetStatus;
  @Input() opacity: number;
  @Input() infoTipContent: TemplateRef<any>;
  @Input() shape: 'circle' | 'rect' | 'triangle';
  @Input() info: any;

  constructor() { }

  ngOnInit(): void {
  }

}
