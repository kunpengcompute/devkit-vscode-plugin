import { Injectable } from '@angular/core';
import { Subject, Observable, Subscription } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class SummuryDataService {

  constructor() { }

  public diskTableData: any = [];
  public ioTableData: any = [];
  public ioColumns: any = [];
  public ioOriginData: any;
}
