import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SummaryDataService {

  constructor() { }
  public tpswitchColumn: any[];
  public tpswitchOriginData: any[];
  public tpswitchTotal: number;
  public tpCurrentPage: number;
  public tpStatus: any;
  public tpSize: number;
}
