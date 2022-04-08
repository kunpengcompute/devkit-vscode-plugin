import { TiTableRowData } from '@cloud/tiny3';
export type TableData = {
    columns: Array<any>,
    displayed: Array<TiTableRowData>,
    srcData: {
        data: Array<TiTableRowData>,
        state: {
            searched: boolean,
            sorted: boolean,
            paginated: boolean
        },
    },
    pageNo?: number,
    total?: number,
    pageSize?: {
        options: [10, 20, 50, 100],
        size: number,
    },
    dataList?: any
};
