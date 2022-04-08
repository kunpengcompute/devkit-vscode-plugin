import { Component, OnInit, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-mission-panel',
  templateUrl: './mission-panel.component.html',
  styleUrls: ['./mission-panel.component.scss']
})
export class MissionPanelComponent implements OnInit {
  @Input() active: boolean;
  @Input() title: boolean;
  public isActive = false;
  constructor(public sanitizer: DomSanitizer) {
    this.isActive = this.active;
   }

    /**
     * ngOnInit
     */
    ngOnInit() { }
}
