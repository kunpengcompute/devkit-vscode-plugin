import { Injectable } from '@angular/core';
import { SysPerfUrl } from 'sys/src-com/app/url/sysperf';
import { MemPerfUrl } from 'sys/src-com/app/url/memperf';
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
