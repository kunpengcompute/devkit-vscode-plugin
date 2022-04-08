import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'page' })
export class PagePipe implements PipeTransform {

  transform(value: Array<any>, config: { pageSize: number, pageNumber: number }) {
    if (!value) {
      return [];
    }
    if (!config) {
      return value;
    }
    const { pageSize, pageNumber } = config;
    if (pageSize <= 0) {
      return value;
    }
    if (pageNumber < 1) {
      return value;
    }
    const maxPageNumber = Math.ceil(value.length / pageSize);
    if (pageNumber > maxPageNumber) {
      return value;
    }
    const start = pageSize * (pageNumber - 1);
    return value.slice(start, start + pageSize);
  }

}
