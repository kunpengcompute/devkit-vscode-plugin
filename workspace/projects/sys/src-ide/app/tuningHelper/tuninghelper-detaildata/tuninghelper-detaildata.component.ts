import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-tuninghelper-detaildata',
  templateUrl: './tuninghelper-detaildata.component.html',
  styleUrls: ['./tuninghelper-detaildata.component.scss']
})
export class TuninghelperDetaildataComponent implements OnInit {
  @Input() taskDetail: any;
  constructor() { }
  public isIde = true;
  ngOnInit(): void { }
}
