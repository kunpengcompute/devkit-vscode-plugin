import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-mission-panel',
  templateUrl: './mission-panel.component.html',
  styleUrls: ['./mission-panel.component.scss']
})
export class MissionPanelComponent implements OnInit {
  @Input() active: boolean;
  @Input() title: boolean;
  public isActive = false;
  constructor() {
    this.isActive = this.active;
   }

  ngOnInit() {
  }

}
