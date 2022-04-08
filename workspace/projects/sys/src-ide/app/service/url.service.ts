import { Injectable } from '@angular/core';
import { SysPerfUrl } from 'projects/sys/src-ide/url/sysperf';
import { MemPerfUrl } from 'projects/sys/src-ide/url/memperf';
import { ToolType } from 'projects/domain';

@Injectable({
  providedIn: 'root',
})
export class UrlService {

  Url(): { [key: string]: string } {
    const toolType = sessionStorage.getItem('toolType');
    return toolType === ToolType.DIAGNOSE ? MemPerfUrl : SysPerfUrl;
  }
}
